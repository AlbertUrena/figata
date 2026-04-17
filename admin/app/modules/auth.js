// admin/app/modules/auth.js
// Cloudflare Access + local dev bypass helpers.
// The browser does not authenticate inside the app anymore; it only verifies the
// already-authenticated session via /api/session.

(function () {
  "use strict";

  var ns = window.FigataAdmin = window.FigataAdmin || {};
  var constants = ns.constants || {};
  var DEV_AUTH_BYPASS_KEY = constants.DEV_AUTH_BYPASS_KEY;
  var SESSION_ENDPOINT = constants.CLOUDFLARE_SESSION_ENDPOINT || "/api/session";
  var LOGOUT_URL = constants.CLOUDFLARE_LOGOUT_PATH || "/cdn-cgi/access/logout";

  function getIdentity() {
    return null;
  }

  function isLocalDevHost() {
    var hostname = window.location.hostname;
    return hostname === "127.0.0.1" || hostname === "localhost" || hostname === "[::1]";
  }

  function setDevAuthBypass(enabled) {
    try {
      if (enabled) {
        window.localStorage.setItem(DEV_AUTH_BYPASS_KEY, "1");
      } else {
        window.localStorage.removeItem(DEV_AUTH_BYPASS_KEY);
      }
    } catch (_error) {
      // ignore storage errors
    }
  }

  function isDevAuthBypassEnabled() {
    if (!isLocalDevHost()) return false;
    try {
      return window.localStorage.getItem(DEV_AUTH_BYPASS_KEY) === "1";
    } catch (_error) {
      return false;
    }
  }

  function applyDevAuthBypassQueryToggle() {
    if (!isLocalDevHost()) return;
    var params = new URLSearchParams(window.location.search);
    var value = params.get("devAuthBypass");
    if (value === "1") {
      setDevAuthBypass(true);
    } else if (value === "0") {
      setDevAuthBypass(false);
    }
  }

  function createLocalBypassUser() {
    return {
      id: "local-dev-bypass",
      email: "local-admin@figata.local",
      user_metadata: {
        name: "Local Admin (Bypass)"
      }
    };
  }

  function getUserEmail(user) {
    if (!user) return "";
    return user.email || (user.user_metadata && user.user_metadata.email) || "Usuario autenticado";
  }

  function getUserDisplayName(user) {
    if (!user) return "Usuario";

    var metadata = user.user_metadata || {};
    var appMetadata = user.app_metadata || {};
    var name =
      metadata.full_name ||
      metadata.name ||
      appMetadata.full_name ||
      appMetadata.name ||
      user.display_name ||
      user.name ||
      "";

    if (name) return String(name).trim();

    var email = getUserEmail(user);
    var localPart = String(email || "").split("@")[0];
    if (localPart) return localPart;

    return "Usuario";
  }

  function buildRequestHeaders() {
    return {
      "X-Requested-With": "XMLHttpRequest",
      "Cache-Control": "no-store"
    };
  }

  async function fetchSession() {
    var response = await fetch(SESSION_ENDPOINT, {
      method: "GET",
      headers: buildRequestHeaders()
    });

    if (!response.ok) {
      var errorMessage = "No se pudo verificar la sesion protegida.";
      try {
        var payload = await response.json();
        if (payload && payload.error) {
          errorMessage = String(payload.error);
        }
      } catch (_error) {
        errorMessage = errorMessage + " HTTP " + response.status;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  function beginLogin() {
    if (isLocalDevHost()) {
      window.location.reload();
      return;
    }

    // Access normally challenges before this view appears. If we land here, a reload
    // is enough to re-enter the Access gate and/or refresh the application token.
    window.location.reload();
  }

  function logout() {
    if (isLocalDevHost()) {
      window.location.reload();
      return;
    }

    window.location.assign(LOGOUT_URL);
  }

  ns.auth = {
    beginLogin: beginLogin,
    buildRequestHeaders: buildRequestHeaders,
    createLocalBypassUser: createLocalBypassUser,
    fetchSession: fetchSession,
    getIdentity: getIdentity,
    getUserDisplayName: getUserDisplayName,
    getUserEmail: getUserEmail,
    isDevAuthBypassEnabled: isDevAuthBypassEnabled,
    isLocalDevHost: isLocalDevHost,
    logout: logout,
    setDevAuthBypass: setDevAuthBypass,
    applyDevAuthBypassQueryToggle: applyDevAuthBypassQueryToggle
  };
})();
