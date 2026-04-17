var path = require('path');
var analyticsAiAnalyst = require('../../shared/analytics-ai-analyst.js');

function jsonResponse(statusCode, payload) {
  return {
    statusCode: statusCode,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  };
}

async function parseJsonBody(eventBody) {
  if (!eventBody) {
    return null;
  }

  try {
    return JSON.parse(String(eventBody));
  } catch (_error) {
    return null;
  }
}

exports.handler = async function (event) {
  if (!event || event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  var payload = await parseJsonBody(event.body);
  if (!payload || typeof payload !== 'object' || typeof payload.question !== 'string' || !payload.question.trim()) {
    return jsonResponse(400, { error: 'Invalid AI analyst payload. Expected { question: string }' });
  }

  try {
    var response = await analyticsAiAnalyst.buildAnswerBundle(payload, {
      provider: payload.provider || 'auto',
      model: payload.model,
      reasoningEffort: payload.reasoning_effort || payload.reasoningEffort,
      reports: analyticsAiAnalyst.loadLatestReports(path.join(process.cwd(), 'analytics-output', 'latest', 'ai-reports')),
      live: null,
    });
    return jsonResponse(200, response);
  } catch (error) {
    return jsonResponse(500, {
      error: error && error.message ? error.message : 'Unable to answer AI analyst request'
    });
  }
};
