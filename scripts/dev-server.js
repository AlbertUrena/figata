const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT) || 5173;
const rootDir = process.cwd();
const LOCAL_SAVE_DRAFTS_ENDPOINT = "/__local/save-drafts";
const LOCAL_MENU_MEDIA_OPTIONS_ENDPOINT = "/__local/menu-media-paths";
const MENU_MEDIA_ROOT_DIR = path.join(rootDir, "assets", "menu");
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

function listMenuMediaPaths() {
  const allowedExtensions = new Set([".webp", ".svg"]);
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
    if (typeof payload.media !== "undefined") {
      writeJsonFile("data/media.json", payload.media);
    }
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
  if (typeof payload.media !== "undefined") {
    files.push("data/media.json");
  }

  return sendJson(res, 200, {
    success: true,
    files
  });
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
    return send(res, 404, "Not Found", {
      "Content-Type": "text/plain; charset=utf-8"
    });
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

server.listen(port, host, () => {
  console.log(`Homepage running at http://${host}:${port}`);
});
