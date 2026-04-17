# 18-DASHBOARD-V2-COHORTES-RETENCION-Y-TIEMPO

## Título
Dashboard v2 de cohortes, retención, timing y performance-context.

## Objetivo
Escalar de lectura descriptiva a inteligencia accionable por segmento, recurrencia y contexto de red.

## Problema que resuelve
El dashboard v1 no explica por qué cambian los resultados ni para qué segmento conviene actuar.

## Scope
- Cohortes: nuevos vs recurrentes, canal, dispositivo.
- Retención: retorno 1/7/30 días y frecuencia por visitante.
- Timing: comportamiento por hora y día.
- Correlación performance-context con conversión.
- Sección de platos de alta curiosidad y baja conversión.

## Fuera de scope
- Personalización automática en runtime.
- Experimentación A/B automatizada.

## Dependencias
- `11-INSTRUMENTACION-CONTENIDO-EDITORIAL-Y-DECISION`.
- `12-INSTRUMENTACION-PERFORMANCE-Y-CONECTIVIDAD`.
- `16-CATALOGO-KPI-Y-METRICAS-DERIVADAS`.
- `17-DASHBOARD-V1-OPERATIVO`.

## Inputs / fuentes
- Dataset curated + métricas derivadas.
- Definiciones de cohortes y segmentos.

## Entregables
- Dashboard v2 publicado.
- Vistas de cohortes y retención con filtros estándar.
- Métricas de tiempo/segmento listas para decisiones operativas.

## Criterios de aceptación
- Se puede identificar calidad de canal por intención y retorno.
- Se puede detectar franjas horarias de mayor intención.
- Se puede segmentar performance/conversión por calidad de red.

## Riesgos / notas
- Riesgo de complejidad excesiva si no se priorizan vistas.
- Riesgo de interpretar causalidad directa sin validación experimental.

## Orden recomendado / fase
Fase 4 (Explotación). Paso 18 de 22.

## Prioridad sugerida
P1 (alta).
