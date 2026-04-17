const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_CONFIG_PATH = path.join(ROOT, 'wrangler.jsonc');
const BACKUP_CONFIG_PATH = path.join(ROOT, 'wrangler.jsonc.codex-backup');

const TARGETS = {
  public: {
    buildScript: 'build-cloudflare-public',
    outputDir: 'dist-public',
    projectName: 'figata-public',
    configFile: 'wrangler.public.jsonc',
  },
  admin: {
    buildScript: 'build-cloudflare-admin',
    outputDir: 'dist-admin',
    projectName: 'figata-admin',
    configFile: 'wrangler.admin.jsonc',
  },
};

function fail(message) {
  console.error(message);
  process.exit(1);
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: false,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function backupExistingConfig() {
  if (fs.existsSync(DEFAULT_CONFIG_PATH)) {
    fs.copyFileSync(DEFAULT_CONFIG_PATH, BACKUP_CONFIG_PATH);
  }
}

function restoreConfig() {
  if (fs.existsSync(BACKUP_CONFIG_PATH)) {
    fs.copyFileSync(BACKUP_CONFIG_PATH, DEFAULT_CONFIG_PATH);
    fs.unlinkSync(BACKUP_CONFIG_PATH);
    return;
  }

  if (fs.existsSync(DEFAULT_CONFIG_PATH)) {
    fs.unlinkSync(DEFAULT_CONFIG_PATH);
  }
}

function main() {
  const targetName = String(process.argv[2] || '').trim();
  const branchName = String(process.argv[3] || 'master').trim() || 'master';
  const target = TARGETS[targetName];

  if (!target) {
    fail('Uso: node scripts/deploy-cloudflare-pages.js <public|admin> [branch]');
  }

  const sourceConfigPath = path.join(ROOT, target.configFile);
  if (!fs.existsSync(sourceConfigPath)) {
    fail('No encontré el archivo de config: ' + target.configFile);
  }

  backupExistingConfig();

  try {
    fs.copyFileSync(sourceConfigPath, DEFAULT_CONFIG_PATH);
    run('npm', ['run', target.buildScript]);
    run('npx', [
      'wrangler@latest',
      'pages',
      'deploy',
      target.outputDir,
      '--project-name',
      target.projectName,
      '--branch',
      branchName,
    ]);
  } finally {
    restoreConfig();
  }
}

main();
