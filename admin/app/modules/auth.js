// admin/app/modules/auth.js
// Extracted from admin/app/app.js — Phase 2 refactor
// Netlify Identity helpers and dev bypass logic.
// No state, no DOM elements, no rendering.

(function () {
  "use strict";

  var ns = window.FigataAdmin = window.FigataAdmin || {};
  var DEV_AUTH_BYPASS_KEY = ns.constants.DEV_AUTH_BYPASS_KEY;

  function getIdentity() {
    return window.netlifyIdentity || null;
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
      "";

    if (name) return String(name).trim();

    var email = getUserEmail(user);
    var localPart = String(email || "").split("@")[0];
    if (localPart) return localPart;

    return "Usuario";
  }

  ns.auth = {
    getIdentity: getIdentity,
    isLocalDevHost: isLocalDevHost,
    setDevAuthBypass: setDevAuthBypass,
    isDevAuthBypassEnabled: isDevAuthBypassEnabled,
    applyDevAuthBypassQueryToggle: applyDevAuthBypassQueryToggle,
    createLocalBypassUser: createLocalBypassUser,
    getUserEmail: getUserEmail,
    getUserDisplayName: getUserDisplayName
  };
})();
