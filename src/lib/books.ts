
import { supabase } from "@/integrations/supabase/client";

export const createBook = async (bookData: { title: string; description?: string | null; genre?: string }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('books')
    .insert({
      user_id: user.id,
      title: bookData.title,
      description: bookData.description,
      genre: bookData.genre,
      status: 'draft'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating book:', error);
    throw error;
  }

  return data;
};

export const listBooks = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('books')
    .select(`
      *,
      chapters!chapters_book_id_fkey(id)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching books:', error);
    throw error;
  }

  const books = data?.map(book => ({
    ...book,
    chapter_count: book.chapters?.length || 0
  })) || [];

  return { books };
};

export const getBook = async (bookId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', bookId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching book:', error);
    throw error;
  }

  return data;
};

export const updateBook = async (bookId: string, updates: any) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('books')
    .update(updates)
    .eq('id', bookId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating book:', error);
    throw error;
  }

  return data;
};

export const deleteBook = async (bookId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', bookId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting book:', error);
    throw error;
  }

  return { success: true };
};

export const createChapter = async (chapterData: {
  book_id: string;
  title: string;
  content?: string;
  chapter_number: number;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('chapters')
    .insert({
      user_id: user.id,
      book_id: chapterData.book_id,
      title: chapterData.title,
      content: chapterData.content || '',
      chapter_number: chapterData.chapter_number,
      status: 'draft'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating chapter:', error);
    throw error;
  }

  return data;
};

export const listBookChapters = async (bookId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('book_id', bookId)
    .eq('user_id', user.id)
    .order('chapter_number');

  if (error) {
    console.error('Error fetching chapters:', error);
    throw error;
  }

  return { chapters: data || [] };
};

export const getChapter = async (chapterId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('chapters')
    .select(`
      *,
      books!inner(title, description)
    `)
    .eq('id', chapterId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching chapter:', error);
    throw error;
  }

  return data;
};

export const updateChapter = async (chapterId: string, updates: any) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('chapters')
    .update(updates)
    .eq('id', chapterId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating chapter:', error);
    throw error;
  }

  return data;
};

export const deleteChapter = async (chapterId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('chapters')
    .delete()
    .eq('id', chapterId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting chapter:', error);
    throw error;
  }

  return { success: true };
};
