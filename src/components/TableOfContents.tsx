
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, List, Eye } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ content, className = "" }) => {
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const isMobile = useIsMobile();

  // Set initial state based on screen size
  useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

  // Extract headings from content
  useEffect(() => {
    if (!content) {
      setTocItems([]);
      return;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    const items: TOCItem[] = Array.from(headings).map((heading, index) => ({
      id: `heading-${index}`,
      text: heading.textContent || '',
      level: parseInt(heading.tagName.substring(1), 10)
    }));
    
    setTocItems(items);
  }, [content]);

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let current = '';
      
      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 0) {
          current = heading.textContent || '';
        }
      });
      
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToHeading = (text: string) => {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const targetHeading = Array.from(headings).find(h => h.textContent === text);
    
    if (targetHeading) {
      targetHeading.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
      
      // Close mobile TOC after navigation
      if (isMobile) {
        setIsOpen(false);
      }
    }
  };

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* Mobile Toggle Button */}
        {isMobile && (
          <CollapsibleTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full mb-4 bg-white shadow-sm border-blue-200 hover:bg-blue-50 text-blue-700"
            >
              <List className="mr-2 h-4 w-4" />
              Table of Contents
              {isOpen ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        )}
        
        <CollapsibleContent>
          <Card className="sticky top-6 bg-white/95 backdrop-blur-sm shadow-xl border-blue-200 overflow-hidden">
            <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white">
              <CardTitle className="text-sm font-medium flex items-center">
                <Eye className="mr-2 h-4 w-4" />
                Contents
                {!isMobile && (
                  <span className="ml-auto text-xs opacity-75">
                    {tocItems.length} sections
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                <nav className="p-4 space-y-1">
                  {tocItems.map((item, index) => {
                    const isActive = activeSection === item.text;
                    const indentLevel = Math.max(0, item.level - 1);
                    
                    return (
                      <button
                        key={index}
                        onClick={() => scrollToHeading(item.text)}
                        className={`
                          block text-left w-full rounded-lg p-3 transition-all duration-200 hover:bg-blue-50 group
                          ${isActive ? 'bg-blue-100 border-l-4 border-blue-500 text-blue-900 font-medium' : 'hover:text-blue-700'}
                          ${item.level === 1 ? 'font-semibold text-blue-900 text-base' :
                            item.level === 2 ? 'font-medium text-blue-800 text-sm' :
                            item.level === 3 ? 'text-blue-700 text-sm' :
                            'text-blue-600 text-xs'}
                        `}
                        style={{ paddingLeft: `${0.75 + indentLevel * 0.75}rem` }}
                      >
                        <div className="flex items-center">
                          {item.level > 1 && (
                            <span className="mr-2 text-blue-400 opacity-60">
                              {'·'.repeat(Math.min(3, item.level - 1))}
                            </span>
                          )}
                          <span className="truncate group-hover:text-blue-800 transition-colors">
                            {item.text}
                          </span>
                          {isActive && (
                            <span className="ml-auto">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>
              
              {/* Bottom gradient fade */}
              <div className="h-4 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none"></div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default TableOfContents;
