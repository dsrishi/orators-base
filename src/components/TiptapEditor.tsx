"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import { useTheme } from "@/contexts/ThemeContext";
import { Button, Select, Space, Tooltip } from "antd";
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  FontColorsOutlined,
  FontSizeOutlined,
} from "@ant-design/icons";
import type { Editor } from "@tiptap/react";

const { Option } = Select;

interface MenuBarProps {
  editor: Editor | null;
}

const MenuBar = ({ editor }: MenuBarProps) => {
  const { theme } = useTheme();

  if (!editor) {
    return null;
  }

  const selectStyles = {
    width: 150,
  };

  const selectClassName = theme === "dark" ? "dark-select" : "";

  return (
    <div
      className="flex flex-wrap gap-2 p-2 rounded max-w-5xl mx-auto"
      style={{ backgroundColor: theme === "dark" ? "#2d2d2d" : "#f5f5f5" }}
    >
      <Space.Compact>
        <Tooltip title="Bold">
          <Button
            type={editor.isActive("bold") ? "primary" : "default"}
            icon={<BoldOutlined />}
            onClick={() => editor.chain().focus().toggleBold().run()}
            style={{
              background: theme === "dark" ? "#2d2d2d" : "#ffffff",
              borderColor: theme === "dark" ? "#3d3d3d" : "#d9d9d9",
              color: theme === "dark" ? "#ffffff" : "#000000",
            }}
          />
        </Tooltip>
        <Tooltip title="Italic">
          <Button
            type={editor.isActive("italic") ? "primary" : "default"}
            icon={<ItalicOutlined />}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            style={{
              background: theme === "dark" ? "#2d2d2d" : "#ffffff",
              borderColor: theme === "dark" ? "#3d3d3d" : "#d9d9d9",
              color: theme === "dark" ? "#ffffff" : "#000000",
            }}
          />
        </Tooltip>
        <Tooltip title="Underline">
          <Button
            type={editor.isActive("underline") ? "primary" : "default"}
            icon={<UnderlineOutlined />}
            style={{
              background: theme === "dark" ? "#2d2d2d" : "#ffffff",
              borderColor: theme === "dark" ? "#3d3d3d" : "#d9d9d9",
              color: theme === "dark" ? "#ffffff" : "#000000",
            }}
          />
        </Tooltip>
      </Space.Compact>

      <Select
        className={selectClassName}
        style={selectStyles}
        defaultValue="Arial"
        onChange={(value) => editor.chain().focus().setFontFamily(value).run()}
        prefix={
          <FontSizeOutlined
            style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}
          />
        }
        popupClassName={theme === "dark" ? "dark-select-dropdown" : ""}
      >
        <Option value="Arial">Arial</Option>
        <Option value="Times New Roman">Times New Roman</Option>
        <Option value="Courier New">Courier New</Option>
      </Select>

      <Select
        className={selectClassName}
        style={selectStyles}
        defaultValue="#000000"
        onChange={(value) => editor.chain().focus().setColor(value).run()}
        prefix={
          <FontColorsOutlined
            style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}
          />
        }
        popupClassName={theme === "dark" ? "dark-select-dropdown" : ""}
      >
        <Option value="#000000">Black</Option>
        <Option value="#FF0000">Red</Option>
        <Option value="#0000FF">Blue</Option>
      </Select>
    </div>
  );
};

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
        className="fixed w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 z-10 top-16"
        style={{ backgroundColor: theme === "dark" ? "#1e1e1e" : "#ffffff" }}
      >
        <MenuBar editor={editor} />
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
