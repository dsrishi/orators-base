"use client";

import { Button, Form, Input, Card, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import Image from "next/image";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import PublicRoute from "@/components/PublicRoute";

interface LoginFormData {
  username: string;
  password: string;
}

export default function Login() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values: LoginFormData) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.username, // Note: using username field for email
        password: values.password,
      });

      if (data) {
        console.log(data);
      }

      if (error) {
        throw error;
      }

      messageApi.success("Login successful!");
      router.push("/dashboard"); // Redirect after successful login
      router.refresh(); // Refresh the page to update auth state
    } catch (error) {
      messageApi.error(
        error instanceof Error ? error.message : "Login failed!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicRoute>
      {contextHolder}
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
            <Image
              src={"/logo.png"}
              alt="Logo"
              width={64}
              height={64}
              className="mx-auto mb-4"
            />
            <div
              className={`text-center text-2xl font-semibold font-inter mb-3 ${
                theme === "dark" ? "text-gray-100" : "text-gray-800"
              }`}
            >
              Welcome back to OratorsBase
            </div>
            <Form
              form={form}
              name="login"
              onFinish={onFinish}
              layout="vertical"
              size="large"
              className={theme === "dark" ? "text-gray-100" : "text-gray-800"}
            >
              <Form.Item
                name="username"
                label={
                  <span
                    className={
                      theme === "dark" ? "text-gray-200" : "text-gray-700"
                    }
                  >
                    Email
                  </span>
                }
                rules={[
                  { required: true, message: "Please input your email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input
                  prefix={
                    <UserOutlined
                      className={
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }
                    />
                  }
                  placeholder={"Email"}
                  type="email"
                  style={{
                    background: theme === "dark" ? "#2d2d2d" : "#ffffff",
                    borderColor: theme === "dark" ? "#3d3d3d" : "#d9d9d9",
                    color: theme === "dark" ? "#ffffff" : "#000000",
                  }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={
                  <span
                    className={
                      theme === "dark" ? "text-gray-200" : "text-gray-700"
                    }
                  >
                    Password
                  </span>
                }
                rules={[
                  { required: true, message: "Please input your password!" },
                  {
                    min: 6,
                    message: "Password must be at least 6 characters!",
                  },
                ]}
              >
                <Input.Password
                  prefix={
                    <LockOutlined
                      className={
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }
                    />
                  }
                  placeholder="Password"
                  style={{
                    background: theme === "dark" ? "#2d2d2d" : "#ffffff",
                    borderColor: theme === "dark" ? "#3d3d3d" : "#d9d9d9",
                    color: theme === "dark" ? "#ffffff" : "#000000",
                  }}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full primary-gradient"
                  loading={loading}
                  style={{
                    height: "40px",
                    fontSize: "16px",
                    border: "none",
                    boxShadow:
                      theme === "dark"
                        ? "0 2px 8px rgba(0, 0, 0, 0.3)"
                        : "none",
                  }}
                >
                  Log in
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </PublicRoute>
  );
}
