const fs = require("fs");
const path = require("path");

const categoriesContract = require("../shared/categories-contract.js");

const projectRoot = process.cwd();
const categoriesPath = path.join(projectRoot, "data", "categories.json");
const menuPath = path.join(projectRoot, "data", "menu.json");

const readErrors = [];

const readJson = (filePath, label) => {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
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

const categories = readJson(categoriesPath, "data/categories.json");
const menu = readJson(menuPath, "data/menu.json");

if (!categories) {
  printIssues("Errores", readErrors);
  process.exit(1);
}

const validation = categoriesContract.validateCategoriesContract(categories, {
  menuPayload: menu || null
});

const errors = readErrors.concat(validation.errors || []);
const warnings = validation.warnings || [];

console.log(
  `categories.json validado. Errores: ${errors.length}. Warnings: ${warnings.length}.`
);

printIssues("Errores", errors);
printIssues("Warnings", warnings);

if (errors.length > 0) {
  process.exit(1);
}
