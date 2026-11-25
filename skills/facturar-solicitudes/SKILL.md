---
name: facturar-solicitudes
description: Úsala cuando el usuario quiera revisar en Transportando las solicitudes de facturación completadas de un cliente o una fecha, con sus valores y la rentabilidad de cada línea; facturarlas; o editar una factura CxC (fecha, comercial, observaciones, retenciones, completarla o reactivarla). Siempre con confirmación.
---

# Facturación de solicitudes

Usa las herramientas del MCP Transportando conectado. Para facturar manifiestos
usa la skill `facturar-manifiestos`; para facturas sin solicitud,
`registrar-facturas`.

## Revisar las solicitudes

1. Para ver qué hay por facturar, llama `consultar_solicitudes_facturacion`. Por
   defecto trae las completadas; filtra por cliente (nombre o NIT), por rango de
   fechas o por número de solicitud. Si el período no es claro, usa el que
   devuelva la herramienta y dilo.
2. Muestra una tabla con número, fecha, cliente, remesas, total a cobrar,
   utilidad, margen y observaciones, y aparte los totales por cliente. Si la
   respuesta dice que el listado es parcial, dilo.
3. Para el detalle, llama `consultar_solicitud_facturacion` con el número
   visible. Muestra la rentabilidad de cada línea (remesa, manifiesto, placa,
   producto, cantidad, valores a cobrar y a pagar, utilidad y margen) y el total
   de la solicitud. Señala las líneas bajo el margen mínimo y si la remesa tiene
   la rentabilidad baja autorizada.

## Facturar

4. Antes de facturar, muestra los datos sugeridos que devuelve la consulta
   (fecha de hoy, comercial del cliente, forma y término de pago, dirección de
   facturación y tipo de documento) y pregunta en una sola pregunta si los
   confirma o qué quiere cambiar, y qué observaciones lleva la factura. No
   inventes un comercial: si el cliente no tiene, búscalo por nombre con
   `buscar_referencias_facturacion` y pide elegir.
5. Llama `preparar_facturar_solicitud` con los datos confirmados. Si responde
   `requiere_datos`, pide solo lo que falta. Muestra la factura estimada con
   totales en pesos con símbolo y separadores de miles.
6. Pide una confirmación explícita y factura con `facturar_solicitud` usando
   `operacion_id` y `version`. La factura queda en borrador con los adjuntos de
   la solicitud.

## Adjuntar y editar la factura

7. Para adjuntar un documento, usa `adjuntar_soporte_cxc` con la factura en
   borrador y el archivo exacto que el usuario compartió (máximo 2 MiB en total,
   límite DIAN). Nunca adjuntes un archivo que el usuario no indicó.
8. Para cambiar la fecha, el comercial o las observaciones, regenerar las
   retenciones, completar o reactivar, llama `preparar_actualizar_factura_cxc`
   con el número de factura y solo los cambios pedidos. Muestra el antes y
   después de cada paso y confirma con `actualizar_factura_cxc`. Una factura
   completada se reactiva primero para editarla; una ya enviada a la DIAN no se
   puede reactivar. Completar no envía a la DIAN: eso sigue en el TMS.
9. Si una llamada se interrumpe, usa `consultar_resultado_facturacion` y no
   reenvíes. Si un paso de la edición falla, no se aplica ningún cambio: informa
   el motivo.
