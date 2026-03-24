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

    ctx.ensureHomeDraft();
    ctx.ensureIngredientsDraft();
    var homeData = ctx.state.drafts.home || {};
    var configuredModalsCount = 0;
    if (homeData.menu_page && homeData.menu_page.account_modal) {
      configuredModalsCount += 1;
    }
    if (homeData.menu_page && homeData.menu_page.filter_modal) {
      configuredModalsCount += 1;
    }
    if (homeData.menu_detail_editorial && homeData.menu_detail_editorial.compare_modal) {
      configuredModalsCount += 1;
    }
    ctx.elements.metricAvailability.textContent = configuredModalsCount + " modales";

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

    var restaurant = ctx.state.drafts.restaurant || ctx.state.data.restaurant || {};
    var contact = restaurant.contact || {};
    var location = restaurant.location || {};
    var phone = contact.phone || "Sin telefono";
    var city = location.city || "";
    ctx.elements.metricRestaurant.textContent = city ? phone + " · " + city : phone;

    var mediaItems = ((ctx.state.drafts.media || ctx.state.data.media || {}).items) || {};
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
    if (typeof ctx.setRestaurantEditorStatus === "function") {
      ctx.setRestaurantEditorStatus("");
    }
    if (typeof ctx.setMediaEditorStatus === "function") {
      ctx.setMediaEditorStatus("");
    }
    if (typeof ctx.setPagesEditorStatus === "function") {
      ctx.setPagesEditorStatus("");
    }
  }

  ns.dashboard = {
    updateDashboardMetrics: updateDashboardMetrics,
    openDashboard: openDashboard
  };
})();
