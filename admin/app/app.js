(function () {
  var DATA_ENDPOINTS = {
    menu: "/data/menu.json",
    categories: "/data/categories.json",
    ingredients: "/data/ingredients.json",
    availability: "/data/availability.json",
    home: "/data/home.json",
    restaurant: "/data/restaurant.json",
    media: "/data/media.json"
  };

  var SIDEBAR_COLLAPSE_KEY = "figata_admin_sidebar_collapsed";
  var MENU_PLACEHOLDER_IMAGE = "assets/menu/placeholders/card.svg";
  var LOCAL_DRAFTS_MENU_KEY = "figata_admin_drafts_menu";
  var LOCAL_DRAFTS_AVAILABILITY_KEY = "figata_admin_drafts_availability";
  var LOCAL_DRAFTS_FLAG_KEY = "figata_admin_has_drafts";

  var state = {
    data: null,
    drafts: {
      menu: null,
      availability: null
    },
    indexes: {
      categoryList: [],
      categoriesById: {},
      ingredientsById: {},
      ingredientList: [],
      tagsById: {},
      tagList: [],
      allergensById: {},
      allergenList: [],
      mediaPaths: []
    },
    isDataLoading: false,
    hasDataLoaded: false,
    isPublishing: false,
    currentPanel: "dashboard",
    sidebarCollapsed: false,
    menuActiveAnchor: {
      categoryId: "",
      subcategoryId: ""
    },
    menuViewGroups: [],
    menuAnchorTargets: [],
    menuScrollSpyFrame: 0,
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
    }
  };

  var views = {
    login: document.getElementById("login-view"),
    dashboard: document.getElementById("dashboard-view"),
    dashboardPanel: document.getElementById("dashboard-panel"),
    menuBrowserPanel: document.getElementById("menu-browser-panel"),
    menuItemPanel: document.getElementById("menu-item-panel")
  };

  var elements = {
    sidebar: document.getElementById("admin-sidebar"),
    sidebarHomeButton: document.getElementById("sidebar-home-button"),
    sidebarToggleButton: document.getElementById("sidebar-toggle-button"),
    sidebarSearchButton: document.getElementById("sidebar-search-button"),
    sidebarNavDashboard: document.getElementById("sidebar-nav-dashboard"),
    sidebarNavMenu: document.getElementById("sidebar-nav-menu"),
    sidebarMenuAccordion: document.getElementById("sidebar-menu-accordion"),
    sidebarUserButton: document.getElementById("sidebar-user-button"),
    sidebarUserMenu: document.getElementById("sidebar-user-menu"),
    sidebarUserMenuName: document.getElementById("sidebar-user-menu-name"),
    sidebarUserMenuEmail: document.getElementById("sidebar-user-menu-email"),

    loginButton: document.getElementById("login-button"),
    logoutButton: document.getElementById("logout-button"),
    refreshDataButton: document.getElementById("refresh-data-button"),
    openMenuBrowserButton: document.getElementById("open-menu-browser-button"),

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
    metricAvailability: document.getElementById("metric-availability"),
    metricCategories: document.getElementById("metric-categories"),
    metricRestaurant: document.getElementById("metric-restaurant"),
    metricMedia: document.getElementById("metric-media"),

    menuBrowserStatus: document.getElementById("menu-browser-status"),
    menuBrowserGroups: document.getElementById("menu-browser-groups"),
    menuClearFilterButton: document.getElementById("menu-clear-filter-button"),
    menuNewItemButton: document.getElementById("menu-new-item-button"),

    itemEditorTitle: document.getElementById("item-editor-title"),
    itemEditorStatus: document.getElementById("item-editor-status"),
    itemEditorErrors: document.getElementById("item-editor-errors"),
    itemEditorActions: document.querySelector(".menu-item-editor__actions"),
    itemSaveButton: document.getElementById("item-save-button"),
    itemSaveCloseButton: document.getElementById("item-save-close-button"),
    itemExportJsonButton: document.getElementById("item-export-json-button"),
    itemPublishButton: document.getElementById("item-publish-button"),
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
    ingredientIndex: null
  };

  function deepClone(value) {
    if (typeof window.structuredClone === "function") {
      return window.structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value));
  }

  function getIdentity() {
    return window.netlifyIdentity || null;
  }

  function getUserEmail(user) {
    if (!user) return "";
    return user.email || (user.user_metadata && user.user_metadata.email) || "Usuario autenticado";
  }

  function getUserDisplayName(user) {
    if (!user) return "Usuario";

    var metadata = user.user_metadata || {};
    var appMetadata = user.app_metadata || {};
    var name =
      metadata.full_name ||
      metadata.name ||
      appMetadata.full_name ||
      appMetadata.name ||
      "";

    if (name) return String(name).trim();

    var email = getUserEmail(user);
    var localPart = String(email || "").split("@")[0];
    if (localPart) return localPart;

    return "Usuario";
  }

  function getInitials(value) {
    var text = String(value || "").trim();
    if (!text) return "U";

    var parts = text.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return (parts[0].slice(0, 1) + parts[1].slice(0, 1)).toUpperCase();
  }

  function setLoginMessage(message) {
    elements.loginMessage.textContent = message || "";
  }

  function setDataStatus(message) {
    elements.dataStatus.textContent = message || "";
  }

  function setDraftsBanner(show, message) {
    if (!elements.draftsBanner) return;
    elements.draftsBanner.classList.toggle("is-hidden", !show);
    if (typeof message === "string" && elements.draftsBannerText) {
      elements.draftsBannerText.textContent = message;
    }
  }

  function clearPersistedDraftsStorage() {
    try {
      window.localStorage.removeItem(LOCAL_DRAFTS_MENU_KEY);
      window.localStorage.removeItem(LOCAL_DRAFTS_AVAILABILITY_KEY);
      window.localStorage.removeItem(LOCAL_DRAFTS_FLAG_KEY);
    } catch (_error) {
      // ignore storage errors
    }
  }

  function persistDraftsToLocalStorage() {
    if (!state.drafts.menu || !state.drafts.availability) return;
    try {
      window.localStorage.setItem(LOCAL_DRAFTS_MENU_KEY, JSON.stringify(state.drafts.menu));
      window.localStorage.setItem(LOCAL_DRAFTS_AVAILABILITY_KEY, JSON.stringify(state.drafts.availability));
      window.localStorage.setItem(LOCAL_DRAFTS_FLAG_KEY, "1");
    } catch (_error) {
      // ignore storage errors
    }
  }

  function hydrateDraftsFromLocalStorage() {
    try {
      if (window.localStorage.getItem(LOCAL_DRAFTS_FLAG_KEY) !== "1") {
        return false;
      }

      var menuRaw = window.localStorage.getItem(LOCAL_DRAFTS_MENU_KEY);
      var availabilityRaw = window.localStorage.getItem(LOCAL_DRAFTS_AVAILABILITY_KEY);

      if (!menuRaw || !availabilityRaw) {
        clearPersistedDraftsStorage();
        return false;
      }

      var restoredMenu = JSON.parse(menuRaw);
      var restoredAvailability = JSON.parse(availabilityRaw);

      if (!restoredMenu || !Array.isArray(restoredMenu.sections)) {
        clearPersistedDraftsStorage();
        return false;
      }

      if (!restoredAvailability || !Array.isArray(restoredAvailability.items)) {
        clearPersistedDraftsStorage();
        return false;
      }

      state.drafts.menu = restoredMenu;
      state.drafts.availability = restoredAvailability;
      ensureMenuDraft();
      ensureAvailabilityDraft();
      return true;
    } catch (_error) {
      clearPersistedDraftsStorage();
      return false;
    }
  }

  function downloadJsonFile(filename, payload) {
    var jsonContent = JSON.stringify(payload, null, 2) + "\n";
    var blob = new Blob([jsonContent], { type: "application/json;charset=utf-8" });
    var url = window.URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(function () {
      window.URL.revokeObjectURL(url);
    }, 0);
  }

  function exportCurrentDrafts() {
    if (!state.drafts.menu || !state.drafts.availability) {
      setItemEditorStatus("No hay drafts cargados para exportar.");
      return;
    }

    downloadJsonFile("menu.updated.json", state.drafts.menu);
    downloadJsonFile("availability.updated.json", state.drafts.availability);

    if (elements.dataStatus) {
      setDataStatus("JSON exportados: menu.updated.json + availability.updated.json");
    }
  }

  async function publishChanges() {
    if (state.isPublishing) {
      return;
    }

    if (!state.drafts.menu || !state.drafts.availability) {
      setItemEditorStatus("Error: no hay drafts para publicar.");
      return;
    }

    var identity = getIdentity();
    var user = identity && typeof identity.currentUser === "function"
      ? identity.currentUser()
      : null;
    if (!user || typeof user.jwt !== "function") {
      setItemEditorStatus("Error: inicia sesion para publicar.");
      setDataStatus("Publish failed: Not logged in");
      return;
    }

    state.isPublishing = true;
    var publishButton = elements.itemPublishButton;
    var defaultPublishLabel = publishButton && publishButton.getAttribute("data-default-label")
      ? publishButton.getAttribute("data-default-label")
      : "Publish";
    if (publishButton && !publishButton.getAttribute("data-default-label")) {
      publishButton.setAttribute("data-default-label", defaultPublishLabel);
    }
    if (publishButton) {
      publishButton.disabled = true;
      publishButton.textContent = "Publishing...";
    }
    setItemEditorStatus("Publishing...");
    setDataStatus("Publishing...");

    try {
      var token = await user.jwt();
      var response = await fetch("/.netlify/functions/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
          menu: state.drafts.menu,
          availability: state.drafts.availability
        })
      });

      var responseText = await response.text();
      var payload = null;
      if (responseText) {
        try {
          payload = JSON.parse(responseText);
        } catch (_error) {
          payload = null;
        }
      }

      if (!response.ok) {
        var errorMessage = payload && payload.error
          ? payload.error
          : (responseText || ("HTTP " + response.status));
        throw new Error(errorMessage);
      }

      setItemEditorStatus("Published ✓");
      if (payload && payload.commit) {
        setDataStatus("Published ✓ (" + payload.commit + ")");
      } else {
        setDataStatus("Published ✓");
      }
      if (publishButton) {
        publishButton.textContent = "Published ✓";
      }
    } catch (error) {
      var message = error && error.message ? error.message : "Unknown error";
      setItemEditorStatus("Publish failed");
      setDataStatus("Publish failed: " + message);
      if (publishButton) {
        publishButton.textContent = "Publish failed";
      }
    } finally {
      state.isPublishing = false;
      if (publishButton) {
        publishButton.disabled = false;
        window.setTimeout(function () {
          publishButton.textContent = defaultPublishLabel;
        }, 1800);
      }
    }
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
    elements.sessionAvatar.textContent = getInitials(displayName);
    elements.sidebarUserMenuName.textContent = displayName;
    elements.sidebarUserMenuEmail.textContent = email;
    closeSidebarUserMenu();
    views.dashboard.classList.remove("is-hidden");
    views.login.classList.add("is-hidden");
    setLoginMessage("");
    ensureDataLoaded(false);
    applyRoute();
  }

  function readStoredSidebarCollapsed() {
    try {
      return window.localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === "1";
    } catch (_error) {
      return false;
    }
  }

  function isCompactViewport() {
    return window.matchMedia("(max-width: 900px)").matches;
  }

  function setSidebarCollapsed(nextCollapsed, options) {
    if (!elements.sidebar) return;

    var allowCollapse = !isCompactViewport();
    var collapsed = Boolean(nextCollapsed) && allowCollapse;
    state.sidebarCollapsed = collapsed;

    elements.sidebar.setAttribute("data-collapsed", collapsed ? "true" : "false");
    elements.sidebarToggleButton.setAttribute("aria-pressed", collapsed ? "true" : "false");

    if (options && options.persist) {
      try {
        window.localStorage.setItem(SIDEBAR_COLLAPSE_KEY, collapsed ? "1" : "0");
      } catch (_error) {
        // ignore storage errors
      }
    }

    if (collapsed) {
      closeSidebarUserMenu();
    }
  }

  function syncSidebarViewportState() {
    if (isCompactViewport()) {
      setSidebarCollapsed(false, { persist: false });
      return;
    }
    setSidebarCollapsed(readStoredSidebarCollapsed(), { persist: false });
  }

  function isSidebarUserMenuOpen() {
    return !elements.sidebarUserMenu.classList.contains("is-hidden");
  }

  function closeSidebarUserMenu() {
    elements.sidebarUserMenu.classList.add("is-hidden");
    elements.sidebarUserButton.setAttribute("aria-expanded", "false");
  }

  function openSidebarUserMenu() {
    elements.sidebarUserMenu.classList.remove("is-hidden");
    elements.sidebarUserButton.setAttribute("aria-expanded", "true");
  }

  function toggleSidebarUserMenu() {
    if (isSidebarUserMenuOpen()) {
      closeSidebarUserMenu();
      return;
    }
    openSidebarUserMenu();
  }

  function showMenuAccordion(show) {
    elements.sidebarMenuAccordion.classList.toggle("is-open", !!show);
    elements.sidebarMenuAccordion.setAttribute("aria-hidden", show ? "false" : "true");
  }

  function setActivePanel(panel) {
    state.currentPanel = panel;
    closeSidebarUserMenu();

    views.dashboardPanel.classList.add("is-hidden");
    views.menuBrowserPanel.classList.add("is-hidden");
    views.menuItemPanel.classList.add("is-hidden");

    if (panel === "menu-browser") {
      views.menuBrowserPanel.classList.remove("is-hidden");
    } else if (panel === "menu-item") {
      views.menuItemPanel.classList.remove("is-hidden");
    } else {
      views.dashboardPanel.classList.remove("is-hidden");
    }

    var isMenuPanel = panel === "menu-browser" || panel === "menu-item";
    elements.sidebarNavDashboard.classList.toggle("is-active", panel === "dashboard");
    elements.sidebarNavMenu.classList.toggle("is-active", isMenuPanel);
    elements.sidebarHomeButton.classList.toggle("is-active", panel === "dashboard");
    showMenuAccordion(isMenuPanel);

    if (elements.topbar) {
      elements.topbar.classList.toggle("is-hidden", isMenuPanel);
    }
  }

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

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function slugify(value) {
    return normalizeText(value)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .trim();
  }

  function resolveAssetPath(path) {
    if (!path) return "/" + MENU_PLACEHOLDER_IMAGE;
    if (/^https?:\/\//i.test(path)) return path;
    if (path[0] === "/") return path;
    return "/" + path.replace(/^\.\/?/, "");
  }

  async function fetchJson(endpoint) {
    var response = await fetch(endpoint, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(endpoint + " devolvio " + response.status);
    }
    return response.json();
  }

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

  function buildIndexes() {
    var categoriesRaw = (((state.data || {}).categories || {}).categories || []).filter(function (category) {
      return category && category.enabled !== false;
    });

    state.indexes.categoryList = sortByOrder(categoriesRaw).map(function (category) {
      var categoryCopy = deepClone(category);
      categoryCopy.subcategories = sortByOrder((categoryCopy.subcategories || []).filter(function (sub) {
        return sub && sub.enabled !== false;
      }));
      return categoryCopy;
    });

    state.indexes.categoriesById = {};
    state.indexes.categoryList.forEach(function (category) {
      state.indexes.categoriesById[category.id] = category;
    });

    var ingredientsSource = (state.data && state.data.ingredients) || {};
    state.indexes.ingredientsById = ingredientsSource.ingredients || {};
    state.indexes.ingredientList = Object.keys(state.indexes.ingredientsById).map(function (id) {
      var entry = state.indexes.ingredientsById[id] || {};
      var iconId = entry.icon;
      var iconMap = (ingredientsSource.icons && ingredientsSource.icons[iconId]) || null;
      return {
        id: id,
        label: entry.label || id,
        icon: iconMap && iconMap.icon ? iconMap.icon : ""
      };
    }).sort(function (a, b) {
      return normalizeText(a.label).localeCompare(normalizeText(b.label));
    });

    state.indexes.tagsById = ingredientsSource.tags || {};
    state.indexes.tagList = Object.keys(state.indexes.tagsById).sort();

    state.indexes.allergensById = ingredientsSource.allergens || {};
    state.indexes.allergenList = Object.keys(state.indexes.allergensById).sort();

    var mediaPathsSet = new Set([MENU_PLACEHOLDER_IMAGE]);
    var mediaItems = ((state.data && state.data.media && state.data.media.items) || {});
    Object.keys(mediaItems).forEach(function (itemId) {
      var mediaEntry = mediaItems[itemId] || {};
      [mediaEntry.card, mediaEntry.hover, mediaEntry.modal].forEach(function (path) {
        if (path) mediaPathsSet.add(path);
      });
    });

    getAllMenuItems().forEach(function (entry) {
      if (entry.item && entry.item.image) {
        mediaPathsSet.add(entry.item.image);
      }
    });

    state.indexes.mediaPaths = Array.from(mediaPathsSet).sort(function (a, b) {
      return normalizeText(a).localeCompare(normalizeText(b));
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
      var restoredFromLocalDrafts = hydrateDraftsFromLocalStorage();
      ensureMenuDraft();
      ensureAvailabilityDraft();
      buildIndexes();
      state.hasDataLoaded = true;
      updateDashboardMetrics();

      renderMenuBrowser();
      renderSidebarMenuAccordion();

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
    if (!state.data || !state.data.menu || !state.data.availability) {
      clearPersistedDraftsStorage();
      setDraftsBanner(false);
      return;
    }

    state.drafts.menu = deepClone(state.data.menu);
    state.drafts.availability = deepClone(state.data.availability);
    ensureMenuDraft();
    ensureAvailabilityDraft();
    buildIndexes();
    updateDashboardMetrics();
    renderMenuBrowser();
    renderSidebarMenuAccordion();

    if (state.currentPanel === "menu-item") {
      openMenuBrowser({ skipRoute: true });
    } else {
      applyRoute();
    }

    clearPersistedDraftsStorage();
    setDraftsBanner(false);
    setDataStatus("Drafts locales limpiados. Se restauro el estado base de /data.");
    setItemEditorStatus("");
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

    var targetTop = window.scrollY + element.getBoundingClientRect().top - 96;
    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: "smooth"
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

    if (!options.skipRender) {
      renderSidebarMenuAccordion();
    }
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
    if (!state.menuAnchorTargets.length) return;

    var threshold = 154;
    var activeTarget = state.menuAnchorTargets[0];

    state.menuAnchorTargets.forEach(function (target) {
      if (!target.element || !target.element.isConnected) return;
      if (target.element.getBoundingClientRect().top - threshold <= 0) {
        activeTarget = target;
      }
    });

    setActiveMenuAnchor(activeTarget.categoryId, activeTarget.subcategoryId, {
      force: Boolean(force)
    });
  }

  function requestMenuScrollSpyUpdate() {
    if (state.currentPanel !== "menu-browser") return;
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
    var activeSubcategoryId = state.menuActiveAnchor.subcategoryId;

    var html = groups.map(function (group) {
      var categoryIsActive = activeCategoryId === group.id;
      var categoryButtonClass = "sidebar-accordion-category__toggle" + (categoryIsActive ? " is-active" : "");
      var sidebarSubgroups = (group.subgroups || []).filter(function (subgroup) {
        return Boolean(subgroup.id);
      });

      var subgroupsHtml = "";
      if (sidebarSubgroups.length > 0) {
        subgroupsHtml = "<ul class=\"sidebar-accordion-subcategories\">" +
          sidebarSubgroups.map(function (subgroup) {
            var subgroupIsActive = categoryIsActive && activeSubcategoryId === subgroup.id;
            var subgroupClass = "sidebar-accordion-subcategory" + (subgroupIsActive ? " is-active" : "");

            return (
              "<li><button class=\"" + subgroupClass + "\" type=\"button\" data-scroll-category=\"" +
              escapeHtml(group.id) + "\" data-scroll-subcategory=\"" + escapeHtml(subgroup.id) + "\">" +
              escapeHtml(subgroup.label || subgroup.id) +
              "</button></li>"
            );
          }).join("") +
          "</ul>";
      }

      return (
        "<div class=\"sidebar-accordion-category\" data-category-id=\"" + escapeHtml(group.id) + "\">" +
        "<button class=\"" + categoryButtonClass + "\" type=\"button\" data-scroll-category=\"" +
        escapeHtml(group.id) + "\" data-scroll-subcategory=\"\">" +
        "<span>" + escapeHtml(group.label || group.id) + "</span>" +
        "</button>" +
        subgroupsHtml +
        "</div>"
      );
    }).join("");

    elements.sidebarMenuAccordion.innerHTML = html;
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
    var mediaItems = (state.data && state.data.media && state.data.media.items) || {};
    return mediaItems[itemId] || null;
  }

  function resolveCardImageForItem(item) {
    var mediaEntry = getMediaEntryForItem(item.id);
    var path = item.image || (mediaEntry && mediaEntry.card) || MENU_PLACEHOLDER_IMAGE;
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
            escapeHtml(item.name || item.id) + "\" loading=\"lazy\" />" +
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
    var options = ['<option value="">(sin seleccion)</option>'];
    state.indexes.mediaPaths.forEach(function (path) {
      options.push("<option value=\"" + escapeHtml(path) + "\">" + escapeHtml(path) + "</option>");
    });
    elements.itemMediaPicker.innerHTML = options.join("");
    elements.itemMediaPicker.value = selectedPath || "";
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
    var html = state.itemEditor.ingredients.map(function (ingredientId, index) {
      var ingredient = state.indexes.ingredientsById[ingredientId] || {};
      var label = ingredient.label || ingredientId;
      var iconId = ingredient.icon;
      var iconMap = (state.data.ingredients && state.data.ingredients.icons && state.data.ingredients.icons[iconId]) || null;
      var iconPath = iconMap && iconMap.icon ? resolveAssetPath(iconMap.icon) : "";

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

    elements.previewCardImage.src = resolveCardImageForItem(draft);
    elements.previewCardImage.alt = draft.name || draft.id;
    elements.previewCardName.textContent = draft.name || draft.id || "-";
    elements.previewCardShort.textContent = draft.descriptionShort || "Sin descripcion corta";

    var badges = getItemBadges(draft);
    elements.previewCardBadges.innerHTML = badges.map(function (badge) {
      return "<span class=\"" + badge.className + "\">" + escapeHtml(badge.label) + "</span>";
    }).join("");

    elements.previewModalImage.src = resolveCardImageForItem(draft);
    elements.previewModalImage.alt = draft.name || draft.id;
    elements.previewModalName.textContent = draft.name || draft.id || "-";
    elements.previewModalLong.textContent =
      draft.descriptionLong || draft.descriptionShort || "Sin descripcion larga";

    var currency = (state.drafts.menu && state.drafts.menu.currency) || "DOP";
    var price = Number(draft.price) || 0;
    elements.previewModalPrice.textContent = currency + " " + price.toFixed(0);

    elements.itemPricePreview.textContent = currency + " " + price.toFixed(0);
    elements.itemSpicyLevelValue.textContent = String(Number(draft.spicy_level) || 0);

    var imagePath = draft.image || "";
    elements.itemMediaPreview.src = resolveAssetPath(imagePath || MENU_PLACEHOLDER_IMAGE);
  }

  function syncDraftFromForm() {
    var draft = state.itemEditor.draft;
    if (!draft) return;

    draft.name = elements.itemFieldName.value.trim();
    draft.slug = elements.itemFieldSlug.value.trim();
    draft.category = elements.itemFieldCategory.value;
    draft.subcategory = elements.itemFieldSubcategory.value;
    draft.price = Math.max(0, Math.round(Number(elements.itemFieldPrice.value || 0)));
    draft.featured = Boolean(elements.itemFieldFeatured.checked);
    draft.descriptionShort = elements.itemFieldDescriptionShort.value.trim();
    draft.descriptionLong = elements.itemFieldDescriptionLong.value.trim();
    draft.ingredients = state.itemEditor.ingredients.slice();
    draft.tags = state.itemEditor.tags.slice();
    draft.allergens = state.itemEditor.allergens.slice();
    draft.image = elements.itemFieldImage.value.trim() || MENU_PLACEHOLDER_IMAGE;
    draft.spicy_level = Number(elements.itemFieldSpicyLevel.value || 0);
    draft.vegetarian = Boolean(elements.itemFieldVegetarian.checked);
    draft.vegan = Boolean(elements.itemFieldVegan.checked);

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

    state.itemEditor.availability.available = Boolean(elements.itemAvailabilityToggle.checked);
    state.itemEditor.availability.soldOutReason = elements.itemAvailabilityReason.value.trim();

    renderItemPreview();
  }

  function openItemEditor(itemId, options) {
    options = options || {};

    if (!state.hasDataLoaded) {
      ensureDataLoaded(false);
      return;
    }

    var itemPosition = findItemPositionById(itemId);
    if (!itemPosition) {
      setMenuBrowserStatus("No se encontro el item: " + itemId);
      openMenuBrowser({ skipRoute: true });
      if (!options.skipRoute) {
        navigateToRoute("/menu", { replace: true });
      }
      return;
    }

    var draft = deepClone(itemPosition.item);
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
    elements.itemFieldFeatured.checked = Boolean(draft.featured);

    elements.itemFieldDescriptionShort.value = draft.descriptionShort || "";
    elements.itemFieldDescriptionLong.value = draft.descriptionLong || "";

    elements.itemFieldImage.value = draft.image || "";

    elements.itemAvailabilityToggle.checked = state.itemEditor.availability.available;
    elements.itemAvailabilityReason.value = state.itemEditor.availability.soldOutReason;

    elements.itemFieldSpicyLevel.value = Number(draft.spicy_level || 0);
    elements.itemFieldVegetarian.checked = Boolean(draft.vegetarian);
    elements.itemFieldVegan.checked = Boolean(draft.vegan);
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

    if (!options.skipRoute) {
      navigateToRoute("/menu/item/" + encodeURIComponent(draft.id));
    }
  }

  function openNewItemEditor() {
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
    elements.itemFieldFeatured.checked = false;

    elements.itemFieldDescriptionShort.value = "";
    elements.itemFieldDescriptionLong.value = "";
    elements.itemFieldImage.value = draft.image;

    elements.itemAvailabilityToggle.checked = true;
    elements.itemAvailabilityReason.value = "";

    elements.itemFieldSpicyLevel.value = "0";
    elements.itemFieldVegetarian.checked = false;
    elements.itemFieldVegan.checked = false;
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
    navigateToRoute("/menu/item/" + encodeURIComponent(draft.id));
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

    state.itemEditor.sourceSectionId = persistedPosition ? persistedPosition.sectionId : targetSection.id;
    state.itemEditor.sourceItemIndex = persistedPosition ? persistedPosition.itemIndex : -1;
    state.itemEditor.draft = deepClone(draft);

    updateDashboardMetrics();
    renderMenuBrowser();
    renderSidebarMenuAccordion();
    persistDraftsToLocalStorage();
    setDraftsBanner(true, "Drafts locales activos (Clear drafts | Export)");

    showItemEditorErrors([]);

    if (closeAfterSave) {
      openMenuBrowser({ skipRoute: false });
      setMenuBrowserStatus("Item guardado: " + draft.name + " (" + draft.id + ")");
      var targetCategoryId = mapCategoryToMenuGroup(draft.category);
      window.setTimeout(function () {
        scrollToMenuAnchor(targetCategoryId, "");
        setActiveMenuAnchor(targetCategoryId, "", { force: true });
      }, 40);
      return;
    }

    setItemEditorStatus("Item guardado correctamente.");
    openItemEditor(draft.id, { skipRoute: true, isNew: false });
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

    updateDashboardMetrics();
    renderMenuBrowser();
    renderSidebarMenuAccordion();
    persistDraftsToLocalStorage();
    setDraftsBanner(true, "Drafts locales activos (Clear drafts | Export)");

    openMenuBrowser({ skipRoute: false });
    setMenuBrowserStatus("Item eliminado: " + draft.id);
  }

  function cancelItemEditor() {
    openMenuBrowser({ skipRoute: false });
    setMenuBrowserStatus("Edicion cancelada.");
  }

  function updateDashboardMetrics() {
    if (!state.hasDataLoaded) {
      elements.metricMenu.textContent = "-";
      elements.metricCategories.textContent = "-";
      elements.metricAvailability.textContent = "-";
      elements.metricHome.textContent = "-";
      elements.metricRestaurant.textContent = "-";
      elements.metricMedia.textContent = "-";
      return;
    }

    var menuItemsCount = getAllMenuItems().length;
    elements.metricMenu.textContent = menuItemsCount + " items";

    elements.metricCategories.textContent = state.indexes.categoryList.length + " categorias";

    var menuItemIds = new Set(getAllMenuItems().map(function (entry) {
      return entry.item.id;
    }));

    var availabilityItems = (state.drafts.availability && state.drafts.availability.items) || [];
    var matchingAvailability = availabilityItems.filter(function (availabilityEntry) {
      return menuItemIds.has(availabilityEntry.itemId);
    });
    var availableCount = matchingAvailability.filter(function (availabilityEntry) {
      return Boolean(availabilityEntry.available);
    }).length;

    elements.metricAvailability.textContent =
      availableCount + " / " + matchingAvailability.length + " disponibles";

    var homeData = state.data.home || {};
    var featuredCount =
      homeData.popular && Array.isArray(homeData.popular.featuredIds)
        ? homeData.popular.featuredIds.length
        : 0;
    var heroTitle = homeData.hero && homeData.hero.title ? homeData.hero.title : "Sin hero";
    elements.metricHome.textContent = featuredCount + " featured · " + heroTitle;

    var restaurant = state.data.restaurant || {};
    var phone = restaurant.phone || "Sin telefono";
    var city = restaurant.address && restaurant.address.city ? restaurant.address.city : "";
    elements.metricRestaurant.textContent = city ? phone + " · " + city : phone;

    var mediaItems = (state.data.media && state.data.media.items) || {};
    elements.metricMedia.textContent = Object.keys(mediaItems).length + " media items";
  }

  function openDashboard(options) {
    options = options || {};
    setActivePanel("dashboard");
    setMenuBrowserStatus("");
    setItemEditorStatus("");

    if (!options.skipRoute) {
      navigateToRoute("/dashboard", { replace: Boolean(options.replaceRoute) });
    }
  }

  function openMenuBrowser(options) {
    options = options || {};

    if (!state.hasDataLoaded) {
      ensureDataLoaded(false);
      return;
    }

    setActivePanel("menu-browser");
    renderMenuBrowser();
    renderSidebarMenuAccordion();

    if (!options.skipRoute) {
      navigateToRoute("/menu", { replace: Boolean(options.replaceRoute) });
    }

    window.requestAnimationFrame(function () {
      updateMenuScrollSpy(true);
    });
  }

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
      return {
        name: "menu-item",
        itemId: decodeURIComponent(parts.slice(2).join("/"))
      };
    }

    if (parts[0] === "menu") {
      return { name: "menu" };
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

    if (route.name === "menu") {
      if (!state.hasDataLoaded) {
        ensureDataLoaded(false);
        return;
      }
      openMenuBrowser({ skipRoute: true });
      return;
    }

    openDashboard({ skipRoute: true });
  }

  function bindSidebarEvents() {
    elements.sidebarHomeButton.addEventListener("click", function () {
      openDashboard({ skipRoute: false });
    });

    elements.sidebarNavDashboard.addEventListener("click", function () {
      openDashboard({ skipRoute: false });
    });

    elements.sidebarNavMenu.addEventListener("click", function () {
      openMenuBrowser({ skipRoute: false });
    });

    elements.sidebarToggleButton.addEventListener("click", function () {
      setSidebarCollapsed(!state.sidebarCollapsed, { persist: true });
    });

    elements.sidebarSearchButton.addEventListener("click", function () {
      setDataStatus("Buscador global en construccion. Usa el sidebar para navegar por ahora.");
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
        openMenuBrowser({ skipRoute: false });
        window.setTimeout(function () {
          scrollToMenuAnchor(categoryValue, subcategoryValue);
          setActiveMenuAnchor(categoryValue, subcategoryValue, { force: true });
        }, 40);
        return;
      }

      scrollToMenuAnchor(categoryValue, subcategoryValue);
      setActiveMenuAnchor(categoryValue, subcategoryValue, { force: true });
    });
  }

  function bindMenuBrowserEvents() {
    elements.openMenuBrowserButton.addEventListener("click", function () {
      openMenuBrowser({ skipRoute: false });
    });

    elements.menuClearFilterButton.addEventListener("click", function () {
      var firstGroup = state.menuViewGroups[0];
      if (firstGroup) {
        scrollToMenuAnchor(firstGroup.id, "");
        setActiveMenuAnchor(firstGroup.id, "", { force: true });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
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
      elements.itemFieldFeatured,
      elements.itemFieldDescriptionShort,
      elements.itemFieldDescriptionLong,
      elements.itemFieldImage,
      elements.itemAvailabilityToggle,
      elements.itemAvailabilityReason,
      elements.itemFieldSpicyLevel,
      elements.itemFieldVegetarian,
      elements.itemFieldVegan,
      elements.itemFieldSpicyLegacy,
      elements.itemFieldReviews
    ].forEach(function (inputElement) {
      inputElement.addEventListener("input", syncDraftFromForm);
      inputElement.addEventListener("change", syncDraftFromForm);
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

    if (elements.itemPublishButton) {
      elements.itemPublishButton.addEventListener("click", function () {
        publishChanges();
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

  function bindEvents() {
    elements.loginButton.addEventListener("click", function () {
      openIdentityModal();
    });

    elements.logoutButton.addEventListener("click", function () {
      closeSidebarUserMenu();
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
    bindMenuBrowserEvents();
    bindItemEditorEvents();

    window.addEventListener("resize", function () {
      syncSidebarViewportState();
      refreshMenuScrollAnchors();
      requestMenuScrollSpyUpdate();
    });
    window.addEventListener("scroll", requestMenuScrollSpyUpdate, { passive: true });
    syncSidebarViewportState();

    window.addEventListener("hashchange", applyRoute);

    document.addEventListener("click", function (event) {
      if (!isSidebarUserMenuOpen()) return;
      if (elements.sidebarUserButton.contains(event.target)) return;
      if (elements.sidebarUserMenu.contains(event.target)) return;
      closeSidebarUserMenu();
    });

    window.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isSidebarUserMenuOpen()) {
        closeSidebarUserMenu();
      }

      var isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (!isShortcut) return;
      event.preventDefault();
      elements.sidebarSearchButton.click();
    });
  }

  function initAuth() {
    var identity = getIdentity();
    if (!identity) {
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

      state.data = null;
      state.drafts.menu = null;
      state.drafts.availability = null;
      state.hasDataLoaded = false;
      state.currentPanel = "dashboard";
      state.menuActiveAnchor = { categoryId: "", subcategoryId: "" };
      state.menuViewGroups = [];
      state.menuAnchorTargets = [];
      if (state.menuScrollSpyFrame) {
        window.cancelAnimationFrame(state.menuScrollSpyFrame);
        state.menuScrollSpyFrame = 0;
      }
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

      setDataStatus("Inicia sesion para cargar datos.");
      setMenuBrowserStatus("");
      setItemEditorStatus("");
      showItemEditorErrors([]);
      setDraftsBanner(false);
      updateDashboardMetrics();
    });

    identity.on("error", function (error) {
      var message = "Error de autenticacion.";
      if (error && error.message) {
        message = error.message;
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
