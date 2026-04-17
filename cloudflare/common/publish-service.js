const ingredientsContract = require('../../shared/ingredients-contract.js');
const menuTraits = require('../../shared/menu-traits.js');
const menuAllergens = require('../../shared/menu-allergens.js');
const menuSensory = require('../../shared/menu-sensory.js');
const categoriesContract = require('../../shared/categories-contract.js');
const restaurantContract = require('../../shared/restaurant-contract.js');
const reservationsContract = require('../../shared/reservations-contract.js');
const mediaContract = require('../../shared/media-contract.js');
const { decodeUtf8Base64, encodeUtf8Base64, normalizeText } = require('./base64.js');

function githubHeaders(token) {
  return {
    Authorization: 'Bearer ' + token,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
  };
}

function normalizeJsonValue(value) {
  try {
    return JSON.stringify(value);
  } catch (_error) {
    return null;
  }
}

function validateIngredientsPayload(payload, menuPayload) {
  return ingredientsContract.validateIngredientsContract(payload, {
    menuPayload: menuPayload,
    normalizeAliases: true,
  });
}

function validateMenuPayload(payload, ingredientsPayload) {
  var reports = [
    menuTraits.validateMenuPayload(payload, ingredientsPayload),
    menuAllergens.validateMenuAllergens(payload, ingredientsPayload),
    menuSensory.validateMenuSensoryProfiles(payload),
  ];
  var merged = {
    errors: [],
    warnings: [],
    itemIssuesById: {},
  };
  var seenErrors = {};
  var seenWarnings = {};

  reports.forEach(function (report) {
    (report && report.errors ? report.errors : []).forEach(function (message) {
      if (seenErrors[message]) return;
      seenErrors[message] = true;
      merged.errors.push(message);
    });
    (report && report.warnings ? report.warnings : []).forEach(function (message) {
      if (seenWarnings[message]) return;
      seenWarnings[message] = true;
      merged.warnings.push(message);
    });
    Object.keys(report && report.itemIssuesById ? report.itemIssuesById : {}).forEach(function (itemId) {
      var bucket = report.itemIssuesById[itemId] || {};
      if (!merged.itemIssuesById[itemId]) {
        merged.itemIssuesById[itemId] = { errors: [], warnings: [] };
      }
      (bucket.errors || []).forEach(function (message) {
        if (merged.itemIssuesById[itemId].errors.indexOf(message) === -1) {
          merged.itemIssuesById[itemId].errors.push(message);
        }
      });
      (bucket.warnings || []).forEach(function (message) {
        if (merged.itemIssuesById[itemId].warnings.indexOf(message) === -1) {
          merged.itemIssuesById[itemId].warnings.push(message);
        }
      });
    });
  });

  return merged;
}

function validateCategoriesPayload(payload, menuPayload) {
  return categoriesContract.validateCategoriesContract(payload, {
    menuPayload: menuPayload,
  });
}

function validateRestaurantPayload(payload) {
  return restaurantContract.validateRestaurantContract(payload);
}

function validateMediaPayload(payload) {
  return mediaContract.validateMediaContract(payload);
}

function validateReservationsPayload(payload) {
  return reservationsContract.validateReservationsContract(payload);
}

async function readGithubFile(owner, repo, branch, filePath, token) {
  var encodedPath = filePath.split('/').map(encodeURIComponent).join('/');
  var url = 'https://api.github.com/repos/' +
    encodeURIComponent(owner) + '/' +
    encodeURIComponent(repo) + '/contents/' +
    encodedPath + '?ref=' + encodeURIComponent(branch);

  var response = await fetch(url, {
    method: 'GET',
    headers: githubHeaders(token),
  });
  var data = await response.json().catch(function () {
    return {};
  });

  if (!response.ok) {
    throw new Error(data.message || ('GitHub GET failed for ' + filePath));
  }
  if (!data.sha) {
    throw new Error('GitHub response missing sha for ' + filePath);
  }

  var normalized = null;
  var decodedContent = decodeUtf8Base64(String(data.content || '').replace(/\n/g, ''));
  if (decodedContent) {
    try {
      normalized = normalizeJsonValue(JSON.parse(decodedContent));
    } catch (_error) {
      normalized = decodedContent.trim();
    }
  }

  return {
    sha: data.sha,
    normalized: normalized,
  };
}

