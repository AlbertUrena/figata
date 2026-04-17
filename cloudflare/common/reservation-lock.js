const { normalizeText } = require('./pathing.js');
const { readJsonBody, jsonResponse } = require('./http.js');

const LOCK_TTL_MS = 20 * 1000;
const LOCK_KEY = 'reservation_lock';

function randomId() {
  return Math.random().toString(36).slice(2, 12) + Math.random().toString(36).slice(2, 8);
}

function buildResponse(statusCode, payload) {
  return jsonResponse(statusCode, payload, {
    'Cache-Control': 'no-store',
  });
}

function buildSlotLockName(slotKey) {
  return normalizeText(slotKey, 'unknown-slot');
}

async function acquireReservationLease(env, slotKey, payload) {
  if (!env || !env.RESERVATION_COORDINATOR || typeof env.RESERVATION_COORDINATOR.getByName !== 'function') {
    throw new Error('RESERVATION_COORDINATOR binding is required');
  }

  const stub = env.RESERVATION_COORDINATOR.getByName(buildSlotLockName(slotKey));
  const response = await stub.fetch('https://reservation-coordinator.internal/acquire', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {}),
  });
  const lease = await response.json().catch(function () { return {}; });
  if (!response.ok) {
    const error = new Error(normalizeText(lease && lease.error, 'Unable to acquire reservation lock'));
    error.statusCode = response.status;
    error.payload = lease;
    throw error;
  }
  return lease;
}

async function releaseReservationLease(env, slotKey, leaseId) {
  if (!env || !env.RESERVATION_COORDINATOR || typeof env.RESERVATION_COORDINATOR.getByName !== 'function') {
    return null;
  }

  const stub = env.RESERVATION_COORDINATOR.getByName(buildSlotLockName(slotKey));
  return stub.fetch('https://reservation-coordinator.internal/release', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lease_id: normalizeText(leaseId) }),
  }).catch(function () {
    return null;
  });
}

class ReservationCoordinator {
  constructor(state) {
    this.state = state;
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (request.method !== 'POST') {
      return buildResponse(405, { error: 'Method not allowed' });
    }

    if (url.pathname === '/acquire') {
      return this.handleAcquire(request);
    }
    if (url.pathname === '/release') {
      return this.handleRelease(request);
    }
    if (url.pathname === '/status') {
      return this.handleStatus();
    }

    return buildResponse(404, { error: 'Not found' });
  }

  async handleAcquire(request) {
    const payload = await readJsonBody(request);
    const now = Date.now();
    const currentLock = await this.state.storage.get(LOCK_KEY);

    if (currentLock && Number(currentLock.expires_at) > now) {
      return buildResponse(409, {
        error: 'This reservation slot is busy right now. Try again in a moment.',
        locked_by: normalizeText(currentLock.actor, 'unknown'),
        action: normalizeText(currentLock.action, 'unknown'),
        retry_after_ms: Math.max(0, Number(currentLock.expires_at) - now),
      });
    }

    const lease = {
      lease_id: 'lease_' + randomId(),
      actor: normalizeText(payload && payload.actor, 'anonymous'),
      action: normalizeText(payload && payload.action, 'unknown'),
      acquired_at: new Date(now).toISOString(),
      expires_at: now + LOCK_TTL_MS,
    };

    await this.state.storage.put(LOCK_KEY, lease);
    return buildResponse(200, lease);
  }

  async handleRelease(request) {
    const payload = await readJsonBody(request);
    const leaseId = normalizeText(payload && payload.lease_id);
    const currentLock = await this.state.storage.get(LOCK_KEY);
    if (currentLock && normalizeText(currentLock.lease_id) === leaseId) {
      await this.state.storage.delete(LOCK_KEY);
    }

    return buildResponse(200, {
      released: Boolean(currentLock && normalizeText(currentLock.lease_id) === leaseId),
      lease_id: leaseId,
    });
  }

  async handleStatus() {
    return buildResponse(200, {
      lock: await this.state.storage.get(LOCK_KEY) || null,
    });
  }
}

module.exports = {
  LOCK_TTL_MS,
  ReservationCoordinator,
  acquireReservationLease,
  releaseReservationLease,
};
