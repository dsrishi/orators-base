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

export function extractSpeechAsHtml(content: Descendant[]): string {
    let html = '';
  
    const processChildren = (children: Array<SlateElement>) => {
      let childHtml = '';
      children.forEach(child => {
        if (child.text) {
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
      if ((node as SlateElement).type === 'heading-one') {
        html += `<h1>${processChildren((node as SlateElement).children)}</h1>`;
      } else if ((node as SlateElement).type === 'heading-two') {
        html += `<h2>${processChildren((node as SlateElement).children)}</h2>`;
      } else if ((node as SlateElement).type === 'heading-three') {
        html += `<h3>${processChildren((node as SlateElement).children)}</h3>`;
      } else if ((node as SlateElement).type === 'paragraph') {
        const content = processChildren((node as SlateElement).children);
        if (content) {
          html += `<p>${content}</p>`;
        }
      } else if ((node as SlateElement).type === 'bullet-list') {
        html += '<ul>';
        (node as SlateElement).children.forEach((item: SlateElement) => {
          if (item.type === 'list-item') {
            html += `<li>${processChildren(item.children)}</li>`;
          }
        });
        html += '</ul>';
      }
      // Add support for other potential node types
      else if ((node as SlateElement).type === 'ordered-list') {
        html += '<ol>';
        (node as SlateElement).children.forEach((item: SlateElement) => {
          if (item.type === 'list-item') {
            html += `<li>${processChildren(item.children)}</li>`;
          }
        });
        html += '</ol>';
      } else if ((node as SlateElement).type === 'blockquote') {
        html += `<blockquote>${processChildren((node as SlateElement).children)}</blockquote>`;
      }
    });
  
    return html;
  }