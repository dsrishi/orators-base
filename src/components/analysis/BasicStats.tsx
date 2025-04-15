import { useEffect, useState } from "react";
import { Editor, JSONContent } from "@tiptap/react";
import { Speech } from "@/types/speech";
import { useUser } from "@/contexts/UserContext";
import { useTheme } from "@/contexts/ThemeContext";
import { estimatedDuration } from "@/helpers/speechHelpers";

interface BasicStatsProps {
  editor: Editor | null;
  speechData: Speech;
}

export default function BasicStats({ editor, speechData }: BasicStatsProps) {
  const { theme } = useTheme();
  const { user } = useUser();
  const [wordCount, setWordCount] = useState(0);

  // Update on every editor change
  useEffect(() => {
    if (!editor) return;

    const updateStats = () => {
      const content = editor.getHTML();
      setWordCount(getWordCount(content));
    };

    // Subscribe to editor changes
    editor.on("update", updateStats);

    // Initial update
    updateStats();

    // Cleanup
    return () => {
      editor.off("update", updateStats);
    };
  }, [editor]);

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
            <p>Estimated Count: {wordCount}</p>
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
              {estimatedDuration(wordCount, user?.speaking_pace || 140)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
