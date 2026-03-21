(() => {
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const controlsRoot = document.querySelector('[data-menu-sticky-controls]');
  let navbar = null;
  let navInner = null;
  let brand = null;
  let links = null;
  let actions = null;

  if (
    !(header instanceof HTMLElement) ||
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
  const MOBILE_MENU_ENTRY_BY_KEY = {
    menu: {
      subtitle: 'Carta y favoritos',
      thumbSrc: '/assets/navbar/menu-thumb.webp',
    },
    nosotros: {
      subtitle: 'Nuestra historia real',
      thumbSrc: '/assets/navbar/nosotros-thumb.webp',
    },
    ubicacion: {
      subtitle: 'Cómo llegar rápido',
      thumbSrc: '/assets/navbar/ubicacion-thumb.webp',
    },
    contacto: {
      subtitle: 'Reserva o escríbenos',
      thumbSrc: '/assets/navbar/contacto-thumb.webp',
    },
  };
  const SEARCH_INPUT_ID = 'navbar-menu-sticky-search-input';
  const MOBILE_SEARCH_INPUT_ID = 'navbar-menu-mobile-search-input';
  const MOBILE_BREAKPOINT = 820;
  const MOBILE_MENU_PANEL_ID = 'navbar-mobile-menu-panel';
  const MOBILE_MENU_CLOSE_COMMIT_MS = 460;
  const FORCE_COLLAPSED_MOBILE_ATTR = 'data-nav-force-collapsed-mobile';
  const DETAIL_NAV_REVEAL_SCROLL_Y = 125;
  const BURGER_ANIMATION_MS = 240;
  const MOBILE_SEARCH_OPEN_GAP_PX = 14;
  const MOBILE_SEARCH_OPEN_MIN_WIDTH = 184;
  const MOBILE_SEARCH_OPEN_MAX_WIDTH = 252;
  const STICKY_THRESHOLD_RELEASE_BUFFER_PX = 18;
  const STICKY_SEARCH_HELPER_WORDS = Object.freeze([
    'ingredientes',
    'alérgenos',
    'platos',
    'bebidas',
  ]);
  const STICKY_SEARCH_HELPER_INITIAL_DELAY_MS = 1200;
  const STICKY_SEARCH_HELPER_RESTART_DELAY_MS = 800;
  const STICKY_SEARCH_HELPER_IDLE_DELAY_MS = 2140;
  const STICKY_SEARCH_HELPER_OUT_DURATION_MS = 240;
  const STICKY_SEARCH_HELPER_IN_DURATION_MS = 350;
  const STICKY_SEARCH_HELPER_IN_DELAY_MS = 60;
  const STICKY_SEARCH_HELPER_OUT_STAGGER_MS = 12;
  const STICKY_SEARCH_HELPER_IN_STAGGER_MS = 16;
  const STICKY_SEARCH_HELPER_OUT_Y_PX = -18;
  const STICKY_SEARCH_HELPER_IN_Y_PX = 16;
  const STICKY_SEARCH_HELPER_BLUR_PX = 6;
  const STICKY_SEARCH_HELPER_OUT_EASE = 'cubic-bezier(0.4, 0, 1, 1)';
  const STICKY_SEARCH_HELPER_IN_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const BURGER_LINE_GEOMETRY = Object.freeze({
    top: Object.freeze({
      closed: Object.freeze({ x1: 7, y1: 15, x2: 58, y2: 15 }),
      open: Object.freeze({ x1: 14.469, y1: 13.969, x2: 50.531, y2: 50.031 }),
    }),
    mid: Object.freeze({
      closed: Object.freeze({ x1: 7, y1: 32, x2: 50, y2: 32 }),
      open: Object.freeze({ x1: 28.5, y1: 32, x2: 28.5, y2: 32 }),
    }),
    bot: Object.freeze({
      closed: Object.freeze({ x1: 7, y1: 49, x2: 58, y2: 49 }),
      open: Object.freeze({ x1: 14.469, y1: 50.031, x2: 50.531, y2: 13.969 }),
    }),
  });
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

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
    mobileMenuOpen: false,
    mobileMenuCloseCommitTimerId: 0,
    mobileMenuForceCollapsed: false,
    mobileSearchWidthSyncFrameId: 0,
    mobileSearchLastAppliedWidth: 0,
    burgerAnimationFrameId: 0,
    burgerAnimationProgress: 0,
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
    compactSearchHelper: null,
    compactSearchHelperWord: null,
    searchTool: null,
    compactSearchInput: null,
    compactSearchClear: null,
    searchButton: null,
    filterButton: null,
    ctaButton: null,
    tools: null,
    mobileActions: null,
    mobileSearchTool: null,
    mobileSearchPanel: null,
    mobileSearchButton: null,
    mobileSearchHelper: null,
    mobileSearchHelperWord: null,
    mobileSearchInput: null,
    mobileSearchClear: null,
    mobileFilterButton: null,
    mobileAccountButton: null,
    mobileMenuButton: null,
    mobileMenuPanel: null,
    mobileMenuLinks: [],
    sentinel: null,
  };

  const resolveNavbarNodes = () => {
    navbar = header.querySelector('.navbar');
    navInner = navbar?.querySelector('.navbar__inner');
    brand = navInner?.querySelector('.navbar__brand');
    links = navInner?.querySelector('.navbar__links');
    actions = navInner?.querySelector('.navbar__actions');
    refs.ctaButton =
      actions instanceof HTMLElement
        ? actions.querySelector('.cta-button--nav')
        : null;

    return (
      navbar instanceof HTMLElement &&
      navInner instanceof HTMLElement &&
      brand instanceof HTMLElement &&
      links instanceof HTMLElement &&
      actions instanceof HTMLElement
    );
  };

  const normalizeText = (value) => String(value || '').trim();
  const toLookupKey = (value) =>
    normalizeText(value)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  const isMobileViewport = () =>
    (window.innerWidth || root.clientWidth || 0) <= MOBILE_BREAKPOINT;

  const getHeaderBottom = () =>
    header.getBoundingClientRect().bottom || header.offsetHeight || 0;

  const clamp01 = (value) => Math.min(1, Math.max(0, value));
  const lerp = (start, end, progress) => start + (end - start) * progress;
  const easeInOutCubic = (value) =>
    value < 0.5
      ? 4 * value * value * value
      : 1 - Math.pow(-2 * value + 2, 3) / 2;
  const formatBurgerCoord = (value) => {
    const rounded = Math.abs(value) < 0.0005 ? 0 : value;
    return Number(rounded.toFixed(3)).toString();
  };
  const buildBurgerPath = ({ x1, y1, x2, y2 }) =>
    `M${formatBurgerCoord(x1)} ${formatBurgerCoord(y1)}L${formatBurgerCoord(x2)} ${formatBurgerCoord(y2)}`;
  const interpolateBurgerLine = (from, to, progress) => ({
    x1: lerp(from.x1, to.x1, progress),
    y1: lerp(from.y1, to.y1, progress),
    x2: lerp(from.x2, to.x2, progress),
    y2: lerp(from.y2, to.y2, progress),
  });
  const getBurgerLineElements = () => {
    if (!(refs.mobileMenuButton instanceof HTMLButtonElement)) {
      return null;
    }

    const top = refs.mobileMenuButton.querySelector('.navbar__burger-line--top');
    const mid = refs.mobileMenuButton.querySelector('.navbar__burger-line--mid');
    const bot = refs.mobileMenuButton.querySelector('.navbar__burger-line--bot');

    if (
      !(top instanceof SVGPathElement) ||
      !(mid instanceof SVGPathElement) ||
      !(bot instanceof SVGPathElement)
    ) {
      return null;
    }

    return { top, mid, bot };
  };
  const renderBurgerAnimationFrame = (progress) => {
    const burgerLines = getBurgerLineElements();

    if (!burgerLines) {
      return false;
    }

    const clampedProgress = clamp01(progress);

    ['top', 'mid', 'bot'].forEach((key) => {
      const geometry = BURGER_LINE_GEOMETRY[key];
      const nextLine = interpolateBurgerLine(geometry.closed, geometry.open, clampedProgress);
      burgerLines[key].setAttribute('d', buildBurgerPath(nextLine));
    });

    burgerLines.mid.style.opacity = String(1 - clampedProgress);
    state.burgerAnimationProgress = clampedProgress;
    return true;
  };
  const cancelBurgerAnimation = () => {
    if (state.burgerAnimationFrameId) {
      window.cancelAnimationFrame(state.burgerAnimationFrameId);
      state.burgerAnimationFrameId = 0;
    }
  };
  const syncBurgerAnimation = (nextOpen, { animate = true } = {}) => {
    const targetProgress = nextOpen ? 1 : 0;

    if (!renderBurgerAnimationFrame(state.burgerAnimationProgress)) {
      return;
    }

    const shouldAnimate = animate && !reducedMotionQuery.matches;

    if (!shouldAnimate || Math.abs(state.burgerAnimationProgress - targetProgress) < 0.001) {
      cancelBurgerAnimation();
      renderBurgerAnimationFrame(targetProgress);
      return;
    }

    cancelBurgerAnimation();

    const startProgress = state.burgerAnimationProgress;
    const progressDelta = targetProgress - startProgress;
    const duration = BURGER_ANIMATION_MS * Math.max(0.35, Math.abs(progressDelta));
    const primedFrameMs = Math.min(16, duration * 0.25);
    const animationStartedAt = performance.now() - primedFrameMs;

    const step = (now) => {
      const elapsed = clamp01((now - animationStartedAt) / duration);
      const easedProgress = easeInOutCubic(elapsed);
      renderBurgerAnimationFrame(startProgress + progressDelta * easedProgress);

      if (elapsed < 1) {
        state.burgerAnimationFrameId = window.requestAnimationFrame(step);
        return;
      }

      state.burgerAnimationFrameId = 0;
      renderBurgerAnimationFrame(targetProgress);
    };

    step(performance.now());

    if (!state.burgerAnimationFrameId) {
      return;
    }

    state.burgerAnimationFrameId = window.requestAnimationFrame(step);
  };

  const setMobileMenuOpen = (nextOpen, { restoreFocus = false } = {}) => {
    const isMobile = isMobileViewport();
    const detailNavHidden = header.dataset.menuDetailNav === 'hidden';
    const mobileActionsInteractive = isMobile && !detailNavHidden;
    const shouldOpen = Boolean(nextOpen) && mobileActionsInteractive;
    const navbarCurrentlyCollapsed = root.classList.contains('nav--collapsed');
    const wasMenuOpen = state.mobileMenuOpen;
    const previousNavPhase = normalizeText(header.dataset.menuMobileNav);
    const clearCloseCommitTimer = () => {
      if (state.mobileMenuCloseCommitTimerId) {
        window.clearTimeout(state.mobileMenuCloseCommitTimerId);
        state.mobileMenuCloseCommitTimerId = 0;
      }
    };
    const ensureCloseCommitTimer = () => {
      if (state.mobileMenuCloseCommitTimerId) {
        return;
      }

      state.mobileMenuCloseCommitTimerId = window.setTimeout(() => {
        state.mobileMenuCloseCommitTimerId = 0;
        if (!state.mobileMenuOpen) {
          header.dataset.menuMobileNav = 'closed';
          document.body.classList.remove('menu-mobile-nav-backdrop');
        }
      }, MOBILE_MENU_CLOSE_COMMIT_MS);
    };
    if (shouldOpen && !wasMenuOpen) {
      state.mobileMenuForceCollapsed = isMobile && !navbarCurrentlyCollapsed;
    } else if (!shouldOpen && wasMenuOpen && state.mobileMenuForceCollapsed) {
      state.mobileMenuForceCollapsed = false;
    }
    state.mobileMenuOpen = shouldOpen;
    syncMobileForcedCollapsedState();

    if (shouldOpen) {
      clearCloseCommitTimer();
      header.dataset.menuMobileNav = 'open';
      document.body.classList.add('menu-mobile-nav-backdrop');
    } else if (previousNavPhase === 'open') {
      clearCloseCommitTimer();
      header.dataset.menuMobileNav = 'closing';
      document.body.classList.remove('menu-mobile-nav-backdrop');
      ensureCloseCommitTimer();
    } else if (previousNavPhase === 'closing') {
      document.body.classList.remove('menu-mobile-nav-backdrop');
      ensureCloseCommitTimer();
    } else {
      clearCloseCommitTimer();
      header.dataset.menuMobileNav = 'closed';
      document.body.classList.remove('menu-mobile-nav-backdrop');
    }

    if (refs.mobileMenuButton instanceof HTMLButtonElement) {
      const nextIconType = 'burger-animated';
      let rebuiltBurgerIcon = false;
      const nextBurgerState = shouldOpen ? 'open' : 'closed';
      const burgerStateChanged =
        refs.mobileMenuButton.getAttribute('data-burger-state') !== nextBurgerState;
      if (refs.mobileMenuButton.dataset.iconType !== nextIconType) {
        refs.mobileMenuButton.dataset.iconType = nextIconType;
        refs.mobileMenuButton.innerHTML = iconMarkup(nextIconType);
        rebuiltBurgerIcon = true;
      }
      refs.mobileMenuButton.setAttribute('data-burger-state', nextBurgerState);
      refs.mobileMenuButton.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
      refs.mobileMenuButton.setAttribute('aria-pressed', shouldOpen ? 'true' : 'false');
      refs.mobileMenuButton.setAttribute(
        'aria-label',
        shouldOpen ? 'Cerrar navegación principal' : 'Abrir navegación principal'
      );
      refs.mobileMenuButton.tabIndex = mobileActionsInteractive ? 0 : -1;
      if (rebuiltBurgerIcon || burgerStateChanged) {
        syncBurgerAnimation(shouldOpen, { animate: !rebuiltBurgerIcon });
      }
    }

    if (refs.mobileMenuPanel instanceof HTMLElement) {
      refs.mobileMenuPanel.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');
      refs.mobileMenuPanel.inert = !shouldOpen;
    }

    refs.mobileMenuLinks.forEach((link) => {
      link.tabIndex = shouldOpen ? 0 : -1;
    });

    if (!shouldOpen && restoreFocus && refs.mobileMenuButton instanceof HTMLButtonElement) {
      refs.mobileMenuButton.focus();
    }
  };

  const syncMobileForcedCollapsedState = () => {
    const shouldForceCollapsed = Boolean(
      isMobileViewport() &&
      (
        state.menuState?.isListViewVisible === false ||
        state.mobileMenuForceCollapsed
      )
    );
    const forceCollapsedNow =
      root.getAttribute(FORCE_COLLAPSED_MOBILE_ATTR) === 'true';

    if (shouldForceCollapsed === forceCollapsedNow) {
      return;
    }

    if (shouldForceCollapsed) {
      root.setAttribute(FORCE_COLLAPSED_MOBILE_ATTR, 'true');
    } else {
      root.removeAttribute(FORCE_COLLAPSED_MOBILE_ATTR);
    }
  };

  const buildMobileMenuLinks = () => {
    if (!(refs.mobileMenuPanel instanceof HTMLElement)) {
      return;
    }

    refs.mobileMenuLinks = [];
    const list = document.createElement('ul');
    list.className = 'navbar__mobile-menu-links';
    list.setAttribute('role', 'list');

    links.querySelectorAll('a').forEach((sourceLink) => {
      const href = normalizeText(sourceLink.getAttribute('href'));
      const label = normalizeText(sourceLink.textContent);

      if (!href || !label) {
        return;
      }

      const item = document.createElement('li');
      item.className = 'navbar__mobile-menu-card';
      const anchor = document.createElement('a');
      anchor.className = 'navbar__mobile-menu-link';
      anchor.href = href;
      anchor.setAttribute('aria-label', label);
      anchor.tabIndex = -1;
      anchor.addEventListener('click', () => {
        setMobileMenuOpen(false);
      });

      const title = document.createElement('span');
      title.className = 'navbar__mobile-menu-title';
      title.textContent = label;

      const meta = document.createElement('span');
      meta.className = 'navbar__mobile-menu-meta';
      const labelKey = toLookupKey(label);
      const entryConfig = MOBILE_MENU_ENTRY_BY_KEY[labelKey] || null;
      meta.textContent = entryConfig?.subtitle || 'Descubre esta sección';

      const copy = document.createElement('span');
      copy.className = 'navbar__mobile-menu-copy';
      copy.append(title, meta);

      const thumb = document.createElement('span');
      thumb.className = 'navbar__mobile-menu-thumb';
      thumb.setAttribute('aria-hidden', 'true');
      if (entryConfig?.thumbSrc) {
        const thumbImage = document.createElement('img');
        thumbImage.className = 'navbar__mobile-menu-thumb-image';
        thumbImage.src = entryConfig.thumbSrc;
        thumbImage.alt = '';
        thumbImage.decoding = 'async';
        thumbImage.loading = 'eager';
        thumb.appendChild(thumbImage);
      } else {
        thumb.textContent = label.charAt(0).toUpperCase();
      }

      const chevron = document.createElement('span');
      chevron.className = 'navbar__mobile-menu-chevron';
      chevron.setAttribute('aria-hidden', 'true');
      chevron.innerHTML = iconMarkup('chevron-card');

      anchor.append(thumb, copy, chevron);
      item.appendChild(anchor);
      list.appendChild(item);
      refs.mobileMenuLinks.push(anchor);
    });

    refs.mobileMenuPanel.replaceChildren(list);
  };

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

    if (type === 'chevron-card') {
      return `
        <svg viewBox="0 0 9 14" focusable="false" aria-hidden="true">
          <path d="M1.2 1.2L6.9 7L1.2 12.8" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"></path>
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

    if (type === 'burger') {
      return `
        <svg viewBox="0 0 64 64" focusable="false" aria-hidden="true">
          <path d="M7 15h51M7 32h43M7 49h51" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"></path>
        </svg>
      `;
    }

    if (type === 'burger-animated') {
      return `
        <svg class="navbar__burger-icon" viewBox="0 0 64 64" focusable="false" aria-hidden="true">
          <path class="navbar__burger-line navbar__burger-line--top" d="M7 15h51"></path>
          <path class="navbar__burger-line navbar__burger-line--mid" d="M7 32h43"></path>
          <path class="navbar__burger-line navbar__burger-line--bot" d="M7 49h51"></path>
        </svg>
      `;
    }

    if (type === 'menu-close') {
      return `
        <svg viewBox="0 0 17 16" focusable="false" aria-hidden="true">
          <path d="M10.1505 8.17678L15.7177 13.744L13.8153 15.6464L8.24807 10.0792L8.07129 9.90245L7.89451 10.0792L2.32729 15.6464L0.424843 13.744L5.99207 8.17678L6.16884 8L5.99207 7.82322L0.424842 2.256L2.32729 0.353553L7.89451 5.92078L8.07129 6.09755L8.24807 5.92078L13.8153 0.353554L15.7177 2.256L10.1505 7.82322L9.97373 8L10.1505 8.17678Z" fill="currentColor"></path>
        </svg>
      `;
    }

    if (type === 'account') {
      return `
        <svg viewBox="0 0 32 32" focusable="false" aria-hidden="true">
          <path d="M16 7h2a1 1 0 0 0 0-2h-1a1 1 0 0 0-2 0v.18A3 3 0 0 0 16 11a1 1 0 0 1 0 2H14a1 1 0 0 0 0 2h1a1 1 0 0 0 2 0v-.18A3 3 0 0 0 16 9a1 1 0 0 1 0-2Z" fill="currentColor"></path>
          <path d="M31 24H28V3a3 3 0 0 0-3-3H3A3 3 0 0 0 0 3V9a1 1 0 0 0 1 1H4V29a3 3 0 0 0 3 3H29a3 3 0 0 0 3-3V25A1 1 0 0 0 31 24ZM2 3A1 1 0 0 1 4 3V8H2ZM8 25v4a1 1 0 0 1-.31.71A.93.93 0 0 1 7 30a1 1 0 0 1-1-1V3a3 3 0 0 0-.18-1H25a1 1 0 0 1 1 1V24H9A1 1 0 0 0 8 25Zm22 4a1 1 0 0 1-.31.71A.93.93 0 0 1 29 30H9.83A3 3 0 0 0 10 29V26H30Z" fill="currentColor"></path>
          <path d="M17 19H9a1 1 0 0 0 0 2h8a1 1 0 0 0 0-2Z" fill="currentColor"></path>
          <path d="M23 19H21a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2Z" fill="currentColor"></path>
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

  const stickySearchHelperControllers = [];

  const createStickySearchHelperChar = (character) => {
    const char = document.createElement('span');
    char.className = 'navbar__sticky-search-helper-char';
    char.textContent = character === ' ' ? '\u00A0' : character;
    return char;
  };

  const setStickySearchHelperCharState = (char, { opacity, blurPx, translateYPx }) => {
    char.style.opacity = String(opacity);
    char.style.filter = `blur(${blurPx}px)`;
    char.style.transform = `translateY(${translateYPx}px)`;
  };

  const createStickySearchHelperLayer = (word, initialState = null) => {
    const layer = document.createElement('span');
    layer.className = 'navbar__sticky-search-helper-layer';

    Array.from(word).forEach((character) => {
      const char = createStickySearchHelperChar(character);

      if (initialState) {
        setStickySearchHelperCharState(char, initialState);
      }

      layer.appendChild(char);
    });

    return layer;
  };

  const createStickySearchHelperController = ({ root, input, word }) => {
    if (
      !(root instanceof HTMLElement) ||
      !(input instanceof HTMLInputElement) ||
      !(word instanceof HTMLElement)
    ) {
      return null;
    }

    let wordIndex = 0;
    let hasStarted = false;
    let animating = false;
    let timerId = 0;
    let animationTimerId = 0;
    let frameId = 0;

    const clearTimers = () => {
      if (timerId) {
        window.clearTimeout(timerId);
        timerId = 0;
      }

      if (animationTimerId) {
        window.clearTimeout(animationTimerId);
        animationTimerId = 0;
      }

      if (frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
    };

    const renderWord = (nextWord = STICKY_SEARCH_HELPER_WORDS[0]) => {
      word.replaceChildren(createStickySearchHelperLayer(nextWord));
    };

    const syncWidth = () => {
      if (!STICKY_SEARCH_HELPER_WORDS.length || !(document.body instanceof HTMLBodyElement)) {
        return;
      }

      const computedStyles = window.getComputedStyle(word);
      const measure = document.createElement('span');
      measure.className = 'navbar__sticky-search-helper-layer';
      measure.style.position = 'fixed';
      measure.style.top = '0';
      measure.style.left = '-9999px';
      measure.style.visibility = 'hidden';
      measure.style.pointerEvents = 'none';
      measure.style.whiteSpace = 'nowrap';
      measure.style.font = computedStyles.font;
      measure.style.fontFamily = computedStyles.fontFamily;
      measure.style.fontSize = computedStyles.fontSize;
      measure.style.fontWeight = computedStyles.fontWeight;
      measure.style.letterSpacing = computedStyles.letterSpacing;
      document.body.appendChild(measure);

      let maxWidth = 0;

      STICKY_SEARCH_HELPER_WORDS.forEach((helperWord) => {
        measure.textContent = helperWord;
        maxWidth = Math.max(maxWidth, Math.ceil(measure.getBoundingClientRect().width));
      });

      measure.remove();

      if (maxWidth > 0) {
        word.style.width = `${maxWidth}px`;
      }
    };

    const shouldShow = () =>
      root.getAttribute('aria-hidden') !== 'true' &&
      !root.inert &&
      !input.value;

    const canAnimate = () =>
      shouldShow() &&
      STICKY_SEARCH_HELPER_WORDS.length > 1 &&
      !reducedMotionQuery.matches;

    const animateChars = (
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
        setStickySearchHelperCharState(char, {
          opacity: targetOpacity,
          blurPx: targetBlurPx,
          translateYPx: targetTranslateYPx,
        });
      });
    };

    const resetCharTransitions = (chars) => {
      chars.forEach((char) => {
        char.style.transitionProperty = 'none';
        char.style.transitionDuration = '0ms';
        char.style.transitionDelay = '0ms';
        char.style.transitionTimingFunction = 'linear';
      });
    };

    const getRenderedWord = () => {
      if (word.childElementCount !== 1) {
        return '';
      }

      return normalizeText(word.textContent);
    };

    const scheduleCycle = (delayMs = STICKY_SEARCH_HELPER_IDLE_DELAY_MS) => {
      if (!canAnimate() || animating) {
        return;
      }

      if (timerId) {
        window.clearTimeout(timerId);
      }

      timerId = window.setTimeout(() => {
        timerId = 0;

        if (!canAnimate() || !word.isConnected) {
          return;
        }

        const currentWord =
          STICKY_SEARCH_HELPER_WORDS[wordIndex] || STICKY_SEARCH_HELPER_WORDS[0];
        const nextIndex = (wordIndex + 1) % STICKY_SEARCH_HELPER_WORDS.length;
        const nextWord = STICKY_SEARCH_HELPER_WORDS[nextIndex];
        const outgoingLayer = createStickySearchHelperLayer(currentWord, {
          opacity: 1,
          blurPx: 0,
          translateYPx: 0,
        });
        const incomingLayer = createStickySearchHelperLayer(nextWord, {
          opacity: 0,
          blurPx: STICKY_SEARCH_HELPER_BLUR_PX,
          translateYPx: STICKY_SEARCH_HELPER_IN_Y_PX,
        });
        const outgoingChars = Array.from(outgoingLayer.children);
        const incomingChars = Array.from(incomingLayer.children);

        wordIndex = nextIndex;
        animating = true;
        resetCharTransitions(outgoingChars);
        resetCharTransitions(incomingChars);
        word.replaceChildren(outgoingLayer, incomingLayer);
        void word.offsetWidth;

        frameId = window.requestAnimationFrame(() => {
          frameId = 0;

          if (!word.contains(outgoingLayer) || !word.contains(incomingLayer)) {
            return;
          }

          animateChars(outgoingChars, {
            durationMs: STICKY_SEARCH_HELPER_OUT_DURATION_MS,
            staggerMs: STICKY_SEARCH_HELPER_OUT_STAGGER_MS,
            easing: STICKY_SEARCH_HELPER_OUT_EASE,
            targetOpacity: 0,
            targetBlurPx: STICKY_SEARCH_HELPER_BLUR_PX,
            targetTranslateYPx: STICKY_SEARCH_HELPER_OUT_Y_PX,
          });

          animateChars(incomingChars, {
            durationMs: STICKY_SEARCH_HELPER_IN_DURATION_MS,
            staggerMs: STICKY_SEARCH_HELPER_IN_STAGGER_MS,
            delayMs: STICKY_SEARCH_HELPER_IN_DELAY_MS,
            easing: STICKY_SEARCH_HELPER_IN_EASE,
            targetOpacity: 1,
            targetBlurPx: 0,
            targetTranslateYPx: 0,
          });
        });

        const totalOutMs =
          STICKY_SEARCH_HELPER_OUT_DURATION_MS +
          Math.max(0, outgoingChars.length - 1) * STICKY_SEARCH_HELPER_OUT_STAGGER_MS;
        const totalInMs =
          STICKY_SEARCH_HELPER_IN_DELAY_MS +
          STICKY_SEARCH_HELPER_IN_DURATION_MS +
          Math.max(0, incomingChars.length - 1) * STICKY_SEARCH_HELPER_IN_STAGGER_MS;

        animationTimerId = window.setTimeout(() => {
          animationTimerId = 0;
          animating = false;
          renderWord(nextWord);
          scheduleCycle();
        }, Math.max(totalOutMs, totalInMs) + 40);
      }, delayMs);
    };

    const syncState = () => {
      const visible = shouldShow();
      root.dataset.helperVisible = visible ? 'true' : 'false';

      if (!visible) {
        clearTimers();
        animating = false;
        return;
      }

      const currentWord =
        STICKY_SEARCH_HELPER_WORDS[wordIndex] || STICKY_SEARCH_HELPER_WORDS[0];

      if (!animating && getRenderedWord() !== currentWord) {
        renderWord(currentWord);
      }

      if (reducedMotionQuery.matches) {
        clearTimers();
        animating = false;
        return;
      }

      if (!hasStarted) {
        hasStarted = true;
        scheduleCycle(STICKY_SEARCH_HELPER_INITIAL_DELAY_MS);
        return;
      }

      if (!animating && !timerId) {
        scheduleCycle(STICKY_SEARCH_HELPER_RESTART_DELAY_MS);
      }
    };

    renderWord();

    return {
      clearTimers,
      syncState,
      syncWidth,
    };
  };

  const syncStickySearchHelpers = ({ syncWidth = false } = {}) => {
    stickySearchHelperControllers.forEach((controller) => {
      if (syncWidth) {
        controller.syncWidth();
      }

      controller.syncState();
    });
  };

  const setupStickySearchHelpers = () => {
    stickySearchHelperControllers.forEach((controller) => {
      controller.clearTimers();
    });
    stickySearchHelperControllers.length = 0;

    [
      {
        root: refs.compactSearchShell,
        input: refs.compactSearchInput,
        word: refs.compactSearchHelperWord,
      },
      {
        root: refs.mobileSearchPanel,
        input: refs.mobileSearchInput,
        word: refs.mobileSearchHelperWord,
      },
    ].forEach((config) => {
      const controller = createStickySearchHelperController(config);

      if (controller) {
        stickySearchHelperControllers.push(controller);
      }
    });

    syncStickySearchHelpers({ syncWidth: true });
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
    const sentinelTop = sentinel.getBoundingClientRect().top;
    const headerBottom = getHeaderBottom();
    const releaseThreshold = headerBottom + STICKY_THRESHOLD_RELEASE_BUFFER_PX;

    state.controlsPastThreshold = state.controlsPastThreshold
      ? sentinelTop <= releaseThreshold
      : sentinelTop <= headerBottom;
  };

  const isStickyEligible = () =>
    Boolean(
      state.baseCollapsed &&
        state.controlsPastThreshold &&
        state.menuState?.isListViewVisible
    );

  const isStickyActive = () => isStickyEligible() && !state.suppressAutoSticky;

  const updateSearchControlsFor = (input, clearButton) => {
    if (
      !(input instanceof HTMLInputElement) ||
      !(clearButton instanceof HTMLButtonElement)
    ) {
      return;
    }

    const hasValue = input.value.length > 0;
    clearButton.classList.toggle('is-visible', hasValue);
    clearButton.setAttribute('aria-hidden', hasValue ? 'false' : 'true');
    clearButton.tabIndex = hasValue ? 0 : -1;
  };

  const updateCompactSearchControls = () => {
    updateSearchControlsFor(refs.compactSearchInput, refs.compactSearchClear);
    updateSearchControlsFor(refs.mobileSearchInput, refs.mobileSearchClear);
    syncStickySearchHelpers();
  };

  const syncMobileSearchToolWidth = ({ mobileSearchOpen = false, force = false } = {}) => {
    if (state.mobileSearchWidthSyncFrameId) {
      window.cancelAnimationFrame(state.mobileSearchWidthSyncFrameId);
      state.mobileSearchWidthSyncFrameId = 0;
    }

    if (!(refs.mobileSearchTool instanceof HTMLElement)) {
      return;
    }

    if (!isMobileViewport() || !mobileSearchOpen || !(brand instanceof HTMLElement)) {
      refs.mobileSearchTool.style.removeProperty('--mobile-search-open-width');
      state.mobileSearchLastAppliedWidth = 0;
      return;
    }

    const widthAnchor = brand.querySelector('.navbar__brand-icon') || brand;
    const brandRect = widthAnchor.getBoundingClientRect();
    const searchRect = refs.mobileSearchTool.getBoundingClientRect();

    if (!brandRect.width || !searchRect.right) {
      refs.mobileSearchTool.style.removeProperty('--mobile-search-open-width');
      state.mobileSearchLastAppliedWidth = 0;
      return;
    }

    const applyWidthFromGeometry = () => {
      const nextBrandRect = widthAnchor.getBoundingClientRect();
      const nextSearchRect = refs.mobileSearchTool.getBoundingClientRect();

      if (!nextBrandRect.width || !nextSearchRect.right) {
        return;
      }

      const targetWidth = Math.round(
        Math.max(
          MOBILE_SEARCH_OPEN_MIN_WIDTH,
          Math.min(
            MOBILE_SEARCH_OPEN_MAX_WIDTH,
            nextSearchRect.right - nextBrandRect.right - MOBILE_SEARCH_OPEN_GAP_PX
          )
        )
      );

      if (!force && state.mobileSearchLastAppliedWidth === targetWidth) {
        return;
      }

      refs.mobileSearchTool.style.setProperty('--mobile-search-open-width', `${targetWidth}px`);
      state.mobileSearchLastAppliedWidth = targetWidth;
    };

    applyWidthFromGeometry();

    if (!force) {
      return;
    }

    state.mobileSearchWidthSyncFrameId = window.requestAnimationFrame(() => {
      state.mobileSearchWidthSyncFrameId = window.requestAnimationFrame(() => {
        state.mobileSearchWidthSyncFrameId = 0;

        if (!state.stickySearchOpen || !isMobileViewport()) {
          return;
        }

        applyWidthFromGeometry();
      });
    });
  };

  const syncCompactSearchValue = () => {
    const nextValue = normalizeText(state.menuState?.searchQuery);

    if (
      refs.compactSearchInput instanceof HTMLInputElement &&
      refs.compactSearchInput.value !== nextValue
    ) {
      refs.compactSearchInput.value = nextValue;
    }

    if (
      refs.mobileSearchInput instanceof HTMLInputElement &&
      refs.mobileSearchInput.value !== nextValue
    ) {
      refs.mobileSearchInput.value = nextValue;
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

    const edgePaddingStart = 10;
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

    if (isMobileViewport() && state.stickySearchOpen) {
      return;
    }

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

    if (isMobileViewport() && state.stickySearchOpen) {
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

    syncMobileForcedCollapsedState();

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
    const isMobile = isMobileViewport();
    const isListViewVisible = state.menuState?.isListViewVisible !== false;
    const detailNavVisible = !(
      isMobile &&
      !isListViewVisible &&
      window.scrollY < DETAIL_NAV_REVEAL_SCROLL_Y
    );
    const desktopSearchOpen = searchOpen && !isMobile;
    const mobileSearchOpen = searchOpen && isMobile;
    const activeElement = document.activeElement;
    const activeInsideDesktopCompactSearch =
      refs.searchTool instanceof HTMLElement &&
      activeElement instanceof HTMLElement &&
      refs.searchTool.contains(activeElement);
    const activeInsideMobileCompactSearch =
      refs.mobileSearchTool instanceof HTMLElement &&
      activeElement instanceof HTMLElement &&
      refs.mobileSearchTool.contains(activeElement);
    const activeInsideCompactSearch =
      activeInsideDesktopCompactSearch || activeInsideMobileCompactSearch;
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

    syncMobileSearchToolWidth({
      mobileSearchOpen,
      force: mobileSearchOpen && mobileSearchOpen !== state.lastStickySearchOpen,
    });

    header.dataset.menuStickyAvailability = stickyEligible ? 'visible' : 'hidden';
    header.dataset.menuStickyMode = stickyActive ? 'sticky' : 'default';
    header.dataset.menuStickySearch = searchOpen ? 'open' : 'closed';
    header.dataset.menuStickyManual = state.suppressAutoSticky ? 'true' : 'false';
    header.dataset.menuDetailNav = detailNavVisible ? 'visible' : 'hidden';

    if (navbar instanceof HTMLElement) {
      navbar.inert = !detailNavVisible;
    }

    if (!detailNavVisible || !isMobile || searchOpen) {
      setMobileMenuOpen(false);
    } else {
      setMobileMenuOpen(state.mobileMenuOpen);
    }
    const mobileActionsInteractive = isMobile && detailNavVisible;

    if (refs.mobileActions instanceof HTMLElement) {
      refs.mobileActions.inert = !mobileActionsInteractive;
    }

    if (refs.mobileSearchButton instanceof HTMLButtonElement) {
      const mobileSearchVisible = mobileActionsInteractive && stickyActive;
      refs.mobileSearchButton.tabIndex = mobileSearchVisible ? 0 : -1;
      refs.mobileSearchButton.setAttribute('aria-hidden', mobileSearchVisible ? 'false' : 'true');
      refs.mobileSearchButton.setAttribute(
        'aria-label',
        mobileSearchOpen ? 'Cerrar búsqueda en el menú' : 'Buscar en el menú'
      );
      refs.mobileSearchButton.setAttribute('aria-expanded', mobileSearchOpen ? 'true' : 'false');
      refs.mobileSearchButton.setAttribute('aria-pressed', mobileSearchOpen ? 'true' : 'false');
    }

    if (refs.mobileSearchTool instanceof HTMLElement) {
      const mobileSearchVisible = mobileActionsInteractive && stickyActive;
      refs.mobileSearchTool.setAttribute('aria-hidden', mobileSearchVisible ? 'false' : 'true');
      refs.mobileSearchTool.inert = !mobileSearchVisible;
    }

    if (refs.mobileFilterButton instanceof HTMLButtonElement) {
      refs.mobileFilterButton.disabled = !mobileSearchOpen;
      refs.mobileFilterButton.tabIndex = mobileSearchOpen ? 0 : -1;
      refs.mobileFilterButton.setAttribute(
        'aria-hidden',
        mobileSearchOpen ? 'false' : 'true'
      );
      refs.mobileFilterButton.setAttribute(
        'aria-expanded',
        state.menuState?.isFilterModalOpen ? 'true' : 'false'
      );
    }

    if (refs.mobileAccountButton instanceof HTMLButtonElement) {
      refs.mobileAccountButton.tabIndex = mobileActionsInteractive ? 0 : -1;
      refs.mobileAccountButton.setAttribute(
        'aria-disabled',
        mobileActionsInteractive ? 'false' : 'true'
      );
      refs.mobileAccountButton.setAttribute(
        'aria-expanded',
        state.menuState?.isAccountModalOpen ? 'true' : 'false'
      );
    }

    refs.chevronButton.hidden = isMobile;
    refs.chevronButton.setAttribute('aria-hidden', isMobile ? 'true' : 'false');
    refs.chevronButton.setAttribute(
      'aria-label',
      stickyActive
        ? 'Mostrar navbar colapsado normal'
        : 'Mostrar navegación compacta del menú'
    );
    refs.chevronButton.setAttribute('aria-pressed', stickyActive ? 'true' : 'false');
    refs.chevronButton.tabIndex = !isMobile && stickyEligible ? 0 : -1;

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
      refs.tools.inert = !stickyActive || isMobile;
    }

    syncCompactSearchValue();
    renderCompactTabs();
    positionCompactPill();

    if (!searchOpen && activeInsideCompactSearch) {
      if (isMobile && refs.mobileSearchButton instanceof HTMLButtonElement) {
        refs.mobileSearchButton.focus();
      } else if (refs.searchButton instanceof HTMLButtonElement) {
        refs.searchButton.focus();
      }
    }

    if (!stickyActive && (activeInsideSticky || activeInsideCompactSearch)) {
      if (!isMobile && stickyEligible && refs.chevronButton instanceof HTMLButtonElement) {
        refs.chevronButton.focus();
      } else if (activeElement instanceof HTMLElement) {
        activeElement.blur();
      }
    }

    if (
      !detailNavVisible &&
      activeElement instanceof HTMLElement &&
      navbar instanceof HTMLElement &&
      navbar.contains(activeElement)
    ) {
      activeElement.blur();
    }

    if (
      !mobileActionsInteractive &&
      activeElement instanceof HTMLElement &&
      refs.mobileActions instanceof HTMLElement &&
      refs.mobileActions.contains(activeElement)
    ) {
      activeElement.blur();
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
      refs.compactSearchShell.setAttribute('aria-hidden', desktopSearchOpen ? 'false' : 'true');
      refs.compactSearchShell.inert = !desktopSearchOpen;
    }

    if (refs.mobileSearchPanel instanceof HTMLElement) {
      refs.mobileSearchPanel.setAttribute('aria-hidden', mobileSearchOpen ? 'false' : 'true');
      refs.mobileSearchPanel.inert = !mobileSearchOpen;
    }

    refs.tabsButtons.forEach((button) => {
      button.tabIndex = stickyActive && !searchOpen && button.classList.contains('is-active')
        ? 0
        : -1;
    });

    if (refs.compactSearchInput instanceof HTMLInputElement) {
      refs.compactSearchInput.tabIndex = desktopSearchOpen ? 0 : -1;
    }

    if (refs.compactSearchClear instanceof HTMLButtonElement && !desktopSearchOpen) {
      refs.compactSearchClear.tabIndex = -1;
    }

    if (refs.mobileSearchInput instanceof HTMLInputElement) {
      refs.mobileSearchInput.tabIndex = mobileSearchOpen ? 0 : -1;
    }

    if (refs.mobileSearchClear instanceof HTMLButtonElement && !mobileSearchOpen) {
      refs.mobileSearchClear.tabIndex = -1;
    }

    links.querySelectorAll('a').forEach((link) => {
      link.tabIndex = stickyActive || isMobile ? -1 : 0;
    });

    if (refs.ctaButton instanceof HTMLAnchorElement) {
      const hideCta = stickyActive || isMobile;
      refs.ctaButton.setAttribute('aria-hidden', hideCta ? 'true' : 'false');
      refs.ctaButton.tabIndex = hideCta ? -1 : 0;
    }

    if (searchOpen && state.shouldFocusCompactSearch) {
      state.shouldFocusCompactSearch = false;
      window.requestAnimationFrame(() => {
        const targetInput =
          isMobile && refs.mobileSearchInput instanceof HTMLInputElement
            ? refs.mobileSearchInput
            : refs.compactSearchInput;
        targetInput?.focus();
        targetInput?.select();
      });
    }

    syncStickySearchHelpers();
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
      syncStickySearchHelpers({ syncWidth: true });
      scheduleTabsViewportSync({
        revealActive: true,
        immediate: true,
      });
    }, { passive: true });
    window.addEventListener('orientationchange', () => {
      observeThreshold();
      scheduleSync();
      positionCompactPill();
      syncStickySearchHelpers({ syncWidth: true });
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
        syncStickySearchHelpers({ syncWidth: true });
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

  const handleReducedMotionChange = () => {
    syncStickySearchHelpers();
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
    if (!resolveNavbarNodes()) {
      throw new Error('[menu-page-navbar] Estructura del navbar no disponible.');
    }

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
      <span class="navbar__sticky-search-input-shell">
        <span class="navbar__sticky-search-helper" aria-hidden="true">
          <span class="navbar__sticky-search-helper-prefix">Busca por</span>
          <span class="navbar__sticky-search-helper-word"></span>
        </span>
        <input
          class="navbar__menu-search-input"
          id="${SEARCH_INPUT_ID}"
          type="search"
          aria-label="Buscar en el menú"
          autocomplete="off"
          spellcheck="false"
          enterkeyhint="search">
      </span>
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

    const mobileActions = document.createElement('div');
    mobileActions.className = 'navbar__mobile-actions';

    const mobileSearchTool = document.createElement('div');
    mobileSearchTool.className = 'navbar__mobile-search-tool navbar__mobile-action--search';
    const mobileSearchButton = createMenuToolsButton(
      'mobile-search',
      'Buscar en el menú',
      'search'
    );
    mobileSearchButton.classList.add('navbar__mobile-action', 'navbar__mobile-search-trigger');
    mobileSearchTool.appendChild(mobileSearchButton);

    const mobileSearchPanel = document.createElement('label');
    mobileSearchPanel.className = 'navbar__mobile-search-panel';
    mobileSearchPanel.setAttribute('for', MOBILE_SEARCH_INPUT_ID);
    mobileSearchPanel.innerHTML = `
      <span class="navbar__sticky-search-input-shell">
        <span class="navbar__sticky-search-helper" aria-hidden="true">
          <span class="navbar__sticky-search-helper-prefix">Busca por</span>
          <span class="navbar__sticky-search-helper-word"></span>
        </span>
        <input
          class="navbar__mobile-search-input"
          id="${MOBILE_SEARCH_INPUT_ID}"
          type="search"
          aria-label="Buscar en el menú"
          autocomplete="off"
          spellcheck="false"
          enterkeyhint="search">
      </span>
      <button
        class="navbar__mobile-search-filter"
        type="button"
        aria-label="Filtros del menú"
        aria-controls="menu-filter-modal"
        aria-expanded="false"
        tabindex="-1">
        ${iconMarkup('filter')}
      </button>
    `;
    mobileSearchTool.appendChild(mobileSearchPanel);
    mobileActions.appendChild(mobileSearchTool);

    const mobileAccountButton = createMenuToolsButton(
      'mobile-account',
      'Cuenta del restaurante',
      'account'
    );
    mobileAccountButton.classList.add('navbar__mobile-action', 'navbar__mobile-action--account');
    mobileAccountButton.setAttribute('data-menu-cart-target', '');
    mobileActions.appendChild(mobileAccountButton);

    const mobileMenuButton = createMenuToolsButton(
      'mobile-burger',
      'Abrir navegación principal',
      'burger-animated'
    );
    mobileMenuButton.classList.add('navbar__mobile-action', 'navbar__mobile-action--burger');
    mobileMenuButton.setAttribute('aria-controls', MOBILE_MENU_PANEL_ID);
    mobileActions.appendChild(mobileMenuButton);
    actions.appendChild(mobileActions);

    const mobileMenuPanel = document.createElement('div');
    mobileMenuPanel.className = 'navbar__mobile-menu-panel';
    mobileMenuPanel.id = MOBILE_MENU_PANEL_ID;
    mobileMenuPanel.setAttribute('aria-hidden', 'true');
    navInner.appendChild(mobileMenuPanel);

    refs.searchTool = searchTool;
    refs.searchButton = searchButton;
    refs.filterButton = filterButton;
    refs.tools = tools;
    refs.mobileActions = mobileActions;
    refs.mobileSearchTool = mobileSearchTool;
    refs.mobileSearchPanel = mobileSearchPanel;
    refs.mobileSearchButton = mobileSearchButton;
    refs.mobileSearchHelper = mobileSearchPanel.querySelector('.navbar__sticky-search-helper');
    refs.mobileSearchHelperWord = mobileSearchPanel.querySelector('.navbar__sticky-search-helper-word');
    refs.mobileSearchInput = mobileSearchPanel.querySelector('.navbar__mobile-search-input');
    refs.mobileSearchClear = mobileSearchPanel.querySelector('.navbar__mobile-search-clear');
    refs.mobileFilterButton = mobileSearchPanel.querySelector('.navbar__mobile-search-filter');
    refs.mobileAccountButton = mobileAccountButton;
    refs.mobileMenuButton = mobileMenuButton;
    refs.mobileMenuPanel = mobileMenuPanel;
    refs.compactSearchShell = searchShell;
    refs.compactSearchHelper = searchShell.querySelector('.navbar__sticky-search-helper');
    refs.compactSearchHelperWord = searchShell.querySelector('.navbar__sticky-search-helper-word');
    refs.compactSearchInput = searchShell.querySelector('.navbar__menu-search-input');
    refs.compactSearchClear = searchShell.querySelector('.navbar__menu-search-clear');
    setupStickySearchHelpers();
    buildMobileMenuLinks();
    setMobileMenuOpen(false);
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

    mobileSearchButton.addEventListener('click', (event) => {
      event.preventDefault();

      if (!isStickyActive()) {
        return;
      }

      state.stickySearchOpen = !state.stickySearchOpen;
      state.shouldFocusCompactSearch = state.stickySearchOpen;
      applyUiState();
    });

    if (refs.mobileFilterButton instanceof HTMLButtonElement) {
      refs.mobileFilterButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!state.stickySearchOpen || !isMobileViewport()) {
          return;
        }

        window.FigataMenuPage?.toggleFilterModal?.();
      });
    }

    mobileAccountButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (!isMobileViewport()) {
        return;
      }

      if (state.mobileMenuOpen) {
        setMobileMenuOpen(false);
      }

      window.FigataMenuPage?.toggleAccountModal?.();
    });

    mobileMenuButton.addEventListener('click', (event) => {
      event.preventDefault();

      if (!isMobileViewport()) {
        return;
      }

      setMobileMenuOpen(!state.mobileMenuOpen);
    });

    document.addEventListener('pointerdown', (event) => {
      if (!state.mobileMenuOpen) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      const clickInsidePanel =
        refs.mobileMenuPanel instanceof HTMLElement &&
        refs.mobileMenuPanel.contains(target);
      const clickOnButton =
        refs.mobileMenuButton instanceof HTMLButtonElement &&
        refs.mobileMenuButton.contains(target);

      if (!clickInsidePanel && !clickOnButton) {
        setMobileMenuOpen(false);
      }
    });

    document.addEventListener('pointerdown', (event) => {
      if (!state.stickySearchOpen || !isMobileViewport()) {
        return;
      }

      const target = event.target;

      if (
        !(target instanceof Node) ||
        !(refs.mobileSearchTool instanceof HTMLElement)
      ) {
        return;
      }

      if (!refs.mobileSearchTool.contains(target)) {
        state.stickySearchOpen = false;
        applyUiState();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && state.mobileMenuOpen) {
        setMobileMenuOpen(false, { restoreFocus: true });
        return;
      }

      if (
        event.key === 'Escape' &&
        state.stickySearchOpen &&
        isMobileViewport()
      ) {
        const inputHasFocus =
          refs.mobileSearchInput instanceof HTMLInputElement &&
          document.activeElement === refs.mobileSearchInput;
        if (inputHasFocus) {
          return;
        }

        state.stickySearchOpen = false;
        refs.mobileSearchButton?.focus();
        applyUiState();
      }
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

      refs.compactSearchInput.addEventListener('focus', () => {
        syncStickySearchHelpers();
      });

      refs.compactSearchInput.addEventListener('blur', () => {
        syncStickySearchHelpers();
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

    if (refs.mobileSearchInput instanceof HTMLInputElement) {
      refs.mobileSearchInput.addEventListener('input', () => {
        updateCompactSearchControls();
        window.FigataMenuPage?.setSearchQuery?.(refs.mobileSearchInput.value);
      });

      refs.mobileSearchInput.addEventListener('search', () => {
        window.FigataMenuPage?.setSearchQuery?.(refs.mobileSearchInput.value);
      });

      refs.mobileSearchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          if (refs.mobileSearchInput.value) {
            refs.mobileSearchInput.value = '';
            updateCompactSearchControls();
            window.FigataMenuPage?.setSearchQuery?.('');
            return;
          }

          state.stickySearchOpen = false;
          refs.mobileSearchButton?.focus();
          applyUiState();
        }
      });

      refs.mobileSearchInput.addEventListener('focus', () => {
        syncStickySearchHelpers();
      });

      refs.mobileSearchInput.addEventListener('blur', () => {
        syncStickySearchHelpers();
      });
    }

    if (refs.mobileSearchClear instanceof HTMLButtonElement) {
      refs.mobileSearchClear.addEventListener('click', (event) => {
        event.preventDefault();
        if (!(refs.mobileSearchInput instanceof HTMLInputElement)) {
          return;
        }

        refs.mobileSearchInput.value = '';
        updateCompactSearchControls();
        window.FigataMenuPage?.setSearchQuery?.('');
        refs.mobileSearchInput.focus();
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

      if (typeof reducedMotionQuery.addEventListener === 'function') {
        reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
      } else if (typeof reducedMotionQuery.addListener === 'function') {
        reducedMotionQuery.addListener(handleReducedMotionChange);
      }

      window.addEventListener('figata:menu-page-state-change', (event) => {
        handleMenuStateChange(event.detail);
      });

      handleMenuStateChange(state.menuState);
      window.dispatchEvent(new Event('figata:menu-page-navbar-ready'));

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
