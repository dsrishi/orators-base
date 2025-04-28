export const getStatsFromHtml = (content: string, wordsPerMinute: number) => {
  //a function to get the word count from html string ignoring html tags
  const characterCount = content.replace(/<[^>]*>/g, "").length;
  const wordCount = content.replace(/<[^>]*>/g, "").split(" ").length;
  const averageWordLength = Math.round(
    wordCount > 0 ? characterCount / wordCount : 0
  );
  const sentenceCount = content.replace(/<[^>]*>/g, "").split(".").length;
  const averageSentenceLength = Math.round(
    sentenceCount > 0 ? wordCount / sentenceCount : 0
  );

  const parser = new DOMParser();
  const doc = parser.parseFromString(content, "text/html"); // Get all paragraph elements
  const paragraphs = doc.querySelectorAll("p"); // Filter out empty paragraphs and count the rest
  const paragraphCount = Array.from(paragraphs).filter(
    (p) => p.textContent && p.textContent.trim().length > 0
  ).length;

  const averageParagraphLength = Math.round(
    paragraphCount > 0 ? wordCount / paragraphCount : 0
  );

  // Calculate duration
  const minutes = Math.floor(wordCount / wordsPerMinute);
  const seconds = Math.floor(
    ((wordCount % wordsPerMinute) * 60) / wordsPerMinute
  );
  const estimatedDuration =
    minutes > 0 ? `${minutes} min ${seconds} sec` : `${seconds} sec`;

  const estimatedDurationInSeconds = minutes * 60 + seconds;

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

  return {
    wordCount,
    characterCount,
    averageWordLength,
    sentenceCount,
    averageSentenceLength,
    paragraphCount,
    averageParagraphLength,
    estimatedDuration,
    estimatedDurationInSeconds,
    readingTime,
  };
};
