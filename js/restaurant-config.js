(() => {
  const DAY_LABELS = {
    mon: 'Lun',
    tue: 'Mar',
    wed: 'Mie',
    thu: 'Jue',
    fri: 'Vie',
    sat: 'Sab',
    sun: 'Dom',
  };

  const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  const DAY_SCHEMA = {
    mon: 'Monday',
    tue: 'Tuesday',
    wed: 'Wednesday',
    thu: 'Thursday',
    fri: 'Friday',
    sat: 'Saturday',
    sun: 'Sunday',
  };

  const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

  const setText = (element, value) => {
    if (!element) {
      return;
    }

    element.textContent = normalizeText(value);
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

  const setLinkState = (element, url, { hideWhenMissing = false } = {}) => {
    if (!element) {
      return;
    }

    const hasUrl = isValidLink(url);

    if (!hasUrl) {
      element.href = '#';
      element.setAttribute('aria-disabled', 'true');
      element.classList.add('is-static');

      if (hideWhenMissing) {
        element.hidden = true;
      }

      element.removeAttribute('target');
      element.removeAttribute('rel');
      return;
    }

    element.hidden = false;
    element.href = url;
    element.removeAttribute('aria-disabled');
    element.classList.remove('is-static');

    if (/^https?:\/\//i.test(url)) {
      element.target = '_blank';
      element.rel = 'noopener noreferrer';
    } else {
      element.removeAttribute('target');
      element.removeAttribute('rel');
    }
  };

  const formatAddress = (address) => {
    const parts = [
      normalizeText(address?.line1),
      normalizeText(address?.line2),
      normalizeText(address?.city),
      normalizeText(address?.area),
      normalizeText(address?.country),
    ].filter(Boolean);

    return parts.join(', ');
  };

  const getTodaySchedule = (openingHours) => {
    const day = new Date().getDay();
    const keyByDay = {
      0: 'sun',
      1: 'mon',
      2: 'tue',
      3: 'wed',
      4: 'thu',
      5: 'fri',
      6: 'sat',
    };

    const dayKey = keyByDay[day] || 'mon';
    const todayRange = openingHours?.[dayKey] || null;
    const status = todayRange ? todayRange : 'Cerrado';

    return `Hoy (${DAY_LABELS[dayKey]}): ${status}`;
  };

  const getWeekSchedule = (openingHours) =>
    DAY_ORDER.map((dayKey) => {
      const range = openingHours?.[dayKey] || null;
      return `${DAY_LABELS[dayKey]} ${range ? range : 'Cerrado'}`;
    }).join(' · ');

  const createContactLink = (label, href) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    const text = document.createElement('span');

    text.textContent = label;
    link.appendChild(text);
    link.href = href;

    if (/^https?:\/\//i.test(href)) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }

    item.appendChild(link);
    return item;
  };

  const resolveAbsoluteUrl = (rawUrl) => {
    const value = normalizeText(rawUrl);

    if (!value) {
      return window.location.href;
    }

    try {
      return new URL(value, window.location.href).toString();
    } catch (error) {
      return window.location.href;
    }
  };

  const toOpeningHoursSpec = (openingHours) => {
    const specifications = [];

    DAY_ORDER.forEach((dayKey) => {
      const range = openingHours?.[dayKey] || null;

      if (!range || !/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(range)) {
        return;
      }

      const [opens, closes] = range.split('-');

      specifications.push({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${DAY_SCHEMA[dayKey]}`,
        opens,
        closes,
      });
    });

    return specifications;
  };

  const applySeo = (restaurant) => {
    const seo = restaurant?.seo || {};
    const title = normalizeText(seo.title) || normalizeText(restaurant?.name);
    const description =
      normalizeText(seo.description) ||
      'Pizzas napolitanas al horno de lena, vino y una experiencia premium.';

    if (title) {
      document.title = title;
    }

    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta) {
      descriptionMeta.setAttribute('content', description);
    }

    let jsonLdNode = document.getElementById('restaurant-jsonld');
    if (!jsonLdNode) {
      jsonLdNode = document.createElement('script');
      jsonLdNode.type = 'application/ld+json';
      jsonLdNode.id = 'restaurant-jsonld';
      document.head.appendChild(jsonLdNode);
    }

    const socialLinks = [
      normalizeText(restaurant?.social?.instagram),
      normalizeText(restaurant?.social?.tiktok),
      normalizeText(restaurant?.social?.tripadvisor),
    ].filter(Boolean);

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      name: normalizeText(restaurant?.name),
      alternateName: normalizeText(restaurant?.brand),
      description,
      url: resolveAbsoluteUrl(seo.url || '/'),
      image: resolveAbsoluteUrl(seo.image || ''),
      telephone: normalizeText(restaurant?.phone),
      currenciesAccepted: normalizeText(restaurant?.currency),
      address: {
        '@type': 'PostalAddress',
        streetAddress: [
          normalizeText(restaurant?.address?.line1),
          normalizeText(restaurant?.address?.line2),
        ]
          .filter(Boolean)
          .join(', '),
        addressLocality: normalizeText(restaurant?.address?.city),
        addressRegion: normalizeText(restaurant?.address?.area),
        postalCode: normalizeText(restaurant?.address?.postalCode),
        addressCountry: normalizeText(restaurant?.address?.country),
      },
      openingHoursSpecification: toOpeningHoursSpec(restaurant?.openingHours),
      sameAs: socialLinks,
    };

    jsonLdNode.textContent = JSON.stringify(jsonLd);
  };

  const applyFooter = (restaurant) => {
    const addressElement =
      document.querySelector('[data-restaurant-address]') ||
      document.querySelector('.footer-banner-address');
    const mapsLink =
      document.querySelector('[data-restaurant-maps-link]') ||
      document.querySelector('.footer-banner-cta');
    const brandElement =
      document.querySelector('[data-restaurant-brand]') ||
      document.querySelector('.footer-copy span:nth-child(3)');

    const topSocial = {
      instagram:
        document.querySelector('[data-restaurant-social-link="instagram"]') ||
        document.querySelector('.footer-social-link--instagram'),
      tiktok:
        document.querySelector('[data-restaurant-social-link="tiktok"]') ||
        document.querySelector('.footer-social-link--tiktok'),
      tripadvisor:
        document.querySelector('[data-restaurant-social-link="tripadvisor"]') ||
        document.querySelector('.footer-social-link--tripadvisor'),
    };

    const bottomSocial = {
      instagram:
        document.querySelector('[data-restaurant-social-icon="instagram"]') ||
        document.querySelector('.footer-icon-trigger--instagram'),
      tiktok:
        document.querySelector('[data-restaurant-social-icon="tiktok"]') ||
        document.querySelector('.footer-icon-trigger--tiktok'),
      tripadvisor:
        document.querySelector('[data-restaurant-social-icon="tripadvisor"]') ||
        document.querySelector('.footer-icon-trigger--tripadvisor'),
    };

    const contactCopy =
      document.querySelector('[data-restaurant-contact-copy]') ||
      document.querySelector('.footer-newsletter-copy');
    const hoursElement = document.querySelector('[data-restaurant-hours]');
    const contactLinks = document.querySelector('[data-restaurant-contact-links]');
    const contactForm =
      document.querySelector('[data-restaurant-contact-form]') ||
      document.querySelector('.footer-form');
    const navReservationCta = document.querySelector('.cta-button--nav');

    const addressInline = formatAddress(restaurant?.address);
    setText(addressElement, addressInline);
    setLinkState(mapsLink, restaurant?.googleMapsUrl || '', { hideWhenMissing: false });

    setText(brandElement, restaurant?.name || restaurant?.brand || 'Figata Pizza & Wine');

    setLinkState(topSocial.instagram, restaurant?.social?.instagram || '', { hideWhenMissing: true });
    setLinkState(topSocial.tiktok, restaurant?.social?.tiktok || '', { hideWhenMissing: true });
    setLinkState(topSocial.tripadvisor, restaurant?.social?.tripadvisor || '', {
      hideWhenMissing: true,
    });

    setLinkState(bottomSocial.instagram, restaurant?.social?.instagram || '', {
      hideWhenMissing: true,
    });
    setLinkState(bottomSocial.tiktok, restaurant?.social?.tiktok || '', { hideWhenMissing: true });
    setLinkState(bottomSocial.tripadvisor, restaurant?.social?.tripadvisor || '', {
      hideWhenMissing: true,
    });

    const phone = normalizeText(restaurant?.phone);
    const whatsapp = normalizeText(restaurant?.whatsapp);
    const reservationUrl = normalizeText(restaurant?.reservationUrl);

    if (contactCopy) {
      const baseParts = [];
      if (phone) {
        baseParts.push(`Telefono: ${phone}`);
      }
      if (whatsapp) {
        baseParts.push('WhatsApp disponible');
      }

      setText(contactCopy, baseParts.join(' · ') || 'Contacto disponible');
    }

    if (hoursElement) {
      const today = getTodaySchedule(restaurant?.openingHours);
      const week = getWeekSchedule(restaurant?.openingHours);
      setText(hoursElement, `${today} · ${week}`);
    }

    if (contactLinks) {
      contactLinks.replaceChildren();

      const phoneDigits = phone.replace(/[^\d+]/g, '');
      const telLink = phoneDigits ? `tel:${phoneDigits}` : '';

      if (telLink) {
        contactLinks.appendChild(createContactLink(`Llamar ${phone}`, telLink));
      }

      if (whatsapp) {
        contactLinks.appendChild(createContactLink('Escribir por WhatsApp', whatsapp));
      }

      if (reservationUrl) {
        contactLinks.appendChild(createContactLink('Reservar ahora', reservationUrl));
      }

      if (restaurant?.googleMapsUrl) {
        contactLinks.appendChild(createContactLink('Ver en Google Maps', restaurant.googleMapsUrl));
      }

      contactLinks.hidden = contactLinks.children.length === 0;
    }

    if (contactForm) {
      const hasContactLinks = Boolean(contactLinks && contactLinks.children.length > 0);
      contactForm.hidden = hasContactLinks;
    }

    if (navReservationCta) {
      setLinkState(navReservationCta, reservationUrl, { hideWhenMissing: false });

      if (reservationUrl && isValidLink(reservationUrl)) {
        navReservationCta.title = `Reservar en ${restaurant?.name || 'Figata'}`;
        navReservationCta.setAttribute('aria-label', `Reservar en ${restaurant?.name || 'Figata'}`);
      }
    }
  };

  const init = async () => {
    const restaurantApi = window.FigataData?.restaurant;

    if (!restaurantApi?.getRestaurantConfig) {
      return;
    }

    try {
      const restaurant = await restaurantApi.getRestaurantConfig();
      applySeo(restaurant);
      applyFooter(restaurant);
    } catch (error) {
      console.error('[restaurant-config] No se pudo aplicar data/restaurant.json.', error);
    }
  };

  void init();
})();
