const fs = require('fs');
const path = require('path');

const menuTraits = require('../shared/menu-traits.js');
const menuAllergens = require('../shared/menu-allergens.js');
const menuSensory = require('../shared/menu-sensory.js');

const projectRoot = process.cwd();
const ingredientsPath = path.join(projectRoot, 'data', 'ingredients.json');
const menuPath = path.join(projectRoot, 'data', 'menu.json');

const readErrors = [];

const readJson = (filePath, label) => {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    readErrors.push(`No se pudo leer ${label}: ${error.message}`);
    return null;
  }
};

const printIssues = (title, issues) => {
  const list = Array.isArray(issues) ? issues : [];
  if (!list.length) return;

  const maxItems = 60;
  console.log(`${title}:`);
  list.slice(0, maxItems).forEach((issue) => {
    console.log(`- ${issue}`);
  });

  if (list.length > maxItems) {
    console.log(`- ... y ${list.length - maxItems} mas`);
  }
};

const ingredients = readJson(ingredientsPath, 'data/ingredients.json');
const menu = readJson(menuPath, 'data/menu.json');

if (!ingredients || !menu) {
  printIssues('Errores', readErrors);
  process.exit(1);
}

const mergeValidationReports = (...reports) => {
  const errors = [];
  const warnings = [];
  const errorSeen = new Set();
  const warningSeen = new Set();

  reports.forEach((report) => {
    (report?.errors || []).forEach((message) => {
      if (errorSeen.has(message)) {
        return;
      }
      errorSeen.add(message);
      errors.push(message);
    });
    (report?.warnings || []).forEach((message) => {
      if (warningSeen.has(message)) {
        return;
      }
      warningSeen.add(message);
      warnings.push(message);
    });
  });

  return { errors, warnings };
};

const validation = mergeValidationReports(
  menuTraits.validateMenuPayload(menu, ingredients),
  menuAllergens.validateMenuAllergens(menu, ingredients),
  menuSensory.validateMenuSensoryProfiles(menu)
);
const errors = readErrors.concat(validation.errors || []);
const warnings = validation.warnings || [];

console.log(`menu.json validado. Errores: ${errors.length}. Warnings: ${warnings.length}.`);

printIssues('Errores', errors);
printIssues('Warnings', warnings);

if (errors.length > 0) {
  process.exit(1);
}
