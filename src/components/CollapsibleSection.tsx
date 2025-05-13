
import React, { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  title: string;
  level: number;
  id: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  title, 
  level, 
  id, 
  children, 
  defaultOpen = true 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  // Map heading level to appropriate tag and styles
  const getHeadingProps = () => {
    switch(level) {
      case 1:
        return {
          className: "text-3xl font-serif font-medium text-water-deep",
          Tag: 'h1' as const
        };
      case 2:
        return {
          className: "text-2xl font-serif font-medium text-water",
          Tag: 'h2' as const
        };
      case 3:
        return {
          className: "text-xl font-serif font-medium text-water-light",
          Tag: 'h3' as const
        };
      default:
        return {
          className: "text-lg font-serif font-medium",
          Tag: 'h4' as const
        };
    }
  };
  
  const { className, Tag } = getHeadingProps();
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-4">
      <div className="flex items-center gap-2">
        <CollapsibleTrigger className="flex items-center gap-1 hover:text-water-deep transition-colors">
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <Tag id={id} className={cn(className, "flex-1")}>
          {title}
        </Tag>
      </div>
      <CollapsibleContent className="mt-2 pl-5 border-l border-muted">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CollapsibleSection;
