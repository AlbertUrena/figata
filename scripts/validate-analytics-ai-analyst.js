const analyticsAiAnalyst = require('../shared/analytics-ai-analyst.js');
const analyticsReportService = require('../cloudflare/common/analytics-report-service.js');
const adminWorker = require('../cloudflare/admin/worker.js');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

class MemoryR2Bucket {
  constructor() {
    this.store = new Map();
  }

  async put(key, value) {
    this.store.set(String(key), String(value));
  }

  async get(key) {
    const normalizedKey = String(key);
    if (!this.store.has(normalizedKey)) {
      return null;
    }

    const value = this.store.get(normalizedKey);
    return {
      async text() {
        return value;
      },
    };
  }

  async list(options = {}) {
    const prefix = String(options.prefix || '');
    const keys = Array.from(this.store.keys())
      .filter((key) => key.indexOf(prefix) === 0)
      .sort();

    return {
      objects: keys.map((key) => ({ key })),
      truncated: false,
      cursor: '',
    };
  }
}

function buildEnv(bucket) {
  return {
    ANALYTICS_BUCKET: bucket,
    ANALYTICS_BUCKET_NAME: 'figata-analytics-test',
    FIGATA_ANALYTICS_RAW_PREFIX: 'raw',
    FIGATA_ANALYTICS_ARTIFACT_PREFIX: 'artifacts',
    FIGATA_ACCESS_SKIP_VERIFY: '1',
    FIGATA_ACCESS_TEAM_DOMAIN: 'https://trattoriafigata.cloudflareaccess.com',
  };
}

