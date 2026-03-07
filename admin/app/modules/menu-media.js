// admin/app/modules/menu-media.js
// Extracted from admin/app/app.js — Phase 11 refactor
// Menu media path resolution, image fallback, local dev media fetching, JSON fetch helper.
// Dependencies: FigataAdmin.constants, FigataAdmin.renderUtils

(function () {
  "use strict";

  var ns = window.FigataAdmin = window.FigataAdmin || {};
  var C = ns.constants;
  var RU = ns.renderUtils;

  function resolveMenuMediaPath(ctx, rawPath, allowFallback) {
    var candidates = RU.buildMenuMediaCandidates(rawPath);
    if (!candidates.length) return "";

    var knownPaths = ctx.state.indexes && ctx.state.indexes.menuMediaPathSet ? ctx.state.indexes.menuMediaPathSet : {};
    for (var i = 0; i < candidates.length; i += 1) {
      var candidate = candidates[i];
      if (knownPaths[candidate]) {
        return candidate;
      }
    }

    if (!allowFallback) return "";

    for (var j = 0; j < candidates.length; j += 1) {
      var fallbackCandidate = candidates[j];
      if (RU.isMenuMediaPath(fallbackCandidate) || RU.isSvgPlaceholderPath(fallbackCandidate)) {
        return fallbackCandidate;
      }
    }

    return candidates[0];
  }

  function setImageElementSourceWithFallback(imageElement, path, fallbackPath) {
    if (!imageElement) return;

    var fallback = RU.resolveAssetPath(fallbackPath || C.MENU_PLACEHOLDER_IMAGE);
    var resolved = RU.resolveAssetPath(path || fallbackPath || C.MENU_PLACEHOLDER_IMAGE);

    imageElement.dataset.fallbackApplied = "0";
    imageElement.onerror = function () {
      if (imageElement.dataset.fallbackApplied === "1") return;
      imageElement.dataset.fallbackApplied = "1";
      imageElement.src = fallback;
    };

    imageElement.src = resolved;
  }

  async function fetchLocalMenuMediaPaths() {
    if (!ns.auth.isLocalDevHost()) return [];

    try {
      var response = await fetch(C.LOCAL_MEDIA_OPTIONS_ENDPOINT, { cache: "no-store" });
      if (!response.ok) return [];

      var payload = await response.json();
      var paths = Array.isArray(payload && payload.paths) ? payload.paths : [];
      var unique = [];
      paths.forEach(function (path) {
        var normalized = RU.toRelativeAssetPath(path);
        if (!normalized) return;
        if (!RU.isMenuMediaPath(normalized) && !RU.isSvgPlaceholderPath(normalized)) return;
        if (unique.includes(normalized)) return;
        unique.push(normalized);
      });

      unique.sort(function (a, b) {
        return RU.normalizeText(a).localeCompare(RU.normalizeText(b));
      });

      return unique;
    } catch (_error) {
      return [];
    }
  }

  async function fetchJson(endpoint) {
    var response = await fetch(endpoint, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(endpoint + " devolvio " + response.status);
    }
    return response.json();
  }

  ns.menuMedia = {
    resolveMenuMediaPath: resolveMenuMediaPath,
    setImageElementSourceWithFallback: setImageElementSourceWithFallback,
    fetchLocalMenuMediaPaths: fetchLocalMenuMediaPaths,
    fetchJson: fetchJson
  };
})();
