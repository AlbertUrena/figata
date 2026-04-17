(function (root, factory) {
  var contract = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = contract;
  }
  if (root) {
    root.FigataReservationsContract = contract;
  }
})(
  typeof globalThis !== "undefined"
    ? globalThis
    : (typeof window !== "undefined" ? window : this),
  function () {
    var WEEKDAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    var RECOMMENDED_STATUS_IDS = ["pending", "confirmed", "cancelled", "rejected", "no_show"];

    function isObject(value) {
      return Boolean(value) && typeof value === "object" && !Array.isArray(value);
    }

    function isPositiveInteger(value) {
      var number = Number(value);
      return Number.isFinite(number) && Math.round(number) === number && number > 0;
    }

    function isNonEmptyString(value) {
      return typeof value === "string" && value.trim() !== "";
    }

    function isSlug(value) {
      return /^[a-z0-9]+(?:[_-][a-z0-9]+)*$/.test(String(value || "").trim());
    }

    function isValidTimezone(value) {
      return /^[A-Za-z_]+(?:\/[A-Za-z_+-]+)+$/.test(String(value || "").trim());
    }

    function isValidCurrency(value) {
      return /^[A-Z]{3}$/.test(String(value || "").trim());
    }

    function isValidTime(value) {
      if (!/^\d{2}:\d{2}$/.test(String(value || ""))) return false;
      var parts = String(value).split(":");
      var hours = Number(parts[0]);
      var minutes = Number(parts[1]);
      return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
    }

    function timeToMinutes(value) {
      var parts = String(value || "").split(":");
      return (Number(parts[0]) * 60) + Number(parts[1]);
    }

    function validatePartySizeConfig(payload, label, pushIssue) {
      if (!isObject(payload)) {
        pushIssue("error", "\"" + label + "\" must be an object.");
        return;
      }

      if (!isPositiveInteger(payload.min)) {
        pushIssue("error", "\"" + label + ".min\" must be a positive integer.");
      }
      if (!isPositiveInteger(payload.max)) {
        pushIssue("error", "\"" + label + ".max\" must be a positive integer.");
      }
      if (
        isPositiveInteger(payload.min) &&
        isPositiveInteger(payload.max) &&
        Number(payload.min) > Number(payload.max)
      ) {
        pushIssue("error", "\"" + label + ".min\" cannot be greater than \"" + label + ".max\".");
      }
    }

    function validateReservationsContract(payload, options) {
      var report = {
        errors: [],
        warnings: [],
        issues: []
      };

      function pushIssue(severity, message) {
        if (severity === "error") {
          report.errors.push(message);
        } else {
          report.warnings.push(message);
        }
        report.issues.push({
          severity: severity,
          message: message
        });
      }

      if (!isObject(payload)) {
        pushIssue("error", "Reservations config must be a JSON object.");
        return report;
      }

      if (!isPositiveInteger(payload.version)) {
        pushIssue("error", "\"version\" must be a positive integer.");
      }

      if (payload.schema !== "figata.reservations.config.v1") {
        pushIssue("error", "\"schema\" must be \"figata.reservations.config.v1\".");
      }

      if (!isValidTimezone(payload.timezone)) {
        pushIssue("error", "\"timezone\" must be a valid IANA timezone string.");
      }

      if (!isValidCurrency(payload.currency)) {
        pushIssue("error", "\"currency\" must be a 3-letter uppercase ISO code.");
      }

      var zoneIds = Object.create(null);
      var zones = Array.isArray(payload.zones) ? payload.zones : null;
      if (!zones || !zones.length) {
        pushIssue("error", "\"zones\" must be a non-empty array.");
      } else {
        zones.forEach(function (zone, index) {
          var prefix = "zones[" + index + "]";
          if (!isObject(zone)) {
            pushIssue("error", "\"" + prefix + "\" must be an object.");
            return;
          }

          if (!isSlug(zone.id)) {
            pushIssue("error", "\"" + prefix + ".id\" must be a slug-like identifier.");
          } else if (zoneIds[zone.id]) {
            pushIssue("error", "Duplicate zone id \"" + zone.id + "\".");
          } else {
            zoneIds[zone.id] = true;
          }

          if (!isNonEmptyString(zone.label)) {
            pushIssue("error", "\"" + prefix + ".label\" is required.");
          }

          if (typeof zone.enabled !== "boolean") {
            pushIssue("error", "\"" + prefix + ".enabled\" must be a boolean.");
          }

          if (!isPositiveInteger(zone.sortOrder)) {
            pushIssue("error", "\"" + prefix + ".sortOrder\" must be a positive integer.");
          }

          validatePartySizeConfig(zone.partySize, prefix + ".partySize", pushIssue);
        });
      }

      var serviceWindows = payload.serviceWindows;
      if (!isObject(serviceWindows)) {
        pushIssue("error", "\"serviceWindows\" must be an object.");
      } else {
        Object.keys(serviceWindows).forEach(function (key) {
          if (WEEKDAY_KEYS.indexOf(key) === -1) {
            pushIssue("warning", "Unknown service window key \"" + key + "\" will be ignored.");
          }
        });

        WEEKDAY_KEYS.forEach(function (dayKey) {
          var windows = serviceWindows[dayKey];
          if (!Array.isArray(windows)) {
            pushIssue("error", "\"serviceWindows." + dayKey + "\" must be an array.");
            return;
          }

          windows.forEach(function (windowEntry, index) {
            var prefix = "serviceWindows." + dayKey + "[" + index + "]";
            if (!isObject(windowEntry)) {
              pushIssue("error", "\"" + prefix + "\" must be an object.");
              return;
            }

            if (!isValidTime(windowEntry.start)) {
              pushIssue("error", "\"" + prefix + ".start\" must use HH:MM 24h format.");
            }
            if (!isValidTime(windowEntry.end)) {
              pushIssue("error", "\"" + prefix + ".end\" must use HH:MM 24h format.");
            }
            if (
              isValidTime(windowEntry.start) &&
              isValidTime(windowEntry.end) &&
              timeToMinutes(windowEntry.end) <= timeToMinutes(windowEntry.start)
            ) {
              pushIssue("error", "\"" + prefix + ".end\" must be later than \"" + prefix + ".start\".");
            }
          });
        });
      }

      var bookingRules = payload.bookingRules;
      if (!isObject(bookingRules)) {
        pushIssue("error", "\"bookingRules\" must be an object.");
      } else {
        if (["manual", "automatic"].indexOf(bookingRules.confirmationMode) === -1) {
          pushIssue("error", "\"bookingRules.confirmationMode\" must be \"manual\" or \"automatic\".");
        }
        [
          "slotIntervalMinutes",
          "defaultDurationMinutes",
          "gracePeriodMinutes",
          "minAdvanceMinutes",
          "maxAdvanceDays",
          "notesMaxLength"
        ].forEach(function (field) {
          if (!isPositiveInteger(bookingRules[field])) {
            pushIssue("error", "\"bookingRules." + field + "\" must be a positive integer.");
          }
        });
        if (
          isPositiveInteger(bookingRules.slotIntervalMinutes) &&
          60 % Number(bookingRules.slotIntervalMinutes) !== 0
        ) {
          pushIssue("warning", "\"bookingRules.slotIntervalMinutes\" should divide 60 cleanly for predictable slot generation.");
        }
        validatePartySizeConfig(bookingRules.partySize, "bookingRules.partySize", pushIssue);
      }

      var slotLimits = payload.slotLimits;
      if (!isObject(slotLimits)) {
        pushIssue("error", "\"slotLimits\" must be an object keyed by zone id.");
      } else {
        Object.keys(slotLimits).forEach(function (zoneId) {
          var entry = slotLimits[zoneId];
          if (!zoneIds[zoneId]) {
            pushIssue("warning", "\"slotLimits." + zoneId + "\" does not match any configured zone.");
          }
          if (!isObject(entry)) {
            pushIssue("error", "\"slotLimits." + zoneId + "\" must be an object.");
            return;
          }
          if (!isPositiveInteger(entry.maxReservationsPerSlot)) {
            pushIssue("error", "\"slotLimits." + zoneId + ".maxReservationsPerSlot\" must be a positive integer.");
          }
          if (!isPositiveInteger(entry.maxCoversPerSlot)) {
            pushIssue("error", "\"slotLimits." + zoneId + ".maxCoversPerSlot\" must be a positive integer.");
          }
        });

        Object.keys(zoneIds).forEach(function (zoneId) {
          if (!isObject(slotLimits[zoneId])) {
            pushIssue("error", "Missing slot limit entry for zone \"" + zoneId + "\".");
          }
        });
      }

      var statusCatalog = Array.isArray(payload.statusCatalog) ? payload.statusCatalog : null;
      if (!statusCatalog || !statusCatalog.length) {
        pushIssue("error", "\"statusCatalog\" must be a non-empty array.");
      } else {
        var seenStatuses = Object.create(null);
        statusCatalog.forEach(function (statusEntry, index) {
          var prefix = "statusCatalog[" + index + "]";
          if (!isObject(statusEntry)) {
            pushIssue("error", "\"" + prefix + "\" must be an object.");
            return;
          }
          if (!isSlug(statusEntry.id)) {
            pushIssue("error", "\"" + prefix + ".id\" must be a slug-like identifier.");
          } else if (seenStatuses[statusEntry.id]) {
            pushIssue("error", "Duplicate status id \"" + statusEntry.id + "\".");
          } else {
            seenStatuses[statusEntry.id] = true;
          }
          if (!isNonEmptyString(statusEntry.label)) {
            pushIssue("error", "\"" + prefix + ".label\" is required.");
          }
          if (!isNonEmptyString(statusEntry.publicLabel)) {
            pushIssue("error", "\"" + prefix + ".publicLabel\" is required.");
          }
        });

        RECOMMENDED_STATUS_IDS.forEach(function (statusId) {
          if (!seenStatuses[statusId]) {
            pushIssue("warning", "Recommended reservation status \"" + statusId + "\" is missing.");
          }
        });
      }

      var uiCopy = payload.uiCopy;
      if (!isObject(uiCopy)) {
        pushIssue("error", "\"uiCopy\" must be an object.");
      } else {
        if (!isObject(uiCopy.hero)) {
          pushIssue("error", "\"uiCopy.hero\" must be an object.");
        } else {
          if (!isNonEmptyString(uiCopy.hero.title)) {
            pushIssue("error", "\"uiCopy.hero.title\" is required.");
          }
          if (!isNonEmptyString(uiCopy.hero.subtitle)) {
            pushIssue("error", "\"uiCopy.hero.subtitle\" is required.");
          }
        }
        if (!isObject(uiCopy.steps)) {
          pushIssue("error", "\"uiCopy.steps\" must be an object.");
        }
        if (!isObject(uiCopy.statusLabels)) {
          pushIssue("error", "\"uiCopy.statusLabels\" must be an object.");
        }
        if (!isObject(uiCopy.details)) {
          pushIssue("error", "\"uiCopy.details\" must be an object.");
        }
      }

      return report;
    }

    return {
      WEEKDAY_KEYS: WEEKDAY_KEYS.slice(),
      validateReservationsContract: validateReservationsContract
    };
  }
);
