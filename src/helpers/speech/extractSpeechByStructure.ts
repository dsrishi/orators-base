import { Descendant } from "slate";

interface SlateElement {
    type?: string;
    children: Array<SlateElement>;
    text?: string;
    structure?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
}

export function extractSpeechByStructure(content: Descendant[], structure: string): string {
    let speechText = '';
  
    const processChildren = (children: SlateElement[]) => {
      children.forEach(child => {
        if (child.text && (child as SlateElement).structure === structure) {
          speechText += child.text + ' ';
        }
      });
    };
  
    content.forEach((node: Descendant) => {
      if ((node as SlateElement).children) {
        processChildren((node as SlateElement).children);
      }
      if ((node as SlateElement).type === 'bullet-list' && (node as SlateElement).children) {
        (node as SlateElement).children.forEach((item: SlateElement) => {
          if (item.children) {
            processChildren(item.children);
          }
        });
      }
    });
  
    return speechText.trim();
  }