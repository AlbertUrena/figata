(() => {
  const ROOT_URL = new URL('/', window.location.origin);
  const HOME_URL = new URL('data/home.json', ROOT_URL);
  const MENU_URL = new URL('data/menu.json', ROOT_URL);

  const DEFAULT_HERO_BACKGROUND = 'assets/home/seamless-bg.webp';
  const DEFAULT_POPULAR_LIMIT = 8;
  const DEFAULT_EVENTS_LIMIT = 3;
  const DEFAULT_TESTIMONIALS_LIMIT = 9;
  const DEFAULT_FOOTER_COLUMNS_COUNT = 3;
  const DEFAULT_FOOTER_LINKS_LIMIT = 8;
  const TESTIMONIAL_STARS_MIN = 1;
  const TESTIMONIAL_STARS_MAX = 5;
  const DELIVERY_ICON_MIN_SIZE = 16;
  const DELIVERY_ICON_MAX_SIZE = 64;
  const ANNOUNCEMENT_TYPES = ['highlight', 'warning', 'info'];
  const DELIVERY_PLATFORM_KEYS = ['pedidosya', 'ubereats', 'takeout', 'whatsapp'];
  const FOOTER_SOCIAL_KEYS = ['instagram', 'tiktok', 'tripadvisor'];
  const DEFAULT_DELIVERY_PLATFORMS = {
    pedidosya: {
      url: '#',
      icon: 'assets/svg-icons/pedidosya.svg',
      iconSize: 40,
    },
    ubereats: {
      url: '#',
      icon: 'assets/svg-icons/uber-eats.svg',
      iconSize: 32,
    },
    takeout: {
      url: '',
      icon: 'assets/svg-icons/menu-icon.svg',
      iconSize: 26,
    },
    whatsapp: {
      url: '',
      icon: 'assets/svg-icons/whatsapp.svg',
      iconSize: 26,
    },
  };
  const DEFAULT_NAVBAR_ICON = 'assets/svg-icons/whatsapp.svg';
  const DEFAULT_NAVBAR_LINKS = [
    { label: 'Menú', url: '/menu/' },
    { label: 'Nosotros', url: '#nosotros' },
    { label: 'Ubicación', url: '#ubicacion' },
    { label: 'Contacto', url: '#contacto' },
  ];
  const DEFAULT_FOOTER_COLUMNS = [
    {
      title: 'Empresa',
      links: [
        { label: 'Menu', url: '/menu/' },
        { label: 'Nosotros', url: '#nosotros' },
        { label: 'FAQs', url: '#faqs' },
        { label: 'Eventos', url: '#eventos' },
      ],
    },
    {
      title: 'Socials',
      links: [
        { label: 'Instagram', url: '' },
        { label: 'TikTok', url: '' },
        { label: 'Trip Advisor', url: '' },
      ],
    },
    {
      title: 'Contactanos',
      links: [],
    },
  ];
  const DEFAULT_FOOTER_CTA = {
    label: 'Como llegar',
    url: '#ubicacion',
  };
  const DEFAULT_FOOTER_SOCIALS = {
    instagram: '',
    tiktok: '',
    tripadvisor: '',
  };
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
    },
    {
      id: 'pizza_party_domicilio',
      title: 'Pizza Party a Domicilio',
      subtitle: 'Experiencia Figata donde estes',
    },
    {
      id: 'noches_especiales',
      title: 'Noches Especiales',
      subtitle: 'Catas y eventos privados en Figata',
    },
  ];

  const DEFAULT_TESTIMONIALS_ITEMS = [
    {
      name: 'Awilda Suero',
      role: 'Local Guide',
      text: 'We ordered for delivery, it was 10 out of 10. Great ingredients and real Neapolitan pizza from wood oven.',
      stars: 5,
    },
    {
      name: 'Fabio Reyes',
      role: 'Cliente frecuente',
      text: 'Sus pizzas son excelentes, hechas con ingredientes de alta calidad y con muy buen ambiente en el local.',
      stars: 5,
    },
    {
      name: 'Karla Villar',
      role: 'Food lover',
      text: 'La pizza artesanal es excelente. Si te gusta probar cervezas diferentes, este lugar vale la pena.',
      stars: 4,
    },
    {
      name: 'Liecel Franco',
      role: 'Cliente',
      text: 'Tienen una variedad deliciosa de pizza, muy buen cafe y cocteles. Siempre regresamos.',
      stars: 5,
    },
    {
      name: 'Prysla Rodriguez',
      role: 'Local Guide',
      text: 'La mejor pizza napolitana que he probado. Textura, sabor y servicio, todo excelente.',
      stars: 5,
    },
    {
      name: 'Angel Tejeda Pina',
      role: 'Cliente',
      text: 'Desde que abres la puerta el olor a pizza te gana. Servicio excelente y pizzas espectaculares.',
      stars: 5,
    },
    {
      name: 'Massiel Beltre',
      role: 'Cliente frecuente',
      text: 'Mi restaurante favorito en Santo Domingo Este. Buenisimas pizzas, excelente servicio y ambiente.',
      stars: 5,
    },
    {
      name: 'Vianneris Morillo',
      role: 'Foodie',
      text: 'Cocteles riquisimos, pizzas llenas de sabor y un tiramisu increible. Muy recomendado.',
      stars: 5,
    },
    {
      name: 'Ricardo Restituyo',
      role: 'Local Guide',
      text: 'Great pizzas, very good value and attentive staff. Sweet Goat and Figata are must-tries.',
      stars: 5,
    },
  ];

  const cloneFooterColumns = () =>
    DEFAULT_FOOTER_COLUMNS.map((column) => ({
      title: column.title,
      links: (column.links || []).map((linkEntry) => ({
        label: linkEntry.label,
        url: linkEntry.url,
      })),
    }));

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
        url: '/menu/',
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
      title: 'Figata en tu casa',
      subtitle:
        'Pide por nuestras plataformas oficiales y recibe la pizza recien horneada donde estes, o para llevar.',
      platforms: {
        pedidosya: { ...DEFAULT_DELIVERY_PLATFORMS.pedidosya },
        ubereats: { ...DEFAULT_DELIVERY_PLATFORMS.ubereats },
        takeout: { ...DEFAULT_DELIVERY_PLATFORMS.takeout },
        whatsapp: { ...DEFAULT_DELIVERY_PLATFORMS.whatsapp },
      },
    },
    navbar: {
      links: DEFAULT_NAVBAR_LINKS.slice(),
      cta: {
        label: 'Reservar ahora',
        url: '#reservar',
        icon: DEFAULT_NAVBAR_ICON,
        title: 'Reserva tu mesa',
      },
    },
    announcements: {
      enabled: false,
      message: '',
      type: 'highlight',
      link: '',
    },
    testimonials: {
      enabled: true,
      title: 'Historias que nacen en nuestra mesa',
      subtitle:
        'Clientes que volvieron por la masa, el fuego y el ambiente de Figata.',
      items: DEFAULT_TESTIMONIALS_ITEMS.map((item) => ({ ...item })),
    },
    footer: {
      enabled: true,
      columns: cloneFooterColumns(),
      cta: {
        ...DEFAULT_FOOTER_CTA,
      },
      socials: {
        ...DEFAULT_FOOTER_SOCIALS,
      },
      note: '',
    },
    sections: {
      navbar: true,
      hero: true,
      popular: true,
      events: true,
      delivery: true,
      announcements: true,
      testimonials: true,
      footer: true,
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

  const normalizeIconSize = (value, fallback) => {
    const numeric = Math.round(normalizeNumber(value, fallback));
    if (!Number.isFinite(numeric)) {
      return fallback;
    }
    return Math.max(DELIVERY_ICON_MIN_SIZE, Math.min(DELIVERY_ICON_MAX_SIZE, numeric));
  };

  const normalizeTestimonialsStars = (value, fallback = TESTIMONIAL_STARS_MAX) => {
    const numeric = Math.round(normalizeNumber(value, fallback));
    if (!Number.isFinite(numeric)) {
      return fallback;
    }
    return Math.max(TESTIMONIAL_STARS_MIN, Math.min(TESTIMONIAL_STARS_MAX, numeric));
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
    const platformsInput = deliveryInput?.platforms || {};
    const platforms = {};

    DELIVERY_PLATFORM_KEYS.forEach((key) => {
      const fallbackPlatform = fallback.platforms[key] || DEFAULT_DELIVERY_PLATFORMS[key];
      const platformInput = platformsInput?.[key] || {};
      const legacyUrl = links?.[key];

      platforms[key] = {
        url: normalizeLink(platformInput?.url ?? legacyUrl, fallbackPlatform.url || ''),
        icon: normalizeAssetPath(platformInput?.icon, fallbackPlatform.icon || ''),
        iconSize: normalizeIconSize(platformInput?.iconSize, fallbackPlatform.iconSize),
      };
    });

    return {
      title: normalizeText(deliveryInput?.title) || fallback.title,
      subtitle: normalizeText(deliveryInput?.subtitle) || fallback.subtitle,
      platforms,
    };
  };

  const normalizeNavbar = (navbarInput, legacyReservationInput) => {
    const fallback = DEFAULT_HOME.navbar;
    const rawLinks = Array.isArray(navbarInput?.links) ? navbarInput.links : [];
    const links = rawLinks
      .map((entry) => ({
        label: normalizeText(entry?.label),
        url: normalizeLink(entry?.url, ''),
      }))
      .filter((entry) => entry.label || entry.url)
      .map((entry, index) => ({
        label: entry.label || `Link ${index + 1}`,
        url: entry.url || '#',
      }));
    const normalizedLinks = links.length > 0 ? links : fallback.links;
    const fallbackLabel = normalizeText(legacyReservationInput?.ctaLabel) || fallback.cta.label;
    const fallbackUrl = normalizeLink(legacyReservationInput?.url, fallback.cta.url);
    const fallbackTitle = normalizeText(legacyReservationInput?.title) || fallback.cta.title;

    return {
      links: normalizedLinks,
      cta: {
        label: normalizeText(navbarInput?.cta?.label) || fallbackLabel,
        url: normalizeLink(navbarInput?.cta?.url, fallbackUrl),
        icon: normalizeAssetPath(navbarInput?.cta?.icon, fallback.cta.icon),
        title: normalizeText(navbarInput?.cta?.title) || fallbackTitle,
      },
    };
  };

  const normalizeAnnouncements = (announcementInput) => {
    const fallback = DEFAULT_HOME.announcements;
    const requestedType = normalizeText(announcementInput?.type);

    return {
      enabled: normalizeBoolean(announcementInput?.enabled, fallback.enabled),
      message: normalizeText(announcementInput?.message),
      type: ANNOUNCEMENT_TYPES.includes(requestedType) ? requestedType : fallback.type,
      link: normalizeLink(announcementInput?.link, ''),
    };
  };

  const normalizeTestimonialItem = (item, index) => {
    const safeItem = item && typeof item === 'object' ? item : {};
    const fallbackItem =
      DEFAULT_TESTIMONIALS_ITEMS[index] ||
      DEFAULT_TESTIMONIALS_ITEMS[DEFAULT_TESTIMONIALS_ITEMS.length - 1] ||
      {};

    return {
      name: normalizeText(safeItem?.name) || normalizeText(fallbackItem?.name) || `Cliente ${index + 1}`,
      role: normalizeText(safeItem?.role) || normalizeText(fallbackItem?.role) || 'Cliente',
      text: normalizeText(safeItem?.text) || normalizeText(fallbackItem?.text) || '',
      stars: normalizeTestimonialsStars(safeItem?.stars, normalizeTestimonialsStars(fallbackItem?.stars, 5)),
    };
  };

  const normalizeTestimonials = (testimonialsInput) => {
    const fallback = DEFAULT_HOME.testimonials;
    const rawItems = Array.isArray(testimonialsInput?.items) ? testimonialsInput.items : [];
    const sourceItems = rawItems.length ? rawItems : fallback.items;

    return {
      enabled: normalizeBoolean(testimonialsInput?.enabled, fallback.enabled),
      title: normalizeText(testimonialsInput?.title) || fallback.title,
      subtitle: normalizeText(testimonialsInput?.subtitle) || fallback.subtitle,
      items: sourceItems
        .slice(0, DEFAULT_TESTIMONIALS_LIMIT)
        .map((item, index) => normalizeTestimonialItem(item, index)),
    };
  };

  const normalizeFooterLink = (linkInput, index) => {
    const safeLink = linkInput && typeof linkInput === 'object' ? linkInput : {};
    const label = normalizeText(safeLink?.label);
    const url = normalizeLink(safeLink?.url, '');
    if (!label && !url) {
      return null;
    }

    return {
      label: label || `Link ${index + 1}`,
      url,
    };
  };

  const normalizeFooterColumn = (columnInput, index, fallbackColumn) => {
    const safeColumn = columnInput && typeof columnInput === 'object' ? columnInput : {};
    const fallback = fallbackColumn && typeof fallbackColumn === 'object' ? fallbackColumn : {};
    const sourceLinks = Array.isArray(safeColumn.links)
      ? safeColumn.links
      : Array.isArray(fallback.links)
        ? fallback.links
        : [];
    const links = sourceLinks
      .map(normalizeFooterLink)
      .filter(Boolean)
      .slice(0, DEFAULT_FOOTER_LINKS_LIMIT);

    return {
      title: normalizeText(safeColumn.title) || normalizeText(fallback.title) || `Columna ${index + 1}`,
      links,
    };
  };

  const normalizeFooter = (footerInput) => {
    const fallback = DEFAULT_HOME.footer;
    const sourceColumns = Array.isArray(footerInput?.columns) ? footerInput.columns : [];
    const fallbackColumns = Array.isArray(fallback.columns) ? fallback.columns : cloneFooterColumns();
    const columns = [];
    for (let index = 0; index < DEFAULT_FOOTER_COLUMNS_COUNT; index += 1) {
      columns.push(
        normalizeFooterColumn(
          sourceColumns[index],
          index,
          fallbackColumns[index] || DEFAULT_FOOTER_COLUMNS[index]
        )
      );
    }
    const socialsInput =
      footerInput?.socials && typeof footerInput.socials === 'object'
        ? footerInput.socials
        : {};
    const fallbackSocials =
      fallback?.socials && typeof fallback.socials === 'object'
        ? fallback.socials
        : DEFAULT_FOOTER_SOCIALS;
    const socials = {};
    FOOTER_SOCIAL_KEYS.forEach((key) => {
      socials[key] = normalizeLink(socialsInput[key], normalizeLink(fallbackSocials[key], ''));
    });

    return {
      enabled: normalizeBoolean(footerInput?.enabled, fallback.enabled),
      columns,
      cta: {
        label: normalizeText(footerInput?.cta?.label) || fallback.cta.label,
        url: normalizeLink(footerInput?.cta?.url, fallback.cta.url),
      },
      socials,
      note: normalizeText(footerInput?.note) || fallback.note,
    };
  };

  const normalizeSections = (sectionsInput) => {
    const fallback = DEFAULT_HOME.sections;

    return {
      navbar: normalizeBoolean(
        sectionsInput?.navbar,
        normalizeBoolean(sectionsInput?.reservation, fallback.navbar)
      ),
      hero: normalizeBoolean(sectionsInput?.hero, fallback.hero),
      popular: normalizeBoolean(sectionsInput?.popular, fallback.popular),
      events: normalizeBoolean(sectionsInput?.events, fallback.events),
      delivery: normalizeBoolean(sectionsInput?.delivery, fallback.delivery),
      announcements: normalizeBoolean(
        sectionsInput?.announcements,
        fallback.announcements
      ),
      testimonials: normalizeBoolean(
        sectionsInput?.testimonials,
        fallback.testimonials
      ),
      footer: normalizeBoolean(sectionsInput?.footer, fallback.footer),
    };
  };

  const normalizeHome = (homeInput) => {
    const source = homeInput && typeof homeInput === 'object' ? homeInput : {};
    const navbar = normalizeNavbar(source?.navbar, source?.reservation);
    const sections = normalizeSections(source?.sections);

    return {
      version: normalizePositiveInt(source?.version, DEFAULT_HOME.version),
      schema: normalizeText(source?.schema) || DEFAULT_HOME.schema,
      navbar,
      hero: normalizeHero(source?.hero),
      popular: normalizePopular(source?.popular),
      eventsPreview: normalizeEventsPreview(source?.eventsPreview),
      delivery: normalizeDelivery(source?.delivery),
      reservation: {
        enabled: sections.navbar,
        title: navbar.cta.title,
        url: navbar.cta.url,
        ctaLabel: navbar.cta.label,
      },
      announcements: normalizeAnnouncements(source?.announcements),
      testimonials: normalizeTestimonials(source?.testimonials),
      footer: normalizeFooter(source?.footer),
      sections,
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
      warnings.push('hero.ctaPrimary.url invalida. Se uso fallback /menu/.');
      normalized.hero.ctaPrimary.url = '/menu/';
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

    DELIVERY_PLATFORM_KEYS.forEach((key) => {
      const platform = normalized.delivery.platforms?.[key] || {};
      const urlValue = normalizeText(platform.url);
      const fallbackPlatform = DEFAULT_DELIVERY_PLATFORMS[key];

      if (urlValue && !isValidLink(urlValue)) {
        warnings.push(`delivery.platforms.${key}.url invalido. Se ocultara ese boton.`);
        platform.url = '';
      }

      platform.icon = normalizeAssetPath(platform.icon, fallbackPlatform.icon);
      platform.iconSize = normalizeIconSize(platform.iconSize, fallbackPlatform.iconSize);
      normalized.delivery.platforms[key] = platform;
    });

    if (!normalizeText(normalized.delivery.title)) {
      warnings.push('delivery.title vacio. Se uso fallback.');
      normalized.delivery.title = DEFAULT_HOME.delivery.title;
    }

    if (!normalizeText(normalized.navbar.cta.label)) {
      warnings.push('navbar.cta.label vacio. Se uso fallback.');
      normalized.navbar.cta.label = DEFAULT_HOME.navbar.cta.label;
    }

    if (!isValidLink(normalized.navbar.cta.url)) {
      warnings.push('navbar.cta.url invalida. Se uso fallback #reservar.');
      normalized.navbar.cta.url = '#reservar';
    }

    normalized.navbar.cta.icon = normalizeAssetPath(
      normalized.navbar.cta.icon,
      DEFAULT_HOME.navbar.cta.icon
    );
    normalized.navbar.cta.title =
      normalizeText(normalized.navbar.cta.title) || DEFAULT_HOME.navbar.cta.title;

    normalized.reservation = {
      enabled: normalized.sections.navbar,
      title: normalized.navbar.cta.title,
      url: normalized.navbar.cta.url,
      ctaLabel: normalized.navbar.cta.label,
    };

    if (normalizeText(normalized.announcements.link) && !isValidLink(normalized.announcements.link)) {
      warnings.push('announcements.link invalido. Se removio.');
      normalized.announcements.link = '';
    }

    if (normalized.announcements.enabled && !normalizeText(normalized.announcements.message)) {
      warnings.push('announcements.enabled=true sin message. Se desactiva el anuncio.');
      normalized.announcements.enabled = false;
    }

    if (!normalizeText(normalized.testimonials.title)) {
      warnings.push('testimonials.title vacio. Se uso fallback.');
      normalized.testimonials.title = DEFAULT_HOME.testimonials.title;
    }

    if (!normalizeText(normalized.testimonials.subtitle)) {
      warnings.push('testimonials.subtitle vacio. Se uso fallback.');
      normalized.testimonials.subtitle = DEFAULT_HOME.testimonials.subtitle;
    }

    if (!Array.isArray(normalized.testimonials.items) || normalized.testimonials.items.length === 0) {
      warnings.push('testimonials.items vacio. Se uso fallback interno.');
    } else if (normalized.testimonials.items.length > DEFAULT_TESTIMONIALS_LIMIT) {
      warnings.push(
        `testimonials.items excede ${DEFAULT_TESTIMONIALS_LIMIT}. Se truncaron items adicionales.`
      );
    }

    const testimonialsSource =
      Array.isArray(normalized.testimonials.items) && normalized.testimonials.items.length > 0
        ? normalized.testimonials.items
        : DEFAULT_TESTIMONIALS_ITEMS;

    normalized.testimonials.items = testimonialsSource
      .slice(0, DEFAULT_TESTIMONIALS_LIMIT)
      .map((item, index) => normalizeTestimonialItem(item, index));

    if (!Array.isArray(normalized.footer.columns)) {
      warnings.push('footer.columns invalido. Se uso fallback.');
      normalized.footer.columns = cloneFooterColumns();
    } else {
      normalized.footer.columns = normalized.footer.columns
        .slice(0, DEFAULT_FOOTER_COLUMNS_COUNT)
        .map((column, index) =>
          normalizeFooterColumn(
            column,
            index,
            DEFAULT_FOOTER_COLUMNS[index] || DEFAULT_FOOTER_COLUMNS[0]
          )
        );
    }

    if (normalized.footer.columns.length < DEFAULT_FOOTER_COLUMNS_COUNT) {
      for (
        let index = normalized.footer.columns.length;
        index < DEFAULT_FOOTER_COLUMNS_COUNT;
        index += 1
      ) {
        normalized.footer.columns.push(
          normalizeFooterColumn(
            null,
            index,
            DEFAULT_FOOTER_COLUMNS[index] || DEFAULT_FOOTER_COLUMNS[0]
          )
        );
      }
    }

    if (!normalizeText(normalized.footer.cta?.label)) {
      warnings.push('footer.cta.label vacio. Se uso fallback.');
      normalized.footer.cta.label = DEFAULT_FOOTER_CTA.label;
    }
    if (!isValidLink(normalized.footer.cta?.url)) {
      warnings.push('footer.cta.url invalido. Se uso fallback #ubicacion.');
      normalized.footer.cta.url = DEFAULT_FOOTER_CTA.url;
    }

    if (!normalized.footer.socials || typeof normalized.footer.socials !== 'object') {
      normalized.footer.socials = { ...DEFAULT_FOOTER_SOCIALS };
    }
    FOOTER_SOCIAL_KEYS.forEach((key) => {
      const value = normalizeText(normalized.footer.socials[key]);
      if (!value) {
        normalized.footer.socials[key] = '';
        return;
      }
      if (!isValidLink(value)) {
        warnings.push(`footer.socials.${key} invalido. Se omitio.`);
        normalized.footer.socials[key] = '';
      }
    });

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
