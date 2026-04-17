const analyticsContract = require('./analytics-contract.js');
const analyticsTaxonomy = require('./analytics-taxonomy.js');

const VERSION = 'figata.analytics.pipeline.v1';

function normalizeText(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed || fallback;
}

function toDateKey(value) {
  const timestamp = Date.parse(normalizeText(value));
  if (!Number.isFinite(timestamp)) {
    return 'unknown';
  }

  return new Date(timestamp).toISOString().slice(0, 10);
}

function toTimeMs(value) {
  const timestamp = Date.parse(normalizeText(value));
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function toRoundedNumber(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.round(numericValue * 1000) / 1000;
}

function uniquePush(target, value) {
  const normalizedValue = normalizeText(value);
  if (!normalizedValue) {
    return;
  }

  if (target.indexOf(normalizedValue) === -1) {
    target.push(normalizedValue);
  }
}

function average(values) {
  const numericValues = (Array.isArray(values) ? values : []).filter((value) =>
    typeof value === 'number' && Number.isFinite(value)
  );

  if (!numericValues.length) {
    return null;
  }

  const total = numericValues.reduce((sum, value) => sum + value, 0);
  return Math.round(total / numericValues.length);
}

function diffMs(startAt, endAt) {
  const startMs = toTimeMs(startAt);
  const endMs = toTimeMs(endAt);

  if (!(startMs > 0) || !(endMs > 0) || endMs < startMs) {
    return null;
  }

  return endMs - startMs;
}

function parseNdjson(rawText, options = {}) {
  const lines = String(rawText || '').split(/\r?\n/);
  const sourceLabel = normalizeText(options.sourceLabel, 'memory');
  const records = [];

  lines.forEach((line, index) => {
    if (!line.trim()) {
      return;
    }

    try {
      records.push({
        rawIndex: index + 1,
        sourceLabel,
        payload: JSON.parse(line),
      });
    } catch (error) {
      records.push({
        rawIndex: index + 1,
        sourceLabel,
        parseError: normalizeText(error && error.message, 'Invalid JSON line'),
        rawLine: line,
      });
    }
  });

  return records;
}

function matchesWindow(partitionDate, windowStart, windowEnd) {
  if (!partitionDate || partitionDate === 'unknown') {
    return true;
  }

  if (windowStart && partitionDate < windowStart) {
    return false;
  }

  if (windowEnd && partitionDate > windowEnd) {
    return false;
  }

  return true;
}

function compareRecords(left, right) {
  const leftTime = toTimeMs(left && left.occurred_at);
  const rightTime = toTimeMs(right && right.occurred_at);

  if (leftTime !== rightTime) {
    return leftTime - rightTime;
  }

  return (Number(left && left.__raw_index) || 0) - (Number(right && right.__raw_index) || 0);
}

function buildRawRow(inputRecord, processedAt, validation, extra = {}) {
  const payload = validation && validation.sanitized ? validation.sanitized : null;
  const partitionDate = payload ? toDateKey(payload.occurred_at) : toDateKey(processedAt);

  return Object.assign({
    pipeline_version: VERSION,
    processed_at: processedAt,
    raw_index: Number(inputRecord.rawIndex) || 0,
    raw_source: normalizeText(inputRecord.sourceLabel, 'memory'),
    partition_date: partitionDate,
    event_id: payload ? normalizeText(payload.event_id) : '',
    event_name: payload ? normalizeText(payload.event_name) : '',
    occurred_at: payload ? normalizeText(payload.occurred_at) : '',
    idempotency_key: validation ? normalizeText(validation.idempotencyKey) : '',
    validation_status: payload ? 'accepted' : 'rejected',
    validation_errors: validation && Array.isArray(validation.errors) ? validation.errors.slice() : [],
    payload,
  }, extra);
}

function buildEventFact(rawRow) {
  const payload = rawRow && rawRow.payload ? rawRow.payload : {};
  const definition = analyticsTaxonomy.getEventDefinition(payload.event_name) || null;

  return Object.assign({}, payload, {
    pipeline_version: VERSION,
    processed_at: rawRow.processed_at,
    partition_date: rawRow.partition_date,
    idempotency_key: rawRow.idempotency_key,
    event_family: definition ? normalizeText(definition.family, 'unknown') : 'unknown',
    event_stage: definition ? normalizeText(definition.stage, 'unknown') : 'unknown',
    event_status: definition ? normalizeText(definition.status, 'unknown') : 'unknown',
  });
}

function aggregateSessions(eventsFact) {
  const sessions = new Map();

  eventsFact
    .slice()
    .sort(compareRecords)
    .forEach((eventPayload) => {
      const sessionId = normalizeText(eventPayload.session_id, 'session_unknown');
      const session = sessions.get(sessionId) || {
        session_id: sessionId,
        visitor_id: normalizeText(eventPayload.visitor_id),
        session_sequence: Number(eventPayload.session_sequence) || null,
        environment: normalizeText(eventPayload.environment),
        traffic_class: normalizeText(eventPayload.traffic_class),
        is_internal: Boolean(eventPayload.is_internal),
        entry_source: normalizeText(eventPayload.entry_source, 'unknown'),
        entry_source_detail: normalizeText(eventPayload.entry_source_detail, 'none'),
        source_medium: normalizeText(eventPayload.source_medium, 'none'),
        source_campaign: normalizeText(eventPayload.source_campaign, 'none'),
        source_content: normalizeText(eventPayload.source_content, 'none'),
        referrer_host: normalizeText(eventPayload.referrer_host, 'direct'),
        started_at: normalizeText(eventPayload.occurred_at),
        ended_at: normalizeText(eventPayload.occurred_at),
        first_page_path: normalizeText(eventPayload.page_path),
        first_route_name: normalizeText(eventPayload.route_name),
        route_names: [],
        page_paths: [],
        site_sections: [],
        visit_context_initial: normalizeText(eventPayload.visit_context, 'unknown'),
        visit_context_final: normalizeText(eventPayload.visit_context, 'unknown'),
        visit_context_history: [],
        event_count: 0,
        page_view_count: 0,
        page_exit_count: 0,
        nav_click_count: 0,
        cta_click_count: 0,
        scroll_milestone_count: 0,
        section_view_count: 0,
        menu_section_view_count: 0,
        item_impression_count: 0,
        item_detail_open_count: 0,
        add_to_cart_count: 0,
        remove_from_cart_count: 0,
        cart_view_count: 0,
        begin_checkout_count: 0,
        purchase_count: 0,
        purchase_value_total: 0,
        purchase_order_ids: [],
        performance_summary_count: 0,
        average_route_ready_ms: null,
        average_fcp_ms: null,
        average_dom_interactive_ms: null,
        wifi_assist_shown_count: 0,
        wifi_assist_dismissed_count: 0,
        wifi_assist_copy_password_count: 0,
        wifi_assist_cta_click_count: 0,
        visit_context_confirmed_count: 0,
        has_purchase: false,
        has_add_to_cart: false,
        has_confirmed_wifi: false,
        partition_date: toDateKey(eventPayload.occurred_at),
        __routeReadyValues: [],
        __fcpValues: [],
        __domInteractiveValues: [],
      };

      session.visitor_id = session.visitor_id || normalizeText(eventPayload.visitor_id);
      session.session_sequence = session.session_sequence || Number(eventPayload.session_sequence) || null;
      session.environment = session.environment || normalizeText(eventPayload.environment);
      session.traffic_class = session.traffic_class || normalizeText(eventPayload.traffic_class);
      session.is_internal = session.is_internal || Boolean(eventPayload.is_internal);

      const occurredAt = normalizeText(eventPayload.occurred_at);
      if (compareRecords({ occurred_at: occurredAt, __raw_index: eventPayload.__raw_index }, { occurred_at: session.started_at, __raw_index: 0 }) < 0) {
        session.started_at = occurredAt;
        session.first_page_path = normalizeText(eventPayload.page_path, session.first_page_path);
        session.first_route_name = normalizeText(eventPayload.route_name, session.first_route_name);
      }
      if (compareRecords({ occurred_at: occurredAt, __raw_index: eventPayload.__raw_index }, { occurred_at: session.ended_at, __raw_index: 0 }) >= 0) {
        session.ended_at = occurredAt;
      }

      uniquePush(session.route_names, eventPayload.route_name);
      uniquePush(session.page_paths, eventPayload.page_path);
      uniquePush(session.site_sections, eventPayload.site_section);
      if (!session.visit_context_history.length || session.visit_context_history[session.visit_context_history.length - 1] !== normalizeText(eventPayload.visit_context, 'unknown')) {
        session.visit_context_history.push(normalizeText(eventPayload.visit_context, 'unknown'));
      }
      session.visit_context_final = normalizeText(eventPayload.visit_context, session.visit_context_final || 'unknown');
      session.event_count += 1;

      switch (eventPayload.event_name) {
        case 'page_view':
          session.page_view_count += 1;
          break;
        case 'page_exit':
          session.page_exit_count += 1;
          break;
        case 'nav_link_click':
          session.nav_click_count += 1;
          break;
        case 'cta_click':
          session.cta_click_count += 1;
          break;
        case 'scroll_milestone':
          session.scroll_milestone_count += 1;
          break;
        case 'section_view':
          session.section_view_count += 1;
          break;
        case 'menu_section_view':
          session.menu_section_view_count += 1;
          break;
        case 'item_impression':
          session.item_impression_count += 1;
          break;
        case 'item_detail_open':
          session.item_detail_open_count += 1;
          break;
        case 'add_to_cart':
          session.add_to_cart_count += 1;
          session.has_add_to_cart = true;
          break;
        case 'remove_from_cart':
          session.remove_from_cart_count += 1;
          break;
        case 'cart_view':
          session.cart_view_count += 1;
          break;
        case 'begin_checkout':
          session.begin_checkout_count += 1;
          break;
        case 'purchase':
          session.purchase_count += 1;
          session.purchase_value_total += Number(eventPayload.value) || 0;
          session.has_purchase = true;
          uniquePush(session.purchase_order_ids, eventPayload.order_id);
          break;
        case 'performance_summary':
          session.performance_summary_count += 1;
          if (typeof eventPayload.route_ready_ms === 'number') {
            session.__routeReadyValues.push(eventPayload.route_ready_ms);
          }
          if (typeof eventPayload.fcp_ms === 'number') {
            session.__fcpValues.push(eventPayload.fcp_ms);
          }
          if (typeof eventPayload.dom_interactive_ms === 'number') {
            session.__domInteractiveValues.push(eventPayload.dom_interactive_ms);
          }
          break;
        case 'wifi_assist_shown':
          session.wifi_assist_shown_count += 1;
          break;
        case 'wifi_assist_dismissed':
          session.wifi_assist_dismissed_count += 1;
          break;
        case 'wifi_assist_copy_password':
          session.wifi_assist_copy_password_count += 1;
          break;
        case 'wifi_assist_cta_click':
          session.wifi_assist_cta_click_count += 1;
          break;
        case 'visit_context_confirmed':
          session.visit_context_confirmed_count += 1;
          session.has_confirmed_wifi = normalizeText(eventPayload.visit_context) === 'in_restaurant_confirmed_wifi';
          break;
        default:
          break;
      }

      sessions.set(sessionId, session);
    });

  return Array.from(sessions.values())
    .map((session) => {
      session.duration_ms = diffMs(session.started_at, session.ended_at);
      session.purchase_value_total = toRoundedNumber(session.purchase_value_total);
      session.average_route_ready_ms = average(session.__routeReadyValues);
      session.average_fcp_ms = average(session.__fcpValues);
      session.average_dom_interactive_ms = average(session.__domInteractiveValues);
      delete session.__routeReadyValues;
      delete session.__fcpValues;
      delete session.__domInteractiveValues;
      return session;
    })
    .sort((left, right) => compareRecords({ occurred_at: left.started_at, __raw_index: 0 }, { occurred_at: right.started_at, __raw_index: 0 }));
}

function aggregateVisitors(sessionsFact) {
  const visitors = new Map();

  sessionsFact.forEach((session) => {
    const visitorId = normalizeText(session.visitor_id, 'visitor_unknown');
    const visitor = visitors.get(visitorId) || {
      visitor_id: visitorId,
      first_seen_at: normalizeText(session.started_at),
      last_seen_at: normalizeText(session.ended_at),
      last_session_id: normalizeText(session.session_id),
      session_count: 0,
      returning_session_count: 0,
      total_event_count: 0,
      total_purchase_count: 0,
      total_purchase_value: 0,
      average_session_duration_ms: null,
      entry_sources: [],
      visit_contexts: [],
      has_in_restaurant_visit: false,
      has_confirmed_wifi_session: false,
      partition_date: toDateKey(session.ended_at || session.started_at),
      __durationValues: [],
    };

    if (compareRecords({ occurred_at: session.started_at, __raw_index: 0 }, { occurred_at: visitor.first_seen_at, __raw_index: 0 }) < 0) {
      visitor.first_seen_at = normalizeText(session.started_at);
    }
    if (compareRecords({ occurred_at: session.ended_at, __raw_index: 0 }, { occurred_at: visitor.last_seen_at, __raw_index: 0 }) >= 0) {
      visitor.last_seen_at = normalizeText(session.ended_at);
      visitor.last_session_id = normalizeText(session.session_id);
      visitor.partition_date = toDateKey(session.ended_at || session.started_at);
    }

    visitor.session_count += 1;
    visitor.total_event_count += Number(session.event_count) || 0;
    visitor.total_purchase_count += Number(session.purchase_count) || 0;
    visitor.total_purchase_value += Number(session.purchase_value_total) || 0;
    uniquePush(visitor.entry_sources, session.entry_source);
    (Array.isArray(session.visit_context_history) ? session.visit_context_history : []).forEach((visitContext) => {
      uniquePush(visitor.visit_contexts, visitContext);
    });
    visitor.has_in_restaurant_visit = visitor.has_in_restaurant_visit || visitor.visit_contexts.some((visitContext) => visitContext.indexOf('in_restaurant') === 0);
    visitor.has_confirmed_wifi_session = visitor.has_confirmed_wifi_session || Boolean(session.has_confirmed_wifi);

    if (typeof session.duration_ms === 'number' && Number.isFinite(session.duration_ms)) {
      visitor.__durationValues.push(session.duration_ms);
    }

    visitors.set(visitorId, visitor);
  });

  return Array.from(visitors.values())
    .map((visitor) => {
      visitor.returning_session_count = Math.max(0, visitor.session_count - 1);
      visitor.total_purchase_value = toRoundedNumber(visitor.total_purchase_value);
      visitor.average_session_duration_ms = average(visitor.__durationValues);
      delete visitor.__durationValues;
      return visitor;
    })
    .sort((left, right) => compareRecords({ occurred_at: left.first_seen_at, __raw_index: 0 }, { occurred_at: right.first_seen_at, __raw_index: 0 }));
}

function groupByPartition(records, partitionField = 'partition_date') {
  return (Array.isArray(records) ? records : []).reduce((accumulator, record) => {
    const partitionDate = normalizeText(record && record[partitionField], 'unknown');
    if (!accumulator[partitionDate]) {
      accumulator[partitionDate] = [];
    }
    accumulator[partitionDate].push(record);
    return accumulator;
  }, {});
}

function buildAnalyticsPipeline(inputRecords, options = {}) {
  const processedAt = normalizeText(options.processedAt, new Date().toISOString());
  const windowStart = normalizeText(options.fromDate);
  const windowEnd = normalizeText(options.toDate);
  const sourceLabel = normalizeText(options.sourceLabel, 'memory');
  const rawRows = [];
  const quarantineRows = [];
  const duplicateCounts = {
    event_id: 0,
    idempotency_key: 0,
  };
  const seenEventIds = new Set();
  const curatedIndexByIdempotency = new Map();

  (Array.isArray(inputRecords) ? inputRecords : []).forEach((inputRecord, index) => {
    const record = inputRecord && typeof inputRecord === 'object' && Object.prototype.hasOwnProperty.call(inputRecord, 'payload')
      ? inputRecord
      : {
          rawIndex: index + 1,
          sourceLabel,
          payload: inputRecord,
        };

    if (record.parseError) {
      quarantineRows.push({
        pipeline_version: VERSION,
        processed_at: processedAt,
        raw_index: Number(record.rawIndex) || 0,
        raw_source: normalizeText(record.sourceLabel, sourceLabel),
        partition_date: 'unknown',
        rejection_stage: 'parse',
        validation_errors: [normalizeText(record.parseError, 'Invalid JSON line')],
        raw_line: normalizeText(record.rawLine),
      });
      return;
    }

    const validation = analyticsContract.validateEvent(record.payload);
    if (!validation.ok) {
      quarantineRows.push({
        pipeline_version: VERSION,
        processed_at: processedAt,
        raw_index: Number(record.rawIndex) || 0,
        raw_source: normalizeText(record.sourceLabel, sourceLabel),
        partition_date: toDateKey(record.payload && record.payload.occurred_at),
        rejection_stage: 'contract',
        validation_errors: validation.errors.slice(),
        raw_line: '',
        payload: record.payload,
      });
      return;
    }

    const sanitizedPayload = Object.assign({}, validation.sanitized, {
      __raw_index: Number(record.rawIndex) || 0,
    });
    const partitionDate = toDateKey(sanitizedPayload.occurred_at);
    if (!matchesWindow(partitionDate, windowStart, windowEnd)) {
      return;
    }

    const rawRow = buildRawRow(record, processedAt, {
      sanitized: sanitizedPayload,
      errors: [],
      idempotencyKey: validation.idempotencyKey,
    }, {
      duplicate_reason: '',
      curated_included: true,
    });

    if (seenEventIds.has(rawRow.event_id)) {
      rawRow.validation_status = 'duplicate_event_id';
      rawRow.duplicate_reason = 'event_id';
      rawRow.curated_included = false;
      duplicateCounts.event_id += 1;
      rawRows.push(rawRow);
      return;
    }
    seenEventIds.add(rawRow.event_id);

    const priorRow = curatedIndexByIdempotency.get(rawRow.idempotency_key);
    if (priorRow) {
      duplicateCounts.idempotency_key += 1;
      if (compareRecords(rawRow.payload, priorRow.payload) >= 0) {
        priorRow.validation_status = 'duplicate_idempotency_key';
        priorRow.duplicate_reason = 'idempotency_key';
        priorRow.curated_included = false;
        curatedIndexByIdempotency.set(rawRow.idempotency_key, rawRow);
      } else {
        rawRow.validation_status = 'duplicate_idempotency_key';
        rawRow.duplicate_reason = 'idempotency_key';
        rawRow.curated_included = false;
      }
    } else {
      curatedIndexByIdempotency.set(rawRow.idempotency_key, rawRow);
    }

    rawRows.push(rawRow);
  });

  const curatedEventsFact = rawRows
    .filter((row) => row.curated_included)
    .map(buildEventFact)
    .sort(compareRecords);
  const sessionsFact = aggregateSessions(curatedEventsFact);
  const visitorsFact = aggregateVisitors(sessionsFact);

  return {
    manifest: {
      pipeline_version: VERSION,
      processed_at: processedAt,
      source_label: sourceLabel,
      input_record_count: Array.isArray(inputRecords) ? inputRecords.length : 0,
      raw_event_count: rawRows.length,
      curated_event_count: curatedEventsFact.length,
      sessions_fact_count: sessionsFact.length,
      visitors_fact_count: visitorsFact.length,
      quarantine_count: quarantineRows.length,
      duplicate_event_id_count: duplicateCounts.event_id,
      duplicate_idempotency_key_count: duplicateCounts.idempotency_key,
      backfill_window: {
        from: windowStart || null,
        to: windowEnd || null,
      },
      partitions: {
        raw: Object.keys(groupByPartition(rawRows)).sort(),
        quarantine: Object.keys(groupByPartition(quarantineRows)).sort(),
        events_fact: Object.keys(groupByPartition(curatedEventsFact)).sort(),
        sessions_fact: Object.keys(groupByPartition(sessionsFact)).sort(),
        visitors_fact: Object.keys(groupByPartition(visitorsFact)).sort(),
      },
    },
    raw: {
      events: rawRows,
      quarantine: quarantineRows,
    },
    curated: {
      events_fact: curatedEventsFact,
      sessions_fact: sessionsFact,
      visitors_fact: visitorsFact,
    },
  };
}

function writeNdjson(filePath, records) {
  const lines = (Array.isArray(records) ? records : [])
    .map((record) => JSON.stringify(record))
    .join('\n');
  return lines ? lines + '\n' : '';
}

function joinPathSegments() {
  return Array.prototype.slice.call(arguments)
    .filter(function (segment) {
      return typeof segment === 'string' && segment.trim();
    })
    .map(function (segment, index) {
      var normalized = String(segment).replace(/\\/g, '/');
      if (!index) {
        return normalized.replace(/\/+$/g, '');
      }
      return normalized.replace(/^\/+/g, '').replace(/\/+$/g, '');
    })
    .filter(Boolean)
    .join('/');
}

function buildOutputFiles(pipelineResult) {
  const files = [];
  const rawPartitions = groupByPartition(pipelineResult.raw.events);
  const quarantinePartitions = groupByPartition(pipelineResult.raw.quarantine);
  const eventsFactPartitions = groupByPartition(pipelineResult.curated.events_fact);
  const sessionsFactPartitions = groupByPartition(pipelineResult.curated.sessions_fact);
  const visitorsFactPartitions = groupByPartition(pipelineResult.curated.visitors_fact);

  Object.keys(rawPartitions).forEach((partitionDate) => {
    files.push({
      relativePath: joinPathSegments('raw', 'events', 'date=' + partitionDate, 'events.ndjson'),
      content: writeNdjson('', rawPartitions[partitionDate]),
    });
  });

  Object.keys(quarantinePartitions).forEach((partitionDate) => {
    files.push({
      relativePath: joinPathSegments('raw', 'quarantine', 'date=' + partitionDate, 'quarantine.ndjson'),
      content: writeNdjson('', quarantinePartitions[partitionDate]),
    });
  });

  Object.keys(eventsFactPartitions).forEach((partitionDate) => {
    files.push({
      relativePath: joinPathSegments('curated', 'events_fact', 'date=' + partitionDate, 'events.ndjson'),
      content: writeNdjson('', eventsFactPartitions[partitionDate]),
    });
  });

  Object.keys(sessionsFactPartitions).forEach((partitionDate) => {
    files.push({
      relativePath: joinPathSegments('curated', 'sessions_fact', 'date=' + partitionDate, 'sessions.ndjson'),
      content: writeNdjson('', sessionsFactPartitions[partitionDate]),
    });
  });

  Object.keys(visitorsFactPartitions).forEach((partitionDate) => {
    files.push({
      relativePath: joinPathSegments('curated', 'visitors_fact', 'date=' + partitionDate, 'visitors.ndjson'),
      content: writeNdjson('', visitorsFactPartitions[partitionDate]),
    });
  });

  files.push({
    relativePath: joinPathSegments('manifests', 'latest-run.json'),
    content: JSON.stringify(pipelineResult.manifest, null, 2) + '\n',
  });
  files.push({
    relativePath: joinPathSegments('curated', 'summary.json'),
    content: JSON.stringify({
      manifest: pipelineResult.manifest,
      sessions_fact: pipelineResult.curated.sessions_fact,
      visitors_fact: pipelineResult.curated.visitors_fact,
    }, null, 2) + '\n',
  });

  return files;
}

module.exports = {
  VERSION,
  buildAnalyticsPipeline,
  buildOutputFiles,
  groupByPartition,
  parseNdjson,
  toDateKey,
};
