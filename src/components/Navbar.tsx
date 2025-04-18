"use client";

import ThemeSwitcher from "./ThemeSwitcher";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dropdown, Avatar } from "antd";
import type { MenuProps } from "antd";
import { SettingOutlined, LogoutOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";

const Navbar = () => {
  const { theme } = useTheme();
  const { signOut } = useAuth();
  const router = useRouter();
  const { user } = useUser();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const items: MenuProps["items"] = [
    {
      key: "settings",
      label: (
        <Link href="/settings" className="flex items-center gap-2">
          <SettingOutlined /> Settings
        </Link>
      ),
    },
    {
      key: "logout",
      label: (
        <a onClick={handleLogout} className="flex items-center gap-2">
          <LogoutOutlined /> Logout
        </a>
      ),
    },
  ];

  return (
    <nav
      className="w-full border-b fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: theme === "dark" ? "#1f1f1f" : "#ffffff",
        borderBottom:
          theme === "dark" ? "solid 1px #2d2d2d" : "solid 1px #e5e5e5",
      }}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-1">
            <div className="flex items-center space-x-1">
              <Image src={"/logo.png"} alt="Logo" width={40} height={40} />
              <div className="text-xl font-bold">OratorsBase</div>
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            <ThemeSwitcher />

            <Dropdown
              menu={{ items }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Avatar
                className="cursor-pointer"
                size={40}
                src={
                  user
                    ? user.gender === "male"
                      ? "/man.svg"
                      : user.gender === "female"
                      ? "/woman.svg"
                      : "user.svg"
                    : "/user.svg"
                }
              />
            </Dropdown>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
