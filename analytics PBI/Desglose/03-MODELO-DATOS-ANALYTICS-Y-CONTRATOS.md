# 03-MODELO-DATOS-ANALYTICS-Y-CONTRATOS

## Título
Modelo de datos analytics (eventos, sesiones, visitantes, contexto de tráfico).

## Objetivo
Definir estructura de datos canónica para capturar, persistir y consultar analytics de forma consistente.

## Problema que resuelve
Sin modelo explícito, no se puede responder bien preguntas de recurrencia, cohorts, source quality ni funnel de compra.

## Scope
- Definir entidades: `events`, `sessions`, `visitors`, `sources`.
- Definir claves y relaciones (`visitor_id`, `session_id`, `event_id`).
- Definir campos de source/context (`entry_source`, `visit_context`, `confidence`).
- Definir campos para menú y comercio (`item_id`, `category`, `price`, `cta`).
- Definir contratos de payload entre frontend y backend.

## Fuera de scope
- Implementación física en DB productiva.
- Dashboards finales.

## Dependencias
- `02-TAXONOMIA-EVENTOS-Y-DICCIONARIO`.

## Inputs / fuentes
- `/Users/al/website-figata/analytics PBI/Base de visitantes pseudónimos/Base de visitantes pseudonimos.md`
- `/Users/al/website-figata/analytics PBI/Base de visitantes pseudónimos/Como distinguir trafico en restaurante vs remoto.md`
- `/Users/al/website-figata/analytics PBI/V1.md`

## Entregables
- Esquema lógico de datos analytics v1.
- Contratos de payload por tipo de evento.
- Reglas de idempotencia y deduplicación.

## Criterios de aceptación
- Se puede reconstruir jornada completa visitor → session → event.
- Se soporta segmentación por canal, contexto y dispositivo.
- El modelo cubre v1 sin bloqueos para v2.

## Riesgos / notas
- Riesgo de sobredimensionar entidades antes de validar volumen real.
- Riesgo de inconsistencias entre modelos frontend y backend.

## Orden recomendado / fase
Fase 1 (Fundación). Paso 3 de 22.

## Prioridad sugerida
P0 (crítico).
