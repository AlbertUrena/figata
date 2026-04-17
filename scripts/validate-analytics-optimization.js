const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const analyticsOptimization = require('../shared/analytics-optimization.js');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function buildFixtureEvents() {
  return [
    {
      event_name: 'session_start',
      occurred_at: '2026-04-16T12:00:00.000Z',
      sent_at: '2026-04-16T12:00:00.100Z',
      environment: 'prod',
      site_host: 'figata.do',
      route_name: 'home',
      page_type: 'home',
      page_path: '/',
      visitor_id: 'vst_opt_1',
      session_id: 'ses_opt_1',
      entry_source: 'qr',
      visit_context: 'in_restaurant_probable',
      traffic_class: 'public',
      is_internal: false,
      transport_name: 'beacon',
    },
    {
      event_name: 'route_ready',
      occurred_at: '2026-04-16T12:00:02.000Z',
      sent_at: '2026-04-16T12:00:02.010Z',
      environment: 'prod',
      site_host: 'figata.do',
      route_name: 'home',
      page_type: 'home',
      page_path: '/',
      visitor_id: 'vst_opt_1',
      session_id: 'ses_opt_1',
      entry_source: 'qr',
      visit_context: 'in_restaurant_probable',
      traffic_class: 'public',
      is_internal: false,
      navigation_type: 'navigate',
      route_ready_ms: 1800,
      transport_name: 'beacon',
    },
    {
      event_name: 'page_view',
      occurred_at: '2026-04-16T12:00:03.000Z',
      sent_at: '2026-04-16T12:00:03.010Z',
      environment: 'prod',
      site_host: 'figata.do',
      route_name: 'menu',
      page_type: 'menu_index',
      page_path: '/menu',
      visitor_id: 'vst_opt_1',
      session_id: 'ses_opt_1',
      entry_source: 'qr',
      visit_context: 'in_restaurant_probable',
      traffic_class: 'public',
      is_internal: false,
      transport_name: 'beacon',
    },
    {
      event_name: 'item_detail_open',
      occurred_at: '2026-04-16T12:00:10.000Z',
      sent_at: '2026-04-16T12:00:10.010Z',
      environment: 'prod',
      site_host: 'figata.do',
      route_name: 'menu_detail',
      page_type: 'menu_detail',
      page_path: '/menu/margherita',
      visitor_id: 'vst_opt_1',
      session_id: 'ses_opt_1',
      entry_source: 'qr',
      visit_context: 'in_restaurant_probable',
      traffic_class: 'public',
      is_internal: false,
      item_id: 'margherita',
      item_name: 'Margherita',
      category: 'pizzas',
      list_id: 'menu_grid',
      list_name: 'Menu',
      list_position: 1,
      transport_name: 'beacon',
    },
    {
      event_name: 'add_to_cart',
      occurred_at: '2026-04-16T12:00:18.000Z',
      sent_at: '2026-04-16T12:00:18.010Z',
      environment: 'prod',
      site_host: 'figata.do',
      route_name: 'menu_detail',
      page_type: 'menu_detail',
      page_path: '/menu/margherita',
      visitor_id: 'vst_opt_1',
      session_id: 'ses_opt_1',
      entry_source: 'qr',
      visit_context: 'in_restaurant_probable',
      traffic_class: 'public',
      is_internal: false,
      cart_id: 'cart_opt_1',
      currency: 'DOP',
      value: 790,
      items: [
        { item_id: 'margherita', item_name: 'Margherita', quantity: 1, price: 790 },
        { item_id: 'tiramisu', item_name: 'Tiramisu', quantity: 1, price: 290 },
      ],
      transport_name: 'beacon',
    },
    {
      event_name: 'purchase',
      occurred_at: '2026-04-16T12:01:00.000Z',
      sent_at: '2026-04-16T12:01:00.010Z',
      environment: 'prod',
      site_host: 'figata.do',
      route_name: 'menu_detail',
      page_type: 'menu_detail',
      page_path: '/menu/margherita',
      visitor_id: 'vst_opt_1',
      session_id: 'ses_opt_1',
      entry_source: 'qr',
      visit_context: 'in_restaurant_probable',
      traffic_class: 'public',
      is_internal: false,
      order_id: 'ord_opt_1',
      cart_id: 'cart_opt_1',
      currency: 'DOP',
      value: 1080,
      items: [
        { item_id: 'margherita', item_name: 'Margherita', quantity: 1, price: 790 },
        { item_id: 'tiramisu', item_name: 'Tiramisu', quantity: 1, price: 290 },
      ],
      transport_name: 'beacon',
    },
  ];
}

function validateStaticDefinitions() {
  assert(Array.isArray(analyticsOptimization.EXPERIMENT_BACKLOG) && analyticsOptimization.EXPERIMENT_BACKLOG.length >= 3, 'Expected prioritized experiment backlog');
  analyticsOptimization.EXPERIMENT_BACKLOG.forEach(function (experiment) {
    assert(experiment.hypothesis, 'Each experiment must declare an explicit hypothesis');
    assert(experiment.primary_metric, 'Each experiment must declare a primary KPI');
    assert(Array.isArray(experiment.guardrails) && experiment.guardrails.length >= 1, 'Each experiment must declare at least one guardrail');
  });
}

