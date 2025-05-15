
import React from 'react';
import { DocumentMeta } from '@/types/documents';
import 'highlight.js/styles/github.css';

interface DocumentRendererProps {
  document: DocumentMeta;
  className?: string;
  onSectionClick?: (id: string) => void;
}

// This component is read-only and used for rendering the document content
const DocumentRenderer: React.FC<DocumentRendererProps> = ({ 
  document, 
  className = "",
  onSectionClick
}) => {
  if (!document || !document.content) {
    return <div className="text-muted-foreground">No content available</div>;
  }

  // For JSON documents, parse and prettify
  if (document.content_type === 'json') {
    try {
      const jsonObject = typeof document.content === 'string' 
        ? JSON.parse(document.content) 
        : document.content;
      
      const prettyJson = JSON.stringify(jsonObject, null, 2);
      
      return (
        <pre className={`bg-muted p-4 rounded-lg overflow-x-auto ${className} document-content`}>
          <code>{prettyJson}</code>
        </pre>
      );
    } catch (e) {
      return <div className="text-destructive">Invalid JSON document</div>;
    }
  }

  // For HTML content (like from ProseMirror)
  return (
    <div 
      className={`prose dark:prose-invert max-w-none ${className} document-content`}
      dangerouslySetInnerHTML={{ __html: document.content as string }}
      onClick={(e) => {
        if (onSectionClick && e.target instanceof HTMLElement) {
          // If the clicked element has an ID, call the onSectionClick handler
          const targetEl = e.target as HTMLElement;
          const headingEl = targetEl.closest('h1, h2, h3, h4, h5, h6');
          if (headingEl && headingEl.id) {
            onSectionClick(headingEl.id);
          }
        }
      }}
    />
  );
};

export default DocumentRenderer;
