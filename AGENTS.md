# AGENTS.md

> **Read this file first before any work in this repository.**

## Project Overview

**Figata** is a restaurant website for an Italian pizza & wine restaurant in Santo Domingo, Dominican Republic. The project has two main systems:

1. **Public website** — A static HTML/CSS/JS site served in production and preview by Cloudflare Pages. Customers see the homepage, menu, events landing page, nosotros/about page, the live reservations flow, and restaurant info.
2. **Admin panel** — A custom single-page application at `/admin/app/` used by staff to manage menu items, ingredients, categories, homepage content, and publish changes.

Both systems share a **data layer** (JSON files in `data/`) and are connected through a **Cloudflare-backed publish pipeline** that commits data changes via GitHub.

| Aspect | Details |
|--------|---------|
| Language | Vanilla JavaScript (no TypeScript, no framework) |
| Styling | Vanilla CSS |
| Build | Static source + Cloudflare packaging scripts (`npm run build:cloudflare`); local dev via `npm run dev` |
| Hosting | Public site + Admin + jobs: Cloudflare Pages/Workers |
| Auth | Cloudflare Access + Google allowlist (admin panel only) |
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
├── ig/
│   └── index.html             ← Vanity Instagram entry path that redirects into the menu campaign flow
├── qr/
│   └── index.html             ← Vanity in-store QR entry path that redirects into the menu campaign flow
├── wsp/
│   └── index.html             ← Vanity WhatsApp/share entry path that redirects into the menu campaign flow
├── eventos/
│   ├── index.html             ← Public Pizza Party editorial landing (`/eventos/`)
│   └── eventos.css            ← Events landing styles
├── nosotros/
│   ├── index.html             ← Public About/brand story landing (`/nosotros/`)
│   └── nosotros.css           ← Nosotros route styles + entry loader visuals
├── reservas/
│   ├── index.html             ← Public reservations flow (`/reservas/`)
│   └── reservas.css           ← Reservations route styles (homepage hero + public navbar + dark single-step flow UI)
├── styles.css                 ← Public site styles (~2,600 lines)
├── js/                        ← Public site JavaScript (20 scripts)
│   ├── home-config.js            Fetches data/home.json, renders homepage sections
│   ├── home-featured.js          Homepage featured-cards renderer (mobile-first, reads the derived data/home-featured.json payload)
│   ├── mas-pedidas.js            Desktop-only featured preview overlay enhancer
│   ├── menu-route-transition.js  Shared public same-document transition binder for home/menu/eventos
│   ├── nosotros-route-transition.js Isolated `/nosotros/` transition binder (keeps one live overlay, preloads route markup, then swaps to `/nosotros/` in-document before pushState fallback)
│   ├── nosotros-lottie-runtime.js    Shared `/nosotros/` Lottie JSON bootstrap + mount helper used by source/destination loaders
│   ├── menu-page.js              Full menu page renderer (Events-style top tabs + category grids, funnel + editorial decision analytics)
│   ├── menu-page-navbar.js       `/menu/` sticky-menu enhancer for the shared navbar
│   ├── public-burger-menu.js     Lightweight burger/menu runtime used by the homepage mobile navbar
│   ├── eventos-page.js           `/eventos/` enhancer (cotizador Pizza Party + modal variedades, FAQ, hero video, media rail, route-local burger/menu mobile)
│   ├── nosotros-entry-loader.js  `/nosotros/` hard-navigation entry loader fallback + self-hosted Lottie runtime bridge
│   ├── nosotros-page.js          `/nosotros/` reveal/interaction enhancer
│   ├── reservas-page.js          `/reservas/` single-step-at-a-time reservation flow with live availability by zone, real submit, and Lottie-backed success confirmation
│   ├── restaurant-config.js      Restaurant info (hours, address, phone)
│   ├── testimonials.js           Testimonials carousel
│   ├── events-tabs.js            Events section tabs
│   ├── feature-tabs.js           Feature highlights tabs
│   ├── navbar-collapse.js        Mobile navbar behavior
│   └── home-lazy-images.js       Lazy image loading
├── data/                      ← Shared data layer (11 JSON files)
│   ├── menu.json                 Menu items grouped by section
│   ├── categories.json           Category ordering and visibility
│   ├── ingredients.json          Ingredient catalog, icons, metadata V2, allergens
│   ├── availability.json         Per-item availability status
│   ├── home.json                 Homepage configuration (hero, featured, events, etc.)
│   ├── home-featured.json        Generated homepage featured-card payload derived from home/menu/media/availability/ingredients
│   ├── restaurant.json           Restaurant metadata
│   ├── reservations-config.json  Reservation rules/config for `/reservas/` (zones, service windows, booking rules, slot limits, UI copy)
│   ├── media.json                Per-item media variants (card, modal, hover, optional inline lqip)
│   ├── media-report.json         Media audit report (generated)
│   └── media-variants.json       Media variant specifications
├── admin/
│   ├── app/                   ← Admin panel SPA
│   │   ├── index.html            Admin HTML shell (~1,100 lines)
│   │   ├── app.js                Main application logic (~9,765 lines)
│   │   ├── modules/              16 extracted modules + native panel modules
│   │   │   └── panels/           Native custom panels (`restaurant-panel.js`, `media-panel.js`, `pages-panel.js`)
│   │   └── styles.css            Admin-specific CSS
│   └── cms/                   ← Archived legacy CMS shell (not included in Cloudflare deploys)
├── shared/                    ← Shared validators + public runtime modules
│   ├── menu-traits.js            Menu Traits V2 derivation + validation engine
│   ├── menu-allergens.js         Menu allergen derivation + validation engine
│   ├── menu-sensory.js           Structured sensory profile schema + validation engine
│   ├── analytics-config.js       Analytics architecture constants, route registry, environment resolution
│   ├── analytics-taxonomy.js     Canonical analytics event/property dictionary shared by runtime + validators
│   ├── analytics-contract.js     Analytics payload contract + idempotency validation helpers
│   ├── analytics-governance.js   Analytics privacy, retention, traffic-class, and sampling rules
│   ├── analytics-identity.js     Persistent visitor/session identity helpers shared by the SDK
│   ├── analytics-attribution.js  UTM, referrer, vanity-path, and visit-context resolution helpers
│   ├── analytics-internal.js     Internal/QA/development traffic exclusion and classification helpers
│   ├── analytics-sdk.js          Shared public analytics SDK (queue, batching, flush, contract enforcement)
│   ├── analytics-performance.js  Shared performance/connectivity runtime for route-ready marks, network sampling, and asset timings
│   ├── analytics-wifi-assist.js  Shared Wi-Fi Assist overlay/runtime for QR sessions and in-store context confirmation
│   ├── analytics-commerce.js     Shared commerce funnel helpers for impressions, detail, cart, checkout, and purchase
│   ├── analytics-pipeline.js     Shared raw→curated ETL helpers for validation, dedupe, partitioning, and fact aggregation
│   ├── analytics-quality.js      Shared dataset health/observability checks, alert rules, and health-report rendering
│   ├── analytics-kpi-catalog.js  Shared KPI catalog, derived metric formulas, segment rollups, and leaderboard helpers
│   ├── analytics-cohorts.js      Shared cohort, retention, timing, performance-context, and curiosity rollups
│   ├── analytics-replay.js       Shared heatmap/session-replay runtime with deferred provider load, route tags, and sampling guards
│   ├── analytics-ai-reports.js   Shared weekly/monthly AI report windows, payload preparation, prompt guardrails, and Markdown/HTML rendering
│   ├── analytics-ai-analyst.js   Shared AI analyst retrieval, prompt-building, memory trimming, and structured-answer helpers
│   ├── analytics-optimization.js Shared experimentation backlog, recommendation lists, decision rules, and optimization review rendering
│   ├── public-analytics.js       Public-route instrumentation runtime for lifecycle, CTA, section, and scroll events
│   ├── public-paths.js           Shared site-base/path helper for root + GitHub Pages subpath hosting
│   ├── public-navbar-bootstrap.js Synchronous head bootstrap for the compact mobile public navbar state + first-paint loader shell
│   ├── public-entry-loader.js    Shared first-load/reload entry loader that reuses the fullscreen overlay before route-ready exit
│   ├── public-navbar.js          Canonical public navbar loader/cache bridge for multi-route pages
│   ├── public-hybrid-route-transition.js Shared same-document transition engine for reusable overlay/Lottie route swaps
│   ├── public-scroll-indicator.css Overlay root scrollbar hide + progress meter styles
│   ├── public-scroll-indicator.js  Native-scroll progress meter runtime for public routes
│   ├── ingredients-contract.js   Ingredient data validation
│   ├── categories-contract.js    Category data validation
│   ├── restaurant-contract.js    Restaurant data validation
│   ├── reservations-contract.js  Reservation config validation shared by admin, publish pipeline, and CLI
│   └── media-contract.js         Media data validation + helpers
├── cloudflare/
│   ├── admin/
│   │   └── worker.js          ← Cloudflare Admin worker (`/api/session`, `/api/publish`, `/api/analytics/*`)
│   ├── public/
│   │   └── worker.js          ← Cloudflare public worker (`/api/analytics/collect`)
│   ├── jobs/
│   │   └── worker.js          ← Scheduled Worker for AI reports + optimization refresh
│   └── common/
│       ├── access.js          ← Cloudflare Access session verification helpers
│       ├── analytics-report-service.js ← R2-backed AI report and optimization artifact helpers
│       ├── analytics-snapshot.js ← R2-backed analytics snapshot builder for the Admin
│       ├── publish-lock.js    ← Durable Object lease + rate-limit for publish
│       ├── publish-service.js ← GitHub publish service used by the Admin worker
│       ├── r2-storage.js      ← R2 raw/artifact path helpers
│       └── http.js            ← Shared worker HTTP helpers
├── scripts/                   ← Dev tools and validation scripts
│   ├── dev-server.js             Local dev server with media + local analytics inspect/collect endpoints and decision summary
│   ├── generate-home-featured.js Derives data/home-featured.json + responsive homepage featured variants from canonical data
│   ├── generate-menu-card-lqip.js Generates inline LQIP placeholders for menu catalog cards in data/media.json
│   ├── generate-menu-detail-slides.js Normalizes detail slides to 1080x1440 WebP + regenerates inline detail slide LQIP maps
│   ├── run-analytics-pipeline.js Builds partitioned raw/curated analytics outputs from NDJSON raw events
│   ├── run-analytics-health-report.js Builds structured quality snapshots + Markdown health reports from curated analytics data
│   ├── run-analytics-kpi-catalog.js Builds KPI catalog exports and derived metric snapshots from curated analytics data
│   ├── run-analytics-ai-report.js Builds weekly/monthly AI report bundles, payload history, and Markdown/HTML outputs from validated analytics aggregates
│   ├── run-analytics-optimization.js Builds experiment backlog, recommendation lists, and optimization decision logs from validated analytics data
│   ├── validate-menu.js          Validates menu.json against Menu Traits V2
│   ├── validate-ingredients.js   Validates ingredients.json
│   ├── validate-categories.js    Validates categories.json
│   ├── validate_home_json.js     Validates home.json
│   ├── validate_media_json.js    Validates media.json
│   ├── validate-restaurant.js    Validates restaurant.json
│   ├── validate-reservations.js  Validates reservations-config.json
│   ├── validate-analytics.js     Validates analytics architecture, taxonomy, contracts, and governance artifacts
│   ├── validate-analytics-pipeline.js Validates raw→curated analytics ETL, dedupe, and fact aggregation
│   ├── validate-analytics-quality.js Validates analytics quality alerts, internal audit checks, and report rendering
│   ├── validate-analytics-kpi-catalog.js Validates KPI formulas, source matrices, and business-validation metadata
│   ├── validate-analytics-cohorts.js Validates cohort, retention, timing, and curiosity analytics rollups
│   ├── validate-analytics-replay.js Validates replay/heatmap provider defaults, sampling guards, and route coverage
│   ├── validate-analytics-ai-report.js Validates weekly/monthly AI report windows, prompt guardrails, and artifact rendering
│   ├── validate-analytics-ai-analyst.js Validates AI analyst retrieval context, prompt limits, mock answers, and serverless contract
│   ├── validate-analytics-optimization.js Validates experimentation backlog, recommendation lists, and optimization artifact generation
│   ├── check_admin_ui.js         Checks admin UI element IDs
│   ├── test-menu-traits.js       Smoke tests for derived dietary/content/experience traits
│   ├── test-menu-allergens.js    Smoke tests for derived item allergens + overrides
│   └── dynamic_probe.js          Runtime analysis tool
├── assets/                    ← Static assets (images, icons, SVGs)
│   ├── menu/                     Menu item images (WebP) by category + placeholders
│   ├── Ingredients/              Ingredient icon images (WebP)
│   ├── home/                     Homepage assets
│   ├── lottie/                   Self-hosted Lottie loader assets for `/nosotros/`
│   ├── reviews/                  Testimonial avatars
│   └── svg-icons/                UI icon SVGs
├── src/                       ← Source generators (build-time)
│   ├── data/                     Data generator scripts (menu, home, media, etc.)
│   └── ui/                       UI component generators
├── wrangler.public.jsonc      ← Cloudflare Pages config for the public site
├── wrangler.admin.jsonc       ← Cloudflare Pages config for the Admin site + API worker
├── wrangler.jobs.jsonc        ← Cloudflare Worker config for scheduled jobs + publish DO
├── netlify/
│   └── functions/             ← Archived legacy Netlify runtime files kept only for historical reference
├── netlify.toml               ← Archived legacy Netlify config (no longer the supported runtime path)
├── package.json               ← npm scripts (dev, validate:*)
└── docs/                      ← Documentation
    └── developers/               Developer/agent documentation
        └── analytics/            Analytics architecture, taxonomy, contracts, and governance docs
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
| **Publish Pipeline** | `docs/developers/workflows/publish-pipeline.md` | Working on publishing, Cloudflare Admin APIs, or GitHub commit flow |
| **Build & Scripts** | `docs/developers/tooling/build-and-scripts.md` | Dev server, validation scripts, npm commands, or Cloudflare packaging/runtime config |
| **Analytics Architecture** | `docs/developers/analytics/analytics-architecture.md` | Planning analytics rollout, environments, phases, ownership, or route strategy |
| **Analytics Taxonomy** | `docs/developers/analytics/analytics-taxonomy.md` | Adding or changing analytics events/properties |
| **Analytics Pipeline** | `docs/developers/analytics/analytics-pipeline.md` | Running the local ETL, backfilling partitions, or debugging raw vs curated analytics outputs |
| **Analytics Data Model** | `docs/developers/analytics/analytics-data-model.md` | Working on analytics payload contracts, entities, idempotency, or curated tables |
| **Analytics Quality** | `docs/developers/analytics/analytics-quality-observability.md` | Reviewing dataset health, alert rules, and incident-response workflow |
| **Analytics KPI Catalog** | `docs/developers/analytics/analytics-kpi-catalog.md` | Defining official KPIs, derived formulas, and dashboard/reporting metric inputs |
| **Analytics Cohorts** | `docs/developers/analytics/analytics-cohorts-retention.md` | Extending dashboard v2, retention logic, timing views, and performance-context analysis |
| **Analytics Replay** | `docs/developers/analytics/analytics-heatmaps-replay.md` | Enabling heatmaps/session replay, provider config, route tagging, or UX review protocol |
| **Analytics AI Reports** | `docs/developers/analytics/analytics-ai-reports.md` | Generating weekly/monthly executive reports, prompt guardrails, history artifacts, or OpenAI/report job configuration |
| **Analytics AI Analyst** | `docs/developers/analytics/analytics-ai-analyst.md` | Working on the admin AI chat, retrieval context, memory policy, or AI analyst endpoints |
| **Analytics Experimentation** | `docs/developers/analytics/analytics-experimentation.md` | Working on experiment backlog, recommendation lists, decision logs, or optimization snapshots |
| **Analytics Governance** | `docs/developers/analytics/analytics-governance.md` | Privacy, retention, internal traffic, replay sampling, or access policy |
| **Analytics Commerce Funnel** | `docs/developers/analytics/analytics-commerce-funnel.md` | Working on menu/home commerce instrumentation, cart/checkout flow, or commercial edge cases |

