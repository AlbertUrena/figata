(() => {
  const INIT_FLAG = '__figataManagedPublicRouteTransitionInit';
  if (window[INIT_FLAG]) {
    return;
  }
  window[INIT_FLAG] = true;

  const hybridTransition = window.FigataPublicHybridRouteTransition || null;
  if (!hybridTransition || typeof hybridTransition.createBinder !== 'function') {
    return;
  }

  const publicPaths = window.FigataPublicPaths || null;
  const CLIENT_BODY_ATTR = 'data-public-route-client-active';
  const CLIENT_MAIN_ATTR = 'data-public-route-client-main';
  const CLIENT_STATE_FLAG = '__figataPublicRouteClientMounted';
  const OVERLAY_ATTR = 'data-nosotros-route-loader';
  const DYNAMIC_SCRIPT_ATTR = 'data-public-hybrid-dynamic-script';
  const SKIPPED_SCRIPT_PATHS = new Set([
    'shared/analytics-config.js',
    'shared/analytics-taxonomy.js',
    'shared/analytics-governance.js',
    'shared/analytics-contract.js',
    'shared/analytics-identity.js',
    'shared/analytics-attribution.js',
    'shared/analytics-internal.js',
    'shared/analytics-sdk.js',
    'shared/analytics-replay.js',
    'shared/public-analytics.js',
    'shared/public-hybrid-route-transition.js',
    'js/menu-route-transition.js',
    'js/nosotros-route-transition.js',
    'js/nosotros-entry-loader.js',
  ]);
  const PERSISTENT_SCRIPT_GUARDS = new Map([
    ['shared/public-paths.js', () => Boolean(window.FigataPublicPaths)],
    ['shared/analytics-config.js', () => Boolean(window.FigataAnalyticsConfig)],
    ['shared/analytics-taxonomy.js', () => Boolean(window.FigataAnalyticsTaxonomy)],
    ['shared/analytics-governance.js', () => Boolean(window.FigataAnalyticsGovernance)],
    ['shared/analytics-contract.js', () => Boolean(window.FigataAnalyticsContract)],
    ['shared/analytics-identity.js', () => Boolean(window.FigataAnalyticsIdentity)],
    ['shared/analytics-attribution.js', () => Boolean(window.FigataAnalyticsAttribution)],
    ['shared/analytics-internal.js', () => Boolean(window.FigataAnalyticsInternal)],
    ['shared/analytics-sdk.js', () => Boolean(window.FigataAnalyticsSDK)],
    ['shared/analytics-replay.js', () => Boolean(window.FigataAnalyticsReplay)],
    ['shared/public-analytics.js', () => Boolean(window.FigataPublicAnalytics)],
    [
      'shared/public-hybrid-route-transition.js',
      () => Boolean(window.FigataPublicHybridRouteTransition?.createBinder),
    ],
    ['js/menu-route-transition.js', () => Boolean(window[INIT_FLAG])],
    ['js/nosotros-route-transition.js', () => Boolean(window.__figataNosotrosRouteTransitionInit)],
    ['shared/public-navbar.js', () => Boolean(window.FigataPublicNavbar)],
    ['shared/public-scroll-indicator.js', () => Boolean(window.FigataScrollIndicators)],
  ]);
  const ROUTE_CONFIGS = [
    {
      criticalAssetPaths: [
        'js/public-burger-menu.js',
        'src/data/home.js',
        'src/data/home-featured.js',
        'src/data/restaurant.js',
        'js/home-lazy-images.js',
        'js/home-config.js',
        'js/home-featured.js',
      ],
      readySignals: [
        { eventName: 'figata:home-page-ready', target: 'window', timeoutMs: 7000 },
        { eventName: 'figata:home-featured-rendered', target: 'document', timeoutMs: 7000 },
      ],
      targetPath: '/',
    },
    {
      criticalAssetPaths: [
        'menu/menu-page.css',
        'shared/menu-traits.js',
        'shared/menu-allergens.js',
        'shared/menu-sensory.js',
        'src/data/media.js',
        'src/data/menu.js',
        'src/data/ingredients.js',
        'js/menu-page.js',
        'js/menu-page-navbar.js',
      ],
      readySignals: [
        { eventName: 'figata:menu-page-ready', target: 'window', timeoutMs: 8000 },
      ],
      targetPath: '/menu',
    },
    {
      criticalAssetPaths: ['eventos/eventos.css', 'js/eventos-page.js'],
      readySignals: [
        { eventName: 'figata:eventos-page-ready', target: 'window', timeoutMs: 6000 },
      ],
      targetPath: '/eventos',
    },
  ];

  const normalizeText = (value) => String(value || '').trim();

  const normalizePathname = (pathname) => {
    const rawPath = normalizeText(pathname) || '/';
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

    return normalized;
  };

  const toSiteValue = (value) => {
    const raw = normalizeText(value);

    if (!raw) {
      return raw;
    }

    if (/^(?:https?:|mailto:|tel:|data:|blob:|\/\/)/i.test(raw) || raw.startsWith('#')) {
      return raw;
    }

    return publicPaths?.toSitePath ? publicPaths.toSitePath(raw) : raw;
  };

  const normalizeAssetPath = (value) => {
    const raw = normalizeText(value);

    if (!raw) {
      return '';
    }

    try {
      if (/^(?:https?:)?\/\//i.test(raw)) {
        return normalizeAssetPath(new URL(raw, window.location.href).pathname);
      }
    } catch (_error) {
      // keep raw fallback below
    }

    const stripped =
      publicPaths?.stripSitePath ? publicPaths.stripSitePath(raw) : raw;

    return stripped.replace(/^(\.\/)+/, '').replace(/^\/+/, '');
  };

  const getRootChildren = (root) =>
    root instanceof HTMLElement ? Array.from(root.children) : [];

  const serializeAttributes = (element) =>
    element instanceof Element
      ? Array.from(element.attributes).map((attribute) => ({
          name: attribute.name,
          value: attribute.value,
        }))
      : [];

  const applySerializedAttributes = (element, attrs = []) => {
    if (!(element instanceof HTMLElement)) {
      return;
    }

    Array.from(element.attributes).forEach((attribute) => {
      element.removeAttribute(attribute.name);
    });

    attrs.forEach((attribute) => {
      if (!attribute?.name) {
        return;
      }

      element.setAttribute(attribute.name, attribute.value || '');
    });
  };

  const collectBodyNodes = (doc) =>
    getRootChildren(doc.body).filter((node) => {
      if (!(node instanceof HTMLElement)) {
        return false;
      }

      if (node.tagName === 'SCRIPT') {
        return false;
      }

      if (node.hasAttribute(OVERLAY_ATTR)) {
        return false;
      }

      return true;
    });

  const shouldSkipScript = (script) => {
    if (!(script instanceof HTMLScriptElement)) {
      return true;
    }

    const src = normalizeText(script.getAttribute('src'));
    if (src) {
      return SKIPPED_SCRIPT_PATHS.has(normalizePathname(src));
    }

    const code = normalizeText(script.textContent);
    if (!code) {
      return true;
    }

    return false;
  };

  const serializeScript = (script) => {
    if (!(script instanceof HTMLScriptElement) || shouldSkipScript(script)) {
      return null;
    }

    const src = normalizeText(script.getAttribute('src'));
    return {
      noModule: script.noModule,
      referrerPolicy: normalizeText(script.referrerPolicy),
      src: src ? toSiteValue(src) : '',
      textContent: src ? '' : script.textContent || '',
      type: normalizeText(script.type),
    };
  };

  const collectBodyScripts = (doc) =>
    getRootChildren(doc.body)
      .filter((node) => node instanceof HTMLScriptElement)
      .map(serializeScript)
      .filter(Boolean);

  const waitForSignal = (signal) =>
    new Promise((resolve) => {
      const eventName = normalizeText(signal?.eventName);
      const target =
        signal?.target === 'document'
          ? document
          : window;
      const timeoutMs = Number(signal?.timeoutMs) > 0 ? Number(signal.timeoutMs) : 5000;

      if (!eventName) {
        resolve();
        return;
      }

      let settled = false;
      let timerId = 0;

      const finish = () => {
        if (settled) {
          return;
        }

        settled = true;
        target.removeEventListener(eventName, handleEvent);
        if (timerId) {
          window.clearTimeout(timerId);
        }
        resolve();
      };

      const handleEvent = () => {
        finish();
      };

      target.addEventListener(eventName, handleEvent, { once: true });
      timerId = window.setTimeout(finish, timeoutMs);
    });

  const removeDynamicScripts = () => {
    document.querySelectorAll(`script[${DYNAMIC_SCRIPT_ATTR}]`).forEach((node) => {
      node.remove();
    });
  };

  const runScriptDescriptor = (descriptor, overlay) =>
    new Promise((resolve) => {
      if (descriptor.src) {
        const normalizedSrc = normalizeAssetPath(descriptor.src);
        const persistentGuard = PERSISTENT_SCRIPT_GUARDS.get(normalizedSrc);

        if (typeof persistentGuard === 'function' && persistentGuard()) {
          resolve();
          return;
        }
      }

      const script = document.createElement('script');
      const anchor =
        overlay instanceof HTMLElement && overlay.parentNode === document.body
          ? overlay
          : null;

      script.setAttribute(DYNAMIC_SCRIPT_ATTR, 'true');

      if (descriptor.type) {
        script.type = descriptor.type;
      }

      if (descriptor.noModule) {
        script.noModule = true;
      }

      if (descriptor.referrerPolicy) {
        script.referrerPolicy = descriptor.referrerPolicy;
      }

      if (descriptor.src) {
        script.async = false;
        script.src = descriptor.src;
        script.addEventListener('load', () => resolve(), { once: true });
        script.addEventListener('error', () => resolve(), { once: true });
      } else {
        script.textContent = descriptor.textContent || '';
      }

      document.body.insertBefore(script, anchor);

      if (!descriptor.src) {
        resolve();
      }
    });

  const runScriptsSequentially = async (descriptors, overlay) => {
    removeDynamicScripts();

    for (const descriptor of descriptors) {
      await runScriptDescriptor(descriptor, overlay);
    }
  };

  const notifyPersistentRuntimes = () => {
    document.dispatchEvent(new CustomEvent('figata:public-navbar-ready'));

    const scrollIndicators = window.FigataScrollIndicators || null;
    if (typeof scrollIndicators?.mountAll === 'function') {
      scrollIndicators.mountAll();
    }

    if (typeof scrollIndicators?.refresh === 'function') {
      scrollIndicators.refresh();
    }
  };

  const getInsertAnchor = (overlay) => {
    const firstScript = getRootChildren(document.body).find(
      (node) => node instanceof HTMLScriptElement
    );

    if (firstScript) {
      return firstScript;
    }

    return overlay instanceof HTMLElement ? overlay : null;
  };

  const replaceBodyScaffold = (nodes, overlay) => {
    getRootChildren(document.body).forEach((node) => {
      if (node === overlay || node instanceof HTMLScriptElement) {
        return;
      }

      node.remove();
    });

    const anchor = getInsertAnchor(overlay);

    nodes.forEach((node) => {
      const importedNode = document.importNode(node, true);
      document.body.insertBefore(importedNode, anchor);
    });
  };

  const syncDocumentMeta = (payload) => {
    applySerializedAttributes(document.documentElement, payload.htmlAttrs);
    applySerializedAttributes(document.body, payload.bodyAttrs);
    document.title = payload.title || document.title;

    const descriptionMeta =
      document.querySelector('meta[name="description"]') ||
      document.getElementById('meta-description');
    if (descriptionMeta instanceof HTMLMetaElement && payload.description) {
      descriptionMeta.setAttribute('content', payload.description);
    }

    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta instanceof HTMLMetaElement && payload.themeColor) {
      themeMeta.setAttribute('content', payload.themeColor);
    }
  };

  const refreshNavbar = async () => {
    const navbarApi = window.FigataPublicNavbar;

    if (!navbarApi) {
      return;
    }

    if (typeof navbarApi.ensureCanonicalHost === 'function') {
      try {
        await navbarApi.ensureCanonicalHost(document.querySelector('header.site-header'));
      } catch (_error) {
        // ignore navbar re-mount issues during route swap
      }
    }

    if (typeof navbarApi.refreshFromDom === 'function') {
      navbarApi.refreshFromDom();
    }
  };

  const buildBinder = ({ criticalAssetPaths, readySignals, targetPath }) => {
    hybridTransition.createBinder({
      clientBodyAttr: CLIENT_BODY_ATTR,
      clientMainAttr: CLIENT_MAIN_ATTR,
      clientStateFlag: CLIENT_STATE_FLAG,
      criticalAssetPaths,
      handoffKey: `figata:managed-route:${targetPath === '/' ? 'home' : targetPath.slice(1)}`,
      handoffKind: 'managed-public-route',
      targetPath,
      preparePayload: async (url, helpers) => {
        const response = await window.fetch(url.toString(), {
          credentials: 'same-origin',
        });

        if (!response.ok) {
          throw new Error(`No se pudo cargar ${targetPath} (${response.status}).`);
        }

        const html = await response.text();
        const doc = helpers.parseHtmlDocument(html);
        const bodyNodes = collectBodyNodes(doc);
        const scriptDescriptors = collectBodyScripts(doc);
        const stylesheets = Array.from(
          doc.querySelectorAll('link[rel="stylesheet"][href]')
        ).map((link) => toSiteValue(link.getAttribute('href')));
        const firstImageSrc = doc.body?.querySelector('img[src]')?.getAttribute('src') || '';

        await Promise.allSettled([
          ...stylesheets.map((href) => helpers.ensureStylesheet(href)),
          helpers.primeRuntime(),
          helpers.preloadImage(firstImageSrc),
        ]);

        return {
          bodyAttrs: serializeAttributes(doc.body),
          bodyNodes,
          description:
            doc.querySelector('meta[name="description"]')?.getAttribute('content') || '',
          htmlAttrs: serializeAttributes(doc.documentElement),
          readySignals,
          scriptDescriptors,
          themeColor:
            doc.querySelector('meta[name="theme-color"]')?.getAttribute('content') || '',
          title: doc.title || document.title,
        };
      },
      mountPayload: async (payload, helpers) => {
        if (!payload || !Array.isArray(payload.bodyNodes)) {
          throw new Error(`Payload inválido para ${targetPath}.`);
        }

        const readyPromise = Promise.all(payload.readySignals.map(waitForSignal));

        syncDocumentMeta(payload);
        replaceBodyScaffold(payload.bodyNodes, helpers.overlay);
        const mountedMain = document.querySelector('main');
        if (mountedMain instanceof HTMLElement) {
          mountedMain.setAttribute(CLIENT_MAIN_ATTR, 'true');
        }
        document.body.setAttribute(CLIENT_BODY_ATTR, 'true');
        document.body.classList.remove('menu-mobile-nav-backdrop');
        await refreshNavbar();
        await runScriptsSequentially(payload.scriptDescriptors, helpers.overlay);
        notifyPersistentRuntimes();
        await readyPromise;
        await helpers.waitForFrames(2);

        return document.querySelector('main');
      },
    });
  };

  ROUTE_CONFIGS.forEach(buildBinder);
})();
