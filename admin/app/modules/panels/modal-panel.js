// admin/app/modules/panels/modal-panel.js
// Native Modal editor panel: global modal copies + real mobile iframe preview.

(function () {
  "use strict";

  var ns = window.FigataAdmin = window.FigataAdmin || {};
  var RU = ns.renderUtils;

  var PREVIEW_SYNC_DEBOUNCE_MS = 130;
  var PREVIEW_MESSAGE_READY = "figata-admin-preview:ready";
  var PREVIEW_MESSAGE_UPDATE_MODAL = "figata-admin-preview:update-modal";
  var VALID_SUBPANELS = ["account", "filter", "compare"];

  var DEFAULT_ACCOUNT_MODAL = {
    title: "Tu cuenta",
    empty_state: {
      title: "¡Aún no has añadido nada!",
      description:
        "Explora el menú y cada plato o bebida que añadas aparecerá aquí con su total estimado"
    },
    labels: {
      subtotal: "Subtotal",
      itbis: "ITBIS (18%)",
      legal_tip: "Propina legal (10%)",
      total: "Total"
    },
    total_tooltip: {
      title: "Total estimado",
      description:
        "Este monto es una referencia de tu cuenta e incluye ITBIS y propina legal. El total final puede variar al momento de ordenar."
    },
    remove_toast: {
      title: "Ítem eliminado",
      description: "Si fue un error, aún puedes deshacerlo"
    }
  };

  var DEFAULT_FILTER_MODAL = {
    title: "Filtrar",
    sections: {
      allergens: {
        title: "Alérgenos",
        description: "Selecciona lo que prefieres evitar."
      },
      pizza_type: {
        title: "Tipo de pizza",
        tabs: {
          all: "Todas",
          clasica: "Clásicas",
          autor: "De autor"
        }
      },
      price_range: {
        title: "Rango de precio",
        description: "Vista preliminar del reparto de precios actual en la carta completa.",
        min_label: "Mínimo",
        max_label: "Máximo"
      },
      dietary: {
        title: "Dieta",
        vegetarian_title: "Vegetariana",
        vegetarian_description: "Sin carne, llena de sabor",
        vegan_title: "Vegana",
        vegan_description: "100% vegetal y ligera"
      },
      organoleptic: {
        title: "Perfil organoléptico",
        description: "Perfiles que resumen cómo se siente cada plato al probarlo."
      }
    },
    actions: {
      clear_label: "Limpiar",
      apply_prefix: "Mostrar",
      apply_suffix: "platos"
    }
  };

  var DEFAULT_COMPARE_MODAL = {
    title: "Comparar",
    description: "Selecciona otro plato para comparar su perfil sensorial con el actual.",
    search_placeholder: "",
    search_helper_prefix: "Busca por",
    search_helper_word: "plato",
    empty_state: {
      title: "Sin resultados",
      description: "No hay platos elegibles para comparar en este momento.",
      description_with_query:
        "No hay coincidencias para \"{query}\" en entradas y pizzas con perfil sensorial."
    },
    current_item_prefix: "Plato actual:",
    current_item_fallback: "Selecciona un plato para comparar.",
    candidate_summary_fallback: "Perfil sensorial disponible"
  };

  var SUBPANEL_CONFIG = {
    account: {
      id: "account",
      label: "Tu cuenta",
      title: "Modal Tu cuenta",
      description: "Copys globales del modal de cuenta en catálogo/listado.",
      owner: "home.menu_page.account_modal.*",
      previewCaption: "Modal Tu cuenta en vivo",
      fields: [
        {
          title: "Cabecera y empty state",
          description: "Título y estado vacío principal del modal.",
          items: [
            { path: "menu_page.account_modal.title", label: "Título del modal", placeholder: "Tu cuenta" },
            { path: "menu_page.account_modal.empty_state.title", label: "Empty state - título", placeholder: "¡Aún no has añadido nada!" },
            { path: "menu_page.account_modal.empty_state.description", label: "Empty state - descripción", type: "textarea", rows: 3 }
          ]
        },
        {
          title: "Labels de totales",
          description: "Etiquetas globales del resumen de cuenta.",
          items: [
            { path: "menu_page.account_modal.labels.subtotal", label: "Label subtotal", placeholder: "Subtotal" },
            { path: "menu_page.account_modal.labels.itbis", label: "Label ITBIS", placeholder: "ITBIS (18%)" },
            { path: "menu_page.account_modal.labels.legal_tip", label: "Label propina legal", placeholder: "Propina legal (10%)" },
            { path: "menu_page.account_modal.labels.total", label: "Label total", placeholder: "Total" }
          ]
        },
        {
          title: "Tooltip y toast",
          description: "Copy global del tooltip de total y mensaje de eliminar item.",
          items: [
            { path: "menu_page.account_modal.total_tooltip.title", label: "Tooltip total - título", placeholder: "Total estimado" },
            { path: "menu_page.account_modal.total_tooltip.description", label: "Tooltip total - descripción", type: "textarea", rows: 3 },
            { path: "menu_page.account_modal.remove_toast.title", label: "Toast remove - título", placeholder: "Ítem eliminado" },
            { path: "menu_page.account_modal.remove_toast.description", label: "Toast remove - descripción", type: "textarea", rows: 2 }
          ]
        }
      ]
    },
    filter: {
      id: "filter",
      label: "Filtrar",
      title: "Modal Filtrar",
      description: "Copys globales del modal de filtros del catálogo/listado.",
      owner: "home.menu_page.filter_modal.*",
      previewCaption: "Modal Filtrar en vivo",
      fields: [
        {
          title: "Cabecera",
          description: "Título global del modal.",
          items: [
            { path: "menu_page.filter_modal.title", label: "Título del modal", placeholder: "Filtrar" }
          ]
        },
        {
          title: "Secciones",
          description: "Títulos y descripciones estructurales del modal.",
          items: [
            { path: "menu_page.filter_modal.sections.allergens.title", label: "Alérgenos - título" },
            { path: "menu_page.filter_modal.sections.allergens.description", label: "Alérgenos - descripción", type: "textarea", rows: 2 },
            { path: "menu_page.filter_modal.sections.pizza_type.title", label: "Tipo de pizza - título" },
            { path: "menu_page.filter_modal.sections.pizza_type.tabs.all", label: "Tab pizzas - Todas" },
            { path: "menu_page.filter_modal.sections.pizza_type.tabs.clasica", label: "Tab pizzas - Clásicas" },
            { path: "menu_page.filter_modal.sections.pizza_type.tabs.autor", label: "Tab pizzas - De autor" },
            { path: "menu_page.filter_modal.sections.price_range.title", label: "Rango de precio - título" },
            { path: "menu_page.filter_modal.sections.price_range.description", label: "Rango de precio - descripción", type: "textarea", rows: 2 },
            { path: "menu_page.filter_modal.sections.price_range.min_label", label: "Rango de precio - label mínimo" },
            { path: "menu_page.filter_modal.sections.price_range.max_label", label: "Rango de precio - label máximo" },
            { path: "menu_page.filter_modal.sections.dietary.title", label: "Dieta - título" },
            { path: "menu_page.filter_modal.sections.dietary.vegetarian_title", label: "Dieta vegetariana - título" },
            { path: "menu_page.filter_modal.sections.dietary.vegetarian_description", label: "Dieta vegetariana - descripción", type: "textarea", rows: 2 },
            { path: "menu_page.filter_modal.sections.dietary.vegan_title", label: "Dieta vegana - título" },
            { path: "menu_page.filter_modal.sections.dietary.vegan_description", label: "Dieta vegana - descripción", type: "textarea", rows: 2 },
            { path: "menu_page.filter_modal.sections.organoleptic.title", label: "Organoléptico - título" },
            { path: "menu_page.filter_modal.sections.organoleptic.description", label: "Organoléptico - descripción", type: "textarea", rows: 2 }
          ]
        },
        {
          title: "Acciones",
          description: "Labels globales del footer de acciones.",
          items: [
            { path: "menu_page.filter_modal.actions.clear_label", label: "Botón limpiar" },
            { path: "menu_page.filter_modal.actions.apply_prefix", label: "Botón aplicar - prefijo" },
            { path: "menu_page.filter_modal.actions.apply_suffix", label: "Botón aplicar - sufijo" }
          ]
        }
      ]
    },
    compare: {
      id: "compare",
      label: "Comparar",
      title: "Modal Comparar",
      description: "Copys globales del modal de comparación sensorial en detalle.",
      owner: "home.menu_detail_editorial.compare_modal.*",
      previewCaption: "Modal Comparar en vivo",
      fields: [
        {
          title: "Cabecera y búsqueda",
          description: "Título, descripción y helper del search del modal.",
          items: [
            { path: "menu_detail_editorial.compare_modal.title", label: "Título del modal", placeholder: "Comparar" },
            { path: "menu_detail_editorial.compare_modal.description", label: "Descripción", type: "textarea", rows: 2 },
            { path: "menu_detail_editorial.compare_modal.search_placeholder", label: "Placeholder de search", placeholder: "Buscar plato" },
            { path: "menu_detail_editorial.compare_modal.search_helper_prefix", label: "Helper prefix", placeholder: "Busca por" },
            { path: "menu_detail_editorial.compare_modal.search_helper_word", label: "Helper word", placeholder: "plato" }
          ]
        },
        {
          title: "Empty state y fallbacks",
          description: "Mensajes globales del modal cuando no hay resultados o contexto.",
          items: [
            { path: "menu_detail_editorial.compare_modal.empty_state.title", label: "Empty state - título" },
            { path: "menu_detail_editorial.compare_modal.empty_state.description", label: "Empty state - descripción", type: "textarea", rows: 2 },
            { path: "menu_detail_editorial.compare_modal.empty_state.description_with_query", label: "Empty state - descripción con query", type: "textarea", rows: 2 },
            { path: "menu_detail_editorial.compare_modal.current_item_prefix", label: "Prefijo item actual" },
            { path: "menu_detail_editorial.compare_modal.current_item_fallback", label: "Fallback item actual", type: "textarea", rows: 2 },
            { path: "menu_detail_editorial.compare_modal.candidate_summary_fallback", label: "Fallback summary candidato" }
          ]
        }
      ]
    }
  };

  var previewBridgeBound = false;

  function escapeHtml(value) {
    if (RU && typeof RU.escapeHtml === "function") {
      return RU.escapeHtml(value == null ? "" : String(value));
    }
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeText(value) {
    return String(value == null ? "" : value).trim();
  }

  function normalizeSubpanelId(subpanelId) {
    var normalized = normalizeText(subpanelId).toLowerCase();
    return VALID_SUBPANELS.indexOf(normalized) >= 0 ? normalized : "";
  }

  function getDefaultSubpanelId() {
    return "account";
  }

  function getSubpanelConfig(subpanelId) {
    var normalized = normalizeSubpanelId(subpanelId) || getDefaultSubpanelId();
    return SUBPANEL_CONFIG[normalized] || SUBPANEL_CONFIG.account;
  }

  function ensureObjectPath(target, path) {
    var segments = String(path || "").split(".").filter(Boolean);
    var cursor = target;
    for (var index = 0; index < segments.length; index += 1) {
      var key = segments[index];
      if (!isPlainObject(cursor[key])) {
        cursor[key] = {};
      }
      cursor = cursor[key];
    }
    return cursor;
  }

  function ensureStringPath(target, path, fallback) {
    var segments = String(path || "").split(".").filter(Boolean);
    if (!segments.length) return;
    var leaf = segments.pop();
    var parent = ensureObjectPath(target, segments.join("."));
    if (typeof parent[leaf] !== "string") {
      parent[leaf] = String(fallback || "");
    } else {
      parent[leaf] = String(parent[leaf]).trim();
    }
  }

  function getByPath(target, path) {
    var segments = String(path || "").split(".").filter(Boolean);
    var cursor = target;
    for (var index = 0; index < segments.length; index += 1) {
      if (!cursor || typeof cursor !== "object") {
        return undefined;
      }
      cursor = cursor[segments[index]];
    }
    return cursor;
  }

  function setByPath(target, path, value) {
    var segments = String(path || "").split(".").filter(Boolean);
    if (!segments.length || !isPlainObject(target)) return;
    var leaf = segments.pop();
    var parent = ensureObjectPath(target, segments.join("."));
    parent[leaf] = value;
  }

  function ensureModalEditorState(ctx) {
    if (!isPlainObject(ctx.state.modalEditor)) {
      ctx.state.modalEditor = {
        activeSubpanelId: getDefaultSubpanelId(),
        previewBridge: {}
      };
    }

    var modalState = ctx.state.modalEditor;
    modalState.activeSubpanelId = normalizeSubpanelId(modalState.activeSubpanelId) || getDefaultSubpanelId();

    if (!isPlainObject(modalState.previewBridge)) {
      modalState.previewBridge = {};
    }

    if (!Number.isFinite(Number(modalState.previewBridge.syncTimer))) {
      modalState.previewBridge.syncTimer = 0;
    }
    if (typeof modalState.previewBridge.frameSrc !== "string") {
      modalState.previewBridge.frameSrc = "";
    }
    if (typeof modalState.previewBridge.frameLoaded !== "boolean") {
      modalState.previewBridge.frameLoaded = false;
    }
    if (typeof modalState.previewBridge.bridgeReady !== "boolean") {
      modalState.previewBridge.bridgeReady = false;
    }
    if (!isPlainObject(modalState.previewBridge.pendingPayload)) {
      modalState.previewBridge.pendingPayload = null;
    }

    return modalState;
  }

  function ensureModalDraftShape(ctx) {
    if (typeof ctx.ensureHomeDraft === "function") {
      ctx.ensureHomeDraft();
    }
    var homeDraft = ctx.state && ctx.state.drafts ? ctx.state.drafts.home : null;
    if (!isPlainObject(homeDraft)) {
      return {};
    }

    ensureObjectPath(homeDraft, "menu_page");
    ensureObjectPath(homeDraft, "menu_detail_editorial");

    Object.keys(DEFAULT_ACCOUNT_MODAL).forEach(function (key) {
      if (typeof DEFAULT_ACCOUNT_MODAL[key] === "string") {
        ensureStringPath(homeDraft, "menu_page.account_modal." + key, DEFAULT_ACCOUNT_MODAL[key]);
      }
    });

    ensureStringPath(homeDraft, "menu_page.account_modal.title", DEFAULT_ACCOUNT_MODAL.title);
    ensureStringPath(homeDraft, "menu_page.account_modal.empty_state.title", DEFAULT_ACCOUNT_MODAL.empty_state.title);
    ensureStringPath(homeDraft, "menu_page.account_modal.empty_state.description", DEFAULT_ACCOUNT_MODAL.empty_state.description);
    ensureStringPath(homeDraft, "menu_page.account_modal.labels.subtotal", DEFAULT_ACCOUNT_MODAL.labels.subtotal);
    ensureStringPath(homeDraft, "menu_page.account_modal.labels.itbis", DEFAULT_ACCOUNT_MODAL.labels.itbis);
    ensureStringPath(homeDraft, "menu_page.account_modal.labels.legal_tip", DEFAULT_ACCOUNT_MODAL.labels.legal_tip);
    ensureStringPath(homeDraft, "menu_page.account_modal.labels.total", DEFAULT_ACCOUNT_MODAL.labels.total);
    ensureStringPath(homeDraft, "menu_page.account_modal.total_tooltip.title", DEFAULT_ACCOUNT_MODAL.total_tooltip.title);
    ensureStringPath(homeDraft, "menu_page.account_modal.total_tooltip.description", DEFAULT_ACCOUNT_MODAL.total_tooltip.description);
    ensureStringPath(homeDraft, "menu_page.account_modal.remove_toast.title", DEFAULT_ACCOUNT_MODAL.remove_toast.title);
    ensureStringPath(homeDraft, "menu_page.account_modal.remove_toast.description", DEFAULT_ACCOUNT_MODAL.remove_toast.description);

    ensureStringPath(homeDraft, "menu_page.filter_modal.title", DEFAULT_FILTER_MODAL.title);
    ensureStringPath(homeDraft, "menu_page.filter_modal.sections.allergens.title", DEFAULT_FILTER_MODAL.sections.allergens.title);
    ensureStringPath(homeDraft, "menu_page.filter_modal.sections.allergens.description", DEFAULT_FILTER_MODAL.sections.allergens.description);
    ensureStringPath(homeDraft, "menu_page.filter_modal.sections.pizza_type.title", DEFAULT_FILTER_MODAL.sections.pizza_type.title);
    ensureStringPath(homeDraft, "menu_page.filter_modal.sections.pizza_type.tabs.all", DEFAULT_FILTER_MODAL.sections.pizza_type.tabs.all);
    ensureStringPath(homeDraft, "menu_page.filter_modal.sections.pizza_type.tabs.clasica", DEFAULT_FILTER_MODAL.sections.pizza_type.tabs.clasica);
    ensureStringPath(homeDraft, "menu_page.filter_modal.sections.pizza_type.tabs.autor", DEFAULT_FILTER_MODAL.sections.pizza_type.tabs.autor);
    ensureStringPath(homeDraft, "menu_page.filter_modal.sections.price_range.title", DEFAULT_FILTER_MODAL.sections.price_range.title);
    ensureStringPath(homeDraft, "menu_page.filter_modal.sections.price_range.description", DEFAULT_FILTER_MODAL.sections.price_range.description);
    ensureStringPath(homeDraft, "menu_page.filter_modal.sections.price_range.min_label", DEFAULT_FILTER_MODAL.sections.price_range.min_label);
    ensureStringPath(homeDraft, "menu_page.filter_modal.sections.price_range.max_label", DEFAULT_FILTER_MODAL.sections.price_range.max_label);
    ensureStringPath(homeDraft, "menu_page.filter_modal.sections.dietary.title", DEFAULT_FILTER_MODAL.sections.dietary.title);
    ensureStringPath(homeDraft, "menu_page.filter_modal.sections.dietary.vegetarian_title", DEFAULT_FILTER_MODAL.sections.dietary.vegetarian_title);
    ensureStringPath(homeDraft, "menu_page.filter_modal.sections.dietary.vegetarian_description", DEFAULT_FILTER_MODAL.sections.dietary.vegetarian_description);
    ensureStringPath(homeDraft, "menu_page.filter_modal.sections.dietary.vegan_title", DEFAULT_FILTER_MODAL.sections.dietary.vegan_title);
    ensureStringPath(homeDraft, "menu_page.filter_modal.sections.dietary.vegan_description", DEFAULT_FILTER_MODAL.sections.dietary.vegan_description);
    ensureStringPath(homeDraft, "menu_page.filter_modal.sections.organoleptic.title", DEFAULT_FILTER_MODAL.sections.organoleptic.title);
    ensureStringPath(homeDraft, "menu_page.filter_modal.sections.organoleptic.description", DEFAULT_FILTER_MODAL.sections.organoleptic.description);
    ensureStringPath(homeDraft, "menu_page.filter_modal.actions.clear_label", DEFAULT_FILTER_MODAL.actions.clear_label);
    ensureStringPath(homeDraft, "menu_page.filter_modal.actions.apply_prefix", DEFAULT_FILTER_MODAL.actions.apply_prefix);
    ensureStringPath(homeDraft, "menu_page.filter_modal.actions.apply_suffix", DEFAULT_FILTER_MODAL.actions.apply_suffix);

    ensureStringPath(homeDraft, "menu_detail_editorial.compare_modal.title", DEFAULT_COMPARE_MODAL.title);
    ensureStringPath(homeDraft, "menu_detail_editorial.compare_modal.description", DEFAULT_COMPARE_MODAL.description);
    ensureStringPath(homeDraft, "menu_detail_editorial.compare_modal.search_placeholder", DEFAULT_COMPARE_MODAL.search_placeholder);
    ensureStringPath(homeDraft, "menu_detail_editorial.compare_modal.search_helper_prefix", DEFAULT_COMPARE_MODAL.search_helper_prefix);
    ensureStringPath(homeDraft, "menu_detail_editorial.compare_modal.search_helper_word", DEFAULT_COMPARE_MODAL.search_helper_word);
    ensureStringPath(homeDraft, "menu_detail_editorial.compare_modal.empty_state.title", DEFAULT_COMPARE_MODAL.empty_state.title);
    ensureStringPath(homeDraft, "menu_detail_editorial.compare_modal.empty_state.description", DEFAULT_COMPARE_MODAL.empty_state.description);
    ensureStringPath(homeDraft, "menu_detail_editorial.compare_modal.empty_state.description_with_query", DEFAULT_COMPARE_MODAL.empty_state.description_with_query);
    ensureStringPath(homeDraft, "menu_detail_editorial.compare_modal.current_item_prefix", DEFAULT_COMPARE_MODAL.current_item_prefix);
    ensureStringPath(homeDraft, "menu_detail_editorial.compare_modal.current_item_fallback", DEFAULT_COMPARE_MODAL.current_item_fallback);
    ensureStringPath(homeDraft, "menu_detail_editorial.compare_modal.candidate_summary_fallback", DEFAULT_COMPARE_MODAL.candidate_summary_fallback);

    return homeDraft;
  }

  function getModalPreviewFrame(ctx) {
    return ctx.views && ctx.views.modalEditorPanel
      ? ctx.views.modalEditorPanel.querySelector("#modal-editor-mobile-preview-frame")
      : null;
  }

  function getModalPreviewLoadingNode(ctx) {
    return ctx.views && ctx.views.modalEditorPanel
      ? ctx.views.modalEditorPanel.querySelector("#modal-editor-mobile-preview-loading")
      : null;
  }

  function setPreviewLoading(ctx, isLoading) {
    var loadingNode = getModalPreviewLoadingNode(ctx);
    if (!loadingNode) return;
    loadingNode.classList.toggle("is-hidden", !isLoading);
  }

  function getAdminSiteBasePath() {
    var pathname = String((window.location && window.location.pathname) || "");
    var markerIndex = pathname.indexOf("/admin/app/");
    if (markerIndex < 0) {
      markerIndex = pathname.indexOf("/admin/app");
    }
    if (markerIndex < 0) {
      return "";
    }
    return pathname.slice(0, markerIndex);
  }

  function resolveComparePreviewItemId(ctx) {
    var allItems = typeof ctx.getAllMenuItems === "function" ? ctx.getAllMenuItems() : [];
    if (!Array.isArray(allItems) || !allItems.length) {
      return "";
    }

    var preferred = allItems.find(function (entry) {
      return normalizeText(entry && entry.item && entry.item.id).toLowerCase() === "margherita";
    });
    if (preferred && preferred.item && preferred.item.id) {
      return normalizeText(preferred.item.id);
    }

    var first = allItems.find(function (entry) {
      return normalizeText(entry && entry.item && entry.item.id);
    });

    return first && first.item && first.item.id ? normalizeText(first.item.id) : "";
  }

  function buildPreviewUrl(ctx, subpanelId) {
    var normalizedSubpanelId = normalizeSubpanelId(subpanelId) || getDefaultSubpanelId();
    var basePath = getAdminSiteBasePath();
    var isCompare = normalizedSubpanelId === "compare";
    var detailItemId = isCompare ? resolveComparePreviewItemId(ctx) : "";
    var path = (basePath || "") + "/menu/";
    if (isCompare && detailItemId) {
      path += encodeURIComponent(detailItemId);
    }
    var params = [
      "adminPreview=1",
      "adminPreviewSurface=modal",
      "adminPreviewModal=" + encodeURIComponent(normalizedSubpanelId)
    ];
    return path + "?" + params.join("&");
  }

  function buildPreviewHomePayload(ctx) {
    var homeDraft = ensureModalDraftShape(ctx);
    var popular = isPlainObject(homeDraft.popular) ? homeDraft.popular : {};
    return {
      popular: {
        featuredIds: Array.isArray(popular.featuredIds) ? popular.featuredIds.slice() : []
      },
      menu_page: isPlainObject(homeDraft.menu_page) ? deepClone(homeDraft.menu_page) : {},
      menu_detail_editorial: isPlainObject(homeDraft.menu_detail_editorial)
        ? deepClone(homeDraft.menu_detail_editorial)
        : {}
    };
  }

  function createPreviewPayload(ctx, subpanelId) {
    var normalizedSubpanelId = normalizeSubpanelId(subpanelId) || getDefaultSubpanelId();
    return {
      type: PREVIEW_MESSAGE_UPDATE_MODAL,
      payload: {
        modal: normalizedSubpanelId,
        home: buildPreviewHomePayload(ctx)
      }
    };
  }

  function resetPreviewBridgeState(ctx) {
    var modalState = ensureModalEditorState(ctx);
    var bridge = modalState.previewBridge;
    if (bridge.syncTimer) {
      window.clearTimeout(bridge.syncTimer);
      bridge.syncTimer = 0;
    }
    bridge.frameLoaded = false;
    bridge.bridgeReady = false;
    bridge.pendingPayload = null;
  }

  function postMessageToPreview(ctx, message) {
    var frame = getModalPreviewFrame(ctx);
    if (!frame || !frame.contentWindow || !message) {
      return false;
    }

    try {
      frame.contentWindow.postMessage(message, window.location.origin);
      return true;
    } catch (_error) {
      return false;
    }
  }

  function flushPreviewSync(ctx) {
    var modalState = ensureModalEditorState(ctx);
    var bridge = modalState.previewBridge;
    if (!bridge.pendingPayload) {
      bridge.pendingPayload = createPreviewPayload(ctx, modalState.activeSubpanelId);
    }
    if (!bridge.bridgeReady || !bridge.pendingPayload) {
      return;
    }
    if (postMessageToPreview(ctx, bridge.pendingPayload)) {
      bridge.pendingPayload = null;
    }
  }

  function schedulePreviewSync(ctx, options) {
    options = options || {};
    var modalState = ensureModalEditorState(ctx);
    var bridge = modalState.previewBridge;

    bridge.pendingPayload = createPreviewPayload(ctx, modalState.activeSubpanelId);

    if (bridge.syncTimer) {
      window.clearTimeout(bridge.syncTimer);
      bridge.syncTimer = 0;
    }

    if (options.immediate) {
      flushPreviewSync(ctx);
      return;
    }

    bridge.syncTimer = window.setTimeout(function () {
      bridge.syncTimer = 0;
      flushPreviewSync(ctx);
    }, PREVIEW_SYNC_DEBOUNCE_MS);
  }

  function openPreviewFrame(ctx, subpanelId) {
    var frame = getModalPreviewFrame(ctx);
    if (!frame) return;

    var modalState = ensureModalEditorState(ctx);
    var nextUrl = buildPreviewUrl(ctx, subpanelId);
    if (modalState.previewBridge.frameSrc === nextUrl && frame.getAttribute("src") === nextUrl) {
      return;
    }

    resetPreviewBridgeState(ctx);
    modalState.previewBridge.frameSrc = nextUrl;
    setPreviewLoading(ctx, true);
    frame.setAttribute("src", nextUrl);
  }

  function getFieldValue(homeDraft, field) {
    var value = getByPath(homeDraft, field.path);
    return normalizeText(value);
  }

  function renderField(homeDraft, field) {
    var rows = Number(field.rows);
    var isTextArea = field.type === "textarea";
    var attributes =
      'data-modal-field-path="' + escapeHtml(field.path) + '" data-modal-field-type="' + escapeHtml(isTextArea ? "textarea" : "text") + '"';
    var value = getFieldValue(homeDraft, field);
    var placeholder = normalizeText(field.placeholder);

    if (isTextArea) {
      return ""
        + '<label class="field">'
        + '  <span>' + escapeHtml(field.label) + '</span>'
        + '  <textarea rows="' + escapeHtml(rows > 0 ? rows : 2) + '" ' + attributes
        + (placeholder ? ' placeholder="' + escapeHtml(placeholder) + '"' : "")
        + '>' + escapeHtml(value) + '</textarea>'
        + '</label>';
    }

    return ""
      + '<label class="field">'
      + '  <span>' + escapeHtml(field.label) + '</span>'
      + '  <input type="text" ' + attributes
      + (placeholder ? ' placeholder="' + escapeHtml(placeholder) + '"' : "")
      + ' value="' + escapeHtml(value) + '">'
      + '</label>';
  }

  function renderFieldBlocks(homeDraft, config) {
    var blocks = Array.isArray(config.fields) ? config.fields : [];
    return blocks.map(function (block) {
      var fieldHtml = (Array.isArray(block.items) ? block.items : [])
        .map(function (field) { return renderField(homeDraft, field); })
        .join("");

      return ""
        + '<section class="traits-panel-section">'
        + '  <header class="traits-panel-section__header">'
        + '    <h4>' + escapeHtml(block.title || "") + '</h4>'
        + '    <p>' + escapeHtml(block.description || "") + '</p>'
        + '  </header>'
        + fieldHtml
        + '</section>';
    }).join("");
  }

  function renderSubpanelTabs(activeSubpanelId) {
    return VALID_SUBPANELS.map(function (subpanelId) {
      var config = getSubpanelConfig(subpanelId);
      var isActive = subpanelId === activeSubpanelId;
      return ""
        + '<button class="item-tab' + (isActive ? ' is-active' : '') + '"'
        + ' type="button"'
        + ' data-modal-subpanel="' + escapeHtml(subpanelId) + '"'
        + '>' + escapeHtml(config.label) + '</button>';
    }).join("");
  }

  function renderModalEditor(ctx, options) {
    var panel = ctx.views.modalEditorPanel;
    if (!panel) return;

    var modalState = ensureModalEditorState(ctx);
    var requestedSubpanelId = options && options.activeSubpanelId;
    var activeSubpanelId = normalizeSubpanelId(requestedSubpanelId) || modalState.activeSubpanelId || getDefaultSubpanelId();
    modalState.activeSubpanelId = activeSubpanelId;

    var homeDraft = ensureModalDraftShape(ctx);
    var config = getSubpanelConfig(activeSubpanelId);

    panel.innerHTML = ""
      + '<div class="home-editor__header">'
      + '  <div>'
      + '    <p class="kicker">Modal</p>'
      + '    <h2>Editor global de modales</h2>'
      + '    <p class="home-editor__subtitle">Configura copys globales de Tu cuenta, Filtrar y Comparar con preview real mobile.</p>'
      + '  </div>'
      + '  <div class="home-editor__actions">'
      + '    <button class="btn btn-primary" type="button" data-modal-action="save">Guardar</button>'
      + '    <button class="btn btn-ghost" type="button" data-modal-action="export-json">Exportar JSON</button>'
      + '    <button id="modal-publish-preview-button" class="btn btn-primary" type="button" data-modal-action="publish-preview">Publish Preview</button>'
      + '    <button id="modal-publish-production-button" class="btn btn-ghost" type="button" data-modal-action="publish-production">Publish Production</button>'
      + '  </div>'
      + '</div>'
      + '<p id="modal-editor-status" class="data-status" role="status" aria-live="polite">Edita y previsualiza los modales globales del sistema menú.</p>'
      + '<div class="menu-item-editor__layout modal-editor__layout">'
      + '  <section class="menu-item-editor__form modal-editor__form" aria-label="Editor de copys modal">'
      + '    <div class="item-tabs modal-editor__tabs">'
      + renderSubpanelTabs(activeSubpanelId)
      + '    </div>'
      + '    <section class="traits-panel-section">'
      + '      <header class="traits-panel-section__header">'
      + '        <h4>' + escapeHtml(config.title) + '</h4>'
      + '        <p>' + escapeHtml(config.description) + '</p>'
      + '      </header>'
      + '      <p class="inline-help">Owner: <code>' + escapeHtml(config.owner) + '</code></p>'
      + '    </section>'
      + renderFieldBlocks(homeDraft, config)
      + '  </section>'
      + '  <aside class="menu-item-editor__preview modal-editor__preview" aria-label="Preview modal mobile">'
      + '    <div class="menu-item-editor__preview-head">'
      + '      <p class="kicker">Preview</p>'
      + '      <p class="menu-item-editor__preview-caption">' + escapeHtml(config.previewCaption) + '</p>'
      + '    </div>'
      + '    <div class="menu-item-editor__device" aria-hidden="true">'
      + '      <div class="menu-item-editor__device-notch"></div>'
      + '      <div class="menu-item-editor__device-screen">'
      + '        <iframe id="modal-editor-mobile-preview-frame" class="menu-item-editor__device-iframe" title="Preview modal menú móvil" loading="lazy"></iframe>'
      + '        <div id="modal-editor-mobile-preview-loading" class="menu-item-editor__device-loading" aria-live="polite">Cargando preview...</div>'
      + '      </div>'
      + '    </div>'
      + '  </aside>'
      + '</div>';

    openPreviewFrame(ctx, activeSubpanelId);
    schedulePreviewSync(ctx, { immediate: true });

    if (typeof ctx.setModalEditorStatus === "function") {
      ctx.setModalEditorStatus("Modal actualizado en borrador local.");
    }
  }

  function persistModalDraft(ctx, message) {
    if (typeof ctx.persistDraftsToLocalStorage === "function") {
      ctx.persistDraftsToLocalStorage();
    }
    if (typeof ctx.setModalEditorStatus === "function") {
      ctx.setModalEditorStatus(message || "Modal actualizado en borrador local.");
    }
  }

  function updateFieldFromInput(ctx, inputNode) {
    if (!inputNode) return;
    var path = normalizeText(inputNode.getAttribute("data-modal-field-path"));
    if (!path) return;

    var homeDraft = ensureModalDraftShape(ctx);
    if (!isPlainObject(homeDraft)) {
      return;
    }

    setByPath(homeDraft, path, normalizeText(inputNode.value));
    persistModalDraft(ctx, "Modal actualizado en borrador local.");
    schedulePreviewSync(ctx);
  }

  function syncSubpanelRoute(ctx, subpanelId) {
    var normalized = normalizeSubpanelId(subpanelId) || getDefaultSubpanelId();
    if (normalized === getDefaultSubpanelId()) {
      ctx.navigateToRoute("/modal");
      return;
    }
    ctx.navigateToRoute("/modal/" + encodeURIComponent(normalized));
  }

  function handlePreviewBridgeMessage(ctx, event) {
    if (!event || event.origin !== window.location.origin) {
      return;
    }

    var frame = getModalPreviewFrame(ctx);
    if (!frame || event.source !== frame.contentWindow) {
      return;
    }

    var data = event.data;
    if (!isPlainObject(data)) {
      return;
    }

    var messageType = normalizeText(data.type);
    if (messageType !== PREVIEW_MESSAGE_READY) {
      return;
    }

    var modalState = ensureModalEditorState(ctx);
    modalState.previewBridge.bridgeReady = true;
    modalState.previewBridge.frameLoaded = true;
    setPreviewLoading(ctx, false);
    schedulePreviewSync(ctx, { immediate: true });
  }

  function bindPreviewBridge(ctx) {
    var frame = getModalPreviewFrame(ctx);
    if (frame && frame.getAttribute("data-modal-preview-bound") !== "true") {
      frame.setAttribute("data-modal-preview-bound", "true");
      frame.addEventListener("load", function () {
        var modalState = ensureModalEditorState(ctx);
        modalState.previewBridge.frameLoaded = true;
      });
    }

    if (previewBridgeBound) {
      return;
    }

    window.addEventListener("message", function (event) {
      handlePreviewBridgeMessage(ctx, event);
    });
    previewBridgeBound = true;
  }

  function bindModalEditorEvents(ctx) {
    var panel = ctx.views.modalEditorPanel;
    if (!panel) return;

    if (panel.getAttribute("data-modal-panel-bound") === "true") {
      bindPreviewBridge(ctx);
      return;
    }

    panel.setAttribute("data-modal-panel-bound", "true");

    panel.addEventListener("click", function (event) {
      var subpanelButton = event.target.closest("[data-modal-subpanel]");
      if (subpanelButton) {
        var nextSubpanelId = normalizeSubpanelId(subpanelButton.getAttribute("data-modal-subpanel"));
        if (!nextSubpanelId) return;
        syncSubpanelRoute(ctx, nextSubpanelId);
        return;
      }

      var actionButton = event.target.closest("[data-modal-action]");
      if (!actionButton) return;
      var action = normalizeText(actionButton.getAttribute("data-modal-action")).toLowerCase();
      if (!action) return;

      ensureModalDraftShape(ctx);

      if (action === "save") {
        persistModalDraft(ctx, "Modal guardado en drafts.");
        if (typeof ctx.saveDraftsToLocalFiles === "function") {
          void ctx.saveDraftsToLocalFiles();
        }
        schedulePreviewSync(ctx, { immediate: true });
        return;
      }

      if (action === "export-json") {
        persistModalDraft(ctx, "Modal sincronizado antes de exportar JSON.");
        if (typeof ctx.exportCurrentDrafts === "function") {
          ctx.exportCurrentDrafts();
        }
        return;
      }

      if (action === "publish-preview" || action === "publish-production") {
        persistModalDraft(ctx, "Modal sincronizado antes de publicar.");
        if (typeof ctx.publishChanges === "function") {
          ctx.publishChanges(action === "publish-production" ? "production" : "preview");
        }
      }
    });

    panel.addEventListener("input", function (event) {
      var inputNode = event.target.closest("[data-modal-field-path]");
      if (!inputNode) return;
      updateFieldFromInput(ctx, inputNode);
    });

    panel.addEventListener("change", function (event) {
      var inputNode = event.target.closest("[data-modal-field-path]");
      if (!inputNode) return;
      updateFieldFromInput(ctx, inputNode);
    });

    bindPreviewBridge(ctx);
  }

  function openModalEditor(ctx, options) {
    options = options || {};
    var requestedSubpanelId = normalizeSubpanelId(options.subpanelId) || "";

    if (!options.skipRoute) {
      if (requestedSubpanelId && requestedSubpanelId !== getDefaultSubpanelId()) {
        ctx.navigateToRoute("/modal/" + encodeURIComponent(requestedSubpanelId), {
          replace: Boolean(options.replaceRoute)
        });
      } else {
        ctx.navigateToRoute("/modal", { replace: Boolean(options.replaceRoute) });
      }
      return;
    }

    if (!ctx.state.hasDataLoaded) {
      ctx.ensureDataLoaded(false);
      return;
    }

    ensureModalEditorState(ctx);
    ensureModalDraftShape(ctx);

    var activeSubpanelId = requestedSubpanelId || ctx.state.modalEditor.activeSubpanelId || getDefaultSubpanelId();
    ctx.state.modalEditor.activeSubpanelId = normalizeSubpanelId(activeSubpanelId) || getDefaultSubpanelId();

    ctx.setActivePanel("modal-editor");
    renderModalEditor(ctx, { activeSubpanelId: ctx.state.modalEditor.activeSubpanelId });

    ctx.setMenuBrowserStatus("");
    ctx.setItemEditorStatus("");
    ctx.setHomeEditorStatus("");
    ctx.setIngredientsEditorStatus("");
    ctx.setCategoriesEditorStatus("");
    if (typeof ctx.setRestaurantEditorStatus === "function") {
      ctx.setRestaurantEditorStatus("");
    }
    if (typeof ctx.setMediaEditorStatus === "function") {
      ctx.setMediaEditorStatus("");
    }
    if (typeof ctx.setPagesEditorStatus === "function") {
      ctx.setPagesEditorStatus("");
    }
    if (typeof ctx.setModalEditorStatus === "function") {
      ctx.setModalEditorStatus("Edita y previsualiza los modales globales del sistema menú.");
    }
  }

  ns.modalPanel = {
    open: openModalEditor,
    render: renderModalEditor,
    bindEvents: bindModalEditorEvents,
    normalizeSubpanelId: normalizeSubpanelId,
    subpanels: VALID_SUBPANELS.slice()
  };
})();
