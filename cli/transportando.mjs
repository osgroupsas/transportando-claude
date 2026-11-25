#!/usr/bin/env node
// Cliente MCP independiente, con PKCE y credenciales locales fuera del repositorio.
import { createHash, randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import { readFileSync, openSync, closeSync, unlinkSync } from 'node:fs';
import { mkdir, readFile, writeFile, rename, open, unlink, realpath, link } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

export const EMISOR_MCP_PREDETERMINADO = 'https://api.transportando.com.co';
export const CLIENTE_MCP_PREDETERMINADO = 'transportando-cli';
export const ALCANCES_MCP_PREDETERMINADOS = Object.freeze(['mcp:lectura', 'mcp:escritura']);
const issuer = (process.env.TRANSPORTANDO_MCP_ISSUER ?? EMISOR_MCP_PREDETERMINADO).replace(/\/$/, '');
const clientId = process.env.TRANSPORTANDO_MCP_CLIENT_ID ?? CLIENTE_MCP_PREDETERMINADO;
const port = Number(process.env.TRANSPORTANDO_MCP_CALLBACK_PORT ?? 8765);
const comando = process.argv[2];
const secreto = () => randomBytes(32).toString('base64url');
const hash = v => createHash('sha256').update(v).digest('base64url');
const ESPERA_BLOQUEO_MS = 60000;
const INTERVALO_BLOQUEO_MS = 100;

export async function conBloqueoCredenciales(ruta, ejecutar) {
  await mkdir(dirname(ruta), { recursive: true, mode: 0o700 });
  const rutaBloqueo = `${ruta}.lock`;
  const limite = Date.now() + ESPERA_BLOQUEO_MS;
  let bloqueo;
  while (!bloqueo) {
    try {
      bloqueo = await publicarBloqueo(rutaBloqueo);
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      if (recuperarBloqueoAbandonado(rutaBloqueo)) continue;
      if (Date.now() >= limite)
        throw new Error(
          `Otra instancia mantiene el bloqueo de credenciales. Si ya terminó, elimina el bloqueo abandonado: ${rutaBloqueo}`
        );
      await new Promise(resolver => setTimeout(resolver, INTERVALO_BLOQUEO_MS));
    }
  }
  try {
    return await ejecutar();
  } finally {
    await bloqueo.close();
    await unlink(rutaBloqueo);
  }
}

async function publicarBloqueo(ruta) {
  // Publicar el archivo completo evita bloqueos sin PID al interrumpir el proceso.
  const temporal = `${ruta}.${secreto()}.tmp`;
  const descriptor = await open(temporal, 'wx', 0o600);
  try {
    await descriptor.writeFile(JSON.stringify({ pid: process.pid, token: secreto() }));
    await link(temporal, ruta);
    return descriptor;
  } catch (error) {
    await descriptor.close();
    throw error;
  } finally {
    await unlink(temporal);
  }
}

function recuperarBloqueoAbandonado(ruta) {
  let contenido;
  try {
    contenido = readFileSync(ruta, 'utf8');
    const propietario = JSON.parse(contenido);
    if (!Number.isSafeInteger(propietario.pid) || propietario.pid <= 0) return false;
    try {
      process.kill(propietario.pid, 0);
      return false;
    } catch (error) {
      // EPERM no demuestra que el proceso haya terminado.
      if (error.code !== 'ESRCH') return false;
    }
  } catch (error) {
    if (error.code === 'ENOENT') return true;
    return false;
  }

  // Un único recuperador por identidad evita borrar el bloqueo de un nuevo dueño.
  const reclamacion = `${ruta}.recuperando-${hash(contenido)}`;
  let descriptor;
  try {
    descriptor = openSync(reclamacion, 'wx', 0o600);
    if (readFileSync(ruta, 'utf8') !== contenido) return false;
    unlinkSync(ruta);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return true;
    if (error.code === 'EEXIST') return false;
    throw error;
  } finally {
    if (descriptor !== undefined) {
      closeSync(descriptor);
      unlinkSync(reclamacion);
    }
  }
}

let carpeta;
let archivo;

async function guardar(datos) {
  await mkdir(carpeta, { recursive: true, mode: 0o700 });
  const temporal = `${archivo}.${secreto()}.tmp`;
  await writeFile(temporal, JSON.stringify(datos), { mode: 0o600, flag: 'wx' });
  await rename(temporal, archivo);
}
async function intercambiar(datos) {
  const r = await fetch(`${issuer}/mcp-oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...datos, client_id: clientId, resource: `${issuer}/mcp` }),
    signal: AbortSignal.timeout(30000),
    redirect: 'error',
  });
  if (!r.ok) throw new Error('La conexión venció o fue revocada. Ejecuta login de nuevo.');
  const tokens = await r.json();
  if (typeof tokens.access_token !== 'string' || typeof tokens.refresh_token !== 'string')
    throw new Error('Respuesta OAuth incompleta.');
  const guardados = { ...tokens, expira: Date.now() + Number(tokens.expires_in) * 1000 };
  await guardar(guardados);
  return guardados;
}
async function acceso() {
  return conBloqueoCredenciales(archivo, async () => {
    let datos;
    try {
      datos = JSON.parse(await readFile(archivo, 'utf8'));
    } catch {
      throw new Error('No hay conexión guardada. Ejecuta login primero.');
    }
    if (!datos.expira || datos.expira < Date.now() + 30000)
      datos = await intercambiar({ grant_type: 'refresh_token', refresh_token: datos.refresh_token });
    return datos.access_token;
  });
}
async function login() {
  const verifier = secreto();
  const state = secreto();
  const redirectUri = `http://127.0.0.1:${port}/callback`;
  const destino = new URL(`${issuer}/mcp-oauth/authorize`);
  destino.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    code_challenge: hash(verifier),
    code_challenge_method: 'S256',
    scope: process.env.TRANSPORTANDO_MCP_SCOPES ?? ALCANCES_MCP_PREDETERMINADOS.join(' '),
    resource: `${issuer}/mcp`,
    state,
  }).toString();
  let servidor;
  let temporizador;
  try {
    const codigo = await new Promise((resolve, reject) => {
      let consumido = false;
      servidor = createServer((req, res) => {
        const url = new URL(req.url, redirectUri);
        if (
          url.pathname !== '/callback' ||
          url.searchParams.get('state') !== state ||
          url.searchParams.get('iss') !== issuer
        ) {
          res.writeHead(400);
          res.end('Callback no valido.');
          return;
        }
        if (consumido) {
          res.writeHead(409);
          res.end('Callback consumido.');
          return;
        }
        consumido = true;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('Puedes volver a la terminal de Transportando.');
        const valor = url.searchParams.get('code');
        if (!valor || url.searchParams.has('error')) reject(new Error('No se autorizó la conexión.'));
        else resolve(valor);
      });
      servidor.once('error', () => reject(new Error('El puerto de callback no está disponible.')));
      servidor.listen(port, '127.0.0.1', () =>
        process.stderr.write(`Abre esta dirección para iniciar sesión y consentir:\n${destino}\n`)
      );
      temporizador = setTimeout(() => reject(new Error('El inicio de sesión venció.')), 300000);
    });
    await conBloqueoCredenciales(archivo, () =>
      intercambiar({
        grant_type: 'authorization_code',
        code: codigo,
        code_verifier: verifier,
        redirect_uri: redirectUri,
      })
    );
    process.stdout.write('Conexión guardada. No se imprimen las credenciales.\n');
  } finally {
    clearTimeout(temporizador);
    if (servidor) await new Promise(resolve => servidor.close(resolve));
  }
}
async function rpc(token, method, params = {}, id = 1) {
  const body = { jsonrpc: '2.0', method, params, ...(id === null ? {} : { id }) };
  const r = await fetch(`${issuer}/mcp`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      'MCP-Protocol-Version': '2025-03-26',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120000),
    redirect: 'error',
  });
  if (!r.ok) throw new Error(`MCP rechazó la petición (${r.status}). Revisa conexión y permisos.`);
  if (id === null) return;
  const resultado = await r.json();
  if (resultado.error) throw new Error('MCP rechazó la operación de protocolo.');
  return resultado.result;
}
async function principal() {
  if (!issuer || !clientId) throw new Error('Configura TRANSPORTANDO_MCP_ISSUER y TRANSPORTANDO_MCP_CLIENT_ID.');
  const url = new URL(issuer);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/')
    throw new Error('El emisor debe ser un origen HTTPS.');
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Puerto de callback inválido.');
  carpeta = join(homedir(), '.config', 'transportando-mcp');
  archivo = join(carpeta, `${hash(`${issuer}:${clientId}`)}.json`);
  if (comando === 'login') return login();
  const token = await acceso();
  if (comando === 'exec') {
    const args = process.argv.slice(3);
    if (args[0] === '--') args.shift();
    if (!args.length) throw new Error('Indica el programa a ejecutar.');
    const hijo = spawn(args[0], args.slice(1), {
      stdio: 'inherit',
      env: { ...process.env, TRANSPORTANDO_MCP_TOKEN: token },
    });
    await new Promise((resolve, reject) => {
      hijo.once('error', () => reject(new Error('No se pudo iniciar el programa.')));
      hijo.once('exit', codigo => {
        process.exitCode = codigo ?? 1;
        resolve();
      });
    });
    return;
  }
  await rpc(token, 'initialize', {
    protocolVersion: '2025-03-26',
    capabilities: {},
    clientInfo: { name: 'transportando-cli', version: '0.1.0' },
  });
  await rpc(token, 'notifications/initialized', {}, null);
  let resultado;
  if (comando === 'tools') resultado = await rpc(token, 'tools/list');
  else if (comando === 'call' && process.argv[3])
    resultado = await rpc(token, 'tools/call', {
      name: process.argv[3],
      arguments: JSON.parse(process.argv[4] ?? '{}'),
    });
  else throw new Error('Usa login, tools, call <herramienta> <json> o exec -- <programa>.');
  process.stdout.write(`${JSON.stringify(resultado, null, 2)}\n`);
}
const entrada = process.argv[1] ? await realpath(process.argv[1]).catch(() => undefined) : undefined;
if (entrada === fileURLToPath(import.meta.url))
  principal().catch(error => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
