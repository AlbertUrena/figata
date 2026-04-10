# Public Site

> **Read this doc when** working on the customer-facing website: modifying layout, styling, homepage sections, menu display, testimonials, events, or anything involving `index.html`, `styles.css`, or `js/*.js`.

---

## Overview

The public site is a static multi-route surface served primarily by Cloudflare Pages, with Netlify/GitHub Pages fallback flows. It currently has:
- Homepage: `index.html`
- Full menu page: `menu/index.html` (`/menu/`)
- Events landing page: `eventos/index.html` (`/eventos/`)
- Nosotros landing page: `nosotros/index.html` (`/nosotros/`)

There is no build step — the HTML, CSS, and JavaScript are deployed directly.

| Aspect | Details |
|--------|---------|
| Entry points | `index.html` (homepage), `menu/index.html` (full menu page), `eventos/index.html` (Pizza Party editorial landing), `nosotros/index.html` (brand/about landing) |
| Styles | `styles.css` (~2,600 lines, 75KB) |
| Scripts | 18 files in `js/` + shared runtime modules/assets in `shared/` + data loaders in `src/data/` |
| Data | Fetches from `data/*.json` at runtime |
| Hosting | Cloudflare Pages runtime (primary) plus Netlify/GitHub Pages fallback for the public surface |

---

## HTML Section Map

The page is structured as a single scrollable document. Major sections in `index.html`:

| Section | HTML Element | ID/Class | Lines (approx) | Rendered by |
|---------|-------------|----------|---------------:|-------------|
| **Navbar** | `<nav>` | `.navbar` | 78–102 | Canonical markup in `index.html` + `shared/public-navbar.js` for cross-route reuse |
| **Hero** | `<section>` | `#inicio`, `.hero` | 107–129 | `js/home-config.js` |
| **Announcement** | `<section>` | `#home-announcement` | 131–138 | `js/home-config.js` (hidden by default) |
| **Featured Items** | `<section>` | `#mas-pedidas` | 140–172 | `js/home-featured.js` (card render) + `js/mas-pedidas.js` on desktop only |
| **Delivery** | `<section>` | `.delivery-section` | 175–234 | `js/home-config.js` |
| **Testimonials** | `<section>` | `#testimonials` | 236–312 | `js/testimonials.js` (carousel) |
| **Events** | `<section>` | `#eventos-tabs` | 314–394 | `js/events-tabs.js` (tabbed display, desktop only) |
| **Footer** | `<footer>` | `.site-footer` | 400–539 | `js/home-config.js` |

### Templates

| Template | ID | Used by | Purpose |
|----------|-----|---------|---------|
| Menu item card | `mas-pedidas-card-template` | `js/home-featured.js` | Renders each featured homepage card |
| Testimonial card | `testimonial-card-template` | `js/testimonials.js` | Renders each testimonial entry |

## Menu Route Map (`/menu/`)

| Area | File | Purpose |
|------|------|---------|
| Head bootstrap | `shared/public-navbar-bootstrap.js` | Seeds the compact mobile navbar state before route CSS paints and injects the first-paint fullscreen loader shell |
| Shared navbar runtime | `shared/public-navbar.js` | Mounts canonical homepage navbar on `/menu/` and normalizes route URLs |
| Shared scroll meter | `shared/public-scroll-indicator.css`, `shared/public-scroll-indicator.js` | Hides the root scrollbar and renders a fixed overlay progress indicator while preserving native document scroll |
| Route HTML | `menu/index.html` | Full menu page shell + templates |
| Route styles | `menu/menu-page.css` | Centered intro, Events-style top tabs, integrated search bar, responsive grid, detail subview |
| Route script | `js/menu-page.js` | Runtime tab navigation, grouped category rendering, in-page search filter, bridge state for navbar sync, and detail/list routing |
| Route navbar enhancer | `js/menu-page-navbar.js` | Two-stage sticky-menu transformation layered on top of the shared navbar |

## Eventos Route Map (`/eventos/`)

