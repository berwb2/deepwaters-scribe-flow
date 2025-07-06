import { supabase } from '@/integrations/supabase/client';

export interface SearchFilters {
  workspace_id?: string;
  document_type?: string;
  created_by?: string;
  date_from?: string;
  date_to?: string;
  folder_id?: string;
}

export interface SearchResults {
  documents: any[];
  fileMatches: any[];
  totalResults: number;
}

class SearchService {
  async searchDocuments(query: string, filters: SearchFilters = {}): Promise<SearchResults> {
    try {
      let searchQuery = supabase
        .from('documents')
        .select(`
          id,
          title,
          content,
          document_type,
          created_at,
          updated_at,
          file_attachments(
            id,
            file_name,
            file_type,
            extracted_text
          )
        `)
        .eq('is_deleted', false);
      
      // Full-text search using PostgreSQL's search vector
      if (query && query.trim()) {
        searchQuery = searchQuery.textSearch('search_vector', query, {
          type: 'websearch',
          config: 'english'
        });
      }
      
      // Apply filters
      if (filters.workspace_id) {
        searchQuery = searchQuery.eq('workspace_id', filters.workspace_id);
      }
      
      if (filters.document_type) {
        searchQuery = searchQuery.eq('document_type', filters.document_type);
      }
      
      if (filters.created_by) {
        searchQuery = searchQuery.eq('user_id', filters.created_by);
      }
      
      if (filters.folder_id) {
        // Search in folder documents
        const { data: folderDocs } = await supabase
          .from('folder_documents')
          .select('document_id')
          .eq('folder_id', filters.folder_id);
        
        if (folderDocs && folderDocs.length > 0) {
          const docIds = folderDocs.map(fd => fd.document_id);
          searchQuery = searchQuery.in('id', docIds);
        } else {
          // No documents in folder, return empty results
          return { documents: [], fileMatches: [], totalResults: 0 };
        }
      }
      
      // Date range filter
      if (filters.date_from) {
        searchQuery = searchQuery.gte('created_at', filters.date_from);
      }
      
      if (filters.date_to) {
        searchQuery = searchQuery.lte('created_at', filters.date_to);
      }
      
      // Order by relevance and recency
      searchQuery = searchQuery.order('created_at', { ascending: false });
      
      const { data, error } = await searchQuery;
      
      if (error) throw error;
      
      // Also search in file attachments
      const fileSearchResults = await this.searchFileAttachments(query);
      
      return {
        documents: data || [],
        fileMatches: fileSearchResults || [],
        totalResults: (data?.length || 0) + (fileSearchResults?.length || 0)
      };
      
    } catch (error) {
      console.error('Search error:', error);
      return { documents: [], fileMatches: [], totalResults: 0 };
    }
  }
  
  private async searchFileAttachments(query: string) {
    if (!query || !query.trim()) return [];
    
    try {
      const { data, error } = await supabase
        .from('file_attachments')
        .select(`
          id,
          file_name,
          file_type,
          extracted_text,
          document_id,
          documents(id, title)
        `)
        .ilike('extracted_text', `%${query}%`)
        .limit(10);
      
      if (error) throw error;
      
      return data || [];
      
    } catch (error) {
      console.error('File search error:', error);
      return [];
    }
  }
  
  async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('title')
        .ilike('title', `%${query}%`)
        .eq('is_deleted', false)
        .limit(5);
      
      if (error) throw error;
      
      return data?.map(doc => doc.title) || [];
      
    } catch (error) {
      console.error('Suggestions error:', error);
      return [];
    }
  }
  
  async searchByTags(tags: string[]): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('document_tags')
        .select(`
          document_id,
          documents(
            id,
            title,
            content,
            document_type,
            created_at,
            updated_at
          )
        `)
        .in('tag_name', tags);
      
      if (error) throw error;
      
      return data?.map(item => item.documents).filter(Boolean) || [];
      
    } catch (error) {
      console.error('Tag search error:', error);
      return [];
    }
  }
}

export default new SearchService();