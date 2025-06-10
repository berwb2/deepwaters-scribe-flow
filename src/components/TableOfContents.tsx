
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, List } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
  element?: Element;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
  defaultOpen?: boolean;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ 
  content, 
  className = '', 
  defaultOpen = true 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const generateTableOfContents = (): TocItem[] => {
    if (!content) return [];
    
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
      
      return Array.from(headings).map((heading, index) => ({
        id: `heading-${index}`,
        text: heading.textContent?.trim() || '',
        level: parseInt(heading.tagName[1]),
        element: heading
      })).filter(item => item.text.length > 0);
    } catch (error) {
      console.error('Error generating table of contents:', error);
      return [];
    }
  };

  const tableOfContents = generateTableOfContents();

  const scrollToHeading = (level: number, text: string) => {
    // Find the actual heading element in the document
    const headings = document.querySelectorAll(`h${level}`);
    const targetHeading = Array.from(headings).find(h => 
      h.textContent?.trim() === text
    );
    
    if (targetHeading) {
      targetHeading.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  if (tableOfContents.length === 0) {
    return null;
  }

  return (
    <Card className={`${className}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-600 flex items-center">
                <List className="mr-2 h-4 w-4" />
                Table of Contents
              </CardTitle>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <nav className="space-y-1 max-h-96 overflow-y-auto">
              {tableOfContents.map((item, index) => (
                <Button
                  key={`${item.id}-${index}`}
                  variant="ghost"
                  size="sm"
                  onClick={() => scrollToHeading(item.level, item.text)}
                  className={`w-full justify-start text-left h-auto py-2 px-2 hover:bg-blue-50 hover:text-blue-700 transition-colors ${
                    item.level === 1 ? 'font-medium text-gray-900 pl-2' :
                    item.level === 2 ? 'text-gray-700 pl-4' :
                    item.level === 3 ? 'text-gray-600 pl-6' :
                    item.level === 4 ? 'text-gray-500 pl-8' :
                    'text-gray-400 pl-10'
                  }`}
                >
                  <span className="text-xs block truncate leading-relaxed">
                    {item.text}
                  </span>
                </Button>
              ))}
            </nav>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default TableOfContents;
