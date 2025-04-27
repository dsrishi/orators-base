"use client";

import { useState } from "react";
import { Form, Input, Button, message, Card } from "antd";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type AccessRequestForm = {
  name: string;
  email: string;
  contact: string;
  reason: string;
};

const RequestAccess = () => {
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values: AccessRequestForm) => {
    setLoading(true);
    const { name, email, contact, reason } = values;
    const { error } = await supabase
      .from("access_requests")
      .insert([{ name, email, contact, reason }]);
    setLoading(false);
    if (error) {
      messageApi.error("Failed to submit request. Please try again.");
    } else {
      messageApi.success("Request submitted successfully!");
    }
  };

  return (
    <>
      {contextHolder}
      <div className="flex items-center justify-center my-28">
        <Card className="w-full max-w-xl">
          <div
            className={`text-center text-4xl font-semibold font-logo mb-2 text-primary-gradient`}
          >
            OratorsBase
          </div>
          <div className="text-gray-400 text-center font-semibold text-xl">
            Request Access
          </div>
          <div className="text-gray-400 text-center mb-6">
            Let us know why you want to join OratorsBase.
          </div>
          <Form layout="vertical" onFinish={onFinish} autoComplete="off">
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Please enter your name" }]}
            >
              <Input placeholder="Your Name" size="large" />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input placeholder="you@example.com" size="large" />
            </Form.Item>
            <Form.Item
              label="Contact Number"
              name="contact"
              rules={[
                { required: true, message: "Please enter your contact number" },
              ]}
            >
              <Input placeholder="Contact Number" size="large" />
            </Form.Item>
            <Form.Item
              label="Reason for Request"
              name="reason"
              rules={[{ required: true, message: "Please provide a reason" }]}
            >
              <Input.TextArea placeholder="Why do you want access?" rows={3} />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{
                  border: "none",
                }}
                className="w-full primary-gradient-btn"
                size="large"
              >
                Submit Request
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </>
  );
};

export default RequestAccess;
