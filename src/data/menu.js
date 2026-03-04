(() => {
  const MENU_URL = new URL('data/menu.json', window.location.href);
  const CATEGORIES_URL = new URL('data/categories.json', window.location.href);
  const AVAILABILITY_URL = new URL('data/availability.json', window.location.href);

  let cachedMenuStorePromise;

  const normalizeId = (value) => String(value || '').trim();

  const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

  const normalizeBoolean = (value, defaultValue = false) =>
    typeof value === 'boolean' ? value : defaultValue;

  const normalizeNumber = (value, defaultValue = 0) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : defaultValue;
  };

  const normalizeStringArray = (value) =>
    Array.isArray(value) ? value.map(normalizeText).filter(Boolean) : [];

  const normalizeAssetPath = (value) => {
    const trimmed = normalizeText(value);
    return trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
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

      console.warn(`[menu] No se pudo cargar ${label}; se usara fallback local.`, error);
      return defaultValue;
    }
  };

  const compareByOrderAndLabel = (a, b) => {
    const orderA = normalizeNumber(a?.order, 9999);
    const orderB = normalizeNumber(b?.order, 9999);

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    const labelA = normalizeText(a?.label || a?.id);
    const labelB = normalizeText(b?.label || b?.id);
    const labelCompare = labelA.localeCompare(labelB, 'es', { sensitivity: 'base' });

    if (labelCompare !== 0) {
      return labelCompare;
    }

    return normalizeId(a?.id).localeCompare(normalizeId(b?.id));
  };

  const toRuntimeSubcategory = (subcategory) => {
    const id = normalizeId(subcategory?.id);
    const label = normalizeText(subcategory?.label) || id;

    return {
      id,
      label,
      labelShort: normalizeText(subcategory?.labelShort) || label,
      labelLong: normalizeText(subcategory?.labelLong) || label,
      pillLabel: normalizeText(subcategory?.pillLabel) || label,
      description: normalizeText(subcategory?.description),
      icon: normalizeText(subcategory?.icon),
      order: normalizeNumber(subcategory?.order, 9999),
      enabled: normalizeBoolean(subcategory?.enabled, true),
      showOnHome: normalizeBoolean(subcategory?.showOnHome, false),
    };
  };

  const toRuntimeCategory = (category) => {
    const id = normalizeId(category?.id);
    const label = normalizeText(category?.label) || id;
    const subcategories = (Array.isArray(category?.subcategories) ? category.subcategories : [])
      .map(toRuntimeSubcategory)
      .filter((subcategory) => Boolean(subcategory.id));

    return {
      id,
      label,
      labelShort: normalizeText(category?.labelShort) || label,
      labelLong: normalizeText(category?.labelLong) || label,
      pillLabel: normalizeText(category?.pillLabel) || label,
      description: normalizeText(category?.description),
      icon: normalizeText(category?.icon),
      order: normalizeNumber(category?.order, 9999),
      enabled: normalizeBoolean(category?.enabled, true),
      showOnHome: normalizeBoolean(category?.showOnHome, false),
      legacyIds: normalizeStringArray(category?.legacyIds),
      subcategories: subcategories.sort(compareByOrderAndLabel),
    };
  };

  const createFallbackCategoryFromSection = (section, index) => {
    const id = normalizeId(section?.id);
    const label = normalizeText(section?.label) || id;

    return {
      id,
      label,
      labelShort: label,
      labelLong: label,
      pillLabel: label,
      description: '',
      icon: '',
      order: index + 1,
      enabled: true,
      showOnHome: false,
      legacyIds: [],
      subcategories: [],
    };
  };

  const buildCategoriesStore = (categoriesJson, menuSections) => {
    const sourceCategories = Array.isArray(categoriesJson?.categories)
      ? categoriesJson.categories
      : [];
    const categories = sourceCategories
      .map(toRuntimeCategory)
      .filter((category) => Boolean(category.id));
    const byId = new Map();

    categories.forEach((category) => {
      byId.set(category.id, category);
    });

    menuSections.forEach((section, index) => {
      const sectionId = normalizeId(section?.id);

      if (!sectionId || byId.has(sectionId)) {
        return;
      }

      const fallbackCategory = createFallbackCategoryFromSection(section, index);
      categories.push(fallbackCategory);
      byId.set(fallbackCategory.id, fallbackCategory);
    });

    const sortedCategories = categories.sort(compareByOrderAndLabel);
    const aliasToId = new Map();
    const subcategoriesByCategoryId = new Map();

    sortedCategories.forEach((category) => {
      aliasToId.set(category.id, category.id);

      category.legacyIds.forEach((legacyId) => {
        aliasToId.set(legacyId, category.id);
      });

      const subcategoryMap = new Map();
      category.subcategories.forEach((subcategory) => {
        subcategoryMap.set(subcategory.id, subcategory);
      });
      subcategoriesByCategoryId.set(category.id, subcategoryMap);
    });

    return {
      version: normalizeNumber(categoriesJson?.version, 1),
      schema:
        normalizeText(categoriesJson?.schema) || 'figata.menu.categories.v1',
      all: sortedCategories,
      enabled: sortedCategories.filter((category) => category.enabled),
      home: sortedCategories.filter(
        (category) => category.enabled && category.showOnHome
      ),
      byId,
      aliasToId,
      subcategoriesByCategoryId,
    };
  };

  const buildAvailabilityStore = (availabilityJson) => {
    const sourceItems = Array.isArray(availabilityJson?.items)
      ? availabilityJson.items
      : [];
    const byItemId = new Map();

    sourceItems.forEach((entry) => {
      const itemId = normalizeId(entry?.itemId);

      if (!itemId) {
        return;
      }

      byItemId.set(itemId, {
        itemId,
        available: normalizeBoolean(entry?.available, true),
        soldOutReason: normalizeText(entry?.soldOutReason),
      });
    });

    const items = Array.from(byItemId.values()).sort((a, b) =>
      a.itemId.localeCompare(b.itemId)
    );

    return {
      version: normalizeNumber(availabilityJson?.version, 1),
      schema:
        normalizeText(availabilityJson?.schema) ||
        'figata.menu.availability.v1',
      settings: {
        hideUnavailableItems: normalizeBoolean(
          availabilityJson?.settings?.hideUnavailableItems,
          false
        ),
      },
      items,
      byItemId,
    };
  };

  const inferItemSlug = (item) => {
    const explicitSlug = normalizeText(item?.slug);

    if (explicitSlug) {
      return explicitSlug;
    }

    return normalizeId(item?.id).replace(/_/g, '-');
  };

  const resolveItemImage = (item, mediaApi = null) => {
    const itemId = normalizeId(item?.id);

    if (mediaApi?.get && itemId) {
      const mediaPath = normalizeAssetPath(mediaApi.get(itemId, 'card'));

      if (mediaPath) {
        return mediaPath;
      }
    }

    return normalizeAssetPath(item?.image);
  };

  const resolveItemImageAlt = (item, mediaApi = null) => {
    const itemId = normalizeId(item?.id);

    if (mediaApi?.getAlt && itemId) {
      const mediaAlt = normalizeText(mediaApi.getAlt(itemId));

      if (mediaAlt) {
        return mediaAlt;
      }
    }

    return normalizeText(item?.name || itemId);
  };

  const resolveItemGallery = (item, mediaApi = null) => {
    const itemId = normalizeId(item?.id);

    if (mediaApi?.getGallery && itemId) {
      return normalizeStringArray(mediaApi.getGallery(itemId)).map(normalizeAssetPath);
    }

    return [];
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

  const resolveCategoryId = (rawCategoryId, sectionId, categoriesStore) => {
    const candidates = [normalizeId(rawCategoryId), normalizeId(sectionId)].filter(
      Boolean
    );

    for (const candidate of candidates) {
      if (categoriesStore.aliasToId.has(candidate)) {
        return categoriesStore.aliasToId.get(candidate);
      }

      if (categoriesStore.byId.has(candidate)) {
        return candidate;
      }
    }

    return candidates[0] || '';
  };

  const resolveSubcategoryId = (rawSubcategoryId, categoryId, categoriesStore) => {
    const subcategoryId = normalizeId(rawSubcategoryId);

    if (!subcategoryId) {
      return '';
    }

    if (!categoryId) {
      return subcategoryId;
    }

    const subcategoryMap = categoriesStore.subcategoriesByCategoryId.get(categoryId);

    if (!subcategoryMap || subcategoryMap.size === 0) {
      return subcategoryId;
    }

    return subcategoryMap.has(subcategoryId) ? subcategoryId : '';
  };

  const toRuntimeItem = (
    item,
    section,
    currency,
    categoriesStore,
    availabilityStore,
    mediaApi
  ) => {
    const id = normalizeId(item?.id);
    const slug = inferItemSlug(item);
    const normalizedPrice = normalizeNumber(item?.price, 0);
    const spicyLevel = Number.isFinite(item?.spicy_level)
      ? Number(item.spicy_level)
      : normalizeBoolean(item?.spicy, false)
        ? 1
        : 0;
    const categoryId = resolveCategoryId(item?.category, section?.id, categoriesStore);
    const categoryMeta = categoriesStore.byId.get(categoryId) || null;
    const subcategoryId = resolveSubcategoryId(
      item?.subcategory,
      categoryId,
      categoriesStore
    );
    const subcategoryMeta =
      categoriesStore.subcategoriesByCategoryId.get(categoryId)?.get(subcategoryId) ||
      null;
    const availabilityEntry = availabilityStore.byItemId.get(id);
    const itemLevelAvailable = normalizeBoolean(item?.available, true);
    const available = availabilityEntry
      ? availabilityEntry.available
      : itemLevelAvailable;
    const itemLevelSoldOutReason = normalizeText(
      item?.soldOutReason || item?.availabilityNote
    );
    const soldOutReason = availabilityEntry
      ? availabilityEntry.soldOutReason || itemLevelSoldOutReason
      : itemLevelSoldOutReason;

    return {
      ...item,
      id,
      slug,
      sectionId: section?.id || '',
      sectionLabel: section?.label || '',
      category: categoryId,
      categoryLabel: categoryMeta?.label || section?.label || categoryId,
      subcategory: subcategoryId,
      subcategoryLabel: subcategoryMeta?.label || '',
      image: resolveItemImage(item, mediaApi),
      imageAlt: resolveItemImageAlt(item, mediaApi),
      gallery: resolveItemGallery(item, mediaApi),
      descriptionShort: getItemShortDescription(item),
      descriptionLong: getItemLongDescription(item),
      price: normalizedPrice,
      priceFormatted: formatMenuPrice(normalizedPrice, currency),
      ingredients: normalizeStringArray(item?.ingredients),
      tags: normalizeStringArray(item?.tags),
      allergens: normalizeStringArray(item?.allergens),
      featured: normalizeBoolean(item?.featured, false),
      spicy_level: spicyLevel,
      vegetarian: normalizeBoolean(item?.vegetarian, false),
      vegan: normalizeBoolean(item?.vegan, false),
      available,
      soldOutReason,
    };
  };

  const buildMenuStore = async () => {
    const mediaApi = window.FigataData?.media || null;

    if (mediaApi?.loadMediaStore) {
      try {
        await mediaApi.loadMediaStore();
      } catch (error) {
        console.warn('[menu] No se pudo cargar media.json; se usaran campos legacy de imagen.', error);
      }
    }

    const [menu, categoriesJson, availabilityJson] = await Promise.all([
      fetchJson(MENU_URL, 'menu.json'),
      fetchJson(CATEGORIES_URL, 'categories.json', {
        optional: true,
        defaultValue: null,
      }),
      fetchJson(AVAILABILITY_URL, 'availability.json', {
        optional: true,
        defaultValue: null,
      }),
    ]);
    const sections = Array.isArray(menu?.sections) ? menu.sections : [];
    const categories = buildCategoriesStore(categoriesJson, sections);
    const availability = buildAvailabilityStore(availabilityJson);
    const items = [];
    const byId = new Map();
    const itemsByCategory = new Map();
    const shouldHideUnavailable = availability.settings.hideUnavailableItems === true;

    sections.forEach((section) => {
      const sectionItems = Array.isArray(section?.items) ? section.items : [];

      sectionItems.forEach((item) => {
        const runtimeItem = toRuntimeItem(
          item,
          section,
          menu.currency || 'DOP',
          categories,
          availability,
          mediaApi
        );

        if (!runtimeItem.id || (shouldHideUnavailable && runtimeItem.available === false)) {
          return;
        }

        items.push(runtimeItem);
        byId.set(runtimeItem.id, runtimeItem);

        if (runtimeItem.category) {
          const categoryItems = itemsByCategory.get(runtimeItem.category) || [];
          categoryItems.push(runtimeItem);
          itemsByCategory.set(runtimeItem.category, categoryItems);
        }
      });
    });

    return {
      menu,
      categories,
      availability,
      items,
      byId,
      itemsByCategory,
    };
  };

  const loadMenuStore = async () => {
    if (!cachedMenuStorePromise) {
      cachedMenuStorePromise = buildMenuStore();
    }

    return cachedMenuStorePromise;
  };

  const normalizePositiveLimit = (value, fallback = 8) => {
    const numeric = Number(value);

    if (!Number.isFinite(numeric)) {
      return fallback;
    }

    const rounded = Math.round(numeric);
    return rounded > 0 ? rounded : fallback;
  };

  const resolveFeaturedSelectionOptions = (optionsOrLimit) => {
    if (typeof optionsOrLimit === 'number' || optionsOrLimit === undefined) {
      return {
        limit: normalizePositiveLimit(optionsOrLimit, 8),
        featuredIds: [],
      };
    }

    if (optionsOrLimit && typeof optionsOrLimit === 'object') {
      return {
        limit: normalizePositiveLimit(optionsOrLimit.limit, 8),
        featuredIds: normalizeStringArray(optionsOrLimit.featuredIds),
      };
    }

    return {
      limit: 8,
      featuredIds: [],
    };
  };

  const selectFeaturedIds = (menu, items, explicitFeaturedIds = []) => {
    if (Array.isArray(explicitFeaturedIds) && explicitFeaturedIds.length) {
      return explicitFeaturedIds.map(normalizeId).filter(Boolean);
    }

    if (Array.isArray(menu?.featuredIds) && menu.featuredIds.length) {
      return menu.featuredIds.map(normalizeId).filter(Boolean);
    }

    const featuredItems = items.filter(
      (item) => item?.featured === true || item?.isFeatured === true
    );

    if (featuredItems.length) {
      return featuredItems.map((item) => item.id);
    }

    return [];
  };

  const getFeaturedMenuItems = async (optionsOrLimit = 8) => {
    const { limit, featuredIds } = resolveFeaturedSelectionOptions(optionsOrLimit);
    const { menu, items, byId } = await loadMenuStore();
    const requestedIds = selectFeaturedIds(menu, items, featuredIds);
    const shouldAutofill = requestedIds.length === 0;
    const selected = [];
    const seen = new Set();

    requestedIds.forEach((id) => {
      if (selected.length >= limit || !byId.has(id) || seen.has(id)) {
        return;
      }

      selected.push(byId.get(id));
      seen.add(id);
    });

    if (shouldAutofill && selected.length < limit) {
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

  const serializeSubcategory = (subcategory) => ({
    id: subcategory.id,
    label: subcategory.label,
    labelShort: subcategory.labelShort,
    labelLong: subcategory.labelLong,
    pillLabel: subcategory.pillLabel,
    description: subcategory.description,
    icon: subcategory.icon,
    order: subcategory.order,
    enabled: subcategory.enabled,
    showOnHome: subcategory.showOnHome,
  });

  const serializeCategory = (category) => ({
    id: category.id,
    label: category.label,
    labelShort: category.labelShort,
    labelLong: category.labelLong,
    pillLabel: category.pillLabel,
    description: category.description,
    icon: category.icon,
    order: category.order,
    enabled: category.enabled,
    showOnHome: category.showOnHome,
    legacyIds: category.legacyIds.slice(),
    subcategories: category.subcategories.map(serializeSubcategory),
  });

  const getMenuCategories = async ({ enabledOnly = true, homeOnly = false } = {}) => {
    const { categories } = await loadMenuStore();
    let source = enabledOnly ? categories.enabled : categories.all;

    if (homeOnly) {
      source = source.filter((category) => category.showOnHome);
    }

    return source.map(serializeCategory);
  };

  const getMenuCategoryById = async (id) => {
    const { categories } = await loadMenuStore();
    const normalizedId = normalizeId(id);
    const resolvedId = categories.aliasToId.get(normalizedId) || normalizedId;
    const category = categories.byId.get(resolvedId);

    return category ? serializeCategory(category) : null;
  };

  const getMenuItemsByCategory = async (categoryId) => {
    const { categories, itemsByCategory } = await loadMenuStore();
    const normalizedId = normalizeId(categoryId);
    const resolvedId = categories.aliasToId.get(normalizedId) || normalizedId;
    const items = itemsByCategory.get(resolvedId) || [];

    return items.slice();
  };

  const getAvailabilityConfig = async () => {
    const { availability } = await loadMenuStore();

    return {
      version: availability.version,
      schema: availability.schema,
      settings: {
        hideUnavailableItems: availability.settings.hideUnavailableItems,
      },
      items: availability.items.map((item) => ({
        itemId: item.itemId,
        available: item.available,
        soldOutReason: item.soldOutReason,
      })),
    };
  };

  window.FigataData = window.FigataData || {};
  window.FigataData.menu = {
    loadMenuStore,
    getFeaturedMenuItems,
    getMenuItemById,
    getMenuCategories,
    getMenuCategoryById,
    getMenuItemsByCategory,
    getAvailabilityConfig,
  };
})();
