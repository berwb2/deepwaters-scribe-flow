
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import RichTextEditor from '@/components/RichTextEditor';
import DocumentRenderer from '@/components/DocumentRenderer';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useDocumentActions } from '@/hooks/use-document-actions';
import { DOCUMENT_TYPES, DocumentType, getDocumentTypeTemplate } from '@/types/documentTypes';
import { ArrowLeft, Eye, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { useIsMobile } from '@/hooks/use-mobile';

const CreateDocument = () => {
  const [searchParams] = useSearchParams();
  const folderId = searchParams.get('folderId');
  
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('markdown');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { createDocumentWithSound } = useDocumentActions();

  // Initialize content with template when document type changes
  React.useEffect(() => {
    const template = getDocumentTypeTemplate(documentType);
    setContent(template);
  }, [documentType]);

  const handleDocumentTypeChange = (type: DocumentType) => {
    setDocumentType(type);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Please enter a document title");
      return;
    }

    if (!content.trim()) {
      toast.error("Please add some content to your document");
      return;
    }

    setIsSubmitting(true);

    try {
      const documentId = await createDocumentWithSound({
        title: title.trim(),
        content,
        content_type: documentType,
        is_template: false,
        metadata: folderId ? { folder_id: folderId } : {}
      });
      
      toast.success("Document created successfully!");
      navigate(`/documents/${documentId}`);
    } catch (error) {
      console.error("Error creating document:", error);
      toast.error("Failed to create document. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        {!isMobile && <Sidebar />}
        
        <main className={`flex-1 ${isMobile ? 'p-4' : 'p-6'}`}>
          <div className="max-w-6xl mx-auto">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <div className="flex items-center justify-between">
                      <Label htmlFor="content" className="text-blue-700">Document Content</Label>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                          {wordCount} words
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant={!previewMode ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPreviewMode(false)}
                            className="flex items-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant={previewMode ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPreviewMode(true)}
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Preview
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {previewMode ? (
                      <div className="border rounded-xl shadow-lg bg-white border-blue-200 overflow-hidden">
                        <DocumentRenderer 
                          document={{
                            id: 'preview',
                            title: title || 'Document Preview',
                            content: content,
                            content_type: documentType,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            user_id: '',
                            is_template: false,
                            metadata: {},
                            tags: []
                          }} 
                          className="min-h-96"
                        />
                      </div>
                    ) : (
                      <div className="border rounded-md border-blue-200">
                        <RichTextEditor 
                          content={content} 
                          onChange={setContent} 
                          placeholder="Start writing your document content here..." 
                        />
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex justify-end space-x-4 bg-gradient-to-r from-blue-50 to-teal-50">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate(folderId ? `/folders/${folderId}` : '/documents')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isSubmitting || !title.trim() || !content.trim()}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Document'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateDocument;
