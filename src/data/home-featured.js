(() => {
  const publicPaths = window.FigataPublicPaths || null;
  const ROOT_URL = publicPaths?.baseUrl
    ? new URL(publicPaths.baseUrl.toString())
    : new URL(document.baseURI || '/', window.location.origin);
  const HOME_FEATURED_URL = new URL('data/home-featured.json', ROOT_URL);
  const DEFAULT_SCHEMA = 'figata.home.featured.v1';

  let cachedFeaturedStorePromise = null;

  const clone = (value) =>
    value == null ? value : JSON.parse(JSON.stringify(value));

  const normalizeText = (value) => String(value || '').trim();
  const normalizeId = (value) =>
    normalizeText(value)
      .toLowerCase()
      .replace(/\s+/g, '_');
  const normalizePositiveInt = (value, fallback) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return fallback;
    }

    return Math.round(parsed);
  };
  const normalizeAssetPath = (value, fallback = '') => {
    const normalized = normalizeText(value || fallback);
    if (!normalized) {
      return '';
    }

    if (/^(?:https?:|data:|blob:)/i.test(normalized)) {
      return normalized;
    }

    return normalized.replace(/^\/+/, '');
  };

  const fetchJson = async (url, label) => {
    const response = await fetch(url.toString(), {
      credentials: 'same-origin',
      cache: 'default',
    });

    if (!response.ok) {
      throw new Error(`${label} respondió ${response.status}`);
    }

    return response.json();
  };

  const normalizeIngredient = (input) => {
    const id = normalizeId(input?.id);
    const label = normalizeText(input?.label || id);
    const icon = normalizeAssetPath(input?.icon);

    if (!id || !label) {
      return null;
    }

    return {
      id,
      label,
      icon,
    };
  };

  const normalizeFeaturedItem = (input, index) => {
    const id = normalizeId(input?.id);
    const title = normalizeText(input?.title || input?.name || id);

    if (!id || !title) {
      return null;
    }

    const price = normalizePositiveInt(input?.price, 0);
    const ingredients = Array.isArray(input?.ingredients)
      ? input.ingredients
          .map((ingredient) => normalizeIngredient(ingredient))
          .filter(Boolean)
      : [];

    return {
      id,
      slug: normalizeText(input?.slug),
      title,
      category: normalizeId(input?.category),
      categoryLabel: normalizeText(input?.categoryLabel || input?.category),
      description: normalizeText(input?.description),
      previewDescription:
        normalizeText(input?.previewDescription || input?.description),
      reviews: normalizeText(input?.reviews),
      price,
      priceFormatted: normalizeText(input?.priceFormatted),
      available: input?.available !== false,
      soldOutReason: normalizeText(input?.soldOutReason),
      imageAlt: normalizeText(input?.imageAlt || title),
      cardImage: normalizeAssetPath(input?.cardImage),
      cardImageSrcSet: normalizeText(input?.cardImageSrcSet),
      cardImageSizes:
        normalizeText(input?.cardImageSizes) || '(max-width: 1023px) 38vw, 312px',
      hoverImage: normalizeAssetPath(input?.hoverImage),
      modalImage: normalizeAssetPath(input?.modalImage || input?.cardImage),
      ingredients,
      order: index,
    };
  };

  const buildFeaturedStore = async () => {
    const warnings = [];
    const errors = [];
    let featuredJson = null;

    try {
      featuredJson = await fetchJson(HOME_FEATURED_URL, 'home-featured.json');
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'No se pudo cargar home-featured.json.');
    }

    const items = Array.isArray(featuredJson?.items)
      ? featuredJson.items
          .map((item, index) => normalizeFeaturedItem(item, index))
          .filter(Boolean)
      : [];

    if (!Array.isArray(featuredJson?.items)) {
      warnings.push('home-featured.json no contiene items válidos; se devolvió una lista vacía.');
    }

    const duplicatedIds = new Set();
    const uniqueItems = [];
    const seenIds = new Set();
    items.forEach((item) => {
      if (seenIds.has(item.id)) {
        duplicatedIds.add(item.id);
        return;
      }

      seenIds.add(item.id);
      uniqueItems.push(item);
    });

    if (duplicatedIds.size > 0) {
      warnings.push(
        `home-featured.json contiene IDs duplicados: ${Array.from(duplicatedIds).join(', ')}`
      );
    }

    return {
      featured: {
        version: Number(featuredJson?.version) || 1,
        schema: normalizeText(featuredJson?.schema) || DEFAULT_SCHEMA,
        updatedAt: normalizeText(featuredJson?.updatedAt),
        items: uniqueItems,
      },
      validation: {
        isValid: errors.length === 0,
        warnings,
        errors,
      },
    };
  };

  const loadFeaturedStore = async () => {
    if (!cachedFeaturedStorePromise) {
      cachedFeaturedStorePromise = buildFeaturedStore();
    }

    return cachedFeaturedStorePromise;
  };

  const getFeaturedItems = async () => {
    const { featured } = await loadFeaturedStore();
    return clone(featured.items);
  };

  const getFeaturedItemMap = async () => {
    const items = await getFeaturedItems();
    return new Map(items.map((item) => [item.id, item]));
  };

  const getFeaturedValidation = async () => {
    const { validation } = await loadFeaturedStore();
    return clone(validation);
  };

  window.FigataData = window.FigataData || {};
  window.FigataData.homeFeatured = {
    loadFeaturedStore,
    getFeaturedItems,
    getFeaturedItemMap,
    getFeaturedValidation,
  };
})();
