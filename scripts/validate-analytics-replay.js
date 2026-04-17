const analyticsConfig = require('../shared/analytics-config.js');
const analyticsReplay = require('../shared/analytics-replay.js');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function findSessionId(provider, thresholdPredicate) {
  for (let index = 1; index <= 20000; index += 1) {
    const sessionId = `ses_replay_${index}`;
    const fraction = analyticsReplay.stableFraction([provider, sessionId].join('|'));
    if (thresholdPredicate(fraction)) {
      return { sessionId, fraction };
    }
  }

  throw new Error('Unable to find deterministic replay sample fixture');
}

function baseContext(sessionId) {
  return {
    environment: 'prod',
    routeName: 'menu',
    pageType: 'menu_index',
    pagePath: '/menu',
    entrySource: 'qr',
    visitContext: 'in_restaurant_probable',
    trafficClass: 'public',
    isInternal: false,
    visitorId: 'vst_replay_fixture',
    sessionId,
    visitorType: 'returning',
    network_effective_type: '4g',
  };
}

function validateDefaults() {
  const defaults = analyticsReplay.getDefaultConfig();

  assert(defaults.provider === 'clarity', 'Replay default provider should be Clarity');
  assert(defaults.projectId === 'wcnft9aj9p', 'Replay should expose the configured Clarity project id');
  assert(defaults.providerCaptureMode === 'coupled_conservative', 'Replay should default to coupled conservative capture');
  assert(defaults.reviewCadenceDays === 14, 'Replay review cadence should be 14 days');
  assert(defaults.enabledEnvironments.includes('prod'), 'Replay should be enabled for prod by default');
  assert(defaults.routeAllowlist.includes('home'), 'Replay should allow the homepage by default');
  assert(defaults.routeAllowlist.includes('menu_detail'), 'Replay should allow menu detail by default');
  assert(defaults.routeAllowlist.includes('reservas'), 'Replay should be future-ready for reservas');
  assert(analyticsConfig.UX_EVIDENCE.projectId === 'wcnft9aj9p', 'Architecture config should centralize the Clarity project id');
  assert(analyticsConfig.UX_EVIDENCE.reviewCadenceDays === 14, 'Architecture config should expose replay review cadence');
}

function validatePlanResolution() {
  const config = analyticsReplay.normalizeConfig({
    projectId: 'project_demo',
    provider: 'clarity',
  });
  const eligibleFixture = findSessionId(config.provider, (fraction) => fraction < config.replaySampleRate);
  const ineligibleFixture = findSessionId(config.provider, (fraction) => fraction > config.heatmapSampleRate + 0.05);

  const eligiblePlan = analyticsReplay.resolvePlan(baseContext(eligibleFixture.sessionId), config);
  assert(eligiblePlan.status === 'eligible', 'Expected a sampled replay plan to be eligible');
  assert(eligiblePlan.replaySampled === true, 'Replay-eligible fixture should be replay sampled');
  assert(eligiblePlan.heatmapSampled === true, 'Replay-eligible fixture should remain inside heatmap sampling');
  assert(eligiblePlan.effectiveSampleKey === 'replay', 'Coupled capture should load only replay-sampled sessions');
  assert(eligiblePlan.effectiveSampleRate === config.replaySampleRate, 'Effective sample rate should use replay rate');

  const ineligiblePlan = analyticsReplay.resolvePlan(baseContext(ineligibleFixture.sessionId), config);
  assert(ineligiblePlan.status === 'not_sampled', 'Expected a non-sampled session to be skipped');
  assert(ineligiblePlan.shouldLoadProvider === false, 'Non-sampled sessions should not load the provider');

  const internalPlan = analyticsReplay.resolvePlan(
    Object.assign({}, baseContext(eligibleFixture.sessionId), { isInternal: true, trafficClass: 'internal' }),
    config
  );
  assert(internalPlan.status === 'internal_blocked', 'Internal traffic must be blocked from replay capture');

  const adminRoutePlan = analyticsReplay.resolvePlan(
    Object.assign({}, baseContext(eligibleFixture.sessionId), { routeName: 'admin', pageType: 'admin', pagePath: '/admin/app/' }),
    config
  );
  assert(adminRoutePlan.status === 'route_blocked', 'Admin routes must stay outside replay capture');

  const missingProjectPlan = analyticsReplay.resolvePlan(
    baseContext(eligibleFixture.sessionId),
    analyticsReplay.normalizeConfig({ provider: 'clarity', projectId: '' })
  );
  assert(missingProjectPlan.status === 'missing_project_id', 'Replay should fail closed when no project id is configured');
}

function validateChecklist() {
  const checklist = analyticsReplay.buildReviewChecklist();
  assert(Array.isArray(checklist) && checklist.length >= 5, 'Replay review checklist should expose the UX review protocol');
  assert(checklist.some((entry) => entry.toLowerCase().indexOf('quincenal') !== -1), 'Replay checklist should mention the biweekly review cadence');
}

function main() {
  validateDefaults();
  validatePlanResolution();
  validateChecklist();
  console.log('Analytics replay artifacts valid.');
}

try {
  main();
} catch (error) {
  console.error(error && error.message ? error.message : error);
  process.exit(1);
}