| Area | File | Purpose |
|------|------|---------|
| Route HTML | `eventos/index.html` | Pizza Party editorial landing page shell (hero video, storytelling sections, cotizador comercial, FAQ, CTA) |
| Route styles | `eventos/eventos.css` | Mobile-first editorial layout, cotizador UI (stepper, resumen, modal), section rhythm, gallery, and FAQ styling |
| Route script | `js/eventos-page.js` | Cotizador Pizza Party (fetch `data/menu.json`, exclusión automática top 5 más caras, selección manual/aleatoria de menú, resumen y CTA WhatsApp) + FAQ/media/navbar wiring |
| Shared navbar runtime | `shared/public-navbar.js` | Mounts canonical homepage navbar and applies `data/home.json` link config on `/eventos/` |

## Nosotros Route Map (`/nosotros/`)

| Area | File | Purpose |
|------|------|---------|
| Route HTML | `nosotros/index.html` | About/brand story shell used for controlled transition experiments |
| Route styles | `nosotros/nosotros.css` | Route layout plus premium fullscreen entry loader visuals |
| Lottie helper | `js/nosotros-lottie-runtime.js` | Boots the self-hosted local `lottie-web` player, embeds the `/nosotros/` loader JSON, and mounts it in source/destination overlays |
| Shared first-load entry loader | `shared/public-entry-loader.js` | Reuses the fullscreen loader on hard opens/reloads across home, menú, eventos y nosotros with a 1-second minimum hold |
| Shared hybrid engine | `shared/public-hybrid-route-transition.js` | Reusable same-document transition motor that keeps one overlay alive while route-specific wrappers prepare and mount the destination |
| Entry loader runtime | `js/nosotros-entry-loader.js` | Handles the hard-navigation fallback into `/nosotros/`, mounts the local Lottie loader, enforces min duration, and exits safely |
| Route script | `js/nosotros-page.js` | Lightweight reveal/intersection enhancements for placeholder sections |
| Shared public-route binder | `js/menu-route-transition.js` | Reuses the shared hybrid motor for home/menu/eventos by fetching and mounting the destination in-document before the URL update |
| Isolated source transition binder | `js/nosotros-route-transition.js` | Intercepts only links targeting `/nosotros/` on home/menu/eventos, keeps one live overlay running, preloads `/nosotros/` in-document, and falls back to session handoff only if the swap fails |

---

## JavaScript Architecture

### Script Loading Order

Homepage (`index.html`) runs a mixed boot pipeline: critical route/runtime scripts load with `defer`, while below-the-fold work is staggered so mobile can prioritize the hero + featured rows first.

