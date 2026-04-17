function normalizeText(value, fallback) {
  if (typeof value !== 'string') {
    return typeof fallback === 'string' ? fallback : '';
  }
  const trimmed = value.trim();
  return trimmed || (typeof fallback === 'string' ? fallback : '');
}

function bytesToBase64(bytes) {
  if (typeof Buffer !== 'undefined' && typeof Buffer.from === 'function') {
    return Buffer.from(bytes).toString('base64');
  }

  var binary = '';
  var source = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  for (var index = 0; index < source.length; index += 1) {
    binary += String.fromCharCode(source[index]);
  }
  return btoa(binary);
}

function base64ToBytes(base64Value) {
  var normalized = normalizeText(base64Value);
  if (!normalized) {
    return new Uint8Array();
  }

  if (typeof Buffer !== 'undefined' && typeof Buffer.from === 'function') {
    return Uint8Array.from(Buffer.from(normalized, 'base64'));
  }

  var binary = atob(normalized);
  var bytes = new Uint8Array(binary.length);
  for (var index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function normalizeBase64Url(value) {
  var normalized = normalizeText(value).replace(/-/g, '+').replace(/_/g, '/');
  if (!normalized) {
    return '';
  }
  var paddingLength = normalized.length % 4;
  return paddingLength ? normalized + '='.repeat(4 - paddingLength) : normalized;
}

function base64UrlToBytes(value) {
  return base64ToBytes(normalizeBase64Url(value));
}

function bytesToBase64Url(bytes) {
  return bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeBase64UrlText(value) {
  var bytes = base64UrlToBytes(value);
  return new TextDecoder().decode(bytes);
}

function decodeBase64UrlJson(value) {
  var text = decodeBase64UrlText(value);
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (_error) {
    return null;
  }
}

function encodeUtf8Base64(value) {
  return bytesToBase64(new TextEncoder().encode(normalizeText(value)));
}

function decodeUtf8Base64(value) {
  return new TextDecoder().decode(base64ToBytes(normalizeText(value)));
}

module.exports = {
  base64ToBytes,
  base64UrlToBytes,
  bytesToBase64,
  bytesToBase64Url,
  decodeBase64UrlJson,
  decodeBase64UrlText,
  decodeUtf8Base64,
  encodeUtf8Base64,
  normalizeBase64Url,
  normalizeText,
};
