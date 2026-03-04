(function () {
  var state = {
    data: null,
    menuDraft: null,
    selectedItemRef: null,
    isDataLoading: false,
    hasDataLoaded: false,
    isMenuDirty: false
  };

  var views = {
    login: document.getElementById("login-view"),
    dashboard: document.getElementById("dashboard-view"),
    dashboardPanel: document.getElementById("dashboard-panel"),
    menuEditorPanel: document.getElementById("menu-editor-panel")
  };

  var elements = {
    loginButton: document.getElementById("login-button"),
    logoutButton: document.getElementById("logout-button"),
    refreshDataButton: document.getElementById("refresh-data-button"),
    openMenuEditorButton: document.getElementById("open-menu-editor-button"),
    menuEditorBackButton: document.getElementById("menu-editor-back-button"),
    menuAddItemButton: document.getElementById("menu-add-item-button"),
    menuCopyJsonButton: document.getElementById("menu-copy-json-button"),
    menuDownloadJsonButton: document.getElementById("menu-download-json-button"),
    sessionEmail: document.getElementById("session-email"),
    loginMessage: document.getElementById("login-message"),
    dataStatus: document.getElementById("data-status"),
    menuEditorStatus: document.getElementById("menu-editor-status"),
    metricMenu: document.getElementById("metric-menu"),
    metricHome: document.getElementById("metric-home"),
    metricAvailability: document.getElementById("metric-availability"),
    metricCategories: document.getElementById("metric-categories"),
    metricRestaurant: document.getElementById("metric-restaurant"),
    metricMedia: document.getElementById("metric-media"),
    menuSectionFilter: document.getElementById("menu-section-filter"),
    menuItemsList: document.getElementById("menu-items-list"),
    menuItemForm: document.getElementById("menu-item-form"),
    menuFormTitle: document.getElementById("menu-form-title"),
    menuDeleteItemButton: document.getElementById("menu-delete-item-button"),
    menuFieldSection: document.getElementById("menu-field-section"),
    menuFieldId: document.getElementById("menu-field-id"),
    menuFieldName: document.getElementById("menu-field-name"),
    menuFieldPrice: document.getElementById("menu-field-price"),
    menuFieldCategory: document.getElementById("menu-field-category"),
    menuFieldIngredients: document.getElementById("menu-field-ingredients"),
    menuFieldTags: document.getElementById("menu-field-tags")
  };

  var DATA_ENDPOINTS = {
    menu: "/data/menu.json",
    categories: "/data/categories.json",
    availability: "/data/availability.json",
    home: "/data/home.json",
    restaurant: "/data/restaurant.json",
    media: "/data/media.json"
  };

  function getIdentity() {
    return window.netlifyIdentity || null;
  }

  function deepClone(value) {
    if (typeof window.structuredClone === "function") {
      return window.structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value));
  }

  function parseCsv(input) {
    if (!input) return [];
    return input
      .split(",")
      .map(function (item) {
        return item.trim();
      })
      .filter(Boolean);
  }

  function getUserEmail(user) {
    if (!user) return "";
    return user.email || (user.user_metadata && user.user_metadata.email) || "Usuario autenticado";
  }

  function setLoginMessage(message) {
    elements.loginMessage.textContent = message || "";
  }

  function setDataStatus(message) {
    elements.dataStatus.textContent = message || "";
  }

  function setMenuEditorStatus(message) {
    elements.menuEditorStatus.textContent = message || "";
  }

  function showLoginView(message) {
    views.login.classList.remove("is-hidden");
    views.dashboard.classList.add("is-hidden");
    setLoginMessage(message || "");
  }

  function showDashboardView(user) {
    elements.sessionEmail.textContent = getUserEmail(user);
    views.dashboard.classList.remove("is-hidden");
    views.login.classList.add("is-hidden");
    setLoginMessage("");
    setActivePanel("dashboard");
    ensureDataLoaded(false);
  }

  function setActivePanel(panel) {
    if (panel === "menu-editor") {
      views.dashboardPanel.classList.add("is-hidden");
      views.menuEditorPanel.classList.remove("is-hidden");
      return;
    }

    views.dashboardPanel.classList.remove("is-hidden");
    views.menuEditorPanel.classList.add("is-hidden");
  }

  function hashHasAuthToken() {
    return /(?:^#|[&#])(invite_token|recovery_token|confirmation_token)=/i.test(
      window.location.hash
    );
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

  async function fetchJson(endpoint) {
    var response = await fetch(endpoint, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(endpoint + " devolvio " + response.status);
    }
    return response.json();
  }

  function countMenuItems(menuData) {
    if (!menuData || !Array.isArray(menuData.sections)) return 0;
    return menuData.sections.reduce(function (sum, section) {
      var items = Array.isArray(section.items) ? section.items.length : 0;
      return sum + items;
    }, 0);
  }

  function countMediaItems(mediaData) {
    if (!mediaData || typeof mediaData.items !== "object" || mediaData.items === null) return 0;
    return Object.keys(mediaData.items).length;
  }

  function formatAvailabilityMetric(availabilityData) {
    if (!availabilityData || !Array.isArray(availabilityData.items)) return "-";
    var total = availabilityData.items.length;
    var available = availabilityData.items.filter(function (item) {
      return Boolean(item.available);
    }).length;
    return available + " / " + total + " disponibles";
  }

  function formatHomeMetric(homeData) {
    if (!homeData) return "-";
    var heroTitle = homeData.hero && homeData.hero.title ? homeData.hero.title : "Sin hero";
    var featuredCount =
      homeData.popular && Array.isArray(homeData.popular.featuredIds)
        ? homeData.popular.featuredIds.length
        : 0;
    return featuredCount + " featured · " + heroTitle;
  }

  function formatRestaurantMetric(restaurantData) {
    if (!restaurantData) return "-";
    var phone = restaurantData.phone || "Sin telefono";
    var city = restaurantData.address && restaurantData.address.city ? restaurantData.address.city : "";
    return city ? phone + " · " + city : phone;
  }

  function updateDashboardMetrics() {
    if (!state.data) {
      elements.metricMenu.textContent = "-";
      elements.metricCategories.textContent = "-";
      elements.metricAvailability.textContent = "-";
      elements.metricHome.textContent = "-";
      elements.metricRestaurant.textContent = "-";
      elements.metricMedia.textContent = "-";
      return;
    }

    elements.metricMenu.textContent = countMenuItems(state.menuDraft || state.data.menu) + " items";
    elements.metricCategories.textContent =
      (state.data.categories &&
        Array.isArray(state.data.categories.categories) &&
        state.data.categories.categories.length) +
      " categorias";
    elements.metricAvailability.textContent = formatAvailabilityMetric(state.data.availability);
    elements.metricHome.textContent = formatHomeMetric(state.data.home);
    elements.metricRestaurant.textContent = formatRestaurantMetric(state.data.restaurant);
    elements.metricMedia.textContent = countMediaItems(state.data.media) + " media items";
  }

  async function loadAllData(forceReload) {
    if (state.isDataLoading) return;
    if (state.hasDataLoaded && !forceReload) return;

    state.isDataLoading = true;
    elements.refreshDataButton.disabled = true;
    setDataStatus("Cargando JSON desde /data ...");

    try {
      var endpoints = Object.entries(DATA_ENDPOINTS);
      var results = await Promise.all(
        endpoints.map(function (pair) {
          return fetchJson(pair[1]);
        })
      );

      state.data = {};
      endpoints.forEach(function (pair, index) {
        state.data[pair[0]] = results[index];
      });

      state.menuDraft = deepClone(state.data.menu);
      state.selectedItemRef = null;
      state.hasDataLoaded = true;
      state.isMenuDirty = false;

      buildSectionSelectOptions();
      renderMenuItemsList();
      resetFormState();
      updateDashboardMetrics();

      setDataStatus("JSON cargados correctamente (" + new Date().toLocaleTimeString("es-DO") + ").");
      setMenuEditorStatus("");
    } catch (error) {
      setDataStatus("No se pudo cargar /data/*.json: " + error.message);
      setMenuEditorStatus("No se puede abrir el editor hasta que cargue menu.json.");
    } finally {
      state.isDataLoading = false;
      elements.refreshDataButton.disabled = false;
    }
  }

  function ensureDataLoaded(forceReload) {
    loadAllData(Boolean(forceReload));
  }

  function getSections() {
    if (!state.menuDraft || !Array.isArray(state.menuDraft.sections)) return [];
    return state.menuDraft.sections;
  }

  function getSectionById(sectionId) {
    return getSections().find(function (section) {
      return section.id === sectionId;
    });
  }

  function getItemByRef(ref) {
    if (!ref) return null;
    var section = getSectionById(ref.sectionId);
    if (!section || !Array.isArray(section.items)) return null;
    if (ref.itemIndex < 0 || ref.itemIndex >= section.items.length) return null;
    return section.items[ref.itemIndex];
  }

  function getCurrentFilterSectionId() {
    return elements.menuSectionFilter.value;
  }

  function setCurrentFilterSectionId(sectionId) {
    elements.menuSectionFilter.value = sectionId || "";
  }

  function buildSectionSelectOptions() {
    var sections = getSections();
    var selectedFilter = getCurrentFilterSectionId();

    elements.menuSectionFilter.innerHTML = "";
    elements.menuFieldSection.innerHTML = "";

    sections.forEach(function (section) {
      var text = section.label ? section.label + " (" + section.id + ")" : section.id;

      var filterOption = document.createElement("option");
      filterOption.value = section.id;
      filterOption.textContent = text;
      elements.menuSectionFilter.appendChild(filterOption);

      var fieldOption = document.createElement("option");
      fieldOption.value = section.id;
      fieldOption.textContent = text;
      elements.menuFieldSection.appendChild(fieldOption);
    });

    if (!sections.length) return;

    if (selectedFilter && getSectionById(selectedFilter)) {
      setCurrentFilterSectionId(selectedFilter);
    } else {
      setCurrentFilterSectionId(sections[0].id);
    }
  }

  function getItemsForFilterSection() {
    var section = getSectionById(getCurrentFilterSectionId());
    if (!section || !Array.isArray(section.items)) return [];

    return section.items.map(function (item, itemIndex) {
      return {
        sectionId: section.id,
        itemIndex: itemIndex,
        item: item
      };
    });
  }

  function renderMenuItemsList() {
    var items = getItemsForFilterSection();
    elements.menuItemsList.innerHTML = "";

    if (!items.length) {
      var empty = document.createElement("li");
      empty.className = "menu-list-empty";
      empty.textContent = "No hay items en esta seccion.";
      elements.menuItemsList.appendChild(empty);
      return;
    }

    items.forEach(function (entry) {
      var li = document.createElement("li");
      var row = document.createElement("button");
      row.type = "button";
      row.className = "menu-item-row";

      var isActive =
        state.selectedItemRef &&
        state.selectedItemRef.sectionId === entry.sectionId &&
        state.selectedItemRef.itemIndex === entry.itemIndex;
      if (isActive) {
        row.classList.add("is-active");
      }

      row.dataset.sectionId = entry.sectionId;
      row.dataset.itemIndex = String(entry.itemIndex);

      var price = Number(entry.item.price) || 0;
      row.innerHTML =
        '<p class="menu-item-row__title">' +
        escapeHtml(entry.item.name || "Sin nombre") +
        "</p>" +
        '<p class="menu-item-row__meta">' +
        escapeHtml(entry.item.id || "sin-id") +
        " · DOP " +
        price.toFixed(0) +
        "</p>";

      li.appendChild(row);
      elements.menuItemsList.appendChild(li);
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function resetFormState() {
    elements.menuFormTitle.textContent = "Editar item";
    elements.menuItemForm.reset();
    elements.menuDeleteItemButton.disabled = true;

    var sections = getSections();
    if (sections.length) {
      elements.menuFieldSection.value = getCurrentFilterSectionId() || sections[0].id;
    }
  }

  function openItemInForm(ref) {
    var item = getItemByRef(ref);
    if (!item) {
      resetFormState();
      return;
    }

    state.selectedItemRef = {
      sectionId: ref.sectionId,
      itemIndex: ref.itemIndex
    };

    elements.menuFormTitle.textContent = "Editar item: " + (item.name || item.id || "Sin nombre");
    elements.menuDeleteItemButton.disabled = false;

    elements.menuFieldSection.value = ref.sectionId;
    elements.menuFieldId.value = item.id || "";
    elements.menuFieldName.value = item.name || "";
    elements.menuFieldPrice.value = Number(item.price || 0);
    elements.menuFieldCategory.value = item.category || "";
    elements.menuFieldIngredients.value = Array.isArray(item.ingredients)
      ? item.ingredients.join(", ")
      : "";
    elements.menuFieldTags.value = Array.isArray(item.tags) ? item.tags.join(", ") : "";

    renderMenuItemsList();
  }

  function makeNewItemId(baseSectionId) {
    var normalizedSectionId = (baseSectionId || "item").replace(/[^a-z0-9_]/gi, "_").toLowerCase();
    var allIds = getSections().reduce(function (acc, section) {
      if (Array.isArray(section.items)) {
        section.items.forEach(function (item) {
          if (item && item.id) {
            acc.push(item.id);
          }
        });
      }
      return acc;
    }, []);

    var i = 1;
    var candidate = normalizedSectionId + "_nuevo_" + i;
    while (allIds.includes(candidate)) {
      i += 1;
      candidate = normalizedSectionId + "_nuevo_" + i;
    }
    return candidate;
  }

  function createNewMenuItem() {
    var sectionId = getCurrentFilterSectionId();
    var section = getSectionById(sectionId);
    if (!section) {
      setMenuEditorStatus("No hay seccion seleccionada.");
      return;
    }

    if (!Array.isArray(section.items)) {
      section.items = [];
    }

    var newItem = {
      id: makeNewItemId(sectionId),
      name: "Nuevo item",
      price: 0,
      category: section.id,
      ingredients: [],
      tags: [],
      available: true
    };

    section.items.push(newItem);
    state.isMenuDirty = true;
    updateDashboardMetrics();
    setMenuEditorStatus("Item creado. Completa los campos y guarda.");

    var newRef = {
      sectionId: section.id,
      itemIndex: section.items.length - 1
    };
    openItemInForm(newRef);
  }

  function removeSelectedItem() {
    var ref = state.selectedItemRef;
    if (!ref) {
      setMenuEditorStatus("Selecciona un item para eliminar.");
      return;
    }

    var section = getSectionById(ref.sectionId);
    if (!section || !Array.isArray(section.items)) {
      setMenuEditorStatus("No se encontro el item seleccionado.");
      return;
    }

    var item = section.items[ref.itemIndex];
    if (!item) {
      setMenuEditorStatus("No se encontro el item seleccionado.");
      return;
    }

    var confirmDelete = window.confirm("Eliminar '" + (item.name || item.id) + "'?");
    if (!confirmDelete) return;

    section.items.splice(ref.itemIndex, 1);
    state.selectedItemRef = null;
    state.isMenuDirty = true;

    renderMenuItemsList();
    resetFormState();
    updateDashboardMetrics();
    setMenuEditorStatus("Item eliminado.");
  }

  function saveCurrentItem(event) {
    event.preventDefault();

    if (!state.selectedItemRef) {
      setMenuEditorStatus("Selecciona un item o crea uno nuevo.");
      return;
    }

    var sourceRef = state.selectedItemRef;
    var sourceSection = getSectionById(sourceRef.sectionId);
    var sourceItem = getItemByRef(sourceRef);

    if (!sourceSection || !sourceItem) {
      setMenuEditorStatus("No se encontro el item a guardar.");
      return;
    }

    var targetSectionId = elements.menuFieldSection.value.trim();
    var targetSection = getSectionById(targetSectionId);
    if (!targetSection) {
      setMenuEditorStatus("La seccion seleccionada no existe.");
      return;
    }

    var itemId = elements.menuFieldId.value.trim();
    var itemName = elements.menuFieldName.value.trim();
    var itemPrice = Number(elements.menuFieldPrice.value);

    if (!itemId) {
      setMenuEditorStatus("El ID es obligatorio.");
      return;
    }

    if (!itemName) {
      setMenuEditorStatus("El nombre es obligatorio.");
      return;
    }

    if (!Number.isFinite(itemPrice) || itemPrice < 0) {
      setMenuEditorStatus("El precio debe ser un numero valido.");
      return;
    }

    sourceItem.id = itemId;
    sourceItem.name = itemName;
    sourceItem.price = Math.round(itemPrice);
    sourceItem.category = elements.menuFieldCategory.value.trim();
    sourceItem.ingredients = parseCsv(elements.menuFieldIngredients.value);
    sourceItem.tags = parseCsv(elements.menuFieldTags.value);

    var movedBetweenSections = sourceSection.id !== targetSection.id;
    if (movedBetweenSections) {
      sourceSection.items.splice(sourceRef.itemIndex, 1);
      if (!Array.isArray(targetSection.items)) {
        targetSection.items = [];
      }
      targetSection.items.push(sourceItem);
      sourceRef = {
        sectionId: targetSection.id,
        itemIndex: targetSection.items.length - 1
      };
      setCurrentFilterSectionId(targetSection.id);
    }

    state.selectedItemRef = sourceRef;
    state.isMenuDirty = true;
    updateDashboardMetrics();
    renderMenuItemsList();
    openItemInForm(sourceRef);

    setMenuEditorStatus("Item guardado en borrador local.");
  }

  async function copyMenuJsonToClipboard() {
    if (!state.menuDraft) {
      setMenuEditorStatus("No hay menu cargado.");
      return;
    }

    var json = JSON.stringify(state.menuDraft, null, 2);

    try {
      await navigator.clipboard.writeText(json);
      setMenuEditorStatus("menu.json copiado al portapapeles.");
    } catch (_error) {
      var fallbackTextArea = document.createElement("textarea");
      fallbackTextArea.value = json;
      fallbackTextArea.setAttribute("readonly", "readonly");
      fallbackTextArea.style.position = "absolute";
      fallbackTextArea.style.left = "-9999px";
      document.body.appendChild(fallbackTextArea);
      fallbackTextArea.select();
      document.execCommand("copy");
      document.body.removeChild(fallbackTextArea);
      setMenuEditorStatus("menu.json copiado (modo fallback).");
    }
  }

  function downloadMenuJson() {
    if (!state.menuDraft) {
      setMenuEditorStatus("No hay menu cargado.");
      return;
    }

    var blob = new Blob([JSON.stringify(state.menuDraft, null, 2)], {
      type: "application/json"
    });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "menu.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setMenuEditorStatus("Descarga iniciada: menu.json");
  }

  function openMenuEditor() {
    if (!state.menuDraft) {
      setMenuEditorStatus("Cargando menu.json...");
      ensureDataLoaded(false);
      return;
    }

    setActivePanel("menu-editor");
    renderMenuItemsList();
    if (!state.selectedItemRef) {
      resetFormState();
    }
    setMenuEditorStatus(
      state.isMenuDirty
        ? "Tienes cambios locales sin exportar."
        : "Edita los items y exporta cuando termines."
    );
  }

  function bindMenuEditorEvents() {
    elements.menuSectionFilter.addEventListener("change", function () {
      state.selectedItemRef = null;
      renderMenuItemsList();
      resetFormState();
    });

    elements.menuItemsList.addEventListener("click", function (event) {
      var button = event.target.closest(".menu-item-row");
      if (!button) return;

      var ref = {
        sectionId: button.dataset.sectionId,
        itemIndex: Number(button.dataset.itemIndex)
      };
      openItemInForm(ref);
    });

    elements.menuItemForm.addEventListener("submit", saveCurrentItem);
    elements.menuDeleteItemButton.addEventListener("click", removeSelectedItem);
    elements.menuAddItemButton.addEventListener("click", createNewMenuItem);
    elements.menuCopyJsonButton.addEventListener("click", copyMenuJsonToClipboard);
    elements.menuDownloadJsonButton.addEventListener("click", downloadMenuJson);
    elements.menuEditorBackButton.addEventListener("click", function () {
      setActivePanel("dashboard");
    });
  }

  function bindEvents() {
    elements.loginButton.addEventListener("click", function () {
      openIdentityModal();
    });

    elements.logoutButton.addEventListener("click", function () {
      var identity = getIdentity();
      if (!identity) return;
      identity.logout();
    });

    elements.refreshDataButton.addEventListener("click", function () {
      ensureDataLoaded(true);
    });

    elements.openMenuEditorButton.addEventListener("click", function () {
      openMenuEditor();
    });

    bindMenuEditorEvents();

    window.addEventListener("beforeunload", function (event) {
      if (!state.isMenuDirty) return;
      event.preventDefault();
      event.returnValue = "";
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
        showDashboardView(user);
      } else {
        showLoginView();
        handleTokenFlow();
      }
    });

    identity.on("login", function (user) {
      showDashboardView(user);
      clearHash();
    });

    identity.on("logout", function () {
      showLoginView();
      state.hasDataLoaded = false;
      state.data = null;
      state.menuDraft = null;
      state.selectedItemRef = null;
      state.isMenuDirty = false;
      setDataStatus("Inicia sesion para cargar datos.");
      setMenuEditorStatus("");
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
      showDashboardView(existingUser);
    } else {
      showLoginView();
      setDataStatus("Inicia sesion para cargar datos.");
    }

    identity.init();
  }

  bindEvents();
  initAuth();
})();
