(() => {
  const ENTRY_INIT_FLAG = '__figataNosotrosEntryLoaderInit';
  if (window[ENTRY_INIT_FLAG]) {
    return;
  }
  window[ENTRY_INIT_FLAG] = true;

  const publicPaths = window.FigataPublicPaths || null;
  const HANDOFF_KEY = 'figata:nosotros-transition';
  const HANDOFF_KIND = 'nosotros-route';
  const TARGET_PATH = '/nosotros';
  const MAX_HANDOFF_AGE_MS = 12000;
  const MIN_DURATION_MS = 2800;
  const REDUCED_MIN_DURATION_MS = 480;
  const EXIT_DURATION_MS = 170;
  const FALLBACK_TEXT = 'Sirviendo en breve…';
  const LOTTIE_RUNTIME_PATH = 'js/nosotros-lottie-runtime.js';
  const READY_EVENT = 'figata:nosotros-page-ready';

  const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const loader = document.getElementById('nosotros-entry-loader');

  if (!(loader instanceof HTMLElement)) {
    root.classList.remove('nosotros-entry-pending');
    return;
  }

  const logoSlot = loader.querySelector('[data-nosotros-loader-logo-slot]');
  let runtimePromise = null;

  const toModuleUrl = (value) =>
    publicPaths?.toAbsoluteUrl ? publicPaths.toAbsoluteUrl(value) : new URL(value, window.location.href).toString();

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

  const normalizePathname = (pathname) => {
    const rawPath = String(pathname || '/').trim() || '/';
    const strippedPath =
      publicPaths?.stripSitePath ? publicPaths.stripSitePath(rawPath) : rawPath;
    const normalized = strippedPath.replace(/\/+$/, '') || '/';

    if (normalized === '/nosotros/index.html') {
      return TARGET_PATH;
    }

    return normalized;
  };

  const showFallback = () => {
    if (!(logoSlot instanceof HTMLElement)) {
      return;
    }

    if (logoSlot.querySelector('.nosotros-route-loader__poster')) {
      return;
    }

    const fallback = document.createElement('span');
    fallback.className = 'nosotros-route-loader__fallback';
    fallback.textContent = FALLBACK_TEXT;
    logoSlot.replaceChildren(fallback);
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

  const mountPlayer = async (reducedMotion, initialElapsedMs = 0) => {
    if (!(logoSlot instanceof HTMLElement)) {
      return false;
    }

    if (
      logoSlot.querySelector(
        '.nosotros-route-loader__player, .nosotros-route-loader__fallback, .nosotros-route-loader__poster'
      )
    ) {
      if (window.__figataNosotrosEntryVisualBoot && typeof window.__figataNosotrosEntryVisualBoot.then === 'function') {
        await window.__figataNosotrosEntryVisualBoot.catch(() => false);
      }
      return true;
    }

    if (reducedMotion) {
      showFallback();
      return true;
    }

    try {
      const runtime = await loadRuntime();
      await runtime.mountNosotrosLottie(logoSlot, {
        autoplay: true,
        initialElapsedMs,
        loop: true,
        speed: 1.5,
      });

      if (
        !root.classList.contains('nosotros-entry-pending') &&
        !root.classList.contains('nosotros-entry-active')
      ) {
        runtime.clearNosotrosLottie(logoSlot);
        return false;
      }

      return true;
    } catch (_error) {
      window.__figataNosotrosEntryVisualBootError = String(
        _error && (_error.message || _error)
      );
      showFallback();
      return false;
    }
  };

  const waitForFrames = (count = 2) =>
    new Promise((resolve) => {
      const step = (remaining) => {
        if (remaining <= 0) {
          resolve();
          return;
        }

        window.requestAnimationFrame(() => step(remaining - 1));
      };

      step(count);
    });

  const ensurePrimaryContentVisible = () => {
    const firstRevealNode = document.querySelector('[data-nosotros-reveal]');
    if (firstRevealNode instanceof HTMLElement) {
      firstRevealNode.classList.add('is-visible');
    }
  };

  const waitForPageReady = () =>
    new Promise((resolve) => {
      let settled = false;

      const finish = () => {
        if (settled) {
          return;
        }

        settled = true;
        window.removeEventListener(READY_EVENT, handleReadyEvent);
        document.removeEventListener('DOMContentLoaded', handleDomReady);
        ensurePrimaryContentVisible();
        void waitForFrames(2).then(resolve);
      };

      const handleReadyEvent = () => {
        finish();
      };

      const handleDomReady = () => {
        if (document.querySelector('[data-nosotros-reveal].is-visible')) {
          finish();
          return;
        }

        finish();
      };

      if (document.querySelector('[data-nosotros-reveal].is-visible')) {
        finish();
        return;
      }

      window.addEventListener(READY_EVENT, handleReadyEvent, { once: true });

      if (document.readyState === 'complete') {
        handleDomReady();
        return;
      }

      document.addEventListener('DOMContentLoaded', handleDomReady, { once: true });
    });

  const readHandoff = () => {
    let raw = null;

    try {
      raw = window.sessionStorage.getItem(HANDOFF_KEY);
      if (!raw) {
        return null;
      }

      window.sessionStorage.removeItem(HANDOFF_KEY);

      const payload = JSON.parse(raw);
      if (!payload || payload.kind !== HANDOFF_KIND) {
        return null;
      }

      const ageMs = Date.now() - Number(payload.at || 0);
      if (ageMs < 0 || ageMs > MAX_HANDOFF_AGE_MS) {
        return null;
      }

      const currentPath = normalizePathname(window.location.pathname);
      const targetPath = normalizePathname(payload.toPath || TARGET_PATH);

      if (currentPath !== TARGET_PATH || targetPath !== TARGET_PATH) {
        return null;
      }

      return payload;
    } catch (_error) {
      try {
        if (raw) {
          window.sessionStorage.removeItem(HANDOFF_KEY);
        }
      } catch (_innerError) {
        // ignore
      }

      return null;
    }
  };

  const hardReset = () => {
    clearPlayer();
    loader.classList.remove('is-active', 'is-entering', 'is-exiting');
    loader.setAttribute('aria-hidden', 'true');
    root.classList.remove('nosotros-entry-pending', 'nosotros-entry-active');
  };

  const handoff = readHandoff();

  if (!handoff) {
    hardReset();
    return;
  }

  const reducedMotion =
    reducedMotionMedia.matches ||
    Boolean(window.__figataNosotrosEntryReducedMotion) ||
    Boolean(handoff.reducedMotion);
  const minDuration = reducedMotion ? REDUCED_MIN_DURATION_MS : MIN_DURATION_MS;
  const revealElapsedMs = Math.max(0, Date.now() - Number(handoff.at || Date.now()));

  let exiting = false;
  const startedAt = window.performance.now();

  root.classList.add('nosotros-entry-active');

  loader.classList.remove('is-exiting');
  loader.classList.add('is-active', 'is-entering');
  loader.setAttribute('aria-hidden', 'false');

  const visualBootTask =
    window.__figataNosotrosEntryVisualBoot && typeof window.__figataNosotrosEntryVisualBoot.then === 'function'
      ? window.__figataNosotrosEntryVisualBoot.catch(() => false)
      : mountPlayer(reducedMotion, revealElapsedMs);

  const completeExit = () => {
    clearPlayer();
    loader.classList.remove('is-active', 'is-entering', 'is-exiting');
    loader.setAttribute('aria-hidden', 'true');
    root.classList.remove('nosotros-entry-pending', 'nosotros-entry-active');
  };

  const startExit = () => {
    if (exiting) {
      return;
    }

    exiting = true;
    loader.classList.add('is-exiting');
    loader.classList.remove('is-entering');

    window.setTimeout(completeExit, EXIT_DURATION_MS + 70);
  };

  const maybeExit = () => {
    if (exiting) {
      return;
    }

    const elapsed = window.performance.now() - startedAt;
    if (elapsed < minDuration) {
      return;
    }

    startExit();
  };

  Promise.allSettled([
    visualBootTask,
    waitForPageReady(),
    new Promise((resolve) => {
      window.setTimeout(resolve, minDuration);
    }),
  ]).then(maybeExit);
})();
