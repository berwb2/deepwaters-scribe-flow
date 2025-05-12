
import React, { useRef, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import TableOfContents from '@/components/TableOfContents';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DocType } from '@/components/DocumentCard';
import { ArrowLeft, Download, File, Info, Trash } from 'lucide-react';
import { getDocument, deleteDocument, getDocumentTags, detectTables } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';

const ViewDocument = () => {
  const { id } = useParams<{ id: string }>();
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
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
  
  // Format the document content
  const formatContent = (content: string) => {
    // First detect and format tables
    let formatted = detectTables(content);
    
    // Format headings
    formatted = formatted.replace(/^# (.+)$/gm, '<h1 id="$1">$1</h1>');
    formatted = formatted.replace(/^## (.+)$/gm, '<h2 id="$1">$1</h2>');
    formatted = formatted.replace(/^### (.+)$/gm, '<h3 id="$1">$1</h3>');
    
    // Format lists
    formatted = formatted.replace(/^\* (.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.+<\/li>)\n(<li>.+<\/li>)/g, '<ul>$1$2</ul>');
    
    // Format paragraphs (any line that's not a heading, list or table)
    formatted = formatted.replace(/^([^<\n].+)$/gm, '<p>$1</p>');
    
    return formatted;
  };

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
  
  // Prepare formatted content
  const formattedContent = formatContent(document.content);
  
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
              
              <div 
                ref={contentRef}
                className="prose prose-blue max-w-none"
                dangerouslySetInnerHTML={{ __html: formattedContent }}
              />
              
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
