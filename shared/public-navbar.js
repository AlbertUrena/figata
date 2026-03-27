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
      return header && header.querySelector('.navbar') ? header : null;
    } catch (error) {
      return null;
    }
  };

  const cacheHeader = (header) => {
    if (!(header instanceof HTMLElement)) {
      return;
    }

    try {
      const snapshot = header.cloneNode(true);
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
    const header = parseHeaderFromHtml(html);

    if (!header || !header.querySelector('.navbar')) {
      throw new Error('[public-navbar] Header canonical no encontrado.');
    }

    return header;
  };

  const mountIntoHost = async (host) => {
    const shouldHideCta = host.hasAttribute('data-public-navbar-hide-cta');
    let sourceHeader = readCachedHeader();

    if (!sourceHeader) {
      sourceHeader = await fetchHomeHeader();
      cacheHeader(sourceHeader);
    }

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

    if (!currentHeader || !currentHeader.querySelector('.navbar')) {
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
