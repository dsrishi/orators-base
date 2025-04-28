"use client";

import { Button, Form, Input, Card, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

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
    <>
      {contextHolder}
      <div className="relative">
        <div
          className="flex items-center justify-center"
          style={{
            minHeight: "100vh",
          }}
        >
          <Card className="w-full max-w-lg">
            <div
              className={`text-center text-4xl font-semibold font-logo mb-2 text-primary-gradient`}
            >
              OratorsBase
            </div>
            <div className="text-gray-400 text-center font-semibold text-xl mb-6">
              Welcome Back. Login to your account.
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
                  className="w-full primary-gradient-btn"
                  loading={loading}
                  style={{
                    border: "none",
                  }}
                  size="large"
                >
                  Log in
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </>
  );
}
