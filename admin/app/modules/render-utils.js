// admin/app/modules/render-utils.js
// Extracted from admin/app/app.js — Phase 10 refactor
// Core rendering helpers: escapeHtml, normalizeText, slugify, buildHtmlAttributes,
// asset path helpers, and the fig-toggle component system.

(function () {
  "use strict";

  var ns = window.FigataAdmin = window.FigataAdmin || {};
  var C = ns.constants;

  // --- Text helpers ---

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function slugify(value) {
    return normalizeText(value)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .trim();
  }

  function buildHtmlAttributes(attributes) {
    if (!attributes || typeof attributes !== "object") return "";
    var output = "";
    Object.keys(attributes).forEach(function (key) {
      var value = attributes[key];
      if (value === null || value === undefined || value === false) return;
      if (value === true) {
        output += " " + key;
        return;
      }
      output += " " + key + "=\"" + escapeHtml(String(value)) + "\"";
    });
    return output;
  }

  // --- Asset path helpers ---

  function resolveAssetPath(path) {
    if (!path) return "/" + C.MENU_PLACEHOLDER_IMAGE;
    if (/^https?:\/\//i.test(path)) return path;
    if (path[0] === "/") return path;
    return "/" + path.replace(/^\.\//, "");
  }

  function toRelativeAssetPath(path) {
    return String(path || "")
      .trim()
      .replace(/\\/g, "/")
      .replace(/^\.\/+/, "")
      .replace(/^\/+/, "");
  }

  function getPathExtension(path) {
    var match = String(path || "").match(/\.([a-z0-9]+)$/i);
    return match ? match[1].toLowerCase() : "";
  }

  function removePathExtension(path) {
    return String(path || "").replace(/\.[a-z0-9]+$/i, "");
  }

  function isSvgPlaceholderPath(path) {
    var relative = toRelativeAssetPath(path);
    return (
      relative === C.MENU_PLACEHOLDER_IMAGE ||
      relative === C.MENU_MODAL_PLACEHOLDER_IMAGE ||
      (relative.indexOf(C.MENU_MEDIA_ROOT + "/placeholders/") === 0 && getPathExtension(relative) === "svg")
    );
  }

  function isMenuMediaPath(path) {
    var relative = toRelativeAssetPath(path);
    if (!relative) return false;
    if (isSvgPlaceholderPath(relative)) return true;
    if (relative.indexOf(C.MENU_MEDIA_ROOT + "/") !== 0) return false;
    return getPathExtension(relative) === "webp";
  }

  function buildMenuMediaCandidates(rawPath) {
    var relative = toRelativeAssetPath(rawPath);
    if (!relative) return [];
    if (/^https?:\/\//i.test(relative)) return [relative];
    if (isSvgPlaceholderPath(relative)) return [relative];

    var candidates = [];
    function pushCandidate(value) {
      var normalized = toRelativeAssetPath(value);
      if (!normalized) return;
      if (candidates.includes(normalized)) return;
      candidates.push(normalized);
    }

    var extension = getPathExtension(relative);
    var hasExtension = Boolean(extension);
    var basename = relative.split("/").pop() || "";
    var baseWithoutExt = removePathExtension(basename);
    var parentPath = relative.indexOf("/") >= 0
      ? relative.slice(0, relative.lastIndexOf("/") + 1)
      : "";

    if (relative.indexOf("menu/") === 0) {
      pushCandidate("assets/" + relative);
    }

    if (relative.indexOf(C.MENU_MEDIA_ROOT + "/") === 0) {
      pushCandidate(relative);
    }

    if (relative.indexOf("assets/") === 0 && relative.indexOf(C.MENU_MEDIA_ROOT + "/") !== 0 && baseWithoutExt) {
      pushCandidate(C.MENU_MEDIA_ROOT + "/" + baseWithoutExt + ".webp");
    }

    if (relative.indexOf("/") === -1 && baseWithoutExt) {
      pushCandidate(C.MENU_MEDIA_ROOT + "/" + baseWithoutExt + ".webp");
    }

    if (relative.indexOf(C.MENU_MEDIA_ROOT + "/") === 0 && baseWithoutExt) {
      pushCandidate(parentPath + baseWithoutExt + ".webp");
      if (!hasExtension) {
        pushCandidate(relative + ".webp");
      }
    }

    if (relative.indexOf("menu/") === 0 && baseWithoutExt) {
      var menuParent = "assets/" + parentPath;
      pushCandidate(menuParent + baseWithoutExt + ".webp");
    }

    pushCandidate(relative);
    return candidates;
  }

  // --- Toggle component ---

  var toggleHandlerRegistry = {};
  var toggleHandlerSequence = 0;

  function registerToggleHandler(handler) {
    if (typeof handler !== "function") return "";
    toggleHandlerSequence += 1;
    var handlerId = "fig_toggle_handler_" + toggleHandlerSequence;
    toggleHandlerRegistry[handlerId] = handler;
    return handlerId;
  }

  function resolveToggleChecked(control) {
    if (!control) return false;
    return control.getAttribute("aria-checked") === "true";
  }

  function setToggleChecked(control, checked) {
    if (!control) return;
    var safeChecked = Boolean(checked);
    control.setAttribute("aria-checked", safeChecked ? "true" : "false");
    control.classList.toggle("is-checked", safeChecked);
  }

  function setToggleDisabled(control, disabled) {
    if (!control) return;
    var safeDisabled = Boolean(disabled);
    control.disabled = safeDisabled;
    control.setAttribute("aria-disabled", safeDisabled ? "true" : "false");
  }

  function getToggleChecked(control) {
    return resolveToggleChecked(control);
  }

  function renderToggle(options) {
    options = options || {};
    var id = String(options.id || "").trim();
    var label = String(options.label || "");
    var checked = Boolean(options.checked);
    var disabled = Boolean(options.disabled);
    var labelPosition = options.labelPosition === "left" ? "left" : "right";

    var wrapperClasses = ["fig-toggle-field"];
    if (labelPosition === "left") wrapperClasses.push("fig-toggle-field--label-left");
    if (options.className) wrapperClasses.push(String(options.className));

    var wrapperAttributes = {};
    if (options.span) {
      wrapperAttributes["data-span"] = options.span;
    }
    if (options.wrapperDataAttributes && typeof options.wrapperDataAttributes === "object") {
      Object.keys(options.wrapperDataAttributes).forEach(function (key) {
        wrapperAttributes[key] = options.wrapperDataAttributes[key];
      });
    }

    var controlAttributes = {
      id: id,
      type: "button",
      class: "fig-toggle",
      role: "switch",
      "aria-checked": checked ? "true" : "false",
      "aria-disabled": disabled ? "true" : "false",
      "data-toggle-control": "true"
    };

    if (disabled) {
      controlAttributes.disabled = true;
    }

    if (options.title) {
      controlAttributes.title = options.title;
    }

    if (options.dataAttributes && typeof options.dataAttributes === "object") {
      Object.keys(options.dataAttributes).forEach(function (key) {
        controlAttributes[key] = options.dataAttributes[key];
      });
    }

    if (typeof options.onChange === "function") {
      controlAttributes["data-toggle-handler"] = registerToggleHandler(options.onChange);
    } else if (typeof options.onChange === "string" && options.onChange.trim()) {
      controlAttributes["data-toggle-handler"] = options.onChange.trim();
    }

    var labelId = id ? id + "-label" : "";
    if (label && labelId) {
      controlAttributes["aria-labelledby"] = labelId;
    } else if (label) {
      controlAttributes["aria-label"] = label;
    } else {
      controlAttributes["aria-label"] = options.ariaLabel || "Toggle";
    }

    var labelHtml = "";
    if (label) {
      var labelAttributes = {
        type: "button",
        class: "fig-toggle__label",
        "data-toggle-label-for": id
      };
      if (labelId) {
        labelAttributes.id = labelId;
      }
      if (disabled) {
        labelAttributes.disabled = true;
      }
      labelHtml = "<button" + buildHtmlAttributes(labelAttributes) + ">" + escapeHtml(label) + "</button>";
    }

    var controlHtml =
      "<button" + buildHtmlAttributes(controlAttributes) + ">" +
      "<span class=\"fig-toggle__track\"><span class=\"fig-toggle__knob\"></span></span>" +
      "</button>";

    var contentHtml = labelPosition === "left"
      ? (labelHtml + controlHtml)
      : (controlHtml + labelHtml);

    return "<div class=\"" + wrapperClasses.join(" ") + "\"" + buildHtmlAttributes(wrapperAttributes) + ">" +
      contentHtml +
      "</div>";
  }

  function triggerToggleChange(control, checked, event, fallbackOnChange) {
    var handlerId = control.getAttribute("data-toggle-handler");
    if (handlerId && typeof toggleHandlerRegistry[handlerId] === "function") {
      toggleHandlerRegistry[handlerId](checked, control, event);
    }

    if (typeof fallbackOnChange === "function") {
      fallbackOnChange(checked, control, event);
    }

    if (typeof window.CustomEvent === "function") {
      control.dispatchEvent(new window.CustomEvent("fig-toggle-change", {
        bubbles: true,
        detail: { checked: checked }
      }));
      return;
    }

    var legacyEvent = document.createEvent("CustomEvent");
    legacyEvent.initCustomEvent("fig-toggle-change", true, false, { checked: checked });
    control.dispatchEvent(legacyEvent);
  }

  function bindToggles(rootEl, options) {
    var root = rootEl || document;
    var fallbackOnChange = options && typeof options.onChange === "function"
      ? options.onChange
      : null;
    var controls = root.querySelectorAll("[data-toggle-control]");
    Array.prototype.forEach.call(controls, function (control) {
      setToggleChecked(control, resolveToggleChecked(control));
      setToggleDisabled(control, control.disabled || control.getAttribute("aria-disabled") === "true");

      if (control.getAttribute("data-toggle-bound") === "true") {
        return;
      }
      control.setAttribute("data-toggle-bound", "true");

      control.addEventListener("click", function (event) {
        if (control.disabled || control.getAttribute("aria-disabled") === "true") return;
        var nextChecked = !resolveToggleChecked(control);
        setToggleChecked(control, nextChecked);
        triggerToggleChange(control, nextChecked, event, fallbackOnChange);
      });

      control.addEventListener("keydown", function (event) {
        if (event.key !== " " && event.key !== "Enter") return;
        event.preventDefault();
        control.click();
      });
    });

    var labelButtons = root.querySelectorAll("[data-toggle-label-for]");
    Array.prototype.forEach.call(labelButtons, function (labelButton) {
      if (labelButton.getAttribute("data-toggle-bound") === "true") {
        return;
      }
      labelButton.setAttribute("data-toggle-bound", "true");

      labelButton.addEventListener("click", function () {
        var targetId = labelButton.getAttribute("data-toggle-label-for");
        if (!targetId) return;
        var control = document.getElementById(targetId);
        if (!control || !root.contains(control)) return;
        if (control.disabled || control.getAttribute("aria-disabled") === "true") return;
        control.focus();
        control.click();
      });
    });
  }

  ns.renderUtils = {
    // Text
    normalizeText: normalizeText,
    escapeHtml: escapeHtml,
    slugify: slugify,
    buildHtmlAttributes: buildHtmlAttributes,
    // Asset paths
    resolveAssetPath: resolveAssetPath,
    toRelativeAssetPath: toRelativeAssetPath,
    getPathExtension: getPathExtension,
    removePathExtension: removePathExtension,
    isSvgPlaceholderPath: isSvgPlaceholderPath,
    isMenuMediaPath: isMenuMediaPath,
    buildMenuMediaCandidates: buildMenuMediaCandidates,
    // Toggle component
    registerToggleHandler: registerToggleHandler,
    resolveToggleChecked: resolveToggleChecked,
    setToggleChecked: setToggleChecked,
    setToggleDisabled: setToggleDisabled,
    getToggleChecked: getToggleChecked,
    renderToggle: renderToggle,
    triggerToggleChange: triggerToggleChange,
    bindToggles: bindToggles
  };
})();
