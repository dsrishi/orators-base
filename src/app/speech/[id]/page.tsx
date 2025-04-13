"use client";

import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import TiptapEditor from "@/components/TiptapEditor";
import { useEffect, useState } from "react";
import { speechService } from "@/services/speechService";
import { Speech } from "@/types/speech";
import { Spin, message } from "antd";
import { useParams } from "next/navigation";

export default function SpeechPage() {
  const [speech, setSpeech] = useState<Speech | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const params = useParams();
  const speechId = params.id as string;

  useEffect(() => {
    async function loadSpeechData() {
      try {
        const { data, error } = await speechService.getSpeechWithVersion(
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
        setContent(data.content);
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
        <Spin size="large" />
      </div>
    );
  }

  if (!speech || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Speech not found</div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      {contextHolder}
      <div className="min-h-screen">
        <Navbar />
        <main className="mt-16">
          <TiptapEditor
            speechId={speechId}
            initialContent={content}
            speechData={speech}
          />
        </main>
      </div>
    </ProtectedRoute>
  );
}
