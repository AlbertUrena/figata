const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const analyticsAiReports = require('../shared/analytics-ai-reports.js');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function runJob(args, env) {
  execFileSync(process.execPath, [path.join(process.cwd(), 'scripts', 'run-analytics-ai-report.js')].concat(args), {
    cwd: process.cwd(),
    env: Object.assign({}, process.env, env || {}),
    stdio: 'pipe',
  });
}

function validateWindowResolution() {
  const weekly = analyticsAiReports.resolveReportWindow('weekly', { anchorDate: '2026-04-16' });
  const monthly = analyticsAiReports.resolveReportWindow('monthly', { anchorDate: '2026-04-16' });

  assert(weekly.current.from === '2026-04-06', 'Weekly current period should resolve to the latest closed Monday-Sunday window');
  assert(weekly.previous.from === '2026-03-30', 'Weekly previous period should resolve to the prior week');
  assert(monthly.current.from === '2026-03-01', 'Monthly current period should resolve to the latest closed month');
  assert(monthly.previous.from === '2026-02-01', 'Monthly previous period should resolve to the prior month');
  assert(analyticsAiReports.REPORT_DEFINITIONS.weekly.schedule.hour === 7, 'Weekly report should default to 07:00 local time');
  assert(analyticsAiReports.REPORT_DEFINITIONS.monthly.schedule.hour === 8, 'Monthly report should default to 08:00 local time');
}

function validateArtifactSet(rootDir, reportType, periodKey, expectedProvider) {
  const historyDir = path.join(rootDir, 'history', reportType, periodKey);
  const latestDir = path.join(rootDir, 'latest', reportType);
  const requiredFiles = [
    'distribution.json',
    'manifest.json',
    'prompt.json',
    'report.html',
    'report.json',
    'report.md',
    'source-payload.json',
  ];

  requiredFiles.forEach((fileName) => {
    assert(fs.existsSync(path.join(historyDir, fileName)), `Missing history artifact: ${reportType}/${periodKey}/${fileName}`);
    assert(fs.existsSync(path.join(latestDir, fileName)), `Missing latest artifact: ${reportType}/${fileName}`);
  });

  const manifest = readJson(path.join(historyDir, 'manifest.json'));
  const prompt = readJson(path.join(historyDir, 'prompt.json'));
  const report = readJson(path.join(historyDir, 'report.json'));
  const sourcePayload = readJson(path.join(historyDir, 'source-payload.json'));
  const distribution = readJson(path.join(historyDir, 'distribution.json'));
  const markdown = fs.readFileSync(path.join(historyDir, 'report.md'), 'utf8');
  const html = fs.readFileSync(path.join(historyDir, 'report.html'), 'utf8');

  assert(manifest.report_type === reportType, `Manifest report type mismatch for ${reportType}`);
  assert(manifest.period_key === periodKey, `Manifest period key mismatch for ${reportType}`);
  assert(manifest.provider === expectedProvider, `Manifest provider mismatch for ${reportType}`);
  assert(prompt.version === analyticsAiReports.PROMPT_VERSION, 'Prompt version should be pinned');
  assert(Array.isArray(prompt.guardrails) && prompt.guardrails.length >= 5, 'Prompt guardrails should be persisted');
  assert(prompt.guardrails.some((entry) => entry.toLowerCase().indexOf('observacion') !== -1 || entry.toLowerCase().indexOf('observation') !== -1), 'Prompt should mention observation guardrails');
  assert(prompt.guardrails.some((entry) => entry.toLowerCase().indexOf('inferencia') !== -1 || entry.toLowerCase().indexOf('inference') !== -1), 'Prompt should mention inference guardrails');
  assert(prompt.guardrails.some((entry) => entry.toLowerCase().indexOf('inventar') !== -1), 'Prompt should forbid hallucinated data');

  assert(report.provider === expectedProvider, `Report provider mismatch for ${reportType}`);
  assert(report.input.report_type === reportType, `Report input type mismatch for ${reportType}`);
  assert(report.input.periods.current.key === periodKey, `Current period key mismatch for ${reportType}`);
  assert(Array.isArray(report.narrative.key_findings) && report.narrative.key_findings.length >= 2, 'Narrative should include key findings');
  assert(Array.isArray(report.narrative.recommendations) && report.narrative.recommendations.length >= 2, 'Narrative should include recommendations');
  assert(report.narrative.key_findings.every((entry) => Array.isArray(entry.metric_refs) && entry.metric_refs.length >= 1), 'Each finding should reference at least one metric');
  assert(report.narrative.recommendations.every((entry) => Array.isArray(entry.metric_refs) && entry.metric_refs.length >= 1), 'Each recommendation should reference at least one metric');

  assert(Array.isArray(sourcePayload.scorecard) && sourcePayload.scorecard.length >= 6, 'Source payload should include the aggregated scorecard');
  assert(sourcePayload.periods && sourcePayload.periods.current && sourcePayload.periods.previous, 'Source payload should include current and previous periods');
  assert(sourcePayload.schedule && sourcePayload.schedule.timeZone === 'America/Santo_Domingo', 'Source payload should carry schedule metadata');

  assert(distribution.status === 'ready', 'Distribution manifest should be ready');
  assert(Array.isArray(distribution.channels) && distribution.channels.includes('filesystem'), 'Distribution should include filesystem channel');

  assert(markdown.includes('# Reporte'), 'Markdown output should include the report heading');
  assert(markdown.includes('## KPI scorecard'), 'Markdown output should include KPI scorecard section');
  assert(markdown.includes('## Hallazgos clave'), 'Markdown output should include findings section');
  assert(markdown.includes('## Recomendaciones'), 'Markdown output should include recommendations section');
  assert(html.startsWith('<!doctype html>'), 'HTML output should render a standalone document');
  assert(html.includes('<h2>Recomendaciones</h2>'), 'HTML output should include recommendations section');
}

function main() {
  validateWindowResolution();

  const rootDir = path.join(os.tmpdir(), 'figata-analytics-ai-report-validate');
  fs.rmSync(rootDir, { recursive: true, force: true });
  fs.mkdirSync(rootDir, { recursive: true });

  runJob([
    '--type=weekly',
    '--provider=mock',
    '--from=2026-04-16',
    '--to=2026-04-16',
    '--previous-from=2026-04-15',
    '--previous-to=2026-04-15',
    `--output=${path.join(rootDir, 'latest')}`,
    `--history=${path.join(rootDir, 'history')}`,
  ]);
  validateArtifactSet(rootDir, 'weekly', '2026-04-16_2026-04-16', 'mock');

  runJob([
    '--type=monthly',
    '--provider=mock',
    '--from=2026-04-01',
    '--to=2026-04-30',
    '--previous-from=2026-03-01',
    '--previous-to=2026-03-31',
    `--output=${path.join(rootDir, 'latest')}`,
    `--history=${path.join(rootDir, 'history')}`,
  ]);
  validateArtifactSet(rootDir, 'monthly', '2026-04-01_2026-04-30', 'mock');

  console.log('Analytics AI reports valid.');
}

try {
  main();
} catch (error) {
  console.error(error && error.message ? error.message : error);
  process.exit(1);
}
