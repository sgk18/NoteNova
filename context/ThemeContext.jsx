"use client";

import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext({
  theme: "white",
  setTheme: () => {},
});

const VALID_THEMES = ["ion", "galaxy", "white"];

export function ThemeProvider({ children }) {
  const [theme, setThemeRaw] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("theme") || "white"
      : "white"
  );
  const [mounted, setMounted] = useState(false);

  const setTheme = (t) => {
    if (VALID_THEMES.includes(t)) setThemeRaw(t);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.classList.remove("ion-theme", "galaxy-theme", "white-theme");
    document.body.classList.add(`${theme}-theme`);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Prevent flash of wrong theme
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
