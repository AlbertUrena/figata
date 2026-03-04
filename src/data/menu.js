(() => {
  const MENU_URL = new URL('data/menu.json', window.location.href);

  let cachedMenuStorePromise;

  const normalizeId = (value) => String(value || '').trim();

  const normalizeAssetPath = (value) => {
    if (typeof value !== 'string') {
      return '';
    }

    const trimmed = value.trim();

    if (!trimmed) {
      return '';
    }

    return trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
  };

  const inferItemSlug = (item) => {
    if (typeof item?.slug === 'string' && item.slug.trim()) {
      return item.slug.trim();
    }

    return normalizeId(item?.id).replace(/_/g, '-');
  };

  const resolveItemImage = (item) => {
    const explicitImage = normalizeAssetPath(item?.image);

    if (explicitImage) {
      return explicitImage;
    }

    const slug = inferItemSlug(item);
    return slug ? `assets/${slug}.png` : '';
  };

  const formatMenuPrice = (value, currency = 'DOP') => {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
      return '';
    }

    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getItemShortDescription = (item) =>
    item?.descriptionShort || item?.description || item?.descriptionLong || '';

  const getItemLongDescription = (item) =>
    item?.descriptionLong || item?.description || item?.descriptionShort || '';

  const toRuntimeItem = (item, section, currency) => {
    const id = normalizeId(item?.id);
    const slug = inferItemSlug(item);

    return {
      ...item,
      id,
      slug,
      sectionId: section?.id || '',
      sectionLabel: section?.label || '',
      image: resolveItemImage(item),
      descriptionShort: getItemShortDescription(item),
      descriptionLong: getItemLongDescription(item),
      priceFormatted: formatMenuPrice(item?.price, currency),
      ingredients: Array.isArray(item?.ingredients) ? item.ingredients : [],
    };
  };

  const buildMenuStore = async () => {
    const response = await fetch(MENU_URL);

    if (!response.ok) {
      throw new Error(`No se pudo cargar menu.json (${response.status})`);
    }

    const menu = await response.json();
    const sections = Array.isArray(menu?.sections) ? menu.sections : [];
    const items = [];
    const byId = new Map();

    sections.forEach((section) => {
      const sectionItems = Array.isArray(section?.items) ? section.items : [];

      sectionItems.forEach((item) => {
        const runtimeItem = toRuntimeItem(item, section, menu.currency || 'DOP');

        if (!runtimeItem.id) {
          return;
        }

        items.push(runtimeItem);
        byId.set(runtimeItem.id, runtimeItem);
      });
    });

    return {
      menu,
      items,
      byId,
    };
  };

  const loadMenuStore = async () => {
    if (!cachedMenuStorePromise) {
      cachedMenuStorePromise = buildMenuStore();
    }

    return cachedMenuStorePromise;
  };

  const selectFeaturedIds = (menu, items) => {
    if (Array.isArray(menu?.featuredIds) && menu.featuredIds.length) {
      return menu.featuredIds.map(normalizeId).filter(Boolean);
    }

    const featuredItems = items.filter((item) => item?.isFeatured === true);

    if (featuredItems.length) {
      return featuredItems.map((item) => item.id);
    }

    return [];
  };

  const getFeaturedMenuItems = async (limit = 8) => {
    const { menu, items, byId } = await loadMenuStore();
    const requestedIds = selectFeaturedIds(menu, items);
    const selected = [];
    const seen = new Set();

    requestedIds.forEach((id) => {
      if (selected.length >= limit || !byId.has(id) || seen.has(id)) {
        return;
      }

      selected.push(byId.get(id));
      seen.add(id);
    });

    if (selected.length < limit) {
      items.forEach((item) => {
        if (selected.length >= limit || seen.has(item.id)) {
          return;
        }

        selected.push(item);
        seen.add(item.id);
      });
    }

    return selected.slice(0, limit);
  };

  const getMenuItemById = async (id) => {
    const { byId } = await loadMenuStore();
    return byId.get(normalizeId(id)) || null;
  };

  window.FigataData = window.FigataData || {};
  window.FigataData.menu = {
    loadMenuStore,
    getFeaturedMenuItems,
    getMenuItemById,
  };
})();
