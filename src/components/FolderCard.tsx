
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Folder as FolderIcon } from "lucide-react";
import { format } from "date-fns";
import { FolderMeta } from '@/types/documents';

// Export the FolderMeta type from our new types file
export { type FolderMeta };

const getPriorityColor = (priority: string | null) => {
  switch (priority) {
    case 'high':
      return 'bg-red-500 text-white';
    case 'medium':
      return 'bg-amber-500 text-white';
    case 'low':
      return 'bg-green-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

const getFolderColor = (color: string | null) => {
  if (!color) return 'text-blue-500';
  
  switch (color.toLowerCase()) {
    case 'blue':
      return 'text-blue-500';
    case 'green':
      return 'text-green-500';
    case 'red':
      return 'text-red-500';
    case 'purple':
      return 'text-purple-500';
    case 'amber':
      return 'text-amber-500';
    case 'indigo':
      return 'text-indigo-500';
    case 'water':
      return 'text-water';
    default:
      return 'text-blue-500';
  }
};

const FolderCard = ({ folder }: { folder: FolderMeta }) => {
  const formattedDate = format(new Date(folder.created_at), 'MMM dd, yyyy');
  const folderColor = getFolderColor(folder.color);
  
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-serif flex items-center">
            <FolderIcon className={`h-5 w-5 mr-2 ${folderColor}`} />
            <Link to={`/folders/${folder.id}`} className="hover:text-primary transition-colors">
              {folder.name}
            </Link>
          </CardTitle>
          {folder.priority && (
            <Badge className={getPriorityColor(folder.priority)}>
              {folder.priority.charAt(0).toUpperCase() + folder.priority.slice(1)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {folder.description && (
          <p className="text-muted-foreground text-sm mb-3">{folder.description}</p>
        )}
        
        {folder.category && (
          <Badge variant="outline" className="mb-2">
            {folder.category.charAt(0).toUpperCase() + folder.category.slice(1)}
          </Badge>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground pt-2 border-t">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center">
            <FileText className="h-3 w-3 mr-1" />
            <span>{folder.document_count || 0} documents</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default FolderCard;
