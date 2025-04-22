// components/SlateEditor.tsx (enhanced version)
import React, { useEffect, useMemo, useState } from "react";
import { createEditor, Descendant, Editor } from "slate";
import { Slate, Editable, withReact } from "slate-react";
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
  color?: string;
};

type SlateTextEditorProps = {
  collapsed: boolean;
  content: string;
  onSave?: (content: string) => void;
  isRecordingModalOpen: boolean;
  setIsRecordingModalOpen: (open: boolean) => void;
};

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
    renderedChildren = <mark>{renderedChildren}</mark>;
  }

  if (leaf.color) {
    renderedChildren = (
      <span style={{ color: leaf.color }}>{renderedChildren}</span>
    );
  }

  return <span {...attributes}>{renderedChildren}</span>;
};

const SlateEditor: React.FC<SlateTextEditorProps> = ({
  collapsed,
  content,
  onSave,
  isRecordingModalOpen,
  setIsRecordingModalOpen,
}) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const { theme } = useTheme();

  const [value, setValue] = useState<Descendant[]>(JSON.parse(content));
  const [canSave, setCanSave] = useState(false);

  const handleSave = () => {
    const contentString = JSON.stringify(value);
    if (onSave) {
      onSave(contentString);
    }
    // Optionally also save to localStorage as a backup
    localStorage.setItem("slate-content", contentString);
  };

  useEffect(() => {
    if (canSave) {
      handleSave();
    } else {
      setCanSave(true);
    }
  }, [value]);

  // Function to handle adding content from the speech modal
  const handleAddSpeechContent = (content: string) => {
    if (content) {
      // Store current selection - in case it changes during API call
      const currentSelection = editor.selection;

      if (currentSelection) {
        console.log("selection");
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
        <Slate
          editor={editor}
          initialValue={value}
          onChange={(newValue) => setValue(newValue)}
        >
          <SlateEditorMenu collapsed={collapsed} />
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
        </Slate>
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
