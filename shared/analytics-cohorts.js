const VERSION = 'figata.analytics.cohorts.v1';
const DEFAULT_TIME_ZONE = 'America/Santo_Domingo';
const NON_BUSINESS_TRAFFIC_CLASSES = new Set(['internal', 'admin', 'preview', 'development', 'automation']);
const DAY_ORDER = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

function normalizeText(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed || fallback;
}

function toNumber(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function toRoundedNumber(value, digits = 4) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  const factor = Math.pow(10, digits);
  return Math.round(numericValue * factor) / factor;
}

function toRate(numerator, denominator, digits = 4) {
  if (!(denominator > 0)) {
    return 0;
  }
  return toRoundedNumber(numerator / denominator, digits);
}

function average(values, digits = 0) {
  const numericValues = (Array.isArray(values) ? values : []).filter((value) =>
    typeof value === 'number' && Number.isFinite(value)
  );
  if (!numericValues.length) {
    return null;
  }

  const total = numericValues.reduce((sum, value) => sum + value, 0);
  return toRoundedNumber(total / numericValues.length, digits);
}

function toTimeMs(value) {
  const timestamp = Date.parse(normalizeText(value));
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function compareRecords(left, right) {
  const leftTime = toTimeMs(left && left.started_at || left && left.occurred_at);
  const rightTime = toTimeMs(right && right.started_at || right && right.occurred_at);
  if (leftTime !== rightTime) {
    return leftTime - rightTime;
  }

  return toNumber(left && left.__raw_index) - toNumber(right && right.__raw_index);
}

function normalizeFilters(filters) {
  const source = filters && typeof filters === 'object' ? filters : {};
  return {
    entry_source: normalizeText(source.entry_source || source.entrySource || 'all', 'all'),
    visit_context: normalizeText(source.visit_context || source.visitContext || 'all', 'all'),
    visitor_type: normalizeText(source.visitor_type || source.visitorType || 'all', 'all'),
    route_name: normalizeText(source.route_name || source.routeName || 'all', 'all'),
    device_type: normalizeText(source.device_type || source.deviceType || 'all', 'all'),
  };
}

function matchesFilters(session, filters) {
  const normalizedFilters = normalizeFilters(filters);
  const pairs = [
    ['entry_source', normalizeText(session && session.entry_source, 'unknown')],
    ['visit_context', normalizeText(session && session.visit_context, 'unknown')],
    ['visitor_type', normalizeText(session && session.visitor_type, 'unknown')],
    ['route_name', normalizeText(session && session.route_name, 'unknown')],
  ];

  return pairs.every(([key, value]) => {
    const expectedValue = normalizeText(normalizedFilters[key], 'all');
    return !expectedValue || expectedValue === 'all' || expectedValue === value;
  });
}

function resolveVisitorType(session, visitorsFact) {
  const sequence = toNumber(session && session.session_sequence);
  if (sequence > 1) {
    return 'returning';
  }

  const visitor = (Array.isArray(visitorsFact) ? visitorsFact : []).find((entry) =>
    normalizeText(entry && entry.visitor_id, 'visitor_unknown') === normalizeText(session && session.visitor_id, 'visitor_unknown')
  ) || null;
  if (!visitor || toNumber(visitor.session_count) <= 1) {
    return 'new';
  }

  const startedAt = normalizeText(session && session.started_at);
  const firstSeenAt = normalizeText(visitor.first_seen_at);
  return startedAt && firstSeenAt && startedAt === firstSeenAt ? 'new' : 'returning';
}

function getSpeedBucket(routeReadyMs) {
  const numericValue = toNumber(routeReadyMs);
  if (!numericValue) {
    return 'unknown';
  }
  if (numericValue < 1000) {
    return 'fast';
  }
  if (numericValue < 2500) {
    return 'steady';
  }
  return 'slow';
}

function getLocalDateParts(value, timeZone) {
  const timestamp = toTimeMs(value);
  if (!(timestamp > 0)) {
    return {
      day_key: 'unknown',
      day_of_week: 'unknown',
      hour_of_day: null,
    };
  }

  const safeTimeZone = normalizeText(timeZone, DEFAULT_TIME_ZONE);
  const date = new Date(timestamp);
  const formatter = new Intl.DateTimeFormat('es-DO', {
    timeZone: safeTimeZone,
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(date).reduce((accumulator, part) => {
    accumulator[part.type] = part.value;
    return accumulator;
  }, {});

  return {
    day_key: [parts.year, parts.month, parts.day].filter(Boolean).join('-') || 'unknown',
    day_of_week: normalizeText(parts.weekday).toLowerCase(),
    hour_of_day: parts.hour ? Math.max(0, Math.min(23, Number(parts.hour))) : null,
  };
}

function buildSessionRows(pipelineResult, options = {}) {
  const scopeMode = normalizeText(options.scopeMode, 'all_traffic');
  const normalizedFilters = normalizeFilters(options.filters);
  const timeZone = normalizeText(options.timeZone, DEFAULT_TIME_ZONE);
  const sessionsFact = pipelineResult && pipelineResult.curated ? pipelineResult.curated.sessions_fact || [] : [];
  const visitorsFact = pipelineResult && pipelineResult.curated ? pipelineResult.curated.visitors_fact || [] : [];
  const eventsFact = pipelineResult && pipelineResult.curated ? pipelineResult.curated.events_fact || [] : [];
  const sessionRows = new Map();

  sessionsFact.forEach((session) => {
    const trafficClass = normalizeText(session && session.traffic_class, 'unknown');
    if (scopeMode === 'business_only' && NON_BUSINESS_TRAFFIC_CLASSES.has(trafficClass)) {
      return;
    }

    const localDateParts = getLocalDateParts(session && session.started_at, timeZone);
    const sessionId = normalizeText(session && session.session_id, 'session_unknown');
    sessionRows.set(sessionId, {
      session_id: sessionId,
      visitor_id: normalizeText(session && session.visitor_id, 'visitor_unknown'),
      entry_source: normalizeText(session && session.entry_source, 'unknown'),
      visit_context: normalizeText(session && (session.visit_context_final || session.visit_context_initial), 'unknown'),
      route_name: normalizeText(session && (session.first_route_name || 'unknown'), 'unknown'),
      traffic_class: trafficClass,
      visitor_type: resolveVisitorType(session, visitorsFact),
      started_at: normalizeText(session && session.started_at),
      day_key: localDateParts.day_key,
      day_of_week: localDateParts.day_of_week,
      hour_of_day: localDateParts.hour_of_day,
      item_detail_open_count: toNumber(session && session.item_detail_open_count),
      has_detail_open: toNumber(session && session.item_detail_open_count) > 0,
      has_purchase: Boolean(session && session.has_purchase),
      purchase_count: toNumber(session && session.purchase_count),
      average_route_ready_ms: typeof (session && session.average_route_ready_ms) === 'number'
        ? session.average_route_ready_ms
        : null,
      network_effective_type: 'unknown',
      network_downlink_mbps: null,
      network_rtt_ms: null,
      speed_bucket: getSpeedBucket(session && session.average_route_ready_ms),
    });
  });

  eventsFact
    .slice()
    .sort(compareRecords)
    .forEach((eventPayload) => {
      const sessionRow = sessionRows.get(normalizeText(eventPayload && eventPayload.session_id, 'session_unknown'));
      if (!sessionRow) {
        return;
      }

      const eventName = normalizeText(eventPayload && eventPayload.event_name);
      if (eventName === 'performance_summary' || eventName === 'route_ready') {
        sessionRow.network_effective_type = normalizeText(
          eventPayload && eventPayload.network_effective_type,
          sessionRow.network_effective_type || 'unknown'
        );
        if (typeof eventPayload.network_downlink_mbps === 'number') {
          sessionRow.network_downlink_mbps = eventPayload.network_downlink_mbps;
        }
        if (typeof eventPayload.network_rtt_ms === 'number') {
          sessionRow.network_rtt_ms = eventPayload.network_rtt_ms;
        }
      }
    });

  return Array.from(sessionRows.values())
    .filter((session) => matchesFilters(session, normalizedFilters))
    .sort(compareRecords);
}

function buildRetentionSummary(sessionRows) {
  const visitors = new Map();

  sessionRows.forEach((session) => {
    const visitorId = normalizeText(session && session.visitor_id, 'visitor_unknown');
    if (!visitors.has(visitorId)) {
      visitors.set(visitorId, []);
    }
    visitors.get(visitorId).push(session);
  });

  function reduceRows(rows) {
    const visitorRows = Array.isArray(rows) ? rows : [];
    const visitorCount = visitorRows.length;
    let return1d = 0;
    let return7d = 0;
    let return30d = 0;
    const sessionCounts = [];

    visitorRows.forEach((sessions) => {
      const sortedSessions = sessions.slice().sort(compareRecords);
      const firstSession = sortedSessions[0];
      const returnDays = sortedSessions.slice(1).map((session) => {
        const firstTime = toTimeMs(firstSession && firstSession.started_at);
        const returnTime = toTimeMs(session && session.started_at);
        if (!(firstTime > 0) || !(returnTime > 0) || returnTime < firstTime) {
          return null;
        }
        return Math.floor((returnTime - firstTime) / 86400000);
      }).filter((value) => typeof value === 'number' && value >= 0);

      sessionCounts.push(sortedSessions.length);
      if (returnDays.some((days) => days <= 1)) {
        return1d += 1;
      }
      if (returnDays.some((days) => days <= 7)) {
        return7d += 1;
      }
      if (returnDays.some((days) => days <= 30)) {
        return30d += 1;
      }
    });

    return {
      visitors_total: visitorCount,
      return_1d_rate: toRate(return1d, visitorCount),
      return_7d_rate: toRate(return7d, visitorCount),
      return_30d_rate: toRate(return30d, visitorCount),
      average_sessions_per_visitor: average(sessionCounts, 2) || 0,
    };
  }

  const overall = reduceRows(Array.from(visitors.values()));
  const byEntrySource = {};
  Array.from(visitors.values()).forEach((sessions) => {
    const firstEntrySource = normalizeText(sessions[0] && sessions[0].entry_source, 'unknown');
    if (!byEntrySource[firstEntrySource]) {
      byEntrySource[firstEntrySource] = [];
    }
    byEntrySource[firstEntrySource].push(sessions);
  });

  return {
    overall,
    by_entry_source: Object.keys(byEntrySource).sort().map((entrySource) => Object.assign({
      entry_source: entrySource,
    }, reduceRows(byEntrySource[entrySource]))),
  };
}

function aggregateRows(rows, keyName, valueKey) {
  const grouped = {};
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const key = normalizeText(row && row[keyName], valueKey === 'hour_of_day' ? 'unknown' : 'unknown');
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(row);
  });
  return grouped;
}

function buildCohortRows(sessionRows, keyName) {
  const grouped = aggregateRows(sessionRows, keyName);
  return Object.keys(grouped).map((key) => {
    const rows = grouped[key];
    const visitorIds = new Set(rows.map((row) => normalizeText(row && row.visitor_id, 'visitor_unknown')));
    const returningVisitors = new Set(
      rows
        .filter((row) => normalizeText(row && row.visitor_type) === 'returning')
        .map((row) => normalizeText(row && row.visitor_id, 'visitor_unknown'))
    );
    return {
      key: key,
      sessions: rows.length,
      visitors: visitorIds.size,
      returning_visitor_rate: toRate(returningVisitors.size, visitorIds.size),
      purchase_session_rate: toRate(rows.filter((row) => Boolean(row && row.has_purchase)).length, rows.length),
      detail_open_session_rate: toRate(rows.filter((row) => Boolean(row && row.has_detail_open)).length, rows.length),
      detail_opens_per_session: average(rows.map((row) => toNumber(row && row.item_detail_open_count)), 2) || 0,
      average_route_ready_ms: average(rows.map((row) => row.average_route_ready_ms).filter((value) => value !== null), 0) || 0,
    };
  }).sort((left, right) => right.sessions - left.sessions);
}

function buildTimingRows(sessionRows) {
  const byHour = {};
  sessionRows.forEach((row) => {
    const hourKey = typeof row.hour_of_day === 'number' ? String(row.hour_of_day).padStart(2, '0') : 'unknown';
    if (!byHour[hourKey]) {
      byHour[hourKey] = [];
    }
    byHour[hourKey].push(row);
  });

  const byDay = {};
  sessionRows.forEach((row) => {
    const dayKey = normalizeText(row && row.day_of_week, 'unknown');
    if (!byDay[dayKey]) {
      byDay[dayKey] = [];
    }
    byDay[dayKey].push(row);
  });

  function summarize(rows, label) {
    return {
      label,
      sessions: rows.length,
      purchase_session_rate: toRate(rows.filter((row) => Boolean(row && row.has_purchase)).length, rows.length),
      detail_open_session_rate: toRate(rows.filter((row) => Boolean(row && row.has_detail_open)).length, rows.length),
      average_route_ready_ms: average(rows.map((row) => row.average_route_ready_ms).filter((value) => value !== null), 0) || 0,
    };
  }

  return {
    by_hour: Object.keys(byHour).sort().map((hourKey) => summarize(byHour[hourKey], hourKey)),
    by_day_of_week: Object.keys(byDay)
      .sort((left, right) => DAY_ORDER.indexOf(left) - DAY_ORDER.indexOf(right))
      .map((dayKey) => summarize(byDay[dayKey], dayKey)),
  };
}

function buildPerformanceContextRows(sessionRows) {
  function summarize(rows, label) {
    return {
      label,
      sessions: rows.length,
      purchase_session_rate: toRate(rows.filter((row) => Boolean(row && row.has_purchase)).length, rows.length),
      detail_open_session_rate: toRate(rows.filter((row) => Boolean(row && row.has_detail_open)).length, rows.length),
      average_route_ready_ms: average(rows.map((row) => row.average_route_ready_ms).filter((value) => value !== null), 0) || 0,
    };
  }

  const byNetwork = aggregateRows(sessionRows, 'network_effective_type');
  const bySpeed = aggregateRows(sessionRows, 'speed_bucket');

  return {
    by_network_type: Object.keys(byNetwork).sort().map((key) => summarize(byNetwork[key], key)),
    by_speed_bucket: Object.keys(bySpeed).sort().map((key) => summarize(bySpeed[key], key)),
  };
}

function buildCuriosityItems(eventsFact, sessionIds) {
  const itemRows = new Map();

  function getRow(itemId) {
    const normalizedItemId = normalizeText(itemId, 'item_unknown');
    if (!itemRows.has(normalizedItemId)) {
      itemRows.set(normalizedItemId, {
        item_id: normalizedItemId,
        item_name: normalizedItemId,
        category: 'unknown',
        detail_opens: 0,
        add_to_cart_units: 0,
        purchase_units: 0,
      });
    }
    return itemRows.get(normalizedItemId);
  }

  (Array.isArray(eventsFact) ? eventsFact : []).forEach((eventPayload) => {
    if (!sessionIds.has(normalizeText(eventPayload && eventPayload.session_id, 'session_unknown'))) {
      return;
    }

    const eventName = normalizeText(eventPayload && eventPayload.event_name);
    if (eventName === 'item_detail_open' || eventName === 'add_to_cart') {
      const row = getRow(eventPayload.item_id);
      row.item_name = normalizeText(eventPayload.item_name, row.item_name);
      row.category = normalizeText(eventPayload.category, row.category);
      if (eventName === 'item_detail_open') {
        row.detail_opens += 1;
      } else {
        row.add_to_cart_units += Math.max(1, Math.round(toNumber(eventPayload.quantity) || 1));
      }
      return;
    }

    if (eventName === 'purchase') {
      const items = Array.isArray(eventPayload && eventPayload.items) ? eventPayload.items : [];
      items.forEach((item) => {
        const row = getRow(item && item.item_id);
        row.purchase_units += Math.max(1, Math.round(toNumber(item && item.quantity) || 1));
      });
    }
  });

  return Array.from(itemRows.values())
    .map((row) => Object.assign({}, row, {
      detail_to_purchase_gap: Math.max(0, row.detail_opens - row.purchase_units),
      curiosity_score: toRoundedNumber((row.detail_opens * 2) - row.add_to_cart_units - (row.purchase_units * 3), 2),
    }))
    .filter((row) => row.detail_opens > 0)
    .sort((left, right) => {
      if (right.curiosity_score !== left.curiosity_score) {
        return right.curiosity_score - left.curiosity_score;
      }
      return right.detail_opens - left.detail_opens;
    })
    .slice(0, 10);
}

function buildCohortSnapshot(pipelineResult, options = {}) {
  const generatedAt = normalizeText(options.generatedAt, new Date().toISOString());
  const scopeMode = normalizeText(options.scopeMode, 'all_traffic');
  const filters = normalizeFilters(options.filters);
  const sessionRows = buildSessionRows(pipelineResult, {
    scopeMode,
    filters,
    timeZone: options.timeZone,
  });
  const eventsFact = pipelineResult && pipelineResult.curated ? pipelineResult.curated.events_fact || [] : [];
  const sessionIds = new Set(sessionRows.map((row) => row.session_id));

  return {
    version: VERSION,
    generatedAt,
    scope: {
      mode: scopeMode,
      excludedTrafficClassesForBusiness: Array.from(NON_BUSINESS_TRAFFIC_CLASSES),
      timeZone: normalizeText(options.timeZone, DEFAULT_TIME_ZONE),
    },
    filters,
    cohorts: {
      by_visitor_type: buildCohortRows(sessionRows, 'visitor_type'),
      by_entry_source: buildCohortRows(sessionRows, 'entry_source'),
    },
    retention: buildRetentionSummary(sessionRows),
    timing: buildTimingRows(sessionRows),
    performance_context: buildPerformanceContextRows(sessionRows),
    curiosity_items: buildCuriosityItems(eventsFact, sessionIds),
  };
}

module.exports = {
  DEFAULT_TIME_ZONE,
  VERSION,
  buildCohortSnapshot,
};
