(() => {
  const root = document.documentElement;

  if (!root.classList.contains("page-reload-transition")) {
    return;
  }

  const cover = document.querySelector(".reload-transition-cover");
  const bgPath = cover?.querySelector(".reload-transition-cover__bg");
  const pagePushTarget = document.querySelector("main");

  if (!cover || !bgPath) {
    root.classList.remove("page-reload-transition");
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const COVER_OUT_DURATION_MS = 1000;
  const COVER_OUT_MORPH_DURATION_MS = 800;
  const COVER_EXIT_Y_PERCENT = -100.2;
  const PAGE_PUSH_IN_START_PX = 200;
  const ENTER_PATH_START_Y = 82.1;
  const ENTER_PATH_CP1_X = 353;
  const ENTER_PATH_CP1_Y = -21.8;
  const ENTER_PATH_CP2_X = 1015;
  const ENTER_PATH_CP2_Y = -32.7;
  const LEAVE_PATH_CP1_X = 1040.2;
  const LEAVE_PATH_CP1_Y = 660.1;
  const LEAVE_PATH_CP2_X = 348.6;
  const LEAVE_PATH_CP2_Y = 657.8;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const lerp = (from, to, progress) => from + (to - from) * progress;
  const formatNumber = (value) => Number(value.toFixed(4));

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

    return (x) => {
      if (x <= 0) {
        return 0;
      }

      if (x >= 1) {
        return 1;
      }

      return sampleCurveY(solveCurveX(x));
    };
  };

  const easeCoverLeave = createCubicBezier(0.65, 0, 0.25, 1);

  const buildTopBlobPath = (amount) => {
    const progress = clamp(amount);
    const startY = formatNumber(lerp(0, ENTER_PATH_START_Y, progress));
    const cp1X = formatNumber(lerp(0, ENTER_PATH_CP1_X, progress));
    const cp1Y = formatNumber(lerp(0, ENTER_PATH_CP1_Y, progress));
    const cp2X = formatNumber(lerp(1366, ENTER_PATH_CP2_X, progress));
    const cp2Y = formatNumber(lerp(0, ENTER_PATH_CP2_Y, progress));

    return `M0 ${startY}L0 ${startY}C${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, 1366 ${startY}L1366 ${startY}V768H0V${startY}z`;
  };

  const buildBottomBlobPath = (amount) => {
    const progress = clamp(amount);
    const cp1X = formatNumber(lerp(1366, LEAVE_PATH_CP1_X, progress));
    const cp1Y = formatNumber(lerp(768, LEAVE_PATH_CP1_Y, progress));
    const cp2X = formatNumber(lerp(0, LEAVE_PATH_CP2_X, progress));
    const cp2Y = formatNumber(lerp(768, LEAVE_PATH_CP2_Y, progress));

    return `M0 0H1366V768C${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, 0 768V0z`;
  };

  const setCoverTransform = (offsetYPercent) => {
    cover.style.transform = `translate3d(0, ${formatNumber(offsetYPercent)}%, 0)`;
  };

  const setCoverPath = (pathValue) => {
    bgPath.setAttribute("d", pathValue);
  };

  const setPagePush = (offsetYPx) => {
    if (!pagePushTarget) {
      return;
    }

    pagePushTarget.style.transform = `translate3d(0, ${formatNumber(offsetYPx)}px, 0)`;
  };

  const finish = () => {
    setCoverTransform(COVER_EXIT_Y_PERCENT);
    setCoverPath(buildTopBlobPath(0));
    setPagePush(0);
    cover.style.visibility = "hidden";
    cover.style.opacity = "0";
    cover.setAttribute("aria-hidden", "true");
    root.classList.remove("page-reload-transition");
  };

  if (prefersReducedMotion.matches) {
    setPagePush(0);
    finish();
    return;
  }

  cover.style.visibility = "visible";
  cover.style.opacity = "1";
  cover.setAttribute("aria-hidden", "false");
  setCoverTransform(0);
  setCoverPath(buildTopBlobPath(0));
  setPagePush(PAGE_PUSH_IN_START_PX);

  const startTransition = () => {
    const transitionStart = window.performance.now();

    const tick = (now) => {
      const elapsed = now - transitionStart;
      const outProgress = clamp(elapsed / COVER_OUT_DURATION_MS);
      const easedOut = easeCoverLeave(outProgress);

      setCoverTransform(lerp(0, COVER_EXIT_Y_PERCENT, easedOut));
      setPagePush(lerp(PAGE_PUSH_IN_START_PX, 0, easedOut));

      if (elapsed <= COVER_OUT_MORPH_DURATION_MS) {
        const localProgress = clamp(elapsed / COVER_OUT_MORPH_DURATION_MS);
        const yoyoProgress = localProgress <= 0.5 ? localProgress * 2 : (1 - localProgress) * 2;
        setCoverPath(buildBottomBlobPath(easeCoverLeave(yoyoProgress)));
      } else {
        setCoverPath(buildTopBlobPath(0));
      }

      if (outProgress < 1) {
        window.requestAnimationFrame(tick);
        return;
      }

      finish();
    };

    window.requestAnimationFrame(tick);
  };

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(startTransition);
  });
})();
