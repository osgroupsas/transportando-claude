---
name: anular-viaje
description: Úsala cuando el usuario pida anular en Transportando una orden de cargue, un manifiesto, una cuenta por pagar, un documento soporte, una nota crédito o un anticipo; liberar los precintos de un manifiesto anulado; o inactivar o reactivar un conductor, proveedor, cliente o vehículo. Explica qué más se anula (remesas, orden, documentos financieros y el RNDC si estaba autorizado) y siempre pide confirmación.
---

# Anular un viaje o inactivar una ficha

Usa las herramientas del MCP Transportando conectado.

## Anular una orden de cargue o un manifiesto

1. Identifica el documento por su número visible (por ejemplo OC-192 o
   MAN-139). Si el usuario no lo dice, pregunta si es la orden o el manifiesto.
   Para anular todo el viaje, anula el manifiesto: también anula sus remesas, su
   orden y, antes, sus cuentas por pagar, documentos soporte y notas crédito.
2. Pide el motivo con las palabras del usuario. Para un manifiesto elige el
   motivo RNDC: error de digitación (por defecto), cambios en las remesas o
   cancelación del servicio.
3. Llama `preparar_anular_viaje`. Si devuelve varias coincidencias, muestra
   fecha, sede y placa, y pide elegir sin mostrar IDs. Si el documento no se
   puede anular, explica el motivo devuelto (por ejemplo un cumplido o una
   factura de venta vigente) y qué hacer en el TMS.
4. Si el manifiesto tiene anticipos, la preparación devuelve una pregunta con
   sus números y valores: pregunta al usuario si los anula o los deja como están
   para trasladarlos a otro manifiesto, y prepara de nuevo con `anticipos:
"anular"` o `"mantener"`. No lo supongas.
5. Si los efectos mencionan guías asignadas, pregunta si se liberan para usarlas
   en otra orden y vuelve a preparar con `liberar_guias` cuando el usuario diga
   que sí. Si el manifiesto tiene precintos, la preparación devuelve una
   pregunta: pregunta si se liberan para otro viaje o se dejan asignados y
   prepara de nuevo con `liberar_precintos` `true` o `false`. Puedes juntar esta
   pregunta con la de los anticipos.
6. Muestra el documento, el motivo y la lista de efectos, recuerda que no se
   puede deshacer y espera una confirmación explícita.
7. Llama `anular_viaje` una sola vez con la versión y la huella de la
   preparación. Informa el resultado, el número de anulación RNDC si lo hay, los
   documentos financieros y anticipos anulados y las guías liberadas. Si el
   resultado trae documentos anulados pero el manifiesto no, dilo claramente.
8. Si la respuesta es incierta o la llamada se interrumpe, usa
   `consultar_anulacion`; no vuelvas a llamar `anular_viaje`.

## Anular un documento financiero

1. Para anular solo una cuenta por pagar, un documento soporte, una nota
   crédito o un anticipo, llama `preparar_anular_viaje` con `tipo_documento`
   `cuenta_por_pagar`, `documento_soporte`, `nota_credito` o `anticipo`, su
   número visible (por ejemplo DS-42 o NCP-160) y las observaciones del usuario.
2. Si hay varias coincidencias, muestra fecha, sede, tercero y valor, y pide
   elegir sin mostrar IDs.
3. Muestra el documento, el tercero, el valor y los efectos, espera la
   confirmación explícita y llama `anular_viaje` una sola vez. Ante una
   respuesta incierta, usa `consultar_anulacion`.

## Consultar y liberar precintos

1. Para ver precintos disponibles, asignados o dados de baja, usa
   `consultar_precintos` con el número, el estado, el manifiesto, la sede o el
   tipo. Muestra una tabla con precinto, tipo, sede, estado y viaje.
2. Para liberar los precintos que quedaron en un manifiesto anulado, usa
   `preparar_liberar_precintos` con su número visible. Si hay varias
   coincidencias, pide elegir por fecha, sede o placa sin mostrar IDs.
3. Muestra los precintos y los efectos, espera la confirmación explícita y
   llama `liberar_precintos` una sola vez. Ante una respuesta incierta, usa
   `consultar_liberacion_precintos`.
4. Para un manifiesto vigente, los precintos se liberan al anularlo.

## Inactivar o reactivar una ficha

1. Usa `preparar_cambiar_estado_maestro` con el tipo (conductor, proveedor,
   cliente o vehículo), el número de documento o la placa y `activo: false`
   para inactivar o `true` para reactivar.
2. Muestra el estado antes y después y los efectos, espera la confirmación y
   guarda con `guardar_maestro`.
