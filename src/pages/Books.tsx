
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Book, Calendar, FileText, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import CreateBookDialog from '@/components/CreateBookDialog';
import { listBooks } from '@/lib/api';

const Books = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch books using React Query
  const { data: booksData, isLoading, refetch } = useQuery({
    queryKey: ['books'],
    queryFn: listBooks,
  });

  const books = booksData?.books || [];

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12 flex justify-center items-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading books...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-medium mb-2 text-blue-600">Books</h1>
            <p className="text-muted-foreground">Create and manage your books with chapters</p>
          </div>
          
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="mt-4 md:mt-0 bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Book
          </Button>
        </div>

        {/* Temporary notice about book functionality */}
        <Card className="border-yellow-200 bg-yellow-50 mb-6">
          <CardContent className="flex items-center py-4">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <p className="text-yellow-800 font-medium">Book functionality is temporarily unavailable</p>
              <p className="text-yellow-700 text-sm">The database schema is being updated. This feature will be available shortly.</p>
            </div>
          </CardContent>
        </Card>

        {books.length === 0 ? (
          <Card className="border-blue-100">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Book className="h-16 w-16 text-blue-300 mb-4" />
              <h2 className="text-xl font-medium mb-2 text-blue-600">No books yet</h2>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Create your first book to start writing and organizing chapters for longer content.
              </p>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
                disabled
              >
                <Plus className="mr-2 h-4 w-4" /> Create Your First Book (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <Card key={book.id} className="hover:shadow-md transition-shadow border-blue-100">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-serif">
                    <Link to={`/books/${book.id}`} className="hover:text-blue-600 transition-colors">
                      {book.title}
                    </Link>
                  </CardTitle>
                  {book.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{book.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="border-blue-200 text-blue-600">
                      <FileText className="mr-1 h-3 w-3" />
                      {book.chapter_count || 0} chapters
                    </Badge>
                    {book.total_word_count && (
                      <Badge variant="outline" className="border-blue-200 text-blue-600">
                        {book.total_word_count} words
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>Created {format(new Date(book.created_at), 'MMM dd, yyyy')}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <CreateBookDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onBookCreated={refetch}
      />
      
      <footer className="py-6 border-t mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          © {new Date().getFullYear()} DeepWaters. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Books;
