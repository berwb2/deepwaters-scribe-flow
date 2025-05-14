import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import DocumentCard from '@/components/DocumentCard';
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FolderEdit, FolderX, Plus, Search } from 'lucide-react';
import { getFolder, listFolderDocuments, addDocumentToFolder, removeDocumentFromFolder, deleteFolder } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface MoveDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  folderId: string;
  onDocumentAdded: () => void;
}

// Define custom type for folder priority display
type FolderPriorityStyle = 'low' | 'medium' | 'high';

// Define custom type for folder category display
type FolderCategory = 'personal' | 'work' | 'school' | 'project' | 'other';

// Update DocumentCard interface to include optional contextMenuItems
interface DocumentCardProps {
  document: any;
  contextMenuItems?: { label: string; onClick: () => Promise<void> }[];
}

const MoveDocumentDialog: React.FC<MoveDocumentDialogProps> = ({
  isOpen,
  onClose,
  folderId,
  onDocumentAdded
}) => {
  const [documentId, setDocumentId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: documents } = useQuery({
    queryKey: ['documents'],
    queryFn: () => listFolderDocuments(null), // Fetch documents not in any folder
    enabled: isOpen,
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documentId) {
      toast.error("Please select a document");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addDocumentToFolder(folderId, documentId);
      toast.success("Document added to folder");
      onDocumentAdded();
      onClose();
      setDocumentId('');
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
          <DialogTitle>Add Document to Folder</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="document">Select Document</Label>
            <Select value={documentId} onValueChange={setDocumentId}>
              <SelectTrigger id="document">
                <SelectValue placeholder="Select a document" />
              </SelectTrigger>
              <SelectContent>
                {documents?.documents?.length > 0 ? (
                  documents.documents.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.title}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    No available documents
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || !documentId}>
              {isSubmitting ? 'Adding...' : 'Add to Folder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const FolderView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Fetch the folder using React Query
  const { data: folder, isLoading: isFolderLoading } = useQuery({
    queryKey: ['folder', id],
    queryFn: () => id ? getFolder(id) : Promise.reject('No folder ID provided'),
    enabled: !!id,
  });
  
  // Fetch folder documents
  const { data: documentsData, isLoading: isDocumentsLoading, refetch } = useQuery({
    queryKey: ['folderDocuments', id],
    queryFn: () => id ? listFolderDocuments(id) : Promise.reject('No folder ID provided'),
    enabled: !!id,
  });
  
  // Filter documents by search term
  const filteredDocuments = documentsData?.documents?.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  // Map priority to styles
  const priorityStyles: Record<FolderPriorityStyle, string> = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800"
  };
  
  // Map category to display names
  const categoryNames: Record<FolderCategory, string> = {
    personal: "Personal",
    work: "Work",
    school: "School",
    project: "Project",
    other: "Other"
  };
  
  const handleRemoveDocument = async (documentId: string) => {
    if (!id) return;
    
    if (window.confirm('Remove this document from the folder?')) {
      try {
        await removeDocumentFromFolder(id, documentId);
        toast.success("Document removed from folder");
        refetch();
      } catch (error) {
        console.error("Error removing document from folder:", error);
      }
    }
  };
  
  const handleDeleteFolder = async () => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to delete this folder? Documents inside will not be deleted.')) {
      try {
        await deleteFolder(id);
        toast.success("Folder deleted successfully");
        navigate('/folders');
      } catch (error) {
        console.error("Failed to delete folder:", error);
      }
    }
  };
  
  if (isFolderLoading || isDocumentsLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12 flex justify-center items-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-water rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading folder...</p>
          </div>
        </main>
      </div>
    );
  }
  
  if (!folder) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12 flex justify-center items-center">
          <div className="text-center">
            <div className="text-2xl font-medium mb-2">Folder Not Found</div>
            <p className="text-muted-foreground mb-6">The folder you're looking for doesn't exist or has been moved.</p>
            <Button asChild>
              <Link to="/folders">Back to Folders</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" className="mr-4" asChild>
            <Link to="/folders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Folders
            </Link>
          </Button>
        </div>
        
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h1 
                className="text-3xl font-serif font-medium mb-2"
                style={folder.color ? { color: folder.color } : {}}
              >
                {folder.name}
              </h1>
              
              {folder.description && (
                <p className="text-muted-foreground mb-2">
                  {folder.description}
                </p>
              )}
              
              <div className="flex flex-wrap gap-2 mt-3">
                {folder.priority && (
                  <Badge variant="outline" className={priorityStyles[folder.priority as FolderPriority]}>
                    {folder.priority.charAt(0).toUpperCase() + folder.priority.slice(1)} Priority
                  </Badge>
                )}
                
                {folder.category && (
                  <Badge variant="outline" className="bg-slate-100">
                    {categoryNames[folder.category as FolderCategory]}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Document
              </Button>
              
              <Button variant="outline" className="text-red-500 hover:text-red-600" onClick={handleDeleteFolder}>
                <FolderX className="mr-2 h-4 w-4" />
                Delete Folder
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents in this folder..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        {filteredDocuments.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <DocumentCard 
                key={doc.id} 
                document={doc} 
                contextMenuItems={[
                  {
                    label: 'Remove from folder',
                    onClick: () => handleRemoveDocument(doc.id)
                  }
                ]}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-xl font-medium mb-2">No documents in this folder</div>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? "No documents match your search" : "Add documents to get started"}
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Document
            </Button>
          </div>
        )}
      </main>
      
      <footer className="py-6 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          © {new Date().getFullYear()} DeepWaters. All rights reserved.
        </div>
      </footer>
      
      <MoveDocumentDialog 
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        folderId={id || ''}
        onDocumentAdded={refetch}
      />
    </div>
  );
};

export default FolderView;
