
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Navbar from '@/components/Navbar';
import { toast } from '@/components/ui/sonner';
import { DocType } from '@/components/DocumentCard';

const CreateDocument = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [documentType, setDocumentType] = useState<DocType>('plan');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a document title');
      return;
    }
    
    if (!content.trim()) {
      toast.error('Please enter some content');
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      // In a real app, this would save to Supabase
      toast.success('Document created successfully!');
      setIsProcessing(false);
      navigate('/documents/1');
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-serif font-medium mb-6">Create New Document</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Document Title</Label>
              <Input
                id="title"
                placeholder="Enter a title for your document"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Document Type</Label>
              <RadioGroup 
                value={documentType} 
                onValueChange={(value) => setDocumentType(value as DocType)}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="plan" id="plan" />
                  <Label htmlFor="plan" className="cursor-pointer">Plan</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="doctrine" id="doctrine" />
                  <Label htmlFor="doctrine" className="cursor-pointer">Doctrine</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="reflection" id="reflection" />
                  <Label htmlFor="reflection" className="cursor-pointer">Reflection</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Document Content</Label>
              <Textarea
                id="content"
                placeholder="Paste or write your content here (up to 8,000 words)..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="input-field min-h-[300px]"
              />
              <p className="text-sm text-muted-foreground">
                {content.split(/\s+/).filter(Boolean).length} words
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="Add tags separated by commas (e.g., business, strategy, growth)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="input-field"
              />
            </div>
            
            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate('/documents')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? 'Creating...' : 'Create Document'}
              </Button>
            </div>
          </form>
        </div>
      </main>
      
      <footer className="py-6 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          © {new Date().getFullYear()} DeepWaters. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default CreateDocument;