```
1.  shared/public-paths.js      — Shared site-base helper for root + GitHub Pages subpath hosting
2.  shared/public-entry-loader.js — Hard-open/reload overlay runtime with a 1-second minimum hold
3.  shared/public-hybrid-route-transition.js — Shared same-document transition engine for reusable overlay + Lottie route swaps
4.  js/menu-route-transition.js — Shared public route binder for home/menu/eventos links and CTAs
5.  js/nosotros-route-transition.js — Route-local `/nosotros/` config wrapper on top of the shared hybrid engine
6.  shared/public-navbar.js     — Captures canonical navbar markup for cross-route reuse
7.  js/navbar-collapse.js       — Navbar collapse/expand animation controller
8.  js/public-burger-menu.js    — Homepage-only lightweight burger/menu runtime for the mobile navbar
9.  src/data/home.js            — Home data loader
10. src/data/home-featured.js   — Mobile-first featured-card data loader
11. src/data/restaurant.js      — Restaurant data loader
12. js/home-lazy-images.js      — Lazy image loading (IntersectionObserver)
13. js/home-config.js           — Homepage section rendering (hero, delivery, footer, etc.)
14. js/home-featured.js         — Featured-card renderer; injects `js/mas-pedidas.js` only on desktop
15. inline secondary loader   — Defers desktop-only events tabs + scroll indicator to idle and mounts `js/testimonials.js` only when `#testimonials` approaches the viewport
```

Additionally loaded (non-deferred):
- `shared/public-navbar-bootstrap.js` — synchronous head bootstrap that seeds the compact mobile navbar and first-paint loader shell before first paint
- Conditional Netlify Identity loader — fetches `netlify-identity-widget.js` only when auth hash tokens are present

Menu page (`menu/index.html`) loads:

```
head. shared/public-navbar-bootstrap.js
1. shared/public-paths.js
2. shared/public-entry-loader.js
3. shared/public-hybrid-route-transition.js
4. js/menu-route-transition.js
5. js/nosotros-route-transition.js
6. shared/public-navbar.js
7. js/navbar-collapse.js
8. shared/menu-traits.js
9. shared/menu-allergens.js
10. shared/menu-sensory.js
11. src/data/media.js
12. src/data/menu.js
13. src/data/ingredients.js
14. js/menu-page.js
15. js/menu-page-navbar.js
16. shared/public-scroll-indicator.js
```

Eventos page (`eventos/index.html`) loads:

```
head. shared/public-navbar-bootstrap.js
1. shared/public-paths.js
2. shared/public-entry-loader.js
3. shared/public-hybrid-route-transition.js
4. js/menu-route-transition.js
5. js/nosotros-route-transition.js
6. shared/public-navbar.js
7. js/navbar-collapse.js
8. js/eventos-page.js
9. shared/public-scroll-indicator.js
```

Nosotros page (`nosotros/index.html`) loads:

```
head. shared/public-navbar-bootstrap.js
1. shared/public-paths.js
2. shared/public-entry-loader.js
3. shared/public-hybrid-route-transition.js
4. js/menu-route-transition.js
5. js/nosotros-entry-loader.js
6. shared/public-navbar.js
7. js/navbar-collapse.js
8. js/public-burger-menu.js
9. js/nosotros-page.js
10. shared/public-scroll-indicator.js
```

### GitHub Pages Notes

- `index.html` uses `<base href="./">` and route pages such as `menu/index.html`, `eventos/index.html`, and `nosotros/index.html` use `<base href="../">` so public assets and route links resolve correctly both at site root (`/`) and under the GitHub Pages project prefix (`/figata/`).
- `shared/public-paths.js` is the canonical helper for converting site-relative URLs and stripping the GitHub Pages project prefix from `window.location.pathname`.
- `404.html` redirects GitHub Pages deep-link misses back into the public menu shell so `/menu/:item` still works after direct navigation or refresh.

### Cloudflare Pages Notes

- `_redirects` defines the `/menu/:item` rewrite behavior used by Cloudflare Pages so deep links load the menu shell directly.
- Because Cloudflare redirects are evaluated before static file lookup, the route file includes an explicit static pass-through for `/menu/menu-page.css` before dynamic `/menu/:item` rules.
- `_headers` keeps HTML/data on fresh validation while allowing short `stale-while-revalidate` windows for public JS/CSS and longer windows for media/fonts so refreshes do not stall on every runtime asset revalidation.

### Script Responsibilities

#### `js/home-config.js`
The central homepage controller. Fetches `data/home.json` and renders:
- Hero section (title, subtitle, background, CTAs)
- Announcement bar (conditional display)
- Featured items header (title, subtitle)
- Delivery section (platforms, icons)
- Footer (columns, links, CTAs, social icons)
- Navbar links
- Mobile hours and location content
- Desktop-only events preview content (mobile returns early and does no events-tab work)

**Data source:** `data/home.json`

#### `js/home-featured.js`
Homepage featured-card renderer. Handles:
- Fetching the derived `data/home-featured.json` payload through `src/data/home-featured.js`
- Rendering homepage rows in the exact order emitted by `home.popular.featuredIds`
- Rendering the mobile-first grid using generated homepage-specific image variants and `srcset`
- Removing the `Detalles` button and all preview hooks on mobile so no desktop preview runtime ships there
- Deferring desktop-only hover media and injecting `js/mas-pedidas.js` only on desktop after cards render

**Data source:** `data/home-featured.json` (generated by `scripts/generate-home-featured.js`)

#### `js/mas-pedidas.js`
Desktop-only homepage preview enhancer. Handles:
- Reading the already-rendered featured cards from `js/home-featured.js`
- Opening the “Detalles” overlay with the shared cover transition feel
- Hydrating preview content from the derived `data/home-featured.json`
- Prefetching modal/hover media only on desktop interaction intent

**Data source:** `data/home-featured.json`

#### `js/menu-page.js`
Full menu page runtime controller for `/menu/`. Handles:
- Fetching per-category items from `window.FigataData.menu.getMenuItemsByCategory()`
- Grouping the route into 5 fixed visible tabs: Entradas, Pizzas, Postres, Bebidas, Productos
- Reusing the homepage Events tab UI/animation pattern for top-level menu navigation
- Filtering visible cards from an inline search bar without changing routing or detail behavior
- Switching search mode into a single unified results grid, with a short fade transition and a single global empty state when no items match
- Rendering category sections with menu cards (including empty-state sections such as Bebidas)
- Scroll-synced active category state
- Dynamic item detail subview via URL (`/menu/<id>`) with browser back/forward
- Rendering the structured sensory profile section in detail view when `item.sensory_profile` is available, including an editorial subtitle under the section heading, a compact right-aligned Radar/Bars toggle on the same heading row (radar by default), icon-based radar axes in place of text labels, shared tap/focus icon tooltips across radar axes and bars X-axis icons (axis guidance + 5-second auto-dismiss), a consolidated Bars visualization (vertical bars, Y scale 1–10, icon-only X axis, shared accent color with value-based opacity), plus a smoothed radar area without per-axis point markers and a subtle stroke halo
- Exposing `window.FigataMenuPage` so route-local enhancers can sync category state and search without duplicating logic

#### `js/menu-page-navbar.js`
`/menu/`-only navbar enhancer. Handles:
- Waiting for the shared navbar mount plus `window.FigataMenuPage.whenReady()`
- Repairing the mounted shared navbar back to canonical structure before building sticky menu chrome
- Preserving the existing desktop collapse threshold as stage 1, while mobile keeps the navbar in the compact collapsed state from first paint
- Activating a second sticky-menu transformation only after `.menu-page-controls` fully clears the fixed header
- Swapping navbar links/CTA for compact menu tabs plus search/filter tools inside the same navbar shell
- Supporting a reversible chevron override on desktop that returns to the collapsed normal navbar state
- Omitting that chevron override on mobile so the sticky navbar can dedicate the left rail to brand/search space
- Locking mobile detail view into a stable `account-only` top-right account button so no navbar shell reveals on scroll and only the account action remains visible

#### `js/public-burger-menu.js`
Homepage mobile navbar enhancer. Handles:
- Building the burger-menu chrome on top of the canonical homepage navbar
- Rendering the card-style mobile panel entries with thumbs/subtitles
- Deferring burger-card thumbs until well after first paint unless the menu opens early, while using downsized mobile-only variants
- Animating the burger icon between closed/open states
- Managing open/close, focus restoration, outside-click dismissal, and viewport changes

#### `js/eventos-page.js`
`/eventos/` route enhancer. Handles:
- Commercial cotizador section ("Cotiza tu Pizza Party")
  - Fetches `data/menu.json` (via `shared/public-paths.js` route-safe paths)
  - Builds variety selector from pizza categories, excludes the 5 highest-priced pizzas
  - Enforces up to 5 selected varieties and seeds a default base selection
  - Includes a random-selection action to quickly rotate example menu options
  - Computes subtotal, minimum consumables adjustment, base service fee waiver logic, and 10% service over consumables
  - Generates WhatsApp quote message with selected varieties and pricing breakdown
- FAQ accordion behavior (single open item at a time)
- Hero video autoplay fallback (enables controls when autoplay is blocked)
- Menu-style navbar adaptation on mobile for `/eventos/` only (burger button, animated icon, card menu panel, open/close states) after a shared-navbar host mounts
- Storytelling gallery modal + photo viewer behavior

#### `js/restaurant-config.js` (11KB, ~390 lines)
Restaurant information display. Fetches `data/restaurant.json` and renders:
- Opening hours display
- Address and contact information
- Google Maps integration link
- Phone/WhatsApp links

**Data source:** `data/restaurant.json`

#### `js/testimonials.js` (16KB, ~530 lines)
Testimonials carousel. Fetches `data/home.json` (testimonials section) and renders:
- Auto-playing carousel with swipe support
- Star ratings
- Customer avatars from `assets/reviews/`
- Responsive slide count

**Data source:** `data/home.json` (testimonials array)

#### `js/events-tabs.js` (7KB, ~230 lines)
Desktop-only events section with tabbed display. Fetches `data/home.json` (events section) and renders:
- Tab navigation for different event types
- Event cards with images, descriptions, and dates

**Data source:** `data/home.json` (events array)

#### `js/feature-tabs.js` (4KB, ~130 lines)
Feature highlights section with tabbed display. Renders feature cards showcasing restaurant attributes.

#### `shared/public-navbar.js`
Shared public navbar runtime module. Handles:
- Capturing canonical navbar markup from homepage (`index.html`)
- Caching canonical markup for reuse on multi-route pages
- Caching the navbar slice of `data/home.json` in-session so same-document swaps do not re-fetch it on every route mount
- Mounting canonical navbar into route hosts (`data-public-navbar-host`)
- Optional route-level CTA suppression via `data-public-navbar-hide-cta`
- Route-aware URL normalization for non-home pages (home logo returns to `/`, sectional links keep `/#...` anchors, and asset paths stay route-safe)
- Rejecting route-mutated navbar DOM when reading/writing cache and exposing a repair path so route enhancers can remount a clean canonical header before applying route-only chrome

