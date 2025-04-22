import { SpeechMetrics } from "@/types/speech";
import { JSONContent } from "@tiptap/react";


// Combined function to get all speech metrics at once
export function getSpeechMetrics(
  content: string | JSONContent | JSONContent[],
  wordsPerMinute: number
): SpeechMetrics {
  // Convert JSONContent to string if needed
  const contentString =
    typeof content === "string" ? content : JSON.stringify(content);
  
  // Parse the HTML content
  const tempElement = document.createElement("div");
  tempElement.innerHTML = contentString;
  const textContent = tempElement.textContent || tempElement.innerText || "";
  
  // Calculate word count
  const words = textContent.trim().split(/\s+/);
  const wordCount = words.length;
  
  // Calculate character count
  const characterCount = textContent.length;
  
  // Calculate paragraph count
  const paragraphs = tempElement.querySelectorAll('p');
  const nonEmptyParagraphs = Array.from(paragraphs).filter(p => 
    p.textContent && p.textContent.trim() !== ''
  );
  const paragraphCount = nonEmptyParagraphs.length;
  
  // Calculate duration
  const minutes = Math.floor(wordCount / wordsPerMinute);
  const seconds = Math.floor((wordCount % wordsPerMinute) * 60 / wordsPerMinute);
  const estimatedDuration = minutes > 0 
    ? `${minutes} min ${seconds} sec` 
    : `${seconds} sec`;
  
  // Calculate reading time (slightly faster than speaking)
  const readingWordsPerMinute = wordsPerMinute * 1.3; // Reading is typically faster than speaking
  const readingMinutes = Math.floor(wordCount / readingWordsPerMinute);
  const readingSeconds = Math.floor((wordCount % readingWordsPerMinute) * 60 / readingWordsPerMinute);
  const readingTime = readingMinutes > 0 
    ? `${readingMinutes} min ${readingSeconds} sec` 
    : `${readingSeconds} sec`;

  // Calculate sentences count 
  const sentences = textContent.split(/[.!?]/).filter(sentence => sentence.trim() !== "");
  const sentenceCount = sentences.length;

  //calculate avarage sentence length
  const averageSentenceLength = Math.round(wordCount / sentenceCount);

  //calculate average word length
  const averageWordLength = Math.round(characterCount / wordCount);

  //calculate unique words count
  const uniqueWords = new Set(words.map(word => word.toLowerCase()));
  const uniqueWordCount = uniqueWords.size;

  //calculate longest sentence length
  const longestSentence = sentences.reduce((longest, current) => {
    return current.length > longest.length ? current : longest;
  }, sentences[0]);
  const longestSentenceLength = longestSentence.length;

  //calculate shortest sentence length
  const shortestSentence = sentences.reduce((shortest, current) => {
    return current.length < shortest.length ? current : shortest;
  }, sentences[0]);
  const shortestSentenceLength = shortestSentence.length;

  //calculate longest word length
  const longestWord = words.reduce((longest, current) => {
    return current.length > longest.length ? current : longest;
  }, words[0]);
  const longestWordLength = longestWord.length;

  //calculate shortest word length
  const shortestWord = words.reduce((shortest, current) => {
    return current.length < shortest.length ? current : shortest;
  }, words[0]);
  const shortestWordLength = shortestWord.length;
  
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
    shortestWordLength
  };
}
