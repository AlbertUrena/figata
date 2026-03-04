const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const homePath = path.join(projectRoot, 'data', 'home.json');
const menuPath = path.join(projectRoot, 'data', 'menu.json');

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

const home = readJson(homePath, 'data/home.json');
const menu = readJson(menuPath, 'data/menu.json');

if (home && menu) {
  const requiredTopLevel = [
    'hero',
    'popular',
    'eventsPreview',
    'delivery',
    'reservation',
    'announcements',
    'sections',
  ];

  requiredTopLevel.forEach((field) => {
    assert(field in home, `Falta el bloque top-level: ${field}`);
  });

  const menuIds = new Set();
  const sections = Array.isArray(menu.sections) ? menu.sections : [];

  sections.forEach((section) => {
    const items = Array.isArray(section.items) ? section.items : [];
    items.forEach((item) => {
      if (isNonEmptyString(item.id)) {
        menuIds.add(item.id.trim());
      }
    });
  });

  if (isObject(home.hero)) {
    assert(isNonEmptyString(home.hero.title), 'hero.title es requerido y debe ser string.');
    assert(isNonEmptyString(home.hero.subtitle), 'hero.subtitle es requerido y debe ser string.');
    assert(
      isNonEmptyString(home.hero.backgroundImage),
      'hero.backgroundImage es requerido y debe ser string.'
    );

    assert(isObject(home.hero.ctaPrimary), 'hero.ctaPrimary es requerido y debe ser objeto.');
    if (isObject(home.hero.ctaPrimary)) {
      assert(isNonEmptyString(home.hero.ctaPrimary.label), 'hero.ctaPrimary.label es requerido.');
      assert(
        isValidLink(home.hero.ctaPrimary.url),
        'hero.ctaPrimary.url debe ser una URL/ruta valida.'
      );
    }

    assert(isObject(home.hero.ctaSecondary), 'hero.ctaSecondary es requerido y debe ser objeto.');
    if (isObject(home.hero.ctaSecondary)) {
      assert(isNonEmptyString(home.hero.ctaSecondary.label), 'hero.ctaSecondary.label es requerido.');
      assert(
        isValidLink(home.hero.ctaSecondary.url),
        'hero.ctaSecondary.url debe ser una URL/ruta valida.'
      );
    }
  } else {
    errors.push('hero debe ser un objeto.');
  }

  if (isObject(home.popular)) {
    assert(isNonEmptyString(home.popular.title), 'popular.title es requerido.');
    assert(isNonEmptyString(home.popular.subtitle), 'popular.subtitle es requerido.');
    assert(
      Number.isFinite(Number(home.popular.limit)) && Number(home.popular.limit) > 0,
      'popular.limit debe ser numero mayor que 0.'
    );
    assert(Array.isArray(home.popular.featuredIds), 'popular.featuredIds debe ser array.');

    if (Array.isArray(home.popular.featuredIds)) {
      home.popular.featuredIds.forEach((id) => {
        if (!isNonEmptyString(id)) {
          errors.push('popular.featuredIds no puede contener valores vacios.');
          return;
        }

        if (!menuIds.has(id.trim())) {
          errors.push(`popular.featuredIds contiene ID inexistente en menu.json: ${id}`);
        }
      });

      assertWarning(
        home.popular.featuredIds.length > 0,
        'popular.featuredIds esta vacio. Se usara fallback automatico en runtime.'
      );
    }
  } else {
    errors.push('popular debe ser un objeto.');
  }

  if (isObject(home.eventsPreview)) {
    assert(
      typeof home.eventsPreview.enabled === 'boolean',
      'eventsPreview.enabled debe ser boolean.'
    );
    assert(isNonEmptyString(home.eventsPreview.title), 'eventsPreview.title es requerido.');
    assert(
      Number.isFinite(Number(home.eventsPreview.limit)) && Number(home.eventsPreview.limit) > 0,
      'eventsPreview.limit debe ser numero mayor que 0.'
    );

    if ('items' in home.eventsPreview) {
      assert(Array.isArray(home.eventsPreview.items), 'eventsPreview.items debe ser array.');

      if (Array.isArray(home.eventsPreview.items)) {
        home.eventsPreview.items.forEach((item, index) => {
          if (!isObject(item)) {
            errors.push(`eventsPreview.items[${index}] debe ser objeto.`);
            return;
          }

          assert(isNonEmptyString(item.id), `eventsPreview.items[${index}].id es requerido.`);
          assert(
            isNonEmptyString(item.title),
            `eventsPreview.items[${index}].title es requerido.`
          );
          assert(
            isNonEmptyString(item.subtitle),
            `eventsPreview.items[${index}].subtitle es requerido.`
          );

          if ('video' in item && item.video && !isNonEmptyString(item.video)) {
            errors.push(`eventsPreview.items[${index}].video debe ser string si se define.`);
          }
        });
      }
    }
  } else {
    errors.push('eventsPreview debe ser un objeto.');
  }

  if (isObject(home.delivery)) {
    assert(isNonEmptyString(home.delivery.title), 'delivery.title es requerido.');
    assert(isNonEmptyString(home.delivery.subtitle), 'delivery.subtitle es requerido.');
    assert(isObject(home.delivery.links), 'delivery.links debe ser objeto.');

    if (isObject(home.delivery.links)) {
      ['pedidosya', 'ubereats', 'takeout', 'whatsapp'].forEach((key) => {
        const value = home.delivery.links[key];

        if (value === undefined || value === null || value === '') {
          warnings.push(`delivery.links.${key} vacio. Ese boton se ocultara en UI.`);
          return;
        }

        if (!isValidLink(value)) {
          errors.push(`delivery.links.${key} no es una URL/ruta valida.`);
        }
      });
    }
  } else {
    errors.push('delivery debe ser un objeto.');
  }

  if (isObject(home.reservation)) {
    assert(
      typeof home.reservation.enabled === 'boolean',
      'reservation.enabled debe ser boolean.'
    );
    assert(isNonEmptyString(home.reservation.title), 'reservation.title es requerido.');
    assert(isNonEmptyString(home.reservation.ctaLabel), 'reservation.ctaLabel es requerido.');
    assert(isValidLink(home.reservation.url), 'reservation.url debe ser una URL/ruta valida.');
  } else {
    errors.push('reservation debe ser un objeto.');
  }

  if (isObject(home.announcements)) {
    assert(
      typeof home.announcements.enabled === 'boolean',
      'announcements.enabled debe ser boolean.'
    );

    if (home.announcements.enabled) {
      assert(
        isNonEmptyString(home.announcements.message),
        'announcements.message es requerido cuando enabled=true.'
      );
    }

    if (isNonEmptyString(home.announcements.link)) {
      assert(
        isValidLink(home.announcements.link),
        'announcements.link debe ser una URL/ruta valida.'
      );
    }

    if (isNonEmptyString(home.announcements.type)) {
      const allowed = ['highlight', 'warning', 'info'];
      assert(
        allowed.includes(home.announcements.type),
        'announcements.type debe ser highlight, warning o info.'
      );
    }
  } else {
    errors.push('announcements debe ser un objeto.');
  }

  if (isObject(home.sections)) {
    ['hero', 'popular', 'events', 'delivery', 'reservation'].forEach((key) => {
      assert(typeof home.sections[key] === 'boolean', `sections.${key} debe ser boolean.`);
    });

    if ('announcements' in home.sections) {
      assert(
        typeof home.sections.announcements === 'boolean',
        'sections.announcements debe ser boolean si se define.'
      );
    }
  } else {
    errors.push('sections debe ser un objeto.');
  }
}

if (errors.length === 0) {
  console.log('home.json valido.');
} else {
  console.error('Se encontraron errores en home.json:');
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
