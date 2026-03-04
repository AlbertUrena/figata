(() => {
  const INGREDIENTS_URL = new URL('data/ingredients.json', window.location.href);
  const INGREDIENTS_USAGE_URL = new URL('data/ingredients-usage.json', window.location.href);

  let cachedIngredientsStorePromise;

  const normalizeText = (value) =>
    String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const normalizeAssetPath = (value) => {
    if (typeof value !== 'string') {
      return '';
    }

    const trimmed = value.trim();

    if (!trimmed) {
      return '';
    }

    const normalized = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
    return normalized.replace(/^assets\/ingredients\//i, 'assets/Ingredients/');
  };

  const fetchJson = async (url, label) => {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`No se pudo cargar ${label} (${response.status})`);
    }

    return response.json();
  };

  const buildIngredientsStore = async () => {
    const [ingredientsJson, ingredientsUsageJson] = await Promise.all([
      fetchJson(INGREDIENTS_URL, 'ingredients.json'),
      fetchJson(INGREDIENTS_USAGE_URL, 'ingredients-usage.json'),
    ]);

    const ingredients = ingredientsJson?.ingredients || {};
    const icons = ingredientsJson?.icons || {};
    const aliasToIconFromUsage = ingredientsUsageJson?.ingredientAliasesToIcon || {};
    const normalizedToIngredientId = new Map();

    const registerAlias = (alias, ingredientId) => {
      const normalized = normalizeText(alias);

      if (!normalized || !ingredientId || normalizedToIngredientId.has(normalized)) {
        return;
      }

      normalizedToIngredientId.set(normalized, ingredientId);
    };

    Object.entries(ingredients).forEach(([ingredientId, ingredient]) => {
      registerAlias(ingredientId, ingredientId);
      registerAlias(ingredient?.label, ingredientId);
      registerAlias(ingredient?.name, ingredientId);

      const aliases = Array.isArray(ingredient?.aliases) ? ingredient.aliases : [];
      aliases.forEach((alias) => registerAlias(alias, ingredientId));
    });

    Object.entries(aliasToIconFromUsage).forEach(([alias, iconId]) => {
      const icon = icons?.[iconId];
      const covers = Array.isArray(icon?.covers) ? icon.covers : [];

      covers.forEach((coveredIngredientId) => registerAlias(alias, coveredIngredientId));
    });

    return {
      ingredients,
      icons,
      normalizedToIngredientId,
    };
  };

  const loadIngredientsStore = async () => {
    if (!cachedIngredientsStorePromise) {
      cachedIngredientsStorePromise = buildIngredientsStore();
    }

    return cachedIngredientsStorePromise;
  };

  const resolveIcon = (ingredient, icons) => {
    const iconValue = ingredient?.icon;

    if (typeof iconValue !== 'string' || !iconValue.trim()) {
      return '';
    }

    if (iconValue.includes('/') || iconValue.endsWith('.png') || iconValue.endsWith('.svg')) {
      return normalizeAssetPath(iconValue);
    }

    return normalizeAssetPath(icons?.[iconValue]?.icon || '');
  };

  const resolveIngredientInternal = (ingredientId, store) => {
    const { ingredients, icons, normalizedToIngredientId } = store;
    const normalizedId = normalizeText(ingredientId);
    const directIngredient = ingredients?.[ingredientId];
    const fallbackIngredientId = normalizedToIngredientId.get(normalizedId);
    const ingredient = directIngredient || ingredients?.[fallbackIngredientId];

    if (!ingredient) {
      console.warn(`[ingredients] Ingredient ID not found: ${ingredientId}`);
      return null;
    }

    const icon = resolveIcon(ingredient, icons);
    const iconMeta = typeof ingredient.icon === 'string' ? icons?.[ingredient.icon] : null;
    const label =
      ingredient?.name ||
      ingredient?.label ||
      iconMeta?.name ||
      iconMeta?.label ||
      fallbackIngredientId ||
      ingredientId;

    return {
      id: fallbackIngredientId || ingredientId,
      label,
      icon,
    };
  };

  const resolveIngredient = async (ingredientId) => {
    const store = await loadIngredientsStore();
    return resolveIngredientInternal(ingredientId, store);
  };

  const resolveIngredients = async (ingredientIds = []) => {
    if (!Array.isArray(ingredientIds)) {
      return [];
    }

    const store = await loadIngredientsStore();
    const resolved = [];

    ingredientIds.forEach((ingredientId) => {
      const ingredient = resolveIngredientInternal(ingredientId, store);

      if (ingredient) {
        resolved.push(ingredient);
      }
    });

    return resolved;
  };

  window.FigataData = window.FigataData || {};
  window.FigataData.ingredients = {
    loadIngredientsStore,
    resolveIngredient,
    resolveIngredients,
  };
})();
