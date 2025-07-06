import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export interface DocumentWithAttachments {
  id: string;
  title: string;
  content: string;
  document_type: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  metadata: any;
  file_attachments: any[];
  user_id: string;
}

// Hook to fetch documents with enhanced filtering
export const useEnhancedDocuments = (options: {
  folderId?: string | null;
  documentType?: string;
  includeDeleted?: boolean;
} = {}) => {
  return useQuery({
    queryKey: ['enhanced-documents', options],
    queryFn: async (): Promise<DocumentWithAttachments[]> => {
      let query = supabase
        .from('documents')
        .select(`
          id,
          title,
          content,
          document_type,
          created_at,
          updated_at,
          is_deleted,
          metadata,
          user_id,
          file_attachments(
            id,
            file_name,
            file_type,
            file_size,
            created_at
          )
        `)
        .order('updated_at', { ascending: false });
      
      // Filter by deleted status
      if (!options.includeDeleted) {
        query = query.eq('is_deleted', false);
      }
      
      // Filter by document type
      if (options.documentType) {
        query = query.eq('document_type', options.documentType);
      }
      
      // Filter by folder
      if (options.folderId) {
        // Get documents in specific folder
        const { data: folderDocs } = await supabase
          .from('folder_documents')
          .select('document_id')
          .eq('folder_id', options.folderId);
        
        if (folderDocs && folderDocs.length > 0) {
          const docIds = folderDocs.map(fd => fd.document_id);
          query = query.in('id', docIds);
        } else {
          return [];
        }
      } else if (options.folderId === null) {
        // Get documents not in any folder
        const { data: allFolderDocs } = await supabase
          .from('folder_documents')
          .select('document_id');
        
        if (allFolderDocs && allFolderDocs.length > 0) {
          const docIds = allFolderDocs.map(fd => fd.document_id);
          query = query.not('id', 'in', `(${docIds.join(',')})`);
        }
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to fetch single document with attachments
export const useEnhancedDocument = (documentId: string | undefined) => {
  return useQuery({
    queryKey: ['enhanced-document', documentId],
    queryFn: async (): Promise<DocumentWithAttachments | null> => {
      if (!documentId) return null;
      
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          file_attachments(
            id,
            file_name,
            file_type,
            file_size,
            file_path,
            extracted_text,
            created_at
          )
        `)
        .eq('id', documentId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Document not found
        }
        throw error;
      }
      
      return data;
    },
    enabled: !!documentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to create document
export const useCreateDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      title: string;
      content: string;
      document_type?: string;
      folder_id?: string;
      metadata?: any;
    }) => {
      const { data: result, error } = await supabase
        .from('documents')
        .insert({
          title: data.title,
          content: data.content,
          content_type: data.document_type || 'document',
          metadata: data.metadata || {},
          is_deleted: false
        } as any)
        .select()
        .single();
      
      if (error) throw error;
      
      // Add to folder if specified
      if (data.folder_id && result) {
        await supabase
          .from('folder_documents')
          .insert({
            folder_id: data.folder_id,
            document_id: result.id
          });
      }
      
      return result;
    },
    onSuccess: (data) => {
      toast.success('Document created successfully');
      queryClient.invalidateQueries({ queryKey: ['enhanced-documents'] });
      queryClient.setQueryData(['enhanced-document', data.id], data);
    },
    onError: (error) => {
      toast.error('Failed to create document');
      console.error('Create document error:', error);
    },
  });
};

// Hook to update document
export const useUpdateDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      id: string;
      title?: string;
      content?: string;
      document_type?: string;
      metadata?: any;
    }) => {
      const { data: result, error } = await supabase
        .from('documents')
        .update({
          ...(data.title !== undefined && { title: data.title }),
          ...(data.content !== undefined && { content: data.content }),
          ...(data.document_type !== undefined && { document_type: data.document_type }),
          ...(data.metadata !== undefined && { metadata: data.metadata }),
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      toast.success('Document updated successfully');
      queryClient.invalidateQueries({ queryKey: ['enhanced-documents'] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-document', data.id] });
    },
    onError: (error) => {
      toast.error('Failed to update document');
      console.error('Update document error:', error);
    },
  });
};

// Hook to delete document (soft delete)
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await supabase
        .from('documents')
        .update({ is_deleted: true })
        .eq('id', documentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Document deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['enhanced-documents'] });
    },
    onError: (error) => {
      toast.error('Failed to delete document');
      console.error('Delete document error:', error);
    },
  });
};

// Hook to restore document
export const useRestoreDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await supabase
        .from('documents')
        .update({ is_deleted: false })
        .eq('id', documentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Document restored successfully');
      queryClient.invalidateQueries({ queryKey: ['enhanced-documents'] });
    },
    onError: (error) => {
      toast.error('Failed to restore document');
      console.error('Restore document error:', error);
    },
  });
};

// Hook to permanently delete document
export const usePermanentDeleteDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (documentId: string) => {
      // First delete file attachments
      const { data: attachments } = await supabase
        .from('file_attachments')
        .select('file_path')
        .eq('document_id', documentId);
      
      if (attachments && attachments.length > 0) {
        const filePaths = attachments.map(a => a.file_path);
        await supabase.storage
          .from('document-files')
          .remove(filePaths);
      }
      
      // Delete document
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Document permanently deleted');
      queryClient.invalidateQueries({ queryKey: ['enhanced-documents'] });
    },
    onError: (error) => {
      toast.error('Failed to permanently delete document');
      console.error('Permanent delete error:', error);
    },
  });
};