import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useDocumentActions } from '@/hooks/use-document-actions';
import { addDocumentToFolder } from '@/lib/api';
import { toast } from '@/components/ui/sonner';

interface CreateDocumentInFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  folderId: string;
  onDocumentCreated: () => void;
}

const CreateDocumentInFolderDialog: React.FC<CreateDocumentInFolderDialogProps> = ({
  isOpen,
  onClose,
  folderId,
  onDocumentCreated
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState('plan');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createDocumentWithSound } = useDocumentActions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create the document
      const documentId = await createDocumentWithSound({
        title: title.trim(),
        content: content.trim() || "Start writing here...",
        content_type: contentType,
        is_template: false,
        metadata: {}
      });
      
      // Add the document to the folder
      await addDocumentToFolder(folderId, documentId);
      
      toast.success("Document created and added to folder");
      onDocumentCreated();
      onClose();
      
      // Reset form
      setTitle('');
      setContent('');
      setContentType('plan');
    } catch (error) {
      console.error("Error creating document in folder:", error);
      toast.error("Failed to create document");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTitle('');
    setContent('');
    setContentType('plan');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Document in Folder</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter document title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plan">Plan</SelectItem>
                <SelectItem value="doctrine">Doctrine</SelectItem>
                <SelectItem value="reflection">Reflection</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Initial Content (Optional)</Label>
            <Textarea
              id="content"
              placeholder="Start with some initial content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? 'Creating...' : 'Create Document'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDocumentInFolderDialog;
