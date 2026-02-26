(() => {
  const root = document.documentElement;
  const hero = document.querySelector(".hero");
  const header = document.querySelector(".site-header");
  const navbar = document.querySelector(".navbar");
  const navInner = document.querySelector(".navbar__inner");
  const brand = document.querySelector(".navbar__brand");
  const brandIcon = document.querySelector(".navbar__brand-icon");
  const brandText = document.querySelector(".navbar__brand-text");
  const links = document.querySelector(".navbar__links");
  const actions = document.querySelector(".navbar__actions");

  if (!hero || !header || !navbar || !navInner) {
    return;
  }

  const COLLAPSED_CLASS = "nav--collapsed";
  const THRESHOLD_OFFSET = 462;
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let sentinel = null;
  let observer = null;
  let resizeObserver = null;
  let rafId = 0;
  let isCollapsed = root.classList.contains(COLLAPSED_CLASS);
  let prefersReducedMotion = motionQuery.matches;

  let progress = isCollapsed ? 1 : 0;
  let velocity = 0;
  let target = progress;
  let raf = 0;

  const STIFFNESS = 380;
  const DAMPING = 42;
  const MASS = 1;

  const setProgressCSSVars = (value) => {
    const safeValue = Math.max(0, Math.min(1, value));
    root.style.setProperty("--nav-collapse", safeValue.toFixed(4));
    root.style.setProperty("--nav-collapse-inv", (1 - safeValue).toFixed(4));
  };

  setProgressCSSVars(progress);

  const getBreakpointConfig = () => {
    const viewportWidth = window.innerWidth || root.clientWidth || 0;

    if (viewportWidth <= 520) {
      return {
        viewportWidth,
        gutter: 24,
        maxCollapsedWidth: 520,
        collapsedPadX: 14,
        collapsedGap: 10,
      };
    }

    if (viewportWidth <= 820) {
      return {
        viewportWidth,
        gutter: 28,
        maxCollapsedWidth: 620,
        collapsedPadX: 18,
        collapsedGap: 14,
      };
    }

    return {
      viewportWidth,
      gutter: 32,
      maxCollapsedWidth: Math.min(
        Math.max(760, viewportWidth * 0.78),
        980,
        Math.max(0, viewportWidth - 32)
      ),
      collapsedPadX: 26,
      collapsedGap: 24,
    };
  };

  const getElementWidth = (element) =>
    element ? Math.ceil(element.getBoundingClientRect().width) : 0;

  const getBrandContentWidth = () => {
    if (!brand) {
      return 0;
    }

    const iconWidth = getElementWidth(brandIcon);
    const textWidth = getElementWidth(brandText);
    const gap = Number.parseFloat(getComputedStyle(brand).columnGap) || 0;

    return Math.ceil(iconWidth + textWidth + gap);
  };

  const getInnerContentMinWidth = (config) => {
    const linksVisible = Boolean(links) && getComputedStyle(links).display !== "none";
    const linksWidth = linksVisible ? getElementWidth(links) : 0;
    const actionsWidth = getElementWidth(actions);
    const gapCount = 2;
    const paddingInline = config.collapsedPadX * 2;
    const columnGaps = config.collapsedGap * gapCount;

    return Math.ceil(
      getBrandContentWidth() + linksWidth + actionsWidth + paddingInline + columnGaps
    );
  };

  const syncNavWidthVars = () => {
    const config = getBreakpointConfig();
    const expandedWidth = Math.round(
      navbar.getBoundingClientRect().width || config.viewportWidth
    );
    const viewportBound = Math.max(0, config.viewportWidth - config.gutter);
    const intrinsicMin = getInnerContentMinWidth(config);

    let collapsedWidth = Math.min(config.maxCollapsedWidth, viewportBound);
    collapsedWidth = Math.max(collapsedWidth, intrinsicMin);
    collapsedWidth = Math.min(collapsedWidth, expandedWidth);

    root.style.setProperty("--nav-w-expanded", `${Math.max(0, expandedWidth)}px`);
    root.style.setProperty(
      "--nav-w-collapsed",
      `${Math.max(0, Math.round(collapsedWidth))}px`
    );
  };

  const getNavbarHeight = () => {
    const cssValue = Number.parseFloat(
      getComputedStyle(root).getPropertyValue("--navbar-height")
    );

    if (Number.isFinite(cssValue) && cssValue > 0) {
      return cssValue;
    }

    return header.getBoundingClientRect().height || header.offsetHeight || 76;
  };

  const ensureSentinel = () => {
    if (sentinel && sentinel.isConnected) {
      return sentinel;
    }

    sentinel = document.createElement("div");
    sentinel.dataset.navCollapseSentinel = "true";
    sentinel.setAttribute("aria-hidden", "true");
    sentinel.style.position = "absolute";
    sentinel.style.left = "0";
    sentinel.style.right = "0";
    sentinel.style.height = "1px";
    sentinel.style.pointerEvents = "none";

    hero.appendChild(sentinel);
    return sentinel;
  };

  const placeSentinel = () => {
    const el = ensureSentinel();
    const offset = Math.max(0, Math.round(getNavbarHeight() + THRESHOLD_OFFSET));

    el.style.bottom = `${offset}px`;
  };

  const setCollapsed = (collapsed) => {
    const next = Boolean(collapsed);

    if (next === isCollapsed) {
      return;
    }

    isCollapsed = next;
    syncNavWidthVars();
    root.classList.toggle(COLLAPSED_CLASS, next);
    animateTo(next);
  };

  function tick() {
    const dt = 1 / 60; // fijo, consistente
    const displacement = target - progress;
    const springForce = STIFFNESS * displacement;
    const dampingForce = -DAMPING * velocity;
    const accel = (springForce + dampingForce) / MASS;

    velocity += accel * dt;
    progress += velocity * dt;

    // Clamp seguro
    progress = Math.max(0, Math.min(1, progress));

    root.style.setProperty("--nav-collapse", progress.toFixed(4));
    root.style.setProperty("--nav-collapse-inv", (1 - progress).toFixed(4));

    const done =
      Math.abs(velocity) < 0.001 &&
      Math.abs(target - progress) < 0.001;

    if (done) {
      progress = target;
      velocity = 0;
      root.style.setProperty("--nav-collapse", String(target));
      root.style.setProperty("--nav-collapse-inv", String(1 - target));
      raf = 0;
      return;
    }

    raf = requestAnimationFrame(tick);
  }

  function animateTo(nextTarget) {
    target = nextTarget ? 1 : 0;

    if (prefersReducedMotion) {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }

      progress = target;
      velocity = 0;
      root.style.setProperty("--nav-collapse", String(target));
      root.style.setProperty("--nav-collapse-inv", String(1 - target));
      return;
    }

    if (!raf) raf = requestAnimationFrame(tick);
  }

  const shouldCollapse = () => {
    if (!sentinel) {
      return false;
    }

    const { top } = sentinel.getBoundingClientRect();
    return top <= 0;
  };

  const evaluate = () => {
    setCollapsed(shouldCollapse());
  };

  const scheduleEvaluate = () => {
    if (rafId) {
      return;
    }

    rafId = window.requestAnimationFrame(() => {
      rafId = 0;
      evaluate();
    });
  };

  const refresh = () => {
    syncNavWidthVars();
    placeSentinel();
    scheduleEvaluate();
  };

  const handleScroll = () => {
    scheduleEvaluate();
  };

  const handleResize = () => {
    refresh();
  };

  const startIntersectionObserver = () => {
    if (!("IntersectionObserver" in window)) {
      return false;
    }

    observer = new IntersectionObserver(() => {
      scheduleEvaluate();
    }, { threshold: [0, 1] });

    observer.observe(ensureSentinel());
    return true;
  };

  refresh();

  startIntersectionObserver();

  window.addEventListener("scroll", handleScroll, { passive: true });

  window.addEventListener("resize", handleResize, { passive: true });
  window.addEventListener("orientationchange", handleResize);

  const handleMotionChange = (event) => {
    prefersReducedMotion = event.matches;

    if (prefersReducedMotion) {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }

      progress = target;
      velocity = 0;
      root.style.setProperty("--nav-collapse", String(target));
      root.style.setProperty("--nav-collapse-inv", String(1 - target));
      return;
    }

    if (Math.abs(target - progress) > 0.001 || Math.abs(velocity) > 0.001) {
      animateTo(target === 1);
    }
  };

  if (typeof motionQuery.addEventListener === "function") {
    motionQuery.addEventListener("change", handleMotionChange);
  } else if (typeof motionQuery.addListener === "function") {
    motionQuery.addListener(handleMotionChange);
  }

  if ("ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(() => {
      refresh();
    });

    resizeObserver.observe(hero);
  }

  if (document.fonts && typeof document.fonts.ready?.then === "function") {
    document.fonts.ready.then(() => {
      refresh();
    });
  }
})();
