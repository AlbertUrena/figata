(() => {
  const PILL_MS = 390;
  const PILL_EASE = createBezierEasing(0.45, 0, 0.55, 1);
  const SEARCH_FADE_OUT_MS = 180;
  const SEARCH_FADE_IN_MS = 220;
  const SEARCH_FADE_OUT_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
  const SEARCH_FADE_IN_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const SEARCH_FADE_OUT_Y_PX = -10;
  const SEARCH_FADE_IN_Y_PX = 12;
  const SEARCH_STAGGER_OUT_MS = 16;
  const SEARCH_STAGGER_IN_MS = 18;
  const SEARCH_STAGGER_OUT_CAP_MS = 96;
  const SEARCH_STAGGER_IN_CAP_MS = 126;
  const SEARCH_LAYOUT_MOVE_MS = 240;
  const SEARCH_LAYOUT_MOVE_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const SEARCH_EMPTY_ART_PATH = '/assets/home/no-result.webp';
  const MENU_GROUPS = [
    {
      id: 'entradas',
      label: 'Entradas',
      sourceCategoryIds: ['entradas'],
      emptyMessage: 'No hay entradas disponibles en este momento.',
    },
    {
      id: 'pizzas',
      label: 'Pizzas',
      sourceCategoryIds: ['pizza', 'pizza_autor'],
      hashAliases: ['pizza', 'pizza_autor'],
      emptyMessage: 'No hay pizzas disponibles en este momento.',
    },
    {
      id: 'postres',
      label: 'Postres',
      sourceCategoryIds: ['postres'],
      emptyMessage: 'No hay postres disponibles en este momento.',
    },
    {
      id: 'bebidas',
      label: 'Bebidas',
      sourceCategoryIds: ['bebidas'],
      emptyMessage: 'Nuestra selección de bebidas estará disponible pronto.',
    },
    {
      id: 'productos',
      label: 'Productos',
      sourceCategoryIds: ['productos'],
      emptyMessage: 'No hay productos disponibles en este momento.',
    },
  ];

  const listView = document.getElementById('menu-list-view');
  const detailView = document.getElementById('menu-detail-view');
  const tabRoot = document.getElementById('menu-page-tabs');
  const contentRoot = document.getElementById('menu-categories-content');
  const statusNode = document.getElementById('menu-page-status');
  const searchRoot = document.getElementById('menu-page-search');
  const searchInput = document.getElementById('menu-page-search-input');
  const clearSearchButton = document.getElementById('menu-page-search-clear');
  const cardTemplate = document.getElementById('menu-page-card-template');

  if (
    !(listView instanceof HTMLElement) ||
    !(detailView instanceof HTMLElement) ||
    !(tabRoot instanceof HTMLElement) ||
    !(contentRoot instanceof HTMLElement) ||
    !(statusNode instanceof HTMLElement) ||
    !(cardTemplate instanceof HTMLTemplateElement)
  ) {
    return;
  }

  const detailBackButton = document.getElementById('menu-detail-back');
  const detailStatusNode = document.getElementById('menu-detail-status');
  const detailImage = document.getElementById('menu-detail-image');
  const detailCategory = document.getElementById('menu-detail-category');
  const detailTitle = document.getElementById('menu-detail-title');
  const detailDescription = document.getElementById('menu-detail-description');
  const detailPrice = document.getElementById('menu-detail-price');
  const detailTagsSection = document.getElementById('menu-detail-tags-section');
  const detailTags = document.getElementById('menu-detail-tags');
  const detailIngredientsSection = document.getElementById(
    'menu-detail-ingredients-section'
  );
  const detailIngredients = document.getElementById('menu-detail-ingredients');
  const detailAllergensSection = document.getElementById(
    'menu-detail-allergens-section'
  );
  const detailAllergens = document.getElementById('menu-detail-allergens');
  const detailAvailability = document.getElementById('menu-detail-availability');

  const tabRail = tabRoot.querySelector('.events-tabs-rail');
  const tabPill = tabRoot.querySelector('.events-tabs-pill');
  const tabEntries = MENU_GROUPS.map((group) => ({
    ...group,
    tab: tabRoot.querySelector(`.events-tab[data-menu-group-id="${group.id}"]`),
  })).filter((group) => group.tab instanceof HTMLElement);

  if (!(tabRail instanceof HTMLElement) || !(tabPill instanceof HTMLElement) || !tabEntries.length) {
    return;
  }

  const menuApi = window.FigataData?.menu;
  const mediaApi = window.FigataData?.media;
  const ingredientsApi = window.FigataData?.ingredients;

  if (
    !menuApi?.getMenuItemsByCategory ||
    !menuApi?.getMenuItemById
  ) {
    console.error('[menu-page] API de menú no disponible.');
    statusNode.textContent = 'No se pudo cargar el menú.';
    statusNode.classList.add('is-error');
    return;
  }

  const state = {
    categories: [],
    sectionsByCategoryId: new Map(),
    itemsById: new Map(),
    activeCategoryId: '',
    searchQuery: '',
    renderedSearchSignature: '',
    renderedSearchQuery: '',
    scrollTicking: false,
    tabAnimationFrameId: 0,
    tabPillX: 0,
    tabsBound: false,
    searchTransitionToken: 0,
    searchTransitioning: false,
  };
  let bridgeReadyResolver = null;

  const bridgeReadyPromise = new Promise((resolve) => {
    bridgeReadyResolver = resolve;
  });

  const PIZZA_GROUP_ID = 'pizzas';

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const normalizeText = (value) => String(value || '').trim();

  const finishBridgeReady = () => {
    if (!bridgeReadyResolver) {
      return;
    }

    bridgeReadyResolver();
    bridgeReadyResolver = null;
    window.dispatchEvent(new CustomEvent('figata:menu-page-ready'));
  };

  const getBridgeState = () => ({
    categories: state.categories
      .map((category) => ({
        id: normalizeText(category?.id),
        label: normalizeText(category?.label),
      }))
      .filter((category) => category.id && category.label),
    activeCategoryId:
      normalizeText(state.activeCategoryId) ||
      normalizeText(state.categories[0]?.id),
    searchQuery: normalizeText(state.searchQuery),
    isSearching: Boolean(normalizeText(state.searchQuery)),
    isListViewVisible: !listView.hidden,
  });

  const emitBridgeState = () => {
    window.dispatchEvent(
      new CustomEvent('figata:menu-page-state-change', {
        detail: getBridgeState(),
      })
    );
  };

  const normalizeSearchValue = (value) => {
    const normalized = normalizeText(value);

    if (!normalized) {
      return '';
    }

    return normalized
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  const toAbsoluteAssetPath = (value) => {
    const raw = normalizeText(value);

    if (!raw) {
      return '';
    }

    if (/^(https?:|data:|blob:)/i.test(raw)) {
      return raw;
    }

    const cleaned = raw
      .replace(/^\/+/, '')
      .replace(/^(\.\/)+/, '')
      .replace(/^(\.\.\/)+/, '');

    return `/${cleaned}`;
  };

  const isMenuPlaceholderPath = (value) =>
    normalizeText(value).includes('menu/placeholders/');

  const toSectionId = (categoryId) => {
    const slug = normalizeText(categoryId)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return `menu-category-${slug || 'section'}`;
  };

  const toMenuListUrl = () => '/menu/';

  const toMenuDetailUrl = (itemId) =>
    `/menu/?item=${encodeURIComponent(normalizeText(itemId))}`;

  const getRouteItemId = () => {
    const params = new URL(window.location.href).searchParams;
    return normalizeText(params.get('item'));
  };

  const setStatus = (text, { isError = false, hide = false } = {}) => {
    statusNode.textContent = text;
    statusNode.classList.toggle('is-error', Boolean(isError));
    statusNode.hidden = Boolean(hide);
  };

  const setDetailStatus = (text, { isError = false, hide = false } = {}) => {
    if (!(detailStatusNode instanceof HTMLElement)) {
      return;
    }

    detailStatusNode.textContent = text;
    detailStatusNode.classList.toggle('is-error', Boolean(isError));
    detailStatusNode.hidden = Boolean(hide);
  };

  const getHeaderOffset = () => {
    const header = document.querySelector('.site-header');
    const headerHeight = header ? header.getBoundingClientRect().height : 76;
    return headerHeight + 18;
  };

  const updatePageTitle = (itemTitle = '') => {
    document.title = itemTitle
      ? `${itemTitle} | Menú | Figata Pizza & Wine`
      : 'Menú | Figata Pizza & Wine';
  };

  const formatFallbackLabel = (value) => {
    const cleaned = normalizeText(value).replace(/[_-]+/g, ' ');

    if (!cleaned) {
      return '';
    }

    return cleaned
      .split(/\s+/)
      .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
      .join(' ');
  };

  const getSearchableText = (item, category) =>
    [
      item?.id,
      item?.name,
      item?.descriptionShort,
      item?.descriptionLong,
      item?.categoryLabel,
      category?.label,
      Array.isArray(item?.ingredients)
        ? item.ingredients.map(formatFallbackLabel).join(' ')
        : '',
      Array.isArray(item?.allergens)
        ? item.allergens.map(formatFallbackLabel).join(' ')
        : '',
      Array.isArray(item?.public_badges?.flat)
        ? item.public_badges.flat.map((badge) => normalizeText(badge?.label)).join(' ')
        : '',
    ].join(' ');

  const itemMatchesSearch = (item, category, query = state.searchQuery) => {
    const normalizedQuery = normalizeSearchValue(query);

    if (!normalizedQuery) {
      return true;
    }

    return normalizeSearchValue(getSearchableText(item, category)).includes(
      normalizedQuery
    );
  };

  const renderTagBadges = (container, badges = []) => {
    if (!(container instanceof HTMLElement)) {
      return;
    }

    container.replaceChildren();

    badges.forEach((badge) => {
      const group = normalizeText(badge?.group);
      const modifier =
        group === 'dietary'
          ? 'menu-trait-badge--dietary'
          : group === 'content'
            ? 'menu-trait-badge--content'
            : group === 'experience'
              ? 'menu-trait-badge--experience'
              : '';

      const label = normalizeText(badge?.label);

      if (!label) {
        return;
      }

      const node = document.createElement('span');
      node.className = ['menu-trait-badge', modifier].filter(Boolean).join(' ');
      node.textContent = label;
      container.appendChild(node);
    });
  };

  const renderTextList = (container, values = []) => {
    if (!(container instanceof HTMLElement)) {
      return;
    }

    container.replaceChildren();

    values.forEach((value) => {
      const label = normalizeText(value);

      if (!label) {
        return;
      }

      const item = document.createElement('li');
      item.className = 'menu-page-detail__list-item';
      item.textContent = label;
      container.appendChild(item);
    });
  };

  const resolveItemMedia = (item) => {
    const fallback = toAbsoluteAssetPath(item?.image);
    const fallbackAlt = normalizeText(item?.name || item?.id);

    if (!mediaApi?.get) {
      return {
        card: fallback,
        hover: '',
        detail: fallback,
        alt: fallbackAlt,
      };
    }

    const card = toAbsoluteAssetPath(mediaApi.get(item.id, 'card'));
    const hover = toAbsoluteAssetPath(mediaApi.get(item.id, 'hover'));
    const detail = toAbsoluteAssetPath(mediaApi.get(item.id, 'modal'));
    const alt = normalizeText(mediaApi.getAlt(item.id) || fallbackAlt);
    const fallbackIsConcrete = Boolean(fallback) && !isMenuPlaceholderPath(fallback);
    const cardIsPlaceholder = isMenuPlaceholderPath(card);
    const detailIsPlaceholder = isMenuPlaceholderPath(detail);
    const resolvedCard =
      card && !(cardIsPlaceholder && fallbackIsConcrete) ? card : fallback;
    const resolvedDetail =
      detail && !(detailIsPlaceholder && fallbackIsConcrete)
        ? detail
        : resolvedCard || fallback;

    return {
      card: resolvedCard,
      hover: hover && hover !== resolvedCard && !isMenuPlaceholderPath(hover) ? hover : '',
      detail: resolvedDetail,
      alt: alt || fallbackAlt,
    };
  };

  const toCardViewModel = (item) => {
    const media = resolveItemMedia(item);

    return {
      id: normalizeText(item?.id),
      title: normalizeText(item?.name || item?.id),
      description:
        normalizeText(item?.descriptionShort) ||
        normalizeText(item?.descriptionLong),
      price: normalizeText(item?.priceFormatted),
      available: item?.available !== false,
      image: media.card,
      hoverImage: media.hover,
      imageAlt: media.alt,
    };
  };

  const toDetailViewModel = (item) => {
    const media = resolveItemMedia(item);
    const badges = Array.isArray(item?.public_badges?.flat)
      ? item.public_badges.flat
      : [];

    return {
      id: normalizeText(item?.id),
      title: normalizeText(item?.name || item?.id),
      description:
        normalizeText(item?.descriptionLong) ||
        normalizeText(item?.descriptionShort),
      price: normalizeText(item?.priceFormatted),
      available: item?.available !== false,
      soldOutReason: normalizeText(item?.soldOutReason),
      categoryLabel: normalizeText(item?.categoryLabel),
      badges,
      ingredients: Array.isArray(item?.ingredients) ? item.ingredients : [],
      allergens: Array.isArray(item?.allergens) ? item.allergens : [],
      image: media.detail || media.card,
      imageAlt: media.alt,
    };
  };

  const resolveIngredientLabels = async (ingredientIds = []) => {
    if (!Array.isArray(ingredientIds) || !ingredientIds.length) {
      return [];
    }

    if (!ingredientsApi?.resolveIngredients) {
      return ingredientIds.map(formatFallbackLabel).filter(Boolean);
    }

    try {
      const resolvedIngredients = await ingredientsApi.resolveIngredients(
        ingredientIds
      );

      if (!Array.isArray(resolvedIngredients)) {
        return ingredientIds.map(formatFallbackLabel).filter(Boolean);
      }

      return resolvedIngredients
        .map((ingredient) => normalizeText(ingredient?.label))
        .filter(Boolean);
    } catch (error) {
      console.warn('[menu-page] No se pudieron resolver ingredientes.', error);
      return ingredientIds.map(formatFallbackLabel).filter(Boolean);
    }
  };

  const resolveAllergenLabels = async (allergenIds = []) => {
    if (!Array.isArray(allergenIds) || !allergenIds.length) {
      return [];
    }

    if (!ingredientsApi?.loadIngredientsStore) {
      return allergenIds.map(formatFallbackLabel).filter(Boolean);
    }

    try {
      const store = await ingredientsApi.loadIngredientsStore();
      const allergenMap =
        store?.allergens && typeof store.allergens === 'object'
          ? store.allergens
          : {};

      return allergenIds
        .map((allergenId) => {
          const normalizedId = normalizeText(allergenId);
          return normalizeText(allergenMap[normalizedId]?.label) || formatFallbackLabel(normalizedId);
        })
        .filter(Boolean);
    } catch (error) {
      console.warn('[menu-page] No se pudieron resolver alérgenos.', error);
      return allergenIds.map(formatFallbackLabel).filter(Boolean);
    }
  };

  const getCategoryIndex = (categoryId) =>
    state.categories.findIndex((category) => category.id === normalizeText(categoryId));

  const syncRailSpacers = (tabCount) => {
    const spacers = Array.from(tabRail.querySelectorAll('.events-tabs-spacer'));
    spacers.forEach((spacer) => spacer.remove());

    for (let index = 1; index < tabCount; index += 1) {
      const spacer = document.createElement('div');
      spacer.className = 'events-tabs-spacer';
      spacer.style.left = `calc((100% / ${tabCount}) * ${index})`;
      tabRail.appendChild(spacer);
    }
  };

  const getTargetX = (index) => {
    const width = tabRail.getBoundingClientRect().width;
    const tabWidth = state.categories.length > 0 ? width / state.categories.length : width;
    return tabWidth * index;
  };

  const setPillPosition = (index, cancelAnimation = false) => {
    if (cancelAnimation && state.tabAnimationFrameId) {
      cancelAnimationFrame(state.tabAnimationFrameId);
      state.tabAnimationFrameId = 0;
    }

    const targetX = getTargetX(index);
    state.tabPillX = targetX;
    tabPill.style.transform = `translateX(${targetX}px)`;
  };

  const animatePillToIndex = (index) => {
    if (reducedMotionQuery.matches) {
      setPillPosition(index, true);
      return;
    }

    if (state.tabAnimationFrameId) {
      cancelAnimationFrame(state.tabAnimationFrameId);
      state.tabAnimationFrameId = 0;
    }

    const fromX = state.tabPillX;
    const targetX = getTargetX(index);
    const deltaX = targetX - fromX;
    let startTime = 0;

    if (deltaX === 0) {
      state.tabPillX = targetX;
      tabPill.style.transform = `translateX(${targetX}px)`;
      return;
    }

    const tick = (timestamp) => {
      if (startTime === 0) {
        startTime = timestamp;
      }

      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / PILL_MS, 1);
      const eased = PILL_EASE(progress);
      const nextX = fromX + deltaX * eased;

      state.tabPillX = nextX;
      tabPill.style.transform = `translateX(${nextX}px)`;

      if (progress < 1) {
        state.tabAnimationFrameId = requestAnimationFrame(tick);
        return;
      }

      state.tabPillX = targetX;
      tabPill.style.transform = `translateX(${targetX}px)`;
      state.tabAnimationFrameId = 0;
    };

    state.tabAnimationFrameId = requestAnimationFrame(tick);
  };

  const setActiveCategory = (
    categoryId,
    { animate = true, focus = false, force = false } = {}
  ) => {
    const normalizedId = normalizeText(categoryId);
    const nextIndex = getCategoryIndex(normalizedId);

    if (nextIndex < 0) {
      return;
    }

    if (!force && normalizedId === state.activeCategoryId) {
      if (focus) {
        state.categories[nextIndex].tab.focus();
      }
      return;
    }

    state.activeCategoryId = normalizedId;

    state.categories.forEach((category, index) => {
      const isActive = index === nextIndex;
      category.tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      category.tab.setAttribute('tabindex', isActive ? '0' : '-1');
      category.tab.classList.toggle('is-active', isActive);
      category.tab.setAttribute('data-tab', String(index));
    });

    if (animate) {
      animatePillToIndex(nextIndex);
    } else {
      setPillPosition(nextIndex, true);
    }

    if (focus) {
      state.categories[nextIndex].tab.focus();
    }

    emitBridgeState();
  };

  const scrollToCategory = (categoryId, { focusTab = false } = {}) => {
    const section = state.sectionsByCategoryId.get(categoryId);

    if (!(section instanceof HTMLElement)) {
      return;
    }

    const top =
      window.scrollY + section.getBoundingClientRect().top - getHeaderOffset();
    const behavior = reducedMotionQuery.matches ? 'auto' : 'smooth';

    window.scrollTo({
      top: Math.max(0, top),
      behavior,
    });

    setActiveCategory(categoryId, { animate: true, focus: focusTab });
  };

  const updateActiveCategoryByScroll = () => {
    state.scrollTicking = false;

    const renderedCategories = getRenderedCategories();

    if (listView.hidden || !renderedCategories.length) {
      return;
    }

    const offset = getHeaderOffset();
    let nextActiveId = renderedCategories[0].id;

    renderedCategories.forEach((category) => {
      const section = state.sectionsByCategoryId.get(category.id);

      if (!(section instanceof HTMLElement)) {
        return;
      }

      const top = section.getBoundingClientRect().top - offset;

      if (top <= 8) {
        nextActiveId = category.id;
      }
    });

    setActiveCategory(nextActiveId);
  };

  const scheduleActiveCategoryUpdate = () => {
    if (state.scrollTicking) {
      return;
    }

    state.scrollTicking = true;
    window.requestAnimationFrame(updateActiveCategoryByScroll);
  };

  const activateCategoryByIndex = (index, { focus = false } = {}) => {
    if (index < 0 || index > state.categories.length - 1) {
      return;
    }

    scrollToCategory(state.categories[index].id, { focusTab: focus });
  };

  const bindMenuTabs = () => {
    if (state.tabsBound) {
      return;
    }

    tabRoot.style.setProperty('--events-tab-count', String(state.categories.length));
    syncRailSpacers(state.categories.length);

    state.categories.forEach((category, index) => {
      category.tab.addEventListener('click', () => {
        activateCategoryByIndex(index);
      });

      category.tab.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          activateCategoryByIndex((index + 1) % state.categories.length, { focus: true });
          return;
        }

        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          activateCategoryByIndex(
            (index - 1 + state.categories.length) % state.categories.length,
            { focus: true }
          );
          return;
        }

        if (event.key === 'Home') {
          event.preventDefault();
          activateCategoryByIndex(0, { focus: true });
          return;
        }

        if (event.key === 'End') {
          event.preventDefault();
          activateCategoryByIndex(state.categories.length - 1, { focus: true });
          return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activateCategoryByIndex(index);
        }
      });
    });

    state.tabsBound = true;
  };

  const createCard = (card) => {
    const node = cardTemplate.content.cloneNode(true);
    const article = node.querySelector('.mas-pedidas-card');
    const mediaContainer = node.querySelector('.mas-pedidas-card__media');
    const baseImage = node.querySelector('.mas-pedidas-card__image--base');
    const hoverImage = node.querySelector('.mas-pedidas-card__image--hover');
    const title = node.querySelector('.mas-pedidas-card__title');
    const description = node.querySelector('.mas-pedidas-card__description');
    const price = node.querySelector('.mas-pedidas-card__price');
    const detailsButton = node.querySelector('.mas-pedidas-card__button');

    if (
      !(article instanceof HTMLElement) ||
      !(mediaContainer instanceof HTMLElement) ||
      !(baseImage instanceof HTMLImageElement) ||
      !(hoverImage instanceof HTMLImageElement) ||
      !(title instanceof HTMLElement) ||
      !(description instanceof HTMLElement) ||
      !(price instanceof HTMLElement) ||
      !(detailsButton instanceof HTMLButtonElement)
    ) {
      return document.createDocumentFragment();
    }

    title.textContent = card.title;
    description.textContent = card.description;
    price.textContent = card.price;
    article.dataset.menuItemId = normalizeText(card.id);
    article.classList.toggle('is-unavailable', !card.available);
    mediaContainer.classList.remove('is-empty');

    if (card.image) {
      baseImage.src = card.image;
      baseImage.alt = card.imageAlt || card.title;
      baseImage.loading = 'lazy';
      baseImage.decoding = 'async';
      baseImage.hidden = false;

      if (card.hoverImage && card.hoverImage !== card.image) {
        hoverImage.src = card.hoverImage;
        hoverImage.alt = '';
        hoverImage.hidden = false;
        article.classList.add('has-hover-image');
      } else {
        hoverImage.hidden = true;
        hoverImage.removeAttribute('src');
        article.classList.remove('has-hover-image');
      }
    } else {
      baseImage.hidden = true;
      baseImage.removeAttribute('src');
      hoverImage.hidden = true;
      hoverImage.removeAttribute('src');
      mediaContainer.classList.add('is-empty');
      article.classList.remove('has-hover-image');
    }

    detailsButton.addEventListener('click', () => {
      const detailUrl = toMenuDetailUrl(card.id);
      window.history.pushState({ item: card.id }, '', detailUrl);
      void renderRouteFromLocation();
    });

    article.addEventListener(
      'pointerenter',
      () => {
        if (mediaApi?.prefetch) {
          mediaApi.prefetch(card.id, 'modal');
        }
      },
      { once: true }
    );

    return node;
  };

  const createEmptyState = (message) => {
    const node = document.createElement('p');
    node.className = 'menu-page-category__empty';
    node.textContent = message;
    return node;
  };

  const getSearchEmptyMessage = (query) => {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
      return 'No vimos coincidencias en el menú.';
    }

    return `No vimos coincidencias para "${normalizedQuery}" en el menú.`;
  };

  const createSearchEmptyState = (query) => {
    const node = document.createElement('section');
    node.className = 'menu-page-search-empty';
    node.setAttribute('aria-labelledby', 'menu-search-empty-title');

    const art = document.createElement('img');
    art.className = 'menu-page-search-empty__art';
    art.src = toAbsoluteAssetPath(SEARCH_EMPTY_ART_PATH);
    art.alt = '';
    art.decoding = 'async';
    art.loading = 'eager';

    const title = document.createElement('h2');
    title.className = 'menu-page-search-empty__title';
    title.id = 'menu-search-empty-title';
    title.textContent = 'No encontramos resultados';

    const message = document.createElement('p');
    message.className = 'menu-page-search-empty__message';
    message.textContent = getSearchEmptyMessage(query);

    const hint = document.createElement('p');
    hint.className = 'menu-page-search-empty__hint';
    hint.textContent = 'Prueba con otro término o revisa la ortografía.';

    node.append(art, title, message, hint);
    return node;
  };

  const createCategoryGrid = (items = []) => {
    const grid = document.createElement('div');
    grid.className = 'menu-page-grid';

    items.forEach((item) => {
      grid.appendChild(createCard(toCardViewModel(item)));
    });

    return grid;
  };

  const createPizzaSubgroupLabel = (sourceCategory, items = []) => {
    const title = document.createElement('h3');
    title.className = 'menu-page-category__subgroup-title';

    const runtimeLabel =
      normalizeText(sourceCategory?.label) ||
      normalizeText(items[0]?.categoryLabel);

    title.textContent = runtimeLabel || formatFallbackLabel(sourceCategory?.id);

    return title;
  };

  const renderPizzaCategoryContent = (section, category, visibleItems) => {
    const itemsBySourceCategoryId = new Map();

    visibleItems.forEach((item) => {
      const sourceCategoryId = normalizeText(item?.category);

      if (!sourceCategoryId) {
        return;
      }

      if (!itemsBySourceCategoryId.has(sourceCategoryId)) {
        itemsBySourceCategoryId.set(sourceCategoryId, []);
      }

      itemsBySourceCategoryId.get(sourceCategoryId).push(item);
    });

    const sourceCategories = Array.isArray(category?.sourceCategories)
      ? category.sourceCategories
      : [];

    const renderedGroups = sourceCategories
      .map((sourceCategory) => {
        const sourceCategoryId = normalizeText(sourceCategory?.id);

        return {
          sourceCategory,
          items: itemsBySourceCategoryId.get(sourceCategoryId) || [],
        };
      })
      .filter(({ items }) => items.length > 0);

    if (!renderedGroups.length) {
      section.appendChild(createEmptyState(category.emptyMessage));
      return;
    }

    renderedGroups.forEach(({ sourceCategory, items }) => {
      const subgroup = document.createElement('div');
      subgroup.className = 'menu-page-category__subgroup';
      subgroup.dataset.sourceCategoryId = normalizeText(sourceCategory?.id);
      subgroup.appendChild(createPizzaSubgroupLabel(sourceCategory, items));
      subgroup.appendChild(createCategoryGrid(items));
      section.appendChild(subgroup);
    });
  };

  const getRenderedCategories = () =>
    state.categories.filter((category) => state.sectionsByCategoryId.has(category.id));

  const delay = (ms) =>
    new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });

  const getSearchTransitionNodes = () => {
    const nodes = Array.from(
      contentRoot.querySelectorAll(
        '.menu-page-category__title, .menu-page-category__subgroup-title, .mas-pedidas-card, .menu-page-category__empty, .menu-page-search-empty'
      )
    ).filter((node) => node instanceof HTMLElement);

    if (nodes.length) {
      return nodes;
    }

    return Array.from(contentRoot.children).filter((node) => node instanceof HTMLElement);
  };

  const clearNodeTransitionStyles = (nodes = []) => {
    nodes.forEach((node) => {
      node.style.transition = '';
      node.style.transitionProperty = '';
      node.style.transitionDuration = '';
      node.style.transitionTimingFunction = '';
      node.style.transitionDelay = '';
      node.style.opacity = '';
      node.style.transform = '';
      node.style.willChange = '';
    });
  };

  const getCardNodeId = (node) =>
    node instanceof HTMLElement ? normalizeText(node.dataset.menuItemId) : '';

  const captureNodeRectsById = (nodes = []) => {
    const rectsById = new Map();

    nodes.forEach((node) => {
      const itemId = getCardNodeId(node);

      if (!itemId) {
        return;
      }

      rectsById.set(itemId, node.getBoundingClientRect());
    });

    return rectsById;
  };

  const prepareLayoutFlipNodes = (nodes = [], previousRectsById = new Map()) => {
    const movingNodes = [];

    nodes.forEach((node) => {
      const itemId = getCardNodeId(node);
      const previousRect = previousRectsById.get(itemId);

      if (!previousRect) {
        return;
      }

      const nextRect = node.getBoundingClientRect();
      const deltaX = previousRect.left - nextRect.left;
      const deltaY = previousRect.top - nextRect.top;

      if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) {
        return;
      }

      node.style.transition = 'none';
      node.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      node.style.willChange = 'transform';
      movingNodes.push(node);
    });

    return movingNodes;
  };

  const startLayoutFlipTransition = (nodes = []) => {
    nodes.forEach((node) => {
      node.style.transitionProperty = 'transform';
      node.style.transitionDuration = `${SEARCH_LAYOUT_MOVE_MS}ms`;
      node.style.transitionTimingFunction = SEARCH_LAYOUT_MOVE_EASE;
      node.style.transitionDelay = '0ms';
      node.style.transform = 'translate(0, 0)';
    });
  };

  const syncSearchControls = () => {
    if (
      !(searchInput instanceof HTMLInputElement) ||
      !(clearSearchButton instanceof HTMLButtonElement)
    ) {
      return;
    }

    const hasValue = searchInput.value.length > 0;
    clearSearchButton.classList.toggle('is-visible', hasValue);
    clearSearchButton.setAttribute('aria-hidden', hasValue ? 'false' : 'true');
    clearSearchButton.tabIndex = hasValue ? 0 : -1;
  };

  const cancelSearchResultsTransition = () => {
    state.searchTransitionToken += 1;
    state.searchTransitioning = false;
    clearNodeTransitionStyles(getSearchTransitionNodes());
  };

  const canAnimateSearchItemDiff = (previousRenderState, nextRenderState) =>
    previousRenderState.isSearching &&
    nextRenderState.isSearching &&
    !previousRenderState.isSearchEmpty &&
    !nextRenderState.isSearchEmpty &&
    getSearchResultsGrid() instanceof HTMLElement;

  const animateSearchResultItemsDiff = async (previousRenderState, nextRenderState) => {
    const grid = getSearchResultsGrid();

    if (!(grid instanceof HTMLElement)) {
      renderCategorySections(nextRenderState);
      state.searchTransitioning = false;
      return;
    }

    const token = state.searchTransitionToken + 1;
    state.searchTransitionToken = token;
    state.searchTransitioning = true;

    const previousIds = previousRenderState.visibleItemIds;
    const nextIds = nextRenderState.visibleItemIds;
    const previousIdSet = new Set(previousIds);
    const nextIdSet = new Set(nextIds);
    const cardNodesById = getSearchGridCardMap(grid);
    const previousRectsById = captureNodeRectsById(Array.from(cardNodesById.values()));
    const removedNodes = previousIds
      .filter((itemId) => !nextIdSet.has(itemId))
      .map((itemId) => cardNodesById.get(itemId))
      .filter((node) => node instanceof HTMLElement);

    removedNodes.forEach((node, index) => {
      const delayMs = getExitTransitionDelay(index);
      node.style.willChange = 'opacity, transform';
      node.style.transitionProperty = 'opacity, transform';
      node.style.transitionDuration = `${SEARCH_FADE_OUT_MS}ms`;
      node.style.transitionTimingFunction = SEARCH_FADE_OUT_EASE;
      node.style.transitionDelay = `${delayMs}ms`;
      node.style.opacity = '0';
      node.style.transform = `translateY(${SEARCH_FADE_OUT_Y_PX}px)`;
    });

    if (removedNodes.length) {
      void grid.offsetWidth;
      await delay(SEARCH_FADE_OUT_MS + getExitTransitionDelay(removedNodes.length - 1));

      if (token !== state.searchTransitionToken) {
        return;
      }

      removedNodes.forEach((node) => {
        node.remove();
      });
    }

    const persistedNodesById = getSearchGridCardMap(grid);
    const enteringNodes = [];
    const nextNodes = [];

    nextRenderState.visibleItems.forEach((item) => {
      const itemId = normalizeText(item?.id);
      let node = persistedNodesById.get(itemId);

      if (!node && !previousIdSet.has(itemId)) {
        node = createCardNode(item);

        if (node) {
          node.style.transition = 'none';
          node.style.opacity = '0';
          node.style.transform = `translateY(${SEARCH_FADE_IN_Y_PX}px)`;
          node.style.willChange = 'opacity, transform';
          enteringNodes.push(node);
        }
      }

      if (node) {
        nextNodes.push(node);
      }
    });

    grid.replaceChildren(...nextNodes);
    const persistedNodes = nextNodes.filter((node) => previousIdSet.has(getCardNodeId(node)));
    const movingNodes = prepareLayoutFlipNodes(persistedNodes, previousRectsById);
    state.sectionsByCategoryId.clear();
    setStatus('', { hide: true });
    state.renderedSearchSignature = nextRenderState.renderSignature;
    state.renderedSearchQuery = nextRenderState.query;

    if (!movingNodes.length && !enteringNodes.length) {
      state.searchTransitioning = false;
      return;
    }

    void grid.offsetWidth;
    startLayoutFlipTransition(movingNodes);

    enteringNodes.forEach((node, index) => {
      const delayMs = getEnterTransitionDelay(index);
      node.style.transitionProperty = 'opacity, transform';
      node.style.transitionDuration = `${SEARCH_FADE_IN_MS}ms`;
      node.style.transitionTimingFunction = SEARCH_FADE_IN_EASE;
      node.style.transitionDelay = `${delayMs}ms`;
      node.style.opacity = '1';
      node.style.transform = 'translateY(0)';
    });

    const enterDuration = enteringNodes.length
      ? SEARCH_FADE_IN_MS + getEnterTransitionDelay(enteringNodes.length - 1)
      : 0;
    const motionDuration = Math.max(SEARCH_LAYOUT_MOVE_MS, enterDuration);

    await delay(motionDuration);

    if (token !== state.searchTransitionToken) {
      return;
    }

    clearNodeTransitionStyles(movingNodes.concat(enteringNodes));
    state.searchTransitioning = false;
  };

  const animateSearchResultsUpdate = async (nextRenderState) => {
    const token = state.searchTransitionToken + 1;
    state.searchTransitionToken = token;
    state.searchTransitioning = true;
    const outgoingNodes = getSearchTransitionNodes();
    const shouldAnimate =
      !reducedMotionQuery.matches && outgoingNodes.length > 0;

    if (!shouldAnimate) {
      renderCategorySections(nextRenderState);
      state.searchTransitioning = false;
      return;
    }

    outgoingNodes.forEach((node, index) => {
      const delayMs = Math.min(index * SEARCH_STAGGER_OUT_MS, SEARCH_STAGGER_OUT_CAP_MS);
      node.style.willChange = 'opacity, transform';
      node.style.transitionProperty = 'opacity, transform';
      node.style.transitionDuration = `${SEARCH_FADE_OUT_MS}ms`;
      node.style.transitionTimingFunction = SEARCH_FADE_OUT_EASE;
      node.style.transitionDelay = `${delayMs}ms`;
      node.style.opacity = '0';
      node.style.transform = `translateY(${SEARCH_FADE_OUT_Y_PX}px)`;
    });

    void contentRoot.offsetWidth;
    await delay(SEARCH_FADE_OUT_MS + SEARCH_STAGGER_OUT_CAP_MS);

    if (token !== state.searchTransitionToken) {
      return;
    }

    renderCategorySections(nextRenderState);
    const incomingNodes = getSearchTransitionNodes();

    incomingNodes.forEach((node) => {
      node.style.transition = 'none';
      node.style.opacity = '0';
      node.style.transform = `translateY(${SEARCH_FADE_IN_Y_PX}px)`;
      node.style.willChange = 'opacity, transform';
    });

    void contentRoot.offsetWidth;

    incomingNodes.forEach((node, index) => {
      const delayMs = Math.min(index * SEARCH_STAGGER_IN_MS, SEARCH_STAGGER_IN_CAP_MS);
      node.style.transitionProperty = 'opacity, transform';
      node.style.transitionDuration = `${SEARCH_FADE_IN_MS}ms`;
      node.style.transitionTimingFunction = SEARCH_FADE_IN_EASE;
      node.style.transitionDelay = `${delayMs}ms`;
      node.style.opacity = '1';
      node.style.transform = 'translateY(0)';
    });

    await delay(SEARCH_FADE_IN_MS + SEARCH_STAGGER_IN_CAP_MS);

    if (token !== state.searchTransitionToken) {
      return;
    }

    clearNodeTransitionStyles(incomingNodes);
    state.searchTransitioning = false;
  };

  const getVisibleItemsForCategory = (category, query = state.searchQuery) => {
    const items = Array.isArray(category?.items) ? category.items : [];

    if (!query) {
      return items;
    }

    return items.filter((item) => itemMatchesSearch(item, category, query));
  };

  const buildRenderState = (query = state.searchQuery) => {
    const normalizedQuery = normalizeText(query);
    const isSearching = Boolean(normalizedQuery);
    const categoryEntries = state.categories.map((category) => ({
      category,
      visibleItems: getVisibleItemsForCategory(category, normalizedQuery),
    }));
    const totalMatches = categoryEntries.reduce(
      (count, entry) => count + entry.visibleItems.length,
      0
    );
    const renderableEntries = isSearching
      ? categoryEntries.filter((entry) => entry.visibleItems.length > 0)
      : categoryEntries;
    const visibleItemsOrdered = [];
    const visibleItemIds = [];

    renderableEntries.forEach(({ visibleItems: entryVisibleItems }) => {
      entryVisibleItems.forEach((item) => {
        visibleItemsOrdered.push(item);
        visibleItemIds.push(normalizeText(item?.id));
      });
    });

    return {
      query: normalizedQuery,
      isSearching,
      categoryEntries,
      renderableEntries,
      totalMatches,
      isSearchEmpty: isSearching && totalMatches === 0,
      visibleItems: visibleItemsOrdered,
      visibleItemIds,
      renderSignature: [
        isSearching ? 'search' : 'browse',
        totalMatches > 0 ? 'results' : 'empty',
        visibleItemIds.join('|'),
      ].join('::'),
    };
  };

  const getSearchResultsGrid = () => {
    if (contentRoot.childElementCount !== 1) {
      return null;
    }

    const grid = contentRoot.firstElementChild;
    return grid instanceof HTMLElement && grid.classList.contains('menu-page-grid')
      ? grid
      : null;
  };

  const getSearchGridCardMap = (grid = getSearchResultsGrid()) => {
    const nodes = new Map();

    if (!(grid instanceof HTMLElement)) {
      return nodes;
    }

    Array.from(grid.children).forEach((node) => {
      if (!(node instanceof HTMLElement) || !node.classList.contains('mas-pedidas-card')) {
        return;
      }

      const itemId = normalizeText(node.dataset.menuItemId);

      if (!itemId) {
        return;
      }

      nodes.set(itemId, node);
    });

    return nodes;
  };

  const createCardNode = (item) => {
    const fragment = createCard(toCardViewModel(item));
    const node = fragment instanceof DocumentFragment
      ? fragment.firstElementChild
      : fragment;

    return node instanceof HTMLElement ? node : null;
  };

  const getEnterTransitionDelay = (index) =>
    Math.min(index * SEARCH_STAGGER_IN_MS, SEARCH_STAGGER_IN_CAP_MS);

  const getExitTransitionDelay = (index) =>
    Math.min(index * SEARCH_STAGGER_OUT_MS, SEARCH_STAGGER_OUT_CAP_MS);

  const syncSearchEmptyStateMessage = (query) => {
    const emptyNode = contentRoot.querySelector('.menu-page-search-empty__message');

    if (!(emptyNode instanceof HTMLElement)) {
      return;
    }

    emptyNode.textContent = getSearchEmptyMessage(query);
    state.renderedSearchQuery = query;
  };

  const renderCategorySections = (renderState = buildRenderState()) => {
    contentRoot.replaceChildren();
    state.sectionsByCategoryId.clear();

    const contentFragment = document.createDocumentFragment();
    const {
      query,
      isSearching,
      renderableEntries,
      totalMatches,
      renderSignature,
    } = renderState;

    if (isSearching && totalMatches === 0) {
      contentRoot.appendChild(createSearchEmptyState(query));
      setStatus('', { hide: true });
      state.renderedSearchSignature = renderSignature;
      state.renderedSearchQuery = query;
      return;
    }

    if (isSearching) {
      const grid = createCategoryGrid(
        renderableEntries.flatMap(({ visibleItems }) => visibleItems)
      );

      contentRoot.appendChild(grid);
      setStatus('', { hide: true });
      state.renderedSearchSignature = renderSignature;
      state.renderedSearchQuery = query;
      return;
    }

    renderableEntries.forEach(({ category, visibleItems }) => {
      const section = document.createElement('section');
      section.className = 'menu-page-category';
      section.id = category.sectionId;
      section.setAttribute('data-category-id', category.id);

      const title = document.createElement('h2');
      title.className = 'menu-page-category__title';
      title.textContent = category.label;
      section.appendChild(title);

      if (visibleItems.length) {
        if (category.id === PIZZA_GROUP_ID) {
          renderPizzaCategoryContent(section, category, visibleItems);
        } else {
          section.appendChild(createCategoryGrid(visibleItems));
        }
      } else {
        section.appendChild(createEmptyState(category.emptyMessage));
      }

      contentFragment.appendChild(section);
      state.sectionsByCategoryId.set(category.id, section);
    });

    contentRoot.appendChild(contentFragment);
    setStatus('', { hide: true });
    state.renderedSearchSignature = renderSignature;
    state.renderedSearchQuery = query;
  };

  const showListView = () => {
    detailView.hidden = true;
    listView.hidden = false;
    setDetailStatus('', { hide: true });
    updatePageTitle();

    const renderedCategories = getRenderedCategories();
    const activeId = renderedCategories.some(
      (category) => category.id === state.activeCategoryId
    )
      ? state.activeCategoryId
      : renderedCategories[0]?.id || state.activeCategoryId || state.categories[0]?.id;

    if (activeId) {
      setActiveCategory(activeId, { animate: false, force: true });
    }

    scheduleActiveCategoryUpdate();
    emitBridgeState();
  };

  const showDetailView = () => {
    listView.hidden = true;
    detailView.hidden = false;
    emitBridgeState();
  };

  const renderDetail = async (item) => {
    if (
      !(detailImage instanceof HTMLImageElement) ||
      !(detailCategory instanceof HTMLElement) ||
      !(detailTitle instanceof HTMLElement) ||
      !(detailDescription instanceof HTMLElement) ||
      !(detailPrice instanceof HTMLElement) ||
      !(detailTagsSection instanceof HTMLElement) ||
      !(detailTags instanceof HTMLElement) ||
      !(detailIngredientsSection instanceof HTMLElement) ||
      !(detailIngredients instanceof HTMLElement) ||
      !(detailAllergensSection instanceof HTMLElement) ||
      !(detailAllergens instanceof HTMLElement) ||
      !(detailAvailability instanceof HTMLElement)
    ) {
      return;
    }

    const detail = toDetailViewModel(item);

    detailCategory.textContent = detail.categoryLabel;
    detailCategory.hidden = !detail.categoryLabel;

    detailTitle.textContent = detail.title;
    detailDescription.textContent = detail.description;
    detailPrice.textContent = detail.price;
    detailAvailability.textContent = detail.available
      ? 'Disponible'
      : detail.soldOutReason || 'No disponible';
    detailAvailability.classList.toggle('is-unavailable', !detail.available);

    if (detail.image) {
      detailImage.src = detail.image;
      detailImage.alt = detail.imageAlt || detail.title;
      detailImage.hidden = false;
    } else {
      detailImage.hidden = true;
      detailImage.removeAttribute('src');
      detailImage.alt = '';
    }

    renderTagBadges(detailTags, detail.badges);
    detailTagsSection.hidden = detail.badges.length === 0;

    const ingredientLabels = await resolveIngredientLabels(detail.ingredients);
    renderTextList(detailIngredients, ingredientLabels);
    detailIngredientsSection.hidden = ingredientLabels.length === 0;

    const allergenLabels = await resolveAllergenLabels(detail.allergens);
    renderTextList(detailAllergens, allergenLabels);
    detailAllergensSection.hidden = allergenLabels.length === 0;

    setDetailStatus('', { hide: true });
    showDetailView();
    updatePageTitle(detail.title);
  };

  const renderRouteFromLocation = async () => {
    const requestedItemId = getRouteItemId();

    if (!requestedItemId) {
      showListView();
      return;
    }

    const item =
      state.itemsById.get(requestedItemId) ||
      (await menuApi.getMenuItemById(requestedItemId));

    if (!item) {
      window.history.replaceState({}, '', toMenuListUrl());
      setStatus('El ítem solicitado no existe.', { isError: true });
      showListView();
      return;
    }

    await renderDetail(item);
  };

  const buildGroupItems = async (group) => {
    const items = [];
    const seen = new Set();

    for (const categoryId of group.sourceCategoryIds) {
      const categoryItems = await menuApi.getMenuItemsByCategory(categoryId);

      if (!Array.isArray(categoryItems)) {
        continue;
      }

      categoryItems.forEach((item) => {
        const itemId = normalizeText(item?.id);

        if (!itemId || seen.has(itemId)) {
          return;
        }

        seen.add(itemId);
        items.push(item);
      });
    }

    return items;
  };

  const findCategoryByHash = (hash) => {
    const normalizedHash = normalizeText(hash).replace(/^#/, '');

    if (!normalizedHash) {
      return null;
    }

    return (
      state.categories.find((category) => {
        const aliases = [
          category.id,
          category.sectionId,
          ...(Array.isArray(category.hashAliases) ? category.hashAliases : []),
          ...(Array.isArray(category.sourceCategoryIds) ? category.sourceCategoryIds : []),
        ];

        return aliases.includes(normalizedHash);
      }) || null
    );
  };

  const renderMenu = async () => {
    setStatus('Cargando menú...');

    if (mediaApi?.loadMediaStore) {
      try {
        await mediaApi.loadMediaStore();
      } catch (error) {
        console.warn('[menu-page] No se pudo cargar media.json.', error);
      }
    }

    const renderedGroups = await Promise.all(
      tabEntries.map(async (group) => ({
        ...group,
        sectionId: toSectionId(group.id),
        items: await buildGroupItems(group),
        sourceCategories: menuApi?.getMenuCategoryById
          ? await Promise.all(
              group.sourceCategoryIds.map(async (sourceCategoryId) => {
                const sourceCategory = await menuApi.getMenuCategoryById(sourceCategoryId);
                return sourceCategory || { id: sourceCategoryId, label: '' };
              })
            )
          : group.sourceCategoryIds.map((sourceCategoryId) => ({
              id: sourceCategoryId,
              label: '',
            })),
      }))
    );

    state.itemsById.clear();
    state.categories = renderedGroups;

    if (!state.categories.length) {
      setStatus('No hay categorías disponibles en este momento.');
      return;
    }

    bindMenuTabs();

    renderedGroups.forEach((category) => {
      category.items.forEach((item) => {
        state.itemsById.set(normalizeText(item.id), item);
      });
    });

    renderCategorySections();
    setActiveCategory(state.categories[0].id, { animate: false, force: true });

    if (!getRouteItemId()) {
      const hashMatch = findCategoryByHash(window.location.hash);

      if (hashMatch) {
        window.setTimeout(() => {
          scrollToCategory(hashMatch.id);
        }, 0);
      } else {
        scheduleActiveCategoryUpdate();
      }
    }
  };

  if (detailBackButton instanceof HTMLButtonElement) {
    detailBackButton.addEventListener('click', () => {
      window.history.pushState({}, '', toMenuListUrl());
      void renderRouteFromLocation();
    });
  }

  const applySearchQuery = (value) => {
    const nextQuery = normalizeText(value);

    syncSearchControls();

    if (nextQuery === state.searchQuery) {
      return;
    }

    const previousRenderState = state.renderedSearchSignature
      ? buildRenderState(state.renderedSearchQuery || state.searchQuery)
      : buildRenderState(state.searchQuery);
    const previousRenderSignature =
      state.renderedSearchSignature || previousRenderState.renderSignature;
    const nextRenderState = buildRenderState(nextQuery);
    const visibleResultsChanged =
      nextRenderState.renderSignature !== previousRenderSignature;

    state.searchQuery = nextQuery;

    if (visibleResultsChanged) {
      if (canAnimateSearchItemDiff(previousRenderState, nextRenderState)) {
        void animateSearchResultItemsDiff(previousRenderState, nextRenderState);
      } else {
        void animateSearchResultsUpdate(nextRenderState);
      }
    } else if (state.searchTransitioning) {
      cancelSearchResultsTransition();
      state.renderedSearchSignature = nextRenderState.renderSignature;
      state.renderedSearchQuery = nextQuery;
      setStatus('', { hide: true });
    } else if (nextRenderState.isSearchEmpty) {
      syncSearchEmptyStateMessage(nextQuery);
    } else {
      state.renderedSearchSignature = nextRenderState.renderSignature;
      state.renderedSearchQuery = nextQuery;
    }

    if (visibleResultsChanged && !listView.hidden) {
      const renderedCategories = getRenderedCategories();
      const activeId = renderedCategories.some(
        (category) => category.id === state.activeCategoryId
      )
        ? state.activeCategoryId
        : renderedCategories[0]?.id || state.activeCategoryId || state.categories[0]?.id;

      if (activeId) {
        setActiveCategory(activeId, { animate: false, force: true });
      }
      scheduleActiveCategoryUpdate();
    }

    emitBridgeState();
  };

  if (searchRoot instanceof HTMLElement && searchInput instanceof HTMLInputElement) {
    searchInput.addEventListener('input', () => {
      applySearchQuery(searchInput.value);
    });

    searchInput.addEventListener('search', () => {
      applySearchQuery(searchInput.value);
    });

    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && searchInput.value) {
        searchInput.value = '';
        applySearchQuery('');
      }
    });
  }

  if (clearSearchButton instanceof HTMLButtonElement) {
    clearSearchButton.addEventListener('click', (event) => {
      event.preventDefault();

      if (!(searchInput instanceof HTMLInputElement)) {
        return;
      }

      searchInput.value = '';
      applySearchQuery('');
      searchInput.focus();
    });
  }

  window.addEventListener('scroll', scheduleActiveCategoryUpdate, {
    passive: true,
  });
  window.addEventListener('resize', () => {
    const activeIndex = getCategoryIndex(state.activeCategoryId || state.categories[0]?.id);
    if (activeIndex >= 0) {
      setPillPosition(activeIndex, true);
    }
    scheduleActiveCategoryUpdate();
  }, {
    passive: true,
  });

  window.addEventListener('popstate', () => {
    void renderRouteFromLocation();
  });

  const waitForPublicNavbar = async () => {
    const navbarApi = window.FigataPublicNavbar;

    if (!navbarApi || typeof navbarApi.whenReady !== 'function') {
      return;
    }

    try {
      await navbarApi.whenReady();
    } catch (error) {
      console.warn('[menu-page] No se pudo esperar navbar compartido.', error);
    }
  };

  window.FigataMenuPage = {
    whenReady: () => bridgeReadyPromise,
    getState: () => getBridgeState(),
    scrollToCategory: (categoryId) => {
      scrollToCategory(normalizeText(categoryId));
    },
    setSearchQuery: (value) => {
      if (!(searchInput instanceof HTMLInputElement)) {
        return;
      }

      searchInput.value = normalizeText(value);
      applySearchQuery(searchInput.value);
      syncSearchControls();
    },
    focusSearch: () => {
      if (searchInput instanceof HTMLInputElement) {
        searchInput.focus();
      }
    },
  };

  void (async () => {
    try {
      await waitForPublicNavbar();
      await renderMenu();
      syncSearchControls();
      await renderRouteFromLocation();
      emitBridgeState();
      finishBridgeReady();
    } catch (error) {
      console.error('[menu-page] Error renderizando menú.', error);
      setStatus('No se pudo cargar el menú.', { isError: true });
      showListView();
      emitBridgeState();
      finishBridgeReady();
    }
  })();

  function createBezierEasing(mX1, mY1, mX2, mY2) {
    if (mX1 === mY1 && mX2 === mY2) {
      return (x) => x;
    }

    const NEWTON_ITERATIONS = 4;
    const NEWTON_MIN_SLOPE = 0.001;
    const SUBDIVISION_PRECISION = 0.0000001;
    const SUBDIVISION_MAX_ITERATIONS = 10;
    const SPLINE_SIZE = 11;
    const SAMPLE_STEP = 1 / (SPLINE_SIZE - 1);
    const samples = new Float32Array(SPLINE_SIZE);

    for (let index = 0; index < SPLINE_SIZE; index += 1) {
      samples[index] = calcBezier(index * SAMPLE_STEP, mX1, mX2);
    }

    function A(a1, a2) {
      return 1 - 3 * a2 + 3 * a1;
    }

    function B(a1, a2) {
      return 3 * a2 - 6 * a1;
    }

    function C(a1) {
      return 3 * a1;
    }

    function calcBezier(t, a1, a2) {
      return ((A(a1, a2) * t + B(a1, a2)) * t + C(a1)) * t;
    }

    function getSlope(t, a1, a2) {
      return 3 * A(a1, a2) * t * t + 2 * B(a1, a2) * t + C(a1);
    }

    function binarySubdivide(x, a, b) {
      let currentX;
      let currentT;
      let index = 0;

      do {
        currentT = a + (b - a) / 2;
        currentX = calcBezier(currentT, mX1, mX2) - x;
        if (currentX > 0) {
          b = currentT;
        } else {
          a = currentT;
        }
        index += 1;
      } while (
        Math.abs(currentX) > SUBDIVISION_PRECISION &&
        index < SUBDIVISION_MAX_ITERATIONS
      );

      return currentT;
    }

    function newtonRaphsonIterate(x, guessT) {
      let t = guessT;
      for (let index = 0; index < NEWTON_ITERATIONS; index += 1) {
        const slope = getSlope(t, mX1, mX2);
        if (slope === 0) {
          return t;
        }
        const currentX = calcBezier(t, mX1, mX2) - x;
        t -= currentX / slope;
      }
      return t;
    }

    function getTForX(x) {
      let intervalStart = 0;
      let currentSample = 1;
      const lastSample = SPLINE_SIZE - 1;

      while (currentSample !== lastSample && samples[currentSample] <= x) {
        intervalStart += SAMPLE_STEP;
        currentSample += 1;
      }

      currentSample -= 1;

      const dist =
        (x - samples[currentSample]) /
        (samples[currentSample + 1] - samples[currentSample]);
      const guessT = intervalStart + dist * SAMPLE_STEP;
      const slope = getSlope(guessT, mX1, mX2);

      if (slope >= NEWTON_MIN_SLOPE) {
        return newtonRaphsonIterate(x, guessT);
      }

      if (slope === 0) {
        return guessT;
      }

      return binarySubdivide(x, intervalStart, intervalStart + SAMPLE_STEP);
    }

    return (x) => {
      if (x <= 0) {
        return 0;
      }

      if (x >= 1) {
        return 1;
      }

      return calcBezier(getTForX(x), mY1, mY2);
    };
  }
})();
