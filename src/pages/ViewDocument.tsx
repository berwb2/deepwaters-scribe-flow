
import React, { useRef, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import AIAssistantSidebar from '@/components/AIAssistantSidebar';
import TableOfContents from '@/components/TableOfContents';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DocumentMeta } from '@/types/documents';
import { ArrowLeft, Download, File, Info, Trash, Brain } from 'lucide-react';
import { getDocument, deleteDocument, getDocumentTags } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';
import CollapsibleSection from '@/components/CollapsibleSection';
import DocumentRenderer from '@/components/DocumentRenderer';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

const ViewDocument = () => {
  const { id } = useParams<{ id: string }>();
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [showAISidebar, setShowAISidebar] = useState(false);
  
  // Fetch the document using React Query
  const { data: document, isLoading, error } = useQuery({
    queryKey: ['document', id],
    queryFn: () => id ? getDocument(id) : Promise.reject('No document ID provided'),
    enabled: !!id,
  });
  
  // Fetch document tags
  const { data: tags = [] } = useQuery({
    queryKey: ['documentTags', id],
    queryFn: () => id ? getDocumentTags(id) : Promise.reject('No document ID provided'),
    enabled: !!id,
  });
  
  const handleDeleteDocument = async () => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to delete this document? This cannot be undone.')) {
      try {
        await deleteDocument(id);
        toast.success('Document deleted successfully');
        navigate('/documents');
      } catch (error) {
        console.error('Failed to delete document:', error);
      }
    }
  };
  
  // Handle document download
  const handleDownload = () => {
    if (!document) return;
    
    const blob = new Blob([document.content], {type: 'text/plain'});
    const element = window.document.createElement('a');
    element.href = URL.createObjectURL(blob);
    element.download = `${document.title}.md`;
    window.document.body.appendChild(element);
    element.click();
    window.document.body.removeChild(element);
  };
  
  // Scroll to section when clicking on TOC item
  const scrollToSection = (id: string) => {
    const element = window.document.getElementById(id) || window.document.querySelector(`#${id}`);
    element?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 container mx-auto px-4 py-12 flex justify-center items-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading document...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  if (error || !document) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 container mx-auto px-4 py-12 flex justify-center items-center">
            <div className="text-center">
              <File className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h1 className="text-2xl font-medium mb-2">Document Not Found</h1>
              <p className="text-muted-foreground mb-6">The document you're looking for doesn't exist or has been moved.</p>
              <Button asChild>
                <Link to="/documents">Back to Documents</Link>
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const typedDocument: DocumentMeta = {
    ...document,
    content_type: document.content_type as any
  };
  
  const wordCount = document.content.split(/\s+/).filter(Boolean).length;
  const lastEdited = new Date(document.updated_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Button variant="ghost" className="mr-4" asChild>
                  <Link to="/documents">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Link>
                </Button>
                
                <Badge className="mr-2 bg-blue-500 text-white">
                  {document.content_type.charAt(0).toUpperCase() + document.content_type.slice(1)}
                </Badge>
                
                <span className="text-sm text-muted-foreground">
                  Last edited: {lastEdited}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAISidebar(!showAISidebar)}
                className={`border-blue-200 ${showAISidebar ? 'bg-blue-50 text-blue-700' : 'text-blue-600 hover:bg-blue-50'}`}
              >
                <Brain className="mr-2 h-4 w-4" />
                Grand Strategist Claude
              </Button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8">
              {/* Table of Contents (sidebar) */}
              <TableOfContents contentRef={contentRef} />
              
              {/* Document content */}
              <div className="flex-1">
                <div className="mb-6 pb-6 border-b">
                  <h1 className="text-3xl md:text-4xl font-serif font-medium mb-4 text-blue-600">{document.title}</h1>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <Badge key={tag.id} variant="outline" className="border-blue-200 text-blue-600">
                        {tag.tag_name}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div ref={contentRef}>
                  <DocumentRenderer 
                    document={typedDocument}
                    onSectionClick={scrollToSection}
                  />
                </div>
                
                <div className="mt-12 pt-6 border-t flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    <span>{wordCount} words</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleDownload} className="border-blue-200 text-blue-600 hover:bg-blue-50">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50" onClick={handleDeleteDocument}>
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        {/* AI Assistant Sidebar */}
        {showAISidebar && (
          <AIAssistantSidebar 
            document={typedDocument}
            className="fixed right-0 top-16 h-[calc(100vh-4rem)] shadow-lg z-40"
            onClose={() => setShowAISidebar(false)}
          />
        )}
      </div>
      
      <footer className="py-6 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          © {new Date().getFullYear()} DeepWaters. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default ViewDocument;
