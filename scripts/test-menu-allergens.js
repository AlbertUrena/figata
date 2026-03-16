const assert = require('assert');

const menuAllergens = require('../shared/menu-allergens.js');
const ingredientsPayload = require('../data/ingredients.json');
const menuPayload = require('../data/menu.json');

const itemsById = {};

(menuPayload.sections || []).forEach((section) => {
  (section.items || []).forEach((item) => {
    itemsById[item.id] = item;
  });
});

const derive = (itemId) => {
  const item = itemsById[itemId];
  assert(item, `No se encontro fixture ${itemId}`);
  return menuAllergens.deriveItemAllergenReport(item, ingredientsPayload);
};

const margherita = derive('margherita');
assert.deepStrictEqual(margherita.resolved.ids, ['milk', 'gluten']);
assert.deepStrictEqual(margherita.automatic.ids, ['milk']);
assert.deepStrictEqual(margherita.automatic.sources_by_allergen.milk, ['mozzarella']);
assert.deepStrictEqual(margherita.resolved.unattributed_ids, ['gluten']);

const marinara = derive('marinara');
assert.deepStrictEqual(marinara.resolved.ids, ['gluten']);
assert.deepStrictEqual(marinara.automatic.ids, []);
assert.deepStrictEqual(marinara.resolved.unattributed_ids, ['gluten']);

const tonno = derive('tonno');
assert.deepStrictEqual(tonno.resolved.ids, ['milk', 'fish', 'gluten']);
assert.deepStrictEqual(tonno.automatic.sources_by_allergen.fish, ['atun']);

const fantasiaPistachos = derive('fantasia_pistachos');
assert.deepStrictEqual(fantasiaPistachos.resolved.ids, ['milk', 'nuts', 'gluten']);
assert.deepStrictEqual(fantasiaPistachos.automatic.sources_by_allergen.nuts, ['pesto_de_pistacho', 'pistachos']);

const quattroFormaggiTruffle = derive('quattro_formaggi_truffle');
assert.deepStrictEqual(quattroFormaggiTruffle.resolved.ids, ['milk', 'gluten']);

const invalidOverrideValidation = menuAllergens.validateMenuAllergens(
  {
    sections: [
      {
        id: 'test',
        items: [
          {
            id: 'invalid_override',
            ingredients: ['mozzarella'],
            allergen_overrides: {
              add: ['gluten'],
              remove: ['gluten'],
            },
          },
        ],
      },
    ],
  },
  ingredientsPayload
);
assert(
  invalidOverrideValidation.errors.some((message) =>
    message.includes('no puede repetir IDs en add/remove')
  )
);

const invalidIngredientValidation = menuAllergens.validateMenuAllergens(
  {
    sections: [
      {
        id: 'test',
        items: [
          {
            id: 'invalid_ingredient',
            ingredients: ['ingrediente_inexistente'],
          },
        ],
      },
    ],
  },
  ingredientsPayload
);
assert(
  invalidIngredientValidation.errors.some((message) =>
    message.includes("Ingrediente desconocido en item 'invalid_ingredient'")
  )
);

console.log('menu-allergens smoke tests passed.');
