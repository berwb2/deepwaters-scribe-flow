import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

// Authentication APIs
export async function signUp(email: string, password: string, displayName: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      }
    });
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    toast.error("Sign up failed", { description: error.message });
    throw error;
  }
}

export async function signIn(email: string, password: string, rememberMe: boolean = false) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    // If rememberMe is true, set session expiry to 30 days
    if (rememberMe) {
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
    }
    
    return data;
  } catch (error: any) {
    toast.error("Sign in failed", { description: error.message });
    throw error;
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error: any) {
    toast.error("Sign out failed", { description: error.message });
    throw error;
  }
}

export async function requestPasswordReset(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
    toast.success("Password reset email sent", { description: "Check your email for the reset link" });
  } catch (error: any) {
    toast.error("Failed to reset password", { description: error.message });
    throw error;
  }
}

export async function resetPassword(password: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password,
    });
    
    if (error) throw error;
    toast.success("Password updated successfully");
  } catch (error: any) {
    toast.error("Failed to update password", { description: error.message });
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (error) {
    return null;
  }
}

export const getUserProfile = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Not authenticated');
    }
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (error) throw error;
    
    // Return profile with email from auth user
    return { ...profile, email: session.user.email };
    
  } catch (error: any) {
    toast.error(error.message || 'Failed to fetch profile');
    throw error;
  }
};

export async function updateUserProfile(updates: any) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    toast.success("Profile updated successfully");
    return data;
  } catch (error: any) {
    toast.error("Failed to update profile", { description: error.message });
    throw error;
  }
}

// Document APIs
export async function createDocument(title: string, content: string, contentType: string, isTemplate: boolean = false, metadata: any = {}) {
  try {
    // First make sure user is authenticated
    const user = await getCurrentUser();
    if (!user) throw new Error("Not authenticated");

    // Use the Postgres function to create the document
    const { data, error } = await supabase
      .rpc('create_document', {
        p_title: title,
        p_content: content,
        p_content_type: contentType,
        p_is_template: isTemplate,
        p_metadata: metadata
      });

    if (error) throw error;
    toast.success("Document created successfully");
    return data; // Returns the document ID
  } catch (error: any) {
    toast.error("Failed to create document", { description: error.message });
    throw error;
  }
}

export async function getDocument(documentId: string) {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    toast.error("Failed to fetch document", { description: error.message });
    throw error;
  }
}

export async function updateDocument(documentId: string, updates: any) {
  try {
    // Use the Postgres function to update the document
    const { data, error } = await supabase
      .rpc('update_document', {
        p_document_id: documentId,
        p_title: updates.title,
        p_content: updates.content,
        p_content_type: updates.content_type,
        p_is_template: updates.is_template,
        p_metadata: updates.metadata
      });

    if (error) throw error;
    toast.success("Document updated successfully");
    return true;
  } catch (error: any) {
    toast.error("Failed to update document", { description: error.message });
    throw error;
  }
}

export async function listDocuments(filters: any = {}, sort: any = { field: 'updated_at', direction: 'desc' }, page: number = 1, pageSize: number = 20) {
  try {
    let query = supabase
      .from('documents')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.contentType) {
      query = query.eq('content_type', filters.contentType);
    }
    
    if (filters.isTemplate !== undefined) {
      query = query.eq('is_template', filters.isTemplate);
    }
    
    // Apply sorting
    if (sort && sort.field) {
      const direction = sort.direction === 'desc' ? true : false;
      query = query.order(sort.field, { ascending: !direction });
    }
    
    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      documents: data,
      total: count || 0,
      page,
      pageSize,
      totalPages: count ? Math.ceil(count / pageSize) : 0
    };
  } catch (error: any) {
    toast.error("Failed to fetch documents", { description: error.message });
    throw error;
  }
}

export async function deleteDocument(documentId: string) {
  try {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (error) throw error;
    toast.success("Document deleted successfully");
    return true;
  } catch (error: any) {
    toast.error("Failed to delete document", { description: error.message });
    throw error;
  }
}

export async function getDocumentVersions(documentId: string) {
  try {
    // Use the Postgres function to get document versions
    const { data, error } = await supabase
      .rpc('get_document_versions', {
        p_document_id: documentId
      });

    if (error) throw error;
    return data;
  } catch (error: any) {
    toast.error("Failed to fetch document versions", { description: error.message });
    throw error;
  }
}

