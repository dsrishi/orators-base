// components/SlateEditor.tsx (enhanced version)
import React, { useEffect, useMemo, useState } from "react";
import { createEditor, Descendant, Editor } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { withHistory } from "slate-history";
import { RenderElementProps } from "slate-react";

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

type SlateTextEditorProps = {
  collapsed: boolean;
  content: string;
  onSave?: (content: string) => void;
  isRecordingModalOpen: boolean;
  setIsRecordingModalOpen: (open: boolean) => void;
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
import { useTheme } from "@/contexts/ThemeContext";
import SlateEditorMenu from "./SlateEditorMenu";
import { Transforms } from "slate";
import { Range } from "slate";
import SpeechRecordingModal from "../SpeechRecordingModal";

// Custom element renderer
const Element = ({ attributes, children, element }: RenderElementProps) => {
  switch (element.type) {
    case "heading-one":
      return (
        <h1 {...attributes} className="text-2xl font-bold">
          {children}
        </h1>
      );
    case "heading-two":
      return (
        <h2 {...attributes} className="text-xl font-bold">
          {children}
        </h2>
      );
    default:
      return <p {...attributes}>{children}</p>;
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
        console.log("no selection");
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
            className="lg:p-16 md:p-12 sm:p-8 p-4 rounded max-w-[1000px] mx-auto"
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
