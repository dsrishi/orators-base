import { Drawer } from "antd";
import { useTheme } from "@/contexts/ThemeContext";
import { Editor } from "@tiptap/react";

interface SpeechAnalysisDrawerProps {
  open: boolean;
  onClose: () => void;
  editor: Editor | null;
}

export default function SpeechAnalysisDrawer({
  open,
  onClose,
  editor,
}: SpeechAnalysisDrawerProps) {
  const { theme } = useTheme();

  return (
    <Drawer
      title="Speech Analysis"
      placement="right"
      width={900}
      onClose={onClose}
      open={open}
      styles={{
        header: {
          background: theme === "dark" ? "#1e1e1e" : "#ffffff",
          color: theme === "dark" ? "#ffffff" : "#000000",
          borderBottom:
            theme === "dark" ? "1px solid #2d2d2d" : "1px solid #f0f0f0",
        },
        body: {
          background: theme === "dark" ? "#1e1e1e" : "#ffffff",
          color: theme === "dark" ? "#ffffff" : "#000000",
          padding: "24px",
        },
        mask: {
          background: "rgba(0, 0, 0, 0.45)",
        },
        wrapper: {
          background: theme === "dark" ? "#1e1e1e" : "#ffffff",
        },
        footer: {
          background: theme === "dark" ? "#1e1e1e" : "#ffffff",
          borderTop:
            theme === "dark" ? "1px solid #2d2d2d" : "1px solid #f0f0f0",
        },
      }}
    >
      <div className="flex flex-col gap-6">
        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: theme === "dark" ? "#2d2d2d" : "#f5f5f5",
          }}
        >
          <h3 className="text-xl font-semibold mb-4">Speech Statistics</h3>
          <div className="space-y-3">
            <p className="text-base">
              Word Count: {editor?.storage?.characterCount?.words() || 0}
            </p>
            <p className="text-base">
              Character Count:{" "}
              {editor?.storage?.characterCount?.characters() || 0}
            </p>
            <p className="text-base">
              Estimated Duration:{" "}
              {Math.ceil((editor?.storage?.characterCount?.words() || 0) / 130)}{" "}
              minutes
            </p>
          </div>
        </div>

        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: theme === "dark" ? "#2d2d2d" : "#f5f5f5",
          }}
        >
          <h3 className="text-xl font-semibold mb-4">Key Metrics</h3>
          <div className="space-y-3">
            <p className="text-base">Complexity Score: Calculating...</p>
            <p className="text-base">Engagement Level: Analyzing...</p>
            <p className="text-base">Clarity Index: Processing...</p>
          </div>
        </div>

        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: theme === "dark" ? "#2d2d2d" : "#f5f5f5",
          }}
        >
          <h3 className="text-xl font-semibold mb-4">Suggestions</h3>
          <div className="space-y-3">
            <p className="text-base">
              Analyzing your speech for improvements...
            </p>
            <p className="text-base">Checking for potential enhancements...</p>
            <p className="text-base">Reviewing structure and flow...</p>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
