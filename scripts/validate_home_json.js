const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const homePath = path.join(projectRoot, 'data', 'home.json');
const menuPath = path.join(projectRoot, 'data', 'menu.json');

const errors = [];
const warnings = [];
const DELIVERY_ICON_MIN_SIZE = 16;
const DELIVERY_ICON_MAX_SIZE = 64;
const TESTIMONIALS_LIMIT = 9;
const TESTIMONIALS_STARS_MIN = 1;
const TESTIMONIALS_STARS_MAX = 5;
const FOOTER_COLUMNS_COUNT = 3;
const FOOTER_LINKS_LIMIT = 8;

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

const assertStringIfDefined = (value, message) => {
  if (value !== undefined && value !== null && typeof value !== 'string') {
    errors.push(message);
  }
};

const home = readJson(homePath, 'data/home.json');
const menu = readJson(menuPath, 'data/menu.json');

if (home && menu) {
  const requiredTopLevel = [
    'hero',
    'popular',
    'menu_page',
    'menu_detail_editorial',
    'eventsPreview',
    'delivery',
    'reservation',
    'announcements',
    'testimonials',
    'footer',
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

  if ('menu_page' in home) {
    assert(isObject(home.menu_page), 'menu_page debe ser un objeto cuando existe.');
    if (isObject(home.menu_page)) {
      assert(isObject(home.menu_page.hero), 'menu_page.hero debe ser objeto.');
      if (isObject(home.menu_page.hero)) {
        assertStringIfDefined(home.menu_page.hero.title, 'menu_page.hero.title debe ser string.');
        assertStringIfDefined(home.menu_page.hero.subtitle, 'menu_page.hero.subtitle debe ser string.');
      }

      assert(isObject(home.menu_page.search), 'menu_page.search debe ser objeto.');
      if (isObject(home.menu_page.search)) {
        assertStringIfDefined(home.menu_page.search.placeholder, 'menu_page.search.placeholder debe ser string.');
        assertStringIfDefined(home.menu_page.search.helper_prefix, 'menu_page.search.helper_prefix debe ser string.');
        if ('helper_words' in home.menu_page.search) {
          assert(Array.isArray(home.menu_page.search.helper_words), 'menu_page.search.helper_words debe ser array.');
          if (Array.isArray(home.menu_page.search.helper_words)) {
            home.menu_page.search.helper_words.forEach((word, index) => {
              assert(
                typeof word === 'string',
                `menu_page.search.helper_words[${index}] debe ser string.`
              );
            });
          }
        }
        assert(isObject(home.menu_page.search.empty_state), 'menu_page.search.empty_state debe ser objeto.');
        if (isObject(home.menu_page.search.empty_state)) {
          assertStringIfDefined(
            home.menu_page.search.empty_state.title,
            'menu_page.search.empty_state.title debe ser string.'
          );
          assertStringIfDefined(
            home.menu_page.search.empty_state.description,
            'menu_page.search.empty_state.description debe ser string.'
          );
          assertStringIfDefined(
            home.menu_page.search.empty_state.description_with_query,
            'menu_page.search.empty_state.description_with_query debe ser string.'
          );
          assertStringIfDefined(
            home.menu_page.search.empty_state.hint,
            'menu_page.search.empty_state.hint debe ser string.'
          );
        }
      }

      assert(isObject(home.menu_page.account_modal), 'menu_page.account_modal debe ser objeto.');
      if (isObject(home.menu_page.account_modal)) {
        assertStringIfDefined(home.menu_page.account_modal.title, 'menu_page.account_modal.title debe ser string.');
        assert(isObject(home.menu_page.account_modal.empty_state), 'menu_page.account_modal.empty_state debe ser objeto.');
        if (isObject(home.menu_page.account_modal.empty_state)) {
          assertStringIfDefined(
            home.menu_page.account_modal.empty_state.title,
            'menu_page.account_modal.empty_state.title debe ser string.'
          );
          assertStringIfDefined(
            home.menu_page.account_modal.empty_state.description,
            'menu_page.account_modal.empty_state.description debe ser string.'
          );
        }
        assert(isObject(home.menu_page.account_modal.labels), 'menu_page.account_modal.labels debe ser objeto.');
        if (isObject(home.menu_page.account_modal.labels)) {
          ['subtotal', 'itbis', 'legal_tip', 'total'].forEach((labelKey) => {
            assertStringIfDefined(
              home.menu_page.account_modal.labels[labelKey],
              `menu_page.account_modal.labels.${labelKey} debe ser string.`
            );
          });
        }
        assert(isObject(home.menu_page.account_modal.total_tooltip), 'menu_page.account_modal.total_tooltip debe ser objeto.');
        if (isObject(home.menu_page.account_modal.total_tooltip)) {
          assertStringIfDefined(
            home.menu_page.account_modal.total_tooltip.title,
            'menu_page.account_modal.total_tooltip.title debe ser string.'
          );
          assertStringIfDefined(
            home.menu_page.account_modal.total_tooltip.description,
            'menu_page.account_modal.total_tooltip.description debe ser string.'
          );
        }
        assert(isObject(home.menu_page.account_modal.remove_toast), 'menu_page.account_modal.remove_toast debe ser objeto.');
        if (isObject(home.menu_page.account_modal.remove_toast)) {
          assertStringIfDefined(
            home.menu_page.account_modal.remove_toast.title,
            'menu_page.account_modal.remove_toast.title debe ser string.'
          );
          assertStringIfDefined(
            home.menu_page.account_modal.remove_toast.description,
            'menu_page.account_modal.remove_toast.description debe ser string.'
          );
        }
      }

      if ('filter_modal' in home.menu_page) {
        assert(isObject(home.menu_page.filter_modal), 'menu_page.filter_modal debe ser objeto.');
        if (isObject(home.menu_page.filter_modal)) {
          assertStringIfDefined(
            home.menu_page.filter_modal.title,
            'menu_page.filter_modal.title debe ser string.'
          );
          assert(
            isObject(home.menu_page.filter_modal.sections),
            'menu_page.filter_modal.sections debe ser objeto.'
          );
          if (isObject(home.menu_page.filter_modal.sections)) {
            assert(
              isObject(home.menu_page.filter_modal.sections.allergens),
              'menu_page.filter_modal.sections.allergens debe ser objeto.'
            );
            if (isObject(home.menu_page.filter_modal.sections.allergens)) {
              assertStringIfDefined(
                home.menu_page.filter_modal.sections.allergens.title,
                'menu_page.filter_modal.sections.allergens.title debe ser string.'
              );
              assertStringIfDefined(
                home.menu_page.filter_modal.sections.allergens.description,
                'menu_page.filter_modal.sections.allergens.description debe ser string.'
              );
            }

            assert(
              isObject(home.menu_page.filter_modal.sections.pizza_type),
              'menu_page.filter_modal.sections.pizza_type debe ser objeto.'
            );
            if (isObject(home.menu_page.filter_modal.sections.pizza_type)) {
              assertStringIfDefined(
                home.menu_page.filter_modal.sections.pizza_type.title,
                'menu_page.filter_modal.sections.pizza_type.title debe ser string.'
              );
              assert(
                isObject(home.menu_page.filter_modal.sections.pizza_type.tabs),
                'menu_page.filter_modal.sections.pizza_type.tabs debe ser objeto.'
              );
              if (isObject(home.menu_page.filter_modal.sections.pizza_type.tabs)) {
                ['all', 'clasica', 'autor'].forEach((tabKey) => {
                  assertStringIfDefined(
                    home.menu_page.filter_modal.sections.pizza_type.tabs[tabKey],
                    `menu_page.filter_modal.sections.pizza_type.tabs.${tabKey} debe ser string.`
                  );
                });
              }
            }

            assert(
              isObject(home.menu_page.filter_modal.sections.price_range),
              'menu_page.filter_modal.sections.price_range debe ser objeto.'
            );
            if (isObject(home.menu_page.filter_modal.sections.price_range)) {
              ['title', 'description', 'min_label', 'max_label'].forEach((key) => {
                assertStringIfDefined(
                  home.menu_page.filter_modal.sections.price_range[key],
                  `menu_page.filter_modal.sections.price_range.${key} debe ser string.`
                );
              });
            }

            assert(
              isObject(home.menu_page.filter_modal.sections.dietary),
              'menu_page.filter_modal.sections.dietary debe ser objeto.'
            );
            if (isObject(home.menu_page.filter_modal.sections.dietary)) {
              [
                'title',
                'vegetarian_title',
                'vegetarian_description',
                'vegan_title',
                'vegan_description',
              ].forEach((key) => {
                assertStringIfDefined(
                  home.menu_page.filter_modal.sections.dietary[key],
                  `menu_page.filter_modal.sections.dietary.${key} debe ser string.`
                );
              });
            }

            assert(
              isObject(home.menu_page.filter_modal.sections.organoleptic),
              'menu_page.filter_modal.sections.organoleptic debe ser objeto.'
            );
            if (isObject(home.menu_page.filter_modal.sections.organoleptic)) {
              assertStringIfDefined(
                home.menu_page.filter_modal.sections.organoleptic.title,
                'menu_page.filter_modal.sections.organoleptic.title debe ser string.'
              );
              assertStringIfDefined(
                home.menu_page.filter_modal.sections.organoleptic.description,
                'menu_page.filter_modal.sections.organoleptic.description debe ser string.'
              );
            }
          }

          assert(
            isObject(home.menu_page.filter_modal.actions),
            'menu_page.filter_modal.actions debe ser objeto.'
          );
          if (isObject(home.menu_page.filter_modal.actions)) {
            ['clear_label', 'apply_prefix', 'apply_suffix'].forEach((key) => {
              assertStringIfDefined(
                home.menu_page.filter_modal.actions[key],
                `menu_page.filter_modal.actions.${key} debe ser string.`
              );
            });
          }
        }
      }

      assert(isObject(home.menu_page.states), 'menu_page.states debe ser objeto.');
      if (isObject(home.menu_page.states)) {
        ['loading', 'no_categories', 'load_error'].forEach((stateKey) => {
          assertStringIfDefined(
            home.menu_page.states[stateKey],
            `menu_page.states.${stateKey} debe ser string.`
          );
        });
      }

      assert(
        isObject(home.menu_page.category_empty_messages),
        'menu_page.category_empty_messages debe ser objeto.'
      );
      if (isObject(home.menu_page.category_empty_messages)) {
        ['entradas', 'pizzas', 'postres', 'bebidas', 'productos'].forEach((categoryKey) => {
          assertStringIfDefined(
            home.menu_page.category_empty_messages[categoryKey],
            `menu_page.category_empty_messages.${categoryKey} debe ser string.`
          );
        });
      }
    }
  }

  if ('menu_detail_editorial' in home) {
    assert(
      isObject(home.menu_detail_editorial),
      'menu_detail_editorial debe ser un objeto cuando existe.'
    );

    if (isObject(home.menu_detail_editorial)) {
      assertStringIfDefined(
        home.menu_detail_editorial.sensory_subtitle,
        'menu_detail_editorial.sensory_subtitle debe ser string cuando existe.'
      );

      if ('sensory' in home.menu_detail_editorial) {
        assert(isObject(home.menu_detail_editorial.sensory), 'menu_detail_editorial.sensory debe ser objeto.');
        if (isObject(home.menu_detail_editorial.sensory)) {
          assertStringIfDefined(
            home.menu_detail_editorial.sensory.section_title,
            'menu_detail_editorial.sensory.section_title debe ser string.'
          );
          assertStringIfDefined(
            home.menu_detail_editorial.sensory.subtitle,
            'menu_detail_editorial.sensory.subtitle debe ser string.'
          );
          assertStringIfDefined(
            home.menu_detail_editorial.sensory.compare_button_label,
            'menu_detail_editorial.sensory.compare_button_label debe ser string.'
          );
          assertStringIfDefined(
            home.menu_detail_editorial.sensory.compare_button_label_active,
            'menu_detail_editorial.sensory.compare_button_label_active debe ser string.'
          );
          assertStringIfDefined(
            home.menu_detail_editorial.sensory.comparison_clear_label,
            'menu_detail_editorial.sensory.comparison_clear_label debe ser string.'
          );
        }
      }

      if ('compare_modal' in home.menu_detail_editorial) {
        assert(isObject(home.menu_detail_editorial.compare_modal), 'menu_detail_editorial.compare_modal debe ser objeto.');
      }
      if ('pairings' in home.menu_detail_editorial) {
        assert(isObject(home.menu_detail_editorial.pairings), 'menu_detail_editorial.pairings debe ser objeto.');
      }
      if ('story' in home.menu_detail_editorial) {
        assert(isObject(home.menu_detail_editorial.story), 'menu_detail_editorial.story debe ser objeto.');
      }
      if ('info_chips' in home.menu_detail_editorial) {
        assert(isObject(home.menu_detail_editorial.info_chips), 'menu_detail_editorial.info_chips debe ser objeto.');
      }
      if ('sensory_axis_tooltips' in home.menu_detail_editorial) {
        assert(
          isObject(home.menu_detail_editorial.sensory_axis_tooltips),
          'menu_detail_editorial.sensory_axis_tooltips debe ser objeto.'
        );
      }
    }
  }

  if (isObject(home.delivery)) {
    assert(isNonEmptyString(home.delivery.title), 'delivery.title es requerido.');
    assert(isNonEmptyString(home.delivery.subtitle), 'delivery.subtitle es requerido.');
    assert(isObject(home.delivery.platforms), 'delivery.platforms debe ser objeto.');

    if (isObject(home.delivery.platforms)) {
      ['pedidosya', 'ubereats', 'takeout', 'whatsapp'].forEach((key) => {
        const platform = home.delivery.platforms[key];
        assert(isObject(platform), `delivery.platforms.${key} debe ser objeto.`);
        if (!isObject(platform)) return;

        const value = platform.url;
        if (value === undefined || value === null || value === '') {
          warnings.push(`delivery.platforms.${key}.url vacio. Ese boton se ocultara en UI.`);
        } else if (!isValidLink(value)) {
          errors.push(`delivery.platforms.${key}.url no es una URL/ruta valida.`);
        }

        assert(
          isNonEmptyString(platform.icon),
          `delivery.platforms.${key}.icon es requerido y debe ser string.`
        );

        const iconSize = Number(platform.iconSize);
        assert(
          Number.isFinite(iconSize) &&
            iconSize >= DELIVERY_ICON_MIN_SIZE &&
            iconSize <= DELIVERY_ICON_MAX_SIZE,
          `delivery.platforms.${key}.iconSize debe estar entre ${DELIVERY_ICON_MIN_SIZE} y ${DELIVERY_ICON_MAX_SIZE}.`
        );
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

  if (isObject(home.testimonials)) {
    assert(
      typeof home.testimonials.enabled === 'boolean',
      'testimonials.enabled debe ser boolean.'
    );
    assert(isNonEmptyString(home.testimonials.title), 'testimonials.title es requerido.');
    assert(isNonEmptyString(home.testimonials.subtitle), 'testimonials.subtitle es requerido.');
    assert(Array.isArray(home.testimonials.items), 'testimonials.items debe ser array.');

    if (Array.isArray(home.testimonials.items)) {
      assert(
        home.testimonials.items.length <= TESTIMONIALS_LIMIT,
        `testimonials.items no debe exceder ${TESTIMONIALS_LIMIT} items.`
      );
      assertWarning(
        home.testimonials.items.length > 0,
        'testimonials.items esta vacio. Se usara fallback automatico en runtime.'
      );

      home.testimonials.items.forEach((item, index) => {
        assert(isObject(item), `testimonials.items[${index}] debe ser objeto.`);
        if (!isObject(item)) return;

        assert(
          isNonEmptyString(item.name),
          `testimonials.items[${index}].name es requerido.`
        );
        assert(
          isNonEmptyString(item.role),
          `testimonials.items[${index}].role es requerido.`
        );
        assert(
          isNonEmptyString(item.text),
          `testimonials.items[${index}].text es requerido.`
        );

        const starsValue = Number(item.stars);
        assert(
          Number.isInteger(starsValue) &&
            starsValue >= TESTIMONIALS_STARS_MIN &&
            starsValue <= TESTIMONIALS_STARS_MAX,
          `testimonials.items[${index}].stars debe ser entero entre ${TESTIMONIALS_STARS_MIN} y ${TESTIMONIALS_STARS_MAX}.`
        );
      });
    }
  } else {
    errors.push('testimonials debe ser un objeto.');
  }

  if (isObject(home.footer)) {
    assert(typeof home.footer.enabled === 'boolean', 'footer.enabled debe ser boolean.');
    assert(Array.isArray(home.footer.columns), 'footer.columns debe ser array.');
    assert(isObject(home.footer.cta), 'footer.cta debe ser objeto.');
    assert(isObject(home.footer.socials), 'footer.socials debe ser objeto.');

    if (Array.isArray(home.footer.columns)) {
      assert(
        home.footer.columns.length === FOOTER_COLUMNS_COUNT,
        `footer.columns debe contener exactamente ${FOOTER_COLUMNS_COUNT} columnas (Empresa/Socials/Contactanos).`
      );

      home.footer.columns.forEach((column, columnIndex) => {
        assert(isObject(column), `footer.columns[${columnIndex}] debe ser objeto.`);
        if (!isObject(column)) return;

        assert(
          isNonEmptyString(column.title),
          `footer.columns[${columnIndex}].title es requerido.`
        );
        assert(
          Array.isArray(column.links),
          `footer.columns[${columnIndex}].links debe ser array.`
        );

        if (Array.isArray(column.links)) {
          assert(
            column.links.length <= FOOTER_LINKS_LIMIT,
            `footer.columns[${columnIndex}].links no debe exceder ${FOOTER_LINKS_LIMIT} links.`
          );
          column.links.forEach((linkEntry, linkIndex) => {
            assert(
              isObject(linkEntry),
              `footer.columns[${columnIndex}].links[${linkIndex}] debe ser objeto.`
            );
            if (!isObject(linkEntry)) return;

            assert(
              isNonEmptyString(linkEntry.label),
              `footer.columns[${columnIndex}].links[${linkIndex}].label es requerido.`
            );
            if (isNonEmptyString(linkEntry.url)) {
              assert(
                isValidLink(linkEntry.url),
                `footer.columns[${columnIndex}].links[${linkIndex}].url debe ser URL/ruta valida.`
              );
            } else {
              warnings.push(
                `footer.columns[${columnIndex}].links[${linkIndex}].url vacio. Ese link quedara inactivo.`
              );
            }
          });
        }
      });
    }

    if (isObject(home.footer.cta)) {
      assert(isNonEmptyString(home.footer.cta.label), 'footer.cta.label es requerido.');
      assert(
        isValidLink(home.footer.cta.url),
        'footer.cta.url debe ser una URL/ruta valida.'
      );
    }

    if (isObject(home.footer.socials)) {
      ['instagram', 'tiktok', 'tripadvisor'].forEach((key) => {
        const value = home.footer.socials[key];
        if (value === undefined || value === null || value === '') {
          warnings.push(`footer.socials.${key} vacio. Ese icono se ocultara en UI.`);
          return;
        }
        assert(
          isValidLink(value),
          `footer.socials.${key} debe ser una URL/ruta valida.`
        );
      });
    }
  } else {
    errors.push('footer debe ser un objeto.');
  }

  if (isObject(home.sections)) {
    ['navbar', 'hero', 'popular', 'events', 'delivery', 'reservation', 'testimonials', 'footer'].forEach((key) => {
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
