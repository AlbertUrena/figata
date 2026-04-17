const reservationsContract = require('../../shared/reservations-contract.js');
const reservationsRuntime = require('../../shared/reservations-runtime.js');
const http = require('./http.js');
const reservationLock = require('./reservation-lock.js');
const notifications = require('./reservations-notifications.js');
const repository = require('./reservations-repository.js');
const { normalizeText } = require('./pathing.js');

const CONFIG_PATH = '/data/reservations-config.json';
const DEFAULT_TIMEZONE = 'America/Santo_Domingo';
const DEFAULT_COUNTRY_CODE = '+1';
const MAX_NOTES_LENGTH_FALLBACK = 300;
const MAX_NAME_LENGTH = 120;

const assetConfigCache = new WeakMap();

function ReservationsServiceError(statusCode, payload) {
  this.name = 'ReservationsServiceError';
  this.statusCode = Number(statusCode || 500);
  this.payload = payload || { error: 'Reservations service error' };
  this.message = normalizeText(this.payload && this.payload.error, 'Reservations service error');
}

ReservationsServiceError.prototype = Object.create(Error.prototype);
ReservationsServiceError.prototype.constructor = ReservationsServiceError;

function randomId(prefix) {
  var raw = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID().replace(/-/g, '')
    : (Math.random().toString(36).slice(2) + Date.now().toString(36));
  return normalizeText(prefix, 'res') + '_' + raw.slice(0, 20);
}

function nowIso(options) {
  var now = options && options.now instanceof Date ? options.now : new Date();
  return now.toISOString();
}

function assert(condition, statusCode, payload) {
  if (!condition) {
    throw new ReservationsServiceError(statusCode, payload);
  }
}

async function readJsonResponse(response) {
  if (!response || typeof response.json !== 'function') {
    throw new Error('Invalid response');
  }
  return response.json();
}

async function loadReservationsConfigFromAssets(env, requestUrl) {
  if (!env || !env.ASSETS || typeof env.ASSETS.fetch !== 'function') {
    throw new Error('ASSETS binding is required to load reservations config');
  }

  if (assetConfigCache.has(env.ASSETS)) {
    return assetConfigCache.get(env.ASSETS);
  }

  var promise = (async function () {
    var origin = requestUrl ? new URL(requestUrl).origin : 'https://figata.internal';
    var response = await env.ASSETS.fetch(new Request(origin + CONFIG_PATH));
    if (!response || !response.ok) {
      throw new Error('Unable to load reservations config from assets');
    }
    var payload = await readJsonResponse(response);
    var report = reservationsContract.validateReservationsContract(payload || {});
    if (report && Array.isArray(report.errors) && report.errors.length) {
      throw new Error('Reservations config is invalid: ' + report.errors.join(' | '));
    }
    return payload;
  })();

  assetConfigCache.set(env.ASSETS, promise);
  return promise;
}

function loadReservationsConfigFromObject(payload) {
  var report = reservationsContract.validateReservationsContract(payload || {});
  if (report && Array.isArray(report.errors) && report.errors.length) {
    throw new Error('Reservations config is invalid: ' + report.errors.join(' | '));
  }
  return payload;
}

function getPublicStatusIds() {
  return ['pending', 'confirmed', 'cancelled', 'rejected', 'no_show'];
}

function normalizePartySize(value) {
  var numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  return Math.max(0, Math.round(numeric));
}

function normalizeName(value) {
  return normalizeText(value).slice(0, MAX_NAME_LENGTH);
}

function normalizeNotes(config, value) {
  var maxLength = Number(config && config.bookingRules && config.bookingRules.notesMaxLength || MAX_NOTES_LENGTH_FALLBACK);
  if (!Number.isFinite(maxLength) || maxLength <= 0) {
    maxLength = MAX_NOTES_LENGTH_FALLBACK;
  }
  return normalizeText(value).slice(0, maxLength);
}

function normalizeWhatsappNumber(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 32);
}

function formatWhatsappDisplay(countryCode, number) {
  var normalizedCountry = normalizeText(countryCode, DEFAULT_COUNTRY_CODE);
  var digits = normalizeWhatsappNumber(number);
  if (!digits) {
    return normalizedCountry;
  }

  if (digits.length === 10) {
    return normalizedCountry + ' ' + digits.slice(0, 3) + '-' + digits.slice(3, 6) + '-' + digits.slice(6);
  }

  return normalizedCountry + ' ' + digits;
}

function buildSlotKey(date, time, zoneId) {
  return [normalizeText(date), normalizeText(time), normalizeText(zoneId)].join('|');
}

function getTimezone(config) {
  return normalizeText(config && config.timezone, DEFAULT_TIMEZONE);
}

