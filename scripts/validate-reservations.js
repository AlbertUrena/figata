const fs = require("fs");
const path = require("path");

const contract = require("../shared/reservations-contract.js");

const projectRoot = process.cwd();
const reservationsPath = path.join(projectRoot, "data", "reservations-config.json");

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

const reservationsData = readJson(reservationsPath, "data/reservations-config.json");

if (!reservationsData) {
  printIssues("Errores", readErrors);
  process.exit(1);
}

const validation = contract.validateReservationsContract(reservationsData, {});
const errors = readErrors.concat(validation.errors || []);
const warnings = validation.warnings || [];

console.log(
  `reservations-config.json validado. Errores: ${errors.length}. Warnings: ${warnings.length}.`
);

printIssues("Errores", errors);
printIssues("Warnings", warnings);

if (errors.length > 0) {
  process.exit(1);
}
