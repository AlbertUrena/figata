(() => {
  const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

  const ROOT_LIKE_PROTOCOL_PATTERN = /^(?:[a-z]+:|\/\/)/i;

  const baseUrl = (() => {
    try {
      return new URL(document.baseURI || window.location.href);
    } catch (_error) {
      return new URL('/', window.location.origin);
    }
  })();

  const basePath = (() => {
    const pathname = normalizeText(baseUrl.pathname) || '/';
    return pathname.endsWith('/') ? pathname : `${pathname}/`;
  })();

  const stripLeadingPathSegments = (value) =>
    normalizeText(value)
      .replace(/^(\.\/)+/, '')
      .replace(/^\/+/, '');

  const isExternalUrl = (value) => ROOT_LIKE_PROTOCOL_PATTERN.test(normalizeText(value));

  const hasBasePrefix = (value) => {
    if (basePath === '/') {
      return false;
    }

    const normalized = stripLeadingPathSegments(value);
    const normalizedBase = stripLeadingPathSegments(basePath);
    return normalized === normalizedBase.slice(0, -1) || normalized.startsWith(normalizedBase);
  };

  const toSitePath = (value) => {
    const raw = normalizeText(value);

    if (!raw) {
      return '';
    }

    if (isExternalUrl(raw)) {
      return raw;
    }

    if (raw.startsWith('#')) {
      return raw;
    }

    if (hasBasePrefix(raw)) {
      return raw.startsWith('/') ? raw : `/${raw}`;
    }

    const resolved = new URL(stripLeadingPathSegments(raw), baseUrl);
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  };

  const toAbsoluteUrl = (value) => {
    const raw = normalizeText(value);

    if (!raw) {
      return '';
    }

    if (isExternalUrl(raw)) {
      return raw;
    }

    if (raw.startsWith('#')) {
      return new URL(raw, baseUrl).toString();
    }

    if (hasBasePrefix(raw)) {
      return new URL(raw.startsWith('/') ? raw : `/${raw}`, window.location.origin).toString();
    }

    return new URL(stripLeadingPathSegments(raw), baseUrl).toString();
  };

  const stripSitePath = (value) => {
    const raw = normalizeText(value) || '/';
    const normalized = raw.startsWith('/') ? raw : `/${raw}`;

    if (basePath === '/') {
      return normalized;
    }

    const trimmedBase = basePath.slice(0, -1);

    if (normalized === trimmedBase) {
      return '/';
    }

    if (!normalized.startsWith(basePath)) {
      return normalized;
    }

    const stripped = normalized.slice(basePath.length - 1) || '/';
    return stripped.startsWith('/') ? stripped : `/${stripped}`;
  };

  const isHomePath = (value = window.location.pathname || '/') => {
    const stripped = stripSitePath(value);
    return stripped === '/' || stripped === '/index.html';
  };

  window.FigataPublicPaths = {
    basePath,
    baseUrl: new URL(baseUrl.toString()),
    isExternalUrl,
    isHomePath,
    stripSitePath,
    toAbsoluteUrl,
    toSitePath,
  };
})();