function getNowContext(config, options) {
  if (options && options.now && typeof options.now === 'object') {
    return options.now;
  }
  return reservationsRuntime.getNowInTimezone(getTimezone(config));
}

function getStatusPresentation(config, statusId) {
  var status = reservationsRuntime.getStatusById(config, statusId) || {};
  return {
    id: normalizeText(statusId),
    label: normalizeText(status.publicLabel || status.label || statusId),
    tone: normalizeText(status.tone, 'muted'),
  };
}

function enrichReservation(config, reservation) {
  if (!reservation) {
    return null;
  }
  var zone = reservationsRuntime.getZoneById(config, reservation.zone_id);
  var status = getStatusPresentation(config, reservation.status);
  return Object.assign({}, reservation, {
    zone_label: normalizeText(zone && zone.label, reservation.zone_id),
    status_label: status.label,
    status_tone: status.tone,
  });
}

async function evaluateZoneAvailability(config, repo, params) {
  var zones = reservationsRuntime.getEnabledZones(config);
  var results = [];
  var partySize = normalizePartySize(params && params.party_size);
  var requestedDate = normalizeText(params && params.date);
  var requestedTime = normalizeText(params && params.time);
  var now = getNowContext(config, params && params.options);

  zones.forEach(function (zone) {
    results.push({
      id: normalizeText(zone.id),
      label: normalizeText(zone.label),
      available: false,
      reason: 'unknown',
      reservations_remaining: 0,
      covers_remaining: 0,
    });
  });

  assert(reservationsRuntime.isIsoDate(requestedDate), 400, {
    error: 'La fecha de la reserva no es válida.',
    field: 'date',
  });
  assert(reservationsRuntime.isTimeValue(requestedTime), 400, {
    error: 'La hora de la reserva no es válida.',
    field: 'time',
  });
  assert(partySize > 0, 400, {
    error: 'La cantidad de comensales debe ser mayor que cero.',
    field: 'party_size',
  });
  assert(reservationsRuntime.isTimeSelectable(config, requestedDate, requestedTime), 422, {
    error: 'Esa hora no está disponible dentro del horario operativo.',
    code: 'time_outside_service_window',
  });
  assert(reservationsRuntime.isInsideBookingWindow(config, requestedDate, requestedTime, { now: now }), 422, {
    error: 'Ese horario cae fuera de la ventana permitida para reservar.',
    code: 'outside_booking_window',
  });

  for (var index = 0; index < results.length; index += 1) {
    var result = results[index];
    var zone = reservationsRuntime.getZoneById(config, result.id);
    if (!zone) {
      continue;
    }

    if (!reservationsRuntime.isPartySizeAllowed(config, partySize, result.id)) {
      result.reason = 'party_size_not_allowed';
      continue;
    }

    var block = await repo.getBlockForSlot({
      date: requestedDate,
      time: requestedTime,
      zone_id: result.id,
    });
    if (block) {
      result.reason = 'blocked';
      continue;
    }

    var limits = reservationsRuntime.getSlotLimits(config, result.id);
    var occupancy = await repo.getOccupancyForSlot({
      date: requestedDate,
      time: requestedTime,
      zone_id: result.id,
    });
    var reservationsRemaining = Math.max(0, Number(limits.maxReservationsPerSlot || 0) - Number(occupancy.reservations_count || 0));
    var coversRemaining = Math.max(0, Number(limits.maxCoversPerSlot || 0) - Number(occupancy.covers_count || 0));

    result.reservations_remaining = reservationsRemaining;
    result.covers_remaining = coversRemaining;

    if (!reservationsRemaining || coversRemaining < partySize) {
      result.reason = 'slot_full';
      continue;
    }

    result.available = true;
    result.reason = 'available';
  }

  return {
    date: requestedDate,
    time: requestedTime,
    party_size: partySize,
    zones: results,
    timezone: getTimezone(config),
    checked_at: nowIso(),
  };
}

async function getAvailability(config, repo, params) {
  return evaluateZoneAvailability(config, repo, params);
}

