const fs = require('fs');
const os = require('os');
const path = require('path');
const analyticsPipeline = require('../shared/analytics-pipeline.js');
const analyticsQuality = require('../shared/analytics-quality.js');

const DEFAULT_INPUT = path.join(os.tmpdir(), 'figata-analytics-dev.ndjson');
const DEFAULT_OUTPUT = path.join(process.cwd(), 'analytics-output', 'latest', 'health');

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

function main() {
  const args = parseArgs(process.argv.slice(2));
  const inputPath = path.resolve(args.input || DEFAULT_INPUT);
  const outputDir = path.resolve(args.output || DEFAULT_OUTPUT);
  const fromDate = normalizeText(args.from);
  const toDate = normalizeText(args.to);
  const periodLabel = fromDate || toDate
    ? `${fromDate || 'min'} -> ${toDate || 'max'}`
    : 'Current window';

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
  const qualitySnapshot = analyticsQuality.buildQualitySnapshot(pipelineResult, {
    generatedAt: new Date().toISOString(),
  });
  const markdownReport = analyticsQuality.renderHealthReport(qualitySnapshot, { periodLabel });

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'quality-snapshot.json'), JSON.stringify(qualitySnapshot, null, 2) + '\n', 'utf8');
  fs.writeFileSync(path.join(outputDir, 'health-report.md'), markdownReport, 'utf8');

  console.log('Analytics health report generated.');
  console.log(`Input: ${inputPath}`);
  console.log(`Output: ${outputDir}`);
  console.log(`Status: ${qualitySnapshot.status}`);
  console.log(`Alerts: ${qualitySnapshot.alerts.length}`);
}

try {
  main();
} catch (error) {
  console.error(error && error.message ? error.message : error);
  process.exit(1);
}
