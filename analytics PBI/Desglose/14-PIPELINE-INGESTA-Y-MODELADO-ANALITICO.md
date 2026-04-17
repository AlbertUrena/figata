# 14-PIPELINE-INGESTA-Y-MODELADO-ANALITICO

## Título
Pipeline de ingesta y modelado analítico (raw → curated).

## Objetivo
Convertir eventos capturados en tablas confiables para análisis operacional y ejecutivo.

## Problema que resuelve
Sin pipeline estructurado, los eventos quedan dispersos y no se pueden consultar de forma robusta para dashboards/reportes.

## Scope
- Definir capa raw y capa curated.
- Implementar normalización de payloads a esquema canónico.
- Resolver deduplicación e idempotencia.
- Construir tablas de hechos base (`events_fact`, `sessions_fact`, `visitors_fact`).
- Definir procesos de particionado temporal y backfill.

## Fuera de scope
- Visualizaciones de dashboards.
- Prompts de IA para reportes.

## Dependencias
- `03-MODELO-DATOS-ANALYTICS-Y-CONTRATOS`.
- `09` a `12` (instrumentación base y especializada).

## Inputs / fuentes
- Contratos de eventos definidos en PBIs 02 y 03.
- Eventos emitidos desde runtime público.

## Entregables
- Pipeline ETL/ELT v1 operativo.
- Diccionario de tablas curated.
- Pruebas de calidad de carga (volumen, integridad, duplicados).

## Criterios de aceptación
- Eventos de producción llegan con latencia aceptable definida.
- Tablas curated permiten responder consultas de funnel y recurrencia.
- Existen procesos de re-proceso controlado.

## Riesgos / notas
- Riesgo de drift entre payload real y contratos documentados.
- Riesgo de alto costo si no se controla granularidad/retención raw.

## Orden recomendado / fase
Fase 3 (Plataforma de datos). Paso 14 de 22.

## Prioridad sugerida
P0 (crítico).
