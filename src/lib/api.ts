import { supabase } from "@/integrations/supabase/client";
import { DocumentMeta, FolderMeta } from "@/types/documents";

// Authentication Functions
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signIn = async (email: string) => {
  const { data, error } = await supabase.auth.signInWithOtp({ email });
  if (error) {
    console.error('Error signing in:', error);
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

export const listFolders = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get folders with document count
  const { data: foldersData, error: foldersError } = await supabase
    .from('document_folders')
    .select(`
      id,
      name,
      description,
      color,
      category,
      priority,
      parent_id,
      created_at,
      user_id
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (foldersError) {
    console.error('Error fetching folders:', foldersError);
    throw foldersError;
  }

  // Get document counts for each folder
  const folderIds = foldersData?.map(f => f.id) || [];
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

  // Combine folders with document counts
  const folders = foldersData?.map(folder => ({
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
    .select(`
      id,
      name,
      description,
      color,
      category,
      priority,
      parent_id,
      created_at,
      user_id
    `)
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

// Folder-Document relationship functions
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

// Grand Strategist API call
export const callGrandStrategist = async (prompt: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('grand-strategist', {
      body: { prompt }
    });

    if (error) {
      console.error('Error calling Grand Strategist:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in Grand Strategist API call:', error);
    throw error;
  }
};

// Document management functions
export const listDocuments = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }

  return { documents: data || [] };
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
  is_template?: boolean;
  metadata?: any;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase.rpc('create_document', {
    p_title: documentData.title,
    p_content: documentData.content,
    p_content_type: documentData.content_type,
    p_is_template: documentData.is_template || false,
    p_metadata: documentData.metadata || {}
  });

  if (error) {
    console.error('Error creating document:', error);
    throw error;
  }

  return { id: data };
};

export const updateDocument = async (documentId: string, updates: {
  title?: string;
  content?: string;
  content_type?: string;
  is_template?: boolean;
  metadata?: any;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase.rpc('update_document', {
    p_document_id: documentId,
    p_title: updates.title,
    p_content: updates.content,
    p_content_type: updates.content_type,
    p_is_template: updates.is_template,
    p_metadata: updates.metadata
  });

  if (error) {
    console.error('Error updating document:', error);
    throw error;
  }

  return { success: true };
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

// Placeholder book functions (temporarily disabled)
export const createBook = async (bookData: { title: string; description?: string | null }) => {
  throw new Error('Book functionality is temporarily unavailable');
};

export const listBooks = async () => {
  return { books: [] };
};

export const getBook = async (bookId: string) => {
  throw new Error('Book functionality is temporarily unavailable');
};

export const updateBook = async (bookId: string, updates: any) => {
  throw new Error('Book functionality is temporarily unavailable');
};

export const deleteBook = async (bookId: string) => {
  throw new Error('Book functionality is temporarily unavailable');
};

export const createChapter = async (chapterData: any) => {
  throw new Error('Chapter functionality is temporarily unavailable');
};

export const listBookChapters = async (bookId: string) => {
  return { chapters: [] };
};

export const getChapter = async (chapterId: string) => {
  throw new Error('Chapter functionality is temporarily unavailable');
};

export const updateChapter = async (chapterId: string, updates: any) => {
  throw new Error('Chapter functionality is temporarily unavailable');
};

export const deleteChapter = async (chapterId: string) => {
  throw new Error('Chapter functionality is temporarily unavailable');
};
