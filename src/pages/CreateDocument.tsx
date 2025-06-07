
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import RichTextEditor from '@/components/RichTextEditor';
import { useDocumentActions } from '@/hooks/use-document-actions';
import { DOCUMENT_TYPES, DocumentType, getDocumentTypeTemplate } from '@/types/documentTypes';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const CreateDocument = () => {
  const [searchParams] = useSearchParams();
  const folderId = searchParams.get('folderId');
  
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('markdown');
  const [content, setContent] = useState('');
  const navigate = useNavigate();
  const { createDocumentWithSound } = useDocumentActions();

  // Update content when document type changes
  const handleDocumentTypeChange = (type: DocumentType) => {
    setDocumentType(type);
    const template = getDocumentTypeTemplate(type);
    setContent(template);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      return;
    }

    try {
      const documentId = await createDocumentWithSound({
        title,
        content,
        content_type: documentType,
        is_template: false,
        metadata: {}
      });
      
      // If creating in a folder, add to folder after creation
      if (folderId) {
        // This would require an API call to add document to folder
        // For now, navigate to the document
      }
      
      navigate(`/documents/${documentId}`);
    } catch (error) {
      // Error is already handled in the useDocumentActions hook
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link to={folderId ? `/folders/${folderId}` : "/documents"}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {folderId ? 'Folder' : 'Documents'}
          </Link>
        </Button>
      </div>

      <Card className="border-blue-100 shadow-lg shadow-blue-50">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50">
          <CardTitle className="text-2xl text-blue-800">Create New Document</CardTitle>
          <CardDescription>
            Create a new document in your DeepWaters workspace
            {folderId && " within the selected folder"}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="pt-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
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
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={type.color}>
                            {type.name}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {type.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-blue-700">Document Content</Label>
              <div className="min-h-[400px] border rounded-md border-blue-200">
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
              onClick={() => navigate(folderId ? `/folders/${folderId}` : '/documents')}
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
