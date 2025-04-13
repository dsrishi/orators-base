"use client";

import Navbar from "@/components/Navbar";
import { Button, Space, Empty, message, Spin } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import ProtectedRoute from "@/components/ProtectedRoute";
import SpeechCard from "@/components/SpeechCard";
import { useEffect, useState } from "react";
import { Speech } from "@/types/speech";
import { speechService } from "@/services/speechService";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [speeches, setSpeeches] = useState<Speech[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { user, loading: userLoading, error: userError } = useUser();
  const router = useRouter();

  useEffect(() => {
    async function fetchSpeeches() {
      if (!user) return;

      try {
        const { data, error } = await speechService.getUserSpeeches(user.id);

        if (error) {
          messageApi.error({
            content: error.message,
            duration: 5,
          });
          console.error("Detailed error:", error.details);
          return;
        }

        setSpeeches(data || []);
      } finally {
        setLoading(false);
      }
    }

    if (!userLoading && user) {
      fetchSpeeches();
    }
  }, [messageApi, user, userLoading]);

  const handleCreateNewSpeech = async () => {
    if (!user) return;

    setCreating(true);
    try {
      const { speechId, error } = await speechService.createNewSpeech({
        userId: user.id,
        title: "Untitled Speech",
      });

      if (error) {
        messageApi.error({
          content: error.message,
          duration: 5,
        });
        return;
      }

      if (speechId) {
        router.push(`/speech?id=${speechId}`);
      }
    } catch (err) {
      messageApi.error({
        content: "Failed to create new speech",
        duration: 5,
      });
      console.error("Creation error:", err);
    } finally {
      setCreating(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (userError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Empty
          description={
            <span className="text-red-500">Error loading user data</span>
          }
        />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      {contextHolder}
      <div className="min-h-screen">
        <Navbar />
        <main className="mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-16">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Speeches</h1>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateNewSpeech}
                loading={creating}
                style={{
                  background: "linear-gradient(to right, #5f0f40, #310e68)",
                  border: "none",
                  boxShadow: "none",
                }}
              >
                New Speech
              </Button>
            </Space>
          </div>

          {loading ? (
            // Add loading skeleton here if needed
            <div>Loading...</div>
          ) : speeches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {speeches.map((speech) => (
                <SpeechCard key={speech.id} {...speech} />
              ))}
            </div>
          ) : (
            <Empty description="No speeches found" className="mt-8" />
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
