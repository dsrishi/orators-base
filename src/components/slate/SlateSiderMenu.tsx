import { Button, Switch, Tooltip } from "antd";
import { Editor } from "slate";
import { useSlate } from "slate-react";

interface SlateSiderMenuProps {
  structuredViewOpen: boolean;
  setStructuredViewOpen: (open: boolean) => void;
}

export default function SlateSiderMenu({
  structuredViewOpen,
  setStructuredViewOpen,
}: SlateSiderMenuProps) {
  const editor = useSlate();

  const toggleStructure = (editor: Editor, structure: string) => {
    if (structure === "remove") {
      Editor.removeMark(editor, "structure");
    } else {
      Editor.addMark(editor, "structure", structure);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between px-4 pt-3 pb-3">
        <div className="text-base font-semibold">Structures</div>
        <Tooltip title="Create New Version">
          <Switch
            defaultChecked={structuredViewOpen}
            onChange={() => setStructuredViewOpen(!structuredViewOpen)}
            size="small"
          />
        </Tooltip>
      </div>
      <div className="px-4">
        <div className="text-sm text-gray-500 mb-3">Basic Structures</div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button onClick={() => toggleStructure(editor, "opening")}>
            Opening
          </Button>
          <Button onClick={() => toggleStructure(editor, "greeting")}>
            Greeting
          </Button>
          <Button onClick={() => toggleStructure(editor, "body")}>Body</Button>
          <Button onClick={() => toggleStructure(editor, "closing")}>
            Closing
          </Button>
        </div>
        <div className="text-sm text-gray-500 mb-3">Elements</div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button>Joke</Button>
          <Button>Story</Button>
          <Button>Fact</Button>
          <Button>Statistic</Button>
          <Button>Quote</Button>
          <Button>Question</Button>
          <Button>Answer</Button>
          <Button>Conclusion</Button>
        </div>
      </div>
    </div>
  );
}
