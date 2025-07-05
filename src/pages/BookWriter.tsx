import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import AIAssistantSidebar from '@/components/AIAssistantSidebar';
import DashboardWidget from '@/components/DashboardWidget';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Edit3, Save, Brain, FileText } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser, listDocuments, updateDocument } from '@/lib/api';
import { useIsMobile } from '@/hooks/use-mobile';

interface Chapter {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  order: number;
  bookId: string;
}

interface Book {
  id: string;
  title: string;
  subtitle?: string;
  genre: string;
  description?: string;
  coverImage?: string;
  wordCount: number;
  chapters: Chapter[];
  status: 'draft' | 'writing' | 'editing' | 'completed';
  createdAt: string;
  lastEdited: string;
  userId: string;
}

const BookWriter = () => {
  const isMobile = useIsMobile();
  const [books, setBooks] = useState<Book[]>([]);
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [isCreatingBook, setIsCreatingBook] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookGenre, setNewBookGenre] = useState('Fiction');
  const [showAISidebar, setShowAISidebar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });

  const { data: documentsData } = useQuery({
    queryKey: ['user-documents'],
    queryFn: async () => {
      const response = await listDocuments({}, { field: 'updated_at', direction: 'desc' }, 1, 1000);
      return response;
    },
  });

  const documents = documentsData?.documents || [];

  useEffect(() => {
    loadBooks();
  }, [user]);

  const loadBooks = async () => {
    if (!user) return;
    
    try {
      console.log('Loading books for user:', user.id);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .eq('content_type', 'book')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading books:', error);
        throw error;
      }

      console.log('Loaded books data:', data);

      const bookList = data?.map(doc => {
        const metadata = doc.metadata as any || {};
        let chapters = [];
        
        try {
          chapters = JSON.parse(doc.content || '[]');
        } catch (e) {
          console.error('Error parsing chapters:', e);
          chapters = [];
        }

        return {
          id: doc.id,
          title: doc.title,
          subtitle: metadata.subtitle,
          genre: metadata.genre || 'Fiction',
          description: metadata.description,
          coverImage: metadata.coverImage,
          wordCount: countWords(JSON.stringify(chapters)),
          chapters: chapters,
          status: metadata.status || 'draft',
          createdAt: doc.created_at,
          lastEdited: doc.updated_at,
          userId: doc.user_id
        };
      }) || [];

      setBooks(bookList);
      console.log('Successfully loaded books:', bookList.length);
    } catch (error) {
      console.error('Error loading books:', error);
      toast.error('Failed to load books');
    }
  };

  const countWords = (text: string) => {
    if (!text) return 0;
    return text.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const createNewBook = async () => {
    if (!user || !newBookTitle.trim()) {
      toast.error('Please enter a book title');
      return;
    }

    try {
      console.log('Creating new book:', newBookTitle);
      setIsSaving(true);

      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          title: newBookTitle.trim(),
          content: JSON.stringify([]),
          content_type: 'book',
          metadata: {
            genre: newBookGenre,
            status: 'draft'
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating book:', error);
        throw error;
      }

      console.log('Successfully created book:', data);

      const newBook: Book = {
        id: data.id,
        title: newBookTitle.trim(),
        genre: newBookGenre,
        wordCount: 0,
        chapters: [],
        status: 'draft',
        createdAt: data.created_at,
        lastEdited: data.updated_at,
        userId: user.id
      };

      setBooks([newBook, ...books]);
      setActiveBook(newBook);
      setIsCreatingBook(false);
      setNewBookTitle('');
      toast.success('Book created successfully!');
    } catch (error) {
      console.error('Error creating book:', error);
      toast.error(`Failed to create book: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const addNewChapter = async () => {
    if (!activeBook) return;

    const newChapter: Chapter = {
      id: `chapter-${Date.now()}`,
      title: `Chapter ${activeBook.chapters.length + 1}`,
      content: '',
      wordCount: 0,
      order: activeBook.chapters.length + 1,
      bookId: activeBook.id
    };

    const updatedBook = {
      ...activeBook,
      chapters: [...activeBook.chapters, newChapter]
    };

    setActiveBook(updatedBook);
    setActiveChapter(newChapter);
    await saveBook(updatedBook);
  };

  const updateChapterTitle = async (chapterId: string, newTitle: string) => {
    if (!activeBook) return;

    const updatedChapters = activeBook.chapters.map(chapter =>
      chapter.id === chapterId ? { ...chapter, title: newTitle } : chapter
    );

    const updatedBook = { ...activeBook, chapters: updatedChapters };
    setActiveBook(updatedBook);

    if (activeChapter?.id === chapterId) {
      setActiveChapter({ ...activeChapter, title: newTitle });
    }

    await saveBook(updatedBook);
  };

  const updateChapterContent = async (chapterId: string, newContent: string) => {
    if (!activeBook) return;

    const wordCount = countWords(newContent);
    const updatedChapters = activeBook.chapters.map(chapter =>
      chapter.id === chapterId ? { ...chapter, content: newContent, wordCount } : chapter
    );

    const totalWordCount = updatedChapters.reduce((sum, chapter) => sum + chapter.wordCount, 0);
    const updatedBook = { ...activeBook, chapters: updatedChapters, wordCount: totalWordCount };
    
    setActiveBook(updatedBook);

    if (activeChapter?.id === chapterId) {
      setActiveChapter({ ...activeChapter, content: newContent, wordCount });
    }

    // Auto-save after a delay
    setTimeout(() => saveBook(updatedBook), 1000);
  };

  const saveBook = async (book: Book) => {
    if (!book || !book.id || !user) {
      console.error('Cannot save book: Invalid book object or user not authenticated');
      toast.error('Cannot save book: Invalid book data or authentication required');
      return;
    }

    try {
      console.log('Saving book:', book.id, book.title);
      setIsSaving(true);

      // Use updateDocument function which properly handles versions and security
      const updateResult = await updateDocument(book.id, {
        title: book.title,
        content: JSON.stringify(book.chapters),
        metadata: {
          genre: book.genre,
          status: book.status,
          subtitle: book.subtitle,
          description: book.description,
          coverImage: book.coverImage
        }
      });

      console.log('Successfully saved book');

      // Update books list
      setBooks(prevBooks => 
        prevBooks.map(b => b.id === book.id ? { ...book, lastEdited: new Date().toISOString() } : b)
      );

      toast.success('Book saved successfully!');
    } catch (error) {
      console.error('Error saving book:', error);
      toast.error(`Failed to save book: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const getChapterDocument = () => {
    if (!activeChapter || !activeBook) return undefined;
    
    return {
      id: activeChapter.id,
      title: `${activeBook.title} - ${activeChapter.title}`,
      content: activeChapter.content,
      content_type: 'chapter' as any,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: user?.id || '',
      is_template: false,
      metadata: {
        bookTitle: activeBook.title,
        bookGenre: activeBook.genre,
        chapterOrder: activeChapter.order
      },
      tags: []
    };
  };

  if (!activeBook) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <Navbar />
        <MobileNav />
        
        <div className="flex">
          {!isMobile && <Sidebar />}
          
          <main className={`flex-1 ${isMobile ? 'px-4 pt-20' : 'p-6'}`}>
            <div className="max-w-6xl mx-auto">
              {/* Quick Actions Dashboard */}
              <DashboardWidget />
              
              <div className="mb-8">
                <h1 className="text-3xl font-serif font-medium text-blue-600 mb-2">📚 Book Writing Studio</h1>
                <p className="text-blue-700">Create and write your books with AI assistance</p>
              </div>

              {isCreatingBook ? (
                <Card className="max-w-md border-blue-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-blue-700">Create New Book</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">Title</label>
                    <Input
                      value={newBookTitle}
                      onChange={(e) => setNewBookTitle(e.target.value)}
                      placeholder="Enter book title"
                      className="border-blue-200"
                      disabled={isSaving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">Genre</label>
                    <select 
                      value={newBookGenre}
                      onChange={(e) => setNewBookGenre(e.target.value)}
                      className="w-full p-2 border border-blue-200 rounded-md"
                      disabled={isSaving}
                    >
                      <option value="Fiction">Fiction</option>
                      <option value="Non-Fiction">Non-Fiction</option>
                      <option value="Mystery">Mystery</option>
                      <option value="Romance">Romance</option>
                      <option value="Science Fiction">Science Fiction</option>
                      <option value="Fantasy">Fantasy</option>
                      <option value="Biography">Biography</option>
                      <option value="Self-Help">Self-Help</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={createNewBook} 
                      className="bg-blue-500 hover:bg-blue-600"
                      disabled={isSaving || !newBookTitle.trim()}
                    >
                      {isSaving ? 'Creating...' : 'Create Book'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreatingBook(false)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
                </Card>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-medium text-blue-700">My Books</h2>
                    <Button 
                      onClick={() => setIsCreatingBook(true)}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Plus className="mr-2 h-4 w-4" /> New Book
                    </Button>
                  </div>

                  {books.length === 0 ? (
                    <Card className="border-blue-200 bg-white">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <BookOpen className="h-16 w-16 text-blue-400 mb-4" />
                      <h3 className="text-xl font-medium mb-2 text-blue-600">Start Your Writing Journey</h3>
                      <p className="text-blue-700 text-center mb-6 max-w-md">
                        Create your first book and begin writing with AI assistance from Grand Strategist Claude.
                      </p>
                      <Button 
                        onClick={() => setIsCreatingBook(true)}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Create Your First Book
                      </Button>
                    </CardContent>
                    </Card>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {books.map((book) => (
                      <Card key={book.id} className="hover:shadow-lg transition-shadow border-blue-200 bg-white cursor-pointer" onClick={() => setActiveBook(book)}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg font-serif text-blue-600">{book.title}</CardTitle>
                          <Badge variant="outline" className="border-blue-200 text-blue-600 w-fit">
                            {book.genre}
                          </Badge>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center text-sm text-blue-700 mb-2">
                            <span>{book.chapters.length} chapters</span>
                            <span>{book.wordCount.toLocaleString()} words</span>
                          </div>
                          <div className="text-xs text-blue-600">
                            Last edited: {new Date(book.lastEdited).toLocaleDateString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    </div>
                  )}
                </>
              )}
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
        
        <main className="flex-1 flex">
          {/* Book Navigation */}
          <div className="w-80 border-r border-blue-200 bg-white">
            <div className="p-4 border-b border-blue-200">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveBook(null)}
                className="mb-4 border-blue-200 text-blue-600"
              >
                ← Back to Books
              </Button>
              <h2 className="font-serif text-lg text-blue-700 mb-2">{activeBook.title}</h2>
              <div className="flex gap-4 text-sm text-blue-600">
                <span>{activeBook.wordCount.toLocaleString()} words</span>
                <span>{activeBook.chapters.length} chapters</span>
              </div>
              {isSaving && (
                <div className="text-xs text-green-600 mt-1">Saving...</div>
              )}
            </div>

            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-blue-700">Chapters</h3>
                <Button size="sm" onClick={addNewChapter} className="bg-blue-500 hover:bg-blue-600">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {activeBook.chapters.map((chapter, index) => (
                  <div 
                    key={chapter.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      activeChapter?.id === chapter.id 
                        ? 'bg-blue-100 border border-blue-300' 
                        : 'bg-blue-50 hover:bg-blue-100'
                    }`}
                    onClick={() => setActiveChapter(chapter)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-700 text-sm truncate">{chapter.title}</h4>
                        <p className="text-blue-600 text-xs">{chapter.wordCount} words</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Writing Interface */}
          <div className="flex-1 flex flex-col">
            {activeChapter ? (
              <>
                <div className="p-6 border-b border-blue-200 bg-white">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <Input
                        value={activeChapter.title}
                        onChange={(e) => updateChapterTitle(activeChapter.id, e.target.value)}
                        className="text-xl font-serif border-blue-200 mb-2"
                        placeholder="Chapter Title"
                      />
                      <div className="text-sm text-blue-600">
                        {activeChapter.wordCount} words
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAISidebar(!showAISidebar)}
                      className={`ml-4 border-blue-200 ${showAISidebar ? 'bg-blue-50 text-blue-700' : 'text-blue-600 hover:bg-blue-50'}`}
                    >
                      <Brain className="mr-2 h-4 w-4" />
                      Grand Strategist Claude
                    </Button>
                  </div>
                </div>

                <div className="flex-1 p-6">
                  <Textarea
                    value={activeChapter.content}
                    onChange={(e) => updateChapterContent(activeChapter.id, e.target.value)}
                    className="w-full h-full min-h-[600px] border-blue-200 text-base leading-relaxed resize-none"
                    placeholder="Start writing your chapter..."
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="h-24 w-24 text-blue-400 mx-auto mb-6" />
                  <h2 className="text-2xl font-serif font-medium text-blue-600 mb-2">Select a chapter to start writing</h2>
                  <p className="text-blue-700 mb-6">
                    Choose a chapter from the left sidebar or create a new one to begin.
                  </p>
                  <Button onClick={addNewChapter} className="bg-blue-500 hover:bg-blue-600">
                    <Plus className="mr-2 h-4 w-4" /> Create First Chapter
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
        
        {showAISidebar && (
          <AIAssistantSidebar 
            document={getChapterDocument()}
            className="fixed right-0 top-16 h-[calc(100vh-4rem)] shadow-lg z-40"
            onClose={() => setShowAISidebar(false)}
          />
        )}
      </div>
      
      <footer className="py-6 border-t border-blue-200 bg-blue-50">
        <div className="container mx-auto px-4 text-center text-blue-600">
          © {new Date().getFullYear()} DeepWaters. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default BookWriter;
