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
  const SEARCH_HELPER_WORDS = Object.freeze([
    'ingredientes',
    'alérgenos',
    'platos',
    'bebidas',
  ]);
  const SEARCH_HELPER_INITIAL_DELAY_MS = 1200;
  const SEARCH_HELPER_RESTART_DELAY_MS = 800;
  const SEARCH_HELPER_IDLE_DELAY_MS = 2140;
  const SEARCH_HELPER_OUT_DURATION_MS = 240;
  const SEARCH_HELPER_IN_DURATION_MS = 350;
  const SEARCH_HELPER_IN_DELAY_MS = 60;
  const SEARCH_HELPER_OUT_STAGGER_MS = 12;
  const SEARCH_HELPER_IN_STAGGER_MS = 16;
  const SEARCH_HELPER_OUT_Y_PX = -18;
  const SEARCH_HELPER_IN_Y_PX = 16;
  const SEARCH_HELPER_BLUR_PX = 6;
  const SEARCH_HELPER_OUT_EASE = 'cubic-bezier(0.4, 0, 1, 1)';
  const SEARCH_HELPER_IN_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const FILTER_MODAL_EXIT_MS = 520;
  const FILTER_MODAL_FOOTER_SHADOW_EPSILON = 2;
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
  const searchHelper = document.getElementById('menu-page-search-helper');
  const searchHelperWord = document.getElementById('menu-page-search-helper-word');
  const clearSearchButton = document.getElementById('menu-page-search-clear');
  const filterButton = document.getElementById('menu-page-filter-button');
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
  const detailMeta = document.getElementById('menu-detail-meta');
  const detailPanel = document.getElementById('menu-detail-panel');
  const detailMedia = document.getElementById('menu-detail-media');
  const detailImage = document.getElementById('menu-detail-image');
  const detailReviews = document.getElementById('menu-detail-reviews');
  const detailTitle = document.getElementById('menu-detail-title');
  const detailDescription = document.getElementById('menu-detail-description');
  const detailPrice = document.getElementById('menu-detail-price');
  const detailSpecGrid = document.getElementById('menu-detail-spec-grid');
  const detailSpecsDivider = document.getElementById('menu-detail-specs-divider');
  const detailTagsDivider = document.getElementById('menu-detail-tags-divider');
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
  const detailSoldOutReason = document.getElementById('menu-detail-soldout-reason');
  const menuPageBody = document.body;
  const filterModal = document.getElementById('menu-filter-modal');
  const filterDialog = document.getElementById('menu-filter-modal-dialog');
  const filterCloseButton = document.getElementById('menu-filter-modal-close');
  const filterClearButton = document.getElementById('menu-filter-modal-clear');
  const filterPizzaTabsRoot = document.getElementById('menu-filter-modal-pizza-tabs');
  const filterOrganolepticCloud = document.getElementById('menu-filter-modal-organoleptic-cloud');
  const filterModalBody =
    filterDialog instanceof HTMLElement
      ? filterDialog.querySelector('.menu-filter-modal__body')
      : null;
  const traitsApi = window.FigataMenuTraits;
  const ORGANOLEPTIC_PROFILE_IDS = new Set([
    'fresh',
    'aromatic',
    'classic',
    'sweet_savory',
    'intense',
    'spicy',
    'truffled',
    'smoked',
  ]);
  const DIETARY_FILTER_IDS = new Set(['vegetarian', 'vegan']);
  const ORGANOLEPTIC_PROFILE_ICON_IDS = Object.freeze({
    fresh: 'albahaca',
    aromatic: 'romero',
    classic: 'san_marzano',
    sweet_savory: 'miel',
    intense: 'salami',
    spicy: 'chile',
    truffled: 'trufa',
    smoked: 'queso',
  });

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

  const createDefaultFilters = () => ({
    excludedAllergens: [],
    pizzaType: 'all',
    dietarySelections: [],
    organolepticSelections: [],
    priceMin: null,
    priceMax: null,
  });

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
    filterModalOpen: false,
    draftFilters: createDefaultFilters(),
    appliedFilters: createDefaultFilters(),
    globalPriceMin: 0,
    globalPriceMax: 0,
  };
  let bridgeReadyResolver = null;
  let filterModalCloseTimerId = 0;
  let filterModalChromeFrameId = 0;
  let filterModalRestoreFocusNode = null;
  let organolepticIconsPromise = null;
  let organolepticIconPathsByProfileId = new Map();
  let searchHelperTimerId = 0;
  let searchHelperAnimationTimerId = 0;
  let searchHelperFrameId = 0;
  let searchHelperWordIndex = 0;
  let searchHelperHasStarted = false;
  let searchHelperAnimating = false;

  const bridgeReadyPromise = new Promise((resolve) => {
    bridgeReadyResolver = resolve;
  });

  const PIZZA_GROUP_ID = 'pizzas';

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const normalizeText = (value) => String(value || '').trim();
  const formatDetailPrice = (item) => {
    const numericPrice = Number(item?.price);

    if (Number.isFinite(numericPrice) && numericPrice > 0) {
      return '$' + Math.round(numericPrice);
    }

    const formatted = normalizeText(item?.priceFormatted);
    if (formatted) {
      const normalizedFormattedValue = Number(
        formatted.replace(/[^0-9.,-]/g, '').replace(/,/g, '')
      );

      if (Number.isFinite(normalizedFormattedValue) && normalizedFormattedValue > 0) {
        return '$' + Math.round(normalizedFormattedValue);
      }

      return formatted
        .replace(/^RD\s*\$/i, '$')
        .replace(/^RD\b\s*/i, '')
        .replace(/[.,]\d+$/, '');
    }

    return '';
  };
  const DETAIL_ALLERGEN_ICONS = Object.freeze({
    milk: '/assets/lacteos.webp',
    nuts: '/assets/frutos-secos.webp',
    fish: '/assets/pescado.webp',
    gluten: '/assets/gluten.webp',
  });

  const toFilterPrice = (value) => {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const normalizePizzaType = (value) => {
    const normalizedValue = normalizeText(value).toLowerCase();

    if (normalizedValue === 'clasica' || normalizedValue === 'autor') {
      return normalizedValue;
    }

    return 'all';
  };

  const normalizeDietaryFilter = (value) => {
    const normalizedValue = normalizeText(value).toLowerCase();
    return DIETARY_FILTER_IDS.has(normalizedValue) ? normalizedValue : '';
  };

  const normalizeDietarySelections = (values) =>
    Array.from(
      new Set(
        (Array.isArray(values) ? values : [])
          .map((value) => normalizeDietaryFilter(value))
          .filter(Boolean)
      )
    );

  const normalizeOrganolepticSelection = (value) => {
    const normalizedValue = normalizeText(value).toLowerCase();
    return ORGANOLEPTIC_PROFILE_IDS.has(normalizedValue) ? normalizedValue : '';
  };

  const normalizeOrganolepticSelections = (values) =>
    Array.from(
      new Set(
        (Array.isArray(values) ? values : [])
          .map((value) => normalizeOrganolepticSelection(value))
          .filter(Boolean)
      )
    );

  const cloneFilters = (filters) => {
    const normalizedFilters = {
      excludedAllergens: Array.isArray(filters?.excludedAllergens)
        ? Array.from(
            new Set(filters.excludedAllergens.map((value) => normalizeText(value)).filter(Boolean))
          )
        : [],
      pizzaType: normalizePizzaType(filters?.pizzaType),
      dietarySelections: normalizeDietarySelections(filters?.dietarySelections),
      organolepticSelections: normalizeOrganolepticSelections(filters?.organolepticSelections),
      priceMin: toFilterPrice(filters?.priceMin),
      priceMax: toFilterPrice(filters?.priceMax),
    };

    if (
      normalizedFilters.priceMin !== null &&
      normalizedFilters.priceMax !== null &&
      normalizedFilters.priceMin > normalizedFilters.priceMax
    ) {
      normalizedFilters.priceMax = normalizedFilters.priceMin;
    }

    return normalizedFilters;
  };

  const replaceFilters = (target, source) => {
    const nextFilters = cloneFilters(source);

    target.excludedAllergens = nextFilters.excludedAllergens;
    target.pizzaType = nextFilters.pizzaType;
    target.dietarySelections = nextFilters.dietarySelections;
    target.organolepticSelections = nextFilters.organolepticSelections;
    target.priceMin = nextFilters.priceMin;
    target.priceMax = nextFilters.priceMax;

    return target;
  };

  const resetFilters = (target) => replaceFilters(target, createDefaultFilters());

  const hasActiveFilters = (filters) =>
    (Array.isArray(filters?.excludedAllergens) && filters.excludedAllergens.length > 0) ||
    normalizePizzaType(filters?.pizzaType) !== 'all' ||
    (Array.isArray(filters?.dietarySelections) && filters.dietarySelections.length > 0) ||
    (Array.isArray(filters?.organolepticSelections) && filters.organolepticSelections.length > 0) ||
    filters?.priceMin != null ||
    filters?.priceMax != null;

  const setFilterTriggerExpanded = (isOpen) => {
    if (filterButton instanceof HTMLButtonElement) {
      filterButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }
  };

  const setFilterModalDocumentState = (isOpen) => {
    document.documentElement.classList.toggle('menu-filters-open', isOpen);
    document.body.classList.toggle('menu-filters-open', isOpen);
  };

  const clearFilterModalCloseTimer = () => {
    if (!filterModalCloseTimerId) {
      return;
    }

    window.clearTimeout(filterModalCloseTimerId);
    filterModalCloseTimerId = 0;
  };

  const cancelFilterModalChromeFrame = () => {
    if (!filterModalChromeFrameId) {
      return;
    }

    window.cancelAnimationFrame(filterModalChromeFrameId);
    filterModalChromeFrameId = 0;
  };

  const syncFilterModalChrome = () => {
    cancelFilterModalChromeFrame();

    if (!(filterDialog instanceof HTMLElement) || !(filterModalBody instanceof HTMLElement)) {
      return;
    }

    const hasOverflow =
      filterModalBody.scrollHeight - filterModalBody.clientHeight >
      FILTER_MODAL_FOOTER_SHADOW_EPSILON;
    const remainingScroll =
      filterModalBody.scrollHeight -
      filterModalBody.scrollTop -
      filterModalBody.clientHeight;

    filterDialog.setAttribute(
      'data-footer-shadow',
      hasOverflow && remainingScroll > FILTER_MODAL_FOOTER_SHADOW_EPSILON
        ? 'visible'
        : 'hidden'
    );
  };

  const scheduleFilterModalChromeSync = () => {
    if (filterModalChromeFrameId) {
      return;
    }

    filterModalChromeFrameId = window.requestAnimationFrame(syncFilterModalChrome);
  };

  const getAllRuntimeItems = () => Array.from(state.itemsById.values());

  const countItems = (matcher) => {
    if (typeof matcher !== 'function') {
      return 0;
    }

    return getAllRuntimeItems().filter((item) => matcher(item)).length;
  };

  const formatPlateCount = (count, noun = 'plato') =>
    `${count} ${count === 1 ? noun : `${noun}s`}`;

  const updateFilterCountNodes = (key, text) => {
    document
      .querySelectorAll(`[data-filter-count="${key}"]`)
      .forEach((node) => {
        if (node instanceof HTMLElement) {
          node.textContent = text;
        }
      });
  };

  const getOrganolepticProfiles = () => {
    const experienceList = Array.isArray(traitsApi?.experienceList)
      ? traitsApi.experienceList
      : [];

    return experienceList
      .map((definition) => ({
        id: normalizeText(definition?.id),
        label: normalizeText(definition?.label),
        priority: Number(definition?.priority) || Number.MAX_SAFE_INTEGER,
      }))
      .filter((definition) => definition.id && definition.label)
      .filter((definition) => ORGANOLEPTIC_PROFILE_IDS.has(definition.id))
      .map((definition) => ({
        ...definition,
        count: countItems(
          (item) =>
            Array.isArray(item?.experience_tags) &&
            item.experience_tags.includes(definition.id)
        ),
      }))
      .filter((definition) => definition.count > 0)
      .sort(
        (left, right) =>
          right.count - left.count ||
          left.priority - right.priority ||
          left.label.localeCompare(right.label, 'es')
      );
  };

  const createOrganolepticFallbackIcon = () => {
    const sourceIcon = filterModal instanceof HTMLElement
      ? filterModal.querySelector(
        '[data-allergen-exclude="fish"] .menu-filter-modal__allergen-icon'
      )
      : null;

    if (sourceIcon instanceof SVGElement || sourceIcon instanceof HTMLElement) {
      return sourceIcon.cloneNode(true);
    }

    const fallbackIcon = document.createElement('span');
    fallbackIcon.className = 'menu-filter-modal__allergen-icon';
    fallbackIcon.setAttribute('aria-hidden', 'true');
    return fallbackIcon;
  };

  const createOrganolepticIcon = (profileId) => {
    const iconPath = organolepticIconPathsByProfileId.get(normalizeText(profileId));

    if (!iconPath) {
      return createOrganolepticFallbackIcon();
    }

    const icon = document.createElement('img');
    icon.className = 'menu-filter-modal__allergen-icon menu-filter-modal__allergen-icon--asset';
    icon.src = iconPath;
    icon.alt = '';
    icon.width = 18;
    icon.height = 18;
    icon.decoding = 'async';
    icon.loading = 'eager';
    icon.setAttribute('aria-hidden', 'true');
    icon.addEventListener(
      'error',
      () => {
        if (!icon.isConnected) {
          return;
        }

        icon.replaceWith(createOrganolepticFallbackIcon());
      },
      { once: true }
    );
    return icon;
  };

  const renderOrganolepticProfiles = () => {
    if (!(filterOrganolepticCloud instanceof HTMLElement)) {
      return [];
    }

    const profiles = getOrganolepticProfiles();
    const selectedProfiles = new Set(
      normalizeOrganolepticSelections(state.draftFilters.organolepticSelections)
    );
    const fragment = document.createDocumentFragment();

    profiles.forEach((profile) => {
      const chip = document.createElement('button');
      chip.className = 'menu-filter-modal__allergen-chip';
      chip.type = 'button';
      chip.dataset.organolepticProfile = profile.id;
      chip.setAttribute('aria-pressed', selectedProfiles.has(profile.id) ? 'true' : 'false');

      const label = document.createElement('span');
      label.className = 'menu-filter-modal__allergen-label';
      label.textContent = profile.label;

      chip.append(createOrganolepticIcon(profile.id), label);
      fragment.append(chip);
    });

    filterOrganolepticCloud.replaceChildren(fragment);
    return profiles;
  };

  const setPriceFieldValue = (field, value) => {
    if (field instanceof HTMLInputElement) {
      field.value = String(value);
      return;
    }

    field.textContent = `RD$ ${value}`;
  };

  const setPriceFieldBounds = (field, min, max) => {
    if (!(field instanceof HTMLInputElement)) {
      return;
    }

    field.dataset.min = String(min);
    field.dataset.max = String(max);
  };

  const clampPriceFieldValue = (value, min, max) => {
    if (!Number.isFinite(value)) {
      return min;
    }

    return Math.min(Math.max(value, min), max);
  };

  const syncDraftAllergenChipState = () => {
    if (!(filterModalBody instanceof HTMLElement)) {
      return;
    }

    const selectedAllergens = new Set(state.draftFilters.excludedAllergens);

    filterModalBody.querySelectorAll('[data-allergen-exclude]').forEach((chip) => {
      if (!(chip instanceof HTMLElement)) {
        return;
      }

      const allergenId = normalizeText(chip.getAttribute('data-allergen-exclude'));
      chip.setAttribute(
        'aria-pressed',
        selectedAllergens.has(allergenId) ? 'true' : 'false'
      );
    });
  };

  const getFilterDietaryButtons = () => {
    if (!(filterModal instanceof HTMLElement)) {
      return [];
    }

    return Array.from(
      filterModal.querySelectorAll('.menu-filter-modal__standout-card[data-dietary-filter]')
    ).filter((button) => button instanceof HTMLButtonElement);
  };

  const syncDraftDietaryButtonState = () => {
    const selectedDietaryFilters = new Set(
      normalizeDietarySelections(state.draftFilters.dietarySelections)
    );

    getFilterDietaryButtons().forEach((button) => {
      const dietaryFilter = normalizeDietaryFilter(button.dataset.dietaryFilter);
      const isSelected = dietaryFilter ? selectedDietaryFilters.has(dietaryFilter) : false;
      button.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });
  };

  const getFilterOrganolepticButtons = () => {
    if (!(filterOrganolepticCloud instanceof HTMLElement)) {
      return [];
    }

    return Array.from(
      filterOrganolepticCloud.querySelectorAll('[data-organoleptic-profile]')
    ).filter((button) => button instanceof HTMLButtonElement);
  };

  const syncDraftOrganolepticChipState = () => {
    const selectedProfiles = new Set(
      normalizeOrganolepticSelections(state.draftFilters.organolepticSelections)
    );

    getFilterOrganolepticButtons().forEach((button) => {
      const profileId = normalizeOrganolepticSelection(button.dataset.organolepticProfile);
      const isSelected = profileId ? selectedProfiles.has(profileId) : false;
      button.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });
  };

  const getFilterPizzaTabs = () => {
    if (!(filterPizzaTabsRoot instanceof HTMLElement)) {
      return [];
    }

    return Array.from(
      filterPizzaTabsRoot.querySelectorAll('.menu-filter-modal__pizza-tab[role="tab"]')
    ).filter((tab) => tab instanceof HTMLElement);
  };

  const syncDraftPizzaTabState = ({ focus = false } = {}) => {
    if (!(filterPizzaTabsRoot instanceof HTMLElement)) {
      return;
    }

    const tabs = getFilterPizzaTabs();

    if (!tabs.length) {
      return;
    }

    const activePizzaType = normalizePizzaType(state.draftFilters.pizzaType);
    const activeIndex = Math.max(
      0,
      tabs.findIndex((tab) => normalizePizzaType(tab.dataset.pizzaType) === activePizzaType)
    );

    filterPizzaTabsRoot.style.setProperty(
      '--menu-filter-pizza-active-index',
      String(activeIndex)
    );

    tabs.forEach((tab, tabIndex) => {
      const isActive = tabIndex === activeIndex;
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
      tab.classList.toggle('is-active', isActive);
    });

    if (focus) {
      tabs[activeIndex].focus();
    }
  };

  const updatePriceSliderVisuals = (filters = state.draftFilters) => {
    const minInput = document.getElementById('menu-filter-range-min');
    const maxInput = document.getElementById('menu-filter-range-max');
    const track = document.getElementById('menu-filter-slider-track');
    const pathActive = document.getElementById('menu-filter-price-path-active');
    const labelMin = document.getElementById('menu-filter-label-min');
    const labelMax = document.getElementById('menu-filter-label-max');

    if (!minInput || !maxInput || !track || !pathActive || !labelMin || !labelMax) return;

    if (state.globalPriceMax === 0) return;

    const sliderMin = state.globalPriceMin;
    const sliderMax = state.globalPriceMax;
    const sliderSpan = Math.max(sliderMax - sliderMin, 1);

    let minVal = parseInt(minInput.value, 10);
    let maxVal = parseInt(maxInput.value, 10);

    if (minVal > maxVal) {
      const activeThumb = document.activeElement;
      if (activeThumb === minInput) {
        minInput.value = maxVal;
        minVal = maxVal;
      } else {
        maxInput.value = minVal;
        maxVal = minVal;
      }
    }

    setPriceFieldValue(labelMin, minVal);
    setPriceFieldValue(labelMax, maxVal);
    setPriceFieldBounds(labelMin, sliderMin, maxVal);
    setPriceFieldBounds(labelMax, minVal, sliderMax);

    filters.priceMin = minVal === sliderMin ? null : minVal;
    filters.priceMax = maxVal === sliderMax ? null : maxVal;

    const leftPercent = ((minVal - sliderMin) / sliderSpan) * 100;
    const rightPercent = ((sliderMax - maxVal) / sliderSpan) * 100;

    track.style.left = `${leftPercent}%`;
    track.style.right = `${rightPercent}%`;
    pathActive.style.clipPath = `inset(0 ${rightPercent}% 0 ${leftPercent}%)`;
  };

  const syncPriceInputsFromFilters = (filters = state.draftFilters) => {
    const minInput = document.getElementById('menu-filter-range-min');
    const maxInput = document.getElementById('menu-filter-range-max');

    if (!minInput || !maxInput || state.globalPriceMax === 0) {
      return;
    }

    const nextPriceMin =
      filters?.priceMin != null ? filters.priceMin : state.globalPriceMin;
    const nextPriceMax =
      filters?.priceMax != null ? filters.priceMax : state.globalPriceMax;

    minInput.value = String(nextPriceMin);
    maxInput.value = String(nextPriceMax);
    updatePriceSliderVisuals(filters);
  };

  const syncDraftFiltersToModal = () => {
    syncDraftAllergenChipState();
    syncDraftPizzaTabState();
    syncDraftDietaryButtonState();
    syncDraftOrganolepticChipState();
    syncPriceInputsFromFilters(state.draftFilters);
  };

  const renderPriceDistribution = () => {
    const pathBg = document.getElementById('menu-filter-price-path-bg');
    const pathActive = document.getElementById('menu-filter-price-path-active');
    
    if (!pathBg || !pathActive) return;

    const prices = [];
    state.itemsById.forEach(item => {
      const p = Number(item?.price || 0);
      if (p > 0) prices.push(p);
    });

    if (prices.length === 0) return;

    state.globalPriceMin = Math.min(...prices);
    state.globalPriceMax = Math.max(...prices);

    const minInput = document.getElementById('menu-filter-range-min');
    const maxInput = document.getElementById('menu-filter-range-max');
    const labelMin = document.getElementById('menu-filter-label-min');
    const labelMax = document.getElementById('menu-filter-label-max');
    if (minInput && maxInput) {
      minInput.min = String(state.globalPriceMin);
      minInput.max = String(state.globalPriceMax);
      minInput.step = '1';
      maxInput.min = String(state.globalPriceMin);
      maxInput.max = String(state.globalPriceMax);
      maxInput.step = '1';
    }
    if (labelMin && labelMax) {
      setPriceFieldBounds(labelMin, state.globalPriceMin, state.globalPriceMax);
      setPriceFieldBounds(labelMax, state.globalPriceMin, state.globalPriceMax);
    }

    const BUCKETS = 50;
    const bucketSize = (state.globalPriceMax - state.globalPriceMin) / BUCKETS;
    const frequencies = new Array(BUCKETS).fill(0);

    prices.forEach(price => {
      let bucket = Math.floor((price - state.globalPriceMin) / bucketSize);
      if (bucket >= BUCKETS) bucket = BUCKETS - 1;
      frequencies[bucket]++;
    });

    const smoothed = [];
    for (let i = 0; i < BUCKETS; i++) {
        let sum = 0;
        let count = 0;
        for (let j = Math.max(0, i - 2); j <= Math.min(BUCKETS - 1, i + 2); j++) {
            sum += frequencies[j];
            count++;
        }
        smoothed.push(sum / count);
    }

    const maxFreq = Math.max(...smoothed, 1);
    
    let d = `M0,100 `;
    
    for (let i = 0; i < BUCKETS; i++) {
        const x = (i / (BUCKETS - 1)) * 100;
        const normalizedY = (smoothed[i] / maxFreq) * 100;
        const y = 100 - normalizedY;
        
        if (i === 0) {
            d += `L${x},${y} `;
        } else {
            const prevX = ((i - 1) / (BUCKETS - 1)) * 100;
            const prevY = 100 - ((smoothed[i-1] / maxFreq) * 100);
            const cpX = prevX + (x - prevX) / 2;
            d += `C${cpX},${prevY} ${cpX},${y} ${x},${y} `;
        }
    }
    
    d += `L100,100 Z`;

    pathBg.setAttribute('d', d);
    pathActive.setAttribute('d', d);

    syncPriceInputsFromFilters(state.draftFilters);
  };

  const initPriceRange = () => {
    const minInput = document.getElementById('menu-filter-range-min');
    const maxInput = document.getElementById('menu-filter-range-max');
    const labelMin = document.getElementById('menu-filter-label-min');
    const labelMax = document.getElementById('menu-filter-label-max');

    if (!minInput || !maxInput) return;

    const handleInput = () => {
      updatePriceSliderVisuals(state.draftFilters);
      renderFilterModalShell();
    };

    const sanitizePriceFieldInput = (event) => {
      const field = event.currentTarget;
      if (!(field instanceof HTMLInputElement)) {
        return;
      }

      field.value = field.value.replace(/[^\d]/g, '');
    };

    const commitPriceField = (field, rangeInput, pairedRangeInput, isMin) => {
      if (!(field instanceof HTMLInputElement)) {
        return;
      }

      const rawValue = field.value.trim();
      if (!rawValue) {
        setPriceFieldValue(field, parseInt(rangeInput.value, 10));
        return;
      }

      const boundMin = parseInt(field.dataset.min || rangeInput.min || '0', 10);
      const boundMax = parseInt(field.dataset.max || rangeInput.max || '0', 10);
      const parsedValue = parseInt(rawValue, 10);

      if (Number.isNaN(parsedValue)) {
        setPriceFieldValue(field, parseInt(rangeInput.value, 10));
        return;
      }

      let nextValue = clampPriceFieldValue(parsedValue, boundMin, boundMax);
      const pairedValue = parseInt(pairedRangeInput.value, 10);

      if (isMin && nextValue > pairedValue) {
        nextValue = pairedValue;
      }
      if (!isMin && nextValue < pairedValue) {
        nextValue = pairedValue;
      }

      rangeInput.value = String(nextValue);
      updatePriceSliderVisuals(state.draftFilters);
      renderFilterModalShell();
    };

    const bindPriceField = (field, rangeInput, pairedRangeInput, isMin) => {
      if (!(field instanceof HTMLInputElement)) {
        return;
      }

      field.addEventListener('input', sanitizePriceFieldInput);
      field.addEventListener('change', () => {
        commitPriceField(field, rangeInput, pairedRangeInput, isMin);
      });
      field.addEventListener('blur', () => {
        commitPriceField(field, rangeInput, pairedRangeInput, isMin);
      });
      field.addEventListener('focus', () => {
        field.select();
      });
      field.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          commitPriceField(field, rangeInput, pairedRangeInput, isMin);
          field.blur();
        }
      });
    };

    minInput.addEventListener('input', handleInput);
    maxInput.addEventListener('input', handleInput);
    bindPriceField(labelMin, minInput, maxInput, true);
    bindPriceField(labelMax, maxInput, minInput, false);

    renderPriceDistribution();
  };

  const renderFilterModalShell = () => {
    const totalItems = buildRenderState(state.searchQuery, state.draftFilters).totalMatches;
    const categoriesById = new Map(state.categories.map((category) => [category.id, category]));
    const pizzaCategory = categoriesById.get(PIZZA_GROUP_ID);

    updateFilterCountNodes(
      'vegetarian',
      formatPlateCount(countItems((item) => item?.dietary?.vegetarian === true))
    );
    updateFilterCountNodes(
      'pork',
      formatPlateCount(countItems((item) => item?.content_flags?.pork === true))
    );
    updateFilterCountNodes(
      'spicy',
      formatPlateCount(
        countItems((item) => Array.isArray(item?.experience_tags) && item.experience_tags.includes('spicy'))
      )
    );
    updateFilterCountNodes(
      'truffled',
      formatPlateCount(
        countItems((item) => Array.isArray(item?.experience_tags) && item.experience_tags.includes('truffled'))
      )
    );
    updateFilterCountNodes(
      'sweet_savory',
      formatPlateCount(
        countItems((item) => Array.isArray(item?.experience_tags) && item.experience_tags.includes('sweet_savory'))
      )
    );
    updateFilterCountNodes(
      'fresh',
      formatPlateCount(
        countItems((item) => Array.isArray(item?.experience_tags) && item.experience_tags.includes('fresh'))
      )
    );
    updateFilterCountNodes(
      'pizza_total',
      formatPlateCount(Array.isArray(pizzaCategory?.items) ? pizzaCategory.items.length : 0, 'pizza')
    );
    updateFilterCountNodes(
      'pizza_clasica',
      formatPlateCount(countItems((item) => item?.category === 'pizza'), 'pizza')
    );
    updateFilterCountNodes(
      'pizza_autor',
      formatPlateCount(countItems((item) => item?.category === 'pizza_autor'), 'pizza')
    );
    updateFilterCountNodes(
      'price_low',
      formatPlateCount(countItems((item) => Number(item?.price || 0) <= 500))
    );
    updateFilterCountNodes(
      'price_mid',
      formatPlateCount(
        countItems((item) => Number(item?.price || 0) >= 550 && Number(item?.price || 0) <= 750)
      )
    );
    updateFilterCountNodes(
      'price_high',
      formatPlateCount(countItems((item) => Number(item?.price || 0) >= 800))
    );
    updateFilterCountNodes(
      'entradas',
      formatPlateCount(Array.isArray(categoriesById.get('entradas')?.items) ? categoriesById.get('entradas').items.length : 0)
    );
    updateFilterCountNodes(
      'pizzas',
      formatPlateCount(Array.isArray(pizzaCategory?.items) ? pizzaCategory.items.length : 0)
    );
    updateFilterCountNodes(
      'postres',
      formatPlateCount(Array.isArray(categoriesById.get('postres')?.items) ? categoriesById.get('postres').items.length : 0)
    );
    updateFilterCountNodes(
      'productos',
      formatPlateCount(Array.isArray(categoriesById.get('productos')?.items) ? categoriesById.get('productos').items.length : 0)
    );

    renderOrganolepticProfiles();

    document.querySelectorAll('[data-filter-cta-count]').forEach((node) => {
      if (node instanceof HTMLElement) {
        node.textContent = String(totalItems);
      }
    });

    if (filterClearButton instanceof HTMLButtonElement) {
      filterClearButton.disabled = !hasActiveFilters(state.draftFilters);
    }
  };

  const bindFilterPizzaTabs = () => {
    if (!(filterPizzaTabsRoot instanceof HTMLElement)) {
      return;
    }

    if (filterPizzaTabsRoot.dataset.bound === 'true') {
      return;
    }

    const tabs = getFilterPizzaTabs();

    if (!tabs.length) {
      return;
    }

    filterPizzaTabsRoot.style.setProperty(
      '--menu-filter-pizza-tab-count',
      String(tabs.length)
    );

    const activateTab = (index, { focus = false } = {}) => {
      const nextIndex = Math.max(0, Math.min(index, tabs.length - 1));
      state.draftFilters.pizzaType = normalizePizzaType(tabs[nextIndex].dataset.pizzaType);
      syncDraftPizzaTabState({ focus });
      renderFilterModalShell();
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        activateTab(index);
      });

      tab.addEventListener('keydown', (event) => {
        const currentIndex = tabs.findIndex(
          (entry) => entry.getAttribute('aria-selected') === 'true'
        );
        const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;

        if (event.key === 'ArrowRight') {
          event.preventDefault();
          activateTab((safeCurrentIndex + 1) % tabs.length, { focus: true });
          return;
        }

        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          activateTab((safeCurrentIndex - 1 + tabs.length) % tabs.length, {
            focus: true,
          });
          return;
        }

        if (event.key === 'Home') {
          event.preventDefault();
          activateTab(0, { focus: true });
          return;
        }

        if (event.key === 'End') {
          event.preventDefault();
          activateTab(tabs.length - 1, { focus: true });
          return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activateTab(index);
        }
      });
    });

    syncDraftPizzaTabState();
    filterPizzaTabsRoot.dataset.bound = 'true';
  };

  const getFilterModalFocusableElements = () => {
    if (!(filterDialog instanceof HTMLElement)) {
      return [];
    }

    return Array.from(
      filterDialog.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((node) => node instanceof HTMLElement && !node.hidden);
  };

  const finishFilterModalClose = ({ restoreFocus = true } = {}) => {
    clearFilterModalCloseTimer();
    cancelFilterModalChromeFrame();

    if (!(filterModal instanceof HTMLElement)) {
      return;
    }

    filterModal.hidden = true;
    filterModal.removeAttribute('data-state');
    setFilterModalDocumentState(false);
    setFilterTriggerExpanded(false);

    if (filterDialog instanceof HTMLElement) {
      filterDialog.setAttribute('data-footer-shadow', 'hidden');
    }

    if (restoreFocus && filterModalRestoreFocusNode instanceof HTMLElement) {
      filterModalRestoreFocusNode.focus();
    }

    filterModalRestoreFocusNode = null;
  };

  const closeFilterModal = ({ restoreFocus = true, immediate = false } = {}) => {
    if (!(filterModal instanceof HTMLElement)) {
      return;
    }

    clearFilterModalCloseTimer();
    state.filterModalOpen = false;
    setFilterTriggerExpanded(false);
    emitBridgeState();

    if (filterModal.hidden || immediate || reducedMotionQuery.matches) {
      finishFilterModalClose({ restoreFocus });
      return;
    }

    filterModal.setAttribute('data-state', 'closing');
    filterModalCloseTimerId = window.setTimeout(() => {
      finishFilterModalClose({ restoreFocus });
    }, FILTER_MODAL_EXIT_MS);
  };

  const loadDraftFiltersFromApplied = () => {
    replaceFilters(state.draftFilters, state.appliedFilters);
    syncDraftFiltersToModal();
  };

  const openFilterModal = () => {
    if (!(filterModal instanceof HTMLElement) || !(filterDialog instanceof HTMLElement)) {
      return;
    }

    clearFilterModalCloseTimer();
    loadDraftFiltersFromApplied();
    renderFilterModalShell();

    if (!filterModal.hidden && state.filterModalOpen) {
      return;
    }

    filterModalRestoreFocusNode =
      document.activeElement instanceof HTMLElement ? document.activeElement : filterButton;
    state.filterModalOpen = true;
    filterModal.hidden = false;
    setFilterModalDocumentState(true);
    setFilterTriggerExpanded(true);
    emitBridgeState();
    filterModal.setAttribute('data-state', 'opening');
    filterDialog.setAttribute('data-footer-shadow', 'hidden');

    window.requestAnimationFrame(() => {
      if (!(filterModal instanceof HTMLElement)) {
        return;
      }

      filterModal.setAttribute('data-state', 'open');
      scheduleFilterModalChromeSync();
      window.FigataScrollIndicators?.refresh?.();
    });

    window.setTimeout(() => {
      const focusTarget = filterCloseButton instanceof HTMLButtonElement
        ? filterCloseButton
        : getFilterModalFocusableElements()[0] || filterDialog;

      scheduleFilterModalChromeSync();
      window.FigataScrollIndicators?.refresh?.();

      if (focusTarget instanceof HTMLElement) {
        focusTarget.focus();
      }
    }, reducedMotionQuery.matches ? 0 : 70);
  };

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
    isFilterModalOpen: Boolean(state.filterModalOpen),
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

  const MENU_ROUTE_PREFIX = '/menu/';

  const toMenuListUrl = () => MENU_ROUTE_PREFIX;

  const toMenuDetailUrl = (itemId) => {
    const normalizedId = normalizeText(itemId);
    return normalizedId
      ? `${MENU_ROUTE_PREFIX}${encodeURIComponent(normalizedId)}`
      : toMenuListUrl();
  };

  const loadOrganolepticIconPaths = () => {
    if (organolepticIconsPromise) {
      return organolepticIconsPromise;
    }

    if (!ingredientsApi?.loadIngredientsStore) {
      organolepticIconsPromise = Promise.resolve(organolepticIconPathsByProfileId);
      return organolepticIconsPromise;
    }

    organolepticIconsPromise = ingredientsApi
      .loadIngredientsStore()
      .then((store) => {
        const iconCatalog =
          store?.icons && typeof store.icons === 'object' ? store.icons : {};

        organolepticIconPathsByProfileId = new Map(
          Object.entries(ORGANOLEPTIC_PROFILE_ICON_IDS)
            .map(([profileId, iconId]) => [
              profileId,
              toAbsoluteAssetPath(iconCatalog?.[iconId]?.icon),
            ])
            .filter(([, iconPath]) => Boolean(iconPath))
        );

        return organolepticIconPathsByProfileId;
      })
      .catch((error) => {
        console.warn('[menu-page] No se pudieron cargar los iconos organolépticos.', error);
        organolepticIconPathsByProfileId = new Map();
        return organolepticIconPathsByProfileId;
      });

    return organolepticIconsPromise;
  };

  loadOrganolepticIconPaths().then(() => {
    if (state.itemsById.size > 0) {
      renderOrganolepticProfiles();
    }
  });

  const getRouteItemIdFromPathname = (pathname = window.location.pathname) => {
    const normalizedPath = normalizeText(pathname);

    if (!normalizedPath.startsWith(MENU_ROUTE_PREFIX)) {
      return '';
    }

    const segments = normalizedPath
      .slice(MENU_ROUTE_PREFIX.length)
      .split('/')
      .map((segment) => normalizeText(segment))
      .filter(Boolean);

    if (segments.length !== 1) {
      return '';
    }

    try {
      return normalizeText(decodeURIComponent(segments[0]));
    } catch {
      return normalizeText(segments[0]);
    }
  };

  const getLegacyRouteItemId = () => {
    const params = new URL(window.location.href).searchParams;
    return normalizeText(params.get('item'));
  };

  const normalizeRouteFromLegacyQuery = () => {
    const legacyItemId = getLegacyRouteItemId();

    if (!legacyItemId || getRouteItemIdFromPathname()) {
      return;
    }

    window.history.replaceState(
      window.history.state || {},
      '',
      toMenuDetailUrl(legacyItemId)
    );
  };

  const getRouteItemId = () => getRouteItemIdFromPathname() || getLegacyRouteItemId();

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

  const itemMatchesFilters = (item, filters = state.appliedFilters) => {
    const pizzaType = normalizePizzaType(filters?.pizzaType);

    if (pizzaType === 'clasica' && normalizeText(item?.category) !== 'pizza') {
      return false;
    }

    if (pizzaType === 'autor' && normalizeText(item?.category) !== 'pizza_autor') {
      return false;
    }

    const dietarySelections = normalizeDietarySelections(filters?.dietarySelections);

    if (dietarySelections.length > 0) {
      const itemDietary = item?.dietary;
      const matchesDietary = dietarySelections.some(
        (selection) => itemDietary && itemDietary[selection] === true
      );

      if (!matchesDietary) {
        return false;
      }
    }

    const organolepticSelections = normalizeOrganolepticSelections(filters?.organolepticSelections);

    if (organolepticSelections.length > 0) {
      const itemProfiles = Array.isArray(item?.experience_tags) ? item.experience_tags : [];
      const matchesOrganoleptic = organolepticSelections.some((selection) =>
        itemProfiles.includes(selection)
      );

      if (!matchesOrganoleptic) {
        return false;
      }
    }

    const excludedAllergens = Array.isArray(filters?.excludedAllergens)
      ? filters.excludedAllergens
      : [];

    if (excludedAllergens.length > 0) {
      const itemAllergens = Array.isArray(item?.allergens) ? item.allergens.map(normalizeText) : [];
      if (excludedAllergens.some((allergenId) => itemAllergens.includes(allergenId))) {
        return false;
      }
    }

    if (filters?.priceMin != null || filters?.priceMax != null) {
      const price = Number(item?.price || 0);
      if (price > 0) {
        if (filters?.priceMin != null && price < filters.priceMin) {
          return false;
        }
        if (filters?.priceMax != null && price > filters.priceMax) {
          return false;
        }
      }
    }

    return true;
  };

  const itemMatchesSearch = (
    item,
    category,
    query = state.searchQuery,
    filters = state.appliedFilters
  ) => {
    if (!itemMatchesFilters(item, filters)) {
      return false;
    }

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

  const resolveIngredientEntries = async (ingredientIds = []) => {
    if (!Array.isArray(ingredientIds) || !ingredientIds.length) {
      return [];
    }

    if (!ingredientsApi?.resolveIngredients) {
      return ingredientIds
        .map((ingredientId) => ({
          label: formatFallbackLabel(ingredientId),
          icon: '',
        }))
        .filter((ingredient) => ingredient.label);
    }

    try {
      const resolvedIngredients = await ingredientsApi.resolveIngredients(ingredientIds);

      if (!Array.isArray(resolvedIngredients)) {
        return [];
      }

      return resolvedIngredients
        .map((ingredient) => ({
          label: normalizeText(ingredient?.label),
          icon: toAbsoluteAssetPath(ingredient?.icon),
        }))
        .filter((ingredient) => ingredient.label);
    } catch (error) {
      console.warn('[menu-page] No se pudieron resolver ingredientes con iconos.', error);
      return ingredientIds
        .map((ingredientId) => ({
          label: formatFallbackLabel(ingredientId),
          icon: '',
        }))
        .filter((ingredient) => ingredient.label);
    }
  };

  const resolveAllergenEntries = async (allergenIds = []) => {
    if (!Array.isArray(allergenIds) || !allergenIds.length) {
      return [];
    }

    const fallbackEntries = allergenIds
      .map((allergenId) => {
        const normalizedId = normalizeText(allergenId);
        return {
          label: formatFallbackLabel(normalizedId),
          icon: toAbsoluteAssetPath(DETAIL_ALLERGEN_ICONS[normalizedId] || ''),
        };
      })
      .filter((allergen) => allergen.label);

    if (!ingredientsApi?.loadIngredientsStore) {
      return fallbackEntries;
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
          return {
            label:
              normalizeText(allergenMap[normalizedId]?.label) ||
              formatFallbackLabel(normalizedId),
            icon: toAbsoluteAssetPath(DETAIL_ALLERGEN_ICONS[normalizedId] || ''),
          };
        })
        .filter((allergen) => allergen.label);
    } catch (error) {
      console.warn('[menu-page] No se pudieron resolver alérgenos con iconos.', error);
      return fallbackEntries;
    }
  };

  const renderDetailIconList = (container, entries = []) => {
    if (!(container instanceof HTMLElement)) {
      return;
    }

    container.replaceChildren();

    entries.forEach((entry) => {
      const label = normalizeText(entry?.label);

      if (!label) {
        return;
      }

      const item = document.createElement('li');
      item.className = 'menu-page-detail__ingredient-item';

      const iconPath = toAbsoluteAssetPath(entry?.icon);
      if (iconPath) {
        const icon = document.createElement('img');
        icon.className = 'menu-page-detail__ingredient-icon';
        icon.src = iconPath;
        icon.alt = '';
        icon.width = 22;
        icon.height = 22;
        icon.loading = 'lazy';
        icon.decoding = 'async';
        icon.setAttribute('aria-hidden', 'true');
        item.appendChild(icon);
      } else {
        const iconFallback = document.createElement('span');
        iconFallback.className = 'menu-page-detail__ingredient-icon-fallback';
        iconFallback.setAttribute('aria-hidden', 'true');
        item.appendChild(iconFallback);
      }

      const copy = document.createElement('span');
      copy.className = 'menu-page-detail__ingredient-label';
      copy.textContent = label;
      item.appendChild(copy);

      container.appendChild(item);
    });
  };

  const renderIngredientList = (container, ingredients = []) => {
    renderDetailIconList(container, ingredients);
  };

  const renderAllergenList = (container, allergens = []) => {
    renderDetailIconList(container, allergens);
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
      price: formatDetailPrice(item),
      reviews: normalizeText(item?.reviews),
      available: item?.available !== false,
      soldOutReason: normalizeText(item?.soldOutReason),
      badges,
      ingredients: Array.isArray(item?.ingredients) ? item.ingredients : [],
      allergens: Array.isArray(item?.allergens) ? item.allergens : [],
      image: media.detail || media.card,
      imageAlt: media.alt,
    };
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
    syncSearchHelperState();
  };

  const clearSearchHelperTimers = () => {
    if (searchHelperTimerId) {
      window.clearTimeout(searchHelperTimerId);
      searchHelperTimerId = 0;
    }

    if (searchHelperAnimationTimerId) {
      window.clearTimeout(searchHelperAnimationTimerId);
      searchHelperAnimationTimerId = 0;
    }

    if (searchHelperFrameId) {
      window.cancelAnimationFrame(searchHelperFrameId);
      searchHelperFrameId = 0;
    }
  };

  const createSearchHelperChar = (character) => {
    const char = document.createElement('span');
    char.className = 'menu-page-search__helper-char';
    char.textContent = character === ' ' ? '\u00A0' : character;
    return char;
  };

  const setSearchHelperCharState = (char, { opacity, blurPx, translateYPx }) => {
    char.style.opacity = String(opacity);
    char.style.filter = `blur(${blurPx}px)`;
    char.style.transform = `translateY(${translateYPx}px)`;
  };

  const createSearchHelperLayer = (word, className, initialState = null) => {
    const layer = document.createElement('span');
    layer.className = className;

    Array.from(word).forEach((character) => {
      const char = createSearchHelperChar(character);

      if (initialState) {
        setSearchHelperCharState(char, initialState);
      }

      layer.appendChild(char);
    });

    return layer;
  };

  const renderSearchHelperWord = (word = SEARCH_HELPER_WORDS[0]) => {
    if (!(searchHelperWord instanceof HTMLElement)) {
      return;
    }

    searchHelperWord.replaceChildren(
      createSearchHelperLayer(word, 'menu-page-search__helper-layer')
    );
  };

  const syncSearchHelperWidth = () => {
    if (!(searchHelperWord instanceof HTMLElement) || !SEARCH_HELPER_WORDS.length) {
      return;
    }

    const measure = document.createElement('span');
    measure.className = 'menu-page-search__helper-layer';
    measure.style.position = 'absolute';
    measure.style.visibility = 'hidden';
    measure.style.pointerEvents = 'none';
    searchHelperWord.appendChild(measure);

    let maxWidth = 0;

    SEARCH_HELPER_WORDS.forEach((word) => {
      measure.textContent = word;
      maxWidth = Math.max(maxWidth, Math.ceil(measure.getBoundingClientRect().width));
    });

    measure.remove();

    if (maxWidth > 0) {
      searchHelperWord.style.width = `${maxWidth}px`;
    }
  };

  const shouldShowSearchHelper = () =>
    searchRoot instanceof HTMLElement &&
    searchInput instanceof HTMLInputElement &&
    !(document.activeElement === searchInput) &&
    !searchInput.value;

  const canAnimateSearchHelper = () =>
    shouldShowSearchHelper() &&
    searchHelperWord instanceof HTMLElement &&
    SEARCH_HELPER_WORDS.length > 1 &&
    !reducedMotionQuery.matches;

  const animateSearchHelperChars = (
    chars,
    {
      durationMs,
      staggerMs,
      delayMs = 0,
      easing,
      targetOpacity,
      targetBlurPx,
      targetTranslateYPx,
    }
  ) => {
    chars.forEach((char, index) => {
      char.style.transitionProperty = 'transform, opacity, filter';
      char.style.transitionDuration = `${durationMs}ms`;
      char.style.transitionTimingFunction = easing;
      char.style.transitionDelay = `${delayMs + index * staggerMs}ms`;
      setSearchHelperCharState(char, {
        opacity: targetOpacity,
        blurPx: targetBlurPx,
        translateYPx: targetTranslateYPx,
      });
    });
  };

  const resetSearchHelperCharTransitions = (chars) => {
    chars.forEach((char) => {
      char.style.transitionProperty = 'none';
      char.style.transitionDuration = '0ms';
      char.style.transitionDelay = '0ms';
      char.style.transitionTimingFunction = 'linear';
    });
  };

  const getRenderedSearchHelperWord = () => {
    if (!(searchHelperWord instanceof HTMLElement) || searchHelperWord.childElementCount !== 1) {
      return '';
    }

    return normalizeText(searchHelperWord.textContent);
  };

  const scheduleSearchHelperCycle = (delayMs = SEARCH_HELPER_IDLE_DELAY_MS) => {
    if (!canAnimateSearchHelper() || searchHelperAnimating) {
      return;
    }

    if (searchHelperTimerId) {
      window.clearTimeout(searchHelperTimerId);
    }

    searchHelperTimerId = window.setTimeout(() => {
      searchHelperTimerId = 0;

      if (!canAnimateSearchHelper() || !(searchHelperWord instanceof HTMLElement)) {
        return;
      }

      const currentWord = SEARCH_HELPER_WORDS[searchHelperWordIndex] || SEARCH_HELPER_WORDS[0];
      const nextIndex = (searchHelperWordIndex + 1) % SEARCH_HELPER_WORDS.length;
      const nextWord = SEARCH_HELPER_WORDS[nextIndex];
      const outgoingLayer = createSearchHelperLayer(
        currentWord,
        'menu-page-search__helper-layer',
        {
          opacity: 1,
          blurPx: 0,
          translateYPx: 0,
        }
      );
      const incomingLayer = createSearchHelperLayer(
        nextWord,
        'menu-page-search__helper-layer',
        {
          opacity: 0,
          blurPx: SEARCH_HELPER_BLUR_PX,
          translateYPx: SEARCH_HELPER_IN_Y_PX,
        }
      );
      const outgoingChars = Array.from(outgoingLayer.children);
      const incomingChars = Array.from(incomingLayer.children);

      searchHelperWordIndex = nextIndex;
      searchHelperAnimating = true;
      resetSearchHelperCharTransitions(outgoingChars);
      resetSearchHelperCharTransitions(incomingChars);
      searchHelperWord.replaceChildren(outgoingLayer, incomingLayer);
      void searchHelperWord.offsetWidth;

      searchHelperFrameId = window.requestAnimationFrame(() => {
        searchHelperFrameId = 0;

        if (
          !(searchHelperWord instanceof HTMLElement) ||
          !searchHelperWord.contains(outgoingLayer) ||
          !searchHelperWord.contains(incomingLayer)
        ) {
          return;
        }

        animateSearchHelperChars(outgoingChars, {
          durationMs: SEARCH_HELPER_OUT_DURATION_MS,
          staggerMs: SEARCH_HELPER_OUT_STAGGER_MS,
          easing: SEARCH_HELPER_OUT_EASE,
          targetOpacity: 0,
          targetBlurPx: SEARCH_HELPER_BLUR_PX,
          targetTranslateYPx: SEARCH_HELPER_OUT_Y_PX,
        });

        animateSearchHelperChars(incomingChars, {
          durationMs: SEARCH_HELPER_IN_DURATION_MS,
          staggerMs: SEARCH_HELPER_IN_STAGGER_MS,
          delayMs: SEARCH_HELPER_IN_DELAY_MS,
          easing: SEARCH_HELPER_IN_EASE,
          targetOpacity: 1,
          targetBlurPx: 0,
          targetTranslateYPx: 0,
        });
      });

      const totalOutMs =
        SEARCH_HELPER_OUT_DURATION_MS +
        Math.max(0, outgoingChars.length - 1) * SEARCH_HELPER_OUT_STAGGER_MS;
      const totalInMs =
        SEARCH_HELPER_IN_DELAY_MS +
        SEARCH_HELPER_IN_DURATION_MS +
        Math.max(0, incomingChars.length - 1) * SEARCH_HELPER_IN_STAGGER_MS;

      searchHelperAnimationTimerId = window.setTimeout(() => {
        searchHelperAnimationTimerId = 0;
        searchHelperAnimating = false;
        renderSearchHelperWord(nextWord);
        scheduleSearchHelperCycle();
      }, Math.max(totalOutMs, totalInMs) + 40);
    }, delayMs);
  };

  function syncSearchHelperState() {
    if (!(searchRoot instanceof HTMLElement) || !(searchHelper instanceof HTMLElement)) {
      return;
    }

    const visible = shouldShowSearchHelper();
    searchRoot.dataset.helperVisible = visible ? 'true' : 'false';

    if (!visible) {
      clearSearchHelperTimers();
      searchHelperAnimating = false;
      return;
    }

    const currentWord = SEARCH_HELPER_WORDS[searchHelperWordIndex] || SEARCH_HELPER_WORDS[0];
    if (!searchHelperAnimating && getRenderedSearchHelperWord() !== currentWord) {
      renderSearchHelperWord(currentWord);
    }

    if (reducedMotionQuery.matches) {
      clearSearchHelperTimers();
      searchHelperAnimating = false;
      return;
    }

    if (!searchHelperHasStarted) {
      searchHelperHasStarted = true;
      scheduleSearchHelperCycle(SEARCH_HELPER_INITIAL_DELAY_MS);
      return;
    }

    if (!searchHelperAnimating && !searchHelperTimerId) {
      scheduleSearchHelperCycle(SEARCH_HELPER_RESTART_DELAY_MS);
    }
  }

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

  const getVisibleItemsForCategory = (
    category,
    query = state.searchQuery,
    filters = state.appliedFilters
  ) => {
    const items = Array.isArray(category?.items) ? category.items : [];

    if (!query && !hasActiveFilters(filters)) {
      return items;
    }

    return items.filter((item) => itemMatchesSearch(item, category, query, filters));
  };

  const buildRenderState = (query = state.searchQuery, filters = state.appliedFilters) => {
    const normalizedQuery = normalizeText(query);
    const isSearching = Boolean(normalizedQuery);
    const isFilteredBrowse = hasActiveFilters(filters);
    const categoryEntries = state.categories.map((category) => ({
      category,
      visibleItems: getVisibleItemsForCategory(category, normalizedQuery, filters),
    }));
    const totalMatches = categoryEntries.reduce(
      (count, entry) => count + entry.visibleItems.length,
      0
    );
    const renderableEntries =
      isSearching || isFilteredBrowse
        ? categoryEntries.filter((entry) => entry.visibleItems.length > 0)
        : categoryEntries;
    const visibleItemsOrdered = [];
    const visibleItemIds = [];
    const renderableCategoryIds = [];

    renderableEntries.forEach(({ category, visibleItems: entryVisibleItems }) => {
      renderableCategoryIds.push(normalizeText(category?.id));
      entryVisibleItems.forEach((item) => {
        visibleItemsOrdered.push(item);
        visibleItemIds.push(normalizeText(item?.id));
      });
    });

    return {
      query: normalizedQuery,
      isSearching,
      isFilteredBrowse,
      categoryEntries,
      renderableEntries,
      totalMatches,
      isSearchEmpty: totalMatches === 0 && (isSearching || isFilteredBrowse),
      visibleItems: visibleItemsOrdered,
      visibleItemIds,
      renderSignature: [
        isSearching ? 'search' : isFilteredBrowse ? 'filtered' : 'browse',
        totalMatches > 0 ? 'results' : 'empty',
        renderableCategoryIds.join('|'),
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
    if (menuPageBody instanceof HTMLElement) {
      menuPageBody.setAttribute('data-menu-page-view', 'list');
    }

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
    if (menuPageBody instanceof HTMLElement) {
      menuPageBody.setAttribute('data-menu-page-view', 'detail');
    }

    if (state.filterModalOpen) {
      closeFilterModal({ restoreFocus: false, immediate: true });
    }

    listView.hidden = true;
    detailView.hidden = false;
    emitBridgeState();
  };

  const renderDetail = async (item) => {
    if (
      !(detailMeta instanceof HTMLElement) ||
      !(detailPanel instanceof HTMLElement) ||
      !(detailMedia instanceof HTMLElement) ||
      !(detailImage instanceof HTMLImageElement) ||
      !(detailReviews instanceof HTMLElement) ||
      !(detailTitle instanceof HTMLElement) ||
      !(detailDescription instanceof HTMLElement) ||
      !(detailPrice instanceof HTMLElement) ||
      !(detailSpecGrid instanceof HTMLElement) ||
      !(detailSpecsDivider instanceof HTMLElement) ||
      !(detailTagsDivider instanceof HTMLElement) ||
      !(detailTagsSection instanceof HTMLElement) ||
      !(detailTags instanceof HTMLElement) ||
      !(detailIngredientsSection instanceof HTMLElement) ||
      !(detailIngredients instanceof HTMLElement) ||
      !(detailAllergensSection instanceof HTMLElement) ||
      !(detailAllergens instanceof HTMLElement) ||
      !(detailSoldOutReason instanceof HTMLElement)
    ) {
      return;
    }

    const detail = toDetailViewModel(item);

    detailReviews.textContent = detail.reviews;
    detailReviews.hidden = !detail.reviews;
    detailMeta.hidden = !detail.reviews;

    detailTitle.textContent = detail.title;
    detailDescription.textContent = detail.description;
    detailDescription.hidden = !detail.description;
    detailPrice.textContent = detail.price;
    detailSoldOutReason.textContent = detail.available
      ? ''
      : detail.soldOutReason || 'Temporalmente no disponible.';
    detailSoldOutReason.hidden = detail.available;
    detailPanel.setAttribute(
      'data-availability',
      detail.available ? 'available' : 'unavailable'
    );

    if (detail.image) {
      detailImage.src = detail.image;
      detailImage.alt = detail.imageAlt || detail.title;
      detailImage.hidden = false;
      detailMedia.setAttribute('data-image-state', 'ready');
    } else {
      detailImage.hidden = true;
      detailImage.removeAttribute('src');
      detailImage.alt = '';
      detailMedia.setAttribute('data-image-state', 'empty');
    }

    const ingredientEntries = await resolveIngredientEntries(detail.ingredients);
    renderIngredientList(detailIngredients, ingredientEntries);
    const hasIngredients = ingredientEntries.length > 0;
    detailIngredientsSection.hidden = !hasIngredients;

    const allergenEntries = await resolveAllergenEntries(detail.allergens);
    renderAllergenList(detailAllergens, allergenEntries);
    const hasAllergens = allergenEntries.length > 0;
    detailAllergensSection.hidden = !hasAllergens;

    const hasSpecs = hasIngredients || hasAllergens;
    detailSpecGrid.hidden = !hasSpecs;
    detailSpecGrid.setAttribute(
      'data-columns',
      hasIngredients && hasAllergens ? '2' : '1'
    );
    detailSpecsDivider.hidden = !hasSpecs;

    renderTagBadges(detailTags, detail.badges);
    const hasTags = detail.badges.length > 0;
    detailTagsSection.hidden = !hasTags;
    detailTagsDivider.hidden = !hasTags;

    setDetailStatus('', { hide: true });
    showDetailView();
    updatePageTitle(detail.title);
  };

  const renderRouteFromLocation = async () => {
    normalizeRouteFromLegacyQuery();
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
    initPriceRange();
    renderFilterModalShell();
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

  bindFilterPizzaTabs();

  const applySearchQuery = (
    value,
    {
      force = false,
      filters = state.appliedFilters,
      previousFilters = state.appliedFilters,
    } = {}
  ) => {
    const nextQuery = normalizeText(value);

    syncSearchControls();

    if (nextQuery === state.searchQuery && !force) {
      return;
    }

    const previousRenderState = state.renderedSearchSignature
      ? buildRenderState(state.renderedSearchQuery || state.searchQuery, previousFilters)
      : buildRenderState(state.searchQuery, previousFilters);
    const previousRenderSignature =
      state.renderedSearchSignature || previousRenderState.renderSignature;
    const nextRenderState = buildRenderState(nextQuery, filters);
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

    searchInput.addEventListener('focus', syncSearchControls);
    searchInput.addEventListener('blur', syncSearchControls);
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

  if (filterButton instanceof HTMLButtonElement) {
    filterButton.addEventListener('click', (event) => {
      event.preventDefault();

      if (state.filterModalOpen) {
        closeFilterModal();
        return;
      }

      openFilterModal();
    });
  }

  if (filterClearButton instanceof HTMLButtonElement) {
    filterClearButton.addEventListener('click', (event) => {
      event.preventDefault();

      resetFilters(state.draftFilters);
      syncDraftFiltersToModal();
      renderFilterModalShell();
    });
  }

  if (filterModal instanceof HTMLElement) {
    filterModal.addEventListener('click', (event) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const allergenChip = target.closest('[data-allergen-exclude]');
      if (allergenChip) {
        event.preventDefault();
        const isPressed = allergenChip.getAttribute('aria-pressed') === 'true';
        allergenChip.setAttribute('aria-pressed', !isPressed ? 'true' : 'false');

        const allergen = normalizeText(allergenChip.getAttribute('data-allergen-exclude'));
        if (!isPressed) {
          if (!state.draftFilters.excludedAllergens.includes(allergen)) {
            state.draftFilters.excludedAllergens.push(allergen);
          }
        } else {
          state.draftFilters.excludedAllergens = state.draftFilters.excludedAllergens.filter(
            (activeAllergen) => activeAllergen !== allergen
          );
        }

        renderFilterModalShell();
        return;
      }

      const dietaryButton = target.closest('[data-dietary-filter]');
      if (dietaryButton instanceof HTMLButtonElement) {
        event.preventDefault();

        const dietaryFilter = normalizeDietaryFilter(dietaryButton.dataset.dietaryFilter);
        if (!dietaryFilter) {
          return;
        }

        const nextSelections = new Set(
          normalizeDietarySelections(state.draftFilters.dietarySelections)
        );

        if (nextSelections.has(dietaryFilter)) {
          nextSelections.delete(dietaryFilter);
        } else {
          nextSelections.add(dietaryFilter);
        }

        state.draftFilters.dietarySelections = Array.from(nextSelections);
        syncDraftDietaryButtonState();
        renderFilterModalShell();
        return;
      }

      const organolepticChip = target.closest('[data-organoleptic-profile]');
      if (organolepticChip instanceof HTMLButtonElement) {
        event.preventDefault();

        const profileId = normalizeOrganolepticSelection(
          organolepticChip.dataset.organolepticProfile
        );
        if (!profileId) {
          return;
        }

        const nextSelections = new Set(
          normalizeOrganolepticSelections(state.draftFilters.organolepticSelections)
        );

        if (nextSelections.has(profileId)) {
          nextSelections.delete(profileId);
        } else {
          nextSelections.add(profileId);
        }

        state.draftFilters.organolepticSelections = Array.from(nextSelections);
        renderFilterModalShell();
        return;
      }

      if (target.closest('[data-menu-filter-close]')) {
        event.preventDefault();
        closeFilterModal();
        return;
      }

      if (target.closest('[data-menu-filter-apply]')) {
        event.preventDefault();
        const previousAppliedFilters = cloneFilters(state.appliedFilters);
        replaceFilters(state.appliedFilters, state.draftFilters);
        closeFilterModal();
        applySearchQuery(state.searchQuery, {
          force: true,
          filters: state.appliedFilters,
          previousFilters: previousAppliedFilters,
        });
      }
    });
  }

  if (filterModalBody instanceof HTMLElement) {
    filterModalBody.addEventListener('scroll', scheduleFilterModalChromeSync, {
      passive: true,
    });
  }

  window.addEventListener('resize', scheduleFilterModalChromeSync);

  document.addEventListener('keydown', (event) => {
    if (!state.filterModalOpen) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeFilterModal();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const focusableNodes = getFilterModalFocusableElements();

    if (!focusableNodes.length) {
      if (filterDialog instanceof HTMLElement) {
        event.preventDefault();
        filterDialog.focus();
      }

      return;
    }

    const first = focusableNodes[0];
    const last = focusableNodes[focusableNodes.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey && activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener('scroll', scheduleActiveCategoryUpdate, {
    passive: true,
  });
  window.addEventListener('resize', () => {
    const activeIndex = getCategoryIndex(state.activeCategoryId || state.categories[0]?.id);
    if (activeIndex >= 0) {
      setPillPosition(activeIndex, true);
    }
    syncSearchHelperWidth();
    updatePriceSliderVisuals(state.draftFilters);
    scheduleActiveCategoryUpdate();
  }, {
    passive: true,
  });

  const handleReducedMotionChange = () => {
    clearSearchHelperTimers();
    searchHelperAnimating = false;
    syncSearchHelperState();
  };

  if (typeof reducedMotionQuery.addEventListener === 'function') {
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
  } else if (typeof reducedMotionQuery.addListener === 'function') {
    reducedMotionQuery.addListener(handleReducedMotionChange);
  }

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
    openFilterModal: () => {
      openFilterModal();
      return state.filterModalOpen;
    },
    closeFilterModal: (options) => {
      closeFilterModal(options);
      return state.filterModalOpen;
    },
    toggleFilterModal: () => {
      if (state.filterModalOpen) {
        closeFilterModal();
      } else {
        openFilterModal();
      }

      return state.filterModalOpen;
    },
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
      renderSearchHelperWord(SEARCH_HELPER_WORDS[0]);
      syncSearchHelperWidth();
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
