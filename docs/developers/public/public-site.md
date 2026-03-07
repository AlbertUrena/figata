# Public Site

> **Read this doc when** working on the customer-facing website: modifying layout, styling, homepage sections, menu display, testimonials, events, or anything involving `index.html`, `styles.css`, or `js/*.js`.

---

## Overview

The public site is a **single-page static website** served by Netlify. There is no build step — the HTML, CSS, and JavaScript are deployed directly.

| Aspect | Details |
|--------|---------|
| Entry point | `index.html` (~3,500 lines, 117KB) |
| Styles | `styles.css` (~2,600 lines, 75KB) |
| Scripts | 9 files in `js/` + 6 files in `src/data/` and `src/ui/` |
| Data | Fetches from `data/*.json` at runtime |
| Hosting | Netlify with aggressive cache headers for static assets |

---

## HTML Section Map

The page is structured as a single scrollable document. Major sections in `index.html`:

| Section | HTML Element | ID/Class | Lines (approx) | Rendered by |
|---------|-------------|----------|---------------:|-------------|
| **Navbar** | `<nav>` | `.navbar` | 78–102 | `js/navbar-collapse.js` |
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

---

## JavaScript Architecture

### Script Loading Order

All scripts are loaded with `defer` and execute in order after HTML parsing:

```
1.  js/reload-cover.js          — Page reload overlay
2.  js/navbar-collapse.js       — Mobile navbar behavior
3.  src/data/media.js           — Media data generator
4.  src/data/menu.js            — Menu data generator
5.  src/data/home.js            — Home data generator
6.  src/data/restaurant.js      — Restaurant data generator
7.  src/data/ingredients.js     — Ingredients data generator
8.  src/ui/ingredient-icon-row.js — Ingredient icon row component
9.  js/home-lazy-images.js      — Lazy image loading (IntersectionObserver)
10. js/home-config.js           — Homepage section rendering (hero, delivery, footer, etc.)
11. js/mas-pedidas.js           — Menu rendering engine
12. js/testimonials.js          — Testimonials carousel
13. js/events-tabs.js           — Events tabbed section
```

Additionally loaded (non-deferred):
- `netlify-identity-widget.js` from CDN — for admin redirect handling

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

#### `js/navbar-collapse.js` (9KB, ~270 lines)
Mobile navbar behavior:
- Hamburger menu toggle
- Smooth scroll to anchor sections
- Active section highlighting on scroll
- Transparent-to-solid navbar on scroll

#### `js/reload-cover.js` (6KB, ~170 lines)
Reload overlay animation:
- Shows a branded cover during page reload
- Crossfade transition on load

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
Public site loads in browser
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

---

## Common Modification Tasks

| Task | Files to modify | Notes |
|------|----------------|-------|
| Change hero text/image | `data/home.json` (hero section) | Or via admin homepage editor |
| Add menu item | `data/menu.json` (add to section) | Also update `data/media.json`, `data/availability.json` |
| Change menu card design | `js/mas-pedidas.js`, `styles.css` | Template in `index.html` at `#mas-pedidas-card-template` |
| Modify navbar links | `data/home.json` (navbar.links) | Rendered by `js/home-config.js` |
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
