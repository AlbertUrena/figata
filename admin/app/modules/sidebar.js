// admin/app/modules/sidebar.js
// Extracted from admin/app/app.js — Phase 7 refactor
// Sidebar collapse/expand, user menu, viewport state, UX CSS vars.
// Dependencies: FigataAdmin.constants (SIDEBAR_COLLAPSE_KEY, UX_TIMING)

(function () {
  "use strict";

  var ns = window.FigataAdmin = window.FigataAdmin || {};
  var C = ns.constants;

  function readStoredSidebarCollapsed() {
    try {
      return window.localStorage.getItem(C.SIDEBAR_COLLAPSE_KEY) === "1";
    } catch (_error) {
      return false;
    }
  }

  function isCompactViewport() {
    return window.matchMedia("(max-width: 900px)").matches;
  }

  function setSidebarCollapsed(ctx, nextCollapsed, options) {
    if (!ctx.elements.sidebar) return;

    var wasCollapsed = Boolean(ctx.state.sidebarCollapsed);
    var allowCollapse = !isCompactViewport();
    var collapsed = Boolean(nextCollapsed) && allowCollapse;
    var didCollapseStateChange = wasCollapsed !== collapsed;
    ctx.state.sidebarCollapsed = collapsed;
    ctx.state.sidebarCollapseSyncToken += 1;
    var collapseSyncToken = ctx.state.sidebarCollapseSyncToken;

    ctx.elements.sidebar.setAttribute("data-collapsed", collapsed ? "true" : "false");
    ctx.elements.sidebarToggleButton.setAttribute("aria-pressed", collapsed ? "true" : "false");

    if (options && options.persist) {
      try {
        window.localStorage.setItem(C.SIDEBAR_COLLAPSE_KEY, collapsed ? "1" : "0");
      } catch (_error) {
        // ignore storage errors
      }
    }

    if (collapsed) {
      closeSidebarUserMenu(ctx);
    }

    if (didCollapseStateChange) {
      ctx.clearAllSidebarAccordionOpeningMotions();
      if (collapsed) {
        ctx.applySidebarAccordionState("");
      } else {
        ctx.waitForTransition(ctx.elements.sidebar, { properties: ["width"] }).then(function () {
          if (ctx.state.sidebarCollapseSyncToken !== collapseSyncToken) return;
          if (ctx.state.sidebarCollapsed || ctx.state.isPanelTransitioning) return;

          var accordionKeyForPanel = ctx.getSidebarAccordionKeyForPanel(ctx.state.currentPanel);
          if (!accordionKeyForPanel) {
            ctx.applySidebarAccordionState("");
            return;
          }

          // Force a close->open path so reopening happens after sidebar expansion.
          ctx.state.sidebarAccordionOpenKey = ctx.getSidebarOpenAccordionKeyFromDom() || "";
          ctx.transitionSidebarAccordions(accordionKeyForPanel).catch(function () {
            // ignore accordion restoration interruptions during rapid UI updates
          });
        });
      }
    }

    window.requestAnimationFrame(ctx.updateSidebarActiveIndicator);
  }

  function syncSidebarViewportState(ctx) {
    if (isCompactViewport()) {
      setSidebarCollapsed(ctx, false, { persist: false });
      return;
    }
    setSidebarCollapsed(ctx, readStoredSidebarCollapsed(), { persist: false });
  }

  function isSidebarUserMenuOpen(ctx) {
    return !ctx.elements.sidebarUserMenu.classList.contains("is-hidden");
  }

  function closeSidebarUserMenu(ctx) {
    ctx.elements.sidebarUserMenu.classList.add("is-hidden");
    ctx.elements.sidebarUserButton.setAttribute("aria-expanded", "false");
  }

  function openSidebarUserMenu(ctx) {
    ctx.elements.sidebarUserMenu.classList.remove("is-hidden");
    ctx.elements.sidebarUserButton.setAttribute("aria-expanded", "true");
  }

  function toggleSidebarUserMenu(ctx) {
    if (isSidebarUserMenuOpen(ctx)) {
      closeSidebarUserMenu(ctx);
      return;
    }
    openSidebarUserMenu(ctx);
  }

  function syncUxTimingCssVars() {
    if (!document || !document.documentElement || !document.documentElement.style) return;
    var rootStyle = document.documentElement.style;
    rootStyle.setProperty("--ux-sidebar-transition", C.UX_TIMING.accordionSwitchDelayMs + "ms");
    rootStyle.setProperty("--ux-sidebar-stagger-step", C.UX_TIMING.accordionStaggerStepMs + "ms");
    rootStyle.setProperty("--ux-panel-fade", C.UX_TIMING.panelFadeInCleanupDelayMs + "ms");
    rootStyle.setProperty("--ux-indicator-height", C.UX_TIMING.indicatorSettleMs + "ms");
    rootStyle.setProperty("--ux-indicator-opacity", C.UX_TIMING.indicatorOpacityMs + "ms");
  }

  ns.sidebar = {
    readStoredSidebarCollapsed: readStoredSidebarCollapsed,
    isCompactViewport: isCompactViewport,
    setSidebarCollapsed: setSidebarCollapsed,
    syncSidebarViewportState: syncSidebarViewportState,
    isSidebarUserMenuOpen: isSidebarUserMenuOpen,
    closeSidebarUserMenu: closeSidebarUserMenu,
    openSidebarUserMenu: openSidebarUserMenu,
    toggleSidebarUserMenu: toggleSidebarUserMenu,
    syncUxTimingCssVars: syncUxTimingCssVars
  };
})();