function validateTemplate() {
  const template = analyticsOptimization.buildExperimentTemplate();
  assert(Array.isArray(template.required_fields) && template.required_fields.includes('hypothesis'), 'Experiment template should require an explicit hypothesis');
  assert(Array.isArray(template.decision_options) && template.decision_options.includes('rollout'), 'Experiment template should expose the decision options');
}

function validateRecommendationSnapshot() {
  const snapshot = analyticsOptimization.buildRecommendationSnapshot({
    rawEvents: buildFixtureEvents(),
    kpiSnapshot: {
      rollups: {
        items: {
          by_purchase_units: [
            { item_id: 'margherita', item_name: 'Margherita', category: 'pizzas', purchase_units: 4 },
            { item_id: 'tiramisu', item_name: 'Tiramisu', category: 'postres', purchase_units: 2 },
          ],
        },
      },
    },
    cohortSnapshot: {
      curiosity_items: [
        { item_id: 'diavola', item_name: 'Diavola', category: 'pizzas', curiosity_score: 8, detail_to_purchase_gap: 5 },
      ],
    },
  });

  assert(snapshot.lists.length === 3, 'Expected three recommendation lists');
  assert(snapshot.lists.some(function (list) { return list.recommendation_id === 'combo_sugerido' && list.items.length >= 1; }), 'Expected combo suggestions from purchase co-occurrence');
}

function validateSnapshotBundle() {
  const snapshot = analyticsOptimization.buildOptimizationSnapshot({
    generatedAt: '2026-04-16T12:10:00.000Z',
    scopeMode: 'business_only',
    rawEvents: buildFixtureEvents(),
    kpiSnapshot: {
      metrics: {
        global: {
          sessions_total: { value: 150 },
          cta_engagement_rate: { value: 0.18 },
          purchase_session_rate: { value: 0.06 },
          average_route_ready_ms: { value: 1800 },
          detail_open_session_rate: { value: 0.25 },
          detail_to_cart_session_rate: { value: 0.1 },
        },
        bySegment: {
          route_name: {
            values: {
              home: {
                sessions_total: { value: 150 },
                cta_engagement_rate: { value: 0.18 },
                purchase_session_rate: { value: 0.06 },
                average_route_ready_ms: { value: 1800 },
              },
              menu: {
                sessions_total: { value: 150 },
                detail_open_session_rate: { value: 0.25 },
                purchase_session_rate: { value: 0.06 },
                average_route_ready_ms: { value: 1800 },
              },
              menu_detail: {
                sessions_total: { value: 140 },
                detail_to_cart_session_rate: { value: 0.1 },
                purchase_session_rate: { value: 0.06 },
                average_route_ready_ms: { value: 1800 },
              },
            },
          },
        },
      },
      rollups: {
        items: {
          by_purchase_units: [
            { item_id: 'margherita', item_name: 'Margherita', category: 'pizzas', purchase_units: 4 },
          ],
        },
      },
    },
    cohortSnapshot: {
      curiosity_items: [
        { item_id: 'diavola', item_name: 'Diavola', category: 'pizzas', curiosity_score: 8, detail_to_purchase_gap: 5 },
      ],
    },
    qualitySnapshot: {
      current: { status: 'ok' },
    },
  });

  assert(Array.isArray(snapshot.backlog) && snapshot.backlog.every(function (entry) {
    return analyticsOptimization.DECISION_VALUES.includes(entry.recommended_decision);
  }), 'Each experiment backlog entry should carry a recommended decision');
  assert(Array.isArray(snapshot.decision_log) && snapshot.decision_log.length >= 4, 'Decision log should document experiments and recommendation outcomes');
  assert(analyticsOptimization.renderOptimizationMarkdown(snapshot).includes('No ejecutar cambios sin hipotesis explicita'), 'Markdown output should persist the operating rule');
}

function validateCliArtifacts() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'figata-optimization-'));
  const inputPath = path.join(tempRoot, 'raw.ndjson');
  const latestRoot = path.join(tempRoot, 'latest');
  const historyRoot = path.join(tempRoot, 'history');
  fs.writeFileSync(inputPath, buildFixtureEvents().map(function (entry) {
    return JSON.stringify(entry);
  }).join('\n') + '\n', 'utf8');

  execFileSync(process.execPath, [
    path.join('scripts', 'run-analytics-optimization.js'),
    `--input=${inputPath}`,
    '--from=2026-04-16',
    '--to=2026-04-16',
    `--output=${latestRoot}`,
    `--history=${historyRoot}`,
  ], {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'pipe',
  });

  assert(fs.existsSync(path.join(latestRoot, 'backlog.json')), 'CLI should write latest backlog artifact');
  assert(fs.existsSync(path.join(latestRoot, 'decision-log.json')), 'CLI should write latest decision log artifact');
  assert(fs.existsSync(path.join(latestRoot, 'review.md')), 'CLI should write latest markdown review artifact');
}

function main() {
  validateStaticDefinitions();
  validateTemplate();
  validateRecommendationSnapshot();
  validateSnapshotBundle();
  validateCliArtifacts();
  console.log('Analytics optimization artifacts valid.');
}

try {
  main();
} catch (error) {
  console.error(error && error.message ? error.message : error);
  process.exit(1);
}
