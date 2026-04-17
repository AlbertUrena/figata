// admin/app/modules/panels.js
// Extracted from admin/app/app.js — Phase 9 refactor
// Panel transitions, scroll spy adapters, panel visibility, active sidebar nav.
// Dependencies: FigataAdmin.constants (NAVIGATION_STATES, DEBUG_NAVIGATION)

(function () {
  "use strict";

  var ns = window.FigataAdmin = window.FigataAdmin || {};
  var C = ns.constants;

  function getPanelScrollSpyAdapter(ctx, panel) {
    if (panel === "menu-browser") {
      return {
        refresh: ctx.refreshMenuScrollAnchors,
        update: ctx.updateMenuScrollSpy,
        request: ctx.requestMenuScrollSpyUpdate
      };
    }
    if (panel === "home-editor") {
      return {
        refresh: ctx.refreshHomeScrollAnchors,
        update: ctx.updateHomeScrollSpy,
        request: ctx.requestHomeScrollSpyUpdate
      };
    }
    if (panel === "pages-editor") {
      return {
        refresh: ctx.refreshPagesScrollAnchors,
        update: ctx.updatePagesScrollSpy,
        request: ctx.requestPagesScrollSpyUpdate
      };
    }
    if (
      panel === "ingredients-editor" &&
      ctx.state.ingredientsEditor.tab === "ingredients" &&
      ctx.state.ingredientsEditor.view === "catalog"
    ) {
      return {
        refresh: ctx.refreshIngredientsScrollAnchors,
        update: ctx.updateIngredientsScrollSpy,
        request: ctx.requestIngredientsScrollSpyUpdate
      };
    }
    if (panel === "categories-editor") {
      return {
        refresh: ctx.refreshCategoriesScrollAnchors,
        update: ctx.updateCategoriesScrollSpy,
        request: ctx.requestCategoriesScrollSpyUpdate
      };
    }
    if (panel === "restaurant-editor") {
      return {
        refresh: ctx.refreshRestaurantScrollAnchors,
        update: ctx.updateRestaurantScrollSpy,
        request: ctx.requestRestaurantScrollSpyUpdate
      };
    }
    if (panel === "media-editor") {
      return {
        refresh: ctx.refreshMediaScrollAnchors,
        update: ctx.updateMediaScrollSpy,
        request: ctx.requestMediaScrollSpyUpdate
      };
    }
    return null;
  }

  function syncVisiblePanelAnchors(ctx, panel) {
    var adapter = getPanelScrollSpyAdapter(ctx, panel);
    if (!adapter) return;
    adapter.refresh();
    if (ctx.isNavigationStateIdle()) {
      adapter.update(true);
    }
  }

  function requestCurrentPanelScrollSpySync(ctx) {
    var adapter = getPanelScrollSpyAdapter(ctx, ctx.state.currentPanel);
    if (!adapter) return;
    if (ctx.state.isPanelTransitioning) return;
    if (ctx.isProgrammaticScrollLocked()) return;
    if (!ctx.isNavigationStateIdle() && ctx.getNavigationState() !== C.NAVIGATION_STATES.syncingScrollSpy) {
      return;
    }
    if (ctx.isNavigationStateIdle()) {
      ctx.setNavigationState(C.NAVIGATION_STATES.syncingScrollSpy);
    }
    adapter.refresh();
    adapter.update(true);
    window.requestAnimationFrame(function () {
      if (ctx.state.navigation.isProgrammaticScroll) return;
      if (ctx.state.isPanelTransitioning) return;
      if (ctx.getNavigationState() === C.NAVIGATION_STATES.syncingScrollSpy) {
        ctx.setNavigationState(C.NAVIGATION_STATES.idle);
      }
    });
  }

  function requestCurrentPanelScrollSpyUpdate(ctx) {
    var adapter = getPanelScrollSpyAdapter(ctx, ctx.state.currentPanel);
    if (!adapter) return;
    adapter.request();
  }

  function applyPanelVisibility(ctx, panel) {
    [
      ctx.views.dashboardPanel,
      ctx.views.menuBrowserPanel,
      ctx.views.menuItemPanel,
      ctx.views.homeEditorPanel,
      ctx.views.pagesEditorPanel,
      ctx.views.modalEditorPanel,
      ctx.views.ingredientsEditorPanel,
      ctx.views.categoriesEditorPanel,
      ctx.views.restaurantEditorPanel,
      ctx.views.mediaEditorPanel,
      ctx.views.reservationsEditorPanel
    ].forEach(function (panelElement) {
      if (!panelElement) return;
      panelElement.classList.add("is-hidden");
    });

    if (panel === "menu-browser") {
      if (ctx.views.menuBrowserPanel) ctx.views.menuBrowserPanel.classList.remove("is-hidden");
    } else if (panel === "menu-item") {
      if (ctx.views.menuItemPanel) ctx.views.menuItemPanel.classList.remove("is-hidden");
    } else if (panel === "home-editor") {
      if (ctx.views.homeEditorPanel) ctx.views.homeEditorPanel.classList.remove("is-hidden");
    } else if (panel === "pages-editor") {
      if (ctx.views.pagesEditorPanel) ctx.views.pagesEditorPanel.classList.remove("is-hidden");
    } else if (panel === "modal-editor") {
      if (ctx.views.modalEditorPanel) ctx.views.modalEditorPanel.classList.remove("is-hidden");
    } else if (panel === "ingredients-editor") {
      if (ctx.views.ingredientsEditorPanel) ctx.views.ingredientsEditorPanel.classList.remove("is-hidden");
    } else if (panel === "categories-editor") {
      if (ctx.views.categoriesEditorPanel) ctx.views.categoriesEditorPanel.classList.remove("is-hidden");
    } else if (panel === "restaurant-editor") {
      if (ctx.views.restaurantEditorPanel) ctx.views.restaurantEditorPanel.classList.remove("is-hidden");
    } else if (panel === "media-editor") {
      if (ctx.views.mediaEditorPanel) ctx.views.mediaEditorPanel.classList.remove("is-hidden");
    } else if (panel === "reservations-editor") {
      if (ctx.views.reservationsEditorPanel) ctx.views.reservationsEditorPanel.classList.remove("is-hidden");
    } else {
      if (ctx.views.dashboardPanel) ctx.views.dashboardPanel.classList.remove("is-hidden");
    }

    var isMenuPanel = panel === "menu-browser" || panel === "menu-item";
    var isHomePanel = panel === "home-editor";
    var isPagesPanel = panel === "pages-editor";
    var isModalPanel = panel === "modal-editor";
    var isIngredientsPanel = panel === "ingredients-editor";
    var isCategoriesPanel = panel === "categories-editor";
    var isRestaurantPanel = panel === "restaurant-editor";
    var isMediaPanel = panel === "media-editor";
    var isReservationsPanel = panel === "reservations-editor";
    if (ctx.elements.topbar) {
      ctx.elements.topbar.classList.toggle("is-hidden", isMenuPanel || isHomePanel || isPagesPanel || isModalPanel || isIngredientsPanel || isCategoriesPanel || isRestaurantPanel || isMediaPanel || isReservationsPanel);
    }

    ctx.state.visiblePanel = panel;
    var hadPendingPanelAction = ctx.flushPanelPostNavigationAction(panel);
    window.requestAnimationFrame(function () {
      if (hadPendingPanelAction) return;
      syncVisiblePanelAnchors(ctx, panel);
    });
  }

  function setActiveSidebarNav(ctx, panel, options) {
    options = options || {};
    var isMenuPanel = panel === "menu-browser" || panel === "menu-item";
    var isHomePanel = panel === "home-editor";
    var isPagesPanel = panel === "pages-editor";
    var isModalPanel = panel === "modal-editor";
    var isIngredientsPanel = panel === "ingredients-editor";
    var isCategoriesPanel = panel === "categories-editor";
    var isRestaurantPanel = panel === "restaurant-editor";
    var isMediaPanel = panel === "media-editor";
    var isReservationsPanel = panel === "reservations-editor";
    ctx.elements.sidebarNavDashboard.classList.toggle("is-active", panel === "dashboard");
    ctx.elements.sidebarNavMenu.classList.toggle("is-active", isMenuPanel);
    if (ctx.elements.sidebarNavHomepage) {
      ctx.elements.sidebarNavHomepage.classList.toggle("is-active", isHomePanel);
    }
    if (ctx.elements.sidebarNavPages) {
      ctx.elements.sidebarNavPages.classList.toggle("is-active", isPagesPanel);
    }
    if (ctx.elements.sidebarNavModal) {
      ctx.elements.sidebarNavModal.classList.toggle("is-active", isModalPanel);
    }
    if (ctx.elements.sidebarNavIngredients) {
      ctx.elements.sidebarNavIngredients.classList.toggle("is-active", isIngredientsPanel);
    }
    if (ctx.elements.sidebarNavCategories) {
      ctx.elements.sidebarNavCategories.classList.toggle("is-active", isCategoriesPanel);
    }
    if (ctx.elements.sidebarNavRestaurant) {
      ctx.elements.sidebarNavRestaurant.classList.toggle("is-active", isRestaurantPanel);
    }
    if (ctx.elements.sidebarNavMedia) {
      ctx.elements.sidebarNavMedia.classList.toggle("is-active", isMediaPanel);
    }
    if (ctx.elements.sidebarNavReservations) {
      ctx.elements.sidebarNavReservations.classList.toggle("is-active", isReservationsPanel);
    }
    ctx.elements.sidebarHomeButton.classList.toggle("is-active", panel === "dashboard");

    if (options.syncIndicator !== false) {
      ctx.scheduleSidebarActiveIndicatorSync();
    }
  }

  function clearPanelTransitionTimers(ctx) {
    if (ctx.elements.dashboardContent) {
      ctx.elements.dashboardContent.classList.remove("is-panel-fading");
      ctx.elements.dashboardContent.classList.remove("is-panel-fade-out");
    }
    ctx.state.isPanelTransitioning = false;
  }

  async function moveSidebarIndicatorForTimeline(ctx, options) {
    options = options || {};
    if (!ctx.elements.sidebarNavActiveIndicator) return;
    ctx.updateSidebarActiveIndicator();
    if (options.waitForSettle === false) {
      await ctx.waitNextFrame();
      return;
    }
    await ctx.waitForTransition(ctx.elements.sidebarNavActiveIndicator, {
      properties: ["transform", "height", "opacity"]
    });
  }

  async function runPanelTransition(ctx, fromPanel, toPanel) {
    var previousVisiblePanel = fromPanel || ctx.state.visiblePanel || ctx.state.currentPanel || "dashboard";
    var nextAccordionKey = ctx.getSidebarAccordionKeyForPanel(toPanel);
    var previousAccordionKey = ctx.getSidebarOpenAccordionKeyFromDom() || "";
    var shouldFade = Boolean(ctx.elements.dashboardContent && previousVisiblePanel !== toPanel);
    var shouldSwitchAccordion = previousAccordionKey !== nextAccordionKey;

    ctx.state.currentPanel = toPanel;
    ctx.setNavigationCurrentPanel(toPanel);
    if (previousVisiblePanel !== toPanel) {
      ctx.setNavigationCurrentSection("");
    }

    ctx.clearAllSidebarAccordionOpeningMotions();
    ctx.clearSidebarIndicatorSyncTimers();
    clearPanelTransitionTimers(ctx);

    ctx.closeSidebarUserMenu();
    ctx.setNavigationState(C.NAVIGATION_STATES.switchingPanel, { force: true });
    ctx.state.isPanelTransitioning = true;

    var timelineResult = null;
    try {
      timelineResult = await ctx.runNavigationTimeline([
        {
          name: "fadeOutPanel",
          run: async function (context) {
            if (!shouldFade || !ctx.elements.dashboardContent) return;
            ctx.elements.dashboardContent.classList.add("is-panel-fading");
            ctx.elements.dashboardContent.classList.add("is-panel-fade-out");
            await ctx.waitNextFrame();
            context.assertActive();
          }
        },
        {
          name: "updateSidebarActiveState",
          run: function () {
            setActiveSidebarNav(ctx, toPanel, { syncIndicator: false });
          }
        },
        {
          name: "closeCurrentAccordion",
          run: async function (context) {
            if (!shouldSwitchAccordion || !previousAccordionKey) return;
            await ctx.transitionSidebarAccordions("");
            context.assertActive();
          }
        },
        {
          name: "moveSidebarIndicator",
          run: async function (context) {
            await moveSidebarIndicatorForTimeline(ctx, { waitForSettle: false });
            context.assertActive();
          }
        },
        {
          name: "activatePanelDOM",
          run: async function (context) {
            applyPanelVisibility(ctx, toPanel);
            if (shouldFade && ctx.elements.dashboardContent) {
              // Start fade-in as soon as the new panel DOM is visible.
              ctx.elements.dashboardContent.classList.remove("is-panel-fade-out");
            }
            await ctx.waitNextFrame();
            context.assertActive();
          }
        },
        {
          name: "openTargetAccordion",
          run: async function (context) {
            if (!shouldSwitchAccordion || !nextAccordionKey) return;
            await ctx.transitionSidebarAccordions(nextAccordionKey);
            context.assertActive();
          }
        },
        {
          name: "fadeInPanel",
          run: async function (context) {
            if (!ctx.elements.dashboardContent) return;
            if (!shouldFade) {
              ctx.elements.dashboardContent.classList.remove("is-panel-fading");
              ctx.elements.dashboardContent.classList.remove("is-panel-fade-out");
              return;
            }

            await ctx.waitForTransition(ctx.elements.dashboardContent, {
              properties: ["opacity", "transform"]
            });
            ctx.elements.dashboardContent.classList.remove("is-panel-fading");
            context.assertActive();
          }
        }
      ], {
        label: previousVisiblePanel + " -> " + toPanel
      });
    } catch (error) {
      if (error && error.cancelled) {
        return;
      }
      throw error;
    }

    if (!timelineResult) return;
    if (timelineResult.cancelled) {
      if (ctx.state.navigationTimelineToken === timelineResult.token) {
        ctx.state.isPanelTransitioning = false;
        if (!ctx.state.navigation.isProgrammaticScroll) {
          ctx.setNavigationState(C.NAVIGATION_STATES.idle, { force: true });
        }
      }
      return;
    }
    if (ctx.state.navigationTimelineToken !== timelineResult.token) return;

    ctx.state.isPanelTransitioning = false;
    if (!ctx.state.navigation.isProgrammaticScroll) {
      ctx.setNavigationState(C.NAVIGATION_STATES.idle, { force: true });
    }
    requestCurrentPanelScrollSpySync(ctx);
  }

  function setActivePanel(ctx, panel) {
    runPanelTransition(ctx, ctx.state.visiblePanel || ctx.state.currentPanel || "dashboard", panel)
      .catch(function (error) {
        ctx.state.isPanelTransitioning = false;
        clearPanelTransitionTimers(ctx);
        if (!ctx.state.navigation.isProgrammaticScroll) {
          ctx.setNavigationState(C.NAVIGATION_STATES.idle, { force: true });
        }
        if (C.DEBUG_NAVIGATION) {
          console.error("[TIMELINE] panel transition failed", error);
        }
      });
  }

  ns.panels = {
    getPanelScrollSpyAdapter: getPanelScrollSpyAdapter,
    syncVisiblePanelAnchors: syncVisiblePanelAnchors,
    requestCurrentPanelScrollSpySync: requestCurrentPanelScrollSpySync,
    requestCurrentPanelScrollSpyUpdate: requestCurrentPanelScrollSpyUpdate,
    applyPanelVisibility: applyPanelVisibility,
    setActiveSidebarNav: setActiveSidebarNav,
    clearPanelTransitionTimers: clearPanelTransitionTimers,
    moveSidebarIndicatorForTimeline: moveSidebarIndicatorForTimeline,
    runPanelTransition: runPanelTransition,
    setActivePanel: setActivePanel
  };
})();
