
import { supabase } from "@/integrations/supabase/client";
import { DocumentMeta, FolderMeta } from "@/types/documents";

// Authentication Functions
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signIn = async (email: string, password?: string, rememberMe?: boolean) => {
  if (password) {
    // Email + password sign in
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    if (error) {
      console.error('Error signing in:', error);
      throw error;
    }
    return data;
  } else {
    // Magic link sign in
    const { data, error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      console.error('Error signing in:', error);
      throw error;
    }
    return data;
  }
};

export const signUp = async (email: string, password: string, displayName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName
      },
      emailRedirectTo: `${window.location.origin}/`
    }
  });
  if (error) {
    console.error('Error signing up:', error);
    throw error;
  }
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const requestPasswordReset = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });
  if (error) {
    console.error('Error requesting password reset:', error);
    throw error;
  }
  return data;
};

export const resetPassword = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });
  if (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
  return data;
};

// User Profile Functions
export const getUserProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }

  return { ...data, email: user.email };
};

export const updateUserProfile = async (updates: { display_name?: string }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }

  return data;
};

// Folder Management Functions
export interface FolderCreationData {
  name: string;
  description?: string | null;
  category?: string;
  priority?: string;
  color?: string;
  parent_id?: string | null;
}

export const createFolder = async (folderData: FolderCreationData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('document_folders')
    .insert({
      user_id: user.id,
      name: folderData.name,
      description: folderData.description,
      color: folderData.color,
      category: folderData.category,
      priority: folderData.priority,
      parent_id: folderData.parent_id
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating folder:', error);
    throw error;
  }

  return data;
};

export const listFolders = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('document_folders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching folders:', error);
    throw error;
  }

  // Get document counts for each folder
  const folderIds = data?.map(f => f.id) || [];
  let documentCounts: Record<string, number> = {};
  
  if (folderIds.length > 0) {
    const { data: countsData, error: countsError } = await supabase
      .from('folder_documents')
      .select('folder_id')
      .in('folder_id', folderIds);

    if (!countsError && countsData) {
      documentCounts = countsData.reduce((acc, item) => {
        acc[item.folder_id] = (acc[item.folder_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    }
  }

  const folders = data?.map(folder => ({
    ...folder,
    document_count: documentCounts[folder.id] || 0
  })) || [];

  return { folders };
};

export const getFolder = async (folderId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('document_folders')
    .select('*')
    .eq('id', folderId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching folder:', error);
    throw error;
  }

  return data;
};

export const updateFolder = async (folderId: string, updates: Partial<FolderCreationData>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('document_folders')
    .update(updates)
    .eq('id', folderId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating folder:', error);
    throw error;
  }

  return data;
};

export const deleteFolder = async (folderId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('document_folders')
    .delete()
    .eq('id', folderId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting folder:', error);
    throw error;
  }

  return { success: true };
};

export const addDocumentToFolder = async (folderId: string, documentId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('folder_documents')
    .insert({
      folder_id: folderId,
      document_id: documentId
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding document to folder:', error);
    throw error;
  }

  return data;
};

export const removeDocumentFromFolder = async (folderId: string, documentId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('folder_documents')
    .delete()
    .eq('folder_id', folderId)
    .eq('document_id', documentId);

  if (error) {
    console.error('Error removing document from folder:', error);
    throw error;
  }

  return { success: true };
};

export const listFolderDocuments = async (folderId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('folder_documents')
    .select(`
      document_id,
      added_at,
      documents (
        id,
        title,
        content,
        content_type,
        created_at,
        updated_at,
        is_template,
        metadata,
        user_id
      )
    `)
    .eq('folder_id', folderId);

  if (error) {
    console.error('Error fetching folder documents:', error);
    throw error;
  }

  const documents = data?.map(item => ({
    ...(item.documents || {}),
    tags: []
  })) || [];
  
  return { 
    documents,
    total: documents.length
  };
};

// Enhanced document management functions
export const listDocuments = async (
  filters: { 
    contentType?: string;
    search?: string;
    folder_id?: string;
    tags?: string[];
    status?: string;
  } = {},
  sortBy: { field: string; direction: 'asc' | 'desc' } = { field: 'updated_at', direction: 'desc' },
  page: number = 1,
  pageSize: number = 50
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  let query = supabase
    .from('documents')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id);

  // Apply filters
  if (filters.contentType && filters.contentType !== 'all') {
    query = query.eq('content_type', filters.contentType);
  }

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
  }

  if (filters.folder_id) {
    query = query.eq('folder_id', filters.folder_id);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  // Apply sorting
  query = query.order(sortBy.field, { ascending: sortBy.direction === 'asc' });

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }

  const totalPages = count ? Math.ceil(count / pageSize) : 0;

  // Add empty tags array to documents for compatibility
  const documentsWithTags = data?.map(doc => ({
    ...doc,
    tags: [] as string[]
  })) || [];

  return { 
    documents: documentsWithTags, 
    total: count || 0,
    totalPages,
    currentPage: page,
    pageSize
  };
};

export const listEnhancedFolderDocuments = async (folderId: string) => {
  return await listFolderDocuments(folderId);
};

// Document management functions
export const getAllDocumentsForAI = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get ALL documents without pagination for AI context
  const { data, error } = await supabase
    .from('documents')
    .select('id, title, content, content_type, created_at, updated_at, metadata')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching all documents for AI:', error);
    throw error;
  }

  console.log(`Retrieved ${data?.length || 0} documents for AI analysis`);
  return data || [];
};

