(function (root, factory) {
  var exported = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = exported;
  }

  root.FigataAnalyticsInternal = exported;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  var STORAGE_KEY = 'figata.analytics.internal.v1';

  function getStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage;
      }
    } catch (_error) {
      return null;
    }

    return null;
  }

  function readStoredFlag() {
    var storage = getStorage();
    if (!storage) {
      return null;
    }

    try {
      return storage.getItem(STORAGE_KEY);
    } catch (_error) {
      return null;
    }
  }

  function writeStoredFlag(value) {
    var storage = getStorage();
    if (!storage) {
      return;
    }

    try {
      if (value === null) {
        storage.removeItem(STORAGE_KEY);
        return;
      }
      storage.setItem(STORAGE_KEY, value);
    } catch (_error) {
      // ignore write failures
    }
  }

  function syncFromQuery(search) {
    var params = new URLSearchParams(String(search || ''));
    if (params.get('internal') === '1' || params.get('qa') === '1') {
      writeStoredFlag('internal');
      return 'internal';
    }

    if (params.get('internal') === '0') {
      writeStoredFlag(null);
      return null;
    }

    return readStoredFlag();
  }

  function resolveState(options) {
    var environment = String((options && options.environment) || '').trim().toLowerCase();
    var pathname = String((options && options.pathname) || '').trim();
    var forceInternal = Boolean(options && options.forceInternal);
    var queryFlag = syncFromQuery(options && options.search);

    if (forceInternal || pathname.indexOf('/admin/') === 0) {
      return { isInternal: true, trafficClass: 'admin', reason: 'admin_route' };
    }

    if (environment === 'dev') {
      return { isInternal: true, trafficClass: 'development', reason: 'dev_environment' };
    }

    if (environment === 'preview') {
      return { isInternal: true, trafficClass: 'preview', reason: 'preview_environment' };
    }

    if (queryFlag === 'internal') {
      return { isInternal: true, trafficClass: 'internal', reason: 'explicit_override' };
    }

    return { isInternal: false, trafficClass: 'public', reason: 'public_default' };
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    resolveState: resolveState,
    syncFromQuery: syncFromQuery,
    writeStoredFlag: writeStoredFlag,
  };
});
