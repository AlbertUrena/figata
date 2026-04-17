const path = require('path');
const {
  emptyDir,
  copyDirectory,
  writeRepoFile,
  buildCommonJsWorkerBundle,
} = require('./build-cloudflare-utils.js');

const DIST_DIR = 'dist-admin';
const ADMIN_DIRECTORIES = ['admin/app', 'assets', 'data', 'shared'];

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

function buildRootRedirectHtml() {
  return [
    '<!doctype html>',
    '<html lang="es">',
    '  <head>',
    '    <meta charset="utf-8" />',
    '    <meta http-equiv="refresh" content="0; url=/admin/app/" />',
    '    <meta name="robots" content="noindex,nofollow" />',
    '    <title>Figata Admin</title>',
    '  </head>',
    '  <body>',
    '    <p>Redirigiendo a <a href="/admin/app/">/admin/app/</a>…</p>',
    '  </body>',
    '</html>',
    '',
  ].join('\n');
}

function buildHeaders() {
  return [
    '/*',
    '  Cache-Control: public, max-age=0, must-revalidate',
    '  X-Robots-Tag: noindex, nofollow',
    '',
    '/admin/app/*.css',
    '  Cache-Control: public, max-age=0, must-revalidate',
    '',
    '/admin/app/*.js',
    '  Cache-Control: public, max-age=0, must-revalidate',
    '',
    '/admin/app/modules/*',
    '  Cache-Control: public, max-age=0, must-revalidate',
    '',
    '/admin/app/modules/panels/*',
    '  Cache-Control: public, max-age=0, must-revalidate',
    '',
    'https://preview-admin.trattoriafigata.com/*',
    '  X-Robots-Tag: noindex',
    '',
  ].join('\n');
}

function main() {
  emptyDir(DIST_DIR);

  ADMIN_DIRECTORIES.forEach(function (relativeDir) {
    copyDirectory(relativeDir, path.posix.join(DIST_DIR, relativeDir), { filter: ignoreJunk });
  });

  writeRepoFile(path.posix.join(DIST_DIR, 'index.html'), buildRootRedirectHtml());
  writeRepoFile(path.posix.join(DIST_DIR, '_headers'), buildHeaders());
  writeRepoFile(
    path.posix.join(DIST_DIR, '_worker.js'),
    buildCommonJsWorkerBundle({
      entry: 'cloudflare/admin/worker.js',
    })
  );

  console.log('Cloudflare admin bundle built at ' + DIST_DIR);
}

main();
