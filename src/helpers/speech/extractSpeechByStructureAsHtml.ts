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

export function extractSpeechByStructureAsHtml(content: Descendant[], structure: string): string {
    let html = '';
  
    const processChildren = (children: SlateElement[]) => {
      let childHtml = '';
      children.forEach(child => {
        if (child.text && child.structure === structure) {
          let text = child.text;
          if (child.bold) {
            text = `<strong>${text}</strong>`;
          }
          if (child.italic) {
            text = `<em>${text}</em>`;
          }
          if (child.underline) {
            text = `<u>${text}</u>`;
          }
          childHtml += text + ' ';
        }
      });
      return childHtml.trim();
    };
  
    content.forEach((node: Descendant) => {
      if ((node as SlateElement).type === 'paragraph') {
        const content = processChildren((node as SlateElement).children);
        if (content) {
          html += `<p>${content}</p>`;
        }
      } else if ((node as SlateElement).type === 'bullet-list') {
        let listContent = '';
        (node as SlateElement).children.forEach((item: SlateElement) => {
          if (item.type === 'list-item') {
            const itemContent = processChildren(item.children);
            if (itemContent) {
              listContent += `<li>${itemContent}</li>`;
            }
          }
        });
        if (listContent) {
          html += `<ul>${listContent}</ul>`;
        }
      }
      // Support for additional node types
      else if ((node as SlateElement).type === 'ordered-list') {
        let listContent = '';
        (node as SlateElement).children.forEach((item: SlateElement) => {
          if (item.type === 'list-item') {
            const itemContent = processChildren(item.children);
            if (itemContent) {
              listContent += `<li>${itemContent}</li>`;
            }
          }
        });
        if (listContent) {
          html += `<ol>${listContent}</ol>`;
        }
      } else if ((node as SlateElement).type === 'blockquote') {
        const content = processChildren((node as SlateElement).children);
        if (content) {
          html += `<blockquote>${content}</blockquote>`;
        }
      }
    });
  
    return html;
  }