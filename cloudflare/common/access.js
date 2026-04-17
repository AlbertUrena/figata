const {
  base64UrlToBytes,
  decodeBase64UrlJson,
  normalizeText,
} = require('./base64.js');

const DEFAULT_TEAM_DOMAIN = 'https://trattoriafigata.cloudflareaccess.com';
const JWKS_CACHE_TTL_MS = 5 * 60 * 1000;
const jwksCache = new Map();
const cryptoKeyCache = new Map();

function getSubtleCrypto() {
  if (globalThis.crypto && globalThis.crypto.subtle) {
    return globalThis.crypto.subtle;
  }

  try {
    const nodeCrypto = require('crypto');
    if (nodeCrypto && nodeCrypto.webcrypto && nodeCrypto.webcrypto.subtle) {
      return nodeCrypto.webcrypto.subtle;
    }
  } catch (_error) {
    // ignore
  }

  return null;
}

function resolveTeamDomain(env) {
  var value = normalizeText(
    env && (
      env.FIGATA_ACCESS_TEAM_DOMAIN ||
      env.CLOUDFLARE_ACCESS_TEAM_DOMAIN ||
      env.ACCESS_TEAM_DOMAIN
    ),
    DEFAULT_TEAM_DOMAIN
  );

  if (!/^https?:\/\//i.test(value)) {
    return 'https://' + value.replace(/^\/+/, '');
  }

  return value.replace(/\/+$/, '');
}

function parseAllowedAudiences(env) {
  var rawValue = normalizeText(
    env && (
      env.FIGATA_ACCESS_ALLOWED_AUDS ||
      env.ACCESS_ALLOWED_AUDS ||
      env.ACCESS_POLICY_AUD ||
      env.POLICY_AUD
    )
  );

  if (!rawValue) {
    return [];
  }

  return rawValue
    .split(',')
    .map(function (entry) { return normalizeText(entry); })
    .filter(Boolean);
}

function parseJwt(token) {
  var normalizedToken = normalizeText(token);
  if (!normalizedToken) {
    return null;
  }

  var parts = normalizedToken.split('.');
  if (parts.length !== 3) {
    return null;
  }

  return {
    token: normalizedToken,
    parts: parts,
    header: decodeBase64UrlJson(parts[0]),
    payload: decodeBase64UrlJson(parts[1]),
    signatureBytes: base64UrlToBytes(parts[2]),
    signingInput: new TextEncoder().encode(parts[0] + '.' + parts[1]),
  };
}

function deriveDisplayName(email, jwtPayload) {
  var payload = jwtPayload && typeof jwtPayload === 'object' ? jwtPayload : {};
  var name = normalizeText(
    payload.name ||
    payload.given_name ||
    payload.nickname ||
    payload.preferred_username
  );
  if (name) {
    return name;
  }

  var localPart = normalizeText(email).split('@')[0] || 'Usuario';
  return localPart;
}

function findSigningKey(jwks, header) {
  var source = jwks && typeof jwks === 'object' ? jwks : {};
  var keys = Array.isArray(source.keys) ? source.keys : [];
  var kid = normalizeText(header && header.kid);
  if (!keys.length || !kid) {
    return null;
  }

  return keys.find(function (entry) {
    return normalizeText(entry && entry.kid) === kid;
  }) || null;
}

async function fetchJwks(teamDomain, options) {
  var cacheKey = resolveTeamDomain({ FIGATA_ACCESS_TEAM_DOMAIN: teamDomain });
  var cached = jwksCache.get(cacheKey);
  var now = Date.now();
  if (cached && cached.expiresAt > now && !(options && options.forceRefresh)) {
    return cached.payload;
  }

  var response = await fetch(cacheKey + '/cdn-cgi/access/certs', {
    headers: {
      Accept: 'application/json',
      'Cache-Control': 'no-store',
    },
  });
  if (!response.ok) {
    throw new Error('Unable to download Cloudflare Access signing keys (' + response.status + ')');
  }

  var payload = await response.json();
  jwksCache.set(cacheKey, {
    payload: payload,
    expiresAt: now + JWKS_CACHE_TTL_MS,
  });
  return payload;
}

async function importVerificationKey(jwk) {
  var subtle = getSubtleCrypto();
  if (!subtle) {
    throw new Error('WebCrypto subtle API is required to validate Cloudflare Access JWTs');
  }

  var cacheKey = normalizeText(jwk && jwk.kid) + '::' + normalizeText(jwk && jwk.n);
  if (cryptoKeyCache.has(cacheKey)) {
    return cryptoKeyCache.get(cacheKey);
  }

  var importPromise = subtle.importKey(
    'jwk',
    jwk,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['verify']
  );

  cryptoKeyCache.set(cacheKey, importPromise);
  return importPromise;
}

