// admin/app/modules/accordion.js
// Extracted from admin/app/app.js — Phase 8 refactor
// Sidebar accordion motion, panel-to-accordion mapping, active indicator.
// Dependencies: FigataAdmin.constants (NAVIGATION_STATES), FigataAdmin.navigation (waitForTransition, waitNextFrame, waitForAnimation, setNavigationState)

(function () {
  "use strict";

  var ns = window.FigataAdmin = window.FigataAdmin || {};
  var C = ns.constants;

  // --- Accordion motion (pure DOM, no state needed) ---

  function syncSidebarAccordionCategoryHeights(accordionElement) {
    if (!accordionElement) return;
    var categories = accordionElement.querySelectorAll(".sidebar-accordion-category");
    Array.prototype.forEach.call(categories, function (categoryElement) {
      var targetHeight = categoryElement.scrollHeight;
      if (targetHeight > 0) {
        categoryElement.style.setProperty("--sidebar-enter-max-height", targetHeight + "px");
      }
    });
  }

  function clearSidebarAccordionOpeningMotion(accordionElement) {
    if (!accordionElement) return;

    if (accordionElement.__openingMotionFrame) {
      window.cancelAnimationFrame(accordionElement.__openingMotionFrame);
      accordionElement.__openingMotionFrame = 0;
    }

    var categories = accordionElement.querySelectorAll(".sidebar-accordion-category");
    Array.prototype.forEach.call(categories, function (categoryElement) {
      categoryElement.classList.remove("is-entering");
      categoryElement.classList.remove("is-entering-prep");
      categoryElement.classList.remove("is-entering-active");
    });

    accordionElement.classList.remove("is-opening");
    accordionElement.classList.remove("is-opening-active");
  }

  function prepareSidebarAccordionOpeningMotion(accordionElement) {
    if (!accordionElement) return;

    clearSidebarAccordionOpeningMotion(accordionElement);
    accordionElement.classList.add("is-opening");
    syncSidebarAccordionCategoryHeights(accordionElement);

    var categories = Array.prototype.slice.call(
      accordionElement.querySelectorAll(".sidebar-accordion-category")
    );

    categories.forEach(function (categoryElement) {
      categoryElement.classList.add("is-entering");
      categoryElement.classList.add("is-entering-prep");
      categoryElement.classList.remove("is-entering-active");
    });
    void accordionElement.offsetHeight;
  }

  function scheduleSidebarAccordionOpeningMotion(accordionElement) {
    if (!accordionElement) return;

    var categories = Array.prototype.slice.call(
      accordionElement.querySelectorAll(".sidebar-accordion-category")
    );

    accordionElement.__openingMotionFrame = window.requestAnimationFrame(function () {
      accordionElement.__openingMotionFrame = window.requestAnimationFrame(function () {
        accordionElement.__openingMotionFrame = 0;
        accordionElement.classList.add("is-opening-active");
        categories.forEach(function (categoryElement) {
          categoryElement.classList.remove("is-entering-prep");
          categoryElement.classList.add("is-entering-active");
        });
      });
    });
  }

  function finalizeSidebarAccordionOpeningMotion(accordionElement) {
    if (!accordionElement) return;
    clearSidebarAccordionOpeningMotion(accordionElement);
    accordionElement.classList.add("is-open");
    accordionElement.setAttribute("aria-hidden", "false");
  }

  function setSidebarAccordionElementState(accordionElement, show) {
    if (!accordionElement) return;
    var shouldOpen = Boolean(show);
    var wasOpen = accordionElement.classList.contains("is-open");

    if (shouldOpen === wasOpen) {
      accordionElement.setAttribute("aria-hidden", shouldOpen ? "false" : "true");
      if (shouldOpen) {
        syncSidebarAccordionCategoryHeights(accordionElement);
      }
      return;
    }

    if (shouldOpen) {
      prepareSidebarAccordionOpeningMotion(accordionElement);
      accordionElement.classList.add("is-open");
      accordionElement.setAttribute("aria-hidden", "false");
      scheduleSidebarAccordionOpeningMotion(accordionElement);
      return;
    }

    clearSidebarAccordionOpeningMotion(accordionElement);
    accordionElement.classList.remove("is-open");
    accordionElement.setAttribute("aria-hidden", "true");
  }

  // --- Functions that need accordion element refs (ctx.elements) ---

  function clearAllSidebarAccordionOpeningMotions(ctx) {
    [ctx.elements.sidebarMenuAccordion, ctx.elements.sidebarHomepageAccordion, ctx.elements.sidebarIngredientsAccordion, ctx.elements.sidebarCategoriesAccordion]
      .filter(Boolean)
      .forEach(function (accordionElement) {
        clearSidebarAccordionOpeningMotion(accordionElement);
      });
  }

  function syncAllSidebarAccordionCategoryHeights(ctx) {
    [ctx.elements.sidebarMenuAccordion, ctx.elements.sidebarHomepageAccordion, ctx.elements.sidebarIngredientsAccordion, ctx.elements.sidebarCategoriesAccordion]
      .filter(Boolean)
      .forEach(function (accordionElement) {
        syncSidebarAccordionCategoryHeights(accordionElement);
      });
  }

  function showMenuAccordion(ctx, show) {
    setSidebarAccordionElementState(ctx.elements.sidebarMenuAccordion, show);
  }

  function showHomepageAccordion(ctx, show) {
    setSidebarAccordionElementState(ctx.elements.sidebarHomepageAccordion, show);
  }

  function showIngredientsAccordion(ctx, show) {
    setSidebarAccordionElementState(ctx.elements.sidebarIngredientsAccordion, show);
  }

  function showCategoriesAccordion(ctx, show) {
    setSidebarAccordionElementState(ctx.elements.sidebarCategoriesAccordion, show);
  }

  function getSidebarAccordionKeyForPanel(ctx, panel) {
    if (panel === "menu-browser" || panel === "menu-item") return "menu";
    if (panel === "home-editor") return "homepage";
    if (panel === "ingredients-editor") {
      return ctx.normalizeIngredientsTab(ctx.state.ingredientsEditor.tab) === "icons" ? "" : "ingredients";
    }
    if (panel === "categories-editor") return "categories";
    return "";
  }

  function getSidebarOpenAccordionKeyFromDom(ctx) {
    if (ctx.elements.sidebarMenuAccordion && ctx.elements.sidebarMenuAccordion.classList.contains("is-open")) {
      return "menu";
    }
    if (ctx.elements.sidebarHomepageAccordion && ctx.elements.sidebarHomepageAccordion.classList.contains("is-open")) {
      return "homepage";
    }
    if (ctx.elements.sidebarIngredientsAccordion && ctx.elements.sidebarIngredientsAccordion.classList.contains("is-open")) {
      return "ingredients";
    }
    if (ctx.elements.sidebarCategoriesAccordion && ctx.elements.sidebarCategoriesAccordion.classList.contains("is-open")) {
      return "categories";
    }
    return "";
  }

  function getSidebarAccordionElementByKey(ctx, accordionKey) {
    if (accordionKey === "menu") return ctx.elements.sidebarMenuAccordion || null;
    if (accordionKey === "homepage") return ctx.elements.sidebarHomepageAccordion || null;
    if (accordionKey === "ingredients") return ctx.elements.sidebarIngredientsAccordion || null;
    if (accordionKey === "categories") return ctx.elements.sidebarCategoriesAccordion || null;
    return null;
  }

  function isSidebarAccordionOpening(ctx, accordionKey) {
    var accordionElement = getSidebarAccordionElementByKey(ctx, accordionKey);
    return Boolean(accordionElement && accordionElement.classList.contains("is-opening"));
  }

  function applySidebarAccordionState(ctx, nextAccordionKey) {
    var normalizedKey = nextAccordionKey || "";
    showMenuAccordion(ctx, normalizedKey === "menu");
    showHomepageAccordion(ctx, normalizedKey === "homepage");
    showIngredientsAccordion(ctx, normalizedKey === "ingredients");
    showCategoriesAccordion(ctx, normalizedKey === "categories");
    ctx.state.sidebarAccordionOpenKey = normalizedKey;
  }

  async function transitionSidebarAccordions(ctx, nextAccordionKey) {
    var normalizedKey = nextAccordionKey || "";
    ctx.state.sidebarAccordionTransitionToken += 1;
    var transitionToken = ctx.state.sidebarAccordionTransitionToken;
    var isTransitionCurrent = function () {
      return ctx.state.sidebarAccordionTransitionToken === transitionToken;
    };

    clearAllSidebarAccordionOpeningMotions(ctx);

    if (ctx.state.sidebarCollapsed) {
      // Keep DOM accordions closed while collapsed; only remember target intent.
      applySidebarAccordionState(ctx, "");
      ctx.state.sidebarAccordionOpenKey = normalizedKey;
      return;
    }

    var currentOpenKey = getSidebarOpenAccordionKeyFromDom(ctx) || "";
    ctx.state.sidebarAccordionOpenKey = currentOpenKey;

    if (currentOpenKey === normalizedKey) {
      applySidebarAccordionState(ctx, normalizedKey);
      return;
    }

    ctx.setNavigationState(C.NAVIGATION_STATES.closingAccordion);
    var currentAccordionElement = getSidebarAccordionElementByKey(ctx, currentOpenKey);
    applySidebarAccordionState(ctx, "");
    if (!isTransitionCurrent()) return;
    if (currentAccordionElement) {
      await ctx.waitForTransition(currentAccordionElement, { properties: ["max-height"] });
      if (!isTransitionCurrent()) return;
    } else if (normalizedKey) {
      // Ensure closed baseline is painted before opening from a fully closed state.
      await ctx.waitNextFrame();
      if (!isTransitionCurrent()) return;
    }

    if (!normalizedKey) return;

    ctx.setNavigationState(C.NAVIGATION_STATES.openingAccordion);
    applySidebarAccordionState(ctx, normalizedKey);
    if (!isTransitionCurrent()) return;

    var nextAccordionElement = getSidebarAccordionElementByKey(ctx, normalizedKey);
    if (nextAccordionElement) {
      await ctx.waitForAnimation(nextAccordionElement, { subtree: true });
      if (!isTransitionCurrent()) return;
      finalizeSidebarAccordionOpeningMotion(nextAccordionElement);
    }
  }

  // --- Active indicator ---

  function updateSidebarActiveIndicator(ctx) {
    if (!ctx.elements.sidebarNav || !ctx.elements.sidebarNavActiveIndicator) return;
    var activeItem = ctx.elements.sidebarNav.querySelector(".sidebar-nav__item.is-active");
    if (!activeItem) {
      ctx.elements.sidebarNavActiveIndicator.classList.remove("is-visible");
      return;
    }

    var visibleHeight = Math.max(8, activeItem.offsetHeight - 14);
    var top = Math.max(0, activeItem.offsetTop - ctx.elements.sidebarNav.scrollTop + 7);
    ctx.elements.sidebarNavActiveIndicator.style.height = visibleHeight + "px";
    ctx.elements.sidebarNavActiveIndicator.style.transform = "translateY(" + top + "px)";
    ctx.elements.sidebarNavActiveIndicator.classList.add("is-visible");
  }

  function clearSidebarIndicatorSyncTimers(ctx) {
    if (ctx.state.sidebarIndicatorSyncFrame) {
      window.cancelAnimationFrame(ctx.state.sidebarIndicatorSyncFrame);
      ctx.state.sidebarIndicatorSyncFrame = 0;
    }
  }

  function scheduleSidebarActiveIndicatorSync(ctx) {
    clearSidebarIndicatorSyncTimers(ctx);
    updateSidebarActiveIndicator(ctx);

    ctx.state.sidebarIndicatorSyncFrame = window.requestAnimationFrame(function () {
      ctx.state.sidebarIndicatorSyncFrame = window.requestAnimationFrame(function () {
        ctx.state.sidebarIndicatorSyncFrame = 0;
        updateSidebarActiveIndicator(ctx);
      });
    });
  }

  ns.accordion = {
    // Pure DOM motion
    syncSidebarAccordionCategoryHeights: syncSidebarAccordionCategoryHeights,
    clearSidebarAccordionOpeningMotion: clearSidebarAccordionOpeningMotion,
    prepareSidebarAccordionOpeningMotion: prepareSidebarAccordionOpeningMotion,
    scheduleSidebarAccordionOpeningMotion: scheduleSidebarAccordionOpeningMotion,
    finalizeSidebarAccordionOpeningMotion: finalizeSidebarAccordionOpeningMotion,
    setSidebarAccordionElementState: setSidebarAccordionElementState,
    // Element-aware
    clearAllSidebarAccordionOpeningMotions: clearAllSidebarAccordionOpeningMotions,
    syncAllSidebarAccordionCategoryHeights: syncAllSidebarAccordionCategoryHeights,
    showMenuAccordion: showMenuAccordion,
    showHomepageAccordion: showHomepageAccordion,
    showIngredientsAccordion: showIngredientsAccordion,
    showCategoriesAccordion: showCategoriesAccordion,
    getSidebarAccordionKeyForPanel: getSidebarAccordionKeyForPanel,
    getSidebarOpenAccordionKeyFromDom: getSidebarOpenAccordionKeyFromDom,
    getSidebarAccordionElementByKey: getSidebarAccordionElementByKey,
    isSidebarAccordionOpening: isSidebarAccordionOpening,
    applySidebarAccordionState: applySidebarAccordionState,
    transitionSidebarAccordions: transitionSidebarAccordions,
    // Indicator
    updateSidebarActiveIndicator: updateSidebarActiveIndicator,
    clearSidebarIndicatorSyncTimers: clearSidebarIndicatorSyncTimers,
    scheduleSidebarActiveIndicatorSync: scheduleSidebarActiveIndicatorSync
  };
})();
