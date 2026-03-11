// admin/app/modules/drafts.js
// Extracted from admin/app/app.js — Phase 3 refactor
// Local draft persistence: localStorage read/write/clear and hydration.
// No DOM elements, no rendering.

(function () {
  "use strict";

  var ns = window.FigataAdmin = window.FigataAdmin || {};
  var C = ns.constants;
  var deepClone = ns.utils.deepClone;

  function normalizeText(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function normalizePath(value) {
    return normalizeText(value).replace(/^\/+/, "");
  }

  function isPlaceholderPath(value) {
    var normalized = normalizePath(value);
    if (!normalized) return false;
    var placeholder = normalizePath(C.MENU_PLACEHOLDER_IMAGE);
    return normalized === placeholder || normalized.indexOf("assets/menu/placeholders/") === 0;
  }

  function isLegacyRootMenuAssetPath(value) {
    var normalized = normalizePath(value);
    if (!normalized) return false;
    return /^assets\/menu\/[^/]+\.(webp|png|jpe?g|avif|gif)$/i.test(normalized);
  }

  function shouldAdoptSourceImage(draftPath, sourcePath) {
    var sourceNormalized = normalizePath(sourcePath);
    if (!sourceNormalized) return false;

    var draftNormalized = normalizePath(draftPath);
    if (!draftNormalized) return true;
    if (draftNormalized === sourceNormalized) return false;
    if (isPlaceholderPath(draftNormalized) && !isPlaceholderPath(sourceNormalized)) return true;
    if (isLegacyRootMenuAssetPath(draftNormalized) && draftNormalized !== sourceNormalized) return true;
    return false;
  }

  function mergeMenuDraftWithSourceDescriptions(draftMenu, sourceMenu) {
    if (
      !draftMenu ||
      !Array.isArray(draftMenu.sections) ||
      !sourceMenu ||
      !Array.isArray(sourceMenu.sections)
    ) {
      return;
    }

    var sourceById = {};
    sourceMenu.sections.forEach(function (section) {
      var items = Array.isArray(section && section.items) ? section.items : [];
      items.forEach(function (item) {
        var itemId = normalizeText(item && item.id);
        if (itemId) {
          sourceById[itemId] = item;
        }
      });
    });

    draftMenu.sections.forEach(function (section) {
      var items = Array.isArray(section && section.items) ? section.items : [];
      items.forEach(function (item) {
        if (!item || typeof item !== "object") return;

        var itemId = normalizeText(item.id);
        if (!itemId || !sourceById[itemId]) return;

        var sourceItem = sourceById[itemId];

        if (!normalizeText(item.descriptionShort) && normalizeText(sourceItem.descriptionShort)) {
          item.descriptionShort = sourceItem.descriptionShort;
        }

        if (!normalizeText(item.descriptionLong) && normalizeText(sourceItem.descriptionLong)) {
          item.descriptionLong = sourceItem.descriptionLong;
        }

        if (shouldAdoptSourceImage(item.image, sourceItem.image)) {
          item.image = sourceItem.image;
        }
      });
    });
  }

  function mergeMediaDraftWithSourceMedia(draftMedia, sourceMedia) {
    if (
      !draftMedia ||
      typeof draftMedia !== "object" ||
      !sourceMedia ||
      typeof sourceMedia !== "object"
    ) {
      return;
    }

    if (!draftMedia.items || typeof draftMedia.items !== "object") {
      draftMedia.items = {};
    }

    var sourceItems = sourceMedia.items || {};
    Object.keys(sourceItems).forEach(function (itemId) {
      var sourceEntry = sourceItems[itemId];
      if (!sourceEntry || typeof sourceEntry !== "object") return;

      var draftEntry = draftMedia.items[itemId];
      if (!draftEntry || typeof draftEntry !== "object") {
        draftMedia.items[itemId] = deepClone(sourceEntry);
        return;
      }

      if (shouldAdoptSourceImage(draftEntry.source, sourceEntry.source)) {
        draftEntry.source = sourceEntry.source;
      }
    });
  }

  var KEYS = {
    menu: C.LOCAL_DRAFTS_MENU_KEY,
    availability: C.LOCAL_DRAFTS_AVAILABILITY_KEY,
    home: C.LOCAL_DRAFTS_HOME_KEY,
    ingredients: C.LOCAL_DRAFTS_INGREDIENTS_KEY,
    categories: C.LOCAL_DRAFTS_CATEGORIES_KEY,
    restaurant: C.LOCAL_DRAFTS_RESTAURANT_KEY,
    media: C.LOCAL_DRAFTS_MEDIA_KEY,
    flag: C.LOCAL_DRAFTS_FLAG_KEY
  };

  function clearPersistedDraftsStorage() {
    try {
      window.localStorage.removeItem(KEYS.menu);
      window.localStorage.removeItem(KEYS.availability);
      window.localStorage.removeItem(KEYS.home);
      window.localStorage.removeItem(KEYS.ingredients);
      window.localStorage.removeItem(KEYS.categories);
      window.localStorage.removeItem(KEYS.restaurant);
      window.localStorage.removeItem(KEYS.media);
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
      !drafts.categories ||
      !drafts.restaurant ||
      !drafts.media
    ) return;
    try {
      window.localStorage.setItem(KEYS.menu, JSON.stringify(drafts.menu));
      window.localStorage.setItem(KEYS.availability, JSON.stringify(drafts.availability));
      window.localStorage.setItem(KEYS.home, JSON.stringify(drafts.home));
      window.localStorage.setItem(KEYS.ingredients, JSON.stringify(drafts.ingredients));
      window.localStorage.setItem(KEYS.categories, JSON.stringify(drafts.categories));
      window.localStorage.setItem(KEYS.restaurant, JSON.stringify(drafts.restaurant));
      window.localStorage.setItem(KEYS.media, JSON.stringify(drafts.media));
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
      var restaurantRaw = window.localStorage.getItem(KEYS.restaurant);
      var mediaRaw = window.localStorage.getItem(KEYS.media);

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
      var restoredRestaurant = restaurantRaw
        ? JSON.parse(restaurantRaw)
        : deepClone(state.data && state.data.restaurant);
      var restoredMedia = mediaRaw
        ? JSON.parse(mediaRaw)
        : deepClone(state.data && state.data.media);

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

      if (!restoredRestaurant || typeof restoredRestaurant !== "object") {
        clearPersistedDraftsStorage();
        return false;
      }

      if (!restoredMedia || typeof restoredMedia !== "object") {
        clearPersistedDraftsStorage();
        return false;
      }

      mergeMenuDraftWithSourceDescriptions(restoredMenu, state.data && state.data.menu);
      mergeMediaDraftWithSourceMedia(restoredMedia, state.data && state.data.media);

      state.drafts.menu = restoredMenu;
      state.drafts.availability = restoredAvailability;
      state.drafts.home = restoredHome;
      state.drafts.ingredients = restoredIngredients;
      state.drafts.categories = restoredCategories;
      state.drafts.restaurant = restoredRestaurant;
      state.drafts.media = restoredMedia; // Added media assignment
      callbacks.ensureMenuDraft();
      callbacks.ensureAvailabilityDraft();
      callbacks.ensureHomeDraft();
      callbacks.ensureIngredientsDraft();
      callbacks.ensureCategoriesDraft();
      callbacks.ensureRestaurantDraft();
      callbacks.ensureMediaDraft();
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
