# Homepage Configuration

> **Read this doc when** modifying how `data/home.json` is rendered on the public site, changing homepage section behavior, or debugging visibility/toggle issues.

---

## Overview

The homepage is driven by `data/home.json`. Two systems consume this data:

| Consumer | File | Purpose |
|----------|------|---------|
| **Public site** | `js/home-config.js` (661 lines) | Reads `home.json` at page load and applies content to pre-existing HTML elements |
| **Admin panel** | Homepage Editor in `admin/app/app.js` | Reads/writes `home.json` via the draft system (see `admin-editors.md`) |

---

## Public-Side Rendering (`js/home-config.js`)

### Architecture

The script is a single IIFE that:
1. Waits for `window.FigataData.home.getHomeConfig()` to resolve
2. Also loads `window.FigataData.restaurant.getRestaurantConfig()` (for footer data)
3. Calls one `apply*` function per section
4. Calls `applySectionToggles()` at the end to show/hide sections

### Apply Functions

| Function | Section | What it sets |
|----------|---------|-------------|
| `applyHero(hero, fallback)` | Hero | Title, subtitle, background image (with preload + fallback), CTA buttons |
| `applyNavbar(navbar)` | Navbar | Navigation links (rebuilt from config), CTA button with icon |
| `applyPopular(popular)` | Featured Items | Title and subtitle only (cards rendered by `mas-pedidas.js`) |
| `applyDelivery(delivery)` | Delivery | Title, subtitle, platform links + icons |
| `applyTestimonials(testimonials)` | Testimonials | Title and subtitle (carousel rendered by `testimonials.js`) |
| `applyEventsPreview(events)` | Events | Title, subtitle, tab items (up to limit), tab rail spacers |
| `applyAnnouncements(announcements)` | Announcement | Type badge (highlight/warning/info), message, link |
| `applyFooter(footer, restaurant)` | Footer | Column titles, links, social URLs, CTA, address, brand, contact info |
| `applySectionToggles(home, flags)` | All | Show/hide each section based on `home.sections.*` booleans + enabled flags |

### Section Visibility Logic

Each section has **two** visibility controls:

1. **`home.sections.<key>`** — master toggle (boolean in the `sections` object)
2. **`home.<section>.enabled`** — section-level enabled flag (for sections that have it)

Both must be `true` for the section to display. Some sections have additional conditions:

| Section | Visible when |
|---------|-------------|
| Hero | `sections.hero` |
| Navbar | `sections.navbar` |
| Popular | `sections.popular` |
| Delivery | `sections.delivery` |
| Testimonials | `sections.testimonials` AND `testimonials.enabled` |
| Events | `sections.events` AND `eventsPreview.enabled` AND has renderable items |
| Announcements | `sections.announcements` AND `announcements.enabled` AND message is non-empty |
| Footer | `sections.footer` AND `footer.enabled` |

### Hero Image Loading

The hero background uses a two-stage loading strategy:
1. **Preload link:** Injected into `<head>` with `fetchpriority="high"` for the hero image
2. **Probe image:** A hidden `Image()` element loads the configured path first. On success, applies it as CSS `background-image`. On error, falls back to the default background.

### Delivery Platform Icons

Each delivery platform (e.g., Uber Eats, PedidosYa) supports:
- Custom URL from `delivery.platforms.<key>.url` (with fallback to legacy `delivery.links.<key>`)
- Custom icon path from `delivery.platforms.<key>.icon`
- Custom icon size from `delivery.platforms.<key>.iconSize` (clamped to 16–64px)
- Default icon from `data-delivery-default-icon` HTML attribute

### Footer Rendering

The footer merges three data sources:
1. `home.footer.columns` — column titles and link arrays
2. `home.footer.socials` — social media URL overrides
3. `restaurant.social` — social media URLs from restaurant config (fallback)

Resolution order for social URLs: column link URL → footer socials override → restaurant social.

---

## home.json Section Reference

For the full `home.json` schema with all fields, see `docs/developers/data/data-layer.md`.

Quick reference of top-level keys consumed by `home-config.js`:

| Key | Public renderer | Admin editor section |
|-----|----------------|---------------------|
| `hero` | `applyHero()` | Hero editor |
| `navbar` | `applyNavbar()` | Navbar editor |
| `popular` | `applyPopular()` | Featured Items editor |
| `delivery` | `applyDelivery()` | Delivery editor |
| `testimonials` | `applyTestimonials()` | Testimonials editor |
| `eventsPreview` | `applyEventsPreview()` | Events editor |
| `announcements` | `applyAnnouncements()` | Announcements editor |
| `footer` | `applyFooter()` | Footer editor |
| `sections` | `applySectionToggles()` | Section toggle switches |

---

## Interaction with Other Scripts

| Script | Reads from home.json | How |
|--------|---------------------|-----|
| `js/mas-pedidas.js` | `popular.featuredIds`, `popular.limit` | Via `homeApi.getHomeConfig()` — determines which menu items to display as featured |
| `js/testimonials.js` | `testimonials` section | Via `homeApi.getHomeConfig()` — carousel items |
| `js/events-tabs.js` | `eventsPreview` section | Via `homeApi.getHomeConfig()` — tab content and selection |
