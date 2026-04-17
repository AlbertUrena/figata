(function (root, factory) {
  var analyticsConfig = typeof module === 'object' && module.exports
    ? require('./analytics-config.js')
    : root.FigataAnalyticsConfig;
  var analyticsGovernance = typeof module === 'object' && module.exports
    ? require('./analytics-governance.js')
    : root.FigataAnalyticsGovernance;

  var exported = factory(analyticsConfig, analyticsGovernance, root);

  if (typeof module === 'object' && module.exports) {
    module.exports = exported;
  }

  root.FigataAnalyticsReplay = exported;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (
  analyticsConfig,
  analyticsGovernance,
  root
) {
  var VERSION = 'figata.analytics.replay.v1';
  var BROWSER = typeof window !== 'undefined' && typeof document !== 'undefined';
  var providers = {
    clarity: {
      buildScriptUrl: function (config) {
        if (config.scriptUrl) {
          return config.scriptUrl;
        }
        return config.projectId
          ? 'https://www.clarity.ms/tag/' + encodeURIComponent(config.projectId)
          : '';
      },
      ensureApi: function () {
        if (typeof window.clarity === 'function') {
          return window.clarity;
        }

        var clarity = function () {
          clarity.q = clarity.q || [];
          clarity.q.push(arguments);
        };

        clarity.q = [];
        clarity.__figataReplayShim = true;
        window.clarity = clarity;
        return clarity;
      },
      applyConsent: function (config) {
        var clarity = providers.clarity.ensureApi();
        if (!config || !config.consentV2) {
          return;
        }

        var consent = config.consentV2;
        if (!consent.analytics_Storage || !consent.ad_Storage) {
          return;
        }

        clarity('consentv2', {
          analytics_Storage: consent.analytics_Storage,
          ad_Storage: consent.ad_Storage,
        });
      },
      syncContext: function (plan, context) {
        var clarity = providers.clarity.ensureApi();
        if (!context || !context.pagePath) {
          return;
        }

        clarity('identify', context.visitorId || '', context.sessionId || '', buildProviderPageId(context));
        clarity('set', 'route_name', context.routeName || 'unknown');
        clarity('set', 'page_type', context.pageType || 'unknown');
        clarity('set', 'page_path', context.pagePath || '/');
        clarity('set', 'entry_source', context.entrySource || 'unknown');
        clarity('set', 'visit_context', context.visitContext || 'unknown');
        clarity('set', 'traffic_class', context.trafficClass || 'unknown');
        clarity('set', 'visitor_type', context.visitorType || 'new');
        clarity('set', 'sample_key', plan && plan.effectiveSampleKey ? plan.effectiveSampleKey : 'none');
        clarity('set', 'sample_mode', plan && plan.providerCaptureMode ? plan.providerCaptureMode : 'unknown');
      },
      markReplaySampled: function () {
        var clarity = providers.clarity.ensureApi();
        clarity('event', 'figata_replay_sampled');
      },
      maskSensitiveFields: function () {
        Array.prototype.slice.call(
          document.querySelectorAll('input, textarea, select, [contenteditable="true"], [data-analytics-sensitive]')
        ).forEach(function (element) {
          if (!(element instanceof HTMLElement)) {
            return;
          }

          if (!element.hasAttribute('data-clarity-unmask')) {
            element.setAttribute('data-clarity-mask', 'true');
          }
        });
      },
    },
  };

  var runtimeState = {
    initialized: false,
    initPromise: null,
    config: normalizeConfig(null),
    plan: null,
    context: null,
    status: 'idle',
    providerLoaded: false,
    providerLoading: false,
    providerScheduled: false,
    providerScriptUrl: '',
    providerError: '',
    lastRefreshReason: 'boot',
    replayEventTracked: false,
    historyBound: false,
    pageContextBound: false,
  };

  function normalizeText(value, fallback) {
    var normalizedFallback = typeof fallback === 'string' ? fallback : '';
    if (typeof value !== 'string') {
      return normalizedFallback;
    }

    var trimmed = value.trim();
    return trimmed || normalizedFallback;
  }

  function omitEmptyStringValues(input) {
    if (!input || typeof input !== 'object') {
      return {};
    }

    return Object.keys(input).reduce(function (accumulator, key) {
      var value = input[key];
      if (value == null) {
        return accumulator;
      }

      if (typeof value === 'string' && value.trim() === '') {
        return accumulator;
      }

      accumulator[key] = value;
      return accumulator;
    }, {});
  }

  function toPositiveInteger(value, fallback) {
    var normalizedFallback = Number.isFinite(fallback) ? Math.round(fallback) : 0;
    var numericValue = Math.round(Number(value));
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      return normalizedFallback;
    }
    return numericValue;
  }

  function toPositiveNumber(value, fallback) {
    var normalizedFallback = typeof fallback === 'number' && Number.isFinite(fallback)
      ? fallback
      : 0;
    var numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      return normalizedFallback;
    }
    return numericValue;
  }

  function normalizeBoolean(value, fallback) {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      if (value === 'true' || value === '1') {
        return true;
      }
      if (value === 'false' || value === '0') {
        return false;
      }
    }

    return Boolean(fallback);
  }

  function normalizeArray(value, fallback) {
    var list = [];

    if (Array.isArray(value)) {
      list = value;
    } else if (typeof value === 'string' && value.trim()) {
      list = value.split(',');
    } else if (Array.isArray(fallback)) {
      list = fallback;
    }

    return list
      .map(function (entry) { return normalizeText(entry); })
      .filter(Boolean);
  }

  function getDefaultConfig() {
    var uxEvidence = analyticsConfig && analyticsConfig.UX_EVIDENCE
      ? analyticsConfig.UX_EVIDENCE
      : {};
    var heatmapPolicy = analyticsGovernance && analyticsGovernance.SAMPLING
      ? analyticsGovernance.SAMPLING.heatmap
      : { rate: 0.2 };
    var replayPolicy = analyticsGovernance && analyticsGovernance.SAMPLING
      ? analyticsGovernance.SAMPLING.replay
      : { rate: 0.05 };

    return {
      enabled: true,
      provider: normalizeText(uxEvidence.defaultProvider, 'clarity'),
      projectId: normalizeText(uxEvidence.projectId),
      scriptUrl: '',
      enabledEnvironments: normalizeArray(uxEvidence.enabledEnvironments, ['prod']),
      routeAllowlist: normalizeArray(uxEvidence.routeAllowlist, ['home', 'menu', 'menu_detail', 'eventos', 'nosotros']),
      tagKeys: normalizeArray(uxEvidence.tagKeys, ['route_name', 'page_type', 'page_path', 'entry_source', 'visit_context', 'traffic_class', 'visitor_type']),
      providerCaptureMode: normalizeText(uxEvidence.providerCaptureMode, 'coupled_conservative'),
      reviewCadenceDays: toPositiveInteger(uxEvidence.reviewCadenceDays, 14),
      loadDelayMs: toPositiveInteger(uxEvidence.loadDelayMs, 1800),
      idleTimeoutMs: toPositiveInteger(uxEvidence.idleTimeoutMs, 1200),
      scriptTimeoutMs: toPositiveInteger(uxEvidence.scriptTimeoutMs, 7000),
      heatmapSampleRate: toPositiveNumber(heatmapPolicy && heatmapPolicy.rate, 0.2),
      replaySampleRate: toPositiveNumber(replayPolicy && replayPolicy.rate, 0.05),
      consentV2: null,
    };
  }

  function readBrowserConfig() {
    if (!BROWSER) {
      return {};
    }

    var html = document.documentElement || null;
    var inlineConfig = window.__FIGATA_ANALYTICS_REPLAY_CONFIG && typeof window.__FIGATA_ANALYTICS_REPLAY_CONFIG === 'object'
      ? window.__FIGATA_ANALYTICS_REPLAY_CONFIG
      : {};
    var htmlConfig = omitEmptyStringValues({
      provider: html ? html.getAttribute('data-analytics-replay-provider') : '',
      projectId: html ? (html.getAttribute('data-analytics-replay-project-id') || html.getAttribute('data-clarity-project-id')) : '',
      scriptUrl: html ? html.getAttribute('data-analytics-replay-script-url') : '',
      enabled: html ? html.getAttribute('data-analytics-replay-enabled') : '',
    });

    if (!inlineConfig.projectId && typeof window.__FIGATA_CLARITY_PROJECT_ID === 'string') {
      inlineConfig.projectId = window.__FIGATA_CLARITY_PROJECT_ID;
    }

    return Object.assign({}, htmlConfig, inlineConfig);
  }

  function normalizeConfig(rawConfig) {
    var defaults = getDefaultConfig();
    var config = rawConfig && typeof rawConfig === 'object'
      ? Object.assign({}, defaults, rawConfig)
      : Object.assign({}, defaults, readBrowserConfig());

    config.enabled = normalizeBoolean(config.enabled, defaults.enabled);
    config.provider = normalizeText(config.provider, defaults.provider).toLowerCase();
    config.projectId = normalizeText(config.projectId);
    config.scriptUrl = normalizeText(config.scriptUrl);
    config.enabledEnvironments = normalizeArray(config.enabledEnvironments, defaults.enabledEnvironments);
    config.routeAllowlist = normalizeArray(config.routeAllowlist, defaults.routeAllowlist);
    config.tagKeys = normalizeArray(config.tagKeys, defaults.tagKeys);
    config.providerCaptureMode = normalizeText(config.providerCaptureMode, defaults.providerCaptureMode);
    config.reviewCadenceDays = toPositiveInteger(config.reviewCadenceDays, defaults.reviewCadenceDays);
    config.loadDelayMs = toPositiveInteger(config.loadDelayMs, defaults.loadDelayMs);
    config.idleTimeoutMs = toPositiveInteger(config.idleTimeoutMs, defaults.idleTimeoutMs);
    config.scriptTimeoutMs = toPositiveInteger(config.scriptTimeoutMs, defaults.scriptTimeoutMs);
    config.heatmapSampleRate = toPositiveNumber(config.heatmapSampleRate, defaults.heatmapSampleRate);
    config.replaySampleRate = toPositiveNumber(config.replaySampleRate, defaults.replaySampleRate);

    if (config.heatmapSampleRate > 1) {
      config.heatmapSampleRate = 1;
    }
    if (config.replaySampleRate > 1) {
      config.replaySampleRate = 1;
    }
    if (config.replaySampleRate > config.heatmapSampleRate) {
      config.replaySampleRate = config.heatmapSampleRate;
    }

    if (!providers[config.provider]) {
      config.provider = defaults.provider;
    }

    if (
      config.consentV2 &&
      (!config.consentV2.analytics_Storage || !config.consentV2.ad_Storage)
    ) {
      config.consentV2 = null;
    }

    return config;
  }

  function buildProviderPageId(context) {
    var pagePath = normalizeText(context && context.pagePath, '/').replace(/[^a-z0-9/_-]+/gi, '_');
    return [
      normalizeText(context && context.routeName, 'unknown'),
      pagePath,
    ].join(':');
  }

  function stableFraction(seedInput) {
    var seed = normalizeText(seedInput, 'figata');
    var hash = 2166136261;
    for (var index = 0; index < seed.length; index += 1) {
      hash ^= seed.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }

    return ((hash >>> 0) % 10000) / 10000;
  }

  function collectNetworkSnapshot() {
    if (!BROWSER) {
      return { network_effective_type: 'unknown' };
    }

    var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
    return {
      network_effective_type: normalizeText(connection && connection.effectiveType, 'unknown'),
    };
  }

  function buildContextFromState(sdkState, detail) {
    var runtime = sdkState && sdkState.runtime ? sdkState.runtime : {};
    var route = runtime && runtime.route ? runtime.route : {};
    var identity = sdkState && sdkState.identity ? sdkState.identity : {};
    var visitor = identity && identity.visitor ? identity.visitor : {};
    var session = identity && identity.session ? identity.session : {};
    var attribution = sdkState && sdkState.attribution ? sdkState.attribution : {};
    var internal = sdkState && sdkState.internal ? sdkState.internal : {};
    var pageDetail = detail && typeof detail === 'object' ? detail : {};
    var pagePath = normalizeText(pageDetail.page_path, BROWSER && window.location ? analyticsConfig.normalizePath(window.location.pathname) : '/');

    return Object.assign(
      {
        environment: normalizeText(runtime.environment, 'unknown'),
        routeName: normalizeText(pageDetail.route_name, route.routeName || 'unknown'),
        pageType: normalizeText(pageDetail.page_type, route.pageType || 'unknown'),
        pagePath: pagePath,
        entrySource: normalizeText(pageDetail.entry_source, attribution.entry_source || 'unknown'),
        visitContext: normalizeText(pageDetail.visit_context, attribution.visit_context || 'unknown'),
        trafficClass: normalizeText(pageDetail.traffic_class, internal.trafficClass || runtime.defaultTrafficClass || 'unknown'),
        isInternal: Boolean(typeof pageDetail.is_internal === 'boolean' ? pageDetail.is_internal : internal.isInternal),
        visitorId: normalizeText(visitor.id),
        sessionId: normalizeText(session.id),
        isReturningVisitor: Boolean(visitor.isReturning),
        visitorType: Boolean(visitor.isReturning) ? 'returning' : 'new',
      },
      collectNetworkSnapshot()
    );
  }

  function resolvePlan(runtimeContext, rawConfig) {
    var config = normalizeConfig(rawConfig);
    var context = runtimeContext && typeof runtimeContext === 'object'
      ? runtimeContext
      : buildContextFromState({}, null);
    var provider = providers[config.provider];
    var sampleFraction = stableFraction([
      config.provider,
      normalizeText(context.sessionId, 'session_unknown'),
    ].join('|'));
    var heatmapSampled = Boolean(
      provider &&
      !context.isInternal &&
      sampleFraction < config.heatmapSampleRate
    );
    var replaySampled = Boolean(
      provider &&
      !context.isInternal &&
      sampleFraction < config.replaySampleRate
    );
    var routeAllowed = !config.routeAllowlist.length || config.routeAllowlist.indexOf(context.routeName) !== -1;
    var environmentAllowed = !config.enabledEnvironments.length || config.enabledEnvironments.indexOf(context.environment) !== -1;
    var effectiveSampleKey = 'none';
    var effectiveSampleRate = 0;

    if (config.providerCaptureMode === 'coupled_conservative') {
      effectiveSampleKey = replaySampled ? 'replay' : 'none';
      effectiveSampleRate = replaySampled ? config.replaySampleRate : 0;
    } else if (replaySampled) {
      effectiveSampleKey = 'replay';
      effectiveSampleRate = config.replaySampleRate;
    } else if (heatmapSampled) {
      effectiveSampleKey = 'heatmap';
      effectiveSampleRate = config.heatmapSampleRate;
    }

    var plan = {
      provider: config.provider,
      projectIdPresent: Boolean(config.projectId),
      routeAllowed: routeAllowed,
      environmentAllowed: environmentAllowed,
      heatmapSampled: heatmapSampled,
      replaySampled: replaySampled,
      effectiveSampleKey: effectiveSampleKey,
      effectiveSampleRate: effectiveSampleRate,
      providerCaptureMode: config.providerCaptureMode,
      reviewCadenceDays: config.reviewCadenceDays,
      sampleFraction: sampleFraction,
      shouldLoadProvider: false,
      status: 'idle',
      reason: '',
      scriptUrl: provider ? provider.buildScriptUrl(config) : '',
    };

    if (!config.enabled) {
      plan.status = 'disabled';
      plan.reason = 'disabled_config';
      return plan;
    }

    if (!provider) {
      plan.status = 'unsupported_provider';
      plan.reason = 'unsupported_provider';
      return plan;
    }

    if (!config.projectId && !config.scriptUrl) {
      plan.status = 'missing_project_id';
      plan.reason = 'missing_project_id';
      return plan;
    }

    if (!environmentAllowed) {
      plan.status = 'environment_blocked';
      plan.reason = 'environment_blocked';
      return plan;
    }

    if (context.isInternal) {
      plan.status = 'internal_blocked';
      plan.reason = 'internal_traffic';
      return plan;
    }

    if (!routeAllowed) {
      plan.status = 'route_blocked';
      plan.reason = 'route_not_allowed';
      return plan;
    }

    if (!plan.effectiveSampleRate) {
      plan.status = 'not_sampled';
      plan.reason = 'not_sampled';
      return plan;
    }

    plan.status = 'eligible';
    plan.reason = 'eligible';
    plan.shouldLoadProvider = true;
    return plan;
  }

  function sdkRef() {
    return BROWSER ? window.FigataAnalyticsSDK || null : null;
  }

  function getSdkState() {
    var sdk = sdkRef();
    return sdk && typeof sdk.getState === 'function'
      ? sdk.getState()
      : null;
  }

  function safeSessionStorage() {
    if (!BROWSER) {
      return null;
    }

    try {
      return window.sessionStorage || null;
    } catch (_error) {
      return null;
    }
  }

  function replayEventStorageKey(sessionId) {
    return 'figata:analytics:replay_sampled:' + normalizeText(sessionId, 'session_unknown');
  }

  function hasTrackedReplayEvent(sessionId) {
    var storage = safeSessionStorage();
    if (!storage) {
      return runtimeState.replayEventTracked;
    }

    try {
      return storage.getItem(replayEventStorageKey(sessionId)) === '1';
    } catch (_error) {
      return runtimeState.replayEventTracked;
    }
  }

  function rememberReplayEvent(sessionId) {
    var storage = safeSessionStorage();
    runtimeState.replayEventTracked = true;
    if (!storage) {
      return;
    }

    try {
      storage.setItem(replayEventStorageKey(sessionId), '1');
    } catch (_error) {
      // ignore storage failures
    }
  }

  function trackReplaySampled(plan, context) {
    var sdk = sdkRef();
    if (!sdk || !plan || !plan.replaySampled || !context || hasTrackedReplayEvent(context.sessionId)) {
      return;
    }

    rememberReplayEvent(context.sessionId);
    sdk.track('replay_sampled', {
      replay_tool: plan.provider,
      replay_sample_key: plan.effectiveSampleKey,
      replay_sample_rate: plan.effectiveSampleRate,
      replay_capture_mode: plan.providerCaptureMode,
      review_cadence_days: plan.reviewCadenceDays,
      network_effective_type: context.network_effective_type,
    });

    if (providers[plan.provider] && typeof providers[plan.provider].markReplaySampled === 'function') {
      providers[plan.provider].markReplaySampled();
    }
  }

  function applyProviderPrivacy(plan) {
    if (!BROWSER || !plan || !providers[plan.provider]) {
      return;
    }

    if (typeof providers[plan.provider].maskSensitiveFields === 'function') {
      providers[plan.provider].maskSensitiveFields();
    }
  }

  function syncProviderContext(reason, detail) {
    var sdkState = getSdkState();
    if (!sdkState) {
      return null;
    }

    runtimeState.context = buildContextFromState(sdkState, detail);
    runtimeState.config = normalizeConfig(null);
    runtimeState.plan = resolvePlan(runtimeState.context, runtimeState.config);
    runtimeState.lastRefreshReason = normalizeText(reason, 'refresh');
    runtimeState.providerScriptUrl = runtimeState.plan.scriptUrl || '';

    if (!runtimeState.plan.shouldLoadProvider) {
      runtimeState.status = runtimeState.plan.status;
      return runtimeState.plan;
    }

    applyProviderPrivacy(runtimeState.plan);

    if (providers[runtimeState.plan.provider] && typeof providers[runtimeState.plan.provider].syncContext === 'function') {
      providers[runtimeState.plan.provider].applyConsent(runtimeState.config);
      providers[runtimeState.plan.provider].syncContext(runtimeState.plan, runtimeState.context);
    }

    trackReplaySampled(runtimeState.plan, runtimeState.context);
    ensureProviderLoaded(runtimeState.plan);
    runtimeState.status = runtimeState.providerLoaded ? 'loaded' : (runtimeState.providerLoading ? 'loading' : 'scheduled');
    return runtimeState.plan;
  }

  function runIdleTask(callback, timeoutMs) {
    if (!BROWSER) {
      callback();
      return;
    }

    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(callback, { timeout: timeoutMs });
      return;
    }

    window.setTimeout(callback, Math.min(timeoutMs, 500));
  }

  function ensureProviderLoaded(plan) {
    if (!BROWSER || !plan || !plan.shouldLoadProvider) {
      return;
    }

    if (runtimeState.providerLoaded || runtimeState.providerLoading || runtimeState.providerScheduled) {
      return;
    }

    runtimeState.providerScheduled = true;
    runtimeState.status = 'scheduled';

    var startLoad = function () {
      runIdleTask(function () {
        window.setTimeout(function () {
          injectProviderScript(plan);
        }, runtimeState.config.loadDelayMs);
      }, runtimeState.config.idleTimeoutMs);
    };

    if (document.readyState === 'complete') {
      startLoad();
      return;
    }

    window.addEventListener('load', startLoad, { once: true });
  }

  function injectProviderScript(plan) {
    if (!BROWSER || runtimeState.providerLoaded || runtimeState.providerLoading) {
      return;
    }

    var scriptUrl = normalizeText(plan && plan.scriptUrl);
    if (!scriptUrl) {
      runtimeState.status = 'missing_project_id';
      return;
    }

    var existing = document.querySelector('script[data-analytics-replay-provider="' + plan.provider + '"]');
    if (existing) {
      runtimeState.providerLoading = false;
      runtimeState.providerLoaded = typeof window.clarity === 'function';
      runtimeState.status = runtimeState.providerLoaded ? 'loaded' : 'loading';
      return;
    }

    runtimeState.providerLoading = true;
    runtimeState.status = 'loading';
    runtimeState.providerScriptUrl = scriptUrl;

    var script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = scriptUrl;
    script.setAttribute('data-analytics-replay-provider', plan.provider);
    script.setAttribute('data-analytics-replay-role', 'ux-evidence');

    var timeoutId = window.setTimeout(function () {
      runtimeState.providerLoading = false;
      runtimeState.status = 'timeout';
      runtimeState.providerError = 'provider_script_timeout';
    }, runtimeState.config.scriptTimeoutMs);

    script.addEventListener('load', function () {
      window.clearTimeout(timeoutId);
      runtimeState.providerLoading = false;
      runtimeState.providerLoaded = true;
      runtimeState.status = 'loaded';
      runtimeState.providerError = '';
      syncProviderContext('provider_loaded');
    });

    script.addEventListener('error', function () {
      window.clearTimeout(timeoutId);
      runtimeState.providerLoading = false;
      runtimeState.status = 'failed';
      runtimeState.providerError = 'provider_script_failed';
    });

    (document.head || document.documentElement).appendChild(script);
  }

  function handlePageContext(event) {
    var detail = event && event.detail ? event.detail : null;
    syncProviderContext('page_context', detail);
  }

  function bindPageContext() {
    if (!BROWSER || runtimeState.pageContextBound) {
      return;
    }

    runtimeState.pageContextBound = true;
    window.addEventListener('figata:analytics-page-context', handlePageContext);
  }

  function init() {
    if (!BROWSER) {
      runtimeState.initialized = true;
      return Promise.resolve(getState());
    }

    if (runtimeState.initialized) {
      return Promise.resolve(getState());
    }

    if (runtimeState.initPromise) {
      return runtimeState.initPromise;
    }

    var sdk = sdkRef();
    if (!sdk || typeof sdk.whenReady !== 'function') {
      runtimeState.status = 'sdk_unavailable';
      runtimeState.initPromise = Promise.resolve(getState());
      return runtimeState.initPromise;
    }

    bindPageContext();
    runtimeState.initPromise = sdk.whenReady().then(function () {
      runtimeState.initialized = true;
      syncProviderContext('sdk_ready');
      return getState();
    });

    return runtimeState.initPromise;
  }

  function getState() {
    return {
      version: VERSION,
      initialized: runtimeState.initialized,
      status: runtimeState.status,
      providerLoaded: runtimeState.providerLoaded,
      providerLoading: runtimeState.providerLoading,
      providerScheduled: runtimeState.providerScheduled,
      providerScriptUrl: runtimeState.providerScriptUrl,
      providerError: runtimeState.providerError,
      lastRefreshReason: runtimeState.lastRefreshReason,
      config: Object.assign({}, runtimeState.config, {
        projectId: runtimeState.config.projectId ? '[configured]' : '',
      }),
      plan: runtimeState.plan ? Object.assign({}, runtimeState.plan) : null,
      context: runtimeState.context ? Object.assign({}, runtimeState.context) : null,
    };
  }

  function buildReviewChecklist() {
    return [
      'Filtrar sesiones por route_name y page_path antes de revisar clicks o scroll.',
      'Cruzar replay/heatmap con KPI o funnel afectado antes de abrir backlog.',
      'Priorizar rage clicks, dead clicks y abandono en CTA/comercio critico.',
      'Documentar hallazgo con evidencia visual, impacto, hipotesis y owner.',
      'Cerrar la revision quincenal con decision: corregir, experimentar o descartar.',
    ];
  }

  var api = {
    VERSION: VERSION,
    buildReviewChecklist: buildReviewChecklist,
    getDefaultConfig: getDefaultConfig,
    getState: getState,
    init: init,
    normalizeConfig: normalizeConfig,
    resolvePlan: resolvePlan,
    stableFraction: stableFraction,
    syncProviderContext: syncProviderContext,
  };

  if (BROWSER) {
    window.setTimeout(function () {
      api.init();
    }, 0);
  }

  return api;
});
