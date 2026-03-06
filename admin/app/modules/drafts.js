// admin/app/modules/drafts.js
// Extracted from admin/app/app.js — Phase 3 refactor
// Local draft persistence: localStorage read/write/clear and hydration.
// No DOM elements, no rendering.

(function () {
  "use strict";

  var ns = window.FigataAdmin = window.FigataAdmin || {};
  var C = ns.constants;
  var deepClone = ns.utils.deepClone;

  var KEYS = {
    menu: C.LOCAL_DRAFTS_MENU_KEY,
    availability: C.LOCAL_DRAFTS_AVAILABILITY_KEY,
    home: C.LOCAL_DRAFTS_HOME_KEY,
    ingredients: C.LOCAL_DRAFTS_INGREDIENTS_KEY,
    categories: C.LOCAL_DRAFTS_CATEGORIES_KEY,
    flag: C.LOCAL_DRAFTS_FLAG_KEY
  };

  function clearPersistedDraftsStorage() {
    try {
      window.localStorage.removeItem(KEYS.menu);
      window.localStorage.removeItem(KEYS.availability);
      window.localStorage.removeItem(KEYS.home);
      window.localStorage.removeItem(KEYS.ingredients);
      window.localStorage.removeItem(KEYS.categories);
      window.localStorage.removeItem(KEYS.flag);
    } catch (_error) {
      // ignore storage errors
    }
  }

  function persistDraftsToLocalStorage(drafts) {
    if (
      !drafts.menu ||
      !drafts.availability ||
      !drafts.home ||
      !drafts.ingredients ||
      !drafts.categories
    ) return;
    try {
      window.localStorage.setItem(KEYS.menu, JSON.stringify(drafts.menu));
      window.localStorage.setItem(KEYS.availability, JSON.stringify(drafts.availability));
      window.localStorage.setItem(KEYS.home, JSON.stringify(drafts.home));
      window.localStorage.setItem(KEYS.ingredients, JSON.stringify(drafts.ingredients));
      window.localStorage.setItem(KEYS.categories, JSON.stringify(drafts.categories));
      window.localStorage.setItem(KEYS.flag, "1");
    } catch (_error) {
      // ignore storage errors
    }
  }

  function hydrateDraftsFromLocalStorage(state, callbacks) {
    try {
      if (window.localStorage.getItem(KEYS.flag) !== "1") {
        return false;
      }

      var menuRaw = window.localStorage.getItem(KEYS.menu);
      var availabilityRaw = window.localStorage.getItem(KEYS.availability);
      var homeRaw = window.localStorage.getItem(KEYS.home);
      var ingredientsRaw = window.localStorage.getItem(KEYS.ingredients);
      var categoriesRaw = window.localStorage.getItem(KEYS.categories);

      if (!menuRaw || !availabilityRaw) {
        clearPersistedDraftsStorage();
        return false;
      }

      var restoredMenu = JSON.parse(menuRaw);
      var restoredAvailability = JSON.parse(availabilityRaw);
      var restoredHome = homeRaw ? JSON.parse(homeRaw) : deepClone(state.data && state.data.home);
      var restoredIngredients = ingredientsRaw
        ? JSON.parse(ingredientsRaw)
        : deepClone(state.data && state.data.ingredients);
      var restoredCategories = categoriesRaw
        ? JSON.parse(categoriesRaw)
        : deepClone(state.data && state.data.categories);

      if (!restoredMenu || !Array.isArray(restoredMenu.sections)) {
        clearPersistedDraftsStorage();
        return false;
      }

      if (!restoredAvailability || !Array.isArray(restoredAvailability.items)) {
        clearPersistedDraftsStorage();
        return false;
      }

      if (!restoredHome || typeof restoredHome !== "object") {
        clearPersistedDraftsStorage();
        return false;
      }

      if (!restoredIngredients || typeof restoredIngredients !== "object") {
        clearPersistedDraftsStorage();
        return false;
      }

      if (!restoredCategories || typeof restoredCategories !== "object") {
        clearPersistedDraftsStorage();
        return false;
      }

      state.drafts.menu = restoredMenu;
      state.drafts.availability = restoredAvailability;
      state.drafts.home = restoredHome;
      state.drafts.ingredients = restoredIngredients;
      state.drafts.categories = restoredCategories;
      callbacks.ensureMenuDraft();
      callbacks.ensureAvailabilityDraft();
      callbacks.ensureHomeDraft();
      callbacks.ensureIngredientsDraft();
      callbacks.ensureCategoriesDraft();
      return true;
    } catch (_error) {
      clearPersistedDraftsStorage();
      return false;
    }
  }

  ns.drafts = {
    clearPersistedDraftsStorage: clearPersistedDraftsStorage,
    persistDraftsToLocalStorage: persistDraftsToLocalStorage,
    hydrateDraftsFromLocalStorage: hydrateDraftsFromLocalStorage
  };
})();
