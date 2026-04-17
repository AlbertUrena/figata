const analyticsTaxonomy = require('../shared/analytics-taxonomy.js');
const analyticsPipeline = require('../shared/analytics-pipeline.js');

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
  const pageView = analyticsTaxonomy.buildExampleEvent('page_view');
  const routeReady = analyticsTaxonomy.buildExampleEvent('route_ready');
  const performanceSummary = analyticsTaxonomy.buildExampleEvent('performance_summary');
  const addToCart = analyticsTaxonomy.buildExampleEvent('add_to_cart');
  const purchase = analyticsTaxonomy.buildExampleEvent('purchase');
  const contextConfirmed = analyticsTaxonomy.buildExampleEvent('visit_context_confirmed');
  const wifiShown = analyticsTaxonomy.buildExampleEvent('wifi_assist_shown');

  const sessionId = 'ses_pipeline_fixture';
  const visitorId = 'vst_pipeline_fixture';
  const occurredAtBase = '2026-04-15T12:00:00.000Z';
  const occurredAtLater = '2026-04-15T12:01:00.000Z';
  const occurredAtLatest = '2026-04-15T12:02:00.000Z';
  let eventCounter = 0;

  [sessionStart, pageView, routeReady, performanceSummary, addToCart, purchase, contextConfirmed, wifiShown].forEach((payload) => {
    eventCounter += 1;
    payload.event_id = `evt_pipeline_fixture_${eventCounter}`;
    payload.session_id = sessionId;
    payload.visitor_id = visitorId;
    payload.entry_source = 'qr';
    payload.entry_source_detail = 'fixture_qr';
    payload.source_medium = 'vanity';
    payload.source_campaign = 'restaurant';
    payload.source_content = 'fixture';
    payload.page_path = '/menu/';
    payload.route_name = 'menu';
    payload.page_type = 'menu_index';
    payload.site_section = 'menu';
    payload.environment = 'dev';
    payload.traffic_class = 'development';
    payload.is_internal = false;
    payload.visit_context = 'in_restaurant_probable';
    payload.visit_context_confidence = 0.9;
  });

  sessionStart.occurred_at = occurredAtBase;
  pageView.occurred_at = occurredAtBase;
  routeReady.occurred_at = occurredAtBase;
  performanceSummary.occurred_at = occurredAtLater;
  wifiShown.occurred_at = occurredAtLater;
  addToCart.occurred_at = occurredAtLater;
  contextConfirmed.occurred_at = occurredAtLatest;
  contextConfirmed.visit_context_before = 'in_restaurant_probable';
  contextConfirmed.visit_context = 'in_restaurant_confirmed_wifi';
  contextConfirmed.visit_context_confidence = 1;
  purchase.occurred_at = occurredAtLatest;
  purchase.visit_context = 'in_restaurant_confirmed_wifi';
  purchase.visit_context_confidence = 1;

  const duplicateIdempotency = clone(addToCart);
  duplicateIdempotency.event_id = 'evt_duplicate_new_id';
  duplicateIdempotency.occurred_at = '2026-04-15T12:01:30.000Z';

  const duplicateEventId = clone(pageView);
  duplicateEventId.occurred_at = '2026-04-15T12:03:00.000Z';

  const invalidEvent = clone(pageView);
  delete invalidEvent.session_id;

  return [
    sessionStart,
    pageView,
    routeReady,
    performanceSummary,
    wifiShown,
    addToCart,
    duplicateIdempotency,
    contextConfirmed,
    purchase,
    duplicateEventId,
    invalidEvent,
  ];
}

function main() {
  const fixtureEvents = buildFixtureEvents();
  const pipelineResult = analyticsPipeline.buildAnalyticsPipeline(fixtureEvents, {
    sourceLabel: 'fixture',
    processedAt: '2026-04-15T12:05:00.000Z',
  });

  assert(pipelineResult.manifest.raw_event_count === 10, 'Expected 10 accepted raw events');
  assert(pipelineResult.manifest.curated_event_count === 8, 'Expected 8 curated events after dedupe');
  assert(pipelineResult.manifest.sessions_fact_count === 1, 'Expected exactly one sessions_fact row');
  assert(pipelineResult.manifest.visitors_fact_count === 1, 'Expected exactly one visitors_fact row');
  assert(pipelineResult.manifest.quarantine_count === 1, 'Expected one quarantined invalid event');
  assert(pipelineResult.manifest.duplicate_event_id_count === 1, 'Expected one duplicate event_id');
  assert(pipelineResult.manifest.duplicate_idempotency_key_count === 1, 'Expected one duplicate idempotency key');

  const session = pipelineResult.curated.sessions_fact[0];
  assert(session.entry_source === 'qr', 'Session should preserve QR attribution');
  assert(session.visit_context_initial === 'in_restaurant_probable', 'Session should keep initial visit context');
  assert(session.visit_context_final === 'in_restaurant_confirmed_wifi', 'Session should promote final visit context');
  assert(session.visit_context_history.join('|') === 'in_restaurant_probable|in_restaurant_confirmed_wifi', 'Session should retain context transition history');
  assert(session.add_to_cart_count === 1, 'Session add_to_cart count should dedupe duplicate idempotency');
  assert(session.purchase_count === 1, 'Session purchase count should be aggregated');
  assert(session.has_confirmed_wifi === true, 'Session should flag confirmed Wi-Fi context');
  assert(session.wifi_assist_shown_count === 1, 'Session should include Wi-Fi prompt exposure');
  assert(session.visit_context_confirmed_count === 1, 'Session should include context confirmation count');

  const visitor = pipelineResult.curated.visitors_fact[0];
  assert(visitor.session_count === 1, 'Visitor should aggregate one session');
  assert(visitor.has_in_restaurant_visit === true, 'Visitor should reflect in-restaurant activity');
  assert(visitor.has_confirmed_wifi_session === true, 'Visitor should reflect confirmed Wi-Fi session');
  assert(visitor.total_purchase_count === 1, 'Visitor should aggregate purchase count');

  const outputFiles = analyticsPipeline.buildOutputFiles(pipelineResult);
  assert(outputFiles.some((file) => /curated[\\/]events_fact/.test(file.relativePath)), 'Output should include events_fact partitions');
  assert(outputFiles.some((file) => /curated[\\/]sessions_fact/.test(file.relativePath)), 'Output should include sessions_fact partitions');
  assert(outputFiles.some((file) => /curated[\\/]visitors_fact/.test(file.relativePath)), 'Output should include visitors_fact partitions');

  console.log('Analytics pipeline valid.');
  console.log(`Curated events_fact: ${pipelineResult.manifest.curated_event_count}`);
  console.log(`Curated sessions_fact: ${pipelineResult.manifest.sessions_fact_count}`);
  console.log(`Curated visitors_fact: ${pipelineResult.manifest.visitors_fact_count}`);
}

try {
  main();
} catch (error) {
  console.error(error && error.message ? error.message : error);
  process.exit(1);
}
