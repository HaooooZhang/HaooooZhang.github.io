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
