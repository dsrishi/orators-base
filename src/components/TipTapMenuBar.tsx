"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { Button, Select, Space, Tooltip, Popover, Divider } from "antd";
import {
  BoldOutlined,
  ItalicOutlined,
  StrikethroughOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  ClearOutlined,
  FontColorsOutlined,
  FontSizeOutlined,
  UndoOutlined,
  RedoOutlined,
  UnderlineOutlined,
  HighlightOutlined,
} from "@ant-design/icons";
import type { Editor } from "@tiptap/react";

const { Option } = Select;

interface MenuBarProps {
  editor: Editor | null;
}

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

const HIGHLIGHT_COLORS = [
  "#ffeb3b", // Yellow
  "#ff0000", // Red
  "#4caf50", // Green
  "#03a9f4", // Blue
  "#e91e63", // Pink
  "#ff9800", // Orange
  "#9c27b0", // Purple
  "#f5f5f5", // Light Gray
  "#90caf9", // Light Blue
  "#a5d6a7", // Light Green
  "#ffcdd2", // Light Red
];

// Add font size options
const FONT_SIZES = [
  { value: "8pt", label: "8" },
  { value: "9pt", label: "9" },
  { value: "10pt", label: "10" },
  { value: "11pt", label: "11" },
  { value: "12pt", label: "12" },
  { value: "14pt", label: "14" },
  { value: "16pt", label: "16" },
  { value: "18pt", label: "18" },
  { value: "20pt", label: "20" },
  { value: "24pt", label: "24" },
  { value: "28pt", label: "28" },
  { value: "30pt", label: "32" },
  { value: "36pt", label: "40" },
  { value: "48pt", label: "48" },
  { value: "56pt", label: "64" },
  { value: "64pt", label: "64" },
  { value: "72pt", label: "72" },
];

