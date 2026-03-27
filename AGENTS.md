# AGENTS.md

> **Read this file first before any work in this repository.**

## Project Overview

**Figata** is a restaurant website for an Italian pizza & wine restaurant in Santo Domingo, Dominican Republic. The project has two main systems:

1. **Public website** — A static HTML/CSS/JS site served in production by Cloudflare Pages and also deployable to Netlify or GitHub Pages for fallback/preview workflows. Customers see the homepage, menu, events landing page, and restaurant info.
2. **Admin panel** — A custom single-page application at `/admin/app/` used by staff to manage menu items, ingredients, categories, homepage content, and publish changes.

Both systems share a **data layer** (JSON files in `data/`) and are connected through a **publish pipeline** (Netlify serverless function that commits data changes via Git).

| Aspect | Details |
|--------|---------|
| Language | Vanilla JavaScript (no TypeScript, no framework) |
| Styling | Vanilla CSS |
| Build | No build step for production; dev server via `npm run dev` |
| Hosting | Public site: Cloudflare Pages (primary), Netlify + GitHub Pages (fallback/preview); Admin/auth/publish: Netlify |
| Auth | Netlify Identity (admin panel only) |
| Tests | Validation scripts + menu traits/allergen smoke tests (`npm run validate:*`, `npm test`) |

---

## Repository Map

```
website-figata/
├── AGENTS.md                  ← You are here
├── .github/
│   └── workflows/
│       └── github-pages.yml   ← GitHub Pages deploy workflow for the public site
├── _headers                   ← Cloudflare Pages custom cache headers
├── _redirects                 ← Cloudflare Pages deep-link rewrites for `/menu/:item`
├── 404.html                   ← GitHub Pages fallback redirect for public deep links
├── index.html                 ← Public homepage (single-page, ~3,500 lines)
├── menu/
│   ├── index.html             ← Public full menu page (`/menu/`)
│   └── menu-page.css          ← Public full menu page styles
├── eventos/
│   ├── index.html             ← Public Pizza Party editorial landing (`/eventos/`)
│   └── eventos.css            ← Events landing styles
├── styles.css                 ← Public site styles (~2,600 lines)
├── js/                        ← Public site JavaScript (13 scripts)
│   ├── home-config.js            Fetches data/home.json, renders homepage sections
│   ├── mas-pedidas.js            Menu rendering engine (largest: 34KB)
│   ├── menu-route-transition.js  Home navbar `/menu/` transition handoff
│   ├── menu-page.js              Full menu page renderer (Events-style top tabs + category grids)
│   ├── menu-page-navbar.js       `/menu/` sticky-menu enhancer for the shared navbar
│   ├── eventos-page.js           `/eventos/` enhancer (cotizador Pizza Party + modal variedades, FAQ, hero video, media rail, navbar burger/menu mobile)
│   ├── restaurant-config.js      Restaurant info (hours, address, phone)
│   ├── testimonials.js           Testimonials carousel
│   ├── events-tabs.js            Events section tabs
│   ├── feature-tabs.js           Feature highlights tabs
│   ├── navbar-collapse.js        Mobile navbar behavior
│   ├── reload-cover.js           Page reload overlay
│   └── home-lazy-images.js       Lazy image loading
├── data/                      ← Shared data layer (9 JSON files)
│   ├── menu.json                 Menu items grouped by section
│   ├── categories.json           Category ordering and visibility
│   ├── ingredients.json          Ingredient catalog, icons, metadata V2, allergens
│   ├── availability.json         Per-item availability status
│   ├── home.json                 Homepage configuration (hero, featured, events, etc.)
│   ├── restaurant.json           Restaurant metadata
│   ├── media.json                Per-item media variants (card, modal, hover)
│   ├── media-report.json         Media audit report (generated)
│   └── media-variants.json       Media variant specifications
├── admin/
│   ├── app/                   ← Admin panel SPA
│   │   ├── index.html            Admin HTML shell (~1,100 lines)
│   │   ├── app.js                Main application logic (~9,765 lines)
│   │   ├── modules/              16 extracted modules + native panel modules
│   │   │   └── panels/           Native custom panels (`restaurant-panel.js`, `media-panel.js`, `pages-panel.js`)
│   │   └── styles.css            Admin-specific CSS
│   └── cms/                   ← Netlify CMS config (rarely used)
├── shared/                    ← Shared validators + public runtime modules
│   ├── figata-cover-transition.js Shared cover transition engine (route + modal)
│   ├── menu-traits.js            Menu Traits V2 derivation + validation engine
│   ├── menu-allergens.js         Menu allergen derivation + validation engine
│   ├── menu-sensory.js           Structured sensory profile schema + validation engine
│   ├── public-paths.js           Shared site-base/path helper for root + GitHub Pages subpath hosting
│   ├── public-navbar.js          Canonical public navbar loader/cache bridge for multi-route pages
│   ├── public-scroll-indicator.css Overlay root scrollbar hide + progress meter styles
│   ├── public-scroll-indicator.js  Native-scroll progress meter runtime for public routes
│   ├── ingredients-contract.js   Ingredient data validation
│   ├── categories-contract.js    Category data validation
│   ├── restaurant-contract.js    Restaurant data validation
│   └── media-contract.js         Media data validation + helpers
├── netlify/
│   └── functions/
│       └── publish.js         ← Serverless function: commits data via Git
├── scripts/                   ← Dev tools and validation scripts
│   ├── dev-server.js             Local dev server with media endpoint
│   ├── validate-menu.js          Validates menu.json against Menu Traits V2
│   ├── validate-ingredients.js   Validates ingredients.json
│   ├── validate-categories.js    Validates categories.json
│   ├── validate_home_json.js     Validates home.json
│   ├── validate_media_json.js    Validates media.json
│   ├── validate-restaurant.js    Validates restaurant.json
│   ├── check_admin_ui.js         Checks admin UI element IDs
│   ├── test-menu-traits.js       Smoke tests for derived dietary/content/experience traits
│   ├── test-menu-allergens.js    Smoke tests for derived item allergens + overrides
│   └── dynamic_probe.js          Runtime analysis tool
├── assets/                    ← Static assets (images, icons, SVGs)
│   ├── menu/                     Menu item images (WebP) by category + placeholders
│   ├── Ingredients/              Ingredient icon images (WebP)
│   ├── home/                     Homepage assets
│   ├── reviews/                  Testimonial avatars
│   └── svg-icons/                UI icon SVGs
├── src/                       ← Source generators (build-time)
│   ├── data/                     Data generator scripts (menu, home, media, etc.)
│   └── ui/                       UI component generators
├── netlify.toml               ← Netlify deploy config + headers for Netlify runtime
├── package.json               ← npm scripts (dev, validate:*)
└── docs/                      ← Documentation
    └── developers/               Developer/agent documentation
```

