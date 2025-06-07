
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from "@/components/ui/badge";
import { useDocumentActions } from '@/hooks/use-document-actions';
import { DOCUMENT_TYPES, DocumentType, getDocumentTypeTemplate } from '@/types/documentTypes';
import { toast } from '@/components/ui/sonner';

interface CreateDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  folderId?: string;
  onDocumentCreated: () => void;
}

const CreateDocumentDialog: React.FC<CreateDocumentDialogProps> = ({
  isOpen,
  onClose,
  folderId,
  onDocumentCreated
}) => {
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('markdown');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createDocumentWithSound } = useDocumentActions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Please enter a document title");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const template = getDocumentTypeTemplate(documentType);
      await createDocumentWithSound({
        title: title.trim(),
        content: template,
        content_type: documentType,
        is_template: false,
        metadata: folderId ? { folder_id: folderId } : {}
      });
      
      onDocumentCreated();
      onClose();
      
      // Reset form
      setTitle('');
      setDocumentType('markdown');
    } catch (error) {
      console.error("Error creating document:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTitle('');
    setDocumentType('markdown');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-blue-600">
            Create New Document
            {folderId && " in Folder"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-blue-700">Document Title</Label>
            <Input
              id="title"
              placeholder="Enter document title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-blue-200 focus:border-blue-400"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="documentType" className="text-blue-700">Document Type</Label>
            <Select value={documentType} onValueChange={(value: DocumentType) => setDocumentType(value)}>
              <SelectTrigger id="documentType" className="border-blue-200 focus:border-blue-400">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center gap-3 w-full">
                      <Badge variant="outline" className={type.color}>
                        {type.name}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex-1">
                        {type.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !title.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isSubmitting ? 'Creating...' : 'Create Document'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDocumentDialog;
