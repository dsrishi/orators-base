"use client";

import { Button, Card, Image } from "antd";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import PublicRoute from "@/components/PublicRoute";
import { useRouter } from "next/navigation";

export default function Home() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <PublicRoute>
      <div className="min-h-screen relative">
        <div className="absolute top-4 right-4">
          <ThemeSwitcher />
        </div>
        <div className="flex items-center justify-center min-h-screen">
          <Card
            className="w-full max-w-md shadow-lg"
            style={{
              background: theme === "dark" ? "#1f1f1f" : "#ffffff",
              color: theme === "dark" ? "#ffffff" : "#000000",
              borderColor: theme === "dark" ? "#2d2d2d" : "#e5e5e5",
            }}
          >
            <div className="text-center">
              <Image
                src={"/logo.png"}
                alt="Logo"
                width={64}
                height={64}
                className="mx-auto mb-4"
              />
            </div>
            <div
              className={`text-center text-2xl font-semibold font-inter ${
                theme === "dark" ? "text-gray-100" : "text-gray-800"
              }`}
            >
              Welcome to OratorsBase
            </div>
            <div className="text-center text-gray-500 mb-6">
              Helping Orators Leave a Lasting Impact
            </div>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full primary-gradient-btn"
              onClick={() => router.push("/login")}
              style={{
                height: "40px",
                fontSize: "16px",
                border: "none",
                boxShadow:
                  theme === "dark" ? "0 2px 8px rgba(0, 0, 0, 0.3)" : "none",
              }}
            >
              Log in to continue
            </Button>
          </Card>
        </div>
      </div>
    </PublicRoute>
  );
}
