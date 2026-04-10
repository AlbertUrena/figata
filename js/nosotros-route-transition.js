(() => {
  const ROUTE_INIT_FLAG = '__figataNosotrosRouteTransitionInit';
  if (window[ROUTE_INIT_FLAG]) {
    return;
  }
  window[ROUTE_INIT_FLAG] = true;

  const hybridTransition = window.FigataPublicHybridRouteTransition || null;

  if (!hybridTransition || typeof hybridTransition.createBinder !== 'function') {
    return;
  }

  const CLIENT_MAIN_ATTR = 'data-nosotros-client-main';
  const CLIENT_BODY_ATTR = 'data-nosotros-client-active';
  const CLIENT_STATE_FLAG = '__figataNosotrosClientMounted';

  const revealNosotrosContent = (main) => {
    if (!(main instanceof HTMLElement)) {
      return;
    }

    const revealNodes = Array.from(main.querySelectorAll('[data-nosotros-reveal]'));
    if (revealNodes.length === 0) {
      return;
    }

    const firstRevealNode = revealNodes[0];
    if (firstRevealNode instanceof HTMLElement) {
      firstRevealNode.classList.add('is-visible');
    }

    revealNodes.slice(1).forEach((node) => {
      if (node instanceof HTMLElement) {
        node.classList.add('is-visible');
      }
    });
  };

  const refreshNavbar = async (header) => {
    const navbarApi = window.FigataPublicNavbar;

    if (!navbarApi) {
      return;
    }

    if (typeof navbarApi.ensureCanonicalHost === 'function') {
      try {
        await navbarApi.ensureCanonicalHost(header);
      } catch (_error) {
        // ignore navbar remount issues during route swap
      }
    }

    if (typeof navbarApi.refreshFromDom === 'function') {
      navbarApi.refreshFromDom();
    }
  };

  hybridTransition.createBinder({
    clientBodyAttr: CLIENT_BODY_ATTR,
    clientMainAttr: CLIENT_MAIN_ATTR,
    clientStateFlag: CLIENT_STATE_FLAG,
    criticalAssetPaths: [
      'nosotros/nosotros.css',
      'js/nosotros-lottie-runtime.js',
      'js/nosotros-entry-loader.js',
      'js/nosotros-page.js',
      'assets/lottie/lottie.min.js',
    ],
    fallbackText: 'Sirviendo en breve…',
    handoffKey: 'figata:nosotros-transition',
    handoffKind: 'nosotros-route',
    lottieRuntimePath: 'js/nosotros-lottie-runtime.js',
    styleId: 'nosotros-route-loader-style',
    targetPath: '/nosotros',
    preparePayload: async (url, helpers) => {
      const response = await window.fetch(url.toString(), {
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error(`No se pudo cargar /nosotros/ (${response.status}).`);
      }

      const html = await response.text();
      const doc = helpers.parseHtmlDocument(html);
      const header = doc.querySelector('header.site-header');
      const main = doc.querySelector('main.nosotros-main');

      if (!(header instanceof HTMLElement)) {
        throw new Error('No se pudo leer el header de /nosotros/.');
      }

      if (!(main instanceof HTMLElement)) {
        throw new Error('No se pudo leer el contenido principal de /nosotros/.');
      }

      helpers.normalizeNodeUrls(header);
      helpers.normalizeNodeUrls(main);

      const firstImageSrc = main.querySelector('img[src]')?.getAttribute('src') || '';

      await Promise.allSettled([
        helpers.ensureStylesheet('nosotros/nosotros.css'),
        helpers.primeRuntime(),
        helpers.preloadImage(firstImageSrc),
      ]);

      return {
        bodyClassName: doc.body?.className || 'nosotros-page-body',
        bodyMenuState: doc.body?.getAttribute('data-menu-mobile-nav') || 'closed',
        bodyNavThreshold: doc.body?.getAttribute('data-nav-collapse-threshold') || '420',
        description:
          doc.querySelector('meta[name="description"]')?.getAttribute('content') || '',
        header,
        htmlClassName: doc.documentElement?.className || 'nosotros-page-root',
        themeColor:
          doc.querySelector('meta[name="theme-color"]')?.getAttribute('content') || '#191919',
        main,
        title: doc.title || 'Nosotros | Figata Pizza & Wine',
      };
    },
    mountPayload: async (payload, helpers) => {
      if (
        !payload ||
        !(payload.header instanceof HTMLElement) ||
        !(payload.main instanceof HTMLElement)
      ) {
        throw new Error('Payload de /nosotros/ inválido.');
      }

      const importedHeader = document.importNode(payload.header, true);
      const importedMain = document.importNode(payload.main, true);
      const descriptionMeta =
        document.querySelector('meta[name="description"]') ||
        document.getElementById('meta-description');
      const themeMeta = document.querySelector('meta[name="theme-color"]');
      const overlayAnchor =
        helpers.overlay instanceof HTMLElement && helpers.overlay.parentNode === document.body
          ? helpers.overlay
          : null;

      importedMain.setAttribute(CLIENT_MAIN_ATTR, 'true');
      revealNosotrosContent(importedMain);

      document.documentElement.className = payload.htmlClassName;
      document.documentElement.classList.add('nav--collapsed');
      document.body.className = payload.bodyClassName;
      document.body.setAttribute('data-menu-mobile-nav', payload.bodyMenuState);
      document.body.setAttribute('data-nav-collapse-threshold', payload.bodyNavThreshold);
      document.body.setAttribute(CLIENT_BODY_ATTR, 'true');
      document.body.classList.remove('menu-mobile-nav-backdrop');

      if (descriptionMeta instanceof HTMLMetaElement && payload.description) {
        descriptionMeta.setAttribute('content', payload.description);
      }

      if (themeMeta instanceof HTMLMetaElement && payload.themeColor) {
        themeMeta.setAttribute('content', payload.themeColor);
      }

      document.title = payload.title;

      Array.from(document.body.children).forEach((node) => {
        if (node === overlayAnchor || node instanceof HTMLScriptElement) {
          return;
        }

        node.remove();
      });

      document.body.insertBefore(importedHeader, overlayAnchor);
      document.body.insertBefore(importedMain, overlayAnchor);

      await refreshNavbar(importedHeader);
      await helpers.waitForFrames(2);
      return importedMain;
    },
  });
})();
