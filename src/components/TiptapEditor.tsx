"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import { useTheme } from "@/contexts/ThemeContext";
import TipTapMenuBar from "./TipTapMenuBar";
import { Button, Input } from "antd";
import { HomeOutlined, InfoCircleOutlined } from "@ant-design/icons";

export default function TiptapEditor() {
  const { theme } = useTheme();

  const editor = useEditor({
    extensions: [StarterKit, TextStyle, Color, FontFamily],
    content: "<p>Start writing here...</p>",
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
        <div className="flex items-center">
          <div className="">
            <div className="flex items-center gap-2">
              <HomeOutlined />
              /
              <Input
                placeholder="Speech Title"
                style={{
                  background: theme === "dark" ? "#2d2d2d" : "#ffffff",
                  borderColor: theme === "dark" ? "#3d3d3d" : "#d9d9d9",
                  color: theme === "dark" ? "#ffffff" : "#000000",
                }}
              />
              <div>
                <Button icon={<InfoCircleOutlined />} />
              </div>
            </div>
          </div>
          <div className="mx-4">|</div>
          <div className="">
            <TipTapMenuBar editor={editor} />
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
    </>
  );
}
