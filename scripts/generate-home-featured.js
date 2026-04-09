const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const HOME_CARD_SIZES = [320, 640];
const HOME_CARD_SIZES_ATTR = '(max-width: 1023px) 38vw, 312px';
const GENERATED_FEATURED_DIR = path.join('assets', 'home', 'featured', 'generated');
const PLACEHOLDER_CARD = 'assets/menu/placeholders/card.svg';
const HOME_FEATURED_SCHEMA = 'figata.home.featured.v1';

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

const normalizeId = (value) =>
  normalizeText(value)
    .toLowerCase()
    .replace(/\s+/g, '_');

const normalizeAssetPath = (value) => {
  const normalized = normalizeText(value);

  if (!normalized) {
    return '';
  }

  if (/^(?:https?:|data:|blob:)/i.test(normalized)) {
    return normalized;
  }

  return normalized.replace(/^\/+/, '');
};

const toPosix = (value) => String(value || '').replace(/\\/g, '/');

const slugify = (value) =>
  normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'featured-item';

const clone = (value) => JSON.parse(JSON.stringify(value));

const readJson = (filePath, label, errors) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    errors.push(`No se pudo leer ${label}: ${error.message}`);
    return null;
  }
};

const buildMenuItemMap = (menu) => {
  const byId = new Map();
  const sections = Array.isArray(menu?.sections) ? menu.sections : [];

  sections.forEach((section) => {
    const items = Array.isArray(section?.items) ? section.items : [];
    items.forEach((item) => {
      const itemId = normalizeId(item?.id);
      if (itemId && !byId.has(itemId)) {
        byId.set(itemId, item);
      }
    });
  });

  return byId;
};

const buildAvailabilityMap = (availability) => {
  const byId = new Map();
  const items = Array.isArray(availability?.items) ? availability.items : [];

  items.forEach((entry) => {
    const itemId = normalizeId(entry?.itemId);
    if (!itemId) {
      return;
    }

    byId.set(itemId, {
      available: entry?.available !== false,
      soldOutReason: normalizeText(entry?.soldOutReason),
    });
  });

  return byId;
};

const resolveIngredientIconPath = (ingredientCatalog, ingredientId) => {
  const normalizedId = normalizeId(ingredientId);
  if (!normalizedId) {
    return '';
  }

  const ingredientsMap =
    ingredientCatalog && typeof ingredientCatalog === 'object' && ingredientCatalog.ingredients
      ? ingredientCatalog.ingredients
      : {};
  const iconsMap =
    ingredientCatalog && typeof ingredientCatalog === 'object' && ingredientCatalog.icons
      ? ingredientCatalog.icons
      : {};
  const ingredient = ingredientsMap[normalizedId];

  if (!ingredient || typeof ingredient !== 'object') {
    return '';
  }

  const explicitIcon = normalizeAssetPath(ingredient.icon);
  if (explicitIcon && /[/.]/.test(explicitIcon)) {
    return explicitIcon;
  }

  if (explicitIcon && iconsMap[explicitIcon] && typeof iconsMap[explicitIcon] === 'object') {
    const catalogIcon = normalizeAssetPath(iconsMap[explicitIcon].icon);
    if (catalogIcon) {
      return catalogIcon;
    }
  }

  if (explicitIcon) {
    const basePath = normalizeAssetPath(ingredientCatalog?.basePath || 'assets/Ingredients');
    return `${basePath.replace(/\/+$/, '')}/${explicitIcon}.webp`;
  }

  return '';
};

const buildIngredientPayload = (ingredientCatalog, ingredientIds) => {
  const ingredientsMap =
    ingredientCatalog && typeof ingredientCatalog === 'object' && ingredientCatalog.ingredients
      ? ingredientCatalog.ingredients
      : {};

  return (Array.isArray(ingredientIds) ? ingredientIds : [])
    .map((ingredientId) => {
      const normalizedId = normalizeId(ingredientId);
      const ingredient = ingredientsMap[normalizedId];

      if (!normalizedId || !ingredient || typeof ingredient !== 'object') {
        return null;
      }

      return {
        id: normalizedId,
        label: normalizeText(ingredient.label || normalizedId),
        icon: resolveIngredientIconPath(ingredientCatalog, normalizedId),
      };
    })
    .filter(Boolean);
};

const resolveMediaEntry = (media, itemId) => {
  if (!media || typeof media !== 'object' || !media.items || typeof media.items !== 'object') {
    return null;
  }

  return media.items[normalizeId(itemId)] || null;
};

const resolveMediaSourcePath = (mediaEntry, menuItem) => {
  const sourcePath = normalizeAssetPath(mediaEntry?.source);
  const overrideCard = normalizeAssetPath(mediaEntry?.overrides?.card);
  const legacyCard = normalizeAssetPath(mediaEntry?.card);
  const itemImage = normalizeAssetPath(menuItem?.image);
  const defaultCard = normalizeAssetPath(mediaEntry?.defaults?.card);

  return overrideCard || sourcePath || legacyCard || itemImage || defaultCard || PLACEHOLDER_CARD;
};

