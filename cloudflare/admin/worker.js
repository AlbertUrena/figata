const analyticsAiAnalyst = require('../../shared/analytics-ai-analyst.js');
const access = require('../common/access.js');
const analyticsReportService = require('../common/analytics-report-service.js');
const snapshotService = require('../common/analytics-snapshot.js');
const http = require('../common/http.js');
const publishLock = require('../common/publish-lock.js');
const publishService = require('../common/publish-service.js');
const { normalizeText } = require('../common/pathing.js');

const MAX_BODY_SIZE_BYTES = 2 * 1024 * 1024;

function buildScopeMode(url) {
  return normalizeText(url.searchParams.get('scope'), 'all_traffic');
}

function buildSnapshotFilters(url) {
  return {
    entry_source: normalizeText(url.searchParams.get('entry_source'), 'all'),
    visit_context: normalizeText(url.searchParams.get('visit_context'), 'all'),
    visitor_type: normalizeText(url.searchParams.get('visitor_type'), 'all'),
    route_name: normalizeText(url.searchParams.get('route_name'), 'all'),
    device_type: normalizeText(url.searchParams.get('device_type'), 'all'),
  };
}

async function requireSessionOrResponse(request, env) {
  const result = await access.requireAccessSession(request, env);
  if (result.ok) {
    return { session: result.session, response: null };
  }
  return {
    session: null,
    response: http.jsonResponse(401, {
      error: result.error || 'Unauthorized',
      authenticated: false,
    }),
  };
}

async function handleSession(request, env) {
  const auth = await requireSessionOrResponse(request, env);
  if (auth.response) {
    return auth.response;
  }

  return http.jsonResponse(200, access.buildSessionPayload(auth.session));
}

async function handleAnalyticsSnapshot(request, env) {
  const auth = await requireSessionOrResponse(request, env);
  if (auth.response) {
    return auth.response;
  }

  const url = new URL(request.url);
  const payload = await snapshotService.buildAnalyticsSnapshotPayload({
    bucket: env.ANALYTICS_BUCKET,
    fromDate: normalizeText(url.searchParams.get('from')),
    toDate: normalizeText(url.searchParams.get('to')),
    rawPrefix: normalizeText(env.FIGATA_ANALYTICS_RAW_PREFIX, 'raw'),
    limit: Number(url.searchParams.get('limit') || 0),
    scopeMode: buildScopeMode(url),
    filters: buildSnapshotFilters(url),
    logPath: 'r2://' + normalizeText(env.ANALYTICS_BUCKET_NAME, 'figata-analytics') + '/' + normalizeText(env.FIGATA_ANALYTICS_RAW_PREFIX, 'raw'),
  });

  return http.jsonResponse(200, payload);
}

async function handleAiAnalyst(request, env) {
  const auth = await requireSessionOrResponse(request, env);
  if (auth.response) {
    return auth.response;
  }

  let payload;
  try {
    payload = await http.readJsonBody(request, { maxBytes: MAX_BODY_SIZE_BYTES });
  } catch (error) {
    return http.jsonResponse(error && error.message === 'Payload too large' ? 413 : 400, {
      error: error && error.message ? error.message : 'Invalid AI analyst payload',
    });
  }

  if (!payload || typeof payload !== 'object' || typeof payload.question !== 'string' || !payload.question.trim()) {
    return http.jsonResponse(400, {
      error: 'Invalid AI analyst payload. Expected { question: string }',
    });
  }

  try {
    const reports = await analyticsReportService.loadLatestReportsFromR2(env.ANALYTICS_BUCKET, {
      artifactPrefix: normalizeText(env.FIGATA_ANALYTICS_ARTIFACT_PREFIX, 'artifacts'),
    });
    const liveSnapshot = await snapshotService.buildAnalyticsSnapshotPayload({
      bucket: env.ANALYTICS_BUCKET,
      fromDate: payload.filters && payload.filters.from ? payload.filters.from : '',
      toDate: payload.filters && payload.filters.to ? payload.filters.to : '',
      rawPrefix: normalizeText(env.FIGATA_ANALYTICS_RAW_PREFIX, 'raw'),
      limit: 0,
      scopeMode: payload.filters && payload.filters.includeInternal ? 'all_traffic' : 'business_only',
      filters: payload.filters || {},
      logPath: 'r2://' + normalizeText(env.ANALYTICS_BUCKET_NAME, 'figata-analytics') + '/' + normalizeText(env.FIGATA_ANALYTICS_RAW_PREFIX, 'raw'),
    });
    const response = await analyticsAiAnalyst.buildAnswerBundle(payload, {
      provider: normalizeText(env.OPENAI_API_KEY) ? 'openai' : 'mock',
      model: payload.model,
      reasoningEffort: payload.reasoning_effort || payload.reasoningEffort,
      reports: reports,
      live: analyticsAiAnalyst.buildLiveContext(liveSnapshot),
    });
    return http.jsonResponse(200, response);
  } catch (error) {
    return http.jsonResponse(500, {
      error: error && error.message ? error.message : 'Unable to answer AI analyst request',
    });
  }
}

async function handlePublish(request, env) {
  const auth = await requireSessionOrResponse(request, env);
  if (auth.response) {
    return auth.response;
  }

  let payload;
  try {
    payload = await http.readJsonBody(request, { maxBytes: MAX_BODY_SIZE_BYTES });
  } catch (error) {
    return http.jsonResponse(error && error.message === 'Payload too large' ? 413 : 400, {
      error: error && error.message ? error.message : 'Invalid publish payload',
    });
  }

  let lease = null;
  try {
    lease = await publishLock.acquirePublishLease(env, {
      user_key: access.getUserKey(auth.session),
      target: payload && payload.target,
    });
  } catch (error) {
    return http.jsonResponse(error.statusCode || 409, error.payload || {
      error: error && error.message ? error.message : 'Unable to acquire publish lock',
    });
  }

  try {
    const result = await publishService.publishDrafts(payload, {
      githubToken: normalizeText(env.GITHUB_TOKEN || env.GH_TOKEN),
      githubOwner: normalizeText(env.GITHUB_OWNER || env.GH_OWNER),
      githubRepo: normalizeText(env.GITHUB_REPO || env.GH_REPO),
      productionBranch: normalizeText(env.GITHUB_BRANCH || env.GH_BRANCH, 'master'),
      previewBranch: normalizeText(env.CMS_PREVIEW_BRANCH, 'cms-preview'),
      session: auth.session,
    });
    return http.jsonResponse(result.statusCode || 200, Object.assign({}, result.payload, {
      actor: {
        email: auth.session.email,
        name: auth.session.name,
      },
      lease_id: lease && lease.lease_id ? lease.lease_id : '',
    }));
  } finally {
    if (lease && lease.lease_id) {
      await publishLock.releasePublishLease(env, lease.lease_id);
    }
  }
}

async function handleRequest(request, env) {
  const url = new URL(request.url);

  if (url.pathname === '/') {
    return http.redirectResponse('/admin/app/');
  }
  if (url.pathname === '/api/session') {
    return handleSession(request, env);
  }
  if (url.pathname === '/api/analytics/snapshot') {
    return handleAnalyticsSnapshot(request, env);
  }
  if (url.pathname === '/api/analytics/ai-analyst') {
    return handleAiAnalyst(request, env);
  }
  if (url.pathname === '/api/publish') {
    return handlePublish(request, env);
  }

  return env.ASSETS.fetch(request);
}

module.exports = {
  default: {
    fetch: handleRequest,
  },
  handleAiAnalyst,
  handleAnalyticsSnapshot,
  handlePublish,
  handleRequest,
  handleSession,
};
