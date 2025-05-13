
import hljs from 'highlight.js';

// Function to extract headings from HTML content
export function extractHeadings(content: string): { id: string; text: string; level: number }[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  return Array.from(headings).map((heading, index) => {
    const level = parseInt(heading.tagName.substring(1), 10);
    const text = heading.textContent || '';
    const id = text.toLowerCase().replace(/\s+/g, '-') || `heading-${index}`;
    
    return { id, text, level };
  });
}

// Function to highlight code blocks
export function highlightCodeBlocks(content: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const codeBlocks = doc.querySelectorAll('pre code');
  
  codeBlocks.forEach((block) => {
    try {
      const highlightedCode = hljs.highlightAuto(block.textContent || '').value;
      block.innerHTML = highlightedCode;
      block.parentElement?.classList.add('code-block');
    } catch (e) {
      console.error('Failed to highlight code block:', e);
    }
  });
  
  return doc.body.innerHTML;
}

// Function to process cross-document links
export function processCrossLinks(content: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const links = doc.querySelectorAll('a');
  
  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('doc:')) {
      const docId = href.replace('doc:', '');
      link.setAttribute('data-document-id', docId);
      link.classList.add('internal-link');
      link.setAttribute('href', `/documents/${docId}`);
    }
  });
  
  return doc.body.innerHTML;
}

// Function to format the document content with all enhancements
export function formatDocumentContent(content: string): string {
  let formattedContent = content;
  
  // Highlight code blocks
  formattedContent = highlightCodeBlocks(formattedContent);
  
  // Process cross-document links
  formattedContent = processCrossLinks(formattedContent);
  
  return formattedContent;
}
