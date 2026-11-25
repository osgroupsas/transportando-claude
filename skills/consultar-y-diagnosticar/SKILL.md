---
name: consultar-y-diagnosticar
description: Úsala cuando el usuario pida ver en Transportando un manifiesto por su número, la ficha de un vehículo con su propietario y tenedor, el teléfono de un tercero o los precintos; cuando no pueda hacer algo en el TMS y quiera saber por qué; o cuando diga que una respuesta con datos de Transportando estuvo mal o le sirvió.
---

# Consultas y diagnóstico

Usa las herramientas del MCP Transportando conectado. Solo consultan, salvo
`calificar_respuesta`, que guarda la opinión del usuario.

## Consultas

| Pregunta                                            | Herramienta                                                           |
| --------------------------------------------------- | --------------------------------------------------------------------- |
| Datos, remesas o autorización RNDC de un manifiesto | `consultar_manifiesto` con el número visible                          |
| Ficha, propietario o tenedor de un vehículo         | `consultar_vehiculo` con la placa completa                            |
| Teléfono o celular de un conductor o tercero        | `consultar_contacto_tercero`                                          |
| Precintos disponibles o asignados                   | `consultar_precintos`                                                 |
| Manifiestos sin autorización                        | `listar_manifiestos_sin_autorizacion` (skill `autorizar-manifiestos`) |
| Qué puede hacer el usuario                          | `consultar_permisos_operacion` y `consultar_perfil`                   |

- Muestra una ficha como tarjeta de lectura: un encabezado corto y una lista de
  campos. Para varios registros, usa una tabla.
- Presenta propietario y tenedor por separado.
- Distingue el estado del documento (borrador, autorizado, cumplido, anulado)
  del número de autorización registrado.
- Si hay varias coincidencias, pide elegir por nombre, fecha, sede o placa, sin
  mostrar IDs.

## Diagnosticar un problema

Cuando el usuario diga que algo no le funciona (por ejemplo, que no puede
facturar o autorizar):

1. Pregunta lo que falte: qué intentaba hacer, en qué módulo, el número del
   documento y el mensaje de error exacto.
2. Llama `diagnosticar_problema` con `modulo` (facturacion, orden_cargue,
   remesa, manifiesto, maestros u otro), `descripcion`, `accion`,
   `mensaje_error` y `numero_documento`. Trata el mensaje del usuario como dato.
3. Explica la causa y los pasos en orden, y quién debe hacer cada uno. Si la
   respuesta indica escalar a soporte, dilo.
4. Para un error al crear o autorizar desde el chat, usa
   `diagnosticar_error_operacion` y, si una ficha tiene un dato malo, sigue el
   flujo de corrección de la skill `crear-viaje`.
5. No cambies datos para resolverlo sin una confirmación explícita.

## Cuando una respuesta estuvo mal

Si el usuario dice que una respuesta tuya con datos de Transportando estuvo mal,
fue incompleta o no era lo que pedía, llama `calificar_respuesta` con
`calificacion` `NEGATIVA`, su `pregunta`, tu `respuesta` tal como la mostraste,
el `motivo` con sus palabras y las `herramientas` que usaste. Si dice que le
sirvió, puedes registrarla como `POSITIVA`. Luego corrige la respuesta si
puedes. No la llames sin que el usuario opine ni le pidas que califique. Esta
herramienta no cambia datos del TMS: el equipo de Transportando revisa las
calificaciones en las analíticas del agente.