const TipTapMenuBar = ({ editor }: MenuBarProps) => {
  const { theme } = useTheme();

  if (!editor) {
    return null;
  }

  const selectClassName = theme === "dark" ? "dark-select" : "";

  const ColorPopover = (
    <div className="flex flex-wrap gap-2 p-2 max-w-[200px]">
      {/* Add default theme color button */}
      <Tooltip title="Default">
        <div
          className="w-6 h-6 rounded cursor-pointer hover:opacity-80 border border-gray-300 flex items-center justify-center"
          style={{
            background: "linear-gradient(45deg, #ffffff 50%, #000000 50%)",
          }}
          onClick={() => {
            // Instead of setting a color, we'll unset the color mark
            editor.chain().focus().unsetColor().run();
          }}
        >
          <span
            style={{
              color: theme === "dark" ? "#ffffff" : "#000000",
              fontSize: "10px",
              fontWeight: "bold",
              textShadow:
                theme === "dark" ? "0px 0px 2px #000" : "0px 0px 2px #fff",
            }}
          >
            Aa
          </span>
        </div>
      </Tooltip>
      {COLORS.map((color) => (
        <div
          key={color}
          className="w-6 h-6 rounded cursor-pointer hover:opacity-80 border border-gray-300"
          style={{
            backgroundColor: color,
            outline: editor.isActive({ textStyle: { color } })
              ? "2px solid #1890ff"
              : "none",
            outlineOffset: "2px",
          }}
          onClick={() => editor.chain().focus().setColor(color).run()}
        />
      ))}
    </div>
  );

  const HighlightPopover = (
    <div className="flex flex-wrap gap-2 p-2 max-w-[200px]">
      {/* Add default (no highlight) button */}
      <Tooltip title="Reset">
        <div
          className="w-6 h-6 rounded cursor-pointer hover:opacity-80 border border-gray-300 flex items-center justify-center"
          onClick={() => {
            editor.chain().focus().unsetHighlight().run();
          }}
        >
          <span
            style={{
              fontSize: "16px",
              color: theme === "dark" ? "#ffffff" : "#000000",
            }}
          >
            ✕
          </span>
        </div>
      </Tooltip>
      {HIGHLIGHT_COLORS.map((color) => (
        <div
          key={color}
          className="w-6 h-6 rounded cursor-pointer hover:opacity-80 border border-gray-300"
          style={{
            backgroundColor: color,
            outline: editor.isActive("highlight", { color })
              ? "2px solid #1890ff"
              : "none",
            outlineOffset: "2px",
          }}
          onClick={() =>
            editor.chain().focus().toggleHighlight({ color }).run()
          }
        />
      ))}
    </div>
  );

  return (
    <div className="flex flex-wrap gap-2">
      <Space.Compact>
        <Tooltip title="Bold">
          <Button
            type={editor.isActive("bold") ? "primary" : "default"}
            icon={<BoldOutlined />}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
        </Tooltip>
        <Tooltip title="Italic">
          <Button
            type={editor.isActive("italic") ? "primary" : "default"}
            icon={<ItalicOutlined />}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
        </Tooltip>
        <Tooltip title="Underline">
          <Button
            type={editor.isActive("underline") ? "primary" : "default"}
            icon={<UnderlineOutlined />}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          />
        </Tooltip>
        <Tooltip title="Strike">
          <Button
            type={editor.isActive("strike") ? "primary" : "default"}
            icon={<StrikethroughOutlined />}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          />
        </Tooltip>
      </Space.Compact>

      <Select
        className={selectClassName}
        style={{ width: 60 }}
        defaultValue="11pt"
        onChange={(value) => {
          // @ts-expect-error - setFontSize is provided by our custom extension
          editor.chain().focus().setFontSize(value).run();
        }}
        popupClassName={theme === "dark" ? "dark-select-dropdown" : ""}
      >
        {FONT_SIZES.map((size) => (
          <Option key={size.value} value={size.value}>
            {size.label}
          </Option>
        ))}
      </Select>

      <Select
        className={selectClassName}
        style={{ width: 100 }}
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

      <Popover content={ColorPopover} trigger="click" placement="bottom">
        <Tooltip title="Text Color">
          <Button
            icon={<FontColorsOutlined />}
            style={{
              color:
                editor.getAttributes("textStyle").color ||
                (theme === "dark" ? "#ffffff" : "#000000"),
            }}
          />
        </Tooltip>
      </Popover>

      <Popover content={HighlightPopover} trigger="click" placement="bottom">
        <Tooltip title="Highlight Color">
          <Button
            icon={<HighlightOutlined />}
            style={{
              color:
                editor.getAttributes("highlight").color ||
                (theme === "dark" ? "#ffffff" : "#000000"),
            }}
          />
        </Tooltip>
      </Popover>

      <Popover
        trigger="click"
        placement="bottom"
        content={
          <div className="flex gap-2">
            <Button
              type={editor.isActive("bulletList") ? "primary" : "default"}
              icon={<UnorderedListOutlined />}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            />
            <Button
              type={editor.isActive("orderedList") ? "primary" : "default"}
              icon={<OrderedListOutlined />}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            />
          </div>
        }
      >
        <Button
          icon={
            editor.isActive("orderedList") ? (
              <OrderedListOutlined />
            ) : (
              <UnorderedListOutlined />
            )
          }
        />
      </Popover>

      <Popover
        trigger="click"
        placement="bottom"
        content={
          <div className="flex gap-2">
            <Button
              type={
                editor.isActive({ textAlign: "left" }) ? "primary" : "default"
              }
              icon={<AlignLeftOutlined />}
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
            />
            <Button
              type={
                editor.isActive({ textAlign: "center" }) ? "primary" : "default"
              }
              icon={<AlignCenterOutlined />}
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
            />
            <Button
              type={
                editor.isActive({ textAlign: "right" }) ? "primary" : "default"
              }
              icon={<AlignRightOutlined />}
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
            />
          </div>
        }
      >
        <Button
          icon={
            editor.isActive({ textAlign: "center" }) ? (
              <AlignCenterOutlined />
            ) : editor.isActive({ textAlign: "right" }) ? (
              <AlignRightOutlined />
            ) : (
              <AlignLeftOutlined />
            )
          }
        />
      </Popover>

      <Divider
        type="vertical"
        style={{
          backgroundColor: theme === "dark" ? "#999" : "#aaa",
          height: "24px",
          margin: "auto 8px",
        }}
      />

      <Tooltip title="Undo">
        <Button
          icon={<UndoOutlined />}
          onClick={() => editor.chain().focus().undo().run()}
        />
      </Tooltip>

      <Tooltip title="Redo">
        <Button
          icon={<RedoOutlined />}
          onClick={() => editor.chain().focus().redo().run()}
        />
      </Tooltip>

      <Tooltip title="Clear Formatting">
        <Button
          icon={<ClearOutlined />}
          onClick={() => {
            editor.chain().focus().unsetAllMarks().run();
            editor.chain().focus().clearNodes().run();

            // Instead of setting a default color, we'll remove color styling
            editor.chain().focus().unsetColor().run();
          }}
        />
      </Tooltip>
    </div>
  );
};

export default TipTapMenuBar;
