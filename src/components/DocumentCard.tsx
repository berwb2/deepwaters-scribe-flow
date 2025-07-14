
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MoreVertical } from "lucide-react";
import { format, formatDistance, isValid } from "date-fns";
import { DocType, DocumentMeta } from '@/types/documents';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Update the export with the same name but imported from the new types file
export { type DocumentMeta };

const getContentTypeColor = (type: DocType) => {
  switch (type) {
    case 'plan':
      return 'bg-blue-400 text-white';
    case 'doctrine':
      return 'bg-blue-500 text-white';
    case 'strategy':
      return 'bg-blue-600 text-white';
    case 'report':
      return 'bg-blue-300 text-white';
    case 'memo':
      return 'bg-blue-200 text-blue-800';
    case 'note':
      return 'bg-blue-100 text-blue-700';
    case 'analysis':
      return 'bg-blue-700 text-white';
    case 'proposal':
      return 'bg-blue-800 text-white';
    case 'framework':
      return 'bg-blue-900 text-white';
    case 'guide':
      return 'bg-blue-400 text-white';
    case 'manifesto':
      return 'bg-blue-600 text-white';
    default:
      return 'bg-blue-500 text-white';
  }
};

interface DocumentCardProps {
  document: DocumentMeta;
  onUpdate?: () => void;
  contextMenuItems?: Array<{
    label: string;
    onClick: () => Promise<void> | void;
  }>;
}

const DocumentCard = ({ document, onUpdate, contextMenuItems }: DocumentCardProps) => {
  // Handle both string and Date types for dates with proper validation
  const createValidDate = (dateValue: string | Date): Date => {
    if (!dateValue) {
      return new Date(); // Fallback to current date if no date provided
    }
    
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    return isValid(date) ? date : new Date(); // Fallback to current date if invalid
  };

  const createdAtDate = createValidDate(document.created_at);
  const updatedAtDate = createValidDate(document.updated_at);
  
  // Format dates for display
  const formattedCreatedDate = isValid(createdAtDate) 
    ? format(createdAtDate, 'MMM dd, yyyy')
    : 'Unknown date';
    
  const formattedUpdatedDate = isValid(updatedAtDate) 
    ? format(updatedAtDate, 'MMM dd, yyyy')
    : 'Unknown date';
    
  const timeAgo = isValid(updatedAtDate)
    ? formatDistance(updatedAtDate, new Date(), { addSuffix: true })
    : 'Unknown time';
  
  // Get first 100 characters of content for preview
  const contentPreview = document.content?.substring(0, 100) + (document.content && document.content.length > 100 ? '...' : '') || 'No content';
  
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-serif">
            <Link to={`/documents/${document.id}`} className="hover:text-blue-600 transition-colors">
              {document.title || 'Untitled Document'}
            </Link>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getContentTypeColor(document.content_type)}>
              {document.content_type.charAt(0).toUpperCase() + document.content_type.slice(1)}
            </Badge>
            
            {contextMenuItems && contextMenuItems.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-muted">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {contextMenuItems.map((item, index) => (
                    <DropdownMenuItem key={index} onClick={item.onClick}>
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-muted-foreground text-sm line-clamp-3">{contentPreview}</p>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground pt-2 border-t">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            <span title={`Created: ${formattedCreatedDate}`}>Created {formattedCreatedDate}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span title={`Updated: ${formattedUpdatedDate}`}>Updated {timeAgo}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DocumentCard;
