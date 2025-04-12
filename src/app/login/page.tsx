"use client";

import { Button, Form, Input, Card, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import Image from "next/image";

interface LoginFormData {
  username: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

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

      message.success("Login successful!");
      router.push("/dashboard"); // Redirect after successful login
      router.refresh(); // Refresh the page to update auth state
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Login failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <Image
          src={"/logo.png"}
          alt="Logo"
          width={64}
          height={64}
          className="mx-auto mb-4"
        />
        <div className="text-center text-2xl font-bold font-inter mb-3">
          Welcome back to OratorsBase
        </div>
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            label="Email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" type="email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Please input your password!" },
              { min: 6, message: "Password must be at least 6 characters!" },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full"
              loading={loading}
              style={{
                height: "40px",
                fontSize: "16px",
                background: "linear-gradient(to right, #5f0f40, #310e68)",
                border: "none",
                boxShadow: "none",
              }}
            >
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
