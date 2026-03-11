# Menu System

> **Read this doc when** modifying how menu items are displayed on the public site, changing item detail behavior, adjusting the featured items section, or debugging menu rendering.

---

## Overview

The menu system has two public surfaces:
- Homepage featured section (`#mas-pedidas`) with preview overlay
- Full menu page route (`/menu/`) with category navigation and full catalog browsing

| Component | File | Lines | Purpose |
|-----------|------|------:|---------|
| **Menu renderer** | `js/mas-pedidas.js` | 1,022 | Card grid, preview overlay, cover transition animations |
| **Shared public navbar loader** | `shared/public-navbar.js` | ~250 | Mounts canonical homepage navbar on `/menu/` |
| **Full menu page shell** | `menu/index.html` | ~170 | Intro, top tabs shell, card template, detail subview shell |
| **Full menu page runtime** | `js/menu-page.js` | ~650 | Events-style tabs, grouped section rendering, URL-driven detail subview |
| **Full menu page styles** | `menu/menu-page.css` | ~560 | Centered intro, top tab sizing, responsive grid, detail subview styling |
| **Card template** | `index.html` (`#mas-pedidas-card-template`) | ~20 | HTML template cloned for each card |
| **Menu data generator** | `src/data/menu.js` | 660 | In-browser generator exposing `getFeaturedMenuItems()` |
| **Ingredients component** | `src/ui/ingredient-icon-row.js` | 52 | Renders ingredient icon chips |
| **Media resolver** | `src/data/media.js` | 302 | Provides `get(itemId, variant)`, `getAlt()`, `getGallery()`, `prefetch()` |

---

## Data Flow

```
Page loads
    ↓
src/data/menu.js      → window.FigataData.menu.getFeaturedMenuItems()
src/data/home.js      → window.FigataData.home.getHomeConfig()
src/data/media.js     → window.FigataData.media.get(itemId, variant)
src/data/ingredients.js → window.FigataData.ingredients (for icon row)
shared/menu-traits.js → derives dietary/content/experience badges from ingredients metadata
    ↓
js/mas-pedidas.js
    ├── resolvePopularSelection()   ← reads home.json popular.featuredIds + limit
    ├── mediaApi.loadMediaStore()   ← loads media.json once
    ├── getFeaturedMenuItems()      ← fetches and filters menu items
    ├── resolveItemMedia(item)      ← resolves card/hover/modal/gallery paths
    ├── toCardViewModel(item, media) ← maps to display model
    └── renderFeaturedCards()       ← clones template, populates, appends to grid
```

```
Menu page route loads (/menu/)
    ↓
shared/public-navbar.js → mounts canonical navbar from homepage source
    ↓
src/data/menu.js      → getMenuItemsByCategory()
src/data/media.js     → media variants + prefetch helpers
    ↓
js/menu-page.js
    ├── renderMenu()                 ← renders 5 grouped tabs + items
    ├── updateActiveCategoryByScroll() ← scroll-synced active category state
    ├── scrollToCategory()           ← offset-aware scroll navigation
    └── renderRouteFromLocation()    ← list/detail subview switch from URL
```

## Full Menu Page (`/menu/`)

The route is item-driven but uses a fixed top-level navigation grouping:
- Visible tabs are always `Entradas`, `Pizzas`, `Postres`, `Bebidas`, `Productos`
- `Pizzas` merges items from `pizza` + `pizza_autor`
- `Bebidas` exists in the data layer and must remain renderable even with zero items
- Items still come from `getMenuItemsByCategory(categoryId)` preserving source order per source category

### Layout and Navigation

- Desktop: centered intro + centered Events-style top tabs above the content
- Tabs are static on scroll for now (non-sticky)
- Mobile: same top tabs visual system, allowed to overflow horizontally instead of using a drawer
- Active category can update from scroll position
- Each category section renders its own title and item grid
- Item detail uses a dynamic route (`/menu/?item=<id>`) inside the same page shell (no modal, no per-item HTML files)

### Card Parity with “Más pedidas”

- Reuses `.mas-pedidas-card` structure and CTA hierarchy
- Maintains premium dark visual language with route-local spacing rules
- Uses full-page grid targets: 4 columns desktop, 2 columns mobile

---

## Featured Item Selection

The featured items displayed on the homepage are determined by:

1. `home.json` → `popular.featuredIds` — an ordered array of menu item IDs
2. `home.json` → `popular.limit` — maximum items to display (capped at `HOME_FEATURED_LIMIT = 8`)
3. `menu.js` → `getFeaturedMenuItems({ featuredIds, limit })` — fetches items from `menu.json`, filters by IDs, applies limit

