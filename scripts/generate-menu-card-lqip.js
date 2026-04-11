const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT_DIR = process.cwd();
const MEDIA_PATH = path.join(ROOT_DIR, 'data', 'media.json');
const MENU_PATH = path.join(ROOT_DIR, 'data', 'menu.json');
const AVAILABILITY_PATH = path.join(ROOT_DIR, 'data', 'availability.json');

const CATALOG_SECTION_IDS = new Set([
  'entradas',
  'pizza',
  'pizza_autor',
  'postres',
  'bebidas',
  'productos',
]);

const TARGET_BYTES = 1024;
const MAX_ACCEPTED_BYTES = 1700;
const CANDIDATE_QUALITY = [72, 68, 64, 60, 56, 52, 48, 44, 40, 36, 32, 28];
const CANDIDATE_SIZE = 24;

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');
const normalizePath = (value) => normalizeText(value).replace(/^\/+/, '');
const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const readJson = (filePath, label) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`No se pudo leer ${label}: ${error.message}`);
  }
};

const writeJson = (filePath, payload) => {
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
};

const resolveCardPath = (item, mediaEntry) => {
  const fallback = normalizePath(item?.image);

  if (!isObject(mediaEntry)) {
    return fallback;
  }

  const schemaV2Like = Number(mediaEntry.version) >= 2 || typeof mediaEntry.source === 'string';

  if (schemaV2Like) {
    const source = normalizePath(mediaEntry.source);
    const overrides = isObject(mediaEntry.overrides) ? mediaEntry.overrides : {};
    const overrideCard = normalizePath(overrides.card);
    return overrideCard || source || fallback;
  }

  const legacyCard = normalizePath(mediaEntry.card);
  return legacyCard || fallback;
};

const buildCatalogItems = (menu, availability) => {
  const hideUnavailable = Boolean(availability?.settings?.hideUnavailableItems);
  const availabilityMap = new Map(
    (Array.isArray(availability?.items) ? availability.items : []).map((entry) => [
      normalizeText(entry?.itemId),
      entry,
    ])
  );

  const catalogItems = [];

  (Array.isArray(menu?.sections) ? menu.sections : []).forEach((section) => {
    const sectionId = normalizeText(section?.id);
    if (!CATALOG_SECTION_IDS.has(sectionId)) {
      return;
    }

    (Array.isArray(section?.items) ? section.items : []).forEach((item) => {
      const id = normalizeText(item?.id);
      if (!id) {
        return;
      }

      let available = typeof item?.available === 'boolean' ? item.available : true;
      if (availabilityMap.has(id)) {
        available = availabilityMap.get(id).available !== false;
      }

      if (hideUnavailable && !available) {
        return;
      }

      catalogItems.push(item);
    });
  });

  return catalogItems;
};

const encodeCandidate = (inputPath, outputPath, quality) => {
  execFileSync('cwebp', [
    '-quiet',
    '-q',
    String(quality),
    '-resize',
    String(CANDIDATE_SIZE),
    String(CANDIDATE_SIZE),
    inputPath,
    '-o',
    outputPath,
  ]);
  const bytes = fs.statSync(outputPath).size;
  const buffer = fs.readFileSync(outputPath);
  return { quality, bytes, buffer };
};

const pickBestLqip = (inputPath, outputPath) => {
  let best = null;

  CANDIDATE_QUALITY.forEach((quality) => {
    const candidate = encodeCandidate(inputPath, outputPath, quality);
    const candidateScore = Math.abs(candidate.bytes - TARGET_BYTES);

    if (!best) {
      best = candidate;
      best.score = candidateScore;
      return;
    }

    const bestOverCap = best.bytes > MAX_ACCEPTED_BYTES;
    const candidateOverCap = candidate.bytes > MAX_ACCEPTED_BYTES;

    if (bestOverCap !== candidateOverCap) {
      if (!candidateOverCap) {
        best = candidate;
        best.score = candidateScore;
      }
      return;
    }

    if (candidateScore < best.score) {
      best = candidate;
      best.score = candidateScore;
    }
  });

  if (!best) {
    throw new Error('No se pudo generar LQIP');
  }

  return {
    bytes: best.bytes,
    quality: best.quality,
    dataUri: `data:image/webp;base64,${best.buffer.toString('base64')}`,
  };
};

const formatBytes = (value) => {
  if (!Number.isFinite(value)) {
    return '0 B';
  }

  if (value < 1024) {
    return `${value} B`;
  }

  return `${(value / 1024).toFixed(2)} KB`;
};

const run = () => {
  const media = readJson(MEDIA_PATH, 'data/media.json');
  const menu = readJson(MENU_PATH, 'data/menu.json');
  const availability = readJson(AVAILABILITY_PATH, 'data/availability.json');

  const mediaItems = isObject(media?.items) ? media.items : null;
  if (!mediaItems) {
    throw new Error('media.json no tiene un objeto items valido.');
  }

  const catalogItems = buildCatalogItems(menu, availability);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'figata-lqip-'));

  const stats = [];
  const missing = [];

  try {
    catalogItems.forEach((item) => {
      const itemId = normalizeText(item?.id);
      const mediaEntry = mediaItems[itemId];

      if (!isObject(mediaEntry)) {
        missing.push({ itemId, reason: 'missing-media-entry' });
        return;
      }

      const cardPath = resolveCardPath(item, mediaEntry);
      if (!cardPath) {
        missing.push({ itemId, reason: 'missing-card-path' });
        return;
      }

      const absoluteCardPath = path.join(ROOT_DIR, cardPath);
      if (!fs.existsSync(absoluteCardPath)) {
        missing.push({ itemId, reason: `missing-file:${cardPath}` });
        return;
      }

      const outputPath = path.join(tempDir, `${itemId}.webp`);
      const result = pickBestLqip(absoluteCardPath, outputPath);
      mediaEntry.lqip = result.dataUri;

      stats.push({
        itemId,
        cardPath,
        lqipBytes: result.bytes,
        lqipInlineBytes: Buffer.byteLength(result.dataUri, 'utf8'),
        quality: result.quality,
      });
    });
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  writeJson(MEDIA_PATH, media);

  const totalLqipBytes = stats.reduce((sum, entry) => sum + entry.lqipBytes, 0);
  const totalInlineBytes = stats.reduce((sum, entry) => sum + entry.lqipInlineBytes, 0);
  const minBytes = stats.length ? Math.min(...stats.map((entry) => entry.lqipBytes)) : 0;
  const maxBytes = stats.length ? Math.max(...stats.map((entry) => entry.lqipBytes)) : 0;
  const avgBytes = stats.length ? Math.round(totalLqipBytes / stats.length) : 0;

  console.log(`Items catalogo procesados: ${stats.length}`);
  console.log(`LQIP binario total: ${totalLqipBytes} B (${formatBytes(totalLqipBytes)})`);
  console.log(`Payload inline total (data URI): ${totalInlineBytes} B (${formatBytes(totalInlineBytes)})`);
  console.log(`LQIP promedio: ${avgBytes} B | min: ${minBytes} B | max: ${maxBytes} B`);

  if (missing.length) {
    console.warn(`Items sin LQIP: ${missing.length}`);
    missing.forEach((entry) => {
      console.warn(`- ${entry.itemId}: ${entry.reason}`);
    });
  }
};

run();
