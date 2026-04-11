(function (root, factory) {
  var contract = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = contract;
  }
  if (root) {
    root.FigataMediaContract = contract;
  }
})(
  typeof globalThis !== 'undefined'
    ? globalThis
    : (typeof window !== 'undefined' ? window : this),
  function () {
    'use strict';

    // ---- helpers ----

    function isObject(value) {
      return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
    }

    function isSafeUrl(url) {
      if (!url) return true;
      var str = String(url).trim();
      return /^(https?|mailto|tel):/i.test(str) || str[0] === '/' || !/:/.test(str);
    }

    function isInlineImageDataUri(value) {
      if (!value) return true;
      var str = String(value).trim();
      return /^data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/=]+$/i.test(str);
    }

    function normalizePath(value) {
      return String(value || '').trim().replace(/^\/+/, '');
    }

    function normalizeText(value) {
      return typeof value === 'string' ? value.trim() : '';
    }

    // ---- schema detection ----

    function detectSchemaVersion(payload) {
      if (!isObject(payload)) return 0;
      var schema = normalizeText(payload.schema);
      if (schema === 'figata.media.v2') return 2;
      if (schema === 'figata.media.v1') return 1;
      // Heuristic: if any item has "source", treat as v2
      var items = isObject(payload.items) ? payload.items : {};
      var keys = Object.keys(items);
      for (var i = 0; i < keys.length; i++) {
        if (isObject(items[keys[i]]) && typeof items[keys[i]].source === 'string') {
          return 2;
        }
      }
      return 1;
    }

    // ---- migration v1 → v2 ----

    function migrateItemV1toV2(entry) {
      if (!isObject(entry)) return entry;
      // Already v2
      if (typeof entry.source === 'string') return entry;

      var cardPath = normalizePath(entry.card);
      var hoverPath = normalizePath(entry.hover);
      var modalPath = normalizePath(entry.modal);

      var source = cardPath || modalPath || '';

      var overrides = {};
      // card override only if it differs from what we chose as source
      overrides.card = '';
      // hover is an override if it exists and differs from source
      overrides.hover = (hoverPath && hoverPath !== source) ? hoverPath : '';
      // modal is an override if it exists and differs from source
      overrides.modal = (modalPath && modalPath !== source) ? modalPath : '';
      // gallery passes through
      overrides.gallery = Array.isArray(entry.gallery) ? entry.gallery.slice() : [];

      return {
        source: source,
        alt: normalizeText(entry.alt),
        overrides: overrides,
        dominantColor: normalizeText(entry.dominantColor),
        version: 2
      };
    }

    function migrateToV2(payload) {
      if (!isObject(payload)) return payload;
      if (detectSchemaVersion(payload) >= 2) return payload;

      var result = {
        version: 2,
        schema: 'figata.media.v2',
        updatedAt: normalizeText(payload.updatedAt) || new Date().toISOString(),
        updatedBy: normalizeText(payload.updatedBy) || 'migration',
        notes: normalizeText(payload.notes),
        items: {},
        defaults: isObject(payload.defaults) ? {
          card: normalizePath(payload.defaults.card),
          modal: normalizePath(payload.defaults.modal),
          hover: normalizePath(payload.defaults.hover),
          alt: normalizeText(payload.defaults.alt)
        } : {},
        global: isObject(payload.global) ? payload.global : {
          homepage: {},
          branding: {},
          utility: {}
        }
      };

      var sourceItems = isObject(payload.items) ? payload.items : {};
      Object.keys(sourceItems).forEach(function (key) {
        result.items[key] = migrateItemV1toV2(sourceItems[key]);
      });

      return result;
    }

    // ---- resolve ----

    function resolveMediaPath(entry, variant, defaults) {
      defaults = defaults || {};
      if (!isObject(entry)) {
        return normalizePath(defaults[variant] || defaults.card || '');
      }

      var source = normalizePath(entry.source);
      var overrides = isObject(entry.overrides) ? entry.overrides : {};

      // v1 compat: entry has card/hover/modal directly
      if (!source && typeof entry.card === 'string') {
        source = normalizePath(entry.card);
      }

      var safeVariant = variant || 'card';
      var overridePath = '';

      if (safeVariant === 'card') {
        overridePath = normalizePath(overrides.card);
      } else if (safeVariant === 'hover') {
        overridePath = normalizePath(overrides.hover);
      } else if (safeVariant === 'modal') {
        overridePath = normalizePath(overrides.modal);
      }

      // Use override if present, otherwise source, otherwise default
      if (overridePath) return overridePath;
      if (source) return source;
      return normalizePath(defaults[safeVariant] || defaults.card || '');
    }

    function resolveItemAlt(entry, defaults) {
      defaults = defaults || {};
      if (!isObject(entry)) return normalizeText(defaults.alt);
      return normalizeText(entry.alt) || normalizeText(defaults.alt) || '';
    }

    function resolveItemGallery(entry) {
      if (!isObject(entry)) return [];
      var overrides = isObject(entry.overrides) ? entry.overrides : {};
      if (Array.isArray(overrides.gallery)) {
        return overrides.gallery.map(normalizePath).filter(Boolean);
      }
      if (Array.isArray(entry.gallery)) {
        return entry.gallery.map(normalizePath).filter(Boolean);
      }
      return [];
    }

    // ---- validate ----

    function validateMediaContract(payload) {
      var report = {
        errors: [],
        warnings: [],
        issues: []
      };

      function pushIssue(severity, message) {
        if (severity === 'error') {
          report.errors.push(message);
        } else {
          report.warnings.push(message);
        }
        report.issues.push({ severity: severity, message: message });
      }

      if (!isObject(payload)) {
        pushIssue('error', 'Media data must be a JSON object.');
        return report;
      }

      // Schema
      var schemaVersion = detectSchemaVersion(payload);
      if (schemaVersion === 0) {
        pushIssue('error', 'Unable to detect media schema version.');
        return report;
      }

      // Items
      var items = isObject(payload.items) ? payload.items : {};
      var itemKeys = Object.keys(items);

      if (itemKeys.length === 0) {
        pushIssue('warning', 'No items found in media data.');
      }

      var itemsWithoutSource = 0;
      var itemsWithEmptyAlt = 0;

      itemKeys.forEach(function (key) {
        var entry = items[key];
        if (!isObject(entry)) {
          pushIssue('warning', 'media.items["' + key + '"] is not an object.');
          return;
        }

        // v2 checks
        if (schemaVersion >= 2) {
          var src = normalizePath(entry.source);
          if (!src) {
            itemsWithoutSource++;
          }
          if (!isSafeUrl(src)) {
            pushIssue('error', 'Unsafe URL in media.items["' + key + '"].source');
          }

          var overrides = isObject(entry.overrides) ? entry.overrides : {};
          ['card', 'hover', 'modal'].forEach(function (v) {
            var op = normalizePath(overrides[v]);
            if (op && !isSafeUrl(op)) {
              pushIssue('error', 'Unsafe URL in media.items["' + key + '"].overrides.' + v);
            }
          });

          if (Array.isArray(overrides.gallery)) {
            overrides.gallery.forEach(function (gp, gi) {
              var np = normalizePath(gp);
              if (np && !isSafeUrl(np)) {
                pushIssue('error', 'Unsafe URL in media.items["' + key + '"].overrides.gallery[' + gi + ']');
              }
            });
          }
        } else {
          // v1 checks
          var cardPath = normalizePath(entry.card);
          if (!cardPath) {
            itemsWithoutSource++;
          }
          ['card', 'hover', 'modal'].forEach(function (v) {
            var p = normalizePath(entry[v]);
            if (p && !isSafeUrl(p)) {
              pushIssue('error', 'Unsafe URL in media.items["' + key + '"].' + v);
            }
          });
        }

        if (!normalizeText(entry.alt)) {
          itemsWithEmptyAlt++;
        }

        var lqip = normalizeText(entry.lqip);
        if (lqip && !isInlineImageDataUri(lqip)) {
          pushIssue('warning', 'Formato invalido en media.items["' + key + '"].lqip');
        }
        if (lqip && lqip.length > 12000) {
          pushIssue('warning', 'LQIP muy pesado en media.items["' + key + '"].lqip');
        }

        if (isObject(entry.detailSlideLqip)) {
          Object.keys(entry.detailSlideLqip).forEach(function (slidePath) {
            var normalizedSlidePath = normalizePath(slidePath);
            var slideLqip = normalizeText(entry.detailSlideLqip[slidePath]);

            if (!normalizedSlidePath) {
              pushIssue('warning', 'Clave invalida en media.items["' + key + '"].detailSlideLqip');
            } else if (!isSafeUrl(normalizedSlidePath)) {
              pushIssue('error', 'Unsafe URL en media.items["' + key + '"].detailSlideLqip["' + slidePath + '"]');
            }

            if (slideLqip && !isInlineImageDataUri(slideLqip)) {
              pushIssue('warning', 'Formato invalido en media.items["' + key + '"].detailSlideLqip["' + slidePath + '"]');
            }

            if (slideLqip && slideLqip.length > 12000) {
              pushIssue('warning', 'LQIP de slide muy pesado en media.items["' + key + '"].detailSlideLqip["' + slidePath + '"]');
            }
          });
        }
      });

      if (itemsWithoutSource > 0) {
        pushIssue('warning', itemsWithoutSource + ' item(s) without a source image.');
      }

      if (itemsWithEmptyAlt > 0) {
        pushIssue('warning', itemsWithEmptyAlt + ' item(s) without alt text.');
      }

      // Defaults
      var defaults = isObject(payload.defaults) ? payload.defaults : {};
      if (!normalizePath(defaults.card)) {
        pushIssue('warning', 'defaults.card is missing or empty.');
      }

      // Global (v2)
      if (schemaVersion >= 2) {
        if (!isObject(payload.global)) {
          pushIssue('warning', '"global" section is missing.');
        }
      }

      return report;
    }

    // ---- create empty item ----

    function createEmptyItem(itemId, itemName) {
      return {
        source: '',
        alt: normalizeText(itemName) || normalizeText(itemId) || '',
        overrides: {
          card: '',
          hover: '',
          modal: '',
          gallery: []
        },
        dominantColor: '',
        version: 2
      };
    }

    // ---- public API ----

    return {
      detectSchemaVersion: detectSchemaVersion,
      migrateToV2: migrateToV2,
      migrateItemV1toV2: migrateItemV1toV2,
      resolveMediaPath: resolveMediaPath,
      resolveItemAlt: resolveItemAlt,
      resolveItemGallery: resolveItemGallery,
      validateMediaContract: validateMediaContract,
      createEmptyItem: createEmptyItem
    };
  }
);
