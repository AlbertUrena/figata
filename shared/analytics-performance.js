(function () {
  if (window.FigataAnalyticsPerformance && window.FigataAnalyticsPerformance.__initialized) {
    return;
  }

  var sdk = window.FigataAnalyticsSDK;
  var analyticsConfig = window.FigataAnalyticsConfig;
  var publicPaths = window.FigataPublicPaths;

  if (!sdk || !analyticsConfig || !publicPaths || typeof window === 'undefined') {
    return;
  }

  var ROUTE_READY_FALLBACK_MS = 2200;
  var IMAGE_SIZE_THRESHOLD_BYTES = 60000;
  var IMAGE_DURATION_THRESHOLD_MS = 120;
  var MAX_ASSET_EVENTS_PER_ROUTE = 12;
  var ROUTE_METRIC_NAMES = Object.freeze([
    'page_shell_visible_ms',
    'menu_tabs_visible_ms',
    'menu_first_row_hydrated_ms',
    'menu_full_hydration_ms',
    'detail_open_ms',
    'detail_image_visible_ms',
    'detail_video_ready_ms',
    'detail_cta_ready_ms',
  ]);

  var state = {
    currentPath: '',
    navigationType: detectNavigationType(),
    routeStartedAtMs: nowMs(),
    metricValues: Object.create(null),
    routeReadyTracked: false,
    performanceSummaryTracked: false,
    seenAssets: new Set(),
    assetEventCount: 0,
    fcpMs: 0,
    fallbackTimerId: 0,
  };

  function nowMs() {
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      return performance.now();
    }

    return Date.now();
  }

  function normalizeText(value, fallback) {
    var normalizedFallback = typeof fallback === 'string' ? fallback : '';
    if (typeof value !== 'string') {
      return normalizedFallback;
    }

    var trimmed = value.trim();
    return trimmed || normalizedFallback;
  }

  function toPositiveInteger(value) {
    var numericValue = Math.round(Number(value) || 0);
    return numericValue > 0 ? numericValue : 0;
  }

  function detectNavigationType() {
    try {
      var entries = performance.getEntriesByType('navigation');
      if (entries && entries.length && entries[0].type) {
        if (entries[0].type === 'back_forward') {
          return 'back_forward';
        }
        if (entries[0].type === 'reload') {
          return 'reload';
        }
      }
    } catch (_error) {
      // ignore
    }

    return 'hard';
  }

  function currentPath() {
    var pathname = window.location && window.location.pathname
      ? window.location.pathname
      : '/';
    var strippedPath = typeof publicPaths.stripSitePath === 'function'
      ? publicPaths.stripSitePath(pathname)
      : pathname;
    return analyticsConfig.normalizePath(strippedPath || '/');
  }

  function getNavigationEntry() {
    try {
      var entries = performance.getEntriesByType('navigation');
      return entries && entries.length ? entries[0] : null;
    } catch (_error) {
      return null;
    }
  }

  function getDocumentMetric(metricName) {
    var navigationEntry = getNavigationEntry();
    if (!navigationEntry) {
      return 0;
    }

    return toPositiveInteger(navigationEntry[metricName]);
  }

  function captureFirstContentfulPaint() {
    try {
      var entries = performance.getEntriesByName('first-contentful-paint');
      if (entries && entries.length) {
        state.fcpMs = Math.max(state.fcpMs, toPositiveInteger(entries[0].startTime));
      }
    } catch (_error) {
      // ignore
    }
  }

  function observePaintMetrics() {
    captureFirstContentfulPaint();

    if (typeof PerformanceObserver !== 'function') {
      return;
    }

    try {
      var observer = new PerformanceObserver(function (list) {
        list.getEntries().forEach(function (entry) {
          if (entry && entry.name === 'first-contentful-paint') {
            state.fcpMs = Math.max(state.fcpMs, toPositiveInteger(entry.startTime));
          }
        });
      });

      observer.observe({ type: 'paint', buffered: true });
    } catch (_error) {
      // ignore
    }
  }

  function getNetworkSnapshot() {
    var connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection ||
      null;

    return {
      network_effective_type: normalizeText(connection && connection.effectiveType, 'unknown'),
      network_downlink_mbps:
        connection && Number.isFinite(connection.downlink) ? Number(connection.downlink) : 0,
      network_rtt_ms: toPositiveInteger(connection && connection.rtt),
      network_save_data: Boolean(connection && connection.saveData),
    };
  }

  function clearFallbackTimer() {
    if (!state.fallbackTimerId) {
      return;
    }

    window.clearTimeout(state.fallbackTimerId);
    state.fallbackTimerId = 0;
  }

  function rememberMetric(name, value, options) {
    var normalizedName = normalizeText(name);
    if (!normalizedName) {
      return 0;
    }

    var nextValue = typeof value === 'number'
      ? toPositiveInteger(value)
      : toPositiveInteger(nowMs() - state.routeStartedAtMs);
    var allowOverwrite = Boolean(options && options.allowOverwrite);

    if (
      typeof state.metricValues[normalizedName] === 'undefined' ||
      allowOverwrite
    ) {
      state.metricValues[normalizedName] = nextValue;
    }

    return state.metricValues[normalizedName];
  }

  function buildPerformanceSummaryPayload() {
    var payload = Object.assign(
      {
        fcp_ms: state.fcpMs || 0,
        dom_interactive_ms: getDocumentMetric('domInteractive'),
        route_ready_ms: rememberMetric('route_ready_ms', state.metricValues.route_ready_ms, {
          allowOverwrite: true,
        }),
        navigation_type: state.navigationType,
      },
      getNetworkSnapshot()
    );

    ROUTE_METRIC_NAMES.forEach(function (metricName) {
      if (typeof state.metricValues[metricName] !== 'undefined') {
        payload[metricName] = state.metricValues[metricName];
      }
    });

    return payload;
  }

  function trackNetworkContextSample() {
    sdk.track('network_context_sample', getNetworkSnapshot());
  }

  function trackPerformanceSummary() {
    if (state.performanceSummaryTracked || !state.routeReadyTracked) {
      return;
    }

    state.performanceSummaryTracked = true;
    sdk.track('performance_summary', buildPerformanceSummaryPayload());
  }

  function markRouteReady(options) {
    if (state.routeReadyTracked) {
      return state.metricValues.route_ready_ms || 0;
    }

    var routeReadyMs = rememberMetric(
      'route_ready_ms',
      options && typeof options.routeReadyMs === 'number'
        ? options.routeReadyMs
        : undefined,
      { allowOverwrite: true }
    );

    state.routeReadyTracked = true;
    clearFallbackTimer();

    sdk.track(
      'route_ready',
      Object.assign(
        {
          route_ready_ms: routeReadyMs,
          navigation_type: normalizeText(options && options.navigationType, state.navigationType),
        },
        getNetworkSnapshot()
      )
    );
    trackPerformanceSummary();
    return routeReadyMs;
  }

  function scheduleRouteReadyFallback() {
    clearFallbackTimer();
    state.fallbackTimerId = window.setTimeout(function () {
      if (!state.routeReadyTracked) {
        markRouteReady({ navigationType: state.navigationType });
      }
    }, ROUTE_READY_FALLBACK_MS);
  }

  function resetRouteState(navigationType) {
    state.currentPath = currentPath();
    state.navigationType = normalizeText(navigationType, 'soft');
    state.routeStartedAtMs = nowMs();
    state.metricValues = Object.create(null);
    state.routeReadyTracked = false;
    state.performanceSummaryTracked = false;
    state.seenAssets = new Set();
    state.assetEventCount = 0;

    if (typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(function () {
        rememberMetric('page_shell_visible_ms');
      });
    } else {
      rememberMetric('page_shell_visible_ms');
    }

    trackNetworkContextSample();
    scheduleRouteReadyFallback();
  }

  function patchHistory() {
    if (window.__FIGATA_ANALYTICS_PERFORMANCE_HISTORY_PATCHED) {
      return;
    }

    window.__FIGATA_ANALYTICS_PERFORMANCE_HISTORY_PATCHED = true;

    ['pushState', 'replaceState'].forEach(function (methodName) {
      var originalMethod = window.history[methodName];
      window.history[methodName] = function () {
        var result = originalMethod.apply(this, arguments);
        window.setTimeout(function () {
          resetRouteState(methodName === 'pushState' ? 'soft' : 'replace');
        }, 24);
        return result;
      };
    });

    window.addEventListener('popstate', function () {
      window.setTimeout(function () {
        resetRouteState('back_forward');
      }, 24);
    });
  }

  function normalizeAssetName(rawName) {
    var source = normalizeText(rawName);
    if (!source) {
      return '';
    }

    try {
      var resolved = new URL(source, window.location.origin);
      var pathname = resolved.pathname || source;
      var strippedPath = typeof publicPaths.stripSitePath === 'function'
        ? publicPaths.stripSitePath(pathname)
        : pathname;
      var normalizedPath = normalizeText(strippedPath || pathname);
      return normalizedPath.replace(/^\/+/, '');
    } catch (_error) {
      return source.replace(/^\/+/, '');
    }
  }

  function inferAssetType(rawName, initiatorType) {
    var normalizedName = normalizeText(rawName).toLowerCase();
    var normalizedInitiator = normalizeText(initiatorType).toLowerCase();

    if (
      normalizedInitiator === 'video' ||
      normalizedName.indexOf('.webm') !== -1 ||
      normalizedName.indexOf('.mp4') !== -1
    ) {
      return 'video';
    }

    if (
      normalizedInitiator === 'img' ||
      normalizedInitiator === 'image' ||
      normalizedName.indexOf('.webp') !== -1 ||
      normalizedName.indexOf('.jpg') !== -1 ||
      normalizedName.indexOf('.jpeg') !== -1 ||
      normalizedName.indexOf('.png') !== -1 ||
      normalizedName.indexOf('.gif') !== -1 ||
      normalizedName.indexOf('.svg') !== -1
    ) {
      return 'image';
    }

    return '';
  }

  function resolveAssetSizeBytes(entry) {
    if (!entry || typeof entry !== 'object') {
      return 0;
    }

    return toPositiveInteger(
      entry.transferSize ||
      entry.encodedBodySize ||
      entry.decodedBodySize ||
      0
    );
  }

  function shouldTrackAsset(assetName, assetType, assetSizeBytes, assetLoadMs) {
    if (!assetName || !assetType) {
      return false;
    }

    if (assetName.indexOf('assets/') !== 0) {
      return false;
    }

    if (assetType === 'video') {
      return true;
    }

    return (
      assetSizeBytes >= IMAGE_SIZE_THRESHOLD_BYTES ||
      assetLoadMs >= IMAGE_DURATION_THRESHOLD_MS
    );
  }

  function buildAssetPayload(rawName, assetType, assetLoadMs, assetSizeBytes, extra) {
    var normalizedName = normalizeAssetName(rawName);
    var normalizedType = normalizeText(assetType);

    if (!normalizedName || !normalizedType) {
      return null;
    }

    var payload = {
      asset_name: normalizedName,
      asset_type: normalizedType,
      asset_size_bytes: toPositiveInteger(assetSizeBytes),
      asset_load_ms: toPositiveInteger(assetLoadMs),
    };

    if (extra && typeof extra === 'object') {
      if (normalizeText(extra.itemId)) {
        payload.item_id = normalizeText(extra.itemId);
      }
      if (normalizeText(extra.itemName)) {
        payload.item_name = normalizeText(extra.itemName);
      }
      if (normalizeText(extra.mediaId)) {
        payload.media_id = normalizeText(extra.mediaId);
      }
    }

    return payload;
  }

  function trackAssetPayload(payload) {
    if (!payload || !payload.asset_name || !payload.asset_type) {
      return false;
    }

    var assetKey = [
      state.currentPath,
      payload.asset_type,
      payload.asset_name,
      normalizeText(payload.media_id),
    ].join('|');

    if (state.seenAssets.has(assetKey) || state.assetEventCount >= MAX_ASSET_EVENTS_PER_ROUTE) {
      return false;
    }

    state.seenAssets.add(assetKey);
    state.assetEventCount += 1;
    sdk.track('asset_load_timing', payload);
    return true;
  }

  function findResourceEntry(rawName) {
    if (typeof performance === 'undefined' || typeof performance.getEntriesByName !== 'function') {
      return null;
    }

    var source = normalizeText(rawName);
    if (!source) {
      return null;
    }

    try {
      var entries = performance.getEntriesByName(source);
      if (entries && entries.length) {
        return entries[entries.length - 1];
      }
    } catch (_error) {
      // ignore
    }

    try {
      var resolvedHref = new URL(source, window.location.href).href;
      var resolvedEntries = performance.getEntriesByName(resolvedHref);
      return resolvedEntries && resolvedEntries.length
        ? resolvedEntries[resolvedEntries.length - 1]
        : null;
    } catch (_error) {
      return null;
    }
  }

  function handleResourceEntry(entry) {
    if (!entry || typeof entry !== 'object') {
      return;
    }

    if (/^\/menu\/[^/]+$/.test(state.currentPath)) {
      return;
    }

    var assetType = inferAssetType(entry.name, entry.initiatorType);
    var payload = buildAssetPayload(
      entry.name,
      assetType,
      entry.duration,
      resolveAssetSizeBytes(entry)
    );

    if (!payload) {
      return;
    }

    if (
      entry.startTime + entry.duration < state.routeStartedAtMs - 150 ||
      !shouldTrackAsset(
        payload.asset_name,
        payload.asset_type,
        payload.asset_size_bytes,
        payload.asset_load_ms
      )
    ) {
      return;
    }

    trackAssetPayload(payload);
  }

  function observeResourceTimings() {
    if (typeof PerformanceObserver !== 'function') {
      return;
    }

    try {
      var observer = new PerformanceObserver(function (list) {
        list.getEntries().forEach(handleResourceEntry);
      });

      observer.observe({ type: 'resource', buffered: true });
    } catch (_error) {
      try {
        var fallbackObserver = new PerformanceObserver(function (list) {
          list.getEntries().forEach(handleResourceEntry);
        });

        fallbackObserver.observe({ entryTypes: ['resource'] });
      } catch (_innerError) {
        // ignore
      }
    }
  }

  function getElementAssetUrl(element) {
    if (!(element instanceof Element)) {
      return '';
    }

    if (element instanceof HTMLImageElement) {
      return normalizeText(
        element.currentSrc ||
        element.src ||
        element.getAttribute('data-src')
      );
    }

    if (element instanceof HTMLVideoElement) {
      var currentVideoSrc = normalizeText(element.currentSrc || element.src);
      if (currentVideoSrc) {
        return currentVideoSrc;
      }

      var sourceNode = element.querySelector('source[src]');
      return sourceNode instanceof HTMLSourceElement
        ? normalizeText(sourceNode.src)
        : '';
    }

    return normalizeText(element.getAttribute('src') || '');
  }

  function trackAssetFromElement(element, options) {
    if (!(element instanceof Element)) {
      return false;
    }

    var assetUrl = getElementAssetUrl(element);
    if (!assetUrl) {
      return false;
    }

    var metricName = normalizeText(options && options.metricName);
    var assetType = normalizeText(options && options.assetType) ||
      inferAssetType(assetUrl, element.tagName.toLowerCase());
    var tracked = false;

    var finalize = function () {
      if (tracked) {
        return;
      }

      tracked = true;

      if (metricName) {
        rememberMetric(metricName);
      }

      var resourceEntry = findResourceEntry(assetUrl);
      var payload = buildAssetPayload(
        assetUrl,
        assetType,
        resourceEntry ? resourceEntry.duration : 0,
        resourceEntry ? resolveAssetSizeBytes(resourceEntry) : 0,
        options
      );

      if (payload) {
        trackAssetPayload(payload);
      }

      if (options && typeof options.onReady === 'function') {
        options.onReady(payload);
      }
    };

    if (element instanceof HTMLImageElement) {
      if (element.complete && element.naturalWidth > 0) {
        finalize();
      } else {
        element.addEventListener('load', finalize, { once: true });
      }
      return true;
    }

    if (element instanceof HTMLVideoElement) {
      if (element.readyState >= 1) {
        finalize();
      } else {
        element.addEventListener('loadedmetadata', finalize, { once: true });
      }
      return true;
    }

    finalize();
    return true;
  }

  function observeConnectionChanges() {
    var connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection ||
      null;

    if (!connection || typeof connection.addEventListener !== 'function') {
      return;
    }

    connection.addEventListener('change', function () {
      trackNetworkContextSample();
    });
  }

  function init() {
    patchHistory();
    observePaintMetrics();
    observeResourceTimings();
    observeConnectionChanges();
    resetRouteState(detectNavigationType());
  }

  init();

  window.FigataAnalyticsPerformance = {
    __initialized: true,
    getState: function () {
      return {
        currentPath: state.currentPath,
        navigationType: state.navigationType,
        routeStartedAtMs: state.routeStartedAtMs,
        metricValues: Object.assign({}, state.metricValues),
        routeReadyTracked: state.routeReadyTracked,
        performanceSummaryTracked: state.performanceSummaryTracked,
        assetEventCount: state.assetEventCount,
        fcpMs: state.fcpMs,
      };
    },
    getNetworkSnapshot: getNetworkSnapshot,
    markMetric: function (name, options) {
      return rememberMetric(
        name,
        options && typeof options.ms === 'number' ? options.ms : undefined,
        { allowOverwrite: Boolean(options && options.allowOverwrite) }
      );
    },
    markRouteReady: markRouteReady,
    resetRouteState: resetRouteState,
    trackAssetFromElement: trackAssetFromElement,
    trackAssetPayload: trackAssetPayload,
  };
})();
