import React from "react";
import { Editor, Transforms, Element as SlateElement, BaseEditor } from "slate";
import { useSlate } from "slate-react";
import { HistoryEditor } from "slate-history";
import { Button, Divider, Popover } from "antd";
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  FontSizeOutlined,
} from "@ant-design/icons";
import { useTheme } from "@/contexts/ThemeContext";

// Define custom types for Slate
type CustomElement = {
  type:
    | "paragraph"
    | "heading-one"
    | "heading-two"
    | "heading-three"
    | "align-left"
    | "align-center"
    | "align-right";
  children: CustomText[];
  align?: string;
};

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
};

type BlockFormat =
  | "heading-one"
  | "heading-two"
  | "heading-three"
  | "paragraph"
  | "align-left"
  | "align-center"
  | "align-right";
type MarkFormat = "bold" | "italic" | "underline";
type Format = BlockFormat | MarkFormat;

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const isBlockFormat = (format: Format): format is BlockFormat => {
  return [
    "heading-one",
    "heading-two",
    "heading-three",
    "paragraph",
    "align-left",
    "align-center",
    "align-right",
  ].includes(format);
};

const handleFormatClick = (editor: Editor, format: Format) => {
  if (isBlockFormat(format)) {
    if (format.startsWith("align-")) {
      toggleAlign(editor, format);
    } else {
      toggleBlock(editor, format);
    }
  } else {
    toggleMark(editor, format);
  }
};

// FormatButton component for formatting controls
const FormatButton = ({
  format,
  icon,
  isBlock = false,
}: {
  format: BlockFormat | MarkFormat;
  icon: React.ReactNode;
  isBlock?: boolean;
}) => {
  const editor = useSlate();
  const { theme } = useTheme();
  const isActive = isBlock
    ? isBlockActive(editor, format as BlockFormat)
    : isMarkActive(editor, format as MarkFormat);

  return (
    <Button
      type={"default"}
      icon={icon}
      onClick={(event) => {
        event.preventDefault();
        handleFormatClick(editor, format);
      }}
      style={{
        backgroundColor: isActive
          ? theme === "dark"
            ? "#4f4f4f"
            : "#ece6f8"
          : "",
      }}
    />
  );
};

// Helper functions for formatting
const toggleBlock = (editor: Editor, format: BlockFormat) => {
  const isActive = isBlockActive(editor, format);

  Transforms.unwrapNodes(editor, {
    match: (n): n is CustomElement =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      ["align-left", "align-center", "align-right"].includes(n.type as string),
    split: true,
  });

  Transforms.setNodes<CustomElement>(
    editor,
    { type: isActive ? "paragraph" : format },
    {
      match: (n): n is CustomElement =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        Editor.isBlock(editor, n),
    }
  );
};

const toggleAlign = (editor: Editor, format: BlockFormat) => {
  const isActive = isBlockActive(editor, format);

  Transforms.unwrapNodes(editor, {
    match: (n): n is CustomElement =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      ["align-left", "align-center", "align-right"].includes(n.type as string),
    split: true,
  });

  Transforms.setNodes<CustomElement>(
    editor,
    { type: isActive ? "paragraph" : format },
    {
      match: (n): n is CustomElement =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        Editor.isBlock(editor, n),
    }
  );
};

const toggleMark = (editor: Editor, format: MarkFormat) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (editor: Editor, format: BlockFormat) => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Editor.nodes(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (n): n is CustomElement =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      (n as CustomElement).type === format,
  });

  return !!match;
};

const isMarkActive = (editor: Editor, format: MarkFormat) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

export default function SlateEditorMenu({ collapsed }: { collapsed: boolean }) {
  const { theme } = useTheme();
  const editor = useSlate();

  const AlignPopoverContent = () => {
    return (
      <div className="flex items-center justify-center gap-2">
        <FormatButton
          format="align-left"
          icon={<AlignLeftOutlined />}
          isBlock={true}
        />
        <FormatButton
          format="align-center"
          icon={<AlignCenterOutlined />}
          isBlock={true}
        />
        <FormatButton
          format="align-right"
          icon={<AlignRightOutlined />}
          isBlock={true}
        />
      </div>
    );
  };

  const HeadingPopoverContent = () => {
    return (
      <div className="flex items-center justify-center gap-2">
        <FormatButton format="heading-one" icon="H1" isBlock={true} />
        <FormatButton format="heading-two" icon="H2" isBlock={true} />
        <FormatButton format="heading-three" icon="H3" isBlock={true} />
        <FormatButton format="paragraph" icon="P" isBlock={true} />
      </div>
    );
  };

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
          className="p-2 shadow-md rounded-md"
          style={{
            backgroundColor: theme === "dark" ? "#1e1e1e" : "#ffffff",
          }}
        >
          <div className="flex items-center justify-center gap-2">
            {/* Text formatting controls */}
            <FormatButton format="bold" icon={<BoldOutlined />} />
            <FormatButton format="italic" icon={<ItalicOutlined />} />
            <FormatButton format="underline" icon={<UnderlineOutlined />} />

            <Divider type="vertical" />

            {/* Heading controls */}
            <Popover
              content={<HeadingPopoverContent />}
              trigger="click"
              placement="bottom"
            >
              <Button icon={<FontSizeOutlined />} />
            </Popover>
            <Popover
              content={<AlignPopoverContent />}
              trigger="click"
              placement="bottom"
            >
              <Button
                icon={
                  isBlockActive(editor, "align-right") ? (
                    <AlignRightOutlined />
                  ) : isBlockActive(editor, "align-center") ? (
                    <AlignCenterOutlined />
                  ) : (
                    <AlignLeftOutlined />
                  )
                }
              />
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
}
