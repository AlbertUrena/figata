(() => {
  const grid = document.getElementById("testimonials-grid");
  const template = document.getElementById("testimonial-card-template");

  if (!grid || !(template instanceof HTMLTemplateElement)) {
    return;
  }

  const columns = Array.from(grid.querySelectorAll(".column"));

  if (!columns.length) {
    return;
  }

  const TESTIMONIALS_LIMIT = 9;
  const FALLBACK_TESTIMONIALS = [
    {
      text:
        "We ordered for delivery, it was 10 out of 10. Great ingredients and real Neapolitan pizza from wood oven.",
      name: "Awilda Suero",
      role: "Local Guide",
      avatarSrc: "assets/reviews/awilda.png",
      stars: 5,
    },
    {
      text:
        "Sus pizzas son excelentes, hechas con ingredientes de alta calidad y con muy buen ambiente en el local.",
      name: "Fabio Reyes",
      role: "Cliente frecuente",
      avatarSrc: "assets/reviews/fabio.png",
      stars: 5,
    },
    {
      text:
        "La pizza artesanal es excelente. Si te gusta probar cervezas diferentes, este lugar vale la pena.",
      name: "Karla Villar",
      role: "Food lover",
      avatarSrc: "assets/reviews/karla.png",
      stars: 4,
    },
    {
      text:
        "Tienen una variedad deliciosa de pizza, muy buen cafe y cocteles. Siempre regresamos.",
      name: "Liecel Franco",
      role: "Cliente",
      avatarSrc: "assets/reviews/liecel.png",
      stars: 5,
    },
    {
      text:
        "La mejor pizza napolitana que he probado. Textura, sabor y servicio, todo excelente.",
      name: "Prysla Rodriguez",
      role: "Local Guide",
      avatarSrc: "assets/reviews/prysla.png",
      stars: 5,
    },
    {
      text:
        "Desde que abres la puerta el olor a pizza te gana. Servicio excelente y pizzas espectaculares.",
      name: "Angel Tejeda Pina",
      role: "Cliente",
      avatarSrc: "assets/reviews/angel.png",
      stars: 5,
    },
    {
      text:
        "Mi restaurante favorito en Santo Domingo Este. Buenisimas pizzas, excelente servicio y ambiente.",
      name: "Massiel Beltre",
      role: "Cliente frecuente",
      avatarSrc: "assets/reviews/massiel.png",
      stars: 5,
    },
    {
      text:
        "Cocteles riquisimos, pizzas llenas de sabor y un tiramisu increible. Muy recomendado.",
      name: "Vianneris Morillo",
      role: "Foodie",
      avatarSrc: "assets/reviews/vianneris.png",
      stars: 5,
    },
    {
      text:
        "Great pizzas, very good value and attentive staff. Sweet Goat and Figata are must-tries.",
      name: "Ricardo Restituyo",
      role: "Local Guide",
      avatarSrc: "assets/reviews/ricardo.png",
      stars: 5,
    },
  ];
  const normalizeText = (value) =>
    typeof value === "string" ? value.trim() : "";
  const normalizeStars = (value, fallback = 5) => {
    const numeric = Number(value);
    const safeValue = Number.isFinite(numeric)
      ? Math.round(numeric)
      : fallback;
    return Math.max(1, Math.min(5, safeValue));
  };
  const normalizeTestimonials = (items) => {
    const sourceItems = Array.isArray(items) && items.length
      ? items
      : FALLBACK_TESTIMONIALS;
    return sourceItems
      .slice(0, TESTIMONIALS_LIMIT)
      .map((item, index) => {
        const safeItem = item && typeof item === "object" ? item : {};
        const fallbackItem = FALLBACK_TESTIMONIALS[index] ||
          FALLBACK_TESTIMONIALS[FALLBACK_TESTIMONIALS.length - 1] ||
          {};
        return {
          column: index % 3,
          text: normalizeText(safeItem.text || safeItem.quote || fallbackItem.text),
          name: normalizeText(safeItem.name || fallbackItem.name || `Cliente ${index + 1}`),
          role: normalizeText(safeItem.role || fallbackItem.role || "Cliente"),
          avatarSrc: normalizeText(safeItem.avatarSrc || fallbackItem.avatarSrc || ""),
          stars: normalizeStars(safeItem.stars, normalizeStars(fallbackItem.stars, 5)),
        };
      });
  };
  const loadTestimonialsFromHome = async () => {
    const homeApi = window.FigataData?.home;
    if (!homeApi?.getHomeConfig) {
      return normalizeTestimonials(FALLBACK_TESTIMONIALS);
    }

    try {
      const home = await homeApi.getHomeConfig();
      return normalizeTestimonials(home?.testimonials?.items);
    } catch (error) {
      console.warn("[testimonials] No se pudo cargar testimonials desde home config.", error);
      return normalizeTestimonials(FALLBACK_TESTIMONIALS);
    }
  };
  let testimonials = normalizeTestimonials(FALLBACK_TESTIMONIALS);

  const getColumnCount = () => {
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;

    if (viewportWidth <= 760) {
      return 1;
    }

    if (viewportWidth <= 1200) {
      return 2;
    }

    return 3;
  };

  const createStars = (container, rating) => {
    if (!container) {
      return;
    }

    const safeRating = Number.isFinite(rating)
      ? Math.max(1, Math.min(5, Math.round(rating)))
      : 5;

    container.setAttribute("aria-label", `${safeRating} out of 5 stars`);

    const stars = document.createDocumentFragment();

    for (let index = 0; index < 5; index += 1) {
      const star = document.createElement("img");
      star.className = index < safeRating ? "star" : "star star--muted";
      star.src = "assets/svg-icons/star.svg";
      star.alt = "";
      star.width = 16;
      star.height = 16;
      star.loading = "lazy";
      star.setAttribute("aria-hidden", "true");
      stars.appendChild(star);
    }

    container.replaceChildren(stars);
  };

  const createCard = (item) => {
    const node = template.content.cloneNode(true);
    const card = node.querySelector(".card");
    const text = node.querySelector(".card-text");
    const avatar = node.querySelector(".avatar");
    const name = node.querySelector(".user-name");
    const role = node.querySelector(".user-role");
    const stars = node.querySelector(".stars");

    if (!card || !text || !avatar || !name || !role || !stars) {
      return null;
    }

    text.textContent = item.text;
    name.textContent = item.name;
    role.textContent = item.role;
    createStars(stars, item.stars);

    if (item.avatarSrc) {
      const image = document.createElement("img");
      image.src = item.avatarSrc;
      image.alt = `${item.name} avatar`;
      image.loading = "lazy";
      image.addEventListener("error", () => {
        image.remove();
      });
      avatar.appendChild(image);
    }

    return node;
  };

  const render = () => {
    const columnCount = Math.min(getColumnCount(), columns.length);
    const fragments = columns.map(() => document.createDocumentFragment());

    columns.forEach((column, index) => {
      column.hidden = index >= columnCount;
      column.replaceChildren();
    });

    grid.style.setProperty("--testimonials-columns", String(columnCount));

    if (columnCount === 3) {
      testimonials.forEach((item) => {
        const targetColumn = Number.isInteger(item.column)
          ? Math.max(0, Math.min(2, item.column))
          : 0;
        const card = createCard(item);

        if (!card) {
          return;
        }

        fragments[targetColumn].appendChild(card);
      });
    } else {
      let targetColumn = 0;

      testimonials.forEach((item) => {
        const card = createCard(item);

        if (!card) {
          return;
        }

        fragments[targetColumn].appendChild(card);
        targetColumn = (targetColumn + 1) % columnCount;
      });
    }

    for (let index = 0; index < columnCount; index += 1) {
      columns[index].replaceChildren(fragments[index]);
    }
  };

  let resizeFrame = 0;

  window.addEventListener(
    "resize",
    () => {
      if (resizeFrame) {
        cancelAnimationFrame(resizeFrame);
      }

      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = 0;
        render();
      });
    },
    { passive: true }
  );

  const init = async () => {
    testimonials = await loadTestimonialsFromHome();
    render();
  };

  void init();
})();

