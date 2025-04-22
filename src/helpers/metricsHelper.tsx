import { SpeechMetrics } from "@/types/speech";

// Combined function to get all speech metrics at once
export function getMetrics(
  content: string,
  wordsPerMinute: number
): SpeechMetrics {
  // Convert JSONContent to string if needed
  const contentString =
    typeof content === "string" ? content : JSON.stringify(content);
  const textContent = contentString;

  // Calculate word count
  const words = textContent.trim().split(/\s+/);
  const wordCount = words.length;

  // Calculate character count
  const characterCount = textContent.length;

  // Calculate paragraph count
  const paragraphCount = 0;

  // Calculate duration
  const minutes = Math.floor(wordCount / wordsPerMinute);
  const seconds = Math.floor(
    ((wordCount % wordsPerMinute) * 60) / wordsPerMinute
  );
  const estimatedDuration =
    minutes > 0 ? `${minutes} min ${seconds} sec` : `${seconds} sec`;

  // Calculate reading time (slightly faster than speaking)
  const readingWordsPerMinute = wordsPerMinute * 1.3; // Reading is typically faster than speaking
  const readingMinutes = Math.floor(wordCount / readingWordsPerMinute);
  const readingSeconds = Math.floor(
    ((wordCount % readingWordsPerMinute) * 60) / readingWordsPerMinute
  );
  const readingTime =
    readingMinutes > 0
      ? `${readingMinutes} min ${readingSeconds} sec`
      : `${readingSeconds} sec`;

  // Calculate sentences count
  const sentences = textContent
    .split(/[.!?]/)
    .filter((sentence) => sentence.trim() !== "");
  const sentenceCount = sentences.length;

  //calculate avarage sentence length
  const averageSentenceLength = Math.round(wordCount / sentenceCount);

  //calculate average word length
  const averageWordLength = Math.round(characterCount / wordCount);

  //calculate unique words count
  const uniqueWords = new Set(words.map((word) => word.toLowerCase()));
  const uniqueWordCount = uniqueWords.size;

  const longestSentenceLength = 0;

  const shortestSentenceLength = 0;

  const longestWordLength = 0;

  const shortestWordLength = 0;

  return {
    wordCount,
    characterCount,
    paragraphCount,
    estimatedDuration,
    readingTime,
    sentenceCount,
    averageSentenceLength,
    averageWordLength,
    uniqueWordCount,
    longestSentenceLength,
    shortestSentenceLength,
    longestWordLength,
    shortestWordLength,
  };
}
