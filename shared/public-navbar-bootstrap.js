(() => {
  const root = document.documentElement;
  const ENTRY_STYLE_ID = 'figata-public-entry-bootstrap-style';

  if (!(root instanceof HTMLElement)) {
    return;
  }

  root.classList.add('public-entry-pending');

  if (!document.getElementById(ENTRY_STYLE_ID)) {
    const style = document.createElement('style');
    style.id = ENTRY_STYLE_ID;
    style.textContent = `
      html.public-entry-pending,
      html.public-entry-pending body,
      html.nosotros-entry-pending,
      html.nosotros-entry-pending body {
        overflow: hidden;
      }

      [data-public-entry-loader].nosotros-route-loader {
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

      html.public-entry-pending [data-public-entry-loader].nosotros-route-loader,
      html.nosotros-entry-pending [data-public-entry-loader].nosotros-route-loader,
      [data-public-entry-loader].nosotros-route-loader.is-active {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        transition: none;
      }

      [data-public-entry-loader].nosotros-route-loader.is-exiting {
        opacity: 0;
        visibility: hidden;
        transition: opacity 170ms ease, visibility 0ms linear 170ms;
      }

      [data-public-entry-loader] .nosotros-route-loader__core {
        position: relative;
        width: clamp(180px, 48vw, 280px);
        aspect-ratio: 1 / 1;
        min-width: 0;
      }

      [data-public-entry-loader] .nosotros-route-loader__logo-slot {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      [data-public-entry-loader] .nosotros-route-loader__player,
      [data-public-entry-loader] .nosotros-route-loader__poster {
        width: 100%;
        height: 100%;
        display: block;
        pointer-events: none;
      }

      [data-public-entry-loader] .nosotros-route-loader__player svg,
      [data-public-entry-loader] .nosotros-route-loader__poster svg {
        width: 100%;
        height: 100%;
        display: block;
      }

      [data-public-entry-loader] .nosotros-route-loader__fallback {
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
    `;
    document.head.appendChild(style);
  }

  try {
    if (window.matchMedia && window.matchMedia('(max-width: 820px)').matches) {
      root.classList.add('nav--collapsed');
    }
  } catch (_error) {
    // Ignore early viewport detection failures.
  }
})();
