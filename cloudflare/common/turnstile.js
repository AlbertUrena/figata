const { normalizeText } = require('./pathing.js');

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

function getEnvironmentName(env) {
  return normalizeText(env && env.FIGATA_ENV, 'production').toLowerCase();
}

function getRequestIp(request) {
  if (!request || !request.headers || typeof request.headers.get !== 'function') {
    return '';
  }

  return normalizeText(
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip')
  );
}

async function validateTurnstileToken(env, token, request) {
  const secretKey = normalizeText(env && env.TURNSTILE_SECRET_KEY);
  const environmentName = getEnvironmentName(env);
  const responseToken = normalizeText(token);

  if (!secretKey) {
    if (environmentName === 'production') {
      return {
        ok: false,
        statusCode: 500,
        payload: {
          error: 'La verificación de seguridad no está configurada correctamente.',
          code: 'turnstile_not_configured',
        },
      };
    }

    return {
      ok: true,
      skipped: true,
    };
  }

  if (!responseToken) {
    return {
      ok: false,
      statusCode: 400,
      payload: {
        error: 'Completa la verificación de seguridad para continuar.',
        code: 'turnstile_required',
      },
    };
  }

  const body = new URLSearchParams();
  body.set('secret', secretKey);
  body.set('response', responseToken);

  const requestIp = getRequestIp(request);
  if (requestIp) {
    body.set('remoteip', requestIp);
  }

  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    body.set('idempotency_key', crypto.randomUUID());
  }

  let response;
  try {
    response = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });
  } catch (_error) {
    return {
      ok: false,
      statusCode: 502,
      payload: {
        error: 'No pudimos validar la verificación de seguridad ahora mismo.',
        code: 'turnstile_unreachable',
      },
    };
  }

  const payload = await response.json().catch(function () { return {}; });
  if (!response.ok || payload.success !== true) {
    return {
      ok: false,
      statusCode: 400,
      payload: {
        error: 'No pudimos validar la verificación de seguridad. Intenta de nuevo.',
        code: 'turnstile_failed',
        turnstile_error_codes: Array.isArray(payload['error-codes']) ? payload['error-codes'] : [],
      },
    };
  }

  return {
    ok: true,
    skipped: false,
    payload: payload,
  };
}

module.exports = {
  validateTurnstileToken,
};
