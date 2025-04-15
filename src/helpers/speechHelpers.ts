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
  
  return {
    wordCount,
    characterCount,
    paragraphCount,
    estimatedDuration,
    readingTime
  };
}
