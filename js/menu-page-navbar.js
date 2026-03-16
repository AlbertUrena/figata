(() => {
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const navbar = header?.querySelector('.navbar');
  const navInner = navbar?.querySelector('.navbar__inner');
  const brand = navInner?.querySelector('.navbar__brand');
  const links = navInner?.querySelector('.navbar__links');
  const actions = navInner?.querySelector('.navbar__actions');
  const controlsRoot = document.querySelector('[data-menu-sticky-controls]');

  if (
    !(header instanceof HTMLElement) ||
    !(navbar instanceof HTMLElement) ||
    !(navInner instanceof HTMLElement) ||
    !(brand instanceof HTMLElement) ||
    !(links instanceof HTMLElement) ||
    !(actions instanceof HTMLElement) ||
    !(controlsRoot instanceof HTMLElement)
  ) {
    return;
  }

  const FALLBACK_CATEGORIES = [
    { id: 'entradas', label: 'Entradas' },
    { id: 'pizzas', label: 'Pizzas' },
    { id: 'postres', label: 'Postres' },
    { id: 'bebidas', label: 'Bebidas' },
    { id: 'productos', label: 'Productos' },
  ];
  const SEARCH_INPUT_ID = 'navbar-menu-sticky-search-input';

  const state = {
    baseCollapsed: root.classList.contains('nav--collapsed'),
    controlsPastThreshold: false,
    suppressAutoSticky: false,
    stickySearchOpen: false,
    menuState: null,
    renderedCategoriesSignature: '',
    thresholdObserver: null,
    resizeObserver: null,
    classObserver: null,
    rafId: 0,
    shouldFocusCompactSearch: false,
    pillTransitionRestoreTimerId: 0,
    lastCompactPillCategoryId: '',
    lastCompactPillLeft: -1,
    lastCompactPillWidth: -1,
    wasStickyActive: false,
    stickyGeometryLockUntil: 0,
    searchMorphLockUntil: 0,
    lastStickySearchOpen: false,
    tabsViewportRafId: 0,
    tabsViewportRevealActive: false,
    tabsViewportImmediate: false,
  };

  const refs = {
    chevronButton: null,
    centerShell: null,
    centerDefault: null,
    centerSticky: null,
    tabsScroll: null,
    tabsTrack: null,
    tabsPill: null,
    tabsButtons: [],
    compactSearchShell: null,
    searchTool: null,
    compactSearchInput: null,
    compactSearchClear: null,
    searchButton: null,
    filterButton: null,
    ctaButton: actions.querySelector('.cta-button--nav'),
    tools: null,
    sentinel: null,
  };

  const normalizeText = (value) => String(value || '').trim();

  const getHeaderBottom = () =>
    header.getBoundingClientRect().bottom || header.offsetHeight || 0;

  const getCategoryList = () => {
    const menuCategories = Array.isArray(state.menuState?.categories)
      ? state.menuState.categories
      : [];
    const normalized = menuCategories
      .map((category) => ({
        id: normalizeText(category?.id),
        label: normalizeText(category?.label),
      }))
      .filter((category) => category.id && category.label);

    return normalized.length ? normalized : FALLBACK_CATEGORIES;
  };

  const buildCategorySignature = (categories) =>
    categories
      .map((category) => `${category.id}:${category.label}`)
      .join('|');

  const iconMarkup = (type) => {
    if (type === 'chevron') {
      return `
        <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
      `;
    }

    if (type === 'search') {
      return `
        <svg viewBox="0 0 640 640" focusable="false" aria-hidden="true">
          <path d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z" fill="currentColor"></path>
        </svg>
      `;
    }

    if (type === 'filter') {
      return `
        <svg viewBox="0 0 640 640" focusable="false" aria-hidden="true">
          <path d="M96 128C78.3 128 64 142.3 64 160C64 177.7 78.3 192 96 192L182.7 192C195 220.3 223.2 240 256 240C288.8 240 317 220.3 329.3 192L544 192C561.7 192 576 177.7 576 160C576 142.3 561.7 128 544 128L329.3 128C317 99.7 288.8 80 256 80C223.2 80 195 99.7 182.7 128L96 128zM96 288C78.3 288 64 302.3 64 320C64 337.7 78.3 352 96 352L342.7 352C355 380.3 383.2 400 416 400C448.8 400 477 380.3 489.3 352L544 352C561.7 352 576 337.7 576 320C576 302.3 561.7 288 544 288L489.3 288C477 259.7 448.8 240 416 240C383.2 240 355 259.7 342.7 288L96 288zM96 448C78.3 448 64 462.3 64 480C64 497.7 78.3 512 96 512L150.7 512C163 540.3 191.2 560 224 560C256.8 560 285 540.3 297.3 512L544 512C561.7 512 576 497.7 576 480C576 462.3 561.7 448 544 448L297.3 448C285 419.7 256.8 400 224 400C191.2 400 163 419.7 150.7 448L96 448z" fill="currentColor"></path>
        </svg>
      `;
    }

    return `
      <svg viewBox="0 0 640 640" focusable="false" aria-hidden="true">
        <path d="M183.1 137.4C170.6 124.9 150.3 124.9 137.8 137.4C125.3 149.9 125.3 170.2 137.8 182.7L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7L320.5 365.3L457.9 502.6C470.4 515.1 490.7 515.1 503.2 502.6C515.7 490.1 515.7 469.8 503.2 457.3L365.8 320L503.1 182.6C515.6 170.1 515.6 149.8 503.1 137.3C490.6 124.8 470.3 124.8 457.8 137.3L320.5 274.7L183.1 137.4z" fill="currentColor"></path>
      </svg>
    `;
  };

  const scheduleSync = () => {
    if (state.rafId) {
      return;
    }

    state.rafId = window.requestAnimationFrame(() => {
      state.rafId = 0;
      syncStickyState();
    });
  };

  const ensureSentinel = () => {
    if (refs.sentinel instanceof HTMLElement && refs.sentinel.isConnected) {
      return refs.sentinel;
    }

    controlsRoot.style.position = 'relative';
    const sentinel = document.createElement('span');
    sentinel.className = 'menu-page-controls__sticky-sentinel';
    sentinel.setAttribute('aria-hidden', 'true');
    controlsRoot.appendChild(sentinel);
    refs.sentinel = sentinel;
    return sentinel;
  };

  const measureControlsThreshold = () => {
    const sentinel = ensureSentinel();
    state.controlsPastThreshold =
      sentinel.getBoundingClientRect().top <= getHeaderBottom();
  };

  const isStickyEligible = () =>
    Boolean(
      state.baseCollapsed &&
        state.controlsPastThreshold &&
        state.menuState?.isListViewVisible
    );

  const isStickyActive = () => isStickyEligible() && !state.suppressAutoSticky;

  const updateCompactSearchControls = () => {
    if (
      !(refs.compactSearchInput instanceof HTMLInputElement) ||
      !(refs.compactSearchClear instanceof HTMLButtonElement)
    ) {
      return;
    }

    const hasValue = refs.compactSearchInput.value.length > 0;
    refs.compactSearchClear.classList.toggle('is-visible', hasValue);
    refs.compactSearchClear.setAttribute('aria-hidden', hasValue ? 'false' : 'true');
    refs.compactSearchClear.tabIndex = hasValue ? 0 : -1;
  };

  const syncCompactSearchValue = () => {
    if (!(refs.compactSearchInput instanceof HTMLInputElement)) {
      return;
    }

    const nextValue = normalizeText(state.menuState?.searchQuery);
    if (refs.compactSearchInput.value !== nextValue) {
      refs.compactSearchInput.value = nextValue;
    }

    updateCompactSearchControls();
  };

  const setTabsOverflowState = () => {
    if (!(refs.tabsScroll instanceof HTMLElement)) {
      return { overflowing: false, maxScrollLeft: 0 };
    }

    const maxScrollLeft = Math.max(
      0,
      refs.tabsScroll.scrollWidth - refs.tabsScroll.clientWidth
    );
    const overflowing = maxScrollLeft > 1;
    const hasLeftOverflow = overflowing && refs.tabsScroll.scrollLeft > 1;
    const hasRightOverflow =
      overflowing && refs.tabsScroll.scrollLeft < maxScrollLeft - 1;

    refs.tabsScroll.dataset.overflowing = overflowing ? 'true' : 'false';
    refs.tabsScroll.dataset.overflowLeft = hasLeftOverflow ? 'true' : 'false';
    refs.tabsScroll.dataset.overflowRight = hasRightOverflow ? 'true' : 'false';

    return { overflowing, maxScrollLeft };
  };

  const ensureActiveCompactTabVisibility = ({ immediate = false } = {}) => {
    if (!(refs.tabsScroll instanceof HTMLElement) || !refs.tabsButtons.length) {
      return;
    }

    const { overflowing, maxScrollLeft } = setTabsOverflowState();

    if (!overflowing) {
      if (refs.tabsScroll.scrollLeft !== 0) {
        refs.tabsScroll.scrollLeft = 0;
      }
      return;
    }

    const activeCategoryId =
      normalizeText(state.menuState?.activeCategoryId) ||
      normalizeText(refs.tabsButtons[0]?.dataset.menuGroupId);
    const activeButton =
      refs.tabsButtons.find(
        (button) => normalizeText(button.dataset.menuGroupId) === activeCategoryId
      ) || refs.tabsButtons[0];

    if (!(activeButton instanceof HTMLButtonElement)) {
      return;
    }

    const edgePaddingStart = 0;
    const edgePaddingEnd = 20;
    const safetyInset = 2;
    const visibleLeft = refs.tabsScroll.scrollLeft + edgePaddingStart + safetyInset;
    const visibleRight =
      refs.tabsScroll.scrollLeft +
      refs.tabsScroll.clientWidth -
      edgePaddingEnd -
      safetyInset;
    const activeLeft = activeButton.offsetLeft;
    const activeRight = activeLeft + activeButton.offsetWidth;
    let targetScrollLeft = refs.tabsScroll.scrollLeft;

    if (activeLeft < visibleLeft) {
      targetScrollLeft = Math.max(0, activeLeft - edgePaddingStart - safetyInset);
    } else if (activeRight > visibleRight) {
      targetScrollLeft = Math.min(
        maxScrollLeft,
        activeRight - refs.tabsScroll.clientWidth + edgePaddingEnd + safetyInset
      );
    }

    targetScrollLeft = Math.round(targetScrollLeft);
    if (maxScrollLeft - targetScrollLeft < 1) {
      targetScrollLeft = maxScrollLeft;
    }

    if (Math.abs(targetScrollLeft - refs.tabsScroll.scrollLeft) > 1) {
      if (immediate) {
        refs.tabsScroll.scrollLeft = targetScrollLeft;
      } else if (typeof refs.tabsScroll.scrollTo === 'function') {
        refs.tabsScroll.scrollTo({
          left: targetScrollLeft,
          behavior: 'smooth',
        });
      } else {
        refs.tabsScroll.scrollLeft = targetScrollLeft;
      }
    }
  };

  const syncTabsViewportState = ({ revealActive = false, immediate = false } = {}) => {
    setTabsOverflowState();

    if (revealActive) {
      ensureActiveCompactTabVisibility({ immediate });
      setTabsOverflowState();
    }
  };

  const scheduleTabsViewportSync = ({ revealActive = false, immediate = false } = {}) => {
    state.tabsViewportRevealActive = state.tabsViewportRevealActive || revealActive;
    state.tabsViewportImmediate = state.tabsViewportImmediate || immediate;

    if (state.tabsViewportRafId) {
      return;
    }

    state.tabsViewportRafId = window.requestAnimationFrame(() => {
      const nextRevealActive = state.tabsViewportRevealActive;
      const nextImmediate = state.tabsViewportImmediate;
      state.tabsViewportRafId = 0;
      state.tabsViewportRevealActive = false;
      state.tabsViewportImmediate = false;

      syncTabsViewportState({
        revealActive: nextRevealActive,
        immediate: nextImmediate,
      });
    });
  };

  const applyCompactPillFrame = (left, width, { immediate = false } = {}) => {
    if (!(refs.tabsPill instanceof HTMLElement)) {
      return;
    }

    if (immediate) {
      refs.tabsPill.style.transition = 'none';
      if (state.pillTransitionRestoreTimerId) {
        window.clearTimeout(state.pillTransitionRestoreTimerId);
      }
    }

    refs.tabsPill.style.width = `${width}px`;
    refs.tabsPill.style.transform = `translateX(${left}px)`;

    if (immediate) {
      state.pillTransitionRestoreTimerId = window.setTimeout(() => {
        state.pillTransitionRestoreTimerId = 0;
        if (refs.tabsPill instanceof HTMLElement) {
          refs.tabsPill.style.transition = '';
        }
      }, 72);
    }
  };

  const positionCompactPill = ({ scrollIntoView = false, immediate = false } = {}) => {
    if (
      !(refs.tabsPill instanceof HTMLElement) ||
      !(refs.tabsTrack instanceof HTMLElement) ||
      !refs.tabsButtons.length
    ) {
      return;
    }

    setTabsOverflowState();

    const activeCategoryId =
      normalizeText(state.menuState?.activeCategoryId) ||
      normalizeText(refs.tabsButtons[0]?.dataset.menuGroupId);
    const activeButton =
      refs.tabsButtons.find(
        (button) => normalizeText(button.dataset.menuGroupId) === activeCategoryId
      ) || refs.tabsButtons[0];

    if (!(activeButton instanceof HTMLButtonElement)) {
      return;
    }

    const activeButtonLeft = Math.round(activeButton.offsetLeft);
    const activeButtonWidth = Math.round(activeButton.offsetWidth);
    const nextCategoryId = normalizeText(activeButton.dataset.menuGroupId);
    const sameCategory = state.lastCompactPillCategoryId === nextCategoryId;
    const sameGeometry =
      state.lastCompactPillLeft === activeButtonLeft &&
      state.lastCompactPillWidth === activeButtonWidth;
    const shouldSyncImmediately =
      immediate ||
      (
        sameCategory &&
        !sameGeometry &&
        (
          state.stickyGeometryLockUntil > window.performance.now() ||
          state.searchMorphLockUntil > window.performance.now()
        )
      );
    const shouldRevealImmediately = immediate || (sameCategory && !sameGeometry);

    refs.tabsButtons.forEach((button) => {
      const isActive = button === activeButton;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-selected', isActive ? 'true' : 'false');
      button.tabIndex = isActive ? 0 : -1;
    });

    applyCompactPillFrame(activeButtonLeft, activeButtonWidth, {
      immediate: shouldSyncImmediately,
    });
    state.lastCompactPillCategoryId = nextCategoryId;
    state.lastCompactPillLeft = activeButtonLeft;
    state.lastCompactPillWidth = activeButtonWidth;
    scheduleTabsViewportSync({
      revealActive: true,
      immediate: shouldRevealImmediately,
    });

    if (scrollIntoView && typeof activeButton.scrollIntoView === 'function') {
      activeButton.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
        behavior: 'smooth',
      });
    }
  };

  const renderCompactTabs = () => {
    if (!(refs.tabsTrack instanceof HTMLElement)) {
      return;
    }

    const categories = getCategoryList();
    const nextSignature = buildCategorySignature(categories);

    if (nextSignature === state.renderedCategoriesSignature) {
      positionCompactPill();
      return;
    }

    state.renderedCategoriesSignature = nextSignature;
    refs.tabsButtons = [];
    refs.tabsTrack.replaceChildren();

    const pill = document.createElement('div');
    pill.className = 'navbar__menu-tabs-pill';
    refs.tabsTrack.appendChild(pill);
    refs.tabsPill = pill;

    categories.forEach((category) => {
      const button = document.createElement('button');
      button.className = 'navbar__menu-tab';
      button.type = 'button';
      button.setAttribute('role', 'tab');
      button.dataset.menuGroupId = category.id;
      button.textContent = category.label;
      button.addEventListener('click', () => {
        window.FigataMenuPage?.scrollToCategory?.(category.id);
      });
      refs.tabsTrack.appendChild(button);
      refs.tabsButtons.push(button);
    });

    positionCompactPill();
  };

  const applyUiState = () => {
    if (!(refs.chevronButton instanceof HTMLButtonElement)) {
      return;
    }

    if (!state.menuState?.isListViewVisible) {
      state.suppressAutoSticky = false;
      state.stickySearchOpen = false;
    }

    if (!state.controlsPastThreshold || !state.baseCollapsed) {
      state.suppressAutoSticky = false;
    }

    if (!isStickyEligible()) {
      state.stickySearchOpen = false;
    }

    if (isStickyActive() && state.menuState?.isSearching) {
      state.stickySearchOpen = true;
    }

    const stickyEligible = isStickyEligible();
    const stickyActive = isStickyActive();
    const searchOpen = stickyActive && state.stickySearchOpen;
    const activeElement = document.activeElement;
    const activeInsideCompactSearch =
      refs.searchTool instanceof HTMLElement &&
      activeElement instanceof HTMLElement &&
      refs.searchTool.contains(activeElement);
    const activeInsideSticky =
      refs.centerSticky instanceof HTMLElement &&
      activeElement instanceof HTMLElement &&
      refs.centerSticky.contains(activeElement);

    if (stickyActive && !state.wasStickyActive) {
      state.stickyGeometryLockUntil = window.performance.now() + 460;
    } else if (!stickyActive) {
      state.stickyGeometryLockUntil = 0;
    }

    if (searchOpen !== state.lastStickySearchOpen) {
      state.searchMorphLockUntil = searchOpen || state.lastStickySearchOpen
        ? window.performance.now() + 820
        : 0;
    }

    header.dataset.menuStickyAvailability = stickyEligible ? 'visible' : 'hidden';
    header.dataset.menuStickyMode = stickyActive ? 'sticky' : 'default';
    header.dataset.menuStickySearch = searchOpen ? 'open' : 'closed';
    header.dataset.menuStickyManual = state.suppressAutoSticky ? 'true' : 'false';

    refs.chevronButton.setAttribute(
      'aria-label',
      stickyActive
        ? 'Mostrar navbar colapsado normal'
        : 'Mostrar navegación compacta del menú'
    );
    refs.chevronButton.setAttribute('aria-pressed', stickyActive ? 'true' : 'false');
    refs.chevronButton.tabIndex = stickyEligible ? 0 : -1;

    if (refs.searchButton instanceof HTMLButtonElement) {
      refs.searchButton.disabled = !stickyActive;
      refs.searchButton.tabIndex = stickyActive ? 0 : -1;
      refs.searchButton.setAttribute('aria-expanded', searchOpen ? 'true' : 'false');
      refs.searchButton.setAttribute('aria-pressed', searchOpen ? 'true' : 'false');
    }

    if (refs.filterButton instanceof HTMLButtonElement) {
      refs.filterButton.disabled = !stickyActive;
      refs.filterButton.tabIndex = stickyActive ? 0 : -1;
      refs.filterButton.setAttribute(
        'aria-expanded',
        state.menuState?.isFilterModalOpen ? 'true' : 'false'
      );
    }

    if (refs.tools instanceof HTMLElement) {
      refs.tools.inert = !stickyActive;
    }

    syncCompactSearchValue();
    renderCompactTabs();
    positionCompactPill();

    if (!searchOpen && activeInsideCompactSearch && refs.searchButton) {
      refs.searchButton.focus();
    }

    if (!stickyActive && (activeInsideSticky || activeInsideCompactSearch)) {
      if (stickyEligible && refs.chevronButton instanceof HTMLButtonElement) {
        refs.chevronButton.focus();
      } else if (activeElement instanceof HTMLElement) {
        activeElement.blur();
      }
    }

    if (refs.centerSticky instanceof HTMLElement) {
      refs.centerSticky.setAttribute('aria-hidden', stickyActive ? 'false' : 'true');
      refs.centerSticky.inert = !stickyActive;
    }

    if (refs.centerDefault instanceof HTMLElement) {
      refs.centerDefault.setAttribute('aria-hidden', stickyActive ? 'true' : 'false');
      refs.centerDefault.inert = stickyActive;
    }

    if (refs.tabsScroll instanceof HTMLElement) {
      refs.tabsScroll.setAttribute(
        'aria-hidden',
        stickyActive ? 'false' : 'true'
      );
      refs.tabsScroll.inert = !stickyActive;
    }

    if (refs.compactSearchShell instanceof HTMLElement) {
      refs.compactSearchShell.setAttribute('aria-hidden', searchOpen ? 'false' : 'true');
      refs.compactSearchShell.inert = !searchOpen;
    }

    refs.tabsButtons.forEach((button) => {
      button.tabIndex = stickyActive && !searchOpen && button.classList.contains('is-active')
        ? 0
        : -1;
    });

    if (refs.compactSearchInput instanceof HTMLInputElement) {
      refs.compactSearchInput.tabIndex = searchOpen ? 0 : -1;
    }

    if (refs.compactSearchClear instanceof HTMLButtonElement && !searchOpen) {
      refs.compactSearchClear.tabIndex = -1;
    }

    links.querySelectorAll('a').forEach((link) => {
      link.tabIndex = stickyActive ? -1 : 0;
    });

    if (refs.ctaButton instanceof HTMLAnchorElement) {
      refs.ctaButton.setAttribute('aria-hidden', stickyActive ? 'true' : 'false');
      refs.ctaButton.tabIndex = stickyActive ? -1 : 0;
    }

    if (searchOpen && state.shouldFocusCompactSearch) {
      state.shouldFocusCompactSearch = false;
      window.requestAnimationFrame(() => {
        refs.compactSearchInput?.focus();
        refs.compactSearchInput?.select();
      });
    }

    state.wasStickyActive = stickyActive;
    state.lastStickySearchOpen = searchOpen;
  };

  const syncStickyState = () => {
    state.baseCollapsed = root.classList.contains('nav--collapsed');
    measureControlsThreshold();
    applyUiState();
  };

  const observeThreshold = () => {
    if (state.thresholdObserver) {
      state.thresholdObserver.disconnect();
      state.thresholdObserver = null;
    }

    if (!('IntersectionObserver' in window)) {
      return;
    }

    state.thresholdObserver = new IntersectionObserver(
      () => {
        scheduleSync();
      },
      {
        threshold: [0, 1],
        rootMargin: `${Math.round(-1 * getHeaderBottom())}px 0px 0px 0px`,
      }
    );

    state.thresholdObserver.observe(ensureSentinel());
  };

  const bindObservers = () => {
    window.addEventListener('scroll', scheduleSync, { passive: true });
    window.addEventListener('resize', () => {
      observeThreshold();
      scheduleSync();
      positionCompactPill();
      scheduleTabsViewportSync({
        revealActive: true,
        immediate: true,
      });
    }, { passive: true });
    window.addEventListener('orientationchange', () => {
      observeThreshold();
      scheduleSync();
      positionCompactPill();
      scheduleTabsViewportSync({
        revealActive: true,
        immediate: true,
      });
    });

    state.classObserver = new MutationObserver(() => {
      scheduleSync();
    });

    state.classObserver.observe(root, {
      attributes: true,
      attributeFilter: ['class'],
    });

    if ('ResizeObserver' in window) {
      state.resizeObserver = new ResizeObserver(() => {
        observeThreshold();
        scheduleSync();
        positionCompactPill();
        scheduleTabsViewportSync({
          revealActive: true,
          immediate: true,
        });
      });
      state.resizeObserver.observe(header);
      state.resizeObserver.observe(controlsRoot);
      state.resizeObserver.observe(navInner);
      if (refs.centerShell instanceof HTMLElement) {
        state.resizeObserver.observe(refs.centerShell);
      }
      if (refs.tabsScroll instanceof HTMLElement) {
        state.resizeObserver.observe(refs.tabsScroll);
      }
      if (refs.tabsTrack instanceof HTMLElement) {
        state.resizeObserver.observe(refs.tabsTrack);
      }
    }

    observeThreshold();
  };

  const createMenuToolsButton = (modifier, label, iconType) => {
    const button = document.createElement('button');
    button.className = `navbar__menu-tool navbar__menu-tool--${modifier}`;
    button.type = 'button';
    button.setAttribute('aria-label', label);
    button.innerHTML = iconMarkup(iconType);
    return button;
  };

  const buildChrome = () => {
    navbar.classList.add('navbar--menu-route');

    const brandSlot = document.createElement('div');
    brandSlot.className = 'navbar__brand-slot';
    navInner.insertBefore(brandSlot, brand);
    brandSlot.appendChild(brand);

    const chevronButton = document.createElement('button');
    chevronButton.className = 'navbar__menu-mode-toggle';
    chevronButton.type = 'button';
    chevronButton.innerHTML = iconMarkup('chevron');
    brandSlot.appendChild(chevronButton);
    refs.chevronButton = chevronButton;

    const centerShell = document.createElement('div');
    centerShell.className = 'navbar__center-shell';
    navInner.insertBefore(centerShell, links);

    const defaultPane = document.createElement('div');
    defaultPane.className = 'navbar__center-default';
    const linksClip = document.createElement('div');
    linksClip.className = 'navbar__links-clip';
    linksClip.appendChild(links);
    defaultPane.appendChild(linksClip);

    const stickyPane = document.createElement('div');
    stickyPane.className = 'navbar__center-sticky';

    const tabsScroll = document.createElement('div');
    tabsScroll.className = 'navbar__menu-tabs-scroll';
    const tabsTrack = document.createElement('div');
    tabsTrack.className = 'navbar__menu-tabs-track';
    tabsScroll.appendChild(tabsTrack);

    stickyPane.appendChild(tabsScroll);
    centerShell.appendChild(defaultPane);
    centerShell.appendChild(stickyPane);

    refs.centerShell = centerShell;
    refs.centerSticky = stickyPane;
    refs.centerDefault = defaultPane;
    refs.tabsScroll = tabsScroll;
    refs.tabsTrack = tabsTrack;

    const tools = document.createElement('div');
    tools.className = 'navbar__menu-tools';

    const searchTool = document.createElement('div');
    searchTool.className = 'navbar__menu-search-tool';
    const searchButton = createMenuToolsButton('search', 'Buscar en el menú', 'search');
    searchButton.classList.add('navbar__menu-search-trigger');
    searchTool.appendChild(searchButton);

    const searchShell = document.createElement('label');
    searchShell.className = 'navbar__menu-search-panel';
    searchShell.setAttribute('for', SEARCH_INPUT_ID);
    searchShell.innerHTML = `
      <input
        class="navbar__menu-search-input"
        id="${SEARCH_INPUT_ID}"
        type="search"
        placeholder="Buscar en el menu"
        autocomplete="off"
        spellcheck="false"
        enterkeyhint="search">
      <button
        class="navbar__menu-search-clear"
        type="button"
        aria-label="Limpiar búsqueda"
        aria-hidden="true"
        tabindex="-1">
        ${iconMarkup('clear')}
      </button>
    `;
    searchTool.appendChild(searchShell);

    const filterButton = createMenuToolsButton('filter', 'Filtros del menú', 'filter');
    tools.appendChild(searchTool);
    tools.appendChild(filterButton);
    actions.appendChild(tools);

    refs.searchTool = searchTool;
    refs.searchButton = searchButton;
    refs.filterButton = filterButton;
    refs.tools = tools;
    refs.compactSearchShell = searchShell;
    refs.compactSearchInput = searchShell.querySelector('.navbar__menu-search-input');
    refs.compactSearchClear = searchShell.querySelector('.navbar__menu-search-clear');
    refs.tabsScroll.addEventListener('scroll', () => {
      scheduleTabsViewportSync();
    }, { passive: true });

    chevronButton.addEventListener('click', () => {
      if (!isStickyEligible()) {
        return;
      }

      if (isStickyActive()) {
        state.suppressAutoSticky = true;
        state.stickySearchOpen = false;
      } else {
        state.suppressAutoSticky = false;
      }

      applyUiState();
    });

    searchButton.addEventListener('click', () => {
      if (!isStickyActive()) {
        return;
      }

      state.stickySearchOpen = !state.stickySearchOpen;
      state.shouldFocusCompactSearch = state.stickySearchOpen;
      applyUiState();
    });

    filterButton.addEventListener('click', (event) => {
      if (!isStickyActive()) {
        return;
      }

      event.preventDefault();
      window.FigataMenuPage?.toggleFilterModal?.();
    });

    if (refs.compactSearchInput instanceof HTMLInputElement) {
      refs.compactSearchInput.addEventListener('input', () => {
        updateCompactSearchControls();
        window.FigataMenuPage?.setSearchQuery?.(refs.compactSearchInput.value);
      });

      refs.compactSearchInput.addEventListener('search', () => {
        window.FigataMenuPage?.setSearchQuery?.(refs.compactSearchInput.value);
      });

      refs.compactSearchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          if (refs.compactSearchInput.value) {
            refs.compactSearchInput.value = '';
            updateCompactSearchControls();
            window.FigataMenuPage?.setSearchQuery?.('');
            return;
          }

          state.stickySearchOpen = false;
          refs.searchButton?.focus();
          applyUiState();
        }
      });
    }

    if (refs.compactSearchClear instanceof HTMLButtonElement) {
      refs.compactSearchClear.addEventListener('click', (event) => {
        event.preventDefault();
        if (!(refs.compactSearchInput instanceof HTMLInputElement)) {
          return;
        }

        refs.compactSearchInput.value = '';
        updateCompactSearchControls();
        window.FigataMenuPage?.setSearchQuery?.('');
        refs.compactSearchInput.focus();
      });
    }

    ensureSentinel();
    window.dispatchEvent(new Event('resize'));
  };

  const handleMenuStateChange = (detail) => {
    state.menuState = detail || window.FigataMenuPage?.getState?.() || null;
    applyUiState();
  };

  const waitForMenuState = async () => {
    const menuApi = window.FigataMenuPage;

    if (!menuApi || typeof menuApi.whenReady !== 'function') {
      throw new Error('[menu-page-navbar] FigataMenuPage no disponible.');
    }

    await menuApi.whenReady();
    return menuApi.getState();
  };

  void (async () => {
    try {
      state.menuState = await waitForMenuState();
      buildChrome();
      bindObservers();

      window.addEventListener('figata:menu-page-state-change', (event) => {
        handleMenuStateChange(event.detail);
      });

      handleMenuStateChange(state.menuState);

      if (document.fonts && typeof document.fonts.ready?.then === 'function') {
        document.fonts.ready.then(() => {
          window.dispatchEvent(new Event('resize'));
        });
      }
    } catch (error) {
      console.warn(error);
    }
  })();
})();
