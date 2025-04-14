"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import { useTheme } from "@/contexts/ThemeContext";
import TipTapMenuBar from "./TipTapMenuBar";
import { Breadcrumb, Button, FloatButton, message } from "antd";
import {
  AudioOutlined,
  EditOutlined,
  HomeOutlined,
  LineChartOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import SpeechAnalysisDrawer from "./SpeechAnalysisDrawer";
import { Speech, SpeechVersion } from "@/types/speech";
import SpeechInfoModal from "./SpeechInfoModal";
import { speechService } from "@/services/speechService";
import { useDebounce } from "@/hooks/useDebounce";
import ComingSoonModal from "./ComingSoonModal";

interface TiptapEditorProps {
  speechId: string;
  speechData: Speech;
  version: SpeechVersion;
}

export default function TiptapEditor({
  speechId,
  speechData: initialSpeechData,
  version: initialVersion,
}: TiptapEditorProps) {
  const { theme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [speechData, setSpeechData] = useState<Speech>(initialSpeechData);
  const [saving, setSaving] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);

  const saveContent = async (content: string) => {
    if (!initialVersion?.id) return;

    setSaving(true);
    const { error } = await speechService.updateVersionContent(
      speechId,
      initialVersion.id,
      { content }
    );

    if (error) {
      messageApi.error({
        content: "Failed to save changes",
        duration: 3,
      });
    }
    setSaving(false);
  };

  const debouncedSave = useDebounce(saveContent, 2000);

  const editor = useEditor({
    extensions: [StarterKit, TextStyle, Color, FontFamily],
    content: initialVersion?.content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      debouncedSave(content);
    },
  });

  const handleSpeechUpdate = async () => {
    messageApi.success({
      content: "Changes saved",
      duration: 1,
    });
    const { data, error } = await speechService.getSpeechWithVersion(speechId);
    if (!error && data.speech) {
      setSpeechData(data.speech);
    }
  };

  return (
    <>
      {contextHolder}
      <div
        className="fixed w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 z-10 top-16"
        style={{
          backgroundColor: theme === "dark" ? "#1e1e1e" : "#ffffff",
          borderBottom:
            theme === "dark" ? "solid 1px #2d2d2d" : "solid 1px #e5e5e5",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center gap-1">
              <div>
                <Breadcrumb
                  items={[
                    {
                      href: "/dashboard",
                      title: <HomeOutlined />,
                    },
                    {
                      title: speechData.title,
                    },
                  ]}
                />
              </div>
              <div className="ml-1">
                <Button
                  style={{
                    background: theme === "dark" ? "#2d2d2d" : "#ffffff",
                    borderColor: theme === "dark" ? "#3d3d3d" : "#d9d9d9",
                    color: theme === "dark" ? "#ffffff" : "#000000",
                  }}
                  icon={<EditOutlined />}
                  onClick={() => setInfoModalOpen(true)}
                />
              </div>
            </div>
            <div
              className="mx-4"
              style={{ color: theme === "dark" ? "#999" : "#aaa" }}
            >
              |
            </div>
            <TipTapMenuBar editor={editor} />
          </div>
          <div className="flex items-center gap-2">
            {saving && (
              <span
                style={{
                  color: theme === "dark" ? "#999" : "#666",
                  fontSize: "14px",
                }}
              >
                Saving...
              </span>
            )}
            <Button
              type="primary"
              icon={<LineChartOutlined />}
              onClick={() => setDrawerOpen(true)}
              style={{
                border: "none",
                boxShadow: "none",
              }}
              className="primary-gradient"
            >
              Analyse
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-40 mb-16">
        <div
          style={{ backgroundColor: theme === "dark" ? "#2d2d2d" : "#f5f5f5" }}
          className="min-h-[900px] p-16 max-w-5xl mx-auto rounded"
        >
          <EditorContent editor={editor} />
        </div>
      </div>
      <FloatButton.Group shape="circle" style={{ insetInlineEnd: 24 }}>
        <FloatButton
          onClick={() => setIsComingSoonModalOpen(true)}
          icon={<AudioOutlined />}
          tooltip={<div>Record</div>}
        />
        <FloatButton
          onClick={() => setIsComingSoonModalOpen(true)}
          icon={<UploadOutlined />}
          tooltip={<div>Upload</div>}
        />
      </FloatButton.Group>

      <ComingSoonModal
        open={isComingSoonModalOpen}
        onClose={() => setIsComingSoonModalOpen(false)}
        featureTitle="Upload/Record a speech" // Pass the name of the feature
      />

      <SpeechAnalysisDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editor={editor}
        speechData={speechData}
      />

      <SpeechInfoModal
        open={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        speechId={speechId}
        speechData={speechData}
        onUpdate={handleSpeechUpdate}
      />
    </>
  );
}
