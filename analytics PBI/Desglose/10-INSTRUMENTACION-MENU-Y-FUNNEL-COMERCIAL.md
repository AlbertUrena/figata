# 10-INSTRUMENTACION-MENU-Y-FUNNEL-COMERCIAL

## Título
Instrumentación de funnel comercial del menú (impression → detalle → carrito → checkout → compra).

## Objetivo
Medir intención y conversión real por plato/categoría en el flujo principal de negocio.

## Problema que resuelve
Sin funnel de menú, no se pueden detectar platos con alta curiosidad y baja conversión ni puntos de fuga del checkout.

## Scope
- Eventos: `item_impression`, `item_detail_open`, `add_to_cart`, `remove_from_cart`, `cart_view`, `begin_checkout`, `purchase`.
- Propiedades de item (`item_id`, `item_name`, `category`, `price`).
- Métricas de transición entre pasos del funnel.
- Cobertura de eventos en cards, modal/detalle y acciones de carrito.

## Fuera de scope
- Recomendaciones inteligentes o personalización dinámica.
- Integración con POS externo.

## Dependencias
- `02-TAXONOMIA-EVENTOS-Y-DICCIONARIO`.
- `09-INSTRUMENTACION-NAVEGACION-Y-CTA-BASE`.

## Inputs / fuentes
- `js/menu-page.js`
- `js/home-featured.js`
- `js/mas-pedidas.js`
- `data/menu.json`
- `data/media.json`

## Entregables
- Instrumentación completa del funnel comercial.
- Tablas de transición funnel por plato/categoría.
- Documento de cobertura de edge cases (reintentos, remove, back).

## Criterios de aceptación
- Se puede calcular vista→detalle→carrito→checkout→purchase.
- Se identifica top viewed vs top purchased sin ambigüedad.
- No hay eventos críticos sin `item_id`.

## Riesgos / notas
- Riesgo de eventos duplicados por render reactivity/manual DOM updates.
- Riesgo de drift entre catálogo y IDs de tracking.

## Orden recomendado / fase
Fase 2 (Captura confiable). Paso 10 de 22.

## Prioridad sugerida
P0 (crítico).
