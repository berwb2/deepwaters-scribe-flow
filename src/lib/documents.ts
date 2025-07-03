
import { supabase } from "@/integrations/supabase/client";

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

  // Start with base query
  let baseQuery = supabase
    .from('documents')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id);

  // Apply content type filter
  if (filters.contentType && filters.contentType !== 'all') {
    baseQuery = baseQuery.eq('content_type', filters.contentType);
  }

  // Apply search filter
  if (filters.search) {
    baseQuery = baseQuery.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
  }

  // Apply folder filter
  if (filters.folder_id) {
    baseQuery = baseQuery.eq('folder_id', filters.folder_id);
  }

  // Apply status filter
  if (filters.status) {
    baseQuery = baseQuery.eq('status', filters.status);
  }

  // Apply sorting
  const sortedQuery = baseQuery.order(sortBy.field, { ascending: sortBy.direction === 'asc' });

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const paginatedQuery = sortedQuery.range(from, to);

  // Execute query with explicit type handling
  const queryResult = await paginatedQuery;
  
  if (queryResult.error) {
    console.error('Error fetching documents:', queryResult.error);
    throw queryResult.error;
  }

  const totalPages = queryResult.count ? Math.ceil(queryResult.count / pageSize) : 0;

  // Add empty tags array to documents for compatibility
  const documentsWithTags = queryResult.data?.map(doc => ({
    ...doc,
    tags: [] as string[]
  })) || [];

  return { 
    documents: documentsWithTags, 
    total: queryResult.count || 0,
    totalPages,
    currentPage: page,
    pageSize
  };
};

export const getDocument = async (documentId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const queryResult = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .eq('user_id', user.id)
    .single();

  if (queryResult.error) {
    console.error('Error fetching document:', queryResult.error);
    throw queryResult.error;
  }

  return { ...queryResult.data, tags: [] };
};

export const createDocument = async (documentData: {
  title: string;
  content: string;
  content_type: string;
  folder_id?: string;
  tags?: string[];
  status?: string;
  metadata?: any;
  is_template?: boolean;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const insertResult = await supabase
    .from('documents')
    .insert({
      user_id: user.id,
      title: documentData.title,
      content: documentData.content,
      content_type: documentData.content_type,
      is_template: documentData.is_template || false,
      metadata: documentData.metadata || {}
    })
    .select()
    .single();

  if (insertResult.error) {
    console.error('Error creating document:', insertResult.error);
    throw insertResult.error;
  }

  return { ...insertResult.data, tags: [] };
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

  const updateResult = await supabase
    .from('documents')
    .update(updates)
    .eq('id', documentId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (updateResult.error) {
    console.error('Error updating document:', updateResult.error);
    throw updateResult.error;
  }

  return updateResult.data;
};

export const deleteDocument = async (documentId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const deleteResult = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)
    .eq('user_id', user.id);

  if (deleteResult.error) {
    console.error('Error deleting document:', deleteResult.error);
    throw deleteResult.error;
  }

  return { success: true };
};

export const searchDocuments = async (query: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const searchResult = await supabase
    .from('documents')
    .select('id, title, content')
    .eq('user_id', user.id)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .limit(10);

  if (searchResult.error) {
    console.error('Error searching documents:', searchResult.error);
    throw searchResult.error;
  }

  return searchResult.data?.map(doc => ({
    id: doc.id,
    title: doc.title,
    excerpt: doc.content.substring(0, 150) + '...',
    content_type: 'document'
  })) || [];
};
