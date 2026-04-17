function normalizeText(value, fallback) {
  if (typeof value !== 'string') {
    return typeof fallback === 'string' ? fallback : '';
  }
  const trimmed = value.trim();
  return trimmed || (typeof fallback === 'string' ? fallback : '');
}

function joinPath() {
  return Array.prototype.slice.call(arguments)
    .filter(function (segment) {
      return typeof segment === 'string' && segment.trim();
    })
    .map(function (segment, index) {
      var normalized = String(segment).replace(/\\/g, '/');
      if (!index) {
        return normalized.replace(/\/+$/g, '');
      }
      return normalized.replace(/^\/+/, '').replace(/\/+$/g, '');
    })
    .filter(Boolean)
    .join('/');
}

function toDateKey(value) {
  const timestamp = Date.parse(normalizeText(value));
  if (!Number.isFinite(timestamp)) {
    return 'unknown';
  }

  return new Date(timestamp).toISOString().slice(0, 10);
}

function buildDateRangeKeys(fromDate, toDate, limitDays) {
  const start = Date.parse(normalizeText(fromDate));
  const end = Date.parse(normalizeText(toDate));
  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return [];
  }

  const safeLimit = Number.isFinite(Number(limitDays)) ? Math.max(1, Math.round(Number(limitDays))) : 31;
  const result = [];
  var cursor = new Date(start);
  var boundary = new Date(end);
  cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), cursor.getUTCDate(), 12, 0, 0, 0));
  boundary = new Date(Date.UTC(boundary.getUTCFullYear(), boundary.getUTCMonth(), boundary.getUTCDate(), 12, 0, 0, 0));

  while (cursor.getTime() <= boundary.getTime()) {
    result.push(cursor.toISOString().slice(0, 10));
    if (result.length > safeLimit) {
      throw new Error('Requested date window exceeds the interactive limit of ' + safeLimit + ' days');
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return result;
}

module.exports = {
  buildDateRangeKeys,
  joinPath,
  normalizeText,
  toDateKey,
};
