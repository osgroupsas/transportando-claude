---
name: completar-enviar-facturas
description: Úsala cuando el usuario pida completar facturas CxC o CxP en borrador, enviar una factura a la DIAN como factura electrónica o reportarla al RNDC en Transportando (por ejemplo FE-1520). Muestra los pasos de cada factura, explica las que no se pueden procesar y pide una sola confirmación.
---

# Completar y enviar facturas

Usa las herramientas del MCP Transportando conectado.

1. Reúne los números visibles de las facturas (por ejemplo FE-1520), hasta 20
   por preparación. Si el usuario no da números, pregúntalos; no los inventes ni
   los busques por valor.
2. Define el tipo y el último paso que pidió el usuario:
   - `tipo`: `CXC` para facturas de venta a clientes, `CXP` para facturas de
     proveedor. Si no es claro, pregúntalo.
   - `hasta`: `COMPLETAR` (solo completar), `DIAN` (completar si hace falta y
     enviar a la DIAN) o `RNDC` (además reportar al RNDC). Una CxP solo admite
     `COMPLETAR`.
   - `incluir_adjuntos`: por defecto se envían a la DIAN los adjuntos de la
     factura, como en el TMS. Usa `false` solo si el usuario pide no enviarlos.
3. Llama `preparar_completar_enviar_facturas`. La herramienta calcula los pasos
   que faltan en cada factura: no vuelve a completar una factura completada ni a
   enviar a la DIAN una que ya tiene correlativo.
4. Muestra en una tabla las facturas listas con fecha, tercero, total en pesos
   (con símbolo y separadores de miles) y pasos, y el total. Debajo, las
   omitidas con su motivo. Explica los efectos que devuelve la preparación; en
   especial, que enviar a la DIAN no se puede deshacer y solo se corrige con una
   nota crédito.
5. Pide una sola confirmación explícita. Después llama
   `completar_enviar_facturas` con el `operacion_id`, la `version` y la
   `huella_documento` de la preparación.
6. Informa por factura los pasos hechos, el correlativo de la DIAN, la
   autorización del RNDC o el motivo del rechazo. Si un paso falló, los
   siguientes de esa factura no se hicieron: cuando el usuario corrija la causa
   (por ejemplo, el cumplido de las remesas en el RNDC), prepara de nuevo y solo
   se harán los pasos que falten.
7. Si una factura queda "Sin confirmar", o la llamada se interrumpe, no la
   repitas: consulta `consultar_completar_enviar_facturas` con el mismo
   `operacion_id` y pide al usuario revisar la factura en el TMS antes de
   reintentar.

Requiere `DOCUMENTO?CXC/ACTUALIZAR` o `DOCUMENTO?CXP/ACTUALIZAR`, una conexión
con escritura y, para la DIAN y el RNDC, el módulo de facturación electrónica.
Muestra números de factura y nombres, nunca IDs ni huellas.
