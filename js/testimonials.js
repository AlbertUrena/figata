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

  const testimonials = [
    {
      column: 0,
      quote:
        "We ordered for delivery, it was 10 out of 10 it’s the best pizza I have tried in Santo Domingo! Great ingredients, real Neapolitan pizza from wood oven! Also I was surprised to see the message in the pizza box, little details that makes the difference.",
      name: "Awilda Suero",
      avatarSrc: "/assets/reviews/awilda.png",
      rating: 5,
    },
    {
      column: 0,
      quote:
        "Sus pizzas son excelentes, hechas con ingredientes de alta calidad, estilo napolitano auténtico, tienen una amplia selección de cervezas a elegir y probar. El local tiene un muy buen ambiente.",
      name: "Fabio Reyes",
      avatarSrc: "/assets/reviews/fabio.png",
      rating: 5,
    },
    {
      column: 0,
      quote:
        "La pizza es artesanal para los amantes de este tipo, es un lugar pequeño pero bien distribuido, si te gusta probar cervezas diferentes es el lugar de elección. Parqueo limitado",
      name: "Karla Villar",
      avatarSrc: "/assets/reviews/karla.png",
      rating: 4,
    },
    {
      column: 1,
      quote:
        "Tienen una variedad deliciosa e interesante de pizza y unas berengenas riquísimas. El café es muy rico y tienen variedad de cócteles.",
      name: "Liecel Franco",
      avatarSrc: "/assets/reviews/liecel.png",
      rating: 5,
    },
    {
      column: 1,
      quote:
        "Es la mejor pizza napolitana que he probado, textura y grosor perfecto, no era ni muy finita ni muy gordita la masa, era perfecta. Llena bastante. Tienen una gran variedad de cervezas y vinos. Probamos la sweet goat y la de burrata con pesto y prosciutto, excelentes las dos. Volvería una y mil veces. 😻🥰",
      name: "Prysla Rodríguez",
      avatarSrc: "/assets/reviews/prysla.png",
      rating: 5,
    },
    {
      column: 1,
      quote:
        "Al abrir la puerta el rico olor a pizza te invita a continuar y tomar asiento, el servicio es excepcional y las pizzas espectaculares.",
      name: "Angel Tejeda Piña",
      avatarSrc: "/assets/reviews/angel.png",
      rating: 5,
    },
    {
      column: 2,
      quote:
        "Mi resturante favorito en Santo Domingo Este, las pizzas son buenisimas, excelente servicio y ambiente. El take out tambien funciona de maravilla. 10/10 en todo! Recomendadisimo.",
      name: "Massiel Beltre",
      avatarSrc: "/assets/reviews/massiel.png",
      rating: 5,
    },
    {
      column: 2,
      quote:
        "10/10 Un cóctel riquísimo, pizzas que wow, llenas de sabor con una auténtica masa que te transporta y el tiramisu DIOS MIO QUE BUENO!! He probado 3 pizzas y todas me han encantado. Los recomiendo 100%",
      name: "Vianneris Morillo",
      avatarSrc: "/assets/reviews/vianneris.png",
      rating: 5,
    },
    {
      column: 2,
      quote:
        "Their pizzas are awesome and very good value. They also have a great beer selection to accompany your pizzas. Staff is very attentive and has a great disposition, service was very good across all the times I’ve visited. Try their Sweet Goat and Figata pizzas.\n\nThey have espanded seating lately, but parking can still be an issue sometimes as the spot the restaurant is in has few slots available.",
      name: "Ricardo Restituyo",
      avatarSrc: "/assets/reviews/ricardo.png",
      rating: 5,
    },
  ];

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
      ? Math.max(0, Math.min(5, Math.round(rating)))
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

    text.textContent = item.quote;
    name.textContent = item.name;
    role.textContent = "Local Guide";
    createStars(stars, item.rating);

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

  render();
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
