(() => {
  const READY_EVENT = 'figata:reservas-page-ready';
  const STEP_ORDER = ['who', 'date', 'time', 'zone', 'details'];
  const REDUCED_MOTION_QUERY = window.matchMedia('(prefers-reduced-motion: reduce)');
  const MAX_CALENDAR_MONTHS = 8;
  const TODAY = new Date();
  TODAY.setHours(0, 0, 0, 0);

  const DATE_LABEL_FORMATTER = new Intl.DateTimeFormat('es-DO', {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
  });
  const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat('es-DO', {
    month: 'long',
    year: 'numeric',
  });
  const WEEKDAY_LABELS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  const TIME_HOUR_DIAL_VALUES = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const TIME_MINUTE_DIAL_VALUES = [0, 15, 30, 45];
  const TIME_PERIOD_OPTIONS = [
    { id: 'AM', label: 'AM', disabled: true },
    { id: 'PM', label: 'PM', disabled: false },
  ];
  const SUCCESS_ANIMATION_PATH = 'assets/lottie/Calendar Success Add.json';
  const SUCCESS_PLAYER_SCRIPT_PATH = 'assets/lottie/lottie.min.js';
  const SUCCESS_PLAYER_SCRIPT_ID = 'figata-reservas-lottie-player';
  const WHATSAPP_COUNTRY_CODE = '+1';
  const WHATSAPP_SEGMENTS = [
    { key: 'area', length: 3, autocomplete: 'tel-area-code', placeholder: '809' },
    { key: 'exchange', length: 3, autocomplete: 'off', placeholder: '555' },
    { key: 'line', length: 4, autocomplete: 'off', placeholder: '1234' },
  ];
  const RESERVATION_STATUS_META = {
    pending: {
      label: 'Pendiente',
      note: 'Esperando confirmación del equipo',
      tone: 'pending',
    },
    confirmed: {
      label: 'Confirmada',
      note: 'La mesa quedó asegurada',
      tone: 'confirmed',
    },
    cancelled: {
      label: 'Cancelada',
      note: 'La reserva fue cancelada',
      tone: 'cancelled',
    },
  };
  const OPENING_HOURS_BY_DAY = {
    mon: null,
    tue: null,
    wed: '17:00-23:00',
    thu: '17:00-23:00',
    fri: '17:00-23:00',
    sat: '17:00-23:00',
    sun: '12:00-23:00',
  };
  const DAY_KEYS_BY_INDEX = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const DEFAULT_TIME_DRAFT = {
    hour12: 7,
    minute: 0,
    period: 'PM',
  };
  const createEmptyWhatsappSegments = () => ({
    area: '',
    exchange: '',
    line: '',
  });

  const buildTimeOptions = () => {
    const options = [];

    TIME_HOUR_DIAL_VALUES.forEach((hour12) => {
      TIME_MINUTE_DIAL_VALUES.forEach((minute) => {
        const hour24 = hour12 === 12 ? 12 : hour12 + 12;
        const minuteLabel = String(minute).padStart(2, '0');
        const id = `${String(hour24).padStart(2, '0')}:${minuteLabel}`;

        options.push({
          id: id,
          label: `${hour12}:${minuteLabel} PM`,
          hour12: hour12,
          hour24: hour24,
          minute: minute,
          period: 'PM',
        });
      });
    });

    return options;
  };

  const TIME_OPTIONS = buildTimeOptions();
  const TIME_OPTIONS_BY_ID = new Map(TIME_OPTIONS.map((entry) => [entry.id, entry]));

  const ZONE_OPTIONS = [
    {
      id: 'interior',
      label: 'Interior',
      icon: 'interior',
    },
    {
      id: 'terraza',
      label: 'Terraza',
      icon: 'terrace',
    },
  ];

  const STEP_META = {
    who: { title: '¿Cuántos vienen?', placeholder: 'Añade comensales' },
    date: { title: '¿Qué día prefieren?', placeholder: 'Elige una fecha' },
    time: { title: '¿A qué hora?', placeholder: 'Elige un horario' },
    zone: { title: '¿Qué zona prefieren?', placeholder: 'Elige una zona' },
    details: { title: 'Tus datos', placeholder: 'Completa tus datos' },
  };

  const root = document.querySelector('[data-reservas-app]');
  const stageNode = root?.querySelector('.reservas-stage') || null;
  const introPanelNode = root?.querySelector('.reservas-hero-mobile-panel') || null;
  const cardsHost = root?.querySelector('[data-reservas-cards]') || null;
  const progressHost = root?.querySelector('[data-reservas-progress]') || null;
  const nextButton = root?.querySelector('[data-reservas-next]') || null;
  const backButton = root?.querySelector('[data-reservas-back]') || null;

  if (!(root instanceof HTMLElement) || !(cardsHost instanceof HTMLElement)) {
    return;
  }

  let lottieLoaderPromise = null;
  let successAnimationInstance = null;

  const state = {
    step: 'who',
    submitted: false,
    reservationStatus: 'pending',
    visibleCalendarMonths: 2,
    guests: 0,
    date: '',
    time: '',
    timeMode: 'hour',
    timeDraftHour: DEFAULT_TIME_DRAFT.hour12,
    timeDraftMinute: DEFAULT_TIME_DRAFT.minute,
    timePeriod: DEFAULT_TIME_DRAFT.period,
    timeDialPointerId: null,
    timeDialPointerActive: false,
    timeDialPointerMode: 'hour',
    zone: '',
    details: {
      name: '',
      whatsapp: createEmptyWhatsappSegments(),
      notes: '',
    },
  };

  const escapeHtml = (value) =>
    String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const toIsoDate = (value) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const capitalize = (value) => {
    const raw = String(value || '').trim();
    return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : '';
  };

  const sanitizeDigits = (value) => String(value || '').replace(/\D/g, '');

  const padTimeValue = (value) => String(Math.max(0, Number(value) || 0)).padStart(2, '0');

  const toHour24 = (hour12, period) => {
    const normalizedHour = Number(hour12) || DEFAULT_TIME_DRAFT.hour12;
    if (period === 'AM') {
      return normalizedHour === 12 ? 0 : normalizedHour;
    }
    return normalizedHour === 12 ? 12 : normalizedHour + 12;
  };

  const getTimeIdFromParts = (hour12, minute, period) =>
    `${String(toHour24(hour12, period)).padStart(2, '0')}:${padTimeValue(minute)}`;

  const getTimeDraftState = () => ({
    hour12: state.timeDraftHour,
    minute: state.timeDraftMinute,
    period: state.timePeriod,
  });

  const getTimeDisplayLabel = (hour12, minute, period) =>
    `${padTimeValue(hour12)}:${padTimeValue(minute)} ${period}`;

  const parseTimeSelection = (value) => TIME_OPTIONS_BY_ID.get(value) || null;

  const parseRangeToMinutes = (range) => {
    if (typeof range !== 'string' || !/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(range)) {
      return null;
    }

    const [opensAt, closesAt] = range.split('-');
    const [openHour, openMinute] = opensAt.split(':').map(Number);
    const [closeHour, closeMinute] = closesAt.split(':').map(Number);

    return {
      openMinutes: openHour * 60 + openMinute,
      closeMinutes: closeHour * 60 + closeMinute,
    };
  };

  const getDayKeyFromIsoDate = (isoDate) => {
    if (!isoDate) {
      return null;
    }

    const date = new Date(`${isoDate}T12:00:00`);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return DAY_KEYS_BY_INDEX[date.getDay()] || null;
  };

  const getOpeningRangeForDate = (isoDate) => {
    const dayKey = getDayKeyFromIsoDate(isoDate);
    if (!dayKey) {
      return null;
    }

    return parseRangeToMinutes(OPENING_HOURS_BY_DAY[dayKey]);
  };

  const isTimeOptionAvailable = (option) => {
    if (!option || option.period !== 'PM') {
      return false;
    }

    const range = getOpeningRangeForDate(state.date);
    if (!range) {
      return false;
    }

    const optionMinutes = option.hour24 * 60 + option.minute;
    return optionMinutes >= range.openMinutes && optionMinutes < range.closeMinutes;
  };

  const getAvailableTimeOptions = () => TIME_OPTIONS.filter((entry) => isTimeOptionAvailable(entry));

  const getAvailableHourValues = () =>
    getAvailableTimeOptions().reduce((hours, entry) => {
      if (!hours.includes(entry.hour12)) {
        hours.push(entry.hour12);
      }
      return hours;
    }, []);

  const getAvailableMinuteValues = (hour12) =>
    getAvailableTimeOptions()
      .filter((entry) => entry.hour12 === hour12)
      .map((entry) => entry.minute)
      .filter((value, index, collection) => collection.indexOf(value) === index);

  const getFirstAvailableTimeOption = () => getAvailableTimeOptions()[0] || null;

  const findNearestAvailableDialValue = (mode, value) => {
    const allValues = getTimeDialValues(mode);
    const availableValues = mode === 'minute'
      ? getAvailableMinuteValues(state.timeDraftHour)
      : getAvailableHourValues();

    if (!availableValues.length) {
      return null;
    }

    if (availableValues.includes(value)) {
      return value;
    }

    const targetIndex = allValues.indexOf(value);

    return availableValues.reduce((bestValue, candidate) => {
      const candidateIndex = allValues.indexOf(candidate);
      const bestIndex = allValues.indexOf(bestValue);
      const candidateDistance = Math.min(
        Math.abs(candidateIndex - targetIndex),
        allValues.length - Math.abs(candidateIndex - targetIndex)
      );
      const bestDistance = Math.min(
        Math.abs(bestIndex - targetIndex),
        allValues.length - Math.abs(bestIndex - targetIndex)
      );

      return candidateDistance < bestDistance ? candidate : bestValue;
    }, availableValues[0]);
  };

  const syncTimeAvailabilityState = () => {
    const firstAvailable = getFirstAvailableTimeOption();

    if (!firstAvailable) {
      state.time = '';
      state.timeDraftHour = DEFAULT_TIME_DRAFT.hour12;
      state.timeDraftMinute = DEFAULT_TIME_DRAFT.minute;
      state.timePeriod = DEFAULT_TIME_DRAFT.period;
      return;
    }

    if (!getAvailableHourValues().includes(state.timeDraftHour)) {
      state.timeDraftHour = firstAvailable.hour12;
    }

    if (!getAvailableMinuteValues(state.timeDraftHour).includes(state.timeDraftMinute)) {
      state.timeDraftMinute = getAvailableMinuteValues(state.timeDraftHour)[0] ?? firstAvailable.minute;
    }

    if (state.time) {
      const selectedTime = getSelectedTime();
      if (!isTimeOptionAvailable(selectedTime)) {
        state.time = '';
      }
    }
  };

  const buildCalendarMonths = (count) => {
    const months = [];
    const dateLookup = new Map();
    const firstMonth = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1);

    for (let monthOffset = 0; monthOffset < count; monthOffset += 1) {
      const monthStart = new Date(firstMonth.getFullYear(), firstMonth.getMonth() + monthOffset, 1);
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      const leadingBlanks = monthStart.getDay();
      const cells = [];

      for (let blankIndex = 0; blankIndex < leadingBlanks; blankIndex += 1) {
        cells.push({ type: 'blank', id: `blank-${monthOffset}-${blankIndex}` });
      }

      for (let day = 1; day <= monthEnd.getDate(); day += 1) {
        const dateValue = new Date(monthStart.getFullYear(), monthStart.getMonth(), day);
        const isoValue = toIsoDate(dateValue);
        const info = {
          type: 'day',
          value: isoValue,
          day: String(day),
          label: DATE_LABEL_FORMATTER.format(dateValue),
          disabled: dateValue < TODAY,
        };

        cells.push(info);
        dateLookup.set(isoValue, info);
      }

      months.push({
        id: `month-${monthStart.getFullYear()}-${monthStart.getMonth() + 1}`,
        label: capitalize(MONTH_LABEL_FORMATTER.format(monthStart)),
        cells: cells,
      });
    }

    return { months: months, lookup: dateLookup };
  };

  let calendarData = buildCalendarMonths(state.visibleCalendarMonths);

  const refreshCalendarData = () => {
    calendarData = buildCalendarMonths(state.visibleCalendarMonths);
  };

  const getPartySize = () => Math.max(0, Number(state.guests || 0));
  const getSelectedDate = () => calendarData.lookup.get(state.date) || null;
  const getSelectedTime = () => parseTimeSelection(state.time);
  const getSelectedZone = () => ZONE_OPTIONS.find((entry) => entry.id === state.zone) || null;
  const getCurrentStepIndex = () => STEP_ORDER.indexOf(state.step);
  const getReservationStatusMeta = () =>
    RESERVATION_STATUS_META[state.reservationStatus] || RESERVATION_STATUS_META.pending;
  const getWhatsappSegments = () => ({
    area: sanitizeDigits(state.details?.whatsapp?.area).slice(0, 3),
    exchange: sanitizeDigits(state.details?.whatsapp?.exchange).slice(0, 3),
    line: sanitizeDigits(state.details?.whatsapp?.line).slice(0, 4),
  });
  const getWhatsappNumber = () => {
    const segments = getWhatsappSegments();
    return `${segments.area}${segments.exchange}${segments.line}`;
  };
  const hasCompleteWhatsapp = () =>
    WHATSAPP_SEGMENTS.every((segment) => getWhatsappSegments()[segment.key].length === segment.length);

  const setWhatsappSegments = (segments) => {
    state.details.whatsapp = {
      area: sanitizeDigits(segments?.area).slice(0, 3),
      exchange: sanitizeDigits(segments?.exchange).slice(0, 3),
      line: sanitizeDigits(segments?.line).slice(0, 4),
    };
  };

  const formatWhatsappNumber = () => {
    const segments = getWhatsappSegments();
    if (!segments.area && !segments.exchange && !segments.line) {
      return WHATSAPP_COUNTRY_CODE;
    }

    return [
      WHATSAPP_COUNTRY_CODE,
      [segments.area, segments.exchange, segments.line].filter(Boolean).join('-'),
    ].filter(Boolean).join(' ');
  };

  const toAbsoluteUrl = (value) => {
    const publicPaths = window.FigataPublicPaths || null;
    if (publicPaths?.toAbsoluteUrl) {
      return publicPaths.toAbsoluteUrl(value);
    }

    return new URL(value, document.baseURI || window.location.href).toString();
  };

  const ensureSuccessPlayer = () => {
    if (window.lottie && typeof window.lottie.loadAnimation === 'function') {
      return Promise.resolve(window.lottie);
    }

    if (lottieLoaderPromise) {
      return lottieLoaderPromise;
    }

    lottieLoaderPromise = new Promise((resolve, reject) => {
      const existingScript = document.getElementById(SUCCESS_PLAYER_SCRIPT_ID);
      const script = existingScript || document.createElement('script');

      const handleLoad = () => {
        script.dataset.loaded = 'true';
        if (window.lottie && typeof window.lottie.loadAnimation === 'function') {
          resolve(window.lottie);
          return;
        }

        lottieLoaderPromise = null;
        reject(new Error('Lottie player loaded without window.lottie'));
      };

      const handleError = () => {
        lottieLoaderPromise = null;
        reject(new Error('Failed to load local Lottie player'));
      };

      if (existingScript) {
        if (existingScript.dataset.loaded === 'true') {
          handleLoad();
          return;
        }

        existingScript.addEventListener('load', handleLoad, { once: true });
        existingScript.addEventListener('error', handleError, { once: true });
        return;
      }

      script.id = SUCCESS_PLAYER_SCRIPT_ID;
      script.dataset.loaded = 'false';
      script.async = true;
      script.src = toAbsoluteUrl(SUCCESS_PLAYER_SCRIPT_PATH);
      script.addEventListener('load', handleLoad, { once: true });
      script.addEventListener('error', handleError, { once: true });
      document.head.appendChild(script);
    });

    return lottieLoaderPromise;
  };

  const destroySuccessAnimation = () => {
    if (successAnimationInstance && typeof successAnimationInstance.destroy === 'function') {
      try {
        successAnimationInstance.destroy();
      } catch (_error) {
        // Ignore stale animation cleanup while swapping confirmation states.
      }
    }

    successAnimationInstance = null;
  };

  const mountSuccessAnimation = () => {
    const slot = cardsHost.querySelector('[data-reservas-success-animation]');
    if (!(slot instanceof HTMLElement)) {
      destroySuccessAnimation();
      return;
    }

    ensureSuccessPlayer()
      .then((lottie) => {
        const liveSlot = cardsHost.querySelector('[data-reservas-success-animation]');
        if (!(liveSlot instanceof HTMLElement) || liveSlot !== slot) {
          return;
        }

        destroySuccessAnimation();
        liveSlot.classList.remove('is-fallback');
        liveSlot.replaceChildren();

        const player = document.createElement('div');
        player.className = 'reservas-confirmation__animation-player';
        liveSlot.appendChild(player);

        successAnimationInstance = lottie.loadAnimation({
          autoplay: true,
          container: player,
          loop: false,
          path: toAbsoluteUrl(SUCCESS_ANIMATION_PATH),
          renderer: 'svg',
          rendererSettings: {
            hideOnTransparent: true,
            preserveAspectRatio: 'xMidYMid meet',
            progressiveLoad: false,
          },
        });
      })
      .catch(() => {
        const liveSlot = cardsHost.querySelector('[data-reservas-success-animation]');
        if (!(liveSlot instanceof HTMLElement)) {
          return;
        }

        destroySuccessAnimation();
        liveSlot.classList.add('is-fallback');
        liveSlot.innerHTML = '<span class="reservas-confirmation__fallback-mark" aria-hidden="true">✓</span>';
      });
  };

  const isStepComplete = (step) => {
    switch (step) {
      case 'who':
        return getPartySize() > 0;
      case 'date':
        return Boolean(state.date);
      case 'time':
        return Boolean(state.time);
      case 'zone':
        return Boolean(state.zone);
      case 'details':
        return Boolean(state.details.name.trim() && hasCompleteWhatsapp());
      default:
        return false;
    }
  };

  const getStepSummary = (step) => {
    switch (step) {
      case 'who': {
        const partySize = getPartySize();
        return partySize ? `${partySize} ${partySize === 1 ? 'persona' : 'personas'}` : STEP_META.who.placeholder;
      }
      case 'date': {
        const selectedDate = getSelectedDate();
        return selectedDate ? selectedDate.label : STEP_META.date.placeholder;
      }
      case 'time': {
        const selectedTime = getSelectedTime();
        return selectedTime ? selectedTime.label : STEP_META.time.placeholder;
      }
      case 'zone': {
        const selectedZone = getSelectedZone();
        return selectedZone ? selectedZone.label : STEP_META.zone.placeholder;
      }
      case 'details':
        return state.details.name.trim() || formatWhatsappNumber() || STEP_META.details.placeholder;
      default:
        return '';
    }
  };

  const renderIcon = (icon) => {
    switch (icon) {
      case 'interior':
        return '<svg viewBox="0 0 545.062 545.062" aria-hidden="true" focusable="false"><g><polygon points="24.91,320.344 103.744,320.344 114.387,406.406 124.312,406.406 124.312,320.344 124.312,291.656 100.196,291.656 27.416,291.656 26.833,291.656 17.394,138.656 0,138.656 0,291.656 0,301.219 0,320.344 0,406.406 17.394,406.406"></polygon><path d="M33.469,282.094h86.062c2.639,0,4.781-2.142,4.781-4.781s-2.142-4.781-4.781-4.781H33.469 c-2.639,0-4.781,2.142-4.781,4.781S30.83,282.094,33.469,282.094z"></path><polygon points="515.84,291.656 515.256,291.656 442.476,291.656 411.188,291.656 411.188,320.344 411.188,406.406 428.285,406.406 438.929,320.344 517.762,320.344 525.277,406.406 545.062,406.406 545.062,320.344 545.062,301.219 545.062,291.656 545.062,138.656 525.277,138.656"></polygon><path d="M411.188,277.312c0,2.64,2.142,4.781,4.781,4.781h86.062c2.64,0,4.781-2.142,4.781-4.781s-2.142-4.781-4.781-4.781h-86.062 C413.329,272.531,411.188,274.673,411.188,277.312z"></path><path d="M84.925,205.594h77.638v200.812h14.784l11.484-162.562h158.804l11.485,162.562h13.817V205.594h87.2 c4.657,0,8.425-3.768,8.425-8.425v-2.275c0-4.657-3.768-8.425-8.425-8.425H84.925c-4.657,0-8.425,3.768-8.425,8.425v2.275 C76.5,201.826,80.268,205.594,84.925,205.594z M344.929,205.594l1.349,19.125H190.179l1.348-19.125H344.929z"></path></g></svg>';
      case 'terrace':
        return '<svg viewBox="0 0 463.057 463.057" aria-hidden="true" focusable="false"><g><g><g><path d="M343.029,311.528v-16.5h8.5c4.142,0,7.5-3.358,7.5-7.5c0-4.142-3.358-7.5-7.5-7.5h-13.594l3-9h2.594 c4.142,0,7.5-3.358,7.5-7.5c0-4.142-3.358-7.5-7.5-7.5h-7.846c-0.005,0-0.01,0-0.015,0h-48.263c-0.012,0-0.024,0-0.036,0h-7.84 c-4.142,0-7.5,3.358-7.5,7.5c0,4.142,3.358,7.5,7.5,7.5h2.594l3,9h-46.094v-169h212.708c5.5,0,10.067-3.771,11.107-9.172 c1.04-5.401-1.8-10.599-6.906-12.642L234.382,0.591c-0.245-0.101-0.494-0.187-0.747-0.261c-0.002-0.001-0.005-0.001-0.007-0.002 c-0.226-0.065-0.454-0.121-0.685-0.165c-0.058-0.011-0.117-0.016-0.176-0.025c-0.175-0.029-0.351-0.059-0.527-0.076 c-0.223-0.021-0.446-0.031-0.67-0.032c-0.014,0-0.028-0.002-0.041-0.002c-0.238,0-0.475,0.011-0.712,0.034 c-0.155,0.015-0.309,0.042-0.463,0.066c-0.08,0.013-0.161,0.02-0.24,0.035c-0.22,0.042-0.438,0.096-0.654,0.158 c-0.013,0.003-0.025,0.005-0.038,0.009c-0.252,0.074-0.501,0.161-0.745,0.261L7.119,89.213 c-5.106,2.043-7.946,7.241-6.906,12.642c1.04,5.401,5.607,9.172,11.107,9.172h212.708v169h-46.094l3-9h2.594 c4.142,0,7.5-3.358,7.5-7.5c0-4.142-3.358-7.5-7.5-7.5h-7.846c-0.005,0-0.01,0-0.015,0h-48.263c-0.012,0-0.024,0-0.036,0h-7.84 c-4.142,0-7.5,3.358-7.5,7.5c0,4.142,3.358,7.5,7.5,7.5h2.594l3,9h-13.594c-4.142,0-7.5,3.358-7.5,7.5c0,4.142,3.358,7.5,7.5,7.5 h8.5v16.5c0,8.547,6.953,15.5,15.5,15.5h88.5v82.234c-9.29,3.138-16,11.93-16,22.266v16.5h-16.5c-4.142,0-7.5,3.358-7.5,7.5 c0,4.142,3.358,7.5,7.5,7.5h80c4.142,0,7.5-3.358,7.5-7.5c0-4.142-3.358-7.5-7.5-7.5h-16.5v-16.5c0-10.335-6.71-19.127-16-22.266 v-82.234h88.501v0.001C336.076,327.028,343.029,320.075,343.029,311.528z M325.123,271.028l-3,9h-21.188l-3-9H325.123z M432.585,96.028H330.636L262.67,28.062L432.585,96.028z M30.473,96.028l169.916-67.966l-67.966,67.966H30.473z M153.636,96.028 l77.893-77.894l77.894,77.894H153.636z M165.123,271.028l-3,9h-21.188l-3-9H165.123z M240.029,431.528v16.5h-17v-16.5 c0-4.687,3.813-8.5,8.5-8.5C236.216,423.028,240.029,426.841,240.029,431.528z M327.528,312.028h-192 c-0.275,0-0.499-0.225-0.499-0.5v-16.5h0.474c0.008,0,0.017,0.002,0.025,0.002s0.016-0.002,0.024-0.002h191.953 c0.008,0,0.016,0.002,0.024,0.002s0.016-0.002,0.025-0.002h0.474v16.5C328.028,311.803,327.804,312.028,327.528,312.028z"></path><path d="M103.529,344.028H30.15l-15.179-121.43c-0.514-4.11-4.268-7.025-8.372-6.512c-4.11,0.514-7.026,4.263-6.512,8.373 l15.942,127.537v31.533v72c0,4.142,3.358,7.5,7.5,7.5c4.142,0,7.5-3.358,7.5-7.5v-32.5h65v32.5c0,4.142,3.358,7.5,7.5,7.5 c4.142,0,7.5-3.358,7.5-7.5v-65.734c9.29-3.138,16-11.93,16-22.266C127.029,354.57,116.487,344.028,103.529,344.028z M96.029,408.028h-65v-17h65V408.028z M103.529,376.028h-72.5v-17h72.5c4.687,0,8.5,3.813,8.5,8.5 S108.216,376.028,103.529,376.028z"></path><path d="M456.459,216.085c-4.111-0.516-7.858,2.402-8.372,6.512l-15.179,121.43h-73.379c-12.958,0-23.5,10.542-23.5,23.5 c0,10.335,6.71,19.127,16,22.266v65.734c0,4.142,3.358,7.5,7.5,7.5c4.142,0,7.5-3.358,7.5-7.5v-32.5h65v32.5 c0,4.142,3.358,7.5,7.5,7.5c4.142,0,7.5-3.358,7.5-7.5v-72v-31.533l15.942-127.537C463.485,220.348,460.57,216.6,456.459,216.085 z M432.029,408.028h-65v-17h65V408.028z M432.029,376.028h-72.5c-4.687,0-8.5-3.813-8.5-8.5s3.813-8.5,8.5-8.5h72.5V376.028z"></path></g></g></g></svg>';
      default:
        return '';
    }
  };

  const renderStepShell = (step, bodyMarkup) => `
    <section class="reservas-step-card" data-step-card="${escapeHtml(step)}">
      <header class="reservas-step-card__head">
        <h2 class="reservas-step-card__title">${escapeHtml(STEP_META[step].title)}</h2>
      </header>
      <div class="reservas-step-card__body">
        ${bodyMarkup}
      </div>
    </section>
  `;

  const renderWhoStep = () =>
    renderStepShell(
      'who',
      `
        <div class="reservas-guest-picker" aria-label="Cantidad de comensales">
          <button
            class="reservas-guest-picker__button"
            type="button"
            data-guest-action="decrement"
            ${getPartySize() <= 0 ? 'disabled' : ''}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 12h12"></path></svg>
          </button>
          <span class="reservas-guest-picker__value" data-reservas-guests-value>${getPartySize()}</span>
          <button
            class="reservas-guest-picker__button"
            type="button"
            data-guest-action="increment">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 6v12M6 12h12"></path></svg>
          </button>
        </div>
      `
    );

  const renderCalendarWeekdays = () => `
    <div class="reservas-calendar__weekdays reservas-calendar__weekdays--sticky" aria-hidden="true">
      ${WEEKDAY_LABELS.map((label) => `<span>${escapeHtml(label)}</span>`).join('')}
    </div>
  `;

  const renderCalendarMonth = (month) => `
    <section class="reservas-calendar__month" aria-label="${escapeHtml(month.label)}">
      <header class="reservas-calendar__month-head">
        <h3>${escapeHtml(month.label)}</h3>
      </header>
      <div class="reservas-calendar__grid">
        ${month.cells.map((cell) => {
          if (cell.type === 'blank') {
            return '<span class="reservas-calendar__cell reservas-calendar__cell--empty" aria-hidden="true"></span>';
          }

          return `
            <button
              class="reservas-calendar__date"
              type="button"
              data-select-date="${escapeHtml(cell.value)}"
              aria-label="${escapeHtml(cell.label)}"
              aria-pressed="${String(state.date === cell.value)}"
              ${cell.disabled ? 'disabled' : ''}>
              <span>${escapeHtml(cell.day)}</span>
            </button>
          `;
        }).join('')}
      </div>
    </section>
  `;

  const renderCalendarLoadMore = () => {
    if (state.visibleCalendarMonths >= MAX_CALENDAR_MONTHS) {
      return '';
    }

    return `
      <button class="reservas-calendar__load-more" type="button" data-load-more-dates>
        Load more dates
      </button>
    `;
  };

  const renderDatePanel = () => `
    <div class="reservas-date-panel" data-reservas-date-panel>
      ${renderCalendarWeekdays()}
      <div class="reservas-calendar__scroller" data-reservas-calendar-scroller>
        <div class="reservas-calendar">
          ${calendarData.months.map(renderCalendarMonth).join('')}
        </div>
        ${renderCalendarLoadMore()}
      </div>
    </div>
  `;

  const renderDateStep = () =>
    renderStepShell(
      'date',
      renderDatePanel()
    );

  const getTimeDialValues = (mode) =>
    mode === 'minute' ? TIME_MINUTE_DIAL_VALUES : TIME_HOUR_DIAL_VALUES;

  const getActiveTimeDialValue = () =>
    state.timeMode === 'minute' ? state.timeDraftMinute : state.timeDraftHour;

  const getTimeDialAngle = (mode, value) => {
    const dialValues = getTimeDialValues(mode);
    const index = dialValues.indexOf(value);
    if (index === -1) {
      return 0;
    }
    return index * (360 / dialValues.length);
  };

  const commitTimeDraft = () => {
    if (state.timePeriod !== 'PM') {
      state.time = '';
      return;
    }
    state.time = getTimeIdFromParts(state.timeDraftHour, state.timeDraftMinute, state.timePeriod);
  };

  const syncTimeDraftFromSelection = () => {
    const selectedTime = getSelectedTime();
    if (!selectedTime) {
      return;
    }
    state.timeDraftHour = selectedTime.hour12;
    state.timeDraftMinute = selectedTime.minute;
    state.timePeriod = selectedTime.period;
  };

  const setTimeDialValue = (mode, value) => {
    if (mode === 'minute') {
      state.timeDraftMinute = value;
      commitTimeDraft();
    } else {
      const hourChanged = state.timeDraftHour !== value;
      state.timeDraftHour = value;
      if (hourChanged) {
        state.time = '';
      }
    }

    syncTimeUi();
  };

  const renderTimeDialOptions = (mode) => {
    const dialValues = getTimeDialValues(mode);
    const selectedValue = mode === 'minute' ? state.timeDraftMinute : state.timeDraftHour;
    const availableValues = mode === 'minute'
      ? getAvailableMinuteValues(state.timeDraftHour)
      : getAvailableHourValues();

    return dialValues.map((value, index) => {
      const angle = index * (360 / dialValues.length);
      const isSelected = value === selectedValue;
      const isAvailable = availableValues.includes(value);
      const label = mode === 'minute' ? padTimeValue(value) : String(value);
      const ariaLabel = mode === 'minute'
        ? `Seleccionar ${label} minutos`
        : `Seleccionar las ${value}`;

      return `
        <button
          class="reservas-time-picker__dial-option ${isSelected ? 'is-selected' : ''}"
          type="button"
          data-time-dial-option
          data-time-mode="${escapeHtml(mode)}"
          data-time-value="${escapeHtml(value)}"
          aria-label="${escapeHtml(ariaLabel)}"
          aria-pressed="${String(isSelected)}"
          ${isAvailable ? '' : 'disabled'}
          style="--reservas-time-option-angle:${angle}deg;">
          <span>${escapeHtml(label)}</span>
        </button>
      `;
    }).join('');
  };

  const renderTimeStep = () => {
    syncTimeDraftFromSelection();
    syncTimeAvailabilityState();

    const draft = getTimeDraftState();
    const angle = getTimeDialAngle(state.timeMode, getActiveTimeDialValue());

    return renderStepShell(
      'time',
      `
        <div class="reservas-time-picker" data-reservas-time-picker>
          <div class="reservas-time-picker__summary">
            <div class="reservas-time-picker__display" aria-label="${escapeHtml(getTimeDisplayLabel(draft.hour12, draft.minute, draft.period))}">
              <button
                class="reservas-time-picker__value ${state.timeMode === 'hour' ? 'is-active' : ''}"
                type="button"
                data-time-view-mode="hour"
                aria-pressed="${String(state.timeMode === 'hour')}">
                <span data-time-display-hour>${escapeHtml(padTimeValue(draft.hour12))}</span>
              </button>
              <span class="reservas-time-picker__colon" aria-hidden="true">:</span>
              <button
                class="reservas-time-picker__value ${state.timeMode === 'minute' ? 'is-active' : ''}"
                type="button"
                data-time-view-mode="minute"
                aria-pressed="${String(state.timeMode === 'minute')}">
                <span data-time-display-minute>${escapeHtml(padTimeValue(draft.minute))}</span>
              </button>
              <div class="reservas-time-picker__periods" role="group" aria-label="Periodo">
                ${TIME_PERIOD_OPTIONS.map((option) => `
                  <button
                    class="reservas-time-picker__period ${draft.period === option.id ? 'is-active' : ''}"
                    type="button"
                    data-time-period="${escapeHtml(option.id)}"
                    aria-pressed="${String(draft.period === option.id)}"
                    ${option.disabled ? 'disabled' : ''}>
                    ${escapeHtml(option.label)}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="reservas-time-picker__dial-wrap">
            <div
              class="reservas-time-picker__dial"
              data-time-dial
              data-mode="${escapeHtml(state.timeMode)}"
              style="--reservas-time-dial-angle:${angle}deg;">
              <span class="reservas-time-picker__dial-center" aria-hidden="true"></span>
              <span class="reservas-time-picker__dial-hand" aria-hidden="true"></span>
              <div class="reservas-time-picker__dial-options" data-time-dial-options data-mode="${escapeHtml(state.timeMode)}">
                ${renderTimeDialOptions(state.timeMode)}
              </div>
            </div>
          </div>
        </div>
      `
    );
  };

  const renderZoneStep = () =>
    renderStepShell(
      'zone',
      `
        <div class="reservas-choice-grid reservas-choice-grid--zones">
          ${ZONE_OPTIONS.map((entry) => `
            <button
              class="reservas-choice-card reservas-zone-card"
              type="button"
              data-select-zone="${escapeHtml(entry.id)}"
              aria-pressed="${String(state.zone === entry.id)}">
              <span class="reservas-zone-card__icon" aria-hidden="true">${renderIcon(entry.icon)}</span>
              <span class="reservas-choice-card__title">${escapeHtml(entry.label)}</span>
            </button>
          `).join('')}
        </div>
      `
    );

  const renderDetailsStep = () =>
    renderStepShell(
      'details',
      `
        <div class="reservas-field-stack">
          <label class="reservas-field">
            <span class="reservas-field__label">Nombre</span>
            <input
              class="reservas-field__control"
              type="text"
              name="name"
              autocomplete="name"
              value="${escapeHtml(state.details.name)}"
              data-detail-field="name">
          </label>
          <label class="reservas-field reservas-field--whatsapp">
            <span class="reservas-field__label">Whatsapp</span>
            <div class="reservas-whatsapp" role="group" aria-label="Número de Whatsapp">
              <span
                class="reservas-whatsapp__country"
                aria-label="Código de país República Dominicana ${escapeHtml(WHATSAPP_COUNTRY_CODE)}">
                <span class="reservas-whatsapp__country-iso" aria-hidden="true">RD</span>
                <span class="reservas-whatsapp__country-code" aria-hidden="true">${escapeHtml(WHATSAPP_COUNTRY_CODE)}</span>
              </span>
              <div class="reservas-whatsapp__segments">
                ${WHATSAPP_SEGMENTS.map((segment, index) => `
                  <input
                    class="reservas-whatsapp__segment ${getWhatsappSegments()[segment.key] ? 'is-filled' : ''}"
                    type="tel"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    maxlength="${segment.length}"
                    autocomplete="${segment.autocomplete}"
                    placeholder="${segment.placeholder}"
                    aria-label="${index === 0 ? 'Area code de Whatsapp' : index === 1 ? 'Exchange de Whatsapp' : 'Line number de Whatsapp'}"
                    value="${escapeHtml(getWhatsappSegments()[segment.key])}"
                    data-whatsapp-segment="${segment.key}">
                  ${index < WHATSAPP_SEGMENTS.length - 1 ? '<span class="reservas-whatsapp__divider" aria-hidden="true">-</span>' : ''}
                `).join('')}
              </div>
            </div>
          </label>
          <label class="reservas-field">
            <span class="reservas-field__label">Notas</span>
            <textarea
              class="reservas-field__control"
              rows="4"
              name="notes"
              data-detail-field="notes">${escapeHtml(state.details.notes)}</textarea>
          </label>
        </div>
      `
    );

  const renderConfirmation = () => {
    const selectedDate = getSelectedDate();
    const selectedTime = getSelectedTime();
    const selectedZone = getSelectedZone();
    const statusMeta = getReservationStatusMeta();
    const rows = [
      { label: 'Fecha', value: selectedDate ? selectedDate.label : 'Por definir' },
      { label: 'Hora', value: selectedTime ? selectedTime.label : 'Por definir' },
      { label: 'Comensales', value: getStepSummary('who') },
      { label: 'Zona', value: selectedZone ? selectedZone.label : 'Por definir' },
      { label: 'Nombre', value: state.details.name.trim() || 'Por definir' },
      { label: 'Whatsapp', value: formatWhatsappNumber() },
    ];

    if (state.details.notes.trim()) {
      rows.push({ label: 'Notas', value: state.details.notes.trim() });
    }

    return `
      <section class="reservas-confirmation" aria-labelledby="reservas-confirmation-title">
        <div class="reservas-confirmation__hero">
          <div class="reservas-confirmation__animation" data-reservas-success-animation aria-hidden="true"></div>
          <h2 class="reservas-confirmation__title" id="reservas-confirmation-title">Reserva exitosa</h2>
          <p class="reservas-confirmation__copy">
            Recibimos tu solicitud correctamente. Te estaremos confirmando por Whatsapp cuando el equipo la revise.
          </p>
        </div>

        <div class="reservas-confirmation__details">
          <div class="reservas-confirmation__summary">
            <div class="reservas-review__list">
              ${rows.map((row) => `
                <div class="reservas-review__row">
                  <span class="reservas-review__label">${escapeHtml(row.label)}</span>
                  <span class="reservas-review__value">${escapeHtml(row.value)}</span>
                </div>
              `).join('')}
              <div class="reservas-review__row reservas-review__row--status">
                <span class="reservas-review__label">Estado</span>
                <span class="reservas-status-badge reservas-status-badge--${escapeHtml(statusMeta.tone)}">${escapeHtml(statusMeta.label)}</span>
              </div>
            </div>
          </div>
        </div>

        <button class="reservas-confirmation__action" type="button" data-reservas-reset>
          Hacer otra reserva
        </button>
      </section>
    `;
  };

  const renderActiveStep = (step) => {
    switch (step) {
      case 'who':
        return renderWhoStep();
      case 'date':
        return renderDateStep();
      case 'time':
        return renderTimeStep();
      case 'zone':
        return renderZoneStep();
      case 'details':
        return renderDetailsStep();
      default:
        return '';
    }
  };

  const renderCards = () => {
    destroySuccessAnimation();
    cardsHost.innerHTML = state.submitted ? renderConfirmation() : renderActiveStep(state.step);
    if (state.submitted) {
      mountSuccessAnimation();
    }
  };

  const renderProgress = () => {
    if (!(progressHost instanceof HTMLElement)) {
      return;
    }

    const currentIndex = getCurrentStepIndex();
    progressHost.innerHTML = STEP_ORDER.map((step, index) => {
      const classNames = ['reservas-stage__progress-dot'];
      if (index < currentIndex || state.submitted) {
        classNames.push('is-complete');
      }
      if (index === currentIndex && !state.submitted) {
        classNames.push('is-active');
      }
      return `<span class="${classNames.join(' ')}"></span>`;
    }).join('');
  };

  const renderFooter = () => {
    if (!(nextButton instanceof HTMLButtonElement) || !(backButton instanceof HTMLButtonElement)) {
      return;
    }

    if (state.submitted) {
      nextButton.hidden = true;
      backButton.hidden = true;
      return;
    }

    const currentIndex = getCurrentStepIndex();
    const isLast = currentIndex === STEP_ORDER.length - 1;
    const hasTimeAvailability = state.step === 'time' ? getAvailableHourValues().length > 0 : false;

    nextButton.hidden = false;
    backButton.hidden = false;
    backButton.disabled = currentIndex === 0;
    nextButton.disabled = state.step === 'time'
      ? (state.timeMode === 'hour' ? !hasTimeAvailability : !Boolean(state.time))
      : !isStepComplete(state.step);
    nextButton.textContent = isLast ? 'Reservar' : 'Siguiente';
  };

  const renderStepView = () => {
    renderCards();
    renderProgress();
    renderFooter();
  };

  const syncWhoUi = () => {
    const valueNode = cardsHost.querySelector('[data-reservas-guests-value]');
    const decrementButton = cardsHost.querySelector('[data-guest-action="decrement"]');

    if (valueNode) {
      valueNode.textContent = String(getPartySize());
    }

    if (decrementButton instanceof HTMLButtonElement) {
      decrementButton.disabled = getPartySize() <= 0;
    }

    renderFooter();
  };

  const syncOptionSelection = (selector, selectedValue) => {
    cardsHost.querySelectorAll(selector).forEach((node) => {
      if (!(node instanceof HTMLElement)) {
        return;
      }

      const value = node.getAttribute(selector === '[data-select-date]' ? 'data-select-date' : 'data-select-zone');

      if (value === selectedValue) {
        node.setAttribute('aria-pressed', 'true');
        node.classList.add('is-selected');
      } else {
        node.setAttribute('aria-pressed', 'false');
        node.classList.remove('is-selected');
      }
    });
  };

  const syncDateUi = () => {
    syncTimeAvailabilityState();
    syncOptionSelection('[data-select-date]', state.date);
    renderFooter();
  };

  const loadMoreDates = () => {
    if (state.visibleCalendarMonths >= MAX_CALENDAR_MONTHS) {
      return;
    }

    const scroller = cardsHost.querySelector('[data-reservas-calendar-scroller]');
    const distanceFromBottom =
      scroller instanceof HTMLElement ? scroller.scrollHeight - scroller.scrollTop : 0;

    state.visibleCalendarMonths = Math.min(MAX_CALENDAR_MONTHS, state.visibleCalendarMonths + 2);
    refreshCalendarData();

    const panel = cardsHost.querySelector('[data-reservas-date-panel]');
    if (!(panel instanceof HTMLElement)) {
      renderStepView();
      return;
    }

    panel.outerHTML = renderDatePanel();
    syncDateUi();

    requestAnimationFrame(() => {
      const refreshedScroller = cardsHost.querySelector('[data-reservas-calendar-scroller]');
      if (refreshedScroller instanceof HTMLElement) {
        refreshedScroller.scrollTop = Math.max(0, refreshedScroller.scrollHeight - distanceFromBottom);
      }
    });
  };

  const syncTimeUi = () => {
    syncTimeDraftFromSelection();
    syncTimeAvailabilityState();

    const picker = cardsHost.querySelector('[data-reservas-time-picker]');
    if (!(picker instanceof HTMLElement)) {
      renderFooter();
      return;
    }

    const draft = getTimeDraftState();
    const summaryHour = picker.querySelector('[data-time-display-hour]');
    const summaryMinute = picker.querySelector('[data-time-display-minute]');

    if (summaryHour) {
      summaryHour.textContent = padTimeValue(draft.hour12);
    }

    if (summaryMinute) {
      summaryMinute.textContent = padTimeValue(draft.minute);
    }

    picker.querySelectorAll('[data-time-view-mode]').forEach((node) => {
      if (!(node instanceof HTMLButtonElement)) {
        return;
      }
      const mode = node.getAttribute('data-time-view-mode') || 'hour';
      const isActive = mode === state.timeMode;
      node.setAttribute('aria-pressed', String(isActive));
      node.classList.toggle('is-active', isActive);
    });

    picker.querySelectorAll('[data-time-period]').forEach((node) => {
      if (!(node instanceof HTMLButtonElement)) {
        return;
      }
      const period = node.getAttribute('data-time-period') || 'PM';
      const isActive = period === draft.period;
      node.setAttribute('aria-pressed', String(isActive));
      node.classList.toggle('is-active', isActive);
    });

    const dial = picker.querySelector('[data-time-dial]');
    const optionsHost = picker.querySelector('[data-time-dial-options]');
    const activeDialValue = getActiveTimeDialValue();

    if (dial instanceof HTMLElement) {
      dial.setAttribute('data-mode', state.timeMode);
      dial.style.setProperty('--reservas-time-dial-angle', `${getTimeDialAngle(state.timeMode, activeDialValue)}deg`);
    }

    if (optionsHost instanceof HTMLElement) {
      const currentMode = optionsHost.getAttribute('data-mode');
      if (currentMode !== state.timeMode) {
        optionsHost.innerHTML = renderTimeDialOptions(state.timeMode);
        optionsHost.setAttribute('data-mode', state.timeMode);
      } else {
        optionsHost.querySelectorAll('[data-time-dial-option]').forEach((node) => {
          if (!(node instanceof HTMLButtonElement)) {
            return;
          }
          const value = Number(node.getAttribute('data-time-value'));
          const isAvailable = state.timeMode === 'minute'
            ? getAvailableMinuteValues(state.timeDraftHour).includes(value)
            : getAvailableHourValues().includes(value);
          const isSelected = value === activeDialValue;
          node.setAttribute('aria-pressed', String(isSelected));
          node.classList.toggle('is-selected', isSelected);
          node.disabled = !isAvailable;
        });
      }
    }

    renderFooter();
  };

  const syncZoneUi = () => {
    syncOptionSelection('[data-select-zone]', state.zone);
    renderFooter();
  };

  const syncWhatsappUi = () => {
    const segments = getWhatsappSegments();

    cardsHost.querySelectorAll('[data-whatsapp-segment]').forEach((node) => {
      if (!(node instanceof HTMLInputElement)) {
        return;
      }

      const key = node.getAttribute('data-whatsapp-segment') || '';
      const value = segments[key] || '';
      node.value = value;
      node.classList.toggle('is-filled', Boolean(value));
    });

    renderFooter();
  };

  const focusWhatsappSegment = (key) => {
    const input = cardsHost.querySelector(`[data-whatsapp-segment="${key}"]`);
    if (input instanceof HTMLInputElement) {
      input.focus();
      input.select();
    }
  };

  const applyWhatsappSegments = (startKey, rawValue) => {
    const incomingDigits = sanitizeDigits(rawValue);
    const segments = getWhatsappSegments();
    const startIndex = WHATSAPP_SEGMENTS.findIndex((segment) => segment.key === startKey);

    if (startIndex === -1) {
      return startKey;
    }

    if (!incomingDigits) {
      segments[startKey] = '';
      setWhatsappSegments(segments);
      syncWhatsappUi();
      return startKey;
    }

    const activeSegment = WHATSAPP_SEGMENTS[startIndex];

    if (incomingDigits.length <= activeSegment.length) {
      segments[startKey] = incomingDigits.slice(0, activeSegment.length);
      setWhatsappSegments(segments);
      syncWhatsappUi();

      if (segments[startKey].length >= activeSegment.length && startIndex < WHATSAPP_SEGMENTS.length - 1) {
        return WHATSAPP_SEGMENTS[startIndex + 1].key;
      }

      return startKey;
    }

    let remainingDigits = incomingDigits;
    for (let index = startIndex; index < WHATSAPP_SEGMENTS.length; index += 1) {
      const segment = WHATSAPP_SEGMENTS[index];
      segments[segment.key] = remainingDigits.slice(0, segment.length);
      remainingDigits = remainingDigits.slice(segment.length);
    }

    setWhatsappSegments(segments);
    syncWhatsappUi();

    const nextValues = getWhatsappSegments();
    const nextSegment = WHATSAPP_SEGMENTS.find((segment, index) => {
      if (index < startIndex) {
        return false;
      }
      const value = nextValues[segment.key];
      return value.length < segment.length;
    });

    return nextSegment ? nextSegment.key : WHATSAPP_SEGMENTS[WHATSAPP_SEGMENTS.length - 1].key;
  };

  const getTimeDialValueFromPointer = (event, dialNode, mode) => {
    if (!(dialNode instanceof HTMLElement)) {
      return null;
    }

    const rect = dialNode.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;
    const angle = (Math.atan2(dy, dx) * 180 / Math.PI + 90 + 360) % 360;
    const dialValues = getTimeDialValues(mode);
    const step = 360 / dialValues.length;
    const index = Math.round(angle / step) % dialValues.length;
    const rawValue = dialValues[index];

    return findNearestAvailableDialValue(mode, rawValue);
  };

  const scrollStageIntoView = () => {
    const isMobile = window.innerWidth <= 767;
    const targetNode = isMobile && introPanelNode instanceof HTMLElement ? introPanelNode : stageNode;

    if (!(targetNode instanceof HTMLElement)) {
      return;
    }

    const offset = isMobile ? 14 : 96;
    const top = window.scrollY + targetNode.getBoundingClientRect().top - offset;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: REDUCED_MOTION_QUERY.matches ? 'auto' : 'smooth',
    });
  };

  const clearEntryPendingState = () => {
    document.documentElement.classList.remove('public-entry-pending');
    if (document.body) {
      document.body.style.removeProperty('overflow');
    }
  };

  const moveToStep = (step) => {
    if (!STEP_ORDER.includes(step)) {
      return;
    }

    state.step = step;
    state.submitted = false;
    if (step === 'time') {
      state.timeMode = 'hour';
      syncTimeDraftFromSelection();
      syncTimeAvailabilityState();
    }
    renderStepView();
    requestAnimationFrame(scrollStageIntoView);
  };

  const resetReservationFlow = () => {
    state.step = 'who';
    state.submitted = false;
    state.reservationStatus = 'pending';
    state.visibleCalendarMonths = 2;
    state.guests = 0;
    state.date = '';
    state.time = '';
    state.timeMode = 'hour';
    state.timeDraftHour = DEFAULT_TIME_DRAFT.hour12;
    state.timeDraftMinute = DEFAULT_TIME_DRAFT.minute;
    state.timePeriod = DEFAULT_TIME_DRAFT.period;
    state.timeDialPointerId = null;
    state.timeDialPointerActive = false;
    state.timeDialPointerMode = 'hour';
    state.zone = '';
    state.details = {
      name: '',
      whatsapp: createEmptyWhatsappSegments(),
      notes: '',
    };
    refreshCalendarData();
    renderStepView();
    requestAnimationFrame(scrollStageIntoView);
  };

  const goNext = () => {
    if (!isStepComplete(state.step)) {
      if (state.step === 'time' && getAvailableHourValues().length && !state.time) {
        state.timeMode = 'minute';
        syncTimeUi();
      } else {
        renderFooter();
      }
      return;
    }

    const currentIndex = getCurrentStepIndex();
    if (currentIndex === STEP_ORDER.length - 1) {
      state.reservationStatus = 'pending';
      state.submitted = true;
      renderStepView();
      requestAnimationFrame(scrollStageIntoView);
      return;
    }

    moveToStep(STEP_ORDER[currentIndex + 1]);
  };

  const goBack = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex <= 0) {
      return;
    }

    moveToStep(STEP_ORDER[currentIndex - 1]);
  };

  clearEntryPendingState();
  window.addEventListener('load', clearEntryPendingState, { once: true });

  if (window.FigataPublicNavbar?.whenReady) {
    window.FigataPublicNavbar.whenReady().finally(clearEntryPendingState);
  }

  root.addEventListener('click', (event) => {
    const nextTrigger = event.target.closest('[data-reservas-next]');
    if (nextTrigger instanceof HTMLButtonElement) {
      event.preventDefault();
      goNext();
      return;
    }

    const backTrigger = event.target.closest('[data-reservas-back]');
    if (backTrigger instanceof HTMLButtonElement) {
      event.preventDefault();
      goBack();
      return;
    }

    const resetTrigger = event.target.closest('[data-reservas-reset]');
    if (resetTrigger instanceof HTMLButtonElement) {
      event.preventDefault();
      resetReservationFlow();
      return;
    }

    const guestButton = event.target.closest('[data-guest-action]');
    if (guestButton instanceof HTMLButtonElement) {
      event.preventDefault();
      const delta = guestButton.getAttribute('data-guest-action') === 'increment' ? 1 : -1;
      state.guests = Math.max(0, getPartySize() + delta);
      syncWhoUi();
      return;
    }

    const dateButton = event.target.closest('[data-select-date]');
    if (dateButton instanceof HTMLButtonElement && !dateButton.disabled) {
      event.preventDefault();
      const nextDate = dateButton.getAttribute('data-select-date') || '';
      state.date = state.date === nextDate ? '' : nextDate;
      syncDateUi();
      dateButton.blur();
      return;
    }

    const loadMoreButton = event.target.closest('[data-load-more-dates]');
    if (loadMoreButton instanceof HTMLButtonElement) {
      event.preventDefault();
      loadMoreDates();
      return;
    }

    const timeModeButton = event.target.closest('[data-time-view-mode]');
    if (timeModeButton instanceof HTMLButtonElement) {
      event.preventDefault();
      state.timeMode = timeModeButton.getAttribute('data-time-view-mode') === 'minute' ? 'minute' : 'hour';
      syncTimeUi();
      return;
    }

    const timePeriodButton = event.target.closest('[data-time-period]');
    if (timePeriodButton instanceof HTMLButtonElement && !timePeriodButton.disabled) {
      event.preventDefault();
      state.timePeriod = timePeriodButton.getAttribute('data-time-period') || 'PM';
      commitTimeDraft();
      syncTimeUi();
      return;
    }

    const zoneButton = event.target.closest('[data-select-zone]');
    if (zoneButton instanceof HTMLButtonElement) {
      event.preventDefault();
      state.zone = zoneButton.getAttribute('data-select-zone') || '';
      syncZoneUi();
      return;
    }
  });

  root.addEventListener('pointerdown', (event) => {
    if (state.step !== 'time') {
      return;
    }

    const dialOption = event.target.closest('[data-time-dial-option]');
    const dialNode = event.target.closest('[data-time-dial]');

    if (!(dialOption instanceof HTMLButtonElement) && !(dialNode instanceof HTMLElement)) {
      return;
    }

    if (dialOption instanceof HTMLButtonElement && dialOption.disabled) {
      return;
    }

    event.preventDefault();

    const mode = dialOption instanceof HTMLButtonElement
      ? (dialOption.getAttribute('data-time-mode') === 'minute' ? 'minute' : 'hour')
      : state.timeMode;

    state.timeDialPointerActive = true;
    state.timeDialPointerId = event.pointerId;
    state.timeDialPointerMode = mode;

    if (dialOption instanceof HTMLButtonElement) {
      setTimeDialValue(mode, Number(dialOption.getAttribute('data-time-value')));
      return;
    }

    const nextValue = getTimeDialValueFromPointer(event, dialNode, mode);
    if (nextValue !== null) {
      setTimeDialValue(mode, nextValue);
    }
  });

  window.addEventListener('pointermove', (event) => {
    if (!state.timeDialPointerActive || state.timeDialPointerId !== event.pointerId || state.step !== 'time') {
      return;
    }

    const dialNode = cardsHost.querySelector('[data-time-dial]');
    const nextValue = getTimeDialValueFromPointer(event, dialNode, state.timeDialPointerMode);

    if (nextValue !== null) {
      setTimeDialValue(state.timeDialPointerMode, nextValue);
    }
  });

  const endTimeDialPointer = (event) => {
    if (!state.timeDialPointerActive || state.timeDialPointerId !== event.pointerId) {
      return;
    }

    state.timeDialPointerActive = false;
    state.timeDialPointerId = null;
  };

  window.addEventListener('pointerup', endTimeDialPointer);
  window.addEventListener('pointercancel', endTimeDialPointer);

  root.addEventListener('keydown', (event) => {
    if (state.step !== 'time') {
      return;
    }

    const dialOption = event.target.closest('[data-time-dial-option]');
    if (!(dialOption instanceof HTMLButtonElement)) {
      return;
    }

    const mode = dialOption.getAttribute('data-time-mode') === 'minute' ? 'minute' : 'hour';
    const dialValues = getTimeDialValues(mode);
    const currentValue = mode === 'minute' ? state.timeDraftMinute : state.timeDraftHour;
    const currentIndex = dialValues.indexOf(currentValue);

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!dialOption.disabled) {
        setTimeDialValue(mode, Number(dialOption.getAttribute('data-time-value')));
      }
      return;
    }

    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key) || currentIndex === -1) {
      return;
    }

    event.preventDefault();
    const delta = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;
    const nextIndex = (currentIndex + delta + dialValues.length) % dialValues.length;
    const rawNextValue = dialValues[nextIndex];
    const nextValue = findNearestAvailableDialValue(mode, rawNextValue);
    if (nextValue !== null) {
      setTimeDialValue(mode, nextValue);
    }
  });

  root.addEventListener('input', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
      return;
    }

    if (target instanceof HTMLInputElement && target.hasAttribute('data-whatsapp-segment')) {
      const segmentKey = target.getAttribute('data-whatsapp-segment') || '';
      if (!segmentKey) {
        return;
      }

      const rawDigits = sanitizeDigits(target.value);
      const nextFocusKey = applyWhatsappSegments(segmentKey, rawDigits);
      if (sanitizeDigits(target.value)) {
        const activeSegment = WHATSAPP_SEGMENTS.find((segment) => segment.key === segmentKey);
        const activeValue = getWhatsappSegments()[segmentKey] || '';
        if (activeSegment && activeValue.length >= activeSegment.length && nextFocusKey !== segmentKey) {
          focusWhatsappSegment(nextFocusKey);
        }
      }
      return;
    }

    const field = target.getAttribute('data-detail-field') || '';
    if (!(field in state.details)) {
      return;
    }

    state.details[field] = target.value;
    renderFooter();
  });

  root.addEventListener('keydown', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.hasAttribute('data-whatsapp-segment')) {
      return;
    }

    const segmentKey = target.getAttribute('data-whatsapp-segment') || '';
    const segmentIndex = WHATSAPP_SEGMENTS.findIndex((segment) => segment.key === segmentKey);
    if (segmentIndex === -1) {
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusWhatsappSegment(WHATSAPP_SEGMENTS[Math.max(0, segmentIndex - 1)].key);
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusWhatsappSegment(WHATSAPP_SEGMENTS[Math.min(WHATSAPP_SEGMENTS.length - 1, segmentIndex + 1)].key);
      return;
    }

    if (event.key === 'Backspace' && !target.value && segmentIndex > 0) {
      event.preventDefault();
      const segments = getWhatsappSegments();
      const previousKey = WHATSAPP_SEGMENTS[segmentIndex - 1].key;
      segments[previousKey] = '';
      setWhatsappSegments(segments);
      syncWhatsappUi();
      focusWhatsappSegment(previousKey);
      return;
    }

    if (event.key.length === 1 && /\D/.test(event.key)) {
      event.preventDefault();
    }
  });

  root.addEventListener('paste', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.hasAttribute('data-whatsapp-segment')) {
      return;
    }

    const segmentKey = target.getAttribute('data-whatsapp-segment') || '';
    if (!segmentKey) {
      return;
    }

    const pasted = event.clipboardData?.getData('text') || '';
    if (!sanitizeDigits(pasted)) {
      return;
    }

    event.preventDefault();
    const nextFocusKey = applyWhatsappSegments(segmentKey, pasted);
    focusWhatsappSegment(nextFocusKey);
  });

  renderStepView();
  document.dispatchEvent(new CustomEvent(READY_EVENT));
})();
