(() => {
  const publicPaths = window.FigataPublicPaths || null;
  const SESSION_KEY = "figata:route-transition";
  const ROUTE_HANDOFF_KIND = "public-route";
  const COVER_IN_DURATION_MS = 900;
  const PAGE_PUSH_Y_PX = -200;

  const cover = document.querySelector(".reload-transition-cover");
  const coverPath = cover?.querySelector(".reload-transition-cover__bg");
  const pagePushTarget = document.querySelector("main");
  const transitionFactory = window.FigataTransitions?.createFigataTransition;

  if (
    !(cover instanceof HTMLElement) ||
    !(coverPath instanceof SVGPathElement) ||
    typeof transitionFactory !== "function"
  ) {
    return;
  }

  const transition = transitionFactory({
    coverElement: cover,
    pathElement: coverPath,
    pagePushTarget,
    color: "#143f2b",
    precision: 4,
  });

  let isTransitionRunning = false;

  const normalizePathname = (pathname) => {
    const rawPath = String(pathname || "/").trim() || "/";
    const strippedPath =
      publicPaths?.stripSitePath
        ? publicPaths.stripSitePath(rawPath)
        : rawPath;
    return strippedPath.replace(/\/+$/, "") || "/";
  };

  const getCurrentPath = () => normalizePathname(window.location.pathname);
  const isHomePath = (pathname) => {
    const normalized = normalizePathname(pathname);
    return normalized === "/" || normalized === "/index.html";
  };
  const isMenuPath = (pathname) => {
    const normalized = normalizePathname(pathname);
    return normalized === "/menu" || normalized.startsWith("/menu/");
  };
  const isEventosPath = (pathname) => {
    const normalized = normalizePathname(pathname);
    return normalized === "/eventos" || normalized.startsWith("/eventos/");
  };
  const isManagedPublicPath = (pathname) =>
    isHomePath(pathname) || isMenuPath(pathname) || isEventosPath(pathname);
  const toUrl = (href) => {
    try {
      return new URL(href, window.location.href);
    } catch (_) {
      return null;
    }
  };
  const isCrossRouteTarget = (url) => {
    if (!(url instanceof URL) || url.origin !== window.location.origin) {
      return false;
    }

    const currentPath = getCurrentPath();
    const nextPath = normalizePathname(url.pathname);

    if (currentPath === nextPath) {
      return false;
    }

    if (!isManagedPublicPath(currentPath) || !isManagedPublicPath(nextPath)) {
      return false;
    }

    return true;
  };

  const isManagedRouteLink = (link) => {
    if (!(link instanceof HTMLAnchorElement)) {
      return false;
    }

    if (link.hasAttribute("download")) {
      return false;
    }

    const href = link.getAttribute("href");
    if (!href || href.startsWith("#")) {
      return false;
    }

    if (link.target && link.target !== "_self") {
      return false;
    }

    const targetUrl = toUrl(link.href);
    return isCrossRouteTarget(targetUrl);
  };

  const markRouteTransition = (url) => {
    if (!window.sessionStorage) {
      return;
    }

    const targetUrl =
      url instanceof URL
        ? url
        : toUrl(url);

    if (!(targetUrl instanceof URL)) {
      return;
    }

    const payload = {
      kind: ROUTE_HANDOFF_KIND,
      at: Date.now(),
      fromPath: getCurrentPath(),
      toPath: normalizePathname(targetUrl.pathname),
    };

    try {
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
    } catch (_) {
      // Ignore storage write failures.
    }
  };

  const navigateTo = (url) => {
    window.location.href = url;
  };

  const playRouteTransition = async (url) => {
    if (isTransitionRunning) {
      return;
    }

    isTransitionRunning = true;

    try {
      await transition.playEnter({
        durationMs: COVER_IN_DURATION_MS,
        pagePushFrom: 0,
        pagePushTo: PAGE_PUSH_Y_PX,
        onMidpoint: () => {
          markRouteTransition(url);
          navigateTo(url);
        },
      });
    } catch (_) {
      navigateTo(url);
    } finally {
      isTransitionRunning = false;
    }
  };

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || isTransitionRunning) {
      return;
    }

    if (event.button !== 0) {
      return;
    }

    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const link = event.target instanceof Element ? event.target.closest("a[href]") : null;

    if (!isManagedRouteLink(link)) {
      return;
    }

    event.preventDefault();
    playRouteTransition(link.href);
  });

  window.addEventListener("pagehide", () => {
    transition.cancel();
  });
})();
