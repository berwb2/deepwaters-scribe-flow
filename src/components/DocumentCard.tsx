import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, FileCode, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

export type DocType = 'plan' | 'doctrine' | 'reflection';

export interface DocumentMeta {
  id: string;
  title: string;
  content: string;
  content_type: DocType;
  created_at: string;
  updated_at: string;
  is_template?: boolean;
  metadata?: any;
}

export interface DocumentCardProps {
  document: DocumentMeta;
  className?: string;
  contextMenuItems?: Array<{label: string, onClick: () => void}>;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, className, contextMenuItems }) => {
  // Format the date
  const lastEdited = new Date(document.updated_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  // Get document icon based on type
  const getDocumentIcon = () => {
    switch (document.content_type) {
      case 'plan':
        return <FileText className="h-5 w-5" />;
      case 'doctrine':
        return <BookOpen className="h-5 w-5" />;
      case 'reflection':
        return <FileCode className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };
  
  // Get excerpt from content
  const getExcerpt = (content: string, maxLength: number = 100) => {
    // Remove HTML tags
    const textContent = content.replace(/<[^>]*>/g, '');
    if (textContent.length <= maxLength) return textContent;
    return textContent.substring(0, maxLength) + '...';
  };
  
  // Wrap the card content with ContextMenu if contextMenuItems are provided
  const cardContent = (
    <Card className={cn("overflow-hidden transition-all duration-200 hover:shadow-md", className)}>
      <Link to={`/documents/${document.id}`} className="block h-full">
        <CardContent className="p-5">
          <div className="flex items-center mb-2">
            <div className="mr-3 text-primary">
              {getDocumentIcon()}
            </div>
            <h3 className="font-medium text-lg truncate">{document.title}</h3>
          </div>
          
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {getExcerpt(document.content)}
          </p>
          
          <div className="flex items-center justify-between mt-4">
            <Badge variant="outline">
              {document.content_type.charAt(0).toUpperCase() + document.content_type.slice(1)}
            </Badge>
            <span className="text-xs text-muted-foreground">{lastEdited}</span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
  
  // If we have context menu items, wrap the card in a ContextMenu
  if (contextMenuItems && contextMenuItems.length > 0) {
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {cardContent}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          {contextMenuItems.map((item, index) => (
            <ContextMenuItem key={index} onClick={item.onClick}>
              {item.label}
            </ContextMenuItem>
          ))}
        </ContextMenuContent>
      </ContextMenu>
    );
  }
  
  // Otherwise just return the card
  return cardContent;
};

export default DocumentCard;
