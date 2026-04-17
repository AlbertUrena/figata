const { buildDateRangeKeys, joinPath, normalizeText, toDateKey } = require('./pathing.js');

function randomSuffix() {
  return Math.random().toString(36).slice(2, 10);
}

function parseDateParts(dateKey) {
  const normalized = normalizeText(dateKey);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return null;
  }
  return normalized.split('-');
}

function buildRawBatchKey(occurredAt, options) {
  const source = options && typeof options === 'object' ? options : {};
  const timestamp = Date.parse(normalizeText(occurredAt, new Date().toISOString()));
  const safeDate = Number.isFinite(timestamp) ? new Date(timestamp) : new Date();
  const dateKey = safeDate.toISOString().slice(0, 10);
  const hourKey = String(safeDate.getUTCHours()).padStart(2, '0');
  const dateParts = parseDateParts(dateKey) || ['unknown', 'unknown', 'unknown'];
  const prefix = normalizeText(source.prefix, 'raw');
  return joinPath(prefix, dateParts[0], dateParts[1], dateParts[2], hourKey, 'batch-' + safeDate.toISOString().replace(/[:.]/g, '-') + '-' + randomSuffix() + '.ndjson');
}

async function writeTextObject(bucket, key, content, options) {
  if (!bucket || typeof bucket.put !== 'function') {
    throw new Error('R2 bucket binding is required');
  }
  await bucket.put(key, content, options || {});
  return key;
}

async function writeJsonObject(bucket, key, payload) {
  return writeTextObject(bucket, key, JSON.stringify(payload, null, 2) + '\n', {
    httpMetadata: { contentType: 'application/json; charset=utf-8' },
  });
}

async function readTextObject(bucket, key) {
  if (!bucket || typeof bucket.get !== 'function') {
    throw new Error('R2 bucket binding is required');
  }
  const object = await bucket.get(key);
  if (!object) {
    return '';
  }
  return await object.text();
}

async function readJsonObject(bucket, key) {
  const rawText = await readTextObject(bucket, key);
  if (!rawText) {
    return null;
  }

  try {
    return JSON.parse(rawText);
  } catch (_error) {
    return null;
  }
}

async function listAllKeys(bucket, prefix) {
  const result = [];
  let cursor;
  do {
    const listing = await bucket.list({ prefix, cursor });
    (listing.objects || []).forEach(function (entry) {
      if (entry && entry.key) {
        result.push(entry.key);
      }
    });
    cursor = listing.truncated ? listing.cursor : undefined;
  } while (cursor);
  return result;
}

async function listRawKeysForWindow(bucket, windowConfig, options) {
  const source = options && typeof options === 'object' ? options : {};
  const prefixRoot = normalizeText(source.prefix, 'raw');
  const dateKeys = buildDateRangeKeys(windowConfig.fromDate, windowConfig.toDate, source.limitDays || 31);
  const allKeys = [];

  for (const dateKey of dateKeys) {
    const dateParts = parseDateParts(dateKey);
    if (!dateParts) {
      continue;
    }
    const prefix = joinPath(prefixRoot, dateParts[0], dateParts[1], dateParts[2]) + '/';
    const keys = await listAllKeys(bucket, prefix);
    keys.forEach(function (key) {
      allKeys.push(key);
    });
  }

  return allKeys.sort();
}

module.exports = {
  buildRawBatchKey,
  listAllKeys,
  listRawKeysForWindow,
  parseDateParts,
  readJsonObject,
  readTextObject,
  writeJsonObject,
  writeTextObject,
  toDateKey,
};
