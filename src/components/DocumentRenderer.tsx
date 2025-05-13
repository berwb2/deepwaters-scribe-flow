
import React, { useRef, useState, useEffect } from 'react';
import CollapsibleSection from './CollapsibleSection';
import { Link } from 'react-router-dom';
import { searchDocuments } from '@/lib/api';
import hljs from 'highlight.js';

interface DocumentRendererProps {
  content: string;
  onSectionClick?: (id: string) => void;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

const DocumentRenderer: React.FC<DocumentRendererProps> = ({ content, onSectionClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  
  // Process HTML content to add collapsible sections and other enhancements
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Parse the HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    // Process headings
    const headings = doc.querySelectorAll('h1, h2, h3');
    const tocItems: TocItem[] = [];
    
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      const text = heading.textContent || '';
      const id = text.toLowerCase().replace(/\s+/g, '-') || `heading-${index}`;
      
      heading.id = id;
      tocItems.push({ id, text, level });
    });
    
    setTocItems(tocItems);
    
    // Process code blocks
    const codeBlocks = doc.querySelectorAll('pre code');
    codeBlocks.forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });
    
    // Process internal links
    const links = doc.querySelectorAll('a[href^="doc:"]');
    links.forEach((link) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('doc:')) {
        const docId = href.replace('doc:', '');
        link.setAttribute('data-document-id', docId);
        link.classList.add('internal-link');
      }
    });
    
    // Update the content
    if (containerRef.current) {
      containerRef.current.innerHTML = doc.body.innerHTML;
      
      // Add click handlers to internal links
      const internalLinks = containerRef.current.querySelectorAll('.internal-link');
      internalLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const docId = link.getAttribute('data-document-id');
          if (docId) {
            window.location.href = `/documents/${docId}`;
          }
        });
      });
    }
  }, [content]);
  
  return (
    <div ref={containerRef} className="prose prose-blue max-w-none">
      {/* Content will be rendered here */}
    </div>
  );
};

export default DocumentRenderer;
