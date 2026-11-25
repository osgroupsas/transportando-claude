import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import {
  ALCANCES_MCP_PREDETERMINADOS,
  CLIENTE_MCP_PREDETERMINADO,
  EMISOR_MCP_PREDETERMINADO,
  conBloqueoCredenciales,
} from './transportando.mjs';

test('usa la configuración oficial y solicita todos los alcances MCP', () => {
  assert.equal(EMISOR_MCP_PREDETERMINADO, 'https://api.transportando.com.co');
  assert.equal(CLIENTE_MCP_PREDETERMINADO, 'transportando-cli');
  assert.deepEqual(ALCANCES_MCP_PREDETERMINADOS, ['mcp:lectura', 'mcp:escritura']);
});

const ejecutarProceso = ruta =>
  new Promise((resolver, rechazar) => {
    const codigo = `
    import { conBloqueoCredenciales } from ${JSON.stringify(new URL('./transportando.mjs', import.meta.url).href)};
    import { readFile, writeFile } from 'node:fs/promises';
    const ruta = process.argv[1];
    await conBloqueoCredenciales(ruta, async () => {
      const datos = JSON.parse(await readFile(ruta, 'utf8'));
      if (!datos.vigente) {
        await new Promise(resolve => setTimeout(resolve, 150));
        await writeFile(ruta, JSON.stringify({ vigente: true }));
        process.stdout.write('renovado');
      } else process.stdout.write('reutilizado');
    });
  `;
    const hijo = spawn(process.execPath, ['--input-type=module', '-e', codigo, ruta]);
    let salida = '';
    let error = '';
    hijo.stdout.on('data', datos => {
      salida += datos;
    });
    hijo.stderr.on('data', datos => {
      error += datos;
    });
    hijo.once('error', rechazar);
    hijo.once('exit', estado => (estado === 0 ? resolver(salida) : rechazar(new Error(error))));
  });

test('dos procesos releen las credenciales dentro del bloqueo y renuevan una sola vez', async () => {
  const carpeta = await mkdtemp(join(tmpdir(), 'transportando-cli-'));
  const ruta = join(carpeta, 'credenciales.json');
  try {
    await writeFile(ruta, JSON.stringify({ vigente: false }));
    const resultados = await Promise.all([ejecutarProceso(ruta), ejecutarProceso(ruta)]);
    assert.deepEqual(resultados.sort(), ['renovado', 'reutilizado']);
    assert.equal(JSON.parse(await readFile(ruta, 'utf8')).vigente, true);
    await assert.rejects(access(`${ruta}.lock`));
  } finally {
    await rm(carpeta, { recursive: true, force: true });
  }
});

test('libera el bloqueo al fallar para permitir el siguiente intento', async () => {
  const carpeta = await mkdtemp(join(tmpdir(), 'transportando-cli-'));
  const ruta = join(carpeta, 'credenciales.json');
  try {
    await assert.rejects(
      conBloqueoCredenciales(ruta, async () => {
        throw new Error('fallo simulado');
      }),
      /fallo simulado/
    );
    assert.equal(await conBloqueoCredenciales(ruta, async () => 'recuperado'), 'recuperado');
  } finally {
    await rm(carpeta, { recursive: true, force: true });
  }
});

test('recupera un bloqueo abandonado por SIGKILL y serializa dos reintentos', async () => {
  const carpeta = await mkdtemp(join(tmpdir(), 'transportando-cli-'));
  const ruta = join(carpeta, 'credenciales.json');
  const codigo = `
    import { conBloqueoCredenciales } from ${JSON.stringify(new URL('./transportando.mjs', import.meta.url).href)};
    await conBloqueoCredenciales(process.argv[1], async () => {
      process.stdout.write('bloqueado');
      await new Promise(resolve => setTimeout(resolve, 60000));
    });
  `;
  const hijo = spawn(process.execPath, ['--input-type=module', '-e', codigo, ruta]);
  try {
    await writeFile(ruta, JSON.stringify({ vigente: false }));
    await new Promise((resolver, rechazar) => {
      hijo.stdout.once('data', resolver);
      hijo.once('error', rechazar);
    });
    const terminado = new Promise(resolver => hijo.once('exit', resolver));
    hijo.kill('SIGKILL');
    await terminado;
    const resultados = await Promise.all([ejecutarProceso(ruta), ejecutarProceso(ruta)]);
    assert.deepEqual(resultados.sort(), ['renovado', 'reutilizado']);
    await assert.rejects(access(`${ruta}.lock`));
  } finally {
    hijo.kill('SIGKILL');
    await rm(carpeta, { recursive: true, force: true });
  }
});
