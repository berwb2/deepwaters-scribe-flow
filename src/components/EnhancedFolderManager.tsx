
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Folder, 
  FolderOpen, 
  Plus, 
  Edit, 
  Trash2, 
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { 
  listEnhancedFolders, 
  createEnhancedFolder, 
  updateEnhancedFolder, 
  deleteEnhancedFolder,
  EnhancedFolderCreationData 
} from '@/lib/api';

interface FolderItem {
  id: string;
  name: string;
  description?: string;
  color?: string;
  parent_folder_id?: string;
  document_count: number;
  created_at: string;
  children?: FolderItem[];
}

interface EnhancedFolderManagerProps {
  onFolderSelect?: (folderId: string | null) => void;
  selectedFolderId?: string | null;
  showDocumentCounts?: boolean;
}

const EnhancedFolderManager: React.FC<EnhancedFolderManagerProps> = ({
  onFolderSelect,
  selectedFolderId,
  showDocumentCounts = true
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<FolderItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  
  const [newFolder, setNewFolder] = useState<EnhancedFolderCreationData>({
    name: '',
    description: '',
    color: '#3b82f6',
    parent_id: null
  });

  const queryClient = useQueryClient();

  const { data: foldersData, isLoading } = useQuery({
    queryKey: ['enhancedFolders'],
    queryFn: listEnhancedFolders,
  });

  const folders = foldersData?.folders || [];

  // Build folder hierarchy
  const buildFolderTree = (folders: any[]): FolderItem[] => {
    const folderMap = new Map<string, FolderItem>();
    const rootFolders: FolderItem[] = [];

    // Create folder objects
    folders.forEach(folder => {
      folderMap.set(folder.id, {
        ...folder,
        children: []
      });
    });

    // Build hierarchy
    folders.forEach(folder => {
      const folderItem = folderMap.get(folder.id)!;
      if (folder.parent_folder_id) {
        const parent = folderMap.get(folder.parent_folder_id);
        if (parent) {
          parent.children!.push(folderItem);
        }
      } else {
        rootFolders.push(folderItem);
      }
    });

    return rootFolders;
  };

  const folderTree = buildFolderTree(folders);

  const handleCreateFolder = async () => {
    if (!newFolder.name.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    try {
      await createEnhancedFolder(newFolder);
      toast.success('Folder created successfully');
      setIsCreateDialogOpen(false);
      setNewFolder({ name: '', description: '', color: '#3b82f6', parent_id: null });
      queryClient.invalidateQueries({ queryKey: ['enhancedFolders'] });
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
    }
  };

  const handleEditFolder = async () => {
    if (!editingFolder || !editingFolder.name.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    try {
      await updateEnhancedFolder(editingFolder.id, {
        name: editingFolder.name,
        description: editingFolder.description,
        color: editingFolder.color
      });
      toast.success('Folder updated successfully');
      setIsEditDialogOpen(false);
      setEditingFolder(null);
      queryClient.invalidateQueries({ queryKey: ['enhancedFolders'] });
    } catch (error) {
      console.error('Error updating folder:', error);
      toast.error('Failed to update folder');
    }
  };

  const handleDeleteFolder = async (folderId: string, folderName: string) => {
    if (!confirm(`Are you sure you want to delete the folder "${folderName}"? Documents inside will not be deleted.`)) {
      return;
    }

    try {
      await deleteEnhancedFolder(folderId);
      toast.success('Folder deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['enhancedFolders'] });
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder');
    }
  };

  const toggleFolderExpansion = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFolder = (folder: FolderItem, level: number = 0) => {
    const hasChildren = folder.children && folder.children.length > 0;
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;

    return (
      <div key={folder.id} className="space-y-1">
        <div 
          className={`flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 cursor-pointer group transition-colors ${
            isSelected ? 'bg-blue-100 border border-blue-300' : ''
          }`}
          style={{ marginLeft: `${level * 20}px` }}
          onClick={() => onFolderSelect?.(folder.id)}
        >
          <div className="flex items-center space-x-2 flex-1">
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolderExpansion(folder.id);
                }}
              >
                <ChevronRight 
                  className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                />
              </Button>
            )}
            
            {isExpanded ? (
              <FolderOpen className="h-4 w-4" style={{ color: folder.color }} />
            ) : (
              <Folder className="h-4 w-4" style={{ color: folder.color }} />
            )}
            
            <span className="font-medium text-sm">{folder.name}</span>
            
            {showDocumentCounts && (
              <Badge variant="secondary" className="text-xs">
                {folder.document_count}
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setEditingFolder(folder);
                setIsEditDialogOpen(true);
              }}
            >
              <Edit className="h-3 w-3" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteFolder(folder.id, folder.name);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {folder.children!.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredFolders = folderTree.filter(folder => 
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-blue-900">Folders</h3>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          New Folder
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search folders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 border-blue-200 focus:ring-blue-500"
        />
      </div>

      {/* Folder Tree */}
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading folders...</div>
        ) : filteredFolders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? 'No folders match your search' : 'No folders created yet'}
          </div>
        ) : (
          filteredFolders.map(folder => renderFolder(folder))
        )}
      </div>

      {/* Create Folder Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Folder Name</Label>
              <Input
                id="name"
                value={newFolder.name}
                onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                placeholder="Enter folder name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newFolder.description}
                onChange={(e) => setNewFolder({ ...newFolder, description: e.target.value })}
                placeholder="Enter folder description"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="color">Folder Color</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  id="color"
                  value={newFolder.color}
                  onChange={(e) => setNewFolder({ ...newFolder, color: e.target.value })}
                  className="w-12 h-8 rounded border border-gray-300"
                />
                <span className="text-sm text-gray-600">{newFolder.color}</span>
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Folder Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
          </DialogHeader>
          
          {editingFolder && (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Folder Name</Label>
                <Input
                  id="edit-name"
                  value={editingFolder.name}
                  onChange={(e) => setEditingFolder({ ...editingFolder, name: e.target.value })}
                  placeholder="Enter folder name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea
                  id="edit-description"
                  value={editingFolder.description || ''}
                  onChange={(e) => setEditingFolder({ ...editingFolder, description: e.target.value })}
                  placeholder="Enter folder description"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-color">Folder Color</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    id="edit-color"
                    value={editingFolder.color || '#3b82f6'}
                    onChange={(e) => setEditingFolder({ ...editingFolder, color: e.target.value })}
                    className="w-12 h-8 rounded border border-gray-300"
                  />
                  <span className="text-sm text-gray-600">{editingFolder.color}</span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditFolder}>
              Update Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedFolderManager;
