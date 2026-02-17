"use client";

import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext({ theme: "galaxy", toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("galaxy");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("notenova-theme");
    if (saved === "executive" || saved === "galaxy") {
      setTheme(saved);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.body.classList.remove("galaxy", "executive");
    document.body.classList.add(theme);
    localStorage.setItem("notenova-theme", theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "galaxy" ? "executive" : "galaxy"));
  };

  // Prevent flash of wrong theme
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
