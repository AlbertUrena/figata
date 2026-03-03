(() => {
  const PILL_MS = 390;
  const EASE = createBezierEasing(0.45, 0, 0.55, 1);

  const root = document.querySelector("#eventos-tabs .events-tabs[role='tablist']");
  if (!root) return;

  const rail = root.querySelector(".events-tabs-rail");
  const pill = root.querySelector(".events-tabs-pill");
  const tabs = Array.from(root.querySelectorAll(".events-tab[role='tab']"));

  if (!rail || !pill || tabs.length !== 3) return;

  let activeIndex = tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
  if (activeIndex < 0) activeIndex = 0;
  let currentX = getTargetX(activeIndex);
  let animationFrameId = 0;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activateTab(resolveIndex(tab), { animate: true });
    });

    tab.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        const nextIndex = (activeIndex + 1) % tabs.length;
        activateTab(nextIndex, { animate: true, focus: true });
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        const nextIndex = (activeIndex - 1 + tabs.length) % tabs.length;
        activateTab(nextIndex, { animate: true, focus: true });
        return;
      }

      if (event.key === "Home") {
        event.preventDefault();
        activateTab(0, { animate: true, focus: true });
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        activateTab(tabs.length - 1, { animate: true, focus: true });
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activateTab(resolveIndex(tab), { animate: true });
      }
    });
  });

  window.addEventListener("resize", () => {
    setPillPosition(activeIndex, true);
  });

  activateTab(activeIndex, { animate: false });

  function activateTab(index, options = {}) {
    const { animate = true, focus = false } = options;
    const nextIndex = clampIndex(index);

    tabs.forEach((tab, tabIndex) => {
      const isActive = tabIndex === nextIndex;
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
      tab.setAttribute("tabindex", isActive ? "0" : "-1");
      tab.classList.toggle("is-active", isActive);
    });

    if (animate) {
      animatePillToIndex(nextIndex);
    } else {
      setPillPosition(nextIndex, true);
    }

    activeIndex = nextIndex;

    if (focus) {
      tabs[nextIndex].focus();
    }
  }

  function animatePillToIndex(index) {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = 0;
    }

    const fromX = currentX;
    const targetX = getTargetX(index);
    const deltaX = targetX - fromX;
    let startTime = 0;

    if (deltaX === 0) {
      currentX = targetX;
      pill.style.transform = `translateX(${targetX}px)`;
      return;
    }

    const tick = (timestamp) => {
      if (startTime === 0) {
        startTime = timestamp;
      }

      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / PILL_MS, 1);
      const eased = EASE(progress);
      const nextX = fromX + deltaX * eased;

      currentX = nextX;
      pill.style.transform = `translateX(${nextX}px)`;

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(tick);
        return;
      }

      currentX = targetX;
      pill.style.transform = `translateX(${targetX}px)`;
      animationFrameId = 0;
    };

    animationFrameId = requestAnimationFrame(tick);
  }

  function setPillPosition(index, cancelAnimation = false) {
    if (cancelAnimation && animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = 0;
    }
    const targetX = getTargetX(index);
    currentX = targetX;
    pill.style.transform = `translateX(${targetX}px)`;
  }

  function getTargetX(index) {
    const width = rail.getBoundingClientRect().width;
    const tabWidth = width / 3;
    return tabWidth * index;
  }

  function resolveIndex(tab) {
    const raw = Number(tab.getAttribute("data-tab"));
    if (Number.isFinite(raw)) return clampIndex(raw);
    return clampIndex(tabs.indexOf(tab));
  }

  function clampIndex(index) {
    if (index < 0) return 0;
    if (index > tabs.length - 1) return tabs.length - 1;
    return index;
  }

  function createBezierEasing(mX1, mY1, mX2, mY2) {
    if (mX1 === mY1 && mX2 === mY2) {
      return (x) => x;
    }

    const NEWTON_ITERATIONS = 4;
    const NEWTON_MIN_SLOPE = 0.001;
    const SUBDIVISION_PRECISION = 0.0000001;
    const SUBDIVISION_MAX_ITERATIONS = 10;
    const SPLINE_SIZE = 11;
    const SAMPLE_STEP = 1 / (SPLINE_SIZE - 1);
    const samples = new Float32Array(SPLINE_SIZE);

    for (let i = 0; i < SPLINE_SIZE; i += 1) {
      samples[i] = calcBezier(i * SAMPLE_STEP, mX1, mX2);
    }

    function A(a1, a2) {
      return 1 - 3 * a2 + 3 * a1;
    }

    function B(a1, a2) {
      return 3 * a2 - 6 * a1;
    }

    function C(a1) {
      return 3 * a1;
    }

    function calcBezier(t, a1, a2) {
      return ((A(a1, a2) * t + B(a1, a2)) * t + C(a1)) * t;
    }

    function getSlope(t, a1, a2) {
      return 3 * A(a1, a2) * t * t + 2 * B(a1, a2) * t + C(a1);
    }

    function binarySubdivide(x, a, b) {
      let currentX;
      let currentT;
      let i = 0;

      do {
        currentT = a + (b - a) / 2;
        currentX = calcBezier(currentT, mX1, mX2) - x;
        if (currentX > 0) {
          b = currentT;
        } else {
          a = currentT;
        }
        i += 1;
      } while (Math.abs(currentX) > SUBDIVISION_PRECISION && i < SUBDIVISION_MAX_ITERATIONS);

      return currentT;
    }

    function newtonRaphsonIterate(x, guessT) {
      let t = guessT;
      for (let i = 0; i < NEWTON_ITERATIONS; i += 1) {
        const slope = getSlope(t, mX1, mX2);
        if (slope === 0) return t;
        const currentX = calcBezier(t, mX1, mX2) - x;
        t -= currentX / slope;
      }
      return t;
    }

    function getTForX(x) {
      let intervalStart = 0;
      let currentSample = 1;
      const lastSample = SPLINE_SIZE - 1;

      while (currentSample !== lastSample && samples[currentSample] <= x) {
        intervalStart += SAMPLE_STEP;
        currentSample += 1;
      }

      currentSample -= 1;

      const dist = (x - samples[currentSample]) / (samples[currentSample + 1] - samples[currentSample]);
      const guessT = intervalStart + dist * SAMPLE_STEP;
      const slope = getSlope(guessT, mX1, mX2);

      if (slope >= NEWTON_MIN_SLOPE) {
        return newtonRaphsonIterate(x, guessT);
      }

      if (slope === 0) {
        return guessT;
      }

      return binarySubdivide(x, intervalStart, intervalStart + SAMPLE_STEP);
    }

    return (x) => {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      return calcBezier(getTForX(x), mY1, mY2);
    };
  }
})();
