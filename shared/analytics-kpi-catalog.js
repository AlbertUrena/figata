const VERSION = 'figata.analytics.kpi-catalog.v1';
const DEFAULT_SLOW_ROUTE_READY_MS = 2500;
const NON_BUSINESS_TRAFFIC_CLASSES = new Set(['internal', 'admin', 'preview', 'development', 'automation']);
const BUSINESS_VALIDATION_SOURCES = Object.freeze({
  acquisition: ['analytics PBI/V1.md', 'analytics PBI/V2.md'],
  commerce: ['analytics PBI/V1.md', 'analytics PBI/V2.md'],
  decision: ['analytics PBI/Comportamiento de decision en el menu.md', 'analytics PBI/V2.md'],
  performance: ['analytics PBI/V1.md', 'analytics PBI/V2.md'],
  in_store: ['analytics PBI/V1.md', 'analytics PBI/V2.md'],
});

const STANDARD_WINDOWS = Object.freeze([
  {
    id: 'daily',
    label: 'Diaria',
    description: 'Ventana operativa de un dia calendario para monitoreo y accion rapida.',
  },
  {
    id: 'weekly',
    label: 'Semanal',
    description: 'Ventana de 7 dias para leer canales, funnel, contenido y salud comercial.',
  },
  {
    id: 'monthly',
    label: 'Mensual',
    description: 'Ventana ejecutiva para tendencia, recurrencia y comparativos acumulados.',
  },
]);

const STANDARD_SEGMENTS = Object.freeze([
  {
    id: 'entry_source',
    label: 'Canal',
    status: 'available',
    description: 'Canal principal de entrada de la sesion.',
  },
  {
    id: 'visit_context',
    label: 'Contexto de visita',
    status: 'available',
    description: 'Contexto operativo final de la sesion, incluyendo in-store vs remoto.',
  },
  {
    id: 'visitor_type',
    label: 'Nuevo vs recurrente',
    status: 'available',
    description: 'Segmentacion derivada por secuencia de sesion y base de visitantes.',
  },
  {
    id: 'route_name',
    label: 'Ruta',
    status: 'available',
    description: 'Ruta inicial/canonica de la sesion para lectura operativa por superficie.',
  },
  {
    id: 'device_type',
    label: 'Dispositivo',
    status: 'planned',
    description: 'Filtro reservado para mobile/desktop/tablet cuando el sobre analytics incluya device_type.',
    reason: 'La envoltura canonica actual no persiste device_type en curated analytics.',
  },
]);