#### `shared/public-scroll-indicator.js` + `shared/public-scroll-indicator.css`
Shared public scroll meter enhancement. Handles:
- Preserving the real document scroller (`document.scrollingElement`)
- Hiding only the root scrollbar chrome, not nested scroll areas
- Injecting a fixed, pointer-safe overlay meter that tracks real document scroll progress
- Supporting marked internal scrollers such as the `/menu/` filter modal body via `data-scroll-indicator-container`
- Revealing the meter while the user scrolls and fading it out after a short idle delay
- Recomputing thumb size/position on resize and document height changes via `ResizeObserver`
- Staying out of the way of existing locked-scroll overlay states such as homepage previews and `/menu/` filters

#### `shared/public-navbar-bootstrap.js`
Synchronous public head bootstrap:
- Runs before route styles on `index.html`, `/menu/`, and `/eventos/`
- Seeds `html.nav--collapsed` immediately on mobile breakpoints so the public navbar paints in its compact state from first paint
- Injects the minimal fullscreen loader-shell CSS so hard opens/reloads show the overlay from first paint
- Leaves desktop expansion to `js/navbar-collapse.js`

#### `js/navbar-collapse.js` (9KB, ~270 lines)
Navbar collapse animation controller:
- Computes responsive collapsed/expanded navbar width variables
- Uses hero sentinel to toggle `html.nav--collapsed` on homepage scroll
- Animates collapse progress with spring motion (`--nav-collapse` CSS variables)
- Supports non-hero routes via `data-nav-collapse-threshold="<px>"` on the page root/body
- Keeps the public navbar in the compact collapsed state across mobile viewports, while desktop retains the scroll-driven collapse behavior

