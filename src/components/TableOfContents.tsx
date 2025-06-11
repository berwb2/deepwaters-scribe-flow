
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface TOCItem {
  id: string;
  text: string;
  level: number;
  element?: Element;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
  onSectionClick?: (id: string) => void;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ 
  content, 
  className = "",
  onSectionClick,
  isOpen = true,
  onToggle
}) => {
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [activeSection, setActiveSection] = useState<string>('');

  const generateTableOfContents = (htmlContent: string): TOCItem[] => {
    if (!htmlContent) return [];
    
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
      
      return Array.from(headings).map((heading, index) => {
        const text = heading.textContent?.trim() || '';
        const level = parseInt(heading.tagName[1]);
        const id = `heading-${index}-${text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;
        
        return {
          id,
          text,
          level,
          element: heading
        };
      }).filter(item => item.text.length > 0);
    } catch (error) {
      console.error('Error generating table of contents:', error);
      return [];
    }
  };

  useEffect(() => {
    const items = generateTableOfContents(content);
    setTocItems(items);
  }, [content]);

  useEffect(() => {
    // Set up intersection observer for active section highlighting
    if (tocItems.length === 0) return;

    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const heading = entry.target as HTMLElement;
            const headingText = heading.textContent?.trim() || '';
            const matchingItem = tocItems.find(item => item.text === headingText);
            if (matchingItem) {
              setActiveSection(matchingItem.id);
            }
          }
        });
      },
      {
        rootMargin: '-20% 0px -80% 0px',
        threshold: 0
      }
    );

    headings.forEach((heading) => observer.observe(heading));

    return () => {
      headings.forEach((heading) => observer.unobserve(heading));
    };
  }, [tocItems]);

  const scrollToHeading = (item: TOCItem) => {
    try {
      // Find the actual heading in the rendered document
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const targetHeading = Array.from(headings).find(h => {
        const element = h as HTMLElement;
        return element.textContent?.trim() === item.text;
      });
      
      if (targetHeading) {
        const element = targetHeading as HTMLElement;
        
        // Add smooth scroll behavior
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
        
        // Highlight the section briefly
        element.style.transition = 'background-color 0.3s ease';
        element.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
        setTimeout(() => {
          element.style.backgroundColor = '';
        }, 1500);
        
        // Update active section
        setActiveSection(item.id);
        
        // Call optional callback
        if (onSectionClick) {
          onSectionClick(item.id);
        }
      }
    } catch (error) {
      console.error('Error scrolling to heading:', error);
    }
  };

  const handleToggle = () => {
    const newState = !isOpen;
    if (onToggle) {
      onToggle(newState);
    }
  };

  if (tocItems.length === 0) {
    return null;
  }

  const TocContent = () => (
    <Card className={`bg-white/95 backdrop-blur-sm shadow-xl border-blue-100 ${className}`}>
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-t-lg">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center">
            <Eye className="mr-2 h-4 w-4" />
            Table of Contents
          </div>
          <span className="text-xs opacity-75">
            {tocItems.length} sections
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 max-h-96 overflow-y-auto">
        <nav className="space-y-1 py-4">
          {tocItems.map((item, index) => {
            const isActive = activeSection === item.id;
            const indentLevel = Math.min(item.level - 1, 4); // Cap indentation at level 5
            
            return (
              <button
                key={`${item.id}-${index}`}
                onClick={() => scrollToHeading(item)}
                className={`block text-left text-sm transition-all duration-200 w-full rounded-md p-2 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                  isActive 
                    ? 'bg-blue-100 text-blue-900 font-medium border-l-4 border-blue-500' 
                    : 'text-gray-700 hover:text-blue-600'
                } ${
                  item.level === 1 ? 'font-semibold text-base' :
                  item.level === 2 ? 'font-medium' :
                  'font-normal'
                }`}
                style={{ 
                  marginLeft: `${indentLevel * 12}px`,
                  fontSize: item.level === 1 ? '0.95rem' : 
                           item.level === 2 ? '0.9rem' : '0.85rem'
                }}
                title={`Go to: ${item.text}`}
              >
                <span className="flex items-center">
                  {item.level > 2 && (
                    <span className="mr-2 text-blue-400">•</span>
                  )}
                  <span className="truncate">{item.text}</span>
                </span>
              </button>
            );
          })}
        </nav>
      </CardContent>
    </Card>
  );

  // Mobile version with collapsible behavior
  return (
    <div className="lg:hidden">
      <Collapsible open={isOpen} onOpenChange={handleToggle}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full mb-4 bg-white shadow-sm border-blue-200 hover:bg-blue-50"
          >
            <FileText className="mr-2 h-4 w-4" />
            Table of Contents ({tocItems.length})
            {isOpen ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <TocContent />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

// Desktop version (always visible)
export const DesktopTableOfContents: React.FC<TableOfContentsProps> = (props) => {
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  
  useEffect(() => {
    const generateTableOfContents = (htmlContent: string): TOCItem[] => {
      if (!htmlContent) return [];
      
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
        
        return Array.from(headings).map((heading, index) => {
          const text = heading.textContent?.trim() || '';
          const level = parseInt(heading.tagName[1]);
          const id = `heading-${index}-${text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;
          
          return {
            id,
            text,
            level
          };
        }).filter(item => item.text.length > 0);
      } catch (error) {
        console.error('Error generating table of contents:', error);
        return [];
      }
    };

    const items = generateTableOfContents(props.content);
    setTocItems(items);
  }, [props.content]);

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <div className="hidden lg:block">
      <TableOfContents {...props} />
    </div>
  );
};

export default TableOfContents;
