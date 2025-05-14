
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RichTextEditor from '@/components/RichTextEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { createDocument, addDocumentToFolder } from '@/lib/api';
import { toast } from '@/components/ui/sonner';
import { useQuery } from '@tanstack/react-query';
import { listFolders } from '@/lib/api';
import { DocType } from '@/types/documents';

const CreateDocument = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [documentType, setDocumentType] = useState<DocType>('plan');
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>('none'); // Changed initial value to 'none'
  
  // Get folders for selection
  const { data: foldersData } = useQuery({
    queryKey: ['folders'],
    queryFn: () => listFolders(),
  });
  
  // Handle tag addition
  const handleAddTag = () => {
    if (!tag.trim() || tags.includes(tag.trim())) return;
    setTags([...tags, tag.trim()]);
    setTag('');
  };
  
  // Handle tag removal
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };
  
  // Handle tag input keydown (add on Enter)
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  // Update handleCreateDocument to include folder assignment
  const handleCreateDocument = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Please provide both title and content');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Create the document
      const documentId = await createDocument(
        title,
        content,
        documentType,
        false, // not a template
        { tags } // metadata
      );
      
      // If a folder is selected, add the document to it
      if (selectedFolder && selectedFolder !== 'none') { // Modified to check for 'none'
        try {
          await addDocumentToFolder(selectedFolder, documentId);
        } catch (error) {
          console.error("Error adding to folder:", error);
          // Continue even if adding to folder fails
        }
      }
      
      toast.success('Document created successfully');
      navigate(`/documents/${documentId}`);
    } catch (error) {
      // Error is handled in the createDocument function
      setIsProcessing(false);
    }
  };
  
  // Preview section that shows how the document will look
  const previewContent = () => {
    if (!content) return <p className="text-muted-foreground text-center italic">Your content preview will appear here</p>;
    
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif font-medium mb-6">Create New Document</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Document Title</Label>
              <Input
                id="title"
                placeholder="Enter document title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Document Type</Label>
              <Select 
                value={documentType} 
                onValueChange={(value) => setDocumentType(value as DocType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plan">Plan</SelectItem>
                  <SelectItem value="doctrine">Doctrine</SelectItem>
                  <SelectItem value="reflection">Reflection</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="folder">Add to Folder (Optional)</Label>
              <Select 
                value={selectedFolder} 
                onValueChange={setSelectedFolder}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select folder (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem> {/* Changed empty string to "none" */}
                  {foldersData?.folders?.map(folder => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="Add tags"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                />
                <Button type="button" onClick={handleAddTag}>Add</Button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((t) => (
                    <Badge key={t} variant="secondary" className="flex items-center gap-1">
                      {t}
                      <button 
                        onClick={() => handleRemoveTag(t)} 
                        className="rounded-full hover:bg-muted p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <RichTextEditor 
                content={content}
                onChange={setContent}
              />
            </div>
            
            <Button 
              onClick={handleCreateDocument}
              disabled={isProcessing || !title || !content}
              className="w-full md:w-auto"
            >
              {isProcessing ? 'Creating...' : 'Create Document'}
            </Button>
          </div>
          
          {/* Preview Section */}
          <div>
            <h2 className="text-xl font-medium mb-4">Preview</h2>
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                {title && <h1 className="text-2xl font-serif font-medium mb-4">{title}</h1>}
                <div className="prose prose-blue max-w-none">
                  {previewContent()}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <footer className="py-6 border-t mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          © {new Date().getFullYear()} DeepWaters. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default CreateDocument;
