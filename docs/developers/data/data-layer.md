# Data Layer

> **Read this doc when** working with JSON data in `data/`, validation contracts in `shared/`, or any code that reads/writes menu, ingredient, category, home, or restaurant data.

## Contents

- [Overview](#overview)
- [Data Files](#data-files) — menu, categories, ingredients, availability, home, restaurant, media, media-variants, media-report
- [Validation Contracts](#validation-contracts) — menu traits, menu allergens, menu sensory profile, ingredients, categories, restaurant, media
- [Data Flow](#data-flow) — from admin drafts to live site
- [Key Rules](#key-rules)

---

## Overview

The data layer consists of **9 JSON files** in `data/` that serve as the shared data store between the public website and the admin panel. These files are committed to Git and deployed statically. The admin panel modifies them through a publish pipeline (Netlify serverless function).

The shared layer now includes a central **Menu Traits V2** engine, a separate **Menu Allergens** derivation engine, a structured **Menu Sensory Profile** contract, plus validation contracts for ingredients, categories, restaurant, and media. These modules are used by both the admin panel (client-side validation before publish) and the publish pipeline (server-side validation before commit).

---

## Data Files

### `data/menu.json` — Menu Items

The primary menu data file. Contains all items grouped by section (category).

```
{
  "version": 5,
  "schema": "figata.menu.v5",
  "currency": "DOP",
  "taxIncluded": false,
  "sections": [
    {
      "id": "entradas",          // matches categories.json id
      "label": "Entradas",
      "items": [
        {
          "id": "berenjenas_parmesana",   // unique item identifier
          "name": "Berenjenas a la Parmesana",
          "slug": "berenjenas-parmesana", // URL-safe identifier
          "category": "entradas",        // parent section id
          "subcategory": "",             // optional grouping within section
          "descriptionShort": "",        // card view description
          "descriptionLong": "",         // modal/detail description
          "price": 550,                  // integer, in DOP
          "ingredients": ["berenjena", "salsa_de_tomate", ...],  // refs to ingredients.json
          "image": "assets/menu/entradas/berenjenas-a-la-parmesana.webp",  // primary image path
          "featured": false,             // appears in homepage featured section
          "allergen_overrides": {        // optional editorial exceptions over derived allergens
            "add": ["gluten"]
          },
          "trait_overrides": {           // optional editorial overrides (V2)
            "dietary": { "vegetarian": true },
            "content_flags": { "pork": false },
            "experience_tags": ["truffled"]
          },
          "sensory_profile": {           // optional structured sensory layer for detail view
            "summary": "Salado y aromatico, con cuerpo medio y final ligero.",
            "axes": {
              "dulce": { "value": 2 },
              "salado": { "value": 7 },
              "acido": { "value": 4 },
              "cremosa": { "value": 6 },
              "crujiente": { "value": 3 },
              "ligero": { "value": 8 },
              "aromatico": { "value": 8 },
              "intensidad": { "value": 5 }
            }
          },
          "available": true,             // runtime availability (also in availability.json)
          "reviews": "121 reseñas"       // optional social proof text
        }
      ]
    }
  ]
}
```

**Key relationships:**
- `sections[].id` corresponds to entries in `categories.json`
- `items[].ingredients` references keys in `ingredients.json → ingredients`
- `items[].id` is used as key in `media.json → items` and `availability.json → items`
- Dietary/content/experience traits are **derived at runtime** via `shared/menu-traits.js`; they are not persisted in `menu.json`
- Item allergens are **derived at runtime** via `shared/menu-allergens.js` from `ingredients[*].allergens`
- `items[].allergen_overrides` is the persisted exception surface for derived allergens
- `items[].trait_overrides` is the only persisted editorial override surface for derived item traits
- `items[].sensory_profile` is the structured detail-view sensory layer; it coexists with `experience_tags` and does not replace filters/chips

#### Structured Sensory Profile (`items[].sensory_profile`)

- Field is **optional during rollout**; when present it must be complete and render-ready
- Official fixed axes: `dulce`, `salado`, `acido`, `cremosa`, `crujiente`, `ligero`, `aromatico`, `intensidad`
- Scale is always integer `1..10`
- Shape is fixed as `summary + axes.<axisId>.value`
- `axes.<axisId>.explanation` is reserved for future per-attribute explanations/tooltips
- Grouping is global/system-level, not per-item:
  - `sabor` → `dulce`, `salado`, `acido`
  - `textura_cuerpo` → `cremosa`, `crujiente`, `ligero`
  - `caracter` → `aromatico`, `intensidad`
- Future sibling fields under `sensory_profile` may be added without replacing the base `summary + axes` contract, but `axes` itself only accepts the 8 official IDs

---

### `data/categories.json` — Category Ordering & Visibility

Controls the display order and visibility of menu sections.

```
{
  "version": 1,
  "schema": "figata.menu.categories.v1",
  "categories": [
    {
      "id": "entradas",       // must match a section id in menu.json
      "label": "Entradas",    // display name
      "order": 1,             // sort position (ascending)
      "visible": true         // false = hidden from public site
    }
  ]
}
```

**Validated by:** `shared/categories-contract.js`, `scripts/validate-categories.js`

---

### `data/ingredients.json` — Ingredient Catalog

The complete ingredient catalog including icons, V2 metadata, and allergens.

```
{
  "version": 3,
  "basePath": "/assets/Ingredients/",
  "allergens": {
    "milk": { "id": "milk", "label": "Lácteos" },
    ...
  },
  "icons": {
    "albahaca": {
      "icon": "/assets/Ingredients/albahaca.webp",   // WebP image path
      "label": "Albahaca",
      "covers": ["albahaca"]                          // ingredient ids this icon represents
    },
    ...
  },
  "ingredients": {
    "mozzarella": {
      "id": "mozzarella",
      "label": "Mozzarella",
      "icon": "mozzarella",           // key into icons{} above
      "aliases": ["mozz"],            // search aliases
      "metadata": {
        "dietary_profile": {
          "vegetarian_safe": true,
          "vegan_safe": false
        },
        "content_flags": [],
        "experience_signals": {
          "classic": 1,
          "fresh": 1
        },
        "internal_traits": ["fresh_cheese"]
      },
      "allergens": ["milk"]           // allergen ids
    },
    ...
  }
}
```

**Icon images** are stored in `assets/Ingredients/` as WebP files.

**Validated by:** `shared/ingredients-contract.js`, `scripts/validate-ingredients.js`

**Trait runtime:** `shared/menu-traits.js` reads `ingredients[*].metadata` to derive item dietary flags, content flags, experience scores, visible experience tags, and public badges.

**Allergen runtime:** `shared/menu-allergens.js` reads `ingredients[*].allergens` to derive final item allergens. `item.allergen_overrides` applies only as an exception over that automatic union. `gluten` added by override for pizzas/panes with implicit dough is a transitory/control-layer exception, not the ideal end-state model.

---

### `data/availability.json` — Item Availability

Per-item runtime availability status.

```
{
  "version": 1,
  "schema": "figata.menu.availability.v1",
  "settings": {
    "hideUnavailableItems": false    // if true, unavailable items are hidden (not just grayed)
  },
  "items": [
    {
      "itemId": "berenjenas_parmesana",   // must match menu.json item id
      "available": true,
      "soldOutReason": ""                 // shown to customer when unavailable
    }
  ]
}
```

---

### `data/home.json` — Homepage Configuration

Controls all dynamic sections of the public homepage.

```
{
  "version": 1,
  "schema": "figata.home.v1",
  "hero": {
    "title": "...",
    "subtitle": "...",
    "backgroundImage": "assets/home/seamless-bg.webp",
    "ctaPrimary": { "label": "Menú", "url": "/menu/" },
    "ctaSecondary": { "label": "...", "url": "..." }
  },
  "popular": {
    "title": "...",
    "subtitle": "...",
    "featuredIds": ["margherita", "diavola", ...],   // menu item ids
    "limit": 8
  },
  "events": { ... },
  "testimonials": {
    "items": [
      { "name": "...", "role": "...", "text": "...", "stars": 5, "image": "..." }
    ]
  },
  "footer": {
    "columns": [...],
    "cta": { ... },
    "socials": { "instagram": "...", "facebook": "...", ... }
  },
  "announcement": { ... },
  "delivery": { ... },
  "navbar": { "links": [...] }
}
```

**Read by:** `js/home-config.js` (public site) and admin home editor

**Validated by:** `scripts/validate_home_json.js`

---

### `data/restaurant.json` — Restaurant Metadata

Business information: name, phone, address, hours.

```
{
  "version": 1,
  "schema": "figata.restaurant.v1",
  "updatedAt": "2026-03-04T08:00:00.000Z",
  "name": "Figata Pizza & Wine",
  "brand": "Figata",
  "currency": "DOP",
  "phone": "+1 809-000-0000",
  "whatsapp": "https://wa.me/18090000000",
  "address": {
    "line1": "Calle Costa Rica No. 142",
    "city": "Santo Domingo Este",
    "country": "DO",
    ...
  },
  "openingHours": {
    "mon": null,              // null = closed
    "tue": "12:00-22:00",     // "HH:MM-HH:MM" format
    ...
  }
}
```

**Read by:** `js/restaurant-config.js` (public site)

**Validated by:** `shared/restaurant-contract.js`, `scripts/validate-restaurant.js`

---

### `data/media.json` — Media Assets Mapping

Maps visual assets (images and optional editorial videos) to entities, evolving from a flat schema to a `source + overrides` model. It also holds global site assets.

```
{
  "version": 1,
  "schema": "figata.media.v2",
  "updatedAt": "...",
  "updatedBy": "...",
  "notes": "...",
  "global": {
    "homepage": {
      "heroBackground": "assets/home/seamless-bg.webp",
      "featuredBackground": "assets/home/seamless-bg.webp"
    },
    "branding": {
      "logo": "assets/logo.svg",
      "favicon": "assets/favicon.ico"
    },
    "utility": {
      "placeholder": "assets/menu/placeholders/card.svg",
      "fallbackImage": "assets/menu/placeholders/modal.svg"
    }
  },
  "defaults": {
    "card": "assets/menu/placeholders/card.svg",
    "modal": "assets/menu/placeholders/modal.svg",
    "hover": "assets/menu/placeholders/card.svg",
    "alt": "Imagen del producto Figata"
  },
  "items": {
    "berenjenas_parmesana": {
      "source": "assets/menu/berenjenas.webp",
      "alt": "Berenjenas a la parmesana gratinadas",
      "overrides": {
        "card": "",
        "hover": "assets/menu/hover/berenjenas-hover.webp",
        "modal": "",
        "gallery": []
      },
      "dominantColor": "",
      "version": 2
    }
  }
}
```

The system uses `source` by default, but falls back to the `overrides` dictionary to specify distinct visual intents (not merely resolutions) for contexts like card or modal.
**Validated by:** `shared/media-contract.js`, `scripts/validate_media_json.js`

#### Editorial Detail Slides (`overrides.editorialSlides` + `overrides.gallery`)

- `items[<itemId>].overrides.editorialSlides` is an optional typed list for mixed editorial media in detail view.
- Supported slide types:
  - `image`: `{ "type": "image", "src": "assets/menu/editorial/<id>-slide-0.webp" }`
  - `video`: `{ "type": "video", "poster": "...", "sources": [{ "src": "...webm", "type": "video/webm" }, { "src": "...mp4", "type": "video/mp4" }] }`
- Use only real sources; if mp4 fallback is not available yet, keep only the valid webm source.
- `items[<itemId>].overrides.gallery` remains supported as the legacy image-only list.
- Runtime priority in `/menu/<item-id>` detail view:
  1. `media.items[itemId].overrides.editorialSlides` (if non-empty)
  2. `media.items[itemId].overrides.gallery` (if non-empty)
  3. Auto-detected assets by naming convention
  4. Catalog image fallback (`modal`/`card`)
- Auto-detection convention (progressive, no required JSON edit):
  - Folder: `assets/menu/editorial/`
  - Pattern: `<item-id>-slide-<n>.webp` (also accepts underscore/hyphen equivalent; e.g. `aperol_spritz` ↔ `aperol-spritz`)
  - Example: `assets/menu/editorial/margherita-slide-0.webp`
- Detection is contiguous from `slide-0` forward; first missing index stops detection.
- This keeps editorial support optional: items without editorial slides continue using the existing catalog flow.

---

### `data/media-variants.json` — Media Variant Specs

Defines the expected dimensions and formats for each media variant type.

```
{
  "version": 1,
  "schema": "figata.media.variants.v1",
  "variants": {
    "card":    { "aspectRatio": "4/3", "maxWidth": 900,  "recommendedFormat": "webp" },
    "modal":   { "aspectRatio": "1/1", "maxWidth": 1800, "recommendedFormat": "webp" },
    "hover":   { "aspectRatio": "4/3", "maxWidth": 900,  "recommendedFormat": "webp" },
    "gallery": { "aspectRatio": "4/3", "maxWidth": 1800, "recommendedFormat": "webp" }
  }
}
```

---

### `data/media-report.json` — Media Audit Report

Generated report tracking media coverage, missing variants, and broken paths. Not manually edited.

---

## Validation Contracts

### `shared/menu-traits.js`

Exports the Menu Traits V2 engine used by both the public site and the admin panel. It provides:
- Ingredient metadata normalization (`dietary_profile`, `content_flags`, `experience_signals`, `internal_traits`)
- Item trait derivation (`dietary`, `content_flags`, `experience_scores`, `experience_tags`)
- Editorial override normalization (`trait_overrides`)
- Public badge generation with per-group visibility limits
- `validateMenuPayload()` for `data/menu.json`

### `shared/menu-allergens.js`

Exports the allergen derivation/validation engine used by both the public site and the admin panel. It provides:
- Automatic allergen derivation from `ingredients[*].allergens`
- Editorial override normalization (`allergen_overrides.add/remove`)
- Source tracing (`sources_by_allergen`) for the admin panel
- `validateMenuAllergens()` for `data/menu.json`

### `shared/menu-sensory.js`

Exports the structured sensory profile contract used by the public runtime, the admin validator, the CLI validator, and the publish pipeline. It provides:
- The official schema metadata for the new detail-view sensory system (`scale`, `groups`, `axes`)
- Empty-profile scaffolding for future editors/UI
- Structured normalization for `item.sensory_profile`
- Completeness checks for render-ready profiles
- `validateMenuSensoryProfiles()` for `data/menu.json`

### `shared/ingredients-contract.js`

Exports a validation function used by both the admin panel and the publish pipeline. Checks:
- Required fields on each ingredient (`id`, `label`, `icon`)
- Valid allergen references
- Valid V2 metadata shape for each ingredient
- Icon path resolution
- Alias format rules
- Cross-reference integrity between ingredients, icons, allergens, and menu ingredient usage

### `shared/categories-contract.js`

Validates the categories data structure. Checks:
- Required fields (`id`, `label`, `order`, `visible`)
- Unique IDs
- Valid order values
- Cross-reference with menu sections

Both contracts used by:
- `admin/app/app.js` → `validateIngredientsDraftData()`, `validateCategoriesDraftData()`
- `netlify/functions/publish.js` → server-side validation before Git commit
- `scripts/validate-ingredients.js`, `scripts/validate-categories.js` → CLI validation

---

## Data Flow

```mermaid
flowchart TD
  A["Admin Panel (browser)"] -->|edits| B["state.drafts (in memory)"]
  B -->|user clicks Publish| C["publish.js (client)"]
  C -->|validates via shared contracts| C
  C -->|POST JSON payload| D["publish.js (server)"]
  D -->|validates again| D
  D -->|commits changed files| E["GitHub API"]
  E -->|new commit triggers| F["Netlify auto-deploy"]
  F -->|serves updated| G["data/*.json"]
  G -->|fetched by| H["Public site JS<br/>(home-config, mas-pedidas, menu-page, restaurant-config)"]
```

---

## Key Rules

1. **Never remove a `version` or `schema` field** from any data file.
2. **Item IDs must be unique** across all sections in `menu.json`.
3. **Ingredient IDs, icon IDs, and allergen IDs** must be unique within their respective objects in `ingredients.json`.
4. **Category IDs in `categories.json`** must match section IDs in `menu.json`.
5. **All prices are integers** in DOP (Dominican Peso). No decimals. No currency symbol in the data.
6. **Image paths** are relative to the repo root. Menu images go in `assets/menu/`. Ingredient icons go in `assets/Ingredients/`.
7. **Derived menu traits are not persisted** as free-form `item.tags`; they come from `ingredients[*].metadata` plus optional `item.trait_overrides`.
8. **Derived menu allergens are not persisted** as `item.allergens`; they come from `ingredients[*].allergens` plus optional `item.allergen_overrides`.
9. **Structured sensory profiles live in `item.sensory_profile`** and do not replace the existing traits/experience tag system used for filters and badges.
10. **When `item.sensory_profile` exists**, it must include a non-empty `summary` plus all 8 official axes as `axes.<axisId>.value` integers from `1` to `10`.
11. **Public data loaders must fetch from site root** (`/data/*.json`) so nested routes (for example `/menu/`) resolve JSON correctly.
