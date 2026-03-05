(() => {
  const HIDDEN_CLASS = 'is-hidden-by-config';
  const DELIVERY_ICON_MIN_SIZE = 16;
  const DELIVERY_ICON_MAX_SIZE = 64;
  const FOOTER_SOCIAL_KEYS = ['instagram', 'tiktok', 'tripadvisor'];
  const FOOTER_SOCIAL_DEFAULT_LABELS = {
    instagram: 'Instagram',
    tiktok: 'TikTok',
    tripadvisor: 'Trip Advisor',
  };
  const FOOTER_DEFAULT_COLUMNS = [
    {
      title: 'Empresa',
      links: [
        { label: 'Menu', url: '#menu' },
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
  const FOOTER_DEFAULT_CTA = {
    label: 'Como llegar',
    url: '#ubicacion',
  };

  const normalizeTextValue = (value) =>
    typeof value === 'string' ? value.trim() : '';

  const setText = (element, value) => {
    if (!element) {
      return;
    }

    element.textContent = typeof value === 'string' ? value : '';
  };

  const setSectionVisibility = (element, isVisible) => {
    if (!element) {
      return;
    }

    element.classList.toggle(HIDDEN_CLASS, !isVisible);
  };

  const setLinkState = (element, url, { hideWhenMissing = false } = {}) => {
    if (!element) {
      return;
    }

    const hasUrl = typeof url === 'string' && url.trim().length > 0;

    if (!hasUrl) {
      if (hideWhenMissing) {
        element.hidden = true;
      }

      element.href = '#';
      element.setAttribute('aria-disabled', 'true');
      element.classList.add('is-static');
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

  const normalizeAssetPath = (value) => {
    const normalized = typeof value === 'string' ? value.trim() : '';
    if (!normalized) return '';
    if (/^https?:\/\//i.test(normalized)) return normalized;
    if (normalized.startsWith('/')) return normalized;
    return `/${normalized.replace(/^\.\/?/, '')}`;
  };

  const normalizeIconSize = (value, fallback = 32) => {
    const parsed = Number(value);
    const resolved = Number.isFinite(parsed) ? Math.round(parsed) : fallback;
    return Math.max(DELIVERY_ICON_MIN_SIZE, Math.min(DELIVERY_ICON_MAX_SIZE, resolved));
  };

  const applyDeliveryIcon = (actionElement, platformConfig) => {
    if (!actionElement) return;

    const iconElement = actionElement.querySelector('[data-delivery-icon]');
    if (!iconElement) return;

    const defaultIcon = iconElement.getAttribute('data-delivery-default-icon') || '';
    const defaultSize = normalizeIconSize(iconElement.getAttribute('data-delivery-default-size'), 32);
    const iconPath = normalizeAssetPath(platformConfig?.icon || defaultIcon);
    const iconSize = normalizeIconSize(platformConfig?.iconSize, defaultSize);

    actionElement.style.setProperty('--delivery-icon-size', `${iconSize}px`);

    if (!iconPath) {
      iconElement.hidden = true;
      iconElement.removeAttribute('src');
      return;
    }

    const fallbackIconPath = normalizeAssetPath(defaultIcon);
    iconElement.hidden = false;
    iconElement.dataset.fallbackApplied = '0';
    iconElement.onerror = () => {
      if (iconElement.dataset.fallbackApplied === '1') return;
      if (!fallbackIconPath) return;
      iconElement.dataset.fallbackApplied = '1';
      iconElement.src = fallbackIconPath;
    };
    iconElement.src = iconPath;
  };

  const ensureHeroImagePreload = (imagePath) => {
    const normalizedPath = typeof imagePath === 'string' ? imagePath.trim() : '';

    if (!normalizedPath) {
      return;
    }

    const existing = document.querySelector('link[data-hero-preload]');
    const preload =
      existing instanceof HTMLLinkElement ? existing : document.createElement('link');

    preload.rel = 'preload';
    preload.as = 'image';
    preload.href = normalizedPath;
    preload.setAttribute('fetchpriority', 'high');
    preload.setAttribute('data-hero-preload', 'true');

    if (!existing) {
      document.head.appendChild(preload);
    }
  };

  const applyHero = (hero, fallbackBackground) => {
    const topBackground = document.querySelector('.top-bg');
    const title = document.getElementById('hero-title');
    const subtitle = document.querySelector('.hero__subtitle');
    const eyebrowButton = document.querySelector('.hero__eyebrow');
    const primaryButton = document.querySelector('.cta-button--hero');

    setText(title, hero?.title || '');
    setText(subtitle, hero?.subtitle || '');

    if (topBackground) {
      const imagePath = (hero?.backgroundImage || fallbackBackground || '').trim();
      const defaultPath = (fallbackBackground || '').trim();
      const criticalHeroImagePath = imagePath || defaultPath;

      ensureHeroImagePreload(criticalHeroImagePath);

      if (imagePath) {
        const probe = new Image();
        probe.decoding = 'async';
        probe.loading = 'eager';
        probe.fetchPriority = 'high';
        probe.onload = () => {
          topBackground.style.backgroundImage = `url("${imagePath}")`;
        };
        probe.onerror = () => {
          if (defaultPath) {
            topBackground.style.backgroundImage = `url("${defaultPath}")`;
          }
        };
        probe.src = imagePath;
      } else if (defaultPath) {
        topBackground.style.backgroundImage = `url("${defaultPath}")`;
      }
    }

    if (eyebrowButton) {
      const eyebrowLabel = eyebrowButton.querySelector('span');
      setText(eyebrowLabel, hero?.ctaSecondary?.label || '');
      setLinkState(eyebrowButton, hero?.ctaSecondary?.url || '#menu');
    }

    if (primaryButton) {
      const primaryLabel = primaryButton.querySelector('span');
      setText(primaryLabel, hero?.ctaPrimary?.label || '');
      setLinkState(primaryButton, hero?.ctaPrimary?.url || '#menu');
    }
  };

  const applyPopular = (popular) => {
    const title = document.querySelector('.mas-pedidas__headline');
    const subtitle = document.querySelector('.mas-pedidas__subtitle');

    setText(title, popular?.title || '');
    setText(subtitle, popular?.subtitle || '');
  };

  const applyDelivery = (delivery) => {
    const title = document.querySelector('.delivery-title');
    const subtitle = document.querySelector('.delivery-subtitle');

    setText(title, delivery?.title || '');
    setText(subtitle, delivery?.subtitle || '');

    const linkElements = Array.from(document.querySelectorAll('[data-delivery-link]'));

    linkElements.forEach((element) => {
      const key = element.getAttribute('data-delivery-link');
      if (!key) return;

      const platformConfig = delivery?.platforms?.[key] || {};
      const urlFromPlatform = typeof platformConfig.url === 'string' ? platformConfig.url : '';
      const legacyUrl = typeof delivery?.links?.[key] === 'string' ? delivery.links[key] : '';
      const url = urlFromPlatform || legacyUrl;

      setLinkState(element, url, { hideWhenMissing: true });
      applyDeliveryIcon(element, platformConfig);
    });
  };

  const applyTestimonials = (testimonials) => {
    const section = document.getElementById('testimonials');

    if (!section) {
      return;
    }

    const title = section.querySelector('.testimonials-header h2');
    const subtitle = section.querySelector('.testimonials-header p');

    setText(title, testimonials?.title || '');
    setText(subtitle, testimonials?.subtitle || '');
  };

  const setInitialEventsTabSelection = (tabs) => {
    tabs.forEach((tab, index) => {
      const isActive = index === 0;
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('data-tab', String(index));
    });
  };

  const syncEventsRailSpacers = (rail, tabCount) => {
    if (!rail) {
      return;
    }

    const oldSpacers = Array.from(rail.querySelectorAll('.events-tabs-spacer'));
    oldSpacers.forEach((spacer) => spacer.remove());

    for (let index = 1; index < tabCount; index += 1) {
      const spacer = document.createElement('div');
      spacer.className = 'events-tabs-spacer';
      spacer.style.left = `calc((100% / ${tabCount}) * ${index})`;
      rail.appendChild(spacer);
    }
  };

  const applyEventsPreview = (eventsPreview) => {
    const section = document.getElementById('eventos-tabs');

    if (!section) {
      return {
        hasRenderableEvents: false,
      };
    }

    const title = section.querySelector('.testimonials-header h2');
    const subtitle = section.querySelector('.testimonials-header p');
    const tabRoot = section.querySelector('.events-tabs[role="tablist"]');
    const rail = tabRoot?.querySelector('.events-tabs-rail');
    const tabContainers = Array.from(section.querySelectorAll('.events-tab-container'));

    setText(title, eventsPreview?.title || '');
    setText(subtitle, eventsPreview?.subtitle || '');

    const items = Array.isArray(eventsPreview?.items) ? eventsPreview.items : [];
    const limit = Number.isFinite(eventsPreview?.limit)
      ? Math.max(1, Math.round(eventsPreview.limit))
      : items.length;
    const renderedItems = items.slice(0, limit);

    tabContainers.forEach((container, index) => {
      const tab = container.querySelector('.events-tab');
      const titleElement = container.querySelector('.events-tab-title');
      const subtitleElement = container.querySelector('.events-tab-subtitle');
      const item = renderedItems[index];

      if (!tab || !item) {
        container.hidden = true;
        return;
      }

      container.hidden = false;
      setText(titleElement, item.title || '');
      setText(subtitleElement, item.subtitle || '');
    });

    const visibleTabs = tabContainers
      .map((container) => container.querySelector('.events-tab'))
      .filter((tab) => tab && !tab.closest('.events-tab-container[hidden]'));

    const tabCount = Math.max(visibleTabs.length, 1);

    if (tabRoot) {
      tabRoot.style.setProperty('--events-tab-count', String(tabCount));
    }

    syncEventsRailSpacers(rail, tabCount);
    setInitialEventsTabSelection(visibleTabs);

    return {
      hasRenderableEvents: renderedItems.length > 0,
    };
  };

  const applyNavbar = (navbar) => {
    const navLinksRoot = document.querySelector('.navbar__links');
    const navCta = document.querySelector('.cta-button--nav');

    if (navLinksRoot) {
      const fallbackLinks = [
        { label: 'Menú', url: '#menu' },
        { label: 'Nosotros', url: '#nosotros' },
        { label: 'Ubicación', url: '#ubicacion' },
        { label: 'Contacto', url: '#contacto' },
      ];
      const sourceLinks = Array.isArray(navbar?.links) ? navbar.links : [];
      const links = sourceLinks
        .map((entry) => ({
          label: (entry?.label || '').trim(),
          url: (entry?.url || '').trim(),
        }))
        .filter((entry) => entry.label || entry.url);
      const normalizedLinks = links.length > 0 ? links : fallbackLinks;

      navLinksRoot.innerHTML = '';
      normalizedLinks.forEach((entry, index) => {
        const li = document.createElement('li');
        const anchor = document.createElement('a');
        setText(anchor, entry.label || `Link ${index + 1}`);
        setLinkState(anchor, entry.url || '#');
        li.appendChild(anchor);
        navLinksRoot.appendChild(li);
      });
    }

    if (!navCta) return;

    const label = navCta.querySelector('span');
    setText(label, navbar?.cta?.label || '');

    const ctaTitle = navbar?.cta?.title || navbar?.cta?.label || '';
    if (ctaTitle) {
      navCta.setAttribute('aria-label', ctaTitle);
      navCta.title = ctaTitle;
    } else {
      navCta.removeAttribute('aria-label');
      navCta.removeAttribute('title');
    }

    const icon = navCta.querySelector('img');
    const iconPath = (navbar?.cta?.icon || '').trim();
    if (icon && iconPath) {
      icon.src = iconPath;
      icon.alt = '';
      icon.setAttribute('aria-hidden', 'true');
    }

    setLinkState(navCta, navbar?.cta?.url || '#reservar');
  };

  const applyAnnouncements = (announcements) => {
    const section = document.getElementById('home-announcement');

    if (!section) {
      return {
        hasRenderableAnnouncement: false,
      };
    }

    const link = section.querySelector('.home-announcement__link');
    const message = section.querySelector('.home-announcement__message');
    const badge = section.querySelector('.home-announcement__badge');

    section.classList.remove(
      'home-announcement--highlight',
      'home-announcement--warning',
      'home-announcement--info'
    );

    const type = announcements?.type || 'highlight';
    section.classList.add(`home-announcement--${type}`);

    const labelByType = {
      highlight: 'Novedad',
      warning: 'Importante',
      info: 'Info',
    };

    setText(badge, labelByType[type] || 'Aviso');
    setText(message, announcements?.message || '');

    if (link) {
      setLinkState(link, announcements?.link || '', { hideWhenMissing: false });
    }

    const hasMessage = Boolean((announcements?.message || '').trim());
    section.hidden = !hasMessage;

    return {
      hasRenderableAnnouncement: hasMessage,
    };
  };

  const renderFooterLinks = (listElement, links) => {
    if (!listElement) return;

    listElement.replaceChildren();
    const sourceLinks = Array.isArray(links) ? links : [];

    sourceLinks.forEach((entry, index) => {
      const label = normalizeTextValue(entry?.label) || `Link ${index + 1}`;
      const url = normalizeTextValue(entry?.url);
      const listItem = document.createElement('li');
      const anchor = document.createElement('a');
      const text = document.createElement('span');
      text.textContent = label;
      anchor.appendChild(text);
      setLinkState(anchor, url || '', { hideWhenMissing: false });
      listItem.appendChild(anchor);
      listElement.appendChild(listItem);
    });

    listElement.hidden = sourceLinks.length === 0;
  };

  const buildFooterColumns = (footer) => {
    const sourceColumns = Array.isArray(footer?.columns) ? footer.columns : [];
    return FOOTER_DEFAULT_COLUMNS.map((fallbackColumn, index) => {
      const source = sourceColumns[index] || {};
      const links = Array.isArray(source?.links) ? source.links : fallbackColumn.links;
      return {
        title: normalizeTextValue(source?.title) || fallbackColumn.title,
        links: (Array.isArray(links) ? links : [])
          .map((entry, linkIndex) => ({
            label: normalizeTextValue(entry?.label) || `Link ${linkIndex + 1}`,
            url: normalizeTextValue(entry?.url),
          }))
          .filter((entry) => entry.label || entry.url),
      };
    });
  };

  const applyFooter = (footer, restaurant) => {
    const footerShell = document.querySelector('.footer-shell');

    if (!footerShell) {
      return;
    }

    const columns = buildFooterColumns(footer);
    const footerTitles = Array.from(document.querySelectorAll('[data-home-footer-column-title]'));
    footerTitles.forEach((titleElement, index) => {
      setText(titleElement, columns[index]?.title || FOOTER_DEFAULT_COLUMNS[index]?.title || '');
    });

    const companyLinksList = document.querySelector('[data-home-footer-column-links="0"]');
    renderFooterLinks(companyLinksList, columns[0]?.links || []);

    const contactLinksList = document.querySelector('[data-home-footer-column-links="2"]');
    renderFooterLinks(contactLinksList, columns[2]?.links || []);

    const socialOverrides = footer?.socials && typeof footer.socials === 'object' ? footer.socials : {};
    const socialColumnLinks = columns[1]?.links || [];

    FOOTER_SOCIAL_KEYS.forEach((socialKey, index) => {
      const topLink =
        document.querySelector(`[data-restaurant-social-link="${socialKey}"]`) ||
        document.querySelector(`.footer-social-link--${socialKey}`);
      const bottomLink =
        document.querySelector(`[data-restaurant-social-icon="${socialKey}"]`) ||
        document.querySelector(`.footer-icon-trigger--${socialKey}`);
      const configuredLink = socialColumnLinks[index] || {};
      const label =
        normalizeTextValue(configuredLink.label) || FOOTER_SOCIAL_DEFAULT_LABELS[socialKey] || socialKey;
      const resolvedUrl =
        normalizeTextValue(configuredLink.url) ||
        normalizeTextValue(socialOverrides[socialKey]) ||
        normalizeTextValue(restaurant?.social?.[socialKey]);

      if (topLink) {
        const textNode = topLink.querySelector('span');
        setText(textNode, label);
        setLinkState(topLink, resolvedUrl || '', { hideWhenMissing: true });
      }

      if (bottomLink) {
        setLinkState(bottomLink, resolvedUrl || '', { hideWhenMissing: true });
      }
    });

    const ctaElement =
      document.querySelector('[data-home-footer-cta]') ||
      document.querySelector('.footer-banner-cta');
    const ctaLabelElement =
      document.querySelector('[data-home-footer-cta-label]') ||
      ctaElement?.querySelector('.footer-banner-cta-label');
    const ctaLabel = normalizeTextValue(footer?.cta?.label) || FOOTER_DEFAULT_CTA.label;
    const ctaUrl =
      normalizeTextValue(footer?.cta?.url) ||
      normalizeTextValue(restaurant?.googleMapsUrl) ||
      FOOTER_DEFAULT_CTA.url;
    setText(ctaLabelElement, ctaLabel);
    setLinkState(ctaElement, ctaUrl, { hideWhenMissing: false });

    const addressElement = document.querySelector('[data-restaurant-address]');
    if (addressElement && restaurant?.address) {
      const addressParts = [
        normalizeTextValue(restaurant.address.line1),
        normalizeTextValue(restaurant.address.line2),
        normalizeTextValue(restaurant.address.city),
        normalizeTextValue(restaurant.address.area),
        normalizeTextValue(restaurant.address.country),
      ].filter(Boolean);
      if (addressParts.length) {
        setText(addressElement, addressParts.join(', '));
      }
    }

    const brandElement = document.querySelector('[data-restaurant-brand]');
    if (brandElement) {
      const brandText =
        normalizeTextValue(restaurant?.name) ||
        normalizeTextValue(restaurant?.brand) ||
        'Figata Pizza & Wine';
      setText(brandElement, brandText);
    }

    const contactCopy =
      document.querySelector('[data-restaurant-contact-copy]') ||
      document.querySelector('.footer-newsletter-copy');
    if (contactCopy) {
      const phone = normalizeTextValue(restaurant?.phone);
      const hasWhatsapp = Boolean(normalizeTextValue(restaurant?.whatsapp));
      const parts = [];
      if (phone) {
        parts.push(`Telefono: ${phone}`);
      }
      if (hasWhatsapp) {
        parts.push('WhatsApp disponible');
      }
      if (parts.length) {
        setText(contactCopy, parts.join(' · '));
      }
    }

    footerShell.setAttribute('data-home-footer-note', footer?.note || '');
  };

  const applySectionToggles = (home, flags) => {
    const heroSection = document.querySelector('section.hero');
    const popularSection = document.getElementById('mas-pedidas');
    const deliverySection = document.querySelector('.delivery-section');
    const testimonialsSection = document.getElementById('testimonials');
    const eventsSection = document.getElementById('eventos-tabs');
    const announcementSection = document.getElementById('home-announcement');
    const navbarSection = document.querySelector('.site-header');
    const footerSection = document.querySelector('.footer-shell');

    setSectionVisibility(navbarSection, home.sections.navbar);
    if (navbarSection) {
      navbarSection.hidden = !home.sections.navbar;
    }

    setSectionVisibility(heroSection, home.sections.hero);
    setSectionVisibility(popularSection, home.sections.popular);
    setSectionVisibility(deliverySection, home.sections.delivery);
    setSectionVisibility(
      testimonialsSection,
      home.sections.testimonials && home.testimonials.enabled
    );

    const eventsVisible = home.sections.events && home.eventsPreview.enabled && flags.hasRenderableEvents;
    setSectionVisibility(eventsSection, eventsVisible);

    const announcementsVisible =
      home.sections.announcements &&
      home.announcements.enabled &&
      flags.hasRenderableAnnouncement;
    setSectionVisibility(announcementSection, announcementsVisible);

    if (announcementSection) {
      announcementSection.hidden = !announcementsVisible;
    }

    setSectionVisibility(footerSection, home.sections.footer && home.footer.enabled);
  };

  const init = async () => {
    const homeApi = window.FigataData?.home;

    if (!homeApi?.getHomeConfig) {
      return;
    }

    try {
      const restaurantApi = window.FigataData?.restaurant;
      const restaurantPromise = restaurantApi?.getRestaurantConfig
        ? restaurantApi.getRestaurantConfig().catch((error) => {
            console.warn('[home-config] No se pudo cargar restaurant config para footer.', error);
            return null;
          })
        : Promise.resolve(null);
      const [home, restaurant] = await Promise.all([
        homeApi.getHomeConfig(),
        restaurantPromise,
      ]);
      const fallbackBackground = homeApi.DEFAULT_HERO_BACKGROUND || 'assets/home/seamless-bg.webp';

      applyHero(home.hero, fallbackBackground);
      applyNavbar(home.navbar);
      applyPopular(home.popular);
      applyDelivery(home.delivery);
      applyTestimonials(home.testimonials);
      applyFooter(home.footer, restaurant);

      const eventsFlags = applyEventsPreview(home.eventsPreview);
      const announcementFlags = applyAnnouncements(home.announcements);

      applySectionToggles(home, {
        ...eventsFlags,
        ...announcementFlags,
      });
    } catch (error) {
      console.error('[home-config] No se pudo aplicar data/home.json.', error);
    }
  };

  void init();
})();
