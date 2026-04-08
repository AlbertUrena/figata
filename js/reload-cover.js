(() => {
  const root = document.documentElement;
  const publicPaths = window.FigataPublicPaths || null;
  const sessionKey = "figata:route-transition";
  const legacyMenuRouteFlag = "menu-enter";
  const ROUTE_HANDOFF_KIND = "public-route";
  const COVER_OUT_DURATION_MS = 1000;
  const COVER_OUT_MORPH_DURATION_MS = 800;
  const PAGE_REVEAL_FROM_PX = 200;
  const STAGE_RISE_FROM_PX = 400;
  const STAGE_RISE_DURATION_MS = 1000;
  const SURFACE_SCALE_DURATION_MS = 1450;
  const SURFACE_INITIAL_SCALE = 0.88;
  const SURFACE_EASING = "cubic-bezier(0.215, 0.61, 0.355, 1)";
  const MAX_HANDOFF_AGE_MS = 12000;

  const normalizePathname = (pathname) => {
    const rawPath = String(pathname || "/").trim() || "/";
    const strippedPath =
      publicPaths?.stripSitePath
        ? publicPaths.stripSitePath(rawPath)
        : rawPath;
    return strippedPath.replace(/\/+$/, "") || "/";
  };

  const readRouteHandoff = () => {
    if (!window.sessionStorage) {
      return null;
    }

    const rawValue = window.sessionStorage.getItem(sessionKey);

    if (!rawValue) {
      return null;
    }

    window.sessionStorage.removeItem(sessionKey);

    if (rawValue === legacyMenuRouteFlag) {
      return {
        kind: ROUTE_HANDOFF_KIND,
        at: Date.now(),
        toPath: normalizePathname(window.location.pathname),
      };
    }

    try {
      const parsed = JSON.parse(rawValue);
      if (!parsed || parsed.kind !== ROUTE_HANDOFF_KIND) {
        return null;
      }

      const ageMs = Date.now() - Number(parsed.at || 0);
      const targetPath = normalizePathname(parsed.toPath || window.location.pathname);
      const currentPath = normalizePathname(window.location.pathname);

      if (ageMs < 0 || ageMs > MAX_HANDOFF_AGE_MS || targetPath !== currentPath) {
        return null;
      }

      return parsed;
    } catch (_error) {
      return null;
    }
  };

  const routeHandoff = readRouteHandoff();
  const hasRouteHandoff = Boolean(routeHandoff);
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const getStageTarget = (pageMain) => {
    if (!(pageMain instanceof HTMLElement)) {
      return null;
    }

    if (document.body?.classList.contains("menu-page-body")) {
      return document.querySelector(".menu-page-shell");
    }

    if (document.body?.classList.contains("eventos-page-body")) {
      return document.querySelector(".eventos-hero");
    }

    if (document.body?.classList.contains("home-page-body")) {
      return document.querySelector(".top-bg");
    }

    return pageMain.firstElementChild instanceof HTMLElement
      ? pageMain.firstElementChild
      : null;
  };

  const getSurfaceTarget = () => {
    if (document.body?.classList.contains("menu-page-body")) {
      return document.querySelector(".menu-page-intro");
    }

    if (document.body?.classList.contains("eventos-page-body")) {
      return document.querySelector(".eventos-hero__content");
    }

    if (document.body?.classList.contains("home-page-body")) {
      if ((window.innerWidth || root.clientWidth || 0) <= 820) {
        return document.querySelector(".hero-mobile-panel");
      }

      return document.querySelector(".hero__content");
    }

    return null;
  };

  const setStageReveal = (target, translateY, opacity) => {
    if (!(target instanceof HTMLElement)) {
      return;
    }

    target.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0)`;
    target.style.opacity = String(Math.max(0, Math.min(1, opacity)));
    target.style.willChange = "transform, opacity";
  };

  const resetStageReveal = (target) => {
    if (!(target instanceof HTMLElement)) {
      return;
    }

    target.style.transform = "";
    target.style.opacity = "";
    target.style.willChange = "";
  };

  const playSurfaceReveal = (target) => {
    if (
      !(target instanceof HTMLElement) ||
      prefersReducedMotion.matches ||
      typeof target.animate !== "function"
    ) {
      return null;
    }

    target.style.transformOrigin = "50% 50%";

    return target.animate(
      [
        { transform: `scale(${SURFACE_INITIAL_SCALE})` },
        { transform: "scale(1)" },
      ],
      {
        duration: SURFACE_SCALE_DURATION_MS,
        easing: SURFACE_EASING,
        fill: "forwards",
      }
    );
  };

  const resetSurfaceReveal = (target, animation) => {
    if (animation) {
      try {
        animation.cancel();
      } catch (_error) {
        // no-op
      }
    }

    if (!(target instanceof HTMLElement)) {
      return;
    }

    target.style.transform = "";
    target.style.transformOrigin = "";
  };

  const shouldRunReloadTransition = root.classList.contains("page-reload-transition");

  if (!shouldRunReloadTransition && !hasRouteHandoff) {
    return;
  }

  const cover = document.querySelector(".reload-transition-cover");
  const bgPath = cover?.querySelector(".reload-transition-cover__bg");
  const pagePushTarget = document.querySelector("main");
  const stageTarget = getStageTarget(pagePushTarget);
  const surfaceTarget = getSurfaceTarget();
  const transitionFactory = window.FigataTransitions?.createFigataTransition;

  if (
    !(cover instanceof HTMLElement) ||
    !(bgPath instanceof SVGPathElement) ||
    typeof transitionFactory !== "function"
  ) {
    root.classList.remove("page-reload-transition");
    return;
  }

  const transition = transitionFactory({
    coverElement: cover,
    pathElement: bgPath,
    pagePushTarget,
    color: "#143f2b",
    precision: 4,
  });

  let surfaceAnimation = null;

  const clearReloadState = () => {
    root.classList.remove("page-reload-transition");
    resetStageReveal(stageTarget);
    resetSurfaceReveal(surfaceTarget, surfaceAnimation);
    surfaceAnimation = null;
  };

  const startExit = () => {
    if (hasRouteHandoff) {
      setStageReveal(stageTarget, STAGE_RISE_FROM_PX, 0);
      surfaceAnimation = playSurfaceReveal(surfaceTarget);
    }

    transition
      .playExit({
        durationMs: COVER_OUT_DURATION_MS,
        morphDurationMs: COVER_OUT_MORPH_DURATION_MS,
        pagePushFrom: PAGE_REVEAL_FROM_PX,
        pagePushTo: 0,
        onTick: ({ elapsedMs, helpers, easings }) => {
          if (!hasRouteHandoff || !(stageTarget instanceof HTMLElement)) {
            return;
          }

          const revealProgress = helpers.clamp(elapsedMs / STAGE_RISE_DURATION_MS);
          const easedReveal = easings.rise(revealProgress);
          const nextTranslateY = helpers.lerp(STAGE_RISE_FROM_PX, 0, easedReveal);
          setStageReveal(stageTarget, nextTranslateY, easedReveal);
        },
        onComplete: clearReloadState,
      })
      .catch(() => {
        clearReloadState();
      });
  };

  if (hasRouteHandoff) {
    startExit();
    return;
  }

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(startExit);
  });
})();
