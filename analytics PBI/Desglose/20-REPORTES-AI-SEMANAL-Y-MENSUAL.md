# 20-REPORTES-AI-SEMANAL-Y-MENSUAL

## Título
Automatización de reportes ejecutivos semanales y mensuales con IA.

## Objetivo
Transformar métricas en narrativa accionable para socios/operación sin depender de lectura manual de dashboards.

## Problema que resuelve
Hay demasiada data cruda y poca síntesis ejecutiva repetible con comparativas útiles entre periodos.

## Scope
- Definir plantilla de reporte semanal y mensual.
- Definir payload de entrada agregado y validado.
- Definir comparación período actual vs anterior (y baseline opcional).
- Definir pipeline programado de generación, almacenamiento y distribución.
- Definir guardrails de prompt (no alucinación, observación/inferencia/hipótesis).

## Fuera de scope
- Chat interactivo en tiempo real.
- Automatización de decisiones en producto sin intervención humana.

## Dependencias
- `15-CALIDAD-DATOS-Y-OBSERVABILIDAD`.
- `16-CATALOGO-KPI-Y-METRICAS-DERIVADAS`.
- `17-DASHBOARD-V1-OPERATIVO`.
- `18-DASHBOARD-V2-COHORTES-RETENCION-Y-TIEMPO`.

## Inputs / fuentes
- `/Users/al/website-figata/analytics PBI/AI Reports/AI Reports.md`
- `/Users/al/website-figata/analytics PBI/AI Reports/Reporte semanal.md`

## Entregables
- Job semanal automatizado.
- Job mensual automatizado.
- Plantillas de salida en markdown/HTML.
- Registro histórico de reportes y payloads fuente.

## Criterios de aceptación
- Reportes se generan en fecha/hora programada.
- Cada hallazgo importante referencia métricas concretas.
- Se distingue observación vs inferencia vs recomendación.

## Riesgos / notas
- Riesgo de reportes “bonitos” pero vacíos sin buen contexto de entrada.
- Riesgo de costo innecesario si no se optimiza tamaño de payload.

## Orden recomendado / fase
Fase 5 (Inteligencia IA). Paso 20 de 22.

## Prioridad sugerida
P1 (alta).
