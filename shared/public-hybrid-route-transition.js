(() => {
  const ns = (window.FigataPublicHybridRouteTransition =
    window.FigataPublicHybridRouteTransition || {});
  const sharedState =
    ns.__sharedState ||
    (ns.__sharedState = {
      overlay: null,
      runtimePromise: null,
      styleInjected: false,
      transitionRunning: false,
    });
  const EXIT_DURATION_MS = 170;

  if (typeof ns.createBinder === 'function') {
    return;
  }

  ns.createBinder = (userConfig = {}) => {
    const publicPaths = window.FigataPublicPaths || null;
    const config = {
      clientBodyAttr: 'data-public-hybrid-active',
      clientMainAttr: 'data-public-hybrid-main',
      clientStateFlag: '__figataPublicHybridMounted',
      fallbackText: 'Sirviendo en breve…',
      handoffKey: 'figata:public-hybrid-transition',
      handoffKind: 'public-hybrid-route',
      lottieRuntimePath: 'js/nosotros-lottie-runtime.js',
      navFailsafeMs: 18000,
      preNavMinDurationMs: 560,
      reducedPreNavDurationMs: 120,
      resetFailsafeMs: 3600,
      styleId: 'figata-public-hybrid-route-style',
      ...userConfig,
    };

    if (!config.targetPath) {
      throw new Error('Hybrid route transition requires a targetPath.');
    }

    if (typeof config.preparePayload !== 'function') {
      throw new Error('Hybrid route transition requires a preparePayload callback.');
    }

    if (typeof config.mountPayload !== 'function') {
      throw new Error('Hybrid route transition requires a mountPayload callback.');
    }

    const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    const rawTargetPath = String(config.targetPath || '/').trim() || '/';
    const targetPathSeed = rawTargetPath.replace(/\/+$/, '') || '/';

    const payloadTasks = new Map();

    const toAbsoluteUrl = (value) =>
      publicPaths?.toAbsoluteUrl
        ? publicPaths.toAbsoluteUrl(value)
        : new URL(value, window.location.href).toString();

    const loadRuntime = () => {
      if (sharedState.runtimePromise) {
        return sharedState.runtimePromise;
      }

      sharedState.runtimePromise = import(toAbsoluteUrl(config.lottieRuntimePath)).catch(
        (error) => {
          sharedState.runtimePromise = null;
          throw error;
        }
      );

      return sharedState.runtimePromise;
    };

    const scrollToTargetUrl = (url) => {
      if (!(url instanceof URL) || !url.hash) {
        window.scrollTo(0, 0);
        return;
      }

      const targetId = decodeURIComponent(url.hash.slice(1));
      if (!targetId) {
        window.scrollTo(0, 0);
        return;
      }

      const targetElement =
        document.getElementById(targetId) ||
        document.querySelector(url.hash);

      if (!(targetElement instanceof HTMLElement)) {
        window.scrollTo(0, 0);
        return;
      }

      targetElement.scrollIntoView({
        block: 'start',
        behavior: reducedMotionMedia.matches ? 'auto' : 'instant',
      });
    };

    const normalizePathname = (pathname) => {
      const rawPath = String(pathname || '/').trim() || '/';
      const strippedPath = publicPaths?.stripSitePath
        ? publicPaths.stripSitePath(rawPath)
        : rawPath;
      const normalized = strippedPath.replace(/\/+$/, '') || '/';

      if (targetPathSeed !== '/' && normalized === `${targetPathSeed}/index.html`) {
        return targetPathSeed;
      }

      return normalized;
    };

    const targetPath = normalizePathname(targetPathSeed);

    const toUrl = (href) => {
      try {
        return new URL(href, window.location.href);
      } catch (_error) {
        return null;
      }
    };

    const isTargetUrl = (url) => {
      if (!(url instanceof URL) || url.origin !== window.location.origin) {
        return false;
      }

      return normalizePathname(url.pathname) === targetPath;
    };

    const isEligibleLink = (link) => {
      if (!(link instanceof HTMLAnchorElement)) {
        return false;
      }

      if (link.hasAttribute('download')) {
        return false;
      }

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) {
        return false;
      }

      if (link.target && link.target !== '_self') {
        return false;
      }

      const targetUrl = toUrl(link.href);
      if (!isTargetUrl(targetUrl)) {
        return false;
      }

      const currentPath = normalizePathname(window.location.pathname);
      if (currentPath === targetPath) {
        return false;
      }

      if (typeof config.isEligibleLink === 'function') {
        return Boolean(
          config.isEligibleLink(link, {
            currentPath,
            normalizePathname,
            publicPaths,
            targetPath,
            targetUrl,
          })
        );
      }

      return true;
    };

    const injectStyles = () => {
      if (sharedState.styleInjected || document.getElementById(config.styleId)) {
        sharedState.styleInjected = true;
        return;
      }

      const style = document.createElement('style');
      style.id = config.styleId;
      style.textContent = `
        .nosotros-route-loader {
          position: fixed;
          inset: 0;
          z-index: 2600;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background-color: var(--nosotros-loader-bg, #191919);
          background-image: none;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: none;
        }

        .nosotros-route-loader.is-active {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
          transition: none;
        }

        .nosotros-route-loader__core {
          position: relative;
          width: clamp(180px, 48vw, 280px);
          aspect-ratio: 1 / 1;
          min-width: 0;
        }

        .nosotros-route-loader__logo-slot {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nosotros-route-loader__player {
          width: 100%;
          height: 100%;
          display: block;
          pointer-events: none;
        }

        .nosotros-route-loader__player svg {
          width: 100%;
          height: 100%;
          display: block;
        }

        body[${config.clientBodyAttr}="true"] > :not(header.site-header):not(main[${config.clientMainAttr}]):not(.nosotros-route-loader):not(script) {
          display: none !important;
        }

        .nosotros-route-loader.is-exiting {
          opacity: 0;
          visibility: hidden;
          transition: opacity ${EXIT_DURATION_MS}ms ease, visibility 0ms linear ${EXIT_DURATION_MS}ms;
        }

        .nosotros-route-loader__fallback {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          max-width: min(72vw, 240px);
          color: rgba(242, 238, 231, 0.84);
          font-family: "Avenir Next", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
          font-size: 0.88rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          line-height: 1.35;
          text-align: center;
        }

        @media (prefers-reduced-motion: reduce) {
          .nosotros-route-loader.is-exiting {
            animation: none !important;
            transition-duration: 120ms !important;
          }
        }
      `;

      document.head.appendChild(style);
      sharedState.styleInjected = true;
    };

    const ensureOverlay = () => {
      injectStyles();

      if (sharedState.overlay instanceof HTMLElement && sharedState.overlay.isConnected) {
        return sharedState.overlay;
      }

      const existingOverlay = document.querySelector('[data-nosotros-route-loader]');
      if (existingOverlay instanceof HTMLElement) {
        if (!existingOverlay.querySelector('[data-nosotros-loader-logo-slot]')) {
          existingOverlay.innerHTML = `
            <div class="nosotros-route-loader__core">
              <div class="nosotros-route-loader__logo-slot" data-nosotros-loader-logo-slot></div>
            </div>
          `;
        }

        sharedState.overlay = existingOverlay;
        return sharedState.overlay;
      }

      sharedState.overlay = document.createElement('div');
      sharedState.overlay.className = 'nosotros-route-loader';
      sharedState.overlay.setAttribute('aria-hidden', 'true');
      sharedState.overlay.setAttribute('data-nosotros-route-loader', '');
      sharedState.overlay.innerHTML = `
        <div class="nosotros-route-loader__core">
          <div class="nosotros-route-loader__logo-slot" data-nosotros-loader-logo-slot></div>
        </div>
      `;

      document.body.appendChild(sharedState.overlay);
      return sharedState.overlay;
    };

    const clearPlayer = (slot) => {
      if (!(slot instanceof HTMLElement)) {
        return;
      }

      const activeAnimation = slot.__figataNosotrosLottieInstance;
      slot.__figataNosotrosLottieInstance = null;
      if (activeAnimation && typeof activeAnimation.destroy === 'function') {
        try {
          activeAnimation.destroy();
        } catch (_error) {
          // ignore stale animation cleanup failures
        }
      }

      slot.replaceChildren();
    };

    const showFallback = (slot) => {
      if (!(slot instanceof HTMLElement)) {
        return false;
      }

      const fallback = document.createElement('span');
      fallback.className = 'nosotros-route-loader__fallback';
      fallback.textContent = config.fallbackText;
      slot.replaceChildren(fallback);
      return true;
    };

    const capturePosterSvg = (slot) => {
      if (!(slot instanceof HTMLElement)) {
        return '';
      }

      const svg = slot.querySelector('svg');
      if (!(svg instanceof SVGElement)) {
        return '';
      }

      const markup = svg.outerHTML || '';
      if (!markup || markup.length > 250000) {
        return '';
      }

      return markup;
    };

    const markHandoff = (slot) => {
      try {
        const payload = {
          kind: config.handoffKind,
          at: Date.now(),
          fromPath: normalizePathname(window.location.pathname),
          posterSvg: capturePosterSvg(slot),
          toPath: targetPath,
          reducedMotion: Boolean(reducedMotionMedia.matches),
        };

        window.sessionStorage.setItem(config.handoffKey, JSON.stringify(payload));
      } catch (_error) {
        // ignore storage failures
      }
    };

    const clearHandoff = () => {
      try {
        window.sessionStorage.removeItem(config.handoffKey);
      } catch (_error) {
        // ignore storage failures
      }
    };

    const delay = (ms) =>
      new Promise((resolve) => {
        window.setTimeout(resolve, ms);
      });

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

    const toSiteValue = (value) => {
      const raw = String(value || '').trim();

      if (!raw) {
        return raw;
      }

      if (/^(?:https?:|mailto:|tel:|data:|blob:|\/\/)/i.test(raw) || raw.startsWith('#')) {
        return raw;
      }

      return publicPaths?.toSitePath ? publicPaths.toSitePath(raw) : raw;
    };

    const normalizeSrcset = (value) =>
      String(value || '')
        .split(',')
        .map((part) => {
          const trimmed = part.trim();
          if (!trimmed) {
            return '';
          }

          const [urlPart, ...descriptorParts] = trimmed.split(/\s+/);
          const descriptor = descriptorParts.join(' ');
          const normalizedUrl = toSiteValue(urlPart);
          return descriptor ? `${normalizedUrl} ${descriptor}` : normalizedUrl;
        })
        .filter(Boolean)
        .join(', ');

    const normalizeNodeUrls = (rootNode) => {
      if (!(rootNode instanceof HTMLElement)) {
        return;
      }

      rootNode.querySelectorAll('[href]').forEach((node) => {
        const href = node.getAttribute('href');
        if (href) {
          node.setAttribute('href', toSiteValue(href));
        }
      });

      rootNode.querySelectorAll('[src]').forEach((node) => {
        const src = node.getAttribute('src');
        if (src) {
          node.setAttribute('src', toSiteValue(src));
        }
      });

      rootNode.querySelectorAll('[srcset]').forEach((node) => {
        const srcset = node.getAttribute('srcset');
        if (srcset) {
          node.setAttribute('srcset', normalizeSrcset(srcset));
        }
      });
    };

    const ensureStylesheet = (path) =>
      new Promise((resolve) => {
        const href = toAbsoluteUrl(path);
        const existing = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).find(
          (link) => link.href === href
        );

        if (existing) {
          resolve(existing);
          return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.addEventListener('load', () => resolve(link), { once: true });
        link.addEventListener('error', () => resolve(link), { once: true });
        document.head.appendChild(link);
      });

    const preloadImage = (src) =>
      new Promise((resolve) => {
        const normalizedSrc = toSiteValue(src);
        if (!normalizedSrc) {
          resolve();
          return;
        }

        const image = new Image();
        let settled = false;
        const finish = () => {
          if (settled) {
            return;
          }

          settled = true;
          resolve();
        };

        image.addEventListener('load', finish, { once: true });
        image.addEventListener('error', finish, { once: true });
        image.src = normalizedSrc;

        window.setTimeout(finish, 4500);
      });

    const parseHtmlDocument = (html) => {
      const parser = new DOMParser();
      return parser.parseFromString(html, 'text/html');
    };

    const primeRuntime = () =>
      loadRuntime()
        .then((runtime) => runtime.ensureNosotrosLottieReady())
        .catch(() => {
          // keep fallback path silent during prewarm
        });

    const buildHelpers = (loader, targetUrl) => ({
      clearHandoff,
      clientBodyAttr: config.clientBodyAttr,
      clientMainAttr: config.clientMainAttr,
      clientStateFlag: config.clientStateFlag,
      config,
      ensureStylesheet,
      normalizeNodeUrls,
      normalizePathname,
      normalizeSrcset,
      overlay: loader,
      parseHtmlDocument,
      preloadImage,
      primeRuntime,
      publicPaths,
      targetPath,
      targetUrl,
      toAbsoluteUrl,
      toSiteValue,
      waitForFrames,
    });

    const mountPlayer = async (slot, reducedMotion, initialElapsedMs = 0) => {
      if (!(slot instanceof HTMLElement)) {
        return false;
      }

      if (reducedMotion) {
        return showFallback(slot);
      }

      try {
        const runtime = await loadRuntime();
        await runtime.mountNosotrosLottie(slot, {
          autoplay: true,
          initialElapsedMs,
          loop: true,
          speed: 1.5,
        });

        if (
          !(sharedState.overlay instanceof HTMLElement) ||
          !sharedState.overlay.classList.contains('is-active')
        ) {
          runtime.clearNosotrosLottie(slot);
          return false;
        }

        return true;
      } catch (_error) {
        return showFallback(slot);
      }
    };

    const preparePayloadTask = (url, loader) => {
      if (!(url instanceof URL)) {
        return Promise.reject(new Error('URL inválida para la transición híbrida.'));
      }

      const taskKey = url.toString();
      if (payloadTasks.has(taskKey)) {
        return payloadTasks.get(taskKey);
      }

      const task = Promise.resolve()
        .then(() => config.preparePayload(url, buildHelpers(loader, url)))
        .catch((error) => {
          payloadTasks.delete(taskKey);
          throw error;
        });

      payloadTasks.set(taskKey, task);
      return task;
    };

    const navigateTo = (url) => {
      window.location.href = url.toString();
    };

    const prefetchTarget = (url, loader) => {
      if (!(url instanceof URL)) {
        return Promise.resolve();
      }

      return Promise.allSettled([preparePayloadTask(url, loader), primeRuntime()]);
    };

    const runLeaveTransition = (url) => {
      if (sharedState.transitionRunning) {
        return;
      }

      sharedState.transitionRunning = true;

      const reducedMotion = reducedMotionMedia.matches;
      const minDelay = reducedMotion
        ? config.reducedPreNavDurationMs
        : config.preNavMinDurationMs;

      const loader = ensureOverlay();
      const logoSlot = loader.querySelector('[data-nosotros-loader-logo-slot]');

      loader.classList.remove('is-exiting');
      loader.classList.add('is-active');
      loader.setAttribute('aria-hidden', 'false');

      void mountPlayer(logoSlot, reducedMotion, 0).then(() => {
        markHandoff(logoSlot);
      });
      markHandoff(logoSlot);

      let hasFinished = false;

      const fallbackToHardNavigation = () => {
        if (hasFinished) {
          return;
        }

        hasFinished = true;
        markHandoff(logoSlot);
        navigateTo(url);
      };

      Promise.all([delay(minDelay), preparePayloadTask(url, loader)])
        .then(([, payload]) => config.mountPayload(payload, buildHelpers(loader, url)))
        .then(async () => {
          if (hasFinished) {
            return;
          }

          clearHandoff();
          const historyUrl = `${url.pathname}${url.search}${url.hash}`;
          window.history.pushState({ [config.clientStateFlag]: true }, '', historyUrl);
          window[config.clientStateFlag] = true;
          scrollToTargetUrl(url);
          window.dispatchEvent(new Event('resize'));
          await waitForFrames(2);

          if (hasFinished) {
            return;
          }

          hasFinished = true;
          loader.classList.add('is-exiting');
          loader.classList.remove('is-active');
          loader.setAttribute('aria-hidden', 'true');

          window.setTimeout(() => {
            clearPlayer(logoSlot);
            loader.classList.remove('is-exiting');
            sharedState.transitionRunning = false;
          }, EXIT_DURATION_MS + 40);
        })
        .catch(() => {
          fallbackToHardNavigation();
        });

      window.setTimeout(fallbackToHardNavigation, config.navFailsafeMs);

      window.setTimeout(() => {
        if (hasFinished) {
          return;
        }

        if (!(logoSlot instanceof HTMLElement)) {
          return;
        }

        if (
          logoSlot.querySelector(
            '.nosotros-route-loader__player, .nosotros-route-loader__fallback'
          )
        ) {
          return;
        }

        showFallback(logoSlot);
      }, config.resetFailsafeMs);
    };

    document.addEventListener('click', (event) => {
      if (event.defaultPrevented || sharedState.transitionRunning) {
        return;
      }

      if (event.button !== 0) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!isEligibleLink(link)) {
        return;
      }

      const targetUrl = toUrl(link.href);
      if (!(targetUrl instanceof URL)) {
        return;
      }

      event.preventDefault();
      runLeaveTransition(targetUrl);
    });

    window.addEventListener('popstate', () => {
      if (!window[config.clientStateFlag]) {
        return;
      }

      if (normalizePathname(window.location.pathname) === targetPath) {
        return;
      }

      window.location.replace(window.location.href);
    });

    return {
      prefetch: prefetchTarget,
      run: runLeaveTransition,
    };
  };
})();
