import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Folder, List, Grid3X3 } from 'lucide-react';
import { listFolders, deleteFolder } from '@/lib/api';
import CreateFolderDialog from '@/components/CreateFolderDialog';
import FolderCard from '@/components/FolderCard';
import FolderTree from '@/components/FolderTree';
import { FolderMeta, FolderTreeNode } from '@/types/documents';
import { toast } from '@/components/ui/sonner';

const Folders = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'tree'>('grid');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Fetch folders using React Query
  const { data: folderData, isLoading, refetch } = useQuery({
    queryKey: ['folders'],
    queryFn: () => listFolders(),
  });

  const folders = folderData?.folders || [];

  // Build folder tree structure
  const buildFolderTree = (folders: FolderMeta[]): FolderTreeNode[] => {
    const folderMap = new Map<string, FolderTreeNode>();
    const rootFolders: FolderTreeNode[] = [];

    // Create nodes with default parent_id as null if missing
    folders.forEach(folder => {
      folderMap.set(folder.id, {
        ...folder,
        parent_id: folder.parent_id || null,
        children: [],
        isExpanded: expandedFolders.has(folder.id)
      });
    });

    // Build tree structure
    folderMap.forEach(folder => {
      if (!folder.parent_id) {
        rootFolders.push(folder);
      } else {
        const parent = folderMap.get(folder.parent_id);
        if (parent) {
          parent.children.push(folder);
        } else {
          // Parent doesn't exist, treat as root folder
          rootFolders.push(folder);
        }
      }
    });

    return rootFolders;
  };

  const folderTree = buildFolderTree(folders);

  const handleFolderExpand = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleFolderDelete = async (folderId: string) => {
    try {
      await deleteFolder(folderId);
      refetch();
    } catch (error) {
      toast.error('Failed to delete folder');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12 flex justify-center items-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading folders...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-medium mb-2 text-blue-600">Folders</h1>
            <p className="text-muted-foreground">Organize your documents with folders</p>
          </div>
          
          <div className="flex gap-3 mt-4 md:mt-0">
            <div className="flex gap-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-blue-500 hover:bg-blue-600' : ''}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'tree' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('tree')}
                className={viewMode === 'tree' ? 'bg-blue-500 hover:bg-blue-600' : ''}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Create Folder
            </Button>
          </div>
        </div>

        {folders.length === 0 ? (
          <Card className="border-blue-100">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Folder className="h-16 w-16 text-blue-300 mb-4" />
              <h2 className="text-xl font-medium mb-2 text-blue-600">No folders yet</h2>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Create your first folder to organize your documents and keep everything structured.
              </p>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Plus className="mr-2 h-4 w-4" /> Create Your First Folder
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardTitle className="text-blue-700">
                {viewMode === 'grid' ? 'All Folders' : 'Folder Tree'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {viewMode === 'grid' ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {folders.map((folder) => (
                    <FolderCard key={folder.id} folder={folder} />
                  ))}
                </div>
              ) : (
                <FolderTree
                  folders={folderTree}
                  onFolderExpand={handleFolderExpand}
                  onFolderDelete={handleFolderDelete}
                  onRefresh={refetch}
                />
              )}
            </CardContent>
          </Card>
        )}
      </main>

      <CreateFolderDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onFolderCreated={refetch}
      />
      
      <footer className="py-6 border-t mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          © {new Date().getFullYear()} DeepWaters. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Folders;