function buildReservationPayload(config, input, options) {
  var actor = normalizeText(options && options.actor, 'public-web');
  var isoNow = nowIso(options);
  var partySize = normalizePartySize(input && input.party_size);
  var date = normalizeText(input && input.date);
  var time = normalizeText(input && input.time);
  var zoneId = normalizeText(input && input.zone_id);
  var name = normalizeName(input && input.customer_name);
  var countryCode = normalizeText(input && input.whatsapp_country_code, DEFAULT_COUNTRY_CODE);
  var whatsappNumber = normalizeWhatsappNumber(input && input.whatsapp_number);
  var notes = normalizeNotes(config, input && input.notes);
  var confirmationMode = normalizeText(config && config.bookingRules && config.bookingRules.confirmationMode, 'manual');

  assert(name, 400, { error: 'El nombre es obligatorio.', field: 'customer_name' });
  assert(whatsappNumber.length >= 10, 400, { error: 'El Whatsapp debe tener al menos 10 dígitos.', field: 'whatsapp_number' });
  assert(partySize > 0, 400, { error: 'Debes indicar la cantidad de comensales.', field: 'party_size' });
  assert(reservationsRuntime.getZoneById(config, zoneId), 400, { error: 'La zona seleccionada no es válida.', field: 'zone_id' });
  assert(reservationsRuntime.isPartySizeAllowed(config, partySize, zoneId), 422, {
    error: 'Esa cantidad de comensales no aplica para la zona seleccionada.',
    field: 'party_size',
    code: 'party_size_not_allowed',
  });

  return {
    id: randomId('reservation'),
    reservation_code: randomId('fg').replace(/^fg_/, 'FG-').slice(0, 10).toUpperCase(),
    customer_name: name,
    whatsapp_country_code: countryCode,
    whatsapp_number: whatsappNumber,
    whatsapp_display: formatWhatsappDisplay(countryCode, whatsappNumber),
    party_size: partySize,
    reservation_date: date,
    reservation_time: time,
    zone_id: zoneId,
    notes: notes,
    status: confirmationMode === 'automatic' ? 'confirmed' : 'pending',
    source: normalizeText(input && input.source, 'web'),
    confirmation_mode: confirmationMode,
    internal_note: '',
    request_snapshot: {
      source: normalizeText(input && input.source, 'web'),
      submitted_at: isoNow,
    },
    created_at: isoNow,
    updated_at: isoNow,
    status_updated_at: isoNow,
    status_updated_by: actor,
  };
}

async function createReservation(config, repo, env, input, options) {
  var payload = buildReservationPayload(config, input, options);
  var slotKey = buildSlotKey(payload.reservation_date, payload.reservation_time, payload.zone_id);
  var lease = null;

  try {
    lease = await reservationLock.acquireReservationLease(env, slotKey, {
      actor: normalizeText(options && options.actor, 'public-web'),
      action: 'create_reservation',
    });
  } catch (error) {
    throw new ReservationsServiceError(error.statusCode || 409, error.payload || {
      error: error && error.message ? error.message : 'No pudimos apartar ese horario ahora mismo.',
    });
  }

  try {
    var availability = await evaluateZoneAvailability(config, repo, {
      date: payload.reservation_date,
      time: payload.reservation_time,
      party_size: payload.party_size,
      options: options,
    });
    var zoneAvailability = availability.zones.find(function (entry) {
      return entry.id === payload.zone_id;
    });

    assert(zoneAvailability && zoneAvailability.available, 409, {
      error: 'Ese horario ya no está disponible en la zona seleccionada.',
      code: normalizeText(zoneAvailability && zoneAvailability.reason, 'slot_unavailable'),
      availability: availability,
    });

    var reservation = await repo.createReservation(payload);
    var enriched = enrichReservation(config, reservation);

    if (repo.insertNotificationLog) {
      var notificationResult = await notifications.sendRestaurantReservationNotification(env || {}, enriched || reservation);
      await repo.insertNotificationLog(
        notifications.buildNotificationLog(reservation.id, notificationResult, nowIso(options))
      );
    }

    return {
      reservation: enriched,
      status: getStatusPresentation(config, reservation.status),
    };
  } finally {
    if (lease && lease.lease_id) {
      await reservationLock.releaseReservationLease(env, slotKey, lease.lease_id);
    }
  }
}

function summarizeReservations(list) {
  var summary = {
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    rejected: 0,
    no_show: 0,
  };

  (Array.isArray(list) ? list : []).forEach(function (entry) {
    summary.total += 1;
    var key = normalizeText(entry && entry.status);
    if (Object.prototype.hasOwnProperty.call(summary, key)) {
      summary[key] += 1;
    }
  });

  return summary;
}

async function listReservations(config, repo, filters) {
  var reservations = await repo.listReservations(filters || {});
  var enriched = reservations.map(function (entry) {
    return enrichReservation(config, entry);
  }).filter(Boolean);

  return {
    reservations: enriched,
    summary: summarizeReservations(enriched),
  };
}

