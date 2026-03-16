// Required env vars (aliases supported):
// TOKEN: GITHUB_TOKEN or GH_TOKEN
// OWNER: GITHUB_OWNER or GH_OWNER
// REPO: GITHUB_REPO or GH_REPO
// Production branch: GH_BRANCH or GITHUB_BRANCH (defaults to master)
// Preview branch: CMS_PREVIEW_BRANCH (defaults to cms-preview)
var ingredientsContract = require("../../shared/ingredients-contract.js");
var menuTraits = require("../../shared/menu-traits.js");
var menuAllergens = require("../../shared/menu-allergens.js");
var categoriesContract = require("../../shared/categories-contract.js");
var restaurantContract = require("../../shared/restaurant-contract.js");
var mediaContract = require("../../shared/media-contract.js");
var RATE_LIMIT_WINDOW_MS = 30 * 1000;
var publishRateLimitByUser = Object.create(null);

function jsonResponse(statusCode, payload) {
  return {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  };
}

function githubHeaders(token) {
  return {
    "Authorization": "Bearer " + token,
    "Accept": "application/vnd.github+json",
    "Content-Type": "application/json"
  };
}

async function parseJsonBody(eventBody) {
  if (!eventBody) {
    return null;
  }

  try {
    return JSON.parse(String(eventBody));
  } catch (_error) {
    return null;
  }
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
    normalizeAliases: true
  });
}

function validateMenuPayload(payload, ingredientsPayload) {
  var reports = [
    menuTraits.validateMenuPayload(payload, ingredientsPayload),
    menuAllergens.validateMenuAllergens(payload, ingredientsPayload)
  ];
  var merged = {
    errors: [],
    warnings: [],
    itemIssuesById: {}
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
        merged.itemIssuesById[itemId] = {
          errors: [],
          warnings: []
        };
      }
      (bucket.errors || []).forEach(function (message) {
        if (!merged.itemIssuesById[itemId].errors.includes(message)) {
          merged.itemIssuesById[itemId].errors.push(message);
        }
      });
      (bucket.warnings || []).forEach(function (message) {
        if (!merged.itemIssuesById[itemId].warnings.includes(message)) {
          merged.itemIssuesById[itemId].warnings.push(message);
        }
      });
    });
  });

  return merged;
}

function validateCategoriesPayload(payload, menuPayload) {
  return categoriesContract.validateCategoriesContract(payload, {
    menuPayload: menuPayload
  });
}

function validateRestaurantPayload(payload) {
  return restaurantContract.validateRestaurantContract(payload);
}

function validateMediaPayload(payload) {
  return mediaContract.validateMediaContract(payload);
}

function getUserKey(user) {
  if (!user || typeof user !== "object") {
    return "anonymous";
  }

  return String(
    user.sub ||
    user.id ||
    user.email ||
    (user.user_metadata && user.user_metadata.email) ||
    "anonymous"
  );
}

function checkRateLimit(userKey) {
  var now = Date.now();
  var lastPublishAt = publishRateLimitByUser[userKey] || 0;
  var elapsedMs = now - lastPublishAt;
  if (elapsedMs < RATE_LIMIT_WINDOW_MS) {
    return Math.ceil((RATE_LIMIT_WINDOW_MS - elapsedMs) / 1000);
  }

  publishRateLimitByUser[userKey] = now;
  return 0;
}

function decodeBase64Content(content) {
  if (!content) return "";
  return Buffer.from(String(content).replace(/\n/g, ""), "base64").toString("utf8");
}

async function readGithubFile(owner, repo, branch, path, token) {
  var encodedPath = path.split("/").map(encodeURIComponent).join("/");
  var url = "https://api.github.com/repos/" +
    encodeURIComponent(owner) + "/" +
    encodeURIComponent(repo) + "/contents/" +
    encodedPath + "?ref=" + encodeURIComponent(branch);

  var response = await fetch(url, {
    method: "GET",
    headers: githubHeaders(token)
  });

  var data = await response.json().catch(function () {
    return {};
  });

  if (!response.ok) {
    throw new Error(data.message || ("GitHub GET failed for " + path));
  }

  if (!data.sha) {
    throw new Error("GitHub response missing sha for " + path);
  }

  var normalized = null;
  var decodedContent = decodeBase64Content(data.content);
  if (decodedContent) {
    try {
      normalized = normalizeJsonValue(JSON.parse(decodedContent));
    } catch (_error) {
      normalized = decodedContent.trim();
    }
  }

  return {
    sha: data.sha,
    normalized: normalized
  };
}