function verifyStandardClaims(payload, env) {
  var safePayload = payload && typeof payload === 'object' ? payload : {};
  var errors = [];
  var nowSeconds = Math.floor(Date.now() / 1000);
  var issuer = normalizeText(safePayload.iss);
  var expectedIssuer = resolveTeamDomain(env);
  var audiences = parseAllowedAudiences(env);
  var tokenAudiences = Array.isArray(safePayload.aud)
    ? safePayload.aud.map(function (entry) { return normalizeText(entry); }).filter(Boolean)
    : [normalizeText(safePayload.aud)].filter(Boolean);

  if (!issuer || issuer !== expectedIssuer) {
    errors.push('Unexpected Access issuer');
  }
  if (!safePayload.exp || Number(safePayload.exp) <= nowSeconds) {
    errors.push('Access token has expired');
  }
  if (safePayload.nbf && Number(safePayload.nbf) > nowSeconds + 30) {
    errors.push('Access token is not active yet');
  }
  if (audiences.length && !audiences.some(function (entry) { return tokenAudiences.indexOf(entry) !== -1; })) {
    errors.push('Access token audience is not allowed');
  }

  return {
    ok: errors.length === 0,
    errors: errors,
    audiences: tokenAudiences,
  };
}

async function verifyAccessJwt(jwt, env) {
  var parsed = parseJwt(jwt);
  if (!parsed || !parsed.header || !parsed.payload) {
    return {
      ok: false,
      error: 'Missing or malformed Cloudflare Access JWT',
      payload: null,
    };
  }

  if (normalizeText(parsed.header.alg) !== 'RS256') {
    return {
      ok: false,
      error: 'Unsupported Cloudflare Access JWT algorithm',
      payload: parsed.payload,
    };
  }

  var teamDomain = resolveTeamDomain(env);
  var jwks = await fetchJwks(teamDomain);
  var signingKey = findSigningKey(jwks, parsed.header);
  if (!signingKey) {
    return {
      ok: false,
      error: 'Unable to resolve Cloudflare Access signing key',
      payload: parsed.payload,
    };
  }

  var cryptoKey = await importVerificationKey(signingKey);
  var subtle = getSubtleCrypto();
  var validSignature = await subtle.verify(
    { name: 'RSASSA-PKCS1-v1_5' },
    cryptoKey,
    parsed.signatureBytes,
    parsed.signingInput
  );
  if (!validSignature) {
    return {
      ok: false,
      error: 'Cloudflare Access JWT signature verification failed',
      payload: parsed.payload,
    };
  }

  var claims = verifyStandardClaims(parsed.payload, env);
  if (!claims.ok) {
    return {
      ok: false,
      error: claims.errors.join('; '),
      payload: parsed.payload,
    };
  }

  return {
    ok: true,
    error: '',
    payload: parsed.payload,
    header: parsed.header,
    teamDomain: teamDomain,
    aud: claims.audiences,
  };
}

function buildSessionPayload(session) {
  if (!session) {
    return null;
  }

  return {
    authenticated: true,
    user: {
      email: normalizeText(session.email),
      display_name: normalizeText(session.name),
      name: normalizeText(session.name),
      sub: normalizeText(session.sub),
      identity_provider: normalizeText(session.identity_provider, 'google'),
    },
    access: {
      team_domain: normalizeText(session.team_domain),
      logout_url: '/cdn-cgi/access/logout',
    },
  };
}

async function requireAccessSession(request, env) {
  var jwt = normalizeText(request && request.headers && request.headers.get('Cf-Access-Jwt-Assertion'));
  var emailHeader = normalizeText(request && request.headers && request.headers.get('Cf-Access-Authenticated-User-Email'));
  var skipVerification = normalizeText(env && env.FIGATA_ACCESS_SKIP_VERIFY) === '1';
  var verification = skipVerification
    ? {
        ok: true,
        error: '',
        payload: parseJwt(jwt) ? parseJwt(jwt).payload : null,
        teamDomain: resolveTeamDomain(env),
        aud: [],
      }
    : await verifyAccessJwt(jwt, env);

  if (!verification.ok) {
    return {
      ok: false,
      error: verification.error || 'Unauthorized',
      session: null,
    };
  }

  var payload = verification.payload || {};
  var resolvedEmail = emailHeader || normalizeText(payload.email);
  if (!resolvedEmail) {
    return {
      ok: false,
      error: 'Authenticated session is missing an email address',
      session: null,
    };
  }

  return {
    ok: true,
    error: '',
    session: {
      email: resolvedEmail,
      name: deriveDisplayName(resolvedEmail, payload),
      sub: normalizeText(payload.sub),
      aud: Array.isArray(verification.aud) ? verification.aud.slice() : [],
      identity_provider: normalizeText(payload.identity_provider || payload.idp && payload.idp.id, 'google'),
      team_domain: normalizeText(verification.teamDomain, resolveTeamDomain(env)),
      jwt_payload: payload,
    },
  };
}

function getUserKey(session) {
  if (!session || typeof session !== 'object') {
    return 'anonymous';
  }
  return normalizeText(session.sub || session.email, 'anonymous');
}

module.exports = {
  buildSessionPayload,
  decodeJwtPayload: function decodeJwtPayload(jwt) {
    var parsed = parseJwt(jwt);
    return parsed ? parsed.payload : null;
  },
  getUserKey,
  parseAllowedAudiences,
  requireAccessSession,
  resolveTeamDomain,
  verifyAccessJwt,
};
