"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "antd";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      icon={theme === "light" ? <MoonOutlined /> : <SunOutlined />}
      onClick={toggleTheme}
      className="bg-transparent"
      size="large"
    />
  );
}
