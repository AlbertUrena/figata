// admin/app/modules/panels/reservations-panel.js
// Operational reservations panel for the admin SPA.

(function () {
  "use strict";

  var ns = window.FigataAdmin = window.FigataAdmin || {};
  var RU = ns.renderUtils || {};
  var C = ns.constants || {};
  var runtime = window.FigataReservationsRuntime || null;

  var LIST_ENDPOINT = C.CLOUDFLARE_RESERVATIONS_ADMIN_LIST_ENDPOINT || "/api/reservations/admin/list";
  var BLOCKS_ENDPOINT = C.CLOUDFLARE_RESERVATIONS_ADMIN_BLOCKS_ENDPOINT || "/api/reservations/admin/blocks";
  var RESERVATION_DETAIL_ENDPOINT = "/api/reservations/admin/";
  var DATE_LABEL_FORMATTER = new Intl.DateTimeFormat("es-DO", {
    weekday: "short",
    day: "numeric",
    month: "short"
  });
  var CREATED_AT_FORMATTER = new Intl.DateTimeFormat("es-DO", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit"
  });

  var STATUS_ACTIONS = {
    pending: [
      { status: "confirmed", label: "Confirmar", tone: "primary" },
      { status: "rejected", label: "Rechazar", tone: "danger" },
      { status: "cancelled", label: "Cancelar", tone: "ghost" }
    ],
    confirmed: [
      { status: "pending", label: "Volver a pendiente", tone: "ghost" },
      { status: "no_show", label: "No show", tone: "ghost" },
      { status: "cancelled", label: "Cancelar", tone: "danger" }
    ],
    rejected: [
      { status: "pending", label: "Reabrir", tone: "ghost" }
    ],
    cancelled: [
      { status: "pending", label: "Reabrir", tone: "ghost" }
    ],
    no_show: [
      { status: "confirmed", label: "Confirmar", tone: "primary" },
      { status: "pending", label: "Reabrir", tone: "ghost" }
    ]
  };

  function escapeHtml(value) {
    return RU && typeof RU.escapeHtml === "function"
      ? RU.escapeHtml(String(value == null ? "" : value))
      : String(value == null ? "" : value)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");
  }

  function normalizeText(value, fallback) {
    var text = typeof value === "string" ? value.trim() : "";
    return text || (fallback || "");
  }

  function toIsoDate(value) {
    var date = value instanceof Date ? value : new Date();
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");
  }

  function addDays(date, amount) {
    var next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    next.setDate(next.getDate() + amount);
    return next;
  }

  function getConfig(ctx) {
    return (ctx.state.data && ctx.state.data.reservations) || {};
  }

  function getZones(ctx) {
    var config = getConfig(ctx);
    var zones = Array.isArray(config.zones) ? config.zones : [];
    return zones
      .filter(function (zone) {
        return zone && zone.enabled !== false;
      })
      .slice()
      .sort(function (left, right) {
        return Number(left && left.sortOrder || 0) - Number(right && right.sortOrder || 0);
      });
  }

  function getStatusCatalog(ctx) {
    var config = getConfig(ctx);
    return Array.isArray(config.statusCatalog) ? config.statusCatalog : [];
  }

  function getStatusEntry(ctx, statusId) {
    return getStatusCatalog(ctx).find(function (entry) {
      return entry && entry.id === statusId;
    }) || null;
  }

  function buildDefaultSummary() {
    return {
      total: 0,
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      rejected: 0,
      no_show: 0
    };
  }

  function getEditorState(ctx) {
    if (!ctx.state.reservationsEditor || typeof ctx.state.reservationsEditor !== "object") {
      ctx.state.reservationsEditor = {};
    }

    var editor = ctx.state.reservationsEditor;
    if (!editor.filters || typeof editor.filters !== "object") {
      editor.filters = {
        status: "",
        date: "",
        zoneId: ""
      };
    }
    if (!editor.summary || typeof editor.summary !== "object") {
      editor.summary = buildDefaultSummary();
    }
    if (!Array.isArray(editor.reservations)) {
      editor.reservations = [];
    }
    if (!Array.isArray(editor.blocks)) {
      editor.blocks = [];
    }
    if (!editor.blockForm || typeof editor.blockForm !== "object") {
      editor.blockForm = {
        date: "",
        time: "",
        zoneId: "",
        note: ""
      };
    }
    if (typeof editor.loading !== "boolean") {
      editor.loading = false;
    }
    if (typeof editor.loaded !== "boolean") {
      editor.loaded = false;
    }
    if (typeof editor.error !== "string") {
      editor.error = "";
    }
    if (typeof editor.actionReservationId !== "string") {
      editor.actionReservationId = "";
    }
    if (typeof editor.actionStatus !== "string") {
      editor.actionStatus = "";
    }
    if (typeof editor.blockSubmitting !== "boolean") {
      editor.blockSubmitting = false;
    }
    if (typeof editor.blockDeletingId !== "string") {
      editor.blockDeletingId = "";
    }

    normalizeBlockForm(ctx);
    return editor;
  }

  function getDefaultBlockDate(ctx) {
    var config = getConfig(ctx);
    var today = new Date();

    for (var offset = 0; offset < 21; offset += 1) {
      var candidate = toIsoDate(addDays(today, offset));
      if (
        runtime &&
        typeof runtime.getServiceWindowsForDate === "function" &&
        runtime.getServiceWindowsForDate(config, candidate).length
      ) {
        return candidate;
      }
    }

    return toIsoDate(today);
  }

  function getTimeOptionsForDate(ctx, isoDate) {
    var config = getConfig(ctx);
    if (!runtime || typeof runtime.buildSlotsForDate !== "function") {
      return [];
    }

    return runtime.buildSlotsForDate(config, isoDate).map(function (slot) {
      return slot && slot.time ? slot.time : "";
    }).filter(Boolean);
  }

  function formatDateLabel(isoDate) {
    if (!isoDate) {
      return "Por definir";
    }
    var date = new Date(isoDate + "T12:00:00");
    if (Number.isNaN(date.getTime())) {
      return isoDate;
    }
    return DATE_LABEL_FORMATTER.format(date);
  }

  function formatTimeLabel(timeValue) {
    var parts = String(timeValue || "").split(":");
    if (parts.length !== 2) {
      return normalizeText(timeValue, "Por definir");
    }
    var hours = Number(parts[0]);
    var minutes = Number(parts[1]);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
      return normalizeText(timeValue, "Por definir");
    }
    var period = hours >= 12 ? "PM" : "AM";
    var displayHour = hours % 12 || 12;
    return displayHour + ":" + String(minutes).padStart(2, "0") + " " + period;
  }

  function formatCreatedAt(value) {
    if (!value) {
      return "";
    }
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return CREATED_AT_FORMATTER.format(date);
  }

  function getStatusToneClass(statusId, tone) {
    if (statusId === "confirmed" || tone === "success") return "confirmed";
    if (statusId === "pending" || tone === "warning") return "pending";
    return "cancelled";
  }

  function normalizeBlockForm(ctx) {
    var editor = ctx.state.reservationsEditor || {};
    var zones = getZones(ctx);
    if (!editor.blockForm) {
      editor.blockForm = {};
    }

    if (!normalizeText(editor.blockForm.zoneId) || !zones.some(function (zone) { return zone.id === editor.blockForm.zoneId; })) {
      editor.blockForm.zoneId = zones.length ? zones[0].id : "";
    }

    if (!normalizeText(editor.blockForm.date)) {
      editor.blockForm.date = editor.filters && editor.filters.date ? editor.filters.date : getDefaultBlockDate(ctx);
    }

    var times = getTimeOptionsForDate(ctx, editor.blockForm.date);
    if (!times.length) {
      editor.blockForm.time = "";
      return;
    }

    if (times.indexOf(editor.blockForm.time) === -1) {
      editor.blockForm.time = times[0];
    }
  }

  function buildQuery(basePath, params) {
    var url = new URL(basePath, window.location.origin);
    Object.keys(params || {}).forEach(function (key) {
      var value = normalizeText(params[key]);
      if (value) {
        url.searchParams.set(key, value);
      }
    });
    return url.toString();
  }

  async function fetchJson(url, options) {
    var response = await fetch(url, options || {});
    var payload = await response.json().catch(function () { return {}; });
    if (!response.ok) {
      throw new Error(payload && payload.error ? payload.error : ("HTTP " + response.status));
    }
    return payload;
  }

  function renderMetricCard(label, value, tone) {
    return ''
      + '<article class="card reservations-ops__metric reservations-ops__metric--' + escapeHtml(tone) + '">'
      + '  <p class="reservations-ops__metric-label">' + escapeHtml(label) + '</p>'
      + '  <p class="reservations-ops__metric-value">' + escapeHtml(value) + '</p>'
      + '</article>';
  }

  function renderStatusOptions(ctx) {
    return ['<option value="">Todos los estados</option>']
      .concat(getStatusCatalog(ctx).map(function (entry) {
        return '<option value="' + escapeHtml(entry.id) + '">' + escapeHtml(entry.publicLabel || entry.label || entry.id) + '</option>';
      }))
      .join("");
  }

  function renderZoneOptions(ctx, includeAll) {
    var zones = getZones(ctx);
    var options = includeAll ? ['<option value="">Todas las zonas</option>'] : [];
    return options.concat(zones.map(function (zone) {
      return '<option value="' + escapeHtml(zone.id) + '">' + escapeHtml(zone.label || zone.id) + '</option>';
    })).join("");
  }

  function renderTimeOptions(ctx, isoDate) {
    var times = getTimeOptionsForDate(ctx, isoDate);
    if (!times.length) {
      return '<option value="">Sin horarios para ese día</option>';
    }

    return times.map(function (timeValue) {
      return '<option value="' + escapeHtml(timeValue) + '">' + escapeHtml(formatTimeLabel(timeValue)) + '</option>';
    }).join("");
  }

  function renderReservationActions(reservation) {
    var actions = STATUS_ACTIONS[normalizeText(reservation && reservation.status)] || [];
    if (!actions.length) {
      return "";
    }

    return ''
      + '<div class="reservations-ops__actions">'
      + actions.map(function (action) {
        return ''
          + '<button'
          + ' class="btn ' + (action.tone === "primary" ? 'btn-primary' : action.tone === "danger" ? 'btn-danger' : 'btn-ghost') + ' reservations-ops__action-button"'
          + ' type="button"'
          + ' data-res-status-action="' + escapeHtml(action.status) + '"'
          + ' data-reservation-id="' + escapeHtml(reservation.id) + '">'
          + escapeHtml(action.label)
          + '</button>';
      }).join("")
      + '</div>';
  }

  function renderReservationCard(ctx, reservation, editor) {
    var statusEntry = getStatusEntry(ctx, reservation.status) || {};
    var toneClass = getStatusToneClass(reservation.status, statusEntry.tone || reservation.status_tone);
    var isActing = editor.actionReservationId === reservation.id;
    var noteMarkup = normalizeText(reservation.notes)
      ? '<p class="reservations-ops__note"><strong>Notas:</strong> ' + escapeHtml(reservation.notes) + '</p>'
      : '';

    return ''
      + '<article class="card reservations-ops__reservation-card' + (isActing ? ' is-busy' : '') + '">'
      + '  <header class="reservations-ops__reservation-head">'
      + '    <div>'
      + '      <p class="reservations-ops__reservation-code">' + escapeHtml(reservation.reservation_code || reservation.id) + '</p>'
      + '      <h3 class="reservations-ops__reservation-name">' + escapeHtml(reservation.customer_name || "Reserva") + '</h3>'
      + '    </div>'
      + '    <span class="reservations-ops__status-pill reservations-ops__status-pill--' + escapeHtml(toneClass) + '">' + escapeHtml(reservation.status_label || statusEntry.publicLabel || reservation.status) + '</span>'
      + '  </header>'
      + '  <dl class="reservations-ops__reservation-grid">'
      + '    <div><dt>Fecha</dt><dd>' + escapeHtml(formatDateLabel(reservation.reservation_date)) + '</dd></div>'
      + '    <div><dt>Hora</dt><dd>' + escapeHtml(formatTimeLabel(reservation.reservation_time)) + '</dd></div>'
      + '    <div><dt>Comensales</dt><dd>' + escapeHtml(String(reservation.party_size || 0)) + '</dd></div>'
      + '    <div><dt>Zona</dt><dd>' + escapeHtml(reservation.zone_label || reservation.zone_id) + '</dd></div>'
      + '    <div><dt>Whatsapp</dt><dd>' + escapeHtml(reservation.whatsapp_display || "") + '</dd></div>'
      + '    <div><dt>Creada</dt><dd>' + escapeHtml(formatCreatedAt(reservation.created_at)) + '</dd></div>'
      + '  </dl>'
      + noteMarkup
      + (isActing
        ? '<p class="reservations-ops__inline-status">Actualizando estado...</p>'
        : renderReservationActions(reservation))
      + '</article>';
  }

  function renderBlocksList(editor) {
    if (editor.blockSubmitting) {
      return '<p class="inline-help">Guardando bloqueo...</p>';
    }

    if (!editor.blocks.length) {
      return '<p class="inline-help">No hay bloqueos activos para los filtros actuales.</p>';
    }

    return '<div class="reservations-ops__block-list">' + editor.blocks.map(function (block) {
      var isDeleting = editor.blockDeletingId === block.id;
      return ''
        + '<article class="reservations-ops__block-card">'
        + '  <div>'
        + '    <p class="reservations-ops__block-title">' + escapeHtml(formatDateLabel(block.reservation_date)) + ' · ' + escapeHtml(formatTimeLabel(block.reservation_time)) + '</p>'
        + '    <p class="reservations-ops__block-meta">' + escapeHtml(block.zone_label || block.zone_id) + (normalizeText(block.note) ? ' · ' + escapeHtml(block.note) : '') + '</p>'
        + '  </div>'
        + '  <button class="btn btn-ghost reservations-ops__block-delete" type="button" data-res-block-delete="' + escapeHtml(block.id) + '"' + (isDeleting ? ' disabled' : '') + '>'
        + (isDeleting ? 'Quitando...' : 'Quitar')
        + '  </button>'
        + '</article>';
    }).join("") + '</div>';
  }

  function renderReservationsPanel(ctx) {
    var panel = ctx.views.reservationsEditorPanel;
    if (!panel) return;

    var editor = getEditorState(ctx);
    var reservationsHtml = editor.loading
      ? '<p class="inline-help">Cargando reservas...</p>'
      : (editor.reservations.length
        ? editor.reservations.map(function (reservation) {
            return renderReservationCard(ctx, reservation, editor);
          }).join("")
        : '<div class="card reservations-ops__empty"><p>No hay reservas para los filtros actuales.</p></div>');

    panel.innerHTML = ''
      + '<div class="home-editor__header">'
      + '  <div>'
      + '    <p class="kicker">Reservas</p>'
      + '    <h2>Operación de reservas</h2>'
      + '    <p class="home-editor__subtitle">Gestiona solicitudes nuevas, confirma estados y bloquea horarios por zona sin salir del admin.</p>'
      + '  </div>'
      + '  <div class="home-editor__actions">'
      + '    <button class="btn btn-ghost" type="button" data-reservations-refresh>Recargar</button>'
      + '  </div>'
      + '</div>'
      + '<p id="reservations-editor-status" class="data-status" role="status" aria-live="polite">' + escapeHtml(editor.error || 'Panel listo.') + '</p>'
      + '<div class="reservations-ops__summary">'
      + renderMetricCard('Total', String(editor.summary.total || 0), 'neutral')
      + renderMetricCard('Pendientes', String(editor.summary.pending || 0), 'pending')
      + renderMetricCard('Confirmadas', String(editor.summary.confirmed || 0), 'confirmed')
      + renderMetricCard('Bloqueos', String(editor.blocks.length || 0), 'neutral')
      + '</div>'
      + '<section class="card reservations-ops__toolbar">'
      + '  <label class="field">'
      + '    <span>Estado</span>'
      + '    <select data-res-filter="status">' + renderStatusOptions(ctx) + '</select>'
      + '  </label>'
      + '  <label class="field">'
      + '    <span>Fecha</span>'
      + '    <input type="date" data-res-filter="date" value="' + escapeHtml(editor.filters.date) + '" />'
      + '  </label>'
      + '  <label class="field">'
      + '    <span>Zona</span>'
      + '    <select data-res-filter="zone">' + renderZoneOptions(ctx, true) + '</select>'
      + '  </label>'
      + '  <div class="reservations-ops__toolbar-actions">'
      + '    <button class="btn btn-ghost" type="button" data-res-clear-filters>Limpiar filtros</button>'
      + '  </div>'
      + '</section>'
      + '<div class="reservations-ops__layout">'
      + '  <section class="reservations-ops__column">'
      + '    <div class="reservations-ops__list">' + reservationsHtml + '</div>'
      + '  </section>'
      + '  <aside class="reservations-ops__column">'
      + '    <section class="card reservations-ops__side-panel">'
      + '      <header class="reservations-ops__side-header">'
      + '        <h3>Bloquear horario</h3>'
      + '        <p class="inline-help">Úsalo cuando quieras cerrar una franja en una zona específica.</p>'
      + '      </header>'
      + '      <form class="reservations-ops__block-form" data-res-block-form>'
      + '        <label class="field">'
      + '          <span>Fecha</span>'
      + '          <input type="date" value="' + escapeHtml(editor.blockForm.date) + '" data-res-block-field="date" required />'
      + '        </label>'
      + '        <label class="field">'
      + '          <span>Hora</span>'
      + '          <select data-res-block-field="time" required>' + renderTimeOptions(ctx, editor.blockForm.date) + '</select>'
      + '        </label>'
      + '        <label class="field">'
      + '          <span>Zona</span>'
      + '          <select data-res-block-field="zone">' + renderZoneOptions(ctx, false) + '</select>'
      + '        </label>'
      + '        <label class="field" style="grid-column: 1 / -1;">'
      + '          <span>Nota interna</span>'
      + '          <input type="text" value="' + escapeHtml(editor.blockForm.note) + '" data-res-block-field="note" placeholder="Ej: Evento privado, mantenimiento, clima..." />'
      + '        </label>'
      + '        <button class="btn btn-primary reservations-ops__submit" type="submit"' + (editor.blockSubmitting ? ' disabled' : '') + '>'
      +            (editor.blockSubmitting ? 'Guardando...' : 'Bloquear horario')
      + '        </button>'
      + '      </form>'
      + '    </section>'
      + '    <section class="card reservations-ops__side-panel">'
      + '      <header class="reservations-ops__side-header">'
      + '        <h3>Bloqueos activos</h3>'
      + '      </header>'
      + renderBlocksList(editor)
      + '    </section>'
      + '  </aside>'
      + '</div>';

    var statusSelect = panel.querySelector('[data-res-filter="status"]');
    if (statusSelect) {
      statusSelect.value = editor.filters.status || "";
    }
    var zoneSelect = panel.querySelector('[data-res-filter="zone"]');
    if (zoneSelect) {
      zoneSelect.value = editor.filters.zoneId || "";
    }
    var blockTimeSelect = panel.querySelector('[data-res-block-field="time"]');
    if (blockTimeSelect) {
      blockTimeSelect.value = editor.blockForm.time || "";
    }
    var blockZoneSelect = panel.querySelector('[data-res-block-field="zone"]');
    if (blockZoneSelect) {
      blockZoneSelect.value = editor.blockForm.zoneId || "";
    }
  }

  async function refreshReservationsPanel(ctx, options) {
    var editor = getEditorState(ctx);
    editor.loading = true;
    editor.error = "";
    renderReservationsPanel(ctx);

    try {
      var reservationsPayload = await fetchJson(buildQuery(LIST_ENDPOINT, {
        status: editor.filters.status,
        date: editor.filters.date,
        zone_id: editor.filters.zoneId
      }), {
        headers: {
          Accept: "application/json"
        }
      });

      var blocksPayload = await fetchJson(buildQuery(BLOCKS_ENDPOINT, {
        date: editor.filters.date || editor.blockForm.date,
        zone_id: editor.filters.zoneId
      }), {
        headers: {
          Accept: "application/json"
        }
      });

      editor.loading = false;
      editor.loaded = true;
      editor.reservations = Array.isArray(reservationsPayload.reservations) ? reservationsPayload.reservations : [];
      editor.summary = reservationsPayload.summary || buildDefaultSummary();
      editor.blocks = Array.isArray(blocksPayload.blocks) ? blocksPayload.blocks : [];
      editor.error = "";
      if (!(options && options.silent)) {
        ctx.setReservationsEditorStatus("Reservas actualizadas.");
      }
      renderReservationsPanel(ctx);
    } catch (error) {
      editor.loading = false;
      editor.error = error && error.message ? error.message : "No pudimos cargar las reservas.";
      ctx.setReservationsEditorStatus(editor.error);
      renderReservationsPanel(ctx);
    }
  }

  async function handleStatusChange(ctx, reservationId, nextStatus) {
    var editor = getEditorState(ctx);
    var destructive = nextStatus === "cancelled" || nextStatus === "rejected" || nextStatus === "no_show";
    if (destructive && !window.confirm("¿Seguro que quieres cambiar esta reserva a " + nextStatus + "?")) {
      return;
    }

    editor.actionReservationId = normalizeText(reservationId);
    editor.actionStatus = normalizeText(nextStatus);
    renderReservationsPanel(ctx);

    try {
      await fetchJson(RESERVATION_DETAIL_ENDPOINT + encodeURIComponent(reservationId), {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: nextStatus
        })
      });
      editor.actionReservationId = "";
      editor.actionStatus = "";
      ctx.setReservationsEditorStatus("Estado actualizado.");
      await refreshReservationsPanel(ctx, { silent: true });
    } catch (error) {
      editor.actionReservationId = "";
      editor.actionStatus = "";
      ctx.setReservationsEditorStatus(error && error.message ? error.message : "No pudimos actualizar la reserva.");
      renderReservationsPanel(ctx);
    }
  }

  async function handleCreateBlock(ctx) {
    var editor = getEditorState(ctx);
    normalizeBlockForm(ctx);
    editor.blockSubmitting = true;
    renderReservationsPanel(ctx);

    try {
      await fetchJson(BLOCKS_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          date: editor.blockForm.date,
          time: editor.blockForm.time,
          zone_id: editor.blockForm.zoneId,
          note: editor.blockForm.note
        })
      });

      editor.blockSubmitting = false;
      editor.blockForm.note = "";
      ctx.setReservationsEditorStatus("Bloqueo creado.");
      await refreshReservationsPanel(ctx, { silent: true });
    } catch (error) {
      editor.blockSubmitting = false;
      ctx.setReservationsEditorStatus(error && error.message ? error.message : "No pudimos crear el bloqueo.");
      renderReservationsPanel(ctx);
    }
  }

  async function handleDeleteBlock(ctx, blockId) {
    var editor = getEditorState(ctx);
    if (!window.confirm("¿Quitar este bloqueo?")) {
      return;
    }

    editor.blockDeletingId = normalizeText(blockId);
    renderReservationsPanel(ctx);

    try {
      await fetchJson(BLOCKS_ENDPOINT + "/" + encodeURIComponent(blockId), {
        method: "DELETE",
        headers: {
          Accept: "application/json"
        }
      });
      editor.blockDeletingId = "";
      ctx.setReservationsEditorStatus("Bloqueo eliminado.");
      await refreshReservationsPanel(ctx, { silent: true });
    } catch (error) {
      editor.blockDeletingId = "";
      ctx.setReservationsEditorStatus(error && error.message ? error.message : "No pudimos eliminar el bloqueo.");
      renderReservationsPanel(ctx);
    }
  }

  function bindReservationsPanelEvents(ctx) {
    var panel = ctx.views.reservationsEditorPanel;
    if (!panel || panel.dataset.reservationsBound === "true") {
      return;
    }

    panel.dataset.reservationsBound = "true";

    panel.addEventListener("change", function (event) {
      var target = event.target;
      var editor = getEditorState(ctx);

      if (!(target instanceof HTMLElement)) {
        return;
      }

      if (target.hasAttribute("data-res-filter")) {
        var filterKey = target.getAttribute("data-res-filter");
        var nextValue = normalizeText(target.value);
        if (filterKey === "status") {
          editor.filters.status = nextValue;
        } else if (filterKey === "date") {
          editor.filters.date = nextValue;
        } else if (filterKey === "zone") {
          editor.filters.zoneId = nextValue;
        }
        refreshReservationsPanel(ctx, { silent: true });
        return;
      }

      if (target.hasAttribute("data-res-block-field")) {
        var blockField = target.getAttribute("data-res-block-field");
        if (blockField === "zone") {
          editor.blockForm.zoneId = normalizeText(target.value);
        } else if (blockField === "date") {
          editor.blockForm.date = normalizeText(target.value);
        } else if (blockField === "time") {
          editor.blockForm.time = normalizeText(target.value);
        } else if (blockField === "note") {
          editor.blockForm.note = target.value || "";
        }

        if (blockField === "date" || blockField === "zone") {
          normalizeBlockForm(ctx);
          renderReservationsPanel(ctx);
        }
      }
    });

    panel.addEventListener("input", function (event) {
      var target = event.target;
      var editor = getEditorState(ctx);
      if (!(target instanceof HTMLElement) || !target.hasAttribute("data-res-block-field")) {
        return;
      }

      if (target.getAttribute("data-res-block-field") === "note") {
        editor.blockForm.note = target.value || "";
      }
    });

    panel.addEventListener("click", function (event) {
      var refreshButton = event.target.closest("[data-reservations-refresh]");
      if (refreshButton) {
        event.preventDefault();
        refreshReservationsPanel(ctx);
        return;
      }

      var clearFiltersButton = event.target.closest("[data-res-clear-filters]");
      if (clearFiltersButton) {
        event.preventDefault();
        var editor = getEditorState(ctx);
        editor.filters.status = "";
        editor.filters.date = "";
        editor.filters.zoneId = "";
        renderReservationsPanel(ctx);
        refreshReservationsPanel(ctx, { silent: true });
        return;
      }

      var actionButton = event.target.closest("[data-res-status-action]");
      if (actionButton) {
        event.preventDefault();
        handleStatusChange(
          ctx,
          actionButton.getAttribute("data-reservation-id") || "",
          actionButton.getAttribute("data-res-status-action") || ""
        );
        return;
      }

      var deleteButton = event.target.closest("[data-res-block-delete]");
      if (deleteButton) {
        event.preventDefault();
        handleDeleteBlock(ctx, deleteButton.getAttribute("data-res-block-delete") || "");
      }
    });

    panel.addEventListener("submit", function (event) {
      var form = event.target;
      if (!(form instanceof HTMLFormElement) || !form.hasAttribute("data-res-block-form")) {
        return;
      }

      event.preventDefault();
      handleCreateBlock(ctx);
    });
  }

  function openReservationsPanel(ctx, options) {
    options = options || {};
    if (!options.skipRoute) {
      ctx.navigateToRoute("/reservations", { replace: Boolean(options.replaceRoute) });
      return;
    }

    if (!ctx.state.hasDataLoaded) {
      ctx.ensureDataLoaded(false);
      return;
    }

    bindReservationsPanelEvents(ctx);
    getEditorState(ctx);
    ctx.setActivePanel("reservations-editor");
    renderReservationsPanel(ctx);

    ctx.setMenuBrowserStatus("");
    ctx.setItemEditorStatus("");
    ctx.setHomeEditorStatus("");
    ctx.setIngredientsEditorStatus("");
    ctx.setCategoriesEditorStatus("");
    ctx.setRestaurantEditorStatus("");
    if (typeof ctx.setMediaEditorStatus === "function") {
      ctx.setMediaEditorStatus("");
    }
    if (typeof ctx.setPagesEditorStatus === "function") {
      ctx.setPagesEditorStatus("");
    }
    if (typeof ctx.setModalEditorStatus === "function") {
      ctx.setModalEditorStatus("");
    }

    if (!ctx.state.reservationsEditor.loaded || options.refresh !== false) {
      refreshReservationsPanel(ctx, { silent: Boolean(options.silent) });
    }
  }

  ns.reservationsPanel = {
    open: openReservationsPanel,
    render: renderReservationsPanel,
    refresh: refreshReservationsPanel,
  };
})();
