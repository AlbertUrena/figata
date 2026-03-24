// admin/app/modules/panels/pages-panel.js
// Native Pages editor for global copy by route-level page.

(function () {
  "use strict";

  var ns = window.FigataAdmin = window.FigataAdmin || {};
  var RU = ns.renderUtils;

  var SECTION_DEFINITIONS = [
    { id: "menu", label: "Men\u00fa" },
    { id: "editorial", label: "Editorial" },
    { id: "nosotros", label: "Nosotros" },
    { id: "ubicacion", label: "Ubicaci\u00f3n" },
    { id: "contacto", label: "Contacto" },
    { id: "eventos", label: "Eventos" },
    { id: "faqs", label: "FAQs" }
  ];

  var SECTION_COPY = {
    menu: {
      title: "P\u00e1gina de Men\u00fa",
      description: "Copys globales de la p\u00e1gina cat\u00e1logo/listado."
    },
    editorial: {
      title: "P\u00e1gina Editorial del Detalle",
      description: "Copys globales de la p\u00e1gina detalle de los items del men\u00fa."
    },
    nosotros: {
      title: "P\u00e1gina Nosotros",
      description: "Reservado para configuraci\u00f3n de historia y narrativa institucional."
    },
    ubicacion: {
      title: "P\u00e1gina Ubicaci\u00f3n",
      description: "Reservado para configuraci\u00f3n de mapa, accesos y contexto local."
    },
    contacto: {
      title: "P\u00e1gina Contacto",
      description: "Reservado para configuraci\u00f3n de canales y llamadas a la acci\u00f3n."
    },
    eventos: {
      title: "P\u00e1gina Eventos",
      description: "Reservado para agenda y reglas editoriales de eventos."
    },
    faqs: {
      title: "P\u00e1gina FAQs",
      description: "Reservado para preguntas frecuentes y soporte."
    }
  };

  var DEFAULT_MENU_PAGE = {
    hero: {
      title: "Nuestra selecci\u00f3n",
      subtitle: "Una carta pensada para compartir, descubrir sabores y volver a pedir tus favoritos."
    },
    search: {
      placeholder: "",
      helper_prefix: "Busca por",
      helper_words: ["ingredientes", "al\u00e9rgenos", "platos", "bebidas"],
      empty_state: {
        title: "No encontramos resultados",
        description: "No vimos coincidencias en el men\u00fa.",
        description_with_query: "No vimos coincidencias para \"{query}\" en el men\u00fa.",
        hint: "Prueba con otro t\u00e9rmino o revisa la ortograf\u00eda."
      }
    },
    account_modal: {
      title: "Tu cuenta",
      empty_state: {
        title: "\u00a1A\u00fan no has a\u00f1adido nada!",
        description: "Explora el men\u00fa y cada plato o bebida que a\u00f1adas aparecer\u00e1 aqu\u00ed con su total estimado"
      },
      labels: {
        subtotal: "Subtotal",
        itbis: "ITBIS (18%)",
        legal_tip: "Propina legal (10%)",
        total: "Total"
      },
      total_tooltip: {
        title: "Total estimado",
        description: "Este monto es una referencia de tu cuenta e incluye ITBIS y propina legal. El total final puede variar al momento de ordenar."
      },
      remove_toast: {
        title: "\u00cdtem eliminado",
        description: "Si fue un error, a\u00fan puedes deshacerlo"
      }
    },
    states: {
      loading: "Cargando men\u00fa...",
      no_categories: "No hay categor\u00edas disponibles en este momento.",
      load_error: "No se pudo cargar el men\u00fa."
    },
    category_empty_messages: {
      entradas: "No hay entradas disponibles en este momento.",
      pizzas: "No hay pizzas disponibles en este momento.",
      postres: "No hay postres disponibles en este momento.",
      bebidas: "Nuestra selecci\u00f3n de bebidas estar\u00e1 disponible pronto.",
      productos: "No hay productos disponibles en este momento."
    }
  };

  var DEFAULT_MENU_DETAIL_EDITORIAL = {
    sensory_subtitle: "Una lectura sensorial del plato: c\u00f3mo se expresa en sabor, textura y aroma.",
    sensory: {
      section_title: "Perfil sensorial",
      subtitle: "Una lectura sensorial del plato: c\u00f3mo se expresa en sabor, textura y aroma.",
      compare_button_label: "Comparar",
      compare_button_label_active: "Cambiar",
      tabs: {
        radar_label: "Radar",
        bars_label: "Barras"
      },
      comparison_clear_label: "Quitar"
    },
    compare_modal: {
      title: "Comparar",
      description: "Selecciona otro plato para comparar su perfil sensorial con el actual.",
      search_placeholder: "",
      search_helper_prefix: "Busca por",
      search_helper_word: "plato",
      empty_state: {
        title: "Sin resultados",
        description: "No hay platos elegibles para comparar en este momento.",
        description_with_query: "No hay coincidencias para \"{query}\" en entradas y pizzas con perfil sensorial."
      },
      current_item_prefix: "Plato actual:",
      current_item_fallback: "Selecciona un plato para comparar.",
      candidate_summary_fallback: "Perfil sensorial disponible"
    },
    pairings: {
      section_title: "Maridajes recomendados",
      section_subtitle: "Selecci\u00f3n del sommelier de Figata para elevar cada bocado.",
      cta_fallback_label: "A\u00f1adir maridaje"
    },
    story: {
      section_title: "La historia detr\u00e1s"
    },
    info_chips: {
      calories: {
        title: "Calor\u00edas estimadas",
        description: "Valor aproximado por porci\u00f3n. Puede variar seg\u00fan ingredientes, tama\u00f1o y preparaci\u00f3n final."
      },
      eta: {
        title: "Tiempo estimado",
        description: "Tiempo aproximado de servicio desde que ordenas. Puede variar seg\u00fan horario y volumen de pedidos."
      }
    },
    sensory_axis_tooltips: {
      dulce: {
        title: "Dulzor",
        description: "Qu\u00e9 tan presentes son las notas dulces."
      },
      salado: {
        title: "Salinidad",
        description: "Nivel de sal y saz\u00f3n dominante."
      },
      acido: {
        title: "Acidez",
        description: "Frescura c\u00edtrica o sensaci\u00f3n \u00e1cida en boca."
      },
      cremosa: {
        title: "Cremosidad",
        description: "Textura suave, untuosa y envolvente."
      },
      crujiente: {
        title: "Crujiente",
        description: "Grado de crocancia al morder."
      },
      ligero: {
        title: "Ligereza",
        description: "Qu\u00e9 tan liviano se siente el plato."
      },
      aromatico: {
        title: "Aromas",
        description: "Intensidad y riqueza arom\u00e1tica al servir."
      },
      intensidad: {
        title: "Intensidad",
        description: "Fuerza global del sabor en cada bocado."
      }
    }
  };

  var MENU_BLOCKS = [
    {
      title: "Hero del cat\u00e1logo",
      description: "Textos globales del encabezado de la p\u00e1gina de men\u00fa.",
      fields: [
        { path: "menu_page.hero.title", label: "T\u00edtulo principal", placeholder: "Ej: Nuestra selecci\u00f3n" },
        { path: "menu_page.hero.subtitle", label: "Subt\u00edtulo del hero", type: "textarea", rows: 3 }
      ]
    },
    {
      title: "Search",
      description: "Copia global de buscador y empty state del listado.",
      fields: [
        { path: "menu_page.search.placeholder", label: "Placeholder del search", placeholder: "Ej: Buscar en el men\u00fa" },
        { path: "menu_page.search.helper_prefix", label: "Prefijo helper (rotativo)", placeholder: "Ej: Busca por" },
        { path: "menu_page.search.helper_words", label: "Palabras helper (una por l\u00ednea)", type: "array", rows: 4, placeholder: "ingredientes\nal\u00e9rgenos\nplatos\nbebidas" },
        { path: "menu_page.search.empty_state.title", label: "Empty state - t\u00edtulo", placeholder: "Ej: No encontramos resultados" },
        { path: "menu_page.search.empty_state.description", label: "Empty state - descripci\u00f3n base", type: "textarea", rows: 2 },
        { path: "menu_page.search.empty_state.description_with_query", label: "Empty state - descripci\u00f3n con query ({query})", type: "textarea", rows: 2 },
        { path: "menu_page.search.empty_state.hint", label: "Empty state - hint", type: "textarea", rows: 2 }
      ]
    },
    {
      title: "Estados globales del cat\u00e1logo",
      description: "Mensajes estructurales del listado y vac\u00edos por categor\u00eda.",
      fields: [
        { path: "menu_page.states.loading", label: "Estado cargando", placeholder: "Cargando men\u00fa..." },
        { path: "menu_page.states.no_categories", label: "Estado sin categor\u00edas", placeholder: "No hay categor\u00edas disponibles en este momento." },
        { path: "menu_page.states.load_error", label: "Estado error de carga", placeholder: "No se pudo cargar el men\u00fa." },
        { path: "menu_page.category_empty_messages.entradas", label: "Categor\u00eda vac\u00eda - Entradas" },
        { path: "menu_page.category_empty_messages.pizzas", label: "Categor\u00eda vac\u00eda - Pizzas" },
        { path: "menu_page.category_empty_messages.postres", label: "Categor\u00eda vac\u00eda - Postres" },
        { path: "menu_page.category_empty_messages.bebidas", label: "Categor\u00eda vac\u00eda - Bebidas" },
        { path: "menu_page.category_empty_messages.productos", label: "Categor\u00eda vac\u00eda - Productos" }
      ]
    }
  ];

  var EDITORIAL_BLOCKS = [
    {
      title: "Perfil sensorial (global)",
      description: "T\u00edtulos, subt\u00edtulos y labels globales de la secci\u00f3n sensorial del detalle.",
      fields: [
        { path: "menu_detail_editorial.sensory.section_title", label: "T\u00edtulo de secci\u00f3n", placeholder: "Ej: Perfil sensorial" },
        { path: "menu_detail_editorial.sensory.subtitle", label: "Subt\u00edtulo general de secci\u00f3n", type: "textarea", rows: 3 },
        { path: "menu_detail_editorial.sensory.compare_button_label", label: "Bot\u00f3n comparar (default)", placeholder: "Comparar" },
        { path: "menu_detail_editorial.sensory.compare_button_label_active", label: "Bot\u00f3n comparar (activo)", placeholder: "Cambiar" },
        { path: "menu_detail_editorial.sensory.tabs.radar_label", label: "Label tab Radar", placeholder: "Radar" },
        { path: "menu_detail_editorial.sensory.tabs.bars_label", label: "Label tab Barras", placeholder: "Barras" },
        { path: "menu_detail_editorial.sensory.comparison_clear_label", label: "Label bot\u00f3n limpiar comparaci\u00f3n", placeholder: "Quitar" }
      ]
    },
    {
      title: "Maridajes recomendados (global)",
      description: "Copia estructural de la secci\u00f3n de maridajes en detalle.",
      fields: [
        { path: "menu_detail_editorial.pairings.section_title", label: "T\u00edtulo de secci\u00f3n", placeholder: "Maridajes recomendados" },
        { path: "menu_detail_editorial.pairings.section_subtitle", label: "Subt\u00edtulo de secci\u00f3n", type: "textarea", rows: 2 },
        { path: "menu_detail_editorial.pairings.cta_fallback_label", label: "Label CTA fallback", placeholder: "A\u00f1adir maridaje" }
      ]
    },
    {
      title: "Historia detr\u00e1s (global)",
      description: "T\u00edtulos estructurales globales de la secci\u00f3n historia.",
      fields: [
        { path: "menu_detail_editorial.story.section_title", label: "T\u00edtulo de secci\u00f3n", placeholder: "La historia detr\u00e1s" }
      ]
    },
    {
      title: "Tooltips / labels globales del detalle",
      description: "Copia global para tooltips de chips y ejes del perfil sensorial.",
      fields: [
        { path: "menu_detail_editorial.info_chips.calories.title", label: "Chip calor\u00edas - t\u00edtulo tooltip" },
        { path: "menu_detail_editorial.info_chips.calories.description", label: "Chip calor\u00edas - descripci\u00f3n tooltip", type: "textarea", rows: 2 },
        { path: "menu_detail_editorial.info_chips.eta.title", label: "Chip tiempo - t\u00edtulo tooltip" },
        { path: "menu_detail_editorial.info_chips.eta.description", label: "Chip tiempo - descripci\u00f3n tooltip", type: "textarea", rows: 2 },
        { path: "menu_detail_editorial.sensory_axis_tooltips.dulce.title", label: "Eje dulce - t\u00edtulo tooltip" },
        { path: "menu_detail_editorial.sensory_axis_tooltips.dulce.description", label: "Eje dulce - descripci\u00f3n tooltip", type: "textarea", rows: 2 },
        { path: "menu_detail_editorial.sensory_axis_tooltips.salado.title", label: "Eje salado - t\u00edtulo tooltip" },
        { path: "menu_detail_editorial.sensory_axis_tooltips.salado.description", label: "Eje salado - descripci\u00f3n tooltip", type: "textarea", rows: 2 },
        { path: "menu_detail_editorial.sensory_axis_tooltips.acido.title", label: "Eje \u00e1cido - t\u00edtulo tooltip" },
        { path: "menu_detail_editorial.sensory_axis_tooltips.acido.description", label: "Eje \u00e1cido - descripci\u00f3n tooltip", type: "textarea", rows: 2 },
        { path: "menu_detail_editorial.sensory_axis_tooltips.cremosa.title", label: "Eje cremosa - t\u00edtulo tooltip" },
        { path: "menu_detail_editorial.sensory_axis_tooltips.cremosa.description", label: "Eje cremosa - descripci\u00f3n tooltip", type: "textarea", rows: 2 },
        { path: "menu_detail_editorial.sensory_axis_tooltips.crujiente.title", label: "Eje crujiente - t\u00edtulo tooltip" },
        { path: "menu_detail_editorial.sensory_axis_tooltips.crujiente.description", label: "Eje crujiente - descripci\u00f3n tooltip", type: "textarea", rows: 2 },
        { path: "menu_detail_editorial.sensory_axis_tooltips.ligero.title", label: "Eje ligero - t\u00edtulo tooltip" },
        { path: "menu_detail_editorial.sensory_axis_tooltips.ligero.description", label: "Eje ligero - descripci\u00f3n tooltip", type: "textarea", rows: 2 },
        { path: "menu_detail_editorial.sensory_axis_tooltips.aromatico.title", label: "Eje aromas - t\u00edtulo tooltip" },
        { path: "menu_detail_editorial.sensory_axis_tooltips.aromatico.description", label: "Eje aromas - descripci\u00f3n tooltip", type: "textarea", rows: 2 },
        { path: "menu_detail_editorial.sensory_axis_tooltips.intensidad.title", label: "Eje intensidad - t\u00edtulo tooltip" },
        { path: "menu_detail_editorial.sensory_axis_tooltips.intensidad.description", label: "Eje intensidad - descripci\u00f3n tooltip", type: "textarea", rows: 2 }
      ]
    }
  ];

  function escapeHtml(value) {
    return RU.escapeHtml(value == null ? "" : String(value));
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

  function normalizeStringArray(value, fallback) {
    var source = Array.isArray(value) ? value : [];
    var normalized = source.map(function (entry) {
      return normalizeText(entry);
    }).filter(Boolean);
    if (normalized.length) {
      return normalized;
    }
    return Array.isArray(fallback) ? fallback.slice() : [];
  }

  function ensureStringPath(target, path, fallback) {
    var segments = String(path || "").split(".").filter(Boolean);
    if (!segments.length) return;
    var cursor = target;
    for (var index = 0; index < segments.length; index += 1) {
      var key = segments[index];
      var isLeaf = index === segments.length - 1;
      if (isLeaf) {
        if (typeof cursor[key] !== "string") {
          cursor[key] = String(fallback || "");
        } else {
          cursor[key] = String(cursor[key]).trim();
        }
        return;
      }
      if (!isPlainObject(cursor[key])) {
        cursor[key] = {};
      }
      cursor = cursor[key];
    }
  }

  function mergeDefaults(target, defaults) {
    if (!isPlainObject(target) || !isPlainObject(defaults)) {
      return;
    }
    Object.keys(defaults).forEach(function (key) {
      var defaultValue = defaults[key];
      if (Array.isArray(defaultValue)) {
        target[key] = normalizeStringArray(target[key], defaultValue);
        return;
      }
      if (isPlainObject(defaultValue)) {
        if (!isPlainObject(target[key])) {
          target[key] = {};
        }
        mergeDefaults(target[key], defaultValue);
        return;
      }
      if (typeof defaultValue === "string") {
        if (typeof target[key] !== "string") {
          target[key] = defaultValue;
        } else {
          target[key] = String(target[key]).trim();
        }
        return;
      }
      if (target[key] === undefined) {
        target[key] = deepClone(defaultValue);
      }
    });
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
    if (!segments.length || !target || typeof target !== "object") {
      return;
    }
    var cursor = target;
    for (var index = 0; index < segments.length; index += 1) {
      var key = segments[index];
      var isLeaf = index === segments.length - 1;
      if (isLeaf) {
        cursor[key] = value;
        return;
      }
      if (!isPlainObject(cursor[key])) {
        cursor[key] = {};
      }
      cursor = cursor[key];
    }
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
    return SECTION_COPY[normalizedId] || {
      title: "Secci\u00f3n reservada",
      description: "Reservado para futura configuraci\u00f3n."
    };
  }

  function getHomeDraft(ctx) {
    if (typeof ctx.ensureHomeDraft === "function") {
      ctx.ensureHomeDraft();
    }
    if (!ctx.state || !ctx.state.drafts || !isPlainObject(ctx.state.drafts.home)) {
      return {};
    }
    return ctx.state.drafts.home;
  }

  function syncSensorySubtitleCompatibility(homeDraft) {
    if (!isPlainObject(homeDraft) || !isPlainObject(homeDraft.menu_detail_editorial)) {
      return;
    }
    var detailEditorial = homeDraft.menu_detail_editorial;
    ensureStringPath(detailEditorial, "sensory.subtitle", DEFAULT_MENU_DETAIL_EDITORIAL.sensory.subtitle);
    ensureStringPath(detailEditorial, "sensory_subtitle", DEFAULT_MENU_DETAIL_EDITORIAL.sensory.subtitle);

    var legacy = normalizeText(detailEditorial.sensory_subtitle);
    var nested = normalizeText(getByPath(detailEditorial, "sensory.subtitle"));
    var normalized = nested || legacy || DEFAULT_MENU_DETAIL_EDITORIAL.sensory.subtitle;

    setByPath(detailEditorial, "sensory.subtitle", normalized);
    detailEditorial.sensory_subtitle = normalized;
  }

  function ensurePagesDraftShape(ctx) {
    var homeDraft = getHomeDraft(ctx);
    if (!isPlainObject(homeDraft.menu_page)) {
      homeDraft.menu_page = {};
    }
    if (!isPlainObject(homeDraft.menu_detail_editorial)) {
      homeDraft.menu_detail_editorial = {};
    }
    mergeDefaults(homeDraft.menu_page, DEFAULT_MENU_PAGE);
    mergeDefaults(homeDraft.menu_detail_editorial, DEFAULT_MENU_DETAIL_EDITORIAL);
    syncSensorySubtitleCompatibility(homeDraft);
    return homeDraft;
  }

  function persistPagesDraft(ctx, message) {
    if (typeof ctx.persistDraftsToLocalStorage === "function") {
      ctx.persistDraftsToLocalStorage();
    }
    if (typeof ctx.setPagesEditorStatus === "function") {
      ctx.setPagesEditorStatus(message || "Draft local de Pages actualizado.");
    }
  }

  function getFieldValue(homeDraft, field) {
    var value = getByPath(homeDraft, field.path);
    if (field.type === "array") {
      return normalizeStringArray(value, []).join("\n");
    }
    return normalizeText(value);
  }

  function renderField(homeDraft, field) {
    var rows = Number(field.rows);
    var value = getFieldValue(homeDraft, field);
    var placeholder = normalizeText(field.placeholder);
    var isTextArea = field.type === "textarea" || field.type === "array";
    var fieldAttributes = isTextArea
      ? 'data-pages-field-path="' + escapeHtml(field.path) + '" data-pages-field-type="' + escapeHtml(field.type || "textarea") + '" rows="' + escapeHtml(rows > 0 ? rows : 2) + '"'
      : 'data-pages-field-path="' + escapeHtml(field.path) + '" data-pages-field-type="text"';

    if (isTextArea) {
      return ''
        + '<label class="field">'
        + '  <span>' + escapeHtml(field.label) + '</span>'
        + '  <textarea ' + fieldAttributes + (placeholder ? ' placeholder="' + escapeHtml(placeholder) + '"' : "") + '>' + escapeHtml(value) + '</textarea>'
        + '</label>';
    }

    return ''
      + '<label class="field">'
      + '  <span>' + escapeHtml(field.label) + '</span>'
      + '  <input type="text" ' + fieldAttributes + (placeholder ? ' placeholder="' + escapeHtml(placeholder) + '"' : "") + ' value="' + escapeHtml(value) + '">'
      + '</label>';
  }

  function renderBlocks(homeDraft, blocks) {
    return blocks.map(function (block) {
      var fieldsHtml = (Array.isArray(block.fields) ? block.fields : []).map(function (field) {
        return renderField(homeDraft, field);
      }).join("");

      return ''
        + '<div class="traits-panel-section">'
        + '  <header class="traits-panel-section__header">'
        + '    <h4>' + escapeHtml(block.title) + '</h4>'
        + '    <p>' + escapeHtml(block.description || "") + '</p>'
        + '  </header>'
        + fieldsHtml
        + '</div>';
    }).join("");
  }

  function renderMenuSection(ctx, section) {
    var copy = getSectionCopy(section.id);
    var homeDraft = ensurePagesDraftShape(ctx);
    return ''
      + '<section class="categories-section card" id="' + escapeHtml(getSectionAnchorId(section.id)) + '" tabindex="-1" data-pages-anchor="true" data-pages-section-id="' + escapeHtml(section.id) + '">'
      + '  <header class="categories-section__header">'
      + '    <div class="categories-section__title-wrap">'
      + '      <h3>' + escapeHtml(section.label) + '</h3>'
      + '      <p class="inline-help">' + escapeHtml(copy.description) + '</p>'
      + '    </div>'
      + '  </header>'
      + renderBlocks(homeDraft, MENU_BLOCKS)
      + '  <p class="inline-help">Owner global: <code>home.menu_page.*</code>.</p>'
      + '</section>';
  }

  function renderEditorialSection(ctx, section) {
    var copy = getSectionCopy(section.id);
    var homeDraft = ensurePagesDraftShape(ctx);
    return ''
      + '<section class="categories-section card" id="' + escapeHtml(getSectionAnchorId(section.id)) + '" tabindex="-1" data-pages-anchor="true" data-pages-section-id="' + escapeHtml(section.id) + '">'
      + '  <header class="categories-section__header">'
      + '    <div class="categories-section__title-wrap">'
      + '      <h3>' + escapeHtml(section.label) + '</h3>'
      + '      <p class="inline-help">' + escapeHtml(copy.description) + '</p>'
      + '    </div>'
      + '  </header>'
      + renderBlocks(homeDraft, EDITORIAL_BLOCKS)
      + '  <p class="inline-help">'
      + '    Owner global principal: <code>home.menu_detail_editorial.*</code>.'
      + ' Compat temporal: <code>home.menu_detail_editorial.sensory_subtitle</code>.'
      + '  </p>'
      + '</section>';
  }

  function renderPlaceholderSection(section) {
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
      + '    <h4 class="pages-placeholder__title">Edici\u00f3n fuera de alcance en esta fase</h4>'
      + '    <p class="home-editor__hint">' + escapeHtml(copy.title) + '.</p>'
      + '  </div>'
      + '</section>';
  }

  function renderSection(ctx, section) {
    if (section && section.id === "menu") {
      return renderMenuSection(ctx, section);
    }
    if (section && section.id === "editorial") {
      return renderEditorialSection(ctx, section);
    }
    return renderPlaceholderSection(section);
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
    ensurePagesDraftShape(ctx);

    var sectionsHtml = SECTION_DEFINITIONS.map(function (section) {
      return renderSection(ctx, section);
    }).join("");
    panel.innerHTML = ''
      + '<div class="home-editor__header">'
      + '  <div>'
      + '    <p class="kicker">Pages</p>'
      + '    <h2>P\u00e1ginas \u00fanicas del sitio</h2>'
      + '    <p class="home-editor__subtitle">Configuraci\u00f3n global de copys estructurales por p\u00e1gina (sin incluir HomePage).</p>'
      + '  </div>'
      + '  <div class="home-editor__actions">'
      + '    <button class="btn btn-primary" type="button" data-pages-action="save">Guardar</button>'
      + '    <button class="btn btn-ghost" type="button" data-pages-action="export-json">Exportar JSON</button>'
      + '    <button id="pages-publish-preview-button" class="btn btn-primary" type="button" data-pages-action="publish-preview">Publish Preview</button>'
      + '    <button id="pages-publish-production-button" class="btn btn-ghost" type="button" data-pages-action="publish-production">Publish Production</button>'
      + '  </div>'
      + '</div>'
      + '<p id="pages-editor-status" class="data-status" role="status" aria-live="polite">Edita aqu\u00ed los copys globales compartidos por secciones del sitio.</p>'
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

  function parseArrayField(value) {
    return String(value || "")
      .split(/\n|,/)
      .map(function (entry) {
        return normalizeText(entry);
      })
      .filter(Boolean);
  }

  function updateFieldFromInput(ctx, inputNode) {
    if (!inputNode) return;
    var path = normalizeText(inputNode.getAttribute("data-pages-field-path"));
    if (!path) return;
    var type = normalizeText(inputNode.getAttribute("data-pages-field-type")).toLowerCase();

    var homeDraft = ensurePagesDraftShape(ctx);
    if (!isPlainObject(homeDraft)) {
      return;
    }

    if (type === "array") {
      setByPath(homeDraft, path, parseArrayField(inputNode.value));
    } else {
      setByPath(homeDraft, path, normalizeText(inputNode.value));
    }

    if (path === "menu_detail_editorial.sensory.subtitle" || path === "menu_detail_editorial.sensory_subtitle") {
      syncSensorySubtitleCompatibility(homeDraft);
    }

    persistPagesDraft(ctx, "Pages actualizado en borrador local.");
  }

  function bindPagesEditorEvents(ctx) {
    var panel = ctx.views.pagesEditorPanel;
    if (!panel || panel.getAttribute("data-pages-panel-bound") === "true") {
      return;
    }

    panel.setAttribute("data-pages-panel-bound", "true");

    panel.addEventListener("click", function (event) {
      var actionButton = event.target.closest("[data-pages-action]");
      if (!actionButton) return;
      var action = normalizeText(actionButton.getAttribute("data-pages-action")).toLowerCase();
      if (!action) return;

      if (action === "save") {
        ensurePagesDraftShape(ctx);
        persistPagesDraft(ctx, "Pages guardado en drafts.");
        if (typeof ctx.saveDraftsToLocalFiles === "function") {
          void ctx.saveDraftsToLocalFiles();
        }
        return;
      }

      if (action === "export-json") {
        ensurePagesDraftShape(ctx);
        if (typeof ctx.exportCurrentDrafts === "function") {
          ctx.exportCurrentDrafts();
          return;
        }
        persistPagesDraft(ctx, "Draft local de Pages actualizado.");
        return;
      }

      if (action === "publish-preview" || action === "publish-production") {
        ensurePagesDraftShape(ctx);
        persistPagesDraft(ctx, "Pages sincronizado antes de publicar.");
        if (typeof ctx.publishChanges === "function") {
          ctx.publishChanges(action === "publish-production" ? "production" : "preview");
        }
      }
    });

    panel.addEventListener("input", function (event) {
      var inputNode = event.target.closest("[data-pages-field-path]");
      if (!inputNode) return;
      updateFieldFromInput(ctx, inputNode);
    });

    panel.addEventListener("change", function (event) {
      var inputNode = event.target.closest("[data-pages-field-path]");
      if (!inputNode) return;
      updateFieldFromInput(ctx, inputNode);
    });

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
