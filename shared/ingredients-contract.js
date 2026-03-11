(function (root, factory) {
  var menuTraits = null;
  if (typeof module === 'object' && module.exports) {
    menuTraits = require('./menu-traits.js');
  } else if (root && root.FigataMenuTraits) {
    menuTraits = root.FigataMenuTraits;
  }
  var contract = factory(menuTraits);
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
  function (menuTraits) {
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

    function indexById(list) {
      var map = {};
      (Array.isArray(list) ? list : []).forEach(function (entry) {
        if (!entry || !entry.id) return;
        map[entry.id] = entry;
      });
      return map;
    }

    var contentFlagMap = indexById(menuTraits && menuTraits.contentFlagList);
    var experienceMap = indexById(menuTraits && menuTraits.experienceList);
    var internalTraitMap = indexById(menuTraits && menuTraits.internalTraitList);

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
      var legacyTagsById = isObject(payload.tags) ? payload.tags : {};
      var allergensById = isObject(payload.allergens) ? payload.allergens : {};
      var iconsById = isObject(payload.icons) ? payload.icons : {};

      Object.keys(iconsById).forEach(function (iconKey) {
        report.iconUsageByKey[iconKey] = [];
      });

      if (Object.keys(legacyTagsById).length) {
        pushGlobalIssue(
          'warning',
          'ingredients.tags es legacy y ya no es el source of truth de metadata.'
        );
      }

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

        if (typeof ingredient.tags !== 'undefined') {
          if (!Array.isArray(ingredient.tags)) {
            pushIngredientIssue(
              ingredientId,
              'warning',
              'ingredient.tags es legacy y debe eliminarse del ingrediente: ' + ingredientId
            );
          } else if (ingredient.tags.length) {
            pushIngredientIssue(
              ingredientId,
              'warning',
              'ingredient.tags es legacy y debe migrarse a ingredient.metadata: ' + ingredientId
            );
          }
        }

        if (menuTraits && typeof menuTraits.normalizeIngredientMetadata === 'function') {
          var normalizedMetadata = menuTraits.normalizeIngredientMetadata(ingredient, ingredientId);

          if (!isObject(ingredient.metadata)) {
            pushIngredientIssue(
              ingredientId,
              'warning',
              'Ingrediente sin metadata V2; se infiere desde legacy hints/tags: ' + ingredientId
            );
          }

          if (!isObject(ingredient.metadata) || !isObject(ingredient.metadata.dietary_profile)) {
            pushIngredientIssue(
              ingredientId,
              'warning',
              'metadata.dietary_profile faltante o invalido en ingrediente: ' + ingredientId
            );
          }

          if (!Array.isArray(normalizedMetadata.content_flags)) {
            pushIngredientIssue(
              ingredientId,
              'error',
              'metadata.content_flags invalido en ingrediente: ' + ingredientId
            );
          } else {
            var seenContentFlags = {};
            normalizedMetadata.content_flags.forEach(function (flagId) {
              if (!contentFlagMap[flagId]) {
                pushIngredientIssue(
                  ingredientId,
                  'error',
                  "Content flag desconocido en ingrediente '" + ingredientId + "': " + flagId
                );
              }
              if (seenContentFlags[flagId]) {
                pushIngredientIssue(
                  ingredientId,
                  'error',
                  "Content flag duplicado en ingrediente '" + ingredientId + "': " + flagId
                );
              }
              seenContentFlags[flagId] = true;
            });
          }

          if (!isObject(normalizedMetadata.experience_signals)) {
            pushIngredientIssue(
              ingredientId,
              'error',
              'metadata.experience_signals invalido en ingrediente: ' + ingredientId
            );
          } else {
            Object.keys(normalizedMetadata.experience_signals).forEach(function (signalId) {
              if (!experienceMap[signalId]) {
                pushIngredientIssue(
                  ingredientId,
                  'error',
                  "Experience signal desconocido en ingrediente '" + ingredientId + "': " + signalId
                );
              }
            });
          }

          if (!Array.isArray(normalizedMetadata.internal_traits)) {
            pushIngredientIssue(
              ingredientId,
              'error',
              'metadata.internal_traits invalido en ingrediente: ' + ingredientId
            );
          } else {
            var seenInternalTraits = {};
            normalizedMetadata.internal_traits.forEach(function (traitId) {
              if (!internalTraitMap[traitId]) {
                pushIngredientIssue(
                  ingredientId,
                  'error',
                  "Internal trait desconocido en ingrediente '" + ingredientId + "': " + traitId
                );
              }
              if (seenInternalTraits[traitId]) {
                pushIngredientIssue(
                  ingredientId,
                  'error',
                  "Internal trait duplicado en ingrediente '" + ingredientId + "': " + traitId
                );
              }
              seenInternalTraits[traitId] = true;
            });
          }
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
