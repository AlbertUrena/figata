(function () {
  if (window.FigataPublicAnalytics && window.FigataPublicAnalytics.__initialized) {
    return;
  }

  var sdk = window.FigataAnalyticsSDK;
  var analyticsConfig = window.FigataAnalyticsConfig;
  var publicPaths = window.FigataPublicPaths;

  if (!sdk || !publicPaths || !analyticsConfig) {
    return;
  }

  var state = {
    currentPath: '',
    pageStartedAt: Date.now(),
    seenSections: new Set(),
    seenMilestones: new Set(),
    lastBurgerState: '',
    sectionObserver: null,
    rebindTimer: null,
    activePage: null,
  };

  function detectNavigationType() {
    try {
      var entries = performance.getEntriesByType('navigation');
      if (entries && entries.length && entries[0].type) {
        if (entries[0].type === 'back_forward') {
          return 'back_forward';
        }
        if (entries[0].type === 'reload') {
          return 'reload';
        }
      }
    } catch (_error) {
      // ignore
    }

    return 'hard';
  }

  function currentPath() {
    return analyticsConfig.normalizePath(publicPaths.stripSitePath(window.location.pathname || '/'));
  }

  function routePageTitle() {
    return String(document.title || '').trim();
  }

  function currentRuntimeRoute() {
    var sdkState = sdk.getState();
    return sdkState && sdkState.runtime && sdkState.runtime.route
      ? sdkState.runtime.route
      : { pageType: 'unknown', routeName: 'unknown', siteSection: 'unknown' };
  }

  function captureActivePage() {
    var route = currentRuntimeRoute();
    state.activePage = {
      page_path: currentPath(),
      page_title: routePageTitle(),
      page_type: route.pageType,
      route_name: route.routeName,
      site_section: route.siteSection,
    };
    return state.activePage;
  }

  function emitPageContext(navigationType) {
    if (typeof window === 'undefined' || typeof window.CustomEvent !== 'function') {
      return;
    }

    var sdkState = sdk.getState ? sdk.getState() : null;
    var activePage = state.activePage || captureActivePage();
    var visitor = sdkState && sdkState.identity && sdkState.identity.visitor
      ? sdkState.identity.visitor
      : null;
    var attribution = sdkState && sdkState.attribution
      ? sdkState.attribution
      : null;
    var internal = sdkState && sdkState.internal
      ? sdkState.internal
      : null;
    var runtime = sdkState && sdkState.runtime
      ? sdkState.runtime
      : null;

    window.dispatchEvent(new CustomEvent('figata:analytics-page-context', {
      detail: {
        page_path: activePage.page_path,
        page_title: activePage.page_title,
        page_type: activePage.page_type,
        route_name: activePage.route_name,
        site_section: activePage.site_section,
        navigation_type: navigationType || 'unknown',
        entry_source: attribution && attribution.entry_source ? attribution.entry_source : 'unknown',
        visit_context: attribution && attribution.visit_context ? attribution.visit_context : 'unknown',
        traffic_class: internal && internal.trafficClass ? internal.trafficClass : 'unknown',
        is_internal: Boolean(internal && internal.isInternal),
        environment: runtime && runtime.environment ? runtime.environment : 'unknown',
        visitor_type: visitor && visitor.isReturning ? 'returning' : 'new',
      },
    }));
  }

  function trackSessionStartIfNeeded(sdkState, navigationType) {
    if (!sdkState || !sdkState.identity || !sdkState.identity.session || !sdkState.identity.session.createdFresh) {
      return Promise.resolve();
    }

    return sdk.track('session_start', {
      session_sequence: sdkState.identity.session.sequence,
      navigation_type: navigationType,
      is_returning_visitor: Boolean(sdkState.identity.visitor && sdkState.identity.visitor.isReturning),
      referrer_host: referrerHost(),
    });
  }

  function trackPageView(navigationType) {
    var activePage = captureActivePage();
    emitPageContext(navigationType);
    return sdk.track('page_view', {
      page_title: activePage.page_title,
      navigation_type: navigationType,
      referrer_host: referrerHost(),
    });
  }

  function trackPageExit(reason, pageContext) {
    var activePage = pageContext || state.activePage;
    if (!activePage || !activePage.page_path) {
      return;
    }

    var engagementTimeMs = Math.max(0, Date.now() - state.pageStartedAt);
    sdk.track('page_exit', {
      engagement_time_ms: engagementTimeMs,
      navigation_type: reason || 'unknown',
      page_path: activePage.page_path,
      page_title: activePage.page_title,
      page_type: activePage.page_type,
      route_name: activePage.route_name,
      site_section: activePage.site_section,
    });
  }

  function referrerHost() {
    try {
      return document.referrer ? new URL(document.referrer).hostname.toLowerCase() : 'direct';
    } catch (_error) {
      return 'direct';
    }
  }

  function boot() {
    sdk.init().then(function (sdkState) {
      state.currentPath = currentPath();
      state.pageStartedAt = Date.now();
      captureActivePage();
      trackSessionStartIfNeeded(sdkState, detectNavigationType());
      trackSourceResolution();
      trackPageView(detectNavigationType());
      bindClickTracking();
      bindScrollTracking();
      bindSectionTracking();
      bindBurgerTracking();
      bindHistoryTracking();
    });
  }

  function trackSourceResolution() {
    var sdkState = sdk.getState();
    if (!sdkState || !sdkState.attribution) {
      return;
    }

    sdk.track('source_attribution_resolved', {
      entry_source_detail: sdkState.attribution.entry_source_detail,
      source_medium: sdkState.attribution.source_medium,
      source_campaign: sdkState.attribution.source_campaign,
      source_content: sdkState.attribution.source_content,
      referrer_host: sdkState.attribution.referrer_host,
    });
  }

  function bindClickTracking() {
    if (document.documentElement.hasAttribute('data-analytics-click-bound')) {
      return;
    }

    document.documentElement.setAttribute('data-analytics-click-bound', 'true');
    document.addEventListener('click', function (event) {
      var target = event.target && event.target.closest ? event.target.closest('a, button') : null;
      if (!target) {
        return;
      }

      if (target.closest('.navbar__links')) {
        sdk.track('nav_link_click', buildCtaPayload(target, 'header_nav'));
        return;
      }

      var ctaPayload = classifyCta(target);
      if (!ctaPayload) {
        return;
      }

      sdk.track('cta_click', ctaPayload);
      emitCompatibilityAlias(ctaPayload);
    }, true);
  }

  function emitCompatibilityAlias(payload) {
    if (payload.cta_category === 'whatsapp') {
      sdk.track('whatsapp_click', payload);
    }
    if (payload.cta_category === 'reservation') {
      sdk.track('reserve_click', payload);
    }
    if (payload.cta_category === 'delivery') {
      sdk.track('delivery_click', payload);
    }
    if (payload.cta_category === 'events') {
      sdk.track('event_interest_click', payload);
    }
  }

  function buildCtaPayload(element, navLocation) {
    var label = textLabel(element);
    var target = hrefTarget(element);
    return {
      nav_location: navLocation || resolveNavLocation(element),
      cta_id: element.getAttribute('data-analytics-id') || inferElementId(element, label),
      cta_label: label,
      cta_target: target,
      cta_category: classifyCategory(element, label, target),
    };
  }

  function classifyCta(element) {
    var isAnchor = element.tagName === 'A';
    var isButton = element.tagName === 'BUTTON';
    if (!isAnchor && !isButton) {
      return null;
    }

    var label = textLabel(element);
    var target = hrefTarget(element);
    var category = classifyCategory(element, label, target);
    if (!category) {
      return null;
    }

    return {
      cta_id: element.getAttribute('data-analytics-id') || inferElementId(element, label),
      cta_label: label,
      cta_target: target,
      cta_category: category,
      nav_location: resolveNavLocation(element),
    };
  }

  function classifyCategory(element, label, target) {
    var normalizedLabel = label.toLowerCase();
    var normalizedTarget = String(target || '').toLowerCase();

    if (element.hasAttribute('data-delivery-link') || normalizedLabel.indexOf('delivery') !== -1 || normalizedTarget.indexOf('ubereats') !== -1 || normalizedTarget.indexOf('pedidosya') !== -1) {
      return 'delivery';
    }
    if (normalizedTarget.indexOf('wa.me') !== -1 || normalizedLabel.indexOf('whatsapp') !== -1 || normalizedLabel.indexOf('escribenos') !== -1) {
      return 'whatsapp';
    }
    if (normalizedLabel.indexOf('reserv') !== -1 || normalizedTarget.indexOf('#reservar') !== -1) {
      return 'reservation';
    }
    if (normalizedTarget.indexOf('/eventos') !== -1 || normalizedLabel.indexOf('pizza party') !== -1 || normalizedLabel.indexOf('evento') !== -1) {
      return 'events';
    }
    if (normalizedTarget.indexOf('/menu') !== -1 || normalizedLabel === 'menu' || normalizedLabel.indexOf('ver menu') !== -1) {
      return 'menu';
    }
    if (normalizedLabel.indexOf('tour virtual') !== -1) {
      return 'virtual_tour';
    }
    if (normalizedTarget.indexOf('#contacto') !== -1 || normalizedTarget.indexOf('#ubicacion') !== -1) {
      return 'navigation';
    }

    return '';
  }

  function resolveNavLocation(element) {
    if (element.closest('.navbar__actions')) {
      return 'header_actions';
    }
    if (element.closest('.navbar')) {
      return 'header_nav';
    }
    if (element.closest('footer')) {
      return 'footer';
    }
    if (element.closest('.hero')) {
      return 'hero';
    }
    return 'body';
  }

  function inferElementId(element, label) {
    var id = element.id || element.getAttribute('name') || '';
    if (id) {
      return id;
    }

    var className = typeof element.className === 'string' ? element.className.split(/\s+/).filter(Boolean)[0] : '';
    if (className) {
      return className;
    }

    return label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'cta';
  }

  function textLabel(element) {
    return String(
      element.getAttribute('data-analytics-label') ||
      element.getAttribute('aria-label') ||
      element.textContent ||
      element.getAttribute('href') ||
      element.id ||
      'cta'
    ).trim().replace(/\s+/g, ' ');
  }

  function hrefTarget(element) {
    if (element.tagName === 'A') {
      return element.href || element.getAttribute('href') || '';
    }

    return element.getAttribute('data-analytics-target') || element.getAttribute('aria-controls') || element.id || '';
  }

  function bindScrollTracking() {
    if (document.documentElement.hasAttribute('data-analytics-scroll-bound')) {
      return;
    }

    document.documentElement.setAttribute('data-analytics-scroll-bound', 'true');
    var ticking = false;

    window.addEventListener('scroll', function () {
      if (ticking) {
        return;
      }

      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        var maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        var percent = Math.min(100, Math.round((window.scrollY / maxScroll) * 100));
        [25, 50, 75, 90].forEach(function (milestone) {
          if (percent >= milestone && !state.seenMilestones.has(milestone)) {
            state.seenMilestones.add(milestone);
            sdk.track('scroll_milestone', {
              scroll_percent: milestone,
              scroll_milestone_name: milestone + '_percent',
            });
          }
        });
      });
    }, { passive: true });
  }

  function bindSectionTracking() {
    if (state.sectionObserver) {
      state.sectionObserver.disconnect();
    }

    if (!('IntersectionObserver' in window)) {
      return;
    }

    state.sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        var element = entry.target;
        var sectionId = element.getAttribute('id') || element.getAttribute('data-analytics-section');
        if (!sectionId || state.seenSections.has(sectionId)) {
          return;
        }

        state.seenSections.add(sectionId);
        sdk.track(sectionId.indexOf('menu-page') === 0 ? 'menu_section_view' : 'section_view', {
          section_id: sectionId,
          section_name: textLabel(element.querySelector('h1, h2, h3') || element),
          section_index: sectionIndex(element),
        });
      });
    }, {
      root: null,
      threshold: 0.55,
    });

    Array.prototype.slice.call(document.querySelectorAll('main section[id], main [data-analytics-section]')).forEach(function (section) {
      state.sectionObserver.observe(section);
    });
  }

  function sectionIndex(element) {
    var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id], main [data-analytics-section]'));
    return Math.max(0, sections.indexOf(element));
  }

  function bindBurgerTracking() {
    var observed = document.querySelector('[data-menu-mobile-nav]');
    if (!(observed instanceof HTMLElement) || !('MutationObserver' in window)) {
      return;
    }

    state.lastBurgerState = observed.getAttribute('data-menu-mobile-nav') || '';
    var observer = new MutationObserver(function () {
      var nextState = observed.getAttribute('data-menu-mobile-nav') || '';
      if (!nextState || nextState === state.lastBurgerState) {
        return;
      }

      state.lastBurgerState = nextState;
      sdk.track('burger_menu_toggle', {
        nav_location: resolveNavLocation(observed),
        burger_state: nextState,
      });
    });

    observer.observe(observed, { attributes: true, attributeFilter: ['data-menu-mobile-nav'] });
  }

  function bindHistoryTracking() {
    if (window.__FIGATA_ANALYTICS_HISTORY_PATCHED) {
      return;
    }

    window.__FIGATA_ANALYTICS_HISTORY_PATCHED = true;

    ['pushState', 'replaceState'].forEach(function (methodName) {
      var original = window.history[methodName];
      window.history[methodName] = function () {
        var previousPath = currentPath();
        var result = original.apply(this, arguments);
        window.setTimeout(function () {
          handleRouteChange(methodName === 'pushState' ? 'soft' : 'replace', previousPath);
        }, 32);
        return result;
      };
    });

    window.addEventListener('popstate', function () {
      window.setTimeout(function () {
        handleRouteChange('back_forward', state.currentPath);
      }, 32);
    });
  }

  function handleRouteChange(navigationType, previousPath) {
    var nextPath = currentPath();
    if (nextPath === state.currentPath) {
      return;
    }

    var previousPage = state.activePage
      ? Object.assign({}, state.activePage)
      : {
          page_path: previousPath || state.currentPath,
          page_title: routePageTitle(),
          page_type: currentRuntimeRoute().pageType,
          route_name: currentRuntimeRoute().routeName,
          site_section: currentRuntimeRoute().siteSection,
        };

    trackPageExit(navigationType, previousPage);
    state.currentPath = nextPath;
    state.pageStartedAt = Date.now();
    state.seenSections = new Set();
    state.seenMilestones = new Set();

    if (state.rebindTimer) {
      window.clearTimeout(state.rebindTimer);
    }

    state.rebindTimer = window.setTimeout(function () {
      trackPageView(navigationType || 'soft');
      bindSectionTracking();
    }, previousPath && previousPath !== nextPath ? 120 : 0);
  }

  window.FigataPublicAnalytics = {
    __initialized: true,
    rebindSections: bindSectionTracking,
    trackPageView: trackPageView,
  };

  boot();
})();
