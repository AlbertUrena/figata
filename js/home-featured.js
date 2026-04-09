(() => {
  const grid = document.getElementById('mas-pedidas-grid');
  const template = document.getElementById('mas-pedidas-card-template');
  const featuredApi = window.FigataData?.homeFeatured;
  const publicPaths = window.FigataPublicPaths || null;
  const DESKTOP_MEDIA = window.matchMedia('(min-width: 1024px)');
  const HOVER_MEDIA = window.matchMedia('(hover: hover) and (pointer: fine)');
  const MOBILE_ROW_QUERY = '(max-width: 1023px)';
  const MOBILE_ROW_TRACK_CLASS = 'mas-pedidas__row-track';
  const MOBILE_ROW_CLONE_ATTR = 'data-mas-pedidas-row-autoscroll-clone';
  const MOBILE_ROW_CARD_SELECTOR = '.mas-pedidas-card';
  const ROW_AUTOSCROLL_SPEED_PX_PER_SECOND = 42;
  const ROW_AUTOSCROLL_MAX_TRACK_COPIES = 8;
  const ROW_AUTOSCROLL_RESIZE_EPSILON_PX = 1;
  const PREVIEW_SCRIPT_ATTR = 'data-home-featured-preview-script';
  const createMediaQueryList = (query) =>
    typeof window.matchMedia === 'function'
      ? window.matchMedia(query)
      : {
          matches: false,
          addEventListener() {},
          removeEventListener() {},
          addListener() {},
          removeListener() {},
        };
  const mobileRowMedia = createMediaQueryList(MOBILE_ROW_QUERY);
  const reduceMotionMedia = createMediaQueryList('(prefers-reduced-motion: reduce)');
  let rowAutoScrollStates = [];
  let rowAutoScrollCleanup = [];
  let rowAutoScrollFrameId = 0;

  if (!grid || !(template instanceof HTMLTemplateElement) || !featuredApi?.getFeaturedItems) {
    return;
  }

  const formatPrice = (item) => {
    const numericPrice = Number(item?.price);
    if (Number.isFinite(numericPrice)) {
      return `$${Math.max(0, Math.round(numericPrice)).toLocaleString('es-DO')}`;
    }

    return String(item?.priceFormatted || '').trim();
  };

  const toSitePath = (value) => {
    const normalized = String(value || '').trim();

    if (!normalized) {
      return '';
    }

    if (/^(?:https?:|data:|blob:)/i.test(normalized)) {
      return normalized;
    }

    if (publicPaths?.toSitePath) {
      return publicPaths.toSitePath(normalized);
    }

    if (normalized.startsWith('/')) {
      return normalized;
    }

    return normalized;
  };

  const bindMediaChange = (mediaQueryList, callback) => {
    if (!mediaQueryList || typeof callback !== 'function') {
      return;
    }

    if (typeof mediaQueryList.addEventListener === 'function') {
      mediaQueryList.addEventListener('change', callback);
      return;
    }

    if (typeof mediaQueryList.addListener === 'function') {
      mediaQueryList.addListener(callback);
    }
  };

  const getRowGapPx = (row) => {
    if (!(row instanceof HTMLElement)) {
      return 0;
    }

    const styles = window.getComputedStyle(row);
    const gap = parseFloat(styles.columnGap || styles.gap || '0');
    return Number.isFinite(gap) ? gap : 0;
  };

  const getCardWidthPx = (card) => {
    if (!(card instanceof HTMLElement)) {
      return 0;
    }

    const width = card.getBoundingClientRect().width || card.offsetWidth || 0;
    return width > 0 ? width : 0;
  };

  const getElementWidthPx = (element) => {
    if (!(element instanceof HTMLElement)) {
      return 0;
    }

    const width = element.getBoundingClientRect().width || element.clientWidth || 0;
    return width > 0 ? width : 0;
  };

  const getRowCycleWidthPx = (cards, gapPx) => {
    if (!Array.isArray(cards) || cards.length < 2) {
      return 0;
    }

    const totalWidth = cards.reduce((sum, card) => sum + getCardWidthPx(card), 0);
    if (!(totalWidth > 0)) {
      return 0;
    }

    const safeGap = Number.isFinite(gapPx) ? gapPx : 0;
    return totalWidth + safeGap * cards.length;
  };

  const normalizeRowCyclePhase = (value) => {
    if (!Number.isFinite(value)) {
      return 0;
    }

    let safeValue = value % 1;
    if (safeValue < 0) {
      safeValue += 1;
    }

    return safeValue;
  };

  const getRowCyclePhase = (state) => {
    const durationMs = Number.isFinite(state?.durationMs) ? state.durationMs : 0;
    if (!(durationMs > 0)) {
      return 0;
    }

    const currentTimeMs =
      state?.animation && typeof state.animation.currentTime === 'number'
        ? state.animation.currentTime
        : 0;
    return normalizeRowCyclePhase(currentTimeMs / durationMs);
  };

  const createRowAutoScrollClone = (card) => {
    if (!(card instanceof HTMLElement)) {
      return null;
    }

    const clone = card.cloneNode(true);
    if (!(clone instanceof HTMLElement)) {
      return null;
    }

    clone.setAttribute(MOBILE_ROW_CLONE_ATTR, 'true');
    clone.setAttribute('aria-hidden', 'true');
    if ('inert' in clone) {
      clone.inert = true;
    }

    clone.querySelectorAll('a, button, input, select, textarea, [tabindex]').forEach((element) => {
      if (!(element instanceof HTMLElement)) {
        return;
      }
      element.setAttribute('tabindex', '-1');
      if ('disabled' in element) {
        element.disabled = true;
      }
    });

    return clone;
  };

  const cancelRowAutoScrollAnimation = (state) => {
    const animation = state?.animation;
    if (!animation || typeof animation.cancel !== 'function') {
      state.animation = null;
      return;
    }

    try {
      animation.cancel();
    } catch (_) {
      // no-op
    }
    state.animation = null;
  };

  const clearRowAutoScrollTrackStyles = (track) => {
    if (!(track instanceof HTMLElement)) {
      return;
    }

    track.style.transform = '';
    track.style.willChange = '';
    track.style.animationDelay = '';
    track.style.animationDirection = '';
    track.style.animationDuration = '';
    track.style.animationFillMode = '';
    track.style.animationIterationCount = '';
    track.style.animationName = '';
    track.style.animationTimingFunction = '';
    track.style.removeProperty('--home-rail-cycle-width');
    track.style.removeProperty('--home-rail-duration');
  };

  const applyRowAutoScrollAnimation = (state, phase = 0) => {
    const track = state?.track;
    const cycleWidthPx = state?.cycleWidthPx;
    if (!(track instanceof HTMLElement) || !(cycleWidthPx > 0)) {
      return;
    }

    cancelRowAutoScrollAnimation(state);

    const durationMs = (cycleWidthPx / ROW_AUTOSCROLL_SPEED_PX_PER_SECOND) * 1000;
    if (!(durationMs > 0)) {
      clearRowAutoScrollTrackStyles(track);
      state.durationMs = 0;
      return;
    }

    const safePhase = normalizeRowCyclePhase(phase);
    state.durationMs = durationMs;
    track.style.willChange = 'transform';

    if (typeof track.animate === 'function') {
      const animation = track.animate(
        [
          { transform: 'translate3d(0, 0, 0)' },
          { transform: `translate3d(${-cycleWidthPx.toFixed(3)}px, 0, 0)` },
        ],
        {
          duration: durationMs,
          easing: 'linear',
          iterations: Infinity,
          fill: 'both',
          direction: state.direction < 0 ? 'normal' : 'reverse',
        }
      );

      if (typeof animation.pause === 'function') {
        animation.pause();
      }
      animation.currentTime = safePhase * durationMs;
      if (typeof animation.play === 'function') {
        animation.play();
      }
      state.animation = animation;
      return;
    }

    track.style.animationName = 'home-rail-marquee';
    track.style.animationDuration = `${(durationMs / 1000).toFixed(3)}s`;
    track.style.animationTimingFunction = 'linear';
    track.style.animationIterationCount = 'infinite';
    track.style.animationFillMode = 'both';
    track.style.animationDirection = state.direction < 0 ? 'normal' : 'reverse';
    track.style.animationDelay = `${(-safePhase * durationMs / 1000).toFixed(3)}s`;
    track.style.setProperty('--home-rail-cycle-width', `${cycleWidthPx.toFixed(3)}px`);
  };

  const syncRowAutoScrollState = (state, { preserveOffset = false } = {}) => {
    const row = state?.row;
    if (!(row instanceof HTMLElement)) {
      return false;
    }

    const shouldPreserveOffset =
      preserveOffset === true &&
      Number.isFinite(state?.cycleWidthPx) &&
      state.cycleWidthPx > 0;
    const previousPhase = shouldPreserveOffset ? getRowCyclePhase(state) : 0;

    const existingTrack = row.firstElementChild;
    if (
      existingTrack instanceof HTMLElement &&
      existingTrack.classList.contains(MOBILE_ROW_TRACK_CLASS)
    ) {
      cancelRowAutoScrollAnimation(state);
      const sourceCards = Array.from(existingTrack.children).filter(
        (node) =>
          node instanceof HTMLElement &&
          node.matches(MOBILE_ROW_CARD_SELECTOR) &&
          !node.hasAttribute(MOBILE_ROW_CLONE_ATTR)
      );
      row.replaceChildren(...sourceCards);
    }

    const sourceCards = Array.from(row.children).filter(
      (node) => node instanceof HTMLElement && node.matches(MOBILE_ROW_CARD_SELECTOR)
    );
    if (sourceCards.length < 2) {
      state.track = null;
      state.cycleWidthPx = 0;
      state.durationMs = 0;
      state.animation = null;
      state.rowWidthPx = getElementWidthPx(row);
      return false;
    }

    const track = document.createElement('div');
    track.className = MOBILE_ROW_TRACK_CLASS;
    sourceCards.forEach((card) => track.appendChild(card));
    row.replaceChildren(track);

    state.gapPx = getRowGapPx(row);
    const cycleWidthPx = getRowCycleWidthPx(sourceCards, state.gapPx);
    if (!(cycleWidthPx > 0)) {
      row.replaceChildren(...sourceCards);
      state.track = null;
      state.cycleWidthPx = 0;
      state.durationMs = 0;
      state.animation = null;
      state.rowWidthPx = getElementWidthPx(row);
      return false;
    }

    const minTrackWidthPx = (row.getBoundingClientRect().width || row.clientWidth || 0) + cycleWidthPx;
    let copies = 1;

    while (track.scrollWidth < minTrackWidthPx - 0.5 && copies < ROW_AUTOSCROLL_MAX_TRACK_COPIES) {
      sourceCards.forEach((card) => {
        const clone = createRowAutoScrollClone(card);
        if (clone) {
          track.appendChild(clone);
        }
      });
      copies += 1;
    }

    state.track = track;
    state.cycleWidthPx = cycleWidthPx;
    state.rowWidthPx = getElementWidthPx(row);
    applyRowAutoScrollAnimation(state, shouldPreserveOffset ? previousPhase : 0);
    return true;
  };

  const hasRowWidthChanged = (state) => {
    const nextWidthPx = getElementWidthPx(state?.row);
    if (!(nextWidthPx > 0)) {
      return false;
    }

    const previousWidthPx = Number.isFinite(state?.rowWidthPx) ? state.rowWidthPx : 0;
    return (
      !(previousWidthPx > 0) ||
      Math.abs(nextWidthPx - previousWidthPx) > ROW_AUTOSCROLL_RESIZE_EPSILON_PX
    );
  };

  const syncChangedRowAutoScrollStates = () => {
    rowAutoScrollStates.forEach((state) => {
      if (!hasRowWidthChanged(state)) {
        return;
      }

      syncRowAutoScrollState(state, { preserveOffset: true });
    });
  };

  const stopRowAutoScroll = () => {
    rowAutoScrollStates.forEach((state) => {
      const row = state?.row;
      cancelRowAutoScrollAnimation(state);
      clearRowAutoScrollTrackStyles(state?.track);
      if (!(row instanceof HTMLElement)) {
        return;
      }

      const mountedTrack = row.firstElementChild;
      if (
        mountedTrack instanceof HTMLElement &&
        mountedTrack.classList.contains(MOBILE_ROW_TRACK_CLASS)
      ) {
        const sourceCards = Array.from(mountedTrack.children).filter(
          (node) =>
            node instanceof HTMLElement &&
            node.matches(MOBILE_ROW_CARD_SELECTOR) &&
            !node.hasAttribute(MOBILE_ROW_CLONE_ATTR)
        );
        row.replaceChildren(...sourceCards);
      }
    });

    rowAutoScrollCleanup.forEach((dispose) => {
      try {
        dispose();
      } catch (_) {
        // no-op
      }
    });
    rowAutoScrollCleanup = [];
    rowAutoScrollStates = [];
  };

  const startRowAutoScroll = (rows) => {
    stopRowAutoScroll();

    if (!mobileRowMedia.matches || reduceMotionMedia.matches || !Array.isArray(rows)) {
      return;
    }

    const states = [];

    rows.forEach((row, index) => {
      if (!(row instanceof HTMLElement) || row.hidden) {
        return;
      }

      const cards = Array.from(row.children).filter(
        (node) => node instanceof HTMLElement && node.matches(MOBILE_ROW_CARD_SELECTOR)
      );
      if (cards.length < 2) {
        return;
      }

      const state = {
        row,
        track: null,
        direction: index === 0 ? -1 : 1,
        gapPx: getRowGapPx(row),
        cycleWidthPx: 0,
        rowWidthPx: 0,
        durationMs: 0,
        animation: null,
      };

      if (syncRowAutoScrollState(state)) {
        states.push(state);
      }
    });

    if (!states.length) {
      return;
    }

    rowAutoScrollStates = states;

    const onObservedSizeChange = () => {
      syncChangedRowAutoScrollStates();
    };

    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(onObservedSizeChange);
      rowAutoScrollStates.forEach((state) => {
        if (state?.row instanceof HTMLElement) {
          resizeObserver.observe(state.row);
        }
      });
      rowAutoScrollCleanup.push(() => resizeObserver.disconnect());
    } else {
      window.addEventListener('resize', onObservedSizeChange, { passive: true });
      rowAutoScrollCleanup.push(() =>
        window.removeEventListener('resize', onObservedSizeChange)
      );
    }
  };

  const syncRowAutoScroll = () => {
    const rows = Array.from(grid.querySelectorAll('.mas-pedidas__row')).filter(
      (row) => row instanceof HTMLElement
    );

    if (!rows.length || !mobileRowMedia.matches || reduceMotionMedia.matches) {
      stopRowAutoScroll();
      return;
    }

    startRowAutoScroll(rows);
  };

  const requestRowAutoScrollSync = () => {
    if (rowAutoScrollFrameId) {
      return;
    }

    rowAutoScrollFrameId = window.requestAnimationFrame(() => {
      rowAutoScrollFrameId = 0;
      syncRowAutoScroll();
    });
  };

  const loadDesktopPreviewEnhancer = () => {
    if (!DESKTOP_MEDIA.matches) {
      return Promise.resolve();
    }

    if (window.FigataHomeFeatured?.previewEnhancerReady) {
      return Promise.resolve();
    }

    const existingScript = document.querySelector(`script[${PREVIEW_SCRIPT_ATTR}]`);
    if (existingScript) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = toSitePath('js/mas-pedidas.js');
      script.async = false;
      script.setAttribute(PREVIEW_SCRIPT_ATTR, 'true');
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('No se pudo cargar el preview desktop de home.'));
      document.body.appendChild(script);
    }).catch((error) => {
      console.error('[home-featured] No se pudo cargar el enhancer desktop.', error);
    });
  };

  const setBaseImage = (imageElement, item) => {
    if (!(imageElement instanceof HTMLImageElement) || !item.cardImage) {
      if (imageElement instanceof HTMLImageElement) {
        imageElement.hidden = true;
      }
      return;
    }

    imageElement.src = toSitePath(item.cardImage);
    imageElement.alt = item.imageAlt || item.title;
    imageElement.loading = 'lazy';
    imageElement.decoding = 'async';

    if (item.cardImageSrcSet) {
      imageElement.srcset = item.cardImageSrcSet
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry) => {
          const parts = entry.split(/\s+/);
          const path = parts.shift();
          return [toSitePath(path), parts.join(' ')].filter(Boolean).join(' ');
        })
        .join(', ');
    }

    if (item.cardImageSizes) {
      imageElement.sizes = item.cardImageSizes;
    }
  };

  const primeHoverImage = (article, hoverImageElement, item) => {
    if (
      !(article instanceof HTMLElement) ||
      !(hoverImageElement instanceof HTMLImageElement) ||
      !DESKTOP_MEDIA.matches ||
      !HOVER_MEDIA.matches ||
      !item.hoverImage
    ) {
      if (hoverImageElement instanceof HTMLImageElement) {
        hoverImageElement.remove();
      }
      return;
    }

    let primed = false;
    hoverImageElement.hidden = true;
    hoverImageElement.alt = '';
    hoverImageElement.loading = 'lazy';
    hoverImageElement.decoding = 'async';

    const revealHoverImage = () => {
      if (primed) {
        return;
      }

      primed = true;
      hoverImageElement.src = toSitePath(item.hoverImage);
      hoverImageElement.addEventListener(
        'load',
        () => {
          hoverImageElement.hidden = false;
          article.classList.add('has-hover-image');
        },
        { once: true }
      );
      hoverImageElement.addEventListener(
        'error',
        () => {
          hoverImageElement.hidden = true;
          article.classList.remove('has-hover-image');
        },
        { once: true }
      );
    };

    article.addEventListener('pointerenter', revealHoverImage, { once: true, passive: true });
    article.addEventListener('focusin', revealHoverImage, { once: true });
  };

  const buildFeaturedCard = (item, index, splitIndex, cardById) => {
    const node = template.content.cloneNode(true);
    const article = node.querySelector('.mas-pedidas-card');
    const mediaContainer = node.querySelector('.mas-pedidas-card__media');
    const baseImage = node.querySelector('.mas-pedidas-card__image--base');
    const hoverImage = node.querySelector('.mas-pedidas-card__image--hover');
    const title = node.querySelector('.mas-pedidas-card__title');
    const description = node.querySelector('.mas-pedidas-card__description');
    const price = node.querySelector('.mas-pedidas-card__price');
    const detailsButton = node.querySelector('.mas-pedidas-card__button');

    if (
      !(article instanceof HTMLElement) ||
      !(mediaContainer instanceof HTMLElement) ||
      !(baseImage instanceof HTMLImageElement) ||
      !(title instanceof HTMLElement) ||
      !(description instanceof HTMLElement) ||
      !(price instanceof HTMLElement)
    ) {
      return null;
    }

    article.dataset.cardId = item.id;
    article.classList.toggle('is-unavailable', item.available === false);
    title.textContent = item.title;
    description.textContent = item.description || '';
    price.textContent = formatPrice(item);

    if (!item.cardImage) {
      baseImage.hidden = true;
      mediaContainer.classList.add('is-empty');
      if (hoverImage instanceof HTMLImageElement) {
        hoverImage.remove();
      }
    } else {
      setBaseImage(baseImage, item);
      if (hoverImage instanceof HTMLImageElement) {
        primeHoverImage(article, hoverImage, item);
      }
    }

    if (DESKTOP_MEDIA.matches) {
      if (detailsButton instanceof HTMLButtonElement) {
        detailsButton.type = 'button';
        detailsButton.disabled = false;
        detailsButton.setAttribute('aria-label', `Ver detalles de ${item.title}`);
      }
    } else if (detailsButton instanceof HTMLButtonElement) {
      detailsButton.remove();
      if (hoverImage instanceof HTMLImageElement) {
        hoverImage.remove();
      }
    }

    cardById.set(item.id, item);
    return {
      targetRow: index < splitIndex ? 'top' : 'bottom',
      node,
    };
  };

  const renderFeaturedCards = async () => {
    let items = [];

    try {
      items = await featuredApi.getFeaturedItems();
    } catch (error) {
      console.error('[home-featured] No se pudo cargar home-featured.json.', error);
      return;
    }

    const featuredItems = Array.isArray(items) ? items.filter(Boolean) : [];
    const cardById = new Map();
    const topRow = document.createElement('div');
    const bottomRow = document.createElement('div');
    const splitIndex = Math.ceil(featuredItems.length / 2);

    topRow.className = 'mas-pedidas__row mas-pedidas__row--top';
    bottomRow.className = 'mas-pedidas__row mas-pedidas__row--bottom';

    featuredItems.forEach((item, index) => {
      const builtCard = buildFeaturedCard(item, index, splitIndex, cardById);
      if (!builtCard) {
        return;
      }

      if (builtCard.targetRow === 'top') {
        topRow.appendChild(builtCard.node);
        return;
      }

      bottomRow.appendChild(builtCard.node);
    });

    topRow.hidden = topRow.childElementCount === 0;
    bottomRow.hidden = bottomRow.childElementCount === 0;
    grid.replaceChildren(topRow, bottomRow);

    window.FigataHomeFeatured = window.FigataHomeFeatured || {};
    window.FigataHomeFeatured.itemsById = cardById;
    window.FigataHomeFeatured.previewEnhancerReady = false;

    document.dispatchEvent(
      new CustomEvent('figata:home-featured-rendered', {
        detail: {
          count: cardById.size,
        },
      })
    );

    requestRowAutoScrollSync();

    if (DESKTOP_MEDIA.matches) {
      await loadDesktopPreviewEnhancer();
    }
  };

  bindMediaChange(mobileRowMedia, requestRowAutoScrollSync);
  bindMediaChange(reduceMotionMedia, requestRowAutoScrollSync);

  void renderFeaturedCards();
})();
