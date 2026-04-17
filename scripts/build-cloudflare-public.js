const path = require('path');
const {
  emptyDir,
  copyFile,
  copyDirectory,
  readRepoFile,
  writeRepoFile,
  buildCommonJsWorkerBundle,
} = require('./build-cloudflare-utils.js');

const DIST_DIR = 'dist-public';
const PUBLIC_DIRECTORIES = [
  'assets',
  'data',
  'eventos',
  'ig',
  'js',
  'menu',
  'nosotros',
  'qr',
  'reservas',
  'shared',
  'wsp',
];
const PUBLIC_FILES = ['404.html', '_headers', '_redirects', 'index.html', 'styles.css'];

function ignoreJunk(_absolutePath, relativeFromSource, stats) {
  if (!relativeFromSource) {
    return true;
  }

  const normalized = String(relativeFromSource).replace(/\\/g, '/');
  const name = path.posix.basename(normalized);
  if (name === '.DS_Store') {
    return false;
  }
  if (stats.isDirectory() && (name === '.git' || name === '.wrangler')) {
    return false;
  }
  return true;
}

function buildHeaders() {
  const baseHeaders = readRepoFile('_headers').trimEnd();
  return [
    baseHeaders,
    '',
    'https://preview.trattoriafigata.com/*',
    '  X-Robots-Tag: noindex',
    '',
  ].join('\n');
}

function main() {
  emptyDir(DIST_DIR);

  PUBLIC_FILES.forEach(function (relativePath) {
    copyFile(relativePath, path.posix.join(DIST_DIR, relativePath));
  });
  PUBLIC_DIRECTORIES.forEach(function (relativeDir) {
    copyDirectory(relativeDir, path.posix.join(DIST_DIR, relativeDir), { filter: ignoreJunk });
  });

  writeRepoFile(path.posix.join(DIST_DIR, '_headers'), buildHeaders());
  writeRepoFile(
    path.posix.join(DIST_DIR, '_worker.js'),
    buildCommonJsWorkerBundle({
      entry: 'cloudflare/public/worker.js',
    })
  );

  console.log('Cloudflare public bundle built at ' + DIST_DIR);
}

main();
