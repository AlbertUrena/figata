(function (root, factory) {
  var analyticsConfig = typeof module === 'object' && module.exports
    ? require('./analytics-config.js')
    : root.FigataAnalyticsConfig;
  var analyticsTaxonomy = typeof module === 'object' && module.exports
    ? require('./analytics-taxonomy.js')
    : root.FigataAnalyticsTaxonomy;
  var analyticsContract = typeof module === 'object' && module.exports
    ? require('./analytics-contract.js')
    : root.FigataAnalyticsContract;
  var analyticsIdentity = typeof module === 'object' && module.exports
    ? require('./analytics-identity.js')
    : root.FigataAnalyticsIdentity;
  var analyticsAttribution = typeof module === 'object' && module.exports
    ? require('./analytics-attribution.js')
    : root.FigataAnalyticsAttribution;
  var analyticsInternal = typeof module === 'object' && module.exports
    ? require('./analytics-internal.js')
    : root.FigataAnalyticsInternal;

  var exported = factory(
    analyticsConfig,
    analyticsTaxonomy,
    analyticsContract,
    analyticsIdentity,
    analyticsAttribution,
    analyticsInternal
  );

  if (typeof module === 'object' && module.exports) {
    module.exports = exported;
  }

  root.FigataAnalyticsSDK = exported;
  root.FigataAnalytics = exported;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (
  analyticsConfig,
  analyticsTaxonomy,
  analyticsContract,
  analyticsIdentity,
  analyticsAttribution,
  analyticsInternal
) {
  var DEFAULT_OPTIONS = {
    flushIntervalMs: 5000,
    maxBatchSize: 10,
    inactivityMs: analyticsIdentity.DEFAULT_INACTIVITY_MS,
  };

  var state = {
    initialized: false,
    initPromise: null,
    queue: [],
    rejected: [],
    sent: [],
    globalContext: {},
    options: Object.assign({}, DEFAULT_OPTIONS),
    runtime: null,
    identity: null,
    attribution: null,
    internal: null,
    flushTimer: null,
  };

  function nowIso() {
    return new Date().toISOString();
  }

  function getWindowLocation() {
    if (typeof window === 'undefined' || !window.location) {
      return {
        href: 'http://localhost/',
        hostname: 'localhost',
        pathname: '/',
        search: '',
      };
    }

    return window.location;
  }

  function getDocumentReferrer() {
    if (typeof document === 'undefined') {
      return '';
    }
    return String(document.referrer || '');
  }

  function getDocumentTitle() {
    if (typeof document === 'undefined') {
      return '';
    }
    return String(document.title || '').trim();
  }

  function resolveRuntime() {
    var locationRef = getWindowLocation();
    var runtime = analyticsConfig.buildRuntimeContext({
      hostname: locationRef.hostname,
      pathname: locationRef.pathname,
      forcedEnv: readForcedEnvironment(),
    });

    var identityState = analyticsIdentity.ensureSession({
      now: Date.now(),
      inactivityMs: state.options.inactivityMs,
    });

    var internalState = analyticsInternal.resolveState({
      environment: runtime.environment,
      pathname: locationRef.pathname,
      search: locationRef.search,
      forceInternal: Boolean(runtime.route && runtime.route.forceInternal),
    });

    var attributionState = analyticsAttribution.hydrate({
      sessionId: identityState.session.id,
      url: locationRef.href,
      referrer: getDocumentReferrer(),
      route: runtime.route,
    });

    state.runtime = runtime;
    state.identity = identityState;
    state.internal = internalState;
    state.attribution = attributionState;

    return {
      runtime: runtime,
      identity: identityState,
      internal: internalState,
      attribution: attributionState,
    };
  }

  function readForcedEnvironment() {
    if (typeof window !== 'undefined' && window.__FIGATA_ANALYTICS_ENV) {
      return String(window.__FIGATA_ANALYTICS_ENV).trim().toLowerCase();
    }

    if (typeof document !== 'undefined' && document.documentElement) {
      var htmlEnv = document.documentElement.getAttribute('data-analytics-env');
      if (htmlEnv) {
        return htmlEnv.trim().toLowerCase();
      }
    }

    return '';
  }

  function isEnabled(runtime) {
    if (typeof window !== 'undefined' && window.__FIGATA_ANALYTICS_ENABLED === false) {
      return false;
    }

    return Boolean(runtime && runtime.shouldTrackByDefault);
  }

  function resolveEndpoint(runtime) {
    if (typeof window !== 'undefined' && typeof window.__FIGATA_ANALYTICS_ENDPOINT === 'string') {
      return window.__FIGATA_ANALYTICS_ENDPOINT.trim();
    }

    if (!runtime) {
      return '';
    }

    if (runtime.environment === 'dev') {
      return '/__analytics/collect';
    }

    return '/api/analytics/collect';
  }

  function ensureDebugStore() {
    if (typeof window === 'undefined') {
      return [];
    }

    if (!Array.isArray(window.__FIGATA_ANALYTICS_DEBUG_EVENTS)) {
      window.__FIGATA_ANALYTICS_DEBUG_EVENTS = [];
    }

    return window.__FIGATA_ANALYTICS_DEBUG_EVENTS;
  }

  function init(options) {
    if (state.initialized) {
      return Promise.resolve(getState());
    }

    if (state.initPromise) {
      return state.initPromise;
    }

    state.options = Object.assign({}, DEFAULT_OPTIONS, options || {});
    var resolved = resolveRuntime();
    state.options.endpoint = state.options.endpoint || resolveEndpoint(resolved.runtime);
    state.options.enabled = typeof state.options.enabled === 'boolean'
      ? state.options.enabled
      : isEnabled(resolved.runtime);

    bindLifecycleFlush();
    startFlushTimer();
    state.initialized = true;
    state.initPromise = Promise.resolve(getState());
    return state.initPromise;
  }

  function bindLifecycleFlush() {
    if (typeof window === 'undefined' || state.lifecycleBound) {
      return;
    }

    state.lifecycleBound = true;
    window.addEventListener('pagehide', function () {
      flush({ reason: 'pagehide', useBeacon: true });
    });

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') {
        flush({ reason: 'visibility_hidden', useBeacon: true });
      }
    });
  }

  function startFlushTimer() {
    if (state.flushTimer || typeof window === 'undefined') {
      return;
    }

    state.flushTimer = window.setInterval(function () {
      flush({ reason: 'interval' });
    }, state.options.flushIntervalMs);
  }

  function identify(identityContext) {
    state.globalContext = Object.assign({}, state.globalContext, identityContext || {});
    return getState();
  }

  function setContext(nextContext) {
    state.globalContext = Object.assign({}, state.globalContext, nextContext || {});
    return Object.assign({}, state.globalContext);
  }

  function setAttribution(nextAttribution, options) {
    var attributionPatch = nextAttribution && typeof nextAttribution === 'object'
      ? nextAttribution
      : {};
    var resolved = resolveRuntime();
    var locationRef = getWindowLocation();
    var updatedAttribution = analyticsAttribution.updateSessionSnapshot({
      sessionId: resolved.identity && resolved.identity.session ? resolved.identity.session.id : '',
      patch: attributionPatch,
      url: locationRef.href,
      referrer: getDocumentReferrer(),
      route: resolved.runtime ? resolved.runtime.route : null,
    });

    if (updatedAttribution) {
      state.attribution = updatedAttribution;
      if (options && options.context) {
        state.globalContext = Object.assign({}, state.globalContext, options.context);
      }
    }

    return state.attribution ? Object.assign({}, state.attribution) : null;
  }

  function buildBaseEnvelope(eventName, eventProperties) {
    var resolved = resolveRuntime();
    var route = resolved.runtime.route;

    return Object.assign(
      {
        event_id: createEventId(),
        event_name: eventName,
        event_version: 'v1',
        schema_version: analyticsTaxonomy.VERSION,
        occurred_at: nowIso(),
        environment: resolved.runtime.environment,
        page_path: analyticsConfig.normalizePath(getWindowLocation().pathname),
        page_type: route.pageType,
        route_name: route.routeName,
        site_section: route.siteSection,
        visitor_id: resolved.identity.visitor.id,
        session_id: resolved.identity.session.id,
        entry_source: resolved.attribution.entry_source,
        entry_source_detail: resolved.attribution.entry_source_detail,
        source_medium: resolved.attribution.source_medium,
        source_campaign: resolved.attribution.source_campaign,
        source_content: resolved.attribution.source_content,
        visit_context: resolved.attribution.visit_context,
        visit_context_confidence: resolved.attribution.visit_context_confidence,
        is_internal: resolved.internal.isInternal,
        traffic_class: resolved.internal.trafficClass,
      },
      state.globalContext,
      eventProperties || {}
    );
  }

  function createEventId() {
    return 'evt_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function track(eventName, eventProperties) {
    if (!state.initialized) {
      return init().then(function () {
        return track(eventName, eventProperties);
      });
    }

    var payload = buildBaseEnvelope(eventName, eventProperties);
    var validation = analyticsContract.validateEvent(payload);
    var debugStore = ensureDebugStore();

    if (!validation.ok) {
      state.rejected.push({ payload: payload, errors: validation.errors });
      debugStore.push({ status: 'rejected', payload: payload, errors: validation.errors });
      return Promise.resolve({ ok: false, errors: validation.errors, payload: payload });
    }

    state.queue.push(validation.sanitized);
    debugStore.push({ status: 'queued', payload: validation.sanitized, idempotencyKey: validation.idempotencyKey });

    if (state.queue.length >= state.options.maxBatchSize) {
      return flush({ reason: 'max_batch' }).then(function () {
        return { ok: true, payload: validation.sanitized };
      });
    }

    return Promise.resolve({ ok: true, payload: validation.sanitized });
  }

  function flush(options) {
    if (!state.queue.length) {
      return Promise.resolve({ ok: true, flushed: 0 });
    }

    var batch = state.queue.splice(0, state.queue.length);
    var payload = {
      meta: {
        schema_version: analyticsTaxonomy.VERSION,
        reason: String((options && options.reason) || 'manual'),
        transport_name: state.runtime ? state.runtime.transportName : 'unknown',
        environment: state.runtime ? state.runtime.environment : 'unknown',
      },
      events: batch.map(function (eventPayload) {
        return Object.assign({}, eventPayload, { sent_at: nowIso(), transport_name: payloadTransportName() });
      }),
    };

    if (!state.options.enabled || !state.options.endpoint) {
      state.sent = state.sent.concat(payload.events);
      ensureDebugStore().push({ status: 'stored_local', payload: payload });
      return Promise.resolve({ ok: true, flushed: payload.events.length, localOnly: true });
    }

    if (options && options.useBeacon && typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      try {
        var blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        var beaconOk = navigator.sendBeacon(state.options.endpoint, blob);
        if (beaconOk) {
          state.sent = state.sent.concat(payload.events);
          return Promise.resolve({ ok: true, flushed: payload.events.length, transport: 'beacon' });
        }
      } catch (_error) {
        // fall through to fetch
      }
    }

    return fetch(state.options.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).then(function (response) {
      if (!response.ok) {
        throw new Error('Analytics flush failed with status ' + response.status);
      }
      state.sent = state.sent.concat(payload.events);
      return { ok: true, flushed: payload.events.length, transport: 'fetch' };
    }).catch(function (error) {
      state.queue = payload.events.concat(state.queue);
      ensureDebugStore().push({ status: 'flush_failed', error: String(error && error.message ? error.message : error) });
      return { ok: false, flushed: 0, error: String(error && error.message ? error.message : error) };
    });
  }

  function payloadTransportName() {
    return state.runtime ? state.runtime.transportName : 'unknown';
  }

  function getState() {
    return {
      initialized: state.initialized,
      options: Object.assign({}, state.options),
      runtime: state.runtime ? Object.assign({}, state.runtime) : null,
      identity: state.identity ? JSON.parse(JSON.stringify(state.identity)) : null,
      attribution: state.attribution ? Object.assign({}, state.attribution) : null,
      internal: state.internal ? Object.assign({}, state.internal) : null,
      queueSize: state.queue.length,
      sentCount: state.sent.length,
      rejectedCount: state.rejected.length,
      context: Object.assign({}, state.globalContext),
    };
  }

  function resetForTesting() {
    state.queue = [];
    state.rejected = [];
    state.sent = [];
    state.globalContext = {};
    state.initialized = false;
    state.initPromise = null;
    if (state.flushTimer && typeof window !== 'undefined') {
      window.clearInterval(state.flushTimer);
    }
    state.flushTimer = null;
    analyticsIdentity.reset();
  }

  function whenReady() {
    return state.initPromise || init();
  }

  return {
    flush: flush,
    getState: getState,
    identify: identify,
    init: init,
    resetForTesting: resetForTesting,
    setAttribution: setAttribution,
    setContext: setContext,
    track: track,
    whenReady: whenReady,
  };
});
