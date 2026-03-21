# Build Tools and Scripts

> **Read this doc when** running the dev server, using validation scripts, or working with any file in `scripts/`, `package.json`, or `netlify.toml`.

---

## Overview

The Figata repository has **no build step** for production. The public site and admin panel are deployed as-is to Netlify. All tooling is for **local development**, **data validation**, and **analysis**.

| Aspect | Details |
|--------|---------|
| Dev server | `scripts/dev-server.js` (Node.js HTTP server) |
| Validation | 5 validation scripts in `scripts/` |
| Analysis | `check_admin_ui.js`, `dynamic_probe.js` |
| Package manager | npm (`package.json`) |
| Runtime dependency | playwright (used for analysis/testing, not production) |

---

## npm Scripts

From `package.json`:

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `node scripts/dev-server.js` | Start local development server |
| `validate:home` | `node scripts/validate_home_json.js` | Validate `data/home.json` |
| `validate:media` | `node scripts/validate_media_json.js` | Validate `data/media.json` |
| `validate:ingredients` | `node scripts/validate-ingredients.js` | Validate `data/ingredients.json` |
| `validate:categories` | `node scripts/validate-categories.js` | Validate `data/categories.json` |
| `validate:restaurant` | `node scripts/validate_restaurant_json.js` | Validate `data/restaurant.json` |
| `check:admin-ui` | `node scripts/check_admin_ui.js` | Check admin UI element IDs |

---

## Dev Server (`scripts/dev-server.js`)

A lightweight Node.js HTTP server (297 lines, zero external dependencies).

### Usage

```bash
npm run dev
# → Homepage running at http://127.0.0.1:5173
```

Environment variables:
- `HOST` — default `127.0.0.1`
- `PORT` — default `5173`

### Features

| Feature | Details |
|---------|---------|
| **Static file serving** | Serves all files from repo root with correct MIME types |
| **Directory index** | Serves `index.html` for directory requests (e.g., `/admin/app/`) |
| **Path safety** | Validates all paths stay within repo root (prevents traversal) |
| **Streaming** | Uses `fs.createReadStream()` for efficient file delivery |

### Special Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/__local/save-drafts` | POST | Write draft data directly to `data/*.json` files |
| `/__local/menu-media-paths` | GET | List all WebP/SVG files in `assets/menu/` |

#### `/__local/save-drafts`
Accepts JSON body with keys: `menu`, `availability`, `home` (required), plus optional `ingredients`, `categories`, `media`. Writes each key's value as pretty-printed JSON to the corresponding `data/*.json` file.

Body size limit: 5 MB.

#### `/__local/menu-media-paths`
Returns `{ root: "assets/menu", paths: [...] }` — a sorted list of all `.webp` and `.svg` files under `assets/menu/`, with paths relative to repo root. Used by the admin panel's media picker to show available images.

### MIME Types Supported

`.html`, `.css`, `.js`, `.json`, `.svg`, `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.ico`, `.woff`, `.woff2`

---

## Validation Scripts

All validators read a `data/*.json` file and check its structure against expected rules. They exit with code 0 on success, non-zero on failure. Output goes to stdout.

### `scripts/validate-ingredients.js` (62 lines)

Uses `shared/ingredients-contract.js` to validate `data/ingredients.json`.

```bash
npm run validate:ingredients
```

Checks: required fields, valid icon/tag/allergen references, alias format, cross-reference integrity.

### `scripts/validate-categories.js` (61 lines)

Uses `shared/categories-contract.js` to validate `data/categories.json`.

```bash
npm run validate:categories
```

Checks: required fields, unique IDs, valid order values, cross-reference with menu sections.

### `scripts/validate_home_json.js` (441 lines)

Standalone validator for `data/home.json`. The largest validator.

```bash
npm run validate:home
```

Checks: hero section structure, popular section (featured IDs exist in menu), events structure, testimonials structure, footer columns/links/socials, delivery platforms, navbar links, announcement structure.

### `scripts/validate_media_json.js` (264 lines)

Validates `data/media.json` against `data/menu.json` and file system.

```bash
npm run validate:media
```

Checks: all menu items have media entries, all media items reference valid menu items, variant completeness (card/hover/modal), broken file paths, duplicate paths.

### `scripts/validate_restaurant_json.js` (179 lines)

Validates `data/restaurant.json` structure.

```bash
npm run validate:restaurant
```

Checks: required fields (name, phone, address, opening hours), opening hours format, address completeness.

---

## Analysis Scripts

### `scripts/check_admin_ui.js` (63 lines)

Scans `admin/app/index.html` for element IDs and cross-references them with `admin/app/app.js` to find:
- IDs referenced in JS but missing from HTML
- IDs in HTML but never referenced in JS

```bash
npm run check:admin-ui
```

### `scripts/dynamic_probe.js` (245 lines)

Runtime analysis tool using Playwright. Loads the admin panel in a headless browser and:
- Inventories all registered modules on `window.FigataAdmin`
- Lists all exported functions per module
- Checks for naming conflicts
- Reports the state object shape

Requires Playwright to be installed (`npm install`).

```bash
node scripts/dynamic_probe.js
```

---

## Netlify Configuration (`netlify.toml`)

Controls caching and deployment behavior. Key settings:

| Rule | Path pattern | Cache-Control |
|------|-------------|---------------|
| Static assets | `/assets/*`, `/menu/*`, `/fonts/*`, `/assets/fonts/*` | `public, max-age=31536000, immutable` (1 year) |
| JS/CSS | `/js/*`, `/styles.css`, `/admin/app/*.css`, `/admin/app/*.js` | `public, max-age=31536000, immutable` (1 year) |
| Data files | `/data/*.json` | `public, max-age=0, must-revalidate` (always fresh) |

Data JSON files are explicitly set to never cache, so that published changes are immediately visible.

No build command is configured — Netlify serves the repo contents directly.

The Netlify function at `netlify/functions/publish.js` is auto-detected from the conventional `netlify/functions/` directory.
