const analyticsAiReports = require('../../shared/analytics-ai-reports.js');
const analyticsOpenAi = require('../../shared/analytics-openai.js');
const analyticsOptimization = require('../../shared/analytics-optimization.js');
const snapshotService = require('./analytics-snapshot.js');
const r2Storage = require('./r2-storage.js');
const { joinPath, normalizeText } = require('./pathing.js');

const DEFAULT_RAW_PREFIX = 'raw';
const DEFAULT_ARTIFACT_PREFIX = 'artifacts';
const DEFAULT_MODEL = 'gpt-5.2';
const DEFAULT_REASONING_EFFORT = 'medium';
const DEFAULT_MAX_OUTPUT_TOKENS = 2200;

function parseDateOnly(value) {
  const normalized = normalizeText(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return null;
  }

  const parsed = new Date(normalized + 'T12:00:00.000Z');
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}

function formatDateOnly(date) {
  if (!(date instanceof Date) || !Number.isFinite(date.getTime())) {
    return '';
  }

  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
  ].join('-');
}

function shiftDays(date, deltaDays) {
  if (!(date instanceof Date) || !Number.isFinite(date.getTime())) {
    return null;
  }

  const shifted = new Date(date.getTime());
  shifted.setUTCDate(shifted.getUTCDate() + Math.round(deltaDays));
  return shifted;
}

