const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT_DIR = process.cwd();
const MEDIA_PATH = path.join(ROOT_DIR, 'data', 'media.json');
const MENU_ASSETS_DIR = path.join(ROOT_DIR, 'assets', 'menu');

const TARGET_WIDTH = 1080;
const TARGET_HEIGHT = 1440;
const TARGET_QUALITY = 84;

const LQIP_WIDTH = 24;
const LQIP_HEIGHT = 32;
const LQIP_TARGET_BYTES = 1100;
const LQIP_MAX_BYTES = 1800;
const LQIP_CANDIDATE_QUALITY = [64, 60, 56, 52, 48, 44, 40, 36, 32, 28];

const IMAGE_EXTENSION_RE = /\.(?:webp|png|jpe?g)$/i;

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

const formatBytes = (value) => {
  if (!Number.isFinite(value) || value <= 0) {
    return '0 B';
  }

  if (value < 1024) {
    return `${Math.round(value)} B`;
  }

  return `${(value / 1024).toFixed(2)} KB`;
};

const normalizeEditorialImageSlides = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (typeof entry === 'string') {
        const src = normalizePath(entry);
        if (!src || !IMAGE_EXTENSION_RE.test(src)) {
          return '';
        }
        return src;
      }

      if (!isObject(entry)) {
        return '';
      }

      const normalizedType = normalizeText(entry.type).toLowerCase();
      if (normalizedType === 'video') {
        return '';
      }

      const src = normalizePath(entry.src || entry.path || entry.image);
      if (!src || !IMAGE_EXTENSION_RE.test(src)) {
        return '';
      }

      return src;
    })
    .filter(Boolean);
};

const collectDetailImageSlidesByItem = (mediaItems) => {
  const byItem = new Map();

  Object.entries(mediaItems).forEach(([rawItemId, rawEntry]) => {
    const itemId = normalizeText(rawItemId);
    const entry = isObject(rawEntry) ? rawEntry : {};

    if (!itemId) {
      return;
    }

    const overrides = isObject(entry.overrides) ? entry.overrides : {};
    const gallery = Array.isArray(overrides.gallery)
      ? overrides.gallery
      : Array.isArray(entry.gallery)
        ? entry.gallery
        : [];
    const editorialSlides = normalizeEditorialImageSlides(
      Array.isArray(overrides.editorialSlides) && overrides.editorialSlides.length
        ? overrides.editorialSlides
        : entry.editorialSlides
    );

    const imageSlides = new Set();

    gallery.forEach((slidePath) => {
      const normalized = normalizePath(slidePath);
      if (!normalized || !IMAGE_EXTENSION_RE.test(normalized)) {
        return;
      }
      imageSlides.add(normalized);
    });

    editorialSlides.forEach((slidePath) => {
      imageSlides.add(slidePath);
    });

    byItem.set(itemId, Array.from(imageSlides));
  });

  return byItem;
};

const collectEditorialImageSlidesFromAssets = () => {
  const collected = new Set();
  const byDirectory = new Map();

  const walk = (directoryPath) => {
    if (!fs.existsSync(directoryPath)) {
      return;
    }

    const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
    entries.forEach((entry) => {
      const absolutePath = path.join(directoryPath, entry.name);

      if (entry.isDirectory()) {
        walk(absolutePath);
        return;
      }

      if (!entry.isFile() || !/\.webp$/i.test(entry.name)) {
        return;
      }

      const fileName = entry.name.toLowerCase();
      const isEditorialImageSlide =
        /-slide-?\d+\.webp$/i.test(fileName) ||
        /-slide\d+\.webp$/i.test(fileName);
      const isVideoArtifact =
        fileName.includes('video-slide') || fileName.includes('poster');

      if (!isEditorialImageSlide || isVideoArtifact) {
        return;
      }

      const relativePath = path
        .relative(ROOT_DIR, absolutePath)
        .split(path.sep)
        .join('/');

      const normalized = normalizePath(relativePath);
      if (normalized) {
        collected.add(normalized);
        const directory = normalizePath(path.dirname(normalized));
        const list = byDirectory.get(directory) || [];
        list.push(normalized);
        byDirectory.set(directory, list);
      }
    });
  };

  walk(MENU_ASSETS_DIR);
  return {
    allSlides: collected,
    byDirectory,
  };
};

