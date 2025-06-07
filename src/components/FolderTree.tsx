
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen, 
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  FolderPlus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FolderTreeNode } from '@/types/documents';
import CreateNestedFolderDialog from './CreateNestedFolderDialog';

interface FolderTreeProps {
  folders: FolderTreeNode[];
  onFolderExpand: (folderId: string) => void;
  onFolderDelete: (folderId: string) => void;
  onRefresh: () => void;
}

interface FolderNodeProps {
  folder: FolderTreeNode;
  depth: number;
  onExpand: (folderId: string) => void;
  onDelete: (folderId: string) => void;
  onRefresh: () => void;
}

const FolderNode: React.FC<FolderNodeProps> = ({ 
  folder, 
  depth, 
  onExpand, 
  onDelete, 
  onRefresh 
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const hasChildren = folder.children && folder.children.length > 0;

  const priorityStyles: Record<string, string> = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800"
  };

  const handleCreateSubfolder = () => {
    setIsCreateDialogOpen(true);
  };

  const handleDeleteFolder = () => {
    if (window.confirm(`Are you sure you want to delete "${folder.name}"? This will also delete all subfolders and documents inside.`)) {
      onDelete(folder.id);
    }
  };

  return (
    <div className="w-full">
      <div 
        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg group"
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
      >
        {/* Expand/Collapse Button */}
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-6 w-6"
          onClick={() => hasChildren && onExpand(folder.id)}
          disabled={!hasChildren}
        >
          {hasChildren ? (
            folder.isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : (
            <div className="w-4 h-4" />
          )}
        </Button>

        {/* Folder Icon */}
        <div className="flex-shrink-0">
          {folder.isExpanded ? (
            <FolderOpen className="h-5 w-5 text-blue-500" />
          ) : (
            <Folder className="h-5 w-5 text-blue-500" />
          )}
        </div>

        {/* Folder Info */}
        <Link 
          to={`/folders/${folder.id}`} 
          className="flex-1 min-w-0"
        >
          <div className="flex items-center gap-2">
            <span 
              className="font-medium truncate"
              style={folder.color ? { color: folder.color } : {}}
            >
              {folder.name}
            </span>
            
            {folder.priority && (
              <Badge variant="outline" className={`text-xs ${priorityStyles[folder.priority]}`}>
                {folder.priority}
              </Badge>
            )}
            
            {folder.document_count !== undefined && folder.document_count > 0 && (
              <Badge variant="outline" className="text-xs">
                {folder.document_count} docs
              </Badge>
            )}
          </div>
          
          {folder.description && (
            <p className="text-xs text-muted-foreground truncate mt-1">
              {folder.description}
            </p>
          )}
        </Link>

        {/* Action Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleCreateSubfolder}>
              <FolderPlus className="mr-2 h-4 w-4" />
              Create Subfolder
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDeleteFolder}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Render Children */}
      {folder.isExpanded && hasChildren && (
        <div className="ml-2">
          {folder.children.map((child) => (
            <FolderNode
              key={child.id}
              folder={child}
              depth={depth + 1}
              onExpand={onExpand}
              onDelete={onDelete}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}

      {/* Create Subfolder Dialog */}
      <CreateNestedFolderDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        parentFolderId={folder.id}
        onFolderCreated={onRefresh}
      />
    </div>
  );
};

const FolderTree: React.FC<FolderTreeProps> = ({ 
  folders, 
  onFolderExpand, 
  onFolderDelete, 
  onRefresh 
}) => {
  return (
    <div className="space-y-1">
      {folders.map((folder) => (
        <FolderNode
          key={folder.id}
          folder={folder}
          depth={0}
          onExpand={onFolderExpand}
          onDelete={onFolderDelete}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
};

export default FolderTree;
