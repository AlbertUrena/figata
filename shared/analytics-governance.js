(function (root, factory) {
  var exported = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = exported;
  }

  root.FigataAnalyticsGovernance = exported;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  var VERSION = 'figata.analytics.governance.v1';

  var PROHIBITED_FIELDS = [
    'email',
    'phone',
    'full_name',
    'first_name',
    'last_name',
    'address',
    'street_address',
    'customer_name',
    'customer_email',
    'customer_phone',
    'credit_card',
    'card_number',
    'cvv',
    'password',
    'token',
    'gps_latitude',
    'gps_longitude',
    'exact_location',
  ];

  var PROHIBITED_VALUE_PATTERNS = [
    { id: 'email_like', pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i },
    { id: 'phone_like', pattern: /^(?:\+?\d[\d\s().-]{7,}\d)$/ },
    { id: 'card_like', pattern: /^(?:\d[ -]*?){13,19}$/ },
  ];

  var RETENTION_POLICY = {
    raw_events_days: 14,
    curated_events_days: 395,
    sessions_days: 395,
    visitors_days: 395,
    replay_days: 30,
    ai_reports_days: 180,
  };

  var ACCESS_POLICY = [
    { role: 'product', access: 'curated_and_aggregated' },
    { role: 'business', access: 'curated_and_aggregated' },
    { role: 'frontend', access: 'debug_samples_and_curated' },
    { role: 'data', access: 'raw_and_curated' },
    { role: 'platform', access: 'raw_and_curated' },
    { role: 'executive', access: 'aggregated_only' },
  ];

  var TRAFFIC_CLASSES = ['public', 'internal', 'preview', 'development', 'admin', 'automation'];
  var VISIT_CONTEXTS = [
    'remote',
    'in_restaurant_probable',
    'in_restaurant_confirmed_wifi',
    'delivery_intent',
    'events_intent',
    'unknown',
  ];
  var ENTRY_SOURCES = ['direct', 'instagram', 'qr', 'whatsapp', 'google', 'events', 'delivery', 'referral', 'unknown'];

  var SAMPLING = {
    heatmap: { rate: 0.2, allowInternal: false },
    replay: { rate: 0.05, allowInternal: false },
    core: { rate: 1, allowInternal: true },
    admin: { rate: 1, allowInternal: true },
  };

  function walkObject(payload, visitor, path) {
    if (!payload || typeof payload !== 'object') {
      return;
    }

    Object.keys(payload).forEach(function (key) {
      var value = payload[key];
      var currentPath = path ? path + '.' + key : key;
      visitor(key, value, currentPath);

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        walkObject(value, visitor, currentPath);
      }

      if (Array.isArray(value)) {
        value.forEach(function (entry, index) {
          if (entry && typeof entry === 'object') {
            walkObject(entry, visitor, currentPath + '[' + index + ']');
          }
        });
      }
    });
  }

  function detectViolations(payload) {
    var violations = [];

    walkObject(payload, function (key, value, currentPath) {
      if (PROHIBITED_FIELDS.indexOf(key) !== -1) {
        violations.push({ type: 'field_name', field: key, path: currentPath });
      }

      if (typeof value === 'string') {
        PROHIBITED_VALUE_PATTERNS.forEach(function (entry) {
          if (entry.pattern.test(value)) {
            violations.push({ type: 'field_value', rule: entry.id, field: key, path: currentPath });
          }
        });
      }
    }, '');

    return violations;
  }

  function deriveTrafficClass(input) {
    var forceInternal = Boolean(input && input.forceInternal);
    var environment = String((input && input.environment) || '').trim().toLowerCase();
    var pathname = String((input && input.pathname) || '').trim();

    if (forceInternal || pathname.indexOf('/admin/') === 0) {
      return 'admin';
    }

    if (environment === 'dev') {
      return 'development';
    }

    if (environment === 'preview') {
      return 'preview';
    }

    return 'public';
  }

  function shouldSample(sampleKey, input) {
    var policy = SAMPLING[sampleKey];
    if (!policy) {
      return false;
    }

    var isInternal = Boolean(input && input.isInternal);
    if (isInternal && !policy.allowInternal) {
      return false;
    }

    if (policy.rate >= 1) {
      return true;
    }

    var seed = Number((input && input.seed) || Math.random());
    return seed < policy.rate;
  }

  return {
    VERSION: VERSION,
    ACCESS_POLICY: ACCESS_POLICY,
    ENTRY_SOURCES: ENTRY_SOURCES,
    PROHIBITED_FIELDS: PROHIBITED_FIELDS,
    PROHIBITED_VALUE_PATTERNS: PROHIBITED_VALUE_PATTERNS,
    RETENTION_POLICY: RETENTION_POLICY,
    SAMPLING: SAMPLING,
    TRAFFIC_CLASSES: TRAFFIC_CLASSES,
    VISIT_CONTEXTS: VISIT_CONTEXTS,
    deriveTrafficClass: deriveTrafficClass,
    detectViolations: detectViolations,
    shouldSample: shouldSample,
  };
});