(() => {
  const section = document.querySelector("section#testimonials.testimonials-section");
  const container = section?.querySelector(".all-access-pass__container");
  const root = section?.querySelector("#aap-testimonials");
  const intro = root?.querySelector(".all-access-pass__intro-element");
  const element = root?.querySelector(".all-access-pass__element");
  const background = root?.querySelector(".all-access-pass__background");
  const copy = root?.querySelector(".icon-copy");
  const icon = root?.querySelector(".aap-text-icon-control__icon");

  if (!section || !container || !root || !intro || !element || !background || !copy || !icon) {
    return;
  }

  const reduceMotionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  const replayOnReenter = container.dataset.replayOnReenter !== "false";
  let hasActivatedThisPass = false;
  let isAnimating = false;
  let animationFrame = 0;
  let lastTimestamp = 0;
  let stableFrameCount = 0;
  let ticking = false;

  const isReducedMotion = () => Boolean(reduceMotionQuery?.matches);
  const maxSectionInset = 48;
  const targetExpandedWidth = 284;
  const state = {};
  const epsilonValue = 0.02;
  const epsilonVelocity = 0.05;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const getTargetWidth = () => Math.min(targetExpandedWidth, Math.max(220, window.innerWidth - maxSectionInset));

  const springConfig = {
    rootY: { stiffness: 122, damping: 8.95, delay: 0.0, start: 180, target: 0 },
    introScale: { stiffness: 130, damping: 16, delay: 0.0, start: 1.3, target: 0.8 },
    introX: { stiffness: 120, damping: 14, delay: 0.0, start: -15, target: -28 },
    introW: { stiffness: 120, damping: 14, delay: 0.0, start: 30, target: 56 },
    introH: { stiffness: 120, damping: 14, delay: 0.0, start: 80, target: 56 },
    alpha: { stiffness: 100, damping: 20, delay: 0.47, start: 0, target: 1 },
    bgScale: { stiffness: 100, damping: 20, delay: 0.47, start: 1.3, target: 1 },
    bgW: { stiffness: 100, damping: 18, delay: 0.47, start: 40, target: targetExpandedWidth },
    bgH: { stiffness: 100, damping: 18, delay: 0.47, start: 40, target: 56 },
    blur: { stiffness: 90, damping: 16, delay: 0.47, start: 14, target: 7 },
    iconX: { stiffness: 100, damping: 16, delay: 0.46, start: -110, target: 0 },
    iconScale: { stiffness: 110, damping: 18, delay: 0.46, start: 0, target: 1 },
    iconOpacity: { stiffness: 110, damping: 18, delay: 0.46, start: 0, target: 1 },
    copyScale: { stiffness: 110, damping: 18, delay: 0.58, start: 0.5, target: 1 },
  };

  const initSpringState = () => {
    const targetWidth = getTargetWidth();
    Object.keys(springConfig).forEach((key) => {
      state[key] = {
        value: springConfig[key].start,
        velocity: 0,
        target: key === "bgW" ? targetWidth : springConfig[key].target,
      };
    });
  };

  const applyFrame = () => {
    const alpha = clamp(state.alpha.value, 0, 1);
    const colorAlpha = 1 - 0.28 * alpha;

    root.style.transform = `translate3d(0px, ${state.rootY.value.toFixed(4)}px, 0px) scale(1) scaleX(1) scaleY(1)`;

    intro.style.transform = `translate3d(${state.introX.value.toFixed(4)}px, 0px, 0px) scale(${state.introScale.value.toFixed(6)}) scaleX(1) scaleY(1)`;
    intro.style.width = `${state.introW.value.toFixed(4)}px`;
    intro.style.height = `${state.introH.value.toFixed(4)}px`;
    intro.style.opacity = "0";

    element.style.transform = "translate3d(0px, 0px, 0px) scale(1) scaleX(1) scaleY(1)";
    element.style.setProperty("--alpha", alpha.toFixed(6));
    element.style.opacity = alpha.toFixed(6);

    background.style.width = `${state.bgW.value.toFixed(4)}px`;
    background.style.height = `${state.bgH.value.toFixed(4)}px`;
    background.style.setProperty("--scale", state.bgScale.value.toFixed(6));
    background.style.backgroundColor = `rgba(42, 42, 45, ${colorAlpha.toFixed(6)})`;
    background.style.backdropFilter = `blur(${state.blur.value.toFixed(4)}px)`;
    background.style.webkitBackdropFilter = `blur(${state.blur.value.toFixed(4)}px)`;

    copy.style.transform = `translate3d(0px, 0px, 0px) scale(${state.copyScale.value.toFixed(6)}) scaleX(1) scaleY(1)`;

    icon.style.transform = `translate3d(${state.iconX.value.toFixed(4)}px, -18px, 0px) scale(${state.iconScale.value.toFixed(6)}) scaleX(1) scaleY(1)`;
    icon.style.opacity = clamp(state.iconOpacity.value, 0, 1).toFixed(6);
    icon.style.width = "36px";
  };

  const setInitialState = () => {
    initSpringState();
    root.classList.remove("activated", "is-activated");
    root.classList.add("inactive");
    applyFrame();
  };

  const setFinalState = () => {
    initSpringState();
    state.rootY.value = 0;
    state.introScale.value = 0.8;
    state.introX.value = -28;
    state.introW.value = 56;
    state.introH.value = 56;
    state.alpha.value = 1;
    state.bgScale.value = 1;
    state.bgW.value = getTargetWidth();
    state.bgH.value = 56;
    state.blur.value = 7;
    state.iconX.value = 0;
    state.iconScale.value = 1;
    state.iconOpacity.value = 1;
    state.copyScale.value = 1;
    root.classList.remove("inactive");
    root.classList.add("activated", "is-activated");
    applyFrame();
  };

  const shouldTrigger = () => {
    const rect = section.getBoundingClientRect();
    return rect.top <= window.innerHeight * 0.5 && rect.bottom > 0;
  };

  const stepSpring = (spring, config, dt, elapsed) => {
    if (elapsed < config.delay) {
      return;
    }

    const delta = spring.value - spring.target;
    const acceleration = -config.stiffness * delta - config.damping * spring.velocity;
    spring.velocity += acceleration * dt;
    spring.value += spring.velocity * dt;
  };

  const animate = (timestamp) => {
    if (!isAnimating) {
      return;
    }

    if (!lastTimestamp) {
      lastTimestamp = timestamp;
    }

    const dt = Math.min(0.05, (timestamp - lastTimestamp) / 1000);
    const elapsed = (timestamp - state.startTime) / 1000;
    lastTimestamp = timestamp;

    let allStable = true;

    Object.keys(springConfig).forEach((key) => {
      const spring = state[key];
      const config = springConfig[key];
      stepSpring(spring, config, dt, elapsed);

      const stableValue = Math.abs(spring.target - spring.value) < epsilonValue;
      const stableVelocity = Math.abs(spring.velocity) < epsilonVelocity;
      allStable = allStable && stableValue && stableVelocity;
    });

    applyFrame();

    if (allStable) {
      stableFrameCount += 1;
    } else {
      stableFrameCount = 0;
    }

    if (stableFrameCount >= 20) {
      isAnimating = false;
      animationFrame = 0;
      stableFrameCount = 0;
      setFinalState();
      return;
    }

    animationFrame = requestAnimationFrame(animate);
  };

  const startAnimation = () => {
    if (hasActivatedThisPass || isAnimating) {
      return;
    }

    if (isReducedMotion()) {
      hasActivatedThisPass = true;
      setFinalState();
      return;
    }

    hasActivatedThisPass = true;
    initSpringState();
    state.bgW.target = getTargetWidth();
    state.startTime = performance.now();
    lastTimestamp = 0;
    stableFrameCount = 0;
    root.classList.remove("inactive");
    root.classList.add("activated", "is-activated");
    applyFrame();
    isAnimating = true;
    animationFrame = requestAnimationFrame(animate);
  };

  const resetAnimation = () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
    isAnimating = false;
    stableFrameCount = 0;
    hasActivatedThisPass = false;
    setInitialState();
  };

  const evaluateState = () => {
    ticking = false;
    const trigger = shouldTrigger();
    const rect = section.getBoundingClientRect();
    const inSectionViewport = rect.top < window.innerHeight && rect.bottom > 0;

    if (trigger) {
      startAnimation();
      return;
    }

    if (replayOnReenter && !inSectionViewport) {
      resetAnimation();
    }
  };

  const scheduleEvaluate = () => {
    if (ticking) {
      return;
    }
    ticking = true;
    requestAnimationFrame(evaluateState);
  };

  setInitialState();
  scheduleEvaluate();

  window.addEventListener("scroll", scheduleEvaluate, { passive: true });
  window.addEventListener("resize", () => {
    if (!hasActivatedThisPass) {
      setInitialState();
      return;
    }

    if (!isAnimating) {
      setFinalState();
      return;
    }

    state.bgW.target = getTargetWidth();
  });
})();
