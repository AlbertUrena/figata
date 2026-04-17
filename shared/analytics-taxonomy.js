(function (root, factory) {
  var exported = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = exported;
  }

  root.FigataAnalyticsTaxonomy = exported;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  var VERSION = 'figata.analytics.taxonomy.v1';

  var PROPERTY_REGISTRY = {
    event_id: { type: 'string', example: 'evt_01j9k5x2n4m8p7q6r5s4t3u2v1', domain: 'base' },
    event_name: { type: 'string', example: 'page_view', domain: 'base' },
    event_version: { type: 'string', example: 'v1', domain: 'base' },
    schema_version: { type: 'string', example: VERSION, domain: 'base' },
    occurred_at: { type: 'string', example: '2026-04-15T12:00:00.000Z', domain: 'base' },
    sent_at: { type: 'string', example: '2026-04-15T12:00:01.100Z', domain: 'base' },
    transport_name: { type: 'string', example: 'prod_batch', domain: 'base' },
    environment: { type: 'string', example: 'prod', domain: 'context' },
    page_path: { type: 'string', example: '/menu/margherita', domain: 'route' },
    page_title: { type: 'string', example: 'Menu | Figata Pizza & Wine', domain: 'route' },
    page_type: { type: 'string', example: 'menu_detail', domain: 'route' },
    route_name: { type: 'string', example: 'menu_detail', domain: 'route' },
    site_section: { type: 'string', example: 'menu', domain: 'route' },
    navigation_type: { type: 'string', example: 'hard', domain: 'route' },
    referrer_host: { type: 'string', example: 'instagram.com', domain: 'source' },
    visitor_id: { type: 'string', example: 'vst_01j9k5v1a2b3c4d5e6f7g8h9', domain: 'identity' },
    session_id: { type: 'string', example: 'ses_01j9k5w9q8r7s6t5u4v3w2x1', domain: 'identity' },
    session_sequence: { type: 'integer', example: 3, domain: 'identity' },
    is_returning_visitor: { type: 'boolean', example: true, domain: 'identity' },
    entry_source: { type: 'string', example: 'instagram', domain: 'source' },
    entry_source_detail: { type: 'string', example: 'bio_menu', domain: 'source' },
    source_medium: { type: 'string', example: 'bio', domain: 'source' },
    source_campaign: { type: 'string', example: 'menu_launch', domain: 'source' },
    source_content: { type: 'string', example: 'qr_main', domain: 'source' },
    visit_context: { type: 'string', example: 'remote', domain: 'context' },
    visit_context_before: { type: 'string', example: 'in_restaurant_probable', domain: 'context' },
    visit_context_confidence: { type: 'number', example: 0.82, domain: 'context' },
    is_internal: { type: 'boolean', example: false, domain: 'context' },
    traffic_class: { type: 'string', example: 'public', domain: 'context' },
    engagement_time_ms: { type: 'integer', example: 42000, domain: 'navigation' },
    section_id: { type: 'string', example: 'mas-pedidas', domain: 'navigation' },
    section_name: { type: 'string', example: 'Las mas pedidas', domain: 'navigation' },
    section_index: { type: 'integer', example: 2, domain: 'navigation' },
    scroll_percent: { type: 'integer', example: 50, domain: 'navigation' },
    scroll_milestone_name: { type: 'string', example: '50_percent', domain: 'navigation' },
    nav_location: { type: 'string', example: 'header_desktop', domain: 'cta' },
    cta_id: { type: 'string', example: 'hero_menu', domain: 'cta' },
    cta_label: { type: 'string', example: 'Menu', domain: 'cta' },
    cta_target: { type: 'string', example: '/menu/', domain: 'cta' },
    cta_category: { type: 'string', example: 'menu', domain: 'cta' },
    burger_state: { type: 'string', example: 'open', domain: 'navigation' },
    item_id: { type: 'string', example: 'margherita', domain: 'commerce' },
    item_name: { type: 'string', example: 'Margherita', domain: 'commerce' },
    category: { type: 'string', example: 'pizzas', domain: 'commerce' },
    price: { type: 'number', example: 650, domain: 'commerce' },
    quantity: { type: 'integer', example: 1, domain: 'commerce' },
    currency: { type: 'string', example: 'DOP', domain: 'commerce' },
    value: { type: 'number', example: 1300, domain: 'commerce' },
    items: { type: 'array', example: [{ item_id: 'margherita', quantity: 2, price: 650 }], domain: 'commerce' },
    cart_id: { type: 'string', example: 'cart_01j9k62', domain: 'commerce' },
    order_id: { type: 'string', example: 'ord_01j9k63', domain: 'commerce' },
    list_id: { type: 'string', example: 'menu_featured', domain: 'commerce' },
    list_name: { type: 'string', example: 'Mas Pedidas', domain: 'commerce' },
    list_position: { type: 'integer', example: 1, domain: 'commerce' },
    detail_origin: { type: 'string', example: 'menu_grid', domain: 'editorial' },
    detail_depth_index: { type: 'integer', example: 2, domain: 'editorial' },
    story_id: { type: 'string', example: 'story_margherita', domain: 'editorial' },
    pairing_id: { type: 'string', example: 'chianti', domain: 'editorial' },
    media_id: { type: 'string', example: 'margherita-hero-video', domain: 'editorial' },
    media_duration_ms: { type: 'integer', example: 14000, domain: 'editorial' },
    media_percent_complete: { type: 'integer', example: 100, domain: 'editorial' },
    network_effective_type: { type: 'string', example: '4g', domain: 'performance' },
    network_downlink_mbps: { type: 'number', example: 9.3, domain: 'performance' },
    network_rtt_ms: { type: 'integer', example: 120, domain: 'performance' },
    network_save_data: { type: 'boolean', example: false, domain: 'performance' },
    fcp_ms: { type: 'integer', example: 1280, domain: 'performance' },
    dom_interactive_ms: { type: 'integer', example: 2020, domain: 'performance' },
    route_ready_ms: { type: 'integer', example: 2480, domain: 'performance' },
    page_shell_visible_ms: { type: 'integer', example: 820, domain: 'performance' },
    menu_tabs_visible_ms: { type: 'integer', example: 1160, domain: 'performance' },
    menu_first_row_hydrated_ms: { type: 'integer', example: 1540, domain: 'performance' },
    menu_full_hydration_ms: { type: 'integer', example: 2140, domain: 'performance' },
    detail_open_ms: { type: 'integer', example: 460, domain: 'performance' },
    detail_image_visible_ms: { type: 'integer', example: 980, domain: 'performance' },
    detail_video_ready_ms: { type: 'integer', example: 1380, domain: 'performance' },
    detail_cta_ready_ms: { type: 'integer', example: 620, domain: 'performance' },
    asset_name: { type: 'string', example: 'assets/eventos/eventos-hero.webm', domain: 'performance' },
    asset_type: { type: 'string', example: 'video', domain: 'performance' },
    asset_size_bytes: { type: 'integer', example: 812000, domain: 'performance' },
    asset_load_ms: { type: 'integer', example: 910, domain: 'performance' },
    wifi_assist_reason: { type: 'string', example: 'qr_entry_low_bandwidth', domain: 'wifi' },
    wifi_assist_action: { type: 'string', example: 'copy_password', domain: 'wifi' },
    report_type: { type: 'string', example: 'weekly', domain: 'admin' },
    report_period: { type: 'string', example: '2026-W16', domain: 'admin' },
    report_status: { type: 'string', example: 'generated', domain: 'admin' },
    question_template_id: { type: 'string', example: 'top_items_by_channel', domain: 'admin' },
    question_tokens: { type: 'integer', example: 142, domain: 'admin' },
    response_scope: { type: 'string', example: 'last_30_days', domain: 'admin' },
    experiment_id: { type: 'string', example: 'menu_order_v1', domain: 'experiment' },
    variant_id: { type: 'string', example: 'variant_b', domain: 'experiment' },
    experiment_goal: { type: 'string', example: 'increase_add_to_cart_rate', domain: 'experiment' },
    recommendation_id: { type: 'string', example: 'top_of_moment', domain: 'experiment' },
    replay_tool: { type: 'string', example: 'clarity', domain: 'optimization' },
    replay_sample_key: { type: 'string', example: 'replay', domain: 'optimization' },
    replay_sample_rate: { type: 'number', example: 0.05, domain: 'optimization' },
    replay_capture_mode: { type: 'string', example: 'coupled_conservative', domain: 'optimization' },
    review_cadence_days: { type: 'integer', example: 14, domain: 'optimization' },
  };

  var BASE_REQUIRED = [
    'event_id',
    'event_name',
    'event_version',
    'schema_version',
    'occurred_at',
    'environment',
    'page_path',
    'page_type',
    'route_name',
    'site_section',
    'visitor_id',
    'session_id',
    'entry_source',
    'visit_context',
    'visit_context_confidence',
    'is_internal',
    'traffic_class',
  ];

  var EVENTS = {
    session_start: defineEvent('session_start', 'lifecycle', {
      stage: 'foundation',
      required: ['session_sequence', 'navigation_type'],
      optional: ['is_returning_visitor', 'referrer_host'],
      idempotency: ['session_id', 'navigation_type'],
      status: 'active',
    }),
    page_view: defineEvent('page_view', 'lifecycle', {
      stage: 'foundation',
      required: ['page_title', 'navigation_type'],
      optional: ['referrer_host'],
      idempotency: ['session_id', 'page_path', 'navigation_type'],
      status: 'active',
    }),
    page_exit: defineEvent('page_exit', 'lifecycle', {
      stage: 'capture',
      required: ['engagement_time_ms'],
      optional: [],
      idempotency: ['session_id', 'page_path', 'event_name'],
      status: 'active',
      aliases: [],
    }),
    source_attribution_resolved: defineEvent('source_attribution_resolved', 'lifecycle', {
      stage: 'foundation',
      required: ['entry_source_detail', 'source_medium', 'source_campaign'],
      optional: ['source_content', 'referrer_host'],
      idempotency: ['session_id', 'entry_source', 'entry_source_detail'],
      status: 'active',
    }),
    section_view: defineEvent('section_view', 'navigation', {
      stage: 'capture',
      required: ['section_id', 'section_name', 'section_index'],
      optional: [],
      idempotency: ['session_id', 'page_path', 'section_id'],
      status: 'active',
    }),
    scroll_milestone: defineEvent('scroll_milestone', 'navigation', {
      stage: 'capture',
      required: ['scroll_percent', 'scroll_milestone_name'],
      optional: [],
      idempotency: ['session_id', 'page_path', 'scroll_milestone_name'],
      status: 'active',
    }),
    nav_link_click: defineEvent('nav_link_click', 'navigation', {
      stage: 'capture',
      required: ['nav_location', 'cta_id', 'cta_label', 'cta_target'],
      optional: ['cta_category'],
      idempotency: ['session_id', 'page_path', 'cta_id', 'nav_location'],
      status: 'active',
    }),
    burger_menu_toggle: defineEvent('burger_menu_toggle', 'navigation', {
      stage: 'capture',
      required: ['nav_location', 'burger_state'],
      optional: [],
      idempotency: ['session_id', 'page_path', 'burger_state'],
      status: 'active',
    }),
    cta_click: defineEvent('cta_click', 'navigation', {
      stage: 'capture',
      required: ['cta_id', 'cta_label', 'cta_target', 'cta_category'],
      optional: ['nav_location'],
      idempotency: ['session_id', 'page_path', 'cta_id', 'cta_target'],
      status: 'active',
    }),
    whatsapp_click: defineEvent('whatsapp_click', 'navigation', {
      stage: 'capture',
      required: ['cta_id', 'cta_label', 'cta_target'],
      optional: ['nav_location'],
      idempotency: ['session_id', 'page_path', 'cta_id'],
      status: 'compatibility',
      aliases: ['cta_click'],
      exampleOverrides: { cta_category: 'whatsapp' },
    }),
    reserve_click: defineEvent('reserve_click', 'navigation', {
      stage: 'capture',
      required: ['cta_id', 'cta_label', 'cta_target'],
      optional: ['nav_location'],
      idempotency: ['session_id', 'page_path', 'cta_id'],
      status: 'compatibility',
      aliases: ['cta_click'],
      exampleOverrides: { cta_category: 'reservation' },
    }),
    delivery_click: defineEvent('delivery_click', 'navigation', {
      stage: 'capture',
      required: ['cta_id', 'cta_label', 'cta_target'],
      optional: ['nav_location'],
      idempotency: ['session_id', 'page_path', 'cta_id'],
      status: 'compatibility',
      aliases: ['cta_click'],
      exampleOverrides: { cta_category: 'delivery' },
    }),
    event_interest_click: defineEvent('event_interest_click', 'navigation', {
      stage: 'capture',
      required: ['cta_id', 'cta_label', 'cta_target'],
      optional: ['nav_location'],
      idempotency: ['session_id', 'page_path', 'cta_id'],
      status: 'compatibility',
      aliases: ['cta_click'],
      exampleOverrides: { cta_category: 'events' },
    }),
    menu_section_view: defineEvent('menu_section_view', 'menu', {
      stage: 'capture',
      required: ['section_id', 'section_name', 'section_index'],
      optional: [],
      idempotency: ['session_id', 'page_path', 'section_id'],
      status: 'active',
    }),
    item_impression: defineEvent('item_impression', 'menu', {
      stage: 'capture',
      required: ['item_id', 'item_name', 'category', 'list_id', 'list_name', 'list_position'],
      optional: ['price'],
      idempotency: ['session_id', 'item_id', 'list_id', 'list_position'],
      status: 'active',
    }),
    item_detail_open: defineEvent('item_detail_open', 'menu', {
      stage: 'capture',
      required: ['item_id', 'item_name', 'category', 'detail_origin'],
      optional: ['detail_depth_index', 'price'],
      idempotency: ['session_id', 'item_id', 'detail_origin'],
      status: 'active',
    }),
    item_detail_close: defineEvent('item_detail_close', 'menu', {
      stage: 'capture',
      required: ['item_id', 'item_name', 'category', 'detail_origin'],
      optional: ['detail_depth_index'],
      idempotency: ['session_id', 'item_id', 'detail_origin', 'event_name'],
      status: 'active',
    }),
    item_gallery_expand: defineEvent('item_gallery_expand', 'editorial', {
      stage: 'capture',
      required: ['item_id', 'item_name', 'category', 'media_id'],
      optional: ['detail_depth_index'],
      idempotency: ['session_id', 'item_id', 'media_id'],
      status: 'active',
    }),
    item_story_view: defineEvent('item_story_view', 'editorial', {
      stage: 'capture',
      required: ['item_id', 'item_name', 'story_id'],
      optional: ['detail_depth_index'],
      idempotency: ['session_id', 'item_id', 'story_id'],
      status: 'active',
    }),
    item_pairing_view: defineEvent('item_pairing_view', 'editorial', {
      stage: 'capture',
      required: ['item_id', 'item_name', 'pairing_id'],
      optional: ['detail_depth_index'],
      idempotency: ['session_id', 'item_id', 'pairing_id'],
      status: 'active',
    }),
    item_video_play: defineEvent('item_video_play', 'editorial', {
      stage: 'capture',
      required: ['item_id', 'item_name', 'media_id', 'media_duration_ms'],
      optional: ['detail_depth_index'],
      idempotency: ['session_id', 'item_id', 'media_id', 'event_name'],
      status: 'active',
    }),
    item_video_complete: defineEvent('item_video_complete', 'editorial', {
      stage: 'capture',
      required: ['item_id', 'item_name', 'media_id', 'media_duration_ms', 'media_percent_complete'],
      optional: ['detail_depth_index'],
      idempotency: ['session_id', 'item_id', 'media_id', 'media_percent_complete'],
      status: 'active',
      exampleOverrides: { media_percent_complete: 100 },
    }),
    add_to_cart: defineEvent('add_to_cart', 'menu', {
      stage: 'capture',
      required: ['item_id', 'item_name', 'category', 'price', 'quantity', 'currency', 'cart_id'],
      optional: ['detail_origin'],
      idempotency: ['session_id', 'cart_id', 'item_id', 'quantity'],
      status: 'active',
    }),
    remove_from_cart: defineEvent('remove_from_cart', 'menu', {
      stage: 'capture',
      required: ['item_id', 'item_name', 'category', 'price', 'quantity', 'currency', 'cart_id'],
      optional: ['detail_origin'],
      idempotency: ['session_id', 'cart_id', 'item_id', 'quantity', 'event_name'],
      status: 'active',
    }),
    cart_view: defineEvent('cart_view', 'menu', {
      stage: 'capture',
      required: ['cart_id', 'currency', 'value', 'items'],
      optional: [],
      idempotency: ['session_id', 'cart_id', 'value'],
      status: 'active',
    }),
    begin_checkout: defineEvent('begin_checkout', 'menu', {
      stage: 'capture',
      required: ['cart_id', 'currency', 'value', 'items'],
      optional: [],
      idempotency: ['session_id', 'cart_id', 'event_name'],
      status: 'active',
    }),
    purchase: defineEvent('purchase', 'menu', {
      stage: 'capture',
      required: ['order_id', 'currency', 'value', 'items'],
      optional: ['cart_id'],
      idempotency: ['order_id'],
      status: 'active',
    }),
    route_ready: defineEvent('route_ready', 'performance', {
      stage: 'capture',
      required: ['route_ready_ms', 'navigation_type'],
      optional: ['network_effective_type', 'network_downlink_mbps', 'network_rtt_ms'],
      idempotency: ['session_id', 'route_name', 'event_name'],
      status: 'active',
    }),
    performance_summary: defineEvent('performance_summary', 'performance', {
      stage: 'capture',
      required: ['fcp_ms', 'dom_interactive_ms', 'route_ready_ms', 'network_effective_type'],
      optional: ['network_downlink_mbps', 'network_rtt_ms', 'network_save_data'],
      idempotency: ['session_id', 'route_name', 'network_effective_type'],
      status: 'active',
    }),
    asset_load_timing: defineEvent('asset_load_timing', 'performance', {
      stage: 'capture',
      required: ['asset_name', 'asset_type', 'asset_size_bytes', 'asset_load_ms'],
      optional: ['item_id', 'item_name', 'media_id'],
      idempotency: ['session_id', 'asset_name', 'asset_type'],
      status: 'active',
    }),
    network_context_sample: defineEvent('network_context_sample', 'performance', {
      stage: 'capture',
      required: ['network_effective_type', 'network_downlink_mbps', 'network_rtt_ms', 'network_save_data'],
      optional: [],
      idempotency: ['session_id', 'route_name', 'network_effective_type', 'network_rtt_ms'],
      status: 'active',
    }),
    wifi_assist_shown: defineEvent('wifi_assist_shown', 'wifi', {
      stage: 'capture',
      required: ['wifi_assist_reason', 'visit_context_before'],
      optional: [],
      idempotency: ['session_id', 'wifi_assist_reason'],
      status: 'active',
    }),
    wifi_assist_dismissed: defineEvent('wifi_assist_dismissed', 'wifi', {
      stage: 'capture',
      required: ['wifi_assist_reason', 'wifi_assist_action'],
      optional: [],
      idempotency: ['session_id', 'wifi_assist_reason', 'wifi_assist_action'],
      status: 'active',
      exampleOverrides: { wifi_assist_action: 'dismiss' },
    }),
    wifi_assist_copy_password: defineEvent('wifi_assist_copy_password', 'wifi', {
      stage: 'capture',
      required: ['wifi_assist_reason', 'wifi_assist_action'],
      optional: [],
      idempotency: ['session_id', 'wifi_assist_reason', 'wifi_assist_action'],
      status: 'active',
      exampleOverrides: { wifi_assist_action: 'copy_password' },
    }),
    wifi_assist_cta_click: defineEvent('wifi_assist_cta_click', 'wifi', {
      stage: 'capture',
      required: ['wifi_assist_reason', 'wifi_assist_action', 'cta_target'],
      optional: [],
      idempotency: ['session_id', 'wifi_assist_reason', 'wifi_assist_action'],
      status: 'active',
      exampleOverrides: { wifi_assist_action: 'open_settings' },
    }),
    visit_context_confirmed: defineEvent('visit_context_confirmed', 'wifi', {
      stage: 'capture',
      required: ['visit_context_before', 'visit_context', 'visit_context_confidence'],
      optional: [],
      idempotency: ['session_id', 'visit_context'],
      status: 'active',
      exampleOverrides: { visit_context: 'in_restaurant_confirmed_wifi', visit_context_confidence: 1 },
    }),
    replay_sampled: defineEvent('replay_sampled', 'optimization', {
      stage: 'intelligence',
      required: ['replay_tool', 'replay_sample_key', 'replay_sample_rate'],
      optional: ['network_effective_type', 'replay_capture_mode', 'review_cadence_days'],
      idempotency: ['session_id', 'event_name'],
      status: 'active',
    }),
    report_generated: defineEvent('report_generated', 'admin', {
      stage: 'intelligence',
      required: ['report_type', 'report_period', 'report_status'],
      optional: [],
      idempotency: ['report_type', 'report_period'],
      status: 'planned',
    }),
    ai_chat_question: defineEvent('ai_chat_question', 'admin', {
      stage: 'intelligence',
      required: ['question_template_id', 'question_tokens', 'response_scope'],
      optional: [],
      idempotency: ['session_id', 'question_template_id', 'question_tokens'],
      status: 'planned',
    }),
    ai_chat_answered: defineEvent('ai_chat_answered', 'admin', {
      stage: 'intelligence',
      required: ['question_template_id', 'response_scope'],
      optional: ['question_tokens'],
      idempotency: ['session_id', 'question_template_id', 'response_scope'],
      status: 'planned',
    }),
    experiment_exposure: defineEvent('experiment_exposure', 'optimization', {
      stage: 'intelligence',
      required: ['experiment_id', 'variant_id', 'experiment_goal'],
      optional: [],
      idempotency: ['session_id', 'experiment_id', 'variant_id'],
      status: 'planned',
    }),
    recommendation_impression: defineEvent('recommendation_impression', 'optimization', {
      stage: 'intelligence',
      required: ['recommendation_id', 'list_id', 'list_position'],
      optional: ['item_id', 'item_name'],
      idempotency: ['session_id', 'recommendation_id', 'list_position'],
      status: 'planned',
    }),
    recommendation_click: defineEvent('recommendation_click', 'optimization', {
      stage: 'intelligence',
      required: ['recommendation_id', 'list_id', 'list_position'],
      optional: ['item_id', 'item_name'],
      idempotency: ['session_id', 'recommendation_id', 'list_position', 'event_name'],
      status: 'planned',
    }),
  };

  function defineEvent(eventName, family, config) {
    return {
      eventName: eventName,
      family: family,
      required: BASE_REQUIRED.concat(config.required || []),
      optional: ['sent_at', 'transport_name'].concat(config.optional || []),
      idempotency: config.idempotency || [],
      stage: config.stage,
      status: config.status,
      aliases: config.aliases || [],
      exampleOverrides: config.exampleOverrides || {},
    };
  }

  function getEventDefinition(eventName) {
    return EVENTS[eventName] || null;
  }

  function buildExampleEvent(eventName) {
    var definition = getEventDefinition(eventName);
    if (!definition) {
      return null;
    }

    var payload = {};
    definition.required.concat(definition.optional).forEach(function (property) {
      if (property === 'event_name') {
        payload[property] = eventName;
        return;
      }

      var propertyDefinition = PROPERTY_REGISTRY[property];
      if (propertyDefinition && typeof propertyDefinition.example !== 'undefined') {
        payload[property] = cloneValue(propertyDefinition.example);
      }
    });

    Object.keys(definition.exampleOverrides || {}).forEach(function (property) {
      payload[property] = cloneValue(definition.exampleOverrides[property]);
    });

    return payload;
  }

  function cloneValue(value) {
    if (Array.isArray(value)) {
      return value.map(cloneValue);
    }

    if (value && typeof value === 'object') {
      return JSON.parse(JSON.stringify(value));
    }

    return value;
  }

  function listEvents() {
    return Object.keys(EVENTS).sort();
  }

  return {
    VERSION: VERSION,
    BASE_REQUIRED: BASE_REQUIRED,
    EVENTS: EVENTS,
    PROPERTY_REGISTRY: PROPERTY_REGISTRY,
    buildExampleEvent: buildExampleEvent,
    getEventDefinition: getEventDefinition,
    listEvents: listEvents,
  };
});
