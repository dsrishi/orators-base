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

const TipTapMenuBar = ({ editor }: MenuBarProps) => {
  const { theme } = useTheme();

  if (!editor) {
    return null;
  }

  const selectStyles = {
    width: 150,
  };

  const selectClassName = theme === "dark" ? "dark-select" : "";

  const ColorPopover = (
    <div className="flex flex-wrap gap-2 p-2 max-w-[200px]">
      {/* Add default theme color button */}
      <Tooltip title="Default (inherit theme color)">
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

      <Popover
        content={ColorPopover}
        trigger="click"
        placement="bottom"
        title="Text Color"
      >
        <Tooltip title="Text Color">
          <Button
            icon={<FontColorsOutlined />}
            style={{
              borderBottom: "2px solid",
              borderBottomColor:
                editor.getAttributes("textStyle").color ||
                (theme === "dark" ? "#ffffff" : "#000000"),
              color:
                editor.getAttributes("textStyle").color ||
                (theme === "dark" ? "#ffffff" : "#000000"),
            }}
          />
        </Tooltip>
      </Popover>

      <Divider
        type="vertical"
        style={{
          backgroundColor: theme === "dark" ? "#999" : "#aaa",
          height: "24px",
          margin: "auto 8px",
        }}
      />

      <Tooltip title="Bullet List">
        <Button
          type={editor.isActive("bulletList") ? "primary" : "default"}
          icon={<UnorderedListOutlined />}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
      </Tooltip>

      <Tooltip title="Ordered List">
        <Button
          type={editor.isActive("orderedList") ? "primary" : "default"}
          icon={<OrderedListOutlined />}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
      </Tooltip>

      <Divider
        type="vertical"
        style={{
          backgroundColor: theme === "dark" ? "#999" : "#aaa",
          height: "24px",
          margin: "auto 8px",
        }}
      />

      <Tooltip title="Align Left">
        <Button
          type={editor.isActive({ textAlign: "left" }) ? "primary" : "default"}
          icon={<AlignLeftOutlined />}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        />
      </Tooltip>

      <Tooltip title="Align Center">
        <Button
          type={
            editor.isActive({ textAlign: "center" }) ? "primary" : "default"
          }
          icon={<AlignCenterOutlined />}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        />
      </Tooltip>

      <Tooltip title="Align Right">
        <Button
          type={editor.isActive({ textAlign: "right" }) ? "primary" : "default"}
          icon={<AlignRightOutlined />}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        />
      </Tooltip>

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

      <Divider
        type="vertical"
        style={{
          backgroundColor: theme === "dark" ? "#999" : "#aaa",
          height: "24px",
          margin: "auto 8px",
        }}
      />

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
