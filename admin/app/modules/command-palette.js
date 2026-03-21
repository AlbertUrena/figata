// admin/app/modules/command-palette.js
// Extracted from admin/app/app.js — Phase 6 refactor
// Command palette: open/close, keyboard navigation, item activation, event binding.
// Receives DOM elements and callbacks via a context object.

(function () {
  "use strict";

  var ns = window.FigataAdmin = window.FigataAdmin || {};

  function getItems(ctx) {
    if (!ctx.elements.list) return [];
    return Array.prototype.slice.call(ctx.elements.list.querySelectorAll(".command-palette__item"));
  }

  function isOpen(ctx) {
    return Boolean(ctx.state.commandPalette && ctx.state.commandPalette.isOpen);
  }

  function setLiveMessage(ctx, message) {
    if (!ctx.elements.live) return;
    ctx.elements.live.textContent = message || "";
  }

  function getItemIndex(itemElement) {
    if (!itemElement) return -1;
    var value = Number.parseInt(itemElement.getAttribute("data-command-index"), 10);
    return Number.isFinite(value) ? value : -1;
  }

  function setSelectedIndex(ctx, nextIndex, options) {
    options = options || {};
    var items = getItems(ctx);
    if (!items.length) {
      ctx.state.commandPalette.selectedIndex = 0;
      if (ctx.elements.input) {
        ctx.elements.input.removeAttribute("aria-activedescendant");
      }
      if (ctx.elements.list) {
        ctx.elements.list.removeAttribute("aria-activedescendant");
      }
      return;
    }

    var maxIndex = items.length - 1;
    var normalizedIndex = Number(nextIndex);
    if (!Number.isFinite(normalizedIndex)) {
      normalizedIndex = 0;
    }
    if (normalizedIndex < 0) normalizedIndex = 0;
    if (normalizedIndex > maxIndex) normalizedIndex = maxIndex;
    ctx.state.commandPalette.selectedIndex = normalizedIndex;

    items.forEach(function (itemElement, itemIndex) {
      var isSelected = itemIndex === normalizedIndex;
      itemElement.setAttribute("data-selected", isSelected ? "true" : "false");
      itemElement.setAttribute("aria-selected", isSelected ? "true" : "false");
    });

    var selectedItem = items[normalizedIndex];
    var selectedId = selectedItem ? selectedItem.id || "" : "";
    if (ctx.elements.input) {
      if (selectedId) {
        ctx.elements.input.setAttribute("aria-activedescendant", selectedId);
      } else {
        ctx.elements.input.removeAttribute("aria-activedescendant");
      }
    }
    if (ctx.elements.list) {
      if (selectedId) {
        ctx.elements.list.setAttribute("aria-activedescendant", selectedId);
      } else {
        ctx.elements.list.removeAttribute("aria-activedescendant");
      }
    }

    if (selectedItem && options.scroll !== false) {
      selectedItem.scrollIntoView({ block: "nearest" });
    }
    if (selectedItem) {
      var label = selectedItem.getAttribute("data-command-label") || selectedItem.textContent || "";
      setLiveMessage(ctx, "Selected: " + String(label).trim());
    }
  }

  function open(ctx, options) {
    options = options || {};
    if (!ctx.elements.shell || !ctx.elements.dialog) return;

    if (isOpen(ctx)) {
      if (options.focusInput !== false && ctx.elements.input) {
        ctx.elements.input.focus({ preventScroll: true });
      }
      return;
    }

    ctx.closeSidebarUserMenu();
    ctx.state.commandPalette.isOpen = true;
    ctx.elements.shell.classList.remove("is-hidden");
    ctx.elements.shell.setAttribute("aria-hidden", "false");
    ctx.elements.shell.setAttribute("data-state", "closed");
    void ctx.elements.shell.offsetHeight;

    window.requestAnimationFrame(function () {
      if (!isOpen(ctx)) return;
      ctx.elements.shell.setAttribute("data-state", "open");
    });

    if (ctx.elements.input) {
      ctx.elements.input.value = "";
    }
    setSelectedIndex(ctx, 0, { scroll: false });

    if (options.focusInput !== false && ctx.elements.input) {
      window.setTimeout(function () {
        if (!isOpen(ctx)) return;
        ctx.elements.input.focus({ preventScroll: true });
      }, 40);
    }
  }

  function close(ctx, options) {
    options = options || {};
    if (!ctx.elements.shell || !ctx.elements.dialog) return;

    if (!isOpen(ctx) && ctx.elements.shell.classList.contains("is-hidden")) {
      return;
    }

    ctx.state.commandPalette.isOpen = false;
    ctx.elements.shell.setAttribute("data-state", "closed");
    ctx.elements.shell.setAttribute("aria-hidden", "true");
    setLiveMessage(ctx, "");

    var finalizeClose = function () {
      if (isOpen(ctx)) return;
      ctx.elements.shell.classList.add("is-hidden");
    };

    if (options.immediate) {
      finalizeClose();
    } else {
      ctx.waitForTransition(ctx.elements.dialog, { properties: ["opacity", "transform"] })
        .then(finalizeClose)
        .catch(finalizeClose);
    }

    if (options.returnFocusToSearch !== false && ctx.elements.searchButton && !ctx.state.sidebarCollapsed) {
      ctx.elements.searchButton.focus({ preventScroll: true });
    }
  }

  function toggle(ctx) {
    if (isOpen(ctx)) {
      close(ctx);
      return;
    }
    open(ctx);
  }

  function activateItem(ctx, itemElement) {
    if (!itemElement) return;
    var label = itemElement.getAttribute("data-command-label") || itemElement.textContent || "Command";
    ctx.setDataStatus("Command Palette demo: \"" + String(label).trim() + "\" (accion aun no conectada).");
    close(ctx, { returnFocusToSearch: false });
  }

  function handleKeydown(ctx, event) {
    if (!event || !isOpen(ctx)) return false;

    var items = getItems(ctx);
    if (!items.length) return false;
    var currentIndex = Number(ctx.state.commandPalette.selectedIndex || 0);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex(ctx, Math.min(currentIndex + 1, items.length - 1));
      return true;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex(ctx, Math.max(currentIndex - 1, 0));
      return true;
    }
    if (event.key === "Home") {
      event.preventDefault();
      setSelectedIndex(ctx, 0);
      return true;
    }
    if (event.key === "End") {
      event.preventDefault();
      setSelectedIndex(ctx, items.length - 1);
      return true;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      activateItem(ctx, items[currentIndex] || null);
      return true;
    }

    return false;
  }

  function bindEvents(ctx) {
    if (!ctx.elements.shell || !ctx.elements.dialog) return;

    if (ctx.elements.overlay) {
      ctx.elements.overlay.addEventListener("click", function () {
        close(ctx);
      });
    }

    ctx.elements.dialog.addEventListener("mousedown", function (event) {
      event.stopPropagation();
    });

    ctx.elements.dialog.addEventListener("click", function (event) {
      event.stopPropagation();
    });

    if (ctx.elements.list) {
      ctx.elements.list.addEventListener("mousemove", function (event) {
        var itemElement = event.target.closest(".command-palette__item");
        if (!itemElement) return;
        var itemIndex = getItemIndex(itemElement);
        if (itemIndex < 0 || itemIndex === ctx.state.commandPalette.selectedIndex) return;
        setSelectedIndex(ctx, itemIndex, { scroll: false });
      });

      ctx.elements.list.addEventListener("click", function (event) {
        var itemElement = event.target.closest(".command-palette__item");
        if (!itemElement) return;
        var itemIndex = getItemIndex(itemElement);
        if (itemIndex >= 0) {
          setSelectedIndex(ctx, itemIndex, { scroll: false });
        }
        activateItem(ctx, itemElement);
      });
    }
  }

  ns.commandPalette = {
    getItems: getItems,
    isOpen: isOpen,
    setLiveMessage: setLiveMessage,
    getItemIndex: getItemIndex,
    setSelectedIndex: setSelectedIndex,
    open: open,
    close: close,
    toggle: toggle,
    activateItem: activateItem,
    handleKeydown: handleKeydown,
    bindEvents: bindEvents
  };
})();
