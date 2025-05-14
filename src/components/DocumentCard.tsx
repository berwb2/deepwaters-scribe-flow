
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MoreVertical } from "lucide-react";
import { format, formatDistance } from "date-fns";
import { DocType, DocumentMeta } from '@/types/documents';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Update the export with the same name but imported from the new types file
export { type DocumentMeta };

const getContentTypeColor = (type: DocType) => {
  switch (type) {
    case 'plan':
      return 'bg-water text-white';
    case 'doctrine':
      return 'bg-blue-500 text-white';
    case 'reflection':
      return 'bg-indigo-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

interface DocumentCardProps {
  document: DocumentMeta;
  contextMenuItems?: Array<{
    label: string;
    onClick: () => Promise<void> | void;
  }>;
}

const DocumentCard = ({ document, contextMenuItems }: DocumentCardProps) => {
  const formattedDate = format(new Date(document.updated_at), 'MMM dd, yyyy');
  const timeAgo = formatDistance(new Date(document.updated_at), new Date(), { addSuffix: true });
  
  // Get first 100 characters of content for preview
  const contentPreview = document.content.substring(0, 100) + (document.content.length > 100 ? '...' : '');
  
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-serif">
            <Link to={`/documents/${document.id}`} className="hover:text-primary transition-colors">
              {document.title}
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
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>{timeAgo}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DocumentCard;
