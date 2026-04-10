(function () {
  var root = document.documentElement;
  var body = document.body;
  var indicators = [];

  if (!root || !body) {
    return;
  }

  if (root.hasAttribute("data-disable-scroll-indicator") || body.hasAttribute("data-disable-scroll-indicator")) {
    return;
  }

  var reducedMotionQuery =
    typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;

  function getHideDelay() {
    return reducedMotionQuery && reducedMotionQuery.matches ? 180 : 760;
  }

  function getDocumentHeight() {
    return Math.max(
      root.scrollHeight,
      body.scrollHeight,
      (document.scrollingElement || root).scrollHeight,
      root.offsetHeight,
      body.offsetHeight
    );
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function createIndicator(target, options) {
    if (!(target instanceof HTMLElement)) {
      return null;
    }

    var host = options.host instanceof HTMLElement ? options.host : target;

    if (host.querySelector(":scope > .public-scroll-indicator")) {
      return null;
    }

    var meter = document.createElement("div");
    var track = document.createElement("div");
    var thumb = document.createElement("div");
    var hideTimer = 0;
    var rafId = 0;
    var resizeObserver = null;

    meter.className = "public-scroll-indicator" + (options.contained ? " public-scroll-indicator--contained" : "");
    meter.setAttribute("aria-hidden", "true");

    track.className = "public-scroll-indicator__track";
    thumb.className = "public-scroll-indicator__thumb";

    track.appendChild(thumb);
    meter.appendChild(track);
    host.appendChild(meter);

    function getScrollTop() {
      if (options.root) {
        if (typeof window.pageYOffset === "number") {
          return window.pageYOffset;
        }

        var scrollingElement = document.scrollingElement || root;
        return scrollingElement.scrollTop || root.scrollTop || body.scrollTop || 0;
      }

      return target.scrollTop || 0;
    }

    function getViewportHeight() {
      return options.root
        ? window.innerHeight || root.clientHeight || 0
        : target.clientHeight || 0;
    }

    function getScrollHeight() {
      return options.root ? getDocumentHeight() : target.scrollHeight || 0;
    }

    function syncContainedFrame() {
      if (!options.contained) {
        return;
      }

      meter.style.top = target.offsetTop + "px";
      meter.style.height = target.clientHeight + "px";
    }

    function isScrollable() {
      return getScrollHeight() - getViewportHeight() > 1;
    }

    function sync() {
      rafId = 0;

      var scrollHeight = getScrollHeight();
      var viewportHeight = getViewportHeight();
      var maxScroll = Math.max(scrollHeight - viewportHeight, 0);
      var isScrollableTarget = maxScroll > 1;
      var trackHeight = track.clientHeight || meter.clientHeight || target.clientHeight || 1;

      syncContainedFrame();

      meter.classList.toggle("is-scrollable", isScrollableTarget);

      if (!isScrollableTarget) {
        meter.classList.remove("is-visible");
        thumb.style.height = "100%";
        thumb.style.transform = "translate3d(0, 0, 0)";
        return;
      }

      var progress = clamp(getScrollTop() / maxScroll, 0, 1);
      var thumbPercent = clamp((viewportHeight / scrollHeight) * 100, 10, 30);
      var thumbHeight = trackHeight * (thumbPercent / 100);
      var travel = Math.max(trackHeight - thumbHeight, 0);
      var translateY = travel * progress;

      thumb.style.height = thumbPercent.toFixed(3) + "%";
      thumb.style.transform = "translate3d(0, " + translateY.toFixed(2) + "px, 0)";
    }

    function scheduleSync() {
      if (rafId) {
        return;
      }

      rafId = window.requestAnimationFrame(sync);
    }

    function queueHide() {
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(function () {
        meter.classList.remove("is-visible");
      }, getHideDelay());
    }

    function reveal() {
      if (!isScrollable()) {
        return;
      }

      meter.classList.add("is-visible");
      queueHide();
    }

    function handleScroll() {
      scheduleSync();
      reveal();
    }

    function handleVisibility() {
      if (document.hidden) {
        window.clearTimeout(hideTimer);
        meter.classList.remove("is-visible");
        return;
      }

      scheduleSync();
    }

    if (options.root) {
      window.addEventListener("scroll", handleScroll, { passive: true });
    } else {
      target.addEventListener("scroll", handleScroll, { passive: true });
    }

    window.addEventListener("resize", scheduleSync, { passive: true });
    window.addEventListener("load", scheduleSync);
    document.addEventListener("visibilitychange", handleVisibility);

    if (reducedMotionQuery && typeof reducedMotionQuery.addEventListener === "function") {
      reducedMotionQuery.addEventListener("change", queueHide);
    }

    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(scheduleSync);
      resizeObserver.observe(target);
      if (host !== target) {
        resizeObserver.observe(host);
      }
      if (options.root) {
        resizeObserver.observe(root);
        resizeObserver.observe(body);
      }
    }

    scheduleSync();

    return {
      refresh: scheduleSync,
      destroy: function () {
        window.clearTimeout(hideTimer);
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
      }
    };
  }

  function addIndicator(indicator) {
    if (!indicator) {
      return;
    }

    indicators.push(indicator);
  }

  function mountRootIndicator() {
    addIndicator(createIndicator(document.scrollingElement || root, { root: true, host: body }));
  }

  function mountContainedIndicators() {
    document.querySelectorAll("[data-scroll-indicator-container]").forEach(function (node) {
      addIndicator(
        createIndicator(node, {
          root: false,
          contained: true,
          host: node.parentElement
        })
      );
    });
  }

  function mountAll() {
    mountRootIndicator();
    mountContainedIndicators();
  }

  mountAll();

  window.FigataScrollIndicators = {
    mountAll: mountAll,
    refresh: function () {
      indicators.forEach(function (indicator) {
        if (indicator && typeof indicator.refresh === "function") {
          indicator.refresh();
        }
      });
    }
  };
})();
