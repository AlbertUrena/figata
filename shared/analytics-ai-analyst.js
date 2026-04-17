const analyticsKpiCatalog = require('./analytics-kpi-catalog.js');
const analyticsAiReports = require('./analytics-ai-reports.js');
const analyticsOpenAi = require('./analytics-openai.js');

const VERSION = 'figata.analytics.ai-analyst.v1';
const DEFAULT_MODEL = 'gpt-5.4-mini';
const DEFAULT_REASONING_EFFORT = 'low';
const MAX_MEMORY_TURNS = 6;
const MAX_QUESTION_CHARS = 600;
const MAX_CONTEXT_SECTIONS = 6;
const MAX_ESTIMATED_INPUT_TOKENS = 24000;
const RESPONSE_SCHEMA_NAME = 'figata_analytics_analyst_answer';
const SUGGESTED_QUESTIONS = Object.freeze([
  'Que cambio esta semana?',
  'Compara QR vs Instagram en intencion de compra.',
  'Que platos tienen alta curiosidad y baja compra?',
  'Que me deberia preocupar hoy?',
  'Que haria para mejorar add to cart esta semana?',
  'Resume riesgos de performance y conversion.',
]);
const QUESTION_TEMPLATES = Object.freeze([
  {
    id: 'weekly_summary',
    keywords: ['semana', 'semanal', 'cambio', 'resumen', 'paso'],
    defaultScope: 'weekly',
    mode: 'short_qa',
  },
  {
    id: 'monthly_summary',
    keywords: ['mes', 'mensual'],
    defaultScope: 'monthly',
    mode: 'guided_analysis',
  },
  {
    id: 'channel_comparison',
    keywords: ['canal', 'instagram', 'qr', 'directo', 'source', 'fuente'],
    defaultScope: 'weekly',
    mode: 'short_qa',
  },
  {
    id: 'curiosity_items',
    keywords: ['plato', 'platos', 'curiosidad', 'compra', 'menu', 'item'],
    defaultScope: 'weekly',
    mode: 'guided_analysis',
  },
  {
    id: 'performance_risk',
    keywords: ['performance', 'lento', 'velocidad', 'route ready', 'mobile', 'safari', 'hoy', 'live', 'actual'],
    defaultScope: 'live',
    mode: 'short_qa',
  },
  {
    id: 'events_route',
    keywords: ['eventos', 'evento'],
    defaultScope: 'weekly',
    mode: 'guided_analysis',
  },
]);
const ANSWER_GUARDRAILS = Object.freeze([
  'Responder en espanol claro para usuarios de negocio.',
  'No inventar datos ni atribuir causas sin evidencia.',
  'Citar evidencia concreta de reportes o snapshots.',
  'Declarar limites cuando falten datos o no exista cobertura suficiente.',
  'Mantener respuestas breves: resumen, evidencia, limites y siguientes pasos.',
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

function safeReadJson(filePath) {
  try {
    const fs = require('fs');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (_error) {
    return null;
  }
}

function estimateTokens(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value || '');
  return Math.ceil(text.length / 4);
}

function resolveQuestionTemplate(question) {
  const normalizedQuestion = normalizeText(question).toLowerCase();
  const matched = QUESTION_TEMPLATES.find(function (template) {
    return template.keywords.some(function (keyword) {
      return normalizedQuestion.indexOf(keyword) !== -1;
    });
  });

  return matched || QUESTION_TEMPLATES[0];
}

function normalizeMemoryTurns(memoryTurns) {
  return clampArray((Array.isArray(memoryTurns) ? memoryTurns : []).map(function (turn) {
    return {
      role: normalizeText(turn && turn.role, 'user'),
      text: normalizeText(turn && turn.text),
    };
  }).filter(function (turn) {
    return turn.text;
  }), MAX_MEMORY_TURNS);
}

function loadLatestReports(rootDir) {
  const path = require('path');
  const latestRoot = path.resolve(normalizeText(rootDir, path.join(process.cwd(), 'analytics-output', 'latest', 'ai-reports')));
  const indexPayload = safeReadJson(path.join(latestRoot, 'index.json')) || {};
  return ['weekly', 'monthly'].reduce(function (accumulator, reportType) {
    const entry = indexPayload[reportType] || null;
    if (!entry) {
      accumulator[reportType] = null;
      return accumulator;
    }

    const manifest = safeReadJson(entry.manifest_path || path.join(latestRoot, reportType, 'manifest.json')) || {};
    const manifestFiles = manifest.files && typeof manifest.files === 'object' ? manifest.files : {};
    const report = safeReadJson(
      entry.report_json_path ||
      manifestFiles.report_json ||
      path.join(latestRoot, reportType, 'report.json')
    );
    const promptPayload = safeReadJson(
      manifestFiles.source_payload ||
      path.join(latestRoot, reportType, 'source-payload.json')
    );
    accumulator[reportType] = report && promptPayload
      ? {
          manifest: entry,
          report,
          source_payload: promptPayload,
        }
      : null;
    return accumulator;
  }, {});
}

function metricDefinition(metricId) {
  return analyticsKpiCatalog.getDefinition(metricId) || null;
}

function buildMetricDefinitionSummary(metricIds) {
  const uniqueMetricIds = Array.from(new Set((Array.isArray(metricIds) ? metricIds : []).map(function (metricId) {
    return normalizeText(metricId);
  }).filter(Boolean)));

  return uniqueMetricIds.map(function (metricId) {
    const definition = metricDefinition(metricId);
    return definition
      ? {
          metric_id: metricId,
          label: definition.label,
          formula: definition.formula,
          purpose: definition.purpose,
        }
      : {
          metric_id: metricId,
          label: metricId,
          formula: 'unknown',
          purpose: 'No registered KPI definition.',
        };
  });
}

function pickReportByScope(reportCatalog, scope) {
  const normalizedScope = normalizeText(scope, 'weekly');
  if (normalizedScope === 'monthly') {
    return reportCatalog.monthly || reportCatalog.weekly || null;
  }
  if (normalizedScope === 'weekly') {
    return reportCatalog.weekly || reportCatalog.monthly || null;
  }
  return null;
}

function buildLiveContext(liveSnapshot) {
  if (!liveSnapshot || typeof liveSnapshot !== 'object') {
    return null;
  }

  const kpiSnapshot = liveSnapshot.kpiSnapshot || null;
  const qualitySnapshot = liveSnapshot.qualitySnapshot || null;
  const cohortSnapshot = liveSnapshot.cohortSnapshot || null;
  if (!kpiSnapshot) {
    return null;
  }

  const metrics = kpiSnapshot.metrics && kpiSnapshot.metrics.global ? kpiSnapshot.metrics.global : {};
  return {
    scope: 'live',
    label: 'Snapshot live filtrado',
    scorecard: analyticsAiReports.DEFAULT_PRIORITY_METRICS.map(function (metricId) {
      const metric = metrics[metricId] || { value: 0, unit: 'count' };
      return {
        metric_id: metricId,
        label: metricDefinition(metricId) ? metricDefinition(metricId).label : metricId,
        value: toNumber(metric.value),
        unit: normalizeText(metric.unit, metricDefinition(metricId) ? metricDefinition(metricId).unit : 'count'),
      };
    }),
    channels: kpiSnapshot.metrics && kpiSnapshot.metrics.bySegment && kpiSnapshot.metrics.bySegment.entry_source
      ? kpiSnapshot.metrics.bySegment.entry_source.values || {}
      : {},
    routes: kpiSnapshot.metrics && kpiSnapshot.metrics.bySegment && kpiSnapshot.metrics.bySegment.route_name
      ? kpiSnapshot.metrics.bySegment.route_name.values || {}
      : {},
    quality: qualitySnapshot,
    cohorts: cohortSnapshot,
  };
}

function serializeSegmentPreview(segmentValues, metricIds, limit) {
  const values = segmentValues && typeof segmentValues === 'object' ? segmentValues : {};
  return clampArray(Object.keys(values).map(function (key) {
    const bucket = values[key] || {};
    const preview = {};
    (Array.isArray(metricIds) ? metricIds : []).forEach(function (metricId) {
      preview[metricId] = bucket[metricId] && typeof bucket[metricId] === 'object'
        ? bucket[metricId].value
        : 0;
    });
    return {
      key,
      metrics: preview,
    };
  }).sort(function (left, right) {
    return toNumber(right.metrics.sessions_total) - toNumber(left.metrics.sessions_total);
  }), limit);
}

function buildRetrievedContext(request, sources) {
  const template = resolveQuestionTemplate(request.question);
  const requestedScope = normalizeText(request.scope, 'auto');
  const scope = requestedScope === 'auto'
    ? template.defaultScope
    : requestedScope;
  const reportSource = pickReportByScope(sources.reports || {}, scope);
  const liveSource = scope === 'live' ? sources.live : null;
  const sections = [];
  const metricIds = [];
  const sourceRefs = [];

  if (reportSource) {
    const bundle = reportSource.report || {};
    const payload = reportSource.source_payload || {};
    sourceRefs.push({
      kind: 'report',
      label: bundle.input && bundle.input.cadence_label ? `Reporte ${bundle.input.cadence_label.toLowerCase()}` : 'Reporte',
      period_key: bundle.period_key || 'unknown',
    });
    sections.push({
      id: 'executive_summary',
      label: 'Resumen ejecutivo reportado',
      payload: {
        executive_summary: bundle.narrative && bundle.narrative.executive_summary ? bundle.narrative.executive_summary : {},
        findings: clampArray(bundle.narrative && bundle.narrative.key_findings, 4),
        recommendations: clampArray(bundle.narrative && bundle.narrative.recommendations, 3),
      },
    });
    sections.push({
      id: 'scorecard',
      label: 'Scorecard del periodo',
      payload: clampArray(payload.scorecard, 8),
    });
    sections.push({
      id: 'channels',
      label: 'Canales principales',
      payload: clampArray(payload.channels, 4),
    });
    sections.push({
      id: 'items',
      label: 'Items y curiosidad',
      payload: {
        top_by_purchase: clampArray(payload.items && payload.items.top_by_purchase, 4),
        curiosity: clampArray(payload.items && payload.items.curiosity, 4),
      },
    });
    sections.push({
      id: 'quality',
      label: 'Calidad de datos',
      payload: payload.quality || {},
    });

    clampArray(payload.scorecard, 8).forEach(function (metricRow) {
      metricIds.push(metricRow.metric_id);
    });
    clampArray(bundle.narrative && bundle.narrative.key_findings, 5).forEach(function (finding) {
      clampArray(finding && finding.metric_refs, 4).forEach(function (metricId) {
        metricIds.push(metricId);
      });
    });
  }

  if (liveSource) {
    sourceRefs.push({
      kind: 'live_snapshot',
      label: 'Snapshot live',
      period_key: 'live',
    });
    sections.push({
      id: 'live_scorecard',
      label: 'KPIs live',
      payload: liveSource.scorecard,
    });
    sections.push({
      id: 'live_channels',
      label: 'Canales live',
      payload: serializeSegmentPreview(liveSource.channels, ['sessions_total', 'purchase_session_rate', 'average_route_ready_ms'], 4),
    });
    sections.push({
      id: 'live_routes',
      label: 'Rutas live',
      payload: serializeSegmentPreview(liveSource.routes, ['sessions_total', 'purchase_session_rate', 'average_route_ready_ms'], 4),
    });
    sections.push({
      id: 'live_quality',
      label: 'Calidad live',
      payload: liveSource.quality || {},
    });
    liveSource.scorecard.forEach(function (metricRow) {
      metricIds.push(metricRow.metric_id);
    });
  }

  return {
    template,
    scope,
    mode: normalizeText(request.mode, template.mode),
    question: normalizeText(request.question),
    memory: normalizeMemoryTurns(request.memory),
    previous_response_id: normalizeText(request.previous_response_id),
    sections: clampArray(sections, MAX_CONTEXT_SECTIONS),
    metric_definitions: buildMetricDefinitionSummary(metricIds),
    source_refs: sourceRefs,
  };
}

function buildPromptPlan(request, retrievedContext) {
  const promptPayload = {
    question: retrievedContext.question,
    mode: retrievedContext.mode,
    scope: retrievedContext.scope,
    template_id: retrievedContext.template.id,
    source_refs: retrievedContext.source_refs,
    memory: retrievedContext.memory,
    sections: retrievedContext.sections,
    metric_definitions: retrievedContext.metric_definitions,
    answer_guardrails: ANSWER_GUARDRAILS,
  };
  let estimatedInputTokens = estimateTokens(promptPayload) + estimateTokens(ANSWER_GUARDRAILS);
  const trimmedContext = Object.assign({}, promptPayload);

  while (estimatedInputTokens > MAX_ESTIMATED_INPUT_TOKENS && trimmedContext.sections.length > 1) {
    trimmedContext.sections = trimmedContext.sections.slice(0, trimmedContext.sections.length - 1);
    estimatedInputTokens = estimateTokens(trimmedContext) + estimateTokens(ANSWER_GUARDRAILS);
  }

  return {
    version: VERSION,
    schema_name: RESPONSE_SCHEMA_NAME,
    estimated_input_tokens: estimatedInputTokens,
    systemPrompt: [
      'Eres el AI Data Analyst interno de Figata.',
      'Respondes preguntas de negocio usando solo evidencia disponible en los reportes y snapshots proporcionados.',
      'Debes ser breve, concreto y honesto con los limites.',
      'No inventes metricas ni conclusiones sin evidencia.',
      'Responde siempre en espanol claro.',
    ].join(' '),
    userPrompt: JSON.stringify(trimmedContext, null, 2),
    schema: {
      type: 'object',
      additionalProperties: false,
      required: ['answer', 'evidence', 'limitations', 'follow_ups', 'question_template_id', 'response_scope', 'confidence'],
      properties: {
        answer: { type: 'string' },
        evidence: {
          type: 'array',
          minItems: 1,
          maxItems: 5,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['label', 'detail', 'metric_refs'],
            properties: {
              label: { type: 'string' },
              detail: { type: 'string' },
              metric_refs: {
                type: 'array',
                minItems: 1,
                maxItems: 4,
                items: { type: 'string' },
              },
            },
          },
        },
        limitations: {
          type: 'array',
          minItems: 0,
          maxItems: 4,
          items: { type: 'string' },
        },
        follow_ups: {
          type: 'array',
          minItems: 2,
          maxItems: 4,
          items: { type: 'string' },
        },
        question_template_id: { type: 'string' },
        response_scope: { type: 'string' },
        confidence: {
          type: 'string',
          enum: ['high', 'medium', 'low'],
        },
      },
    },
  };
}

function buildEvidence(label, detail, metricRefs) {
  return {
    label: normalizeText(label, 'Evidencia'),
    detail: normalizeText(detail, 'Sin detalle.'),
    metric_refs: clampArray((Array.isArray(metricRefs) ? metricRefs : []).map(function (metricId) {
      return normalizeText(metricId);
    }).filter(Boolean), 4),
  };
}

function summarizeScorecard(scorecard) {
  const list = Array.isArray(scorecard) ? scorecard : [];
  const sessions = list.find(function (row) { return row.metric_id === 'sessions_total'; }) || null;
  const purchase = list.find(function (row) { return row.metric_id === 'purchase_session_rate'; }) || null;
  const routeReady = list.find(function (row) { return row.metric_id === 'average_route_ready_ms'; }) || null;
  return {
    sessions,
    purchase,
    routeReady,
  };
}

function generateMockAnswer(request, retrievedContext) {
  const primarySection = retrievedContext.sections[0] || null;
  const scorecardSection = retrievedContext.sections.find(function (section) { return section.id.indexOf('scorecard') !== -1; }) || null;
  const scorecardSummary = summarizeScorecard(scorecardSection ? scorecardSection.payload : []);
  const channelsSection = retrievedContext.sections.find(function (section) { return section.id.indexOf('channels') !== -1; }) || null;
  const itemsSection = retrievedContext.sections.find(function (section) { return section.id === 'items'; }) || null;
  const qualitySection = retrievedContext.sections.find(function (section) { return section.id.indexOf('quality') !== -1; }) || null;
  const channelTop = channelsSection && Array.isArray(channelsSection.payload) && channelsSection.payload.length
    ? channelsSection.payload[0]
    : null;
  const curiosityItem = itemsSection && itemsSection.payload && Array.isArray(itemsSection.payload.curiosity) && itemsSection.payload.curiosity.length
    ? itemsSection.payload.curiosity[0]
    : null;
  const qualityStatus = qualitySection && qualitySection.payload && qualitySection.payload.current
    ? normalizeText(qualitySection.payload.current.status, 'unknown')
    : qualitySection && qualitySection.payload && qualitySection.payload.status
      ? normalizeText(qualitySection.payload.status, 'unknown')
      : 'unknown';
  const evidence = [];
  const limitations = [];
  const followUps = [];
  let answer = 'No tengo suficiente contexto para responder con precision.';
  let confidence = 'low';

  if (primarySection && primarySection.id === 'executive_summary') {
    const executiveSummary = primarySection.payload && primarySection.payload.executive_summary
      ? primarySection.payload.executive_summary
      : {};
    answer = normalizeText(executiveSummary.overview, 'El reporte mas reciente no trae un resumen ejecutivo suficiente.');
    confidence = 'medium';
  }

  if (scorecardSummary.sessions) {
    evidence.push(buildEvidence(
      'Volumen del periodo',
      `${scorecardSummary.sessions.label}: ${analyticsAiReports.formatMetricValue(scorecardSummary.sessions.current)} vs ${analyticsAiReports.formatMetricValue(scorecardSummary.sessions.previous)}.`,
      ['sessions_total']
    ));
  }

  if (scorecardSummary.purchase) {
    evidence.push(buildEvidence(
      'Conversion principal',
      `${scorecardSummary.purchase.label}: ${analyticsAiReports.formatMetricValue(scorecardSummary.purchase.current)} vs ${analyticsAiReports.formatMetricValue(scorecardSummary.purchase.previous)}.`,
      ['purchase_session_rate']
    ));
  }

  if (channelTop && channelTop.key) {
    answer = `La senal mas fuerte viene de ${channelTop.key}. Yo empezaria leyendo ese canal porque concentra ${toNumber(channelTop.metrics.sessions_total)} sesiones y condiciona la lectura del periodo.`;
    confidence = 'medium';
    evidence.push(buildEvidence(
      'Canal dominante',
      `${channelTop.key} lidera con ${toNumber(channelTop.metrics.sessions_total)} sesiones en el contexto recuperado.`,
      ['sessions_total', 'purchase_session_rate']
    ));
  }

  if (retrievedContext.template.id === 'curiosity_items' && curiosityItem) {
    answer = `${curiosityItem.item_name} aparece como el mejor candidato de curiosidad alta y cierre bajo. Tiene ${toNumber(curiosityItem.detail_opens)} detalles abiertos y ${toNumber(curiosityItem.purchase_units)} compras en el contexto recuperado.`;
    confidence = 'medium';
    evidence.push(buildEvidence(
      'Curiosidad alta / cierre bajo',
      `${curiosityItem.item_name} muestra gap ${toNumber(curiosityItem.detail_to_purchase_gap)} entre interes y compra.`,
      ['detail_open_session_rate', 'detail_to_cart_session_rate']
    ));
  }

  if (qualityStatus !== 'ok' && qualityStatus !== 'unknown') {
    limitations.push(`La calidad de datos del contexto recuperado esta en estado ${qualityStatus}.`);
  }

  if (!evidence.length) {
    evidence.push(buildEvidence(
      'Contexto limitado',
      'Solo hay contexto parcial del periodo seleccionado; conviene revisar el reporte mas reciente o un snapshot live mas especifico.',
      ['sessions_total']
    ));
  }

  if (!retrievedContext.source_refs.length) {
    limitations.push('No encontre reportes historicos ni snapshot live para esta pregunta.');
  }

  if (retrievedContext.scope !== 'live') {
    followUps.push('Quieres que lo compare con el snapshot live actual?');
  }
  followUps.push('Quieres que lo reduzca a QR vs Instagram?');
  followUps.push('Quieres recomendaciones accionables para esta senal?');

  return {
    answer,
    evidence: clampArray(evidence, 5),
    limitations: clampArray(limitations, 4),
    follow_ups: clampArray(followUps, 3),
    question_template_id: retrievedContext.template.id,
    response_scope: retrievedContext.scope,
    confidence,
  };
}

function normalizeAnswer(rawAnswer, retrievedContext) {
  const source = rawAnswer && typeof rawAnswer === 'object' ? rawAnswer : {};
  return {
    answer: normalizeText(source.answer, 'No tengo suficiente evidencia para responder.'),
    evidence: clampArray((Array.isArray(source.evidence) ? source.evidence : []).map(function (entry) {
      return buildEvidence(entry && entry.label, entry && entry.detail, entry && entry.metric_refs);
    }), 5),
    limitations: clampArray((Array.isArray(source.limitations) ? source.limitations : []).map(function (entry) {
      return normalizeText(entry);
    }).filter(Boolean), 4),
    follow_ups: clampArray((Array.isArray(source.follow_ups) ? source.follow_ups : []).map(function (entry) {
      return normalizeText(entry);
    }).filter(Boolean), 4),
    question_template_id: normalizeText(source.question_template_id, retrievedContext.template.id),
    response_scope: normalizeText(source.response_scope, retrievedContext.scope),
    confidence: normalizeText(source.confidence, 'low'),
  };
}

function resolveProvider(requestedProvider) {
  const normalized = normalizeText(requestedProvider, 'auto').toLowerCase();
  if (normalized !== 'auto') {
    return normalized;
  }

  return process.env.OPENAI_API_KEY ? 'openai' : 'mock';
}

async function buildAnswerBundle(request, options) {
  const source = options && typeof options === 'object' ? options : {};
  const normalizedRequest = {
    question: normalizeText(request && request.question).slice(0, MAX_QUESTION_CHARS),
    mode: normalizeText(request && request.mode, ''),
    scope: normalizeText(request && request.scope, 'auto'),
    memory: normalizeMemoryTurns(request && request.memory),
    previous_response_id: normalizeText(request && request.previous_response_id),
  };
  if (!normalizedRequest.question) {
    throw new Error('question is required');
  }

  const retrievedContext = buildRetrievedContext(normalizedRequest, {
    reports: source.reports || {},
    live: source.live || null,
  });
  const promptPlan = buildPromptPlan(normalizedRequest, retrievedContext);
  const provider = resolveProvider(source.provider);
  let providerResult;

  if (provider === 'openai') {
    const result = await analyticsOpenAi.callStructuredResponse({
      model: normalizeText(source.model, DEFAULT_MODEL),
      reasoningEffort: normalizeText(source.reasoningEffort, DEFAULT_REASONING_EFFORT),
      maxOutputTokens: Number.isFinite(Number(source.maxOutputTokens)) ? Math.round(Number(source.maxOutputTokens)) : 900,
      schemaName: promptPlan.schema_name,
      schema: promptPlan.schema,
      systemPrompt: promptPlan.systemPrompt,
      userPrompt: promptPlan.userPrompt,
      previousResponseId: normalizedRequest.previous_response_id,
    });
    providerResult = {
      provider: 'openai',
      model: result.model,
      reasoningEffort: result.reasoningEffort,
      responseId: result.responseId,
      status: result.status,
      usage: result.usage,
      answer: normalizeAnswer(result.parsedOutput, retrievedContext),
    };
  } else {
    providerResult = {
      provider: 'mock',
      model: 'mock-heuristic',
      reasoningEffort: 'none',
      responseId: '',
      status: 'generated_locally',
      usage: null,
      answer: normalizeAnswer(generateMockAnswer(normalizedRequest, retrievedContext), retrievedContext),
    };
  }

  return {
    version: VERSION,
    provider: providerResult.provider,
    model: providerResult.model,
    reasoning_effort: providerResult.reasoningEffort,
    question: normalizedRequest.question,
    question_template_id: providerResult.answer.question_template_id,
    response_scope: providerResult.answer.response_scope,
    answer: providerResult.answer.answer,
    evidence: providerResult.answer.evidence,
    limitations: providerResult.answer.limitations,
    follow_ups: providerResult.answer.follow_ups,
    confidence: providerResult.answer.confidence,
    source_refs: retrievedContext.source_refs,
    suggested_questions: SUGGESTED_QUESTIONS.slice(0, 5),
    conversation: {
      previous_response_id: normalizedRequest.previous_response_id || null,
      response_id: providerResult.responseId || null,
      memory_turns_used: retrievedContext.memory.length,
    },
    usage: providerResult.usage,
    cost_policy: {
      estimated_input_tokens: promptPlan.estimated_input_tokens,
      max_estimated_input_tokens: MAX_ESTIMATED_INPUT_TOKENS,
      question_char_limit: MAX_QUESTION_CHARS,
      memory_turn_limit: MAX_MEMORY_TURNS,
    },
  };
}

module.exports = {
  VERSION,
  DEFAULT_MODEL,
  DEFAULT_REASONING_EFFORT,
  MAX_MEMORY_TURNS,
  MAX_QUESTION_CHARS,
  MAX_CONTEXT_SECTIONS,
  MAX_ESTIMATED_INPUT_TOKENS,
  SUGGESTED_QUESTIONS,
  QUESTION_TEMPLATES,
  ANSWER_GUARDRAILS,
  resolveQuestionTemplate,
  normalizeMemoryTurns,
  loadLatestReports,
  buildLiveContext,
  buildRetrievedContext,
  buildPromptPlan,
  generateMockAnswer,
  normalizeAnswer,
  buildAnswerBundle,
};
