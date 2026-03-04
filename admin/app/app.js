(function () {
  var loginView = document.getElementById("login-view");
  var dashboardView = document.getElementById("dashboard-view");
  var loginButton = document.getElementById("login-button");
  var logoutButton = document.getElementById("logout-button");
  var sessionEmail = document.getElementById("session-email");
  var loginMessage = document.getElementById("login-message");

  function getIdentity() {
    return window.netlifyIdentity || null;
  }

  function getUserEmail(user) {
    if (!user) return "";
    return user.email || (user.user_metadata && user.user_metadata.email) || "Usuario autenticado";
  }

  function showLoginView(message) {
    loginView.classList.remove("is-hidden");
    dashboardView.classList.add("is-hidden");

    if (message) {
      loginMessage.textContent = message;
      return;
    }

    loginMessage.textContent = "";
  }

  function showDashboardView(user) {
    sessionEmail.textContent = getUserEmail(user);
    dashboardView.classList.remove("is-hidden");
    loginView.classList.add("is-hidden");
    loginMessage.textContent = "";
  }

  function hashHasAuthToken() {
    return /(?:^#|[&#])(invite_token|recovery_token|confirmation_token)=/i.test(
      window.location.hash
    );
  }

  function clearHash() {
    if (!window.location.hash) return;
    var cleanUrl = window.location.pathname + window.location.search;
    window.history.replaceState({}, document.title, cleanUrl);
  }

  function openIdentityModal() {
    var identity = getIdentity();
    if (!identity) return;
    identity.open("login");
  }

  function handleTokenFlow() {
    if (!hashHasAuthToken()) return;
    openIdentityModal();
    window.setTimeout(clearHash, 40);
  }

  function bindEvents() {
    loginButton.addEventListener("click", function () {
      openIdentityModal();
    });

    logoutButton.addEventListener("click", function () {
      var identity = getIdentity();
      if (!identity) return;
      identity.logout();
    });
  }

  function initAuth() {
    var identity = getIdentity();
    if (!identity) {
      showLoginView("No se pudo cargar Netlify Identity.");
      loginButton.disabled = true;
      return;
    }

    identity.on("init", function (user) {
      if (user) {
        showDashboardView(user);
      } else {
        showLoginView();
        handleTokenFlow();
      }
    });

    identity.on("login", function (user) {
      showDashboardView(user);
      clearHash();
    });

    identity.on("logout", function () {
      showLoginView();
    });

    identity.on("error", function (error) {
      var message = "Error de autenticacion.";
      if (error && error.message) {
        message = error.message;
      }
      showLoginView(message);
    });

    var existingUser = identity.currentUser();
    if (existingUser) {
      showDashboardView(existingUser);
    } else {
      showLoginView();
    }

    identity.init();
  }

  bindEvents();
  initAuth();
})();
