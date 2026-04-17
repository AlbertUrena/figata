(function (root, factory) {
  var exported = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = exported;
  }

  root.FigataAnalyticsIdentity = exported;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  var STORAGE_KEYS = {
    visitor: 'figata.analytics.visitor.v1',
    session: 'figata.analytics.session.v1',
  };

  var DEFAULT_INACTIVITY_MS = 30 * 60 * 1000;

  function getStorage(type) {
    try {
      if (type === 'session' && typeof window !== 'undefined' && window.sessionStorage) {
        return window.sessionStorage;
      }

      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage;
      }
    } catch (_error) {
      return null;
    }

    return null;
  }

  function readJson(storage, key) {
    if (!storage) {
      return null;
    }

    try {
      var raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (_error) {
      return null;
    }
  }

  function writeJson(storage, key, value) {
    if (!storage) {
      return;
    }

    try {
      storage.setItem(key, JSON.stringify(value));
    } catch (_error) {
      // ignore write failures
    }
  }

  function createId(prefix) {
    var random = '';

    try {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        random = crypto.randomUUID().replace(/-/g, '');
      }
    } catch (_error) {
      random = '';
    }

    if (!random) {
      random = Math.random().toString(36).slice(2) + Date.now().toString(36);
    }

    return prefix + '_' + random.slice(0, 26);
  }

  function ensureVisitor(now) {
    var storage = getStorage('local');
    var visitor = readJson(storage, STORAGE_KEYS.visitor);
    var createdFresh = false;

    if (!visitor || !visitor.id) {
      createdFresh = true;
      visitor = {
        id: createId('vst'),
        firstSeenAt: now,
        lastSeenAt: now,
        sessionCount: 0,
      };
    }

    visitor.lastSeenAt = now;
    writeJson(storage, STORAGE_KEYS.visitor, visitor);

    return {
      id: visitor.id,
      firstSeenAt: visitor.firstSeenAt,
      lastSeenAt: visitor.lastSeenAt,
      sessionCount: visitor.sessionCount || 0,
      isReturning: (visitor.sessionCount || 0) > 0,
      createdFresh: createdFresh,
    };
  }

  function ensureSession(options) {
    var now = Number((options && options.now) || Date.now());
    var inactivityMs = Number((options && options.inactivityMs) || DEFAULT_INACTIVITY_MS);
    var visitor = ensureVisitor(now);
    var localStorageRef = getStorage('local');
    var sessionStorageRef = getStorage('session') || localStorageRef;
    var storedSession = readJson(sessionStorageRef, STORAGE_KEYS.session) || readJson(localStorageRef, STORAGE_KEYS.session);
    var isExpired =
      !storedSession ||
      !storedSession.id ||
      storedSession.visitorId !== visitor.id ||
      now - Number(storedSession.lastSeenAt || 0) > inactivityMs;

    if (isExpired) {
      storedSession = {
        id: createId('ses'),
        visitorId: visitor.id,
        startedAt: now,
        lastSeenAt: now,
        sequence: (visitor.sessionCount || 0) + 1,
      };

      var visitorPersisted = readJson(localStorageRef, STORAGE_KEYS.visitor) || {};
      visitorPersisted.id = visitor.id;
      visitorPersisted.firstSeenAt = visitor.firstSeenAt;
      visitorPersisted.lastSeenAt = now;
      visitorPersisted.sessionCount = storedSession.sequence;
      writeJson(localStorageRef, STORAGE_KEYS.visitor, visitorPersisted);
      visitor.isReturning = storedSession.sequence > 1;
      visitor.sessionCount = storedSession.sequence;
    } else {
      storedSession.lastSeenAt = now;
    }

    writeJson(sessionStorageRef, STORAGE_KEYS.session, storedSession);
    writeJson(localStorageRef, STORAGE_KEYS.session, storedSession);

    return {
      visitor: {
        id: visitor.id,
        firstSeenAt: visitor.firstSeenAt,
        lastSeenAt: now,
        sessionCount: visitor.sessionCount,
        isReturning: visitor.isReturning,
      },
      session: {
        id: storedSession.id,
        startedAt: storedSession.startedAt,
        lastSeenAt: storedSession.lastSeenAt,
        sequence: storedSession.sequence,
        createdFresh: isExpired,
        inactivityMs: inactivityMs,
      },
    };
  }

  function reset() {
    var localStorageRef = getStorage('local');
    var sessionStorageRef = getStorage('session');

    [localStorageRef, sessionStorageRef].forEach(function (storage) {
      if (!storage) {
        return;
      }

      try {
        storage.removeItem(STORAGE_KEYS.visitor);
        storage.removeItem(STORAGE_KEYS.session);
      } catch (_error) {
        // ignore reset failure
      }
    });
  }

  return {
    DEFAULT_INACTIVITY_MS: DEFAULT_INACTIVITY_MS,
    STORAGE_KEYS: STORAGE_KEYS,
    ensureSession: ensureSession,
    reset: reset,
  };
});
