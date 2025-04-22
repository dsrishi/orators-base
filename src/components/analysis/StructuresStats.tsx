import { Speech, SpeechMetrics } from "@/types/speech";
import { useUser } from "@/contexts/UserContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";
import { Descendant } from "slate";
import { getTextByType, getTotalText } from "@/helpers/analyseHelpers";
import { getMetrics } from "@/helpers/metricsHelper";
interface BasicStatsProps {
  speechData: Speech;
  content: Descendant[];
}

export default function StructuresStats({
  speechData,
  content,
}: BasicStatsProps) {
  const { theme } = useTheme();
  const { user } = useUser();
  const [speechMetrics, setSpeechMetrics] = useState<SpeechMetrics | null>(
    null
  );
  const [openingMetrics, setOpeningMetrics] = useState<SpeechMetrics | null>(
    null
  );
  const [bodyMetrics, setBodyMetrics] = useState<SpeechMetrics | null>(null);
  const [conclusionMetrics, setConclusionMetrics] =
    useState<SpeechMetrics | null>(null);
  const [transitionMetrics, setTransitionMetrics] =
    useState<SpeechMetrics | null>(null);
  const [greetingMetrics, setGreetingMetrics] = useState<SpeechMetrics | null>(
    null
  );

  useEffect(() => {
    if (content) {
      setSpeechMetrics(
        getMetrics(getTotalText(content) || " ", user?.speaking_pace || 140)
      );
      setOpeningMetrics(
        getMetrics(
          getTextByType(content, "opening") || " ",
          user?.speaking_pace || 140
        )
      );
      setBodyMetrics(
        getMetrics(
          getTextByType(content, "body") || " ",
          user?.speaking_pace || 140
        )
      );
      setConclusionMetrics(
        getMetrics(
          getTextByType(content, "conclusion") || " ",
          user?.speaking_pace || 140
        )
      );
      setTransitionMetrics(
        getMetrics(
          getTextByType(content, "transition") || " ",
          user?.speaking_pace || 140
        )
      );
      setGreetingMetrics(
        getMetrics(
          getTextByType(content, "greeting") || " ",
          user?.speaking_pace || 140
        )
      );
    }
  }, [content]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-6">
        <div
          className="p-6 rounded"
          style={{
            backgroundColor: theme === "dark" ? "#2d2d2d" : "#f5f5f5",
          }}
        >
          <h3 className="text-lg font-semibold mb-2">Full Speech</h3>
          <div className="space-y-1">
            <p>Planned Count: {speechData.word_count || "-"}</p>
            <p>Estimated Count: {speechMetrics?.wordCount || ""}</p>
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
          <h3 className="text-lg font-semibold mb-2">Opening</h3>
          <div className="space-y-1">
            <p>Estimated Count: {openingMetrics?.wordCount || ""}</p>
            <p>Estimated Duration: {openingMetrics?.estimatedDuration || ""}</p>
          </div>
        </div>

        <div
          className="p-6 rounded"
          style={{
            backgroundColor: theme === "dark" ? "#2d2d2d" : "#f5f5f5",
          }}
        >
          <h3 className="text-lg font-semibold mb-2">Body</h3>
          <div className="space-y-1">
            <p>Estimated Count: {bodyMetrics?.wordCount || ""}</p>
            <p>Estimated Duration: {bodyMetrics?.estimatedDuration || ""}</p>
          </div>
        </div>

        <div
          className="p-6 rounded"
          style={{
            backgroundColor: theme === "dark" ? "#2d2d2d" : "#f5f5f5",
          }}
        >
          <h3 className="text-lg font-semibold mb-2">Conclusion</h3>
          <div className="space-y-1">
            <p>Estimated Count: {conclusionMetrics?.wordCount || ""}</p>
            <p>
              Estimated Duration: {conclusionMetrics?.estimatedDuration || ""}
            </p>
          </div>
        </div>

        <div
          className="p-6 rounded"
          style={{
            backgroundColor: theme === "dark" ? "#2d2d2d" : "#f5f5f5",
          }}
        >
          <h3 className="text-lg font-semibold mb-2">Transition</h3>
          <div className="space-y-1">
            <p>Estimated Count: {transitionMetrics?.wordCount || ""}</p>
            <p>
              Estimated Duration: {transitionMetrics?.estimatedDuration || ""}
            </p>
          </div>
        </div>

        <div
          className="p-6 rounded"
          style={{
            backgroundColor: theme === "dark" ? "#2d2d2d" : "#f5f5f5",
          }}
        >
          <h3 className="text-lg font-semibold mb-2">Greeting</h3>
          <div className="space-y-1">
            <p>Estimated Count: {greetingMetrics?.wordCount || ""}</p>
            <p>
              Estimated Duration: {greetingMetrics?.estimatedDuration || ""}
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