const getItemMediaDirectories = (entry) => {
  if (!isObject(entry)) {
    return [];
  }

  const directories = new Set();
  const pushDirectoryFromPath = (assetPath) => {
    const normalized = normalizePath(assetPath);
    if (!normalized) {
      return;
    }
    const directory = normalizePath(path.dirname(normalized));
    if (directory) {
      directories.add(directory);
    }
  };

  const overrides = isObject(entry.overrides) ? entry.overrides : {};

  pushDirectoryFromPath(entry.source);
  pushDirectoryFromPath(overrides.card);
  pushDirectoryFromPath(overrides.hover);
  pushDirectoryFromPath(overrides.modal);
  pushDirectoryFromPath(entry.card);
  pushDirectoryFromPath(entry.hover);
  pushDirectoryFromPath(entry.modal);

  return Array.from(directories);
};

const encodeWebp = ({ inputPath, outputPath, quality, width, height }) => {
  execFileSync('cwebp', [
    '-quiet',
    '-q',
    String(quality),
    '-resize',
    String(width),
    String(height),
    inputPath,
    '-o',
    outputPath,
  ]);
};

const generateLqipDataUri = ({ inputPath, tempDir }) => {
  let best = null;

  LQIP_CANDIDATE_QUALITY.forEach((quality) => {
    const candidatePath = path.join(
      tempDir,
      `lqip-${path.basename(inputPath)}-${quality}.webp`
    );
    encodeWebp({
      inputPath,
      outputPath: candidatePath,
      quality,
      width: LQIP_WIDTH,
      height: LQIP_HEIGHT,
    });

    const bytes = fs.statSync(candidatePath).size;
    const score = Math.abs(bytes - LQIP_TARGET_BYTES);
    const buffer = fs.readFileSync(candidatePath);
    const candidate = { bytes, quality, score, buffer };

    if (!best) {
      best = candidate;
      return;
    }

    const bestOverLimit = best.bytes > LQIP_MAX_BYTES;
    const candidateOverLimit = candidate.bytes > LQIP_MAX_BYTES;

    if (bestOverLimit !== candidateOverLimit) {
      if (!candidateOverLimit) {
        best = candidate;
      }
      return;
    }

    if (candidate.score < best.score) {
      best = candidate;
    }
  });

  if (!best) {
    throw new Error(`No se pudo generar LQIP para ${inputPath}`);
  }

  return {
    bytes: best.bytes,
    quality: best.quality,
    dataUri: `data:image/webp;base64,${best.buffer.toString('base64')}`,
  };
};

