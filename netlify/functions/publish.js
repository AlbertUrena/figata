// Required env vars (aliases supported):
// TOKEN: GITHUB_TOKEN or GH_TOKEN
// OWNER: GITHUB_OWNER or GH_OWNER
// REPO: GITHUB_REPO or GH_REPO
// BRANCH: GITHUB_BRANCH or GH_BRANCH
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
    return JSON.parse(eventBody);
  } catch (_error) {
    return null;
  }
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

  return data.sha;
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
  var githubBranch = process.env.GITHUB_BRANCH || process.env.GH_BRANCH;

  var missing = [];
  if (!githubToken) missing.push("token");
  if (!githubOwner) missing.push("owner");
  if (!githubRepo) missing.push("repo");
  if (!githubBranch) missing.push("branch");

  if (missing.length) {
    return jsonResponse(500, {
      error: "Missing required GitHub environment variables",
      missing: missing,
      acceptedKeys: {
        token: ["GITHUB_TOKEN", "GH_TOKEN"],
        owner: ["GITHUB_OWNER", "GH_OWNER"],
        repo: ["GITHUB_REPO", "GH_REPO"],
        branch: ["GITHUB_BRANCH", "GH_BRANCH"]
      }
    });
  }

  var body = await parseJsonBody(event.body);
  if (!body || !body.menu || !body.availability) {
    return jsonResponse(400, { error: "Invalid payload" });
  }

  try {
    var menuPath = "data/menu.json";
    var availabilityPath = "data/availability.json";

    var menuSha = await readGithubFile(
      githubOwner,
      githubRepo,
      githubBranch,
      menuPath,
      githubToken
    );

    var menuCommitSha = await writeGithubFile(
      githubOwner,
      githubRepo,
      githubBranch,
      menuPath,
      githubToken,
      "CMS: update menu",
      body.menu,
      menuSha
    );

    var availabilitySha = await readGithubFile(
      githubOwner,
      githubRepo,
      githubBranch,
      availabilityPath,
      githubToken
    );

    var availabilityCommitSha = await writeGithubFile(
      githubOwner,
      githubRepo,
      githubBranch,
      availabilityPath,
      githubToken,
      "CMS: update availability",
      body.availability,
      availabilitySha
    );

    return jsonResponse(200, {
      success: true,
      commit: availabilityCommitSha || menuCommitSha || null
    });
  } catch (error) {
    return jsonResponse(500, {
      error: error && error.message ? error.message : "Publish failed"
    });
  }
};
