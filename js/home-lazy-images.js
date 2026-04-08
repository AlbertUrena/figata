(() => {
  const IMAGE_SELECTOR = "img[data-home-lazy-src]";
  const observedImages = new WeakSet();
  const lazyImages = Array.from(document.querySelectorAll(IMAGE_SELECTOR));

  const loadImage = (image) => {
    if (!(image instanceof HTMLImageElement)) {
      return;
    }

    if (image.dataset.homeLazyLoaded === "true") {
      return;
    }

    const source = image.getAttribute("data-home-lazy-src");

    if (!source) {
      return;
    }

    image.src = source;
    image.dataset.homeLazyLoaded = "true";
  };

  const observeImage = (image) => {
    if (!(image instanceof HTMLImageElement)) {
      return;
    }

    if (image.dataset.homeLazyLoaded === "true" || observedImages.has(image)) {
      return;
    }

    observedImages.add(image);

    if (!observer) {
      loadImage(image);
      return;
    }

    observer.observe(image);
  };

  let observer = null;
  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver(
      (entries, activeObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          loadImage(entry.target);
          activeObserver.unobserve(entry.target);
        });
      },
      {
        root: null,
        rootMargin: "220px 0px",
        threshold: 0.01,
      }
    );
  }

  lazyImages.forEach(observeImage);

  if ("MutationObserver" in window) {
    const mutationObserver = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) {
            return;
          }

          if (node.matches?.(IMAGE_SELECTOR)) {
            observeImage(node);
          }

          node.querySelectorAll?.(IMAGE_SELECTOR).forEach(observeImage);
        });
      });
    });

    mutationObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  window.FigataHomeLazyImages = {
    loadNow: loadImage,
    observe: observeImage,
  };
})();
