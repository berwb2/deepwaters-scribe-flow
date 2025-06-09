
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import DocumentCard from '@/components/DocumentCard';
import CreateDocumentDialog from '@/components/CreateDocumentDialog';
import GlobalSearch from '@/components/GlobalSearch';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from 'lucide-react';
import { listDocuments, getCurrentUser } from '@/lib/api';
import { useIsMobile } from '@/hooks/use-mobile';

const Documents = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });

  const { data: documentsData, isLoading, refetch } = useQuery({
    queryKey: ['documents', searchQuery, selectedType],
    queryFn: async () => {
      const filters: any = {};
      
      if (searchQuery) {
        filters.search = searchQuery;
      }
      
      if (selectedType !== 'all') {
        filters.content_type = selectedType;
      }

      const response = await listDocuments(filters, { field: 'updated_at', direction: 'desc' }, 1, 50);
      return response;
    },
    enabled: !!user,
  });

  const documents = documentsData?.documents || [];
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <MobileNav />
      
      <div className="flex">
        {!isMobile && <Sidebar />}
        
        <main className={`flex-1 ${isMobile ? 'px-4 pt-20' : 'p-6'}`}>
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
                  <p className="text-gray-600">Manage and organize your documents</p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)} className={isMobile ? 'fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg z-10' : ''}>
                  <Plus className="h-4 w-4" />
                  {!isMobile && <span className="ml-2">Create New Document</span>}
                </Button>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col gap-3">
                <GlobalSearch 
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  placeholder="Search documents..."
                />
                
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {documentTypes.map(type => (
                    <Badge
                      key={type}
                      variant={selectedType === type ? "default" : "outline"}
                      className="cursor-pointer whitespace-nowrap"
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
                  <div key={i} className="h-48 bg-white rounded-lg border animate-pulse" />
                ))
              ) : documents.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 mb-4">No documents found</p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    Create your first document
                  </Button>
                </div>
              ) : (
                documents.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={{
                      ...doc,
                      updated_at: formatDate(doc.updated_at)
                    }}
                    onUpdate={refetch}
                  />
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      <CreateDocumentDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onDocumentCreated={refetch}
      />
    </div>
  );
};

export default Documents;
