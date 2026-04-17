# 12-INSTRUMENTACION-PERFORMANCE-Y-CONECTIVIDAD

## Título
Instrumentación de performance y conectividad por sesión/ruta/recurso.

## Objetivo
Conectar experiencia real de carga con impacto en abandono, intención y conversión.

## Problema que resuelve
Sin métricas de rendimiento segmentadas por red/dispositivo, no se puede decidir calidad de media ni optimizaciones adaptativas.

## Scope
- Señales de red: `effectiveType`, `downlink`, `rtt`, `saveData` cuando exista.
- Métricas de navegación: FCP, interactive, tiempos de shell y ruta.
- Métricas menú/detalle: tiempo a tabs, primera fila, imagen detalle, video ready.
- Métricas por recurso pesado (imagen/video): duración y tamaño cuando disponible.
- Segmentación por canal, dispositivo y contexto.

## Fuera de scope
- Reescritura completa de pipeline de assets.
- Implementación de adaptive delivery avanzada (se planifica después).

## Dependencias
- `05-SDK-TRACKING-CLIENTE`.
- `09-INSTRUMENTACION-NAVEGACION-Y-CTA-BASE`.

## Inputs / fuentes
- `/Users/al/website-figata/analytics PBI/Performance & Connectivity Intelligence.md`
- `assets/menu/`
- `js/menu-page.js`
- `js/eventos-page.js`

## Entregables
- Esquema de eventos performance.
- Instrumentación en runtime para rutas críticas.
- Reporte baseline de p50/p75/p90 por ruta.

## Criterios de aceptación
- Se puede comparar conversión por calidad de red.
- Se identifican assets con peor impacto de carga.
- Existe baseline antes de optimizaciones.

## Riesgos / notas
- Soporte parcial de Network Information API según navegador.
- Riesgo de ruido por caché/CDN si no se interpreta correctamente.

## Orden recomendado / fase
Fase 2 (Captura confiable). Paso 12 de 22.

## Prioridad sugerida
P1 (alta).
