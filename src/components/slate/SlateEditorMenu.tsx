import React from "react";
import { Editor, Transforms, Element as SlateElement, BaseEditor } from "slate";
import { useSlate } from "slate-react";
import { HistoryEditor } from "slate-history";
import { Button, Divider, Popover, Tooltip } from "antd";
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  FontSizeOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  UndoOutlined,
  RedoOutlined,
  FontColorsOutlined,
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
    | "align-right"
    | "ordered-list"
    | "bullet-list"
    | "list-item";
  children: CustomText[];
  align?: string;
};

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  highlight?: boolean;
  color?: string;
};

type BlockFormat =
  | "heading-one"
  | "heading-two"
  | "heading-three"
  | "paragraph"
  | "align-left"
  | "align-center"
  | "align-right"
  | "ordered-list"
  | "bullet-list";
type MarkFormat = "bold" | "italic" | "underline" | "highlight" | "color";
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
    "ordered-list",
    "bullet-list",
  ].includes(format);
};

const handleFormatClick = (editor: Editor, format: Format) => {
  if (isBlockFormat(format)) {
    if (format.startsWith("align-")) {
      toggleAlign(editor, format);
    } else if (format === "ordered-list" || format === "bullet-list") {
      toggleList(editor, format);
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

const toggleList = (editor: Editor, format: "ordered-list" | "bullet-list") => {
  const isActive = isBlockActive(editor, format);

  console.log(format);

  Transforms.unwrapNodes(editor, {
    match: (n): n is CustomElement =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      ["ordered-list", "bullet-list"].includes(n.type as string),
    split: true,
  });

  Transforms.setNodes<CustomElement>(
    editor,
    { type: isActive ? "paragraph" : "list-item" },
    {
      match: (n): n is CustomElement =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        Editor.isBlock(editor, n),
    }
  );

  if (!isActive) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleColor = (editor: Editor, color: string) => {
  const isActive = isMarkActive(editor, "color");
  const currentColor = Editor.marks(editor)?.color;

  console.log(currentColor);

  if (color === "default") {
    console.log("default");

    Editor.removeMark(editor, "color");
  } else if (isActive && currentColor === color) {
    Editor.removeMark(editor, "color");
  } else {
    Editor.addMark(editor, "color", color);
  }
};

const getColorMark = (editor: Editor) => {
  const marks = Editor.marks(editor);
  return marks?.color || "#000000";
};

const ColorPopoverContent = () => {
  const editor = useSlate();
  const currentColor = getColorMark(editor);

  const COLORS = [
    "#000000", // Black
    "#ffffff", // White
    "#ff0000", // Red
    "#00ff00", // Green
    "#0000ff", // Blue
    "#ffff00", // Yellow
    "#00ffff", // Cyan
    "#ff00ff", // Magenta
    "#c0c0c0", // Silver
    "#808080", // Gray
  ];

  return (
    <>
      <div className="flex flex-wrap gap-2 p-2 max-w-[200px]">
        {/* Add default theme color button */}
        <Tooltip title="Default">
          <div
            className="w-6 h-6 rounded cursor-pointer hover:opacity-80 border border-gray-300 flex items-center justify-center"
            onClick={() => toggleColor(editor, "default")}
          >
            X
          </div>
        </Tooltip>
        {COLORS.map((color) => (
          <div
            key={color}
            className="w-6 h-6 rounded cursor-pointer hover:opacity-80 border border-gray-300"
            style={{
              backgroundColor: color,
              outlineOffset: "2px",
              outline:
                currentColor === color
                  ? "2px solid oklch(62.7% 0.265 303.9)"
                  : "none",
            }}
            onClick={() => toggleColor(editor, color)}
          />
        ))}
      </div>
    </>
  );
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

  const ListPopoverContent = () => {
    return (
      <div className="flex items-center justify-center gap-2">
        <FormatButton
          format="bullet-list"
          icon={<UnorderedListOutlined />}
          isBlock={true}
        />
        <FormatButton
          format="ordered-list"
          icon={<OrderedListOutlined />}
          isBlock={true}
        />
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
          style={{ backgroundColor: theme === "dark" ? "#1e1e1e" : "#ffffff" }}
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

            <Popover
              content={<ColorPopoverContent />}
              trigger="click"
              placement="bottom"
            >
              <Button
                icon={<FontColorsOutlined />}
                style={{
                  backgroundColor: isMarkActive(editor, "color")
                    ? theme === "dark"
                      ? "#4f4f4f"
                      : "#ece6f8"
                    : "",
                }}
              />
            </Popover>

            <Popover
              content={<ListPopoverContent />}
              trigger="click"
              placement="bottom"
            >
              <Button icon={<UnorderedListOutlined />} />
            </Popover>

            <Divider type="vertical" />

            {/* Undo/Redo */}
            <Button
              icon={<UndoOutlined />}
              onClick={(event) => {
                event.preventDefault();
                editor.undo();
              }}
              disabled={!editor.history.undos.length}
            />
            <Button
              icon={<RedoOutlined />}
              onClick={(event) => {
                event.preventDefault();
                editor.redo();
              }}
              disabled={!editor.history.redos.length}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
