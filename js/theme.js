/**
 * @param {MediaQueryList} mqList
 * @param {((this: MediaQueryList, ev: MediaQueryListEvent) => any)} listener
 */
function observeMediaChange(mqList, listener) {
  let disposeFunc = () => {};
  if (mqList.addEventListener && mqList.removeEventListener) {
    mqList.addEventListener("change", listener);

    disposeFunc = () => {
      mqList.removeEventListener("change", listener);
    };
  } else if (mqList.addListener && mqList.removeListener) {
    mqList.addListener(listener);

    disposeFunc = () => {
      mqList.removeListener(listener);
    };
  }

  return disposeFunc;
}

function checkIsDarkMode() {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch (err) {
    return false;
  }
}

function switchThemeMode(mode) {
  /** @type {HTMLLinkElement} */
  const link = document.querySelector("link#theme");
  if (!link) {
    return;
  }

  const nextMode = themeMode[mode] || themeMode.light;
  if (link.href !== nextMode) {
    link.href = nextMode;
  }
}

const themeMode = {
  light:
    "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-light.css",
  dark: "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.css",
};

if (checkIsDarkMode()) {
  switchThemeMode("dark");
}

var mqList = window.matchMedia("(prefers-color-scheme: dark)");

observeMediaChange(mqList, (event) => {
  // is dark mode
  if (event.matches) {
    console.log("switch to dark mode");
    switchThemeMode("dark");
  } else {
    console.log("switch to light mode");
    switchThemeMode("light");
  }
});

function initBackToTopButton() {
  const button = document.querySelector("[data-back-to-top]");
  if (!button) {
    return;
  }

  const threshold = 120;

  const updateVisibility = () => {
    const scrollTop =
      window.pageYOffset || document.documentElement.scrollTop || 0;
    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight || 0;
    const pageHeight = document.documentElement.scrollHeight || 0;
    const nearBottom = scrollTop + viewportHeight >= pageHeight - threshold;
    const hasScrollableArea = pageHeight > viewportHeight + 10;

    button.classList.toggle("is-visible", nearBottom && hasScrollableArea);
  };

  window.addEventListener("scroll", updateVisibility, { passive: true });
  window.addEventListener("resize", updateVisibility);

  button.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  updateVisibility();
}

initBackToTopButton();

