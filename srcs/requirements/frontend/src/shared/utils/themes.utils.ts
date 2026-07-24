export type Theme = "light" | "dark" | "system";

/**
 * Applies the correct theme to the document element based on the given theme value.
 * It manages both the `.dark` class (for CSS variables) and the `data-theme` attribute (for Tailwind v4 variants).
 */
function applyThemeClass(isDark: boolean) {
  if (isDark) {
    document.documentElement.classList.add("dark");
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    document.documentElement.setAttribute("data-theme", "light");
  }
}

/**
 * Should be called once on application start (e.g. in main.tsx)
 * to initialize the theme to avoid FOUC.
 */
export function initTheme() {
  const storedTheme = localStorage.getItem("theme") as Theme | null;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  
  const isDark = storedTheme === "dark" || (!storedTheme && prefersDark);
  applyThemeClass(isDark);
}

/**
 * Changes the current theme. Call this from your UI components when a user clicks a theme toggle.
 */
export function setTheme(theme: Theme) {
  if (theme === "system") {
    localStorage.removeItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyThemeClass(prefersDark);
  } else {
    localStorage.setItem("theme", theme);
    applyThemeClass(theme === "dark");
  }
}

/**
 * Retrieves the currently saved theme preference.
 */
export function getTheme(): Theme {
  return (localStorage.getItem("theme") as Theme) || "system";
}

/**
 * Optional listener for system theme changes.
 * Useful if the user has selected "system" and changes their OS theme.
 */
export function listenToSystemThemeChanges(callback?: (isDark: boolean) => void) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  
  const handler = (e: MediaQueryListEvent) => {
    const currentTheme = getTheme();
    if (currentTheme === "system") {
      applyThemeClass(e.matches);
      if (callback) callback(e.matches);
    }
  };

  mediaQuery.addEventListener("change", handler);
  return () => mediaQuery.removeEventListener("change", handler);
}