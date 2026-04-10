(() => {
  const revealNodes = Array.from(document.querySelectorAll('[data-nosotros-reveal]'));
  const READY_EVENT = 'figata:nosotros-page-ready';
  const firstRevealNode = revealNodes[0] || null;
  let readyDispatched = false;

  if (revealNodes.length === 0) {
    window.dispatchEvent(new CustomEvent(READY_EVENT));
    return;
  }

  const dispatchReady = () => {
    if (readyDispatched) {
      return;
    }

    readyDispatched = true;
    window.dispatchEvent(new CustomEvent(READY_EVENT));
  };

  const revealNode = (node) => {
    if (!(node instanceof HTMLElement)) {
      return;
    }

    node.classList.add('is-visible');

    if (node === firstRevealNode) {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(dispatchReady);
      });
    }
  };

  const revealAll = () => {
    revealNodes.forEach((node) => {
      node.classList.add('is-visible');
    });
    dispatchReady();
  };

  if (!('IntersectionObserver' in window)) {
    revealAll();
    return;
  }

  revealNode(firstRevealNode);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        revealNode(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: '0px 0px -12% 0px',
      threshold: 0.2,
    }
  );

  revealNodes.forEach((node) => {
    if (node === firstRevealNode) {
      return;
    }

    observer.observe(node);
  });
})();
