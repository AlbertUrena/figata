const fs = require('fs');
const os = require('os');
const path = require('path');
const pipeline = require('../shared/analytics-pipeline.js');

const DEFAULT_INPUT = path.join(os.tmpdir(), 'figata-analytics-dev.ndjson');
const DEFAULT_OUTPUT = path.join(process.cwd(), 'analytics-output', 'latest');

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

function ensureDirectory(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const inputPath = path.resolve(args.input || DEFAULT_INPUT);
  const outputDir = path.resolve(args.output || DEFAULT_OUTPUT);
  const fromDate = normalizeText(args.from);
  const toDate = normalizeText(args.to);

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Analytics raw input not found: ${inputPath}`);
  }

  const rawText = fs.readFileSync(inputPath, 'utf8');
  const records = pipeline.parseNdjson(rawText, { sourceLabel: inputPath });
  const result = pipeline.buildAnalyticsPipeline(records, {
    sourceLabel: inputPath,
    processedAt: new Date().toISOString(),
    fromDate,
    toDate,
  });

  pipeline.buildOutputFiles(result).forEach((file) => {
    const absolutePath = path.join(outputDir, file.relativePath);
    ensureDirectory(absolutePath);
    fs.writeFileSync(absolutePath, file.content, 'utf8');
  });

  console.log('Analytics pipeline complete.');
  console.log(`Input: ${inputPath}`);
  console.log(`Output: ${outputDir}`);
  if (fromDate || toDate) {
    console.log(`Backfill window: ${fromDate || 'min'} -> ${toDate || 'max'}`);
  }
  console.log(`Raw accepted: ${result.manifest.raw_event_count}`);
  console.log(`Curated events_fact: ${result.manifest.curated_event_count}`);
  console.log(`Curated sessions_fact: ${result.manifest.sessions_fact_count}`);
  console.log(`Curated visitors_fact: ${result.manifest.visitors_fact_count}`);
  console.log(`Quarantine: ${result.manifest.quarantine_count}`);
  console.log(`Duplicate event_id: ${result.manifest.duplicate_event_id_count}`);
  console.log(`Duplicate idempotency_key: ${result.manifest.duplicate_idempotency_key_count}`);
}

try {
  main();
} catch (error) {
  console.error(error && error.message ? error.message : error);
  process.exit(1);
}