const resolveMediaVariantPath = (mediaEntry, menuItem, variant) => {
  const safeVariant = variant === 'hover' || variant === 'modal' ? variant : 'card';
  const sourcePath = normalizeAssetPath(mediaEntry?.source);
  const overrideVariant = normalizeAssetPath(mediaEntry?.overrides?.[safeVariant]);
  const legacyVariant = normalizeAssetPath(mediaEntry?.[safeVariant]);
  const itemImage = normalizeAssetPath(menuItem?.image);

  return overrideVariant || legacyVariant || sourcePath || itemImage || PLACEHOLDER_CARD;
};

const isLocalRasterAsset = (assetPath) => {
  const normalized = normalizeAssetPath(assetPath);
  if (!normalized || /^(?:https?:|data:|blob:)/i.test(normalized)) {
    return false;
  }

  return /\.(?:png|jpe?g|webp)$/i.test(normalized);
};

const writeJsonIfChanged = (targetPath, payload) => {
  let existing = null;

  try {
    existing = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
  } catch (_) {
    existing = null;
  }

  const comparableExisting = existing && typeof existing === 'object' ? clone(existing) : null;
  if (comparableExisting) {
    delete comparableExisting.updatedAt;
  }

  const comparableNext = clone(payload);
  delete comparableNext.updatedAt;

  if (
    comparableExisting &&
    JSON.stringify(comparableExisting) === JSON.stringify(comparableNext)
  ) {
    return false;
  }

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  return true;
};

const ensureGeneratedVariant = (rootDir, sourceRelativePath, outputRelativePath, size, warnings) => {
  const normalizedSource = normalizeAssetPath(sourceRelativePath);
  const normalizedOutput = normalizeAssetPath(outputRelativePath);

  if (!isLocalRasterAsset(normalizedSource) || !normalizedOutput) {
    return false;
  }

  const sourceAbsolutePath = path.join(rootDir, normalizedSource);
  const outputAbsolutePath = path.join(rootDir, normalizedOutput);

  if (!fs.existsSync(sourceAbsolutePath)) {
    warnings.push(`No se encontro la imagen fuente para featured: ${normalizedSource}`);
    return false;
  }

  let shouldWrite = true;
  if (fs.existsSync(outputAbsolutePath)) {
    const sourceStat = fs.statSync(sourceAbsolutePath);
    const outputStat = fs.statSync(outputAbsolutePath);
    shouldWrite = sourceStat.mtimeMs > outputStat.mtimeMs + 1;
  }

  if (!shouldWrite) {
    return true;
  }

  fs.mkdirSync(path.dirname(outputAbsolutePath), { recursive: true });

  try {
    execFileSync(
      'magick',
      [
        sourceAbsolutePath,
        '-auto-orient',
        '-resize',
        `${size}x${size}`,
        '-background',
        'none',
        '-gravity',
        'center',
        '-extent',
        `${size}x${size}`,
        '-quality',
        '82',
        outputAbsolutePath,
      ],
      { stdio: 'ignore' }
    );
    return true;
  } catch (error) {
    warnings.push(
      `No se pudo generar ${normalizedOutput} desde ${normalizedSource}: ${error.message}`
    );
    return false;
  }
};

const buildResponsiveCardMedia = (rootDir, item, mediaEntry, warnings, generatedAssets) => {
  const sourcePath = resolveMediaSourcePath(mediaEntry, item);

  if (!isLocalRasterAsset(sourcePath)) {
    return {
      cardImage: sourcePath || PLACEHOLDER_CARD,
      cardImageSrcSet: '',
      cardImageSizes: HOME_CARD_SIZES_ATTR,
    };
  }

  const outputBase = `${slugify(item?.slug || item?.name || item?.id)}.webp`;
  const outputEntries = HOME_CARD_SIZES.map((size) => ({
    size,
    relativePath: toPosix(path.join(GENERATED_FEATURED_DIR, outputBase.replace('.webp', `-${size}.webp`))),
  }));

  const generated = outputEntries.filter((entry) =>
    ensureGeneratedVariant(rootDir, sourcePath, entry.relativePath, entry.size, warnings)
  );

  generated.forEach((entry) => {
    if (!generatedAssets.includes(entry.relativePath)) {
      generatedAssets.push(entry.relativePath);
    }
  });

  if (generated.length !== outputEntries.length) {
    return {
      cardImage: sourcePath,
      cardImageSrcSet: '',
      cardImageSizes: HOME_CARD_SIZES_ATTR,
    };
  }

  const largest = outputEntries[outputEntries.length - 1];
  const srcSet = outputEntries.map((entry) => `${entry.relativePath} ${entry.size}w`).join(', ');

  return {
    cardImage: largest.relativePath,
    cardImageSrcSet: srcSet,
    cardImageSizes: HOME_CARD_SIZES_ATTR,
  };
};

