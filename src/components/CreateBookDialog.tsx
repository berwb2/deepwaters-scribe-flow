
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBook } from '@/lib/api';
import { toast } from '@/components/ui/sonner';
import { AlertCircle } from 'lucide-react';

interface CreateBookDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onBookCreated: () => void;
}

const CreateBookDialog: React.FC<CreateBookDialogProps> = ({
  isOpen,
  onClose,
  onBookCreated
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a book title');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createBook({
        title: title.trim(),
        description: description.trim() || null
      });
      
      toast.success('Book created successfully');
      onBookCreated();
      onClose();
      setTitle('');
      setDescription('');
    } catch (error) {
      // Error handling is done in the API function
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setTitle('');
      setDescription('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-blue-600">Create New Book</DialogTitle>
          <DialogDescription>
            Create a new book to organize your content into chapters.
          </DialogDescription>
        </DialogHeader>
        
        {/* Temporary notice */}
        <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
          <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
          <p className="text-sm text-yellow-800">Book functionality is temporarily unavailable while the database is being updated.</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-blue-700">Book Title</Label>
              <Input
                id="title"
                placeholder="Enter book title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-blue-200 focus:border-blue-400"
                required
                disabled
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-blue-700">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Enter book description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border-blue-200 focus:border-blue-400"
                rows={3}
                disabled
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={true}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Coming Soon
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBookDialog;
