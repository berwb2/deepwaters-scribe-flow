import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getSharedDocument } from '@/lib/documents';
import DocumentRenderer from '@/components/DocumentRenderer';
import TableOfContents from '@/components/TableOfContents';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DocumentData {
  id: string;
  title: string;
  content: string;
  content_type: string;
  created_at: string;
  updated_at: string;
  tags: string[];
}

export default function SharedDocument() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableOfContents, setTableOfContents] = useState<Array<{ id: string; text: string; level: number }>>([]);

  useEffect(() => {
    const fetchSharedDocument = async () => {
      if (!shareToken) {
        setError('No share token provided');
        setLoading(false);
        return;
      }

      try {
        const doc = await getSharedDocument(shareToken);
        setDocument(doc);
      } catch (err: any) {
        console.error('Error loading shared document:', err);
        setError(err.message || 'Failed to load document');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedDocument();
  }, [shareToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Skeleton className="h-12 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <Card>
                  <CardContent className="p-8">
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/6" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-1">
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-6">
              <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h1 className="text-2xl font-bold mb-2">Document Not Found</h1>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || 'This document is either not shared publicly or the link is invalid.'}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start gap-4 mb-4">
              <FileText className="h-8 w-8 text-primary mt-1" />
              <div className="flex-1">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent mb-2">
                  {document.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <Badge variant="secondary" className="capitalize">
                    {document.content_type}
                  </Badge>
                  <span>Created {new Date(document.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Last updated {new Date(document.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <Alert className="border-primary/20 bg-primary/5">
              <AlertCircle className="h-4 w-4 text-primary" />
              <AlertDescription className="text-primary">
                You're viewing a shared document. This is a read-only view.
              </AlertDescription>
            </Alert>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-3">
              <Card>
                <CardContent className="p-8">
                  <DocumentRenderer 
                    document={{ content: document.content } as any}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="xl:col-span-1">
              <div className="sticky top-8 space-y-6">
                {tableOfContents.length > 0 && (
                  <TableOfContents content={document.content} />
                )}
                
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Document Info</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <div className="font-medium text-muted-foreground mb-1">Type</div>
                        <Badge variant="outline" className="capitalize">
                          {document.content_type}
                        </Badge>
                      </div>
                      <div>
                        <div className="font-medium text-muted-foreground mb-1">Word Count</div>
                        <div>{document.content.split(/\s+/).filter(word => word.length > 0).length} words</div>
                      </div>
                      <div>
                        <div className="font-medium text-muted-foreground mb-1">Reading Time</div>
                        <div>{Math.max(1, Math.ceil(document.content.split(/\s+/).filter(word => word.length > 0).length / 200))} min</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}