
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Book, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import CreateBookDialog from '@/components/CreateBookDialog';
import { supabase } from '@/integrations/supabase/client';

interface BookMeta {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  chapter_count: number;
  total_word_count: number;
}

const Books = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch books from Supabase
  const { data: booksData, isLoading } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('books')
        .select(`
          id,
          title,
          description,
          cover_image_url,
          created_at,
          updated_at,
          user_id,
          chapters (
            id,
            content
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(book => ({
        ...book,
        chapter_count: book.chapters?.length || 0,
        total_word_count: book.chapters?.reduce((total, chapter) => 
          total + (chapter.content?.split(' ').length || 0), 0) || 0
      })) || [];
    },
  });

  const books = booksData || [];

  const handleBookCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['books'] });
  };

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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-medium mb-2 text-blue-600">Book Writing Studio</h1>
            <p className="text-blue-700">Create and manage your books with organized chapters</p>
          </div>
          
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="mt-4 md:mt-0 bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> Create New Book
          </Button>
        </div>

        {books.length === 0 ? (
          <Card className="border-blue-200 bg-white shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Book className="h-16 w-16 text-blue-400 mb-4" />
              <h2 className="text-xl font-medium mb-2 text-blue-600">Start Your First Book</h2>
              <p className="text-blue-700 text-center mb-6 max-w-md">
                Create your first book to begin writing organized chapters and building your literary work.
              </p>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Plus className="mr-2 h-4 w-4" /> Create Your First Book
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <Card key={book.id} className="hover:shadow-lg transition-shadow border-blue-200 bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-serif text-blue-600">
                        <Link to={`/books/${book.id}`} className="hover:text-blue-700 transition-colors">
                          {book.title}
                        </Link>
                      </CardTitle>
                      {book.description && (
                        <p className="text-sm text-blue-700 line-clamp-2 mt-2">{book.description}</p>
                      )}
                    </div>
                    {book.cover_image_url && (
                      <img 
                        src={book.cover_image_url} 
                        alt={book.title}
                        className="w-12 h-16 object-cover rounded border border-blue-200 ml-3"
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="border-blue-200 text-blue-600">
                      <FileText className="mr-1 h-3 w-3" />
                      {book.chapter_count} chapters
                    </Badge>
                    {book.total_word_count > 0 && (
                      <Badge variant="outline" className="border-blue-200 text-blue-600">
                        {book.total_word_count.toLocaleString()} words
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center text-xs text-blue-600">
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
        onBookCreated={handleBookCreated}
      />
      
      <footer className="py-6 border-t border-blue-200 bg-blue-50">
        <div className="container mx-auto px-4 text-center text-blue-600">
          © {new Date().getFullYear()} DeepWaters. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Books;
