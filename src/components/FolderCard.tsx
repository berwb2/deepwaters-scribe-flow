
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Folder, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FolderPriority = 'low' | 'medium' | 'high';
export type FolderCategory = 'personal' | 'work' | 'school' | 'project' | 'other';

export interface FolderMeta {
  id: string;
  name: string;
  description?: string;
  color?: string;
  priority?: FolderPriority;
  category?: FolderCategory;
  document_count: number;
  created_at: string;
}

interface FolderCardProps {
  folder: FolderMeta;
  className?: string;
}

const FolderCard: React.FC<FolderCardProps> = ({ folder, className }) => {
  // Map priority to color styles
  const priorityStyles = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800"
  };
  
  // Map category to display names
  const categoryNames = {
    personal: "Personal",
    work: "Work",
    school: "School",
    project: "Project",
    other: "Other"
  };
  
  const folderColorStyle = folder.color ? {
    backgroundColor: `${folder.color}20`, // Using transparency for background
    borderLeft: `4px solid ${folder.color}`
  } : {};

  return (
    <Link to={`/folders/${folder.id}`} className="block">
      <Card 
        className={cn(
          "transition-all duration-200 hover:shadow-md hover:-translate-y-1", 
          className
        )} 
        style={folderColorStyle}
      >
        <CardContent className="p-4">
          <div className="flex items-center mb-2">
            <div className="mr-3">
              <FolderOpen 
                className="h-6 w-6" 
                style={folder.color ? { color: folder.color } : {}} 
              />
            </div>
            <h3 className="font-medium text-lg truncate flex-1">{folder.name}</h3>
          </div>
          
          {folder.description && (
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {folder.description}
            </p>
          )}
          
          <div className="flex flex-wrap gap-2 mt-3">
            {folder.priority && (
              <Badge variant="outline" className={priorityStyles[folder.priority]}>
                {folder.priority.charAt(0).toUpperCase() + folder.priority.slice(1)} Priority
              </Badge>
            )}
            
            {folder.category && (
              <Badge variant="outline" className="bg-slate-100">
                {categoryNames[folder.category]}
              </Badge>
            )}
            
            <Badge variant="outline" className="ml-auto">
              {folder.document_count} {folder.document_count === 1 ? 'document' : 'documents'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default FolderCard;
