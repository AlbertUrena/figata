const DEFAULT_RESPONSES_URL = 'https://api.openai.com/v1/responses';

function normalizeText(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed || fallback;
}

function extractResponseText(responseJson) {
  if (typeof responseJson.output_text === 'string' && responseJson.output_text.trim()) {
    return responseJson.output_text.trim();
  }

  const parts = [];
  const outputItems = Array.isArray(responseJson.output) ? responseJson.output : [];
  outputItems.forEach(function (outputItem) {
    const contentItems = Array.isArray(outputItem && outputItem.content) ? outputItem.content : [];
    contentItems.forEach(function (contentItem) {
      if (contentItem && contentItem.type === 'output_text' && typeof contentItem.text === 'string') {
        parts.push(contentItem.text);
      }
    });
  });

  return parts.join('\n').trim();
}

async function callStructuredResponse(options) {
  const source = options && typeof options === 'object' ? options : {};
  const apiKey = normalizeText(source.apiKey || process.env.OPENAI_API_KEY);
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for structured responses');
  }

  const requestBody = {
    model: normalizeText(source.model, 'gpt-5.2'),
    reasoning: {
      effort: normalizeText(source.reasoningEffort, 'medium'),
    },
    max_output_tokens: Number.isFinite(Number(source.maxOutputTokens)) ? Math.round(Number(source.maxOutputTokens)) : 1800,
    input: [
      {
        role: 'system',
        content: [
          {
            type: 'input_text',
            text: normalizeText(source.systemPrompt),
          },
        ],
      },
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: normalizeText(source.userPrompt),
          },
        ],
      },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: normalizeText(source.schemaName, 'structured_output'),
        strict: true,
        schema: source.schema || { type: 'object' },
      },
    },
  };

  if (normalizeText(source.previousResponseId)) {
    requestBody.previous_response_id = normalizeText(source.previousResponseId);
  }

  const response = await fetch(normalizeText(source.url, DEFAULT_RESPONSES_URL), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI Responses API failed (${response.status}): ${errorText}`);
  }

  const responseJson = await response.json();
  const outputText = extractResponseText(responseJson);
  if (!outputText) {
    throw new Error('OpenAI Responses API returned an empty structured output');
  }

  let parsed;
  try {
    parsed = JSON.parse(outputText);
  } catch (error) {
    throw new Error(`Unable to parse OpenAI structured output: ${error.message}`);
  }

  return {
    requestBody,
    responseJson,
    parsedOutput: parsed,
    responseId: normalizeText(responseJson.id, 'unknown'),
    status: normalizeText(responseJson.status, 'completed'),
    usage: responseJson.usage || null,
    model: requestBody.model,
    reasoningEffort: requestBody.reasoning.effort,
  };
}

module.exports = {
  DEFAULT_RESPONSES_URL,
  extractResponseText,
  callStructuredResponse,
};