---

## Task Routing

Use this table to find the right starting point for common tasks:

| Task type | Start with | Key files |
|-----------|-----------|-----------|
| Fix public site layout/content | `index.html`, `styles.css` | Relevant `js/` script |
| Modify homepage sections | `js/home-config.js` | `data/home.json`, `docs/developers/data/data-layer.md` |
| Change homepage featured cards | `data/home.json` (`popular.featuredIds`), `js/home-featured.js` | `scripts/generate-home-featured.js`, `js/mas-pedidas.js`, `styles.css` |
| Build/fix public full menu page | `menu/index.html`, `menu/menu-page.css`, `js/menu-page.js` | `js/menu-page-navbar.js`, `src/data/menu.js`, `src/data/media.js`, `data/categories.json` |
| Build/fix public eventos landing page | `eventos/index.html`, `eventos/eventos.css`, `js/eventos-page.js` | `data/menu.json`, `shared/public-navbar.js`, `shared/public-paths.js` |
| Build/fix public nosotros landing page | `nosotros/index.html`, `nosotros/nosotros.css`, `js/nosotros-page.js` | `js/nosotros-entry-loader.js`, `js/nosotros-route-transition.js`, `js/nosotros-lottie-runtime.js`, `assets/lottie/Prepare Food.json` |
| Build/fix public reservas flow | `reservas/index.html`, `reservas/reservas.css`, `js/reservas-page.js` | Reservations now use live API wiring for availability + submit |
| Reuse/fix public navbar across routes | `shared/public-navbar.js` | `index.html`, `menu/index.html`, `js/navbar-collapse.js` |
| Edit restaurant info | `js/restaurant-config.js` | `data/restaurant.json` |
| Edit reservation rules/config | `docs/developers/data/data-layer.md` | `data/reservations-config.json`, `shared/reservations-contract.js` |
| Work on admin panel | `docs/developers/admin/admin-panel.md` | `admin/app/app.js`, `admin/app/modules/` |
| Work on native Restaurant/Media/Pages panels | `docs/developers/admin/admin-editors.md` | `admin/app/modules/panels/restaurant-panel.js`, `admin/app/modules/panels/media-panel.js`, `admin/app/modules/panels/pages-panel.js` |
| Fix admin sidebar / navigation | `admin/app/modules/sidebar.js` | `navigation.js`, `accordion.js`, `panels.js` |
| Change admin command palette | `admin/app/modules/command-palette.js` | — |
| Modify data schemas | `docs/developers/data/data-layer.md` | `data/*.json`, `shared/*.js` |
| Plan or implement analytics | `docs/developers/analytics/analytics-architecture.md` | `shared/analytics-*.js`, `scripts/validate-analytics.js`, public route scripts |
| Change publish behavior | `docs/developers/workflows/publish-pipeline.md` | `admin/app/modules/publish.js`, `cloudflare/admin/worker.js`, `cloudflare/common/publish-service.js` |
| Run validation | `package.json` scripts | `scripts/validate-*.js` |
| Run dev server | `npm run dev` | `scripts/dev-server.js` |
| Add/modify admin CSS | `admin/app/styles.css` | `admin/app/index.html` |
| Work with ingredient icons | `data/ingredients.json` | `assets/Ingredients/`, `admin/app/modules/render-utils.js` |

