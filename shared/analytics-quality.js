const analyticsConfig = require('./analytics-config.js');

const VERSION = 'figata.analytics.quality.v1';

const DEFAULT_THRESHOLDS = {
  quarantineAlertCount: 1,
  duplicateRateWarn: 0.05,
  duplicateRateAlert: 0.15,
  freshnessWarnMinutes: 120,
  coreEvents: ['session_start', 'page_view', 'source_attribution_resolved'],
  criticalFields: ['event_id', 'event_name', 'session_id', 'visitor_id', 'entry_source', 'visit_context', 'page_path'],
};

function normalizeText(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed || fallback;
}

function toTimeMs(value) {
  const timestamp = Date.parse(normalizeText(value));
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function toRate(numerator, denominator) {
  if (!(denominator > 0)) {
    return 0;
  }

  return Number((numerator / denominator).toFixed(4));
}

function getRouteNames(eventsFact) {
  return Array.from(new Set((Array.isArray(eventsFact) ? eventsFact : []).map((eventPayload) => normalizeText(eventPayload.route_name, 'unknown')))).filter(Boolean);
}

function countBy(items, getKey) {
  return (Array.isArray(items) ? items : []).reduce((accumulator, item) => {
    const key = normalizeText(getKey(item), 'unknown');
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});
}

function buildCoreCoverage(eventsFact, thresholds) {
  const coreEvents = Array.isArray(thresholds.coreEvents) ? thresholds.coreEvents : [];
  const countsByEvent = countBy(eventsFact, (eventPayload) => eventPayload.event_name);
  const byRoute = {};

  getRouteNames(eventsFact).forEach((routeName) => {
    const routeEvents = eventsFact.filter((eventPayload) => normalizeText(eventPayload.route_name, 'unknown') === routeName);
    byRoute[routeName] = {};
    coreEvents.forEach((eventName) => {
      const count = routeEvents.filter((eventPayload) => eventPayload.event_name === eventName).length;
      byRoute[routeName][eventName] = {
        count,
        status: count > 0 ? 'ok' : 'alert',
      };
    });
  });

  return {
    global: coreEvents.reduce((accumulator, eventName) => {
      const count = countsByEvent[eventName] || 0;
      accumulator[eventName] = {
        count,
        status: count > 0 ? 'ok' : 'alert',
      };
      return accumulator;
    }, {}),
    byRoute,
  };
}

function buildCriticalNulls(eventsFact, thresholds) {
  const criticalFields = Array.isArray(thresholds.criticalFields) ? thresholds.criticalFields : [];
  return criticalFields.reduce((accumulator, fieldName) => {
    accumulator[fieldName] = (Array.isArray(eventsFact) ? eventsFact : []).filter((eventPayload) => {
      const value = eventPayload && eventPayload[fieldName];
      if (typeof value === 'boolean') {
        return false;
      }
      if (typeof value === 'number') {
        return !Number.isFinite(value);
      }
      return !normalizeText(value);
    }).length;
    return accumulator;
  }, {});
}

function buildInternalAudit(eventsFact, sessionsFact) {
  const normalizedEvents = Array.isArray(eventsFact) ? eventsFact : [];
  const normalizedSessions = Array.isArray(sessionsFact) ? sessionsFact : [];
  const internalEvents = normalizedEvents.filter((eventPayload) => Boolean(eventPayload.is_internal));
  const internalSessions = normalizedSessions.filter((session) => Boolean(session.is_internal));
  const publicInternalLeaks = normalizedEvents.filter((eventPayload) =>
    Boolean(eventPayload.is_internal) && normalizeText(eventPayload.traffic_class) === 'public'
  );

  return {
    internalEventCount: internalEvents.length,
    internalSessionCount: internalSessions.length,
    excludedInternalEventCount: internalEvents.length,
    publicInternalLeakCount: publicInternalLeaks.length,
    trafficClasses: countBy(normalizedEvents, (eventPayload) => eventPayload.traffic_class),
    status: publicInternalLeaks.length > 0 ? 'alert' : 'ok',
  };
}

function buildFunnelHealth(eventsFact) {
  const counts = countBy(eventsFact, (eventPayload) => eventPayload.event_name);
  const purchaseCount = counts.purchase || 0;
  const beginCheckoutCount = counts.begin_checkout || 0;
  const addToCartCount = counts.add_to_cart || 0;
  const detailOpenCount = counts.item_detail_open || 0;
  const alerts = [];

  if (purchaseCount > 0 && beginCheckoutCount === 0) {
    alerts.push({
      code: 'funnel_missing_begin_checkout',
      severity: 'alert',
      message: 'There are purchase events but no begin_checkout events in the current window.',
    });
  }

  if (beginCheckoutCount > 0 && addToCartCount === 0) {
    alerts.push({
      code: 'funnel_missing_add_to_cart',
      severity: 'alert',
      message: 'There are begin_checkout events but no add_to_cart events in the current window.',
    });
  }

  if (addToCartCount > 0 && detailOpenCount === 0) {
    alerts.push({
      code: 'funnel_missing_item_detail_open',
      severity: 'warn',
      message: 'There are add_to_cart events but no item_detail_open events in the current window.',
    });
  }

  return {
    counts: {
      item_detail_open: detailOpenCount,
      add_to_cart: addToCartCount,
      begin_checkout: beginCheckoutCount,
      purchase: purchaseCount,
    },
    alerts,
  };
}

function pushAlert(target, code, severity, message, details) {
  target.push({
    code,
    severity,
    message,
    details: details || null,
  });
}

function summarizeStatus(alerts) {
  if ((Array.isArray(alerts) ? alerts : []).some((alert) => normalizeText(alert.severity) === 'alert')) {
    return 'alert';
  }

  if ((Array.isArray(alerts) ? alerts : []).some((alert) => normalizeText(alert.severity) === 'warn')) {
    return 'warn';
  }

  return 'ok';
}

function buildQualitySnapshot(pipelineResult, options = {}) {
  const thresholds = Object.assign({}, DEFAULT_THRESHOLDS, options.thresholds || {});
  const manifest = pipelineResult && pipelineResult.manifest ? pipelineResult.manifest : {};
  const eventsFact = pipelineResult && pipelineResult.curated ? pipelineResult.curated.events_fact || [] : [];
  const sessionsFact = pipelineResult && pipelineResult.curated ? pipelineResult.curated.sessions_fact || [] : [];
  const visitorsFact = pipelineResult && pipelineResult.curated ? pipelineResult.curated.visitors_fact || [] : [];
  const alerts = [];
  const latestEventTimeMs = eventsFact.reduce((maxValue, eventPayload) => Math.max(maxValue, toTimeMs(eventPayload.occurred_at)), 0);
  const generatedAt = normalizeText(options.generatedAt, new Date().toISOString());
  const freshnessMinutes = latestEventTimeMs > 0
    ? Math.round((toTimeMs(generatedAt) - latestEventTimeMs) / 60000)
    : null;
  const duplicateCount = Number(manifest.duplicate_event_id_count || 0) + Number(manifest.duplicate_idempotency_key_count || 0);
  const duplicateRate = toRate(duplicateCount, Number(manifest.raw_event_count || 0));
  const quarantineRate = toRate(Number(manifest.quarantine_count || 0), Number(manifest.input_record_count || 0));
  const coreCoverage = buildCoreCoverage(eventsFact, thresholds);
  const criticalNulls = buildCriticalNulls(eventsFact, thresholds);
  const internalAudit = buildInternalAudit(eventsFact, sessionsFact);
  const funnelHealth = buildFunnelHealth(eventsFact);
  const eventCounts = countBy(eventsFact, (eventPayload) => eventPayload.event_name);

  if (Number(manifest.quarantine_count || 0) >= thresholds.quarantineAlertCount) {
    pushAlert(alerts, 'quarantine_nonzero', 'alert', 'Rejected analytics payloads were quarantined.', {
      quarantineCount: Number(manifest.quarantine_count || 0),
      quarantineRate,
    });
  }

  if (duplicateRate >= thresholds.duplicateRateAlert) {
    pushAlert(alerts, 'duplicate_rate_high', 'alert', 'Duplicate analytics rate is above the alert threshold.', {
      duplicateRate,
      duplicateCount,
    });
  } else if (duplicateRate >= thresholds.duplicateRateWarn) {
    pushAlert(alerts, 'duplicate_rate_warn', 'warn', 'Duplicate analytics rate is above the warning threshold.', {
      duplicateRate,
      duplicateCount,
    });
  }

  if (typeof freshnessMinutes === 'number' && freshnessMinutes > thresholds.freshnessWarnMinutes) {
    pushAlert(alerts, 'freshness_lag', 'warn', 'Latest analytics event is older than the freshness threshold.', {
      freshnessMinutes,
      latestEventAt: latestEventTimeMs ? new Date(latestEventTimeMs).toISOString() : null,
    });
  }

  Object.keys(coreCoverage.global).forEach((eventName) => {
    if (coreCoverage.global[eventName].status !== 'ok') {
      pushAlert(alerts, 'core_event_missing', 'alert', `Core event ${eventName} is missing in the current window.`, {
        eventName,
      });
    }
  });

  Object.keys(criticalNulls).forEach((fieldName) => {
    if (criticalNulls[fieldName] > 0) {
      pushAlert(alerts, 'critical_nulls', 'alert', `Critical analytics field ${fieldName} is empty in curated events.`, {
        fieldName,
        count: criticalNulls[fieldName],
      });
    }
  });

  if (internalAudit.publicInternalLeakCount > 0) {
    pushAlert(alerts, 'internal_audit_failed', 'alert', 'Internal traffic leaked into rows marked as public.', {
      publicInternalLeakCount: internalAudit.publicInternalLeakCount,
    });
  }

  funnelHealth.alerts.forEach((alert) => {
    pushAlert(alerts, alert.code, alert.severity, alert.message, null);
  });

  const qrSessionCount = sessionsFact.filter((session) => normalizeText(session.entry_source) === 'qr').length;
  const confirmedWifiSessionCount = sessionsFact.filter((session) => Boolean(session.has_confirmed_wifi)).length;

  return {
    version: VERSION,
    generatedAt,
    status: summarizeStatus(alerts),
    manifest: {
      pipelineVersion: normalizeText(manifest.pipeline_version, 'unknown'),
      rawEventCount: Number(manifest.raw_event_count || 0),
      curatedEventCount: Number(manifest.curated_event_count || 0),
      sessionsFactCount: Number(manifest.sessions_fact_count || 0),
      visitorsFactCount: Number(manifest.visitors_fact_count || 0),
      quarantineCount: Number(manifest.quarantine_count || 0),
      duplicateEventIdCount: Number(manifest.duplicate_event_id_count || 0),
      duplicateIdempotencyKeyCount: Number(manifest.duplicate_idempotency_key_count || 0),
      partitions: manifest.partitions || {},
    },
    metrics: {
      freshnessMinutes,
      duplicateRate,
      quarantineRate,
      qrSessionCount,
      confirmedWifiSessionCount,
    },
    coverage: {
      coreEvents: coreCoverage,
      criticalNulls,
      eventCounts,
      funnel: funnelHealth.counts,
    },
    internalAudit,
    alerts,
    thresholds,
  };
}

function renderHealthReport(snapshot, options = {}) {
  const qualitySnapshot = snapshot || {};
  const periodLabel = normalizeText(options.periodLabel, 'Current window');
  const lines = [
    '# Analytics Dataset Health',
    '',
    `- Status: ${normalizeText(qualitySnapshot.status, 'unknown').toUpperCase()}`,
    `- Period: ${periodLabel}`,
    `- Generated at: ${normalizeText(qualitySnapshot.generatedAt, 'unknown')}`,
    `- Raw events: ${Number(qualitySnapshot.manifest && qualitySnapshot.manifest.rawEventCount || 0)}`,
    `- Curated events_fact: ${Number(qualitySnapshot.manifest && qualitySnapshot.manifest.curatedEventCount || 0)}`,
    `- Quarantine: ${Number(qualitySnapshot.manifest && qualitySnapshot.manifest.quarantineCount || 0)}`,
    `- Duplicate rate: ${qualitySnapshot.metrics ? qualitySnapshot.metrics.duplicateRate : 0}`,
    '',
    '## Alerts',
  ];

  if (!Array.isArray(qualitySnapshot.alerts) || !qualitySnapshot.alerts.length) {
    lines.push('- None');
  } else {
    qualitySnapshot.alerts.forEach((alert) => {
      lines.push(`- [${normalizeText(alert.severity, 'info').toUpperCase()}] ${normalizeText(alert.code, 'unknown')}: ${normalizeText(alert.message, 'No message')}`);
    });
  }

  lines.push('', '## Internal Audit');
  lines.push(`- Internal events excluded: ${Number(qualitySnapshot.internalAudit && qualitySnapshot.internalAudit.excludedInternalEventCount || 0)}`);
  lines.push(`- Internal sessions excluded: ${Number(qualitySnapshot.internalAudit && qualitySnapshot.internalAudit.internalSessionCount || 0)}`);
  lines.push(`- Public internal leaks: ${Number(qualitySnapshot.internalAudit && qualitySnapshot.internalAudit.publicInternalLeakCount || 0)}`);
  lines.push('', '## Core Events');

  const globalCore = qualitySnapshot.coverage && qualitySnapshot.coverage.coreEvents ? qualitySnapshot.coverage.coreEvents.global || {} : {};
  Object.keys(globalCore).forEach((eventName) => {
    const entry = globalCore[eventName];
    lines.push(`- ${eventName}: ${Number(entry.count || 0)} (${normalizeText(entry.status, 'unknown')})`);
  });

  lines.push('', '## Incident Playbook');
  lines.push('- 1. Confirm whether the alert is caused by `quarantine`, duplicates, or missing core events.');
  lines.push('- 2. Inspect `/__analytics/inspect` and compare `events[]`, `curatedSnapshot`, and `qualitySnapshot`.');
  lines.push('- 3. If the issue is route-local, reproduce it in Chrome and validate the emitted payload against the contract.');
  lines.push('- 4. Re-run `npm run validate:analytics`, `npm run validate:analytics-pipeline`, and the local backfill window if a reprocess is required.');
  lines.push('- 5. Only publish dashboard or AI changes after the health snapshot returns to `ok` or the residual risk is documented.');

  return lines.join('\n') + '\n';
}

module.exports = {
  VERSION,
  DEFAULT_THRESHOLDS,
  buildQualitySnapshot,
  renderHealthReport,
};
