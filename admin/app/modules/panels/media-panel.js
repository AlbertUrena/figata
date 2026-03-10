// admin/app/modules/panels/media-panel.js
// Native media editor panel for /admin/app.
// Dependencies: FigataAdmin.constants, FigataAdmin.renderUtils, FigataMediaContract.

(function () {
  "use strict";

  var ns = window.FigataAdmin = window.FigataAdmin || {};
  var C = ns.constants;
  var RU = ns.renderUtils;

  var SECTION_DEFINITIONS = [
    { id: "browser", label: "\u00cdtems" },
    { id: "homepage", label: "Homepage" },
    { id: "brand", label: "Marca" },
    { id: "defaults", label: "Defaults" },
    { id: "integrity", label: "Integridad" }
  ];

  var panelState = {
    selectedItemId: "",
    searchQuery: "",
    mode: "browser"
  };

  function escapeHtml(value) {
    return RU.escapeHtml(value == null ? "" : String(value));
  }

  function normalizeSectionId(sectionId) {
    var normalizedId = String(sectionId || "").trim();
    if (!normalizedId) return "";
    var isKnown = SECTION_DEFINITIONS.some(function (section) {
      return section.id === normalizedId;
    });
    return isKnown ? normalizedId : "";
  }

  function getSectionAnchorId(sectionId) {
    return "media-section-" + normalizeSectionId(sectionId);
  }

  function getContract() {
    return window.FigataMediaContract || null;
  }

  function createFallbackItem(itemId, itemName) {
    var contract = getContract();
    if (contract && typeof contract.createEmptyItem === "function") {
      return contract.createEmptyItem(itemId, itemName);
    }
    return {
      source: "",
      alt: itemName || itemId || "",
      overrides: {
        card: "",
        hover: "",
        modal: "",
        gallery: []
      },
      dominantColor: "",
      version: 2
    };
  }

  function ensureMediaDraftShape(ctx) {
    ctx.ensureMediaStore();
    ctx.ensureMediaDraft();

    var draft = ctx.getMediaDraft() || {};
    var contract = getContract();
    if (contract && typeof contract.migrateToV2 === "function") {
      draft = contract.migrateToV2(draft);
      ctx.state.drafts.media = draft;
    }

    if (!draft.defaults || typeof draft.defaults !== "object") {
      draft.defaults = {};
    }
    if (!draft.defaults.card) {
      draft.defaults.card = C.MENU_PLACEHOLDER_IMAGE;
    }
    if (!draft.defaults.hover) {
      draft.defaults.hover = C.MENU_PLACEHOLDER_IMAGE;
    }
    if (!draft.defaults.modal) {
      draft.defaults.modal = C.MENU_MODAL_PLACEHOLDER_IMAGE;
    }
    if (!draft.defaults.alt) {
      draft.defaults.alt = "Imagen del producto Figata";
    }

    if (!draft.items || typeof draft.items !== "object") {
      draft.items = {};
    }

    if (!draft.global || typeof draft.global !== "object") {
      draft.global = {};
    }
    if (!draft.global.homepage || typeof draft.global.homepage !== "object") {
      draft.global.homepage = {};
    }
    if (!draft.global.branding || typeof draft.global.branding !== "object") {
      draft.global.branding = {};
    }
    if (!draft.global.utility || typeof draft.global.utility !== "object") {
      draft.global.utility = {};
    }

    if (!draft.schema) {
      draft.schema = "figata.media.v2";
    }
    if (!Number.isFinite(Number(draft.version))) {
      draft.version = 2;
    } else {
      draft.version = Number(draft.version);
    }

    ctx.state.drafts.media = draft;
    return draft;
  }

  function getMenuEntries(ctx) {
    ctx.ensureMenuDraft();
    return ctx.getAllMenuItems().slice();
  }

  function getSelectedMenuEntry(ctx) {
    var targetId = String(panelState.selectedItemId || "").trim();
    if (!targetId) return null;
    var menuEntries = getMenuEntries(ctx);
    for (var index = 0; index < menuEntries.length; index += 1) {
      if (menuEntries[index] && menuEntries[index].item && menuEntries[index].item.id === targetId) {
        return menuEntries[index];
      }
    }
    return null;
  }

  function ensureSelectedItemStillExists(ctx) {
    if (!panelState.selectedItemId) return;
    if (getSelectedMenuEntry(ctx)) return;
    panelState.selectedItemId = "";
  }

  function resolveMediaPath(entry, variant, defaults) {
    var contract = getContract();
    if (contract && typeof contract.resolveMediaPath === "function") {
      return contract.resolveMediaPath(entry, variant, defaults);
    }
    if (entry && typeof entry.source === "string" && entry.source.trim()) {
      return entry.source.trim();
    }
    return (defaults && defaults[variant]) || (defaults && defaults.card) || "";
  }

  function getItemDraftEntry(mediaDraft, menuEntry) {
    if (!menuEntry || !menuEntry.item) return null;
    var itemId = String(menuEntry.item.id || "").trim();
    if (!itemId) return null;
    var existingEntry = mediaDraft.items[itemId];
    if (existingEntry && typeof existingEntry === "object") {
      return existingEntry;
    }
    return createFallbackItem(itemId, menuEntry.item.name || itemId);
  }

  function getMediaItemRoute(itemId) {
    return "/media/item/" + encodeURIComponent(String(itemId || "").trim());
  }

  function renderSection(sectionId, kicker, title, description, bodyHtml, extraClassName, headerActionsHtml) {
    var normalizedId = normalizeSectionId(sectionId);
    return ''
      + '<section class="media-section' + (extraClassName ? (' ' + extraClassName) : '') + '" id="' + getSectionAnchorId(normalizedId) + '" tabindex="-1" data-media-anchor="true" data-media-section-id="' + escapeHtml(normalizedId) + '">'
      + '  <header class="media-section__header">'
      + '    <div>'
      + (kicker ? ('      <p class="kicker">' + escapeHtml(kicker) + '</p>') : '')
      + '      <h3>' + escapeHtml(title) + '</h3>'
      + (description ? ('      <p class="inline-help">' + escapeHtml(description) + '</p>') : '')
      + '    </div>'
      + (headerActionsHtml || '')
      + '  </header>'
      + bodyHtml
      + '</section>';
  }

  function buildBrowserGroups(ctx) {
    var normalizedQuery = String(panelState.searchQuery || "").trim().toLowerCase();
    var entries = getMenuEntries(ctx);
    var groupsById = {};
    var groups = [];

    entries.forEach(function (entry) {
      var item = entry.item || {};
      var itemId = String(item.id || "").trim();
      var itemName = String(item.name || "").trim();
      if (!itemId) return;

      if (normalizedQuery) {
        var haystack = (itemId + " " + itemName).toLowerCase();
        if (haystack.indexOf(normalizedQuery) === -1) {
          return;
        }
      }

      var sectionId = String(entry.sectionId || "sin-categoria").trim() || "sin-categoria";
      if (!groupsById[sectionId]) {
        var group = {
          id: sectionId,
          label: String(entry.sectionLabel || sectionId).trim() || sectionId,
          items: []
        };
        groupsById[sectionId] = group;
        groups.push(group);
      }

      groupsById[sectionId].items.push(entry);
    });

    return groups;
  }

  function renderBrowserCard(entry, mediaDraft) {
    var item = entry.item || {};
    var itemId = String(item.id || "").trim();
    var mediaEntry = getItemDraftEntry(mediaDraft, entry);
    var thumbPath = resolveMediaPath(mediaEntry, "card", mediaDraft.defaults);
    var isSelected = itemId && itemId === panelState.selectedItemId;

    return ''
      + '<button type="button" class="media-card' + (isSelected ? ' is-active' : '') + '" data-action="open-item-editor" data-item-id="' + escapeHtml(itemId) + '">'
      + '  <div class="media-card__thumb">'
      + '    <img src="/' + escapeHtml(thumbPath || C.MENU_PLACEHOLDER_IMAGE) + '" alt="" loading="lazy" />'
      + '  </div>'
      + '  <div class="media-card__info">'
      + '    <strong>' + escapeHtml(item.name || itemId) + '</strong>'
      + '    <div class="inline-help">' + escapeHtml(entry.sectionLabel || entry.sectionId || "") + '</div>'
      + '  </div>'
      + '</button>';
  }

  function renderBrowserContent(ctx, mediaDraft) {
    var groups = buildBrowserGroups(ctx);
    if (!groups.length) {
      return '<div class="empty-state"><p>No se encontraron \u00edtems para ese filtro.</p></div>';
    }

    return groups.map(function (group) {
      var cardsHtml = group.items.map(function (entry) {
        return renderBrowserCard(entry, mediaDraft);
      }).join("");

      return ''
        + '<section class="media-browser-category">'
        + '  <header class="media-browser-category__header">'
        + '    <h4>' + escapeHtml(group.label) + '</h4>'
        + '    <p class="inline-help">' + escapeHtml(String(group.items.length)) + ' \u00edtems</p>'
        + '  </header>'
        + '  <div class="media-browser-grid">'
        + cardsHtml
        + '  </div>'
        + '</section>';
    }).join("");
  }

  function renderBrowserSection(ctx, mediaDraft) {
    var headerActionsHtml = ''
      + '<label class="field media-field-row media-section__search">'
      + '  <span>Buscar</span>'
      + '  <input id="media-search" class="input-text" type="search" value="' + escapeHtml(panelState.searchQuery) + '" placeholder="Buscar por ID o nombre" />'
      + '</label>';

    return renderSection(
      "browser",
      "Media / Browser",
      "\u00cdtems del men\u00fa",
      "Explora y abre el editor dedicado de cada \u00edtem.",
      '<div class="media-browser-groups">' + renderBrowserContent(ctx, mediaDraft) + '</div>',
      "",
      headerActionsHtml
    );
  }

  function renderGlobalsAction(actionId) {
    return '<div class="home-editor__actions"><button id="' + actionId + '" class="btn btn-primary" type="button" data-action="save-globals">Guardar secci\u00f3n</button></div>';
  }

  function renderHomepageSection(mediaDraft) {
    var homepage = (mediaDraft.global || {}).homepage || {};
    return renderSection(
      "homepage",
      "Media / Global",
      "Homepage",
      "Activos globales usados por la homepage.",
      ''
        + '<div class="media-global-grid">'
        + '  <label class="field media-field-row">'
        + '    <span>Fondo hero</span>'
        + '    <input id="media-global-home-hero" class="input-text" type="text" data-global-key="homepage.heroBackground" value="' + escapeHtml(homepage.heroBackground || "") + '" />'
        + '  </label>'
        + '  <label class="field media-field-row">'
        + '    <span>Fondo featured</span>'
        + '    <input id="media-global-home-featured" class="input-text" type="text" data-global-key="homepage.featuredBackground" value="' + escapeHtml(homepage.featuredBackground || "") + '" />'
        + '  </label>'
        + '</div>'
        + renderGlobalsAction("media-save-homepage-button")
    );
  }

  function renderBrandingSection(mediaDraft) {
    var branding = (mediaDraft.global || {}).branding || {};
    return renderSection(
      "brand",
      "Media / Global",
      "Marca",
      "Activos globales de identidad visual.",
      ''
        + '<div class="media-global-grid">'
        + '  <label class="field media-field-row">'
        + '    <span>Logo</span>'
        + '    <input id="media-global-brand-logo" class="input-text" type="text" data-global-key="branding.logo" value="' + escapeHtml(branding.logo || "") + '" />'
        + '  </label>'
        + '  <label class="field media-field-row">'
        + '    <span>Favicon</span>'
        + '    <input id="media-global-brand-favicon" class="input-text" type="text" data-global-key="branding.favicon" value="' + escapeHtml(branding.favicon || "") + '" />'
        + '  </label>'
        + '</div>'
        + renderGlobalsAction("media-save-branding-button")
    );
  }

  function renderDefaultsSection(mediaDraft) {
    var defaults = mediaDraft.defaults || {};
    var utility = (mediaDraft.global || {}).utility || {};
    return renderSection(
      "defaults",
      "Media / Defaults",
      "Valores por defecto",
      "Valores usados cuando un \u00edtem no define una variante propia.",
      ''
        + '<div class="media-global-grid">'
        + '  <label class="field media-field-row">'
        + '    <span>Imagen por defecto para card</span>'
        + '    <input id="media-default-card" class="input-text" type="text" data-default-key="card" value="' + escapeHtml(defaults.card || "") + '" />'
        + '  </label>'
        + '  <label class="field media-field-row">'
        + '    <span>Imagen por defecto para hover</span>'
        + '    <input id="media-default-hover" class="input-text" type="text" data-default-key="hover" value="' + escapeHtml(defaults.hover || "") + '" />'
        + '  </label>'
        + '  <label class="field media-field-row">'
        + '    <span>Imagen por defecto para modal</span>'
        + '    <input id="media-default-modal" class="input-text" type="text" data-default-key="modal" value="' + escapeHtml(defaults.modal || "") + '" />'
        + '  </label>'
        + '  <label class="field media-field-row">'
        + '    <span>Texto alt por defecto</span>'
        + '    <input id="media-default-alt" class="input-text" type="text" data-default-key="alt" value="' + escapeHtml(defaults.alt || "") + '" />'
        + '  </label>'
        + '  <label class="field media-field-row">'
        + '    <span>Placeholder auxiliar</span>'
        + '    <input id="media-global-utility-placeholder" class="input-text" type="text" data-global-key="utility.placeholder" value="' + escapeHtml(utility.placeholder || "") + '" />'
        + '  </label>'
        + '  <label class="field media-field-row">'
        + '    <span>Fallback auxiliar para modal</span>'
        + '    <input id="media-global-utility-fallback" class="input-text" type="text" data-global-key="utility.fallbackImage" value="' + escapeHtml(utility.fallbackImage || "") + '" />'
        + '  </label>'
        + '</div>'
        + renderGlobalsAction("media-save-defaults-button")
    );
  }

  function renderIntegritySection(mediaDraft) {
    var contract = getContract();
    if (!contract || typeof contract.validateMediaContract !== "function") {
      return renderSection(
        "integrity",
        "Validaci\u00f3n",
        "Integridad del draft",
        "No se encontr\u00f3 el contrato de media en el navegador.",
        "",
        "media-integrity"
      );
    }

    var report = contract.validateMediaContract(mediaDraft);
    var isClean = report.errors.length === 0 && report.warnings.length === 0;
    var bodyHtml = "";

    if (isClean) {
      bodyHtml += '<p class="status-message is-success">Borrador v\u00e1lido. No se detectaron errores ni advertencias.</p>';
    } else {
      if (report.errors.length) {
        bodyHtml += '<div class="status-message is-error"><strong>' + report.errors.length + ' errores</strong><ul class="mt-8 pl-16">';
        report.errors.forEach(function (message) {
          bodyHtml += '<li>' + escapeHtml(message) + '</li>';
        });
        bodyHtml += '</ul></div>';
      }
      if (report.warnings.length) {
        bodyHtml += '<div class="status-message is-warning"><strong>' + report.warnings.length + ' advertencias</strong><ul class="mt-8 pl-16">';
        report.warnings.forEach(function (message) {
          bodyHtml += '<li>' + escapeHtml(message) + '</li>';
        });
        bodyHtml += '</ul></div>';
      }
    }

    return renderSection(
      "integrity",
      "Validaci\u00f3n",
      "Integridad del draft",
      "Revisi\u00f3n del schema figata.media.v2.",
      bodyHtml,
      isClean ? "media-integrity is-clean" : "media-integrity"
    );
  }

  function renderItemEditorBody(ctx, mediaDraft, menuEntry) {
    if (!menuEntry || !menuEntry.item) {
      return ''
        + '<section class="media-item-view">'
        + '  <div class="empty-state">'
        + '    <p>El \u00edtem no existe o fue eliminado.</p>'
        + '    <div class="home-editor__actions">'
        + '      <button class="btn btn-primary" type="button" data-action="open-browser">Volver al browser</button>'
        + '    </div>'
        + '  </div>'
        + '</section>';
    }

    var item = menuEntry.item;
    var itemId = String(item.id || "").trim();
    var entry = getItemDraftEntry(mediaDraft, menuEntry);
    var overrides = entry.overrides || {};
    var cardPath = resolveMediaPath(entry, "card", mediaDraft.defaults);
    var hoverPath = resolveMediaPath(entry, "hover", mediaDraft.defaults);
    var modalPath = resolveMediaPath(entry, "modal", mediaDraft.defaults);

    return ''
      + '<section class="media-item-view">'
      + '  <header class="media-item-view__header">'
      + '    <div>'
      + '      <p class="kicker">Media / \u00cdtem</p>'
      + '      <h3>' + escapeHtml(item.name || itemId) + '</h3>'
      + '      <p class="inline-help">ID interno: ' + escapeHtml(itemId) + '</p>'
      + '    </div>'
      + '    <div class="home-editor__actions">'
      + '      <button class="btn btn-ghost" type="button" data-action="open-browser">Volver al browser</button>'
      + '    </div>'
      + '  </header>'
      + '  <div class="media-detail media-detail--standalone">'
      + '    <div class="media-detail__grid">'
      + '      <div class="media-global-grid">'
      + '        <div class="media-detail__preview">'
      + '          <span class="kicker">Card</span>'
      + '          <img src="/' + escapeHtml(cardPath || C.MENU_PLACEHOLDER_IMAGE) + '" alt="" />'
      + '        </div>'
      + '        <div class="media-detail__preview">'
      + '          <span class="kicker">Hover</span>'
      + '          <img src="/' + escapeHtml(hoverPath || C.MENU_PLACEHOLDER_IMAGE) + '" alt="" />'
      + '        </div>'
      + '        <div class="media-detail__preview">'
      + '          <span class="kicker">Modal</span>'
      + '          <img src="/' + escapeHtml(modalPath || C.MENU_MODAL_PLACEHOLDER_IMAGE) + '" alt="" />'
      + '        </div>'
      + '      </div>'
      + '      <div class="media-detail__fields">'
      + '        <label class="field media-field-row">'
      + '          <span>Imagen fuente</span>'
      + '          <input id="media-item-source" class="input-text" type="text" value="' + escapeHtml(entry.source || "") + '" placeholder="assets/menu/ejemplo.webp" />'
      + '          <small class="inline-help">Si no hay overrides, esta ruta se usa en todas las variantes.</small>'
      + '        </label>'
      + '        <label class="field media-field-row">'
      + '          <span>Texto alt</span>'
      + '          <input id="media-item-alt" class="input-text" type="text" value="' + escapeHtml(entry.alt || "") + '" placeholder="Descripci\u00f3n accesible de la imagen" />'
      + '        </label>'
      + '        <div class="media-global-grid">'
      + '          <label class="field media-field-row' + (overrides.card ? ' has-override' : '') + '">'
      + '            <span>Override para card</span>'
      + '            <input id="media-override-card" class="input-text" type="text" value="' + escapeHtml(overrides.card || "") + '" placeholder="Opcional" />'
      + '          </label>'
      + '          <label class="field media-field-row' + (overrides.hover ? ' has-override' : '') + '">'
      + '            <span>Override para hover</span>'
      + '            <input id="media-override-hover" class="input-text" type="text" value="' + escapeHtml(overrides.hover || "") + '" placeholder="Opcional" />'
      + '          </label>'
      + '          <label class="field media-field-row' + (overrides.modal ? ' has-override' : '') + '">'
      + '            <span>Override para modal</span>'
      + '            <input id="media-override-modal" class="input-text" type="text" value="' + escapeHtml(overrides.modal || "") + '" placeholder="Opcional" />'
      + '          </label>'
      + '        </div>'
      + '        <div class="home-editor__actions">'
      + '          <button id="media-save-item-button" class="btn btn-primary" type="button" data-action="save-item">Guardar cambios</button>'
      + '          <button class="btn btn-ghost" type="button" data-action="open-browser">Volver al browser</button>'
      + '        </div>'
      + '      </div>'
      + '    </div>'
      + '  </div>'
      + '</section>';
  }

  function renderMainView(ctx, mediaDraft) {
    return ''
      + '<div class="media-sections-content">'
      + renderBrowserSection(ctx, mediaDraft)
      + renderHomepageSection(mediaDraft)
      + renderBrandingSection(mediaDraft)
      + renderDefaultsSection(mediaDraft)
      + renderIntegritySection(mediaDraft)
      + '</div>';
  }

  function renderMediaEditor(ctx) {
    ensureSelectedItemStillExists(ctx);
    var mediaDraft = ensureMediaDraftShape(ctx);
    var panel = ctx.views.mediaEditorPanel;
    if (!panel) return;

    var selectedEntry = getSelectedMenuEntry(ctx);
    var isItemMode = panelState.mode === "item";

    if (isItemMode && !selectedEntry) {
      panelState.mode = "browser";
      panelState.selectedItemId = "";
      if (typeof ctx.navigateToRoute === "function") {
        ctx.navigateToRoute("/media", { replace: true });
        return;
      }
    }

    var title = isItemMode ? "Editor de media por \u00edtem" : "Activos visuales";
    var subtitle = isItemMode
      ? "Edita source, alt y overrides en una vista dedicada por \u00edtem."
      : "Administra fuentes, overrides, valores por defecto y activos globales sin salir del Admin custom.";

    panel.innerHTML = ''
      + '<div class="home-editor__header">'
      + '  <div>'
      + '    <p class="kicker">Media</p>'
      + '    <h2>' + escapeHtml(title) + '</h2>'
      + '    <p class="home-editor__subtitle">' + escapeHtml(subtitle) + '</p>'
      + '  </div>'
      + '  <div class="home-editor__actions">'
      + '    <button id="media-save-draft-button" class="btn btn-primary" type="button" data-action="save-draft">Guardar borrador</button>'
      + '    <button id="media-export-json-button" class="btn btn-ghost" type="button" data-action="export-json">Exportar JSON</button>'
      + '    <button id="media-publish-preview-button" class="btn btn-primary" type="button" data-action="publish-preview">Publicar preview</button>'
      + '    <button id="media-publish-production-button" class="btn btn-ghost" type="button" data-action="publish-production">Publicar producci\u00f3n</button>'
      + '  </div>'
      + '</div>'
      + '<p id="media-editor-status" class="data-status" role="status" aria-live="polite">Borrador listo.</p>'
      + (isItemMode ? renderItemEditorBody(ctx, mediaDraft, selectedEntry) : renderMainView(ctx, mediaDraft));

    if (typeof ctx.refreshMediaScrollAnchors === "function") {
      ctx.refreshMediaScrollAnchors();
    }

    if (isItemMode) {
      if (typeof ctx.setActiveMediaSection === "function") {
        ctx.setActiveMediaSection("", { force: true });
      }
      return;
    }

    if (typeof ctx.updateMediaScrollSpy === "function") {
      ctx.updateMediaScrollSpy(true);
    }
  }

  function saveItem(ctx) {
    var panel = ctx.views.mediaEditorPanel;
    if (!panel || !panelState.selectedItemId) return;

    var mediaDraft = ensureMediaDraftShape(ctx);
    var menuEntry = getSelectedMenuEntry(ctx);
    if (!menuEntry || !menuEntry.item) return;

    var itemId = String(menuEntry.item.id || "").trim();
    var entry = createFallbackItem(itemId, menuEntry.item.name || itemId);
    if (mediaDraft.items[itemId] && typeof mediaDraft.items[itemId] === "object") {
      entry = mediaDraft.items[itemId];
    }
    if (!entry.overrides || typeof entry.overrides !== "object") {
      entry.overrides = { card: "", hover: "", modal: "", gallery: [] };
    }

    var sourceInput = panel.querySelector("#media-item-source");
    var altInput = panel.querySelector("#media-item-alt");
    var overrideCardInput = panel.querySelector("#media-override-card");
    var overrideHoverInput = panel.querySelector("#media-override-hover");
    var overrideModalInput = panel.querySelector("#media-override-modal");

    entry.source = sourceInput ? String(sourceInput.value || "").trim() : "";
    entry.alt = altInput ? String(altInput.value || "").trim() : "";
    entry.overrides.card = overrideCardInput ? String(overrideCardInput.value || "").trim() : "";
    entry.overrides.hover = overrideHoverInput ? String(overrideHoverInput.value || "").trim() : "";
    entry.overrides.modal = overrideModalInput ? String(overrideModalInput.value || "").trim() : "";
    if (!Array.isArray(entry.overrides.gallery)) {
      entry.overrides.gallery = [];
    }

    mediaDraft.items[itemId] = entry;
    ctx.setMediaDraftUpdatedAt("admin-app");
    ctx.persistDraftsToLocalStorage();
    ctx.updateDashboardMetrics();
    renderMediaEditor(ctx);
    ctx.setMediaEditorStatus("Cambios del \u00edtem guardados en el borrador.");
  }

  function saveGlobalSections(ctx) {
    var panel = ctx.views.mediaEditorPanel;
    if (!panel) return;

    var mediaDraft = ensureMediaDraftShape(ctx);
    var globalInputs = panel.querySelectorAll("[data-global-key]");
    Array.prototype.forEach.call(globalInputs, function (input) {
      var path = String(input.getAttribute("data-global-key") || "").split(".");
      if (path.length !== 2) return;
      var group = path[0];
      var key = path[1];
      if (!mediaDraft.global[group] || typeof mediaDraft.global[group] !== "object") {
        mediaDraft.global[group] = {};
      }
      mediaDraft.global[group][key] = String(input.value || "").trim();
    });

    var defaultInputs = panel.querySelectorAll("[data-default-key]");
    Array.prototype.forEach.call(defaultInputs, function (input) {
      var key = String(input.getAttribute("data-default-key") || "").trim();
      if (!key) return;
      mediaDraft.defaults[key] = String(input.value || "").trim();
    });

    ctx.setMediaDraftUpdatedAt("admin-app");
    ctx.persistDraftsToLocalStorage();
    renderMediaEditor(ctx);
    ctx.setMediaEditorStatus("Secciones globales guardadas en el borrador.");
  }

  function openMediaEditor(ctx, options) {
    options = options || {};
    var requestedItemId = String(options.itemId || "").trim();

    if (!options.skipRoute) {
      var path = requestedItemId ? getMediaItemRoute(requestedItemId) : "/media";
      ctx.navigateToRoute(path, { replace: Boolean(options.replaceRoute) });
      return;
    }

    if (!ctx.state.hasDataLoaded) {
      ctx.ensureDataLoaded(false);
      return;
    }

    ctx.ensureMenuDraft();
    ensureMediaDraftShape(ctx);

    if (requestedItemId) {
      panelState.mode = "item";
      panelState.selectedItemId = requestedItemId;
    } else {
      panelState.mode = "browser";
    }

    ensureSelectedItemStillExists(ctx);

    if (panelState.mode === "item" && !getSelectedMenuEntry(ctx)) {
      panelState.mode = "browser";
      panelState.selectedItemId = "";
      ctx.navigateToRoute("/media", { replace: true });
      return;
    }

    ctx.setActivePanel("media-editor");
    renderMediaEditor(ctx);

    ctx.setMenuBrowserStatus("");
    ctx.setItemEditorStatus("");
    ctx.setHomeEditorStatus("");
    ctx.setIngredientsEditorStatus("");
    ctx.setCategoriesEditorStatus("");
    ctx.setRestaurantEditorStatus("");
    if (typeof ctx.setPagesEditorStatus === "function") {
      ctx.setPagesEditorStatus("");
    }
  }

  function bindEvents(ctx) {
    var panel = ctx.views.mediaEditorPanel;
    if (!panel || panel.getAttribute("data-media-panel-bound") === "true") {
      return;
    }

    panel.setAttribute("data-media-panel-bound", "true");

    panel.addEventListener("input", function (event) {
      var target = event.target;
      if (!target) return;
      if (target.id === "media-search") {
        panelState.searchQuery = String(target.value || "");
        renderMediaEditor(ctx);
      }
    });

    panel.addEventListener("click", function (event) {
      var target = event.target.closest("[data-action]");
      if (!target) return;

      var action = target.getAttribute("data-action") || "";

      if (action === "open-item-editor") {
        var itemId = String(target.getAttribute("data-item-id") || "").trim();
        if (!itemId) return;
        panelState.selectedItemId = itemId;
        ctx.navigateToRoute(getMediaItemRoute(itemId));
        return;
      }

      if (action === "open-browser") {
        panelState.mode = "browser";
        ctx.navigateToRoute("/media");
        return;
      }

      if (action === "save-item") {
        saveItem(ctx);
        return;
      }

      if (action === "save-globals") {
        saveGlobalSections(ctx);
        return;
      }

      if (action === "save-draft") {
        ctx.persistDraftsToLocalStorage();
        ctx.setMediaEditorStatus("Borrador de media guardado localmente.");
        return;
      }

      if (action === "export-json") {
        ctx.exportCurrentDrafts();
        return;
      }

      if (action === "publish-preview") {
        ctx.publishChanges("preview");
        return;
      }

      if (action === "publish-production") {
        ctx.publishChanges("production");
      }
    });
  }

  ns.mediaPanel = {
    open: openMediaEditor,
    render: renderMediaEditor,
    bindEvents: bindEvents,
    sections: SECTION_DEFINITIONS,
    normalizeSectionId: normalizeSectionId,
    getSectionAnchorId: getSectionAnchorId
  };
})();
