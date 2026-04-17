# 02-TAXONOMIA-EVENTOS-Y-DICCIONARIO

## Título
Taxonomía de eventos y diccionario canónico de tracking.

## Objetivo
Estandarizar nombres de eventos, propiedades, convenciones de tipado y semántica para evitar datos ambiguos.

## Problema que resuelve
Sin taxonomía formal, los eventos se duplican, cambian de nombre por ruta y rompen comparativas históricas.

## Scope
- Definir namespace de eventos v1 y v2.
- Definir propiedades obligatorias y opcionales por evento.
- Definir convenciones de naming (`snake_case`, prefijos, versiones).
- Definir catálogo de eventos core: page_view, source attribution, menu funnel, CTA.
- Definir eventos avanzados: editorial, decision behavior, retention, performance.

## Fuera de scope
- Envío real de eventos al proveedor.
- Modelado SQL final en warehouse.

## Dependencias
- `01-FUNDACION-ARQUITECTURA-ANALYTICS`.

## Inputs / fuentes
- `/Users/al/website-figata/analytics PBI/V1.md`
- `/Users/al/website-figata/analytics PBI/V2.md`
- `/Users/al/website-figata/analytics PBI/Comportamiento de decision en el menu.md`
- `/Users/al/website-figata/analytics PBI/Performance & Connectivity Intelligence.md`

## Entregables
- Diccionario de eventos v1/v2 en markdown o JSON schema.
- Matriz evento → propiedades → origen (script/ruta).
- Tabla de deprecación/versionado de eventos.

## Criterios de aceptación
- Cada evento tiene definición única y sin duplicidad semántica.
- Cada propiedad tiene tipo, cardinalidad y ejemplo.
- Existe revisión cruzada entre producto, frontend y data.

## Riesgos / notas
- Riesgo de inflar catálogo con eventos de bajo valor.
- Riesgo de incluir eventos inferidos como si fueran directos.

## Orden recomendado / fase
Fase 1 (Fundación). Paso 2 de 22.

## Prioridad sugerida
P0 (crítico).
