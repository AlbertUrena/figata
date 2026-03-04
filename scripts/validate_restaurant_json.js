const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const restaurantPath = path.join(projectRoot, 'data', 'restaurant.json');

const errors = [];
const warnings = [];

const readJson = (filePath, label) => {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    errors.push(`No se pudo leer ${label}: ${error.message}`);
    return null;
  }
};

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const isValidLink = (value) => {
  if (!isNonEmptyString(value)) {
    return false;
  }

  if (
    value.startsWith('/') ||
    value.startsWith('#') ||
    value.startsWith('mailto:') ||
    value.startsWith('tel:')
  ) {
    return true;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (error) {
    return false;
  }
};

const isValidHoursRange = (value) => /^\d{2}:\d{2}-\d{2}:\d{2}$/.test(String(value || '').trim());

const assert = (condition, message) => {
  if (!condition) {
    errors.push(message);
  }
};

const assertWarning = (condition, message) => {
  if (!condition) {
    warnings.push(message);
  }
};

const restaurant = readJson(restaurantPath, 'data/restaurant.json');

if (restaurant) {
  const requiredTopLevel = [
    'name',
    'brand',
    'address',
    'phone',
    'currency',
    'reservationUrl',
    'googleMapsUrl',
    'openingHours',
    'social',
  ];

  requiredTopLevel.forEach((field) => {
    assert(field in restaurant, `Falta campo top-level: ${field}`);
  });

  assert(isNonEmptyString(restaurant.name), 'name es requerido y debe ser string.');
  assert(isNonEmptyString(restaurant.brand), 'brand es requerido y debe ser string.');
  assert(isNonEmptyString(restaurant.phone), 'phone es requerido y debe ser string.');

  assert(
    isNonEmptyString(restaurant.currency) && /^[A-Z]{3}$/.test(restaurant.currency),
    'currency debe ser ISO 4217 de 3 letras en mayuscula (ej: DOP).'
  );

  assert(
    isValidLink(restaurant.reservationUrl),
    'reservationUrl debe ser una URL/ruta valida.'
  );

  assert(
    isValidLink(restaurant.googleMapsUrl),
    'googleMapsUrl debe ser una URL/ruta valida.'
  );

  if ('whatsapp' in restaurant && restaurant.whatsapp) {
    assert(isValidLink(restaurant.whatsapp), 'whatsapp debe ser una URL/ruta valida.');
  }

  assert(isObject(restaurant.address), 'address debe ser objeto.');

  if (isObject(restaurant.address)) {
    assert(isNonEmptyString(restaurant.address.line1), 'address.line1 es requerido.');
    assert(isNonEmptyString(restaurant.address.city), 'address.city es requerido.');
    assert(isNonEmptyString(restaurant.address.country), 'address.country es requerido.');
  }

  assert(isObject(restaurant.openingHours), 'openingHours debe ser objeto.');

  if (isObject(restaurant.openingHours)) {
    ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].forEach((day) => {
      assert(day in restaurant.openingHours, `openingHours.${day} es requerido.`);

      const value = restaurant.openingHours[day];

      if (value === null) {
        return;
      }

      assert(
        isValidHoursRange(value),
        `openingHours.${day} debe ser null o formato HH:MM-HH:MM.`
      );
    });
  }

  assert(isObject(restaurant.social), 'social debe ser objeto.');

  if (isObject(restaurant.social)) {
    ['instagram', 'tiktok'].forEach((key) => {
      const value = restaurant.social[key];

      assertWarning(Boolean(value), `social.${key} vacio. Ese link se ocultara en UI.`);

      if (value) {
        assert(isValidLink(value), `social.${key} debe ser URL valida.`);
      }
    });

    if (restaurant.social.tripadvisor) {
      assert(isValidLink(restaurant.social.tripadvisor), 'social.tripadvisor debe ser URL valida.');
    }
  }

  if ('seo' in restaurant) {
    assert(isObject(restaurant.seo), 'seo debe ser objeto si se define.');

    if (isObject(restaurant.seo)) {
      assertWarning(isNonEmptyString(restaurant.seo.title), 'seo.title vacio.');
      assertWarning(isNonEmptyString(restaurant.seo.description), 'seo.description vacio.');

      if (restaurant.seo.url) {
        assert(isValidLink(restaurant.seo.url), 'seo.url debe ser URL/ruta valida.');
      }
    }
  }
}

if (errors.length === 0) {
  console.log('restaurant.json valido.');
} else {
  console.error('Errores en restaurant.json:');
  errors.forEach((message) => {
    console.error(`- ${message}`);
  });
}

if (warnings.length > 0) {
  console.warn('Warnings:');
  warnings.forEach((message) => {
    console.warn(`- ${message}`);
  });
}

if (errors.length > 0) {
  process.exit(1);
}
