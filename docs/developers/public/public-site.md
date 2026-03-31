# Public Site

> **Read this doc when** working on the customer-facing website: modifying layout, styling, homepage sections, menu display, testimonials, events, or anything involving `index.html`, `styles.css`, or `js/*.js`.

---

## Overview

The public site is a static multi-route surface served primarily by Cloudflare Pages, with Netlify/GitHub Pages fallback flows. It currently has:
- Homepage: `index.html`
- Full menu page: `menu/index.html` (`/menu/`)
- Events landing page: `eventos/index.html` (`/eventos/`)

There is no build step — the HTML, CSS, and JavaScript are deployed directly.

| Aspect | Details |
|--------|---------|
| Entry points | `index.html` (homepage), `menu/index.html` (full menu page), `eventos/index.html` (Pizza Party editorial landing) |
| Styles | `styles.css` (~2,600 lines, 75KB) |
| Scripts | 13 files in `js/` + shared runtime modules/assets in `shared/` + data loaders in `src/data/` |
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
| **Featured Items** | `<section>` | `#mas-pedidas` | 140–172 | `js/mas-pedidas.js` (uses card template) |
| **Delivery** | `<section>` | `.delivery-section` | 175–234 | `js/home-config.js` |
| **Testimonials** | `<section>` | `#testimonials` | 236–312 | `js/testimonials.js` (carousel) |
| **Events** | `<section>` | `#eventos-tabs` | 314–394 | `js/events-tabs.js` (tabbed display) |
| **Footer** | `<footer>` | `.site-footer` | 400–539 | `js/home-config.js` |

### Templates

| Template | ID | Used by | Purpose |
|----------|-----|---------|---------|
| Menu item card | `mas-pedidas-card-template` | `js/mas-pedidas.js` | Renders each menu item as a card |
| Testimonial card | `testimonial-card-template` | `js/testimonials.js` | Renders each testimonial entry |

## Menu Route Map (`/menu/`)

| Area | File | Purpose |
|------|------|---------|
| Head bootstrap | `shared/public-navbar-bootstrap.js` | Seeds the compact mobile navbar state before route CSS paints |
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

---

## JavaScript Architecture

### Script Loading Order

Homepage (`index.html`) scripts are loaded with `defer` and execute in order after HTML parsing:

```
1.  shared/public-paths.js      — Shared site-base helper for root + GitHub Pages subpath hosting
2.  shared/figata-cover-transition.js — Shared transition engine
3.  js/menu-route-transition.js — Navbar `/menu/` transition handoff (home only)
4.  js/reload-cover.js          — Entry/reload cover transition
5.  shared/public-navbar.js     — Captures canonical navbar markup for cross-route reuse
6.  js/navbar-collapse.js       — Navbar collapse/expand animation controller
7.  js/eventos-page.js          — Applies the burger-nav variant only on pages that explicitly opt in, while the editorial/cotizador features stay scoped to `/eventos/`
8.  shared/menu-traits.js       — Trait/badge runtime helpers
9.  shared/menu-allergens.js    — Allergen runtime helpers
10. shared/menu-sensory.js      — Structured sensory profile schema/normalizer
11. src/data/media.js           — Media data loader
12. src/data/menu.js            — Menu data loader
13. src/data/home.js            — Home data loader
14. src/data/restaurant.js      — Restaurant data loader
15. src/data/ingredients.js     — Ingredients data loader
16. src/ui/ingredient-icon-row.js — Ingredient icon row component
17. js/home-lazy-images.js      — Lazy image loading (IntersectionObserver)
18. js/home-config.js           — Homepage section rendering (hero, delivery, footer, etc.)
19. js/mas-pedidas.js           — Featured menu renderer + preview transition consumer
20. js/testimonials.js          — Testimonials carousel
21. js/events-tabs.js           — Events tabbed section
22. shared/public-scroll-indicator.js — Native root-scroll progress meter
```

Additionally loaded (non-deferred):
- `shared/public-navbar-bootstrap.js` — synchronous head bootstrap that seeds the compact mobile navbar before first paint
- `netlify-identity-widget.js` from CDN — for admin redirect handling

Menu page (`menu/index.html`) loads:

```
head. shared/public-navbar-bootstrap.js
1. shared/public-paths.js
2. shared/public-navbar.js
3. shared/figata-cover-transition.js
4. js/reload-cover.js
5. js/navbar-collapse.js
6. shared/menu-traits.js
7. shared/menu-allergens.js
8. shared/menu-sensory.js
9. src/data/media.js
10. src/data/menu.js
11. src/data/ingredients.js
12. js/menu-page.js
13. js/menu-page-navbar.js
14. shared/public-scroll-indicator.js
```

Eventos page (`eventos/index.html`) loads:

```
head. shared/public-navbar-bootstrap.js
1. shared/public-paths.js
2. shared/public-navbar.js
3. js/navbar-collapse.js
4. js/eventos-page.js
5. shared/public-scroll-indicator.js
```

### GitHub Pages Notes

- `index.html` uses `<base href="./">` and route pages such as `menu/index.html` / `eventos/index.html` use `<base href="../">` so public assets and route links resolve correctly both at site root (`/`) and under the GitHub Pages project prefix (`/figata/`).
- `shared/public-paths.js` is the canonical helper for converting site-relative URLs and stripping the GitHub Pages project prefix from `window.location.pathname`.
- `404.html` redirects GitHub Pages deep-link misses back into the public menu shell so `/menu/:item` still works after direct navigation or refresh.

