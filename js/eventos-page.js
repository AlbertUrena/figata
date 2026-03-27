(() => {
  const root = document.documentElement;
  const publicPaths = window.FigataPublicPaths || null;
  const MOBILE_BREAKPOINT = 820;
  const MOBILE_MENU_PANEL_ID = 'navbar-mobile-menu-panel';
  const MOBILE_MENU_CLOSE_COMMIT_MS = 460;
  const FORCE_COLLAPSED_MOBILE_ATTR = 'data-nav-force-collapsed-mobile';
  const BURGER_ANIMATION_MS = 240;
  const PHOTO_TOUR_CLOSE_MS = 430;
  const PHOTO_VIEWER_CLOSE_MS = 300;
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const MOBILE_MENU_ENTRY_BY_KEY = {
    menu: {
      subtitle: 'Carta y favoritos',
      thumbSrc: 'assets/navbar/menu-thumb.webp',
    },
    eventos: {
      subtitle: 'Pizza Party by Figata',
      thumbSrc: 'assets/eventos/thumb.webp',
      badgeLabel: 'NEW',
    },
    nosotros: {
      subtitle: 'Nuestra historia real',
      thumbSrc: 'assets/navbar/nosotros-thumb.webp',
    },
    ubicacion: {
      subtitle: 'Cómo llegar rápido',
      thumbSrc: 'assets/navbar/ubicacion-thumb.webp',
    },
    contacto: {
      subtitle: 'Reserva o escríbenos',
      thumbSrc: 'assets/navbar/contacto-thumb.webp',
    },
  };
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
  const EVENTOS_PHOTO_LIBRARY = Object.freeze({
    corito0: Object.freeze({
      src: 'assets/eventos/collage/corito/corito-0.webp',
      alt: 'Pizza Party by Figata frente al mar con montaje completo',
      caption: 'Playa y horno portátil en una misma escena.',
    }),
    corito1: Object.freeze({
      src: 'assets/eventos/collage/corito/corito-1.webp',
      alt: 'Montaje Pizza Party by Figata en playa',
      caption: 'Ritmo de servicio frente al mar.',
    }),
    corito2: Object.freeze({
      src: 'assets/eventos/collage/corito/corito-2.webp',
      alt: 'Servicio Pizza Party by Figata al atardecer',
      caption: 'Una experiencia social con ritmo de celebración.',
    }),
    corito3: Object.freeze({
      src: 'assets/eventos/collage/corito/corito-3.webp',
      alt: 'Invitados compartiendo en Pizza Party by Figata',
      caption: 'Celebración con salida continua de pizzas.',
    }),
    corito4: Object.freeze({
      src: 'assets/eventos/collage/corito/corito-4.webp',
      alt: 'Equipo Figata preparando pizzas en vivo para invitados',
      caption: 'Montaje operativo y servicio en vivo.',
    }),
    corito5: Object.freeze({
      src: 'assets/eventos/collage/corito/corito-5.webp',
      alt: 'Invitados compartiendo pizza recién salida del horno',
      caption: 'Servicio pensado para conversar y compartir.',
    }),
    corito6: Object.freeze({
      src: 'assets/eventos/collage/corito/corito-6.webp',
      alt: 'Pizza Party by Figata en encuentro de playa',
      caption: 'Cocina en vivo con ambiente relajado.',
    }),
    corito7: Object.freeze({
      src: 'assets/eventos/collage/corito/corito-7.webp',
      alt: 'Invitados disfrutando Pizza Party by Figata en evento',
      caption: 'Ambiente cálido y salida constante de pizzas.',
    }),
    corito8: Object.freeze({
      src: 'assets/eventos/collage/corito/corito-8.webp',
      alt: 'Servicio de pizza en vivo en evento de playa',
      caption: 'Experiencia artesanal para grupos grandes.',
    }),
    cumple0: Object.freeze({
      src: 'assets/eventos/collage/cumple/cumple-0.webp',
      alt: 'Celebración de cumpleaños con Pizza Party by Figata',
      caption: 'Formato adaptable para celebraciones privadas.',
    }),
    cumple1: Object.freeze({
      src: 'assets/eventos/collage/cumple/cumple-1.webp',
      alt: 'Cumpleaños con pizzas servidas al momento',
      caption: 'Servicio en vivo para compartir con invitados.',
    }),
    cumple2: Object.freeze({
      src: 'assets/eventos/collage/cumple/cumple-2.webp',
      alt: 'Encuentro de cumpleaños con experiencia Pizza Party',
      caption: 'Una sola propuesta, adaptada a tu ocasión.',
    }),
    cumple3: Object.freeze({
      src: 'assets/eventos/collage/cumple/cumple-3.webp',
      alt: 'Celebración privada con hornos portátiles Figata',
      caption: 'Montaje portátil y ritmo de servicio.',
    }),
    cumple4: Object.freeze({
      src: 'assets/eventos/collage/cumple/cumple-4.webp',
      alt: 'Mesa de invitados en cumpleaños con pizza al momento',
      caption: 'Experiencia artesanal para grupos.',
    }),
    cumple5: Object.freeze({
      src: 'assets/eventos/collage/cumple/cumple-5.webp',
      alt: 'Pizza Party by Figata durante cumpleaños familiar',
      caption: 'Celebración dinámica con pizzas recién horneadas.',
    }),
    cumple6: Object.freeze({
      src: 'assets/eventos/collage/cumple/cumple-6.webp',
      alt: 'Invitados disfrutando menú en cumpleaños',
      caption: 'Formato cálido, visual y fácil de compartir.',
    }),
    cumple7: Object.freeze({
      src: 'assets/eventos/collage/cumple/cumple-7.webp',
      alt: 'Evento familiar con pizzas servidas en vivo',
      caption: 'Evento familiar con sabor y dinamismo.',
    }),
    editorialMargherita0: Object.freeze({
      src: 'assets/menu/editorial/margherita-slide-0.webp',
      alt: 'Pizza Margherita recién horneada',
      caption: 'Pizzas calientes saliendo al momento.',
    }),
    editorialAperol1: Object.freeze({
      src: 'assets/menu/editorial/aperol-spritz-slide-1.webp',
      alt: 'Aperitivo servido en mesa de celebración',
      caption: 'Detalle editorial para un ambiente premium.',
    }),
    editorialNegroni0: Object.freeze({
      src: 'assets/menu/editorial/negroni-slide-0.webp',
      alt: 'Coctel servido para evento social',
      caption: 'Servicio curado y atmósfera social.',
    }),
    editorialMarinara0: Object.freeze({
      src: 'assets/menu/editorial/marinara-slide-0.webp',
      alt: 'Pizza recién salida del horno de leña',
      caption: 'Sabor y técnica en cada salida.',
    }),
    editorialSalsiccia0: Object.freeze({
      src: 'assets/menu/editorial/salsiccia-vino-e-miele-slide-0.webp',
      alt: 'Mesa con propuesta artesanal Figata',
      caption: 'Calidad gastronómica con sello Figata.',
    }),
    entradaTagliere: Object.freeze({
      src: 'assets/menu/entradas/tagliere-misto.webp',
      alt: 'Tabla de entrada para compartir',
      caption: 'Opciones para abrir el servicio con estilo.',
    }),
    entradaBruschetta: Object.freeze({
      src: 'assets/menu/entradas/bruschetta.webp',
      alt: 'Bruschetta artesanal Figata',
      caption: 'Sabores pensados para encuentros sociales.',
    }),
    entradaFocaccia: Object.freeze({
      src: 'assets/menu/entradas/focaccia.webp',
      alt: 'Focaccia recién preparada',
      caption: 'Montaje versátil para diferentes tipos de evento.',
    }),
    pizzaMargherita: Object.freeze({
      src: 'assets/menu/pizzas/clasica/margherita.webp',
      alt: 'Pizza Margherita clásica Figata',
      caption: 'Salida continua de pizzas al momento.',
    }),
    pizzaFigata: Object.freeze({
      src: 'assets/menu/pizzas/clasica/pizza-figata.webp',
      alt: 'Pizza especial Figata para evento',
      caption: 'Recetas de la casa para grupos.',
    }),
    pizzaBoscaiola: Object.freeze({
      src: 'assets/menu/pizzas/autor/boscaiola.webp',
      alt: 'Pizza autor Boscaiola',
      caption: 'Propuesta de autor para enriquecer la experiencia.',
    }),
    pizzaVulcano: Object.freeze({
      src: 'assets/menu/pizzas/autor/vulcano.webp',
      alt: 'Pizza autor Vulcano',
      caption: 'Servicio en vivo con impacto visual.',
    }),
    bebidaSangria: Object.freeze({
      src: 'assets/menu/bebidas/sangria.webp',
      alt: 'Sangría para acompañar el evento',
      caption: 'Acompañamientos que elevan el encuentro.',
    }),
    bebidaGinTonic: Object.freeze({
      src: 'assets/menu/bebidas/gin-tonic.webp',
      alt: 'Gin tonic en montaje de evento',
      caption: 'Opciones de bebida para eventos corporativos.',
    }),
    postreTiramisu: Object.freeze({
      src: 'assets/menu/postres/tiramisu.webp',
      alt: 'Tiramisú artesanal Figata',
      caption: 'Cierre dulce para celebraciones memorables.',
    }),
    productoCiabatta: Object.freeze({
      src: 'assets/menu/editorial/ciabatta-slide-5.webp',
      alt: 'Mesa social con propuesta gastronómica Figata',
      caption: 'Formato visual y social para cualquier ocasión.',
    }),
  });
  const EVENTOS_PHOTO_TOUR_CATEGORIES = Object.freeze([
    Object.freeze({
      id: 'playa',
      label: 'Playa',
      photos: Object.freeze([
        'corito0',
        'corito1',
        'corito2',
        'corito3',
        'corito4',
        'corito5',
        'corito6',
        'corito7',
        'corito8',
      ]),
    }),
    Object.freeze({
      id: 'cumpleanos',
      label: 'Cumpleaños',
      photos: Object.freeze([
        'cumple7',
        'cumple0',
        'cumple1',
        'cumple2',
        'cumple3',
        'cumple4',
        'cumple5',
        'cumple6',
      ]),
    }),
    Object.freeze({
      id: 'boda',
      label: 'Boda',
      photos: Object.freeze(['entradaTagliere', 'editorialAperol1', 'editorialNegroni0']),
    }),
    Object.freeze({
      id: 'reunion-familiar',
      label: 'Reunión familiar',
      photos: Object.freeze(['entradaBruschetta', 'pizzaMargherita', 'postreTiramisu']),
    }),
    Object.freeze({
      id: 'corporativo',
      label: 'Corporativo',
      photos: Object.freeze(['productoCiabatta', 'bebidaGinTonic', 'pizzaFigata']),
    }),
    Object.freeze({
      id: 'montaje',
      label: 'Montaje',
      photos: Object.freeze(['entradaFocaccia', 'pizzaBoscaiola', 'bebidaSangria']),
    }),
    Object.freeze({
      id: 'pizza-en-vivo',
      label: 'Pizza en vivo',
      photos: Object.freeze(['pizzaVulcano', 'editorialMarinara0', 'editorialSalsiccia0']),
    }),
  ]);
  const QUOTE_PIZZA_PRICE_DOP = 1000;
  const QUOTE_BASE_SERVICE_FEE_DOP = 5000;
  const QUOTE_SERVICE_FEE_WAIVER_THRESHOLD = 30;
  const QUOTE_SERVICE_RATE = 0.1;
  const QUOTE_MAX_VARIETIES = 5;
  const QUOTE_DEFAULT_SELECTION_COUNT = 5;
  const QUOTE_MIN_TOTAL_PIZZAS = 20;
  const QUOTE_DEFAULT_TOTAL_PIZZAS = 20;
  const MENU_CART_PULSE_CLASS = 'is-menu-cart-pulse';
  const QUOTE_STEPPER_PULSE_MS = 320;
  const QUOTE_SHUFFLE_PULSE_CLASS = 'is-quote-shuffle-pulse';
  const QUOTE_SHUFFLE_PULSE_MS = 560;
  const QUOTE_SHUFFLE_BUSY_CLASS = 'is-shuffling';
  const QUOTE_VIEW_TRANSITION_ROOT_ATTR = 'data-eventos-quote-view-transition';
  const QUOTE_VIEW_TRANSITION_ROOT_ACTIVE = 'shuffle';
  const QUOTE_VIEW_TRANSITION_CARD_NAME_PREFIX = 'eventos-quote-track-';
  const QUOTE_VIEW_TRANSITION_MEDIA_SUFFIX = '-media';
  const QUOTE_VIEW_TRANSITION_TITLE_SUFFIX = '-title';
  const WHATSAPP_QUOTE_PHONE = '18095245117';
  const QUOTE_CURRENCY_FORMATTER = new Intl.NumberFormat('es-DO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const refs = {
    header: null,
    navbar: null,
    navInner: null,
    brand: null,
    links: null,
    actions: null,
    mobileMenuButton: null,
    mobileMenuPanel: null,
    mobileMenuLinks: [],
    collageOpenButtons: [],
    collageMoreCount: null,
    photoTour: null,
    photoTourSheet: null,
    photoTourHeader: null,
    photoTourCloseButton: null,
    photoTourCategories: null,
    photoTourContent: null,
    photoTourCategoryButtons: [],
    photoTourSections: [],
    photoViewer: null,
    photoViewerCloseButton: null,
    photoViewerSection: null,
    photoViewerCounter: null,
    photoViewerStage: null,
    photoViewerTrack: null,
    quoteRoot: null,
    quoteTotalValue: null,
    quoteTotalMinusButton: null,
    quoteTotalPlusButton: null,
    quoteVarietyOpenButton: null,
    quoteVarietyRandomButton: null,
    quoteVarietySelectionCounter: null,
    quoteSelectedGrid: null,
    quoteSelectedEmpty: null,
    quoteSummaryPizzasLine: null,
    quoteSummarySubtotal: null,
    quoteSummaryBaseFee: null,
    quoteSummaryServiceFee: null,
    quoteSummaryTotal: null,
    quoteTotalInfoToggle: null,
    quoteMenuInfoToggle: null,
    quoteSummaryInfoToggle: null,
    quoteWhatsappButton: null,
    quoteWhatsappHint: null,
    varietyModal: null,
    varietyModalCloseButtons: [],
    varietyModalClearButton: null,
    varietyModalDoneButton: null,
    varietyModalCounter: null,
    varietyModalSearchRoot: null,
    varietyModalSearchInput: null,
    varietyModalSearchClear: null,
    varietyModalGrid: null,
  };

  const state = {
    mobileMenuOpen: false,
    mobileMenuCloseCommitTimerId: 0,
    burgerAnimationFrameId: 0,
    burgerAnimationProgress: 0,
    photoTourOpen: false,
    activePhotoCategoryId: '',
    photoTourCloseTimerId: 0,
    photoViewerOpen: false,
    photoViewerCatalog: [],
    photoViewerItems: [],
    photoViewerIndex: 0,
    photoViewerScrollFrameId: 0,
    photoViewerCloseTimerId: 0,
    quoteVarietyModalOpen: false,
    quoteTotalPizzas: QUOTE_DEFAULT_TOTAL_PIZZAS,
    quoteVarieties: [],
    quoteExcludedVarieties: [],
    quoteVarietyById: Object.create(null),
    quoteDefaultPreviewVarietyIds: [],
    quoteSelectedVarietyIds: [],
    quoteHasUserSelection: false,
    quoteVarietySearchQuery: '',
    quoteLoadError: '',
    quoteShuffleAnimating: false,
  };
  const quoteStepperPulseTimeoutByTarget = new WeakMap();
  let quoteRandomPulseTimeoutId = 0;
  let quoteShuffleTransitionTask = Promise.resolve();
  let quoteVarietyCardTrackSequence = 0;

  const normalizeText = (value) => String(value || '').trim();
  const toLookupKey = (value) =>
    normalizeText(value)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  const normalizeSearchQueryValue = (value) => toLookupKey(value).replace(/\s+/g, ' ').trim();
  const clamp01 = (value) => Math.min(1, Math.max(0, value));
  const formatDop = (value) => `$${QUOTE_CURRENCY_FORMATTER.format(Math.max(0, Math.round(value)))}`;
  const lerp = (start, end, progress) => start + (end - start) * progress;
  const easeInOutCubic = (value) =>
    value < 0.5
      ? 4 * value * value * value
      : 1 - Math.pow(-2 * value + 2, 3) / 2;
  const isMobileViewport = () =>
    (window.innerWidth || root.clientWidth || 0) <= MOBILE_BREAKPOINT;
  const getAllUniquePhotoKeys = () => {
    const seen = new Set();
    EVENTOS_PHOTO_TOUR_CATEGORIES.forEach((category) => {
      category.photos.forEach((photoKey) => {
        if (EVENTOS_PHOTO_LIBRARY[photoKey]) {
          seen.add(photoKey);
        }
      });
    });
    return Array.from(seen);
  };
  const resolvePhotoItem = (photoKey) => EVENTOS_PHOTO_LIBRARY[photoKey] || null;
  const getPhotoTourScroller = () =>
    refs.photoTourSheet instanceof HTMLElement
      ? refs.photoTourSheet
      : refs.photoTourContent instanceof HTMLElement
        ? refs.photoTourContent
        : null;

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

  const iconMarkup = (type) => {
    if (type === 'chevron-card') {
      return `
        <svg viewBox="0 0 9 14" focusable="false" aria-hidden="true">
          <path d="M1.2 1.2L6.9 7L1.2 12.8" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
      `;
    }

    return `
      <svg class="navbar__burger-icon" viewBox="0 0 64 64" focusable="false" aria-hidden="true">
        <path class="navbar__burger-line navbar__burger-line--top" d="M7 15h51"></path>
        <path class="navbar__burger-line navbar__burger-line--mid" d="M7 32h43"></path>
        <path class="navbar__burger-line navbar__burger-line--bot" d="M7 49h51"></path>
      </svg>
    `;
  };

  const createMenuToolsButton = (modifier, label) => {
    const button = document.createElement('button');
    button.className = `navbar__menu-tool navbar__menu-tool--${modifier}`;
    button.type = 'button';
    button.setAttribute('aria-label', label);
    button.innerHTML = iconMarkup('burger-animated');
    return button;
  };

  const resolveNavbarNodes = () => {
    const header = document.querySelector('.site-header[data-eventos-burger-nav]');

    if (!(header instanceof HTMLElement) || header.dataset.eventosBurgerReady === 'true') {
      return false;
    }

    const navbar = header.querySelector('.navbar');
    const navInner = navbar?.querySelector('.navbar__inner');
    const brand = navInner?.querySelector('.navbar__brand');
    const links = navInner?.querySelector('.navbar__links');
    const actions = navInner?.querySelector('.navbar__actions');

    if (
      !(navbar instanceof HTMLElement) ||
      !(navInner instanceof HTMLElement) ||
      !(brand instanceof HTMLElement) ||
      !(links instanceof HTMLElement) ||
      !(actions instanceof HTMLElement)
    ) {
      return false;
    }

    refs.header = header;
    refs.navbar = navbar;
    refs.navInner = navInner;
    refs.brand = brand;
    refs.links = links;
    refs.actions = actions;
    return true;
  };

  const ensureNavbarChrome = () => {
    if (!resolveNavbarNodes()) {
      return false;
    }

    refs.navbar.classList.add('navbar--menu-route');

    const existingCta = refs.actions.querySelector('.cta-button--nav');
    if (existingCta) {
      existingCta.remove();
    }

    let brandSlot = refs.navInner.querySelector('.navbar__brand-slot');
    if (!(brandSlot instanceof HTMLElement)) {
      brandSlot = document.createElement('div');
      brandSlot.className = 'navbar__brand-slot';
      refs.navInner.insertBefore(brandSlot, refs.brand);
      brandSlot.appendChild(refs.brand);
    }

    let centerShell = refs.navInner.querySelector('.navbar__center-shell');
    if (!(centerShell instanceof HTMLElement)) {
      centerShell = document.createElement('div');
      centerShell.className = 'navbar__center-shell';
      refs.navInner.insertBefore(centerShell, refs.links);
    }

    let centerDefault = centerShell.querySelector('.navbar__center-default');
    if (!(centerDefault instanceof HTMLElement)) {
      centerDefault = document.createElement('div');
      centerDefault.className = 'navbar__center-default';
      centerShell.appendChild(centerDefault);
    }

    let linksClip = centerDefault.querySelector('.navbar__links-clip');
    if (!(linksClip instanceof HTMLElement)) {
      linksClip = document.createElement('div');
      linksClip.className = 'navbar__links-clip';
      centerDefault.appendChild(linksClip);
    }

    if (!linksClip.contains(refs.links)) {
      linksClip.appendChild(refs.links);
    }

    let centerSticky = centerShell.querySelector('.navbar__center-sticky');
    if (!(centerSticky instanceof HTMLElement)) {
      centerSticky = document.createElement('div');
      centerSticky.className = 'navbar__center-sticky';
      centerShell.appendChild(centerSticky);
    }

    let mobileActions = refs.actions.querySelector('.navbar__mobile-actions');
    if (mobileActions) {
      mobileActions.remove();
    }

    mobileActions = document.createElement('div');
    mobileActions.className = 'navbar__mobile-actions';

    const mobileMenuButton = createMenuToolsButton(
      'mobile-burger',
      'Abrir navegación principal'
    );
    mobileMenuButton.classList.add('navbar__mobile-action', 'navbar__mobile-action--burger');
    mobileMenuButton.setAttribute('aria-controls', MOBILE_MENU_PANEL_ID);
    mobileActions.appendChild(mobileMenuButton);
    refs.actions.appendChild(mobileActions);
    refs.mobileMenuButton = mobileMenuButton;

    let mobileMenuPanel = refs.navInner.querySelector(`#${MOBILE_MENU_PANEL_ID}`);
    if (mobileMenuPanel) {
      mobileMenuPanel.remove();
    }

    mobileMenuPanel = document.createElement('div');
    mobileMenuPanel.className = 'navbar__mobile-menu-panel';
    mobileMenuPanel.id = MOBILE_MENU_PANEL_ID;
    mobileMenuPanel.setAttribute('aria-hidden', 'true');
    refs.navInner.appendChild(mobileMenuPanel);
    refs.mobileMenuPanel = mobileMenuPanel;
    return true;
  };

  const buildMobileMenuLinks = () => {
    if (
      !(refs.links instanceof HTMLElement) ||
      !(refs.mobileMenuPanel instanceof HTMLElement)
    ) {
      return;
    }

    refs.mobileMenuLinks = [];
    const list = document.createElement('ul');
    list.className = 'navbar__mobile-menu-links';
    list.setAttribute('role', 'list');

    refs.links.querySelectorAll('a').forEach((sourceLink) => {
      const href = normalizeText(sourceLink.getAttribute('href'));
      const label = normalizeText(sourceLink.textContent);

      if (!href || !label) {
        return;
      }

      const entryConfig = MOBILE_MENU_ENTRY_BY_KEY[toLookupKey(label)] || null;
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

      const copy = document.createElement('span');
      copy.className = 'navbar__mobile-menu-copy';

      const title = document.createElement('span');
      title.className = 'navbar__mobile-menu-title';
      title.textContent = label;

      const titleRow = document.createElement('span');
      titleRow.className = 'navbar__mobile-menu-title-row';
      titleRow.appendChild(title);

      const meta = document.createElement('span');
      meta.className = 'navbar__mobile-menu-meta';
      meta.textContent = entryConfig?.subtitle || 'Descubre esta sección';

      if (entryConfig?.badgeLabel) {
        const badge = document.createElement('span');
        badge.className = 'navbar__mobile-menu-badge';
        badge.textContent = entryConfig.badgeLabel;
        titleRow.appendChild(badge);
      }

      copy.append(titleRow, meta);

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

  const syncMobileForcedCollapsedState = () => {
    const shouldForceCollapsed = Boolean(isMobileViewport() && state.mobileMenuOpen);
    const forceCollapsedNow = root.getAttribute(FORCE_COLLAPSED_MOBILE_ATTR) === 'true';

    if (shouldForceCollapsed === forceCollapsedNow) {
      return;
    }

    if (shouldForceCollapsed) {
      root.setAttribute(FORCE_COLLAPSED_MOBILE_ATTR, 'true');
    } else {
      root.removeAttribute(FORCE_COLLAPSED_MOBILE_ATTR);
    }
  };

  const setMobileMenuOpen = (nextOpen, { restoreFocus = false } = {}) => {
    if (!(refs.header instanceof HTMLElement)) {
      return;
    }

    const shouldOpen = Boolean(nextOpen) && isMobileViewport();
    const wasOpen = state.mobileMenuOpen;
    const previousNavPhase = normalizeText(refs.header.dataset.menuMobileNav);

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
        if (!state.mobileMenuOpen && refs.header instanceof HTMLElement) {
          refs.header.dataset.menuMobileNav = 'closed';
          document.body.classList.remove('menu-mobile-nav-backdrop');
        }
      }, MOBILE_MENU_CLOSE_COMMIT_MS);
    };

    state.mobileMenuOpen = shouldOpen;
    syncMobileForcedCollapsedState();

    if (shouldOpen) {
      clearCloseCommitTimer();
      refs.header.dataset.menuMobileNav = 'open';
      document.body.classList.add('menu-mobile-nav-backdrop');
    } else if (previousNavPhase === 'open') {
      clearCloseCommitTimer();
      refs.header.dataset.menuMobileNav = 'closing';
      document.body.classList.remove('menu-mobile-nav-backdrop');
      ensureCloseCommitTimer();
    } else if (previousNavPhase === 'closing') {
      document.body.classList.remove('menu-mobile-nav-backdrop');
      ensureCloseCommitTimer();
    } else {
      clearCloseCommitTimer();
      refs.header.dataset.menuMobileNav = 'closed';
      document.body.classList.remove('menu-mobile-nav-backdrop');
    }

    if (refs.mobileMenuButton instanceof HTMLButtonElement) {
      const nextBurgerState = shouldOpen ? 'open' : 'closed';
      const burgerStateChanged =
        refs.mobileMenuButton.getAttribute('data-burger-state') !== nextBurgerState;
      const rebuiltBurgerIcon = refs.mobileMenuButton.dataset.iconType !== 'burger-animated';
      if (rebuiltBurgerIcon) {
        refs.mobileMenuButton.dataset.iconType = 'burger-animated';
        refs.mobileMenuButton.innerHTML = iconMarkup('burger-animated');
      }

      refs.mobileMenuButton.setAttribute('data-burger-state', nextBurgerState);
      refs.mobileMenuButton.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
      refs.mobileMenuButton.setAttribute('aria-pressed', shouldOpen ? 'true' : 'false');
      refs.mobileMenuButton.setAttribute(
        'aria-label',
        shouldOpen ? 'Cerrar navegación principal' : 'Abrir navegación principal'
      );

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

    if (!shouldOpen && wasOpen && restoreFocus && refs.mobileMenuButton instanceof HTMLButtonElement) {
      refs.mobileMenuButton.focus();
    }
  };

  const initMenuNavbar = () => {
    if (!ensureNavbarChrome()) {
      return;
    }

    buildMobileMenuLinks();
    setMobileMenuOpen(false);

    if (refs.mobileMenuButton instanceof HTMLButtonElement) {
      refs.mobileMenuButton.addEventListener('click', (event) => {
        event.preventDefault();

        if (!isMobileViewport()) {
          return;
        }

        setMobileMenuOpen(!state.mobileMenuOpen);
      });
    }

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

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && state.mobileMenuOpen) {
        setMobileMenuOpen(false, { restoreFocus: true });
      }
    });

    const closeOnDesktop = () => {
      if (!isMobileViewport() && state.mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
      syncMobileForcedCollapsedState();
    };

    window.addEventListener('resize', closeOnDesktop, { passive: true });
    window.addEventListener('orientationchange', closeOnDesktop);

    refs.header.dataset.eventosBurgerReady = 'true';
  };

  const initFaqAccordion = () => {
    const faqItems = Array.from(document.querySelectorAll('.eventos-faq details'));
    const FAQ_PANEL_ANIMATION_MS = 740;
    const closeTimers = new WeakMap();
    const openFrameIds = new WeakMap();

    const clearCloseTimer = (item) => {
      const timerId = closeTimers.get(item);
      if (typeof timerId === 'number') {
        window.clearTimeout(timerId);
        closeTimers.delete(item);
      }
    };

    const clearOpenFrame = (item) => {
      const frameId = openFrameIds.get(item);
      if (typeof frameId === 'number') {
        window.cancelAnimationFrame(frameId);
        openFrameIds.delete(item);
      }
    };

    const finalizeClosed = (item) => {
      clearOpenFrame(item);
      item.classList.remove('is-closing');
      item.classList.remove('is-open');
      item.open = false;
    };

    const closeItem = (item) => {
      clearCloseTimer(item);
      clearOpenFrame(item);

      if (!item.open && !item.classList.contains('is-open')) {
        finalizeClosed(item);
        return;
      }

      // Keep details rendered during the collapse animation.
      item.open = true;
      item.classList.remove('is-open');
      item.classList.add('is-closing');

      const timerId = window.setTimeout(() => {
        finalizeClosed(item);
        closeTimers.delete(item);
      }, FAQ_PANEL_ANIMATION_MS);

      closeTimers.set(item, timerId);
    };

    const openItem = (item) => {
      clearCloseTimer(item);
      clearOpenFrame(item);

      item.open = true;
      item.classList.remove('is-closing');

      if (item.classList.contains('is-open')) {
        return;
      }

      const frameId = window.requestAnimationFrame(() => {
        openFrameIds.delete(item);
        if (item.classList.contains('is-closing')) {
          return;
        }
        item.classList.add('is-open');
      });
      openFrameIds.set(item, frameId);
    };

    faqItems.forEach((item) => {
      const summary = item.querySelector('summary');
      if (!(summary instanceof HTMLElement)) {
        return;
      }

      // Normalize initial state so repeated toggles animate consistently.
      if (item.open) {
        item.classList.add('is-open');
      } else {
        finalizeClosed(item);
      }

      summary.addEventListener('click', (event) => {
        event.preventDefault();

        const isOpen = item.classList.contains('is-open');
        const isClosing = item.classList.contains('is-closing');

        if (!isOpen || isClosing) {
          faqItems.forEach((other) => {
            if (other !== item) {
              closeItem(other);
            }
          });
          openItem(item);
          return;
        }

        closeItem(item);
      });
    });
  };

  const syncPhotoBodyLockState = () => {
    const tourClosing =
      refs.photoTour instanceof HTMLElement && refs.photoTour.classList.contains('is-closing');
    const viewerClosing =
      refs.photoViewer instanceof HTMLElement && refs.photoViewer.classList.contains('is-closing');

    document.body.classList.toggle('eventos-photo-tour-open', state.photoTourOpen || tourClosing);
    document.body.classList.toggle(
      'eventos-photo-viewer-open',
      state.photoViewerOpen || viewerClosing
    );
    document.body.classList.toggle('eventos-variety-modal-open', state.quoteVarietyModalOpen);
  };

  const setPhotoViewerOpen = (nextOpen) => {
    const shouldOpen = Boolean(nextOpen);
    if (shouldOpen) {
      state.photoViewerOpen = true;
      if (state.photoViewerCloseTimerId) {
        window.clearTimeout(state.photoViewerCloseTimerId);
        state.photoViewerCloseTimerId = 0;
      }
      if (refs.photoViewer instanceof HTMLElement) {
        refs.photoViewer.classList.remove('is-closing');
        refs.photoViewer.classList.add('is-open');
        refs.photoViewer.setAttribute('aria-hidden', 'false');
      }
      syncPhotoBodyLockState();
      return;
    }

    state.photoViewerOpen = false;
    if (!(refs.photoViewer instanceof HTMLElement)) {
      syncPhotoBodyLockState();
      return;
    }

    const finalizeClose = () => {
      refs.photoViewer.classList.remove('is-closing', 'is-open');
      refs.photoViewer.setAttribute('aria-hidden', 'true');
      if (state.photoViewerScrollFrameId) {
        window.cancelAnimationFrame(state.photoViewerScrollFrameId);
        state.photoViewerScrollFrameId = 0;
      }
      state.photoViewerItems = [];
      state.photoViewerIndex = 0;
      if (refs.photoViewerTrack instanceof HTMLElement) {
        refs.photoViewerTrack.replaceChildren();
      }
      syncPhotoBodyLockState();
    };

    refs.photoViewer.classList.remove('is-open');
    refs.photoViewer.classList.add('is-closing');
    refs.photoViewer.setAttribute('aria-hidden', 'false');

    if (reducedMotionQuery.matches) {
      finalizeClose();
      return;
    }

    if (state.photoViewerCloseTimerId) {
      window.clearTimeout(state.photoViewerCloseTimerId);
    }
    state.photoViewerCloseTimerId = window.setTimeout(() => {
      state.photoViewerCloseTimerId = 0;
      finalizeClose();
    }, PHOTO_VIEWER_CLOSE_MS);

    syncPhotoBodyLockState();
  };

  const normalizePhotoViewerIndex = () => {
    const total = state.photoViewerItems.length;
    if (!total) {
      state.photoViewerIndex = 0;
      return;
    }
    state.photoViewerIndex = Math.max(0, Math.min(total - 1, state.photoViewerIndex));
  };

  const renderPhotoViewerMeta = () => {
    if (
      !(refs.photoViewerSection instanceof HTMLElement) ||
      !(refs.photoViewerCounter instanceof HTMLElement)
    ) {
      return;
    }

    const total = state.photoViewerItems.length;
    if (!total) {
      refs.photoViewerSection.textContent = '';
      refs.photoViewerCounter.textContent = '0 de 0';
      return;
    }

    normalizePhotoViewerIndex();
    const activeItem = state.photoViewerItems[state.photoViewerIndex];
    refs.photoViewerSection.textContent = activeItem.categoryLabel || '';
    refs.photoViewerCounter.textContent = `${state.photoViewerIndex + 1} de ${total}`;
  };

  const renderPhotoViewerSlides = () => {
    if (!(refs.photoViewerTrack instanceof HTMLElement)) {
      return;
    }

    refs.photoViewerTrack.replaceChildren();
    state.photoViewerItems.forEach((item, index) => {
      const slide = document.createElement('div');
      slide.className = 'eventos-photo-viewer__slide';
      slide.dataset.eventosViewerSlideIndex = String(index);

      const image = document.createElement('img');
      image.src = item.src;
      image.alt = item.alt || item.categoryLabel || 'Foto de evento';
      image.loading = 'lazy';
      image.decoding = 'async';

      slide.appendChild(image);
      refs.photoViewerTrack.appendChild(slide);
    });
  };

  const syncPhotoViewerScrollToIndex = (behavior = 'auto') => {
    if (!(refs.photoViewerStage instanceof HTMLElement)) {
      return;
    }

    const slideWidth = refs.photoViewerStage.clientWidth || 0;
    if (!slideWidth) {
      return;
    }

    refs.photoViewerStage.scrollTo({
      left: slideWidth * state.photoViewerIndex,
      top: 0,
      behavior,
    });
  };

  const handlePhotoViewerStageScroll = () => {
    if (
      !(refs.photoViewerStage instanceof HTMLElement) ||
      !state.photoViewerItems.length ||
      state.photoViewerScrollFrameId
    ) {
      return;
    }

    state.photoViewerScrollFrameId = window.requestAnimationFrame(() => {
      state.photoViewerScrollFrameId = 0;
      if (!(refs.photoViewerStage instanceof HTMLElement)) {
        return;
      }

      const slideWidth = refs.photoViewerStage.clientWidth || 1;
      const nextIndex = Math.round(refs.photoViewerStage.scrollLeft / slideWidth);
      const boundedIndex = Math.max(
        0,
        Math.min(state.photoViewerItems.length - 1, nextIndex)
      );
      if (boundedIndex !== state.photoViewerIndex) {
        state.photoViewerIndex = boundedIndex;
        renderPhotoViewerMeta();
      }
    });
  };

  const renderPhotoViewer = () => {
    renderPhotoViewerSlides();
    renderPhotoViewerMeta();
    window.requestAnimationFrame(() => {
      syncPhotoViewerScrollToIndex('auto');
    });
  };

  const shiftPhotoViewer = (delta) => {
    const total = state.photoViewerItems.length;
    if (!total) {
      return;
    }

    const nextIndex = Math.max(0, Math.min(total - 1, state.photoViewerIndex + delta));
    if (nextIndex === state.photoViewerIndex) {
      return;
    }

    state.photoViewerIndex = nextIndex;
    renderPhotoViewerMeta();
    syncPhotoViewerScrollToIndex('smooth');
  };

  const openPhotoViewer = (items, startIndex) => {
    if (!Array.isArray(items) || !items.length) {
      return;
    }

    state.photoViewerItems = items;
    state.photoViewerIndex = Number.isFinite(startIndex) ? startIndex : 0;
    setPhotoViewerOpen(true);
    renderPhotoViewer();
  };

  const setPhotoTourOpen = (nextOpen) => {
    const shouldOpen = Boolean(nextOpen);
    if (shouldOpen) {
      state.photoTourOpen = true;
      if (shouldOpen && state.mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
      if (state.photoTourCloseTimerId) {
        window.clearTimeout(state.photoTourCloseTimerId);
        state.photoTourCloseTimerId = 0;
      }
      if (refs.photoTour instanceof HTMLElement) {
        refs.photoTour.classList.remove('is-closing');
        refs.photoTour.classList.add('is-open');
        refs.photoTour.setAttribute('aria-hidden', 'false');
      }
      syncPhotoBodyLockState();
      return;
    }

    state.photoTourOpen = false;
    if (!(refs.photoTour instanceof HTMLElement)) {
      syncPhotoBodyLockState();
      return;
    }

    if (state.photoViewerOpen) {
      setPhotoViewerOpen(false);
    }

    const finalizeClose = () => {
      refs.photoTour.classList.remove('is-closing', 'is-open');
      refs.photoTour.setAttribute('aria-hidden', 'true');
      syncPhotoBodyLockState();
    };

    refs.photoTour.classList.remove('is-open');
    refs.photoTour.classList.add('is-closing');
    refs.photoTour.setAttribute('aria-hidden', 'false');

    if (reducedMotionQuery.matches) {
      finalizeClose();
      return;
    }

    if (state.photoTourCloseTimerId) {
      window.clearTimeout(state.photoTourCloseTimerId);
    }
    state.photoTourCloseTimerId = window.setTimeout(() => {
      state.photoTourCloseTimerId = 0;
      finalizeClose();
    }, PHOTO_TOUR_CLOSE_MS);

    syncPhotoBodyLockState();
  };

  const setActivePhotoCategory = (categoryId) => {
    if (!categoryId) {
      return;
    }

    state.activePhotoCategoryId = categoryId;
    refs.photoTourCategoryButtons.forEach((button) => {
      const isActive = button.dataset.eventosCategoryId === categoryId;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  };

  const clearActivePhotoCategory = () => {
    state.activePhotoCategoryId = '';
    refs.photoTourCategoryButtons.forEach((button) => {
      button.classList.remove('is-active');
      button.setAttribute('aria-selected', 'false');
    });
  };

  const scrollToPhotoCategory = (categoryId, behavior = 'smooth') => {
    const scroller = getPhotoTourScroller();
    if (!(scroller instanceof HTMLElement)) {
      return;
    }

    const targetSection = scroller.querySelector(
      `[data-eventos-section-id="${categoryId}"]`
    );

    if (!(targetSection instanceof HTMLElement)) {
      return;
    }

    const stickyHeaderHeight =
      refs.photoTourHeader instanceof HTMLElement ? refs.photoTourHeader.offsetHeight : 0;
    const scrollerTop = scroller.getBoundingClientRect().top;
    const targetTop =
      scroller.scrollTop + targetSection.getBoundingClientRect().top - scrollerTop;

    scroller.scrollTo({
      top: Math.max(0, targetTop - stickyHeaderHeight - 12),
      behavior,
    });
    setActivePhotoCategory(categoryId);
  };

  const buildPhotoViewerCatalog = () => {
    const catalog = [];
    EVENTOS_PHOTO_TOUR_CATEGORIES.forEach((category) => {
      category.photos.forEach((photoKey) => {
        const photoItem = resolvePhotoItem(photoKey);
        if (!photoItem) {
          return;
        }

        catalog.push(
          Object.freeze({
            key: photoKey,
            src: photoItem.src,
            alt: photoItem.alt,
            caption: photoItem.caption,
            categoryId: category.id,
            categoryLabel: category.label,
          })
        );
      });
    });
    return catalog;
  };

  const renderPhotoTour = () => {
    if (
      !(refs.photoTourCategories instanceof HTMLElement) ||
      !(refs.photoTourContent instanceof HTMLElement)
    ) {
      return;
    }

    refs.photoTourCategoryButtons = [];
    refs.photoTourSections = [];
    refs.photoTourCategories.replaceChildren();
    refs.photoTourContent.replaceChildren();

    EVENTOS_PHOTO_TOUR_CATEGORIES.forEach((category) => {
      const categoryItems = category.photos
        .map((photoKey) => ({ key: photoKey, item: resolvePhotoItem(photoKey) }))
        .filter((entry) => Boolean(entry.item));
      const categoryThumb = categoryItems[0]?.item || null;

      const categoryButton = document.createElement('button');
      categoryButton.type = 'button';
      categoryButton.className = 'eventos-photo-tour__cat-btn';
      categoryButton.dataset.eventosCategoryId = category.id;
      categoryButton.setAttribute('role', 'tab');
      categoryButton.setAttribute('aria-selected', 'false');

      const thumb = document.createElement('span');
      thumb.className = 'eventos-photo-tour__cat-thumb';
      if (categoryThumb) {
        const thumbImage = document.createElement('img');
        thumbImage.src = categoryThumb.src;
        thumbImage.alt = '';
        thumbImage.loading = 'lazy';
        thumbImage.decoding = 'async';
        thumb.appendChild(thumbImage);
      }

      const label = document.createElement('span');
      label.className = 'eventos-photo-tour__cat-label';
      label.textContent = category.label;

      categoryButton.append(thumb, label);
      categoryButton.addEventListener('click', () => {
        scrollToPhotoCategory(category.id, 'smooth');
      });
      refs.photoTourCategories.appendChild(categoryButton);
      refs.photoTourCategoryButtons.push(categoryButton);

      const section = document.createElement('section');
      section.className = 'eventos-photo-tour__section';
      section.dataset.eventosSectionId = category.id;
      section.setAttribute('role', 'region');
      section.setAttribute('aria-label', category.label);

      const heading = document.createElement('h3');
      heading.textContent = category.label;

      const grid = document.createElement('div');
      grid.className = 'eventos-photo-tour__grid';

      categoryItems.forEach((entry, photoIndex) => {
        const photoItem = entry.item;
        if (!photoItem) {
          return;
        }
        const photoThumb = document.createElement('button');
        photoThumb.type = 'button';
        photoThumb.className = 'eventos-photo-tour__thumb';
        photoThumb.dataset.eventosCategoryId = category.id;
        photoThumb.dataset.eventosPhotoKey = entry.key;
        photoThumb.dataset.eventosPhotoIndex = String(photoIndex);
        photoThumb.setAttribute('aria-label', `Abrir foto ${photoIndex + 1} de ${category.label}`);

        const image = document.createElement('img');
        image.src = photoItem.src;
        image.alt = photoItem.alt;
        image.loading = 'lazy';
        image.decoding = 'async';
        photoThumb.appendChild(image);

        grid.appendChild(photoThumb);
      });

      section.append(heading, grid);
      refs.photoTourContent.appendChild(section);
      refs.photoTourSections.push(section);
    });
    clearActivePhotoCategory();
  };

  const initPhotoTour = () => {
    refs.collageOpenButtons = Array.from(document.querySelectorAll('[data-eventos-tour-open]'));
    refs.collageMoreCount = document.querySelector('[data-eventos-collage-more-count]');
    refs.photoTour = document.querySelector('[data-eventos-photo-tour]');
    refs.photoTourSheet = document.querySelector('.eventos-photo-tour__sheet');
    refs.photoTourHeader = document.querySelector('.eventos-photo-tour__header');
    refs.photoTourCloseButton = document.querySelector('[data-eventos-tour-close]');
    refs.photoTourCategories = document.querySelector('[data-eventos-tour-categories]');
    refs.photoTourContent = document.querySelector('[data-eventos-tour-content]');
    refs.photoViewer = document.querySelector('[data-eventos-photo-viewer]');
    refs.photoViewerCloseButton = document.querySelector('[data-eventos-viewer-close]');
    refs.photoViewerSection = document.querySelector('[data-eventos-viewer-section]');
    refs.photoViewerCounter = document.querySelector('[data-eventos-viewer-counter]');
    refs.photoViewerStage = document.querySelector('[data-eventos-viewer-stage]');
    refs.photoViewerTrack = document.querySelector('[data-eventos-viewer-track]');

    if (
      !(refs.photoTour instanceof HTMLElement) ||
      !(refs.photoTourSheet instanceof HTMLElement) ||
      !(refs.photoTourHeader instanceof HTMLElement) ||
      !(refs.photoTourCategories instanceof HTMLElement) ||
      !(refs.photoTourContent instanceof HTMLElement) ||
      !(refs.photoViewer instanceof HTMLElement) ||
      !(refs.photoViewerStage instanceof HTMLElement) ||
      !(refs.photoViewerTrack instanceof HTMLElement)
    ) {
      return;
    }

    const hiddenPhotoCount = Math.max(1, getAllUniquePhotoKeys().length - 3);
    if (refs.collageMoreCount instanceof HTMLElement) {
      refs.collageMoreCount.textContent = `+${hiddenPhotoCount} fotos`;
    }

    renderPhotoTour();
    state.photoViewerCatalog = buildPhotoViewerCatalog();

    refs.collageOpenButtons.forEach((button) => {
      button.addEventListener('click', () => {
        setPhotoTourOpen(true);
        if (refs.photoTourSheet instanceof HTMLElement) {
          refs.photoTourSheet.scrollTop = 0;
        }
        clearActivePhotoCategory();
      });
    });

    if (refs.photoTourCloseButton instanceof HTMLButtonElement) {
      refs.photoTourCloseButton.addEventListener('click', () => {
        setPhotoTourOpen(false);
      });
    }

    refs.photoTourContent.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const thumb = target.closest('.eventos-photo-tour__thumb');
      if (!(thumb instanceof HTMLElement)) {
        return;
      }

      const categoryId = thumb.dataset.eventosCategoryId;
      const photoKey = thumb.dataset.eventosPhotoKey;
      if (!photoKey || !categoryId) {
        return;
      }

      const startIndex = state.photoViewerCatalog.findIndex(
        (entry) => entry.categoryId === categoryId && entry.key === photoKey
      );
      if (!state.photoViewerCatalog.length) {
        return;
      }

      openPhotoViewer(state.photoViewerCatalog, startIndex >= 0 ? startIndex : 0);
    });

    if (refs.photoViewerCloseButton instanceof HTMLButtonElement) {
      refs.photoViewerCloseButton.addEventListener('click', () => {
        setPhotoViewerOpen(false);
      });
    }

    refs.photoViewerStage.addEventListener('scroll', handlePhotoViewerStageScroll, {
      passive: true,
    });

    const syncViewerOnViewportChange = () => {
      if (!state.photoViewerOpen) {
        return;
      }
      window.requestAnimationFrame(() => {
        syncPhotoViewerScrollToIndex('auto');
      });
    };

    window.addEventListener('resize', syncViewerOnViewportChange, { passive: true });
    window.addEventListener('orientationchange', syncViewerOnViewportChange);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (state.photoViewerOpen) {
          event.preventDefault();
          setPhotoViewerOpen(false);
          return;
        }
        if (state.photoTourOpen) {
          event.preventDefault();
          setPhotoTourOpen(false);
        }
        return;
      }

      if (!state.photoViewerOpen) {
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        shiftPhotoViewer(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        shiftPhotoViewer(1);
      }
    });
  };

  const parseInteger = (value, fallback = 0) => {
    const parsed = Number.parseInt(String(value || ''), 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const normalizeQuoteTotal = (value) =>
    Math.max(QUOTE_MIN_TOTAL_PIZZAS, parseInteger(value, QUOTE_DEFAULT_TOTAL_PIZZAS));

  const pulseNodeWithQuoteStepperClass = (node) => {
    if (!(node instanceof HTMLElement) && !(node instanceof SVGElement)) {
      return;
    }

    const activeTimeoutId = quoteStepperPulseTimeoutByTarget.get(node);
    if (activeTimeoutId) {
      window.clearTimeout(activeTimeoutId);
    }

    node.classList.remove(MENU_CART_PULSE_CLASS);
    void node.getBoundingClientRect();
    node.classList.add(MENU_CART_PULSE_CLASS);

    const timeoutId = window.setTimeout(() => {
      node.classList.remove(MENU_CART_PULSE_CLASS);
      quoteStepperPulseTimeoutByTarget.delete(node);
    }, QUOTE_STEPPER_PULSE_MS + 34);

    quoteStepperPulseTimeoutByTarget.set(node, timeoutId);
  };

  const pulseQuoteTotalStepper = (button) => {
    if (!(button instanceof HTMLButtonElement) || button.disabled) {
      return;
    }

    const glyphNode = button.querySelector('.eventos-cotizador-stepper__glyph');
    if (glyphNode instanceof HTMLElement || glyphNode instanceof SVGElement) {
      pulseNodeWithQuoteStepperClass(glyphNode);
    }

    pulseNodeWithQuoteStepperClass(button);

    if (refs.quoteTotalValue instanceof HTMLElement) {
      pulseNodeWithQuoteStepperClass(refs.quoteTotalValue);
    }
  };

  const toQuoteViewTransitionName = (trackToken) => {
    const normalizedToken = normalizeText(trackToken)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');
    return `${QUOTE_VIEW_TRANSITION_CARD_NAME_PREFIX}${normalizedToken || 'item'}`;
  };

  const getNextQuoteCardTrackName = () => {
    quoteVarietyCardTrackSequence += 1;
    return toQuoteViewTransitionName(String(quoteVarietyCardTrackSequence));
  };

  const ensureQuoteVarietyCardTransitionTrack = (card) => {
    if (!(card instanceof HTMLElement)) {
      return '';
    }

    let trackName = normalizeText(card.dataset.eventosQuoteTrackName);
    if (!trackName) {
      trackName = getNextQuoteCardTrackName();
      card.dataset.eventosQuoteTrackName = trackName;
    }

    card.style.viewTransitionName = trackName;
    return trackName;
  };

  const setQuoteVarietyCardContent = (card, varietyId) => {
    if (!(card instanceof HTMLElement)) {
      return;
    }

    const variety = state.quoteVarietyById[varietyId];
    if (!variety) {
      return;
    }

    const mediaImage = card.querySelector('.eventos-cotizador-variety__media img');
    const title = card.querySelector('.eventos-cotizador-variety__body h4');
    if (!(mediaImage instanceof HTMLImageElement) || !(title instanceof HTMLElement)) {
      return;
    }

    const trackName = ensureQuoteVarietyCardTransitionTrack(card);
    if (trackName) {
      mediaImage.style.viewTransitionName = `${trackName}${QUOTE_VIEW_TRANSITION_MEDIA_SUFFIX}`;
      title.style.viewTransitionName = `${trackName}${QUOTE_VIEW_TRANSITION_TITLE_SUFFIX}`;
    }

    card.dataset.eventosSelectedVarietyId = variety.id;
    mediaImage.src = variety.image;
    mediaImage.alt = variety.name;
    mediaImage.loading = 'eager';
    mediaImage.decoding = 'async';
    title.textContent = variety.name;
  };

  const preloadQuoteVarietyImages = async (varietyIds) => {
    const ids = Array.isArray(varietyIds) ? varietyIds : [];
    const tasks = ids.map((varietyId) => {
      const variety = state.quoteVarietyById[varietyId];
      if (!variety?.image) {
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        const image = new Image();
        image.src = variety.image;

        if (image.complete) {
          resolve();
          return;
        }

        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
      });
    });

    await Promise.all(tasks);
  };

  const createQuoteDerangedOrder = (length) => {
    const size = Number(length) || 0;
    const identity = Array.from({ length: size }, (_, index) => index);

    if (size <= 1) {
      return identity;
    }

    const candidate = [...identity];
    let attempt = 0;
    while (attempt < 48) {
      for (let index = size - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [candidate[index], candidate[swapIndex]] = [candidate[swapIndex], candidate[index]];
      }

      const isDeranged = candidate.every((value, index) => value !== index);
      if (isDeranged) {
        return [...candidate];
      }

      attempt += 1;
    }

    return identity.map((_, index) => (index + 1) % size);
  };

  const canRunQuoteShuffleViewTransition = () =>
    typeof document.startViewTransition === 'function' &&
    !reducedMotionQuery.matches &&
    refs.quoteSelectedGrid instanceof HTMLElement &&
    refs.quoteSelectedGrid.childElementCount > 0;

  const clearQuoteShuffleViewTransitionRuntime = () => {
    root.removeAttribute(QUOTE_VIEW_TRANSITION_ROOT_ATTR);
  };

  const runQuoteShuffleViewTransition = async (updateFn) => {
    if (typeof updateFn !== 'function') {
      return;
    }

    const canAnimate = canRunQuoteShuffleViewTransition();
    if (!canAnimate) {
      updateFn();
      return;
    }

    const runTransition = async () => {
      const stillCanAnimate = canRunQuoteShuffleViewTransition();
      if (!stillCanAnimate) {
        updateFn();
        return;
      }

      clearQuoteShuffleViewTransitionRuntime();
      root.setAttribute(QUOTE_VIEW_TRANSITION_ROOT_ATTR, QUOTE_VIEW_TRANSITION_ROOT_ACTIVE);

      let transition = null;
      try {
        transition = document.startViewTransition(() => updateFn());
      } catch {
        clearQuoteShuffleViewTransitionRuntime();
        updateFn();
        return;
      }

      try {
        await Promise.resolve(transition?.finished);
      } catch {
        // Transition can be skipped by the browser; DOM update already happened.
      } finally {
        clearQuoteShuffleViewTransitionRuntime();
      }
    };

    quoteShuffleTransitionTask = quoteShuffleTransitionTask
      .catch(() => {})
      .then(() => runTransition());

    await quoteShuffleTransitionTask;
  };

  const setQuoteShuffleBusy = (nextBusy) => {
    const isBusy = Boolean(nextBusy);
    state.quoteShuffleAnimating = isBusy;

    if (refs.quoteVarietyRandomButton instanceof HTMLButtonElement) {
      refs.quoteVarietyRandomButton.classList.toggle(QUOTE_SHUFFLE_BUSY_CLASS, isBusy);
      refs.quoteVarietyRandomButton.setAttribute('aria-busy', isBusy ? 'true' : 'false');
    }
  };

  const pulseQuoteRandomButton = () => {
    const button = refs.quoteVarietyRandomButton;
    if (!(button instanceof HTMLButtonElement) || button.disabled) {
      return;
    }

    if (quoteRandomPulseTimeoutId) {
      window.clearTimeout(quoteRandomPulseTimeoutId);
    }

    button.classList.remove(QUOTE_SHUFFLE_PULSE_CLASS);
    void button.getBoundingClientRect();
    button.classList.add(QUOTE_SHUFFLE_PULSE_CLASS);

    quoteRandomPulseTimeoutId = window.setTimeout(() => {
      button.classList.remove(QUOTE_SHUFFLE_PULSE_CLASS);
      quoteRandomPulseTimeoutId = 0;
    }, QUOTE_SHUFFLE_PULSE_MS + 44);
  };

  const getMenuDataPath = () => {
    if (publicPaths?.toSitePath) {
      return publicPaths.toSitePath('data/menu.json');
    }
    return '/data/menu.json';
  };

  const getQuoteBreakdown = () => {
    const totalPizzas = normalizeQuoteTotal(state.quoteTotalPizzas);
    const subtotalPizzas = totalPizzas * QUOTE_PIZZA_PRICE_DOP;
    const baseServiceFee =
      totalPizzas > QUOTE_SERVICE_FEE_WAIVER_THRESHOLD ? 0 : QUOTE_BASE_SERVICE_FEE_DOP;
    const serviceFee = Math.round(subtotalPizzas * QUOTE_SERVICE_RATE);
    const totalEstimate = subtotalPizzas + baseServiceFee + serviceFee;
    const selectedCount = getCommittedQuoteSelectionIds().length;

    return Object.freeze({
      totalPizzas,
      subtotalPizzas,
      baseServiceFee,
      baseServiceFeeWaived: baseServiceFee === 0,
      serviceFee,
      totalEstimate,
      selectedCount,
    });
  };

  const getCommittedQuoteSelectionIds = () =>
    state.quoteHasUserSelection
      ? state.quoteSelectedVarietyIds.slice(0, QUOTE_MAX_VARIETIES)
      : [];

  const getQuoteDisplaySourceIds = () => {
    const committedIds = getCommittedQuoteSelectionIds();
    if (committedIds.length) {
      return committedIds;
    }
    return state.quoteDefaultPreviewVarietyIds.slice(0, QUOTE_MAX_VARIETIES);
  };

  const isQuoteReadyForWhatsapp = (breakdown) => breakdown.selectedCount > 0;

  const getQuoteInfoToggles = () =>
    [refs.quoteTotalInfoToggle, refs.quoteMenuInfoToggle, refs.quoteSummaryInfoToggle].filter(
      (toggle) => toggle instanceof HTMLButtonElement
    );

  const setQuoteInfoOpen = (targetToggle, isOpen) => {
    const toggles = getQuoteInfoToggles();
    toggles.forEach((toggle) => {
      const shouldOpen = Boolean(isOpen && targetToggle === toggle);
      toggle.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    });
  };

  const closeQuoteInfoTooltips = () => {
    setQuoteInfoOpen(null, false);
  };

  const setQuoteVarietyModalOpen = (nextOpen) => {
    const shouldOpen = Boolean(nextOpen);
    state.quoteVarietyModalOpen = shouldOpen;

    if (shouldOpen && state.mobileMenuOpen) {
      setMobileMenuOpen(false);
    }

    if (refs.varietyModal instanceof HTMLElement) {
      refs.varietyModal.classList.toggle('is-open', shouldOpen);
      refs.varietyModal.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');
    }

    syncPhotoBodyLockState();

    if (shouldOpen) {
      state.quoteVarietySearchQuery = '';
      if (refs.varietyModalSearchInput instanceof HTMLInputElement) {
        refs.varietyModalSearchInput.value = '';
      }
      renderQuoteVarietyModalOptions();

      if (refs.varietyModalSearchInput instanceof HTMLInputElement) {
        refs.varietyModalSearchInput.focus();
        return;
      }

      if (refs.varietyModalDoneButton instanceof HTMLButtonElement) {
        refs.varietyModalDoneButton.focus();
      }
      return;
    }

    if (!shouldOpen && refs.quoteVarietyOpenButton instanceof HTMLButtonElement) {
      refs.quoteVarietyOpenButton.focus();
    }
  };

  const renderQuoteVarietyCounter = () => {
    const committedCount = getCommittedQuoteSelectionIds().length;
    const displayCount = getQuoteDisplaySourceIds().length;

    if (refs.quoteVarietySelectionCounter instanceof HTMLElement) {
      refs.quoteVarietySelectionCounter.textContent = `${displayCount} de ${QUOTE_MAX_VARIETIES} seleccionadas`;
    }
    if (refs.varietyModalCounter instanceof HTMLElement) {
      refs.varietyModalCounter.textContent = `${committedCount} / ${QUOTE_MAX_VARIETIES}`;
    }

    if (refs.varietyModalClearButton instanceof HTMLButtonElement) {
      refs.varietyModalClearButton.disabled = committedCount === 0;
    }
  };

  const syncQuoteVarietySearchControls = () => {
    if (
      !(refs.varietyModalSearchRoot instanceof HTMLElement) ||
      !(refs.varietyModalSearchInput instanceof HTMLInputElement)
    ) {
      return;
    }

    const hasValue = Boolean(normalizeText(refs.varietyModalSearchInput.value));
    refs.varietyModalSearchRoot.dataset.helperVisible = hasValue ? 'false' : 'true';

    if (refs.varietyModalSearchClear instanceof HTMLButtonElement) {
      refs.varietyModalSearchClear.classList.toggle('is-visible', hasValue);
      refs.varietyModalSearchClear.setAttribute('aria-hidden', hasValue ? 'false' : 'true');
      refs.varietyModalSearchClear.tabIndex = hasValue ? 0 : -1;
    }
  };

  const getVisibleQuoteVarieties = (sourceList) => {
    const items = Array.isArray(sourceList) ? sourceList : [];
    const normalizedQuery = normalizeSearchQueryValue(state.quoteVarietySearchQuery);
    if (!normalizedQuery) {
      return items;
    }

    return items.filter((variety) =>
      normalizeSearchQueryValue(variety.searchText || variety.name).includes(normalizedQuery)
    );
  };

  const renderQuoteVarietyModalOptions = () => {
    if (!(refs.varietyModalGrid instanceof HTMLElement)) {
      return;
    }

    refs.varietyModalGrid.replaceChildren();
    syncQuoteVarietySearchControls();

    if (!state.quoteVarieties.length) {
      const emptyState = document.createElement('p');
      emptyState.className = 'eventos-variety-modal__empty';
      emptyState.textContent = 'No pudimos cargar las variedades disponibles por ahora.';
      refs.varietyModalGrid.appendChild(emptyState);
      return;
    }

    const visibleVarieties = getVisibleQuoteVarieties(state.quoteVarieties);
    const visibleExcludedVarieties = getVisibleQuoteVarieties(state.quoteExcludedVarieties);
    const selectedIds = getCommittedQuoteSelectionIds();
    const selectedCount = selectedIds.length;
    const selectionCapReached = selectedCount >= QUOTE_MAX_VARIETIES;

    const buildVarietyOption = (variety, options = {}) => {
      const { unavailable = false } = options;
      const isSelected = !unavailable && selectedIds.includes(variety.id);
      const isCapBlocked = !unavailable && !isSelected && selectionCapReached;

      const item = document.createElement('li');
      item.className = 'eventos-variety-modal__item-row';

      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'eventos-variety-option';
      option.dataset.eventosVarietyId = variety.id;
      option.classList.toggle('is-selected', isSelected);
      option.classList.toggle('is-unavailable', unavailable);
      option.classList.toggle('is-cap-blocked', isCapBlocked);
      option.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      option.dataset.selected = isSelected ? 'true' : 'false';

      if (unavailable || isCapBlocked) {
        option.disabled = true;
      }

      const selectedIndicator = document.createElement('span');
      selectedIndicator.className = 'eventos-variety-option__selected-indicator';
      selectedIndicator.setAttribute('aria-hidden', 'true');

      const selectedIndicatorIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      selectedIndicatorIcon.setAttribute('viewBox', '0 0 640 640');
      selectedIndicatorIcon.setAttribute('focusable', 'false');

      const selectedIndicatorPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      selectedIndicatorPath.setAttribute(
        'd',
        'M530.8 134.1C545.1 144.5 548.3 164.5 537.9 178.8L281.9 530.8C276.4 538.4 267.9 543.1 258.5 543.9C249.1 544.7 240 541.2 233.4 534.6L105.4 406.6C92.9 394.1 92.9 373.8 105.4 361.3C117.9 348.8 138.2 348.8 150.7 361.3L252.2 462.8L486.2 141.1C496.6 126.8 516.6 123.6 530.9 134z'
      );
      selectedIndicatorIcon.appendChild(selectedIndicatorPath);
      selectedIndicator.appendChild(selectedIndicatorIcon);

      const media = document.createElement('div');
      media.className = 'eventos-variety-option__media';

      const image = document.createElement('img');
      image.className = 'eventos-variety-option__image';
      image.src = variety.image;
      image.alt = '';
      image.loading = 'lazy';
      image.decoding = 'async';
      media.appendChild(image);

      const body = document.createElement('div');
      body.className = 'eventos-variety-option__body';

      const title = document.createElement('p');
      title.className = 'eventos-variety-option__title';
      title.textContent = variety.name;

      const summary = document.createElement('p');
      summary.className = 'eventos-variety-option__summary';
      summary.textContent = normalizeText(variety.description);

      body.append(title, summary);
      option.append(selectedIndicator, media, body);
      item.appendChild(option);
      return item;
    };

    if (visibleVarieties.length) {
      const list = document.createElement('ul');
      list.className = 'eventos-variety-modal__list';
      list.setAttribute('role', 'list');
      visibleVarieties.forEach((variety) => {
        list.appendChild(buildVarietyOption(variety));
      });
      refs.varietyModalGrid.appendChild(list);
    }

    if (visibleExcludedVarieties.length) {
      const excludedSection = document.createElement('section');
      excludedSection.className = 'eventos-variety-modal__excluded';
      excludedSection.setAttribute('aria-label', 'Variedades premium fuera de esta modalidad');

      const excludedTitle = document.createElement('h2');
      excludedTitle.className = 'eventos-variety-modal__excluded-title';
      excludedTitle.textContent = 'Fuera del plan';

      const excludedSubtitle = document.createElement('p');
      excludedSubtitle.className = 'eventos-variety-modal__excluded-subtitle';
      excludedSubtitle.textContent = 'Estas opciones especiales quedan excluidas';

      const excludedList = document.createElement('ul');
      excludedList.className = 'eventos-variety-modal__list eventos-variety-modal__list--excluded';
      excludedList.setAttribute('role', 'list');
      visibleExcludedVarieties.forEach((variety) => {
        excludedList.appendChild(buildVarietyOption(variety, { unavailable: true }));
      });

      excludedSection.append(excludedTitle, excludedSubtitle, excludedList);
      refs.varietyModalGrid.appendChild(excludedSection);
    }

    if (!visibleVarieties.length && !visibleExcludedVarieties.length) {
      const emptyState = document.createElement('p');
      emptyState.className = 'eventos-variety-modal__empty';
      const query = normalizeText(state.quoteVarietySearchQuery);
      emptyState.textContent = query
        ? `No encontramos variedades para “${query}”.`
        : 'No encontramos variedades disponibles ahora mismo.';
      refs.varietyModalGrid.appendChild(emptyState);
    }
  };

  const syncQuoteVarietyModalOptionStates = () => {
    if (!(refs.varietyModalGrid instanceof HTMLElement)) {
      return false;
    }

    const optionButtons = Array.from(
      refs.varietyModalGrid.querySelectorAll('.eventos-variety-option')
    ).filter((node) => node instanceof HTMLButtonElement);
    if (!optionButtons.length) {
      return false;
    }

    const selectedIds = new Set(getCommittedQuoteSelectionIds());
    const selectionCapReached = selectedIds.size >= QUOTE_MAX_VARIETIES;

    optionButtons.forEach((option) => {
      const isUnavailable = option.classList.contains('is-unavailable');
      if (isUnavailable) {
        option.disabled = true;
        option.classList.remove('is-selected');
        option.classList.remove('is-cap-blocked');
        option.dataset.selected = 'false';
        option.setAttribute('aria-pressed', 'false');
        return;
      }

      const varietyId = option.dataset.eventosVarietyId || '';
      const isSelected = Boolean(varietyId && selectedIds.has(varietyId));
      const isCapBlocked = !isSelected && selectionCapReached;
      option.classList.toggle('is-selected', isSelected);
      option.classList.toggle('is-cap-blocked', isCapBlocked);
      option.dataset.selected = isSelected ? 'true' : 'false';
      option.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      option.disabled = isCapBlocked;
    });

    return true;
  };

  const renderQuoteTotal = (breakdown) => {
    if (refs.quoteTotalValue instanceof HTMLElement) {
      refs.quoteTotalValue.textContent = String(breakdown.totalPizzas);
    }

    if (refs.quoteTotalMinusButton instanceof HTMLButtonElement) {
      const atMinimum = breakdown.totalPizzas <= QUOTE_MIN_TOTAL_PIZZAS;
      refs.quoteTotalMinusButton.disabled = atMinimum;
      refs.quoteTotalMinusButton.setAttribute('aria-disabled', atMinimum ? 'true' : 'false');
    }
  };

  const buildQuoteVarietyCard = (varietyId) => {
    const variety = state.quoteVarietyById[varietyId];
    if (!variety) {
      return null;
    }

    const card = document.createElement('article');
    card.className = 'eventos-cotizador-variety';

    const media = document.createElement('div');
    media.className = 'eventos-cotizador-variety__media';
    const image = document.createElement('img');
    media.appendChild(image);

    const body = document.createElement('div');
    body.className = 'eventos-cotizador-variety__body';

    const title = document.createElement('h4');

    body.append(title);
    card.append(media, body);
    setQuoteVarietyCardContent(card, variety.id);
    return card;
  };

  const getQuoteDisplayVarietyIds = () => {
    const selectedIds = getQuoteDisplaySourceIds();
    if (selectedIds.length !== QUOTE_MAX_VARIETIES) {
      return selectedIds;
    }

    const rankedByNameLength = selectedIds
      .map((varietyId, index) => {
        const variety = state.quoteVarietyById[varietyId];
        return {
          varietyId,
          index,
          nameLength: variety?.name ? Array.from(variety.name).length : 0,
        };
      })
      .sort((a, b) => b.nameLength - a.nameLength || a.index - b.index);

    const longestIds = new Set(rankedByNameLength.slice(0, 2).map((entry) => entry.varietyId));
    const topRow = selectedIds.filter((varietyId) => !longestIds.has(varietyId));
    const bottomRow = selectedIds.filter((varietyId) => longestIds.has(varietyId));

    return [...topRow, ...bottomRow];
  };

  const renderQuoteSelectedVarieties = () => {
    if (!(refs.quoteSelectedGrid instanceof HTMLElement) || !(refs.quoteSelectedEmpty instanceof HTMLElement)) {
      return;
    }

    const displaySourceIds = getQuoteDisplaySourceIds();
    const hasVarieties = displaySourceIds.length > 0;
    refs.quoteSelectedEmpty.hidden = hasVarieties;
    refs.quoteSelectedGrid.dataset.selectedCount = String(displaySourceIds.length);

    if (!hasVarieties) {
      if (refs.quoteSelectedGrid.childElementCount > 0) {
        refs.quoteSelectedGrid.replaceChildren();
      }
      return;
    }

    const nextDisplayIds = getQuoteDisplayVarietyIds();
    const currentDisplayIds = Array.from(refs.quoteSelectedGrid.children)
      .map((node) =>
        node instanceof HTMLElement ? normalizeText(node.dataset.eventosSelectedVarietyId) : ''
      )
      .filter(Boolean);

    const sameOrder =
      currentDisplayIds.length === nextDisplayIds.length &&
      currentDisplayIds.every((id, index) => id === nextDisplayIds[index]);
    if (sameOrder) {
      return;
    }

    const existingCardsById = new Map();
    Array.from(refs.quoteSelectedGrid.children).forEach((node) => {
      if (!(node instanceof HTMLElement)) {
        return;
      }
      const varietyId = normalizeText(node.dataset.eventosSelectedVarietyId);
      if (!varietyId) {
        return;
      }
      existingCardsById.set(varietyId, node);
    });

    nextDisplayIds.forEach((varietyId) => {
      const existingCard = existingCardsById.get(varietyId);
      const card = existingCard || buildQuoteVarietyCard(varietyId);
      if (!card) {
        return;
      }
      setQuoteVarietyCardContent(card, varietyId);
      refs.quoteSelectedGrid.appendChild(card);
      existingCardsById.delete(varietyId);
    });

    existingCardsById.forEach((card) => {
      card.remove();
    });
  };

  const renderQuoteSummary = (breakdown) => {
    if (refs.quoteSummaryPizzasLine instanceof HTMLElement) {
      refs.quoteSummaryPizzasLine.textContent = `${breakdown.totalPizzas} × ${formatDop(
        QUOTE_PIZZA_PRICE_DOP
      )}`;
    }

    if (refs.quoteSummarySubtotal instanceof HTMLElement) {
      refs.quoteSummarySubtotal.textContent = formatDop(breakdown.subtotalPizzas);
    }

    if (refs.quoteSummaryBaseFee instanceof HTMLElement) {
      if (breakdown.baseServiceFeeWaived) {
        refs.quoteSummaryBaseFee.innerHTML = '<strong class="eventos-cotizador-summary__included">Incluido</strong>';
      } else {
        refs.quoteSummaryBaseFee.textContent = formatDop(breakdown.baseServiceFee);
      }
    }

    if (refs.quoteSummaryServiceFee instanceof HTMLElement) {
      refs.quoteSummaryServiceFee.textContent = formatDop(breakdown.serviceFee);
    }

    if (refs.quoteSummaryTotal instanceof HTMLElement) {
      refs.quoteSummaryTotal.textContent = formatDop(breakdown.totalEstimate);
    }

  };

  const buildQuoteWhatsappMessage = (breakdown) => {
    const varietyLines = getCommittedQuoteSelectionIds()
      .map((varietyId) => {
        const variety = state.quoteVarietyById[varietyId];
        if (!variety) {
          return '';
        }
        return `  - ${variety.name}`;
      })
      .filter(Boolean);

    const baseFeeLine = breakdown.baseServiceFeeWaived
      ? 'Incluido'
      : formatDop(breakdown.baseServiceFee);

    const lines = [
      'Hola, quiero cotizar un Pizza Party 🍕',
      '',
      'Resumen de mi estimación:',
      `• Total de pizzas: ${breakdown.totalPizzas}`,
      '• Variedades elegidas:',
      ...varietyLines,
      '',
      'Monto estimado:',
      `• Subtotal pizzas: ${formatDop(breakdown.subtotalPizzas)}`,
      `• Cargo por servicio: ${baseFeeLine}`,
      `• Servicio 10%: ${formatDop(breakdown.serviceFee)}`,
      `• Total estimado: ${formatDop(breakdown.totalEstimate)}`,
      '',
      'Quiero confirmar disponibilidad y próximos pasos.',
    ];
    return lines.join('\n');
  };

  const renderQuoteWhatsappState = (breakdown) => {
    if (
      !(refs.quoteWhatsappButton instanceof HTMLButtonElement) ||
      !(refs.quoteWhatsappHint instanceof HTMLElement)
    ) {
      return;
    }

    const ready = isQuoteReadyForWhatsapp(breakdown);
    refs.quoteWhatsappButton.disabled = !ready;

    if (state.quoteLoadError) {
      refs.quoteWhatsappButton.disabled = true;
      refs.quoteWhatsappHint.textContent = state.quoteLoadError;
      return;
    }

    if (ready) {
      refs.quoteWhatsappHint.textContent = 'Todo listo. Tu mensaje saldrá con el detalle completo de la estimación.';
      return;
    }

    refs.quoteWhatsappHint.textContent = 'Selecciona al menos una variedad para continuar por WhatsApp.';
  };

  const renderQuoteCalculator = () => {
    const breakdown = getQuoteBreakdown();
    renderQuoteTotal(breakdown);
    renderQuoteVarietyCounter();
    if (state.quoteVarietyModalOpen && !syncQuoteVarietyModalOptionStates()) {
      renderQuoteVarietyModalOptions();
    }
    renderQuoteSelectedVarieties();
    renderQuoteSummary(breakdown);
    renderQuoteWhatsappState(breakdown);
  };

  const setQuoteTotalPizzas = (nextValue) => {
    state.quoteTotalPizzas = normalizeQuoteTotal(nextValue);
    const breakdown = getQuoteBreakdown();
    renderQuoteTotal(breakdown);
    renderQuoteSummary(breakdown);
    renderQuoteWhatsappState(breakdown);
  };

  const removeQuoteVariety = (varietyId) => {
    const nextIds = getCommittedQuoteSelectionIds().filter((id) => id !== varietyId);
    state.quoteSelectedVarietyIds = nextIds;
    state.quoteHasUserSelection = true;
    renderQuoteCalculator();
  };

  const toggleQuoteVarietySelection = (varietyId) => {
    if (!state.quoteVarietyById[varietyId]) {
      return;
    }

    const selectedIds = getCommittedQuoteSelectionIds();
    if (selectedIds.includes(varietyId)) {
      removeQuoteVariety(varietyId);
      return;
    }

    if (selectedIds.length >= QUOTE_MAX_VARIETIES) {
      return;
    }

    state.quoteSelectedVarietyIds = [...selectedIds, varietyId];
    state.quoteHasUserSelection = true;
    renderQuoteCalculator();
  };

  const getDefaultQuoteSelectionIds = () =>
    state.quoteVarieties
      .slice(0, Math.min(QUOTE_DEFAULT_SELECTION_COUNT, QUOTE_MAX_VARIETIES))
      .map((item) => item.id);

  const getRandomQuoteSelectionIds = (count = QUOTE_DEFAULT_SELECTION_COUNT) => {
    const pool = [...state.quoteVarieties];
    for (let index = pool.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
    }
    const maxCount = Math.max(1, Math.min(count, QUOTE_MAX_VARIETIES, pool.length));
    return pool.slice(0, maxCount).map((item) => item.id);
  };

  const shuffleQuoteSelection = async () => {
    if (!state.quoteVarieties.length || state.quoteShuffleAnimating) {
      return;
    }

    const selectedCardNodes =
      refs.quoteSelectedGrid instanceof HTMLElement
        ? Array.from(refs.quoteSelectedGrid.children).filter(
            (node) => node instanceof HTMLElement
          )
        : [];
    const selectedCardCount = selectedCardNodes.length;
    const nextSelectionCount = Math.max(
      1,
      Math.min(
        QUOTE_MAX_VARIETIES,
        selectedCardCount || state.quoteSelectedVarietyIds.length || QUOTE_DEFAULT_SELECTION_COUNT
      )
    );
    const derangedOrder = createQuoteDerangedOrder(selectedCardNodes.length);
    const reorderedCards = derangedOrder.map((index) => selectedCardNodes[index]);
    let nextSelectionIds = getRandomQuoteSelectionIds(nextSelectionCount);

    if (reorderedCards.length && reorderedCards.length === nextSelectionIds.length) {
      const oldVarietyIdsByIncomingSlot = reorderedCards.map((card) =>
        normalizeText(card.dataset.eventosSelectedVarietyId)
      );
      let attempt = 0;
      while (
        attempt < 24 &&
        nextSelectionIds.some(
          (varietyId, index) => normalizeText(varietyId) === oldVarietyIdsByIncomingSlot[index]
        )
      ) {
        nextSelectionIds = getRandomQuoteSelectionIds(nextSelectionCount);
        attempt += 1;
      }
    }

    setQuoteShuffleBusy(true);
    pulseQuoteRandomButton();

    try {
      await preloadQuoteVarietyImages(nextSelectionIds);

      if (
        !(refs.quoteSelectedGrid instanceof HTMLElement) ||
        !selectedCardNodes.length ||
        selectedCardNodes.length !== nextSelectionIds.length
      ) {
        await runQuoteShuffleViewTransition(() => {
          setQuoteSelection(nextSelectionIds);
        });
        return;
      }

      await runQuoteShuffleViewTransition(() => {
        reorderedCards.forEach((card) => {
          refs.quoteSelectedGrid.appendChild(card);
        });

        reorderedCards.forEach((card, index) => {
          const varietyId = nextSelectionIds[index];
          setQuoteVarietyCardContent(card, varietyId);
        });

        state.quoteSelectedVarietyIds = nextSelectionIds.slice(0, QUOTE_MAX_VARIETIES);
        state.quoteHasUserSelection = state.quoteSelectedVarietyIds.length > 0;
        refs.quoteSelectedGrid.dataset.selectedCount = String(state.quoteSelectedVarietyIds.length);

        const hasVarieties = state.quoteSelectedVarietyIds.length > 0;
        if (refs.quoteSelectedEmpty instanceof HTMLElement) {
          refs.quoteSelectedEmpty.hidden = hasVarieties;
        }

        renderQuoteVarietyCounter();
        if (state.quoteVarietyModalOpen && !syncQuoteVarietyModalOptionStates()) {
          renderQuoteVarietyModalOptions();
        }

        const breakdown = getQuoteBreakdown();
        renderQuoteSummary(breakdown);
        renderQuoteWhatsappState(breakdown);
      });
    } finally {
      setQuoteShuffleBusy(false);
    }
  };

  const setQuoteSelection = (ids) => {
    const uniqueIds = [];
    const seen = new Set();
    ids.forEach((id) => {
      if (!state.quoteVarietyById[id] || seen.has(id)) {
        return;
      }
      seen.add(id);
      uniqueIds.push(id);
    });
    state.quoteSelectedVarietyIds = uniqueIds.slice(0, QUOTE_MAX_VARIETIES);
    state.quoteHasUserSelection = state.quoteSelectedVarietyIds.length > 0;
    renderQuoteCalculator();
  };

  const clearQuoteSelection = () => {
    state.quoteSelectedVarietyIds = [];
    state.quoteHasUserSelection = true;
    renderQuoteCalculator();
  };

  const parseQuoteVarieties = (menuPayload) => {
    const sections = Array.isArray(menuPayload?.sections) ? menuPayload.sections : [];
    const seenIds = new Set();
    const candidates = [];

    sections.forEach((section) => {
      const sectionKey = toLookupKey(section?.id || section?.label);
      const sectionLooksLikePizza = sectionKey.includes('pizza');
      const items = Array.isArray(section?.items) ? section.items : [];

      items.forEach((item) => {
        const categoryKey = toLookupKey(item?.category || section?.id || '');
        const looksLikePizza = sectionLooksLikePizza || categoryKey.includes('pizza');
        const id = normalizeText(item?.id);
        const name = normalizeText(item?.name);
        const image = normalizeText(item?.image);
        const price = Number(item?.price);

        if (!looksLikePizza || !id || !name || !image || !Number.isFinite(price)) {
          return;
        }

        if (seenIds.has(id)) {
          return;
        }

        seenIds.add(id);
        candidates.push(
          Object.freeze({
            id,
            name,
            image,
            price: Math.round(price),
            description: normalizeText(
              item?.description ||
                item?.descriptionShort ||
                item?.descriptionLong ||
                item?.summary ||
                item?.sensory_profile?.summary ||
                ''
            ),
            searchText: normalizeSearchQueryValue(name),
          })
        );
      });
    });

    const byPriceDesc = [...candidates].sort(
      (a, b) => b.price - a.price || a.name.localeCompare(b.name, 'es')
    );
    const excludedIds = new Set(
      byPriceDesc.slice(0, 5).map((item) => item.id)
    );

    const available = candidates
      .filter((item) => !excludedIds.has(item.id))
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
    const excluded = candidates
      .filter((item) => excludedIds.has(item.id))
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));

    return Object.freeze({
      available,
      excluded,
    });
  };

  const loadQuoteVarieties = async () => {
    const response = await fetch(getMenuDataPath(), { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`No se pudo cargar data/menu.json (${response.status})`);
    }
    const payload = await response.json();
    return parseQuoteVarieties(payload);
  };

  const initQuoteCalculator = () => {
    refs.quoteRoot = document.querySelector('[data-eventos-cotizador]');
    refs.quoteTotalValue = document.querySelector('[data-eventos-total-value]');
    refs.quoteTotalMinusButton = document.querySelector('[data-eventos-total-minus]');
    refs.quoteTotalPlusButton = document.querySelector('[data-eventos-total-plus]');
    refs.quoteVarietyOpenButton = document.querySelector('[data-eventos-variety-open]');
    refs.quoteVarietyRandomButton = document.querySelector('[data-eventos-variety-random]');
    refs.quoteVarietySelectionCounter = document.querySelector('[data-eventos-variety-selection-counter]');
    refs.quoteSelectedGrid = document.querySelector('[data-eventos-selected-varieties]');
    refs.quoteSelectedEmpty = document.querySelector('[data-eventos-selected-empty]');
    refs.quoteSummaryPizzasLine = document.querySelector('[data-eventos-summary-pizzas-line]');
    refs.quoteSummarySubtotal = document.querySelector('[data-eventos-summary-subtotal]');
    refs.quoteSummaryBaseFee = document.querySelector('[data-eventos-summary-base-fee]');
    refs.quoteSummaryServiceFee = document.querySelector('[data-eventos-summary-service-fee]');
    refs.quoteSummaryTotal = document.querySelector('[data-eventos-summary-total]');
    refs.quoteTotalInfoToggle = document.querySelector('#eventos-total-info-toggle');
    refs.quoteMenuInfoToggle = document.querySelector('#eventos-menu-info-toggle');
    refs.quoteSummaryInfoToggle = document.querySelector('#eventos-summary-info-toggle');
    refs.quoteWhatsappButton = document.querySelector('[data-eventos-whatsapp-cta]');
    refs.quoteWhatsappHint = document.querySelector('[data-eventos-whatsapp-hint]');
    refs.varietyModal = document.querySelector('[data-eventos-variety-modal]');
    refs.varietyModalCloseButtons = Array.from(document.querySelectorAll('[data-eventos-variety-close]'));
    refs.varietyModalClearButton = document.querySelector('[data-eventos-variety-clear]');
    refs.varietyModalDoneButton = document.querySelector('[data-eventos-variety-done]');
    refs.varietyModalCounter = document.querySelector('[data-eventos-variety-counter]');
    refs.varietyModalSearchRoot = document.querySelector('[data-eventos-variety-search]');
    refs.varietyModalSearchInput = document.querySelector('[data-eventos-variety-search-input]');
    refs.varietyModalSearchClear = document.querySelector('[data-eventos-variety-search-clear]');
    refs.varietyModalGrid = document.querySelector('[data-eventos-variety-grid]');

    if (
      !(refs.quoteRoot instanceof HTMLElement) ||
      !(refs.quoteTotalValue instanceof HTMLElement) ||
      !(refs.quoteVarietyOpenButton instanceof HTMLButtonElement) ||
      !(refs.quoteVarietyRandomButton instanceof HTMLButtonElement) ||
      !(refs.quoteSelectedGrid instanceof HTMLElement) ||
      !(refs.quoteWhatsappButton instanceof HTMLButtonElement) ||
      !(refs.varietyModal instanceof HTMLElement) ||
      !(refs.varietyModalSearchRoot instanceof HTMLElement) ||
      !(refs.varietyModalSearchInput instanceof HTMLInputElement) ||
      !(refs.varietyModalSearchClear instanceof HTMLButtonElement) ||
      !(refs.varietyModalGrid instanceof HTMLElement)
    ) {
      return;
    }

    refs.quoteVarietyOpenButton.disabled = true;
    refs.quoteVarietyRandomButton.disabled = true;
    refs.quoteVarietyOpenButton.textContent = 'Cargando variedades...';

    refs.quoteTotalMinusButton?.addEventListener('click', () => {
      pulseQuoteTotalStepper(refs.quoteTotalMinusButton);
      setQuoteTotalPizzas(state.quoteTotalPizzas - 1);
    });
    refs.quoteTotalPlusButton?.addEventListener('click', () => {
      pulseQuoteTotalStepper(refs.quoteTotalPlusButton);
      setQuoteTotalPizzas(state.quoteTotalPizzas + 1);
    });

    refs.quoteVarietyOpenButton.addEventListener('click', () => {
      setQuoteVarietyModalOpen(true);
      closeQuoteInfoTooltips();
    });

    refs.quoteVarietyRandomButton.addEventListener('click', () => {
      closeQuoteInfoTooltips();
      void shuffleQuoteSelection();
    });

    refs.quoteRoot.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const infoToggle = target.closest('[data-eventos-info-toggle]');
      if (infoToggle instanceof HTMLButtonElement) {
        event.preventDefault();
        const isOpen = infoToggle.getAttribute('aria-expanded') === 'true';
        setQuoteInfoOpen(infoToggle, !isOpen);
        return;
      }

      if (!target.closest('[data-eventos-info]')) {
        closeQuoteInfoTooltips();
      }
    });

    document.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      if (target.closest('[data-eventos-info]')) {
        return;
      }
      closeQuoteInfoTooltips();
    });

    refs.varietyModalCloseButtons.forEach((button) => {
      button.addEventListener('click', () => {
        setQuoteVarietyModalOpen(false);
      });
    });

    if (refs.varietyModalClearButton instanceof HTMLButtonElement) {
      refs.varietyModalClearButton.addEventListener('click', () => {
        clearQuoteSelection();
      });
    }

    if (refs.varietyModalDoneButton instanceof HTMLButtonElement) {
      refs.varietyModalDoneButton.addEventListener('click', () => {
        setQuoteVarietyModalOpen(false);
      });
    }

    refs.varietyModalSearchInput.addEventListener('input', () => {
      state.quoteVarietySearchQuery = normalizeText(refs.varietyModalSearchInput.value);
      renderQuoteVarietyModalOptions();
    });

    refs.varietyModalSearchInput.addEventListener('search', () => {
      state.quoteVarietySearchQuery = normalizeText(refs.varietyModalSearchInput.value);
      renderQuoteVarietyModalOptions();
    });

    refs.varietyModalSearchInput.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') {
        return;
      }

      if (!normalizeText(refs.varietyModalSearchInput.value)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      refs.varietyModalSearchInput.value = '';
      state.quoteVarietySearchQuery = '';
      renderQuoteVarietyModalOptions();
    });

    refs.varietyModalSearchClear.addEventListener('click', (event) => {
      event.preventDefault();
      refs.varietyModalSearchInput.value = '';
      state.quoteVarietySearchQuery = '';
      renderQuoteVarietyModalOptions();

      if (document.activeElement === refs.varietyModalSearchInput) {
        refs.varietyModalSearchInput.blur();
      }
    });

    refs.varietyModalGrid.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const option = target.closest('.eventos-variety-option');
      if (!(option instanceof HTMLButtonElement) || option.disabled) {
        return;
      }
      const varietyId = option.dataset.eventosVarietyId || '';
      if (!varietyId) {
        return;
      }
      const isPointerInteraction = event.detail > 0;
      toggleQuoteVarietySelection(varietyId);
      if (isPointerInteraction) {
        window.requestAnimationFrame(() => {
          if (document.activeElement === option) {
            option.blur();
          }
        });
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') {
        return;
      }

      if (state.quoteVarietyModalOpen) {
        event.preventDefault();
        setQuoteVarietyModalOpen(false);
        return;
      }

      if (
        getQuoteInfoToggles().some(
          (toggle) => toggle.getAttribute('aria-expanded') === 'true'
        )
      ) {
        event.preventDefault();
        closeQuoteInfoTooltips();
      }
    });

    refs.quoteWhatsappButton.addEventListener('click', () => {
      const breakdown = getQuoteBreakdown();
      if (!isQuoteReadyForWhatsapp(breakdown)) {
        return;
      }

      const message = buildQuoteWhatsappMessage(breakdown);
      const whatsappUrl = `https://wa.me/${WHATSAPP_QUOTE_PHONE}?text=${encodeURIComponent(
        message
      )}`;
      window.open(whatsappUrl, '_blank', 'noopener');
    });

    renderQuoteCalculator();

    loadQuoteVarieties()
      .then((result) => {
        state.quoteVarieties = result.available;
        state.quoteExcludedVarieties = result.excluded;
        state.quoteVarietyById = result.available.reduce((lookup, item) => {
          lookup[item.id] = item;
          return lookup;
        }, Object.create(null));
        state.quoteDefaultPreviewVarietyIds = getDefaultQuoteSelectionIds();
        state.quoteSelectedVarietyIds = [];
        state.quoteHasUserSelection = false;
        state.quoteLoadError = '';
        renderQuoteCalculator();

        refs.quoteVarietyOpenButton.disabled = false;
        refs.quoteVarietyRandomButton.disabled = false;
        refs.quoteVarietyOpenButton.textContent = 'Elegir variedades';
      })
      .catch((error) => {
        state.quoteLoadError =
          'No pudimos cargar las variedades en este momento. Intenta nuevamente en unos minutos.';
        refs.quoteVarietyOpenButton.disabled = true;
        refs.quoteVarietyRandomButton.disabled = true;
        refs.quoteVarietyOpenButton.textContent = 'Variedades no disponibles';
        if (refs.quoteWhatsappHint instanceof HTMLElement) {
          refs.quoteWhatsappHint.textContent = state.quoteLoadError;
        }
        console.error('[eventos-cotizador] Error cargando variedades.', error);
        renderQuoteCalculator();
      });
  };

  const initHeroVideo = () => {
    const heroVideo = document.querySelector('[data-video-slot="pizza-party-hero-loop"]');

    if (!(heroVideo instanceof HTMLVideoElement)) {
      return;
    }

    const playAttempt = heroVideo.play();
    if (playAttempt && typeof playAttempt.catch === 'function') {
      playAttempt.catch(() => {
        heroVideo.controls = true;
      });
    }
  };

  const initSectionParallax = () => {
    const parallaxEntries = [
      {
        frame: document.querySelector('[data-eventos-what-parallax]'),
        imageSelector: '[data-eventos-what-parallax-image]',
      },
      {
        frame: document.querySelector('[data-eventos-collage-parallax]'),
        imageSelector: '[data-eventos-collage-parallax-image]',
      },
    ]
      .map((entry) => {
        if (!(entry.frame instanceof HTMLElement)) {
          return null;
        }
        const image = entry.frame.querySelector(entry.imageSelector);
        if (!(image instanceof HTMLImageElement)) {
          return null;
        }
        return {
          frame: entry.frame,
          image,
          maxShift: 0,
        };
      })
      .filter(Boolean);

    if (!parallaxEntries.length) {
      return;
    }

    let frameTickId = 0;
    const clampRange = (value, min, max) => Math.min(max, Math.max(min, value));

    const applyParallaxFrame = () => {
      frameTickId = 0;

      if (reducedMotionQuery.matches) {
        parallaxEntries.forEach((entry) => {
          entry.frame.style.setProperty('--eventos-parallax-y', '0px');
        });
        return;
      }

      const viewportHeight = window.innerHeight || root.clientHeight || 1;
      const viewportCenter = viewportHeight / 2;

      parallaxEntries.forEach((entry) => {
        const rect = entry.frame.getBoundingClientRect();
        const frameCenter = rect.top + rect.height / 2;
        const delta = viewportCenter - frameCenter;
        const normalized = clampRange(delta / (viewportHeight * 0.65), -1, 1);
        const shift = normalized * entry.maxShift;
        entry.frame.style.setProperty('--eventos-parallax-y', `${shift.toFixed(2)}px`);
      });
    };

    const queueParallaxFrame = () => {
      if (frameTickId) {
        return;
      }
      frameTickId = window.requestAnimationFrame(applyParallaxFrame);
    };

    const measureParallaxFrame = () => {
      parallaxEntries.forEach((entry) => {
        entry.maxShift = entry.frame.clientHeight / 6;
      });
      queueParallaxFrame();
    };

    const handleMotionPreferenceChange = () => {
      if (reducedMotionQuery.matches) {
        parallaxEntries.forEach((entry) => {
          entry.frame.style.setProperty('--eventos-parallax-y', '0px');
        });
        return;
      }
      queueParallaxFrame();
    };

    window.addEventListener('scroll', queueParallaxFrame, { passive: true });
    window.addEventListener('resize', measureParallaxFrame, { passive: true });
    window.addEventListener('orientationchange', measureParallaxFrame);

    if (typeof reducedMotionQuery.addEventListener === 'function') {
      reducedMotionQuery.addEventListener('change', handleMotionPreferenceChange);
    } else if (typeof reducedMotionQuery.addListener === 'function') {
      reducedMotionQuery.addListener(handleMotionPreferenceChange);
    }

    parallaxEntries.forEach((entry) => {
      if (!entry.image.complete) {
        entry.image.addEventListener('load', measureParallaxFrame, { once: true });
      }
    });

    measureParallaxFrame();
  };

  const init = () => {
    initFaqAccordion();
    initPhotoTour();
    initQuoteCalculator();
    initHeroVideo();
    initSectionParallax();
    initMenuNavbar();
  };

  document.addEventListener('figata:public-navbar-ready', initMenuNavbar);

  const navbarReady = window.FigataPublicNavbar?.whenReady;
  if (typeof navbarReady === 'function') {
    navbarReady()
      .then(init)
      .catch(init);
    return;
  }

  init();
})();