async function readBranchHeadSha(owner, repo, branch, token) {
  var encodedBranch = branch.split('/').map(encodeURIComponent).join('/');
  var url = 'https://api.github.com/repos/' +
    encodeURIComponent(owner) + '/' +
    encodeURIComponent(repo) + '/git/ref/heads/' + encodedBranch;

  var response = await fetch(url, {
    method: 'GET',
    headers: githubHeaders(token),
  });

  if (response.status === 404) {
    return null;
  }

  var data = await response.json().catch(function () {
    return {};
  });
  if (!response.ok) {
    throw new Error(data.message || ('GitHub branch lookup failed for ' + branch));
  }

  return data && data.object && data.object.sha ? data.object.sha : null;
}

async function ensureBranchExists(owner, repo, branch, baseBranch, token) {
  var branchSha = await readBranchHeadSha(owner, repo, branch, token);
  if (branchSha) {
    return branchSha;
  }

  var baseSha = await readBranchHeadSha(owner, repo, baseBranch, token);
  if (!baseSha) {
    throw new Error('Base branch not found: ' + baseBranch);
  }

  var url = 'https://api.github.com/repos/' +
    encodeURIComponent(owner) + '/' +
    encodeURIComponent(repo) + '/git/refs';

  var response = await fetch(url, {
    method: 'POST',
    headers: githubHeaders(token),
    body: JSON.stringify({
      ref: 'refs/heads/' + branch,
      sha: baseSha,
    }),
  });

  if (response.status === 422) {
    return baseSha;
  }

  var data = await response.json().catch(function () {
    return {};
  });
  if (!response.ok) {
    throw new Error(data.message || ('Unable to create preview branch: ' + branch));
  }

  return data && data.object && data.object.sha ? data.object.sha : baseSha;
}

async function writeGithubFile(owner, repo, branch, filePath, token, commitMessage, payload, sha) {
  var encodedPath = filePath.split('/').map(encodeURIComponent).join('/');
  var url = 'https://api.github.com/repos/' +
    encodeURIComponent(owner) + '/' +
    encodeURIComponent(repo) + '/contents/' + encodedPath;
  var content = encodeUtf8Base64(JSON.stringify(payload, null, 2));

  var response = await fetch(url, {
    method: 'PUT',
    headers: githubHeaders(token),
    body: JSON.stringify({
      message: commitMessage,
      content: content,
      sha: sha,
      branch: branch,
    }),
  });
  var data = await response.json().catch(function () {
    return {};
  });
  if (!response.ok) {
    throw new Error(data.message || ('GitHub PUT failed for ' + filePath));
  }

  return data && data.commit && data.commit.sha ? data.commit.sha : null;
}

function collectValidationWarnings(reports) {
  return reports
    .reduce(function (accumulator, report) {
      return accumulator.concat(report && report.warnings ? report.warnings : []);
    }, [])
    .slice(0, 20);
}

