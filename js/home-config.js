(() => {
  const publicPaths = window.FigataPublicPaths || null;
  const HIDDEN_CLASS = 'is-hidden-by-config';
  const DELIVERY_ICON_MIN_SIZE = 16;
  const DELIVERY_ICON_MAX_SIZE = 64;
  const DELIVERY_SHEET_EXIT_MS = 460;
  const HOME_VIRTUAL_TOUR_EXIT_MS = 280;
  const HOME_VIRTUAL_TOUR_FALLBACK_URL =
    'https://my.matterport.com/show?play=1&lang=en-US&m=XvpiJpihutS';
  const DELIVERY_SHEET_DRAG_ACTIVATE_THRESHOLD = 12;
  const DELIVERY_SHEET_DRAG_CLOSE_THRESHOLD = 90;
  const DELIVERY_SHEET_DRAG_MAX_OFFSET = 180;
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
        { label: 'Menu', url: '/menu/' },
        { label: 'Nosotros', url: '#nosotros' },
        { label: 'Eventos', url: '/eventos/' },
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
  const FOOTER_LOCATION_IMAGE_DESKTOP = 'assets/home/location.webp';
  const FOOTER_LOCATION_IMAGE_MOBILE = 'assets/home/location-mobile.webp';
  const HOME_LOCATION_WAZE_URL =
    'https://ul.waze.com/ul?ll=18.49227723%2C-69.86180305&navigate=yes&zoom=17&utm_campaign=default&utm_source=waze_website&utm_medium=lm_share_location';
  const HOME_LOCATION_GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/Yg2cgWZvZxaHmWkMA';
  const HERO_RESERVE_WHATSAPP_MESSAGE = `Hola, me gustaría reservar una mesa. ¿Me ayudan con la disponibilidad?

Fecha:
Hora:
Personas:`;
  const HOURS_DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const HOURS_DAY_DISPLAY_ORDER = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const HOURS_DAY_LABELS = {
    mon: 'Lunes',
    tue: 'Martes',
    wed: 'Miércoles',
    thu: 'Jueves',
    fri: 'Viernes',
    sat: 'Sábado',
    sun: 'Domingo',
  };
  const HOURS_WEEKDAY_TO_KEY = {
    Mon: 'mon',
    Tue: 'tue',
    Wed: 'wed',
    Thu: 'thu',
    Fri: 'fri',
    Sat: 'sat',
    Sun: 'sun',
  };
  const HOURS_RANGE_PATTERN = /^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/;
  const HOURS_TODAY_ICON_PATH = 'M216 64C229.3 64 240 74.7 240 88L240 128L400 128L400 88C400 74.7 410.7 64 424 64C437.3 64 448 74.7 448 88L448 128L480 128C515.3 128 544 156.7 544 192L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 192C96 156.7 124.7 128 160 128L192 128L192 88C192 74.7 202.7 64 216 64zM480 496C488.8 496 496 488.8 496 480L496 416L408 416L408 496L480 496zM496 368L496 288L408 288L408 368L496 368zM360 368L360 288L280 288L280 368L360 368zM232 368L232 288L144 288L144 368L232 368zM144 416L144 480C144 488.8 151.2 496 160 496L232 496L232 416L144 416zM280 416L280 496L360 496L360 416L280 416zM216 176L160 176C151.2 176 144 183.2 144 192L144 240L496 240L496 192C496 183.2 488.8 176 480 176L216 176z';
  const HOURS_CLOSED_ICON_PATH = 'M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM320 224C373 224 416 267 416 320C416 373 373 416 320 416C267 416 224 373 224 320C224 267 267 224 320 224z';
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const normalizeTextValue = (value) =>
    typeof value === 'string' ? value.trim() : '';

  const setText = (element, value) => {
    if (!element) {
      return;
    }

    element.textContent = typeof value === 'string' ? value : '';
  };

  const setMultilineText = (element, value) => {
    if (!element) {
      return;
    }

    const text = typeof value === 'string' ? value : '';
    const lines = text.split(/\r?\n/);

    if (lines.length <= 1) {
      element.textContent = text;
      return;
    }

    element.replaceChildren();
    lines.forEach((line, index) => {
      if (index > 0) {
        element.appendChild(document.createElement('br'));
      }
      element.appendChild(document.createTextNode(line));
    });
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
    const normalizedUrl =
      publicPaths?.toSitePath && !/^https?:\/\//i.test(url) && !url.startsWith('#')
        ? publicPaths.toSitePath(url)
        : url;

    element.href = normalizedUrl;
    element.removeAttribute('aria-disabled');
    element.classList.remove('is-static');

    if (/^https?:\/\//i.test(normalizedUrl)) {
      element.target = '_blank';
      element.rel = 'noopener noreferrer';
    } else {
      element.removeAttribute('target');
      element.removeAttribute('rel');
    }
  };

  const resolveWhatsappComposeUrl = (baseUrl, message) => {
    const normalizedBaseUrl = normalizeTextValue(baseUrl);
    if (!normalizedBaseUrl) {
      return '';
    }

    try {
      const composedUrl = new URL(normalizedBaseUrl, window.location.href);
      if (!/^https?:$/i.test(composedUrl.protocol)) {
        return '';
      }

      const normalizedMessage = normalizeTextValue(message);
      if (normalizedMessage) {
        composedUrl.searchParams.set('text', normalizedMessage);
      } else {
        composedUrl.searchParams.delete('text');
      }

      return composedUrl.toString();
    } catch (error) {
      return '';
    }
  };

  const normalizeAssetPath = (value) => {
    const normalized = typeof value === 'string' ? value.trim() : '';
    if (!normalized) return '';
    if (/^https?:\/\//i.test(normalized)) return normalized;
    if (publicPaths?.toSitePath) {
      return publicPaths.toSitePath(normalized);
    }
    if (normalized.startsWith('/')) return normalized;
    return `/${normalized.replace(/^\.\/?/, '')}`;
  };

  const normalizeIconSize = (value, fallback = 32) => {
    const parsed = Number(value);
    const resolved = Number.isFinite(parsed) ? Math.round(parsed) : fallback;
    return Math.max(DELIVERY_ICON_MIN_SIZE, Math.min(DELIVERY_ICON_MAX_SIZE, resolved));
  };

  const parsePositiveInt = (value, fallback) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return fallback;
    }
    const rounded = Math.round(parsed);
    return rounded > 0 ? rounded : fallback;
  };

  const parseHoursRange = (rangeValue) => {
    const normalized = normalizeTextValue(rangeValue);
    const match = HOURS_RANGE_PATTERN.exec(normalized);

    if (!match) {
      return null;
    }

    const startHour = Number(match[1]);
    const startMinute = Number(match[2]);
    const endHour = Number(match[3]);
    const endMinute = Number(match[4]);

    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;

    if (
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      start < 0 ||
      end < 0 ||
      start >= end ||
      end > 24 * 60
    ) {
      return null;
    }

    return {
      raw: normalized,
      start,
      end,
      startHour,
      startMinute,
      endHour,
      endMinute,
    };
  };

  const formatMinutesAsTime = (totalMinutes) => {
    const safeMinutes = Math.max(0, Math.min(24 * 60 - 1, Math.round(totalMinutes)));
    const hour24 = Math.floor(safeMinutes / 60);
    const minute = safeMinutes % 60;
    const period = hour24 >= 12 ? 'p. m.' : 'a. m.';
    const hour12 = ((hour24 + 11) % 12) + 1;
    const minuteText = String(minute).padStart(2, '0');
    return `${hour12}:${minuteText} ${period}`;
  };

  const formatHoursForDisplay = (rangeValue, closedLabel) => {
    const parsed = parseHoursRange(rangeValue);
    if (!parsed) {
      return closedLabel;
    }
    return `${formatMinutesAsTime(parsed.start)} - ${formatMinutesAsTime(parsed.end)}`;
  };

  const createInlineIcon = (viewBox, pathData, className) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', viewBox);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    if (className) {
      svg.setAttribute('class', className);
    }

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    svg.appendChild(path);

    return svg;
  };

  const positionHoursStatusChips = (list) => {
    if (!list) {
      return;
    }

    const rows = Array.from(list.querySelectorAll('.horarios-mobile__row--with-chip'));
    rows.forEach((row) => {
      const rowMain = row.querySelector('.horarios-mobile__row-main');
      const dayNode = row.querySelector('p.horarios-mobile__day');
      const hoursNode = row.querySelector('p.horarios-mobile__hours');
      const chipNode = rowMain?.querySelector('.horarios-mobile__chip');

      if (!rowMain || !dayNode || !hoursNode || !chipNode) {
        return;
      }

      const rowRect = rowMain.getBoundingClientRect();
      const dayRect = dayNode.getBoundingClientRect();
      const hoursRect = hoursNode.getBoundingClientRect();
      const chipWidth = chipNode.offsetWidth || 0;

      if (!rowRect.width || !chipWidth) {
        return;
      }

      const midpoint = (dayRect.right + hoursRect.left) / 2;
      const rawLeft = midpoint - rowRect.left;
      const minLeft = chipWidth / 2 + 4;
      const maxLeft = rowRect.width - chipWidth / 2 - 4;
      const clampedLeft = Math.min(maxLeft, Math.max(minLeft, rawLeft));

      chipNode.style.left = `${clampedLeft}px`;
    });
  };

  const initAmbienteParallax = () => {
    const frame = document.querySelector('[data-home-ambiente-parallax]');
    if (!(frame instanceof HTMLElement)) {
      return;
    }

    const image = frame.querySelector('[data-home-ambiente-parallax-image]');
    if (!(image instanceof HTMLImageElement)) {
      return;
    }

    let frameTickId = 0;
    const clampRange = (value, min, max) => Math.min(max, Math.max(min, value));

    const applyParallaxFrame = () => {
      frameTickId = 0;

      if (reducedMotionQuery.matches || frame.clientHeight === 0) {
        frame.style.setProperty('--home-ambiente-parallax-y', '0px');
        return;
      }

      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
      const viewportCenter = viewportHeight / 2;
      const rect = frame.getBoundingClientRect();
      const frameCenter = rect.top + rect.height / 2;
      const delta = viewportCenter - frameCenter;
      const normalized = clampRange(delta / (viewportHeight * 0.65), -1, 1);
      const maxShift = frame.clientHeight / 6;
      const shift = normalized * maxShift;
      frame.style.setProperty('--home-ambiente-parallax-y', `${shift.toFixed(2)}px`);
    };

    const queueParallaxFrame = () => {
      if (frameTickId) {
        return;
      }
      frameTickId = window.requestAnimationFrame(applyParallaxFrame);
    };

    const handleMotionPreferenceChange = () => {
      if (reducedMotionQuery.matches) {
        frame.style.setProperty('--home-ambiente-parallax-y', '0px');
        return;
      }
      queueParallaxFrame();
    };

    if (frame.dataset.ambienteParallaxBound !== '1') {
      window.addEventListener('scroll', queueParallaxFrame, { passive: true });
      window.addEventListener('resize', queueParallaxFrame, { passive: true });
      window.addEventListener('orientationchange', queueParallaxFrame);

      if (typeof reducedMotionQuery.addEventListener === 'function') {
        reducedMotionQuery.addEventListener('change', handleMotionPreferenceChange);
      } else if (typeof reducedMotionQuery.addListener === 'function') {
        reducedMotionQuery.addListener(handleMotionPreferenceChange);
      }

      frame.dataset.ambienteParallaxBound = '1';
    }

    if (!image.complete) {
      image.addEventListener('load', queueParallaxFrame, { once: true });
    }

    queueParallaxFrame();
    requestAnimationFrame(queueParallaxFrame);
  };

  const getZonedNow = (timeZone) => {
    const fallbackDate = new Date();
    const fallbackDayMap = {
      0: 'sun',
      1: 'mon',
      2: 'tue',
      3: 'wed',
      4: 'thu',
      5: 'fri',
      6: 'sat',
    };

    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        weekday: 'short',
        hour12: false,
      });
      const parts = formatter.formatToParts(fallbackDate);
      const readPart = (type) => parts.find((part) => part.type === type)?.value || '';
      const year = Number(readPart('year'));
      const month = Number(readPart('month'));
      const day = Number(readPart('day'));
      const hour = Number(readPart('hour'));
      const minute = Number(readPart('minute'));
      const dayKey = HOURS_WEEKDAY_TO_KEY[readPart('weekday')];

      if (
        !Number.isFinite(year) ||
        !Number.isFinite(month) ||
        !Number.isFinite(day) ||
        !Number.isFinite(hour) ||
        !Number.isFinite(minute) ||
        !dayKey
      ) {
        throw new Error('Formato de hora inválido para timezone.');
      }

      return {
        year,
        month,
        day,
        hour,
        minute,
        dayKey,
        minutesNow: hour * 60 + minute,
      };
    } catch (error) {
      const fallbackDay = fallbackDayMap[fallbackDate.getDay()] || 'mon';
      return {
        year: fallbackDate.getFullYear(),
        month: fallbackDate.getMonth() + 1,
        day: fallbackDate.getDate(),
        hour: fallbackDate.getHours(),
        minute: fallbackDate.getMinutes(),
        dayKey: fallbackDay,
        minutesNow: fallbackDate.getHours() * 60 + fallbackDate.getMinutes(),
      };
    }
  };

  const getIsoDateForDayKey = (zonedNow, dayKey) => {
    const nowIndex = HOURS_DAY_ORDER.indexOf(zonedNow.dayKey);
    const targetIndex = HOURS_DAY_ORDER.indexOf(dayKey);
    if (nowIndex < 0 || targetIndex < 0) {
      return '';
    }

    const baseUtc = Date.UTC(zonedNow.year, zonedNow.month - 1, zonedNow.day);
    const delta = targetIndex - nowIndex;
    const targetDate = new Date(baseUtc + delta * 86400000);
    const year = targetDate.getUTCFullYear();
    const month = String(targetDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
    const subtitles = Array.from(document.querySelectorAll('.hero__subtitle'));
    const eyebrowButton = document.querySelector('.hero__eyebrow');
    const primaryButtons = Array.from(document.querySelectorAll('.cta-button--hero'));

    setMultilineText(title, hero?.title || '');
    subtitles.forEach((subtitle) => {
      setText(subtitle, hero?.subtitle || '');
    });

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
      setLinkState(eyebrowButton, hero?.ctaSecondary?.url || '/menu/');
    }

    primaryButtons.forEach((primaryButton) => {
      const primaryLabel = primaryButton.querySelector('span');
      setText(primaryLabel, hero?.ctaPrimary?.label || '');
      setLinkState(primaryButton, hero?.ctaPrimary?.url || '/menu/');
    });
  };

  const applyPopular = (popular) => {
    const title = document.querySelector('.mas-pedidas__headline');
    const subtitle = document.querySelector('.mas-pedidas__subtitle');

    setText(title, popular?.title || '');
    setText(subtitle, popular?.subtitle || '');
  };

  const applyMobileHours = (mobileHours) => {
    const section = document.getElementById('horarios');
    if (!section) {
      return {
        hasRenderableHours: false,
      };
    }

    const title = section.querySelector('.horarios-mobile__title');
    const subtitle = section.querySelector('.horarios-mobile__subtitle');
    const list = section.querySelector('[data-home-hours-list]');

    setText(title, mobileHours?.title || '');
    setMultilineText(subtitle, mobileHours?.subtitle || '');

    if (!list) {
      return {
        hasRenderableHours: false,
      };
    }

    const labels = {
      openNow: normalizeTextValue(mobileHours?.labels?.openNow) || 'Abierto',
      opensSoon: normalizeTextValue(mobileHours?.labels?.opensSoon) || 'Por abrir',
      closesSoon: normalizeTextValue(mobileHours?.labels?.closesSoon) || 'Por cerrar',
      closedToday: normalizeTextValue(mobileHours?.labels?.closedToday) || 'Cerrado',
      specialHours: normalizeTextValue(mobileHours?.labels?.specialHours) || 'Especial',
      willOpenLater: normalizeTextValue(mobileHours?.labels?.willOpenLater) || 'Abriremos',
      noService: normalizeTextValue(mobileHours?.labels?.noService) || 'Sin servicio',
      closed: normalizeTextValue(mobileHours?.labels?.closed) || 'Cerrado',
      today: normalizeTextValue(mobileHours?.labels?.today) || 'Hoy',
    };

    const timezone = normalizeTextValue(mobileHours?.timezone) || 'America/Santo_Domingo';
    const openSoonMinutes = parsePositiveInt(mobileHours?.openSoonMinutes, 60);
    const closeSoonMinutes = parsePositiveInt(mobileHours?.closeSoonMinutes, 60);
    const baseWeek = mobileHours?.baseWeek && typeof mobileHours.baseWeek === 'object'
      ? mobileHours.baseWeek
      : {};
    const weeklyOverrides = Array.isArray(mobileHours?.weeklyOverrides)
      ? mobileHours.weeklyOverrides
      : [];
    const dateOverrides = Array.isArray(mobileHours?.dateOverrides)
      ? mobileHours.dateOverrides
      : [];
    const zonedNow = getZonedNow(timezone);

    list.replaceChildren();

    HOURS_DAY_DISPLAY_ORDER.forEach((dayKey) => {
      const dayLabel = HOURS_DAY_LABELS[dayKey] || dayKey;
      const isToday = dayKey === zonedNow.dayKey;
      const isoDate = getIsoDateForDayKey(zonedNow, dayKey);

      const weeklyOverride = weeklyOverrides.find(
        (entry) => normalizeTextValue(entry?.day) === dayKey
      ) || null;

      const dateOverride = dateOverrides.find(
        (entry) => normalizeTextValue(entry?.date) === isoDate
      ) || null;

      const activeOverride = dateOverride || weeklyOverride;
      const hasOverride = Boolean(activeOverride);
      const baseHours = normalizeTextValue(baseWeek[dayKey]);
      const parsedBaseHours = parseHoursRange(baseHours);
      let effectiveHours = parsedBaseHours ? parsedBaseHours.raw : '';

      if (activeOverride?.closed === true) {
        effectiveHours = '';
      } else if (parseHoursRange(activeOverride?.hours)) {
        effectiveHours = normalizeTextValue(activeOverride.hours);
      }

      const parsedEffectiveHours = parseHoursRange(effectiveHours);
      const isClosed = !parsedEffectiveHours;
      const isSpecial = Boolean(activeOverride && activeOverride.special !== false);
      const reason = normalizeTextValue(activeOverride?.reason);

      let statusLabel = '';
      let statusTone = '';

      if (isToday) {
        if (isClosed) {
          statusLabel = labels.closedToday;
          statusTone = hasOverride ? 'exception' : 'closed';
        } else if (zonedNow.minutesNow < parsedEffectiveHours.start) {
          const minutesUntilOpen = parsedEffectiveHours.start - zonedNow.minutesNow;
          if (minutesUntilOpen <= openSoonMinutes) {
            statusLabel = labels.opensSoon;
            statusTone = 'soon';
          } else {
            statusLabel = labels.willOpenLater;
            statusTone = 'soon';
          }
        } else if (zonedNow.minutesNow >= parsedEffectiveHours.end) {
          statusLabel = labels.closedToday;
          statusTone = hasOverride ? 'exception' : 'closed';
        } else {
          const minutesToClose = parsedEffectiveHours.end - zonedNow.minutesNow;
          const isClosingSoon = minutesToClose <= closeSoonMinutes;
          statusLabel = isClosingSoon ? labels.closesSoon : labels.openNow;
          statusTone = isClosingSoon ? 'soon' : 'open';
        }
      } else if (isSpecial) {
        statusLabel = labels.specialHours;
        statusTone = isClosed ? 'exception' : 'special';
      }

      const row = document.createElement('article');
      row.className = 'horarios-mobile__row';
      row.setAttribute('role', 'listitem');
      const isMutedClosedRow = isClosed && !isToday && !hasOverride;
      if (isToday) {
        row.classList.add('horarios-mobile__row--today');
      }
      if (isSpecial) {
        row.classList.add('horarios-mobile__row--special');
      }
      if (isMutedClosedRow) {
        row.classList.add('horarios-mobile__row--muted-closed');
      }

      const rowMain = document.createElement('div');
      rowMain.className = 'horarios-mobile__row-main';

      const dayWrap = document.createElement('div');
      dayWrap.className = 'horarios-mobile__day-wrap';

      if (isToday) {
        const todayIcon = document.createElement('span');
        todayIcon.className = 'horarios-mobile__day-icon';
        todayIcon.appendChild(
          createInlineIcon('0 0 640 640', HOURS_TODAY_ICON_PATH, 'horarios-mobile__day-icon-svg')
        );
        dayWrap.appendChild(todayIcon);
      }

      const dayNode = document.createElement('p');
      dayNode.className = 'horarios-mobile__day';
      dayNode.textContent = isToday ? labels.today : dayLabel;
      dayWrap.appendChild(dayNode);

      const meta = document.createElement('div');
      meta.className = 'horarios-mobile__meta';

      let statusNode = null;
      if (statusLabel) {
        statusNode = document.createElement('span');
        statusNode.className = 'horarios-mobile__chip';
        statusNode.classList.add(`horarios-mobile__chip--${statusTone || 'closed'}`);
        statusNode.textContent = statusLabel;
        row.classList.add('horarios-mobile__row--with-chip');
      }

      const hoursNode = document.createElement('p');
      hoursNode.className = 'horarios-mobile__hours';
      if (isClosed) {
        const hoursInline = document.createElement('span');
        hoursInline.className = 'horarios-mobile__hours-inline';

        if (!isToday) {
          const closedIconWrap = document.createElement('span');
          closedIconWrap.className = 'horarios-mobile__closed-indicator';
          closedIconWrap.appendChild(
            createInlineIcon('0 0 640 640', HOURS_CLOSED_ICON_PATH, 'horarios-mobile__closed-indicator-svg')
          );
          hoursInline.appendChild(closedIconWrap);
        }

        const hoursText = document.createElement('span');
        hoursText.className = 'horarios-mobile__hours-text';
        hoursText.textContent = isMutedClosedRow ? labels.noService : labels.closed;
        hoursInline.appendChild(hoursText);
        hoursNode.appendChild(hoursInline);
      } else {
        hoursNode.textContent = formatHoursForDisplay(effectiveHours, labels.closed);
      }
      meta.appendChild(hoursNode);

      rowMain.appendChild(dayWrap);
      if (statusNode) {
        rowMain.appendChild(statusNode);
      }
      rowMain.appendChild(meta);
      row.appendChild(rowMain);

      if (reason) {
        const reasonNode = document.createElement('p');
        reasonNode.className = 'horarios-mobile__reason';
        reasonNode.textContent = reason;
        row.appendChild(reasonNode);
      }

      list.appendChild(row);
    });

    positionHoursStatusChips(list);
    requestAnimationFrame(() => {
      positionHoursStatusChips(list);
    });

    if (!section.dataset.hoursResizeBound) {
      window.addEventListener('resize', () => {
        positionHoursStatusChips(list);
      });
      section.dataset.hoursResizeBound = '1';
    }

    return {
      hasRenderableHours: list.children.length > 0,
    };
  };

  const applyDelivery = (delivery) => {
    const titleElements = Array.from(document.querySelectorAll('[data-home-delivery-title]'));
    const subtitleElements = Array.from(document.querySelectorAll('[data-home-delivery-subtitle]'));

    titleElements.forEach((element) => {
      setText(element, delivery?.title || '');
    });
    subtitleElements.forEach((element) => {
      setText(element, delivery?.subtitle || '');
    });

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

  const initBottomSheet = ({
    sheetSelector,
    triggerSelector,
    backdropSelector,
    closeButtonSelector,
    optionSelector,
  }) => {
    const sheet = document.querySelector(sheetSelector);
    const triggers = Array.from(document.querySelectorAll(triggerSelector)).filter(
      (node) => node instanceof HTMLElement
    );

    if (!(sheet instanceof HTMLElement) || !triggers.length) {
      return;
    }

    if (sheet.parentElement !== document.body) {
      document.body.appendChild(sheet);
    }

    const panel = sheet.querySelector('.delivery-sheet__panel');
    const closeButton = closeButtonSelector ? sheet.querySelector(closeButtonSelector) : null;
    const backdrop = backdropSelector ? sheet.querySelector(backdropSelector) : null;
    const optionLinks = optionSelector ? Array.from(sheet.querySelectorAll(optionSelector)) : [];
    let closeTimerId = 0;
    let restoreFocusNode = null;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragOffset = 0;
    let isTrackingDrag = false;
    let isDragGesture = false;
    let suppressOptionClickUntil = 0;

    const clearCloseTimer = () => {
      if (closeTimerId) {
        window.clearTimeout(closeTimerId);
        closeTimerId = 0;
      }
    };

    const setDocumentState = () => {
      const hasOpenSheet = Array.from(
        document.querySelectorAll('[data-bottom-sheet-root]')
      ).some(
        (node) =>
          node instanceof HTMLElement &&
          !node.hidden &&
          node.getAttribute('data-state') !== 'closing'
      );
      document.body.classList.toggle('delivery-sheet-open', hasOpenSheet);
    };

    const finishClose = ({ restoreFocus = true } = {}) => {
      clearCloseTimer();
      sheet.hidden = true;
      sheet.removeAttribute('data-state');
      setDocumentState();

      if (panel instanceof HTMLElement) {
        panel.style.transform = '';
        panel.style.transition = '';
      }

      if (restoreFocus && restoreFocusNode instanceof HTMLElement) {
        restoreFocusNode.focus();
      }

      restoreFocusNode = null;
      dragStartX = 0;
      dragStartY = 0;
      dragOffset = 0;
      isTrackingDrag = false;
      isDragGesture = false;
      suppressOptionClickUntil = 0;
    };

    const closeSheet = ({ restoreFocus = true, immediate = false } = {}) => {
      if (sheet.hidden) {
        return;
      }

      clearCloseTimer();

      if (immediate || reducedMotionQuery.matches) {
        finishClose({ restoreFocus });
        return;
      }

      sheet.setAttribute('data-state', 'closing');
      setDocumentState();
      closeTimerId = window.setTimeout(() => {
        finishClose({ restoreFocus });
      }, DELIVERY_SHEET_EXIT_MS);
    };

    const openSheet = (fallbackTrigger) => {
      clearCloseTimer();

      if (window.innerWidth > 1023) {
        return;
      }

      if (!sheet.hidden && sheet.getAttribute('data-state') === 'open') {
        return;
      }

      const hasVisibleOption = optionLinks.some(
        (element) => element instanceof HTMLElement && !element.hidden
      );
      if (optionLinks.length && !hasVisibleOption) {
        return;
      }

      restoreFocusNode =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : fallbackTrigger;

      sheet.hidden = false;
      sheet.setAttribute('data-state', 'opening');
      setDocumentState();

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          if (!sheet.hidden && sheet.getAttribute('data-state') === 'opening') {
            sheet.setAttribute('data-state', 'open');
          }
        });
      });
    };

    const finishDrag = () => {
      if (!isTrackingDrag || !(panel instanceof HTMLElement)) {
        return;
      }

      const shouldClose = isDragGesture && dragOffset > DELIVERY_SHEET_DRAG_CLOSE_THRESHOLD;
      const draggedPanel = isDragGesture && dragOffset > 0;
      isTrackingDrag = false;
      isDragGesture = false;
      dragStartX = 0;
      dragStartY = 0;
      dragOffset = 0;
      panel.style.transition = '';
      panel.style.transform = '';

      if (draggedPanel) {
        suppressOptionClickUntil = Date.now() + 260;
      }

      if (shouldClose) {
        closeSheet({ restoreFocus: false });
      }
    };

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        openSheet(trigger);
      });
    });

    if (closeButton instanceof HTMLElement) {
      closeButton.addEventListener('click', () => {
        closeSheet();
      });
    }

    if (backdrop instanceof HTMLElement) {
      backdrop.addEventListener('click', () => {
        closeSheet();
      });
    }

    optionLinks.forEach((link) => {
      if (!(link instanceof HTMLElement)) {
        return;
      }

      link.addEventListener('click', (event) => {
        if (Date.now() < suppressOptionClickUntil) {
          event.preventDefault();
          return;
        }

        closeSheet({ restoreFocus: false, immediate: true });
      });
    });

    if (panel instanceof HTMLElement) {
      panel.addEventListener(
        'touchstart',
        (event) => {
          if (sheet.hidden || event.touches.length !== 1) {
            return;
          }

          isTrackingDrag = true;
          isDragGesture = false;
          dragStartX = event.touches[0].clientX;
          dragStartY = event.touches[0].clientY;
          dragOffset = 0;
        },
        { passive: true }
      );

      panel.addEventListener(
        'touchmove',
        (event) => {
          if (!isTrackingDrag || event.touches.length !== 1) {
            return;
          }

          const currentX = event.touches[0].clientX;
          const currentY = event.touches[0].clientY;
          const deltaX = Math.abs(currentX - dragStartX);
          const deltaY = currentY - dragStartY;

          if (!isDragGesture) {
            if (deltaY <= 0 || deltaY < DELIVERY_SHEET_DRAG_ACTIVATE_THRESHOLD) {
              return;
            }

            if (deltaX > deltaY) {
              return;
            }

            isDragGesture = true;
            panel.style.transition = 'none';
          }

          dragOffset = Math.max(0, Math.min(deltaY, DELIVERY_SHEET_DRAG_MAX_OFFSET));
          panel.style.transform = `translateY(${dragOffset}px)`;

          if (event.cancelable) {
            event.preventDefault();
          }
        },
        { passive: false }
      );

      panel.addEventListener('touchend', finishDrag);
      panel.addEventListener('touchcancel', finishDrag);
    }

    window.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || sheet.hidden) {
        return;
      }

      event.preventDefault();
      closeSheet();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1023 && !sheet.hidden) {
        closeSheet({ restoreFocus: false, immediate: true });
      }
    });
  };

  const initDeliverySheet = () => {
    initBottomSheet({
      sheetSelector: '[data-delivery-sheet]',
      triggerSelector: '.hero-mobile-action--delivery',
      backdropSelector: '[data-delivery-sheet-backdrop]',
      closeButtonSelector: '[data-delivery-sheet-close]',
      optionSelector: '[data-delivery-sheet-option]',
    });
  };

  const initTestimonialsSheet = () => {
    initBottomSheet({
      sheetSelector: '[data-reviews-sheet]',
      triggerSelector: '[data-reviews-sheet-trigger]',
      backdropSelector: '[data-reviews-sheet-backdrop]',
      closeButtonSelector: '[data-reviews-sheet-close]',
      optionSelector: '[data-reviews-sheet-option]',
    });
  };

  const initHomeVirtualTour = () => {
    const trigger = document.querySelector('[data-home-virtual-tour-open]');
    const modal = document.querySelector('[data-home-virtual-tour-modal]');
    const panel = modal?.querySelector('.home-virtual-tour-modal__panel');
    const iframe = modal?.querySelector('[data-home-virtual-tour-iframe]');
    const closeControls = modal
      ? Array.from(modal.querySelectorAll('[data-home-virtual-tour-close]'))
      : [];
    let closeTimerId = 0;
    let restoreFocusNode = null;

    if (
      !(trigger instanceof HTMLElement) ||
      !(modal instanceof HTMLElement) ||
      !(panel instanceof HTMLElement) ||
      !(iframe instanceof HTMLIFrameElement)
    ) {
      return;
    }

    if (modal.parentElement !== document.body) {
      document.body.appendChild(modal);
    }

    const clearCloseTimer = () => {
      if (closeTimerId) {
        window.clearTimeout(closeTimerId);
        closeTimerId = 0;
      }
    };

    const resolveTourUrl = () => {
      const configuredUrl = normalizeTextValue(iframe.dataset.homeVirtualTourSrc);
      return configuredUrl || HOME_VIRTUAL_TOUR_FALLBACK_URL;
    };

    const syncDocumentState = () => {
      document.body.classList.toggle('home-virtual-tour-open', !modal.hidden);
    };

    const setFrameSource = () => {
      const nextUrl = resolveTourUrl();
      if (!nextUrl) {
        return;
      }

      if (iframe.getAttribute('src') !== nextUrl) {
        iframe.setAttribute('src', nextUrl);
      }
    };

    const clearFrameSource = () => {
      iframe.removeAttribute('src');
    };

    const finishClose = ({ restoreFocus = true } = {}) => {
      clearCloseTimer();
      modal.hidden = true;
      modal.classList.remove('is-open');
      syncDocumentState();
      clearFrameSource();

      if (restoreFocus && restoreFocusNode instanceof HTMLElement) {
        restoreFocusNode.focus();
      }

      restoreFocusNode = null;
    };

    const closeModal = ({ restoreFocus = true, immediate = false } = {}) => {
      if (modal.hidden) {
        return;
      }

      clearCloseTimer();
      modal.classList.remove('is-open');
      syncDocumentState();

      if (immediate || reducedMotionQuery.matches) {
        finishClose({ restoreFocus });
        return;
      }

      closeTimerId = window.setTimeout(() => {
        finishClose({ restoreFocus });
      }, HOME_VIRTUAL_TOUR_EXIT_MS);
    };

    const openModal = (fallbackTrigger) => {
      if (window.innerWidth > 1023 || !modal.hidden) {
        return;
      }

      clearCloseTimer();
      restoreFocusNode =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : fallbackTrigger;

      setFrameSource();
      modal.hidden = false;
      syncDocumentState();

      window.requestAnimationFrame(() => {
        if (!modal.hidden) {
          modal.classList.add('is-open');
          panel.focus({ preventScroll: true });
        }
      });
    };

    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      openModal(trigger);
    });

    closeControls.forEach((control) => {
      if (!(control instanceof HTMLElement)) {
        return;
      }

      control.addEventListener('click', (event) => {
        event.preventDefault();
        closeModal();
      });
    });

    window.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || modal.hidden) {
        return;
      }

      event.preventDefault();
      closeModal();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1023 && !modal.hidden) {
        closeModal({ restoreFocus: false, immediate: true });
      }
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
        { label: 'Menú', url: '/menu/' },
        { label: 'Eventos', url: '/eventos/' },
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
    const contactForm =
      document.querySelector('[data-restaurant-contact-form]') ||
      document.querySelector('.footer-form');
    if (contactCopy) {
      setText(contactCopy, '¿Tienes una pregunta? Escribenos a nuestro WhatsApp');
    }

    if (contactForm instanceof HTMLFormElement) {
      const whatsappBaseUrl = normalizeTextValue(restaurant?.whatsapp);
      contactForm.dataset.whatsappUrl = whatsappBaseUrl;

      if (contactForm.dataset.footerWhatsappBound !== 'true') {
        contactForm.addEventListener('submit', (event) => {
          event.preventDefault();

          const form = event.currentTarget;
          if (!(form instanceof HTMLFormElement)) {
            return;
          }

          const messageInput = form.querySelector('.footer-input');
          const composedUrl = resolveWhatsappComposeUrl(
            form.dataset.whatsappUrl || '',
            messageInput instanceof HTMLInputElement ? messageInput.value : ''
          );

          if (!composedUrl) {
            return;
          }

          window.open(composedUrl, '_blank', 'noopener,noreferrer');
        });

        contactForm.dataset.footerWhatsappBound = 'true';
      }
    }

    footerShell.setAttribute('data-home-footer-note', footer?.note || '');
  };

  const bindHeroMobileReserveAction = (restaurant) => {
    const reserveButton = document.querySelector('.hero-mobile-action--reserve');

    if (!(reserveButton instanceof HTMLButtonElement)) {
      return;
    }

    const whatsappUrl = resolveWhatsappComposeUrl(
      normalizeTextValue(restaurant?.whatsapp),
      HERO_RESERVE_WHATSAPP_MESSAGE
    );

    reserveButton.dataset.whatsappComposeUrl = whatsappUrl;
    if (whatsappUrl) {
      reserveButton.removeAttribute('aria-disabled');
    } else {
      reserveButton.setAttribute('aria-disabled', 'true');
    }
    reserveButton.classList.toggle('is-static', !whatsappUrl);

    if (reserveButton.dataset.heroReserveWhatsappBound === 'true') {
      return;
    }

    reserveButton.addEventListener('click', (event) => {
      event.preventDefault();

      const target = event.currentTarget;
      if (!(target instanceof HTMLButtonElement)) {
        return;
      }

      const composedUrl = normalizeTextValue(target.dataset.whatsappComposeUrl);
      if (!composedUrl) {
        return;
      }

      window.open(composedUrl, '_blank', 'noopener');
    });

    reserveButton.dataset.heroReserveWhatsappBound = 'true';
  };

  const initMobileLocationCard = () => {
    const locationCardSlot = document.querySelector('[data-home-location-card-slot]');
    const locationCard = document.querySelector('.footer-banner');

    if (!locationCardSlot || !locationCard || !locationCard.parentNode) {
      return;
    }

    const locationImage = locationCard.querySelector('.footer-banner-img');
    const wazeButton = locationCard.querySelector('[data-home-location-waze]');
    const googleMapsButton = locationCard.querySelector('[data-home-location-googlemaps]');

    const setLocationImageSource = (isMobile) => {
      if (!(locationImage instanceof HTMLImageElement)) {
        return;
      }

      const relativeSource = isMobile
        ? FOOTER_LOCATION_IMAGE_MOBILE
        : FOOTER_LOCATION_IMAGE_DESKTOP;
      const resolvedSource = normalizeAssetPath(relativeSource) || relativeSource;

      locationImage.setAttribute('data-home-lazy-src', relativeSource);
      if (locationImage.getAttribute('src') !== resolvedSource) {
        locationImage.src = resolvedSource;
      }
      locationImage.dataset.homeLazyLoaded = 'true';
    };

    const syncMobileMapButtons = () => {
      setLinkState(googleMapsButton, HOME_LOCATION_GOOGLE_MAPS_URL, {
        hideWhenMissing: false,
      });
      setLinkState(wazeButton, HOME_LOCATION_WAZE_URL, {
        hideWhenMissing: false,
      });
    };

    const originalParent = locationCard.parentNode;
    const originalNextSibling = locationCard.nextSibling;
    const mobileQuery = window.matchMedia('(max-width: 1023px)');

    const syncLocationCardPlacement = () => {
      if (mobileQuery.matches) {
        setLocationImageSource(true);
        syncMobileMapButtons();
        if (locationCard.parentNode !== locationCardSlot) {
          locationCardSlot.appendChild(locationCard);
        }
        return;
      }

      setLocationImageSource(false);
      syncMobileMapButtons();
      if (locationCard.parentNode !== originalParent) {
        if (originalNextSibling && originalNextSibling.parentNode === originalParent) {
          originalParent.insertBefore(locationCard, originalNextSibling);
          return;
        }
        originalParent.appendChild(locationCard);
      }
    };

    syncLocationCardPlacement();

    if (typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', syncLocationCardPlacement);
    } else if (typeof mobileQuery.addListener === 'function') {
      mobileQuery.addListener(syncLocationCardPlacement);
    }
  };

  const applySectionToggles = (home, flags) => {
    const heroSection = document.querySelector('section.hero');
    const popularSection = document.getElementById('mas-pedidas');
    const hoursSection = document.getElementById('horarios');
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

    const hoursVisible =
      home.sections.hours &&
      home.mobileHours?.enabled &&
      flags.hasRenderableHours;
    setSectionVisibility(hoursSection, hoursVisible);

    const announcementsVisible =
      home.sections.announcements &&
      home.announcements.enabled &&
      flags.hasRenderableAnnouncement;
    setSectionVisibility(announcementSection, announcementsVisible);

    if (announcementSection) {
      announcementSection.hidden = !announcementsVisible;
    }

    if (hoursSection) {
      hoursSection.hidden = !hoursVisible;
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
      const publicNavbarApi = window.FigataPublicNavbar;
      if (publicNavbarApi && typeof publicNavbarApi.refreshFromDom === 'function') {
        publicNavbarApi.refreshFromDom();
      }
      applyPopular(home.popular);
      const hoursFlags = applyMobileHours(home.mobileHours);
      applyDelivery(home.delivery);
      initDeliverySheet();
      initTestimonialsSheet();
      applyTestimonials(home.testimonials);
      applyFooter(home.footer, restaurant);
      bindHeroMobileReserveAction(restaurant);

      const eventsFlags = applyEventsPreview(home.eventsPreview);
      const announcementFlags = applyAnnouncements(home.announcements);

      applySectionToggles(home, {
        ...hoursFlags,
        ...eventsFlags,
        ...announcementFlags,
      });
      initMobileLocationCard();
      initAmbienteParallax();
      initHomeVirtualTour();
    } catch (error) {
      console.error('[home-config] No se pudo aplicar data/home.json.', error);
    }
  };

  void init();
})();
