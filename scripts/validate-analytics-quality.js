const analyticsTaxonomy = require('../shared/analytics-taxonomy.js');
const analyticsPipeline = require('../shared/analytics-pipeline.js');
const analyticsQuality = require('../shared/analytics-quality.js');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildFixtureEvents() {
  const sessionStart = analyticsTaxonomy.buildExampleEvent('session_start');
  const sourceResolved = analyticsTaxonomy.buildExampleEvent('source_attribution_resolved');
  const internalLeak = analyticsTaxonomy.buildExampleEvent('cta_click');
  const invalidPageView = analyticsTaxonomy.buildExampleEvent('page_view');

  sessionStart.event_id = 'evt_quality_fixture_1';
  sourceResolved.event_id = 'evt_quality_fixture_2';
  internalLeak.event_id = 'evt_quality_fixture_3';
  invalidPageView.event_id = 'evt_quality_fixture_4';

  [sessionStart, sourceResolved, internalLeak, invalidPageView].forEach((payload) => {
    payload.session_id = 'ses_quality_fixture';
    payload.visitor_id = 'vst_quality_fixture';
    payload.entry_source = 'qr';
    payload.entry_source_detail = 'fixture_qr';
    payload.source_medium = 'vanity';
    payload.source_campaign = 'restaurant';
    payload.source_content = 'fixture';
    payload.page_path = '/menu/';
    payload.route_name = 'menu';
    payload.page_type = 'menu_index';
    payload.site_section = 'menu';
    payload.environment = 'prod';
    payload.traffic_class = 'public';
    payload.is_internal = false;
    payload.visit_context = 'in_restaurant_probable';
    payload.visit_context_confidence = 0.9;
    payload.occurred_at = '2026-04-15T12:00:00.000Z';
  });

  sourceResolved.occurred_at = '2026-04-15T12:00:01.000Z';
  internalLeak.occurred_at = '2026-04-15T12:00:02.000Z';
  internalLeak.is_internal = true;
  internalLeak.traffic_class = 'public';
  invalidPageView.occurred_at = '2026-04-15T12:00:03.000Z';
  delete invalidPageView.session_id;

  return [sessionStart, sourceResolved, internalLeak, invalidPageView];
}

function main() {
  const pipelineResult = analyticsPipeline.buildAnalyticsPipeline(buildFixtureEvents(), {
    sourceLabel: 'quality-fixture',
    processedAt: '2026-04-15T12:05:00.000Z',
  });
  const snapshot = analyticsQuality.buildQualitySnapshot(pipelineResult, {
    generatedAt: '2026-04-15T12:05:00.000Z',
  });
  const alertCodes = snapshot.alerts.map((alert) => alert.code).sort();
  const markdown = analyticsQuality.renderHealthReport(snapshot, { periodLabel: 'Fixture week' });

  assert(snapshot.status === 'alert', 'Expected alert status for degraded quality snapshot');
  assert(alertCodes.includes('quarantine_nonzero'), 'Expected quarantine alert');
  assert(alertCodes.includes('core_event_missing'), 'Expected missing core event alert');
  assert(alertCodes.includes('internal_audit_failed'), 'Expected internal audit failure alert');
  assert(markdown.includes('# Analytics Dataset Health'), 'Expected markdown report heading');
  assert(markdown.includes('Incident Playbook'), 'Expected markdown playbook section');

  console.log('Analytics quality system valid.');
  console.log(`Status: ${snapshot.status}`);
  console.log(`Alerts: ${snapshot.alerts.length}`);
}

try {
  main();
} catch (error) {
  console.error(error && error.message ? error.message : error);
  process.exit(1);
}
