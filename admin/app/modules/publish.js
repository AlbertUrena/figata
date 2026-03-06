// admin/app/modules/publish.js
// Extracted from admin/app/app.js — Phase 4 refactor
// Publish flow: validate → JWT → fetch → update UI → reset buttons.
// Receives all dependencies via a context object.

(function () {
  "use strict";

  var ns = window.FigataAdmin = window.FigataAdmin || {};

  async function publishChanges(target, ctx) {
    var publishTarget = target === "production" ? "production" : "preview";

    if (ctx.state.isPublishing) {
      return;
    }

    if (
      !ctx.state.drafts.menu ||
      !ctx.state.drafts.availability ||
      !ctx.state.drafts.home ||
      !ctx.state.drafts.ingredients ||
      !ctx.state.drafts.categories
    ) {
      ctx.setCurrentEditorStatus("Error: no hay drafts para publicar.");
      return;
    }
    ctx.ensureMediaStore();
    ctx.ensureIngredientsDraft();
    ctx.ensureCategoriesDraft();
    var normalizedIngredientsResult = ctx.normalizeIngredientsAliasesPayload(ctx.state.drafts.ingredients, { mutate: false });
    var ingredientsPayloadForPublish = normalizedIngredientsResult.payload;
    var ingredientsNormalizationReport = normalizedIngredientsResult.report;

    if (publishTarget === "production") {
      var confirmed = window.confirm(
        "Esto dispara deploy de produccion. ¿Seguro?\n\nPresiona OK para Confirmar."
      );
      if (!confirmed) {
        return;
      }
    }

    var identity = ns.auth.getIdentity();
    var user = identity && typeof identity.currentUser === "function"
      ? identity.currentUser()
      : null;
    if (!user || typeof user.jwt !== "function") {
      ctx.setCurrentEditorStatus("Inicia sesión para publicar.");
      ctx.setDataStatus("Publish blocked: Inicia sesión para publicar.");
      return;
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
      ctx.setDataStatus("Publish blocked: Ingredients tiene errores de validacion.");
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
      ctx.setDataStatus("Publish blocked: Categories tiene errores de validacion.");
      return;
    }

    ctx.state.isPublishing = true;
    var publishButtonSets = ctx.publishButtonSets;

    publishButtonSets.forEach(function (buttonSet) {
      if (!buttonSet.preview && !buttonSet.production) return;
      if (buttonSet.preview && !buttonSet.preview.getAttribute("data-default-label")) {
        buttonSet.preview.setAttribute("data-default-label", "Publish Preview");
      }
      if (buttonSet.production && !buttonSet.production.getAttribute("data-default-label")) {
        buttonSet.production.setAttribute("data-default-label", "Publish Production");
      }
      if (buttonSet.preview) buttonSet.preview.disabled = true;
      if (buttonSet.production) buttonSet.production.disabled = true;
    });

    var currentButtons = publishButtonSets[0];
    if (ctx.state.currentPanel === "home-editor") {
      currentButtons = publishButtonSets[1];
    } else if (ctx.state.currentPanel === "ingredients-editor") {
      currentButtons = publishButtonSets[2];
    }
    var activeButton = publishTarget === "production" ? currentButtons.production : currentButtons.preview;

    if (activeButton) {
      activeButton.textContent = publishTarget === "production"
        ? "Publishing production..."
        : "Publishing preview...";
    }

    ctx.setCurrentEditorStatus(
      publishTarget === "production" ? "Publishing production..." : "Publishing preview..."
    );
    ctx.setDataStatus(publishTarget === "production" ? "Publishing production..." : "Publishing preview...");

    try {
      var token = await user.jwt();
      var response = await fetch("/.netlify/functions/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
          menu: ctx.state.drafts.menu,
          availability: ctx.state.drafts.availability,
          home: ctx.state.drafts.home,
          ingredients: ingredientsPayloadForPublish,
          categories: ctx.state.drafts.categories,
          media: ctx.state.data.media,
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
          ? "No changes (production)"
          : "No changes (preview)";
        var skippedAliasSuffix =
          ingredientsNormalizationReport.changedAliases || ingredientsNormalizationReport.droppedAliases
            ? " · aliases normalizados: " +
              ingredientsNormalizationReport.changedAliases +
              " ajustados, " +
              ingredientsNormalizationReport.droppedAliases +
              " removidos"
            : "";
        ctx.setCurrentEditorStatus(skippedLabel);
        ctx.setDataStatus("No changes to publish (" + publishTarget + ")." + skippedAliasSuffix);
        if (activeButton) activeButton.textContent = skippedLabel;
      } else {
        var successLabel = publishTarget === "production"
          ? "Published ✓ (production)"
          : "Published ✓ (preview)";
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
      ctx.setCurrentEditorStatus("Publish failed");
      ctx.setDataStatus("Publish failed: " + message);
      if (activeButton) {
        activeButton.textContent = "Publish failed";
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
            buttonSet.preview.textContent = buttonSet.preview.getAttribute("data-default-label") || "Publish Preview";
          }
          if (buttonSet.production) {
            buttonSet.production.textContent =
              buttonSet.production.getAttribute("data-default-label") || "Publish Production";
          }
        });
      }, 1800);
    }
  }

  ns.publish = {
    publishChanges: publishChanges
  };
})();
