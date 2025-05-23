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
  HighlightOutlined,
  MenuOutlined,
  GroupOutlined,
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
    | "align-justify"
    | "ordered-list"
    | "bullet-list"
    | "list-item"
    | "pause";
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
  highlightColor?: string;
  color?: string;
  structure?: string;
  pause?: string;
};

type BlockFormat =
  | "heading-one"
  | "heading-two"
  | "heading-three"
  | "paragraph"
  | "align-left"
  | "align-center"
  | "align-right"
  | "align-justify"
  | "ordered-list"
  | "bullet-list"
  | "pause";
type MarkFormat =
  | "bold"
  | "italic"
  | "underline"
  | "highlight"
  | "color"
  | "highlightColor"
  | "structure"
  | "pause";
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
    "align-justify",
    "ordered-list",
    "bullet-list",
    "pause",
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
  // Extract the alignment value from the format
  const alignValue = format.split("-")[1] as
    | "left"
    | "center"
    | "right"
    | "justify";

  // Check if this alignment is already active
  const isActive = isAlignActive(editor, alignValue);

  // Apply the alignment as a property rather than changing the block type
  Transforms.setNodes<CustomElement>(
    editor,
    {
      align: isActive ? undefined : alignValue,
    },
    {
      match: (n): n is CustomElement =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        Editor.isBlock(editor, n),
    }
  );
};

// Add a function to check if an alignment is active
const isAlignActive = (editor: Editor, align: string) => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Editor.nodes(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (n): n is CustomElement =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      (n as CustomElement).align === align,
  });

  return !!match;
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
  // If it's an alignment format, use isAlignActive instead
  if (format.startsWith("align-")) {
    const alignValue = format.split("-")[1] as
      | "left"
      | "center"
      | "right"
      | "justify";
    return isAlignActive(editor, alignValue);
  }

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

const toggleHighlightColor = (editor: Editor, color: string) => {
  const isActive = isMarkActive(editor, "highlight");
  const currentColor = Editor.marks(editor)?.highlightColor;

  if (color === "default") {
    Editor.removeMark(editor, "highlightColor");
    if (!isActive) {
      Editor.addMark(editor, "highlight", true);
    }
  } else if (isActive && currentColor === color) {
    Editor.removeMark(editor, "highlight");
    Editor.removeMark(editor, "highlightColor");
  } else {
    Editor.addMark(editor, "highlight", true);
    Editor.addMark(editor, "highlightColor", color);
  }
};

const getHighlightColorMark = (editor: Editor) => {
  const marks = Editor.marks(editor);
  return marks?.highlightColor || "";
};

const HighlightColorPopoverContent = () => {
  const editor = useSlate();
  const currentColor = getHighlightColorMark(editor);
  const isHighlightActive = isMarkActive(editor, "highlight");

  const HIGHLIGHT_COLORS = [
    "#ffff00", // Yellow (default)
    "#90ee90", // Light green
    "#add8e6", // Light blue
    "#ffb6c1", // Light pink
    "#d8bfd8", // Thistle
    "#ffa500", // Orange
    "#ff7f50", // Coral
    "#00ffff", // Cyan
  ];

  return (
    <>
      <div className="flex flex-wrap gap-2 p-2 max-w-[200px]">
        {/* Remove highlight button */}
        <Tooltip title="Remove Highlight">
          <div
            className="w-6 h-6 rounded cursor-pointer hover:opacity-80 border border-gray-300 flex items-center justify-center"
            onClick={() => {
              Editor.removeMark(editor, "highlight");
              Editor.removeMark(editor, "highlightColor");
            }}
          >
            X
          </div>
        </Tooltip>

        {/* Other color options */}
        {HIGHLIGHT_COLORS.map((color) => (
          <div
            key={color}
            className="w-6 h-6 rounded cursor-pointer hover:opacity-80 border border-gray-300"
            style={{
              backgroundColor: color,
              outlineOffset: "2px",
              outline:
                isHighlightActive && currentColor === color
                  ? "2px solid oklch(62.7% 0.265 303.9)"
                  : "none",
            }}
            onClick={() => toggleHighlightColor(editor, color)}
          />
        ))}
      </div>
    </>
  );
};

const toggleColor = (editor: Editor, color: string) => {
  const isActive = isMarkActive(editor, "color");
  const currentColor = Editor.marks(editor)?.color;

  if (color === "default") {
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

type Tab = "files" | "templates" | "editor";

export default function SlateEditorMenu({
  collapsed,
  setCollapsed,
  setCollapsedMenu,
  chatCollapsed,
  setChatCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  setCollapsedMenu: (collapsed: Tab) => void;
  chatCollapsed: boolean;
  setChatCollapsed: (collapsed: boolean) => void;
}) {
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
        <FormatButton
          format="align-justify"
          icon={<MenuOutlined />}
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

  const handleEditorClick = () => {
    if (collapsed) {
      setCollapsed(false);
      setChatCollapsed(true);
    }
    setCollapsedMenu("editor");
    const url = new URL(window.location.href);
    url.searchParams.set("sideMenu", "editor");
    window.history.pushState({}, "", url);
  };

  return (
    <div
      className={`fixed mx-auto px-3 py-1 z-10 top-[64px] ${
        !collapsed
          ? "lg:w-[calc(100vw-280px)] w-full"
          : !chatCollapsed
          ? "lg:w-[calc(2*100vw/3)] w-full"
          : "w-full"
      }`}
      style={{
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
              content={<ColorPopoverContent />}
              trigger="click"
              placement="bottom"
            >
              <Button
                icon={
                  <FontColorsOutlined
                    style={{
                      color: getColorMark(editor) || "",
                    }}
                  />
                }
              />
            </Popover>

            <Popover
              content={<HighlightColorPopoverContent />}
              trigger="click"
              placement="bottom"
            >
              <Button
                icon={
                  <HighlightOutlined
                    style={{
                      color: getHighlightColorMark(editor) || "",
                    }}
                  />
                }
              />
            </Popover>

            <Popover
              content={<ListPopoverContent />}
              trigger="click"
              placement="bottom"
            >
              <Button icon={<UnorderedListOutlined />} />
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
                  ) : isBlockActive(editor, "align-justify") ? (
                    <MenuOutlined />
                  ) : (
                    <AlignLeftOutlined />
                  )
                }
              />
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

            <Divider type="vertical" />
            <Button icon={<GroupOutlined />} onClick={handleEditorClick} />
          </div>
        </div>
      </div>
    </div>
  );
}
