# 15-CALIDAD-DATOS-Y-OBSERVABILIDAD

## Título
Sistema de calidad de datos y observabilidad analytics.

## Objetivo
Detectar y corregir rápido eventos faltantes, inconsistencias de payload y desviaciones de volumen.

## Problema que resuelve
Sin controles de calidad, dashboards y reportes IA pueden lucir sólidos pero basarse en datos rotos.

## Scope
- Definir pruebas automáticas de esquema por evento.
- Definir checks diarios: volumen, nulls críticos, duplicados, cardinalidad anómala.
- Definir alertas de caída de eventos críticos del funnel.
- Definir auditoría de exclusión interna.
- Definir protocolo de incidentes de data.

## Fuera de scope
- Corrección de bugs de UI no relacionados a tracking.
- Monitoreo de infraestructura no analytics.

## Dependencias
- `14-PIPELINE-INGESTA-Y-MODELADO-ANALITICO`.
- `08-EXCLUSION-TRAFICO-INTERNO`.

## Inputs / fuentes
- `/Users/al/website-figata/analytics PBI/Sistema de exclusion de trafico interno.md`
- Tablas curated de analytics.

## Entregables
- Suite de validaciones de calidad de datos.
- Dashboard/alertas de salud del tracking.
- Playbook de respuesta a incidentes.

## Criterios de aceptación
- Existen alertas para eventos core ausentes.
- Se detectan payloads inválidos automáticamente.
- Hay reporte semanal de salud del dataset.

## Riesgos / notas
- Riesgo de exceso de alertas no accionables.
- Riesgo de no versionar reglas de calidad junto al diccionario.

## Orden recomendado / fase
Fase 3 (Plataforma de datos). Paso 15 de 22.

## Prioridad sugerida
P0 (crítico).
