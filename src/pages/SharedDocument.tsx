import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getSharedDocument } from '@/lib/documents';
import { getUserDocumentPermission, copyDocumentToWorkspace } from '@/lib/sharing';
import DocumentRenderer from '@/components/DocumentRenderer';
import DocumentComments from '@/components/DocumentComments';
import ShareDocumentAdvanced from '@/components/ShareDocumentAdvanced';
import { DocType } from '@/types/documents';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  AlertCircle, 
  FileText, 
  Clock, 
  Calendar, 
  Eye,
  ChevronDown,
  ChevronUp,
  Share2,
  Download,
  MessageCircle,
  Users
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface DocumentData {
  id: string;
  title: string;
  content: string;
  content_type: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  is_template?: boolean;
  metadata?: any;
  user_id?: string;
  is_public?: boolean;
  share_token?: string;
}

export default function SharedDocument() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { user } = useAuth();
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tocOpen, setTocOpen] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [userPermission, setUserPermission] = useState<string>('view');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('document');

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
        
        // Check user permission if logged in
        if (user && doc.id) {
          try {
            const permission = await getUserDocumentPermission(doc.id);
            setUserPermission(permission);
          } catch (permError) {
            console.warn('Could not check user permission:', permError);
          }
        }
      } catch (err: any) {
        console.error('Error loading shared document:', err);
        setError(err.message || 'Failed to load document');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedDocument();
  }, [shareToken, user]);

  // Reading progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = window.document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const generateTableOfContents = () => {
    if (!document?.content) return [];
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(document.content, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    return Array.from(headings).map((heading, index) => {
      const text = heading.textContent || '';
      const id = `heading-${index}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`;
      return {
        id,
        text,
        level: parseInt(heading.tagName[1]),
        element: heading
      };
    });
  };

  const scrollToHeading = (headingId: string) => {
    let targetElement = window.document.getElementById(headingId);
    
    if (!targetElement) {
      const tocItems = generateTableOfContents();
      const tocItem = tocItems.find(item => item.id === headingId);
      if (tocItem) {
        const headings = window.document.querySelectorAll('.luxury-document-content h1, .luxury-document-content h2, .luxury-document-content h3, .luxury-document-content h4, .luxury-document-content h5, .luxury-document-content h6');
        targetElement = Array.from(headings).find(h => {
          const element = h as HTMLElement;
          return element.textContent?.trim() === tocItem.text.trim();
        }) as HTMLElement;
      }
    }
    
    if (targetElement) {
      targetElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
      targetElement.style.transition = 'background-color 0.3s ease';
      targetElement.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
      setTimeout(() => {
        targetElement.style.backgroundColor = '';
      }, 2000);
    }
  };

  const handleCopyToWorkspace = async () => {
    if (!document?.id || !user) return;
    
    try {
      await copyDocumentToWorkspace(document.id);
      toast.success('Document copied to your workspace!');
    } catch (error) {
      console.error('Error copying document:', error);
      toast.error('Failed to copy document');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
        {/* Progress bar */}
        <Progress value={scrollProgress} className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent" />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <Skeleton className="h-12 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-3">
                <Skeleton className="h-96 w-full" />
              </div>
              <div className="lg:col-span-9">
                <Card className="border-blue-200 shadow-xl bg-white/95 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-teal-600 text-white">
                    <Skeleton className="h-8 w-2/3 bg-white/20" />
                    <Skeleton className="h-4 w-1/2 bg-white/10" />
                  </CardHeader>
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
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <Card className="border-red-200 shadow-xl">
              <CardContent className="p-8">
                <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
                <h1 className="text-2xl font-bold mb-4 text-gray-900">Document Not Found</h1>
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error || 'This document is either not shared publicly or the link is invalid.'}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const tableOfContents = generateTableOfContents();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Progress bar */}
      <Progress value={scrollProgress} className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent" />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Card className="border-blue-200 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-gradient-to-br from-blue-600 to-teal-600 rounded-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{document.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 capitalize">
                        {document.content_type}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Created {new Date(document.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Updated {new Date(document.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                    <Share2 className="h-3 w-3" />
                    Shared
                  </Badge>
                  {user && userPermission !== 'owner' && userPermission !== 'none' && (
                    <Button 
                      size="sm"
                      onClick={handleCopyToWorkspace}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Copy to Workspace
                    </Button>
                  )}
                  {userPermission === 'owner' && (
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => setShareDialogOpen(true)}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Manage Sharing
                    </Button>
                  )}
                </div>
              </div>
              
              <Alert className="border-blue-200 bg-blue-50">
                <Eye className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  You're viewing a shared document. This is a read-only view.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Table of Contents */}
          {tableOfContents.length > 0 && (
            <div className="lg:col-span-3">
              <Collapsible open={tocOpen} onOpenChange={setTocOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full mb-4 lg:hidden bg-white shadow-sm">
                    Table of Contents
                    {tocOpen ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Card className="sticky top-6 bg-white/90 backdrop-blur-sm shadow-lg border-blue-100">
                    <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Eye className="mr-2 h-4 w-4" />
                          <span className="text-sm font-medium">Contents</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 max-h-96 overflow-y-auto">
                      <nav className="space-y-2 py-4">
                        {tableOfContents.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => scrollToHeading(item.id)}
                            className={`block text-left text-sm hover:text-blue-600 transition-all duration-200 w-full rounded-md p-2 hover:bg-blue-50 ${
                              item.level === 1 ? 'font-semibold text-blue-900 text-base' :
                              item.level === 2 ? 'ml-3 font-medium text-blue-800' :
                              item.level === 3 ? 'ml-6 text-blue-700' :
                              'ml-9 text-blue-600'
                            }`}
                          >
                            {item.text}
                          </button>
                        ))}
                      </nav>
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {/* Main Content */}
          <div className={`${tableOfContents.length > 0 ? 'lg:col-span-9' : 'lg:col-span-12'}`}>
            <Card className="border-blue-200 shadow-xl bg-white/95 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-teal-600 text-white">
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold">{document.title}</h2>
                      <div className="flex items-center gap-4 mt-2 text-sm text-blue-100">
                        <span>{document.content.split(/\s+/).filter(word => word.length > 0).length} words</span>
                        <span>•</span>
                        <span>{Math.max(1, Math.ceil(document.content.split(/\s+/).filter(word => word.length > 0).length / 200))} min read</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tabs */}
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="bg-white/10 border border-white/20">
                      <TabsTrigger value="document" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
                        <FileText className="h-4 w-4 mr-2" />
                        Document
                      </TabsTrigger>
                      {(user && (userPermission === 'owner' || userPermission === 'edit' || userPermission === 'comment' || document.is_public)) && (
                        <TabsTrigger value="comments" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Comments
                        </TabsTrigger>
                      )}
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs value={activeTab} className="w-full">
                  <TabsContent value="document" className="m-0">
                    <div className="p-8">
                      <DocumentRenderer 
                        document={{ 
                          ...document,
                          content: document.content,
                          content_type: document.content_type as DocType,
                          is_template: document.is_template || false,
                          metadata: document.metadata || {},
                          user_id: document.user_id || ''
                        }} 
                        className="min-h-96 luxury-document-content"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="comments" className="m-0">
                    <div className="p-8">
                      <DocumentComments 
                        documentId={document.id}
                        canComment={user && (userPermission === 'owner' || userPermission === 'edit' || userPermission === 'comment' || document.is_public)}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Share Management Dialog */}
      {document && userPermission === 'owner' && (
        <ShareDocumentAdvanced
          documentId={document.id}
          isOpen={shareDialogOpen}
          onClose={() => setShareDialogOpen(false)}
          document={{
            title: document.title,
            is_public: document.is_public || false,
            share_token: document.share_token
          }}
        />
      )}
    </div>
  );
}