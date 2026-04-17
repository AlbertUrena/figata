const analyticsTaxonomy = require('../shared/analytics-taxonomy.js');
const analyticsPipeline = require('../shared/analytics-pipeline.js');
const analyticsKpiCatalog = require('../shared/analytics-kpi-catalog.js');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function buildEvent(eventName, overrides) {
  const payload = analyticsTaxonomy.buildExampleEvent(eventName);
  return Object.assign(payload, overrides || {});
}

function buildFixtureEvents() {
  const events = [];

  events.push(buildEvent('page_view', {
    event_id: 'evt_kpi_1',
    occurred_at: '2026-04-15T12:00:00.000Z',
    session_id: 'ses_kpi_a_1',
    visitor_id: 'vst_kpi_a',
    session_sequence: 1,
    entry_source: 'qr',
    entry_source_detail: 'table-qr',
    source_medium: 'qr',
    source_campaign: 'restaurant',
    source_content: 'main-table',
    page_path: '/menu/',
    route_name: 'menu',
    page_type: 'menu_index',
    site_section: 'menu',
    environment: 'prod',
    traffic_class: 'public',
    is_internal: false,
    visit_context: 'in_restaurant_probable',
    visit_context_confidence: 0.9,
  }));
  events.push(buildEvent('item_impression', {
    event_id: 'evt_kpi_2',
    occurred_at: '2026-04-15T12:00:01.000Z',
    session_id: 'ses_kpi_a_1',
    visitor_id: 'vst_kpi_a',
    session_sequence: 1,
    entry_source: 'qr',
    entry_source_detail: 'table-qr',
    source_medium: 'qr',
    source_campaign: 'restaurant',
    source_content: 'main-table',
    page_path: '/menu/',
    route_name: 'menu',
    page_type: 'menu_index',
    site_section: 'menu',
    environment: 'prod',
    traffic_class: 'public',
    is_internal: false,
    visit_context: 'in_restaurant_probable',
    visit_context_confidence: 0.9,
    item_id: 'pizza-margherita',
    item_name: 'Pizza Margherita',
    category: 'pizzas',
    list_id: 'menu-grid',
    list_name: 'Menu Grid',
    list_position: 1,
  }));
  events.push(buildEvent('item_detail_open', {
    event_id: 'evt_kpi_3',
    occurred_at: '2026-04-15T12:00:02.000Z',
    session_id: 'ses_kpi_a_1',
    visitor_id: 'vst_kpi_a',
    session_sequence: 1,
    entry_source: 'qr',
    entry_source_detail: 'table-qr',
    source_medium: 'qr',
    source_campaign: 'restaurant',
    source_content: 'main-table',
    page_path: '/menu/',
    route_name: 'menu',
    page_type: 'menu_index',
    site_section: 'menu',
    environment: 'prod',
    traffic_class: 'public',
    is_internal: false,
    visit_context: 'in_restaurant_probable',
    visit_context_confidence: 0.9,
    item_id: 'pizza-margherita',
    item_name: 'Pizza Margherita',
    category: 'pizzas',
    detail_origin: 'menu_grid',
  }));
  events.push(buildEvent('item_detail_open', {
    event_id: 'evt_kpi_4',
    occurred_at: '2026-04-15T12:00:03.000Z',
    session_id: 'ses_kpi_a_1',
    visitor_id: 'vst_kpi_a',
    session_sequence: 1,
    entry_source: 'qr',
    entry_source_detail: 'table-qr',
    source_medium: 'qr',
    source_campaign: 'restaurant',
    source_content: 'main-table',
    page_path: '/menu/',
    route_name: 'menu',
    page_type: 'menu_index',
    site_section: 'menu',
    environment: 'prod',
    traffic_class: 'public',
    is_internal: false,
    visit_context: 'in_restaurant_probable',
    visit_context_confidence: 0.9,
    item_id: 'pizza-bufalina',
    item_name: 'Pizza Bufalina',
    category: 'pizzas',
    detail_origin: 'menu_grid',
  }));
  events.push(buildEvent('add_to_cart', {
    event_id: 'evt_kpi_5',
    occurred_at: '2026-04-15T12:00:04.000Z',
    session_id: 'ses_kpi_a_1',
    visitor_id: 'vst_kpi_a',
    session_sequence: 1,
    entry_source: 'qr',
    entry_source_detail: 'table-qr',
    source_medium: 'qr',
    source_campaign: 'restaurant',
    source_content: 'main-table',
    page_path: '/menu/',
    route_name: 'menu',
    page_type: 'menu_index',
    site_section: 'menu',
    environment: 'prod',
    traffic_class: 'public',
    is_internal: false,
    visit_context: 'in_restaurant_probable',
    visit_context_confidence: 0.9,
    item_id: 'pizza-bufalina',
    item_name: 'Pizza Bufalina',
    category: 'pizzas',
    price: 790,
    quantity: 1,
    currency: 'DOP',
    cart_id: 'cart_kpi_1',
    detail_origin: 'menu_grid',
  }));
  events.push(buildEvent('begin_checkout', {
    event_id: 'evt_kpi_6',
    occurred_at: '2026-04-15T12:00:05.000Z',
    session_id: 'ses_kpi_a_1',
    visitor_id: 'vst_kpi_a',
    session_sequence: 1,
    entry_source: 'qr',
    entry_source_detail: 'table-qr',
    source_medium: 'qr',
    source_campaign: 'restaurant',
    source_content: 'main-table',
    page_path: '/menu/',
    route_name: 'menu',
    page_type: 'menu_index',
    site_section: 'menu',
    environment: 'prod',
    traffic_class: 'public',
    is_internal: false,
    visit_context: 'in_restaurant_probable',
    visit_context_confidence: 0.9,
    cart_id: 'cart_kpi_1',
    currency: 'DOP',
    value: 790,
    items: [{ item_id: 'pizza-bufalina', quantity: 1, price: 790 }],
  }));
  events.push(buildEvent('purchase', {
    event_id: 'evt_kpi_7',
    occurred_at: '2026-04-15T12:00:06.000Z',
    session_id: 'ses_kpi_a_1',
    visitor_id: 'vst_kpi_a',
    session_sequence: 1,
    entry_source: 'qr',
    entry_source_detail: 'table-qr',
    source_medium: 'qr',
    source_campaign: 'restaurant',
    source_content: 'main-table',
    page_path: '/menu/',
    route_name: 'menu',
    page_type: 'menu_index',
    site_section: 'menu',
    environment: 'prod',
    traffic_class: 'public',
    is_internal: false,
    visit_context: 'in_restaurant_probable',
    visit_context_confidence: 0.9,
    order_id: 'ord_kpi_1',
    cart_id: 'cart_kpi_1',
    currency: 'DOP',
    value: 790,
    items: [{ item_id: 'pizza-bufalina', quantity: 1, price: 790 }],
  }));
  events.push(buildEvent('visit_context_confirmed', {
    event_id: 'evt_kpi_8',
    occurred_at: '2026-04-15T12:00:07.000Z',
    session_id: 'ses_kpi_a_1',
    visitor_id: 'vst_kpi_a',
    session_sequence: 1,
    entry_source: 'qr',
    entry_source_detail: 'table-qr',
    source_medium: 'qr',
    source_campaign: 'restaurant',
    source_content: 'main-table',
    page_path: '/menu/',
    route_name: 'menu',
    page_type: 'menu_index',
    site_section: 'menu',
    environment: 'prod',
    traffic_class: 'public',
    is_internal: false,
    visit_context_before: 'in_restaurant_probable',
    visit_context: 'in_restaurant_confirmed_wifi',
    visit_context_confidence: 1,
  }));
  events.push(buildEvent('performance_summary', {
    event_id: 'evt_kpi_9',
    occurred_at: '2026-04-15T12:00:08.000Z',
    session_id: 'ses_kpi_a_1',
    visitor_id: 'vst_kpi_a',
    session_sequence: 1,
    entry_source: 'qr',
    entry_source_detail: 'table-qr',
    source_medium: 'qr',
    source_campaign: 'restaurant',
    source_content: 'main-table',
    page_path: '/menu/',
    route_name: 'menu',
    page_type: 'menu_index',
    site_section: 'menu',
    environment: 'prod',
    traffic_class: 'public',
    is_internal: false,
    visit_context: 'in_restaurant_confirmed_wifi',
    visit_context_confidence: 1,
    fcp_ms: 700,
    dom_interactive_ms: 1000,
    route_ready_ms: 1500,
    navigation_type: 'hard',
    network_effective_type: '4g',
    network_downlink_mbps: 15,
    network_rtt_ms: 70,
  }));

  events.push(buildEvent('page_view', {
    event_id: 'evt_kpi_10',
    occurred_at: '2026-04-16T12:00:00.000Z',
    session_id: 'ses_kpi_a_2',
    visitor_id: 'vst_kpi_a',
    session_sequence: 2,
    entry_source: 'direct',
    entry_source_detail: 'shared_link',
    source_medium: 'none',
    source_campaign: 'none',
    source_content: 'none',
    page_path: '/',
    route_name: 'home',
    page_type: 'home',
    site_section: 'marketing',
    environment: 'prod',
    traffic_class: 'public',
    is_internal: false,
    visit_context: 'remote',
    visit_context_confidence: 0.55,
  }));
  events.push(buildEvent('cta_click', {
    event_id: 'evt_kpi_11',
    occurred_at: '2026-04-16T12:00:01.000Z',
    session_id: 'ses_kpi_a_2',
    visitor_id: 'vst_kpi_a',
    session_sequence: 2,
    entry_source: 'direct',
    entry_source_detail: 'shared_link',
    source_medium: 'none',
    source_campaign: 'none',
    source_content: 'none',
    page_path: '/',
    route_name: 'home',
    page_type: 'home',
    site_section: 'marketing',
    environment: 'prod',
    traffic_class: 'public',
    is_internal: false,
    visit_context: 'remote',
    visit_context_confidence: 0.55,
    cta_id: 'home-reserva',
    cta_label: 'Reserva',
    cta_target: '/reservas/',
    cta_category: 'reservation',
  }));
  events.push(buildEvent('performance_summary', {
    event_id: 'evt_kpi_12',
    occurred_at: '2026-04-16T12:00:03.000Z',
    session_id: 'ses_kpi_a_2',
    visitor_id: 'vst_kpi_a',
    session_sequence: 2,
    entry_source: 'direct',
    entry_source_detail: 'shared_link',
    source_medium: 'none',
    source_campaign: 'none',
    source_content: 'none',
    page_path: '/',
    route_name: 'home',
    page_type: 'home',
    site_section: 'marketing',
    environment: 'prod',
    traffic_class: 'public',
    is_internal: false,
    visit_context: 'remote',
    visit_context_confidence: 0.55,
    fcp_ms: 650,
    dom_interactive_ms: 900,
    route_ready_ms: 1200,
    navigation_type: 'hard',
    network_effective_type: '4g',
    network_downlink_mbps: 14,
    network_rtt_ms: 60,
  }));

  events.push(buildEvent('page_view', {
    event_id: 'evt_kpi_13',
    occurred_at: '2026-04-16T18:00:00.000Z',
    session_id: 'ses_kpi_b_1',
    visitor_id: 'vst_kpi_b',
    session_sequence: 1,
    entry_source: 'instagram',
    entry_source_detail: 'bio',
    source_medium: 'bio',
    source_campaign: 'menu',
    source_content: 'profile',
    page_path: '/menu/',
    route_name: 'menu',
    page_type: 'menu_index',
    site_section: 'menu',
    environment: 'prod',
    traffic_class: 'public',
    is_internal: false,
    visit_context: 'remote',
    visit_context_confidence: 0.55,
  }));
  events.push(buildEvent('item_detail_open', {
    event_id: 'evt_kpi_14',
    occurred_at: '2026-04-16T18:00:01.000Z',
    session_id: 'ses_kpi_b_1',
    visitor_id: 'vst_kpi_b',
    session_sequence: 1,
    entry_source: 'instagram',
    entry_source_detail: 'bio',
    source_medium: 'bio',
    source_campaign: 'menu',
    source_content: 'profile',
    page_path: '/menu/',
    route_name: 'menu',
    page_type: 'menu_index',
    site_section: 'menu',
    environment: 'prod',
    traffic_class: 'public',
    is_internal: false,
    visit_context: 'remote',
    visit_context_confidence: 0.55,
    item_id: 'pizza-margherita',
    item_name: 'Pizza Margherita',
    category: 'pizzas',
    detail_origin: 'featured',
  }));
  events.push(buildEvent('item_detail_open', {
    event_id: 'evt_kpi_15',
    occurred_at: '2026-04-16T18:00:02.000Z',
    session_id: 'ses_kpi_b_1',
    visitor_id: 'vst_kpi_b',
    session_sequence: 1,
    entry_source: 'instagram',
    entry_source_detail: 'bio',
    source_medium: 'bio',
    source_campaign: 'menu',
    source_content: 'profile',
    page_path: '/menu/',
    route_name: 'menu',
    page_type: 'menu_index',
    site_section: 'menu',
    environment: 'prod',
    traffic_class: 'public',
    is_internal: false,
    visit_context: 'remote',
    visit_context_confidence: 0.55,
    item_id: 'pizza-piccante',
    item_name: 'Pizza Piccante',
    category: 'pizzas',
    detail_origin: 'menu_grid',
  }));
  events.push(buildEvent('item_detail_open', {
    event_id: 'evt_kpi_16',
    occurred_at: '2026-04-16T18:00:03.000Z',
    session_id: 'ses_kpi_b_1',
    visitor_id: 'vst_kpi_b',
    session_sequence: 1,
    entry_source: 'instagram',
    entry_source_detail: 'bio',
    source_medium: 'bio',
    source_campaign: 'menu',
    source_content: 'profile',
    page_path: '/menu/',
    route_name: 'menu',
    page_type: 'menu_index',
    site_section: 'menu',
    environment: 'prod',
    traffic_class: 'public',
    is_internal: false,
    visit_context: 'remote',
    visit_context_confidence: 0.55,
    item_id: 'pizza-funghi',
    item_name: 'Pizza Funghi',
    category: 'pizzas',
    detail_origin: 'menu_grid',
  }));
  events.push(buildEvent('performance_summary', {
    event_id: 'evt_kpi_17',
    occurred_at: '2026-04-16T18:00:04.000Z',
    session_id: 'ses_kpi_b_1',
    visitor_id: 'vst_kpi_b',
    session_sequence: 1,
    entry_source: 'instagram',
    entry_source_detail: 'bio',
    source_medium: 'bio',
    source_campaign: 'menu',
    source_content: 'profile',
    page_path: '/menu/',
    route_name: 'menu',
    page_type: 'menu_index',
    site_section: 'menu',
    environment: 'prod',
    traffic_class: 'public',
    is_internal: false,
    visit_context: 'remote',
    visit_context_confidence: 0.55,
    fcp_ms: 980,
    dom_interactive_ms: 1400,
    route_ready_ms: 3000,
    navigation_type: 'hard',
    network_effective_type: '3g',
    network_downlink_mbps: 2,
    network_rtt_ms: 250,
  }));

  return events;
}

