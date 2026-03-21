// admin/app/modules/panels/restaurant-panel.js
// Restaurant master data editor panel.
// Follows the same open → setActivePanel → render pattern as other editors.
// Dependencies: FigataAdmin.renderUtils (escapeHtml)

(function () {
  "use strict";

  var ns = window.FigataAdmin = window.FigataAdmin || {};
  var RU = ns.renderUtils;

  function escapeHtml(value) {
    return RU.escapeHtml(value);
  }

  function getVal(obj, key) {
    if (!obj || obj[key] === null || obj[key] === undefined) return "";
    return escapeHtml(String(obj[key]));
  }

  var SECTION_DEFINITIONS = [
    { id: "identity", label: "Identidad del negocio" },
    { id: "contact", label: "Información de contacto" },
    { id: "location", label: "Ubicación" },
    { id: "hours", label: "Horarios" },
    { id: "links", label: "Redes sociales y enlaces" },
    { id: "branding", label: "Branding" },
    { id: "seo", label: "SEO y datos estructurados" },
    { id: "metadata", label: "Metadata operativa" }
  ];

  function normalizeSectionId(sectionId) {
    var normalizedId = String(sectionId || "").trim();
    if (!normalizedId) return "";
    var isKnown = SECTION_DEFINITIONS.some(function (section) {
      return section.id === normalizedId;
    });
    return isKnown ? normalizedId : "";
  }

  function getSectionAnchorId(sectionId) {
    return "restaurant-section-" + normalizeSectionId(sectionId);
  }

  function renderFieldGrid(contentHtml) {
    return '<div class="categories-section__grid">' + contentHtml + '</div>';
  }

  function renderSection(sectionId, title, description, contentHtml) {
    var normalizedId = normalizeSectionId(sectionId);
    return ''
      + '<section class="categories-section card" id="' + getSectionAnchorId(normalizedId) + '" tabindex="-1" data-restaurant-anchor="true" data-restaurant-section-id="' + escapeHtml(normalizedId) + '">'
      + '  <header class="categories-section__header">'
      + '    <div class="categories-section__title-wrap">'
      + '      <h3>' + escapeHtml(title) + '</h3>'
      + '      <p class="inline-help">' + escapeHtml(description) + '</p>'
      + '    </div>'
      + '  </header>'
      + contentHtml
      + '</section>';
  }

  function renderSubsection(title, fieldsHtml) {
    return ''
      + '<div class="restaurant-section__group">'
      + '  <div class="restaurant-section__group-header">'
      + '    <h4>' + escapeHtml(title) + '</h4>'
      + '  </div>'
      + renderFieldGrid(fieldsHtml)
      + '</div>';
  }

  function openRestaurantEditor(ctx, options) {
    options = options || {};
    if (!options.skipRoute) {
      ctx.navigateToRoute("/restaurant", { replace: Boolean(options.replaceRoute) });
      return;
    }

    if (!ctx.state.hasDataLoaded) {
      ctx.ensureDataLoaded(false);
      return;
    }

    ctx.ensureRestaurantDraft();
    ctx.setActivePanel("restaurant-editor");
    renderRestaurantEditor(ctx);

    ctx.setMenuBrowserStatus("");
    ctx.setItemEditorStatus("");
    ctx.setHomeEditorStatus("");
    ctx.setIngredientsEditorStatus("");
    ctx.setCategoriesEditorStatus("");
    if (typeof ctx.setPagesEditorStatus === "function") {
      ctx.setPagesEditorStatus("");
    }
  }

  function renderRestaurantEditor(ctx) {
    if (!ctx.state.drafts.restaurant) {
      ctx.ensureRestaurantDraft();
    }
    var draft = ctx.state.drafts.restaurant;

    // Ensure sub-objects exist
    if (!draft.contact) draft.contact = {};
    if (!draft.location) draft.location = {};
    if (!draft.hours) draft.hours = {};
    if (!draft.social) draft.social = {};
    if (!draft.links) draft.links = {};
    if (!draft.branding) draft.branding = {};
    if (!draft.seo) draft.seo = {};
    if (!draft.meta) draft.meta = {};

    var panel = ctx.views.restaurantEditorPanel;
    if (!panel) return;

    var html = '<div class="home-editor__header">'
      + '<div>'
      + '<p class="kicker">Restaurante</p>'
      + '<h2>Informaci\u00f3n del negocio</h2>'
      + '<p class="home-editor__subtitle">Edita identidad, contacto, ubicaci\u00f3n, horarios, marca y metadata del negocio desde un solo panel.</p>'
      + '</div>'
      + '<div class="home-editor__actions">'
      + '<button id="restaurant-save-button" class="btn btn-primary" type="button">Guardar borrador</button>'
      + '<button id="restaurant-export-json-button" class="btn btn-ghost" type="button">Exportar JSON</button>'
      + '<button id="restaurant-publish-preview-button" class="btn btn-primary" type="button">Publicar preview</button>'
      + '<button id="restaurant-publish-production-button" class="btn btn-ghost" type="button">Publicar producci\u00f3n</button>'
      + '</div>'
      + '</div>'
      + '<p id="restaurant-editor-status" class="data-status" role="status" aria-live="polite">Borrador listo.</p>'
      + '<div class="home-sections-content restaurant-sections-content">';

    html += renderSection(
      "identity",
      "Identidad del negocio",
      "Nombre visible, eslogan y descripción principal de la marca.",
      renderFieldGrid(
        renderField("restaurant-field-name", "Nombre", getVal(draft, "name"), "text", true)
        + renderField("restaurant-field-tagline", "Eslogan", getVal(draft, "tagline"), "text", true)
        + renderTextarea("restaurant-field-description", "Descripci\u00f3n", getVal(draft, "description"), true)
      )
    );

    html += renderSection(
      "contact",
      "Informaci\u00f3n de contacto",
      "Canales de contacto directo para clientes y operaciones.",
      renderFieldGrid(
        renderField("restaurant-field-phone", "Tel\u00e9fono", getVal(draft.contact, "phone"), "text")
        + renderField("restaurant-field-whatsapp", "URL de WhatsApp", getVal(draft.contact, "whatsapp"), "text")
        + renderField("restaurant-field-email", "Correo", getVal(draft.contact, "email"), "email", true)
      )
    );

    html += renderSection(
      "location",
      "Ubicación",
      "Dirección física, mapa y coordenadas del restaurante.",
      renderFieldGrid(
        renderField("restaurant-field-address", "Direcci\u00f3n", getVal(draft.location, "address"), "text", true)
        + renderField("restaurant-field-city", "Ciudad", getVal(draft.location, "city"), "text")
        + renderField("restaurant-field-region", "Regi\u00f3n/\u00e1rea", getVal(draft.location, "region"), "text")
        + renderField("restaurant-field-country", "Pa\u00eds", getVal(draft.location, "country"), "text")
        + renderField("restaurant-field-postalCode", "C\u00f3digo Postal", getVal(draft.location, "postalCode"), "text")
        + renderField("restaurant-field-mapsUrl", "URL de Maps", getVal(draft.location, "mapsUrl"), "url", true)
        + renderField("restaurant-field-lat", "Latitud", getVal(draft.location, "latitude"), "number")
        + renderField("restaurant-field-lng", "Longitud", getVal(draft.location, "longitude"), "number")
      )
    );

    html += renderSection(
      "hours",
      "Horarios",
      "Horario comercial por día y notas operativas.",
      renderFieldGrid(
        renderField("restaurant-field-h-mon", "Lunes", getVal(draft.hours, "monday"), "text", false, "Ej: 12:00-22:00 o Cerrado")
        + renderField("restaurant-field-h-tue", "Martes", getVal(draft.hours, "tuesday"), "text", false, "Ej: 12:00-22:00")
        + renderField("restaurant-field-h-wed", "Mi\u00e9rcoles", getVal(draft.hours, "wednesday"), "text", false, "Ej: 12:00-22:00")
        + renderField("restaurant-field-h-thu", "Jueves", getVal(draft.hours, "thursday"), "text", false, "Ej: 12:00-22:00")
        + renderField("restaurant-field-h-fri", "Viernes", getVal(draft.hours, "friday"), "text", false, "Ej: 12:00-23:00")
        + renderField("restaurant-field-h-sat", "S\u00e1bado", getVal(draft.hours, "saturday"), "text", false, "Ej: 12:00-23:00")
        + renderField("restaurant-field-h-sun", "Domingo", getVal(draft.hours, "sunday"), "text", false, "Ej: 12:00-22:00")
        + renderField("restaurant-field-h-notes", "Notas", getVal(draft.hours, "notes"), "text", true, "Feriados pueden variar, etc.")
      )
    );

    html += renderSection(
      "links",
      "Redes sociales y enlaces",
      "Canales públicos, reservas, delivery y recursos externos de la marca.",
      renderSubsection(
        "Redes sociales",
        renderField("restaurant-field-s-instagram", "Instagram", getVal(draft.social, "instagram"), "url")
        + renderField("restaurant-field-s-tiktok", "TikTok", getVal(draft.social, "tiktok"), "url")
        + renderField("restaurant-field-s-facebook", "Facebook", getVal(draft.social, "facebook"), "url")
        + renderField("restaurant-field-s-tripadvisor", "TripAdvisor", getVal(draft.social, "tripadvisor"), "url")
      )
      + renderSubsection(
        "Enlaces externos",
        renderField("restaurant-field-l-reservation", "Reservas URL", getVal(draft.links, "reservationUrl"), "url", true)
        + renderField("restaurant-field-l-delivery", "Delivery URL", getVal(draft.links, "deliveryUrl"), "url", true)
        + renderField("restaurant-field-l-menu", "Menu PDF URL", getVal(draft.links, "menuPdf"), "url", true)
      )
    );

    html += renderSection(
      "branding",
      "Branding",
      "Rutas base de identidad visual y colores principales de marca.",
      renderFieldGrid(
        renderField("restaurant-field-b-logo", "Ruta del logo", getVal(draft.branding, "logo"), "text")
        + renderField("restaurant-field-b-logoAlt", "Ruta del logo alterno", getVal(draft.branding, "logoAlt"), "text")
        + renderField("restaurant-field-b-favicon", "Ruta del favicon", getVal(draft.branding, "favicon"), "text")
        + renderField("restaurant-field-b-primary", "Color primario", getVal(draft.branding, "primaryColor"), "text")
        + renderField("restaurant-field-b-secondary", "Color secundario", getVal(draft.branding, "secondaryColor"), "text")
      )
    );

    html += renderSection(
      "seo",
      "SEO y datos estructurados",
      "Metadatos de cocina, canonical y rango de precio para buscadores.",
      renderFieldGrid(
        renderField("restaurant-field-seo-cuisine", "Tipo de cocina", getVal(draft.seo, "cuisine"), "text")
        + renderField("restaurant-field-seo-price", "Rango de precios", getVal(draft.seo, "priceRange"), "text", false, "Ej: $$-$$$")
        + renderField("restaurant-field-seo-canonical", "URL can\u00f3nica", getVal(draft.seo, "canonicalUrl"), "url", true)
      )
    );

    html += renderSection(
      "metadata",
      "Metadata operativa",
      "Configuración base de moneda, idioma y zona horaria.",
      renderFieldGrid(
        renderField("restaurant-field-m-currency", "Moneda", getVal(draft.meta, "currency"), "text")
        + renderField("restaurant-field-m-timezone", "Zona horaria", getVal(draft.meta, "timezone"), "text")
        + renderField("restaurant-field-m-language", "Idioma", getVal(draft.meta, "language"), "text")
      )
    );

    panel.innerHTML = html + '</div>';
    if (typeof ctx.refreshRestaurantScrollAnchors === "function") {
      ctx.refreshRestaurantScrollAnchors();
    }
    if (typeof ctx.updateRestaurantScrollSpy === "function") {
      ctx.updateRestaurantScrollSpy(true);
    }
  }

  function renderField(id, label, value, type, fullWidth, placeholder) {
    var style = fullWidth ? ' style="grid-column: 1 / -1;"' : '';
    var extraAttrs = '';
    if (type === "number") extraAttrs = ' step="any"';
    if (placeholder) extraAttrs += ' placeholder="' + escapeHtml(placeholder) + '"';
    return '<label class="field"' + style + '>'
      + '<span>' + escapeHtml(label) + '</span>'
      + '<input id="' + id + '" type="' + type + '" value="' + value + '"' + extraAttrs + ' />'
      + '</label>';
  }

  function renderTextarea(id, label, value, fullWidth) {
    var style = fullWidth ? ' style="grid-column: 1 / -1;"' : '';
    return '<label class="field"' + style + '>'
      + '<span>' + escapeHtml(label) + '</span>'
      + '<textarea id="' + id + '" rows="3">' + value + '</textarea>'
      + '</label>';
  }

  function syncToDraft(ctx) {
    var draft = ctx.state.drafts.restaurant;
    if (!draft) return;
    if (!draft.contact) draft.contact = {};
    if (!draft.location) draft.location = {};
    if (!draft.hours) draft.hours = {};
    if (!draft.social) draft.social = {};
    if (!draft.links) draft.links = {};
    if (!draft.branding) draft.branding = {};
    if (!draft.seo) draft.seo = {};
    if (!draft.meta) draft.meta = {};

    var v = function (id) {
      var el = document.getElementById(id);
      return el ? el.value || "" : "";
    };

    draft.name = v("restaurant-field-name");
    draft.tagline = v("restaurant-field-tagline");
    draft.description = v("restaurant-field-description");

    draft.contact.phone = v("restaurant-field-phone");
    draft.contact.whatsapp = v("restaurant-field-whatsapp");
    draft.contact.email = v("restaurant-field-email");

    draft.location.address = v("restaurant-field-address");
    draft.location.city = v("restaurant-field-city");
    draft.location.region = v("restaurant-field-region");
    draft.location.country = v("restaurant-field-country");
    draft.location.postalCode = v("restaurant-field-postalCode");
    draft.location.mapsUrl = v("restaurant-field-mapsUrl");

    var lat = v("restaurant-field-lat");
    draft.location.latitude = lat ? Number(lat) : null;
    var lng = v("restaurant-field-lng");
    draft.location.longitude = lng ? Number(lng) : null;

    draft.hours.monday = v("restaurant-field-h-mon");
    draft.hours.tuesday = v("restaurant-field-h-tue");
    draft.hours.wednesday = v("restaurant-field-h-wed");
    draft.hours.thursday = v("restaurant-field-h-thu");
    draft.hours.friday = v("restaurant-field-h-fri");
    draft.hours.saturday = v("restaurant-field-h-sat");
    draft.hours.sunday = v("restaurant-field-h-sun");
    draft.hours.notes = v("restaurant-field-h-notes");

    draft.social.instagram = v("restaurant-field-s-instagram");
    draft.social.tiktok = v("restaurant-field-s-tiktok");
    draft.social.facebook = v("restaurant-field-s-facebook");
    draft.social.tripadvisor = v("restaurant-field-s-tripadvisor");

    draft.links.reservationUrl = v("restaurant-field-l-reservation");
    draft.links.deliveryUrl = v("restaurant-field-l-delivery");
    draft.links.menuPdf = v("restaurant-field-l-menu");

    draft.branding.logo = v("restaurant-field-b-logo");
    draft.branding.logoAlt = v("restaurant-field-b-logoAlt");
    draft.branding.favicon = v("restaurant-field-b-favicon");
    draft.branding.primaryColor = v("restaurant-field-b-primary");
    draft.branding.secondaryColor = v("restaurant-field-b-secondary");

    draft.seo.cuisine = v("restaurant-field-seo-cuisine");
    draft.seo.priceRange = v("restaurant-field-seo-price");
    draft.seo.canonicalUrl = v("restaurant-field-seo-canonical");

    draft.meta.currency = v("restaurant-field-m-currency");
    draft.meta.timezone = v("restaurant-field-m-timezone");
    draft.meta.language = v("restaurant-field-m-language");

    // Run validation
    var statusEl = document.getElementById("restaurant-editor-status");
    if (statusEl && window.FigataRestaurantContract) {
      var validation = window.FigataRestaurantContract.validateRestaurantContract(draft);
      if (validation.errors.length) {
        statusEl.textContent = "Error de validación: " + validation.errors[0] + " (" + validation.errors.length + " errores totales)";
        statusEl.style.color = "rgb(255, 120, 100)";
      } else if (validation.warnings.length) {
        statusEl.textContent = "Advertencia: " + validation.warnings[0];
        statusEl.style.color = "rgb(255, 200, 80)";
      } else {
        statusEl.textContent = "Borrador de restaurante v\u00e1lido sin errores.";
        statusEl.style.color = "";
      }
    }

    ctx.persistDraftsToLocalStorage();
  }

  function bindRestaurantEditorEvents(ctx) {
    var panel = ctx.views.restaurantEditorPanel;
    if (!panel) return;

    panel.addEventListener("input", function (e) {
      if (e.target.matches("input, textarea, select")) {
        syncToDraft(ctx);
      }
    });

    panel.addEventListener("click", function (e) {
      var target = e.target;
      if (target.id === "restaurant-save-button") {
        syncToDraft(ctx);
        ctx.setDataStatus("Borrador de restaurante guardado localmente.");
      } else if (target.id === "restaurant-export-json-button") {
        ctx.exportCurrentDrafts();
      } else if (target.id === "restaurant-publish-preview-button") {
        ctx.publishChanges("preview");
      } else if (target.id === "restaurant-publish-production-button") {
        ctx.publishChanges("production");
      }
    });
  }

  ns.restaurantPanel = {
    open: openRestaurantEditor,
    render: renderRestaurantEditor,
    syncToDraft: syncToDraft,
    bindEvents: bindRestaurantEditorEvents,
    sections: SECTION_DEFINITIONS,
    normalizeSectionId: normalizeSectionId,
    getSectionAnchorId: getSectionAnchorId
  };

})();
