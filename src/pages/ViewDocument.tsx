import React, { useRef, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import TableOfContents from '@/components/TableOfContents';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DocType } from '@/types/documents';
import { ArrowLeft, Download, File, Info, Trash } from 'lucide-react';
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
        // Error is handled in the API function
        console.error('Failed to delete document:', error);
      }
    }
  };
  
  // Handle document download
  const handleDownload = () => {
    if (!document) return;
    
    // Create a blob with the document content
    const blob = new Blob([document.content], {type: 'text/plain'});
    
    // Create a temporary anchor element for downloading
    const element = window.document.createElement('a');
    element.href = URL.createObjectURL(blob);
    element.download = `${document.title}.md`;
    
    // Append to the document, click, and clean up
    window.document.body.appendChild(element);
    element.click();
    window.document.body.removeChild(element);
  };
  
  // Scroll to section when clicking on TOC item
  const scrollToSection = (id: string) => {
    // Use the document from the DOM, not our document data
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
        <main className="flex-1 container mx-auto px-4 py-12 flex justify-center items-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-water rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading document...</p>
          </div>
        </main>
      </div>
    );
  }
  
  if (error || !document) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
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
    );
  }
  
  // Calculate word count
  const wordCount = document.content.split(/\s+/).filter(Boolean).length;
  
  // Format the date
  const lastEdited = new Date(document.updated_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Button variant="ghost" className="mr-4" asChild>
              <Link to="/documents">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            
            <Badge className="mr-2">
              {document.content_type.charAt(0).toUpperCase() + document.content_type.slice(1)}
            </Badge>
            
            <span className="text-sm text-muted-foreground ml-auto">
              Last edited: {lastEdited}
            </span>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Table of Contents (sidebar) */}
            <TableOfContents contentRef={contentRef} />
            
            {/* Document content */}
            <div className="flex-1">
              <div className="mb-6 pb-6 border-b">
                <h1 className="text-3xl md:text-4xl font-serif font-medium mb-4">{document.title}</h1>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <Badge key={tag.id} variant="outline">
                      {tag.tag_name}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div ref={contentRef}>
                <DocumentRenderer 
                  document={document}
                  onSectionClick={scrollToSection}
                />
              </div>
              
              <div className="mt-12 pt-6 border-t flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  <span>{wordCount} words</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600" onClick={handleDeleteDocument}>
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
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

export default ViewDocument;
