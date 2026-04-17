# 08-EXCLUSION-TRAFICO-INTERNO

## Título
Sistema de exclusión de tráfico interno y de entornos no productivos.

## Objetivo
Evitar contaminación de métricas por sesiones de dueños, staff, QA y desarrollo.

## Problema que resuelve
Sin separación interna, se inflan funnels, top dishes, tiempos y decisiones de negocio.

## Scope
- Definir activadores internos (`?internal=1`, cookie, localStorage, rol admin).
- Definir bandera `is_internal` y `traffic_class` en todos los eventos.
- Excluir o segmentar entornos `localhost`, preview y admin.
- Definir filtro estándar de dashboards/reportes (`is_internal=false`).
- Definir trazabilidad de exclusiones para auditoría.

## Fuera de scope
- Sistemas de autenticación nuevos.
- Políticas corporativas de acceso fuera del analytics runtime.

## Dependencias
- `05-SDK-TRACKING-CLIENTE`.
- `06-IDENTIDAD-VISITANTE-Y-SESION`.
- `04-GOBERNANZA-PRIVACIDAD-Y-RETENCION`.

## Inputs / fuentes
- `/Users/al/website-figata/analytics PBI/Sistema de exclusion de trafico interno.md`

## Entregables
- Lógica runtime de marcado interno.
- Documento de exclusión por entorno.
- Reglas de filtrado para reporting y AI reports.

## Criterios de aceptación
- Eventos internos quedan marcados de forma determinística.
- Reportes operativos no incluyen tráfico interno por defecto.
- Existe evidencia de eventos excluidos por período.

## Riesgos / notas
- Riesgo de excluir tráfico real por falsos positivos.
- Riesgo de no marcar sesiones internas si el flujo de activación falla.

## Orden recomendado / fase
Fase 2 (Captura confiable). Paso 8 de 22.

## Prioridad sugerida
P0 (crítico).