### Cloudflare Pages Notes

- `_redirects` defines the `/menu/:item` rewrite behavior used by Cloudflare Pages so deep links load the menu shell directly.
- Because Cloudflare redirects are evaluated before static file lookup, the route file includes an explicit static pass-through for `/menu/menu-page.css` before dynamic `/menu/:item` rules.
- `_headers` keeps every repo-served runtime asset on `must-revalidate`, including media and fonts, so deploys do not depend on manual cache-busting query params.

### Script Responsibilities

#### `js/home-config.js` (22KB, ~700 lines)
The central homepage controller. Fetches `data/home.json` and renders:
- Hero section (title, subtitle, background, CTAs)
- Announcement bar (conditional display)
- Featured items header (title, subtitle)
- Delivery section (platforms, icons)
- Footer (columns, links, CTAs, social icons)
- Navbar links
- Feature tabs content

**Data source:** `data/home.json`

#### `js/mas-pedidas.js` (34KB, ~900 lines)
The menu rendering engine. This is the largest JS file. Handles:
- Fetching `data/menu.json`, `data/categories.json`, `data/availability.json`, `data/media.json`
- Building the menu grid with sections and item cards
- Item modal/detail view
- Category filtering and navigation
- Image resolution and lazy loading
- Ingredient icon display
- Price formatting (DOP currency)

**Data sources:** `data/menu.json`, `data/categories.json`, `data/availability.json`, `data/media.json`, `data/ingredients.json`

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
- Menu-style navbar adaptation on mobile (burger button, animated icon, card menu panel, open/close states) only on pages that explicitly opt into that navbar variant, and only after a shared-navbar host has mounted when applicable
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
Events section with tabbed display. Fetches `data/home.json` (events section) and renders:
- Tab navigation for different event types
- Event cards with images, descriptions, and dates

**Data source:** `data/home.json` (events array)

#### `js/feature-tabs.js` (4KB, ~130 lines)
Feature highlights section with tabbed display. Renders feature cards showcasing restaurant attributes.

#### `shared/public-navbar.js`
Shared public navbar runtime module. Handles:
- Capturing canonical navbar markup from homepage (`index.html`)
- Caching canonical markup for reuse on multi-route pages
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
- Leaves desktop expansion to `js/navbar-collapse.js`

#### `js/navbar-collapse.js` (9KB, ~270 lines)
Navbar collapse animation controller:
- Computes responsive collapsed/expanded navbar width variables
- Uses hero sentinel to toggle `html.nav--collapsed` on homepage scroll
- Animates collapse progress with spring motion (`--nav-collapse` CSS variables)
- Supports non-hero routes via `data-nav-collapse-threshold="<px>"` on the page root/body
- Keeps the public navbar in the compact collapsed state across mobile viewports, while desktop retains the scroll-driven collapse behavior

#### `js/reload-cover.js` (6KB, ~170 lines)
Reload overlay animation:
- Uses `shared/figata-cover-transition.js` as the single transition engine
- Plays exit phase on page entry/reload
- Supports route handoff via `sessionStorage` (`figata:route-transition`)

#### `js/menu-route-transition.js`
Menu route transition binder:
- Intercepts only the navbar link to `/menu/` on home
- Plays transition enter phase in origin
- Sets handoff flag for destination exit phase
- Ignores modified clicks (`cmd/ctrl`, `_blank`, etc.)

#### `shared/figata-cover-transition.js`
Reusable cover transition engine:
- Public API: `window.FigataTransitions.createFigataTransition(config)`
- Methods: `playEnter`, `playExit`, `playEnterThenExit`, `cancel`, `isRunning`
- Shared by modal preview flow and route/reload transitions

#### `js/home-lazy-images.js` (1KB, ~40 lines)
Lazy image loading using IntersectionObserver for homepage images.

---

## Source Generators (`src/`)

The `src/` directory contains scripts that generate or process data:

| File | Lines | Purpose |
|------|------:|---------|
| `src/data/home.js` | 1,006 | Home page data generator — builds `data/home.json` structure |
| `src/data/menu.js` | 660 | Menu data generator — builds `data/menu.json` structure |
| `src/data/restaurant.js` | 434 | Restaurant data generator — builds `data/restaurant.json` |
| `src/data/media.js` | 302 | Media mapping generator — builds `data/media.json` |
| `src/data/ingredients.js` | 152 | Ingredients data generator — builds `data/ingredients.json` |
| `src/ui/ingredient-icon-row.js` | 52 | UI component: renders an ingredient icon row for the menu display |

These generators are loaded as `<script>` tags on the public site and execute at page load. They are NOT Node.js build-time scripts — they run in the browser.

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
src/data/*.js generate page data (in-browser)
    ↓
js/home-config.js fetches data/home.json
    → renders hero, announcement, delivery, footer, navbar
    ↓
js/mas-pedidas.js fetches data/menu.json + categories + availability + media + ingredients
    → renders menu grid with cards and modal
    ↓
js/testimonials.js reads home data (testimonials)
    → renders carousel
    ↓
js/events-tabs.js reads home data (events)
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
