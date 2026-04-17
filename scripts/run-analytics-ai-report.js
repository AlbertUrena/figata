const fs = require('fs');
const os = require('os');
const path = require('path');
const analyticsPipeline = require('../shared/analytics-pipeline.js');
const analyticsQuality = require('../shared/analytics-quality.js');
const analyticsKpiCatalog = require('../shared/analytics-kpi-catalog.js');
const analyticsCohorts = require('../shared/analytics-cohorts.js');
const analyticsAiReports = require('../shared/analytics-ai-reports.js');
const analyticsOpenAi = require('../shared/analytics-openai.js');

const DEFAULT_INPUT = path.join(os.tmpdir(), 'figata-analytics-dev.ndjson');
const DEFAULT_LATEST_OUTPUT = path.join(process.cwd(), 'analytics-output', 'latest', 'ai-reports');
const DEFAULT_HISTORY_OUTPUT = path.join(process.cwd(), 'analytics-output', 'history', 'ai-reports');
const DEFAULT_PROVIDER = 'auto';
const DEFAULT_MODEL = 'gpt-5.2';
const DEFAULT_REASONING_EFFORT = 'medium';
const DEFAULT_MAX_OUTPUT_TOKENS = 2200;

function normalizeText(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed || fallback;
}

function parseArgs(argv) {
  return argv.reduce(function (accumulator, entry) {
    const normalized = normalizeText(entry);
    if (!normalized.startsWith('--')) {
      return accumulator;
    }

    const separatorIndex = normalized.indexOf('=');
    if (separatorIndex === -1) {
      accumulator[normalized.slice(2)] = 'true';
      return accumulator;
    }

    accumulator[normalized.slice(2, separatorIndex)] = normalized.slice(separatorIndex + 1);
    return accumulator;
  }, {});
}

function toBoolean(value, fallback = false) {
  const normalized = normalizeText(value).toLowerCase();
  if (!normalized) {
    return fallback;
  }

  if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
    return true;
  }
  if (normalized === 'false' || normalized === '0' || normalized === 'no') {
    return false;
  }
  return fallback;
}

function toInteger(value, fallback) {
  const numericValue = Math.round(Number(value));
  return Number.isFinite(numericValue) ? numericValue : fallback;
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

  return [date.getUTCFullYear(), String(date.getUTCMonth() + 1).padStart(2, '0'), String(date.getUTCDate()).padStart(2, '0')].join('-');
}

function shiftDays(date, deltaDays) {
  if (!(date instanceof Date) || !Number.isFinite(date.getTime())) {
    return null;
  }

  const shifted = new Date(date.getTime());
  shifted.setUTCDate(shifted.getUTCDate() + Math.round(deltaDays));
  return shifted;
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
    key: `${formatDateOnly(previousStart)}_${formatDateOnly(previousEnd)}`,
    label: `${formatDateOnly(previousStart)} -> ${formatDateOnly(previousEnd)}`,
  };
}

function resolveWindowFromArgs(args) {
  const reportType = normalizeText(args.type, 'weekly');
  const baselinePeriodsArg = toInteger(args['baseline-periods'], NaN);
  const derivedWindow = analyticsAiReports.resolveReportWindow(reportType, {
    anchorDate: normalizeText(args['anchor-date']),
    baselinePeriods: Number.isFinite(baselinePeriodsArg) ? baselinePeriodsArg : undefined,
  });

  if (!args.from || !args.to) {
    return derivedWindow;
  }

  const current = {
    from: normalizeText(args.from),
    to: normalizeText(args.to),
    key: normalizeText(args['period-key'], `${normalizeText(args.from)}_${normalizeText(args.to)}`),
    label: `${normalizeText(args.from)} -> ${normalizeText(args.to)}`,
  };
  const previous = args['previous-from'] && args['previous-to']
    ? {
        from: normalizeText(args['previous-from']),
        to: normalizeText(args['previous-to']),
        key: normalizeText(args['previous-key'], `${normalizeText(args['previous-from'])}_${normalizeText(args['previous-to'])}`),
        label: `${normalizeText(args['previous-from'])} -> ${normalizeText(args['previous-to'])}`,
      }
    : buildAdjacentPreviousWindow(current);

  return Object.assign({}, derivedWindow, {
    current,
    previous,
    baselinePeriods: Number.isFinite(baselinePeriodsArg) ? Math.max(0, baselinePeriodsArg) : derivedWindow.baselinePeriods,
  });
}

