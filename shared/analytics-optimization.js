const VERSION = 'figata.analytics.optimization.v1';
const DECISION_VALUES = Object.freeze(['rollout', 'iterate', 'discard']);
const PRIORITY_ORDER = Object.freeze({
  P1: 1,
  P2: 2,
  P3: 3,
});
const EXPERIMENT_BACKLOG = Object.freeze([
  {
    experiment_id: 'menu_category_order_v1',
    priority: 'P1',
    status: 'prioritized',
    title: 'Orden de categorias en menu',
    route_name: 'menu',
    surface: 'menu_index',
    hypothesis: 'Si mostramos primero las categorias con mayor senal de decision, aumentara la apertura de detalle sin degradar conversion.',
    primary_metric: 'detail_open_session_rate',
    success_threshold: 0.22,
    min_sessions: 120,
    experiment_goal: 'increase_detail_open_session_rate',
    owner: 'product',
    guardrails: [
      { metric_id: 'purchase_session_rate', comparator: 'gte', threshold: 0.03 },
      { metric_id: 'average_route_ready_ms', comparator: 'lte', threshold: 2400 },
    ],
    variants: [
      { variant_id: 'control', label: 'Orden actual del menu' },
      { variant_id: 'variant_b', label: 'Categorias por senal de decision' },
    ],
  },
  {
    experiment_id: 'home_primary_cta_copy_v1',
    priority: 'P1',
    status: 'prioritized',
    title: 'Copy del CTA principal en home',
    route_name: 'home',
    surface: 'home_hero',
    hypothesis: 'Si el CTA principal explicita el siguiente paso comercial, subira el engagement sin dañar la compra por sesion.',
    primary_metric: 'cta_engagement_rate',
    success_threshold: 0.14,
    min_sessions: 100,
    experiment_goal: 'increase_cta_engagement_rate',
    owner: 'product',
    guardrails: [
      { metric_id: 'purchase_session_rate', comparator: 'gte', threshold: 0.025 },
      { metric_id: 'average_route_ready_ms', comparator: 'lte', threshold: 2400 },
    ],
    variants: [
      { variant_id: 'control', label: 'Copy actual del CTA' },
      { variant_id: 'variant_b', label: 'Copy mas orientado a ordenar / reservar' },
    ],
  },
  {
    experiment_id: 'menu_pairings_position_v1',
    priority: 'P2',
    status: 'prioritized',
    title: 'Posicion de maridajes en detalle',
    route_name: 'menu_detail',
    surface: 'menu_detail_pairings',
    hypothesis: 'Si los maridajes aparecen antes en el detalle, creceran add to cart y compras asistidas sin volver mas lenta la lectura.',
    primary_metric: 'detail_to_cart_session_rate',
    success_threshold: 0.08,
    min_sessions: 80,
    experiment_goal: 'increase_detail_to_cart_session_rate',
    owner: 'product',
    guardrails: [
      { metric_id: 'purchase_session_rate', comparator: 'gte', threshold: 0.03 },
      { metric_id: 'average_route_ready_ms', comparator: 'lte', threshold: 2600 },
    ],
    variants: [
      { variant_id: 'control', label: 'Maridajes abajo del contenido' },
      { variant_id: 'variant_b', label: 'Maridajes arriba del bloque editorial' },
    ],
  },
]);

function normalizeText(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed || fallback;
}

