# Assets and Media

> **Read this doc when** adding, removing, or modifying images/icons, working with the media JSON, debugging broken images, or understanding how media paths are resolved.

## Contents

- [Overview](#overview) — asset counts and directories
- [Menu Item Images](#menu-item-images) — naming convention, variants, placeholders
- [Media Resolution](#media-resolution) — public site, admin panel
- [data/media.json Structure](#datamediajson-structure)
- [Ingredient Icons](#ingredient-icons) — directory, naming, resolution
- [Homepage Assets](#homepage-assets)
- [UI Icons](#ui-icons-assetssvg-icons)
- [Caching](#caching) — Cloudflare cache rules
- [Adding a New Menu Item Image](#adding-a-new-menu-item-image)
- [Adding a New Ingredient Icon](#adding-a-new-ingredient-icon)

---

## Overview

The Figata project uses static image assets organized by type. There is no image processing pipeline — assets are served directly from the repository by the Cloudflare runtime.

| Asset type | Directory | Format | Count |
|-----------|-----------|--------|------:|
| Menu item images | `assets/menu/` (category subfolders) | WebP | ~28 |
| Menu placeholders | `assets/menu/placeholders/` | SVG | 2 |
| Ingredient icons | `assets/Ingredients/` | WebP | ~31 |
| Homepage images | `assets/home/` | WebP | 3 |
| Testimonial avatars | `assets/reviews/` | WebP | 9 |
| UI icons | `assets/svg-icons/` | SVG | ~23 |

**Total:** ~100 files

---

## Menu Item Images

### Naming Convention

Menu images use the **item slug** as the filename and live under category subfolders:

```
assets/menu/entradas/<item-slug>/<asset>.webp   ← entradas
assets/menu/pizzas/<pizza-slug>/<asset>.webp    ← pizzas
assets/menu/postres/<item-slug>/<asset>.webp    ← postres
assets/menu/bebidas/<item-slug>/<asset>.webp    ← bebidas
assets/menu/productos/<item-slug>/<asset>.webp  ← productos
assets/menu/.../<item-slug>-hover.webp          ← hover variant (optional)
```

Example for "Margherita":
```
assets/menu/pizzas/margherita/margherita.webp   ← source/card/modal image
assets/menu/pizzas/margherita/margherita-hover.webp  ← hover override (optional)
```

### Image Variants

Each menu item can have up to 4 image variants, defined in `data/media.json`:

| Variant | Purpose | Where used |
|---------|---------|-----------|
| `card` | Card thumbnail in the featured grid | `js/mas-pedidas.js` card rendering |
| `hover` | Alternate image shown on pointer hover | Card hover state + preview hover |
| `modal` | Full-size image in the preview overlay | Preview overlay main image |
| `gallery` | Additional editorial detail images (array) | Explicit `/menu/` detail editorial gallery |

### Placeholder Images

When no image is available or an image fails to load:

| Placeholder | Path | Used for |
|-------------|------|----------|
| Card placeholder | `assets/menu/placeholders/card.svg` | Menu browser cards (admin) |
| Modal placeholder | `assets/menu/placeholders/modal.svg` | Item editor preview (admin) |

---

## Media Resolution

### Public Site (`js/mas-pedidas.js`)

Uses `window.FigataData.media` API:

```js
mediaApi.get(itemId, "card")     // → "assets/menu/pizzas/margherita/margherita.webp"
mediaApi.get(itemId, "hover")    // → "assets/menu/pizzas/margherita/margherita-hover.webp"
mediaApi.get(itemId, "modal")    // → "assets/menu/pizzas/margherita/margherita.webp"
mediaApi.getAlt(itemId)          // → "Margherita"
mediaApi.getGallery(itemId)      // → ["assets/menu/extra1.webp", ...]
mediaApi.prefetch(itemId, variant) // Preloads image into browser cache
```

### Admin Panel (`admin/app/modules/menu-media.js`)

Uses `FigataAdmin.menuMedia`:

```js
resolveMenuMediaPath(ctx, rawPath, allowFallback)
// Resolves a raw path against state.indexes.menuMediaPathSet
// Returns the path if it exists, or fallback placeholder

setImageElementSourceWithFallback(imgEl, path, fallbackPath)
// Sets img.src with onerror fallback
```

### Admin Panel (`admin/app/modules/render-utils.js`)

Asset path utilities:

```js
resolveAssetPath(path)          // Normalize to absolute path
toRelativeAssetPath(path)       // Convert to relative path
isSvgPlaceholderPath(path)      // Check if path is a placeholder SVG
isMenuMediaPath(path)           // Check if path is under assets/menu/
buildMenuMediaCandidates(raw)   // Build candidate paths for media picker
```

---

## `data/media.json` Structure

```json
{
  "version": 2,
  "schema": "figata.media.v2",
  "items": {
    "<item-id>": {
      "source": "assets/menu/pizzas/<pizza-slug>/<asset>.webp",
      "alt": "Item display name",
      "lqip": "data:image/webp;base64,...",
      "detailSlideLqip": {
        "assets/menu/pizzas/<pizza-slug>/<asset>-slide-0.webp": "data:image/webp;base64,..."
      },
      "overrides": {
        "card": "",
        "hover": "",
        "modal": "",
        "gallery": []
      }
    }
  }
}
```

`lqip` is optional and stores a tiny inline data URI used as the first-paint blurred placeholder in the `/menu/` catalog cards.
`detailSlideLqip` is optional and stores inline placeholders per detail slide path so the active `/menu/` editorial slide can render instantly without extra placeholder requests.
The public `/menu/` detail hero only uses editorial media declared in `overrides.gallery` or `overrides.editorialSlides`. When `gallery` is empty, the runtime can rebuild the image-only editorial gallery from the already-declared `detailSlideLqip` keys in `data/media.json`; it does not guess slide filenames over the network and it never falls back to the catalog image.

For the full schema, see `docs/developers/data/data-layer.md`.

---

## Ingredient Icons

### Directory

Icons are stored in `assets/Ingredients/` (note: capital "I"). Each icon is a WebP image.

### Naming

Icon filenames match the icon `key` in `data/ingredients.json`:

```
assets/Ingredients/<icon-key>.webp
```

Example: `assets/Ingredients/mozzarella.webp`

### Usage

Each ingredient in `data/ingredients.json` has an `iconKey` that maps to an icon:

```json
{
  "id": "mozzarella",
  "name": "Mozzarella",
  "iconKey": "mozzarella"
}
```

Icons are rendered by `src/ui/ingredient-icon-row.js` on the public site and by the admin panel's ingredients editor.

### Icon Resolution

```
ingredients.json → ingredient.iconKey
    ↓
ingredients.json → icons[iconKey].path
    ↓
assets/Ingredients/<filename>.webp
```

---

## Homepage Assets

| File | Purpose |
|------|---------|
| `assets/home/seamless-bg.webp` | Default hero background image |
| Other files | Section background images, decorative elements |

Referenced by `js/home-config.js` → `applyHero()` as the fallback background.

---

## UI Icons (`assets/svg-icons/`)

SVG icons used throughout the public site for UI elements:

- Star ratings (`star.svg`)
- Navigation icons
- Social media icons
- Delivery platform indicators
- General UI elements (arrows, close buttons, etc.)

Referenced directly in `index.html` and `styles.css` via `<img>` tags and CSS `background-image`.

---

## Caching

Cloudflare Pages caching rules (from `_headers`) and the Cloudflare build outputs share the same policy:

| Path | Cache behavior |
|------|---------------|
| `/assets/*`, `/fonts/*`, `/assets/fonts/*`, `/js/*`, `/shared/*`, `/src/*`, `/styles.css`, `/menu/menu-page.css`, `/eventos/eventos.css`, `/admin/app/*.css`, `/admin/app/*.js`, `/admin/app/modules/*` | `max-age=0, must-revalidate` (always check for the latest file before reusing cache) |
| `/data/*.json` | `max-age=0, must-revalidate` (always fresh) |

The public routes intentionally avoid manual `?v=` cache-busting suffixes. Cache freshness comes from HTTP revalidation, not from ad-hoc version strings sprinkled through HTML.

Because the repo serves original file paths directly without fingerprinting, changing an existing image, font, CSS file, or script should be reflected on the next revalidation without renaming files.

---

## Dev Server Media Endpoint

During local development, the dev server provides:

| Endpoint | Method | Response |
|----------|--------|----------|
| `/__local/menu-media-paths` | GET | `{ root: "assets/menu", paths: [...] }` |

Returns a sorted list of `.webp`, `.svg`, `.webm`, and `.mp4` files under `assets/menu/`. Used by the admin panel's media picker/editorial detector to show available media for assignment to menu items.

---

## Adding a New Menu Item Image

1. Create a WebP image (recommended: 800×600px for card, 1200×800px for modal)
2. Place it in the corresponding per-item folder (`assets/menu/<categoria>/<item-slug>/`)
3. Name it `<item-slug>.webp` and optionally `<item-slug>-hover.webp`
4. Add/update the entry in `data/media.json` under `items.<item-id>`:
   ```json
   {
     "source": "assets/menu/<categoria>/<item-slug>/<asset>.webp",
     "overrides": {
       "hover": "assets/menu/<categoria>/<item-slug>/<asset>-hover.webp"
     },
     "alt": "Display name"
   }
   ```
5. Keep `data/menu.json` `item.image` aligned with the same path used as source/card
6. (Optional) Regenerate catalog inline placeholders with `npm run generate:menu-card-lqip`
7. (Optional, when changing detail slides) regenerate detail slide assets/LQIP with `npm run generate:menu-detail-slides`
8. Run `npm run validate:media` to verify

## Adding a New Ingredient Icon

1. Create a WebP image (recommended: 64×64px or 128×128px)
2. Name it `<icon-key>.webp`
3. Place in `assets/Ingredients/`
4. Add an icon entry in `data/ingredients.json` under the `icons` array
5. Set the ingredient's `iconKey` to match the new icon key
6. Run `npm run validate:ingredients` to verify
