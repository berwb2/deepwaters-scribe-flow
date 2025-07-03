import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import DocumentCard from '@/components/DocumentCard';
import EnhancedFolderManager from '@/components/EnhancedFolderManager';
import EnhancedCreateDocumentDialog from '@/components/EnhancedCreateDocumentDialog';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, FolderOpen, Search, Filter, Grid, List } from 'lucide-react';
import { listDocuments, getCurrentUser, listEnhancedFolderDocuments } from '@/lib/api';
import { useIsMobile } from '@/hooks/use-mobile';
import { DocType } from '@/types/documents';

const Documents = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const isMobile = useIsMobile();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });

  // Fetch documents based on selected folder
  const { data: documentsData, isLoading, refetch } = useQuery({
    queryKey: ['documents', searchQuery, selectedType, selectedFolder, selectedTags, selectedStatus],
    queryFn: async () => {
      if (selectedFolder) {
        // Fetch documents from specific folder
        return await listEnhancedFolderDocuments(selectedFolder);
      } else {
        // Fetch all documents with filters
        const filters: any = {};
        
        if (searchQuery) {
          filters.search = searchQuery;
        }
        
        if (selectedType !== 'all') {
          filters.contentType = selectedType;
        }

        if (selectedTags.length > 0) {
          filters.tags = selectedTags;
        }

        if (selectedStatus !== 'all') {
          filters.status = selectedStatus;
        }

        const response = await listDocuments(filters, { field: 'updated_at', direction: 'desc' }, 1, 100);
        return response;
      }
    },
    enabled: !!user,
  });

  const documents = documentsData?.documents || [];
  const totalDocuments = documentsData?.total || 0;
  const documentTypes = ['all', 'markdown', 'report', 'conversation', 'note', 'plan'];
  const statusOptions = ['all', 'draft', 'review', 'published', 'archived'];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (isMobile) {
      if (diffInHours < 1) return 'Now';
      if (diffInHours < 24) return `${diffInHours}h ago`;
      if (diffInHours < 48) return 'Yesterday';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolder(folderId);
  };

  const handleCreateDocument = () => {
    setIsCreateDialogOpen(true);
  };

  // Extract unique tags from documents for filtering
  const availableTags = Array.from(
    new Set(
      documents
        .flatMap(doc => doc.tags || [])
        .filter(Boolean)
    )
  ).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      <Navbar />
      <MobileNav />
      
      <div className="flex">
        {!isMobile && <Sidebar />}
        
        <main className={`flex-1 ${isMobile ? 'px-4 pt-4' : 'p-6'}`}>
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {selectedFolder && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFolder(null)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ← Back to All Documents
                      </Button>
                    )}
                    <FolderOpen className="h-5 w-5 text-blue-600" />
                    <h1 className="text-2xl font-bold text-blue-900">
                      {selectedFolder ? 'Folder Documents' : 'Enterprise Document Management'}
                    </h1>
                  </div>
                  <p className="text-blue-700">
                    {selectedFolder ? 
                      `${totalDocuments} documents in selected folder` : 
                      `Organize, manage, and collaborate on your documents (${totalDocuments} total)`
                    }
                  </p>
                </div>
                {!isMobile && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                      {viewMode === 'grid' ? 'List View' : 'Grid View'}
                    </Button>
                    <Button 
                      onClick={handleCreateDocument} 
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="ml-2">Create Document</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Folder Management Sidebar */}
              <div className="lg:col-span-3">
                <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-blue-100">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-t-lg">
                    <CardTitle className="text-lg">Organization</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <EnhancedFolderManager
                      onFolderSelect={handleFolderSelect}
                      selectedFolderId={selectedFolder}
                      showDocumentCounts={true}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Area */}
              <div className="lg:col-span-9">
                {/* Filters and Search */}
                <Card className="mb-6 bg-white/90 backdrop-blur-sm shadow-lg border-blue-100">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Search documents..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 border-blue-200 focus:ring-blue-500"
                        />
                      </div>
                      
                      {/* Filters */}
                      <div className="flex flex-wrap gap-3">
                        {/* Document Type Filter */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {documentTypes.map(type => (
                            <Badge
                              key={type}
                              variant={selectedType === type ? "default" : "outline"}
                              className={`cursor-pointer whitespace-nowrap ${
                                selectedType === type 
                                  ? 'bg-blue-600 text-white' 
                                  : 'border-blue-200 text-blue-700 hover:bg-blue-50'
                              }`}
                              onClick={() => setSelectedType(type)}
                            >
                              {type === 'all' ? 'All Types' : type}
                            </Badge>
                          ))}
                        </div>

                        <Separator orientation="vertical" className="h-6" />

                        {/* Status Filter */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {statusOptions.map(status => (
                            <Badge
                              key={status}
                              variant={selectedStatus === status ? "default" : "outline"}
                              className={`cursor-pointer whitespace-nowrap ${
                                selectedStatus === status 
                                  ? 'bg-green-600 text-white' 
                                  : 'border-green-200 text-green-700 hover:bg-green-50'
                              }`}
                              onClick={() => setSelectedStatus(status)}
                            >
                              {status === 'all' ? 'All Status' : status}
                            </Badge>
                          ))}
                        </div>

                        {/* Tag Filter */}
                        {availableTags.length > 0 && (
                          <>
                            <Separator orientation="vertical" className="h-6" />
                            <div className="flex gap-2 overflow-x-auto pb-2">
                              {availableTags.slice(0, 5).map(tag => (
                                <Badge
                                  key={tag}
                                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                                  className={`cursor-pointer whitespace-nowrap ${
                                    selectedTags.includes(tag)
                                      ? 'bg-purple-600 text-white' 
                                      : 'border-purple-200 text-purple-700 hover:bg-purple-50'
                                  }`}
                                  onClick={() => {
                                    if (selectedTags.includes(tag)) {
                                      setSelectedTags(selectedTags.filter(t => t !== tag));
                                    } else {
                                      setSelectedTags([...selectedTags, tag]);
                                    }
                                  }}
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Documents Grid/List */}
                <div className={`${
                  viewMode === 'grid' 
                    ? `grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}` 
                    : 'space-y-4'
                }`}>
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-48 bg-white rounded-lg border border-blue-100 animate-pulse" />
                    ))
                  ) : documents.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-blue-100 p-8">
                        <div className="text-center">
                          <FolderOpen className="h-16 w-16 text-blue-300 mx-auto mb-4" />
                          <p className="text-blue-600 mb-4">
                            {selectedFolder ? 'No documents in this folder yet' : 'No documents found'}
                          </p>
                          <Button 
                            onClick={handleCreateDocument}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create your first document
                          </Button>
                        </div>
                      </Card>
                    </div>
                  ) : (
                    documents.map((doc) => (
                      <DocumentCard
                        key={doc.id}
                        document={{
                          ...doc,
                          content_type: doc.content_type as DocType,
                          updated_at: formatDate(doc.updated_at)
                        }}
                        onUpdate={handleRefresh}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile FAB */}
      {isMobile && (
        <div className="fixed bottom-6 right-6">
          <Button 
            onClick={handleCreateDocument} 
            className="rounded-full h-14 w-14 shadow-lg bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}

      <EnhancedCreateDocumentDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onDocumentCreated={handleRefresh}
        selectedFolderId={selectedFolder}
      />
    </div>
  );
};

export default Documents;