---

## Development Workflow

### Local Development

```bash
npm run dev
npm run generate:home-featured
```

This starts a local server (`scripts/dev-server.js`) that:
- Serves the site at `http://127.0.0.1:5173`
- Provides a media listing endpoint at `/__local/menu-media-paths`
- Accepts local analytics batches at `/__analytics/collect`
- Exposes the local analytics NDJSON log plus curated, quality, KPI, and per-session decision summaries at `/__analytics/inspect`
- Exposes Cloudflare-shaped local aliases at `/api/session`, `/api/publish`, `/api/analytics/collect`, `/api/analytics/snapshot`, and `/api/analytics/ai-analyst`
- Supports the admin panel at `/admin/app/`

### Admin Dev Login

Open the admin panel with the dev auth bypass:
```
http://127.0.0.1:5173/admin/app/?devAuthBypass=1
```

### Validation Scripts

```bash
npm run generate:home-featured # regenerate data/home-featured.json + responsive homepage featured assets
npm run generate:menu-card-lqip # regenerate inline LQIP placeholders for menu catalog cards
npm run generate:menu-detail-slides # normalize detail slide assets (1080x1440) + regenerate inline detail slide LQIP maps
npm run analytics:curate      # build partitioned raw/curated analytics facts from the local NDJSON ingest log
npm run analytics:health-report # build qualitySnapshot JSON + Markdown health report from curated analytics data
npm run analytics:kpis        # build KPI catalog JSON + Markdown snapshot from curated analytics data
npm run analytics:report -- --type=weekly   # build one AI-ready weekly or monthly report bundle (JSON + Markdown + HTML + history)
npm run analytics:report:weekly             # run the weekly executive report job with default period resolution
npm run analytics:report:monthly            # run the monthly executive report job with default period resolution
npm run validate:home          # validates data/home.json
npm run validate:media         # validates data/media.json
npm run validate:menu          # validates data/menu.json
npm run validate:ingredients   # validates data/ingredients.json
npm run validate:categories    # validates data/categories.json
npm run validate:restaurant    # validates data/restaurant.json
npm run validate:reservations  # validates data/reservations-config.json
npm run validate:analytics     # validates analytics architecture/taxonomy/contracts/governance
npm run validate:analytics-pipeline # validates raw→curated analytics ETL, dedupe, and fact aggregation
npm run validate:analytics-quality # validates dataset health checks, alert rules, and internal-audit observability
npm run validate:analytics-kpis # validates KPI formulas, source matrices, and business-validation metadata
npm run validate:analytics-cohorts # validates cohort, retention, timing, and curiosity rollups
npm run validate:analytics-replay # validates replay/heatmap provider defaults, sampling guards, and route coverage
npm run validate:analytics-ai-reports # validates weekly/monthly AI report windows, prompt guardrails, and artifact rendering
npm run validate:analytics-ai-analyst # validates AI analyst retrieval, prompt limits, mock answers, and endpoint contract
npm run analytics:optimization # builds experiment backlog, recommendation lists, and optimization review artifacts
npm run validate:analytics-optimization # validates experimentation backlog, recommendation lists, and optimization artifacts
npm run check:admin-ui         # checks admin UI element IDs
npm test                       # smoke tests for Menu Traits V2 + Menu Allergens
```

