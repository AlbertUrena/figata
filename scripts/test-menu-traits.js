const assert = require('assert');

const menuTraits = require('../shared/menu-traits.js');
const ingredientsPayload = require('../data/ingredients.json');
const menuPayload = require('../data/menu.json');

const ingredientsById = ingredientsPayload.ingredients || {};
const itemsById = {};

(menuPayload.sections || []).forEach((section) => {
  (section.items || []).forEach((item) => {
    itemsById[item.id] = item;
  });
});

const derive = (itemId) => {
  const item = itemsById[itemId];
  assert(item, `No se encontro fixture ${itemId}`);
  return menuTraits.deriveItemTraitReport(item, ingredientsById, {
    useLegacyFields: false,
  });
};

const badgeLabels = (report) => report.public_badges.flat.map((badge) => badge.label);

const marinara = derive('marinara');
assert.strictEqual(marinara.resolved.dietary.vegetarian, true);
assert.strictEqual(marinara.resolved.dietary.vegan, true);
assert(badgeLabels(marinara).includes('Vegana'));

const margherita = derive('margherita');
assert.strictEqual(margherita.resolved.dietary.vegetarian, true);
assert.strictEqual(margherita.resolved.dietary.vegan, false);
assert(badgeLabels(margherita).includes('Vegetariana'));

const margheritaFume = derive('margherita_fume');
assert.strictEqual(margheritaFume.resolved.dietary.vegetarian, true);
assert.strictEqual(margheritaFume.resolved.dietary.vegan, false);
assert(badgeLabels(margheritaFume).includes('Ahumada'));

const diavola = derive('diavola');
assert.strictEqual(diavola.resolved.dietary.vegetarian, false);
assert.strictEqual(diavola.resolved.dietary.vegan, false);
assert.strictEqual(diavola.resolved.content_flags.pork, true);
assert(badgeLabels(diavola).includes('Cerdo'));
assert(badgeLabels(diavola).includes('Picante'));

const sweetGoat = derive('sweet_goat');
assert.strictEqual(sweetGoat.resolved.content_flags.pork, true);
assert(badgeLabels(sweetGoat).includes('Cerdo'));
assert(badgeLabels(sweetGoat).includes('Dulce-salada'));

const prosciuttoRucula = derive('prosciutto_rucula');
assert.strictEqual(prosciuttoRucula.resolved.content_flags.pork, true);
assert(badgeLabels(prosciuttoRucula).includes('Cerdo'));

const quattroFormaggiTruffle = derive('quattro_formaggi_truffle');
assert.strictEqual(quattroFormaggiTruffle.resolved.dietary.vegetarian, true);
assert.strictEqual(quattroFormaggiTruffle.resolved.dietary.vegan, false);
assert(badgeLabels(quattroFormaggiTruffle).includes('Vegetariana'));
assert(badgeLabels(quattroFormaggiTruffle).includes('Trufada'));

const fantasiaPistachos = derive('fantasia_pistachos');
assert.strictEqual(fantasiaPistachos.resolved.content_flags.pork, true);
assert.strictEqual(fantasiaPistachos.resolved.content_flags.nuts, true);
assert(badgeLabels(fantasiaPistachos).includes('Cerdo'));
assert(badgeLabels(fantasiaPistachos).includes('Frutos secos'));

const filetti = derive('filetti');
assert.strictEqual(filetti.resolved.dietary.vegetarian, true);
assert.strictEqual(filetti.resolved.dietary.vegan, false);
assert(badgeLabels(filetti).includes('Vegetariana'));

console.log('menu-traits smoke tests passed.');