function toInteger(value, fallback) {
  const numericValue = Math.round(Number(value));
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function resolveProvider(requestedProvider, apiKey) {
  const normalized = normalizeText(requestedProvider, 'auto').toLowerCase();
  if (normalized !== 'auto') {
    return normalized;
  }
  return normalizeText(apiKey) ? 'openai' : 'mock';
}

function buildAdjacentPreviousWindow(currentWindow) {
  const currentStart = parseDateOnly(currentWindow.from);
  const currentEnd = parseDateOnly(currentWindow.to);
  if (!currentStart || !currentEnd) {
    return null;
  }

  const spanDays = Math.max(1, Math.round((currentEnd.getTime() - currentStart.getTime()) / 86400000) + 1);
  const previousEnd = shiftDays(currentStart, -1);
  const previousStart = shiftDays(previousEnd, -(spanDays - 1));
  return {
    from: formatDateOnly(previousStart),
    to: formatDateOnly(previousEnd),
    key: formatDateOnly(previousStart) + '_' + formatDateOnly(previousEnd),
    label: formatDateOnly(previousStart) + ' -> ' + formatDateOnly(previousEnd),
  };
}

function resolveWindowFromOptions(reportType, options) {
  const source = options && typeof options === 'object' ? options : {};
  const baselinePeriods = toInteger(source.baselinePeriods, NaN);
  const derivedWindow = analyticsAiReports.resolveReportWindow(reportType, {
    anchorDate: normalizeText(source.anchorDate),
    baselinePeriods: Number.isFinite(baselinePeriods) ? baselinePeriods : undefined,
  });

  if (!source.from || !source.to) {
    return derivedWindow;
  }

  const current = {
    from: normalizeText(source.from),
    to: normalizeText(source.to),
    key: normalizeText(source.periodKey, normalizeText(source.from) + '_' + normalizeText(source.to)),
    label: normalizeText(source.from) + ' -> ' + normalizeText(source.to),
  };
  const previous = source.previousFrom && source.previousTo
    ? {
        from: normalizeText(source.previousFrom),
        to: normalizeText(source.previousTo),
        key: normalizeText(source.previousKey, normalizeText(source.previousFrom) + '_' + normalizeText(source.previousTo)),
        label: normalizeText(source.previousFrom) + ' -> ' + normalizeText(source.previousTo),
      }
    : buildAdjacentPreviousWindow(current);

  return Object.assign({}, derivedWindow, {
    current: current,
    previous: previous,
    baselinePeriods: Number.isFinite(baselinePeriods) ? Math.max(0, baselinePeriods) : derivedWindow.baselinePeriods,
  });
}

async function buildWindowSnapshotFromR2(bucket, period, options) {
  const source = options && typeof options === 'object' ? options : {};
  const payload = await snapshotService.buildAnalyticsSnapshotPayload({
    bucket: bucket,
    fromDate: period && period.from,
    toDate: period && period.to,
    rawPrefix: source.rawPrefix,
    limitDays: source.limitDays || 62,
    limit: 0,
    scopeMode: normalizeText(source.scopeMode, 'business_only'),
    filters: source.filters || {},
    generatedAt: normalizeText(source.generatedAt, new Date().toISOString()),
    sourceLabel: normalizeText(source.sourceLabel, 'r2://figata-analytics/' + normalizeText(source.rawPrefix, DEFAULT_RAW_PREFIX)),
  });

  return {
    period: period,
    pipeline: payload.curatedSnapshot,
    quality: payload.qualitySnapshot,
    kpis: payload.kpiSnapshot,
    cohorts: payload.cohortSnapshot,
  };
}

async function callProvider(promptPlan, options) {
  const source = options && typeof options === 'object' ? options : {};
  const provider = resolveProvider(source.provider, source.apiKey);
  if (provider === 'openai') {
    const result = await analyticsOpenAi.callStructuredResponse({
      apiKey: normalizeText(source.apiKey),
      model: normalizeText(source.model, DEFAULT_MODEL),
      reasoningEffort: normalizeText(source.reasoningEffort, DEFAULT_REASONING_EFFORT),
      maxOutputTokens: toInteger(source.maxOutputTokens, DEFAULT_MAX_OUTPUT_TOKENS),
      schemaName: promptPlan.schema_name,
      schema: promptPlan.schema,
      systemPrompt: promptPlan.systemPrompt,
      userPrompt: promptPlan.userPrompt,
    });
    return {
      provider: 'openai',
      model: result.model,
      reasoningEffort: result.reasoningEffort,
      responseId: result.responseId,
      status: result.status,
      raw: result.responseJson,
      narrative: result.parsedOutput,
    };
  }

  return {
    provider: 'mock',
    model: 'mock-heuristic',
    reasoningEffort: 'none',
    status: 'generated_locally',
    narrative: analyticsAiReports.generateMockNarrative(promptPlan.reportInput),
  };
}

function buildDistributionManifest(bundle, recipients) {
  const normalizedRecipients = Array.isArray(recipients) ? recipients.filter(Boolean) : [];
  return {
    status: 'ready',
    channels: ['r2'],
    recipients: normalizedRecipients,
    email_ready: normalizedRecipients.length > 0,
    generated_at: bundle.generated_at,
  };
}

async function writeArtifactsToR2(bucket, bundle, promptPlan, providerResult, options) {
  const source = options && typeof options === 'object' ? options : {};
  const prefixRoot = normalizeText(source.artifactPrefix, DEFAULT_ARTIFACT_PREFIX);
  const historyPrefix = joinPath(prefixRoot, 'ai-reports', bundle.report_type, 'history', normalizeText(bundle.period_key, 'unknown'));
  const latestPrefix = joinPath(prefixRoot, 'ai-reports', bundle.report_type, 'latest');
  const latestIndexKey = joinPath(prefixRoot, 'ai-reports', 'latest', 'index.json');
  const markdown = analyticsAiReports.renderMarkdownReport(bundle);
  const html = analyticsAiReports.renderHtmlReport(bundle);
  const recipients = Array.isArray(source.recipients) ? source.recipients : [];

  const manifest = {
    version: analyticsAiReports.VERSION,
    generated_at: bundle.generated_at,
    report_type: bundle.report_type,
    period_key: bundle.period_key,
    provider: bundle.provider,
    model: bundle.model,
    reasoning_effort: bundle.reasoning_effort,
    prompt_version: bundle.prompt.version,
    current_period: bundle.input.periods.current,
    previous_period: bundle.input.periods.previous,
    baseline_periods: bundle.input.periods.baseline,
    schedule: bundle.input.schedule,
    files: {
      source_payload: joinPath(historyPrefix, 'source-payload.json'),
      prompt: joinPath(historyPrefix, 'prompt.json'),
      report_json: joinPath(historyPrefix, 'report.json'),
      report_markdown: joinPath(historyPrefix, 'report.md'),
      report_html: joinPath(historyPrefix, 'report.html'),
      distribution: joinPath(historyPrefix, 'distribution.json'),
      provider_response: providerResult && providerResult.provider === 'openai'
        ? joinPath(historyPrefix, 'provider-response.json')
        : null,
    },
  };

  await Promise.all([
    r2Storage.writeJsonObject(bucket, joinPath(historyPrefix, 'source-payload.json'), analyticsAiReports.buildPromptPayload(bundle.input)),
    r2Storage.writeJsonObject(bucket, joinPath(historyPrefix, 'prompt.json'), {
      version: promptPlan.version,
      schema_name: promptPlan.schema_name,
      guardrails: promptPlan.guardrails,
      system_prompt: promptPlan.systemPrompt,
      user_prompt: promptPlan.userPrompt,
    }),
    r2Storage.writeJsonObject(bucket, joinPath(historyPrefix, 'report.json'), bundle),
    r2Storage.writeTextObject(bucket, joinPath(historyPrefix, 'report.md'), markdown, {
      httpMetadata: { contentType: 'text/markdown; charset=utf-8' },
    }),
    r2Storage.writeTextObject(bucket, joinPath(historyPrefix, 'report.html'), html, {
      httpMetadata: { contentType: 'text/html; charset=utf-8' },
    }),
    r2Storage.writeJsonObject(bucket, joinPath(historyPrefix, 'distribution.json'), buildDistributionManifest(bundle, recipients)),
    r2Storage.writeJsonObject(bucket, joinPath(historyPrefix, 'manifest.json'), manifest),
  ].concat(providerResult && providerResult.provider === 'openai'
    ? [r2Storage.writeJsonObject(bucket, joinPath(historyPrefix, 'provider-response.json'), {
        provider: providerResult.provider,
        model: providerResult.model,
        reasoning_effort: providerResult.reasoningEffort,
        response_id: providerResult.responseId,
        status: providerResult.status,
        narrative: providerResult.narrative,
      })]
    : []));

  await Promise.all([
    r2Storage.writeJsonObject(bucket, joinPath(latestPrefix, 'source-payload.json'), analyticsAiReports.buildPromptPayload(bundle.input)),
    r2Storage.writeJsonObject(bucket, joinPath(latestPrefix, 'prompt.json'), {
      version: promptPlan.version,
      schema_name: promptPlan.schema_name,
      guardrails: promptPlan.guardrails,
      system_prompt: promptPlan.systemPrompt,
      user_prompt: promptPlan.userPrompt,
    }),
    r2Storage.writeJsonObject(bucket, joinPath(latestPrefix, 'report.json'), bundle),
    r2Storage.writeTextObject(bucket, joinPath(latestPrefix, 'report.md'), markdown, {
      httpMetadata: { contentType: 'text/markdown; charset=utf-8' },
    }),
    r2Storage.writeTextObject(bucket, joinPath(latestPrefix, 'report.html'), html, {
      httpMetadata: { contentType: 'text/html; charset=utf-8' },
    }),
    r2Storage.writeJsonObject(bucket, joinPath(latestPrefix, 'distribution.json'), buildDistributionManifest(bundle, recipients)),
    r2Storage.writeJsonObject(bucket, joinPath(latestPrefix, 'manifest.json'), manifest),
  ].concat(providerResult && providerResult.provider === 'openai'
    ? [r2Storage.writeJsonObject(bucket, joinPath(latestPrefix, 'provider-response.json'), {
        provider: providerResult.provider,
        model: providerResult.model,
        reasoning_effort: providerResult.reasoningEffort,
        response_id: providerResult.responseId,
        status: providerResult.status,
        narrative: providerResult.narrative,
      })]
    : []));

  var latestIndex = await r2Storage.readJsonObject(bucket, latestIndexKey) || {};
  latestIndex[bundle.report_type] = {
    generated_at: bundle.generated_at,
    period_key: bundle.period_key,
    manifest_key: joinPath(latestPrefix, 'manifest.json'),
    report_json_key: joinPath(latestPrefix, 'report.json'),
    report_markdown_key: joinPath(latestPrefix, 'report.md'),
    report_html_key: joinPath(latestPrefix, 'report.html'),
  };
  await r2Storage.writeJsonObject(bucket, latestIndexKey, latestIndex);

  return {
    historyPrefix: historyPrefix,
    latestPrefix: latestPrefix,
    manifestKey: joinPath(historyPrefix, 'manifest.json'),
  };
}

async function loadLatestReportsFromR2(bucket, options) {
  const source = options && typeof options === 'object' ? options : {};
  const prefixRoot = normalizeText(source.artifactPrefix, DEFAULT_ARTIFACT_PREFIX);
  const latestIndex = await r2Storage.readJsonObject(bucket, joinPath(prefixRoot, 'ai-reports', 'latest', 'index.json')) || {};

  async function readEntry(reportType) {
    const entry = latestIndex[reportType] || null;
    if (!entry) {
      return null;
    }

    const manifest = await r2Storage.readJsonObject(bucket, entry.manifest_key || joinPath(prefixRoot, 'ai-reports', reportType, 'latest', 'manifest.json'));
    const report = await r2Storage.readJsonObject(bucket, entry.report_json_key || joinPath(prefixRoot, 'ai-reports', reportType, 'latest', 'report.json'));
    const payload = await r2Storage.readJsonObject(bucket,
      manifest && manifest.files && manifest.files.source_payload
        ? manifest.files.source_payload
        : joinPath(prefixRoot, 'ai-reports', reportType, 'latest', 'source-payload.json')
    );

    return report && payload
      ? {
          manifest: entry,
          report: report,
          source_payload: payload,
        }
      : null;
  }

  const weekly = await readEntry('weekly');
  const monthly = await readEntry('monthly');
  return {
    weekly: weekly,
    monthly: monthly,
  };
}

async function generateAiReportBundleFromR2(options) {
  const source = options && typeof options === 'object' ? options : {};
  const bucket = source.bucket;
  if (!bucket || typeof bucket.get !== 'function') {
    throw new Error('ANALYTICS_BUCKET binding is required');
  }

  const reportType = normalizeText(source.reportType, 'weekly');
  if (!analyticsAiReports.REPORT_DEFINITIONS[reportType]) {
    throw new Error('Unsupported report type: ' + reportType);
  }

  const generatedAt = normalizeText(source.generatedAt, new Date().toISOString());
  const windowConfig = resolveWindowFromOptions(reportType, source.window || {});
  const baselineWindows = analyticsAiReports.buildBaselineWindows(windowConfig);
  const currentSnapshot = await buildWindowSnapshotFromR2(bucket, windowConfig.current, {
    rawPrefix: source.rawPrefix,
    scopeMode: normalizeText(source.scopeMode, 'business_only'),
    generatedAt: generatedAt,
  });
  const previousSnapshot = await buildWindowSnapshotFromR2(bucket, windowConfig.previous, {
    rawPrefix: source.rawPrefix,
    scopeMode: normalizeText(source.scopeMode, 'business_only'),
    generatedAt: generatedAt,
  });
  const baselineSnapshots = [];
  for (const period of baselineWindows) {
    baselineSnapshots.push(await buildWindowSnapshotFromR2(bucket, period, {
      rawPrefix: source.rawPrefix,
      scopeMode: normalizeText(source.scopeMode, 'business_only'),
      generatedAt: generatedAt,
    }));
  }

  const reportInput = analyticsAiReports.buildReportInput({
    reportType: reportType,
    generatedAt: generatedAt,
    windowConfig: windowConfig,
    currentSnapshot: currentSnapshot,
    previousSnapshot: previousSnapshot,
    baselineSnapshots: baselineSnapshots,
  });
  const promptPlan = analyticsAiReports.buildPromptPlan(reportInput);
  promptPlan.reportInput = reportInput;
  const providerResult = await callProvider(promptPlan, {
    provider: source.provider,
    apiKey: source.apiKey,
    model: source.model,
    reasoningEffort: source.reasoningEffort,
    maxOutputTokens: source.maxOutputTokens,
  });
  const bundle = analyticsAiReports.buildReportBundle({
    reportInput: reportInput,
    promptPlan: promptPlan,
    narrative: providerResult.narrative,
    provider: providerResult.provider,
    model: providerResult.model,
    reasoningEffort: providerResult.reasoningEffort,
    generatedAt: generatedAt,
  });
  const artifactPaths = await writeArtifactsToR2(bucket, bundle, promptPlan, providerResult, {
    artifactPrefix: source.artifactPrefix,
    recipients: source.recipients || [],
  });

  return {
    bundle: bundle,
    provider: providerResult,
    artifacts: artifactPaths,
  };
}

async function generateOptimizationArtifactsFromSnapshot(bucket, options) {
  const source = options && typeof options === 'object' ? options : {};
  const generatedAt = normalizeText(source.generatedAt, new Date().toISOString());
  const snapshotPayload = await snapshotService.buildAnalyticsSnapshotPayload({
    bucket: bucket,
    fromDate: normalizeText(source.fromDate),
    toDate: normalizeText(source.toDate || source.fromDate),
    rawPrefix: source.rawPrefix,
    limit: 0,
    scopeMode: normalizeText(source.scopeMode, 'business_only'),
    filters: source.filters || {},
    generatedAt: generatedAt,
  });

  const optimizationSnapshot = analyticsOptimization.buildOptimizationSnapshot({
    generatedAt: generatedAt,
    rawEvents: snapshotPayload.events,
    kpiSnapshot: snapshotPayload.kpiSnapshot,
    cohortSnapshot: snapshotPayload.cohortSnapshot,
    qualitySnapshot: snapshotPayload.qualitySnapshot,
  });
  const prefixRoot = normalizeText(source.artifactPrefix, DEFAULT_ARTIFACT_PREFIX);
  const latestPrefix = joinPath(prefixRoot, 'optimization', 'latest');
  await Promise.all([
    r2Storage.writeJsonObject(bucket, joinPath(latestPrefix, 'optimization-summary.json'), optimizationSnapshot),
    r2Storage.writeJsonObject(bucket, joinPath(latestPrefix, 'backlog.json'), optimizationSnapshot.backlog),
    r2Storage.writeJsonObject(bucket, joinPath(latestPrefix, 'recommendations.json'), optimizationSnapshot.recommendations),
    r2Storage.writeJsonObject(bucket, joinPath(latestPrefix, 'decision-log.json'), optimizationSnapshot.decision_log),
    r2Storage.writeTextObject(bucket, joinPath(latestPrefix, 'review.md'), analyticsOptimization.renderOptimizationMarkdown(optimizationSnapshot), {
      httpMetadata: { contentType: 'text/markdown; charset=utf-8' },
    }),
  ]);
  return optimizationSnapshot;
}

module.exports = {
  DEFAULT_ARTIFACT_PREFIX,
  DEFAULT_MAX_OUTPUT_TOKENS,
  DEFAULT_MODEL,
  DEFAULT_RAW_PREFIX,
  DEFAULT_REASONING_EFFORT,
  buildWindowSnapshotFromR2,
  generateAiReportBundleFromR2,
  generateOptimizationArtifactsFromSnapshot,
  loadLatestReportsFromR2,
  resolveWindowFromOptions,
};
