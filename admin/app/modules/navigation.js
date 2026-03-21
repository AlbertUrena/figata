// admin/app/modules/navigation.js
// Extracted from admin/app/app.js — Phase 5 refactor
// Navigation state machine, transition/animation helpers, programmatic scroll
// lock, and navigation timeline system.
// Dependencies: FigataAdmin.constants (UX_TIMING, NAVIGATION_STATES, NAVIGATION_STATE_GRAPH, DEBUG_NAVIGATION)
//               FigataAdmin.utils (parseCssTimeToMs)

(function () {
  "use strict";

  var ns = window.FigataAdmin = window.FigataAdmin || {};
  var C = ns.constants;
  var parseCssTimeToMs = ns.utils.parseCssTimeToMs;

  // --- Transition / Animation helpers (pure DOM, no state) ---

  function waitNextFrame() {
    return new Promise(function (resolve) {
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(resolve);
      });
    });
  }

  function hasTransitionDuration(element) {
    if (!element || !element.isConnected) return false;
    var style = window.getComputedStyle(element);
    var durations = String(style.transitionDuration || "").split(",").map(parseCssTimeToMs);
    var delays = String(style.transitionDelay || "").split(",").map(parseCssTimeToMs);
    return durations.some(function (durationMs, index) {
      var delayMs = delays[index] !== undefined ? delays[index] : (delays.length ? delays[delays.length - 1] : 0);
      return durationMs + delayMs > 0;
    });
  }

  function getRunningAnimations(element, subtree) {
    if (!element || typeof element.getAnimations !== "function") return [];
    return element.getAnimations({ subtree: Boolean(subtree) }).filter(function (animation) {
      if (!animation) return false;
      return animation.playState === "running" || animation.playState === "pending";
    });
  }

  function waitForTransition(element, options) {
    options = options || {};
    var properties = Array.isArray(options.properties) ? options.properties : [];
    if (!element || !element.isConnected || !hasTransitionDuration(element)) {
      return waitNextFrame();
    }
    var initialValues = {};
    if (properties.length) {
      var initialStyle = window.getComputedStyle(element);
      properties.forEach(function (propertyName) {
        initialValues[propertyName] = initialStyle.getPropertyValue(propertyName);
      });
    }

    return new Promise(function (resolve) {
      var isSettled = false;
      var cleanup = function () {
        element.removeEventListener("transitionend", onTransitionDone);
        element.removeEventListener("transitioncancel", onTransitionDone);
      };
      var settle = function () {
        if (isSettled) return;
        isSettled = true;
        cleanup();
        resolve();
      };
      var onTransitionDone = function (event) {
        if (!event || event.target !== element) return;
        if (properties.length && properties.indexOf(event.propertyName) === -1) return;
        settle();
      };

      element.addEventListener("transitionend", onTransitionDone);
      element.addEventListener("transitioncancel", onTransitionDone);

      waitNextFrame().then(function () {
        if (isSettled) return;
        if (typeof element.getAnimations === "function") {
          if (!getRunningAnimations(element, false).length) {
            settle();
          }
          return;
        }

        if (!properties.length) return;
        var style = window.getComputedStyle(element);
        var hasPropertyChange = properties.some(function (propertyName) {
          return style.getPropertyValue(propertyName) !== initialValues[propertyName];
        });
        if (!hasPropertyChange) {
          settle();
        }
      });
    });
  }

  function waitForAnimation(element, options) {
    options = options || {};
    if (!element || !element.isConnected) {
      return waitNextFrame();
    }
    if (typeof element.getAnimations !== "function") {
      return waitForTransition(element, options);
    }

    return waitNextFrame().then(function () {
      var activeAnimations = getRunningAnimations(element, options.subtree === true);
      if (!activeAnimations.length) return null;
      return Promise.all(activeAnimations.map(function (animation) {
        return animation.finished.catch(function () {
          return null;
        });
      }));
    });
  }

  // --- Navigation state machine ---

  function getNavigationState(state) {
    return (state.navigation && state.navigation.currentState) || C.NAVIGATION_STATES.idle;
  }

  function canTransitionNavigationState(fromState, toState) {
    var from = C.NAVIGATION_STATE_GRAPH[fromState];
    if (!Array.isArray(from)) return false;
    return from.indexOf(toState) !== -1;
  }

  function setNavigationState(state, nextState, options) {
    options = options || {};

    var normalizedNext = String(nextState || "").trim();
    if (!normalizedNext || !C.NAVIGATION_STATE_GRAPH[normalizedNext]) {
      normalizedNext = C.NAVIGATION_STATES.idle;
    }

    var current = getNavigationState(state);
    if (current === normalizedNext) return true;

    var isAllowed = canTransitionNavigationState(current, normalizedNext);
    if (!isAllowed && !options.force) {
      if (C.DEBUG_NAVIGATION) {
        console.warn("[Nav] blocked transition " + current + " -> " + normalizedNext);
      }
      return false;
    }

    state.navigation.currentState = normalizedNext;
    if (C.DEBUG_NAVIGATION) {
      console.debug("[Nav] " + current + " -> " + normalizedNext);
    }
    return true;
  }

  function setNavigationCurrentPanel(state, panel) {
    state.navigation.currentPanel = panel || "dashboard";
  }

  function setNavigationCurrentSection(state, sectionKey) {
    state.navigation.currentSection = sectionKey || "";
  }

  function isNavigationStateIdle(state) {
    return getNavigationState(state) === C.NAVIGATION_STATES.idle;
  }

  function canRunScrollSpy(state, forceSync) {
    if (isProgrammaticScrollLocked(state)) return false;
    var currentState = getNavigationState(state);
    if (currentState === C.NAVIGATION_STATES.idle) return true;
    if (Boolean(forceSync) && currentState === C.NAVIGATION_STATES.syncingScrollSpy) return true;
    return false;
  }

  // --- Programmatic scroll lock ---

  function isProgrammaticScrollLocked(state) {
    return Boolean(state.navigation.isProgrammaticScroll) || Date.now() < state.programmaticScrollLockUntil;
  }

  function clearProgrammaticScrollLock(state, callbacks, options) {
    if (state.programmaticScrollLockTimer) {
      window.clearTimeout(state.programmaticScrollLockTimer);
      state.programmaticScrollLockTimer = 0;
    }
    state.programmaticScrollLockUntil = 0;
    state.navigation.isProgrammaticScroll = false;
    if (!options || options.syncScrollSpy !== false) {
      setNavigationState(state, C.NAVIGATION_STATES.syncingScrollSpy);
      callbacks.requestCurrentPanelScrollSpySync();
      window.requestAnimationFrame(function () {
        if (!state.navigation.isProgrammaticScroll && !state.isPanelTransitioning) {
          setNavigationState(state, C.NAVIGATION_STATES.idle);
        }
      });
    } else if (!state.isPanelTransitioning) {
      setNavigationState(state, C.NAVIGATION_STATES.idle);
    }
  }

  function lockProgrammaticScroll(state, callbacks, durationMs, sectionKey) {
    var lockMs = Math.max(0, Number(durationMs || C.UX_TIMING.programmaticScrollLockMs));
    var now = Date.now();
    var nextExpiry = now + lockMs;
    state.navigation.isProgrammaticScroll = true;
    setNavigationState(state, C.NAVIGATION_STATES.scrollingToAnchor);
    if (sectionKey) {
      setNavigationCurrentSection(state, sectionKey);
    }
    if (nextExpiry > state.programmaticScrollLockUntil) {
      state.programmaticScrollLockUntil = nextExpiry;
    }
    if (state.programmaticScrollLockTimer) {
      window.clearTimeout(state.programmaticScrollLockTimer);
      state.programmaticScrollLockTimer = 0;
    }
    var remainingMs = Math.max(0, state.programmaticScrollLockUntil - now);
    state.programmaticScrollLockTimer = window.setTimeout(function () {
      clearProgrammaticScrollLock(state, callbacks, { syncScrollSpy: true });
    }, remainingMs + C.UX_TIMING.programmaticScrollUnlockBufferMs);
  }

  function runWithProgrammaticScrollLock(state, callbacks, callback, durationMs, sectionKey) {
    lockProgrammaticScroll(state, callbacks, durationMs, sectionKey);
    if (typeof callback === "function") {
      callback();
    }
  }

  // --- Post-navigation action queue ---

  function queuePanelPostNavigationAction(state, panel, callback) {
    if (!state.panelPostNavigationActions || typeof callback !== "function") return;
    state.panelPostNavigationActions[panel] = callback;
  }

  function flushPanelPostNavigationAction(state, panel) {
    if (!state.panelPostNavigationActions) return false;
    var callback = state.panelPostNavigationActions[panel];
    if (typeof callback !== "function") return false;

    Object.keys(state.panelPostNavigationActions).forEach(function (panelKey) {
      state.panelPostNavigationActions[panelKey] = null;
    });
    window.requestAnimationFrame(function () {
      callback();
    });
    return true;
  }

  function clearPanelPostNavigationActions(state) {
    if (!state.panelPostNavigationActions) return;
    Object.keys(state.panelPostNavigationActions).forEach(function (panelKey) {
      state.panelPostNavigationActions[panelKey] = null;
    });
  }

  // --- Navigation timeline ---

  function createNavigationTimelineCancelError() {
    var error = new Error("Navigation timeline cancelled");
    error.cancelled = true;
    return error;
  }

  function isNavigationTimelineCurrent(state, timelineToken) {
    return (
      Number(timelineToken) > 0 &&
      state.navigationTimelineActiveToken === timelineToken &&
      state.navigationTimelineToken === timelineToken
    );
  }

  function assertNavigationTimelineActive(state, timelineToken) {
    if (!isNavigationTimelineCurrent(state, timelineToken)) {
      throw createNavigationTimelineCancelError();
    }
  }

  async function runNavigationTimeline(state, steps, options) {
    options = options || {};
    var normalizedSteps = Array.isArray(steps) ? steps.slice() : [];
    var previousToken = state.navigationTimelineActiveToken;

    state.navigationTimelineToken += 1;
    var timelineToken = state.navigationTimelineToken;
    state.navigationTimelineActiveToken = timelineToken;

    if (previousToken && previousToken !== timelineToken && C.DEBUG_NAVIGATION) {
      console.debug("[TIMELINE] cancel previous #" + previousToken);
    }

    if (C.DEBUG_NAVIGATION) {
      console.debug("[TIMELINE] start #" + timelineToken + (options.label ? " (" + options.label + ")" : ""));
    }

    try {
      for (var stepIndex = 0; stepIndex < normalizedSteps.length; stepIndex += 1) {
        assertNavigationTimelineActive(state, timelineToken);
        var stepEntry = normalizedSteps[stepIndex];
        var stepName = "step-" + (stepIndex + 1);
        var stepRunner = null;

        if (typeof stepEntry === "function") {
          stepRunner = stepEntry;
        } else if (stepEntry && typeof stepEntry.run === "function") {
          stepRunner = stepEntry.run;
          if (stepEntry.name) {
            stepName = stepEntry.name;
          }
        }

        if (!stepRunner) continue;
        if (C.DEBUG_NAVIGATION) {
          console.debug("[TIMELINE] step: " + stepName);
        }
        await stepRunner({
          token: timelineToken,
          assertActive: function () {
            assertNavigationTimelineActive(state, timelineToken);
          }
        });
        assertNavigationTimelineActive(state, timelineToken);
      }

      if (C.DEBUG_NAVIGATION) {
        console.debug("[TIMELINE] done #" + timelineToken);
      }
      return { cancelled: false, token: timelineToken };
    } catch (error) {
      if (error && error.cancelled) {
        if (C.DEBUG_NAVIGATION) {
          console.debug("[TIMELINE] cancelled #" + timelineToken);
        }
        return { cancelled: true, token: timelineToken };
      }
      throw error;
    } finally {
      if (state.navigationTimelineActiveToken === timelineToken) {
        state.navigationTimelineActiveToken = 0;
      }
    }
  }

  ns.navigation = {
    // Transition / animation helpers
    waitNextFrame: waitNextFrame,
    hasTransitionDuration: hasTransitionDuration,
    getRunningAnimations: getRunningAnimations,
    waitForTransition: waitForTransition,
    waitForAnimation: waitForAnimation,
    // Navigation state machine
    getNavigationState: getNavigationState,
    canTransitionNavigationState: canTransitionNavigationState,
    setNavigationState: setNavigationState,
    setNavigationCurrentPanel: setNavigationCurrentPanel,
    setNavigationCurrentSection: setNavigationCurrentSection,
    isNavigationStateIdle: isNavigationStateIdle,
    canRunScrollSpy: canRunScrollSpy,
    // Programmatic scroll lock
    isProgrammaticScrollLocked: isProgrammaticScrollLocked,
    clearProgrammaticScrollLock: clearProgrammaticScrollLock,
    lockProgrammaticScroll: lockProgrammaticScroll,
    runWithProgrammaticScrollLock: runWithProgrammaticScrollLock,
    // Post-navigation action queue
    queuePanelPostNavigationAction: queuePanelPostNavigationAction,
    flushPanelPostNavigationAction: flushPanelPostNavigationAction,
    clearPanelPostNavigationActions: clearPanelPostNavigationActions,
    // Navigation timeline
    createNavigationTimelineCancelError: createNavigationTimelineCancelError,
    isNavigationTimelineCurrent: isNavigationTimelineCurrent,
    assertNavigationTimelineActive: assertNavigationTimelineActive,
    runNavigationTimeline: runNavigationTimeline
  };
})();
