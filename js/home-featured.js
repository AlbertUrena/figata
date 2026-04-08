(() => {
  const grid = document.getElementById('mas-pedidas-grid');
  const template = document.getElementById('mas-pedidas-card-template');
  const featuredApi = window.FigataData?.homeFeatured;
  const publicPaths = window.FigataPublicPaths || null;
  const DESKTOP_MEDIA = window.matchMedia('(min-width: 1024px)');
  const HOVER_MEDIA = window.matchMedia('(hover: hover) and (pointer: fine)');
  const PREVIEW_SCRIPT_ATTR = 'data-home-featured-preview-script';
  const HOME_FEATURED_LIMIT = 8;

  if (!grid || !(template instanceof HTMLTemplateElement) || !featuredApi?.getFeaturedItems) {
    return;
  }

  const formatPrice = (item) => {
    const numericPrice = Number(item?.price);
    if (Number.isFinite(numericPrice)) {
      return `$${Math.max(0, Math.round(numericPrice)).toLocaleString('es-DO')}`;
    }

    return String(item?.priceFormatted || '').trim();
  };

  const toSitePath = (value) => {
    const normalized = String(value || '').trim();

    if (!normalized) {
      return '';
    }

    if (/^(?:https?:|data:|blob:)/i.test(normalized)) {
      return normalized;
    }

    if (publicPaths?.toSitePath) {
      return publicPaths.toSitePath(normalized);
    }

    if (normalized.startsWith('/')) {
      return normalized;
    }

    return normalized;
  };

  const loadDesktopPreviewEnhancer = () => {
    if (!DESKTOP_MEDIA.matches) {
      return Promise.resolve();
    }

    if (window.FigataHomeFeatured?.previewEnhancerReady) {
      return Promise.resolve();
    }

    const existingScript = document.querySelector(`script[${PREVIEW_SCRIPT_ATTR}]`);
    if (existingScript) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = toSitePath('js/mas-pedidas.js');
      script.async = false;
      script.setAttribute(PREVIEW_SCRIPT_ATTR, 'true');
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('No se pudo cargar el preview desktop de home.'));
      document.body.appendChild(script);
    }).catch((error) => {
      console.error('[home-featured] No se pudo cargar el enhancer desktop.', error);
    });
  };

  const setBaseImage = (imageElement, item) => {
    if (!(imageElement instanceof HTMLImageElement) || !item.cardImage) {
      if (imageElement instanceof HTMLImageElement) {
        imageElement.hidden = true;
      }
      return;
    }

    imageElement.src = toSitePath(item.cardImage);
    imageElement.alt = item.imageAlt || item.title;
    imageElement.loading = 'lazy';
    imageElement.decoding = 'async';

    if (item.cardImageSrcSet) {
      imageElement.srcset = item.cardImageSrcSet
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry) => {
          const parts = entry.split(/\s+/);
          const path = parts.shift();
          return [toSitePath(path), parts.join(' ')].filter(Boolean).join(' ');
        })
        .join(', ');
    }

    if (item.cardImageSizes) {
      imageElement.sizes = item.cardImageSizes;
    }
  };

  const primeHoverImage = (article, hoverImageElement, item) => {
    if (
      !(article instanceof HTMLElement) ||
      !(hoverImageElement instanceof HTMLImageElement) ||
      !DESKTOP_MEDIA.matches ||
      !HOVER_MEDIA.matches ||
      !item.hoverImage
    ) {
      if (hoverImageElement instanceof HTMLImageElement) {
        hoverImageElement.remove();
      }
      return;
    }

    let primed = false;
    hoverImageElement.hidden = true;
    hoverImageElement.alt = '';
    hoverImageElement.loading = 'lazy';
    hoverImageElement.decoding = 'async';

    const revealHoverImage = () => {
      if (primed) {
        return;
      }

      primed = true;
      hoverImageElement.src = toSitePath(item.hoverImage);
      hoverImageElement.addEventListener(
        'load',
        () => {
          hoverImageElement.hidden = false;
          article.classList.add('has-hover-image');
        },
        { once: true }
      );
      hoverImageElement.addEventListener(
        'error',
        () => {
          hoverImageElement.hidden = true;
          article.classList.remove('has-hover-image');
        },
        { once: true }
      );
    };

    article.addEventListener('pointerenter', revealHoverImage, { once: true, passive: true });
    article.addEventListener('focusin', revealHoverImage, { once: true });
  };

  const buildFeaturedCard = (item, index, splitIndex, cardById) => {
    const node = template.content.cloneNode(true);
    const article = node.querySelector('.mas-pedidas-card');
    const mediaContainer = node.querySelector('.mas-pedidas-card__media');
    const baseImage = node.querySelector('.mas-pedidas-card__image--base');
    const hoverImage = node.querySelector('.mas-pedidas-card__image--hover');
    const title = node.querySelector('.mas-pedidas-card__title');
    const description = node.querySelector('.mas-pedidas-card__description');
    const price = node.querySelector('.mas-pedidas-card__price');
    const detailsButton = node.querySelector('.mas-pedidas-card__button');

    if (
      !(article instanceof HTMLElement) ||
      !(mediaContainer instanceof HTMLElement) ||
      !(baseImage instanceof HTMLImageElement) ||
      !(title instanceof HTMLElement) ||
      !(description instanceof HTMLElement) ||
      !(price instanceof HTMLElement)
    ) {
      return null;
    }

    article.dataset.cardId = item.id;
    article.classList.toggle('is-unavailable', item.available === false);
    title.textContent = item.title;
    description.textContent = item.description || '';
    price.textContent = formatPrice(item);

    if (!item.cardImage) {
      baseImage.hidden = true;
      mediaContainer.classList.add('is-empty');
      if (hoverImage instanceof HTMLImageElement) {
        hoverImage.remove();
      }
    } else {
      setBaseImage(baseImage, item);
      if (hoverImage instanceof HTMLImageElement) {
        primeHoverImage(article, hoverImage, item);
      }
    }

    if (DESKTOP_MEDIA.matches) {
      if (detailsButton instanceof HTMLButtonElement) {
        detailsButton.type = 'button';
        detailsButton.disabled = false;
        detailsButton.setAttribute('aria-label', `Ver detalles de ${item.title}`);
      }
    } else if (detailsButton instanceof HTMLButtonElement) {
      detailsButton.remove();
      if (hoverImage instanceof HTMLImageElement) {
        hoverImage.remove();
      }
    }

    cardById.set(item.id, item);
    return {
      targetRow: index < splitIndex ? 'top' : 'bottom',
      node,
    };
  };

  const renderFeaturedCards = async () => {
    let items = [];

    try {
      items = await featuredApi.getFeaturedItems();
    } catch (error) {
      console.error('[home-featured] No se pudo cargar home-featured.json.', error);
      return;
    }

    const featuredItems = items.slice(0, HOME_FEATURED_LIMIT);
    const cardById = new Map();
    const topRow = document.createElement('div');
    const bottomRow = document.createElement('div');
    const splitIndex = Math.ceil(featuredItems.length / 2);

    topRow.className = 'mas-pedidas__row mas-pedidas__row--top';
    bottomRow.className = 'mas-pedidas__row mas-pedidas__row--bottom';

    featuredItems.forEach((item, index) => {
      const builtCard = buildFeaturedCard(item, index, splitIndex, cardById);
      if (!builtCard) {
        return;
      }

      if (builtCard.targetRow === 'top') {
        topRow.appendChild(builtCard.node);
        return;
      }

      bottomRow.appendChild(builtCard.node);
    });

    topRow.hidden = topRow.childElementCount === 0;
    bottomRow.hidden = bottomRow.childElementCount === 0;
    grid.replaceChildren(topRow, bottomRow);

    window.FigataHomeFeatured = window.FigataHomeFeatured || {};
    window.FigataHomeFeatured.itemsById = cardById;
    window.FigataHomeFeatured.previewEnhancerReady = false;

    document.dispatchEvent(
      new CustomEvent('figata:home-featured-rendered', {
        detail: {
          count: cardById.size,
        },
      })
    );

    if (DESKTOP_MEDIA.matches) {
      await loadDesktopPreviewEnhancer();
    }
  };

  void renderFeaturedCards();
})();
