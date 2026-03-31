(() => {
  const root = document.documentElement;

  if (!(root instanceof HTMLElement)) {
    return;
  }

  try {
    if (window.matchMedia && window.matchMedia('(max-width: 820px)').matches) {
      root.classList.add('nav--collapsed');
    }
  } catch (_error) {
    // Ignore early viewport detection failures.
  }
})();
