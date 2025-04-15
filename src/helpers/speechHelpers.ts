import { JSONContent } from "@tiptap/react";

// function to calculate the duration
export function getEstimatedDuration(words: number, wordsPerMinute: number) {
  const duration = Math.floor(words / wordsPerMinute);
  const seconds = Math.floor((words % wordsPerMinute) * 60 / wordsPerMinute);
  if (duration > 0) {
    return `${duration} min ${seconds} sec`;
  } else {
    return `${seconds} sec`;
  }
}

// function to calculate the word count
export function getWordCount(content: string | JSONContent | JSONContent[]) {
  // Convert JSONContent to string
  const contentString =
    typeof content === "string" ? content : JSON.stringify(content);
  const tempElement = document.createElement("div");
  tempElement.innerHTML = contentString;
  const textContent = tempElement.textContent || tempElement.innerText || "";
  const words = textContent.trim().split(/\s+/);
  return words.length;
};

// function to calculate characters count
export function getCharacterCount(content: string | JSONContent | JSONContent[]) {
  const contentString =
    typeof content === "string" ? content : JSON.stringify(content);
  return contentString.length;
}

// function to calculate paragraphs count
export function getParagraphCount(content: string | JSONContent | JSONContent[]) {
  const contentString =
    typeof content === "string" ? content : JSON.stringify(content);
  
  // Create a temporary DOM element to parse the HTML
  const tempElement = document.createElement('div');
  tempElement.innerHTML = contentString;
  
  // Count all paragraph elements (both empty and non-empty)
  const paragraphs = tempElement.querySelectorAll('p');
  
  // Filter out completely empty paragraphs if needed
  const nonEmptyParagraphs = Array.from(paragraphs).filter(p => 
    p.textContent && p.textContent.trim() !== ''
  );
  
  // Return either all paragraphs or just non-empty ones
  return nonEmptyParagraphs.length; // or paragraphs.length if you want to count empty ones too
}
