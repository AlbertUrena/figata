# 19-HEATMAPS-Y-SESSION-REPLAY

## Título
Integración de heatmaps y session replay para UX analytics.

## Objetivo
Complementar eventos cuantitativos con evidencia visual de comportamiento real de usuarios.

## Problema que resuelve
Solo con eventos no se detectan bien dead clicks, rage clicks o zonas ignoradas de la UI.

## Scope
- Selección de herramienta (ej. Clarity/Hotjar) según costo/cobertura.
- Integración técnica en rutas públicas.
- Definición de muestreo y filtros para evitar ruido.
- Vinculación de hallazgos UX con métricas de funnel.
- Protocolo para revisar sesiones sin exponer datos sensibles.

## Fuera de scope
- Rediseño completo de UI.
- Almacenamiento local de video recordings propio.

## Dependencias
- `09-INSTRUMENTACION-NAVEGACION-Y-CTA-BASE`.
- `10-INSTRUMENTACION-MENU-Y-FUNNEL-COMERCIAL`.
- `04-GOBERNANZA-PRIVACIDAD-Y-RETENCION`.

## Inputs / fuentes
- `/Users/al/website-figata/analytics PBI/V2.md`
- `/Users/al/website-figata/analytics PBI/Performance & Connectivity Intelligence.md`

## Entregables
- Herramienta de replay activa en producción.
- Panel de heatmaps por rutas clave.
- Guía de análisis UX con checklist de hallazgos.

## Criterios de aceptación
- Se identifican interacciones críticas no visibles en eventos.
- Existe un proceso de revisión quincenal de sesiones.
- Hallazgos se traducen a backlog accionable.

## Riesgos / notas
- Riesgo de depender solo de evidencia cualitativa sin validar con datos cuantitativos.
- Riesgo de sobrecaptura si no se controla muestreo.

## Orden recomendado / fase
Fase 4 (Explotación). Paso 19 de 22.

## Prioridad sugerida
P2 (media, alto valor para UX).
