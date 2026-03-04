(() => {
  const lazyImages = Array.from(
    document.querySelectorAll("img[data-home-lazy-src]")
  );

  if (lazyImages.length === 0) {
    return;
  }

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

  if (!("IntersectionObserver" in window)) {
    lazyImages.forEach(loadImage);
    return;
  }

  const observer = new IntersectionObserver(
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
      rootMargin: "240px 0px",
      threshold: 0.01,
    }
  );

  lazyImages.forEach((image) => {
    observer.observe(image);
  });
})();
