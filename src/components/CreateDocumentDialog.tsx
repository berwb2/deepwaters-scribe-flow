
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
  const [content, setContent] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('markdown');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createDocumentWithSound } = useDocumentActions();

  // Update content when document type changes
  const handleDocumentTypeChange = (type: DocumentType) => {
    setDocumentType(type);
    if (!content.trim()) {
      const template = getDocumentTypeTemplate(type);
      setContent(template);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Please enter a document title");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createDocumentWithSound({
        title: title.trim(),
        content: content || getDocumentTypeTemplate(documentType),
        content_type: documentType,
        is_template: false,
        metadata: folderId ? { folder_id: folderId } : {}
      });
      
      onDocumentCreated();
      onClose();
      
      // Reset form
      setTitle('');
      setContent('');
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
    setContent('');
    setDocumentType('markdown');
  };

  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-blue-600">
            Create New Document
            {folderId && " in Folder"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="space-y-4 flex-shrink-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Select value={documentType} onValueChange={handleDocumentTypeChange}>
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
            </div>
          </div>
          
          <div className="space-y-2 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between">
              <Label htmlFor="content" className="text-blue-700">Document Content</Label>
              <div className="text-sm text-muted-foreground">
                {wordCount} words | {content.length} characters
              </div>
            </div>
            <Textarea
              id="content"
              placeholder="Start writing your document content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="border-blue-200 focus:border-blue-400 resize-none flex-1 min-h-[300px] font-mono text-sm leading-relaxed"
            />
          </div>
          
          <DialogFooter className="mt-4 flex-shrink-0">
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
