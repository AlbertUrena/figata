(() => {
  const desktopMedia = window.matchMedia('(min-width: 1024px)');
  const hoverCapabilityMedia = window.matchMedia('(hover: hover) and (pointer: fine)');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const grid = document.getElementById('mas-pedidas-grid');
  const featuredApi = window.FigataData?.homeFeatured;
  const analyticsCommerce = window.FigataAnalyticsCommerce || null;
  const publicPaths = window.FigataPublicPaths || null;

  if (!desktopMedia.matches || !grid || !featuredApi?.getFeaturedItemMap) {
    return;
  }

  const COVER_IN_DURATION_MS = 900;
  const COVER_IN_MORPH_DURATION_MS = 1200;
  const COVER_HOLD_DURATION_MS = 0;
  const COVER_OUT_DURATION_MS = 1000;
  const COVER_OUT_MORPH_DURATION_MS = 800;
  const PREVIEW_RISE_DURATION_MS = 1000;
  const PREVIEW_INFO_SCALE_DURATION_MS = 1450;
  const PREVIEW_INFO_BORDER_DURATION_MS = 1200;
  const PREVIEW_INFO_BORDER_DELAY_MS = 250;
  const PREVIEW_INFO_INITIAL_SCALE = 0.6;
  const PREVIEW_INFO_INITIAL_BORDER_PX = 100;
  const PAGE_PUSH_DURATION_MS = 1000;
  const PAGE_PUSH_Y_PX = -200;
  const COVER_EXIT_Y_PERCENT = -100.2;
  const COVER_COLOR = '#143f2b';
  const POWER3_OUT_EASING = 'cubic-bezier(0.215, 0.61, 0.355, 1)';
  const DEFAULT_SOLD_OUT_REASON = 'Temporalmente no disponible.';
  const SVG_WIDTH = 1366;
  const SVG_HEIGHT = 768;

  let isPreviewOpen = false;
  let isCoverTransitionRunning = false;
  let previewBaseImageSrc = '';
  let previewHoverImageSrc = '';
  let hasPreviewHoverImage = false;
  let previewInfoAnimations = [];

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

  const formatNumber = (value) => Number(value.toFixed(2));
  const pagePushTarget = document.querySelector('main');
  const setPagePush = (offsetY) => {
    if (!pagePushTarget) {
      return;
    }

    pagePushTarget.style.transform = `translate3d(0, ${formatNumber(offsetY)}px, 0)`;
  };

  const transitionFactory = window.FigataTransitions?.createFigataTransition;

  const previewOverlay = document.createElement('div');
  previewOverlay.className = 'preview-overlay';
  previewOverlay.hidden = true;
  previewOverlay.setAttribute('aria-hidden', 'true');
  previewOverlay.setAttribute('role', 'dialog');
  previewOverlay.setAttribute('aria-modal', 'true');
  previewOverlay.setAttribute('aria-label', 'Vista previa');

  const previewShell = document.createElement('div');
  previewShell.className = 'preview-overlay__shell';

  const previewCard = document.createElement('article');
  previewCard.className = 'preview-overlay__card preview-overlay__root mas-pedidas-card';
  previewCard.setAttribute('aria-hidden', 'true');

  const previewMediaStage = document.createElement('section');
  previewMediaStage.className = 'preview-overlay__media';

  const previewPicture = document.createElement('figure');
  previewPicture.className = 'preview-overlay__picture app-picture';

  const previewImage = document.createElement('img');
  previewImage.className = 'preview-overlay__image mas-pedidas-card__image';
  previewImage.alt = '';
  previewImage.loading = 'eager';
  previewImage.decoding = 'async';

  previewPicture.appendChild(previewImage);
  previewMediaStage.appendChild(previewPicture);

  const previewInfo = document.createElement('aside');
  previewInfo.className = 'preview-overlay__info';

  const previewInfoBorderOverlay = document.createElement('span');
  previewInfoBorderOverlay.className = 'preview-overlay__info-border-overlay picture__border-overlay';
  previewInfoBorderOverlay.setAttribute('aria-hidden', 'true');

  const previewCloseIcon = document.createElement('button');
  previewCloseIcon.type = 'button';
  previewCloseIcon.className = 'preview-overlay__close-icon';
  previewCloseIcon.setAttribute('aria-label', 'Cerrar preview');
  previewCloseIcon.textContent = '×';

  const previewRatingRow = document.createElement('div');
  previewRatingRow.className = 'preview-overlay__rating-row';

  const previewStars = document.createElement('div');
  previewStars.className = 'preview-overlay__stars';

  for (let index = 0; index < 5; index += 1) {
    const star = document.createElement('span');
    star.className = 'preview-overlay__star';
    star.textContent = '★';
    previewStars.appendChild(star);
  }

  const previewReviews = document.createElement('p');
  previewReviews.className = 'preview-overlay__reviews';
  previewReviews.textContent = '221 reseñas';

  previewRatingRow.append(previewStars, previewReviews);

  const previewHeader = document.createElement('header');
  previewHeader.className = 'preview-overlay__header';

  const previewTitle = document.createElement('h2');
  previewTitle.className = 'preview-overlay__title';

  const previewPrice = document.createElement('p');
  previewPrice.className = 'preview-overlay__price mas-pedidas-card__price';

  previewHeader.append(previewTitle, previewPrice);

  const previewDescription = document.createElement('p');
  previewDescription.className = 'preview-overlay__description';

  const previewAvailability = document.createElement('section');
  previewAvailability.className = 'preview-overlay__availability';

  const previewAvailabilityBadge = document.createElement('span');
  previewAvailabilityBadge.className = 'preview-overlay__availability-badge';

  const previewSoldOutReason = document.createElement('p');
  previewSoldOutReason.className = 'preview-overlay__soldout-reason';

  previewAvailability.append(previewAvailabilityBadge, previewSoldOutReason);

  const previewIngredientsSection = document.createElement('section');
  previewIngredientsSection.className = 'preview-overlay__ingredients';

  const previewIngredientsTitle = document.createElement('h3');
  previewIngredientsTitle.className = 'preview-overlay__ingredients-title';
  previewIngredientsTitle.textContent = 'Ingredientes';

  const previewIngredientsList = document.createElement('ul');
  previewIngredientsList.className = 'preview-overlay__ingredients-list';

  previewIngredientsSection.append(previewIngredientsTitle, previewIngredientsList);

  const previewActions = document.createElement('div');
  previewActions.className = 'preview-overlay__actions';

  const previewPrimaryCta = document.createElement('button');
  previewPrimaryCta.type = 'button';
  previewPrimaryCta.className = 'preview-overlay__button preview-overlay__button--primary';
  previewPrimaryCta.textContent = 'Disponible';
  previewPrimaryCta.disabled = true;

  const previewSecondaryCta = document.createElement('button');
  previewSecondaryCta.type = 'button';
  previewSecondaryCta.className = 'preview-overlay__button preview-overlay__button--secondary';
  previewSecondaryCta.textContent = 'Cerrar';

  previewActions.append(previewPrimaryCta, previewSecondaryCta);

  previewInfo.append(
    previewInfoBorderOverlay,
    previewRatingRow,
    previewHeader,
    previewDescription,
    previewAvailability,
    previewIngredientsSection,
    previewActions
  );

  previewCard.append(previewCloseIcon, previewMediaStage, previewInfo);
  previewShell.appendChild(previewCard);
  previewOverlay.appendChild(previewShell);
  document.body.appendChild(previewOverlay);

  const previewTransitionCover = document.createElement('div');
  previewTransitionCover.className = 'preview-transition-cover';
  previewTransitionCover.hidden = true;
  previewTransitionCover.setAttribute('aria-hidden', 'true');
  previewTransitionCover.innerHTML = `
    <svg class="preview-transition-cover__svg" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}" preserveAspectRatio="none" focusable="false" aria-hidden="true">
      <path class="preview-transition-cover__bg"></path>
      <path class="preview-transition-cover__morph-leave" d="M1366,768L1366,768C1040.2,660.1,348.6,657.8,0,768l0,0V0h1366V768z"></path>
      <path class="preview-transition-cover__morph-enter" d="M0.5,82.1L0.5,82.1c353-103.9,1015-114.8,1366,0l0,0l0,685.9H0.5L0.5,82.1z"></path>
    </svg>
  `;
  document.body.appendChild(previewTransitionCover);

  const previewTransitionPath = previewTransitionCover.querySelector('.preview-transition-cover__bg');
  const previewTransition =
    typeof transitionFactory === 'function' && previewTransitionPath instanceof SVGPathElement
      ? transitionFactory({
          coverElement: previewTransitionCover,
          pathElement: previewTransitionPath,
          pagePushTarget,
          color: COVER_COLOR,
          precision: 2,
          activeClass: 'is-active',
        })
      : null;

  const stopPreviewInfoAnimations = () => {
    if (!previewInfoAnimations.length) {
      return;
    }

    previewInfoAnimations.forEach((animation) => {
      if (!animation) {
        return;
      }

      try {
        animation.cancel();
      } catch (_) {
        // no-op
      }
    });

    previewInfoAnimations = [];
  };

  const resetPreviewInfoAnimation = () => {
    stopPreviewInfoAnimations();
    previewInfo.style.transform = '';
    previewInfoBorderOverlay.style.borderColor = COVER_COLOR;
    previewInfoBorderOverlay.style.borderWidth = '0px';
    previewInfoBorderOverlay.style.opacity = '1';
  };

  const playPreviewInfoMorph = () => {
    if (prefersReducedMotion.matches) {
      resetPreviewInfoAnimation();
      return;
    }

    stopPreviewInfoAnimations();

    previewInfo.style.transform = `scale(${PREVIEW_INFO_INITIAL_SCALE})`;
    previewInfoBorderOverlay.style.borderColor = COVER_COLOR;
    previewInfoBorderOverlay.style.borderWidth = `${PREVIEW_INFO_INITIAL_BORDER_PX}px`;

    const infoScaleAnimation = previewInfo.animate(
      [
        { transform: `scale(${PREVIEW_INFO_INITIAL_SCALE})` },
        { transform: 'scale(1)' },
      ],
      {
        duration: PREVIEW_INFO_SCALE_DURATION_MS,
        easing: POWER3_OUT_EASING,
        fill: 'forwards',
      }
    );

    const borderAnimation = previewInfoBorderOverlay.animate(
      [
        { borderWidth: `${PREVIEW_INFO_INITIAL_BORDER_PX}px` },
        { borderWidth: '0px' },
      ],
      {
        duration: PREVIEW_INFO_BORDER_DURATION_MS,
        delay: PREVIEW_INFO_BORDER_DELAY_MS,
        easing: POWER3_OUT_EASING,
        fill: 'forwards',
      }
    );

    previewInfoAnimations = [infoScaleAnimation, borderAnimation];

    Promise.allSettled(previewInfoAnimations.map((animation) => animation.finished)).then(() => {
      if (!isPreviewOpen) {
        return;
      }

      previewInfoAnimations = [];
      previewInfo.style.transform = 'translate3d(0px, 0px, 0px) scale(1, 1)';
      previewInfoBorderOverlay.style.borderWidth = '0px';
    });
  };

  const resetPreviewCardAnimation = () => {
    previewCard.style.transform = '';
    previewCard.style.opacity = '';
    resetPreviewInfoAnimation();
  };

  const setPreviewOpen = (nextOpen) => {
    if (isPreviewOpen === nextOpen) {
      return;
    }

    isPreviewOpen = nextOpen;
    previewOverlay.hidden = !nextOpen;
    previewOverlay.setAttribute('aria-hidden', String(!nextOpen));
    previewCard.setAttribute('aria-hidden', String(!nextOpen));
    document.body.classList.toggle('preview-open', nextOpen);
  };

  const syncPreviewCardStyles = () => {
    const navbarInner = document.querySelector('.navbar__inner');

    if (!navbarInner) {
      return;
    }

    const navbarStyles = window.getComputedStyle(navbarInner);
    previewCard.style.background = navbarStyles.background;
    previewCard.style.backgroundColor = navbarStyles.backgroundColor;
    previewCard.style.backdropFilter = navbarStyles.backdropFilter;
    previewCard.style.webkitBackdropFilter = navbarStyles.webkitBackdropFilter;
    previewCard.style.boxShadow = navbarStyles.boxShadow;
  };

  const setPreviewImageSource = (src) => {
    if (!src) {
      previewImage.removeAttribute('src');
      previewImage.hidden = true;
      return;
    }

    previewImage.src = toSitePath(src);
    previewImage.hidden = false;
  };

  const preloadAsset = (src) => {
    const assetPath = toSitePath(src);
    if (!assetPath) {
      return;
    }

    const image = new Image();
    image.decoding = 'async';
    image.src = assetPath;
  };

  const setPreviewImage = (card) => {
    const modalImage = card.modalImage || card.cardImage;

    if (!modalImage) {
      previewBaseImageSrc = '';
      previewHoverImageSrc = '';
      hasPreviewHoverImage = false;
      previewImage.removeAttribute('src');
      previewImage.hidden = true;
      return;
    }

    previewBaseImageSrc = modalImage;
    previewHoverImageSrc = card.hoverImage || '';
    hasPreviewHoverImage =
      Boolean(previewHoverImageSrc) && previewHoverImageSrc !== previewBaseImageSrc;

    setPreviewImageSource(previewBaseImageSrc);
    previewImage.alt = card.imageAlt || card.title;
  };

  const setPreviewIngredients = (ingredients) => {
    previewIngredientsList.replaceChildren();

    const normalizedIngredients = Array.isArray(ingredients) ? ingredients : [];
    if (!normalizedIngredients.length) {
      previewIngredientsSection.hidden = true;
      return;
    }

    previewIngredientsSection.hidden = false;

    normalizedIngredients.forEach((ingredient) => {
      const item = document.createElement('li');
      item.className = 'preview-overlay__ingredient-item';

      if (ingredient.icon) {
        const icon = document.createElement('img');
        icon.className = 'preview-overlay__ingredient-icon';
        icon.src = toSitePath(ingredient.icon);
        icon.alt = '';
        icon.decoding = 'async';
        icon.loading = 'lazy';
        item.appendChild(icon);
      }

      const label = document.createElement('span');
      label.className = 'preview-overlay__ingredient-label';
      label.textContent = ingredient.label || ingredient.id || '';
      item.appendChild(label);

      previewIngredientsList.appendChild(item);
    });
  };

  const setPreviewAvailability = (card) => {
    const isAvailable = card.available !== false;
    const soldOutReason = card.soldOutReason || DEFAULT_SOLD_OUT_REASON;

    previewAvailabilityBadge.textContent = isAvailable ? 'Disponible' : 'No disponible';
    previewAvailabilityBadge.classList.toggle('is-available', isAvailable);
    previewAvailabilityBadge.classList.toggle('is-unavailable', !isAvailable);
    previewPrimaryCta.textContent = isAvailable ? 'Disponible' : 'No disponible';
    previewPrimaryCta.classList.toggle('is-available', isAvailable);
    previewPrimaryCta.classList.toggle('is-unavailable', !isAvailable);
    previewSoldOutReason.hidden = isAvailable;
    previewSoldOutReason.textContent = isAvailable ? '' : soldOutReason;
  };

  const hydratePreviewContent = (card) => {
    previewReviews.textContent = card.reviews || '221 reseñas';
    previewTitle.textContent = card.title;
    previewPrice.textContent = card.priceFormatted || '';
    previewDescription.textContent = card.previewDescription || card.description || '';
    setPreviewAvailability(card);
    setPreviewIngredients(card.ingredients || []);
    setPreviewImage(card);
  };

  const playCoverTransition = async () => {
    if (!previewTransition) {
      setPreviewOpen(true);
      previewCard.style.transform = 'translate3d(0, 0, 0)';
      previewCard.style.opacity = '1';
      setPagePush(PAGE_PUSH_Y_PX);
      resetPreviewInfoAnimation();
      return;
    }

    isCoverTransitionRunning = true;
    resetPreviewCardAnimation();
    let previewActivated = false;

    try {
      await previewTransition.playEnterThenExit({
        inDurationMs: COVER_IN_DURATION_MS,
        holdDurationMs: COVER_HOLD_DURATION_MS,
        outDurationMs: COVER_OUT_DURATION_MS,
        morphInDurationMs: COVER_IN_MORPH_DURATION_MS,
        morphOutDurationMs: COVER_OUT_MORPH_DURATION_MS,
        coverEnterFrom: 100,
        coverEnterTo: 0,
        coverExitTo: COVER_EXIT_Y_PERCENT,
        finalPagePush: PAGE_PUSH_Y_PX,
        pagePush: ({ elapsedMs, helpers, easings, setPagePush: setTransitionPagePush }) => {
          const pushProgress = easings.enter(helpers.clamp(elapsedMs / PAGE_PUSH_DURATION_MS));
          setTransitionPagePush(helpers.lerp(0, PAGE_PUSH_Y_PX, pushProgress));
        },
        onMidpoint: () => {
          if (previewActivated) {
            return;
          }

          previewActivated = true;
          setPreviewOpen(true);
          previewCard.style.transform = 'translate3d(0, 400px, 0)';
          previewCard.style.opacity = '0';
          playPreviewInfoMorph();
        },
        onTick: ({ elapsedMs, helpers, easings }) => {
          if (!previewActivated) {
            return;
          }

          const riseProgress = helpers.clamp(
            (elapsedMs - COVER_IN_DURATION_MS) / PREVIEW_RISE_DURATION_MS
          );
          const easedRise = easings.rise(riseProgress);
          previewCard.style.transform = `translate3d(0, ${helpers.format(
            helpers.lerp(400, 0, easedRise)
          )}px, 0)`;
          previewCard.style.opacity = String(helpers.format(easedRise));
        },
        onComplete: () => {
          setPagePush(PAGE_PUSH_Y_PX);
          previewCard.style.transform = 'translate3d(0, 0, 0)';
          previewCard.style.opacity = '1';
        },
      });
    } finally {
      isCoverTransitionRunning = false;
    }
  };

  const playCoverCloseTransition = async () => {
    if (!previewTransition) {
      setPagePush(0);
      setPreviewOpen(false);
      resetPreviewCardAnimation();
      return;
    }

    isCoverTransitionRunning = true;
    const pageRevealStartY = Math.abs(PAGE_PUSH_Y_PX);
    let previewDeactivated = false;

    try {
      await previewTransition.playEnterThenExit({
        inDurationMs: COVER_IN_DURATION_MS,
        holdDurationMs: COVER_HOLD_DURATION_MS,
        outDurationMs: COVER_OUT_DURATION_MS,
        morphInDurationMs: COVER_IN_MORPH_DURATION_MS,
        morphOutDurationMs: COVER_OUT_MORPH_DURATION_MS,
        coverEnterFrom: 100,
        coverEnterTo: 0,
        coverExitTo: COVER_EXIT_Y_PERCENT,
        finalPagePush: 0,
        pagePush: ({
          elapsedMs,
          coverOutStartMs,
          helpers,
          easings,
          setPagePush: setTransitionPagePush,
        }) => {
          if (!previewDeactivated) {
            setTransitionPagePush(PAGE_PUSH_Y_PX);
            return;
          }

          const revealProgress = helpers.clamp(
            (elapsedMs - coverOutStartMs) / COVER_OUT_DURATION_MS
          );
          const easedReveal = easings.rise(revealProgress);
          setTransitionPagePush(helpers.lerp(pageRevealStartY, 0, easedReveal));
        },
        onTick: ({ elapsedMs, helpers, easings }) => {
          if (previewDeactivated) {
            return;
          }

          const pushUpProgress = easings.enter(helpers.clamp(elapsedMs / PAGE_PUSH_DURATION_MS));
          previewCard.style.transform = `translate3d(0, ${formatNumber(
            helpers.lerp(0, PAGE_PUSH_Y_PX, pushUpProgress)
          )}px, 0)`;
          previewCard.style.opacity = '1';
        },
        onMidpoint: ({ setPagePush: setTransitionPagePush }) => {
          if (previewDeactivated) {
            return;
          }

          previewDeactivated = true;
          setPreviewOpen(false);
          resetPreviewCardAnimation();
          setTransitionPagePush(pageRevealStartY);
        },
        onComplete: () => {
          setPagePush(0);
          setPreviewOpen(false);
          resetPreviewCardAnimation();
        },
      });
    } finally {
      isCoverTransitionRunning = false;
    }
  };

  const openPreview = async (card) => {
    if (isPreviewOpen || isCoverTransitionRunning) {
      return;
    }

    hydratePreviewContent(card);
    syncPreviewCardStyles();

    if (prefersReducedMotion.matches) {
      setPreviewOpen(true);
      previewCard.style.transform = 'translate3d(0, 0, 0)';
      previewCard.style.opacity = '1';
      resetPreviewInfoAnimation();
      return;
    }

    await playCoverTransition();
  };

  const closePreview = async () => {
    if (isCoverTransitionRunning || !isPreviewOpen) {
      return;
    }

    if (prefersReducedMotion.matches) {
      setPagePush(0);
      setPreviewOpen(false);
      resetPreviewCardAnimation();
      return;
    }

    await playCoverCloseTransition();
  };

  const bindCardInteractions = async () => {
    const cardById = await featuredApi.getFeaturedItemMap();
    const articles = Array.from(grid.querySelectorAll('.mas-pedidas-card'));

    articles.forEach((article) => {
      if (!(article instanceof HTMLElement)) {
        return;
      }

      const cardId = article.dataset.cardId;
      const card = cardId ? cardById.get(cardId) : null;
      const detailsButton = article.querySelector('.mas-pedidas-card__button');

      if (!(detailsButton instanceof HTMLButtonElement) || !card) {
        return;
      }

      const primeCardAssets = () => {
        if (article.dataset.previewAssetsPrimed === '1') {
          return;
        }

        article.dataset.previewAssetsPrimed = '1';
        preloadAsset(card.modalImage);
        if (hoverCapabilityMedia.matches && card.hoverImage) {
          preloadAsset(card.hoverImage);
        }
      };

      detailsButton.addEventListener('click', () => {
        primeCardAssets();
        analyticsCommerce?.trackItemDetailOpen?.(card, {
          detailOrigin: 'home_featured_preview',
          detailDepthIndex: 1,
        });
        void openPreview({
          ...card,
          priceFormatted: card.priceFormatted || `$${Math.round(Number(card.price || 0)).toLocaleString('es-DO')}`,
        });
      });

      article.addEventListener('pointerenter', primeCardAssets, { once: true, passive: true });
      detailsButton.addEventListener('focus', primeCardAssets, { once: true });
    });
  };

  previewOverlay.addEventListener('click', (event) => {
    if (event.target === previewOverlay || event.target === previewShell) {
      void closePreview();
    }
  });

  previewCloseIcon.addEventListener('click', () => {
    void closePreview();
  });
  previewSecondaryCta.addEventListener('click', () => {
    void closePreview();
  });

  previewMediaStage.addEventListener('pointerenter', () => {
    if (!hasPreviewHoverImage || !previewHoverImageSrc) {
      return;
    }

    setPreviewImageSource(previewHoverImageSrc);
  });

  previewMediaStage.addEventListener('pointerleave', () => {
    if (!previewBaseImageSrc) {
      return;
    }

    setPreviewImageSource(previewBaseImageSrc);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      void closePreview();
    }
  });

  window.addEventListener('resize', () => {
    if (!desktopMedia.matches && !previewOverlay.hidden) {
      setPagePush(0);
      setPreviewOpen(false);
      resetPreviewCardAnimation();
    }
  });

  bindCardInteractions()
    .then(() => {
      window.FigataHomeFeatured = window.FigataHomeFeatured || {};
      window.FigataHomeFeatured.previewEnhancerReady = true;
    })
    .catch((error) => {
      console.error('[mas-pedidas] No se pudieron vincular los detalles desktop.', error);
    });
})();
