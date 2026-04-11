(() => {
  const publicPaths = window.FigataPublicPaths || null;
  const ROOT_URL = publicPaths?.baseUrl
    ? new URL(publicPaths.baseUrl.toString())
    : new URL(document.baseURI || '/', window.location.origin);
  const MEDIA_URL = new URL('data/media.json', ROOT_URL);

  const VARIANTS = new Set(['card', 'hover', 'modal']);
  const STATIC_DEFAULTS = {
    card: 'assets/menu/placeholders/card.svg',
    modal: 'assets/menu/placeholders/modal.svg',
    hover: 'assets/menu/placeholders/card.svg',
    alt: 'Imagen del producto Figata',
  };

  let cachedMediaStorePromise;
  let cachedMediaStore;
  let fallbackMediaStore;

  const normalizeId = (value) => String(value || '').trim();

  const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

  const normalizeStringArray = (value) =>
    Array.isArray(value) ? value.map(normalizeText).filter(Boolean) : [];

  const normalizeAssetPath = (value) => {
    const normalized = normalizeText(value);

    if (!normalized) {
      return '';
    }

    return normalized.startsWith('/') ? normalized.slice(1) : normalized;
  };

  const normalizeAssetLookupPath = (value) => {
    const normalized = normalizeText(value);

    if (!normalized || /^data:/i.test(normalized)) {
      return '';
    }

    const normalizedNoHash = normalized.split('#')[0];
    const normalizedNoQuery = normalizedNoHash.split('?')[0];

    try {
      if (/^[a-z][a-z0-9+.-]*:/i.test(normalizedNoQuery)) {
        const parsed = new URL(normalizedNoQuery, ROOT_URL);
        return normalizeAssetPath(parsed.pathname);
      }
    } catch (_error) {
      // Fall back to path normalization below.
    }

    return normalizeAssetPath(normalizedNoQuery);
  };

  const normalizeInlineImageDataUri = (value) => {
    const normalized = normalizeText(value);
    if (!normalized) {
      return '';
    }

    return /^data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/=]+$/i.test(normalized)
      ? normalized
      : '';
  };

  const normalizeDetailSlideLqipMap = (value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }

    const result = {};

    Object.entries(value).forEach(([rawPath, rawLqip]) => {
      const normalizedPath = normalizeAssetLookupPath(rawPath);
      const normalizedLqip = normalizeInlineImageDataUri(rawLqip);

      if (!normalizedPath || !normalizedLqip) {
        return;
      }

      result[normalizedPath] = normalizedLqip;
    });

    return result;
  };

  const DETAIL_SLIDE_IMAGE_RE = /\.(?:webp|png|jpe?g)$/i;

  const getDetailSlideSortIndex = (path) => {
    const normalized = normalizeAssetLookupPath(path).toLowerCase();
    const match = normalized.match(/-slide-?(\d+)\.(?:webp|png|jpe?g)$/i);
    return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
  };

  const deriveGalleryFromDetailSlideLqip = (detailSlideLqip) => {
    if (!detailSlideLqip || typeof detailSlideLqip !== 'object') {
      return [];
    }

    return Object.keys(detailSlideLqip)
      .map(normalizeAssetLookupPath)
      .filter((path) => Boolean(path) && DETAIL_SLIDE_IMAGE_RE.test(path))
      .sort((left, right) => {
        const leftIndex = getDetailSlideSortIndex(left);
        const rightIndex = getDetailSlideSortIndex(right);

        if (leftIndex !== rightIndex) {
          return leftIndex - rightIndex;
        }

        return left.localeCompare(right);
      });
  };

  const inferVideoSourceType = (path) => {
    const normalizedPath = normalizeAssetPath(path).toLowerCase();

    if (normalizedPath.endsWith('.webm')) {
      return 'video/webm';
    }

    if (normalizedPath.endsWith('.mp4')) {
      return 'video/mp4';
    }

    return '';
  };

  const normalizeVideoSourceType = (value, fallbackPath = '') => {
    const normalized = normalizeText(value).toLowerCase();

    if (normalized === 'video/webm' || normalized === 'webm') {
      return 'video/webm';
    }

    if (normalized === 'video/mp4' || normalized === 'mp4') {
      return 'video/mp4';
    }

    return inferVideoSourceType(fallbackPath);
  };

  const normalizeEditorialVideoSources = (rawSources) => {
    const sources = [];
    const seenSources = new Set();

    const pushSource = (path, type) => {
      const src = normalizeAssetPath(path);

      if (!src || seenSources.has(src)) {
        return;
      }

      const normalizedType = normalizeVideoSourceType(type, src);
      const source = normalizedType ? { src, type: normalizedType } : { src };
      sources.push(source);
      seenSources.add(src);
    };

    if (Array.isArray(rawSources)) {
      rawSources.forEach((rawSource) => {
        if (typeof rawSource === 'string') {
          pushSource(rawSource, '');
          return;
        }

        if (!rawSource || typeof rawSource !== 'object') {
          return;
        }

        pushSource(rawSource.src || rawSource.path, rawSource.type || rawSource.mimeType);
      });
      return sources;
    }

    if (rawSources && typeof rawSources === 'object') {
      pushSource(rawSources.webm, 'video/webm');
      pushSource(rawSources.mp4, 'video/mp4');
      pushSource(rawSources.src || rawSources.path, rawSources.type || rawSources.mimeType);
      return sources;
    }

    if (typeof rawSources === 'string') {
      pushSource(rawSources, '');
    }

    return sources;
  };

  const normalizeEditorialSlides = (value) => {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((rawSlide) => {
        if (typeof rawSlide === 'string') {
          const src = normalizeAssetPath(rawSlide);
          if (!src) {
            return null;
          }
          return {
            type: 'image',
            src,
          };
        }

        if (!rawSlide || typeof rawSlide !== 'object') {
          return null;
        }

        const rawType = normalizeText(rawSlide.type).toLowerCase();
        const slideType = rawType === 'video' ? 'video' : 'image';

        if (slideType === 'video') {
          let sources = normalizeEditorialVideoSources(rawSlide.sources);

          if (!sources.length) {
            sources = normalizeEditorialVideoSources([
              { src: rawSlide.webm, type: 'video/webm' },
              { src: rawSlide.mp4, type: 'video/mp4' },
              { src: rawSlide.src || rawSlide.path, type: rawSlide.mimeType },
            ]);
          }

          if (!sources.length) {
            return null;
          }

          return {
            type: 'video',
            sources,
            poster: normalizeAssetPath(rawSlide.poster),
            alt: normalizeText(rawSlide.alt),
          };
        }

        const src = normalizeAssetPath(rawSlide.src || rawSlide.path || rawSlide.image);
        if (!src) {
          return null;
        }

        return {
          type: 'image',
          src,
          alt: normalizeText(rawSlide.alt),
        };
      })
      .filter(Boolean);
  };

  const cloneEditorialSlide = (slide) => {
    if (!slide || typeof slide !== 'object') {
      return null;
    }

    if (slide.type === 'video') {
      const sources = Array.isArray(slide.sources)
        ? slide.sources
            .map((source) => {
              const src = normalizeAssetPath(source?.src);

              if (!src) {
                return null;
              }

              const type = normalizeVideoSourceType(source?.type, src);
              return type ? { src, type } : { src };
            })
            .filter(Boolean)
        : [];

      if (!sources.length) {
        return null;
      }

      return {
        type: 'video',
        sources,
        poster: normalizeAssetPath(slide.poster),
        alt: normalizeText(slide.alt),
      };
    }

    const src = normalizeAssetPath(slide.src);
    if (!src) {
      return null;
    }

    return {
      type: 'image',
      src,
      alt: normalizeText(slide.alt),
    };
  };

  const toAbsoluteAssetPath = (value) => {
    const normalized = normalizeAssetPath(value);

    if (!normalized) {
      return '';
    }

    if (/^(https?:|data:|blob:)/i.test(normalized)) {
      return normalized;
    }

    if (publicPaths?.toSitePath) {
      return publicPaths.toSitePath(normalized);
    }

    return `/${normalized}`;
  };

  const fetchJson = async (url, label, { optional = false, defaultValue = null } = {}) => {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`No se pudo cargar ${label} (${response.status})`);
      }

      return await response.json();
    } catch (error) {
      if (!optional) {
        throw error;
      }

      console.warn(`[media] No se pudo cargar ${label}; se usara fallback interno.`, error);
      return defaultValue;
    }
  };

  const createStore = (mediaJson = null) => {
    const source = mediaJson && typeof mediaJson === 'object' ? mediaJson : {};
    const sourceItems = source.items && typeof source.items === 'object' ? source.items : {};
    const defaults = source.defaults && typeof source.defaults === 'object' ? source.defaults : {};

    const store = {
      version: Number.isFinite(Number(source.version)) ? Number(source.version) : 1,
      schema: normalizeText(source.schema) || 'figata.media.v1',
      updatedAt: normalizeText(source.updatedAt),
      updatedBy: normalizeText(source.updatedBy),
      notes: normalizeText(source.notes),
      defaults: {
        card: normalizeAssetPath(defaults.card) || STATIC_DEFAULTS.card,
        modal: normalizeAssetPath(defaults.modal) || STATIC_DEFAULTS.modal,
        hover: normalizeAssetPath(defaults.hover) || STATIC_DEFAULTS.hover,
        alt: normalizeText(defaults.alt) || STATIC_DEFAULTS.alt,
      },
      global: source.global && typeof source.global === 'object' ? source.global : { homepage: {}, branding: {}, utility: {} },
      items: new Map(),
      warnedKeys: new Set(),
      missingMediaIds: new Set(),
      prefetchedPaths: new Set(),
    };

    Object.entries(sourceItems).forEach(([rawId, rawEntry]) => {
      const itemId = normalizeId(rawId);

      if (!itemId || !rawEntry || typeof rawEntry !== 'object') {
        return;
      }

      const version = Number.isFinite(Number(rawEntry.version)) ? Number(rawEntry.version) : 1;
      
      let card = '';
      let hover = '';
      let modal = '';
      let gallery = [];
      let editorialSlides = [];
      let alt = '';
      let dominantColor = '';
      let lqip = '';
      let detailSlideLqip = {};

      if (version >= 2 || rawEntry.source) {
        const sourcePath = normalizeAssetPath(rawEntry.source);
        const overrides = rawEntry.overrides || {};
        card = normalizeAssetPath(overrides.card) || sourcePath;
        hover = normalizeAssetPath(overrides.hover) || sourcePath;
        modal = normalizeAssetPath(overrides.modal) || sourcePath;
        gallery = normalizeStringArray(overrides.gallery).map(normalizeAssetPath).filter(Boolean);
        editorialSlides = normalizeEditorialSlides(overrides.editorialSlides);
        if (!editorialSlides.length) {
          editorialSlides = normalizeEditorialSlides(rawEntry.editorialSlides);
        }
        alt = normalizeText(rawEntry.alt);
        dominantColor = normalizeText(rawEntry.dominantColor);
        lqip = normalizeInlineImageDataUri(rawEntry.lqip);
        detailSlideLqip = normalizeDetailSlideLqipMap(
          overrides.detailSlideLqip || rawEntry.detailSlideLqip
        );
        if (!gallery.length) {
          gallery = deriveGalleryFromDetailSlideLqip(detailSlideLqip);
        }
      } else {
        card = normalizeAssetPath(rawEntry.card);
        hover = normalizeAssetPath(rawEntry.hover);
        modal = normalizeAssetPath(rawEntry.modal);
        gallery = normalizeStringArray(rawEntry.gallery).map(normalizeAssetPath).filter(Boolean);
        editorialSlides = normalizeEditorialSlides(rawEntry.editorialSlides);
        alt = normalizeText(rawEntry.alt);
        dominantColor = normalizeText(rawEntry.dominantColor);
        lqip = normalizeInlineImageDataUri(rawEntry.lqip);
        detailSlideLqip = normalizeDetailSlideLqipMap(rawEntry.detailSlideLqip);
        if (!gallery.length) {
          gallery = deriveGalleryFromDetailSlideLqip(detailSlideLqip);
        }
      }

      store.items.set(itemId, {
        card,
        hover,
        modal,
        gallery,
        editorialSlides,
        alt,
        dominantColor,
        lqip,
        detailSlideLqip,
        version,
      });
    });

    return store;
  };

  const warnOnce = (store, key, message) => {
    if (store.warnedKeys.has(key)) {
      return;
    }

    store.warnedKeys.add(key);
    console.warn(`[media] ${message}`);
  };

  const resolveVariant = (variant) => (VARIANTS.has(variant) ? variant : 'card');

  const resolvePath = (store, itemId, variant = 'card') => {
    const normalizedId = normalizeId(itemId);
    const safeVariant = resolveVariant(variant);
    const item = store.items.get(normalizedId);

    let path = '';

    if (item) {
      if (safeVariant === 'card') {
        path = item.card;
      }

      if (safeVariant === 'hover') {
        path = item.hover || item.card;
      }

      if (safeVariant === 'modal') {
        path = item.modal || item.card;
      }

      if (!path) {
        store.missingMediaIds.add(normalizedId);
        warnOnce(
          store,
          `missing-variant:${normalizedId}:${safeVariant}`,
          `Falta variante ${safeVariant} para ${normalizedId}. Se usara default.`
        );
      }
    } else {
      if (normalizedId) {
        store.missingMediaIds.add(normalizedId);
        warnOnce(
          store,
          `missing-item:${normalizedId}`,
          `No existe entrada media.items["${normalizedId}"]. Se usara default.`
        );
      }
    }

    if (!path) {
      path = store.defaults[safeVariant] || store.defaults.card || STATIC_DEFAULTS.card;
    }

    if (!path) {
      path = STATIC_DEFAULTS.card;
      warnOnce(
        store,
        'missing-default-card',
        'No hay default.card. Se usara placeholder estatico interno.'
      );
    }

    return path;
  };

  const resolveAlt = (store, itemId) => {
    const normalizedId = normalizeId(itemId);
    const item = store.items.get(normalizedId);

    if (item?.alt) {
      return item.alt;
    }

    if (normalizedId && !item) {
      warnOnce(
        store,
        `missing-alt-item:${normalizedId}`,
        `No existe alt para ${normalizedId}. Se usara alt por defecto.`
      );
    }

    return store.defaults.alt || STATIC_DEFAULTS.alt;
  };

  const resolveGallery = (store, itemId) => {
    const normalizedId = normalizeId(itemId);
    const item = store.items.get(normalizedId);

    if (!item || !Array.isArray(item.gallery)) {
      return [];
    }

    return item.gallery.slice();
  };

  const resolveEditorialSlides = (store, itemId) => {
    const normalizedId = normalizeId(itemId);
    const item = store.items.get(normalizedId);

    if (!item || !Array.isArray(item.editorialSlides)) {
      return [];
    }

    return item.editorialSlides.map(cloneEditorialSlide).filter(Boolean);
  };

  const resolveLqip = (store, itemId) => {
    const normalizedId = normalizeId(itemId);
    const item = store.items.get(normalizedId);

    if (!item) {
      return '';
    }

    return normalizeInlineImageDataUri(item.lqip);
  };

  const resolveDetailSlideLqip = (store, itemId, slidePath = '') => {
    const normalizedId = normalizeId(itemId);
    const item = store.items.get(normalizedId);

    if (!item || !item.detailSlideLqip || typeof item.detailSlideLqip !== 'object') {
      return '';
    }

    const normalizedSlidePath = normalizeAssetLookupPath(slidePath);
    if (!normalizedSlidePath) {
      return '';
    }

    return normalizeInlineImageDataUri(item.detailSlideLqip[normalizedSlidePath]);
  };

  const buildMediaStore = async () => {
    const mediaJson = await fetchJson(MEDIA_URL, 'media.json', {
      optional: true,
      defaultValue: null,
    });

    const store = createStore(mediaJson);
    cachedMediaStore = store;
    return store;
  };

  const loadMediaStore = async () => {
    if (!cachedMediaStorePromise) {
      cachedMediaStorePromise = buildMediaStore();
    }

    return cachedMediaStorePromise;
  };

  const ensureStore = () => {
    if (cachedMediaStore) {
      return cachedMediaStore;
    }

    if (!cachedMediaStorePromise) {
      void loadMediaStore();
    }

    if (!fallbackMediaStore) {
      fallbackMediaStore = createStore(null);
    }

    return fallbackMediaStore;
  };

  const get = (itemId, variant = 'card') => {
    const store = ensureStore();
    return resolvePath(store, itemId, variant);
  };

  const getAlt = (itemId) => {
    const store = ensureStore();
    return resolveAlt(store, itemId);
  };

  const getGallery = (itemId) => {
    const store = ensureStore();
    return resolveGallery(store, itemId);
  };

  const getEditorialSlides = (itemId) => {
    const store = ensureStore();
    return resolveEditorialSlides(store, itemId);
  };

  const getLqip = (itemId) => {
    const store = ensureStore();
    return resolveLqip(store, itemId);
  };

  const getDetailSlideLqip = (itemId, slidePath = '') => {
    const store = ensureStore();
    return resolveDetailSlideLqip(store, itemId, slidePath);
  };

  const getEditorialGallery = async (itemId) => {
    let store;

    try {
      store = await loadMediaStore();
    } catch (_error) {
      store = ensureStore();
    }

    return resolveGallery(store, itemId);
  };

  const prefetch = (itemId, variant = 'modal') => {
    const store = ensureStore();
    const path = resolvePath(store, itemId, variant);
    const absolutePath = toAbsoluteAssetPath(path);

    if (!absolutePath || store.prefetchedPaths.has(absolutePath)) {
      return absolutePath;
    }

    const image = new Image();
    image.decoding = 'async';
    image.loading = 'eager';
    image.src = absolutePath;
    store.prefetchedPaths.add(absolutePath);

    return absolutePath;
  };

  const getMissingMediaIds = () => {
    const store = ensureStore();
    return Array.from(store.missingMediaIds).sort((a, b) => a.localeCompare(b));
  };

  const resolveGlobal = (section, key) => {
    const store = ensureStore();
    return store.global && store.global[section] && store.global[section][key] ? store.global[section][key] : '';
  };

  const getConfigSnapshot = () => {
    const store = ensureStore();
    const items = {};

    store.items.forEach((entry, itemId) => {
      items[itemId] = {
        card: entry.card,
        hover: entry.hover,
        modal: entry.modal,
        gallery: entry.gallery.slice(),
        editorialSlides: resolveEditorialSlides(store, itemId),
        alt: entry.alt,
        dominantColor: entry.dominantColor,
        lqip: resolveLqip(store, itemId),
        detailSlideLqip: { ...(entry.detailSlideLqip || {}) },
        version: entry.version,
      };
    });

    return {
      version: store.version,
      schema: store.schema,
      updatedAt: store.updatedAt,
      updatedBy: store.updatedBy,
      notes: store.notes,
      defaults: { ...store.defaults },
      items,
    };
  };

  window.FigataData = window.FigataData || {};
  window.FigataData.media = {
    loadMediaStore,
    get,
    getAlt,
    getGallery,
    getEditorialSlides,
    getLqip,
    getDetailSlideLqip,
    getEditorialGallery,
    getMissingMediaIds,
    getConfigSnapshot,
    prefetch,
    resolveGlobal,
  };
})();
