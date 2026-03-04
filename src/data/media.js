(() => {
  const MEDIA_URL = new URL('data/media.json', window.location.href);

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

      store.items.set(itemId, {
        card: normalizeAssetPath(rawEntry.card),
        hover: normalizeAssetPath(rawEntry.hover),
        modal: normalizeAssetPath(rawEntry.modal),
        gallery: normalizeStringArray(rawEntry.gallery).map(normalizeAssetPath).filter(Boolean),
        alt: normalizeText(rawEntry.alt),
        dominantColor: normalizeText(rawEntry.dominantColor),
        version: Number.isFinite(Number(rawEntry.version)) ? Number(rawEntry.version) : 1,
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

  const prefetch = (itemId, variant = 'modal') => {
    const store = ensureStore();
    const path = resolvePath(store, itemId, variant);

    if (!path || store.prefetchedPaths.has(path)) {
      return path;
    }

    const image = new Image();
    image.decoding = 'async';
    image.loading = 'eager';
    image.src = path;
    store.prefetchedPaths.add(path);

    return path;
  };

  const getMissingMediaIds = () => {
    const store = ensureStore();
    return Array.from(store.missingMediaIds).sort((a, b) => a.localeCompare(b));
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
        alt: entry.alt,
        dominantColor: entry.dominantColor,
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
    getMissingMediaIds,
    getConfigSnapshot,
    prefetch,
  };
})();