function toNumber(value, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function clampArray(list, limit) {
  if (!Array.isArray(list)) {
    return [];
  }

  const normalizedLimit = Number.isFinite(limit) && limit > 0 ? Math.round(limit) : list.length;
  return list.slice(0, normalizedLimit);
}

function sortByPriority(left, right) {
  return toNumber(PRIORITY_ORDER[left.priority], 99) - toNumber(PRIORITY_ORDER[right.priority], 99);
}

function getMetricValue(metricMap, metricId) {
  const bucket = metricMap && typeof metricMap === 'object' ? metricMap[metricId] : null;
  if (bucket && typeof bucket === 'object' && Object.prototype.hasOwnProperty.call(bucket, 'value')) {
    return toNumber(bucket.value);
  }
  return toNumber(bucket);
}

function getRouteMetricValue(kpiSnapshot, routeName, metricId) {
  const routeMetrics = kpiSnapshot &&
    kpiSnapshot.metrics &&
    kpiSnapshot.metrics.bySegment &&
    kpiSnapshot.metrics.bySegment.route_name &&
    kpiSnapshot.metrics.bySegment.route_name.values &&
    kpiSnapshot.metrics.bySegment.route_name.values[routeName]
      ? kpiSnapshot.metrics.bySegment.route_name.values[routeName]
      : null;

  if (routeMetrics) {
    return getMetricValue(routeMetrics, metricId);
  }

  return getMetricValue(kpiSnapshot && kpiSnapshot.metrics ? kpiSnapshot.metrics.global : null, metricId);
}

function compareGuardrail(value, comparator, threshold) {
  if (comparator === 'gte') {
    return value >= threshold;
  }
  if (comparator === 'lte') {
    return value <= threshold;
  }
  return false;
}

function summarizeGuardrails(experiment, kpiSnapshot) {
  return (Array.isArray(experiment.guardrails) ? experiment.guardrails : []).map(function (guardrail) {
    const currentValue = getRouteMetricValue(kpiSnapshot, experiment.route_name, guardrail.metric_id);
    return {
      metric_id: guardrail.metric_id,
      comparator: guardrail.comparator,
      threshold: guardrail.threshold,
      current_value: currentValue,
      passed: compareGuardrail(currentValue, guardrail.comparator, toNumber(guardrail.threshold)),
    };
  });
}

function evaluateExperimentDecision(experiment, kpiSnapshot, qualitySnapshot) {
  const sessionCount = getRouteMetricValue(kpiSnapshot, experiment.route_name, 'sessions_total');
  const primaryValue = getRouteMetricValue(kpiSnapshot, experiment.route_name, experiment.primary_metric);
  const guardrails = summarizeGuardrails(experiment, kpiSnapshot);
  const qualityStatus = normalizeText(
    qualitySnapshot && qualitySnapshot.current && qualitySnapshot.current.status,
    'unknown'
  );

  if (sessionCount < toNumber(experiment.min_sessions)) {
    return {
      decision: 'iterate',
      decision_reason: 'Muestra insuficiente para tomar una decision causal segura.',
      session_count: sessionCount,
      primary_value: primaryValue,
      guardrails,
      quality_status: qualityStatus,
    };
  }

  if (guardrails.some(function (guardrail) { return !guardrail.passed; })) {
    return {
      decision: 'discard',
      decision_reason: 'Al menos un guardrail fue vulnerado en la lectura base actual.',
      session_count: sessionCount,
      primary_value: primaryValue,
      guardrails,
      quality_status: qualityStatus,
    };
  }

  if (primaryValue >= toNumber(experiment.success_threshold)) {
    return {
      decision: 'rollout',
      decision_reason: 'La senal base ya soporta ejecutar la prueba y el KPI objetivo supera el umbral de exito definido.',
      session_count: sessionCount,
      primary_value: primaryValue,
      guardrails,
      quality_status: qualityStatus,
    };
  }

  return {
    decision: 'iterate',
    decision_reason: 'La hipotesis sigue siendo valida, pero el KPI primario aun no justifica rollout.',
    session_count: sessionCount,
    primary_value: primaryValue,
    guardrails,
    quality_status: qualityStatus,
  };
}

function buildExperimentTemplate(experiment) {
  const source = experiment || EXPERIMENT_BACKLOG[0];
  return {
    version: VERSION,
    required_fields: [
      'experiment_id',
      'title',
      'hypothesis',
      'route_name',
      'surface',
      'variants',
      'primary_metric',
      'guardrails',
      'decision',
    ],
    template: {
      experiment_id: source.experiment_id,
      title: source.title,
      hypothesis: source.hypothesis,
      route_name: source.route_name,
      surface: source.surface,
      variants: source.variants,
      primary_metric: source.primary_metric,
      guardrails: source.guardrails,
      decision: 'iterate',
      decision_reason: 'Documenta por que se hace rollout, iteracion o descarte.',
      success_threshold: source.success_threshold,
      min_sessions: source.min_sessions,
      owner: source.owner,
      notes: 'No ejecutar cambios sin hipotesis y guardrails explicitos.',
    },
    decision_options: DECISION_VALUES.slice(),
  };
}

function buildTopOfMoment(rollups) {
  const rows = rollups && rollups.items && Array.isArray(rollups.items.by_purchase_units)
    ? rollups.items.by_purchase_units
    : [];

  const items = clampArray(rows.map(function (row) {
    return {
      item_id: normalizeText(row.item_id),
      item_name: normalizeText(row.item_name, row.item_id || 'item'),
      category: normalizeText(row.category, 'categoria'),
      score: toNumber(row.purchase_units),
      support_metric: 'purchase_units',
    };
  }), 3);

  return {
    recommendation_id: 'top_of_moment',
    title: 'Top del momento',
    list_id: 'top_of_moment',
    basis: 'purchase_units',
    items,
    decision: items.length ? 'rollout' : 'iterate',
    decision_reason: items.length
      ? 'Hay suficiente senal de compra para mostrar un top del momento simple.'
      : 'Todavia no hay senal suficiente para un ranking confiable.',
  };
}

function buildCuriosityRescue(cohortSnapshot) {
  const rows = cohortSnapshot && Array.isArray(cohortSnapshot.curiosity_items)
    ? cohortSnapshot.curiosity_items
    : [];

  const items = clampArray(rows.map(function (row) {
    return {
      item_id: normalizeText(row.item_id),
      item_name: normalizeText(row.item_name, row.item_id || 'item'),
      category: normalizeText(row.category, 'categoria'),
      score: toNumber(row.curiosity_score),
      support_metric: 'curiosity_score',
      detail_to_purchase_gap: toNumber(row.detail_to_purchase_gap),
    };
  }).filter(function (row) {
    return row.score > 0 || row.detail_to_purchase_gap > 0;
  }), 3);

  return {
    recommendation_id: 'curiosity_rescue',
    title: 'Curiosidad alta, cierre bajo',
    list_id: 'curiosity_rescue',
    basis: 'curiosity_score',
    items,
    decision: items.length ? 'rollout' : 'discard',
    decision_reason: items.length
      ? 'Existen platos con senal clara de interes no capturado que justifican recomendaciones de rescate.'
      : 'No hay gap suficiente para una lista de rescate en esta ventana.',
  };
}

function buildComboSuggestions(rawEvents) {
  const matrix = new Map();
  const labels = new Map();

  (Array.isArray(rawEvents) ? rawEvents : []).forEach(function (eventPayload) {
    if (!eventPayload || eventPayload.event_name !== 'purchase' || !Array.isArray(eventPayload.items)) {
      return;
    }

    const items = eventPayload.items.map(function (item) {
      return {
        item_id: normalizeText(item && item.item_id),
        item_name: normalizeText(item && item.item_name, item && item.item_id),
      };
    }).filter(function (item) {
      return item.item_id;
    });

    items.forEach(function (item) {
      labels.set(item.item_id, item.item_name);
    });

    for (let leftIndex = 0; leftIndex < items.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < items.length; rightIndex += 1) {
        const pair = [items[leftIndex].item_id, items[rightIndex].item_id].sort();
        const key = pair.join('::');
        matrix.set(key, toNumber(matrix.get(key)) + 1);
      }
    }
  });

  const items = clampArray(Array.from(matrix.entries()).map(function (entry) {
    const pair = entry[0].split('::');
    return {
      item_id: pair.join('+'),
      item_name: pair.map(function (itemId) {
        return labels.get(itemId) || itemId;
      }).join(' + '),
      score: entry[1],
      support_metric: 'co_purchase_count',
    };
  }).sort(function (left, right) {
    return right.score - left.score;
  }), 3);

  return {
    recommendation_id: 'combo_sugerido',
    title: 'Combos sugeridos',
    list_id: 'combo_sugerido',
    basis: 'co_purchase_count',
    items,
    decision: items.length ? 'rollout' : 'iterate',
    decision_reason: items.length
      ? 'Ya existen patrones de co-compra suficientes para sugerir combos ligeros.'
      : 'No hay co-compras suficientes para sugerir combos con confianza.',
  };
}

