const DEFAULT_JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

function mergeHeaders(baseHeaders, extraHeaders) {
  return Object.assign({}, baseHeaders || {}, extraHeaders || {});
}

function jsonResponse(status, payload, headers) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: mergeHeaders(DEFAULT_JSON_HEADERS, headers),
  });
}

function textResponse(status, body, headers) {
  return new Response(String(body == null ? '' : body), {
    status,
    headers: mergeHeaders({
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    }, headers),
  });
}

function redirectResponse(location, status) {
  return new Response(null, {
    status: status || 302,
    headers: {
      Location: String(location || '/'),
      'Cache-Control': 'no-store',
    },
  });
}

async function readJsonBody(request, options) {
  const source = options && typeof options === 'object' ? options : {};
  const maxBytes = Number.isFinite(Number(source.maxBytes)) ? Math.max(512, Math.round(Number(source.maxBytes))) : (2 * 1024 * 1024);
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > maxBytes) {
    throw new Error('Payload too large');
  }

  const rawText = await request.text();
  if (rawText.length > maxBytes) {
    throw new Error('Payload too large');
  }

  if (!rawText.trim()) {
    return null;
  }

  return JSON.parse(rawText);
}

function getAjaxHeaders() {
  return {
    'X-Requested-With': 'XMLHttpRequest',
  };
}

function noStoreHeaders(extraHeaders) {
  return mergeHeaders({ 'Cache-Control': 'no-store' }, extraHeaders);
}

module.exports = {
  DEFAULT_JSON_HEADERS,
  getAjaxHeaders,
  jsonResponse,
  mergeHeaders,
  noStoreHeaders,
  readJsonBody,
  redirectResponse,
  textResponse,
};