const buildFeaturedPayload = ({ rootDir, home, menu, media, availability, ingredients, warnings }) => {
  const menuItemsById = buildMenuItemMap(menu);
  const availabilityById = buildAvailabilityMap(availability);
  const generatedAssets = [];
  const popular = home && typeof home === 'object' ? home.popular || {} : {};
  const featuredIds = Array.isArray(popular.featuredIds) ? popular.featuredIds : [];
  const limit = Math.max(0, Number(popular.limit) || 8);
  const seen = new Set();
  const items = [];

  featuredIds.forEach((rawId) => {
    const itemId = normalizeId(rawId);
    if (!itemId || seen.has(itemId) || items.length >= limit) {
      return;
    }

    seen.add(itemId);

    const menuItem = menuItemsById.get(itemId);
    if (!menuItem) {
      warnings.push(`featuredIds contiene un item inexistente y fue omitido: ${rawId}`);
      return;
    }

    const mediaEntry = resolveMediaEntry(media, itemId);
    const availabilityEntry = availabilityById.get(itemId);
    const cardMedia = buildResponsiveCardMedia(rootDir, menuItem, mediaEntry, warnings, generatedAssets);
    const title = normalizeText(menuItem.name || menuItem.title || itemId);
    const description = normalizeText(
      menuItem.description || menuItem.descriptionShort || menuItem.descriptionLong
    );
    const previewDescription = normalizeText(
      menuItem.descriptionLong || menuItem.description || menuItem.descriptionShort
    );

    items.push({
      id: itemId,
      slug: normalizeText(menuItem.slug) || slugify(itemId),
      title,
      description,
      previewDescription: previewDescription || description,
      reviews: normalizeText(menuItem.reviews),
      price: Number.isFinite(Number(menuItem.price)) ? Math.round(Number(menuItem.price)) : 0,
      priceFormatted: normalizeText(menuItem.priceFormatted),
      available: availabilityEntry ? availabilityEntry.available !== false : true,
      soldOutReason: availabilityEntry ? normalizeText(availabilityEntry.soldOutReason) : '',
      imageAlt: normalizeText(mediaEntry?.alt) || title,
      cardImage: cardMedia.cardImage,
      cardImageSrcSet: cardMedia.cardImageSrcSet,
      cardImageSizes: cardMedia.cardImageSizes,
      hoverImage: resolveMediaVariantPath(mediaEntry, menuItem, 'hover'),
      modalImage: resolveMediaVariantPath(mediaEntry, menuItem, 'modal'),
      ingredients: buildIngredientPayload(ingredients, menuItem.ingredients),
    });
  });

  return {
    payload: {
      version: 1,
      schema: HOME_FEATURED_SCHEMA,
      source: {
        home: 'data/home.json',
        menu: 'data/menu.json',
        media: 'data/media.json',
        availability: 'data/availability.json',
        ingredients: 'data/ingredients.json',
      },
      limit,
      sourceFeaturedIds: items.map((item) => item.id),
      items,
    },
    generatedAssets,
  };
};

const generateHomeFeatured = ({ rootDir = process.cwd(), write = true, silent = false } = {}) => {
  const errors = [];
  const warnings = [];
  const homePath = path.join(rootDir, 'data', 'home.json');
  const menuPath = path.join(rootDir, 'data', 'menu.json');
  const mediaPath = path.join(rootDir, 'data', 'media.json');
  const availabilityPath = path.join(rootDir, 'data', 'availability.json');
  const ingredientsPath = path.join(rootDir, 'data', 'ingredients.json');
  const outputPath = path.join(rootDir, 'data', 'home-featured.json');

  const home = readJson(homePath, 'data/home.json', errors);
  const menu = readJson(menuPath, 'data/menu.json', errors);
  const media = readJson(mediaPath, 'data/media.json', errors);
  const availability = readJson(availabilityPath, 'data/availability.json', errors);
  const ingredients = readJson(ingredientsPath, 'data/ingredients.json', errors);

  if (errors.length > 0) {
    return {
      changed: false,
      written: false,
      errors,
      warnings,
      payload: null,
      outputPath,
      generatedAssets: [],
    };
  }

  const { payload, generatedAssets } = buildFeaturedPayload({
    rootDir,
    home,
    menu,
    media,
    availability,
    ingredients,
    warnings,
  });

  const nextPayload = {
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  let written = false;
  if (write) {
    written = writeJsonIfChanged(outputPath, nextPayload);
  }

  if (!silent) {
    if (written) {
      console.log(`home-featured.json sincronizado (${payload.items.length} items).`);
    } else {
      console.log(`home-featured.json ya estaba sincronizado (${payload.items.length} items).`);
    }

    if (warnings.length > 0) {
      console.warn('Warnings:');
      warnings.forEach((message) => {
        console.warn(`- ${message}`);
      });
    }
  }

  return {
    changed: written,
    written,
    errors,
    warnings,
    payload: nextPayload,
    outputPath,
    generatedAssets,
  };
};

if (require.main === module) {
  const result = generateHomeFeatured();

  if (result.errors.length > 0) {
    console.error('No se pudo generar data/home-featured.json:');
    result.errors.forEach((message) => {
      console.error(`- ${message}`);
    });
    process.exit(1);
  }
}

module.exports = {
  generateHomeFeatured,
};