function buildRecommendationSnapshot(sources) {
  const source = sources && typeof sources === 'object' ? sources : {};
  const lists = [
    buildTopOfMoment(source.kpiSnapshot && source.kpiSnapshot.rollups ? source.kpiSnapshot.rollups : {}),
    buildCuriosityRescue(source.cohortSnapshot || {}),
    buildComboSuggestions(source.rawEvents || []),
  ];

  return {
    version: VERSION,
    generated_at: normalizeText(source.generatedAt, new Date().toISOString()),
    lists,
  };
}

function buildExperimentBacklog(sources) {
  const source = sources && typeof sources === 'object' ? sources : {};
  const kpiSnapshot = source.kpiSnapshot || {};
  const qualitySnapshot = source.qualitySnapshot || {};

  return EXPERIMENT_BACKLOG.slice()
    .sort(sortByPriority)
    .map(function (experiment) {
      const decision = evaluateExperimentDecision(experiment, kpiSnapshot, qualitySnapshot);
      return Object.assign({}, experiment, {
        primary_metric_value: decision.primary_value,
        session_count: decision.session_count,
        guardrail_snapshot: decision.guardrails,
        recommended_decision: decision.decision,
        recommended_decision_reason: decision.decision_reason,
        quality_status: decision.quality_status,
      });
    });
}