function main() {
  const pipelineResult = analyticsPipeline.buildAnalyticsPipeline(buildFixtureEvents(), {
    sourceLabel: 'kpi-fixture',
    processedAt: '2026-04-16T18:10:00.000Z',
  });
  const snapshot = analyticsKpiCatalog.buildKpiCatalogSnapshot(pipelineResult, {
    generatedAt: '2026-04-16T18:10:00.000Z',
    scopeMode: 'business_only',
  });
  const markdown = analyticsKpiCatalog.renderKpiCatalogMarkdown(snapshot);
  const globalMetrics = snapshot.metrics.global;
  const deviceSegment = snapshot.metrics.bySegment.device_type;
  const qrMetrics = snapshot.metrics.bySegment.entry_source.values.qr;

  assert(snapshot.catalog.definitions.length >= 20, 'Expected KPI catalog to define at least 20 metrics');
  assert(globalMetrics.sessions_total.value === 3, 'Expected 3 sessions in fixture snapshot');
  assert(globalMetrics.unique_visitors_total.value === 2, 'Expected 2 visitors in fixture snapshot');
  assert(globalMetrics.returning_visitor_rate.value === 0.5, 'Expected returning visitor rate of 0.5');
  assert(globalMetrics.purchase_session_rate.value === 0.3333, 'Expected purchase session rate of 0.3333');
  assert(globalMetrics.detail_opens_before_purchase.value === 2, 'Expected 2 detail opens before purchase');
  assert(globalMetrics.time_from_first_detail_to_purchase_ms.value === 4000, 'Expected 4000 ms from first detail to purchase');
  assert(globalMetrics.in_store_confirmation_rate.value === 1, 'Expected QR in-store confirmation rate of 1');
  assert(globalMetrics.average_route_ready_ms.value === 1900, 'Expected average route ready of 1900 ms');
  assert(globalMetrics.slow_session_rate.value === 0.3333, 'Expected slow session rate of 0.3333');
  assert(globalMetrics.performance_conversion_gap.value === 0.5, 'Expected performance conversion gap of 0.5');
  assert(qrMetrics.purchase_session_rate.value === 1, 'Expected QR purchase session rate of 1');
  assert(deviceSegment.status === 'planned', 'Expected device segment to remain planned');
  assert(markdown.includes('# Analytics KPI Catalog'), 'Expected Markdown heading');
  assert(markdown.includes('## KPI To Source Matrix'), 'Expected KPI source matrix section');
  assert(snapshot.catalog.priorityMetricIds.every((metricId) => {
    const definition = analyticsKpiCatalog.getDefinition(metricId);
    return definition &&
      definition.businessValidation &&
      definition.businessValidation.status === 'aligned' &&
      Array.isArray(definition.businessValidation.sources) &&
      definition.businessValidation.sources.length > 0;
  }), 'Expected priority KPIs to include business validation metadata');

  console.log('Analytics KPI catalog valid.');
  console.log(`KPIs: ${snapshot.catalog.definitions.length}`);
  console.log(`Priority KPIs: ${snapshot.catalog.priorityMetricIds.length}`);
}

try {
  main();
} catch (error) {
  console.error(error && error.message ? error.message : error);
  process.exit(1);
}
