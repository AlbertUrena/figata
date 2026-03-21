(() => {
  const publicPaths = window.FigataPublicPaths || null;
  const ROOT_URL = publicPaths?.baseUrl
    ? new URL(publicPaths.baseUrl.toString())
    : new URL(document.baseURI || '/', window.location.origin);
  const RESTAURANT_URL = new URL('data/restaurant.json', ROOT_URL);

  const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const DAY_LABELS = {
    mon: 'Lunes',
    tue: 'Martes',
    wed: 'Miercoles',
    thu: 'Jueves',
    fri: 'Viernes',
    sat: 'Sabado',
    sun: 'Domingo',
  };

  const DEFAULT_RESTAURANT = {
    version: 1,
    schema: 'figata.restaurant.v1',
    updatedAt: '',
    updatedBy: '',
    name: 'Figata Pizza & Wine',
    brand: 'Figata',
    tagline: 'Autentica pizza napolitana con maridajes de vino',
    currency: 'DOP',
    phone: '+1 809-000-0000',
    whatsapp: 'https://wa.me/18090000000',
    reservationUrl: '#reservar',
    googleMapsUrl:
      'https://maps.google.com/?q=Calle+Costa+Rica+142%2C+Alma+Rosa+1%2C+Santo+Domingo+Este',
    address: {
      line1: 'Calle Costa Rica No. 142',
      line2: 'Urbanizacion Alma Rosa 1',
      city: 'Santo Domingo Este',
      area: 'Ensanche Ozama',
      country: 'DO',
      postalCode: '11506',
    },
    openingHours: {
      mon: null,
      tue: '12:00-22:00',
      wed: '12:00-22:00',
      thu: '12:00-22:00',
      fri: '12:00-23:00',
      sat: '12:00-23:00',
      sun: '12:00-22:00',
    },
    openingHoursExceptions: [],
    social: {
      instagram: '',
      tiktok: '',
      tripadvisor: '',
    },
    seo: {
      title: 'Figata Pizza & Wine',
      description:
        'Pizzas napolitanas al horno de lena, vino y una experiencia premium en Santo Domingo Este.',
      url: '/',
      image: 'assets/home/location.webp',
    },
  };

  let cachedRestaurantStorePromise;

  const clone = (value) => JSON.parse(JSON.stringify(value));

  const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

  const normalizeUpper = (value) => normalizeText(value).toUpperCase();

  const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

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

  const isValidHoursRange = (value) => /^\d{2}:\d{2}-\d{2}:\d{2}$/.test(normalizeText(value));

  const normalizeOpeningHours = (inputHours = null, fallbackHours = DEFAULT_RESTAURANT.openingHours) => {
    const source = isObject(inputHours) ? inputHours : {};
    const fallback = isObject(fallbackHours) ? fallbackHours : DEFAULT_RESTAURANT.openingHours;
    const normalized = {};

    DAY_ORDER.forEach((dayKey) => {
      const rawValue = source[dayKey];

      if (rawValue === null) {
        normalized[dayKey] = null;
        return;
      }

      const asText = normalizeText(rawValue);

      if (isValidHoursRange(asText)) {
        normalized[dayKey] = asText;
        return;
      }

      normalized[dayKey] = fallback[dayKey] ?? null;
    });

    return normalized;
  };

  const normalizeAddress = (inputAddress = null, fallbackAddress = DEFAULT_RESTAURANT.address) => {
    const source = isObject(inputAddress) ? inputAddress : {};
    const fallback = isObject(fallbackAddress) ? fallbackAddress : DEFAULT_RESTAURANT.address;

    return {
      line1: normalizeText(source.line1) || fallback.line1,
      line2: normalizeText(source.line2) || fallback.line2,
      city: normalizeText(source.city) || fallback.city,
      area: normalizeText(source.area) || fallback.area,
      country: normalizeUpper(source.country) || fallback.country,
      postalCode: normalizeText(source.postalCode) || fallback.postalCode,
    };
  };

  const formatAddressInline = (address) => {
    const parts = [
      normalizeText(address?.line1),
      normalizeText(address?.line2),
      normalizeText(address?.city),
      normalizeText(address?.area),
      normalizeUpper(address?.country),
    ].filter(Boolean);

    return parts.join(', ');
  };

  const phoneToTel = (phoneValue) => {
    const phone = normalizeText(phoneValue);

    if (!phone) {
      return '';
    }

    const normalized = phone.replace(/[^\d+]/g, '');
    return normalized ? `tel:${normalized}` : '';
  };

  const normalizeSocial = (inputSocial = null, fallbackSocial = DEFAULT_RESTAURANT.social) => {
    const source = isObject(inputSocial) ? inputSocial : {};
    const fallback = isObject(fallbackSocial) ? fallbackSocial : DEFAULT_RESTAURANT.social;

    return {
      instagram: normalizeLink(source.instagram, normalizeLink(fallback.instagram, '')),
      tiktok: normalizeLink(source.tiktok, normalizeLink(fallback.tiktok, '')),
      tripadvisor: normalizeLink(source.tripadvisor, normalizeLink(fallback.tripadvisor, '')),
    };
  };

  const normalizeSeo = (inputSeo = null, fallbackSeo = DEFAULT_RESTAURANT.seo) => {
    const source = isObject(inputSeo) ? inputSeo : {};
    const fallback = isObject(fallbackSeo) ? fallbackSeo : DEFAULT_RESTAURANT.seo;

    return {
      title: normalizeText(source.title) || fallback.title,
      description: normalizeText(source.description) || fallback.description,
      url: normalizeLink(source.url, fallback.url),
      image: normalizeText(source.image) || fallback.image,
    };
  };

  const normalizeRestaurant = (restaurantInput = null) => {
    const source = isObject(restaurantInput) ? restaurantInput : {};

    return {
      version: Number.isFinite(Number(source.version)) ? Number(source.version) : DEFAULT_RESTAURANT.version,
      schema: normalizeText(source.schema) || DEFAULT_RESTAURANT.schema,
      updatedAt: normalizeText(source.updatedAt),
      updatedBy: normalizeText(source.updatedBy),
      name: normalizeText(source.name) || DEFAULT_RESTAURANT.name,
      brand: normalizeText(source.brand) || DEFAULT_RESTAURANT.brand,
      tagline: normalizeText(source.tagline) || DEFAULT_RESTAURANT.tagline,
      currency: normalizeUpper(source.currency) || DEFAULT_RESTAURANT.currency,
      phone: normalizeText(source.phone) || DEFAULT_RESTAURANT.phone,
      whatsapp: normalizeLink(source.whatsapp, DEFAULT_RESTAURANT.whatsapp),
      reservationUrl: normalizeLink(source.reservationUrl, DEFAULT_RESTAURANT.reservationUrl),
      googleMapsUrl: normalizeLink(source.googleMapsUrl, DEFAULT_RESTAURANT.googleMapsUrl),
      address: normalizeAddress(source.address, DEFAULT_RESTAURANT.address),
      openingHours: normalizeOpeningHours(source.openingHours, DEFAULT_RESTAURANT.openingHours),
      openingHoursExceptions: Array.isArray(source.openingHoursExceptions)
        ? source.openingHoursExceptions
            .map((entry) => {
              if (!isObject(entry)) {
                return null;
              }

              const date = normalizeText(entry.date);

              if (!date) {
                return null;
              }

              return {
                date,
                closed: Boolean(entry.closed),
                hours: entry.closed ? null : normalizeText(entry.hours),
                note: normalizeText(entry.note),
              };
            })
            .filter(Boolean)
        : [],
      social: normalizeSocial(source.social, DEFAULT_RESTAURANT.social),
      seo: normalizeSeo(source.seo, DEFAULT_RESTAURANT.seo),
    };
  };

  const validateAndFinalizeRestaurant = (restaurant) => {
    const warnings = [];
    const errors = [];
    const normalized = clone(restaurant);

    if (!normalizeText(normalized.name)) {
      errors.push('name es requerido.');
      normalized.name = DEFAULT_RESTAURANT.name;
    }

    if (!normalizeText(normalized.brand)) {
      warnings.push('brand vacio. Se usa value de name.');
      normalized.brand = normalized.name;
    }

    if (!/^[A-Z]{3}$/.test(normalized.currency)) {
      warnings.push('currency invalido. Se usa fallback DOP.');
      normalized.currency = DEFAULT_RESTAURANT.currency;
    }

    if (!normalizeText(normalized.phone)) {
      warnings.push('phone vacio.');
      normalized.phone = DEFAULT_RESTAURANT.phone;
    }

    if (!isValidLink(normalized.whatsapp)) {
      warnings.push('whatsapp invalido. Se usa fallback.');
      normalized.whatsapp = DEFAULT_RESTAURANT.whatsapp;
    }

    if (!isValidLink(normalized.reservationUrl)) {
      warnings.push('reservationUrl invalido. Se usa fallback #reservar.');
      normalized.reservationUrl = DEFAULT_RESTAURANT.reservationUrl;
    }

    if (!isValidLink(normalized.googleMapsUrl)) {
      warnings.push('googleMapsUrl invalido. Se usa fallback.');
      normalized.googleMapsUrl = DEFAULT_RESTAURANT.googleMapsUrl;
    }

    DAY_ORDER.forEach((dayKey) => {
      const value = normalized.openingHours[dayKey];

      if (value === null) {
        return;
      }

      if (!isValidHoursRange(value)) {
        warnings.push(`openingHours.${dayKey} invalido. Se usa fallback.`);
        normalized.openingHours[dayKey] = DEFAULT_RESTAURANT.openingHours[dayKey] ?? null;
      }
    });

    ['instagram', 'tiktok', 'tripadvisor'].forEach((key) => {
      const value = normalizeText(normalized.social[key]);

      if (value && !isValidLink(value)) {
        warnings.push(`social.${key} invalido. Se omitira.`);
        normalized.social[key] = '';
      }
    });

    if (!normalizeText(normalized.address.line1)) {
      warnings.push('address.line1 vacio. Se usa fallback.');
      normalized.address.line1 = DEFAULT_RESTAURANT.address.line1;
    }

    if (!normalizeText(normalized.address.city)) {
      warnings.push('address.city vacio. Se usa fallback.');
      normalized.address.city = DEFAULT_RESTAURANT.address.city;
    }

    if (!normalizeText(normalized.address.country)) {
      warnings.push('address.country vacio. Se usa fallback DO.');
      normalized.address.country = DEFAULT_RESTAURANT.address.country;
    }

    if (!normalizeText(normalized.seo.title)) {
      normalized.seo.title = normalized.name;
    }

    if (!normalizeText(normalized.seo.description)) {
      normalized.seo.description = DEFAULT_RESTAURANT.seo.description;
      warnings.push('seo.description vacio. Se usa fallback.');
    }

    if (!isValidLink(normalized.seo.url)) {
      normalized.seo.url = '/';
      warnings.push('seo.url invalido. Se usa fallback /.');
    }

    return {
      restaurant: normalized,
      validation: {
        isValid: errors.length === 0,
        errors,
        warnings,
      },
    };
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

      console.warn(`[restaurant] No se pudo cargar ${label}; se usara fallback.`, error);
      return defaultValue;
    }
  };

  const dayKeyFromDate = (date = new Date()) => {
    const weekday = Number(date.getDay());
    const mapping = {
      0: 'sun',
      1: 'mon',
      2: 'tue',
      3: 'wed',
      4: 'thu',
      5: 'fri',
      6: 'sat',
    };

    return mapping[weekday] || 'mon';
  };

  const getTodayOpeningHours = (restaurant, date = new Date()) => {
    const dayKey = dayKeyFromDate(date);
    const value = restaurant?.openingHours?.[dayKey] ?? null;

    return {
      dayKey,
      dayLabel: DAY_LABELS[dayKey] || dayKey,
      value,
      isClosed: value === null,
    };
  };

  const buildRestaurantStore = async () => {
    const restaurantJson = await fetchJson(RESTAURANT_URL, 'restaurant.json', {
      optional: true,
      defaultValue: null,
    });

    const normalized = normalizeRestaurant(restaurantJson);
    const finalized = validateAndFinalizeRestaurant(normalized);

    finalized.validation.warnings.forEach((warning) => {
      console.warn(`[restaurant] ${warning}`);
    });

    finalized.validation.errors.forEach((error) => {
      console.error(`[restaurant] ${error}`);
    });

    return finalized;
  };

  const loadRestaurantStore = async () => {
    if (!cachedRestaurantStorePromise) {
      cachedRestaurantStorePromise = buildRestaurantStore();
    }

    return cachedRestaurantStorePromise;
  };

  const getRestaurantConfig = async () => {
    const { restaurant } = await loadRestaurantStore();
    return clone(restaurant);
  };

  const getRestaurantValidation = async () => {
    const { validation } = await loadRestaurantStore();
    return clone(validation);
  };

  window.FigataData = window.FigataData || {};
  window.FigataData.restaurant = {
    loadRestaurantStore,
    getRestaurantConfig,
    getRestaurantValidation,
    DAY_ORDER: DAY_ORDER.slice(),
    DAY_LABELS: { ...DAY_LABELS },
    formatAddressInline,
    phoneToTel,
    getTodayOpeningHours,
  };
})();
