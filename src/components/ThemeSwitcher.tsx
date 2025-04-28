"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "antd";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      icon={theme === "light" ? <MoonOutlined /> : <SunOutlined />}
      shape="circle"
      onClick={toggleTheme}
      className="transparent-btn"
    />
  );
}

export function ThemeSwitcher2() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div onClick={toggleTheme} className="flex items-center gap-2">
      {theme === "light" ? <MoonOutlined /> : <SunOutlined />}
      {theme === "light" ? "Dark Mode" : "Light Mode"}
    </div>
  );
}
