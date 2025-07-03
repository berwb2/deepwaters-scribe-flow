
import { supabase } from "@/integrations/supabase/client";

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