const KPI_DEFINITIONS = Object.freeze([
  defineKpi({
    id: 'sessions_total',
    label: 'Sesiones',
    family: 'acquisition',
    type: 'base',
    priority: true,
    unit: 'count',
    sourceTables: ['sessions_fact'],
    sourceEvents: ['session_start', 'page_view'],
    formula: 'count(distinct session_id)',
    purpose: 'Mide el volumen operativo base para cualquier lectura diaria, semanal o mensual.',
    windows: ['daily', 'weekly', 'monthly'],
    segments: ['entry_source', 'visit_context', 'visitor_type', 'route_name'],
    businessValidation: {
      status: 'aligned',
      sources: BUSINESS_VALIDATION_SOURCES.acquisition.slice(),
    },
  }),
  defineKpi({
    id: 'unique_visitors_total',
    label: 'Visitantes unicos',
    family: 'acquisition',
    type: 'base',
    priority: true,
    unit: 'count',
    sourceTables: ['sessions_fact', 'visitors_fact'],
    sourceEvents: ['session_start', 'page_view'],
    formula: 'count(distinct visitor_id)',
    purpose: 'Separa volumen de personas de volumen de sesiones para no inflar lectura de trafico.',
    windows: ['daily', 'weekly', 'monthly'],
    segments: ['entry_source', 'visit_context', 'visitor_type', 'route_name'],
    businessValidation: {
      status: 'aligned',
      sources: BUSINESS_VALIDATION_SOURCES.acquisition.slice(),
    },
  }),
  defineKpi({
    id: 'returning_visitor_rate',
    label: 'Tasa de visitantes recurrentes',
    family: 'acquisition',
    type: 'derived',
    priority: true,
    unit: 'rate',
    sourceTables: ['sessions_fact', 'visitors_fact'],
    sourceEvents: ['session_start', 'page_view'],
    formula: 'distinct visitors tagged as returning / distinct visitors',
    purpose: 'Diferencia descubrimiento vs relacion recurrente con la marca.',
    windows: ['weekly', 'monthly'],
    segments: ['entry_source', 'visit_context', 'visitor_type', 'route_name'],
    businessValidation: {
      status: 'aligned',
      sources: BUSINESS_VALIDATION_SOURCES.acquisition.slice(),
    },
  }),
  defineKpi({
    id: 'qr_session_share',
    label: 'Participacion de QR',
    family: 'acquisition',
    type: 'derived',
    priority: true,
    unit: 'rate',
    sourceTables: ['sessions_fact'],
    sourceEvents: ['source_attribution_resolved'],
    formula: 'sessions with entry_source = qr / sessions_total',
    purpose: 'Mide cuanto del trafico viene de la experiencia in-store frente a otros canales.',
    windows: ['daily', 'weekly', 'monthly'],
    segments: ['visit_context', 'visitor_type', 'route_name'],
    businessValidation: {
      status: 'aligned',
      sources: BUSINESS_VALIDATION_SOURCES.in_store.slice(),
    },
  }),
  defineKpi({
    id: 'cta_click_total',
    label: 'Clicks en CTA',
    family: 'behavior',
    type: 'base',
    priority: true,
    unit: 'count',
    sourceTables: ['events_fact'],
    sourceEvents: ['cta_click'],
    formula: 'count(cta_click)',
    purpose: 'Mide intencion declarada hacia contacto, delivery, reservas y acciones comerciales.',
    windows: ['daily', 'weekly', 'monthly'],
    segments: ['entry_source', 'visit_context', 'visitor_type', 'route_name'],
    businessValidation: {
      status: 'aligned',
      sources: BUSINESS_VALIDATION_SOURCES.commerce.slice(),
    },
  }),
  defineKpi({
    id: 'cta_engagement_rate',
    label: 'Tasa de sesion con CTA',
    family: 'behavior',
    type: 'derived',
    priority: true,
    unit: 'rate',
    sourceTables: ['sessions_fact', 'events_fact'],
    sourceEvents: ['cta_click'],
    formula: 'sessions with >= 1 cta_click / sessions_total',
    purpose: 'Resume cuantas sesiones llegan a una accion explicita sin depender del conteo bruto de clicks.',
    windows: ['daily', 'weekly', 'monthly'],
    segments: ['entry_source', 'visit_context', 'visitor_type', 'route_name'],
    businessValidation: {
      status: 'aligned',
      sources: BUSINESS_VALIDATION_SOURCES.commerce.slice(),
    },
  }),
  defineKpi({
    id: 'item_impression_total',
    label: 'Impresiones de platos',
    family: 'commerce',
    type: 'base',
    priority: true,
    unit: 'count',
    sourceTables: ['events_fact'],
    sourceEvents: ['item_impression'],
    formula: 'count(item_impression)',
    purpose: 'Base del funnel comercial para saber que oferta realmente fue vista.',
    windows: ['daily', 'weekly', 'monthly'],
    segments: ['entry_source', 'visit_context', 'visitor_type', 'route_name'],
    businessValidation: {
      status: 'aligned',
      sources: BUSINESS_VALIDATION_SOURCES.commerce.slice(),
    },
  }),
  defineKpi({
    id: 'item_detail_open_total',
    label: 'Aperturas de detalle',
    family: 'commerce',
    type: 'base',
    priority: true,
    unit: 'count',
    sourceTables: ['events_fact', 'sessions_fact'],
    sourceEvents: ['item_detail_open'],
    formula: 'count(item_detail_open)',
    purpose: 'Mide interes activo por plato mas alla de la simple exposicion.',
    windows: ['daily', 'weekly', 'monthly'],
    segments: ['entry_source', 'visit_context', 'visitor_type', 'route_name'],
    businessValidation: {
      status: 'aligned',
      sources: BUSINESS_VALIDATION_SOURCES.decision.slice(),
    },
  }),
  defineKpi({
    id: 'detail_open_session_rate',
    label: 'Tasa de sesion con detalle',
    family: 'commerce',
    type: 'derived',
    priority: true,
    unit: 'rate',
    sourceTables: ['sessions_fact'],
    sourceEvents: ['item_detail_open'],
    formula: 'sessions with >= 1 item_detail_open / sessions_total',
    purpose: 'Separa sesiones que solo miran de sesiones que empiezan una decision real.',
    windows: ['daily', 'weekly', 'monthly'],
    segments: ['entry_source', 'visit_context', 'visitor_type', 'route_name'],
    businessValidation: {
      status: 'aligned',
      sources: BUSINESS_VALIDATION_SOURCES.decision.slice(),
    },
  }),
  defineKpi({
    id: 'detail_opens_per_session',
    label: 'Detalles abiertos por sesion',
    family: 'commerce',
    type: 'derived',
    priority: true,
    unit: 'ratio',
    sourceTables: ['sessions_fact'],
    sourceEvents: ['item_detail_open'],
    formula: 'sum(item_detail_open_count) / sessions_total',
    purpose: 'Cuantifica cuanta exploracion necesita una persona antes de decidir.',
    windows: ['daily', 'weekly', 'monthly'],
    segments: ['entry_source', 'visit_context', 'visitor_type', 'route_name'],
    businessValidation: {
      status: 'aligned',
      sources: BUSINESS_VALIDATION_SOURCES.decision.slice(),
    },
  }),
  defineKpi({
    id: 'unique_detail_opens_per_session',
    label: 'Platos unicos abiertos por sesion',
    family: 'commerce',
    type: 'derived',
    priority: true,
    unit: 'ratio',
    sourceTables: ['events_fact', 'sessions_fact'],
    sourceEvents: ['item_detail_open'],
    formula: 'avg(count(distinct item_id) per session over item_detail_open)',
    purpose: 'Distingue repetir el mismo detalle vs comparar varias opciones del menu.',
    windows: ['daily', 'weekly', 'monthly'],
    segments: ['entry_source', 'visit_context', 'visitor_type', 'route_name'],
    businessValidation: {
      status: 'aligned',
      sources: BUSINESS_VALIDATION_SOURCES.decision.slice(),
    },
  }),
  defineKpi({
    id: 'add_to_cart_total',
    label: 'Adds to cart',
    family: 'commerce',
    type: 'base',
    priority: true,
    unit: 'count',
    sourceTables: ['events_fact', 'sessions_fact'],
    sourceEvents: ['add_to_cart'],
    formula: 'count(add_to_cart)',
    purpose: 'Mide intencion comercial concreta a nivel de evento.',
    windows: ['daily', 'weekly', 'monthly'],
    segments: ['entry_source', 'visit_context', 'visitor_type', 'route_name'],
    businessValidation: {
      status: 'aligned',
      sources: BUSINESS_VALIDATION_SOURCES.commerce.slice(),
    },
  }),
  defineKpi({
    id: 'detail_to_cart_session_rate',
    label: 'Tasa detalle a carrito',
    family: 'commerce',
    type: 'derived',
    priority: true,
    unit: 'rate',
    sourceTables: ['sessions_fact'],
    sourceEvents: ['item_detail_open', 'add_to_cart'],
    formula: 'sessions with add_to_cart / sessions with item_detail_open',
    purpose: 'Resume si el menu logra convertir interes en intencion comercial.',
    windows: ['daily', 'weekly', 'monthly'],
    segments: ['entry_source', 'visit_context', 'visitor_type', 'route_name'],
    businessValidation: {
      status: 'aligned',
      sources: BUSINESS_VALIDATION_SOURCES.commerce.slice(),
    },
  }),
  defineKpi({
    id: 'begin_checkout_total',
    label: 'Checkouts iniciados',
    family: 'commerce',
    type: 'base',
    priority: true,
    unit: 'count',
    sourceTables: ['events_fact', 'sessions_fact'],
    sourceEvents: ['begin_checkout'],
    formula: 'count(begin_checkout)',
    purpose: 'Marca el paso entre carrito y accion de cierre.',
    windows: ['daily', 'weekly', 'monthly'],
    segments: ['entry_source', 'visit_context', 'visitor_type', 'route_name'],
    businessValidation: {
      status: 'aligned',
      sources: BUSINESS_VALIDATION_SOURCES.commerce.slice(),
    },
  }),
  defineKpi({
    id: 'cart_to_checkout_session_rate',
    label: 'Tasa carrito a checkout',
    family: 'commerce',
    type: 'derived',
    priority: true,
    unit: 'rate',
    sourceTables: ['sessions_fact'],
    sourceEvents: ['add_to_cart', 'begin_checkout'],
    formula: 'sessions with begin_checkout / sessions with add_to_cart',
    purpose: 'Mide si la sesion avanza del interes comercial al intento de cierre.',
    windows: ['daily', 'weekly', 'monthly'],
    segments: ['entry_source', 'visit_context', 'visitor_type', 'route_name'],
    businessValidation: {
      status: 'aligned',
      sources: BUSINESS_VALIDATION_SOURCES.commerce.slice(),
    },
  }),
  defineKpi({
    id: 'purchase_total',
    label: 'Compras',
    family: 'commerce',
    type: 'base',
    priority: true,
    unit: 'count',
    sourceTables: ['events_fact', 'sessions_fact'],
    sourceEvents: ['purchase'],
    formula: 'count(purchase)',
    purpose: 'Mide cierres confirmados de orden a nivel de evento.',
    windows: ['daily', 'weekly', 'monthly'],
    segments: ['entry_source', 'visit_context', 'visitor_type', 'route_name'],
    businessValidation: {
      status: 'aligned',
      sources: BUSINESS_VALIDATION_SOURCES.commerce.slice(),
    },
  }),
  defineKpi({
    id: 'purchase_session_rate',
    label: 'Tasa de sesion con compra',
    family: 'commerce',
    type: 'derived',
    priority: true,
    unit: 'rate',
    sourceTables: ['sessions_fact'],
    sourceEvents: ['purchase'],
    formula: 'sessions with purchase / sessions_total',
    purpose: 'Lectura ejecutiva de conversion general del sitio/menu.',
    windows: ['daily', 'weekly', 'monthly'],
    segments: ['entry_source', 'visit_context', 'visitor_type', 'route_name'],
    businessValidation: {
      status: 'aligned',
      sources: BUSINESS_VALIDATION_SOURCES.commerce.slice(),
    },
  }),
  defineKpi({
    id: 'checkout_to_purchase_session_rate',
    label: 'Tasa checkout a compra',
    family: 'commerce',
    type: 'derived',
    priority: true,
    unit: 'rate',
    sourceTables: ['sessions_fact'],
    sourceEvents: ['begin_checkout', 'purchase'],
    formula: 'sessions with purchase / sessions with begin_checkout',
    purpose: 'Separa friccion de cierre respecto a friccion de descubrimiento.',
    windows: ['daily', 'weekly', 'monthly'],
    segments: ['entry_source', 'visit_context', 'visitor_type', 'route_name'],
    businessValidation: {
      status: 'aligned',
      sources: BUSINESS_VALIDATION_SOURCES.commerce.slice(),
    },
  }),
  defineKpi({
    id: 'purchase_value_total',
    label: 'Valor total de compra',
    family: 'commerce',
    type: 'base',
    priority: true,
    unit: 'currency',
    sourceTables: ['sessions_fact', 'events_fact'],
    sourceEvents: ['purchase'],
    formula: 'sum(purchase.value)',
    purpose: 'Une actividad comercial con impacto economico agregado.',
    windows: ['daily', 'weekly', 'monthly'],
    segments: ['entry_source', 'visit_context', 'visitor_type', 'route_name'],
    businessValidation: {
      status: 'aligned',
      sources: BUSINESS_VALIDATION_SOURCES.commerce.slice(),
    },
  }),
  defineKpi({
    id: 'average_order_value',
    label: 'Ticket promedio',
    family: 'commerce',
    type: 'derived',
    priority: true,
    unit: 'currency',
    sourceTables: ['sessions_fact', 'events_fact'],
    sourceEvents: ['purchase'],
    formula: 'purchase_value_total / purchase_total',
    purpose: 'Ayuda a leer si el contenido y los maridajes aumentan valor de compra.',
    windows: ['weekly', 'monthly'],
    segments: ['entry_source', 'visit_context', 'visitor_type', 'route_name'],
    businessValidation: {
      status: 'aligned',
      sources: BUSINESS_VALIDATION_SOURCES.commerce.slice(),
    },
  }),
  defineKpi({
    id: 'detail_opens_before_purchase',
    label: 'Detalles antes de comprar',
    family: 'decision',
    type: 'derived',
    priority: true,
    unit: 'ratio',
    sourceTables: ['events_fact', 'sessions_fact'],
    sourceEvents: ['item_detail_open', 'purchase'],
    formula: 'avg(item_detail_open count before first purchase for purchase sessions)',
    purpose: 'Mide cuanta exploracion necesita una sesion antes de cerrar compra.',
    windows: ['weekly', 'monthly'],
    segments: ['entry_source', 'visit_context', 'visitor_type', 'route_name'],
    businessValidation: {
      status: 'aligned',
      sources: BUSINESS_VALIDATION_SOURCES.decision.slice(),
    },
  }),
  defineKpi({
    id: 'time_from_first_detail_to_purchase_ms',
    label: 'Tiempo desde primer detalle hasta compra',
    family: 'decision',
    type: 'derived',
    priority: true,
    unit: 'ms',
    sourceTables: ['events_fact', 'sessions_fact'],
    sourceEvents: ['item_detail_open', 'purchase'],
    formula: 'avg(first purchase timestamp - first item_detail_open timestamp) for purchase sessions',
    purpose: 'Senal de rapidez o friccion en el proceso de decision dentro del menu.',
    windows: ['weekly', 'monthly'],
    segments: ['entry_source', 'visit_context', 'visitor_type', 'route_name'],
    businessValidation: {
      status: 'aligned',
      sources: BUSINESS_VALIDATION_SOURCES.decision.slice(),
    },
  }),
  defineKpi({
    id: 'in_store_confirmation_rate',
    label: 'Tasa de confirmacion in-store',
    family: 'operation',
    type: 'derived',
    priority: true,
    unit: 'rate',
    sourceTables: ['sessions_fact', 'events_fact'],
    sourceEvents: ['visit_context_confirmed', 'wifi_assist_shown', 'wifi_assist_cta_click'],
    formula: 'sessions with confirmed Wi-Fi context / sessions with entry_source = qr',
    purpose: 'Mide que tan bien la capa in-store confirma sesiones reales del restaurante.',
    windows: ['daily', 'weekly', 'monthly'],
    segments: ['visit_context', 'visitor_type', 'route_name'],
    businessValidation: {
      status: 'aligned',
      sources: BUSINESS_VALIDATION_SOURCES.in_store.slice(),
    },
  }),
  defineKpi({
    id: 'wifi_assist_engagement_rate',
    label: 'Engagement con Wi-Fi Assist',
    family: 'operation',
    type: 'derived',
    priority: false,
    unit: 'rate',
    sourceTables: ['sessions_fact', 'events_fact'],
    sourceEvents: ['wifi_assist_shown', 'wifi_assist_copy_password', 'wifi_assist_cta_click'],
    formula: 'sessions with Wi-Fi Assist action / sessions with Wi-Fi Assist shown',
    purpose: 'Diferencia mostrar la ayuda vs lograr que la persona interactue con ella.',
    windows: ['daily', 'weekly', 'monthly'],
    segments: ['visit_context', 'visitor_type', 'route_name'],
    businessValidation: {
      status: 'aligned',
      sources: BUSINESS_VALIDATION_SOURCES.in_store.slice(),
    },
  }),
  defineKpi({
    id: 'average_route_ready_ms',
    label: 'Promedio route ready',
    family: 'performance',
    type: 'derived',
    priority: true,
    unit: 'ms',
    sourceTables: ['sessions_fact', 'events_fact'],
    sourceEvents: ['route_ready', 'performance_summary'],
    formula: 'avg(session.average_route_ready_ms)',
    purpose: 'Base de performance operativa conectada con la experiencia real del usuario.',
    windows: ['daily', 'weekly', 'monthly'],
    segments: ['entry_source', 'visit_context', 'visitor_type', 'route_name'],
    businessValidation: {
      status: 'aligned',
      sources: BUSINESS_VALIDATION_SOURCES.performance.slice(),
    },
  }),
  defineKpi({
    id: 'slow_session_rate',
    label: 'Tasa de sesiones lentas',
    family: 'performance',
    type: 'derived',
    priority: true,
    unit: 'rate',
    sourceTables: ['sessions_fact', 'events_fact'],
    sourceEvents: ['route_ready', 'performance_summary'],
    formula: 'sessions with average_route_ready_ms >= slow threshold / sessions with route-ready metric',
    purpose: 'Detecta cuanto del trafico navega en una experiencia probablemente friccional.',
    windows: ['daily', 'weekly', 'monthly'],
    segments: ['entry_source', 'visit_context', 'visitor_type', 'route_name'],
    businessValidation: {
      status: 'aligned',
      sources: BUSINESS_VALIDATION_SOURCES.performance.slice(),
    },
  }),
  defineKpi({
    id: 'fast_route_purchase_session_rate',
    label: 'Conversion en sesiones rapidas',
    family: 'performance',
    type: 'derived',
    priority: true,
    unit: 'rate',
    sourceTables: ['sessions_fact'],
    sourceEvents: ['performance_summary', 'purchase'],
    formula: 'purchase sessions among sessions below the slow route-ready threshold',
    purpose: 'Relaciona performance sana con conversion comercial.',
    windows: ['weekly', 'monthly'],
    segments: ['entry_source', 'visit_context', 'visitor_type', 'route_name'],
    businessValidation: {
      status: 'aligned',
      sources: BUSINESS_VALIDATION_SOURCES.performance.slice(),
    },
  }),
  defineKpi({
    id: 'slow_route_purchase_session_rate',
    label: 'Conversion en sesiones lentas',
    family: 'performance',
    type: 'derived',
    priority: true,
    unit: 'rate',
    sourceTables: ['sessions_fact'],
    sourceEvents: ['performance_summary', 'purchase'],
    formula: 'purchase sessions among sessions above the slow route-ready threshold',
    purpose: 'Permite contrastar si la lentitud coincide con menor cierre comercial.',
    windows: ['weekly', 'monthly'],
    segments: ['entry_source', 'visit_context', 'visitor_type', 'route_name'],
    businessValidation: {
      status: 'aligned',
      sources: BUSINESS_VALIDATION_SOURCES.performance.slice(),
    },
  }),
  defineKpi({
    id: 'performance_conversion_gap',
    label: 'Brecha de conversion por performance',
    family: 'performance',
    type: 'derived',
    priority: true,
    unit: 'rate_delta',
    sourceTables: ['sessions_fact'],
    sourceEvents: ['performance_summary', 'purchase'],
    formula: 'fast_route_purchase_session_rate - slow_route_purchase_session_rate',
    purpose: 'Sintetiza la diferencia comercial entre sesiones rapidas y lentas.',
    windows: ['weekly', 'monthly'],
    segments: ['entry_source', 'visit_context', 'visitor_type', 'route_name'],
    businessValidation: {
      status: 'aligned',
      sources: BUSINESS_VALIDATION_SOURCES.performance.slice(),
    },
  }),
]);

