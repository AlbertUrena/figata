(() => {
  const grid = document.getElementById("mas-pedidas-grid");
  const template = document.getElementById("mas-pedidas-card-template");

  if (!grid || !(template instanceof HTMLTemplateElement)) {
    return;
  }

  let isPreviewOpen = false;
  let isCoverTransitionRunning = false;
  let coverRafId = 0;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const COVER_IN_DURATION_MS = 900;
  const COVER_IN_MORPH_DURATION_MS = 1200;
  const COVER_HOLD_DURATION_MS = 500;
  const COVER_OUT_DURATION_MS = 1000;
  const COVER_OUT_MORPH_DURATION_MS = 800;
  const PREVIEW_RISE_DURATION_MS = 1000;
  const COVER_EXIT_Y_PERCENT = -100.2;
  const COVER_COLOR = "#143f2b";

  const SVG_WIDTH = 1366;
  const SVG_HEIGHT = 768;
  const ENTER_PATH_START_Y = 82.1;
  const ENTER_PATH_CP1_X = 353;
  const ENTER_PATH_CP1_Y = -21.8;
  const ENTER_PATH_CP2_X = 1015;
  const ENTER_PATH_CP2_Y = -32.7;
  const LEAVE_PATH_CP1_X = 1040.2;
  const LEAVE_PATH_CP1_Y = 660.1;
  const LEAVE_PATH_CP2_X = 348.6;
  const LEAVE_PATH_CP2_Y = 657.8;

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
  previewCard.className = "preview-overlay__card mas-pedidas-card";
  previewCard.setAttribute("aria-hidden", "true");

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

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const lerp = (from, to, progress) => from + (to - from) * progress;
  const formatNumber = (value) => Number(value.toFixed(2));

  const createCubicBezier = (p1x, p1y, p2x, p2y) => {
    const cx = 3 * p1x;
    const bx = 3 * (p2x - p1x) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * p1y;
    const by = 3 * (p2y - p1y) - cy;
    const ay = 1 - cy - by;
    const epsilon = 1e-6;

    const sampleCurveX = (t) => ((ax * t + bx) * t + cx) * t;
    const sampleCurveY = (t) => ((ay * t + by) * t + cy) * t;
    const sampleCurveDerivativeX = (t) => (3 * ax * t + 2 * bx) * t + cx;

    const solveCurveX = (x) => {
      let t2 = x;

      for (let i = 0; i < 8; i += 1) {
        const x2 = sampleCurveX(t2) - x;

        if (Math.abs(x2) < epsilon) {
          return t2;
        }

        const d2 = sampleCurveDerivativeX(t2);

        if (Math.abs(d2) < epsilon) {
          break;
        }

        t2 -= x2 / d2;
      }

      let t0 = 0;
      let t1 = 1;
      t2 = x;

      for (let i = 0; i < 16; i += 1) {
        const x2 = sampleCurveX(t2);

        if (Math.abs(x2 - x) < epsilon) {
          return t2;
        }

        if (x > x2) {
          t0 = t2;
        } else {
          t1 = t2;
        }

        t2 = (t1 - t0) * 0.5 + t0;
      }

      return t2;
    };

    return (x) => sampleCurveY(solveCurveX(clamp(x)));
  };

  const easeCoverEnter = createCubicBezier(1, 0, 0.75, 1);
  const easeCoverLeave = createCubicBezier(0.65, 0, 0.25, 1);
  const easePreviewRise = (value) => 1 - Math.pow(1 - clamp(value), 3);

  const buildTopBlobPath = (amount) => {
    const progress = clamp(amount);
    const startY = lerp(0, ENTER_PATH_START_Y, progress);
    const cp1Y = lerp(0, ENTER_PATH_CP1_Y, progress);
    const cp2Y = lerp(0, ENTER_PATH_CP2_Y, progress);

    return [
      `M0 ${formatNumber(startY)}`,
      `C${ENTER_PATH_CP1_X} ${formatNumber(cp1Y)} ${ENTER_PATH_CP2_X} ${formatNumber(cp2Y)} ${SVG_WIDTH} ${formatNumber(startY)}`,
      `V${SVG_HEIGHT}`,
      "H0",
      "Z",
    ].join(" ");
  };

  const buildBottomBlobPath = (amount) => {
    const progress = clamp(amount);
    const cp1Y = lerp(SVG_HEIGHT, LEAVE_PATH_CP1_Y, progress);
    const cp2Y = lerp(SVG_HEIGHT, LEAVE_PATH_CP2_Y, progress);

    return [
      "M0 0",
      `H${SVG_WIDTH}`,
      `V${SVG_HEIGHT}`,
      `C${LEAVE_PATH_CP1_X} ${formatNumber(cp1Y)} ${LEAVE_PATH_CP2_X} ${formatNumber(cp2Y)} 0 ${SVG_HEIGHT}`,
      "Z",
    ].join(" ");
  };

  const setCoverTransform = (translateYPercent) => {
    previewTransitionCover.style.transform = `translate3d(0, ${translateYPercent}%, 0)`;
  };

  const setCoverPath = (d) => {
    if (!previewTransitionPath) {
      return;
    }

    previewTransitionPath.setAttribute("d", d);
    previewTransitionPath.setAttribute("fill", COVER_COLOR);
  };

  const resetPreviewCardAnimation = () => {
    previewCard.style.transform = "";
    previewCard.style.opacity = "";
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

  const playCoverTransition = () =>
    new Promise((resolve) => {
      if (coverRafId) {
        window.cancelAnimationFrame(coverRafId);
      }

      isCoverTransitionRunning = true;
      previewTransitionCover.hidden = false;
      previewTransitionCover.classList.add("is-active");
      setCoverTransform(100);
      setCoverPath(buildTopBlobPath(0));
      resetPreviewCardAnimation();

      const transitionStart = window.performance.now();
      const totalDuration = COVER_IN_DURATION_MS + COVER_HOLD_DURATION_MS + COVER_OUT_DURATION_MS;
      const coverOutStart = COVER_IN_DURATION_MS + COVER_HOLD_DURATION_MS;
      const coverOutMorphEnd = coverOutStart + COVER_OUT_MORPH_DURATION_MS;
      let previewActivated = false;

      const finish = () => {
        coverRafId = 0;
        previewTransitionCover.classList.remove("is-active");
        previewTransitionCover.hidden = true;
        setCoverTransform(COVER_EXIT_Y_PERCENT);
        setCoverPath(buildTopBlobPath(0));
        previewCard.style.transform = "translate3d(0, 0, 0)";
        previewCard.style.opacity = "1";
        isCoverTransitionRunning = false;
        resolve();
      };

      const tick = (now) => {
        const elapsed = now - transitionStart;
        let coverTranslateY = COVER_EXIT_Y_PERCENT;

        if (elapsed <= COVER_IN_DURATION_MS) {
          const progress = easeCoverEnter(elapsed / COVER_IN_DURATION_MS);
          coverTranslateY = lerp(100, 0, progress);
        } else if (elapsed <= coverOutStart) {
          coverTranslateY = 0;
        } else if (elapsed <= totalDuration) {
          const progress = easeCoverLeave((elapsed - coverOutStart) / COVER_OUT_DURATION_MS);
          coverTranslateY = lerp(0, COVER_EXIT_Y_PERCENT, progress);
        }

        setCoverTransform(coverTranslateY);

        if (elapsed <= COVER_IN_MORPH_DURATION_MS) {
          const localProgress = clamp(elapsed / COVER_IN_MORPH_DURATION_MS);
          const yoyoProgress = localProgress <= 0.5 ? localProgress * 2 : (1 - localProgress) * 2;
          setCoverPath(buildTopBlobPath(easeCoverEnter(yoyoProgress)));
        } else if (elapsed >= coverOutStart && elapsed <= coverOutMorphEnd) {
          const localProgress = clamp((elapsed - coverOutStart) / COVER_OUT_MORPH_DURATION_MS);
          const yoyoProgress = localProgress <= 0.5 ? localProgress * 2 : (1 - localProgress) * 2;
          setCoverPath(buildBottomBlobPath(easeCoverLeave(yoyoProgress)));
        } else {
          setCoverPath(buildTopBlobPath(0));
        }

        if (!previewActivated && elapsed >= COVER_IN_DURATION_MS) {
          previewActivated = true;
          setPreviewOpen(true);
          previewCard.style.transform = "translate3d(0, 400px, 0)";
          previewCard.style.opacity = "0";
        }

        if (previewActivated) {
          const riseProgress = clamp((elapsed - COVER_IN_DURATION_MS) / PREVIEW_RISE_DURATION_MS);
          const easedRise = easePreviewRise(riseProgress);
          previewCard.style.transform = `translate3d(0, ${formatNumber(lerp(400, 0, easedRise))}px, 0)`;
          previewCard.style.opacity = String(formatNumber(easedRise));
        }

        if (elapsed < totalDuration) {
          coverRafId = window.requestAnimationFrame(tick);
          return;
        }

        finish();
      };

      coverRafId = window.requestAnimationFrame(tick);
    });

  const openPreview = async () => {
    if (isPreviewOpen || isCoverTransitionRunning) {
      return;
    }

    syncPreviewCardStyles();

    if (prefersReducedMotion.matches) {
      setPreviewOpen(true);
      previewCard.style.transform = "translate3d(0, 0, 0)";
      previewCard.style.opacity = "1";
      return;
    }

    await playCoverTransition();
  };

  const closePreview = () => {
    if (isCoverTransitionRunning) {
      return;
    }

    setPreviewOpen(false);
    resetPreviewCardAnimation();
  };

  previewOverlay.addEventListener("click", (event) => {
    if (event.target === previewOverlay || event.target === previewShell) {
      closePreview();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!isPreviewOpen || event.key !== "Escape") {
      return;
    }

    closePreview();
  });

  setCoverTransform(COVER_EXIT_Y_PERCENT);
  setCoverPath(buildTopBlobPath(0));

  const getHoverImageSrc = (src) => src.replace(/\.png$/i, "-hover.png");

  const cards = [
    {
      slug: "quattroformaggi",
      title: "Quattro Formaggi",
      description:
        "Una mezcla cremosa y poderosa de cuatro quesos italianos que se funden en cada bocado.",
      price: "RD$1,150.00",
    },
    {
      slug: "margherita",
      title: "Margherita",
      description:
        "La reina napolitana. Pomodoro San Marzano, mozzarella fresca y albahaca sobre masa madre.",
      price: "RD$600.00",
    },
    {
      slug: "sourdough-ciabatta",
      title: "Sourdough Ciabatta",
      description:
        "Pan de masa madre crujiente por fuera, suave por dentro. Ideal para compartir...",
      price: "RD$200.00",
    },
    {
      slug: "tiramisu",
      title: "Tiramisú",
      description:
        "Capas delicadas de café y mascarpone que se deshacen suavemente. El final perfecto, al estilo italiano.",
      price: "RD$350.00",
    },
    {
      slug: "diavola",
      title: "Diavola",
      description:
        "Salammino piccante y mozzarella fundida sobre pomodoro vibrante. Un delicioso toque picante.",
      price: "RD$850.00",
    },
    {
      slug: "bruschetta",
      title: "Bruschetta",
      description:
        "Pan tostado de masa madre con tomate fresco y pesto. Ligera, fresca y llena de sabor mediterráneo.",
      price: "RD$500.00",
    },
    {
      slug: "schiacciata-sandwich",
      title: "Schiacciata sándwich",
      description:
        "Crujiente, generosa y llena de carácter. Una combinación irresistible entre tradición y street food.",
      price: "RD$950.00",
    },
    {
      slug: "margherita-sbagliata",
      title: "Margherita Sbagliata",
      description:
        "La versión intensa de la clásica. Más sabor, más personalidad, más Figata.",
      price: "RD$750.00",
    },
  ];

  const fragment = document.createDocumentFragment();

  cards.forEach((card) => {
    const node = template.content.cloneNode(true);
    const article = node.querySelector(".mas-pedidas-card");
    const media = node.querySelector(".mas-pedidas-card__media");
    const baseImage = node.querySelector(".mas-pedidas-card__image--base");
    const hoverImage = node.querySelector(".mas-pedidas-card__image--hover");
    const title = node.querySelector(".mas-pedidas-card__title");
    const description = node.querySelector(".mas-pedidas-card__description");
    const price = node.querySelector(".mas-pedidas-card__price");
    const detailsButton = node.querySelector(".mas-pedidas-card__button");

    if (
      !article ||
      !media ||
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

    const imageSrc = card.slug ? `assets/${card.slug}.png` : "";

    if (imageSrc) {
      const hoverSrc = getHoverImageSrc(imageSrc);

      baseImage.src = imageSrc;
      baseImage.alt = card.title;
      baseImage.loading = "lazy";
      baseImage.addEventListener("error", () => {
        baseImage.hidden = true;
        hoverImage.hidden = true;
        article.classList.remove("has-hover-image");
        media.classList.add("is-empty");
      });

      hoverImage.src = hoverSrc;
      hoverImage.alt = "";
      hoverImage.loading = "lazy";
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
      baseImage.hidden = true;
      hoverImage.hidden = true;
      media.classList.add("is-empty");
    }

    detailsButton.addEventListener("click", () => {
      void openPreview();
    });

    fragment.appendChild(node);
  });

  grid.replaceChildren(fragment);
})();
