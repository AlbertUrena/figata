// Required env vars (aliases supported):
// TOKEN: GITHUB_TOKEN or GH_TOKEN
// OWNER: GITHUB_OWNER or GH_OWNER
// REPO: GITHUB_REPO or GH_REPO
// Production branch: GH_BRANCH or GITHUB_BRANCH (defaults to master)
// Preview branch: CMS_PREVIEW_BRANCH (defaults to cms-preview)
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

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function normalizeIngredientAlias(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}

function isLikelyValidIngredientIconPath(value) {
  var path = String(value || "").trim();
  if (!path) return false;
  if (/^https?:\/\//i.test(path)) return true;
  if (path[0] === "/") return true;
  if (path.indexOf("assets/") === 0) return true;
  return /\.(svg|webp|png|jpe?g|gif)$/i.test(path);
}

function validateIngredientsPayload(payload, menuPayload) {
  var errors = [];
  var warnings = [];
  if (!payload || typeof payload !== "object") {
    return {
      errors: ["ingredients debe ser un objeto JSON"],
      warnings: []
    };
  }

  var ingredientsById = payload.ingredients && typeof payload.ingredients === "object"
    ? payload.ingredients
    : {};
  var tagsById = payload.tags && typeof payload.tags === "object" ? payload.tags : {};
  var allergensById = payload.allergens && typeof payload.allergens === "object" ? payload.allergens : {};
  var iconsById = payload.icons && typeof payload.icons === "object" ? payload.icons : {};

  Object.keys(ingredientsById).forEach(function (ingredientId) {
    var ingredient = ingredientsById[ingredientId];
    if (!ingredient || typeof ingredient !== "object") {
      errors.push("Ingrediente invalido (objeto esperado): " + ingredientId);
      return;
    }

    if (!String(ingredient.label || "").trim()) {
      warnings.push("Ingrediente sin label: " + ingredientId);
    }

    var icon = String(ingredient.icon || "").trim();
    if (!icon) {
      warnings.push("Ingrediente sin icon: " + ingredientId);
    } else if (!iconsById[icon] && !isLikelyValidIngredientIconPath(icon)) {
      errors.push("Icon invalido en ingrediente '" + ingredientId + "': " + icon);
    }

    if (!Array.isArray(ingredient.aliases)) {
      errors.push("aliases debe ser array en ingrediente: " + ingredientId);
    } else {
      var seenAliases = {};
      ingredient.aliases.forEach(function (alias) {
        var rawAlias = String(alias || "").trim();
        var normalizedAlias = normalizeIngredientAlias(rawAlias);
        if (!normalizedAlias) {
          errors.push("Alias vacio/invalido en ingrediente: " + ingredientId);
          return;
        }
        if (rawAlias !== normalizedAlias) {
          errors.push("Alias no normalizado en '" + ingredientId + "': " + rawAlias);
        }
        if (seenAliases[normalizedAlias]) {
          errors.push("Alias duplicado en '" + ingredientId + "': " + normalizedAlias);
          return;
        }
        seenAliases[normalizedAlias] = true;
      });
    }

    if (!Array.isArray(ingredient.tags)) {
      errors.push("tags debe ser array en ingrediente: " + ingredientId);
    } else {
      ingredient.tags.forEach(function (tagId) {
        if (!tagsById[tagId]) {
          errors.push("Tag desconocido en ingrediente '" + ingredientId + "': " + tagId);
        }
      });
    }

    if (!Array.isArray(ingredient.allergens)) {
      errors.push("allergens debe ser array en ingrediente: " + ingredientId);
    } else {
      ingredient.allergens.forEach(function (allergenId) {
        if (!allergensById[allergenId]) {
          errors.push("Alergeno desconocido en ingrediente '" + ingredientId + "': " + allergenId);
        }
      });
    }
  });

  var menuSections = menuPayload && Array.isArray(menuPayload.sections) ? menuPayload.sections : [];
  menuSections.forEach(function (section) {
    var items = section && Array.isArray(section.items) ? section.items : [];
    items.forEach(function (item) {
      if (!item || !Array.isArray(item.ingredients)) return;
      var unknown = item.ingredients.filter(function (ingredientId) {
        return !ingredientsById[ingredientId];
      });
      if (!unknown.length) return;
      warnings.push(
        "Menu item '" + (item.id || "unknown") + "' referencia ingredientes invalidos: " +
        unknown.join(", ")
      );
    });
  });

  return { errors: errors, warnings: warnings };
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
  var hasMediaPayload = typeof body.media !== "undefined";
  var normalizedMedia = hasMediaPayload ? normalizeJsonValue(body.media) : null;
  if (
    !normalizedMenu ||
    !normalizedAvailability ||
    (hasHomePayload && !normalizedHome) ||
    (hasIngredientsPayload && !normalizedIngredients) ||
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

  try {
    var menuPath = "data/menu.json";
    var availabilityPath = "data/availability.json";
    var homePath = "data/home.json";
    var ingredientsPath = "data/ingredients.json";
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
    var mediaChanged = hasMediaPayload ? mediaRemote.normalized !== normalizedMedia : false;

    if (!menuChanged && !availabilityChanged && !homeChanged && !ingredientsChanged && !mediaChanged) {
      return jsonResponse(200, {
        success: true,
        skipped: true,
        reason: "no changes",
        target: target,
        branch: targetBranch,
        validationWarnings: ingredientsValidation.warnings.slice(0, 20)
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
        media: mediaChanged
      },
      validationWarnings: ingredientsValidation.warnings.slice(0, 20),
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
