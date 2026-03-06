// admin/app/modules/utils.js
// Extracted from admin/app/app.js — Phase 1 refactor
// Pure utility functions with no state or DOM dependencies.

(function () {
  "use strict";

  var ns = window.FigataAdmin = window.FigataAdmin || {};

  function deepClone(value) {
    if (typeof window.structuredClone === "function") {
      return window.structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value));
  }

  function getInitials(value) {
    var text = String(value || "").trim();
    if (!text) return "U";

    var parts = text.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return (parts[0].slice(0, 1) + parts[1].slice(0, 1)).toUpperCase();
  }

  function downloadJsonFile(filename, payload) {
    var jsonContent = JSON.stringify(payload, null, 2) + "\n";
    var blob = new Blob([jsonContent], { type: "application/json;charset=utf-8" });
    var url = window.URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(function () {
      window.URL.revokeObjectURL(url);
    }, 0);
  }

  function parseCssTimeToMs(value) {
    var normalized = String(value || "").trim();
    if (!normalized) return 0;
    var numeric = Number.parseFloat(normalized);
    if (!Number.isFinite(numeric)) return 0;
    return normalized.indexOf("ms") !== -1 ? numeric : numeric * 1000;
  }

  ns.utils = {
    deepClone: deepClone,
    getInitials: getInitials,
    downloadJsonFile: downloadJsonFile,
    parseCssTimeToMs: parseCssTimeToMs
  };
})();
