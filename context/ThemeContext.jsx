"use client";

import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext({
  theme: "white",
  setTheme: () => {},
});

const VALID_THEMES = ["ion", "galaxy", "white"];

export function ThemeProvider({ children }) {
  const [theme, setThemeRaw] = useState("white");

  const setTheme = (t) => {
    if (VALID_THEMES.includes(t)) setThemeRaw(t);
  };

  // Read saved theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved && VALID_THEMES.includes(saved)) {
      setThemeRaw((prev) => (prev !== saved ? saved : prev));
    }
  }, []);

  // Apply theme class to body whenever theme changes
  useEffect(() => {
    document.body.classList.remove("ion-theme", "galaxy-theme", "white-theme");
    document.body.classList.add(`${theme}-theme`);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

