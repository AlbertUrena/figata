(() => {
  const TAB_DATA = [
    { videoSrc: "/videos/tab0.mp4" },
    { videoSrc: "/videos/tab1.mp4" },
    { videoSrc: "/videos/tab2.mp4" }
  ];

  const PROGRESS_MS = 4000;
  const STACKED_QUERY = window.matchMedia("(max-width: 900px)");

  const root = document.querySelector("#feature-tabs.feature-tabs-section");
  if (!root) return;

  const tabsWrap = root.querySelector(".feature-tabs[role='tablist']");
  const pill = root.querySelector(".feature-tabs-pill");
  const tabs = Array.from(root.querySelectorAll(".feature-tab[role='tab']"));
  const bars = tabs.map((tab) => tab.querySelector(".feature-tab-progress"));
  const panel = root.querySelector(".feature-card[role='tabpanel']");
  const video = root.querySelector(".feature-card-video");

  if (!tabsWrap || !pill || !tabs.length) return;

  let activeIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.classList.contains("is-active"))
  );

  function updatePillPosition(index, animate = true) {
    if (!pill) return;

    if (!animate) pill.style.transition = "none";

    if (STACKED_QUERY.matches) {
      let y = 0;
      for (let i = 0; i < index; i += 1) y += tabs[i].offsetHeight;
      pill.style.width = "100%";
      pill.style.height = `${tabs[index].offsetHeight}px`;
      pill.style.transform = `translateY(${y}px)`;
    } else {
      pill.style.width = "calc((100% - 0px) / 3)";
      pill.style.height = "100%";
      pill.style.transform = `translateX(${index * 100}%)`;
    }

    if (!animate) {
      requestAnimationFrame(() => {
        pill.style.transition = "transform 220ms ease, height 220ms ease";
      });
    }
  }

  function startProgress(index) {
    bars.forEach((bar, i) => {
      if (!bar) return;

      bar.style.transition = "none";
      bar.style.transform = "scaleX(0)";

      if (i !== index) return;

      void bar.offsetWidth;
      bar.style.transition = `transform ${PROGRESS_MS}ms linear`;
      requestAnimationFrame(() => {
        bar.style.transform = "scaleX(1)";
      });
    });
  }

  function updateMedia(index) {
    if (!video) return;
    const nextSrc = TAB_DATA[index] ? TAB_DATA[index].videoSrc : "";
    if (!nextSrc || video.getAttribute("src") === nextSrc) return;

    video.setAttribute("src", nextSrc);
    video.load();

    const p = video.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }

  function setActive(index, options = { animatePill: true }) {
    if (index < 0 || index >= tabs.length) return;

    const changed = index !== activeIndex;
    activeIndex = index;

    if (changed) {
      tabs.forEach((tab, i) => {
        const isActive = i === index;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", isActive ? "true" : "false");
        tab.tabIndex = isActive ? 0 : -1;
      });
    }

    updatePillPosition(index, options.animatePill && changed);
    startProgress(index);
    updateMedia(index);

    if (panel) panel.setAttribute("data-active-tab", String(index));
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("pointerdown", () => {
      setActive(index, { animatePill: true });
    });

    tab.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        const next = (activeIndex + 1) % tabs.length;
        setActive(next, { animatePill: true });
        tabs[next].focus();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        const next = (activeIndex - 1 + tabs.length) % tabs.length;
        setActive(next, { animatePill: true });
        tabs[next].focus();
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setActive(index, { animatePill: true });
      }
    });
  });

  const onLayoutChange = () => updatePillPosition(activeIndex, false);
  if (typeof STACKED_QUERY.addEventListener === "function") {
    STACKED_QUERY.addEventListener("change", onLayoutChange);
  } else if (typeof STACKED_QUERY.addListener === "function") {
    STACKED_QUERY.addListener(onLayoutChange);
  }

  tabs.forEach((tab, i) => {
    tab.setAttribute("aria-selected", i === activeIndex ? "true" : "false");
    tab.tabIndex = i === activeIndex ? 0 : -1;
    tab.classList.toggle("is-active", i === activeIndex);
  });

  updatePillPosition(activeIndex, false);
  startProgress(activeIndex);
  updateMedia(activeIndex);
})();
