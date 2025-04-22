// components/SlateEditor.tsx (enhanced version)
import React, { useMemo } from "react";
import { createEditor, Editor } from "slate";
import { Editable, withReact } from "slate-react";
import { withHistory } from "slate-history";
import { RenderElementProps } from "slate-react";
import { useTheme } from "@/contexts/ThemeContext";
import SlateEditorMenu from "./SlateEditorMenu";
import { Transforms } from "slate";
import { Range } from "slate";
import SpeechRecordingModal from "../SpeechRecordingModal";

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  highlight?: boolean;
  highlightColor?: string;
  structure?: string;
  color?: string;
};

type SlateTextEditorProps = {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  isRecordingModalOpen: boolean;
  setIsRecordingModalOpen: (open: boolean) => void;
  structuredViewOpen: boolean;
  setCollapsedMenu: (collapsed: Tab) => void;
};

type Tab = "versions" | "chat" | "templates" | "editor";

const SlateEditor: React.FC<SlateTextEditorProps> = ({
  collapsed,
  setCollapsed,
  isRecordingModalOpen,
  setIsRecordingModalOpen,
  structuredViewOpen,
  setCollapsedMenu,
}) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const { theme } = useTheme();

  // Custom element renderer
  const Element = ({ attributes, children, element }: RenderElementProps) => {
    const style = element.align
      ? { textAlign: element.align as "left" | "center" | "right" }
      : {};

    switch (element.type) {
      case "heading-one":
        return (
          <h1 {...attributes} style={style} className="text-2xl font-bold">
            {children}
          </h1>
        );
      case "heading-two":
        return (
          <h2 {...attributes} style={style} className="text-xl font-bold">
            {children}
          </h2>
        );
      case "heading-three":
        return (
          <h3 {...attributes} style={style} className="text-lg font-bold">
            {children}
          </h3>
        );
      case "ordered-list":
        return (
          <ol {...attributes} style={style}>
            {children}
          </ol>
        );
      case "bullet-list":
        return (
          <ul {...attributes} style={style}>
            {children}
          </ul>
        );
      case "list-item":
        return <li {...attributes}>{children}</li>;
      default:
        return (
          <p {...attributes} style={style}>
            {children}
          </p>
        );
    }
  };

  const getStructureColor = (structure: string) => {
    if (structure === "opening") {
      return "oklch(92.5% 0.084 155.995)";
    } else if (structure === "conclusion") {
      return "oklch(93.6% 0.032 17.717)";
    } else if (structure === "body") {
      return "oklch(97.3% 0.071 103.193)";
    } else if (structure === "transitions") {
      return "oklch(94.6% 0.033 307.174)";
    } else if (structure === "greeting") {
      return "oklch(93.2% 0.032 255.585)";
    } else {
      return "transparent";
    }
  };

  // Custom leaf renderer
  const Leaf = ({
    attributes,
    children,
    leaf,
  }: {
    attributes: React.HTMLAttributes<HTMLSpanElement> & {
      "data-slate-leaf": boolean;
    };
    children: React.ReactNode;
    leaf: CustomText;
  }) => {
    let renderedChildren = children;

    if (leaf.bold) {
      renderedChildren = <strong>{renderedChildren}</strong>;
    }

    if (leaf.italic) {
      renderedChildren = <em>{renderedChildren}</em>;
    }

    if (leaf.underline) {
      renderedChildren = <u>{renderedChildren}</u>;
    }

    if (leaf.highlight) {
      renderedChildren = (
        <mark style={{ backgroundColor: leaf.highlightColor || "#ffff00" }}>
          {renderedChildren}
        </mark>
      );
    }

    if (leaf.color) {
      renderedChildren = (
        <span style={{ color: leaf.color }}>{renderedChildren}</span>
      );
    }

    if (leaf.structure) {
      renderedChildren = (
        <span
          id="structure"
          style={{
            backgroundColor: structuredViewOpen
              ? getStructureColor(leaf.structure)
              : "transparent",
            display: structuredViewOpen ? "block" : "inline",
            padding: structuredViewOpen ? "8px" : "0px",
          }}
        >
          <span>{renderedChildren}</span>
        </span>
      );
    }

    return <span {...attributes}>{renderedChildren}</span>;
  };

  // Function to handle adding content from the speech modal
  const handleAddSpeechContent = (content: string) => {
    if (content) {
      // Store current selection - in case it changes during API call
      const currentSelection = editor.selection;

      if (currentSelection) {
        // Restore selection if needed
        Transforms.select(editor, currentSelection);

        // Delete any selected text
        if (Range.isExpanded(currentSelection)) {
          Transforms.delete(editor);
        }

        // Insert the fetched text
        Transforms.insertText(editor, content);
      } else {
        // Find the last text node's path
        // Set selection to document end if no selection exists
        const end = Editor.end(editor, []);
        Transforms.select(editor, end);
        Transforms.insertText(editor, content);
      }
    }
  };

  return (
    <>
      <div>
        <SlateEditorMenu
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          setCollapsedMenu={setCollapsedMenu}
        />
        <div
          className="lg:p-16 md:p-12 sm:p-8 p-4 rounded max-w-[1000px] mx-auto slate"
          style={{
            backgroundColor: theme === "dark" ? "#1e1e1e" : "#ffffff",
          }}
        >
          <Editable
            style={{
              minHeight: "900px",
              outline: "none",
            }}
            placeholder="Start writing your speech here..."
            renderElement={(props) => <Element {...props} />}
            renderLeaf={(props) => <Leaf {...props} />}
            readOnly={false}
          />
        </div>
      </div>

      <SpeechRecordingModal
        open={isRecordingModalOpen}
        onClose={() => setIsRecordingModalOpen(false)}
        onAddContent={handleAddSpeechContent}
      />
    </>
  );
};

export default SlateEditor;
