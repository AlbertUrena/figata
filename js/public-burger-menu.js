(() => {
  const root = document.documentElement;
  const MOBILE_BREAKPOINT = 820;
  const MOBILE_MENU_PANEL_ID = "navbar-mobile-menu-panel";
  const MOBILE_MENU_CLOSE_COMMIT_MS = 460;
  const BURGER_ANIMATION_MS = 240;
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const MOBILE_MENU_ENTRY_BY_KEY = Object.freeze({
    menu: {
      subtitle: "Carta y favoritos",
      thumbSrc: "assets/navbar/menu-thumb.webp",
    },
    eventos: {
      subtitle: "Pizza Party by Figata",
      thumbSrc: "assets/eventos/thumb.webp",
      badgeLabel: "NEW",
    },
    nosotros: {
      subtitle: "Nuestra historia real",
      thumbSrc: "assets/navbar/nosotros-thumb.webp",
    },
    ubicacion: {
      subtitle: "Cómo llegar rápido",
      thumbSrc: "assets/navbar/ubicacion-thumb.webp",
    },
    contacto: {
      subtitle: "Reserva o escríbenos",
      thumbSrc: "assets/navbar/contacto-thumb.webp",
    },
  });
  const BURGER_LINE_GEOMETRY = Object.freeze({
    top: Object.freeze({
      closed: Object.freeze({ x1: 7, y1: 15, x2: 58, y2: 15 }),
      open: Object.freeze({ x1: 14.469, y1: 13.969, x2: 50.531, y2: 50.031 }),
    }),
    mid: Object.freeze({
      closed: Object.freeze({ x1: 7, y1: 32, x2: 50, y2: 32 }),
      open: Object.freeze({ x1: 28.5, y1: 32, x2: 28.5, y2: 32 }),
    }),
    bot: Object.freeze({
      closed: Object.freeze({ x1: 7, y1: 49, x2: 58, y2: 49 }),
      open: Object.freeze({ x1: 14.469, y1: 50.031, x2: 50.531, y2: 13.969 }),
    }),
  });

  const refs = {
    header: null,
    navbar: null,
    navInner: null,
    brand: null,
    links: null,
    actions: null,
    mobileMenuButton: null,
    mobileMenuPanel: null,
    mobileMenuLinks: [],
  };

  const state = {
    mobileMenuOpen: false,
    mobileMenuCloseCommitTimerId: 0,
    burgerAnimationFrameId: 0,
    burgerAnimationProgress: 0,
  };

  const normalizeText = (value) => String(value || "").trim();
  const toLookupKey = (value) =>
    normalizeText(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  const clamp01 = (value) => Math.min(1, Math.max(0, value));
  const lerp = (start, end, progress) => start + (end - start) * progress;
  const easeInOutCubic = (value) =>
    value < 0.5
      ? 4 * value * value * value
      : 1 - Math.pow(-2 * value + 2, 3) / 2;
  const isMobileViewport = () =>
    (window.innerWidth || root.clientWidth || 0) <= MOBILE_BREAKPOINT;

  const formatBurgerCoord = (value) => {
    const rounded = Math.abs(value) < 0.0005 ? 0 : value;
    return Number(rounded.toFixed(3)).toString();
  };

  const buildBurgerPath = ({ x1, y1, x2, y2 }) =>
    `M${formatBurgerCoord(x1)} ${formatBurgerCoord(y1)}L${formatBurgerCoord(x2)} ${formatBurgerCoord(y2)}`;

  const interpolateBurgerLine = (from, to, progress) => ({
    x1: lerp(from.x1, to.x1, progress),
    y1: lerp(from.y1, to.y1, progress),
    x2: lerp(from.x2, to.x2, progress),
    y2: lerp(from.y2, to.y2, progress),
  });

  const iconMarkup = (type) => {
    if (type === "chevron-card") {
      return `
        <svg viewBox="0 0 9 14" focusable="false" aria-hidden="true">
          <path d="M1.2 1.2L6.9 7L1.2 12.8" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
      `;
    }

    return `
      <svg class="navbar__burger-icon" viewBox="0 0 64 64" focusable="false" aria-hidden="true">
        <path class="navbar__burger-line navbar__burger-line--top" d="M7 15h51"></path>
        <path class="navbar__burger-line navbar__burger-line--mid" d="M7 32h43"></path>
        <path class="navbar__burger-line navbar__burger-line--bot" d="M7 49h51"></path>
      </svg>
    `;
  };

  const createMenuToolsButton = (modifier, label) => {
    const button = document.createElement("button");
    button.className = `navbar__menu-tool navbar__menu-tool--${modifier}`;
    button.type = "button";
    button.setAttribute("aria-label", label);
    button.innerHTML = iconMarkup("burger-animated");
    return button;
  };

  const resolveNavbarNodes = () => {
    const header = document.querySelector(".site-header[data-eventos-burger-nav]");

    if (
      !(header instanceof HTMLElement) ||
      header.dataset.eventosBurgerReady === "true" ||
      header.hasAttribute("data-public-navbar-host")
    ) {
      return false;
    }

    const navbar = header.querySelector(".navbar");
    const navInner = navbar?.querySelector(".navbar__inner");
    const brand = navInner?.querySelector(".navbar__brand");
    const links = navInner?.querySelector(".navbar__links");
    const actions = navInner?.querySelector(".navbar__actions");

    if (
      !(navbar instanceof HTMLElement) ||
      !(navInner instanceof HTMLElement) ||
      !(brand instanceof HTMLElement) ||
      !(links instanceof HTMLElement) ||
      !(actions instanceof HTMLElement)
    ) {
      return false;
    }

    refs.header = header;
    refs.navbar = navbar;
    refs.navInner = navInner;
    refs.brand = brand;
    refs.links = links;
    refs.actions = actions;
    return true;
  };

  const ensureNavbarChrome = () => {
    if (!resolveNavbarNodes()) {
      return false;
    }

    refs.navbar.classList.add("navbar--menu-route");

    const existingCta = refs.actions.querySelector(".cta-button--nav");
    if (existingCta) {
      existingCta.remove();
    }

    let brandSlot = refs.navInner.querySelector(".navbar__brand-slot");
    if (!(brandSlot instanceof HTMLElement)) {
      brandSlot = document.createElement("div");
      brandSlot.className = "navbar__brand-slot";
      refs.navInner.insertBefore(brandSlot, refs.brand);
      brandSlot.appendChild(refs.brand);
    }

    let centerShell = refs.navInner.querySelector(".navbar__center-shell");
    if (!(centerShell instanceof HTMLElement)) {
      centerShell = document.createElement("div");
      centerShell.className = "navbar__center-shell";
      refs.navInner.insertBefore(centerShell, refs.links);
    }

    let centerDefault = centerShell.querySelector(".navbar__center-default");
    if (!(centerDefault instanceof HTMLElement)) {
      centerDefault = document.createElement("div");
      centerDefault.className = "navbar__center-default";
      centerShell.appendChild(centerDefault);
    }

    let linksClip = centerDefault.querySelector(".navbar__links-clip");
    if (!(linksClip instanceof HTMLElement)) {
      linksClip = document.createElement("div");
      linksClip.className = "navbar__links-clip";
      centerDefault.appendChild(linksClip);
    }

    if (!linksClip.contains(refs.links)) {
      linksClip.appendChild(refs.links);
    }

    let centerSticky = centerShell.querySelector(".navbar__center-sticky");
    if (!(centerSticky instanceof HTMLElement)) {
      centerSticky = document.createElement("div");
      centerSticky.className = "navbar__center-sticky";
      centerShell.appendChild(centerSticky);
    }

    const existingMobileActions = refs.actions.querySelector(".navbar__mobile-actions");
    if (existingMobileActions) {
      existingMobileActions.remove();
    }

    const mobileActions = document.createElement("div");
    mobileActions.className = "navbar__mobile-actions";

    const mobileMenuButton = createMenuToolsButton(
      "mobile-burger",
      "Abrir navegación principal"
    );
    mobileMenuButton.classList.add("navbar__mobile-action", "navbar__mobile-action--burger");
    mobileMenuButton.setAttribute("aria-controls", MOBILE_MENU_PANEL_ID);
    mobileActions.appendChild(mobileMenuButton);
    refs.actions.appendChild(mobileActions);
    refs.mobileMenuButton = mobileMenuButton;

    const existingMobileMenuPanel = refs.navInner.querySelector(`#${MOBILE_MENU_PANEL_ID}`);
    if (existingMobileMenuPanel) {
      existingMobileMenuPanel.remove();
    }

    const mobileMenuPanel = document.createElement("div");
    mobileMenuPanel.className = "navbar__mobile-menu-panel";
    mobileMenuPanel.id = MOBILE_MENU_PANEL_ID;
    mobileMenuPanel.setAttribute("aria-hidden", "true");
    refs.navInner.appendChild(mobileMenuPanel);
    refs.mobileMenuPanel = mobileMenuPanel;
    return true;
  };

  const buildMobileMenuLinks = () => {
    if (!(refs.links instanceof HTMLElement) || !(refs.mobileMenuPanel instanceof HTMLElement)) {
      return;
    }

    refs.mobileMenuLinks = [];
    const list = document.createElement("ul");
    list.className = "navbar__mobile-menu-links";
    list.setAttribute("role", "list");

    refs.links.querySelectorAll("a").forEach((sourceLink) => {
      const href = normalizeText(sourceLink.getAttribute("href"));
      const label = normalizeText(sourceLink.textContent);

      if (!href || !label) {
        return;
      }

      const entryConfig = MOBILE_MENU_ENTRY_BY_KEY[toLookupKey(label)] || null;
      const item = document.createElement("li");
      item.className = "navbar__mobile-menu-card";

      const anchor = document.createElement("a");
      anchor.className = "navbar__mobile-menu-link";
      anchor.href = href;
      anchor.setAttribute("aria-label", label);
      anchor.tabIndex = -1;
      anchor.addEventListener("click", () => {
        setMobileMenuOpen(false);
      });

      const thumb = document.createElement("span");
      thumb.className = "navbar__mobile-menu-thumb";
      thumb.setAttribute("aria-hidden", "true");

      if (entryConfig?.thumbSrc) {
        const thumbImage = document.createElement("img");
        thumbImage.className = "navbar__mobile-menu-thumb-image";
        thumbImage.src = entryConfig.thumbSrc;
        thumbImage.alt = "";
        thumbImage.decoding = "async";
        thumbImage.loading = "eager";
        thumb.appendChild(thumbImage);
      } else {
        thumb.textContent = label.charAt(0).toUpperCase();
      }

      const copy = document.createElement("span");
      copy.className = "navbar__mobile-menu-copy";

      const title = document.createElement("span");
      title.className = "navbar__mobile-menu-title";
      title.textContent = label;

      const titleRow = document.createElement("span");
      titleRow.className = "navbar__mobile-menu-title-row";
      titleRow.appendChild(title);

      const meta = document.createElement("span");
      meta.className = "navbar__mobile-menu-meta";
      meta.textContent = entryConfig?.subtitle || "Descubre esta sección";

      if (entryConfig?.badgeLabel) {
        const badge = document.createElement("span");
        badge.className = "navbar__mobile-menu-badge";

        const badgeIcon = document.createElement("span");
        badgeIcon.className = "navbar__mobile-menu-badge-icon";
        badgeIcon.setAttribute("aria-hidden", "true");
        badgeIcon.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" focusable="false" aria-hidden="true">
            <path d="m80-80 200-560 360 360L80-80Zm132-132 282-100-182-182-100 282Zm370-246-42-42 224-224q32-32 77-32t77 32l24 24-42 42-24-24q-14-14-35-14t-35 14L582-458ZM422-618l-42-42 24-24q14-14 14-34t-14-34l-26-26 42-42 26 26q32 32 32 76t-32 76l-24 24Zm80 80-42-42 144-144q14-14 14-35t-14-35l-64-64 42-42 64 64q32 32 32 77t-32 77L502-538Zm160 160-42-42 64-64q32-32 77-32t77 32l64 64-42 42-64-64q-14-14-35-14t-35 14l-64 64ZM212-212Z"/>
          </svg>
        `;

        const badgeLabel = document.createElement("span");
        badgeLabel.className = "navbar__mobile-menu-badge-label";
        badgeLabel.textContent = entryConfig.badgeLabel;
        badge.append(badgeIcon, badgeLabel);
        titleRow.appendChild(badge);
      }

      copy.append(titleRow, meta);

      const chevron = document.createElement("span");
      chevron.className = "navbar__mobile-menu-chevron";
      chevron.setAttribute("aria-hidden", "true");
      chevron.innerHTML = iconMarkup("chevron-card");

      anchor.append(thumb, copy, chevron);
      item.appendChild(anchor);
      list.appendChild(item);
      refs.mobileMenuLinks.push(anchor);
    });

    refs.mobileMenuPanel.replaceChildren(list);
  };

  const getBurgerLineElements = () => {
    if (!(refs.mobileMenuButton instanceof HTMLButtonElement)) {
      return null;
    }

    const top = refs.mobileMenuButton.querySelector(".navbar__burger-line--top");
    const mid = refs.mobileMenuButton.querySelector(".navbar__burger-line--mid");
    const bot = refs.mobileMenuButton.querySelector(".navbar__burger-line--bot");

    if (
      !(top instanceof SVGPathElement) ||
      !(mid instanceof SVGPathElement) ||
      !(bot instanceof SVGPathElement)
    ) {
      return null;
    }

    return { top, mid, bot };
  };

  const renderBurgerAnimationFrame = (progress) => {
    const burgerLines = getBurgerLineElements();

    if (!burgerLines) {
      return false;
    }

    const clampedProgress = clamp01(progress);
    ["top", "mid", "bot"].forEach((key) => {
      const geometry = BURGER_LINE_GEOMETRY[key];
      const nextLine = interpolateBurgerLine(geometry.closed, geometry.open, clampedProgress);
      burgerLines[key].setAttribute("d", buildBurgerPath(nextLine));
    });

    burgerLines.mid.style.opacity = String(1 - clampedProgress);
    state.burgerAnimationProgress = clampedProgress;
    return true;
  };

  const cancelBurgerAnimation = () => {
    if (state.burgerAnimationFrameId) {
      window.cancelAnimationFrame(state.burgerAnimationFrameId);
      state.burgerAnimationFrameId = 0;
    }
  };

  const syncBurgerAnimation = (nextOpen, { animate = true } = {}) => {
    const targetProgress = nextOpen ? 1 : 0;

    if (!renderBurgerAnimationFrame(state.burgerAnimationProgress)) {
      return;
    }

    const shouldAnimate = animate && !reducedMotionQuery.matches;
    if (!shouldAnimate || Math.abs(state.burgerAnimationProgress - targetProgress) < 0.001) {
      cancelBurgerAnimation();
      renderBurgerAnimationFrame(targetProgress);
      return;
    }

    cancelBurgerAnimation();
    const startProgress = state.burgerAnimationProgress;
    const progressDelta = targetProgress - startProgress;
    const duration = BURGER_ANIMATION_MS * Math.max(0.35, Math.abs(progressDelta));
    const primedFrameMs = Math.min(16, duration * 0.25);
    const animationStartedAt = performance.now() - primedFrameMs;

    const step = (now) => {
      const elapsed = clamp01((now - animationStartedAt) / duration);
      const easedProgress = easeInOutCubic(elapsed);
      renderBurgerAnimationFrame(startProgress + progressDelta * easedProgress);

      if (elapsed < 1) {
        state.burgerAnimationFrameId = window.requestAnimationFrame(step);
        return;
      }

      state.burgerAnimationFrameId = 0;
      renderBurgerAnimationFrame(targetProgress);
    };

    step(performance.now());

    if (!state.burgerAnimationFrameId) {
      return;
    }

    state.burgerAnimationFrameId = window.requestAnimationFrame(step);
  };

  function setMobileMenuOpen(nextOpen, { restoreFocus = false } = {}) {
    if (!(refs.header instanceof HTMLElement)) {
      return;
    }

    const shouldOpen = Boolean(nextOpen) && isMobileViewport();
    const wasOpen = state.mobileMenuOpen;
    const previousNavPhase = normalizeText(refs.header.dataset.menuMobileNav);

    const clearCloseCommitTimer = () => {
      if (state.mobileMenuCloseCommitTimerId) {
        window.clearTimeout(state.mobileMenuCloseCommitTimerId);
        state.mobileMenuCloseCommitTimerId = 0;
      }
    };

    const ensureCloseCommitTimer = () => {
      if (state.mobileMenuCloseCommitTimerId) {
        return;
      }

      state.mobileMenuCloseCommitTimerId = window.setTimeout(() => {
        state.mobileMenuCloseCommitTimerId = 0;
        if (!state.mobileMenuOpen && refs.header instanceof HTMLElement) {
          refs.header.dataset.menuMobileNav = "closed";
          document.body.classList.remove("menu-mobile-nav-backdrop");
        }
      }, MOBILE_MENU_CLOSE_COMMIT_MS);
    };

    state.mobileMenuOpen = shouldOpen;

    if (shouldOpen) {
      clearCloseCommitTimer();
      refs.header.dataset.menuMobileNav = "open";
      document.body.classList.add("menu-mobile-nav-backdrop");
    } else if (previousNavPhase === "open") {
      clearCloseCommitTimer();
      refs.header.dataset.menuMobileNav = "closing";
      document.body.classList.remove("menu-mobile-nav-backdrop");
      ensureCloseCommitTimer();
    } else if (previousNavPhase === "closing") {
      document.body.classList.remove("menu-mobile-nav-backdrop");
      ensureCloseCommitTimer();
    } else {
      clearCloseCommitTimer();
      refs.header.dataset.menuMobileNav = "closed";
      document.body.classList.remove("menu-mobile-nav-backdrop");
    }

    if (refs.mobileMenuButton instanceof HTMLButtonElement) {
      const nextBurgerState = shouldOpen ? "open" : "closed";
      const burgerStateChanged =
        refs.mobileMenuButton.getAttribute("data-burger-state") !== nextBurgerState;
      const rebuiltBurgerIcon = refs.mobileMenuButton.dataset.iconType !== "burger-animated";
      if (rebuiltBurgerIcon) {
        refs.mobileMenuButton.dataset.iconType = "burger-animated";
        refs.mobileMenuButton.innerHTML = iconMarkup("burger-animated");
      }

      refs.mobileMenuButton.setAttribute("data-burger-state", nextBurgerState);
      refs.mobileMenuButton.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
      refs.mobileMenuButton.setAttribute("aria-pressed", shouldOpen ? "true" : "false");
      refs.mobileMenuButton.setAttribute(
        "aria-label",
        shouldOpen ? "Cerrar navegación principal" : "Abrir navegación principal"
      );

      if (rebuiltBurgerIcon || burgerStateChanged) {
        syncBurgerAnimation(shouldOpen, { animate: !rebuiltBurgerIcon });
      }
    }

    if (refs.mobileMenuPanel instanceof HTMLElement) {
      refs.mobileMenuPanel.setAttribute("aria-hidden", shouldOpen ? "false" : "true");
      refs.mobileMenuPanel.inert = !shouldOpen;
    }

    refs.mobileMenuLinks.forEach((link) => {
      link.tabIndex = shouldOpen ? 0 : -1;
    });

    if (
      !shouldOpen &&
      wasOpen &&
      restoreFocus &&
      refs.mobileMenuButton instanceof HTMLButtonElement
    ) {
      refs.mobileMenuButton.focus();
    }
  }

  const initMenuNavbar = () => {
    if (!ensureNavbarChrome()) {
      return;
    }

    buildMobileMenuLinks();
    setMobileMenuOpen(false);

    if (refs.mobileMenuButton instanceof HTMLButtonElement) {
      refs.mobileMenuButton.addEventListener("click", (event) => {
        event.preventDefault();

        if (!isMobileViewport()) {
          return;
        }

        setMobileMenuOpen(!state.mobileMenuOpen);
      });
    }

    document.addEventListener("pointerdown", (event) => {
      if (!state.mobileMenuOpen) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      const clickInsidePanel =
        refs.mobileMenuPanel instanceof HTMLElement &&
        refs.mobileMenuPanel.contains(target);
      const clickOnButton =
        refs.mobileMenuButton instanceof HTMLButtonElement &&
        refs.mobileMenuButton.contains(target);

      if (!clickInsidePanel && !clickOnButton) {
        setMobileMenuOpen(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && state.mobileMenuOpen) {
        setMobileMenuOpen(false, { restoreFocus: true });
      }
    });

    const closeOnDesktop = () => {
      if (!isMobileViewport() && state.mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", closeOnDesktop, { passive: true });
    window.addEventListener("orientationchange", closeOnDesktop);

    refs.header.dataset.eventosBurgerReady = "true";
  };

  document.addEventListener("figata:public-navbar-ready", initMenuNavbar);

  const navbarReady = window.FigataPublicNavbar?.whenReady;
  if (typeof navbarReady === "function") {
    navbarReady().then(initMenuNavbar).catch(initMenuNavbar);
    return;
  }

  initMenuNavbar();
})();