async function updateReservationStatus(config, repo, reservationId, input, options) {
  var nextStatus = normalizeText(input && input.status);
  var validStatuses = getPublicStatusIds();

  assert(validStatuses.indexOf(nextStatus) !== -1, 400, {
    error: 'El estado solicitado no es válido.',
    field: 'status',
  });

  var existing = await repo.getReservationById(reservationId);
  assert(existing, 404, { error: 'No encontramos esa reserva.' });

  var updated = await repo.updateReservationStatus(reservationId, {
    status: nextStatus,
    internal_note: normalizeText(input && input.internal_note),
    updated_at: nowIso(options),
    status_updated_at: nowIso(options),
    status_updated_by: normalizeText(options && options.actor, 'admin'),
  });

  return {
    reservation: enrichReservation(config, updated),
  };
}

async function createBlock(config, repo, env, input, options) {
  var date = normalizeText(input && input.date);
  var time = normalizeText(input && input.time);
  var zoneId = normalizeText(input && input.zone_id);

  assert(reservationsRuntime.isIsoDate(date), 400, {
    error: 'La fecha del bloqueo no es válida.',
    field: 'date',
  });
  assert(reservationsRuntime.isTimeValue(time), 400, {
    error: 'La hora del bloqueo no es válida.',
    field: 'time',
  });
  assert(reservationsRuntime.getZoneById(config, zoneId), 400, {
    error: 'La zona del bloqueo no es válida.',
    field: 'zone_id',
  });
  assert(reservationsRuntime.isTimeSelectable(config, date, time), 422, {
    error: 'Solo puedes bloquear horarios que existan dentro del servicio.',
    field: 'time',
  });

  var slotKey = buildSlotKey(date, time, zoneId);
  var lease = null;

  try {
    lease = await reservationLock.acquireReservationLease(env, slotKey, {
      actor: normalizeText(options && options.actor, 'admin'),
      action: 'create_block',
    });
  } catch (error) {
    throw new ReservationsServiceError(error.statusCode || 409, error.payload || {
      error: error && error.message ? error.message : 'Ese horario está ocupado por otra operación.',
    });
  }

  try {
    var block = await repo.upsertBlock({
      id: randomId('block'),
      reservation_date: date,
      reservation_time: time,
      zone_id: zoneId,
      note: normalizeText(input && input.note),
      created_at: nowIso(options),
      created_by: normalizeText(options && options.actor, 'admin'),
      updated_at: nowIso(options),
    });

    return {
      block: Object.assign({}, block, {
        zone_label: normalizeText((reservationsRuntime.getZoneById(config, block.zone_id) || {}).label, block.zone_id),
      }),
    };
  } finally {
    if (lease && lease.lease_id) {
      await reservationLock.releaseReservationLease(env, slotKey, lease.lease_id);
    }
  }
}

async function listBlocks(config, repo, filters) {
  var blocks = await repo.listBlocks(filters || {});
  return {
    blocks: blocks.map(function (block) {
      return Object.assign({}, block, {
        zone_label: normalizeText((reservationsRuntime.getZoneById(config, block.zone_id) || {}).label, block.zone_id),
      });
    }),
  };
}

async function deleteBlock(repo, blockId) {
  var removed = await repo.deleteBlock(blockId);
  assert(removed, 404, {
    error: 'No encontramos ese bloqueo.',
  });
  return { block: removed };
}

function createD1Repository(db) {
  return {
    createReservation: function (payload) { return repository.createReservation(db, payload); },
    deleteBlock: function (blockId) { return repository.deleteBlock(db, blockId); },
    getBlockForSlot: function (slot) { return repository.getBlockForSlot(db, slot); },
    getOccupancyForSlot: function (slot) { return repository.getOccupancyForSlot(db, slot); },
    getReservationById: function (reservationId) { return repository.getReservationById(db, reservationId); },
    insertNotificationLog: function (payload) { return repository.insertNotificationLog(db, payload); },
    listBlocks: function (filters) { return repository.listBlocks(db, filters); },
    listReservations: function (filters) { return repository.listReservations(db, filters); },
    upsertBlock: function (payload) { return repository.upsertBlock(db, payload); },
    updateReservationStatus: function (reservationId, payload) { return repository.updateReservationStatus(db, reservationId, payload); },
  };
}

function jsonErrorResponse(error) {
  if (error instanceof ReservationsServiceError) {
    return http.jsonResponse(error.statusCode, error.payload);
  }
  return http.jsonResponse(500, {
    error: error && error.message ? error.message : 'Unexpected reservations error',
  });
}

module.exports = {
  ReservationsServiceError,
  createBlock,
  createD1Repository,
  createReservation,
  deleteBlock,
  formatWhatsappDisplay,
  getAvailability,
  jsonErrorResponse,
  listBlocks,
  listReservations,
  loadReservationsConfigFromAssets,
  loadReservationsConfigFromObject,
  updateReservationStatus,
};
