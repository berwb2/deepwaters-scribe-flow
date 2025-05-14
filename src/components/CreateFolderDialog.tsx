
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderPriority, FolderCategory } from '@/components/FolderCard';
import { createFolder } from '@/lib/api';
import { toast } from '@/components/ui/sonner';
import { Palette } from 'lucide-react';

interface CreateFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFolderCreated: () => void;
}

const COLOR_OPTIONS = [
  { name: "Purple", value: "#8B5CF6" },
  { name: "Blue", value: "#0EA5E9" },
  { name: "Green", value: "#10B981" },
  { name: "Yellow", value: "#F59E0B" },
  { name: "Red", value: "#EF4444" },
  { name: "Pink", value: "#EC4899" },
  { name: "Gray", value: "#6B7280" },
  { name: "Orange", value: "#F97316" },
  { name: "Teal", value: "#14B8A6" },
];

const CreateFolderDialog: React.FC<CreateFolderDialogProps> = ({ 
  isOpen, 
  onClose,
  onFolderCreated
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('');
  const [priority, setPriority] = useState<FolderPriority | ''>('');
  const [category, setCategory] = useState<FolderCategory | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const resetForm = () => {
    setName('');
    setDescription('');
    setColor('');
    setPriority('');
    setCategory('');
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Please provide a folder name");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createFolder({
        name,
        description: description.trim() || undefined,
        color: color || undefined,
        priority: priority || undefined,
        category: category || undefined
      });
      
      toast.success("Folder created successfully");
      handleClose();
      onFolderCreated();
    } catch (error) {
      console.error("Error creating folder:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Folder Name *</Label>
            <Input
              id="name"
              placeholder="Enter folder name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="color">Folder Color</Label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {COLOR_OPTIONS.map((colorOption) => (
                <Button
                  key={colorOption.value}
                  type="button"
                  variant="outline"
                  className={`h-8 w-full ${color === colorOption.value ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                  style={{ backgroundColor: colorOption.value, borderColor: colorOption.value }}
                  onClick={() => setColor(colorOption.value)}
                  title={colorOption.name}
                >
                  {color === colorOption.value && <span className="text-white">✓</span>}
                </Button>
              ))}
              <Button
                type="button"
                variant="outline"
                className={`h-8 w-full flex items-center justify-center ${!color ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                onClick={() => setColor('')}
                title="No Color"
              >
                <Palette className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(val) => setPriority(val as FolderPriority)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(val) => setCategory(val as FolderCategory)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="school">School</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? 'Creating...' : 'Create Folder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFolderDialog;
