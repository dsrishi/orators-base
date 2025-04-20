"use client";

import { Button, Space, Empty, message, Spin, Skeleton, Card } from "antd";
import { PlusOutlined } from "@ant-design/icons";
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
        const { data, error } = await speechService.getRecentUserSpeeches(
          user.id
        );

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
        router.push(`/speech/${speechId}`);
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
        <Spin />
      </div>
    );
  }

  if (userError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Empty description={<span className="">Getting user data...</span>} />
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-16">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Recent Speeches</h1>
            <Button size="small" onClick={() => router.push("/speeches")}>
              View All
            </Button>
          </div>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateNewSpeech}
              loading={creating}
              style={{
                border: "none",
                boxShadow: "none",
              }}
              className="primary-gradient"
            >
              New Speech
            </Button>
          </Space>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <Card>
              <Skeleton active />
            </Card>
            <Card>
              <Skeleton active />
            </Card>
            <Card>
              <Skeleton active />
            </Card>
            <Card>
              <Skeleton active />
            </Card>
          </div>
        ) : speeches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {speeches.map((speech) => (
              <SpeechCard key={speech.id} {...speech} />
            ))}
          </div>
        ) : (
          <>
            <Empty description="No speeches found" className="mt-8 mb-3" />
            <div className="text-center">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateNewSpeech}
                loading={creating}
                style={{
                  border: "none",
                  boxShadow: "none",
                }}
                className="primary-gradient"
              >
                New Speech
              </Button>
            </div>
          </>
        )}
      </main>
    </>
  );
}