### Deployment

The supported runtime path is now Cloudflare:
- `trattoriafigata` Cloudflare Pages deploys the public site from `dist-public/`, using `_redirects` for `/menu/:item` deep-link rewrites, `_headers` for cache policy, and `_worker.js` for `/api/analytics/collect`.
- `figata-admin` Cloudflare Pages deploys the Admin from `dist-admin/`, using `_worker.js` for `/api/session`, `/api/publish`, `/api/analytics/snapshot`, and `/api/analytics/ai-analyst`.
- `figata-jobs` Cloudflare Worker runs scheduled AI-report and optimization jobs and exports the Durable Object used to serialize publish operations.

GitHub Pages workflow files may still exist as legacy/static fallback packaging, but Netlify is no longer the supported auth/publish/runtime path.

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

On public routes, `shared/public-navbar-bootstrap.js` must load synchronously in the page `<head>` before route styles so mobile first paint starts in the compact navbar state and the fullscreen loader shell is visible immediately on hard opens/reloads.

On public routes, `shared/public-paths.js` must load before other route scripts that resolve site-relative URLs or parse the current pathname.

On public routes, the analytics foundation must load immediately after `shared/public-paths.js` and before route loaders/transitions so identity, attribution, internal-traffic rules, the replay provider guard, and the SDK are ready before any route instrumentation fires:
`shared/analytics-config.js` → `shared/analytics-taxonomy.js` → `shared/analytics-governance.js` → `shared/analytics-contract.js` → `shared/analytics-identity.js` → `shared/analytics-attribution.js` → `shared/analytics-internal.js` → `shared/analytics-sdk.js` → `shared/analytics-performance.js` → optional in-store runtime (`shared/analytics-wifi-assist.js` on menu/eventos) → optional commerce runtime (`shared/analytics-commerce.js` on home/menu) → `shared/analytics-replay.js` → `shared/public-analytics.js`

