"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ConfigProvider, theme } from "antd";
import type { ThemeConfig } from "antd";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getAntdThemeConfig = (currentTheme: Theme): ThemeConfig => ({
  token: {
    colorPrimary: "#310e68",
    borderRadius: 6,
    fontFamily: "Inter, sans-serif",
  },
  algorithm:
    currentTheme === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
  components: {
    Button: {
      colorPrimary: "#310e68",
      algorithm: true,
      primaryShadow: "none",
    },
    Select: {
      colorBgContainer: currentTheme === "dark" ? "#2d2d2d" : "#ffffff",
      colorBorder: currentTheme === "dark" ? "#3d3d3d" : "#d9d9d9",
      colorText: currentTheme === "dark" ? "#ffffff" : "#000000",
      colorBgElevated: currentTheme === "dark" ? "#2d2d2d" : "#ffffff",
      controlItemBgActive: currentTheme === "dark" ? "#1f1f1f" : "#f5f5f5",
      controlItemBgHover: currentTheme === "dark" ? "#3d3d3d" : "#f0f0f0",
    },
    Modal: {
      colorBgElevated: currentTheme === "dark" ? "#1e1e1e" : "#ffffff",
      colorText: currentTheme === "dark" ? "#ffffff" : "#000000",
    },
    Input: {
      colorBgContainer: currentTheme === "dark" ? "#2d2d2d" : "#ffffff",
      colorBorder: currentTheme === "dark" ? "#3d3d3d" : "#d9d9d9",
      colorText: currentTheme === "dark" ? "#ffffff" : "#000000",
    },
    Drawer: {
      colorBgElevated: currentTheme === "dark" ? "#1e1e1e" : "#ffffff",
      colorText: currentTheme === "dark" ? "#ffffff" : "#000000",
    },
    Breadcrumb: {
      colorText:
        currentTheme === "dark"
          ? "rgba(255, 255, 255, 0.85)"
          : "rgba(0, 0, 0, 0.85)",
      colorTextDescription:
        currentTheme === "dark"
          ? "rgba(255, 255, 255, 0.45)"
          : "rgba(0, 0, 0, 0.45)",
      separatorColor:
        currentTheme === "dark"
          ? "rgba(255, 255, 255, 0.45)"
          : "rgba(0, 0, 0, 0.45)",
    },
  },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
      document.documentElement.setAttribute("data-theme", savedTheme);
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
    document.documentElement.setAttribute("data-theme", newTheme);
    document.body.style.backgroundColor =
      newTheme === "dark" ? "#1E1E1E" : "#ffffff";
    document.body.style.color = newTheme === "dark" ? "#fff" : "#000";
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

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
        <ConfigProvider theme={getAntdThemeConfig(theme)}>
          {children}
        </ConfigProvider>
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
