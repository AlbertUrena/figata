(function (root, factory) {
  var menuAllergens = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = menuAllergens;
  }
  if (root) {
    root.FigataMenuAllergens = menuAllergens;
  }
})(
  typeof globalThis !== "undefined"
    ? globalThis
    : (typeof window !== "undefined" ? window : this),
  function () {
    function isObject(value) {
      return Boolean(value) && typeof value === "object" && !Array.isArray(value);
    }

    function cloneJson(value) {
      return JSON.parse(JSON.stringify(value));
    }

    function normalizeText(value) {
      return String(value || "").trim();
    }

    function normalizeStringArray(value) {
      if (!Array.isArray(value)) return [];
      var seen = {};
      var result = [];
      value.forEach(function (entry) {
        var normalized = normalizeText(entry);
        if (!normalized || seen[normalized]) return;
        seen[normalized] = true;
        result.push(normalized);
      });
      return result;
    }

    function getCatalog(payloadOrMap) {
      if (isObject(payloadOrMap) && isObject(payloadOrMap.ingredients)) {
        return {
          ingredientsById: payloadOrMap.ingredients,
          allergensById: isObject(payloadOrMap.allergens) ? payloadOrMap.allergens : {}
        };
      }

      return {
        ingredientsById: isObject(payloadOrMap) ? payloadOrMap : {},
        allergensById: {}
      };
    }

    function sanitizeAllergenIdList(rawIds, options) {
      var normalized = normalizeStringArray(rawIds);
      var allowedIds = options && isObject(options.allowedIds) ? options.allowedIds : null;

      if (!allowedIds || !Object.keys(allowedIds).length) {
        return normalized;
      }

      return normalized.filter(function (id) {
        return Boolean(allowedIds[id]);
      });
    }

    function sanitizeAllergenOverrides(input, options) {
      var source = isObject(input) ? input : {};
      var normalized = {};
      var allowedIds = options && isObject(options.allowedIds) ? options.allowedIds : null;

      if (Array.isArray(source.add)) {
        normalized.add = sanitizeAllergenIdList(source.add, { allowedIds: allowedIds });
      }

      if (Array.isArray(source.remove)) {
        normalized.remove = sanitizeAllergenIdList(source.remove, { allowedIds: allowedIds });
      }

      if (options && options.keepEmpty) {
        if (!Array.isArray(normalized.add)) normalized.add = [];
        if (!Array.isArray(normalized.remove)) normalized.remove = [];
        return normalized;
      }

      if (!Array.isArray(normalized.add) || !normalized.add.length) {
        delete normalized.add;
      }
      if (!Array.isArray(normalized.remove) || !normalized.remove.length) {
        delete normalized.remove;
      }

      if (!Object.keys(normalized).length) {
        return null;
      }

      return normalized;
    }

    function createEmptyReport() {
      return {
        automatic: {
          ids: [],
          sources_by_allergen: {},
          ingredient_ids: []
        },
        overrides: null,
        resolved: {
          ids: [],
          unattributed_ids: []
        }
      };
    }

    function deriveItemAllergenReport(item, ingredientsPayloadOrMap) {
      var catalog = getCatalog(ingredientsPayloadOrMap);
      var ingredientsById = catalog.ingredientsById;
      var allergensById = catalog.allergensById;
      var ingredientIds = normalizeStringArray(item && item.ingredients);
      var automaticIds = [];
      var automaticSeen = {};
      var sourcesByAllergen = {};
      var resolvedIds = [];
      var resolvedSeen = {};

      ingredientIds.forEach(function (ingredientId) {
        var ingredient = ingredientsById[ingredientId];
        if (!ingredient) return;

        var ingredientAllergens = normalizeStringArray(ingredient.allergens);
        ingredientAllergens.forEach(function (allergenId) {
          if (!automaticSeen[allergenId]) {
            automaticSeen[allergenId] = true;
            automaticIds.push(allergenId);
            sourcesByAllergen[allergenId] = [];
          }
          if (!sourcesByAllergen[allergenId].includes(ingredientId)) {
            sourcesByAllergen[allergenId].push(ingredientId);
          }
        });
      });

      automaticIds.forEach(function (allergenId) {
        resolvedSeen[allergenId] = true;
        resolvedIds.push(allergenId);
      });

      var overrides = sanitizeAllergenOverrides(item && item.allergen_overrides, {
        allowedIds: allergensById,
        keepEmpty: false
      });

      (overrides && Array.isArray(overrides.add) ? overrides.add : []).forEach(function (allergenId) {
        if (resolvedSeen[allergenId]) return;
        resolvedSeen[allergenId] = true;
        resolvedIds.push(allergenId);
      });

      if (overrides && Array.isArray(overrides.remove) && overrides.remove.length) {
        resolvedIds = resolvedIds.filter(function (allergenId) {
          return !overrides.remove.includes(allergenId);
        });
      }

      var unattributedIds = resolvedIds.filter(function (allergenId) {
        var sources = sourcesByAllergen[allergenId];
        return !Array.isArray(sources) || !sources.length;
      });

      return {
        automatic: {
          ids: automaticIds,
          sources_by_allergen: sourcesByAllergen,
          ingredient_ids: ingredientIds.filter(function (ingredientId) {
            return Boolean(ingredientsById[ingredientId]);
          })
        },
        overrides: overrides,
        resolved: {
          ids: resolvedIds,
          unattributed_ids: unattributedIds
        }
      };
    }

    function validateMenuAllergens(menuPayload, ingredientsPayload) {
      var report = {
        errors: [],
        warnings: [],
        itemIssuesById: {}
      };

      function ensureBucket(itemId) {
        if (!report.itemIssuesById[itemId]) {
          report.itemIssuesById[itemId] = {
            errors: [],
            warnings: []
          };
        }
        return report.itemIssuesById[itemId];
      }

      function pushItemIssue(itemId, severity, message) {
        var bucket = ensureBucket(itemId);
        bucket[severity === "error" ? "errors" : "warnings"].push(message);
        report[severity === "error" ? "errors" : "warnings"].push(message);
      }

      function pushGlobal(severity, message) {
        report[severity === "error" ? "errors" : "warnings"].push(message);
      }

      if (!isObject(menuPayload)) {
        pushGlobal("error", "menu debe ser un objeto JSON");
        return report;
      }

      var catalog = getCatalog(ingredientsPayload);
      var ingredientsById = catalog.ingredientsById;
      var allergensById = catalog.allergensById;
      var sections = Array.isArray(menuPayload.sections) ? menuPayload.sections : [];

      sections.forEach(function (section) {
        var items = Array.isArray(section && section.items) ? section.items : [];
        items.forEach(function (item) {
          var itemId = normalizeText(item && item.id) || "(sin-id)";

          if (!Array.isArray(item && item.ingredients)) {
            pushItemIssue(itemId, "warning", "ingredients debe ser array en item: " + itemId);
          } else {
            item.ingredients.forEach(function (ingredientId) {
              var normalizedIngredientId = normalizeText(ingredientId);
              if (!normalizedIngredientId) return;
              if (!ingredientsById[normalizedIngredientId]) {
                pushItemIssue(
                  itemId,
                  "error",
                  "Ingrediente desconocido en item '" + itemId + "': " + normalizedIngredientId
                );
              }
            });
          }

          if (Object.prototype.hasOwnProperty.call(item || {}, "allergens")) {
            pushItemIssue(itemId, "warning", "item.allergens es legacy y debe eliminarse.");
          }

          if (
            typeof (item && item.allergen_overrides) !== "undefined" &&
            item.allergen_overrides !== null &&
            !isObject(item.allergen_overrides)
          ) {
            pushItemIssue(itemId, "error", "allergen_overrides debe ser objeto cuando existe.");
            return;
          }

          var rawOverrides = isObject(item && item.allergen_overrides) ? item.allergen_overrides : null;
          if (!rawOverrides) return;

          ["add", "remove"].forEach(function (key) {
            var value = rawOverrides[key];
            if (typeof value === "undefined") return;
            if (!Array.isArray(value)) {
              pushItemIssue(itemId, "error", "allergen_overrides." + key + " debe ser array.");
              return;
            }
            normalizeStringArray(value).forEach(function (allergenId) {
              if (!allergensById[allergenId]) {
                pushItemIssue(
                  itemId,
                  "error",
                  "Alergeno invalido en allergen_overrides." + key + ": " + allergenId
                );
              }
            });
          });

          var sanitized = sanitizeAllergenOverrides(rawOverrides, {
            allowedIds: allergensById,
            keepEmpty: true
          });
          var overlaps = (sanitized.add || []).filter(function (allergenId) {
            return (sanitized.remove || []).includes(allergenId);
          });
          if (overlaps.length) {
            pushItemIssue(
              itemId,
              "error",
              "allergen_overrides no puede repetir IDs en add/remove: " + overlaps.join(", ")
            );
          }
        });
      });

      return report;
    }

    return {
      version: 1,
      sanitizeAllergenOverrides: sanitizeAllergenOverrides,
      deriveItemAllergenReport: deriveItemAllergenReport,
      validateMenuAllergens: validateMenuAllergens,
      createEmptyReport: createEmptyReport,
      _private: {
        normalizeStringArray: normalizeStringArray
      }
    };
  }
);