async function publishDrafts(body, options) {
  var source = options && typeof options === 'object' ? options : {};
  var githubToken = normalizeText(source.githubToken);
  var githubOwner = normalizeText(source.githubOwner);
  var githubRepo = normalizeText(source.githubRepo);
  var productionBranch = normalizeText(source.productionBranch, 'master');
  var previewBranch = normalizeText(source.previewBranch, 'cms-preview');
  if (!githubToken || !githubOwner || !githubRepo) {
    throw new Error('Missing GitHub configuration for publish');
  }

  if (!body || typeof body !== 'object' || typeof body.menu === 'undefined' || typeof body.availability === 'undefined') {
    return {
      statusCode: 400,
      payload: { error: 'Invalid payload' },
    };
  }

  var target = normalizeText(body.target, 'preview');
  if (target !== 'preview' && target !== 'production') {
    return {
      statusCode: 400,
      payload: { error: "Invalid target. Use 'preview' or 'production'." },
    };
  }

  var targetBranch = target === 'production' ? productionBranch : previewBranch;
  var normalizedMenu = normalizeJsonValue(body.menu);
  var normalizedAvailability = normalizeJsonValue(body.availability);
  var hasHomePayload = typeof body.home !== 'undefined';
  var normalizedHome = hasHomePayload ? normalizeJsonValue(body.home) : null;
  var hasIngredientsPayload = typeof body.ingredients !== 'undefined';
  var normalizedIngredients = hasIngredientsPayload ? normalizeJsonValue(body.ingredients) : null;
  var hasCategoriesPayload = typeof body.categories !== 'undefined';
  var normalizedCategories = hasCategoriesPayload ? normalizeJsonValue(body.categories) : null;
  var hasRestaurantPayload = typeof body.restaurant !== 'undefined';
  var normalizedRestaurant = hasRestaurantPayload ? normalizeJsonValue(body.restaurant) : null;
  var hasReservationsPayload = typeof body.reservations !== 'undefined';
  var normalizedReservations = hasReservationsPayload ? normalizeJsonValue(body.reservations) : null;
  var hasMediaPayload = typeof body.media !== 'undefined';
  var normalizedMedia = hasMediaPayload ? normalizeJsonValue(body.media) : null;

  if (!normalizedMenu || !normalizedAvailability || (hasHomePayload && !normalizedHome) || (hasIngredientsPayload && !normalizedIngredients) || (hasCategoriesPayload && !normalizedCategories) || (hasRestaurantPayload && !normalizedRestaurant) || (hasReservationsPayload && !normalizedReservations) || (hasMediaPayload && !normalizedMedia)) {
    return {
      statusCode: 400,
      payload: { error: 'Invalid payload' },
    };
  }

  var ingredientsValidation = hasIngredientsPayload ? validateIngredientsPayload(body.ingredients, body.menu) : { errors: [], warnings: [] };
  if (ingredientsValidation.errors.length) {
    return {
      statusCode: 400,
      payload: {
        error: 'Invalid ingredients payload',
        details: ingredientsValidation.errors.slice(0, 30),
        warnings: ingredientsValidation.warnings.slice(0, 20),
      },
    };
  }

  var menuValidation = validateMenuPayload(body.menu, hasIngredientsPayload ? body.ingredients : null);
  if (menuValidation.errors.length) {
    return {
      statusCode: 400,
      payload: {
        error: 'Invalid menu payload',
        details: menuValidation.errors.slice(0, 30),
        warnings: menuValidation.warnings.slice(0, 20),
      },
    };
  }

  var categoriesValidation = hasCategoriesPayload ? validateCategoriesPayload(body.categories, body.menu) : { errors: [], warnings: [] };
  if (categoriesValidation.errors.length) {
    return {
      statusCode: 400,
      payload: {
        error: 'Invalid categories payload',
        details: categoriesValidation.errors.slice(0, 30),
        warnings: categoriesValidation.warnings.slice(0, 20),
      },
    };
  }

  var restaurantValidation = hasRestaurantPayload ? validateRestaurantPayload(body.restaurant) : { errors: [], warnings: [] };
  if (restaurantValidation.errors.length) {
    return {
      statusCode: 400,
      payload: {
        error: 'Invalid restaurant payload',
        details: restaurantValidation.errors.slice(0, 30),
        warnings: restaurantValidation.warnings.slice(0, 20),
      },
    };
  }

  var reservationsValidation = hasReservationsPayload ? validateReservationsPayload(body.reservations) : { errors: [], warnings: [] };
  if (reservationsValidation.errors.length) {
    return {
      statusCode: 400,
      payload: {
        error: 'Invalid reservations payload',
        details: reservationsValidation.errors.slice(0, 30),
        warnings: reservationsValidation.warnings.slice(0, 20),
      },
    };
  }

  var mediaValidation = hasMediaPayload ? validateMediaPayload(body.media) : { errors: [], warnings: [] };
  if (mediaValidation.errors.length) {
    return {
      statusCode: 400,
      payload: {
        error: 'Invalid media payload',
        details: mediaValidation.errors.slice(0, 30),
        warnings: mediaValidation.warnings.slice(0, 20),
      },
    };
  }

  try {
    var menuPath = 'data/menu.json';
    var availabilityPath = 'data/availability.json';
    var homePath = 'data/home.json';
    var ingredientsPath = 'data/ingredients.json';
    var categoriesPath = 'data/categories.json';
    var restaurantPath = 'data/restaurant.json';
    var reservationsPath = 'data/reservations-config.json';
    var mediaPath = 'data/media.json';

    if (target === 'preview' && targetBranch !== productionBranch) {
      await ensureBranchExists(githubOwner, githubRepo, targetBranch, productionBranch, githubToken);
    }

    var menuRemote = await readGithubFile(githubOwner, githubRepo, targetBranch, menuPath, githubToken);
    var availabilityRemote = await readGithubFile(githubOwner, githubRepo, targetBranch, availabilityPath, githubToken);
    var homeRemote = hasHomePayload ? await readGithubFile(githubOwner, githubRepo, targetBranch, homePath, githubToken) : null;
    var ingredientsRemote = hasIngredientsPayload ? await readGithubFile(githubOwner, githubRepo, targetBranch, ingredientsPath, githubToken) : null;
    var categoriesRemote = hasCategoriesPayload ? await readGithubFile(githubOwner, githubRepo, targetBranch, categoriesPath, githubToken) : null;
    var restaurantRemote = hasRestaurantPayload ? await readGithubFile(githubOwner, githubRepo, targetBranch, restaurantPath, githubToken) : null;
    var reservationsRemote = hasReservationsPayload ? await readGithubFile(githubOwner, githubRepo, targetBranch, reservationsPath, githubToken) : null;
    var mediaRemote = hasMediaPayload ? await readGithubFile(githubOwner, githubRepo, targetBranch, mediaPath, githubToken) : null;

    var menuChanged = menuRemote.normalized !== normalizedMenu;
    var availabilityChanged = availabilityRemote.normalized !== normalizedAvailability;
    var homeChanged = hasHomePayload ? homeRemote.normalized !== normalizedHome : false;
    var ingredientsChanged = hasIngredientsPayload ? ingredientsRemote.normalized !== normalizedIngredients : false;
    var categoriesChanged = hasCategoriesPayload ? categoriesRemote.normalized !== normalizedCategories : false;
    var restaurantChanged = hasRestaurantPayload ? restaurantRemote.normalized !== normalizedRestaurant : false;
    var reservationsChanged = hasReservationsPayload ? reservationsRemote.normalized !== normalizedReservations : false;
    var mediaChanged = hasMediaPayload ? mediaRemote.normalized !== normalizedMedia : false;
    var validationWarnings = collectValidationWarnings([
      menuValidation,
      ingredientsValidation,
      categoriesValidation,
      restaurantValidation,
      reservationsValidation,
      mediaValidation,
    ]);

    if (!menuChanged && !availabilityChanged && !homeChanged && !ingredientsChanged && !categoriesChanged && !restaurantChanged && !reservationsChanged && !mediaChanged) {
      return {
        statusCode: 200,
        payload: {
          success: true,
          skipped: true,
          reason: 'no changes',
          target: target,
          branch: targetBranch,
          validationWarnings: validationWarnings,
        },
      };
    }

    var latestCommitSha = null;
    if (menuChanged) {
      latestCommitSha = await writeGithubFile(githubOwner, githubRepo, targetBranch, menuPath, githubToken, 'CMS: update menu (' + target + ')', body.menu, menuRemote.sha);
    }
    if (availabilityChanged) {
      latestCommitSha = await writeGithubFile(githubOwner, githubRepo, targetBranch, availabilityPath, githubToken, 'CMS: update availability (' + target + ')', body.availability, availabilityRemote.sha) || latestCommitSha;
    }
    if (homeChanged) {
      latestCommitSha = await writeGithubFile(githubOwner, githubRepo, targetBranch, homePath, githubToken, 'CMS: update home (' + target + ')', body.home, homeRemote.sha) || latestCommitSha;
    }
    if (ingredientsChanged) {
      latestCommitSha = await writeGithubFile(githubOwner, githubRepo, targetBranch, ingredientsPath, githubToken, 'CMS: update ingredients (' + target + ')', body.ingredients, ingredientsRemote.sha) || latestCommitSha;
    }
    if (categoriesChanged) {
      latestCommitSha = await writeGithubFile(githubOwner, githubRepo, targetBranch, categoriesPath, githubToken, 'CMS: update categories (' + target + ')', body.categories, categoriesRemote.sha) || latestCommitSha;
    }
    if (restaurantChanged) {
      latestCommitSha = await writeGithubFile(githubOwner, githubRepo, targetBranch, restaurantPath, githubToken, 'CMS: update restaurant (' + target + ')', body.restaurant, restaurantRemote.sha) || latestCommitSha;
    }
    if (reservationsChanged) {
      latestCommitSha = await writeGithubFile(githubOwner, githubRepo, targetBranch, reservationsPath, githubToken, 'CMS: update reservations-config (' + target + ')', body.reservations, reservationsRemote.sha) || latestCommitSha;
    }
    if (mediaChanged) {
      latestCommitSha = await writeGithubFile(githubOwner, githubRepo, targetBranch, mediaPath, githubToken, 'CMS: update media (' + target + ')', body.media, mediaRemote.sha) || latestCommitSha;
    }

    return {
      statusCode: 200,
      payload: {
        success: true,
        skipped: false,
        target: target,
        branch: targetBranch,
        changed: {
          menu: menuChanged,
          availability: availabilityChanged,
          home: homeChanged,
          ingredients: ingredientsChanged,
          categories: categoriesChanged,
          restaurant: restaurantChanged,
          reservations: reservationsChanged,
          media: mediaChanged,
        },
        validationWarnings: validationWarnings,
        commit: latestCommitSha,
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      payload: {
        error: error && error.message ? error.message : 'Publish failed',
        target: target,
        branch: targetBranch,
      },
    };
  }
}

module.exports = {
  publishDrafts,
};
