// admin/app/modules/constants.js
// Extracted from admin/app/app.js — Phase 1 refactor
// All named constants, configuration maps, and default values.
// No state, no DOM, no side effects.

(function () {
  "use strict";

  var ns = window.FigataAdmin = window.FigataAdmin || {};

  ns.constants = {

    DATA_ENDPOINTS: {
      menu: "/data/menu.json",
      categories: "/data/categories.json",
      ingredients: "/data/ingredients.json",
      availability: "/data/availability.json",
      home: "/data/home.json",
      restaurant: "/data/restaurant.json",
      media: "/data/media.json"
    },

    SIDEBAR_COLLAPSE_KEY: "figata_admin_sidebar_collapsed",
    MENU_PLACEHOLDER_IMAGE: "assets/menu/placeholders/card.svg",
    MENU_MEDIA_ROOT: "assets/menu",
    LOCAL_MEDIA_OPTIONS_ENDPOINT: "/__local/menu-media-paths",
    LOCAL_DRAFTS_MENU_KEY: "figata_admin_drafts_menu",
    LOCAL_DRAFTS_AVAILABILITY_KEY: "figata_admin_drafts_availability",
    LOCAL_DRAFTS_HOME_KEY: "figata_admin_drafts_home",
    LOCAL_DRAFTS_INGREDIENTS_KEY: "figata_admin_drafts_ingredients",
    LOCAL_DRAFTS_CATEGORIES_KEY: "figata_admin_drafts_categories",
    LOCAL_DRAFTS_FLAG_KEY: "figata_admin_has_drafts",
    LOCAL_SAVE_DRAFTS_ENDPOINT: "/__local/save-drafts",
    MENU_MODAL_PLACEHOLDER_IMAGE: "assets/menu/placeholders/modal.svg",
    DEV_AUTH_BYPASS_KEY: "figata_admin_dev_auth_bypass",

    UX_TIMING: {
      accordionSwitchDelayMs: 260,
      accordionOpenDelayMs: 120,
      accordionStaggerStepMs: 40,
      accordionStaggerBaseMs: 170,
      accordionSettleBufferMs: 70,
      panelFadeOutDelayMs: 88,
      panelFadeInCleanupDelayMs: 176,
      indicatorSettleMs: 280,
      indicatorOpacityMs: 180,
      anchorScrollOffsetPx: 96,
      scrollSpyThresholdPx: 154,
      programmaticScrollLockMs: 460,
      programmaticScrollUnlockBufferMs: 24
    },

    DEBUG_NAVIGATION: false,

    NAVIGATION_STATES: {
      idle: "idle",
      switchingPanel: "switchingPanel",
      closingAccordion: "closingAccordion",
      openingAccordion: "openingAccordion",
      scrollingToAnchor: "scrollingToAnchor",
      syncingScrollSpy: "syncingScrollSpy"
    },

    NAVIGATION_STATE_GRAPH: {
      idle: ["idle", "switchingPanel", "scrollingToAnchor", "syncingScrollSpy"],
      switchingPanel: ["switchingPanel", "closingAccordion", "openingAccordion", "scrollingToAnchor", "syncingScrollSpy", "idle"],
      closingAccordion: ["closingAccordion", "openingAccordion", "switchingPanel", "scrollingToAnchor", "syncingScrollSpy", "idle"],
      openingAccordion: ["openingAccordion", "switchingPanel", "scrollingToAnchor", "syncingScrollSpy", "idle"],
      scrollingToAnchor: ["scrollingToAnchor", "syncingScrollSpy", "switchingPanel", "idle"],
      syncingScrollSpy: ["syncingScrollSpy", "idle", "switchingPanel", "scrollingToAnchor"]
    },

    HOME_FEATURED_LIMIT: 8,
    HOME_ANNOUNCEMENT_TYPES: ["highlight", "warning", "info"],
    HOME_DEFAULT_NAVBAR_LINKS: [
      { label: "Menu", url: "#menu" },
      { label: "Nosotros", url: "#nosotros" },
      { label: "Ubicacion", url: "#ubicacion" },
      { label: "Contacto", url: "#contacto" }
    ],
    HOME_DEFAULT_NAVBAR_ICON: "assets/svg-icons/whatsapp.svg",
    HOME_TESTIMONIALS_LIMIT: 9,
    HOME_FOOTER_COLUMNS_COUNT: 3,
    HOME_FOOTER_LINKS_LIMIT: 8,
    HOME_FOOTER_SOCIAL_KEYS: ["instagram", "tiktok", "tripadvisor"],
    HOME_DELIVERY_ICON_MIN_SIZE: 16,
    HOME_DELIVERY_ICON_MAX_SIZE: 64,
    HOME_DELIVERY_PLATFORM_KEYS: ["pedidosya", "ubereats", "takeout", "whatsapp"],

    HOME_DELIVERY_DEFAULTS: {
      pedidosya: {
        url: "#",
        icon: "assets/svg-icons/pedidosya.svg",
        iconSize: 40
      },
      ubereats: {
        url: "#",
        icon: "assets/svg-icons/uber-eats.svg",
        iconSize: 32
      },
      takeout: {
        url: "",
        icon: "assets/svg-icons/menu-icon.svg",
        iconSize: 26
      },
      whatsapp: {
        url: "",
        icon: "assets/svg-icons/whatsapp.svg",
        iconSize: 26
      }
    },

    HOME_TESTIMONIALS_DEFAULT_ITEMS: [
      {
        name: "Awilda Suero",
        role: "Local Guide",
        text: "We ordered for delivery, it was 10 out of 10. Great ingredients and real Neapolitan pizza from wood oven.",
        stars: 5
      },
      {
        name: "Fabio Reyes",
        role: "Cliente frecuente",
        text: "Sus pizzas son excelentes, hechas con ingredientes de alta calidad y con muy buen ambiente en el local.",
        stars: 5
      },
      {
        name: "Karla Villar",
        role: "Food lover",
        text: "La pizza artesanal es excelente. Si te gusta probar cervezas diferentes, este lugar vale la pena.",
        stars: 4
      },
      {
        name: "Liecel Franco",
        role: "Cliente",
        text: "Tienen una variedad deliciosa de pizza, muy buen cafe y cocteles. Siempre regresamos.",
        stars: 5
      },
      {
        name: "Prysla Rodriguez",
        role: "Local Guide",
        text: "La mejor pizza napolitana que he probado. Textura, sabor y servicio, todo excelente.",
        stars: 5
      },
      {
        name: "Angel Tejeda Pina",
        role: "Cliente",
        text: "Desde que abres la puerta el olor a pizza te gana. Servicio excelente y pizzas espectaculares.",
        stars: 5
      },
      {
        name: "Massiel Beltre",
        role: "Cliente frecuente",
        text: "Mi restaurante favorito en Santo Domingo Este. Buenisimas pizzas, excelente servicio y ambiente.",
        stars: 5
      },
      {
        name: "Vianneris Morillo",
        role: "Foodie",
        text: "Cocteles riquisimos, pizzas llenas de sabor y un tiramisu increible. Muy recomendado.",
        stars: 5
      },
      {
        name: "Ricardo Restituyo",
        role: "Local Guide",
        text: "Great pizzas, very good value and attentive staff. Sweet Goat and Figata are must-tries.",
        stars: 5
      }
    ],

    HOME_FOOTER_DEFAULT_COLUMNS: [
      {
        title: "Empresa",
        links: [
          { label: "Menu", url: "#menu" },
          { label: "Nosotros", url: "#nosotros" },
          { label: "FAQs", url: "#faqs" },
          { label: "Eventos", url: "#eventos" }
        ]
      },
      {
        title: "Socials",
        links: [
          { label: "Instagram", url: "" },
          { label: "TikTok", url: "" },
          { label: "Trip Advisor", url: "" }
        ]
      },
      {
        title: "Contactanos",
        links: []
      }
    ],

    HOME_FOOTER_DEFAULT_CTA: {
      label: "Como llegar",
      url: "#ubicacion"
    },

    HOME_FOOTER_DEFAULT_SOCIALS: {
      instagram: "",
      tiktok: "",
      tripadvisor: ""
    },

    HOME_EDITOR_SECTIONS: [
      {
        id: "navbar",
        label: "Navbar",
        description: "Links de navegacion y boton derecho del navbar."
      },
      {
        id: "hero",
        label: "Hero",
        description: "Titulo principal, subtitulo, imagen y CTAs del hero."
      },
      {
        id: "featured",
        label: "Featured",
        description: "Seccion Las mas pedidas y orden de featuredIds (max 8)."
      },
      {
        id: "delivery",
        label: "Delivery",
        description: "Copy, links e iconos (path + size) de plataformas de delivery y takeout."
      },
      {
        id: "testimonials",
        label: "Testimonials",
        description: "Titulo/subtitulo y cards editables del bloque testimonials (3x3)."
      },
      {
        id: "events",
        label: "Eventos",
        description: "Tabs de eventos, textos y lista de items."
      },
      {
        id: "footer",
        label: "Footer",
        description: "Titulos/links del footer, CTA marron y URLs de redes sociales."
      },
      {
        id: "announcements",
        label: "Announcements",
        description: "Aviso superior del home y su tipo visual."
      }
    ],

    INGREDIENT_CATEGORY_DEFINITIONS: [
      { id: "lacteos_quesos", label: "Lácteos / Quesos" },
      { id: "tomates", label: "Tomates" },
      { id: "hierbas", label: "Hierbas" },
      { id: "aceites_salsas", label: "Aceites y Salsas" },
      { id: "vegetales_base", label: "Vegetales Base" },
      { id: "hongos", label: "Hongos" },
      { id: "carnes_embutidos", label: "Carnes / Embutidos" },
      { id: "mar_pescado", label: "Mar / Pescado" },
      { id: "encurtidos_salmuera", label: "Encurtidos / Salmuera" },
      { id: "dulces", label: "Dulces" },
      { id: "frutos_secos", label: "Frutos Secos" },
      { id: "otros", label: "Otros" }
    ],

    INGREDIENT_ISSUE_ICON_SVG:
      '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3" aria-hidden="true" focusable="false">' +
      '<path d="M508.5-291.5Q520-303 520-320t-11.5-28.5Q497-360 480-360t-28.5 11.5Q440-337 440-320t11.5 28.5Q463-280 480-280t28.5-11.5ZM440-440h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>' +
      "</svg>",

    INGREDIENT_NAV_BADGE_ICON_SVG:
      '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" aria-hidden="true" focusable="false">' +
      '<path d="M640-80q-100 0-170-70t-70-170q0-100 70-170t170-70q100 0 170 70t70 170q0 100-70 170T640-80Zm0-80q66 0 113-47t47-113q0-66-47-113t-113-47q-66 0-113 47t-47 113q0 66 47 113t113 47Zm-480 0q-33 0-56.5-23.5T80-240v-304q0-8 1.5-16t4.5-16l80-184h-6q-17 0-28.5-11.5T120-800v-40q0-17 11.5-28.5T160-880h280q17 0 28.5 11.5T480-840v40q0 17-11.5 28.5T440-760h-6l66 152q-19 10-36 21t-32 25l-84-198h-96l-92 216v304h170q5 21 13.5 41.5T364-160H160Zm480-440q-42 0-71-29t-29-71q0-42 29-71t71-29v200q0-42 29-71t71-29q42 0 71 29t29 71H640Z"/>' +
      "</svg>",

    INGREDIENT_CATEGORY_BY_ID: {
      burrata_fresca: "lacteos_quesos",
      fior_di_latte: "lacteos_quesos",
      gorgonzola: "lacteos_quesos",
      mozzarella: "lacteos_quesos",
      parmigiano_reggiano: "lacteos_quesos",
      pecorino: "lacteos_quesos",
      pecorino_trufado: "lacteos_quesos",
      provola: "lacteos_quesos",
      queso_de_cabra: "lacteos_quesos",
      quesos_tagliere: "lacteos_quesos",
      ricotta: "lacteos_quesos",
      stracciatella: "lacteos_quesos",
      pomodoro: "tomates",
      salsa_de_tomate: "tomates",
      san_marzano_dop: "tomates",
      tomate_cherry: "tomates",
      albahaca: "hierbas",
      menta: "hierbas",
      oregano: "hierbas",
      romero: "hierbas",
      rucula: "hierbas",
      aceite_de_oliva_evoo: "aceites_salsas",
      crema_de_trufa: "aceites_salsas",
      pesto_de_albahaca: "aceites_salsas",
      pesto_de_pistacho: "aceites_salsas",
      pesto_de_rucula: "aceites_salsas",
      ajo: "vegetales_base",
      berenjena: "vegetales_base",
      cebolla: "vegetales_base",
      chili_flakes: "vegetales_base",
      peperoncino: "vegetales_base",
      porcini: "hongos",
      bacon: "carnes_embutidos",
      bresaola: "carnes_embutidos",
      mortadella: "carnes_embutidos",
      nduja: "carnes_embutidos",
      pancetta: "carnes_embutidos",
      prosciutto_di_parma: "carnes_embutidos",
      salamino_piccante: "carnes_embutidos",
      salsiccia: "carnes_embutidos",
      soppressata: "carnes_embutidos",
      atun: "mar_pescado",
      aceitunas: "encurtidos_salmuera",
      alcaparras: "encurtidos_salmuera",
      mermelada_de_tomate: "dulces",
      miel: "dulces",
      pistachos: "frutos_secos"
    },

    INGREDIENT_CATEGORY_BY_ICON: {
      aceituna: "encurtidos_salmuera",
      ajo: "vegetales_base",
      albahaca: "hierbas",
      alcaparra: "encurtidos_salmuera",
      bacon: "carnes_embutidos",
      berenjena: "vegetales_base",
      burrata: "lacteos_quesos",
      cebolla: "vegetales_base",
      chile: "vegetales_base",
      hongo: "hongos",
      jamon_curado: "carnes_embutidos",
      menta: "hierbas",
      mermelada: "dulces",
      miel: "dulces",
      oliva: "aceites_salsas",
      oregano: "hierbas",
      pancetta: "carnes_embutidos",
      pescado: "mar_pescado",
      pesto: "aceites_salsas",
      pistacho: "frutos_secos",
      queso: "lacteos_quesos",
      romero: "hierbas",
      rucula: "hierbas",
      salami: "carnes_embutidos",
      salchicha: "carnes_embutidos",
      san_marzano: "tomates",
      stracciatella: "lacteos_quesos",
      tomate: "tomates",
      tomate_cherry: "tomates",
      trufa: "aceites_salsas"
    },

    INGREDIENT_CATEGORY_KEYWORDS: [
      {
        categoryId: "lacteos_quesos",
        keywords: ["queso", "mozzarella", "ricotta", "burrata", "gorgonzola", "pecorino", "fior", "stracciatella", "parmigiano", "provola", "lacteo", "milk"]
      },
      {
        categoryId: "tomates",
        keywords: ["tomate", "pomodoro", "san_marzano", "marzano"]
      },
      {
        categoryId: "hierbas",
        keywords: ["albahaca", "oregano", "romero", "menta", "rucula", "herb", "basil"]
      },
      {
        categoryId: "aceites_salsas",
        keywords: ["aceite", "evoo", "pesto", "salsa", "crema", "trufa", "olio"]
      },
      {
        categoryId: "vegetales_base",
        keywords: ["ajo", "cebolla", "berenjena", "peperoncino", "chili", "chile", "vegetal"]
      },
      {
        categoryId: "hongos",
        keywords: ["hongo", "porcini", "fungi", "mushroom"]
      },
      {
        categoryId: "carnes_embutidos",
        keywords: ["bacon", "prosciutto", "salami", "soppressata", "mortadella", "pancetta", "salsiccia", "bresaola", "nduja", "jamon", "carne", "embutido"]
      },
      {
        categoryId: "mar_pescado",
        keywords: ["atun", "pescado", "mar", "fish", "tonno"]
      },
      {
        categoryId: "encurtidos_salmuera",
        keywords: ["aceituna", "alcaparra", "encurtido", "salmuera", "olive", "caper"]
      },
      {
        categoryId: "dulces",
        keywords: ["miel", "mermelada", "dulce", "sweet", "honey", "jam"]
      },
      {
        categoryId: "frutos_secos",
        keywords: ["pistacho", "fruto_seco", "nuts", "almendra", "nuez", "avellana"]
      }
    ]

  };
})();
