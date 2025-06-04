
import { Node, mergeAttributes } from '@tiptap/core';

// Custom TableHeader extension to fix the missing 'tableHeader' node error
export const TableHeader = Node.create({
  name: 'tableHeader',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  content: 'inline*',

  addAttributes() {
    return {
      colspan: {
        default: 1,
      },
      rowspan: {
        default: 1,
      },
      colwidth: {
        default: null,
        parseHTML: element => {
          const colwidth = element.getAttribute('colwidth');
          const value = colwidth ? [parseInt(colwidth, 10)] : null;
          return value;
        },
      },
    };
  },

  tableRole: 'header_cell',

  isolating: true,

  parseHTML() {
    return [{ tag: 'th' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['th', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
});

export default TableHeader;
