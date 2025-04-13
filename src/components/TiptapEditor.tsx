"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import { useTheme } from "@/contexts/ThemeContext";
import TipTapMenuBar from "./TipTapMenuBar";
import { Button, FloatButton, Input } from "antd";
import {
  HomeOutlined,
  InfoCircleOutlined,
  LineChartOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useState } from "react";
import SpeechAnalysisDrawer from "./SpeechAnalysisDrawer";
import AddSpeechInfoModal from "./AddSpeechInfoModal";
import { Speech } from "@/types/speech";

interface TiptapEditorProps {
  speechId: string;
  initialContent: string;
  speechData: Speech;
}

export default function TiptapEditor({
  speechId,
  initialContent,
  speechData,
}: TiptapEditorProps) {
  const { theme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, TextStyle, Color, FontFamily],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
      },
    },
  });

  return (
    <>
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
              <Link href="/dashboard">
                <Button
                  size="small"
                  type="text"
                  icon={
                    <HomeOutlined
                      style={{
                        color: theme === "dark" ? "#999" : "#aaa",
                      }}
                    />
                  }
                />
              </Link>
              <div
                className="mr-1"
                style={{ color: theme === "dark" ? "#999" : "#aaa" }}
              >
                /
              </div>
              <Input
                placeholder="Speech Title"
                style={{
                  background: theme === "dark" ? "#2d2d2d" : "#ffffff",
                  borderColor: theme === "dark" ? "#3d3d3d" : "#d9d9d9",
                  color: theme === "dark" ? "#ffffff" : "#000000",
                }}
              />
              <div className="ml-1">
                <Button
                  style={{
                    background: theme === "dark" ? "#2d2d2d" : "#ffffff",
                    borderColor: theme === "dark" ? "#3d3d3d" : "#d9d9d9",
                    color: theme === "dark" ? "#ffffff" : "#000000",
                  }}
                  icon={<InfoCircleOutlined />}
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
          <Button
            type="primary"
            icon={<LineChartOutlined />}
            onClick={() => setDrawerOpen(true)}
            style={{
              background: "linear-gradient(to right, #5f0f40, #310e68)",
              border: "none",
              boxShadow: "none",
            }}
          >
            Analyse
          </Button>
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
      <FloatButton icon={<UploadOutlined />} />

      <SpeechAnalysisDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editor={editor}
      />

      <AddSpeechInfoModal
        open={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
      />
    </>
  );
}
