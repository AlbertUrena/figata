#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const ADMIN_APP_DIR = path.join(ROOT_DIR, "admin", "app");
const FORBIDDEN_PATTERN = /<input\b[^>]*\btype\s*=\s*['"]checkbox['"][^>]*>/gi;

function listFiles(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(absolutePath));
      continue;
    }
    files.push(absolutePath);
  }

  return files;
}

function getLineFromIndex(text, index) {
  const before = text.slice(0, index);
  return before.split(/\r?\n/).length;
}

function run() {
  const appFiles = listFiles(ADMIN_APP_DIR);
  const violations = [];

  for (const absolutePath of appFiles) {
    const text = fs.readFileSync(absolutePath, "utf8");
    FORBIDDEN_PATTERN.lastIndex = 0;
    let match = FORBIDDEN_PATTERN.exec(text);
    while (match) {
      const line = getLineFromIndex(text, match.index);
      const relativePath = path.relative(ROOT_DIR, absolutePath);
      violations.push({
        file: relativePath,
        line,
        snippet: match[0].slice(0, 120)
      });
      match = FORBIDDEN_PATTERN.exec(text);
    }
  }

  if (!violations.length) {
    console.log("check:admin-ui passed (no direct checkboxes found in admin/app).");
    return;
  }

  console.error("check:admin-ui failed. Direct checkboxes are forbidden in admin/app:");
  violations.forEach((violation) => {
    console.error("- " + violation.file + ":" + violation.line + " -> " + violation.snippet);
  });
  process.exit(1);
}

run();
