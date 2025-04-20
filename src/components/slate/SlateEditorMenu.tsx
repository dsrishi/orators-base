import { useTheme } from "@/contexts/ThemeContext";
import React from "react";
import { Editor, Transforms, Element as SlateElement } from "slate";
import { useSlate } from "slate-react";

// Define the TypeScript types (same as before)
type CustomElement = {
  type: "paragraph" | "heading-one" | "heading-two";
  children: CustomText[];
};
type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

import { BaseEditor } from "slate";
import { ReactEditor } from "slate-react";
import { HistoryEditor } from "slate-history";
import { Button } from "antd";
import {
  BoldOutlined,
  ItalicOutlined,
  StrikethroughOutlined,
  UnderlineOutlined,
} from "@ant-design/icons";

// Define button component for formatting controls
const FormatButton = ({
  format,
  icon,
  isBlock = false,
}: {
  format: "bold" | "italic" | "underline" | "strikethrough";
  icon: React.ReactNode;
  isBlock?: boolean;
}) => {
  const editor = useSlate();

  const isActive = isBlock
    ? isBlockActive(editor, format as "heading-one" | "heading-two")
    : isMarkActive(editor, format as "bold" | "italic" | "underline");

  return (
    <Button
      type={isActive ? "primary" : "default"}
      onMouseDown={(event) => {
        event.preventDefault();
        if (isBlock) {
          toggleBlock(editor, format as "heading-one" | "heading-two");
        } else {
          toggleMark(editor, format as "bold" | "italic" | "underline");
        }
      }}
      icon={icon}
    />
  );
};

// Helper functions for formatting
const toggleBlock = (editor: Editor, format: "heading-one" | "heading-two") => {
  const isActive = isBlockActive(editor, format);
  const newProperties: Partial<SlateElement> = {
    type: isActive ? "paragraph" : format,
  };
  Transforms.setNodes(editor, newProperties);
};

const toggleMark = (
  editor: Editor,
  format: "bold" | "italic" | "underline"
) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (
  editor: Editor,
  format: "heading-one" | "heading-two"
) => {
  const [match] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
  });
  return !!match;
};

const isMarkActive = (
  editor: Editor,
  format: "bold" | "italic" | "underline"
) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

export default function SlateEditorMenu({ collapsed }: { collapsed: boolean }) {
  const { theme } = useTheme();

  return (
    <div
      className="fixed mx-auto px-3 py-1 z-10 top-[64px]"
      style={{
        width: collapsed ? "100%" : "calc(100% - 280px)",
        transition: "width 0.2s",
      }}
    >
      <div className="flex items-center justify-center">
        <div
          className="p-3 shadow-md rounded-md"
          style={{
            backgroundColor: theme === "dark" ? "#1e1e1e" : "#ffffff",
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <FormatButton format="bold" icon={<BoldOutlined />} />
            <FormatButton format="italic" icon={<ItalicOutlined />} />
            <FormatButton format="underline" icon={<UnderlineOutlined />} />
            <FormatButton
              format="strikethrough"
              icon={<StrikethroughOutlined />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
