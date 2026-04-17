const { normalizeText } = require('./pathing.js');
const { readJsonBody, jsonResponse } = require('./http.js');

const RATE_LIMIT_WINDOW_MS = 30 * 1000;
const LOCK_TTL_MS = 90 * 1000;
const LOCK_KEY = 'publish_lock';

function randomId() {
  return Math.random().toString(36).slice(2, 12) + Math.random().toString(36).slice(2, 8);
}

function buildResponse(statusCode, payload) {
  return jsonResponse(statusCode, payload, {
    'Cache-Control': 'no-store',
  });
}

async function acquirePublishLease(env, requestPayload) {
  if (!env || !env.PUBLISH_COORDINATOR || typeof env.PUBLISH_COORDINATOR.getByName !== 'function') {
    throw new Error('PUBLISH_COORDINATOR binding is required');
  }

  const stub = env.PUBLISH_COORDINATOR.getByName('figata-publish');
  const response = await stub.fetch('https://publish-coordinator.internal/acquire', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestPayload || {}),
  });
  const payload = await response.json().catch(function () { return {}; });
  if (!response.ok) {
    const message = normalizeText(payload && payload.error, 'Unable to acquire publish lock');
    const error = new Error(message);
    error.statusCode = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

async function releasePublishLease(env, leaseId) {
  if (!env || !env.PUBLISH_COORDINATOR || typeof env.PUBLISH_COORDINATOR.getByName !== 'function') {
    return null;
  }

  const stub = env.PUBLISH_COORDINATOR.getByName('figata-publish');
  return stub.fetch('https://publish-coordinator.internal/release', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lease_id: normalizeText(leaseId) }),
  }).catch(function () {
    return null;
  });
}

class PublishCoordinator {
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
    const userKey = normalizeText(payload && payload.user_key, 'anonymous');
    const lockRecord = await this.state.storage.get(LOCK_KEY);

    if (lockRecord && Number(lockRecord.expires_at) > now) {
      return buildResponse(409, {
        error: 'Another publish is already in progress',
        locked_by: normalizeText(lockRecord.user_key, 'unknown'),
        target: normalizeText(lockRecord.target, 'unknown'),
        retry_after_ms: Math.max(0, Number(lockRecord.expires_at) - now),
      });
    }

    const rateKey = 'rate:' + userKey;
    const lastPublishAt = Number(await this.state.storage.get(rateKey) || 0);
    if (lastPublishAt && now - lastPublishAt < RATE_LIMIT_WINDOW_MS) {
      return buildResponse(429, {
        error: 'Publish rate limit exceeded. Try again in a few seconds.',
        retry_after_ms: RATE_LIMIT_WINDOW_MS - (now - lastPublishAt),
      });
    }

    const leaseId = 'lease_' + randomId();
    const nextLock = {
      lease_id: leaseId,
      user_key: userKey,
      target: normalizeText(payload && payload.target, 'preview'),
      acquired_at: new Date(now).toISOString(),
      expires_at: now + LOCK_TTL_MS,
    };

    await this.state.storage.put(LOCK_KEY, nextLock);
    await this.state.storage.put(rateKey, now);
    return buildResponse(200, nextLock);
  }

  async handleRelease(request) {
    const payload = await readJsonBody(request);
    const leaseId = normalizeText(payload && payload.lease_id);
    const lockRecord = await this.state.storage.get(LOCK_KEY);
    if (lockRecord && normalizeText(lockRecord.lease_id) === leaseId) {
      await this.state.storage.delete(LOCK_KEY);
    }

    return buildResponse(200, {
      released: Boolean(lockRecord && normalizeText(lockRecord.lease_id) === leaseId),
      lease_id: leaseId,
    });
  }

  async handleStatus() {
    const lockRecord = await this.state.storage.get(LOCK_KEY);
    return buildResponse(200, {
      lock: lockRecord || null,
    });
  }
}

module.exports = {
  LOCK_TTL_MS,
  PublishCoordinator,
  RATE_LIMIT_WINDOW_MS,
  acquirePublishLease,
  releasePublishLease,
};
