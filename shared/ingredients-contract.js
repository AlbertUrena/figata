(function (root, factory) {
  var contract = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = contract;
  }
  if (root) {
    root.FigataIngredientsContract = contract;
  }
})(
  typeof globalThis !== 'undefined'
    ? globalThis
    : (typeof window !== 'undefined' ? window : this),
  function () {
    function isObject(value) {
      return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
    }

    function normalizeText(value) {
      return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
    }

    function normalizeIngredientAlias(value) {
      return normalizeText(value)
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .replace(/_+/g, '_');
    }

    function isLikelyValidIngredientIconPath(value) {
      var path = String(value || '').trim();
      if (!path) return false;
      if (/^https?:\/\//i.test(path)) return true;
      if (path[0] === '/') return true;
      if (path.indexOf('assets/') === 0) return true;
      return /\.(svg|webp|png|jpe?g|gif)$/i.test(path);
    }

    function buildMenuReferenceReport(menuPayload, ingredientsById) {
      var report = {
        invalidItems: [],
        invalidReferencesCount: 0
      };

      var menuSections = menuPayload && Array.isArray(menuPayload.sections)
        ? menuPayload.sections
        : [];

      menuSections.forEach(function (section) {
        var items = section && Array.isArray(section.items) ? section.items : [];
        items.forEach(function (item) {
          if (!item || !Array.isArray(item.ingredients) || !item.ingredients.length) return;

          var unknown = [];
          item.ingredients.forEach(function (ingredientId) {
            var normalizedId = String(ingredientId || '').trim();
            if (!normalizedId) return;
            if (!ingredientsById[normalizedId] && unknown.indexOf(normalizedId) === -1) {
              unknown.push(normalizedId);
            }
          });

          if (!unknown.length) return;
          report.invalidReferencesCount += unknown.length;
          report.invalidItems.push({
            id: item.id || '',
            label: item.name || item.id || 'Item sin nombre',
            unknownIngredients: unknown
          });
        });
      });

      return report;
    }

    function validateIngredientsContract(payload, options) {
      options = options || {};
      var normalizeAliases = Boolean(options.normalizeAliases);
      var menuPayload = options.menuPayload;
      var report = {
        errors: [],
        warnings: [],
        ingredientIssuesById: {},
        iconIssuesByKey: {},
        iconUsageByKey: {},
        menuReferenceReport: {
          invalidItems: [],
          invalidReferencesCount: 0
        },
        issues: []
      };

      function ensureIngredientIssueBucket(ingredientId) {
        if (!report.ingredientIssuesById[ingredientId]) {
          report.ingredientIssuesById[ingredientId] = {
            errors: [],
            warnings: []
          };
        }
        return report.ingredientIssuesById[ingredientId];
      }

      function ensureIconIssueBucket(iconKey) {
        if (!report.iconIssuesByKey[iconKey]) {
          report.iconIssuesByKey[iconKey] = {
            errors: [],
            warnings: []
          };
        }
        return report.iconIssuesByKey[iconKey];
      }

      function pushGlobalIssue(severity, message) {
        if (severity === 'error') {
          report.errors.push(message);
        } else {
          report.warnings.push(message);
        }
        report.issues.push({
          severity: severity,
          scope: 'global',
          message: message
        });
      }

      function pushIngredientIssue(ingredientId, severity, message) {
        var bucket = ensureIngredientIssueBucket(ingredientId);
        if (severity === 'error') {
          bucket.errors.push(message);
          report.errors.push(message);
        } else {
          bucket.warnings.push(message);
          report.warnings.push(message);
        }
        report.issues.push({
          severity: severity,
          scope: 'ingredient',
          id: ingredientId,
          message: message
        });
      }

      function pushIconIssue(iconKey, severity, message) {
        var bucket = ensureIconIssueBucket(iconKey);
        if (severity === 'error') {
          bucket.errors.push(message);
          report.errors.push(message);
        } else {
          bucket.warnings.push(message);
          report.warnings.push(message);
        }
        report.issues.push({
          severity: severity,
          scope: 'icon',
          id: iconKey,
          message: message
        });
      }

      if (!isObject(payload)) {
        pushGlobalIssue('error', 'ingredients debe ser un objeto JSON');
        return report;
      }

      var ingredientsById = isObject(payload.ingredients) ? payload.ingredients : {};
      var tagsById = isObject(payload.tags) ? payload.tags : {};
      var allergensById = isObject(payload.allergens) ? payload.allergens : {};
      var iconsById = isObject(payload.icons) ? payload.icons : {};

      Object.keys(iconsById).forEach(function (iconKey) {
        report.iconUsageByKey[iconKey] = [];
      });

      Object.keys(tagsById).forEach(function (tagId) {
        var tagEntry = tagsById[tagId] || {};
        if (!String(tagEntry.label || '').trim()) {
          pushGlobalIssue('warning', 'Tag sin label: ' + tagId);
        }
      });

      Object.keys(allergensById).forEach(function (allergenId) {
        var allergenEntry = allergensById[allergenId] || {};
        if (!String(allergenEntry.label || '').trim()) {
          pushGlobalIssue('warning', 'Alergeno sin label: ' + allergenId);
        }
      });

      Object.keys(ingredientsById).forEach(function (ingredientId) {
        var ingredient = ingredientsById[ingredientId];
        if (!isObject(ingredient)) {
          pushIngredientIssue(
            ingredientId,
            'error',
            'Ingrediente invalido (debe ser objeto): ' + ingredientId
          );
          return;
        }

        var label = String(ingredient.label || '').trim();
        if (!label) {
          pushIngredientIssue(ingredientId, 'warning', 'Ingrediente sin label: ' + ingredientId);
        }

        var iconValue = String(ingredient.icon || '').trim();
        if (!iconValue) {
          pushIngredientIssue(ingredientId, 'warning', 'Ingrediente sin icon: ' + ingredientId);
        } else {
          var iconFromCatalog = iconsById[iconValue];
          var iconAsPath = isLikelyValidIngredientIconPath(iconValue);
          if (!iconFromCatalog && !iconAsPath) {
            pushIngredientIssue(
              ingredientId,
              'error',
              "Icon invalido en ingrediente '" + ingredientId + "': " + iconValue
            );
          } else if (iconFromCatalog) {
            if (!report.iconUsageByKey[iconValue]) {
              report.iconUsageByKey[iconValue] = [];
            }
            report.iconUsageByKey[iconValue].push({
              id: ingredientId,
              label: label || ingredientId
            });
          }
        }

        if (!Array.isArray(ingredient.aliases)) {
          pushIngredientIssue(
            ingredientId,
            'error',
            'aliases debe ser array en ingrediente: ' + ingredientId
          );
        } else {
          var seenAliases = {};
          var normalizedAliases = [];
          ingredient.aliases.forEach(function (aliasRaw) {
            var rawText = String(aliasRaw || '').trim();
            var normalizedAlias = normalizeIngredientAlias(rawText);
            if (!normalizedAlias) {
              pushIngredientIssue(
                ingredientId,
                'error',
                'Alias vacio/invalido en ingrediente: ' + ingredientId
              );
              return;
            }
            if (rawText !== normalizedAlias) {
              pushIngredientIssue(
                ingredientId,
                'warning',
                "Alias legacy en '" + ingredientId + "': " + rawText + ' -> ' + normalizedAlias +
                ' (se normaliza en export/publish)'
              );
            }
            if (seenAliases[normalizedAlias]) {
              pushIngredientIssue(
                ingredientId,
                'warning',
                "Alias duplicado tras normalizar en '" + ingredientId + "': " + normalizedAlias +
                ' (se conserva la primera ocurrencia en export/publish)'
              );
              return;
            }
            seenAliases[normalizedAlias] = true;
            normalizedAliases.push(normalizedAlias);
          });

          if (normalizeAliases) {
            ingredient.aliases = normalizedAliases;
          }
        }

        if (!Array.isArray(ingredient.tags)) {
          pushIngredientIssue(ingredientId, 'error', 'tags debe ser array en ingrediente: ' + ingredientId);
        } else {
          var seenTags = {};
          ingredient.tags.forEach(function (tagId) {
            var normalizedTagId = String(tagId || '').trim();
            if (!tagsById[normalizedTagId]) {
              pushIngredientIssue(
                ingredientId,
                'error',
                "Tag desconocido en ingrediente '" + ingredientId + "': " + normalizedTagId
              );
            }
            if (seenTags[normalizedTagId]) {
              pushIngredientIssue(
                ingredientId,
                'error',
                "Tag duplicado en ingrediente '" + ingredientId + "': " + normalizedTagId
              );
            }
            seenTags[normalizedTagId] = true;
          });
        }

        if (!Array.isArray(ingredient.allergens)) {
          pushIngredientIssue(
            ingredientId,
            'error',
            'allergens debe ser array en ingrediente: ' + ingredientId
          );
        } else {
          var seenAllergens = {};
          ingredient.allergens.forEach(function (allergenId) {
            var normalizedAllergenId = String(allergenId || '').trim();
            if (!allergensById[normalizedAllergenId]) {
              pushIngredientIssue(
                ingredientId,
                'error',
                "Alergeno desconocido en ingrediente '" + ingredientId + "': " + normalizedAllergenId
              );
            }
            if (seenAllergens[normalizedAllergenId]) {
              pushIngredientIssue(
                ingredientId,
                'error',
                "Alergeno duplicado en ingrediente '" + ingredientId + "': " + normalizedAllergenId
              );
            }
            seenAllergens[normalizedAllergenId] = true;
          });
        }
      });

      Object.keys(iconsById).forEach(function (iconKey) {
        var iconEntry = iconsById[iconKey];
        if (!isObject(iconEntry)) {
          pushIconIssue(iconKey, 'error', 'Icono invalido (debe ser objeto): ' + iconKey);
          return;
        }

        var iconLabel = String(iconEntry.label || '').trim();
        if (!iconLabel) {
          pushIconIssue(iconKey, 'warning', 'Icono sin label: ' + iconKey);
        }

        var iconPath = String(iconEntry.icon || '').trim();
        if (!iconPath) {
          pushIconIssue(iconKey, 'warning', 'Icono sin path: ' + iconKey);
        } else if (!isLikelyValidIngredientIconPath(iconPath)) {
          pushIconIssue(
            iconKey,
            'warning',
            "Icono con path potencialmente invalido '" + iconKey + "': " + iconPath
          );
        }

        var usageEntries = report.iconUsageByKey[iconKey] || [];
        usageEntries.sort(function (a, b) {
          return normalizeText(a.label || a.id).localeCompare(normalizeText(b.label || b.id));
        });
        report.iconUsageByKey[iconKey] = usageEntries;
        if (!usageEntries.length) {
          pushIconIssue(iconKey, 'warning', 'Icono sin uso: ' + iconKey);
        }
      });

      report.menuReferenceReport = buildMenuReferenceReport(menuPayload, ingredientsById);
      if (report.menuReferenceReport.invalidItems.length) {
        pushGlobalIssue(
          'warning',
          report.menuReferenceReport.invalidItems.length +
          ' items del menu tienen ingredientes invalidos (' +
          report.menuReferenceReport.invalidReferencesCount + ' refs).'
        );
      }

      return report;
    }

    return {
      normalizeText: normalizeText,
      normalizeIngredientAlias: normalizeIngredientAlias,
      isLikelyValidIngredientIconPath: isLikelyValidIngredientIconPath,
      validateIngredientsContract: validateIngredientsContract
    };
  }
);