If no `featuredIds` are configured, the menu generator provides its own default selection.

---

## Card Rendering

Each featured item is rendered from the `#mas-pedidas-card-template`:

| Element | Class | Content |
|---------|-------|---------|
| Article | `.mas-pedidas-card` | Card container (gets `.is-unavailable` if sold out) |
| Base image | `.mas-pedidas-card__image--base` | Card image (lazy loaded) |
| Hover image | `.mas-pedidas-card__image--hover` | Alternate image on hover (lazy loaded, article gets `.has-hover-image`) |
| Title | `.mas-pedidas-card__title` | Item name |
| Description | `.mas-pedidas-card__description` | Short description |
| Price | `.mas-pedidas-card__price` | Formatted price (DOP) |
| Button | `.mas-pedidas-card__button` | "Detalles" — opens preview overlay |

### Image Resolution

For each item, `resolveItemMedia(item)` resolves paths from `media.json`:

| Variant | Source | Fallback |
|---------|--------|----------|
| `card` | `mediaApi.get(id, "card")` | `item.image` |
| `hover` | `mediaApi.get(id, "hover")` | None (hidden if missing or same as card) |
| `modal` | `mediaApi.get(id, "modal")` | Card image |
| `alt` | `mediaApi.getAlt(id)` | `item.name` |
| `gallery` | `mediaApi.getGallery(id)` | Empty array |

### Prefetching

- On **card hover** (`pointerenter`): Prefetches the modal image for that item
- On **page idle**: Prefetches modal and hover images for all featured items (via `requestIdleCallback` with 1.5s timeout)

---

## Preview Overlay

When a user clicks "Detalles" on a card, the **preview overlay** opens with an animated cover transition.

### Preview Content

The preview shows:
- **Image** — modal variant (or card fallback), with hover variant on pointer enter
- **Star rating** — hardcoded 5-star display
- **Title and price** — from item data
- **Description** — long description (or short if no long)
- **Availability badge** — "Disponible" or "No disponible" with sold-out reason
- **Ingredients list** — rendered via `ingredient-icon-row.js`
- **Action buttons** — availability status button (disabled) + "Cerrar" close button

### Cover Transition Animation

The open/close transition is a custom **SVG morphing cover** animation driven by `requestAnimationFrame`:

**Open sequence** (total ~2,900ms):
1. **Cover slide in** (900ms) — green cover slides up from bottom with SVG blob morph
2. **Page push** (1,000ms) — underlying page pushes up by 200px
3. **Preview activation** — preview card appears, slides up from 400px → 0
4. **Info morph** (1,450ms) — info panel scales from 0.6 → 1.0, border overlay shrinks from 100px → 0
5. **Cover slide out** (1,000ms) — cover exits upward with reverse blob morph

**Close sequence** — reverse of open: cover slides in → hide preview → reveal page

The animation uses:
- Two custom cubic-bezier easings (`easeCoverEnter`, `easeCoverLeave`)
- SVG path interpolation for blob morphing (`buildTopBlobPath()`, `buildBottomBlobPath()`)
- Web Animations API for info panel scale and border effects
- `prefers-reduced-motion` support: skips all animations, instant show/hide

### Key Animation Constants

| Constant | Value | Purpose |
|----------|-------|---------|
| `COVER_IN_DURATION_MS` | 900 | Cover entrance duration |
| `COVER_OUT_DURATION_MS` | 1,000 | Cover exit duration |
| `PREVIEW_RISE_DURATION_MS` | 1,000 | Card rise-up duration |
| `PREVIEW_INFO_SCALE_DURATION_MS` | 1,450 | Info panel scale animation |
| `PAGE_PUSH_Y_PX` | -200 | How far the page pushes up |
| `COVER_COLOR` | `#143f2b` | Cover fill color (dark green) |

---

## Card View Model

The `toCardViewModel(item, media)` function transforms raw data into a display-ready object:

```js
{
  id,              // Menu item ID
  slug,            // URL-safe slug
  title,           // item.name
  description,     // item.descriptionShort
  previewDescription, // item.descriptionLong || item.descriptionShort
  ingredients,     // Array of ingredient IDs
  reviews,         // Review count text
  price,           // item.priceFormatted (e.g., "RD$750")
  image,           // Card image path
  hoverImage,      // Hover image path (empty if same as card)
  modalImage,      // Modal image path (fallback: card)
  imageAlt,        // Alt text
  gallery,         // Array of gallery image paths
  available,       // Boolean (false = sold out)
  soldOutReason    // Reason text if unavailable
}
```
