(() => {
  const grid = document.getElementById("mas-pedidas-grid");
  const template = document.getElementById("mas-pedidas-card-template");

  if (!grid || !(template instanceof HTMLTemplateElement)) {
    return;
  }

  const menuApi = window.FigataData?.menu;
  const homeApi = window.FigataData?.home;
  const mediaApi = window.FigataData?.media;
  const ingredientIconRowApi = window.FigataData?.ingredientIconRow;

  if (!menuApi?.getFeaturedMenuItems || !ingredientIconRowApi?.renderIngredientIconRow) {
    console.error("[mas-pedidas] APIs de datos no disponibles.");
    return;
  }

  const { getFeaturedMenuItems } = menuApi;
  const { renderIngredientIconRow } = ingredientIconRowApi;

  let isPreviewOpen = false;
  let isCoverTransitionRunning = false;
  let previewBaseImageSrc = "";
  let previewHoverImageSrc = "";
  let hasPreviewHoverImage = false;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

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
  const HOME_FEATURED_LIMIT = 8;
  const COVER_COLOR = "#143f2b";
  const POWER3_OUT_EASING = "cubic-bezier(0.215, 0.61, 0.355, 1)";

  const SVG_WIDTH = 1366;
  const SVG_HEIGHT = 768;

  const previewOverlay = document.createElement("div");
  previewOverlay.className = "preview-overlay";
  previewOverlay.hidden = true;
  previewOverlay.setAttribute("aria-hidden", "true");
  previewOverlay.setAttribute("role", "dialog");
  previewOverlay.setAttribute("aria-modal", "true");
  previewOverlay.setAttribute("aria-label", "Vista previa");

  const previewShell = document.createElement("div");
  previewShell.className = "preview-overlay__shell";

  const previewCard = document.createElement("article");
  previewCard.className = "preview-overlay__card preview-overlay__root mas-pedidas-card";
  previewCard.setAttribute("aria-hidden", "true");

  const previewMediaStage = document.createElement("section");
  previewMediaStage.className = "preview-overlay__media";

  const previewPicture = document.createElement("figure");
  previewPicture.className = "preview-overlay__picture app-picture";

  const previewImage = document.createElement("img");
  previewImage.className = "preview-overlay__image mas-pedidas-card__image";
  previewImage.alt = "";
  previewImage.loading = "eager";
  previewImage.decoding = "async";

  previewPicture.appendChild(previewImage);
  previewMediaStage.appendChild(previewPicture);

  const previewInfo = document.createElement("aside");
  previewInfo.className = "preview-overlay__info";

  const previewInfoBorderOverlay = document.createElement("span");
  previewInfoBorderOverlay.className = "preview-overlay__info-border-overlay picture__border-overlay";
  previewInfoBorderOverlay.setAttribute("aria-hidden", "true");

  const previewCloseIcon = document.createElement("button");
  previewCloseIcon.type = "button";
  previewCloseIcon.className = "preview-overlay__close-icon";
  previewCloseIcon.setAttribute("aria-label", "Cerrar preview");
  previewCloseIcon.textContent = "×";

  const previewRatingRow = document.createElement("div");
  previewRatingRow.className = "preview-overlay__rating-row";

  const previewStars = document.createElement("div");
  previewStars.className = "preview-overlay__stars";

  for (let i = 0; i < 5; i += 1) {
    const star = document.createElement("img");
    star.className = "preview-overlay__star";
    star.src = "assets/svg-icons/star.svg";
    star.alt = "";
    star.setAttribute("aria-hidden", "true");
    previewStars.appendChild(star);
  }

  const previewReviews = document.createElement("p");
  previewReviews.className = "preview-overlay__reviews";
  previewReviews.textContent = "221 reseñas";

  previewRatingRow.appendChild(previewStars);
  previewRatingRow.appendChild(previewReviews);

  const previewHeader = document.createElement("header");
  previewHeader.className = "preview-overlay__header";

  const previewTitle = document.createElement("h2");
  previewTitle.className = "preview-overlay__title";

  const previewPrice = document.createElement("p");
  previewPrice.className = "preview-overlay__price mas-pedidas-card__price";

  previewHeader.appendChild(previewTitle);
  previewHeader.appendChild(previewPrice);

  const previewDescription = document.createElement("p");
  previewDescription.className = "preview-overlay__description";

  const previewAvailability = document.createElement("section");
  previewAvailability.className = "preview-overlay__availability";

  const previewAvailabilityBadge = document.createElement("span");
  previewAvailabilityBadge.className = "preview-overlay__availability-badge";

  const previewSoldOutReason = document.createElement("p");
  previewSoldOutReason.className = "preview-overlay__soldout-reason";

  previewAvailability.appendChild(previewAvailabilityBadge);
  previewAvailability.appendChild(previewSoldOutReason);

  const previewIngredientsSection = document.createElement("section");
  previewIngredientsSection.className = "preview-overlay__ingredients";

  const previewIngredientsTitle = document.createElement("h3");
  previewIngredientsTitle.className = "preview-overlay__ingredients-title";
  previewIngredientsTitle.textContent = "Ingredientes";

  const previewIngredientsList = document.createElement("ul");
  previewIngredientsList.className = "preview-overlay__ingredients-list";

  previewIngredientsSection.appendChild(previewIngredientsTitle);
  previewIngredientsSection.appendChild(previewIngredientsList);

  const previewActions = document.createElement("div");
  previewActions.className = "preview-overlay__actions";

  const previewPrimaryCta = document.createElement("button");
  previewPrimaryCta.type = "button";
  previewPrimaryCta.className = "preview-overlay__button preview-overlay__button--primary";
  previewPrimaryCta.textContent = "Disponible";
  previewPrimaryCta.disabled = true;

  const previewSecondaryCta = document.createElement("button");
  previewSecondaryCta.type = "button";
  previewSecondaryCta.className = "preview-overlay__button preview-overlay__button--secondary";
  previewSecondaryCta.textContent = "Cerrar";

  previewActions.appendChild(previewPrimaryCta);
  previewActions.appendChild(previewSecondaryCta);

  previewInfo.appendChild(previewInfoBorderOverlay);
  previewInfo.appendChild(previewRatingRow);
  previewInfo.appendChild(previewHeader);
  previewInfo.appendChild(previewDescription);
  previewInfo.appendChild(previewAvailability);
  previewInfo.appendChild(previewIngredientsSection);
  previewInfo.appendChild(previewActions);

  previewCard.appendChild(previewCloseIcon);
  previewCard.appendChild(previewMediaStage);
  previewCard.appendChild(previewInfo);

  previewShell.appendChild(previewCard);
  previewOverlay.appendChild(previewShell);
  document.body.appendChild(previewOverlay);

  const previewTransitionCover = document.createElement("div");
  previewTransitionCover.className = "preview-transition-cover";
  previewTransitionCover.hidden = true;
  previewTransitionCover.setAttribute("aria-hidden", "true");
  previewTransitionCover.innerHTML = `
    <svg class="preview-transition-cover__svg" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}" preserveAspectRatio="none" focusable="false" aria-hidden="true">
      <path class="preview-transition-cover__bg"></path>
      <path class="preview-transition-cover__morph-leave" d="M1366,768L1366,768C1040.2,660.1,348.6,657.8,0,768l0,0V0h1366V768z"></path>
      <path class="preview-transition-cover__morph-enter" d="M0.5,82.1L0.5,82.1c353-103.9,1015-114.8,1366,0l0,0l0,685.9H0.5L0.5,82.1z"></path>
    </svg>
  `;
  document.body.appendChild(previewTransitionCover);

  const previewTransitionPath = previewTransitionCover.querySelector(".preview-transition-cover__bg");
  const pagePushTarget = document.querySelector("main");
  let previewInfoAnimations = [];

  const formatNumber = (value) => Number(value.toFixed(2));

  const setPagePush = (offsetY) => {
    if (!pagePushTarget) {
      return;
    }

    pagePushTarget.style.transform = `translate3d(0, ${formatNumber(offsetY)}px, 0)`;
  };

  const transitionFactory = window.FigataTransitions?.createFigataTransition;
  const previewTransition =
    typeof transitionFactory === "function" && previewTransitionPath instanceof SVGPathElement
      ? transitionFactory({
          coverElement: previewTransitionCover,
          pathElement: previewTransitionPath,
          pagePushTarget,
          color: COVER_COLOR,
          precision: 2,
          activeClass: "is-active",
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
    previewInfo.style.transform = "";
    previewInfoBorderOverlay.style.borderColor = COVER_COLOR;
    previewInfoBorderOverlay.style.borderWidth = "0px";
    previewInfoBorderOverlay.style.opacity = "1";
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
        { transform: "scale(1)" },
      ],
      {
        duration: PREVIEW_INFO_SCALE_DURATION_MS,
        easing: POWER3_OUT_EASING,
        fill: "forwards",
      }
    );

    const borderAnimation = previewInfoBorderOverlay.animate(
      [
        { borderWidth: `${PREVIEW_INFO_INITIAL_BORDER_PX}px` },
        { borderWidth: "0px" },
      ],
      {
        duration: PREVIEW_INFO_BORDER_DURATION_MS,
        delay: PREVIEW_INFO_BORDER_DELAY_MS,
        easing: POWER3_OUT_EASING,
        fill: "forwards",
      }
    );

    previewInfoAnimations = [infoScaleAnimation, borderAnimation];

    Promise.allSettled(previewInfoAnimations.map((animation) => animation.finished)).then(() => {
      if (!isPreviewOpen) {
        return;
      }

      previewInfoAnimations = [];
      previewInfo.style.transform = "translate3d(0px, 0px, 0px) scale(1, 1)";
      previewInfoBorderOverlay.style.borderWidth = "0px";
    });
  };

  const resetPreviewCardAnimation = () => {
    previewCard.style.transform = "";
    previewCard.style.opacity = "";
    resetPreviewInfoAnimation();
  };

  const setPreviewOpen = (nextOpen) => {
    if (isPreviewOpen === nextOpen) {
      return;
    }

    isPreviewOpen = nextOpen;
    previewOverlay.hidden = !nextOpen;
    previewOverlay.setAttribute("aria-hidden", String(!nextOpen));
    previewCard.setAttribute("aria-hidden", String(!nextOpen));
    document.body.classList.toggle("preview-open", nextOpen);
  };

  const syncPreviewCardStyles = () => {
    const navbarInner = document.querySelector(".navbar__inner");

    if (navbarInner) {
      const navbarStyles = window.getComputedStyle(navbarInner);

      previewCard.style.background = navbarStyles.background;
      previewCard.style.backgroundColor = navbarStyles.backgroundColor;
      previewCard.style.backdropFilter = navbarStyles.backdropFilter;
      previewCard.style.webkitBackdropFilter = navbarStyles.webkitBackdropFilter;
      previewCard.style.boxShadow = navbarStyles.boxShadow;
    }
  };

  const setPreviewImageSource = (src) => {
    previewImage.src = src;
    previewImage.hidden = false;
  };

  const normalizeAssetPath = (value) => String(value || "").trim().replace(/^\//, "");

  const resolveItemMedia = (item) => {
    const fallbackImage = normalizeAssetPath(item?.image || "");
    const fallbackAlt = item?.name || item?.id || "";

    if (!mediaApi?.get) {
      return {
        card: fallbackImage,
        hover: "",
        modal: fallbackImage,
        alt: fallbackAlt,
        gallery: [],
      };
    }

    const card = normalizeAssetPath(mediaApi.get(item.id, "card"));
    const hover = normalizeAssetPath(mediaApi.get(item.id, "hover"));
    const modal = normalizeAssetPath(mediaApi.get(item.id, "modal"));
    const alt = String(mediaApi.getAlt(item.id) || fallbackAlt).trim();
    const gallery = Array.isArray(mediaApi.getGallery(item.id))
      ? mediaApi.getGallery(item.id).map(normalizeAssetPath).filter(Boolean)
      : [];

    return {
      card,
      hover: hover && hover !== card ? hover : "",
      modal: modal || card,
      alt,
      gallery,
    };
  };

  const preloadFeaturedModalImages = (items) => {
    if (!mediaApi?.prefetch || !Array.isArray(items) || items.length === 0) {
      return;
    }

    const itemsToPrefetch = items.slice(0, HOME_FEATURED_LIMIT);

    const execute = () => {
      itemsToPrefetch.forEach((item) => {
        mediaApi.prefetch(item.id, "modal");
        mediaApi.prefetch(item.id, "hover");
      });
    };

    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(execute, { timeout: 1500 });
      return;
    }

    window.setTimeout(execute, 120);
  };

  const setPreviewImage = (card) => {
    const modalImage = card.modalImage || card.image;

    if (!modalImage) {
      previewBaseImageSrc = "";
      previewHoverImageSrc = "";
      hasPreviewHoverImage = false;
      previewImage.removeAttribute("src");
      previewImage.hidden = true;
      return;
    }

    previewBaseImageSrc = modalImage;
    previewHoverImageSrc = card.hoverImage || "";
    hasPreviewHoverImage =
      Boolean(previewHoverImageSrc) && previewHoverImageSrc !== previewBaseImageSrc;

    setPreviewImageSource(previewBaseImageSrc);
    previewImage.alt = card.imageAlt || card.title;

    if (hasPreviewHoverImage) {
      const hoverProbe = new Image();
      hoverProbe.onload = () => {
        hasPreviewHoverImage = true;
      };
      hoverProbe.onerror = () => {
        hasPreviewHoverImage = false;
      };
      hoverProbe.src = previewHoverImageSrc;
    }
  };

  const setPreviewIngredients = async (ingredients) => {
    try {
      await renderIngredientIconRow(previewIngredientsList, ingredients);
    } catch (error) {
      previewIngredientsList.replaceChildren();
      console.error("[mas-pedidas] No se pudieron renderizar ingredientes del preview", error);
    }
  };

  const hydratePreviewContent = async (card) => {
    previewReviews.textContent = card.reviews || "221 reseñas";
    previewTitle.textContent = card.title;
    previewPrice.textContent = card.price;
    previewDescription.textContent = card.previewDescription || card.description;
    setPreviewAvailability(card);
    await setPreviewIngredients(card.ingredients || []);
    setPreviewImage(card);
  };

  const playCoverTransition = async () => {
    if (!previewTransition) {
      setPreviewOpen(true);
      previewCard.style.transform = "translate3d(0, 0, 0)";
      previewCard.style.opacity = "1";
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
          previewCard.style.transform = "translate3d(0, 400px, 0)";
          previewCard.style.opacity = "0";
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
          previewCard.style.transform = "translate3d(0, 0, 0)";
          previewCard.style.opacity = "1";
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
        pagePush: ({ elapsedMs, coverOutStartMs, helpers, easings, setPagePush: setTransitionPagePush }) => {
          if (!previewDeactivated) {
            setTransitionPagePush(PAGE_PUSH_Y_PX);
            return;
          }

          const revealProgress = helpers.clamp((elapsedMs - coverOutStartMs) / COVER_OUT_DURATION_MS);
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
          previewCard.style.opacity = "1";
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

    await hydratePreviewContent(card);
    syncPreviewCardStyles();

    if (prefersReducedMotion.matches) {
      setPreviewOpen(true);
      previewCard.style.transform = "translate3d(0, 0, 0)";
      previewCard.style.opacity = "1";
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

  previewOverlay.addEventListener("click", (event) => {
    if (event.target === previewOverlay || event.target === previewShell) {
      closePreview();
    }
  });

  previewCloseIcon.addEventListener("click", closePreview);
  previewSecondaryCta.addEventListener("click", closePreview);

  previewMediaStage.addEventListener("pointerenter", () => {
    if (!hasPreviewHoverImage || !previewHoverImageSrc) {
      return;
    }

    setPreviewImageSource(previewHoverImageSrc);
  });

  previewMediaStage.addEventListener("pointerleave", () => {
    if (!previewBaseImageSrc) {
      return;
    }

    setPreviewImageSource(previewBaseImageSrc);
  });

  previewImage.addEventListener("error", () => {
    const renderedSource = previewImage.currentSrc || previewImage.src || "";
    const isHoverSource =
      Boolean(previewHoverImageSrc) && renderedSource.includes(previewHoverImageSrc);

    if (isHoverSource && previewBaseImageSrc) {
      hasPreviewHoverImage = false;
      setPreviewImageSource(previewBaseImageSrc);
      return;
    }

    previewImage.hidden = true;
  });

  document.addEventListener("keydown", (event) => {
    if (!isPreviewOpen || event.key !== "Escape") {
      return;
    }

    closePreview();
  });

  if (previewTransitionPath instanceof SVGPathElement) {
    previewTransitionPath.setAttribute("fill", COVER_COLOR);
  }
  previewTransitionCover.style.transform = `translate3d(0, ${COVER_EXIT_Y_PERCENT}%, 0)`;
  previewTransitionCover.style.visibility = "hidden";
  previewTransitionCover.style.opacity = "0";
  previewTransitionCover.classList.remove("is-active");
  previewTransitionCover.hidden = true;
  previewTransitionCover.setAttribute("aria-hidden", "true");
  setPagePush(0);

  const DEFAULT_SOLD_OUT_REASON = "Temporalmente no disponible.";

  const toCardViewModel = (item, media) => ({
    id: item.id,
    slug: item.slug,
    title: item.name || item.id,
    description: item.descriptionShort || "",
    previewDescription: item.descriptionLong || item.descriptionShort || "",
    ingredients: Array.isArray(item.ingredients) ? item.ingredients : [],
    reviews: item.reviews || "",
    price: item.priceFormatted || "",
    image: media.card || "",
    hoverImage: media.hover || "",
    modalImage: media.modal || media.card || "",
    imageAlt: media.alt || item.name || item.id,
    gallery: Array.isArray(media.gallery) ? media.gallery : [],
    available: item.available !== false,
    soldOutReason: item.soldOutReason || "",
  });

  const setPreviewAvailability = (card) => {
    const isAvailable = card.available !== false;
    const soldOutReason = card.soldOutReason || DEFAULT_SOLD_OUT_REASON;

    previewAvailabilityBadge.textContent = isAvailable ? "Disponible" : "No disponible";
    previewAvailabilityBadge.classList.toggle("is-available", isAvailable);
    previewAvailabilityBadge.classList.toggle("is-unavailable", !isAvailable);

    previewSoldOutReason.hidden = isAvailable;
    previewSoldOutReason.textContent = isAvailable ? "" : soldOutReason;

    previewPrimaryCta.textContent = isAvailable ? "Disponible" : "No disponible";
    previewPrimaryCta.classList.toggle("is-available", isAvailable);
    previewPrimaryCta.classList.toggle("is-unavailable", !isAvailable);
  };

  const normalizeFeaturedIds = (value) =>
    Array.isArray(value)
      ? value.map((id) => String(id || "").trim()).filter(Boolean)
      : [];

  const resolvePopularSelection = async () => {
    const fallback = {
      featuredIds: [],
      limit: HOME_FEATURED_LIMIT,
    };

    if (!homeApi?.getHomeConfig) {
      return fallback;
    }

    try {
      const home = await homeApi.getHomeConfig();
      const popular = home?.popular || {};
      const configuredLimit = Number(popular.limit);
      const normalizedLimit =
        Number.isFinite(configuredLimit) && configuredLimit > 0
          ? Math.round(configuredLimit)
          : fallback.limit;
      const limit = Math.min(normalizedLimit, HOME_FEATURED_LIMIT);

      return {
        featuredIds: normalizeFeaturedIds(popular.featuredIds),
        limit,
      };
    } catch (error) {
      console.error("[mas-pedidas] No se pudo leer configuracion popular desde home.json", error);
      return fallback;
    }
  };

  const renderFeaturedCards = async () => {
    let featuredItems = [];
    const selection = await resolvePopularSelection();

    if (mediaApi?.loadMediaStore) {
      try {
        await mediaApi.loadMediaStore();
      } catch (error) {
        console.error("[mas-pedidas] No se pudo cargar media.json", error);
      }
    }

    try {
      featuredItems = await getFeaturedMenuItems({
        featuredIds: selection.featuredIds,
        limit: selection.limit,
      });
    } catch (error) {
      console.error("[mas-pedidas] No se pudo cargar featured items desde menu.json", error);
      return;
    }

    featuredItems = featuredItems.slice(0, HOME_FEATURED_LIMIT);

    const fragment = document.createDocumentFragment();

    featuredItems.forEach((item) => {
      const mediaAssets = resolveItemMedia(item);
      const card = toCardViewModel(item, mediaAssets);
      const node = template.content.cloneNode(true);
      const article = node.querySelector(".mas-pedidas-card");
      const mediaContainer = node.querySelector(".mas-pedidas-card__media");
      const baseImage = node.querySelector(".mas-pedidas-card__image--base");
      const hoverImage = node.querySelector(".mas-pedidas-card__image--hover");
      const title = node.querySelector(".mas-pedidas-card__title");
      const description = node.querySelector(".mas-pedidas-card__description");
      const price = node.querySelector(".mas-pedidas-card__price");
      const detailsButton = node.querySelector(".mas-pedidas-card__button");

      if (
        !article ||
        !mediaContainer ||
        !baseImage ||
        !hoverImage ||
        !title ||
        !description ||
        !price ||
        !detailsButton
      ) {
        return;
      }

      title.textContent = card.title;
      description.textContent = card.description;
      price.textContent = card.price;
      article.classList.toggle("is-unavailable", !card.available);

      const detailsLabel = detailsButton.querySelector("span");
      if (detailsLabel) {
        detailsLabel.textContent = "Detalles";
      } else {
        detailsButton.textContent = "Detalles";
      }

      const imageSrc = card.image;

      if (imageSrc) {
        baseImage.src = imageSrc;
        baseImage.alt = card.imageAlt || card.title;
        baseImage.loading = "lazy";
        baseImage.decoding = "async";
        baseImage.addEventListener("error", () => {
          baseImage.hidden = true;
          hoverImage.hidden = true;
          article.classList.remove("has-hover-image");
          mediaContainer.classList.add("is-empty");
        });

        if (card.hoverImage && card.hoverImage !== imageSrc) {
          hoverImage.src = card.hoverImage;
          hoverImage.alt = "";
          hoverImage.loading = "lazy";
          hoverImage.decoding = "async";
          hoverImage.addEventListener("load", () => {
            if (!hoverImage.hidden) {
              article.classList.add("has-hover-image");
            }
          });
          hoverImage.addEventListener("error", () => {
            hoverImage.hidden = true;
            article.classList.remove("has-hover-image");
          });
        } else {
          hoverImage.hidden = true;
          article.classList.remove("has-hover-image");
        }
      } else {
        baseImage.hidden = true;
        hoverImage.hidden = true;
        mediaContainer.classList.add("is-empty");
      }

      detailsButton.addEventListener("click", () => {
        void openPreview(card);
      });

      article.addEventListener(
        "pointerenter",
        () => {
          if (mediaApi?.prefetch) {
            mediaApi.prefetch(card.id, "modal");
          }
        },
        { once: true }
      );

      fragment.appendChild(node);
    });

    grid.replaceChildren(fragment);
    preloadFeaturedModalImages(featuredItems);
  };

  void renderFeaturedCards();
})();
