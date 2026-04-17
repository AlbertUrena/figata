// admin/app/modules/dashboard.js
// Dashboard metrics display, panel opener, operative analytics surface, and AI analyst chat.

(function () {
  "use strict";

  var ns = window.FigataAdmin = window.FigataAdmin || {};
  var constants = ns.constants || {};
  var DEFAULT_AI_SUGGESTIONS = [
    "Que cambio esta semana?",
    "Compara QR vs Instagram en intencion de compra.",
    "Que platos tienen alta curiosidad y baja compra?",
    "Que me deberia preocupar hoy?",
    "Que haria para mejorar add to cart esta semana?",
  ];

  var analyticsRuntime = {
    isBound: false,
    isLoading: false,
    requestToken: 0,
    hasLoadedOnce: false,
    ai: {
      isLoading: false,
      requestToken: 0,
      previousResponseId: "",
      thread: [],
      suggestedQuestions: DEFAULT_AI_SUGGESTIONS.slice(),
      provider: "mock",
      scope: "auto"
    }
  };
  var dummyDashboardRuntime = {
    isBound: false
  };
  var DUMMY_USERS_OVERVIEW = {
    overview: {
      liveValue: "26",
      liveLabel: "Live users",
      liveMeta: "1.0 min ago",
      uniqueValue: "14,728",
      uniqueLabel: "Unique users",
      uniqueMeta: "",
      newLabel: "Sessions with new users",
      newPercent: "69.51%",
      newCount: "10,993",
      returningLabel: "Sessions with returning users",
      returningPercent: "30.49%",
      returningCount: "4,823",
      topSessions: "8 sessions",
      topCountry: "Italy",
      topDevice: "PC",
      topCta: "View visitor profile"
    },
    "all-users": {
      liveValue: "14,728",
      liveLabel: "All users",
      liveMeta: "Visited in selected range",
      uniqueValue: "4.71",
      uniqueLabel: "Sessions per user",
      uniqueMeta: "Average repeat cadence",
      newLabel: "Users with 1 session",
      newPercent: "61.20%",
      newCount: "9,011",
      returningLabel: "Users with 2+ sessions",
      returningPercent: "38.80%",
      returningCount: "5,717",
      topSessions: "14 sessions",
      topCountry: "United States",
      topDevice: "Mobile",
      topCta: "Open visitor profile"
    },
    intent: {
      liveValue: "31%",
      liveLabel: "High intent users",
      liveMeta: "Strong engagement signals",
      uniqueValue: "47%",
      uniqueLabel: "Medium intent users",
      uniqueMeta: "Warm but not committed",
      newLabel: "High intent sessions",
      newPercent: "31.00%",
      newCount: "4,901",
      returningLabel: "Low intent sessions",
      returningPercent: "69.00%",
      returningCount: "10,909",
      topSessions: "11 sessions",
      topCountry: "Canada",
      topDevice: "Desktop",
      topCta: "Inspect intent profile"
    }
  };

  function normalizeText(value, fallback) {
    if (typeof value !== "string") {
      return typeof fallback === "string" ? fallback : "";
    }

    var trimmed = value.trim();
    return trimmed || (typeof fallback === "string" ? fallback : "");
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function toNumber(value, fallback) {
    var numericValue = Number(value);
    if (Number.isFinite(numericValue)) {
      return numericValue;
    }
    return Number.isFinite(fallback) ? fallback : 0;
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("es-DO", { maximumFractionDigits: 1 }).format(toNumber(value));
  }

  function formatPercent(value) {
    return new Intl.NumberFormat("es-DO", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(toNumber(value));
  }

  function formatMilliseconds(value) {
    var numericValue = toNumber(value);
    if (!numericValue) {
      return "0 ms";
    }
    return new Intl.NumberFormat("es-DO", { maximumFractionDigits: 0 }).format(numericValue) + " ms";
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
      maximumFractionDigits: 0
    }).format(toNumber(value));
  }

  function getMetric(metricMap, metricId) {
    if (!metricMap || typeof metricMap !== "object") {
      return { value: 0 };
    }
    return metricMap[metricId] || { value: 0 };
  }

  function buildTableHtml(headers, rows, emptyCopy) {
    if (!rows.length) {
      return '<p class="analytics-table__empty">' + escapeHtml(emptyCopy || "Sin datos para esta combinacion de filtros.") + "</p>";
    }

    return [
      '<table class="analytics-table">',
      "<thead><tr>",
      headers.map(function (header) {
        return "<th>" + escapeHtml(header) + "</th>";
      }).join(""),
      "</tr></thead>",
      "<tbody>",
      rows.map(function (cells) {
        return "<tr>" + cells.map(function (cell) {
          return "<td>" + cell + "</td>";
        }).join("") + "</tr>";
      }).join(""),
      "</tbody>",
      "</table>"
    ].join("");
  }

  function bindDummyDashboardTabs(ctx) {
    if (dummyDashboardRuntime.isBound) {
      return;
    }

    var panel = ctx.views && ctx.views.dashboardPanel ? ctx.views.dashboardPanel : null;
    if (!panel) {
      return;
    }

    var tabs = Array.prototype.slice.call(panel.querySelectorAll("[data-dashboard-users-tab]"));
    if (!tabs.length) {
      return;
    }

    var liveValue = panel.querySelector("[data-dashboard-users-live-value]");
    var liveLabel = panel.querySelector("[data-dashboard-users-live-label]");
    var liveMeta = panel.querySelector("[data-dashboard-users-live-meta]");
    var uniqueValue = panel.querySelector("[data-dashboard-users-unique-value]");
    var uniqueLabel = panel.querySelector("[data-dashboard-users-unique-label]");
    var uniqueMeta = panel.querySelector("[data-dashboard-users-unique-meta]");
    var newLabel = panel.querySelector("[data-dashboard-users-new-label]");
    var newPercent = panel.querySelector("[data-dashboard-users-new-percent]");
    var newCount = panel.querySelector("[data-dashboard-users-new-count]");
    var newSegment = panel.querySelector("[data-dashboard-users-new-segment]");
    var returningLabel = panel.querySelector("[data-dashboard-users-returning-label]");
    var returningPercent = panel.querySelector("[data-dashboard-users-returning-percent]");
    var returningCount = panel.querySelector("[data-dashboard-users-returning-count]");
    var returningSegment = panel.querySelector("[data-dashboard-users-returning-segment]");
    var topSessions = panel.querySelector("[data-dashboard-users-top-sessions]");
    var topCountry = panel.querySelector("[data-dashboard-users-top-country]");
    var topDevice = panel.querySelector("[data-dashboard-users-top-device]");
    var topCta = panel.querySelector("[data-dashboard-users-top-cta]");

    function applyDummyUsersTab(tabKey) {
      var payload = DUMMY_USERS_OVERVIEW[tabKey] || DUMMY_USERS_OVERVIEW.overview;

      tabs.forEach(function (tab) {
        var isActive = tab.getAttribute("data-dashboard-users-tab") === tabKey;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      if (liveValue) liveValue.textContent = payload.liveValue;
      if (liveLabel) liveLabel.textContent = payload.liveLabel;
      if (liveMeta) liveMeta.textContent = payload.liveMeta;
      if (uniqueValue) uniqueValue.textContent = payload.uniqueValue;
      if (uniqueLabel) uniqueLabel.textContent = payload.uniqueLabel;
      if (uniqueMeta) uniqueMeta.textContent = payload.uniqueMeta;
      if (newLabel) newLabel.textContent = payload.newLabel;
      if (newPercent) newPercent.textContent = payload.newPercent;
      if (newCount) newCount.textContent = payload.newCount;
      if (returningLabel) returningLabel.textContent = payload.returningLabel;
      if (returningPercent) returningPercent.textContent = payload.returningPercent;
      if (returningCount) returningCount.textContent = payload.returningCount;
      if (topSessions) topSessions.textContent = payload.topSessions;
      if (topCountry) topCountry.textContent = payload.topCountry;
      if (topDevice) topDevice.textContent = payload.topDevice;
      if (topCta) topCta.textContent = payload.topCta;

      if (newSegment) {
        newSegment.style.width = payload.newPercent;
      }
      if (returningSegment) {
        returningSegment.style.width = payload.returningPercent;
      }
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        applyDummyUsersTab(tab.getAttribute("data-dashboard-users-tab"));
      });
    });

    applyDummyUsersTab("overview");
    dummyDashboardRuntime.isBound = true;
  }

  function getAnalyticsNodes(ctx) {
    var panel = ctx.views && ctx.views.dashboardPanel ? ctx.views.dashboardPanel : null;
    if (!panel) {
      return null;
    }

    return {
      panel: panel,
      form: panel.querySelector("#analytics-filters-form"),
      fromInput: panel.querySelector("#analytics-filter-from"),
      toInput: panel.querySelector("#analytics-filter-to"),
      channelSelect: panel.querySelector("#analytics-filter-channel"),
      deviceSelect: panel.querySelector("#analytics-filter-device"),
      includeInternalToggle: panel.querySelector("#analytics-include-internal-toggle"),
      status: panel.querySelector("#analytics-status"),
      scopePill: panel.querySelector("#analytics-scope-pill"),
      emptyState: panel.querySelector("#analytics-empty-state"),
      hero: panel.querySelector("#analytics-hero"),
      checklist: panel.querySelector("#analytics-critical-checklist"),
      acquisition: panel.querySelector("#analytics-acquisition"),
      funnel: panel.querySelector("#analytics-funnel"),
      topItems: panel.querySelector("#analytics-top-items"),
      ctas: panel.querySelector("#analytics-ctas"),
      routes: panel.querySelector("#analytics-routes"),
      v2Cohorts: panel.querySelector("#analytics-v2-cohorts"),
      v2Retention: panel.querySelector("#analytics-v2-retention"),
      v2Timing: panel.querySelector("#analytics-v2-timing"),
      v2Network: panel.querySelector("#analytics-v2-network"),
      v2Curiosity: panel.querySelector("#analytics-v2-curiosity"),
      aiPill: panel.querySelector("#analytics-ai-pill"),
      aiSuggested: panel.querySelector("#analytics-ai-suggested"),
      aiThread: panel.querySelector("#analytics-ai-thread"),
      aiForm: panel.querySelector("#analytics-ai-form"),
      aiMode: panel.querySelector("#analytics-ai-mode"),
      aiScope: panel.querySelector("#analytics-ai-scope"),
      aiQuestion: panel.querySelector("#analytics-ai-question"),
      aiStatus: panel.querySelector("#analytics-ai-status"),
      aiSubmit: panel.querySelector("#analytics-ai-submit")
    };
  }

  function getSelectedFilters(nodes) {
    return {
      from: nodes && nodes.fromInput ? normalizeText(nodes.fromInput.value) : "",
      to: nodes && nodes.toInput ? normalizeText(nodes.toInput.value) : "",
      channel: nodes && nodes.channelSelect ? normalizeText(nodes.channelSelect.value, "all") : "all",
      includeInternal: Boolean(
        nodes &&
        nodes.includeInternalToggle &&
        nodes.includeInternalToggle.getAttribute("aria-pressed") === "true"
      )
    };
  }

  function syncScopeToggleLabel(nodes) {
    if (!nodes || !nodes.includeInternalToggle) {
      return;
    }

    var includeInternal = nodes.includeInternalToggle.getAttribute("aria-pressed") === "true";
    nodes.includeInternalToggle.textContent = includeInternal
      ? "Incluyendo trafico interno / QA"
      : "Excluir trafico interno";
  }

  function setAnalyticsStatus(nodes, text, tone) {
    if (!nodes || !nodes.status) {
      return;
    }

    nodes.status.textContent = text;
    nodes.status.classList.toggle("is-error", tone === "error");
  }

  function setScopePill(nodes, snapshot) {
    if (!nodes || !nodes.scopePill) {
      return;
    }

    var scopeMode = snapshot && snapshot.scope ? normalizeText(snapshot.scope.mode, "all_traffic") : "all_traffic";
    nodes.scopePill.textContent = scopeMode === "business_only"
      ? "Business only"
      : "Incluye QA / interno";
  }

  function deriveChannelOptions(payload, includeInternal) {
    var sessions = payload &&
      payload.curatedSnapshot &&
      payload.curatedSnapshot.curated &&
      Array.isArray(payload.curatedSnapshot.curated.sessions_fact)
      ? payload.curatedSnapshot.curated.sessions_fact
      : [];
    var excluded = payload &&
      payload.kpiSnapshot &&
      payload.kpiSnapshot.scope &&
      Array.isArray(payload.kpiSnapshot.scope.excludedTrafficClassesForBusiness)
      ? payload.kpiSnapshot.scope.excludedTrafficClassesForBusiness
      : [];

    var unique = new Set();
    sessions.forEach(function (session) {
      var trafficClass = normalizeText(session && session.traffic_class, "unknown");
      if (!includeInternal && excluded.indexOf(trafficClass) !== -1) {
        return;
      }

      var entrySource = normalizeText(session && session.entry_source, "unknown");
      if (entrySource) {
        unique.add(entrySource);
      }
    });

    return Array.from(unique).sort();
  }

  function syncChannelOptions(nodes, payload) {
    if (!nodes || !nodes.channelSelect) {
      return;
    }

    var currentValue = normalizeText(nodes.channelSelect.value, "all");
    var filters = getSelectedFilters(nodes);
    var options = deriveChannelOptions(payload, filters.includeInternal);
    var nextOptions = ['<option value="all">Todos los canales</option>'];

    options.forEach(function (optionValue) {
      nextOptions.push(
        '<option value="' + escapeHtml(optionValue) + '">' + escapeHtml(optionValue) + "</option>"
      );
    });

    nodes.channelSelect.innerHTML = nextOptions.join("");
    if (currentValue && (currentValue === "all" || options.indexOf(currentValue) !== -1)) {
      nodes.channelSelect.value = currentValue;
    }
  }

  function renderHero(snapshot, nodes) {
    if (!nodes || !nodes.hero) {
      return;
    }

    var metrics = snapshot && snapshot.metrics ? snapshot.metrics.global : {};
    var cards = [
      {
        eyebrow: "Volumen",
        value: formatNumber(getMetric(metrics, "sessions_total").value),
        note: "Sesiones del periodo filtrado"
      },
      {
        eyebrow: "Visitantes",
        value: formatNumber(getMetric(metrics, "unique_visitors_total").value),
        note: "Personas unicas detectadas"
      },
      {
        eyebrow: "Detail → Cart",
        value: formatPercent(getMetric(metrics, "detail_to_cart_session_rate").value),
        note: "Tasa oficial de detalle a carrito"
      },
      {
        eyebrow: "Compra / sesion",
        value: formatPercent(getMetric(metrics, "purchase_session_rate").value),
        note: "Conversion general del funnel"
      },
      {
        eyebrow: "Route ready",
        value: formatMilliseconds(getMetric(metrics, "average_route_ready_ms").value),
        note: "Promedio oficial de route ready"
      },
      {
        eyebrow: "Contexto in-store",
        value: formatPercent(getMetric(metrics, "in_store_confirmation_rate").value),
        note: "Confirmacion Wi-Fi sobre sesiones QR"
      }
    ];

    nodes.hero.innerHTML = cards.map(function (card) {
      return [
        '<article class="analytics-hero-card">',
        '<p class="analytics-hero-card__eyebrow">' + escapeHtml(card.eyebrow) + "</p>",
        '<p class="analytics-hero-card__value">' + escapeHtml(card.value) + "</p>",
        '<p class="analytics-hero-card__note">' + escapeHtml(card.note) + "</p>",
        "</article>"
      ].join("");
    }).join("");
  }

  function renderChecklist(snapshot, nodes, filters) {
    if (!nodes || !nodes.checklist) {
      return;
    }

    var metrics = snapshot && snapshot.metrics ? snapshot.metrics.global : {};
    var checks = [
      "Sesiones visibles arriba: " + formatNumber(getMetric(metrics, "sessions_total").value),
      "Compra por sesion: " + formatPercent(getMetric(metrics, "purchase_session_rate").value),
      "Checkout a compra: " + formatPercent(getMetric(metrics, "checkout_to_purchase_session_rate").value),
      "Route ready promedio: " + formatMilliseconds(getMetric(metrics, "average_route_ready_ms").value),
      filters && filters.includeInternal
        ? "La vista incluye trafico interno / QA para validacion local."
        : "La vista excluye trafico interno por defecto."
    ];

    nodes.checklist.innerHTML = [
      '<p class="analytics-checklist__title">Checklist en primera pantalla</p>',
      '<ul class="analytics-checklist__list">',
      checks.map(function (check) {
        return "<li>" + escapeHtml(check) + "</li>";
      }).join(""),
      "</ul>"
    ].join("");
  }

  function renderAcquisition(snapshot, nodes) {
    if (!nodes || !nodes.acquisition) {
      return;
    }

    var values = snapshot &&
      snapshot.metrics &&
      snapshot.metrics.bySegment &&
      snapshot.metrics.bySegment.entry_source &&
      snapshot.metrics.bySegment.entry_source.values
      ? snapshot.metrics.bySegment.entry_source.values
      : {};

    var rows = Object.keys(values)
      .sort(function (left, right) {
        return toNumber(getMetric(values[right], "sessions_total").value) - toNumber(getMetric(values[left], "sessions_total").value);
      })
      .map(function (entrySource) {
        var metrics = values[entrySource];
        return [
          '<span class="analytics-table__strong">' + escapeHtml(entrySource) + "</span>",
          escapeHtml(formatNumber(getMetric(metrics, "sessions_total").value)),
          escapeHtml(formatPercent(getMetric(metrics, "purchase_session_rate").value)),
          escapeHtml(formatPercent(getMetric(metrics, "cta_engagement_rate").value)),
          escapeHtml(formatMilliseconds(getMetric(metrics, "average_route_ready_ms").value))
        ];
      });

    nodes.acquisition.innerHTML = [
      '<p class="analytics-section__title">Adquisicion por canal</p>',
      '<p class="analytics-section__meta">Responde de donde viene el trafico y que tanto convierte o activa CTAs por source.</p>',
      buildTableHtml(
        ["Canal", "Sesiones", "Compra/sesion", "CTA/sesion", "Route ready"],
        rows,
        "No hay canales para el filtro actual."
      )
    ].join("");
  }

  function renderFunnel(snapshot, nodes) {
    if (!nodes || !nodes.funnel) {
      return;
    }

    var metrics = snapshot && snapshot.metrics ? snapshot.metrics.global : {};
    var stages = [
      {
        label: "Impresiones",
        value: formatNumber(getMetric(metrics, "item_impression_total").value),
        subvalue: "Base de exposicion"
      },
      {
        label: "Detalle",
        value: formatNumber(getMetric(metrics, "item_detail_open_total").value),
        subvalue: formatPercent(getMetric(metrics, "detail_open_session_rate").value) + " de sesiones"
      },
      {
        label: "Add to cart",
        value: formatNumber(getMetric(metrics, "add_to_cart_total").value),
        subvalue: formatPercent(getMetric(metrics, "detail_to_cart_session_rate").value) + " detalle → carrito"
      },
      {
        label: "Checkout",
        value: formatNumber(getMetric(metrics, "begin_checkout_total").value),
        subvalue: formatPercent(getMetric(metrics, "cart_to_checkout_session_rate").value) + " carrito → checkout"
      },
      {
        label: "Compra",
        value: formatNumber(getMetric(metrics, "purchase_total").value),
        subvalue: formatPercent(getMetric(metrics, "checkout_to_purchase_session_rate").value) + " checkout → compra"
      }
    ];

    nodes.funnel.innerHTML = [
      '<p class="analytics-section__title">Funnel comercial base</p>',
      '<p class="analytics-section__meta">Todos los pasos usan formulas del catalogo KPI oficial, sin calculos locales ad-hoc.</p>',
      '<div class="analytics-stage-grid">',
      stages.map(function (stage) {
        return [
          '<article class="analytics-stage-card">',
          '<p class="analytics-stage-card__label">' + escapeHtml(stage.label) + "</p>",
          '<p class="analytics-stage-card__value">' + escapeHtml(stage.value) + "</p>",
          '<p class="analytics-stage-card__subvalue">' + escapeHtml(stage.subvalue) + "</p>",
          "</article>"
        ].join("");
      }).join(""),
      "</div>"
    ].join("");
  }

  function buildItemTable(title, rows, valueKey, valueFormatter, metaFormatter) {
    var tableRows = (rows || []).slice(0, 5).map(function (row) {
      var metaText = typeof metaFormatter === "function" ? metaFormatter(row) : "";
      return [
        '<span class="analytics-table__strong">' + escapeHtml(row.item_name || row.item_id || "item") + "</span>" +
          '<span class="analytics-table__muted">' + escapeHtml(metaText) + "</span>",
        escapeHtml(valueFormatter(row[valueKey]))
      ];
    });

    return [
      "<div>",
      '<p class="analytics-section__title">' + escapeHtml(title) + "</p>",
      buildTableHtml(["Plato", "Valor"], tableRows, "Sin platos para esta metrica."),
      "</div>"
    ].join("");
  }

  function renderTopItems(snapshot, nodes) {
    if (!nodes || !nodes.topItems) {
      return;
    }

    var rollups = snapshot && snapshot.rollups && snapshot.rollups.items
      ? snapshot.rollups.items
      : {};

    nodes.topItems.innerHTML = [
      '<p class="analytics-section__title">Top platos</p>',
      '<p class="analytics-section__meta">Top viewed / opened / added / purchased usando los rollups derivados del catalogo KPI.</p>',
      '<div class="analytics-mini-grid">',
      buildItemTable("Top viewed", rollups.by_impressions, "impressions", formatNumber, function (row) {
        return (row.category || "categoria") + " · detail rate " + formatPercent(row.detail_open_rate);
      }),
      buildItemTable("Top opened", rollups.by_detail_opens, "detail_opens", formatNumber, function (row) {
        return (row.category || "categoria") + " · add rate " + formatPercent(row.add_to_cart_rate);
      }),
      buildItemTable("Top added", rollups.by_add_to_cart, "add_to_cart", formatNumber, function (row) {
        return (row.category || "categoria") + " · detalle " + formatNumber(row.detail_opens);
      }),
      buildItemTable("Top purchased", rollups.by_purchase_units, "purchase_units", formatNumber, function (row) {
        return (row.category || "categoria") + " · valor " + formatCurrency(row.purchase_value);
      }),
      "</div>"
    ].join("");
  }

  function renderCtas(snapshot, nodes) {
    if (!nodes || !nodes.ctas) {
      return;
    }

    var ctas = snapshot && snapshot.rollups && Array.isArray(snapshot.rollups.ctas)
      ? snapshot.rollups.ctas
      : [];
    var rows = ctas.slice(0, 8).map(function (row) {
      return [
        '<span class="analytics-table__strong">' + escapeHtml(row.cta_label || row.cta_id || "CTA") + "</span>" +
          '<span class="analytics-table__muted">' + escapeHtml((row.cta_category || "general") + " · " + (row.route_name || "ruta")) + "</span>",
        escapeHtml(formatNumber(row.clicks))
      ];
    });

    nodes.ctas.innerHTML = [
      '<p class="analytics-section__title">CTAs principales</p>',
      '<p class="analytics-section__meta">Acciones principales ordenadas por clicks con su ruta de origen.</p>',
      buildTableHtml(["CTA", "Clicks"], rows, "No hay CTAs para estos filtros.")
    ].join("");
  }

  function renderRoutes(snapshot, nodes) {
    if (!nodes || !nodes.routes) {
      return;
    }

    var values = snapshot &&
      snapshot.metrics &&
      snapshot.metrics.bySegment &&
      snapshot.metrics.bySegment.route_name &&
      snapshot.metrics.bySegment.route_name.values
      ? snapshot.metrics.bySegment.route_name.values
      : {};
    var rows = Object.keys(values)
      .sort(function (left, right) {
        return toNumber(getMetric(values[right], "sessions_total").value) - toNumber(getMetric(values[left], "sessions_total").value);
      })
      .map(function (routeName) {
        var metrics = values[routeName];
        return [
          '<span class="analytics-table__strong">' + escapeHtml(routeName) + "</span>",
          escapeHtml(formatNumber(getMetric(metrics, "sessions_total").value)),
          escapeHtml(formatNumber(getMetric(metrics, "cta_click_total").value)),
          escapeHtml(formatPercent(getMetric(metrics, "purchase_session_rate").value)),
          escapeHtml(formatMilliseconds(getMetric(metrics, "average_route_ready_ms").value))
        ];
      });

    nodes.routes.innerHTML = [
      '<p class="analytics-section__title">Rendimiento por ruta</p>',
      '<p class="analytics-section__meta">Lectura cruzada de volumen, CTA, conversion y performance por superficie.</p>',
      buildTableHtml(
        ["Ruta", "Sesiones", "CTA", "Compra/sesion", "Route ready"],
        rows,
        "No hay rutas para el filtro actual."
      )
    ].join("");
  }

  function renderV2Cohorts(payload, nodes) {
    if (!nodes || !nodes.v2Cohorts) {
      return;
    }

    var snapshot = payload && payload.cohortSnapshot ? payload.cohortSnapshot : null;
    var channelRows = snapshot && snapshot.cohorts && Array.isArray(snapshot.cohorts.by_entry_source)
      ? snapshot.cohorts.by_entry_source.slice(0, 6).map(function (row) {
        return [
          '<span class="analytics-table__strong">' + escapeHtml(row.key) + "</span>",
          escapeHtml(formatNumber(row.sessions)),
          escapeHtml(formatPercent(row.purchase_session_rate)),
          escapeHtml(formatPercent(row.returning_visitor_rate))
        ];
      })
      : [];
    var visitorRows = snapshot && snapshot.cohorts && Array.isArray(snapshot.cohorts.by_visitor_type)
      ? snapshot.cohorts.by_visitor_type.slice(0, 4).map(function (row) {
        return [
          '<span class="analytics-table__strong">' + escapeHtml(row.key) + "</span>",
          escapeHtml(formatNumber(row.sessions)),
          escapeHtml(formatPercent(row.detail_open_session_rate)),
          escapeHtml(formatMilliseconds(row.average_route_ready_ms))
        ];
      })
      : [];

    nodes.v2Cohorts.innerHTML = [
      '<p class="analytics-section__title">Dashboard v2 · Cohortes</p>',
      '<p class="analytics-section__meta">Canales, nuevos vs recurrentes y calidad de segmento para pasar de lectura descriptiva a accionable.</p>',
      '<div class="analytics-mini-grid">',
      "<div>",
      '<p class="analytics-section__title">Calidad por canal</p>',
      buildTableHtml(["Canal", "Sesiones", "Compra/sesion", "Recurrente"], channelRows, "Sin cohortes por canal."),
      "</div>",
      "<div>",
      '<p class="analytics-section__title">Nuevo vs recurrente</p>',
      buildTableHtml(["Cohorte", "Sesiones", "Detalle/sesion", "Route ready"], visitorRows, "Sin cohortes por tipo de visitante."),
      "</div>",
      "</div>"
    ].join("");
  }

  function renderV2Retention(payload, nodes) {
    if (!nodes || !nodes.v2Retention) {
      return;
    }

    var snapshot = payload && payload.cohortSnapshot ? payload.cohortSnapshot : null;
    var overall = snapshot && snapshot.retention ? snapshot.retention.overall : {};
    var byEntrySource = snapshot && snapshot.retention && Array.isArray(snapshot.retention.by_entry_source)
      ? snapshot.retention.by_entry_source
      : [];
    var rows = byEntrySource.map(function (row) {
      return [
        '<span class="analytics-table__strong">' + escapeHtml(row.entry_source) + "</span>",
        escapeHtml(formatPercent(row.return_1d_rate)),
        escapeHtml(formatPercent(row.return_7d_rate)),
        escapeHtml(formatPercent(row.return_30d_rate)),
        escapeHtml(formatNumber(row.average_sessions_per_visitor))
      ];
    });

    nodes.v2Retention.innerHTML = [
      '<p class="analytics-section__title">Retencion y frecuencia</p>',
      '<p class="analytics-section__meta">Overall: R1 ' + escapeHtml(formatPercent(overall.return_1d_rate)) +
        ' · R7 ' + escapeHtml(formatPercent(overall.return_7d_rate)) +
        ' · R30 ' + escapeHtml(formatPercent(overall.return_30d_rate)) +
        ' · ' + escapeHtml(formatNumber(overall.average_sessions_per_visitor)) + " sesiones/visitante.</p>",
      buildTableHtml(["Canal", "R1", "R7", "R30", "Sesiones/visitante"], rows, "Sin datos de retencion para esta ventana.")
    ].join("");
  }

  function renderV2Timing(payload, nodes) {
    if (!nodes || !nodes.v2Timing) {
      return;
    }

    var snapshot = payload && payload.cohortSnapshot ? payload.cohortSnapshot : null;
    var byHour = snapshot && snapshot.timing && Array.isArray(snapshot.timing.by_hour)
      ? snapshot.timing.by_hour.slice(0, 8)
      : [];
    var byDay = snapshot && snapshot.timing && Array.isArray(snapshot.timing.by_day_of_week)
      ? snapshot.timing.by_day_of_week
      : [];

    var hourRows = byHour.map(function (row) {
      return [
        '<span class="analytics-table__strong">' + escapeHtml(row.label) + ":00" + "</span>",
        escapeHtml(formatNumber(row.sessions)),
        escapeHtml(formatPercent(row.detail_open_session_rate)),
        escapeHtml(formatPercent(row.purchase_session_rate))
      ];
    });

    var dayRows = byDay.map(function (row) {
      return [
        '<span class="analytics-table__strong">' + escapeHtml(row.label) + "</span>",
        escapeHtml(formatNumber(row.sessions)),
        escapeHtml(formatPercent(row.detail_open_session_rate)),
        escapeHtml(formatPercent(row.purchase_session_rate))
      ];
    });

    nodes.v2Timing.innerHTML = [
      '<p class="analytics-section__title">Timing operativo</p>',
      '<p class="analytics-section__meta">Permite detectar franjas horarias y dias con mayor senal de intencion.</p>',
      '<div class="analytics-mini-grid">',
      "<div>",
      '<p class="analytics-section__title">Horas</p>',
      buildTableHtml(["Hora", "Sesiones", "Detalle/sesion", "Compra/sesion"], hourRows, "Sin horas activas para esta ventana."),
      "</div>",
      "<div>",
      '<p class="analytics-section__title">Dias</p>',
      buildTableHtml(["Dia", "Sesiones", "Detalle/sesion", "Compra/sesion"], dayRows, "Sin dias activos para esta ventana."),
      "</div>",
      "</div>"
    ].join("");
  }

  function renderV2Network(payload, nodes) {
    if (!nodes || !nodes.v2Network) {
      return;
    }

    var snapshot = payload && payload.cohortSnapshot ? payload.cohortSnapshot : null;
    var networkRows = snapshot && snapshot.performance_context && Array.isArray(snapshot.performance_context.by_network_type)
      ? snapshot.performance_context.by_network_type.map(function (row) {
        return [
          '<span class="analytics-table__strong">' + escapeHtml(row.label) + "</span>",
          escapeHtml(formatNumber(row.sessions)),
          escapeHtml(formatPercent(row.purchase_session_rate)),
          escapeHtml(formatMilliseconds(row.average_route_ready_ms))
        ];
      })
      : [];
    var speedRows = snapshot && snapshot.performance_context && Array.isArray(snapshot.performance_context.by_speed_bucket)
      ? snapshot.performance_context.by_speed_bucket.map(function (row) {
        return [
          '<span class="analytics-table__strong">' + escapeHtml(row.label) + "</span>",
          escapeHtml(formatNumber(row.sessions)),
          escapeHtml(formatPercent(row.detail_open_session_rate)),
          escapeHtml(formatPercent(row.purchase_session_rate))
        ];
      })
      : [];

    nodes.v2Network.innerHTML = [
      '<p class="analytics-section__title">Performance-context</p>',
      '<p class="analytics-section__meta">Cruza calidad de red, velocidad y conversion para detectar riesgo operativo real.</p>',
      '<div class="analytics-mini-grid">',
      "<div>",
      '<p class="analytics-section__title">Por red</p>',
      buildTableHtml(["Red", "Sesiones", "Compra/sesion", "Route ready"], networkRows, "Sin datos de red."),
      "</div>",
      "<div>",
      '<p class="analytics-section__title">Por velocidad</p>',
      buildTableHtml(["Bucket", "Sesiones", "Detalle/sesion", "Compra/sesion"], speedRows, "Sin buckets de performance."),
      "</div>",
      "</div>"
    ].join("");
  }

  function renderV2Curiosity(payload, nodes) {
    if (!nodes || !nodes.v2Curiosity) {
      return;
    }

    var rows = payload && payload.cohortSnapshot && Array.isArray(payload.cohortSnapshot.curiosity_items)
      ? payload.cohortSnapshot.curiosity_items.slice(0, 8).map(function (row) {
        return [
          '<span class="analytics-table__strong">' + escapeHtml(row.item_name || row.item_id) + "</span>" +
            '<span class="analytics-table__muted">' + escapeHtml((row.category || "categoria") + " · gap " + formatNumber(row.detail_to_purchase_gap)) + "</span>",
          escapeHtml(formatNumber(row.detail_opens)),
          escapeHtml(formatNumber(row.purchase_units)),
          escapeHtml(formatNumber(row.curiosity_score))
        ];
      })
      : [];

    nodes.v2Curiosity.innerHTML = [
      '<p class="analytics-section__title">Alta curiosidad, baja conversion</p>',
      '<p class="analytics-section__meta">Detecta platos que generan interes pero todavia no convierten al mismo ritmo.</p>',
      buildTableHtml(["Plato", "Detalles", "Compras", "Score"], rows, "No hay platos curiosos para esta ventana.")
    ].join("");
  }

  function renderEmptyState(snapshot, nodes, filters) {
    if (!nodes || !nodes.emptyState) {
      return;
    }

    var sessionCount = snapshot && snapshot.metrics && snapshot.metrics.global
      ? toNumber(getMetric(snapshot.metrics.global, "sessions_total").value)
      : 0;

    if (sessionCount > 0) {
      nodes.emptyState.classList.add("is-hidden");
      nodes.emptyState.innerHTML = "";
      return;
    }

    nodes.emptyState.classList.remove("is-hidden");
    nodes.emptyState.innerHTML = filters && !filters.includeInternal
      ? "No hay sesiones business-only para este filtro. En local esto es esperable si la data proviene solo de QA/dev; puedes activar “Incluir trafico interno / QA” para validar el dashboard con datos de prueba."
      : "No hay sesiones en la ventana y canal seleccionados. Ajusta fecha o canal para seguir explorando.";
  }

  function setAiStatus(nodes, text, tone) {
    if (!nodes || !nodes.aiStatus) {
      return;
    }

    nodes.aiStatus.textContent = text;
    nodes.aiStatus.classList.toggle("is-error", tone === "error");
  }

  function buildAiEndpoint() {
    if (typeof window.__FIGATA_ANALYTICS_AI_ANALYST_ENDPOINT === "string" && window.__FIGATA_ANALYTICS_AI_ANALYST_ENDPOINT.trim()) {
      return window.__FIGATA_ANALYTICS_AI_ANALYST_ENDPOINT.trim();
    }

    var auth = ns.auth || {};
    if (auth && typeof auth.isLocalDevHost === "function" && auth.isLocalDevHost()) {
      return "/__analytics/ai-analyst";
    }

    return constants.CLOUDFLARE_AI_ANALYST_ENDPOINT || "/api/analytics/ai-analyst";
  }

  function buildAiFilterPayload(nodes) {
    var filters = getSelectedFilters(nodes);
    return {
      from: filters.from,
      to: filters.to,
      channel: filters.channel,
      entry_source: filters.channel !== "all" ? filters.channel : "",
      includeInternal: filters.includeInternal
    };
  }

  function buildAiMemoryTurns() {
    return analyticsRuntime.ai.thread.slice(-6).map(function (turn) {
      if (turn.role === "assistant") {
        return {
          role: "assistant",
          text: normalizeText(turn.answer || turn.text)
        };
      }

      return {
        role: "user",
        text: normalizeText(turn.text)
      };
    }).filter(function (turn) {
      return turn.text;
    });
  }

  function setAiPill(nodes, responsePayload) {
    if (!nodes || !nodes.aiPill) {
      return;
    }

    if (!responsePayload) {
      nodes.aiPill.textContent = "Mock / listo";
      return;
    }

    var provider = normalizeText(responsePayload.provider, "mock");
    var scope = normalizeText(responsePayload.response_scope, "auto");
    nodes.aiPill.textContent = provider === "openai"
      ? "OpenAI · " + scope
      : "Mock · " + scope;
  }

  function renderAiSuggestedQuestions(nodes) {
    if (!nodes || !nodes.aiSuggested) {
      return;
    }

    var suggestions = analyticsRuntime.ai.suggestedQuestions && analyticsRuntime.ai.suggestedQuestions.length
      ? analyticsRuntime.ai.suggestedQuestions
      : DEFAULT_AI_SUGGESTIONS;

    nodes.aiSuggested.innerHTML = suggestions.slice(0, 5).map(function (question) {
      return (
        '<button class="analytics-ai-chip" type="button" data-ai-question="' + escapeHtml(question) + '">' +
          escapeHtml(question) +
        "</button>"
      );
    }).join("");
  }

  function buildEvidenceHtml(evidence) {
    var list = Array.isArray(evidence) ? evidence : [];
    if (!list.length) {
      return "";
    }

    return [
      '<div class="analytics-ai-message__section">',
      '<p class="analytics-ai-message__label">Evidencia</p>',
      '<div class="analytics-ai-evidence-grid">',
      list.map(function (entry) {
        return [
          '<article class="analytics-ai-evidence-card">',
          '<p class="analytics-ai-evidence-card__title">' + escapeHtml(entry.label || "Evidencia") + "</p>",
          '<p class="analytics-ai-evidence-card__detail">' + escapeHtml(entry.detail || "Sin detalle.") + "</p>",
          entry.metric_refs && entry.metric_refs.length
            ? '<p class="analytics-ai-evidence-card__meta">KPIs: ' + escapeHtml(entry.metric_refs.join(", ")) + "</p>"
            : "",
          "</article>"
        ].join("");
      }).join(""),
      "</div>",
      "</div>"
    ].join("");
  }

  function buildStringListHtml(title, values, emptyCopy) {
    var list = Array.isArray(values) ? values.filter(Boolean) : [];
    if (!list.length) {
      return emptyCopy
        ? '<div class="analytics-ai-message__section"><p class="analytics-ai-message__label">' + escapeHtml(title) + '</p><p class="analytics-ai-message__muted">' + escapeHtml(emptyCopy) + "</p></div>"
        : "";
    }

    return [
      '<div class="analytics-ai-message__section">',
      '<p class="analytics-ai-message__label">' + escapeHtml(title) + "</p>",
      '<ul class="analytics-ai-list">',
      list.map(function (value) {
        return "<li>" + escapeHtml(value) + "</li>";
      }).join(""),
      "</ul>",
      "</div>"
    ].join("");
  }

  function buildFollowUpHtml(values) {
    var list = Array.isArray(values) ? values.filter(Boolean) : [];
    if (!list.length) {
      return "";
    }

    return [
      '<div class="analytics-ai-message__section">',
      '<p class="analytics-ai-message__label">Siguientes preguntas</p>',
      '<div class="analytics-ai-chip-row">',
      list.map(function (value) {
        return '<button class="analytics-ai-chip analytics-ai-chip--secondary" type="button" data-ai-question="' + escapeHtml(value) + '">' + escapeHtml(value) + "</button>";
      }).join(""),
      "</div>",
      "</div>"
    ].join("");
  }

  function renderAiThread(nodes) {
    if (!nodes || !nodes.aiThread) {
      return;
    }

    if (!analyticsRuntime.ai.thread.length) {
      nodes.aiThread.innerHTML = [
        '<article class="analytics-ai-message analytics-ai-message--assistant analytics-ai-message--empty">',
        '<p class="analytics-ai-message__eyebrow">Analista listo</p>',
        '<p class="analytics-ai-message__body">Puedo resumir la semana, comparar canales, leer curiosidad de platos y cruzar reportes con el snapshot live actual.</p>',
        '<p class="analytics-ai-message__muted">Empieza con una sugerencia o escribe una pregunta propia.</p>',
        "</article>"
      ].join("");
      return;
    }

    nodes.aiThread.innerHTML = analyticsRuntime.ai.thread.map(function (entry) {
      if (entry.role === "user") {
        return [
          '<article class="analytics-ai-message analytics-ai-message--user">',
          '<p class="analytics-ai-message__eyebrow">Tu pregunta</p>',
          '<p class="analytics-ai-message__body">' + escapeHtml(entry.text) + "</p>",
          "</article>"
        ].join("");
      }

      return [
        '<article class="analytics-ai-message analytics-ai-message--assistant">',
        '<div class="analytics-ai-message__header">',
        '<p class="analytics-ai-message__eyebrow">AI Data Analyst</p>',
        '<p class="analytics-ai-message__badge">' + escapeHtml((entry.provider || "mock").toUpperCase()) + " · " + escapeHtml(entry.scope || "auto") + " · " + escapeHtml(entry.confidence || "low") + "</p>",
        "</div>",
        '<p class="analytics-ai-message__body">' + escapeHtml(entry.answer || "Sin respuesta.") + "</p>",
        buildEvidenceHtml(entry.evidence),
        buildStringListHtml("Limites", entry.limitations, "Sin limites declarados en esta respuesta."),
        buildFollowUpHtml(entry.followUps),
        "</article>"
      ].join("");
    }).join("");

    nodes.aiThread.scrollTop = nodes.aiThread.scrollHeight;
  }

  function appendAiUserTurn(question) {
    analyticsRuntime.ai.thread.push({
      role: "user",
      text: normalizeText(question)
    });

    if (analyticsRuntime.ai.thread.length > 18) {
      analyticsRuntime.ai.thread = analyticsRuntime.ai.thread.slice(-18);
    }
  }

  function appendAiAssistantTurn(responsePayload) {
    analyticsRuntime.ai.thread.push({
      role: "assistant",
      answer: normalizeText(responsePayload && responsePayload.answer),
      evidence: Array.isArray(responsePayload && responsePayload.evidence) ? responsePayload.evidence : [],
      limitations: Array.isArray(responsePayload && responsePayload.limitations) ? responsePayload.limitations : [],
      followUps: Array.isArray(responsePayload && responsePayload.follow_ups) ? responsePayload.follow_ups : [],
      provider: normalizeText(responsePayload && responsePayload.provider, "mock"),
      scope: normalizeText(responsePayload && responsePayload.response_scope, "auto"),
      confidence: normalizeText(responsePayload && responsePayload.confidence, "low")
    });

    if (analyticsRuntime.ai.thread.length > 18) {
      analyticsRuntime.ai.thread = analyticsRuntime.ai.thread.slice(-18);
    }
  }

  function submitAiQuestion(ctx, questionOverride) {
    var nodes = ensureAnalyticsBindings(ctx);
    if (!nodes || !nodes.aiQuestion) {
      return Promise.resolve();
    }

    var question = normalizeText(typeof questionOverride === "string" ? questionOverride : nodes.aiQuestion.value);
    if (!question) {
      setAiStatus(nodes, "Escribe una pregunta antes de consultar al analista.", "error");
      if (nodes.aiQuestion) {
        nodes.aiQuestion.focus();
      }
      return Promise.resolve();
    }

    analyticsRuntime.ai.requestToken += 1;
    var requestToken = analyticsRuntime.ai.requestToken;
    analyticsRuntime.ai.isLoading = true;

    var requestPayload = {
      question: question,
      mode: nodes.aiMode ? normalizeText(nodes.aiMode.value, "short_qa") : "short_qa",
      scope: nodes.aiScope ? normalizeText(nodes.aiScope.value, "auto") : "auto",
      previous_response_id: analyticsRuntime.ai.previousResponseId,
      memory: buildAiMemoryTurns(),
      filters: buildAiFilterPayload(nodes)
    };

    appendAiUserTurn(question);
    renderAiThread(nodes);
    setAiStatus(nodes, "Consultando reportes y snapshot actual...", "");
    if (nodes.aiSubmit) {
      nodes.aiSubmit.disabled = true;
    }

    return fetch(buildAiEndpoint(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "X-Requested-With": "XMLHttpRequest"
      },
      body: JSON.stringify(requestPayload)
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("AI analyst respondio con " + response.status);
        }
        return response.json();
      })
      .then(function (payload) {
        if (requestToken !== analyticsRuntime.ai.requestToken) {
          return;
        }

        analyticsRuntime.ai.isLoading = false;
        analyticsRuntime.ai.previousResponseId = payload &&
          payload.conversation &&
          payload.conversation.response_id
          ? normalizeText(payload.conversation.response_id)
          : analyticsRuntime.ai.previousResponseId;
        analyticsRuntime.ai.provider = normalizeText(payload && payload.provider, "mock");
        analyticsRuntime.ai.scope = normalizeText(payload && payload.response_scope, "auto");
        analyticsRuntime.ai.suggestedQuestions = Array.isArray(payload && payload.suggested_questions) && payload.suggested_questions.length
          ? payload.suggested_questions.slice(0, 5)
          : DEFAULT_AI_SUGGESTIONS.slice();
        appendAiAssistantTurn(payload);
        renderAiSuggestedQuestions(nodes);
        renderAiThread(nodes);
        setAiPill(nodes, payload);
        setAiStatus(nodes, "Respuesta lista con " + formatNumber((payload && payload.evidence ? payload.evidence.length : 0)) + " evidencias.", "");
        if (nodes.aiQuestion) {
          nodes.aiQuestion.value = "";
        }
      })
      .catch(function (error) {
        if (requestToken !== analyticsRuntime.ai.requestToken) {
          return;
        }

        analyticsRuntime.ai.isLoading = false;
        setAiStatus(nodes, "No pude consultar al analista. " + normalizeText(error && error.message, "Error desconocido."), "error");
      })
      .finally(function () {
        if (requestToken === analyticsRuntime.ai.requestToken && nodes.aiSubmit) {
          nodes.aiSubmit.disabled = false;
        }
      });
  }

  function renderAnalyticsSnapshot(payload, nodes) {
    if (!payload || !payload.kpiSnapshot) {
      setAnalyticsStatus(nodes, "No se pudo construir el snapshot KPI.", "error");
      return;
    }

    var snapshot = payload.kpiSnapshot;
    var filters = getSelectedFilters(nodes);

    setScopePill(nodes, snapshot);
    syncChannelOptions(nodes, payload);
    renderHero(snapshot, nodes);
    renderChecklist(snapshot, nodes, filters);
    renderAcquisition(snapshot, nodes);
    renderFunnel(snapshot, nodes);
    renderTopItems(snapshot, nodes);
    renderCtas(snapshot, nodes);
    renderRoutes(snapshot, nodes);
    renderV2Cohorts(payload, nodes);
    renderV2Retention(payload, nodes);
    renderV2Timing(payload, nodes);
    renderV2Network(payload, nodes);
    renderV2Curiosity(payload, nodes);
    renderEmptyState(snapshot, nodes, filters);

    setAnalyticsStatus(
      nodes,
      "Snapshot listo. " +
        formatNumber(getMetric(snapshot.metrics.global, "sessions_total").value) +
        " sesiones · " +
        snapshot.scope.mode +
        " · ultimo generado " +
        normalizeText(snapshot.generatedAt, "sin fecha"),
      ""
    );
  }

  function buildInspectUrl(nodes) {
    var filters = getSelectedFilters(nodes);
    var params = new URLSearchParams();
    params.set("limit", "0");
    params.set("scope", filters.includeInternal ? "all_traffic" : "business_only");

    if (filters.from) {
      params.set("from", filters.from);
    }
    if (filters.to) {
      params.set("to", filters.to);
    }
    if (filters.channel && filters.channel !== "all") {
      params.set("entry_source", filters.channel);
    }

    var auth = ns.auth || {};
    var basePath = auth && typeof auth.isLocalDevHost === "function" && auth.isLocalDevHost()
      ? "/__analytics/inspect"
      : (constants.CLOUDFLARE_ANALYTICS_SNAPSHOT_ENDPOINT || "/api/analytics/snapshot");

    return basePath + "?" + params.toString();
  }

  function ensureAnalyticsBindings(ctx) {
    var nodes = getAnalyticsNodes(ctx);
    if (!nodes || analyticsRuntime.isBound || !nodes.form) {
      return nodes;
    }

    syncScopeToggleLabel(nodes);

    nodes.form.addEventListener("submit", function (event) {
      event.preventDefault();
      loadAnalyticsSnapshot(ctx, { reason: "submit" });
    });

    if (nodes.channelSelect) {
      nodes.channelSelect.addEventListener("change", function () {
        loadAnalyticsSnapshot(ctx, { reason: "channel" });
      });
    }

    if (nodes.includeInternalToggle) {
      nodes.includeInternalToggle.addEventListener("click", function () {
        var isPressed = nodes.includeInternalToggle.getAttribute("aria-pressed") === "true";
        nodes.includeInternalToggle.setAttribute("aria-pressed", isPressed ? "false" : "true");
        syncScopeToggleLabel(nodes);
        loadAnalyticsSnapshot(ctx, { reason: "scope" });
      });
    }

    if (nodes.aiForm) {
      nodes.aiForm.addEventListener("submit", function (event) {
        event.preventDefault();
        submitAiQuestion(ctx);
      });
    }

    if (nodes.aiSuggested) {
      nodes.aiSuggested.addEventListener("click", function (event) {
        var trigger = event.target && event.target.closest("[data-ai-question]");
        if (!trigger) {
          return;
        }

        submitAiQuestion(ctx, trigger.getAttribute("data-ai-question"));
      });
    }

    if (nodes.aiThread) {
      nodes.aiThread.addEventListener("click", function (event) {
        var trigger = event.target && event.target.closest("[data-ai-question]");
        if (!trigger) {
          return;
        }

        submitAiQuestion(ctx, trigger.getAttribute("data-ai-question"));
      });
    }

    analyticsRuntime.isBound = true;
    renderAiSuggestedQuestions(nodes);
    renderAiThread(nodes);
    setAiPill(nodes);
    setAiStatus(nodes, "Listo para responder con evidencia de reportes y snapshots.", "");
    return nodes;
  }

  function loadAnalyticsSnapshot(ctx, options) {
    var nodes = ensureAnalyticsBindings(ctx);
    if (!nodes) {
      return Promise.resolve();
    }

    analyticsRuntime.requestToken += 1;
    var requestToken = analyticsRuntime.requestToken;
    analyticsRuntime.isLoading = true;
    setAnalyticsStatus(nodes, "Cargando analytics operativo...", "");

    return fetch(buildInspectUrl(nodes), {
      headers: {
        "Cache-Control": "no-store",
        "X-Requested-With": "XMLHttpRequest"
      }
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Inspect analytics respondio con " + response.status);
        }
        return response.json();
      })
      .then(function (payload) {
        if (requestToken !== analyticsRuntime.requestToken) {
          return;
        }

        analyticsRuntime.isLoading = false;
        analyticsRuntime.hasLoadedOnce = true;
        renderAnalyticsSnapshot(payload, nodes);
      })
      .catch(function (error) {
        if (requestToken !== analyticsRuntime.requestToken) {
          return;
        }

        analyticsRuntime.isLoading = false;
        analyticsRuntime.hasLoadedOnce = true;
        if (nodes.emptyState) {
          var inspectPath = buildInspectUrl(nodes).split("?")[0];
          nodes.emptyState.classList.remove("is-hidden");
          nodes.emptyState.innerHTML =
            "No se pudo cargar Analytics v1 desde <code>" + escapeHtml(inspectPath) + "</code>. " +
            escapeHtml(normalizeText(error && error.message, "Error desconocido."));
        }
        setAnalyticsStatus(nodes, "Error cargando analytics operativo.", "error");
      });
  }

  function updateDashboardMetrics(ctx) {
    bindDummyDashboardTabs(ctx);

    var hasLegacyMetricSurface = Boolean(
      ctx.elements.metricMenu ||
      ctx.elements.metricCategories ||
      ctx.elements.metricAvailability ||
      ctx.elements.metricHome ||
      ctx.elements.metricIngredients ||
      ctx.elements.metricRestaurant ||
      ctx.elements.metricMedia
    );
    var analyticsNodes = getAnalyticsNodes(ctx);
    var hasAnalyticsSurface = Boolean(analyticsNodes && analyticsNodes.form);

    if (!hasLegacyMetricSurface && !hasAnalyticsSurface) {
      return;
    }

    if (!ctx.state.hasDataLoaded) {
      if (ctx.elements.metricMenu) {
        ctx.elements.metricMenu.textContent = "-";
      }
      if (ctx.elements.metricCategories) {
        ctx.elements.metricCategories.textContent = "-";
      }
      if (ctx.elements.metricAvailability) {
        ctx.elements.metricAvailability.textContent = "-";
      }
      if (ctx.elements.metricHome) {
        ctx.elements.metricHome.textContent = "-";
      }
      if (ctx.elements.metricIngredients) {
        ctx.elements.metricIngredients.textContent = "-";
      }
      if (ctx.elements.metricRestaurant) {
        ctx.elements.metricRestaurant.textContent = "-";
      }
      if (ctx.elements.metricMedia) {
        ctx.elements.metricMedia.textContent = "-";
      }
      ensureAnalyticsBindings(ctx);
      return;
    }

    var menuItemsCount = ctx.getAllMenuItems().length;
    if (ctx.elements.metricMenu) {
      ctx.elements.metricMenu.textContent = menuItemsCount + " items";
    }

    ctx.ensureCategoriesDraft();
    var categoriesDraft = ctx.state.drafts.categories || {};
    var categoriesList = Array.isArray(categoriesDraft.categories) ? categoriesDraft.categories : [];
    var hiddenCategoriesCount = categoriesList.filter(function (category) {
      return !ctx.resolveCategoryVisibility(category);
    }).length;
    var categoriesValidation = ctx.validateCategoriesDraftData(categoriesDraft);
    ctx.state.categoriesEditor.validationReport = categoriesValidation;
    var categoriesAlertsCount = categoriesValidation.errors.length + categoriesValidation.warnings.length;
    if (ctx.elements.metricCategories) {
      ctx.elements.metricCategories.textContent = categoriesList.length + " categorias" +
        (hiddenCategoriesCount ? (" · " + hiddenCategoriesCount + " hidden") : "") +
        (categoriesAlertsCount ? (" · " + categoriesAlertsCount + " alertas") : "");
    }

    ctx.ensureHomeDraft();
    ctx.ensureIngredientsDraft();
    var homeData = ctx.state.drafts.home || {};
    var configuredModalsCount = 0;
    if (homeData.menu_page && homeData.menu_page.account_modal) {
      configuredModalsCount += 1;
    }
    if (homeData.menu_page && homeData.menu_page.filter_modal) {
      configuredModalsCount += 1;
    }
    if (homeData.menu_detail_editorial && homeData.menu_detail_editorial.compare_modal) {
      configuredModalsCount += 1;
    }
    if (ctx.elements.metricAvailability) {
      ctx.elements.metricAvailability.textContent = configuredModalsCount + " modales";
    }

    var featuredCount =
      homeData.popular && Array.isArray(homeData.popular.featuredIds)
        ? homeData.popular.featuredIds.length
        : 0;
    var heroTitle = homeData.hero && homeData.hero.title ? homeData.hero.title : "Sin hero";
    if (ctx.elements.metricHome) {
      ctx.elements.metricHome.textContent = featuredCount + " featured · " + heroTitle;
    }

    if (ctx.elements.metricIngredients) {
      var ingredientsDraft = ctx.state.drafts.ingredients || {};
      var ingredientsCount = Object.keys((ingredientsDraft.ingredients || {})).length;
      var ingredientsValidation = ctx.validateIngredientsDraftData(ingredientsDraft);
      ctx.state.ingredientsEditor.validationReport = ingredientsValidation;
      var alertsCount = ingredientsValidation.errors.length + ingredientsValidation.warnings.length;
      ctx.elements.metricIngredients.textContent = ingredientsCount + " ingredientes" +
        (alertsCount ? (" · " + alertsCount + " alertas") : "");
    }

    var restaurant = ctx.state.drafts.restaurant || ctx.state.data.restaurant || {};
    var contact = restaurant.contact || {};
    var location = restaurant.location || {};
    var phone = contact.phone || "Sin telefono";
    var city = location.city || "";
    if (ctx.elements.metricRestaurant) {
      ctx.elements.metricRestaurant.textContent = city ? phone + " · " + city : phone;
    }

    var mediaItems = ((ctx.state.drafts.media || ctx.state.data.media || {}).items) || {};
    if (ctx.elements.metricMedia) {
      ctx.elements.metricMedia.textContent = Object.keys(mediaItems).length + " media items";
    }

    ensureAnalyticsBindings(ctx);
    if (!analyticsRuntime.hasLoadedOnce && !analyticsRuntime.isLoading) {
      loadAnalyticsSnapshot(ctx, { reason: "initial" });
    }
  }

  function openDashboard(ctx, options) {
    options = options || {};
    if (!options.skipRoute) {
      ctx.navigateToRoute("/dashboard", { replace: Boolean(options.replaceRoute) });
      return;
    }
    ctx.setActivePanel("dashboard");
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

    bindDummyDashboardTabs(ctx);

    var nodes = ensureAnalyticsBindings(ctx);
    if (nodes && nodes.form && !analyticsRuntime.isLoading) {
      loadAnalyticsSnapshot(ctx, { reason: "open" });
    }
  }

  ns.dashboard = {
    updateDashboardMetrics: updateDashboardMetrics,
    openDashboard: openDashboard
  };
})();
