(function (root, factory) {
  var exported = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = exported;
  }

  root.FigataAnalyticsConfig = exported;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  var VERSION = 'figata.analytics.architecture.v1';

  var PHASES = [
    { id: 'foundation', order: 1, pbiRange: '01-04' },
    { id: 'capture', order: 2, pbiRange: '05-13' },
    { id: 'platform', order: 3, pbiRange: '14-16' },
    { id: 'exploitation', order: 4, pbiRange: '17-19' },
    { id: 'intelligence', order: 5, pbiRange: '20-22' },
  ];

  var ENVIRONMENTS = {
    dev: {
      id: 'dev',
      emitMode: 'debug_local',
      shouldTrackByDefault: true,
      includeInBusinessReporting: false,
      defaultTrafficClass: 'development',
      transportName: 'local_batch',
    },
    preview: {
      id: 'preview',
      emitMode: 'batched_preview',
      shouldTrackByDefault: true,
      includeInBusinessReporting: false,
      defaultTrafficClass: 'preview',
      transportName: 'preview_batch',
    },
    prod: {
      id: 'prod',
      emitMode: 'batched_prod',
      shouldTrackByDefault: true,
      includeInBusinessReporting: true,
      defaultTrafficClass: 'public',
      transportName: 'prod_batch',
    },
  };

  var PREVIEW_HOST_PATTERNS = [/\.pages\.dev$/i, /\.netlify\.app$/i, /\.vercel\.app$/i, /\.github\.io$/i, /^preview\.trattoriafigata\.com$/i, /^preview-admin\.trattoriafigata\.com$/i];
  var DEV_HOST_PATTERNS = [/^localhost$/i, /^127\.0\.0\.1$/i, /^0\.0\.0\.0$/i, /\.local$/i];

  var ROUTE_CATALOG = [
    {
      id: 'home',
      routeName: 'home',
      pageType: 'home',
      siteSection: 'marketing',
      paths: ['/', '/index.html'],
      instrumentation: ['navigation', 'cta', 'section_scroll'],
    },
    {
      id: 'menu_index',
      routeName: 'menu',
      pageType: 'menu_index',
      siteSection: 'menu',
      paths: ['/menu', '/menu/', '/menu/index.html'],
      instrumentation: ['navigation', 'cta', 'menu_funnel', 'editorial', 'performance', 'wifi_assist'],
    },
    {
      id: 'menu_detail',
      routeName: 'menu_detail',
      pageType: 'menu_detail',
      siteSection: 'menu',
      pathPrefix: '/menu/',
      excludePaths: ['/menu/', '/menu/index.html'],
      instrumentation: ['navigation', 'cta', 'menu_funnel', 'editorial', 'performance', 'wifi_assist'],
    },
    {
      id: 'eventos',
      routeName: 'eventos',
      pageType: 'eventos',
      siteSection: 'events',
      paths: ['/eventos', '/eventos/', '/eventos/index.html'],
      instrumentation: ['navigation', 'cta', 'editorial', 'performance', 'wifi_assist'],
    },
    {
      id: 'nosotros',
      routeName: 'nosotros',
      pageType: 'nosotros',
      siteSection: 'brand',
      paths: ['/nosotros', '/nosotros/', '/nosotros/index.html'],
      instrumentation: ['navigation', 'cta', 'section_scroll', 'performance'],
    },
    {
      id: 'admin',
      routeName: 'admin',
      pageType: 'admin',
      siteSection: 'admin',
      pathPrefix: '/admin/',
      instrumentation: ['admin_usage'],
      forceInternal: true,
    },
    {
      id: 'reservas',
      routeName: 'reservas',
      pageType: 'reservas',
      siteSection: 'conversion',
      paths: ['/reservas', '/reservas/', '/reservas/index.html'],
      instrumentation: ['navigation', 'cta', 'reservation_funnel', 'performance'],
      status: 'planned',
    },
  ];

  var OWNERSHIP = {
    frontend: ['sdk', 'route_plugins', 'cta_instrumentation', 'performance_capture'],
    backend: ['ingest_endpoint', 'batch_processing', 'retry_transport'],
    data: ['curated_models', 'quality_checks', 'kpi_catalog'],
    product: ['taxonomy_approval', 'kpi_approval', 'governance_policy'],
  };

  var WIFI_ASSIST = {
    networkName: 'Figata Guest',
    credentialLabel: 'Clave',
    credentialValue: 'Solicitala al equipo Figata',
    copyValue: 'Red: Figata Guest\nClave: Solicitala al equipo Figata',
    eligibleEntrySources: ['qr'],
    eligibleRouteNames: ['menu', 'menu_detail', 'eventos'],
    eligibleVisitContexts: ['in_restaurant_probable'],
    confirmedVisitContext: 'in_restaurant_confirmed_wifi',
    shownCooldownHours: 8,
    dismissedCooldownHours: 18,
    confirmedCooldownHours: 12,
    showDelayMs: 900,
    lowBandwidthEffectiveTypes: ['slow-2g', '2g', '3g'],
    highLatencyRttMs: 600,
    lowBandwidthDownlinkMbps: 1.8,
    routeReadySlowMs: 2200,
    manualConfirmationConfidence: 0.98,
    signalConfirmationConfidence: 1,
    confirmationSearchParam: 'fg_wifi',
    confirmationSearchValues: ['confirmed', 'local', 'figata_guest'],
  };

  var UX_EVIDENCE = {
    defaultProvider: 'clarity',
    projectId: 'wcnft9aj9p',
    enabledEnvironments: ['prod'],
    routeAllowlist: ['home', 'menu', 'menu_detail', 'eventos', 'nosotros', 'reservas'],
    tagKeys: [
      'route_name',
      'page_type',
      'page_path',
      'entry_source',
      'visit_context',
      'traffic_class',
      'visitor_type',
      'sample_key',
      'sample_mode',
    ],
    providerCaptureMode: 'coupled_conservative',
    reviewCadenceDays: 14,
    loadDelayMs: 1800,
    idleTimeoutMs: 1200,
    scriptTimeoutMs: 7000,
  };

  function normalizePath(pathname) {
    var value = typeof pathname === 'string' && pathname ? pathname : '/';
    var normalized = value.replace(/[?#].*$/, '');
    if (!normalized.startsWith('/')) {
      normalized = '/' + normalized;
    }
    if (normalized.length > 1 && normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }
    return normalized || '/';
  }

  function matchesPattern(hostname, patterns) {
    return patterns.some(function (pattern) {
      return pattern.test(hostname);
    });
  }

  function classifyEnvironment(input) {
    var hostname = String((input && input.hostname) || '').trim().toLowerCase();
    var forcedEnv = String((input && input.forcedEnv) || '').trim().toLowerCase();

    if (forcedEnv && ENVIRONMENTS[forcedEnv]) {
      return ENVIRONMENTS[forcedEnv];
    }

    if (matchesPattern(hostname, DEV_HOST_PATTERNS)) {
      return ENVIRONMENTS.dev;
    }

    if (matchesPattern(hostname, PREVIEW_HOST_PATTERNS)) {
      return ENVIRONMENTS.preview;
    }

    return ENVIRONMENTS.prod;
  }

  function resolveRoute(pathname) {
    var normalizedPath = normalizePath(pathname);
    var match = ROUTE_CATALOG.find(function (route) {
      if (Array.isArray(route.paths) && route.paths.indexOf(normalizedPath) !== -1) {
        return true;
      }

      if (route.pathPrefix && normalizedPath.indexOf(route.pathPrefix) === 0) {
        if (Array.isArray(route.excludePaths) && route.excludePaths.indexOf(normalizedPath) !== -1) {
          return false;
        }
        return true;
      }

      return false;
    });

    if (match) {
      return match;
    }

    return {
      id: 'unknown',
      routeName: 'unknown',
      pageType: 'unknown',
      siteSection: 'unknown',
      instrumentation: ['navigation'],
    };
  }

  function buildRuntimeContext(input) {
    var environment = classifyEnvironment(input || {});
    var route = resolveRoute(input && input.pathname);

    return {
      schemaVersion: VERSION,
      environment: environment.id,
      transportName: environment.transportName,
      shouldTrackByDefault: environment.shouldTrackByDefault,
      includeInBusinessReporting: environment.includeInBusinessReporting,
      defaultTrafficClass: route.forceInternal ? 'admin' : environment.defaultTrafficClass,
      route: route,
    };
  }

  return {
    VERSION: VERSION,
    PHASES: PHASES,
    ENVIRONMENTS: ENVIRONMENTS,
    OWNERSHIP: OWNERSHIP,
    ROUTE_CATALOG: ROUTE_CATALOG,
    UX_EVIDENCE: UX_EVIDENCE,
    WIFI_ASSIST: WIFI_ASSIST,
    buildRuntimeContext: buildRuntimeContext,
    classifyEnvironment: classifyEnvironment,
    normalizePath: normalizePath,
    resolveRoute: resolveRoute,
  };
});