---

## Documentation Index

| Document | Path | Read when... |
|----------|------|-------------|
| **This file** | `AGENTS.md` | Always. Start every task here. |
| **Data Layer** | `docs/developers/data/data-layer.md` | Working with JSON data, schemas, contracts, or validation |
| **Admin Panel** | `docs/developers/admin/admin-panel.md` | Working on the admin SPA, its modules, state, routing, or editors |
| **Admin Modules** | `docs/developers/admin/admin-modules.md` | Modifying a specific admin module, understanding module APIs or ctx shapes |
| **Admin State** | `docs/developers/admin/admin-state.md` | Debugging state issues, understanding element/view refs, or adding state properties |
| **Admin Routing** | `docs/developers/admin/admin-routing.md` | Modifying routes, adding panels, debugging navigation or transitions |
| **Admin Editors** | `docs/developers/admin/admin-editors.md` | Working on editor panels (menu browser, item editor, homepage, ingredients, categories) |
| **Public Site** | `docs/developers/public/public-site.md` | Working on `index.html`, `styles.css`, `js/`, or public-facing layout/content |
| **Homepage Config** | `docs/developers/public/homepage-config.md` | Modifying how `data/home.json` drives the public homepage sections |
| **Menu System** | `docs/developers/public/menu-system.md` | Working on featured items display, preview overlay, or menu card rendering |
| **Assets & Media** | `docs/developers/public/assets-and-media.md` | Adding images/icons, working with `data/media.json`, or debugging broken media |
| **Publish Pipeline** | `docs/developers/workflows/publish-pipeline.md` | Working on publishing, Netlify function, or deploy flow |
| **Build & Scripts** | `docs/developers/tooling/build-and-scripts.md` | Dev server, validation scripts, npm commands, or Netlify config |

