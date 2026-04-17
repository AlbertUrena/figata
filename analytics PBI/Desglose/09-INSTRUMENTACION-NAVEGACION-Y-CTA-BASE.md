# 09-INSTRUMENTACION-NAVEGACION-Y-CTA-BASE

## Título
Instrumentación base de navegación pública y CTAs globales.

## Objetivo
Capturar eventos fundacionales de uso del sitio para construir adquisición y comportamiento general.

## Problema que resuelve
Sin capa base de navegación, los análisis se sesgan a eventos de menú y se pierde contexto de entry, flujo y abandono.

## Scope
- `session_start`, `page_view`, `page_exit`.
- CTAs globales: WhatsApp, reserva, delivery, eventos.
- Scroll milestones y visibilidad básica por sección.
- Eventos de navbar/burger en mobile.
- Instrumentación en rutas públicas clave (`/`, `/menu/`, `/eventos/`, `/nosotros/`).

## Fuera de scope
- Funnel detallado de item/cart/checkout.
- Métricas avanzadas de decisión en detalle de plato.

## Dependencias
- `05-SDK-TRACKING-CLIENTE`.
- `07-ATRIBUCION-TRAFICO-Y-VANITY-PATHS`.
- `08-EXCLUSION-TRAFICO-INTERNO`.

## Inputs / fuentes
- `index.html`
- `menu/index.html`
- `eventos/index.html`
- `nosotros/index.html`
- `js/navbar-collapse.js`
- `js/public-burger-menu.js`
- `shared/public-navbar.js`

## Entregables
- Eventos base emitidos por todas las rutas públicas.
- Matriz de cobertura de eventos por ruta.
- Validación manual de payload por entorno.

## Criterios de aceptación
- Cada hard navigation inicia sesión y registra page view.
- Cada CTA global crítico dispara evento consistente.
- Scroll milestones aparecen en al menos homepage y menú.

## Riesgos / notas
- Riesgo de doble-disparo por transiciones same-document.
- Riesgo de perder eventos en navegación rápida.

## Orden recomendado / fase
Fase 2 (Captura confiable). Paso 9 de 22.

## Prioridad sugerida
P0 (crítico).
