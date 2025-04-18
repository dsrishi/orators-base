import { Editor } from "@tiptap/react";
import { Speech, SpeechMetrics } from "@/types/speech";
import { useUser } from "@/contexts/UserContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getSpeechMetrics } from "@/helpers/speechHelpers";
import { useEffect, useState } from "react";

interface BasicStatsProps {
  editor: Editor | null;
  speechData: Speech;
}

export default function BasicStats({ editor, speechData }: BasicStatsProps) {
  const { theme } = useTheme();
  const { user } = useUser();
  const [speechMetrics, setSpeechMetrics] = useState<SpeechMetrics | null>(
    null
  );

  useEffect(() => {
    if (editor) {
      setSpeechMetrics(
        getSpeechMetrics(editor.getHTML(), user?.speaking_pace || 140)
      );
    }
  }, [editor]);

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
            <p>Estimated Count: {speechMetrics?.wordCount || ""}</p>
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
            <p>Estimated Duration: {speechMetrics?.estimatedDuration || ""}</p>
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
            <p>Characters: {speechMetrics?.characterCount || ""}</p>
            <p>Paragraphs: {speechMetrics?.paragraphCount || ""}</p>
            <p>Reading Time: {speechMetrics?.readingTime || ""}</p>
            <p>Sentences: {speechMetrics?.sentenceCount || ""}</p>
            <p>
              Average Sentence Length:{" "}
              {speechMetrics?.averageSentenceLength || ""}
            </p>
            <p>Average Word Length: {speechMetrics?.averageWordLength || ""}</p>
            <p>Unique Words: {speechMetrics?.uniqueWordCount || ""}</p>
            <p>
              Longest Sentence: {speechMetrics?.longestSentenceLength || ""}
            </p>
            <p>
              Shortest Sentence: {speechMetrics?.shortestSentenceLength || ""}
            </p>
            <p>Longest Word: {speechMetrics?.longestWordLength || ""}</p>
            <p>Shortest Word: {speechMetrics?.shortestWordLength || ""}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