function buildAuthedRequest(url, body) {
  return new Request(url, {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cf-Access-Authenticated-User-Email': 'admin@figata.test',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function seedReports(bucket) {
  await analyticsReportService.generateAiReportBundleFromR2({
    bucket,
    provider: 'mock',
    reportType: 'weekly',
    window: {
      from: '2026-04-16',
      to: '2026-04-16',
      previousFrom: '2026-04-15',
      previousTo: '2026-04-15',
    },
  });

  await analyticsReportService.generateAiReportBundleFromR2({
    bucket,
    provider: 'mock',
    reportType: 'monthly',
    window: {
      from: '2026-04-01',
      to: '2026-04-30',
      previousFrom: '2026-03-01',
      previousTo: '2026-03-31',
    },
  });
}

function buildLiveSnapshotFixture() {
  return {
    kpiSnapshot: {
      metrics: {
        global: {
          sessions_total: { value: 42, unit: 'count' },
          purchase_session_rate: { value: 0.16, unit: 'ratio' },
          average_route_ready_ms: { value: 980, unit: 'ms' },
          unique_visitors_total: { value: 31, unit: 'count' },
        },
        bySegment: {
          entry_source: {
            values: {
              qr: {
                sessions_total: { value: 22, unit: 'count' },
                purchase_session_rate: { value: 0.2, unit: 'ratio' },
                average_route_ready_ms: { value: 910, unit: 'ms' },
              },
              instagram: {
                sessions_total: { value: 11, unit: 'count' },
                purchase_session_rate: { value: 0.09, unit: 'ratio' },
                average_route_ready_ms: { value: 1240, unit: 'ms' },
              },
            },
          },
          route_name: {
            values: {
              menu: {
                sessions_total: { value: 25, unit: 'count' },
                purchase_session_rate: { value: 0.18, unit: 'ratio' },
                average_route_ready_ms: { value: 940, unit: 'ms' },
              },
              home: {
                sessions_total: { value: 12, unit: 'count' },
                purchase_session_rate: { value: 0.07, unit: 'ratio' },
                average_route_ready_ms: { value: 1180, unit: 'ms' },
              },
            },
          },
        },
      },
    },
    qualitySnapshot: {
      current: {
        status: 'ok',
      },
    },
    cohortSnapshot: {
      retention: {
        overall: {
          return_7d_rate: 0.12,
        },
      },
    },
  };
}

function validateTemplateResolution() {
  const template = analyticsAiAnalyst.resolveQuestionTemplate('Compara QR vs Instagram en intencion de compra');
  assert(template.id === 'channel_comparison', 'Expected channel comparison template for QR vs Instagram');

  const liveTemplate = analyticsAiAnalyst.resolveQuestionTemplate('Que me deberia preocupar hoy?');
  assert(liveTemplate.id === 'performance_risk', 'Expected live/performance template for today-style operational questions');

  const memory = analyticsAiAnalyst.normalizeMemoryTurns(
    new Array(10).fill(null).map(function (_entry, index) {
      return { role: index % 2 ? 'assistant' : 'user', text: 'turno ' + index };
    })
  );
  assert(memory.length === analyticsAiAnalyst.MAX_MEMORY_TURNS, 'Memory turns should be trimmed to the configured limit');
}

async function validateRetrievedContext(bucket) {
  const reports = await analyticsReportService.loadLatestReportsFromR2(bucket, {
    artifactPrefix: 'artifacts',
  });
  assert(reports.weekly && reports.monthly, 'Expected weekly and monthly latest reports to load from R2');

  const liveContext = analyticsAiAnalyst.buildLiveContext(buildLiveSnapshotFixture());
  assert(liveContext && Array.isArray(liveContext.scorecard) && liveContext.scorecard.length >= 3, 'Expected live context scorecard to be derived');

  const weeklyContext = analyticsAiAnalyst.buildRetrievedContext({
    question: 'Que cambio esta semana?',
    scope: 'auto',
    mode: '',
    memory: [],
    previous_response_id: '',
  }, {
    reports,
    live: liveContext,
  });
  assert(weeklyContext.scope === 'weekly', 'Auto scope should resolve to weekly for weekly summary questions');
  assert(weeklyContext.sections.length >= 4, 'Expected multiple retrieved context sections for weekly reports');
  assert(weeklyContext.metric_definitions.length >= 3, 'Expected KPI definitions to be attached to retrieved context');
}

async function validateCloudflareSessionEndpoint(env) {
  const response = await adminWorker.handleRequest(buildAuthedRequest('https://admin.trattoriafigata.com/api/session'), env);
  assert(response.status === 200, 'Cloudflare admin /api/session should authenticate a protected request');
  const payload = await response.json();
  assert(payload.authenticated === true, 'Session payload should mark the user as authenticated');
  assert(payload.user && payload.user.email === 'admin@figata.test', 'Session endpoint should expose the authenticated email');
}

async function validateCloudflareAiEndpoint(env) {
  const response = await adminWorker.handleRequest(
    buildAuthedRequest('https://admin.trattoriafigata.com/api/analytics/ai-analyst', {
      question: 'Que cambio esta semana?',
      provider: 'mock',
      filters: {
        from: '2026-04-16',
        to: '2026-04-16',
        includeInternal: true,
      },
    }),
    env
  );
  assert(response.status === 200, 'Cloudflare admin /api/analytics/ai-analyst should answer valid payloads');
  const payload = await response.json();
  assert(payload.answer && payload.evidence, 'Cloudflare AI analyst should return an answer bundle');
  assert(Array.isArray(payload.follow_ups) && payload.follow_ups.length >= 2, 'Cloudflare AI analyst should keep follow-up questions');
}

async function main() {
  validateTemplateResolution();
  const bucket = new MemoryR2Bucket();
  const env = buildEnv(bucket);
  await seedReports(bucket);
  await validateRetrievedContext(bucket);
  await validateCloudflareSessionEndpoint(env);
  await validateCloudflareAiEndpoint(env);
  console.log('Analytics AI analyst artifacts valid.');
}

main().catch(function (error) {
  console.error(error && error.message ? error.message : error);
  process.exit(1);
});