On `/menu/`, route scripts must load in this order:
`shared/public-paths.js` → analytics foundation/runtime (`shared/analytics-config.js` → `shared/analytics-taxonomy.js` → `shared/analytics-governance.js` → `shared/analytics-contract.js` → `shared/analytics-identity.js` → `shared/analytics-attribution.js` → `shared/analytics-internal.js` → `shared/analytics-sdk.js` → `shared/analytics-performance.js` → `shared/analytics-wifi-assist.js` → `shared/analytics-commerce.js` → `shared/analytics-replay.js` → `shared/public-analytics.js`) → `shared/public-entry-loader.js` → `shared/public-hybrid-route-transition.js` → `js/menu-route-transition.js` → `js/nosotros-route-transition.js` → `shared/public-navbar.js` → `js/navbar-collapse.js` → `js/menu-page.js` → `js/menu-page-navbar.js`

On `/eventos/`, route scripts must load in this order:
`shared/public-paths.js` → analytics foundation/runtime (`shared/analytics-config.js` → `shared/analytics-taxonomy.js` → `shared/analytics-governance.js` → `shared/analytics-contract.js` → `shared/analytics-identity.js` → `shared/analytics-attribution.js` → `shared/analytics-internal.js` → `shared/analytics-sdk.js` → `shared/analytics-performance.js` → `shared/analytics-wifi-assist.js` → `shared/analytics-replay.js` → `shared/public-analytics.js`) → `shared/public-entry-loader.js` → `shared/public-hybrid-route-transition.js` → `js/menu-route-transition.js` → `js/nosotros-route-transition.js` → `shared/public-navbar.js` → `js/navbar-collapse.js` → `js/eventos-page.js`

