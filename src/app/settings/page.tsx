"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { Form, Input, Button, Select, message, Spin, Tabs } from "antd";
import { userService } from "@/services/userService";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useTheme } from "@/contexts/ThemeContext";
import { UpdateProfileData } from "@/types/user";

const { Option } = Select;

export default function SettingsPage() {
  const { user, loading: userLoading } = useUser();
  const { theme } = useTheme();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;

      try {
        const { data, error } = await userService.getProfile(user.id);

        if (error) {
          messageApi.error({
            content: error.message,
            duration: 5,
          });
          return;
        }

        if (data) {
          profileForm.setFieldsValue({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            gender: data.gender || undefined,
          });
        }
      } finally {
        setLoading(false);
      }
    }

    if (!userLoading && user) {
      fetchProfile();
    }
  }, [user, userLoading, profileForm, messageApi]);

  const handleProfileUpdate = async (values: UpdateProfileData) => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await userService.updateProfile(user.id, values);

      if (error) {
        messageApi.error({
          content: error.message,
          duration: 5,
        });
        return;
      }

      messageApi.success({
        content: "Profile updated successfully",
        duration: 3,
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (values: {
    currentPassword: string;
    password: string;
    confirmPassword: string;
  }) => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await userService.updatePassword(user.id, {
        password: values.password,
      });

      if (error) {
        messageApi.error({
          content: error.message,
          duration: 5,
        });
        return;
      }

      messageApi.success({
        content: "Password updated successfully",
        duration: 3,
      });
      passwordForm.resetFields();
    } finally {
      setSaving(false);
    }
  };

  if (userLoading || loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <Spin size="large" />
        </div>
      </ProtectedRoute>
    );
  }

  const tabItems = [
    {
      key: "1",
      label: "Profile",
      children: (
        <div className="max-w-xl p-3">
          <Form
            form={profileForm}
            layout="vertical"
            onFinish={handleProfileUpdate}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label="First Name"
                name="first_name"
                rules={[
                  {
                    required: true,
                    message: "Please enter your first name",
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Last Name"
                name="last_name"
                rules={[
                  {
                    required: true,
                    message: "Please enter your last name",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </div>

            <Form.Item label="Gender" name="gender">
              <Select>
                <Option value="male">Male</Option>
                <Option value="female">Female</Option>
                <Option value="other">Other</Option>
                <Option value="prefer_not_to_say">Prefer not to say</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={saving}
                style={{
                  background: "linear-gradient(to right, #5f0f40, #310e68)",
                  border: "none",
                  boxShadow: "none",
                }}
              >
                Save Profile
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
    {
      key: "2",
      label: "Security",
      children: (
        <div className="max-w-xl p-3">
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordUpdate}
          >
            <Form.Item
              label="Current Password"
              name="currentPassword"
              rules={[
                {
                  required: true,
                  message: "Please enter your current password",
                },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              label="New Password"
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please enter your new password",
                },
                {
                  min: 8,
                  message: "Password must be at least 8 characters",
                },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              label="Confirm New Password"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                {
                  required: true,
                  message: "Please confirm your new password",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match"));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={saving}
                style={{
                  background: "linear-gradient(to right, #5f0f40, #310e68)",
                  border: "none",
                  boxShadow: "none",
                }}
              >
                Update Password
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute>
      {contextHolder}
      <div className="min-h-screen">
        <Navbar />
        <main className="mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-16">
          <h1
            className="text-2xl font-bold mb-6"
            style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}
          >
            Settings
          </h1>

          <Tabs type="card" defaultActiveKey="1" items={tabItems} />
        </main>
      </div>
    </ProtectedRoute>
  );
}