function initHomeSideIndex() {
  const panel = document.querySelector("[data-side-index]");
  const toggle = document.querySelector("[data-index-toggle]");
  if (!panel) {
    return;
  }

  const mask = document.querySelector("[data-index-mask]");
  const searchInput = document.querySelector("[data-filter-title]");
  const clearButton = document.querySelector("[data-filter-clear]");
  const categoryButtons = Array.from(
    document.querySelectorAll("[data-filter-category]")
  );
  const tagButtons = Array.from(document.querySelectorAll("[data-filter-tag]"));
  const postItems = Array.from(document.querySelectorAll(".post-item[data-title]"));

  let activeCategory = "";
  let activeTag = "";

  const normalize = (text) => (text || "").toLowerCase().trim();

  const getTokens = (text) =>
    (text || "")
      .split("||")
      .map((item) => normalize(item))
      .filter(Boolean);

  const applyFilter = () => {
    const keyword = normalize(searchInput ? searchInput.value : "");

    postItems.forEach((post) => {
      const title = normalize(post.dataset.title);
      const categories = getTokens(post.dataset.categories);
      const tags = getTokens(post.dataset.tags);

      const matchTitle = !keyword || title.includes(keyword);
      const matchCategory =
        !activeCategory || categories.includes(normalize(activeCategory));
      const matchTag = !activeTag || tags.includes(normalize(activeTag));

      post.style.display = matchTitle && matchCategory && matchTag ? "" : "none";
    });
  };

  const updateActiveState = () => {
    categoryButtons.forEach((button) => {
      button.classList.toggle(
        "is-active",
        normalize(button.dataset.filterCategory) === normalize(activeCategory)
      );
    });

    tagButtons.forEach((button) => {
      button.classList.toggle(
        "is-active",
        normalize(button.dataset.filterTag) === normalize(activeTag)
      );
    });
  };

  const setOpen = (open) => {
    panel.classList.toggle("is-open", open);
    if (toggle) {
      toggle.classList.toggle("is-active", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }
    document.body.classList.toggle("side-index-open", open);
    if (mask) {
      mask.classList.toggle("is-open", open);
    }
  };

  const isMobileView = () => window.matchMedia("(max-width: 640px)").matches;

  const hasLeftSpace = () => {
    const rootStyles = getComputedStyle(document.documentElement);
    const mainWidth = parseFloat(rootStyles.getPropertyValue("--main-width")) || 1080;
    const sideSpace = (window.innerWidth - mainWidth) / 2;

    return sideSpace >= 300;
  };

  const applyMode = () => {
    const docked = hasLeftSpace();
    document.body.classList.toggle("side-index-docked", docked);
    document.body.classList.toggle("side-index-overlay", !docked);
    setOpen(false);
  };

  let touchStartX = 0;
  let touchStartY = 0;
  let touchTracking = false;

  const isOverlayMode = () => document.body.classList.contains("side-index-overlay");

  const onTouchStart = (event) => {
    if (!isOverlayMode() || !panel.classList.contains("is-open")) {
      return;
    }

    const touch = event.touches && event.touches[0];
    if (!touch) {
      return;
    }

    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchTracking = true;
  };

  const onTouchEnd = (event) => {
    if (!touchTracking || !isOverlayMode() || !panel.classList.contains("is-open")) {
      touchTracking = false;
      return;
    }

    const touch = event.changedTouches && event.changedTouches[0];
    if (!touch) {
      touchTracking = false;
      return;
    }

    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50;

    if (isHorizontalSwipe && deltaX < 0) {
      setOpen(false);
    }

    touchTracking = false;
  };

  if (toggle) {
    toggle.addEventListener("click", () => {
      setOpen(!panel.classList.contains("is-open"));
    });
  }

  if (mask) {
    mask.addEventListener("click", () => {
      setOpen(false);
    });
  }

  panel.addEventListener("touchstart", onTouchStart, { passive: true });
  panel.addEventListener("touchend", onTouchEnd, { passive: true });

  let openSwipeStartX = 0;
  let openSwipeStartY = 0;
  let openSwipeTracking = false;

  const onGlobalTouchStart = (event) => {
    if (!isMobileView() || !isOverlayMode() || panel.classList.contains("is-open")) {
      openSwipeTracking = false;
      return;
    }

    const touch = event.touches && event.touches[0];
    if (!touch || touch.clientX > 56) {
      openSwipeTracking = false;
      return;
    }

    openSwipeStartX = touch.clientX;
    openSwipeStartY = touch.clientY;
    openSwipeTracking = true;
  };

  const onGlobalTouchEnd = (event) => {
    if (!openSwipeTracking || !isMobileView() || !isOverlayMode() || panel.classList.contains("is-open")) {
      openSwipeTracking = false;
      return;
    }

    const touch = event.changedTouches && event.changedTouches[0];
    if (!touch) {
      openSwipeTracking = false;
      return;
    }

    const deltaX = touch.clientX - openSwipeStartX;
    const deltaY = touch.clientY - openSwipeStartY;
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 60;

    if (isHorizontalSwipe) {
      setOpen(true);
    }

    openSwipeTracking = false;
  };

  document.addEventListener("touchstart", onGlobalTouchStart, { passive: true });
  document.addEventListener("touchend", onGlobalTouchEnd, { passive: true });

  if (searchInput) {
    searchInput.addEventListener("input", applyFilter);
  }

  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextCategory = button.dataset.filterCategory || "";
      activeCategory = normalize(activeCategory) === normalize(nextCategory)
        ? ""
        : nextCategory;
      updateActiveState();
      applyFilter();
    });
  });

  tagButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextTag = button.dataset.filterTag || "";
      activeTag = normalize(activeTag) === normalize(nextTag) ? "" : nextTag;
      updateActiveState();
      applyFilter();
    });
  });

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      activeCategory = "";
      activeTag = "";
      if (searchInput) {
        searchInput.value = "";
      }
      updateActiveState();
      applyFilter();
    });
  }

  window.addEventListener("resize", applyMode);

  applyMode();
  updateActiveState();
  applyFilter();
}

initHomeSideIndex();
