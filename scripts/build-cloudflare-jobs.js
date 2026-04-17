const path = require('path');
const { emptyDir, writeRepoFile, buildCommonJsWorkerBundle } = require('./build-cloudflare-utils.js');

const DIST_DIR = 'dist-jobs';

function main() {
  emptyDir(DIST_DIR);
  writeRepoFile(
    path.posix.join(DIST_DIR, 'worker.mjs'),
    buildCommonJsWorkerBundle({
      entry: 'cloudflare/jobs/worker.js',
      namedExports: ['PublishCoordinator'],
    })
  );

  console.log('Cloudflare jobs bundle built at ' + DIST_DIR);
}

main();
