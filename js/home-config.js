(() => {
  const HIDDEN_CLASS = 'is-hidden-by-config';

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

      if (imagePath) {
        const probe = new Image();
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
      const url = delivery?.links?.[key] || '';
      setLinkState(element, url, { hideWhenMissing: true });
    });
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

  const updateEventsVideo = (video, source) => {
    if (!video) {
      return;
    }

    if (!source) {
      video.pause();
      video.removeAttribute('src');
      video.hidden = true;
      video.load();
      return;
    }

    const currentSource = video.getAttribute('src') || '';

    if (currentSource !== source) {
      video.setAttribute('src', source);
      video.load();
    }

    video.hidden = false;

    if (typeof video.play === 'function') {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
    }
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
    const video = section.querySelector('.events-card-video');

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

      if (item.video) {
        tab.setAttribute('data-video', item.video);
      } else {
        tab.removeAttribute('data-video');
      }
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

    const firstVideo = renderedItems[0]?.video || '';
    updateEventsVideo(video, firstVideo);

    return {
      hasRenderableEvents: renderedItems.length > 0,
    };
  };

  const applyReservation = (reservation) => {
    const navCta = document.querySelector('.cta-button--nav');

    if (!navCta) {
      return;
    }

    const label = navCta.querySelector('span');
    setText(label, reservation?.ctaLabel || '');

    if (reservation?.title) {
      navCta.setAttribute('aria-label', reservation.title);
      navCta.title = reservation.title;
    }

    setLinkState(navCta, reservation?.url || '#reservar');
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

  const applySectionToggles = (home, flags) => {
    const heroSection = document.querySelector('section.hero');
    const popularSection = document.getElementById('mas-pedidas');
    const deliverySection = document.querySelector('.delivery-section');
    const eventsSection = document.getElementById('eventos-tabs');
    const announcementSection = document.getElementById('home-announcement');
    const navReservationCta = document.querySelector('.cta-button--nav');

    setSectionVisibility(heroSection, home.sections.hero);
    setSectionVisibility(popularSection, home.sections.popular);
    setSectionVisibility(deliverySection, home.sections.delivery);

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

    if (navReservationCta) {
      const reservationVisible = home.sections.reservation && home.reservation.enabled;
      navReservationCta.hidden = !reservationVisible;
      navReservationCta.classList.toggle(HIDDEN_CLASS, !reservationVisible);
    }
  };

  const init = async () => {
    const homeApi = window.FigataData?.home;

    if (!homeApi?.getHomeConfig) {
      return;
    }

    try {
      const home = await homeApi.getHomeConfig();
      const fallbackBackground = homeApi.DEFAULT_HERO_BACKGROUND || 'assets/seamless-bg.png';

      applyHero(home.hero, fallbackBackground);
      applyPopular(home.popular);
      applyDelivery(home.delivery);
      applyReservation(home.reservation);

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
