const analyticsReportService = require('../common/analytics-report-service.js');
const http = require('../common/http.js');
const publishLock = require('../common/publish-lock.js');
const reservationLock = require('../common/reservation-lock.js');
const { normalizeText } = require('../common/pathing.js');

const WEEKLY_CRON = '0 11 * * 1';
const MONTHLY_CRON = '0 12 1 * *';
const OPTIMIZATION_CRON = '30 11 * * *';

async function runWeekly(env) {
  return analyticsReportService.generateAiReportBundleFromR2({
    bucket: env.ANALYTICS_BUCKET,
    rawPrefix: normalizeText(env.FIGATA_ANALYTICS_RAW_PREFIX, 'raw'),
    artifactPrefix: normalizeText(env.FIGATA_ANALYTICS_ARTIFACT_PREFIX, 'artifacts'),
    apiKey: normalizeText(env.OPENAI_API_KEY),
    provider: normalizeText(env.OPENAI_API_KEY) ? 'openai' : 'mock',
    reportType: 'weekly',
  });
}

async function runMonthly(env) {
  return analyticsReportService.generateAiReportBundleFromR2({
    bucket: env.ANALYTICS_BUCKET,
    rawPrefix: normalizeText(env.FIGATA_ANALYTICS_RAW_PREFIX, 'raw'),
    artifactPrefix: normalizeText(env.FIGATA_ANALYTICS_ARTIFACT_PREFIX, 'artifacts'),
    apiKey: normalizeText(env.OPENAI_API_KEY),
    provider: normalizeText(env.OPENAI_API_KEY) ? 'openai' : 'mock',
    reportType: 'monthly',
  });
}

async function runOptimization(env) {
  var now = new Date();
  var toDate = now.toISOString().slice(0, 10);
  var fromDate = new Date(now.getTime() - (6 * 86400000)).toISOString().slice(0, 10);
  return analyticsReportService.generateOptimizationArtifactsFromSnapshot(env.ANALYTICS_BUCKET, {
    rawPrefix: normalizeText(env.FIGATA_ANALYTICS_RAW_PREFIX, 'raw'),
    artifactPrefix: normalizeText(env.FIGATA_ANALYTICS_ARTIFACT_PREFIX, 'artifacts'),
    fromDate: fromDate,
    toDate: toDate,
    scopeMode: 'business_only',
  });
}

async function runScheduled(controller, env) {
  var cron = normalizeText(controller && controller.cron);
  if (cron === WEEKLY_CRON) {
    await runWeekly(env);
    return;
  }
  if (cron === MONTHLY_CRON) {
    await runMonthly(env);
    return;
  }
  if (cron === OPTIMIZATION_CRON) {
    await runOptimization(env);
    return;
  }

  await runWeekly(env);
  await runMonthly(env);
  await runOptimization(env);
}

async function handleRequest(request, env) {
  var url = new URL(request.url);
  if (url.pathname === '/health') {
    return http.jsonResponse(200, {
      ok: true,
      worker: 'figata-jobs',
      has_bucket: Boolean(env && env.ANALYTICS_BUCKET),
      has_openai: Boolean(normalizeText(env && env.OPENAI_API_KEY)),
    });
  }

  if (request.method === 'POST' && url.pathname === '/run/report') {
    var type = normalizeText(url.searchParams.get('type'), 'weekly');
    var result = type === 'monthly' ? await runMonthly(env) : await runWeekly(env);
    return http.jsonResponse(200, {
      ok: true,
      type: type,
      period_key: result && result.bundle ? result.bundle.period_key : 'unknown',
      provider: result && result.bundle ? result.bundle.provider : 'mock',
    });
  }

  if (request.method === 'POST' && url.pathname === '/run/optimization') {
    var optimization = await runOptimization(env);
    return http.jsonResponse(200, {
      ok: true,
      generated_at: optimization && optimization.generated_at ? optimization.generated_at : '',
      backlog: optimization && Array.isArray(optimization.backlog) ? optimization.backlog.length : 0,
    });
  }

  return http.textResponse(404, 'Not found');
}

module.exports = {
  default: {
    fetch: handleRequest,
    scheduled: runScheduled,
  },
  PublishCoordinator: publishLock.PublishCoordinator,
  ReservationCoordinator: reservationLock.ReservationCoordinator,
  handleRequest,
  runScheduled,
};
