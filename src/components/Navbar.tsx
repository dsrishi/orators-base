"use client";

import { useState } from "react";
import ThemeSwitcher from "./ThemeSwitcher";
import { useTheme } from "@/contexts/ThemeContext";
import Image from "next/image";

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { theme } = useTheme();

  const handleLogout = () => {
    // Add logout logic here
    console.log("Logging out...");
  };

  return (
    <nav
      className="w-full border-b"
      style={{
        backgroundColor: theme === "dark" ? "#1f1f1f" : "#ffffff",
        borderBottom:
          theme === "dark" ? "solid 1px #2d2d2d" : "solid 1px #e5e5e5",
      }}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Image src={"/logo.png"} alt="Logo" width={40} height={40} />
            <div className="text-xl font-bold">OratorsBase</div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeSwitcher />

            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600"></div>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5">
                  <div className="py-1" role="menu">
                    <a
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      role="menuitem"
                    >
                      Settings
                    </a>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      role="menuitem"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
