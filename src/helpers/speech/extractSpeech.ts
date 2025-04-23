import { Descendant } from "slate";

interface SlateElement {
    type?: string;
    children: Array<{ text: string; structure?: string } | SlateElement>;
    text?: string;
}

export function extractSpeech(content: Descendant[]): string {
    let speechText = '';
  
    const processChildren = (children: Array<{ text: string; structure?: string } | SlateElement>) => {
      children.forEach(child => {
        if ('text' in child) {
          speechText += child.text + ' ';
        } else if ('children' in child) {
          processChildren(child.children);
        }
      });
    };
  
    content.forEach((node: Descendant) => {
      if ('children' in node) {
        processChildren(node.children);
      }
      if ((node as SlateElement).type === 'bullet-list' && 'children' in node) {
        (node as SlateElement).children.forEach(item => {
          if ('children' in item) {
            processChildren(item.children);
          }
        });
      }
    });
  
    return speechText.trim();
  }