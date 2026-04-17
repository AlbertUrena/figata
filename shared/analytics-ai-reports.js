const analyticsGovernance = require('./analytics-governance.js');
const analyticsKpiCatalog = require('./analytics-kpi-catalog.js');

const VERSION = 'figata.analytics.ai-reports.v1';
const PROMPT_VERSION = 'figata.analytics.ai-reports.prompt.v1';
const DEFAULT_TIME_ZONE = 'America/Santo_Domingo';
const DEFAULT_PRIORITY_METRICS = Object.freeze([
  'sessions_total',
  'unique_visitors_total',
  'returning_visitor_rate',
  'cta_engagement_rate',
  'detail_open_session_rate',
  'detail_to_cart_session_rate',
  'purchase_session_rate',
  'average_route_ready_ms',
]);
const CLASSIFICATION_ORDER = Object.freeze(['observation', 'inference', 'hypothesis']);
const PRIORITY_ORDER = Object.freeze(['high', 'medium', 'low']);
const METRIC_FAMILIES_FOR_RECOMMENDATIONS = Object.freeze(['acquisition', 'commerce', 'decision', 'performance']);
const REPORT_DEFINITIONS = Object.freeze({
  weekly: {
    id: 'weekly',
    label: 'semanal',
    cadenceLabel: 'Semanal',
    historyPrefix: 'weekly',
    baselinePeriods: 4,
    schedule: {
      description: 'Cada lunes a las 07:00 America/Santo_Domingo',
      dayOfWeek: 'monday',
      hour: 7,
      minute: 0,
      timeZone: DEFAULT_TIME_ZONE,
    },
  },
  monthly: {
    id: 'monthly',
    label: 'mensual',
    cadenceLabel: 'Mensual',
    historyPrefix: 'monthly',
    baselinePeriods: 3,
    schedule: {
      description: 'Dia 1 de cada mes a las 08:00 America/Santo_Domingo',
      dayOfMonth: 1,
      hour: 8,
      minute: 0,
      timeZone: DEFAULT_TIME_ZONE,
    },
  },
});
const BUSINESS_CONTEXT = Object.freeze({
  name: 'Figata',
  market: 'Santo Domingo, Republica Dominicana',
  type: 'Restaurante italiano de pizza napolitana, vino y hospitalidad premium.',
  goals: [
    'Aumentar sesiones de alta intencion desde QR, directo e Instagram.',
    'Mejorar avance del funnel desde menu hasta checkout y compra.',
    'Detectar platos, rutas y horarios con curiosidad alta o conversion baja.',
    'Traducir metricas en acciones semanales y mensuales para operacion y socios.',
  ],
});
const DEFAULT_GUARDRAILS = Object.freeze([
  'No inventar datos ni porcentajes ausentes del payload fuente.',
  'Separar claramente observacion, inferencia e hipotesis.',
  'Toda conclusion material debe referenciar metricas concretas del periodo.',
  'No afirmar causalidad sin evidencia; usar lenguaje probabilistico cuando aplique.',
  'Escribir para lectores no tecnicos en espanol claro y accionable.',
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

function toRoundedNumber(value, digits = 4) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  const factor = Math.pow(10, digits);
  return Math.round(numericValue * factor) / factor;
}

function clampArray(list, limit) {
  if (!Array.isArray(list)) {
    return [];
  }

  const normalizedLimit = Number.isFinite(limit) && limit > 0 ? Math.round(limit) : list.length;
  return list.slice(0, normalizedLimit);
}

function padNumber(value) {
  return String(value).padStart(2, '0');
}

function parseDateOnly(value) {
  const normalized = normalizeText(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return null;
  }

  const parsed = new Date(`${normalized}T12:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}

function formatDateOnly(date) {
  if (!(date instanceof Date) || !Number.isFinite(date.getTime())) {
    return '';
  }

  return [date.getUTCFullYear(), padNumber(date.getUTCMonth() + 1), padNumber(date.getUTCDate())].join('-');
}

function shiftDays(date, deltaDays) {
  if (!(date instanceof Date) || !Number.isFinite(date.getTime())) {
    return null;
  }

  const shifted = new Date(date.getTime());
  shifted.setUTCDate(shifted.getUTCDate() + Math.round(deltaDays));
  return shifted;
}

function shiftMonths(date, deltaMonths) {
  if (!(date instanceof Date) || !Number.isFinite(date.getTime())) {
    return null;
  }

  const shifted = new Date(date.getTime());
  shifted.setUTCMonth(shifted.getUTCMonth() + Math.round(deltaMonths), 1);
  return shifted;
}

function startOfMonth(date) {
  if (!(date instanceof Date) || !Number.isFinite(date.getTime())) {
    return null;
  }

  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 12, 0, 0, 0));
}

function endOfMonth(date) {
  const monthStart = startOfMonth(date);
  if (!monthStart) {
    return null;
  }

  return new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 0, 12, 0, 0, 0));
}

function formatDisplayDate(date, timeZone = DEFAULT_TIME_ZONE) {
  if (!(date instanceof Date) || !Number.isFinite(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('es-DO', {
    timeZone,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function buildWeeklyWindow(anchorDate) {
  const safeAnchor = anchorDate || new Date();
  const anchor = parseDateOnly(formatDateOnly(safeAnchor)) || new Date(Date.UTC(safeAnchor.getUTCFullYear(), safeAnchor.getUTCMonth(), safeAnchor.getUTCDate(), 12, 0, 0, 0));
  const localDay = anchor.getUTCDay();
  const endDelta = localDay === 0 ? 7 : localDay;
  const currentEnd = shiftDays(anchor, -endDelta);
  const currentStart = shiftDays(currentEnd, -6);
  const previousEnd = shiftDays(currentStart, -1);
  const previousStart = shiftDays(previousEnd, -6);

  return {
    current: {
      from: formatDateOnly(currentStart),
      to: formatDateOnly(currentEnd),
      key: `${formatDateOnly(currentStart)}_${formatDateOnly(currentEnd)}`,
      label: `${formatDisplayDate(currentStart)} -> ${formatDisplayDate(currentEnd)}`,
    },
    previous: {
      from: formatDateOnly(previousStart),
      to: formatDateOnly(previousEnd),
      key: `${formatDateOnly(previousStart)}_${formatDateOnly(previousEnd)}`,
      label: `${formatDisplayDate(previousStart)} -> ${formatDisplayDate(previousEnd)}`,
    },
  };
}

function buildMonthlyWindow(anchorDate) {
  const safeAnchor = anchorDate || new Date();
  const anchor = parseDateOnly(formatDateOnly(safeAnchor)) || new Date(Date.UTC(safeAnchor.getUTCFullYear(), safeAnchor.getUTCMonth(), safeAnchor.getUTCDate(), 12, 0, 0, 0));
  const thisMonthStart = startOfMonth(anchor);
  const currentMonthAnchor = shiftMonths(thisMonthStart, -1);
  const previousMonthAnchor = shiftMonths(thisMonthStart, -2);
  const currentStart = startOfMonth(currentMonthAnchor);
  const currentEnd = endOfMonth(currentMonthAnchor);
  const previousStart = startOfMonth(previousMonthAnchor);
  const previousEnd = endOfMonth(previousMonthAnchor);

  return {
    current: {
      from: formatDateOnly(currentStart),
      to: formatDateOnly(currentEnd),
      key: formatDateOnly(currentStart).slice(0, 7),
      label: formatDisplayDate(currentStart).replace(/^1 /, '') + ' -> ' + formatDisplayDate(currentEnd),
    },
    previous: {
      from: formatDateOnly(previousStart),
      to: formatDateOnly(previousEnd),
      key: formatDateOnly(previousStart).slice(0, 7),
      label: formatDisplayDate(previousStart).replace(/^1 /, '') + ' -> ' + formatDisplayDate(previousEnd),
    },
  };
}

function resolveReportWindow(reportType, options = {}) {
  const definition = REPORT_DEFINITIONS[normalizeText(reportType, 'weekly')] || REPORT_DEFINITIONS.weekly;
  const anchorDate = parseDateOnly(options.anchorDate) || new Date();
  const timeZone = normalizeText(options.timeZone, DEFAULT_TIME_ZONE);
  const derivedWindow = definition.id === 'monthly'
    ? buildMonthlyWindow(anchorDate)
    : buildWeeklyWindow(anchorDate);

  return {
    reportType: definition.id,
    cadenceLabel: definition.cadenceLabel,
    timeZone,
    generatedFor: formatDateOnly(anchorDate),
    current: derivedWindow.current,
    previous: derivedWindow.previous,
    baselinePeriods: Number.isFinite(options.baselinePeriods)
      ? Math.max(0, Math.round(options.baselinePeriods))
      : definition.baselinePeriods,
    schedule: definition.schedule,
  };
}

function buildBaselineWindows(windowConfig) {
  const baselinePeriods = Number.isFinite(windowConfig && windowConfig.baselinePeriods)
    ? Math.max(0, Math.round(windowConfig.baselinePeriods))
    : 0;
  if (!baselinePeriods) {
    return [];
  }

  if (windowConfig.reportType === 'monthly') {
    const firstPeriodStart = parseDateOnly(windowConfig.previous.from);
    return Array.from({ length: baselinePeriods }, function (_entry, index) {
      const monthAnchor = shiftMonths(firstPeriodStart, -(index + 1));
      const start = startOfMonth(monthAnchor);
      const end = endOfMonth(monthAnchor);
      return {
        from: formatDateOnly(start),
        to: formatDateOnly(end),
        key: formatDateOnly(start).slice(0, 7),
        label: `${formatDisplayDate(start)} -> ${formatDisplayDate(end)}`,
      };
    });
  }

  const firstPeriodEnd = parseDateOnly(windowConfig.previous.to);
  return Array.from({ length: baselinePeriods }, function (_entry, index) {
    const end = shiftDays(firstPeriodEnd, -((index + 1) * 7));
    const start = shiftDays(end, -6);
    return {
      from: formatDateOnly(start),
      to: formatDateOnly(end),
      key: `${formatDateOnly(start)}_${formatDateOnly(end)}`,
      label: `${formatDisplayDate(start)} -> ${formatDisplayDate(end)}`,
    };
  });
}

function metricDefinition(metricId) {
  return analyticsKpiCatalog.getDefinition(metricId) || null;
}

function normalizeMetric(metricId, metricPayload) {
  const definition = metricDefinition(metricId);
  const source = metricPayload && typeof metricPayload === 'object' ? metricPayload : {};
  return {
    id: metricId,
    label: definition ? definition.label : metricId,
    unit: normalizeText(source.unit, definition ? definition.unit : 'count'),
    family: normalizeText(source.family, definition ? definition.family : 'unknown'),
    priority: Boolean(source.priority || (definition && definition.priority)),
    value: toNumber(source.value),
  };
}

function buildMetricDelta(currentValue, previousValue, unit) {
  const current = toNumber(currentValue);
  const previous = toNumber(previousValue);
  const delta = toRoundedNumber(current - previous, unit === 'count' ? 0 : 4);
  const deltaRate = previous !== 0 ? toRoundedNumber(delta / previous, 4) : null;
  let direction = 'flat';

  if (delta > 0) {
    direction = unit === 'ms' ? 'worse' : 'up';
  } else if (delta < 0) {
    direction = unit === 'ms' ? 'better' : 'down';
  }

  return {
    delta,
    deltaRate,
    direction,
  };
}

function formatMetricValue(metric) {
  const safeMetric = metric || {};
  const unit = normalizeText(safeMetric.unit, 'count');
  const value = toNumber(safeMetric.value);

  if (unit === 'rate') {
    return `${toRoundedNumber(value * 100, 1)}%`;
  }
  if (unit === 'rate_delta') {
    return `${value >= 0 ? '+' : ''}${toRoundedNumber(value * 100, 1)} pts`;
  }
  if (unit === 'currency') {
    return `DOP ${toRoundedNumber(value, 0).toLocaleString('en-US')}`;
  }
  if (unit === 'ms') {
    return `${toRoundedNumber(value, 0)} ms`;
  }
  if (unit === 'ratio') {
    return `${toRoundedNumber(value, 2)}`;
  }

  return `${toRoundedNumber(value, 0).toLocaleString('en-US')}`;
}

function formatMetricDelta(deltaPayload, unit) {
  const payload = deltaPayload || {};
  if (!Number.isFinite(payload.delta)) {
    return 'n/a';
  }

  if (unit === 'rate') {
    return `${payload.delta >= 0 ? '+' : ''}${toRoundedNumber(payload.delta * 100, 1)} pts`;
  }
  if (unit === 'rate_delta') {
    return `${payload.delta >= 0 ? '+' : ''}${toRoundedNumber(payload.delta * 100, 1)} pts`;
  }
  if (unit === 'currency') {
    return `${payload.delta >= 0 ? '+' : ''}DOP ${toRoundedNumber(payload.delta, 0).toLocaleString('en-US')}`;
  }
  if (unit === 'ms') {
    return `${payload.delta >= 0 ? '+' : ''}${toRoundedNumber(payload.delta, 0)} ms`;
  }

  return `${payload.delta >= 0 ? '+' : ''}${toRoundedNumber(payload.delta, unit === 'count' ? 0 : 2)}`;
}

function averageMetricEntries(entries) {
  const source = Array.isArray(entries) ? entries : [];
  const validEntries = source.filter(function (entry) {
    return entry && typeof entry === 'object' && Number.isFinite(toNumber(entry.value, NaN));
  });
  if (!validEntries.length) {
    return null;
  }

  const template = validEntries[0];
  const averageValue = validEntries.reduce(function (sum, entry) {
    return sum + toNumber(entry.value);
  }, 0) / validEntries.length;

  return {
    id: template.id,
    label: template.label,
    unit: template.unit,
    family: template.family,
    priority: template.priority,
    value: toRoundedNumber(averageValue, template.unit === 'count' ? 0 : 4),
  };
}

function buildMetricScorecard(currentGlobal, previousGlobal, baselineGlobal, metricIds) {
  return (Array.isArray(metricIds) ? metricIds : DEFAULT_PRIORITY_METRICS)
    .map(function (metricId) {
      const currentMetric = normalizeMetric(metricId, currentGlobal && currentGlobal[metricId]);
      const previousMetric = normalizeMetric(metricId, previousGlobal && previousGlobal[metricId]);
      const baselineMetric = baselineGlobal && baselineGlobal[metricId]
        ? normalizeMetric(metricId, baselineGlobal[metricId])
        : null;
      return {
        metric_id: metricId,
        label: currentMetric.label,
        unit: currentMetric.unit,
        family: currentMetric.family,
        current: currentMetric,
        previous: previousMetric,
        baseline: baselineMetric,
        delta_vs_previous: buildMetricDelta(currentMetric.value, previousMetric.value, currentMetric.unit),
        delta_vs_baseline: baselineMetric
          ? buildMetricDelta(currentMetric.value, baselineMetric.value, currentMetric.unit)
          : null,
      };
    });
}

function segmentMapToArray(segmentPayload, limit) {
  const values = segmentPayload && typeof segmentPayload.values === 'object' && segmentPayload.values
    ? segmentPayload.values
    : {};

  return clampArray(
    Object.keys(values)
      .map(function (key) {
        const metrics = values[key] || {};
        return {
          key,
          metrics: metrics,
          sessions_total: toNumber(metrics.sessions_total && metrics.sessions_total.value),
          purchase_session_rate: toNumber(metrics.purchase_session_rate && metrics.purchase_session_rate.value),
          detail_open_session_rate: toNumber(metrics.detail_open_session_rate && metrics.detail_open_session_rate.value),
          average_route_ready_ms: toNumber(metrics.average_route_ready_ms && metrics.average_route_ready_ms.value),
        };
      })
      .sort(function (left, right) {
        return right.sessions_total - left.sessions_total;
      }),
    limit
  );
}

function normalizeItemRows(rows, limit) {
  return clampArray((Array.isArray(rows) ? rows : []).map(function (item) {
    return {
      item_id: normalizeText(item && item.item_id, 'item_unknown'),
      item_name: normalizeText(item && item.item_name, 'Item desconocido'),
      category: normalizeText(item && item.category, 'unknown'),
      impressions: toNumber(item && item.impressions),
      detail_opens: toNumber(item && item.detail_opens),
      add_to_cart: toNumber(item && item.add_to_cart),
      purchase_units: toNumber(item && item.purchase_units),
      purchase_value: toNumber(item && item.purchase_value),
      detail_open_rate: toNumber(item && item.detail_open_rate),
      add_to_cart_rate: toNumber(item && item.add_to_cart_rate),
    };
  }), limit);
}

function normalizeCtaRows(rows, limit) {
  return clampArray((Array.isArray(rows) ? rows : []).map(function (item) {
    return {
      cta_id: normalizeText(item && item.cta_id, 'cta_unknown'),
      cta_label: normalizeText(item && item.cta_label, 'CTA desconocido'),
      clicks: toNumber(item && item.clicks),
      sessions: toNumber(item && item.sessions),
      session_rate: toNumber(item && item.session_rate),
    };
  }), limit);
}

function buildBaselineGlobalMetricMap(baselineSnapshots) {
  const snapshots = Array.isArray(baselineSnapshots) ? baselineSnapshots : [];
  const metricIndex = {};

  snapshots.forEach(function (snapshot) {
    const globalMetrics = snapshot && snapshot.kpis && snapshot.kpis.metrics ? snapshot.kpis.metrics.global || {} : {};
    Object.keys(globalMetrics).forEach(function (metricId) {
      if (!metricIndex[metricId]) {
        metricIndex[metricId] = [];
      }
      metricIndex[metricId].push(normalizeMetric(metricId, globalMetrics[metricId]));
    });
  });

  return Object.keys(metricIndex).reduce(function (accumulator, metricId) {
    accumulator[metricId] = averageMetricEntries(metricIndex[metricId]);
    return accumulator;
  }, {});
}

function buildQualitySummary(snapshot) {
  const source = snapshot || {};
  return {
    status: normalizeText(source.status, 'unknown'),
    alert_count: Array.isArray(source.alerts) ? source.alerts.length : 0,
    freshness_minutes: toNumber(source.metrics && source.metrics.freshnessMinutes, null),
    duplicate_rate: toNumber(source.metrics && source.metrics.duplicateRate, null),
    quarantine_rate: toNumber(source.metrics && source.metrics.quarantineRate, null),
    alerts: clampArray((Array.isArray(source.alerts) ? source.alerts : []).map(function (alert) {
      return {
        code: normalizeText(alert && alert.code, 'unknown'),
        severity: normalizeText(alert && alert.severity, 'info'),
        message: normalizeText(alert && alert.message, 'Sin mensaje'),
      };
    }), 6),
  };
}

function buildReportInput(options) {
  const source = options && typeof options === 'object' ? options : {};
  const windowConfig = source.windowConfig || resolveReportWindow(normalizeText(source.reportType, 'weekly'));
  const currentSnapshot = source.currentSnapshot || {};
  const previousSnapshot = source.previousSnapshot || {};
  const baselineSnapshots = Array.isArray(source.baselineSnapshots) ? source.baselineSnapshots : [];
  const baselineGlobal = buildBaselineGlobalMetricMap(baselineSnapshots);
  const currentGlobal = currentSnapshot.kpis && currentSnapshot.kpis.metrics ? currentSnapshot.kpis.metrics.global || {} : {};
  const previousGlobal = previousSnapshot.kpis && previousSnapshot.kpis.metrics ? previousSnapshot.kpis.metrics.global || {} : {};
  const scorecard = buildMetricScorecard(currentGlobal, previousGlobal, baselineGlobal, source.metricIds || DEFAULT_PRIORITY_METRICS);
  const entrySourceSegment = currentSnapshot.kpis && currentSnapshot.kpis.metrics ? currentSnapshot.kpis.metrics.bySegment && currentSnapshot.kpis.metrics.bySegment.entry_source : null;
  const routeSegment = currentSnapshot.kpis && currentSnapshot.kpis.metrics ? currentSnapshot.kpis.metrics.bySegment && currentSnapshot.kpis.metrics.bySegment.route_name : null;
  const retention = currentSnapshot.cohorts && currentSnapshot.cohorts.retention ? currentSnapshot.cohorts.retention : {};
  const timing = currentSnapshot.cohorts && currentSnapshot.cohorts.timing ? currentSnapshot.cohorts.timing : {};
  const performanceContext = currentSnapshot.cohorts && currentSnapshot.cohorts.performance_context ? currentSnapshot.cohorts.performance_context : {};
  const curiosityItems = currentSnapshot.cohorts && currentSnapshot.cohorts.curiosity_items ? currentSnapshot.cohorts.curiosity_items : [];
  const itemRollups = currentSnapshot.kpis && currentSnapshot.kpis.rollups ? currentSnapshot.kpis.rollups.items || {} : {};
  const ctaRollups = currentSnapshot.kpis && currentSnapshot.kpis.rollups ? currentSnapshot.kpis.rollups.ctas || [] : [];

  return {
    version: VERSION,
    prompt_version: PROMPT_VERSION,
    generated_at: normalizeText(source.generatedAt, new Date().toISOString()),
    report_type: windowConfig.reportType,
    cadence_label: windowConfig.cadenceLabel,
    business_context: BUSINESS_CONTEXT,
    schedule: windowConfig.schedule,
    periods: {
      current: windowConfig.current,
      previous: windowConfig.previous,
      baseline: baselineSnapshots.map(function (snapshot) {
        return snapshot.period;
      }),
    },
    guardrails: DEFAULT_GUARDRAILS.slice(),
    retention_policy_days: analyticsGovernance && analyticsGovernance.RETENTION_POLICY
      ? toNumber(analyticsGovernance.RETENTION_POLICY.ai_reports_days, 180)
      : 180,
    scorecard: scorecard,
    channels: segmentMapToArray(entrySourceSegment, 5),
    routes: segmentMapToArray(routeSegment, 5),
    items: {
      top_by_purchase: normalizeItemRows(itemRollups.by_purchase_units, 5),
      top_by_detail_open: normalizeItemRows(itemRollups.by_detail_opens, 5),
      curiosity: clampArray((Array.isArray(curiosityItems) ? curiosityItems : []).map(function (item) {
        return {
          item_id: normalizeText(item && item.item_id, 'item_unknown'),
          item_name: normalizeText(item && item.item_name, 'Item desconocido'),
          category: normalizeText(item && item.category, 'unknown'),
          detail_opens: toNumber(item && item.detail_opens),
          add_to_cart_units: toNumber(item && item.add_to_cart_units),
          purchase_units: toNumber(item && item.purchase_units),
          detail_to_purchase_gap: toNumber(item && item.detail_to_purchase_gap),
          curiosity_score: toNumber(item && item.curiosity_score),
        };
      }), 5),
    },
    ctas: normalizeCtaRows(ctaRollups, 5),
    retention: {
      overall: retention.overall || null,
      by_entry_source: clampArray(retention.by_entry_source, 5),
    },
    timing: {
      by_hour: clampArray(timing.by_hour, 5),
      by_day_of_week: clampArray(timing.by_day_of_week, 5),
    },
    performance_context: {
      by_network_type: clampArray(performanceContext.by_network_type, 5),
      by_speed_bucket: clampArray(performanceContext.by_speed_bucket, 5),
    },
    quality: {
      current: buildQualitySummary(currentSnapshot.quality),
      previous: buildQualitySummary(previousSnapshot.quality),
    },
    manifests: {
      current: currentSnapshot.pipeline && currentSnapshot.pipeline.manifest ? currentSnapshot.pipeline.manifest : {},
      previous: previousSnapshot.pipeline && previousSnapshot.pipeline.manifest ? previousSnapshot.pipeline.manifest : {},
    },
  };
}

function buildMetricReferenceMap(reportInput) {
  const scorecard = Array.isArray(reportInput && reportInput.scorecard) ? reportInput.scorecard : [];
  return scorecard.reduce(function (accumulator, row) {
    accumulator[row.metric_id] = {
      metric_id: row.metric_id,
      label: row.label,
      unit: row.unit,
      current: formatMetricValue(row.current),
      previous: formatMetricValue(row.previous),
      baseline: row.baseline ? formatMetricValue(row.baseline) : null,
      delta_vs_previous: formatMetricDelta(row.delta_vs_previous, row.unit),
      delta_vs_baseline: row.delta_vs_baseline ? formatMetricDelta(row.delta_vs_baseline, row.unit) : null,
    };
    return accumulator;
  }, {});
}

function buildPromptPayload(reportInput) {
  const metricReferenceMap = buildMetricReferenceMap(reportInput);
  return {
    business_context: reportInput.business_context,
    report_type: reportInput.report_type,
    cadence_label: reportInput.cadence_label,
    schedule: reportInput.schedule,
    periods: reportInput.periods,
    guardrails: reportInput.guardrails,
    retention_policy_days: reportInput.retention_policy_days,
    quality: reportInput.quality,
    scorecard: reportInput.scorecard,
    channels: reportInput.channels,
    routes: reportInput.routes,
    items: reportInput.items,
    ctas: reportInput.ctas,
    retention: reportInput.retention,
    timing: reportInput.timing,
    performance_context: reportInput.performance_context,
    metric_reference_map: metricReferenceMap,
  };
}

function buildPromptPlan(reportInput) {
  const promptPayload = buildPromptPayload(reportInput);
  return {
    version: PROMPT_VERSION,
    schema_name: 'figata_analytics_report',
    guardrails: DEFAULT_GUARDRAILS.slice(),
    systemPrompt: [
      'Eres un analista senior de crecimiento, UX y operaciones para Figata.',
      'Debes escribir en espanol claro, directo y accionable para lectores no tecnicos.',
      'Nunca inventes numeros. Usa solo el payload fuente.',
      'Distingue observation, inference y hypothesis.',
      'Toda conclusion material debe citar metric_refs presentes en el payload.',
      'Si la calidad de datos esta en alerta, mencionalo explicitamente.',
    ].join(' '),
    userPrompt: [
      'Genera una salida JSON estructurada para un reporte ejecutivo de analytics.',
      'Incluye executive_summary, key_findings, recommendations y watchouts.',
      'Cada finding debe tener classification, title, narrative y metric_refs.',
      'Cada recommendation debe tener priority, title, action, rationale, owner y metric_refs.',
      'No agregues markdown ni texto fuera del JSON.',
      '',
      JSON.stringify(promptPayload, null, 2),
    ].join('\n'),
    schema: {
      type: 'object',
      additionalProperties: false,
      required: ['executive_summary', 'key_findings', 'recommendations', 'watchouts'],
      properties: {
        executive_summary: {
          type: 'object',
          additionalProperties: false,
          required: ['overall_status', 'headline', 'overview'],
          properties: {
            overall_status: {
              type: 'string',
              enum: ['positive', 'mixed', 'negative', 'watch'],
            },
            headline: { type: 'string' },
            overview: { type: 'string' },
          },
        },
        key_findings: {
          type: 'array',
          minItems: 3,
          maxItems: 8,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['classification', 'title', 'narrative', 'metric_refs'],
            properties: {
              classification: {
                type: 'string',
                enum: CLASSIFICATION_ORDER.slice(),
              },
              title: { type: 'string' },
              narrative: { type: 'string' },
              metric_refs: {
                type: 'array',
                minItems: 1,
                maxItems: 4,
                items: { type: 'string' },
              },
            },
          },
        },
        recommendations: {
          type: 'array',
          minItems: 3,
          maxItems: 6,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['priority', 'title', 'action', 'rationale', 'owner', 'metric_refs'],
            properties: {
              priority: {
                type: 'string',
                enum: PRIORITY_ORDER.slice(),
              },
              title: { type: 'string' },
              action: { type: 'string' },
              rationale: { type: 'string' },
              owner: { type: 'string' },
              metric_refs: {
                type: 'array',
                minItems: 1,
                maxItems: 4,
                items: { type: 'string' },
              },
            },
          },
        },
        watchouts: {
          type: 'array',
          minItems: 0,
          maxItems: 5,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['title', 'narrative', 'metric_refs'],
            properties: {
              title: { type: 'string' },
              narrative: { type: 'string' },
              metric_refs: {
                type: 'array',
                minItems: 1,
                maxItems: 4,
                items: { type: 'string' },
              },
            },
          },
        },
      },
    },
  };
}

function buildFinding(classification, title, narrative, metricRefs) {
  return {
    classification: CLASSIFICATION_ORDER.includes(classification) ? classification : 'observation',
    title: normalizeText(title, 'Hallazgo'),
    narrative: normalizeText(narrative, 'Sin narrativa'),
    metric_refs: clampArray((Array.isArray(metricRefs) ? metricRefs : []).map(function (metricId) {
      return normalizeText(metricId);
    }).filter(Boolean), 4),
  };
}

function buildRecommendation(priority, title, action, rationale, owner, metricRefs) {
  return {
    priority: PRIORITY_ORDER.includes(priority) ? priority : 'medium',
    title: normalizeText(title, 'Recomendacion'),
    action: normalizeText(action, 'Pendiente definir accion'),
    rationale: normalizeText(rationale, 'Sin rationale'),
    owner: normalizeText(owner, 'growth'),
    metric_refs: clampArray((Array.isArray(metricRefs) ? metricRefs : []).map(function (metricId) {
      return normalizeText(metricId);
    }).filter(Boolean), 4),
  };
}

function buildWatchout(title, narrative, metricRefs) {
  return {
    title: normalizeText(title, 'Alerta'),
    narrative: normalizeText(narrative, 'Sin detalle'),
    metric_refs: clampArray((Array.isArray(metricRefs) ? metricRefs : []).map(function (metricId) {
      return normalizeText(metricId);
    }).filter(Boolean), 4),
  };
}

function generateMockNarrative(reportInput) {
  const scorecard = Array.isArray(reportInput && reportInput.scorecard) ? reportInput.scorecard : [];
  const sessionsMetric = scorecard.find(function (entry) { return entry.metric_id === 'sessions_total'; }) || scorecard[0] || null;
  const purchaseMetric = scorecard.find(function (entry) { return entry.metric_id === 'purchase_session_rate'; }) || null;
  const routeReadyMetric = scorecard.find(function (entry) { return entry.metric_id === 'average_route_ready_ms'; }) || null;
  const returningMetric = scorecard.find(function (entry) { return entry.metric_id === 'returning_visitor_rate'; }) || null;
  const topChannel = Array.isArray(reportInput && reportInput.channels) && reportInput.channels.length ? reportInput.channels[0] : null;
  const topRoute = Array.isArray(reportInput && reportInput.routes) && reportInput.routes.length ? reportInput.routes[0] : null;
  const curiosityItem = reportInput && reportInput.items && Array.isArray(reportInput.items.curiosity) && reportInput.items.curiosity.length
    ? reportInput.items.curiosity[0]
    : null;
  const qualityStatus = normalizeText(reportInput && reportInput.quality && reportInput.quality.current && reportInput.quality.current.status, 'unknown');
  const positiveSignals = [];
  const watchouts = [];
  const findings = [];
  const recommendations = [];

  if (sessionsMetric) {
    const sessionsUp = sessionsMetric.delta_vs_previous.delta > 0;
    positiveSignals.push(sessionsUp ? 'volumen de sesiones al alza' : 'volumen de sesiones estable o en retroceso');
    findings.push(buildFinding(
      'observation',
      'Cambio de volumen principal',
      `${sessionsMetric.label} ${sessionsUp ? 'subio' : 'cayo'} vs el periodo anterior (${formatMetricValue(sessionsMetric.current)} vs ${formatMetricValue(sessionsMetric.previous)}; ${formatMetricDelta(sessionsMetric.delta_vs_previous, sessionsMetric.unit)}).`,
      ['sessions_total']
    ));
  }

  if (purchaseMetric) {
    const conversionUp = purchaseMetric.delta_vs_previous.delta > 0;
    findings.push(buildFinding(
      'observation',
      'Movimiento del cierre comercial',
      `${purchaseMetric.label} ${conversionUp ? 'mejoro' : 'retrocedio'} frente al periodo anterior (${formatMetricValue(purchaseMetric.current)} vs ${formatMetricValue(purchaseMetric.previous)}).`,
      ['purchase_session_rate']
    ));
  }

  if (topChannel) {
    findings.push(buildFinding(
      'inference',
      'Canal dominante del periodo',
      `${topChannel.key} concentro ${topChannel.sessions_total} sesiones y marco el tono del periodo actual. Esto sugiere que la lectura ejecutiva debe empezar por ese canal antes de revisar el resto.`,
      ['sessions_total', 'purchase_session_rate']
    ));
  }

  if (curiosityItem) {
    findings.push(buildFinding(
      'hypothesis',
      'Curiosidad alta con cierre bajo',
      `${curiosityItem.item_name} muestra interes sin traduccion proporcional a add to cart o compra. La ficha, el orden o la oferta contextual podrian estar frenando el avance.`,
      ['detail_open_session_rate', 'detail_to_cart_session_rate']
    ));
  }

  if (routeReadyMetric && routeReadyMetric.delta_vs_previous.delta > 0) {
    watchouts.push(buildWatchout(
      'Experiencia mas lenta',
      `${routeReadyMetric.label} empeoro vs el periodo anterior (${formatMetricValue(routeReadyMetric.current)} vs ${formatMetricValue(routeReadyMetric.previous)}). Conviene vigilar si el gap de performance esta afectando conversion.`,
      ['average_route_ready_ms']
    ));
  }

  if (qualityStatus !== 'ok') {
    watchouts.push(buildWatchout(
      'Calidad de datos en vigilancia',
      `El estado de calidad actual es ${qualityStatus}. Antes de sobrerreaccionar a cambios finos, conviene revisar alertas y cobertura del periodo.`,
      ['sessions_total']
    ));
  }

  if (topChannel) {
    recommendations.push(buildRecommendation(
      'high',
      'Profundizar el canal dominante',
      `Revisar la experiencia de ${topChannel.key} en landing, copy y CTA para capturar mas valor del canal con mayor peso actual.`,
      `El canal lidera en sesiones y condiciona la lectura del periodo.`,
      'growth',
      ['sessions_total', 'purchase_session_rate']
    ));
  }

  if (curiosityItem) {
    recommendations.push(buildRecommendation(
      'high',
      'Destrabar plato curioso',
      `Revisar posicion, storytelling y apoyo visual de ${curiosityItem.item_name} para reducir el gap entre interes y avance comercial.`,
      `La curiosidad sin conversion suele esconder friccion de oferta, precio o claridad visual.`,
      'menu',
      ['detail_open_session_rate', 'detail_to_cart_session_rate']
    ));
  }

  if (routeReadyMetric) {
    recommendations.push(buildRecommendation(
      'medium',
      'Vigilar velocidad en rutas clave',
      `Monitorear la experiencia de ${topRoute ? topRoute.key : 'las rutas principales'} y priorizar mejoras si la lentitud sigue creciendo.`,
      `La performance acompana la conversion y ayuda a sostener sesiones de calidad.`,
      'product',
      ['average_route_ready_ms']
    ));
  }

  if (returningMetric) {
    recommendations.push(buildRecommendation(
      'medium',
      'Convertir retorno en habito',
      'Usar los hallazgos del periodo para reforzar puntos de reentrada y recorridos rapidos para visitantes recurrentes.',
      `La relacion con visitantes recurrentes mejora el valor del sitio como herramienta de decision repetida.`,
      'operations',
      ['returning_visitor_rate']
    ));
  }

  const overallStatus = qualityStatus === 'alert'
    ? 'watch'
    : purchaseMetric && purchaseMetric.delta_vs_previous.delta > 0
      ? 'positive'
      : 'mixed';
  const headlineParts = [
    reportInput && reportInput.cadence_label ? `${reportInput.cadence_label}` : 'Reporte',
    sessionsMetric && sessionsMetric.delta_vs_previous.delta > 0 ? 'con crecimiento de sesiones' : 'con lectura mixta de volumen',
    purchaseMetric && purchaseMetric.delta_vs_previous.delta > 0 ? 'y mejor cierre comercial' : 'y conversion bajo vigilancia',
  ];

  return {
    executive_summary: {
      overall_status: overallStatus,
      headline: headlineParts.join(' '),
      overview: `El periodo actual combina ${positiveSignals.join(', ')}. La narrativa ejecutiva debe leer primero el volumen, luego calidad comercial y finalmente riesgos de experiencia o datos.`,
    },
    key_findings: clampArray(findings, 5),
    recommendations: clampArray(recommendations, 4),
    watchouts: clampArray(watchouts, 4),
  };
}

function normalizeNarrativeOutput(rawNarrative) {
  const source = rawNarrative && typeof rawNarrative === 'object' ? rawNarrative : {};
  const executiveSummary = source.executive_summary && typeof source.executive_summary === 'object'
    ? source.executive_summary
    : {};

  return {
    executive_summary: {
      overall_status: normalizeText(executiveSummary.overall_status, 'mixed'),
      headline: normalizeText(executiveSummary.headline, 'Reporte ejecutivo de analytics'),
      overview: normalizeText(executiveSummary.overview, 'Sin resumen ejecutivo.'),
    },
    key_findings: clampArray((Array.isArray(source.key_findings) ? source.key_findings : []).map(function (finding) {
      return buildFinding(
        normalizeText(finding && finding.classification, 'observation'),
        finding && finding.title,
        finding && finding.narrative,
        finding && finding.metric_refs
      );
    }), 8),
    recommendations: clampArray((Array.isArray(source.recommendations) ? source.recommendations : []).map(function (recommendation) {
      return buildRecommendation(
        normalizeText(recommendation && recommendation.priority, 'medium'),
        recommendation && recommendation.title,
        recommendation && recommendation.action,
        recommendation && recommendation.rationale,
        recommendation && recommendation.owner,
        recommendation && recommendation.metric_refs
      );
    }), 6),
    watchouts: clampArray((Array.isArray(source.watchouts) ? source.watchouts : []).map(function (watchout) {
      return buildWatchout(watchout && watchout.title, watchout && watchout.narrative, watchout && watchout.metric_refs);
    }), 5),
  };
}

function buildMetricBullet(metricReferenceMap, metricId) {
  const reference = metricReferenceMap && metricReferenceMap[metricId] ? metricReferenceMap[metricId] : null;
  if (!reference) {
    return `- ${metricId}`;
  }

  return `- ${reference.label}: ${reference.current} (previo: ${reference.previous}; delta: ${reference.delta_vs_previous})`;
}

function buildMarkdownTable(headers, rows) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const headerLine = `| ${headers.join(' | ')} |`;
  const divider = `| ${headers.map(function () { return '---'; }).join(' | ')} |`;
  const body = safeRows.map(function (row) {
    return `| ${row.join(' | ')} |`;
  });
  return [headerLine, divider].concat(body).join('\n');
}

function renderMarkdownReport(reportBundle) {
  const bundle = reportBundle || {};
  const input = bundle.input || {};
  const narrative = bundle.narrative || {};
  const metricReferenceMap = buildMetricReferenceMap(input);
  const scorecardRows = (Array.isArray(input.scorecard) ? input.scorecard : []).map(function (row) {
    return [
      row.label,
      formatMetricValue(row.current),
      formatMetricValue(row.previous),
      row.baseline ? formatMetricValue(row.baseline) : '-',
      formatMetricDelta(row.delta_vs_previous, row.unit),
    ];
  });
  const channelRows = (Array.isArray(input.channels) ? input.channels : []).map(function (row) {
    return [
      row.key,
      String(row.sessions_total),
      `${toRoundedNumber(row.purchase_session_rate * 100, 1)}%`,
      `${toRoundedNumber(row.detail_open_session_rate * 100, 1)}%`,
      `${toRoundedNumber(row.average_route_ready_ms, 0)} ms`,
    ];
  });
  const routeRows = (Array.isArray(input.routes) ? input.routes : []).map(function (row) {
    return [
      row.key,
      String(row.sessions_total),
      `${toRoundedNumber(row.purchase_session_rate * 100, 1)}%`,
      `${toRoundedNumber(row.detail_open_session_rate * 100, 1)}%`,
      `${toRoundedNumber(row.average_route_ready_ms, 0)} ms`,
    ];
  });
  const itemRows = (input.items && Array.isArray(input.items.top_by_purchase) ? input.items.top_by_purchase : []).map(function (row) {
    return [row.item_name, row.category, String(row.impressions), String(row.detail_opens), String(row.add_to_cart), String(row.purchase_units)];
  });
  const curiosityRows = (input.items && Array.isArray(input.items.curiosity) ? input.items.curiosity : []).map(function (row) {
    return [row.item_name, row.category, String(row.detail_opens), String(row.add_to_cart_units), String(row.purchase_units), String(row.detail_to_purchase_gap)];
  });
  const timingRows = (input.timing && Array.isArray(input.timing.by_hour) ? input.timing.by_hour : []).map(function (row) {
    return [String(row.label), String(row.sessions), `${toRoundedNumber(row.purchase_session_rate * 100, 1)}%`, `${toRoundedNumber(row.average_route_ready_ms, 0)} ms`];
  });
  const retentionOverall = input.retention && input.retention.overall ? input.retention.overall : null;

  return [
    `# Reporte ${normalizeText(input.cadence_label, 'Ejecutivo')} de Analytics`,
    '',
    `- Generado: ${normalizeText(input.generated_at, 'unknown')}`,
    `- Periodo actual: ${input.periods && input.periods.current ? input.periods.current.label : 'unknown'}`,
    `- Comparacion: ${input.periods && input.periods.previous ? input.periods.previous.label : 'unknown'}`,
    `- Proveedor IA: ${bundle.provider || 'mock'}`,
    `- Modelo: ${bundle.model || 'n/a'}`,
    '',
    '## Resumen ejecutivo',
    '',
    `**${normalizeText(narrative.executive_summary && narrative.executive_summary.headline, 'Sin titular')}**`,
    '',
    normalizeText(narrative.executive_summary && narrative.executive_summary.overview, 'Sin resumen.'),
    '',
    '## KPI scorecard',
    '',
    buildMarkdownTable(['Metrica', 'Actual', 'Anterior', 'Baseline', 'Delta vs anterior'], scorecardRows),
    '',
    '## Hallazgos clave',
    '',
    ...(Array.isArray(narrative.key_findings) ? narrative.key_findings : []).map(function (finding) {
      const metrics = clampArray(finding.metric_refs, 4).map(function (metricId) {
        return buildMetricBullet(metricReferenceMap, metricId);
      }).join('\n');
      return [
        `### ${finding.title}`,
        `- Clasificacion: ${finding.classification}`,
        `- Narrativa: ${finding.narrative}`,
        metrics,
      ].join('\n');
    }),
    '',
    '## Canales',
    '',
    buildMarkdownTable(['Canal', 'Sesiones', 'Compra sesion', 'Detalle sesion', 'Route ready'], channelRows),
    '',
    '## Rutas',
    '',
    buildMarkdownTable(['Ruta', 'Sesiones', 'Compra sesion', 'Detalle sesion', 'Route ready'], routeRows),
    '',
    '## Inteligencia de menu',
    '',
    '### Top por compra',
    buildMarkdownTable(['Item', 'Categoria', 'Impresiones', 'Detalles', 'Add to cart', 'Compras'], itemRows),
    '',
    '### Curiosidad alta / cierre bajo',
    buildMarkdownTable(['Item', 'Categoria', 'Detalles', 'Add to cart', 'Compras', 'Gap'], curiosityRows),
    '',
    '## Timing y retencion',
    '',
    retentionOverall
      ? `- Retencion 7d: ${toRoundedNumber(toNumber(retentionOverall.return_7d_rate) * 100, 1)}% | Promedio sesiones/visitante: ${toRoundedNumber(retentionOverall.average_sessions_per_visitor, 2)}`
      : '- Sin resumen de retencion disponible',
    '',
    buildMarkdownTable(['Hora', 'Sesiones', 'Compra sesion', 'Route ready'], timingRows),
    '',
    '## Calidad de datos',
    '',
    `- Estado actual: ${normalizeText(input.quality && input.quality.current && input.quality.current.status, 'unknown')}`,
    `- Alertas actuales: ${toNumber(input.quality && input.quality.current && input.quality.current.alert_count, 0)}`,
    `- Freshness (min): ${toNumber(input.quality && input.quality.current && input.quality.current.freshness_minutes, 0)}`,
    '',
    '## Recomendaciones',
    '',
    ...(Array.isArray(narrative.recommendations) ? narrative.recommendations : []).map(function (recommendation) {
      const metrics = clampArray(recommendation.metric_refs, 4).map(function (metricId) {
        return buildMetricBullet(metricReferenceMap, metricId);
      }).join('\n');
      return [
        `### ${recommendation.title}`,
        `- Prioridad: ${recommendation.priority}`,
        `- Owner sugerido: ${recommendation.owner}`,
        `- Accion: ${recommendation.action}`,
        `- Rationale: ${recommendation.rationale}`,
        metrics,
      ].join('\n');
    }),
    '',
    '## Watchouts',
    '',
    ...(Array.isArray(narrative.watchouts) && narrative.watchouts.length
      ? narrative.watchouts.map(function (watchout) {
          const metrics = clampArray(watchout.metric_refs, 4).map(function (metricId) {
            return buildMetricBullet(metricReferenceMap, metricId);
          }).join('\n');
          return [`### ${watchout.title}`, watchout.narrative, metrics].join('\n');
        })
      : ['- Ninguno.']),
    '',
    '## Guardrails del prompt',
    '',
    ...(Array.isArray(input.guardrails) ? input.guardrails : []).map(function (guardrail) {
      return `- ${guardrail}`;
    }),
    '',
  ].join('\n');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderMetricRefList(metricReferenceMap, metricRefs) {
  return clampArray(metricRefs, 4).map(function (metricId) {
    const reference = metricReferenceMap[metricId];
    if (!reference) {
      return `<li>${escapeHtml(metricId)}</li>`;
    }
    return `<li><strong>${escapeHtml(reference.label)}:</strong> ${escapeHtml(reference.current)} <span class="muted">(previo ${escapeHtml(reference.previous)}; delta ${escapeHtml(reference.delta_vs_previous)})</span></li>`;
  }).join('');
}

function renderHtmlTable(headers, rows) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const head = `<thead><tr>${headers.map(function (header) { return `<th>${escapeHtml(header)}</th>`; }).join('')}</tr></thead>`;
  const body = `<tbody>${safeRows.map(function (row) {
    return `<tr>${row.map(function (cell) { return `<td>${escapeHtml(cell)}</td>`; }).join('')}</tr>`;
  }).join('')}</tbody>`;
  return `<table>${head}${body}</table>`;
}

function renderHtmlReport(reportBundle) {
  const bundle = reportBundle || {};
  const input = bundle.input || {};
  const narrative = bundle.narrative || {};
  const metricReferenceMap = buildMetricReferenceMap(input);
  const scorecardRows = (Array.isArray(input.scorecard) ? input.scorecard : []).map(function (row) {
    return [row.label, formatMetricValue(row.current), formatMetricValue(row.previous), row.baseline ? formatMetricValue(row.baseline) : '-', formatMetricDelta(row.delta_vs_previous, row.unit)];
  });
  const channelRows = (Array.isArray(input.channels) ? input.channels : []).map(function (row) {
    return [row.key, String(row.sessions_total), `${toRoundedNumber(row.purchase_session_rate * 100, 1)}%`, `${toRoundedNumber(row.detail_open_session_rate * 100, 1)}%`, `${toRoundedNumber(row.average_route_ready_ms, 0)} ms`];
  });
  const routeRows = (Array.isArray(input.routes) ? input.routes : []).map(function (row) {
    return [row.key, String(row.sessions_total), `${toRoundedNumber(row.purchase_session_rate * 100, 1)}%`, `${toRoundedNumber(row.detail_open_session_rate * 100, 1)}%`, `${toRoundedNumber(row.average_route_ready_ms, 0)} ms`];
  });
  const itemRows = (input.items && Array.isArray(input.items.top_by_purchase) ? input.items.top_by_purchase : []).map(function (row) {
    return [row.item_name, row.category, String(row.impressions), String(row.detail_opens), String(row.add_to_cart), String(row.purchase_units)];
  });
  const curiosityRows = (input.items && Array.isArray(input.items.curiosity) ? input.items.curiosity : []).map(function (row) {
    return [row.item_name, row.category, String(row.detail_opens), String(row.add_to_cart_units), String(row.purchase_units), String(row.detail_to_purchase_gap)];
  });
  const timingRows = (input.timing && Array.isArray(input.timing.by_hour) ? input.timing.by_hour : []).map(function (row) {
    return [String(row.label), String(row.sessions), `${toRoundedNumber(row.purchase_session_rate * 100, 1)}%`, `${toRoundedNumber(row.average_route_ready_ms, 0)} ms`];
  });
  const retentionOverall = input.retention && input.retention.overall ? input.retention.overall : null;

  return [
    '<!doctype html>',
    '<html lang="es">',
    '<head>',
    '  <meta charset="utf-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1">',
    `  <title>${escapeHtml(`Reporte ${normalizeText(input.cadence_label, 'Ejecutivo')} de Analytics`)}</title>`,
    '  <style>',
    '    :root { color-scheme: light; --bg: #f4f7fb; --card: #ffffff; --ink: #10203a; --muted: #5d6f87; --line: #d7e1ee; --accent: #1f6feb; --accent-soft: rgba(31, 111, 235, 0.12); }',
    '    * { box-sizing: border-box; }',
    '    body { margin: 0; font-family: "IBM Plex Sans", "Segoe UI", sans-serif; background: radial-gradient(circle at top left, #e8f1ff, #f4f7fb 48%, #eef4ef 100%); color: var(--ink); }',
    '    main { max-width: 1100px; margin: 0 auto; padding: 40px 20px 80px; }',
    '    .hero, .card { background: var(--card); border: 1px solid var(--line); border-radius: 24px; box-shadow: 0 20px 50px rgba(16, 32, 58, 0.08); }',
    '    .hero { padding: 32px; margin-bottom: 24px; }',
    '    .eyebrow { text-transform: uppercase; letter-spacing: 0.12em; font-size: 12px; color: var(--muted); }',
    '    h1, h2, h3 { margin: 0 0 12px; line-height: 1.1; }',
    '    h1 { font-size: 40px; }',
    '    h2 { font-size: 26px; }',
    '    h3 { font-size: 20px; }',
    '    p, li { line-height: 1.6; }',
    '    .muted { color: var(--muted); }',
    '    .meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-top: 20px; }',
    '    .meta .pill { background: var(--accent-soft); border-radius: 16px; padding: 12px 14px; font-size: 14px; }',
    '    section { margin-top: 20px; }',
    '    .card { padding: 24px; margin-top: 20px; }',
    '    .grid { display: grid; gap: 16px; }',
    '    .grid.two { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }',
    '    .finding { border: 1px solid var(--line); border-radius: 18px; padding: 16px; background: #fbfdff; }',
    '    .tag { display: inline-block; margin-bottom: 10px; padding: 6px 10px; border-radius: 999px; font-size: 12px; background: var(--accent-soft); color: var(--accent); text-transform: capitalize; }',
    '    table { width: 100%; border-collapse: collapse; margin-top: 12px; }',
    '    th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--line); font-size: 14px; vertical-align: top; }',
    '    th { color: var(--muted); font-weight: 600; }',
    '    ul { padding-left: 20px; }',
    '    @media (max-width: 720px) { h1 { font-size: 30px; } .hero, .card { padding: 18px; } th, td { padding: 8px; font-size: 13px; } }',
    '  </style>',
    '</head>',
    '<body>',
    '  <main>',
    '    <section class="hero">',
    `      <div class="eyebrow">Reporte ${escapeHtml(normalizeText(input.cadence_label, 'Ejecutivo'))}</div>`,
    `      <h1>${escapeHtml(normalizeText(narrative.executive_summary && narrative.executive_summary.headline, 'Reporte ejecutivo de analytics'))}</h1>`,
    `      <p>${escapeHtml(normalizeText(narrative.executive_summary && narrative.executive_summary.overview, 'Sin resumen ejecutivo.'))}</p>`,
    '      <div class="meta">',
    `        <div class="pill"><strong>Periodo actual</strong><br>${escapeHtml(input.periods && input.periods.current ? input.periods.current.label : 'unknown')}</div>`,
    `        <div class="pill"><strong>Comparacion</strong><br>${escapeHtml(input.periods && input.periods.previous ? input.periods.previous.label : 'unknown')}</div>`,
    `        <div class="pill"><strong>Proveedor IA</strong><br>${escapeHtml(bundle.provider || 'mock')}</div>`,
    `        <div class="pill"><strong>Modelo</strong><br>${escapeHtml(bundle.model || 'n/a')}</div>`,
    '      </div>',
    '    </section>',
    '    <section class="card">',
    '      <h2>KPI scorecard</h2>',
    `      ${renderHtmlTable(['Metrica', 'Actual', 'Anterior', 'Baseline', 'Delta vs anterior'], scorecardRows)}`,
    '    </section>',
    '    <section class="card">',
    '      <h2>Hallazgos clave</h2>',
    '      <div class="grid two">',
    ...(Array.isArray(narrative.key_findings) ? narrative.key_findings : []).map(function (finding) {
      return [
        '<article class="finding">',
        `  <div class="tag">${escapeHtml(finding.classification)}</div>`,
        `  <h3>${escapeHtml(finding.title)}</h3>`,
        `  <p>${escapeHtml(finding.narrative)}</p>`,
        `  <ul>${renderMetricRefList(metricReferenceMap, finding.metric_refs)}</ul>`,
        '</article>',
      ].join('');
    }),
    '      </div>',
    '    </section>',
    '    <section class="card">',
    '      <h2>Canales</h2>',
    `      ${renderHtmlTable(['Canal', 'Sesiones', 'Compra sesion', 'Detalle sesion', 'Route ready'], channelRows)}`,
    '    </section>',
    '    <section class="card">',
    '      <h2>Rutas</h2>',
    `      ${renderHtmlTable(['Ruta', 'Sesiones', 'Compra sesion', 'Detalle sesion', 'Route ready'], routeRows)}`,
    '    </section>',
    '    <section class="card">',
    '      <h2>Inteligencia de menu</h2>',
    '      <h3>Top por compra</h3>',
    `      ${renderHtmlTable(['Item', 'Categoria', 'Impresiones', 'Detalles', 'Add to cart', 'Compras'], itemRows)}`,
    '      <h3 style="margin-top:22px;">Curiosidad alta / cierre bajo</h3>',
    `      ${renderHtmlTable(['Item', 'Categoria', 'Detalles', 'Add to cart', 'Compras', 'Gap'], curiosityRows)}`,
    '    </section>',
    '    <section class="card">',
    '      <h2>Timing y retencion</h2>',
    retentionOverall
      ? `      <p><strong>Retencion 7d:</strong> ${escapeHtml(`${toRoundedNumber(toNumber(retentionOverall.return_7d_rate) * 100, 1)}%`)} <span class="muted">| Promedio sesiones/visitante: ${escapeHtml(`${toRoundedNumber(retentionOverall.average_sessions_per_visitor, 2)}`)}</span></p>`
      : '      <p class="muted">Sin resumen de retencion disponible.</p>',
    `      ${renderHtmlTable(['Hora', 'Sesiones', 'Compra sesion', 'Route ready'], timingRows)}`,
    '    </section>',
    '    <section class="card">',
    '      <h2>Recomendaciones</h2>',
    '      <div class="grid two">',
    ...(Array.isArray(narrative.recommendations) ? narrative.recommendations : []).map(function (recommendation) {
      return [
        '<article class="finding">',
        `  <div class="tag">${escapeHtml(recommendation.priority)}</div>`,
        `  <h3>${escapeHtml(recommendation.title)}</h3>`,
        `  <p><strong>Accion:</strong> ${escapeHtml(recommendation.action)}</p>`,
        `  <p><strong>Rationale:</strong> ${escapeHtml(recommendation.rationale)}</p>`,
        `  <p class="muted"><strong>Owner sugerido:</strong> ${escapeHtml(recommendation.owner)}</p>`,
        `  <ul>${renderMetricRefList(metricReferenceMap, recommendation.metric_refs)}</ul>`,
        '</article>',
      ].join('');
    }),
    '      </div>',
    '    </section>',
    '    <section class="card">',
    '      <h2>Watchouts</h2>',
    Array.isArray(narrative.watchouts) && narrative.watchouts.length
      ? narrative.watchouts.map(function (watchout) {
          return [
            '<article class="finding">',
            `  <h3>${escapeHtml(watchout.title)}</h3>`,
            `  <p>${escapeHtml(watchout.narrative)}</p>`,
            `  <ul>${renderMetricRefList(metricReferenceMap, watchout.metric_refs)}</ul>`,
            '</article>',
          ].join('');
        }).join('')
      : '<p class="muted">Sin watchouts para este periodo.</p>',
    '    </section>',
    '    <section class="card">',
    '      <h2>Guardrails del prompt</h2>',
    `      <ul>${(Array.isArray(input.guardrails) ? input.guardrails : []).map(function (guardrail) { return `<li>${escapeHtml(guardrail)}</li>`; }).join('')}</ul>`,
    '    </section>',
    '  </main>',
    '</body>',
    '</html>',
  ].join('\n');
}

function buildReportBundle(options) {
  const source = options && typeof options === 'object' ? options : {};
  const reportInput = source.reportInput || buildReportInput(source);
  const promptPlan = source.promptPlan || buildPromptPlan(reportInput);
  const narrative = normalizeNarrativeOutput(source.narrative || generateMockNarrative(reportInput));

  return {
    version: VERSION,
    generated_at: normalizeText(source.generatedAt, new Date().toISOString()),
    provider: normalizeText(source.provider, 'mock'),
    model: normalizeText(source.model, source.provider === 'openai' ? 'gpt-5.2' : 'mock-heuristic'),
    reasoning_effort: normalizeText(source.reasoningEffort, source.provider === 'openai' ? 'medium' : 'none'),
    report_type: reportInput.report_type,
    period_key: reportInput.periods && reportInput.periods.current ? reportInput.periods.current.key : 'unknown',
    prompt: {
      version: promptPlan.version,
      guardrails: promptPlan.guardrails,
      schema_name: promptPlan.schema_name,
    },
    input: reportInput,
    narrative,
  };
}

module.exports = {
  VERSION,
  PROMPT_VERSION,
  DEFAULT_TIME_ZONE,
  DEFAULT_PRIORITY_METRICS,
  REPORT_DEFINITIONS,
  DEFAULT_GUARDRAILS,
  resolveReportWindow,
  buildBaselineWindows,
  buildReportInput,
  buildPromptPlan,
  buildPromptPayload,
  buildReportBundle,
  buildMetricReferenceMap,
  buildMetricScorecard,
  formatMetricValue,
  formatMetricDelta,
  generateMockNarrative,
  normalizeNarrativeOutput,
  renderMarkdownReport,
  renderHtmlReport,
};
