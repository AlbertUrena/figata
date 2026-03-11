(function (root, factory) {
  var menuTraits = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = menuTraits;
  }
  if (root) {
    root.FigataMenuTraits = menuTraits;
  }
})(
  typeof globalThis !== "undefined"
    ? globalThis
    : (typeof window !== "undefined" ? window : this),
  function () {
    var CONTENT_FLAG_LIST = [
      { id: "pork", label: "Cerdo", order: 1 },
      { id: "fish", label: "Pescado", order: 2 },
      { id: "nuts", label: "Frutos secos", order: 3 }
    ];

    var EXPERIENCE_LIST = [
      { id: "truffled", label: "Trufada", threshold: 2, priority: 1 },
      { id: "smoked", label: "Ahumada", threshold: 2, priority: 2 },
      { id: "spicy", label: "Picante", threshold: 2, priority: 3 },
      { id: "sweet_savory", label: "Dulce-salada", threshold: 2, priority: 4 },
      { id: "fresh", label: "Fresca", threshold: 2, priority: 5 },
      { id: "aromatic", label: "Aromática", threshold: 2, priority: 6 },
      { id: "classic", label: "Clásica", threshold: 2, priority: 7 },
      { id: "intense", label: "Intensa", threshold: 3, priority: 8 }
    ];

    var INTERNAL_TRAIT_LIST = [
      { id: "herb", label: "Hierba" },
      { id: "leafy_green", label: "Hoja verde" },
      { id: "oil", label: "Aceite" },
      { id: "tomato_base", label: "Base de tomate" },
      { id: "fresh_cheese", label: "Queso fresco" },
      { id: "aged_cheese", label: "Queso curado" },
      { id: "goat_cheese", label: "Queso de cabra" },
      { id: "smoked_cheese", label: "Queso ahumado" },
      { id: "truffle", label: "Trufa" },
      { id: "pork", label: "Cerdo" },
      { id: "fish", label: "Pescado" },
      { id: "nuts", label: "Frutos secos" },
      { id: "cured_meat", label: "Curado" },
      { id: "spicy", label: "Picante" },
      { id: "sweet", label: "Dulce" },
      { id: "jam", label: "Mermelada" },
      { id: "pesto", label: "Pesto" },
      { id: "mushroom", label: "Hongo" }
    ];

    var PUBLIC_BADGE_LIMITS = {
      dietary: 1,
      content: 2,
      experience: 2
    };

    var LEGACY_TAG_METADATA = {
      vegetarian: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: false }
      },
      vegan: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: true }
      },
      spicy: {
        experience_signals: { spicy: 2, intense: 1 },
        internal_traits: ["spicy"]
      },
      pork: {
        content_flags: ["pork"],
        internal_traits: ["pork"]
      },
      cured_meat: {
        experience_signals: { intense: 1 },
        internal_traits: ["cured_meat"]
      },
      herb: {
        experience_signals: { fresh: 1, aromatic: 2 },
        internal_traits: ["herb"]
      },
      sauce: {
        internal_traits: ["tomato_base"]
      }
    };

    var LEGACY_INGREDIENT_HINTS = {
      aceitunas: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: true },
        experience_signals: { classic: 1, intense: 1 }
      },
      ajo: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: true },
        experience_signals: { aromatic: 1, intense: 1, classic: 1 }
      },
      albahaca: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: true },
        experience_signals: { fresh: 2, aromatic: 2, classic: 1 },
        internal_traits: ["herb"]
      },
      alcaparras: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: true },
        experience_signals: { classic: 1, intense: 1 }
      },
      bacon: {
        content_flags: ["pork"],
        experience_signals: { smoked: 2, intense: 2 },
        internal_traits: ["pork", "cured_meat"]
      },
      berenjena: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: true },
        experience_signals: { classic: 1, fresh: 1 }
      },
      burrata_fresca: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: false },
        experience_signals: { fresh: 2, classic: 1 },
        internal_traits: ["fresh_cheese"]
      },
      cebolla: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: true },
        experience_signals: { aromatic: 1, fresh: 1, intense: 1 }
      },
      peperoncino: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: true },
        experience_signals: { spicy: 3, intense: 1 },
        internal_traits: ["spicy"]
      },
      chili_flakes: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: true },
        experience_signals: { spicy: 3, intense: 1 },
        internal_traits: ["spicy"]
      },
      nduja: {
        content_flags: ["pork"],
        experience_signals: { spicy: 3, intense: 3, smoked: 1 },
        internal_traits: ["pork", "cured_meat", "spicy"]
      },
      porcini: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: true },
        experience_signals: { aromatic: 1, intense: 1, classic: 1 },
        internal_traits: ["mushroom"]
      },
      prosciutto_di_parma: {
        content_flags: ["pork"],
        experience_signals: { intense: 2 },
        internal_traits: ["pork", "cured_meat"]
      },
      bresaola: {
        experience_signals: { intense: 2 },
        internal_traits: ["cured_meat"]
      },
      mortadella: {
        content_flags: ["pork"],
        experience_signals: { intense: 2, aromatic: 1 },
        internal_traits: ["pork", "cured_meat"]
      },
      menta: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: true },
        experience_signals: { fresh: 2, aromatic: 2 },
        internal_traits: ["herb"]
      },
      mermelada_de_tomate: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: true },
        experience_signals: { sweet_savory: 2, classic: 1 },
        internal_traits: ["sweet", "jam"]
      },
      miel: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: false },
        experience_signals: { sweet_savory: 2 },
        internal_traits: ["sweet"]
      },
      aceite_de_oliva_evoo: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: true },
        experience_signals: { fresh: 1, classic: 1 },
        internal_traits: ["oil"]
      },
      oregano: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: true },
        experience_signals: { aromatic: 2, classic: 1 },
        internal_traits: ["herb"]
      },
      pancetta: {
        content_flags: ["pork"],
        experience_signals: { intense: 2 },
        internal_traits: ["pork", "cured_meat"]
      },
      atun: {
        content_flags: ["fish"],
        experience_signals: { intense: 1 },
        internal_traits: ["fish"]
      },
      pesto_de_albahaca: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: false },
        experience_signals: { fresh: 2, aromatic: 2, classic: 1 },
        internal_traits: ["pesto", "herb"]
      },
      pesto_de_rucula: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: false },
        experience_signals: { fresh: 2, aromatic: 2 },
        internal_traits: ["pesto", "leafy_green"]
      },
      pesto_de_pistacho: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: false },
        content_flags: ["nuts"],
        experience_signals: { aromatic: 2, intense: 1, sweet_savory: 1 },
        internal_traits: ["pesto", "nuts"]
      },
      pistachos: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: false },
        content_flags: ["nuts"],
        experience_signals: { intense: 1, sweet_savory: 1 },
        internal_traits: ["nuts"]
      },
      mozzarella: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: false },
        experience_signals: { classic: 1, fresh: 1 },
        internal_traits: ["fresh_cheese"]
      },
      fior_di_latte: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: false },
        experience_signals: { classic: 1, fresh: 1 },
        internal_traits: ["fresh_cheese"]
      },
      parmigiano_reggiano: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: false },
        experience_signals: { classic: 1, intense: 1 },
        internal_traits: ["aged_cheese"]
      },
      pecorino: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: false },
        experience_signals: { classic: 1, intense: 1 },
        internal_traits: ["aged_cheese"]
      },
      provola: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: false },
        experience_signals: { classic: 1, smoked: 2 },
        internal_traits: ["smoked_cheese"]
      },
      ricotta: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: false },
        experience_signals: { fresh: 1 },
        internal_traits: ["fresh_cheese"]
      },
      queso_de_cabra: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: false },
        experience_signals: { fresh: 1, intense: 1 },
        internal_traits: ["goat_cheese", "fresh_cheese"]
      },
      gorgonzola: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: false },
        experience_signals: { intense: 2 },
        internal_traits: ["aged_cheese"]
      },
      pecorino_trufado: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: false },
        experience_signals: { truffled: 2, intense: 1 },
        internal_traits: ["aged_cheese", "truffle"]
      },
      quesos_tagliere: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: false },
        experience_signals: { intense: 1 },
        internal_traits: ["aged_cheese"]
      },
      romero: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: true },
        experience_signals: { aromatic: 2, classic: 1 },
        internal_traits: ["herb"]
      },
      rucula: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: true },
        experience_signals: { fresh: 2, aromatic: 1 },
        internal_traits: ["leafy_green"]
      },
      salamino_piccante: {
        content_flags: ["pork"],
        experience_signals: { spicy: 2, intense: 2 },
        internal_traits: ["pork", "cured_meat", "spicy"]
      },
      soppressata: {
        content_flags: ["pork"],
        experience_signals: { intense: 2, spicy: 1 },
        internal_traits: ["pork", "cured_meat"]
      },
      salsiccia: {
        content_flags: ["pork"],
        experience_signals: { intense: 2 },
        internal_traits: ["pork"]
      },
      san_marzano_dop: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: true },
        experience_signals: { classic: 2, fresh: 1 },
        internal_traits: ["tomato_base"]
      },
      stracciatella: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: false },
        experience_signals: { fresh: 2 },
        internal_traits: ["fresh_cheese"]
      },
      tomate_cherry: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: true },
        experience_signals: { fresh: 2, classic: 1 },
        internal_traits: ["tomato_base"]
      },
      pomodoro: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: true },
        experience_signals: { classic: 2, fresh: 1 },
        internal_traits: ["tomato_base"]
      },
      salsa_de_tomate: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: true },
        experience_signals: { classic: 2 },
        internal_traits: ["tomato_base"]
      },
      crema_de_trufa: {
        dietary_profile: { vegetarian_safe: true, vegan_safe: false },
        experience_signals: { truffled: 3, intense: 1, aromatic: 1 },
        internal_traits: ["truffle"]
      }
    };

    var EXPERIENCE_COMBINATION_BONUSES = [
      {
        id: "classic_base",
        all: ["tomato_base", "fresh_cheese", "herb"],
        bonuses: { classic: 2, fresh: 1 }
      },
      {
        id: "herb_finish",
        all: ["herb", "oil"],
        bonuses: { aromatic: 1 }
      },
      {
        id: "spicy_pork",
        all: ["spicy", "pork"],
        bonuses: { spicy: 1, intense: 1 }
      },
      {
        id: "sweet_pork",
        all: ["sweet", "pork"],
        bonuses: { sweet_savory: 3 }
      },
      {
        id: "truffle_cheese",
        all: ["truffle"],
        any: ["fresh_cheese", "aged_cheese", "goat_cheese"],
        bonuses: { truffled: 1, intense: 1 }
      },
      {
        id: "smoked_cheese",
        any: ["smoked_cheese"],
        bonuses: { smoked: 1 }
      },
      {
        id: "green_finish",
        all: ["leafy_green"],
        any: ["cured_meat", "fresh_cheese"],
        bonuses: { fresh: 1 }
      },
      {
        id: "truffle_mushroom",
        all: ["truffle", "mushroom"],
        bonuses: { truffled: 1, intense: 1 }
      }
    ];

    var CONTENT_FLAG_MAP = indexById(CONTENT_FLAG_LIST);
    var EXPERIENCE_MAP = indexById(EXPERIENCE_LIST);
    var INTERNAL_TRAIT_MAP = indexById(INTERNAL_TRAIT_LIST);

    function indexById(list) {
      var map = {};
      (Array.isArray(list) ? list : []).forEach(function (entry) {
        if (!entry || !entry.id) return;
        map[entry.id] = entry;
      });
      return map;
    }

    function isObject(value) {
      return Boolean(value) && typeof value === "object" && !Array.isArray(value);
    }

    function cloneJson(value) {
      return JSON.parse(JSON.stringify(value));
    }

    function normalizeText(value) {
      return String(value || "").trim();
    }

    function normalizeStringArray(value) {
      if (!Array.isArray(value)) return [];
      var seen = {};
      var result = [];
      value.forEach(function (entry) {
        var normalized = normalizeText(entry);
        if (!normalized || seen[normalized]) return;
        seen[normalized] = true;
        result.push(normalized);
      });
      return result;
    }

    function normalizeBoolean(value, defaultValue) {
      if (typeof value === "boolean") return value;
      return Boolean(defaultValue);
    }

    function normalizeNullableBoolean(value) {
      if (value === null || typeof value === "undefined" || value === "") return null;
      if (typeof value === "boolean") return value;
      if (value === "true") return true;
      if (value === "false") return false;
      return null;
    }

    function normalizeNumber(value, defaultValue) {
      var numeric = Number(value);
      if (!Number.isFinite(numeric) || numeric < 0) {
        return defaultValue;
      }
      return numeric;
    }

    function createEmptyExperienceScores() {
      var scores = {};
      EXPERIENCE_LIST.forEach(function (definition) {
        scores[definition.id] = 0;
      });
      return scores;
    }

    function createEmptyContentFlags() {
      var flags = {};
      CONTENT_FLAG_LIST.forEach(function (definition) {
        flags[definition.id] = false;
      });
      return flags;
    }

    function createEmptyDietaryProfile() {
      return {
        vegetarian_safe: false,
        vegan_safe: false
      };
    }

    function createEmptyIngredientMetadata() {
      return {
        dietary_profile: createEmptyDietaryProfile(),
        content_flags: [],
        experience_signals: createEmptyExperienceScores(),
        internal_traits: []
      };
    }

    function normalizeDefinitionIds(rawIds, definitionMap) {
      var seen = {};
      var result = [];
      normalizeStringArray(rawIds).forEach(function (entry) {
        if (!definitionMap[entry] || seen[entry]) return;
        seen[entry] = true;
        result.push(entry);
      });
      return result;
    }

    function applyNumericSeed(target, seed) {
      if (!isObject(seed)) return;
      EXPERIENCE_LIST.forEach(function (definition) {
        if (!Object.prototype.hasOwnProperty.call(seed, definition.id)) return;
        target[definition.id] = normalizeNumber(seed[definition.id], 0);
      });
    }

    function buildLegacyIngredientSeed(ingredient, ingredientId) {
      var seed = createEmptyIngredientMetadata();
      var hint = LEGACY_INGREDIENT_HINTS[ingredientId] || {};
      var legacyTags = normalizeStringArray(ingredient && ingredient.tags);
      var usedHintForDietary = false;
      var usedHintForContent = false;
      var usedHintForSignals = false;
      var usedHintForTraits = false;

      if (isObject(hint.dietary_profile)) {
        seed.dietary_profile.vegetarian_safe = normalizeBoolean(
          hint.dietary_profile.vegetarian_safe,
          false
        );
        seed.dietary_profile.vegan_safe = normalizeBoolean(
          hint.dietary_profile.vegan_safe,
          false
        );
        usedHintForDietary = true;
      }

      if (Array.isArray(hint.content_flags)) {
        seed.content_flags = normalizeDefinitionIds(hint.content_flags, CONTENT_FLAG_MAP);
        usedHintForContent = true;
      }

      if (isObject(hint.experience_signals)) {
        applyNumericSeed(seed.experience_signals, hint.experience_signals);
        usedHintForSignals = true;
      }

      if (Array.isArray(hint.internal_traits)) {
        seed.internal_traits = normalizeDefinitionIds(hint.internal_traits, INTERNAL_TRAIT_MAP);
        usedHintForTraits = true;
      }

      legacyTags.forEach(function (tagId) {
        var legacyEntry = LEGACY_TAG_METADATA[tagId];
        if (!legacyEntry) return;

        if (!usedHintForDietary && isObject(legacyEntry.dietary_profile)) {
          if (legacyEntry.dietary_profile.vegetarian_safe === true) {
            seed.dietary_profile.vegetarian_safe = true;
          }
          if (legacyEntry.dietary_profile.vegan_safe === true) {
            seed.dietary_profile.vegan_safe = true;
          }
        }

        if (!usedHintForContent && Array.isArray(legacyEntry.content_flags)) {
          seed.content_flags = normalizeDefinitionIds(
            seed.content_flags.concat(legacyEntry.content_flags),
            CONTENT_FLAG_MAP
          );
        }

        if (!usedHintForSignals && isObject(legacyEntry.experience_signals)) {
          EXPERIENCE_LIST.forEach(function (definition) {
            if (!Object.prototype.hasOwnProperty.call(legacyEntry.experience_signals, definition.id)) {
              return;
            }
            seed.experience_signals[definition.id] =
              seed.experience_signals[definition.id] +
              normalizeNumber(legacyEntry.experience_signals[definition.id], 0);
          });
        }

        if (!usedHintForTraits && Array.isArray(legacyEntry.internal_traits)) {
          seed.internal_traits = normalizeDefinitionIds(
            seed.internal_traits.concat(legacyEntry.internal_traits),
            INTERNAL_TRAIT_MAP
          );
        }
      });

      if (seed.dietary_profile.vegan_safe) {
        seed.dietary_profile.vegetarian_safe = true;
      }

      return seed;
    }

    function normalizeIngredientMetadata(ingredient, ingredientId) {
      var sourceIngredient = isObject(ingredient) ? ingredient : {};
      var sourceMetadata = isObject(sourceIngredient.metadata)
        ? sourceIngredient.metadata
        : null;
      var seed = sourceMetadata
        ? createEmptyIngredientMetadata()
        : buildLegacyIngredientSeed(sourceIngredient, ingredientId);
      var dietarySource = sourceMetadata && isObject(sourceMetadata.dietary_profile)
        ? sourceMetadata.dietary_profile
        : {};
      var signalsSource = sourceMetadata && isObject(sourceMetadata.experience_signals)
        ? sourceMetadata.experience_signals
        : {};

      if (sourceMetadata) {
        seed.dietary_profile.vegetarian_safe = normalizeBoolean(
          dietarySource.vegetarian_safe,
          false
        );
        seed.dietary_profile.vegan_safe = normalizeBoolean(
          dietarySource.vegan_safe,
          false
        );
        seed.content_flags = normalizeDefinitionIds(sourceMetadata.content_flags, CONTENT_FLAG_MAP);
        seed.internal_traits = normalizeDefinitionIds(sourceMetadata.internal_traits, INTERNAL_TRAIT_MAP);
        seed.experience_signals = createEmptyExperienceScores();
        applyNumericSeed(seed.experience_signals, signalsSource);
      }

      if (seed.dietary_profile.vegan_safe) {
        seed.dietary_profile.vegetarian_safe = true;
      }

      return seed;
    }

    function normalizeIngredientRecord(ingredientId, ingredient) {
      var sourceIngredient = isObject(ingredient) ? cloneJson(ingredient) : {};
      sourceIngredient.metadata = normalizeIngredientMetadata(sourceIngredient, ingredientId);
      return sourceIngredient;
    }

    function hasOwnLegacyItemFields(item) {
      if (!isObject(item)) return false;
      return (
        Array.isArray(item.tags) ||
        typeof item.vegetarian === "boolean" ||
        typeof item.vegan === "boolean" ||
        typeof item.spicy_level !== "undefined" ||
        typeof item.spicy === "boolean"
      );
    }

    function sanitizeTraitOverrides(input, options) {
      var source = isObject(input) ? input : {};
      var normalized = {
        dietary: {},
        content_flags: {},
        experience_tags: null
      };
      var rawDietary = isObject(source.dietary) ? source.dietary : {};
      var rawContentFlags = isObject(source.content_flags) ? source.content_flags : {};
      var rawExperienceTags = source.experience_tags;

      ["vegetarian", "vegan"].forEach(function (key) {
        var normalizedValue = normalizeNullableBoolean(rawDietary[key]);
        if (normalizedValue === null) return;
        normalized.dietary[key] = normalizedValue;
      });

      CONTENT_FLAG_LIST.forEach(function (definition) {
        var normalizedValue = normalizeNullableBoolean(rawContentFlags[definition.id]);
        if (normalizedValue === null) return;
        normalized.content_flags[definition.id] = normalizedValue;
      });

      if (Array.isArray(rawExperienceTags)) {
        normalized.experience_tags = normalizeDefinitionIds(rawExperienceTags, EXPERIENCE_MAP)
          .slice(0, PUBLIC_BADGE_LIMITS.experience);
      }

      if (options && options.keepEmpty) {
        return normalized;
      }

      if (!Object.keys(normalized.dietary).length) {
        delete normalized.dietary;
      }
      if (!Object.keys(normalized.content_flags).length) {
        delete normalized.content_flags;
      }
      if (!Array.isArray(normalized.experience_tags)) {
        delete normalized.experience_tags;
      }

      if (!Object.keys(normalized).length) {
        return null;
      }

      return normalized;
    }

    function normalizeItemTraitOverrides(item, options) {
      var sourceItem = isObject(item) ? item : {};
      var overrides = sanitizeTraitOverrides(sourceItem.trait_overrides, { keepEmpty: true });
      var useLegacyFields = !options || options.useLegacyFields !== false;

      if (useLegacyFields) {
        if (typeof sourceItem.vegetarian === "boolean") {
          overrides.dietary.vegetarian = sourceItem.vegetarian;
        }
        if (typeof sourceItem.vegan === "boolean") {
          overrides.dietary.vegan = sourceItem.vegan;
        }
        if (
          !Array.isArray(overrides.experience_tags) &&
          (normalizeNumber(sourceItem.spicy_level, 0) > 0 || sourceItem.spicy === true)
        ) {
          overrides.experience_tags = ["spicy"];
        }
      }

      return sanitizeTraitOverrides(overrides, options);
    }

    function ruleMatches(rule, traitSet) {
      var allRequired = normalizeStringArray(rule && rule.all);
      var anyRequired = normalizeStringArray(rule && rule.any);
      var index;

      for (index = 0; index < allRequired.length; index += 1) {
        if (!traitSet[allRequired[index]]) return false;
      }

      if (!anyRequired.length) return true;

      for (index = 0; index < anyRequired.length; index += 1) {
        if (traitSet[anyRequired[index]]) return true;
      }

      return false;
    }

    function deriveExperienceTags(experienceScores) {
      var candidates = EXPERIENCE_LIST
        .map(function (definition) {
          return {
            id: definition.id,
            label: definition.label,
            priority: definition.priority,
            threshold: definition.threshold,
            score: normalizeNumber(experienceScores[definition.id], 0)
          };
        })
        .filter(function (entry) {
          return entry.score >= entry.threshold;
        })
        .sort(function (a, b) {
          if (b.score !== a.score) {
            return b.score - a.score;
          }
          if (a.priority !== b.priority) {
            return a.priority - b.priority;
          }
          return a.label.localeCompare(b.label, "es", { sensitivity: "base" });
        });

      var hasSpecializedSignal = candidates.some(function (entry) {
        return (
          entry.id === "spicy" ||
          entry.id === "truffled" ||
          entry.id === "smoked" ||
          entry.id === "sweet_savory" ||
          entry.id === "intense"
        );
      });

      if (hasSpecializedSignal && candidates.length > PUBLIC_BADGE_LIMITS.experience) {
        candidates = candidates.filter(function (entry) {
          return entry.id !== "classic";
        });
      }

      return candidates
        .slice(0, PUBLIC_BADGE_LIMITS.experience)
        .map(function (entry) {
          return entry.id;
        });
    }

    function cloneAutomaticTraits() {
      return {
        dietary: {
          vegetarian: false,
          vegan: false
        },
        content_flags: createEmptyContentFlags(),
        experience_scores: createEmptyExperienceScores(),
        experience_tags: [],
        internal_traits: [],
        ingredient_ids: []
      };
    }

    function deriveAutomaticTraits(item, ingredientsById) {
      var ingredientCatalog = isObject(ingredientsById) ? ingredientsById : {};
      var ingredientIds = normalizeStringArray(item && item.ingredients);
      var report = cloneAutomaticTraits();
      var hasKnownIngredients = false;
      var traitSet = {};

      ingredientIds.forEach(function (ingredientId) {
        var ingredient = ingredientCatalog[ingredientId];
        if (!ingredient) return;
        var metadata = normalizeIngredientMetadata(ingredient, ingredientId);
        hasKnownIngredients = true;
        report.ingredient_ids.push(ingredientId);

        if (!metadata.dietary_profile.vegetarian_safe) {
          report.dietary.vegetarian = false;
        }
        if (!metadata.dietary_profile.vegan_safe) {
          report.dietary.vegan = false;
        }

        metadata.content_flags.forEach(function (flagId) {
          if (!Object.prototype.hasOwnProperty.call(report.content_flags, flagId)) return;
          report.content_flags[flagId] = true;
          traitSet[flagId] = true;
        });

        metadata.internal_traits.forEach(function (traitId) {
          traitSet[traitId] = true;
        });

        EXPERIENCE_LIST.forEach(function (definition) {
          report.experience_scores[definition.id] =
            report.experience_scores[definition.id] +
            normalizeNumber(metadata.experience_signals[definition.id], 0);
        });
      });

      report.dietary.vegetarian = hasKnownIngredients;
      report.dietary.vegan = hasKnownIngredients;

      ingredientIds.forEach(function (ingredientId) {
        var ingredient = ingredientCatalog[ingredientId];
        if (!ingredient) return;
        var metadata = normalizeIngredientMetadata(ingredient, ingredientId);
        if (!metadata.dietary_profile.vegetarian_safe) {
          report.dietary.vegetarian = false;
        }
        if (!metadata.dietary_profile.vegan_safe) {
          report.dietary.vegan = false;
        }
      });

      EXPERIENCE_COMBINATION_BONUSES.forEach(function (rule) {
        if (!ruleMatches(rule, traitSet)) return;
        EXPERIENCE_LIST.forEach(function (definition) {
          if (!isObject(rule.bonuses) || !Object.prototype.hasOwnProperty.call(rule.bonuses, definition.id)) {
            return;
          }
          report.experience_scores[definition.id] =
            report.experience_scores[definition.id] +
            normalizeNumber(rule.bonuses[definition.id], 0);
        });
      });

      report.internal_traits = Object.keys(traitSet).sort(function (a, b) {
        return a.localeCompare(b);
      });
      report.experience_tags = deriveExperienceTags(report.experience_scores);

      return report;
    }

    function applyTraitOverrides(autoTraits, overrides) {
      var normalizedOverrides = sanitizeTraitOverrides(overrides, { keepEmpty: false });
      var resolved = {
        dietary: {
          vegetarian: Boolean(autoTraits.dietary.vegetarian),
          vegan: Boolean(autoTraits.dietary.vegan)
        },
        content_flags: cloneJson(autoTraits.content_flags),
        experience_scores: cloneJson(autoTraits.experience_scores),
        experience_tags: autoTraits.experience_tags.slice(),
        internal_traits: autoTraits.internal_traits.slice(),
        ingredient_ids: autoTraits.ingredient_ids.slice()
      };

      if (normalizedOverrides && normalizedOverrides.dietary) {
        if (typeof normalizedOverrides.dietary.vegetarian === "boolean") {
          resolved.dietary.vegetarian = normalizedOverrides.dietary.vegetarian;
        }
        if (typeof normalizedOverrides.dietary.vegan === "boolean") {
          resolved.dietary.vegan = normalizedOverrides.dietary.vegan;
        }
      }

      if (normalizedOverrides && normalizedOverrides.content_flags) {
        CONTENT_FLAG_LIST.forEach(function (definition) {
          if (typeof normalizedOverrides.content_flags[definition.id] !== "boolean") return;
          resolved.content_flags[definition.id] = normalizedOverrides.content_flags[definition.id];
        });
      }

      if (normalizedOverrides && Array.isArray(normalizedOverrides.experience_tags)) {
        resolved.experience_tags = normalizedOverrides.experience_tags.slice();
      }

      if (resolved.dietary.vegan) {
        resolved.dietary.vegetarian = true;
      }
      if (!resolved.dietary.vegetarian) {
        resolved.dietary.vegan = false;
      }

      return {
        overrides: normalizedOverrides,
        resolved: resolved
      };
    }

    function badgeFromDefinition(group, definition) {
      return {
        group: group,
        key: definition.id,
        label: definition.label
      };
    }

    function buildPublicBadges(traits) {
      var dietary = [];
      var content = [];
      var experience = [];

      if (traits && traits.dietary) {
        if (traits.dietary.vegan) {
          dietary.push({ group: "dietary", key: "vegan", label: "Vegana" });
        } else if (traits.dietary.vegetarian) {
          dietary.push({ group: "dietary", key: "vegetarian", label: "Vegetariana" });
        }
      }

      CONTENT_FLAG_LIST.forEach(function (definition) {
        if (content.length >= PUBLIC_BADGE_LIMITS.content) return;
        if (!traits || !traits.content_flags || !traits.content_flags[definition.id]) return;
        content.push(badgeFromDefinition("content", definition));
      });

      normalizeDefinitionIds(traits && traits.experience_tags, EXPERIENCE_MAP)
        .slice(0, PUBLIC_BADGE_LIMITS.experience)
        .forEach(function (tagId) {
          experience.push(badgeFromDefinition("experience", EXPERIENCE_MAP[tagId]));
        });

      return {
        dietary: dietary,
        content: content,
        experience: experience,
        flat: dietary.concat(content, experience)
      };
    }

    function deriveItemTraitReport(item, ingredientsById, options) {
      var automatic = deriveAutomaticTraits(item, ingredientsById);
      var overrides = normalizeItemTraitOverrides(item, options);
      var resolved = applyTraitOverrides(automatic, overrides);
      return {
        automatic: automatic,
        overrides: resolved.overrides,
        resolved: resolved.resolved,
        public_badges: buildPublicBadges(resolved.resolved),
        legacy: {
          has_legacy_fields: hasOwnLegacyItemFields(item),
          fields: {
            tags: normalizeStringArray(item && item.tags),
            vegetarian: typeof (item && item.vegetarian) === "boolean" ? item.vegetarian : null,
            vegan: typeof (item && item.vegan) === "boolean" ? item.vegan : null,
            spicy_level: typeof (item && item.spicy_level) !== "undefined"
              ? normalizeNumber(item.spicy_level, 0)
              : null,
            spicy: typeof (item && item.spicy) === "boolean" ? item.spicy : null
          }
        }
      };
    }

    function validateMenuPayload(menuPayload, ingredientsPayload) {
      var report = {
        errors: [],
        warnings: [],
        itemIssuesById: {}
      };

      function ensureBucket(itemId) {
        if (!report.itemIssuesById[itemId]) {
          report.itemIssuesById[itemId] = {
            errors: [],
            warnings: []
          };
        }
        return report.itemIssuesById[itemId];
      }

      function pushItemIssue(itemId, severity, message) {
        var bucket = ensureBucket(itemId);
        bucket[severity === "error" ? "errors" : "warnings"].push(message);
        report[severity === "error" ? "errors" : "warnings"].push(message);
      }

      function pushGlobal(severity, message) {
        report[severity === "error" ? "errors" : "warnings"].push(message);
      }

      if (!isObject(menuPayload)) {
        pushGlobal("error", "menu debe ser un objeto JSON");
        return report;
      }

      var sections = Array.isArray(menuPayload.sections) ? menuPayload.sections : [];
      var ingredientsById = isObject(ingredientsPayload) && isObject(ingredientsPayload.ingredients)
        ? ingredientsPayload.ingredients
        : {};
      var seenItemIds = {};

      sections.forEach(function (section) {
        var items = Array.isArray(section && section.items) ? section.items : [];
        items.forEach(function (item) {
          var itemId = normalizeText(item && item.id) || "(sin-id)";

          if (!normalizeText(item && item.id)) {
            pushItemIssue(itemId, "error", "Item sin id.");
            return;
          }

          if (seenItemIds[itemId]) {
            pushItemIssue(itemId, "error", "ID duplicado en menu: " + itemId);
          }
          seenItemIds[itemId] = true;

          if (!Array.isArray(item.ingredients)) {
            pushItemIssue(itemId, "warning", "ingredients debe ser array en item: " + itemId);
          } else {
            item.ingredients.forEach(function (ingredientId) {
              var normalizedIngredientId = normalizeText(ingredientId);
              if (!normalizedIngredientId) return;
              if (!ingredientsById[normalizedIngredientId]) {
                pushItemIssue(
                  itemId,
                  "error",
                  "Ingrediente desconocido en item '" + itemId + "': " + normalizedIngredientId
                );
              }
            });
          }

          if (Object.prototype.hasOwnProperty.call(item, "tags")) {
            pushItemIssue(itemId, "warning", "item.tags es legacy y ya no es source of truth.");
          }
          if (Object.prototype.hasOwnProperty.call(item, "vegetarian")) {
            pushItemIssue(itemId, "warning", "item.vegetarian es legacy; usa traits derivados u overrides.");
          }
          if (Object.prototype.hasOwnProperty.call(item, "vegan")) {
            pushItemIssue(itemId, "warning", "item.vegan es legacy; usa traits derivados u overrides.");
          }
          if (Object.prototype.hasOwnProperty.call(item, "spicy_level")) {
            pushItemIssue(itemId, "warning", "item.spicy_level es legacy; usa experience_signals.");
          }
          if (Object.prototype.hasOwnProperty.call(item, "spicy")) {
            pushItemIssue(itemId, "warning", "item.spicy es legacy y debe eliminarse.");
          }

          if (
            typeof item.trait_overrides !== "undefined" &&
            item.trait_overrides !== null &&
            !isObject(item.trait_overrides)
          ) {
            pushItemIssue(itemId, "error", "trait_overrides debe ser objeto cuando existe.");
            return;
          }

          var overrides = sanitizeTraitOverrides(item.trait_overrides, { keepEmpty: true });
          if (
            Array.isArray(overrides.experience_tags) &&
            overrides.experience_tags.length > PUBLIC_BADGE_LIMITS.experience
          ) {
            pushItemIssue(itemId, "error", "experience_tags override supera el maximo visible.");
          }

          if (
            overrides.dietary &&
            overrides.dietary.vegan === true &&
            overrides.dietary.vegetarian === false
          ) {
            pushItemIssue(
              itemId,
              "error",
              "Override dietario invalido: vegan=true requiere vegetarian=true."
            );
          }
        });
      });

      return report;
    }

    return {
      version: 2,
      contentFlagList: cloneJson(CONTENT_FLAG_LIST),
      experienceList: cloneJson(EXPERIENCE_LIST),
      internalTraitList: cloneJson(INTERNAL_TRAIT_LIST),
      publicBadgeLimits: cloneJson(PUBLIC_BADGE_LIMITS),
      createEmptyIngredientMetadata: createEmptyIngredientMetadata,
      normalizeIngredientMetadata: normalizeIngredientMetadata,
      normalizeIngredientRecord: normalizeIngredientRecord,
      sanitizeTraitOverrides: sanitizeTraitOverrides,
      normalizeItemTraitOverrides: normalizeItemTraitOverrides,
      deriveItemTraitReport: deriveItemTraitReport,
      validateMenuPayload: validateMenuPayload
    };
  }
);
