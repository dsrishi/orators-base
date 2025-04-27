// components/SlateEditor.tsx (enhanced file)
import React, { useMemo } from "react";
import { BaseEditor, createEditor, Editor, Transforms } from "slate";
import { Editable, withReact, useSlateStatic, ReactEditor } from "slate-react";
import { HistoryEditor, withHistory } from "slate-history";
import { RenderElementProps } from "slate-react";
import { useTheme } from "@/contexts/ThemeContext";
import SlateEditorMenu from "./SlateEditorMenu";
import { Range } from "slate";
import SpeechRecordingModal from "../SpeechRecordingModal";
import { CloseCircleFilled } from "@ant-design/icons";

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  highlight?: boolean;
  highlightColor?: string;
  structure?: string;
  pause?: string;
  color?: string;
};

type SlateTextEditorProps = {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  isRecordingModalOpen: boolean;
  setIsRecordingModalOpen: (open: boolean) => void;
  structuredViewOpen: boolean;
  setCollapsedMenu: (collapsed: Tab) => void;
  pauseViewOpen: boolean;
};

type CustomEditor = BaseEditor &
  ReactEditor &
  HistoryEditor & {
    nodeToDecorations?: Map<Element, Range[]>;
  };

type Tab = "files" | "templates" | "editor";

const SlateEditor: React.FC<SlateTextEditorProps> = ({
  collapsed,
  setCollapsed,
  isRecordingModalOpen,
  setIsRecordingModalOpen,
  structuredViewOpen,
  setCollapsedMenu,
  pauseViewOpen,
}) => {
  const withInlines = (editor: CustomEditor) => {
    const { isInline, isVoid } = editor;

    editor.isInline = (element) => {
      return element.type === "pause" ? true : isInline(element);
    };

    // Pause elements might need to be void elements
    editor.isVoid = (element) => {
      return element.type === "pause" ? true : isVoid(element);
    };

    return editor;
  };
  const editor = useMemo(
    () => withInlines(withHistory(withReact(createEditor()))),
    []
  );
  const { theme } = useTheme();

  // Custom element renderer
  const Element = ({ attributes, children, element }: RenderElementProps) => {
    const style = element.align
      ? { textAlign: element.align as "left" | "center" | "right" }
      : {};

    const editor = useSlateStatic();

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
      case "pause":
        return (
          <span
            {...attributes}
            contentEditable={false}
            style={{
              display: "inline", // Force inline display
              ...style,
            }}
          >
            <span
              style={{
                display: pauseViewOpen ? "inline" : "none",
                background: "#000",
                color: "#fff",
                borderRadius: "4px",
                padding: "0 4px",
                fontSize: "0.9em",
              }}
            >
              {children}
              <span
                style={{
                  marginLeft: "4px",
                  cursor: "pointer",
                  color: "#aaa",
                }}
                onClick={(event) => {
                  event.preventDefault();
                  try {
                    const path = ReactEditor.findPath(
                      editor as unknown as ReactEditor,
                      element
                    );
                    Transforms.removeNodes(editor, { at: path });
                  } catch {
                    // ignore
                  }
                }}
                title="Click to remove pause"
              >
                <CloseCircleFilled />
              </span>
            </span>
          </span>
        );
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
          style={{
            backgroundColor: structuredViewOpen
              ? getStructureColor(leaf.structure)
              : "transparent",
          }}
        >
          <span>{renderedChildren}</span>
        </span>
      );
    }

    if (leaf.pause) {
      renderedChildren = (
        <span
          style={{
            backgroundColor: "#000",
            color: "#fff",
            borderRadius: "4px",
            padding: "0 4px",
            fontSize: "0.9em",
          }}
          contentEditable={false}
        >
          <span>Pause: {leaf.pause || "0s"}</span>
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
