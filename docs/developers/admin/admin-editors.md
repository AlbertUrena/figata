# Admin Editor Panels

> **Read this doc when** working on any native admin editor panel: Menu Browser, Item Editor, Homepage Editor, Pages Editor, Ingredients Editor, Categories Editor, Restaurant Editor, or Media Editor. Covers function locations, data flow, event bindings, and draft lifecycle.

## Contents

- [Overview](#overview) — common editor pattern
- [Panel Summary](#panel-summary)
- [Menu Browser](#menu-browser) — functions, data flow, features
- [Item Editor](#item-editor) — functions, tabs, state, save flow
- [Homepage Editor](#homepage-editor) — functions, sections, drag-and-drop
- [Ingredients Editor](#ingredients-editor) — functions, two-tab structure, validation
- [Categories Editor](#categories-editor) — functions, reorder, validation
- [Pages Editor](#pages-editor) — scaffold for unique site pages
- [Restaurant Editor](#restaurant-editor) — business metadata form
- [Media Editor](#media-editor) — per-item media variants and globals
- [Draft Lifecycle](#draft-lifecycle-all-editors) — persistence keys, ensure/save/publish flow
- [Event Binding Bootstrap](#event-binding-bootstrap)

---

## Overview

The admin panel has **eight native editor subsystems**, implemented in `app.js` and delegated panel modules. Each follows a consistent pattern:

1. **Open function** — opens the panel, initializes state, renders content
2. **Render function** — builds the panel's DOM (called on open and after data changes)
3. **Save function** — persists draft changes
4. **Bind function** — attaches event listeners (called once during bootstrap)
5. **Draft ensure function** — lazily creates a working copy from loaded data

---

## Panel Summary

| Panel | Open function | Render function | Bind function | Lines (approx) |
|-------|-------------|----------------|---------------|---------------:|
| Menu Browser | `openMenuBrowser()` | `renderMenuBrowser()` | `bindMenuBrowserEvents()` | ~1,500 |
| Item Editor | `openItemEditor()` / `openNewItemEditor()` | (inline in open) | `bindItemEditorEvents()` | ~1,000 |
| Homepage Editor | `openHomePageEditor()` | `renderHomeEditor()` | `bindHomeEditorEvents()` | ~1,700 |
| Ingredients Editor | `openIngredientsEditor()` | `renderIngredientsEditor()` | `bindIngredientsEditorEvents()` | ~2,300 |
| Categories Editor | `openCategoriesEditor()` | `renderCategoriesEditor()` | `bindCategoriesEditorEvents()` | ~600 |
| Pages Editor | `openPagesEditor()` | `window.FigataAdmin.pagesPanel.render()` | `window.FigataAdmin.pagesPanel.bindEvents()` | ~260 |
| Restaurant Editor | `openRestaurantEditor()` | `window.FigataAdmin.restaurantPanel.render()` | `window.FigataAdmin.restaurantPanel.bindEvents()` | ~320 |
| Media Editor | `openMediaEditor()` | `window.FigataAdmin.mediaPanel.render()` | `window.FigataAdmin.mediaPanel.bindEvents()` | ~350 |

---

## Menu Browser

### Key Functions

| Function | Line | Purpose |
|----------|------|---------|
| `ensureMenuDraft()` | ~897 | Deep-clone `state.data.menu` and `state.data.availability` into `state.drafts` |
| `getMenuSections()` | ~2464 | Return the sections array from the menu draft |
| `getAllMenuItems()` | ~2469 | Flatten all items across all sections |
| `buildMenuGroups()` | ~2558 | Build the grouped view model for the menu browser |
| `scrollToMenuAnchor()` | ~2816 | Scroll to a category/subcategory heading |
| `setActiveMenuAnchor()` | ~2855 | Highlight the active sidebar anchor |
| `renderMenuBrowser()` | ~3064 | Build the full menu browser DOM |
| `openMenuBrowser()` | ~3995 | Open the menu browser panel |
| `bindMenuBrowserEvents()` | ~8341 | Attach search, filter, new-item, and card click events |

### Data Flow

```
state.data.menu → ensureMenuDraft() → state.drafts.menu
                                        ↓
                                   buildMenuGroups()
                                        ↓
                                   renderMenuBrowser()
                                        ↓
                                   DOM (menu-browser-panel)
```

### Menu Browser Features
- **Section groups:** Items grouped by category/subcategory
- **Search:** Filters items by name (real-time)
- **Category filter:** Filter by category via sidebar accordion links
- **New item:** Opens the item editor with blank fields
- **Card click:** Opens the item editor for the selected item

---

## Item Editor

### Key Functions

| Function | Line | Purpose |
|----------|------|---------|
| `openItemEditor(itemId, options)` | ~3525 | Open editor for an existing menu item |
| `openNewItemEditor(options)` | ~3614 | Open editor for a new menu item |
| `bindItemEditorEvents()` | ~8429 | Attach tab switching, field change, save, delete, and media picker events |

### Tabs

The item editor has 6 tabs:

| Tab ID | Name | Fields |
|--------|------|--------|
| `basic` | Basic Info | ID, name, slug, category, subcategory, price, featured flag |
| `description` | Description | Short description, long description |
| `meta` | Meta | Dietary flags (spicy, vegetarian, etc.) |
| `media` | Media | Image picker (card, hover, modal variants) |
| `availability` | Availability | Available toggle, sold-out reason |
| `advanced` | Advanced | Ingredients, tags, allergens chip lists |

### State

The item editor state is stored in `state.itemEditor`:
- `isOpen`, `isNew`, `activeTab`, `sourceSectionId`, `sourceItemIndex`
- `draft` — working copy of the item being edited
- `ingredients`, `tags`, `allergens` — selected IDs
- `availability` — `{ available, soldOutReason }`

### Save Flow

```
User edits fields → state.itemEditor.draft updated
    ↓
Save button clicked
    ↓
Validate required fields (id, name, category)
    ↓
Write back to state.drafts.menu (insert or update)
    ↓
Update state.drafts.availability
    ↓
persistDraftsToLocalStorage()
    ↓
Re-render menu browser if visible
```

---

## Homepage Editor

### Key Functions

| Function | Line | Purpose |
|----------|------|---------|
| `ensureHomeDraft()` | ~1949 | Deep-clone `state.data.home` into `state.drafts.home` |
| `normalizeHomeDraft(draft)` | (internal) | Ensure all homepage sections have correct defaults |
| `setActiveHomeSection()` | ~5058 | Highlight the active section in sidebar |
| `scrollToHomeSection()` | ~5075 | Scroll to a section within the home editor panel |
| `renderHomeEditor()` | ~5501 | Build the full home editor DOM with all sections |
| `saveHomeEditorChanges()` | ~5700 | Persist home draft to localStorage |
| `openHomePageEditor()` | ~5712 | Open the home editor panel |
| `bindHomeEditorEvents()` | ~8602 | Attach section toggle, field edit, featured item reorder, events editor, and footer editor events |

### Sections Rendered

The home editor renders one editable section per `home.json` top-level key:

| Section | Editable Fields |
|---------|----------------|
| Hero | Title, subtitle, background image, CTA primary, CTA secondary |
| Navbar | Links (label+url pairs), CTA button |
| Announcements | Type (highlight/warning/info), message, enabled toggle |
| Popular | Title, subtitle, featured item IDs (drag-reorder), limit |
| Delivery | Title, subtitle, platform links + icons |
| Testimonials | Title, subtitle, enabled toggle |
| Events | Title, subtitle, items (title+subtitle pairs), enabled toggle, limit |
| Footer | Column titles, links, social URLs, CTA, enabled toggle |

### Drag-and-Drop

The home editor supports drag-and-drop reordering for **featured items** (popular section). Drag state is tracked in `dragState.featuredIndex` and `dragState.featuredDropIndex`.

---

## Ingredients Editor

### Key Functions

| Function | Line | Purpose |
|----------|------|---------|
| `ensureIngredientsDraft()` | ~925 | Deep-clone `state.data.ingredients` into `state.drafts.ingredients` |
| `normalizeIngredientsAliasesPayload()` | ~1098 | Clean up aliases before publish |
| `renderIngredientsEditorValidationSummary()` | ~5930 | Show validation errors/warnings |
| `renderIngredientsEditor()` | ~7203 | Build the full ingredients editor DOM |
| `openIngredientsEditor(options)` | ~7296 | Open the ingredients editor panel |
| `beginNewIngredientDraft(options)` | ~7351 | Start creating a new ingredient |
| `selectIngredientForEditing(id, options)` | ~7372 | Open an existing ingredient for editing |
| `saveIngredientsEditorDraft()` | ~7645 | Persist ingredient changes |
| `bindIngredientsEditorEvents()` | ~9120 | Attach search, tab switching, detail editing, icon picker, and validation events |

### Two-Tab Structure

| Tab | View modes | Content |
|-----|-----------|---------|
| **Ingredients** | Catalog → Detail | Browse/search ingredients, edit individual ingredient (name, aliases, icon, category, tags, allergens) |
| **Icons** | Catalog → Detail | Browse/search icons, edit individual icon (key, path, preview) |

### State

The ingredients editor state is in `state.ingredientsEditor` — see `admin-state.md` for the full shape.

### Validation

Uses `shared/ingredients-contract.js`. Validation runs:
- On save (client-side)
- On publish (both client and server-side)
- Results stored in `state.ingredientsEditor.validationReport`

---

## Categories Editor

### Key Functions

| Function | Line | Purpose |
|----------|------|---------|
| `ensureCategoriesDraft()` | ~1012 | Deep-clone `state.data.categories` into `state.drafts.categories` |
| `openCategoriesEditor(options)` | ~4015 | Open the categories editor panel |
| `renderCategoriesValidationSummary()` | ~4242 | Show validation errors/warnings |
| `renderCategoriesGlobalWarnings()` | ~4259 | Show global warnings (e.g., orphaned categories) |
| `renderCategoriesOrderList()` | ~4410 | Render drag-and-drop reorder list |
| `renderCategoriesEditor()` | ~4438 | Build the full categories editor DOM |
| `saveCategoryDraftBySourceIndex()` | ~4575 | Persist category changes by source index |
| `bindCategoriesEditorEvents()` | ~9355 | Attach reorder, edit, new-category, and validation events |

### Features
- **Category cards:** Each category shows name, visibility toggle, item count, and order
- **Drag-and-drop reordering:** Uses `dragState.categoryOrderIndex` and `dragState.categoryOrderDropIndex`
- **Validation:** Uses `shared/categories-contract.js`
- **Usage counts:** `state.categoriesEditor.usageByCategoryId` maps category ID → number of menu items using it

---

## Pages Editor

### Key Functions

| Function | Purpose |
|----------|---------|
| `openPagesEditor(options)` | Open the native Pages panel and sync `#/pages` |
| `pagesPanel.render(ctx)` | Render the scaffold sections for unique site pages |
| `pagesPanel.bindEvents(ctx)` | Attach lightweight focus/navigation events |

### Notes

- Does **not** edit drafts yet; this panel is scaffold-only in the current phase
- Exposes section metadata so the shared sidebar accordion can render `menu`, `nosotros`, `ubicacion`, `contacto`, `eventos`, and `faqs`
- Uses the shared scroll-spy pattern from `app.js`/`panels.js` (same model as Restaurant/Media)

---

## Restaurant Editor

### Key Functions

| Function | Purpose |
|----------|---------|
| `openRestaurantEditor(options)` | Open the native Restaurant panel and sync `#/restaurant` |
| `restaurantPanel.render(ctx)` | Build the full `restaurant.json` editor form |
| `restaurantPanel.syncToDraft(ctx)` | Copy form values into `state.drafts.restaurant` and validate |
| `restaurantPanel.bindEvents(ctx)` | Attach delegated input/save/export/publish handlers |

### Notes

- Edits `state.drafts.restaurant`
- Validates with `shared/restaurant-contract.js`
- Publishes through the same `publishChanges()` flow as the other native panels
- Exposes section metadata so the shared sidebar accordion can render `identity`, `contact`, `location`, `hours`, `links`, `branding`, `seo`, and `metadata`
- Uses the shared scroll-spy pattern from `app.js`/`panels.js` instead of a panel-specific navigation system

---

## Media Editor

### Key Functions

| Function | Purpose |
|----------|---------|
| `openMediaEditor(options)` | Open the native Media panel and sync `#/media` |
| `mediaPanel.render(ctx)` | Build the grouped browser + global sections, or the dedicated item subview (`#/media/item/:id`) |
| `mediaPanel.bindEvents(ctx)` | Attach search, select, save, export, and publish handlers |

### Notes

- Edits `state.drafts.media`
- Validates with `shared/media-contract.js`
- Uses a dedicated item route (`#/media/item/:id`) instead of an inline detail section in the main flow
- Main panel sections are short and focused: `browser`, `homepage`, `brand`, `defaults`, `integrity`
- Browser cards are grouped by menu category (same scanning pattern as Menu, adapted for Media)
- Uses the shared scroll-spy pattern from `app.js`/`panels.js` instead of a panel-specific navigation system

---

## Draft Lifecycle (all editors)

```
1. Data loads → state.data.{key} populated
2. User opens editor → ensure{Key}Draft() creates state.drafts.{key}
3. User edits fields → state.drafts.{key} mutated in place
4. User saves → persistDraftsToLocalStorage() writes to localStorage
5. User publishes → state.drafts sent to server → data committed to Git
6. On reload → hydrateDraftsFromLocalStorage() restores unsaved drafts
```

### Draft Persistence Keys

| Draft | localStorage key |
|-------|-----------------|
| Menu | `figata_admin_drafts_menu` |
| Availability | `figata_admin_drafts_availability` |
| Home | `figata_admin_drafts_home` |
| Ingredients | `figata_admin_drafts_ingredients` |
| Categories | `figata_admin_drafts_categories` |
| Restaurant | `figata_admin_drafts_restaurant` |
| Media | `figata_admin_drafts_media` |
| Flag | `figata_admin_has_drafts` (set to `"1"` when any draft exists) |

---

## Event Binding Bootstrap

All `bind*Events()` functions are called **once** during app initialization in the `initAuth` flow (after login). They use `addEventListener` on elements from the `elements` registry.

Event binding order in `app.js`:
1. `bindMenuBrowserEvents()`
2. `bindItemEditorEvents()`
3. `bindHomeEditorEvents()`
4. `bindIngredientsEditorEvents()`
5. `bindCategoriesEditorEvents()`
6. `bindPagesEditorEvents()`
7. `bindRestaurantEditorEvents()`
8. `bindMediaEditorEvents()`