#### `js/menu-route-transition.js`
Public route transition binder:
- Intercepts managed cross-route public links between home, `/menu/`, and `/eventos/`
- Fetches the destination document while the current overlay/Lottie stays alive
- Swaps the destination scaffold and reruns only the destination route scripts inside the current document
- Reuses already-loaded shared runtimes (`public-paths`, hybrid engine, canonical navbar bridge, scroll indicator, `/nosotros/` binder) instead of reinserting them on every route swap
- Waits for route-ready signals before allowing the shared overlay to exit

#### `shared/public-entry-loader.js`
Shared hard-open/reload entry loader:
- Reuses the static fullscreen overlay already present in each public route shell
- Mounts the shared local Lottie loader during first load or browser reload
- Waits for route-ready signals plus a hard 1-second minimum hold before exiting
- Skips itself when `/nosotros/` is already entering through the route-handoff loader

#### `shared/public-hybrid-route-transition.js`
Shared same-document transition engine:
- Creates and owns the fullscreen overlay, live Lottie mount, click-driven route preparation, hard-navigation fallback, and history/back-button safety
- Exposes a reusable binder factory so route-specific wrappers only define how to prepare a payload and how to mount that route into the current document
- Keeps the transition mechanics isolated from route-specific HTML parsing or DOM shaping

