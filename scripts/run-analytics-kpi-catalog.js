const fs = require('fs');
const os = require('os');
const path = require('path');
const analyticsPipeline = require('../shared/analytics-pipeline.js');
const analyticsKpiCatalog = require('../shared/analytics-kpi-catalog.js');

const DEFAULT_INPUT = path.join(os.tmpdir(), 'figata-analytics-dev.ndjson');
const DEFAULT_OUTPUT = path.join(process.cwd(), 'analytics-output', 'latest', 'kpis');

function normalizeText(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed || fallback;
}

function parseArgs(argv) {
  return argv.reduce((accumulator, entry) => {
    const value = normalizeText(entry);
    if (!value.startsWith('--')) {
      return accumulator;
    }

    const separatorIndex = value.indexOf('=');
    if (separatorIndex === -1) {
      accumulator[value.slice(2)] = 'true';
      return accumulator;
    }

    accumulator[value.slice(2, separatorIndex)] = value.slice(separatorIndex + 1);
    return accumulator;
  }, {});
}

function toBoolean(value, fallback = false) {
  const normalizedValue = normalizeText(value).toLowerCase();
  if (!normalizedValue) {
    return fallback;
  }

  if (normalizedValue === 'true' || normalizedValue === '1' || normalizedValue === 'yes') {
    return true;
  }

  if (normalizedValue === 'false' || normalizedValue === '0' || normalizedValue === 'no') {
    return false;
  }

  return fallback;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const inputPath = path.resolve(args.input || DEFAULT_INPUT);
  const outputDir = path.resolve(args.output || DEFAULT_OUTPUT);
  const fromDate = normalizeText(args.from);
  const toDate = normalizeText(args.to);
  const scopeMode = toBoolean(args['business-only'], false) ? 'business_only' : 'all_traffic';

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Analytics raw input not found: ${inputPath}`);
  }

  const rawText = fs.readFileSync(inputPath, 'utf8');
  const records = analyticsPipeline.parseNdjson(rawText, { sourceLabel: inputPath });
  const pipelineResult = analyticsPipeline.buildAnalyticsPipeline(records, {
    sourceLabel: inputPath,
    processedAt: new Date().toISOString(),
    fromDate,
    toDate,
  });
  const snapshot = analyticsKpiCatalog.buildKpiCatalogSnapshot(pipelineResult, {
    generatedAt: new Date().toISOString(),
    scopeMode,
  });
  const markdown = analyticsKpiCatalog.renderKpiCatalogMarkdown(snapshot);

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'kpi-catalog.json'), JSON.stringify(snapshot, null, 2) + '\n', 'utf8');
  fs.writeFileSync(path.join(outputDir, 'kpi-catalog.md'), markdown, 'utf8');

  console.log('Analytics KPI catalog generated.');
  console.log(`Input: ${inputPath}`);
  console.log(`Output: ${outputDir}`);
  console.log(`Scope: ${scopeMode}`);
  console.log(`KPIs: ${snapshot.catalog.definitions.length}`);
}

try {
  main();
} catch (error) {
  console.error(error && error.message ? error.message : error);
  process.exit(1);
}
