(function () {
  if (window.FigataAnalyticsWifiAssist && window.FigataAnalyticsWifiAssist.__initialized) {
    return;
  }

  var sdk = window.FigataAnalyticsSDK;
  var analyticsConfig = window.FigataAnalyticsConfig;
  var analyticsPerformance = window.FigataAnalyticsPerformance || null;

  if (!sdk || !analyticsConfig || typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  var STYLE_ID = 'figata-analytics-wifi-assist-style';
  var ROOT_ID = 'figata-analytics-wifi-assist';
  var BODY_OPEN_CLASS = 'figata-wifi-assist-open';
  var SESSION_STORAGE_KEY = 'figata.analytics.wifi_assist.session.v1';
  var LOCAL_STORAGE_KEY = 'figata.analytics.wifi_assist.local.v1';
  var READY_EVENTS = ['figata:menu-page-ready', 'figata:menu-detail-ready', 'figata:eventos-page-ready'];
  var state = {
    root: null,
    dialog: null,
    instructions: null,
    open: false,
    promptTimerId: 0,
    readyBound: false,
    activeReason: '',
    activeSessionId: '',
    currentRouteName: '',
    lastFocusedElement: null,
    instructionsExpanded: false,
    mounted: false,
  };

  function normalizeText(value, fallback) {
    var normalizedFallback = typeof fallback === 'string' ? fallback : '';
    if (typeof value !== 'string') {
      return normalizedFallback;
    }

    var trimmed = value.trim();
    return trimmed || normalizedFallback;
  }

  function nowMs() {
    return Date.now();
  }

  function getStorage(storageName) {
    try {
      return window[storageName] || null;
    } catch (_error) {
      return null;
    }
  }

  function readJson(storageName, key) {
    var storage = getStorage(storageName);
    if (!storage) {
      return {};
    }

    try {
      var raw = storage.getItem(key);
      if (!raw) {
        return {};
      }

      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_error) {
      return {};
    }
  }

  function writeJson(storageName, key, value) {
    var storage = getStorage(storageName);
    if (!storage) {
      return;
    }

    try {
      storage.setItem(key, JSON.stringify(value || {}));
    } catch (_error) {
      // ignore storage failures
    }
  }

  function readSessionUiState() {
    return readJson('sessionStorage', SESSION_STORAGE_KEY);
  }

  function writeSessionUiState(nextState) {
    writeJson('sessionStorage', SESSION_STORAGE_KEY, nextState);
  }

  function readLocalUiState() {
    return readJson('localStorage', LOCAL_STORAGE_KEY);
  }

  function writeLocalUiState(nextState) {
    writeJson('localStorage', LOCAL_STORAGE_KEY, nextState);
  }

  function updateSessionUiState(patch) {
    var current = readSessionUiState();
    var nextState = Object.assign({}, current, patch || {});
    writeSessionUiState(nextState);
    return nextState;
  }

  function updateLocalUiState(patch) {
    var current = readLocalUiState();
    var nextState = Object.assign({}, current, patch || {});
    writeLocalUiState(nextState);
    return nextState;
  }

  function getConfig() {
    var runtimeConfig = window.__FIGATA_WIFI_ASSIST;
    return Object.assign({}, analyticsConfig.WIFI_ASSIST || {}, runtimeConfig && typeof runtimeConfig === 'object' ? runtimeConfig : {});
  }

  function getSdkState() {
    return sdk.getState ? sdk.getState() : null;
  }

  function getSessionId() {
    var sdkState = getSdkState();
    return normalizeText(
      sdkState && sdkState.identity && sdkState.identity.session
        ? sdkState.identity.session.id
        : '',
      ''
    );
  }

  function getVisitContext() {
    var sdkState = getSdkState();
    return normalizeText(sdkState && sdkState.attribution ? sdkState.attribution.visit_context : '', 'unknown');
  }

  function getRouteName() {
    var sdkState = getSdkState();
    return normalizeText(sdkState && sdkState.runtime && sdkState.runtime.route ? sdkState.runtime.route.routeName : '', 'unknown');
  }

  function getEntrySource() {
    var sdkState = getSdkState();
    return normalizeText(sdkState && sdkState.attribution ? sdkState.attribution.entry_source : '', 'unknown');
  }

  function isInternalTraffic() {
    var sdkState = getSdkState();
    var trafficClass = normalizeText(
      sdkState && sdkState.internal ? sdkState.internal.trafficClass : '',
      'unknown'
    );

    if (!(sdkState && sdkState.internal && sdkState.internal.isInternal)) {
      return false;
    }

    return trafficClass === 'internal' || trafficClass === 'admin';
  }

  function isPromptEligibleRoute(routeName, config) {
    return Array.isArray(config.eligibleRouteNames) && config.eligibleRouteNames.indexOf(routeName) !== -1;
  }

  function isPromptEligibleContext(visitContext, config) {
    return Array.isArray(config.eligibleVisitContexts) && config.eligibleVisitContexts.indexOf(visitContext) !== -1;
  }

  function inferAssistReason(config) {
    var networkSnapshot = analyticsPerformance && typeof analyticsPerformance.getNetworkSnapshot === 'function'
      ? analyticsPerformance.getNetworkSnapshot()
      : {};
    var performanceState = analyticsPerformance && typeof analyticsPerformance.getState === 'function'
      ? analyticsPerformance.getState()
      : null;
    var metricValues = performanceState && performanceState.metricValues ? performanceState.metricValues : {};
    var effectiveType = normalizeText(networkSnapshot.network_effective_type, 'unknown');
    var downlink = Number(networkSnapshot.network_downlink_mbps) || 0;
    var rtt = Number(networkSnapshot.network_rtt_ms) || 0;
    var routeReadyMs = Number(metricValues.route_ready_ms) || 0;

    if (networkSnapshot.network_save_data) {
      return 'qr_entry_save_data';
    }

    if (
      Array.isArray(config.lowBandwidthEffectiveTypes) &&
      config.lowBandwidthEffectiveTypes.indexOf(effectiveType) !== -1
    ) {
      return 'qr_entry_low_bandwidth';
    }

    if (downlink > 0 && downlink <= Number(config.lowBandwidthDownlinkMbps || 0)) {
      return 'qr_entry_low_bandwidth';
    }

    if (rtt > 0 && rtt >= Number(config.highLatencyRttMs || 0)) {
      return 'qr_entry_high_latency';
    }

    if (routeReadyMs > 0 && routeReadyMs >= Number(config.routeReadySlowMs || 0)) {
      return 'qr_entry_slow_route';
    }

    return 'qr_entry_in_store_probable';
  }

  function readConfirmationHint(config) {
    var params = new URL(window.location.href).searchParams;
    var runtimeConfig = window.__FIGATA_WIFI_ASSIST;
    var searchParam = normalizeText(config.confirmationSearchParam, 'fg_wifi');
    var searchValue = normalizeText(params.get(searchParam)).toLowerCase();
    var confirmedValues = Array.isArray(config.confirmationSearchValues)
      ? config.confirmationSearchValues.map(function (value) {
          return normalizeText(value).toLowerCase();
        })
      : [];

    if (searchValue && confirmedValues.indexOf(searchValue) !== -1) {
      return {
        confirmed: true,
        confidence: Number(config.signalConfirmationConfidence) || 1,
        source: 'query_param',
      };
    }

    if (
      runtimeConfig &&
      typeof runtimeConfig === 'object' &&
      (runtimeConfig.confirmed === true || runtimeConfig.localNetworkMatched === true)
    ) {
      return {
        confirmed: true,
        confidence: Number(config.signalConfirmationConfidence) || 1,
        source: 'runtime_hint',
      };
    }

    return {
      confirmed: false,
      confidence: 0,
      source: '',
    };
  }

  function shouldSuppressPrompt(sessionId, config) {
    var sessionState = readSessionUiState();
    var localState = readLocalUiState();
    var now = nowMs();
    var dismissedCooldownMs = Math.max(0, Number(config.dismissedCooldownHours) || 0) * 60 * 60 * 1000;
    var shownCooldownMs = Math.max(0, Number(config.shownCooldownHours) || 0) * 60 * 60 * 1000;
    var confirmedCooldownMs = Math.max(0, Number(config.confirmedCooldownHours) || 0) * 60 * 60 * 1000;

    if (!sessionId) {
      return true;
    }

    if (sessionState.lastShownSessionId === sessionId) {
      return true;
    }

    if (sessionState.lastDismissedSessionId === sessionId) {
      return true;
    }

    if (sessionState.lastConfirmedSessionId === sessionId) {
      return true;
    }

    if (
      dismissedCooldownMs > 0 &&
      Number(localState.lastDismissedAt || 0) > 0 &&
      now - Number(localState.lastDismissedAt) < dismissedCooldownMs
    ) {
      return true;
    }

    if (
      shownCooldownMs > 0 &&
      Number(localState.lastShownAt || 0) > 0 &&
      now - Number(localState.lastShownAt) < shownCooldownMs
    ) {
      return true;
    }

    if (
      confirmedCooldownMs > 0 &&
      Number(localState.lastConfirmedAt || 0) > 0 &&
      now - Number(localState.lastConfirmedAt) < confirmedCooldownMs
    ) {
      return true;
    }

    return false;
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = '' +
      'body.' + BODY_OPEN_CLASS + ' { overflow: hidden; }' +
      '#' + ROOT_ID + ' { position: fixed; inset: 0; z-index: 1200; display: none; }' +
      '#' + ROOT_ID + '[data-open="true"] { display: block; }' +
      '#' + ROOT_ID + ' .figata-wifi-assist__backdrop { position: absolute; inset: 0; background: rgba(11, 14, 18, 0.6); backdrop-filter: blur(16px); }' +
      '#' + ROOT_ID + ' .figata-wifi-assist__viewport { position: relative; z-index: 1; min-height: 100%; display: flex; align-items: center; justify-content: center; padding: 24px; }' +
      '#' + ROOT_ID + ' .figata-wifi-assist__dialog { width: min(100%, 440px); background: linear-gradient(180deg, rgba(254, 248, 239, 0.98) 0%, rgba(246, 235, 222, 0.98) 100%); color: #25160f; border-radius: 28px; border: 1px solid rgba(127, 77, 40, 0.18); box-shadow: 0 34px 90px rgba(17, 14, 11, 0.24); padding: 28px; position: relative; }' +
      '#' + ROOT_ID + ' .figata-wifi-assist__eyebrow { margin: 0 0 10px; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: #8d5b33; font-weight: 700; }' +
      '#' + ROOT_ID + ' .figata-wifi-assist__title { margin: 0; font-size: clamp(28px, 4vw, 34px); line-height: 1.02; }' +
      '#' + ROOT_ID + ' .figata-wifi-assist__copy { margin: 14px 0 0; font-size: 15px; line-height: 1.55; color: rgba(37, 22, 15, 0.82); }' +
      '#' + ROOT_ID + ' .figata-wifi-assist__chip { display: inline-flex; align-items: center; gap: 8px; margin-top: 16px; padding: 8px 12px; border-radius: 999px; background: rgba(143, 88, 49, 0.11); color: #6b4124; font-size: 12px; font-weight: 700; }' +
      '#' + ROOT_ID + ' .figata-wifi-assist__credentials { margin-top: 20px; display: grid; gap: 12px; }' +
      '#' + ROOT_ID + ' .figata-wifi-assist__credential { padding: 14px 16px; border-radius: 18px; background: rgba(255, 255, 255, 0.72); border: 1px solid rgba(127, 77, 40, 0.12); }' +
      '#' + ROOT_ID + ' .figata-wifi-assist__credential-label { display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(107, 65, 36, 0.8); margin-bottom: 6px; }' +
      '#' + ROOT_ID + ' .figata-wifi-assist__credential-value { display: block; font-size: 18px; line-height: 1.25; font-weight: 700; word-break: break-word; }' +
      '#' + ROOT_ID + ' .figata-wifi-assist__actions { margin-top: 20px; display: grid; gap: 10px; }' +
      '#' + ROOT_ID + ' .figata-wifi-assist__button { appearance: none; border: 0; cursor: pointer; border-radius: 16px; padding: 14px 16px; font: inherit; transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease, color 180ms ease; }' +
      '#' + ROOT_ID + ' .figata-wifi-assist__button:focus-visible { outline: 2px solid #8d5b33; outline-offset: 2px; }' +
      '#' + ROOT_ID + ' .figata-wifi-assist__button--primary { background: #23150f; color: #fff8ef; box-shadow: 0 16px 30px rgba(35, 21, 15, 0.22); }' +
      '#' + ROOT_ID + ' .figata-wifi-assist__button--secondary { background: rgba(143, 88, 49, 0.12); color: #5f3a21; }' +
      '#' + ROOT_ID + ' .figata-wifi-assist__button--ghost { background: transparent; color: rgba(37, 22, 15, 0.78); }' +
      '#' + ROOT_ID + ' .figata-wifi-assist__button:hover { transform: translateY(-1px); }' +
      '#' + ROOT_ID + ' .figata-wifi-assist__instructions { margin-top: 14px; padding: 14px 16px; border-radius: 18px; background: rgba(107, 65, 36, 0.08); color: rgba(37, 22, 15, 0.84); }' +
      '#' + ROOT_ID + ' .figata-wifi-assist__instructions[hidden] { display: none; }' +
      '#' + ROOT_ID + ' .figata-wifi-assist__instructions-title { margin: 0 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.12em; color: #6b4124; }' +
      '#' + ROOT_ID + ' .figata-wifi-assist__instructions-list { margin: 0; padding-left: 18px; display: grid; gap: 8px; font-size: 14px; line-height: 1.45; }' +
      '#' + ROOT_ID + ' .figata-wifi-assist__footer { margin-top: 16px; font-size: 13px; line-height: 1.45; color: rgba(37, 22, 15, 0.7); }' +
      '#' + ROOT_ID + ' .figata-wifi-assist__close { position: absolute; top: 16px; right: 16px; width: 40px; height: 40px; border-radius: 999px; border: 0; background: rgba(107, 65, 36, 0.1); color: #5f3a21; cursor: pointer; font-size: 22px; }' +
      '@media (max-width: 640px) {' +
      '  #' + ROOT_ID + ' .figata-wifi-assist__viewport { align-items: flex-end; padding: 0; }' +
      '  #' + ROOT_ID + ' .figata-wifi-assist__dialog { width: 100%; border-radius: 28px 28px 0 0; padding: 24px 20px calc(24px + env(safe-area-inset-bottom)); }' +
      '}';
    document.head.appendChild(style);
  }

  function ensureRoot() {
    if (state.root && document.body.contains(state.root)) {
      return state.root;
    }

    injectStyles();

    var root = document.createElement('div');
    root.id = ROOT_ID;
    root.setAttribute('data-open', 'false');
    root.setAttribute('aria-hidden', 'true');
    root.innerHTML = '' +
      '<div class="figata-wifi-assist__backdrop" data-wifi-assist-close="backdrop"></div>' +
      '<div class="figata-wifi-assist__viewport">' +
      '  <section class="figata-wifi-assist__dialog" role="dialog" aria-modal="true" aria-labelledby="figata-wifi-assist-title" aria-describedby="figata-wifi-assist-copy">' +
      '    <button type="button" class="figata-wifi-assist__close" data-wifi-assist-close="close_button" aria-label="Cerrar Wi-Fi Assist">&times;</button>' +
      '    <p class="figata-wifi-assist__eyebrow">Wi-Fi Assist</p>' +
      '    <h2 class="figata-wifi-assist__title" id="figata-wifi-assist-title">Conectate al Wi-Fi Figata</h2>' +
      '    <p class="figata-wifi-assist__copy" id="figata-wifi-assist-copy">Para una experiencia mas fluida con fotos y videos del menu, te ayudamos a conectarte sin salir del recorrido.</p>' +
      '    <div class="figata-wifi-assist__chip" data-wifi-assist-reason-chip>Entrada QR detectada</div>' +
      '    <div class="figata-wifi-assist__credentials">' +
      '      <div class="figata-wifi-assist__credential">' +
      '        <span class="figata-wifi-assist__credential-label">Red</span>' +
      '        <strong class="figata-wifi-assist__credential-value" data-wifi-assist-network></strong>' +
      '      </div>' +
      '      <div class="figata-wifi-assist__credential">' +
      '        <span class="figata-wifi-assist__credential-label" data-wifi-assist-credential-label></span>' +
      '        <strong class="figata-wifi-assist__credential-value" data-wifi-assist-credential></strong>' +
      '      </div>' +
      '    </div>' +
      '    <div class="figata-wifi-assist__actions">' +
      '      <button type="button" class="figata-wifi-assist__button figata-wifi-assist__button--primary" data-wifi-assist-action="copy_password">Copiar datos de Wi-Fi</button>' +
      '      <button type="button" class="figata-wifi-assist__button figata-wifi-assist__button--secondary" data-wifi-assist-action="view_instructions" aria-expanded="false" aria-controls="figata-wifi-assist-instructions">Ver instrucciones</button>' +
      '      <button type="button" class="figata-wifi-assist__button figata-wifi-assist__button--secondary" data-wifi-assist-action="confirm_connected">Ya me conecte</button>' +
      '      <button type="button" class="figata-wifi-assist__button figata-wifi-assist__button--ghost" data-wifi-assist-close="continue_without_wifi">Continuar sin conectarme</button>' +
      '    </div>' +
      '    <div class="figata-wifi-assist__instructions" id="figata-wifi-assist-instructions" hidden>' +
      '      <p class="figata-wifi-assist__instructions-title">Como conectarte</p>' +
      '      <ol class="figata-wifi-assist__instructions-list">' +
      '        <li>Abre Wi-Fi en los ajustes de tu telefono.</li>' +
      '        <li>Busca la red <strong data-wifi-assist-network-inline></strong>.</li>' +
      '        <li>Usa la clave o pide ayuda al equipo Figata si hace falta.</li>' +
      '      </ol>' +
      '    </div>' +
      '    <p class="figata-wifi-assist__footer">No intentamos conectarte automaticamente. Solo te damos los datos y reforzamos el contexto in-store de esta sesion.</p>' +
      '  </section>' +
      '</div>';

    document.body.appendChild(root);
    state.root = root;
    state.dialog = root.querySelector('.figata-wifi-assist__dialog');
    state.instructions = root.querySelector('#figata-wifi-assist-instructions');
    bindRootEvents(root);
    state.mounted = true;
    return root;
  }

  function updateRootCopy(config) {
    var root = ensureRoot();
    var networkName = normalizeText(config.networkName, 'Figata Guest');
    var credentialLabel = normalizeText(config.credentialLabel, 'Clave');
    var credentialValue = normalizeText(config.credentialValue, 'Solicitala al equipo Figata');
    var reasonChip = root.querySelector('[data-wifi-assist-reason-chip]');
    var networkNode = root.querySelector('[data-wifi-assist-network]');
    var networkInlineNode = root.querySelector('[data-wifi-assist-network-inline]');
    var credentialLabelNode = root.querySelector('[data-wifi-assist-credential-label]');
    var credentialNode = root.querySelector('[data-wifi-assist-credential]');

    if (reasonChip) {
      reasonChip.textContent = activeReasonLabel(state.activeReason);
    }
    if (networkNode) {
      networkNode.textContent = networkName;
    }
    if (networkInlineNode) {
      networkInlineNode.textContent = networkName;
    }
    if (credentialLabelNode) {
      credentialLabelNode.textContent = credentialLabel;
    }
    if (credentialNode) {
      credentialNode.textContent = credentialValue;
    }
  }

  function activeReasonLabel(reason) {
    switch (normalizeText(reason)) {
      case 'qr_entry_save_data':
        return 'Modo ahorro de datos detectado';
      case 'qr_entry_low_bandwidth':
        return 'Red con ancho de banda limitado';
      case 'qr_entry_high_latency':
        return 'Latencia alta detectada';
      case 'qr_entry_slow_route':
        return 'Carga lenta en esta visita';
      default:
        return 'Entrada QR detectada';
    }
  }

  function getFocusableElements() {
    if (!state.dialog) {
      return [];
    }

    return Array.prototype.slice.call(
      state.dialog.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(function (element) {
      return !element.hidden && element.offsetParent !== null;
    });
  }

  function handleKeydown(event) {
    if (!state.open) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closePrompt('escape');
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    var focusable = getFocusableElements();
    if (!focusable.length) {
      return;
    }

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function bindRootEvents(root) {
    root.addEventListener('click', function (event) {
      var actionTarget = event.target && event.target.closest ? event.target.closest('[data-wifi-assist-action], [data-wifi-assist-close]') : null;
      if (!actionTarget) {
        return;
      }

      var action = normalizeText(actionTarget.getAttribute('data-wifi-assist-action'));
      var closeReason = normalizeText(actionTarget.getAttribute('data-wifi-assist-close'));

      if (closeReason) {
        closePrompt(closeReason);
        return;
      }

      if (action === 'copy_password') {
        handleCopyAction();
        return;
      }

      if (action === 'view_instructions') {
        handleInstructionsAction(actionTarget);
        return;
      }

      if (action === 'confirm_connected') {
        handleConfirmAction();
      }
    });

    document.addEventListener('keydown', handleKeydown, true);
  }

  function openPrompt(reason) {
    var config = getConfig();
    state.activeReason = normalizeText(reason, inferAssistReason(config));
    updateRootCopy(config);

    var root = ensureRoot();
    state.lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    root.setAttribute('data-open', 'true');
    root.setAttribute('aria-hidden', 'false');
    document.body.classList.add(BODY_OPEN_CLASS);
    state.open = true;
    state.instructionsExpanded = false;
    if (state.instructions) {
      state.instructions.hidden = true;
    }

    window.requestAnimationFrame(function () {
      var focusable = getFocusableElements();
      if (focusable.length) {
        focusable[0].focus();
      }
    });
  }

  function closePrompt(closeReason) {
    if (!state.open || !state.root) {
      return;
    }

    var normalizedReason = normalizeText(closeReason, 'dismiss');
    state.root.setAttribute('data-open', 'false');
    state.root.setAttribute('aria-hidden', 'true');
    document.body.classList.remove(BODY_OPEN_CLASS);
    state.open = false;
    state.instructionsExpanded = false;
    if (state.instructions) {
      state.instructions.hidden = true;
    }

    if (state.lastFocusedElement && typeof state.lastFocusedElement.focus === 'function') {
      state.lastFocusedElement.focus();
    }

    updateSessionUiState({
      lastDismissedSessionId: state.activeSessionId,
      lastDismissedAt: nowMs(),
    });
    updateLocalUiState({
      lastDismissedAt: nowMs(),
    });

    sdk.track('wifi_assist_dismissed', {
      wifi_assist_reason: normalizeText(state.activeReason, 'qr_entry_in_store_probable'),
      wifi_assist_action: normalizedReason,
    });
  }

  function copyTextToClipboard(text) {
    var normalizedText = normalizeText(text);
    if (!normalizedText) {
      return Promise.resolve(false);
    }

    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      return navigator.clipboard.writeText(normalizedText).then(function () {
        return true;
      }).catch(function () {
        return fallbackCopy(normalizedText);
      });
    }

    return fallbackCopy(normalizedText);
  }

  function fallbackCopy(text) {
    return new Promise(function (resolve) {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', 'readonly');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();

      var copied = false;
      try {
        copied = document.execCommand('copy');
      } catch (_error) {
        copied = false;
      }

      textarea.remove();
      resolve(Boolean(copied));
    });
  }

  function handleCopyAction() {
    var config = getConfig();
    var copyValue = normalizeText(config.copyValue, 'Red: ' + normalizeText(config.networkName, 'Figata Guest'));

    copyTextToClipboard(copyValue).then(function () {
      sdk.track('wifi_assist_copy_password', {
        wifi_assist_reason: normalizeText(state.activeReason, 'qr_entry_in_store_probable'),
        wifi_assist_action: 'copy_password',
      });
    });
  }

  function handleInstructionsAction(button) {
    if (!state.instructions) {
      return;
    }

    state.instructionsExpanded = !state.instructionsExpanded;
    state.instructions.hidden = !state.instructionsExpanded;
    if (button) {
      button.setAttribute('aria-expanded', state.instructionsExpanded ? 'true' : 'false');
    }

    sdk.track('wifi_assist_cta_click', {
      wifi_assist_reason: normalizeText(state.activeReason, 'qr_entry_in_store_probable'),
      wifi_assist_action: 'view_instructions',
      cta_target: 'wifi_assist_instructions',
    });
  }

  function confirmVisitContext(options) {
    var config = getConfig();
    var currentContext = getVisitContext();
    var confirmedContext = normalizeText(config.confirmedVisitContext, 'in_restaurant_confirmed_wifi');
    var confidence = Number(options && options.confidence) || Number(config.manualConfirmationConfidence) || 0.98;

    if (currentContext === confirmedContext) {
      return Promise.resolve(false);
    }

    sdk.setAttribution({
      visit_context: confirmedContext,
      visit_context_confidence: confidence,
    });

    updateSessionUiState({
      lastConfirmedSessionId: state.activeSessionId,
      lastConfirmedAt: nowMs(),
    });
    updateLocalUiState({
      lastConfirmedAt: nowMs(),
      lastConfirmedSource: normalizeText(options && options.source, 'manual_confirmation'),
    });

    return sdk.track('visit_context_confirmed', {
      visit_context_before: currentContext,
      visit_context: confirmedContext,
      visit_context_confidence: confidence,
    }).then(function () {
      return true;
    });
  }

  function handleConfirmAction() {
    sdk.track('wifi_assist_cta_click', {
      wifi_assist_reason: normalizeText(state.activeReason, 'qr_entry_in_store_probable'),
      wifi_assist_action: 'confirm_connected',
      cta_target: 'wifi_assist_confirmed',
    }).then(function () {
      return confirmVisitContext({
        confidence: Number(getConfig().manualConfirmationConfidence) || 0.98,
        source: 'manual_confirmation',
      });
    }).finally(function () {
      if (state.open) {
        state.root.setAttribute('data-open', 'false');
        state.root.setAttribute('aria-hidden', 'true');
        document.body.classList.remove(BODY_OPEN_CLASS);
        state.open = false;
      }
    });
  }

  function maybeApplyConfirmationHint() {
    var config = getConfig();
    var hint = readConfirmationHint(config);

    if (!hint.confirmed) {
      return Promise.resolve(false);
    }

    return confirmVisitContext({
      confidence: hint.confidence,
      source: hint.source,
    });
  }

  function shouldShowPrompt() {
    var config = getConfig();
    var sessionId = getSessionId();
    var routeName = getRouteName();
    var entrySource = getEntrySource();
    var visitContext = getVisitContext();

    state.activeSessionId = sessionId;
    state.currentRouteName = routeName;

    if (!sessionId || !routeName) {
      return false;
    }

    if (isInternalTraffic()) {
      return false;
    }

    if (!isPromptEligibleRoute(routeName, config)) {
      return false;
    }

    if (Array.isArray(config.eligibleEntrySources) && config.eligibleEntrySources.indexOf(entrySource) === -1) {
      return false;
    }

    if (!isPromptEligibleContext(visitContext, config)) {
      return false;
    }

    if (shouldSuppressPrompt(sessionId, config)) {
      return false;
    }

    return true;
  }

  function maybeShowPrompt() {
    var config = getConfig();
    if (!shouldShowPrompt()) {
      return false;
    }

    state.activeReason = inferAssistReason(config);
    updateSessionUiState({
      lastShownSessionId: state.activeSessionId,
      lastShownAt: nowMs(),
    });
    updateLocalUiState({
      lastShownAt: nowMs(),
      lastShownReason: state.activeReason,
    });

    sdk.track('wifi_assist_shown', {
      wifi_assist_reason: state.activeReason,
      visit_context_before: getVisitContext(),
    });

    openPrompt(state.activeReason);
    return true;
  }

  function clearPromptTimer() {
    if (!state.promptTimerId) {
      return;
    }

    window.clearTimeout(state.promptTimerId);
    state.promptTimerId = 0;
  }

  function schedulePrompt() {
    clearPromptTimer();
    var delayMs = Math.max(0, Number(getConfig().showDelayMs) || 0);
    state.promptTimerId = window.setTimeout(function () {
      maybeApplyConfirmationHint().finally(function () {
        if (getVisitContext() !== normalizeText(getConfig().confirmedVisitContext, 'in_restaurant_confirmed_wifi')) {
          maybeShowPrompt();
        }
      });
    }, delayMs);
  }

  function bindReadySignals() {
    if (state.readyBound) {
      return;
    }

    state.readyBound = true;
    READY_EVENTS.forEach(function (eventName) {
      window.addEventListener(eventName, schedulePrompt);
    });

    window.addEventListener('popstate', schedulePrompt);
    schedulePrompt();
  }

  sdk.whenReady().then(function () {
    ensureRoot();
    updateRootCopy(getConfig());
    bindReadySignals();
  });

  window.FigataAnalyticsWifiAssist = {
    __initialized: true,
    getState: function () {
      return {
        open: state.open,
        activeReason: state.activeReason,
        activeSessionId: state.activeSessionId,
        currentRouteName: state.currentRouteName,
        instructionsExpanded: state.instructionsExpanded,
      };
    },
    maybeApplyConfirmationHint: maybeApplyConfirmationHint,
    maybeShowPrompt: maybeShowPrompt,
    confirmVisitContext: confirmVisitContext,
    openPrompt: openPrompt,
    closePrompt: closePrompt,
  };
})();