async function readBranchHeadSha(owner, repo, branch, token) {
  var encodedBranch = branch.split("/").map(encodeURIComponent).join("/");
  var url = "https://api.github.com/repos/" +
    encodeURIComponent(owner) + "/" +
    encodeURIComponent(repo) + "/git/ref/heads/" +
    encodedBranch;

  var response = await fetch(url, {
    method: "GET",
    headers: githubHeaders(token)
  });

  if (response.status === 404) {
    return null;
  }

  var data = await response.json().catch(function () {
    return {};
  });

  if (!response.ok) {
    throw new Error(data.message || ("GitHub branch lookup failed for " + branch));
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
    throw new Error("Base branch not found: " + baseBranch);
  }

  var url = "https://api.github.com/repos/" +
    encodeURIComponent(owner) + "/" +
    encodeURIComponent(repo) + "/git/refs";

  var response = await fetch(url, {
    method: "POST",
    headers: githubHeaders(token),
    body: JSON.stringify({
      ref: "refs/heads/" + branch,
      sha: baseSha
    })
  });

  if (response.status === 422) {
    // Branch could have been created concurrently.
    return baseSha;
  }

  var data = await response.json().catch(function () {
    return {};
  });

  if (!response.ok) {
    throw new Error(data.message || ("Unable to create preview branch: " + branch));
  }

  return data && data.object && data.object.sha ? data.object.sha : baseSha;
}

