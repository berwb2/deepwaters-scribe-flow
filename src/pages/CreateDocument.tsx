
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichTextEditor from '@/components/RichTextEditor';
import { useDocumentActions } from '@/hooks/use-document-actions';

const CreateDocument = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();
  const { createDocumentWithSound } = useDocumentActions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      return;
    }

    try {
      const documentId = await createDocumentWithSound(title, content, 'markdown');
      navigate(`/documents/${documentId}`);
    } catch (error) {
      // Error is already handled in the useDocumentActions hook
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <Card className="border-blue-100 shadow-lg shadow-blue-50">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50">
          <CardTitle className="text-2xl text-blue-800">Create New Document</CardTitle>
          <CardDescription>Create a new document in your DeepWaters workspace</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="pt-6 space-y-6">
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
              <Label htmlFor="content" className="text-blue-700">Document Content</Label>
              <div className="min-h-[300px] border rounded-md border-blue-200">
                <RichTextEditor 
                  content={content} 
                  onChange={setContent} 
                  placeholder="Start writing your document..." 
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end space-x-4 bg-gradient-to-r from-blue-50 to-teal-50">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/documents')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Document
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreateDocument;
