
import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlock from '@tiptap/extension-code-block';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from './editor/TableHeader';
import TextAlign from '@tiptap/extension-text-align';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

import EditorToolbar from './editor/EditorToolbar';
import EditorBubbleMenu from './editor/EditorBubbleMenu';
import EditorStylesheet from './editor/EditorStylesheet';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  content, 
  onChange,
  placeholder = 'Write or paste your document content here...'
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'code-block',
        },
      }),
      Link.configure({
        openOnClick: false,
        validate: href => /^https?:\/\//.test(href),
      }),
      Placeholder.configure({
        placeholder,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
        handleWidth: 5,
        cellMinWidth: 25,
        HTMLAttributes: {
          class: 'table-auto w-full border-collapse border border-blue-300',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border border-blue-300',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-blue-300 bg-blue-50 p-2 font-semibold text-left',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-blue-300 p-2 break-words',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-blue max-w-none focus:outline-none',
      },
      transformPastedHTML(html) {
        return html;
      },
      transformPastedText(text) {
        return text.replace(/\n/g, '<br>');
      },
    },
  });

  useEffect(() => {
    if (editor) {
      const codeBlocks = document.querySelectorAll('pre code');
      codeBlocks.forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    }
  }, [editor, content]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg shadow-sm bg-background relative border-blue-200">
      <EditorToolbar editor={editor} />
      {editor && <EditorBubbleMenu editor={editor} />}
      <div className="p-6">
        <EditorContent 
          editor={editor} 
          className="min-h-[24rem] focus-visible:outline-none prose prose-blue prose-lg max-w-none"
        />
      </div>
      <EditorStylesheet />
      <style>{`
        .ProseMirror table {
          table-layout: fixed !important;
          width: 100% !important;
          word-wrap: break-word !important;
        }
        .ProseMirror table td,
        .ProseMirror table th {
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          hyphens: auto !important;
          white-space: normal !important;
        }
        .ProseMirror p {
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
