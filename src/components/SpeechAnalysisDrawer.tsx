import { Drawer } from "antd";
import { useTheme } from "@/contexts/ThemeContext";
import { Editor, JSONContent } from "@tiptap/react";
import { Speech } from "@/types/speech";
import { useUser } from "@/contexts/UserContext";
import { estimatedDuration } from "@/helpers/speechHelpers";

interface SpeechAnalysisDrawerProps {
  open: boolean;
  onClose: () => void;
  editor: Editor | null;
  speechData: Speech;
}

export default function SpeechAnalysisDrawer({
  open,
  onClose,
  editor,
  speechData,
}: SpeechAnalysisDrawerProps) {
  const { theme } = useTheme();
  const { user } = useUser();

  const getWordCount = (content: string | JSONContent | JSONContent[]) => {
    // Convert JSONContent to string
    const contentString =
      typeof content === "string" ? content : JSON.stringify(content);
    const tempElement = document.createElement("div");
    tempElement.innerHTML = contentString;
    const textContent = tempElement.textContent || tempElement.innerText || "";
    const words = textContent.trim().split(/\s+/);
    return words.length;
  };

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
        <div className="grid grid-cols-2 gap-6">
          <div
            className="p-6 rounded"
            style={{
              backgroundColor: theme === "dark" ? "#2d2d2d" : "#f5f5f5",
            }}
          >
            <h3 className="text-lg font-semibold mb-2">Word Count</h3>
            <div className="space-y-1">
              <p>Planned Count: {speechData.word_count || "-"}</p>
              <p>
                Estimated Count:{" "}
                {getWordCount(editor?.options?.content || "") || 0}
              </p>
            </div>
          </div>

          <div
            className="p-6 rounded"
            style={{
              backgroundColor: theme === "dark" ? "#2d2d2d" : "#f5f5f5",
            }}
          >
            <h3 className="text-lg font-semibold mb-2">Duration</h3>
            <div className="space-y-1">
              <p>Planned Duration: {speechData.duration || "-"} min</p>
              <p>
                Estimated Duration:{" "}
                {estimatedDuration(
                  getWordCount(editor?.options?.content || ""),
                  user?.speaking_pace || 140
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
