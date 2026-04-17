const fs = require('fs');
const os = require('os');
const path = require('path');
const analyticsPipeline = require('../shared/analytics-pipeline.js');
const analyticsQuality = require('../shared/analytics-quality.js');
const analyticsKpiCatalog = require('../shared/analytics-kpi-catalog.js');
const analyticsCohorts = require('../shared/analytics-cohorts.js');
const analyticsOptimization = require('../shared/analytics-optimization.js');

const DEFAULT_INPUT = path.join(os.tmpdir(), 'figata-analytics-dev.ndjson');
const DEFAULT_LATEST_OUTPUT = path.join(process.cwd(), 'analytics-output', 'latest', 'optimization');
const DEFAULT_HISTORY_OUTPUT = path.join(process.cwd(), 'analytics-output', 'history', 'optimization');

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

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, payload) {
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
}

function formatDateOnly(value) {
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) {
    return '';
  }

  return [
    parsed.getUTCFullYear(),
    String(parsed.getUTCMonth() + 1).padStart(2, '0'),
    String(parsed.getUTCDate()).padStart(2, '0'),
  ].join('-');
}

function buildPeriodKey(fromDate, toDate, generatedAt) {
  if (fromDate && toDate) {
    return `${fromDate}_${toDate}`;
  }

  return formatDateOnly(generatedAt) || 'latest';
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const generatedAt = new Date().toISOString();
  const inputPath = path.resolve(args.input || DEFAULT_INPUT);
  const latestRoot = path.resolve(args.output || DEFAULT_LATEST_OUTPUT);
  const historyRoot = path.resolve(args.history || DEFAULT_HISTORY_OUTPUT);
  const fromDate = normalizeText(args.from);
  const toDate = normalizeText(args.to);
  const scopeMode = normalizeText(args.scope, 'business_only');
  const periodKey = normalizeText(args['period-key'], buildPeriodKey(fromDate, toDate, generatedAt));

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Analytics raw input not found: ${inputPath}`);
  }

  const rawText = fs.readFileSync(inputPath, 'utf8');
  const records = analyticsPipeline.parseNdjson(rawText, { sourceLabel: inputPath });
  const pipeline = analyticsPipeline.buildAnalyticsPipeline(records, {
    sourceLabel: inputPath,
    processedAt: generatedAt,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });
  const qualitySnapshot = analyticsQuality.buildQualitySnapshot(pipeline, { generatedAt });
  const kpiSnapshot = analyticsKpiCatalog.buildKpiCatalogSnapshot(pipeline, { generatedAt, scopeMode });
  const cohortSnapshot = analyticsCohorts.buildCohortSnapshot(pipeline, { generatedAt, scopeMode });
  const optimizationSnapshot = analyticsOptimization.buildOptimizationSnapshot({
    generatedAt,
    scopeMode,
    rawEvents: pipeline.rawEvents || [],
    kpiSnapshot,
    cohortSnapshot,
    qualitySnapshot,
  });

  const historyDir = path.join(historyRoot, periodKey);
  ensureDir(historyDir);
  ensureDir(latestRoot);

  const backlogPath = path.join(historyDir, 'backlog.json');
  const templatePath = path.join(historyDir, 'experiment-template.json');
  const recommendationsPath = path.join(historyDir, 'recommendations.json');
  const decisionLogPath = path.join(historyDir, 'decision-log.json');
  const summaryPath = path.join(historyDir, 'optimization-summary.json');
  const markdownPath = path.join(historyDir, 'review.md');

  writeJson(backlogPath, optimizationSnapshot.backlog);
  writeJson(templatePath, optimizationSnapshot.experiment_template);
  writeJson(recommendationsPath, optimizationSnapshot.recommendations);
  writeJson(decisionLogPath, optimizationSnapshot.decision_log);
  writeJson(summaryPath, optimizationSnapshot);
  fs.writeFileSync(markdownPath, analyticsOptimization.renderOptimizationMarkdown(optimizationSnapshot), 'utf8');

  ['backlog.json', 'experiment-template.json', 'recommendations.json', 'decision-log.json', 'optimization-summary.json', 'review.md'].forEach(function (fileName) {
    fs.copyFileSync(path.join(historyDir, fileName), path.join(latestRoot, fileName));
  });
  writeJson(path.join(latestRoot, 'index.json'), {
    generated_at: generatedAt,
    period_key: periodKey,
    summary_path: path.join(latestRoot, 'optimization-summary.json'),
    review_path: path.join(latestRoot, 'review.md'),
  });

  console.log('Analytics optimization snapshot generated.');
  console.log(`Period: ${periodKey}`);
  console.log(`History dir: ${historyDir}`);
  console.log(`Latest dir: ${latestRoot}`);
}

try {
  main();
} catch (error) {
  console.error(error && error.message ? error.message : error);
  process.exit(1);
}