function defineKpi(input) {
  return Object.freeze(Object.assign({
    priority: false,
    windows: ['weekly'],
    segments: ['entry_source', 'visit_context', 'visitor_type', 'route_name'],
    sourceTables: [],
    sourceEvents: [],
  }, input));
}

function normalizeText(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed || fallback;
}

function toNumber(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function toRoundedNumber(value, digits = 4) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  const factor = Math.pow(10, digits);
  return Math.round(numericValue * factor) / factor;
}

function toRate(numerator, denominator, digits = 4) {
  if (!(denominator > 0)) {
    return 0;
  }

  return toRoundedNumber(numerator / denominator, digits);
}

function average(values, digits = 0) {
  const numericValues = (Array.isArray(values) ? values : []).filter((value) =>
    typeof value === 'number' && Number.isFinite(value)
  );

  if (!numericValues.length) {
    return null;
  }

  const total = numericValues.reduce((sum, value) => sum + value, 0);
  return toRoundedNumber(total / numericValues.length, digits);
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

function toTimeMs(value) {
  const timestamp = Date.parse(normalizeText(value));
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function diffMs(startAt, endAt) {
  const startMs = toTimeMs(startAt);
  const endMs = toTimeMs(endAt);

  if (!(startMs > 0) || !(endMs > 0) || endMs < startMs) {
    return null;
  }

  return endMs - startMs;
}

function compareEventRecords(left, right) {
  const leftTime = toTimeMs(left && left.occurred_at);
  const rightTime = toTimeMs(right && right.occurred_at);

  if (leftTime !== rightTime) {
    return leftTime - rightTime;
  }

  return toNumber(left && left.__raw_index) - toNumber(right && right.__raw_index);
}

function compareRowsDescending(left, right, valueKey) {
  const leftValue = toNumber(left && left[valueKey]);
  const rightValue = toNumber(right && right[valueKey]);

  if (leftValue !== rightValue) {
    return rightValue - leftValue;
  }

  return normalizeText(left && left.label || left && left.item_name || left && left.segment_value)
    .localeCompare(normalizeText(right && right.label || right && right.item_name || right && right.segment_value));
}

function getDefinition(metricId) {
  return KPI_DEFINITIONS.find((definition) => definition.id === metricId) || null;
}

function buildVisitorIndex(visitorsFact) {
  return new Map((Array.isArray(visitorsFact) ? visitorsFact : []).map((visitor) => [
    normalizeText(visitor && visitor.visitor_id, 'visitor_unknown'),
    visitor,
  ]));
}

function resolveVisitorType(session, visitorIndex) {
  const sequence = toNumber(session && session.session_sequence);
  if (sequence > 1) {
    return 'returning';
  }

  const visitor = visitorIndex.get(normalizeText(session && session.visitor_id, 'visitor_unknown')) || null;
  if (!visitor || toNumber(visitor.session_count) <= 1) {
    return 'new';
  }

  const firstSeenAt = normalizeText(visitor.first_seen_at);
  const startedAt = normalizeText(session && session.started_at);
  if (!firstSeenAt || !startedAt) {
    return 'returning';
  }

  return startedAt === firstSeenAt ? 'new' : 'returning';
}

function buildJourneyIndex(eventsFact, sessionsFact, visitorsFact) {
  const visitorIndex = buildVisitorIndex(visitorsFact);
  const journeyIndex = new Map();

  (Array.isArray(sessionsFact) ? sessionsFact : []).forEach((session) => {
    const sessionId = normalizeText(session && session.session_id, 'session_unknown');
    journeyIndex.set(sessionId, {
      session_id: sessionId,
      visitor_id: normalizeText(session && session.visitor_id, 'visitor_unknown'),
      entry_source: normalizeText(session && session.entry_source, 'unknown'),
      visit_context: normalizeText(session && (session.visit_context_final || session.visit_context_initial), 'unknown'),
      route_name: normalizeText(session && (session.first_route_name || (Array.isArray(session.route_names) ? session.route_names[0] : 'unknown')), 'unknown'),
      traffic_class: normalizeText(session && session.traffic_class, 'unknown'),
      visitor_type: resolveVisitorType(session, visitorIndex),
      item_detail_open_count: toNumber(session && session.item_detail_open_count),
      unique_detail_open_count: 0,
      cta_click_count: toNumber(session && session.cta_click_count),
      add_to_cart_count: toNumber(session && session.add_to_cart_count),
      begin_checkout_count: toNumber(session && session.begin_checkout_count),
      purchase_count: toNumber(session && session.purchase_count),
      purchase_value_total: toNumber(session && session.purchase_value_total),
      wifi_assist_shown_count: toNumber(session && session.wifi_assist_shown_count),
      wifi_assist_copy_password_count: toNumber(session && session.wifi_assist_copy_password_count),
      wifi_assist_cta_click_count: toNumber(session && session.wifi_assist_cta_click_count),
      has_confirmed_wifi: Boolean(session && session.has_confirmed_wifi),
      average_route_ready_ms: typeof (session && session.average_route_ready_ms) === 'number'
        ? session.average_route_ready_ms
        : null,
      has_purchase: Boolean(session && session.has_purchase),
      has_add_to_cart: Boolean(session && session.has_add_to_cart),
      has_begin_checkout: toNumber(session && session.begin_checkout_count) > 0,
      has_detail_open: toNumber(session && session.item_detail_open_count) > 0,
      _detailCounter: 0,
      _uniqueItems: [],
      _firstDetailAt: '',
      _firstAddToCartAt: '',
      _firstPurchaseAt: '',
      detail_opens_before_add_to_cart: null,
      detail_opens_before_purchase: null,
      time_from_first_detail_to_add_to_cart_ms: null,
      time_from_first_detail_to_purchase_ms: null,
    });
  });

  (Array.isArray(eventsFact) ? eventsFact : [])
    .slice()
    .sort(compareEventRecords)
    .forEach((eventPayload) => {
      const sessionId = normalizeText(eventPayload && eventPayload.session_id, 'session_unknown');
      const journey = journeyIndex.get(sessionId);
      if (!journey) {
        return;
      }

      const occurredAt = normalizeText(eventPayload && eventPayload.occurred_at);
      switch (normalizeText(eventPayload && eventPayload.event_name)) {
        case 'item_detail_open':
          journey._detailCounter += 1;
          uniquePush(journey._uniqueItems, eventPayload.item_id);
          if (!journey._firstDetailAt) {
            journey._firstDetailAt = occurredAt;
          }
          break;
        case 'add_to_cart':
          if (!journey._firstAddToCartAt) {
            journey._firstAddToCartAt = occurredAt;
          }
          if (journey.detail_opens_before_add_to_cart === null) {
            journey.detail_opens_before_add_to_cart = journey._detailCounter;
          }
          break;
        case 'purchase':
          if (!journey._firstPurchaseAt) {
            journey._firstPurchaseAt = occurredAt;
          }
          if (journey.detail_opens_before_purchase === null) {
            journey.detail_opens_before_purchase = journey._detailCounter;
          }
          break;
        default:
          break;
      }
    });

  journeyIndex.forEach((journey) => {
    journey.unique_detail_open_count = journey._uniqueItems.length;
    if (!journey.item_detail_open_count && journey._detailCounter > 0) {
      journey.item_detail_open_count = journey._detailCounter;
      journey.has_detail_open = true;
    }
    journey.time_from_first_detail_to_add_to_cart_ms = diffMs(journey._firstDetailAt, journey._firstAddToCartAt);
    journey.time_from_first_detail_to_purchase_ms = diffMs(journey._firstDetailAt, journey._firstPurchaseAt);
    delete journey._detailCounter;
    delete journey._uniqueItems;
    delete journey._firstDetailAt;
    delete journey._firstAddToCartAt;
    delete journey._firstPurchaseAt;
  });

  return journeyIndex;
}

function shouldIncludeSession(session, scopeMode) {
  const normalizedScopeMode = normalizeText(scopeMode, 'all_traffic');
  if (normalizedScopeMode !== 'business_only') {
    return true;
  }

  const trafficClass = normalizeText(session && session.traffic_class, 'unknown');
  return !NON_BUSINESS_TRAFFIC_CLASSES.has(trafficClass);
}

function filterSelectedSessions(sessionsFact, scopeMode) {
  return (Array.isArray(sessionsFact) ? sessionsFact : []).filter((session) => shouldIncludeSession(session, scopeMode));
}

function filterSelectedEvents(eventsFact, selectedSessionIds) {
  return (Array.isArray(eventsFact) ? eventsFact : []).filter((eventPayload) =>
    selectedSessionIds.has(normalizeText(eventPayload && eventPayload.session_id, 'session_unknown'))
  );
}

function filterSelectedVisitors(visitorsFact, selectedVisitorIds) {
  return (Array.isArray(visitorsFact) ? visitorsFact : []).filter((visitor) =>
    selectedVisitorIds.has(normalizeText(visitor && visitor.visitor_id, 'visitor_unknown'))
  );
}

function normalizeFilters(filters) {
  const source = filters && typeof filters === 'object' ? filters : {};
  return {
    entry_source: normalizeText(source.entry_source || source.entrySource || source.channel || source.source || 'all', 'all'),
    visit_context: normalizeText(source.visit_context || source.visitContext || 'all', 'all'),
    visitor_type: normalizeText(source.visitor_type || source.visitorType || 'all', 'all'),
    route_name: normalizeText(source.route_name || source.routeName || 'all', 'all'),
    device_type: normalizeText(source.device_type || source.deviceType || 'all', 'all'),
  };
}

function matchesJourneyFilters(journey, filters) {
  const normalizedFilters = normalizeFilters(filters);
  const activePairs = [
    ['entry_source', normalizeText(journey && journey.entry_source, 'unknown')],
    ['visit_context', normalizeText(journey && journey.visit_context, 'unknown')],
    ['visitor_type', normalizeText(journey && journey.visitor_type, 'unknown')],
    ['route_name', normalizeText(journey && journey.route_name, 'unknown')],
  ];

  return activePairs.every(([key, value]) => {
    const expectedValue = normalizeText(normalizedFilters[key], 'all');
    return !expectedValue || expectedValue === 'all' || expectedValue === value;
  });
}

function buildJourneySubset(journeyIndex, sessionIds) {
  return Array.from(sessionIds).map((sessionId) => journeyIndex.get(sessionId)).filter(Boolean);
}

function groupSessionIds(journeys, segmentId) {
  return journeys.reduce((accumulator, journey) => {
    const segmentValue = resolveSegmentValue(journey, segmentId);
    if (!accumulator[segmentValue]) {
      accumulator[segmentValue] = [];
    }
    accumulator[segmentValue].push(journey.session_id);
    return accumulator;
  }, {});
}

function resolveSegmentValue(journey, segmentId) {
  switch (segmentId) {
    case 'entry_source':
      return normalizeText(journey && journey.entry_source, 'unknown');
    case 'visit_context':
      return normalizeText(journey && journey.visit_context, 'unknown');
    case 'visitor_type':
      return normalizeText(journey && journey.visitor_type, 'unknown');
    case 'route_name':
      return normalizeText(journey && journey.route_name, 'unknown');
    default:
      return 'unknown';
  }
}

function countEvents(eventsFact, eventName) {
  return (Array.isArray(eventsFact) ? eventsFact : []).filter((eventPayload) =>
    normalizeText(eventPayload && eventPayload.event_name) === eventName
  ).length;
}

function buildMetricValues(journeys, eventsFact, options = {}) {
  const slowRouteReadyMs = toNumber(options.slowRouteReadyMs) || DEFAULT_SLOW_ROUTE_READY_MS;
  const selectedJourneys = Array.isArray(journeys) ? journeys : [];
  const selectedEvents = Array.isArray(eventsFact) ? eventsFact : [];
  const sessionCount = selectedJourneys.length;
  const uniqueVisitorCount = new Set(selectedJourneys.map((journey) => normalizeText(journey && journey.visitor_id, 'visitor_unknown'))).size;
  const returningVisitorCount = new Set(
    selectedJourneys
      .filter((journey) => normalizeText(journey && journey.visitor_type) === 'returning')
      .map((journey) => normalizeText(journey && journey.visitor_id, 'visitor_unknown'))
  ).size;
  const sessionsWithCta = selectedJourneys.filter((journey) => toNumber(journey && journey.cta_click_count) > 0).length;
  const sessionsWithDetail = selectedJourneys.filter((journey) => Boolean(journey && journey.has_detail_open)).length;
  const sessionsWithAdd = selectedJourneys.filter((journey) => Boolean(journey && journey.has_add_to_cart)).length;
  const sessionsWithCheckout = selectedJourneys.filter((journey) => Boolean(journey && journey.has_begin_checkout)).length;
  const sessionsWithPurchase = selectedJourneys.filter((journey) => Boolean(journey && journey.has_purchase)).length;
  const qrSessions = selectedJourneys.filter((journey) => normalizeText(journey && journey.entry_source) === 'qr').length;
  const confirmedWifiSessions = selectedJourneys.filter((journey) => Boolean(journey && journey.has_confirmed_wifi)).length;
  const sessionsWithWifiAssistShown = selectedJourneys.filter((journey) => toNumber(journey && journey.wifi_assist_shown_count) > 0);
  const sessionsWithWifiAssistAction = selectedJourneys.filter((journey) =>
    toNumber(journey && journey.wifi_assist_copy_password_count) > 0 ||
    toNumber(journey && journey.wifi_assist_cta_click_count) > 0
  ).length;
  const journeysWithRouteReady = selectedJourneys.filter((journey) =>
    typeof (journey && journey.average_route_ready_ms) === 'number' && Number.isFinite(journey.average_route_ready_ms)
  );
  const fastJourneys = journeysWithRouteReady.filter((journey) => journey.average_route_ready_ms < slowRouteReadyMs);
  const slowJourneys = journeysWithRouteReady.filter((journey) => journey.average_route_ready_ms >= slowRouteReadyMs);
  const purchaseValueTotal = toRoundedNumber(
    selectedJourneys.reduce((sum, journey) => sum + toNumber(journey && journey.purchase_value_total), 0),
    2
  );
  const purchaseTotal = selectedJourneys.reduce((sum, journey) => sum + toNumber(journey && journey.purchase_count), 0);

  return {
    sessions_total: sessionCount,
    unique_visitors_total: uniqueVisitorCount,
    returning_visitor_rate: toRate(returningVisitorCount, uniqueVisitorCount),
    qr_session_share: toRate(qrSessions, sessionCount),
    cta_click_total: countEvents(selectedEvents, 'cta_click'),
    cta_engagement_rate: toRate(sessionsWithCta, sessionCount),
    item_impression_total: countEvents(selectedEvents, 'item_impression'),
    item_detail_open_total: countEvents(selectedEvents, 'item_detail_open'),
    detail_open_session_rate: toRate(sessionsWithDetail, sessionCount),
    detail_opens_per_session: toRoundedNumber(
      selectedJourneys.reduce((sum, journey) => sum + toNumber(journey && journey.item_detail_open_count), 0) / Math.max(sessionCount, 1),
      4
    ),
    unique_detail_opens_per_session: average(
      selectedJourneys.map((journey) => toNumber(journey && journey.unique_detail_open_count)),
      4
    ) || 0,
    add_to_cart_total: countEvents(selectedEvents, 'add_to_cart'),
    detail_to_cart_session_rate: toRate(sessionsWithAdd, sessionsWithDetail),
    begin_checkout_total: countEvents(selectedEvents, 'begin_checkout'),
    cart_to_checkout_session_rate: toRate(sessionsWithCheckout, sessionsWithAdd),
    purchase_total: purchaseTotal,
    purchase_session_rate: toRate(sessionsWithPurchase, sessionCount),
    checkout_to_purchase_session_rate: toRate(sessionsWithPurchase, sessionsWithCheckout),
    purchase_value_total: purchaseValueTotal,
    average_order_value: toRoundedNumber(purchaseValueTotal / Math.max(purchaseTotal, 1), 2),
    detail_opens_before_purchase: average(
      selectedJourneys.map((journey) => journey.detail_opens_before_purchase).filter((value) => value !== null),
      4
    ) || 0,
    time_from_first_detail_to_purchase_ms: average(
      selectedJourneys.map((journey) => journey.time_from_first_detail_to_purchase_ms).filter((value) => value !== null),
      0
    ) || 0,
    in_store_confirmation_rate: toRate(confirmedWifiSessions, qrSessions),
    wifi_assist_engagement_rate: toRate(sessionsWithWifiAssistAction, sessionsWithWifiAssistShown.length),
    average_route_ready_ms: average(
      journeysWithRouteReady.map((journey) => journey.average_route_ready_ms),
      0
    ) || 0,
    slow_session_rate: toRate(slowJourneys.length, journeysWithRouteReady.length),
    fast_route_purchase_session_rate: toRate(
      fastJourneys.filter((journey) => Boolean(journey && journey.has_purchase)).length,
      fastJourneys.length
    ),
    slow_route_purchase_session_rate: toRate(
      slowJourneys.filter((journey) => Boolean(journey && journey.has_purchase)).length,
      slowJourneys.length
    ),
    performance_conversion_gap: 0,
  };
}

function buildMetricOutput(metricValues) {
  const output = {};

  KPI_DEFINITIONS.forEach((definition) => {
    output[definition.id] = {
      value: Object.prototype.hasOwnProperty.call(metricValues, definition.id)
        ? metricValues[definition.id]
        : null,
      unit: definition.unit,
      type: definition.type,
      family: definition.family,
      priority: Boolean(definition.priority),
      sourceEvents: definition.sourceEvents.slice(),
      sourceTables: definition.sourceTables.slice(),
    };
  });

  if (output.performance_conversion_gap) {
    const fastValue = output.fast_route_purchase_session_rate
      ? toNumber(output.fast_route_purchase_session_rate.value)
      : 0;
    const slowValue = output.slow_route_purchase_session_rate
      ? toNumber(output.slow_route_purchase_session_rate.value)
      : 0;
    output.performance_conversion_gap.value = toRoundedNumber(fastValue - slowValue, 4);
  }

  return output;
}

function buildSegmentSnapshots(journeyIndex, eventsFact, options) {
  const journeys = Array.from(journeyIndex.values());
  const snapshots = {};

  STANDARD_SEGMENTS.forEach((segmentDefinition) => {
    if (segmentDefinition.status !== 'available') {
      snapshots[segmentDefinition.id] = {
        status: segmentDefinition.status,
        label: segmentDefinition.label,
        description: segmentDefinition.description,
        reason: normalizeText(segmentDefinition.reason),
        values: {},
      };
      return;
    }

    const groupedSessionIds = groupSessionIds(journeys, segmentDefinition.id);
    const values = {};

    Object.keys(groupedSessionIds).sort().forEach((segmentValue) => {
      const sessionIds = new Set(groupedSessionIds[segmentValue]);
      const subsetJourneys = buildJourneySubset(journeyIndex, sessionIds);
      const subsetEvents = filterSelectedEvents(eventsFact, sessionIds);
      values[segmentValue] = buildMetricOutput(buildMetricValues(subsetJourneys, subsetEvents, options));
    });

    snapshots[segmentDefinition.id] = {
      status: 'available',
      label: segmentDefinition.label,
      description: segmentDefinition.description,
      values,
    };
  });

  return snapshots;
}

function buildItemLeaderboards(eventsFact, options = {}) {
  const limit = Math.max(1, Math.round(toNumber(options.limit) || 10));
  const rowsByItem = new Map();
  const itemMeta = new Map();

  function getRow(itemId) {
    const normalizedItemId = normalizeText(itemId, 'item_unknown');
    if (!rowsByItem.has(normalizedItemId)) {
      rowsByItem.set(normalizedItemId, {
        item_id: normalizedItemId,
        item_name: normalizedItemId,
        category: 'unknown',
        impressions: 0,
        detail_opens: 0,
        add_to_cart: 0,
        purchase_units: 0,
        purchase_value: 0,
      });
    }
    return rowsByItem.get(normalizedItemId);
  }

  function rememberMeta(itemId, itemName, category) {
    const normalizedItemId = normalizeText(itemId, 'item_unknown');
    const nextMeta = {
      item_name: normalizeText(itemName, normalizedItemId),
      category: normalizeText(category, 'unknown'),
    };
    itemMeta.set(normalizedItemId, nextMeta);
    const row = getRow(normalizedItemId);
    row.item_name = nextMeta.item_name;
    row.category = nextMeta.category;
  }

  (Array.isArray(eventsFact) ? eventsFact : []).forEach((eventPayload) => {
    const eventName = normalizeText(eventPayload && eventPayload.event_name);
    if (eventName === 'item_impression' || eventName === 'item_detail_open' || eventName === 'add_to_cart') {
      const itemId = normalizeText(eventPayload && eventPayload.item_id, 'item_unknown');
      rememberMeta(itemId, eventPayload.item_name, eventPayload.category);
      const row = getRow(itemId);
      if (eventName === 'item_impression') {
        row.impressions += 1;
      } else if (eventName === 'item_detail_open') {
        row.detail_opens += 1;
      } else if (eventName === 'add_to_cart') {
        row.add_to_cart += toNumber(eventPayload.quantity) || 1;
      }
      return;
    }

    if (eventName === 'purchase') {
      const items = Array.isArray(eventPayload && eventPayload.items) ? eventPayload.items : [];
      items.forEach((item) => {
        const itemId = normalizeText(item && item.item_id, 'item_unknown');
        const knownMeta = itemMeta.get(itemId) || null;
        rememberMeta(
          itemId,
          knownMeta ? knownMeta.item_name : itemId,
          knownMeta ? knownMeta.category : 'unknown'
        );
        const row = getRow(itemId);
        const quantity = Math.max(1, Math.round(toNumber(item && item.quantity) || 1));
        row.purchase_units += quantity;
        row.purchase_value += toRoundedNumber(toNumber(item && item.price) * quantity, 2);
      });
    }
  });

  const rows = Array.from(rowsByItem.values()).map((row) => Object.assign({}, row, {
    detail_open_rate: toRate(row.detail_opens, row.impressions),
    add_to_cart_rate: toRate(row.add_to_cart, row.detail_opens),
  }));

  return {
    by_impressions: rows.slice().sort((left, right) => compareRowsDescending(left, right, 'impressions')).slice(0, limit),
    by_detail_opens: rows.slice().sort((left, right) => compareRowsDescending(left, right, 'detail_opens')).slice(0, limit),
    by_add_to_cart: rows.slice().sort((left, right) => compareRowsDescending(left, right, 'add_to_cart')).slice(0, limit),
    by_purchase_units: rows.slice().sort((left, right) => compareRowsDescending(left, right, 'purchase_units')).slice(0, limit),
  };
}

function buildCtaLeaderboard(eventsFact, options = {}) {
  const limit = Math.max(1, Math.round(toNumber(options.limit) || 10));
  const rowsByKey = new Map();

  (Array.isArray(eventsFact) ? eventsFact : []).forEach((eventPayload) => {
    if (normalizeText(eventPayload && eventPayload.event_name) !== 'cta_click') {
      return;
    }

    const ctaId = normalizeText(eventPayload && eventPayload.cta_id, 'cta_unknown');
    const ctaLabel = normalizeText(eventPayload && eventPayload.cta_label, ctaId);
    const routeName = normalizeText(eventPayload && eventPayload.route_name, 'unknown');
    const ctaCategory = normalizeText(eventPayload && eventPayload.cta_category, 'unknown');
    const key = [ctaId, routeName, ctaCategory].join('|');

    if (!rowsByKey.has(key)) {
      rowsByKey.set(key, {
        cta_id: ctaId,
        cta_label: ctaLabel,
        cta_category: ctaCategory,
        route_name: routeName,
        clicks: 0,
      });
    }

    rowsByKey.get(key).clicks += 1;
  });

  return Array.from(rowsByKey.values())
    .sort((left, right) => compareRowsDescending(left, right, 'clicks'))
    .slice(0, limit);
}

function buildBaseVsDerivedTable() {
  return {
    base: KPI_DEFINITIONS.filter((definition) => definition.type === 'base').map((definition) => definition.id),
    derived: KPI_DEFINITIONS.filter((definition) => definition.type === 'derived').map((definition) => definition.id),
  };
}

function buildKpiToSourceMatrix() {
  return KPI_DEFINITIONS.map((definition) => ({
    kpi_id: definition.id,
    label: definition.label,
    family: definition.family,
    type: definition.type,
    source_tables: definition.sourceTables.slice(),
    source_events: definition.sourceEvents.slice(),
  }));
}

function buildKpiCatalogSnapshot(pipelineResult, options = {}) {
  const generatedAt = normalizeText(options.generatedAt, new Date().toISOString());
  const scopeMode = normalizeText(options.scopeMode, 'all_traffic');
  const normalizedFilters = normalizeFilters(options.filters);
  const selectedSessions = filterSelectedSessions(
    pipelineResult && pipelineResult.curated ? pipelineResult.curated.sessions_fact : [],
    scopeMode
  );
  const selectedSessionIds = new Set(selectedSessions.map((session) => normalizeText(session && session.session_id, 'session_unknown')));
  const selectedEvents = filterSelectedEvents(
    pipelineResult && pipelineResult.curated ? pipelineResult.curated.events_fact : [],
    selectedSessionIds
  );
  const selectedVisitors = filterSelectedVisitors(
    pipelineResult && pipelineResult.curated ? pipelineResult.curated.visitors_fact : [],
    new Set(selectedSessions.map((session) => normalizeText(session && session.visitor_id, 'visitor_unknown')))
  );
  const allJourneyIndex = buildJourneyIndex(selectedEvents, selectedSessions, selectedVisitors);
  const filteredJourneys = Array.from(allJourneyIndex.values()).filter((journey) => matchesJourneyFilters(journey, normalizedFilters));
  const filteredJourneyIndex = new Map(filteredJourneys.map((journey) => [journey.session_id, journey]));
  const filteredSessionIds = new Set(filteredJourneys.map((journey) => journey.session_id));
  const filteredEvents = filterSelectedEvents(selectedEvents, filteredSessionIds);
  const slowRouteReadyMs = toNumber(options.slowRouteReadyMs) || DEFAULT_SLOW_ROUTE_READY_MS;
  const metricValues = buildMetricValues(filteredJourneys, filteredEvents, { slowRouteReadyMs });

  return {
    version: VERSION,
    generatedAt,
    scope: {
      mode: scopeMode,
      excludedTrafficClassesForBusiness: Array.from(NON_BUSINESS_TRAFFIC_CLASSES),
      slowRouteReadyMs,
    },
    filters: normalizedFilters,
    manifest: pipelineResult && pipelineResult.manifest ? {
      pipelineVersion: normalizeText(pipelineResult.manifest.pipeline_version, 'unknown'),
      rawEventCount: toNumber(pipelineResult.manifest.raw_event_count),
      curatedEventCount: toNumber(pipelineResult.manifest.curated_event_count),
      sessionsFactCount: toNumber(pipelineResult.manifest.sessions_fact_count),
      visitorsFactCount: toNumber(pipelineResult.manifest.visitors_fact_count),
      quarantineCount: toNumber(pipelineResult.manifest.quarantine_count),
      backfillWindow: pipelineResult.manifest.backfill_window || { from: null, to: null },
    } : {},
    windows: STANDARD_WINDOWS,
    segments: STANDARD_SEGMENTS,
    catalog: {
      definitions: KPI_DEFINITIONS,
      baseVsDerived: buildBaseVsDerivedTable(),
      kpiToSourceMatrix: buildKpiToSourceMatrix(),
      priorityMetricIds: KPI_DEFINITIONS.filter((definition) => definition.priority).map((definition) => definition.id),
    },
    metrics: {
      global: buildMetricOutput(metricValues),
      bySegment: buildSegmentSnapshots(filteredJourneyIndex, filteredEvents, { slowRouteReadyMs }),
    },
    rollups: {
      items: buildItemLeaderboards(filteredEvents, { limit: options.itemLimit }),
      ctas: buildCtaLeaderboard(filteredEvents, { limit: options.ctaLimit }),
    },
  };
}

function buildMarkdownTable(headers, rows) {
  const head = `| ${headers.join(' | ')} |`;
  const divider = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map((row) => `| ${row.join(' | ')} |`);
  return [head, divider].concat(body).join('\n');
}

function renderKpiCatalogMarkdown(snapshot) {
  const priorityRows = KPI_DEFINITIONS
    .filter((definition) => definition.priority)
    .map((definition) => [
      definition.id,
      definition.type,
      definition.family,
      definition.formula,
      definition.purpose,
    ]);
  const baseVsDerived = snapshot && snapshot.catalog ? snapshot.catalog.baseVsDerived : buildBaseVsDerivedTable();
  const sourceRows = KPI_DEFINITIONS.map((definition) => [
    definition.id,
    definition.type,
    definition.sourceTables.join(', '),
    definition.sourceEvents.join(', '),
  ]);
  const currentValueRows = KPI_DEFINITIONS
    .filter((definition) => definition.priority)
    .map((definition) => {
      const metric = snapshot && snapshot.metrics && snapshot.metrics.global
        ? snapshot.metrics.global[definition.id]
        : null;
      return [
        definition.id,
        String(metric ? metric.value : ''),
        definition.unit,
      ];
    });
  const segmentRows = STANDARD_SEGMENTS.map((segmentDefinition) => [
    segmentDefinition.id,
    segmentDefinition.label,
    segmentDefinition.status,
    normalizeText(segmentDefinition.reason, segmentDefinition.description),
  ]);

  return [
    '# Analytics KPI Catalog',
    '',
    `- Generated at: ${snapshot && snapshot.generatedAt ? snapshot.generatedAt : 'unknown'}`,
    `- Scope mode: ${snapshot && snapshot.scope ? snapshot.scope.mode : 'all_traffic'}`,
    `- Slow route-ready threshold: ${snapshot && snapshot.scope ? snapshot.scope.slowRouteReadyMs : DEFAULT_SLOW_ROUTE_READY_MS} ms`,
    '',
    '## Standard Windows',
    ...STANDARD_WINDOWS.map((windowDefinition) =>
      `- ${windowDefinition.id}: ${windowDefinition.description}`
    ),
    '',
    '## Standard Segments',
    buildMarkdownTable(
      ['Segment', 'Label', 'Status', 'Notes'],
      segmentRows
    ),
    '',
    '## Priority KPIs',
    buildMarkdownTable(
      ['KPI', 'Type', 'Family', 'Formula', 'Purpose'],
      priorityRows
    ),
    '',
    '## Base vs Derived',
    buildMarkdownTable(
      ['Class', 'Count', 'KPIs'],
      [
        ['base', String(baseVsDerived.base.length), baseVsDerived.base.join(', ')],
        ['derived', String(baseVsDerived.derived.length), baseVsDerived.derived.join(', ')],
      ]
    ),
    '',
    '## KPI To Source Matrix',
    buildMarkdownTable(
      ['KPI', 'Type', 'Source tables', 'Source events'],
      sourceRows
    ),
    '',
    '## Current Priority Snapshot',
    buildMarkdownTable(
      ['KPI', 'Value', 'Unit'],
      currentValueRows
    ),
    '',
    '## Business Validation',
    '- Priority KPIs remain tied to the analytics roadmap inputs in `analytics PBI/V1.md`, `analytics PBI/V2.md`, and `analytics PBI/Comportamiento de decision en el menu.md`.',
    '- Derived metrics are explicitly labeled as `type = derived` in the machine-readable catalog and in this Markdown export.',
    '',
  ].join('\n');
}

module.exports = {
  DEFAULT_SLOW_ROUTE_READY_MS,
  KPI_DEFINITIONS,
  STANDARD_SEGMENTS,
  STANDARD_WINDOWS,
  VERSION,
  buildCtaLeaderboard,
  buildItemLeaderboards,
  buildKpiCatalogSnapshot,
  getDefinition,
  renderKpiCatalogMarkdown,
};
