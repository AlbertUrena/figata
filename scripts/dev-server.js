const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { URL } = require("url");
const { generateHomeFeatured } = require("./generate-home-featured");
const analyticsPipeline = require("../shared/analytics-pipeline.js");
const analyticsQuality = require("../shared/analytics-quality.js");
const analyticsKpiCatalog = require("../shared/analytics-kpi-catalog.js");
const analyticsCohorts = require("../shared/analytics-cohorts.js");
const analyticsAiAnalyst = require("../shared/analytics-ai-analyst.js");

const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT) || 5173;
const rootDir = process.cwd();
const LOCAL_SAVE_DRAFTS_ENDPOINT = "/__local/save-drafts";
const LOCAL_MENU_MEDIA_OPTIONS_ENDPOINT = "/__local/menu-media-paths";
const LOCAL_ANALYTICS_COLLECT_ENDPOINT = "/__analytics/collect";
const LOCAL_ANALYTICS_INSPECT_ENDPOINT = "/__analytics/inspect";
const LOCAL_ANALYTICS_AI_ANALYST_ENDPOINT = "/__analytics/ai-analyst";
const CLOUDFLARE_SESSION_ENDPOINT = "/api/session";
const CLOUDFLARE_PUBLISH_ENDPOINT = "/api/publish";
const CLOUDFLARE_ANALYTICS_COLLECT_ENDPOINT = "/api/analytics/collect";
const CLOUDFLARE_ANALYTICS_SNAPSHOT_ENDPOINT = "/api/analytics/snapshot";
const CLOUDFLARE_ANALYTICS_AI_ANALYST_ENDPOINT = "/api/analytics/ai-analyst";
const ANALYTICS_LOG_PATH = path.join(os.tmpdir(), "figata-analytics-dev.ndjson");
const MENU_MEDIA_ROOT_DIR = path.join(rootDir, "assets", "menu");
const MENU_ROUTE_SHELL_PATH = path.join(rootDir, "menu", "index.html");
const MAX_BODY_SIZE_BYTES = 5 * 1024 * 1024;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

function sendJson(res, status, payload) {
  send(res, status, JSON.stringify(payload), {
    "Content-Type": "application/json; charset=utf-8"
  });
}

function safePathFromUrl(requestUrl) {
  let pathname;
  try {
    const url = new URL(requestUrl, `http://${host}:${port}`);
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return null;
  }

  const normalized = path.normalize(pathname);
  const relative = normalized.replace(/^([/\\])+/, "");
  return path.join(rootDir, relative);
}

function isPathInsideRoot(filePath) {
  const relative = path.relative(rootDir, filePath);
  return (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  );
}

function isMenuDetailPathname(pathname) {
  if (typeof pathname !== "string" || !pathname.startsWith("/menu/")) {
    return false;
  }

  const segments = pathname
    .slice("/menu/".length)
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length !== 1) {
    return false;
  }

  return path.extname(segments[0]) === "";
}

function readRequestBody(req, maxBytes) {
  return new Promise((resolve, reject) => {
    let body = "";
    let bodySize = 0;

    req.on("data", (chunk) => {
      bodySize += chunk.length;
      if (bodySize > maxBytes) {
        reject(new Error("Payload too large"));
        req.destroy();
        return;
      }
      body += chunk.toString("utf8");
    });

    req.on("end", () => {
      resolve(body);
    });

    req.on("error", reject);
  });
}

function writeJsonFile(relativePath, payload) {
  const absolutePath = path.join(rootDir, relativePath);
  if (!isPathInsideRoot(absolutePath)) {
    throw new Error("Forbidden path");
  }
  fs.writeFileSync(absolutePath, JSON.stringify(payload, null, 2) + "\n", "utf8");
}

function syncDerivedHomeFeatured() {
  const result = generateHomeFeatured({
    rootDir,
    write: true,
    silent: true
  });

  if (Array.isArray(result.errors) && result.errors.length) {
    throw new Error(result.errors.join(" | "));
  }

  return result;
}

function listMenuMediaPaths() {
  const allowedExtensions = new Set([".webp", ".svg", ".webm", ".mp4"]);
  const result = [];
  const stack = [MENU_MEDIA_ROOT_DIR];

  while (stack.length > 0) {
    const currentPath = stack.pop();
    if (!currentPath) continue;

    let entries;
    try {
      entries = fs.readdirSync(currentPath, { withFileTypes: true });
    } catch {
      continue;
    }

    entries.forEach((entry) => {
      const absolutePath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        stack.push(absolutePath);
        return;
      }

      if (!entry.isFile()) return;

      const extension = path.extname(entry.name).toLowerCase();
      if (!allowedExtensions.has(extension)) return;

      const relativePath = path.relative(rootDir, absolutePath).replace(/\\/g, "/");
      if (!relativePath) return;
      result.push(relativePath);
    });
  }

  result.sort((a, b) => a.localeCompare(b));
  return result;
}

function appendAnalyticsBatch(events) {
  if (!Array.isArray(events) || !events.length) {
    return;
  }

  const lines = events
    .map((eventPayload) => JSON.stringify(eventPayload))
    .join("\n") + "\n";

  fs.appendFileSync(ANALYTICS_LOG_PATH, lines, "utf8");
}