const run = () => {
  const media = readJson(MEDIA_PATH, 'data/media.json');
  const mediaItems = isObject(media?.items) ? media.items : null;

  if (!mediaItems) {
    throw new Error('data/media.json no tiene media.items válido.');
  }

  const slidesByItem = collectDetailImageSlidesByItem(mediaItems);
  const allSlidePaths = new Set();
  slidesByItem.forEach((paths) => {
    paths.forEach((slidePath) => allSlidePaths.add(slidePath));
  });

  const detectedSlides = collectEditorialImageSlidesFromAssets();
  detectedSlides.allSlides.forEach((slidePath) => allSlidePaths.add(slidePath));

  Object.entries(mediaItems).forEach(([rawItemId, rawEntry]) => {
    const itemId = normalizeText(rawItemId);
    if (!itemId || !isObject(rawEntry)) {
      return;
    }

    const currentPaths = new Set(slidesByItem.get(itemId) || []);
    const directories = getItemMediaDirectories(rawEntry);

    directories.forEach((directory) => {
      const detectedPathsForDirectory = detectedSlides.byDirectory.get(directory) || [];
      detectedPathsForDirectory.forEach((slidePath) => currentPaths.add(slidePath));
    });

    slidesByItem.set(itemId, Array.from(currentPaths));
  });

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'figata-detail-slides-'));
  const processed = [];
  const missing = [];
  const failed = [];
  const lqipByPath = new Map();

  try {
    Array.from(allSlidePaths).forEach((relativePath) => {
      const absolutePath = path.join(ROOT_DIR, relativePath);

      if (!fs.existsSync(absolutePath)) {
        missing.push(relativePath);
        return;
      }

      try {
        const beforeBytes = fs.statSync(absolutePath).size;
        const resizedPath = path.join(
          tempDir,
          `full-${Buffer.from(relativePath).toString('hex')}.webp`
        );

        encodeWebp({
          inputPath: absolutePath,
          outputPath: resizedPath,
          quality: TARGET_QUALITY,
          width: TARGET_WIDTH,
          height: TARGET_HEIGHT,
        });

        const resizedBuffer = fs.readFileSync(resizedPath);
        fs.writeFileSync(absolutePath, resizedBuffer);
        const afterBytes = fs.statSync(absolutePath).size;

        const lqipResult = generateLqipDataUri({
          inputPath: absolutePath,
          tempDir,
        });

        lqipByPath.set(relativePath, lqipResult.dataUri);
        processed.push({
          path: relativePath,
          beforeBytes,
          afterBytes,
          lqipBytes: lqipResult.bytes,
          lqipInlineBytes: Buffer.byteLength(lqipResult.dataUri, 'utf8'),
          lqipQuality: lqipResult.quality,
        });
      } catch (error) {
        failed.push({ path: relativePath, error: error.message });
      }
    });
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  slidesByItem.forEach((paths, itemId) => {
    const entry = mediaItems[itemId];
    if (!isObject(entry)) {
      return;
    }

    const nextMap = {};
    paths.forEach((slidePath) => {
      const dataUri = lqipByPath.get(slidePath);
      if (dataUri) {
        nextMap[slidePath] = dataUri;
      }
    });

    if (Object.keys(nextMap).length) {
      entry.detailSlideLqip = nextMap;
      return;
    }

    delete entry.detailSlideLqip;
  });

  writeJson(MEDIA_PATH, media);

  const totalBeforeBytes = processed.reduce((sum, item) => sum + item.beforeBytes, 0);
  const totalAfterBytes = processed.reduce((sum, item) => sum + item.afterBytes, 0);
  const totalLqipBytes = processed.reduce((sum, item) => sum + item.lqipBytes, 0);
  const totalLqipInlineBytes = processed.reduce((sum, item) => sum + item.lqipInlineBytes, 0);
  const avgAfter = processed.length ? Math.round(totalAfterBytes / processed.length) : 0;
  const avgLqip = processed.length ? Math.round(totalLqipBytes / processed.length) : 0;

  console.log(`Slides detalle detectados: ${allSlidePaths.size}`);
  const mappedSlidesCount = Array.from(slidesByItem.values()).reduce(
    (sum, itemSlides) => sum + itemSlides.length,
    0
  );
  console.log(`Slides mapeados por item en media.json: ${mappedSlidesCount}`);
  console.log(`Slides detectados por convención en assets/menu: ${detectedSlides.allSlides.size}`);
  console.log(`Slides detalle procesados: ${processed.length}`);
  console.log(`Peso total antes: ${totalBeforeBytes} B (${formatBytes(totalBeforeBytes)})`);
  console.log(`Peso total despues: ${totalAfterBytes} B (${formatBytes(totalAfterBytes)})`);
  console.log(`Promedio por slide despues: ${avgAfter} B (${formatBytes(avgAfter)})`);
  console.log(`LQIP binario total: ${totalLqipBytes} B (${formatBytes(totalLqipBytes)})`);
  console.log(`LQIP inline total: ${totalLqipInlineBytes} B (${formatBytes(totalLqipInlineBytes)})`);
  console.log(`LQIP promedio: ${avgLqip} B (${formatBytes(avgLqip)})`);

  if (missing.length) {
    console.warn(`Slides faltantes: ${missing.length}`);
    missing.forEach((slidePath) => console.warn(`- missing: ${slidePath}`));
  }

  if (failed.length) {
    console.warn(`Slides con error: ${failed.length}`);
    failed.forEach((entry) => {
      console.warn(`- ${entry.path}: ${entry.error}`);
    });
  }
};

run();
