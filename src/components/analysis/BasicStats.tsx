import { Editor } from "@tiptap/react";
import { Speech } from "@/types/speech";
import { useUser } from "@/contexts/UserContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  getCharacterCount,
  getEstimatedDuration,
  getParagraphCount,
  getWordCount,
} from "@/helpers/speechHelpers";

interface BasicStatsProps {
  editor: Editor | null;
  speechData: Speech;
}

export default function BasicStats({ editor, speechData }: BasicStatsProps) {
  const { theme } = useTheme();
  const { user } = useUser();

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
            <p>Estimated Count: {getWordCount(editor?.getHTML() || "")}</p>
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
              {getEstimatedDuration(
                getWordCount(editor?.getHTML() || ""),
                user?.speaking_pace || 140
              )}
            </p>
          </div>
        </div>

        <div
          className="p-6 rounded"
          style={{
            backgroundColor: theme === "dark" ? "#2d2d2d" : "#f5f5f5",
          }}
        >
          <h3 className="text-lg font-semibold mb-2">Stats</h3>
          <div className="space-y-1">
            <p>Characters: {getCharacterCount(editor?.getHTML() || "")}</p>
            <p>Paragraphs: {getParagraphCount(editor?.getHTML() || "")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
