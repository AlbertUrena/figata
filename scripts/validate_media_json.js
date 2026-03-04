const fs = require('fs');
const path = require('path');

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

  if (!safePath || isExternalLikePath(safePath)) {
    return true;
  }

  return fs.existsSync(path.join(projectRoot, safePath));
};

const menu = readJson(menuPath, 'data/menu.json');
const media = readJson(mediaPath, 'data/media.json');

const menuItemIds = new Set();
const mediaItemIds = new Set();

const missingMediaItems = [];
const unknownMediaItems = [];
const missingVariants = [];
const brokenPaths = [];
const duplicatedPaths = [];

if (menu && media) {
  const sections = Array.isArray(menu.sections) ? menu.sections : [];
  const mediaItems = isObject(media.items) ? media.items : {};
  const defaults = isObject(media.defaults) ? media.defaults : {};

  sections.forEach((section) => {
    const items = Array.isArray(section.items) ? section.items : [];
    items.forEach((item) => {
      const id = normalizeId(item.id);
      if (id) {
        menuItemIds.add(id);
      }
    });
  });

  Object.keys(mediaItems).forEach((id) => {
    mediaItemIds.add(normalizeId(id));
  });

  menuItemIds.forEach((id) => {
    if (!mediaItemIds.has(id)) {
      missingMediaItems.push(id);
    }
  });

  mediaItemIds.forEach((id) => {
    if (!menuItemIds.has(id)) {
      unknownMediaItems.push(id);
    }
  });

  const requiredDefaults = ['card', 'modal', 'hover'];
  requiredDefaults.forEach((variant) => {
    const value = normalizePath(defaults[variant]);
    if (!value) {
      errors.push(`defaults.${variant} es requerido.`);
      return;
    }

    if (!pathExistsInProject(value)) {
      brokenPaths.push({
        itemId: '__defaults__',
        variant,
        path: value,
      });
    }
  });

  const defaultAlt = String(defaults.alt || '').trim();
  if (!defaultAlt) {
    warnings.push('defaults.alt esta vacio.');
  }

  const pathUsage = new Map();

  const registerPathUse = (assetPath, itemId, variant) => {
    const normalized = normalizePath(assetPath);

    if (!normalized || isExternalLikePath(normalized)) {
      return;
    }

    const usage = pathUsage.get(normalized) || [];
    usage.push({ itemId, variant });
    pathUsage.set(normalized, usage);
  };

  Object.entries(mediaItems).forEach(([rawId, rawEntry]) => {
    const itemId = normalizeId(rawId);

    if (!itemId || !isObject(rawEntry)) {
      warnings.push(`media.items["${rawId}"] es invalido y se ignora.`);
      return;
    }

    const cardPath = normalizePath(rawEntry.card);
    const modalPath = normalizePath(rawEntry.modal);
    const hoverPath = normalizePath(rawEntry.hover);
    const gallery = Array.isArray(rawEntry.gallery) ? rawEntry.gallery : [];

    if (!cardPath) {
      missingVariants.push({ itemId, variant: 'card' });
    }

    if (!modalPath) {
      missingVariants.push({ itemId, variant: 'modal' });
    }

    if (!hoverPath) {
      missingVariants.push({ itemId, variant: 'hover' });
    }

    if (cardPath && !pathExistsInProject(cardPath)) {
      brokenPaths.push({ itemId, variant: 'card', path: cardPath });
    }

    if (modalPath && !pathExistsInProject(modalPath)) {
      brokenPaths.push({ itemId, variant: 'modal', path: modalPath });
    }

    if (hoverPath && !pathExistsInProject(hoverPath)) {
      brokenPaths.push({ itemId, variant: 'hover', path: hoverPath });
    }

    registerPathUse(cardPath, itemId, 'card');
    registerPathUse(modalPath, itemId, 'modal');
    registerPathUse(hoverPath, itemId, 'hover');

    gallery.forEach((entry, index) => {
      const galleryPath = normalizePath(entry);

      if (!galleryPath) {
        warnings.push(`media.items["${itemId}"].gallery[${index}] esta vacio.`);
        return;
      }

      if (!pathExistsInProject(galleryPath)) {
        brokenPaths.push({ itemId, variant: `gallery[${index}]`, path: galleryPath });
      }

      registerPathUse(galleryPath, itemId, `gallery[${index}]`);
    });
  });

  pathUsage.forEach((uses, assetPath) => {
    if (uses.length > 1) {
      const isDefaultPath =
        assetPath === normalizePath(defaults.card) ||
        assetPath === normalizePath(defaults.modal) ||
        assetPath === normalizePath(defaults.hover);

      if (!isDefaultPath) {
        duplicatedPaths.push({
          path: assetPath,
          uses,
        });
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

if (missingVariants.length > 0) {
  warnings.push(`Variantes faltantes en media.items: ${missingVariants.length}`);
}

if (duplicatedPaths.length > 0) {
  warnings.push(`Rutas duplicadas potencialmente innecesarias: ${duplicatedPaths.length}`);
}

if (brokenPaths.length > 0) {
  errors.push(`Se detectaron paths rotos: ${brokenPaths.length}`);
}

const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    errors: errors.length,
    warnings: warnings.length,
    menuItems: menuItemIds.size,
    mediaItems: mediaItemIds.size,
    missingMediaItems: missingMediaItems.length,
    unknownMediaItems: unknownMediaItems.length,
    missingVariants: missingVariants.length,
    brokenPaths: brokenPaths.length,
    duplicatedPaths: duplicatedPaths.length,
  },
  details: {
    errors,
    warnings,
    missingMediaItems,
    unknownMediaItems,
    missingVariants,
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

console.log(`Reporte generado: ${path.relative(projectRoot, reportPath)}`);

if (errors.length > 0) {
  process.exit(1);
}
