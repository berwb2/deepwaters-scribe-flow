
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

  // Process HTML content to enhance headers with colors
  let processedContent = document.content as string;
  if (typeof processedContent === 'string') {
    // Add classes to headers to style them with our themed colors
    processedContent = processedContent
      .replace(/<h1/g, '<h1 class="colored-heading text-water-deep"')
      .replace(/<h2/g, '<h2 class="text-water"')
      .replace(/<h3/g, '<h3 class="text-blue-600"')
      .replace(/<h4/g, '<h4 class="text-blue-500"')
      .replace(/<h5/g, '<h5 class="text-blue-400"')
      .replace(/<h6/g, '<h6 class="text-blue-300"');
    
    // Add color-line class to horizontal rules
    processedContent = processedContent
      .replace(/<hr\s*\/?>/g, '<hr class="color-line" />');
  }

  // For HTML content (like from ProseMirror)
  return (
    <div 
      className={`prose dark:prose-invert max-w-none ${className} document-content`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
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