On `/nosotros/`, route scripts must load in this order:
`shared/public-paths.js` → analytics foundation/runtime (`shared/analytics-config.js` → `shared/analytics-taxonomy.js` → `shared/analytics-governance.js` → `shared/analytics-contract.js` → `shared/analytics-identity.js` → `shared/analytics-attribution.js` → `shared/analytics-internal.js` → `shared/analytics-sdk.js` → `shared/analytics-performance.js` → `shared/analytics-replay.js` → `shared/public-analytics.js`) → `shared/public-entry-loader.js` → `shared/public-hybrid-route-transition.js` → `js/menu-route-transition.js` → `js/nosotros-entry-loader.js` → `shared/public-navbar.js` → `js/navbar-collapse.js` → `js/public-burger-menu.js` → `js/nosotros-page.js` → `shared/public-scroll-indicator.js`

On `/reservas/`, route scripts must load in this order:
`shared/public-paths.js` → `shared/public-navbar.js` → `js/navbar-collapse.js` → `shared/reservations-runtime.js` → `js/reservas-page.js`

The shared public scroll indicator is optional and should be loaded after the route's primary public scripts so it can measure the final document scroll state without affecting route initialization:
`shared/public-scroll-indicator.css` in the page `<head>` and `shared/public-scroll-indicator.js` near the end of the public script list.

### Data Conventions

- Menu images use **WebP** format, stored in `assets/menu/` with category subfolders:
  `entradas/<item-slug>/`, `pizzas/<pizza-slug>/`, `postres/<item-slug>/`, `bebidas/<item-slug>/`, `productos/<item-slug>/`
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
- `admin/cms/`, `netlify/functions/*`, and `netlify.toml` are archived legacy materials kept only for historical reference while the Cloudflare migration settles.
