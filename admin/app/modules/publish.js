// admin/app/modules/publish.js
// Extracted from admin/app/app.js — Phase 4 refactor
// Publish flow: validate → fetch → update UI → reset buttons.
// Receives all dependencies via a context object.

(function () {
  "use strict";

  var ns = window.FigataAdmin = window.FigataAdmin || {};
  var constants = ns.constants || {};
  var PUBLISH_ENDPOINT = constants.CLOUDFLARE_PUBLISH_ENDPOINT || "/api/publish";

  async function publishChanges(target, ctx) {
    var publishTarget = target === "production" ? "production" : "preview";

    if (ctx.state.isPublishing) {
      return;
    }

    ctx.ensureMediaStore();
    if (typeof ctx.ensureRestaurantDraft === "function") {
      ctx.ensureRestaurantDraft();
    }
    if (typeof ctx.ensureReservationsDraft === "function") {
      ctx.ensureReservationsDraft();
    }
    if (typeof ctx.ensureMediaDraft === "function") {
      ctx.ensureMediaDraft();
    }
    ctx.ensureIngredientsDraft();
    ctx.ensureCategoriesDraft();

    if (
      !ctx.state.drafts.menu ||
      !ctx.state.drafts.availability ||
      !ctx.state.drafts.home ||
      !ctx.state.drafts.ingredients ||
      !ctx.state.drafts.categories ||
      !ctx.state.drafts.restaurant ||
      !ctx.state.drafts.reservations ||
      !ctx.state.drafts.media
    ) {
      ctx.setCurrentEditorStatus("Error: no hay drafts para publicar.");
      return;
    }
    var normalizedIngredientsResult = ctx.normalizeIngredientsAliasesPayload(ctx.state.drafts.ingredients, { mutate: false });
    var ingredientsPayloadForPublish = normalizedIngredientsResult.payload;
    var ingredientsNormalizationReport = normalizedIngredientsResult.report;
    var menuValidation = typeof ctx.validateMenuDraftData === "function"
      ? ctx.validateMenuDraftData(ctx.state.drafts.menu, ingredientsPayloadForPublish)
      : { errors: [], warnings: [] };

    if (publishTarget === "production") {
      var confirmed = window.confirm(
        "Esto dispara el deploy de produccion. ¿Seguro?\n\nPresiona OK para confirmar."
      );
      if (!confirmed) {
        return;
      }
    }

    var ingredientsValidation = ctx.validateIngredientsDraftData(ctx.state.drafts.ingredients);
    ctx.state.ingredientsEditor.validationReport = ingredientsValidation;
    if (ctx.state.currentPanel === "ingredients-editor") {
      ctx.renderIngredientsEditorValidationSummary(ingredientsValidation);
      ctx.renderIngredientsGlobalWarnings(ingredientsValidation);
    }
    if (ingredientsValidation.errors.length) {
      ctx.setCurrentEditorStatus(
        "No se puede publicar: corrige " + ingredientsValidation.errors.length + " errores en Ingredients."
      );
      ctx.setDataStatus("Publicacion bloqueada: Ingredients tiene errores de validacion.");
      return;
    }

    if (menuValidation.errors.length) {
      ctx.setCurrentEditorStatus(
        "No se puede publicar: corrige " + menuValidation.errors.length + " errores en Menu."
      );
      ctx.setDataStatus("Publicacion bloqueada: Menu tiene errores de validacion.");
      return;
    }

    var categoriesValidation = ctx.validateCategoriesDraftData(ctx.state.drafts.categories);
    ctx.state.categoriesEditor.validationReport = categoriesValidation;
    if (ctx.state.currentPanel === "categories-editor") {
      ctx.renderCategoriesValidationSummary(categoriesValidation);
      ctx.renderCategoriesGlobalWarnings(categoriesValidation);
    }
    if (categoriesValidation.errors.length) {
      ctx.setCurrentEditorStatus(
        "No se puede publicar: corrige " + categoriesValidation.errors.length + " errores en Categories."
      );
      ctx.setDataStatus("Publicacion bloqueada: Categories tiene errores de validacion.");
      return;
    }

    if (window.FigataRestaurantContract) {
      var restaurantValidation = window.FigataRestaurantContract.validateRestaurantContract(ctx.state.drafts.restaurant);
      if (restaurantValidation.errors.length) {
        ctx.setCurrentEditorStatus(
          "No se puede publicar: corrige " + restaurantValidation.errors.length + " errores en Restaurant."
        );
        ctx.setDataStatus("Publicacion bloqueada: Restaurant tiene errores de validacion.");
        return;
      }
    }

    if (window.FigataMediaContract) {
      var mediaValidation = window.FigataMediaContract.validateMediaContract(ctx.state.drafts.media);
      if (mediaValidation.errors.length) {
        ctx.setCurrentEditorStatus(
          "No se puede publicar: corrige " + mediaValidation.errors.length + " errores en Media."
        );
        ctx.setDataStatus("Publicacion bloqueada: Media tiene errores de validacion.");
        return;
      }
    }

    if (window.FigataReservationsContract) {
      var reservationsValidation = window.FigataReservationsContract.validateReservationsContract(ctx.state.drafts.reservations);
      if (reservationsValidation.errors.length) {
        ctx.setCurrentEditorStatus(
          "No se puede publicar: corrige " + reservationsValidation.errors.length + " errores en Reservations."
        );
        ctx.setDataStatus("Publicacion bloqueada: Reservations tiene errores de validacion.");
        return;
      }
    }

    ctx.state.isPublishing = true;
    var publishButtonSets = typeof ctx.getAllPublishButtonSets === "function"
      ? ctx.getAllPublishButtonSets()
      : ctx.publishButtonSets;

    publishButtonSets.forEach(function (buttonSet) {
      if (!buttonSet.preview && !buttonSet.production) return;
      if (buttonSet.preview && !buttonSet.preview.getAttribute("data-default-label")) {
        buttonSet.preview.setAttribute("data-default-label", "Publicar preview");
      }
      if (buttonSet.production && !buttonSet.production.getAttribute("data-default-label")) {
        buttonSet.production.setAttribute("data-default-label", "Publicar produccion");
      }
      if (buttonSet.preview) buttonSet.preview.disabled = true;
      if (buttonSet.production) buttonSet.production.disabled = true;
    });

    var currentButtons = typeof ctx.getPublishButtonSet === "function"
      ? ctx.getPublishButtonSet(ctx.state.currentPanel)
      : null;
    if (!currentButtons) {
      currentButtons = publishButtonSets[0] || null;
    }
    var activeButton = currentButtons
      ? (publishTarget === "production" ? currentButtons.production : currentButtons.preview)
      : null;

    if (activeButton) {
      activeButton.textContent = publishTarget === "production"
        ? "Publicando produccion..."
        : "Publicando preview...";
    }

    ctx.setCurrentEditorStatus(
      publishTarget === "production" ? "Publicando produccion..." : "Publicando preview..."
    );
    ctx.setDataStatus(publishTarget === "production" ? "Publicando produccion..." : "Publicando preview...");

    try {
      var response = await fetch(PUBLISH_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify({
          menu: ctx.state.drafts.menu,
          availability: ctx.state.drafts.availability,
          home: ctx.state.drafts.home,
          ingredients: ingredientsPayloadForPublish,
          categories: ctx.state.drafts.categories,
          restaurant: ctx.state.drafts.restaurant,
          reservations: ctx.state.drafts.reservations,
          media: ctx.state.drafts.media,
          target: publishTarget
        })
      });

      var responseText = await response.text();
      var payload = null;
      if (responseText) {
        try {
          payload = JSON.parse(responseText);
        } catch (_error) {
          payload = null;
        }
      }

      if (!response.ok) {
        var errorMessage = payload && payload.error
          ? payload.error
          : (responseText || ("HTTP " + response.status));
        throw new Error(errorMessage);
      }

      if (payload && payload.skipped) {
        var skippedLabel = publishTarget === "production"
          ? "Sin cambios (produccion)"
          : "Sin cambios (preview)";
        var skippedAliasSuffix =
          ingredientsNormalizationReport.changedAliases || ingredientsNormalizationReport.droppedAliases
            ? " · aliases normalizados: " +
              ingredientsNormalizationReport.changedAliases +
              " ajustados, " +
              ingredientsNormalizationReport.droppedAliases +
              " removidos"
            : "";
        ctx.setCurrentEditorStatus(skippedLabel);
        ctx.setDataStatus("No hay cambios para publicar (" + publishTarget + ")." + skippedAliasSuffix);
        if (activeButton) activeButton.textContent = skippedLabel;
      } else {
        var successLabel = publishTarget === "production"
          ? "Publicado ✓ (produccion)"
          : "Publicado ✓ (preview)";
        var successAliasSuffix =
          ingredientsNormalizationReport.changedAliases || ingredientsNormalizationReport.droppedAliases
            ? " · aliases normalizados: " +
              ingredientsNormalizationReport.changedAliases +
              " ajustados, " +
              ingredientsNormalizationReport.droppedAliases +
              " removidos"
            : "";
        ctx.setCurrentEditorStatus(successLabel);
        if (payload && payload.commit) {
          ctx.setDataStatus(successLabel + " (" + payload.commit + ")" + successAliasSuffix);
        } else {
          ctx.setDataStatus(successLabel + successAliasSuffix);
        }
        if (activeButton) activeButton.textContent = successLabel;
      }
    } catch (error) {
      var message = error && error.message ? error.message : "Unknown error";
      ctx.setCurrentEditorStatus("Publicacion fallida");
      ctx.setDataStatus("Publicacion fallida: " + message);
      if (activeButton) {
        activeButton.textContent = "Publicacion fallida";
      }
    } finally {
      ctx.state.isPublishing = false;
      publishButtonSets.forEach(function (buttonSet) {
        if (buttonSet.preview) buttonSet.preview.disabled = false;
        if (buttonSet.production) buttonSet.production.disabled = false;
      });
      window.setTimeout(function () {
        publishButtonSets.forEach(function (buttonSet) {
          if (buttonSet.preview) {
            buttonSet.preview.textContent = buttonSet.preview.getAttribute("data-default-label") || "Publicar preview";
          }
          if (buttonSet.production) {
            buttonSet.production.textContent =
              buttonSet.production.getAttribute("data-default-label") || "Publicar produccion";
          }
        });
      }, 1800);
    }
  }

  ns.publish = {
    publishChanges: publishChanges
  };
})();
