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
        <div className="grid grid-cols-2 gap-2">
          <Button
            disabled={!structuredViewOpen}
            onClick={() => toggleStructure(editor, "opening")}
          >
            Opening
          </Button>
          <Button
            disabled={!structuredViewOpen}
            onClick={() => toggleStructure(editor, "conclusion")}
          >
            Conclusion
          </Button>
          <Button
            disabled={!structuredViewOpen}
            onClick={() => toggleStructure(editor, "greeting")}
          >
            Greeting
          </Button>
          <Button
            disabled={!structuredViewOpen}
            onClick={() => toggleStructure(editor, "body")}
          >
            Body
          </Button>
        </div>
        <Button
          className="w-full mb-4 mt-2"
          disabled={!structuredViewOpen}
          onClick={() => toggleStructure(editor, "remove")}
        >
          Remove
        </Button>

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