export const getDocument = async (documentId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching document:', error);
    throw error;
  }

  return data;
};

export const createDocument = async (documentData: {
  title: string;
  content: string;
  content_type: string;
  folder_id?: string;
  tags?: string[];
  status?: string;
  metadata?: any;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('documents')
    .insert({
      user_id: user.id,
      title: documentData.title,
      content: documentData.content,
      content_type: documentData.content_type,
      metadata: documentData.metadata || {}
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating document:', error);
    throw error;
  }

  return data;
};

export const updateDocument = async (documentId: string, updates: {
  title?: string;
  content?: string;
  content_type?: string;
  folder_id?: string;
  tags?: string[];
  status?: string;
  metadata?: any;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('documents')
    .update(updates)
    .eq('id', documentId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating document:', error);
    throw error;
  }

  return data;
};

export const deleteDocument = async (documentId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting document:', error);
    throw error;
  }

  return { success: true };
};

// Search function
export const searchDocuments = async (query: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('documents')
    .select('id, title, content')
    .eq('user_id', user.id)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .limit(10);

  if (error) {
    console.error('Error searching documents:', error);
    throw error;
  }

  return data?.map(doc => ({
    id: doc.id,
    title: doc.title,
    excerpt: doc.content.substring(0, 150) + '...',
    content_type: 'document'
  })) || [];
};

// AI Functions
export const callGrandStrategist = async (prompt: string, context?: any) => {
  const { data, error } = await supabase.functions.invoke('grand-strategist', {
    body: { prompt, context }
  });

  if (error) {
    console.error('Error calling Grand Strategist:', error);
    throw error;
  }

  return data;
};

export const getAISession = async (sessionId: string, sessionType: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('ai_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching AI session:', error);
    return null;
  }

  return data;
};

export const createAISession = async (documentId: string, sessionType: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('ai_sessions')
    .insert({
      user_id: user.id,
      document_id: documentId,
      session_type: sessionType,
      chat_history: []
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating AI session:', error);
    throw error;
  }

  return data;
};

export const updateAISession = async (sessionId: string, updates: {
  chat_history?: any;
  context_summary?: string;
  is_active?: boolean;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('ai_sessions')
    .update(updates)
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating AI session:', error);
    throw error;
  }

  return data;
};

// Book functions
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

// Chapter functions
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

// Export aliases for backward compatibility
export const createEnhancedFolder = createFolder;
export const listEnhancedFolders = listFolders;
export const getEnhancedFolder = getFolder;
export const updateEnhancedFolder = updateFolder;
export const deleteEnhancedFolder = deleteFolder;
export const addDocumentToEnhancedFolder = addDocumentToFolder;
export const removeDocumentFromEnhancedFolder = removeDocumentFromFolder;
