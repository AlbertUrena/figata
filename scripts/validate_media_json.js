const fs = require('fs');
const path = require('path');
const contract = require('../shared/media-contract');

const projectRoot = process.cwd();
const mediaPath = path.join(projectRoot, 'data', 'media.json');
const menuPath = path.join(projectRoot, 'data', 'menu.json');
const reportPath = path.join(projectRoot, 'data', 'media-report.json');

const errors = [];
const warnings = [];

const readJson = (filePath, label) => {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    errors.push(`No se pudo leer ${label}: ${error.message}`);
    return null;
  }
};

const normalizeId = (value) => String(value || '').trim();

const normalizePath = (value) => String(value || '').trim().replace(/^\//, '');

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

const isExternalLikePath = (value) =>
  /^(https?:\/\/|data:|blob:|mailto:|tel:|#)/i.test(String(value || '').trim());

const pathExistsInProject = (assetPath) => {
  const safePath = normalizePath(assetPath);
  if (!safePath || isExternalLikePath(safePath)) return true;
  return fs.existsSync(path.join(projectRoot, safePath));
};

const menu = readJson(menuPath, 'data/menu.json');
const media = readJson(mediaPath, 'data/media.json');

const menuItemIds = new Set();
const mediaItemIds = new Set();

const missingMediaItems = [];
const unknownMediaItems = [];
const missingSource = [];
const brokenPaths = [];
const duplicatedPaths = [];

if (menu && media) {
  // Run contract validation
  const contractReport = contract.validateMediaContract(media);
  contractReport.errors.forEach((msg) => errors.push(msg));
  contractReport.warnings.forEach((msg) => warnings.push(msg));

  const sections = Array.isArray(menu.sections) ? menu.sections : [];
  const mediaItems = isObject(media.items) ? media.items : {};
  const defaults = isObject(media.defaults) ? media.defaults : {};
  const schemaVersion = contract.detectSchemaVersion(media);

  sections.forEach((section) => {
    const items = Array.isArray(section.items) ? section.items : [];
    items.forEach((item) => {
      const id = normalizeId(item.id);
      if (id) menuItemIds.add(id);
    });
  });

  Object.keys(mediaItems).forEach((id) => {
    mediaItemIds.add(normalizeId(id));
  });

  menuItemIds.forEach((id) => {
    if (!mediaItemIds.has(id)) missingMediaItems.push(id);
  });

  mediaItemIds.forEach((id) => {
    if (!menuItemIds.has(id)) unknownMediaItems.push(id);
  });

  // Path existence checks
  const pathUsage = new Map();

  const registerPathUse = (assetPath, itemId, variant) => {
    const normalized = normalizePath(assetPath);
    if (!normalized || isExternalLikePath(normalized)) return;
    const usage = pathUsage.get(normalized) || [];
    usage.push({ itemId, variant });
    pathUsage.set(normalized, usage);
  };

  const checkPath = (assetPath, itemId, variant) => {
    const normalized = normalizePath(assetPath);
    if (!normalized) return;
    if (!pathExistsInProject(normalized)) {
      brokenPaths.push({ itemId, variant, path: normalized });
    }
    registerPathUse(normalized, itemId, variant);
  };

  Object.entries(mediaItems).forEach(([rawId, rawEntry]) => {
    const itemId = normalizeId(rawId);
    if (!itemId || !isObject(rawEntry)) return;

    if (schemaVersion >= 2) {
      // v2: source + overrides
      const source = normalizePath(rawEntry.source);
      if (!source) missingSource.push(itemId);
      checkPath(source, itemId, 'source');

      const overrides = isObject(rawEntry.overrides) ? rawEntry.overrides : {};
      ['card', 'hover', 'modal'].forEach((v) => {
        checkPath(overrides[v], itemId, 'overrides.' + v);
      });

      const gallery = Array.isArray(overrides.gallery) ? overrides.gallery : [];
      gallery.forEach((gp, gi) => {
        checkPath(gp, itemId, 'overrides.gallery[' + gi + ']');
      });
    } else {
      // v1: flat
      ['card', 'hover', 'modal'].forEach((v) => {
        checkPath(rawEntry[v], itemId, v);
      });
      const gallery = Array.isArray(rawEntry.gallery) ? rawEntry.gallery : [];
      gallery.forEach((gp, gi) => {
        checkPath(gp, itemId, 'gallery[' + gi + ']');
      });
    }
  });

  // Check defaults paths
  ['card', 'modal', 'hover'].forEach((variant) => {
    const value = normalizePath(defaults[variant]);
    if (value && !pathExistsInProject(value)) {
      brokenPaths.push({ itemId: '__defaults__', variant, path: value });
    }
  });

  // Duplicated paths
  pathUsage.forEach((uses, assetPath) => {
    if (uses.length > 1) {
      const isDefaultPath =
        assetPath === normalizePath(defaults.card) ||
        assetPath === normalizePath(defaults.modal) ||
        assetPath === normalizePath(defaults.hover);
      if (!isDefaultPath) {
        duplicatedPaths.push({ path: assetPath, uses });
      }
    }
  });
}

if (missingMediaItems.length > 0) {
  warnings.push(`Items del menu sin entrada en media.json: ${missingMediaItems.length}`);
}
if (unknownMediaItems.length > 0) {
  warnings.push(`Items en media.json que no existen en menu.json: ${unknownMediaItems.length}`);
}
if (missingSource.length > 0) {
  warnings.push(`Items sin source image: ${missingSource.length}`);
}
if (duplicatedPaths.length > 0) {
  warnings.push(`Rutas duplicadas potencialmente innecesarias: ${duplicatedPaths.length}`);
}
if (brokenPaths.length > 0) {
  errors.push(`Se detectaron paths rotos: ${brokenPaths.length}`);
}

const report = {
  generatedAt: new Date().toISOString(),
  schemaVersion: media ? contract.detectSchemaVersion(media) : 0,
  summary: {
    errors: errors.length,
    warnings: warnings.length,
    menuItems: menuItemIds.size,
    mediaItems: mediaItemIds.size,
    missingMediaItems: missingMediaItems.length,
    unknownMediaItems: unknownMediaItems.length,
    missingSource: missingSource.length,
    brokenPaths: brokenPaths.length,
    duplicatedPaths: duplicatedPaths.length,
  },
  details: {
    errors,
    warnings,
    missingMediaItems,
    unknownMediaItems,
    missingSource,
    brokenPaths,
    duplicatedPaths,
  },
};

try {
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
} catch (error) {
  errors.push(`No se pudo escribir data/media-report.json: ${error.message}`);
}

if (errors.length === 0) {
  console.log('media.json validado sin errores.');
} else {
  console.error('Errores en media.json:');
  errors.forEach((message) => {
    console.error(`- ${message}`);
  });
}

if (warnings.length > 0) {
  console.warn('Warnings:');
  warnings.forEach((message) => {
    console.warn(`- ${message}`);
  });
}

console.log(`Schema version: ${report.schemaVersion}`);
console.log(`Reporte generado: ${path.relative(projectRoot, reportPath)}`);

if (errors.length > 0) {
  process.exit(1);
}
