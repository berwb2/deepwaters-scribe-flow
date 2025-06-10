
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
  editable?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  content, 
  onChange,
  placeholder = 'Start writing your document content here...',
  editable = true
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
          class: 'code-block bg-gray-900 text-green-400 p-4 rounded-lg my-4 overflow-x-auto',
        },
      }),
      Link.configure({
        openOnClick: false,
        validate: href => /^https?:\/\//.test(href),
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
        },
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
        cellMinWidth: 50,
        HTMLAttributes: {
          class: 'table-auto w-full border-collapse border border-blue-300 my-4',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border border-blue-300',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-blue-300 bg-blue-50 p-3 font-semibold text-left',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-blue-300 p-3 break-words',
        },
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-blue prose-lg max-w-none focus:outline-none min-h-[400px] leading-relaxed',
        style: 'font-family: Georgia, serif; line-height: 1.8;',
      },
      transformPastedHTML(html) {
        return html;
      },
      transformPastedText(text) {
        // Enhanced paste handling for better formatting
        let formatted = text;
        
        // Auto-format headers
        formatted = formatted.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        formatted = formatted.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        formatted = formatted.replace(/^# (.+)$/gm, '<h1>$1</h1>');
        
        // Auto-format bullet points
        formatted = formatted.replace(/^[•\-\*] (.+)$/gm, '<li>$1</li>');
        
        // Auto-format numbered lists
        formatted = formatted.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
        
        // Wrap consecutive list items
        formatted = formatted.replace(/(<li>.*?<\/li>(?:\s*<li>.*?<\/li>)*)/gs, '<ul>$1</ul>');
        
        // Auto-format paragraphs
        formatted = formatted.replace(/^([^<\n#•\-\*\d].+)$/gm, '<p>$1</p>');
        
        // Preserve double line breaks as paragraph breaks
        formatted = formatted.replace(/\n\n/g, '</p><p>');
        
        return formatted;
      },
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [editor, content]);

  useEffect(() => {
    if (editor) {
      const codeBlocks = document.querySelectorAll('pre code');
      codeBlocks.forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    }
  }, [editor, content]);

  if (!editor) {
    return (
      <div className="border rounded-lg shadow-sm bg-background border-blue-200 min-h-[400px] flex items-center justify-center">
        <div className="text-muted-foreground">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg shadow-sm bg-background relative border-blue-200">
      {editable && <EditorToolbar editor={editor} />}
      {editor && editable && <EditorBubbleMenu editor={editor} />}
      <div className="p-6">
        <EditorContent 
          editor={editor} 
          className="min-h-[24rem] focus-visible:outline-none prose prose-blue prose-lg max-w-none"
        />
      </div>
      <EditorStylesheet />
      <style>{`
        /* Enhanced styling for luxury reading experience */
        .ProseMirror {
          font-family: Georgia, 'Times New Roman', serif !important;
          line-height: 1.8 !important;
          font-size: 16px !important;
          color: #374151 !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
        }
        
        .ProseMirror h1 {
          font-size: 2.25em !important;
          font-weight: 700 !important;
          color: #1f2937 !important;
          margin-top: 2rem !important;
          margin-bottom: 1rem !important;
          padding-bottom: 0.5rem !important;
          border-bottom: 2px solid #e5e7eb !important;
        }
        
        .ProseMirror h2 {
          font-size: 1.875em !important;
          font-weight: 600 !important;
          color: #374151 !important;
          margin-top: 1.5rem !important;
          margin-bottom: 0.75rem !important;
        }
        
        .ProseMirror h3 {
          font-size: 1.5em !important;
          font-weight: 600 !important;
          color: #4b5563 !important;
          margin-top: 1.25rem !important;
          margin-bottom: 0.5rem !important;
        }
        
        .ProseMirror p {
          margin-bottom: 1.25rem !important;
          text-align: justify !important;
          word-spacing: 0.1em !important;
        }
        
        .ProseMirror ul, .ProseMirror ol {
          margin: 1rem 0 !important;
          padding-left: 1.5rem !important;
        }
        
        .ProseMirror li {
          margin-bottom: 0.5rem !important;
          line-height: 1.7 !important;
        }
        
        .ProseMirror table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin: 1.5rem 0 !important;
          word-wrap: break-word !important;
        }
        
        .ProseMirror table td,
        .ProseMirror table th {
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          hyphens: auto !important;
          white-space: normal !important;
          vertical-align: top !important;
          padding: 0.75rem !important;
        }
        
        .ProseMirror blockquote {
          border-left: 4px solid #3b82f6 !important;
          padding-left: 1rem !important;
          margin: 1.5rem 0 !important;
          font-style: italic !important;
          color: #6b7280 !important;
          background-color: #f8fafc !important;
          padding: 1rem !important;
          border-radius: 0.375rem !important;
        }
        
        .ProseMirror strong {
          font-weight: 700 !important;
          color: #1f2937 !important;
        }
        
        .ProseMirror em {
          font-style: italic !important;
          color: #374151 !important;
        }
        
        .ProseMirror .is-editor-empty:first-child::before {
          color: #9ca3af !important;
          content: attr(data-placeholder) !important;
          float: left !important;
          height: 0 !important;
          pointer-events: none !important;
          font-style: italic !important;
        }
        
        /* Code block styling */
        .ProseMirror pre {
          background: #1f2937 !important;
          color: #d1d5db !important;
          padding: 1rem !important;
          border-radius: 0.5rem !important;
          margin: 1rem 0 !important;
          overflow-x: auto !important;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
        }
        
        .ProseMirror code {
          background: #f3f4f6 !important;
          color: #ef4444 !important;
          padding: 0.125rem 0.25rem !important;
          border-radius: 0.25rem !important;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
          font-size: 0.875em !important;
        }
        
        /* Link styling */
        .ProseMirror a {
          color: #3b82f6 !important;
          text-decoration: underline !important;
          font-weight: 500 !important;
        }
        
        .ProseMirror a:hover {
          color: #1d4ed8 !important;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
