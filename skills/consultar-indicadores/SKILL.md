---
name: consultar-indicadores
description: Úsala cuando el usuario pregunte en Transportando cuánto ha facturado o movido un carro, conductor o cliente; cuántos viajes hizo y su valor; lo pendiente por facturar; la facturación de un período por cliente, agencia, placa o comercial; el estado de cuenta, la cartera o las facturas más vencidas; los vehículos en monitoreo o disponibles para enturnar; o cuántos empleados hay. Solo consulta.
---

# Viajes, facturación, cartera, flota y empleados

Usa las herramientas del MCP Transportando conectado. Solo consultan: no crean ni
cambian nada.

## Elegir la herramienta

- Viajes, lo facturado o movido por un carro, conductor o cliente, y lo
  pendiente por facturar: `consultar_indicadores_viajes`.
- Estado de cuenta, saldo, cartera y facturas vencidas: `consultar_estado_cuenta`.
- Facturación de un período, por cliente, agencia, placa o comercial:
  `consultar_facturacion`.
- Vehículos en monitoreo: `consultar_vehiculos_monitoreo`. Disponibles para
  enturnar: `consultar_vehiculos_disponibles`. Empleados: `consultar_empleados`.

Para los parámetros exactos de cada pregunta (agrupar, top N, vencidas,
comparar períodos, flota propia), lee
[references/elegir-herramienta.md](references/elegir-herramienta.md).

## Pasos

1. Toma la placa completa, el nombre o la cédula del conductor y el nombre o NIT
   del cliente tal como los diga el usuario. Nunca pidas IDs.
2. Traduce el período: hoy, esta semana, este mes, el mes pasado, los últimos 30
   días, los últimos 12 meses, este año o el año pasado van en `periodo`. Para
   fechas concretas usa `desde` y `hasta` (AAAA-MM-DD, máximo 366 días). Sin
   período, la consulta usa el mes actual: dilo al responder. Para lo pendiente
   por facturar sin período, usa `ultimos_12_meses` y dilo.
   La agencia es la sede. Si la pregunta no deja claro el período, el cliente o
   si se pide lo facturado o lo pendiente por facturar, pregunta antes de
   consultar, con dos o tres opciones.
3. Para ver una lista de viajes con su manifiesto, agrega `incluir_viajes: true`
   (los 20 más recientes). Para ver las facturas del período, agrega
   `incluir_facturas: true` en `consultar_facturacion`.
4. Si la respuesta trae `requiere_aclaracion`, muestra las coincidencias con
   nombre y documento y pide elegir. Consulta de nuevo con el documento elegido.
   Si trae `mensaje`, explícalo con tus palabras.
5. Si trae `sin_datos`, dilo así. No respondas con otra cifra ni con otra
   consulta parecida. Si ninguna herramienta responde lo que se pide, dilo y no
   lo estimes.

## Cómo responder

- Empieza por los totales. Usa una tabla para los grupos, los viajes o las
  facturas, con pocas columnas.
- Lo movido es el flete pagado al vehículo más la cantidad transportada. La
  cantidad viene por unidad de medida: no sumes kilogramos, galones y unidades.
- Lo facturado de los viajes son las facturas CxC contabilizadas de sus remesas
  o de su orden de cargue. El valor de los viajes es lo pactado o lo cumplido, y
  puede ser distinto de lo facturado.
- En la facturación, el total es la base más el IVA, antes de retenciones. El
  saldo pendiente es lo que falta por cobrar.
- En el estado de cuenta, muestra el saldo total, lo vencido y las edades (por
  vencer, 1 a 30, 31 a 60, 61 a 90 y más de 90 días). Lista primero las facturas
  más vencidas. Sin cliente, es la cartera de toda la empresa; la factura más
  vencida trae su cliente.
- En la facturación por placa, cada línea cuenta para el vehículo de su viaje.
  Los documentos sin viaje salen como "Sin vehículo". Ahí no hay saldo por
  vehículo, porque el saldo es de la factura.
- Lo pendiente por facturar es el valor de las remesas sin factura CxC
  contabilizada. Un viaje finalizado es un manifiesto cumplido.
- En monitoreo, los vehículos son placas con seguimiento activo: en el módulo de
  Monitoreo o en un manifiesto enviado a Monitor o Satrack. Un manifiesto
  cumplido o anulado ya no cuenta. Muestra los totales por fuente y por estado y,
  si trae `aviso_antiguedad`, menciónalo.
- Si se pide un top N, usa `limite` y muestra el `puesto`. Si la lista trae
  `aviso`, di cuántos hay en total.
- En enturnamiento, respeta el orden de `turno`: primero los vehículos libres y
  los que llevan más tiempo disponibles.
- Los empleados son los terceros marcados como empleados en el maestro. Si no
  hay ninguno, explica que se marcan en la ficha del tercero.
- Pon los enlaces devueltos sobre la placa, el nombre o el número del documento.
  No los pegues como texto suelto.
- Los valores ya vienen en pesos con símbolo y separador de miles. Muéstralos
  así.
- Si la respuesta trae un aviso, como que se muestran solo 100 grupos o que se
  limitó a tus sedes, dilo.
