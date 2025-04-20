// components/SlateEditor.tsx (enhanced version)
import React, { useMemo, useState } from "react";
import { createEditor, Descendant } from "slate";
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

const SlateEditor: React.FC<{
  collapsed: boolean;
  content: string;
}> = ({ collapsed, content }) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const { theme } = useTheme();

  const [value, setValue] = useState<Descendant[]>([
    {
      type: "paragraph",
      children: [{ text: content }],
    },
  ]);

  return (
    <div>
      <Slate
        editor={editor}
        initialValue={value}
        onChange={(newValue) => setValue(newValue)}
      >
        <SlateEditorMenu collapsed={collapsed} />
        <Editable
          style={{
            backgroundColor: theme === "dark" ? "#1e1e1e" : "#ffffff",
          }}
          className="min-h-[900px] lg:p-16 md:p-12 sm:p-8 p-4 rounded max-w-[1000px] mx-auto"
          placeholder="Start writing your speech here..."
          renderElement={(props) => <Element {...props} />}
          renderLeaf={(props) => <Leaf {...props} />}
        />
      </Slate>
    </div>
  );
};

export default SlateEditor;