function buildDecisionLog(sources) {
  const backlog = buildExperimentBacklog(sources);
  const recommendations = buildRecommendationSnapshot(sources);
  const generatedAt = normalizeText(sources && sources.generatedAt, new Date().toISOString());
  const decisions = [];

  backlog.forEach(function (experiment) {
    decisions.push({
      kind: 'experiment',
      id: experiment.experiment_id,
      title: experiment.title,
      decision: experiment.recommended_decision,
      decision_reason: experiment.recommended_decision_reason,
      primary_metric: experiment.primary_metric,
      primary_metric_value: experiment.primary_metric_value,
      session_count: experiment.session_count,
      hypothesis: experiment.hypothesis,
      guardrails: experiment.guardrail_snapshot,
      generated_at: generatedAt,
    });
  });

  recommendations.lists.forEach(function (list) {
    decisions.push({
      kind: 'recommendation',
      id: list.recommendation_id,
      title: list.title,
      decision: list.decision,
      decision_reason: list.decision_reason,
      primary_metric: list.basis,
      primary_metric_value: list.items.length ? toNumber(list.items[0].score) : 0,
      session_count: 0,
      hypothesis: `Usar ${list.title.toLowerCase()} para acelerar decision sin personalizacion compleja.`,
      guardrails: [],
      generated_at: generatedAt,
    });
  });

  return decisions;
}

function renderOptimizationMarkdown(snapshot) {
  const source = snapshot && typeof snapshot === 'object' ? snapshot : {};
  const backlog = Array.isArray(source.backlog) ? source.backlog : [];
  const recommendations = source.recommendations && Array.isArray(source.recommendations.lists)
    ? source.recommendations.lists
    : [];
  const decisionLog = Array.isArray(source.decision_log) ? source.decision_log : [];

  return [
    '# Optimization Review',
    '',
    `- Version: ${normalizeText(source.version, VERSION)}`,
    `- Generated at: ${normalizeText(source.generated_at, 'unknown')}`,
    `- Scope: ${normalizeText(source.scope_mode, 'business_only')}`,
    '',
    '## Backlog priorizado',
    '',
    ...backlog.map(function (experiment) {
      return [
        `### ${experiment.title}`,
        `- Experiment ID: ${experiment.experiment_id}`,
        `- Prioridad: ${experiment.priority}`,
        `- Hipotesis: ${experiment.hypothesis}`,
        `- KPI primario: ${experiment.primary_metric}`,
        `- Valor actual: ${experiment.primary_metric_value}`,
        `- Decision sugerida: ${experiment.recommended_decision}`,
        `- Motivo: ${experiment.recommended_decision_reason}`,
      ].join('\n');
    }),
    '',
    '## Recomendaciones ligeras',
    '',
    ...recommendations.map(function (list) {
      return [
        `### ${list.title}`,
        `- Recommendation ID: ${list.recommendation_id}`,
        `- Base: ${list.basis}`,
        `- Decision: ${list.decision}`,
        `- Motivo: ${list.decision_reason}`,
        `- Items: ${list.items.map(function (item) { return item.item_name; }).join(', ') || 'sin items'}`,
      ].join('\n');
    }),
    '',
    '## Decision log',
    '',
    ...decisionLog.map(function (entry) {
      return `- [${entry.kind}] ${entry.title}: ${entry.decision} — ${entry.decision_reason}`;
    }),
    '',
    '## Regla operativa',
    '',
    '- No ejecutar cambios sin hipotesis explicita, KPI primario y guardrails definidos.',
  ].join('\n');
}

function buildOptimizationSnapshot(sources) {
  const source = sources && typeof sources === 'object' ? sources : {};
  const backlog = buildExperimentBacklog(source);
  const recommendations = buildRecommendationSnapshot(source);
  return {
    version: VERSION,
    generated_at: normalizeText(source.generatedAt, new Date().toISOString()),
    scope_mode: normalizeText(source.scopeMode, 'business_only'),
    backlog,
    experiment_template: buildExperimentTemplate(backlog[0]),
    recommendations,
    decision_log: buildDecisionLog(source),
  };
}

module.exports = {
  VERSION,
  DECISION_VALUES,
  EXPERIMENT_BACKLOG,
  buildExperimentTemplate,
  evaluateExperimentDecision,
  buildRecommendationSnapshot,
  buildExperimentBacklog,
  buildDecisionLog,
  buildOptimizationSnapshot,
  renderOptimizationMarkdown,
};
