# Elegir la herramienta y sus parámetros

Tabla de preguntas frecuentes y la herramienta con los parámetros que la responden.

| Pregunta del usuario                                           | Herramienta                                                                                  |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| ¿Cuánto ha facturado este carro? ¿Por cliente?                 | `consultar_indicadores_viajes` con `placa` y, si pide el desglose, `agrupar_por: "cliente"`  |
| ¿Cuánto ha movido este carro por conductor o por cliente?      | `consultar_indicadores_viajes` con `placa` y `agrupar_por: "conductor"` o `"cliente"`        |
| ¿Cuántos viajes hizo el carro, el conductor o el cliente?      | `consultar_indicadores_viajes` con `placa`, `conductor` o `cliente`                          |
| ¿Cuántos viajes le hemos hecho a un cliente y cuánto valen?    | `consultar_indicadores_viajes` con `cliente`                                                 |
| Estado de cuenta o saldo de un cliente                         | `consultar_estado_cuenta` con `cliente`                                                      |
| Buscar la factura más vencida; cartera de la empresa           | `consultar_estado_cuenta` sin `cliente`: devuelve `factura_mas_vencida`                      |
| Las 10 facturas más vencidas                                   | `consultar_estado_cuenta` con `limite: 10`                                                   |
| Facturas vencidas hace más de 90 días; las de mayor saldo      | `dias_minimos_vencida: 90`; `ordenar_por: "saldo"`; `solo_vencidas: true` sin las por vencer |
| Cartera o facturas vencidas de una agencia                     | `consultar_estado_cuenta` con `sede`                                                         |
| ¿Cuánto le facturamos a un cliente el mes pasado?              | `consultar_facturacion` con `cliente` y `periodo: "mes_pasado"`                              |
| Facturación de la empresa en un período                        | `consultar_facturacion` sin `cliente`                                                        |
| ¿Cómo fue la facturación por agencia el mes pasado?            | `consultar_facturacion` con `agrupar_por: "sede"` y `periodo: "mes_pasado"`                  |
| Facturación por placa de la flota propia el mes pasado         | `consultar_facturacion` con `agrupar_por: "vehiculo"` y `solo_flota_propia: true`            |
| ¿Cuál es el comercial con mayor facturación?                   | `consultar_facturacion` con `agrupar_por: "comercial"`: el primero es el mayor               |
| Los 5 clientes, placas o comerciales con más facturación       | `consultar_facturacion` con `agrupar_por` y `limite: 5`                                      |
| ¿Qué cliente, placa o agencia facturó menos?                   | `consultar_facturacion` con `agrupar_por` y `orden: "menor"`                                 |
| ¿Facturamos más que el mes pasado?                             | Dos consultas de `consultar_facturacion`, una por período; compara solo esas cifras          |
| ¿Cuánto hay pendiente de facturar de los viajes finalizados?   | `consultar_indicadores_viajes` con `solo_finalizados: true`; responde `pendiente_facturar`   |
| ¿Cuántos vehículos hay en monitoreo? ¿De un cliente o agencia? | `consultar_vehiculos_monitoreo`, con `cliente`, `placa` o `sede` si los piden                |
| Vehículos disponibles para asignar a viajes (enturnamiento)    | `consultar_vehiculos_disponibles`, en orden de turno                                         |
| ¿Cuántos empleados tiene la empresa?                           | `consultar_empleados`                                                                        |
