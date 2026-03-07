// admin/app/modules/dashboard.js
// Extracted from admin/app/app.js — Phase 12 refactor
// Dashboard metrics display and panel opener.
// Dependencies: ctx object containing state, elements (metric refs), and callbacks.

(function () {
  "use strict";

  var ns = window.FigataAdmin = window.FigataAdmin || {};

  function updateDashboardMetrics(ctx) {
    if (!ctx.state.hasDataLoaded) {
      ctx.elements.metricMenu.textContent = "-";
      ctx.elements.metricCategories.textContent = "-";
      ctx.elements.metricAvailability.textContent = "-";
      ctx.elements.metricHome.textContent = "-";
      if (ctx.elements.metricIngredients) {
        ctx.elements.metricIngredients.textContent = "-";
      }
      ctx.elements.metricRestaurant.textContent = "-";
      ctx.elements.metricMedia.textContent = "-";
      return;
    }

    var menuItemsCount = ctx.getAllMenuItems().length;
    ctx.elements.metricMenu.textContent = menuItemsCount + " items";

    ctx.ensureCategoriesDraft();
    var categoriesDraft = ctx.state.drafts.categories || {};
    var categoriesList = Array.isArray(categoriesDraft.categories) ? categoriesDraft.categories : [];
    var hiddenCategoriesCount = categoriesList.filter(function (category) {
      return !ctx.resolveCategoryVisibility(category);
    }).length;
    var categoriesValidation = ctx.validateCategoriesDraftData(categoriesDraft);
    ctx.state.categoriesEditor.validationReport = categoriesValidation;
    var categoriesAlertsCount = categoriesValidation.errors.length + categoriesValidation.warnings.length;
    ctx.elements.metricCategories.textContent = categoriesList.length + " categorias" +
      (hiddenCategoriesCount ? (" · " + hiddenCategoriesCount + " hidden") : "") +
      (categoriesAlertsCount ? (" · " + categoriesAlertsCount + " alertas") : "");

    var menuItemIds = new Set(ctx.getAllMenuItems().map(function (entry) {
      return entry.item.id;
    }));

    var availabilityItems = (ctx.state.drafts.availability && ctx.state.drafts.availability.items) || [];
    var matchingAvailability = availabilityItems.filter(function (availabilityEntry) {
      return menuItemIds.has(availabilityEntry.itemId);
    });
    var availableCount = matchingAvailability.filter(function (availabilityEntry) {
      return Boolean(availabilityEntry.available);
    }).length;

    ctx.elements.metricAvailability.textContent =
      availableCount + " / " + matchingAvailability.length + " disponibles";

    ctx.ensureHomeDraft();
    ctx.ensureIngredientsDraft();
    var homeData = ctx.state.drafts.home || {};
    var featuredCount =
      homeData.popular && Array.isArray(homeData.popular.featuredIds)
        ? homeData.popular.featuredIds.length
        : 0;
    var heroTitle = homeData.hero && homeData.hero.title ? homeData.hero.title : "Sin hero";
    ctx.elements.metricHome.textContent = featuredCount + " featured · " + heroTitle;

    if (ctx.elements.metricIngredients) {
      var ingredientsDraft = ctx.state.drafts.ingredients || {};
      var ingredientsCount = Object.keys((ingredientsDraft.ingredients || {})).length;
      var ingredientsValidation = ctx.validateIngredientsDraftData(ingredientsDraft);
      ctx.state.ingredientsEditor.validationReport = ingredientsValidation;
      var alertsCount = ingredientsValidation.errors.length + ingredientsValidation.warnings.length;
      ctx.elements.metricIngredients.textContent = ingredientsCount + " ingredientes" +
        (alertsCount ? (" · " + alertsCount + " alertas") : "");
    }

    var restaurant = ctx.state.data.restaurant || {};
    var phone = restaurant.phone || "Sin telefono";
    var city = restaurant.address && restaurant.address.city ? restaurant.address.city : "";
    ctx.elements.metricRestaurant.textContent = city ? phone + " · " + city : phone;

    var mediaItems = (ctx.state.data.media && ctx.state.data.media.items) || {};
    ctx.elements.metricMedia.textContent = Object.keys(mediaItems).length + " media items";
  }

  function openDashboard(ctx, options) {
    options = options || {};
    if (!options.skipRoute) {
      ctx.navigateToRoute("/dashboard", { replace: Boolean(options.replaceRoute) });
      return;
    }
    ctx.setActivePanel("dashboard");
    ctx.setMenuBrowserStatus("");
    ctx.setItemEditorStatus("");
    ctx.setHomeEditorStatus("");
    ctx.setIngredientsEditorStatus("");
    ctx.setCategoriesEditorStatus("");
  }

  ns.dashboard = {
    updateDashboardMetrics: updateDashboardMetrics,
    openDashboard: openDashboard
  };
})();
