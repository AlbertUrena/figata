(() => {
  const renderIngredientIconRow = async (container, ingredientIds = []) => {
    if (!(container instanceof HTMLElement)) {
      return;
    }

    container.replaceChildren();

    const ingredientsApi = window.FigataData?.ingredients;

    if (!ingredientsApi?.resolveIngredients) {
      return;
    }

    const ingredients = await ingredientsApi.resolveIngredients(ingredientIds);

    if (!ingredients.length) {
      return;
    }

    const fragment = document.createDocumentFragment();

    ingredients.forEach((ingredient) => {
      const item = document.createElement('li');
      item.className = 'preview-overlay__ingredient-item';

      if (ingredient.icon) {
        const icon = document.createElement('img');
        icon.className = 'preview-overlay__ingredient-icon';
        icon.src = ingredient.icon;
        icon.alt = '';
        icon.setAttribute('aria-hidden', 'true');
        icon.loading = 'lazy';
        item.appendChild(icon);
      }

      const label = document.createElement('span');
      label.className = 'preview-overlay__ingredient-label';
      label.textContent = ingredient.label;
      item.appendChild(label);

      fragment.appendChild(item);
    });

    container.appendChild(fragment);
  };

  window.FigataData = window.FigataData || {};
  window.FigataData.ingredientIconRow = {
    renderIngredientIconRow,
  };
})();