#### `js/nosotros-route-transition.js`
Route-local wrapper for `/nosotros/` on top of the shared hybrid engine:
- Configures the engine to intercept only same-origin links whose normalized destination is `/nosotros/`
- Defines how `/nosotros/` should be fetched and parsed (`main.nosotros-main`, route CSS, hero image, title/meta)
- Defines how the imported `/nosotros/` `<main>` is mounted and revealed inside the current document before URL change

#### `js/nosotros-entry-loader.js`
Destination entry loader runtime for `/nosotros/`:
- Reads and validates the isolated handoff payload (`figata:nosotros-transition`)
- Activates the premium entry overlay only when navigation fell back to a real document navigation
- Mounts the self-hosted temporary loader animation through `js/nosotros-lottie-runtime.js`, with minimum duration guarantees and reduced-motion fallbacks
- Clears handoff state and unlocks the page with hard failsafes if timing fails

#### `js/nosotros-lottie-runtime.js`
Temporary `/nosotros/` animation helper:
- Dynamically loads the self-hosted `lottie-web` player from `assets/lottie/lottie.min.js`
- Embeds the current loader animation data from `Prepare Food.json` directly inside the runtime module so route handoff does not request a separate animation payload
- Mounts and clears the loader in both the source overlay and the destination entry loader while preserving phase offset across the handoff

#### `js/nosotros-page.js`
`/nosotros/` route enhancer:
- Reveals content blocks tagged with `data-nosotros-reveal` using `IntersectionObserver`
- Keeps progressive enhancement lightweight so the transition test remains the focus

#### `js/home-lazy-images.js` (1KB, ~40 lines)
Homepage image deferral helper. Uses `IntersectionObserver` + `data-home-lazy-src` to keep below-the-fold mobile media out of the initial request burst.

---

## Source Generators (`src/`)

The `src/` directory contains browser-side runtime data loaders/helpers used by the public site:

| File | Lines | Purpose |
|------|------:|---------|
| `src/data/home.js` | — | Home data loader/normalizer for `data/home.json` |
| `src/data/home-featured.js` | — | Homepage featured-card loader for the derived `data/home-featured.json` payload |
| `src/data/menu.js` | — | Menu data loader/runtime API for `data/menu.json` (used by `/menu/`, `/eventos/`, and admin-side menu workflows) |
| `src/data/restaurant.js` | — | Restaurant data loader for `data/restaurant.json` |
| `src/data/media.js` | — | Media mapping runtime API for `data/media.json` (used outside the optimized mobile homepage featured path) |
| `src/data/ingredients.js` | — | Ingredients data loader for `data/ingredients.json` (used outside the optimized mobile homepage featured path) |
| `src/ui/ingredient-icon-row.js` | — | Menu/detail helper used outside the optimized homepage featured path |

These scripts are loaded as `<script>` tags on the public site and execute in the browser. They are not Node.js build-time generators.

---

## Styles Architecture

`styles.css` (~2,600 lines) uses vanilla CSS with CSS custom properties for theming.

### Key Design Tokens (CSS Custom Properties)

Found on `:root` and used throughout:
- Color palette, spacing scale, typography
- Responsive breakpoints via media queries
- Dark/premium color scheme (the site uses a dark theme)

### Major Style Sections (by selector area)

