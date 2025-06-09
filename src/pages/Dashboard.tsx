
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, FolderOpen, BookOpen, Brain, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { listDocuments, getCurrentUser } from '@/lib/api';
import { useIsMobile } from '@/hooks/use-mobile';

const Dashboard = () => {
  const isMobile = useIsMobile();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });

  const { data: documentsData } = useQuery({
    queryKey: ['recent-documents'],
    queryFn: async () => {
      const response = await listDocuments({}, { field: 'updated_at', direction: 'desc' }, 1, 5);
      return response;
    },
    enabled: !!user,
  });

  const recentDocuments = documentsData?.documents || [];

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
      day: 'numeric'
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
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}
              </h1>
              <p className="text-gray-600">Here's what's happening with your workspace today.</p>
            </div>

            {/* Quick Actions */}
            <div className={`grid gap-4 mb-8 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <Link to="/documents" className="block">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Documents</h3>
                        <p className="text-sm text-gray-600">Manage files</p>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <Link to="/folders" className="block">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <FolderOpen className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Folders</h3>
                        <p className="text-sm text-gray-600">Organize content</p>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <Link to="/book-writer" className="block">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <BookOpen className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Write</h3>
                        <p className="text-sm text-gray-600">Create books</p>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <Link to="/grand-strategist" className="block">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <Brain className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">AI Chat</h3>
                        <p className="text-sm text-gray-600">Get insights</p>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Recent Documents */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Documents</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/documents">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentDocuments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No documents yet</p>
                    <Button asChild>
                      <Link to="/create">
                        <Plus className="h-4 w-4 mr-2" />
                        Create your first document
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <Link to={`/documents/${doc.id}`} className="block">
                            <h4 className="font-medium text-gray-900 hover:text-blue-600">{doc.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {doc.content_type} • Updated {formatDate(doc.updated_at)}
                            </p>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
