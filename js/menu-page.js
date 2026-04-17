(() => {
  const publicPaths = window.FigataPublicPaths || null;
  const analyticsCommerce = window.FigataAnalyticsCommerce || null;
  const analyticsPerformance = window.FigataAnalyticsPerformance || null;
  const analyticsSdk = window.FigataAnalyticsSDK || null;
  const ROOT_URL = publicPaths?.baseUrl
    ? new URL(publicPaths.baseUrl.toString())
    : new URL(document.baseURI || '/', window.location.origin);
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
  const SEARCH_HELPER_WORDS_DEFAULT = Object.freeze([
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
  const MENU_CART_TARGET_SELECTOR = '[data-menu-cart-target]';
  const MENU_CART_BADGE_CLASS = 'navbar__menu-cart-badge';
  const MENU_CART_PULSE_CLASS = 'is-menu-cart-pulse';
  const MENU_CART_COUNT_CAP = 99;
  const MENU_CART_PULSE_MS = 320;
  const MENU_CART_FLIGHT_MIN_MS = 460;
  const MENU_CART_FLIGHT_MAX_MS = 760;
  const MENU_CART_FLIGHT_EASE = 'cubic-bezier(0.18, 0.78, 0.32, 1)';
  const MENU_CART_FALLBACK_COMMIT_DELAY_MS = 140;
  const DETAIL_ADD_QTY_MIN = 1;
  const DETAIL_ADD_QTY_MAX = 99;
  const DEFAULT_RESTAURANT_WHATSAPP_URL = 'https://wa.me/18095245117';
  const DEFAULT_COMMERCE_CURRENCY = 'DOP';
  const MENU_DETAIL_ORIGIN_GRID = 'menu_grid';
  const MENU_DETAIL_ORIGIN_DIRECT = 'menu_direct';
  const MENU_DETAIL_ORIGIN_ROUTE = 'menu_detail';
  const MENU_DETAIL_ORIGIN_ACCOUNT = 'account_modal';
  const MENU_DETAIL_ORIGIN_UNDO = 'account_undo';
  const MENU_IMPRESSION_LIST_SEARCH = 'menu_search_results';
  const MENU_IMPRESSION_LIST_SEARCH_NAME = 'Resultados de busqueda';
  const ACCOUNT_STORAGE_KEY = 'figata:menu-account:v2';
  const ACCOUNT_STORAGE_VERSION = 2;
  const ACCOUNT_STORAGE_TTL_MS = 3 * 60 * 60 * 1000;
  const ACCOUNT_UNCATEGORIZED_GROUP_ID = '__otros__';
  const ACCOUNT_UNCATEGORIZED_GROUP_LABEL = 'Otros';
  const ACCOUNT_ITBIS_RATE = 0.18;
  const ACCOUNT_LEGAL_TIP_RATE = 0.1;
  const ACCOUNT_VALUE_OUT_DURATION_MS = SEARCH_HELPER_OUT_DURATION_MS;
  const ACCOUNT_VALUE_IN_DURATION_MS = SEARCH_HELPER_IN_DURATION_MS;
  const ACCOUNT_VALUE_IN_DELAY_MS = SEARCH_HELPER_IN_DELAY_MS;
  const ACCOUNT_VALUE_OUT_STAGGER_MS = SEARCH_HELPER_OUT_STAGGER_MS;
  const ACCOUNT_VALUE_IN_STAGGER_MS = SEARCH_HELPER_IN_STAGGER_MS;
  const ACCOUNT_VALUE_OUT_Y_PX = SEARCH_HELPER_OUT_Y_PX;
  const ACCOUNT_VALUE_IN_Y_PX = SEARCH_HELPER_IN_Y_PX;
  const ACCOUNT_VALUE_BLUR_PX = SEARCH_HELPER_BLUR_PX;
  const ACCOUNT_VALUE_OUT_EASE = SEARCH_HELPER_OUT_EASE;
  const ACCOUNT_VALUE_IN_EASE = SEARCH_HELPER_IN_EASE;
  const ACCOUNT_REMOVE_TOAST_DURATION_MS = 6000;
  const ACCOUNT_REMOVE_TOAST_TITLE_DEFAULT = 'Ítem eliminado';
  const ACCOUNT_REMOVE_TOAST_COPY_DEFAULT = 'Si fue un error, aún puedes deshacerlo';
  const ACCOUNT_CARD_VIEW_TRANSITION_MS = 360;
  const ACCOUNT_CARD_VIEW_TRANSITION_EASE = 'cubic-bezier(0, 0, 0.2, 1)';
  const ACCOUNT_CARD_LAYOUT_MOVE_MS = 620;
  const ACCOUNT_CARD_LAYOUT_MOVE_EASE = 'cubic-bezier(0.16, 0.84, 0.24, 1)';
  const ACCOUNT_CARD_LAYOUT_EPSILON_PX = 0.5;
  const ACCOUNT_CARD_EXIT_X_PX = -60;
  const ACCOUNT_CARD_EXIT_BLUR_PX = 3;
  const ACCOUNT_EMPTY_STATE_EXIT_MS = 360;
  const ACCOUNT_EMPTY_STATE_ENTER_MS = 380;
  const ACCOUNT_EMPTY_STATE_EXIT_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
  const ACCOUNT_EMPTY_STATE_ENTER_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const ACCOUNT_EMPTY_ART_SIZE_PX = 500;
  const MENU_ROUTE_VIEW_TRANSITION_ROOT_ATTR = 'data-menu-route-vt';
  const MENU_ROUTE_VIEW_TRANSITION_ROOT_ACTIVE = 'active';
  const MENU_ROUTE_VIEW_TRANSITION_DIRECTION_ATTR = 'data-menu-route-vt-direction';
  const MENU_ROUTE_VIEW_TRANSITION_FORWARD = 'forward';
  const MENU_ROUTE_VIEW_TRANSITION_BACK = 'back';
  const MENU_DETAIL_OVERLAY_RUNTIME_PATH = 'js/nosotros-lottie-runtime.js';
  const MENU_DETAIL_OVERLAY_MIN_DURATION_MS = 420;
  const MENU_DETAIL_OVERLAY_REDUCED_MIN_DURATION_MS = 120;
  const MENU_DETAIL_OVERLAY_EXIT_DURATION_MS = 170;
  const MENU_DETAIL_OVERLAY_FALLBACK_TEXT = 'Sirviendo en breve…';
  const FILTER_MODAL_EXIT_MS = 520;
  const FILTER_MODAL_FOOTER_SHADOW_EPSILON = 2;
  const SEARCH_EMPTY_ART_PATH = 'assets/home/no-result.webp';
  const DETAIL_EDITORIAL_HERO_QUERY = window.matchMedia('(max-width: 767px)');
  const MENU_ROUTE_MOBILE_QUERY = window.matchMedia('(max-width: 820px)');
  const MOBILE_CARD_QUERY = window.matchMedia('(max-width: 1023px)');
  const CARD_HOVER_MEDIA_QUERY = window.matchMedia('(hover: hover) and (pointer: fine)');
  const CARD_IMAGE_PRIORITY_COUNT = 4;
  const MOBILE_PROGRESSIVE_CARD_BATCH_SIZE = 2;
  const NON_CRITICAL_MENU_TASK_TIMEOUT_MS = 900;
  const INITIAL_MOBILE_SEED_CARD_COUNT = 4;
  const CARD_FULL_IMAGE_FADE_MS = 200;
  const CARD_LQIP_EXIT_FADE_MS = 500;
  const CARD_LQIP_EXIT_DELAY_MS = CARD_FULL_IMAGE_FADE_MS;
  const CATALOG_CARD_MEDIA_RECOVERY_MAX_ATTEMPTS = 18;
  const CATALOG_CARD_MEDIA_RECOVERY_INTERVAL_MS = 120;
  const DETAIL_FULL_IMAGE_FADE_MS = CARD_FULL_IMAGE_FADE_MS;
  const DETAIL_LQIP_EXIT_FADE_MS = CARD_LQIP_EXIT_FADE_MS;
  const DETAIL_LQIP_EXIT_DELAY_MS = DETAIL_FULL_IMAGE_FADE_MS;
  const DETAIL_NEXT_IMAGE_PREFETCH_DELAY_MS = 180;
  const MENU_CATALOG_LQIP_READY_EVENT = 'figata:menu-catalog-lqip-ready';
  const MENU_DETAIL_READY_EVENT = 'figata:menu-detail-ready';
  const INITIAL_MOBILE_CATALOG_SEED_ATTR = 'data-initial-mobile-catalog-seed';
  const menuCommerceImpressionObserver =
    analyticsCommerce?.createImpressionObserver
      ? analyticsCommerce.createImpressionObserver({
          rootMargin: '0px 0px -12% 0px',
          threshold: 0.45,
        })
      : null;
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
  const ADMIN_PREVIEW_MODAL_KEYS_LIST = Object.freeze([
    'account',
    'filter',
    'compare',
  ]);
  const normalizeAdminPreviewModalKey = (value) => {
    const normalized = String(value || '').trim().toLowerCase();
    return ADMIN_PREVIEW_MODAL_KEYS_LIST.includes(normalized) ? normalized : '';
  };
  const queryParams = new URL(window.location.href).searchParams;
  const isAdminPreviewMode = queryParams.get('adminPreview') === '1';
  const adminPreviewSurface = String(queryParams.get('adminPreviewSurface') || '')
    .trim()
    .toLowerCase();
  const adminPreviewModalRequested = normalizeAdminPreviewModalKey(
    queryParams.get('adminPreviewModal')
  );
  let adminPreviewModalActive =
    adminPreviewModalRequested ||
    (adminPreviewSurface === 'modal' ? 'account' : '');
  const menuPageTitle = document.getElementById('menu-page-title');
  const menuPageSubtitle = document.getElementById('menu-page-subtitle');
  const tabRoot = document.getElementById('menu-page-tabs');
  const contentRoot = document.getElementById('menu-categories-content');
  const statusNode = document.getElementById('menu-page-status');
  const searchRoot = document.getElementById('menu-page-search');
  const searchInput = document.getElementById('menu-page-search-input');
  const searchHelper = document.getElementById('menu-page-search-helper');
  const searchHelperPrefix = document.getElementById('menu-page-search-helper-prefix');
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
  const detailBadge = document.getElementById('menu-detail-badge');
  const detailBadgeIcon = document.getElementById('menu-detail-badge-icon');
  const detailBadgeLabel = document.getElementById('menu-detail-badge-label');
  const detailPanel = document.getElementById('menu-detail-panel');
  const detailHeaderSection = document.getElementById('menu-detail-header-section');
  const detailHeroHeader =
    detailPanel instanceof HTMLElement
      ? detailPanel.querySelector('.menu-page-detail__hero')
      : null;
  const detailMedia = document.getElementById('menu-detail-media');
  const detailEditorialRoot = document.getElementById('menu-detail-editorial');
  const detailEditorialTrack = document.getElementById('menu-detail-editorial-track');
  const detailEditorialDots = document.getElementById('menu-detail-editorial-dots');
  const detailImage = document.getElementById('menu-detail-image');
  const detailTitle = document.getElementById('menu-detail-title');
  const detailChipCalories = document.getElementById('menu-detail-chip-calories');
  const detailChipCaloriesValue = document.getElementById('menu-detail-chip-calories-value');
  const detailChipEta = document.getElementById('menu-detail-chip-eta');
  const detailChipEtaValue = document.getElementById('menu-detail-chip-eta-value');
  const detailChipRatingValue = document.getElementById('menu-detail-chip-rating-value');
  const detailDescription = document.getElementById('menu-detail-description');
  const detailPrice = document.getElementById('menu-detail-price');
  const detailSensoryTitle = document.getElementById('menu-detail-sensory-title');
  const detailSensoryDivider = document.getElementById('menu-detail-sensory-divider');
  const detailSensorySection = document.getElementById('menu-detail-sensory-section');
  const detailSensoryViewTabsRoot = document.getElementById(
    'menu-detail-sensory-view-tabs'
  );
  const detailSensoryBarsPanel = document.getElementById(
    'menu-detail-sensory-bars-panel'
  );
  const detailSensoryRadarPanel = document.getElementById(
    'menu-detail-sensory-radar-panel'
  );
  const detailSensoryPanelsStack = document.getElementById(
    'menu-detail-sensory-panels-stack'
  );
  const detailSensoryGroups = document.getElementById('menu-detail-sensory-groups');
  const detailSensoryRadar = document.getElementById('menu-detail-sensory-radar');
  const detailSensorySummary = document.getElementById('menu-detail-sensory-summary');
  const detailSensorySubtitle = document.getElementById('menu-detail-sensory-subtitle');
  const detailSensoryCompareButton = document.getElementById('menu-detail-sensory-compare');
  const detailSensoryComparisonMeta = document.getElementById(
    'menu-detail-sensory-comparison-meta'
  );
  const detailSensoryComparisonCurrentName = document.getElementById(
    'menu-detail-sensory-comparison-current-name'
  );
  const detailSensoryComparisonComparedName = document.getElementById(
    'menu-detail-sensory-comparison-compared-name'
  );
  const detailSensoryComparisonClearButton = document.getElementById(
    'menu-detail-sensory-comparison-clear'
  );
  const detailSensoryTabRadarTitle = document.getElementById(
    'menu-detail-sensory-tab-radar-title'
  );
  const detailSensoryTabBarsTitle = document.getElementById(
    'menu-detail-sensory-tab-bars-title'
  );
  const detailPairingsDivider = document.getElementById('menu-detail-pairings-divider');
  const detailPairingsSection = document.getElementById('menu-detail-pairings-section');
  const detailPairingsTitle = document.getElementById('menu-detail-pairings-title');
  const detailPairingsSubtitle = document.getElementById('menu-detail-pairings-subtitle');
  const detailPairingsList = document.getElementById('menu-detail-pairings-list');
  const detailPairingTemplate = document.getElementById('menu-detail-pairing-template');
  const detailHistoryDivider = document.getElementById('menu-detail-history-divider');
  const detailHistorySection = document.getElementById('menu-detail-history-section');
  const detailHistoryTitle = document.getElementById('menu-detail-history-title');
  const detailHistoryBody = document.getElementById('menu-detail-history-body');
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
  const detailCloseButton = document.getElementById('menu-detail-close');
  const detailAddCtaSection = document.getElementById('menu-detail-add-cta-section');
  const detailAddButton = document.getElementById('menu-detail-add');
  const detailQuantityStepper = document.getElementById('menu-detail-qty-stepper');
  const detailQuantityDecreaseButton = document.getElementById(
    'menu-detail-qty-decrease'
  );
  const detailQuantityIncreaseButton = document.getElementById(
    'menu-detail-qty-increase'
  );
  const detailQuantityValue = document.getElementById('menu-detail-qty-value');
  const menuPageBody = document.body;

  if (isAdminPreviewMode) {
    document.documentElement.classList.add('menu-admin-preview');
    document.documentElement.setAttribute('data-disable-scroll-indicator', 'true');
    document.documentElement.setAttribute(
      'data-admin-preview-surface',
      adminPreviewSurface || 'detail'
    );
    if (adminPreviewModalActive) {
      document.documentElement.setAttribute(
        'data-admin-preview-modal',
        adminPreviewModalActive
      );
    } else {
      document.documentElement.removeAttribute('data-admin-preview-modal');
    }
    if (menuPageBody instanceof HTMLElement) {
      menuPageBody.classList.add('menu-admin-preview-body');
      menuPageBody.setAttribute('data-menu-admin-preview', 'true');
      menuPageBody.setAttribute('data-disable-scroll-indicator', 'true');
      menuPageBody.setAttribute(
        'data-admin-preview-surface',
        adminPreviewSurface || 'detail'
      );
      if (adminPreviewModalActive) {
        menuPageBody.setAttribute('data-admin-preview-modal', adminPreviewModalActive);
      } else {
        menuPageBody.removeAttribute('data-admin-preview-modal');
      }
    }
  }
  const filterModal = document.getElementById('menu-filter-modal');
  const filterModalTitle = document.getElementById('menu-filter-modal-title');
  const filterDialog = document.getElementById('menu-filter-modal-dialog');
  const filterCloseButton = document.getElementById('menu-filter-modal-close');
  const filterClearButton = document.getElementById('menu-filter-modal-clear');
  const filterApplyButton = document.getElementById('menu-filter-modal-apply');
  const filterSectionTitleAllergens = document.getElementById('menu-filter-title-allergens');
  const filterSectionCopyAllergens = document.getElementById('menu-filter-copy-allergens');
  const filterSectionTitlePizzaType = document.getElementById('menu-filter-title-pizza-type');
  const filterSectionTitlePriceRange = document.getElementById('menu-filter-title-price-range');
  const filterSectionCopyPriceRange = document.getElementById('menu-filter-copy-price-range');
  const filterSectionTitleDietary = document.getElementById('menu-filter-title-dietary');
  const filterSectionTitleOrganoleptic = document.getElementById(
    'menu-filter-title-organoleptic'
  );
  const filterSectionCopyOrganoleptic = document.getElementById(
    'menu-filter-copy-organoleptic'
  );
  const filterPizzaTabAll = document.getElementById('menu-filter-pizza-tab-all');
  const filterPizzaTabClasica = document.getElementById('menu-filter-pizza-tab-clasica');
  const filterPizzaTabAutor = document.getElementById('menu-filter-pizza-tab-autor');
  const filterPriceLabelMin = document.getElementById('menu-filter-price-label-min');
  const filterPriceLabelMax = document.getElementById('menu-filter-price-label-max');
  const filterDietVegetarianTitle = document.getElementById(
    'menu-filter-diet-vegetarian-title'
  );
  const filterDietVegetarianDescription = document.getElementById(
    'menu-filter-diet-vegetarian-description'
  );
  const filterDietVeganTitle = document.getElementById('menu-filter-diet-vegan-title');
  const filterDietVeganDescription = document.getElementById(
    'menu-filter-diet-vegan-description'
  );
  const filterApplyPrefix = document.getElementById('menu-filter-apply-prefix');
  const filterApplySuffix = document.getElementById('menu-filter-apply-suffix');
  const filterPizzaTabsRoot = document.getElementById('menu-filter-modal-pizza-tabs');
  const filterOrganolepticCloud = document.getElementById('menu-filter-modal-organoleptic-cloud');
  const filterModalBody =
    filterDialog instanceof HTMLElement
      ? filterDialog.querySelector('.menu-filter-modal__body')
      : null;
  const accountModal = document.getElementById('menu-account-modal');
  const accountDialog = document.getElementById('menu-account-modal-dialog');
  const accountModalTitle = document.getElementById('menu-account-modal-title');
  const accountCloseButton = document.getElementById('menu-account-modal-close');
  const accountModalBody = document.getElementById('menu-account-modal-body');
  const accountLabelSubtotal = document.getElementById('menu-account-label-subtotal');
  const accountLabelItbis = document.getElementById('menu-account-label-itbis');
  const accountLabelLegalTip = document.getElementById('menu-account-label-legal-tip');
  const accountLabelTotal = document.getElementById('menu-account-label-total');
  const accountSubtotalNode = document.getElementById('menu-account-subtotal');
  const accountItbisNode = document.getElementById('menu-account-itbis');
  const accountLegalTipNode = document.getElementById('menu-account-legal-tip');
  const accountTotalNode = document.getElementById('menu-account-total');
  const accountTotalInfoToggle = document.getElementById('menu-account-total-info-toggle');
  const accountTotalInfoTitle = document.getElementById('menu-account-total-info-title');
  const accountTotalInfoCopy = document.getElementById('menu-account-total-info-copy');
  const accountCheckoutButton = document.getElementById('menu-account-checkout');
  const accountCheckoutNote = document.getElementById('menu-account-checkout-note');
  const accountToast = document.getElementById('menu-account-toast');
  const accountToastTitle = document.getElementById('menu-account-toast-title');
  const accountToastCopy = document.getElementById('menu-account-toast-copy');
  const compareModal = document.getElementById('menu-compare-modal');
  const compareDialog = document.getElementById('menu-compare-modal-dialog');
  const compareModalTitle = document.getElementById('menu-compare-modal-title');
  const compareModalDescription = document.getElementById('menu-compare-modal-description');
  const compareCloseButton = document.getElementById('menu-compare-modal-close');
  const compareModalBody = document.getElementById('menu-compare-modal-body');
  const compareSearchRoot = document.getElementById('menu-compare-search');
  const compareSearchInput = document.getElementById('menu-compare-search-input');
  const compareSearchHelperPrefix = document.getElementById('menu-compare-search-helper-prefix');
  const compareSearchHelperWord = document.getElementById('menu-compare-search-helper-word');
  const compareSearchClearButton = document.getElementById('menu-compare-search-clear');
  const compareResultsRoot = document.getElementById('menu-compare-results');
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
  const DETAIL_SENSORY_VIEW_IDS = Object.freeze(['radar', 'bars']);
  const DEFAULT_DETAIL_SENSORY_VIEW = 'radar';
  const DETAIL_SENSORY_RADAR_SVG_NS = 'http://www.w3.org/2000/svg';
  const DETAIL_SENSORY_RADAR_ICON_PATHS = Object.freeze({
    dulce: 'assets/menu/editorial/iconos/dulce.webp',
    salado: 'assets/menu/editorial/iconos/salado.webp',
    acido: 'assets/menu/editorial/iconos/acido.webp',
    cremosa: 'assets/menu/editorial/iconos/cremoso.webp',
    crujiente: 'assets/menu/editorial/iconos/crujiente.webp',
    ligero: 'assets/menu/editorial/iconos/ligero.webp',
    aromatico: 'assets/menu/editorial/iconos/aromatico.webp',
    intensidad: 'assets/menu/editorial/iconos/intenso.webp',
  });
  const DETAIL_SECTION_ICON_CONFIGS = Object.freeze({
    history: Object.freeze({
      viewBox: '0 -960 960 960',
      path:
        'M440-278v-394q-41-24-87-36t-93-12q-36 0-71.5 7T120-692v396q35-12 69.5-18t70.5-6q47 0 91.5 10.5T440-278Zm40 118q-48-38-104-59t-116-21q-42 0-82.5 11T100-198q-21 11-40.5-1T40-234v-482q0-11 5.5-21T62-752q46-24 96-36t102-12q74 0 126 17t112 52q11 6 16.5 14t5.5 21v418q44-21 88.5-31.5T700-320q36 0 70.5 6t69.5 18v-481q15 5 29.5 11t28.5 14q11 5 16.5 15t5.5 21v482q0 23-19.5 35t-40.5 1q-37-20-77.5-31T700-240q-60 0-116 21t-104 59Zm140-240v-440l120-40v440l-120 40Zm-340-99Z',
      fill: 'currentColor',
    }),
    sensory: Object.freeze({
      viewBox: '0 0 24 24',
      path:
        'M8.46447 15.5355C6.51185 13.5829 6.51185 10.4171 8.46447 8.46447M5.63592 18.364C2.1212 14.8493 2.1212 9.15077 5.63592 5.63605M15.5355 15.5355C17.4881 13.5829 17.4881 10.4171 15.5355 8.46447M18.364 18.364C21.8788 14.8493 21.8788 9.15077 18.364 5.63605M13 12.0001C13 12.5523 12.5523 13.0001 12 13.0001C11.4477 13.0001 11 12.5523 11 12.0001C11 11.4478 11.4477 11.0001 12 11.0001C12.5523 11.0001 13 11.4478 13 12.0001Z',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    }),
  });
  const DETAIL_SENSORY_AXIS_TOOLTIP_COPY = Object.freeze({
    dulce: Object.freeze({
      title: 'Dulzor',
      description: 'Qué tan presentes son las notas dulces.',
    }),
    salado: Object.freeze({
      title: 'Salinidad',
      description: 'Nivel de sal y sazón dominante.',
    }),
    acido: Object.freeze({
      title: 'Acidez',
      description: 'Frescura cítrica o sensación ácida en boca.',
    }),
    cremosa: Object.freeze({
      title: 'Cremosidad',
      description: 'Textura suave, untuosa y envolvente.',
    }),
    crujiente: Object.freeze({
      title: 'Crujiente',
      description: 'Grado de crocancia al morder.',
    }),
    ligero: Object.freeze({
      title: 'Ligereza',
      description: 'Qué tan liviano se siente el plato.',
    }),
    aromatico: Object.freeze({
      title: 'Aromas',
      description: 'Intensidad y riqueza aromática al servir.',
    }),
    intensidad: Object.freeze({
      title: 'Intensidad',
      description: 'Fuerza global del sabor en cada bocado.',
    }),
  });
  const DETAIL_SENSORY_TOOLTIP_AUTO_CLOSE_MS = 5000;
  const DETAIL_SENSORY_TOOLTIP_EXIT_MS = 620;
  const DETAIL_HERO_BADGE_FADE_MS = 220;
  const DETAIL_SENSORY_VIEW_EXIT_MS = 180;
  const DETAIL_SENSORY_VIEW_ENTER_MS = 300;
  const DETAIL_SENSORY_VIEW_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const DETAIL_SENSORY_SECTION_RESIZE_BASE_MS = 430;
  const DETAIL_SENSORY_SECTION_RESIZE_EASE = 'cubic-bezier(0.42, 0, 0.58, 1)';
  const DETAIL_SENSORY_RADAR_REVEAL_MS = 520;
  const DETAIL_SENSORY_RADAR_STAGGER_MS = 68;
  const DETAIL_SENSORY_BARS_REVEAL_MS = 760;
  const DETAIL_SENSORY_BARS_STAGGER_MS = 92;
  const DETAIL_HERO_BADGE_KIND = Object.freeze({
    VEGAN: 'vegan',
    VEGETARIAN: 'vegetarian',
    FEATURED: 'featured',
  });
  const DETAIL_EDITORIAL_COMPARE_MODE = Object.freeze({
    AUTO: 'auto',
    ENABLED: 'enabled',
    DISABLED: 'disabled',
  });
  const DETAIL_SECTION_VISIBILITY_KEYS = Object.freeze([
    'hero_media',
    'header',
    'ingredients',
    'allergens',
    'add_cta',
    'sensory',
    'pairings',
    'story',
  ]);
  const DETAIL_EDITORIAL_HERO_BADGE_NONE = 'none';
  const DETAIL_HERO_BADGE_COPY = Object.freeze({
    [DETAIL_HERO_BADGE_KIND.VEGAN]: 'Vegana',
    [DETAIL_HERO_BADGE_KIND.VEGETARIAN]: 'Vegetariana',
    [DETAIL_HERO_BADGE_KIND.FEATURED]: 'Top Seller',
  });
  const DETAIL_HERO_BADGE_ICON_BY_KIND = Object.freeze({
    [DETAIL_HERO_BADGE_KIND.VEGAN]: 'assets/vegana.webp',
    [DETAIL_HERO_BADGE_KIND.VEGETARIAN]: 'assets/vegetariana.webp',
  });
  const DETAIL_MVP_METRICS = Object.freeze({
    calories: 560,
    etaMinutes: 15,
    rating: 4.6,
  });
  const DETAIL_INFO_CHIP_TOOLTIP_COPY = Object.freeze({
    calories: Object.freeze({
      title: 'Calorías estimadas',
      description:
        'Valor aproximado por porción. Puede variar según ingredientes, tamaño y preparación final.',
    }),
    eta: Object.freeze({
      title: 'Tiempo estimado',
      description:
        'Tiempo aproximado de servicio desde que ordenas. Puede variar según horario y volumen de pedidos.',
    }),
  });
  const MENU_PAGE_COPY_DEFAULTS = Object.freeze({
    hero: Object.freeze({
      title: 'Nuestra selección',
      subtitle:
        'Una carta pensada para compartir, descubrir sabores y volver a pedir tus favoritos.',
    }),
    search: Object.freeze({
      placeholder: '',
      helperPrefix: 'Busca por',
      helperWords: SEARCH_HELPER_WORDS_DEFAULT,
      emptyState: Object.freeze({
        title: 'No encontramos resultados',
        description: 'No vimos coincidencias en el menú.',
        descriptionWithQuery: 'No vimos coincidencias para "{query}" en el menú.',
        hint: 'Prueba con otro término o revisa la ortografía.',
      }),
    }),
    accountModal: Object.freeze({
      title: 'Tu cuenta',
      emptyState: Object.freeze({
        title: '¡Aún no has añadido nada!',
        description:
          'Explora el menú y cada plato o bebida que añadas aparecerá aquí con su total estimado',
      }),
      labels: Object.freeze({
        subtotal: 'Subtotal',
        itbis: 'ITBIS (18%)',
        legalTip: 'Propina legal (10%)',
        total: 'Total',
      }),
      totalTooltip: Object.freeze({
        title: 'Total estimado',
        description:
          'Este monto es una referencia de tu cuenta e incluye ITBIS y propina legal. El total final puede variar al momento de ordenar.',
      }),
      removeToast: Object.freeze({
        title: ACCOUNT_REMOVE_TOAST_TITLE_DEFAULT,
        description: ACCOUNT_REMOVE_TOAST_COPY_DEFAULT,
      }),
    }),
    filterModal: Object.freeze({
      title: 'Filtrar',
      sections: Object.freeze({
        allergens: Object.freeze({
          title: 'Alérgenos',
          description: 'Selecciona lo que prefieres evitar.',
        }),
        pizzaType: Object.freeze({
          title: 'Tipo de pizza',
          tabs: Object.freeze({
            all: 'Todas',
            clasica: 'Clásicas',
            autor: 'De autor',
          }),
        }),
        priceRange: Object.freeze({
          title: 'Rango de precio',
          description:
            'Vista preliminar del reparto de precios actual en la carta completa.',
          minLabel: 'Mínimo',
          maxLabel: 'Máximo',
        }),
        dietary: Object.freeze({
          title: 'Dieta',
          vegetarianTitle: 'Vegetariana',
          vegetarianDescription: 'Sin carne, llena de sabor',
          veganTitle: 'Vegana',
          veganDescription: '100% vegetal y ligera',
        }),
        organoleptic: Object.freeze({
          title: 'Perfil organoléptico',
          description: 'Perfiles que resumen cómo se siente cada plato al probarlo.',
        }),
      }),
      actions: Object.freeze({
        clearLabel: 'Limpiar',
        applyPrefix: 'Mostrar',
        applySuffix: 'platos',
      }),
    }),
    states: Object.freeze({
      loading: 'Cargando menú...',
      noCategories: 'No hay categorías disponibles en este momento.',
      loadError: 'No se pudo cargar el menú.',
    }),
    categoryEmptyMessages: Object.freeze({
      entradas: 'No hay entradas disponibles en este momento.',
      pizzas: 'No hay pizzas disponibles en este momento.',
      postres: 'No hay postres disponibles en este momento.',
      bebidas: 'Nuestra selección de bebidas estará disponible pronto.',
      productos: 'No hay productos disponibles en este momento.',
    }),
  });
  const MENU_DETAIL_EDITORIAL_COPY_DEFAULTS = Object.freeze({
    sensory: Object.freeze({
      sectionTitle: 'Perfil sensorial',
      subtitle: 'Una lectura sensorial del plato: cómo se expresa en sabor, textura y aroma.',
      compareButtonLabel: 'Comparar',
      compareButtonLabelActive: 'Cambiar',
      tabRadarLabel: 'Radar',
      tabBarsLabel: 'Barras',
      comparisonClearLabel: 'Quitar',
    }),
    compareModal: Object.freeze({
      title: 'Comparar',
      description:
        'Selecciona otro plato para comparar su perfil sensorial con el actual.',
      searchPlaceholder: '',
      searchHelperPrefix: 'Busca por',
      searchHelperWord: 'plato',
      emptyStateTitle: 'Sin resultados',
      emptyStateDescription:
        'No hay platos elegibles para comparar en este momento.',
      emptyStateDescriptionWithQuery:
        'No hay coincidencias para "{query}" en entradas y pizzas con perfil sensorial.',
      currentItemPrefix: 'Plato actual:',
      currentItemFallback: 'Selecciona un plato para comparar.',
      candidateSummaryFallback: 'Perfil sensorial disponible',
    }),
    pairings: Object.freeze({
      sectionTitle: 'Maridajes recomendados',
      sectionSubtitle:
        'Selección del sommelier de Figata para elevar cada bocado.',
      ctaFallbackLabel: 'Añadir maridaje',
    }),
    story: Object.freeze({
      sectionTitle: 'La historia detrás',
    }),
    infoChips: DETAIL_INFO_CHIP_TOOLTIP_COPY,
    sensoryAxisTooltips: DETAIL_SENSORY_AXIS_TOOLTIP_COPY,
  });
  const DETAIL_INFO_CHIP_TOOLTIP_EXIT_MS = 120;
  const DETAIL_INFO_CHIP_TOOLTIP_SWITCH_EXIT_MS = 84;
  const DETAIL_INFO_CHIP_TOOLTIP_SCROLL_CLOSE_PX = 48;
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
    statusNode.textContent = MENU_PAGE_COPY_DEFAULTS.states.loadError;
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

  const createDefaultAccountTotals = () => ({
    subtotal: 0,
    itbis: 0,
    legalTip: 0,
    total: 0,
    units: 0,
  });

  const createDefaultAccount = () => ({
    itemsById: new Map(),
    order: [],
    totals: createDefaultAccountTotals(),
  });

  const state = {
    categories: [],
    sectionsByCategoryId: new Map(),
    itemsById: new Map(),
    visualCartCount: 0,
    account: createDefaultAccount(),
    activeCategoryId: '',
    searchQuery: '',
    renderedSearchSignature: '',
    renderedSearchQuery: '',
    scrollTicking: false,
    tabsOverflowFrameId: 0,
    tabAnimationFrameId: 0,
    tabPillX: 0,
    tabsBound: false,
    searchTransitionToken: 0,
    searchTransitioning: false,
    catalogRenderToken: 0,
    filterModalOpen: false,
    accountModalOpen: false,
    compareModalOpen: false,
    draftFilters: createDefaultFilters(),
    appliedFilters: createDefaultFilters(),
    detailSensoryView: DEFAULT_DETAIL_SENSORY_VIEW,
    detailItemId: '',
    detailOrigin: '',
    detailDepthIndex: 0,
    detailComparisonItemId: '',
    detailAddQuantity: DETAIL_ADD_QTY_MIN,
    compareSearchQuery: '',
    globalPriceMin: 0,
    globalPriceMax: 0,
    priceRangeInitialized: false,
  };
  const ADMIN_PREVIEW_MESSAGE_READY = 'figata-admin-preview:ready';
  const ADMIN_PREVIEW_MESSAGE_UPDATE = 'figata-admin-preview:update-detail';
  const ADMIN_PREVIEW_MESSAGE_UPDATE_MODAL = 'figata-admin-preview:update-modal';
  const ADMIN_PREVIEW_MESSAGE_NAVIGATE_EDITOR = 'figata-admin-preview:navigate-editor';
  const ADMIN_PREVIEW_SURFACE_MODAL = 'modal';
  const ADMIN_PREVIEW_MODAL_KEYS = new Set(ADMIN_PREVIEW_MODAL_KEYS_LIST);
  const ADMIN_PREVIEW_SECTION_KEYS = new Set([
    'hero-media',
    'header',
    'summary',
    'ingredients',
    'allergens',
    'add-cta',
    'sensory',
    'pairings',
    'story',
  ]);
  let menuPageCopy = MENU_PAGE_COPY_DEFAULTS;
  let menuDetailEditorialCopy = MENU_DETAIL_EDITORIAL_COPY_DEFAULTS;
  let detailInfoChipTooltipCopy = DETAIL_INFO_CHIP_TOOLTIP_COPY;
  let detailSensoryAxisTooltipCopy = DETAIL_SENSORY_AXIS_TOOLTIP_COPY;
  let searchHelperWords = SEARCH_HELPER_WORDS_DEFAULT.slice();
  const cartPulseTimeoutByTarget = new WeakMap();
  const accountMorphCleanupByNode = new WeakMap();
  let bridgeReadyResolver = null;
  let detailSensoryRadarTooltipController = null;
  let detailSensoryBarsTooltipController = null;
  let detailSensoryRadarAnimationController = null;
  let detailSensoryBarsAnimationController = null;
  let detailSensoryViewTransitionToken = 0;
  let detailSensorySectionHeightCleanupTimerId = 0;
  let filterModalCloseTimerId = 0;
  let filterModalChromeFrameId = 0;
  let filterModalRestoreFocusNode = null;
  let accountModalCloseTimerId = 0;
  let accountModalRestoreFocusNode = null;
  let compareModalCloseTimerId = 0;
  let compareModalRestoreFocusNode = null;
  let accountRemovalToastTimerId = 0;
  let accountRemovalToastSnapshot = null;
  let accountCardViewTransitionActive = false;
  let restaurantCommerceContactPromise = null;
  let restaurantCommerceContact = {
    currency: DEFAULT_COMMERCE_CURRENCY,
    whatsappUrl: DEFAULT_RESTAURANT_WHATSAPP_URL,
  };
  let accountCardViewTransitionTask = Promise.resolve();
  let menuRouteViewTransitionTask = Promise.resolve();
  let menuDetailOverlayRuntimePromise = null;
  let lastRenderedRouteItemId = '';
  let organolepticIconsPromise = null;
  let organolepticIconsResolved = false;
  let homeMenuDetailContextPromise = null;
  let organolepticIconPathsByProfileId = new Map();
  let searchHelperTimerId = 0;
  let searchHelperAnimationTimerId = 0;
  let searchHelperFrameId = 0;
  let detailEditorialDotsFrameId = 0;
  let detailEditorialNextPrefetchTimerId = 0;
  let detailInfoChipTooltipNode = null;
  let detailInfoChipTooltipTitleNode = null;
  let detailInfoChipTooltipCopyNode = null;
  let detailInfoChipTooltipAnchor = null;
  let detailInfoChipTooltipQueuedAnchor = null;
  let detailInfoChipTooltipHideTimerId = 0;
  let detailInfoChipTooltipShowFrameId = 0;
  let detailInfoChipTooltipScrollY = 0;
  let detailInfoChipTooltipBound = false;
  let detailHeroBadgeFadeTimerId = 0;
  let detailHeroBadgeHasLabel = false;
  let detailHeroBadgeFirstSlideOnly = false;
  let catalogLqipReadyEmitted = false;
  let detailRenderToken = 0;
  let detailEditorialObserver = null;
  let detailEditorialVideoCleanupFns = [];
  let currentDetailEditorialItem = null;
  let currentDetailEditorialSlides = [];
  let catalogCardMediaRecoveryToken = 0;
  let adminPreviewRenderToken = 0;
  let searchHelperWordIndex = 0;
  let searchHelperHasStarted = false;
  let searchHelperAnimating = false;
  const detailEditorialSeenKeys = new Set();

  const bridgeReadyPromise = new Promise((resolve) => {
    bridgeReadyResolver = resolve;
  });

  const PIZZA_GROUP_ID = 'pizzas';
  const COMPARE_ELIGIBLE_GROUP_IDS = new Set(['entradas', PIZZA_GROUP_ID]);
  const COMPARE_ELIGIBLE_SOURCE_CATEGORY_IDS = new Set([
    'entradas',
    'pizza',
    'pizza_autor',
  ]);

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isMobileCardViewport = () => MOBILE_CARD_QUERY.matches;
  const supportsCardHoverMedia = () =>
    CARD_HOVER_MEDIA_QUERY.matches && !MENU_ROUTE_MOBILE_QUERY.matches;

  const normalizeText = (value) => String(value || '').trim();
  const toAnalyticsEntityId = (value, fallback = '') =>
    normalizeText(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') ||
    normalizeText(fallback)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  const normalizeInlineImageDataUri = (value) => {
    const normalized = normalizeText(value);

    if (!normalized) {
      return '';
    }

    return /^data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/=]+$/i.test(normalized)
      ? normalized
      : '';
  };
  const resolveDetailPairingsTitleIconConfig = () => {
    if (!(detailPairingTemplate instanceof HTMLTemplateElement)) {
      return null;
    }

    const svgNode = detailPairingTemplate.content.querySelector(
      '.menu-page-detail__pairing-icon svg'
    );
    if (!(svgNode instanceof Element)) {
      return null;
    }

    const pathNode = svgNode.querySelector('path');
    if (!(pathNode instanceof Element)) {
      return null;
    }

    const path = normalizeText(pathNode.getAttribute('d'));
    if (!path) {
      return null;
    }

    return Object.freeze({
      viewBox: normalizeText(svgNode.getAttribute('viewBox')) || '0 0 24 24',
      path,
      fill: normalizeText(pathNode.getAttribute('fill')) || 'currentColor',
      stroke: normalizeText(pathNode.getAttribute('stroke')),
      strokeWidth: normalizeText(pathNode.getAttribute('stroke-width')),
      strokeLinecap: normalizeText(pathNode.getAttribute('stroke-linecap')),
      strokeLinejoin: normalizeText(pathNode.getAttribute('stroke-linejoin')),
      transform: normalizeText(pathNode.getAttribute('transform')),
      iconColor: 'currentColor',
    });
  };
  const detailPairingsTitleIconConfig = resolveDetailPairingsTitleIconConfig();
  const setDetailSectionTitleWithIcon = ({ titleNode, titleText, iconConfig }) => {
    if (!(titleNode instanceof HTMLElement)) {
      return;
    }

    const resolvedIconConfig =
      iconConfig &&
      typeof iconConfig === 'object' &&
      !Array.isArray(iconConfig)
        ? iconConfig
        : {};
    const iconPath = normalizeText(resolvedIconConfig.path);

    if (!iconPath) {
      titleNode.classList.remove('menu-page-detail__section-title--with-icon');
      titleNode.textContent = normalizeText(titleText);
      return;
    }

    titleNode.classList.add('menu-page-detail__section-title--with-icon');

    const labelNode = document.createElement('span');
    labelNode.textContent = normalizeText(titleText);

    const iconNode = document.createElement('span');
    iconNode.className = 'menu-page-detail__section-title-icon';
    iconNode.setAttribute('aria-hidden', 'true');
    const iconColor = normalizeText(resolvedIconConfig.iconColor);
    if (iconColor) {
      iconNode.style.color = iconColor;
    }

    const iconSvg = document.createElementNS(DETAIL_SENSORY_RADAR_SVG_NS, 'svg');
    iconSvg.setAttribute('viewBox', normalizeText(resolvedIconConfig.viewBox) || '0 -960 960 960');
    iconSvg.setAttribute('width', '24px');
    iconSvg.setAttribute('height', '24px');
    iconSvg.setAttribute('focusable', 'false');
    iconSvg.setAttribute('aria-hidden', 'true');

    const iconPathNode = document.createElementNS(DETAIL_SENSORY_RADAR_SVG_NS, 'path');
    iconPathNode.setAttribute('d', iconPath);
    if (normalizeText(resolvedIconConfig.fill)) {
      iconPathNode.setAttribute('fill', normalizeText(resolvedIconConfig.fill));
    }
    if (normalizeText(resolvedIconConfig.stroke)) {
      iconPathNode.setAttribute('stroke', normalizeText(resolvedIconConfig.stroke));
    }
    if (normalizeText(resolvedIconConfig.strokeWidth)) {
      iconPathNode.setAttribute('stroke-width', normalizeText(resolvedIconConfig.strokeWidth));
    }
    if (normalizeText(resolvedIconConfig.strokeLinecap)) {
      iconPathNode.setAttribute('stroke-linecap', normalizeText(resolvedIconConfig.strokeLinecap));
    }
    if (normalizeText(resolvedIconConfig.strokeLinejoin)) {
      iconPathNode.setAttribute(
        'stroke-linejoin',
        normalizeText(resolvedIconConfig.strokeLinejoin)
      );
    }
    if (normalizeText(resolvedIconConfig.transform)) {
      iconPathNode.setAttribute('transform', normalizeText(resolvedIconConfig.transform));
    }
    iconSvg.appendChild(iconPathNode);
    iconNode.appendChild(iconSvg);
    titleNode.replaceChildren(labelNode, iconNode);
  };
  const setDetailPairingsSectionTitle = (titleText) => {
    setDetailSectionTitleWithIcon({
      titleNode: detailPairingsTitle,
      titleText,
      iconConfig: detailPairingsTitleIconConfig,
    });
  };
  const setDetailSensorySectionTitle = (titleText) => {
    setDetailSectionTitleWithIcon({
      titleNode: detailSensoryTitle,
      titleText,
      iconConfig: DETAIL_SECTION_ICON_CONFIGS.sensory,
    });
  };
  const setDetailHistorySectionTitle = (titleText) => {
    setDetailSectionTitleWithIcon({
      titleNode: detailHistoryTitle,
      titleText,
      iconConfig: DETAIL_SECTION_ICON_CONFIGS.history,
    });
  };
  const resolveItemDescriptionText = (item) =>
    normalizeText(item?.description) ||
    normalizeText(item?.descriptionLong) ||
    normalizeText(item?.descriptionShort);
  const isObject = (value) =>
    Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  const deepClone = (value) => JSON.parse(JSON.stringify(value));
  const deepMergeCopy = (defaults, source) => {
    if (Array.isArray(defaults)) {
      return Array.isArray(source) ? source.slice() : defaults.slice();
    }

    if (!isObject(defaults)) {
      return source === undefined ? defaults : source;
    }

    const merged = {};
    const sourceObject = isObject(source) ? source : {};
    Object.keys(defaults).forEach((key) => {
      const defaultValue = defaults[key];
      const sourceValue = sourceObject[key];
      if (Array.isArray(defaultValue)) {
        merged[key] = Array.isArray(sourceValue)
          ? sourceValue.slice()
          : defaultValue.slice();
        return;
      }
      if (isObject(defaultValue)) {
        merged[key] = deepMergeCopy(defaultValue, sourceValue);
        return;
      }
      merged[key] = sourceValue === undefined ? defaultValue : sourceValue;
    });
    return merged;
  };
  const normalizeStringList = (value, fallback = []) => {
    const source = Array.isArray(value) ? value : fallback;
    return source
      .map((entry) => normalizeText(entry))
      .filter(Boolean);
  };
  const readHomePath = (root, path) => {
    if (!isObject(root)) {
      return undefined;
    }
    const segments = String(path || '').split('.').filter(Boolean);
    let cursor = root;
    for (let index = 0; index < segments.length; index += 1) {
      if (!isObject(cursor) && index < segments.length - 1) {
        return undefined;
      }
      cursor = cursor?.[segments[index]];
      if (cursor === undefined) {
        return undefined;
      }
    }
    return cursor;
  };
  const formatTemplate = (template, replacements = {}) => {
    const baseTemplate = normalizeText(template);
    if (!baseTemplate) {
      return '';
    }
    return Object.keys(replacements).reduce((result, key) => {
      const token = `{${key}}`;
      return result.split(token).join(String(replacements[key] ?? ''));
    }, baseTemplate);
  };
  const readFirstDefinedString = (source, paths = []) => {
    for (let index = 0; index < paths.length; index += 1) {
      const value = readHomePath(source, paths[index]);
      if (typeof value === 'string') {
        return value.trim();
      }
    }
    return undefined;
  };
  const syncAdminPreviewSurfaceAttributes = () => {
    if (!isAdminPreviewMode) {
      return;
    }

    const surfaceValue = adminPreviewSurface || 'detail';
    document.documentElement.setAttribute('data-admin-preview-surface', surfaceValue);
    if (menuPageBody instanceof HTMLElement) {
      menuPageBody.setAttribute('data-admin-preview-surface', surfaceValue);
    }

    if (adminPreviewModalActive) {
      document.documentElement.setAttribute(
        'data-admin-preview-modal',
        adminPreviewModalActive
      );
      if (menuPageBody instanceof HTMLElement) {
        menuPageBody.setAttribute('data-admin-preview-modal', adminPreviewModalActive);
      }
      return;
    }

    document.documentElement.removeAttribute('data-admin-preview-modal');
    if (menuPageBody instanceof HTMLElement) {
      menuPageBody.removeAttribute('data-admin-preview-modal');
    }
  };
  const resolveMenuPageCopyFromHome = (homePayload) => {
    const source = readHomePath(homePayload, 'menu_page');
    const merged = deepClone(MENU_PAGE_COPY_DEFAULTS);
    if (!isObject(source)) {
      return merged;
    }

    const heroTitle = readFirstDefinedString(source, ['hero.title']);
    const heroSubtitle = readFirstDefinedString(source, ['hero.subtitle']);
    const searchPlaceholder = readFirstDefinedString(source, [
      'search.placeholder',
    ]);
    const searchHelperPrefix = readFirstDefinedString(source, [
      'search.helper_prefix',
      'search.helperPrefix',
    ]);
    const searchEmptyTitle = readFirstDefinedString(source, [
      'search.empty_state.title',
      'search.emptyState.title',
    ]);
    const searchEmptyDescription = readFirstDefinedString(source, [
      'search.empty_state.description',
      'search.emptyState.description',
    ]);
    const searchEmptyDescriptionWithQuery = readFirstDefinedString(source, [
      'search.empty_state.description_with_query',
      'search.emptyState.descriptionWithQuery',
    ]);
    const searchEmptyHint = readFirstDefinedString(source, [
      'search.empty_state.hint',
      'search.emptyState.hint',
    ]);
    const helperWordsSource =
      readHomePath(source, 'search.helper_words') ??
      readHomePath(source, 'search.helperWords');
    const helperWords = normalizeStringList(
      helperWordsSource,
      SEARCH_HELPER_WORDS_DEFAULT
    );

    merged.hero.title = heroTitle === undefined ? merged.hero.title : heroTitle;
    merged.hero.subtitle =
      heroSubtitle === undefined ? merged.hero.subtitle : heroSubtitle;
    merged.search.placeholder =
      searchPlaceholder === undefined ? merged.search.placeholder : searchPlaceholder;
    merged.search.helperPrefix =
      searchHelperPrefix === undefined ? merged.search.helperPrefix : searchHelperPrefix;
    merged.search.helperWords = helperWords.length
      ? helperWords
      : SEARCH_HELPER_WORDS_DEFAULT.slice();
    merged.search.emptyState.title =
      searchEmptyTitle === undefined
        ? merged.search.emptyState.title
        : searchEmptyTitle;
    merged.search.emptyState.description =
      searchEmptyDescription === undefined
        ? merged.search.emptyState.description
        : searchEmptyDescription;
    merged.search.emptyState.descriptionWithQuery =
      searchEmptyDescriptionWithQuery === undefined
        ? merged.search.emptyState.descriptionWithQuery
        : searchEmptyDescriptionWithQuery;
    merged.search.emptyState.hint =
      searchEmptyHint === undefined
        ? merged.search.emptyState.hint
        : searchEmptyHint;

    merged.accountModal.title =
      readFirstDefinedString(source, ['account_modal.title', 'accountModal.title']) ??
      merged.accountModal.title;
    merged.accountModal.emptyState.title =
      readFirstDefinedString(source, [
        'account_modal.empty_state.title',
        'accountModal.emptyState.title',
      ]) ?? merged.accountModal.emptyState.title;
    merged.accountModal.emptyState.description =
      readFirstDefinedString(source, [
        'account_modal.empty_state.description',
        'accountModal.emptyState.description',
      ]) ?? merged.accountModal.emptyState.description;
    merged.accountModal.labels.subtotal =
      readFirstDefinedString(source, [
        'account_modal.labels.subtotal',
        'accountModal.labels.subtotal',
      ]) ?? merged.accountModal.labels.subtotal;
    merged.accountModal.labels.itbis =
      readFirstDefinedString(source, [
        'account_modal.labels.itbis',
        'accountModal.labels.itbis',
      ]) ?? merged.accountModal.labels.itbis;
    merged.accountModal.labels.legalTip =
      readFirstDefinedString(source, [
        'account_modal.labels.legal_tip',
        'accountModal.labels.legalTip',
      ]) ?? merged.accountModal.labels.legalTip;
    merged.accountModal.labels.total =
      readFirstDefinedString(source, [
        'account_modal.labels.total',
        'accountModal.labels.total',
      ]) ?? merged.accountModal.labels.total;
    merged.accountModal.totalTooltip.title =
      readFirstDefinedString(source, [
        'account_modal.total_tooltip.title',
        'accountModal.totalTooltip.title',
      ]) ?? merged.accountModal.totalTooltip.title;
    merged.accountModal.totalTooltip.description =
      readFirstDefinedString(source, [
        'account_modal.total_tooltip.description',
        'accountModal.totalTooltip.description',
      ]) ?? merged.accountModal.totalTooltip.description;
    merged.accountModal.removeToast.title =
      readFirstDefinedString(source, [
        'account_modal.remove_toast.title',
        'accountModal.removeToast.title',
      ]) ?? merged.accountModal.removeToast.title;
    merged.accountModal.removeToast.description =
      readFirstDefinedString(source, [
        'account_modal.remove_toast.description',
        'accountModal.removeToast.description',
      ]) ?? merged.accountModal.removeToast.description;

    merged.filterModal.title =
      readFirstDefinedString(source, [
        'filter_modal.title',
        'filterModal.title',
      ]) ?? merged.filterModal.title;
    merged.filterModal.sections.allergens.title =
      readFirstDefinedString(source, [
        'filter_modal.sections.allergens.title',
        'filterModal.sections.allergens.title',
      ]) ?? merged.filterModal.sections.allergens.title;
    merged.filterModal.sections.allergens.description =
      readFirstDefinedString(source, [
        'filter_modal.sections.allergens.description',
        'filterModal.sections.allergens.description',
      ]) ?? merged.filterModal.sections.allergens.description;
    merged.filterModal.sections.pizzaType.title =
      readFirstDefinedString(source, [
        'filter_modal.sections.pizza_type.title',
        'filter_modal.sections.pizzaType.title',
        'filterModal.sections.pizzaType.title',
      ]) ?? merged.filterModal.sections.pizzaType.title;
    merged.filterModal.sections.pizzaType.tabs.all =
      readFirstDefinedString(source, [
        'filter_modal.sections.pizza_type.tabs.all',
        'filter_modal.sections.pizzaType.tabs.all',
        'filterModal.sections.pizzaType.tabs.all',
      ]) ?? merged.filterModal.sections.pizzaType.tabs.all;
    merged.filterModal.sections.pizzaType.tabs.clasica =
      readFirstDefinedString(source, [
        'filter_modal.sections.pizza_type.tabs.clasica',
        'filter_modal.sections.pizzaType.tabs.clasica',
        'filterModal.sections.pizzaType.tabs.clasica',
      ]) ?? merged.filterModal.sections.pizzaType.tabs.clasica;
    merged.filterModal.sections.pizzaType.tabs.autor =
      readFirstDefinedString(source, [
        'filter_modal.sections.pizza_type.tabs.autor',
        'filter_modal.sections.pizzaType.tabs.autor',
        'filterModal.sections.pizzaType.tabs.autor',
      ]) ?? merged.filterModal.sections.pizzaType.tabs.autor;
    merged.filterModal.sections.priceRange.title =
      readFirstDefinedString(source, [
        'filter_modal.sections.price_range.title',
        'filter_modal.sections.priceRange.title',
        'filterModal.sections.priceRange.title',
      ]) ?? merged.filterModal.sections.priceRange.title;
    merged.filterModal.sections.priceRange.description =
      readFirstDefinedString(source, [
        'filter_modal.sections.price_range.description',
        'filter_modal.sections.priceRange.description',
        'filterModal.sections.priceRange.description',
      ]) ?? merged.filterModal.sections.priceRange.description;
    merged.filterModal.sections.priceRange.minLabel =
      readFirstDefinedString(source, [
        'filter_modal.sections.price_range.min_label',
        'filter_modal.sections.priceRange.minLabel',
        'filterModal.sections.priceRange.minLabel',
      ]) ?? merged.filterModal.sections.priceRange.minLabel;
    merged.filterModal.sections.priceRange.maxLabel =
      readFirstDefinedString(source, [
        'filter_modal.sections.price_range.max_label',
        'filter_modal.sections.priceRange.maxLabel',
        'filterModal.sections.priceRange.maxLabel',
      ]) ?? merged.filterModal.sections.priceRange.maxLabel;
    merged.filterModal.sections.dietary.title =
      readFirstDefinedString(source, [
        'filter_modal.sections.dietary.title',
        'filterModal.sections.dietary.title',
      ]) ?? merged.filterModal.sections.dietary.title;
    merged.filterModal.sections.dietary.vegetarianTitle =
      readFirstDefinedString(source, [
        'filter_modal.sections.dietary.vegetarian_title',
        'filter_modal.sections.dietary.vegetarianTitle',
        'filterModal.sections.dietary.vegetarianTitle',
      ]) ?? merged.filterModal.sections.dietary.vegetarianTitle;
    merged.filterModal.sections.dietary.vegetarianDescription =
      readFirstDefinedString(source, [
        'filter_modal.sections.dietary.vegetarian_description',
        'filter_modal.sections.dietary.vegetarianDescription',
        'filterModal.sections.dietary.vegetarianDescription',
      ]) ?? merged.filterModal.sections.dietary.vegetarianDescription;
    merged.filterModal.sections.dietary.veganTitle =
      readFirstDefinedString(source, [
        'filter_modal.sections.dietary.vegan_title',
        'filter_modal.sections.dietary.veganTitle',
        'filterModal.sections.dietary.veganTitle',
      ]) ?? merged.filterModal.sections.dietary.veganTitle;
    merged.filterModal.sections.dietary.veganDescription =
      readFirstDefinedString(source, [
        'filter_modal.sections.dietary.vegan_description',
        'filter_modal.sections.dietary.veganDescription',
        'filterModal.sections.dietary.veganDescription',
      ]) ?? merged.filterModal.sections.dietary.veganDescription;
    merged.filterModal.sections.organoleptic.title =
      readFirstDefinedString(source, [
        'filter_modal.sections.organoleptic.title',
        'filterModal.sections.organoleptic.title',
      ]) ?? merged.filterModal.sections.organoleptic.title;
    merged.filterModal.sections.organoleptic.description =
      readFirstDefinedString(source, [
        'filter_modal.sections.organoleptic.description',
        'filterModal.sections.organoleptic.description',
      ]) ?? merged.filterModal.sections.organoleptic.description;
    merged.filterModal.actions.clearLabel =
      readFirstDefinedString(source, [
        'filter_modal.actions.clear_label',
        'filter_modal.actions.clearLabel',
        'filterModal.actions.clearLabel',
      ]) ?? merged.filterModal.actions.clearLabel;
    merged.filterModal.actions.applyPrefix =
      readFirstDefinedString(source, [
        'filter_modal.actions.apply_prefix',
        'filter_modal.actions.applyPrefix',
        'filterModal.actions.applyPrefix',
      ]) ?? merged.filterModal.actions.applyPrefix;
    merged.filterModal.actions.applySuffix =
      readFirstDefinedString(source, [
        'filter_modal.actions.apply_suffix',
        'filter_modal.actions.applySuffix',
        'filterModal.actions.applySuffix',
      ]) ?? merged.filterModal.actions.applySuffix;

    merged.states.loading =
      readFirstDefinedString(source, ['states.loading']) ?? merged.states.loading;
    merged.states.noCategories =
      readFirstDefinedString(source, [
        'states.no_categories',
        'states.noCategories',
      ]) ?? merged.states.noCategories;
    merged.states.loadError =
      readFirstDefinedString(source, ['states.load_error', 'states.loadError']) ??
      merged.states.loadError;

    ['entradas', 'pizzas', 'postres', 'bebidas', 'productos'].forEach((categoryId) => {
      const categoryText = readFirstDefinedString(source, [
        `category_empty_messages.${categoryId}`,
        `categoryEmptyMessages.${categoryId}`,
      ]);
      if (categoryText !== undefined) {
        merged.categoryEmptyMessages[categoryId] = categoryText;
      }
    });

    return merged;
  };
  const resolveDetailEditorialCopyFromHome = (homePayload) => {
    const source = readHomePath(homePayload, 'menu_detail_editorial');
    const merged = deepClone(MENU_DETAIL_EDITORIAL_COPY_DEFAULTS);
    if (!isObject(source)) {
      return merged;
    }

    const legacySubtitle = readFirstDefinedString(source, ['sensory_subtitle']) || '';
    const nestedSubtitle = readFirstDefinedString(source, [
      'sensory.subtitle',
    ]) || '';
    const resolvedSubtitle =
      nestedSubtitle ||
      legacySubtitle ||
      MENU_DETAIL_EDITORIAL_COPY_DEFAULTS.sensory.subtitle;
    merged.sensory.sectionTitle =
      readFirstDefinedString(source, [
        'sensory.section_title',
        'sensory.sectionTitle',
      ]) ?? merged.sensory.sectionTitle;
    merged.sensory.subtitle = resolvedSubtitle;
    merged.sensory.compareButtonLabel =
      readFirstDefinedString(source, [
        'sensory.compare_button_label',
        'sensory.compareButtonLabel',
      ]) ?? merged.sensory.compareButtonLabel;
    merged.sensory.compareButtonLabelActive =
      readFirstDefinedString(source, [
        'sensory.compare_button_label_active',
        'sensory.compareButtonLabelActive',
      ]) ?? merged.sensory.compareButtonLabelActive;
    merged.sensory.tabRadarLabel =
      readFirstDefinedString(source, [
        'sensory.tabs.radar_label',
        'sensory.tabs.radarLabel',
      ]) ?? merged.sensory.tabRadarLabel;
    merged.sensory.tabBarsLabel =
      readFirstDefinedString(source, [
        'sensory.tabs.bars_label',
        'sensory.tabs.barsLabel',
      ]) ?? merged.sensory.tabBarsLabel;
    merged.sensory.comparisonClearLabel =
      readFirstDefinedString(source, [
        'sensory.comparison_clear_label',
        'sensory.comparisonClearLabel',
      ]) ?? merged.sensory.comparisonClearLabel;

    merged.compareModal.title =
      readFirstDefinedString(source, ['compare_modal.title', 'compareModal.title']) ??
      merged.compareModal.title;
    merged.compareModal.description =
      readFirstDefinedString(source, [
        'compare_modal.description',
        'compareModal.description',
      ]) ?? merged.compareModal.description;
    merged.compareModal.searchPlaceholder =
      readFirstDefinedString(source, [
        'compare_modal.search_placeholder',
        'compareModal.searchPlaceholder',
      ]) ?? merged.compareModal.searchPlaceholder;
    merged.compareModal.searchHelperPrefix =
      readFirstDefinedString(source, [
        'compare_modal.search_helper_prefix',
        'compareModal.searchHelperPrefix',
      ]) ?? merged.compareModal.searchHelperPrefix;
    merged.compareModal.searchHelperWord =
      readFirstDefinedString(source, [
        'compare_modal.search_helper_word',
        'compareModal.searchHelperWord',
      ]) ?? merged.compareModal.searchHelperWord;
    merged.compareModal.emptyStateTitle =
      readFirstDefinedString(source, [
        'compare_modal.empty_state.title',
        'compareModal.emptyState.title',
      ]) ?? merged.compareModal.emptyStateTitle;
    merged.compareModal.emptyStateDescription =
      readFirstDefinedString(source, [
        'compare_modal.empty_state.description',
        'compareModal.emptyState.description',
      ]) ?? merged.compareModal.emptyStateDescription;
    merged.compareModal.emptyStateDescriptionWithQuery =
      readFirstDefinedString(source, [
        'compare_modal.empty_state.description_with_query',
        'compareModal.emptyState.descriptionWithQuery',
      ]) ?? merged.compareModal.emptyStateDescriptionWithQuery;
    merged.compareModal.currentItemPrefix =
      readFirstDefinedString(source, [
        'compare_modal.current_item_prefix',
        'compareModal.currentItemPrefix',
      ]) ?? merged.compareModal.currentItemPrefix;
    merged.compareModal.currentItemFallback =
      readFirstDefinedString(source, [
        'compare_modal.current_item_fallback',
        'compareModal.currentItemFallback',
      ]) ?? merged.compareModal.currentItemFallback;
    merged.compareModal.candidateSummaryFallback =
      readFirstDefinedString(source, [
        'compare_modal.candidate_summary_fallback',
        'compareModal.candidateSummaryFallback',
      ]) ?? merged.compareModal.candidateSummaryFallback;

    merged.pairings.sectionTitle =
      readFirstDefinedString(source, [
        'pairings.section_title',
        'pairings.sectionTitle',
      ]) ?? merged.pairings.sectionTitle;
    merged.pairings.sectionSubtitle =
      readFirstDefinedString(source, [
        'pairings.section_subtitle',
        'pairings.sectionSubtitle',
      ]) ?? merged.pairings.sectionSubtitle;
    merged.pairings.ctaFallbackLabel =
      readFirstDefinedString(source, [
        'pairings.cta_fallback_label',
        'pairings.ctaFallbackLabel',
      ]) ?? merged.pairings.ctaFallbackLabel;

    merged.story.sectionTitle =
      readFirstDefinedString(source, ['story.section_title', 'story.sectionTitle']) ??
      merged.story.sectionTitle;

    ['calories', 'eta'].forEach((chipKey) => {
      merged.infoChips[chipKey].title =
        readFirstDefinedString(source, [
          `info_chips.${chipKey}.title`,
          `infoChips.${chipKey}.title`,
        ]) ?? merged.infoChips[chipKey].title;
      merged.infoChips[chipKey].description =
        readFirstDefinedString(source, [
          `info_chips.${chipKey}.description`,
          `infoChips.${chipKey}.description`,
        ]) ?? merged.infoChips[chipKey].description;
    });

    Object.keys(merged.sensoryAxisTooltips).forEach((axisKey) => {
      merged.sensoryAxisTooltips[axisKey].title =
        readFirstDefinedString(source, [
          `sensory_axis_tooltips.${axisKey}.title`,
          `sensoryAxisTooltips.${axisKey}.title`,
        ]) ?? merged.sensoryAxisTooltips[axisKey].title;
      merged.sensoryAxisTooltips[axisKey].description =
        readFirstDefinedString(source, [
          `sensory_axis_tooltips.${axisKey}.description`,
          `sensoryAxisTooltips.${axisKey}.description`,
        ]) ?? merged.sensoryAxisTooltips[axisKey].description;
    });

    return merged;
  };
  const getMenuPageStateCopy = () => menuPageCopy?.states || MENU_PAGE_COPY_DEFAULTS.states;
  const getMenuCategoryEmptyMessage = (categoryId, fallback) =>
    normalizeText(menuPageCopy?.categoryEmptyMessages?.[categoryId]) || fallback;
  const getDetailChipTooltipCopy = (chipKey) =>
    detailInfoChipTooltipCopy?.[chipKey] || DETAIL_INFO_CHIP_TOOLTIP_COPY[chipKey];
  const getSensoryAxisTooltipCopy = (axisId) =>
    detailSensoryAxisTooltipCopy?.[axisId] || DETAIL_SENSORY_AXIS_TOOLTIP_COPY[axisId];
  const DETAIL_DEFAULT_SENSORY_SUBTITLE =
    detailSensorySubtitle instanceof HTMLElement
      ? normalizeText(detailSensorySubtitle.textContent)
      : '';
  const DETAIL_DEFAULT_PAIRING_CONTENT = Object.freeze({
    subtitle:
      detailPairingsSubtitle instanceof HTMLElement
        ? normalizeText(detailPairingsSubtitle.textContent)
        : '',
    ctaLabel:
      detailPairingTemplate instanceof HTMLTemplateElement
        ? normalizeText(
          detailPairingTemplate.content.querySelector('.menu-page-detail__pairing-cta')?.getAttribute(
            'aria-label'
          )
        )
        : '',
  });
  const DETAIL_DEFAULT_SECTION_COPY = Object.freeze({
    sensoryTitle:
      detailSensoryTitle instanceof HTMLElement
        ? normalizeText(detailSensoryTitle.textContent)
        : MENU_DETAIL_EDITORIAL_COPY_DEFAULTS.sensory.sectionTitle,
    pairingsTitle:
      detailPairingsTitle instanceof HTMLElement
        ? normalizeText(detailPairingsTitle.textContent)
        : MENU_DETAIL_EDITORIAL_COPY_DEFAULTS.pairings.sectionTitle,
    storyTitle:
      detailHistoryTitle instanceof HTMLElement
        ? normalizeText(detailHistoryTitle.textContent)
        : MENU_DETAIL_EDITORIAL_COPY_DEFAULTS.story.sectionTitle,
    compareModalTitle:
      compareModalTitle instanceof HTMLElement
        ? normalizeText(compareModalTitle.textContent)
        : MENU_DETAIL_EDITORIAL_COPY_DEFAULTS.compareModal.title,
    compareModalDescription:
      compareModalDescription instanceof HTMLElement
        ? normalizeText(compareModalDescription.textContent)
        : MENU_DETAIL_EDITORIAL_COPY_DEFAULTS.compareModal.description,
    compareSearchHelperPrefix:
      compareSearchHelperPrefix instanceof HTMLElement
        ? normalizeText(compareSearchHelperPrefix.textContent)
        : MENU_DETAIL_EDITORIAL_COPY_DEFAULTS.compareModal.searchHelperPrefix,
    compareSearchHelperWord:
      compareSearchHelperWord instanceof HTMLElement
        ? normalizeText(compareSearchHelperWord.textContent)
        : MENU_DETAIL_EDITORIAL_COPY_DEFAULTS.compareModal.searchHelperWord,
    sensoryTabRadar:
      detailSensoryTabRadarTitle instanceof HTMLElement
        ? normalizeText(detailSensoryTabRadarTitle.textContent)
        : MENU_DETAIL_EDITORIAL_COPY_DEFAULTS.sensory.tabRadarLabel,
    sensoryTabBars:
      detailSensoryTabBarsTitle instanceof HTMLElement
        ? normalizeText(detailSensoryTabBarsTitle.textContent)
        : MENU_DETAIL_EDITORIAL_COPY_DEFAULTS.sensory.tabBarsLabel,
    sensoryComparisonClear:
      detailSensoryComparisonClearButton instanceof HTMLButtonElement
        ? normalizeText(detailSensoryComparisonClearButton.textContent)
        : MENU_DETAIL_EDITORIAL_COPY_DEFAULTS.sensory.comparisonClearLabel,
  });
  const clampNumber = (value, min, max) => Math.min(max, Math.max(min, value));
  const wait = (ms) =>
    new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  const supportsAccountCardLayoutAnimation = () =>
    typeof Element !== 'undefined' &&
    typeof Element.prototype.animate === 'function';
  const syncAccountCardViewTransitionIdentity = (card, itemId) => {
    if (!(card instanceof HTMLElement)) {
      return;
    }

    const normalizedItemId = normalizeText(itemId);
    if (normalizedItemId) {
      card.dataset.accountCardVtName = normalizedItemId;
    } else {
      delete card.dataset.accountCardVtName;
    }

    card.style.removeProperty('view-transition-name');
  };
  const getAccountCardAnimationSnapshot = () => {
    if (!(accountModalBody instanceof HTMLElement)) {
      return {
        bodyRect: null,
        scrollTop: 0,
        cards: new Map(),
        groupHeaders: new Map(),
        emptyState: null,
      };
    }

    const bodyRect = accountModalBody.getBoundingClientRect();
    const cards = new Map();
    const groupHeaders = new Map();
    let emptyState = null;

    accountModalBody
      .querySelectorAll('.menu-account-modal__item[data-account-item-id]')
      .forEach((node) => {
        if (!(node instanceof HTMLElement)) {
          return;
        }

        const itemId = normalizeText(node.getAttribute('data-account-item-id'));
        if (!itemId) {
          return;
        }

        const rect = node.getBoundingClientRect();
        if (rect.width <= 1 || rect.height <= 1) {
          return;
        }

        cards.set(itemId, {
          node,
          rect,
        });
      });

    accountModalBody
      .querySelectorAll('.menu-account-modal__group[data-account-group-id]')
      .forEach((section) => {
        if (!(section instanceof HTMLElement)) {
          return;
        }

        const groupId = normalizeText(section.getAttribute('data-account-group-id'));
        const header = section.querySelector('.menu-account-modal__group-header');
        if (!groupId || !(header instanceof HTMLElement)) {
          return;
        }

        const rect = header.getBoundingClientRect();
        if (rect.width <= 1 || rect.height <= 1) {
          return;
        }

        groupHeaders.set(groupId, {
          node: header,
          rect,
        });
      });

    const emptyNode = accountModalBody.querySelector(
      '.menu-account-modal__empty.menu-page-search-empty'
    );
    if (emptyNode instanceof HTMLElement) {
      const rect = emptyNode.getBoundingClientRect();
      if (rect.width > 1 && rect.height > 1) {
        emptyState = {
          node: emptyNode,
          rect,
        };
      }
    }

    return {
      bodyRect,
      scrollTop: accountModalBody.scrollTop,
      cards,
      groupHeaders,
      emptyState,
    };
  };
  const clearAccountCardAnimationLayer = () => {
    if (!(accountModalBody instanceof HTMLElement)) {
      return;
    }

    accountModalBody
      .querySelectorAll('.menu-account-modal__animation-layer')
      .forEach((node) => node.remove());
  };
  const createAccountCardAnimationLayer = () => {
    if (!(accountModalBody instanceof HTMLElement)) {
      return null;
    }

    clearAccountCardAnimationLayer();

    const layer = document.createElement('div');
    layer.className = 'menu-account-modal__animation-layer';
    layer.setAttribute('aria-hidden', 'true');
    layer.style.height = `${Math.max(
      accountModalBody.scrollHeight,
      accountModalBody.scrollTop + accountModalBody.clientHeight
    )}px`;
    accountModalBody.appendChild(layer);
    return layer;
  };
  const waitForAccountCardAnimation = (animation) => {
    if (!animation || typeof animation !== 'object') {
      return Promise.resolve();
    }

    return Promise.resolve(animation.finished).catch(() => {});
  };
  const animateAccountCardExitGhost = (
    layer,
    previousSnapshot,
    nextSnapshot,
    itemId
  ) => {
    if (!(layer instanceof HTMLElement)) {
      return Promise.resolve();
    }

    const previousEntry = previousSnapshot.cards.get(itemId);
    if (!previousEntry || !(previousEntry.node instanceof HTMLElement)) {
      return Promise.resolve();
    }

    const bodyRect = nextSnapshot.bodyRect || previousSnapshot.bodyRect;
    if (!bodyRect) {
      return Promise.resolve();
    }

    const ghost = previousEntry.node.cloneNode(true);
    if (!(ghost instanceof HTMLElement)) {
      return Promise.resolve();
    }

    syncAccountCardViewTransitionIdentity(ghost, '');
    ghost.classList.add('menu-account-modal__item--ghost');
    ghost.setAttribute('aria-hidden', 'true');
    ghost.style.top = `${nextSnapshot.scrollTop + (previousEntry.rect.top - bodyRect.top)}px`;
    ghost.style.left = `${previousEntry.rect.left - bodyRect.left}px`;
    ghost.style.width = `${previousEntry.rect.width}px`;
    ghost.style.height = `${previousEntry.rect.height}px`;
    layer.appendChild(ghost);

    let animation = null;

    try {
      animation = ghost.animate(
        [
          {
            opacity: 1,
            transform: 'translateX(0)',
            filter: 'blur(0px)',
          },
          {
            opacity: 0,
            transform: `translateX(${ACCOUNT_CARD_EXIT_X_PX}px)`,
            filter: `blur(${ACCOUNT_CARD_EXIT_BLUR_PX}px)`,
          },
        ],
        {
          duration: ACCOUNT_CARD_VIEW_TRANSITION_MS,
          easing: ACCOUNT_CARD_VIEW_TRANSITION_EASE,
          fill: 'both',
        }
      );
    } catch (error) {
      ghost.remove();
      return Promise.resolve();
    }

    return waitForAccountCardAnimation(animation).finally(() => {
      ghost.remove();
      if (!layer.childElementCount) {
        layer.remove();
      }
    });
  };
  const animateAccountCardLayoutDelta = (node, dx, dy) => {
    if (!(node instanceof HTMLElement)) {
      return Promise.resolve();
    }

    let animation = null;

    try {
      animation = node.animate(
        [
          {
            transform: `translate(${dx}px, ${dy}px)`,
          },
          {
            transform: 'translate(0, 0)',
          },
        ],
        {
          duration: ACCOUNT_CARD_LAYOUT_MOVE_MS,
          easing: ACCOUNT_CARD_LAYOUT_MOVE_EASE,
          fill: 'both',
        }
      );
    } catch (error) {
      return Promise.resolve();
    }

    return waitForAccountCardAnimation(animation);
  };
  const animateAccountCardEnter = (node) => {
    if (!(node instanceof HTMLElement)) {
      return Promise.resolve();
    }

    let animation = null;

    try {
      animation = node.animate(
        [
          {
            opacity: 0,
            transform: `translateX(${ACCOUNT_CARD_EXIT_X_PX}px)`,
            filter: `blur(${ACCOUNT_CARD_EXIT_BLUR_PX}px)`,
          },
          {
            opacity: 1,
            transform: 'translateX(0)',
            filter: 'blur(0px)',
          },
        ],
        {
          duration: ACCOUNT_CARD_VIEW_TRANSITION_MS,
          easing: ACCOUNT_CARD_VIEW_TRANSITION_EASE,
          fill: 'both',
        }
      );
    } catch (error) {
      return Promise.resolve();
    }

    return waitForAccountCardAnimation(animation);
  };
  const animateAccountEmptyStateEnter = (node) => {
    if (!(node instanceof HTMLElement)) {
      return Promise.resolve();
    }

    let animation = null;

    try {
      animation = node.animate(
        [
          {
            opacity: 0,
          },
          {
            opacity: 1,
          },
        ],
        {
          duration: ACCOUNT_EMPTY_STATE_ENTER_MS,
          easing: ACCOUNT_EMPTY_STATE_ENTER_EASE,
          fill: 'both',
        }
      );
    } catch (error) {
      return Promise.resolve();
    }

    return waitForAccountCardAnimation(animation);
  };
  const animateAccountEmptyStateExitGhost = (layer, previousSnapshot, nextSnapshot) => {
    if (!(layer instanceof HTMLElement)) {
      return Promise.resolve();
    }

    const previousEntry = previousSnapshot.emptyState;
    if (!previousEntry || !(previousEntry.node instanceof HTMLElement)) {
      return Promise.resolve();
    }

    const bodyRect = nextSnapshot.bodyRect || previousSnapshot.bodyRect;
    if (!bodyRect) {
      return Promise.resolve();
    }

    const ghost = previousEntry.node.cloneNode(true);
    if (!(ghost instanceof HTMLElement)) {
      return Promise.resolve();
    }

    ghost.classList.add('menu-account-modal__empty--ghost');
    ghost.setAttribute('aria-hidden', 'true');
    ghost.style.top = `${nextSnapshot.scrollTop + (previousEntry.rect.top - bodyRect.top)}px`;
    ghost.style.left = `${previousEntry.rect.left - bodyRect.left}px`;
    ghost.style.width = `${previousEntry.rect.width}px`;
    ghost.style.height = `${previousEntry.rect.height}px`;
    ghost.style.minHeight = '0';
    ghost.style.maxHeight = `${previousEntry.rect.height}px`;
    layer.appendChild(ghost);

    let animation = null;

    try {
      animation = ghost.animate(
        [
          {
            opacity: 1,
          },
          {
            opacity: 0,
          },
        ],
        {
          duration: ACCOUNT_EMPTY_STATE_EXIT_MS,
          easing: ACCOUNT_EMPTY_STATE_EXIT_EASE,
          fill: 'both',
        }
      );
    } catch (error) {
      ghost.remove();
      return Promise.resolve();
    }

    return waitForAccountCardAnimation(animation).finally(() => {
      ghost.remove();
      if (!layer.childElementCount) {
        layer.remove();
      }
    });
  };
  const animateAccountGroupHeaderEnter = (node) => {
    if (!(node instanceof HTMLElement)) {
      return Promise.resolve();
    }

    let animation = null;

    try {
      animation = node.animate(
        [
          {
            opacity: 0,
            transform: 'translateX(-24px)',
            filter: 'blur(2px)',
          },
          {
            opacity: 1,
            transform: 'translateX(0)',
            filter: 'blur(0px)',
          },
        ],
        {
          duration: ACCOUNT_CARD_VIEW_TRANSITION_MS,
          easing: ACCOUNT_CARD_VIEW_TRANSITION_EASE,
          fill: 'both',
        }
      );
    } catch (error) {
      return Promise.resolve();
    }

    return waitForAccountCardAnimation(animation);
  };
  const runAccountCardsViewTransition = (
    updateFn,
    { exitItemId = '', enterItemId = '' } = {}
  ) => {
    if (typeof updateFn !== 'function') {
      return;
    }

    const normalizedExitItemId = normalizeText(exitItemId);
    const normalizedEnterItemId = normalizeText(enterItemId);
    const hasCardDelta = Boolean(normalizedExitItemId || normalizedEnterItemId);
    const canAnimate =
      hasCardDelta &&
      state.accountModalOpen &&
      accountModal instanceof HTMLElement &&
      !accountModal.hidden &&
      !reducedMotionQuery.matches &&
      supportsAccountCardLayoutAnimation();

    if (!canAnimate) {
      updateFn();
      return;
    }

    const runTransition = () => {
      const stillCanAnimate =
        state.accountModalOpen &&
        accountModal instanceof HTMLElement &&
        !accountModal.hidden &&
        !reducedMotionQuery.matches &&
        supportsAccountCardLayoutAnimation();

      if (!stillCanAnimate) {
        updateFn();
        return Promise.resolve();
      }
      accountCardViewTransitionActive = true;

      try {
        const previousSnapshot = getAccountCardAnimationSnapshot();
        updateFn();

        // Force layout after the body has been re-rendered and scroll restored.
        accountModalBody?.getBoundingClientRect?.();

        const nextSnapshot = getAccountCardAnimationSnapshot();
        const animationTasks = [];
        const needsExitCardGhost =
          normalizedExitItemId && previousSnapshot.cards.has(normalizedExitItemId);
        const needsExitEmptyGhost = Boolean(
          previousSnapshot.emptyState && !nextSnapshot.emptyState
        );
        const animationLayer = (needsExitCardGhost || needsExitEmptyGhost)
          ? createAccountCardAnimationLayer()
          : null;

        if (needsExitCardGhost) {
          animationTasks.push(
            animateAccountCardExitGhost(
              animationLayer,
              previousSnapshot,
              nextSnapshot,
              normalizedExitItemId
            )
          );
        }

        if (needsExitEmptyGhost) {
          animationTasks.push(
            animateAccountEmptyStateExitGhost(animationLayer, previousSnapshot, nextSnapshot)
          );
        }

        if (!previousSnapshot.emptyState && nextSnapshot.emptyState) {
          animationTasks.push(animateAccountEmptyStateEnter(nextSnapshot.emptyState.node));
        }

        nextSnapshot.cards.forEach((entry, itemId) => {
          const previousEntry = previousSnapshot.cards.get(itemId);

          if (previousEntry) {
            const dx = previousEntry.rect.left - entry.rect.left;
            const dy = previousEntry.rect.top - entry.rect.top;
            if (
              Math.abs(dx) > ACCOUNT_CARD_LAYOUT_EPSILON_PX ||
              Math.abs(dy) > ACCOUNT_CARD_LAYOUT_EPSILON_PX
            ) {
              animationTasks.push(animateAccountCardLayoutDelta(entry.node, dx, dy));
            }
            return;
          }

          if (normalizedEnterItemId && itemId === normalizedEnterItemId) {
            animationTasks.push(animateAccountCardEnter(entry.node));
          }
        });

        nextSnapshot.groupHeaders.forEach((entry, groupId) => {
          const previousEntry = previousSnapshot.groupHeaders.get(groupId);

          if (previousEntry) {
            const dx = previousEntry.rect.left - entry.rect.left;
            const dy = previousEntry.rect.top - entry.rect.top;
            if (
              Math.abs(dx) > ACCOUNT_CARD_LAYOUT_EPSILON_PX ||
              Math.abs(dy) > ACCOUNT_CARD_LAYOUT_EPSILON_PX
            ) {
              animationTasks.push(animateAccountCardLayoutDelta(entry.node, dx, dy));
            }
            return;
          }

          if (normalizedEnterItemId) {
            animationTasks.push(animateAccountGroupHeaderEnter(entry.node));
          }
        });

        return Promise.allSettled(animationTasks).finally(() => {
          accountCardViewTransitionActive = false;
          clearAccountCardAnimationLayer();
        });
      } catch (error) {
        accountCardViewTransitionActive = false;
        clearAccountCardAnimationLayer();
        updateFn();
        return Promise.resolve();
      }
    };

    if (accountCardViewTransitionActive) {
      accountCardViewTransitionTask = accountCardViewTransitionTask
        .catch(() => {})
        .then(() => runTransition());
      return;
    }

    accountCardViewTransitionTask = runTransition();
  };
  const isElementVisibleForFlight = (element) => {
    if (!(element instanceof HTMLElement) || !element.isConnected) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    if (rect.width <= 1 || rect.height <= 1) {
      return false;
    }

    let cursor = element;

    while (cursor instanceof HTMLElement) {
      const styles = window.getComputedStyle(cursor);

      if (styles.display === 'none' || styles.visibility === 'hidden') {
        return false;
      }

      const opacity = Number(styles.opacity);
      if (Number.isFinite(opacity) && opacity <= 0.05) {
        return false;
      }

      cursor = cursor.parentElement;
    }

    return true;
  };
  const getMenuCartTargets = () =>
    Array.from(document.querySelectorAll(MENU_CART_TARGET_SELECTOR)).filter(
      (target) => target instanceof HTMLElement
    );
  const getPreferredMenuCartTarget = () => {
    const targets = getMenuCartTargets();
    if (!targets.length) {
      return null;
    }

    const visibleTarget = targets.find((target) => isElementVisibleForFlight(target));
    return visibleTarget || targets[0];
  };
  const formatMenuCartCount = (count) =>
    count > MENU_CART_COUNT_CAP ? `${MENU_CART_COUNT_CAP}+` : String(count);
  const accountMoneyFormatter = new Intl.NumberFormat('es-DO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const ensureMenuCartBadge = (target) => {
    let badge = target.querySelector(`.${MENU_CART_BADGE_CLASS}`);

    if (!(badge instanceof HTMLElement)) {
      badge = document.createElement('span');
      badge.className = MENU_CART_BADGE_CLASS;
      badge.textContent = '0';
      badge.hidden = true;
      badge.setAttribute('aria-live', 'polite');
      badge.setAttribute('aria-atomic', 'true');
      target.appendChild(badge);
    }

    return badge;
  };
  const syncMenuCartBadges = () => {
    const targets = getMenuCartTargets();
    const units = Number(state.account?.totals?.units) || 0;
    const hasItems = units > 0;
    const countLabel = formatMenuCartCount(units);
    state.visualCartCount = units;

    targets.forEach((target) => {
      const badge = ensureMenuCartBadge(target);
      target.setAttribute('aria-haspopup', 'dialog');
      target.setAttribute('aria-controls', 'menu-account-modal');
      target.setAttribute('aria-expanded', state.accountModalOpen ? 'true' : 'false');
      target.classList.toggle('has-menu-cart-items', hasItems);
      badge.hidden = !hasItems;
      badge.textContent = hasItems ? countLabel : '0';
    });
  };
  const pulseMenuCartTargets = () => {
    const targets = getMenuCartTargets();

    targets.forEach((target) => {
      const icon = target.querySelector('svg');
      const pulseNode = icon instanceof SVGElement ? icon : target;
      pulseNodeWithMenuCartClass(pulseNode);
    });
  };
  const pulseNodeWithMenuCartClass = (node) => {
    if (
      !(node instanceof HTMLElement) &&
      !(node instanceof SVGElement)
    ) {
      return;
    }

    const activeTimeoutId = cartPulseTimeoutByTarget.get(node);
    if (Number.isFinite(activeTimeoutId)) {
      window.clearTimeout(activeTimeoutId);
    }

    node.classList.remove(MENU_CART_PULSE_CLASS);
    // Force reflow so repeated interactions can replay the pulse class.
    void node.getBoundingClientRect();
    node.classList.add(MENU_CART_PULSE_CLASS);

    const timeoutId = window.setTimeout(() => {
      node.classList.remove(MENU_CART_PULSE_CLASS);
      cartPulseTimeoutByTarget.delete(node);
    }, MENU_CART_PULSE_MS + 34);

    cartPulseTimeoutByTarget.set(node, timeoutId);
  };
  const ensureAccountStepperGlyph = (button, fallbackGlyph = '') => {
    if (!(button instanceof HTMLButtonElement)) {
      return null;
    }

    let glyphNode = button.querySelector('.menu-account-modal__stepper-glyph');
    if (!(glyphNode instanceof HTMLElement) && !(glyphNode instanceof SVGElement)) {
      const svgGlyphNode = button.querySelector('svg');
      if (svgGlyphNode instanceof SVGElement) {
        svgGlyphNode.classList.add('menu-account-modal__stepper-glyph');
        glyphNode = svgGlyphNode;
      } else {
        glyphNode = document.createElement('span');
        glyphNode.className = 'menu-account-modal__stepper-glyph';
        button.replaceChildren(glyphNode);
      }
    }

    if (glyphNode instanceof SVGElement) {
      glyphNode.setAttribute('aria-hidden', 'true');
      glyphNode.setAttribute('focusable', 'false');
      return glyphNode;
    }

    const explicitGlyph = normalizeText(fallbackGlyph);
    const currentGlyph = normalizeText(glyphNode.textContent);
    const action = normalizeText(button.dataset.accountAction);
    const actionFallback = action === 'decrease' ? '-' : '+';
    const nextGlyph = explicitGlyph || currentGlyph || actionFallback;
    glyphNode.textContent = nextGlyph;
    glyphNode.setAttribute('aria-hidden', 'true');
    return glyphNode;
  };
  const pulseAccountStepperGlyph = (button) => {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const action = normalizeText(button.dataset.accountAction);
    if (action !== 'increase' && action !== 'decrease') {
      return;
    }

    const glyphNode = ensureAccountStepperGlyph(button);
    if (!(glyphNode instanceof HTMLElement) && !(glyphNode instanceof SVGElement)) {
      return;
    }

    pulseNodeWithMenuCartClass(glyphNode);
    pulseNodeWithMenuCartClass(button);
  };

  const syncDetailQuantityValue = (value, { animate = false } = {}) => {
    const nextQuantity = clampNumber(
      Math.round(Number(value) || DETAIL_ADD_QTY_MIN),
      DETAIL_ADD_QTY_MIN,
      DETAIL_ADD_QTY_MAX
    );
    state.detailAddQuantity = nextQuantity;
    setAccountTextValue(detailQuantityValue, String(nextQuantity), { animate });
    return nextQuantity;
  };
  const resolveCardAddSourceImage = (baseImage, hoverImage) => {
    if (
      baseImage instanceof HTMLImageElement &&
      !baseImage.hidden &&
      isElementVisibleForFlight(baseImage)
    ) {
      return baseImage;
    }

    if (
      hoverImage instanceof HTMLImageElement &&
      !hoverImage.hidden &&
      isElementVisibleForFlight(hoverImage)
    ) {
      return hoverImage;
    }

    if (baseImage instanceof HTMLImageElement) {
      return baseImage;
    }

    if (hoverImage instanceof HTMLImageElement) {
      return hoverImage;
    }

    return null;
  };
  const createMenuCartFlightClone = (sourceImage, sourceRect) => {
    const clone = sourceImage.cloneNode(true);

    if (!(clone instanceof HTMLImageElement)) {
      return null;
    }

    const sourceStyles = window.getComputedStyle(sourceImage);
    clone.classList.add('menu-page-cart-flight-clone');
    clone.setAttribute('aria-hidden', 'true');
    clone.removeAttribute('id');
    clone.removeAttribute('srcset');
    clone.removeAttribute('sizes');
    clone.style.left = `${sourceRect.left}px`;
    clone.style.top = `${sourceRect.top}px`;
    clone.style.width = `${sourceRect.width}px`;
    clone.style.height = `${sourceRect.height}px`;
    clone.style.borderRadius = sourceStyles.borderRadius;
    clone.style.objectFit = sourceStyles.objectFit || 'cover';
    clone.style.objectPosition = sourceStyles.objectPosition || 'center center';
    return clone;
  };
  const animateMenuCartFlight = async (sourceImage, target) => {
    if (
      !(sourceImage instanceof HTMLImageElement) ||
      !(target instanceof HTMLElement) ||
      !(menuPageBody instanceof HTMLBodyElement)
    ) {
      await wait(MENU_CART_FALLBACK_COMMIT_DELAY_MS);
      return;
    }

    const sourceRect = sourceImage.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const sourceHasSize = sourceRect.width > 4 && sourceRect.height > 4;
    const targetHasSize = targetRect.width > 4 && targetRect.height > 4;

    if (!sourceHasSize || !targetHasSize || reducedMotionQuery.matches) {
      await wait(MENU_CART_FALLBACK_COMMIT_DELAY_MS);
      return;
    }

    const clone = createMenuCartFlightClone(sourceImage, sourceRect);
    if (!(clone instanceof HTMLImageElement)) {
      await wait(MENU_CART_FALLBACK_COMMIT_DELAY_MS);
      return;
    }

    menuPageBody.appendChild(clone);

    const sourceCenterX = sourceRect.left + sourceRect.width / 2;
    const sourceCenterY = sourceRect.top + sourceRect.height / 2;
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;
    const deltaX = targetCenterX - sourceCenterX;
    const deltaY = targetCenterY - sourceCenterY;
    const travel = Math.hypot(deltaX, deltaY);
    const travelDuration = Math.round(
      clampNumber(430 + travel * 0.34, MENU_CART_FLIGHT_MIN_MS, MENU_CART_FLIGHT_MAX_MS)
    );
    const arcLift = Math.min(76, Math.max(18, travel * 0.14));
    const midX = deltaX * 0.72;
    const midY = deltaY * 0.72 - arcLift;

    await new Promise((resolve) => {
      let settled = false;
      const settle = () => {
        if (settled) {
          return;
        }

        settled = true;
        if (clone.isConnected) {
          clone.remove();
        }
        resolve();
      };

      const animation = clone.animate(
        [
          {
            transform: 'translate3d(0, 0, 0) scale(1)',
            opacity: 1,
          },
          {
            transform: `translate3d(${midX}px, ${midY}px, 0) scale(0.62)`,
            opacity: 0.58,
            offset: 0.7,
          },
          {
            transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(0.16)`,
            opacity: 0,
          },
        ],
        {
          duration: travelDuration,
          easing: MENU_CART_FLIGHT_EASE,
          fill: 'forwards',
        }
      );

      if (animation && animation.finished && typeof animation.finished.then === 'function') {
        animation.finished.then(settle).catch(settle);
      } else {
        window.setTimeout(settle, travelDuration + 40);
      }
    });
  };
  const commitMenuCartVisualAdd = (
    itemId,
    quantity = 1,
    { detailOrigin = MENU_DETAIL_ORIGIN_GRID } = {}
  ) => {
    const normalizedItemId = normalizeText(itemId);
    if (!normalizedItemId) {
      return;
    }

    const delta = clampNumber(
      Math.round(Number(quantity) || DETAIL_ADD_QTY_MIN),
      DETAIL_ADD_QTY_MIN,
      DETAIL_ADD_QTY_MAX
    );
    addItemToAccount(normalizedItemId, delta, {
      pulse: true,
      detailOrigin,
    });
  };
  const runMenuCartVisualAdd = async (
    sourceImage,
    itemId,
    quantity = DETAIL_ADD_QTY_MIN,
    options = {}
  ) => {
    const target = getPreferredMenuCartTarget();
    const safeQuantity = clampNumber(
      Math.round(Number(quantity) || DETAIL_ADD_QTY_MIN),
      DETAIL_ADD_QTY_MIN,
      DETAIL_ADD_QTY_MAX
    );
    await animateMenuCartFlight(sourceImage, target);
    commitMenuCartVisualAdd(itemId, safeQuantity, options);
  };
  const roundAccountValue = (value) =>
    Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  const parseCurrencyValue = (value) => {
    const raw = normalizeText(value);
    if (!raw) {
      return NaN;
    }

    const cleaned = raw.replace(/[^0-9.,-]/g, '');
    if (!cleaned) {
      return NaN;
    }

    const commaIndex = cleaned.lastIndexOf(',');
    const dotIndex = cleaned.lastIndexOf('.');
    let normalized = cleaned;

    if (commaIndex >= 0 && dotIndex >= 0) {
      const decimalSeparator = commaIndex > dotIndex ? ',' : '.';
      const thousandsSeparator = decimalSeparator === ',' ? '.' : ',';
      normalized = cleaned.split(thousandsSeparator).join('');
      if (decimalSeparator === ',') {
        normalized = normalized.replace(',', '.');
      }
    } else if (commaIndex >= 0) {
      const segments = cleaned.split(',');
      if (segments.length === 2 && segments[1].length <= 2) {
        normalized = `${segments[0].replace(/,/g, '')}.${segments[1]}`;
      } else {
        normalized = cleaned.replace(/,/g, '');
      }
    } else {
      normalized = cleaned.replace(/,/g, '');
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : NaN;
  };
  const formatAccountMoneyParts = (value) => {
    const safeValue = Number.isFinite(value) ? Math.max(value, 0) : 0;
    return {
      currency: 'RD$',
      amount: accountMoneyFormatter.format(roundAccountValue(safeValue)),
    };
  };
  const formatAccountMoney = (value) => {
    const parts = formatAccountMoneyParts(value);
    return `${parts.currency} ${parts.amount}`;
  };
  const createAccountMorphChar = (character) => {
    const char = document.createElement('span');
    char.className = 'menu-account-modal__morph-char';
    char.textContent = character === ' ' ? '\u00A0' : character;
    return char;
  };
  const setAccountMorphCharState = (char, { opacity, blurPx, translateYPx }) => {
    char.style.opacity = String(opacity);
    char.style.filter = `blur(${blurPx}px)`;
    char.style.transform = `translateY(${translateYPx}px)`;
  };
  const createAccountMorphLayer = (value, initialState = null) => {
    const layer = document.createElement('span');
    layer.className = 'menu-account-modal__morph-layer';

    Array.from(value).forEach((character) => {
      const char = createAccountMorphChar(character);
      if (initialState) {
        setAccountMorphCharState(char, initialState);
      }
      layer.appendChild(char);
    });

    return layer;
  };
  const resetAccountMorphCharTransitions = (chars) => {
    chars.forEach((char) => {
      char.style.transitionProperty = 'none';
      char.style.transitionDuration = '0ms';
      char.style.transitionDelay = '0ms';
      char.style.transitionTimingFunction = 'linear';
    });
  };
  const animateAccountMorphChars = (
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
      setAccountMorphCharState(char, {
        opacity: targetOpacity,
        blurPx: targetBlurPx,
        translateYPx: targetTranslateYPx,
      });
    });
  };
  const setAccountTextValue = (node, value, { animate = false } = {}) => {
    if (!(node instanceof HTMLElement)) {
      return;
    }

    const nextText = normalizeText(value);
    if (node.dataset.accountMorphValue === nextText) {
      return;
    }

    const activeCleanup = accountMorphCleanupByNode.get(node);
    if (typeof activeCleanup === 'function') {
      activeCleanup();
      accountMorphCleanupByNode.delete(node);
    }

    const previousText = normalizeText(node.textContent);
    if (!animate || reducedMotionQuery.matches || !previousText || previousText === nextText) {
      node.textContent = nextText;
      node.dataset.accountMorphValue = nextText;
      return;
    }

    const shell = document.createElement('span');
    shell.className = 'menu-account-modal__morph-shell';
    const explicitMorphAlign = normalizeText(node.getAttribute('data-account-morph-align'));
    if (explicitMorphAlign === 'end') {
      shell.classList.add('menu-account-modal__morph-shell--end');
    } else if (explicitMorphAlign === 'center') {
      shell.classList.add('menu-account-modal__morph-shell--center');
    } else if (
      node instanceof HTMLParagraphElement ||
      node.classList.contains('menu-account-modal__amount')
    ) {
      const textAlign = window.getComputedStyle(node).textAlign;
      if (textAlign === 'right' || textAlign === 'end') {
        shell.classList.add('menu-account-modal__morph-shell--end');
      } else if (textAlign === 'center') {
        shell.classList.add('menu-account-modal__morph-shell--center');
      }
    }

    const oldLayer = createAccountMorphLayer(previousText, {
      opacity: 1,
      blurPx: 0,
      translateYPx: 0,
    });
    const newLayer = createAccountMorphLayer(nextText, {
      opacity: 0,
      blurPx: ACCOUNT_VALUE_BLUR_PX,
      translateYPx: ACCOUNT_VALUE_IN_Y_PX,
    });
    const oldChars = Array.from(oldLayer.children);
    const newChars = Array.from(newLayer.children);

    shell.append(oldLayer, newLayer);
    resetAccountMorphCharTransitions(oldChars);
    resetAccountMorphCharTransitions(newChars);
    node.replaceChildren(shell);
    node.dataset.accountMorphValue = nextText;

    let settled = false;
    let frameId = 0;
    let finishTimerId = 0;
    const settle = () => {
      if (settled) {
        return;
      }

      settled = true;
      node.textContent = nextText;
      node.dataset.accountMorphValue = nextText;
      accountMorphCleanupByNode.delete(node);
    };

    frameId = window.requestAnimationFrame(() => {
      frameId = 0;

      if (!node.contains(shell)) {
        return;
      }

      animateAccountMorphChars(oldChars, {
        durationMs: ACCOUNT_VALUE_OUT_DURATION_MS,
        staggerMs: ACCOUNT_VALUE_OUT_STAGGER_MS,
        easing: ACCOUNT_VALUE_OUT_EASE,
        targetOpacity: 0,
        targetBlurPx: ACCOUNT_VALUE_BLUR_PX,
        targetTranslateYPx: ACCOUNT_VALUE_OUT_Y_PX,
      });
      animateAccountMorphChars(newChars, {
        durationMs: ACCOUNT_VALUE_IN_DURATION_MS,
        staggerMs: ACCOUNT_VALUE_IN_STAGGER_MS,
        delayMs: ACCOUNT_VALUE_IN_DELAY_MS,
        easing: ACCOUNT_VALUE_IN_EASE,
        targetOpacity: 1,
        targetBlurPx: 0,
        targetTranslateYPx: 0,
      });
    });

    const totalOutMs =
      ACCOUNT_VALUE_OUT_DURATION_MS +
      Math.max(0, oldChars.length - 1) * ACCOUNT_VALUE_OUT_STAGGER_MS;
    const totalInMs =
      ACCOUNT_VALUE_IN_DELAY_MS +
      ACCOUNT_VALUE_IN_DURATION_MS +
      Math.max(0, newChars.length - 1) * ACCOUNT_VALUE_IN_STAGGER_MS;
    finishTimerId = window.setTimeout(settle, Math.max(totalOutMs, totalInMs) + 40);

    accountMorphCleanupByNode.set(node, () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      if (finishTimerId) {
        window.clearTimeout(finishTimerId);
      }
      settle();
    });
  };
  const syncAccountMoneyValueNode = (
    node,
    value,
    { dimCurrency = false, animate = false } = {}
  ) => {
    if (!(node instanceof HTMLElement)) {
      return;
    }

    const parts = formatAccountMoneyParts(value);
    let currencyNode = node.querySelector('.menu-account-modal__currency');
    let amountNode = node.querySelector('.menu-account-modal__amount');

    if (!(currencyNode instanceof HTMLElement) || !(amountNode instanceof HTMLElement)) {
      currencyNode = document.createElement('span');
      amountNode = document.createElement('span');
      node.replaceChildren(
        currencyNode,
        document.createTextNode(' '),
        amountNode
      );
    }

    currencyNode.className = dimCurrency
      ? 'menu-account-modal__currency menu-account-modal__currency--muted'
      : 'menu-account-modal__currency';
    currencyNode.textContent = parts.currency;
    amountNode.className = 'menu-account-modal__amount';
    amountNode.setAttribute('data-account-morph-align', 'end');
    setAccountTextValue(amountNode, parts.amount, { animate });
    node.setAttribute('aria-label', `${parts.currency} ${parts.amount}`);
  };
  const formatAccountCardMoney = (value) => {
    const safeValue = Number.isFinite(value) ? Math.max(value, 0) : 0;
    return `$${Math.round(safeValue).toLocaleString('en-US')}`;
  };
  const resolveAccountItemPrice = (item) => {
    const numericPrice = Number(item?.price);
    if (Number.isFinite(numericPrice) && numericPrice >= 0) {
      return numericPrice;
    }

    const parsedFormattedPrice = parseCurrencyValue(item?.priceFormatted);
    if (Number.isFinite(parsedFormattedPrice) && parsedFormattedPrice >= 0) {
      return parsedFormattedPrice;
    }

    return 0;
  };
  const getAccountQuantity = (itemId) => {
    const normalizedItemId = normalizeText(itemId);
    if (!normalizedItemId) {
      return 0;
    }

    const storedQuantity = state.account.itemsById.get(normalizedItemId);
    const parsedQuantity = Number(storedQuantity);
    return Number.isFinite(parsedQuantity) && parsedQuantity > 0
      ? Math.max(0, Math.round(parsedQuantity))
      : 0;
  };
  const buildAccountSessionPayload = () =>
    state.account.order
      .map((itemId) => {
        const normalizedItemId = normalizeText(itemId);
        const quantity = getAccountQuantity(normalizedItemId);
        if (!normalizedItemId || quantity <= 0) {
          return null;
        }

        return {
          id: normalizedItemId,
          qty: quantity,
        };
      })
      .filter(Boolean);
  const clearPersistedAccountStorage = () => {
    try {
      window.localStorage.removeItem(ACCOUNT_STORAGE_KEY);
    } catch (error) {
      console.warn('[menu-page] No se pudo limpiar la cuenta local.', error);
    }
  };
  const isAccountStorageExpired = (updatedAt) => {
    const timestamp = Number(updatedAt);
    if (!Number.isFinite(timestamp) || timestamp <= 0) {
      return true;
    }

    return Date.now() - timestamp > ACCOUNT_STORAGE_TTL_MS;
  };
  const readPersistedAccountStorage = () => {
    try {
      const raw = window.localStorage.getItem(ACCOUNT_STORAGE_KEY);
      if (!raw) {
        return { items: null, shouldClear: false };
      }

      const parsed = JSON.parse(raw);
      if (!isObject(parsed)) {
        return { items: null, shouldClear: true };
      }

      if (Number(parsed.version) !== ACCOUNT_STORAGE_VERSION) {
        return { items: null, shouldClear: true };
      }

      if (isAccountStorageExpired(parsed.updatedAt)) {
        return { items: null, shouldClear: true };
      }

      if (!Array.isArray(parsed.items)) {
        return { items: null, shouldClear: true };
      }

      return { items: parsed.items, shouldClear: false };
    } catch (error) {
      console.warn('[menu-page] No se pudo leer la cuenta local.', error);
      return { items: null, shouldClear: true };
    }
  };
  const persistAccountSession = () => {
    try {
      const items = buildAccountSessionPayload();
      if (!items.length) {
        clearPersistedAccountStorage();
        return;
      }

      const payload = {
        version: ACCOUNT_STORAGE_VERSION,
        updatedAt: Date.now(),
        items,
      };
      window.localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.warn('[menu-page] No se pudo persistir la cuenta local.', error);
    }
  };
  const computeAccountTotals = () => {
    let subtotal = 0;
    let units = 0;

    state.account.order.forEach((itemId) => {
      const quantity = getAccountQuantity(itemId);
      const item = state.itemsById.get(itemId);

      if (!item || quantity <= 0) {
        return;
      }

      const unitPrice = resolveAccountItemPrice(item);
      subtotal += unitPrice * quantity;
      units += quantity;
    });

    const normalizedSubtotal = roundAccountValue(subtotal);
    const itbis = roundAccountValue(normalizedSubtotal * ACCOUNT_ITBIS_RATE);
    const legalTip = roundAccountValue(normalizedSubtotal * ACCOUNT_LEGAL_TIP_RATE);
    const total = roundAccountValue(normalizedSubtotal + itbis + legalTip);

    state.account.totals = {
      subtotal: normalizedSubtotal,
      itbis,
      legalTip,
      total,
      units,
    };
  };
  const syncAccountFooter = ({ animate = false } = {}) => {
    if (accountSubtotalNode instanceof HTMLElement) {
      syncAccountMoneyValueNode(accountSubtotalNode, state.account.totals.subtotal, {
        dimCurrency: true,
        animate,
      });
    }

    if (accountItbisNode instanceof HTMLElement) {
      syncAccountMoneyValueNode(accountItbisNode, state.account.totals.itbis, {
        dimCurrency: true,
        animate,
      });
    }

    if (accountLegalTipNode instanceof HTMLElement) {
      syncAccountMoneyValueNode(accountLegalTipNode, state.account.totals.legalTip, {
        dimCurrency: true,
        animate,
      });
    }

    if (accountTotalNode instanceof HTMLElement) {
      syncAccountMoneyValueNode(accountTotalNode, state.account.totals.total, {
        animate,
      });
    }
  };
  const buildAccountEntries = () =>
    state.account.order
      .map((itemId) => {
        const quantity = getAccountQuantity(itemId);
        const item = state.itemsById.get(itemId);

        if (!item || quantity <= 0) {
          return null;
        }

        const media = resolveItemMedia(item);
        const unitPrice = resolveAccountItemPrice(item);
        const linePrice = roundAccountValue(unitPrice * quantity);
        const groupId = normalizeText(resolveGroupIdByItem(item));

        return {
          id: normalizeText(item?.id),
          name: normalizeText(item?.name || item?.id),
          description: resolveItemDescriptionText(item),
          image: media.card || media.detail || '',
          imageAlt: normalizeText(media.alt || item?.name || item?.id),
          quantity,
          unitPrice,
          linePrice,
          groupId,
        };
      })
      .filter(Boolean);
  const buildMenuCommerceSnapshot = () => {
    if (!analyticsCommerce?.buildCartSnapshot) {
      return null;
    }

    return analyticsCommerce.buildCartSnapshot(buildAccountEntries(), {
      currency:
        normalizeText(restaurantCommerceContact?.currency).toUpperCase() ||
        DEFAULT_COMMERCE_CURRENCY,
      value: state.account.totals.total,
    });
  };
  const syncAccountCheckoutState = () => {
    if (accountCheckoutButton instanceof HTMLButtonElement) {
      const hasItems = state.account.totals.units > 0;
      accountCheckoutButton.disabled = !hasItems;
      accountCheckoutButton.setAttribute('aria-disabled', hasItems ? 'false' : 'true');
    }

    if (accountCheckoutNote instanceof HTMLElement) {
      accountCheckoutNote.textContent = state.account.totals.units > 0
        ? 'Compartimos tu cuenta con el equipo de Figata para confirmar disponibilidad y siguientes pasos.'
        : 'Agrega platos a tu cuenta para preparar el pedido por WhatsApp.';
    }

    syncAccountCheckoutTarget();
  };
  const buildMenuAccountWhatsappMessage = (snapshot) => {
    const safeSnapshot = snapshot && Array.isArray(snapshot.items)
      ? snapshot
      : { items: [] };
    const itemLines = safeSnapshot.items
      .map((entry) => {
        const linePrice = roundAccountValue(Number(entry.price || 0) * Number(entry.quantity || 0));
        return `- ${entry.quantity} x ${entry.item_name}: ${formatAccountCardMoney(linePrice)}`;
      })
      .filter(Boolean);

    return [
      'Hola, quiero ordenar lo siguiente desde el menu de Figata:',
      '',
      ...itemLines,
      '',
      'Resumen estimado:',
      `- Subtotal: ${formatAccountCardMoney(state.account.totals.subtotal)}`,
      `- ITBIS (18%): ${formatAccountCardMoney(state.account.totals.itbis)}`,
      `- Propina legal (10%): ${formatAccountCardMoney(state.account.totals.legalTip)}`,
      `- Total estimado: ${formatAccountCardMoney(state.account.totals.total)}`,
      '',
      'Quiero confirmar disponibilidad y completar mi pedido.',
    ].join('\n');
  };
  const buildWhatsappCheckoutUrl = (baseUrl, message) => {
    const normalizedBaseUrl = normalizeAbsoluteUrl(
      baseUrl,
      DEFAULT_RESTAURANT_WHATSAPP_URL
    );
    const encodedMessage = encodeURIComponent(normalizeText(message));

    if (!encodedMessage) {
      return normalizedBaseUrl;
    }

    return `${normalizedBaseUrl}${normalizedBaseUrl.includes('?') ? '&' : '?'}text=${encodedMessage}`;
  };
  const trackMenuCartView = () => {
    const snapshot = buildMenuCommerceSnapshot();

    if (!snapshot || !snapshot.items.length) {
      return;
    }

    analyticsCommerce?.trackCartView?.(snapshot.items, {
      snapshot,
    });
  };
  const trackMenuAccountMutation = ({
    item,
    previousQuantity = 0,
    nextQuantity = 0,
    detailOrigin = '',
  } = {}) => {
    if (!item || previousQuantity === nextQuantity) {
      return;
    }

    const snapshot = buildMenuCommerceSnapshot();
    if (!snapshot) {
      return;
    }

    if (nextQuantity > previousQuantity) {
      analyticsCommerce?.trackAddToCart?.(item, {
        quantity: nextQuantity - previousQuantity,
        detailOrigin,
        snapshot,
      });
      return;
    }

    analyticsCommerce?.trackRemoveFromCart?.(item, {
      quantity: previousQuantity - nextQuantity,
      detailOrigin,
      snapshot,
    });
  };
  const buildAccountEntryGroups = (entries = []) => {
    const orderByGroupId = new Map();
    const labelByGroupId = new Map();
    state.categories.forEach((category, index) => {
      const groupId = normalizeText(category?.id);
      if (!groupId) {
        return;
      }

      orderByGroupId.set(groupId, index);
      labelByGroupId.set(groupId, normalizeText(category?.label) || groupId);
    });

    const groupsById = new Map();

    entries.forEach((entry) => {
      const normalizedGroupId = normalizeText(entry?.groupId);
      const hasKnownGroup = orderByGroupId.has(normalizedGroupId);
      const groupId = hasKnownGroup ? normalizedGroupId : ACCOUNT_UNCATEGORIZED_GROUP_ID;
      const groupLabel = hasKnownGroup
        ? labelByGroupId.get(groupId) || normalizedGroupId
        : ACCOUNT_UNCATEGORIZED_GROUP_LABEL;

      let group = groupsById.get(groupId);
      if (!group) {
        group = {
          id: groupId,
          label: groupLabel,
          subtotal: 0,
          items: [],
        };
        groupsById.set(groupId, group);
      }

      group.items.push(entry);
      group.subtotal = roundAccountValue(group.subtotal + Number(entry?.linePrice || 0));
    });

    return Array.from(groupsById.values()).sort((left, right) => {
      const leftOrder =
        left.id === ACCOUNT_UNCATEGORIZED_GROUP_ID
          ? Number.MAX_SAFE_INTEGER
          : orderByGroupId.get(left.id) ?? Number.MAX_SAFE_INTEGER - 1;
      const rightOrder =
        right.id === ACCOUNT_UNCATEGORIZED_GROUP_ID
          ? Number.MAX_SAFE_INTEGER
          : orderByGroupId.get(right.id) ?? Number.MAX_SAFE_INTEGER - 1;

      return leftOrder - rightOrder;
    });
  };
  const createAccountGroupNode = (group) => {
    const section = document.createElement('section');
    section.className = 'menu-account-modal__group';
    section.setAttribute('data-account-group-id', group.id);

    const header = document.createElement('header');
    header.className = 'menu-account-modal__group-header';

    const title = document.createElement('h3');
    title.className = 'menu-account-modal__group-title';
    title.textContent = group.label;

    const divider = document.createElement('span');
    divider.className = 'menu-account-modal__group-divider';
    divider.setAttribute('aria-hidden', 'true');

    const subtotal = document.createElement('p');
    subtotal.className = 'menu-account-modal__group-subtotal';
    syncAccountMoneyValueNode(subtotal, group.subtotal, { animate: false });

    header.append(title, divider, subtotal);
    section.appendChild(header);

    const items = document.createElement('div');
    items.className = 'menu-account-modal__group-items';
    section.appendChild(items);

    return {
      section,
      header,
      title,
      subtotal,
      items,
    };
  };
  const readAccountGroupNode = (section) => {
    if (!(section instanceof HTMLElement)) {
      return null;
    }

    const header = section.querySelector('.menu-account-modal__group-header');
    const title = section.querySelector('.menu-account-modal__group-title');
    const subtotal = section.querySelector('.menu-account-modal__group-subtotal');
    const items = section.querySelector('.menu-account-modal__group-items');

    if (
      !(header instanceof HTMLElement) ||
      !(title instanceof HTMLElement) ||
      !(subtotal instanceof HTMLElement) ||
      !(items instanceof HTMLElement)
    ) {
      return null;
    }

    return {
      section,
      header,
      title,
      subtotal,
      items,
    };
  };
  const syncAccountGroupNode = (groupNode, group, { animate = false } = {}) => {
    if (!groupNode || !group) {
      return;
    }

    groupNode.section.setAttribute('data-account-group-id', group.id);
    if (groupNode.title.textContent !== group.label) {
      groupNode.title.textContent = group.label;
    }
    syncAccountMoneyValueNode(groupNode.subtotal, group.subtotal, { animate });
  };
  const createAccountEmptyStateNode = () => {
    const emptyStateCopy = menuPageCopy?.accountModal?.emptyState || MENU_PAGE_COPY_DEFAULTS.accountModal.emptyState;
    const node = document.createElement('section');
    node.className = 'menu-account-modal__empty menu-page-search-empty';
    node.setAttribute('aria-labelledby', 'menu-account-empty-title');

    const art = document.createElement('img');
    art.className = 'menu-page-search-empty__art menu-account-modal__empty-art';
    art.src = toAbsoluteAssetPath(SEARCH_EMPTY_ART_PATH);
    art.alt = '';
    art.decoding = 'async';
    art.loading = 'eager';
    art.width = ACCOUNT_EMPTY_ART_SIZE_PX;
    art.height = ACCOUNT_EMPTY_ART_SIZE_PX;

    const title = document.createElement('h3');
    title.className = 'menu-page-search-empty__title menu-account-modal__empty-title';
    title.id = 'menu-account-empty-title';
    title.textContent =
      normalizeText(emptyStateCopy?.title) ||
      MENU_PAGE_COPY_DEFAULTS.accountModal.emptyState.title;

    const message = document.createElement('p');
    message.className = 'menu-page-search-empty__message menu-account-modal__empty-message';
    message.textContent =
      normalizeText(emptyStateCopy?.description) ||
      MENU_PAGE_COPY_DEFAULTS.accountModal.emptyState.description;

    node.append(art, title, message);
    return node;
  };
  const createAccountCardNode = (entry) => {
    const card = document.createElement('article');
    card.className = 'menu-account-modal__item';
    card.setAttribute('data-account-item-id', entry.id);
    syncAccountCardViewTransitionIdentity(card, entry.id);

    const thumbWrap = document.createElement('div');
    thumbWrap.className = 'menu-account-modal__thumb-wrap';

    const thumb = document.createElement('img');
    thumb.className = 'menu-account-modal__thumb';
    thumb.src = entry.image || 'assets/menu/placeholders/card.svg';
    thumb.alt = entry.imageAlt;
    thumb.loading = 'lazy';
    thumb.decoding = 'async';
    thumbWrap.appendChild(thumb);
    card.appendChild(thumbWrap);

    const content = document.createElement('div');
    content.className = 'menu-account-modal__item-content';

    const topRow = document.createElement('div');
    topRow.className = 'menu-account-modal__item-top';

    const meta = document.createElement('div');
    meta.className = 'menu-account-modal__item-meta';

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'menu-account-modal__remove';
    removeButton.setAttribute('aria-label', `Eliminar ${entry.name}`);
    removeButton.setAttribute('data-account-action', 'remove');
    removeButton.setAttribute('data-account-item-id', entry.id);
    removeButton.innerHTML = `
      <svg aria-hidden="true" role="presentation" width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.33333 13H2.66667C1.93029 13 1.33333 12.418 1.33333 11.7V3.25H0V1.95H2.66667V1.3C2.66667 0.58203 3.26362 0 4 0H8C8.73638 0 9.33333 0.58203 9.33333 1.3V1.95H12V3.25H10.6667V11.7C10.6667 12.418 10.0697 13 9.33333 13ZM2.66667 3.25V11.7H9.33333V3.25H2.66667ZM4 1.3V1.95H8V1.3H4ZM8 10.4H6.66667V4.55H8V10.4ZM5.33333 10.4H4V4.55H5.33333V10.4Z" fill="currentColor"/>
      </svg>
    `;

    const title = document.createElement('h3');
    title.className = 'menu-account-modal__item-title';
    title.textContent = entry.name;
    meta.appendChild(title);

    const description = document.createElement('p');
    description.className = 'menu-account-modal__item-description';
    description.textContent = entry.description || '';
    description.hidden = !description.textContent;
    meta.appendChild(description);

    topRow.appendChild(meta);
    topRow.appendChild(removeButton);
    content.appendChild(topRow);

    const bottomRow = document.createElement('div');
    bottomRow.className = 'menu-account-modal__item-bottom';

    const stepper = document.createElement('div');
    stepper.className = 'menu-account-modal__stepper';
    stepper.setAttribute('aria-label', `Cantidad de ${entry.name}`);

    const decreaseButton = document.createElement('button');
    decreaseButton.type = 'button';
    decreaseButton.className = 'menu-account-modal__stepper-btn';
    decreaseButton.setAttribute('data-account-action', 'decrease');
    decreaseButton.setAttribute('data-account-item-id', entry.id);
    decreaseButton.setAttribute('aria-label', `Disminuir ${entry.name}`);
    ensureAccountStepperGlyph(decreaseButton, '-');

    const quantityNode = document.createElement('span');
    quantityNode.className = 'menu-account-modal__stepper-qty';
    quantityNode.setAttribute('data-account-role', 'quantity');
    quantityNode.setAttribute('data-account-morph-align', 'center');
    setAccountTextValue(quantityNode, String(entry.quantity), { animate: false });

    const increaseButton = document.createElement('button');
    increaseButton.type = 'button';
    increaseButton.className = 'menu-account-modal__stepper-btn';
    increaseButton.setAttribute('data-account-action', 'increase');
    increaseButton.setAttribute('data-account-item-id', entry.id);
    increaseButton.setAttribute('aria-label', `Aumentar ${entry.name}`);
    ensureAccountStepperGlyph(increaseButton, '+');

    stepper.appendChild(decreaseButton);
    stepper.appendChild(quantityNode);
    stepper.appendChild(increaseButton);
    bottomRow.appendChild(stepper);

    const price = document.createElement('p');
    price.className = 'menu-account-modal__item-price';
    price.setAttribute('data-account-role', 'line-price');
    price.setAttribute('data-account-morph-align', 'end');
    setAccountTextValue(price, formatAccountCardMoney(entry.linePrice), { animate: false });
    bottomRow.appendChild(price);

    content.appendChild(bottomRow);
    card.appendChild(content);
    return card;
  };
  const syncAccountCardNode = (card, entry, { animate = false } = {}) => {
    if (!(card instanceof HTMLElement) || !entry) {
      return;
    }

    card.setAttribute('data-account-item-id', entry.id);
    syncAccountCardViewTransitionIdentity(card, entry.id);

    const thumb = card.querySelector('.menu-account-modal__thumb');
    if (thumb instanceof HTMLImageElement) {
      const nextSrc = entry.image || 'assets/menu/placeholders/card.svg';
      if (thumb.currentSrc !== nextSrc && thumb.getAttribute('src') !== nextSrc) {
        thumb.src = nextSrc;
      }

      const nextAlt = entry.imageAlt || entry.name;
      if (thumb.alt !== nextAlt) {
        thumb.alt = nextAlt;
      }
    }

    const title = card.querySelector('.menu-account-modal__item-title');
    if (title instanceof HTMLElement && title.textContent !== entry.name) {
      title.textContent = entry.name;
    }

    const description = card.querySelector('.menu-account-modal__item-description');
    if (description instanceof HTMLElement) {
      const nextDescription = entry.description || '';
      if (description.textContent !== nextDescription) {
        description.textContent = nextDescription;
      }
      description.hidden = !nextDescription;
    }

    const quantityNode = card.querySelector('[data-account-role="quantity"]');
    if (quantityNode instanceof HTMLElement) {
      quantityNode.setAttribute('data-account-morph-align', 'center');
    }
    setAccountTextValue(quantityNode, String(entry.quantity), { animate });

    const linePriceNode = card.querySelector('[data-account-role="line-price"]');
    if (linePriceNode instanceof HTMLElement) {
      linePriceNode.setAttribute('data-account-morph-align', 'end');
    }
    setAccountTextValue(linePriceNode, formatAccountCardMoney(entry.linePrice), {
      animate,
    });

    card
      .querySelectorAll('[data-account-item-id]')
      .forEach((node) => {
        node.setAttribute('data-account-item-id', entry.id);
      });

    const removeButton = card.querySelector('[data-account-action="remove"]');
    if (removeButton instanceof HTMLElement) {
      removeButton.setAttribute('aria-label', `Eliminar ${entry.name}`);
    }

    const decreaseButton = card.querySelector('[data-account-action="decrease"]');
    if (decreaseButton instanceof HTMLElement) {
      decreaseButton.setAttribute('aria-label', `Disminuir ${entry.name}`);
      ensureAccountStepperGlyph(decreaseButton);
    }

    const increaseButton = card.querySelector('[data-account-action="increase"]');
    if (increaseButton instanceof HTMLElement) {
      increaseButton.setAttribute('aria-label', `Aumentar ${entry.name}`);
      ensureAccountStepperGlyph(increaseButton);
    }
  };
  const renderAccountModalBody = ({ animate = false } = {}) => {
    if (!(accountModalBody instanceof HTMLElement)) {
      return;
    }

    const previousScrollTop = accountModalBody.scrollTop;
    const entries = buildAccountEntries();

    if (!entries.length) {
      accountModalBody.replaceChildren(createAccountEmptyStateNode());
      return;
    }

    const groups = buildAccountEntryGroups(entries);
    const list = document.createElement('div');
    list.className = 'menu-account-modal__list';

    const existingCardsById = new Map();
    const existingGroupsById = new Map();
    accountModalBody
      .querySelectorAll('.menu-account-modal__item[data-account-item-id]')
      .forEach((node) => {
        const itemId = normalizeText(node.getAttribute('data-account-item-id'));
        if (itemId) {
          syncAccountCardViewTransitionIdentity(node, itemId);
          existingCardsById.set(itemId, node);
        }
      });
    accountModalBody
      .querySelectorAll('.menu-account-modal__group[data-account-group-id]')
      .forEach((section) => {
        const groupId = normalizeText(section.getAttribute('data-account-group-id'));
        const groupNode = readAccountGroupNode(section);
        if (groupId && groupNode) {
          existingGroupsById.set(groupId, groupNode);
        }
      });

    groups.forEach((group) => {
      let groupNode = existingGroupsById.get(group.id);
      if (groupNode) {
        syncAccountGroupNode(groupNode, group, { animate });
        groupNode.items.replaceChildren();
        existingGroupsById.delete(group.id);
      } else {
        groupNode = createAccountGroupNode(group);
      }

      group.items.forEach((entry) => {
        let card = existingCardsById.get(entry.id);

        if (card instanceof HTMLElement) {
          syncAccountCardNode(card, entry, { animate });
          existingCardsById.delete(entry.id);
        } else {
          card = createAccountCardNode(entry);
        }

        groupNode.items.appendChild(card);
      });

      list.appendChild(groupNode.section);
    });

    existingGroupsById.forEach((groupNode) => {
      groupNode.section.remove();
    });

    existingCardsById.forEach((node) => {
      node.remove();
    });

    accountModalBody.replaceChildren(list);
    accountModalBody.scrollTop = previousScrollTop;
  };
  const renderAccountState = ({ persist = true, pulse = false, animate = false } = {}) => {
    computeAccountTotals();
    syncMenuCartBadges();
    syncAccountFooter({ animate });
    syncAccountCheckoutState();
    renderAccountModalBody({ animate });
    window.FigataScrollIndicators?.refresh?.();

    if (persist) {
      persistAccountSession();
    }

    if (pulse) {
      pulseMenuCartTargets();
    }
  };
  const clearAccountRemovalToastTimer = () => {
    if (!accountRemovalToastTimerId) {
      return;
    }

    window.clearTimeout(accountRemovalToastTimerId);
    accountRemovalToastTimerId = 0;
  };
  const hideAccountRemovalToast = ({ clearSnapshot = true } = {}) => {
    clearAccountRemovalToastTimer();

    if (accountToast instanceof HTMLElement) {
      accountToast.classList.remove('is-visible');
      accountToast.hidden = true;
    }

    if (clearSnapshot) {
      accountRemovalToastSnapshot = null;
    }
  };
  const showAccountRemovalToast = (snapshot) => {
    if (!(accountToast instanceof HTMLElement)) {
      return;
    }

    accountRemovalToastSnapshot = {
      itemId: normalizeText(snapshot?.itemId),
      quantity: clampNumber(Math.round(Number(snapshot?.quantity) || 0), 0, 999),
      orderIndex: clampNumber(Math.round(Number(snapshot?.orderIndex) || 0), 0, 999),
    };

    if (!accountRemovalToastSnapshot.itemId || accountRemovalToastSnapshot.quantity <= 0) {
      return;
    }

    if (accountToastTitle instanceof HTMLElement) {
      accountToastTitle.textContent =
        normalizeText(menuPageCopy?.accountModal?.removeToast?.title) ||
        ACCOUNT_REMOVE_TOAST_TITLE_DEFAULT;
    }

    if (accountToastCopy instanceof HTMLElement) {
      accountToastCopy.textContent =
        normalizeText(menuPageCopy?.accountModal?.removeToast?.description) ||
        ACCOUNT_REMOVE_TOAST_COPY_DEFAULT;
    }

    clearAccountRemovalToastTimer();
    accountToast.hidden = false;
    accountToast.classList.remove('is-visible');
    // Force reflow so the progress animation restarts on repeated removals.
    void accountToast.getBoundingClientRect();
    accountToast.classList.add('is-visible');

    accountRemovalToastTimerId = window.setTimeout(() => {
      hideAccountRemovalToast();
    }, ACCOUNT_REMOVE_TOAST_DURATION_MS);
  };
  const undoAccountRemovalToast = () => {
    const snapshot = accountRemovalToastSnapshot;
    if (!snapshot) {
      return false;
    }

    const itemId = normalizeText(snapshot.itemId);
    const quantity = clampNumber(Math.round(Number(snapshot.quantity) || 0), 0, 999);
    const orderIndex = clampNumber(
      Math.round(Number(snapshot.orderIndex) || 0),
      0,
      state.account.order.length
    );

    if (!itemId || quantity <= 0 || !state.itemsById.has(itemId)) {
      hideAccountRemovalToast();
      return false;
    }

    state.account.itemsById.set(itemId, quantity);
    state.account.order = state.account.order.filter((entryId) => entryId !== itemId);
    const restoreIndex = clampNumber(orderIndex, 0, state.account.order.length);
    state.account.order.splice(restoreIndex, 0, itemId);
    runAccountCardsViewTransition(
      () => {
        renderAccountState({ persist: true, animate: true });
      },
      { enterItemId: itemId }
    );
    trackMenuAccountMutation({
      item: state.itemsById.get(itemId),
      previousQuantity: 0,
      nextQuantity: quantity,
      detailOrigin: MENU_DETAIL_ORIGIN_UNDO,
    });
    hideAccountRemovalToast();
    return true;
  };
  const setAccountItemQuantity = (
    itemId,
    quantity,
    {
      persist = true,
      pulse = false,
      animate = true,
      showUndoToast = true,
      detailOrigin = '',
      emitAnalytics = true,
    } = {}
  ) => {
    const normalizedItemId = normalizeText(itemId);
    if (!normalizedItemId || !state.itemsById.has(normalizedItemId)) {
      return false;
    }

    const previousQuantity = getAccountQuantity(normalizedItemId);
    const previousOrderIndex = state.account.order.indexOf(normalizedItemId);
    const nextQuantity = clampNumber(Math.round(Number(quantity) || 0), 0, 999);
    const item = state.itemsById.get(normalizedItemId);

    if (previousQuantity === nextQuantity) {
      return false;
    }

    const isItemRemoval = previousQuantity > 0 && nextQuantity <= 0;
    const isItemInsertion = previousQuantity <= 0 && nextQuantity > 0;

    if (nextQuantity <= 0) {
      state.account.itemsById.delete(normalizedItemId);
      state.account.order = state.account.order.filter((id) => id !== normalizedItemId);
    } else {
      state.account.itemsById.set(normalizedItemId, nextQuantity);
      if (!state.account.order.includes(normalizedItemId)) {
        state.account.order.push(normalizedItemId);
      }
    }

    runAccountCardsViewTransition(
      () => {
        renderAccountState({ persist, pulse, animate });
      },
      {
        exitItemId: isItemRemoval ? normalizedItemId : '',
        enterItemId: isItemInsertion ? normalizedItemId : '',
      }
    );
    if (
      showUndoToast &&
      state.accountModalOpen &&
      isItemRemoval
    ) {
      showAccountRemovalToast({
        itemId: normalizedItemId,
        quantity: previousQuantity,
        orderIndex: previousOrderIndex,
      });
    }

    if (emitAnalytics) {
      trackMenuAccountMutation({
        item,
        previousQuantity,
        nextQuantity,
        detailOrigin,
      });
    }

    return true;
  };
  const addItemToAccount = (itemId, delta = 1, options = {}) => {
    const normalizedItemId = normalizeText(itemId);
    if (!normalizedItemId) {
      return false;
    }

    const step = Math.max(1, Math.round(Number(delta) || 1));
    const currentQuantity = getAccountQuantity(normalizedItemId);
    return setAccountItemQuantity(normalizedItemId, currentQuantity + step, options);
  };
  const removeItemFromAccount = (itemId, options = {}) =>
    setAccountItemQuantity(itemId, 0, options);
  const hydrateAccountSession = () => {
    state.account.itemsById.clear();
    state.account.order = [];

    const { items, shouldClear } = readPersistedAccountStorage();
    if (shouldClear) {
      clearPersistedAccountStorage();
    }

    if (Array.isArray(items)) {
      items.forEach((entry) => {
        const itemId = normalizeText(entry?.id);
        const quantity = clampNumber(Math.round(Number(entry?.qty) || 0), 0, 999);
        if (!itemId || quantity <= 0 || !state.itemsById.has(itemId)) {
          return;
        }

        state.account.itemsById.set(itemId, quantity);
        if (!state.account.order.includes(itemId)) {
          state.account.order.push(itemId);
        }
      });
    }

    renderAccountState({ persist: false, animate: false });
  };
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
  const formatCardPrice = (priceLabel) => {
    const normalizedPrice = normalizeText(priceLabel);
    if (!normalizedPrice) {
      return '';
    }
    return normalizedPrice
      .replace(/^RD\s*\$/i, '$')
      .replace(/^RD\b\s*/i, '')
      .replace(/[.,]\d+$/, '')
      .trim();
  };
  const getDetailSensoryProfileSchema = () =>
    typeof menuApi?.getSensoryProfileSchema === 'function'
      ? menuApi.getSensoryProfileSchema()
      : null;
  const getDetailSensoryScaleMax = () =>
    Math.max(1, Math.round(Number(getDetailSensoryProfileSchema()?.scale?.max) || 10));
  const normalizeSensoryAxisValue = (value, scaleMax = getDetailSensoryScaleMax()) => {
    const numeric = Number(value);

    if (!Number.isInteger(numeric) || numeric < 1 || numeric > scaleMax) {
      return null;
    }

    return numeric;
  };
  const normalizeDetailSensoryView = (value) => {
    const normalizedValue = normalizeText(value).toLowerCase();
    return DETAIL_SENSORY_VIEW_IDS.includes(normalizedValue)
      ? normalizedValue
      : DEFAULT_DETAIL_SENSORY_VIEW;
  };
  const DETAIL_ALLERGEN_ICONS = Object.freeze({
    milk: 'assets/lacteos.webp',
    nuts: 'assets/frutos-secos.webp',
    fish: 'assets/pescado.webp',
    gluten: 'assets/gluten.webp',
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

  const setAccountTriggerExpanded = (isOpen) => {
    getMenuCartTargets().forEach((target) => {
      target.setAttribute('aria-haspopup', 'dialog');
      target.setAttribute('aria-controls', 'menu-account-modal');
      target.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  };

  const setCompareTriggerExpanded = (isOpen) => {
    if (!(detailSensoryCompareButton instanceof HTMLButtonElement)) {
      return;
    }

    detailSensoryCompareButton.setAttribute('aria-haspopup', 'dialog');
    detailSensoryCompareButton.setAttribute('aria-controls', 'menu-compare-modal');
    detailSensoryCompareButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  };

  const setFilterModalDocumentState = () => {
    const hasOpenModal = Boolean(
      state.filterModalOpen || state.accountModalOpen || state.compareModalOpen
    );
    document.documentElement.classList.toggle('menu-filters-open', hasOpenModal);
    document.body.classList.toggle('menu-filters-open', hasOpenModal);
  };

  const clearFilterModalCloseTimer = () => {
    if (!filterModalCloseTimerId) {
      return;
    }

    window.clearTimeout(filterModalCloseTimerId);
    filterModalCloseTimerId = 0;
  };

  const clearAccountModalCloseTimer = () => {
    if (!accountModalCloseTimerId) {
      return;
    }

    window.clearTimeout(accountModalCloseTimerId);
    accountModalCloseTimerId = 0;
  };

  const clearCompareModalCloseTimer = () => {
    if (!compareModalCloseTimerId) {
      return;
    }

    window.clearTimeout(compareModalCloseTimerId);
    compareModalCloseTimerId = 0;
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

  const getDetailSensoryViewTabs = () => {
    if (!(detailSensoryViewTabsRoot instanceof HTMLElement)) {
      return [];
    }

    return Array.from(
      detailSensoryViewTabsRoot.querySelectorAll(
        '.menu-page-detail__sensory-view-tab[role="tab"]'
      )
    ).filter((tab) => tab instanceof HTMLElement);
  };

  const isDetailSensoryComparisonActive = () =>
    detailSensorySection instanceof HTMLElement &&
    detailSensorySection.dataset.comparisonActive === 'true';

  const setDetailSensoryComparisonMeta = ({
    active = false,
    currentLabel = '',
    comparedLabel = '',
  } = {}) => {
    if (
      !(detailSensoryComparisonMeta instanceof HTMLElement) ||
      !(detailSensoryComparisonCurrentName instanceof HTMLElement) ||
      !(detailSensoryComparisonComparedName instanceof HTMLElement)
    ) {
      return;
    }

    if (!active) {
      detailSensoryComparisonCurrentName.textContent = '';
      detailSensoryComparisonComparedName.textContent = '';
      detailSensoryComparisonMeta.hidden = true;
      return;
    }

    detailSensoryComparisonCurrentName.textContent = normalizeText(currentLabel);
    detailSensoryComparisonComparedName.textContent = normalizeText(comparedLabel);
    detailSensoryComparisonMeta.hidden = false;
  };

  const syncDetailSensoryCompareButton = ({
    hasSensoryProfile = false,
    hasComparison = false,
    compareEnabled = true,
  } = {}) => {
    if (!(detailSensoryCompareButton instanceof HTMLButtonElement)) {
      return;
    }

    const canCompare = hasSensoryProfile && compareEnabled;
    detailSensoryCompareButton.hidden = !canCompare;
    detailSensoryCompareButton.disabled = !canCompare;
    const sensoryCopy = menuDetailEditorialCopy?.sensory || MENU_DETAIL_EDITORIAL_COPY_DEFAULTS.sensory;
    detailSensoryCompareButton.textContent = hasComparison
      ? normalizeText(sensoryCopy?.compareButtonLabelActive) || MENU_DETAIL_EDITORIAL_COPY_DEFAULTS.sensory.compareButtonLabelActive
      : normalizeText(sensoryCopy?.compareButtonLabel) || MENU_DETAIL_EDITORIAL_COPY_DEFAULTS.sensory.compareButtonLabel;
  };

  const clearDetailSensoryRadarTooltipController = () => {
    if (!detailSensoryRadarTooltipController) {
      return;
    }

    if (typeof detailSensoryRadarTooltipController.destroy === 'function') {
      detailSensoryRadarTooltipController.destroy();
    }

    detailSensoryRadarTooltipController = null;
  };

  const hideDetailSensoryRadarTooltip = () => {
    if (!detailSensoryRadarTooltipController) {
      return;
    }

    if (typeof detailSensoryRadarTooltipController.hide === 'function') {
      detailSensoryRadarTooltipController.hide();
    }
  };

  const clearDetailSensoryBarsTooltipController = () => {
    if (!detailSensoryBarsTooltipController) {
      return;
    }

    if (typeof detailSensoryBarsTooltipController.destroy === 'function') {
      detailSensoryBarsTooltipController.destroy();
    }

    detailSensoryBarsTooltipController = null;
  };

  const hideDetailSensoryBarsTooltip = () => {
    if (!detailSensoryBarsTooltipController) {
      return;
    }

    if (typeof detailSensoryBarsTooltipController.hide === 'function') {
      detailSensoryBarsTooltipController.hide();
    }
  };

  const clearDetailSensoryRadarAnimationController = () => {
    if (!detailSensoryRadarAnimationController) {
      return;
    }

    if (typeof detailSensoryRadarAnimationController.destroy === 'function') {
      detailSensoryRadarAnimationController.destroy();
    }

    detailSensoryRadarAnimationController = null;
  };

  const clearDetailSensoryBarsAnimationController = () => {
    if (!detailSensoryBarsAnimationController) {
      return;
    }

    if (typeof detailSensoryBarsAnimationController.destroy === 'function') {
      detailSensoryBarsAnimationController.destroy();
    }

    detailSensoryBarsAnimationController = null;
  };

  const runDetailSensoryViewRevealAnimation = (
    view,
    { immediate = false } = {}
  ) => {
    if (view === 'radar') {
      if (typeof detailSensoryRadarAnimationController?.reveal === 'function') {
        detailSensoryRadarAnimationController.reveal({ immediate });
      }
      return;
    }

    if (view === 'bars') {
      if (typeof detailSensoryBarsAnimationController?.reveal === 'function') {
        detailSensoryBarsAnimationController.reveal({ immediate });
      }
    }
  };

  const getDetailSensoryPanelByView = (view) => {
    if (view === 'bars' && detailSensoryBarsPanel instanceof HTMLElement) {
      return detailSensoryBarsPanel;
    }

    if (view === 'radar' && detailSensoryRadarPanel instanceof HTMLElement) {
      return detailSensoryRadarPanel;
    }

    return null;
  };

  const setDetailSensoryPanelVisibility = (activeView) => {
    if (detailSensoryBarsPanel instanceof HTMLElement) {
      detailSensoryBarsPanel.hidden = activeView !== 'bars';
    }

    if (detailSensoryRadarPanel instanceof HTMLElement) {
      detailSensoryRadarPanel.hidden = activeView !== 'radar';
    }
  };

  const getDetailSensoryHeightTarget = () => {
    if (detailSensoryPanelsStack instanceof HTMLElement) {
      return detailSensoryPanelsStack;
    }

    if (detailSensorySection instanceof HTMLElement) {
      return detailSensorySection;
    }

    return null;
  };

  const clearDetailSensorySectionHeightAnimation = () => {
    if (detailSensorySectionHeightCleanupTimerId) {
      window.clearTimeout(detailSensorySectionHeightCleanupTimerId);
      detailSensorySectionHeightCleanupTimerId = 0;
    }

    const heightTarget = getDetailSensoryHeightTarget();

    if (heightTarget instanceof HTMLElement) {
      heightTarget.style.removeProperty('height');
      heightTarget.style.removeProperty('overflow');
      heightTarget.style.removeProperty('will-change');
      heightTarget.style.removeProperty('transition');
    }

    // Legacy cleanup in case old inline styles remain on section.
    if (detailSensorySection instanceof HTMLElement) {
      detailSensorySection.style.removeProperty('height');
      detailSensorySection.style.removeProperty('overflow');
      detailSensorySection.style.removeProperty('will-change');
      detailSensorySection.style.removeProperty('transition');
    }
  };

  const animateDetailSensorySectionHeight = ({
    fromHeight = 0,
    toHeight = 0,
    transitionToken,
  }) => {
    const heightTarget = getDetailSensoryHeightTarget();

    if (
      !(heightTarget instanceof HTMLElement) ||
      (detailSensorySection instanceof HTMLElement && detailSensorySection.hidden) ||
      reducedMotionQuery.matches
    ) {
      clearDetailSensorySectionHeightAnimation();
      return;
    }

    const startHeight = Math.max(0, fromHeight);
    const endHeight = Math.max(0, toHeight);
    const heightDelta = Math.abs(endHeight - startHeight);

    if (heightDelta < 1) {
      clearDetailSensorySectionHeightAnimation();
      return;
    }

    if (detailSensorySectionHeightCleanupTimerId) {
      window.clearTimeout(detailSensorySectionHeightCleanupTimerId);
      detailSensorySectionHeightCleanupTimerId = 0;
    }

    const resizeDuration = Math.min(
      620,
      Math.max(360, Math.round(DETAIL_SENSORY_SECTION_RESIZE_BASE_MS + heightDelta * 0.32))
    );

    heightTarget.style.height = `${startHeight}px`;
    heightTarget.style.overflow = 'hidden';
    heightTarget.style.willChange = 'height';
    heightTarget.style.transition = 'none';

    // Force sync so the next frame can transition from the locked height.
    void heightTarget.offsetHeight;

    window.requestAnimationFrame(() => {
      if (detailSensoryViewTransitionToken !== transitionToken) {
        return;
      }

      heightTarget.style.transition = `height ${resizeDuration}ms ${DETAIL_SENSORY_SECTION_RESIZE_EASE}`;
      heightTarget.style.height = `${endHeight}px`;
    });

    detailSensorySectionHeightCleanupTimerId = window.setTimeout(() => {
      if (detailSensoryViewTransitionToken !== transitionToken) {
        return;
      }

      clearDetailSensorySectionHeightAnimation();
    }, resizeDuration + 96);
  };

  const animateDetailSensoryViewTransition = ({ fromView = '', toView }) => {
    const nextPanel = getDetailSensoryPanelByView(toView);

    if (!(nextPanel instanceof HTMLElement)) {
      clearDetailSensorySectionHeightAnimation();
      setDetailSensoryPanelVisibility(toView);
      runDetailSensoryViewRevealAnimation(toView, { immediate: true });
      return;
    }

    const currentPanel = getDetailSensoryPanelByView(fromView);
    const transitionToken = detailSensoryViewTransitionToken + 1;
    detailSensoryViewTransitionToken = transitionToken;
    const heightTarget = getDetailSensoryHeightTarget();
    const isSensorySectionVisible =
      !(detailSensorySection instanceof HTMLElement) || !detailSensorySection.hidden;
    const shouldAnimateSectionHeight =
      heightTarget instanceof HTMLElement &&
      isSensorySectionVisible &&
      !reducedMotionQuery.matches;
    const initialSectionHeight = shouldAnimateSectionHeight
      ? heightTarget.getBoundingClientRect().height
      : 0;

    if (shouldAnimateSectionHeight) {
      clearDetailSensorySectionHeightAnimation();
      heightTarget.style.height = `${initialSectionHeight}px`;
      heightTarget.style.overflow = 'hidden';
      heightTarget.style.willChange = 'height';
      heightTarget.style.transition = 'none';
    } else {
      clearDetailSensorySectionHeightAnimation();
    }

    if (fromView === 'radar') {
      hideDetailSensoryRadarTooltip();
    }

    if (fromView === 'bars') {
      hideDetailSensoryBarsTooltip();
    }

    const runEnter = () => {
      if (detailSensoryViewTransitionToken !== transitionToken) {
        return;
      }

      setDetailSensoryPanelVisibility(toView);
      nextPanel.style.opacity = '0';
      nextPanel.style.transform = 'translateY(8px) scale(0.988)';
      nextPanel.style.willChange = 'opacity, transform';

      if (shouldAnimateSectionHeight) {
        const nextPanelTargetHeight = Math.max(
          0,
          nextPanel.scrollHeight || nextPanel.getBoundingClientRect().height
        );
        animateDetailSensorySectionHeight({
          fromHeight: initialSectionHeight,
          toHeight: nextPanelTargetHeight,
          transitionToken,
        });
      }

      runDetailSensoryViewRevealAnimation(toView);

      window.requestAnimationFrame(() => {
        if (detailSensoryViewTransitionToken !== transitionToken) {
          return;
        }

        const enterAnimation = nextPanel.animate(
          [
            { opacity: 0, transform: 'translateY(8px) scale(0.988)' },
            { opacity: 1, transform: 'translateY(0) scale(1)' },
          ],
          {
            duration: DETAIL_SENSORY_VIEW_ENTER_MS,
            easing: DETAIL_SENSORY_VIEW_EASE,
            fill: 'forwards',
          }
        );

        const clearStyles = () => {
          if (detailSensoryViewTransitionToken !== transitionToken) {
            return;
          }

          nextPanel.style.removeProperty('opacity');
          nextPanel.style.removeProperty('transform');
          nextPanel.style.removeProperty('will-change');
        };

        enterAnimation.onfinish = clearStyles;
        enterAnimation.oncancel = clearStyles;
      });
    };

    if (
      !(currentPanel instanceof HTMLElement) ||
      currentPanel === nextPanel ||
      currentPanel.hidden
    ) {
      runEnter();
      return;
    }

    currentPanel.style.willChange = 'opacity, transform';
    const exitAnimation = currentPanel.animate(
      [
        { opacity: 1, transform: 'translateY(0) scale(1)' },
        { opacity: 0, transform: 'translateY(5px) scale(0.992)' },
      ],
      {
        duration: DETAIL_SENSORY_VIEW_EXIT_MS,
        easing: DETAIL_SENSORY_VIEW_EASE,
        fill: 'forwards',
      }
    );

    const finishExit = () => {
      if (detailSensoryViewTransitionToken !== transitionToken) {
        return;
      }

      currentPanel.hidden = true;
      currentPanel.style.removeProperty('opacity');
      currentPanel.style.removeProperty('transform');
      currentPanel.style.removeProperty('will-change');
      runEnter();
    };

    exitAnimation.onfinish = finishExit;
    exitAnimation.oncancel = finishExit;
  };

  const syncDetailSensoryViewState = ({ focus = false } = {}) => {
    if (!(detailSensoryViewTabsRoot instanceof HTMLElement)) {
      return;
    }

    const tabs = getDetailSensoryViewTabs();

    if (!tabs.length) {
      return;
    }

    const comparisonActive = isDetailSensoryComparisonActive();
    const requestedView = normalizeDetailSensoryView(state.detailSensoryView);
    const activeView = comparisonActive ? 'radar' : requestedView;
    state.detailSensoryView = activeView;
    const activeIndex = Math.max(
      0,
      tabs.findIndex(
        (tab) => normalizeDetailSensoryView(tab.dataset.sensoryView) === activeView
      )
    );

    detailSensoryViewTabsRoot.style.setProperty(
      '--menu-detail-sensory-toggle-count',
      String(tabs.length)
    );
    detailSensoryViewTabsRoot.style.setProperty(
      '--menu-detail-sensory-toggle-active-index',
      String(activeIndex)
    );

    tabs.forEach((tab, tabIndex) => {
      const tabView = normalizeDetailSensoryView(tab.dataset.sensoryView);
      const isDisabled = comparisonActive && tabView === 'bars';
      const isActive = tabIndex === activeIndex;
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
      tab.setAttribute('aria-disabled', isDisabled ? 'true' : 'false');
      if (tab instanceof HTMLButtonElement) {
        tab.disabled = isDisabled;
      }
      tab.classList.toggle('is-active', isActive);
    });

    const previousViewRaw = normalizeText(
      detailSensoryViewTabsRoot.dataset.activeSensoryView
    ).toLowerCase();
    const hasPreviousView = DETAIL_SENSORY_VIEW_IDS.includes(previousViewRaw);
    const previousView = hasPreviousView ? previousViewRaw : '';

    if (activeView !== 'radar') {
      hideDetailSensoryRadarTooltip();
    }

    if (activeView !== 'bars') {
      hideDetailSensoryBarsTooltip();
    }

    if (!(detailSensorySection instanceof HTMLElement) || detailSensorySection.hidden) {
      clearDetailSensorySectionHeightAnimation();
      setDetailSensoryPanelVisibility(activeView);
      runDetailSensoryViewRevealAnimation(activeView, { immediate: true });
      detailSensoryViewTabsRoot.dataset.activeSensoryView = activeView;

      if (focus) {
        tabs[activeIndex].focus();
      }
      return;
    }

    if (!hasPreviousView || previousView !== activeView) {
      animateDetailSensoryViewTransition({
        fromView: previousView,
        toView: activeView,
      });
    } else {
      clearDetailSensorySectionHeightAnimation();
      setDetailSensoryPanelVisibility(activeView);
    }

    detailSensoryViewTabsRoot.dataset.activeSensoryView = activeView;

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

    const sliderContainer =
      track.parentElement instanceof HTMLElement ? track.parentElement : null;
    const sliderWidth = sliderContainer?.getBoundingClientRect?.().width || 0;
    const priceRangeRoot =
      sliderContainer?.closest?.('.menu-filter-modal__price-range') || sliderContainer || track;
    const thumbSize = Number.parseFloat(
      window
        .getComputedStyle(priceRangeRoot)
        .getPropertyValue('--menu-filter-price-thumb-size')
    );
    const normalizedEdgeGap = Number.isFinite(thumbSize) ? thumbSize / 2 : 0;
    const usefulTrackWidth = Math.max(sliderWidth - normalizedEdgeGap * 2, 0);
    const leftPx = normalizedEdgeGap + (leftPercent / 100) * usefulTrackWidth;
    const rightPx = normalizedEdgeGap + (rightPercent / 100) * usefulTrackWidth;

    track.style.left = `${leftPx}px`;
    track.style.right = `${rightPx}px`;
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
    state.priceRangeInitialized = true;
  };

  const ensureFilterModalRuntimeReady = () => {
    if (!state.priceRangeInitialized) {
      initPriceRange();
    }

    renderFilterModalShell();
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

  const bindDetailSensoryViewTabs = () => {
    if (!(detailSensoryViewTabsRoot instanceof HTMLElement)) {
      return;
    }

    if (detailSensoryViewTabsRoot.dataset.bound === 'true') {
      return;
    }

    const tabs = getDetailSensoryViewTabs();

    if (!tabs.length) {
      return;
    }

    const activateTab = (index, { focus = false } = {}) => {
      const nextIndex = Math.max(0, Math.min(index, tabs.length - 1));
      const nextView = normalizeDetailSensoryView(tabs[nextIndex].dataset.sensoryView);
      if (isDetailSensoryComparisonActive() && nextView === 'bars') {
        state.detailSensoryView = 'radar';
        syncDetailSensoryViewState({ focus: false });
        return;
      }

      state.detailSensoryView = nextView;
      syncDetailSensoryViewState({ focus });
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

    syncDetailSensoryViewState();
    detailSensoryViewTabsRoot.dataset.bound = 'true';
  };

  const getModalFocusableElements = (dialogNode) => {
    if (!(dialogNode instanceof HTMLElement)) {
      return [];
    }

    return Array.from(
      dialogNode.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(
      (node) =>
        node instanceof HTMLElement &&
        !node.hidden &&
        node.getClientRects().length > 0
    );
  };

  const getFilterModalFocusableElements = () => getModalFocusableElements(filterDialog);

  const getAccountModalFocusableElements = () => getModalFocusableElements(accountDialog);
  const getCompareModalFocusableElements = () => getModalFocusableElements(compareDialog);
  const setAccountTotalInfoOpen = (isOpen) => {
    if (!(accountTotalInfoToggle instanceof HTMLButtonElement)) {
      return;
    }

    accountTotalInfoToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  };

  const finishFilterModalClose = ({ restoreFocus = true } = {}) => {
    clearFilterModalCloseTimer();
    cancelFilterModalChromeFrame();

    if (!(filterModal instanceof HTMLElement)) {
      return;
    }

    filterModal.hidden = true;
    filterModal.removeAttribute('data-state');
    setFilterModalDocumentState();
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

  const finishAccountModalClose = ({ restoreFocus = true } = {}) => {
    clearAccountModalCloseTimer();
    setAccountTotalInfoOpen(false);
    hideAccountRemovalToast();

    if (!(accountModal instanceof HTMLElement)) {
      return;
    }

    accountModal.hidden = true;
    accountModal.removeAttribute('data-state');
    setFilterModalDocumentState();
    setAccountTriggerExpanded(false);

    if (accountDialog instanceof HTMLElement) {
      accountDialog.setAttribute('data-footer-shadow', 'hidden');
    }

    if (restoreFocus && accountModalRestoreFocusNode instanceof HTMLElement) {
      accountModalRestoreFocusNode.focus();
    }

    accountModalRestoreFocusNode = null;
  };

  const closeAccountModal = ({ restoreFocus = true, immediate = false } = {}) => {
    if (!(accountModal instanceof HTMLElement)) {
      return;
    }

    clearAccountModalCloseTimer();
    state.accountModalOpen = false;
    setAccountTriggerExpanded(false);
    emitBridgeState();

    if (accountModal.hidden || immediate || reducedMotionQuery.matches) {
      finishAccountModalClose({ restoreFocus });
      return;
    }

    accountModal.setAttribute('data-state', 'closing');
    accountModalCloseTimerId = window.setTimeout(() => {
      finishAccountModalClose({ restoreFocus });
    }, FILTER_MODAL_EXIT_MS);
  };

  const finishCompareModalClose = ({ restoreFocus = true } = {}) => {
    clearCompareModalCloseTimer();

    if (!(compareModal instanceof HTMLElement)) {
      return;
    }

    compareModal.hidden = true;
    compareModal.removeAttribute('data-state');
    setFilterModalDocumentState();
    setCompareTriggerExpanded(false);

    if (restoreFocus && compareModalRestoreFocusNode instanceof HTMLElement) {
      compareModalRestoreFocusNode.focus();
    }

    compareModalRestoreFocusNode = null;
  };

  const closeCompareModal = ({ restoreFocus = true, immediate = false } = {}) => {
    if (!(compareModal instanceof HTMLElement)) {
      return;
    }

    clearCompareModalCloseTimer();
    state.compareModalOpen = false;
    setCompareTriggerExpanded(false);
    emitBridgeState();

    if (compareModal.hidden || immediate || reducedMotionQuery.matches) {
      finishCompareModalClose({ restoreFocus });
      return;
    }

    compareModal.setAttribute('data-state', 'closing');
    compareModalCloseTimerId = window.setTimeout(() => {
      finishCompareModalClose({ restoreFocus });
    }, FILTER_MODAL_EXIT_MS);
  };

  const openAccountModal = () => {
    if (!(accountModal instanceof HTMLElement) || !(accountDialog instanceof HTMLElement)) {
      return;
    }

    void loadRestaurantCommerceContact();
    clearAccountModalCloseTimer();
    setAccountTotalInfoOpen(false);
    hideAccountRemovalToast();
    renderAccountState({ persist: false, animate: false });

    if (state.filterModalOpen) {
      closeFilterModal({ restoreFocus: false, immediate: true });
    }

    if (state.compareModalOpen) {
      closeCompareModal({ restoreFocus: false, immediate: true });
    }

    if (!accountModal.hidden && state.accountModalOpen) {
      return;
    }

    accountModalRestoreFocusNode =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : getPreferredMenuCartTarget();
    state.accountModalOpen = true;
    accountModal.hidden = false;
    setFilterModalDocumentState();
    setAccountTriggerExpanded(true);
    emitBridgeState();
    trackMenuCartView();
    accountModal.setAttribute('data-state', 'opening');
    accountDialog.setAttribute('data-footer-shadow', 'hidden');

    window.requestAnimationFrame(() => {
      if (!(accountModal instanceof HTMLElement)) {
        return;
      }

      accountModal.setAttribute('data-state', 'open');
      window.FigataScrollIndicators?.refresh?.();
    });

    window.setTimeout(() => {
      const focusTarget = accountCloseButton instanceof HTMLButtonElement
        ? accountCloseButton
        : getAccountModalFocusableElements()[0] || accountDialog;

      window.FigataScrollIndicators?.refresh?.();

      if (focusTarget instanceof HTMLElement) {
        focusTarget.focus();
      }
    }, reducedMotionQuery.matches ? 0 : 70);
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

    if (state.accountModalOpen) {
      closeAccountModal({ restoreFocus: false, immediate: true });
    }

    if (state.compareModalOpen) {
      closeCompareModal({ restoreFocus: false, immediate: true });
    }

    loadDraftFiltersFromApplied();
    ensureFilterModalRuntimeReady();
    ensureOrganolepticIconsForFilterModal();

    if (!filterModal.hidden && state.filterModalOpen) {
      return;
    }

    filterModalRestoreFocusNode =
      document.activeElement instanceof HTMLElement ? document.activeElement : filterButton;
    state.filterModalOpen = true;
    filterModal.hidden = false;
    setFilterModalDocumentState();
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

  const openCompareModal = () => {
    if (!(compareModal instanceof HTMLElement) || !(compareDialog instanceof HTMLElement)) {
      return;
    }

    clearCompareModalCloseTimer();

    if (state.filterModalOpen) {
      closeFilterModal({ restoreFocus: false, immediate: true });
    }

    if (state.accountModalOpen) {
      closeAccountModal({ restoreFocus: false, immediate: true });
    }

    if (!compareModal.hidden && state.compareModalOpen) {
      return;
    }

    compareModalRestoreFocusNode =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : detailSensoryCompareButton;
    state.compareModalOpen = true;
    compareModal.hidden = false;
    setFilterModalDocumentState();
    setCompareTriggerExpanded(true);
    emitBridgeState();
    compareModal.setAttribute('data-state', 'opening');

    window.requestAnimationFrame(() => {
      if (!(compareModal instanceof HTMLElement)) {
        return;
      }

      compareModal.setAttribute('data-state', 'open');
      window.FigataScrollIndicators?.refresh?.();
    });

    window.setTimeout(() => {
      const focusTarget =
        compareSearchInput instanceof HTMLInputElement
          ? compareSearchInput
          : compareCloseButton instanceof HTMLButtonElement
            ? compareCloseButton
            : getCompareModalFocusableElements()[0] || compareDialog;

      window.FigataScrollIndicators?.refresh?.();

      if (focusTarget instanceof HTMLElement) {
        focusTarget.focus();
      }
    }, reducedMotionQuery.matches ? 0 : 70);
  };

  const openAdminPreviewModalSurface = ({
    modalKey = '',
    smooth = false,
  } = {}) => {
    if (
      !isAdminPreviewMode ||
      adminPreviewSurface !== ADMIN_PREVIEW_SURFACE_MODAL
    ) {
      return;
    }

    const normalizedModalKey =
      normalizeAdminPreviewModalKey(modalKey) ||
      normalizeAdminPreviewModalKey(adminPreviewModalActive) ||
      'account';
    adminPreviewModalActive = normalizedModalKey;
    syncAdminPreviewSurfaceAttributes();

    if (normalizedModalKey === 'filter') {
      openFilterModal();
      return;
    }

    if (normalizedModalKey === 'compare') {
      state.compareSearchQuery = '';
      if (compareSearchInput instanceof HTMLInputElement) {
        compareSearchInput.value = '';
      }
      syncCompareSearchControls();
      renderCompareModalShell();
      openCompareModal();
      if (!smooth && compareModal instanceof HTMLElement) {
        compareModal.scrollTop = 0;
      }
      return;
    }

    openAccountModal();
    if (!smooth && accountModal instanceof HTMLElement) {
      accountModal.scrollTop = 0;
    }
  };

  const applyAdminPreviewModalPayload = (payload = {}) => {
    if (!isAdminPreviewMode || !isObject(payload)) {
      return;
    }

    if (isObject(payload.home)) {
      const context = applyHomeMenuDetailContextFromPayload(payload.home);
      homeMenuDetailContextPromise = Promise.resolve(context);
    }

    const requestedModalKey = normalizeAdminPreviewModalKey(payload.modal);
    if (requestedModalKey) {
      adminPreviewModalActive = requestedModalKey;
    }

    syncAdminPreviewSurfaceAttributes();

    if (adminPreviewSurface !== ADMIN_PREVIEW_SURFACE_MODAL) {
      return;
    }

    window.requestAnimationFrame(() => {
      openAdminPreviewModalSurface({
        modalKey: adminPreviewModalActive,
        smooth: false,
      });
    });
  };

  const finishBridgeReady = () => {
    if (!bridgeReadyResolver) {
      return;
    }

    bridgeReadyResolver();
    bridgeReadyResolver = null;
    window.dispatchEvent(new CustomEvent('figata:menu-page-ready'));
    emitAdminPreviewReadyMessage();
  };

  const emitAdminPreviewReadyMessage = () => {
    if (!isAdminPreviewMode || window.parent === window) {
      return;
    }

    try {
      window.parent.postMessage(
        {
          type: ADMIN_PREVIEW_MESSAGE_READY,
        },
        window.location.origin
      );
    } catch (_error) {
      // Swallow postMessage errors inside embedded preview mode.
    }
  };

  const emitAdminPreviewNavigateEditorMessage = (sectionId = '') => {
    if (!isAdminPreviewMode || window.parent === window) {
      return;
    }

    const normalizedSection = normalizeText(sectionId).toLowerCase();
    if (!ADMIN_PREVIEW_SECTION_KEYS.has(normalizedSection)) {
      return;
    }

    try {
      window.parent.postMessage(
        {
          type: ADMIN_PREVIEW_MESSAGE_NAVIGATE_EDITOR,
          payload: {
            section: normalizedSection,
          },
        },
        window.location.origin
      );
    } catch (_error) {
      // Swallow postMessage errors inside embedded preview mode.
    }
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
    isAccountModalOpen: Boolean(state.accountModalOpen),
    isCompareModalOpen: Boolean(state.compareModalOpen),
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

    if (publicPaths?.toSitePath) {
      return publicPaths.toSitePath(cleaned);
    }

    return `/${cleaned}`;
  };

  const normalizeAbsoluteUrl = (value, fallback = '') => {
    const raw = normalizeText(value);
    const fallbackUrl = normalizeText(fallback);
    const candidate = raw || fallbackUrl;

    if (!candidate) {
      return '';
    }

    try {
      return new URL(candidate, ROOT_URL).toString();
    } catch (_error) {
      return fallbackUrl || '';
    }
  };

  const syncAccountCheckoutTarget = () => {
    if (!(accountCheckoutButton instanceof HTMLButtonElement)) {
      return;
    }

    accountCheckoutButton.dataset.analyticsTarget = normalizeAbsoluteUrl(
      restaurantCommerceContact?.whatsappUrl,
      DEFAULT_RESTAURANT_WHATSAPP_URL
    );
  };

  const loadRestaurantCommerceContact = () => {
    if (restaurantCommerceContactPromise) {
      return restaurantCommerceContactPromise;
    }

    restaurantCommerceContactPromise = fetch(
      new URL('data/restaurant.json', ROOT_URL).toString(),
      {
        credentials: 'same-origin',
        cache: 'default',
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`restaurant.json respondió ${response.status}`);
        }

        return response.json();
      })
      .then((payload) => {
        restaurantCommerceContact = {
          currency:
            normalizeText(payload?.currency || payload?.contact?.currency).toUpperCase() ||
            DEFAULT_COMMERCE_CURRENCY,
          whatsappUrl: normalizeAbsoluteUrl(
            payload?.whatsapp || payload?.contact?.whatsapp,
            DEFAULT_RESTAURANT_WHATSAPP_URL
          ),
        };
        syncAccountCheckoutTarget();
        return restaurantCommerceContact;
      })
      .catch((error) => {
        console.warn('[menu-page] No se pudo resolver restaurant.json para checkout.', error);
        restaurantCommerceContact = {
          currency: DEFAULT_COMMERCE_CURRENCY,
          whatsappUrl: normalizeAbsoluteUrl(
            DEFAULT_RESTAURANT_WHATSAPP_URL,
            DEFAULT_RESTAURANT_WHATSAPP_URL
          ),
        };
        syncAccountCheckoutTarget();
        return restaurantCommerceContact;
      });

    return restaurantCommerceContactPromise;
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

  const toMenuListUrl = () =>
    publicPaths?.toSitePath ? publicPaths.toSitePath(MENU_ROUTE_PREFIX) : MENU_ROUTE_PREFIX;

  const toMenuDetailUrl = (itemId) => {
    const normalizedId = normalizeText(itemId);
    return normalizedId
      ? `${toMenuListUrl()}${encodeURIComponent(normalizedId)}`
      : toMenuListUrl();
  };

  const applyMenuPageCopyToDom = () => {
    const copy = menuPageCopy || MENU_PAGE_COPY_DEFAULTS;
    const filterCopy = copy?.filterModal || MENU_PAGE_COPY_DEFAULTS.filterModal;
    if (menuPageTitle instanceof HTMLElement) {
      menuPageTitle.textContent = normalizeText(copy?.hero?.title) || MENU_PAGE_COPY_DEFAULTS.hero.title;
    }
    if (menuPageSubtitle instanceof HTMLElement) {
      menuPageSubtitle.textContent =
        normalizeText(copy?.hero?.subtitle) || MENU_PAGE_COPY_DEFAULTS.hero.subtitle;
    }
    if (searchInput instanceof HTMLInputElement) {
      searchInput.placeholder = normalizeText(copy?.search?.placeholder);
    }
    if (searchHelperPrefix instanceof HTMLElement) {
      searchHelperPrefix.textContent =
        normalizeText(copy?.search?.helperPrefix) ||
        MENU_PAGE_COPY_DEFAULTS.search.helperPrefix;
    }
    if (accountModalTitle instanceof HTMLElement) {
      accountModalTitle.textContent =
        normalizeText(copy?.accountModal?.title) ||
        MENU_PAGE_COPY_DEFAULTS.accountModal.title;
    }
    if (accountLabelSubtotal instanceof HTMLElement) {
      accountLabelSubtotal.textContent =
        normalizeText(copy?.accountModal?.labels?.subtotal) ||
        MENU_PAGE_COPY_DEFAULTS.accountModal.labels.subtotal;
    }
    if (accountLabelItbis instanceof HTMLElement) {
      accountLabelItbis.textContent =
        normalizeText(copy?.accountModal?.labels?.itbis) ||
        MENU_PAGE_COPY_DEFAULTS.accountModal.labels.itbis;
    }
    if (accountLabelLegalTip instanceof HTMLElement) {
      accountLabelLegalTip.textContent =
        normalizeText(copy?.accountModal?.labels?.legalTip) ||
        MENU_PAGE_COPY_DEFAULTS.accountModal.labels.legalTip;
    }
    if (accountLabelTotal instanceof HTMLElement) {
      accountLabelTotal.textContent =
        normalizeText(copy?.accountModal?.labels?.total) ||
        MENU_PAGE_COPY_DEFAULTS.accountModal.labels.total;
    }
    if (accountTotalInfoTitle instanceof HTMLElement) {
      accountTotalInfoTitle.textContent =
        normalizeText(copy?.accountModal?.totalTooltip?.title) ||
        MENU_PAGE_COPY_DEFAULTS.accountModal.totalTooltip.title;
    }
    if (accountTotalInfoCopy instanceof HTMLElement) {
      accountTotalInfoCopy.textContent =
        normalizeText(copy?.accountModal?.totalTooltip?.description) ||
        MENU_PAGE_COPY_DEFAULTS.accountModal.totalTooltip.description;
    }
    if (filterModalTitle instanceof HTMLElement) {
      filterModalTitle.textContent =
        normalizeText(filterCopy?.title) || MENU_PAGE_COPY_DEFAULTS.filterModal.title;
    }
    if (filterSectionTitleAllergens instanceof HTMLElement) {
      filterSectionTitleAllergens.textContent =
        normalizeText(filterCopy?.sections?.allergens?.title) ||
        MENU_PAGE_COPY_DEFAULTS.filterModal.sections.allergens.title;
    }
    if (filterSectionCopyAllergens instanceof HTMLElement) {
      filterSectionCopyAllergens.textContent =
        normalizeText(filterCopy?.sections?.allergens?.description) ||
        MENU_PAGE_COPY_DEFAULTS.filterModal.sections.allergens.description;
    }
    if (filterSectionTitlePizzaType instanceof HTMLElement) {
      filterSectionTitlePizzaType.textContent =
        normalizeText(filterCopy?.sections?.pizzaType?.title) ||
        MENU_PAGE_COPY_DEFAULTS.filterModal.sections.pizzaType.title;
    }
    if (filterPizzaTabAll instanceof HTMLElement) {
      filterPizzaTabAll.textContent =
        normalizeText(filterCopy?.sections?.pizzaType?.tabs?.all) ||
        MENU_PAGE_COPY_DEFAULTS.filterModal.sections.pizzaType.tabs.all;
    }
    if (filterPizzaTabClasica instanceof HTMLElement) {
      filterPizzaTabClasica.textContent =
        normalizeText(filterCopy?.sections?.pizzaType?.tabs?.clasica) ||
        MENU_PAGE_COPY_DEFAULTS.filterModal.sections.pizzaType.tabs.clasica;
    }
    if (filterPizzaTabAutor instanceof HTMLElement) {
      filterPizzaTabAutor.textContent =
        normalizeText(filterCopy?.sections?.pizzaType?.tabs?.autor) ||
        MENU_PAGE_COPY_DEFAULTS.filterModal.sections.pizzaType.tabs.autor;
    }
    if (filterSectionTitlePriceRange instanceof HTMLElement) {
      filterSectionTitlePriceRange.textContent =
        normalizeText(filterCopy?.sections?.priceRange?.title) ||
        MENU_PAGE_COPY_DEFAULTS.filterModal.sections.priceRange.title;
    }
    if (filterSectionCopyPriceRange instanceof HTMLElement) {
      filterSectionCopyPriceRange.textContent =
        normalizeText(filterCopy?.sections?.priceRange?.description) ||
        MENU_PAGE_COPY_DEFAULTS.filterModal.sections.priceRange.description;
    }
    if (filterPriceLabelMin instanceof HTMLElement) {
      filterPriceLabelMin.textContent =
        normalizeText(filterCopy?.sections?.priceRange?.minLabel) ||
        MENU_PAGE_COPY_DEFAULTS.filterModal.sections.priceRange.minLabel;
    }
    if (filterPriceLabelMax instanceof HTMLElement) {
      filterPriceLabelMax.textContent =
        normalizeText(filterCopy?.sections?.priceRange?.maxLabel) ||
        MENU_PAGE_COPY_DEFAULTS.filterModal.sections.priceRange.maxLabel;
    }
    if (filterSectionTitleDietary instanceof HTMLElement) {
      filterSectionTitleDietary.textContent =
        normalizeText(filterCopy?.sections?.dietary?.title) ||
        MENU_PAGE_COPY_DEFAULTS.filterModal.sections.dietary.title;
    }
    if (filterDietVegetarianTitle instanceof HTMLElement) {
      filterDietVegetarianTitle.textContent =
        normalizeText(filterCopy?.sections?.dietary?.vegetarianTitle) ||
        MENU_PAGE_COPY_DEFAULTS.filterModal.sections.dietary.vegetarianTitle;
    }
    if (filterDietVegetarianDescription instanceof HTMLElement) {
      filterDietVegetarianDescription.textContent =
        normalizeText(filterCopy?.sections?.dietary?.vegetarianDescription) ||
        MENU_PAGE_COPY_DEFAULTS.filterModal.sections.dietary.vegetarianDescription;
    }
    if (filterDietVeganTitle instanceof HTMLElement) {
      filterDietVeganTitle.textContent =
        normalizeText(filterCopy?.sections?.dietary?.veganTitle) ||
        MENU_PAGE_COPY_DEFAULTS.filterModal.sections.dietary.veganTitle;
    }
    if (filterDietVeganDescription instanceof HTMLElement) {
      filterDietVeganDescription.textContent =
        normalizeText(filterCopy?.sections?.dietary?.veganDescription) ||
        MENU_PAGE_COPY_DEFAULTS.filterModal.sections.dietary.veganDescription;
    }
    if (filterSectionTitleOrganoleptic instanceof HTMLElement) {
      filterSectionTitleOrganoleptic.textContent =
        normalizeText(filterCopy?.sections?.organoleptic?.title) ||
        MENU_PAGE_COPY_DEFAULTS.filterModal.sections.organoleptic.title;
    }
    if (filterSectionCopyOrganoleptic instanceof HTMLElement) {
      filterSectionCopyOrganoleptic.textContent =
        normalizeText(filterCopy?.sections?.organoleptic?.description) ||
        MENU_PAGE_COPY_DEFAULTS.filterModal.sections.organoleptic.description;
    }
    if (filterClearButton instanceof HTMLButtonElement) {
      filterClearButton.textContent =
        normalizeText(filterCopy?.actions?.clearLabel) ||
        MENU_PAGE_COPY_DEFAULTS.filterModal.actions.clearLabel;
    }
    if (filterApplyPrefix instanceof HTMLElement) {
      filterApplyPrefix.textContent =
        normalizeText(filterCopy?.actions?.applyPrefix) ||
        MENU_PAGE_COPY_DEFAULTS.filterModal.actions.applyPrefix;
    }
    if (filterApplySuffix instanceof HTMLElement) {
      filterApplySuffix.textContent =
        normalizeText(filterCopy?.actions?.applySuffix) ||
        MENU_PAGE_COPY_DEFAULTS.filterModal.actions.applySuffix;
    }

    if (state.accountModalOpen) {
      renderAccountState({ persist: false, animate: false });
    }
    if (state.filterModalOpen) {
      renderFilterModalShell();
    }
  };

  const applyDetailEditorialCopyToDom = () => {
    const copy = menuDetailEditorialCopy || MENU_DETAIL_EDITORIAL_COPY_DEFAULTS;
    setDetailSensorySectionTitle(
      normalizeText(copy?.sensory?.sectionTitle) ||
        DETAIL_DEFAULT_SECTION_COPY.sensoryTitle
    );
    if (detailSensorySubtitle instanceof HTMLElement) {
      const subtitle =
        normalizeText(copy?.sensory?.subtitle) ||
        DETAIL_DEFAULT_SENSORY_SUBTITLE;
      if (!normalizeText(detailSensorySubtitle.textContent)) {
        detailSensorySubtitle.textContent = subtitle;
      }
    }
    if (detailSensoryTabRadarTitle instanceof HTMLElement) {
      detailSensoryTabRadarTitle.textContent =
        normalizeText(copy?.sensory?.tabRadarLabel) ||
        DETAIL_DEFAULT_SECTION_COPY.sensoryTabRadar;
    }
    if (detailSensoryTabBarsTitle instanceof HTMLElement) {
      detailSensoryTabBarsTitle.textContent =
        normalizeText(copy?.sensory?.tabBarsLabel) ||
        DETAIL_DEFAULT_SECTION_COPY.sensoryTabBars;
    }
    if (detailSensoryComparisonClearButton instanceof HTMLButtonElement) {
      detailSensoryComparisonClearButton.textContent =
        normalizeText(copy?.sensory?.comparisonClearLabel) ||
        DETAIL_DEFAULT_SECTION_COPY.sensoryComparisonClear;
    }
    setDetailPairingsSectionTitle(
      normalizeText(copy?.pairings?.sectionTitle) ||
        DETAIL_DEFAULT_SECTION_COPY.pairingsTitle
    );
    if (detailPairingsSubtitle instanceof HTMLElement) {
      detailPairingsSubtitle.textContent =
        normalizeText(copy?.pairings?.sectionSubtitle) ||
        DETAIL_DEFAULT_PAIRING_CONTENT.subtitle;
    }
    setDetailHistorySectionTitle(
      normalizeText(copy?.story?.sectionTitle) ||
        DETAIL_DEFAULT_SECTION_COPY.storyTitle
    );
    if (compareModalTitle instanceof HTMLElement) {
      compareModalTitle.textContent =
        normalizeText(copy?.compareModal?.title) ||
        DETAIL_DEFAULT_SECTION_COPY.compareModalTitle;
    }
    if (compareModalDescription instanceof HTMLElement) {
      compareModalDescription.textContent =
        normalizeText(copy?.compareModal?.description) ||
        DETAIL_DEFAULT_SECTION_COPY.compareModalDescription;
    }
    if (compareSearchInput instanceof HTMLInputElement) {
      compareSearchInput.placeholder = normalizeText(copy?.compareModal?.searchPlaceholder);
    }
    if (compareSearchHelperPrefix instanceof HTMLElement) {
      compareSearchHelperPrefix.textContent =
        normalizeText(copy?.compareModal?.searchHelperPrefix) ||
        DETAIL_DEFAULT_SECTION_COPY.compareSearchHelperPrefix;
    }
    if (compareSearchHelperWord instanceof HTMLElement) {
      compareSearchHelperWord.textContent =
        normalizeText(copy?.compareModal?.searchHelperWord) ||
        DETAIL_DEFAULT_SECTION_COPY.compareSearchHelperWord;
    }

    if (state.compareModalOpen) {
      renderCompareModalShell();
    }
  };

  const applyHomeMenuDetailContextFromPayload = (homePayload = {}) => {
    const featuredIds = Array.isArray(homePayload?.popular?.featuredIds)
      ? homePayload.popular.featuredIds
      : [];
    menuPageCopy = resolveMenuPageCopyFromHome(homePayload);
    menuDetailEditorialCopy = resolveDetailEditorialCopyFromHome(homePayload);
    detailInfoChipTooltipCopy = isObject(menuDetailEditorialCopy?.infoChips)
      ? menuDetailEditorialCopy.infoChips
      : DETAIL_INFO_CHIP_TOOLTIP_COPY;
    detailSensoryAxisTooltipCopy = isObject(menuDetailEditorialCopy?.sensoryAxisTooltips)
      ? menuDetailEditorialCopy.sensoryAxisTooltips
      : DETAIL_SENSORY_AXIS_TOOLTIP_COPY;
    const normalizedHelperWords = normalizeStringList(
      menuPageCopy?.search?.helperWords,
      SEARCH_HELPER_WORDS_DEFAULT
    );
    searchHelperWords = normalizedHelperWords.length
      ? normalizedHelperWords
      : SEARCH_HELPER_WORDS_DEFAULT.slice();
    searchHelperWordIndex = 0;
    searchHelperHasStarted = false;
    searchHelperAnimating = false;
    if (typeof clearSearchHelperTimers === 'function') {
      clearSearchHelperTimers();
    }
    applyMenuPageCopyToDom();
    applyDetailEditorialCopyToDom();
    if (typeof renderSearchHelperWord === 'function') {
      renderSearchHelperWord(searchHelperWords[0]);
    }
    if (typeof syncSearchHelperWidth === 'function') {
      syncSearchHelperWidth();
    }
    if (typeof syncSearchControls === 'function') {
      syncSearchControls();
    }
    const sensorySubtitle = normalizeText(menuDetailEditorialCopy?.sensory?.subtitle);

    return {
      featuredIds: new Set(
        featuredIds.map((featuredId) => normalizeText(featuredId)).filter(Boolean)
      ),
      sensorySubtitle,
      menuPage: menuPageCopy,
      menuDetailEditorial: menuDetailEditorialCopy,
    };
  };

  const applyHomeMenuDetailContextDefaults = () =>
    applyHomeMenuDetailContextFromPayload({
      menu_page: MENU_PAGE_COPY_DEFAULTS,
      menu_detail_editorial: MENU_DETAIL_EDITORIAL_COPY_DEFAULTS,
      popular: { featuredIds: [] },
    });

  const loadHomeMenuDetailContext = () => {
    if (homeMenuDetailContextPromise) {
      return homeMenuDetailContextPromise;
    }

    homeMenuDetailContextPromise = fetch(
      publicPaths?.toAbsoluteUrl ? publicPaths.toAbsoluteUrl('data/home.json') : 'data/home.json',
      { cache: 'no-cache' }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`No se pudo cargar data/home.json (${response.status})`);
        }
        return response.json();
      })
      .then((homePayload) => applyHomeMenuDetailContextFromPayload(homePayload))
      .catch((error) => {
        console.warn(
          '[menu-page] No se pudo resolver el contexto global de detalle desde data/home.json.',
          error
        );
        return applyHomeMenuDetailContextDefaults();
      });

    return homeMenuDetailContextPromise;
  };

  const disableNativeScrollRestoration = () => {
    if (!('scrollRestoration' in window.history)) {
      return;
    }

    try {
      window.history.scrollRestoration = 'manual';
    } catch {
      // Ignore browsers that block setting history.scrollRestoration.
    }
  };

  disableNativeScrollRestoration();

  const loadOrganolepticIconPaths = () => {
    if (organolepticIconsPromise) {
      return organolepticIconsPromise;
    }

    if (!ingredientsApi?.loadIngredientsStore) {
      organolepticIconsResolved = true;
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
        organolepticIconsResolved = true;

        return organolepticIconPathsByProfileId;
      })
      .catch((error) => {
        console.warn('[menu-page] No se pudieron cargar los iconos organolépticos.', error);
        organolepticIconPathsByProfileId = new Map();
        organolepticIconsResolved = true;
        return organolepticIconPathsByProfileId;
      });

    return organolepticIconsPromise;
  };

  const ensureOrganolepticIconsForFilterModal = () => {
    const shouldRefreshModal = !organolepticIconsResolved;

    return loadOrganolepticIconPaths().then((iconPathsByProfileId) => {
      if (shouldRefreshModal && state.filterModalOpen) {
        renderFilterModalShell();
      }

      return iconPathsByProfileId;
    });
  };

  const getRouteItemIdFromPathname = (pathname = window.location.pathname) => {
    const normalizedPath = normalizeText(
      publicPaths?.stripSitePath ? publicPaths.stripSitePath(pathname) : pathname
    );

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

  const normalizeMenuRouteTransitionDirection = (value) => {
    const normalized = normalizeText(value).toLowerCase();

    if (normalized === MENU_ROUTE_VIEW_TRANSITION_FORWARD) {
      return MENU_ROUTE_VIEW_TRANSITION_FORWARD;
    }

    if (normalized === MENU_ROUTE_VIEW_TRANSITION_BACK) {
      return MENU_ROUTE_VIEW_TRANSITION_BACK;
    }

    return 'none';
  };

  const clearMenuRouteViewTransitionRuntime = () => {
    document.documentElement.removeAttribute(MENU_ROUTE_VIEW_TRANSITION_ROOT_ATTR);
    document.documentElement.removeAttribute(MENU_ROUTE_VIEW_TRANSITION_DIRECTION_ATTR);
  };

  const getMenuDetailOverlay = () =>
    document.querySelector('[data-nosotros-route-loader]');

  const loadMenuDetailOverlayRuntime = () => {
    if (menuDetailOverlayRuntimePromise) {
      return menuDetailOverlayRuntimePromise;
    }

    const runtimeUrl = publicPaths?.toAbsoluteUrl
      ? publicPaths.toAbsoluteUrl(MENU_DETAIL_OVERLAY_RUNTIME_PATH)
      : new URL(MENU_DETAIL_OVERLAY_RUNTIME_PATH, window.location.href).toString();

    menuDetailOverlayRuntimePromise = import(runtimeUrl).catch((error) => {
      menuDetailOverlayRuntimePromise = null;
      throw error;
    });

    return menuDetailOverlayRuntimePromise;
  };

  const clearMenuDetailOverlayPlayer = (slot) => {
    if (!(slot instanceof HTMLElement)) {
      return;
    }

    const activeAnimation = slot.__figataNosotrosLottieInstance;
    slot.__figataNosotrosLottieInstance = null;

    if (activeAnimation && typeof activeAnimation.destroy === 'function') {
      try {
        activeAnimation.destroy();
      } catch (_error) {
        // ignore stale overlay animation cleanup failures
      }
    }

    slot.replaceChildren();
  };

  const showMenuDetailOverlayFallback = (slot) => {
    if (!(slot instanceof HTMLElement)) {
      return false;
    }

    if (
      slot.querySelector(
        '.nosotros-route-loader__player, .nosotros-route-loader__fallback, .nosotros-route-loader__poster'
      )
    ) {
      return true;
    }

    const fallback = document.createElement('span');
    fallback.className = 'nosotros-route-loader__fallback';
    fallback.textContent = MENU_DETAIL_OVERLAY_FALLBACK_TEXT;
    slot.replaceChildren(fallback);
    return true;
  };

  const mountMenuDetailOverlayPlayer = async (slot) => {
    if (!(slot instanceof HTMLElement)) {
      return false;
    }

    if (reducedMotionQuery.matches) {
      showMenuDetailOverlayFallback(slot);
      return true;
    }

    try {
      const runtime = await loadMenuDetailOverlayRuntime();
      await runtime.mountNosotrosLottie(slot, {
        autoplay: true,
        initialElapsedMs: 0,
        loop: true,
        speed: 1.5,
      });
      return true;
    } catch (_error) {
      showMenuDetailOverlayFallback(slot);
      return false;
    }
  };

  const waitForMenuDetailOverlayDelay = (ms) =>
    new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });

  const waitForMenuDetailOverlayFrames = (count = 2) =>
    new Promise((resolve) => {
      const step = (remaining) => {
        if (remaining <= 0) {
          resolve();
          return;
        }

        window.requestAnimationFrame(() => step(remaining - 1));
      };

      step(count);
    });

  const runMenuRouteViewTransition = async (
    updateFn,
    { direction = 'none', animate = true } = {}
  ) => {
    if (typeof updateFn !== 'function') {
      return;
    }

    const normalizedDirection = normalizeMenuRouteTransitionDirection(direction);
    const canAnimate = animate && normalizedDirection !== 'none';

    if (!canAnimate) {
      await updateFn();
      return;
    }

    const runTransition = async () => {
      const loader = getMenuDetailOverlay();
      const logoSlot =
        loader instanceof HTMLElement
          ? loader.querySelector('[data-nosotros-loader-logo-slot]')
          : null;

      if (!(loader instanceof HTMLElement) || !(logoSlot instanceof HTMLElement)) {
        await updateFn();
        return;
      }

      clearMenuRouteViewTransitionRuntime();
      loader.classList.remove('is-exiting');
      loader.classList.add('is-active');
      loader.setAttribute('aria-hidden', 'false');

      const minDuration = reducedMotionQuery.matches
        ? MENU_DETAIL_OVERLAY_REDUCED_MIN_DURATION_MS
        : MENU_DETAIL_OVERLAY_MIN_DURATION_MS;
      const updateTask = Promise.resolve().then(() => updateFn());
      const overlayTask = mountMenuDetailOverlayPlayer(logoSlot);

      await Promise.allSettled([
        updateTask,
        overlayTask,
        waitForMenuDetailOverlayDelay(minDuration),
      ]);
      await waitForMenuDetailOverlayFrames(2);

      loader.classList.add('is-exiting');
      loader.classList.remove('is-active');
      loader.setAttribute('aria-hidden', 'true');

      await waitForMenuDetailOverlayDelay(MENU_DETAIL_OVERLAY_EXIT_DURATION_MS + 40);
      clearMenuDetailOverlayPlayer(logoSlot);
      loader.classList.remove('is-exiting');

      try {
        await updateTask;
      } finally {
        clearMenuRouteViewTransitionRuntime();
      }
    };

    menuRouteViewTransitionTask = menuRouteViewTransitionTask
      .catch(() => {})
      .then(() => runTransition());

    await menuRouteViewTransitionTask;
  };

  const inferMenuRouteTransitionDirection = () => {
    const nextItemId = normalizeText(getRouteItemId());
    const isLeavingList = !lastRenderedRouteItemId && nextItemId;
    const isReturningToList = lastRenderedRouteItemId && !nextItemId;

    if (isLeavingList) {
      return MENU_ROUTE_VIEW_TRANSITION_FORWARD;
    }

    if (isReturningToList) {
      return MENU_ROUTE_VIEW_TRANSITION_BACK;
    }

    return 'none';
  };

  lastRenderedRouteItemId = normalizeText(getRouteItemId());

  const toHistoryStateObject = (value) =>
    value && typeof value === 'object' ? { ...value } : {};

  const getHistoryMenuListContext = () => {
    const currentState = toHistoryStateObject(window.history.state);
    const rawContext =
      currentState.menuListContext && typeof currentState.menuListContext === 'object'
        ? currentState.menuListContext
        : null;

    if (!rawContext) {
      return null;
    }

    const scrollY = Number(rawContext.scrollY);

    return {
      categoryId: normalizeText(rawContext.categoryId),
      scrollY: Number.isFinite(scrollY) ? Math.max(0, Math.round(scrollY)) : null,
    };
  };

  const restoreListScrollFromHistory = () => {
    const context = getHistoryMenuListContext();

    if (!context || context.scrollY === null) {
      return;
    }

    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: context.scrollY,
        left: 0,
        behavior: 'auto',
      });
    });
  };

  const resetDetailScrollPosition = () => {
    if (window.scrollY <= 0) {
      return;
    }

    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto',
      });
    });
  };

  const resolveGroupIdBySourceCategoryId = (sourceCategoryId) => {
    const normalizedSourceCategoryId = normalizeText(sourceCategoryId);

    if (!normalizedSourceCategoryId) {
      return '';
    }

    const matchedCategory = state.categories.find((category) =>
      Array.isArray(category?.sourceCategoryIds) &&
      category.sourceCategoryIds.some(
        (candidateSourceCategoryId) =>
          normalizeText(candidateSourceCategoryId) === normalizedSourceCategoryId
      )
    );

    return normalizeText(matchedCategory?.id);
  };

  const resolveGroupIdByItem = (item) =>
    resolveGroupIdBySourceCategoryId(item?.category);

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

  const emitCatalogLqipReady = ({ reason = 'catalog-ready' } = {}) => {
    if (catalogLqipReadyEmitted) {
      return;
    }

    catalogLqipReadyEmitted = true;
    window.dispatchEvent(
      new CustomEvent(MENU_CATALOG_LQIP_READY_EVENT, {
        detail: { reason: normalizeText(reason) || 'catalog-ready' },
      })
    );
  };

  const emitMenuDetailReady = ({ itemId = '', reason = 'detail-ready' } = {}) => {
    window.dispatchEvent(
      new CustomEvent(MENU_DETAIL_READY_EVENT, {
        detail: {
          itemId: normalizeText(itemId),
          reason: normalizeText(reason) || 'detail-ready',
        },
      })
    );
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
      item?.description,
      item?.descriptionLong,
      item?.descriptionShort,
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

  const isItemEligibleForSensoryComparison = (item) => {
    const sourceCategoryId = normalizeText(item?.category);
    if (!COMPARE_ELIGIBLE_SOURCE_CATEGORY_IDS.has(sourceCategoryId)) {
      return false;
    }

    if (!isObject(item?.sensory_profile)) {
      return false;
    }

    return Boolean(buildDetailSensoryProfileModel(item.sensory_profile));
  };

  const resolveDetailComparisonItem = (currentItemId = '') => {
    const normalizedCurrentItemId = normalizeText(currentItemId);
    const normalizedComparisonItemId = normalizeText(state.detailComparisonItemId);
    if (!normalizedComparisonItemId) {
      return null;
    }

    if (normalizedComparisonItemId === normalizedCurrentItemId) {
      state.detailComparisonItemId = '';
      return null;
    }

    const comparisonItem = state.itemsById.get(normalizedComparisonItemId);
    if (!comparisonItem || !isItemEligibleForSensoryComparison(comparisonItem)) {
      state.detailComparisonItemId = '';
      return null;
    }

    return comparisonItem;
  };

  const getSensoryComparisonCandidates = (currentItemId = '') => {
    const normalizedCurrentItemId = normalizeText(currentItemId);
    const uniqueCandidates = new Map();

    state.categories.forEach((category) => {
      const groupId = normalizeText(category?.id);
      if (!COMPARE_ELIGIBLE_GROUP_IDS.has(groupId)) {
        return;
      }

      const categoryItems = Array.isArray(category?.items) ? category.items : [];
      categoryItems.forEach((item) => {
        const itemId = normalizeText(item?.id);
        if (!itemId || itemId === normalizedCurrentItemId || uniqueCandidates.has(itemId)) {
          return;
        }

        if (!isItemEligibleForSensoryComparison(item)) {
          return;
        }

        const searchText = normalizeSearchValue(getSearchableText(item, category));
        uniqueCandidates.set(itemId, {
          id: itemId,
          title: normalizeText(item?.name || item?.id),
          categoryLabel: normalizeText(category?.label || ''),
          summary: normalizeText(item?.sensory_profile?.summary),
          searchText,
        });
      });
    });

    return Array.from(uniqueCandidates.values()).sort((left, right) =>
      left.title.localeCompare(right.title, 'es', { sensitivity: 'base' })
    );
  };

  const syncCompareSearchControls = () => {
    if (!(compareSearchRoot instanceof HTMLElement) || !(compareSearchInput instanceof HTMLInputElement)) {
      return;
    }

    const hasValue = Boolean(normalizeText(compareSearchInput.value));
    compareSearchRoot.dataset.helperVisible = hasValue ? 'false' : 'true';

    if (compareSearchClearButton instanceof HTMLButtonElement) {
      compareSearchClearButton.classList.toggle('is-visible', hasValue);
      compareSearchClearButton.setAttribute('aria-hidden', hasValue ? 'false' : 'true');
      compareSearchClearButton.tabIndex = hasValue ? 0 : -1;
    }
  };

  const createCompareResultItemNode = (candidate, { isSelected = false } = {}) => {
    const compareCopy = menuDetailEditorialCopy?.compareModal || MENU_DETAIL_EDITORIAL_COPY_DEFAULTS.compareModal;
    const item = document.createElement('li');
    item.className = 'menu-compare-modal__item-row';

    const button = document.createElement('button');
    button.className = 'menu-compare-modal__item';
    button.type = 'button';
    button.dataset.compareItemId = normalizeText(candidate?.id);
    button.setAttribute(
      'aria-label',
      `Comparar con ${normalizeText(candidate?.title)}`
    );
    button.dataset.selected = isSelected ? 'true' : 'false';

    const title = document.createElement('p');
    title.className = 'menu-compare-modal__item-title';
    title.textContent = normalizeText(candidate?.title);

    const meta = document.createElement('p');
    meta.className = 'menu-compare-modal__item-meta';
    meta.textContent = normalizeText(candidate?.categoryLabel);

    const summary = document.createElement('p');
    summary.className = 'menu-compare-modal__item-summary';
    summary.textContent =
      normalizeText(candidate?.summary) ||
      normalizeText(compareCopy?.candidateSummaryFallback) ||
      MENU_DETAIL_EDITORIAL_COPY_DEFAULTS.compareModal.candidateSummaryFallback;

    button.append(title, meta, summary);
    item.appendChild(button);
    return item;
  };

  const renderCompareModalShell = () => {
    if (!(compareResultsRoot instanceof HTMLElement)) {
      return;
    }

    const currentItemId = normalizeText(state.detailItemId || getRouteItemId());
    const currentItem = state.itemsById.get(currentItemId);
    const currentTitle = normalizeText(currentItem?.name || detailTitle?.textContent || '');
    const query = normalizeText(state.compareSearchQuery);
    const normalizedQuery = normalizeSearchValue(query);
    const selectedComparisonItemId = normalizeText(state.detailComparisonItemId);
    const compareCopy = menuDetailEditorialCopy?.compareModal || MENU_DETAIL_EDITORIAL_COPY_DEFAULTS.compareModal;
    const allCandidates = getSensoryComparisonCandidates(currentItemId);
    const visibleCandidates = normalizedQuery
      ? allCandidates.filter((candidate) => candidate.searchText.includes(normalizedQuery))
      : allCandidates;

    compareResultsRoot.replaceChildren();

    if (!visibleCandidates.length) {
      const emptyNode = document.createElement('p');
      emptyNode.className = 'menu-compare-modal__empty';
      const emptyTitle = normalizeText(compareCopy?.emptyStateTitle);
      const emptyDescription = normalizedQuery
        ? formatTemplate(
            compareCopy?.emptyStateDescriptionWithQuery,
            { query }
          )
        : normalizeText(compareCopy?.emptyStateDescription);
      emptyNode.textContent = [emptyTitle, emptyDescription].filter(Boolean).join('. ');
      compareResultsRoot.appendChild(emptyNode);
      return;
    }

    const introNode = document.createElement('p');
    introNode.className = 'menu-compare-modal__list-intro';
    introNode.textContent = currentTitle
      ? `${normalizeText(compareCopy?.currentItemPrefix) || MENU_DETAIL_EDITORIAL_COPY_DEFAULTS.compareModal.currentItemPrefix} ${currentTitle}`
      : normalizeText(compareCopy?.currentItemFallback) ||
        MENU_DETAIL_EDITORIAL_COPY_DEFAULTS.compareModal.currentItemFallback;

    const list = document.createElement('ul');
    list.className = 'menu-compare-modal__list';
    list.setAttribute('role', 'list');
    visibleCandidates.forEach((candidate) => {
      list.appendChild(
        createCompareResultItemNode(candidate, {
          isSelected: candidate.id === selectedComparisonItemId,
        })
      );
    });

    compareResultsRoot.append(introNode, list);
  };

  const renderDetailSensoryState = ({
    itemId = '',
    currentLabel = '',
    sensoryProfile = null,
    compareMode = DETAIL_EDITORIAL_COMPARE_MODE.AUTO,
    forceHidden = false,
  } = {}) => {
    const normalizedItemId = normalizeText(itemId);
    state.detailItemId = normalizedItemId;

    if (forceHidden) {
      clearDetailSensoryProfile();
      syncDetailSensoryCompareButton({
        hasSensoryProfile: false,
        hasComparison: false,
        compareEnabled: false,
      });
      if (detailSensoryDivider instanceof HTMLElement) {
        detailSensoryDivider.hidden = true;
      }
      return {
        hasSensoryProfile: false,
        hasComparison: false,
        compareEnabled: false,
      };
    }

    const comparisonItem = resolveDetailComparisonItem(normalizedItemId);
    const comparisonProfile = isObject(comparisonItem?.sensory_profile)
      ? comparisonItem.sensory_profile
      : null;
    const comparisonLabel = normalizeText(comparisonItem?.name || comparisonItem?.id);
    const hasSensoryProfile = renderDetailSensoryProfile(sensoryProfile, {
      currentLabel: normalizeText(currentLabel),
      comparisonProfile,
      comparisonLabel,
    });
    const hasComparison = hasSensoryProfile && Boolean(comparisonProfile);
    const normalizedCompareMode = normalizeDetailEditorialCompareMode(compareMode);
    const compareEnabled =
      normalizedCompareMode === DETAIL_EDITORIAL_COMPARE_MODE.ENABLED
        ? true
        : normalizedCompareMode === DETAIL_EDITORIAL_COMPARE_MODE.DISABLED
          ? false
          : hasSensoryProfile;

    syncDetailSensoryCompareButton({
      hasSensoryProfile,
      hasComparison,
      compareEnabled,
    });

    if (detailSensoryDivider instanceof HTMLElement) {
      detailSensoryDivider.hidden = !hasSensoryProfile;
    }

    return {
      hasSensoryProfile,
      hasComparison,
      compareEnabled,
    };
  };

  const refreshCurrentDetailSensoryComparison = () => {
    const currentItemId = normalizeText(state.detailItemId || getRouteItemId());
    if (!currentItemId) {
      return false;
    }

    const currentItem = state.itemsById.get(currentItemId);
    if (!currentItem) {
      return false;
    }

    const sensoryProfile = isObject(currentItem?.sensory_profile)
      ? currentItem.sensory_profile
      : null;

    renderDetailSensoryState({
      itemId: currentItemId,
      currentLabel: normalizeText(currentItem?.name || currentItem?.id),
      sensoryProfile,
      compareMode: resolveDetailEditorialModel(currentItem).compareMode,
    });

    return true;
  };

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

  const resolveDietaryHeroKind = (item, badges = []) => {
    const dietary = item?.dietary && typeof item.dietary === 'object' ? item.dietary : {};

    if (dietary.vegan === true) {
      return DETAIL_HERO_BADGE_KIND.VEGAN;
    }

    if (dietary.vegetarian === true) {
      return DETAIL_HERO_BADGE_KIND.VEGETARIAN;
    }

    if (!Array.isArray(badges) || !badges.length) {
      return null;
    }

    const dietaryBadge = badges.find((badge) => normalizeText(badge?.group) === 'dietary');
    const dietaryKey = normalizeText(dietaryBadge?.key).toLowerCase();
    const dietaryLabel = normalizeText(dietaryBadge?.label).toLowerCase();

    if (dietaryKey === DETAIL_HERO_BADGE_KIND.VEGAN || dietaryLabel === 'vegana') {
      return DETAIL_HERO_BADGE_KIND.VEGAN;
    }

    if (
      dietaryKey === DETAIL_HERO_BADGE_KIND.VEGETARIAN ||
      dietaryLabel === 'vegetariana'
    ) {
      return DETAIL_HERO_BADGE_KIND.VEGETARIAN;
    }

    return null;
  };

  const normalizeDetailEditorialCompareMode = (value) => {
    const normalized = normalizeText(value).toLowerCase();
    if (
      normalized === DETAIL_EDITORIAL_COMPARE_MODE.ENABLED ||
      normalized === DETAIL_EDITORIAL_COMPARE_MODE.DISABLED
    ) {
      return normalized;
    }
    return DETAIL_EDITORIAL_COMPARE_MODE.AUTO;
  };

  const normalizeDetailEditorialSectionVisibility = (input) => {
    if (!isObject(input)) {
      return {};
    }

    const nextVisibility = {};
    DETAIL_SECTION_VISIBILITY_KEYS.forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(input, key)) {
        return;
      }
      if (input[key] === false) {
        nextVisibility[key] = false;
      } else if (input[key] === true) {
        nextVisibility[key] = true;
      }
    });
    return nextVisibility;
  };

  const isDetailSectionVisible = (sectionVisibility = {}, key = '') => {
    const normalizedKey = normalizeText(key).toLowerCase();
    if (!normalizedKey) {
      return true;
    }
    if (!isObject(sectionVisibility)) {
      return true;
    }
    if (!Object.prototype.hasOwnProperty.call(sectionVisibility, normalizedKey)) {
      return true;
    }
    return sectionVisibility[normalizedKey] !== false;
  };

  const normalizeDetailEditorialHeroBadge = (value) => {
    const normalized = normalizeText(value).toLowerCase();
    if (
      normalized === DETAIL_HERO_BADGE_KIND.VEGAN ||
      normalized === DETAIL_HERO_BADGE_KIND.VEGETARIAN ||
      normalized === DETAIL_HERO_BADGE_KIND.FEATURED ||
      normalized === DETAIL_EDITORIAL_HERO_BADGE_NONE
    ) {
      return normalized;
    }
    return '';
  };

  const normalizeDetailEditorialPairingEntry = (input) => {
    if (!isObject(input)) {
      return null;
    }

    const cta = isObject(input.cta) ? input.cta : {};
    const name = normalizeText(input.name || input.title);
    const subtitle = normalizeText(input.subtitle || input.intro);
    const meta = normalizeText(input.meta || input.region || input.style);
    const description = normalizeText(input.description || input.summary || input.copy);
    const ctaLabel = normalizeText(
      input.cta_label ||
      input.ctaLabel ||
      input.button_label ||
      input.buttonLabel ||
      cta.label
    );
    const ctaTarget = normalizeText(
      input.cta_target ||
      input.ctaTarget ||
      input.button_target ||
      input.buttonTarget ||
      cta.target
    );
    const hasContent = Boolean(name || meta || description || ctaLabel || ctaTarget);
    const hasExplicitEnabled = typeof input.enabled === 'boolean';
    const enabled = hasExplicitEnabled ? input.enabled : hasContent;

    if (!hasContent && !hasExplicitEnabled) {
      return null;
    }

    return {
      enabled,
      subtitle,
      name,
      meta,
      description,
      ctaLabel,
      ctaTarget,
    };
  };

  const normalizeDetailEditorialStory = (input) => {
    if (!isObject(input)) {
      return null;
    }

    const title = normalizeText(input.title || input.heading);
    const body = String(input.body || input.content || input.copy || input.text || '')
      .replace(/\r\n?/g, '\n')
      .trim();

    if (!title && !body) {
      return null;
    }

    return {
      title,
      body,
    };
  };

  const buildDetailStoryId = (itemId, story) =>
    toAnalyticsEntityId(
      story?.storyId || story?.id || story?.slug || story?.title,
      `story_${normalizeText(itemId) || 'detail'}`
    );

  const buildDetailPairingId = (itemId, pairing, index) =>
    toAnalyticsEntityId(
      pairing?.pairingId ||
        pairing?.id ||
        pairing?.slug ||
        pairing?.ctaTarget ||
        pairing?.name ||
        pairing?.meta,
      `pairing_${normalizeText(itemId) || 'detail'}_${index + 1}`
    );

  const buildDetailMediaId = (itemId, slide, index) => {
    const primaryVideoSource =
      Array.isArray(slide?.sources) && slide.sources[0]?.src
        ? slide.sources[0].src
        : '';
    return toAnalyticsEntityId(
      slide?.mediaId ||
        slide?.id ||
        slide?.slug ||
        slide?.src ||
        primaryVideoSource ||
        slide?.poster,
      `media_${normalizeText(itemId) || 'detail'}_${normalizeText(slide?.type) || 'slide'}_${index + 1}`
    );
  };

  const resolveDetailEditorialModel = (item) => {
    const detailEditorial = isObject(item?.detail_editorial) ? item.detail_editorial : {};

    const pairingEntries = [];
    if (Array.isArray(detailEditorial.pairings)) {
      detailEditorial.pairings.forEach((entry) => {
        const normalizedEntry = normalizeDetailEditorialPairingEntry(entry);
        if (isObject(normalizedEntry) && normalizedEntry.enabled !== false) {
          pairingEntries.push({
            ...normalizedEntry,
            pairingId: buildDetailPairingId(item?.id, normalizedEntry, pairingEntries.length),
          });
        }
      });
    } else if (isObject(detailEditorial.pairings)) {
      const normalizedPairingsObject = normalizeDetailEditorialPairingEntry(
        detailEditorial.pairings
      );
      if (isObject(normalizedPairingsObject) && normalizedPairingsObject.enabled !== false) {
        pairingEntries.push({
          ...normalizedPairingsObject,
          pairingId: buildDetailPairingId(item?.id, normalizedPairingsObject, pairingEntries.length),
        });
      }
    } else if (isObject(detailEditorial.pairing)) {
      const normalizedLegacyPairing = normalizeDetailEditorialPairingEntry(
        detailEditorial.pairing
      );
      if (isObject(normalizedLegacyPairing) && normalizedLegacyPairing.enabled !== false) {
        pairingEntries.push({
          ...normalizedLegacyPairing,
          pairingId: buildDetailPairingId(item?.id, normalizedLegacyPairing, pairingEntries.length),
        });
      }
    }

    const normalizedStory = normalizeDetailEditorialStory(
      detailEditorial.story || detailEditorial.history
    );

    return {
      compareMode: normalizeDetailEditorialCompareMode(detailEditorial.compare_mode),
      heroBadge: normalizeDetailEditorialHeroBadge(detailEditorial.hero_badge),
      sectionVisibility: normalizeDetailEditorialSectionVisibility(
        detailEditorial.section_visibility
      ),
      sensoryIntro: normalizeText(detailEditorial.sensory_intro || detailEditorial.sensory_subtitle),
      pairings: pairingEntries,
      story: normalizedStory
        ? {
            ...normalizedStory,
            storyId: buildDetailStoryId(item?.id, normalizedStory),
          }
        : null,
    };
  };

  const resolveDetailHeroBadge = ({ item, badges = [], featuredIds = new Set() } = {}) => {
    const detailEditorial = resolveDetailEditorialModel(item);
    const forcedHeroBadge = detailEditorial.heroBadge;

    if (forcedHeroBadge === DETAIL_EDITORIAL_HERO_BADGE_NONE) {
      return null;
    }

    if (
      forcedHeroBadge === DETAIL_HERO_BADGE_KIND.VEGAN ||
      forcedHeroBadge === DETAIL_HERO_BADGE_KIND.VEGETARIAN ||
      forcedHeroBadge === DETAIL_HERO_BADGE_KIND.FEATURED
    ) {
      return {
        kind: forcedHeroBadge,
        label: DETAIL_HERO_BADGE_COPY[forcedHeroBadge] || '',
        icon: DETAIL_HERO_BADGE_ICON_BY_KIND[forcedHeroBadge] || '',
      };
    }

    const dietaryKind = resolveDietaryHeroKind(item, badges);

    if (dietaryKind) {
      return {
        kind: dietaryKind,
        label: DETAIL_HERO_BADGE_COPY[dietaryKind] || '',
        icon: DETAIL_HERO_BADGE_ICON_BY_KIND[dietaryKind] || '',
      };
    }

    const itemId = normalizeText(item?.id);

    if (itemId && featuredIds instanceof Set && featuredIds.has(itemId)) {
      return {
        kind: DETAIL_HERO_BADGE_KIND.FEATURED,
        label: DETAIL_HERO_BADGE_COPY[DETAIL_HERO_BADGE_KIND.FEATURED],
        icon: '',
      };
    }

    return null;
  };

  const filterDetailSectionTags = (badges = []) =>
    Array.isArray(badges)
      ? badges.filter((badge) => {
          const group = normalizeText(badge?.group).toLowerCase();
          const key = normalizeText(badge?.key).toLowerCase();
          const label = normalizeText(badge?.label).toLowerCase();

          if (group !== 'dietary') {
            return true;
          }

          return !(
            key === DETAIL_HERO_BADGE_KIND.VEGAN ||
            key === DETAIL_HERO_BADGE_KIND.VEGETARIAN ||
            label === 'vegana' ||
            label === 'vegetariana'
          );
        })
      : [];

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

  const createSvgNode = (tagName, attributes = {}) => {
    const node = document.createElementNS(DETAIL_SENSORY_RADAR_SVG_NS, tagName);

    Object.entries(attributes).forEach(([attributeName, attributeValue]) => {
      if (attributeValue === undefined || attributeValue === null || attributeValue === '') {
        return;
      }

      node.setAttribute(attributeName, String(attributeValue));
    });

    return node;
  };

  const toDetailSensoryRadarPoint = ({ centerX, centerY, radius, angle }) => ({
    x: centerX + Math.cos(angle) * radius,
    y: centerY + Math.sin(angle) * radius,
  });

  const toDetailSensoryRadarPointsString = (points) =>
    points.map(({ x, y }) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');

  const toDetailSensoryRadarPath = (points) => {
    if (!Array.isArray(points) || points.length < 2) {
      return '';
    }

    if (points.length === 2) {
      return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)} L ${points[1].x.toFixed(2)} ${points[1].y.toFixed(2)} Z`;
    }

    const smoothing = 0.14;
    let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

    for (let index = 0; index < points.length; index += 1) {
      const previous = points[(index - 1 + points.length) % points.length];
      const current = points[index];
      const next = points[(index + 1) % points.length];
      const nextNext = points[(index + 2) % points.length];
      const controlPointA = {
        x: current.x + (next.x - previous.x) * smoothing,
        y: current.y + (next.y - previous.y) * smoothing,
      };
      const controlPointB = {
        x: next.x - (nextNext.x - current.x) * smoothing,
        y: next.y - (nextNext.y - current.y) * smoothing,
      };

      path += ` C ${controlPointA.x.toFixed(2)} ${controlPointA.y.toFixed(2)}, ${controlPointB.x.toFixed(2)} ${controlPointB.y.toFixed(2)}, ${next.x.toFixed(2)} ${next.y.toFixed(2)}`;
    }

    return `${path} Z`;
  };

  const getDetailSensoryRadarLevels = (scaleMax) => {
    const ringCount = Math.min(5, Math.max(1, scaleMax));
    const levels = new Set();

    for (let index = 1; index <= ringCount; index += 1) {
      levels.add(Math.max(1, Math.round((scaleMax * index) / ringCount)));
    }

    return Array.from(levels).sort((left, right) => left - right);
  };

  const buildDetailSensoryProfileModel = (profile) => {
    if (!isObject(profile) || !isObject(profile.axes)) {
      return null;
    }

    const summary = normalizeText(profile.summary);
    const schema = getDetailSensoryProfileSchema();
    const groups = Array.isArray(schema?.groups) ? schema.groups : [];
    const axes = Array.isArray(schema?.axes) ? schema.axes : [];
    const scaleMax = getDetailSensoryScaleMax();

    if (!summary || !groups.length || !axes.length) {
      return null;
    }

    const axisDefinitionById = new Map(
      axes.map((axis) => [normalizeText(axis?.id), axis])
    );
    const groupedAxes = [];
    const flatAxes = [];

    for (const group of groups) {
      const groupAxisIds = Array.isArray(group?.axisIds) ? group.axisIds : [];
      const groupEntries = [];

      for (const axisId of groupAxisIds) {
        const normalizedAxisId = normalizeText(axisId);
        const axisDefinition = axisDefinitionById.get(normalizedAxisId);
        const axisValue = normalizeSensoryAxisValue(
          profile.axes?.[normalizedAxisId]?.value,
          scaleMax
        );

        if (!axisDefinition || axisValue === null) {
          return null;
        }

        const axisEntry = {
          id: normalizedAxisId,
          label: normalizeText(axisDefinition?.label || normalizedAxisId),
          value: axisValue,
          groupId: normalizeText(group?.id),
          groupLabel: normalizeText(group?.label || group?.id),
        };

        groupEntries.push(axisEntry);
        flatAxes.push(axisEntry);
      }

      if (groupEntries.length) {
        groupedAxes.push({
          id: normalizeText(group?.id),
          label: normalizeText(group?.label || group?.id),
          axes: groupEntries,
        });
      }
    }

    if (!groupedAxes.length || !flatAxes.length) {
      return null;
    }

    return {
      summary,
      scaleMax,
      groups: groupedAxes,
      axes: flatAxes,
    };
  };

  const clearDetailSensoryProfile = () => {
    clearDetailSensorySectionHeightAnimation();
    clearDetailSensoryRadarTooltipController();
    clearDetailSensoryBarsTooltipController();
    clearDetailSensoryRadarAnimationController();
    clearDetailSensoryBarsAnimationController();
    detailSensoryViewTransitionToken += 1;

    if (detailSensoryViewTabsRoot instanceof HTMLElement) {
      detailSensoryViewTabsRoot.hidden = true;
      delete detailSensoryViewTabsRoot.dataset.activeSensoryView;
    }

    if (detailSensoryBarsPanel instanceof HTMLElement) {
      detailSensoryBarsPanel.hidden = true;
    }

    if (detailSensoryRadarPanel instanceof HTMLElement) {
      detailSensoryRadarPanel.hidden = true;
    }

    if (detailSensoryGroups instanceof HTMLElement) {
      detailSensoryGroups.replaceChildren();
    }

    if (detailSensoryRadar instanceof HTMLElement) {
      detailSensoryRadar.replaceChildren();
      detailSensoryRadar.removeAttribute('role');
      detailSensoryRadar.removeAttribute('aria-label');
    }

    if (detailSensorySummary instanceof HTMLElement) {
      detailSensorySummary.textContent = '';
      detailSensorySummary.hidden = true;
    }

    setDetailSensoryComparisonMeta({ active: false });

    if (detailSensorySection instanceof HTMLElement) {
      delete detailSensorySection.dataset.comparisonActive;
      detailSensorySection.hidden = true;
    }
  };

  const renderDetailSensoryBars = (model) => {
    if (!(detailSensoryGroups instanceof HTMLElement)) {
      return false;
    }

    clearDetailSensoryBarsTooltipController();
    clearDetailSensoryBarsAnimationController();

    if (!Array.isArray(model.axes) || !model.axes.length) {
      return false;
    }

    const barsSummary = model.axes
      .map((axis) => `${axis.label} ${axis.value} de ${model.scaleMax}`)
      .join(', ');

    const barsChart = document.createElement('div');
    barsChart.className = 'menu-page-detail__sensory-bars-chart';
    barsChart.setAttribute('role', 'group');
    barsChart.setAttribute(
      'aria-label',
      `Perfil sensorial en barras. ${barsSummary}. Escala de 1 a ${model.scaleMax}.`
    );
    barsChart.style.setProperty(
      '--menu-detail-sensory-axes-count',
      String(model.axes.length)
    );

    const yAxis = document.createElement('div');
    yAxis.className = 'menu-page-detail__sensory-bars-y-axis';
    yAxis.setAttribute('aria-hidden', 'true');

    const barsMain = document.createElement('div');
    barsMain.className = 'menu-page-detail__sensory-bars-main';

    const barsPlot = document.createElement('div');
    barsPlot.className = 'menu-page-detail__sensory-bars-plot';

    const barsGrid = document.createElement('div');
    barsGrid.className = 'menu-page-detail__sensory-bars-grid';
    barsGrid.setAttribute('aria-hidden', 'true');

    const barsColumns = document.createElement('div');
    barsColumns.className = 'menu-page-detail__sensory-bars-columns';
    barsColumns.setAttribute('role', 'list');

    const barsIcons = document.createElement('div');
    barsIcons.className = 'menu-page-detail__sensory-bars-icons';
    const barFillNodes = [];
    const barIconNodes = [];

    const tooltip = document.createElement('div');
    tooltip.className = 'menu-page-detail__sensory-radar-tooltip';
    tooltip.id = 'menu-detail-sensory-bars-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.setAttribute('aria-hidden', 'true');
    tooltip.hidden = true;

    const tooltipTitle = document.createElement('p');
    tooltipTitle.className = 'menu-page-detail__sensory-radar-tooltip-title';
    const tooltipDivider = document.createElement('div');
    tooltipDivider.className = 'menu-page-detail__sensory-radar-tooltip-divider';
    tooltipDivider.setAttribute('aria-hidden', 'true');
    const tooltipDescription = document.createElement('p');
    tooltipDescription.className = 'menu-page-detail__sensory-radar-tooltip-description';
    tooltip.append(tooltipTitle, tooltipDivider, tooltipDescription);

    let activeIcon = null;
    let tooltipTimerId = 0;
    let tooltipExitTimerId = 0;
    let tooltipShowFrameId = 0;
    let documentDismissHandlersBound = false;

    const clearTooltipTimer = () => {
      if (!tooltipTimerId) {
        return;
      }

      window.clearTimeout(tooltipTimerId);
      tooltipTimerId = 0;
    };

    const clearTooltipExitTimer = () => {
      if (!tooltipExitTimerId) {
        return;
      }

      window.clearTimeout(tooltipExitTimerId);
      tooltipExitTimerId = 0;
    };

    const clearTooltipShowFrame = () => {
      if (!tooltipShowFrameId) {
        return;
      }

      window.cancelAnimationFrame(tooltipShowFrameId);
      tooltipShowFrameId = 0;
    };

    const handleViewportChange = () => {
      if (!(activeIcon instanceof HTMLElement) || tooltip.hidden) {
        return;
      }

      const chartRect = barsChart.getBoundingClientRect();
      const iconRect = activeIcon.getBoundingClientRect();

      if (!chartRect.width || !chartRect.height || !iconRect.width || !iconRect.height) {
        return;
      }

      const viewportWidth = Math.max(
        320,
        window.innerWidth || document.documentElement.clientWidth || chartRect.width
      );
      const viewportHeight = Math.max(
        320,
        window.innerHeight || document.documentElement.clientHeight || chartRect.height
      );

      let minViewportLeft = 8;
      let maxViewportRight = Math.max(minViewportLeft, viewportWidth - 8);
      let minViewportTop = 8;
      let maxViewportBottom = Math.max(minViewportTop, viewportHeight - 8);

      if (detailSensorySection instanceof HTMLElement) {
        const sectionRect = detailSensorySection.getBoundingClientRect();
        if (sectionRect.width > 0 && sectionRect.height > 0) {
          const sectionStyles = window.getComputedStyle(detailSensorySection);
          const sectionPaddingLeft =
            Number.parseFloat(sectionStyles.paddingLeft) || 0;
          const sectionPaddingRight =
            Number.parseFloat(sectionStyles.paddingRight) || 0;
          const sectionPaddingTop =
            Number.parseFloat(sectionStyles.paddingTop) || 0;
          const sectionPaddingBottom =
            Number.parseFloat(sectionStyles.paddingBottom) || 0;
          minViewportLeft = Math.max(
            minViewportLeft,
            sectionRect.left + sectionPaddingLeft
          );
          maxViewportRight = Math.min(
            maxViewportRight,
            sectionRect.right - sectionPaddingRight
          );
          minViewportTop = Math.max(
            minViewportTop,
            sectionRect.top + sectionPaddingTop
          );
          maxViewportBottom = Math.min(
            maxViewportBottom,
            sectionRect.bottom - sectionPaddingBottom
          );
        }
      }

      const availableTooltipWidth = Math.max(
        136,
        maxViewportRight - minViewportLeft
      );
      const tooltipWidth = Math.max(136, Math.min(208, availableTooltipWidth));
      tooltip.style.width = `${tooltipWidth}px`;

      const tooltipHeight = tooltip.offsetHeight || 72;
      const iconCenterViewportX = iconRect.left + iconRect.width / 2;
      const desiredLeftViewport = iconCenterViewportX - tooltipWidth / 2;
      const maxViewportLeft = Math.max(
        minViewportLeft,
        maxViewportRight - tooltipWidth
      );
      const clampedLeftViewport = Math.min(
        maxViewportLeft,
        Math.max(minViewportLeft, desiredLeftViewport)
      );
      const desiredTopViewport = iconRect.top - tooltipHeight - 12;
      const maxViewportTop = Math.max(
        minViewportTop,
        maxViewportBottom - tooltipHeight
      );
      const topViewport = Math.min(
        maxViewportTop,
        Math.max(minViewportTop, desiredTopViewport)
      );
      const left = clampedLeftViewport - chartRect.left;
      const top = topViewport - chartRect.top;
      const arrowX = Math.max(
        14,
        Math.min(tooltipWidth - 14, iconCenterViewportX - clampedLeftViewport)
      );

      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
      tooltip.style.setProperty('--menu-detail-sensory-tooltip-arrow-x', `${arrowX}px`);
    };

    const detachDocumentDismissHandlers = () => {
      if (!documentDismissHandlersBound) {
        return;
      }

      documentDismissHandlersBound = false;
      document.removeEventListener('pointerdown', handleDocumentPointerDown, true);
      document.removeEventListener('focusin', handleDocumentFocusIn, true);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };

    const hideTooltip = ({ immediate = false } = {}) => {
      clearTooltipTimer();
      detachDocumentDismissHandlers();
      clearTooltipShowFrame();

      if (activeIcon instanceof HTMLElement) {
        activeIcon.classList.remove('is-tooltip-active');
        activeIcon.setAttribute('aria-expanded', 'false');
      }

      activeIcon = null;
      tooltip.classList.remove('is-visible');
      tooltip.setAttribute('aria-hidden', 'true');

      clearTooltipExitTimer();

      if (immediate) {
        tooltip.hidden = true;
        return;
      }

      tooltipExitTimerId = window.setTimeout(() => {
        tooltip.hidden = true;
        tooltipExitTimerId = 0;
      }, DETAIL_SENSORY_TOOLTIP_EXIT_MS);
    };

    const handleDocumentPointerDown = (event) => {
      const target = event.target;

      if (
        activeIcon instanceof Node &&
        target instanceof Node &&
        (target === activeIcon || activeIcon.contains(target))
      ) {
        return;
      }

      hideTooltip();
    };

    const handleDocumentFocusIn = (event) => {
      const target = event.target;

      if (
        activeIcon instanceof Node &&
        target instanceof Node &&
        (target === activeIcon || activeIcon.contains(target))
      ) {
        return;
      }

      hideTooltip();
    };

    const attachDocumentDismissHandlers = () => {
      if (documentDismissHandlersBound) {
        return;
      }

      documentDismissHandlersBound = true;
      document.addEventListener('pointerdown', handleDocumentPointerDown, true);
      document.addEventListener('focusin', handleDocumentFocusIn, true);
      window.addEventListener('resize', handleViewportChange);
      window.addEventListener('scroll', handleViewportChange, true);
    };

    const scheduleTooltipHide = () => {
      clearTooltipTimer();
      tooltipTimerId = window.setTimeout(() => {
        hideTooltip();
      }, DETAIL_SENSORY_TOOLTIP_AUTO_CLOSE_MS);
    };

    const showTooltip = (icon, copy) => {
      if (!(icon instanceof HTMLElement)) {
        return;
      }

      if (activeIcon instanceof HTMLElement && activeIcon !== icon) {
        activeIcon.classList.remove('is-tooltip-active');
        activeIcon.setAttribute('aria-expanded', 'false');
      }

      const resolvedTitle = normalizeText(copy?.title || icon.dataset.axisLabel || 'Atributo');
      const resolvedDescription = normalizeText(
        copy?.description ||
          `Cómo se percibe ${normalizeText(icon.dataset.axisLabel).toLowerCase()} en el plato.`
      );

      activeIcon = icon;
      tooltipTitle.textContent = resolvedTitle;
      tooltipDescription.textContent = resolvedDescription;
      clearTooltipExitTimer();
      clearTooltipShowFrame();
      tooltip.hidden = false;
      tooltip.setAttribute('aria-hidden', 'false');
      tooltip.classList.remove('is-visible');
      handleViewportChange();

      tooltipShowFrameId = window.requestAnimationFrame(() => {
        tooltipShowFrameId = window.requestAnimationFrame(() => {
          if (!tooltip.hidden) {
            tooltip.classList.add('is-visible');
          }
          tooltipShowFrameId = 0;
        });
      });

      icon.classList.add('is-tooltip-active');
      icon.setAttribute('aria-expanded', 'true');
      attachDocumentDismissHandlers();
      scheduleTooltipHide();
    };

    const tickValues = [];
    const tickStep = Math.max(1, Math.round(model.scaleMax / 5));
    for (let value = model.scaleMax; value >= 2; value -= tickStep) {
      tickValues.push(value);
    }
    if (!tickValues.length || tickValues[0] !== model.scaleMax) {
      tickValues.unshift(model.scaleMax);
    }

    tickValues.forEach((value) => {
      const yRatio = (model.scaleMax - value) / model.scaleMax;
      const yTick = document.createElement('span');
      yTick.className = 'menu-page-detail__sensory-bars-y-tick';
      yTick.textContent = String(value);
      yTick.style.setProperty('--menu-detail-sensory-y-ratio', String(yRatio));
      yAxis.appendChild(yTick);

      const gridLine = document.createElement('span');
      gridLine.className = 'menu-page-detail__sensory-bars-grid-line';
      gridLine.style.setProperty('--menu-detail-sensory-y-ratio', String(yRatio));
      barsGrid.appendChild(gridLine);
    });

    model.axes.forEach((axis) => {
      const valueRatio = Math.max(0, Math.min(1, axis.value / model.scaleMax));
      const barPresence = 0.2 + valueRatio * 0.8;
      const axisTooltipCopy = getSensoryAxisTooltipCopy(axis.id) || {
        title: axis.label,
        description: `Cómo se percibe ${axis.label.toLowerCase()} en el plato.`,
      };

      const column = document.createElement('div');
      column.className = 'menu-page-detail__sensory-bars-column';
      column.setAttribute('role', 'listitem');
      column.setAttribute(
        'aria-label',
        `${axis.label}: ${axis.value} de ${model.scaleMax}`
      );

      const barFill = document.createElement('div');
      barFill.className = 'menu-page-detail__sensory-bars-fill';
      barFill.style.height = `${Math.max(4, valueRatio * 100)}%`;
      barFill.style.opacity = barPresence.toFixed(3);
      barFill.dataset.finalOpacity = barPresence.toFixed(3);
      barFill.style.transformOrigin = '50% 100%';
      column.appendChild(barFill);
      barFillNodes.push(barFill);
      barsColumns.appendChild(column);

      const iconCell = document.createElement('div');
      iconCell.className = 'menu-page-detail__sensory-bars-icon-cell menu-page-detail__sensory-bars-icon-button';
      iconCell.dataset.axisId = axis.id;
      iconCell.dataset.axisLabel = axis.label;
      iconCell.setAttribute(
        'aria-label',
        `${axisTooltipCopy.title}. ${axisTooltipCopy.description}`
      );
      iconCell.setAttribute('tabindex', '0');
      iconCell.setAttribute('role', 'button');
      iconCell.setAttribute('aria-haspopup', 'true');
      iconCell.setAttribute('aria-expanded', 'false');
      iconCell.setAttribute('aria-describedby', tooltip.id);
      const iconPath = toAbsoluteAssetPath(
        DETAIL_SENSORY_RADAR_ICON_PATHS[axis.id] || ''
      );

      if (iconPath) {
        const icon = document.createElement('img');
        icon.className = 'menu-page-detail__sensory-bars-icon';
        icon.src = iconPath;
        icon.alt = '';
        icon.width = 22;
        icon.height = 22;
        icon.loading = 'lazy';
        icon.decoding = 'async';
        iconCell.appendChild(icon);
      } else {
        const fallback = document.createElement('span');
        fallback.className = 'menu-page-detail__sensory-bars-icon-fallback';
        fallback.textContent = normalizeText(axis.label).charAt(0) || '•';
        iconCell.appendChild(fallback);
      }

      iconCell.addEventListener('click', (event) => {
        event.preventDefault();

        if (activeIcon === iconCell && !tooltip.hidden) {
          hideTooltip();
          return;
        }

        showTooltip(iconCell, axisTooltipCopy);
      });
      iconCell.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          showTooltip(iconCell, axisTooltipCopy);
          return;
        }

        if (event.key === 'Escape') {
          event.preventDefault();
          hideTooltip();
          if (typeof iconCell.blur === 'function') {
            iconCell.blur();
          }
        }
      });
      iconCell.addEventListener('mouseleave', () => {
        if (activeIcon === iconCell) {
          hideTooltip();
        }
      });
      iconCell.addEventListener('blur', () => {
        window.setTimeout(() => {
          if (activeIcon === iconCell && document.activeElement !== iconCell) {
            hideTooltip();
          }
        }, 0);
      });

      barsIcons.appendChild(iconCell);
      barIconNodes.push(iconCell);
    });

    barsPlot.append(barsGrid, barsColumns);
    barsMain.append(barsPlot, barsIcons);
    barsChart.append(yAxis, barsMain, tooltip);

    let barsFillAnimations = [];
    let barsIconAnimations = [];

    const clearBarsRevealAnimations = () => {
      barsFillAnimations.forEach((animation) => animation?.cancel());
      barsIconAnimations.forEach((animation) => animation?.cancel());
      barsFillAnimations = [];
      barsIconAnimations = [];
    };

    const applyBarsFinalVisualState = () => {
      barFillNodes.forEach((barFill) => {
        barFill.style.removeProperty('transform');
        barFill.style.opacity = barFill.dataset.finalOpacity || '1';
        barFill.style.removeProperty('will-change');
      });

      barIconNodes.forEach((iconCell) => {
        iconCell.style.opacity = '1';
        iconCell.style.removeProperty('will-change');
      });
    };

    detailSensoryBarsAnimationController = {
      reveal: ({ immediate = false } = {}) => {
        clearBarsRevealAnimations();

        const prefersReducedMotion =
          typeof window.matchMedia === 'function' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (immediate || prefersReducedMotion) {
          applyBarsFinalVisualState();
          return;
        }

        barFillNodes.forEach((barFill) => {
          barFill.style.transform = 'scaleY(0)';
          barFill.style.opacity = '0';
        });

        barIconNodes.forEach((iconCell) => {
          iconCell.style.opacity = '0';
        });

        barFillNodes.forEach((barFill, axisIndex) => {
          const parsedOpacity = Number.parseFloat(barFill.dataset.finalOpacity || '1');
          const finalOpacity = Number.isFinite(parsedOpacity) ? parsedOpacity : 1;
          barFill.style.willChange = 'transform, opacity';

          const fillAnimation = barFill.animate(
            [
              { transform: 'scaleY(0)', opacity: 0 },
              { transform: 'scaleY(1)', opacity: finalOpacity },
            ],
            {
              duration: DETAIL_SENSORY_BARS_REVEAL_MS,
              delay: axisIndex * DETAIL_SENSORY_BARS_STAGGER_MS,
              easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
              fill: 'forwards',
            }
          );

          fillAnimation.onfinish = () => {
            barFill.style.removeProperty('will-change');
          };
          fillAnimation.oncancel = () => {
            barFill.style.removeProperty('will-change');
          };

          barsFillAnimations.push(fillAnimation);
        });

        barIconNodes.forEach((iconCell, axisIndex) => {
          iconCell.style.willChange = 'opacity';

          const iconAnimation = iconCell.animate(
            [{ opacity: 0 }, { opacity: 1 }],
            {
              duration: 460,
              delay:
                240 +
                axisIndex * Math.max(30, Math.round(DETAIL_SENSORY_BARS_STAGGER_MS * 0.8)),
              easing: DETAIL_SENSORY_VIEW_EASE,
              fill: 'forwards',
            }
          );

          iconAnimation.onfinish = () => {
            iconCell.style.removeProperty('will-change');
          };
          iconAnimation.oncancel = () => {
            iconCell.style.removeProperty('will-change');
          };

          barsIconAnimations.push(iconAnimation);
        });
      },
      destroy: () => {
        clearBarsRevealAnimations();
        applyBarsFinalVisualState();
      },
    };

    detailSensoryBarsTooltipController = {
      hide: () => hideTooltip(),
      destroy: () => hideTooltip({ immediate: true }),
    };
    detailSensoryGroups.appendChild(barsChart);

    return true;
  };

  const renderDetailSensoryRadar = (model) => {
    if (!(detailSensoryRadar instanceof HTMLElement)) {
      return false;
    }

    clearDetailSensoryRadarTooltipController();
    clearDetailSensoryRadarAnimationController();

    const chartWidth = 440;
    const chartHeight = 404;
    const iconSize = 24;
    const iconHalf = iconSize / 2;
    const iconInsetX = 28;
    const iconInsetY = 10;
    const iconGapFromGrid = 12;
    const centerX = chartWidth / 2;
    const centerY = chartHeight / 2;
    // Fill more of the SVG while preserving a small safety margin for the icon ring.
    const labelRadius = Math.min(
      centerX - iconInsetX - iconHalf,
      centerY - iconInsetY - iconHalf
    );
    const outerRadius = labelRadius - iconHalf - iconGapFromGrid;
    const angleStep = (Math.PI * 2) / model.axes.length;
    const ringLevels = getDetailSensoryRadarLevels(model.scaleMax);
    const svg = createSvgNode('svg', {
      class: 'menu-page-detail__sensory-radar-svg',
      viewBox: `0 0 ${chartWidth} ${chartHeight}`,
      'aria-hidden': 'true',
      focusable: 'false',
    });
    const tooltip = document.createElement('div');
    tooltip.className = 'menu-page-detail__sensory-radar-tooltip';
    tooltip.id = 'menu-detail-sensory-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.setAttribute('aria-hidden', 'true');
    tooltip.hidden = true;

    const tooltipTitle = document.createElement('p');
    tooltipTitle.className = 'menu-page-detail__sensory-radar-tooltip-title';
    const tooltipDivider = document.createElement('div');
    tooltipDivider.className = 'menu-page-detail__sensory-radar-tooltip-divider';
    tooltipDivider.setAttribute('aria-hidden', 'true');
    const tooltipDescription = document.createElement('p');
    tooltipDescription.className = 'menu-page-detail__sensory-radar-tooltip-description';
    tooltip.append(tooltipTitle, tooltipDivider, tooltipDescription);
    const radarIconNodes = [];

    let activeIcon = null;
    let tooltipTimerId = 0;
    let tooltipExitTimerId = 0;
    let tooltipShowFrameId = 0;
    let documentDismissHandlersBound = false;

    const clearTooltipTimer = () => {
      if (!tooltipTimerId) {
        return;
      }

      window.clearTimeout(tooltipTimerId);
      tooltipTimerId = 0;
    };

    const clearTooltipExitTimer = () => {
      if (!tooltipExitTimerId) {
        return;
      }

      window.clearTimeout(tooltipExitTimerId);
      tooltipExitTimerId = 0;
    };

    const clearTooltipShowFrame = () => {
      if (!tooltipShowFrameId) {
        return;
      }

      window.cancelAnimationFrame(tooltipShowFrameId);
      tooltipShowFrameId = 0;
    };

    const handleViewportChange = () => {
      if (!(activeIcon instanceof SVGElement) || tooltip.hidden) {
        return;
      }

      const radarRect = detailSensoryRadar.getBoundingClientRect();
      const iconRect = activeIcon.getBoundingClientRect();

      if (!radarRect.width || !radarRect.height || !iconRect.width || !iconRect.height) {
        return;
      }

      const viewportWidth = Math.max(
        320,
        window.innerWidth || document.documentElement.clientWidth || radarRect.width
      );
      const viewportHeight = Math.max(
        320,
        window.innerHeight || document.documentElement.clientHeight || radarRect.height
      );

      let minViewportLeft = 8;
      let maxViewportRight = Math.max(minViewportLeft, viewportWidth - 8);
      let minViewportTop = 8;
      let maxViewportBottom = Math.max(minViewportTop, viewportHeight - 8);

      if (detailSensorySection instanceof HTMLElement) {
        const sectionRect = detailSensorySection.getBoundingClientRect();
        if (sectionRect.width > 0 && sectionRect.height > 0) {
          const sectionStyles = window.getComputedStyle(detailSensorySection);
          const sectionPaddingLeft =
            Number.parseFloat(sectionStyles.paddingLeft) || 0;
          const sectionPaddingRight =
            Number.parseFloat(sectionStyles.paddingRight) || 0;
          const sectionPaddingTop =
            Number.parseFloat(sectionStyles.paddingTop) || 0;
          const sectionPaddingBottom =
            Number.parseFloat(sectionStyles.paddingBottom) || 0;
          minViewportLeft = Math.max(
            minViewportLeft,
            sectionRect.left + sectionPaddingLeft
          );
          maxViewportRight = Math.min(
            maxViewportRight,
            sectionRect.right - sectionPaddingRight
          );
          minViewportTop = Math.max(
            minViewportTop,
            sectionRect.top + sectionPaddingTop
          );
          maxViewportBottom = Math.min(
            maxViewportBottom,
            sectionRect.bottom - sectionPaddingBottom
          );
        }
      }

      const availableTooltipWidth = Math.max(
        136,
        maxViewportRight - minViewportLeft
      );
      const tooltipWidth = Math.max(136, Math.min(208, availableTooltipWidth));
      tooltip.style.width = `${tooltipWidth}px`;

      const tooltipHeight = tooltip.offsetHeight || 72;
      const iconCenterViewportX = iconRect.left + iconRect.width / 2;
      const desiredLeftViewport = iconCenterViewportX - tooltipWidth / 2;
      const maxViewportLeft = Math.max(
        minViewportLeft,
        maxViewportRight - tooltipWidth
      );
      const clampedLeftViewport = Math.min(
        maxViewportLeft,
        Math.max(minViewportLeft, desiredLeftViewport)
      );
      const desiredTopViewport = iconRect.top - tooltipHeight - 12;
      const maxViewportTop = Math.max(
        minViewportTop,
        maxViewportBottom - tooltipHeight
      );
      const topViewport = Math.min(
        maxViewportTop,
        Math.max(minViewportTop, desiredTopViewport)
      );
      const left = clampedLeftViewport - radarRect.left;
      const top = topViewport - radarRect.top;
      const arrowX = Math.max(
        14,
        Math.min(tooltipWidth - 14, iconCenterViewportX - clampedLeftViewport)
      );

      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
      tooltip.style.setProperty('--menu-detail-sensory-tooltip-arrow-x', `${arrowX}px`);
    };

    const detachDocumentDismissHandlers = () => {
      if (!documentDismissHandlersBound) {
        return;
      }

      documentDismissHandlersBound = false;
      document.removeEventListener('pointerdown', handleDocumentPointerDown, true);
      document.removeEventListener('focusin', handleDocumentFocusIn, true);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };

    const hideTooltip = ({ immediate = false } = {}) => {
      clearTooltipTimer();
      detachDocumentDismissHandlers();
      clearTooltipShowFrame();

      if (activeIcon instanceof SVGElement) {
        activeIcon.classList.remove('is-tooltip-active');
        activeIcon.setAttribute('aria-expanded', 'false');
      }

      activeIcon = null;
      tooltip.classList.remove('is-visible');
      tooltip.setAttribute('aria-hidden', 'true');

      clearTooltipExitTimer();

      if (immediate) {
        tooltip.hidden = true;
        return;
      }

      tooltipExitTimerId = window.setTimeout(() => {
        tooltip.hidden = true;
        tooltipExitTimerId = 0;
      }, DETAIL_SENSORY_TOOLTIP_EXIT_MS);
    };

    const handleDocumentPointerDown = (event) => {
      const target = event.target;

      if (
        activeIcon instanceof Node &&
        target instanceof Node &&
        (target === activeIcon || activeIcon.contains(target))
      ) {
        return;
      }

      hideTooltip();
    };

    const handleDocumentFocusIn = (event) => {
      const target = event.target;

      if (
        activeIcon instanceof Node &&
        target instanceof Node &&
        (target === activeIcon || activeIcon.contains(target))
      ) {
        return;
      }

      hideTooltip();
    };

    const attachDocumentDismissHandlers = () => {
      if (documentDismissHandlersBound) {
        return;
      }

      documentDismissHandlersBound = true;
      document.addEventListener('pointerdown', handleDocumentPointerDown, true);
      document.addEventListener('focusin', handleDocumentFocusIn, true);
      window.addEventListener('resize', handleViewportChange);
      window.addEventListener('scroll', handleViewportChange, true);
    };

    const scheduleTooltipHide = () => {
      clearTooltipTimer();
      tooltipTimerId = window.setTimeout(() => {
        hideTooltip();
      }, DETAIL_SENSORY_TOOLTIP_AUTO_CLOSE_MS);
    };

    const showTooltip = (icon, copy) => {
      if (!(icon instanceof SVGElement)) {
        return;
      }

      if (activeIcon instanceof SVGElement && activeIcon !== icon) {
        activeIcon.classList.remove('is-tooltip-active');
        activeIcon.setAttribute('aria-expanded', 'false');
      }

      const resolvedTitle = normalizeText(copy?.title || icon.dataset.axisLabel || 'Atributo');
      const resolvedDescription = normalizeText(
        copy?.description ||
          `Cómo se percibe ${normalizeText(icon.dataset.axisLabel).toLowerCase()} en el plato.`
      );

      activeIcon = icon;
      tooltipTitle.textContent = resolvedTitle;
      tooltipDescription.textContent = resolvedDescription;
      clearTooltipExitTimer();
      clearTooltipShowFrame();
      tooltip.hidden = false;
      tooltip.setAttribute('aria-hidden', 'false');
      tooltip.classList.remove('is-visible');
      handleViewportChange();

      tooltipShowFrameId = window.requestAnimationFrame(() => {
        tooltipShowFrameId = window.requestAnimationFrame(() => {
          if (!tooltip.hidden) {
            tooltip.classList.add('is-visible');
          }
          tooltipShowFrameId = 0;
        });
      });

      icon.classList.add('is-tooltip-active');
      icon.setAttribute('aria-expanded', 'true');
      attachDocumentDismissHandlers();
      scheduleTooltipHide();
    };

    const comparisonActive = model?.comparison?.active === true;
    const comparisonCurrentLabel = normalizeText(model?.comparison?.currentLabel || '');
    const comparisonComparedLabel = normalizeText(model?.comparison?.comparedLabel || '');
    const radarSummary = model.axes
      .map((axis) => `${axis.label} ${axis.value} de ${model.scaleMax}`)
      .join(', ');
    const comparisonSummary = comparisonActive
      ? model.axes
          .map((axis) => `${axis.label} ${axis.comparisonValue} de ${model.scaleMax}`)
          .join(', ')
      : '';

    setDetailSensoryComparisonMeta({
      active: comparisonActive,
      currentLabel: comparisonCurrentLabel,
      comparedLabel: comparisonComparedLabel,
    });

    detailSensoryRadar.setAttribute('role', 'group');
    detailSensoryRadar.setAttribute(
      'aria-label',
      comparisonActive
        ? `Perfil sensorial comparativo en radar. ${comparisonCurrentLabel}: ${radarSummary}. ${comparisonComparedLabel}: ${comparisonSummary}.`
        : `Perfil sensorial en radar. ${radarSummary}.`
    );

    const axisPoints = model.axes.map((axis, axisIndex) => {
      const angle = -Math.PI / 2 + angleStep * axisIndex;
      const outerPoint = toDetailSensoryRadarPoint({
        centerX,
        centerY,
        radius: outerRadius,
        angle,
      });
      const labelPoint = toDetailSensoryRadarPoint({
        centerX,
        centerY,
        radius: labelRadius,
        angle,
      });
      const dataPoint = toDetailSensoryRadarPoint({
        centerX,
        centerY,
        radius: outerRadius * (axis.value / model.scaleMax),
        angle,
      });
      const comparisonPoint = comparisonActive
        ? toDetailSensoryRadarPoint({
            centerX,
            centerY,
            radius: outerRadius * ((Number(axis.comparisonValue) || 0) / model.scaleMax),
            angle,
          })
        : null;

      return {
        ...axis,
        angle,
        outerPoint,
        labelPoint,
        dataPoint,
        comparisonPoint,
        iconPath: toAbsoluteAssetPath(DETAIL_SENSORY_RADAR_ICON_PATHS[axis.id] || ''),
      };
    });

    ringLevels.forEach((level) => {
      const ringPoints = axisPoints.map((axis) =>
        toDetailSensoryRadarPoint({
          centerX,
          centerY,
          radius: outerRadius * (level / model.scaleMax),
          angle: axis.angle,
        })
      );
      const ring = createSvgNode('polygon', {
        class:
          level === model.scaleMax
            ? 'menu-page-detail__sensory-radar-ring is-outer'
            : 'menu-page-detail__sensory-radar-ring',
        points: toDetailSensoryRadarPointsString(ringPoints),
      });
      svg.append(ring);
    });

    axisPoints.forEach((axis) => {
      const axisLine = createSvgNode('line', {
        class: 'menu-page-detail__sensory-radar-axis',
        x1: centerX,
        y1: centerY,
        x2: axis.outerPoint.x,
        y2: axis.outerPoint.y,
      });
      svg.appendChild(axisLine);
    });

    const areaPath = toDetailSensoryRadarPath(
      axisPoints.map((axis) => axis.dataPoint)
    );
    const comparisonAreaPath = comparisonActive
      ? toDetailSensoryRadarPath(
          axisPoints
            .map((axis) => axis.comparisonPoint)
            .filter((point) => point && Number.isFinite(point.x) && Number.isFinite(point.y))
        )
      : '';
    const comparisonGlow =
      comparisonActive && comparisonAreaPath
        ? createSvgNode('path', {
            class: 'menu-page-detail__sensory-radar-glow menu-page-detail__sensory-radar-glow--compared',
            d: comparisonAreaPath,
          })
        : null;
    if (comparisonGlow) {
      svg.appendChild(comparisonGlow);
    }

    const comparisonArea =
      comparisonActive && comparisonAreaPath
        ? createSvgNode('path', {
            class: 'menu-page-detail__sensory-radar-area menu-page-detail__sensory-radar-area--compared',
            d: comparisonAreaPath,
          })
        : null;
    if (comparisonArea) {
      svg.appendChild(comparisonArea);
    }

    const glow = createSvgNode('path', {
      class: 'menu-page-detail__sensory-radar-glow',
      d: areaPath,
    });
    svg.appendChild(glow);

    const area = createSvgNode('path', {
      class: 'menu-page-detail__sensory-radar-area',
      d: areaPath,
    });
    svg.appendChild(area);

    axisPoints.forEach((axis) => {
      if (axis.iconPath) {
        const axisTooltipCopy = getSensoryAxisTooltipCopy(axis.id) || {
          title: axis.label,
          description: `Cómo se percibe ${axis.label.toLowerCase()} en el plato.`,
        };
        const icon = createSvgNode('image', {
          class: 'menu-page-detail__sensory-radar-icon',
          href: axis.iconPath,
          x: axis.labelPoint.x - iconHalf,
          y: axis.labelPoint.y - iconHalf,
          width: iconSize,
          height: iconSize,
          preserveAspectRatio: 'xMidYMid meet',
        });
        icon.dataset.axisId = axis.id;
        icon.dataset.axisLabel = axis.label;
        icon.setAttribute(
          'aria-label',
          `${axisTooltipCopy.title}. ${axisTooltipCopy.description}`
        );
        icon.setAttribute('tabindex', '0');
        icon.setAttribute('focusable', 'true');
        icon.setAttribute('role', 'button');
        icon.setAttribute('aria-haspopup', 'true');
        icon.setAttribute('aria-expanded', 'false');
        icon.setAttribute('aria-describedby', tooltip.id);
        icon.addEventListener('click', (event) => {
          event.preventDefault();

          if (activeIcon === icon && !tooltip.hidden) {
            hideTooltip();
            return;
          }

          showTooltip(icon, axisTooltipCopy);
        });
        icon.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            showTooltip(icon, axisTooltipCopy);
            return;
          }

          if (event.key === 'Escape') {
            event.preventDefault();
            hideTooltip();
            if (typeof icon.blur === 'function') {
              icon.blur();
            }
          }
        });
        icon.addEventListener('mouseleave', () => {
          if (activeIcon === icon) {
            hideTooltip();
          }
        });
        icon.addEventListener('blur', () => {
          window.setTimeout(() => {
            if (activeIcon === icon && document.activeElement !== icon) {
              hideTooltip();
            }
          }, 0);
        });
        svg.appendChild(icon);
        radarIconNodes.push(icon);
      }
    });

    const centerDot = createSvgNode('circle', {
      class: 'menu-page-detail__sensory-radar-center',
      cx: centerX,
      cy: centerY,
      r: 3,
    });
    svg.appendChild(centerDot);

    detailSensoryRadar.append(svg, tooltip);

    let radarRevealFrameId = 0;
    let radarIconRevealAnimations = [];

    const clampUnit = (value) => Math.min(1, Math.max(0, value));
    const easeOutReveal = (value) => 1 - Math.pow(1 - clampUnit(value), 3);

    const clearRadarRevealAnimations = () => {
      if (radarRevealFrameId) {
        window.cancelAnimationFrame(radarRevealFrameId);
        radarRevealFrameId = 0;
      }

      radarIconRevealAnimations.forEach((animation) => animation?.cancel());
      radarIconRevealAnimations = [];
    };

    const setRadarAreaFromProgress = (axisProgressList) => {
      const nextAreaPath = toDetailSensoryRadarPath(
        axisPoints.map((axis, axisIndex) => {
          const axisProgress = clampUnit(axisProgressList[axisIndex] || 0);
          return toDetailSensoryRadarPoint({
            centerX,
            centerY,
            radius: outerRadius * (axis.value / model.scaleMax) * axisProgress,
            angle: axis.angle,
          });
        })
      );

      area.setAttribute('d', nextAreaPath);
      glow.setAttribute('d', nextAreaPath);

      if (comparisonActive && comparisonArea && comparisonGlow) {
        const nextComparisonPath = toDetailSensoryRadarPath(
          axisPoints.map((axis, axisIndex) => {
            const axisProgress = clampUnit(axisProgressList[axisIndex] || 0);
            return toDetailSensoryRadarPoint({
              centerX,
              centerY,
              radius:
                outerRadius *
                ((Number(axis.comparisonValue) || 0) / model.scaleMax) *
                axisProgress,
              angle: axis.angle,
            });
          })
        );
        comparisonArea.setAttribute('d', nextComparisonPath);
        comparisonGlow.setAttribute('d', nextComparisonPath);
      }
    };

    const applyRadarFinalVisualState = () => {
      area.setAttribute('d', areaPath);
      glow.setAttribute('d', areaPath);
      area.style.removeProperty('opacity');
      glow.style.removeProperty('opacity');

      if (comparisonActive && comparisonArea && comparisonGlow) {
        comparisonArea.setAttribute('d', comparisonAreaPath);
        comparisonGlow.setAttribute('d', comparisonAreaPath);
        comparisonArea.style.removeProperty('opacity');
        comparisonGlow.style.removeProperty('opacity');
      }

      radarIconNodes.forEach((icon) => {
        icon.style.opacity = '1';
        icon.style.removeProperty('transform');
        icon.style.removeProperty('will-change');
      });
    };

    detailSensoryRadarAnimationController = {
      reveal: ({ immediate = false } = {}) => {
        clearRadarRevealAnimations();

        const prefersReducedMotion =
          typeof window.matchMedia === 'function' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (immediate || prefersReducedMotion) {
          applyRadarFinalVisualState();
          return;
        }

        setRadarAreaFromProgress(axisPoints.map(() => 0));
        area.style.opacity = '0.2';
        glow.style.opacity = '0.18';
        if (comparisonActive && comparisonArea && comparisonGlow) {
          comparisonArea.style.opacity = '0.12';
          comparisonGlow.style.opacity = '0.1';
        }
        const revealedIconsByAxis = axisPoints.map(() => false);

        radarIconNodes.forEach((icon) => {
          icon.style.opacity = '0';
          icon.style.transform = 'scale(0.9)';
          icon.style.removeProperty('will-change');
        });

        const revealRadarIcon = (axisIndex) => {
          if (revealedIconsByAxis[axisIndex]) {
            return;
          }

          const icon = radarIconNodes[axisIndex];
          if (!(icon instanceof SVGElement)) {
            revealedIconsByAxis[axisIndex] = true;
            return;
          }

          revealedIconsByAxis[axisIndex] = true;
          icon.style.willChange = 'opacity, transform';

          const iconAnimation = icon.animate(
            [
              { opacity: 0, transform: 'scale(0.9)' },
              { opacity: 1, transform: 'scale(1.02)', offset: 0.78 },
              { opacity: 1, transform: 'scale(1)' },
            ],
            {
              duration: 560,
              easing: 'cubic-bezier(0.2, 0.85, 0.32, 1)',
              fill: 'forwards',
            }
          );

          iconAnimation.onfinish = () => {
            icon.style.opacity = '1';
            icon.style.removeProperty('transform');
            icon.style.removeProperty('will-change');
            iconAnimation.cancel();
          };
          iconAnimation.oncancel = () => {
            icon.style.removeProperty('will-change');
          };

          radarIconRevealAnimations.push(iconAnimation);
        };

        const axisDuration = DETAIL_SENSORY_RADAR_REVEAL_MS;
        const axisStagger = DETAIL_SENSORY_RADAR_STAGGER_MS;
        const maxAxisIndex = Math.max(0, axisPoints.length - 1);
        const revealDuration = axisDuration + axisStagger * maxAxisIndex;
        const revealStart = window.performance.now();

        const tickRadarReveal = (frameTime) => {
          const elapsed = frameTime - revealStart;
          const axisProgressList = axisPoints.map((_, axisIndex) => {
            const axisElapsed = elapsed - axisStagger * axisIndex;
            const axisLinearProgress = axisElapsed / axisDuration;
            return easeOutReveal(axisLinearProgress);
          });

          axisProgressList.forEach((axisProgress, axisIndex) => {
            if (axisProgress >= 0.96) {
              revealRadarIcon(axisIndex);
            }
          });

          setRadarAreaFromProgress(axisProgressList);

          const overallProgress = easeOutReveal(elapsed / revealDuration);
          area.style.opacity = String(0.2 + overallProgress * 0.8);
          glow.style.opacity = String(0.18 + overallProgress * 0.54);
          if (comparisonActive && comparisonArea && comparisonGlow) {
            comparisonArea.style.opacity = String(0.12 + overallProgress * 0.72);
            comparisonGlow.style.opacity = String(0.1 + overallProgress * 0.48);
          }

          if (elapsed < revealDuration + 24) {
            radarRevealFrameId = window.requestAnimationFrame(tickRadarReveal);
            return;
          }

          radarRevealFrameId = 0;
          applyRadarFinalVisualState();
        };

        radarRevealFrameId = window.requestAnimationFrame(tickRadarReveal);
      },
      destroy: () => {
        clearRadarRevealAnimations();
        applyRadarFinalVisualState();
      },
    };

    detailSensoryRadarTooltipController = {
      hide: () => hideTooltip(),
      destroy: () => hideTooltip({ immediate: true }),
    };
    return true;
  };

  const renderDetailSensoryProfile = (
    profile,
    { currentLabel = '', comparisonProfile = null, comparisonLabel = '' } = {}
  ) => {
    if (
      !(detailSensorySection instanceof HTMLElement) ||
      !(detailSensoryViewTabsRoot instanceof HTMLElement) ||
      !(detailSensoryBarsPanel instanceof HTMLElement) ||
      !(detailSensoryRadarPanel instanceof HTMLElement) ||
      !(detailSensoryGroups instanceof HTMLElement) ||
      !(detailSensoryRadar instanceof HTMLElement) ||
      !(detailSensorySummary instanceof HTMLElement)
    ) {
      return false;
    }

    clearDetailSensoryProfile();

    const model = buildDetailSensoryProfileModel(profile);

    if (!model) {
      return false;
    }

    let hasComparison = false;
    if (isObject(comparisonProfile)) {
      const comparedModel = buildDetailSensoryProfileModel(comparisonProfile);
      if (comparedModel && comparedModel.axes.length === model.axes.length) {
        const comparedValueByAxisId = new Map(
          comparedModel.axes.map((axis) => [axis.id, axis.value])
        );
        model.axes = model.axes.map((axis) => {
          const comparedValue = comparedValueByAxisId.get(axis.id);
          if (comparedValue === null || comparedValue === undefined) {
            return axis;
          }

          return {
            ...axis,
            comparisonValue: comparedValue,
          };
        });
        model.groups = model.groups.map((group) => ({
          ...group,
          axes: group.axes.map((axis) => {
            const comparedValue = comparedValueByAxisId.get(axis.id);
            if (comparedValue === null || comparedValue === undefined) {
              return axis;
            }

            return {
              ...axis,
              comparisonValue: comparedValue,
            };
          }),
        }));
        hasComparison = model.axes.every((axis) => Number.isFinite(axis.comparisonValue));
      }
    }

    model.comparison = hasComparison
      ? {
          active: true,
          currentLabel: normalizeText(currentLabel || detailTitle?.textContent || 'Actual'),
          comparedLabel: normalizeText(comparisonLabel || 'Comparado'),
        }
      : {
          active: false,
          currentLabel: '',
          comparedLabel: '',
        };

    if (!renderDetailSensoryBars(model) || !renderDetailSensoryRadar(model)) {
      clearDetailSensoryProfile();
      return false;
    }

    if (detailSensorySection instanceof HTMLElement) {
      detailSensorySection.dataset.comparisonActive = hasComparison ? 'true' : 'false';
    }

    state.detailSensoryView = hasComparison ? 'radar' : DEFAULT_DETAIL_SENSORY_VIEW;
    detailSensoryViewTabsRoot.hidden = false;
    detailSensorySummary.textContent = model.summary;
    detailSensorySummary.hidden = false;
    detailSensorySection.hidden = false;
    syncDetailSensoryViewState();
    return true;
  };

  const syncDetailSensorySubtitle = (sensoryIntro = '') => {
    if (!(detailSensorySubtitle instanceof HTMLElement)) {
      return;
    }

    detailSensorySubtitle.textContent =
      normalizeText(sensoryIntro) ||
      normalizeText(menuDetailEditorialCopy?.sensory?.subtitle) ||
      DETAIL_DEFAULT_SENSORY_SUBTITLE;
  };

  const buildDetailPairingEntryElement = (pairing = null) => {
    if (!isObject(pairing)) {
      return null;
    }

    let entryNode = null;
    if (detailPairingTemplate instanceof HTMLTemplateElement) {
      const cloned = detailPairingTemplate.content.firstElementChild?.cloneNode(true);
      if (cloned instanceof HTMLElement) {
        entryNode = cloned;
      }
    }

    if (!(entryNode instanceof HTMLElement)) {
      entryNode = document.createElement('article');
      entryNode.className = 'menu-page-detail__pairing-entry';
      entryNode.setAttribute('aria-label', 'Recomendación de maridaje');
      entryNode.innerHTML =
        '<div class="menu-page-detail__pairing-head">'
        + '<div class="menu-page-detail__pairing-name-row">'
        + '<h4 class="menu-page-detail__pairing-name"></h4>'
        + '<p class="menu-page-detail__pairing-meta"></p>'
        + '</div>'
        + '<button class="menu-page-detail__pairing-cta" type="button" aria-label=""></button>'
        + '</div>'
        + '<p class="menu-page-detail__pairing-description"></p>';
    }

    entryNode.dataset.pairingId = normalizeText(pairing.pairingId);

    const pairingsCopy =
      menuDetailEditorialCopy?.pairings || MENU_DETAIL_EDITORIAL_COPY_DEFAULTS.pairings;
    const nameNode = entryNode.querySelector('.menu-page-detail__pairing-name');
    const metaNode = entryNode.querySelector('.menu-page-detail__pairing-meta');
    const descriptionNode = entryNode.querySelector('.menu-page-detail__pairing-description');
    const ctaNode = entryNode.querySelector('.menu-page-detail__pairing-cta');

    if (nameNode instanceof HTMLElement) {
      nameNode.textContent = normalizeText(pairing.name || '');
    }
    if (metaNode instanceof HTMLElement) {
      metaNode.textContent = normalizeText(pairing.meta || '');
    }
    if (descriptionNode instanceof HTMLElement) {
      descriptionNode.textContent = normalizeText(pairing.description || '');
    }

    if (ctaNode instanceof HTMLButtonElement) {
      const ctaLabel =
        normalizeText(pairing.ctaLabel) ||
        normalizeText(pairingsCopy?.ctaFallbackLabel) ||
        DETAIL_DEFAULT_PAIRING_CONTENT.ctaLabel ||
        MENU_DETAIL_EDITORIAL_COPY_DEFAULTS.pairings.ctaFallbackLabel;
      const ctaTarget = normalizeText(pairing.ctaTarget);
      ctaNode.setAttribute('aria-label', ctaLabel);
      ctaNode.title = ctaLabel;
      ctaNode.dataset.pairingId = normalizeText(pairing.pairingId);
      if (ctaTarget) {
        ctaNode.dataset.pairingTarget = ctaTarget;
      } else {
        delete ctaNode.dataset.pairingTarget;
      }
    }

    return entryNode;
  };

  const applyDetailPairingContent = (pairings = []) => {
    const normalizedPairings = Array.isArray(pairings)
      ? pairings.filter((entry) => isObject(entry))
      : [];
    const pairingsCopy =
      menuDetailEditorialCopy?.pairings || MENU_DETAIL_EDITORIAL_COPY_DEFAULTS.pairings;

    if (detailPairingsSubtitle instanceof HTMLElement) {
      const firstPairing = normalizedPairings[0] || null;
      detailPairingsSubtitle.textContent =
        normalizeText(firstPairing?.subtitle) ||
        normalizeText(pairingsCopy?.sectionSubtitle) ||
        DETAIL_DEFAULT_PAIRING_CONTENT.subtitle;
    }

    if (!(detailPairingsList instanceof HTMLElement)) {
      return;
    }

    const fragment = document.createDocumentFragment();
    normalizedPairings.forEach((pairing) => {
      const entryNode = buildDetailPairingEntryElement(pairing);
      if (entryNode) {
        fragment.appendChild(entryNode);
      }
    });
    detailPairingsList.replaceChildren(fragment);
  };

  const clearDetailPairingContent = () => {
    const pairingsCopy =
      menuDetailEditorialCopy?.pairings || MENU_DETAIL_EDITORIAL_COPY_DEFAULTS.pairings;
    if (detailPairingsSubtitle instanceof HTMLElement) {
      detailPairingsSubtitle.textContent =
        normalizeText(pairingsCopy?.sectionSubtitle) ||
        DETAIL_DEFAULT_PAIRING_CONTENT.subtitle;
    }
    if (detailPairingsList instanceof HTMLElement) {
      detailPairingsList.replaceChildren();
    }
  };

  const DETAIL_STORY_HEADING_PATTERN = /^ {0,3}(#{1,6})\s+(.+)$/;
  const DETAIL_STORY_BLOCKQUOTE_PATTERN = /^ {0,3}>\s?(.*)$/;
  const DETAIL_STORY_UNORDERED_MARKER_PATTERN = /^ {0,3}[-*+]\s+(.+)$/;
  const DETAIL_STORY_ORDERED_MARKER_PATTERN = /^ {0,3}\d+[.)]\s+(.+)$/;

  const normalizeDetailStoryMarkdownSource = (value = '') =>
    String(value || '')
      .replace(/\r\n?/g, '\n')
      .trim();

  const isDetailStoryHorizontalRule = (line = '') => {
    const trimmed = String(line || '').trim();
    if (!trimmed) {
      return false;
    }
    return (
      /^-{3,}$/.test(trimmed) ||
      /^\*{3,}$/.test(trimmed) ||
      /^(?:-\s*){3,}$/.test(trimmed) ||
      /^(?:\*\s*){3,}$/.test(trimmed)
    );
  };

  const isDetailStoryBlockBoundary = (line = '') =>
    Boolean(
      line.match(DETAIL_STORY_HEADING_PATTERN) ||
      line.match(DETAIL_STORY_BLOCKQUOTE_PATTERN) ||
      line.match(DETAIL_STORY_UNORDERED_MARKER_PATTERN) ||
      line.match(DETAIL_STORY_ORDERED_MARKER_PATTERN) ||
      isDetailStoryHorizontalRule(line)
    );

  const sanitizeDetailStoryLinkHref = (rawHref = '') => {
    const trimmed = String(rawHref || '').trim();
    if (!trimmed) {
      return '';
    }

    const hrefMatch = trimmed.match(/^(\S+)(?:\s+['"][^'"]*['"])?$/);
    if (!hrefMatch || !hrefMatch[1]) {
      return '';
    }

    const href = hrefMatch[1].trim();
    if (!href || href.startsWith('//')) {
      return '';
    }

    const protocolMatch = href.match(/^([a-z][a-z0-9+.-]*):/i);
    if (protocolMatch) {
      const protocol = `${protocolMatch[1].toLowerCase()}:`;
      if (
        protocol !== 'http:' &&
        protocol !== 'https:' &&
        protocol !== 'mailto:' &&
        protocol !== 'tel:'
      ) {
        return '';
      }
    }

    return href;
  };

  const getDetailStoryNextInlineToken = (text = '') => {
    const tokens = [];

    const linkMatch = /\[([^\]\n]+)\]\(([^)\n]+)\)/.exec(text);
    if (linkMatch) {
      tokens.push({
        type: 'link',
        match: linkMatch,
        index: linkMatch.index,
        length: linkMatch[0].length,
        priority: 0,
      });
    }

    const strongMatch = /\*\*([^*\n][^*\n]*?)\*\*/.exec(text);
    if (strongMatch) {
      tokens.push({
        type: 'strong',
        match: strongMatch,
        index: strongMatch.index,
        length: strongMatch[0].length,
        priority: 1,
      });
    }

    const emphasisMatch = /\*([^*\n]+)\*/.exec(text);
    if (emphasisMatch) {
      tokens.push({
        type: 'emphasis',
        match: emphasisMatch,
        index: emphasisMatch.index,
        length: emphasisMatch[0].length,
        priority: 2,
      });
    }

    if (!tokens.length) {
      return null;
    }

    tokens.sort((a, b) =>
      a.index - b.index ||
      a.priority - b.priority ||
      b.length - a.length
    );

    return tokens[0];
  };

  const appendDetailStoryInlineNodes = (parent, text = '', depth = 0) => {
    const source = String(text || '');
    if (!source) {
      return;
    }

    if (depth > 10) {
      parent.appendChild(document.createTextNode(source));
      return;
    }

    const token = getDetailStoryNextInlineToken(source);
    if (!token) {
      parent.appendChild(document.createTextNode(source));
      return;
    }

    if (token.index > 0) {
      parent.appendChild(document.createTextNode(source.slice(0, token.index)));
    }

    const matchedText = token.match[0];
    if (token.type === 'strong') {
      const strong = document.createElement('strong');
      appendDetailStoryInlineNodes(strong, token.match[1], depth + 1);
      parent.appendChild(strong);
    } else if (token.type === 'emphasis') {
      const emphasis = document.createElement('em');
      appendDetailStoryInlineNodes(emphasis, token.match[1], depth + 1);
      parent.appendChild(emphasis);
    } else if (token.type === 'link') {
      const href = sanitizeDetailStoryLinkHref(token.match[2]);
      if (!href) {
        parent.appendChild(document.createTextNode(matchedText));
      } else {
        const link = document.createElement('a');
        link.className = 'menu-page-detail__history-link';
        link.setAttribute('href', href);
        if (/^https?:/i.test(href)) {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        }
        appendDetailStoryInlineNodes(link, token.match[1], depth + 1);
        parent.appendChild(link);
      }
    } else {
      parent.appendChild(document.createTextNode(matchedText));
    }

    const tail = source.slice(token.index + matchedText.length);
    if (tail) {
      appendDetailStoryInlineNodes(parent, tail, depth);
    }
  };

  const appendDetailStoryInlineLines = (parent, lines = []) => {
    lines.forEach((line, index) => {
      appendDetailStoryInlineNodes(parent, String(line || '').trim(), 0);
      if (index < lines.length - 1) {
        parent.appendChild(document.createElement('br'));
      }
    });
  };

  const createDetailStoryParagraph = (lines = []) => {
    const paragraph = document.createElement('p');
    paragraph.className = 'menu-page-detail__history-paragraph';
    appendDetailStoryInlineLines(paragraph, lines);
    return paragraph;
  };

  const createDetailStoryHeading = ({ level = 2, text = '' } = {}) => {
    const safeLevel = Math.min(6, Math.max(1, Number(level) || 2));
    const heading = document.createElement(`h${safeLevel}`);
    heading.className = `menu-page-detail__history-heading menu-page-detail__history-heading--h${safeLevel}`;
    appendDetailStoryInlineNodes(heading, String(text || '').trim(), 0);
    return heading;
  };

  const createDetailStoryList = ({ ordered = false, items = [] } = {}) => {
    const list = document.createElement(ordered ? 'ol' : 'ul');
    list.className = ordered
      ? 'menu-page-detail__history-list menu-page-detail__history-list--ordered'
      : 'menu-page-detail__history-list';

    items.forEach((entry) => {
      const item = document.createElement('li');
      appendDetailStoryInlineNodes(item, String(entry || '').trim(), 0);
      list.appendChild(item);
    });

    return list;
  };

  const createDetailStoryBlockquote = (quoteLines = []) => {
    const blockquote = document.createElement('blockquote');
    blockquote.className = 'menu-page-detail__history-blockquote';

    const paragraphs = [];
    let currentParagraph = [];
    quoteLines.forEach((line) => {
      if (!normalizeText(line)) {
        if (currentParagraph.length) {
          paragraphs.push(currentParagraph.slice());
          currentParagraph = [];
        }
        return;
      }
      currentParagraph.push(line);
    });
    if (currentParagraph.length) {
      paragraphs.push(currentParagraph.slice());
    }

    if (!paragraphs.length) {
      return blockquote;
    }

    paragraphs.forEach((paragraphLines) => {
      blockquote.appendChild(createDetailStoryParagraph(paragraphLines));
    });
    return blockquote;
  };

  const renderDetailStoryBodyFromText = (storyBody = '') => {
    if (!(detailHistoryBody instanceof HTMLElement)) {
      return;
    }

    const source = normalizeDetailStoryMarkdownSource(storyBody);
    if (!source) {
      detailHistoryBody.replaceChildren();
      return;
    }

    const lines = source.split('\n');
    const fragment = document.createDocumentFragment();
    let lineIndex = 0;

    while (lineIndex < lines.length) {
      const currentLine = lines[lineIndex];

      if (!normalizeText(currentLine)) {
        lineIndex += 1;
        continue;
      }

      if (isDetailStoryHorizontalRule(currentLine)) {
        const divider = document.createElement('hr');
        divider.className = 'menu-page-detail__history-divider';
        fragment.appendChild(divider);
        lineIndex += 1;
        continue;
      }

      const headingMatch = currentLine.match(DETAIL_STORY_HEADING_PATTERN);
      if (headingMatch) {
        fragment.appendChild(
          createDetailStoryHeading({
            level: headingMatch[1].length,
            text: headingMatch[2],
          })
        );
        lineIndex += 1;
        continue;
      }

      const quoteMatch = currentLine.match(DETAIL_STORY_BLOCKQUOTE_PATTERN);
      if (quoteMatch) {
        const quoteLines = [];
        while (lineIndex < lines.length) {
          const nestedQuoteMatch = lines[lineIndex].match(DETAIL_STORY_BLOCKQUOTE_PATTERN);
          if (!nestedQuoteMatch) {
            break;
          }
          quoteLines.push(nestedQuoteMatch[1] || '');
          lineIndex += 1;
        }
        fragment.appendChild(createDetailStoryBlockquote(quoteLines));
        continue;
      }

      const unorderedMarker = currentLine.match(DETAIL_STORY_UNORDERED_MARKER_PATTERN);
      if (unorderedMarker) {
        const items = [];
        while (lineIndex < lines.length) {
          const listMatch = lines[lineIndex].match(DETAIL_STORY_UNORDERED_MARKER_PATTERN);
          if (!listMatch) {
            break;
          }
          items.push(listMatch[1]);
          lineIndex += 1;
        }
        if (items.length) {
          fragment.appendChild(createDetailStoryList({ items }));
        }
        continue;
      }

      const orderedMarker = currentLine.match(DETAIL_STORY_ORDERED_MARKER_PATTERN);
      if (orderedMarker) {
        const items = [];
        while (lineIndex < lines.length) {
          const listMatch = lines[lineIndex].match(DETAIL_STORY_ORDERED_MARKER_PATTERN);
          if (!listMatch) {
            break;
          }
          items.push(listMatch[1]);
          lineIndex += 1;
        }
        if (items.length) {
          fragment.appendChild(createDetailStoryList({ ordered: true, items }));
        }
        continue;
      }

      const paragraphLines = [];
      while (lineIndex < lines.length) {
        const line = lines[lineIndex];
        if (!normalizeText(line)) {
          lineIndex += 1;
          break;
        }
        if (paragraphLines.length && isDetailStoryBlockBoundary(line)) {
          break;
        }
        paragraphLines.push(line);
        lineIndex += 1;
      }

      if (paragraphLines.length) {
        fragment.appendChild(createDetailStoryParagraph(paragraphLines));
      }
    }

    detailHistoryBody.replaceChildren(fragment);
  };

  const applyDetailStoryContent = (story = null) => {
    if (!isObject(story)) {
      return;
    }

    setDetailHistorySectionTitle(
      normalizeText(menuDetailEditorialCopy?.story?.sectionTitle) ||
        DETAIL_DEFAULT_SECTION_COPY.storyTitle
    );
    renderDetailStoryBodyFromText(story.body);
  };

  const clearDetailStoryContent = () => {
    setDetailHistorySectionTitle(
      normalizeText(menuDetailEditorialCopy?.story?.sectionTitle) ||
        DETAIL_DEFAULT_SECTION_COPY.storyTitle
    );
    renderDetailStoryBodyFromText('');
  };

  const syncDetailPairingsSection = ({ pairings = [], forceHidden = false } = {}) => {
    const normalizedPairings = Array.isArray(pairings)
      ? pairings.filter((entry) => isObject(entry))
      : [];
    const visiblePairings = normalizedPairings.filter((entry) =>
      Boolean(
        normalizeText(entry.name) ||
        normalizeText(entry.meta) ||
        normalizeText(entry.description) ||
        normalizeText(entry.ctaLabel) ||
        normalizeText(entry.ctaTarget)
      )
    );

    const shouldShowPairings = !forceHidden && visiblePairings.length > 0;
    if (shouldShowPairings) {
      applyDetailPairingContent(visiblePairings);
    } else {
      clearDetailPairingContent();
    }

    if (detailPairingsSection instanceof HTMLElement) {
      detailPairingsSection.hidden = !shouldShowPairings;
    }

    if (detailPairingsDivider instanceof HTMLElement) {
      detailPairingsDivider.hidden = !shouldShowPairings;
    }

    return shouldShowPairings;
  };

  const syncDetailHistorySection = ({ story = null, forceHidden = false } = {}) => {
    const hasEditorialStory = isObject(story);
    let shouldShowHistory = !forceHidden && hasEditorialStory;

    if (shouldShowHistory) {
      shouldShowHistory = Boolean(normalizeText(story.body));
      if (shouldShowHistory) {
        applyDetailStoryContent(story);
      }
    }

    if (!shouldShowHistory) {
      clearDetailStoryContent();
    }

    if (detailHistorySection instanceof HTMLElement) {
      detailHistorySection.hidden = !shouldShowHistory;
      if (shouldShowHistory && story?.storyId) {
        detailHistorySection.dataset.storyId = normalizeText(story.storyId);
      } else {
        delete detailHistorySection.dataset.storyId;
      }
    }

    if (detailHistoryDivider instanceof HTMLElement) {
      detailHistoryDivider.hidden = !shouldShowHistory;
    }

    return shouldShowHistory;
  };

  const resolveItemMedia = (item) => {
    const fallback = toAbsoluteAssetPath(item?.image);
    const fallbackAlt = normalizeText(item?.name || item?.id);

    if (!mediaApi?.get) {
      return {
        card: fallback,
        hover: '',
        detail: fallback,
        gallery: [],
        editorialSlides: [],
        lqip: '',
        alt: fallbackAlt,
      };
    }

    const card = toAbsoluteAssetPath(mediaApi.get(item.id, 'card'));
    const hover = toAbsoluteAssetPath(mediaApi.get(item.id, 'hover'));
    const detail = toAbsoluteAssetPath(mediaApi.get(item.id, 'modal'));
    const editorialSlides = Array.isArray(mediaApi.getEditorialSlides?.(item.id))
      ? mediaApi.getEditorialSlides(item.id)
      : [];
    const gallery = Array.isArray(mediaApi.getGallery?.(item.id))
      ? mediaApi
          .getGallery(item.id)
          .map((path) => toAbsoluteAssetPath(path))
          .filter(Boolean)
      : [];
    const lqip = normalizeText(mediaApi.getLqip?.(item.id));
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
      gallery,
      editorialSlides,
      lqip,
      alt: alt || fallbackAlt,
    };
  };

  const inferEditorialVideoSourceType = (path) => {
    const normalizedPath = normalizeText(path).toLowerCase();

    if (/\.webm(\?|#|$)/.test(normalizedPath)) {
      return 'video/webm';
    }

    if (/\.mp4(\?|#|$)/.test(normalizedPath)) {
      return 'video/mp4';
    }

    return '';
  };

  const normalizeDetailEditorialVideoSource = (source, seenSources) => {
    if (typeof source === 'string') {
      const src = toAbsoluteAssetPath(source);
      if (!src || seenSources.has(src)) {
        return null;
      }

      seenSources.add(src);
      const inferredType = inferEditorialVideoSourceType(src);
      return inferredType ? { src, type: inferredType } : { src };
    }

    if (!isObject(source)) {
      return null;
    }

    const src = toAbsoluteAssetPath(source.src || source.path);
    if (!src || seenSources.has(src)) {
      return null;
    }

    seenSources.add(src);
    const normalizedTypeRaw = normalizeText(source.type || source.mimeType).toLowerCase();
    const normalizedType =
      normalizedTypeRaw === 'video/webm' || normalizedTypeRaw === 'webm'
        ? 'video/webm'
        : normalizedTypeRaw === 'video/mp4' || normalizedTypeRaw === 'mp4'
          ? 'video/mp4'
          : inferEditorialVideoSourceType(src);

    return normalizedType ? { src, type: normalizedType } : { src };
  };

  const buildDetailEditorialSlides = (entries = [], fallbackAlt = '') =>
    (Array.isArray(entries) ? entries : [])
      .map((entry, index) => {
        const slideAlt =
          normalizeText(isObject(entry) ? entry.alt : '') ||
          (fallbackAlt
            ? `${fallbackAlt} - slide editorial ${index + 1}`
            : `Slide editorial ${index + 1}`);

        if (typeof entry === 'string') {
          const src = toAbsoluteAssetPath(entry);
          if (!src) {
            return null;
          }

          const inferredVideoType = inferEditorialVideoSourceType(src);
          if (inferredVideoType) {
            return {
              type: 'video',
              sources: [{ src, type: inferredVideoType }],
              alt: slideAlt,
            };
          }

          return {
            type: 'image',
            src,
            alt: slideAlt,
          };
        }

        if (!isObject(entry)) {
          return null;
        }

        const slideType = normalizeText(entry.type).toLowerCase() === 'video'
          ? 'video'
          : 'image';

        if (slideType === 'video') {
          const seenSources = new Set();
          let sources = (Array.isArray(entry.sources) ? entry.sources : [])
            .map((source) => normalizeDetailEditorialVideoSource(source, seenSources))
            .filter(Boolean);

          if (!sources.length) {
            sources = [
              { src: entry.webm, type: 'video/webm' },
              { src: entry.mp4, type: 'video/mp4' },
              { src: entry.src || entry.path, type: entry.mimeType },
            ]
              .map((source) => normalizeDetailEditorialVideoSource(source, seenSources))
              .filter(Boolean);
          }

          if (!sources.length) {
            return null;
          }

          return {
            type: 'video',
            alt: slideAlt,
            poster: toAbsoluteAssetPath(entry.poster),
            sources,
          };
        }

        const src = toAbsoluteAssetPath(entry.src || entry.path || entry.image);
        if (!src) {
          return null;
        }

        const inlineLqip = normalizeInlineImageDataUri(entry.lqip);

        return {
          type: 'image',
          src,
          alt: slideAlt,
          lqip: inlineLqip,
        };
      })
      .filter(Boolean);

  const resolveStaticDetailHeroAsset = (slides = []) => {
    const firstSlide = Array.isArray(slides) ? slides[0] : null;

    if (!isObject(firstSlide)) {
      return '';
    }

    if (firstSlide.type === 'video') {
      return normalizeText(firstSlide.poster);
    }

    return normalizeText(firstSlide.src);
  };

  const createDetailEditorialObserver = ({
    threshold = 0.55,
    rootMargin = '0px 0px -10% 0px',
  } = {}) => {
    if (typeof window === 'undefined' || typeof window.IntersectionObserver !== 'function') {
      return null;
    }

    const observers = new WeakMap();
    const observer = new window.IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry?.target || !entry.isIntersecting) {
          return;
        }

        if (
          typeof entry.intersectionRatio === 'number' &&
          entry.intersectionRatio < threshold
        ) {
          return;
        }

        const resolver = observers.get(entry.target);
        observers.delete(entry.target);
        observer.unobserve(entry.target);

        if (typeof resolver === 'function') {
          resolver(entry.target, entry);
        }
      });
    }, {
      root: null,
      rootMargin,
      threshold: [0, threshold, 1],
    });

    return {
      disconnect() {
        observer.disconnect();
      },
      observe(node, resolver) {
        if (!(node instanceof HTMLElement) || typeof resolver !== 'function') {
          return;
        }

        observers.set(node, resolver);
        observer.observe(node);
      },
    };
  };

  const disconnectDetailEditorialTracking = () => {
    if (detailEditorialObserver) {
      detailEditorialObserver.disconnect();
      detailEditorialObserver = null;
    }

    detailEditorialVideoCleanupFns.forEach((cleanup) => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    });
    detailEditorialVideoCleanupFns = [];
    currentDetailEditorialItem = null;
    currentDetailEditorialSlides = [];
  };

  const trackMenuEditorialEvent = (eventName, payload, { dedupeKey = '' } = {}) => {
    if (!analyticsSdk?.track || !payload || typeof payload !== 'object') {
      return Promise.resolve({ ok: false, skipped: true, eventName });
    }

    const normalizedDedupeKey = normalizeText(dedupeKey);
    if (normalizedDedupeKey && detailEditorialSeenKeys.has(normalizedDedupeKey)) {
      return Promise.resolve({ ok: true, deduped: true, eventName, payload });
    }

    if (normalizedDedupeKey) {
      detailEditorialSeenKeys.add(normalizedDedupeKey);
    }

    return analyticsSdk.track(eventName, payload);
  };

  const buildCurrentDetailEditorialPayload = (extra = {}) => {
    if (!isObject(currentDetailEditorialItem)) {
      return null;
    }

    const payload = {
      item_id: normalizeText(currentDetailEditorialItem.item_id),
      item_name: normalizeText(currentDetailEditorialItem.item_name),
      category: normalizeText(currentDetailEditorialItem.category),
    };
    const detailDepthIndex = clampNumber(
      Math.round(Number(state.detailDepthIndex) || 0),
      0,
      9
    );

    if (detailDepthIndex > 0) {
      payload.detail_depth_index = detailDepthIndex;
    }

    Object.keys(extra).forEach((key) => {
      const value = extra[key];
      if (value === undefined || value === null || value === '') {
        return;
      }
      payload[key] = value;
    });

    return payload;
  };

  const trackDetailStoryView = (storyId) => {
    const normalizedStoryId = toAnalyticsEntityId(storyId);
    const payload = buildCurrentDetailEditorialPayload({
      story_id: normalizedStoryId,
    });
    if (!payload?.story_id) {
      return;
    }

    void trackMenuEditorialEvent('item_story_view', payload, {
      dedupeKey: ['item_story_view', payload.item_id, payload.story_id].join('|'),
    });
  };

  const trackDetailPairingView = (pairingId) => {
    const normalizedPairingId = toAnalyticsEntityId(pairingId);
    const payload = buildCurrentDetailEditorialPayload({
      pairing_id: normalizedPairingId,
    });
    if (!payload?.pairing_id) {
      return;
    }

    void trackMenuEditorialEvent('item_pairing_view', payload, {
      dedupeKey: ['item_pairing_view', payload.item_id, payload.pairing_id].join('|'),
    });
  };

  const trackDetailGalleryExpand = (mediaId) => {
    const normalizedMediaId = toAnalyticsEntityId(mediaId);
    const payload = buildCurrentDetailEditorialPayload({
      media_id: normalizedMediaId,
    });
    if (!payload?.media_id) {
      return;
    }

    void trackMenuEditorialEvent('item_gallery_expand', payload, {
      dedupeKey: ['item_gallery_expand', payload.item_id, payload.media_id].join('|'),
    });
  };

  const trackDetailVideoPlay = (mediaId, mediaDurationMs) => {
    const normalizedMediaId = toAnalyticsEntityId(mediaId);
    const safeDurationMs = Math.max(1, Math.round(Number(mediaDurationMs) || 0));
    const payload = buildCurrentDetailEditorialPayload({
      media_id: normalizedMediaId,
      media_duration_ms: safeDurationMs,
    });
    if (!payload?.media_id || !(payload.media_duration_ms > 0)) {
      return;
    }

    void trackMenuEditorialEvent('item_video_play', payload, {
      dedupeKey: ['item_video_play', payload.item_id, payload.media_id].join('|'),
    });
  };

  const trackDetailVideoComplete = (mediaId, mediaDurationMs) => {
    const normalizedMediaId = toAnalyticsEntityId(mediaId);
    const safeDurationMs = Math.max(1, Math.round(Number(mediaDurationMs) || 0));
    const payload = buildCurrentDetailEditorialPayload({
      media_id: normalizedMediaId,
      media_duration_ms: safeDurationMs,
      media_percent_complete: 100,
    });
    if (!payload?.media_id || !(payload.media_duration_ms > 0)) {
      return;
    }

    void trackMenuEditorialEvent('item_video_complete', payload, {
      dedupeKey: ['item_video_complete', payload.item_id, payload.media_id, 100].join('|'),
    });
  };

  const syncDetailEditorialTracking = (detail) => {
    disconnectDetailEditorialTracking();

    if (!isObject(detail)) {
      return;
    }

    currentDetailEditorialItem = {
      item_id: normalizeText(detail.id),
      item_name: normalizeText(detail.title),
      category: normalizeText(detail.category),
    };
    currentDetailEditorialSlides = Array.isArray(detail.editorialSlides)
      ? detail.editorialSlides.slice()
      : [];

    detailEditorialObserver = createDetailEditorialObserver();

    if (detailEditorialObserver && detailHistorySection instanceof HTMLElement && !detailHistorySection.hidden) {
      const storyId = normalizeText(detail.story?.storyId || detailHistorySection.dataset.storyId);
      if (storyId) {
        detailEditorialObserver.observe(detailHistorySection, () => {
          trackDetailStoryView(storyId);
        });
      }
    }

    if (detailEditorialObserver && detailPairingsList instanceof HTMLElement && !detailPairingsList.hidden) {
      Array.from(detailPairingsList.querySelectorAll('.menu-page-detail__pairing-entry')).forEach((entryNode) => {
        if (!(entryNode instanceof HTMLElement)) {
          return;
        }

        const pairingId = normalizeText(entryNode.dataset.pairingId);
        if (!pairingId) {
          return;
        }

        detailEditorialObserver.observe(entryNode, () => {
          trackDetailPairingView(pairingId);
        });
      });
    }

    if (!(detailEditorialTrack instanceof HTMLElement)) {
      return;
    }

    Array.from(
      detailEditorialTrack.querySelectorAll('.menu-page-detail__editorial-video')
    ).forEach((videoNode) => {
      if (!(videoNode instanceof HTMLVideoElement)) {
        return;
      }

      const mediaId = normalizeText(videoNode.dataset.mediaId);
      if (!mediaId) {
        return;
      }

      const resolveDurationMs = () =>
        Number.isFinite(videoNode.duration) && videoNode.duration > 0
          ? Math.round(videoNode.duration * 1000)
          : 0;

      const handleLoadedMetadata = () => {
        if (!videoNode.paused) {
          trackDetailVideoPlay(mediaId, resolveDurationMs());
        }
      };

      const handlePlay = () => {
        trackDetailVideoPlay(mediaId, resolveDurationMs());
      };

      const handleTimeUpdate = () => {
        if (!Number.isFinite(videoNode.duration) || !(videoNode.duration > 0)) {
          return;
        }

        if (videoNode.currentTime / videoNode.duration >= 0.95) {
          trackDetailVideoComplete(mediaId, resolveDurationMs());
        }
      };

      videoNode.addEventListener('loadedmetadata', handleLoadedMetadata);
      videoNode.addEventListener('play', handlePlay);
      videoNode.addEventListener('timeupdate', handleTimeUpdate);

      detailEditorialVideoCleanupFns.push(() => {
        videoNode.removeEventListener('loadedmetadata', handleLoadedMetadata);
        videoNode.removeEventListener('play', handlePlay);
        videoNode.removeEventListener('timeupdate', handleTimeUpdate);
      });

      if (!videoNode.paused || videoNode.currentTime > 0) {
        trackDetailVideoPlay(mediaId, resolveDurationMs());
      }

      if (
        Number.isFinite(videoNode.duration) &&
        videoNode.duration > 0 &&
        videoNode.currentTime / videoNode.duration >= 0.95
      ) {
        trackDetailVideoComplete(mediaId, resolveDurationMs());
      }
    });
  };

  const trackDetailGalleryExpandByIndex = (activeIndex) => {
    const safeIndex = Math.max(0, Math.round(Number(activeIndex) || 0));
    if (safeIndex <= 0 || !Array.isArray(currentDetailEditorialSlides) || !currentDetailEditorialSlides.length) {
      return;
    }

    const slide = currentDetailEditorialSlides[safeIndex];
    if (!isObject(slide)) {
      return;
    }

    trackDetailGalleryExpand(slide.mediaId);
  };

  const markMenuListPerformanceReady = () => {
    if (!analyticsPerformance) {
      return;
    }

    analyticsPerformance.markMetric('menu_tabs_visible_ms');

    if (contentRoot instanceof HTMLElement && contentRoot.querySelector('[data-menu-item-id]')) {
      analyticsPerformance.markMetric('menu_first_row_hydrated_ms');
    }

    analyticsPerformance.markMetric('menu_full_hydration_ms');
    analyticsPerformance.markRouteReady();
  };

  const syncDetailPerformanceTracking = (detail) => {
    if (!analyticsPerformance || !isObject(detail)) {
      return;
    }

    analyticsPerformance.markMetric('detail_open_ms');

    if (
      detailAddCtaSection instanceof HTMLElement &&
      !detailAddCtaSection.hidden &&
      detailAddButton instanceof HTMLButtonElement &&
      !detailAddButton.disabled
    ) {
      analyticsPerformance.markMetric('detail_cta_ready_ms');
    }

    let routeReadyBoundToAsset = false;
    const bindAssetReady = (element, options = {}) => {
      if (!(element instanceof Element)) {
        return false;
      }

      const tracked = analyticsPerformance.trackAssetFromElement(element, {
        ...options,
        itemId: detail.id,
        itemName: detail.title,
      });

      if (tracked && typeof options.onReady === 'function' && !routeReadyBoundToAsset) {
        routeReadyBoundToAsset = true;
      }

      return tracked;
    };

    if (detailEditorialTrack instanceof HTMLElement) {
      const firstEditorialPane = detailEditorialTrack.querySelector(
        '.menu-page-detail__editorial-slide[data-slide-index="0"]'
      );

      if (firstEditorialPane instanceof HTMLElement) {
        const firstEditorialMediaId = normalizeText(firstEditorialPane.dataset.mediaId);
        const firstEditorialImage = firstEditorialPane.querySelector(
          '.menu-page-detail__editorial-image--full'
        );
        const firstEditorialVideo = firstEditorialPane.querySelector(
          '.menu-page-detail__editorial-video'
        );

        if (firstEditorialImage instanceof HTMLImageElement) {
          bindAssetReady(firstEditorialImage, {
            assetType: 'image',
            mediaId: firstEditorialMediaId,
            metricName: 'detail_image_visible_ms',
            onReady() {
              analyticsPerformance.markRouteReady();
            },
          });
        } else if (firstEditorialVideo instanceof HTMLVideoElement) {
          bindAssetReady(firstEditorialVideo, {
            assetType: 'video',
            mediaId: firstEditorialMediaId,
            metricName: 'detail_video_ready_ms',
            onReady() {
              analyticsPerformance.markRouteReady();
            },
          });
        }
      }

      Array.from(
        detailEditorialTrack.querySelectorAll('.menu-page-detail__editorial-video')
      ).forEach((videoNode) => {
        if (!(videoNode instanceof HTMLVideoElement)) {
          return;
        }

        bindAssetReady(videoNode, {
          assetType: 'video',
          mediaId: normalizeText(videoNode.dataset.mediaId),
          metricName: 'detail_video_ready_ms',
        });
      });
    }

    if (
      !routeReadyBoundToAsset &&
      detailImage instanceof HTMLImageElement &&
      !detailImage.hidden &&
      detail.image
    ) {
      bindAssetReady(detailImage, {
        assetType: 'image',
        metricName: 'detail_image_visible_ms',
        onReady() {
          analyticsPerformance.markRouteReady();
        },
      });
    }

    if (!routeReadyBoundToAsset) {
      analyticsPerformance.markRouteReady();
    }
  };

  const syncDetailEditorialVideoPlayback = (activeIndex) => {
    if (!(detailEditorialTrack instanceof HTMLElement)) {
      return;
    }

    const panes = Array.from(
      detailEditorialTrack.querySelectorAll('.menu-page-detail__editorial-slide')
    ).filter((pane) => pane instanceof HTMLElement);

    panes.forEach((pane, paneIndex) => {
      const video = pane.querySelector('.menu-page-detail__editorial-video');

      if (!(video instanceof HTMLVideoElement)) {
        return;
      }

      if (paneIndex !== activeIndex) {
        video.pause();
        return;
      }

      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
    });
  };

  const clearDetailInfoChipTooltipHideTimer = () => {
    if (!detailInfoChipTooltipHideTimerId) {
      return;
    }

    window.clearTimeout(detailInfoChipTooltipHideTimerId);
    detailInfoChipTooltipHideTimerId = 0;
  };

  const clearDetailInfoChipTooltipShowFrame = () => {
    if (!detailInfoChipTooltipShowFrameId) {
      return;
    }

    window.cancelAnimationFrame(detailInfoChipTooltipShowFrameId);
    detailInfoChipTooltipShowFrameId = 0;
  };

  const setDetailInfoChipExpanded = (chip, expanded) => {
    if (!(chip instanceof HTMLElement)) {
      return;
    }

    chip.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    chip.classList.toggle('is-tooltip-active', expanded);

    if (expanded && detailInfoChipTooltipNode?.id) {
      chip.setAttribute('aria-describedby', detailInfoChipTooltipNode.id);
      return;
    }

    chip.removeAttribute('aria-describedby');
  };

  const ensureDetailInfoChipTooltipNode = () => {
    if (
      detailInfoChipTooltipNode instanceof HTMLElement &&
      detailInfoChipTooltipTitleNode instanceof HTMLElement &&
      detailInfoChipTooltipCopyNode instanceof HTMLElement
    ) {
      return detailInfoChipTooltipNode;
    }

    const tooltip = document.createElement('div');
    tooltip.className = 'menu-page-detail__chip-tooltip';
    tooltip.id = 'menu-detail-chip-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.setAttribute('aria-hidden', 'true');
    tooltip.hidden = true;

    const title = document.createElement('p');
    title.className = 'menu-page-detail__chip-tooltip-title';
    const divider = document.createElement('div');
    divider.className = 'menu-page-detail__chip-tooltip-divider';
    divider.setAttribute('aria-hidden', 'true');
    const copy = document.createElement('p');
    copy.className = 'menu-page-detail__chip-tooltip-copy';

    tooltip.append(title, divider, copy);
    document.body.appendChild(tooltip);

    detailInfoChipTooltipNode = tooltip;
    detailInfoChipTooltipTitleNode = title;
    detailInfoChipTooltipCopyNode = copy;

    return tooltip;
  };

  const positionDetailInfoChipTooltip = () => {
    if (
      !(detailInfoChipTooltipNode instanceof HTMLElement) ||
      !(detailInfoChipTooltipAnchor instanceof HTMLElement) ||
      detailInfoChipTooltipNode.hidden
    ) {
      return;
    }

    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 390;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 844;
    const tooltipWidth = clampNumber(viewportWidth - 16, 184, 248);

    detailInfoChipTooltipNode.style.width = `${tooltipWidth}px`;

    const chipRect = detailInfoChipTooltipAnchor.getBoundingClientRect();
    const tooltipHeight = detailInfoChipTooltipNode.offsetHeight || 92;

    const desiredLeft = chipRect.left + chipRect.width / 2 - tooltipWidth / 2;
    const left = clampNumber(desiredLeft, 8, viewportWidth - tooltipWidth - 8);

    let top = chipRect.top - tooltipHeight - 12;
    let isFlipped = false;

    if (top < 8) {
      top = chipRect.bottom + 12;
      isFlipped = true;
    }

    top = clampNumber(top, 8, viewportHeight - tooltipHeight - 8);

    const arrowX = clampNumber(
      chipRect.left + chipRect.width / 2 - left,
      14,
      tooltipWidth - 14
    );

    detailInfoChipTooltipNode.style.left = `${left}px`;
    detailInfoChipTooltipNode.style.top = `${top}px`;
    detailInfoChipTooltipNode.style.setProperty(
      '--menu-detail-chip-tooltip-arrow-x',
      `${arrowX}px`
    );
    detailInfoChipTooltipNode.classList.toggle('is-flipped', isFlipped);
  };

  const hideDetailInfoChipTooltip = ({ immediate = false } = {}) => {
    if (!(detailInfoChipTooltipNode instanceof HTMLElement)) {
      return;
    }

    clearDetailInfoChipTooltipHideTimer();
    clearDetailInfoChipTooltipShowFrame();

    if (detailInfoChipTooltipAnchor instanceof HTMLElement) {
      setDetailInfoChipExpanded(detailInfoChipTooltipAnchor, false);
    }
    detailInfoChipTooltipAnchor = null;

    detailInfoChipTooltipNode.classList.remove('is-visible');
    detailInfoChipTooltipNode.setAttribute('aria-hidden', 'true');

    if (immediate) {
      detailInfoChipTooltipQueuedAnchor = null;
      detailInfoChipTooltipNode.hidden = true;
      detailInfoChipTooltipNode.classList.remove('is-flipped');
      return;
    }

    const hideDelay = detailInfoChipTooltipQueuedAnchor
      ? DETAIL_INFO_CHIP_TOOLTIP_SWITCH_EXIT_MS
      : DETAIL_INFO_CHIP_TOOLTIP_EXIT_MS;

    detailInfoChipTooltipHideTimerId = window.setTimeout(() => {
      detailInfoChipTooltipHideTimerId = 0;
      detailInfoChipTooltipNode.hidden = true;
      detailInfoChipTooltipNode.classList.remove('is-flipped');
      const queuedChip = detailInfoChipTooltipQueuedAnchor;
      detailInfoChipTooltipQueuedAnchor = null;

      if (queuedChip instanceof HTMLElement && document.contains(queuedChip)) {
        showDetailInfoChipTooltip(queuedChip);
      }
    }, hideDelay);
  };

  const showDetailInfoChipTooltip = (chip) => {
    if (!(chip instanceof HTMLElement)) {
      return;
    }

    const tooltipKey = normalizeText(chip.getAttribute('data-menu-detail-chip-tooltip'));
    const copy = getDetailChipTooltipCopy(tooltipKey);

    if (!copy) {
      return;
    }

    const tooltip = ensureDetailInfoChipTooltipNode();

    if (detailInfoChipTooltipAnchor === chip && !tooltip.hidden) {
      detailInfoChipTooltipQueuedAnchor = null;
      hideDetailInfoChipTooltip();
      return;
    }

    if (
      detailInfoChipTooltipAnchor instanceof HTMLElement &&
      detailInfoChipTooltipAnchor !== chip &&
      !tooltip.hidden
    ) {
      detailInfoChipTooltipQueuedAnchor = chip;
      hideDetailInfoChipTooltip();
      return;
    }

    if (!tooltip.hidden && !tooltip.classList.contains('is-visible')) {
      detailInfoChipTooltipQueuedAnchor = chip;
      return;
    }

    detailInfoChipTooltipQueuedAnchor = null;

    if (detailInfoChipTooltipAnchor instanceof HTMLElement) {
      setDetailInfoChipExpanded(detailInfoChipTooltipAnchor, false);
    }

    detailInfoChipTooltipAnchor = chip;
    detailInfoChipTooltipScrollY = window.scrollY || 0;

    if (detailInfoChipTooltipTitleNode instanceof HTMLElement) {
      detailInfoChipTooltipTitleNode.textContent = copy.title;
    }
    if (detailInfoChipTooltipCopyNode instanceof HTMLElement) {
      detailInfoChipTooltipCopyNode.textContent = copy.description;
    }

    clearDetailInfoChipTooltipHideTimer();
    clearDetailInfoChipTooltipShowFrame();

    setDetailInfoChipExpanded(chip, true);
    tooltip.hidden = false;
    tooltip.setAttribute('aria-hidden', 'false');
    tooltip.classList.remove('is-visible');
    tooltip.classList.remove('is-flipped');
    positionDetailInfoChipTooltip();

    detailInfoChipTooltipShowFrameId = window.requestAnimationFrame(() => {
      if (!(detailInfoChipTooltipNode instanceof HTMLElement)) {
        return;
      }

      detailInfoChipTooltipNode.classList.add('is-visible');
      detailInfoChipTooltipShowFrameId = 0;
    });
  };

  const handleDetailInfoChipPointerDown = (event) => {
    if (!(detailInfoChipTooltipAnchor instanceof HTMLElement)) {
      return;
    }

    const target = event.target;

    if (!(target instanceof Element)) {
      hideDetailInfoChipTooltip();
      return;
    }

    if (
      detailInfoChipTooltipNode instanceof HTMLElement &&
      detailInfoChipTooltipNode.contains(target)
    ) {
      return;
    }

    if (target.closest('[data-menu-detail-chip-tooltip]')) {
      return;
    }

    hideDetailInfoChipTooltip();
  };

  const handleDetailInfoChipViewportChange = () => {
    if (!(detailInfoChipTooltipAnchor instanceof HTMLElement)) {
      return;
    }

    positionDetailInfoChipTooltip();
  };

  const handleDetailInfoChipViewportScroll = () => {
    if (!(detailInfoChipTooltipAnchor instanceof HTMLElement)) {
      return;
    }

    const currentScrollY = window.scrollY || 0;

    if (
      Math.abs(currentScrollY - detailInfoChipTooltipScrollY) >=
      DETAIL_INFO_CHIP_TOOLTIP_SCROLL_CLOSE_PX
    ) {
      hideDetailInfoChipTooltip({ immediate: true });
      return;
    }

    positionDetailInfoChipTooltip();
  };

  const handleDetailInfoChipKeydown = (event) => {
    if (event.key !== 'Escape') {
      return;
    }

    if (!(detailInfoChipTooltipAnchor instanceof HTMLElement)) {
      return;
    }

    hideDetailInfoChipTooltip();
  };

  const bindDetailInfoChipTooltips = () => {
    const chips = [detailChipCalories, detailChipEta].filter(
      (chip) => chip instanceof HTMLButtonElement
    );

    if (!chips.length) {
      return;
    }

    chips.forEach((chip) => {
      chip.setAttribute('aria-expanded', 'false');
      chip.addEventListener('click', (event) => {
        event.preventDefault();
        showDetailInfoChipTooltip(chip);
      });
    });

    if (detailInfoChipTooltipBound) {
      return;
    }

    document.addEventListener('pointerdown', handleDetailInfoChipPointerDown, true);
    window.addEventListener('resize', handleDetailInfoChipViewportChange);
    window.addEventListener('scroll', handleDetailInfoChipViewportScroll, true);
    document.addEventListener('keydown', handleDetailInfoChipKeydown, true);

    detailInfoChipTooltipBound = true;
  };

  const clearDetailHeroBadgeFadeTimer = () => {
    if (!detailHeroBadgeFadeTimerId) {
      return;
    }

    window.clearTimeout(detailHeroBadgeFadeTimerId);
    detailHeroBadgeFadeTimerId = 0;
  };

  const setDetailHeroBadgeVisible = (shouldShow) => {
    if (!(detailBadge instanceof HTMLElement)) {
      return;
    }

    clearDetailHeroBadgeFadeTimer();

    if (!shouldShow) {
      detailBadge.classList.remove('is-visible');

      if (detailBadge.hidden) {
        return;
      }

      detailHeroBadgeFadeTimerId = window.setTimeout(() => {
        detailHeroBadgeFadeTimerId = 0;
        if (!detailBadge.classList.contains('is-visible')) {
          detailBadge.hidden = true;
        }
      }, DETAIL_HERO_BADGE_FADE_MS);
      return;
    }

    if (detailBadge.hidden) {
      detailBadge.hidden = false;
    }

    window.requestAnimationFrame(() => {
      detailBadge.classList.add('is-visible');
    });
  };

  const syncDetailHeroBadgeVisibility = (activeIndex = 0) => {
    if (!(detailBadge instanceof HTMLElement)) {
      return;
    }

    if (!detailHeroBadgeHasLabel) {
      clearDetailHeroBadgeFadeTimer();
      detailBadge.classList.remove('is-visible');
      detailBadge.hidden = true;
      return;
    }

    if (!detailHeroBadgeFirstSlideOnly) {
      setDetailHeroBadgeVisible(true);
      return;
    }

    setDetailHeroBadgeVisible(activeIndex === 0);
  };

  const clearDetailEditorialCarousel = () => {
    if (detailEditorialNextPrefetchTimerId) {
      window.clearTimeout(detailEditorialNextPrefetchTimerId);
      detailEditorialNextPrefetchTimerId = 0;
    }

    if (detailEditorialDotsFrameId) {
      window.cancelAnimationFrame(detailEditorialDotsFrameId);
      detailEditorialDotsFrameId = 0;
    }

    if (detailEditorialTrack instanceof HTMLElement) {
      const panes = Array.from(
        detailEditorialTrack.querySelectorAll('.menu-page-detail__editorial-slide')
      ).filter((pane) => pane instanceof HTMLElement);

      panes.forEach((pane) => {
        if (
          typeof pane._lqipFadeStartTimerId === 'number' &&
          pane._lqipFadeStartTimerId
        ) {
          window.clearTimeout(pane._lqipFadeStartTimerId);
        }
        pane._lqipFadeStartTimerId = 0;
        if (typeof pane._lqipExitTimerId === 'number' && pane._lqipExitTimerId) {
          window.clearTimeout(pane._lqipExitTimerId);
        }
        pane._lqipExitTimerId = 0;
      });

      detailEditorialTrack.onscroll = null;
      syncDetailEditorialVideoPlayback(-1);
      detailEditorialTrack.scrollLeft = 0;
      detailEditorialTrack.replaceChildren();
    }

    if (detailEditorialDots instanceof HTMLElement) {
      detailEditorialDots.hidden = true;
      detailEditorialDots.replaceChildren();
    }

    if (detailEditorialRoot instanceof HTMLElement) {
      detailEditorialRoot.hidden = true;
    }

    syncDetailHeroBadgeVisibility(0);
  };

  const setDetailEditorialActiveDot = (activeIndex) => {
    if (!(detailEditorialDots instanceof HTMLElement)) {
      return;
    }

    const dots = Array.from(
      detailEditorialDots.querySelectorAll('.menu-page-detail__editorial-dot')
    ).filter((dot) => dot instanceof HTMLButtonElement);

    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      dot.setAttribute('tabindex', isActive ? '0' : '-1');
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  };

  const getDetailEditorialActiveIndex = () => {
    if (!(detailEditorialTrack instanceof HTMLElement)) {
      return 0;
    }

    const slideWidth = detailEditorialTrack.clientWidth;

    if (!slideWidth) {
      return 0;
    }

    return Math.max(0, Math.round(detailEditorialTrack.scrollLeft / slideWidth));
  };

  const queueDetailEditorialNextImagePrefetch = (activeIndex) => {
    if (!(detailEditorialTrack instanceof HTMLElement)) {
      return;
    }

    if (!Number.isInteger(activeIndex) || activeIndex < 0) {
      return;
    }

    if (detailEditorialNextPrefetchTimerId) {
      window.clearTimeout(detailEditorialNextPrefetchTimerId);
    }

    detailEditorialNextPrefetchTimerId = window.setTimeout(() => {
      detailEditorialNextPrefetchTimerId = 0;

      const panes = Array.from(
        detailEditorialTrack.querySelectorAll('.menu-page-detail__editorial-slide')
      ).filter((pane) => pane instanceof HTMLElement);

      if (!panes.length) {
        return;
      }

      let nextImagePane = null;

      for (let offset = 1; offset < panes.length + 1; offset += 1) {
        const nextIndex = (activeIndex + offset) % panes.length;
        const candidate = panes[nextIndex];

        if (
          candidate?.getAttribute('data-slide-type') === 'image' &&
          !candidate.classList.contains('is-full-ready')
        ) {
          nextImagePane = candidate;
          break;
        }
      }

      if (!nextImagePane) {
        return;
      }

      requestDetailEditorialImageLoad(nextImagePane, { prioritize: false });
    }, DETAIL_NEXT_IMAGE_PREFETCH_DELAY_MS);
  };

  const requestDetailEditorialImageLoad = (
    pane,
    { prioritize = false } = {}
  ) => {
    if (!(pane instanceof HTMLElement)) {
      return;
    }

    const fullImage = pane.querySelector('.menu-page-detail__editorial-image--full');
    if (!(fullImage instanceof HTMLImageElement)) {
      return;
    }

    if (prioritize) {
      fullImage.loading = 'eager';
      fullImage.fetchPriority = 'high';
      fullImage.setAttribute('fetchpriority', 'high');
    }

    if (fullImage.dataset.requested === 'true') {
      return;
    }

    const sourcePath = normalizeText(fullImage.dataset.src);
    if (!sourcePath) {
      return;
    }

    fullImage.dataset.requested = 'true';

    const handleLoad = () => {
      fullImage.dataset.loaded = 'true';
      window.requestAnimationFrame(() => {
        pane.classList.add('is-full-ready');
      });

      const lqipImage = pane.querySelector('.menu-page-detail__editorial-image--lqip');
      if (lqipImage instanceof HTMLImageElement) {
        pane.classList.remove('is-lqip-visible');

        if (
          typeof pane._lqipFadeStartTimerId === 'number' &&
          pane._lqipFadeStartTimerId
        ) {
          window.clearTimeout(pane._lqipFadeStartTimerId);
        }

        if (typeof pane._lqipExitTimerId === 'number' && pane._lqipExitTimerId) {
          window.clearTimeout(pane._lqipExitTimerId);
        }

        pane._lqipFadeStartTimerId = window.setTimeout(() => {
          pane._lqipFadeStartTimerId = 0;
          if (!pane.classList.contains('is-full-ready')) {
            return;
          }
          pane.classList.add('is-lqip-fading');
          pane.classList.remove('is-lqip-visible');
        }, DETAIL_LQIP_EXIT_DELAY_MS);

        pane._lqipExitTimerId = window.setTimeout(() => {
          pane._lqipExitTimerId = 0;
          if (pane.classList.contains('is-full-ready')) {
            lqipImage.hidden = true;
            pane.classList.remove('is-lqip-fading');
          }
        }, DETAIL_LQIP_EXIT_DELAY_MS + DETAIL_LQIP_EXIT_FADE_MS + 40);
      }

      if (pane.classList.contains('is-active')) {
        const activeIndex = Number.parseInt(
          pane.getAttribute('data-slide-index') || '',
          10
        );
        if (Number.isInteger(activeIndex) && activeIndex >= 0) {
          queueDetailEditorialNextImagePrefetch(activeIndex);
        }
      }
    };

    const handleError = () => {
      fullImage.dataset.error = 'true';
      pane.classList.add('is-full-error');
      pane.classList.remove('is-lqip-visible', 'is-lqip-fading');
    };

    fullImage.addEventListener('load', handleLoad, { once: true });
    fullImage.addEventListener('error', handleError, { once: true });
    fullImage.src = sourcePath;

    if (fullImage.complete) {
      if (fullImage.naturalWidth > 0) {
        handleLoad();
      } else {
        handleError();
      }
    }
  };

  const syncDetailEditorialImageSlides = (
    activeIndex,
    { prioritizeActive = true } = {}
  ) => {
    if (!(detailEditorialTrack instanceof HTMLElement)) {
      return;
    }

    const panes = Array.from(
      detailEditorialTrack.querySelectorAll('.menu-page-detail__editorial-slide')
    ).filter((pane) => pane instanceof HTMLElement);

    panes.forEach((pane, paneIndex) => {
      const isImageSlide = pane.getAttribute('data-slide-type') === 'image';
      if (!isImageSlide) {
        return;
      }

      const isActive = paneIndex === activeIndex;
      pane.classList.toggle('is-active', isActive);

      const lqipImage = pane.querySelector('.menu-page-detail__editorial-image--lqip');
      const hasLqip = lqipImage instanceof HTMLImageElement;
      const isFullReady = pane.classList.contains('is-full-ready');

      if (hasLqip) {
        if (isActive && !isFullReady) {
          if (
            typeof pane._lqipFadeStartTimerId === 'number' &&
            pane._lqipFadeStartTimerId
          ) {
            window.clearTimeout(pane._lqipFadeStartTimerId);
            pane._lqipFadeStartTimerId = 0;
          }
          pane.classList.remove('is-lqip-fading');
          lqipImage.hidden = false;
          pane.classList.add('is-lqip-visible');
        } else if (!isFullReady) {
          lqipImage.hidden = true;
          pane.classList.remove('is-lqip-visible', 'is-lqip-fading');
        }
      }

      if (!isActive) {
        return;
      }

      requestDetailEditorialImageLoad(pane, {
        prioritize: prioritizeActive,
      });

      if (isFullReady) {
        queueDetailEditorialNextImagePrefetch(paneIndex);
      }
    });
  };

  const renderDetailEditorialCarousel = (slides = []) => {
    if (
      !(detailEditorialRoot instanceof HTMLElement) ||
      !(detailEditorialTrack instanceof HTMLElement) ||
      !(detailEditorialDots instanceof HTMLElement)
    ) {
      return false;
    }

    clearDetailEditorialCarousel();

    if (!Array.isArray(slides) || !slides.length) {
      return false;
    }

    const trackFragment = document.createDocumentFragment();

    slides.forEach((slide, index) => {
      const pane = document.createElement('figure');
      pane.className = 'menu-page-detail__editorial-slide';
      pane.setAttribute('data-slide-index', String(index));
      pane.dataset.mediaId = normalizeText(slide.mediaId);

      if (slide.type === 'video') {
        pane.setAttribute('data-slide-type', 'video');

        const video = document.createElement('video');
        video.className = 'menu-page-detail__editorial-video';
        video.dataset.mediaId = normalizeText(slide.mediaId);
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = 'metadata';
        video.setAttribute('muted', '');
        video.setAttribute('loop', '');
        video.setAttribute('playsinline', '');
        video.setAttribute('preload', 'metadata');

        const normalizedPoster = toAbsoluteAssetPath(slide.poster);
        if (normalizedPoster) {
          video.poster = normalizedPoster;
        }

        const normalizedAlt = normalizeText(slide.alt);
        if (normalizedAlt) {
          video.setAttribute('aria-label', normalizedAlt);
        }

        const sources = Array.isArray(slide.sources) ? slide.sources : [];
        sources.forEach((source) => {
          if (!source?.src) {
            return;
          }

          const sourceNode = document.createElement('source');
          sourceNode.src = source.src;
          if (source.type) {
            sourceNode.type = source.type;
          }
          video.appendChild(sourceNode);
        });

        pane.appendChild(video);
      } else {
        pane.setAttribute('data-slide-type', 'image');

        const lqip = normalizeInlineImageDataUri(slide.lqip);
        if (lqip) {
          const lqipImage = document.createElement('img');
          lqipImage.className =
            'menu-page-detail__editorial-image menu-page-detail__editorial-image--lqip';
          lqipImage.src = lqip;
          lqipImage.alt = '';
          lqipImage.decoding = 'async';
          lqipImage.hidden = true;
          pane.classList.add('has-lqip');
          pane.appendChild(lqipImage);
        }

        const image = document.createElement('img');
        image.className =
          'menu-page-detail__editorial-image menu-page-detail__editorial-image--full';
        image.alt = normalizeText(slide.alt);
        image.decoding = 'async';
        image.loading = index === 0 ? 'eager' : 'lazy';
        image.fetchPriority = index === 0 ? 'high' : 'auto';
        image.setAttribute('fetchpriority', index === 0 ? 'high' : 'auto');
        image.dataset.src = slide.src;
        pane.appendChild(image);
      }

      trackFragment.appendChild(pane);
    });

    detailEditorialTrack.appendChild(trackFragment);
    detailEditorialRoot.hidden = false;

    if (slides.length > 1) {
      const dotsFragment = document.createDocumentFragment();

      slides.forEach((slide, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'menu-page-detail__editorial-dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute(
          'aria-label',
          `Ver slide ${index + 1} de ${slides.length}`
        );
        dot.addEventListener('click', () => {
          syncDetailEditorialImageSlides(index, { prioritizeActive: true });
          const slideWidth = detailEditorialTrack.clientWidth || 1;
          detailEditorialTrack.scrollTo({
            left: slideWidth * index,
            behavior: reducedMotionQuery.matches ? 'auto' : 'smooth',
          });
          trackDetailGalleryExpandByIndex(index);
          setDetailEditorialActiveDot(index);
          syncDetailEditorialVideoPlayback(index);
          syncDetailHeroBadgeVisibility(index);
        });
        dotsFragment.appendChild(dot);
      });

      detailEditorialDots.appendChild(dotsFragment);
      detailEditorialDots.hidden = false;
    }

    detailEditorialTrack.scrollLeft = 0;
    setDetailEditorialActiveDot(0);
    syncDetailEditorialVideoPlayback(0);
    syncDetailHeroBadgeVisibility(0);
    syncDetailEditorialImageSlides(0, { prioritizeActive: true });

    detailEditorialTrack.onscroll = () => {
      if (detailEditorialDotsFrameId) {
        return;
      }

      detailEditorialDotsFrameId = window.requestAnimationFrame(() => {
        detailEditorialDotsFrameId = 0;
        const activeIndex = getDetailEditorialActiveIndex();
        trackDetailGalleryExpandByIndex(activeIndex);
        setDetailEditorialActiveDot(activeIndex);
        syncDetailEditorialVideoPlayback(activeIndex);
        syncDetailHeroBadgeVisibility(activeIndex);
        syncDetailEditorialImageSlides(activeIndex);
      });
    };

    return true;
  };

  const toCardViewModel = (item) => {
    const media = resolveItemMedia(item);
    const isAvailable = item?.available !== false;
    const soldOutReason = normalizeText(item?.soldOutReason);
    const categoryId = normalizeText(item?.category);
    const categoryLabel =
      normalizeText(item?.categoryLabel || resolveCategoryLabel(categoryId)) ||
      formatFallbackLabel(categoryId);

    return {
      id: normalizeText(item?.id),
      title: normalizeText(item?.name || item?.id),
      category: categoryId,
      categoryLabel,
      description: resolveItemDescriptionText(item),
      price: normalizeText(item?.priceFormatted),
      available: isAvailable,
      meta: !isAvailable ? soldOutReason || 'No disponible' : '',
      image: media.card,
      hoverImage: media.hover,
      lqip: media.lqip,
      imageAlt: media.alt,
    };
  };

  const hydrateDetailEditorialSlidesWithLqip = (itemId, slides = []) =>
    (Array.isArray(slides) ? slides : []).map((slide) => {
      if (!isObject(slide) || slide.type !== 'image') {
        return slide;
      }

      const inlineLqip =
        normalizeInlineImageDataUri(slide.lqip) ||
        normalizeInlineImageDataUri(
          mediaApi?.getDetailSlideLqip?.(itemId, slide.src)
        );

      if (!inlineLqip) {
        return {
          ...slide,
          lqip: '',
        };
      }

      return {
        ...slide,
        lqip: inlineLqip,
      };
    });

  const toDetailViewModel = async (item) => {
    const media = resolveItemMedia(item);
    const editorial = resolveDetailEditorialModel(item);
    const editorialAltBase = normalizeText(media.alt || item?.name || item?.id);
    const categoryId = normalizeText(item?.category);
    const categoryLabel =
      normalizeText(item?.categoryLabel || resolveCategoryLabel(categoryId)) ||
      formatFallbackLabel(categoryId);
    const manualEditorialSlides = buildDetailEditorialSlides(media.editorialSlides, editorialAltBase);
    const manualSlidesIncludeVideo = manualEditorialSlides.some((slide) => slide?.type === 'video');
    const configuredGallerySlides = buildDetailEditorialSlides(
      Array.isArray(media.gallery) ? media.gallery.slice() : [],
      editorialAltBase
    );
    let editorialSlides = manualSlidesIncludeVideo
      ? manualEditorialSlides
      : configuredGallerySlides.length
        ? configuredGallerySlides
        : manualEditorialSlides;

    editorialSlides = hydrateDetailEditorialSlidesWithLqip(item?.id, editorialSlides);
    editorialSlides = editorialSlides.map((slide, index) => ({
      ...slide,
      mediaId: buildDetailMediaId(item?.id, slide, index),
    }));
    const staticDetailHeroAsset = resolveStaticDetailHeroAsset(editorialSlides);

    const homeMenuDetailContext = await loadHomeMenuDetailContext();
    const globalSensorySubtitle = normalizeText(homeMenuDetailContext?.sensorySubtitle);

    const badges = Array.isArray(item?.public_badges?.flat)
      ? item.public_badges.flat
      : [];
    return {
      id: normalizeText(item?.id),
      title: normalizeText(item?.name || item?.id),
      category: categoryId,
      categoryLabel,
      description: resolveItemDescriptionText(item),
      price: formatDetailPrice(item),
      reviews: normalizeText(item?.reviews),
      calories: item?.metrics?.calories ?? item?.nutrition?.calories ?? item?.calories,
      etaMinutes:
        item?.metrics?.etaMinutes ??
        item?.serviceEtaMinutes ??
        item?.estimatedServeMinutes ??
        item?.etaMinutes,
      rating:
        item?.metrics?.rating ??
        item?.rating ??
        item?.averageRating ??
        item?.ratingAverage,
      available: item?.available !== false,
      soldOutReason: normalizeText(item?.soldOutReason),
      badges,
      ingredients: Array.isArray(item?.ingredients) ? item.ingredients : [],
      allergens: Array.isArray(item?.allergens) ? item.allergens : [],
      sensoryProfile: isObject(item?.sensory_profile) ? item.sensory_profile : null,
      sensoryIntro: globalSensorySubtitle || editorial.sensoryIntro,
      compareMode: editorial.compareMode,
      sectionVisibility: editorial.sectionVisibility,
      pairings: editorial.pairings,
      story: editorial.story,
      image: staticDetailHeroAsset,
      imageAlt: media.alt,
      editorialSlides,
    };
  };

  const normalizeMetricNumber = (value) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const normalized = value.replace(',', '.').match(/-?\d+(\.\d+)?/);
      const parsed = normalized ? Number(normalized[0]) : NaN;
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  };

  const formatDetailMetrics = (detail) => {
    const caloriesRaw = normalizeMetricNumber(detail?.calories);
    const etaRaw = normalizeMetricNumber(detail?.etaMinutes);
    const ratingRaw = normalizeMetricNumber(detail?.rating);

    const calories = Math.max(1, Math.round(caloriesRaw ?? DETAIL_MVP_METRICS.calories));
    const etaMinutes = Math.max(1, Math.round(etaRaw ?? DETAIL_MVP_METRICS.etaMinutes));
    const rating = Math.max(1, Math.min(5, ratingRaw ?? DETAIL_MVP_METRICS.rating));

    return {
      calories: `${calories} cals`,
      eta: `${etaMinutes} mins`,
      rating: rating.toFixed(1),
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

  const setTabsOverflowState = () => {
    const maxScrollLeft = Math.max(0, tabRoot.scrollWidth - tabRoot.clientWidth);
    const overflowing = maxScrollLeft > 1;
    const hasLeftOverflow = overflowing && tabRoot.scrollLeft > 1;
    const hasRightOverflow = overflowing && tabRoot.scrollLeft < maxScrollLeft - 1;

    tabRoot.dataset.overflowing = overflowing ? 'true' : 'false';
    tabRoot.dataset.overflowLeft = hasLeftOverflow ? 'true' : 'false';
    tabRoot.dataset.overflowRight = hasRightOverflow ? 'true' : 'false';
  };

  const scheduleTabsOverflowSync = () => {
    if (state.tabsOverflowFrameId) {
      return;
    }

    state.tabsOverflowFrameId = window.requestAnimationFrame(() => {
      state.tabsOverflowFrameId = 0;
      setTabsOverflowState();
    });
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

    scheduleTabsOverflowSync();

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
    setTabsOverflowState();
    tabRoot.addEventListener('scroll', scheduleTabsOverflowSync, { passive: true });

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

  const openDetailFromListCard = (itemId, detailOrigin = MENU_DETAIL_ORIGIN_GRID) => {
    const normalizedItemId = normalizeText(itemId);

    if (!normalizedItemId) {
      return;
    }

    const detailUrl = toMenuDetailUrl(normalizedItemId);
    const currentState = toHistoryStateObject(window.history.state);
    const sourceItem = state.itemsById.get(normalizedItemId);
    const returnCategoryId =
      normalizeText(state.activeCategoryId) || resolveGroupIdByItem(sourceItem);
    const returnScrollY = Math.max(0, Math.round(window.scrollY || 0));

    window.history.replaceState(
      {
        ...currentState,
        menuListContext: {
          categoryId: returnCategoryId,
          scrollY: returnScrollY,
        },
      },
      '',
      window.location.href
    );

    window.history.pushState(
      {
        item: normalizedItemId,
        fromMenuList: true,
        returnCategoryId,
        returnScrollY,
        detailOrigin: normalizeText(detailOrigin) || MENU_DETAIL_ORIGIN_GRID,
        detailDepthIndex: 1,
      },
      '',
      detailUrl
    );
    void runMenuRouteViewTransition(() => renderRouteFromLocation(), {
      direction: MENU_ROUTE_VIEW_TRANSITION_FORWARD,
    });
  };

  const getCardParts = (root) => {
    const article =
      root instanceof HTMLElement && root.classList.contains('mas-pedidas-card')
        ? root
        : root.querySelector('.mas-pedidas-card');
    const mediaContainer = root.querySelector('.mas-pedidas-card__media');
    const lqipImage = root.querySelector('.mas-pedidas-card__lqip');
    const baseImage = root.querySelector('.mas-pedidas-card__image--base');
    const hoverImage = root.querySelector('.mas-pedidas-card__image--hover');
    const title = root.querySelector('.mas-pedidas-card__title');
    const description = root.querySelector('.mas-pedidas-card__description');
    const metaRow = root.querySelector('.mas-pedidas-card__meta-row');
    const meta = root.querySelector('.mas-pedidas-card__meta');
    const price = root.querySelector('.mas-pedidas-card__price');
    const cardActionButton = root.querySelector('.mas-pedidas-card__button');

    if (
      !(article instanceof HTMLElement) ||
      !(mediaContainer instanceof HTMLElement) ||
      !(lqipImage instanceof HTMLImageElement) ||
      !(baseImage instanceof HTMLImageElement) ||
      !(hoverImage instanceof HTMLImageElement) ||
      !(title instanceof HTMLElement) ||
      !(description instanceof HTMLElement) ||
      !(metaRow instanceof HTMLElement) ||
      !(meta instanceof HTMLElement) ||
      !(price instanceof HTMLElement) ||
      !(cardActionButton instanceof HTMLButtonElement)
    ) {
      return null;
    }

    return {
      article,
      mediaContainer,
      lqipImage,
      baseImage,
      hoverImage,
      title,
      description,
      metaRow,
      meta,
      price,
      cardActionButton,
    };
  };

  const canTrackCatalogItem = (itemId) =>
    Boolean(itemId) && !normalizeText(itemId).startsWith('__menu-seed-');

  const getMenuCardListContext = (article) => {
    if (!(article instanceof HTMLElement)) {
      return {
        listId: 'menu_catalog',
        listName: 'Menu',
        listPosition: 0,
      };
    }

    const grid = article.parentElement;
    const section = article.closest('.menu-page-category');
    const subgroup = article.closest('.menu-page-category__subgroup');
    const sectionId = normalizeText(section?.getAttribute('data-category-id'));
    const sectionTitle = normalizeText(
      section?.querySelector('.menu-page-category__title')?.textContent
    );
    const subgroupId = normalizeText(subgroup?.dataset.sourceCategoryId);
    const subgroupTitle = normalizeText(
      subgroup?.querySelector('.menu-page-category__subgroup-title')?.textContent
    );
    const isSearchList = !section && normalizeText(state.renderedSearchQuery);
    const trackableSiblings =
      grid instanceof HTMLElement
        ? Array.from(grid.querySelectorAll('.mas-pedidas-card[data-menu-item-id]')).filter(
            (node) => canTrackCatalogItem(node.getAttribute('data-menu-item-id'))
          )
        : [];

    if (isSearchList) {
      return {
        listId: MENU_IMPRESSION_LIST_SEARCH,
        listName: MENU_IMPRESSION_LIST_SEARCH_NAME,
        listPosition: trackableSiblings.indexOf(article) + 1,
      };
    }

    if (sectionId && subgroupId) {
      return {
        listId: `menu_${sectionId}_${subgroupId}`,
        listName: subgroupTitle || sectionTitle || subgroupId,
        listPosition: trackableSiblings.indexOf(article) + 1,
      };
    }

    if (sectionId) {
      return {
        listId: `menu_${sectionId}`,
        listName: sectionTitle || sectionId,
        listPosition: trackableSiblings.indexOf(article) + 1,
      };
    }

    return {
      listId: 'menu_catalog',
      listName: 'Menu',
      listPosition: trackableSiblings.indexOf(article) + 1,
    };
  };

  const observeMenuCardImpression = (article, item) => {
    const itemId = normalizeText(item?.id || article?.dataset?.menuItemId);

    if (!menuCommerceImpressionObserver || !(article instanceof HTMLElement) || !canTrackCatalogItem(itemId)) {
      return;
    }

    const registerObservation = (attempt = 0) => {
      if (!(article instanceof HTMLElement)) {
        return;
      }

      if (!article.isConnected) {
        if (attempt >= 8) {
          return;
        }

        window.requestAnimationFrame(() => {
          registerObservation(attempt + 1);
        });
        return;
      }

      menuCommerceImpressionObserver.observe(article, (node) => {
        const listContext = getMenuCardListContext(node);

        if (!listContext.listPosition || !listContext.listId || !listContext.listName) {
          return null;
        }

        return {
          item,
          context: {
            listId: listContext.listId,
            listName: listContext.listName,
            listPosition: listContext.listPosition,
          },
        };
      });
    };

    registerObservation();
  };

  const syncCardInteractionState = (
    { article, cardActionButton },
    nextCard,
    { skeleton = false } = {}
  ) => {
    const mobileCardInteractive = isMobileCardViewport();
    const isInteractive = !skeleton;

    article.classList.toggle('is-mobile-interactive', isInteractive && mobileCardInteractive);
    article.classList.toggle('is-skeleton', skeleton);
    article.setAttribute('data-card-state', skeleton ? 'skeleton' : 'ready');

    if (skeleton) {
      article.setAttribute('aria-hidden', 'true');
    } else {
      article.removeAttribute('aria-hidden');
    }

    if (isInteractive && mobileCardInteractive) {
      article.setAttribute('role', 'button');
      article.tabIndex = 0;
      article.setAttribute('aria-label', `Ver ${nextCard.title}`);
    } else {
      article.removeAttribute('role');
      article.removeAttribute('tabindex');
      article.removeAttribute('aria-label');
    }

    cardActionButton.disabled = skeleton;
    cardActionButton.tabIndex = skeleton ? -1 : 0;
    cardActionButton.setAttribute('aria-hidden', skeleton ? 'true' : 'false');
  };

  const bindCardInteractions = (
    { article, baseImage, hoverImage, cardActionButton },
    nextCard
  ) => {
    if (article.dataset.cardInteractionsBound === 'true') {
      return;
    }

    article.dataset.cardInteractionsBound = 'true';

    cardActionButton.addEventListener('click', (event) => {
      if (isMobileCardViewport()) {
        event.preventDefault();
        event.stopPropagation();

        if (nextCard.available === false) {
          openDetailFromListCard(nextCard.id, MENU_DETAIL_ORIGIN_GRID);
          return;
        }

        const sourceImage = resolveCardAddSourceImage(baseImage, hoverImage);
        void runMenuCartVisualAdd(sourceImage, nextCard.id, DETAIL_ADD_QTY_MIN, {
          detailOrigin: MENU_DETAIL_ORIGIN_GRID,
        });
        return;
      }

      openDetailFromListCard(nextCard.id, MENU_DETAIL_ORIGIN_GRID);
    });

    cardActionButton.addEventListener('keydown', (event) => {
      if (!isMobileCardViewport()) {
        return;
      }

      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (nextCard.available === false) {
        openDetailFromListCard(nextCard.id, MENU_DETAIL_ORIGIN_GRID);
        return;
      }

      const sourceImage = resolveCardAddSourceImage(baseImage, hoverImage);
      void runMenuCartVisualAdd(sourceImage, nextCard.id, DETAIL_ADD_QTY_MIN, {
        detailOrigin: MENU_DETAIL_ORIGIN_GRID,
      });
    });

    article.addEventListener('click', (event) => {
      if (!isMobileCardViewport() || event.defaultPrevented) {
        return;
      }

      const target = event.target;
      if (target instanceof Element && target.closest('.mas-pedidas-card__button')) {
        return;
      }

      openDetailFromListCard(nextCard.id, MENU_DETAIL_ORIGIN_GRID);
    });

    article.addEventListener('keydown', (event) => {
      if (!isMobileCardViewport()) {
        return;
      }

      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }

      event.preventDefault();
      openDetailFromListCard(nextCard.id, MENU_DETAIL_ORIGIN_GRID);
    });

    article.addEventListener(
      'pointerenter',
      () => {
        if (mediaApi?.prefetch) {
          mediaApi.prefetch(nextCard.id, 'modal');
        }
      },
      { once: true }
    );
  };

  const clearCardLqipTimers = (mediaContainer) => {
    if (!(mediaContainer instanceof HTMLElement)) {
      return;
    }

    if (typeof mediaContainer._lqipBlurTimerId === 'number' && mediaContainer._lqipBlurTimerId) {
      window.clearTimeout(mediaContainer._lqipBlurTimerId);
    }
    mediaContainer._lqipBlurTimerId = 0;

    if (typeof mediaContainer._lqipFadeTimerId === 'number' && mediaContainer._lqipFadeTimerId) {
      window.clearTimeout(mediaContainer._lqipFadeTimerId);
    }
    mediaContainer._lqipFadeTimerId = 0;
  };

  const settleCardMediaReady = ({ mediaContainer, lqipImage }) => {
    if (!(mediaContainer instanceof HTMLElement)) {
      return;
    }

    const alreadyReady = mediaContainer.classList.contains('is-media-ready');
    const lqipSrc = normalizeText(
      lqipImage instanceof HTMLImageElement ? lqipImage.getAttribute('src') : ''
    );
    const lqipStillVisible =
      lqipImage instanceof HTMLImageElement &&
      !lqipImage.hidden &&
      Boolean(lqipSrc);

    if (mediaContainer._hasSettledMediaLoad && alreadyReady && !lqipStillVisible) {
      return;
    }

    const hasLqip = lqipStillVisible;

    clearCardLqipTimers(mediaContainer);
    mediaContainer._hasSettledMediaLoad = true;
    mediaContainer.classList.remove('is-media-loading');

    if (hasLqip) {
      mediaContainer.classList.remove('is-lqip-visible');
    }

    window.requestAnimationFrame(() => {
      mediaContainer.classList.add('is-media-ready');
    });

    if (!hasLqip || !(lqipImage instanceof HTMLImageElement)) {
      return;
    }

    mediaContainer._lqipBlurTimerId = window.setTimeout(() => {
      if (mediaContainer.classList.contains('is-media-ready')) {
        mediaContainer.classList.add('is-lqip-fading');
        mediaContainer.classList.remove('is-lqip-visible');
      }
      mediaContainer._lqipBlurTimerId = 0;
    }, CARD_LQIP_EXIT_DELAY_MS);

    mediaContainer._lqipFadeTimerId = window.setTimeout(() => {
      if (mediaContainer.classList.contains('is-media-ready')) {
        lqipImage.hidden = true;
        lqipImage.removeAttribute('src');
        mediaContainer.classList.remove(
          'has-lqip',
          'is-lqip-fading',
          'is-lqip-visible'
        );
      }
      mediaContainer._lqipFadeTimerId = 0;
    }, CARD_LQIP_EXIT_DELAY_MS + CARD_LQIP_EXIT_FADE_MS + 40);
  };

  const settleCardMediaError = ({ mediaContainer }) => {
    if (!(mediaContainer instanceof HTMLElement) || mediaContainer._hasSettledMediaLoad) {
      return;
    }

    mediaContainer._hasSettledMediaLoad = true;
    mediaContainer.classList.remove('is-media-loading');
    mediaContainer.classList.remove(
      'is-media-ready',
      'is-lqip-visible',
      'is-lqip-fading'
    );
  };

  const reconcileCardMediaState = (root) => {
    const parts = getCardParts(root);
    if (!parts) {
      return;
    }

    const { mediaContainer, baseImage } = parts;

    if (
      !(mediaContainer instanceof HTMLElement) ||
      !(baseImage instanceof HTMLImageElement) ||
      baseImage.hidden
    ) {
      return;
    }

    const baseSrc = normalizeText(baseImage.getAttribute('src'));
    if (!baseSrc) {
      return;
    }

    if (baseImage.complete) {
      if (baseImage.naturalWidth > 0) {
        settleCardMediaReady(parts);
      } else {
        settleCardMediaError(parts);
      }
    }
  };

  const reconcileCatalogCardMediaStates = (root = contentRoot) => {
    if (!(root instanceof HTMLElement)) {
      return;
    }

    Array.from(root.querySelectorAll('.mas-pedidas-card')).forEach((cardNode) => {
      if (!(cardNode instanceof HTMLElement)) {
        return;
      }

      reconcileCardMediaState(cardNode);
    });
  };

  const hasPendingCatalogCardMedia = (root = contentRoot) => {
    if (!(root instanceof HTMLElement)) {
      return false;
    }

    return Array.from(root.querySelectorAll('.mas-pedidas-card')).some((cardNode) => {
      const parts = getCardParts(cardNode);
      if (!parts) {
        return false;
      }

      const baseSrc = normalizeText(parts.baseImage.getAttribute('src'));
      if (parts.baseImage.hidden || !baseSrc) {
        return false;
      }

      return !parts.mediaContainer.classList.contains('is-media-ready');
    });
  };

  const scheduleCatalogCardMediaRecovery = (
    root = contentRoot,
    {
      maxAttempts = CATALOG_CARD_MEDIA_RECOVERY_MAX_ATTEMPTS,
      intervalMs = CATALOG_CARD_MEDIA_RECOVERY_INTERVAL_MS,
    } = {}
  ) => {
    if (!(root instanceof HTMLElement)) {
      return;
    }

    const recoveryToken = ++catalogCardMediaRecoveryToken;

    const runAttempt = (attempt) => {
      if (recoveryToken !== catalogCardMediaRecoveryToken) {
        return;
      }

      reconcileCatalogCardMediaStates(root);

      if (attempt >= maxAttempts || !hasPendingCatalogCardMedia(root)) {
        return;
      }

      window.setTimeout(() => {
        runAttempt(attempt + 1);
      }, intervalMs);
    };

    runAttempt(0);
  };

  const populateCardNode = (
    {
      article,
      mediaContainer,
      lqipImage,
      baseImage,
      hoverImage,
      title,
      description,
      metaRow,
      meta,
      price,
      cardActionButton,
    },
    nextCard,
    {
      prioritizeImage: shouldPrioritizeImage = false,
      skeleton = false,
    } = {}
  ) => {
    const allowHoverImage = supportsCardHoverMedia();
    const resetLqipLayer = () => {
      clearCardLqipTimers(mediaContainer);
      mediaContainer._hasSettledMediaLoad = false;
      mediaContainer.classList.remove(
        'has-lqip',
        'is-lqip-visible',
        'is-media-ready',
        'is-lqip-fading'
      );
      lqipImage.hidden = true;
      lqipImage.removeAttribute('src');
    };

    title.textContent = nextCard.title;
    description.textContent = nextCard.description || '';
    price.textContent = formatCardPrice(nextCard.price);
    meta.textContent = normalizeText(nextCard.meta);
    metaRow.hidden = !meta.textContent;
    article.dataset.menuItemId = normalizeText(nextCard.id);
    article.classList.toggle('is-unavailable', !nextCard.available);
    article.classList.toggle('has-meta', !metaRow.hidden);
    mediaContainer.classList.remove('is-empty');

    syncCardInteractionState(
      { article, cardActionButton },
      nextCard,
      { skeleton }
    );

    if (skeleton) {
      mediaContainer.classList.remove('is-media-loading');
      resetLqipLayer();
      baseImage.hidden = true;
      baseImage.removeAttribute('src');
      baseImage.removeAttribute('fetchpriority');
      hoverImage.hidden = true;
      hoverImage.removeAttribute('src');
      return;
    }

    if (nextCard.image) {
      const hasLqip = Boolean(normalizeText(nextCard.lqip));
      clearCardLqipTimers(mediaContainer);
      mediaContainer._hasSettledMediaLoad = false;
      mediaContainer.classList.remove('is-media-ready', 'is-lqip-fading');

      if (hasLqip) {
        lqipImage.src = nextCard.lqip;
        lqipImage.alt = '';
        lqipImage.decoding = 'async';
        lqipImage.hidden = false;
        mediaContainer.classList.add('has-lqip', 'is-lqip-visible');
      } else {
        resetLqipLayer();
      }

      const clearMediaLoading = () => {
        mediaContainer.classList.remove('is-media-loading');
      };
      const handleMediaLoaded = () => {
        clearMediaLoading();
        settleCardMediaReady({ mediaContainer, lqipImage });
      };
      const handleMediaError = () => {
        clearMediaLoading();
        settleCardMediaError({ mediaContainer });
      };

      mediaContainer.classList.add('is-media-loading');
      baseImage.alt = nextCard.imageAlt || nextCard.title;
      baseImage.loading = shouldPrioritizeImage ? 'eager' : 'lazy';
      baseImage.fetchPriority = shouldPrioritizeImage ? 'high' : 'auto';
      baseImage.setAttribute('fetchpriority', shouldPrioritizeImage ? 'high' : 'auto');
      baseImage.decoding = 'async';
      baseImage.hidden = false;
      baseImage.addEventListener('load', handleMediaLoaded, { once: true });
      baseImage.addEventListener('error', handleMediaError, { once: true });
      baseImage.src = nextCard.image;

      if (baseImage.complete) {
        if (baseImage.naturalWidth > 0) {
          handleMediaLoaded();
        } else {
          handleMediaError();
        }
      }

      if (allowHoverImage && nextCard.hoverImage && nextCard.hoverImage !== nextCard.image) {
        hoverImage.src = nextCard.hoverImage;
        hoverImage.alt = '';
        hoverImage.loading = 'lazy';
        hoverImage.decoding = 'async';
        hoverImage.hidden = false;
        article.classList.add('has-hover-image');
      } else {
        hoverImage.hidden = true;
        hoverImage.removeAttribute('src');
        article.classList.remove('has-hover-image');
      }
    } else {
      mediaContainer.classList.remove('is-media-loading');
      resetLqipLayer();
      baseImage.hidden = true;
      baseImage.removeAttribute('src');
      baseImage.removeAttribute('fetchpriority');
      hoverImage.hidden = true;
      hoverImage.removeAttribute('src');
      mediaContainer.classList.add('is-empty');
      article.classList.remove('has-hover-image');
    }

    bindCardInteractions(
      { article, baseImage, hoverImage, cardActionButton },
      nextCard
    );
    observeMenuCardImpression(article, nextCard);
  };

  const hydrateCardNode = (article, item, options = {}) => {
    const parts = getCardParts(article);
    if (!parts) {
      return;
    }

    populateCardNode(parts, toCardViewModel(item), options);
  };

  const createCard = (card, { prioritizeImage = false, skeleton = false } = {}) => {
    const node = cardTemplate.content.cloneNode(true);
    const parts = getCardParts(node);

    if (!parts) {
      return document.createDocumentFragment();
    }

    populateCardNode(parts, card, { prioritizeImage, skeleton });

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
    const emptyCopy = menuPageCopy?.search?.emptyState || MENU_PAGE_COPY_DEFAULTS.search.emptyState;

    if (!normalizedQuery) {
      return (
        normalizeText(emptyCopy?.description) ||
        MENU_PAGE_COPY_DEFAULTS.search.emptyState.description
      );
    }

    const fromTemplate = formatTemplate(emptyCopy?.descriptionWithQuery, {
      query: normalizedQuery,
    });
    return (
      fromTemplate ||
      formatTemplate(
        MENU_PAGE_COPY_DEFAULTS.search.emptyState.descriptionWithQuery,
        { query: normalizedQuery }
      )
    );
  };

  const createSearchEmptyState = (query) => {
    const emptyCopy = menuPageCopy?.search?.emptyState || MENU_PAGE_COPY_DEFAULTS.search.emptyState;
    const node = document.createElement('section');
    node.className = 'menu-page-search-empty';
    node.setAttribute('aria-labelledby', 'menu-search-empty-title');

    const art = document.createElement('img');
    art.className = 'menu-page-search-empty__art';
    art.src = toAbsoluteAssetPath(SEARCH_EMPTY_ART_PATH);
    art.alt = '';
    art.decoding = 'async';
    art.loading = 'lazy';

    const title = document.createElement('h2');
    title.className = 'menu-page-search-empty__title';
    title.id = 'menu-search-empty-title';
    title.textContent =
      normalizeText(emptyCopy?.title) ||
      MENU_PAGE_COPY_DEFAULTS.search.emptyState.title;

    const message = document.createElement('p');
    message.className = 'menu-page-search-empty__message';
    message.textContent = getSearchEmptyMessage(query);

    const hint = document.createElement('p');
    hint.className = 'menu-page-search-empty__hint';
    hint.textContent =
      normalizeText(emptyCopy?.hint) ||
      MENU_PAGE_COPY_DEFAULTS.search.emptyState.hint;

    node.append(art, title, message, hint);
    return node;
  };

  const createCategoryGrid = (
    items = [],
    {
      prioritizeFirstItems = 0,
      skeleton = false,
      hydrationQueue = null,
    } = {}
  ) => {
    const grid = document.createElement('div');
    grid.className = 'menu-page-grid';

    items.forEach((item, index) => {
      const shouldPrioritizeImage = index < prioritizeFirstItems;
      const cardNode = createCardNode(item, {
        prioritizeImage: shouldPrioritizeImage,
        skeleton,
      });

      if (!(cardNode instanceof HTMLElement)) {
        return;
      }

      if (skeleton && Array.isArray(hydrationQueue)) {
        hydrationQueue.push({
          node: cardNode,
          item,
          prioritizeImage: shouldPrioritizeImage,
        });
      }

      grid.appendChild(cardNode);
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

  const renderPizzaCategoryContent = (
    section,
    category,
    visibleItems,
    {
      prioritizeFirstItems = 0,
      skeleton = false,
      hydrationQueue = null,
    } = {}
  ) => {
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

    let remainingPriority = prioritizeFirstItems;

    renderedGroups.forEach(({ sourceCategory, items }) => {
      const subgroup = document.createElement('div');
      subgroup.className = 'menu-page-category__subgroup';
      subgroup.dataset.sourceCategoryId = normalizeText(sourceCategory?.id);
      subgroup.appendChild(createPizzaSubgroupLabel(sourceCategory, items));
      subgroup.appendChild(
        createCategoryGrid(items, {
          prioritizeFirstItems: Math.max(remainingPriority, 0),
          skeleton,
          hydrationQueue,
        })
      );
      section.appendChild(subgroup);
      remainingPriority = Math.max(0, remainingPriority - items.length);
    });
  };

  const getRenderedCategories = () =>
    state.categories.filter((category) => state.sectionsByCategoryId.has(category.id));

  const delay = (ms) =>
    new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });

  const scheduleAfterNextPaint = (callback) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        callback();
      });
    });
  };

  const scheduleNonCriticalTask = (
    callback,
    { timeout = NON_CRITICAL_MENU_TASK_TIMEOUT_MS } = {}
  ) => {
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(() => callback(), { timeout });
      return;
    }

    window.setTimeout(callback, 80);
  };

  const invalidateCatalogRender = () => {
    state.catalogRenderToken += 1;
    return state.catalogRenderToken;
  };

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
    const safeWord =
      normalizeText(word) ||
      searchHelperWords[0] ||
      SEARCH_HELPER_WORDS_DEFAULT[0] ||
      '';

    Array.from(safeWord).forEach((character) => {
      const char = createSearchHelperChar(character);

      if (initialState) {
        setSearchHelperCharState(char, initialState);
      }

      layer.appendChild(char);
    });

    return layer;
  };

  const renderSearchHelperWord = (word = searchHelperWords[0] || SEARCH_HELPER_WORDS_DEFAULT[0]) => {
    if (!(searchHelperWord instanceof HTMLElement)) {
      return;
    }

    searchHelperWord.replaceChildren(
      createSearchHelperLayer(word, 'menu-page-search__helper-layer')
    );
  };

  const syncSearchHelperWidth = () => {
    if (!(searchHelperWord instanceof HTMLElement) || !searchHelperWords.length) {
      return;
    }

    const measure = document.createElement('span');
    measure.className = 'menu-page-search__helper-layer';
    measure.style.position = 'absolute';
    measure.style.visibility = 'hidden';
    measure.style.pointerEvents = 'none';
    searchHelperWord.appendChild(measure);

    let maxWidth = 0;

    searchHelperWords.forEach((word) => {
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
    searchHelperWords.length > 1 &&
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

      const currentWord = searchHelperWords[searchHelperWordIndex] || searchHelperWords[0];
      const nextIndex = (searchHelperWordIndex + 1) % searchHelperWords.length;
      const nextWord = searchHelperWords[nextIndex];
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

    const currentWord = searchHelperWords[searchHelperWordIndex] || searchHelperWords[0];
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
    invalidateCatalogRender();
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
    invalidateCatalogRender();
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

  const createCardNode = (item, options = {}) => {
    const fragment = createCard(toCardViewModel(item), options);
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

  const createCategorySectionElement = (
    { category, visibleItems },
    {
      prioritizeFirstItems = 0,
      skeleton = false,
      hydrationQueue = null,
    } = {}
  ) => {
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
        renderPizzaCategoryContent(section, category, visibleItems, {
          prioritizeFirstItems,
          skeleton,
          hydrationQueue,
        });
      } else {
        section.appendChild(
          createCategoryGrid(visibleItems, {
            prioritizeFirstItems,
            skeleton,
            hydrationQueue,
          })
        );
      }
    } else {
      section.appendChild(createEmptyState(category.emptyMessage));
    }

    return section;
  };

  const shouldUseMobileProgressiveCatalog = (renderState = buildRenderState()) =>
    MOBILE_CARD_QUERY.matches &&
    !isAdminPreviewMode &&
    !getRouteItemId() &&
    !renderState.isSearching &&
    !renderState.isFilteredBrowse &&
    renderState.totalMatches > 0;

  const hasInitialMobileCatalogSeed = () =>
    contentRoot.getAttribute(INITIAL_MOBILE_CATALOG_SEED_ATTR) === 'true';

  const clearInitialMobileCatalogSeed = () => {
    contentRoot.removeAttribute(INITIAL_MOBILE_CATALOG_SEED_ATTR);
  };

  const createInitialMobileCatalogSeedCategory = () => {
    const initialGroup = tabEntries[0];

    if (!initialGroup) {
      return null;
    }

    return {
      id: initialGroup.id,
      label: initialGroup.label,
      sectionId: toSectionId(initialGroup.id),
      emptyMessage: initialGroup.emptyMessage,
      sourceCategories: Array.isArray(initialGroup.sourceCategoryIds)
        ? initialGroup.sourceCategoryIds.map((sourceCategoryId) => ({
            id: sourceCategoryId,
            label: formatFallbackLabel(sourceCategoryId),
          }))
        : [],
    };
  };

  const createInitialMobileCatalogSeedItem = (categoryId, index) => ({
    id: `__menu-seed-${normalizeText(categoryId) || 'item'}-${index}`,
    name: '',
    description: '',
    descriptionShort: '',
    descriptionLong: '',
    price: 0,
    priceFormatted: '',
    available: true,
    category: normalizeText(categoryId),
    categoryLabel: formatFallbackLabel(categoryId),
    image: '',
    imageAlt: '',
    soldOutReason: '',
  });

  const shouldSeedInitialMobileCatalogShell = () =>
    MOBILE_CARD_QUERY.matches &&
    !isAdminPreviewMode &&
    !getRouteItemId() &&
    !(mediaApi?.getLqip) &&
    !normalizeText(state.searchQuery) &&
    !hasActiveFilters(state.appliedFilters);

  const seedInitialMobileCatalogShell = () => {
    if (!shouldSeedInitialMobileCatalogShell()) {
      return false;
    }

    if (hasInitialMobileCatalogSeed()) {
      return true;
    }

    if (contentRoot.childElementCount > 0) {
      return false;
    }

    const category = createInitialMobileCatalogSeedCategory();

    if (!category) {
      return false;
    }

    const visibleItems = Array.from(
      { length: INITIAL_MOBILE_SEED_CARD_COUNT },
      (_, index) => createInitialMobileCatalogSeedItem(category.id, index)
    );
    const section = createCategorySectionElement(
      { category, visibleItems },
      { skeleton: true }
    );

    if (!(section instanceof HTMLElement)) {
      return false;
    }

    contentRoot.appendChild(section);
    contentRoot.setAttribute(INITIAL_MOBILE_CATALOG_SEED_ATTR, 'true');
    return true;
  };

  const progressivelyHydrateMobileCards = (
    queue = [],
    token,
    { startIndex = 0 } = {}
  ) =>
    new Promise((resolve) => {
      if (!Array.isArray(queue) || !queue.length) {
        resolve(true);
        return;
      }

      let nextIndex = Math.min(
        queue.length,
        Math.max(0, Math.trunc(Number(startIndex) || 0))
      );

      const flushBatch = () => {
        if (state.catalogRenderToken !== token) {
          resolve(false);
          return;
        }

        const batchEnd = Math.min(
          nextIndex + MOBILE_PROGRESSIVE_CARD_BATCH_SIZE,
          queue.length
        );

        for (; nextIndex < batchEnd; nextIndex += 1) {
          const entry = queue[nextIndex];

          if (!(entry?.node instanceof HTMLElement)) {
            continue;
          }

          hydrateCardNode(entry.node, entry.item, {
            prioritizeImage: Boolean(entry.prioritizeImage),
            skeleton: false,
          });
        }

        if (nextIndex < queue.length) {
          window.requestAnimationFrame(flushBatch);
          return;
        }

        resolve(true);
      };

      window.requestAnimationFrame(flushBatch);
    });

  const primeInitialMobileCatalogCards = (queue = [], token) => {
    if (!Array.isArray(queue) || !queue.length) {
      return 0;
    }

    if (state.catalogRenderToken !== token) {
      return 0;
    }

    const primeCount = Math.min(INITIAL_MOBILE_SEED_CARD_COUNT, queue.length);

    for (let index = 0; index < primeCount; index += 1) {
      const entry = queue[index];

      if (!(entry?.node instanceof HTMLElement)) {
        continue;
      }

      hydrateCardNode(entry.node, entry.item, {
        prioritizeImage: Boolean(entry.prioritizeImage),
        skeleton: false,
      });
    }

    return primeCount;
  };

  const waitForNextFrame = () =>
    new Promise((resolve) => {
      window.requestAnimationFrame(() => resolve(true));
    });

  const renderMobileCatalogShell = (renderState = buildRenderState()) => {
    const token = invalidateCatalogRender();
    clearInitialMobileCatalogSeed();
    contentRoot.replaceChildren();
    state.sectionsByCategoryId.clear();

    const contentFragment = document.createDocumentFragment();
    const hydrationQueue = [];
    const {
      query,
      renderableEntries,
      renderSignature,
    } = renderState;

    renderableEntries.forEach(({ category, visibleItems }, index) => {
      const section = createCategorySectionElement(
        { category, visibleItems },
        {
          prioritizeFirstItems: index === 0 ? CARD_IMAGE_PRIORITY_COUNT : 0,
          skeleton: true,
          hydrationQueue,
        }
      );

      contentFragment.appendChild(section);
      state.sectionsByCategoryId.set(category.id, section);
    });

    contentRoot.appendChild(contentFragment);
    setStatus('', { hide: true });
    state.renderedSearchSignature = renderSignature;
    state.renderedSearchQuery = query;
    const primedCount = primeInitialMobileCatalogCards(hydrationQueue, token);
    scheduleCatalogCardMediaRecovery(contentRoot);

    return {
      token,
      lqipReadyPromise: primedCount > 0 ? waitForNextFrame() : Promise.resolve(false),
      promise: progressivelyHydrateMobileCards(hydrationQueue, token, {
        startIndex: primedCount,
      }),
    };
  };

  const renderCategorySections = (renderState = buildRenderState()) => {
    invalidateCatalogRender();
    clearInitialMobileCatalogSeed();
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
        renderableEntries.flatMap(({ visibleItems }) => visibleItems),
        { prioritizeFirstItems: CARD_IMAGE_PRIORITY_COUNT }
      );

      contentRoot.appendChild(grid);
      setStatus('', { hide: true });
      state.renderedSearchSignature = renderSignature;
      state.renderedSearchQuery = query;
      scheduleCatalogCardMediaRecovery(contentRoot);
      return;
    }

    renderableEntries.forEach(({ category, visibleItems }, index) => {
      const section = createCategorySectionElement(
        { category, visibleItems },
        { prioritizeFirstItems: index === 0 ? CARD_IMAGE_PRIORITY_COUNT : 0 }
      );

      contentFragment.appendChild(section);
      state.sectionsByCategoryId.set(category.id, section);
    });

    contentRoot.appendChild(contentFragment);
    setStatus('', { hide: true });
    state.renderedSearchSignature = renderSignature;
    state.renderedSearchQuery = query;
    scheduleCatalogCardMediaRecovery(contentRoot);
  };

  const showListView = () => {
    const activeDetailItemId = normalizeText(state.detailItemId || getRouteItemId());
    const activeDetailItem = activeDetailItemId
      ? state.itemsById.get(activeDetailItemId)
      : null;

    if (activeDetailItem) {
      analyticsCommerce?.trackItemDetailClose?.(activeDetailItem, {
        detailOrigin: normalizeText(state.detailOrigin) || MENU_DETAIL_ORIGIN_DIRECT,
        detailDepthIndex: clampNumber(
          Math.round(Number(state.detailDepthIndex) || 1),
          1,
          9
        ),
      });
    }

    if (menuPageBody instanceof HTMLElement) {
      menuPageBody.setAttribute('data-menu-page-view', 'list');
      menuPageBody.removeAttribute('data-menu-detail-hero');
    }

    if (state.compareModalOpen) {
      closeCompareModal({ restoreFocus: false, immediate: true });
    }

    disconnectDetailEditorialTracking();
    state.detailItemId = '';
    state.detailOrigin = '';
    state.detailDepthIndex = 0;
    state.compareSearchQuery = '';
    if (compareSearchInput instanceof HTMLInputElement) {
      compareSearchInput.value = '';
      syncCompareSearchControls();
    }

    detailView.setAttribute('data-detail-hero-mode', 'catalog');
    clearDetailEditorialCarousel();
    hideDetailInfoChipTooltip({ immediate: true });
    detailHeroBadgeHasLabel = false;
    detailHeroBadgeFirstSlideOnly = false;
    syncDetailHeroBadgeVisibility(0);

    detailView.hidden = true;
    listView.hidden = false;
    setDetailStatus('', { hide: true });
    updatePageTitle();
    scheduleCatalogCardMediaRecovery(contentRoot);

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

  const applyAdminPreviewUpdatePayload = async (payload = {}) => {
    if (!isAdminPreviewMode || !isObject(payload)) {
      return;
    }

    const previewItem = isObject(payload.item) ? deepClone(payload.item) : null;
    const itemId = normalizeText(previewItem?.id);
    if (!itemId) {
      return;
    }

    previewItem.id = itemId;

    if (isObject(payload.home)) {
      const context = applyHomeMenuDetailContextFromPayload(payload.home);
      homeMenuDetailContextPromise = Promise.resolve(context);
    }

    state.itemsById.set(itemId, previewItem);
    const renderToken = ++adminPreviewRenderToken;
    await renderDetail(previewItem);

    if (renderToken !== adminPreviewRenderToken) {
      return;
    }

    if (adminPreviewSurface === ADMIN_PREVIEW_SURFACE_MODAL) {
      openAdminPreviewModalSurface({
        modalKey: adminPreviewModalActive,
        smooth: false,
      });
    }
  };

  const handleAdminPreviewBridgeMessage = (event) => {
    if (!isAdminPreviewMode) {
      return;
    }

    if (!event || event.origin !== window.location.origin) {
      return;
    }

    if (window.parent !== window && event.source !== window.parent) {
      return;
    }

    const data = event.data;
    if (!isObject(data)) {
      return;
    }

    const type = normalizeText(data.type);
    if (type === ADMIN_PREVIEW_MESSAGE_UPDATE) {
      void applyAdminPreviewUpdatePayload(data.payload);
      return;
    }

    if (type === ADMIN_PREVIEW_MESSAGE_UPDATE_MODAL) {
      applyAdminPreviewModalPayload(data.payload);
      return;
    }

  };

  const tagAdminPreviewSectionLink = (node, sectionId) => {
    if (!(node instanceof HTMLElement)) {
      return;
    }

    const normalizedSection = normalizeText(sectionId).toLowerCase();
    if (!ADMIN_PREVIEW_SECTION_KEYS.has(normalizedSection)) {
      return;
    }

    node.setAttribute('data-admin-preview-link-section', normalizedSection);
  };

  const bindAdminPreviewSectionNavigation = () => {
    if (!isAdminPreviewMode || !(detailView instanceof HTMLElement)) {
      return;
    }

    if (detailView.getAttribute('data-admin-preview-nav-bound') === 'true') {
      return;
    }

    detailView.setAttribute('data-admin-preview-nav-bound', 'true');

    tagAdminPreviewSectionLink(detailMedia, 'hero-media');
    tagAdminPreviewSectionLink(detailHeaderSection, 'header');
    tagAdminPreviewSectionLink(detailHeroHeader, 'header');
    tagAdminPreviewSectionLink(detailBadge, 'header');
    tagAdminPreviewSectionLink(detailTitle, 'header');
    tagAdminPreviewSectionLink(detailPrice, 'header');
    tagAdminPreviewSectionLink(detailChipCalories, 'header');
    tagAdminPreviewSectionLink(detailChipEta, 'header');
    if (detailChipRatingValue instanceof HTMLElement) {
      tagAdminPreviewSectionLink(
        detailChipRatingValue.closest('.menu-page-detail__info-chip'),
        'header'
      );
    }
    tagAdminPreviewSectionLink(detailDescription, 'summary');
    tagAdminPreviewSectionLink(detailIngredientsSection, 'ingredients');
    tagAdminPreviewSectionLink(detailAllergensSection, 'allergens');
    tagAdminPreviewSectionLink(detailAddCtaSection, 'add-cta');
    tagAdminPreviewSectionLink(detailAddButton, 'add-cta');
    tagAdminPreviewSectionLink(detailSensorySection, 'sensory');
    tagAdminPreviewSectionLink(detailPairingsSection, 'pairings');
    tagAdminPreviewSectionLink(detailHistorySection, 'story');

    detailView.addEventListener(
      'click',
      (event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
          return;
        }

        const linkNode = target.closest('[data-admin-preview-link-section]');
        if (!(linkNode instanceof HTMLElement)) {
          return;
        }

        const sectionId = normalizeText(
          linkNode.getAttribute('data-admin-preview-link-section')
        ).toLowerCase();
        if (!ADMIN_PREVIEW_SECTION_KEYS.has(sectionId)) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        emitAdminPreviewNavigateEditorMessage(sectionId);
      },
      true
    );
  };

  const goToMenuListView = async () => {
    hideDetailInfoChipTooltip({ immediate: true });

    const detailHistoryState = toHistoryStateObject(window.history.state);

    if (detailHistoryState.fromMenuList === true) {
      window.history.back();
      return;
    }

    const routeItemId = getRouteItemId();
    const routeItem = routeItemId ? state.itemsById.get(routeItemId) : null;
    const fallbackCategoryId =
      normalizeText(detailHistoryState.returnCategoryId) ||
      resolveGroupIdByItem(routeItem);

    window.history.pushState({}, '', toMenuListUrl());
    await runMenuRouteViewTransition(() => renderRouteFromLocation(), {
      direction: MENU_ROUTE_VIEW_TRANSITION_BACK,
    });

    if (fallbackCategoryId) {
      window.requestAnimationFrame(() => {
        scrollToCategory(fallbackCategoryId);
      });
    }
  };

  const renderDetail = async (item) => {
    if (
      !(detailBadge instanceof HTMLElement) ||
      !(detailBadgeIcon instanceof HTMLImageElement) ||
      !(detailBadgeLabel instanceof HTMLElement) ||
      !(detailPanel instanceof HTMLElement) ||
      !(detailHeaderSection instanceof HTMLElement) ||
      !(detailMedia instanceof HTMLElement) ||
      !(detailImage instanceof HTMLImageElement) ||
      !(detailTitle instanceof HTMLElement) ||
      !(detailChipCalories instanceof HTMLElement) ||
      !(detailChipCaloriesValue instanceof HTMLElement) ||
      !(detailChipEta instanceof HTMLElement) ||
      !(detailChipEtaValue instanceof HTMLElement) ||
      !(detailChipRatingValue instanceof HTMLElement) ||
      !(detailDescription instanceof HTMLElement) ||
      !(detailPrice instanceof HTMLElement) ||
      !(detailSensoryDivider instanceof HTMLElement) ||
      !(detailSensorySection instanceof HTMLElement) ||
      !(detailSensoryGroups instanceof HTMLElement) ||
      !(detailSensorySummary instanceof HTMLElement) ||
      !(detailSpecGrid instanceof HTMLElement) ||
      !(detailSpecsDivider instanceof HTMLElement) ||
      !(detailTagsDivider instanceof HTMLElement) ||
      !(detailTagsSection instanceof HTMLElement) ||
      !(detailTags instanceof HTMLElement) ||
      !(detailIngredientsSection instanceof HTMLElement) ||
      !(detailIngredients instanceof HTMLElement) ||
      !(detailAllergensSection instanceof HTMLElement) ||
      !(detailAllergens instanceof HTMLElement) ||
      !(detailAddCtaSection instanceof HTMLElement) ||
      !(detailSoldOutReason instanceof HTMLElement)
    ) {
      return;
    }

    if (state.compareModalOpen) {
      closeCompareModal({ restoreFocus: false, immediate: true });
    }

    disconnectDetailEditorialTracking();
    hideDetailInfoChipTooltip({ immediate: true });

    const renderToken = ++detailRenderToken;
    const detail = await toDetailViewModel(item);
    if (renderToken !== detailRenderToken) {
      return;
    }
    const sectionVisibility = isObject(detail?.sectionVisibility)
      ? detail.sectionVisibility
      : {};
    const showHeroMedia = isDetailSectionVisible(sectionVisibility, 'hero_media');
    const showHeader = isDetailSectionVisible(sectionVisibility, 'header');
    const showIngredients = isDetailSectionVisible(sectionVisibility, 'ingredients');
    const showAllergens = isDetailSectionVisible(sectionVisibility, 'allergens');
    const showAddCta = isDetailSectionVisible(sectionVisibility, 'add_cta');
    const showSensory = isDetailSectionVisible(sectionVisibility, 'sensory');
    const showPairings = isDetailSectionVisible(sectionVisibility, 'pairings');
    const showStory = isDetailSectionVisible(sectionVisibility, 'story');
    const syncDetailAddQuantity = (value, { animate = false } = {}) => {
      const nextQuantity = syncDetailQuantityValue(value, { animate });
      if (detailQuantityDecreaseButton instanceof HTMLButtonElement) {
        detailQuantityDecreaseButton.disabled = nextQuantity <= DETAIL_ADD_QTY_MIN;
      }
      if (detailQuantityIncreaseButton instanceof HTMLButtonElement) {
        detailQuantityIncreaseButton.disabled = nextQuantity >= DETAIL_ADD_QTY_MAX;
      }
      return nextQuantity;
    };
    const syncDetailQuantityAvailability = (isAvailable) => {
      if (detailQuantityStepper instanceof HTMLElement) {
        detailQuantityStepper.setAttribute(
          'data-disabled',
          isAvailable ? 'false' : 'true'
        );
      }
      if (detailQuantityDecreaseButton instanceof HTMLButtonElement) {
        detailQuantityDecreaseButton.disabled =
          !isAvailable || state.detailAddQuantity <= DETAIL_ADD_QTY_MIN;
      }
      if (detailQuantityIncreaseButton instanceof HTMLButtonElement) {
        detailQuantityIncreaseButton.disabled =
          !isAvailable || state.detailAddQuantity >= DETAIL_ADD_QTY_MAX;
      }
    };
    const homeMenuDetailContext = await loadHomeMenuDetailContext();
    const featuredIds =
      homeMenuDetailContext?.featuredIds instanceof Set
        ? homeMenuDetailContext.featuredIds
        : new Set();
    const heroBadge = resolveDetailHeroBadge({
      item,
      badges: detail.badges,
      featuredIds,
    });
    const heroBadgeLabel = normalizeText(heroBadge?.label);
    const heroBadgeIconPath = normalizeText(heroBadge?.icon);
    const metrics = formatDetailMetrics(detail);

    detailChipCaloriesValue.textContent = metrics.calories;
    detailChipEtaValue.textContent = metrics.eta;
    detailChipRatingValue.textContent = metrics.rating;
    detailChipCalories.setAttribute(
      'aria-label',
      `${normalizeText(getDetailChipTooltipCopy('calories')?.title) || MENU_DETAIL_EDITORIAL_COPY_DEFAULTS.infoChips.calories.title}: ${metrics.calories}`
    );
    detailChipEta.setAttribute(
      'aria-label',
      `${normalizeText(getDetailChipTooltipCopy('eta')?.title) || MENU_DETAIL_EDITORIAL_COPY_DEFAULTS.infoChips.eta.title}: ${metrics.eta}`
    );

    detailBadge.setAttribute('data-badge-kind', normalizeText(heroBadge?.kind));
    detailBadgeLabel.textContent = heroBadgeLabel;
    detailHeroBadgeHasLabel = Boolean(heroBadgeLabel);
    if (heroBadgeIconPath) {
      detailBadgeIcon.src = heroBadgeIconPath;
      detailBadgeIcon.hidden = false;
    } else {
      detailBadgeIcon.hidden = true;
      detailBadgeIcon.removeAttribute('src');
    }

    detailTitle.textContent = detail.title;
    detailDescription.textContent = detail.description;
    detailDescription.hidden = !detail.description;
    detailPrice.textContent = detail.price;
    detailSoldOutReason.textContent = detail.available
      ? ''
      : detail.soldOutReason || 'Temporalmente no disponible.';
    detailSoldOutReason.hidden = detail.available;
    detailHeaderSection.hidden = !showHeader;
    syncDetailSensorySubtitle(detail.sensoryIntro);
    const { hasSensoryProfile, compareEnabled } = renderDetailSensoryState({
      itemId: detail.id,
      currentLabel: detail.title,
      sensoryProfile: detail.sensoryProfile,
      compareMode: detail.compareMode,
      forceHidden: !showSensory,
    });
    if ((!hasSensoryProfile || !compareEnabled) && state.compareModalOpen) {
      closeCompareModal({ restoreFocus: false, immediate: true });
    }
    const hasPairings = syncDetailPairingsSection({
      pairings: detail.pairings,
      forceHidden: !showPairings,
    });
    const hasHistory = syncDetailHistorySection({
      story: detail.story,
      forceHidden: !showStory,
    });
    if (detailAddButton instanceof HTMLButtonElement) {
      const isAvailable = detail.available !== false && showAddCta;
      detailAddButton.textContent = isAvailable ? 'Añadir' : 'No disponible';
      detailAddButton.classList.toggle('is-available', isAvailable);
      detailAddButton.classList.toggle('is-unavailable', !isAvailable);
      detailAddButton.disabled = !isAvailable;
      detailAddButton.dataset.menuItemId = detail.id;
      syncDetailAddQuantity(DETAIL_ADD_QTY_MIN, { animate: false });
      syncDetailQuantityAvailability(isAvailable);
    }
    detailAddCtaSection.hidden = !showAddCta;
    detailPanel.setAttribute(
      'data-availability',
      detail.available ? 'available' : 'unavailable'
    );
    const hasEditorialSlides = Array.isArray(detail.editorialSlides)
      ? detail.editorialSlides.length > 0
      : false;
    const shouldUseEditorialHero =
      showHeroMedia &&
      hasEditorialSlides &&
      DETAIL_EDITORIAL_HERO_QUERY.matches &&
      renderDetailEditorialCarousel(detail.editorialSlides);
    detailHeroBadgeFirstSlideOnly = detailHeroBadgeHasLabel && shouldUseEditorialHero;
    syncDetailHeroBadgeVisibility(0);

    detailView.setAttribute(
      'data-detail-hero-mode',
      shouldUseEditorialHero ? 'editorial' : 'catalog'
    );

    if (menuPageBody instanceof HTMLElement) {
      menuPageBody.setAttribute(
        'data-menu-detail-hero',
        shouldUseEditorialHero ? 'editorial' : 'catalog'
      );
    }

    if (!showHeroMedia) {
      clearDetailEditorialCarousel();
      detailImage.hidden = true;
      detailImage.removeAttribute('src');
      detailImage.alt = '';
      detailMedia.hidden = true;
      detailMedia.setAttribute('data-media-mode', 'catalog');
      detailMedia.setAttribute('data-image-state', 'empty');
    } else if (shouldUseEditorialHero) {
      detailImage.hidden = true;
      detailImage.removeAttribute('src');
      detailImage.alt = '';
      detailMedia.hidden = false;
      detailMedia.setAttribute('data-media-mode', 'editorial');
      detailMedia.setAttribute('data-image-state', 'ready');
    } else if (detail.image) {
      clearDetailEditorialCarousel();
      detailImage.src = detail.image;
      detailImage.alt = detail.imageAlt || detail.title;
      detailImage.hidden = false;
      detailMedia.hidden = false;
      detailMedia.setAttribute('data-media-mode', 'editorial');
      detailMedia.setAttribute('data-image-state', 'ready');
    } else {
      clearDetailEditorialCarousel();
      detailImage.hidden = true;
      detailImage.removeAttribute('src');
      detailImage.alt = '';
      detailMedia.hidden = false;
      detailMedia.setAttribute('data-media-mode', 'catalog');
      detailMedia.setAttribute('data-image-state', 'empty');
    }

    let ingredientEntries = [];
    let allergenEntries = [];
    const syncDetailSpecsState = () => {
      const hasIngredients = showIngredients && ingredientEntries.length > 0;
      const hasAllergens = showAllergens && allergenEntries.length > 0;
      const hasSpecs = hasIngredients || hasAllergens;

      renderIngredientList(detailIngredients, ingredientEntries);
      renderAllergenList(detailAllergens, allergenEntries);

      detailIngredientsSection.hidden = !hasIngredients;
      detailAllergensSection.hidden = !hasAllergens;
      detailSpecGrid.hidden = !hasSpecs;
      detailSpecGrid.setAttribute(
        'data-columns',
        hasIngredients && hasAllergens ? '2' : '1'
      );
      detailSpecsDivider.hidden = !hasSpecs || !showHeader;
      detailAddCtaSection.setAttribute(
        'data-has-leading-content',
        showHeader || hasSpecs ? 'true' : 'false'
      );
    };
    syncDetailSpecsState();

    renderTagBadges(detailTags, []);
    detailTagsSection.hidden = true;
    detailTagsDivider.hidden = true;
    const hasTrailingBentoCards = hasSensoryProfile || hasPairings || hasHistory;
    detailAddCtaSection.setAttribute(
      'data-has-trailing-content',
      hasTrailingBentoCards ? 'true' : 'false'
    );

    setDetailStatus('', { hide: true });
    showDetailView();
    updatePageTitle(detail.title);
    const detailHistoryState = toHistoryStateObject(window.history.state);
    state.detailOrigin =
      normalizeText(detailHistoryState.detailOrigin) ||
      (detailHistoryState.fromMenuList ? MENU_DETAIL_ORIGIN_GRID : MENU_DETAIL_ORIGIN_DIRECT);
    state.detailDepthIndex = clampNumber(
      Math.round(Number(detailHistoryState.detailDepthIndex) || 1),
      1,
      9
    );
    analyticsCommerce?.trackItemDetailOpen?.(detail, {
      detailOrigin: state.detailOrigin,
      detailDepthIndex: state.detailDepthIndex,
    });
    syncDetailEditorialTracking(detail);
    syncDetailPerformanceTracking(detail);

    window.requestAnimationFrame(() => {
      if (
        renderToken !== detailRenderToken ||
        normalizeText(state.detailItemId) !== detail.id
      ) {
        return;
      }

      emitMenuDetailReady({ itemId: detail.id });
    });

    if (Array.isArray(detail.ingredients) && detail.ingredients.length) {
      void resolveIngredientEntries(detail.ingredients)
        .then((resolvedEntries) => {
          if (
            renderToken !== detailRenderToken ||
            normalizeText(state.detailItemId) !== detail.id
          ) {
            return;
          }

          ingredientEntries = Array.isArray(resolvedEntries) ? resolvedEntries : [];
          syncDetailSpecsState();
        })
        .catch((error) => {
          console.warn('[menu-page] No se pudieron hidratar los ingredientes del detalle.', error);
        });
    }

    if (Array.isArray(detail.allergens) && detail.allergens.length) {
      void resolveAllergenEntries(detail.allergens)
        .then((resolvedEntries) => {
          if (
            renderToken !== detailRenderToken ||
            normalizeText(state.detailItemId) !== detail.id
          ) {
            return;
          }

          allergenEntries = Array.isArray(resolvedEntries) ? resolvedEntries : [];
          syncDetailSpecsState();
        })
        .catch((error) => {
          console.warn('[menu-page] No se pudieron hidratar los alérgenos del detalle.', error);
        });
    }

  };

  const renderRouteFromLocation = async () => {
    normalizeRouteFromLegacyQuery();
    const requestedItemId = getRouteItemId();

    if (!requestedItemId) {
      showListView();
      restoreListScrollFromHistory();
      markMenuListPerformanceReady();
      lastRenderedRouteItemId = '';
      return;
    }

    const item =
      state.itemsById.get(requestedItemId) ||
      (await menuApi.getMenuItemById(requestedItemId));

    if (!item) {
      window.history.replaceState({}, '', toMenuListUrl());
      setStatus('El ítem solicitado no existe.', { isError: true });
      showListView();
      markMenuListPerformanceReady();
      window.requestAnimationFrame(() => {
        emitMenuDetailReady({
          itemId: requestedItemId,
          reason: 'detail-missing',
        });
      });
      lastRenderedRouteItemId = '';
      return;
    }

    await renderDetail(item);
    resetDetailScrollPosition();
    lastRenderedRouteItemId = normalizeText(item.id) || requestedItemId;
  };

  const buildGroupItems = async (group) => {
    const items = [];
    const seen = new Set();

    const categoryItemGroups = await Promise.all(
      group.sourceCategoryIds.map((categoryId) => menuApi.getMenuItemsByCategory(categoryId))
    );

    categoryItemGroups.forEach((categoryItems) => {
      if (!Array.isArray(categoryItems)) {
        return;
      }

      categoryItems.forEach((item) => {
        const itemId = normalizeText(item?.id);

        if (!itemId || seen.has(itemId)) {
          return;
        }

        seen.add(itemId);
        items.push(item);
      });
    });

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
    void loadHomeMenuDetailContext();
    if (mediaApi?.loadMediaStore) {
      try {
        await mediaApi.loadMediaStore();
      } catch (error) {
        console.warn('[menu-page] No se pudo precargar media.json para LQIP.', error);
      }
    }
    const stateCopy = getMenuPageStateCopy();
    const routeItemId = getRouteItemId();
    const seededInitialMobileShell = seedInitialMobileCatalogShell();
    const hasInitialMobileSeed = hasInitialMobileCatalogSeed();
    const loadingMessage =
      normalizeText(stateCopy?.loading) || MENU_PAGE_COPY_DEFAULTS.states.loading;
    setStatus(loadingMessage, {
      hide: seededInitialMobileShell || hasInitialMobileSeed || Boolean(mediaApi?.getLqip),
    });

    const renderedGroups = await Promise.all(
      tabEntries.map(async (group) => ({
        ...group,
        sectionId: toSectionId(group.id),
        emptyMessage: getMenuCategoryEmptyMessage(group.id, group.emptyMessage),
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
      clearInitialMobileCatalogSeed();
      contentRoot.replaceChildren();
      setStatus(
        normalizeText(stateCopy?.noCategories) ||
          MENU_PAGE_COPY_DEFAULTS.states.noCategories
      );
      emitCatalogLqipReady({ reason: 'catalog-empty' });
      return;
    }

    bindMenuTabs();

    renderedGroups.forEach((category) => {
      category.items.forEach((item) => {
        state.itemsById.set(normalizeText(item.id), item);
      });
    });

    const initialRenderState = buildRenderState();
    let catalogLqipReadyPromise = Promise.resolve(true);

    if (shouldUseMobileProgressiveCatalog(initialRenderState)) {
      const mobileCatalogShell = renderMobileCatalogShell(initialRenderState);
      catalogLqipReadyPromise = Promise.resolve(
        mobileCatalogShell?.lqipReadyPromise || false
      );
    } else {
      renderCategorySections(initialRenderState);
    }

    const finalizeCatalogLqipReady = async () => {
      await catalogLqipReadyPromise;
      emitCatalogLqipReady({ reason: 'catalog-rendered' });
    };

    if (routeItemId) {
      void finalizeCatalogLqipReady();
    } else {
      await finalizeCatalogLqipReady();
    }

    setActiveCategory(state.categories[0].id, { animate: false, force: true });

    const hashMatch = !routeItemId ? findCategoryByHash(window.location.hash) : null;

    if (!routeItemId) {
      if (hashMatch) {
        window.setTimeout(() => {
          scrollToCategory(hashMatch.id);
        }, 0);
      } else {
        scheduleActiveCategoryUpdate();
      }
    }

    scheduleAfterNextPaint(() => {
      scheduleNonCriticalTask(() => {
        ensureFilterModalRuntimeReady();
      });
    });
  };

  if (detailBackButton instanceof HTMLButtonElement) {
    detailBackButton.addEventListener('click', goToMenuListView);
  }

  if (detailCloseButton instanceof HTMLButtonElement) {
    detailCloseButton.addEventListener('click', goToMenuListView);
  }

  if (detailAddButton instanceof HTMLButtonElement) {
    detailAddButton.addEventListener('click', (event) => {
      event.preventDefault();

      if (detailAddButton.disabled) {
        return;
      }

      const itemId = normalizeText(detailAddButton.dataset.menuItemId || getRouteItemId());
      const item = state.itemsById.get(itemId);
      if (!item || item.available === false) {
        return;
      }

      const sourceImage =
        detailImage instanceof HTMLImageElement &&
        !detailImage.hidden &&
        isElementVisibleForFlight(detailImage)
          ? detailImage
          : null;

      const requestedQuantity = clampNumber(
        Math.round(Number(state.detailAddQuantity) || DETAIL_ADD_QTY_MIN),
        DETAIL_ADD_QTY_MIN,
        DETAIL_ADD_QTY_MAX
      );
      void runMenuCartVisualAdd(sourceImage, itemId, requestedQuantity, {
        detailOrigin: MENU_DETAIL_ORIGIN_ROUTE,
      });
    });
  }

  if (
    detailQuantityDecreaseButton instanceof HTMLButtonElement &&
    detailQuantityValue instanceof HTMLElement
  ) {
    detailQuantityDecreaseButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (detailQuantityDecreaseButton.disabled) {
        return;
      }
      const nextQuantity = clampNumber(
        Math.round(Number(state.detailAddQuantity) || DETAIL_ADD_QTY_MIN) - 1,
        DETAIL_ADD_QTY_MIN,
        DETAIL_ADD_QTY_MAX
      );
      syncDetailQuantityValue(nextQuantity, { animate: true });
      detailQuantityDecreaseButton.disabled = nextQuantity <= DETAIL_ADD_QTY_MIN;
      if (detailQuantityIncreaseButton instanceof HTMLButtonElement) {
        detailQuantityIncreaseButton.disabled =
          (detailAddButton instanceof HTMLButtonElement &&
            detailAddButton.disabled) ||
          nextQuantity >= DETAIL_ADD_QTY_MAX;
      }
      pulseAccountStepperGlyph(detailQuantityDecreaseButton);
    });
  }

  if (
    detailQuantityIncreaseButton instanceof HTMLButtonElement &&
    detailQuantityValue instanceof HTMLElement
  ) {
    detailQuantityIncreaseButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (detailQuantityIncreaseButton.disabled) {
        return;
      }
      const nextQuantity = clampNumber(
        Math.round(Number(state.detailAddQuantity) || DETAIL_ADD_QTY_MIN) + 1,
        DETAIL_ADD_QTY_MIN,
        DETAIL_ADD_QTY_MAX
      );
      syncDetailQuantityValue(nextQuantity, { animate: true });
      detailQuantityIncreaseButton.disabled = nextQuantity >= DETAIL_ADD_QTY_MAX;
      if (detailQuantityDecreaseButton instanceof HTMLButtonElement) {
        detailQuantityDecreaseButton.disabled =
          (detailAddButton instanceof HTMLButtonElement &&
            detailAddButton.disabled) ||
          nextQuantity <= DETAIL_ADD_QTY_MIN;
      }
      pulseAccountStepperGlyph(detailQuantityIncreaseButton);
    });
  }

  if (detailQuantityStepper instanceof HTMLElement) {
    detailQuantityStepper.setAttribute('data-disabled', 'true');
  }

  if (detailQuantityDecreaseButton instanceof HTMLButtonElement) {
    ensureAccountStepperGlyph(detailQuantityDecreaseButton, '-');
  }
  if (detailQuantityIncreaseButton instanceof HTMLButtonElement) {
    ensureAccountStepperGlyph(detailQuantityIncreaseButton, '+');
  }

  bindFilterPizzaTabs();
  bindDetailSensoryViewTabs();
  bindDetailInfoChipTooltips();

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
      if (document.activeElement === searchInput && typeof searchInput.blur === 'function') {
        searchInput.blur();
      }
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

  if (detailSensoryCompareButton instanceof HTMLButtonElement) {
    detailSensoryCompareButton.addEventListener('click', (event) => {
      event.preventDefault();

      if (detailSensoryCompareButton.disabled) {
        return;
      }

      if (state.compareModalOpen) {
        closeCompareModal();
        return;
      }

      state.compareSearchQuery = '';
      if (compareSearchInput instanceof HTMLInputElement) {
        compareSearchInput.value = '';
      }
      syncCompareSearchControls();
      renderCompareModalShell();
      openCompareModal();
    });
  }

  if (compareSearchInput instanceof HTMLInputElement) {
    compareSearchInput.addEventListener('input', () => {
      state.compareSearchQuery = normalizeText(compareSearchInput.value);
      syncCompareSearchControls();
      renderCompareModalShell();
    });

    compareSearchInput.addEventListener('search', () => {
      state.compareSearchQuery = normalizeText(compareSearchInput.value);
      syncCompareSearchControls();
      renderCompareModalShell();
    });

    compareSearchInput.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !compareSearchInput.value) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      compareSearchInput.value = '';
      state.compareSearchQuery = '';
      syncCompareSearchControls();
      renderCompareModalShell();
    });
  }

  if (compareSearchClearButton instanceof HTMLButtonElement) {
    compareSearchClearButton.addEventListener('click', (event) => {
      event.preventDefault();

      if (!(compareSearchInput instanceof HTMLInputElement)) {
        return;
      }

      compareSearchInput.value = '';
      state.compareSearchQuery = '';
      syncCompareSearchControls();
      renderCompareModalShell();
      if (
        document.activeElement === compareSearchInput &&
        typeof compareSearchInput.blur === 'function'
      ) {
        compareSearchInput.blur();
      }
    });
  }

  if (compareSearchInput instanceof HTMLInputElement) {
    syncCompareSearchControls();
  }

  if (detailSensoryComparisonClearButton instanceof HTMLButtonElement) {
    detailSensoryComparisonClearButton.addEventListener('click', (event) => {
      event.preventDefault();
      state.detailComparisonItemId = '';
      refreshCurrentDetailSensoryComparison();
    });
  }

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const accountTrigger = target.closest(MENU_CART_TARGET_SELECTOR);
    if (!(accountTrigger instanceof HTMLElement)) {
      return;
    }

    event.preventDefault();

    if (state.accountModalOpen) {
      closeAccountModal();
      return;
    }

    openAccountModal();
  });

  if (compareModal instanceof HTMLElement) {
    compareModal.addEventListener('click', (event) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      if (target.closest('[data-menu-compare-close]')) {
        event.preventDefault();
        closeCompareModal();
        return;
      }

      const compareItemButton = target.closest('[data-compare-item-id]');
      if (!(compareItemButton instanceof HTMLElement)) {
        return;
      }

      event.preventDefault();
      const comparisonItemId = normalizeText(compareItemButton.dataset.compareItemId);
      const comparisonItem = state.itemsById.get(comparisonItemId);
      if (!comparisonItem || !isItemEligibleForSensoryComparison(comparisonItem)) {
        return;
      }

      state.detailComparisonItemId = comparisonItemId;
      state.detailSensoryView = 'radar';
      refreshCurrentDetailSensoryComparison();
      closeCompareModal();
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

  if (accountModal instanceof HTMLElement) {
    accountModal.addEventListener('click', (event) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      if (target.closest('[data-account-toast-undo]')) {
        event.preventDefault();
        undoAccountRemovalToast();
        return;
      }

      const totalInfoToggle = target.closest('[data-account-total-info-toggle]');
      if (totalInfoToggle instanceof HTMLButtonElement) {
        event.preventDefault();
        const isOpen = totalInfoToggle.getAttribute('aria-expanded') === 'true';
        setAccountTotalInfoOpen(!isOpen);
        return;
      }

      if (!target.closest('[data-account-total-info]')) {
        setAccountTotalInfoOpen(false);
      }

      const actionButton = target.closest('[data-account-action]');
      if (actionButton instanceof HTMLButtonElement) {
        event.preventDefault();

        const itemId = normalizeText(actionButton.dataset.accountItemId);
        if (!itemId) {
          return;
        }

        const action = normalizeText(actionButton.dataset.accountAction);
        if (action === 'increase') {
          pulseAccountStepperGlyph(actionButton);
          addItemToAccount(itemId, 1, {
            detailOrigin: MENU_DETAIL_ORIGIN_ACCOUNT,
          });
          return;
        }

        if (action === 'decrease') {
          pulseAccountStepperGlyph(actionButton);
          const nextQuantity = getAccountQuantity(itemId) - 1;
          if (nextQuantity <= 0) {
            removeItemFromAccount(itemId, {
              detailOrigin: MENU_DETAIL_ORIGIN_ACCOUNT,
            });
          } else {
            setAccountItemQuantity(itemId, nextQuantity, {
              detailOrigin: MENU_DETAIL_ORIGIN_ACCOUNT,
            });
          }
          return;
        }

        if (action === 'remove') {
          removeItemFromAccount(itemId, {
            detailOrigin: MENU_DETAIL_ORIGIN_ACCOUNT,
          });
        }
        return;
      }

      if (target.closest('[data-account-checkout]')) {
        event.preventDefault();
        if (!(accountCheckoutButton instanceof HTMLButtonElement) || accountCheckoutButton.disabled) {
          return;
        }

        const snapshot = buildMenuCommerceSnapshot();
        if (!snapshot || !snapshot.items.length) {
          return;
        }

        const checkoutUrl = buildWhatsappCheckoutUrl(
          restaurantCommerceContact?.whatsappUrl,
          buildMenuAccountWhatsappMessage(snapshot)
        );
        accountCheckoutButton.dataset.analyticsTarget = checkoutUrl;
        window.open(checkoutUrl, '_blank', 'noopener');
        Promise.all([
          analyticsCommerce?.trackBeginCheckout?.(snapshot.items, { snapshot }),
          analyticsCommerce?.trackPurchase?.(snapshot.items, { snapshot }),
        ]).finally(() => {
          analyticsSdk?.flush?.({
            reason: 'menu_account_checkout',
            useBeacon: true,
          });
        });
        return;
      }

      if (target.closest('[data-menu-account-close]')) {
        event.preventDefault();
        closeAccountModal();
      }
    });

    accountModal.addEventListener('focusin', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLButtonElement)) {
        return;
      }

      const action = normalizeText(target.dataset.accountAction);
      if (action !== 'increase' && action !== 'decrease') {
        return;
      }

      const isFocusVisible =
        typeof target.matches === 'function' ? target.matches(':focus-visible') : true;
      if (!isFocusVisible) {
        return;
      }

      pulseAccountStepperGlyph(target);
    });
  }

  if (filterModalBody instanceof HTMLElement) {
    filterModalBody.addEventListener('scroll', scheduleFilterModalChromeSync, {
      passive: true,
    });
  }

  window.addEventListener('resize', scheduleFilterModalChromeSync);

  document.addEventListener('keydown', (event) => {
    const accountModalOpen = state.accountModalOpen;
    const filterModalOpen = state.filterModalOpen;
    const compareModalOpen = state.compareModalOpen;

    if (!accountModalOpen && !filterModalOpen && !compareModalOpen) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      if (
        accountModalOpen &&
        accountTotalInfoToggle instanceof HTMLButtonElement &&
        accountTotalInfoToggle.getAttribute('aria-expanded') === 'true'
      ) {
        setAccountTotalInfoOpen(false);
        return;
      }

      if (compareModalOpen) {
        closeCompareModal();
      } else if (accountModalOpen) {
        closeAccountModal();
      } else {
        closeFilterModal();
      }
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const activeDialog = compareModalOpen
      ? compareDialog
      : accountModalOpen
        ? accountDialog
        : filterDialog;
    const focusableNodes = compareModalOpen
      ? getCompareModalFocusableElements()
      : accountModalOpen
        ? getAccountModalFocusableElements()
        : getFilterModalFocusableElements();

    if (!focusableNodes.length) {
      if (activeDialog instanceof HTMLElement) {
        event.preventDefault();
        activeDialog.focus();
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
    scheduleTabsOverflowSync();
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

  const handleDetailEditorialViewportChange = () => {
    if (detailView.hidden) {
      return;
    }

    void renderRouteFromLocation();
  };

  if (typeof DETAIL_EDITORIAL_HERO_QUERY.addEventListener === 'function') {
    DETAIL_EDITORIAL_HERO_QUERY.addEventListener(
      'change',
      handleDetailEditorialViewportChange
    );
  } else if (typeof DETAIL_EDITORIAL_HERO_QUERY.addListener === 'function') {
    DETAIL_EDITORIAL_HERO_QUERY.addListener(handleDetailEditorialViewportChange);
  }

  window.addEventListener('popstate', () => {
    const direction = inferMenuRouteTransitionDirection();
    void runMenuRouteViewTransition(() => renderRouteFromLocation(), {
      direction,
    });
  });

  if (isAdminPreviewMode) {
    window.addEventListener('message', handleAdminPreviewBridgeMessage);
    bindAdminPreviewSectionNavigation();
  }

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
    openAccountModal: () => {
      openAccountModal();
      return state.accountModalOpen;
    },
    closeAccountModal: (options) => {
      closeAccountModal(options);
      return state.accountModalOpen;
    },
    toggleAccountModal: () => {
      if (state.accountModalOpen) {
        closeAccountModal();
      } else {
        openAccountModal();
      }

      return state.accountModalOpen;
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

  window.addEventListener('figata:menu-page-navbar-ready', () => {
    syncMenuCartBadges();
  });

  window.addEventListener('storage', (event) => {
    if (event.storageArea !== window.localStorage) {
      return;
    }

    if (event.key !== ACCOUNT_STORAGE_KEY) {
      return;
    }

    hideAccountRemovalToast();
    hydrateAccountSession();
  });

  syncAccountCheckoutTarget();
  void loadRestaurantCommerceContact();

  void (async () => {
    try {
      await renderMenu();
      hydrateAccountSession();
      renderSearchHelperWord(searchHelperWords[0]);
      syncSearchHelperWidth();
      syncSearchControls();
      await renderRouteFromLocation();
      if (adminPreviewSurface === ADMIN_PREVIEW_SURFACE_MODAL) {
        openAdminPreviewModalSurface({
          modalKey: adminPreviewModalActive,
          smooth: false,
        });
      }
      emitBridgeState();
      finishBridgeReady();
    } catch (error) {
      console.error('[menu-page] Error renderizando menú.', error);
      emitCatalogLqipReady({ reason: 'catalog-error' });
      const stateCopy = getMenuPageStateCopy();
      clearInitialMobileCatalogSeed();
      contentRoot.replaceChildren();
      setStatus(
        normalizeText(stateCopy?.loadError) ||
          MENU_PAGE_COPY_DEFAULTS.states.loadError,
        { isError: true }
      );
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
