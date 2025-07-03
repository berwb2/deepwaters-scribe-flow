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

// Enhanced Folder Management Functions with enterprise capabilities
export interface EnhancedFolderCreationData {
  name: string;
  description?: string | null;
  category?: string;
  priority?: string;
  color?: string;
  parent_id?: string | null;
  organization_id?: string;
}

export const createEnhancedFolder = async (folderData: EnhancedFolderCreationData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('folders')
    .insert({
      created_by: user.id,
      name: folderData.name,
      description: folderData.description,
      color: folderData.color,
      parent_folder_id: folderData.parent_id,
      organization_id: user.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating enhanced folder:', error);
    throw error;
  }

  return data;
};

export const listEnhancedFolders = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('folders')
    .select(`
      id,
      name,
      description,
      color,
      parent_folder_id,
      created_at,
      created_by,
      organization_id,
      is_archived
    `)
    .eq('created_by', user.id)
    .eq('is_archived', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching enhanced folders:', error);
    throw error;
  }

  // Get document counts for each folder
  const folderIds = data?.map(f => f.id) || [];
  let documentCounts: Record<string, number> = {};
  
  if (folderIds.length > 0) {
    const { data: countsData, error: countsError } = await supabase
      .from('documents')
      .select('folder_id')
      .in('folder_id', folderIds);

    if (!countsError && countsData) {
      documentCounts = countsData.reduce((acc, item) => {
        if (item.folder_id) {
          acc[item.folder_id] = (acc[item.folder_id] || 0) + 1;
        }
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

export const getEnhancedFolder = async (folderId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('id', folderId)
    .eq('created_by', user.id)
    .single();

  if (error) {
    console.error('Error fetching enhanced folder:', error);
    throw error;
  }

  return data;
};

export const updateEnhancedFolder = async (folderId: string, updates: Partial<EnhancedFolderCreationData>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('folders')
    .update(updates)
    .eq('id', folderId)
    .eq('created_by', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating enhanced folder:', error);
    throw error;
  }

  return data;
};

export const deleteEnhancedFolder = async (folderId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', folderId)
    .eq('created_by', user.id);

  if (error) {
    console.error('Error deleting enhanced folder:', error);
    throw error;
  }

  return { success: true };
};

export const addDocumentToEnhancedFolder = async (folderId: string, documentId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Update the document's folder_id directly
  const { data, error } = await supabase
    .from('documents')
    .update({ folder_id: folderId })
    .eq('id', documentId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error adding document to enhanced folder:', error);
    throw error;
  }

  return data;
};

export const removeDocumentFromEnhancedFolder = async (documentId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('documents')
    .update({ folder_id: null })
    .eq('id', documentId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error removing document from enhanced folder:', error);
    throw error;
  }

  return data;
};

export const listEnhancedFolderDocuments = async (folderId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('folder_id', folderId)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching enhanced folder documents:', error);
    throw error;
  }

  return { documents: data || [] };
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

  if (filters.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags);
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

  return { 
    documents: data || [], 
    total: count || 0,
    totalPages,
    currentPage: page,
    pageSize
  };
};

export const getUserFolders = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('document_folders')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching user folders:', error);
    throw error;
  }

  return data || [];
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

export const createFolder = async (folderData: {
  name: string;
  description?: string | null;
  category?: string;
  priority?: string;
  color?: string;
  parent_id?: string | null;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('document_folders')
    .insert({
      user_id: user.id,
      name: folderData.name,
      description: folderData.description,
      category: folderData.category,
      priority: folderData.priority,
      color: folderData.color,
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

export const updateFolder = async (folderId: string, updates: Partial<{
  name: string;
  description?: string | null;
  category?: string;
  priority?: string;
  color?: string;
  parent_id?: string | null;
}>) => {
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

  // Verify folder ownership
  const { data: folder } = await supabase
    .from('document_folders')
    .select('id')
    .eq('id', folderId)
    .eq('user_id', user.id)
    .single();

  if (!folder) throw new Error('Folder not found or access denied');

  // Verify document ownership
  const { data: document } = await supabase
    .from('documents')
    .select('id')
    .eq('id', documentId)
    .eq('user_id', user.id)
    .single();

  if (!document) throw new Error('Document not found or access denied');

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

  // Verify folder ownership
  const { data: folder } = await supabase
    .from('document_folders')
    .select('id')
    .eq('id', folderId)
    .eq('user_id', user.id)
    .single();

  if (!folder) throw new Error('Folder not found or access denied');

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

  // Verify folder ownership
  const { data: folder } = await supabase
    .from('document_folders')
    .select('id')
    .eq('id', folderId)
    .eq('user_id', user.id)
    .single();

  if (!folder) throw new Error('Folder not found or access denied');

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

  const documents = data?.map(item => item.documents).filter(Boolean) || [];
  return { documents };
};

// Document search function
export const searchDocuments = async (query: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('documents')
    .select('id, title, content, content_type')
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
    excerpt: doc.content.substring(0, 100) + '...',
    content_type: doc.content_type
  })) || [];
};

// Document tags function
export const getDocumentTags = async (documentId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // First verify document ownership
  const { data: document } = await supabase
    .from('documents')
    .select('id')
    .eq('id', documentId)
    .eq('user_id', user.id)
    .single();

  if (!document) throw new Error('Document not found or access denied');

  const { data, error } = await supabase
    .from('document_tags')
    .select('*')
    .eq('document_id', documentId);

  if (error) {
    console.error('Error fetching document tags:', error);
    throw error;
  }

  return data || [];
};

// Grand Strategist API call - ENHANCED VERSION with better error handling
export const callGrandStrategist = async (prompt: string, documentContext?: { id: string; title: string; content: string; type: 'document' | 'chapter'; metadata?: any }) => {
  try {
    console.log('Calling Grand Strategist with:', {
      promptLength: prompt?.length || 0,
      hasContext: !!documentContext,
      contextType: documentContext?.type,
      contextTitle: documentContext?.title
    });

    // Validate input
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Please provide a question or prompt for the AI assistant.');
    }

    if (prompt.length > 4000) {
      throw new Error('Your message is too long. Please keep it under 4000 characters.');
    }

    // Prepare context with proper structure
    let contextToSend = documentContext;
    if (documentContext && documentContext.content) {
      // Limit content size to prevent API issues
      const maxContentLength = 8000;
      if (documentContext.content.length > maxContentLength) {
        contextToSend = {
          ...documentContext,
          content: documentContext.content.substring(0, maxContentLength) + '\n...(content truncated for processing)'
        };
      }
    }
    
    const { data, error } = await supabase.functions.invoke('grand-strategist', {
      body: { 
        prompt: prompt.trim(),
        documentContext: contextToSend
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      
      // Provide user-friendly error messages
      if (error.message?.includes('not found')) {
        throw new Error('AI service is temporarily unavailable. Please try again in a moment.');
      } else if (error.message?.includes('timeout')) {
        throw new Error('Request timed out. Please try again with a shorter message.');
      } else if (error.message?.includes('API key')) {
        throw new Error('AI service configuration error. Please contact support.');
      } else {
        throw new Error(`AI service error: ${error.message || 'Unknown error'}`);
      }
    }

    if (!data) {
      throw new Error('No response received from AI service. Please try again.');
    }

    if (!data.success) {
      throw new Error(data.error || 'AI service returned an error. Please try again.');
    }

    if (!data.response) {
      throw new Error('Empty response from AI service. Please try again.');
    }

    console.log('Grand Strategist response received successfully');
    return data;

  } catch (error) {
    console.error('Error in Grand Strategist API call:', error);
    
    // Re-throw with user-friendly message if it's not already user-friendly
    if (error.message && (
      error.message.includes('AI service') || 
      error.message.includes('Please') ||
      error.message.includes('configuration')
    )) {
      throw error;
    } else {
      throw new Error('Unable to connect to AI assistant. Please check your connection and try again.');
    }
  }
};

// AI Session Management
export const createAISession = async (documentId: string, documentType: 'document' | 'chapter') => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const sessionData: any = {
    user_id: user.id,
    session_type: documentType,
    chat_history: [],
    is_active: true
  };

  if (documentType === 'document') {
    sessionData.document_id = documentId;
  } else {
    sessionData.chapter_id = documentId;
  }

  const { data, error } = await supabase
    .from('ai_sessions')
    .insert(sessionData)
    .select()
    .single();

  if (error) {
    console.error('Error creating AI session:', error);
    throw error;
  }

  return data;
};

export const getAISession = async (documentId: string, documentType: 'document' | 'chapter') => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('ai_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq(documentType === 'document' ? 'document_id' : 'chapter_id', documentId)
    .eq('session_type', documentType)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching AI session:', error);
    throw error;
  }

  return data;
};

export const updateAISession = async (sessionId: string, updates: { chat_history?: any[]; context_summary?: string }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('ai_sessions')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
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
      folder_id: documentData.folder_id || null,
      tags: documentData.tags || [],
      status: documentData.status || 'draft',
      metadata: documentData.metadata || {},
      organization_id: user.id
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

// Book functions - NOW WORKING
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

// Chapter functions - NOW WORKING
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
