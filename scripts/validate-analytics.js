const analyticsConfig = require('../shared/analytics-config.js');
const analyticsGovernance = require('../shared/analytics-governance.js');
const analyticsTaxonomy = require('../shared/analytics-taxonomy.js');
const analyticsContract = require('../shared/analytics-contract.js');
const analyticsReplay = require('../shared/analytics-replay.js');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function validateRouteCatalog() {
  const routeIds = new Set();
  analyticsConfig.ROUTE_CATALOG.forEach((route) => {
    assert(route.id, 'Route is missing id');
    assert(!routeIds.has(route.id), `Duplicate route id: ${route.id}`);
    routeIds.add(route.id);
    assert(route.routeName, `Route ${route.id} missing routeName`);
    assert(route.pageType, `Route ${route.id} missing pageType`);
    assert(route.siteSection, `Route ${route.id} missing siteSection`);
  });
}

function validateTaxonomy() {
  analyticsTaxonomy.listEvents().forEach((eventName) => {
    const definition = analyticsTaxonomy.getEventDefinition(eventName);
    assert(definition, `Missing definition for ${eventName}`);
    assert(definition.required.includes('event_name'), `${eventName} missing event_name in required set`);
    assert(definition.idempotency.length > 0, `${eventName} missing idempotency fields`);

    definition.required.concat(definition.optional).forEach((property) => {
      assert(
        analyticsTaxonomy.PROPERTY_REGISTRY[property],
        `${eventName} references unknown property ${property}`
      );
    });

    definition.idempotency.forEach((property) => {
      assert(
        definition.required.includes(property) || definition.optional.includes(property),
        `${eventName} idempotency field ${property} is not declared in payload contract`
      );
    });
  });
}

function validateExamples() {
  analyticsTaxonomy.listEvents().forEach((eventName) => {
    const example = analyticsTaxonomy.buildExampleEvent(eventName);
    assert(example, `Missing example for ${eventName}`);
    const result = analyticsContract.validateEvent(example);
    assert(result.ok, `${eventName} example failed validation: ${result.errors.join('; ')}`);
    assert(result.idempotencyKey, `${eventName} example did not produce idempotency key`);
  });
}

function validateGovernance() {
  const badPayload = {
    event_name: 'page_view',
    event_id: 'evt_bad',
    event_version: 'v1',
    schema_version: analyticsTaxonomy.VERSION,
    occurred_at: '2026-04-15T12:00:00.000Z',
    environment: 'prod',
    page_path: '/',
    page_type: 'home',
    route_name: 'home',
    site_section: 'marketing',
    visitor_id: 'vst_1',
    session_id: 'ses_1',
    entry_source: 'direct',
    visit_context: 'remote',
    visit_context_confidence: 1,
    is_internal: false,
    traffic_class: 'public',
    page_title: 'Figata',
    navigation_type: 'hard',
    email: 'test@example.com',
  };

  const violations = analyticsGovernance.detectViolations(badPayload);
  assert(violations.length > 0, 'Governance should detect prohibited fields');
}

function validateReplay() {
  const plan = analyticsReplay.resolvePlan({
    environment: 'prod',
    routeName: 'home',
    pageType: 'home',
    pagePath: '/',
    entrySource: 'direct',
    visitContext: 'remote',
    trafficClass: 'public',
    isInternal: false,
    visitorId: 'vst_validate_replay',
    sessionId: 'ses_validate_replay_1',
    visitorType: 'new',
  }, {
    provider: 'clarity',
    projectId: 'project_validate_replay',
  });

  assert(plan.projectIdPresent === true, 'Replay plan should expose configured project state');
  assert(plan.environmentAllowed === true, 'Replay should allow prod environments');
  assert(plan.routeAllowed === true, 'Replay should allow core public routes');
}

function main() {
  validateRouteCatalog();
  validateTaxonomy();
  validateExamples();
  validateGovernance();
  validateReplay();

  console.log('Analytics artifacts valid.');
  console.log(`Routes: ${analyticsConfig.ROUTE_CATALOG.length}`);
  console.log(`Events: ${analyticsTaxonomy.listEvents().length}`);
  console.log(`Properties: ${Object.keys(analyticsTaxonomy.PROPERTY_REGISTRY).length}`);
}

try {
  main();
} catch (error) {
  console.error(error && error.message ? error.message : error);
  process.exit(1);
}
