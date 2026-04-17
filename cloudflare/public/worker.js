const analyticsContract = require('../../shared/analytics-contract.js');
const reservationsService = require('../common/reservations-service.js');
const turnstile = require('../common/turnstile.js');
const http = require('../common/http.js');
const r2Storage = require('../common/r2-storage.js');
const { normalizeText } = require('../common/pathing.js');

const MAX_BATCH_EVENTS = 50;
const MAX_BODY_SIZE_BYTES = 512 * 1024;

function parseCollectPayload(payload) {
  const source = payload && typeof payload === 'object' ? payload : {};
  const events = Array.isArray(source.events) ? source.events : [];
  const meta = source.meta && typeof source.meta === 'object' ? source.meta : {};
  return {
    meta: meta,
    events: events.slice(0, MAX_BATCH_EVENTS),
  };
}

function summarizeValidationResults(results) {
  const accepted = [];
  const rejected = [];

  results.forEach(function (result, index) {
    if (result && result.ok) {
      accepted.push(result.payload);
      return;
    }

    rejected.push({
      index: index,
      errors: result && result.errors ? result.errors.slice(0, 6) : ['Unknown validation error'],
    });
  });

  return {
    accepted: accepted,
    rejected: rejected,
  };
}

async function handleAnalyticsCollect(request, env) {
  if (request.method !== 'POST') {
    return http.jsonResponse(405, { error: 'Method not allowed' });
  }

  let payload;
  try {
    payload = await http.readJsonBody(request, { maxBytes: MAX_BODY_SIZE_BYTES });
  } catch (error) {
    return http.jsonResponse(error && error.message === 'Payload too large' ? 413 : 400, {
      error: error && error.message ? error.message : 'Invalid analytics payload',
    });
  }

  const normalizedPayload = parseCollectPayload(payload);
  if (!normalizedPayload.events.length) {
    return http.jsonResponse(400, { error: 'Analytics payload must include at least one event' });
  }

  const validationResults = normalizedPayload.events.map(function (eventPayload) {
    const validation = analyticsContract.validateEvent(eventPayload);
    return validation.ok
      ? { ok: true, payload: validation.sanitized }
      : { ok: false, errors: validation.errors };
  });
  const summary = summarizeValidationResults(validationResults);
  if (!summary.accepted.length) {
    return http.jsonResponse(422, {
      error: 'All analytics events were rejected',
      rejected: summary.rejected,
    });
  }

  const bucket = env && env.ANALYTICS_BUCKET;
  if (!bucket || typeof bucket.put !== 'function') {
    return http.jsonResponse(500, {
      error: 'ANALYTICS_BUCKET binding is required',
    });
  }

  const occurredAt = normalizeText(summary.accepted[0] && summary.accepted[0].occurred_at, new Date().toISOString());
  const key = r2Storage.buildRawBatchKey(occurredAt, {
    prefix: normalizeText(env && env.FIGATA_ANALYTICS_RAW_PREFIX, 'raw'),
  });
  const ndjson = summary.accepted.map(function (entry) {
    return JSON.stringify(entry);
  }).join('\n') + '\n';
  await r2Storage.writeTextObject(bucket, key, ndjson, {
    httpMetadata: { contentType: 'application/x-ndjson; charset=utf-8' },
  });

  return http.jsonResponse(202, {
    accepted: summary.accepted.length,
    rejected: summary.rejected.length,
    rejected_events: summary.rejected,
    key: key,
    environment: normalizeText(normalizedPayload.meta.environment, 'unknown'),
    reason: normalizeText(normalizedPayload.meta.reason, 'manual'),
  });
}

function getRequestPartySize(url) {
  return Number(url.searchParams.get('party_size') || 0);
}

async function buildReservationsDeps(env, request) {
  const config = await reservationsService.loadReservationsConfigFromAssets(env, request.url);
  return {
    config: config,
    repo: reservationsService.createD1Repository(env && env.RESERVATIONS_DB),
  };
}

async function handleReservationsAvailability(request, env) {
  if (request.method !== 'GET') {
    return http.jsonResponse(405, { error: 'Method not allowed' });
  }

  try {
    const deps = await buildReservationsDeps(env, request);
    const url = new URL(request.url);
    const payload = await reservationsService.getAvailability(deps.config, deps.repo, {
      date: normalizeText(url.searchParams.get('date')),
      time: normalizeText(url.searchParams.get('time')),
      party_size: getRequestPartySize(url),
    });
    return http.jsonResponse(200, payload);
  } catch (error) {
    return reservationsService.jsonErrorResponse(error);
  }
}

async function handleCreateReservation(request, env) {
  if (request.method !== 'POST') {
    return http.jsonResponse(405, { error: 'Method not allowed' });
  }

  let payload;
  try {
    payload = await http.readJsonBody(request, { maxBytes: MAX_BODY_SIZE_BYTES });
  } catch (error) {
    return http.jsonResponse(error && error.message === 'Payload too large' ? 413 : 400, {
      error: error && error.message ? error.message : 'Invalid reservation payload',
    });
  }

  try {
    const turnstileResult = await turnstile.validateTurnstileToken(
      env,
      payload && payload.turnstile_token,
      request
    );
    if (!turnstileResult.ok) {
      return http.jsonResponse(turnstileResult.statusCode || 400, turnstileResult.payload || {
        error: 'No pudimos validar la verificación de seguridad.',
      });
    }

    const deps = await buildReservationsDeps(env, request);
    const result = await reservationsService.createReservation(
      deps.config,
      deps.repo,
      env,
      payload || {},
      { actor: 'public-web' }
    );
    return http.jsonResponse(201, result);
  } catch (error) {
    return reservationsService.jsonErrorResponse(error);
  }
}

async function handleRequest(request, env) {
  const url = new URL(request.url);

  if (url.pathname === '/api/analytics/collect') {
    return handleAnalyticsCollect(request, env);
  }
  if (url.pathname === '/api/reservations/availability') {
    return handleReservationsAvailability(request, env);
  }
  if (url.pathname === '/api/reservations') {
    return handleCreateReservation(request, env);
  }

  return env.ASSETS.fetch(request);
}

module.exports = {
  default: {
    fetch: handleRequest,
  },
  handleAnalyticsCollect,
  handleCreateReservation,
  handleReservationsAvailability,
  handleRequest,
};
