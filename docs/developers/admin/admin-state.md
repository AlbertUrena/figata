# Admin State and Elements Registry

> **Read this doc when** debugging admin state issues, understanding what data is available at runtime, or adding new state properties or DOM element references.

## Contents

- [State Object](#state-object) — data, drafts, indexes, UI flags, sidebar, navigation, scroll spy
- [Editor Sub-States](#stateitemeditor) — itemEditor, ingredientsEditor, categoriesEditor, commandPalette
- [dragState](#dragstate)
- [Views Registry](#views-registry) — panel container elements
- [Elements Registry](#elements-registry) — ~100 DOM refs by functional area

---

## State Object

The `state` object is declared at the top of `admin/app/app.js` inside the main IIFE closure. It is the single source of truth for all admin panel runtime data.

### `state.data`
- **Type:** `object | null`
- **Set by:** `ensureDataLoaded()` after fetching all JSON endpoints
- **Shape:** `{ menu, categories, ingredients, availability, home, restaurant, media }`
- **Purpose:** Raw fetched data from `data/*.json`. Never modified directly — always copied to `state.drafts` first.

### `state.drafts`
Working copies of data being edited. Lazily initialized from `state.data`.

| Key | Type | Init function | Modified by |
|-----|------|--------------|------------|
| `menu` | `object | null` | `ensureMenuDraft()` | Menu browser, item editor |
| `availability` | `object | null` | `ensureMenuDraft()` | Item editor |
| `home` | `object | null` | `ensureHomeDraft()` | Home editor |
| `ingredients` | `object | null` | `ensureIngredientsDraft()` | Ingredients editor |
| `categories` | `object | null` | `ensureCategoriesDraft()` | Categories editor |
| `restaurant` | `object | null` | `ensureRestaurantDraft()` | Restaurant editor |
| `media` | `object | null` | `ensureMediaDraft()` | Media editor |

Drafts are persisted to `localStorage` for crash recovery via `FigataAdmin.drafts`.

### `state.indexes`
Derived indexes built from loaded data. Rebuild on data load.

| Key | Type | Purpose |
|-----|------|---------|
| `categoryList` | `array` | Ordered list of category objects |
| `categoriesById` | `object` | Category lookup by ID |
| `ingredientsById` | `object` | Ingredient lookup by ID |
| `ingredientList` | `array` | Ordered list of ingredient objects |
| `iconsById` | `object` | Icon lookup by key |
| `iconList` | `array` | Ordered list of icon objects |
| `iconUsageByKey` | `object` | Map of icon key → array of ingredient IDs using it |
| `allergensById` | `object` | Allergen lookup by ID |
| `allergenList` | `array` | Ordered list of allergen objects |
| `mediaPaths` | `array` | All known media filenames |
| `localMenuMediaPaths` | `array` | Local dev server media paths |
| `menuMediaPathSet` | `object` | Hash set of all known media paths (for fast lookup) |

### `state` — UI flags

| Property | Type | Purpose |
|----------|------|---------|
| `isDataLoading` | `boolean` | True while fetching data from endpoints |
| `hasDataLoaded` | `boolean` | True after initial data fetch completes |
| `isPublishing` | `boolean` | True during publish operation |
| `currentPanel` | `string` | Active panel ID (target of the last navigation, including `pages-editor`, `restaurant-editor`, and `media-editor`) |
| `visiblePanel` | `string` | Currently visible panel (may differ during transitions) |

### `state` — Sidebar

| Property | Type | Purpose |
|----------|------|---------|
| `sidebarCollapsed` | `boolean` | Whether sidebar is in collapsed (narrow) mode |
| `sidebarAccordionOpenKey` | `string` | Key of the currently expanded sidebar accordion (`""`, `"menu"`, `"homepage"`, `"pages"`, `"ingredients"`, `"categories"`, `"restaurant"`, `"media"`) |
| `sidebarAccordionTransitionToken` | `number` | Counter for cancelling stale accordion animations |
| `sidebarIndicatorSyncFrame` | `number` | rAF ID for pending indicator position sync |
| `sidebarCollapseSyncToken` | `number` | Timer ID for pending sidebar collapse sync |

### `state.navigation`
Navigation state machine sub-state.

| Property | Type | Purpose |
|----------|------|---------|
| `currentState` | `string` | Current FSM state (see `NAVIGATION_STATES` in constants) |
| `currentPanel` | `string` | Panel the navigation system considers active |
| `currentSection` | `string` | Active section/anchor within the current panel |
| `isProgrammaticScroll` | `boolean` | True during code-driven scrolls (suppresses scroll spy) |

Related top-level properties:

| Property | Type | Purpose |
|----------|------|---------|
| `navigationTimelineToken` | `number` | Monotonic counter — incremented on each new navigation timeline |
| `navigationTimelineActiveToken` | `number` | Token of the currently running timeline |
| `isPanelTransitioning` | `boolean` | True during panel transition animation |
| `programmaticScrollLockUntil` | `number` | Timestamp until which scroll spy is suppressed |
| `programmaticScrollLockTimer` | `number` | Timer ID for scroll lock expiry |

### `state.panelPostNavigationActions`
Callback queues executed after a panel transition completes.

```js
{
  "menu-browser": null | function,
  "home-editor": null | function,
  "pages-editor": null | function,
  "ingredients-editor": null | function,
  "categories-editor": null | function,
  "restaurant-editor": null | function,
  "media-editor": null | function
}
```

### `state` — Scroll spy state (per panel)

| Properties | Panel |
|-----------|-------|
| `menuActiveAnchor` `{ categoryId, subcategoryId }`, `menuViewGroups`, `menuAnchorTargets`, `menuScrollSpyFrame` | Menu browser |
| `homeActiveSectionId`, `homeAnchorTargets`, `homeScrollSpyFrame` | Home editor |
| `pagesActiveSectionId`, `pagesAnchorTargets`, `pagesScrollSpyFrame` | Pages editor |
| `ingredientsAnchorTargets`, `ingredientsScrollSpyFrame` | Ingredients editor |
| `categoriesAnchorTargets`, `categoriesScrollSpyFrame` | Categories editor |
| `restaurantActiveSectionId`, `restaurantAnchorTargets`, `restaurantScrollSpyFrame` | Restaurant editor |
| `mediaActiveSectionId`, `mediaAnchorTargets`, `mediaScrollSpyFrame` | Media editor |

### `state.itemEditor`
Item editor sub-state.

| Property | Type | Purpose |
|----------|------|---------|
| `isOpen` | `boolean` | Whether the item editor panel is showing |
| `isNew` | `boolean` | True if creating a new item (vs editing existing) |
| `activeTab` | `string` | Active tab ID (`"basic"`, `"descriptions"`, `"ingredients"`, `"traits"`, `"allergens"`, `"media"`, `"availability"`) |
| `sourceSectionId` | `string` | Section ID of the item being edited |
| `sourceItemIndex` | `number` | Index within the section's items array (-1 for new) |
| `draft` | `object | null` | Working copy of the item being edited |
| `ingredients` | `array` | Selected ingredient IDs for the item |
| `allergens` | `array` | Selected allergen IDs |
| `availability` | `object` | `{ available: boolean, soldOutReason: string }` |

### `state.ingredientsEditor`
Ingredients editor sub-state.

| Property | Type | Purpose |
|----------|------|---------|
| `tab` | `string` | Active tab (`"ingredients"` or `"icons"`) |
| `lastRenderedTab` | `string` | Last tab that was rendered (for animation tracking) |
| `view` | `string` | Current view within ingredients tab (`"catalog"` or `"detail"`) |
| `search` | `string` | Current search query in catalog |
| `activeCategoryId` | `string` | Selected filter category |
| `catalogSections` | `array | null` | Cached rendered section data |
| `selectedIngredientId` | `string` | ID of ingredient being edited |
| `selectedIsNew` | `boolean` | True if creating a new ingredient |
| `draft` | `object | null` | Working copy of the ingredient |
| `validationReport` | `object | null` | Result of `validateIngredientsDraftData()` |
| `iconsView` | `string` | Current view within icons tab (`"catalog"` or `"detail"`) |
| `iconSearch` | `string` | Search query in icon catalog |
| `selectedIconKey` | `string` | Key of icon being edited |
| `selectedIconIsNew` | `boolean` | True if creating a new icon |
| `iconDraft` | `object | null` | Working copy of the icon |
| `tabAnimationFrame` | `number` | rAF ID for tab switch animation |
| `tabAnimationTimer` | `number` | Timer ID for tab animation delay |
| `tabAnimationTargetVisibilityMap` | `object | null` | Target visibility state during tab animation |

### `state.categoriesEditor`
Categories editor sub-state.

| Property | Type | Purpose |
|----------|------|---------|
| `activeCategoryId` | `string` | ID of the category being edited |
| `validationReport` | `object | null` | Result of `validateCategoriesDraftData()` |
| `usageByCategoryId` | `object` | Map of category ID → number of menu items in that category |
| `draftBySourceIndex` | `object` | Draft data keyed by original source index |
| `newDraft` | `object | null` | Draft for a new category being created |

### `state.commandPalette`

| Property | Type | Purpose |
|----------|------|---------|
| `isOpen` | `boolean` | Whether the command palette is visible |
| `selectedIndex` | `number` | Highlighted item index |

---

## `dragState`

Separate from `state`, `dragState` tracks drag-and-drop operations:

```js
{
  ingredientIndex: null | number,         // dragging ingredient within chip list
  featuredIndex: null | number,           // dragging featured item in home editor
  featuredDropIndex: null | number,       // drop target for featured items
  categoryOrderIndex: null | number,     // dragging category in order list
  categoryOrderDropIndex: null | number  // drop target for category reorder
}
```

---

## Views Registry

The `views` object maps panel names to their container DOM elements:

| Key | Element ID | Used for |
|-----|-----------|----------|
| `login` | `login-view` | Login screen (shown before auth) |
| `dashboard` | `dashboard-view` | Dashboard wrapper (includes sidebar) |
| `dashboardPanel` | `dashboard-panel` | Dashboard content panel |
| `menuBrowserPanel` | `menu-browser-panel` | Menu browser panel |
| `menuItemPanel` | `menu-item-panel` | Item editor panel |
| `homeEditorPanel` | `home-editor-panel` | Homepage editor panel |
| `pagesEditorPanel` | `pages-editor-panel` | Pages editor panel |
| `ingredientsEditorPanel` | `ingredients-editor-panel` | Ingredients editor panel |
| `categoriesEditorPanel` | `categories-editor-panel` | Categories editor panel |
| `restaurantEditorPanel` | `restaurant-editor-panel` | Restaurant editor panel |
| `mediaEditorPanel` | `media-editor-panel` | Media editor panel |

Panel visibility is controlled by `applyPanelVisibility()` in the panels module.

---

## Elements Registry

The `elements` object references ~100 DOM elements by ID. Organized by functional area:

### Sidebar (~23 refs)
`sidebar`, `sidebarNav`, `sidebarNavActiveIndicator`, `sidebarHomeButton`, `sidebarToggleButton`, `sidebarSearchButton`, `sidebarNavDashboard`, `sidebarNavMenu`, `sidebarNavHomepage`, `sidebarNavPages`, `sidebarNavIngredients`, `sidebarNavCategories`, `sidebarNavRestaurant`, `sidebarNavMedia`, `sidebarMenuAccordion`, `sidebarHomepageAccordion`, `sidebarPagesAccordion`, `sidebarIngredientsAccordion`, `sidebarCategoriesAccordion`, `sidebarRestaurantAccordion`, `sidebarMediaAccordion`, `sidebarUserButton`, `sidebarUserMenu`, `sidebarUserMenuName`, `sidebarUserMenuEmail`

### Command Palette (6 refs)
`commandPaletteShell`, `commandPaletteOverlay`, `commandPaletteDialog`, `commandPaletteInput`, `commandPaletteList`, `commandPaletteLive`

### Auth/Session (6 refs)
`loginButton`, `logoutButton`, `sessionName`, `sessionEmail`, `sessionAvatar`, `loginMessage`

### Dashboard (10 refs)
`dataStatus`, `draftsBanner`, `draftsBannerText`, `draftsBannerExportButton`, `draftsBannerClearButton`, `refreshDataButton`, `dashboardContent`, `metricMenu`, `metricCategories`, `metricAvailability`, `metricHome`, `metricIngredients`, `metricRestaurant`, `metricMedia`

### Panel Opener Buttons (7 refs)
`openMenuBrowserButton`, `openHomepageEditorButton`, `openPagesEditorButton`, `openIngredientsEditorButton`, `openCategoriesEditorButton`, `openRestaurantEditorButton`, `openMediaEditorButton`

### Menu Browser (4 refs)
`menuBrowserStatus`, `menuBrowserGroups`, `menuClearFilterButton`, `menuNewItemButton`

### Item Editor (~35 refs)
`itemEditorTitle`, `itemEditorStatus`, `itemEditorErrors`, `itemEditorActions`, `itemSaveButton`, `itemSaveCloseButton`, `itemExportJsonButton`, `itemPublishPreviewButton`, `itemPublishProductionButton`, `itemCancelButton`, `itemDeleteButton`, `itemTabs` (array), `itemTabPanels` (array), `itemFieldId`, `itemFieldName`, `itemFieldSlug`, `itemGenerateSlugButton`, `itemFieldCategory`, `itemFieldSubcategory`, `itemFieldPrice`, `itemPricePreview`, `itemFieldFeatured`, `itemFieldDescriptionShort`, `itemFieldDescriptionLong`, ingredient/allergen search inputs and chip lists, media picker/preview, availability toggle, derived trait containers, trait override controls, legacy summary, reviews field

### Home Editor (7 refs)
`homeEditorStatus`, `homeSectionsContent`, `homeSaveButton`, `homeExportJsonButton`, `homePublishPreviewButton`, `homePublishProductionButton`

### Ingredients Editor (~40 refs)
Tab navigation, catalog/detail views for both ingredients and icons, search inputs, field inputs, save/delete buttons, validation summaries, icon preview, alias management, V2 metadata controls (`dietary_profile`, `content_flags`, `experience_signals`, `internal_traits`) and allergen selectors

### Categories Editor (7 refs)
`categoriesEditorStatus`, `categoriesEditorWarning`, `categoriesCardsSummary`, `categoriesCardsContent`, `categoriesOrderList`, `categoriesNewButton`, `categoriesExportJsonButton`, `categoriesClearDraftsButton`, `categoriesValidationSummary`

### Preview (7 refs)
`previewCardImage`, `previewCardName`, `previewCardShort`, `previewCardBadges`, `previewModalImage`, `previewModalName`, `previewModalLong`, `previewModalPrice`

### Misc
`topbar` (`.topbar` element)
