(() => {
  if (window.FigataTransitions?.createFigataTransition) {
    return;
  }

  const DEFAULTS = {
    inDurationMs: 900,
    holdDurationMs: 0,
    outDurationMs: 1000,
    morphInDurationMs: 1200,
    morphOutDurationMs: 800,
    pagePushDurationMs: 1000,
    pagePushFrom: 0,
    pagePushTo: -200,
    pagePushOutFrom: 200,
    pagePushOutTo: 0,
    coverEnterFrom: 100,
    coverEnterTo: 0,
    coverExitTo: -100.2,
    color: "#143f2b",
    svgWidth: 1366,
    svgHeight: 768,
    enterPathStartY: 82.1,
    enterPathCp1X: 353,
    enterPathCp1Y: -21.8,
    enterPathCp2X: 1015,
    enterPathCp2Y: -32.7,
    leavePathCp1X: 1040.2,
    leavePathCp1Y: 660.1,
    leavePathCp2X: 348.6,
    leavePathCp2Y: 657.8,
    activeClass: "",
    useHiddenAttribute: true,
    precision: 2,
    respectReducedMotion: true,
  };

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const lerp = (from, to, progress) => from + (to - from) * progress;

  const createCubicBezier = (p1x, p1y, p2x, p2y) => {
    const cx = 3 * p1x;
    const bx = 3 * (p2x - p1x) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * p1y;
    const by = 3 * (p2y - p1y) - cy;
    const ay = 1 - cy - by;
    const epsilon = 1e-6;

    const sampleCurveX = (t) => ((ax * t + bx) * t + cx) * t;
    const sampleCurveY = (t) => ((ay * t + by) * t + cy) * t;
    const sampleCurveDerivativeX = (t) => (3 * ax * t + 2 * bx) * t + cx;

    const solveCurveX = (x) => {
      let t2 = x;

      for (let i = 0; i < 8; i += 1) {
        const x2 = sampleCurveX(t2) - x;

        if (Math.abs(x2) < epsilon) {
          return t2;
        }

        const d2 = sampleCurveDerivativeX(t2);

        if (Math.abs(d2) < epsilon) {
          break;
        }

        t2 -= x2 / d2;
      }

      let t0 = 0;
      let t1 = 1;
      t2 = x;

      for (let i = 0; i < 16; i += 1) {
        const x2 = sampleCurveX(t2);

        if (Math.abs(x2 - x) < epsilon) {
          return t2;
        }

        if (x > x2) {
          t0 = t2;
        } else {
          t1 = t2;
        }

        t2 = (t1 - t0) * 0.5 + t0;
      }

      return t2;
    };

    return (x) => sampleCurveY(solveCurveX(clamp(x)));
  };

  const EASINGS = {
    enter: createCubicBezier(1, 0, 0.75, 1),
    leave: createCubicBezier(0.65, 0, 0.25, 1),
    rise: (value) => 1 - Math.pow(1 - clamp(value), 3),
  };

  const createFigataTransition = (config = {}) => {
    const options = { ...DEFAULTS, ...config };
    const coverElement = options.coverElement;
    const pathElement =
      options.pathElement || coverElement?.querySelector("path");
    const pagePushTarget = options.pagePushTarget || document.querySelector("main");
    const reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    const format = (value) => Number(value.toFixed(options.precision));

    if (!(coverElement instanceof HTMLElement) || !(pathElement instanceof SVGPathElement)) {
      return {
        playEnter: () => Promise.resolve(false),
        playExit: () => Promise.resolve(false),
        playEnterThenExit: () => Promise.resolve(false),
        cancel: () => false,
        isRunning: () => false,
      };
    }

    let rafId = 0;
    let running = false;
    let currentResolver = null;

    const setCoverVisible = (isVisible) => {
      coverElement.style.visibility = isVisible ? "visible" : "hidden";
      coverElement.style.opacity = isVisible ? "1" : "0";
      coverElement.setAttribute("aria-hidden", String(!isVisible));

      if (options.useHiddenAttribute) {
        coverElement.hidden = !isVisible;
      }

      if (options.activeClass) {
        coverElement.classList.toggle(options.activeClass, isVisible);
      }
    };

    const setCoverTransform = (offsetYPercent) => {
      coverElement.style.transform = `translate3d(0, ${format(offsetYPercent)}%, 0)`;
    };

    const setCoverPath = (pathValue) => {
      pathElement.setAttribute("d", pathValue);
      pathElement.setAttribute("fill", options.color);
    };

    const setPagePush = (offsetYPx) => {
      if (!pagePushTarget) {
        return;
      }

      pagePushTarget.style.transform = `translate3d(0, ${format(offsetYPx)}px, 0)`;
    };

    const buildTopBlobPath = (amount) => {
      const progress = clamp(amount);
      const startY = format(lerp(0, options.enterPathStartY, progress));
      const cp1Y = format(lerp(0, options.enterPathCp1Y, progress));
      const cp2Y = format(lerp(0, options.enterPathCp2Y, progress));

      return [
        `M0 ${startY}`,
        `C${options.enterPathCp1X} ${cp1Y} ${options.enterPathCp2X} ${cp2Y} ${options.svgWidth} ${startY}`,
        `V${options.svgHeight}`,
        "H0",
        "Z",
      ].join(" ");
    };

    const buildBottomBlobPath = (amount) => {
      const progress = clamp(amount);
      const cp1Y = format(lerp(options.svgHeight, options.leavePathCp1Y, progress));
      const cp2Y = format(lerp(options.svgHeight, options.leavePathCp2Y, progress));

      return [
        "M0 0",
        `H${options.svgWidth}`,
        `V${options.svgHeight}`,
        `C${options.leavePathCp1X} ${cp1Y} ${options.leavePathCp2X} ${cp2Y} 0 ${options.svgHeight}`,
        "Z",
      ].join(" ");
    };

    const getContext = (payload = {}) => ({
      ...payload,
      timings: {
        inDurationMs: options.inDurationMs,
        holdDurationMs: options.holdDurationMs,
        outDurationMs: options.outDurationMs,
        morphInDurationMs: options.morphInDurationMs,
        morphOutDurationMs: options.morphOutDurationMs,
        pagePushDurationMs: options.pagePushDurationMs,
      },
      easings: EASINGS,
      helpers: {
        clamp,
        lerp,
        format,
      },
      setPagePush,
      setCoverTransform,
      setCoverPath,
      setCoverVisible,
    });

    const complete = (value = true) => {
      running = false;
      rafId = 0;

      if (typeof currentResolver === "function") {
        const resolver = currentResolver;
        currentResolver = null;
        resolver(value);
      }
    };

    const cancel = ({ resetVisual = false } = {}) => {
      if (!running) {
        return false;
      }

      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }

      if (resetVisual) {
        setCoverTransform(options.coverExitTo);
        setCoverPath(buildTopBlobPath(0));
        setCoverVisible(false);
      }

      complete(false);
      return true;
    };

    const start = (runner) =>
      new Promise((resolve) => {
        if (running) {
          cancel();
        }

        running = true;
        currentResolver = resolve;
        runner();
      });

    const applyDefaultEnterPath = (elapsed) => {
      if (elapsed > options.morphInDurationMs) {
        setCoverPath(buildTopBlobPath(0));
        return;
      }

      const localProgress = clamp(elapsed / options.morphInDurationMs);
      const yoyoProgress = localProgress <= 0.5 ? localProgress * 2 : (1 - localProgress) * 2;
      setCoverPath(buildTopBlobPath(EASINGS.enter(yoyoProgress)));
    };

    const applyDefaultExitPath = (elapsed) => {
      if (elapsed > options.morphOutDurationMs) {
        setCoverPath(buildTopBlobPath(0));
        return;
      }

      const localProgress = clamp(elapsed / options.morphOutDurationMs);
      const yoyoProgress = localProgress <= 0.5 ? localProgress * 2 : (1 - localProgress) * 2;
      setCoverPath(buildBottomBlobPath(EASINGS.leave(yoyoProgress)));
    };

    const playEnter = (runConfig = {}) => {
      if (options.respectReducedMotion && reducedMotionMedia.matches) {
        runConfig.onStart?.(getContext({ elapsedMs: 0, phase: "enter" }));
        runConfig.onMidpoint?.(getContext({ elapsedMs: 0, phase: "enter" }));
        runConfig.onComplete?.(getContext({ elapsedMs: options.inDurationMs, phase: "enter" }));
        return Promise.resolve(true);
      }

      return start(() => {
        const coverFrom = runConfig.coverFrom ?? options.coverEnterFrom;
        const coverTo = runConfig.coverTo ?? options.coverEnterTo;
        const duration = runConfig.durationMs ?? options.inDurationMs;

        setCoverVisible(true);
        setCoverTransform(coverFrom);
        setCoverPath(buildTopBlobPath(0));
        if (runConfig.pagePushStart !== undefined) {
          setPagePush(runConfig.pagePushStart);
        }

        runConfig.onStart?.(getContext({ elapsedMs: 0, phase: "enter" }));

        const startedAt = window.performance.now();
        let midpointFired = false;

        const tick = (now) => {
          const elapsed = now - startedAt;
          const progress = clamp(elapsed / duration);
          const eased = EASINGS.enter(progress);

          setCoverTransform(lerp(coverFrom, coverTo, eased));

          if (typeof runConfig.pagePush === "function") {
            runConfig.pagePush(getContext({ elapsedMs: elapsed, progress, phase: "enter" }));
          } else if (
            Number.isFinite(runConfig.pagePushFrom) &&
            Number.isFinite(runConfig.pagePushTo)
          ) {
            setPagePush(lerp(runConfig.pagePushFrom, runConfig.pagePushTo, eased));
          }

          if (runConfig.path === "none") {
            setCoverPath(buildTopBlobPath(0));
          } else {
            applyDefaultEnterPath(elapsed);
          }

          if (!midpointFired && elapsed >= duration) {
            midpointFired = true;
            runConfig.onMidpoint?.(getContext({ elapsedMs: elapsed, progress: 1, phase: "enter" }));
          }

          runConfig.onTick?.(getContext({ elapsedMs: elapsed, progress, phase: "enter" }));

          if (progress < 1) {
            rafId = window.requestAnimationFrame(tick);
            return;
          }

          if (runConfig.hideCoverOnComplete) {
            setCoverTransform(options.coverExitTo);
            setCoverPath(buildTopBlobPath(0));
            setCoverVisible(false);
          }

          runConfig.onComplete?.(getContext({ elapsedMs: elapsed, progress: 1, phase: "enter" }));
          complete(true);
        };

        rafId = window.requestAnimationFrame(tick);
      });
    };

    const playExit = (runConfig = {}) => {
      if (options.respectReducedMotion && reducedMotionMedia.matches) {
        setPagePush(0);
        setCoverTransform(options.coverExitTo);
        setCoverPath(buildTopBlobPath(0));
        setCoverVisible(false);
        runConfig.onComplete?.(getContext({ elapsedMs: 0, phase: "exit" }));
        return Promise.resolve(true);
      }

      return start(() => {
        const duration = runConfig.durationMs ?? options.outDurationMs;
        const morphDuration = runConfig.morphDurationMs ?? options.morphOutDurationMs;
        const coverFrom = runConfig.coverFrom ?? options.coverEnterTo;
        const coverTo = runConfig.coverTo ?? options.coverExitTo;
        const pagePushFrom = runConfig.pagePushFrom ?? options.pagePushOutFrom;
        const pagePushTo = runConfig.pagePushTo ?? options.pagePushOutTo;

        setCoverVisible(true);
        setCoverTransform(coverFrom);
        setCoverPath(buildTopBlobPath(0));
        setPagePush(pagePushFrom);
        runConfig.onStart?.(getContext({ elapsedMs: 0, phase: "exit" }));

        const startedAt = window.performance.now();

        const tick = (now) => {
          const elapsed = now - startedAt;
          const progress = clamp(elapsed / duration);
          const eased = EASINGS.leave(progress);

          setCoverTransform(lerp(coverFrom, coverTo, eased));

          if (typeof runConfig.pagePush === "function") {
            runConfig.pagePush(getContext({ elapsedMs: elapsed, progress, phase: "exit" }));
          } else {
            setPagePush(lerp(pagePushFrom, pagePushTo, eased));
          }

          if (runConfig.path === "none") {
            setCoverPath(buildTopBlobPath(0));
          } else if (elapsed <= morphDuration) {
            applyDefaultExitPath(elapsed);
          } else {
            setCoverPath(buildTopBlobPath(0));
          }

          runConfig.onTick?.(getContext({ elapsedMs: elapsed, progress, phase: "exit" }));

          if (progress < 1) {
            rafId = window.requestAnimationFrame(tick);
            return;
          }

          setPagePush(pagePushTo);
          setCoverTransform(coverTo);
          setCoverPath(buildTopBlobPath(0));
          setCoverVisible(false);

          runConfig.onComplete?.(getContext({ elapsedMs: elapsed, progress: 1, phase: "exit" }));
          complete(true);
        };

        rafId = window.requestAnimationFrame(tick);
      });
    };

    const playEnterThenExit = (runConfig = {}) => {
      if (options.respectReducedMotion && reducedMotionMedia.matches) {
        runConfig.onStart?.(getContext({ elapsedMs: 0, phase: "enter" }));
        runConfig.onMidpoint?.(getContext({ elapsedMs: 0, phase: "enter" }));
        runConfig.onComplete?.(getContext({ elapsedMs: 0, phase: "exit" }));
        return Promise.resolve(true);
      }

      return start(() => {
        const inDurationMs = runConfig.inDurationMs ?? options.inDurationMs;
        const holdDurationMs = runConfig.holdDurationMs ?? options.holdDurationMs;
        const outDurationMs = runConfig.outDurationMs ?? options.outDurationMs;
        const morphInDurationMs = runConfig.morphInDurationMs ?? options.morphInDurationMs;
        const morphOutDurationMs = runConfig.morphOutDurationMs ?? options.morphOutDurationMs;
        const coverEnterFrom = runConfig.coverEnterFrom ?? options.coverEnterFrom;
        const coverEnterTo = runConfig.coverEnterTo ?? options.coverEnterTo;
        const coverExitTo = runConfig.coverExitTo ?? options.coverExitTo;
        const coverOutStartMs = inDurationMs + holdDurationMs;
        const coverOutMorphEndMs = coverOutStartMs + morphOutDurationMs;
        const totalDurationMs = inDurationMs + holdDurationMs + outDurationMs;
        let midpointFired = false;

        setCoverVisible(true);
        setCoverTransform(coverEnterFrom);
        setCoverPath(buildTopBlobPath(0));
        runConfig.onStart?.(
          getContext({
            elapsedMs: 0,
            totalDurationMs,
            coverOutStartMs,
            phase: "enter",
          })
        );

        const startedAt = window.performance.now();

        const tick = (now) => {
          const elapsed = now - startedAt;
          const clampedElapsed = Math.min(elapsed, totalDurationMs);
          let phase = "enter";
          let coverTranslateY = coverExitTo;

          if (clampedElapsed <= inDurationMs) {
            const enterProgress = EASINGS.enter(clampedElapsed / inDurationMs);
            coverTranslateY = lerp(coverEnterFrom, coverEnterTo, enterProgress);
            phase = "enter";
          } else if (clampedElapsed <= coverOutStartMs) {
            coverTranslateY = coverEnterTo;
            phase = "hold";
          } else if (clampedElapsed <= totalDurationMs) {
            const outProgress = EASINGS.leave((clampedElapsed - coverOutStartMs) / outDurationMs);
            coverTranslateY = lerp(coverEnterTo, coverExitTo, outProgress);
            phase = "exit";
          }

          setCoverTransform(coverTranslateY);

          if (typeof runConfig.pagePush === "function") {
            runConfig.pagePush(
              getContext({
                elapsedMs: clampedElapsed,
                totalDurationMs,
                coverOutStartMs,
                phase,
              })
            );
          } else {
            const pushProgress = EASINGS.enter(
              clamp(clampedElapsed / (runConfig.pagePushDurationMs ?? options.pagePushDurationMs))
            );
            setPagePush(lerp(options.pagePushFrom, options.pagePushTo, pushProgress));
          }

          if (clampedElapsed <= morphInDurationMs) {
            const localProgress = clamp(clampedElapsed / morphInDurationMs);
            const yoyoProgress = localProgress <= 0.5 ? localProgress * 2 : (1 - localProgress) * 2;
            setCoverPath(buildTopBlobPath(EASINGS.enter(yoyoProgress)));
          } else if (clampedElapsed >= coverOutStartMs && clampedElapsed <= coverOutMorphEndMs) {
            const localProgress = clamp((clampedElapsed - coverOutStartMs) / morphOutDurationMs);
            const yoyoProgress = localProgress <= 0.5 ? localProgress * 2 : (1 - localProgress) * 2;
            setCoverPath(buildBottomBlobPath(EASINGS.leave(yoyoProgress)));
          } else {
            setCoverPath(buildTopBlobPath(0));
          }

          if (!midpointFired && clampedElapsed >= inDurationMs) {
            midpointFired = true;
            runConfig.onMidpoint?.(
              getContext({
                elapsedMs: clampedElapsed,
                totalDurationMs,
                coverOutStartMs,
                phase: "hold",
              })
            );
          }

          runConfig.onTick?.(
            getContext({
              elapsedMs: clampedElapsed,
              totalDurationMs,
              coverOutStartMs,
              phase,
            })
          );

          if (clampedElapsed < totalDurationMs) {
            rafId = window.requestAnimationFrame(tick);
            return;
          }

          if (runConfig.hideCoverOnComplete !== false) {
            setCoverTransform(coverExitTo);
            setCoverPath(buildTopBlobPath(0));
            setCoverVisible(false);
          }

          if (Number.isFinite(runConfig.finalPagePush)) {
            setPagePush(runConfig.finalPagePush);
          }

          runConfig.onComplete?.(
            getContext({
              elapsedMs: clampedElapsed,
              totalDurationMs,
              coverOutStartMs,
              phase: "exit",
            })
          );

          complete(true);
        };

        rafId = window.requestAnimationFrame(tick);
      });
    };

    return {
      playEnter,
      playExit,
      playEnterThenExit,
      cancel,
      isRunning: () => running,
    };
  };

  window.FigataTransitions = window.FigataTransitions || {};
  window.FigataTransitions.createFigataTransition = createFigataTransition;
})();
