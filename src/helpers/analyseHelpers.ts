import { Descendant } from "slate";

// Define the expected shape of your Slate elements
interface SlateElement {
  type?: string;
  children: Array<{ text: string; structure?: string }>;
}

export function getTextByType(content: Descendant[], type: string): string {
  return content
    .flatMap((paragraph) => (paragraph as SlateElement).children)
    .filter((child) => child.structure === type)
    .map((child) => child.text)
    .join(" ");
}

// Get the total text of all types
export function getTotalText(content: Descendant[]): string {
  return content
    .flatMap((paragraph) => (paragraph as SlateElement).children)
    .map((child) => child.text)
    .join(" ");
}

export function getTotalWordCount(content: Descendant[]): number {
  return content
    .flatMap((paragraph) => (paragraph as SlateElement).children)
    .map((child) => child.text.split(/\s+/).length)
    .reduce((a, b) => a + b, 0);
}
