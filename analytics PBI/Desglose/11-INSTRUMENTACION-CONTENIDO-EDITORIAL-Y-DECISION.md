# 11-INSTRUMENTACION-CONTENIDO-EDITORIAL-Y-DECISION

## Título
Instrumentación de comportamiento de decisión y consumo editorial del menú.

## Objetivo
Medir cómo decide el usuario: cuántos detalles abre, cuánto compara y qué contenido editorial impacta su intención.

## Problema que resuelve
Sin esta capa, solo vemos conversiones; no entendemos fricción, indecisión ni rol de historia/maridaje/video.

## Scope
- Eventos: `item_story_view`, `item_pairing_view`, `item_video_play`, `item_video_complete`, `item_gallery_expand`.
- Métricas: detail opens por sesión, unique detail opens, detail depth before add/purchase.
- Segmentación por source, dispositivo y resultado de sesión.
- Definición de perfiles conductuales (decidido, explorador, indeciso).

## Fuera de scope
- Modelos ML de propensión.
- Reordenamiento dinámico automático del menú.

## Dependencias
- `10-INSTRUMENTACION-MENU-Y-FUNNEL-COMERCIAL`.
- `06-IDENTIDAD-VISITANTE-Y-SESION`.

## Inputs / fuentes
- `/Users/al/website-figata/analytics PBI/Comportamiento de decision en el menu.md`
- `js/menu-page.js`
- `data/home.json`

## Entregables
- Catálogo de eventos editoriales y de decisión.
- Métricas derivadas documentadas.
- Panel de validación de comportamiento por sesión.

## Criterios de aceptación
- Se puede medir detalle antes de carrito/compra.
- Se puede separar exploración vs decisión rápida por canal.
- Eventos editoriales quedan enlazados al `item_id` cuando aplica.

## Riesgos / notas
- Riesgo de sobreinstrumentar y subir costo sin señal útil.
- Riesgo de confundir correlación editorial con causalidad de compra.

## Orden recomendado / fase
Fase 2 (Captura confiable). Paso 11 de 22.

## Prioridad sugerida
P1 (alta).
