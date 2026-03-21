(function (root, factory) {
  var contract = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = contract;
  }
  if (root) {
    root.FigataCategoriesContract = contract;
  }
})(
  typeof globalThis !== "undefined"
    ? globalThis
    : (typeof window !== "undefined" ? window : this),
  function () {
    function isObject(value) {
      return Boolean(value) && typeof value === "object" && !Array.isArray(value);
    }

    function normalizeText(value) {
      return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
    }

    function normalizeCategoryId(value) {
      return normalizeText(value)
        .replace(/[^a-z0-9_-]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .replace(/_+/g, "_");
    }

    function resolveCategoryVisible(category) {
      if (category && typeof category.visible === "boolean") {
        return category.visible;
      }
      if (category && typeof category.enabled === "boolean") {
        return category.enabled;
      }
      return true;
    }

    function buildMenuReferenceReport(menuPayload, categoriesById) {
      var report = {
        invalidItems: [],
        invalidReferencesCount: 0
      };

      var sections = menuPayload && Array.isArray(menuPayload.sections)
        ? menuPayload.sections
        : [];

      sections.forEach(function (section) {
        var items = section && Array.isArray(section.items) ? section.items : [];
        items.forEach(function (item) {
          if (!item || typeof item !== "object") return;

          var categoryId = String(item.category || "").trim();
          if (!categoryId) {
            report.invalidReferencesCount += 1;
            report.invalidItems.push({
              id: item.id || "",
              label: item.name || item.id || "Item sin nombre",
              category: ""
            });
            return;
          }

          if (categoriesById[categoryId]) return;

          report.invalidReferencesCount += 1;
          report.invalidItems.push({
            id: item.id || "",
            label: item.name || item.id || "Item sin nombre",
            category: categoryId
          });
        });
      });

      return report;
    }

    function validateCategoriesContract(payload, options) {
      options = options || {};
      var report = {
        errors: [],
        warnings: [],
        categoryIssuesById: {},
        duplicateIds: [],
        duplicateOrders: [],
        menuReferenceReport: {
          invalidItems: [],
          invalidReferencesCount: 0
        },
        issues: []
      };

      var menuPayload = options.menuPayload || null;

      function ensureCategoryIssueBucket(categoryId) {
        var key = String(categoryId || "").trim() || "__unknown__";
        if (!report.categoryIssuesById[key]) {
          report.categoryIssuesById[key] = {
            errors: [],
            warnings: []
          };
        }
        return report.categoryIssuesById[key];
      }

      function pushGlobalIssue(severity, message) {
        if (severity === "error") {
          report.errors.push(message);
        } else {
          report.warnings.push(message);
        }
        report.issues.push({
          severity: severity,
          scope: "global",
          message: message
        });
      }

      function pushCategoryIssue(categoryId, severity, message) {
        var bucket = ensureCategoryIssueBucket(categoryId);
        if (severity === "error") {
          bucket.errors.push(message);
          report.errors.push(message);
        } else {
          bucket.warnings.push(message);
          report.warnings.push(message);
        }
        report.issues.push({
          severity: severity,
          scope: "category",
          id: categoryId,
          message: message
        });
      }

      if (!isObject(payload)) {
        pushGlobalIssue("error", "categories debe ser un objeto JSON");
        return report;
      }

      if (!Array.isArray(payload.categories)) {
        pushGlobalIssue("error", "categories.categories debe ser un array");
        return report;
      }

      var categories = payload.categories;
      var idsCount = {};
      var idsFirstRaw = {};
      var orderToIds = {};
      var validCategoriesById = {};

      categories.forEach(function (entry, index) {
        if (!isObject(entry)) {
          pushCategoryIssue(
            "index_" + index,
            "error",
            "Categoria invalida en index " + index + " (debe ser objeto)"
          );
          return;
        }

        var rawId = String(entry.id || "").trim();
        var normalizedId = normalizeCategoryId(rawId);
        var categoryIssueId = rawId || ("index_" + index);

        if (!rawId) {
          pushCategoryIssue(categoryIssueId, "error", "Categoria sin id en index " + index);
        } else {
          idsCount[rawId] = (idsCount[rawId] || 0) + 1;
          if (!idsFirstRaw[rawId]) {
            idsFirstRaw[rawId] = rawId;
          }

          if (rawId !== normalizedId) {
            pushCategoryIssue(
              rawId,
              "warning",
              "ID con formato no recomendado en '" + rawId + "' (usa slug simple)"
            );
          }

          if (!validCategoriesById[rawId]) {
            validCategoriesById[rawId] = {
              id: rawId
            };
          }
        }

        var label = String(entry.label || "").trim();
        if (!label) {
          pushCategoryIssue(categoryIssueId, "error", "Categoria sin label: " + (rawId || ("index_" + index)));
        }

        var orderValue = Number(entry.order);
        if (!Number.isFinite(orderValue)) {
          pushCategoryIssue(
            categoryIssueId,
            "warning",
            "Categoria sin order numerico: " + (rawId || ("index_" + index))
          );
        } else {
          var normalizedOrder = Math.round(orderValue);
          if (!orderToIds[normalizedOrder]) {
            orderToIds[normalizedOrder] = [];
          }
          orderToIds[normalizedOrder].push(rawId || ("index_" + index));
        }

        var hasExplicitVisibility = typeof entry.visible === "boolean" || typeof entry.enabled === "boolean";
        if (!hasExplicitVisibility) {
          pushCategoryIssue(
            categoryIssueId,
            "warning",
            "Categoria sin visible/enabled explicito: " + (rawId || ("index_" + index))
          );
        }

        if (!resolveCategoryVisible(entry) && String(entry.label || "").trim()) {
          // Hidden categories are allowed. This keeps behavior explicit for consumers.
        }
      });

      Object.keys(idsCount).forEach(function (idValue) {
        if (idsCount[idValue] <= 1) return;
        report.duplicateIds.push(idValue);
        pushGlobalIssue("error", "ID de categoria duplicado: " + idValue);
      });

      Object.keys(orderToIds).forEach(function (orderKey) {
        var ids = orderToIds[orderKey];
        if (!Array.isArray(ids) || ids.length <= 1) return;
        report.duplicateOrders.push({
          order: Number(orderKey),
          ids: ids.slice()
        });
        pushGlobalIssue(
          "error",
          "Order duplicado en categorias (" + orderKey + "): " + ids.join(", ")
        );
      });

      report.menuReferenceReport = buildMenuReferenceReport(menuPayload, validCategoriesById);
      if (report.menuReferenceReport.invalidItems.length) {
        pushGlobalIssue(
          "warning",
          report.menuReferenceReport.invalidItems.length +
          " menu items reference missing category (" +
          report.menuReferenceReport.invalidReferencesCount + " refs)."
        );
      }

      return report;
    }

    return {
      normalizeText: normalizeText,
      normalizeCategoryId: normalizeCategoryId,
      validateCategoriesContract: validateCategoriesContract
    };
  }
);