// Collection APIs
export async function createCollection(name: string, description: string = '') {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from('document_collections')
      .insert({ 
        user_id: user.id,
        name, 
        description 
      })
      .select()
      .single();

    if (error) throw error;
    toast.success("Collection created successfully");
    return data;
  } catch (error: any) {
    toast.error("Failed to create collection", { description: error.message });
    throw error;
  }
}

export async function listCollections() {
  try {
    const { data, error } = await supabase
      .from('document_collections')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  } catch (error: any) {
    toast.error("Failed to fetch collections", { description: error.message });
    throw error;
  }
}

export async function addDocumentToCollection(collectionId: string, documentId: string) {
  try {
    const { error } = await supabase
      .from('collection_documents')
      .insert({ 
        collection_id: collectionId,
        document_id: documentId 
      });

    if (error) throw error;
    toast.success("Document added to collection");
    return true;
  } catch (error: any) {
    toast.error("Failed to add document to collection", { description: error.message });
    throw error;
  }
}

// Document tags APIs
export async function addTagToDocument(documentId: string, tagName: string) {
  try {
    const { error } = await supabase
      .from('document_tags')
      .insert({ 
        document_id: documentId,
        tag_name: tagName 
      });

    if (error) throw error;
    return true;
  } catch (error: any) {
    toast.error("Failed to add tag", { description: error.message });
    throw error;
  }
}

export async function removeTagFromDocument(tagId: string) {
  try {
    const { error } = await supabase
      .from('document_tags')
      .delete()
      .eq('id', tagId);

    if (error) throw error;
    return true;
  } catch (error: any) {
    toast.error("Failed to remove tag", { description: error.message });
    throw error;
  }
}

export async function getDocumentTags(documentId: string) {
  try {
    const { data, error } = await supabase
      .from('document_tags')
      .select('*')
      .eq('document_id', documentId);

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Failed to fetch document tags:", error);
    return [];
  }
}

// Table detection and formatting helper
export function detectTables(content: string): string {
  // This is a basic table detection for markdown-style tables
  // First, let's identify potential table sections in the content
  const lines = content.split('\n');
  let inTable = false;
  let tableStartIndex = -1;
  const tableSections = [];
  
  // Find table sections
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for table row (has | characters)
    const isTableRow = line.includes('|') && line.trim().startsWith('|');
    
    // Check for separator row (has | and --- characters)
    const isSeparatorRow = line.includes('|') && line.includes('---');
    
    if (!inTable && (isTableRow || isSeparatorRow)) {
      inTable = true;
      tableStartIndex = i;
    } else if (inTable && line === '') {
      // End of table detected
      tableSections.push({
        start: tableStartIndex,
        end: i - 1
      });
      inTable = false;
    }
  }
  
  // If we're still in a table at the end of the content
  if (inTable) {
    tableSections.push({
      start: tableStartIndex,
      end: lines.length - 1
    });
  }
  
  // Process each table section
  let result = content;
  for (let i = tableSections.length - 1; i >= 0; i--) {
    const section = tableSections[i];
    const tableLines = lines.slice(section.start, section.end + 1);
    
    // Convert to HTML table
    const htmlTable = convertToHtmlTable(tableLines);
    
    // Replace original table text with HTML table
    const beforeTable = lines.slice(0, section.start).join('\n');
    const afterTable = lines.slice(section.end + 1).join('\n');
    result = beforeTable + '\n' + htmlTable + '\n' + afterTable;
  }
  
  // Also detect simple text tables (aligned with spaces)
  result = detectSpaceAlignedTables(result);
  
  return result;
}

function convertToHtmlTable(tableLines: string[]): string {
  // Process header row
  let headerRow = tableLines[0].trim();
  headerRow = headerRow.startsWith('|') ? headerRow.substring(1) : headerRow;
  headerRow = headerRow.endsWith('|') ? headerRow.substring(0, headerRow.length - 1) : headerRow;
  const headers = headerRow.split('|').map(h => h.trim());
  
  // Create HTML table
  let htmlTable = '<table class="border-collapse w-full my-4">\n';
  
  // Add header row
  htmlTable += '  <thead>\n    <tr>\n';
  headers.forEach(header => {
    htmlTable += `      <th class="border border-gray-300 p-2 bg-gray-100">${header}</th>\n`;
  });
  htmlTable += '    </tr>\n  </thead>\n';
  
  // Add data rows (skip header and separator rows)
  htmlTable += '  <tbody>\n';
  for (let i = 2; i < tableLines.length; i++) {
    let row = tableLines[i].trim();
    if (row === '') continue;
    
    row = row.startsWith('|') ? row.substring(1) : row;
    row = row.endsWith('|') ? row.substring(0, row.length - 1) : row;
    const cells = row.split('|').map(c => c.trim());
    
    htmlTable += '    <tr>\n';
    cells.forEach(cell => {
      htmlTable += `      <td class="border border-gray-300 p-2">${cell}</td>\n`;
    });
    htmlTable += '    </tr>\n';
  }
  
  htmlTable += '  </tbody>\n</table>';
  
  return htmlTable;
}

