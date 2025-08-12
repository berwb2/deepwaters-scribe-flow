import { supabase } from "@/integrations/supabase/client";

export const listDocuments = async (
  filters: { 
    contentType?: string;
    search?: string;
    folder_id?: string;
    tags?: string[];
    status?: string;
    dateFrom?: string;
  } = {},
  sortBy: { field: string; direction: 'asc' | 'desc' } = { field: 'updated_at', direction: 'desc' },
  page: number = 1,
  pageSize: number = 50
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Build the query using a simpler approach to avoid type inference issues
  let query = supabase
    .from('documents')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id);

  // Apply filters using match for simpler type handling
  const matchConditions: Record<string, any> = {};

  if (filters.contentType && filters.contentType !== 'all') {
    matchConditions.content_type = filters.contentType;
  }
  
  if (filters.folder_id) {
    matchConditions.folder_id = filters.folder_id;
  }
  
  if (filters.status) {
    matchConditions.status = filters.status;
  }

  // Apply all match conditions at once
  if (Object.keys(matchConditions).length > 0) {
    query = query.match(matchConditions);
  }

  // Apply search filter separately using or
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
  }

  // Apply date filter
  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }

  // Execute the query
  const { data, error, count } = await query
    .order(sortBy.field, { ascending: sortBy.direction === 'asc' })
    .range(from, to);

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

  return { ...data, tags: [] };
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

  const { data, error } = await supabase
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

  if (error) {
    console.error('Error creating document:', error);
    throw error;
  }

  return { ...data, tags: [] };
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
