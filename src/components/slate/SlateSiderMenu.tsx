import { Button, Switch, Tooltip } from "antd";
import { Editor, Range, Transforms, Element as SlateElement } from "slate";
import { useSlate } from "slate-react";

interface SlateSiderMenuProps {
  structuredViewOpen: boolean;
  setStructuredViewOpen: (open: boolean) => void;
  pauseViewOpen: boolean;
  setPauseViewOpen: (open: boolean) => void;
}

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

export default function SlateSiderMenu({
  structuredViewOpen,
  setStructuredViewOpen,
  pauseViewOpen,
  setPauseViewOpen,
}: SlateSiderMenuProps) {
  const editor = useSlate();

  const toggleStructure = (editor: Editor, structure: string) => {
    if (structure === "clear") {
      Editor.removeMark(editor, "structure");
    } else {
      Editor.addMark(editor, "structure", structure);
    }
  };

  const togglePause = (editor: Editor, seconds: number) => {
    Editor.addMark(editor, "pause", seconds);
  };

  const insertPause = (seconds: number) => {
    // Save the current selection
    const selection = editor.selection;

    if (selection && Range.isCollapsed(selection)) {
      const pauseElement: CustomElement = {
        type: "pause",
        children: [{ text: `Pause-${seconds}s` }],
      };

      Transforms.insertNodes(editor, pauseElement, {
        at: [0, 0],
      });
    }
  };

  // Check if the current selection is an inline element
  const isInlineActive = () => {
    const { selection } = editor;
    if (!selection) return false;

    const [match] = Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n): n is CustomElement =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        (n as CustomElement).type === "pause",
    });

    return !!match;
  };

  return (
    <div>
      <div className="px-4 pt-3 pb-3">
        <div className="text-base font-semibold">Elements</div>
      </div>
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-500">Structures</div>
          <Tooltip title="Create New File">
            <Switch
              defaultChecked={structuredViewOpen}
              onChange={() => setStructuredViewOpen(!structuredViewOpen)}
              size="small"
            />
          </Tooltip>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button
            type="text"
            style={{ backgroundColor: "oklch(92.5% 0.084 155.995)" }}
            disabled={!structuredViewOpen}
            onClick={() => toggleStructure(editor, "opening")}
          >
            Opening
          </Button>
          <Button
            type="text"
            style={{ backgroundColor: "oklch(93.6% 0.032 17.717)" }}
            disabled={!structuredViewOpen}
            onClick={() => toggleStructure(editor, "conclusion")}
          >
            Conclusion
          </Button>
          <Button
            type="text"
            style={{ backgroundColor: "oklch(97.3% 0.071 103.193)" }}
            disabled={!structuredViewOpen}
            onClick={() => toggleStructure(editor, "body")}
          >
            Body
          </Button>
          <Button
            type="text"
            style={{ backgroundColor: "oklch(94.6% 0.033 307.174)" }}
            disabled={!structuredViewOpen}
            onClick={() => toggleStructure(editor, "transitions")}
          >
            Transitions
          </Button>
          <Button
            type="text"
            style={{ backgroundColor: "oklch(93.2% 0.032 255.585)" }}
            disabled={!structuredViewOpen}
            onClick={() => toggleStructure(editor, "greeting")}
          >
            Greeting
          </Button>
          <Button
            disabled={!structuredViewOpen}
            onClick={() => toggleStructure(editor, "clear")}
          >
            Clear
          </Button>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-500">Pauses</div>
          <Tooltip title="Create New File">
            <Switch
              defaultChecked={pauseViewOpen}
              onChange={() => setPauseViewOpen(!pauseViewOpen)}
              size="small"
            />
          </Tooltip>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button
            onClick={() => togglePause(editor, 1)}
            disabled={!pauseViewOpen}
          >
            Short Pause
          </Button>
          <Button
            onClick={() => togglePause(editor, 3)}
            disabled={!pauseViewOpen}
          >
            Long Pause
          </Button>
          <Button onClick={() => insertPause(3)} disabled={!pauseViewOpen}>
            Pause
          </Button>
          <Button
            onClick={() => {
              console.log(isInlineActive());
            }}
            disabled={!pauseViewOpen}
          >
            Pause
          </Button>
        </div>

        <div className="text-sm text-gray-500 mb-3">Elements</div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button disabled={!structuredViewOpen}>Joke</Button>
          <Button disabled={!structuredViewOpen}>Story</Button>
          <Button disabled={!structuredViewOpen}>Fact</Button>
          <Button disabled={!structuredViewOpen}>Statistic</Button>
          <Button disabled={!structuredViewOpen}>Quote</Button>
          <Button disabled={!structuredViewOpen}>Question</Button>
          <Button disabled={!structuredViewOpen}>Answer</Button>
          <Button disabled={!structuredViewOpen}>Conclusion</Button>
        </div>
      </div>
    </div>
  );
}
