(function () {
  // --- Constants (from modules/constants.js) ---
  var C = window.FigataAdmin.constants;
  var DATA_ENDPOINTS = C.DATA_ENDPOINTS;
  var SIDEBAR_COLLAPSE_KEY = C.SIDEBAR_COLLAPSE_KEY;
  var MENU_PLACEHOLDER_IMAGE = C.MENU_PLACEHOLDER_IMAGE;
  var MENU_MEDIA_ROOT = C.MENU_MEDIA_ROOT;
  var LOCAL_MEDIA_OPTIONS_ENDPOINT = C.LOCAL_MEDIA_OPTIONS_ENDPOINT;
  var LOCAL_DRAFTS_MENU_KEY = C.LOCAL_DRAFTS_MENU_KEY;
  var LOCAL_DRAFTS_AVAILABILITY_KEY = C.LOCAL_DRAFTS_AVAILABILITY_KEY;
  var LOCAL_DRAFTS_HOME_KEY = C.LOCAL_DRAFTS_HOME_KEY;
  var LOCAL_DRAFTS_INGREDIENTS_KEY = C.LOCAL_DRAFTS_INGREDIENTS_KEY;
  var LOCAL_DRAFTS_CATEGORIES_KEY = C.LOCAL_DRAFTS_CATEGORIES_KEY;
  var LOCAL_DRAFTS_FLAG_KEY = C.LOCAL_DRAFTS_FLAG_KEY;
  var LOCAL_SAVE_DRAFTS_ENDPOINT = C.LOCAL_SAVE_DRAFTS_ENDPOINT;
  var MENU_MODAL_PLACEHOLDER_IMAGE = C.MENU_MODAL_PLACEHOLDER_IMAGE;
  var DEV_AUTH_BYPASS_KEY = C.DEV_AUTH_BYPASS_KEY;
  var UX_TIMING = C.UX_TIMING;
  var DEBUG_NAVIGATION = C.DEBUG_NAVIGATION;
  var NAVIGATION_STATES = C.NAVIGATION_STATES;
  var NAVIGATION_STATE_GRAPH = C.NAVIGATION_STATE_GRAPH;
  var HOME_FEATURED_LIMIT = C.HOME_FEATURED_LIMIT;
  var HOME_ANNOUNCEMENT_TYPES = C.HOME_ANNOUNCEMENT_TYPES;
  var HOME_DEFAULT_NAVBAR_LINKS = C.HOME_DEFAULT_NAVBAR_LINKS;
  var HOME_DEFAULT_NAVBAR_ICON = C.HOME_DEFAULT_NAVBAR_ICON;
  var HOME_TESTIMONIALS_LIMIT = C.HOME_TESTIMONIALS_LIMIT;
  var HOME_FOOTER_COLUMNS_COUNT = C.HOME_FOOTER_COLUMNS_COUNT;
  var HOME_FOOTER_LINKS_LIMIT = C.HOME_FOOTER_LINKS_LIMIT;
  var HOME_FOOTER_SOCIAL_KEYS = C.HOME_FOOTER_SOCIAL_KEYS;
  var HOME_DELIVERY_ICON_MIN_SIZE = C.HOME_DELIVERY_ICON_MIN_SIZE;
  var HOME_DELIVERY_ICON_MAX_SIZE = C.HOME_DELIVERY_ICON_MAX_SIZE;
  var HOME_DELIVERY_PLATFORM_KEYS = C.HOME_DELIVERY_PLATFORM_KEYS;
  var HOME_DELIVERY_DEFAULTS = C.HOME_DELIVERY_DEFAULTS;
  var HOME_TESTIMONIALS_DEFAULT_ITEMS = C.HOME_TESTIMONIALS_DEFAULT_ITEMS;
  var HOME_FOOTER_DEFAULT_COLUMNS = C.HOME_FOOTER_DEFAULT_COLUMNS;
  var HOME_FOOTER_DEFAULT_CTA = C.HOME_FOOTER_DEFAULT_CTA;
  var HOME_FOOTER_DEFAULT_SOCIALS = C.HOME_FOOTER_DEFAULT_SOCIALS;
  var HOME_EDITOR_SECTIONS = C.HOME_EDITOR_SECTIONS;
  var INGREDIENT_CATEGORY_DEFINITIONS = C.INGREDIENT_CATEGORY_DEFINITIONS;
  var INGREDIENT_ISSUE_ICON_SVG = C.INGREDIENT_ISSUE_ICON_SVG;
  var INGREDIENT_NAV_BADGE_ICON_SVG = C.INGREDIENT_NAV_BADGE_ICON_SVG;
  var INGREDIENT_CATEGORY_BY_ID = C.INGREDIENT_CATEGORY_BY_ID;
  var INGREDIENT_CATEGORY_BY_ICON = C.INGREDIENT_CATEGORY_BY_ICON;
  var INGREDIENT_CATEGORY_KEYWORDS = C.INGREDIENT_CATEGORY_KEYWORDS;

  var state = {
    data: null,
    drafts: {
      menu: null,
      availability: null,
      home: null,
      ingredients: null,
      categories: null
    },
    indexes: {
      categoryList: [],
      categoriesById: {},
      ingredientsById: {},
      ingredientList: [],
      iconsById: {},
      iconList: [],
      iconUsageByKey: {},
      tagsById: {},
      tagList: [],
      allergensById: {},
      allergenList: [],
      mediaPaths: [],
      localMenuMediaPaths: [],
      menuMediaPathSet: {}
    },
    isDataLoading: false,
    hasDataLoaded: false,
    isPublishing: false,
    currentPanel: "dashboard",
    visiblePanel: "dashboard",
    sidebarCollapsed: false,
    sidebarAccordionOpenKey: "",
    sidebarAccordionTransitionToken: 0,
    sidebarIndicatorSyncFrame: 0,
    sidebarCollapseSyncToken: 0,
    navigationTimelineToken: 0,
    navigationTimelineActiveToken: 0,
    isPanelTransitioning: false,
    navigation: {
      currentState: NAVIGATION_STATES.idle,
      currentPanel: "dashboard",
      currentSection: "",
      isProgrammaticScroll: false
    },
    programmaticScrollLockUntil: 0,
    programmaticScrollLockTimer: 0,
    panelPostNavigationActions: {
      "menu-browser": null,
      "home-editor": null,
      "ingredients-editor": null,
      "categories-editor": null
    },
    menuActiveAnchor: {
      categoryId: "",
      subcategoryId: ""
    },
    menuViewGroups: [],
    menuAnchorTargets: [],
    menuScrollSpyFrame: 0,
    homeActiveSectionId: "",
    homeAnchorTargets: [],
    homeScrollSpyFrame: 0,
    ingredientsAnchorTargets: [],
    ingredientsScrollSpyFrame: 0,
    categoriesAnchorTargets: [],
    categoriesScrollSpyFrame: 0,
    itemEditor: {
      isOpen: false,
      isNew: false,
      activeTab: "basic",
      sourceSectionId: "",
      sourceItemIndex: -1,
      draft: null,
      ingredients: [],
      tags: [],
      allergens: [],
      availability: {
        available: true,
        soldOutReason: ""
      }
    },
    ingredientsEditor: {
      tab: "ingredients",
      lastRenderedTab: "ingredients",
      view: "catalog",
      search: "",
      activeCategoryId: "",
      catalogSections: null,
      selectedIngredientId: "",
      selectedIsNew: false,
      draft: null,
      validationReport: null,
      iconsView: "catalog",
      iconSearch: "",
      selectedIconKey: "",
      selectedIconIsNew: false,
      iconDraft: null,
      tabAnimationFrame: 0,
      tabAnimationTimer: 0,
      tabAnimationTargetVisibilityMap: null
    },
    categoriesEditor: {
      activeCategoryId: "",
      validationReport: null,
      usageByCategoryId: {},
      draftBySourceIndex: {},
      newDraft: null
    },
    commandPalette: {
      isOpen: false,
      selectedIndex: 0
    }
  };

  var views = {
    login: document.getElementById("login-view"),
    dashboard: document.getElementById("dashboard-view"),
    dashboardPanel: document.getElementById("dashboard-panel"),
    menuBrowserPanel: document.getElementById("menu-browser-panel"),
    menuItemPanel: document.getElementById("menu-item-panel"),
    homeEditorPanel: document.getElementById("home-editor-panel"),
    ingredientsEditorPanel: document.getElementById("ingredients-editor-panel"),
    categoriesEditorPanel: document.getElementById("categories-editor-panel")
  };

  var elements = {
    sidebar: document.getElementById("admin-sidebar"),
    sidebarNav: document.querySelector(".sidebar-nav"),
    sidebarNavActiveIndicator: document.getElementById("sidebar-nav-active-indicator"),
    sidebarHomeButton: document.getElementById("sidebar-home-button"),
    sidebarToggleButton: document.getElementById("sidebar-toggle-button"),
    sidebarSearchButton: document.getElementById("sidebar-search-button"),
    sidebarNavDashboard: document.getElementById("sidebar-nav-dashboard"),
    sidebarNavMenu: document.getElementById("sidebar-nav-menu"),
    sidebarNavHomepage: document.getElementById("sidebar-nav-homepage"),
    sidebarNavIngredients: document.getElementById("sidebar-nav-ingredients"),
    sidebarNavCategories: document.getElementById("sidebar-nav-categories"),
    sidebarMenuAccordion: document.getElementById("sidebar-menu-accordion"),
    sidebarHomepageAccordion: document.getElementById("sidebar-homepage-accordion"),
    sidebarIngredientsAccordion: document.getElementById("sidebar-ingredients-accordion"),
    sidebarCategoriesAccordion: document.getElementById("sidebar-categories-accordion"),
    sidebarUserButton: document.getElementById("sidebar-user-button"),
    sidebarUserMenu: document.getElementById("sidebar-user-menu"),
    sidebarUserMenuName: document.getElementById("sidebar-user-menu-name"),
    sidebarUserMenuEmail: document.getElementById("sidebar-user-menu-email"),
    dashboardContent: document.querySelector(".dashboard-content"),
    commandPaletteShell: document.getElementById("command-palette-shell"),
    commandPaletteOverlay: document.getElementById("command-palette-overlay"),
    commandPaletteDialog: document.getElementById("command-palette-dialog"),
    commandPaletteInput: document.getElementById("command-palette-input"),
    commandPaletteList: document.getElementById("command-palette-list"),
    commandPaletteLive: document.getElementById("command-palette-live"),

    loginButton: document.getElementById("login-button"),
    logoutButton: document.getElementById("logout-button"),
    refreshDataButton: document.getElementById("refresh-data-button"),
    openMenuBrowserButton: document.getElementById("open-menu-browser-button"),
    openHomepageEditorButton: document.getElementById("open-homepage-editor-button"),
    openIngredientsEditorButton: document.getElementById("open-ingredients-editor-button"),
    openCategoriesEditorButton: document.getElementById("open-categories-editor-button"),

    sessionName: document.getElementById("session-name"),
    sessionEmail: document.getElementById("session-email"),
    sessionAvatar: document.getElementById("session-avatar"),
    loginMessage: document.getElementById("login-message"),
    dataStatus: document.getElementById("data-status"),
    draftsBanner: document.getElementById("drafts-banner"),
    draftsBannerText: document.getElementById("drafts-banner-text"),
    draftsBannerExportButton: document.getElementById("drafts-banner-export-button"),
    draftsBannerClearButton: document.getElementById("drafts-banner-clear-button"),

    metricMenu: document.getElementById("metric-menu"),
    metricHome: document.getElementById("metric-home"),
    metricIngredients: document.getElementById("metric-ingredients"),
    metricAvailability: document.getElementById("metric-availability"),
    metricCategories: document.getElementById("metric-categories"),
    metricRestaurant: document.getElementById("metric-restaurant"),
    metricMedia: document.getElementById("metric-media"),

    menuBrowserStatus: document.getElementById("menu-browser-status"),
    menuBrowserGroups: document.getElementById("menu-browser-groups"),
    menuClearFilterButton: document.getElementById("menu-clear-filter-button"),
    menuNewItemButton: document.getElementById("menu-new-item-button"),
    homeEditorStatus: document.getElementById("home-editor-status"),
    homeSectionsContent: document.getElementById("home-sections-content"),
    homeSaveButton: document.getElementById("home-save-button"),
    homeExportJsonButton: document.getElementById("home-export-json-button"),
    homePublishPreviewButton: document.getElementById("home-publish-preview-button"),
    homePublishProductionButton: document.getElementById("home-publish-production-button"),
    ingredientsEditorStatus: document.getElementById("ingredients-editor-status"),
    ingredientsPanelTitle: document.getElementById("ingredients-panel-title"),
    ingredientsPanelSubtitle: document.getElementById("ingredients-panel-subtitle"),
    ingredientsTabsNav: document.getElementById("ingredients-tabs-nav"),
    ingredientsTabs: Array.prototype.slice.call(document.querySelectorAll(".ingredients-tab")),
    ingredientsTabIngredients: document.getElementById("ingredients-tab-ingredients"),
    ingredientsTabIcons: document.getElementById("ingredients-tab-icons"),
    ingredientsCatalogView: document.getElementById("ingredients-catalog-view"),
    ingredientsDetailView: document.getElementById("ingredients-detail-view"),
    ingredientsIconsCatalogView: document.getElementById("ingredients-icons-catalog-view"),
    ingredientsIconsDetailView: document.getElementById("ingredients-icons-detail-view"),
    ingredientsCatalogActions: document.getElementById("ingredients-catalog-actions"),
    ingredientsEditorActions: document.getElementById("ingredients-editor-actions"),
    ingredientsBackButton: document.getElementById("ingredients-back-button"),
    ingredientsDetailTitle: document.getElementById("ingredients-detail-title"),
    ingredientsIconsBackButton: document.getElementById("ingredients-icons-back-button"),
    ingredientsIconsDetailTitle: document.getElementById("ingredients-icons-detail-title"),
    ingredientsSearchInput: document.getElementById("ingredients-search-input"),
    ingredientsCatalogCount: document.getElementById("ingredients-catalog-count"),
    ingredientsGlobalWarning: document.getElementById("ingredients-global-warning"),
    ingredientsList: document.getElementById("ingredients-list"),
    ingredientsNewButton: document.getElementById("ingredients-new-button"),
    ingredientsNormalizeAliasesButton: document.getElementById("ingredients-normalize-aliases-button"),
    ingredientsNewIconButton: document.getElementById("ingredients-new-icon-button"),
    ingredientsIconsSearchInput: document.getElementById("ingredients-icons-search-input"),
    ingredientsIconsCatalogCount: document.getElementById("ingredients-icons-catalog-count"),
    ingredientsIconsGlobalWarning: document.getElementById("ingredients-icons-global-warning"),
    ingredientsIconsList: document.getElementById("ingredients-icons-list"),
    ingredientsSaveButton: document.getElementById("ingredients-save-button"),
    ingredientsExportJsonButton: document.getElementById("ingredients-export-json-button"),
    ingredientsPublishPreviewButton: document.getElementById("ingredients-publish-preview-button"),
    ingredientsPublishProductionButton: document.getElementById("ingredients-publish-production-button"),
    ingredientsDeleteButton: document.getElementById("ingredients-delete-button"),
    ingredientsIconDeleteButton: document.getElementById("ingredients-icon-delete-button"),
    ingredientsValidationSummary: document.getElementById("ingredients-validation-summary"),
    ingredientsIconValidationSummary: document.getElementById("ingredients-icon-validation-summary"),
    ingredientsFieldId: document.getElementById("ingredients-field-id"),
    ingredientsFieldLabel: document.getElementById("ingredients-field-label"),
    ingredientsFieldIconSelect: document.getElementById("ingredients-field-icon-select"),
    ingredientsFieldIcon: document.getElementById("ingredients-field-icon"),
    ingredientsFieldIconOptions: document.getElementById("ingredients-icon-options"),
    ingredientsFieldIconPreview: document.getElementById("ingredients-field-icon-preview"),
    ingredientsViewIconButton: document.getElementById("ingredients-view-icon-button"),
    ingredientsAliasInput: document.getElementById("ingredients-alias-input"),
    ingredientsAliasAddButton: document.getElementById("ingredients-alias-add-button"),
    ingredientsAliasList: document.getElementById("ingredients-alias-list"),
    ingredientsTagsList: document.getElementById("ingredients-tags-list"),
    ingredientsAllergensList: document.getElementById("ingredients-allergens-list"),
    ingredientsImpactCount: document.getElementById("ingredients-impact-count"),
    ingredientsImpactList: document.getElementById("ingredients-impact-list"),
    ingredientsIconFieldKey: document.getElementById("ingredients-icon-field-key"),
    ingredientsIconFieldLabel: document.getElementById("ingredients-icon-field-label"),
    ingredientsIconFieldPath: document.getElementById("ingredients-icon-field-path"),
    ingredientsIconPreview: document.getElementById("ingredients-icon-preview"),
    ingredientsIconUsedByCount: document.getElementById("ingredients-icon-used-by-count"),
    ingredientsIconUsedByList: document.getElementById("ingredients-icon-used-by-list"),
    ingredientsTagsCatalog: document.getElementById("ingredients-tags-catalog"),
    ingredientsAllergensCatalog: document.getElementById("ingredients-allergens-catalog"),

    categoriesEditorStatus: document.getElementById("categories-editor-status"),
    categoriesEditorWarning: document.getElementById("categories-editor-warning"),
    categoriesCardsSummary: document.getElementById("categories-cards-summary"),
    categoriesCardsContent: document.getElementById("categories-cards-content"),
    categoriesOrderList: document.getElementById("categories-order-list"),
    categoriesNewButton: document.getElementById("categories-new-button"),
    categoriesExportJsonButton: document.getElementById("categories-export-json-button"),
    categoriesClearDraftsButton: document.getElementById("categories-clear-drafts-button"),
    categoriesValidationSummary: document.getElementById("categories-validation-summary"),

    itemEditorTitle: document.getElementById("item-editor-title"),
    itemEditorStatus: document.getElementById("item-editor-status"),
    itemEditorErrors: document.getElementById("item-editor-errors"),
    itemEditorActions: document.querySelector(".menu-item-editor__actions"),
    itemSaveButton: document.getElementById("item-save-button"),
    itemSaveCloseButton: document.getElementById("item-save-close-button"),
    itemExportJsonButton: document.getElementById("item-export-json-button"),
    itemPublishPreviewButton: document.getElementById("item-publish-preview-button"),
    itemPublishProductionButton: document.getElementById("item-publish-production-button"),
    itemCancelButton: document.getElementById("item-cancel-button"),
    itemDeleteButton: document.getElementById("item-delete-button"),

    itemTabs: Array.prototype.slice.call(document.querySelectorAll(".item-tab")),
    itemTabPanels: Array.prototype.slice.call(document.querySelectorAll(".item-tab-panel")),

    itemFieldId: document.getElementById("item-field-id"),
    itemFieldName: document.getElementById("item-field-name"),
    itemFieldSlug: document.getElementById("item-field-slug"),
    itemGenerateSlugButton: document.getElementById("item-generate-slug-button"),
    itemFieldCategory: document.getElementById("item-field-category"),
    itemFieldSubcategory: document.getElementById("item-field-subcategory"),
    itemFieldPrice: document.getElementById("item-field-price"),
    itemPricePreview: document.getElementById("item-price-preview"),
    itemFieldFeatured: document.getElementById("item-field-featured"),

    itemFieldDescriptionShort: document.getElementById("item-field-description-short"),
    itemFieldDescriptionLong: document.getElementById("item-field-description-long"),

    ingredientSearchInput: document.getElementById("ingredient-search-input"),
    ingredientSearchResults: document.getElementById("ingredient-search-results"),
    ingredientChipList: document.getElementById("ingredient-chip-list"),

    tagSearchInput: document.getElementById("tag-search-input"),
    tagSearchResults: document.getElementById("tag-search-results"),
    tagChipList: document.getElementById("tag-chip-list"),

    allergenSearchInput: document.getElementById("allergen-search-input"),
    allergenSearchResults: document.getElementById("allergen-search-results"),
    allergenChipList: document.getElementById("allergen-chip-list"),
    itemAutodetectMetaButton: document.getElementById("item-autodetect-meta-button"),

    itemFieldImage: document.getElementById("item-field-image"),
    itemMediaStatus: document.getElementById("item-media-status"),
    itemMediaPicker: document.getElementById("item-media-picker"),
    itemMediaPreview: document.getElementById("item-media-preview"),

    itemAvailabilityToggle: document.getElementById("item-availability-toggle"),
    itemAvailabilityReason: document.getElementById("item-availability-reason"),

    itemFieldSpicyLevel: document.getElementById("item-field-spicy-level"),
    itemSpicyLevelValue: document.getElementById("item-spicy-level-value"),
    itemFieldVegetarian: document.getElementById("item-field-vegetarian"),
    itemFieldVegan: document.getElementById("item-field-vegan"),
    itemFieldSpicyLegacy: document.getElementById("item-field-spicy-legacy"),
    itemFieldReviews: document.getElementById("item-field-reviews"),

    topbar: document.querySelector(".topbar"),

    previewCardImage: document.getElementById("preview-card-image"),
    previewCardName: document.getElementById("preview-card-name"),
    previewCardShort: document.getElementById("preview-card-short"),
    previewCardBadges: document.getElementById("preview-card-badges"),
    previewModalImage: document.getElementById("preview-modal-image"),
    previewModalName: document.getElementById("preview-modal-name"),
    previewModalLong: document.getElementById("preview-modal-long"),
    previewModalPrice: document.getElementById("preview-modal-price")
  };

  var dragState = {
    ingredientIndex: null,
    featuredIndex: null,
    featuredDropIndex: null,
    categoryOrderIndex: null,
    categoryOrderDropIndex: null
  };

  // --- Utilities (from modules/utils.js) ---
  var U = window.FigataAdmin.utils;
  function deepClone(value) { return U.deepClone(value); }

  // --- Auth (from modules/auth.js) ---
  var A = window.FigataAdmin.auth;
  function getIdentity() { return A.getIdentity(); }
  function isLocalDevHost() { return A.isLocalDevHost(); }
  function setDevAuthBypass(enabled) { return A.setDevAuthBypass(enabled); }
  function isDevAuthBypassEnabled() { return A.isDevAuthBypassEnabled(); }
  function applyDevAuthBypassQueryToggle() { return A.applyDevAuthBypassQueryToggle(); }
  function createLocalBypassUser() { return A.createLocalBypassUser(); }
  function getUserEmail(user) { return A.getUserEmail(user); }
  function getUserDisplayName(user) { return A.getUserDisplayName(user); }

  function activateLocalAuthBypass() {
    setDevAuthBypass(true);
    showDashboardShell(createLocalBypassUser());
    setDataStatus("Modo local sin login activo. Publish requiere Netlify Identity real.");
  }

  function getInitials(value) { return U.getInitials(value); }

  function setLoginMessage(message) {
    elements.loginMessage.textContent = message || "";
  }

  function setDataStatus(message) {
    elements.dataStatus.textContent = message || "";
  }

  function setHomeEditorStatus(message) {
    if (!elements.homeEditorStatus) return;
    elements.homeEditorStatus.textContent = message || "";
  }

  function setIngredientsEditorStatus(message) {
    if (!elements.ingredientsEditorStatus) return;
    elements.ingredientsEditorStatus.textContent = message || "";
  }

  function setCategoriesEditorStatus(message) {
    if (!elements.categoriesEditorStatus) return;
    elements.categoriesEditorStatus.textContent = message || "";
  }

  function setCurrentEditorStatus(message) {
    if (state.currentPanel === "home-editor") {
      setHomeEditorStatus(message);
      return;
    }
    if (state.currentPanel === "ingredients-editor") {
      setIngredientsEditorStatus(message);
      return;
    }
    if (state.currentPanel === "categories-editor") {
      setCategoriesEditorStatus(message);
      return;
    }
    setItemEditorStatus(message);
  }

  function setDraftsBanner(show, message) {
    if (!elements.draftsBanner) return;
    elements.draftsBanner.classList.toggle("is-hidden", !show);
    if (typeof message === "string" && elements.draftsBannerText) {
      elements.draftsBannerText.textContent = message;
    }
  }

  // --- Drafts persistence (from modules/drafts.js) ---
  var D = window.FigataAdmin.drafts;
  function clearPersistedDraftsStorage() { return D.clearPersistedDraftsStorage(); }
  function persistDraftsToLocalStorage() { return D.persistDraftsToLocalStorage(state.drafts); }
  function hydrateDraftsFromLocalStorage() {
    return D.hydrateDraftsFromLocalStorage(state, {
      ensureMenuDraft: ensureMenuDraft,
      ensureAvailabilityDraft: ensureAvailabilityDraft,
      ensureHomeDraft: ensureHomeDraft,
      ensureIngredientsDraft: ensureIngredientsDraft,
      ensureCategoriesDraft: ensureCategoriesDraft
    });
  }

  function downloadJsonFile(filename, payload) { return U.downloadJsonFile(filename, payload); }

  function exportCurrentDrafts() {
    if (
      !state.drafts.menu ||
      !state.drafts.availability ||
      !state.drafts.home ||
      !state.drafts.ingredients ||
      !state.drafts.categories
    ) {
      setCurrentEditorStatus("No hay drafts cargados para exportar.");
      return;
    }
    ensureMediaStore();

    var ingredientsValidation = validateIngredientsDraftData(state.drafts.ingredients);
    state.ingredientsEditor.validationReport = ingredientsValidation;
    var categoriesValidation = validateCategoriesDraftData(state.drafts.categories);
    state.categoriesEditor.validationReport = categoriesValidation;
    var normalizedIngredientsResult = normalizeIngredientsAliasesPayload(state.drafts.ingredients, { mutate: false });
    var ingredientsExportPayload = normalizedIngredientsResult.payload;
    var aliasNormalizationReport = normalizedIngredientsResult.report;

    downloadJsonFile("menu.updated.json", state.drafts.menu);
    downloadJsonFile("availability.updated.json", state.drafts.availability);
    downloadJsonFile("home.updated.json", state.drafts.home);
    downloadJsonFile("ingredients.updated.json", ingredientsExportPayload);
    downloadJsonFile("categories.updated.json", state.drafts.categories);
    downloadJsonFile("media.updated.json", state.data.media);

    if (elements.dataStatus) {
      var validationSuffix = ingredientsValidation.errors.length
        ? " (ingredients con errores de validacion; revisa panel Ingredients)"
        : "";
      var categoriesValidationSuffix = categoriesValidation.errors.length
        ? " (categories con errores de validacion; revisa panel Categories)"
        : "";
      var aliasNormalizationSuffix = "";
      if (aliasNormalizationReport.changedAliases || aliasNormalizationReport.droppedAliases) {
        aliasNormalizationSuffix =
          " · aliases normalizados en export (" +
          aliasNormalizationReport.changedAliases +
          " ajustados, " +
          aliasNormalizationReport.droppedAliases +
          " removidos)";
      }
      setDataStatus(
        "JSON exportados: menu.updated.json + availability.updated.json + home.updated.json + ingredients.updated.json + categories.updated.json + media.updated.json" +
          validationSuffix +
          categoriesValidationSuffix +
          aliasNormalizationSuffix
      );
    }
  }

  async function saveDraftsToLocalFiles() {
    if (!isLocalDevHost() || !isDevAuthBypassEnabled()) return;
    if (
      !state.drafts.menu ||
      !state.drafts.availability ||
      !state.drafts.home ||
      !state.drafts.ingredients ||
      !state.drafts.categories
    ) return;
    ensureMediaStore();

    try {
      var response = await fetch(LOCAL_SAVE_DRAFTS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          menu: state.drafts.menu,
          availability: state.drafts.availability,
          home: state.drafts.home,
          ingredients: state.drafts.ingredients,
          categories: state.drafts.categories,
          media: state.data.media
        })
      });

      if (!response.ok) {
        var responseText = await response.text();
        throw new Error(responseText || ("HTTP " + response.status));
      }

      if (state.data) {
        state.data.menu = deepClone(state.drafts.menu);
        state.data.availability = deepClone(state.drafts.availability);
        state.data.home = deepClone(state.drafts.home);
        state.data.ingredients = deepClone(state.drafts.ingredients);
        state.data.categories = deepClone(state.drafts.categories);
      }

      setDataStatus("Guardado local en /data (menu, availability, home, ingredients, categories, media).");
    } catch (error) {
      var message = error && error.message ? error.message : "Unknown error";
      setDataStatus("Error guardando JSON local: " + message + " (usa Exportar JSON).");
    }
  }

  // --- Publish (from modules/publish.js) ---
  async function publishChanges(target) {
    return window.FigataAdmin.publish.publishChanges(target, {
      state: state,
      publishButtonSets: [
        { preview: elements.itemPublishPreviewButton, production: elements.itemPublishProductionButton },
        { preview: elements.homePublishPreviewButton, production: elements.homePublishProductionButton },
        { preview: elements.ingredientsPublishPreviewButton, production: elements.ingredientsPublishProductionButton }
      ],
      setCurrentEditorStatus: setCurrentEditorStatus,
      setDataStatus: setDataStatus,
      ensureMediaStore: ensureMediaStore,
      ensureIngredientsDraft: ensureIngredientsDraft,
      ensureCategoriesDraft: ensureCategoriesDraft,
      normalizeIngredientsAliasesPayload: normalizeIngredientsAliasesPayload,
      validateIngredientsDraftData: validateIngredientsDraftData,
      validateCategoriesDraftData: validateCategoriesDraftData,
      renderIngredientsEditorValidationSummary: renderIngredientsEditorValidationSummary,
      renderIngredientsGlobalWarnings: renderIngredientsGlobalWarnings,
      renderCategoriesValidationSummary: renderCategoriesValidationSummary,
      renderCategoriesGlobalWarnings: renderCategoriesGlobalWarnings
    });
  }

  function setMenuBrowserStatus(message) {
    elements.menuBrowserStatus.textContent = message || "";
  }

  function setItemEditorStatus(message) {
    elements.itemEditorStatus.textContent = message || "";
  }

  function showItemEditorErrors(errors) {
    if (!errors || !errors.length) {
      elements.itemEditorErrors.innerHTML = "";
      elements.itemEditorErrors.classList.add("is-hidden");
      return;
    }

    var html = "<ul>" +
      errors.map(function (error) {
        return "<li>" + escapeHtml(error) + "</li>";
      }).join("") +
      "</ul>";

    elements.itemEditorErrors.innerHTML = html;
    elements.itemEditorErrors.classList.remove("is-hidden");
  }

  function showLoginView(message) {
    views.login.classList.remove("is-hidden");
    views.dashboard.classList.add("is-hidden");
    closeSidebarUserMenu();
    setLoginMessage(message || "");
  }

  function showDashboardShell(user) {
    var displayName = getUserDisplayName(user);
    var email = getUserEmail(user);

    elements.sessionName.textContent = displayName;
    elements.sessionEmail.textContent = email;
    if (elements.sessionAvatar) {
      elements.sessionAvatar.setAttribute("data-initials", getInitials(displayName));
    }
    elements.sidebarUserMenuName.textContent = displayName;
    elements.sidebarUserMenuEmail.textContent = email;
    closeSidebarUserMenu();
    views.dashboard.classList.remove("is-hidden");
    views.login.classList.add("is-hidden");
    setLoginMessage("");
    ensureDataLoaded(false);
    applyRoute();
  }

  // --- Sidebar (from modules/sidebar.js) ---
  var SB = window.FigataAdmin.sidebar;
  function _sbCtx() {
    return {
      state: state,
      elements: {
        sidebar: elements.sidebar,
        sidebarToggleButton: elements.sidebarToggleButton,
        sidebarUserMenu: elements.sidebarUserMenu,
        sidebarUserButton: elements.sidebarUserButton
      },
      waitForTransition: waitForTransition,
      clearAllSidebarAccordionOpeningMotions: clearAllSidebarAccordionOpeningMotions,
      applySidebarAccordionState: applySidebarAccordionState,
      getSidebarAccordionKeyForPanel: getSidebarAccordionKeyForPanel,
      getSidebarOpenAccordionKeyFromDom: getSidebarOpenAccordionKeyFromDom,
      transitionSidebarAccordions: transitionSidebarAccordions,
      updateSidebarActiveIndicator: updateSidebarActiveIndicator
    };
  }
  function readStoredSidebarCollapsed() { return SB.readStoredSidebarCollapsed(); }
  function isCompactViewport() { return SB.isCompactViewport(); }
  function setSidebarCollapsed(nextCollapsed, options) { return SB.setSidebarCollapsed(_sbCtx(), nextCollapsed, options); }
  function syncSidebarViewportState() { return SB.syncSidebarViewportState(_sbCtx()); }
  function isSidebarUserMenuOpen() { return SB.isSidebarUserMenuOpen(_sbCtx()); }
  function closeSidebarUserMenu() { return SB.closeSidebarUserMenu(_sbCtx()); }
  function openSidebarUserMenu() { return SB.openSidebarUserMenu(_sbCtx()); }
  function toggleSidebarUserMenu() { return SB.toggleSidebarUserMenu(_sbCtx()); }
  function syncUxTimingCssVars() { return SB.syncUxTimingCssVars(); }

  // --- Navigation infrastructure (from modules/navigation.js) ---
  var N = window.FigataAdmin.navigation;
  var _navScrollSpyCallbacks = { requestCurrentPanelScrollSpySync: function () { requestCurrentPanelScrollSpySync(); } };
  function getNavigationState() { return N.getNavigationState(state); }
  function canTransitionNavigationState(fromState, toState) { return N.canTransitionNavigationState(fromState, toState); }
  function setNavigationState(nextState, options) { return N.setNavigationState(state, nextState, options); }
  function setNavigationCurrentPanel(panel) { return N.setNavigationCurrentPanel(state, panel); }
  function setNavigationCurrentSection(sectionKey) { return N.setNavigationCurrentSection(state, sectionKey); }
  function isNavigationStateIdle() { return N.isNavigationStateIdle(state); }
  function canRunScrollSpy(forceSync) { return N.canRunScrollSpy(state, forceSync); }
  function isProgrammaticScrollLocked() { return N.isProgrammaticScrollLocked(state); }
  function clearProgrammaticScrollLock(options) { return N.clearProgrammaticScrollLock(state, _navScrollSpyCallbacks, options); }
  function lockProgrammaticScroll(durationMs, sectionKey) { return N.lockProgrammaticScroll(state, _navScrollSpyCallbacks, durationMs, sectionKey); }
  function runWithProgrammaticScrollLock(callback, durationMs, sectionKey) { return N.runWithProgrammaticScrollLock(state, _navScrollSpyCallbacks, callback, durationMs, sectionKey); }
  function queuePanelPostNavigationAction(panel, callback) { return N.queuePanelPostNavigationAction(state, panel, callback); }
  function flushPanelPostNavigationAction(panel) { return N.flushPanelPostNavigationAction(state, panel); }
  function clearPanelPostNavigationActions() { return N.clearPanelPostNavigationActions(state); }

  function waitNextFrame() { return N.waitNextFrame(); }

  function parseCssTimeToMs(value) { return U.parseCssTimeToMs(value); }

  function hasTransitionDuration(element) { return N.hasTransitionDuration(element); }

  function getRunningAnimations(element, subtree) { return N.getRunningAnimations(element, subtree); }

  function waitForTransition(element, options) { return N.waitForTransition(element, options); }

  function waitForAnimation(element, options) { return N.waitForAnimation(element, options); }

  // --- Command Palette (from modules/command-palette.js) ---
  var CP = window.FigataAdmin.commandPalette;
  function _cpCtx() {
    return {
      state: state,
      elements: {
        shell: elements.commandPaletteShell,
        dialog: elements.commandPaletteDialog,
        overlay: elements.commandPaletteOverlay,
        input: elements.commandPaletteInput,
        list: elements.commandPaletteList,
        live: elements.commandPaletteLive,
        searchButton: elements.sidebarSearchButton
      },
      closeSidebarUserMenu: closeSidebarUserMenu,
      waitForTransition: waitForTransition,
      setDataStatus: setDataStatus
    };
  }
  function getCommandPaletteItems() { return CP.getItems(_cpCtx()); }
  function isCommandPaletteOpen() { return CP.isOpen(_cpCtx()); }
  function setCommandPaletteLiveMessage(message) { return CP.setLiveMessage(_cpCtx(), message); }
  function getCommandPaletteItemIndex(itemElement) { return CP.getItemIndex(itemElement); }
  function setCommandPaletteSelectedIndex(nextIndex, options) { return CP.setSelectedIndex(_cpCtx(), nextIndex, options); }
  function openCommandPalette(options) { return CP.open(_cpCtx(), options); }
  function closeCommandPalette(options) { return CP.close(_cpCtx(), options); }
  function toggleCommandPalette() { return CP.toggle(_cpCtx()); }
  function activateCommandPaletteItem(itemElement) { return CP.activateItem(_cpCtx(), itemElement); }
  function handleCommandPaletteKeydown(event) { return CP.handleKeydown(_cpCtx(), event); }
  function bindCommandPaletteEvents() { return CP.bindEvents(_cpCtx()); }

  function createNavigationTimelineCancelError() { return N.createNavigationTimelineCancelError(); }
  function isNavigationTimelineCurrent(timelineToken) { return N.isNavigationTimelineCurrent(state, timelineToken); }
  function assertNavigationTimelineActive(timelineToken) { return N.assertNavigationTimelineActive(state, timelineToken); }
  function runNavigationTimeline(steps, options) { return N.runNavigationTimeline(state, steps, options); }

  /* ===========================
     ACCORDION MOTION
  =========================== */

  // --- Accordion & Indicator (from modules/accordion.js) ---
  var AC = window.FigataAdmin.accordion;
  function _acCtx() {
    return {
      state: state,
      elements: {
        sidebarMenuAccordion: elements.sidebarMenuAccordion,
        sidebarHomepageAccordion: elements.sidebarHomepageAccordion,
        sidebarIngredientsAccordion: elements.sidebarIngredientsAccordion,
        sidebarCategoriesAccordion: elements.sidebarCategoriesAccordion,
        sidebarNav: elements.sidebarNav,
        sidebarNavActiveIndicator: elements.sidebarNavActiveIndicator
      },
      normalizeIngredientsTab: normalizeIngredientsTab,
      setNavigationState: setNavigationState,
      waitForTransition: waitForTransition,
      waitNextFrame: waitNextFrame,
      waitForAnimation: waitForAnimation
    };
  }
  function setSidebarAccordionElementState(accordionElement, show) { return AC.setSidebarAccordionElementState(accordionElement, show); }
  function clearSidebarAccordionOpeningMotion(accordionElement) { return AC.clearSidebarAccordionOpeningMotion(accordionElement); }
  function prepareSidebarAccordionOpeningMotion(accordionElement) { return AC.prepareSidebarAccordionOpeningMotion(accordionElement); }
  function scheduleSidebarAccordionOpeningMotion(accordionElement) { return AC.scheduleSidebarAccordionOpeningMotion(accordionElement); }
  function finalizeSidebarAccordionOpeningMotion(accordionElement) { return AC.finalizeSidebarAccordionOpeningMotion(accordionElement); }
  function clearAllSidebarAccordionOpeningMotions() { return AC.clearAllSidebarAccordionOpeningMotions(_acCtx()); }
  function syncSidebarAccordionCategoryHeights(accordionElement) { return AC.syncSidebarAccordionCategoryHeights(accordionElement); }
  function syncAllSidebarAccordionCategoryHeights() { return AC.syncAllSidebarAccordionCategoryHeights(_acCtx()); }
  function showMenuAccordion(show) { return AC.showMenuAccordion(_acCtx(), show); }
  function showHomepageAccordion(show) { return AC.showHomepageAccordion(_acCtx(), show); }
  function showIngredientsAccordion(show) { return AC.showIngredientsAccordion(_acCtx(), show); }
  function showCategoriesAccordion(show) { return AC.showCategoriesAccordion(_acCtx(), show); }
  function getSidebarAccordionKeyForPanel(panel) { return AC.getSidebarAccordionKeyForPanel(_acCtx(), panel); }
  function getSidebarOpenAccordionKeyFromDom() { return AC.getSidebarOpenAccordionKeyFromDom(_acCtx()); }
  function getSidebarAccordionElementByKey(accordionKey) { return AC.getSidebarAccordionElementByKey(_acCtx(), accordionKey); }
  function isSidebarAccordionOpening(accordionKey) { return AC.isSidebarAccordionOpening(_acCtx(), accordionKey); }
  function applySidebarAccordionState(nextAccordionKey) { return AC.applySidebarAccordionState(_acCtx(), nextAccordionKey); }
  function transitionSidebarAccordions(nextAccordionKey) { return AC.transitionSidebarAccordions(_acCtx(), nextAccordionKey); }
  function updateSidebarActiveIndicator() { return AC.updateSidebarActiveIndicator(_acCtx()); }
  function clearSidebarIndicatorSyncTimers() { return AC.clearSidebarIndicatorSyncTimers(_acCtx()); }
  function scheduleSidebarActiveIndicatorSync() { return AC.scheduleSidebarActiveIndicatorSync(_acCtx()); }

  // --- Panels (from modules/panels.js) ---
  var PN = window.FigataAdmin.panels;
  function _pnCtx() {
    return {
      state: state,
      views: views,
      elements: {
        topbar: elements.topbar,
        dashboardContent: elements.dashboardContent,
        sidebarNavDashboard: elements.sidebarNavDashboard,
        sidebarNavMenu: elements.sidebarNavMenu,
        sidebarNavHomepage: elements.sidebarNavHomepage,
        sidebarNavIngredients: elements.sidebarNavIngredients,
        sidebarNavCategories: elements.sidebarNavCategories,
        sidebarHomeButton: elements.sidebarHomeButton,
        sidebarNavActiveIndicator: elements.sidebarNavActiveIndicator
      },
      // Navigation
      isNavigationStateIdle: isNavigationStateIdle,
      getNavigationState: getNavigationState,
      setNavigationState: setNavigationState,
      setNavigationCurrentPanel: setNavigationCurrentPanel,
      setNavigationCurrentSection: setNavigationCurrentSection,
      isProgrammaticScrollLocked: isProgrammaticScrollLocked,
      runNavigationTimeline: runNavigationTimeline,
      waitNextFrame: waitNextFrame,
      waitForTransition: waitForTransition,
      // Accordion / sidebar
      getSidebarAccordionKeyForPanel: getSidebarAccordionKeyForPanel,
      getSidebarOpenAccordionKeyFromDom: getSidebarOpenAccordionKeyFromDom,
      clearAllSidebarAccordionOpeningMotions: clearAllSidebarAccordionOpeningMotions,
      clearSidebarIndicatorSyncTimers: clearSidebarIndicatorSyncTimers,
      scheduleSidebarActiveIndicatorSync: scheduleSidebarActiveIndicatorSync,
      updateSidebarActiveIndicator: updateSidebarActiveIndicator,
      transitionSidebarAccordions: transitionSidebarAccordions,
      closeSidebarUserMenu: closeSidebarUserMenu,
      flushPanelPostNavigationAction: flushPanelPostNavigationAction,
      // Scroll spy adapters (lazy — resolved at call time)
      refreshMenuScrollAnchors: function () { refreshMenuScrollAnchors(); },
      updateMenuScrollSpy: function (f) { updateMenuScrollSpy(f); },
      requestMenuScrollSpyUpdate: function () { requestMenuScrollSpyUpdate(); },
      refreshHomeScrollAnchors: function () { refreshHomeScrollAnchors(); },
      updateHomeScrollSpy: function (f) { updateHomeScrollSpy(f); },
      requestHomeScrollSpyUpdate: function () { requestHomeScrollSpyUpdate(); },
      refreshIngredientsScrollAnchors: function () { refreshIngredientsScrollAnchors(); },
      updateIngredientsScrollSpy: function (f) { updateIngredientsScrollSpy(f); },
      requestIngredientsScrollSpyUpdate: function () { requestIngredientsScrollSpyUpdate(); },
      refreshCategoriesScrollAnchors: function () { refreshCategoriesScrollAnchors(); },
      updateCategoriesScrollSpy: function (f) { updateCategoriesScrollSpy(f); },
      requestCategoriesScrollSpyUpdate: function () { requestCategoriesScrollSpyUpdate(); }
    };
  }
  function getPanelScrollSpyAdapter(panel) { return PN.getPanelScrollSpyAdapter(_pnCtx(), panel); }
  function syncVisiblePanelAnchors(panel) { return PN.syncVisiblePanelAnchors(_pnCtx(), panel); }
  function requestCurrentPanelScrollSpySync() { return PN.requestCurrentPanelScrollSpySync(_pnCtx()); }
  function requestCurrentPanelScrollSpyUpdate() { return PN.requestCurrentPanelScrollSpyUpdate(_pnCtx()); }
  function applyPanelVisibility(panel) { return PN.applyPanelVisibility(_pnCtx(), panel); }
  function setActiveSidebarNav(panel, options) { return PN.setActiveSidebarNav(_pnCtx(), panel, options); }
  function clearPanelTransitionTimers() { return PN.clearPanelTransitionTimers(_pnCtx()); }
  function moveSidebarIndicatorForTimeline(options) { return PN.moveSidebarIndicatorForTimeline(_pnCtx(), options); }
  function runPanelTransition(fromPanel, toPanel) { return PN.runPanelTransition(_pnCtx(), fromPanel, toPanel); }
  function setActivePanel(panel) { return PN.setActivePanel(_pnCtx(), panel); }

  function hashHasAuthToken() {
    return /(?:^#|[&#])(invite_token|recovery_token|confirmation_token)=/i.test(window.location.hash);
  }

  function clearHash() {
    if (!window.location.hash) return;
    var cleanUrl = window.location.pathname + window.location.search;
    window.history.replaceState({}, document.title, cleanUrl);
  }

  function openIdentityModal() {
    var identity = getIdentity();
    if (!identity) return;
    identity.open("login");
  }

  function handleTokenFlow() {
    if (!hashHasAuthToken()) return;
    openIdentityModal();
    window.setTimeout(clearHash, 50);
  }

  // --- Rendering utilities & Toggle component (from modules/render-utils.js) ---
  var RU = window.FigataAdmin.renderUtils;
  function normalizeText(value) { return RU.normalizeText(value); }
  function escapeHtml(value) { return RU.escapeHtml(value); }
  function slugify(value) { return RU.slugify(value); }
  function buildHtmlAttributes(attributes) { return RU.buildHtmlAttributes(attributes); }
  function resolveAssetPath(path) { return RU.resolveAssetPath(path); }
  function toRelativeAssetPath(path) { return RU.toRelativeAssetPath(path); }
  function getPathExtension(path) { return RU.getPathExtension(path); }
  function removePathExtension(path) { return RU.removePathExtension(path); }
  function isSvgPlaceholderPath(path) { return RU.isSvgPlaceholderPath(path); }
  function isMenuMediaPath(path) { return RU.isMenuMediaPath(path); }
  function buildMenuMediaCandidates(rawPath) { return RU.buildMenuMediaCandidates(rawPath); }
  function registerToggleHandler(handler) { return RU.registerToggleHandler(handler); }
  function resolveToggleChecked(control) { return RU.resolveToggleChecked(control); }
  function setToggleChecked(control, checked) { return RU.setToggleChecked(control, checked); }
  function setToggleDisabled(control, disabled) { return RU.setToggleDisabled(control, disabled); }
  function getToggleChecked(control) { return RU.getToggleChecked(control); }
  function renderToggle(options) { return RU.renderToggle(options); }
  function triggerToggleChange(control, checked, event, fallbackOnChange) { return RU.triggerToggleChange(control, checked, event, fallbackOnChange); }
  function bindToggles(rootEl, options) { return RU.bindToggles(rootEl, options); }

  // --- Menu media helpers (from modules/menu-media.js) ---
  var MM = window.FigataAdmin.menuMedia;
  function resolveMenuMediaPath(rawPath, allowFallback) { return MM.resolveMenuMediaPath({ state: state }, rawPath, allowFallback); }
  function setImageElementSourceWithFallback(imageElement, path, fallbackPath) { return MM.setImageElementSourceWithFallback(imageElement, path, fallbackPath); }
  function fetchLocalMenuMediaPaths() { return MM.fetchLocalMenuMediaPaths(); }
  function fetchJson(endpoint) { return MM.fetchJson(endpoint); }

  function ensureMenuDraft() {
    if (!state.drafts.menu) {
      state.drafts.menu = {
        version: 1,
        currency: "DOP",
        taxIncluded: false,
        sections: []
      };
    }
    if (!Array.isArray(state.drafts.menu.sections)) {
      state.drafts.menu.sections = [];
    }
  }

  function ensureAvailabilityDraft() {
    if (!state.drafts.availability) {
      state.drafts.availability = {
        version: 1,
        schema: "figata.menu.availability.v1",
        settings: { hideUnavailableItems: false },
        items: []
      };
    }
    if (!Array.isArray(state.drafts.availability.items)) {
      state.drafts.availability.items = [];
    }
  }

  function ensureIngredientsDraft() {
    if (!state.drafts.ingredients || typeof state.drafts.ingredients !== "object") {
      state.drafts.ingredients = deepClone((state.data && state.data.ingredients) || {});
    }

    if (!state.drafts.ingredients || typeof state.drafts.ingredients !== "object") {
      state.drafts.ingredients = {};
    }

    if (!Number.isFinite(Number(state.drafts.ingredients.version))) {
      state.drafts.ingredients.version = 1;
    } else {
      state.drafts.ingredients.version = Number(state.drafts.ingredients.version);
    }

    if (!state.drafts.ingredients.basePath) {
      state.drafts.ingredients.basePath = "/assets/Ingredients/";
    }

    if (!state.drafts.ingredients.tags || typeof state.drafts.ingredients.tags !== "object") {
      state.drafts.ingredients.tags = {};
    }
    if (!state.drafts.ingredients.allergens || typeof state.drafts.ingredients.allergens !== "object") {
      state.drafts.ingredients.allergens = {};
    }
    if (!state.drafts.ingredients.icons || typeof state.drafts.ingredients.icons !== "object") {
      state.drafts.ingredients.icons = {};
    }
    if (!state.drafts.ingredients.ingredients || typeof state.drafts.ingredients.ingredients !== "object") {
      state.drafts.ingredients.ingredients = {};
    }

    Object.keys(state.drafts.ingredients.ingredients).forEach(function (ingredientId) {
      var ingredient = state.drafts.ingredients.ingredients[ingredientId];
      if (!ingredient || typeof ingredient !== "object") {
        state.drafts.ingredients.ingredients[ingredientId] = {
          label: "",
          icon: "",
          aliases: [],
          tags: [],
          allergens: []
        };
        return;
      }

      if (!Array.isArray(ingredient.aliases)) {
        ingredient.aliases = [];
      }
      if (!Array.isArray(ingredient.tags)) {
        ingredient.tags = [];
      }
      if (!Array.isArray(ingredient.allergens)) {
        ingredient.allergens = [];
      }
    });
  }

  function resolveCategoryVisibility(category) {
    if (category && typeof category.visible === "boolean") {
      return category.visible;
    }
    if (category && typeof category.enabled === "boolean") {
      return category.enabled;
    }
    return true;
  }

  function normalizeCategoryDraftEntry(entry, index) {
    var safeEntry = entry && typeof entry === "object" ? deepClone(entry) : {};
    var fallbackOrder = index + 1;
    var orderValue = Number(safeEntry.order);
    var visible = resolveCategoryVisibility(safeEntry);

    safeEntry.id = String(safeEntry.id || "").trim();
    safeEntry.label = String(safeEntry.label || "").trim();
    safeEntry.order = Number.isFinite(orderValue)
      ? Math.max(1, Math.round(orderValue))
      : fallbackOrder;
    safeEntry.visible = visible;
    safeEntry.enabled = visible;
    if (!Array.isArray(safeEntry.subcategories)) {
      safeEntry.subcategories = [];
    }

    return safeEntry;
  }

  function ensureCategoriesDraft() {
    if (!state.drafts.categories || typeof state.drafts.categories !== "object") {
      state.drafts.categories = deepClone((state.data && state.data.categories) || {});
    }

    if (!state.drafts.categories || typeof state.drafts.categories !== "object") {
      state.drafts.categories = {};
    }

    if (!Number.isFinite(Number(state.drafts.categories.version))) {
      state.drafts.categories.version = 1;
    } else {
      state.drafts.categories.version = Number(state.drafts.categories.version);
    }

    if (!state.drafts.categories.schema) {
      state.drafts.categories.schema = "figata.menu.categories.v1";
    }

    if (!Array.isArray(state.drafts.categories.categories)) {
      state.drafts.categories.categories = [];
    }

    state.drafts.categories.categories = state.drafts.categories.categories.map(function (entry, index) {
      return normalizeCategoryDraftEntry(entry, index);
    });
  }

  function normalizeIngredientAliasValue(value) {
    return normalizeText(value)
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .replace(/_+/g, "_");
  }

  function normalizeIngredientAliasList(aliases) {
    var result = {
      aliases: [],
      changedCount: 0,
      droppedCount: 0,
      changes: [],
      dropped: []
    };
    if (!Array.isArray(aliases)) {
      return result;
    }

    var seen = {};
    aliases.forEach(function (aliasValue) {
      var rawAlias = String(aliasValue || "").trim();
      var normalizedAlias = normalizeIngredientAliasValue(rawAlias);
      if (!normalizedAlias) {
        result.droppedCount += 1;
        result.dropped.push({
          from: rawAlias,
          to: "",
          reason: "invalid"
        });
        return;
      }

      if (rawAlias !== normalizedAlias) {
        result.changedCount += 1;
        result.changes.push({
          from: rawAlias,
          to: normalizedAlias
        });
      }

      if (seen[normalizedAlias]) {
        result.droppedCount += 1;
        result.dropped.push({
          from: rawAlias || normalizedAlias,
          to: normalizedAlias,
          reason: "duplicate"
        });
        return;
      }

      seen[normalizedAlias] = true;
      result.aliases.push(normalizedAlias);
    });

    return result;
  }

  function normalizeIngredientsAliasesPayload(ingredientsPayload, options) {
    options = options || {};
    var mutate = Boolean(options.mutate);
    var source = ingredientsPayload && typeof ingredientsPayload === "object"
      ? ingredientsPayload
      : {};
    var payload = mutate ? source : deepClone(source);
    var ingredientsById = payload.ingredients && typeof payload.ingredients === "object"
      ? payload.ingredients
      : {};
    var report = {
      changedIngredients: 0,
      changedAliases: 0,
      droppedAliases: 0,
      changes: [],
      dropped: []
    };

    Object.keys(ingredientsById).forEach(function (ingredientId) {
      var ingredient = ingredientsById[ingredientId];
      if (!ingredient || typeof ingredient !== "object" || !Array.isArray(ingredient.aliases)) return;

      var normalized = normalizeIngredientAliasList(ingredient.aliases);
      var ingredientChanged = normalized.changedCount > 0 ||
        normalized.droppedCount > 0 ||
        normalized.aliases.length !== ingredient.aliases.length;
      if (!ingredientChanged) return;

      ingredient.aliases = normalized.aliases;
      report.changedIngredients += 1;
      report.changedAliases += normalized.changedCount;
      report.droppedAliases += normalized.droppedCount;

      normalized.changes.forEach(function (change) {
        report.changes.push({
          ingredientId: ingredientId,
          from: change.from,
          to: change.to
        });
      });

      normalized.dropped.forEach(function (drop) {
        report.dropped.push({
          ingredientId: ingredientId,
          from: drop.from,
          to: drop.to,
          reason: drop.reason
        });
      });
    });

    return {
      payload: payload,
      report: report
    };
  }

  function formatIngredientsAliasNormalizationPreview(report, maxLines) {
    var safeReport = report || {};
    var changes = Array.isArray(safeReport.changes) ? safeReport.changes : [];
    var dropped = Array.isArray(safeReport.dropped) ? safeReport.dropped : [];
    var limit = Number(maxLines);
    if (!Number.isFinite(limit) || limit < 1) {
      limit = 10;
    }

    var lines = [];
    changes.slice(0, limit).forEach(function (change) {
      lines.push(
        "- " + change.ingredientId + ": " +
        (change.from || "(vacio)") + " -> " + change.to
      );
    });
    if (changes.length > limit) {
      lines.push("... y " + (changes.length - limit) + " cambios mas.");
    }

    if (dropped.length) {
      if (lines.length) lines.push("");
      lines.push("Aliases removidos:");
      dropped.slice(0, limit).forEach(function (drop) {
        var reasonLabel = drop.reason === "duplicate" ? "duplicado" : "invalido";
        lines.push(
          "- " + drop.ingredientId + ": " +
          (drop.from || "(vacio)") +
          (drop.to ? (" -> " + drop.to) : "") +
          " (" + reasonLabel + ")"
        );
      });
      if (dropped.length > limit) {
        lines.push("... y " + (dropped.length - limit) + " removidos mas.");
      }
    }

    return lines.join("\n");
  }

  function isLikelyValidIngredientIconPath(value) {
    var path = String(value || "").trim();
    if (!path) return false;
    if (/^https?:\/\//i.test(path)) return true;
    if (path[0] === "/") return true;
    if (path.indexOf("assets/") === 0) return true;
    return /\.(svg|webp|png|jpe?g|gif)$/i.test(path);
  }

  function resolveIngredientIconAssetPath(iconPathValue, ingredientsSource) {
    var rawPath = String(iconPathValue || "").trim();
    if (!rawPath) return "";
    if (/^https?:\/\//i.test(rawPath)) return rawPath;
    if (rawPath.charAt(0) === "/") return rawPath;
    if (rawPath.indexOf("assets/") === 0) return "/" + rawPath;

    var basePath = ingredientsSource && typeof ingredientsSource.basePath === "string"
      ? String(ingredientsSource.basePath).trim()
      : "";
    if (!basePath) return rawPath;
    if (/^https?:\/\//i.test(basePath)) {
      return basePath.replace(/\/+$/, "") + "/" + rawPath.replace(/^\/+/, "");
    }

    var normalizedBase = basePath.charAt(0) === "/" ? basePath : "/" + basePath;
    normalizedBase = normalizedBase.replace(/\/+$/, "") + "/";
    return normalizedBase + rawPath.replace(/^\/+/, "");
  }

  function resolveIngredientCatalogIconPath(iconEntry, ingredientsSource) {
    var rawPath = iconEntry && typeof iconEntry.icon === "string"
      ? iconEntry.icon.trim()
      : "";
    return resolveIngredientIconAssetPath(rawPath, ingredientsSource);
  }

  function resolveIngredientIconPath(ingredient, ingredientsSource) {
    var iconValue = ingredient && typeof ingredient.icon === "string"
      ? ingredient.icon.trim()
      : "";
    if (!iconValue) return "";

    if (isLikelyValidIngredientIconPath(iconValue)) {
      return resolveIngredientIconAssetPath(iconValue, ingredientsSource);
    }

    var iconMap = ingredientsSource && ingredientsSource.icons
      ? ingredientsSource.icons[iconValue]
      : null;
    if (iconMap) {
      return resolveIngredientCatalogIconPath(iconMap, ingredientsSource);
    }

    return "";
  }

  function getIngredientIconUsageEntries(iconKey) {
    var normalizedKey = String(iconKey || "").trim();
    if (!normalizedKey) return [];
    var rawEntries = state.indexes && state.indexes.iconUsageByKey
      ? state.indexes.iconUsageByKey[normalizedKey]
      : [];
    var entries = Array.isArray(rawEntries) ? rawEntries.slice() : [];
    entries.sort(function (a, b) {
      return normalizeText(a.label || a.id).localeCompare(normalizeText(b.label || b.id));
    });
    return entries;
  }

  function getMenuIngredientReferenceReport(ingredientsById) {
    var report = {
      invalidItems: [],
      invalidReferencesCount: 0
    };

    getAllMenuItems().forEach(function (entry) {
      var item = entry && entry.item ? entry.item : null;
      if (!item || !Array.isArray(item.ingredients) || !item.ingredients.length) return;

      var unknown = [];
      item.ingredients.forEach(function (ingredientId) {
        var normalizedId = String(ingredientId || "").trim();
        if (!normalizedId) return;
        if (!ingredientsById[normalizedId] && !unknown.includes(normalizedId)) {
          unknown.push(normalizedId);
        }
      });

      if (!unknown.length) return;
      report.invalidReferencesCount += unknown.length;
      report.invalidItems.push({
        id: item.id || "",
        label: item.name || item.id || "Item sin nombre",
        unknownIngredients: unknown
      });
    });

    return report;
  }

  function validateIngredientsDraftData(ingredientsDraft) {
    var sharedContract = window.FigataIngredientsContract;
    if (
      sharedContract &&
      typeof sharedContract.validateIngredientsContract === "function"
    ) {
      return sharedContract.validateIngredientsContract(ingredientsDraft, {
        menuPayload: state.drafts && state.drafts.menu ? state.drafts.menu : null,
        normalizeAliases: false
      });
    }

    var source = ingredientsDraft && typeof ingredientsDraft === "object" ? ingredientsDraft : {};
    var ingredientsById = source.ingredients && typeof source.ingredients === "object"
      ? source.ingredients
      : {};
    var tagsById = source.tags && typeof source.tags === "object" ? source.tags : {};
    var allergensById = source.allergens && typeof source.allergens === "object" ? source.allergens : {};
    var iconsById = source.icons && typeof source.icons === "object" ? source.icons : {};

    var report = {
      errors: [],
      warnings: [],
      ingredientIssuesById: {},
      iconIssuesByKey: {},
      iconUsageByKey: {},
      menuReferenceReport: null
    };

    function ensureIssueBucket(ingredientId) {
      if (!report.ingredientIssuesById[ingredientId]) {
        report.ingredientIssuesById[ingredientId] = {
          errors: [],
          warnings: []
        };
      }
      return report.ingredientIssuesById[ingredientId];
    }

    function pushIngredientIssue(ingredientId, severity, message) {
      var bucket = ensureIssueBucket(ingredientId);
      if (severity === "error") {
        bucket.errors.push(message);
        report.errors.push(message);
      } else {
        bucket.warnings.push(message);
        report.warnings.push(message);
      }
    }

    function ensureIconIssueBucket(iconKey) {
      if (!report.iconIssuesByKey[iconKey]) {
        report.iconIssuesByKey[iconKey] = {
          errors: [],
          warnings: []
        };
      }
      return report.iconIssuesByKey[iconKey];
    }

    function pushIconIssue(iconKey, severity, message) {
      var bucket = ensureIconIssueBucket(iconKey);
      if (severity === "error") {
        bucket.errors.push(message);
        report.errors.push(message);
      } else {
        bucket.warnings.push(message);
        report.warnings.push(message);
      }
    }

    Object.keys(iconsById).forEach(function (iconKey) {
      report.iconUsageByKey[iconKey] = [];
    });

    Object.keys(tagsById).forEach(function (tagId) {
      var tagEntry = tagsById[tagId] || {};
      if (!String(tagEntry.label || "").trim()) {
        report.warnings.push("Tag sin label: " + tagId);
      }
    });

    Object.keys(allergensById).forEach(function (allergenId) {
      var allergenEntry = allergensById[allergenId] || {};
      if (!String(allergenEntry.label || "").trim()) {
        report.warnings.push("Alergeno sin label: " + allergenId);
      }
    });

    Object.keys(ingredientsById).forEach(function (ingredientId) {
      var ingredient = ingredientsById[ingredientId];
      if (!ingredient || typeof ingredient !== "object") {
        pushIngredientIssue(ingredientId, "error", "Ingrediente invalido (debe ser objeto): " + ingredientId);
        return;
      }

      var label = String(ingredient.label || "").trim();
      if (!label) {
        pushIngredientIssue(ingredientId, "warning", "Ingrediente sin label: " + ingredientId);
      }

      var iconValue = String(ingredient.icon || "").trim();
      if (!iconValue) {
        pushIngredientIssue(ingredientId, "warning", "Ingrediente sin icon: " + ingredientId);
      } else {
        var iconFromCatalog = iconsById[iconValue];
        var iconAsPath = isLikelyValidIngredientIconPath(iconValue);
        if (!iconFromCatalog && !iconAsPath) {
          pushIngredientIssue(
            ingredientId,
            "error",
            "Icon invalido en ingrediente '" + ingredientId + "': " + iconValue
          );
        } else if (iconFromCatalog) {
          if (!report.iconUsageByKey[iconValue]) {
            report.iconUsageByKey[iconValue] = [];
          }
          report.iconUsageByKey[iconValue].push({
            id: ingredientId,
            label: label || ingredientId
          });
        }
      }

      var aliases = Array.isArray(ingredient.aliases) ? ingredient.aliases : [];
      if (!Array.isArray(ingredient.aliases)) {
        pushIngredientIssue(ingredientId, "error", "aliases debe ser array en ingrediente: " + ingredientId);
      } else {
        var seenAliases = {};
        aliases.forEach(function (aliasRaw) {
          var rawText = String(aliasRaw || "").trim();
          var normalizedAlias = normalizeIngredientAliasValue(rawText);
          if (!normalizedAlias) {
            pushIngredientIssue(ingredientId, "error", "Alias vacio/invalido en ingrediente: " + ingredientId);
            return;
          }
          if (rawText !== normalizedAlias) {
            pushIngredientIssue(
              ingredientId,
              "warning",
              "Alias legacy en '" + ingredientId + "': " + rawText + " -> " + normalizedAlias +
              " (se normaliza en export/publish)"
            );
          }
          if (seenAliases[normalizedAlias]) {
            pushIngredientIssue(
              ingredientId,
              "warning",
              "Alias duplicado tras normalizar en '" + ingredientId + "': " + normalizedAlias +
              " (se conserva la primera ocurrencia en export/publish)"
            );
            return;
          }
          seenAliases[normalizedAlias] = true;
        });
      }

      var tags = Array.isArray(ingredient.tags) ? ingredient.tags : [];
      if (!Array.isArray(ingredient.tags)) {
        pushIngredientIssue(ingredientId, "error", "tags debe ser array en ingrediente: " + ingredientId);
      } else {
        var seenTags = {};
        tags.forEach(function (tagId) {
          if (!tagsById[tagId]) {
            pushIngredientIssue(
              ingredientId,
              "error",
              "Tag desconocido en ingrediente '" + ingredientId + "': " + tagId
            );
          }
          if (seenTags[tagId]) {
            pushIngredientIssue(
              ingredientId,
              "error",
              "Tag duplicado en ingrediente '" + ingredientId + "': " + tagId
            );
          }
          seenTags[tagId] = true;
        });
      }

      var allergens = Array.isArray(ingredient.allergens) ? ingredient.allergens : [];
      if (!Array.isArray(ingredient.allergens)) {
        pushIngredientIssue(ingredientId, "error", "allergens debe ser array en ingrediente: " + ingredientId);
      } else {
        var seenAllergens = {};
        allergens.forEach(function (allergenId) {
          if (!allergensById[allergenId]) {
            pushIngredientIssue(
              ingredientId,
              "error",
              "Alergeno desconocido en ingrediente '" + ingredientId + "': " + allergenId
            );
          }
          if (seenAllergens[allergenId]) {
            pushIngredientIssue(
              ingredientId,
              "error",
              "Alergeno duplicado en ingrediente '" + ingredientId + "': " + allergenId
            );
          }
          seenAllergens[allergenId] = true;
        });
      }
    });

    Object.keys(iconsById).forEach(function (iconKey) {
      var iconEntry = iconsById[iconKey];
      if (!iconEntry || typeof iconEntry !== "object") {
        pushIconIssue(iconKey, "error", "Icono invalido (debe ser objeto): " + iconKey);
        return;
      }

      var iconLabel = String(iconEntry.label || "").trim();
      if (!iconLabel) {
        pushIconIssue(iconKey, "warning", "Icono sin label: " + iconKey);
      }

      var iconPath = String(iconEntry.icon || "").trim();
      if (!iconPath) {
        pushIconIssue(iconKey, "warning", "Icono sin path: " + iconKey);
      } else if (!isLikelyValidIngredientIconPath(iconPath)) {
        pushIconIssue(iconKey, "warning", "Icono con path potencialmente invalido '" + iconKey + "': " + iconPath);
      }

      var usageEntries = report.iconUsageByKey[iconKey] || [];
      usageEntries.sort(function (a, b) {
        return normalizeText(a.label || a.id).localeCompare(normalizeText(b.label || b.id));
      });
      report.iconUsageByKey[iconKey] = usageEntries;
      if (!usageEntries.length) {
        pushIconIssue(iconKey, "warning", "Icono sin uso: " + iconKey);
      }
    });

    report.menuReferenceReport = getMenuIngredientReferenceReport(ingredientsById);
    if (report.menuReferenceReport.invalidItems.length) {
      report.warnings.push(
        report.menuReferenceReport.invalidItems.length +
        " items del menu tienen ingredientes invalidos (" +
        report.menuReferenceReport.invalidReferencesCount + " refs)."
      );
    }

    return report;
  }

  function getMenuCategoryReferenceReport(categoriesById) {
    var report = {
      invalidItems: [],
      invalidReferencesCount: 0
    };

    getAllMenuItems().forEach(function (entry) {
      var item = entry && entry.item ? entry.item : null;
      if (!item) return;
      var categoryId = String(item.category || "").trim();
      if (!categoryId || categoriesById[categoryId]) return;

      report.invalidReferencesCount += 1;
      report.invalidItems.push({
        id: item.id || "",
        label: item.name || item.id || "Item sin nombre",
        category: categoryId
      });
    });

    return report;
  }

  function validateCategoriesDraftData(categoriesDraft) {
    var sharedContract = window.FigataCategoriesContract;
    if (
      sharedContract &&
      typeof sharedContract.validateCategoriesContract === "function"
    ) {
      return sharedContract.validateCategoriesContract(categoriesDraft, {
        menuPayload: state.drafts && state.drafts.menu ? state.drafts.menu : null
      });
    }

    var source = categoriesDraft && typeof categoriesDraft === "object" ? categoriesDraft : {};
    var categories = Array.isArray(source.categories) ? source.categories : [];
    var report = {
      errors: [],
      warnings: [],
      categoryIssuesById: {},
      duplicateIds: [],
      duplicateOrders: [],
      menuReferenceReport: {
        invalidItems: [],
        invalidReferencesCount: 0
      },
      issues: []
    };

    function ensureCategoryIssueBucket(categoryId) {
      var key = String(categoryId || "").trim() || "__unknown__";
      if (!report.categoryIssuesById[key]) {
        report.categoryIssuesById[key] = {
          errors: [],
          warnings: []
        };
      }
      return report.categoryIssuesById[key];
    }

    function pushCategoryIssue(categoryId, severity, message) {
      var bucket = ensureCategoryIssueBucket(categoryId);
      if (severity === "error") {
        bucket.errors.push(message);
        report.errors.push(message);
      } else {
        bucket.warnings.push(message);
        report.warnings.push(message);
      }
      report.issues.push({
        severity: severity,
        scope: "category",
        id: categoryId,
        message: message
      });
    }

    if (!Array.isArray(source.categories)) {
      report.errors.push("categories.categories debe ser un array");
      return report;
    }

    var idsCount = {};
    var orderToIds = {};
    var validCategoriesById = {};

    categories.forEach(function (entry, index) {
      var safeEntry = entry && typeof entry === "object" ? entry : null;
      if (!safeEntry) {
        pushCategoryIssue("index_" + index, "error", "Categoria invalida en index " + index + " (debe ser objeto)");
        return;
      }

      var categoryId = String(safeEntry.id || "").trim();
      var categoryLabel = String(safeEntry.label || "").trim();
      var issueKey = categoryId || ("index_" + index);
      var orderValue = Number(safeEntry.order);

      if (!categoryId) {
        pushCategoryIssue(issueKey, "error", "Categoria sin id en index " + index);
      } else {
        idsCount[categoryId] = (idsCount[categoryId] || 0) + 1;
        validCategoriesById[categoryId] = true;
      }

      if (!categoryLabel) {
        pushCategoryIssue(issueKey, "error", "Categoria sin label: " + issueKey);
      }

      if (!Number.isFinite(orderValue)) {
        pushCategoryIssue(issueKey, "warning", "Categoria sin order numerico: " + issueKey);
      } else {
        var normalizedOrder = Math.max(1, Math.round(orderValue));
        if (!orderToIds[normalizedOrder]) {
          orderToIds[normalizedOrder] = [];
        }
        orderToIds[normalizedOrder].push(issueKey);
      }

      if (typeof safeEntry.visible !== "boolean" && typeof safeEntry.enabled !== "boolean") {
        pushCategoryIssue(issueKey, "warning", "Categoria sin visible/enabled explicito: " + issueKey);
      }
    });

    Object.keys(idsCount).forEach(function (categoryId) {
      if (idsCount[categoryId] <= 1) return;
      report.duplicateIds.push(categoryId);
      report.errors.push("ID de categoria duplicado: " + categoryId);
    });

    Object.keys(orderToIds).forEach(function (orderValue) {
      var ids = orderToIds[orderValue];
      if (!Array.isArray(ids) || ids.length <= 1) return;
      report.duplicateOrders.push({
        order: Number(orderValue),
        ids: ids.slice()
      });
      report.errors.push("Order duplicado en categorias (" + orderValue + "): " + ids.join(", "));
    });

    report.menuReferenceReport = getMenuCategoryReferenceReport(validCategoriesById);
    if (report.menuReferenceReport.invalidItems.length) {
      report.warnings.push(
        report.menuReferenceReport.invalidItems.length +
        " menu items reference missing category (" +
        report.menuReferenceReport.invalidReferencesCount + " refs)."
      );
    }

    return report;
  }

  function ensureMediaStore() {
    if (!state.data || typeof state.data !== "object") {
      state.data = {};
    }

    if (!state.data.media || typeof state.data.media !== "object") {
      state.data.media = {
        version: 1,
        schema: "figata.media.v1",
        items: {},
        defaults: {
          card: MENU_PLACEHOLDER_IMAGE,
          modal: MENU_MODAL_PLACEHOLDER_IMAGE,
          hover: MENU_PLACEHOLDER_IMAGE,
          alt: "Imagen del producto Figata"
        }
      };
    }

    if (!state.data.media.defaults || typeof state.data.media.defaults !== "object") {
      state.data.media.defaults = {};
    }

    if (!state.data.media.defaults.card) {
      state.data.media.defaults.card = MENU_PLACEHOLDER_IMAGE;
    }
    if (!state.data.media.defaults.modal) {
      state.data.media.defaults.modal = MENU_MODAL_PLACEHOLDER_IMAGE;
    }
    if (!state.data.media.defaults.hover) {
      state.data.media.defaults.hover = MENU_PLACEHOLDER_IMAGE;
    }
    if (!state.data.media.defaults.alt) {
      state.data.media.defaults.alt = "Imagen del producto Figata";
    }

    if (!state.data.media.items || typeof state.data.media.items !== "object") {
      state.data.media.items = {};
    }
  }

  function syncMediaEntryForItem(item) {
    ensureMediaStore();
    if (!item) return;

    var itemId = String(item.id || "").trim();
    if (!itemId) return;

    var imagePath = resolveMenuMediaPath(item.image, true) || MENU_PLACEHOLDER_IMAGE;
    var mediaItems = state.data.media.items;
    var existing = mediaItems[itemId];
    var nextEntry = existing && typeof existing === "object" ? deepClone(existing) : {};

    nextEntry.card = imagePath;
    if (!nextEntry.modal || isSvgPlaceholderPath(nextEntry.modal)) {
      nextEntry.modal = imagePath;
    }
    if (typeof nextEntry.hover !== "string") {
      nextEntry.hover = "";
    }
    if (!Array.isArray(nextEntry.gallery)) {
      nextEntry.gallery = [];
    }
    if (!nextEntry.alt) {
      nextEntry.alt = item.name || itemId;
    }
    if (!Number.isFinite(Number(nextEntry.version))) {
      nextEntry.version = 1;
    } else {
      nextEntry.version = Number(nextEntry.version);
    }

    mediaItems[itemId] = nextEntry;
    state.data.media.updatedAt = new Date().toISOString();
    state.data.media.updatedBy = "admin-app";
  }

  function removeMediaEntryForItem(itemId) {
    ensureMediaStore();
    var normalizedId = String(itemId || "").trim();
    if (!normalizedId) return;
    if (state.data.media.items && state.data.media.items[normalizedId]) {
      delete state.data.media.items[normalizedId];
      state.data.media.updatedAt = new Date().toISOString();
      state.data.media.updatedBy = "admin-app";
    }
  }

  function normalizeHomeDeliveryIconSize(rawValue, fallbackSize) {
    var parsed = Number(rawValue);
    var nextSize = Number.isFinite(parsed) ? Math.round(parsed) : fallbackSize;
    return Math.max(HOME_DELIVERY_ICON_MIN_SIZE, Math.min(HOME_DELIVERY_ICON_MAX_SIZE, nextSize));
  }

  function normalizeHomeTestimonialStars(rawValue, fallbackStars) {
    var parsed = Number(rawValue);
    var nextStars = Number.isFinite(parsed) ? Math.round(parsed) : fallbackStars;
    return Math.max(1, Math.min(5, nextStars));
  }

  function cloneHomeTestimonialsDefaultItems() {
    return HOME_TESTIMONIALS_DEFAULT_ITEMS.map(function (item) {
      return {
        name: item.name,
        role: item.role,
        text: item.text,
        stars: normalizeHomeTestimonialStars(item.stars, 5)
      };
    });
  }

  function normalizeHomeTestimonialsItems(rawItems) {
    var sourceItems = Array.isArray(rawItems) ? rawItems : [];
    if (!sourceItems.length) {
      sourceItems = cloneHomeTestimonialsDefaultItems();
    }

    var fallbackItems = cloneHomeTestimonialsDefaultItems();
    var normalized = sourceItems
      .slice(0, HOME_TESTIMONIALS_LIMIT)
      .map(function (item, index) {
        var safeItem = item && typeof item === "object" ? item : {};
        var fallback = fallbackItems[index] || fallbackItems[fallbackItems.length - 1] || {};

        return {
          name: String(safeItem.name || fallback.name || ("Cliente " + (index + 1))).trim(),
          role: String(safeItem.role || fallback.role || "Cliente").trim(),
          text: String(safeItem.text || fallback.text || "").trim(),
          stars: normalizeHomeTestimonialStars(safeItem.stars, normalizeHomeTestimonialStars(fallback.stars, 5))
        };
      });

    if (!normalized.length) {
      return fallbackItems.slice(0, HOME_TESTIMONIALS_LIMIT);
    }

    return normalized;
  }

  function cloneHomeFooterDefaultColumns() {
    return HOME_FOOTER_DEFAULT_COLUMNS.map(function (column) {
      return {
        title: column.title,
        links: (column.links || []).map(function (linkEntry) {
          return {
            label: linkEntry.label,
            url: linkEntry.url
          };
        })
      };
    });
  }

  function normalizeHomeFooterLink(linkInput, index) {
    var safeLink = linkInput && typeof linkInput === "object" ? linkInput : {};
    var label = String(safeLink.label || "").trim();
    var url = String(safeLink.url || "").trim();
    if (!label && !url) return null;
    return {
      label: label || ("Link " + (index + 1)),
      url: url
    };
  }

  function normalizeHomeFooterColumn(columnInput, index, fallbackColumn) {
    var safeColumn = columnInput && typeof columnInput === "object" ? columnInput : {};
    var fallback = fallbackColumn && typeof fallbackColumn === "object"
      ? fallbackColumn
      : { title: "Columna " + (index + 1), links: [] };
    var sourceLinks = Array.isArray(safeColumn.links)
      ? safeColumn.links
      : (Array.isArray(fallback.links) ? fallback.links : []);
    var normalizedLinks = sourceLinks
      .map(function (linkEntry, linkIndex) {
        return normalizeHomeFooterLink(linkEntry, linkIndex);
      })
      .filter(Boolean)
      .slice(0, HOME_FOOTER_LINKS_LIMIT);

    return {
      title: String(safeColumn.title || fallback.title || ("Columna " + (index + 1))).trim(),
      links: normalizedLinks
    };
  }

  function normalizeHomeFooterColumns(rawColumns) {
    var sourceColumns = Array.isArray(rawColumns) ? rawColumns : [];
    var fallbackColumns = cloneHomeFooterDefaultColumns();
    var normalized = [];

    for (var index = 0; index < HOME_FOOTER_COLUMNS_COUNT; index += 1) {
      normalized.push(
        normalizeHomeFooterColumn(
          sourceColumns[index],
          index,
          fallbackColumns[index] || fallbackColumns[0]
        )
      );
    }

    return normalized;
  }

  function normalizeHomeFooterSocials(rawSocials) {
    var source = rawSocials && typeof rawSocials === "object" ? rawSocials : {};
    var normalized = {};
    HOME_FOOTER_SOCIAL_KEYS.forEach(function (socialKey) {
      normalized[socialKey] = String(
        source[socialKey] || HOME_FOOTER_DEFAULT_SOCIALS[socialKey] || ""
      ).trim();
    });
    return normalized;
  }

  function normalizeHomeDeliveryPlatforms(home) {
    if (!home.delivery || typeof home.delivery !== "object") {
      home.delivery = {};
    }
    if (!home.delivery.links || typeof home.delivery.links !== "object") {
      home.delivery.links = {};
    }
    if (!home.delivery.platforms || typeof home.delivery.platforms !== "object") {
      home.delivery.platforms = {};
    }

    HOME_DELIVERY_PLATFORM_KEYS.forEach(function (platformKey) {
      var defaults = HOME_DELIVERY_DEFAULTS[platformKey] || {};
      var legacyUrl = String(home.delivery.links[platformKey] || "").trim();
      var source = home.delivery.platforms[platformKey];
      if (!source || typeof source !== "object") {
        source = {};
      }

      var hasOwn = Object.prototype.hasOwnProperty;
      var rawUrl = hasOwn.call(source, "url") ? source.url : (legacyUrl || defaults.url || "");
      var rawIcon = hasOwn.call(source, "icon") ? source.icon : defaults.icon;
      var rawIconSize = hasOwn.call(source, "iconSize") ? source.iconSize : defaults.iconSize;

      var normalizedUrl = String(rawUrl || "").trim();
      var normalizedIcon = String(rawIcon || defaults.icon || "").trim();
      var normalizedIconSize = normalizeHomeDeliveryIconSize(
        rawIconSize,
        Number(defaults.iconSize) || 32
      );

      home.delivery.platforms[platformKey] = {
        url: normalizedUrl,
        icon: normalizedIcon,
        iconSize: normalizedIconSize
      };

      home.delivery.links[platformKey] = normalizedUrl;
    });
  }

  function ensureHomeDraft() {
    if (!state.drafts.home || typeof state.drafts.home !== "object") {
      state.drafts.home = {};
    }

    var home = state.drafts.home;
    home.version = Number.isFinite(Number(home.version)) ? Number(home.version) : 1;
    home.schema = "figata.home.v1";

    if (!home.sections || typeof home.sections !== "object") {
      home.sections = {};
    }
    if (!home.hero || typeof home.hero !== "object") {
      home.hero = {};
    }
    if (!home.hero.ctaPrimary || typeof home.hero.ctaPrimary !== "object") {
      home.hero.ctaPrimary = {};
    }
    if (!home.hero.ctaSecondary || typeof home.hero.ctaSecondary !== "object") {
      home.hero.ctaSecondary = {};
    }
    if (!home.popular || typeof home.popular !== "object") {
      home.popular = {};
    }
    if (!home.delivery || typeof home.delivery !== "object") {
      home.delivery = {};
    }
    if (!home.eventsPreview || typeof home.eventsPreview !== "object") {
      home.eventsPreview = {};
    }
    if (!home.navbar || typeof home.navbar !== "object") {
      home.navbar = {};
    }
    if (!home.navbar.cta || typeof home.navbar.cta !== "object") {
      home.navbar.cta = {};
    }
    if (!home.reservation || typeof home.reservation !== "object") {
      home.reservation = {};
    }
    if (!home.announcements || typeof home.announcements !== "object") {
      home.announcements = {};
    }
    if (!home.testimonials || typeof home.testimonials !== "object") {
      home.testimonials = {};
    }
    if (!home.footer || typeof home.footer !== "object") {
      home.footer = {};
    }

    home.hero.title = String(home.hero.title || "Pizza napolitana autentica").trim();
    home.hero.subtitle = String(
      home.hero.subtitle ||
      "Horneada en horno de lena, con ingredientes seleccionados y maridajes de la casa."
    ).trim();
    home.hero.backgroundImage = String(home.hero.backgroundImage || "assets/home/seamless-bg.webp").trim();
    home.hero.ctaPrimary.label = String(home.hero.ctaPrimary.label || "Ver menu").trim();
    home.hero.ctaPrimary.url = String(home.hero.ctaPrimary.url || "#menu").trim();
    home.hero.ctaSecondary.label = String(home.hero.ctaSecondary.label || "Reservar").trim();
    home.hero.ctaSecondary.url = String(home.hero.ctaSecondary.url || "#reservar").trim();

    home.popular.title = String(home.popular.title || "Las mas pedidas").trim();
    home.popular.subtitle = String(home.popular.subtitle || "Favoritas de nuestros clientes").trim();

    if (!Array.isArray(home.popular.featuredIds)) {
      home.popular.featuredIds = [];
    }

    var normalizedFeaturedIds = [];
    home.popular.featuredIds.forEach(function (featuredId) {
      var normalized = String(featuredId || "").trim();
      if (!normalized) return;
      if (normalizedFeaturedIds.includes(normalized)) return;
      normalizedFeaturedIds.push(normalized);
    });

    home.popular.featuredIds = normalizedFeaturedIds;

    var rawPopularLimit = Number(home.popular.limit);
    if (!Number.isFinite(rawPopularLimit) || rawPopularLimit <= 0) {
      rawPopularLimit = HOME_FEATURED_LIMIT;
    }
    home.popular.limit = Math.min(HOME_FEATURED_LIMIT, Math.max(1, Math.round(rawPopularLimit)));

    if (home.popular.featuredIds.length > HOME_FEATURED_LIMIT) {
      home.popular.featuredIds = home.popular.featuredIds.slice(
        home.popular.featuredIds.length - HOME_FEATURED_LIMIT
      );
    }

    home.delivery.title = String(home.delivery.title || "Figata en tu casa").trim();
    home.delivery.subtitle = String(
      home.delivery.subtitle ||
      "Pide por nuestras plataformas oficiales y recibe la pizza recien horneada donde estes, o para llevar."
    ).trim();
    normalizeHomeDeliveryPlatforms(home);

    home.eventsPreview.enabled = home.eventsPreview.enabled !== false;
    home.eventsPreview.title = String(home.eventsPreview.title || "Eventos en Figata").trim();
    home.eventsPreview.subtitle = String(
      home.eventsPreview.subtitle ||
      "Llevamos el sabor de Figata a cada ocasion, dentro o fuera de nuestra casa."
    ).trim();

    var eventsLimit = Number(home.eventsPreview.limit);
    if (!Number.isFinite(eventsLimit) || eventsLimit <= 0) {
      eventsLimit = 3;
    }
    home.eventsPreview.limit = Math.max(1, Math.round(eventsLimit));

    if (!Array.isArray(home.eventsPreview.items)) {
      home.eventsPreview.items = [];
    }
    if (!home.eventsPreview.items.length) {
      home.eventsPreview.items = [
        {
          id: "celebraciones_in_house",
          title: "Celebraciones In-House",
          subtitle: "Celebra tu evento en nuestro local"
        },
        {
          id: "pizza_party_domicilio",
          title: "Pizza Party a Domicilio",
          subtitle: "Experiencia Figata donde estes"
        },
        {
          id: "noches_especiales",
          title: "Noches Especiales",
          subtitle: "Catas y eventos privados en Figata"
        }
      ];
    }

    home.eventsPreview.items = home.eventsPreview.items
      .map(function (item, index) {
        var safeItem = item && typeof item === "object" ? item : {};
        return {
          id: String(safeItem.id || ("evento_" + (index + 1))).trim(),
          title: String(safeItem.title || ("Evento " + (index + 1))).trim(),
          subtitle: String(safeItem.subtitle || "").trim()
        };
      })
      .filter(function (item) {
        return Boolean(item.id);
      });
    home.eventsPreview.items = home.eventsPreview.items.slice(0, home.eventsPreview.limit);
    home.eventsPreview.eventIds = home.eventsPreview.items.map(function (item) {
      return item.id;
    });

    var legacyReservation = home.reservation && typeof home.reservation === "object"
      ? home.reservation
      : {};

    var rawNavbarLinks = Array.isArray(home.navbar.links) ? home.navbar.links : [];
    var normalizedNavbarLinks = [];

    rawNavbarLinks.forEach(function (linkEntry) {
      if (!linkEntry || typeof linkEntry !== "object") return;
      var label = String(linkEntry.label || "").trim();
      var url = String(linkEntry.url || "").trim();
      if (!label && !url) return;
      normalizedNavbarLinks.push({
        label: label || "Link",
        url: url || "#"
      });
    });

    if (!normalizedNavbarLinks.length) {
      normalizedNavbarLinks = HOME_DEFAULT_NAVBAR_LINKS.map(function (linkEntry) {
        return {
          label: linkEntry.label,
          url: linkEntry.url
        };
      });
    }

    home.navbar.links = normalizedNavbarLinks;
    home.navbar.cta.label = String(
      home.navbar.cta.label || legacyReservation.ctaLabel || "Reservar ahora"
    ).trim();
    home.navbar.cta.url = String(
      home.navbar.cta.url || legacyReservation.url || "#reservar"
    ).trim();
    home.navbar.cta.icon = String(
      home.navbar.cta.icon || HOME_DEFAULT_NAVBAR_ICON
    ).trim();
    home.navbar.cta.title = String(
      home.navbar.cta.title || legacyReservation.title || "Reserva tu mesa"
    ).trim();

    home.reservation.enabled = home.sections.navbar !== false;
    home.reservation.title = home.navbar.cta.title;
    home.reservation.url = home.navbar.cta.url;
    home.reservation.ctaLabel = home.navbar.cta.label;

    home.announcements.enabled = Boolean(home.announcements.enabled);
    home.announcements.message = String(home.announcements.message || "").trim();
    home.announcements.link = String(home.announcements.link || "").trim();
    home.announcements.type = HOME_ANNOUNCEMENT_TYPES.includes(home.announcements.type)
      ? home.announcements.type
      : "highlight";

    home.testimonials.enabled = home.testimonials.enabled !== false;
    home.testimonials.title = String(home.testimonials.title || "Historias que nacen en nuestra mesa").trim();
    home.testimonials.subtitle = String(
      home.testimonials.subtitle ||
      "Clientes que volvieron por la masa, el fuego y el ambiente de Figata."
    ).trim();
    home.testimonials.items = normalizeHomeTestimonialsItems(home.testimonials.items);

    home.footer.enabled = home.footer.enabled !== false;
    home.footer.columns = normalizeHomeFooterColumns(home.footer.columns);
    if (!home.footer.cta || typeof home.footer.cta !== "object") {
      home.footer.cta = {};
    }
    home.footer.cta.label = String(home.footer.cta.label || HOME_FOOTER_DEFAULT_CTA.label).trim();
    home.footer.cta.url = String(home.footer.cta.url || HOME_FOOTER_DEFAULT_CTA.url).trim();
    home.footer.socials = normalizeHomeFooterSocials(home.footer.socials);
    home.footer.note = String(home.footer.note || "").trim();

    if (typeof home.sections.navbar !== "boolean") {
      home.sections.navbar = typeof home.sections.reservation === "boolean"
        ? home.sections.reservation
        : true;
    }
    if (typeof home.sections.hero !== "boolean") {
      home.sections.hero = true;
    }
    if (typeof home.sections.popular !== "boolean") {
      home.sections.popular = true;
    }
    if (typeof home.sections.events !== "boolean") {
      home.sections.events = true;
    }
    if (typeof home.sections.delivery !== "boolean") {
      home.sections.delivery = true;
    }
    if (typeof home.sections.announcements !== "boolean") {
      home.sections.announcements = true;
    }
    if (typeof home.sections.testimonials !== "boolean") {
      home.sections.testimonials = true;
    }
    if (typeof home.sections.footer !== "boolean") {
      home.sections.footer = true;
    }
  }

  function syncHomeFeaturedSelection(itemId, isFeatured) {
    ensureHomeDraft();
    var normalizedId = String(itemId || "").trim();
    if (!normalizedId) return;

    var featuredIds = state.drafts.home.popular.featuredIds.filter(function (id) {
      return id !== normalizedId;
    });

    if (isFeatured) {
      featuredIds.push(normalizedId);
      if (featuredIds.length > HOME_FEATURED_LIMIT) {
        featuredIds = featuredIds.slice(featuredIds.length - HOME_FEATURED_LIMIT);
      }
    }

    state.drafts.home.popular.featuredIds = featuredIds;
  }

  function sortByOrder(list) {
    return list.slice().sort(function (a, b) {
      var aOrder = Number(a && a.order);
      var bOrder = Number(b && b.order);
      var aHas = Number.isFinite(aOrder);
      var bHas = Number.isFinite(bOrder);

      if (aHas && bHas && aOrder !== bOrder) return aOrder - bOrder;
      if (aHas && !bHas) return -1;
      if (!aHas && bHas) return 1;

      var aLabel = normalizeText((a && (a.label || a.id)) || "");
      var bLabel = normalizeText((b && (b.label || b.id)) || "");
      if (aLabel < bLabel) return -1;
      if (aLabel > bLabel) return 1;
      return 0;
    });
  }

  function addMenuMediaCandidatesToSet(targetSet, rawPath) {
    if (!targetSet) return;

    var normalized = toRelativeAssetPath(rawPath);
    if (!normalized) return;

    if (isMenuMediaPath(normalized) || isSvgPlaceholderPath(normalized)) {
      targetSet.add(normalized);
    }

    if (normalized.indexOf("menu/") === 0) {
      var assetsVariant = toRelativeAssetPath("assets/" + normalized);
      if (isMenuMediaPath(assetsVariant) || isSvgPlaceholderPath(assetsVariant)) {
        targetSet.add(assetsVariant);
      }
    }
  }

  function buildIndexes() {
    ensureMediaStore();
    ensureIngredientsDraft();
    ensureCategoriesDraft();
    var categoriesSource = (state.drafts && state.drafts.categories) || ((state.data || {}).categories) || {};
    var categoriesRaw = (categoriesSource.categories || []).map(function (category, index) {
      return normalizeCategoryDraftEntry(category, index);
    }).filter(function (category) {
      return category && category.id && resolveCategoryVisibility(category);
    });

    state.indexes.categoryList = sortByOrder(categoriesRaw).map(function (category) {
      var categoryCopy = deepClone(category);
      categoryCopy.visible = resolveCategoryVisibility(categoryCopy);
      categoryCopy.enabled = categoryCopy.visible;
      categoryCopy.subcategories = sortByOrder((categoryCopy.subcategories || []).filter(function (sub) {
        return sub && resolveCategoryVisibility(sub);
      }));
      return categoryCopy;
    });

    state.indexes.categoriesById = {};
    state.indexes.categoryList.forEach(function (category) {
      state.indexes.categoriesById[category.id] = category;
    });

    var ingredientsSource = state.drafts.ingredients || ((state.data && state.data.ingredients) || {});
    state.indexes.ingredientsById = ingredientsSource.ingredients || {};
    state.indexes.iconsById = ingredientsSource.icons || {};
    state.indexes.iconList = Object.keys(state.indexes.iconsById).sort(function (a, b) {
      return normalizeText(a).localeCompare(normalizeText(b));
    });
    state.indexes.iconUsageByKey = {};
    state.indexes.iconList.forEach(function (iconKey) {
      state.indexes.iconUsageByKey[iconKey] = [];
    });
    state.indexes.ingredientList = Object.keys(state.indexes.ingredientsById).map(function (id) {
      var entry = state.indexes.ingredientsById[id] || {};
      var iconPath = resolveIngredientIconPath(entry, ingredientsSource);
      var iconValue = String(entry.icon || "").trim();
      if (iconValue && state.indexes.iconUsageByKey[iconValue]) {
        state.indexes.iconUsageByKey[iconValue].push({
          id: id,
          label: entry.label || id
        });
      }
      return {
        id: id,
        label: entry.label || id,
        icon: iconPath,
        iconKey: iconValue
      };
    }).sort(function (a, b) {
      return normalizeText(a.label).localeCompare(normalizeText(b.label));
    });

    state.indexes.tagsById = ingredientsSource.tags || {};
    state.indexes.tagList = Object.keys(state.indexes.tagsById).sort();

    state.indexes.allergensById = ingredientsSource.allergens || {};
    state.indexes.allergenList = Object.keys(state.indexes.allergensById).sort();

    var mediaPathsSet = new Set([MENU_PLACEHOLDER_IMAGE, MENU_MODAL_PLACEHOLDER_IMAGE]);
    var mediaItems = ((state.data && state.data.media && state.data.media.items) || {});
    Object.keys(mediaItems).forEach(function (itemId) {
      var mediaEntry = mediaItems[itemId] || {};
      [mediaEntry.card, mediaEntry.hover, mediaEntry.modal].forEach(function (path) {
        addMenuMediaCandidatesToSet(mediaPathsSet, path);
      });
    });

    getAllMenuItems().forEach(function (entry) {
      if (entry.item && entry.item.image) {
        addMenuMediaCandidatesToSet(mediaPathsSet, entry.item.image);
      }
    });

    (state.indexes.localMenuMediaPaths || []).forEach(function (localPath) {
      addMenuMediaCandidatesToSet(mediaPathsSet, localPath);
    });

    state.indexes.mediaPaths = Array.from(mediaPathsSet).sort(function (a, b) {
      return normalizeText(a).localeCompare(normalizeText(b));
    });

    state.indexes.menuMediaPathSet = {};
    state.indexes.mediaPaths.forEach(function (path) {
      state.indexes.menuMediaPathSet[path] = true;
    });
  }

  async function loadAllData(forceReload) {
    if (state.isDataLoading) return;
    if (state.hasDataLoaded && !forceReload) return;

    state.isDataLoading = true;
    elements.refreshDataButton.disabled = true;
    setDataStatus("Cargando JSON desde /data ...");

    try {
      var endpointEntries = Object.entries(DATA_ENDPOINTS);
      var results = await Promise.all(endpointEntries.map(function (entry) {
        return fetchJson(entry[1]);
      }));

      state.data = {};
      endpointEntries.forEach(function (entry, index) {
        state.data[entry[0]] = results[index];
      });

      state.drafts.menu = deepClone(state.data.menu);
      state.drafts.availability = deepClone(state.data.availability);
      state.drafts.home = deepClone(state.data.home);
      state.drafts.ingredients = deepClone(state.data.ingredients || {});
      state.drafts.categories = deepClone(state.data.categories || {});
      state.indexes.localMenuMediaPaths = await fetchLocalMenuMediaPaths();
      var restoredFromLocalDrafts = hydrateDraftsFromLocalStorage();
      ensureMenuDraft();
      ensureAvailabilityDraft();
      ensureHomeDraft();
      ensureIngredientsDraft();
      ensureCategoriesDraft();
      buildIndexes();
      state.hasDataLoaded = true;
      updateDashboardMetrics();

      renderMenuBrowser();
      renderSidebarMenuAccordion();
      renderSidebarHomepageAccordion();
      renderSidebarCategoriesAccordion();

      if (restoredFromLocalDrafts) {
        setDraftsBanner(true, "Drafts restaurados (Clear drafts | Export)");
        setDataStatus("Drafts locales restaurados y aplicados.");
      } else {
        setDraftsBanner(false);
      }

      if (!restoredFromLocalDrafts) {
        setDataStatus("JSON cargados correctamente (" + new Date().toLocaleTimeString("es-DO") + ").");
      }
      setMenuBrowserStatus("");
      setItemEditorStatus("");
      setHomeEditorStatus("");
      setIngredientsEditorStatus("");
      setCategoriesEditorStatus("");
      showItemEditorErrors([]);
      applyRoute();
    } catch (error) {
      setDataStatus("No se pudo cargar /data/*.json: " + error.message);
      setMenuBrowserStatus("No se puede usar Menu Editor hasta cargar data.");
    } finally {
      state.isDataLoading = false;
      elements.refreshDataButton.disabled = false;
    }
  }

  function ensureDataLoaded(forceReload) {
    loadAllData(Boolean(forceReload));
  }

  function resetDraftsToBaseData() {
    if (
      !state.data ||
      !state.data.menu ||
      !state.data.availability ||
      !state.data.home ||
      !state.data.ingredients ||
      !state.data.categories
    ) {
      clearPersistedDraftsStorage();
      setDraftsBanner(false);
      return;
    }

    state.drafts.menu = deepClone(state.data.menu);
    state.drafts.availability = deepClone(state.data.availability);
    state.drafts.home = deepClone(state.data.home);
    state.drafts.ingredients = deepClone(state.data.ingredients || {});
    state.drafts.categories = deepClone(state.data.categories || {});
    ensureMenuDraft();
    ensureAvailabilityDraft();
    ensureHomeDraft();
    ensureIngredientsDraft();
    ensureCategoriesDraft();
    buildIndexes();
    updateDashboardMetrics();
    renderMenuBrowser();
    renderSidebarMenuAccordion();
    renderSidebarHomepageAccordion();
    renderSidebarCategoriesAccordion();
    if (state.currentPanel === "ingredients-editor") {
      renderIngredientsEditor();
    }

    if (state.currentPanel === "menu-item") {
      openMenuBrowser({ skipRoute: true });
    } else {
      applyRoute();
    }

    clearPersistedDraftsStorage();
    setDraftsBanner(false);
    setDataStatus("Drafts locales limpiados. Se restauro el estado base de /data.");
    setItemEditorStatus("");
    setHomeEditorStatus("");
    setIngredientsEditorStatus("");
    setCategoriesEditorStatus("");
    showItemEditorErrors([]);
  }

  function getMenuSections() {
    ensureMenuDraft();
    return state.drafts.menu.sections;
  }

  function getAllMenuItems() {
    var sections = getMenuSections();
    var items = [];

    sections.forEach(function (section, sectionIndex) {
      var sectionItems = Array.isArray(section.items) ? section.items : [];
      sectionItems.forEach(function (item, itemIndex) {
        items.push({
          sectionId: section.id,
          sectionLabel: section.label || section.id,
          sectionIndex: sectionIndex,
          itemIndex: itemIndex,
          item: item
        });
      });
    });

    return items;
  }

  function findItemPositionById(itemId) {
    var sections = getMenuSections();

    for (var sectionIndex = 0; sectionIndex < sections.length; sectionIndex += 1) {
      var section = sections[sectionIndex];
      var items = Array.isArray(section.items) ? section.items : [];
      for (var itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
        var item = items[itemIndex];
        if (item && item.id === itemId) {
          return {
            section: section,
            sectionIndex: sectionIndex,
            sectionId: section.id,
            itemIndex: itemIndex,
            item: item
          };
        }
      }
    }

    return null;
  }

  function resolveCategoryForItem(item) {
    if (!item) return null;

    if (item.category && state.indexes.categoriesById[item.category]) {
      return state.indexes.categoriesById[item.category];
    }

    var categories = state.indexes.categoryList;
    for (var i = 0; i < categories.length; i += 1) {
      var legacyIds = categories[i].legacyIds || [];
      if (legacyIds.includes(item.category)) {
        return categories[i];
      }
    }

    return null;
  }

  function categoryMatchesItem(category, item) {
    if (!category || !item) return false;
    if (item.category === category.id) return true;
    var legacyIds = category.legacyIds || [];
    return legacyIds.includes(item.category);
  }

  function getCategoryById(categoryId) {
    return state.indexes.categoriesById[categoryId] || null;
  }

  function getSubcategoryLabel(category, subcategoryId) {
    if (!subcategoryId) return "General";
    if (!category) return subcategoryId;

    var match = (category.subcategories || []).find(function (subcategory) {
      return subcategory.id === subcategoryId;
    });

    return match ? (match.label || match.id) : subcategoryId;
  }

  function flattenGroupEntries(group) {
    return (group.subgroups || []).reduce(function (acc, subgroup) {
      return acc.concat(subgroup.items || []);
    }, []);
  }

  function buildMenuGroups() {
    var allEntries = getAllMenuItems();
    var groups = [];
    var usedItemIds = new Set();

    state.indexes.categoryList.forEach(function (category) {
      var categoryEntries = allEntries.filter(function (entry) {
        return categoryMatchesItem(category, entry.item);
      });

      if (!categoryEntries.length) {
        return;
      }

      categoryEntries.forEach(function (entry) {
        usedItemIds.add(entry.item.id);
      });

      var definedSubcategories = (category.subcategories || []).filter(Boolean);
      var hasDefinedSubcategories = definedSubcategories.length > 0;
      var definedSubgroupsById = {};
      var unknownSubgroupsById = {};
      var unassignedEntries = [];

      definedSubcategories.forEach(function (subcategory) {
        definedSubgroupsById[subcategory.id] = {
          id: subcategory.id,
          label: subcategory.label || subcategory.id,
          items: [],
          order: Number(subcategory.order),
          isFallbackGeneral: false
        };
      });

      categoryEntries.forEach(function (entry) {
        var subcategoryId = String(entry.item.subcategory || "").trim();

        if (!subcategoryId) {
          unassignedEntries.push(entry);
          return;
        }

        if (definedSubgroupsById[subcategoryId]) {
          definedSubgroupsById[subcategoryId].items.push(entry);
          return;
        }

        if (!unknownSubgroupsById[subcategoryId]) {
          unknownSubgroupsById[subcategoryId] = {
            id: subcategoryId,
            label: subcategoryId,
            items: [],
            order: null,
            isFallbackGeneral: false
          };
        }

        unknownSubgroupsById[subcategoryId].items.push(entry);
      });

      var subgroups = [];

      if (hasDefinedSubcategories) {
        definedSubcategories.forEach(function (subcategory) {
          var subgroup = definedSubgroupsById[subcategory.id];
          if (subgroup.items.length) {
            subgroups.push(subgroup);
          }
        });

        Object.keys(unknownSubgroupsById).forEach(function (subId) {
          subgroups.push(unknownSubgroupsById[subId]);
        });

        if (unassignedEntries.length) {
          if (subgroups.length === 0) {
            subgroups.push({
              id: "",
              label: category.label || category.id,
              items: unassignedEntries,
              order: null,
              isFallbackGeneral: false
            });
          } else {
            subgroups.unshift({
              id: "",
              label: "General",
              items: unassignedEntries,
              order: -9999,
              isFallbackGeneral: true
            });
          }
        }
      } else {
        subgroups.push({
          id: "",
          label: category.label || category.id,
          items: categoryEntries,
          order: null,
          isFallbackGeneral: false
        });
      }

      subgroups = subgroups.filter(function (subgroup) {
        return subgroup.items && subgroup.items.length > 0;
      }).sort(function (a, b) {
        if (!a.id && b.id) return -1;
        if (a.id && !b.id) return 1;

        var aOrder = Number(a.order);
        var bOrder = Number(b.order);
        var aHasOrder = Number.isFinite(aOrder);
        var bHasOrder = Number.isFinite(bOrder);

        if (aHasOrder && bHasOrder && aOrder !== bOrder) return aOrder - bOrder;
        if (aHasOrder && !bHasOrder) return -1;
        if (!aHasOrder && bHasOrder) return 1;

        return normalizeText(a.label).localeCompare(normalizeText(b.label));
      });

      groups.push({
        id: category.id,
        label: category.label || category.id,
        order: Number(category.order),
        sourceCategoryIds: [category.id],
        hasDefinedSubcategories: hasDefinedSubcategories,
        subgroups: subgroups
      });
    });

    var pizzaClassicGroup = groups.find(function (group) {
      return group.id === "pizza";
    });
    var pizzaAuthorGroup = groups.find(function (group) {
      return group.id === "pizza_autor";
    });

    if (pizzaClassicGroup || pizzaAuthorGroup) {
      var mergedSubgroups = [];

      if (pizzaClassicGroup) {
        mergedSubgroups.push({
          id: "pizza_clasica",
          label: pizzaClassicGroup.label,
          items: flattenGroupEntries(pizzaClassicGroup),
          order: pizzaClassicGroup.order,
          isFallbackGeneral: false
        });
      }

      if (pizzaAuthorGroup) {
        mergedSubgroups.push({
          id: "pizza_autor",
          label: pizzaAuthorGroup.label,
          items: flattenGroupEntries(pizzaAuthorGroup),
          order: pizzaAuthorGroup.order,
          isFallbackGeneral: false
        });
      }

      mergedSubgroups = mergedSubgroups.filter(function (subgroup) {
        return subgroup.items.length > 0;
      });

      var mergedOrder = [pizzaClassicGroup, pizzaAuthorGroup]
        .filter(Boolean)
        .map(function (group) {
          return Number(group.order);
        })
        .filter(Number.isFinite)
        .sort(function (a, b) {
          return a - b;
        })[0];

      groups = groups.filter(function (group) {
        return group.id !== "pizza" && group.id !== "pizza_autor";
      });

      if (mergedSubgroups.length) {
        groups.push({
          id: "pizzas",
          label: "Pizzas",
          order: Number.isFinite(mergedOrder) ? mergedOrder : 2,
          sourceCategoryIds: ["pizza", "pizza_autor"],
          hasDefinedSubcategories: true,
          subgroups: mergedSubgroups
        });
      }
    }

    groups.sort(function (a, b) {
      var aOrder = Number(a.order);
      var bOrder = Number(b.order);
      var aHasOrder = Number.isFinite(aOrder);
      var bHasOrder = Number.isFinite(bOrder);

      if (aHasOrder && bHasOrder && aOrder !== bOrder) return aOrder - bOrder;
      if (aHasOrder && !bHasOrder) return -1;
      if (!aHasOrder && bHasOrder) return 1;

      return normalizeText(a.label).localeCompare(normalizeText(b.label));
    });

    var uncategorizedItems = allEntries.filter(function (entry) {
      return !usedItemIds.has(entry.item.id);
    });

    if (uncategorizedItems.length) {
      groups.push({
        id: "sin_categoria",
        label: "Sin categoria",
        order: 9999,
        sourceCategoryIds: [],
        hasDefinedSubcategories: false,
        subgroups: [
          {
            id: "",
            label: "Sin categoria",
            items: uncategorizedItems,
            order: null,
            isFallbackGeneral: false
          }
        ]
      });
    }

    return groups.filter(function (group) {
      return group.subgroups && group.subgroups.length > 0;
    });
  }

  function cssSafe(value) {
    return String(value || "").replace(/[^a-zA-Z0-9_-]/g, "-");
  }

  function getGroupAnchorId(categoryId) {
    return "menu-group-" + cssSafe(categoryId);
  }

  function getSubgroupAnchorId(categoryId, subcategoryId) {
    return "menu-subgroup-" + cssSafe(categoryId) + "-" + cssSafe(subcategoryId || "general");
  }

  function mapCategoryToMenuGroup(categoryId) {
    if ((categoryId === "pizza" || categoryId === "pizza_autor")) {
      var hasMergedPizzas = state.menuViewGroups.some(function (group) {
        return group.id === "pizzas";
      });
      if (hasMergedPizzas) return "pizzas";
    }
    return categoryId;
  }

  /* ===========================
     PANEL ADAPTERS + SCROLL SPY
  =========================== */

  function scrollToMenuAnchor(categoryId, subcategoryId) {
    var normalizedCategoryId = mapCategoryToMenuGroup(categoryId);
    var normalizedSubcategoryId = subcategoryId || "";

    var anchorId = normalizedSubcategoryId
      ? getSubgroupAnchorId(normalizedCategoryId, normalizedSubcategoryId)
      : getGroupAnchorId(normalizedCategoryId);

    var element = document.getElementById(anchorId);
    if (!element && normalizedSubcategoryId) {
      element = document.getElementById(getGroupAnchorId(normalizedCategoryId));
    }
    if (!element) return;

    var targetTop = window.scrollY + element.getBoundingClientRect().top - UX_TIMING.anchorScrollOffsetPx;
    var lockDurationMs = getProgrammaticScrollLockDuration(targetTop, "smooth");
    runWithProgrammaticScrollLock(function () {
      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: "smooth"
      });
    }, lockDurationMs, "menu:" + normalizedCategoryId + (normalizedSubcategoryId ? ("/" + normalizedSubcategoryId) : ""));
  }

  function updateSidebarMenuAccordionActiveClasses() {
    if (!elements.sidebarMenuAccordion) return;
    var activeCategoryId = state.menuActiveAnchor.categoryId || "";
    var activeSubcategoryId = state.menuActiveAnchor.subcategoryId || "";
    var buttons = elements.sidebarMenuAccordion.querySelectorAll("[data-scroll-category]");
    Array.prototype.forEach.call(buttons, function (button) {
      var categoryId = button.getAttribute("data-scroll-category") || "";
      var subcategoryId = button.getAttribute("data-scroll-subcategory") || "";
      var isActive = subcategoryId
        ? categoryId === activeCategoryId && subcategoryId === activeSubcategoryId
        : categoryId === activeCategoryId;
      button.classList.toggle("is-active", isActive);
    });
  }

  function setActiveMenuAnchor(categoryId, subcategoryId, options) {
    options = options || {};

    var nextCategoryId = categoryId || "";
    var nextSubcategoryId = subcategoryId || "";
    var isSameAnchor =
      state.menuActiveAnchor.categoryId === nextCategoryId &&
      state.menuActiveAnchor.subcategoryId === nextSubcategoryId;

    if (isSameAnchor && !options.force) {
      return;
    }

    state.menuActiveAnchor = {
      categoryId: nextCategoryId,
      subcategoryId: nextSubcategoryId
    };
    if (nextCategoryId) {
      setNavigationCurrentSection(
        "menu:" + nextCategoryId + (nextSubcategoryId ? ("/" + nextSubcategoryId) : "")
      );
    }

    if (!options.skipClassUpdate) {
      updateSidebarMenuAccordionActiveClasses();
    }
  }

  function getDocumentScrollMetrics() {
    var scrollElement = document.scrollingElement || document.documentElement || document.body;
    var scrollTop = window.pageYOffset || window.scrollY || 0;
    var scrollHeight = scrollElement ? scrollElement.scrollHeight : 0;
    var viewportHeight = window.innerHeight || (document.documentElement ? document.documentElement.clientHeight : 0) || 0;
    var maxScrollTop = Math.max(0, scrollHeight - viewportHeight);
    return {
      scrollTop: scrollTop,
      maxScrollTop: maxScrollTop,
      viewportHeight: viewportHeight,
      scrollHeight: scrollHeight
    };
  }

  function isViewportNearDocumentBottom(tolerancePx) {
    var tolerance = Math.max(0, Number(tolerancePx || 0));
    var metrics = getDocumentScrollMetrics();
    if (metrics.maxScrollTop <= 0) return false;
    return metrics.scrollTop >= metrics.maxScrollTop - tolerance;
  }

  function getProgrammaticScrollLockDuration(targetTop, behavior) {
    var baseLockMs = Math.max(0, Number(UX_TIMING.programmaticScrollLockMs || 0));
    if (behavior === "auto") return baseLockMs;

    var currentTop = window.pageYOffset || window.scrollY || 0;
    var distancePx = Math.abs(Number(targetTop || 0) - currentTop);
    var estimatedMs = Math.round(220 + distancePx * 0.28);
    var clampedMs = Math.min(1600, Math.max(baseLockMs, estimatedMs));
    return clampedMs;
  }

  function findActiveAnchorTarget(anchorTargets, threshold) {
    if (!Array.isArray(anchorTargets) || !anchorTargets.length) return null;
    var fallbackTarget = null;
    var lastConnectedTarget = null;
    var thresholdMatchTarget = null;
    anchorTargets.forEach(function (target) {
      if (!target.element || !target.element.isConnected) return;
      if (!fallbackTarget) {
        fallbackTarget = target;
      }
      lastConnectedTarget = target;
      if (target.element.getBoundingClientRect().top - threshold <= 0) {
        thresholdMatchTarget = target;
      }
    });

    if (!lastConnectedTarget) {
      return fallbackTarget;
    }

    if (isViewportNearDocumentBottom(2)) {
      return lastConnectedTarget;
    }

    return thresholdMatchTarget || fallbackTarget;
  }

  function refreshMenuScrollAnchors() {
    state.menuAnchorTargets = Array.prototype.slice
      .call(elements.menuBrowserGroups.querySelectorAll("[data-menu-anchor='true']"))
      .map(function (element) {
        return {
          categoryId: element.getAttribute("data-anchor-category") || "",
          subcategoryId: element.getAttribute("data-anchor-subcategory") || "",
          element: element
        };
      });
  }

  function updateMenuScrollSpy(force) {
    if (state.currentPanel !== "menu-browser") return;
    if (state.visiblePanel !== "menu-browser") return;
    if (!canRunScrollSpy(Boolean(force))) return;
    if (isSidebarAccordionOpening("menu")) return;
    if (!state.menuAnchorTargets.length) return;

    var activeTarget = findActiveAnchorTarget(
      state.menuAnchorTargets,
      UX_TIMING.scrollSpyThresholdPx
    );
    if (!activeTarget) return;

    setActiveMenuAnchor(activeTarget.categoryId, activeTarget.subcategoryId, {
      force: Boolean(force)
    });
  }

  function requestMenuScrollSpyUpdate() {
    if (state.currentPanel !== "menu-browser") return;
    if (state.visiblePanel !== "menu-browser") return;
    if (state.isPanelTransitioning) return;
    if (!isNavigationStateIdle()) return;
    if (isSidebarAccordionOpening("menu")) return;
    if (state.menuScrollSpyFrame) return;

    state.menuScrollSpyFrame = window.requestAnimationFrame(function () {
      state.menuScrollSpyFrame = 0;
      updateMenuScrollSpy(false);
    });
  }

  function renderSidebarMenuAccordion() {
    if (!state.hasDataLoaded) {
      elements.sidebarMenuAccordion.innerHTML = "";
      return;
    }

    var groups = state.menuViewGroups.length ? state.menuViewGroups : buildMenuGroups();
    var activeCategoryId = state.menuActiveAnchor.categoryId;

    var html = groups.map(function (group, groupIndex) {
      var categoryIsActive = activeCategoryId === group.id;
      var categoryButtonClass = "sidebar-accordion-category__toggle" + (categoryIsActive ? " is-active" : "");

      return (
        "<div class=\"sidebar-accordion-category\" style=\"--sidebar-stagger-index:" + groupIndex + "\" data-category-id=\"" + escapeHtml(group.id) + "\">" +
        "<button class=\"" + categoryButtonClass + "\" type=\"button\" data-scroll-category=\"" +
        escapeHtml(group.id) + "\" data-scroll-subcategory=\"\">" +
        "<span>" + escapeHtml(group.label || group.id) + "</span>" +
        "</button>" +
        "</div>"
      );
    }).join("");

    elements.sidebarMenuAccordion.innerHTML = html;
    updateSidebarMenuAccordionActiveClasses();
    syncSidebarAccordionCategoryHeights(elements.sidebarMenuAccordion);
  }

  function getItemBadges(item) {
    var badges = [];

    if (item.featured) {
      badges.push({
        key: "featured",
        label: "Featured",
        className: "menu-badge menu-badge--featured"
      });
    }

    if (item.vegan) {
      badges.push({ key: "vegan", label: "Vegan", className: "menu-badge" });
    } else if (item.vegetarian) {
      badges.push({ key: "vegetarian", label: "Vegetarian", className: "menu-badge" });
    }

    if (Number(item.spicy_level) > 0 || item.spicy === true || (item.tags || []).includes("spicy")) {
      badges.push({ key: "spicy", label: "Spicy", className: "menu-badge" });
    }

    return badges;
  }

  function getItemCardDescription(item) {
    var source = (item.descriptionShort || item.descriptionLong || "").replace(/\s+/g, " ").trim();
    if (!source) {
      return "Sin descripcion por ahora.";
    }

    if (source.length <= 104) {
      return source;
    }

    return source.slice(0, 101).trim() + "...";
  }

  function getMediaEntryForItem(itemId) {
    ensureMediaStore();
    var mediaItems = (state.data && state.data.media && state.data.media.items) || {};
    return mediaItems[itemId] || null;
  }

  function resolveCardImageForItem(item) {
    var mediaEntry = getMediaEntryForItem(item.id);
    var path = item.image || (mediaEntry && mediaEntry.card) || MENU_PLACEHOLDER_IMAGE;
    path = resolveMenuMediaPath(path, true) || MENU_PLACEHOLDER_IMAGE;
    return resolveAssetPath(path);
  }

  function renderMenuBrowser() {
    if (!state.hasDataLoaded) {
      elements.menuBrowserGroups.innerHTML = "<p class=\"menu-empty\">Cargando menu...</p>";
      return;
    }

    var groups = buildMenuGroups();
    state.menuViewGroups = groups;

    if (!groups.length) {
      elements.menuBrowserGroups.innerHTML =
        "<p class=\"menu-empty\">No hay items para mostrar en el menu.</p>";
      state.menuAnchorTargets = [];
      return;
    }

    var html = groups.map(function (group) {
      var hasRealSubcategories = group.subgroups.some(function (subgroup) {
        return Boolean(subgroup.id);
      });

      var subgroupsHtml = group.subgroups.map(function (subgroup) {
        var cardsHtml = subgroup.items.map(function (entry) {
          var item = entry.item;
          var description = getItemCardDescription(item);

          return (
            "<button class=\"menu-item-card\" type=\"button\" data-item-id=\"" +
            escapeHtml(item.id) + "\">" +
            "<div class=\"menu-item-card__media\">" +
            "<img class=\"menu-item-card__image\" src=\"" + escapeHtml(resolveCardImageForItem(item)) + "\" alt=\"" +
            escapeHtml(item.name || item.id) +
            "\" loading=\"lazy\" onerror=\"this.onerror=null;this.src='/" + escapeHtml(MENU_PLACEHOLDER_IMAGE) + "';\" />" +
            "</div>" +
            "<div class=\"menu-item-card__content\">" +
            "<h4>" + escapeHtml(item.name || item.id) + "</h4>" +
            "<p class=\"menu-item-card__description\">" + escapeHtml(description) + "</p>" +
            "</div>" +
            "</button>"
          );
        }).join("");

        if (!hasRealSubcategories && !subgroup.id) {
          return "<div class=\"menu-card-grid\">" + cardsHtml + "</div>";
        }

        var subgroupAnchor = "";
        if (subgroup.id) {
          subgroupAnchor =
            " data-menu-anchor=\"true\" data-anchor-category=\"" + escapeHtml(group.id) +
            "\" data-anchor-subcategory=\"" + escapeHtml(subgroup.id) + "\"";
        }

        return (
          "<div class=\"menu-subgroup\" id=\"" + getSubgroupAnchorId(group.id, subgroup.id || "general") + "\"" + subgroupAnchor + ">" +
          "<h3 class=\"menu-subcategory-title\">" + escapeHtml(subgroup.label) + "</h3>" +
          "<div class=\"menu-card-grid\">" + cardsHtml + "</div>" +
          "</div>"
        );
      }).join("");

      return (
        "<section class=\"menu-category\" id=\"" + getGroupAnchorId(group.id) +
        "\" data-menu-anchor=\"true\" data-anchor-category=\"" + escapeHtml(group.id) + "\" data-anchor-subcategory=\"\">" +
        "<h2 class=\"menu-category-title\">" + escapeHtml(group.label) + "</h2>" +
        subgroupsHtml +
        "</section>"
      );
    }).join("");

    elements.menuBrowserGroups.innerHTML = html;
    refreshMenuScrollAnchors();
    updateMenuScrollSpy(true);
  }

  function getAvailabilityEntry(itemId, ensure) {
    ensureAvailabilityDraft();

    var entry = state.drafts.availability.items.find(function (availabilityItem) {
      return availabilityItem.itemId === itemId;
    });

    if (!entry && ensure) {
      entry = {
        itemId: itemId,
        available: true,
        soldOutReason: ""
      };
      state.drafts.availability.items.push(entry);
    }

    return entry || null;
  }

  function getSectionForCategory(categoryId) {
    var sections = getMenuSections();

    var direct = sections.find(function (section) {
      return section.id === categoryId;
    });
    if (direct) return direct;

    var category = getCategoryById(categoryId);
    if (category && Array.isArray(category.legacyIds)) {
      var legacyMatch = sections.find(function (section) {
        return category.legacyIds.includes(section.id);
      });
      if (legacyMatch) return legacyMatch;
    }

    return sections[0] || null;
  }

  function generateUniqueItemId(prefix) {
    var normalized = (prefix || "nuevo_item")
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");

    if (!normalized) normalized = "nuevo_item";

    var existing = new Set(getAllMenuItems().map(function (entry) {
      return entry.item.id;
    }));

    var candidate = normalized;
    var i = 1;
    while (existing.has(candidate)) {
      candidate = normalized + "_" + i;
      i += 1;
    }

    return candidate;
  }

  function createDefaultNewItem() {
    var defaultGroupCategory =
      state.menuViewGroups[0] &&
      state.menuViewGroups[0].sourceCategoryIds &&
      state.menuViewGroups[0].sourceCategoryIds[0];

    var categoryId = defaultGroupCategory ||
      (state.indexes.categoryList[0] && state.indexes.categoryList[0].id) ||
      (getMenuSections()[0] && getMenuSections()[0].id) ||
      "";

    var category = getCategoryById(categoryId);
    var subcategoryId = "";
    if (category && category.subcategories && category.subcategories.length) {
      subcategoryId = category.subcategories[0].id;
    }

    var itemId = generateUniqueItemId("nuevo_item");

    return {
      id: itemId,
      name: "Nuevo item",
      slug: itemId.replace(/_/g, "-"),
      category: categoryId,
      subcategory: subcategoryId,
      descriptionShort: "",
      descriptionLong: "",
      price: 0,
      ingredients: [],
      tags: [],
      allergens: [],
      image: MENU_PLACEHOLDER_IMAGE,
      featured: false,
      spicy_level: 0,
      vegetarian: false,
      vegan: false
    };
  }

  function populateCategorySelect(selectedCategoryId) {
    var optionsHtml = state.indexes.categoryList.map(function (category) {
      return (
        "<option value=\"" + escapeHtml(category.id) + "\">" +
        escapeHtml(category.label || category.id) +
        "</option>"
      );
    }).join("");

    elements.itemFieldCategory.innerHTML = optionsHtml;

    var fallbackCategoryId =
      selectedCategoryId ||
      (state.indexes.categoryList[0] && state.indexes.categoryList[0].id) ||
      "";

    elements.itemFieldCategory.value = fallbackCategoryId;
  }

  function populateSubcategorySelect(categoryId, selectedSubcategoryId) {
    var category = getCategoryById(categoryId);
    var options = [
      '<option value="">(sin subcategoria)</option>'
    ];

    (category && category.subcategories ? category.subcategories : []).forEach(function (subcategory) {
      options.push(
        "<option value=\"" + escapeHtml(subcategory.id) + "\">" +
        escapeHtml(subcategory.label || subcategory.id) +
        "</option>"
      );
    });

    elements.itemFieldSubcategory.innerHTML = options.join("");
    elements.itemFieldSubcategory.value = selectedSubcategoryId || "";
  }

  function populateMediaPicker(selectedPath) {
    var normalizedSelected = resolveMenuMediaPath(selectedPath, true);
    if (!normalizedSelected && selectedPath) {
      normalizedSelected = toRelativeAssetPath(selectedPath);
    }
    var mediaPathOptions = state.indexes.mediaPaths.slice();
    if (normalizedSelected && !mediaPathOptions.includes(normalizedSelected)) {
      mediaPathOptions.push(normalizedSelected);
      mediaPathOptions.sort(function (a, b) {
        return normalizeText(a).localeCompare(normalizeText(b));
      });
    }

    var options = ['<option value="">(sin seleccion)</option>'];
    mediaPathOptions.forEach(function (path) {
      options.push("<option value=\"" + escapeHtml(path) + "\">" + escapeHtml(path) + "</option>");
    });
    elements.itemMediaPicker.innerHTML = options.join("");
    elements.itemMediaPicker.value = normalizedSelected;
  }

  function setActiveItemTab(tabId) {
    state.itemEditor.activeTab = tabId;

    elements.itemTabs.forEach(function (tabButton) {
      var buttonTab = tabButton.getAttribute("data-tab");
      tabButton.classList.toggle("is-active", buttonTab === tabId);
    });

    elements.itemTabPanels.forEach(function (panel) {
      var panelTab = panel.getAttribute("data-tab-panel");
      panel.classList.toggle("is-active", panelTab === tabId);
    });
  }

  function renderIngredientChips() {
    var ingredientsSource = state.drafts.ingredients || ((state.data && state.data.ingredients) || {});
    var html = state.itemEditor.ingredients.map(function (ingredientId, index) {
      var ingredient = state.indexes.ingredientsById[ingredientId] || {};
      var label = ingredient.label || ingredientId;
      var iconPath = resolveIngredientIconPath(ingredient, ingredientsSource);
      if (iconPath) iconPath = resolveAssetPath(iconPath);

      return (
        "<li class=\"chip chip--draggable\" draggable=\"true\" data-chip-index=\"" + index + "\">" +
        (iconPath ? "<img src=\"" + escapeHtml(iconPath) + "\" alt=\"\" />" : "") +
        "<span>" + escapeHtml(label) + "</span>" +
        "<button type=\"button\" data-remove-ingredient=\"" + escapeHtml(ingredientId) + "\">x</button>" +
        "</li>"
      );
    }).join("");

    elements.ingredientChipList.innerHTML = html;
  }

  function renderTagChips() {
    var html = state.itemEditor.tags.map(function (tagId) {
      var label = (state.indexes.tagsById[tagId] && state.indexes.tagsById[tagId].label) || tagId;
      return (
        "<li class=\"chip\">" +
        "<span>" + escapeHtml(label) + "</span>" +
        "<button type=\"button\" data-remove-tag=\"" + escapeHtml(tagId) + "\">x</button>" +
        "</li>"
      );
    }).join("");

    elements.tagChipList.innerHTML = html;
  }

  function renderAllergenChips() {
    var html = state.itemEditor.allergens.map(function (allergenId) {
      var label = (state.indexes.allergensById[allergenId] && state.indexes.allergensById[allergenId].label) || allergenId;
      return (
        "<li class=\"chip\">" +
        "<span>" + escapeHtml(label) + "</span>" +
        "<button type=\"button\" data-remove-allergen=\"" + escapeHtml(allergenId) + "\">x</button>" +
        "</li>"
      );
    }).join("");

    elements.allergenChipList.innerHTML = html;
  }

  function renderTokenSearchResults(type, query) {
    var normalizedQuery = normalizeText(query);
    var html = "";

    if (!normalizedQuery) {
      if (type === "ingredients") elements.ingredientSearchResults.innerHTML = "";
      if (type === "tags") elements.tagSearchResults.innerHTML = "";
      if (type === "allergens") elements.allergenSearchResults.innerHTML = "";
      return;
    }

    if (type === "ingredients") {
      var ingredientResults = state.indexes.ingredientList.filter(function (entry) {
        if (state.itemEditor.ingredients.includes(entry.id)) return false;
        var haystack = normalizeText(entry.id + " " + entry.label);
        return haystack.includes(normalizedQuery);
      }).slice(0, 8);

      html = ingredientResults.map(function (entry) {
        var iconHtml = entry.icon
          ? "<img src=\"" + escapeHtml(resolveAssetPath(entry.icon)) + "\" alt=\"\" />"
          : "";
        return (
          "<button class=\"token-search-result\" type=\"button\" data-add-ingredient=\"" + escapeHtml(entry.id) + "\">" +
          iconHtml +
          "<span>" + escapeHtml(entry.label) + "</span>" +
          "</button>"
        );
      }).join("");

      elements.ingredientSearchResults.innerHTML = html;
      return;
    }

    if (type === "tags") {
      var tagResults = state.indexes.tagList.filter(function (tagId) {
        if (state.itemEditor.tags.includes(tagId)) return false;
        var label = (state.indexes.tagsById[tagId] && state.indexes.tagsById[tagId].label) || tagId;
        return normalizeText(tagId + " " + label).includes(normalizedQuery);
      }).slice(0, 8);

      html = tagResults.map(function (tagId) {
        var label = (state.indexes.tagsById[tagId] && state.indexes.tagsById[tagId].label) || tagId;
        return (
          "<button class=\"token-search-result\" type=\"button\" data-add-tag=\"" + escapeHtml(tagId) + "\">" +
          escapeHtml(label) +
          "</button>"
        );
      }).join("");

      elements.tagSearchResults.innerHTML = html;
      return;
    }

    if (type === "allergens") {
      var allergenResults = state.indexes.allergenList.filter(function (allergenId) {
        if (state.itemEditor.allergens.includes(allergenId)) return false;
        var label = (state.indexes.allergensById[allergenId] && state.indexes.allergensById[allergenId].label) || allergenId;
        return normalizeText(allergenId + " " + label).includes(normalizedQuery);
      }).slice(0, 8);

      html = allergenResults.map(function (allergenId) {
        var label = (state.indexes.allergensById[allergenId] && state.indexes.allergensById[allergenId].label) || allergenId;
        return (
          "<button class=\"token-search-result\" type=\"button\" data-add-allergen=\"" + escapeHtml(allergenId) + "\">" +
          escapeHtml(label) +
          "</button>"
        );
      }).join("");

      elements.allergenSearchResults.innerHTML = html;
    }
  }

  function renderItemPreview() {
    var draft = state.itemEditor.draft;
    if (!draft) return;

    var normalizedImagePath = resolveMenuMediaPath(draft.image, true) || MENU_PLACEHOLDER_IMAGE;

    setImageElementSourceWithFallback(elements.previewCardImage, normalizedImagePath, MENU_PLACEHOLDER_IMAGE);
    elements.previewCardImage.alt = draft.name || draft.id;
    elements.previewCardName.textContent = draft.name || draft.id || "-";
    elements.previewCardShort.textContent = draft.descriptionShort || "Sin descripcion corta";

    var badges = getItemBadges(draft);
    elements.previewCardBadges.innerHTML = badges.map(function (badge) {
      return "<span class=\"" + badge.className + "\">" + escapeHtml(badge.label) + "</span>";
    }).join("");

    setImageElementSourceWithFallback(elements.previewModalImage, normalizedImagePath, MENU_PLACEHOLDER_IMAGE);
    elements.previewModalImage.alt = draft.name || draft.id;
    elements.previewModalName.textContent = draft.name || draft.id || "-";
    elements.previewModalLong.textContent =
      draft.descriptionLong || draft.descriptionShort || "Sin descripcion larga";

    var currency = (state.drafts.menu && state.drafts.menu.currency) || "DOP";
    var price = Number(draft.price) || 0;
    elements.previewModalPrice.textContent = currency + " " + price.toFixed(0);

    elements.itemPricePreview.textContent = currency + " " + price.toFixed(0);
    elements.itemSpicyLevelValue.textContent = String(Number(draft.spicy_level) || 0);

    setImageElementSourceWithFallback(elements.itemMediaPreview, normalizedImagePath, MENU_PLACEHOLDER_IMAGE);

    if (elements.itemMediaStatus) {
      var statusPath = toRelativeAssetPath(normalizedImagePath);
      var knownSet = state.indexes.menuMediaPathSet || {};
      var isMissing =
        statusPath &&
        !isSvgPlaceholderPath(statusPath) &&
        !/^https?:\/\//i.test(statusPath) &&
        !knownSet[statusPath];

      elements.itemMediaStatus.textContent = isMissing
        ? "Missing file: " + statusPath + " (fallback placeholder)"
        : "Ruta valida: " + statusPath;
      elements.itemMediaStatus.classList.toggle("media-status--missing", Boolean(isMissing));
      elements.itemMediaStatus.classList.toggle("media-status--ok", !isMissing);
    }
  }

  function syncDraftFromForm() {
    var draft = state.itemEditor.draft;
    if (!draft) return;

    draft.name = elements.itemFieldName.value.trim();
    draft.slug = elements.itemFieldSlug.value.trim();
    draft.category = elements.itemFieldCategory.value;
    draft.subcategory = elements.itemFieldSubcategory.value;
    draft.price = Math.max(0, Math.round(Number(elements.itemFieldPrice.value || 0)));
    draft.featured = getToggleChecked(elements.itemFieldFeatured);
    draft.descriptionShort = elements.itemFieldDescriptionShort.value.trim();
    draft.descriptionLong = elements.itemFieldDescriptionLong.value.trim();
    draft.ingredients = state.itemEditor.ingredients.slice();
    draft.tags = state.itemEditor.tags.slice();
    draft.allergens = state.itemEditor.allergens.slice();
    var normalizedImagePath = resolveMenuMediaPath(elements.itemFieldImage.value, true) || MENU_PLACEHOLDER_IMAGE;
    draft.image = normalizedImagePath;
    if (document.activeElement !== elements.itemFieldImage) {
      elements.itemFieldImage.value = normalizedImagePath;
    }
    draft.spicy_level = Number(elements.itemFieldSpicyLevel.value || 0);
    draft.vegetarian = getToggleChecked(elements.itemFieldVegetarian);
    draft.vegan = getToggleChecked(elements.itemFieldVegan);

    var spicyLegacy = elements.itemFieldSpicyLegacy.value;
    if (!spicyLegacy) {
      delete draft.spicy;
    } else {
      draft.spicy = spicyLegacy === "true";
    }

    var reviewsValue = elements.itemFieldReviews.value.trim();
    if (!reviewsValue) {
      delete draft.reviews;
    } else {
      draft.reviews = reviewsValue;
    }

    state.itemEditor.availability.available = getToggleChecked(elements.itemAvailabilityToggle);
    state.itemEditor.availability.soldOutReason = elements.itemAvailabilityReason.value.trim();

    renderItemPreview();
  }

  function openItemEditor(itemId, options) {
    options = options || {};
    if (!options.skipRoute) {
      navigateToRoute("/menu/item/" + encodeURIComponent(itemId));
      return;
    }

    if (!state.hasDataLoaded) {
      ensureDataLoaded(false);
      return;
    }

    var itemPosition = findItemPositionById(itemId);
    if (!itemPosition) {
      setMenuBrowserStatus("No se encontro el item: " + itemId);
      openMenuBrowser({ skipRoute: true });
      navigateToRoute("/menu", { replace: true });
      return;
    }

    var draft = deepClone(itemPosition.item);
    draft.image = resolveMenuMediaPath(draft.image, true) || MENU_PLACEHOLDER_IMAGE;
    var availabilityEntry = getAvailabilityEntry(draft.id, false);
    var fallbackAvailable =
      typeof draft.available === "boolean"
        ? Boolean(draft.available)
        : true;

    state.itemEditor.isOpen = true;
    state.itemEditor.isNew = Boolean(options.isNew);
    state.itemEditor.sourceSectionId = itemPosition.sectionId;
    state.itemEditor.sourceItemIndex = itemPosition.itemIndex;
    state.itemEditor.draft = draft;
    state.itemEditor.ingredients = Array.isArray(draft.ingredients) ? draft.ingredients.slice() : [];
    state.itemEditor.tags = Array.isArray(draft.tags) ? draft.tags.slice() : [];
    state.itemEditor.allergens = Array.isArray(draft.allergens) ? draft.allergens.slice() : [];
    state.itemEditor.availability = {
      available: availabilityEntry ? Boolean(availabilityEntry.available) : fallbackAvailable,
      soldOutReason: availabilityEntry ? (availabilityEntry.soldOutReason || "") : ""
    };

    elements.itemEditorTitle.textContent =
      (state.itemEditor.isNew ? "Nuevo item" : "Editar item") + ": " + (draft.name || draft.id);

    populateCategorySelect(draft.category);
    populateSubcategorySelect(draft.category, draft.subcategory);
    populateMediaPicker(draft.image);

    elements.itemFieldId.value = draft.id || "";
    elements.itemFieldName.value = draft.name || "";
    elements.itemFieldSlug.value = draft.slug || "";
    elements.itemFieldPrice.value = Number(draft.price || 0);
    setToggleChecked(elements.itemFieldFeatured, Boolean(draft.featured));

    elements.itemFieldDescriptionShort.value = draft.descriptionShort || "";
    elements.itemFieldDescriptionLong.value = draft.descriptionLong || "";

    elements.itemFieldImage.value = draft.image || "";

    setToggleChecked(elements.itemAvailabilityToggle, state.itemEditor.availability.available);
    elements.itemAvailabilityReason.value = state.itemEditor.availability.soldOutReason;

    elements.itemFieldSpicyLevel.value = Number(draft.spicy_level || 0);
    setToggleChecked(elements.itemFieldVegetarian, Boolean(draft.vegetarian));
    setToggleChecked(elements.itemFieldVegan, Boolean(draft.vegan));
    elements.itemFieldSpicyLegacy.value = typeof draft.spicy === "boolean" ? String(draft.spicy) : "";
    elements.itemFieldReviews.value = draft.reviews || "";

    setActiveItemTab("basic");
    renderIngredientChips();
    renderTagChips();
    renderAllergenChips();

    elements.ingredientSearchInput.value = "";
    elements.ingredientSearchResults.innerHTML = "";
    elements.tagSearchInput.value = "";
    elements.tagSearchResults.innerHTML = "";
    elements.allergenSearchInput.value = "";
    elements.allergenSearchResults.innerHTML = "";

    setItemEditorStatus("");
    showItemEditorErrors([]);
    renderItemPreview();

    elements.itemDeleteButton.disabled = false;

    setActivePanel("menu-item");
  }

  function openNewItemEditor(options) {
    options = options || {};
    if (!options.skipRoute) {
      navigateToRoute("/menu/item/new");
      return;
    }
    if (!state.hasDataLoaded) {
      ensureDataLoaded(false);
      return;
    }

    var draft = createDefaultNewItem();

    state.itemEditor.isOpen = true;
    state.itemEditor.isNew = true;
    state.itemEditor.sourceSectionId = (getSectionForCategory(draft.category) || {}).id || "";
    state.itemEditor.sourceItemIndex = -1;
    state.itemEditor.draft = draft;
    state.itemEditor.ingredients = [];
    state.itemEditor.tags = [];
    state.itemEditor.allergens = [];
    state.itemEditor.availability = {
      available: true,
      soldOutReason: ""
    };

    elements.itemEditorTitle.textContent = "Nuevo item: " + draft.id;

    populateCategorySelect(draft.category);
    populateSubcategorySelect(draft.category, draft.subcategory);
    populateMediaPicker(draft.image);

    elements.itemFieldId.value = draft.id;
    elements.itemFieldName.value = draft.name;
    elements.itemFieldSlug.value = draft.slug;
    elements.itemFieldPrice.value = "0";
    setToggleChecked(elements.itemFieldFeatured, false);

    elements.itemFieldDescriptionShort.value = "";
    elements.itemFieldDescriptionLong.value = "";
    elements.itemFieldImage.value = draft.image;

    setToggleChecked(elements.itemAvailabilityToggle, true);
    elements.itemAvailabilityReason.value = "";

    elements.itemFieldSpicyLevel.value = "0";
    setToggleChecked(elements.itemFieldVegetarian, false);
    setToggleChecked(elements.itemFieldVegan, false);
    elements.itemFieldSpicyLegacy.value = "";
    elements.itemFieldReviews.value = "";

    setActiveItemTab("basic");
    renderIngredientChips();
    renderTagChips();
    renderAllergenChips();

    elements.ingredientSearchInput.value = "";
    elements.ingredientSearchResults.innerHTML = "";
    elements.tagSearchInput.value = "";
    elements.tagSearchResults.innerHTML = "";
    elements.allergenSearchInput.value = "";
    elements.allergenSearchResults.innerHTML = "";

    setItemEditorStatus("Completa los campos y guarda para crear el item.");
    showItemEditorErrors([]);
    renderItemPreview();

    elements.itemDeleteButton.disabled = true;

    setActivePanel("menu-item");
  }

  function addIngredient(ingredientId) {
    if (!ingredientId || state.itemEditor.ingredients.includes(ingredientId)) return;
    state.itemEditor.ingredients.push(ingredientId);
    renderIngredientChips();
    renderTokenSearchResults("ingredients", elements.ingredientSearchInput.value);
    syncDraftFromForm();
  }

  function removeIngredient(ingredientId) {
    state.itemEditor.ingredients = state.itemEditor.ingredients.filter(function (id) {
      return id !== ingredientId;
    });
    renderIngredientChips();
    syncDraftFromForm();
  }

  function addTag(tagId) {
    if (!tagId || state.itemEditor.tags.includes(tagId)) return;
    state.itemEditor.tags.push(tagId);
    renderTagChips();
    renderTokenSearchResults("tags", elements.tagSearchInput.value);
    syncDraftFromForm();
  }

  function removeTag(tagId) {
    state.itemEditor.tags = state.itemEditor.tags.filter(function (id) {
      return id !== tagId;
    });
    renderTagChips();
    syncDraftFromForm();
  }

  function addAllergen(allergenId) {
    if (!allergenId || state.itemEditor.allergens.includes(allergenId)) return;
    state.itemEditor.allergens.push(allergenId);
    renderAllergenChips();
    renderTokenSearchResults("allergens", elements.allergenSearchInput.value);
    syncDraftFromForm();
  }

  function removeAllergen(allergenId) {
    state.itemEditor.allergens = state.itemEditor.allergens.filter(function (id) {
      return id !== allergenId;
    });
    renderAllergenChips();
    syncDraftFromForm();
  }

  function autoDetectTagsAndAllergensFromIngredients() {
    var detectedTags = new Set(state.itemEditor.tags);
    var detectedAllergens = new Set(state.itemEditor.allergens);

    state.itemEditor.ingredients.forEach(function (ingredientId) {
      var ingredient = state.indexes.ingredientsById[ingredientId];
      if (!ingredient) return;

      (ingredient.tags || []).forEach(function (tagId) {
        if (state.indexes.tagsById[tagId]) detectedTags.add(tagId);
      });

      (ingredient.allergens || []).forEach(function (allergenId) {
        if (state.indexes.allergensById[allergenId]) detectedAllergens.add(allergenId);
      });
    });

    state.itemEditor.tags = Array.from(detectedTags).sort();
    state.itemEditor.allergens = Array.from(detectedAllergens).sort();

    renderTagChips();
    renderAllergenChips();
    syncDraftFromForm();
    setItemEditorStatus("Tags y alergenos sugeridos aplicados.");
  }

  function validateCurrentItemDraft() {
    var errors = [];
    var draft = state.itemEditor.draft;

    if (!draft) {
      errors.push("No hay item activo para guardar.");
      return errors;
    }

    if (!draft.id || !draft.id.trim()) {
      errors.push("ID no puede estar vacio.");
    }

    if (!draft.slug || !draft.slug.trim()) {
      errors.push("Slug no puede estar vacio.");
    }

    var category = getCategoryById(draft.category);
    if (!category) {
      errors.push("Categoria invalida: " + draft.category);
    }

    if (draft.subcategory) {
      var subcategoryValid = Boolean(
        category && (category.subcategories || []).some(function (subcategory) {
          return subcategory.id === draft.subcategory;
        })
      );

      if (!subcategoryValid) {
        errors.push("Subcategoria invalida para la categoria seleccionada.");
      }
    }

    state.itemEditor.ingredients.forEach(function (ingredientId) {
      if (!state.indexes.ingredientsById[ingredientId]) {
        errors.push("Ingrediente invalido: " + ingredientId);
      }
    });

    state.itemEditor.tags.forEach(function (tagId) {
      if (!state.indexes.tagsById[tagId]) {
        errors.push("Tag invalido: " + tagId);
      }
    });

    state.itemEditor.allergens.forEach(function (allergenId) {
      if (!state.indexes.allergensById[allergenId]) {
        errors.push("Alergeno invalido: " + allergenId);
      }
    });

    return errors;
  }

  function removeAvailabilityEntry(itemId) {
    ensureAvailabilityDraft();
    state.drafts.availability.items = state.drafts.availability.items.filter(function (entry) {
      return entry.itemId !== itemId;
    });
  }

  function commitCurrentItemChanges(closeAfterSave) {
    syncDraftFromForm();

    var errors = validateCurrentItemDraft();
    if (errors.length) {
      showItemEditorErrors(errors);
      setItemEditorStatus("Corrige los errores antes de guardar.");
      return;
    }

    var draft = deepClone(state.itemEditor.draft);
    delete draft.available;
    var sourcePosition = findItemPositionById(draft.id);
    var targetSection = getSectionForCategory(draft.category);

    if (!targetSection) {
      showItemEditorErrors(["No se encontro una seccion de menu valida para la categoria seleccionada."]);
      setItemEditorStatus("No se pudo guardar.");
      return;
    }

    var persistedPosition = null;

    if (state.itemEditor.isNew) {
      if (!Array.isArray(targetSection.items)) {
        targetSection.items = [];
      }
      targetSection.items.push(draft);
      persistedPosition = findItemPositionById(draft.id);
      state.itemEditor.isNew = false;
    } else {
      if (!sourcePosition) {
        showItemEditorErrors(["No se encontro el item original para actualizar."]);
        setItemEditorStatus("No se pudo guardar.");
        return;
      }

      var shouldMoveSection = sourcePosition.sectionId !== targetSection.id;

      if (shouldMoveSection) {
        sourcePosition.section.items.splice(sourcePosition.itemIndex, 1);
        if (!Array.isArray(targetSection.items)) {
          targetSection.items = [];
        }
        targetSection.items.push(draft);
      } else {
        sourcePosition.section.items[sourcePosition.itemIndex] = draft;
      }

      persistedPosition = findItemPositionById(draft.id);
    }

    var availabilityEntry = getAvailabilityEntry(draft.id, true);
    availabilityEntry.available = Boolean(state.itemEditor.availability.available);
    availabilityEntry.soldOutReason = state.itemEditor.availability.soldOutReason || "";
    syncHomeFeaturedSelection(draft.id, Boolean(draft.featured));
    syncMediaEntryForItem(draft);

    state.itemEditor.sourceSectionId = persistedPosition ? persistedPosition.sectionId : targetSection.id;
    state.itemEditor.sourceItemIndex = persistedPosition ? persistedPosition.itemIndex : -1;
    state.itemEditor.draft = deepClone(draft);

    buildIndexes();
    updateDashboardMetrics();
    renderMenuBrowser();
    renderSidebarMenuAccordion();
    renderSidebarHomepageAccordion();
    persistDraftsToLocalStorage();
    setDraftsBanner(true, "Drafts locales activos (Clear drafts | Export)");
    saveDraftsToLocalFiles();

    showItemEditorErrors([]);

    if (closeAfterSave) {
      var targetCategoryId = mapCategoryToMenuGroup(draft.category);
      clearPanelPostNavigationActions();
      queuePanelPostNavigationAction("menu-browser", function () {
        scrollToMenuAnchor(targetCategoryId, "");
        setActiveMenuAnchor(targetCategoryId, "", { force: true });
      });
      openMenuBrowser({ skipRoute: false });
      setMenuBrowserStatus("Item guardado: " + draft.name + " (" + draft.id + ")");
      return;
    }

    setItemEditorStatus("Item guardado correctamente.");
    openItemEditor(draft.id, { skipRoute: true, isNew: false });
    var itemHash = "#/menu/item/" + encodeURIComponent(draft.id);
    if (window.location.hash !== itemHash) {
      var baseUrl = window.location.pathname + window.location.search;
      window.history.replaceState({}, document.title, baseUrl + itemHash);
    }
  }

  function deleteCurrentItem() {
    if (!state.itemEditor.draft) {
      setItemEditorStatus("No hay item para eliminar.");
      return;
    }

    if (state.itemEditor.isNew) {
      openMenuBrowser({ skipRoute: false });
      setMenuBrowserStatus("Nuevo item descartado.");
      return;
    }

    var draft = state.itemEditor.draft;
    var position = findItemPositionById(draft.id);

    if (!position) {
      setItemEditorStatus("No se encontro el item en menu.json.");
      return;
    }

    var confirmed = window.confirm("Eliminar item '" + (draft.name || draft.id) + "'?");
    if (!confirmed) return;

    position.section.items.splice(position.itemIndex, 1);
    removeAvailabilityEntry(draft.id);
    syncHomeFeaturedSelection(draft.id, false);
    removeMediaEntryForItem(draft.id);

    buildIndexes();
    updateDashboardMetrics();
    renderMenuBrowser();
    renderSidebarMenuAccordion();
    renderSidebarHomepageAccordion();
    persistDraftsToLocalStorage();
    setDraftsBanner(true, "Drafts locales activos (Clear drafts | Export)");
    saveDraftsToLocalFiles();

    openMenuBrowser({ skipRoute: false });
    setMenuBrowserStatus("Item eliminado: " + draft.id);
  }

  function cancelItemEditor() {
    openMenuBrowser({ skipRoute: false });
    setMenuBrowserStatus("Edicion cancelada.");
  }

  // --- Dashboard (from modules/dashboard.js) ---
  var DB = window.FigataAdmin.dashboard;
  function _dbCtx() {
    return {
      state: state,
      elements: {
        metricMenu: elements.metricMenu,
        metricCategories: elements.metricCategories,
        metricAvailability: elements.metricAvailability,
        metricHome: elements.metricHome,
        metricIngredients: elements.metricIngredients,
        metricRestaurant: elements.metricRestaurant,
        metricMedia: elements.metricMedia
      },
      getAllMenuItems: getAllMenuItems,
      ensureCategoriesDraft: ensureCategoriesDraft,
      ensureHomeDraft: ensureHomeDraft,
      ensureIngredientsDraft: ensureIngredientsDraft,
      validateCategoriesDraftData: validateCategoriesDraftData,
      validateIngredientsDraftData: validateIngredientsDraftData,
      resolveCategoryVisibility: resolveCategoryVisibility,
      navigateToRoute: navigateToRoute,
      setActivePanel: setActivePanel,
      setMenuBrowserStatus: setMenuBrowserStatus,
      setItemEditorStatus: setItemEditorStatus,
      setHomeEditorStatus: setHomeEditorStatus,
      setIngredientsEditorStatus: setIngredientsEditorStatus,
      setCategoriesEditorStatus: setCategoriesEditorStatus
    };
  }
  function updateDashboardMetrics() { return DB.updateDashboardMetrics(_dbCtx()); }
  function openDashboard(options) { return DB.openDashboard(_dbCtx(), options); }

  function openMenuBrowser(options) {
    options = options || {};
    if (!options.skipRoute) {
      navigateToRoute("/menu", { replace: Boolean(options.replaceRoute) });
      return;
    }

    if (!state.hasDataLoaded) {
      ensureDataLoaded(false);
      return;
    }

    setActivePanel("menu-browser");
    renderMenuBrowser();
    renderSidebarMenuAccordion();
    setHomeEditorStatus("");
    setIngredientsEditorStatus("");
    setCategoriesEditorStatus("");
  }

  function openCategoriesEditor(options) {
    options = options || {};
    if (!options.skipRoute) {
      navigateToRoute("/categories", { replace: Boolean(options.replaceRoute) });
      return;
    }

    if (!state.hasDataLoaded) {
      ensureDataLoaded(false);
      return;
    }

    ensureCategoriesDraft();
    setActivePanel("categories-editor");
    if (!String(state.categoriesEditor.activeCategoryId || "").trim()) {
      var firstCategoryEntry = getDraftCategoriesSorted()[0];
      if (firstCategoryEntry && firstCategoryEntry.raw && firstCategoryEntry.raw.id) {
        state.categoriesEditor.activeCategoryId = firstCategoryEntry.raw.id;
      }
    }
    renderCategoriesEditor();

    setMenuBrowserStatus("");
    setItemEditorStatus("");
    setHomeEditorStatus("");
    setIngredientsEditorStatus("");
    if (!options.keepStatus) {
      setCategoriesEditorStatus("");
    }
    showItemEditorErrors([]);
  }

  function getDraftCategoriesRaw() {
    ensureCategoriesDraft();
    if (!Array.isArray(state.drafts.categories.categories)) {
      state.drafts.categories.categories = [];
    }
    return state.drafts.categories.categories;
  }

  function getDraftCategoriesSorted() {
    return getDraftCategoriesRaw().map(function (entry, sourceIndex) {
      return {
        sourceIndex: sourceIndex,
        raw: normalizeCategoryDraftEntry(entry, sourceIndex)
      };
    }).sort(function (a, b) {
      var aOrder = Number(a.raw.order);
      var bOrder = Number(b.raw.order);
      if (Number.isFinite(aOrder) && Number.isFinite(bOrder) && aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      if (Number.isFinite(aOrder) && !Number.isFinite(bOrder)) return -1;
      if (!Number.isFinite(aOrder) && Number.isFinite(bOrder)) return 1;
      var byLabel = normalizeText(a.raw.label || a.raw.id).localeCompare(normalizeText(b.raw.label || b.raw.id));
      if (byLabel !== 0) return byLabel;
      return a.sourceIndex - b.sourceIndex;
    });
  }

  function getNextCategoryOrder() {
    var maxOrder = 0;
    getDraftCategoriesRaw().forEach(function (entry) {
      var value = Number(entry && entry.order);
      if (Number.isFinite(value) && value > maxOrder) {
        maxOrder = Math.round(value);
      }
    });
    return Math.max(1, maxOrder + 1);
  }

  function buildMenuCategoryUsageMap() {
    var usageById = {};
    getAllMenuItems().forEach(function (entry) {
      var item = entry && entry.item ? entry.item : null;
      if (!item) return;
      var categoryId = String(item.category || "").trim();
      if (!categoryId) return;
      if (!usageById[categoryId]) {
        usageById[categoryId] = [];
      }
      usageById[categoryId].push({
        id: item.id || "",
        label: item.name || item.id || "Item sin nombre"
      });
    });

    Object.keys(usageById).forEach(function (categoryId) {
      usageById[categoryId].sort(function (a, b) {
        return normalizeText(a.label || a.id).localeCompare(normalizeText(b.label || b.id));
      });
    });

    return usageById;
  }

  function getCategoryUsageEntries(categoryId) {
    var normalizedId = String(categoryId || "").trim();
    if (!normalizedId) return [];
    var usageMap = state.categoriesEditor.usageByCategoryId || {};
    return Array.isArray(usageMap[normalizedId]) ? usageMap[normalizedId].slice() : [];
  }

  function createCategoryEditorDraft(categoryId, sourceEntry) {
    var source = normalizeCategoryDraftEntry(sourceEntry || {}, 0);
    return {
      id: String(categoryId || source.id || "").trim(),
      label: String(source.label || "").trim(),
      order: Number.isFinite(Number(source.order))
        ? Math.max(1, Math.round(Number(source.order)))
        : getNextCategoryOrder(),
      visible: resolveCategoryVisibility(source)
    };
  }

  function parseCategorySourceIndex(value) {
    var parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 0) return null;
    return parsed;
  }

  function getCategoryEntryBySourceIndex(sourceIndex) {
    var parsedSourceIndex = parseCategorySourceIndex(sourceIndex);
    if (parsedSourceIndex === null) return null;
    var source = getDraftCategoriesRaw();
    if (parsedSourceIndex >= source.length) return null;
    return normalizeCategoryDraftEntry(source[parsedSourceIndex], parsedSourceIndex);
  }

  function getCategoryDraftInlineIssues(draft, sourceIndex) {
    var safeDraft = draft || {};
    var nextId = String(safeDraft.id || "").trim();
    var nextLabel = String(safeDraft.label || "").trim();
    var issues = [];

    if (!nextId) {
      issues.push("ID requerido.");
    } else {
      var duplicated = getDraftCategoriesRaw().some(function (entry, index) {
        if (index === sourceIndex) return false;
        return String((entry && entry.id) || "").trim() === nextId;
      });
      if (duplicated) {
        issues.push("ID duplicado: " + nextId);
      }
    }

    if (!nextLabel) {
      issues.push("Label requerido.");
    }

    var orderValue = Number(safeDraft.order);
    if (!Number.isFinite(orderValue) || orderValue < 1) {
      issues.push("Order invalido.");
    }

    return issues;
  }

  function getCategoriesCardDraft(sourceIndex, sourceEntry) {
    var parsedSourceIndex = parseCategorySourceIndex(sourceIndex);
    if (parsedSourceIndex === null) return createCategoryEditorDraft("", sourceEntry || {});
    if (!state.categoriesEditor.draftBySourceIndex) {
      state.categoriesEditor.draftBySourceIndex = {};
    }

    var key = String(parsedSourceIndex);
    if (!state.categoriesEditor.draftBySourceIndex[key]) {
      state.categoriesEditor.draftBySourceIndex[key] = createCategoryEditorDraft(
        sourceEntry && sourceEntry.id ? sourceEntry.id : "",
        sourceEntry || {}
      );
    }
    return state.categoriesEditor.draftBySourceIndex[key];
  }

  function clearCategoryCardDraft(sourceIndex) {
    var parsedSourceIndex = parseCategorySourceIndex(sourceIndex);
    if (parsedSourceIndex === null) return;
    if (!state.categoriesEditor.draftBySourceIndex) return;
    delete state.categoriesEditor.draftBySourceIndex[String(parsedSourceIndex)];
  }

  function updateCategoryDraftField(options) {
    options = options || {};
    var isNew = Boolean(options.isNew);
    var field = String(options.field || "").trim();
    if (!field) return false;

    var draft = null;
    if (isNew) {
      if (!state.categoriesEditor.newDraft) {
        state.categoriesEditor.newDraft = createCategoryEditorDraft("", {
          id: "",
          label: "",
          order: getNextCategoryOrder(),
          visible: true
        });
      }
      draft = state.categoriesEditor.newDraft;
    } else {
      var sourceEntry = getCategoryEntryBySourceIndex(options.sourceIndex);
      if (!sourceEntry) return false;
      draft = getCategoriesCardDraft(options.sourceIndex, sourceEntry);
    }

    if (!draft) return false;

    if (field === "visible") {
      draft.visible = Boolean(options.value);
      return true;
    }

    if (field === "order") {
      var orderValue = Number(options.value);
      draft.order = Number.isFinite(orderValue) ? Math.max(1, Math.round(orderValue)) : getNextCategoryOrder();
      return true;
    }

    if (field === "id" || field === "label") {
      draft[field] = String(options.value || "").trim();
      return true;
    }

    return false;
  }

  function renderCategoriesValidationSummary(report) {
    if (!elements.categoriesValidationSummary) return;
    var safeReport = report || { errors: [], warnings: [] };
    var errorsCount = Array.isArray(safeReport.errors) ? safeReport.errors.length : 0;
    var warningsCount = Array.isArray(safeReport.warnings) ? safeReport.warnings.length : 0;

    if (!errorsCount && !warningsCount) {
      elements.categoriesValidationSummary.textContent = "categories-contract: sin errores ni warnings.";
      elements.categoriesValidationSummary.classList.remove("is-warning");
      return;
    }

    elements.categoriesValidationSummary.textContent =
      "categories-contract: " + errorsCount + " errores, " + warningsCount + " warnings.";
    elements.categoriesValidationSummary.classList.toggle("is-warning", errorsCount > 0 || warningsCount > 0);
  }

  function renderCategoriesGlobalWarnings(report) {
    if (!elements.categoriesEditorWarning) return;
    var safeReport = report || {};
    var warnings = Array.isArray(safeReport.warnings) ? safeReport.warnings : [];
    var menuReferenceReport = safeReport.menuReferenceReport || { invalidItems: [], invalidReferencesCount: 0 };
    var invalidItems = Array.isArray(menuReferenceReport.invalidItems)
      ? menuReferenceReport.invalidItems
      : [];

    var warningText = "";
    if (invalidItems.length) {
      var preview = invalidItems.slice(0, 4).map(function (entry) {
        var itemId = entry.id || entry.label || "item";
        var categoryId = String(entry.category || "").trim() || "(empty)";
        return itemId + " -> " + categoryId;
      }).join(" | ");
      warningText =
        "Warning: menu item references missing category (" +
        menuReferenceReport.invalidReferencesCount +
        " refs)." + (preview ? (" " + preview) : "");
    } else if (warnings.length) {
      warningText = "Warning: " + warnings[0];
    }

    elements.categoriesEditorWarning.textContent = warningText;
    elements.categoriesEditorWarning.classList.toggle("is-warning", Boolean(warningText));
  }

  function buildCategoryUsageHtml(usageEntries) {
    if (!usageEntries.length) {
      return "<li>No hay items usando esta categoria.</li>";
    }
    return usageEntries.map(function (entry) {
      return "<li>" + escapeHtml(entry.id || entry.label || "-") + "</li>";
    }).join("");
  }

  function buildCategoryCardHtml(entry, sortedIndex, report) {
    var sourceEntry = entry.raw;
    var sourceIndex = entry.sourceIndex;
    var draft = getCategoriesCardDraft(sourceIndex, sourceEntry);
    var draftId = String(draft.id || "").trim();
    var usageEntries = getCategoryUsageEntries(draftId || sourceEntry.id);
    var isVisible = Boolean(draft.visible);
    var isActive = String(state.categoriesEditor.activeCategoryId || "").trim() === String(sourceEntry.id || "").trim();
    var cardClassName = "categories-section card" + (isActive ? " is-active" : "");
    var anchorId = sourceEntry.id ? getCategoriesSectionAnchorId(sourceEntry.id) : "";
    var issueBucket = report && report.categoryIssuesById
      ? report.categoryIssuesById[sourceEntry.id || ("index_" + sourceIndex)]
      : null;
    var issueCount = issueBucket
      ? (issueBucket.errors.length + issueBucket.warnings.length)
      : 0;
    var inlineIssues = getCategoryDraftInlineIssues(draft, sourceIndex);
    var issueText = inlineIssues.length
      ? inlineIssues[0]
      : (issueCount ? ((issueBucket.errors.length || 0) + " errores · " + (issueBucket.warnings.length || 0) + " warnings") : "Sin alertas para esta categoria.");
    var issueClassName = "inline-help categories-section__issues" + ((inlineIssues.length || issueCount) ? " is-warning" : "");
    var toggleId = "categories-visible-" + sourceIndex;
    var hasAnchor = Boolean(String(sourceEntry.id || "").trim());

    var visibleToggleHtml = renderToggle({
      id: toggleId,
      label: "Visible",
      checked: isVisible,
      dataAttributes: {
        "data-categories-field": "visible",
        "data-categories-source-index": String(sourceIndex)
      }
    });

    return (
      "<section class=\"" + cardClassName + "\" " +
      (anchorId ? ("id=\"" + anchorId + "\" ") : "") +
      "tabindex=\"-1\" data-categories-card-id=\"" + escapeHtml(sourceEntry.id || "") + "\" " +
      "data-categories-anchor=\"" + (hasAnchor ? "true" : "false") + "\" data-categories-id=\"" + escapeHtml(sourceEntry.id || "") + "\" " +
      "data-categories-source-index=\"" + sourceIndex + "\">" +
      "<header class=\"categories-section__header\">" +
      "<div class=\"categories-section__title-wrap\">" +
      "<p class=\"kicker\">Category " + (sortedIndex + 1) + "</p>" +
      "<h3>" + escapeHtml(draft.label || draft.id || "Categoria sin label") + "</h3>" +
      "<p class=\"inline-help\">" + escapeHtml((draft.id || "(sin id)") + " · " + (isVisible ? "visible" : "hidden") + " · " + usageEntries.length + " items") + "</p>" +
      "</div>" +
      "<div class=\"categories-section__actions\">" +
      "<button class=\"btn btn-primary\" type=\"button\" data-categories-action=\"save\" data-categories-source-index=\"" + sourceIndex + "\">Guardar</button>" +
      "<button class=\"btn btn-ghost\" type=\"button\" data-categories-action=\"cancel\" data-categories-source-index=\"" + sourceIndex + "\">Cancelar</button>" +
      "<button class=\"btn btn-danger\" type=\"button\" data-categories-action=\"delete\" data-categories-source-index=\"" + sourceIndex + "\">Delete</button>" +
      "</div>" +
      "</header>" +
      "<div class=\"categories-section__grid\">" +
      "<label class=\"field\"><span>ID</span><input type=\"text\" value=\"" + escapeHtml(draft.id || "") + "\" data-categories-field=\"id\" data-categories-source-index=\"" + sourceIndex + "\" /></label>" +
      "<label class=\"field\"><span>Label</span><input type=\"text\" value=\"" + escapeHtml(draft.label || "") + "\" data-categories-field=\"label\" data-categories-source-index=\"" + sourceIndex + "\" /></label>" +
      "<label class=\"field\"><span>Order</span><input type=\"number\" min=\"1\" step=\"1\" value=\"" + escapeHtml(String(Number(draft.order) || (sortedIndex + 1))) + "\" data-categories-field=\"order\" data-categories-source-index=\"" + sourceIndex + "\" /></label>" +
      "<div class=\"categories-section__toggle\">" + visibleToggleHtml + "</div>" +
      "</div>" +
      "<section class=\"categories-usage\">" +
      "<h4>Used by menu items</h4>" +
      "<p class=\"inline-help\">Used by menu items: " + usageEntries.length + "</p>" +
      "<ul class=\"categories-usage-list\">" + buildCategoryUsageHtml(usageEntries) + "</ul>" +
      "</section>" +
      "<p class=\"" + issueClassName + "\">" + escapeHtml(issueText) + "</p>" +
      "</section>"
    );
  }

  function buildNewCategoryCardHtml() {
    if (!state.categoriesEditor.newDraft) return "";
    var draft = state.categoriesEditor.newDraft;
    var usageEntries = getCategoryUsageEntries(draft.id);
    var inlineIssues = getCategoryDraftInlineIssues(draft, null);
    var issueText = inlineIssues.length ? inlineIssues[0] : "Completa ID y Label para crear la categoria.";
    var issueClassName = "inline-help categories-section__issues" + (inlineIssues.length ? " is-warning" : "");
    var visibleToggleHtml = renderToggle({
      id: "categories-visible-new",
      label: "Visible",
      checked: Boolean(draft.visible),
      dataAttributes: {
        "data-categories-field": "visible",
        "data-categories-new": "true"
      }
    });

    return (
      "<section class=\"categories-section card categories-section--new\" id=\"categories-section-new\" tabindex=\"-1\" data-categories-new-card=\"true\">" +
      "<header class=\"categories-section__header\">" +
      "<div class=\"categories-section__title-wrap\">" +
      "<p class=\"kicker\">Category / New</p>" +
      "<h3>New category</h3>" +
      "<p class=\"inline-help\">Define identidad, visibilidad y orden.</p>" +
      "</div>" +
      "<div class=\"categories-section__actions\">" +
      "<button class=\"btn btn-primary\" type=\"button\" data-categories-action=\"save-new\">Guardar</button>" +
      "<button class=\"btn btn-ghost\" type=\"button\" data-categories-action=\"cancel-new\">Cancelar</button>" +
      "</div>" +
      "</header>" +
      "<div class=\"categories-section__grid\">" +
      "<label class=\"field\"><span>ID</span><input type=\"text\" value=\"" + escapeHtml(draft.id || "") + "\" data-categories-field=\"id\" data-categories-new=\"true\" /></label>" +
      "<label class=\"field\"><span>Label</span><input type=\"text\" value=\"" + escapeHtml(draft.label || "") + "\" data-categories-field=\"label\" data-categories-new=\"true\" /></label>" +
      "<label class=\"field\"><span>Order</span><input type=\"number\" min=\"1\" step=\"1\" value=\"" + escapeHtml(String(Number(draft.order) || getNextCategoryOrder())) + "\" data-categories-field=\"order\" data-categories-new=\"true\" /></label>" +
      "<div class=\"categories-section__toggle\">" + visibleToggleHtml + "</div>" +
      "</div>" +
      "<section class=\"categories-usage\">" +
      "<h4>Used by menu items</h4>" +
      "<p class=\"inline-help\">Used by menu items: " + usageEntries.length + "</p>" +
      "<ul class=\"categories-usage-list\">" + buildCategoryUsageHtml(usageEntries) + "</ul>" +
      "</section>" +
      "<p class=\"" + issueClassName + "\">" + escapeHtml(issueText) + "</p>" +
      "</section>"
    );
  }

  function renderCategoriesOrderList() {
    if (!elements.categoriesOrderList) return;
    var sortedEntries = getDraftCategoriesSorted();
    if (!sortedEntries.length) {
      elements.categoriesOrderList.innerHTML = "<li class=\"home-editor__hint\">No hay categorias para ordenar.</li>";
      return;
    }

    var html = sortedEntries.map(function (entry, sortedIndex) {
      var category = entry.raw || {};
      var categoryId = String(category.id || "").trim();
      var usageCount = getCategoryUsageEntries(categoryId).length;
      return (
        "<li class=\"home-featured-item categories-order-item\" data-categories-order-index=\"" + sortedIndex + "\" data-categories-order-id=\"" + escapeHtml(categoryId) + "\">" +
        "<button class=\"home-featured-item__handle\" type=\"button\" draggable=\"true\" data-categories-order-handle data-categories-order-index=\"" +
        sortedIndex + "\" aria-label=\"Arrastrar para reordenar " + escapeHtml(category.label || categoryId) + "\"></button>" +
        "<div class=\"home-featured-item__thumb categories-order-item__thumb\"><span>" + (sortedIndex + 1) + "</span></div>" +
        "<div class=\"home-featured-item__footer\">" +
        "<span class=\"home-featured-item__label\">" + escapeHtml(category.label || categoryId || "Sin label") + "</span>" +
        "<span class=\"categories-order-item__meta\">" + escapeHtml((categoryId || "(sin id)") + " · " + usageCount + " items") + "</span>" +
        "</div>" +
        "</li>"
      );
    }).join("");

    elements.categoriesOrderList.innerHTML = html;
  }

  function renderCategoriesEditor() {
    ensureCategoriesDraft();
    state.categoriesEditor.usageByCategoryId = buildMenuCategoryUsageMap();
    state.categoriesEditor.validationReport = validateCategoriesDraftData(state.drafts.categories);

    var sortedEntries = getDraftCategoriesSorted();
    var visibleCount = sortedEntries.filter(function (entry) {
      return resolveCategoryVisibility(entry.raw);
    }).length;
    var hiddenCount = Math.max(0, sortedEntries.length - visibleCount);

    var activeCategoryId = String(state.categoriesEditor.activeCategoryId || "").trim();
    var hasActiveCategory = sortedEntries.some(function (entry) {
      return String((entry.raw && entry.raw.id) || "").trim() === activeCategoryId;
    });
    if ((!activeCategoryId || !hasActiveCategory) && sortedEntries.length) {
      state.categoriesEditor.activeCategoryId = sortedEntries[0].raw.id;
    } else if (!sortedEntries.length) {
      state.categoriesEditor.activeCategoryId = "";
    }

    if (elements.categoriesCardsSummary) {
      elements.categoriesCardsSummary.textContent =
        sortedEntries.length + " categorias · " + visibleCount + " visibles" +
        (hiddenCount ? (" · " + hiddenCount + " hidden") : "");
    }

    renderCategoriesValidationSummary(state.categoriesEditor.validationReport);
    renderCategoriesGlobalWarnings(state.categoriesEditor.validationReport);

    if (elements.categoriesCardsContent) {
      var cardsHtml = [];
      var newCardHtml = buildNewCategoryCardHtml();
      if (newCardHtml) {
        cardsHtml.push(newCardHtml);
      }
      cardsHtml = cardsHtml.concat(sortedEntries.map(function (entry, index) {
        return buildCategoryCardHtml(entry, index, state.categoriesEditor.validationReport);
      }));
      elements.categoriesCardsContent.innerHTML = cardsHtml.length
        ? cardsHtml.join("")
        : "<section class=\"categories-section card\"><p class=\"home-editor__hint\">No hay categorias.</p></section>";
    }

    renderCategoriesOrderList();
    renderSidebarCategoriesAccordion();
    if (elements.categoriesCardsContent) {
      bindToggles(elements.categoriesCardsContent, {
        onChange: function (checked, control) {
          if (!control) return;
          var field = String(control.getAttribute("data-categories-field") || "").trim();
          if (field !== "visible") return;
          var sourceIndex = control.getAttribute("data-categories-source-index");
          var isNew = control.getAttribute("data-categories-new") === "true";
          var changed = updateCategoryDraftField({
            field: "visible",
            value: Boolean(checked),
            sourceIndex: sourceIndex,
            isNew: isNew
          });
          if (!changed) return;
          setCategoriesEditorStatus("Cambios pendientes en Categories. Presiona Guardar en el card.");
        }
      });
    }
    refreshCategoriesScrollAnchors();
    setActiveCategoriesSection(state.categoriesEditor.activeCategoryId, { force: true });
    requestCategoriesScrollSpyUpdate();
  }

  function beginNewCategoryDraft(options) {
    options = options || {};
    if (!options.skipRoute) {
      navigateToRoute("/categories");
      return;
    }

    ensureCategoriesDraft();
    setActivePanel("categories-editor");
    state.categoriesEditor.newDraft = createCategoryEditorDraft("", {
      id: "",
      label: "",
      order: getNextCategoryOrder(),
      visible: true
    });
    renderCategoriesEditor();
    window.requestAnimationFrame(function () {
      var newCard = document.getElementById("categories-section-new");
      if (!newCard) return;
      var targetTop = window.scrollY + newCard.getBoundingClientRect().top - UX_TIMING.anchorScrollOffsetPx;
      window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
    });

    if (!options.silent) {
      setCategoriesEditorStatus("Nueva categoria lista. Define ID y Label, luego guarda.");
    }
  }

  function selectCategoryForEditing(categoryId, options) {
    options = options || {};
    var normalizedId = String(categoryId || "").trim();
    if (!normalizedId) return false;

    if (!options.skipRoute) {
      navigateToRoute("/categories/" + encodeURIComponent(normalizedId));
      return true;
    }

    ensureCategoriesDraft();
    setActivePanel("categories-editor");
    renderCategoriesEditor();
    scrollToCategoriesSection(normalizedId, { instant: Boolean(options.instant) });
    setActiveCategoriesSection(normalizedId, { force: true });
    if (!options.silent) {
      setCategoriesEditorStatus("Editando categoria: " + normalizedId);
    }
    return true;
  }

  function applyCategoriesDraftMutation(statusMessage) {
    state.categoriesEditor.draftBySourceIndex = {};
    buildIndexes();
    updateDashboardMetrics();
    renderMenuBrowser();
    renderSidebarMenuAccordion();
    renderSidebarHomepageAccordion();
    renderSidebarCategoriesAccordion();
    persistDraftsToLocalStorage();
    setDraftsBanner(true, "Drafts locales activos (Clear drafts | Export)");
    saveDraftsToLocalFiles();
    renderCategoriesEditor();

    if (statusMessage) {
      setCategoriesEditorStatus(statusMessage);
    }
  }

  function saveCategoryDraftBySourceIndex(sourceIndex) {
    var parsedSourceIndex = parseCategorySourceIndex(sourceIndex);
    if (parsedSourceIndex === null) {
      setCategoriesEditorStatus("No se pudo resolver la categoria para guardar.");
      return false;
    }

    ensureCategoriesDraft();
    var categoriesList = getDraftCategoriesRaw();
    if (parsedSourceIndex >= categoriesList.length) {
      setCategoriesEditorStatus("No se encontro la categoria para guardar.");
      return false;
    }

    var sourceEntry = normalizeCategoryDraftEntry(categoriesList[parsedSourceIndex], parsedSourceIndex);
    var draft = getCategoriesCardDraft(parsedSourceIndex, sourceEntry);
    var nextId = String(draft.id || "").trim();
    var nextLabel = String(draft.label || "").trim();
    var nextOrder = Number.isFinite(Number(draft.order))
      ? Math.max(1, Math.round(Number(draft.order)))
      : getNextCategoryOrder();
    var nextVisible = Boolean(draft.visible);

    if (!nextId) {
      setCategoriesEditorStatus("ID requerido. Define un ID unico para la categoria.");
      return false;
    }
    if (!nextLabel) {
      setCategoriesEditorStatus("Label requerido. Define un nombre visible para la categoria.");
      return false;
    }

    var duplicateId = categoriesList.some(function (entry, index) {
      if (index === parsedSourceIndex) return false;
      return String((entry && entry.id) || "").trim() === nextId;
    });
    if (duplicateId) {
      setCategoriesEditorStatus("El ID ya existe: " + nextId);
      return false;
    }

    var nextEntry = deepClone(categoriesList[parsedSourceIndex] || {});
    var previousId = String(nextEntry.id || "").trim();
    nextEntry.id = nextId;
    nextEntry.label = nextLabel;
    nextEntry.order = nextOrder;
    nextEntry.visible = nextVisible;
    nextEntry.enabled = nextVisible;
    categoriesList[parsedSourceIndex] = normalizeCategoryDraftEntry(nextEntry, parsedSourceIndex);

    clearCategoryCardDraft(parsedSourceIndex);
    if (String(state.categoriesEditor.activeCategoryId || "").trim() === previousId || !state.categoriesEditor.activeCategoryId) {
      state.categoriesEditor.activeCategoryId = nextId;
    }

    if (previousId && window.location.hash === "#/categories/" + encodeURIComponent(previousId)) {
      setHashSilently("/categories/" + encodeURIComponent(nextId));
    }

    var report = validateCategoriesDraftData(state.drafts.categories);
    var issuesCount = report.errors.length + report.warnings.length;
    applyCategoriesDraftMutation(
      issuesCount
        ? ("Categoria guardada en drafts con " + report.errors.length + " errores y " + report.warnings.length + " warnings.")
        : "Categoria guardada en drafts locales."
    );
    return true;
  }

  function saveNewCategoryDraft() {
    ensureCategoriesDraft();
    if (!state.categoriesEditor.newDraft) {
      setCategoriesEditorStatus("No hay nueva categoria para guardar.");
      return false;
    }

    var draft = state.categoriesEditor.newDraft;
    var nextId = String(draft.id || "").trim();
    var nextLabel = String(draft.label || "").trim();
    var nextOrder = Number.isFinite(Number(draft.order))
      ? Math.max(1, Math.round(Number(draft.order)))
      : getNextCategoryOrder();
    var nextVisible = Boolean(draft.visible);

    if (!nextId) {
      setCategoriesEditorStatus("ID requerido. Define un ID unico para la categoria.");
      return false;
    }
    if (!nextLabel) {
      setCategoriesEditorStatus("Label requerido. Define un nombre visible para la categoria.");
      return false;
    }

    var duplicateId = getDraftCategoriesRaw().some(function (entry) {
      return String((entry && entry.id) || "").trim() === nextId;
    });
    if (duplicateId) {
      setCategoriesEditorStatus("El ID ya existe: " + nextId);
      return false;
    }

    getDraftCategoriesRaw().push(normalizeCategoryDraftEntry({
      id: nextId,
      label: nextLabel,
      order: nextOrder,
      visible: nextVisible,
      enabled: nextVisible,
      subcategories: []
    }, getDraftCategoriesRaw().length));
    state.categoriesEditor.newDraft = null;
    state.categoriesEditor.activeCategoryId = nextId;
    applyCategoriesDraftMutation("Categoria guardada en drafts locales.");
    setHashSilently("/categories/" + encodeURIComponent(nextId));
    window.requestAnimationFrame(function () {
      scrollToCategoriesSection(nextId);
    });
    return true;
  }

  function saveCategoriesEditorDraft() {
    setCategoriesEditorStatus("Usa Guardar en el card de la categoria.");
  }

  function deleteCategoryBySourceIndex(sourceIndex) {
    var parsedSourceIndex = parseCategorySourceIndex(sourceIndex);
    if (parsedSourceIndex === null) {
      setCategoriesEditorStatus("No se pudo resolver la categoria para eliminar.");
      return false;
    }

    ensureCategoriesDraft();
    var sourceEntry = getCategoryEntryBySourceIndex(parsedSourceIndex);
    if (!sourceEntry) {
      setCategoriesEditorStatus("No se encontro la categoria para eliminar.");
      return false;
    }
    var categoryId = String(sourceEntry.id || "").trim();
    if (!categoryId) {
      setCategoriesEditorStatus("La categoria no tiene ID valido.");
      return false;
    }

    var usageEntries = getCategoryUsageEntries(categoryId);
    if (usageEntries.length) {
      setCategoriesEditorStatus(
        "This category is used by " + usageEntries.length + " menu items. Move or reassign them before deleting."
      );
      return false;
    }

    var confirmed = window.confirm("Eliminar categoria '" + categoryId + "'?");
    if (!confirmed) return false;

    state.drafts.categories.categories = getDraftCategoriesRaw().filter(function (_entry, index) {
      return index !== parsedSourceIndex;
    }).map(function (entry, index) {
      return normalizeCategoryDraftEntry(entry, index);
    });
    state.categoriesEditor.draftBySourceIndex = {};

    var remaining = getDraftCategoriesSorted();
    state.categoriesEditor.activeCategoryId = remaining.length ? remaining[0].raw.id : "";
    if (window.location.hash === "#/categories/" + encodeURIComponent(categoryId)) {
      setHashSilently("/categories");
    }

    applyCategoriesDraftMutation("Categoria eliminada: " + categoryId);
    return true;
  }

  function deleteSelectedCategory() {
    setCategoriesEditorStatus("Usa Delete en el card de la categoria.");
  }

  function cancelCategoryDraftBySourceIndex(sourceIndex) {
    var parsedSourceIndex = parseCategorySourceIndex(sourceIndex);
    if (parsedSourceIndex === null) return;
    clearCategoryCardDraft(parsedSourceIndex);
    renderCategoriesEditor();
    setCategoriesEditorStatus("Cambios descartados.");
  }

  function cancelCategoriesEditorDraft() {
    if (state.categoriesEditor.newDraft) {
      state.categoriesEditor.newDraft = null;
      renderCategoriesEditor();
      setCategoriesEditorStatus("Borrador nuevo descartado.");
      return;
    }
    setCategoriesEditorStatus("Usa Cancelar en el card de la categoria.");
  }

  function captureCategoriesOrderItemRects() {
    if (!elements.categoriesOrderList) return null;
    var rectsById = {};
    var items = elements.categoriesOrderList.querySelectorAll(".categories-order-item[data-categories-order-id]");
    Array.prototype.forEach.call(items, function (item) {
      var itemId = String(item.getAttribute("data-categories-order-id") || "").trim();
      if (!itemId) return;
      rectsById[itemId] = item.getBoundingClientRect();
    });
    return rectsById;
  }

  function animateCategoriesOrderReorder(previousRectsById) {
    if (!previousRectsById || !elements.categoriesOrderList) return;
    var items = elements.categoriesOrderList.querySelectorAll(".categories-order-item[data-categories-order-id]");
    var animatedItems = [];
    Array.prototype.forEach.call(items, function (item) {
      var itemId = String(item.getAttribute("data-categories-order-id") || "").trim();
      if (!itemId || !previousRectsById[itemId]) return;
      var previousRect = previousRectsById[itemId];
      var nextRect = item.getBoundingClientRect();
      var deltaX = previousRect.left - nextRect.left;
      var deltaY = previousRect.top - nextRect.top;
      if (!deltaX && !deltaY) return;

      item.style.transition = "none";
      item.style.transform = "translate(" + deltaX + "px, " + deltaY + "px)";
      animatedItems.push(item);
    });

    if (!animatedItems.length) return;
    window.requestAnimationFrame(function () {
      animatedItems.forEach(function (item) {
        item.style.transition = "transform 180ms cubic-bezier(0.2, 0, 0, 1)";
        item.style.transform = "translate(0, 0)";
        var cleanup = function () {
          item.style.transition = "";
          item.style.transform = "";
          item.removeEventListener("transitionend", cleanup);
        };
        item.addEventListener("transitionend", cleanup);
        window.setTimeout(cleanup, 220);
      });
    });
  }

  function clearCategoriesDropMarkers() {
    if (!elements.categoriesOrderList) return;
    var highlighted = elements.categoriesOrderList.querySelectorAll(".home-featured-item--drop-target");
    Array.prototype.forEach.call(highlighted, function (item) {
      item.classList.remove("home-featured-item--drop-target");
    });
  }

  function resetCategoriesDragState() {
    dragState.categoryOrderIndex = null;
    dragState.categoryOrderDropIndex = null;
    clearCategoriesDropMarkers();
    if (!elements.categoriesOrderList) return;
    var draggingItem = elements.categoriesOrderList.querySelector(".home-featured-item--dragging");
    if (draggingItem) {
      draggingItem.classList.remove("home-featured-item--dragging");
    }
    elements.categoriesOrderList.classList.remove("home-featured-list--dragging");
  }

  function resolveCategoriesOrderDropTarget(targetItem, sourceIndex) {
    var targetIndex = Number(targetItem.getAttribute("data-categories-order-index"));
    if (!Number.isInteger(targetIndex) || targetIndex < 0) return null;
    if (targetIndex === sourceIndex) return null;
    return { index: targetIndex };
  }

  function applyCategoriesReorder(sourceSortedIndex, targetSortedIndex) {
    if (!Number.isInteger(sourceSortedIndex) || !Number.isInteger(targetSortedIndex)) return false;
    if (sourceSortedIndex < 0 || targetSortedIndex < 0) return false;
    if (sourceSortedIndex === targetSortedIndex) return false;

    var sorted = getDraftCategoriesSorted();
    if (sourceSortedIndex >= sorted.length || targetSortedIndex >= sorted.length) return false;

    var reordered = sorted.slice();
    var sourceEntry = reordered[sourceSortedIndex];
    var targetEntry = reordered[targetSortedIndex];
    reordered[sourceSortedIndex] = targetEntry;
    reordered[targetSortedIndex] = sourceEntry;

    state.drafts.categories.categories = reordered.map(function (entry, index) {
      var nextEntry = normalizeCategoryDraftEntry(entry.raw, index);
      nextEntry.order = index + 1;
      nextEntry.visible = resolveCategoryVisibility(nextEntry);
      nextEntry.enabled = nextEntry.visible;
      return nextEntry;
    });
    state.categoriesEditor.draftBySourceIndex = {};

    applyCategoriesDraftMutation("Order actualizado en drafts.");
    return true;
  }

  function getHomeSectionAnchorId(sectionId) {
    return "home-section-" + sectionId;
  }

  function normalizeHomeSectionId(sectionId) {
    var normalized = String(sectionId || "").trim();
    if (!normalized) return HOME_EDITOR_SECTIONS[0].id;
    var found = HOME_EDITOR_SECTIONS.some(function (entry) {
      return entry.id === normalized;
    });
    return found ? normalized : HOME_EDITOR_SECTIONS[0].id;
  }

  function getHomeSectionMeta(sectionId) {
    var normalized = normalizeHomeSectionId(sectionId);
    var found = HOME_EDITOR_SECTIONS.find(function (entry) {
      return entry.id === normalized;
    });
    return found || HOME_EDITOR_SECTIONS[0];
  }

  function getMenuItemNameById(itemId) {
    var normalizedId = String(itemId || "").trim();
    if (!normalizedId) return "";
    var match = getAllMenuItems().find(function (entry) {
      return entry.item && entry.item.id === normalizedId;
    });
    if (!match || !match.item) return normalizedId;
    return match.item.name || normalizedId;
  }

  function getMenuItemById(itemId) {
    var normalizedId = String(itemId || "").trim();
    if (!normalizedId) return null;
    var match = getAllMenuItems().find(function (entry) {
      return entry.item && entry.item.id === normalizedId;
    });
    return match && match.item ? match.item : null;
  }

  function normalizeHomeEditorCollections() {
    ensureHomeDraft();

    var navbarLinksRaw = Array.isArray(state.drafts.home.navbar.links)
      ? state.drafts.home.navbar.links
      : [];
    var navbarLinksNormalized = navbarLinksRaw
      .map(function (linkEntry) {
        var safeLink = linkEntry && typeof linkEntry === "object" ? linkEntry : {};
        var label = String(safeLink.label || "").trim();
        var url = String(safeLink.url || "").trim();
        if (!label && !url) return null;
        return {
          label: label || "Link",
          url: url || "#"
        };
      })
      .filter(Boolean);

    if (!navbarLinksNormalized.length) {
      navbarLinksNormalized = HOME_DEFAULT_NAVBAR_LINKS.map(function (linkEntry) {
        return {
          label: linkEntry.label,
          url: linkEntry.url
        };
      });
    }

    state.drafts.home.navbar.links = navbarLinksNormalized;
    state.drafts.home.navbar.cta.label = String(
      state.drafts.home.navbar.cta.label || "Reservar ahora"
    ).trim();
    state.drafts.home.navbar.cta.url = String(
      state.drafts.home.navbar.cta.url || "#reservar"
    ).trim();
    state.drafts.home.navbar.cta.icon = String(
      state.drafts.home.navbar.cta.icon || HOME_DEFAULT_NAVBAR_ICON
    ).trim();
    state.drafts.home.navbar.cta.title = String(
      state.drafts.home.navbar.cta.title || "Reserva tu mesa"
    ).trim();
    normalizeHomeDeliveryPlatforms(state.drafts.home);

    if (state.drafts.home.popular.featuredIds.length > HOME_FEATURED_LIMIT) {
      state.drafts.home.popular.featuredIds = state.drafts.home.popular.featuredIds.slice(
        state.drafts.home.popular.featuredIds.length - HOME_FEATURED_LIMIT
      );
    }

    if (!Array.isArray(state.drafts.home.eventsPreview.items)) {
      state.drafts.home.eventsPreview.items = [];
    }

    state.drafts.home.eventsPreview.items = state.drafts.home.eventsPreview.items
      .map(function (item, index) {
        var safeItem = item && typeof item === "object" ? item : {};
        return {
          id: String(safeItem.id || ("evento_" + (index + 1))).trim(),
          title: String(safeItem.title || "").trim(),
          subtitle: String(safeItem.subtitle || "").trim()
        };
      })
      .filter(function (item) {
        return Boolean(item.id);
      });

    var eventsLimit = Number(state.drafts.home.eventsPreview.limit);
    if (!Number.isFinite(eventsLimit) || eventsLimit <= 0) {
      eventsLimit = 3;
    }
    state.drafts.home.eventsPreview.limit = Math.max(1, Math.round(eventsLimit));
    state.drafts.home.eventsPreview.items = state.drafts.home.eventsPreview.items.slice(
      0,
      state.drafts.home.eventsPreview.limit
    );
    state.drafts.home.eventsPreview.eventIds = state.drafts.home.eventsPreview.items.map(function (item) {
      return item.id;
    });

    state.drafts.home.testimonials.items = normalizeHomeTestimonialsItems(
      state.drafts.home.testimonials.items
    );
    state.drafts.home.footer.columns = normalizeHomeFooterColumns(
      state.drafts.home.footer.columns
    );
    if (!state.drafts.home.footer.cta || typeof state.drafts.home.footer.cta !== "object") {
      state.drafts.home.footer.cta = {};
    }
    state.drafts.home.footer.cta.label = String(
      state.drafts.home.footer.cta.label || HOME_FOOTER_DEFAULT_CTA.label
    ).trim();
    state.drafts.home.footer.cta.url = String(
      state.drafts.home.footer.cta.url || HOME_FOOTER_DEFAULT_CTA.url
    ).trim();
    state.drafts.home.footer.socials = normalizeHomeFooterSocials(
      state.drafts.home.footer.socials
    );

    state.drafts.home.reservation.enabled = state.drafts.home.sections.navbar !== false;
    state.drafts.home.reservation.title = state.drafts.home.navbar.cta.title;
    state.drafts.home.reservation.url = state.drafts.home.navbar.cta.url;
    state.drafts.home.reservation.ctaLabel = state.drafts.home.navbar.cta.label;
  }

  function setHomeValueByPath(path, value) {
    if (!path) return;
    var segments = path.split(".");
    var pointer = state.drafts.home;
    for (var index = 0; index < segments.length - 1; index += 1) {
      var segment = segments[index];
      if (!pointer[segment] || typeof pointer[segment] !== "object") {
        pointer[segment] = {};
      }
      pointer = pointer[segment];
    }
    pointer[segments[segments.length - 1]] = value;
  }

  function updateSidebarHomepageAccordionActiveClasses() {
    if (!elements.sidebarHomepageAccordion) return;
    var activeSectionId = normalizeHomeSectionId(state.homeActiveSectionId);
    var buttons = elements.sidebarHomepageAccordion.querySelectorAll("[data-scroll-home-section]");
    Array.prototype.forEach.call(buttons, function (button) {
      var sectionId = button.getAttribute("data-scroll-home-section") || "";
      button.classList.toggle("is-active", sectionId === activeSectionId);
    });
  }

  function renderSidebarHomepageAccordion() {
    if (!elements.sidebarHomepageAccordion) return;
    if (!state.hasDataLoaded) {
      elements.sidebarHomepageAccordion.innerHTML = "";
      return;
    }

    var html = HOME_EDITOR_SECTIONS.map(function (section, sectionIndex) {
      var isActive = state.homeActiveSectionId === section.id;
      var buttonClass = "sidebar-accordion-category__toggle" + (isActive ? " is-active" : "");
      return (
        "<div class=\"sidebar-accordion-category\" style=\"--sidebar-stagger-index:" + sectionIndex + "\" data-home-section-id=\"" + escapeHtml(section.id) + "\">" +
        "<button class=\"" + buttonClass + "\" type=\"button\" data-scroll-home-section=\"" +
        escapeHtml(section.id) + "\"><span>" + escapeHtml(section.label) + "</span></button>" +
        "</div>"
      );
    }).join("");

    elements.sidebarHomepageAccordion.innerHTML = html;
    updateSidebarHomepageAccordionActiveClasses();
    syncSidebarAccordionCategoryHeights(elements.sidebarHomepageAccordion);
  }

  function setActiveHomeSection(sectionId, options) {
    options = options || {};
    var nextSectionId = normalizeHomeSectionId(sectionId);
    if (state.homeActiveSectionId === nextSectionId && !options.force) {
      return;
    }

    state.homeActiveSectionId = nextSectionId;
    if (nextSectionId) {
      setNavigationCurrentSection("homepage:" + nextSectionId);
    }

    if (!options.skipClassUpdate) {
      updateSidebarHomepageAccordionActiveClasses();
    }
  }

  function scrollToHomeSection(sectionId) {
    var normalized = normalizeHomeSectionId(sectionId);
    var anchor = document.getElementById(getHomeSectionAnchorId(normalized));
    if (!anchor) return;

    var targetTop = window.scrollY + anchor.getBoundingClientRect().top - UX_TIMING.anchorScrollOffsetPx;
    var lockDurationMs = getProgrammaticScrollLockDuration(targetTop, "smooth");
    runWithProgrammaticScrollLock(function () {
      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: "smooth"
      });
    }, lockDurationMs, "homepage:" + normalized);
  }

  function refreshHomeScrollAnchors() {
    if (!elements.homeSectionsContent) {
      state.homeAnchorTargets = [];
      return;
    }
    state.homeAnchorTargets = Array.prototype.slice
      .call(elements.homeSectionsContent.querySelectorAll("[data-home-anchor='true']"))
      .map(function (anchorElement) {
        return {
          sectionId: anchorElement.getAttribute("data-home-section-id") || "",
          element: anchorElement
        };
      });
  }

  function updateHomeScrollSpy(force) {
    if (state.currentPanel !== "home-editor") return;
    if (state.visiblePanel !== "home-editor") return;
    if (!canRunScrollSpy(Boolean(force))) return;
    if (isSidebarAccordionOpening("homepage")) return;
    if (!state.homeAnchorTargets.length) return;

    var activeAnchor = findActiveAnchorTarget(
      state.homeAnchorTargets,
      UX_TIMING.scrollSpyThresholdPx
    );
    if (!activeAnchor) return;

    setActiveHomeSection(activeAnchor.sectionId, { force: Boolean(force) });
  }

  function requestHomeScrollSpyUpdate() {
    if (state.currentPanel !== "home-editor") return;
    if (state.visiblePanel !== "home-editor") return;
    if (state.isPanelTransitioning) return;
    if (!isNavigationStateIdle()) return;
    if (isSidebarAccordionOpening("homepage")) return;
    if (state.homeScrollSpyFrame) return;
    state.homeScrollSpyFrame = window.requestAnimationFrame(function () {
      state.homeScrollSpyFrame = 0;
      updateHomeScrollSpy(false);
    });
  }

  function buildNavbarLinksListHtml() {
    var links = (state.drafts.home.navbar && state.drafts.home.navbar.links) || [];
    if (!links.length) {
      return "<p class=\"home-editor__hint\">No hay links en navbar.</p>";
    }

    return (
      "<div class=\"home-events-list\">" +
      links.map(function (linkEntry, index) {
        return (
          "<article class=\"home-events-item\" data-navbar-index=\"" + index + "\">" +
          "<div class=\"home-events-item__top\">" +
          "<strong>Link " + (index + 1) + "</strong>" +
          "<span class=\"home-featured-item__actions\">" +
          "<button class=\"btn btn-ghost\" type=\"button\" data-navbar-action=\"up\" data-navbar-index=\"" +
          index + "\">↑</button>" +
          "<button class=\"btn btn-ghost\" type=\"button\" data-navbar-action=\"down\" data-navbar-index=\"" +
          index + "\">↓</button>" +
          "<button class=\"btn btn-ghost\" type=\"button\" data-navbar-action=\"remove\" data-navbar-index=\"" +
          index + "\">Quitar</button>" +
          "</span>" +
          "</div>" +
          "<label class=\"field\">" +
          "<span>Label</span>" +
          "<input type=\"text\" data-navbar-index=\"" + index + "\" data-navbar-field=\"label\" value=\"" +
          escapeHtml(linkEntry.label || "") + "\" />" +
          "</label>" +
          "<label class=\"field\">" +
          "<span>URL</span>" +
          "<input type=\"text\" data-navbar-index=\"" + index + "\" data-navbar-field=\"url\" value=\"" +
          escapeHtml(linkEntry.url || "") + "\" />" +
          "</label>" +
          "</article>"
        );
      }).join("") +
      "</div>"
    );
  }

  function buildFeaturedOptionsHtml() {
    var currentFeaturedSet = new Set(state.drafts.home.popular.featuredIds || []);
    var options = getAllMenuItems()
      .map(function (entry) {
        return {
          id: entry.item.id,
          label: entry.item.name || entry.item.id
        };
      })
      .filter(function (entry) {
        return !currentFeaturedSet.has(entry.id);
      })
      .sort(function (a, b) {
        return normalizeText(a.label).localeCompare(normalizeText(b.label));
      });

    var html = '<option value="">(selecciona item)</option>';
    options.forEach(function (option) {
      html += "<option value=\"" + escapeHtml(option.id) + "\">" +
        escapeHtml(option.label + " · " + option.id) +
        "</option>";
    });
    return html;
  }

  function buildFeaturedListHtml() {
    var featuredIds = state.drafts.home.popular.featuredIds || [];
    if (!featuredIds.length) {
      return "<p class=\"home-editor__hint\">No hay featuredIds configurados.</p>";
    }

    return (
      "<ul class=\"home-featured-list\">" +
      featuredIds.map(function (itemId, index) {
        var menuItem = getMenuItemById(itemId);
        var itemName = menuItem && menuItem.name ? menuItem.name : itemId;
        var cardImage = menuItem ? resolveCardImageForItem(menuItem) : resolveAssetPath(MENU_PLACEHOLDER_IMAGE);
        return (
          "<li class=\"home-featured-item\" data-featured-index=\"" + index +
          "\" data-featured-id=\"" + escapeHtml(itemId) + "\">" +
          "<button class=\"home-featured-item__handle\" type=\"button\" draggable=\"true\" " +
          "data-featured-drag-handle data-featured-index=\"" + index + "\" aria-label=\"Arrastrar para reordenar " +
          escapeHtml(itemName || itemId) + "\"></button>" +
          "<div class=\"home-featured-item__thumb\">" +
          "<img src=\"" + escapeHtml(cardImage) + "\" alt=\"" + escapeHtml(itemName || itemId) +
          "\" loading=\"lazy\" onerror=\"this.onerror=null;this.src='/" +
          escapeHtml(MENU_PLACEHOLDER_IMAGE) + "';\" />" +
          "</div>" +
          "<div class=\"home-featured-item__footer\">" +
          "<span class=\"home-featured-item__label\">" +
          escapeHtml(itemName || itemId) +
          "</span>" +
          "<span class=\"home-featured-item__actions\">" +
          "<button class=\"home-featured-item__remove-btn\" type=\"button\" data-featured-action=\"remove\" data-featured-index=\"" +
          index + "\" aria-label=\"Quitar\" title=\"Quitar\">" +
          "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M232.7 69.9C237.1 56.8 249.3 48 263.1 48L377 48C390.8 48 403 56.8 407.4 69.9L416 96L512 96C529.7 96 544 110.3 544 128C544 145.7 529.7 160 512 160L128 160C110.3 160 96 145.7 96 128C96 110.3 110.3 96 128 96L224 96L232.7 69.9zM128 208L512 208L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 208zM216 272C202.7 272 192 282.7 192 296L192 488C192 501.3 202.7 512 216 512C229.3 512 240 501.3 240 488L240 296C240 282.7 229.3 272 216 272zM320 272C306.7 272 296 282.7 296 296L296 488C296 501.3 306.7 512 320 512C333.3 512 344 501.3 344 488L344 296C344 282.7 333.3 272 320 272zM424 272C410.7 272 400 282.7 400 296L400 488C400 501.3 410.7 512 424 512C437.3 512 448 501.3 448 488L448 296C448 282.7 437.3 272 424 272z\"/></svg>" +
          "</button>" +
          "</span>" +
          "</div>" +
          "</li>"
        );
      }).join("") +
      "</ul>"
    );
  }

  function captureFeaturedItemRects() {
    if (!elements.homeSectionsContent) return null;
    var featuredList = elements.homeSectionsContent.querySelector(".home-featured-list");
    if (!featuredList) return null;

    var rectsById = {};
    var featuredItems = featuredList.querySelectorAll(".home-featured-item[data-featured-id]");
    Array.prototype.forEach.call(featuredItems, function (item) {
      var itemId = String(item.getAttribute("data-featured-id") || "").trim();
      if (!itemId) return;
      rectsById[itemId] = item.getBoundingClientRect();
    });
    return rectsById;
  }

  function animateFeaturedReorder(previousRectsById) {
    if (!previousRectsById || !elements.homeSectionsContent) return;
    var featuredList = elements.homeSectionsContent.querySelector(".home-featured-list");
    if (!featuredList) return;

    var animatedItems = [];
    var featuredItems = featuredList.querySelectorAll(".home-featured-item[data-featured-id]");
    Array.prototype.forEach.call(featuredItems, function (item) {
      var itemId = String(item.getAttribute("data-featured-id") || "").trim();
      if (!itemId || !previousRectsById[itemId]) return;

      var previousRect = previousRectsById[itemId];
      var nextRect = item.getBoundingClientRect();
      var deltaX = previousRect.left - nextRect.left;
      var deltaY = previousRect.top - nextRect.top;
      if (!deltaX && !deltaY) return;

      item.style.transition = "none";
      item.style.transform = "translate(" + deltaX + "px, " + deltaY + "px)";
      animatedItems.push(item);
    });

    if (!animatedItems.length) return;

    window.requestAnimationFrame(function () {
      animatedItems.forEach(function (item) {
        item.style.transition = "transform 180ms cubic-bezier(0.2, 0, 0, 1)";
        item.style.transform = "translate(0, 0)";

        var cleanup = function () {
          item.style.transition = "";
          item.style.transform = "";
          item.removeEventListener("transitionend", cleanup);
        };

        item.addEventListener("transitionend", cleanup);
        window.setTimeout(cleanup, 220);
      });
    });
  }

  function clearFeaturedDropMarkers() {
    if (!elements.homeSectionsContent) return;
    var highlightedItems = elements.homeSectionsContent.querySelectorAll(
      ".home-featured-item--drop-target"
    );
    Array.prototype.forEach.call(highlightedItems, function (item) {
      item.classList.remove("home-featured-item--drop-target");
    });
  }

  function resetFeaturedDragState() {
    dragState.featuredIndex = null;
    dragState.featuredDropIndex = null;
    clearFeaturedDropMarkers();

    if (!elements.homeSectionsContent) return;
    var draggingItem = elements.homeSectionsContent.querySelector(".home-featured-item--dragging");
    if (draggingItem) {
      draggingItem.classList.remove("home-featured-item--dragging");
    }
    var featuredList = elements.homeSectionsContent.querySelector(".home-featured-list");
    if (featuredList) {
      featuredList.classList.remove("home-featured-list--dragging");
    }
  }

  function resolveFeaturedDropTarget(targetItem, sourceIndex) {
    var targetIndex = Number(targetItem.getAttribute("data-featured-index"));
    if (!Number.isInteger(targetIndex) || targetIndex < 0) return null;
    if (targetIndex === sourceIndex) return null;

    return {
      index: targetIndex
    };
  }

  function buildEventsListHtml() {
    var items = (state.drafts.home.eventsPreview && state.drafts.home.eventsPreview.items) || [];
    if (!items.length) {
      return "<p class=\"home-editor__hint\">No hay eventos configurados.</p>";
    }

    return (
      "<div class=\"home-events-list\">" +
      items.map(function (eventItem, index) {
        return (
          "<article class=\"home-events-item\" data-event-index=\"" + index + "\">" +
          "<div class=\"home-events-item__top\">" +
          "<strong>Evento " + (index + 1) + "</strong>" +
          "<button class=\"btn btn-ghost\" type=\"button\" data-event-remove=\"" + index + "\">Quitar</button>" +
          "</div>" +
          "<label class=\"field\">" +
          "<span>ID</span>" +
          "<input type=\"text\" data-event-index=\"" + index + "\" data-event-field=\"id\" value=\"" +
          escapeHtml(eventItem.id || "") + "\" />" +
          "</label>" +
          "<label class=\"field\">" +
          "<span>Titulo</span>" +
          "<input type=\"text\" data-event-index=\"" + index + "\" data-event-field=\"title\" value=\"" +
          escapeHtml(eventItem.title || "") + "\" />" +
          "</label>" +
          "<label class=\"field\">" +
          "<span>Subtitulo</span>" +
          "<input type=\"text\" data-event-index=\"" + index + "\" data-event-field=\"subtitle\" value=\"" +
          escapeHtml(eventItem.subtitle || "") + "\" />" +
          "</label>" +
          "</article>"
        );
      }).join("") +
      "</div>"
    );
  }

  function buildTestimonialsListHtml() {
    var items = (state.drafts.home.testimonials && state.drafts.home.testimonials.items) || [];
    if (!items.length) {
      return "<p class=\"home-editor__hint\">No hay testimonios configurados.</p>";
    }

    return (
      "<div class=\"home-testimonials-grid\">" +
      items.map(function (testimonialItem, index) {
        var safeStars = normalizeHomeTestimonialStars(testimonialItem.stars, 5);
        var starsOptionsHtml = "";
        for (var starsValue = 1; starsValue <= 5; starsValue += 1) {
          starsOptionsHtml += "<option value=\"" + starsValue + "\"" +
            (safeStars === starsValue ? " selected" : "") +
            ">" + starsValue + "</option>";
        }

        return (
          "<article class=\"home-testimonial-item\" data-testimonial-index=\"" + index + "\">" +
          "<div class=\"home-testimonial-item__top\">" +
          "<strong>Testimonio " + (index + 1) + "</strong>" +
          "<button class=\"btn btn-ghost\" type=\"button\" data-testimonial-remove=\"" + index + "\">Eliminar</button>" +
          "</div>" +
          "<label class=\"field\">" +
          "<span>Username</span>" +
          "<input type=\"text\" data-testimonial-index=\"" + index + "\" data-testimonial-field=\"name\" value=\"" +
          escapeHtml(testimonialItem.name || "") + "\" />" +
          "</label>" +
          "<label class=\"field\">" +
          "<span>Role</span>" +
          "<input type=\"text\" data-testimonial-index=\"" + index + "\" data-testimonial-field=\"role\" value=\"" +
          escapeHtml(testimonialItem.role || "") + "\" />" +
          "</label>" +
          "<label class=\"field\">" +
          "<span>Stars</span>" +
          "<select data-testimonial-index=\"" + index + "\" data-testimonial-field=\"stars\">" +
          starsOptionsHtml +
          "</select>" +
          "</label>" +
          "<label class=\"field\" data-span=\"full\">" +
          "<span>Texto</span>" +
          "<textarea rows=\"4\" data-testimonial-index=\"" + index + "\" data-testimonial-field=\"text\">" +
          escapeHtml(testimonialItem.text || "") +
          "</textarea>" +
          "</label>" +
          "</article>"
        );
      }).join("") +
      "</div>"
    );
  }

  function buildFooterColumnsEditorHtml() {
    var columns = (state.drafts.home.footer && state.drafts.home.footer.columns) || [];
    if (!columns.length) {
      return "<p class=\"home-editor__hint\">No hay columnas de footer configuradas.</p>";
    }

    return (
      "<div class=\"home-footer-columns\">" +
      columns.map(function (column, columnIndex) {
        var links = Array.isArray(column.links) ? column.links : [];
        var linksHtml = links.length
          ? (
            "<div class=\"home-footer-links-list\">" +
            links.map(function (linkEntry, linkIndex) {
              return (
                "<article class=\"home-footer-link-item\" data-footer-column-index=\"" + columnIndex +
                "\" data-footer-link-index=\"" + linkIndex + "\">" +
                "<label class=\"field\">" +
                "<span>Texto</span>" +
                "<input type=\"text\" data-footer-column-index=\"" + columnIndex +
                "\" data-footer-link-index=\"" + linkIndex +
                "\" data-footer-link-field=\"label\" value=\"" +
                escapeHtml(linkEntry.label || "") + "\" />" +
                "</label>" +
                "<label class=\"field\">" +
                "<span>URL</span>" +
                "<input type=\"text\" data-footer-column-index=\"" + columnIndex +
                "\" data-footer-link-index=\"" + linkIndex +
                "\" data-footer-link-field=\"url\" value=\"" +
                escapeHtml(linkEntry.url || "") + "\" />" +
                "</label>" +
                "<button class=\"btn btn-ghost\" type=\"button\" data-footer-link-remove=\"" +
                columnIndex + ":" + linkIndex + "\">Quitar link</button>" +
                "</article>"
              );
            }).join("") +
            "</div>"
          )
          : "<p class=\"home-editor__hint\">Sin links en esta columna.</p>";

        return (
          "<article class=\"home-footer-column-item\" data-footer-column-editor=\"" + columnIndex + "\">" +
          "<div class=\"home-footer-column-item__top\">" +
          "<strong>Columna " + (columnIndex + 1) + "</strong>" +
          "</div>" +
          "<label class=\"field\">" +
          "<span>Titulo</span>" +
          "<input type=\"text\" data-footer-column-index=\"" + columnIndex +
          "\" data-footer-column-field=\"title\" value=\"" +
          escapeHtml(column.title || "") + "\" />" +
          "</label>" +
          linksHtml +
          "<button class=\"btn btn-ghost\" type=\"button\" data-footer-link-add=\"" + columnIndex +
          "\">Agregar link</button>" +
          "</article>"
        );
      }).join("") +
      "</div>"
    );
  }

  function renderHomePathToggle(homePath, label, checked, options) {
    options = options || {};
    var toggleId = "home-toggle-" + String(homePath || "toggle")
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/(^-|-$)/g, "")
      .toLowerCase();

    return renderToggle({
      id: toggleId,
      label: label,
      checked: checked,
      disabled: Boolean(options.disabled),
      span: options.span || "",
      title: options.title || "",
      dataAttributes: {
        "data-home-path": homePath
      }
    });
  }

  function renderHomeEditor() {
    ensureHomeDraft();
    normalizeHomeEditorCollections();
    renderSidebarHomepageAccordion();

    var home = state.drafts.home;
    var announcementTypeOptions = HOME_ANNOUNCEMENT_TYPES.map(function (typeValue) {
      return "<option value=\"" + typeValue + "\"" +
        (home.announcements.type === typeValue ? " selected" : "") +
        ">" + typeValue + "</option>";
    }).join("");

    var sectionsHtml = [
      "<section class=\"home-section\" id=\"" + getHomeSectionAnchorId("navbar") +
        "\" data-home-anchor=\"true\" data-home-section-id=\"navbar\">",
      "<div class=\"home-section__header\"><h3>Navbar</h3><p>" +
        escapeHtml(getHomeSectionMeta("navbar").description) + "</p></div>",
      "<div class=\"home-section__grid\">",
      renderHomePathToggle("sections.navbar", "Mostrar navbar principal", home.sections.navbar, { span: "full" }),
      "<label class=\"field\"><span>Boton label</span><input type=\"text\" data-home-path=\"navbar.cta.label\" value=\"" +
        escapeHtml(home.navbar.cta.label) + "\" /></label>",
      "<label class=\"field\"><span>Boton URL</span><input type=\"text\" data-home-path=\"navbar.cta.url\" value=\"" +
        escapeHtml(home.navbar.cta.url) + "\" /></label>",
      "<label class=\"field\"><span>Boton icon path</span><input type=\"text\" data-home-path=\"navbar.cta.icon\" value=\"" +
        escapeHtml(home.navbar.cta.icon) + "\" /></label>",
      "<label class=\"field\"><span>Boton title accesible</span><input type=\"text\" data-home-path=\"navbar.cta.title\" value=\"" +
        escapeHtml(home.navbar.cta.title) + "\" /></label>",
      "<div data-span=\"full\">" + buildNavbarLinksListHtml() + "</div>",
      "<button class=\"btn btn-ghost\" data-span=\"full\" type=\"button\" data-navbar-add-button>Agregar link</button>",
      "</div></section>",

      "<section class=\"home-section\" id=\"" + getHomeSectionAnchorId("hero") +
        "\" data-home-anchor=\"true\" data-home-section-id=\"hero\">",
      "<div class=\"home-section__header\"><h3>Hero</h3><p>" +
        escapeHtml(getHomeSectionMeta("hero").description) + "</p></div>",
      "<div class=\"home-section__grid\">",
      renderHomePathToggle("sections.hero", "Mostrar seccion Hero", home.sections.hero, { span: "full" }),
      "<label class=\"field\" data-span=\"full\"><span>Titulo</span><input type=\"text\" data-home-path=\"hero.title\" value=\"" +
        escapeHtml(home.hero.title) + "\" /></label>",
      "<label class=\"field\" data-span=\"full\"><span>Subtitulo</span><textarea rows=\"3\" data-home-path=\"hero.subtitle\">" +
        escapeHtml(home.hero.subtitle) + "</textarea></label>",
      "<label class=\"field\" data-span=\"full\"><span>Background image</span><input type=\"text\" data-home-path=\"hero.backgroundImage\" value=\"" +
        escapeHtml(home.hero.backgroundImage) + "\" /></label>",
      "<label class=\"field\"><span>CTA Primario label</span><input type=\"text\" data-home-path=\"hero.ctaPrimary.label\" value=\"" +
        escapeHtml(home.hero.ctaPrimary.label) + "\" /></label>",
      "<label class=\"field\"><span>CTA Primario URL</span><input type=\"text\" data-home-path=\"hero.ctaPrimary.url\" value=\"" +
        escapeHtml(home.hero.ctaPrimary.url) + "\" /></label>",
      "<label class=\"field\"><span>CTA Secundario label</span><input type=\"text\" data-home-path=\"hero.ctaSecondary.label\" value=\"" +
        escapeHtml(home.hero.ctaSecondary.label) + "\" /></label>",
      "<label class=\"field\"><span>CTA Secundario URL</span><input type=\"text\" data-home-path=\"hero.ctaSecondary.url\" value=\"" +
        escapeHtml(home.hero.ctaSecondary.url) + "\" /></label>",
      "</div></section>",

      "<section class=\"home-section\" id=\"" + getHomeSectionAnchorId("featured") +
        "\" data-home-anchor=\"true\" data-home-section-id=\"featured\">",
      "<div class=\"home-section__header\"><h3>Featured</h3><p>" +
        escapeHtml(getHomeSectionMeta("featured").description) + "</p></div>",
      "<div class=\"home-section__grid\">",
      renderHomePathToggle("sections.popular", "Mostrar seccion Featured", home.sections.popular, { span: "full" }),
      "<label class=\"field\"><span>Titulo</span><input type=\"text\" data-home-path=\"popular.title\" value=\"" +
        escapeHtml(home.popular.title) + "\" /></label>",
      "<label class=\"field\"><span>Subtitulo</span><input type=\"text\" data-home-path=\"popular.subtitle\" value=\"" +
        escapeHtml(home.popular.subtitle) + "\" /></label>",
      "<label class=\"field\"><span>Limite visible</span><input type=\"number\" min=\"1\" max=\"" + HOME_FEATURED_LIMIT +
        "\" data-home-path=\"popular.limit\" data-home-value-type=\"number\" value=\"" +
        escapeHtml(String(home.popular.limit)) + "\" /></label>",
      "<label class=\"field\" data-span=\"full\"><span>Agregar item a featuredIds</span>" +
        "<div class=\"field-inline\"><select data-featured-add-select>" + buildFeaturedOptionsHtml() +
        "</select><button class=\"btn btn-ghost\" type=\"button\" data-featured-add-button>Agregar</button>" +
        "<button class=\"btn btn-ghost\" type=\"button\" data-featured-sync-button>Sync desde toggle Featured</button></div></label>",
      "<div data-span=\"full\">" + buildFeaturedListHtml() + "</div>",
      "<p class=\"home-editor__hint\" data-span=\"full\">Maximo " + HOME_FEATURED_LIMIT + " items.</p>",
      "</div></section>",

      "<section class=\"home-section\" id=\"" + getHomeSectionAnchorId("delivery") +
        "\" data-home-anchor=\"true\" data-home-section-id=\"delivery\">",
      "<div class=\"home-section__header\"><h3>Delivery</h3><p>" +
        escapeHtml(getHomeSectionMeta("delivery").description) + "</p></div>",
      "<div class=\"home-section__grid\">",
      renderHomePathToggle("sections.delivery", "Mostrar seccion Delivery", home.sections.delivery, { span: "full" }),
      "<label class=\"field\" data-span=\"full\"><span>Titulo</span><input type=\"text\" data-home-path=\"delivery.title\" value=\"" +
        escapeHtml(home.delivery.title) + "\" /></label>",
      "<label class=\"field\" data-span=\"full\"><span>Subtitulo</span><textarea rows=\"3\" data-home-path=\"delivery.subtitle\">" +
        escapeHtml(home.delivery.subtitle) + "</textarea></label>",
      "<label class=\"field\"><span>PedidosYa URL</span><input type=\"text\" data-home-path=\"delivery.platforms.pedidosya.url\" value=\"" +
        escapeHtml(home.delivery.platforms.pedidosya.url) + "\" /></label>",
      "<label class=\"field\"><span>PedidosYa icon path</span><input type=\"text\" data-home-path=\"delivery.platforms.pedidosya.icon\" value=\"" +
        escapeHtml(home.delivery.platforms.pedidosya.icon) + "\" /></label>",
      "<label class=\"field\"><span>PedidosYa icon size</span><input type=\"number\" min=\"" + HOME_DELIVERY_ICON_MIN_SIZE +
        "\" max=\"" + HOME_DELIVERY_ICON_MAX_SIZE + "\" data-home-path=\"delivery.platforms.pedidosya.iconSize\" data-home-value-type=\"number\" value=\"" +
        escapeHtml(String(home.delivery.platforms.pedidosya.iconSize)) + "\" /></label>",
      "<label class=\"field\"><span>Uber Eats URL</span><input type=\"text\" data-home-path=\"delivery.platforms.ubereats.url\" value=\"" +
        escapeHtml(home.delivery.platforms.ubereats.url) + "\" /></label>",
      "<label class=\"field\"><span>Uber Eats icon path</span><input type=\"text\" data-home-path=\"delivery.platforms.ubereats.icon\" value=\"" +
        escapeHtml(home.delivery.platforms.ubereats.icon) + "\" /></label>",
      "<label class=\"field\"><span>Uber Eats icon size</span><input type=\"number\" min=\"" + HOME_DELIVERY_ICON_MIN_SIZE +
        "\" max=\"" + HOME_DELIVERY_ICON_MAX_SIZE + "\" data-home-path=\"delivery.platforms.ubereats.iconSize\" data-home-value-type=\"number\" value=\"" +
        escapeHtml(String(home.delivery.platforms.ubereats.iconSize)) + "\" /></label>",
      "<label class=\"field\"><span>Takeout URL</span><input type=\"text\" data-home-path=\"delivery.platforms.takeout.url\" value=\"" +
        escapeHtml(home.delivery.platforms.takeout.url) + "\" /></label>",
      "<label class=\"field\"><span>Takeout icon path</span><input type=\"text\" data-home-path=\"delivery.platforms.takeout.icon\" value=\"" +
        escapeHtml(home.delivery.platforms.takeout.icon) + "\" /></label>",
      "<label class=\"field\"><span>Takeout icon size</span><input type=\"number\" min=\"" + HOME_DELIVERY_ICON_MIN_SIZE +
        "\" max=\"" + HOME_DELIVERY_ICON_MAX_SIZE + "\" data-home-path=\"delivery.platforms.takeout.iconSize\" data-home-value-type=\"number\" value=\"" +
        escapeHtml(String(home.delivery.platforms.takeout.iconSize)) + "\" /></label>",
      "<label class=\"field\"><span>WhatsApp URL</span><input type=\"text\" data-home-path=\"delivery.platforms.whatsapp.url\" value=\"" +
        escapeHtml(home.delivery.platforms.whatsapp.url) + "\" /></label>",
      "<label class=\"field\"><span>WhatsApp icon path</span><input type=\"text\" data-home-path=\"delivery.platforms.whatsapp.icon\" value=\"" +
        escapeHtml(home.delivery.platforms.whatsapp.icon) + "\" /></label>",
      "<label class=\"field\"><span>WhatsApp icon size</span><input type=\"number\" min=\"" + HOME_DELIVERY_ICON_MIN_SIZE +
        "\" max=\"" + HOME_DELIVERY_ICON_MAX_SIZE + "\" data-home-path=\"delivery.platforms.whatsapp.iconSize\" data-home-value-type=\"number\" value=\"" +
        escapeHtml(String(home.delivery.platforms.whatsapp.iconSize)) + "\" /></label>",
      "</div></section>",

      "<section class=\"home-section\" id=\"" + getHomeSectionAnchorId("testimonials") +
        "\" data-home-anchor=\"true\" data-home-section-id=\"testimonials\">",
      "<div class=\"home-section__header\"><h3>Testimonials</h3><p>" +
        escapeHtml(getHomeSectionMeta("testimonials").description) + "</p></div>",
      "<div class=\"home-section__grid\">",
      renderHomePathToggle("sections.testimonials", "Mostrar bloque Testimonials", home.sections.testimonials),
      renderHomePathToggle("testimonials.enabled", "Testimonials habilitado", home.testimonials.enabled),
      "<label class=\"field\" data-span=\"full\"><span>Titulo</span><input type=\"text\" data-home-path=\"testimonials.title\" value=\"" +
        escapeHtml(home.testimonials.title) + "\" /></label>",
      "<label class=\"field\" data-span=\"full\"><span>Subtitulo</span><textarea rows=\"3\" data-home-path=\"testimonials.subtitle\">" +
        escapeHtml(home.testimonials.subtitle) + "</textarea></label>",
      "<div data-span=\"full\">" + buildTestimonialsListHtml() + "</div>",
      "<button class=\"btn btn-ghost\" data-span=\"full\" type=\"button\" data-testimonial-add-button>Agregar testimonio</button>",
      "<p class=\"home-editor__hint\" data-span=\"full\">Grid homepage: 3 columnas x 3 filas (maximo " +
        HOME_TESTIMONIALS_LIMIT + ").</p>",
      "</div></section>",

      "<section class=\"home-section\" id=\"" + getHomeSectionAnchorId("events") +
        "\" data-home-anchor=\"true\" data-home-section-id=\"events\">",
      "<div class=\"home-section__header\"><h3>Eventos</h3><p>" +
        escapeHtml(getHomeSectionMeta("events").description) + "</p></div>",
      "<div class=\"home-section__grid\">",
      renderHomePathToggle("sections.events", "Mostrar seccion Eventos", home.sections.events),
      renderHomePathToggle("eventsPreview.enabled", "Eventos habilitados", home.eventsPreview.enabled),
      "<label class=\"field\" data-span=\"full\"><span>Titulo</span><input type=\"text\" data-home-path=\"eventsPreview.title\" value=\"" +
        escapeHtml(home.eventsPreview.title) + "\" /></label>",
      "<label class=\"field\" data-span=\"full\"><span>Subtitulo</span><textarea rows=\"3\" data-home-path=\"eventsPreview.subtitle\">" +
        escapeHtml(home.eventsPreview.subtitle) + "</textarea></label>",
      "<label class=\"field\"><span>Limite tabs</span><input type=\"number\" min=\"1\" max=\"6\" data-home-path=\"eventsPreview.limit\" data-home-value-type=\"number\" value=\"" +
        escapeHtml(String(home.eventsPreview.limit)) + "\" /></label>",
      "<p class=\"home-editor__hint\" data-span=\"full\">Los eventos se renderizan desde eventsPreview.items.</p>",
      "<div data-span=\"full\">" + buildEventsListHtml() + "</div>",
      "<button class=\"btn btn-ghost\" data-span=\"full\" type=\"button\" data-event-add-button>Agregar evento</button>",
      "</div></section>",

      "<section class=\"home-section\" id=\"" + getHomeSectionAnchorId("footer") +
        "\" data-home-anchor=\"true\" data-home-section-id=\"footer\">",
      "<div class=\"home-section__header\"><h3>Footer</h3><p>" +
        escapeHtml(getHomeSectionMeta("footer").description) + "</p></div>",
      "<div class=\"home-section__grid\">",
      renderHomePathToggle("sections.footer", "Mostrar Footer", home.sections.footer),
      renderHomePathToggle("footer.enabled", "Footer habilitado", home.footer.enabled),
      "<label class=\"field\"><span>CTA marron · texto</span><input type=\"text\" data-home-path=\"footer.cta.label\" value=\"" +
        escapeHtml(home.footer.cta.label || "") + "\" /></label>",
      "<label class=\"field\"><span>CTA marron · URL destino</span><input type=\"text\" data-home-path=\"footer.cta.url\" value=\"" +
        escapeHtml(home.footer.cta.url || "") + "\" /></label>",
      "<label class=\"field\"><span>Instagram URL</span><input type=\"text\" data-home-path=\"footer.socials.instagram\" value=\"" +
        escapeHtml(home.footer.socials.instagram || "") + "\" /></label>",
      "<label class=\"field\"><span>TikTok URL</span><input type=\"text\" data-home-path=\"footer.socials.tiktok\" value=\"" +
        escapeHtml(home.footer.socials.tiktok || "") + "\" /></label>",
      "<label class=\"field\"><span>TripAdvisor URL</span><input type=\"text\" data-home-path=\"footer.socials.tripadvisor\" value=\"" +
        escapeHtml(home.footer.socials.tripadvisor || "") + "\" /></label>",
      "<div data-span=\"full\">" + buildFooterColumnsEditorHtml() + "</div>",
      "<label class=\"field\" data-span=\"full\"><span>Nota interna (opcional)</span><textarea rows=\"2\" data-home-path=\"footer.note\">" +
        escapeHtml(home.footer.note || "") + "</textarea></label>",
      "<p class=\"home-editor__hint\" data-span=\"full\">Address/phone siguen desde restaurant.json. Aqui editas columnas, links, CTA y socials del footer.</p>",
      "</div></section>",

      "<section class=\"home-section\" id=\"" + getHomeSectionAnchorId("announcements") +
        "\" data-home-anchor=\"true\" data-home-section-id=\"announcements\">",
      "<div class=\"home-section__header\"><h3>Announcements</h3><p>" +
        escapeHtml(getHomeSectionMeta("announcements").description) + "</p></div>",
      "<div class=\"home-section__grid\">",
      renderHomePathToggle("sections.announcements", "Mostrar seccion anuncio", home.sections.announcements),
      renderHomePathToggle("announcements.enabled", "Anuncio habilitado", home.announcements.enabled),
      "<label class=\"field\" data-span=\"full\"><span>Mensaje</span><textarea rows=\"3\" data-home-path=\"announcements.message\">" +
        escapeHtml(home.announcements.message) + "</textarea></label>",
      "<label class=\"field\"><span>Tipo</span><select data-home-path=\"announcements.type\">" +
        announcementTypeOptions + "</select></label>",
      "<label class=\"field\"><span>Link</span><input type=\"text\" data-home-path=\"announcements.link\" value=\"" +
        escapeHtml(home.announcements.link) + "\" /></label>",
      "</div></section>"
    ].join("");

    elements.homeSectionsContent.innerHTML = sectionsHtml;
    bindToggles(elements.homeSectionsContent);
    refreshHomeScrollAnchors();

    if (!state.homeActiveSectionId) {
      state.homeActiveSectionId = HOME_EDITOR_SECTIONS[0].id;
    }

    setActiveHomeSection(state.homeActiveSectionId, { force: true });
  }

  function saveHomeEditorChanges() {
    ensureHomeDraft();
    normalizeHomeEditorCollections();
    persistDraftsToLocalStorage();
    updateDashboardMetrics();
    renderHomeEditor();
    setDraftsBanner(true, "Drafts locales activos (Clear drafts | Export)");
    saveDraftsToLocalFiles();
    setDataStatus("HomePage guardado en drafts locales.");
    setHomeEditorStatus("HomePage guardado en drafts.");
  }

  function openHomePageEditor(options) {
    options = options || {};
    if (!options.skipRoute) {
      navigateToRoute("/homepage", { replace: Boolean(options.replaceRoute) });
      return;
    }

    if (!state.hasDataLoaded) {
      ensureDataLoaded(false);
      return;
    }

    ensureHomeDraft();
    setActivePanel("home-editor");
    renderHomeEditor();
    setMenuBrowserStatus("");
    setItemEditorStatus("");
    showItemEditorErrors([]);
    setHomeEditorStatus("");
    setIngredientsEditorStatus("");
    setCategoriesEditorStatus("");
  }

  function createIngredientsEditorDraft(ingredientId, sourceEntry) {
    var source = sourceEntry && typeof sourceEntry === "object" ? sourceEntry : {};
    var aliasesRaw = Array.isArray(source.aliases) ? source.aliases : [];
    var tagsRaw = Array.isArray(source.tags) ? source.tags : [];
    var allergensRaw = Array.isArray(source.allergens) ? source.allergens : [];

    var aliases = [];
    aliasesRaw.forEach(function (alias) {
      var normalizedAlias = normalizeIngredientAliasValue(alias);
      if (!normalizedAlias) return;
      if (!aliases.includes(normalizedAlias)) {
        aliases.push(normalizedAlias);
      }
    });

    var tags = [];
    tagsRaw.forEach(function (tagId) {
      var normalizedTagId = String(tagId || "").trim();
      if (!normalizedTagId) return;
      if (!tags.includes(normalizedTagId)) {
        tags.push(normalizedTagId);
      }
    });

    var allergens = [];
    allergensRaw.forEach(function (allergenId) {
      var normalizedAllergenId = String(allergenId || "").trim();
      if (!normalizedAllergenId) return;
      if (!allergens.includes(normalizedAllergenId)) {
        allergens.push(normalizedAllergenId);
      }
    });

    return {
      id: String(ingredientId || "").trim(),
      label: String(source.label || "").trim(),
      icon: String(source.icon || "").trim(),
      aliases: aliases,
      tags: tags,
      allergens: allergens
    };
  }

  function createIngredientsIconEditorDraft(iconKey, sourceEntry) {
    var source = sourceEntry && typeof sourceEntry === "object" ? sourceEntry : {};
    var covers = Array.isArray(source.covers) ? source.covers.slice() : [];
    return {
      key: String(iconKey || "").trim(),
      label: String(source.label || "").trim(),
      path: String(source.icon || "").trim(),
      covers: covers
    };
  }

  function normalizeIngredientsTab(tab) {
    return String(tab || "").trim() === "icons" ? "icons" : "ingredients";
  }

  function getIngredientsTabPanels() {
    return [
      elements.ingredientsCatalogView,
      elements.ingredientsDetailView,
      elements.ingredientsIconsCatalogView,
      elements.ingredientsIconsDetailView
    ].filter(Boolean);
  }

  function getIngredientsTabVisibilityMap(isIconsTab, isIngredientsEditView, isIconsEditView) {
    var map = {};
    map["ingredients-catalog-view"] = !isIconsTab && !isIngredientsEditView;
    map["ingredients-detail-view"] = !isIconsTab && isIngredientsEditView;
    map["ingredients-icons-catalog-view"] = isIconsTab && !isIconsEditView;
    map["ingredients-icons-detail-view"] = isIconsTab && isIconsEditView;
    return map;
  }

  function applyIngredientsTabVisibility(visibilityMap) {
    var targetMap = visibilityMap || {};
    getIngredientsTabPanels().forEach(function (panelElement) {
      var shouldShow = Boolean(targetMap[panelElement.id]);
      panelElement.classList.toggle("is-hidden", !shouldShow);
    });
  }

  function areIngredientsTabVisibilityMapsEqual(leftMap, rightMap) {
    var left = leftMap || {};
    var right = rightMap || {};
    var panelIds = [
      "ingredients-catalog-view",
      "ingredients-detail-view",
      "ingredients-icons-catalog-view",
      "ingredients-icons-detail-view"
    ];
    return panelIds.every(function (panelId) {
      return Boolean(left[panelId]) === Boolean(right[panelId]);
    });
  }

  function clearIngredientsTabSwitchAnimation() {
    if (state.ingredientsEditor.tabAnimationFrame) {
      window.cancelAnimationFrame(state.ingredientsEditor.tabAnimationFrame);
      state.ingredientsEditor.tabAnimationFrame = 0;
    }
    if (state.ingredientsEditor.tabAnimationTimer) {
      window.clearTimeout(state.ingredientsEditor.tabAnimationTimer);
      state.ingredientsEditor.tabAnimationTimer = 0;
    }

    getIngredientsTabPanels().forEach(function (panelElement) {
      panelElement.classList.remove("is-tab-entering");
      panelElement.classList.remove("is-tab-entering-active");
      panelElement.classList.remove("is-tab-leaving");
    });
    state.ingredientsEditor.tabAnimationTargetVisibilityMap = null;
  }

  function setIngredientsTabsVisualState(tab) {
    if (!elements.ingredientsTabsNav) return;
    var normalizedTab = normalizeIngredientsTab(tab);
    var tabIndex = normalizedTab === "icons" ? 1 : 0;
    elements.ingredientsTabsNav.style.setProperty("--ingredients-tab-index", String(tabIndex));
  }

  function animateIngredientsTabSwitch(targetVisibilityMap) {
    var visibilityMap = targetVisibilityMap || {};
    var panels = getIngredientsTabPanels();
    if (!panels.length) {
      applyIngredientsTabVisibility(visibilityMap);
      return;
    }

    clearIngredientsTabSwitchAnimation();
    state.ingredientsEditor.tabAnimationTargetVisibilityMap = Object.assign({}, visibilityMap);

    var outgoingPanels = [];
    var incomingPanels = [];

    panels.forEach(function (panelElement) {
      var shouldShow = Boolean(visibilityMap[panelElement.id]);
      var isVisibleNow = !panelElement.classList.contains("is-hidden");
      if (isVisibleNow && !shouldShow) {
        outgoingPanels.push(panelElement);
      }
      if (shouldShow) {
        incomingPanels.push(panelElement);
      }
    });

    incomingPanels.forEach(function (panelElement) {
      panelElement.classList.remove("is-hidden");
      panelElement.classList.add("is-tab-entering");
      panelElement.classList.remove("is-tab-entering-active");
    });

    outgoingPanels.forEach(function (panelElement) {
      panelElement.classList.remove("is-hidden");
      panelElement.classList.remove("is-tab-leaving");
    });

    state.ingredientsEditor.tabAnimationFrame = window.requestAnimationFrame(function () {
      state.ingredientsEditor.tabAnimationFrame = window.requestAnimationFrame(function () {
        state.ingredientsEditor.tabAnimationFrame = 0;
        outgoingPanels.forEach(function (panelElement) {
          panelElement.classList.add("is-tab-leaving");
        });
        incomingPanels.forEach(function (panelElement) {
          panelElement.classList.add("is-tab-entering-active");
        });
      });
    });

    state.ingredientsEditor.tabAnimationTimer = window.setTimeout(function () {
      panels.forEach(function (panelElement) {
        panelElement.classList.remove("is-tab-entering");
        panelElement.classList.remove("is-tab-entering-active");
        panelElement.classList.remove("is-tab-leaving");
      });
      applyIngredientsTabVisibility(visibilityMap);
      state.ingredientsEditor.tabAnimationTargetVisibilityMap = null;
      state.ingredientsEditor.tabAnimationTimer = 0;
    }, 520);
  }

  function setHashSilently(path) {
    var normalizedPath = String(path || "").trim();
    if (!normalizedPath) return;
    if (normalizedPath.charAt(0) !== "/") {
      normalizedPath = "/" + normalizedPath;
    }
    var targetHash = "#" + normalizedPath;
    if (window.location.hash === targetHash) return;
    var base = window.location.pathname + window.location.search;
    window.history.replaceState({}, document.title, base + targetHash);
  }

  function renderIngredientsEditorValidationSummary(report) {
    if (!elements.ingredientsValidationSummary && !elements.ingredientsIconValidationSummary) return;
    var safeReport = report || state.ingredientsEditor.validationReport || {
      errors: [],
      warnings: [],
      ingredientIssuesById: {},
      iconIssuesByKey: {}
    };

    var summary = "Errores: " + safeReport.errors.length + " · Warnings: " + safeReport.warnings.length;
    var selectedIssues = null;
    if (state.ingredientsEditor.tab === "icons") {
      var selectedIconKey = String(state.ingredientsEditor.selectedIconKey || "").trim();
      selectedIssues = selectedIconKey && safeReport.iconIssuesByKey
        ? safeReport.iconIssuesByKey[selectedIconKey]
        : null;
    } else {
      var selectedId = state.ingredientsEditor.selectedIngredientId;
      selectedIssues = selectedId && safeReport.ingredientIssuesById
        ? safeReport.ingredientIssuesById[selectedId]
        : null;
    }
    if (selectedIssues) {
      var selectedCount = selectedIssues.errors.length + selectedIssues.warnings.length;
      if (selectedCount) {
        summary += " · Seleccionado: " + selectedCount;
      }
    }

    [elements.ingredientsValidationSummary, elements.ingredientsIconValidationSummary]
      .filter(Boolean)
      .forEach(function (summaryElement) {
        summaryElement.textContent = summary;
        summaryElement.classList.toggle(
          "is-warning",
          safeReport.errors.length > 0 || safeReport.warnings.length > 0
        );
      });
  }

  function renderIngredientsGlobalWarnings(report) {
    if (!elements.ingredientsGlobalWarning) return;
    var safeReport = report || state.ingredientsEditor.validationReport || {
      menuReferenceReport: { invalidItems: [], invalidReferencesCount: 0 }
    };
    var menuReferenceReport = safeReport.menuReferenceReport || {
      invalidItems: [],
      invalidReferencesCount: 0
    };

    if (!menuReferenceReport.invalidItems.length) {
      elements.ingredientsGlobalWarning.innerHTML =
        "Integridad menu ↔ ingredients: sin referencias invalidas.";
      elements.ingredientsGlobalWarning.classList.remove("is-warning");
      return;
    }

    var previewItems = menuReferenceReport.invalidItems.slice(0, 5).map(function (entry) {
      return "<li><strong>" + escapeHtml(entry.label || entry.id) + "</strong> · " +
        escapeHtml((entry.unknownIngredients || []).join(", ")) + "</li>";
    }).join("");

    var tail = menuReferenceReport.invalidItems.length > 5
      ? "<li>... y " + (menuReferenceReport.invalidItems.length - 5) + " items mas</li>"
      : "";

    elements.ingredientsGlobalWarning.innerHTML =
      "<strong>Warning:</strong> " +
      menuReferenceReport.invalidItems.length + " items del menu tienen ingredientes invalidos (" +
      menuReferenceReport.invalidReferencesCount + " refs)." +
      "<ul>" + previewItems + tail + "</ul>";
    elements.ingredientsGlobalWarning.classList.add("is-warning");
  }

  function getIngredientMenuImpact(ingredientId) {
    var normalizedId = String(ingredientId || "").trim();
    if (!normalizedId) return [];

    var impacted = [];
    getAllMenuItems().forEach(function (entry) {
      var item = entry && entry.item ? entry.item : null;
      if (!item || !Array.isArray(item.ingredients)) return;
      if (!item.ingredients.includes(normalizedId)) return;
      impacted.push({
        id: item.id || "",
        label: item.name || item.id || "Item sin nombre",
        imagePath: resolveCardImageForItem(item)
      });
    });
    return impacted;
  }

  function getSortedIngredientIds() {
    ensureIngredientsDraft();
    return Object.keys(state.drafts.ingredients.ingredients || {}).sort(function (a, b) {
      var ingredientA = state.drafts.ingredients.ingredients[a] || {};
      var ingredientB = state.drafts.ingredients.ingredients[b] || {};
      var labelA = ingredientA.label || a;
      var labelB = ingredientB.label || b;
      return normalizeText(labelA).localeCompare(normalizeText(labelB));
    });
  }

  function getIngredientsCategoryAnchorId(categoryId) {
    return "ingredients-category-" + String(categoryId || "").trim();
  }

  function normalizeIngredientCategoryId(categoryId) {
    var normalized = String(categoryId || "").trim();
    if (!normalized) return "otros";
    var exists = INGREDIENT_CATEGORY_DEFINITIONS.some(function (entry) {
      return entry.id === normalized;
    });
    return exists ? normalized : "otros";
  }

  function getIngredientCategoryId(ingredientId, ingredient, ingredientsSource) {
    var normalizedId = String(ingredientId || "").trim();
    if (normalizedId && INGREDIENT_CATEGORY_BY_ID[normalizedId]) {
      return normalizeIngredientCategoryId(INGREDIENT_CATEGORY_BY_ID[normalizedId]);
    }

    var iconValue = ingredient && typeof ingredient.icon === "string"
      ? ingredient.icon.trim()
      : "";
    if (iconValue && INGREDIENT_CATEGORY_BY_ICON[iconValue]) {
      return normalizeIngredientCategoryId(INGREDIENT_CATEGORY_BY_ICON[iconValue]);
    }

    var normalizedLabel = ingredient && ingredient.label
      ? String(ingredient.label).trim()
      : "";
    var aliases = ingredient && Array.isArray(ingredient.aliases)
      ? ingredient.aliases.join(" ")
      : "";
    var normalizedIconPath = resolveIngredientIconPath(ingredient, ingredientsSource);
    var haystack = normalizeText(
      normalizedId + " " +
      normalizedLabel + " " +
      aliases + " " +
      iconValue + " " +
      normalizedIconPath
    );

    for (var i = 0; i < INGREDIENT_CATEGORY_KEYWORDS.length; i += 1) {
      var keywordGroup = INGREDIENT_CATEGORY_KEYWORDS[i];
      if (!keywordGroup || !Array.isArray(keywordGroup.keywords)) continue;
      var matched = keywordGroup.keywords.some(function (keyword) {
        return keyword && haystack.includes(normalizeText(keyword));
      });
      if (matched) {
        return normalizeIngredientCategoryId(keywordGroup.categoryId);
      }
    }

    return "otros";
  }

  function getIngredientIconGroupingKey(ingredient, ingredientsSource) {
    var iconValue = ingredient && typeof ingredient.icon === "string"
      ? ingredient.icon.trim()
      : "";
    if (iconValue) {
      return "icon::" + normalizeText(iconValue);
    }

    var resolvedPath = resolveIngredientIconPath(ingredient, ingredientsSource);
    if (resolvedPath) {
      var relativePath = toRelativeAssetPath(resolvedPath) || resolvedPath;
      return "path::" + normalizeText(relativePath);
    }

    return "zzzz::missing_icon";
  }

  function setActiveIngredientsCategory(categoryId) {
    var normalizedId = String(categoryId || "").trim();
    state.ingredientsEditor.activeCategoryId = normalizedId;
    if (normalizedId) {
      setNavigationCurrentSection("ingredients:" + normalizedId);
    } else if (state.currentPanel === "ingredients-editor") {
      setNavigationCurrentSection("");
    }
    if (!elements.sidebarIngredientsAccordion) return;

    var buttons = elements.sidebarIngredientsAccordion.querySelectorAll("[data-scroll-ingredients-category]");
    Array.prototype.forEach.call(buttons, function (button) {
      var buttonCategoryId = String(button.getAttribute("data-scroll-ingredients-category") || "").trim();
      button.classList.toggle("is-active", Boolean(normalizedId && buttonCategoryId === normalizedId));
    });
  }

  function renderSidebarIngredientsAccordion(categorySections) {
    if (!elements.sidebarIngredientsAccordion) return;
    if (!state.hasDataLoaded) {
      elements.sidebarIngredientsAccordion.innerHTML = "";
      return;
    }

    var sections = Array.isArray(categorySections) ? categorySections : [];
    if (!sections.length) {
      elements.sidebarIngredientsAccordion.innerHTML = "";
      return;
    }

    var html = sections.map(function (section, sectionIndex) {
      var isActive = state.ingredientsEditor.activeCategoryId === section.id;
      var buttonClass = "sidebar-accordion-category__toggle" + (isActive ? " is-active" : "");
      return (
        "<div class=\"sidebar-accordion-category\" style=\"--sidebar-stagger-index:" + sectionIndex + "\" data-ingredients-category-id=\"" + escapeHtml(section.id) + "\">" +
        "<button class=\"" + buttonClass + "\" type=\"button\" data-scroll-ingredients-category=\"" +
        escapeHtml(section.id) + "\">" +
        "<span>" + escapeHtml(section.label) + "</span>" +
        "</button>" +
        "</div>"
      );
    }).join("");

    elements.sidebarIngredientsAccordion.innerHTML = html;
    syncSidebarAccordionCategoryHeights(elements.sidebarIngredientsAccordion);
  }

  function scrollToIngredientsCategory(categoryId, options) {
    options = options || {};
    var normalizedId = String(categoryId || "").trim();
    if (!normalizedId) return;

    var section = document.getElementById(getIngredientsCategoryAnchorId(normalizedId));
    if (!section) return;

    setActiveIngredientsCategory(normalizedId);
    var targetTop = window.scrollY + section.getBoundingClientRect().top - UX_TIMING.anchorScrollOffsetPx;
    var scrollBehavior = options.instant ? "auto" : "smooth";
    var lockDurationMs = getProgrammaticScrollLockDuration(targetTop, scrollBehavior);
    runWithProgrammaticScrollLock(function () {
      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: scrollBehavior
      });
    }, lockDurationMs, "ingredients:" + normalizedId);
    if (typeof section.focus === "function") {
      try {
        section.focus({ preventScroll: true });
      } catch (_error) {
        section.focus();
      }
    }
  }

  function refreshIngredientsScrollAnchors() {
    if (!elements.ingredientsList) {
      state.ingredientsAnchorTargets = [];
      return;
    }
    state.ingredientsAnchorTargets = Array.prototype.slice
      .call(elements.ingredientsList.querySelectorAll("[data-ingredients-anchor='true']"))
      .map(function (anchorElement) {
        return {
          categoryId: anchorElement.getAttribute("data-ingredients-category-id") || "",
          element: anchorElement
        };
      });
  }

  function updateIngredientsScrollSpy(force) {
    if (state.currentPanel !== "ingredients-editor") return;
    if (state.visiblePanel !== "ingredients-editor") return;
    if (!canRunScrollSpy(Boolean(force))) return;
    if (isSidebarAccordionOpening("ingredients")) return;
    if (state.ingredientsEditor.tab !== "ingredients") return;
    if (state.ingredientsEditor.view !== "catalog") return;
    if (!state.ingredientsAnchorTargets.length) return;

    var activeAnchor = findActiveAnchorTarget(
      state.ingredientsAnchorTargets,
      UX_TIMING.scrollSpyThresholdPx
    );
    if (!activeAnchor) return;

    setActiveIngredientsCategory(activeAnchor.categoryId);
  }

  function requestIngredientsScrollSpyUpdate() {
    if (state.currentPanel !== "ingredients-editor") return;
    if (state.visiblePanel !== "ingredients-editor") return;
    if (state.isPanelTransitioning) return;
    if (!isNavigationStateIdle()) return;
    if (isSidebarAccordionOpening("ingredients")) return;
    if (state.ingredientsEditor.tab !== "ingredients") return;
    if (state.ingredientsEditor.view !== "catalog") return;
    if (state.ingredientsScrollSpyFrame) return;
    state.ingredientsScrollSpyFrame = window.requestAnimationFrame(function () {
      state.ingredientsScrollSpyFrame = 0;
      updateIngredientsScrollSpy(false);
    });
  }

  function getCategoriesSectionAnchorId(categoryId) {
    return "categories-section-" + cssSafe(categoryId);
  }

  function updateSidebarCategoriesAccordionActiveClasses() {
    if (!elements.sidebarCategoriesAccordion) return;
    var activeCategoryId = String(state.categoriesEditor.activeCategoryId || "").trim();
    var buttons = elements.sidebarCategoriesAccordion.querySelectorAll("[data-scroll-categories-section]");
    Array.prototype.forEach.call(buttons, function (button) {
      var sectionId = String(button.getAttribute("data-scroll-categories-section") || "").trim();
      button.classList.toggle("is-active", Boolean(activeCategoryId && sectionId === activeCategoryId));
    });
  }

  function updateCategoriesCardsActiveClasses() {
    if (!elements.categoriesCardsContent) return;
    var activeCategoryId = String(state.categoriesEditor.activeCategoryId || "").trim();
    var cards = elements.categoriesCardsContent.querySelectorAll("[data-categories-card-id]");
    Array.prototype.forEach.call(cards, function (card) {
      var cardId = String(card.getAttribute("data-categories-card-id") || "").trim();
      card.classList.toggle("is-active", Boolean(activeCategoryId && cardId === activeCategoryId));
    });
  }

  function renderSidebarCategoriesAccordion() {
    if (!elements.sidebarCategoriesAccordion) return;
    if (!state.hasDataLoaded) {
      elements.sidebarCategoriesAccordion.innerHTML = "";
      return;
    }

    var sortedEntries = getDraftCategoriesSorted();
    if (!sortedEntries.length) {
      elements.sidebarCategoriesAccordion.innerHTML = "";
      return;
    }

    var html = sortedEntries.map(function (entry, index) {
      var category = entry.raw || {};
      var categoryId = String(category.id || "").trim();
      if (!categoryId) return "";
      var isActive = String(state.categoriesEditor.activeCategoryId || "").trim() === categoryId;
      var buttonClass = "sidebar-accordion-category__toggle" + (isActive ? " is-active" : "");
      return (
        "<div class=\"sidebar-accordion-category\" style=\"--sidebar-stagger-index:" + index + "\" data-categories-sidebar-id=\"" + escapeHtml(categoryId) + "\">" +
        "<button class=\"" + buttonClass + "\" type=\"button\" data-scroll-categories-section=\"" +
        escapeHtml(categoryId) + "\"><span>" + escapeHtml(category.label || categoryId) + "</span></button>" +
        "</div>"
      );
    }).filter(Boolean).join("");

    elements.sidebarCategoriesAccordion.innerHTML = html;
    updateSidebarCategoriesAccordionActiveClasses();
    syncSidebarAccordionCategoryHeights(elements.sidebarCategoriesAccordion);
  }

  function setActiveCategoriesSection(categoryId, options) {
    options = options || {};
    var nextCategoryId = String(categoryId || "").trim();
    if (state.categoriesEditor.activeCategoryId === nextCategoryId && !options.force) {
      return;
    }

    state.categoriesEditor.activeCategoryId = nextCategoryId;
    if (nextCategoryId) {
      setNavigationCurrentSection("categories:" + nextCategoryId);
    } else if (state.currentPanel === "categories-editor") {
      setNavigationCurrentSection("");
    }

    if (!options.skipClassUpdate) {
      updateSidebarCategoriesAccordionActiveClasses();
      updateCategoriesCardsActiveClasses();
    }
  }

  function scrollToCategoriesSection(categoryId, options) {
    options = options || {};
    var normalizedId = String(categoryId || "").trim();
    if (!normalizedId) return;

    var anchor = document.getElementById(getCategoriesSectionAnchorId(normalizedId));
    if (!anchor) return;

    setActiveCategoriesSection(normalizedId, { force: true });
    var targetTop = window.scrollY + anchor.getBoundingClientRect().top - UX_TIMING.anchorScrollOffsetPx;
    var scrollBehavior = options.instant ? "auto" : "smooth";
    var lockDurationMs = getProgrammaticScrollLockDuration(targetTop, scrollBehavior);
    runWithProgrammaticScrollLock(function () {
      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: scrollBehavior
      });
    }, lockDurationMs, "categories:" + normalizedId);
    if (typeof anchor.focus === "function") {
      try {
        anchor.focus({ preventScroll: true });
      } catch (_error) {
        anchor.focus();
      }
    }
  }

  function refreshCategoriesScrollAnchors() {
    if (!elements.categoriesCardsContent) {
      state.categoriesAnchorTargets = [];
      return;
    }

    state.categoriesAnchorTargets = Array.prototype.slice
      .call(elements.categoriesCardsContent.querySelectorAll("[data-categories-anchor='true']"))
      .map(function (anchorElement) {
        return {
          categoryId: anchorElement.getAttribute("data-categories-id") || "",
          element: anchorElement
        };
      });
  }

  function updateCategoriesScrollSpy(force) {
    if (state.currentPanel !== "categories-editor") return;
    if (state.visiblePanel !== "categories-editor") return;
    if (!canRunScrollSpy(Boolean(force))) return;
    if (isSidebarAccordionOpening("categories")) return;
    if (!state.categoriesAnchorTargets.length) return;

    var activeAnchor = findActiveAnchorTarget(
      state.categoriesAnchorTargets,
      UX_TIMING.scrollSpyThresholdPx
    );
    if (!activeAnchor) return;

    setActiveCategoriesSection(activeAnchor.categoryId, { force: Boolean(force) });
  }

  function requestCategoriesScrollSpyUpdate() {
    if (state.currentPanel !== "categories-editor") return;
    if (state.visiblePanel !== "categories-editor") return;
    if (state.isPanelTransitioning) return;
    if (!isNavigationStateIdle()) return;
    if (isSidebarAccordionOpening("categories")) return;
    if (state.categoriesScrollSpyFrame) return;

    state.categoriesScrollSpyFrame = window.requestAnimationFrame(function () {
      state.categoriesScrollSpyFrame = 0;
      updateCategoriesScrollSpy(false);
    });
  }

  function buildIngredientsCatalogSections(report) {
    ensureIngredientsDraft();
    var ingredientsSource = state.drafts.ingredients;
    var normalizedSearch = normalizeText(state.ingredientsEditor.search || "");
    var sortedIds = getSortedIngredientIds();
    var bucketsByCategoryId = {};

    INGREDIENT_CATEGORY_DEFINITIONS.forEach(function (definition) {
      bucketsByCategoryId[definition.id] = [];
    });

    sortedIds.forEach(function (ingredientId) {
      var ingredient = ingredientsSource.ingredients[ingredientId] || {};
      var label = ingredient.label || "(sin label)";
      var haystack = [
        ingredientId,
        label,
        Array.isArray(ingredient.aliases) ? ingredient.aliases.join(" ") : ""
      ].join(" ");
      if (normalizedSearch && !normalizeText(haystack).includes(normalizedSearch)) {
        return;
      }

      var categoryId = getIngredientCategoryId(ingredientId, ingredient, ingredientsSource);
      var issues = (report.ingredientIssuesById && report.ingredientIssuesById[ingredientId]) || {
        errors: [],
        warnings: []
      };

      bucketsByCategoryId[categoryId].push({
        id: ingredientId,
        label: label,
        iconPath: resolveIngredientIconPath(ingredient, ingredientsSource),
        iconGroupKey: getIngredientIconGroupingKey(ingredient, ingredientsSource),
        issues: issues
      });
    });

    var sections = [];
    INGREDIENT_CATEGORY_DEFINITIONS.forEach(function (definition) {
      var items = (bucketsByCategoryId[definition.id] || []).slice();
      if (!items.length) return;

      items.sort(function (a, b) {
        if (a.iconGroupKey !== b.iconGroupKey) {
          return a.iconGroupKey.localeCompare(b.iconGroupKey);
        }
        var byLabel = normalizeText(a.label).localeCompare(normalizeText(b.label));
        if (byLabel !== 0) return byLabel;
        return a.id.localeCompare(b.id);
      });

      sections.push({
        id: definition.id,
        label: definition.label,
        items: items
      });
    });

    return {
      sections: sections,
      visibleCount: sections.reduce(function (acc, section) {
        return acc + section.items.length;
      }, 0),
      totalCount: sortedIds.length
    };
  }

  function ensureIngredientsEditorSelection() {
    ensureIngredientsDraft();
    var ingredientsById = state.drafts.ingredients.ingredients || {};

    if (state.ingredientsEditor.view !== "edit") {
      state.ingredientsEditor.selectedIsNew = false;
      state.ingredientsEditor.draft = null;
      return;
    }

    if (state.ingredientsEditor.selectedIsNew) {
      if (!state.ingredientsEditor.draft) {
        state.ingredientsEditor.draft = createIngredientsEditorDraft("", null);
      }
      return;
    }

    if (
      state.ingredientsEditor.selectedIngredientId &&
      ingredientsById[state.ingredientsEditor.selectedIngredientId]
    ) {
      if (!state.ingredientsEditor.draft) {
        state.ingredientsEditor.draft = createIngredientsEditorDraft(
          state.ingredientsEditor.selectedIngredientId,
          ingredientsById[state.ingredientsEditor.selectedIngredientId]
        );
      }
      return;
    }

    state.ingredientsEditor.selectedIngredientId = "";
    state.ingredientsEditor.selectedIsNew = false;
    state.ingredientsEditor.draft = null;
    state.ingredientsEditor.view = "catalog";
  }

  function ensureIngredientsIconSelection() {
    ensureIngredientsDraft();
    var iconsById = state.drafts.ingredients.icons || {};

    if (state.ingredientsEditor.iconsView !== "edit") {
      state.ingredientsEditor.selectedIconIsNew = false;
      state.ingredientsEditor.iconDraft = null;
      return;
    }

    if (state.ingredientsEditor.selectedIconIsNew) {
      if (!state.ingredientsEditor.iconDraft) {
        state.ingredientsEditor.iconDraft = createIngredientsIconEditorDraft("", null);
      }
      return;
    }

    if (
      state.ingredientsEditor.selectedIconKey &&
      iconsById[state.ingredientsEditor.selectedIconKey]
    ) {
      if (!state.ingredientsEditor.iconDraft) {
        state.ingredientsEditor.iconDraft = createIngredientsIconEditorDraft(
          state.ingredientsEditor.selectedIconKey,
          iconsById[state.ingredientsEditor.selectedIconKey]
        );
      }
      return;
    }

    state.ingredientsEditor.selectedIconKey = "";
    state.ingredientsEditor.selectedIconIsNew = false;
    state.ingredientsEditor.iconDraft = null;
    state.ingredientsEditor.iconsView = "catalog";
  }

  function renderIngredientsList() {
    if (!elements.ingredientsList) return;
    ensureIngredientsDraft();
    var ingredientsSource = state.drafts.ingredients;

    var report = state.ingredientsEditor.validationReport || validateIngredientsDraftData(ingredientsSource);
    var catalog = buildIngredientsCatalogSections(report);
    state.ingredientsEditor.catalogSections = catalog;
    var visibleSections = catalog.sections;
    var visibleCount = catalog.visibleCount;
    var totalCount = catalog.totalCount;
    var alertsCount = report.errors.length + report.warnings.length;

    if (elements.ingredientsCatalogCount) {
      elements.ingredientsCatalogCount.textContent =
        visibleCount + " de " + totalCount + " ingredientes · " +
        visibleSections.length + " categorias visibles" +
        (alertsCount ? (" · " + alertsCount + " alertas") : "");
    }

    if (!visibleSections.length) {
      elements.ingredientsList.innerHTML = "<p class=\"ingredients-grid__empty\">No hay ingredientes para mostrar.</p>";
      renderSidebarIngredientsAccordion([]);
      refreshIngredientsScrollAnchors();
      setActiveIngredientsCategory("");
      return;
    }

    var sectionsHtml = visibleSections.map(function (section) {
      var cardsHtml = section.items.map(function (entry) {
        var issuesCount = entry.issues.errors.length + entry.issues.warnings.length;
        var issueBadge = "";
        if (issuesCount) {
          var issueTooltip = formatIngredientIssuesTooltip(entry.issues);
          var escapedIssueTooltip = escapeHtml(issueTooltip);
          issueBadge =
            "<span class=\"ingredients-card__badge\" role=\"img\" aria-label=\"" + escapedIssueTooltip +
            "\" title=\"" + escapedIssueTooltip + "\" data-issues-tooltip=\"" + escapedIssueTooltip + "\">" +
            INGREDIENT_ISSUE_ICON_SVG +
            "</span>";
        }
        var buttonClass = "ingredients-card";
        if (!state.ingredientsEditor.selectedIsNew && state.ingredientsEditor.selectedIngredientId === entry.id) {
          buttonClass += " is-active";
        }
        if (issuesCount) {
          buttonClass += " is-warning";
        }
        var normalizedIconPath = entry.iconPath ? resolveAssetPath(entry.iconPath) : "";

        return (
          "<li class=\"ingredients-grid__item\">" +
          "<button class=\"" + buttonClass + "\" type=\"button\" title=\"" + escapeHtml(entry.id) + "\" data-select-ingredient=\"" + escapeHtml(entry.id) + "\">" +
          issueBadge +
          "<span class=\"ingredients-card__media\">" +
          (normalizedIconPath
            ? "<img src=\"" + escapeHtml(normalizedIconPath) + "\" alt=\"" + escapeHtml(entry.label) + "\" loading=\"lazy\" />"
            : "<span class=\"ingredients-card__media-placeholder\">•</span>") +
          "</span>" +
          "<span class=\"ingredients-card__label\">" + escapeHtml(entry.label) + "</span>" +
          "</button>" +
          "</li>"
        );
      }).join("");

      return (
        "<section class=\"ingredients-category-section\" id=\"" + getIngredientsCategoryAnchorId(section.id) +
        "\" data-ingredients-anchor=\"true\" data-ingredients-category-id=\"" + escapeHtml(section.id) + "\" tabindex=\"-1\">" +
        "<div class=\"ingredients-category-section__header\">" +
        "<h3>" + escapeHtml(section.label) + "</h3>" +
        "<small>" + section.items.length + " ingredientes</small>" +
        "</div>" +
        "<ul class=\"ingredients-grid\">" + cardsHtml + "</ul>" +
        "</section>"
      );
    }).join("");

    elements.ingredientsList.innerHTML = sectionsHtml;

    if (
      !state.ingredientsEditor.activeCategoryId ||
      !visibleSections.some(function (section) {
        return section.id === state.ingredientsEditor.activeCategoryId;
      })
    ) {
      state.ingredientsEditor.activeCategoryId = visibleSections[0].id;
    }
    renderSidebarIngredientsAccordion(visibleSections);
    setActiveIngredientsCategory(state.ingredientsEditor.activeCategoryId);
    refreshIngredientsScrollAnchors();
    requestIngredientsScrollSpyUpdate();
  }

  function formatIngredientIssuesTooltip(issues) {
    var issueBucket = issues && typeof issues === "object" ? issues : {};
    var errors = Array.isArray(issueBucket.errors) ? issueBucket.errors : [];
    var warnings = Array.isArray(issueBucket.warnings) ? issueBucket.warnings : [];
    var parts = [];

    function compactIssueText(messages) {
      return messages
        .map(function (message) {
          return String(message || "").trim();
        })
        .filter(Boolean)
        .join("; ");
    }

    if (errors.length) {
      parts.push("Errores (" + errors.length + "): " + compactIssueText(errors));
    }
    if (warnings.length) {
      parts.push("Warnings (" + warnings.length + "): " + compactIssueText(warnings));
    }
    return parts.join(" | ");
  }

  function formatIconIssuesTooltip(issues, options) {
    options = options || {};
    var issueBucket = issues && typeof issues === "object" ? issues : {};
    var errors = Array.isArray(issueBucket.errors) ? issueBucket.errors : [];
    var warnings = Array.isArray(issueBucket.warnings) ? issueBucket.warnings : [];
    var parts = [];

    function compactIssueText(messages) {
      return messages
        .map(function (message) {
          return String(message || "").trim();
        })
        .filter(Boolean)
        .join("; ");
    }

    if (errors.length) {
      parts.push("Errores (" + errors.length + "): " + compactIssueText(errors));
    }
    if (warnings.length) {
      parts.push("Warnings (" + warnings.length + "): " + compactIssueText(warnings));
    }
    if (options.usageCount === 0) {
      parts.push("Unused");
    }
    if (options.hasMissingAsset) {
      parts.push("Missing asset");
    }
    return parts.join(" | ");
  }

  function buildIngredientsIconsCatalogEntries(report) {
    ensureIngredientsDraft();
    var ingredientsSource = state.drafts.ingredients;
    var iconsById = ingredientsSource.icons || {};
    var normalizedSearch = normalizeText(state.ingredientsEditor.iconSearch || "");
    var iconIssuesByKey = report && report.iconIssuesByKey ? report.iconIssuesByKey : {};
    var iconUsageByKey = report && report.iconUsageByKey ? report.iconUsageByKey : {};

    return Object.keys(iconsById).map(function (iconKey) {
      var iconEntry = iconsById[iconKey] || {};
      var label = String(iconEntry.label || "").trim();
      var pathValue = String(iconEntry.icon || "").trim();
      var usageEntries = Array.isArray(iconUsageByKey[iconKey]) ? iconUsageByKey[iconKey].slice() : [];
      usageEntries.sort(function (a, b) {
        return normalizeText(a.label || a.id).localeCompare(normalizeText(b.label || b.id));
      });
      var issues = iconIssuesByKey[iconKey] || { errors: [], warnings: [] };
      var hasMissingAsset = !pathValue || !isLikelyValidIngredientIconPath(pathValue);
      var haystack = normalizeText([
        iconKey,
        label,
        pathValue,
        usageEntries.map(function (entry) {
          return entry.id + " " + (entry.label || "");
        }).join(" ")
      ].join(" "));
      return {
        key: iconKey,
        label: label || iconKey,
        rawLabel: label,
        pathValue: pathValue,
        resolvedPath: resolveIngredientCatalogIconPath(iconEntry, ingredientsSource),
        usageEntries: usageEntries,
        issues: issues,
        isUnused: usageEntries.length === 0,
        hasMissingAsset: hasMissingAsset,
        searchHaystack: haystack
      };
    }).filter(function (entry) {
      return !normalizedSearch || entry.searchHaystack.includes(normalizedSearch);
    }).sort(function (a, b) {
      var byLabel = normalizeText(a.label).localeCompare(normalizeText(b.label));
      if (byLabel !== 0) return byLabel;
      return normalizeText(a.key).localeCompare(normalizeText(b.key));
    });
  }

  function renderIngredientsIconsGlobalWarnings(entries) {
    if (!elements.ingredientsIconsGlobalWarning) return;
    var list = Array.isArray(entries) ? entries : [];
    if (!list.length) {
      elements.ingredientsIconsGlobalWarning.textContent = "Sin iconos para mostrar.";
      elements.ingredientsIconsGlobalWarning.classList.remove("is-warning");
      return;
    }

    var unusedCount = list.filter(function (entry) { return entry.isUnused; }).length;
    var missingAssetCount = list.filter(function (entry) { return entry.hasMissingAsset; }).length;
    var issuesCount = list.reduce(function (acc, entry) {
      return acc + entry.issues.errors.length + entry.issues.warnings.length;
    }, 0);

    var parts = [
      list.length + " iconos visibles"
    ];
    if (unusedCount) {
      parts.push(unusedCount + " unused");
    }
    if (missingAssetCount) {
      parts.push(missingAssetCount + " missing asset");
    }
    if (issuesCount) {
      parts.push(issuesCount + " alertas");
    }

    elements.ingredientsIconsGlobalWarning.textContent = parts.join(" · ");
    elements.ingredientsIconsGlobalWarning.classList.toggle(
      "is-warning",
      unusedCount > 0 || missingAssetCount > 0 || issuesCount > 0
    );
  }

  function renderIngredientsIconsList() {
    if (!elements.ingredientsIconsList) return;
    ensureIngredientsDraft();
    var report = state.ingredientsEditor.validationReport || validateIngredientsDraftData(state.drafts.ingredients);
    var entries = buildIngredientsIconsCatalogEntries(report);
    var totalCount = Object.keys((state.drafts.ingredients && state.drafts.ingredients.icons) || {}).length;

    if (elements.ingredientsIconsCatalogCount) {
      elements.ingredientsIconsCatalogCount.textContent =
        entries.length + " de " + totalCount + " iconos";
    }
    renderIngredientsIconsGlobalWarnings(entries);

    if (!entries.length) {
      elements.ingredientsIconsList.innerHTML = "<li class=\"ingredients-grid__empty\">No hay iconos para mostrar.</li>";
      return;
    }

    elements.ingredientsIconsList.innerHTML = entries.map(function (entry) {
      var issuesCount = entry.issues.errors.length + entry.issues.warnings.length;
      var usageCount = entry.usageEntries.length;
      var usageTooltip = usageCount === 1
        ? "Usado por 1 ingrediente."
        : "Usado por " + usageCount + " ingredientes.";
      var escapedUsageTooltip = escapeHtml(usageTooltip);
      var usageBadge =
        "<span class=\"ingredients-card__badge ingredients-card__badge--usage\" role=\"img\" aria-label=\"" + escapedUsageTooltip +
        "\" title=\"" + escapedUsageTooltip + "\" data-issues-tooltip=\"" + escapedUsageTooltip + "\">" +
        INGREDIENT_NAV_BADGE_ICON_SVG +
        "</span>";

      var buttonClass = "ingredients-card ingredients-icon-card";
      if (!state.ingredientsEditor.selectedIconIsNew && state.ingredientsEditor.selectedIconKey === entry.key) {
        buttonClass += " is-active";
      }
      if (issuesCount || entry.isUnused || entry.hasMissingAsset) {
        buttonClass += " is-warning";
      }

      var normalizedIconPath = entry.resolvedPath ? resolveAssetPath(entry.resolvedPath) : "";

      return (
        "<li class=\"ingredients-grid__item\">" +
        "<button class=\"" + buttonClass + "\" type=\"button\" data-select-icon=\"" + escapeHtml(entry.key) +
        "\" title=\"" + escapeHtml(entry.label) + "\">" +
        usageBadge +
        "<span class=\"ingredients-card__media\">" +
        (normalizedIconPath
          ? "<img src=\"" + escapeHtml(normalizedIconPath) + "\" alt=\"" + escapeHtml(entry.label) + "\" loading=\"lazy\" " +
            "onerror=\"this.onerror=null;this.src='/" + escapeHtml(MENU_PLACEHOLDER_IMAGE) + "';\" />"
          : "<span class=\"ingredients-card__media-placeholder\">•</span>") +
        "</span>" +
        "<span class=\"ingredients-card__label\">" + escapeHtml(entry.label) + "</span>" +
        "</button>" +
        "</li>"
      );
    }).join("");
  }

  function renderIngredientsIconSelect(selectedIconValue) {
    if (!elements.ingredientsFieldIconSelect) return;
    var options = ['<option value="">(manual / sin icono)</option>'];
    var datalistOptions = [];
    state.indexes.iconList.forEach(function (iconId) {
      var iconEntry = state.indexes.iconsById[iconId] || {};
      var label = iconEntry.label || iconId;
      options.push(
        "<option value=\"" + escapeHtml(iconId) + "\">" +
        escapeHtml(label + " · " + iconId) +
        "</option>"
      );
      datalistOptions.push(
        "<option value=\"" + escapeHtml(iconId) + "\" label=\"" + escapeHtml(label) + "\"></option>"
      );
    });
    elements.ingredientsFieldIconSelect.innerHTML = options.join("");
    if (elements.ingredientsFieldIconOptions) {
      elements.ingredientsFieldIconOptions.innerHTML = datalistOptions.join("");
    }
    var selected = String(selectedIconValue || "").trim();
    elements.ingredientsFieldIconSelect.value = state.indexes.iconsById[selected] ? selected : "";
  }

  function getIngredientSelectedIconReference(iconValue) {
    ensureIngredientsDraft();
    var normalizedValue = String(iconValue || "").trim();
    if (!normalizedValue) {
      return {
        iconKey: "",
        resolvedPath: "",
        label: ""
      };
    }

    var iconEntry = state.indexes.iconsById[normalizedValue];
    if (iconEntry) {
      return {
        iconKey: normalizedValue,
        resolvedPath: resolveIngredientCatalogIconPath(iconEntry, state.drafts.ingredients),
        label: String(iconEntry.label || normalizedValue).trim()
      };
    }

    if (isLikelyValidIngredientIconPath(normalizedValue)) {
      return {
        iconKey: "",
        resolvedPath: resolveIngredientIconAssetPath(normalizedValue, state.drafts.ingredients),
        label: normalizedValue
      };
    }

    return {
      iconKey: "",
      resolvedPath: "",
      label: normalizedValue
    };
  }

  function renderIngredientsIconPreviewElement(targetElement, iconReference) {
    if (!targetElement) return;
    var reference = iconReference || {};
    var resolvedPath = String(reference.resolvedPath || "").trim();
    if (!resolvedPath) {
      targetElement.classList.add("is-empty");
      targetElement.innerHTML = "<span class=\"ingredients-card__media-placeholder\">•</span>";
      return;
    }

    targetElement.classList.remove("is-empty");
    targetElement.innerHTML =
      "<img src=\"" + escapeHtml(resolveAssetPath(resolvedPath)) + "\" alt=\"" +
      escapeHtml(reference.label || "Icono") + "\" loading=\"lazy\" " +
      "onerror=\"this.onerror=null;this.src='/" + escapeHtml(MENU_PLACEHOLDER_IMAGE) + "';\" />";
  }

  function renderIngredientFieldIconPreview(iconValue) {
    var iconReference = getIngredientSelectedIconReference(iconValue);
    renderIngredientsIconPreviewElement(elements.ingredientsFieldIconPreview, iconReference);
    if (elements.ingredientsViewIconButton) {
      elements.ingredientsViewIconButton.disabled = !iconReference.iconKey;
      elements.ingredientsViewIconButton.setAttribute("data-view-icon-key", iconReference.iconKey || "");
    }
    return iconReference;
  }

  function renderIngredientsAliasList() {
    if (!elements.ingredientsAliasList) return;
    var draft = state.ingredientsEditor.draft;
    if (!draft || !Array.isArray(draft.aliases) || !draft.aliases.length) {
      elements.ingredientsAliasList.innerHTML = "<li class=\"ingredients-list__empty\">Sin aliases.</li>";
      return;
    }

    var html = draft.aliases.map(function (alias, index) {
      return (
        "<li class=\"chip\">" +
        "<span>" + escapeHtml(alias) + "</span>" +
        "<button type=\"button\" data-remove-ingredient-alias=\"" + escapeHtml(String(index)) + "\">x</button>" +
        "</li>"
      );
    }).join("");
    elements.ingredientsAliasList.innerHTML = html;
  }

  function renderIngredientsMetaSelector(kind) {
    var targetElement = kind === "tags" ? elements.ingredientsTagsList : elements.ingredientsAllergensList;
    if (!targetElement) return;
    var sourceList = kind === "tags" ? state.indexes.tagList : state.indexes.allergenList;
    var sourceById = kind === "tags" ? state.indexes.tagsById : state.indexes.allergensById;
    var selected = state.ingredientsEditor.draft
      ? (kind === "tags" ? state.ingredientsEditor.draft.tags : state.ingredientsEditor.draft.allergens)
      : [];
    if (!Array.isArray(selected)) selected = [];

    if (!sourceList.length) {
      targetElement.innerHTML = "<p class=\"ingredients-list__empty\">Sin " + escapeHtml(kind) + " en catalogo.</p>";
      return;
    }

    var html = sourceList.map(function (id) {
      var entry = sourceById[id] || {};
      var label = entry.label || id;
      var selectedClass = selected.includes(id) ? " is-selected" : "";
      var attribute = kind === "tags" ? "data-toggle-ingredient-tag" : "data-toggle-ingredient-allergen";
      return (
        "<button class=\"token-search-result ingredients-meta-chip" + selectedClass + "\" type=\"button\" " +
        attribute + "=\"" + escapeHtml(id) + "\" title=\"" + escapeHtml(id) + "\">" +
        "<span class=\"ingredients-meta-chip__label\">" + escapeHtml(label) + "</span>" +
        "</button>"
      );
    }).join("");
    targetElement.innerHTML = html;
  }

  function renderIngredientsCatalogEditor(kind) {
    var target = kind === "tags" ? elements.ingredientsTagsCatalog : elements.ingredientsAllergensCatalog;
    if (!target) return;
    ensureIngredientsDraft();

    var sourceById = kind === "tags" ? state.drafts.ingredients.tags : state.drafts.ingredients.allergens;
    var ids = Object.keys(sourceById || {}).sort(function (a, b) {
      return normalizeText(a).localeCompare(normalizeText(b));
    });

    if (!ids.length) {
      target.innerHTML = "<p class=\"ingredients-list__empty\">Catalogo vacio.</p>";
      return;
    }

    target.innerHTML = ids.map(function (id) {
      var entry = sourceById[id] || {};
      return (
        "<label class=\"ingredients-catalog-row\" title=\"ID: " + escapeHtml(id) + "\">" +
        "<input type=\"text\" data-ingredients-catalog-kind=\"" + escapeHtml(kind) + "\" " +
        "data-ingredients-catalog-id=\"" + escapeHtml(id) + "\" name=\"ingredients-" + escapeHtml(kind) + "-" +
        escapeHtml(id) + "\" value=\"" + escapeHtml(entry.label || "") +
        "\" placeholder=\"Label visible\" aria-label=\"Label para " + escapeHtml(id) + "\" />" +
        "</label>"
      );
    }).join("");
  }

  function removeLegacyIngredientsCatalogCards() {
    ["ingredientsTagsCatalog", "ingredientsAllergensCatalog"].forEach(function (elementKey) {
      var target = elements[elementKey];
      if (!target) return;
      var section = target.closest(".ingredients-detail-section");
      if (section && section.parentNode) {
        section.parentNode.removeChild(section);
      }
      elements[elementKey] = null;
    });
  }

  function renderIngredientImpact(ingredientId) {
    if (!elements.ingredientsImpactCount || !elements.ingredientsImpactList) return;
    var normalizedId = String(ingredientId || "").trim();
    if (!normalizedId) {
      elements.ingredientsImpactCount.textContent = "Selecciona un ingrediente para ver impacto.";
      elements.ingredientsImpactList.innerHTML = "";
      return;
    }

    var impact = getIngredientMenuImpact(normalizedId);
    elements.ingredientsImpactCount.textContent = impact.length === 1
      ? "1 item del menu usa este ingrediente."
      : impact.length + " items del menu usan este ingrediente.";
    if (!impact.length) {
      elements.ingredientsImpactList.innerHTML = "<li class=\"ingredients-grid__empty\">Sin impacto en menu.</li>";
      return;
    }

    elements.ingredientsImpactList.innerHTML = impact.slice(0, 10).map(function (entry) {
      var normalizedImagePath = entry.imagePath
        ? resolveAssetPath(entry.imagePath)
        : resolveAssetPath(MENU_PLACEHOLDER_IMAGE);
      return (
        "<li class=\"ingredients-grid__item\">" +
        "<article class=\"ingredients-card ingredients-impact-card\" title=\"" + escapeHtml(entry.id) + "\">" +
        "<span class=\"ingredients-card__media\">" +
        "<img src=\"" + escapeHtml(normalizedImagePath) + "\" alt=\"" + escapeHtml(entry.label) + "\" loading=\"lazy\" " +
        "onerror=\"this.onerror=null;this.src='/" + escapeHtml(MENU_PLACEHOLDER_IMAGE) + "';\" />" +
        "</span>" +
        "<span class=\"ingredients-card__label\">" + escapeHtml(entry.label) + "</span>" +
        "</article>" +
        "</li>"
      );
    }).join("");
  }

  function getIngredientsEditorHeading() {
    var isIconsTab = state.ingredientsEditor.tab === "icons";
    if (isIconsTab) {
      if (state.ingredientsEditor.iconsView !== "edit") {
        return {
          title: "Catalogo de iconos",
          subtitle: "Administra iconos del catalogo y revisa su uso en ingredientes."
        };
      }

      if (state.ingredientsEditor.selectedIconIsNew) {
        return {
          title: "Nuevo icono",
          subtitle: "Define key, label y path del icono para usarlo en ingredientes."
        };
      }

      var iconKey = String(state.ingredientsEditor.selectedIconKey || "").trim();
      var iconEntry = iconKey && state.drafts.ingredients && state.drafts.ingredients.icons
        ? state.drafts.ingredients.icons[iconKey]
        : null;
      var iconLabel = iconEntry && iconEntry.label ? String(iconEntry.label).trim() : "";
      return {
        title: iconLabel || iconKey || "Icono",
        subtitle: "Edita label/path y revisa impacto en ingredientes."
      };
    }

    if (state.ingredientsEditor.view !== "edit") {
      return {
        title: "Catalogo de ingredientes",
        subtitle: "Explora el catalogo en cards. Click en un ingrediente para abrir su editor."
      };
    }

    if (state.ingredientsEditor.selectedIsNew) {
      return {
        title: "Nuevo ingrediente",
        subtitle: "Define ID, label, icono y metadatos para agregarlo al catalogo."
      };
    }

    var selectedId = String(state.ingredientsEditor.selectedIngredientId || "").trim();
    var ingredientsById = (state.drafts.ingredients && state.drafts.ingredients.ingredients) || {};
    var selectedIngredient = selectedId ? ingredientsById[selectedId] : null;
    var label = selectedIngredient && selectedIngredient.label
      ? String(selectedIngredient.label).trim()
      : "";

    return {
      title: label || "Ingrediente sin label",
      subtitle: "Edita campos, revisa impacto y guarda cambios en drafts."
    };
  }

  function renderIngredientsForm() {
    var draft = state.ingredientsEditor.draft;
    if (elements.ingredientsDetailTitle) {
      elements.ingredientsDetailTitle.textContent = "Ingrediente";
    }
    if (!draft) {
      elements.ingredientsFieldId.value = "";
      elements.ingredientsFieldLabel.value = "";
      elements.ingredientsFieldIcon.value = "";
      elements.ingredientsFieldId.readOnly = true;
      renderIngredientsIconSelect("");
      renderIngredientFieldIconPreview("");
      renderIngredientsAliasList();
      renderIngredientsMetaSelector("tags");
      renderIngredientsMetaSelector("allergens");
      renderIngredientImpact("");
      if (elements.ingredientsDeleteButton) elements.ingredientsDeleteButton.disabled = true;
      return;
    }

    if (elements.ingredientsDetailTitle) {
      if (state.ingredientsEditor.selectedIsNew) {
        elements.ingredientsDetailTitle.textContent = "Nuevo ingrediente";
      } else {
        var detailTitle = draft.label || "Ingrediente sin label";
        elements.ingredientsDetailTitle.textContent = detailTitle;
      }
    }

    elements.ingredientsFieldId.value = draft.id || "";
    elements.ingredientsFieldId.readOnly = !state.ingredientsEditor.selectedIsNew;
    elements.ingredientsFieldLabel.value = draft.label || "";
    elements.ingredientsFieldIcon.value = draft.icon || "";
    renderIngredientsIconSelect(draft.icon || "");
    renderIngredientFieldIconPreview(draft.icon || "");
    renderIngredientsAliasList();
    renderIngredientsMetaSelector("tags");
    renderIngredientsMetaSelector("allergens");
    renderIngredientImpact(state.ingredientsEditor.selectedIsNew ? "" : state.ingredientsEditor.selectedIngredientId);
    if (elements.ingredientsDeleteButton) {
      elements.ingredientsDeleteButton.disabled = state.ingredientsEditor.selectedIsNew || !state.ingredientsEditor.selectedIngredientId;
    }
  }

  function renderIngredientsIconUsedBy(iconKey) {
    if (!elements.ingredientsIconUsedByCount || !elements.ingredientsIconUsedByList) return;
    var normalizedKey = String(iconKey || "").trim();
    if (!normalizedKey) {
      elements.ingredientsIconUsedByCount.textContent = "Selecciona un icono para ver impacto.";
      elements.ingredientsIconUsedByList.innerHTML = "";
      return;
    }

    var usageEntries = getIngredientIconUsageEntries(normalizedKey);
    elements.ingredientsIconUsedByCount.textContent = usageEntries.length === 1
      ? "Used by 1 ingrediente."
      : "Used by " + usageEntries.length + " ingredientes.";
    if (!usageEntries.length) {
      elements.ingredientsIconUsedByList.innerHTML = "<li class=\"ingredients-grid__empty\">Icono sin uso.</li>";
      return;
    }

    var ingredientsById = (state.drafts.ingredients && state.drafts.ingredients.ingredients) || {};
    elements.ingredientsIconUsedByList.innerHTML = usageEntries.slice(0, 24).map(function (entry) {
      var ingredient = ingredientsById[entry.id] || {};
      var iconPath = resolveIngredientIconPath(ingredient, state.drafts.ingredients);
      var normalizedImagePath = iconPath
        ? resolveAssetPath(iconPath)
        : resolveAssetPath(MENU_PLACEHOLDER_IMAGE);
      return (
        "<li class=\"ingredients-grid__item\">" +
        "<button class=\"ingredients-card ingredients-impact-card ingredients-icon-used-by-card\" type=\"button\" " +
        "data-jump-icon-ingredient=\"" + escapeHtml(entry.id) + "\" title=\"" + escapeHtml(entry.label || entry.id) + "\">" +
        "<span class=\"ingredients-card__media\">" +
        "<img src=\"" + escapeHtml(normalizedImagePath) + "\" alt=\"" + escapeHtml(entry.label) + "\" loading=\"lazy\" " +
        "onerror=\"this.onerror=null;this.src='/" + escapeHtml(MENU_PLACEHOLDER_IMAGE) + "';\" />" +
        "</span>" +
        "<span class=\"ingredients-card__label\">" + escapeHtml(entry.label || entry.id) + "</span>" +
        "</button>" +
        "</li>"
      );
    }).join("");
  }

  function renderIngredientsIconsForm() {
    var draft = state.ingredientsEditor.iconDraft;
    if (elements.ingredientsIconsDetailTitle) {
      elements.ingredientsIconsDetailTitle.textContent = "Icono";
    }
    if (!draft) {
      if (elements.ingredientsIconFieldKey) {
        elements.ingredientsIconFieldKey.value = "";
        elements.ingredientsIconFieldKey.readOnly = true;
      }
      if (elements.ingredientsIconFieldLabel) elements.ingredientsIconFieldLabel.value = "";
      if (elements.ingredientsIconFieldPath) elements.ingredientsIconFieldPath.value = "";
      renderIngredientsIconPreviewElement(elements.ingredientsIconPreview, { resolvedPath: "", label: "" });
      renderIngredientsIconUsedBy("");
      if (elements.ingredientsIconDeleteButton) elements.ingredientsIconDeleteButton.disabled = true;
      return;
    }

    if (elements.ingredientsIconsDetailTitle) {
      if (state.ingredientsEditor.selectedIconIsNew) {
        elements.ingredientsIconsDetailTitle.textContent = "Nuevo icono";
      } else {
        elements.ingredientsIconsDetailTitle.textContent = draft.label || draft.key || "Icono";
      }
    }

    if (elements.ingredientsIconFieldKey) {
      elements.ingredientsIconFieldKey.value = draft.key || "";
      elements.ingredientsIconFieldKey.readOnly = !state.ingredientsEditor.selectedIconIsNew;
    }
    if (elements.ingredientsIconFieldLabel) {
      elements.ingredientsIconFieldLabel.value = draft.label || "";
    }
    if (elements.ingredientsIconFieldPath) {
      elements.ingredientsIconFieldPath.value = draft.path || "";
    }

    renderIngredientsIconPreviewElement(elements.ingredientsIconPreview, {
      resolvedPath: resolveIngredientIconAssetPath(draft.path || "", state.drafts.ingredients),
      label: draft.label || draft.key || "Icono"
    });
    renderIngredientsIconUsedBy(state.ingredientsEditor.selectedIconIsNew ? "" : state.ingredientsEditor.selectedIconKey);
    if (elements.ingredientsIconDeleteButton) {
      elements.ingredientsIconDeleteButton.disabled =
        state.ingredientsEditor.selectedIconIsNew || !state.ingredientsEditor.selectedIconKey;
    }
  }

  function renderIngredientsEditor() {
    if (!state.hasDataLoaded) return;
    ensureIngredientsDraft();
    buildIndexes();
    var previousTab = "ingredients";
    if (elements.ingredientsTabIcons && elements.ingredientsTabIcons.classList.contains("is-active")) {
      previousTab = "icons";
    } else if (elements.ingredientsTabIngredients && elements.ingredientsTabIngredients.classList.contains("is-active")) {
      previousTab = "ingredients";
    } else {
      previousTab = normalizeIngredientsTab(state.ingredientsEditor.lastRenderedTab || state.ingredientsEditor.tab);
    }
    state.ingredientsEditor.tab = normalizeIngredientsTab(state.ingredientsEditor.tab);
    if (state.ingredientsEditor.tab === "icons") {
      ensureIngredientsIconSelection();
    } else {
      ensureIngredientsEditorSelection();
    }

    if (elements.ingredientsSearchInput) {
      elements.ingredientsSearchInput.value = state.ingredientsEditor.search || "";
    }
    if (elements.ingredientsIconsSearchInput) {
      elements.ingredientsIconsSearchInput.value = state.ingredientsEditor.iconSearch || "";
    }

    state.ingredientsEditor.validationReport = validateIngredientsDraftData(state.drafts.ingredients);
    var isIconsTab = state.ingredientsEditor.tab === "icons";
    var isIngredientsEditView = !isIconsTab && state.ingredientsEditor.view === "edit";
    var isIconsEditView = isIconsTab && state.ingredientsEditor.iconsView === "edit";
    var isCatalogActionsVisible = !isIngredientsEditView && !isIconsEditView;
    var tabVisibilityMap = getIngredientsTabVisibilityMap(isIconsTab, isIngredientsEditView, isIconsEditView);
    clearIngredientsTabSwitchAnimation();
    applyIngredientsTabVisibility(tabVisibilityMap);
    if (elements.ingredientsCatalogActions) {
      elements.ingredientsCatalogActions.classList.toggle("is-hidden", !isCatalogActionsVisible);
    }
    if (elements.ingredientsEditorActions) {
      elements.ingredientsEditorActions.classList.toggle("is-hidden", isCatalogActionsVisible);
    }
    if (elements.ingredientsNewButton) {
      elements.ingredientsNewButton.classList.toggle("is-hidden", isIconsTab || isIngredientsEditView);
    }
    if (elements.ingredientsNormalizeAliasesButton) {
      elements.ingredientsNormalizeAliasesButton.classList.toggle("is-hidden", isIconsTab || isIngredientsEditView);
    }
    if (elements.ingredientsNewIconButton) {
      elements.ingredientsNewIconButton.classList.toggle("is-hidden", !isIconsTab || isIconsEditView);
    }
    if (elements.ingredientsTabs && elements.ingredientsTabs.length) {
      elements.ingredientsTabs.forEach(function (tabButton) {
        var tabValue = normalizeIngredientsTab(tabButton.getAttribute("data-ingredients-tab"));
        tabButton.classList.toggle("is-active", tabValue === state.ingredientsEditor.tab);
      });
    }
    setIngredientsTabsVisualState(state.ingredientsEditor.tab);

    var heading = getIngredientsEditorHeading();
    if (elements.ingredientsPanelTitle) {
      elements.ingredientsPanelTitle.textContent = heading.title;
    }
    if (elements.ingredientsPanelSubtitle) {
      elements.ingredientsPanelSubtitle.textContent = heading.subtitle;
    }

    if (isIconsTab) {
      renderIngredientsIconsList();
      refreshIngredientsScrollAnchors();
      setActiveIngredientsCategory("");
      if (isIconsEditView) {
        renderIngredientsIconsForm();
      } else {
        renderIngredientsIconUsedBy("");
      }
    } else {
      renderIngredientsList();
      if (isIngredientsEditView) {
        renderIngredientsForm();
      } else {
        renderIngredientImpact("");
      }
    }

    renderIngredientsEditorValidationSummary(state.ingredientsEditor.validationReport);
    if (isIconsTab) {
      renderIngredientsIconsGlobalWarnings(buildIngredientsIconsCatalogEntries(state.ingredientsEditor.validationReport));
    } else {
      renderIngredientsGlobalWarnings(state.ingredientsEditor.validationReport);
    }

    state.ingredientsEditor.lastRenderedTab = state.ingredientsEditor.tab;
  }

  function openIngredientsEditor(options) {
    options = options || {};
    var targetTab = normalizeIngredientsTab(
      Object.prototype.hasOwnProperty.call(options, "tab") ? options.tab : "ingredients"
    );
    if (!options.skipRoute) {
      navigateToRoute(targetTab === "icons" ? "/ingredients/icons" : "/ingredients", { replace: Boolean(options.replaceRoute) });
      return;
    }
    if (!state.hasDataLoaded) {
      ensureDataLoaded(false);
      return;
    }

    ensureIngredientsDraft();
    var wasIngredientsPanelActive = state.currentPanel === "ingredients-editor";
    state.ingredientsEditor.tab = targetTab;
    if (targetTab === "icons") {
      state.ingredientsEditor.iconsView = "catalog";
      state.ingredientsEditor.selectedIconKey = "";
      state.ingredientsEditor.selectedIconIsNew = false;
      state.ingredientsEditor.iconDraft = null;
    } else {
      state.ingredientsEditor.view = "catalog";
      state.ingredientsEditor.selectedIsNew = false;
      state.ingredientsEditor.draft = null;
    }

    if (wasIngredientsPanelActive) {
      setNavigationCurrentPanel("ingredients-editor");
      setActiveSidebarNav("ingredients-editor", { syncIndicator: false });
      var targetAccordionKey = targetTab === "icons" ? "" : "ingredients";
      transitionSidebarAccordions(targetAccordionKey)
        .catch(function () {
          // ignore accordion interruptions during rapid tab switching
        })
        .finally(function () {
          if (!state.navigation.isProgrammaticScroll) {
            setNavigationState(NAVIGATION_STATES.idle, { force: true });
          }
        });
      scheduleSidebarActiveIndicatorSync();
    } else {
      setActivePanel("ingredients-editor");
    }

    setMenuBrowserStatus("");
    setItemEditorStatus("");
    setHomeEditorStatus("");
    setIngredientsEditorStatus("");
    setCategoriesEditorStatus("");
    showItemEditorErrors([]);
    renderIngredientsEditor();
  }

  function beginNewIngredientDraft(options) {
    options = options || {};
    if (!options.skipRoute) {
      navigateToRoute("/ingredients/new");
      return;
    }
    ensureIngredientsDraft();
    setActivePanel("ingredients-editor");
    state.ingredientsEditor.tab = "ingredients";
    state.ingredientsEditor.iconsView = "catalog";
    state.ingredientsEditor.selectedIconIsNew = false;
    state.ingredientsEditor.iconDraft = null;
    state.ingredientsEditor.selectedIngredientId = "";
    state.ingredientsEditor.selectedIsNew = true;
    state.ingredientsEditor.view = "edit";
    state.ingredientsEditor.draft = createIngredientsEditorDraft("", null);
    renderIngredientsEditor();

    setIngredientsEditorStatus("Nuevo ingrediente listo. Define ID unico y guarda.");
  }

  function selectIngredientForEditing(ingredientId, options) {
    options = options || {};
    ensureIngredientsDraft();
    var normalizedId = String(ingredientId || "").trim();
    if (!normalizedId) return false;
    if (!options.skipRoute) {
      navigateToRoute("/ingredients/" + encodeURIComponent(normalizedId));
      return true;
    }
    var source = state.drafts.ingredients.ingredients || {};
    if (!source[normalizedId]) {
      setIngredientsEditorStatus("No se encontro el ingrediente: " + normalizedId);
      return false;
    }

    setActivePanel("ingredients-editor");
    state.ingredientsEditor.tab = "ingredients";
    state.ingredientsEditor.iconsView = "catalog";
    state.ingredientsEditor.selectedIconIsNew = false;
    state.ingredientsEditor.iconDraft = null;
    state.ingredientsEditor.selectedIngredientId = normalizedId;
    state.ingredientsEditor.selectedIsNew = false;
    state.ingredientsEditor.view = "edit";
    state.ingredientsEditor.draft = createIngredientsEditorDraft(normalizedId, source[normalizedId]);
    renderIngredientsEditor();

    var selectedLabel = source[normalizedId] && source[normalizedId].label
      ? source[normalizedId].label
      : normalizedId;
    setIngredientsEditorStatus("Editando ingrediente: " + selectedLabel);
    return true;
  }

  function returnToIngredientsCatalog(options) {
    options = options || {};
    if (!options.skipRoute) {
      navigateToRoute("/ingredients");
      return;
    }
    state.ingredientsEditor.tab = "ingredients";
    state.ingredientsEditor.view = "catalog";
    state.ingredientsEditor.selectedIsNew = false;
    state.ingredientsEditor.draft = null;
    renderIngredientsEditor();

    if (!options.silent) {
      setIngredientsEditorStatus("Catalogo de ingredientes.");
    }

    window.requestAnimationFrame(function () {
      updateIngredientsScrollSpy(true);
    });
  }

  function beginNewIconDraft(options) {
    options = options || {};
    if (!options.skipRoute) {
      navigateToRoute("/ingredients/icons/new");
      return;
    }
    ensureIngredientsDraft();
    setActivePanel("ingredients-editor");
    state.ingredientsEditor.tab = "icons";
    state.ingredientsEditor.view = "catalog";
    state.ingredientsEditor.selectedIsNew = false;
    state.ingredientsEditor.draft = null;
    state.ingredientsEditor.selectedIconKey = "";
    state.ingredientsEditor.selectedIconIsNew = true;
    state.ingredientsEditor.iconsView = "edit";
    state.ingredientsEditor.iconDraft = createIngredientsIconEditorDraft("", null);
    renderIngredientsEditor();
    setIngredientsEditorStatus("Nuevo icono listo. Define key unica y guarda.");
  }

  function selectIconForEditing(iconKey, options) {
    options = options || {};
    ensureIngredientsDraft();
    var normalizedKey = String(iconKey || "").trim();
    if (!normalizedKey) return false;
    if (!options.skipRoute) {
      navigateToRoute("/ingredients/icons/" + encodeURIComponent(normalizedKey));
      return true;
    }

    var source = state.drafts.ingredients.icons || {};
    if (!source[normalizedKey]) {
      setIngredientsEditorStatus("No se encontro el icono: " + normalizedKey);
      return false;
    }

    setActivePanel("ingredients-editor");
    state.ingredientsEditor.tab = "icons";
    state.ingredientsEditor.view = "catalog";
    state.ingredientsEditor.selectedIsNew = false;
    state.ingredientsEditor.draft = null;
    state.ingredientsEditor.selectedIconKey = normalizedKey;
    state.ingredientsEditor.selectedIconIsNew = false;
    state.ingredientsEditor.iconsView = "edit";
    state.ingredientsEditor.iconDraft = createIngredientsIconEditorDraft(normalizedKey, source[normalizedKey]);
    renderIngredientsEditor();

    var selectedLabel = source[normalizedKey] && source[normalizedKey].label
      ? source[normalizedKey].label
      : normalizedKey;
    setIngredientsEditorStatus("Editando icono: " + selectedLabel);
    return true;
  }

  function returnToIngredientsIconsCatalog(options) {
    options = options || {};
    if (!options.skipRoute) {
      navigateToRoute("/ingredients/icons");
      return;
    }
    state.ingredientsEditor.tab = "icons";
    state.ingredientsEditor.iconsView = "catalog";
    state.ingredientsEditor.selectedIconIsNew = false;
    state.ingredientsEditor.iconDraft = null;
    renderIngredientsEditor();
    if (!options.silent) {
      setIngredientsEditorStatus("Catalogo de iconos.");
    }
  }

  function syncIngredientsEditorDraftFromForm() {
    var draft = state.ingredientsEditor.draft;
    if (!draft) return;

    draft.id = String(elements.ingredientsFieldId.value || "").trim();
    draft.label = String(elements.ingredientsFieldLabel.value || "").trim();
    draft.icon = String(elements.ingredientsFieldIcon.value || "").trim();
    renderIngredientFieldIconPreview(draft.icon);
  }

  function syncIngredientsIconDraftFromForm() {
    var draft = state.ingredientsEditor.iconDraft;
    if (!draft) return;
    draft.key = String(elements.ingredientsIconFieldKey && elements.ingredientsIconFieldKey.value || "").trim();
    draft.label = String(elements.ingredientsIconFieldLabel && elements.ingredientsIconFieldLabel.value || "").trim();
    draft.path = String(elements.ingredientsIconFieldPath && elements.ingredientsIconFieldPath.value || "").trim();
    renderIngredientsIconPreviewElement(elements.ingredientsIconPreview, {
      resolvedPath: resolveIngredientIconAssetPath(draft.path, state.drafts.ingredients),
      label: draft.label || draft.key || "Icono"
    });
  }

  function addAliasToIngredientsDraft() {
    var draft = state.ingredientsEditor.draft;
    if (!draft) return;

    var normalizedAlias = normalizeIngredientAliasValue(elements.ingredientsAliasInput.value || "");
    if (!normalizedAlias) {
      setIngredientsEditorStatus("Alias invalido. Usa texto alfanumerico (normaliza a underscores).");
      return;
    }
    if (!Array.isArray(draft.aliases)) {
      draft.aliases = [];
    }
    if (draft.aliases.includes(normalizedAlias)) {
      setIngredientsEditorStatus("Ese alias ya existe.");
      return;
    }
    draft.aliases.push(normalizedAlias);
    elements.ingredientsAliasInput.value = "";
    renderIngredientsAliasList();
    setIngredientsEditorStatus("Alias agregado. Guarda para persistir.");
  }

  function removeAliasFromIngredientsDraft(index) {
    var draft = state.ingredientsEditor.draft;
    var numericIndex = Number(index);
    if (!draft || !Array.isArray(draft.aliases)) return;
    if (!Number.isInteger(numericIndex) || numericIndex < 0 || numericIndex >= draft.aliases.length) return;
    draft.aliases.splice(numericIndex, 1);
    renderIngredientsAliasList();
    setIngredientsEditorStatus("Alias removido. Guarda para persistir.");
  }

  function toggleIngredientMeta(kind, id) {
    var draft = state.ingredientsEditor.draft;
    if (!draft) return;
    var normalizedId = String(id || "").trim();
    if (!normalizedId) return;

    var fieldName = kind === "allergens" ? "allergens" : "tags";
    if (!Array.isArray(draft[fieldName])) {
      draft[fieldName] = [];
    }
    if (draft[fieldName].includes(normalizedId)) {
      draft[fieldName] = draft[fieldName].filter(function (value) {
        return value !== normalizedId;
      });
    } else {
      draft[fieldName].push(normalizedId);
      draft[fieldName] = Array.from(new Set(draft[fieldName]));
    }
    renderIngredientsMetaSelector(fieldName);
    setIngredientsEditorStatus("Cambios pendientes en " + fieldName + ". Guarda para persistir.");
  }

  function updateIngredientsCatalogLabel(kind, id, label) {
    ensureIngredientsDraft();
    var normalizedKind = kind === "allergens" ? "allergens" : "tags";
    var normalizedId = String(id || "").trim();
    if (!normalizedId) return;

    var bucket = state.drafts.ingredients[normalizedKind];
    if (!bucket || typeof bucket !== "object") {
      bucket = {};
      state.drafts.ingredients[normalizedKind] = bucket;
    }
    if (!bucket[normalizedId] || typeof bucket[normalizedId] !== "object") {
      bucket[normalizedId] = { id: normalizedId, label: "" };
    }

    bucket[normalizedId].id = normalizedId;
    bucket[normalizedId].label = String(label || "").trim();

    buildIndexes();
    state.ingredientsEditor.validationReport = validateIngredientsDraftData(state.drafts.ingredients);
    renderIngredientsEditorValidationSummary(state.ingredientsEditor.validationReport);
    renderIngredientsGlobalWarnings(state.ingredientsEditor.validationReport);
    renderIngredientsList();
    renderIngredientsMetaSelector("tags");
    renderIngredientsMetaSelector("allergens");
    updateDashboardMetrics();
    setIngredientsEditorStatus("Catalogo actualizado. Guarda para persistir.");
  }

  function normalizeAliasesInIngredientsDraft() {
    ensureIngredientsDraft();
    var dryRunResult = normalizeIngredientsAliasesPayload(state.drafts.ingredients, { mutate: false });
    var report = dryRunResult.report;
    var totalUpdates = report.changedAliases + report.droppedAliases;
    if (!totalUpdates) {
      setIngredientsEditorStatus("No hay aliases pendientes de normalizar.");
      return;
    }

    var preview = formatIngredientsAliasNormalizationPreview(report, 10);
    var confirmationMessage =
      "Normalizar aliases legacy en Ingredients?\n\n" +
      "Ingredientes impactados: " + report.changedIngredients + "\n" +
      "Aliases ajustados: " + report.changedAliases + "\n" +
      "Aliases removidos (duplicados/invalidos): " + report.droppedAliases +
      (preview ? ("\n\nPreview:\n" + preview) : "") +
      "\n\nConfirma para aplicar en drafts.";

    if (!window.confirm(confirmationMessage)) {
      setIngredientsEditorStatus("Normalizacion de aliases cancelada.");
      return;
    }

    var appliedResult = normalizeIngredientsAliasesPayload(state.drafts.ingredients, { mutate: true });
    var appliedReport = appliedResult.report;
    buildIndexes();
    state.ingredientsEditor.validationReport = validateIngredientsDraftData(state.drafts.ingredients);
    renderIngredientsEditor();
    persistDraftsToLocalStorage();
    setDraftsBanner(true, "Drafts locales activos (Clear drafts | Export)");
    saveDraftsToLocalFiles();
    updateDashboardMetrics();
    setIngredientsEditorStatus(
      "Aliases normalizados en drafts: " +
      appliedReport.changedAliases +
      " ajustados, " +
      appliedReport.droppedAliases +
      " removidos en " +
      appliedReport.changedIngredients +
      " ingredientes."
    );
  }

  function saveIngredientsEditorDraft() {
    ensureIngredientsDraft();
    if (state.ingredientsEditor.view !== "edit" || !state.ingredientsEditor.draft) {
      setIngredientsEditorStatus("Selecciona un ingrediente para editar.");
      return;
    }
    syncIngredientsEditorDraftFromForm();

    var draft = state.ingredientsEditor.draft;
    var ingredientsById = state.drafts.ingredients.ingredients;
    var nextSelectedId = state.ingredientsEditor.selectedIngredientId;

    if (draft) {
      var nextId = state.ingredientsEditor.selectedIsNew
        ? normalizeIngredientAliasValue(draft.id)
        : String(state.ingredientsEditor.selectedIngredientId || "").trim();

      if (!nextId) {
        setIngredientsEditorStatus("ID invalido. Define un ID unico para el ingrediente.");
        return;
      }
      if (state.ingredientsEditor.selectedIsNew && ingredientsById[nextId]) {
        setIngredientsEditorStatus("El ID ya existe: " + nextId);
        return;
      }

      var aliases = [];
      (Array.isArray(draft.aliases) ? draft.aliases : []).forEach(function (alias) {
        var normalizedAlias = normalizeIngredientAliasValue(alias);
        if (!normalizedAlias) return;
        if (!aliases.includes(normalizedAlias)) aliases.push(normalizedAlias);
      });

      var tags = [];
      (Array.isArray(draft.tags) ? draft.tags : []).forEach(function (tagId) {
        var normalizedTag = String(tagId || "").trim();
        if (!normalizedTag) return;
        if (!tags.includes(normalizedTag)) tags.push(normalizedTag);
      });

      var allergens = [];
      (Array.isArray(draft.allergens) ? draft.allergens : []).forEach(function (allergenId) {
        var normalizedAllergen = String(allergenId || "").trim();
        if (!normalizedAllergen) return;
        if (!allergens.includes(normalizedAllergen)) allergens.push(normalizedAllergen);
      });

      ingredientsById[nextId] = {
        label: String(draft.label || "").trim(),
        icon: String(draft.icon || "").trim(),
        aliases: aliases,
        tags: tags,
        allergens: allergens
      };

      nextSelectedId = nextId;
      state.ingredientsEditor.selectedIngredientId = nextId;
      state.ingredientsEditor.selectedIsNew = false;
      state.ingredientsEditor.draft = createIngredientsEditorDraft(nextId, ingredientsById[nextId]);
    }

    buildIndexes();
    state.ingredientsEditor.validationReport = validateIngredientsDraftData(state.drafts.ingredients);
    renderIngredientsEditor();
    renderIngredientImpact(nextSelectedId);
    if (!state.ingredientsEditor.selectedIsNew && nextSelectedId) {
      var nextHash = "#/ingredients/" + encodeURIComponent(nextSelectedId);
      if (window.location.hash !== nextHash) {
        var baseUrl = window.location.pathname + window.location.search;
        window.history.replaceState({}, document.title, baseUrl + nextHash);
      }
    }
    persistDraftsToLocalStorage();
    setDraftsBanner(true, "Drafts locales activos (Clear drafts | Export)");
    saveDraftsToLocalFiles();
    updateDashboardMetrics();

    var report = state.ingredientsEditor.validationReport;
    if (report.errors.length) {
      setIngredientsEditorStatus(
        "Guardado en drafts con " + report.errors.length + " errores y " + report.warnings.length + " warnings."
      );
    } else {
      setIngredientsEditorStatus("Ingrediente guardado en drafts locales.");
    }
  }

  function saveIngredientsIconDraft() {
    ensureIngredientsDraft();
    if (state.ingredientsEditor.iconsView !== "edit" || !state.ingredientsEditor.iconDraft) {
      setIngredientsEditorStatus("Selecciona un icono para editar.");
      return;
    }
    syncIngredientsIconDraftFromForm();

    var draft = state.ingredientsEditor.iconDraft;
    var iconsById = state.drafts.ingredients.icons;
    var nextSelectedKey = state.ingredientsEditor.selectedIconKey;
    var previousKey = String(state.ingredientsEditor.selectedIconKey || "").trim();

    var nextKey = state.ingredientsEditor.selectedIconIsNew
      ? normalizeIngredientAliasValue(draft.key)
      : previousKey;

    if (!nextKey) {
      setIngredientsEditorStatus("Key invalida. Define una key unica para el icono.");
      return;
    }
    if (state.ingredientsEditor.selectedIconIsNew && iconsById[nextKey]) {
      setIngredientsEditorStatus("La key ya existe: " + nextKey);
      return;
    }

    var previousEntry = previousKey && iconsById[previousKey] && typeof iconsById[previousKey] === "object"
      ? iconsById[previousKey]
      : {};
    var covers = Array.isArray(previousEntry.covers) ? previousEntry.covers.slice() : [];

    iconsById[nextKey] = {
      icon: String(draft.path || "").trim(),
      label: String(draft.label || "").trim(),
      covers: covers
    };

    nextSelectedKey = nextKey;
    state.ingredientsEditor.selectedIconKey = nextKey;
    state.ingredientsEditor.selectedIconIsNew = false;
    state.ingredientsEditor.iconDraft = createIngredientsIconEditorDraft(nextKey, iconsById[nextKey]);
    state.ingredientsEditor.tab = "icons";
    state.ingredientsEditor.iconsView = "edit";

    buildIndexes();
    state.ingredientsEditor.validationReport = validateIngredientsDraftData(state.drafts.ingredients);
    renderIngredientsEditor();

    if (!state.ingredientsEditor.selectedIconIsNew && nextSelectedKey) {
      var nextHash = "#/ingredients/icons/" + encodeURIComponent(nextSelectedKey);
      if (window.location.hash !== nextHash) {
        var baseUrl = window.location.pathname + window.location.search;
        window.history.replaceState({}, document.title, baseUrl + nextHash);
      }
    }
    persistDraftsToLocalStorage();
    setDraftsBanner(true, "Drafts locales activos (Clear drafts | Export)");
    saveDraftsToLocalFiles();
    updateDashboardMetrics();

    var report = state.ingredientsEditor.validationReport;
    if (report.errors.length) {
      setIngredientsEditorStatus(
        "Guardado en drafts con " + report.errors.length + " errores y " + report.warnings.length + " warnings."
      );
    } else {
      setIngredientsEditorStatus("Icono guardado en drafts locales.");
    }
  }

  function deleteSelectedIngredientDraft() {
    ensureIngredientsDraft();
    if (state.ingredientsEditor.selectedIsNew) {
      returnToIngredientsCatalog({ skipRoute: false, silent: true });
      setIngredientsEditorStatus("Borrador nuevo descartado.");
      return;
    }

    var ingredientId = String(state.ingredientsEditor.selectedIngredientId || "").trim();
    if (!ingredientId) {
      setIngredientsEditorStatus("Selecciona un ingrediente para eliminar.");
      return;
    }

    var impact = getIngredientMenuImpact(ingredientId);
    var impactPreview = impact.slice(0, 10).map(function (entry) {
      return "• " + entry.label + " (" + entry.id + ")";
    }).join("\n");
    var confirmationMessage = "Eliminar ingrediente '" + ingredientId + "'?\n\n" +
      "Impacto: " + impact.length + " item(s) del menu lo usan.\n" +
      (impactPreview ? ("\n" + impactPreview + "\n") : "") +
      "\nEsta accion no borra referencias en menu.json.";

    if (!window.confirm(confirmationMessage)) return;

    delete state.drafts.ingredients.ingredients[ingredientId];
    state.ingredientsEditor.selectedIngredientId = "";
    state.ingredientsEditor.selectedIsNew = false;
    state.ingredientsEditor.view = "catalog";
    state.ingredientsEditor.draft = null;

    buildIndexes();
    state.ingredientsEditor.validationReport = validateIngredientsDraftData(state.drafts.ingredients);
    renderIngredientsEditor();
    var catalogHash = "#/ingredients";
    if (window.location.hash !== catalogHash) {
      var baseUrl = window.location.pathname + window.location.search;
      window.history.replaceState({}, document.title, baseUrl + catalogHash);
    }
    persistDraftsToLocalStorage();
    setDraftsBanner(true, "Drafts locales activos (Clear drafts | Export)");
    saveDraftsToLocalFiles();
    updateDashboardMetrics();
    setIngredientsEditorStatus("Ingrediente eliminado: " + ingredientId);
  }

  function deleteSelectedIconDraft() {
    ensureIngredientsDraft();
    if (state.ingredientsEditor.selectedIconIsNew) {
      returnToIngredientsIconsCatalog({ skipRoute: false, silent: true });
      setIngredientsEditorStatus("Borrador de icono descartado.");
      return;
    }

    var iconKey = String(state.ingredientsEditor.selectedIconKey || "").trim();
    if (!iconKey) {
      setIngredientsEditorStatus("Selecciona un icono para eliminar.");
      return;
    }

    var usageEntries = getIngredientIconUsageEntries(iconKey);
    if (usageEntries.length) {
      setIngredientsEditorStatus(
        "No puedes eliminar '" + iconKey + "': esta en uso por " + usageEntries.length + " ingrediente(s)."
      );
      return;
    }

    var confirmationMessage = "Eliminar icono '" + iconKey + "'?\n\n" +
      "No hay ingredientes usandolo actualmente.\n" +
      "Esta accion se guarda en drafts y aplica al publicar.";
    if (!window.confirm(confirmationMessage)) return;

    delete state.drafts.ingredients.icons[iconKey];
    state.ingredientsEditor.selectedIconKey = "";
    state.ingredientsEditor.selectedIconIsNew = false;
    state.ingredientsEditor.iconsView = "catalog";
    state.ingredientsEditor.iconDraft = null;
    state.ingredientsEditor.tab = "icons";

    buildIndexes();
    state.ingredientsEditor.validationReport = validateIngredientsDraftData(state.drafts.ingredients);
    renderIngredientsEditor();
    var catalogHash = "#/ingredients/icons";
    if (window.location.hash !== catalogHash) {
      var baseUrl = window.location.pathname + window.location.search;
      window.history.replaceState({}, document.title, baseUrl + catalogHash);
    }
    persistDraftsToLocalStorage();
    setDraftsBanner(true, "Drafts locales activos (Clear drafts | Export)");
    saveDraftsToLocalFiles();
    updateDashboardMetrics();
    setIngredientsEditorStatus("Icono eliminado: " + iconKey);
  }

  /* ===========================
     ROUTER
  =========================== */

  function parseHashRoute() {
    var hash = window.location.hash || "";
    var route = hash.replace(/^#/, "");
    if (!route) return { name: "dashboard" };

    var routeOnly = route.split("?")[0];
    if (routeOnly.charAt(0) !== "/") {
      routeOnly = "/" + routeOnly;
    }

    var parts = routeOnly.split("/").filter(Boolean);
    if (!parts.length || parts[0] === "dashboard") {
      return { name: "dashboard" };
    }

    if (parts[0] === "menu" && parts[1] === "item" && parts[2]) {
      var menuItemToken = decodeURIComponent(parts.slice(2).join("/"));
      if (menuItemToken === "new") {
        return { name: "menu-item-new" };
      }
      return {
        name: "menu-item",
        itemId: menuItemToken
      };
    }

    if (parts[0] === "menu" && parts[1] && parts[1] !== "item") {
      return {
        name: "menu-section",
        categoryId: decodeURIComponent(parts.slice(1).join("/"))
      };
    }

    if (parts[0] === "menu") {
      return { name: "menu" };
    }

    if ((parts[0] === "homepage" || parts[0] === "home") && parts[1]) {
      return {
        name: "homepage-section",
        sectionId: decodeURIComponent(parts.slice(1).join("/"))
      };
    }

    if (parts[0] === "homepage" || parts[0] === "home") {
      return { name: "homepage" };
    }

    if (parts[0] === "ingredients") {
      if (parts[1] === "icons") {
        if (parts[2]) {
          var iconToken = decodeURIComponent(parts.slice(2).join("/"));
          if (iconToken === "new") {
            return { name: "ingredients-icon", tab: "icons", isNew: true };
          }
          return {
            name: "ingredients-icon",
            tab: "icons",
            iconKey: iconToken
          };
        }
        return { name: "ingredients", tab: "icons" };
      }

      if (parts[1] === "ingredients") {
        if (parts[2]) {
          var ingredientScopedToken = decodeURIComponent(parts.slice(2).join("/"));
          if (ingredientScopedToken === "new") {
            return { name: "ingredients-item", tab: "ingredients", isNew: true };
          }
          return {
            name: "ingredients-item",
            tab: "ingredients",
            ingredientId: ingredientScopedToken
          };
        }
        return { name: "ingredients", tab: "ingredients" };
      }

      if (parts[1]) {
        var ingredientToken = decodeURIComponent(parts.slice(1).join("/"));
        if (ingredientToken === "new") {
          return { name: "ingredients-item", isNew: true };
        }
        return {
          name: "ingredients-item",
          ingredientId: ingredientToken
        };
      }

      return { name: "ingredients", tab: "ingredients" };
    }

    if (parts[0] === "categories" && parts[1]) {
      return {
        name: "categories-section",
        categoryId: decodeURIComponent(parts.slice(1).join("/"))
      };
    }

    if (parts[0] === "categories") {
      return { name: "categories" };
    }

    return { name: "dashboard" };
  }

  function navigateToRoute(path, options) {
    options = options || {};
    var targetHash = "#" + path;

    if (options.replace) {
      var base = window.location.pathname + window.location.search;
      window.history.replaceState({}, document.title, base + targetHash);
      applyRoute();
      return;
    }

    if (window.location.hash === targetHash) {
      applyRoute();
      return;
    }

    window.location.hash = targetHash;
  }

  function applyRoute() {
    if (views.dashboard.classList.contains("is-hidden")) return;

    var route = parseHashRoute();

    if (route.name === "menu-item") {
      if (!state.hasDataLoaded) {
        ensureDataLoaded(false);
        return;
      }
      openItemEditor(route.itemId, { skipRoute: true });
      return;
    }

    if (route.name === "menu-item-new") {
      if (!state.hasDataLoaded) {
        ensureDataLoaded(false);
        return;
      }
      openNewItemEditor({ skipRoute: true });
      return;
    }

    if (route.name === "menu") {
      if (!state.hasDataLoaded) {
        ensureDataLoaded(false);
        return;
      }
      openMenuBrowser({ skipRoute: true });
      return;
    }

    if (route.name === "menu-section") {
      if (!state.hasDataLoaded) {
        ensureDataLoaded(false);
        return;
      }
      var menuCategoryId = String(route.categoryId || "").trim();
      if (menuCategoryId) {
        clearPanelPostNavigationActions();
        queuePanelPostNavigationAction("menu-browser", function () {
          scrollToMenuAnchor(menuCategoryId, "");
          setActiveMenuAnchor(menuCategoryId, "", { force: true });
        });
      }
      openMenuBrowser({ skipRoute: true });
      return;
    }

    if (route.name === "homepage") {
      if (!state.hasDataLoaded) {
        ensureDataLoaded(false);
        return;
      }
      openHomePageEditor({ skipRoute: true });
      return;
    }

    if (route.name === "homepage-section") {
      if (!state.hasDataLoaded) {
        ensureDataLoaded(false);
        return;
      }
      var homeSectionId = String(route.sectionId || "").trim();
      if (homeSectionId) {
        clearPanelPostNavigationActions();
        queuePanelPostNavigationAction("home-editor", function () {
          scrollToHomeSection(homeSectionId);
          setActiveHomeSection(homeSectionId, { force: true });
        });
      }
      openHomePageEditor({ skipRoute: true });
      return;
    }

    if (route.name === "ingredients-item") {
      if (!state.hasDataLoaded) {
        ensureDataLoaded(false);
        return;
      }
      if (route.tab === "ingredients" || !route.tab) {
        state.ingredientsEditor.tab = "ingredients";
      }
      if (route.isNew) {
        beginNewIngredientDraft({ skipRoute: true });
        return;
      }
      if (route.ingredientId) {
        var selected = selectIngredientForEditing(route.ingredientId, { skipRoute: true });
        if (!selected) {
          openIngredientsEditor({ skipRoute: true });
        }
        return;
      }
      openIngredientsEditor({ skipRoute: true });
      return;
    }

    if (route.name === "ingredients-icon") {
      if (!state.hasDataLoaded) {
        ensureDataLoaded(false);
        return;
      }
      state.ingredientsEditor.tab = "icons";
      if (route.isNew) {
        beginNewIconDraft({ skipRoute: true });
        return;
      }
      if (route.iconKey) {
        var selectedIcon = selectIconForEditing(route.iconKey, { skipRoute: true });
        if (!selectedIcon) {
          openIngredientsEditor({ skipRoute: true, tab: "icons" });
        }
        return;
      }
      openIngredientsEditor({ skipRoute: true, tab: "icons" });
      return;
    }

    if (route.name === "ingredients") {
      if (!state.hasDataLoaded) {
        ensureDataLoaded(false);
        return;
      }
      openIngredientsEditor({ skipRoute: true, tab: route.tab || "ingredients" });
      return;
    }

    if (route.name === "categories") {
      if (!state.hasDataLoaded) {
        ensureDataLoaded(false);
        return;
      }
      openCategoriesEditor({ skipRoute: true });
      return;
    }

    if (route.name === "categories-section") {
      if (!state.hasDataLoaded) {
        ensureDataLoaded(false);
        return;
      }
      var categoriesSectionId = String(route.categoryId || "").trim();
      if (categoriesSectionId) {
        clearPanelPostNavigationActions();
        queuePanelPostNavigationAction("categories-editor", function () {
          scrollToCategoriesSection(categoriesSectionId);
          setActiveCategoriesSection(categoriesSectionId, { force: true });
        });
      }
      openCategoriesEditor({ skipRoute: true });
      return;
    }

    openDashboard({ skipRoute: true });
  }

  function bindSidebarEvents() {
    elements.sidebarHomeButton.addEventListener("click", function () {
      clearPanelPostNavigationActions();
      navigateToRoute("/dashboard");
    });

    elements.sidebarNavDashboard.addEventListener("click", function () {
      clearPanelPostNavigationActions();
      navigateToRoute("/dashboard");
    });

    elements.sidebarNavMenu.addEventListener("click", function () {
      clearPanelPostNavigationActions();
      navigateToRoute("/menu");
    });

    if (elements.sidebarNavHomepage) {
      elements.sidebarNavHomepage.addEventListener("click", function () {
        clearPanelPostNavigationActions();
        navigateToRoute("/homepage");
      });
    }

    if (elements.sidebarNavIngredients) {
      elements.sidebarNavIngredients.addEventListener("click", function () {
        clearPanelPostNavigationActions();
        navigateToRoute("/ingredients");
      });
    }

    if (elements.sidebarNavCategories) {
      elements.sidebarNavCategories.addEventListener("click", function () {
        clearPanelPostNavigationActions();
        navigateToRoute("/categories");
      });
    }

    elements.sidebarToggleButton.addEventListener("click", function () {
      setSidebarCollapsed(!state.sidebarCollapsed, { persist: true });
    });

    elements.sidebarSearchButton.addEventListener("click", function () {
      openCommandPalette();
    });

    elements.sidebarUserButton.addEventListener("click", function () {
      toggleSidebarUserMenu();
    });

    elements.sidebarMenuAccordion.addEventListener("click", function (event) {
      var scrollButton = event.target.closest("[data-scroll-category]");
      if (!scrollButton) return;

      var categoryValue = scrollButton.getAttribute("data-scroll-category") || "";
      var subcategoryValue = scrollButton.getAttribute("data-scroll-subcategory") || "";

      if (state.currentPanel !== "menu-browser") {
        clearPanelPostNavigationActions();
        queuePanelPostNavigationAction("menu-browser", function () {
          scrollToMenuAnchor(categoryValue, subcategoryValue);
          setActiveMenuAnchor(categoryValue, subcategoryValue, { force: true });
        });
        navigateToRoute("/menu");
        return;
      }

      scrollToMenuAnchor(categoryValue, subcategoryValue);
      setActiveMenuAnchor(categoryValue, subcategoryValue, { force: true });
    });

    if (elements.sidebarHomepageAccordion) {
      elements.sidebarHomepageAccordion.addEventListener("click", function (event) {
        var button = event.target.closest("[data-scroll-home-section]");
        if (!button) return;
        var sectionId = button.getAttribute("data-scroll-home-section") || "";

        if (state.currentPanel !== "home-editor") {
          clearPanelPostNavigationActions();
          queuePanelPostNavigationAction("home-editor", function () {
            scrollToHomeSection(sectionId);
            setActiveHomeSection(sectionId, { force: true });
          });
          navigateToRoute("/homepage");
          return;
        }

        scrollToHomeSection(sectionId);
        setActiveHomeSection(sectionId, { force: true });
      });
    }

    if (elements.sidebarIngredientsAccordion) {
      elements.sidebarIngredientsAccordion.addEventListener("click", function (event) {
        var button = event.target.closest("[data-scroll-ingredients-category]");
        if (!button) return;
        var categoryId = button.getAttribute("data-scroll-ingredients-category") || "";

        var shouldOpenCatalog =
          state.currentPanel !== "ingredients-editor" ||
          state.ingredientsEditor.tab !== "ingredients" ||
          state.ingredientsEditor.view !== "catalog";

        if (shouldOpenCatalog) {
          clearPanelPostNavigationActions();
          queuePanelPostNavigationAction("ingredients-editor", function () {
            scrollToIngredientsCategory(categoryId);
            setActiveIngredientsCategory(categoryId);
          });
          navigateToRoute("/ingredients");
          return;
        }

        scrollToIngredientsCategory(categoryId);
        setActiveIngredientsCategory(categoryId);
      });
    }

    if (elements.sidebarCategoriesAccordion) {
      elements.sidebarCategoriesAccordion.addEventListener("click", function (event) {
        var button = event.target.closest("[data-scroll-categories-section]");
        if (!button) return;
        var categoryId = button.getAttribute("data-scroll-categories-section") || "";
        if (!categoryId) return;

        if (state.currentPanel !== "categories-editor") {
          clearPanelPostNavigationActions();
          queuePanelPostNavigationAction("categories-editor", function () {
            scrollToCategoriesSection(categoryId);
            setActiveCategoriesSection(categoryId, { force: true });
          });
          navigateToRoute("/categories/" + encodeURIComponent(categoryId));
          return;
        }

        scrollToCategoriesSection(categoryId);
        setActiveCategoriesSection(categoryId, { force: true });
        setHashSilently("/categories/" + encodeURIComponent(categoryId));
      });
    }

    if (elements.sidebarNav) {
      elements.sidebarNav.addEventListener("scroll", updateSidebarActiveIndicator, { passive: true });
    }

    [elements.sidebarMenuAccordion, elements.sidebarHomepageAccordion, elements.sidebarIngredientsAccordion, elements.sidebarCategoriesAccordion]
      .filter(Boolean)
      .forEach(function (accordionElement) {
        accordionElement.addEventListener("transitionend", function (event) {
          if (!event || !event.propertyName) return;
          if (event.propertyName.indexOf("max-height") === -1) return;
          if (!accordionElement.classList.contains("is-open")) return;
          scheduleSidebarActiveIndicatorSync();
          requestCurrentPanelScrollSpySync();
        });
      });
  }

  function bindMenuBrowserEvents() {
    elements.openMenuBrowserButton.addEventListener("click", function () {
      openMenuBrowser({ skipRoute: false });
    });

    if (elements.openHomepageEditorButton) {
      elements.openHomepageEditorButton.addEventListener("click", function () {
        openHomePageEditor({ skipRoute: false });
      });
    }

    if (elements.openIngredientsEditorButton) {
      elements.openIngredientsEditorButton.addEventListener("click", function () {
        openIngredientsEditor({ skipRoute: false });
      });
    }

    if (elements.openCategoriesEditorButton) {
      elements.openCategoriesEditorButton.addEventListener("click", function () {
        openCategoriesEditor({ skipRoute: false });
      });
    }

    elements.menuClearFilterButton.addEventListener("click", function () {
      var firstGroup = state.menuViewGroups[0];
      if (firstGroup) {
        scrollToMenuAnchor(firstGroup.id, "");
        setActiveMenuAnchor(firstGroup.id, "", { force: true });
      } else {
        runWithProgrammaticScrollLock(function () {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, UX_TIMING.programmaticScrollLockMs, "menu:top");
      }
      setMenuBrowserStatus("Mostrando menu completo.");
    });

    elements.menuNewItemButton.addEventListener("click", function () {
      openNewItemEditor();
    });

    elements.menuBrowserGroups.addEventListener("click", function (event) {
      var card = event.target.closest("[data-item-id]");
      if (!card) return;
      var itemId = card.getAttribute("data-item-id");
      openItemEditor(itemId, { skipRoute: false });
    });
  }

  function mountItemEditorToggles() {
    var itemToggleMounts = [
      {
        mountId: "item-field-featured-toggle-mount",
        toggleId: "item-field-featured",
        label: "Featured"
      },
      {
        mountId: "item-availability-toggle-mount",
        toggleId: "item-availability-toggle",
        label: "Disponible"
      },
      {
        mountId: "item-field-vegetarian-toggle-mount",
        toggleId: "item-field-vegetarian",
        label: "Vegetariano"
      },
      {
        mountId: "item-field-vegan-toggle-mount",
        toggleId: "item-field-vegan",
        label: "Vegano"
      }
    ];

    itemToggleMounts.forEach(function (entry) {
      var mountElement = document.getElementById(entry.mountId);
      if (!mountElement) return;
      mountElement.innerHTML = renderToggle({
        id: entry.toggleId,
        label: entry.label,
        checked: false
      });
    });

    elements.itemFieldFeatured = document.getElementById("item-field-featured");
    elements.itemAvailabilityToggle = document.getElementById("item-availability-toggle");
    elements.itemFieldVegetarian = document.getElementById("item-field-vegetarian");
    elements.itemFieldVegan = document.getElementById("item-field-vegan");
  }

  function bindItemEditorEvents() {
    elements.itemTabs.forEach(function (tabButton) {
      tabButton.addEventListener("click", function () {
        var tabId = tabButton.getAttribute("data-tab");
        setActiveItemTab(tabId);
      });
    });

    elements.itemGenerateSlugButton.addEventListener("click", function () {
      var name = elements.itemFieldName.value.trim();
      var generatedSlug = slugify(name || elements.itemFieldId.value || "");
      elements.itemFieldSlug.value = generatedSlug;
      syncDraftFromForm();
    });

    elements.itemFieldCategory.addEventListener("change", function () {
      populateSubcategorySelect(elements.itemFieldCategory.value, "");
      syncDraftFromForm();
    });

    [
      elements.itemFieldName,
      elements.itemFieldSlug,
      elements.itemFieldSubcategory,
      elements.itemFieldPrice,
      elements.itemFieldDescriptionShort,
      elements.itemFieldDescriptionLong,
      elements.itemFieldImage,
      elements.itemAvailabilityReason,
      elements.itemFieldSpicyLevel,
      elements.itemFieldSpicyLegacy,
      elements.itemFieldReviews
    ].forEach(function (inputElement) {
      if (!inputElement) return;
      inputElement.addEventListener("input", syncDraftFromForm);
      inputElement.addEventListener("change", syncDraftFromForm);
    });

    bindToggles(views.menuItemPanel, {
      onChange: function (_checked, control) {
        if (!control || !control.id) return;
        if (
          control.id === "item-field-featured" ||
          control.id === "item-availability-toggle" ||
          control.id === "item-field-vegetarian" ||
          control.id === "item-field-vegan"
        ) {
          syncDraftFromForm();
        }
      }
    });

    elements.itemMediaPicker.addEventListener("change", function () {
      elements.itemFieldImage.value = elements.itemMediaPicker.value;
      syncDraftFromForm();
    });

    elements.itemSaveButton.addEventListener("click", function () {
      commitCurrentItemChanges(false);
    });

    elements.itemSaveCloseButton.addEventListener("click", function () {
      commitCurrentItemChanges(true);
    });

    if (elements.itemExportJsonButton) {
      elements.itemExportJsonButton.addEventListener("click", function () {
        exportCurrentDrafts();
      });
    }

    if (elements.itemPublishPreviewButton) {
      elements.itemPublishPreviewButton.addEventListener("click", function () {
        publishChanges("preview");
      });
    }

    if (elements.itemPublishProductionButton) {
      elements.itemPublishProductionButton.addEventListener("click", function () {
        publishChanges("production");
      });
    }

    elements.itemCancelButton.addEventListener("click", cancelItemEditor);
    elements.itemDeleteButton.addEventListener("click", deleteCurrentItem);

    elements.itemAutodetectMetaButton.addEventListener("click", autoDetectTagsAndAllergensFromIngredients);

    elements.ingredientSearchInput.addEventListener("input", function () {
      renderTokenSearchResults("ingredients", elements.ingredientSearchInput.value);
    });

    elements.tagSearchInput.addEventListener("input", function () {
      renderTokenSearchResults("tags", elements.tagSearchInput.value);
    });

    elements.allergenSearchInput.addEventListener("input", function () {
      renderTokenSearchResults("allergens", elements.allergenSearchInput.value);
    });

    elements.ingredientSearchResults.addEventListener("click", function (event) {
      var button = event.target.closest("[data-add-ingredient]");
      if (!button) return;
      addIngredient(button.getAttribute("data-add-ingredient"));
    });

    elements.tagSearchResults.addEventListener("click", function (event) {
      var button = event.target.closest("[data-add-tag]");
      if (!button) return;
      addTag(button.getAttribute("data-add-tag"));
    });

    elements.allergenSearchResults.addEventListener("click", function (event) {
      var button = event.target.closest("[data-add-allergen]");
      if (!button) return;
      addAllergen(button.getAttribute("data-add-allergen"));
    });

    elements.ingredientChipList.addEventListener("click", function (event) {
      var removeButton = event.target.closest("[data-remove-ingredient]");
      if (!removeButton) return;
      removeIngredient(removeButton.getAttribute("data-remove-ingredient"));
    });

    elements.tagChipList.addEventListener("click", function (event) {
      var removeButton = event.target.closest("[data-remove-tag]");
      if (!removeButton) return;
      removeTag(removeButton.getAttribute("data-remove-tag"));
    });

    elements.allergenChipList.addEventListener("click", function (event) {
      var removeButton = event.target.closest("[data-remove-allergen]");
      if (!removeButton) return;
      removeAllergen(removeButton.getAttribute("data-remove-allergen"));
    });

    elements.ingredientChipList.addEventListener("dragstart", function (event) {
      var chip = event.target.closest("[data-chip-index]");
      if (!chip) return;
      dragState.ingredientIndex = Number(chip.getAttribute("data-chip-index"));
      chip.classList.add("chip--dragging");
    });

    elements.ingredientChipList.addEventListener("dragend", function (event) {
      var chip = event.target.closest("[data-chip-index]");
      if (chip) chip.classList.remove("chip--dragging");
      dragState.ingredientIndex = null;
    });

    elements.ingredientChipList.addEventListener("dragover", function (event) {
      event.preventDefault();
    });

    elements.ingredientChipList.addEventListener("drop", function (event) {
      event.preventDefault();
      var targetChip = event.target.closest("[data-chip-index]");
      if (!targetChip) return;
      var targetIndex = Number(targetChip.getAttribute("data-chip-index"));
      var sourceIndex = dragState.ingredientIndex;

      if (!Number.isInteger(sourceIndex) || sourceIndex < 0) return;
      if (sourceIndex === targetIndex) return;

      var nextOrder = state.itemEditor.ingredients.slice();
      var moved = nextOrder.splice(sourceIndex, 1)[0];
      nextOrder.splice(targetIndex, 0, moved);
      state.itemEditor.ingredients = nextOrder;

      renderIngredientChips();
      syncDraftFromForm();
    });
  }

  function bindHomeEditorEvents() {
    if (!elements.homeSectionsContent) return;

    elements.homeSectionsContent.addEventListener("input", function (event) {
      var target = event.target;

      var homePath = target.getAttribute("data-home-path");
      if (homePath) {
        if (target.matches("[data-toggle-control]")) {
          return;
        }

        var nextValue;
        if (target.getAttribute("data-home-value-type") === "number") {
          var numericValue = Number(target.value);
          nextValue = Number.isFinite(numericValue) ? numericValue : 0;
        } else {
          nextValue = target.value;
        }

        setHomeValueByPath(homePath, nextValue);
        normalizeHomeEditorCollections();

        if (homePath === "popular.limit" || homePath === "eventsPreview.limit") {
          renderHomeEditor();
          setActiveHomeSection(
            homePath === "popular.limit" ? "featured" : "events",
            { force: true }
          );
        }

        setHomeEditorStatus("Cambios pendientes en HomePage. Presiona Guardar para persistir.");
        return;
      }

      var eventIndexRaw = target.getAttribute("data-event-index");
      var eventField = target.getAttribute("data-event-field");
      var navbarIndexRaw = target.getAttribute("data-navbar-index");
      var navbarField = target.getAttribute("data-navbar-field");
      var testimonialIndexRaw = target.getAttribute("data-testimonial-index");
      var testimonialField = target.getAttribute("data-testimonial-field");
      var footerColumnIndexRaw = target.getAttribute("data-footer-column-index");
      var footerColumnField = target.getAttribute("data-footer-column-field");
      var footerLinkIndexRaw = target.getAttribute("data-footer-link-index");
      var footerLinkField = target.getAttribute("data-footer-link-field");
      if (navbarIndexRaw !== null && navbarField) {
        var navbarIndex = Number(navbarIndexRaw);
        if (!Number.isInteger(navbarIndex) || navbarIndex < 0) return;
        if (!state.drafts.home.navbar.links[navbarIndex]) return;

        state.drafts.home.navbar.links[navbarIndex][navbarField] = String(target.value || "").trim();
        normalizeHomeEditorCollections();
        setHomeEditorStatus("Cambios pendientes en HomePage. Presiona Guardar para persistir.");
        return;
      }

      if (testimonialIndexRaw !== null && testimonialField) {
        var testimonialIndex = Number(testimonialIndexRaw);
        if (!Number.isInteger(testimonialIndex) || testimonialIndex < 0) return;
        if (!state.drafts.home.testimonials.items[testimonialIndex]) return;

        if (testimonialField === "stars") {
          state.drafts.home.testimonials.items[testimonialIndex].stars = normalizeHomeTestimonialStars(
            target.value,
            5
          );
        } else {
          state.drafts.home.testimonials.items[testimonialIndex][testimonialField] = String(
            target.value || ""
          ).trim();
        }
        normalizeHomeEditorCollections();
        setHomeEditorStatus("Cambios pendientes en HomePage. Presiona Guardar para persistir.");
        return;
      }

      if (footerColumnIndexRaw !== null && footerColumnField) {
        var footerColumnIndex = Number(footerColumnIndexRaw);
        if (!Number.isInteger(footerColumnIndex) || footerColumnIndex < 0) return;
        if (!state.drafts.home.footer.columns[footerColumnIndex]) return;
        state.drafts.home.footer.columns[footerColumnIndex][footerColumnField] = String(
          target.value || ""
        ).trim();
        normalizeHomeEditorCollections();
        setHomeEditorStatus("Cambios pendientes en HomePage. Presiona Guardar para persistir.");
        return;
      }

      if (footerColumnIndexRaw !== null && footerLinkIndexRaw !== null && footerLinkField) {
        var footerLinksColumnIndex = Number(footerColumnIndexRaw);
        var footerLinkIndex = Number(footerLinkIndexRaw);
        if (!Number.isInteger(footerLinksColumnIndex) || footerLinksColumnIndex < 0) return;
        if (!Number.isInteger(footerLinkIndex) || footerLinkIndex < 0) return;
        if (!state.drafts.home.footer.columns[footerLinksColumnIndex]) return;
        if (!state.drafts.home.footer.columns[footerLinksColumnIndex].links[footerLinkIndex]) return;
        state.drafts.home.footer.columns[footerLinksColumnIndex].links[footerLinkIndex][footerLinkField] =
          String(target.value || "").trim();
        normalizeHomeEditorCollections();
        setHomeEditorStatus("Cambios pendientes en HomePage. Presiona Guardar para persistir.");
        return;
      }

      if (eventIndexRaw === null || !eventField) return;

      var eventIndex = Number(eventIndexRaw);
      if (!Number.isInteger(eventIndex) || eventIndex < 0) return;
      if (!state.drafts.home.eventsPreview.items[eventIndex]) return;

      state.drafts.home.eventsPreview.items[eventIndex][eventField] = String(target.value || "").trim();
      normalizeHomeEditorCollections();
      setHomeEditorStatus("Cambios pendientes en HomePage. Presiona Guardar para persistir.");
    });

    elements.homeSectionsContent.addEventListener("change", function (event) {
      var target = event.target;
      var homePath = target.getAttribute("data-home-path");
      if (homePath) {
        if (target.tagName === "SELECT") {
          var value = target.value;
          setHomeValueByPath(homePath, value);
          normalizeHomeEditorCollections();
          setHomeEditorStatus("Cambios pendientes en HomePage. Presiona Guardar para persistir.");
        }
        return;
      }

      var testimonialIndexRaw = target.getAttribute("data-testimonial-index");
      var testimonialField = target.getAttribute("data-testimonial-field");
      if (testimonialIndexRaw === null || testimonialField !== "stars") {
        return;
      }

      var testimonialIndex = Number(testimonialIndexRaw);
      if (!Number.isInteger(testimonialIndex) || testimonialIndex < 0) return;
      if (!state.drafts.home.testimonials.items[testimonialIndex]) return;

      state.drafts.home.testimonials.items[testimonialIndex].stars = normalizeHomeTestimonialStars(
        target.value,
        5
      );
      normalizeHomeEditorCollections();
      setHomeEditorStatus("Cambios pendientes en HomePage. Presiona Guardar para persistir.");
    });

    elements.homeSectionsContent.addEventListener("fig-toggle-change", function (event) {
      var control = event.target.closest("[data-toggle-control]");
      if (!control) return;

      var homePath = control.getAttribute("data-home-path");
      if (!homePath) return;

      var checked = event.detail && typeof event.detail.checked === "boolean"
        ? event.detail.checked
        : getToggleChecked(control);

      setHomeValueByPath(homePath, checked);
      normalizeHomeEditorCollections();
      setHomeEditorStatus("Cambios pendientes en HomePage. Presiona Guardar para persistir.");
    });

    elements.homeSectionsContent.addEventListener("click", function (event) {
      var addNavbarLinkButton = event.target.closest("[data-navbar-add-button]");
      if (addNavbarLinkButton) {
        state.drafts.home.navbar.links.push({
          label: "Nuevo link",
          url: "#"
        });
        normalizeHomeEditorCollections();
        renderHomeEditor();
        setActiveHomeSection("navbar", { force: true });
        setHomeEditorStatus("Cambios pendientes en Navbar.");
        return;
      }

      var navbarActionButton = event.target.closest("[data-navbar-action]");
      if (navbarActionButton) {
        var navbarAction = navbarActionButton.getAttribute("data-navbar-action");
        var navbarIndex = Number(navbarActionButton.getAttribute("data-navbar-index"));
        if (!Number.isInteger(navbarIndex) || navbarIndex < 0) return;

        var navbarLinks = state.drafts.home.navbar.links.slice();
        if (navbarAction === "remove") {
          navbarLinks.splice(navbarIndex, 1);
        } else if (navbarAction === "up" && navbarIndex > 0) {
          var previousLink = navbarLinks[navbarIndex - 1];
          navbarLinks[navbarIndex - 1] = navbarLinks[navbarIndex];
          navbarLinks[navbarIndex] = previousLink;
        } else if (navbarAction === "down" && navbarIndex < navbarLinks.length - 1) {
          var nextLink = navbarLinks[navbarIndex + 1];
          navbarLinks[navbarIndex + 1] = navbarLinks[navbarIndex];
          navbarLinks[navbarIndex] = nextLink;
        }

        state.drafts.home.navbar.links = navbarLinks;
        normalizeHomeEditorCollections();
        renderHomeEditor();
        setActiveHomeSection("navbar", { force: true });
        setHomeEditorStatus("Cambios pendientes en Navbar.");
        return;
      }

      var addFeaturedButton = event.target.closest("[data-featured-add-button]");
      if (addFeaturedButton) {
        var selectElement = elements.homeSectionsContent.querySelector("[data-featured-add-select]");
        var selectedId = selectElement ? String(selectElement.value || "").trim() : "";
        if (!selectedId) {
          setHomeEditorStatus("Selecciona un item antes de agregarlo a featuredIds.");
          return;
        }

        if (state.drafts.home.popular.featuredIds.includes(selectedId)) {
          setHomeEditorStatus("Ese item ya esta en featuredIds.");
          return;
        }

        if (state.drafts.home.popular.featuredIds.length >= HOME_FEATURED_LIMIT) {
          setHomeEditorStatus("Limite alcanzado: maximo " + HOME_FEATURED_LIMIT + " featuredIds.");
          return;
        }

        state.drafts.home.popular.featuredIds.push(selectedId);
        normalizeHomeEditorCollections();
        renderHomeEditor();
        setActiveHomeSection("featured", { force: true });
        setHomeEditorStatus("Cambios pendientes en Featured.");
        return;
      }

      var featuredSyncButton = event.target.closest("[data-featured-sync-button]");
      if (featuredSyncButton) {
        var itemFeaturedIds = getAllMenuItems()
          .filter(function (entry) {
            return Boolean(entry.item && entry.item.featured);
          })
          .map(function (entry) {
            return entry.item.id;
          })
          .filter(Boolean);

        var uniqueFeaturedIds = [];
        itemFeaturedIds.forEach(function (itemId) {
          if (!uniqueFeaturedIds.includes(itemId)) {
            uniqueFeaturedIds.push(itemId);
          }
        });

        if (uniqueFeaturedIds.length > HOME_FEATURED_LIMIT) {
          uniqueFeaturedIds = uniqueFeaturedIds.slice(uniqueFeaturedIds.length - HOME_FEATURED_LIMIT);
        }

        state.drafts.home.popular.featuredIds = uniqueFeaturedIds;
        normalizeHomeEditorCollections();
        renderHomeEditor();
        setActiveHomeSection("featured", { force: true });
        setHomeEditorStatus("FeaturedIds sincronizados desde menu.item.featured.");
        return;
      }

      var featuredActionButton = event.target.closest("[data-featured-action]");
      if (featuredActionButton) {
        var action = featuredActionButton.getAttribute("data-featured-action");
        if (action !== "remove") return;

        var featuredIndex = Number(featuredActionButton.getAttribute("data-featured-index"));
        if (!Number.isInteger(featuredIndex) || featuredIndex < 0) return;

        var featuredIds = state.drafts.home.popular.featuredIds.slice();
        featuredIds.splice(featuredIndex, 1);

        state.drafts.home.popular.featuredIds = featuredIds;
        normalizeHomeEditorCollections();
        renderHomeEditor();
        setActiveHomeSection("featured", { force: true });
        setHomeEditorStatus("Cambios pendientes en Featured.");
        return;
      }

      var addTestimonialButton = event.target.closest("[data-testimonial-add-button]");
      if (addTestimonialButton) {
        if (state.drafts.home.testimonials.items.length >= HOME_TESTIMONIALS_LIMIT) {
          setHomeEditorStatus(
            "Limite alcanzado: maximo " + HOME_TESTIMONIALS_LIMIT + " testimonios."
          );
          return;
        }

        var nextIndex = state.drafts.home.testimonials.items.length;
        var fallbackItem = HOME_TESTIMONIALS_DEFAULT_ITEMS[nextIndex] || {
          name: "Nuevo cliente",
          role: "Cliente",
          text: "Escribe el testimonio aqui.",
          stars: 5
        };
        state.drafts.home.testimonials.items.push({
          name: String(fallbackItem.name || ("Cliente " + (nextIndex + 1))).trim(),
          role: String(fallbackItem.role || "Cliente").trim(),
          text: String(fallbackItem.text || "").trim(),
          stars: normalizeHomeTestimonialStars(fallbackItem.stars, 5)
        });
        normalizeHomeEditorCollections();
        renderHomeEditor();
        setActiveHomeSection("testimonials", { force: true });
        setHomeEditorStatus("Cambios pendientes en Testimonials.");
        return;
      }

      var removeTestimonialButton = event.target.closest("[data-testimonial-remove]");
      if (removeTestimonialButton) {
        var testimonialRemoveIndex = Number(
          removeTestimonialButton.getAttribute("data-testimonial-remove")
        );
        if (!Number.isInteger(testimonialRemoveIndex) || testimonialRemoveIndex < 0) return;
        state.drafts.home.testimonials.items.splice(testimonialRemoveIndex, 1);
        normalizeHomeEditorCollections();
        renderHomeEditor();
        setActiveHomeSection("testimonials", { force: true });
        setHomeEditorStatus("Cambios pendientes en Testimonials.");
        return;
      }

      var addFooterLinkButton = event.target.closest("[data-footer-link-add]");
      if (addFooterLinkButton) {
        var footerColumnIndex = Number(addFooterLinkButton.getAttribute("data-footer-link-add"));
        if (!Number.isInteger(footerColumnIndex) || footerColumnIndex < 0) return;
        if (!state.drafts.home.footer.columns[footerColumnIndex]) return;

        var footerLinks = state.drafts.home.footer.columns[footerColumnIndex].links;
        if (!Array.isArray(footerLinks)) {
          footerLinks = [];
          state.drafts.home.footer.columns[footerColumnIndex].links = footerLinks;
        }
        if (footerLinks.length >= HOME_FOOTER_LINKS_LIMIT) {
          setHomeEditorStatus(
            "Limite alcanzado: maximo " + HOME_FOOTER_LINKS_LIMIT + " links por columna."
          );
          return;
        }

        footerLinks.push({
          label: "Nuevo link",
          url: "#"
        });
        normalizeHomeEditorCollections();
        renderHomeEditor();
        setActiveHomeSection("footer", { force: true });
        setHomeEditorStatus("Cambios pendientes en Footer.");
        return;
      }

      var removeFooterLinkButton = event.target.closest("[data-footer-link-remove]");
      if (removeFooterLinkButton) {
        var removeToken = String(removeFooterLinkButton.getAttribute("data-footer-link-remove") || "");
        var tokens = removeToken.split(":");
        if (tokens.length !== 2) return;
        var removeColumnIndex = Number(tokens[0]);
        var removeLinkIndex = Number(tokens[1]);
        if (!Number.isInteger(removeColumnIndex) || removeColumnIndex < 0) return;
        if (!Number.isInteger(removeLinkIndex) || removeLinkIndex < 0) return;
        if (!state.drafts.home.footer.columns[removeColumnIndex]) return;
        state.drafts.home.footer.columns[removeColumnIndex].links.splice(removeLinkIndex, 1);
        normalizeHomeEditorCollections();
        renderHomeEditor();
        setActiveHomeSection("footer", { force: true });
        setHomeEditorStatus("Cambios pendientes en Footer.");
        return;
      }

      var addEventButton = event.target.closest("[data-event-add-button]");
      if (addEventButton) {
        state.drafts.home.eventsPreview.items.push({
          id: "evento_" + (state.drafts.home.eventsPreview.items.length + 1),
          title: "Nuevo evento",
          subtitle: ""
        });
        normalizeHomeEditorCollections();
        renderHomeEditor();
        setActiveHomeSection("events", { force: true });
        setHomeEditorStatus("Cambios pendientes en Eventos.");
        return;
      }

      var removeEventButton = event.target.closest("[data-event-remove]");
      if (removeEventButton) {
        var removeIndex = Number(removeEventButton.getAttribute("data-event-remove"));
        if (!Number.isInteger(removeIndex) || removeIndex < 0) return;
        state.drafts.home.eventsPreview.items.splice(removeIndex, 1);
        normalizeHomeEditorCollections();
        renderHomeEditor();
        setActiveHomeSection("events", { force: true });
        setHomeEditorStatus("Cambios pendientes en Eventos.");
      }
    });

    elements.homeSectionsContent.addEventListener("dragstart", function (event) {
      var handle = event.target.closest("[data-featured-drag-handle]");
      if (!handle) return;

      var sourceIndex = Number(handle.getAttribute("data-featured-index"));
      if (!Number.isInteger(sourceIndex) || sourceIndex < 0) return;

      resetFeaturedDragState();
      dragState.featuredIndex = sourceIndex;
      dragState.featuredDropIndex = sourceIndex;

      var featuredItem = handle.closest(".home-featured-item");
      if (featuredItem) {
        featuredItem.classList.add("home-featured-item--dragging");
      }
      var featuredList = elements.homeSectionsContent.querySelector(".home-featured-list");
      if (featuredList) {
        featuredList.classList.add("home-featured-list--dragging");
      }

      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(sourceIndex));
        if (featuredItem) {
          event.dataTransfer.setDragImage(
            featuredItem,
            Math.round(featuredItem.offsetWidth / 2),
            Math.round(featuredItem.offsetHeight / 2)
          );
        }
      }
    });

    elements.homeSectionsContent.addEventListener("dragover", function (event) {
      if (!Number.isInteger(dragState.featuredIndex) || dragState.featuredIndex < 0) return;

      var targetItem = event.target.closest(".home-featured-item");
      if (!targetItem) return;

      var resolvedDrop = resolveFeaturedDropTarget(
        targetItem,
        dragState.featuredIndex
      );
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "move";
      }

      clearFeaturedDropMarkers();
      if (!resolvedDrop) return;
      dragState.featuredDropIndex = resolvedDrop.index;
      targetItem.classList.add("home-featured-item--drop-target");
    });

    elements.homeSectionsContent.addEventListener("drop", function (event) {
      if (!Number.isInteger(dragState.featuredIndex) || dragState.featuredIndex < 0) return;

      var sourceIndex = dragState.featuredIndex;
      var targetItem = event.target.closest(".home-featured-item");
      if (!targetItem) {
        resetFeaturedDragState();
        return;
      }

      event.preventDefault();
      var resolvedDrop = resolveFeaturedDropTarget(
        targetItem,
        sourceIndex
      );
      if (!resolvedDrop) {
        resetFeaturedDragState();
        return;
      }

      var beforeRects = captureFeaturedItemRects();
      var featuredIds = state.drafts.home.popular.featuredIds.slice();
      var sourceId = featuredIds[sourceIndex];
      var targetId = featuredIds[resolvedDrop.index];
      if (typeof sourceId === "undefined" || typeof targetId === "undefined") {
        resetFeaturedDragState();
        return;
      }
      featuredIds[sourceIndex] = targetId;
      featuredIds[resolvedDrop.index] = sourceId;

      state.drafts.home.popular.featuredIds = featuredIds;
      normalizeHomeEditorCollections();
      renderHomeEditor();
      setActiveHomeSection("featured", { force: true });
      animateFeaturedReorder(beforeRects);
      setHomeEditorStatus("Cambios pendientes en Featured.");
      resetFeaturedDragState();
    });

    elements.homeSectionsContent.addEventListener("dragend", function (event) {
      var handle = event.target.closest("[data-featured-drag-handle]");
      if (!handle && !Number.isInteger(dragState.featuredIndex)) return;
      resetFeaturedDragState();
    });

    if (elements.homeSaveButton) {
      elements.homeSaveButton.addEventListener("click", function () {
        saveHomeEditorChanges();
      });
    }

    if (elements.homeExportJsonButton) {
      elements.homeExportJsonButton.addEventListener("click", function () {
        exportCurrentDrafts();
      });
    }

    if (elements.homePublishPreviewButton) {
      elements.homePublishPreviewButton.addEventListener("click", function () {
        publishChanges("preview");
      });
    }

    if (elements.homePublishProductionButton) {
      elements.homePublishProductionButton.addEventListener("click", function () {
        publishChanges("production");
      });
    }
  }

  function bindIngredientsEditorEvents() {
    if (elements.ingredientsTabs && elements.ingredientsTabs.length) {
      elements.ingredientsTabs.forEach(function (tabButton) {
        tabButton.addEventListener("click", function () {
          var tab = normalizeIngredientsTab(tabButton.getAttribute("data-ingredients-tab"));
          if (state.hasDataLoaded && state.currentPanel === "ingredients-editor") {
            openIngredientsEditor({ skipRoute: true, tab: tab });
            setHashSilently(tab === "icons" ? "/ingredients/icons" : "/ingredients");
            return;
          }
          if (tab === "icons") {
            navigateToRoute("/ingredients/icons");
          } else {
            navigateToRoute("/ingredients");
          }
        });
      });
    }

    if (elements.ingredientsSearchInput) {
      elements.ingredientsSearchInput.addEventListener("input", function () {
        state.ingredientsEditor.search = elements.ingredientsSearchInput.value || "";
        renderIngredientsList();
      });
    }

    if (elements.ingredientsIconsSearchInput) {
      elements.ingredientsIconsSearchInput.addEventListener("input", function () {
        state.ingredientsEditor.iconSearch = elements.ingredientsIconsSearchInput.value || "";
        renderIngredientsIconsList();
      });
    }

    if (elements.ingredientsList) {
      elements.ingredientsList.addEventListener("click", function (event) {
        var button = event.target.closest("[data-select-ingredient]");
        if (!button) return;
        selectIngredientForEditing(button.getAttribute("data-select-ingredient"), { skipRoute: false });
      });
    }

    if (elements.ingredientsIconsList) {
      elements.ingredientsIconsList.addEventListener("click", function (event) {
        var button = event.target.closest("[data-select-icon]");
        if (!button) return;
        selectIconForEditing(button.getAttribute("data-select-icon"), { skipRoute: false });
      });
    }

    if (elements.ingredientsNewButton) {
      elements.ingredientsNewButton.addEventListener("click", function () {
        beginNewIngredientDraft({ skipRoute: false });
      });
    }

    if (elements.ingredientsNormalizeAliasesButton) {
      elements.ingredientsNormalizeAliasesButton.addEventListener("click", function () {
        normalizeAliasesInIngredientsDraft();
      });
    }

    if (elements.ingredientsNewIconButton) {
      elements.ingredientsNewIconButton.addEventListener("click", function () {
        beginNewIconDraft({ skipRoute: false });
      });
    }

    if (elements.ingredientsBackButton) {
      elements.ingredientsBackButton.addEventListener("click", function () {
        returnToIngredientsCatalog({ skipRoute: false });
      });
    }

    if (elements.ingredientsIconsBackButton) {
      elements.ingredientsIconsBackButton.addEventListener("click", function () {
        returnToIngredientsIconsCatalog({ skipRoute: false });
      });
    }

    if (elements.ingredientsFieldId) {
      elements.ingredientsFieldId.addEventListener("input", syncIngredientsEditorDraftFromForm);
    }
    if (elements.ingredientsFieldLabel) {
      elements.ingredientsFieldLabel.addEventListener("input", syncIngredientsEditorDraftFromForm);
    }
    if (elements.ingredientsFieldIcon) {
      elements.ingredientsFieldIcon.addEventListener("input", function () {
        syncIngredientsEditorDraftFromForm();
        renderIngredientsIconSelect(elements.ingredientsFieldIcon.value || "");
      });
    }

    if (elements.ingredientsFieldIconSelect) {
      elements.ingredientsFieldIconSelect.addEventListener("change", function () {
        var selected = String(elements.ingredientsFieldIconSelect.value || "").trim();
        elements.ingredientsFieldIcon.value = selected;
        syncIngredientsEditorDraftFromForm();
      });
    }

    if (elements.ingredientsViewIconButton) {
      elements.ingredientsViewIconButton.addEventListener("click", function () {
        if (state.ingredientsEditor.tab !== "ingredients") return;
        var iconReference = getIngredientSelectedIconReference(
          elements.ingredientsFieldIcon ? elements.ingredientsFieldIcon.value : ""
        );
        if (!iconReference.iconKey) {
          setIngredientsEditorStatus("Este ingrediente usa path manual o no tiene icono de catalogo.");
          return;
        }
        selectIconForEditing(iconReference.iconKey, { skipRoute: false });
      });
    }

    if (elements.ingredientsAliasAddButton) {
      elements.ingredientsAliasAddButton.addEventListener("click", function () {
        addAliasToIngredientsDraft();
      });
    }
    if (elements.ingredientsAliasInput) {
      elements.ingredientsAliasInput.addEventListener("keydown", function (event) {
        if (event.key !== "Enter") return;
        event.preventDefault();
        addAliasToIngredientsDraft();
      });
    }
    if (elements.ingredientsAliasList) {
      elements.ingredientsAliasList.addEventListener("click", function (event) {
        var button = event.target.closest("[data-remove-ingredient-alias]");
        if (!button) return;
        removeAliasFromIngredientsDraft(button.getAttribute("data-remove-ingredient-alias"));
      });
    }

    if (elements.ingredientsTagsList) {
      elements.ingredientsTagsList.addEventListener("click", function (event) {
        var button = event.target.closest("[data-toggle-ingredient-tag]");
        if (!button) return;
        toggleIngredientMeta("tags", button.getAttribute("data-toggle-ingredient-tag"));
      });
    }

    if (elements.ingredientsAllergensList) {
      elements.ingredientsAllergensList.addEventListener("click", function (event) {
        var button = event.target.closest("[data-toggle-ingredient-allergen]");
        if (!button) return;
        toggleIngredientMeta("allergens", button.getAttribute("data-toggle-ingredient-allergen"));
      });
    }

    if (elements.ingredientsIconFieldKey) {
      elements.ingredientsIconFieldKey.addEventListener("input", syncIngredientsIconDraftFromForm);
    }
    if (elements.ingredientsIconFieldLabel) {
      elements.ingredientsIconFieldLabel.addEventListener("input", syncIngredientsIconDraftFromForm);
    }
    if (elements.ingredientsIconFieldPath) {
      elements.ingredientsIconFieldPath.addEventListener("input", syncIngredientsIconDraftFromForm);
    }

    if (elements.ingredientsIconUsedByList) {
      elements.ingredientsIconUsedByList.addEventListener("click", function (event) {
        var button = event.target.closest("[data-jump-icon-ingredient]");
        if (!button) return;
        var ingredientId = button.getAttribute("data-jump-icon-ingredient") || "";
        if (!ingredientId) return;
        selectIngredientForEditing(ingredientId, { skipRoute: false });
      });
    }

    if (elements.ingredientsTagsCatalog) {
      elements.ingredientsTagsCatalog.addEventListener("input", function (event) {
        var input = event.target.closest("[data-ingredients-catalog-kind='tags']");
        if (!input) return;
        updateIngredientsCatalogLabel(
          "tags",
          input.getAttribute("data-ingredients-catalog-id"),
          input.value
        );
      });
    }

    if (elements.ingredientsAllergensCatalog) {
      elements.ingredientsAllergensCatalog.addEventListener("input", function (event) {
        var input = event.target.closest("[data-ingredients-catalog-kind='allergens']");
        if (!input) return;
        updateIngredientsCatalogLabel(
          "allergens",
          input.getAttribute("data-ingredients-catalog-id"),
          input.value
        );
      });
    }

    if (elements.ingredientsSaveButton) {
      elements.ingredientsSaveButton.addEventListener("click", function () {
        if (state.ingredientsEditor.tab === "icons") {
          saveIngredientsIconDraft();
        } else {
          saveIngredientsEditorDraft();
        }
      });
    }

    if (elements.ingredientsDeleteButton) {
      elements.ingredientsDeleteButton.addEventListener("click", function () {
        deleteSelectedIngredientDraft();
      });
    }

    if (elements.ingredientsIconDeleteButton) {
      elements.ingredientsIconDeleteButton.addEventListener("click", function () {
        deleteSelectedIconDraft();
      });
    }

    if (elements.ingredientsExportJsonButton) {
      elements.ingredientsExportJsonButton.addEventListener("click", function () {
        exportCurrentDrafts();
      });
    }

    if (elements.ingredientsPublishPreviewButton) {
      elements.ingredientsPublishPreviewButton.addEventListener("click", function () {
        publishChanges("preview");
      });
    }

    if (elements.ingredientsPublishProductionButton) {
      elements.ingredientsPublishProductionButton.addEventListener("click", function () {
        publishChanges("production");
      });
    }
  }

  function bindCategoriesEditorEvents() {
    if (elements.categoriesNewButton) {
      elements.categoriesNewButton.addEventListener("click", function () {
        beginNewCategoryDraft({ skipRoute: true });
      });
    }

    if (elements.categoriesExportJsonButton) {
      elements.categoriesExportJsonButton.addEventListener("click", function () {
        exportCurrentDrafts();
      });
    }

    if (elements.categoriesClearDraftsButton) {
      elements.categoriesClearDraftsButton.addEventListener("click", function () {
        resetDraftsToBaseData();
      });
    }

    if (elements.categoriesCardsContent) {
      elements.categoriesCardsContent.addEventListener("click", function (event) {
        var actionButton = event.target.closest("[data-categories-action]");
        if (actionButton) {
          var action = actionButton.getAttribute("data-categories-action") || "";
          var sourceIndex = actionButton.getAttribute("data-categories-source-index");
          if (action === "save") {
            saveCategoryDraftBySourceIndex(sourceIndex);
            return;
          }
          if (action === "cancel") {
            cancelCategoryDraftBySourceIndex(sourceIndex);
            return;
          }
          if (action === "delete") {
            deleteCategoryBySourceIndex(sourceIndex);
            return;
          }
          if (action === "save-new") {
            saveNewCategoryDraft();
            return;
          }
          if (action === "cancel-new") {
            state.categoriesEditor.newDraft = null;
            renderCategoriesEditor();
            setCategoriesEditorStatus("Borrador nuevo descartado.");
            return;
          }
        }

        var card = event.target.closest("[data-categories-card-id]");
        if (!card) return;
        var cardId = String(card.getAttribute("data-categories-card-id") || "").trim();
        if (!cardId) return;
        setActiveCategoriesSection(cardId, { force: true });
      });

      elements.categoriesCardsContent.addEventListener("focusin", function (event) {
        var card = event.target.closest("[data-categories-card-id]");
        if (!card) return;
        var cardId = String(card.getAttribute("data-categories-card-id") || "").trim();
        if (!cardId) return;
        setActiveCategoriesSection(cardId, { force: true });
        setHashSilently("/categories/" + encodeURIComponent(cardId));
      });

      var syncCardField = function (event) {
        var input = event.target.closest("[data-categories-field]");
        if (!input) return;
        var field = String(input.getAttribute("data-categories-field") || "").trim();
        if (!field || field === "visible") return;
        var sourceIndex = input.getAttribute("data-categories-source-index");
        var isNew = input.getAttribute("data-categories-new") === "true";
        var changed = updateCategoryDraftField({
          field: field,
          value: input.value,
          sourceIndex: sourceIndex,
          isNew: isNew
        });
        if (!changed) return;
        setCategoriesEditorStatus("Cambios pendientes en Categories. Presiona Guardar en el card.");
      };

      elements.categoriesCardsContent.addEventListener("input", syncCardField);
      elements.categoriesCardsContent.addEventListener("change", syncCardField);
    }

    if (elements.categoriesOrderList) {
      elements.categoriesOrderList.addEventListener("dragstart", function (event) {
        var handle = event.target.closest("[data-categories-order-handle]");
        if (!handle) return;
        var sourceIndex = Number(handle.getAttribute("data-categories-order-index"));
        if (!Number.isInteger(sourceIndex) || sourceIndex < 0) return;

        resetCategoriesDragState();
        dragState.categoryOrderIndex = sourceIndex;
        dragState.categoryOrderDropIndex = sourceIndex;

        var orderItem = handle.closest(".categories-order-item");
        if (orderItem) {
          orderItem.classList.add("home-featured-item--dragging");
        }
        elements.categoriesOrderList.classList.add("home-featured-list--dragging");

        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", String(sourceIndex));
          if (orderItem) {
            event.dataTransfer.setDragImage(
              orderItem,
              Math.round(orderItem.offsetWidth / 2),
              Math.round(orderItem.offsetHeight / 2)
            );
          }
        }
      });

      elements.categoriesOrderList.addEventListener("dragover", function (event) {
        if (!Number.isInteger(dragState.categoryOrderIndex) || dragState.categoryOrderIndex < 0) return;
        var targetItem = event.target.closest(".categories-order-item");
        if (!targetItem) return;

        var resolvedDrop = resolveCategoriesOrderDropTarget(targetItem, dragState.categoryOrderIndex);
        event.preventDefault();
        if (event.dataTransfer) {
          event.dataTransfer.dropEffect = "move";
        }

        clearCategoriesDropMarkers();
        if (!resolvedDrop) return;
        dragState.categoryOrderDropIndex = resolvedDrop.index;
        targetItem.classList.add("home-featured-item--drop-target");
      });

      elements.categoriesOrderList.addEventListener("drop", function (event) {
        if (!Number.isInteger(dragState.categoryOrderIndex) || dragState.categoryOrderIndex < 0) return;
        var sourceIndex = dragState.categoryOrderIndex;
        var targetItem = event.target.closest(".categories-order-item");
        if (!targetItem) {
          resetCategoriesDragState();
          return;
        }

        event.preventDefault();
        var resolvedDrop = resolveCategoriesOrderDropTarget(targetItem, sourceIndex);
        if (!resolvedDrop) {
          resetCategoriesDragState();
          return;
        }

        var beforeRects = captureCategoriesOrderItemRects();
        applyCategoriesReorder(sourceIndex, resolvedDrop.index);
        animateCategoriesOrderReorder(beforeRects);
        resetCategoriesDragState();
      });

      elements.categoriesOrderList.addEventListener("dragend", function (event) {
        var handle = event.target.closest("[data-categories-order-handle]");
        if (!handle && !Number.isInteger(dragState.categoryOrderIndex)) return;
        resetCategoriesDragState();
      });
    }
  }

  function bindEvents() {
    mountItemEditorToggles();
    syncUxTimingCssVars();
    removeLegacyIngredientsCatalogCards();

    elements.loginButton.addEventListener("click", function () {
      openIdentityModal();
    });

    elements.logoutButton.addEventListener("click", function () {
      closeSidebarUserMenu();
      if (isDevAuthBypassEnabled()) {
        setDevAuthBypass(false);
        window.location.reload();
        return;
      }
      var identity = getIdentity();
      if (!identity) return;
      identity.logout();
    });

    elements.refreshDataButton.addEventListener("click", function () {
      closeSidebarUserMenu();
      ensureDataLoaded(true);
    });

    if (elements.draftsBannerExportButton) {
      elements.draftsBannerExportButton.addEventListener("click", function () {
        exportCurrentDrafts();
      });
    }

    if (elements.draftsBannerClearButton) {
      elements.draftsBannerClearButton.addEventListener("click", function () {
        resetDraftsToBaseData();
      });
    }

    bindSidebarEvents();
    bindCommandPaletteEvents();
    bindMenuBrowserEvents();
    bindItemEditorEvents();
    bindHomeEditorEvents();
    bindIngredientsEditorEvents();
    bindCategoriesEditorEvents();

    window.addEventListener("resize", function () {
      syncSidebarViewportState();
      syncAllSidebarAccordionCategoryHeights();
      updateSidebarActiveIndicator();
      requestCurrentPanelScrollSpySync();
    });
    window.addEventListener("scroll", requestCurrentPanelScrollSpyUpdate, { passive: true });
    syncSidebarViewportState();

    window.addEventListener("hashchange", applyRoute);

    document.addEventListener("click", function (event) {
      if (!isSidebarUserMenuOpen()) return;
      if (elements.sidebarUserButton.contains(event.target)) return;
      if (elements.sidebarUserMenu.contains(event.target)) return;
      closeSidebarUserMenu();
    });

    window.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        if (isCommandPaletteOpen()) {
          event.preventDefault();
          closeCommandPalette();
          return;
        }
        if (isSidebarUserMenuOpen()) {
          closeSidebarUserMenu();
        }
      }

      var isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isShortcut) {
        event.preventDefault();
        toggleCommandPalette();
        return;
      }

      handleCommandPaletteKeydown(event);
    });
  }

  function initAuth() {
    applyDevAuthBypassQueryToggle();
    if (isDevAuthBypassEnabled()) {
      activateLocalAuthBypass();
      return;
    }

    var identity = getIdentity();
    if (!identity) {
      if (isLocalDevHost()) {
        activateLocalAuthBypass();
        return;
      }
      showLoginView("No se pudo cargar Netlify Identity.");
      elements.loginButton.disabled = true;
      return;
    }

    identity.on("init", function (user) {
      if (user) {
        showDashboardShell(user);
      } else {
        showLoginView();
        handleTokenFlow();
      }
    });

    identity.on("login", function (user) {
      showDashboardShell(user);
      clearHash();
      navigateToRoute("/dashboard", { replace: true });
    });

    identity.on("logout", function () {
      showLoginView();
      closeCommandPalette({ immediate: true, returnFocusToSearch: false });

      state.data = null;
      state.drafts.menu = null;
      state.drafts.availability = null;
      state.drafts.home = null;
      state.drafts.ingredients = null;
      state.drafts.categories = null;
      state.hasDataLoaded = false;
      state.currentPanel = "dashboard";
      state.visiblePanel = "dashboard";
      state.sidebarAccordionOpenKey = "";
      state.menuActiveAnchor = { categoryId: "", subcategoryId: "" };
      state.menuViewGroups = [];
      state.menuAnchorTargets = [];
      state.homeActiveSectionId = "";
      state.homeAnchorTargets = [];
      state.ingredientsAnchorTargets = [];
      state.categoriesAnchorTargets = [];
      if (state.menuScrollSpyFrame) {
        window.cancelAnimationFrame(state.menuScrollSpyFrame);
        state.menuScrollSpyFrame = 0;
      }
      if (state.homeScrollSpyFrame) {
        window.cancelAnimationFrame(state.homeScrollSpyFrame);
        state.homeScrollSpyFrame = 0;
      }
      if (state.ingredientsScrollSpyFrame) {
        window.cancelAnimationFrame(state.ingredientsScrollSpyFrame);
        state.ingredientsScrollSpyFrame = 0;
      }
      if (state.categoriesScrollSpyFrame) {
        window.cancelAnimationFrame(state.categoriesScrollSpyFrame);
        state.categoriesScrollSpyFrame = 0;
      }
      clearAllSidebarAccordionOpeningMotions();
      clearSidebarIndicatorSyncTimers();
      clearPanelTransitionTimers();
      clearPanelPostNavigationActions();
      clearProgrammaticScrollLock({ syncScrollSpy: false });
      state.navigationTimelineToken = 0;
      state.navigationTimelineActiveToken = 0;
      state.navigation = {
        currentState: NAVIGATION_STATES.idle,
        currentPanel: "dashboard",
        currentSection: "",
        isProgrammaticScroll: false
      };
      state.itemEditor = {
        isOpen: false,
        isNew: false,
        activeTab: "basic",
        sourceSectionId: "",
        sourceItemIndex: -1,
        draft: null,
        ingredients: [],
        tags: [],
        allergens: [],
        availability: { available: true, soldOutReason: "" }
      };

      applySidebarAccordionState("");
      if (elements.dashboardContent) {
        elements.dashboardContent.classList.remove("is-panel-fading");
        elements.dashboardContent.classList.remove("is-panel-fade-out");
      }
      updateSidebarActiveIndicator();
      state.ingredientsEditor = {
        view: "catalog",
        search: "",
        activeCategoryId: "",
        catalogSections: null,
        selectedIngredientId: "",
        selectedIsNew: false,
        draft: null,
        validationReport: null
      };
      state.categoriesEditor = {
        activeCategoryId: "",
        validationReport: null,
        usageByCategoryId: {},
        draftBySourceIndex: {},
        newDraft: null
      };
      state.commandPalette = {
        isOpen: false,
        selectedIndex: 0
      };

      setDataStatus("Inicia sesion para cargar datos.");
      setMenuBrowserStatus("");
      setItemEditorStatus("");
      setHomeEditorStatus("");
      setIngredientsEditorStatus("");
      setCategoriesEditorStatus("");
      showItemEditorErrors([]);
      setDraftsBanner(false);
      updateDashboardMetrics();
    });

    identity.on("error", function (error) {
      var message = "Error de autenticacion.";
      if (error && error.message) {
        message = error.message;
      }
      if (isLocalDevHost()) {
        activateLocalAuthBypass();
        return;
      }
      showLoginView(message);
    });

    var existingUser = identity.currentUser();
    if (existingUser) {
      showDashboardShell(existingUser);
    } else {
      showLoginView();
      setDataStatus("Inicia sesion para cargar datos.");
    }

    identity.init();
  }

  bindEvents();
  initAuth();
})();
