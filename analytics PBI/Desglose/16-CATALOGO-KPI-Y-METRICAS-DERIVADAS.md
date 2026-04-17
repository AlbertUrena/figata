# 16-CATALOGO-KPI-Y-METRICAS-DERIVADAS

## Título
Catálogo oficial de KPIs y métricas derivadas de negocio.

## Objetivo
Definir una sola fuente de verdad para métricas operativas, comerciales y de producto.

## Problema que resuelve
Sin definiciones únicas, cada reporte interpreta distinto conversion, recurrencia, interés y calidad por canal.

## Scope
- Definir KPIs de adquisición, comportamiento, comercio, operación.
- Definir fórmulas de métricas derivadas (ej. detail_opens_before_purchase).
- Definir ventanas temporales (diario, semanal, mensual).
- Definir segmentaciones estándar (canal, dispositivo, contexto, nuevos/recurrentes).
- Definir métricas de performance conectadas a negocio.

## Fuera de scope
- Construcción visual de dashboards.
- Recomendaciones automáticas por IA.

## Dependencias
- `02-TAXONOMIA-EVENTOS-Y-DICCIONARIO`.
- `14-PIPELINE-INGESTA-Y-MODELADO-ANALITICO`.
- `15-CALIDAD-DATOS-Y-OBSERVABILIDAD`.

## Inputs / fuentes
- `/Users/al/website-figata/analytics PBI/V1.md`
- `/Users/al/website-figata/analytics PBI/V2.md`
- `/Users/al/website-figata/analytics PBI/Comportamiento de decision en el menu.md`

## Entregables
- Diccionario de KPIs con fórmula y propósito.
- Tabla de métricas base vs inferidas.
- Matriz KPI → evento fuente.

## Criterios de aceptación
- Todas las métricas en dashboards/reportes usan definiciones del catálogo.
- Métricas inferidas están claramente etiquetadas como derivadas.
- Hay validación de negocio sobre KPIs prioritarios.

## Riesgos / notas
- Riesgo de mezclar métricas de intención con métricas de venta confirmada.
- Riesgo de crear demasiados KPIs sin foco ejecutivo.

## Orden recomendado / fase
Fase 3 (Plataforma de datos). Paso 16 de 22.

## Prioridad sugerida
P0 (crítico).