function readAnalyticsLog(limit = 25) {
  try {
    const raw = fs.readFileSync(ANALYTICS_LOG_PATH, "utf8");
    const lines = raw
      .split("\n")
      .filter(Boolean);
    const normalizedLimit = Number.isFinite(limit) && limit > 0
      ? Math.max(1, Math.round(limit))
      : 0;

    return lines
      .slice(normalizedLimit ? -normalizedLimit : 0 || undefined)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function normalizeText(value, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed || fallback;
}

function toEventTimeMs(eventPayload) {
  const parsed = Date.parse(
    normalizeText(eventPayload && eventPayload.occurred_at)
  );
  return Number.isFinite(parsed) ? parsed : 0;
}

function diffMs(startMs, endMs) {
  if (!(startMs > 0) || !(endMs > 0) || endMs < startMs) {
    return null;
  }

  return endMs - startMs;
}

function averageNumbers(values) {
  const numericValues = (Array.isArray(values) ? values : []).filter((value) =>
    typeof value === "number" && Number.isFinite(value)
  );

  if (!numericValues.length) {
    return null;
  }

  const total = numericValues.reduce((sum, value) => sum + value, 0);
  return Math.round(total / numericValues.length);
}

function buildPercentiles(values) {
  const numericValues = (Array.isArray(values) ? values : [])
    .filter((value) => typeof value === "number" && Number.isFinite(value))
    .sort((left, right) => left - right);

  if (!numericValues.length) {
    return {
      count: 0,
      p50: null,
      p75: null,
      p90: null,
    };
  }

  const pick = (percentile) => {
    const index = Math.min(
      numericValues.length - 1,
      Math.max(0, Math.ceil(numericValues.length * percentile) - 1)
    );
    return numericValues[index];
  };

  return {
    count: numericValues.length,
    p50: pick(0.5),
    p75: pick(0.75),
    p90: pick(0.9),
  };
}

function buildBehaviorProfile(sessionSummary) {
  if (!sessionSummary || typeof sessionSummary !== "object") {
    return "explorador";
  }

  const hasDecision = sessionSummary.result === "purchase" || sessionSummary.result === "cart";
  const lowExploration =
    sessionSummary.uniqueDetailOpens <= 2 &&
    (
      sessionSummary.detailOpensBeforePurchase <= 2 ||
      sessionSummary.detailOpensBeforeAddToCart <= 2 ||
      sessionSummary.detailOpens <= 2
    );
  const heavyExploration =
    sessionSummary.uniqueDetailOpens >= 6 || sessionSummary.detailOpens >= 6;

  if (hasDecision && lowExploration) {
    return "decidido";
  }

  if (!hasDecision && heavyExploration) {
    return "indeciso";
  }

  if (sessionSummary.result !== "purchase" && heavyExploration) {
    return "indeciso";
  }

  return "explorador";
}

function summarizeSessionsByKey(sessionSummaries, key) {
  return (Array.isArray(sessionSummaries) ? sessionSummaries : []).reduce((accumulator, session) => {
    const groupKey = normalizeText(session && session[key], "unknown");

    if (!accumulator[groupKey]) {
      accumulator[groupKey] = {
        sessionCount: 0,
        resultCounts: {
          purchase: 0,
          cart: 0,
          browse: 0,
        },
        behaviorProfiles: {
          decidido: 0,
          explorador: 0,
          indeciso: 0,
        },
        averages: {
          detailOpens: null,
          uniqueDetailOpens: null,
          detailOpensBeforeAddToCart: null,
          detailOpensBeforePurchase: null,
          timeFromFirstDetailToAddToCartMs: null,
          timeFromFirstDetailToPurchaseMs: null,
        },
        editorialTotals: {
          storyViews: 0,
          pairingViews: 0,
          galleryExpands: 0,
          videoPlays: 0,
          videoCompletes: 0,
        },
      };
    }

    const bucket = accumulator[groupKey];
    bucket.sessionCount += 1;
    bucket.resultCounts[session.result] = (bucket.resultCounts[session.result] || 0) + 1;
    bucket.behaviorProfiles[session.behaviorProfile] =
      (bucket.behaviorProfiles[session.behaviorProfile] || 0) + 1;

    bucket.editorialTotals.storyViews += session.editorial.storyViews;
    bucket.editorialTotals.pairingViews += session.editorial.pairingViews;
    bucket.editorialTotals.galleryExpands += session.editorial.galleryExpands;
    bucket.editorialTotals.videoPlays += session.editorial.videoPlays;
    bucket.editorialTotals.videoCompletes += session.editorial.videoCompletes;

    [
      "detailOpens",
      "uniqueDetailOpens",
      "detailOpensBeforeAddToCart",
      "detailOpensBeforePurchase",
      "timeFromFirstDetailToAddToCartMs",
      "timeFromFirstDetailToPurchaseMs",
    ].forEach((metricKey) => {
      if (!Array.isArray(bucket.averages[metricKey])) {
        bucket.averages[metricKey] = [];
      }

      if (typeof session[metricKey] === "number" && Number.isFinite(session[metricKey])) {
        bucket.averages[metricKey].push(session[metricKey]);
      }
    });

    return accumulator;
  }, {});
}

function finalizeGroupedSessionSummary(groupedSummary) {
  Object.keys(groupedSummary || {}).forEach((groupKey) => {
    const bucket = groupedSummary[groupKey];
    if (!bucket || typeof bucket !== "object") {
      return;
    }

    Object.keys(bucket.averages || {}).forEach((metricKey) => {
      bucket.averages[metricKey] = averageNumbers(bucket.averages[metricKey]);
    });
  });

  return groupedSummary;
}

function summarizeDecisionBehavior(events) {
  const timelineEntries = (Array.isArray(events) ? events : [])
    .filter((eventPayload) => eventPayload && typeof eventPayload === "object")
    .map((eventPayload, index) => ({
      eventPayload,
      sortIndex: index,
      eventTimeMs: toEventTimeMs(eventPayload),
      sessionId: normalizeText(eventPayload.session_id, "session_unknown"),
      eventName: normalizeText(eventPayload.event_name),
      itemId: normalizeText(eventPayload.item_id),
    }))
    .sort((left, right) => {
      if (left.eventTimeMs !== right.eventTimeMs) {
        return left.eventTimeMs - right.eventTimeMs;
      }

      return left.sortIndex - right.sortIndex;
    });

  const sessions = new Map();

  timelineEntries.forEach((entry) => {
    const existing = sessions.get(entry.sessionId) || {
      sessionId: entry.sessionId,
      visitorId: "",
      entrySource: "unknown",
      sourceMedium: "unknown",
      visitContext: "unknown",
      trafficClass: "unknown",
      startedAt: "",
      startedAtMs: 0,
      endedAt: "",
      endedAtMs: 0,
      detailItemIds: new Set(),
      detailOpens: 0,
      storyViews: 0,
      pairingViews: 0,
      galleryExpands: 0,
      videoPlays: 0,
      videoCompletes: 0,
      hasAddToCart: false,
      hasCartView: false,
      hasBeginCheckout: false,
      hasPurchase: false,
      firstDetailTimeMs: 0,
      firstAddToCartTimeMs: 0,
      firstPurchaseTimeMs: 0,
      timeline: [],
    };

    const eventPayload = entry.eventPayload;
    existing.visitorId = existing.visitorId || normalizeText(eventPayload.visitor_id);
    existing.entrySource = existing.entrySource === "unknown"
      ? normalizeText(eventPayload.entry_source, "unknown")
      : existing.entrySource;
    existing.sourceMedium = existing.sourceMedium === "unknown"
      ? normalizeText(eventPayload.source_medium, "unknown")
      : existing.sourceMedium;
    if (normalizeText(eventPayload.visit_context)) {
      existing.visitContext = normalizeText(eventPayload.visit_context, existing.visitContext || "unknown");
    }
    existing.trafficClass = existing.trafficClass === "unknown"
      ? normalizeText(eventPayload.traffic_class, "unknown")
      : existing.trafficClass;

    if (!existing.startedAtMs || (entry.eventTimeMs > 0 && entry.eventTimeMs < existing.startedAtMs)) {
      existing.startedAtMs = entry.eventTimeMs;
      existing.startedAt = normalizeText(eventPayload.occurred_at);
    }

    if (!existing.endedAtMs || entry.eventTimeMs >= existing.endedAtMs) {
      existing.endedAtMs = entry.eventTimeMs;
      existing.endedAt = normalizeText(eventPayload.occurred_at);
    }

    if (entry.eventName === "item_detail_open") {
      existing.detailOpens += 1;
      if (entry.itemId) {
        existing.detailItemIds.add(entry.itemId);
      }
      if (!existing.firstDetailTimeMs && entry.eventTimeMs > 0) {
        existing.firstDetailTimeMs = entry.eventTimeMs;
      }
    }

    if (entry.eventName === "item_story_view") {
      existing.storyViews += 1;
    }

    if (entry.eventName === "item_pairing_view") {
      existing.pairingViews += 1;
    }

    if (entry.eventName === "item_gallery_expand") {
      existing.galleryExpands += 1;
    }

    if (entry.eventName === "item_video_play") {
      existing.videoPlays += 1;
    }

    if (entry.eventName === "item_video_complete") {
      existing.videoCompletes += 1;
    }

    if (entry.eventName === "cart_view") {
      existing.hasCartView = true;
    }

    if (entry.eventName === "add_to_cart") {
      existing.hasAddToCart = true;
      if (!existing.firstAddToCartTimeMs && entry.eventTimeMs > 0) {
        existing.firstAddToCartTimeMs = entry.eventTimeMs;
      }
    }

    if (entry.eventName === "begin_checkout") {
      existing.hasBeginCheckout = true;
    }

    if (entry.eventName === "purchase") {
      existing.hasPurchase = true;
      if (!existing.firstPurchaseTimeMs && entry.eventTimeMs > 0) {
        existing.firstPurchaseTimeMs = entry.eventTimeMs;
      }
    }

    existing.timeline.push(entry);
    sessions.set(entry.sessionId, existing);
  });

  const sessionSummaries = Array.from(sessions.values())
    .map((session) => {
      session.timeline.sort((left, right) => {
        if (left.eventTimeMs !== right.eventTimeMs) {
          return left.eventTimeMs - right.eventTimeMs;
        }

        return left.sortIndex - right.sortIndex;
      });

      const firstAddToCartIndex = session.timeline.findIndex(
        (entry) => entry.eventName === "add_to_cart"
      );
      const firstPurchaseIndex = session.timeline.findIndex(
        (entry) => entry.eventName === "purchase"
      );
      const detailOpensBeforeAddToCart = firstAddToCartIndex === -1
        ? 0
        : session.timeline
            .slice(0, firstAddToCartIndex)
            .filter((entry) => entry.eventName === "item_detail_open")
            .length;
      const detailOpensBeforePurchase = firstPurchaseIndex === -1
        ? 0
        : session.timeline
            .slice(0, firstPurchaseIndex)
            .filter((entry) => entry.eventName === "item_detail_open")
            .length;
      const result = session.hasPurchase
        ? "purchase"
        : (session.hasAddToCart || session.hasCartView || session.hasBeginCheckout)
          ? "cart"
          : "browse";
      const summary = {
        sessionId: session.sessionId,
        visitorId: session.visitorId,
        entrySource: session.entrySource,
        sourceMedium: session.sourceMedium,
        visitContext: session.visitContext,
        trafficClass: session.trafficClass,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        eventCount: session.timeline.length,
        result,
        detailOpens: session.detailOpens,
        uniqueDetailOpens: session.detailItemIds.size,
        detailOpensBeforeAddToCart,
        detailOpensBeforePurchase,
        timeFromFirstDetailToAddToCartMs: diffMs(
          session.firstDetailTimeMs,
          session.firstAddToCartTimeMs
        ),
        timeFromFirstDetailToPurchaseMs: diffMs(
          session.firstDetailTimeMs,
          session.firstPurchaseTimeMs
        ),
        editorial: {
          storyViews: session.storyViews,
          pairingViews: session.pairingViews,
          galleryExpands: session.galleryExpands,
          videoPlays: session.videoPlays,
          videoCompletes: session.videoCompletes,
        },
      };

      summary.behaviorProfile = buildBehaviorProfile(summary);
      return summary;
    })
    .sort((left, right) => {
      const leftTime = Date.parse(left.endedAt || left.startedAt || "") || 0;
      const rightTime = Date.parse(right.endedAt || right.startedAt || "") || 0;
      return rightTime - leftTime;
    });

  return {
    generatedAt: new Date().toISOString(),
    eventCount: timelineEntries.length,
    sessionCount: sessionSummaries.length,
    deviceSegmentation: {
      available: false,
      reason: "Current analytics envelope does not include a device dimension yet.",
    },
    sessions: sessionSummaries,
    bySource: finalizeGroupedSessionSummary(
      summarizeSessionsByKey(sessionSummaries, "entrySource")
    ),
    byVisitContext: finalizeGroupedSessionSummary(
      summarizeSessionsByKey(sessionSummaries, "visitContext")
    ),
    byResult: finalizeGroupedSessionSummary(
      summarizeSessionsByKey(sessionSummaries, "result")
    ),
  };
}

function summarizeInStoreContext(events) {
  const timelineEntries = (Array.isArray(events) ? events : [])
    .filter((eventPayload) => eventPayload && typeof eventPayload === "object")
    .map((eventPayload, index) => ({
      eventPayload,
      sortIndex: index,
      eventTimeMs: toEventTimeMs(eventPayload),
      sessionId: normalizeText(eventPayload.session_id, "session_unknown"),
      eventName: normalizeText(eventPayload.event_name),
    }))
    .sort((left, right) => {
      if (left.eventTimeMs !== right.eventTimeMs) {
        return left.eventTimeMs - right.eventTimeMs;
      }

      return left.sortIndex - right.sortIndex;
    });

  const sessions = new Map();

  timelineEntries.forEach((entry) => {
    const eventPayload = entry.eventPayload;
    const session = sessions.get(entry.sessionId) || {
      sessionId: entry.sessionId,
      visitorId: "",
      entrySource: "unknown",
      visitContext: "unknown",
      visitContextHistory: [],
      startedAt: "",
      endedAt: "",
      wifiAssist: {
        shown: 0,
        dismissed: 0,
        copyPassword: 0,
        ctaClicks: 0,
        confirmed: 0,
        reasons: Object.create(null),
        actions: Object.create(null),
      },
    };

    session.visitorId = session.visitorId || normalizeText(eventPayload.visitor_id);
    session.entrySource = session.entrySource === "unknown"
      ? normalizeText(eventPayload.entry_source, "unknown")
      : session.entrySource;

    const visitContext = normalizeText(eventPayload.visit_context);
    if (visitContext) {
      if (!session.visitContextHistory.length || session.visitContextHistory[session.visitContextHistory.length - 1] !== visitContext) {
        session.visitContextHistory.push(visitContext);
      }
      session.visitContext = visitContext;
    }

    if (!session.startedAt || entry.eventTimeMs < (Date.parse(session.startedAt) || Number.MAX_SAFE_INTEGER)) {
      session.startedAt = normalizeText(eventPayload.occurred_at);
    }

    if (!session.endedAt || entry.eventTimeMs >= (Date.parse(session.endedAt) || 0)) {
      session.endedAt = normalizeText(eventPayload.occurred_at);
    }

    const assistReason = normalizeText(eventPayload.wifi_assist_reason);
    const assistAction = normalizeText(eventPayload.wifi_assist_action);

    if (assistReason) {
      session.wifiAssist.reasons[assistReason] =
        (session.wifiAssist.reasons[assistReason] || 0) + 1;
    }

    if (assistAction) {
      session.wifiAssist.actions[assistAction] =
        (session.wifiAssist.actions[assistAction] || 0) + 1;
    }

    if (entry.eventName === "wifi_assist_shown") {
      session.wifiAssist.shown += 1;
    }

    if (entry.eventName === "wifi_assist_dismissed") {
      session.wifiAssist.dismissed += 1;
    }

    if (entry.eventName === "wifi_assist_copy_password") {
      session.wifiAssist.copyPassword += 1;
    }

    if (entry.eventName === "wifi_assist_cta_click") {
      session.wifiAssist.ctaClicks += 1;
    }

    if (entry.eventName === "visit_context_confirmed") {
      session.wifiAssist.confirmed += 1;
    }

    sessions.set(entry.sessionId, session);
  });

  const sessionSummaries = Array.from(sessions.values())
    .map((session) => ({
      sessionId: session.sessionId,
      visitorId: session.visitorId,
      entrySource: session.entrySource,
      visitContext: session.visitContext,
      visitContextHistory: session.visitContextHistory,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      wifiAssist: session.wifiAssist,
      probableQrSession:
        session.entrySource === "qr" &&
        session.visitContextHistory.indexOf("in_restaurant_probable") !== -1,
      confirmedWifiSession:
        session.visitContext === "in_restaurant_confirmed_wifi" ||
        session.visitContextHistory.indexOf("in_restaurant_confirmed_wifi") !== -1,
    }))
    .sort((left, right) => {
      const leftTime = Date.parse(left.endedAt || left.startedAt || "") || 0;
      const rightTime = Date.parse(right.endedAt || right.startedAt || "") || 0;
      return rightTime - leftTime;
    });

  const qrSessions = sessionSummaries.filter((session) => session.entrySource === "qr");
  const confirmedWifiSessions = sessionSummaries.filter((session) => session.confirmedWifiSession);
  const wifiAssistTotals = sessionSummaries.reduce((accumulator, session) => {
    accumulator.shown += session.wifiAssist.shown;
    accumulator.dismissed += session.wifiAssist.dismissed;
    accumulator.copyPassword += session.wifiAssist.copyPassword;
    accumulator.ctaClicks += session.wifiAssist.ctaClicks;
    accumulator.confirmed += session.wifiAssist.confirmed;
    return accumulator;
  }, {
    shown: 0,
    dismissed: 0,
    copyPassword: 0,
    ctaClicks: 0,
    confirmed: 0,
  });

  return {
    generatedAt: new Date().toISOString(),
    eventCount: timelineEntries.length,
    sessionCount: sessionSummaries.length,
    qrSessionCount: qrSessions.length,
    confirmedWifiSessionCount: confirmedWifiSessions.length,
    qrConfirmationRate:
      qrSessions.length > 0
        ? Number((confirmedWifiSessions.filter((session) => session.entrySource === "qr").length / qrSessions.length).toFixed(4))
        : 0,
    wifiAssistTotals,
    sessions: sessionSummaries,
    byVisitContext: sessionSummaries.reduce((accumulator, session) => {
      const key = normalizeText(session.visitContext, "unknown");
      if (!accumulator[key]) {
        accumulator[key] = {
          sessionCount: 0,
          qrSessions: 0,
          confirmedWifiSessions: 0,
        };
      }
      accumulator[key].sessionCount += 1;
      if (session.entrySource === "qr") {
        accumulator[key].qrSessions += 1;
      }
      if (session.confirmedWifiSession) {
        accumulator[key].confirmedWifiSessions += 1;
      }
      return accumulator;
    }, Object.create(null)),
  };
}

function summarizePerformanceBaseline(events) {
  const routeBuckets = Object.create(null);
  const assetBuckets = Object.create(null);

  const ensureRouteBucket = (routeName) => {
    const normalizedRoute = normalizeText(routeName, "unknown");
    if (!routeBuckets[normalizedRoute]) {
      routeBuckets[normalizedRoute] = {
        navigationTypes: Object.create(null),
        networkTypes: Object.create(null),
        routeReadyMs: [],
        fcpMs: [],
        domInteractiveMs: [],
        pageShellVisibleMs: [],
        menuTabsVisibleMs: [],
        menuFirstRowHydratedMs: [],
        menuFullHydrationMs: [],
        detailOpenMs: [],
        detailImageVisibleMs: [],
        detailVideoReadyMs: [],
        detailCtaReadyMs: [],
        saveDataCount: 0,
        networkSampleCount: 0,
        assetEventCount: 0,
      };
    }

    return routeBuckets[normalizedRoute];
  };

  const pushIfPresent = (target, value) => {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      return;
    }

    target.push(value);
  };

  (Array.isArray(events) ? events : [])
    .filter((eventPayload) => eventPayload && typeof eventPayload === "object")
    .forEach((eventPayload) => {
      const routeName = normalizeText(eventPayload.route_name, "unknown");
      const bucket = ensureRouteBucket(routeName);
      const navigationType = normalizeText(eventPayload.navigation_type);
      const networkType = normalizeText(eventPayload.network_effective_type, "unknown");

      if (navigationType) {
        bucket.navigationTypes[navigationType] =
          (bucket.navigationTypes[navigationType] || 0) + 1;
      }

      if (networkType && networkType !== "unknown") {
        bucket.networkTypes[networkType] = (bucket.networkTypes[networkType] || 0) + 1;
      }

      if (typeof eventPayload.network_save_data === "boolean") {
        bucket.networkSampleCount += 1;
        if (eventPayload.network_save_data) {
          bucket.saveDataCount += 1;
        }
      }

      if (eventPayload.event_name === "route_ready") {
        pushIfPresent(bucket.routeReadyMs, Number(eventPayload.route_ready_ms));
      }

      if (eventPayload.event_name === "performance_summary") {
        pushIfPresent(bucket.fcpMs, Number(eventPayload.fcp_ms));
        pushIfPresent(bucket.domInteractiveMs, Number(eventPayload.dom_interactive_ms));

        if (typeof eventPayload.page_shell_visible_ms !== "undefined") {
          pushIfPresent(bucket.pageShellVisibleMs, Number(eventPayload.page_shell_visible_ms));
        }
        if (typeof eventPayload.menu_tabs_visible_ms !== "undefined") {
          pushIfPresent(bucket.menuTabsVisibleMs, Number(eventPayload.menu_tabs_visible_ms));
        }
        if (typeof eventPayload.menu_first_row_hydrated_ms !== "undefined") {
          pushIfPresent(
            bucket.menuFirstRowHydratedMs,
            Number(eventPayload.menu_first_row_hydrated_ms)
          );
        }
        if (typeof eventPayload.menu_full_hydration_ms !== "undefined") {
          pushIfPresent(bucket.menuFullHydrationMs, Number(eventPayload.menu_full_hydration_ms));
        }
        if (typeof eventPayload.detail_open_ms !== "undefined") {
          pushIfPresent(bucket.detailOpenMs, Number(eventPayload.detail_open_ms));
        }
        if (typeof eventPayload.detail_image_visible_ms !== "undefined") {
          pushIfPresent(
            bucket.detailImageVisibleMs,
            Number(eventPayload.detail_image_visible_ms)
          );
        }
        if (typeof eventPayload.detail_video_ready_ms !== "undefined") {
          pushIfPresent(
            bucket.detailVideoReadyMs,
            Number(eventPayload.detail_video_ready_ms)
          );
        }
        if (typeof eventPayload.detail_cta_ready_ms !== "undefined") {
          pushIfPresent(bucket.detailCtaReadyMs, Number(eventPayload.detail_cta_ready_ms));
        }
      }

      if (eventPayload.event_name === "asset_load_timing") {
        bucket.assetEventCount += 1;

        const assetName = normalizeText(eventPayload.asset_name);
        const assetType = normalizeText(eventPayload.asset_type);
        if (!assetName || !assetType) {
          return;
        }

        const assetKey = [routeName, assetType, assetName].join("|");
        if (!assetBuckets[assetKey]) {
          assetBuckets[assetKey] = {
            routeName,
            assetName,
            assetType,
            loadMs: [],
            sizeBytes: [],
            sampleCount: 0,
          };
        }

        assetBuckets[assetKey].sampleCount += 1;
        assetBuckets[assetKey].loadMs.push(Number(eventPayload.asset_load_ms) || 0);
        assetBuckets[assetKey].sizeBytes.push(Number(eventPayload.asset_size_bytes) || 0);
      }
    });

  const byRoute = Object.keys(routeBuckets).reduce((accumulator, routeName) => {
    const bucket = routeBuckets[routeName];
    accumulator[routeName] = {
      navigationTypes: bucket.navigationTypes,
      networkTypes: bucket.networkTypes,
      saveDataRate:
        bucket.networkSampleCount > 0
          ? Number((bucket.saveDataCount / bucket.networkSampleCount).toFixed(4))
          : 0,
      assetEventCount: bucket.assetEventCount,
      routeReadyMs: buildPercentiles(bucket.routeReadyMs),
      fcpMs: buildPercentiles(bucket.fcpMs),
      domInteractiveMs: buildPercentiles(bucket.domInteractiveMs),
      pageShellVisibleMs: buildPercentiles(bucket.pageShellVisibleMs),
      menuTabsVisibleMs: buildPercentiles(bucket.menuTabsVisibleMs),
      menuFirstRowHydratedMs: buildPercentiles(bucket.menuFirstRowHydratedMs),
      menuFullHydrationMs: buildPercentiles(bucket.menuFullHydrationMs),
      detailOpenMs: buildPercentiles(bucket.detailOpenMs),
      detailImageVisibleMs: buildPercentiles(bucket.detailImageVisibleMs),
      detailVideoReadyMs: buildPercentiles(bucket.detailVideoReadyMs),
      detailCtaReadyMs: buildPercentiles(bucket.detailCtaReadyMs),
    };
    return accumulator;
  }, {});

  const heavyAssets = Object.values(assetBuckets)
    .map((assetBucket) => ({
      routeName: assetBucket.routeName,
      assetName: assetBucket.assetName,
      assetType: assetBucket.assetType,
      sampleCount: assetBucket.sampleCount,
      loadMs: buildPercentiles(assetBucket.loadMs),
      maxSizeBytes: Math.max(...assetBucket.sizeBytes, 0),
    }))
    .sort((left, right) => {
      const rightP90 = right.loadMs && typeof right.loadMs.p90 === "number" ? right.loadMs.p90 : -1;
      const leftP90 = left.loadMs && typeof left.loadMs.p90 === "number" ? left.loadMs.p90 : -1;
      if (rightP90 !== leftP90) {
        return rightP90 - leftP90;
      }

      return right.maxSizeBytes - left.maxSizeBytes;
    })
    .slice(0, 10);

  return {
    generatedAt: new Date().toISOString(),
    routeCount: Object.keys(byRoute).length,
    byRoute,
    heavyAssets,
    deviceSegmentation: {
      available: false,
      reason: "Current analytics envelope does not include a device dimension yet.",
    },
  };
}

async function handleLocalSaveDrafts(req, res) {
  let payload;
  try {
    const raw = await readRequestBody(req, MAX_BODY_SIZE_BYTES);
    payload = raw ? JSON.parse(raw) : null;
  } catch (error) {
    if (error && error.message === "Payload too large") {
      return sendJson(res, 413, { error: "Payload too large" });
    }
    return sendJson(res, 400, { error: "Invalid JSON payload" });
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    typeof payload.menu === "undefined" ||
    typeof payload.availability === "undefined" ||
    typeof payload.home === "undefined"
  ) {
    return sendJson(res, 400, {
      error: "Invalid payload. Required keys: menu, availability, home"
    });
  }

  try {
    writeJsonFile("data/menu.json", payload.menu);
    writeJsonFile("data/availability.json", payload.availability);
    writeJsonFile("data/home.json", payload.home);
    if (typeof payload.ingredients !== "undefined") {
      writeJsonFile("data/ingredients.json", payload.ingredients);
    }
    if (typeof payload.categories !== "undefined") {
      writeJsonFile("data/categories.json", payload.categories);
    }
    if (typeof payload.restaurant !== "undefined") {
      writeJsonFile("data/restaurant.json", payload.restaurant);
    }
    if (typeof payload.reservations !== "undefined") {
      writeJsonFile("data/reservations-config.json", payload.reservations);
    }
    if (typeof payload.media !== "undefined") {
      writeJsonFile("data/media.json", payload.media);
    }
    syncDerivedHomeFeatured();
  } catch (error) {
    return sendJson(res, 500, {
      error: error && error.message ? error.message : "Unable to write data files"
    });
  }

  const files = ["data/menu.json", "data/availability.json", "data/home.json"];
  if (typeof payload.ingredients !== "undefined") {
    files.push("data/ingredients.json");
  }
  if (typeof payload.categories !== "undefined") {
    files.push("data/categories.json");
  }
  if (typeof payload.restaurant !== "undefined") {
    files.push("data/restaurant.json");
  }
  if (typeof payload.reservations !== "undefined") {
    files.push("data/reservations-config.json");
  }
  if (typeof payload.media !== "undefined") {
    files.push("data/media.json");
  }
  files.push("data/home-featured.json");

  return sendJson(res, 200, {
    success: true,
    files
  });
}

async function handleAnalyticsCollect(req, res) {
  let payload;

  try {
    const raw = await readRequestBody(req, MAX_BODY_SIZE_BYTES);
    payload = raw ? JSON.parse(raw) : null;
  } catch (error) {
    if (error && error.message === "Payload too large") {
      return sendJson(res, 413, { error: "Payload too large" });
    }
    return sendJson(res, 400, { error: "Invalid JSON payload" });
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    !Array.isArray(payload.events)
  ) {
    return sendJson(res, 400, { error: "Invalid analytics payload. Expected { events: [] }" });
  }

  try {
    appendAnalyticsBatch(payload.events);
  } catch (error) {
    return sendJson(res, 500, {
      error: error && error.message ? error.message : "Unable to write analytics log"
    });
  }

  return sendJson(res, 202, {
    accepted: payload.events.length,
    logPath: ANALYTICS_LOG_PATH
  });
}

function buildAnalyticsInspectPayload(options) {
  const source = options && typeof options === "object" ? options : {};
  const limit = Number.isFinite(source.limit) && source.limit >= 0
    ? Math.min(5000, Math.round(source.limit))
    : 100;
  const scopeMode = normalizeText(source.scopeMode, "all_traffic");
  const fromDate = normalizeText(source.fromDate);
  const toDate = normalizeText(source.toDate);
  const kpiFilters = {
    entry_source: normalizeText(source.entrySource, "all"),
    visit_context: normalizeText(source.visitContext, "all"),
    visitor_type: normalizeText(source.visitorType, "all"),
    route_name: normalizeText(source.routeName, "all"),
    device_type: normalizeText(source.deviceType, "all"),
  };
  const events = readAnalyticsLog(limit);
  const generatedAt = new Date().toISOString();
  const curatedSnapshot = analyticsPipeline.buildAnalyticsPipeline(events, {
    sourceLabel: ANALYTICS_LOG_PATH,
    processedAt: generatedAt,
    fromDate,
    toDate,
  });

  return {
    logPath: ANALYTICS_LOG_PATH,
    events,
    curatedSnapshot,
    qualitySnapshot: analyticsQuality.buildQualitySnapshot(curatedSnapshot, {
      generatedAt,
    }),
    kpiSnapshot: analyticsKpiCatalog.buildKpiCatalogSnapshot(curatedSnapshot, {
      generatedAt,
      scopeMode,
      filters: kpiFilters,
    }),
    cohortSnapshot: analyticsCohorts.buildCohortSnapshot(curatedSnapshot, {
      generatedAt,
      scopeMode,
      filters: kpiFilters,
    }),
    decisionSummary: summarizeDecisionBehavior(events),
    inStoreSummary: summarizeInStoreContext(events),
    performanceBaseline: summarizePerformanceBaseline(events),
  };
}

function buildLocalSessionPayload() {
  return {
    authenticated: true,
    user: {
      email: "local-admin@figata.local",
      display_name: "Local Admin (Bypass)",
      name: "Local Admin (Bypass)",
      sub: "local-dev-bypass",
      identity_provider: "local-bypass",
    },
    access: {
      team_domain: "http://127.0.0.1:" + port,
      logout_url: "/cdn-cgi/access/logout",
    },
  };
}

async function handleAnalyticsAiAnalyst(req, res) {
  let payload;

  try {
    const raw = await readRequestBody(req, MAX_BODY_SIZE_BYTES);
    payload = raw ? JSON.parse(raw) : null;
  } catch (error) {
    if (error && error.message === "Payload too large") {
      return sendJson(res, 413, { error: "Payload too large" });
    }
    return sendJson(res, 400, { error: "Invalid JSON payload" });
  }

  if (!payload || typeof payload !== "object" || !normalizeText(payload.question)) {
    return sendJson(res, 400, { error: "Invalid AI analyst payload. Expected { question: string }" });
  }

  try {
    const filters = payload.filters && typeof payload.filters === "object" ? payload.filters : {};
    const liveContext = analyticsAiAnalyst.buildLiveContext(buildAnalyticsInspectPayload({
      limit: 0,
      scopeMode: filters.includeInternal ? "all_traffic" : "business_only",
      fromDate: filters.from,
      toDate: filters.to,
      entrySource: filters.entry_source || filters.entrySource || filters.channel,
      visitContext: filters.visit_context || filters.visitContext,
      visitorType: filters.visitor_type || filters.visitorType,
      routeName: filters.route_name || filters.routeName,
      deviceType: filters.device_type || filters.deviceType,
    }));
    const answer = await analyticsAiAnalyst.buildAnswerBundle(payload, {
      provider: normalizeText(payload.provider, "auto"),
      model: normalizeText(payload.model),
      reasoningEffort: normalizeText(payload.reasoning_effort || payload.reasoningEffort),
      reports: analyticsAiAnalyst.loadLatestReports(path.join(rootDir, "analytics-output", "latest", "ai-reports")),
      live: liveContext,
    });

    return sendJson(res, 200, answer);
  } catch (error) {
    return sendJson(res, 500, {
      error: error && error.message ? error.message : "Unable to answer AI analyst request",
    });
  }
}

const server = http.createServer(async (req, res) => {
  const method = req.method || "GET";
  let requestPathname = "/";
  try {
    const parsedUrl = new URL(req.url || "/", `http://${host}:${port}`);
    requestPathname = parsedUrl.pathname;
  } catch {
    return send(res, 400, "Bad Request", {
      "Content-Type": "text/plain; charset=utf-8"
    });
  }

  if (requestPathname === LOCAL_SAVE_DRAFTS_ENDPOINT) {
    if (method !== "POST") {
      return sendJson(res, 405, { error: "Method Not Allowed" });
    }
    return handleLocalSaveDrafts(req, res);
  }

  if (requestPathname === LOCAL_MENU_MEDIA_OPTIONS_ENDPOINT) {
    if (method !== "GET" && method !== "HEAD") {
      return sendJson(res, 405, { error: "Method Not Allowed" });
    }

    const payload = {
      root: "assets/menu",
      paths: listMenuMediaPaths()
    };

    if (method === "HEAD") {
      return sendJson(res, 200, {});
    }

    return sendJson(res, 200, payload);
  }

  if (requestPathname === LOCAL_ANALYTICS_COLLECT_ENDPOINT) {
    if (method !== "POST") {
      return sendJson(res, 405, { error: "Method Not Allowed" });
    }

    return handleAnalyticsCollect(req, res);
  }

  if (requestPathname === CLOUDFLARE_ANALYTICS_COLLECT_ENDPOINT) {
    if (method !== "POST") {
      return sendJson(res, 405, { error: "Method Not Allowed" });
    }

    return handleAnalyticsCollect(req, res);
  }

  if (requestPathname === LOCAL_ANALYTICS_AI_ANALYST_ENDPOINT) {
    if (method !== "POST") {
      return sendJson(res, 405, { error: "Method Not Allowed" });
    }

    return handleAnalyticsAiAnalyst(req, res);
  }

  if (requestPathname === CLOUDFLARE_ANALYTICS_AI_ANALYST_ENDPOINT) {
    if (method !== "POST") {
      return sendJson(res, 405, { error: "Method Not Allowed" });
    }

    return handleAnalyticsAiAnalyst(req, res);
  }

  if (requestPathname === LOCAL_ANALYTICS_INSPECT_ENDPOINT) {
    if (method !== "GET" && method !== "HEAD") {
      return sendJson(res, 405, { error: "Method Not Allowed" });
    }

    const parsedUrl = new URL(req.url || "/", `http://${host}:${port}`);
    const limitParam = Number(parsedUrl.searchParams.get("limit"));
    const limit = Number.isFinite(limitParam) && limitParam >= 0
      ? Math.min(5000, Math.round(limitParam))
      : 100;
    const scopeMode = normalizeText(parsedUrl.searchParams.get("scope"), "all_traffic");
    const fromDate = normalizeText(parsedUrl.searchParams.get("from"));
    const toDate = normalizeText(parsedUrl.searchParams.get("to"));
    const kpiFilters = {
      entry_source: normalizeText(parsedUrl.searchParams.get("entry_source"), "all"),
      visit_context: normalizeText(parsedUrl.searchParams.get("visit_context"), "all"),
      visitor_type: normalizeText(parsedUrl.searchParams.get("visitor_type"), "all"),
      route_name: normalizeText(parsedUrl.searchParams.get("route_name"), "all"),
      device_type: normalizeText(parsedUrl.searchParams.get("device_type"), "all"),
    };
    const payload = buildAnalyticsInspectPayload({
      limit,
      scopeMode,
      fromDate,
      toDate,
      entrySource: kpiFilters.entry_source,
      visitContext: kpiFilters.visit_context,
      visitorType: kpiFilters.visitor_type,
      routeName: kpiFilters.route_name,
      deviceType: kpiFilters.device_type,
    });

    if (method === "HEAD") {
      return sendJson(res, 200, {});
    }

    return sendJson(res, 200, payload);
  }

  if (requestPathname === CLOUDFLARE_ANALYTICS_SNAPSHOT_ENDPOINT) {
    if (method !== "GET" && method !== "HEAD") {
      return sendJson(res, 405, { error: "Method Not Allowed" });
    }

    const parsedUrl = new URL(req.url || "/", `http://${host}:${port}`);
    const limitParam = Number(parsedUrl.searchParams.get("limit"));
    const limit = Number.isFinite(limitParam) && limitParam >= 0
      ? Math.min(5000, Math.round(limitParam))
      : 100;
    const scopeMode = normalizeText(parsedUrl.searchParams.get("scope"), "all_traffic");
    const fromDate = normalizeText(parsedUrl.searchParams.get("from"));
    const toDate = normalizeText(parsedUrl.searchParams.get("to"));
    const payload = buildAnalyticsInspectPayload({
      limit,
      scopeMode,
      fromDate,
      toDate,
      entrySource: normalizeText(parsedUrl.searchParams.get("entry_source"), "all"),
      visitContext: normalizeText(parsedUrl.searchParams.get("visit_context"), "all"),
      visitorType: normalizeText(parsedUrl.searchParams.get("visitor_type"), "all"),
      routeName: normalizeText(parsedUrl.searchParams.get("route_name"), "all"),
      deviceType: normalizeText(parsedUrl.searchParams.get("device_type"), "all"),
    });

    if (method === "HEAD") {
      return sendJson(res, 200, {});
    }

    return sendJson(res, 200, payload);
  }

  if (requestPathname === CLOUDFLARE_SESSION_ENDPOINT) {
    if (method !== "GET" && method !== "HEAD") {
      return sendJson(res, 405, { error: "Method Not Allowed" });
    }

    if (method === "HEAD") {
      return sendJson(res, 200, {});
    }

    return sendJson(res, 200, buildLocalSessionPayload());
  }

  if (requestPathname === CLOUDFLARE_PUBLISH_ENDPOINT) {
    if (method !== "POST") {
      return sendJson(res, 405, { error: "Method Not Allowed" });
    }

    return sendJson(res, 501, {
      error: "Local dev no publica a GitHub. Usa preview/prod en Cloudflare para publish real.",
    });
  }

  if (requestPathname === "/data/home-featured.json") {
    try {
      syncDerivedHomeFeatured();
    } catch (error) {
      return sendJson(res, 500, {
        error: error && error.message ? error.message : "Unable to sync home-featured.json"
      });
    }
  }

  if (method !== "GET" && method !== "HEAD") {
    return send(res, 405, "Method Not Allowed", {
      "Content-Type": "text/plain; charset=utf-8"
    });
  }

  let filePath = safePathFromUrl(req.url || "/");
  if (!filePath) {
    return send(res, 400, "Bad Request", {
      "Content-Type": "text/plain; charset=utf-8"
    });
  }

  if (!isPathInsideRoot(filePath)) {
    return send(res, 403, "Forbidden", {
      "Content-Type": "text/plain; charset=utf-8"
    });
  }

  if (req.url === "/" || req.url === "") {
    filePath = path.join(rootDir, "index.html");
  }

  let stats;
  try {
    stats = fs.statSync(filePath);
  } catch {
    if (isMenuDetailPathname(requestPathname)) {
      filePath = MENU_ROUTE_SHELL_PATH;
      try {
        stats = fs.statSync(filePath);
      } catch {
        return send(res, 404, "Not Found", {
          "Content-Type": "text/plain; charset=utf-8"
        });
      }
    } else {
      return send(res, 404, "Not Found", {
        "Content-Type": "text/plain; charset=utf-8"
      });
    }
  }

  if (stats.isDirectory()) {
    filePath = path.join(filePath, "index.html");
    try {
      fs.accessSync(filePath, fs.constants.R_OK);
    } catch {
      return send(res, 404, "Not Found", {
        "Content-Type": "text/plain; charset=utf-8"
      });
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  if (method === "HEAD") {
    return send(res, 200, "", {
      "Content-Type": contentType
    });
  }

  const stream = fs.createReadStream(filePath);
  res.writeHead(200, { "Content-Type": contentType });
  stream.pipe(res);
  stream.on("error", () => {
    if (!res.headersSent) {
      send(res, 500, "Internal Server Error", {
        "Content-Type": "text/plain; charset=utf-8"
      });
    } else {
      res.end();
    }
  });
});

try {
  const syncResult = syncDerivedHomeFeatured();
  if (syncResult.written) {
    console.log("[dev-server] home-featured.json sincronizado al iniciar.");
  }
} catch (error) {
  console.warn("[dev-server] No se pudo sincronizar home-featured.json al iniciar:", error.message);
}

server.listen(port, host, () => {
  console.log(`Homepage running at http://${host}:${port}`);
});
