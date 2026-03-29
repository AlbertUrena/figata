(() => {
  const STORAGE_KEY = 'figata.public-navbar.v1';
  const publicPaths = window.FigataPublicPaths || null;
  let readyResolver = null;

  const readyPromise = new Promise((resolve) => {
    readyResolver = resolve;
  });

  const finishReady = () => {
    if (readyResolver) {
      readyResolver();
      readyResolver = null;
    }

    document.dispatchEvent(new CustomEvent('figata:public-navbar-ready'));
  };

  const isHomeRoute = () => {
    if (publicPaths?.isHomePath) {
      return publicPaths.isHomePath(window.location.pathname || '/');
    }

    const path = window.location.pathname || '/';
    return path === '/' || path === '/index.html';
  };

  const toSiteUrl = (value) => {
    const raw = String(value || '').trim();

    if (!raw) {
      return '';
    }

    if (/^(?:https?:|mailto:|tel:|data:|blob:)/i.test(raw)) {
      return raw;
    }

    if (raw.startsWith('#')) {
      return raw;
    }

    if (publicPaths?.toSitePath) {
      return publicPaths.toSitePath(raw);
    }

    if (raw.startsWith('/')) {
      return raw;
    }

    return `/${raw.replace(/^(\.\/)+/, '').replace(/^\/+/, '')}`;
  };

  const parseHeaderFromHtml = (html) => {
    if (typeof html !== 'string' || !html.trim()) {
      return null;
    }

    // Use an inert template tree to avoid triggering resource fetches while parsing.
    const template = document.createElement('template');
    template.innerHTML = html;
    return template.content.querySelector('header.site-header');
  };

  const copyAttributes = (source, target, { skip = [] } = {}) => {
    if (!(source instanceof HTMLElement) || !(target instanceof HTMLElement)) {
      return;
    }

    Array.from(source.attributes).forEach((attribute) => {
      if (skip.includes(attribute.name)) {
        return;
      }

      target.setAttribute(attribute.name, attribute.value);
    });
  };

  const hasChildWithClass = (parent, className) => {
    if (!(parent instanceof HTMLElement) || !className) {
      return false;
    }

    return Array.from(parent.children).some(
      (child) => child instanceof HTMLElement && child.classList.contains(className)
    );
  };

  const isCanonicalHeader = (header) => {
    if (!(header instanceof HTMLElement)) {
      return false;
    }

    const navbar = header.querySelector('.navbar');
    const navInner = navbar?.querySelector('.navbar__inner');

    if (!(navbar instanceof HTMLElement) || !(navInner instanceof HTMLElement)) {
      return false;
    }

    if (
      header.querySelector('.navbar__brand-slot') ||
      header.querySelector('.navbar__center-shell') ||
      header.querySelector('.navbar__menu-tools') ||
      header.querySelector('.navbar__mobile-actions') ||
      header.querySelector('.navbar__mobile-menu-panel') ||
      navbar.classList.contains('navbar--menu-route')
    ) {
      return false;
    }

    return (
      hasChildWithClass(navInner, 'navbar__brand') &&
      hasChildWithClass(navInner, 'navbar__links') &&
      hasChildWithClass(navInner, 'navbar__actions')
    );
  };

  const stripRouteVariantNodes = (node) => {
    if (!(node instanceof HTMLElement)) {
      return;
    }

    node.querySelectorAll(
      '.navbar__brand-slot, .navbar__center-shell, .navbar__menu-tools, .navbar__mobile-actions, .navbar__mobile-menu-panel, .navbar__menu-mode-toggle'
    ).forEach((routeNode) => {
      routeNode.remove();
    });

    node.querySelectorAll('[data-burger-state], [data-icon-type]').forEach((routeNode) => {
      routeNode.removeAttribute('data-burger-state');
      routeNode.removeAttribute('data-icon-type');
    });
  };

  const toCanonicalHeaderSnapshot = (header) => {
    if (!(header instanceof HTMLElement)) {
      return null;
    }

    if (isCanonicalHeader(header)) {
      const snapshot = header.cloneNode(true);
      snapshot.removeAttribute('data-public-navbar-host');
      snapshot.removeAttribute('data-public-navbar-mounted');
      snapshot.removeAttribute('data-eventos-burger-nav');
      snapshot.removeAttribute('data-eventos-burger-ready');
      snapshot.removeAttribute('data-menu-mobile-nav');
      return snapshot;
    }

    const sourceNavbar = header.querySelector('.navbar');
    const sourceNavInner = sourceNavbar?.querySelector('.navbar__inner');
    const sourceBrand = sourceNavInner?.querySelector('.navbar__brand');
    const sourceLinks = sourceNavInner?.querySelector('.navbar__links');
    const sourceActions = sourceNavInner?.querySelector('.navbar__actions');

    if (
      !(sourceNavbar instanceof HTMLElement) ||
      !(sourceNavInner instanceof HTMLElement) ||
      !(sourceBrand instanceof HTMLElement) ||
      !(sourceLinks instanceof HTMLElement) ||
      !(sourceActions instanceof HTMLElement)
    ) {
      return null;
    }

    const snapshot = document.createElement('header');
    copyAttributes(header, snapshot, {
      skip: [
        'data-public-navbar-host',
        'data-public-navbar-mounted',
        'data-eventos-burger-nav',
        'data-eventos-burger-ready',
        'data-menu-mobile-nav',
      ],
    });
    snapshot.className = 'site-header';

    const navbarClone = document.createElement(sourceNavbar.tagName.toLowerCase());
    copyAttributes(sourceNavbar, navbarClone, { skip: ['class'] });
    navbarClone.className = 'navbar';

    const navInnerClone = document.createElement(sourceNavInner.tagName.toLowerCase());
    copyAttributes(sourceNavInner, navInnerClone, { skip: ['class'] });
    navInnerClone.className = 'navbar__inner';

    const brandClone = sourceBrand.cloneNode(true);
    const linksClone = sourceLinks.cloneNode(true);
    const actionsClone = sourceActions.cloneNode(true);

    stripRouteVariantNodes(brandClone);
    stripRouteVariantNodes(linksClone);
    stripRouteVariantNodes(actionsClone);

    navInnerClone.append(brandClone, linksClone, actionsClone);
    navbarClone.appendChild(navInnerClone);
    snapshot.appendChild(navbarClone);

    return isCanonicalHeader(snapshot) ? snapshot : null;
  };

  const normalizeText = (value) => String(value || '').trim();

  const toNavbarHref = (value) => {
    const href = normalizeText(value);

    if (!href) {
      return '#';
    }

    if (isHomeRoute() || href.startsWith('#')) {
      return href;
    }

    return toSiteUrl(href);
  };

  const applyNavbarConfig = (header, navbarConfig) => {
    if (!(header instanceof HTMLElement)) {
      return;
    }

    const linksRoot = header.querySelector('.navbar__links');
    const cta = header.querySelector('.cta-button--nav');

    if (linksRoot) {
      const fallbackLinks = [
        { label: 'Menú', url: '/menu/' },
        { label: 'Eventos', url: '/eventos/' },
        { label: 'Nosotros', url: '#nosotros' },
        { label: 'Ubicación', url: '#ubicacion' },
        { label: 'Contacto', url: '#contacto' },
      ];

      const sourceLinks = Array.isArray(navbarConfig?.links)
        ? navbarConfig.links
        : [];

      const links = sourceLinks
        .map((entry) => ({
          label: normalizeText(entry?.label),
          url: normalizeText(entry?.url),
        }))
        .filter((entry) => entry.label || entry.url);

      const normalizedLinks = links.length > 0 ? links : fallbackLinks;
      linksRoot.replaceChildren();

      normalizedLinks.forEach((entry, index) => {
        const item = document.createElement('li');
        const anchor = document.createElement('a');
        anchor.textContent = entry.label || `Link ${index + 1}`;
        anchor.setAttribute('href', toNavbarHref(entry.url || '#'));
        item.appendChild(anchor);
        linksRoot.appendChild(item);
      });
    }

    if (!cta) {
      return;
    }

    const ctaLabelNode = cta.querySelector('span');
    const ctaLabel = normalizeText(navbarConfig?.cta?.label);
    const ctaTitle = normalizeText(
      navbarConfig?.cta?.title || navbarConfig?.cta?.label
    );
    const ctaIcon = normalizeText(navbarConfig?.cta?.icon);
    const ctaUrl = toNavbarHref(navbarConfig?.cta?.url || '#reservar');

    if (ctaLabelNode) {
      ctaLabelNode.textContent = ctaLabel;
    }

    cta.setAttribute('href', ctaUrl);

    if (ctaTitle) {
      cta.setAttribute('title', ctaTitle);
      cta.setAttribute('aria-label', ctaTitle);
    } else {
      cta.removeAttribute('title');
      cta.removeAttribute('aria-label');
    }

    const ctaIconNode = cta.querySelector('img');

    if (ctaIconNode && ctaIcon) {
      ctaIconNode.setAttribute('src', toSiteUrl(ctaIcon));
    }
  };

  const removeNavbarCta = (header) => {
    if (!(header instanceof HTMLElement)) {
      return;
    }

    const cta = header.querySelector('.cta-button--nav');

    if (cta instanceof HTMLElement) {
      cta.remove();
    }
  };

  const loadHomeNavbarConfig = async () => {
    const response = await fetch(
      publicPaths?.toAbsoluteUrl ? publicPaths.toAbsoluteUrl('data/home.json') : 'data/home.json',
      { cache: 'no-cache' }
    );

    if (!response.ok) {
      throw new Error(
        `[public-navbar] No se pudo cargar data/home.json (${response.status}).`
      );
    }

    const home = await response.json();
    return home?.navbar || null;
  };

  const normalizeSvgHref = (node, attributeName) => {
    const value = node.getAttribute(attributeName);

    if (!value || value.startsWith('#')) {
      return;
    }

    node.setAttribute(attributeName, toSiteUrl(value));
  };

  const normalizeMediaUrls = (header) => {
    if (!(header instanceof HTMLElement)) {
      return;
    }

    header.querySelectorAll('img[src]').forEach((image) => {
      const src = image.getAttribute('src');

      if (!src) {
        return;
      }

      image.setAttribute('src', toSiteUrl(src));
    });

    header.querySelectorAll('image[href], use[href]').forEach((svgNode) => {
      normalizeSvgHref(svgNode, 'href');
    });

    header.querySelectorAll('image[xlink\\:href], use[xlink\\:href]').forEach((svgNode) => {
      normalizeSvgHref(svgNode, 'xlink:href');
    });
  };

  const readCachedHeader = () => {
    try {
      const cached = window.localStorage.getItem(STORAGE_KEY);

      if (!cached) {
        return null;
      }

      const header = parseHeaderFromHtml(cached);
      const snapshot = toCanonicalHeaderSnapshot(header);

      if (!snapshot) {
        window.localStorage.removeItem(STORAGE_KEY);
      }

      return snapshot;
    } catch (error) {
      return null;
    }
  };

  const cacheHeader = (header) => {
    const snapshot = toCanonicalHeaderSnapshot(header);

    if (!(snapshot instanceof HTMLElement)) {
      return;
    }

    try {
      normalizeMediaUrls(snapshot);
      window.localStorage.setItem(STORAGE_KEY, snapshot.outerHTML);
    } catch (error) {
      // Ignore storage errors (private mode / disabled storage).
    }
  };

  const normalizeForRoute = (header) => {
    if (!(header instanceof HTMLElement) || isHomeRoute()) {
      return;
    }

    header.querySelectorAll('a[href]').forEach((link) => {
      const href = link.getAttribute('href');

      if (!href) {
        return;
      }

      link.setAttribute('href', toSiteUrl(href));
    });

    normalizeMediaUrls(header);
  };

  const importHeaderChildren = (host, sourceHeader) => {
    host.replaceChildren();

    Array.from(sourceHeader.childNodes).forEach((child) => {
      host.appendChild(document.importNode(child, true));
    });
  };

  const fetchHomeHeader = async () => {
    const response = await fetch(
      publicPaths?.toAbsoluteUrl ? publicPaths.toAbsoluteUrl('index.html') : 'index.html',
      { cache: 'no-cache' }
    );

    if (!response.ok) {
      throw new Error(
        `[public-navbar] No se pudo cargar index.html (${response.status}).`
      );
    }

    const html = await response.text();
    const header = toCanonicalHeaderSnapshot(parseHeaderFromHtml(html));

    if (!header || !isCanonicalHeader(header)) {
      throw new Error('[public-navbar] Header canonical no encontrado.');
    }

    return header;
  };

  const getCanonicalHeader = async ({ forceFresh = false } = {}) => {
    let sourceHeader = forceFresh ? null : readCachedHeader();

    if (!sourceHeader) {
      sourceHeader = await fetchHomeHeader();
      cacheHeader(sourceHeader);
    }

    const snapshot = toCanonicalHeaderSnapshot(sourceHeader);

    if (!snapshot) {
      throw new Error('[public-navbar] No se pudo reconstruir un header canónico.');
    }

    return snapshot;
  };

  const mountIntoHost = async (host) => {
    const shouldHideCta = host.hasAttribute('data-public-navbar-hide-cta');
    const sourceHeader = await getCanonicalHeader();

    normalizeForRoute(sourceHeader);
    importHeaderChildren(host, sourceHeader);

    try {
      const navbarConfig = await loadHomeNavbarConfig();

      if (navbarConfig) {
        applyNavbarConfig(host, navbarConfig);
      }
    } catch (error) {
      console.warn(error);
    }

    if (shouldHideCta) {
      removeNavbarCta(host);
    }

    host.removeAttribute('data-public-navbar-host');
  };

  const captureCanonicalHeader = () => {
    const currentHeader = document.querySelector('header.site-header');

    if (!currentHeader || !isCanonicalHeader(currentHeader)) {
      return;
    }

    cacheHeader(currentHeader);
  };

  const watchCanonicalHeader = () => {
    if (!isHomeRoute()) {
      return;
    }

    const currentHeader = document.querySelector('header.site-header');

    if (!currentHeader || !currentHeader.querySelector('.navbar')) {
      return;
    }

    const observer = new MutationObserver(() => {
      captureCanonicalHeader();
    });

    observer.observe(currentHeader, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['href', 'src', 'title', 'aria-label'],
    });
  };

  window.FigataPublicNavbar = {
    whenReady: () => readyPromise,
    isCanonicalHeader: (target) => {
      const candidate =
        target instanceof HTMLElement
          ? target
          : document.querySelector('header.site-header');
      return isCanonicalHeader(candidate);
    },
    ensureCanonicalHost: async (target) => {
      const host =
        target instanceof HTMLElement
          ? target
          : document.querySelector('header.site-header');

      if (!(host instanceof HTMLElement)) {
        return false;
      }

      if (isCanonicalHeader(host)) {
        return true;
      }

      await mountIntoHost(host);
      return isCanonicalHeader(host);
    },
    refreshFromDom: () => {
      captureCanonicalHeader();
    },
  };

  const host = document.querySelector('header.site-header[data-public-navbar-host]');

  if (!host) {
    captureCanonicalHeader();
    watchCanonicalHeader();
    finishReady();
    return;
  }

  host.setAttribute('aria-busy', 'true');

  mountIntoHost(host)
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
      host.removeAttribute('aria-busy');
      finishReady();
    });
})();
