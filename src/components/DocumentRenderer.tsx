
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
    return (
      <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-teal-50 rounded-lg">
        <div className="text-blue-300 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-blue-600 font-medium">No content available</p>
        <p className="text-blue-500 text-sm mt-1">Start writing to see your content here</p>
      </div>
    );
  }

  // Process HTML content to enhance formatting with DeepWaters blue-themed styling
  let processedContent = document.content as string;
  if (typeof processedContent === 'string') {
    // Enhanced heading styles with blue theme
    processedContent = processedContent
      .replace(/<h1([^>]*)>/g, '<h1$1 class="luxury-heading-1">')
      .replace(/<h2([^>]*)>/g, '<h2$1 class="luxury-heading-2">')
      .replace(/<h3([^>]*)>/g, '<h3$1 class="luxury-heading-3">')
      .replace(/<h4([^>]*)>/g, '<h4$1 class="luxury-heading-4">')
      .replace(/<h5([^>]*)>/g, '<h5$1 class="luxury-heading-5">')
      .replace(/<h6([^>]*)>/g, '<h6$1 class="luxury-heading-6">');
    
    // Enhanced paragraph styling
    processedContent = processedContent
      .replace(/<p([^>]*)>/g, '<p$1 class="luxury-paragraph">');
    
    // Enhanced list styling
    processedContent = processedContent
      .replace(/<ul([^>]*)>/g, '<ul$1 class="luxury-list-bullet">')
      .replace(/<ol([^>]*)>/g, '<ol$1 class="luxury-list-numbered">')
      .replace(/<li([^>]*)>/g, '<li$1 class="luxury-list-item">');
    
    // Enhanced blockquote styling
    processedContent = processedContent
      .replace(/<blockquote([^>]*)>/g, '<blockquote$1 class="luxury-blockquote">');
    
    // Enhanced table styling
    processedContent = processedContent
      .replace(/<table([^>]*)>/g, '<table$1 class="luxury-table">')
      .replace(/<th([^>]*)>/g, '<th$1 class="luxury-table-header">')
      .replace(/<td([^>]*)>/g, '<td$1 class="luxury-table-cell">');
    
    // Enhanced code styling
    processedContent = processedContent
      .replace(/<code([^>]*)>/g, '<code$1 class="luxury-inline-code">')
      .replace(/<pre([^>]*)>/g, '<pre$1 class="luxury-code-block">');
    
    // Add luxury dividers
    processedContent = processedContent
      .replace(/<hr\s*\/?>/g, '<hr class="luxury-divider" />');
  }

  return (
    <div className="relative">
      {/* Luxury Document Container */}
      <div 
        className={`luxury-document-content ${className}`}
        dangerouslySetInnerHTML={{ __html: processedContent }}
        onClick={(e) => {
          if (onSectionClick && e.target instanceof HTMLElement) {
            const targetEl = e.target as HTMLElement;
            const headingEl = targetEl.closest('h1, h2, h3, h4, h5, h6');
            if (headingEl && headingEl.id) {
              onSectionClick(headingEl.id);
            }
          }
        }}
      />
      
      {/* Enhanced Blue-Themed Document Styling */}
      <style>{`
        .luxury-document-content {
          max-width: 900px;
          margin: 0 auto;
          padding: 3rem 2rem;
          background: linear-gradient(135deg, #fafafa 0%, #f8faff 100%);
          border-radius: 1rem;
          box-shadow: 0 10px 40px rgba(59, 130, 246, 0.08);
          font-family: 'Georgia', 'Times New Roman', serif;
          line-height: 1.8;
          color: #1e293b;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        
        .luxury-document-content .luxury-heading-1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1e40af !important;
          margin: 3rem 0 1.5rem 0;
          padding-bottom: 1rem;
          border-bottom: 3px solid;
          border-image: linear-gradient(90deg, #3b82f6, #06b6d4, #10b981) 1;
          background: linear-gradient(135deg, #1e40af, #0891b2);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.02em;
        }
        
        .luxury-document-content .luxury-heading-2 {
          font-size: 2rem;
          font-weight: 600;
          color: #1e40af !important;
          margin: 2.5rem 0 1.25rem 0;
          position: relative;
          letter-spacing: -0.01em;
        }
        
        .luxury-document-content .luxury-heading-2:before {
          content: '';
          position: absolute;
          left: -1rem;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 2rem;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          border-radius: 2px;
        }
        
        .luxury-document-content .luxury-heading-3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1d4ed8 !important;
          margin: 2rem 0 1rem 0;
        }
        
        .luxury-document-content .luxury-heading-4 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2563eb !important;
          margin: 1.5rem 0 0.75rem 0;
        }
        
        .luxury-document-content .luxury-heading-5 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #3b82f6 !important;
          margin: 1.25rem 0 0.5rem 0;
        }
        
        .luxury-document-content .luxury-heading-6 {
          font-size: 1rem;
          font-weight: 600;
          color: #60a5fa !important;
          margin: 1rem 0 0.5rem 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .luxury-document-content .luxury-paragraph {
          margin-bottom: 1.5rem;
          font-size: 1.125rem;
          line-height: 1.8;
          color: #334155;
          text-align: justify;
          text-justify: inter-word;
        }
        
        .luxury-document-content .luxury-list-bullet {
          margin: 1.5rem 0;
          padding-left: 1.5rem;
        }
        
        .luxury-document-content .luxury-list-numbered {
          margin: 1.5rem 0;
          padding-left: 1.5rem;
        }
        
        .luxury-document-content .luxury-list-item {
          margin-bottom: 0.75rem;
          font-size: 1.125rem;
          line-height: 1.7;
          color: #475569;
          position: relative;
        }
        
        .luxury-document-content .luxury-list-bullet .luxury-list-item:before {
          content: '●';
          color: #3b82f6;
          font-weight: bold;
          position: absolute;
          left: -1.5rem;
        }
        
        .luxury-document-content .luxury-blockquote {
          border-left: 4px solid #3b82f6;
          padding: 1.5rem 2rem;
          margin: 2rem 0;
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          border-radius: 0 0.5rem 0.5rem 0;
          font-style: italic;
          font-size: 1.125rem;
          color: #1e40af;
          position: relative;
        }
        
        .luxury-document-content .luxury-blockquote:before {
          content: '"';
          font-size: 4rem;
          color: #93c5fd;
          position: absolute;
          left: 0.5rem;
          top: -0.5rem;
          font-family: serif;
        }
        
        .luxury-document-content .luxury-table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
          background: white;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.1);
        }
        
        .luxury-document-content .luxury-table-header {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          padding: 1rem 1.5rem;
          font-weight: 600;
          text-align: left;
          font-size: 1rem;
          word-wrap: break-word;
          overflow-wrap: break-word;
          hyphens: auto;
        }
        
        .luxury-document-content .luxury-table-cell {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          color: #475569;
          font-size: 1rem;
          word-wrap: break-word;
          overflow-wrap: break-word;
          hyphens: auto;
          vertical-align: top;
        }
        
        .luxury-document-content .luxury-table tbody tr:hover {
          background-color: #f8fafc;
        }
        
        .luxury-document-content .luxury-inline-code {
          background: #f1f5f9;
          color: #dc2626;
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875rem;
          border: 1px solid #e2e8f0;
        }
        
        .luxury-document-content .luxury-code-block {
          background: #1e293b;
          color: #e2e8f0;
          padding: 1.5rem;
          border-radius: 0.75rem;
          margin: 2rem 0;
          overflow-x: auto;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875rem;
          border: 1px solid #374151;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        
        .luxury-document-content .luxury-divider {
          margin: 3rem 0;
          border: none;
          height: 2px;
          background: linear-gradient(90deg, transparent, #3b82f6, #06b6d4, #10b981, transparent);
          border-radius: 1px;
        }
        
        .luxury-document-content strong {
          font-weight: 700;
          color: #0f172a;
        }
        
        .luxury-document-content em {
          font-style: italic;
          color: #475569;
        }
        
        .luxury-document-content a {
          color: #2563eb;
          text-decoration: underline;
          text-decoration-color: #93c5fd;
          text-underline-offset: 0.25rem;
          transition: all 0.2s ease;
        }
        
        .luxury-document-content a:hover {
          color: #1d4ed8;
          text-decoration-color: #3b82f6;
        }
        
        /* Blue-themed highlights for important text */
        .luxury-document-content mark {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          color: #1e40af;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
        }
        
        /* Mobile Responsive Adjustments */
        @media (max-width: 768px) {
          .luxury-document-content {
            padding: 2rem 1rem;
            margin: 0 0.5rem;
          }
          
          .luxury-document-content .luxury-heading-1 {
            font-size: 2rem;
            margin: 2rem 0 1rem 0;
          }
          
          .luxury-document-content .luxury-heading-2 {
            font-size: 1.5rem;
            margin: 1.5rem 0 0.75rem 0;
          }
          
          .luxury-document-content .luxury-paragraph {
            font-size: 1rem;
            text-align: left;
          }
          
          .luxury-document-content .luxury-table {
            font-size: 0.875rem;
          }
          
          .luxury-document-content .luxury-table-header,
          .luxury-document-content .luxury-table-cell {
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default DocumentRenderer;
