"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // Check if theme is stored in localStorage
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
      // Set background and text colors
      document.body.style.backgroundColor =
        savedTheme === "dark" ? "#1E1E1E" : "#ffffff";
      document.body.style.color = savedTheme === "dark" ? "#fff" : "#000";
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    // Update background and text colors when theme changes
    document.body.style.backgroundColor =
      newTheme === "dark" ? "#1E1E1E" : "#ffffff";
    document.body.style.color = newTheme === "dark" ? "#fff" : "#000";
  };

  // Add a style tag to ensure the html and body elements take full height
  return (
    <>
      <style jsx global>{`
        html,
        body {
          min-height: 100%;
          margin: 0;
          padding: 0;
          transition: background-color 0.3s, color 0.3s;
        }
      `}</style>
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        {children}
      </ThemeContext.Provider>
    </>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
