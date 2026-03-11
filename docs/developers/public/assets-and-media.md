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
- [Caching](#caching) — Netlify cache rules
- [Adding a New Menu Item Image](#adding-a-new-menu-item-image)
- [Adding a New Ingredient Icon](#adding-a-new-ingredient-icon)

---

## Overview

The Figata project uses static image assets organized by type. There is no CDN or image processing pipeline — all assets are served directly by Netlify from the repository.

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
assets/menu/entradas/<item-slug>.webp           ← entradas
assets/menu/pizzas/clasica/<item-slug>.webp     ← pizzas clásicas
assets/menu/pizzas/autor/<item-slug>.webp       ← pizzas de autor
assets/menu/postres/<item-slug>.webp            ← postres
assets/menu/productos/<item-slug>.webp          ← productos
assets/menu/<item-slug>-hover.webp              ← hover variant (optional, legacy)
```

Example for "Margherita":
```
assets/menu/pizzas/clasica/margherita.webp      ← card/modal image
assets/menu/margherita-hover.webp               ← hover variant (legacy)
```

### Image Variants

Each menu item can have up to 4 image variants, defined in `data/media.json`:

| Variant | Purpose | Where used |
|---------|---------|-----------|
| `card` | Card thumbnail in the featured grid | `js/mas-pedidas.js` card rendering |
| `hover` | Alternate image shown on pointer hover | Card hover state + preview hover |
| `modal` | Full-size image in the preview overlay | Preview overlay main image |
| `gallery` | Additional images (array) | Currently unused on public site |

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
mediaApi.get(itemId, "card")     // → "assets/menu/pizzas/clasica/margherita.webp"
mediaApi.get(itemId, "hover")    // → "assets/menu/margherita-hover.webp"
mediaApi.get(itemId, "modal")    // → "assets/menu/margherita.webp"
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
  "schema": "media",
  "items": {
    "<item-id>": {
      "card": "assets/menu/<slug>.webp",
      "hover": "assets/menu/<slug>-hover.webp",
      "modal": "assets/menu/<slug>.webp",
      "alt": "Item display name",
      "gallery": []
    }
  }
}
```

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

Netlify caching rules (from `netlify.toml`):

| Path | Cache behavior |
|------|---------------|
| `/assets/*` | `max-age=31536000, immutable` (1 year, aggressive caching) |
| `/data/*.json` | `max-age=0, must-revalidate` (always fresh) |

Since assets are cached aggressively, **changing an existing image** requires changing the filename or adding a cache-busting query parameter. Adding a new image with a new filename works immediately.

---

## Dev Server Media Endpoint

During local development, the dev server provides:

| Endpoint | Method | Response |
|----------|--------|----------|
| `/__local/menu-media-paths` | GET | `{ root: "assets/menu", paths: [...] }` |

Returns a sorted list of all `.webp` and `.svg` files under `assets/menu/`. Used by the admin panel's media picker to show available images for assignment to menu items.

---

## Adding a New Menu Item Image

1. Create a WebP image (recommended: 800×600px for card, 1200×800px for modal)
2. Name it `<item-slug>.webp` and optionally `<item-slug>-hover.webp`
3. Place in the correct category subfolder under `assets/menu/`
4. Add an entry in `data/media.json` under `items.<item-id>`:
   ```json
   {
     "card": "assets/menu/<slug>.webp",
     "hover": "assets/menu/<slug>-hover.webp",
     "modal": "assets/menu/<slug>.webp",
     "alt": "Display name"
   }
   ```
5. Run `npm run validate:media` to verify

## Adding a New Ingredient Icon

1. Create a WebP image (recommended: 64×64px or 128×128px)
2. Name it `<icon-key>.webp`
3. Place in `assets/Ingredients/`
4. Add an icon entry in `data/ingredients.json` under the `icons` array
5. Set the ingredient's `iconKey` to match the new icon key
6. Run `npm run validate:ingredients` to verify