| Area | Selectors | Purpose |
|------|-----------|---------|
| Reset/Base | `*`, `body`, `main` | Normalize + base styles |
| Navbar | `.navbar`, `.nav-link`, `.hamburger` | Top navigation bar |
| Hero | `.hero`, `.hero-title`, `.hero-cta` | Full-width hero section |
| Menu cards | `.menu-card`, `.menu-modal`, `.menu-grid` | Menu item display |
| Testimonials | `.testimonials-section`, `.testimonial-card` | Testimonials carousel |
| Events | `.events-tabs-section`, `.event-card` | Events tabbed section |
| Delivery | `.delivery-section`, `.delivery-card` | Delivery/takeout section |
| Footer | `.site-footer`, `.footer-column` | Footer layout and links |
| Animations | `@keyframes`, `.animate-*` | Entry animations, hover effects |
| Responsive | `@media` queries | Mobile/tablet/desktop breakpoints |

---

## Data Flow

```
Homepage loads in browser
    ↓
index.html parsed, <script defer> tags queue execution
    ↓
src/data/home.js + src/data/home-featured.js + src/data/restaurant.js expose runtime data
    ↓
js/home-config.js fetches data/home.json
    → renders hero, announcement, delivery, footer, navbar, mobile-only hours/location
    ↓
js/home-featured.js fetches the derived data/home-featured.json payload
    → renders the featured rows in home.popular.featuredIds order with generated mobile image variants
    ↓
js/mas-pedidas.js loads only on desktop
    → adds the Detalles preview overlay/transition on top of the rendered cards
    ↓
js/testimonials.js waits until #testimonials nears the viewport
    → then reads home data (testimonials) and renders the carousel
    ↓
js/events-tabs.js reads home data (events) on desktop only
    → renders tabbed events
    ↓
js/restaurant-config.js fetches data/restaurant.json
    → renders hours, contact, address
```

```
Menu page loads in browser
    ↓
menu/index.html parsed, route scripts execute
    ↓
src/data/menu.js + src/data/media.js expose runtime APIs
    ↓
js/menu-page.js fetches grouped category items for the 5 visible menu tabs
    → renders top tabs, category sections, cards, and dynamic detail subview
```

---

## Common Modification Tasks

| Task | Files to modify | Notes |
|------|----------------|-------|
| Change hero text/image | `data/home.json` (hero section) | Or via admin homepage editor |
| Add menu item | `data/menu.json` (add to section) | Also update `data/media.json`, `data/availability.json` |
| Change menu card design | `js/mas-pedidas.js`, `styles.css` | Template in `index.html` at `#mas-pedidas-card-template` |
| Change full menu page layout/navigation | `menu/index.html`, `menu/menu-page.css`, `js/menu-page.js` | Keep category/item order driven by `src/data/menu.js` APIs |
| Change events landing layout/content | `eventos/index.html`, `eventos/eventos.css`, `js/eventos-page.js` | Keep one-service narrative focused on Pizza Party by Figata |
| Change nosotros landing layout/content | `nosotros/index.html`, `nosotros/nosotros.css`, `js/nosotros-page.js` | Entry transition behavior lives in `js/nosotros-entry-loader.js` + source interception in `js/nosotros-route-transition.js` |
| Modify navbar links | `data/home.json` (navbar.links) + `shared/public-navbar.js` | `home-config` sets labels/URLs; shared module mounts canonical navbar on secondary routes |
| Change testimonials | `data/home.json` (testimonials.items) | Carousel in `js/testimonials.js` |
| Add new section | `index.html` (add HTML), `styles.css` (add styles) | May need new JS file in `js/` |
| Change opening hours | `data/restaurant.json` | Rendered by `js/restaurant-config.js` |
| Modify footer | `data/home.json` (footer section) | Columns, CTAs, social links |
| Change colors/fonts | `styles.css` (`:root` custom properties) | Site-wide design tokens |
| Fix mobile layout | `styles.css` (`@media` queries) | Test at 375px, 768px, 1024px breakpoints |

---

## Asset Locations

| Asset type | Directory | Format |
|-----------|-----------|--------|
| Menu item images | `assets/menu/` | WebP |
| Menu placeholders | `assets/menu/placeholders/` | SVG |
| Ingredient icons | `assets/Ingredients/` | WebP |
| Homepage images | `assets/home/` | WebP |
| Testimonial avatars | `assets/reviews/` | WebP |
| UI icons | `assets/svg-icons/` | SVG |
| Favicons | `assets/` (root) | PNG |
