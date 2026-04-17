(function (root, factory) {
  var runtime = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = runtime;
  }

  if (root) {
    root.FigataReservationsRuntime = runtime;
  }
})(
  typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this),
  function () {
    var DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

    function normalizeText(value, fallback) {
      if (typeof value !== 'string') {
        return typeof fallback === 'string' ? fallback : '';
      }
      var trimmed = value.trim();
      return trimmed || (typeof fallback === 'string' ? fallback : '');
    }

    function isObject(value) {
      return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
    }

    function isIsoDate(value) {
      return /^\d{4}-\d{2}-\d{2}$/.test(normalizeText(value));
    }

    function isTimeValue(value) {
      return /^\d{2}:\d{2}$/.test(normalizeText(value));
    }

    function timeToMinutes(value) {
      if (!isTimeValue(value)) {
        return null;
      }

      var parts = String(value).split(':');
      var hours = Number(parts[0]);
      var minutes = Number(parts[1]);
      if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
        return null;
      }

      return (hours * 60) + minutes;
    }

    function minutesToTime(value) {
      var numeric = Number(value);
      if (!Number.isFinite(numeric)) {
        return '';
      }

      var safe = Math.max(0, Math.round(numeric));
      var hours = Math.floor(safe / 60);
      var minutes = safe % 60;
      return String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
    }

    function parseIsoDateToUtcNoon(value) {
      if (!isIsoDate(value)) {
        return null;
      }

      var parts = String(value).split('-').map(Number);
      return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 12, 0, 0, 0));
    }

    function getDayKeyFromIsoDate(value) {
      var date = parseIsoDateToUtcNoon(value);
      if (!date) {
        return '';
      }
      return DAY_KEYS[date.getUTCDay()] || '';
    }

    function diffCalendarDays(startDate, endDate) {
      var start = parseIsoDateToUtcNoon(startDate);
      var end = parseIsoDateToUtcNoon(endDate);
      if (!start || !end) {
        return null;
      }
      return Math.round((end.getTime() - start.getTime()) / 86400000);
    }

    function getEnabledZones(config) {
      var source = Array.isArray(config && config.zones) ? config.zones : [];
      return source
        .filter(function (zone) {
          return zone && zone.enabled === true;
        })
        .slice()
        .sort(function (left, right) {
          return Number(left.sortOrder || 0) - Number(right.sortOrder || 0);
        });
    }

    function getZoneById(config, zoneId) {
      var normalizedZoneId = normalizeText(zoneId);
      if (!normalizedZoneId) {
        return null;
      }

      return getEnabledZones(config).find(function (zone) {
        return normalizeText(zone && zone.id) === normalizedZoneId;
      }) || null;
    }

    function getStatusById(config, statusId) {
      var normalizedStatusId = normalizeText(statusId);
      var source = Array.isArray(config && config.statusCatalog) ? config.statusCatalog : [];
      return source.find(function (entry) {
        return normalizeText(entry && entry.id) === normalizedStatusId;
      }) || null;
    }

    function getPartySizeLimits(config, zoneId) {
      var bookingRules = isObject(config && config.bookingRules) ? config.bookingRules : {};
      var defaults = isObject(bookingRules.partySize) ? bookingRules.partySize : {};
      var zone = getZoneById(config, zoneId);
      var zoneLimits = zone && isObject(zone.partySize) ? zone.partySize : {};

      return {
        min: Number(zoneLimits.min || defaults.min || 1),
        max: Number(zoneLimits.max || defaults.max || 1),
      };
    }

    function isPartySizeAllowed(config, partySize, zoneId) {
      var size = Number(partySize || 0);
      if (!Number.isFinite(size) || size <= 0) {
        return false;
      }

      var limits = getPartySizeLimits(config, zoneId);
      return size >= limits.min && size <= limits.max;
    }

    function getServiceWindowsForDate(config, isoDate) {
      var dayKey = getDayKeyFromIsoDate(isoDate);
      var windows = config && isObject(config.serviceWindows) ? config.serviceWindows[dayKey] : [];
      return Array.isArray(windows) ? windows.filter(isObject) : [];
    }

    function buildSlotsForDate(config, isoDate) {
      var bookingRules = isObject(config && config.bookingRules) ? config.bookingRules : {};
      var interval = Number(bookingRules.slotIntervalMinutes || 15);
      if (!Number.isFinite(interval) || interval <= 0) {
        interval = 15;
      }

      var slots = [];
      getServiceWindowsForDate(config, isoDate).forEach(function (windowEntry) {
        var startMinutes = timeToMinutes(windowEntry.start);
        var endMinutes = timeToMinutes(windowEntry.end);
        if (!Number.isFinite(startMinutes) || !Number.isFinite(endMinutes) || endMinutes <= startMinutes) {
          return;
        }

        for (var cursor = startMinutes; cursor < endMinutes; cursor += interval) {
          slots.push(minutesToTime(cursor));
        }
      });

      return slots.filter(function (value, index) {
        return value && slots.indexOf(value) === index;
      });
    }

    function isTimeSelectable(config, isoDate, timeValue) {
      var normalizedTime = normalizeText(timeValue);
      if (!normalizedTime) {
        return false;
      }

      return buildSlotsForDate(config, isoDate).indexOf(normalizedTime) !== -1;
    }

    function getNowInTimezone(timezone) {
      var formatter;
      try {
        formatter = new Intl.DateTimeFormat('en-CA', {
          timeZone: normalizeText(timezone, 'America/Santo_Domingo'),
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
      } catch (_error) {
        formatter = new Intl.DateTimeFormat('en-CA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
      }

      var parts = formatter.formatToParts(new Date());
      var map = {};
      parts.forEach(function (part) {
        if (part && part.type && part.type !== 'literal') {
          map[part.type] = part.value;
        }
      });

      var hourValue = Number(map.hour || 0);
      if (hourValue === 24) {
        hourValue = 0;
      }

      return {
        date: (map.year || '0000') + '-' + (map.month || '01') + '-' + (map.day || '01'),
        time: String(hourValue).padStart(2, '0') + ':' + normalizeText(map.minute, '00'),
        minutes: (hourValue * 60) + Number(map.minute || 0),
      };
    }

    function isInsideBookingWindow(config, isoDate, timeValue, options) {
      if (!isIsoDate(isoDate) || !isTimeValue(timeValue)) {
        return false;
      }

      var bookingRules = isObject(config && config.bookingRules) ? config.bookingRules : {};
      var timezone = normalizeText(config && config.timezone, 'America/Santo_Domingo');
      var now = options && isObject(options.now)
        ? options.now
        : getNowInTimezone(timezone);
      var dayDiff = diffCalendarDays(now.date, isoDate);
      var selectedMinutes = timeToMinutes(timeValue);
      var minAdvanceMinutes = Number(bookingRules.minAdvanceMinutes || 0);
      var maxAdvanceDays = Number(bookingRules.maxAdvanceDays || 30);

      if (!Number.isFinite(dayDiff) || !Number.isFinite(selectedMinutes)) {
        return false;
      }
      if (dayDiff < 0) {
        return false;
      }
      if (dayDiff > maxAdvanceDays) {
        return false;
      }
      if (dayDiff === 0 && selectedMinutes < (Number(now.minutes || 0) + minAdvanceMinutes)) {
        return false;
      }

      return true;
    }

    function getSlotLimits(config, zoneId) {
      var entry = config && isObject(config.slotLimits) ? config.slotLimits[normalizeText(zoneId)] : null;
      if (!isObject(entry)) {
        return {
          maxReservationsPerSlot: 0,
          maxCoversPerSlot: 0,
        };
      }

      return {
        maxReservationsPerSlot: Number(entry.maxReservationsPerSlot || 0),
        maxCoversPerSlot: Number(entry.maxCoversPerSlot || 0),
      };
    }

    return {
      DAY_KEYS: DAY_KEYS.slice(),
      diffCalendarDays: diffCalendarDays,
      getDayKeyFromIsoDate: getDayKeyFromIsoDate,
      getEnabledZones: getEnabledZones,
      getNowInTimezone: getNowInTimezone,
      getPartySizeLimits: getPartySizeLimits,
      getServiceWindowsForDate: getServiceWindowsForDate,
      getSlotLimits: getSlotLimits,
      getStatusById: getStatusById,
      getZoneById: getZoneById,
      isInsideBookingWindow: isInsideBookingWindow,
      isObject: isObject,
      isPartySizeAllowed: isPartySizeAllowed,
      isTimeSelectable: isTimeSelectable,
      isIsoDate: isIsoDate,
      isTimeValue: isTimeValue,
      minutesToTime: minutesToTime,
      normalizeText: normalizeText,
      parseIsoDateToUtcNoon: parseIsoDateToUtcNoon,
      timeToMinutes: timeToMinutes,
      buildSlotsForDate: buildSlotsForDate,
    };
  }
);
