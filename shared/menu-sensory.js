(function (root, factory) {
  var menuSensory = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = menuSensory;
  }
  if (root) {
    root.FigataMenuSensory = menuSensory;
  }
})(
  typeof globalThis !== "undefined"
    ? globalThis
    : (typeof window !== "undefined" ? window : this),
  function () {
    var PROFILE_SCHEMA_ID = "figata.menu.sensory-profile.v2";
    var SCALE = {
      min: 1,
      max: 10
    };

    var AXIS_GROUP_LIST = [
      {
        id: "sabor",
        label: "Sabor",
        order: 1,
        axisIds: ["dulce", "salado", "acido"]
      },
      {
        id: "textura_cuerpo",
        label: "Textura / cuerpo",
        order: 2,
        axisIds: ["cremosa", "crujiente", "ligero"]
      },
      {
        id: "caracter",
        label: "Carácter",
        order: 3,
        axisIds: ["aromatico", "intensidad"]
      }
    ];

    var AXIS_LIST = [
      { id: "dulce", label: "Dulce", groupId: "sabor", order: 1 },
      { id: "salado", label: "Salado", groupId: "sabor", order: 2 },
      { id: "acido", label: "Ácido", groupId: "sabor", order: 3 },
      { id: "cremosa", label: "Cremosa", groupId: "textura_cuerpo", order: 4 },
      { id: "crujiente", label: "Crujiente", groupId: "textura_cuerpo", order: 5 },
      { id: "ligero", label: "Ligero", groupId: "textura_cuerpo", order: 6 },
      { id: "aromatico", label: "Aromático", groupId: "caracter", order: 7 },
      { id: "intensidad", label: "Intensidad", groupId: "caracter", order: 8 }
    ];

    var AXIS_MAP = {};
    var AXIS_ID_LIST = AXIS_LIST.map(function (axis) {
      AXIS_MAP[axis.id] = axis;
      return axis.id;
    });

    function isObject(value) {
      return Boolean(value) && typeof value === "object" && !Array.isArray(value);
    }

    function cloneJson(value) {
      return JSON.parse(JSON.stringify(value));
    }

    function normalizeText(value) {
      return typeof value === "string" ? value.trim() : "";
    }

    function normalizeAxisValue(value) {
      if (typeof value === "string" && !value.trim()) {
        return null;
      }

      var numeric = Number(value);
      if (!Number.isFinite(numeric)) {
        return null;
      }

      var rounded = Math.round(numeric);
      if (rounded !== numeric) {
        return null;
      }

      if (rounded < SCALE.min || rounded > SCALE.max) {
        return null;
      }

      return rounded;
    }

    function createEmptyAxisEntry() {
      return {
        value: null
      };
    }

    function createEmptyAxisMap() {
      var axes = {};

      AXIS_ID_LIST.forEach(function (axisId) {
        axes[axisId] = createEmptyAxisEntry();
      });

      return axes;
    }

    function createEmptySensoryProfile() {
      return {
        summary: "",
        axes: createEmptyAxisMap()
      };
    }

    function sanitizeAxisEntry(input, options) {
      var source = isObject(input) ? input : {};
      var preserveUnknown = Boolean(options && options.preserveUnknown);
      var keepEmpty = Boolean(options && options.keepEmpty);
      var normalized = preserveUnknown ? cloneJson(source) : {};
      var value = normalizeAxisValue(source.value);
      var explanation = normalizeText(source.explanation);

      normalized.value = value;

      if (explanation) {
        normalized.explanation = explanation;
      } else {
        delete normalized.explanation;
      }

      if (value === null && !keepEmpty) {
        return null;
      }

      return normalized;
    }

    function sanitizeAxisMap(input, options) {
      var source = isObject(input) ? input : {};
      var normalized = {};

      AXIS_ID_LIST.forEach(function (axisId) {
        var axisEntry = sanitizeAxisEntry(source[axisId], options);

        if (axisEntry) {
          normalized[axisId] = axisEntry;
        } else if (options && options.keepEmpty) {
          normalized[axisId] = createEmptyAxisEntry();
        }
      });

      return normalized;
    }

    function hasAnyConfiguredAxisValue(axes) {
      if (!isObject(axes)) {
        return false;
      }

      return AXIS_ID_LIST.some(function (axisId) {
        return normalizeAxisValue(axes[axisId] && axes[axisId].value) !== null;
      });
    }

    function isCompleteSensoryProfile(profile) {
      if (!isObject(profile) || !normalizeText(profile.summary) || !isObject(profile.axes)) {
        return false;
      }

      return AXIS_ID_LIST.every(function (axisId) {
        return normalizeAxisValue(profile.axes[axisId] && profile.axes[axisId].value) !== null;
      });
    }

    function sanitizeSensoryProfile(input, options) {
      var source = isObject(input) ? input : null;
      var keepEmpty = Boolean(options && options.keepEmpty);
      var requireComplete = Boolean(options && options.requireComplete);
      var preserveUnknown = Boolean(options && options.preserveUnknown);

      if (!source) {
        return keepEmpty ? createEmptySensoryProfile() : null;
      }

      var normalized = preserveUnknown ? cloneJson(source) : {};
      normalized.summary = normalizeText(source.summary);
      normalized.axes = sanitizeAxisMap(source.axes, {
        keepEmpty: true,
        preserveUnknown: preserveUnknown
      });

      if (requireComplete && !isCompleteSensoryProfile(normalized)) {
        return null;
      }

      if (!keepEmpty && !normalized.summary && !hasAnyConfiguredAxisValue(normalized.axes)) {
        return null;
      }

      return normalized;
    }

    function getProfileSchema() {
      return {
        id: PROFILE_SCHEMA_ID,
        version: 2,
        scale: cloneJson(SCALE),
        groups: cloneJson(AXIS_GROUP_LIST),
        axes: cloneJson(AXIS_LIST)
      };
    }

    function validateMenuSensoryProfiles(menuPayload) {
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

      var sections = Array.isArray(menuPayload.sections) ? menuPayload.sections : [];

      sections.forEach(function (section) {
        var items = Array.isArray(section && section.items) ? section.items : [];

        items.forEach(function (item) {
          var itemId = normalizeText(item && item.id) || "(sin-id)";
          var sensoryProfile = item && item.sensory_profile;

          if (typeof sensoryProfile === "undefined" || sensoryProfile === null) {
            return;
          }

          if (!isObject(sensoryProfile)) {
            pushItemIssue(itemId, "error", "sensory_profile debe ser objeto cuando existe.");
            return;
          }

          if (!normalizeText(sensoryProfile.summary)) {
            pushItemIssue(
              itemId,
              "error",
              "sensory_profile.summary es obligatorio cuando existe sensory_profile."
            );
          }

          if (!isObject(sensoryProfile.axes)) {
            pushItemIssue(itemId, "error", "sensory_profile.axes debe ser objeto.");
            return;
          }

          Object.keys(sensoryProfile.axes).forEach(function (axisId) {
            if (!AXIS_MAP[axisId]) {
              pushItemIssue(
                itemId,
                "error",
                "Axis desconocido en sensory_profile.axes: " + axisId
              );
            }
          });

          AXIS_ID_LIST.forEach(function (axisId) {
            var axisEntry = sensoryProfile.axes[axisId];
            var axisPath = "sensory_profile.axes." + axisId;

            if (!isObject(axisEntry)) {
              pushItemIssue(itemId, "error", axisPath + " debe ser objeto.");
              return;
            }

            if (normalizeAxisValue(axisEntry.value) === null) {
              pushItemIssue(
                itemId,
                "error",
                axisPath + ".value debe ser entero entre " + SCALE.min + " y " + SCALE.max + "."
              );
            }

            if (
              Object.prototype.hasOwnProperty.call(axisEntry, "explanation") &&
              !normalizeText(axisEntry.explanation)
            ) {
              pushItemIssue(
                itemId,
                "error",
                axisPath + ".explanation debe ser texto no vacio cuando existe."
              );
            }
          });
        });
      });

      return report;
    }

    return {
      version: 2,
      schemaId: PROFILE_SCHEMA_ID,
      scale: cloneJson(SCALE),
      axisGroups: cloneJson(AXIS_GROUP_LIST),
      axisList: cloneJson(AXIS_LIST),
      axisIdList: cloneJson(AXIS_ID_LIST),
      getProfileSchema: getProfileSchema,
      createEmptySensoryProfile: createEmptySensoryProfile,
      sanitizeSensoryProfile: sanitizeSensoryProfile,
      isCompleteSensoryProfile: isCompleteSensoryProfile,
      validateMenuSensoryProfiles: validateMenuSensoryProfiles,
      validateMenuPayload: validateMenuSensoryProfiles
    };
  }
);