---

## Task Routing

Use this table to find the right starting point for common tasks:

| Task type | Start with | Key files |
|-----------|-----------|-----------|
| Fix public site layout/content | `index.html`, `styles.css` | Relevant `js/` script |
| Modify homepage sections | `js/home-config.js` | `data/home.json`, `docs/developers/data/data-layer.md` |
| Change public menu display | `js/mas-pedidas.js` | `data/menu.json`, `data/media.json` |
| Build/fix public full menu page | `menu/index.html`, `menu/menu-page.css`, `js/menu-page.js` | `js/menu-page-navbar.js`, `src/data/menu.js`, `src/data/media.js`, `data/categories.json` |
| Build/fix public eventos landing page | `eventos/index.html`, `eventos/eventos.css`, `js/eventos-page.js` | `data/menu.json`, `shared/public-navbar.js`, `shared/public-paths.js` |
| Reuse/fix public navbar across routes | `shared/public-navbar.js` | `index.html`, `menu/index.html`, `js/navbar-collapse.js` |
| Edit restaurant info | `js/restaurant-config.js` | `data/restaurant.json` |
| Work on admin panel | `docs/developers/admin/admin-panel.md` | `admin/app/app.js`, `admin/app/modules/` |
| Work on native Restaurant/Media/Pages panels | `docs/developers/admin/admin-editors.md` | `admin/app/modules/panels/restaurant-panel.js`, `admin/app/modules/panels/media-panel.js`, `admin/app/modules/panels/pages-panel.js` |
| Fix admin sidebar / navigation | `admin/app/modules/sidebar.js` | `navigation.js`, `accordion.js`, `panels.js` |
| Change admin command palette | `admin/app/modules/command-palette.js` | — |
| Modify data schemas | `docs/developers/data/data-layer.md` | `data/*.json`, `shared/*.js` |
| Change publish behavior | `netlify/functions/publish.js` | `admin/app/modules/publish.js` |
| Run validation | `package.json` scripts | `scripts/validate-*.js` |
| Run dev server | `npm run dev` | `scripts/dev-server.js` |
| Add/modify admin CSS | `admin/app/styles.css` | `admin/app/index.html` |
| Work with ingredient icons | `data/ingredients.json` | `assets/Ingredients/`, `admin/app/modules/render-utils.js` |

---

## Development Workflow

### Local Development

```bash
npm run dev
```

This starts a local server (`scripts/dev-server.js`) that:
- Serves the site at `http://127.0.0.1:5173`
- Provides a media listing endpoint at `/_api/media-options`
- Supports the admin panel at `/admin/app/`

### Admin Dev Login

Open the admin panel with the dev auth bypass:
```
http://127.0.0.1:5173/admin/app/?devAuthBypass=1
```

### Validation Scripts

```bash
npm run validate:home          # validates data/home.json
npm run validate:media         # validates data/media.json
npm run validate:menu          # validates data/menu.json
npm run validate:ingredients   # validates data/ingredients.json
npm run validate:categories    # validates data/categories.json
npm run validate:restaurant    # validates data/restaurant.json
npm run check:admin-ui         # checks admin UI element IDs
npm test                       # smoke tests for Menu Traits V2 + Menu Allergens
```

### Deployment

The public site can deploy in three ways:
- Cloudflare Pages serves the public production site, using `_redirects` for `/menu/:item` deep-link rewrites and `_headers` for cache policy.
- Netlify serves the full stack (static site + Netlify Identity + serverless publish function) when that environment is available.
- GitHub Pages publishes the public site only through `.github/workflows/github-pages.yml` on push to `master`, packaging the static files into a Pages artifact and using `404.html` to recover deep public routes such as `/menu/:item`.

The admin panel's publish function still depends on Netlify via `netlify/functions/publish.js`.

---

## Conventions and Patterns

### Admin Module Pattern

The admin panel uses a **namespace + IIFE + delegate** pattern:

