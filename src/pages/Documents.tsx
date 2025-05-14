
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import Navbar from '@/components/Navbar';
import DocumentCard from '@/components/DocumentCard';
import { Plus, Search, FolderPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listDocuments, getCurrentUser, listFolders, addDocumentToFolder } from '@/lib/api';
import { DocumentMeta } from '@/types/documents';
import { toast } from '@/components/ui/sonner';

// Add a new interface for the move to folder dialog
interface MoveToFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
}

const MoveToFolderDialog: React.FC<MoveToFolderDialogProps> = ({ isOpen, onClose, documentId }) => {
  const [folderId, setFolderId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch available folders
  const { data: foldersData } = useQuery({
    queryKey: ['folders'],
    queryFn: () => listFolders(),
    enabled: isOpen,
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!folderId) {
      toast.error("Please select a folder");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addDocumentToFolder(folderId, documentId);
      toast.success("Document added to folder");
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      onClose();
      setFolderId('');
    } catch (error) {
      console.error("Error adding document to folder:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Move to Folder</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="folder">Select Folder</Label>
            <Select value={folderId} onValueChange={setFolderId}>
              <SelectTrigger id="folder">
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                {foldersData?.folders?.length > 0 ? (
                  foldersData.folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-folders" disabled>
                    No available folders
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || !folderId}>
              {isSubmitting ? 'Moving...' : 'Move to Folder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Documents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState('');
  
  // Get current user
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });
  
  // Fetch documents
  const { data, isLoading } = useQuery({
    queryKey: ['documents', selectedType],
    queryFn: () => listDocuments(
      selectedType ? { contentType: selectedType } : {},
      { field: 'updated_at', direction: 'desc' }
    ),
    enabled: !!user, // Only fetch if user is authenticated
  });
  
  // Filter documents by search term
  const filteredDocuments = data?.documents?.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Handle "Move to Folder" click
  const handleMoveToFolder = (documentId: string) => {
    setSelectedDocumentId(documentId);
    setMoveDialogOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-medium mb-2">My Documents</h1>
            <p className="text-muted-foreground">Browse and manage your plans, doctrines, and reflections</p>
          </div>
          
          <Button className="mt-4 md:mt-0" asChild>
            <Link to="/create">
              <Plus className="mr-2 h-4 w-4" /> Create New Document
            </Link>
          </Button>
        </div>
        
        {!user ? (
          <div className="text-center py-16">
            <div className="text-xl font-medium mb-2">Sign in to view your documents</div>
            <p className="text-muted-foreground mb-6">You need to be signed in to access your documents</p>
            <Button asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative w-full sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant={selectedType === null ? "default" : "outline"} 
                    className="cursor-pointer hover:bg-primary/90"
                    onClick={() => setSelectedType(null)}
                  >
                    All
                  </Badge>
                  <Badge 
                    variant={selectedType === 'plan' ? "default" : "outline"} 
                    className="cursor-pointer hover:bg-primary/90"
                    onClick={() => setSelectedType('plan')}
                  >
                    Plans
                  </Badge>
                  <Badge 
                    variant={selectedType === 'doctrine' ? "default" : "outline"} 
                    className="cursor-pointer hover:bg-primary/90"
                    onClick={() => setSelectedType('doctrine')}
                  >
                    Doctrines
                  </Badge>
                  <Badge 
                    variant={selectedType === 'reflection' ? "default" : "outline"} 
                    className="cursor-pointer hover:bg-primary/90"
                    onClick={() => setSelectedType('reflection')}
                  >
                    Reflections
                  </Badge>
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 border-4 border-t-water rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading documents...</p>
              </div>
            ) : filteredDocuments.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDocuments.map((doc) => (
                  <DocumentCard 
                    key={doc.id} 
                    document={doc as DocumentMeta}
                    contextMenuItems={[
                      {
                        label: 'Move to Folder',
                        onClick: async () => handleMoveToFolder(doc.id)
                      }
                    ]}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-xl font-medium mb-2">No documents found</div>
                <p className="text-muted-foreground mb-6">Try adjusting your search or create a new document</p>
                <Button asChild>
                  <Link to="/create">
                    <Plus className="mr-2 h-4 w-4" /> Create New Document
                  </Link>
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
      
      <MoveToFolderDialog
        isOpen={moveDialogOpen}
        onClose={() => setMoveDialogOpen(false)}
        documentId={selectedDocumentId}
      />
    </div>
  );
};

export default Documents;
