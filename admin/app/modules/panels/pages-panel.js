// admin/app/modules/panels/pages-panel.js
// Native scaffold panel for future unique website pages.

(function () {
  "use strict";

  var ns = window.FigataAdmin = window.FigataAdmin || {};
  var RU = ns.renderUtils;

  var SECTION_DEFINITIONS = [
    { id: "menu", label: "Men\u00fa" },
    { id: "nosotros", label: "Nosotros" },
    { id: "ubicacion", label: "Ubicaci\u00f3n" },
    { id: "contacto", label: "Contacto" },
    { id: "eventos", label: "Eventos" },
    { id: "faqs", label: "FAQs" }
  ];

  var SECTION_PLACEHOLDER_COPY = {
    menu: {
      title: "P\u00e1gina de Men\u00fa",
      description: "Reservado para la futura configuraci\u00f3n del contenido editorial de la p\u00e1gina de men\u00fa."
    },
    nosotros: {
      title: "P\u00e1gina Nosotros",
      description: "Reservado para la futura configuraci\u00f3n de historia, narrativa y bloques institucionales."
    },
    ubicacion: {
      title: "P\u00e1gina Ubicaci\u00f3n",
      description: "Reservado para la futura configuraci\u00f3n de mapa, accesos, horarios y contexto local."
    },
    contacto: {
      title: "P\u00e1gina Contacto",
      description: "Reservado para la futura configuraci\u00f3n de canales de contacto y llamadas a la acci\u00f3n."
    },
    eventos: {
      title: "P\u00e1gina Eventos",
      description: "Reservado para la futura configuraci\u00f3n de agenda, destacados y reglas de publicaci\u00f3n."
    },
    faqs: {
      title: "P\u00e1gina FAQs",
      description: "Reservado para la futura configuraci\u00f3n de preguntas frecuentes y estructura de soporte."
    }
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
    return "pages-section-" + normalizeSectionId(sectionId);
  }

  function getDefaultSectionId() {
    return SECTION_DEFINITIONS.length ? SECTION_DEFINITIONS[0].id : "";
  }

  function getSectionCopy(sectionId) {
    var normalizedId = normalizeSectionId(sectionId);
    return SECTION_PLACEHOLDER_COPY[normalizedId] || {
      title: "Secci\u00f3n reservada",
      description: "Reservado para futura configuraci\u00f3n."
    };
  }

  function renderSection(section) {
    var copy = getSectionCopy(section.id);
    return ''
      + '<section class="categories-section card" id="' + escapeHtml(getSectionAnchorId(section.id)) + '" tabindex="-1" data-pages-anchor="true" data-pages-section-id="' + escapeHtml(section.id) + '">'
      + '  <header class="categories-section__header">'
      + '    <div class="categories-section__title-wrap">'
      + '      <h3>' + escapeHtml(section.label) + '</h3>'
      + '      <p class="inline-help">' + escapeHtml(copy.description) + '</p>'
      + '    </div>'
      + '  </header>'
      + '  <div class="pages-section__placeholder">'
      + '    <p class="pages-placeholder__eyebrow">Pr\u00f3ximamente</p>'
      + '    <h4 class="pages-placeholder__title">Editor a\u00fan no implementado</h4>'
      + '    <p class="home-editor__hint">' + escapeHtml(copy.title) + '.</p>'
      + '    <div class="pages-placeholder__chips">'
      + '      <span class="pages-placeholder__chip">Base visual activa</span>'
      + '      <span class="pages-placeholder__chip">Sin edici\u00f3n real</span>'
      + '      <span class="pages-placeholder__chip">Listo para iterar</span>'
      + '    </div>'
      + '  </div>'
      + '</section>';
  }

  function syncPanelState(ctx, options) {
    var requestedSectionId = options && options.activeSectionId;
    var activeSectionId = normalizeSectionId(requestedSectionId || ctx.state.pagesActiveSectionId);
    if (!activeSectionId) {
      activeSectionId = getDefaultSectionId();
    }
    ctx.state.pagesActiveSectionId = activeSectionId;

    if (typeof ctx.setActivePagesSection === "function") {
      ctx.setActivePagesSection(activeSectionId, { force: true });
    }
    if (typeof ctx.refreshPagesScrollAnchors === "function") {
      ctx.refreshPagesScrollAnchors();
    }
    if (typeof ctx.updatePagesScrollSpy === "function") {
      ctx.updatePagesScrollSpy(true);
    }
  }

  function renderPagesEditor(ctx, options) {
    var panel = ctx.views.pagesEditorPanel;
    if (!panel) return;

    var sectionsHtml = SECTION_DEFINITIONS.map(renderSection).join("");
    panel.innerHTML = ''
      + '<div class="home-editor__header">'
      + '  <div>'
      + '    <p class="kicker">Pages</p>'
      + '    <h2>P\u00e1ginas \u00fanicas del sitio</h2>'
      + '    <p class="home-editor__subtitle">Estructura base para futuras p\u00e1ginas del sitio (sin incluir HomePage).</p>'
      + '  </div>'
      + '</div>'
      + '<p id="pages-editor-status" class="data-status" role="status" aria-live="polite">Estructura base preparada para futura implementaci\u00f3n.</p>'
      + '<div class="home-sections-content pages-sections-content">'
      + sectionsHtml
      + '</div>';

    if (typeof ctx.renderSidebarPagesAccordion === "function") {
      ctx.renderSidebarPagesAccordion();
    }
    syncPanelState(ctx, options || {});
  }

  function openPagesEditor(ctx, options) {
    options = options || {};
    if (!options.skipRoute) {
      ctx.navigateToRoute("/pages", { replace: Boolean(options.replaceRoute) });
      return;
    }

    if (!ctx.state.hasDataLoaded) {
      ctx.ensureDataLoaded(false);
      return;
    }

    ctx.setActivePanel("pages-editor");
    renderPagesEditor(ctx, options);

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
  }

  function bindPagesEditorEvents(ctx) {
    var panel = ctx.views.pagesEditorPanel;
    if (!panel || panel.getAttribute("data-pages-panel-bound") === "true") {
      return;
    }

    panel.setAttribute("data-pages-panel-bound", "true");
    panel.addEventListener("focusin", function (event) {
      var sectionElement = event.target.closest("[data-pages-anchor='true']");
      if (!sectionElement) return;
      var sectionId = sectionElement.getAttribute("data-pages-section-id") || "";
      if (!sectionId) return;
      if (typeof ctx.setActivePagesSection === "function") {
        ctx.setActivePagesSection(sectionId, { force: true });
      }
    });
  }

  ns.pagesPanel = {
    open: openPagesEditor,
    render: renderPagesEditor,
    bindEvents: bindPagesEditorEvents,
    sections: SECTION_DEFINITIONS,
    normalizeSectionId: normalizeSectionId,
    getSectionAnchorId: getSectionAnchorId
  };
})();
