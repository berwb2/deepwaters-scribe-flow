
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import Navbar from '@/components/Navbar';
import FolderCard, { FolderMeta } from '@/components/FolderCard';
import CreateFolderDialog from '@/components/CreateFolderDialog';
import { Plus, Search, FolderPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { listFolders, getCurrentUser } from '@/lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FolderMeta as FolderMetaType } from '@/types/documents';

const Folders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Get current user
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });
  
  // Fetch folders
  const { data: foldersData, isLoading, refetch } = useQuery({
    queryKey: ['folders', selectedCategory, selectedPriority],
    queryFn: () => listFolders({
      category: selectedCategory || undefined,
      priority: selectedPriority || undefined
    }),
    enabled: !!user, // Only fetch if user is authenticated
  });
  
  // Filter folders by search term
  const filteredFolders = foldersData?.folders?.filter(folder => 
    folder.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (folder.description && folder.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-medium mb-2">My Folders</h1>
            <p className="text-muted-foreground">Organize your documents into folders</p>
          </div>
          
          <Button 
            className="mt-4 md:mt-0" 
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <FolderPlus className="mr-2 h-4 w-4" /> Create New Folder
          </Button>
        </div>
        
        {!user ? (
          <div className="text-center py-16">
            <div className="text-xl font-medium mb-2">Sign in to view your folders</div>
            <p className="text-muted-foreground mb-6">You need to be signed in to access your folders</p>
            <Button asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
                <div className="relative w-full sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search folders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <div className="flex flex-wrap gap-4 items-end">
                  <div>
                    <Label htmlFor="category-filter" className="text-sm mb-1 block">Category</Label>
                    <Select 
                      value={selectedCategory || ""} 
                      onValueChange={(value) => setSelectedCategory(value || null)}
                    >
                      <SelectTrigger id="category-filter" className="w-36">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="school">School</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="priority-filter" className="text-sm mb-1 block">Priority</Label>
                    <Select 
                      value={selectedPriority || ""} 
                      onValueChange={(value) => setSelectedPriority(value || null)}
                    >
                      <SelectTrigger id="priority-filter" className="w-36">
                        <SelectValue placeholder="All Priorities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Priorities</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 border-4 border-t-water rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading folders...</p>
              </div>
            ) : filteredFolders.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFolders.map((folder) => (
                  <FolderCard key={folder.id} folder={folder as FolderMetaType} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-xl font-medium mb-2">No folders found</div>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || selectedCategory || selectedPriority 
                    ? "Try adjusting your filters" 
                    : "Create your first folder to organize your documents"}
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <FolderPlus className="mr-2 h-4 w-4" /> Create New Folder
                </Button>
              </div>
            )}
          </>
        )}
      </main>
      
      <footer className="py-6 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          © {new Date().getFullYear()} DeepWaters. All rights reserved.
        </div>
      </footer>
      
      <CreateFolderDialog 
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onFolderCreated={refetch}
      />
    </div>
  );
};

export default Folders;
