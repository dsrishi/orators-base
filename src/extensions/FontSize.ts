import { Extension } from '@tiptap/core';
import { Editor, ChainedCommands } from '@tiptap/core';

type CommandProps = { editor: Editor; chain: () => ChainedCommands };

export const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element: HTMLElement) => element.style.fontSize.replace(/['\"]+/g, ''),
            renderHTML: (attributes: Record<string, unknown>) => {
              if (!attributes.fontSize) {
                return {};
              }
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },

  // @ts-expect-error - TipTap type definitions don't match the actual implementation
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }: CommandProps) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run();
      },
      unsetFontSize: () => ({ chain }: CommandProps) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run();
      },
    };
  },
});