async function writeGithubFile(owner, repo, branch, path, token, commitMessage, payload, sha) {
  var encodedPath = path.split("/").map(encodeURIComponent).join("/");
  var url = "https://api.github.com/repos/" +
    encodeURIComponent(owner) + "/" +
    encodeURIComponent(repo) + "/contents/" +
    encodedPath;

  var content = Buffer.from(JSON.stringify(payload, null, 2)).toString("base64");

  var response = await fetch(url, {
    method: "PUT",
    headers: githubHeaders(token),
    body: JSON.stringify({
      message: commitMessage,
      content: content,
      sha: sha,
      branch: branch
    })
  });

  var data = await response.json().catch(function () {
    return {};
  });

  if (!response.ok) {
    throw new Error(data.message || ("GitHub PUT failed for " + path));
  }

  return data && data.commit && data.commit.sha ? data.commit.sha : null;
}

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  var user = context && context.clientContext && context.clientContext.user;
  if (!user) {
    return jsonResponse(401, { error: "Unauthorized" });
  }

  var githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  var githubOwner = process.env.GITHUB_OWNER || process.env.GH_OWNER;
  var githubRepo = process.env.GITHUB_REPO || process.env.GH_REPO;
  var productionBranch = process.env.GH_BRANCH || process.env.GITHUB_BRANCH || "master";
  var previewBranch = process.env.CMS_PREVIEW_BRANCH || "cms-preview";

  var missing = [];
  if (!githubToken) missing.push("token");
  if (!githubOwner) missing.push("owner");
  if (!githubRepo) missing.push("repo");

  if (missing.length) {
    return jsonResponse(500, {
      error: "Missing required GitHub environment variables",
      missing: missing,
      acceptedKeys: {
        token: ["GITHUB_TOKEN", "GH_TOKEN"],
        owner: ["GITHUB_OWNER", "GH_OWNER"],
        repo: ["GITHUB_REPO", "GH_REPO"],
        productionBranch: ["GH_BRANCH", "GITHUB_BRANCH", "default: master"],
        previewBranch: ["CMS_PREVIEW_BRANCH", "default: cms-preview"]
      }
    });
  }

  var body = await parseJsonBody(event.body);
  if (!body || typeof body !== "object" || typeof body.menu === "undefined" || typeof body.availability === "undefined") {
    return jsonResponse(400, { error: "Invalid payload" });
  }

  var target = typeof body.target === "string" ? body.target : "preview";
  if (target !== "preview" && target !== "production") {
    return jsonResponse(400, { error: "Invalid target. Use 'preview' or 'production'." });
  }

  var targetBranch = target === "production" ? productionBranch : previewBranch;

  var userKey = getUserKey(user);
  var retryAfterSeconds = checkRateLimit(userKey);
  if (retryAfterSeconds > 0) {
    return jsonResponse(429, {
      error: "Publish rate limit exceeded. Try again in a few seconds.",
      retryAfterSeconds: retryAfterSeconds
    });
  }

  var normalizedMenu = normalizeJsonValue(body.menu);
  var normalizedAvailability = normalizeJsonValue(body.availability);
  var hasHomePayload = typeof body.home !== "undefined";
  var normalizedHome = hasHomePayload ? normalizeJsonValue(body.home) : null;
  var hasIngredientsPayload = typeof body.ingredients !== "undefined";
  var normalizedIngredients = hasIngredientsPayload ? normalizeJsonValue(body.ingredients) : null;
  var hasCategoriesPayload = typeof body.categories !== "undefined";
  var normalizedCategories = hasCategoriesPayload ? normalizeJsonValue(body.categories) : null;
  var hasRestaurantPayload = typeof body.restaurant !== "undefined";
  var normalizedRestaurant = hasRestaurantPayload ? normalizeJsonValue(body.restaurant) : null;
  var hasMediaPayload = typeof body.media !== "undefined";
  var normalizedMedia = hasMediaPayload ? normalizeJsonValue(body.media) : null;
  if (
    !normalizedMenu ||
    !normalizedAvailability ||
    (hasHomePayload && !normalizedHome) ||
    (hasIngredientsPayload && !normalizedIngredients) ||
    (hasCategoriesPayload && !normalizedCategories) ||
    (hasRestaurantPayload && !normalizedRestaurant) ||
    (hasMediaPayload && !normalizedMedia)
  ) {
    return jsonResponse(400, { error: "Invalid payload" });
  }

  var ingredientsValidation = hasIngredientsPayload
    ? validateIngredientsPayload(body.ingredients, body.menu)
    : { errors: [], warnings: [] };
  if (ingredientsValidation.errors.length) {
    return jsonResponse(400, {
      error: "Invalid ingredients payload",
      details: ingredientsValidation.errors.slice(0, 30),
      warnings: ingredientsValidation.warnings.slice(0, 20)
    });
  }
  if (hasIngredientsPayload) {
    normalizedIngredients = normalizeJsonValue(body.ingredients);
    if (!normalizedIngredients) {
      return jsonResponse(400, { error: "Invalid payload" });
    }
  }

  var menuValidation = validateMenuPayload(
    body.menu,
    hasIngredientsPayload ? body.ingredients : null
  );
  if (menuValidation.errors.length) {
    return jsonResponse(400, {
      error: "Invalid menu payload",
      details: menuValidation.errors.slice(0, 30),
      warnings: menuValidation.warnings.slice(0, 20)
    });
  }

  var categoriesValidation = hasCategoriesPayload
    ? validateCategoriesPayload(body.categories, body.menu)
    : { errors: [], warnings: [] };
  if (categoriesValidation.errors.length) {
    return jsonResponse(400, {
      error: "Invalid categories payload",
      details: categoriesValidation.errors.slice(0, 30),
      warnings: categoriesValidation.warnings.slice(0, 20)
    });
  }
  if (hasCategoriesPayload) {
    normalizedCategories = normalizeJsonValue(body.categories);
    if (!normalizedCategories) {
      return jsonResponse(400, { error: "Invalid payload" });
    }
  }

  var restaurantValidation = hasRestaurantPayload
    ? validateRestaurantPayload(body.restaurant)
    : { errors: [], warnings: [] };
  if (restaurantValidation.errors.length) {
    return jsonResponse(400, {
      error: "Invalid restaurant payload",
      details: restaurantValidation.errors.slice(0, 30),
      warnings: restaurantValidation.warnings.slice(0, 20)
    });
  }
  if (hasRestaurantPayload) {
    normalizedRestaurant = normalizeJsonValue(body.restaurant);
    if (!normalizedRestaurant) {
      return jsonResponse(400, { error: "Invalid payload" });
    }
  }

  var mediaValidation = hasMediaPayload
    ? validateMediaPayload(body.media)
    : { errors: [], warnings: [] };
  if (mediaValidation.errors.length) {
    return jsonResponse(400, {
      error: "Invalid media payload",
      details: mediaValidation.errors.slice(0, 30),
      warnings: mediaValidation.warnings.slice(0, 20)
    });
  }
  if (hasMediaPayload) {
    normalizedMedia = normalizeJsonValue(body.media);
    if (!normalizedMedia) {
      return jsonResponse(400, { error: "Invalid payload" });
    }
  }

  try {
    var menuPath = "data/menu.json";
    var availabilityPath = "data/availability.json";
    var homePath = "data/home.json";
    var ingredientsPath = "data/ingredients.json";
    var categoriesPath = "data/categories.json";
    var restaurantPath = "data/restaurant.json";
    var mediaPath = "data/media.json";

    if (target === "preview" && targetBranch !== productionBranch) {
      await ensureBranchExists(
        githubOwner,
        githubRepo,
        targetBranch,
        productionBranch,
        githubToken
      );
    }

    var menuRemote = await readGithubFile(
      githubOwner,
      githubRepo,
      targetBranch,
      menuPath,
      githubToken
    );

    var availabilityRemote = await readGithubFile(
      githubOwner,
      githubRepo,
      targetBranch,
      availabilityPath,
      githubToken
    );

    var homeRemote = null;
    if (hasHomePayload) {
      homeRemote = await readGithubFile(
        githubOwner,
        githubRepo,
        targetBranch,
        homePath,
        githubToken
      );
    }

    var ingredientsRemote = null;
    if (hasIngredientsPayload) {
      ingredientsRemote = await readGithubFile(
        githubOwner,
        githubRepo,
        targetBranch,
        ingredientsPath,
        githubToken
      );
    }

    var categoriesRemote = null;
    if (hasCategoriesPayload) {
      categoriesRemote = await readGithubFile(
        githubOwner,
        githubRepo,
        targetBranch,
        categoriesPath,
        githubToken
      );
    }

    var restaurantRemote = null;
    if (hasRestaurantPayload) {
      restaurantRemote = await readGithubFile(
        githubOwner,
        githubRepo,
        targetBranch,
        restaurantPath,
        githubToken
      );
    }

    var mediaRemote = null;
    if (hasMediaPayload) {
      mediaRemote = await readGithubFile(
        githubOwner,
        githubRepo,
        targetBranch,
        mediaPath,
        githubToken
      );
    }

    var menuChanged = menuRemote.normalized !== normalizedMenu;
    var availabilityChanged = availabilityRemote.normalized !== normalizedAvailability;
    var homeChanged = hasHomePayload ? homeRemote.normalized !== normalizedHome : false;
    var ingredientsChanged = hasIngredientsPayload
      ? ingredientsRemote.normalized !== normalizedIngredients
      : false;
    var categoriesChanged = hasCategoriesPayload
      ? categoriesRemote.normalized !== normalizedCategories
      : false;
    var restaurantChanged = hasRestaurantPayload
      ? restaurantRemote.normalized !== normalizedRestaurant
      : false;
    var mediaChanged = hasMediaPayload ? mediaRemote.normalized !== normalizedMedia : false;
    var validationWarnings = menuValidation.warnings
      .concat(ingredientsValidation.warnings)
      .concat(categoriesValidation.warnings)
      .concat(restaurantValidation.warnings)
      .concat(mediaValidation.warnings)
      .slice(0, 20);

    if (!menuChanged && !availabilityChanged && !homeChanged && !ingredientsChanged && !categoriesChanged && !restaurantChanged && !mediaChanged) {
      return jsonResponse(200, {
        success: true,
        skipped: true,
        reason: "no changes",
        target: target,
        branch: targetBranch,
        validationWarnings: validationWarnings
      });
    }

    var latestCommitSha = null;

    if (menuChanged) {
      latestCommitSha = await writeGithubFile(
        githubOwner,
        githubRepo,
        targetBranch,
        menuPath,
        githubToken,
        "CMS: update menu (" + target + ")",
        body.menu,
        menuRemote.sha
      );
    }

    if (availabilityChanged) {
      latestCommitSha = await writeGithubFile(
        githubOwner,
        githubRepo,
        targetBranch,
        availabilityPath,
        githubToken,
        "CMS: update availability (" + target + ")",
        body.availability,
        availabilityRemote.sha
      ) || latestCommitSha;
    }

    if (homeChanged) {
      latestCommitSha = await writeGithubFile(
        githubOwner,
        githubRepo,
        targetBranch,
        homePath,
        githubToken,
        "CMS: update home (" + target + ")",
        body.home,
        homeRemote.sha
      ) || latestCommitSha;
    }

    if (ingredientsChanged) {
      latestCommitSha = await writeGithubFile(
        githubOwner,
        githubRepo,
        targetBranch,
        ingredientsPath,
        githubToken,
        "CMS: update ingredients (" + target + ")",
        body.ingredients,
        ingredientsRemote.sha
      ) || latestCommitSha;
    }

    if (categoriesChanged) {
      latestCommitSha = await writeGithubFile(
        githubOwner,
        githubRepo,
        targetBranch,
        categoriesPath,
        githubToken,
        "CMS: update categories (" + target + ")",
        body.categories,
        categoriesRemote.sha
      ) || latestCommitSha;
    }

    if (restaurantChanged) {
      latestCommitSha = await writeGithubFile(
        githubOwner,
        githubRepo,
        targetBranch,
        restaurantPath,
        githubToken,
        "CMS: update restaurant (" + target + ")",
        body.restaurant,
        restaurantRemote.sha
      ) || latestCommitSha;
    }

    if (mediaChanged) {
      latestCommitSha = await writeGithubFile(
        githubOwner,
        githubRepo,
        targetBranch,
        mediaPath,
        githubToken,
        "CMS: update media (" + target + ")",
        body.media,
        mediaRemote.sha
      ) || latestCommitSha;
    }

    return jsonResponse(200, {
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
        media: mediaChanged
      },
      validationWarnings: validationWarnings,
      commit: latestCommitSha
    });
  } catch (error) {
    return jsonResponse(500, {
      error: error && error.message ? error.message : "Publish failed",
      target: target,
      branch: targetBranch
    });
  }
};
