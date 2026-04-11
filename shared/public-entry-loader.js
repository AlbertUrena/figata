(() => {
  const INIT_FLAG = '__figataPublicEntryLoaderInit';
  if (window[INIT_FLAG]) {
    return;
  }
  window[INIT_FLAG] = true;

  const root = document.documentElement;
  const loader = document.querySelector('[data-public-entry-loader]');
  const publicPaths = window.FigataPublicPaths || null;
  const LOTTIE_RUNTIME_PATH = 'js/nosotros-lottie-runtime.js';
  const MIN_DURATION_MS = 1000;
  const EXIT_DURATION_MS = 170;
  const FALLBACK_TEXT = 'Sirviendo en breve…';
  const READY_SIGNAL_CONFIGS = {
    '/': [
      { eventName: 'figata:home-page-ready', target: 'window', timeoutMs: 7000 },
      { eventName: 'figata:home-featured-rendered', target: 'document', timeoutMs: 7000 },
    ],
    '/menu': [
      { eventName: 'figata:menu-catalog-lqip-ready', target: 'window', timeoutMs: 18000 },
    ],
    '/menu/detail': [
      { eventName: 'figata:menu-detail-ready', target: 'window', timeoutMs: 22000 },
    ],
    '/eventos': [{ eventName: 'figata:eventos-page-ready', target: 'window', timeoutMs: 6000 }],
    '/nosotros': [{ eventName: 'figata:nosotros-page-ready', target: 'window', timeoutMs: 5000 }],
  };
  const SKIP_LOAD_WAIT_PATHS = new Set(['/menu', '/menu/detail']);

  if (!(root instanceof HTMLElement) || !(loader instanceof HTMLElement)) {
    root?.classList.remove('public-entry-pending');
    return;
  }

  if (root.classList.contains('nosotros-entry-pending')) {
    return;
  }

  const logoSlot = loader.querySelector('[data-nosotros-loader-logo-slot]');
  const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
  let runtimePromise = null;
  let exiting = false;

  const normalizePathname = (pathname) => {
    const rawPath = String(pathname || '/').trim() || '/';
    const strippedPath =
      publicPaths?.stripSitePath ? publicPaths.stripSitePath(rawPath) : rawPath;
    const normalized = strippedPath.replace(/\/+$/, '') || '/';

    if (normalized === '/index.html') {
      return '/';
    }

    if (normalized === '/menu/index.html') {
      return '/menu';
    }

    if (normalized === '/eventos/index.html') {
      return '/eventos';
    }

    if (normalized === '/nosotros/index.html') {
      return '/nosotros';
    }

    return normalized;
  };

  const currentPath = normalizePathname(window.location.pathname);
  const readySignalPath =
    currentPath === '/menu'
      ? '/menu'
      : currentPath.startsWith('/menu/')
        ? '/menu/detail'
        : currentPath;

  const toModuleUrl = (value) =>
    publicPaths?.toAbsoluteUrl
      ? publicPaths.toAbsoluteUrl(value)
      : new URL(value, window.location.href).toString();

  const loadRuntime = () => {
    if (runtimePromise) {
      return runtimePromise;
    }

    runtimePromise = import(toModuleUrl(LOTTIE_RUNTIME_PATH)).catch((error) => {
      runtimePromise = null;
      throw error;
    });

    return runtimePromise;
  };

  const clearPlayer = () => {
    if (!(logoSlot instanceof HTMLElement)) {
      return;
    }

    const activeAnimation = logoSlot.__figataNosotrosLottieInstance;
    logoSlot.__figataNosotrosLottieInstance = null;

    if (activeAnimation && typeof activeAnimation.destroy === 'function') {
      try {
        activeAnimation.destroy();
      } catch (_error) {
        // ignore stale animation cleanup failures
      }
    }

    logoSlot.replaceChildren();
  };

  const showFallback = () => {
    if (!(logoSlot instanceof HTMLElement)) {
      return false;
    }

    if (
      logoSlot.querySelector(
        '.nosotros-route-loader__player, .nosotros-route-loader__fallback, .nosotros-route-loader__poster'
      )
    ) {
      return true;
    }

    const fallback = document.createElement('span');
    fallback.className = 'nosotros-route-loader__fallback';
    fallback.textContent = FALLBACK_TEXT;
    logoSlot.replaceChildren(fallback);
    return true;
  };

  const mountPlayer = async () => {
    if (!(logoSlot instanceof HTMLElement)) {
      return false;
    }

    if (reducedMotionMedia.matches) {
      showFallback();
      return true;
    }

    try {
      const runtime = await loadRuntime();
      await runtime.mountNosotrosLottie(logoSlot, {
        autoplay: true,
        initialElapsedMs: 0,
        loop: true,
        speed: 1.5,
      });

      if (!root.classList.contains('public-entry-pending')) {
        runtime.clearNosotrosLottie(logoSlot);
        return false;
      }

      return true;
    } catch (_error) {
      window.__figataPublicEntryLoaderError = String(_error && (_error.message || _error));
      showFallback();
      return false;
    }
  };

  const waitForLoad = () =>
    new Promise((resolve) => {
      if (document.readyState === 'complete') {
        resolve();
        return;
      }

      window.addEventListener('load', resolve, { once: true });
    });

  const waitForSignal = ({ eventName, target = 'window', timeoutMs = 4000 }) =>
    new Promise((resolve) => {
      if (!eventName) {
        resolve();
        return;
      }

      const eventTarget = target === 'document' ? document : window;
      let settled = false;

      const finish = () => {
        if (settled) {
          return;
        }

        settled = true;
        eventTarget.removeEventListener(eventName, finish);
        window.clearTimeout(timeoutId);
        resolve();
      };

      const timeoutId = window.setTimeout(finish, Math.max(0, Number(timeoutMs) || 0));
      eventTarget.addEventListener(eventName, finish, { once: true });
    });

  const waitForPageReady = async () => {
    const routeSignals = READY_SIGNAL_CONFIGS[readySignalPath] || [];
    const pendingTasks = routeSignals.map(waitForSignal);

    if (!SKIP_LOAD_WAIT_PATHS.has(readySignalPath)) {
      pendingTasks.unshift(waitForLoad());
    }

    await Promise.allSettled(pendingTasks);
  };

  const delay = (ms) =>
    new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });

  const completeExit = () => {
    clearPlayer();
    loader.classList.remove('is-active', 'is-exiting');
    loader.setAttribute('aria-hidden', 'true');
    root.classList.remove('public-entry-pending');
  };

  const startExit = () => {
    if (exiting) {
      return;
    }

    exiting = true;
    loader.classList.add('is-exiting');
    loader.classList.remove('is-active');
    loader.setAttribute('aria-hidden', 'true');
    window.setTimeout(completeExit, EXIT_DURATION_MS + 40);
  };

  loader.classList.remove('is-exiting');
  loader.classList.add('is-active');
  loader.setAttribute('aria-hidden', 'false');

  Promise.allSettled([mountPlayer(), waitForPageReady(), delay(MIN_DURATION_MS)]).then(
    startExit
  );
})();
