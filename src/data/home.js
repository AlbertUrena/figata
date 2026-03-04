(() => {
  const HOME_URL = new URL('data/home.json', window.location.href);
  const MENU_URL = new URL('data/menu.json', window.location.href);

  const DEFAULT_HERO_BACKGROUND = 'assets/seamless-bg.png';
  const DEFAULT_POPULAR_LIMIT = 8;
  const DEFAULT_EVENTS_LIMIT = 3;
  const DEFAULT_FEATURED_IDS = [
    'margherita',
    'diavola',
    'sweet_goat',
    'figata',
    'margherita_sbagliata',
    'vulcano',
  ];

  const DEFAULT_EVENTS_ITEMS = [
    {
      id: 'celebraciones_in_house',
      title: 'Celebraciones In-House',
      subtitle: 'Celebra tu evento en nuestro local',
      video: '/videos/tab0.mp4',
    },
    {
      id: 'pizza_party_domicilio',
      title: 'Pizza Party a Domicilio',
      subtitle: 'Experiencia Figata donde estes',
      video: '/videos/tab1.mp4',
    },
    {
      id: 'noches_especiales',
      title: 'Noches Especiales',
      subtitle: 'Catas y eventos privados en Figata',
      video: '/videos/tab2.mp4',
    },
  ];

  const DEFAULT_HOME = {
    version: 1,
    schema: 'figata.home.v1',
    hero: {
      title: 'Pizza napolitana autentica',
      subtitle:
        'Horneada en horno de lena, con ingredientes seleccionados y maridajes de la casa.',
      backgroundImage: DEFAULT_HERO_BACKGROUND,
      ctaPrimary: {
        label: 'Ver menu',
        url: '#menu',
      },
      ctaSecondary: {
        label: 'Reservar',
        url: '#reservar',
      },
    },
    popular: {
      title: 'Las mas pedidas',
      subtitle: 'Favoritas de nuestros clientes',
      featuredIds: DEFAULT_FEATURED_IDS.slice(),
      limit: DEFAULT_POPULAR_LIMIT,
    },
    eventsPreview: {
      enabled: true,
      title: 'Eventos en Figata',
      subtitle:
        'Llevamos el sabor de Figata a cada ocasion, dentro o fuera de nuestra casa.',
      eventIds: DEFAULT_EVENTS_ITEMS.map((item) => item.id),
      limit: DEFAULT_EVENTS_LIMIT,
      items: DEFAULT_EVENTS_ITEMS.slice(),
    },
    delivery: {
      title: 'Pide desde casa',
      subtitle:
        'Pide por nuestras plataformas oficiales y recibe la pizza recien horneada donde estes, o para llevar.',
      links: {
        pedidosya: '',
        ubereats: '',
        takeout: '/menu',
        whatsapp: 'https://wa.me/18090000000',
      },
    },
    reservation: {
      enabled: true,
      title: 'Reserva tu mesa',
      url: '#reservar',
      ctaLabel: 'Reservar ahora',
    },
    announcements: {
      enabled: false,
      message: '',
      type: 'highlight',
      link: '',
    },
    sections: {
      hero: true,
      popular: true,
      events: true,
      delivery: true,
      reservation: true,
      announcements: true,
    },
  };

  let cachedHomeStorePromise;

  const clone = (value) => JSON.parse(JSON.stringify(value));

  const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

  const normalizeId = (value) => String(value || '').trim();

  const normalizeBoolean = (value, fallback = false) =>
    typeof value === 'boolean' ? value : fallback;

  const normalizeNumber = (value, fallback = 0) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
  };

  const normalizeStringArray = (value) =>
    Array.isArray(value) ? value.map(normalizeId).filter(Boolean) : [];

  const normalizeAssetPath = (value, fallback = '') => {
    const normalized = normalizeText(value);

    if (!normalized) {
      return fallback;
    }

    return normalized.startsWith('/') ? normalized.slice(1) : normalized;
  };

  const isValidLink = (value) => {
    const link = normalizeText(value);

    if (!link) {
      return false;
    }

    if (
      link.startsWith('/') ||
      link.startsWith('#') ||
      link.startsWith('mailto:') ||
      link.startsWith('tel:')
    ) {
      return true;
    }

    try {
      const parsed = new URL(link);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (error) {
      return false;
    }
  };

  const normalizeLink = (value, fallback = '') => {
    const normalized = normalizeText(value);

    if (!normalized) {
      return fallback;
    }

    return isValidLink(normalized) ? normalized : fallback;
  };

  const normalizePositiveInt = (value, fallback) => {
    const numeric = Math.round(normalizeNumber(value, fallback));
    return numeric > 0 ? numeric : fallback;
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

      console.warn(`[home] No se pudo cargar ${label}; se usara fallback.`, error);
      return defaultValue;
    }
  };

  const normalizeCta = (input, fallback) => {
    const fallbackLabel = normalizeText(fallback?.label);
    const fallbackUrl = normalizeText(fallback?.url);
    const label = normalizeText(input?.label) || fallbackLabel;
    const url = normalizeLink(input?.url, fallbackUrl);

    return {
      label,
      url,
    };
  };

  const normalizeHero = (heroInput) => {
    const fallback = DEFAULT_HOME.hero;

    return {
      title: normalizeText(heroInput?.title) || fallback.title,
      subtitle: normalizeText(heroInput?.subtitle) || fallback.subtitle,
      backgroundImage: normalizeAssetPath(
        heroInput?.backgroundImage,
        fallback.backgroundImage
      ),
      ctaPrimary: normalizeCta(heroInput?.ctaPrimary, fallback.ctaPrimary),
      ctaSecondary: normalizeCta(heroInput?.ctaSecondary, fallback.ctaSecondary),
    };
  };

  const normalizePopular = (popularInput) => {
    const fallback = DEFAULT_HOME.popular;

    return {
      title: normalizeText(popularInput?.title) || fallback.title,
      subtitle: normalizeText(popularInput?.subtitle) || fallback.subtitle,
      featuredIds: normalizeStringArray(popularInput?.featuredIds),
      limit: normalizePositiveInt(popularInput?.limit, fallback.limit),
    };
  };

  const normalizeEventItem = (item, index) => {
    const defaultItem = DEFAULT_EVENTS_ITEMS[index] || {};
    const id = normalizeId(item?.id || defaultItem.id || `evento_${index + 1}`);

    return {
      id,
      title:
        normalizeText(item?.title) ||
        normalizeText(defaultItem.title) ||
        `Evento ${index + 1}`,
      subtitle:
        normalizeText(item?.subtitle) ||
        normalizeText(defaultItem.subtitle) ||
        '',
      video: normalizeText(item?.video) || normalizeText(defaultItem.video),
    };
  };

  const normalizeEventsPreview = (eventsInput) => {
    const fallback = DEFAULT_HOME.eventsPreview;
    const rawItems = Array.isArray(eventsInput?.items) ? eventsInput.items : [];
    const normalizedItemsSource = rawItems.length ? rawItems : fallback.items;
    const items = normalizedItemsSource.map(normalizeEventItem).filter((item) => item.id);
    const limit = normalizePositiveInt(eventsInput?.limit, fallback.limit);
    const safeLimit = Math.min(limit, Math.max(items.length, 1));
    const slicedItems = items.slice(0, safeLimit);
    const sourceEventIds = normalizeStringArray(eventsInput?.eventIds);

    return {
      enabled: normalizeBoolean(eventsInput?.enabled, fallback.enabled),
      title: normalizeText(eventsInput?.title) || fallback.title,
      subtitle: normalizeText(eventsInput?.subtitle) || fallback.subtitle,
      eventIds: sourceEventIds.length
        ? sourceEventIds.slice(0, safeLimit)
        : slicedItems.map((item) => item.id),
      limit: safeLimit,
      items: slicedItems,
    };
  };

  const normalizeDelivery = (deliveryInput) => {
    const fallback = DEFAULT_HOME.delivery;
    const links = deliveryInput?.links || {};

    return {
      title: normalizeText(deliveryInput?.title) || fallback.title,
      subtitle: normalizeText(deliveryInput?.subtitle) || fallback.subtitle,
      links: {
        pedidosya: normalizeLink(links?.pedidosya, ''),
        ubereats: normalizeLink(links?.ubereats, ''),
        takeout: normalizeLink(links?.takeout, ''),
        whatsapp: normalizeLink(links?.whatsapp, ''),
      },
    };
  };

  const normalizeReservation = (reservationInput) => {
    const fallback = DEFAULT_HOME.reservation;

    return {
      enabled: normalizeBoolean(reservationInput?.enabled, fallback.enabled),
      title: normalizeText(reservationInput?.title) || fallback.title,
      url: normalizeLink(reservationInput?.url, fallback.url),
      ctaLabel: normalizeText(reservationInput?.ctaLabel) || fallback.ctaLabel,
    };
  };

  const normalizeAnnouncements = (announcementInput) => {
    const fallback = DEFAULT_HOME.announcements;

    return {
      enabled: normalizeBoolean(announcementInput?.enabled, fallback.enabled),
      message: normalizeText(announcementInput?.message),
      type: normalizeText(announcementInput?.type) || fallback.type,
      link: normalizeLink(announcementInput?.link, ''),
    };
  };

  const normalizeSections = (sectionsInput) => {
    const fallback = DEFAULT_HOME.sections;

    return {
      hero: normalizeBoolean(sectionsInput?.hero, fallback.hero),
      popular: normalizeBoolean(sectionsInput?.popular, fallback.popular),
      events: normalizeBoolean(sectionsInput?.events, fallback.events),
      delivery: normalizeBoolean(sectionsInput?.delivery, fallback.delivery),
      reservation: normalizeBoolean(sectionsInput?.reservation, fallback.reservation),
      announcements: normalizeBoolean(
        sectionsInput?.announcements,
        fallback.announcements
      ),
    };
  };

  const normalizeHome = (homeInput) => {
    const source = homeInput && typeof homeInput === 'object' ? homeInput : {};

    return {
      version: normalizePositiveInt(source?.version, DEFAULT_HOME.version),
      schema: normalizeText(source?.schema) || DEFAULT_HOME.schema,
      hero: normalizeHero(source?.hero),
      popular: normalizePopular(source?.popular),
      eventsPreview: normalizeEventsPreview(source?.eventsPreview),
      delivery: normalizeDelivery(source?.delivery),
      reservation: normalizeReservation(source?.reservation),
      announcements: normalizeAnnouncements(source?.announcements),
      sections: normalizeSections(source?.sections),
    };
  };

  const collectMenuIdsFromJson = (menuJson) => {
    const ids = new Set();
    const sections = Array.isArray(menuJson?.sections) ? menuJson.sections : [];

    sections.forEach((section) => {
      const items = Array.isArray(section?.items) ? section.items : [];
      items.forEach((item) => {
        const id = normalizeId(item?.id);
        if (id) {
          ids.add(id);
        }
      });
    });

    return ids;
  };

  const loadMenuItemIdSet = async () => {
    try {
      const menuApi = window.FigataData?.menu;

      if (menuApi?.loadMenuStore) {
        const menuStore = await menuApi.loadMenuStore();
        const ids = new Set();
        (menuStore?.items || []).forEach((item) => {
          const id = normalizeId(item?.id);
          if (id) {
            ids.add(id);
          }
        });

        if (ids.size > 0) {
          return ids;
        }
      }
    } catch (error) {
      console.warn('[home] No se pudieron cargar IDs desde menu API; usando fallback.', error);
    }

    const menuJson = await fetchJson(MENU_URL, 'menu.json', {
      optional: true,
      defaultValue: null,
    });

    return collectMenuIdsFromJson(menuJson);
  };

  const coerceFeaturedIds = (requestedIds, menuIds, limit, warnings) => {
    const validRequestedIds = [];
    const invalidIds = [];
    const seen = new Set();

    requestedIds.forEach((id) => {
      if (seen.has(id)) {
        return;
      }

      seen.add(id);

      if (!menuIds.has(id)) {
        invalidIds.push(id);
        return;
      }

      validRequestedIds.push(id);
    });

    if (invalidIds.length > 0) {
      warnings.push(
        `popular.featuredIds contiene IDs inexistentes en menu.json: ${invalidIds.join(', ')}`
      );
    }

    if (validRequestedIds.length > 0) {
      return validRequestedIds.slice(0, limit);
    }

    const defaults = DEFAULT_FEATURED_IDS.filter((id) => menuIds.has(id));

    if (defaults.length > 0) {
      warnings.push(
        'popular.featuredIds vacio o invalido. Se aplico fallback con defaults internos.'
      );
      return defaults.slice(0, limit);
    }

    const firstMenuIds = Array.from(menuIds).slice(0, limit);

    if (firstMenuIds.length > 0) {
      warnings.push(
        'popular.featuredIds vacio o invalido. Se aplico fallback con primeros items del menu.'
      );
      return firstMenuIds;
    }

    warnings.push('No hay items en menu.json para resolver popular.featuredIds.');
    return [];
  };

  const validateAndFinalizeHome = (home, menuIds) => {
    const warnings = [];
    const errors = [];
    const normalized = clone(home);

    normalized.hero.backgroundImage =
      normalizeAssetPath(normalized.hero.backgroundImage, DEFAULT_HERO_BACKGROUND) ||
      DEFAULT_HERO_BACKGROUND;

    if (!normalizeText(normalized.hero.title)) {
      errors.push('hero.title es requerido.');
    }

    if (!normalizeText(normalized.hero.subtitle)) {
      warnings.push('hero.subtitle vacio. Se recomienda definirlo.');
    }

    if (!isValidLink(normalized.hero.ctaPrimary.url)) {
      warnings.push('hero.ctaPrimary.url invalida. Se uso fallback #menu.');
      normalized.hero.ctaPrimary.url = '#menu';
    }

    if (!isValidLink(normalized.hero.ctaSecondary.url)) {
      warnings.push('hero.ctaSecondary.url invalida. Se uso fallback #reservar.');
      normalized.hero.ctaSecondary.url = '#reservar';
    }

    normalized.popular.limit = normalizePositiveInt(
      normalized.popular.limit,
      DEFAULT_POPULAR_LIMIT
    );

    normalized.popular.featuredIds = coerceFeaturedIds(
      normalized.popular.featuredIds,
      menuIds,
      normalized.popular.limit,
      warnings
    );

    normalized.eventsPreview.limit = normalizePositiveInt(
      normalized.eventsPreview.limit,
      DEFAULT_EVENTS_LIMIT
    );

    if (!Array.isArray(normalized.eventsPreview.items) || normalized.eventsPreview.items.length === 0) {
      normalized.eventsPreview.items = DEFAULT_EVENTS_ITEMS.slice(0, normalized.eventsPreview.limit);
      warnings.push('eventsPreview.items vacio. Se aplico fallback interno.');
    }

    normalized.eventsPreview.items = normalized.eventsPreview.items
      .slice(0, normalized.eventsPreview.limit)
      .map((item, index) => normalizeEventItem(item, index));

    normalized.eventsPreview.eventIds = normalized.eventsPreview.items.map((item) => item.id);

    ['pedidosya', 'ubereats', 'takeout', 'whatsapp'].forEach((key) => {
      const value = normalizeText(normalized.delivery.links[key]);

      if (value && !isValidLink(value)) {
        warnings.push(`delivery.links.${key} invalido. Se ocultara ese boton.`);
        normalized.delivery.links[key] = '';
      }
    });

    if (!normalizeText(normalized.delivery.title)) {
      warnings.push('delivery.title vacio. Se uso fallback.');
      normalized.delivery.title = DEFAULT_HOME.delivery.title;
    }

    if (!normalizeText(normalized.reservation.ctaLabel)) {
      warnings.push('reservation.ctaLabel vacio. Se uso fallback.');
      normalized.reservation.ctaLabel = DEFAULT_HOME.reservation.ctaLabel;
    }

    if (!isValidLink(normalized.reservation.url)) {
      warnings.push('reservation.url invalida. Se uso fallback #reservar.');
      normalized.reservation.url = '#reservar';
    }

    if (normalizeText(normalized.announcements.link) && !isValidLink(normalized.announcements.link)) {
      warnings.push('announcements.link invalido. Se removio.');
      normalized.announcements.link = '';
    }

    if (normalized.announcements.enabled && !normalizeText(normalized.announcements.message)) {
      warnings.push('announcements.enabled=true sin message. Se desactiva el anuncio.');
      normalized.announcements.enabled = false;
    }

    return {
      home: normalized,
      validation: {
        isValid: errors.length === 0,
        errors,
        warnings,
      },
    };
  };

  const buildHomeStore = async () => {
    const [homeJson, menuIds] = await Promise.all([
      fetchJson(HOME_URL, 'home.json', {
        optional: true,
        defaultValue: null,
      }),
      loadMenuItemIdSet(),
    ]);

    const normalizedHome = normalizeHome(homeJson);
    const finalized = validateAndFinalizeHome(normalizedHome, menuIds);

    finalized.validation.warnings.forEach((warning) => {
      console.warn(`[home] ${warning}`);
    });

    finalized.validation.errors.forEach((error) => {
      console.error(`[home] ${error}`);
    });

    return finalized;
  };

  const loadHomeStore = async () => {
    if (!cachedHomeStorePromise) {
      cachedHomeStorePromise = buildHomeStore();
    }

    return cachedHomeStorePromise;
  };

  const getHomeConfig = async () => {
    const { home } = await loadHomeStore();
    return clone(home);
  };

  const getHomeValidation = async () => {
    const { validation } = await loadHomeStore();
    return clone(validation);
  };

  window.FigataData = window.FigataData || {};
  window.FigataData.home = {
    loadHomeStore,
    getHomeConfig,
    getHomeValidation,
    DEFAULT_HERO_BACKGROUND,
  };
})();
