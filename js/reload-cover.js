(() => {
  const root = document.documentElement;
  const sessionKey = "figata:route-transition";
  const menuRouteFlag = "menu-enter";
  const hasRouteHandoff = window.sessionStorage?.getItem(sessionKey) === menuRouteFlag;

  if (hasRouteHandoff && window.sessionStorage) {
    window.sessionStorage.removeItem(sessionKey);
  }

  const shouldRunReloadTransition = root.classList.contains("page-reload-transition");

  if (!shouldRunReloadTransition && !hasRouteHandoff) {
    return;
  }

  const cover = document.querySelector(".reload-transition-cover");
  const bgPath = cover?.querySelector(".reload-transition-cover__bg");
  const pagePushTarget = document.querySelector("main");
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

  const clearReloadState = () => {
    root.classList.remove("page-reload-transition");
  };

  const startExit = () => {
    transition
      .playExit({
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