function detectSpaceAlignedTables(content: string): string {
  // This is a more complex table detection for space-aligned tables
  // For simplicity, we'll use a simple heuristic approach
  // If there are multiple lines with consistent spacing patterns, it might be a table
  
  // Check for patterns like:
  // Header1    Header2    Header3
  // -------    -------    -------
  // Value1     Value2     Value3
  
  // Split content into paragraphs
  const paragraphs = content.split('\n\n');
  let result = content;
  
  paragraphs.forEach(paragraph => {
    const lines = paragraph.split('\n');
    
    // Need at least 3 lines for a table (header, separator, data)
    if (lines.length >= 3) {
      // Check if this might be a space-aligned table
      // Look for consistent spacing and at least 2 columns
      const potentialTableLines = lines.filter(line => 
        line.trim().length > 0 && 
        line.includes('  ') && // At least double spaces between items
        line.split(/\s{2,}/).length >= 2 // At least 2 columns
      );
      
      // If at least 3 lines match the pattern, consider it a table
      if (potentialTableLines.length >= 3) {
        // Convert to HTML table
        const htmlTable = convertSpaceAlignedToHtmlTable(lines);
        result = result.replace(paragraph, htmlTable);
      }
    }
  });
  
  return result;
}

function convertSpaceAlignedToHtmlTable(lines: string[]): string {
  // Filter out empty lines
  const tableLines = lines.filter(line => line.trim().length > 0);
  
  // Identify columns based on the first line
  const firstLine = tableLines[0];
  const columnPositions = [];
  
  // Find starting positions of columns (where there are 2+ spaces)
  for (let i = 0; i < firstLine.length - 1; i++) {
    if (firstLine[i] === ' ' && firstLine[i + 1] === ' ') {
      // Look for the end of the space sequence
      let j = i + 2;
      while (j < firstLine.length && firstLine[j] === ' ') j++;
      
      if (j > i + 1) {
        columnPositions.push(j);
        i = j - 1; // Skip ahead
      }
    }
  }
  
  // Create HTML table
  let htmlTable = '<table class="border-collapse w-full my-4">\n';
  
  // Add header row
  htmlTable += '  <thead>\n    <tr>\n';
  let prevPos = 0;
  columnPositions.forEach(pos => {
    const header = firstLine.substring(prevPos, pos).trim();
    htmlTable += `      <th class="border border-gray-300 p-2 bg-gray-100">${header}</th>\n`;
    prevPos = pos;
  });
  // Add the last column
  const lastHeader = firstLine.substring(prevPos).trim();
  htmlTable += `      <th class="border border-gray-300 p-2 bg-gray-100">${lastHeader}</th>\n`;
  htmlTable += '    </tr>\n  </thead>\n';
  
  // Add data rows (skip the first line which is the header)
  htmlTable += '  <tbody>\n';
  for (let i = 2; i < tableLines.length; i++) { // Skip line 1 which might be separator
    const row = tableLines[i];
    // Skip separator lines
    if (row.includes('---') && row.replace(/[\s-]/g, '').length === 0) continue;
    
    htmlTable += '    <tr>\n';
    prevPos = 0;
    columnPositions.forEach(pos => {
      const cell = row.length >= prevPos ? row.substring(prevPos, pos).trim() : '';
      htmlTable += `      <td class="border border-gray-300 p-2">${cell}</td>\n`;
      prevPos = pos;
    });
    // Add the last column
    const lastCell = row.length >= prevPos ? row.substring(prevPos).trim() : '';
    htmlTable += `      <td class="border border-gray-300 p-2">${lastCell}</td>\n`;
    htmlTable += '    </tr>\n';
  }
  
  htmlTable += '  </tbody>\n</table>';
  
  return htmlTable;
}

