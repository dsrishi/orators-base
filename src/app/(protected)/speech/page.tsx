"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { Button, Card } from "antd";
import { useRouter } from "next/navigation";

export default function Speech() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <main>
      <div className="flex items-center justify-center min-h-screen">
        <Card
          className="w-full max-w-md shadow-lg"
          style={{
            background: theme === "dark" ? "#1f1f1f" : "#ffffff",
            color: theme === "dark" ? "#ffffff" : "#000000",
            borderColor: theme === "dark" ? "#2d2d2d" : "#e5e5e5",
          }}
        >
          <div
            className={`text-center text-2xl font-semibold font-inter ${
              theme === "dark" ? "text-gray-100" : "text-gray-800"
            }`}
          >
            OratorsBase
          </div>
          <div className="text-center text-gray-500 mb-6">
            Helping Orators Leave a Lasting Impact
          </div>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full primary-gradient"
            onClick={() => router.push("/dashboard")}
            style={{
              height: "40px",
              fontSize: "16px",
              border: "none",
              boxShadow:
                theme === "dark" ? "0 2px 8px rgba(0, 0, 0, 0.3)" : "none",
            }}
          >
            Go to Dashboard
          </Button>
        </Card>
      </div>
    </main>
  );
}
