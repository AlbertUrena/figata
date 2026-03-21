(() => {
  const MENU_PATHNAME = "/menu/";
  const SESSION_KEY = "figata:route-transition";
  const MENU_ROUTE_FLAG = "menu-enter";
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

  const normalizePathname = (pathname) => pathname.replace(/\/+$/, "") || "/";

  const isMenuRouteTarget = (href) => {
    let targetUrl;

    try {
      targetUrl = new URL(href, window.location.href);
    } catch (_) {
      return false;
    }

    if (targetUrl.origin !== window.location.origin) {
      return false;
    }

    const currentPath = normalizePathname(window.location.pathname);
    const nextPath = normalizePathname(targetUrl.pathname);
    const menuPath = normalizePathname(MENU_PATHNAME);

    return nextPath === menuPath && currentPath !== menuPath;
  };

  const isNavbarMenuLink = (link) => {
    if (!(link instanceof HTMLAnchorElement)) {
      return false;
    }

    if (!link.closest(".navbar")) {
      return false;
    }

    return isMenuRouteTarget(link.href);
  };

  const markMenuRouteTransition = () => {
    if (!window.sessionStorage) {
      return;
    }

    window.sessionStorage.setItem(SESSION_KEY, MENU_ROUTE_FLAG);
  };

  const navigateTo = (url) => {
    window.location.href = url;
  };

  const playMenuRouteTransition = async (url) => {
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
          markMenuRouteTransition();
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

    if (!isNavbarMenuLink(link)) {
      return;
    }

    if (link.target && link.target !== "_self") {
      return;
    }

    event.preventDefault();
    playMenuRouteTransition(link.href);
  });

  window.addEventListener("pagehide", () => {
    transition.cancel();
  });
})();
