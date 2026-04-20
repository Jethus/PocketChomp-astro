export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

export function readStoredTheme(storage: Storage = localStorage): Theme | null {
  try {
    const value = storage.getItem(THEME_STORAGE_KEY);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

export function getSystemTheme(media: MediaQueryList = window.matchMedia("(prefers-color-scheme: dark)")): Theme {
  return media.matches ? "dark" : "light";
}

export function getPreferredTheme(
  storage: Storage = localStorage,
  media: MediaQueryList = window.matchMedia("(prefers-color-scheme: dark)"),
): Theme {
  return readStoredTheme(storage) ?? getSystemTheme(media);
}

export function applyTheme(
  theme: Theme,
  root: HTMLElement = document.documentElement,
) {
  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

export function setStoredTheme(theme: Theme, storage: Storage = localStorage) {
  try {
    storage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    return;
  }
}

export function syncDocumentTheme(
  root: HTMLElement = document.documentElement,
  storage: Storage = localStorage,
  media: MediaQueryList = window.matchMedia("(prefers-color-scheme: dark)"),
) {
  applyTheme(getPreferredTheme(storage, media), root);
}

export function syncThemeToggleButtons(root: ParentNode = document) {
  const theme = document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";

  root.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]").forEach((button) => {
    const isDark = theme === "dark";
    const label = isDark ? "Switch to light mode" : "Switch to dark mode";
    const sunIcon = button.querySelector<SVGElement>('[data-theme-toggle-icon="sun"]');
    const moonIcon = button.querySelector<SVGElement>('[data-theme-toggle-icon="moon"]');
    const labelNode = button.querySelector<HTMLElement>("[data-theme-toggle-label]");

    button.setAttribute("aria-pressed", String(isDark));
    button.setAttribute("aria-label", label);

    if (labelNode) {
      labelNode.textContent = label;
    }

    sunIcon?.classList.toggle("hidden", !isDark);
    moonIcon?.classList.toggle("hidden", isDark);
  });
}

export function bindThemeToggleButtons(root: ParentNode = document) {
  root.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]").forEach((button) => {
    if (button.dataset.themeToggleBound === "true") {
      return;
    }

    button.dataset.themeToggleBound = "true";
    button.addEventListener("click", () => {
      const nextTheme = document.documentElement.classList.contains("dark")
        ? "light"
        : "dark";

      setStoredTheme(nextTheme);
      applyTheme(nextTheme);
      syncThemeToggleButtons();
    });
  });
}

export function getThemeBootstrapScript() {
  return `(() => {
  const STORAGE_KEY = ${JSON.stringify(THEME_STORAGE_KEY)};
  const root = document.documentElement;
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  const readStoredTheme = () => {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === "dark" || value === "light" ? value : null;
    } catch {
      return null;
    }
  };

  const applyTheme = (theme) => {
    root.classList.toggle("dark", theme === "dark");
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  };

  const syncTheme = () => {
    applyTheme(readStoredTheme() ?? (media.matches ? "dark" : "light"));
  };

  document.addEventListener("astro:after-swap", syncTheme);
  media.addEventListener("change", () => {
    if (!readStoredTheme()) {
      syncTheme();
    }
  });

  syncTheme();
})();`;
}
