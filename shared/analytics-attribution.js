(function (root, factory) {
  var exported = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = exported;
  }

  root.FigataAnalyticsAttribution = exported;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  var STORAGE_KEY = 'figata.analytics.attribution.v1';
  var VISIT_CONTEXT_RANK = {
    unknown: 0,
    remote: 1,
    events_intent: 2,
    delivery_intent: 2,
    in_restaurant_probable: 3,
    in_restaurant_confirmed_wifi: 4,
  };

  var VANITY_ROUTE_MAP = {
    '/ig': {
      entry_source: 'instagram',
      entry_source_detail: 'vanity_ig',
      source_medium: 'vanity',
      source_campaign: 'menu',
      source_content: 'instagram_bio',
      target_path: '/menu/',
    },
    '/qr': {
      entry_source: 'qr',
      entry_source_detail: 'vanity_qr',
      source_medium: 'vanity',
      source_campaign: 'restaurant',
      source_content: 'shared_qr',
      target_path: '/menu/',
    },
    '/wsp': {
      entry_source: 'whatsapp',
      entry_source_detail: 'vanity_wsp',
      source_medium: 'vanity',
      source_campaign: 'shared_link',
      source_content: 'whatsapp_share',
      target_path: '/menu/',
    },
  };

  function normalizeText(value, fallback) {
    var normalizedFallback = typeof fallback === 'string' ? fallback : '';
    if (typeof value !== 'string') {
      return normalizedFallback;
    }

    var trimmed = value.trim();
    return trimmed || normalizedFallback;
  }

  function getStorage() {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return window.sessionStorage;
      }
    } catch (_error) {
      return null;
    }

    return null;
  }

  function readStoredSnapshot(sessionId) {
    var storage = getStorage();
    if (!storage) {
      return null;
    }

    try {
      var raw = storage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.session_id !== sessionId) {
        return null;
      }
      return parsed;
    } catch (_error) {
      return null;
    }
  }

  function writeStoredSnapshot(snapshot) {
    var storage = getStorage();
    if (!storage) {
      return;
    }

    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch (_error) {
      // ignore storage failures
    }
  }

  function cloneSnapshot(snapshot) {
    return snapshot && typeof snapshot === 'object'
      ? Object.assign({}, snapshot)
      : null;
  }

  function visitContextStrength(value) {
    var normalized = normalizeText(value, 'unknown');
    return VISIT_CONTEXT_RANK[normalized] || 0;
  }

  function shouldPromoteVisitContext(currentValue, nextValue) {
    return visitContextStrength(nextValue) > visitContextStrength(currentValue);
  }

  function mapReferrerSource(referrerHost) {
    if (!referrerHost) {
      return 'direct';
    }
    if (/instagram\.com$/i.test(referrerHost)) {
      return 'instagram';
    }
    if (/wa\.me$|whatsapp\.com$/i.test(referrerHost)) {
      return 'whatsapp';
    }
    if (/google\./i.test(referrerHost)) {
      return 'google';
    }
    return 'referral';
  }

  function normalizePath(pathname) {
    var value = String(pathname || '/').trim() || '/';
    if (!value.startsWith('/')) {
      value = '/' + value;
    }
    if (value.length > 1 && value.endsWith('/')) {
      value = value.slice(0, -1);
    }
    return value;
  }

  function deriveVisitContext(snapshot, route) {
    if (snapshot.visit_context) {
      return snapshot.visit_context;
    }

    if (snapshot.entry_source === 'qr') {
      return 'in_restaurant_probable';
    }

    if (route && route.routeName === 'eventos') {
      return 'events_intent';
    }

    if (snapshot.entry_source === 'delivery') {
      return 'delivery_intent';
    }

    return 'remote';
  }

  function deriveConfidence(snapshot) {
    if (snapshot.visit_context === 'in_restaurant_confirmed_wifi') {
      return 1;
    }

    if (typeof snapshot.visit_context_confidence === 'number') {
      return snapshot.visit_context_confidence;
    }

    if (snapshot.entry_source === 'qr') {
      return 0.9;
    }

    if (snapshot.entry_source === 'instagram' || snapshot.entry_source === 'whatsapp') {
      return 0.75;
    }

    if (snapshot.entry_source === 'direct') {
      return 0.55;
    }

    return 0.65;
  }

  function resolveSnapshot(options) {
    var currentUrl = new URL(String((options && options.url) || 'http://localhost/'));
    var pathname = normalizePath(currentUrl.pathname);
    var route = options && options.route;
    var referrer = String((options && options.referrer) || '').trim();
    var referrerHost = '';

    try {
      referrerHost = referrer ? new URL(referrer).hostname.toLowerCase() : '';
    } catch (_error) {
      referrerHost = '';
    }

    var vanityMatch = VANITY_ROUTE_MAP[pathname];
    var snapshot = {
      session_id: String((options && options.sessionId) || ''),
      entry_source: 'direct',
      entry_source_detail: 'none',
      source_medium: 'none',
      source_campaign: 'none',
      source_content: 'none',
      referrer_host: referrerHost || 'direct',
    };

    if (vanityMatch) {
      Object.assign(snapshot, vanityMatch);
    }

    if (currentUrl.searchParams.has('utm_source')) {
      snapshot.entry_source = currentUrl.searchParams.get('utm_source') || snapshot.entry_source;
      snapshot.entry_source_detail = currentUrl.searchParams.get('utm_content') || snapshot.entry_source_detail;
      snapshot.source_medium = currentUrl.searchParams.get('utm_medium') || snapshot.source_medium;
      snapshot.source_campaign = currentUrl.searchParams.get('utm_campaign') || snapshot.source_campaign;
      snapshot.source_content = currentUrl.searchParams.get('utm_content') || snapshot.source_content;
    } else if (referrerHost) {
      snapshot.entry_source = mapReferrerSource(referrerHost);
      snapshot.entry_source_detail = referrerHost;
      snapshot.source_medium = 'referrer';
      snapshot.source_campaign = 'organic';
      snapshot.source_content = referrerHost;
    }

    if (currentUrl.searchParams.has('fg_source')) {
      snapshot.entry_source = currentUrl.searchParams.get('fg_source') || snapshot.entry_source;
    }
    if (currentUrl.searchParams.has('fg_context')) {
      snapshot.visit_context = currentUrl.searchParams.get('fg_context') || snapshot.visit_context;
    }

    snapshot.visit_context = deriveVisitContext(snapshot, route);
    snapshot.visit_context_confidence = deriveConfidence(snapshot);

    return snapshot;
  }

  function mergeSnapshots(storedSnapshot, resolvedSnapshot) {
    var stored = cloneSnapshot(storedSnapshot) || {};
    var resolved = cloneSnapshot(resolvedSnapshot) || {};
    var merged = Object.assign({}, stored);

    [
      'entry_source',
      'entry_source_detail',
      'source_medium',
      'source_campaign',
      'source_content',
      'referrer_host',
    ].forEach(function (key) {
      if (normalizeText(merged[key]) === 'unknown' || normalizeText(merged[key]) === 'none' || !normalizeText(merged[key])) {
        var nextValue = normalizeText(resolved[key]);
        if (nextValue) {
          merged[key] = nextValue;
        }
      }
    });

    if (shouldPromoteVisitContext(merged.visit_context, resolved.visit_context)) {
      merged.visit_context = normalizeText(resolved.visit_context, merged.visit_context || 'unknown');
      merged.visit_context_confidence = deriveConfidence({
        entry_source: normalizeText(merged.entry_source, normalizeText(resolved.entry_source, 'unknown')),
        visit_context: merged.visit_context,
        visit_context_confidence: resolved.visit_context_confidence,
      });
    }

    if (
      typeof merged.visit_context_confidence !== 'number' ||
      !Number.isFinite(merged.visit_context_confidence)
    ) {
      merged.visit_context_confidence = deriveConfidence(merged);
    }

    return merged;
  }

  function updateSessionSnapshot(options) {
    var sessionId = String((options && options.sessionId) || '').trim();
    if (!sessionId) {
      return null;
    }

    var patch = options && typeof options.patch === 'object' ? options.patch : {};
    var currentSnapshot =
      readStoredSnapshot(sessionId) ||
      resolveSnapshot({
        sessionId: sessionId,
        url: options && options.url,
        referrer: options && options.referrer,
        route: options && options.route,
      });

    var nextSnapshot = Object.assign({}, currentSnapshot, patch);
    nextSnapshot.session_id = sessionId;
    nextSnapshot.visit_context = deriveVisitContext(nextSnapshot, options && options.route);
    nextSnapshot.visit_context_confidence = deriveConfidence(nextSnapshot);
    writeStoredSnapshot(nextSnapshot);
    return nextSnapshot;
  }

  function hydrate(options) {
    var sessionId = String((options && options.sessionId) || '');
    var stored = readStoredSnapshot(sessionId);
    var snapshot = resolveSnapshot(options);
    if (stored) {
      var mergedSnapshot = mergeSnapshots(stored, snapshot);
      writeStoredSnapshot(mergedSnapshot);
      return mergedSnapshot;
    }

    writeStoredSnapshot(snapshot);
    return snapshot;
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    VANITY_ROUTE_MAP: VANITY_ROUTE_MAP,
    hydrate: hydrate,
    mergeSnapshots: mergeSnapshots,
    resolveSnapshot: resolveSnapshot,
    updateSessionSnapshot: updateSessionSnapshot,
  };
});
