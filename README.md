# figata
Official website for Figata - pizza & wine.

## CMS publish
- Flujo y modos de publicacion CMS: `docs/cms-publish.md`.

## Fuentes de datos
- Menu: `data/menu.json`
- Home: `data/home.json`
- Restaurant: `data/restaurant.json`
- Media (imagenes): `data/media.json`
- Reglas de variantes (bonus): `data/media-variants.json`
- Categorias: `data/categories.json`
- Disponibilidad: `data/availability.json`
- Ingredientes + iconos: `data/ingredients.json`
- Alias de ingredientes: `data/ingredients-usage.json`
- `data/menu-index.json` es solo referencia/tooling (no runtime en UI).

## Como agregar un item nuevo al menu
1. Agrega el item dentro de su seccion en `data/menu.json` (`sections[].items[]`).
2. Usa la estructura estandar por item:
   `id`, `name`, `slug`, `category`, `subcategory`, `descriptionShort`, `descriptionLong`, `price`, `ingredients[]`, `tags[]`, `allergens[]`, `featured`, `spicy_level`, `vegetarian`, `vegan`, `available`.
3. `category` debe usar IDs definidos en `data/categories.json` (ej: `entradas`, `pizza`, `pizza_autor`, `postres`, `productos`).
4. `subcategory` es opcional, pero si se usa debe existir en la categoria correspondiente.
5. Campos legacy como `image`, `spicy`, `reviews` o `availabilityNote` pueden convivir, pero el frontend usa `data/media.json` para resolver imagenes.

## Sistema de imagenes (`data/media.json`)
El frontend resuelve assets visuales por `itemId` y variante:

- `card`: imagen para cards/grilla.
- `hover`: variante opcional de hover.
- `modal`: imagen hero del preview de detalles.
- `gallery`: array para carousel futuro.
- `alt`: texto alternativo.
- `dominantColor`, `version`: metadata opcional por item.

Defaults globales en `media.defaults`:
- `card`
- `modal`
- `hover`
- `alt`

API runtime disponible:
- `FigataData.media.get(itemId, variant)`
- `FigataData.media.getAlt(itemId)`
- `FigataData.media.getGallery(itemId)`
- `FigataData.media.prefetch(itemId, variant)`

Reglas de fallback:
- Si falta `media.items[itemId]` -> usa defaults.
- Si falta la variante (`hover`/`modal`) -> usa `card`.
- Si no existe nada -> usa placeholder fijo y warning en consola (una sola vez por item/variante).

Convencion de carpetas objetivo:
- `assets/menu/cards/`
- `assets/menu/modal/`
- `assets/menu/hover/`
- `assets/menu/gallery/`
- `assets/menu/placeholders/`

Referencia: `assets/menu/README.md`.

## Home data-driven (`data/home.json`)
`data/home.json` controla el homepage completo sin tocar codigo:
- `hero`: titulo, subtitulo, imagen de fondo y CTAs.
- `popular`: titulo/subtitulo, `featuredIds`, `limit`.
- `eventsPreview`: toggle, titulo/subtitulo, `limit`, `eventIds`, `items`.
- `delivery`: titulo/subtitulo y `platforms` (`url`, `icon`, `iconSize`) por canal.
- `reservation`: CTA de reservas (navbar y seccion controlada).
- `announcements`: mensaje temporal, tipo y link.
- `sections`: visibilidad de bloques (`hero`, `popular`, `events`, `delivery`, `reservation`, `announcements`).

### Como agregar un plato a Populares
1. Asegura que el item exista en `data/menu.json`.
2. Agrega su `id` en `data/home.json` en `popular.featuredIds`.
3. Ajusta `popular.limit` si quieres mas o menos cards.

### Como activar un anuncio temporal
1. En `data/home.json`, ve a `announcements`.
2. Cambia `enabled` a `true`.
3. Completa `message` y, opcionalmente, `link`.
4. Define `type` (`highlight`, `warning` o `info`).

### Como cambiar plataformas de delivery
1. En `data/home.json`, edita `delivery.platforms`.
2. Soporta `pedidosya`, `ubereats`, `takeout`, `whatsapp`.
3. Cada plataforma acepta `url`, `icon` (path) y `iconSize` (16-64).
4. Si un `url` falta o es invalido, ese boton se oculta automaticamente.

## Restaurante data-driven (`data/restaurant.json`)
Centraliza los datos oficiales reutilizables para SEO + footer + contacto:

- `name`, `brand`
- `address`
- `phone`, `whatsapp`
- `currency`
- `reservationUrl`
- `googleMapsUrl`
- `openingHours` (por dia)
- `social` (`instagram`, `tiktok`, `tripadvisor` opcional)
- `seo` (opcional, para title/description/json-ld)

Consumo runtime:
- SEO: actualiza `<title>`, `<meta name="description">` y JSON-LD tipo `Restaurant`.
- Footer/contacto: direccion + maps, telefono, WhatsApp, horarios, sociales, CTA de reservar.

## Fallbacks de runtime
- Si `popular.featuredIds` esta vacio o invalido, se usa fallback automatico.
- Si `hero.backgroundImage` falta, se usa imagen por defecto.
- Si faltan links en `delivery.platforms.*.url`, se ocultan esos botones.

## Validacion
Valida el contrato de `home.json` con:

```bash
npm run validate:home
```

Valida integridad de media con:

```bash
npm run validate:media
```

Valida el contrato de restaurant con:

```bash
npm run validate:restaurant
```

La validacion comprueba, entre otras cosas:
- campos requeridos del home
- `featuredIds` existentes en `menu.json`
- formatos de URL/rutas
- `limit` numericos

La validacion de media comprueba:
- items del menu sin entrada en `media.json`
- variantes faltantes (`card`, `modal`, `hover`)
- paths rotos en `/assets`
- rutas duplicadas potencialmente innecesarias

Tambien genera `data/media-report.json` para QA.

## Disponibilidad (`data/availability.json`)
- `items[]`: `itemId`, `available`, `soldOutReason`.
- `settings.hideUnavailableItems` controla si se ocultan items no disponibles.
- Si no se ocultan, el item se renderiza con etiqueta `No disponible`.

## Taxonomia de categorias (`data/categories.json`)
Cada categoria define:
- `id`, `label`, `description`, `icon`, `order`, `enabled`
- Mapeo UI: `labelShort`, `labelLong`, `pillLabel`
- Visibilidad: `showOnHome`
- Legacy opcional: `legacyIds`
- Subcategorias embebidas en `subcategories[]` con el mismo patron.

## Ingredientes
### Como asignar ingredientes
1. En el item del menu, usa `ingredients` con IDs existentes en `data/ingredients.json`.
2. Ejemplo: `"ingredients": ["mozzarella", "pomodoro", "albahaca"]`.
3. Si un ID no existe, la UI no crashea y muestra warning en consola.

### Como agregar un icono nuevo
1. Agrega el asset en `assets/Ingredients/`.
2. Registra el icono en `data/ingredients.json` bajo `icons`.
3. Asocia el ingrediente en `data/ingredients.json` bajo `ingredients` (`icon`, `label`/`name`, `aliases`).
4. Si necesitas matching legacy, agrega mapeo en `data/ingredients-usage.json` bajo `ingredientAliasesToIcon`.
