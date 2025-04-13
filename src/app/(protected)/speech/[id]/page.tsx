"use client";

import TiptapEditor from "@/components/TiptapEditor";
import { useEffect, useState } from "react";
import { speechService } from "@/services/speechService";
import { Speech, SpeechVersion } from "@/types/speech";
import { Spin, message } from "antd";
import { useParams } from "next/navigation";

export default function SpeechPage() {
  const [speech, setSpeech] = useState<Speech | null>(null);
  const [version, setVersion] = useState<SpeechVersion | null>(null);
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
        setVersion(data.version);
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

  if (!speech || !version) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Speech not found</div>
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <main className="mt-16">
        <TiptapEditor
          speechId={speechId}
          speechData={speech}
          version={version}
        />
      </main>
    </>
  );
}
