
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
          levels: [1, 2, 3, 4, 5, 6],
        },
        paragraph: {
          HTMLAttributes: {
            class: 'luxury-paragraph',
          },
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'luxury-code-block',
        },
      }),
      Link.configure({
        openOnClick: false,
        validate: href => /^https?:\/\//.test(href),
        HTMLAttributes: {
          class: 'luxury-link',
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
          class: 'luxury-table',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'luxury-table-row',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'luxury-table-header',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'luxury-table-cell',
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
        class: 'luxury-editor-content focus:outline-none',
      },
      transformPastedHTML(html) {
        // Enhanced HTML paste processing for better formatting
        let processed = html;
        
        // Clean up common paste artifacts
        processed = processed.replace(/<!--[\s\S]*?-->/g, ''); // Remove comments
        processed = processed.replace(/class="[^"]*"/g, ''); // Remove external classes
        processed = processed.replace(/style="[^"]*"/g, ''); // Remove inline styles
        processed = processed.replace(/<span[^>]*>/g, '').replace(/<\/span>/g, ''); // Remove spans
        processed = processed.replace(/<div[^>]*>/g, '<p>').replace(/<\/div>/g, '</p>'); // Convert divs to paragraphs
        
        // Enhance headings
        processed = processed.replace(/<h([1-6])([^>]*)>/g, '<h$1 class="luxury-heading-$1">');
        processed = processed.replace(/<p([^>]*)>/g, '<p class="luxury-paragraph">');
        processed = processed.replace(/<ul([^>]*)>/g, '<ul class="luxury-list-bullet">');
        processed = processed.replace(/<ol([^>]*)>/g, '<ol class="luxury-list-numbered">');
        processed = processed.replace(/<li([^>]*)>/g, '<li class="luxury-list-item">');
        processed = processed.replace(/<blockquote([^>]*)>/g, '<blockquote class="luxury-blockquote">');
        
        return processed;
      },
      transformPastedText(text) {
        // Enhanced plain text paste handling
        let formatted = text;
        
        // Auto-format markdown-style headers
        formatted = formatted.replace(/^######\s+(.+)$/gm, '<h6 class="luxury-heading-6">$1</h6>');
        formatted = formatted.replace(/^#####\s+(.+)$/gm, '<h5 class="luxury-heading-5">$1</h5>');
        formatted = formatted.replace(/^####\s+(.+)$/gm, '<h4 class="luxury-heading-4">$1</h4>');
        formatted = formatted.replace(/^###\s+(.+)$/gm, '<h3 class="luxury-heading-3">$1</h3>');
        formatted = formatted.replace(/^##\s+(.+)$/gm, '<h2 class="luxury-heading-2">$1</h2>');
        formatted = formatted.replace(/^#\s+(.+)$/gm, '<h1 class="luxury-heading-1">$1</h1>');
        
        // Auto-format bullet points (multiple styles)
        formatted = formatted.replace(/^[\*\-\+•]\s+(.+)$/gm, '<li class="luxury-list-item">$1</li>');
        
        // Auto-format numbered lists
        formatted = formatted.replace(/^\d+\.\s+(.+)$/gm, '<li class="luxury-list-item">$1</li>');
        
        // Wrap consecutive list items in proper list containers
        formatted = formatted.replace(/(<li class="luxury-list-item">.*?<\/li>(?:\s*<li class="luxury-list-item">.*?<\/li>)*)/gs, 
          (match) => {
            // Check if this looks like a numbered list (starts with number)
            if (/^\d+\./.test(text.match(/^\d+\.\s+/m)?.[0] || '')) {
              return `<ol class="luxury-list-numbered">${match}</ol>`;
            } else {
              return `<ul class="luxury-list-bullet">${match}</ul>`;
            }
          }
        );
        
        // Auto-format blockquotes
        formatted = formatted.replace(/^>\s+(.+)$/gm, '<blockquote class="luxury-blockquote">$1</blockquote>');
        
        // Auto-format paragraphs (anything that's not already formatted)
        formatted = formatted.replace(/^([^<\n#•\-\*\+\d>].+)$/gm, '<p class="luxury-paragraph">$1</p>');
        
        // Handle line breaks and spacing
        formatted = formatted.replace(/\n\n+/g, '</p><p class="luxury-paragraph">');
        formatted = formatted.replace(/\n/g, '<br>');
        
        // Clean up empty paragraphs
        formatted = formatted.replace(/<p class="luxury-paragraph"><\/p>/g, '');
        formatted = formatted.replace(/<p class="luxury-paragraph"><br><\/p>/g, '');
        
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
        <div className="text-blue-600">Loading luxury editor...</div>
      </div>
    );
  }

  return (
    <div className="border rounded-xl shadow-lg bg-white relative border-blue-200 overflow-hidden">
      {editable && <EditorToolbar editor={editor} />}
      {editor && editable && <EditorBubbleMenu editor={editor} />}
      <div className="p-8 bg-gradient-to-br from-blue-50/30 to-teal-50/30">
        <EditorContent 
          editor={editor} 
          className="luxury-editor-container focus-visible:outline-none"
        />
      </div>
      <EditorStylesheet />
      <style>{`
        /* Luxury Editor Styling */
        .luxury-editor-content {
          font-family: Georgia, 'Times New Roman', serif !important;
          line-height: 1.8 !important;
          font-size: 18px !important;
          color: #1e293b !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          min-height: 400px !important;
        }
        
        .luxury-editor-content .luxury-heading-1 {
          font-size: 2.5rem !important;
          font-weight: 700 !important;
          color: #0f172a !important;
          margin: 2.5rem 0 1.5rem 0 !important;
          padding-bottom: 0.75rem !important;
          border-bottom: 3px solid transparent !important;
          border-image: linear-gradient(90deg, #3b82f6, #06b6d4, #10b981) 1 !important;
          background: linear-gradient(135deg, #1e40af, #0891b2) !important;
          background-clip: text !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          letter-spacing: -0.02em !important;
        }
        
        .luxury-editor-content .luxury-heading-2 {
          font-size: 2rem !important;
          font-weight: 600 !important;
          color: #1e40af !important;
          margin: 2rem 0 1.25rem 0 !important;
          position: relative !important;
          letter-spacing: -0.01em !important;
          padding-left: 1.5rem !important;
        }
        
        .luxury-editor-content .luxury-heading-2:before {
          content: '' !important;
          position: absolute !important;
          left: 0 !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          width: 4px !important;
          height: 2rem !important;
          background: linear-gradient(135deg, #3b82f6, #06b6d4) !important;
          border-radius: 2px !important;
        }
        
        .luxury-editor-content .luxury-heading-3 {
          font-size: 1.5rem !important;
          font-weight: 600 !important;
          color: #1d4ed8 !important;
          margin: 1.75rem 0 1rem 0 !important;
        }
        
        .luxury-editor-content .luxury-heading-4 {
          font-size: 1.25rem !important;
          font-weight: 600 !important;
          color: #2563eb !important;
          margin: 1.5rem 0 0.75rem 0 !important;
        }
        
        .luxury-editor-content .luxury-heading-5 {
          font-size: 1.125rem !important;
          font-weight: 600 !important;
          color: #3b82f6 !important;
          margin: 1.25rem 0 0.5rem 0 !important;
        }
        
        .luxury-editor-content .luxury-heading-6 {
          font-size: 1rem !important;
          font-weight: 600 !important;
          color: #60a5fa !important;
          margin: 1rem 0 0.5rem 0 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }
        
        .luxury-editor-content .luxury-paragraph {
          margin-bottom: 1.5rem !important;
          font-size: 1.125rem !important;
          line-height: 1.8 !important;
          color: #334155 !important;
          text-align: justify !important;
          text-justify: inter-word !important;
        }
        
        .luxury-editor-content .luxury-list-bullet {
          margin: 1.5rem 0 !important;
          padding-left: 2rem !important;
          list-style: none !important;
        }
        
        .luxury-editor-content .luxury-list-numbered {
          margin: 1.5rem 0 !important;
          padding-left: 2rem !important;
          counter-reset: luxury-counter !important;
        }
        
        .luxury-editor-content .luxury-list-bullet .luxury-list-item {
          margin-bottom: 0.75rem !important;
          font-size: 1.125rem !important;
          line-height: 1.7 !important;
          color: #475569 !important;
          position: relative !important;
        }
        
        .luxury-editor-content .luxury-list-bullet .luxury-list-item:before {
          content: '●' !important;
          color: #3b82f6 !important;
          font-weight: bold !important;
          position: absolute !important;
          left: -1.5rem !important;
        }
        
        .luxury-editor-content .luxury-list-numbered .luxury-list-item {
          margin-bottom: 0.75rem !important;
          font-size: 1.125rem !important;
          line-height: 1.7 !important;
          color: #475569 !important;
          position: relative !important;
          counter-increment: luxury-counter !important;
        }
        
        .luxury-editor-content .luxury-list-numbered .luxury-list-item:before {
          content: counter(luxury-counter) '.' !important;
          color: #3b82f6 !important;
          font-weight: bold !important;
          position: absolute !important;
          left: -2rem !important;
        }
        
        .luxury-editor-content .luxury-blockquote {
          border-left: 4px solid #3b82f6 !important;
          padding: 1.5rem 2rem !important;
          margin: 2rem 0 !important;
          background: linear-gradient(135deg, #eff6ff, #dbeafe) !important;
          border-radius: 0 0.5rem 0.5rem 0 !important;
          font-style: italic !important;
          font-size: 1.125rem !important;
          color: #1e40af !important;
          position: relative !important;
        }
        
        .luxury-editor-content .luxury-blockquote:before {
          content: '"' !important;
          font-size: 4rem !important;
          color: #93c5fd !important;
          position: absolute !important;
          left: 0.5rem !important;
          top: -0.5rem !important;
          font-family: serif !important;
        }
        
        .luxury-editor-content .luxury-table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin: 2rem 0 !important;
          background: white !important;
          border-radius: 0.75rem !important;
          overflow: hidden !important;
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.1) !important;
        }
        
        .luxury-editor-content .luxury-table-header {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
          color: white !important;
          padding: 1rem 1.5rem !important;
          font-weight: 600 !important;
          text-align: left !important;
          font-size: 1rem !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          hyphens: auto !important;
        }
        
        .luxury-editor-content .luxury-table-cell {
          padding: 1rem 1.5rem !important;
          border-bottom: 1px solid #e2e8f0 !important;
          color: #475569 !important;
          font-size: 1rem !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          hyphens: auto !important;
          vertical-align: top !important;
        }
        
        .luxury-editor-content .luxury-table-row:hover {
          background-color: #f8fafc !important;
        }
        
        .luxury-editor-content .luxury-link {
          color: #2563eb !important;
          text-decoration: underline !important;
          text-decoration-color: #93c5fd !important;
          text-underline-offset: 0.25rem !important;
          transition: all 0.2s ease !important;
        }
        
        .luxury-editor-content .luxury-link:hover {
          color: #1d4ed8 !important;
          text-decoration-color: #3b82f6 !important;
        }
        
        .luxury-editor-content .luxury-code-block {
          background: #1e293b !important;
          color: #e2e8f0 !important;
          padding: 1.5rem !important;
          border-radius: 0.75rem !important;
          margin: 2rem 0 !important;
          overflow-x: auto !important;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
          font-size: 0.875rem !important;
          border: 1px solid #374151 !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
        }
        
        .luxury-editor-content strong {
          font-weight: 700 !important;
          color: #0f172a !important;
        }
        
        .luxury-editor-content em {
          font-style: italic !important;
          color: #475569 !important;
        }
        
        .luxury-editor-content .is-editor-empty:first-child::before {
          color: #94a3b8 !important;
          content: attr(data-placeholder) !important;
          float: left !important;
          height: 0 !important;
          pointer-events: none !important;
          font-style: italic !important;
          font-size: 1.125rem !important;
        }
        
        /* Mobile responsive adjustments */
        @media (max-width: 768px) {
          .luxury-editor-content {
            font-size: 16px !important;
          }
          
          .luxury-editor-content .luxury-heading-1 {
            font-size: 2rem !important;
            margin: 2rem 0 1rem 0 !important;
          }
          
          .luxury-editor-content .luxury-heading-2 {
            font-size: 1.5rem !important;
            margin: 1.5rem 0 0.75rem 0 !important;
            padding-left: 1rem !important;
          }
          
          .luxury-editor-content .luxury-paragraph {
            font-size: 1rem !important;
            text-align: left !important;
          }
          
          .luxury-editor-content .luxury-blockquote {
            padding: 1rem !important;
            margin: 1rem 0 !important;
          }
          
          .luxury-editor-content .luxury-table-header,
          .luxury-editor-content .luxury-table-cell {
            padding: 0.75rem !important;
            font-size: 0.875rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