function buildWindowSnapshot(records, period, options) {
  const sourceLabel = normalizeText(options.inputPath, DEFAULT_INPUT);
  const generatedAt = normalizeText(options.generatedAt, new Date().toISOString());
  const scopeMode = normalizeText(options.scopeMode, 'business_only');
  const pipeline = analyticsPipeline.buildAnalyticsPipeline(records, {
    sourceLabel,
    processedAt: generatedAt,
    fromDate: normalizeText(period && period.from),
    toDate: normalizeText(period && period.to),
  });
  const quality = analyticsQuality.buildQualitySnapshot(pipeline, { generatedAt });
  const kpis = analyticsKpiCatalog.buildKpiCatalogSnapshot(pipeline, { generatedAt, scopeMode });
  const cohorts = analyticsCohorts.buildCohortSnapshot(pipeline, { generatedAt, scopeMode });

  return {
    period,
    pipeline,
    quality,
    kpis,
    cohorts,
  };
}

function resolveProvider(requestedProvider) {
  const normalized = normalizeText(requestedProvider, DEFAULT_PROVIDER).toLowerCase();
  if (normalized !== 'auto') {
    return normalized;
  }

  return process.env.OPENAI_API_KEY ? 'openai' : 'mock';
}

async function callOpenAi(promptPlan, options) {
  const result = await analyticsOpenAi.callStructuredResponse({
    model: normalizeText(options.model, DEFAULT_MODEL),
    reasoningEffort: normalizeText(options.reasoningEffort, DEFAULT_REASONING_EFFORT),
    maxOutputTokens: toInteger(options.maxOutputTokens, DEFAULT_MAX_OUTPUT_TOKENS),
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

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, payload) {
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
}

function copyArtifacts(sourceDir, targetDir, fileNames) {
  ensureDir(targetDir);
  fileNames.forEach(function (fileName) {
    fs.copyFileSync(path.join(sourceDir, fileName), path.join(targetDir, fileName));
  });
}

function buildDistributionManifest(bundle, paths, recipients) {
  const normalizedRecipients = Array.isArray(recipients) ? recipients.filter(Boolean) : [];
  return {
    status: 'ready',
    channels: ['filesystem'],
    recipients: normalizedRecipients,
    email_ready: normalizedRecipients.length > 0,
    markdown_path: paths.markdown,
    html_path: paths.html,
    generated_at: bundle.generated_at,
  };
}

function writeArtifacts(bundle, promptPlan, providerResult, outputPaths, recipients) {
  const periodKey = normalizeText(bundle.period_key, 'unknown');
  const historyDir = path.join(outputPaths.historyRoot, bundle.report_type, periodKey);
  const latestDir = path.join(outputPaths.latestRoot, bundle.report_type);
  ensureDir(historyDir);

  const markdown = analyticsAiReports.renderMarkdownReport(bundle);
  const html = analyticsAiReports.renderHtmlReport(bundle);
  const payloadPath = path.join(historyDir, 'source-payload.json');
  const promptPath = path.join(historyDir, 'prompt.json');
  const reportJsonPath = path.join(historyDir, 'report.json');
  const markdownPath = path.join(historyDir, 'report.md');
  const htmlPath = path.join(historyDir, 'report.html');
  const providerPath = path.join(historyDir, 'provider-response.json');
  const distributionPath = path.join(historyDir, 'distribution.json');
  const manifestPath = path.join(historyDir, 'manifest.json');
  const analyticsEvent = {
    event_name: 'report_generated',
    report_type: bundle.report_type,
    report_period: bundle.period_key,
    report_status: 'generated',
  };

  writeJson(payloadPath, analyticsAiReports.buildPromptPayload(bundle.input));
  writeJson(promptPath, {
    version: promptPlan.version,
    schema_name: promptPlan.schema_name,
    guardrails: promptPlan.guardrails,
    system_prompt: promptPlan.systemPrompt,
    user_prompt: promptPlan.userPrompt,
  });
  writeJson(reportJsonPath, bundle);
  if (providerResult && providerResult.provider === 'openai') {
    writeJson(providerPath, {
      provider: providerResult.provider,
      model: providerResult.model,
      reasoning_effort: providerResult.reasoningEffort,
      response_id: providerResult.responseId,
      status: providerResult.status,
      narrative: providerResult.narrative,
    });
  }
  fs.writeFileSync(markdownPath, markdown, 'utf8');
  fs.writeFileSync(htmlPath, html, 'utf8');
  const distributionManifest = buildDistributionManifest(bundle, {
    markdown: markdownPath,
    html: htmlPath,
  }, recipients);
  writeJson(distributionPath, distributionManifest);
  writeJson(manifestPath, {
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
    analytics_event: analyticsEvent,
    files: {
      source_payload: payloadPath,
      prompt: promptPath,
      report_json: reportJsonPath,
      report_markdown: markdownPath,
      report_html: htmlPath,
      distribution: distributionPath,
      provider_response: providerResult && providerResult.provider === 'openai' ? providerPath : null,
    },
  });

  copyArtifacts(historyDir, latestDir, [
    'source-payload.json',
    'prompt.json',
    'report.json',
    'report.md',
    'report.html',
    'distribution.json',
    'manifest.json',
  ].concat(providerResult && providerResult.provider === 'openai' ? ['provider-response.json'] : []));

  const latestIndexPath = path.join(outputPaths.latestRoot, 'index.json');
  let latestIndex = {};
  try {
    latestIndex = JSON.parse(fs.readFileSync(latestIndexPath, 'utf8'));
  } catch (_error) {
    latestIndex = {};
  }
  latestIndex[bundle.report_type] = {
    generated_at: bundle.generated_at,
    period_key: bundle.period_key,
    manifest_path: path.join(latestDir, 'manifest.json'),
    report_markdown_path: path.join(latestDir, 'report.md'),
    report_html_path: path.join(latestDir, 'report.html'),
  };
  writeJson(latestIndexPath, latestIndex);

  return {
    historyDir,
    latestDir,
    markdownPath,
    htmlPath,
    manifestPath,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const reportType = normalizeText(args.type, 'weekly');
  const generatedAt = new Date().toISOString();
  const inputPath = path.resolve(args.input || DEFAULT_INPUT);
  const latestRoot = path.resolve(args.output || DEFAULT_LATEST_OUTPUT);
  const historyRoot = path.resolve(args.history || DEFAULT_HISTORY_OUTPUT);
  const scopeMode = normalizeText(args.scope, toBoolean(args['business-only'], true) ? 'business_only' : 'all_traffic');
  const provider = resolveProvider(args.provider || DEFAULT_PROVIDER);
  const model = normalizeText(args.model, DEFAULT_MODEL);
  const reasoningEffort = normalizeText(args['reasoning-effort'], DEFAULT_REASONING_EFFORT);
  const maxOutputTokens = toInteger(args['max-output-tokens'], DEFAULT_MAX_OUTPUT_TOKENS);
  const recipients = normalizeText(process.env.FIGATA_ANALYTICS_REPORT_RECIPIENTS)
    .split(',')
    .map(function (entry) { return normalizeText(entry); })
    .filter(Boolean);

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Analytics raw input not found: ${inputPath}`);
  }
  if (!analyticsAiReports.REPORT_DEFINITIONS[reportType]) {
    throw new Error(`Unsupported report type: ${reportType}`);
  }

  const rawText = fs.readFileSync(inputPath, 'utf8');
  const records = analyticsPipeline.parseNdjson(rawText, { sourceLabel: inputPath });
  const windowConfig = resolveWindowFromArgs(Object.assign({}, args, { type: reportType }));
  const baselineWindows = analyticsAiReports.buildBaselineWindows(windowConfig);
  const currentSnapshot = buildWindowSnapshot(records, windowConfig.current, { inputPath, generatedAt, scopeMode });
  const previousSnapshot = buildWindowSnapshot(records, windowConfig.previous, { inputPath, generatedAt, scopeMode });
  const baselineSnapshots = baselineWindows.map(function (period) {
    return buildWindowSnapshot(records, period, { inputPath, generatedAt, scopeMode });
  });
  const reportInput = analyticsAiReports.buildReportInput({
    reportType,
    generatedAt,
    windowConfig,
    currentSnapshot,
    previousSnapshot,
    baselineSnapshots,
  });
  const promptPlan = analyticsAiReports.buildPromptPlan(reportInput);

  let providerResult;
  if (provider === 'openai') {
    providerResult = await callOpenAi(promptPlan, { model, reasoningEffort, maxOutputTokens });
  } else {
    providerResult = {
      provider: 'mock',
      model: 'mock-heuristic',
      reasoningEffort: 'none',
      status: 'generated_locally',
      narrative: analyticsAiReports.generateMockNarrative(reportInput),
    };
  }

  const bundle = analyticsAiReports.buildReportBundle({
    reportInput,
    promptPlan,
    narrative: providerResult.narrative,
    provider: providerResult.provider,
    model: providerResult.model,
    reasoningEffort: providerResult.reasoningEffort,
    generatedAt,
  });
  const artifactPaths = writeArtifacts(bundle, promptPlan, providerResult, { latestRoot, historyRoot }, recipients);

  console.log('Analytics AI report generated.');
  console.log(`Type: ${bundle.report_type}`);
  console.log(`Period: ${bundle.period_key}`);
  console.log(`Provider: ${bundle.provider}`);
  console.log(`Model: ${bundle.model}`);
  console.log(`Current: ${bundle.input.periods.current.from} -> ${bundle.input.periods.current.to}`);
  console.log(`Previous: ${bundle.input.periods.previous.from} -> ${bundle.input.periods.previous.to}`);
  console.log(`History dir: ${artifactPaths.historyDir}`);
  console.log(`Latest dir: ${artifactPaths.latestDir}`);
  console.log(`Markdown: ${artifactPaths.markdownPath}`);
  console.log(`HTML: ${artifactPaths.htmlPath}`);
}

main().catch(function (error) {
  console.error(error && error.message ? error.message : error);
  process.exit(1);
});
