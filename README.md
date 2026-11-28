# Transportando para Claude

Opera [Transportando](https://transportando.com.co), el software ERP para empresas de transporte de carga en Colombia, desde una conversación con Claude. El plugin conecta Claude con el servidor MCP de Transportando y agrega habilidades que le enseñan a Claude cómo usar cada herramienta paso a paso, siempre pidiendo tu confirmación antes de crear, autorizar, facturar o anular un documento.

## Requisitos

- Una cuenta de usuario en Transportando, en una empresa con el asistente y la integración MCP habilitados.
- Los permisos del rol de tu usuario en Transportando. El plugin nunca concede más permisos de los que ya tienes en el TMS.

## Instalación

En Claude Code:

```
/plugin install transportando --marketplace osgroupsas/transportando-claude
```

La primera vez que uses una herramienta, Claude abre Transportando para que inicies sesión y apruebes el acceso.

## Qué puedes hacer

| Habilidad                   | Para qué sirve                                                                                                                           |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `crear-viaje`               | Preparar y crear una orden de carga, una remesa y un manifiesto, o copiar un viaje anterior con nuevas fechas.                           |
| `crear-orden-cargue`        | Crear una orden de cargue con sus guías, recogidas, entregas y temperatura a partir de un correo o un archivo.                           |
| `crear-ficha-maestra`       | Crear o actualizar conductores, proveedores, clientes y vehículos desde una cédula, licencia, tarjeta de propiedad o SOAT.               |
| `autorizar-manifiestos`     | Consultar los manifiestos pendientes de autorización RNDC y autorizarlos uno a uno o en lote.                                            |
| `cumplir-manifiestos`       | Registrar en lote los cumplidos RNDC de manifiestos autorizados.                                                                         |
| `facturar-manifiestos`      | Crear borradores de factura CxC de uno o varios manifiestos.                                                                             |
| `facturar-solicitudes`      | Revisar la rentabilidad de las solicitudes de facturación, facturarlas y editar la factura.                                              |
| `registrar-facturas`        | Registrar facturas CxC directas o facturas de proveedor CxP con sus soportes.                                                            |
| `completar-enviar-facturas` | Completar facturas CxC o CxP, notas CxC y documentos soporte, enviarlos a la DIAN y reportar las CxC al RNDC, con una sola confirmación. |
| `anular-viaje`              | Anular una orden de cargue o un manifiesto con sus documentos relacionados.                                                              |
| `consultar-y-diagnosticar`  | Consultar manifiestos, vehículos, terceros y precintos, y diagnosticar por qué falló una operación.                                      |
| `consultar-indicadores`     | Responder cuánto facturó o movió un vehículo, la facturación por cliente, agencia o comercial, lo pendiente por facturar y la cartera.   |

Ejemplos de preguntas:

- "¿Qué manifiestos de hoy están pendientes por autorizar?"
- "Crea este conductor con los datos de su cédula y licencia."
- "¿Cuánto facturó la placa ABC123 el mes pasado, por cliente?"

## Cómo se conecta

El plugin declara un solo servidor MCP remoto: `https://mcp.transportando.com.co/mcp`. La primera vez que Claude lo usa, abre la página de Transportando para que inicies sesión y autorices el acceso con OAuth 2.0 (PKCE). Puedes revocar la conexión cuando quieras desde **Conexiones MCP** en el menú de usuario del TMS.

## Qué datos se envían

- Claude envía al servidor de Transportando solo los argumentos de cada herramienta que usa, por ejemplo un número de manifiesto, una placa o los datos extraídos de un documento que tú adjuntaste.
- El servidor responde con los datos de tu empresa a los que tu usuario ya tiene acceso en el TMS.
- El plugin no envía datos a ningún otro servicio, no ejecuta comandos en tu equipo y no incluye ganchos (hooks).

## Privacidad

El tratamiento de los datos se rige por la [política de tratamiento de datos de Transportando](https://www.transportando.com.co/politica-de-tratamiento-de-datos).

## Soporte

Escríbenos desde [transportando.com.co/contacto](https://www.transportando.com.co/contacto).

## Licencia

[Apache 2.0](LICENSE). La licencia cubre solo los archivos de este plugin; el servicio Transportando y la marca no se licencian.