1. Each module is wrapped in an IIFE and registers itself on `window.FigataAdmin`:
   ```js
   (function () {
     var ns = window.FigataAdmin = window.FigataAdmin || {};
     // ... functions ...
     ns.moduleName = { exportedFunction: exportedFunction };
   })();
   ```

2. In `app.js`, the original function is replaced with a **delegate** that calls the module:
   ```js
   var MOD = window.FigataAdmin.moduleName;
   function originalFunctionName(args) { return MOD.exportedFunction(ctx, args); }
   ```

3. Functions that need access to `state`, `elements`, or other functions receive a **ctx object** built by a lazy factory (e.g., `_sbCtx()`, `_acCtx()`, `_pnCtx()`).

### Script Loading Order

Admin modules must load **before** `app.js` in `admin/app/index.html`. Current order:
`constants` → `utils` → `auth` → `drafts` → `publish` → `navigation` → `command-palette` → `sidebar` → `accordion` → `panels` → `render-utils` → `menu-media` → `dashboard` → `panels/restaurant-panel` → `panels/media-panel` → `panels/pages-panel` → `app.js`

Shared runtime helpers used by traits/validation must load before their consumers:
`shared/menu-traits.js` + `shared/menu-allergens.js` + `shared/menu-sensory.js` → contracts/data loaders → feature scripts.

On public routes, `shared/public-paths.js` must load before other route scripts that resolve site-relative URLs or parse the current pathname.

On `/menu/`, route scripts must load in this order:
`shared/public-paths.js` → `shared/public-navbar.js` → `js/navbar-collapse.js` → `js/menu-page.js` → `js/menu-page-navbar.js`

The shared public scroll indicator is optional and should be loaded after the route's primary public scripts so it can measure the final document scroll state without affecting route initialization:
`shared/public-scroll-indicator.css` in the page `<head>` and `shared/public-scroll-indicator.js` near the end of the public script list.

### Data Conventions

- Menu images use **WebP** format, stored in `assets/menu/` with category subfolders:
  `entradas/`, `pizzas/clasica/`, `pizzas/autor/`, `postres/`, `productos/`
- Placeholder images are **SVG**, stored in `assets/menu/placeholders/`
- Ingredient icons are **WebP**, stored in `assets/Ingredients/`
- All data files use `version` and usually `schema` fields for forward compatibility
- Currency is `DOP` (Dominican Peso)

---

## Documentation Maintenance Rules

> **These rules are mandatory. Every agent and developer must follow them.**

### When to update documentation

Documentation **must** be updated whenever a change affects:

| Change type | Update required |
|-------------|----------------|
| New file or directory added | Update `AGENTS.md` repo map + relevant domain doc |
| File deleted or renamed | Update `AGENTS.md` repo map + all docs referencing it |
| New admin module extracted | Update `docs/developers/admin/admin-panel.md` module table |
| Admin state shape changed | Update `docs/developers/admin/admin-panel.md` state section |
| New route added to admin | Update `docs/developers/admin/admin-panel.md` routing section |
| Data JSON schema changed | Update `docs/developers/data/data-layer.md` |
| New validation contract | Update `docs/developers/data/data-layer.md` |
| New npm script added | Update `AGENTS.md` workflow section |
| Publish pipeline changed | Update relevant publish doc when it exists |
| Script loading order changed | Update `AGENTS.md` conventions section |

### How to update

1. **Before completing any task**, check whether your changes require documentation updates.
2. If a doc is found to be inaccurate during work, **fix it as part of the current task**.
3. Prefer **stable references** (file paths, function names, module names). Never use line numbers in docs.
4. Keep docs **concise and structured**. Use tables and bullet points, not long prose.

### If in doubt, update

A small unnecessary update costs far less than stale documentation.

---

## Known Technical Debt

- `admin/app/app.js` is still ~9,765 lines. A multi-phase refactor (Plan 2, Phases 13-22) is planned but not yet started.
- No automated test suite exists. Validation scripts check data schemas only.
- Some admin functions have high coupling to DOM elements and cross-cutting state.
- The public `index.html` is ~3,500 lines of inline HTML with no templating.
- Existing `docs/admin-ui-standards.md` and `docs/cms-publish.md` are legacy files that will be superseded in Phase B.
