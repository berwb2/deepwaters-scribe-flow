
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import DocumentCard from '@/components/DocumentCard';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Search, 
  Filter, 
  File,
  Calendar,
  Tag,
  MoreVertical
} from 'lucide-react';
import { listDocuments } from '@/lib/api';
import { DocumentMeta } from '@/types/documents';

const Documents = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Fetch documents
  const { data: documentsResponse, isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      return await listDocuments(
        {},
        { field: 'updated_at', direction: 'desc' },
        1,
        50
      );
    },
  });

  const documents = documentsResponse?.documents || [];

  // Filter documents based on search and type
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || doc.content_type === selectedType;
    return matchesSearch && matchesType;
  });

  // Get unique document types for filter
  const documentTypes = ['all', ...new Set(documents.map(doc => doc.content_type).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-8 flex justify-center items-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-blue-600">Loading documents...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-8 flex justify-center items-center">
            <div className="text-center">
              <File className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <p className="text-blue-600">Error loading documents</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Navbar />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-serif font-medium mb-2 text-blue-600">Documents</h1>
              <p className="text-blue-700">Manage and organize your documents</p>
            </div>
            
            <Button asChild className="mt-4 md:mt-0 bg-blue-500 hover:bg-blue-600 text-white">
              <Link to="/create">
                <Plus className="mr-2 h-4 w-4" /> Create New Document
              </Link>
            </Button>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6 border-blue-200 bg-white">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-blue-200 focus:border-blue-400"
                  />
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  {documentTypes.map((type) => (
                    <Badge
                      key={type}
                      variant={selectedType === type ? "default" : "outline"}
                      className={`cursor-pointer ${
                        selectedType === type 
                          ? 'bg-blue-500 text-white' 
                          : 'border-blue-200 text-blue-600 hover:bg-blue-50'
                      }`}
                      onClick={() => setSelectedType(type)}
                    >
                      {type === 'all' ? 'All Types' : type}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents Grid */}
          {filteredDocuments.length === 0 ? (
            <Card className="border-blue-200 bg-white">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <File className="h-16 w-16 text-blue-400 mb-4" />
                <h2 className="text-xl font-medium mb-2 text-blue-600">
                  {searchQuery || selectedType !== 'all' ? 'No documents found' : 'No documents yet'}
                </h2>
                <p className="text-blue-700 text-center mb-6 max-w-md">
                  {searchQuery || selectedType !== 'all' 
                    ? 'Try adjusting your search or filters to find what you\'re looking for.'
                    : 'Create your first document to get started with organizing your thoughts and plans.'
                  }
                </p>
                <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white">
                  <Link to="/create">
                    <Plus className="mr-2 h-4 w-4" /> Create Your First Document
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((doc) => (
                <DocumentCard key={doc.id} document={doc as DocumentMeta} />
              ))}
            </div>
          )}
        </main>
      </div>
      
      <footer className="py-6 border-t border-blue-200 bg-blue-50">
        <div className="container mx-auto px-4 text-center text-blue-600">
          © {new Date().getFullYear()} DeepWaters. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Documents;
