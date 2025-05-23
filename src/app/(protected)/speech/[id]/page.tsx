"use client";

import { useEffect, useState } from "react";
import { speechService } from "@/services/speechService";
import { Speech } from "@/types/speech";
import { Button, Empty, Spin, message } from "antd";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import SlateEditor from "@/components/SlateEditor";

export default function SpeechMainPage() {
  const [speech, setSpeech] = useState<Speech | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const params = useParams();
  const speechId = params.id as string;
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    async function loadSpeechData() {
      try {
        const { data, error } = await speechService.getSpeechWithAllFiles(
          speechId
        );

        if (error) {
          messageApi.error({
            content: error.message,
            duration: 5,
          });
          console.error("Error details:", error.details);
          return;
        }

        setSpeech(data.speech);
      } catch (err) {
        messageApi.error({
          content: "Failed to load speech",
          duration: 5,
        });
        console.error("Load error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (speechId) {
      loadSpeechData();
    }
  }, [speechId, messageApi]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin />
      </div>
    );
  }

  if (!speech) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>
          <Empty description={<span className="">Speech not found</span>} />
          <Button
            type="primary"
            htmlType="submit"
            className="w-full primary-gradient-btn mt-3"
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
        </div>
      </div>
    );
  }

  //if there are no speech files available for a speech, add a button to add a file
  if (speech?.files?.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>
          <Empty description={<span className="">No files found</span>} />
          <Button
            type="primary"
            htmlType="submit"
            className="w-full primary-gradient-btn mt-3"
            style={{
              height: "40px",
              fontSize: "16px",
              border: "none",
              boxShadow:
                theme === "dark" ? "0 2px 8px rgba(0, 0, 0, 0.3)" : "none",
            }}
          >
            Add a file
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <main>
        <SlateEditor
          speechId={speechId}
          speechData={speech}
          files={speech.files || []}
        />
      </main>
    </>
  );
}
