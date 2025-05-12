
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { DocType } from '@/components/DocumentCard';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { createDocument } from '@/lib/api';
import { toast } from '@/components/ui/sonner';

const CreateDocument = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [documentType, setDocumentType] = useState<DocType>('plan');
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
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
  
  // Handle document creation
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
    
    // Basic formatting for preview
    let preview = content;
    
    // Format headings
    preview = preview.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    preview = preview.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    preview = preview.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    
    // Format lists
    preview = preview.replace(/^\* (.+)$/gm, '<li>$1</li>');
    preview = preview.replace(/(<li>.+<\/li>)\n(<li>.+<\/li>)/g, '<ul>$1$2</ul>');
    
    // Format paragraphs (any line that's not a heading or list)
    preview = preview.replace(/^([^<\n].+)$/gm, '<p>$1</p>');
    
    return <div dangerouslySetInnerHTML={{ __html: preview }} />;
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
              <Textarea
                id="content"
                placeholder="Write or paste your document content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="h-64 font-mono"
              />
              <p className="text-sm text-muted-foreground">
                You can use Markdown formatting: # Heading, ## Subheading, * List item
              </p>
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
