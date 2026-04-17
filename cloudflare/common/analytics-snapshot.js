const analyticsPipeline = require('../../shared/analytics-pipeline.js');
const analyticsQuality = require('../../shared/analytics-quality.js');
const analyticsKpiCatalog = require('../../shared/analytics-kpi-catalog.js');
const analyticsCohorts = require('../../shared/analytics-cohorts.js');
const r2Storage = require('./r2-storage.js');
const { normalizeText } = require('./pathing.js');

const DEFAULT_RAW_PREFIX = 'raw';
const DEFAULT_SCOPE_MODE = 'all_traffic';
const DEFAULT_LIMIT_DAYS = 31;

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

async function loadRawEventsForWindow(bucket, options) {
  const source = options && typeof options === 'object' ? options : {};
  const fromDate = normalizeText(source.fromDate);
  const toDate = normalizeText(source.toDate || source.fromDate);
  const rawPrefix = normalizeText(source.rawPrefix, DEFAULT_RAW_PREFIX);
  const limitDays = Number.isFinite(Number(source.limitDays)) ? Math.max(1, Math.round(Number(source.limitDays))) : DEFAULT_LIMIT_DAYS;
  const eventLimit = Number.isFinite(Number(source.limit)) ? Math.max(0, Math.round(Number(source.limit))) : 0;

  const keys = await r2Storage.listRawKeysForWindow(bucket, {
    fromDate: fromDate,
    toDate: toDate,
  }, {
    prefix: rawPrefix,
    limitDays: limitDays,
  });

  const events = [];
  for (const key of keys) {
    const rawText = await r2Storage.readTextObject(bucket, key);
    const parsed = analyticsPipeline.parseNdjson(rawText, { sourceLabel: key });
    parsed.forEach(function (entry) {
      events.push(entry);
    });
  }

  const slicedEvents = eventLimit > 0 ? events.slice(-eventLimit) : events;
  return {
    rawKeys: keys,
    events: slicedEvents,
    totalEventCount: events.length,
  };
}

async function buildAnalyticsSnapshotPayload(options) {
  const source = options && typeof options === 'object' ? options : {};
  const bucket = source.bucket;
  if (!bucket || typeof bucket.get !== 'function') {
    throw new Error('ANALYTICS_BUCKET binding is required');
  }

  const generatedAt = normalizeText(source.generatedAt, new Date().toISOString());
  const fromDate = normalizeText(source.fromDate);
  const toDate = normalizeText(source.toDate || source.fromDate);
  const scopeMode = normalizeText(source.scopeMode, DEFAULT_SCOPE_MODE);
  const filters = normalizeFilters(source.filters);
  const rawLoad = await loadRawEventsForWindow(bucket, {
    fromDate: fromDate,
    toDate: toDate,
    rawPrefix: source.rawPrefix,
    limitDays: source.limitDays,
    limit: source.limit,
  });

  const curatedSnapshot = analyticsPipeline.buildAnalyticsPipeline(rawLoad.events, {
    sourceLabel: normalizeText(source.sourceLabel, 'r2://figata-analytics/' + normalizeText(source.rawPrefix, DEFAULT_RAW_PREFIX)),
    processedAt: generatedAt,
    fromDate: fromDate,
    toDate: toDate,
  });

  return {
    logPath: normalizeText(source.logPath, 'r2://figata-analytics/' + normalizeText(source.rawPrefix, DEFAULT_RAW_PREFIX)),
    rawKeyCount: rawLoad.rawKeys.length,
    rawKeys: rawLoad.rawKeys,
    events: rawLoad.events,
    curatedSnapshot: curatedSnapshot,
    qualitySnapshot: analyticsQuality.buildQualitySnapshot(curatedSnapshot, {
      generatedAt: generatedAt,
    }),
    kpiSnapshot: analyticsKpiCatalog.buildKpiCatalogSnapshot(curatedSnapshot, {
      generatedAt: generatedAt,
      scopeMode: scopeMode,
      filters: filters,
    }),
    cohortSnapshot: analyticsCohorts.buildCohortSnapshot(curatedSnapshot, {
      generatedAt: generatedAt,
      scopeMode: scopeMode,
      filters: filters,
    }),
    decisionSummary: null,
    inStoreSummary: null,
    performanceBaseline: null,
    meta: {
      generated_at: generatedAt,
      from_date: fromDate,
      to_date: toDate,
      scope_mode: scopeMode,
      filters: filters,
      total_event_count: rawLoad.totalEventCount,
    },
  };
}

module.exports = {
  DEFAULT_LIMIT_DAYS,
  DEFAULT_RAW_PREFIX,
  buildAnalyticsSnapshotPayload,
  loadRawEventsForWindow,
  normalizeFilters,
};
