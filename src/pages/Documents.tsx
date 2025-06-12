
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import DocumentCard from '@/components/DocumentCard';
import CreateDocumentDialog from '@/components/CreateDocumentDialog';
import CreateDocumentInFolderButton from '@/components/CreateDocumentInFolderButton';
import CreateNestedFolderButton from '@/components/CreateNestedFolderButton';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, FolderOpen, Folder } from 'lucide-react';
import { listDocuments, getCurrentUser, listFolders } from '@/lib/api';
import { useIsMobile } from '@/hooks/use-mobile';
import { DocType } from '@/types/documents';

const Documents = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });

  const { data: foldersData, refetch: refetchFolders } = useQuery({
    queryKey: ['folders'],
    queryFn: async () => {
      const response = await listFolders();
      return response;
    },
    enabled: !!user,
  });

  const { data: documentsData, isLoading, refetch } = useQuery({
    queryKey: ['documents', searchQuery, selectedType, currentPage, selectedFolder],
    queryFn: async () => {
      const filters: any = {};
      
      if (searchQuery) {
        filters.search = searchQuery;
      }
      
      if (selectedType !== 'all') {
        filters.content_type = selectedType;
      }

      if (selectedFolder) {
        filters.folder_id = selectedFolder;
      }

      const response = await listDocuments(filters, { field: 'updated_at', direction: 'desc' }, currentPage, pageSize);
      return response;
    },
    enabled: !!user,
  });

  const documents = documentsData?.documents || [];
  const totalDocuments = documentsData?.total || 0;
  const folders = foldersData?.folders || [];
  const documentTypes = ['all', 'markdown', 'report', 'conversation', 'note', 'plan'];

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

  const loadMoreDocuments = () => {
    setPageSize(prevSize => prevSize + 50);
  };

  const handleRefresh = () => {
    refetch();
    refetchFolders();
  };

  const selectedFolderData = folders.find(f => f.id === selectedFolder);
  const currentFolderName = selectedFolderData?.name || 'All Documents';

  return (
    <div className="min-h-screen bg-gray-50">
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
                        ← Back to All
                      </Button>
                    )}
                    <FolderOpen className="h-5 w-5 text-blue-600" />
                    <h1 className="text-2xl font-bold text-blue-900">{currentFolderName}</h1>
                  </div>
                  <p className="text-blue-700">
                    {selectedFolder ? 
                      `${totalDocuments} documents in this folder` : 
                      `Manage and organize your documents (${totalDocuments} total)`
                    }
                  </p>
                </div>
                {!isMobile && (
                  <div className="flex gap-2">
                    {selectedFolder && (
                      <>
                        <CreateDocumentInFolderButton
                          folderId={selectedFolder}
                          onDocumentCreated={handleRefresh}
                        />
                        <CreateNestedFolderButton
                          parentFolderId={selectedFolder}
                          onFolderCreated={handleRefresh}
                        />
                      </>
                    )}
                    <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4" />
                      <span className="ml-2">Create New Document</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* Folder Navigation */}
              {!selectedFolder && folders.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-blue-700 mb-2">Folders</h3>
                  <div className="flex flex-wrap gap-2">
                    {folders.map(folder => (
                      <Button
                        key={folder.id}
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFolder(folder.id)}
                        className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <Folder className="h-4 w-4" />
                        {folder.name}
                        <Badge variant="secondary" className="ml-1">
                          {folder.document_count || 0}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search and Filters */}
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border-blue-200 focus:ring-blue-500"
                  />
                </div>
                
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
              </div>
            </div>

            {/* Documents Grid */}
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-48 bg-white rounded-lg border border-blue-100 animate-pulse" />
                ))
              ) : documents.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="bg-white rounded-xl border border-blue-100 p-8">
                    {selectedFolder ? (
                      <>
                        <Folder className="h-16 w-16 text-blue-300 mx-auto mb-4" />
                        <p className="text-blue-600 mb-4">No documents in this folder yet</p>
                        <CreateDocumentInFolderButton
                          folderId={selectedFolder}
                          onDocumentCreated={handleRefresh}
                          className="mx-auto"
                        />
                      </>
                    ) : (
                      <>
                        <p className="text-blue-600 mb-4">No documents found</p>
                        <Button 
                          onClick={() => setIsCreateDialogOpen(true)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Create your first document
                        </Button>
                      </>
                    )}
                  </div>
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

            {/* Load More Button */}
            {documents.length > 0 && documents.length < totalDocuments && (
              <div className="text-center mt-8">
                <Button 
                  onClick={loadMoreDocuments}
                  variant="outline"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  Load More Documents ({documents.length} of {totalDocuments})
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile FAB */}
      {isMobile && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-2">
          {selectedFolder && (
            <>
              <CreateNestedFolderButton
                parentFolderId={selectedFolder}
                onFolderCreated={handleRefresh}
                className="rounded-full h-12 w-12 shadow-lg"
              />
              <CreateDocumentInFolderButton
                folderId={selectedFolder}
                onDocumentCreated={handleRefresh}
                className="rounded-full h-12 w-12 shadow-lg"
              />
            </>
          )}
          <Button 
            onClick={() => setIsCreateDialogOpen(true)} 
            className="rounded-full h-14 w-14 shadow-lg bg-blue-600 hover:bg-blue-700 z-10"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}

      <CreateDocumentDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onDocumentCreated={handleRefresh}
      />
    </div>
  );
};

export default Documents;
