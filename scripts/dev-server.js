const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT) || 5173;
const rootDir = process.cwd();

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

const server = http.createServer((req, res) => {
  const method = req.method || "GET";
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