export async function searchDocuments(query: string) {
  if (!query || query.length < 2) return [];
  
  try {
    // We use ilike for case-insensitive search
    const { data, error } = await supabase
      .from('documents')
      .select('id, title, content, content_type')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('updated_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    
    // Generate excerpts by finding context around the matching term
    const results = data.map(doc => {
      let excerpt = '';
      if (doc.content) {
        // Try to find the query in the content
        const index = doc.content.toLowerCase().indexOf(query.toLowerCase());
        if (index >= 0) {
          // Get some context around the match
          const start = Math.max(0, index - 40);
          const end = Math.min(doc.content.length, index + query.length + 40);
          excerpt = (start > 0 ? '...' : '') + 
                    doc.content.substring(start, end) + 
                    (end < doc.content.length ? '...' : '');
        } else {
          // If no direct match (might match title), just take the beginning
          excerpt = doc.content.substring(0, 100) + (doc.content.length > 100 ? '...' : '');
        }
      }
      
      return {
        id: doc.id,
        title: doc.title,
        excerpt,
        content_type: doc.content_type
      };
    });
    
    return results;
  } catch (error: any) {
    console.error("Search failed:", error);
    return [];
  }
}

// Add folder management API functions

// Update the interface for folder creation data
export interface FolderCreationData {
  name: string;
  description?: string;
  color?: string;
  priority?: string;
  category?: string;
  user_id?: string;
}

export async function createFolder(folderData: Partial<FolderCreationData>) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Not authenticated");

    // Make sure user_id is set
    const folderWithUserId = {
      ...folderData,
      user_id: user.id
    };

    const { data, error } = await supabase
      .from('document_folders')
      .insert(folderWithUserId)
      .select()
      .single();

    if (error) throw error;
    toast.success("Folder created successfully");
    return data;
  } catch (error: any) {
    toast.error("Failed to create folder", { description: error.message });
    throw error;
  }
}

export async function listFolders(filters: any = {}) {
  try {
    let query = supabase
      .from('document_folders')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }
    
    const { data, error, count } = await query.order('name');
    
    if (error) throw error;
    
    // Add document count to each folder
    const foldersWithCount = await Promise.all(data.map(async (folder) => {
      const { count } = await supabase
        .from('folder_documents')
        .select('*', { count: 'exact' })
        .eq('folder_id', folder.id);
      
      return {
        ...folder,
        document_count: count || 0
      };
    }));
    
    return {
      folders: foldersWithCount,
      total: count || 0,
    };
  } catch (error: any) {
    toast.error("Failed to fetch folders", { description: error.message });
    throw error;
  }
}

export async function getFolder(folderId: string) {
  try {
    const { data, error } = await supabase
      .from('document_folders')
      .select('*')
      .eq('id', folderId)
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error: any) {
    toast.error("Failed to fetch folder", { description: error.message });
    throw error;
  }
}

export async function updateFolder(folderId: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('document_folders')
      .update(updates)
      .eq('id', folderId)
      .select()
      .single();
      
    if (error) throw error;
    
    toast.success("Folder updated successfully");
    return data;
  } catch (error: any) {
    toast.error("Failed to update folder", { description: error.message });
    throw error;
  }
}

export async function deleteFolder(folderId: string) {
  try {
    const { error } = await supabase
      .from('document_folders')
      .delete()
      .eq('id', folderId);
      
    if (error) throw error;
    
    toast.success("Folder deleted successfully");
    return true;
  } catch (error: any) {
    toast.error("Failed to delete folder", { description: error.message });
    throw error;
  }
}

export async function addDocumentToFolder(folderId: string, documentId: string) {
  try {
    const { error } = await supabase
      .from('folder_documents')
      .insert({
        folder_id: folderId,
        document_id: documentId
      });
      
    if (error) throw error;
    
    return true;
  } catch (error: any) {
    toast.error("Failed to add document to folder", { description: error.message });
    throw error;
  }
}

export async function removeDocumentFromFolder(folderId: string, documentId: string) {
  try {
    const { error } = await supabase
      .from('folder_documents')
      .delete()
      .eq('folder_id', folderId)
      .eq('document_id', documentId);
      
    if (error) throw error;
    
    return true;
  } catch (error: any) {
    toast.error("Failed to remove document from folder", { description: error.message });
    throw error;
  }
}

export async function listFolderDocuments(folderId: string | null) {
  try {
    let query;
    
    if (folderId) {
      // Get documents in the specific folder
      query = supabase
        .from('documents')
        .select(`
          *,
          folder_documents!inner(folder_id)
        `)
        .eq('folder_documents.folder_id', folderId);
    } else {
      // Get documents not in any folder
      query = supabase
        .from('documents')
        .select('*')
        .not('id', 'in', supabase
          .from('folder_documents')
          .select('document_id')
        );
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      documents: data,
      total: count || 0
    };
  } catch (error: any) {
    console.error("Failed to fetch folder documents:", error);
    return {
      documents: [],
      total: 0
    };
  }
}
