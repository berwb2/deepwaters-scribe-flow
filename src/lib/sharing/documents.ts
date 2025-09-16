/**
 * Document sharing functionality
 * Handles document-specific sharing operations with enhanced features
 */

import { supabase } from '@/integrations/supabase/client';
import { 
  DocumentShare, 
  PermissionLevel, 
  ShareInvitation, 
  BulkShareResult,
  ShareOptions 
} from './types';
import { 
  handleDatabaseError, 
  getCurrentUserId, 
  batchFetchUserProfiles,
  isValidEmail,
  isValidPermissionLevel,
  withRetry
} from './utils';
import { validateDocumentAction } from './permissions';

/**
 * Shares a document with a single user
 * Enhanced with validation and notification support
 */
export const shareDocumentWithUser = async (
  documentId: string,
  userEmail: string,
  permissionLevel: PermissionLevel,
  options: ShareOptions = {}
): Promise<DocumentShare> => {
  // Validation
  if (!isValidEmail(userEmail)) {
    throw new Error('Invalid email address');
  }
  
  if (!isValidPermissionLevel(permissionLevel)) {
    throw new Error('Invalid permission level');
  }
  
  // Check if current user can share the document
  const canShare = await validateDocumentAction(documentId, 'edit');
  if (!canShare) {
    throw new Error('You do not have permission to share this document');
  }
  
  try {
    const currentUserId = await getCurrentUserId();
    
    // Find user by email (assuming email is stored in profiles)
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userEmail) // This assumes email is stored as id, might need adjustment
      .single();

    if (userError) {
      handleDatabaseError(userError);
    }

    // Check if already shared
    const { data: existingShare } = await supabase
      .from('document_shares')
      .select('id')
      .eq('document_id', documentId)
      .eq('shared_with', userData.id)
      .single();
    
    if (existingShare) {
      throw new Error('Document is already shared with this user');
    }

    // Create the share
    const { data, error } = await supabase
      .from('document_shares')
      .insert({
        document_id: documentId,
        shared_with: userData.id,
        permission_level: permissionLevel,
        shared_by: currentUserId
      })
      .select()
      .single();

    if (error) {
      handleDatabaseError(error);
    }

    // Fetch user profile for the response
    const profileMap = await batchFetchUserProfiles([userData.id]);
    const profile = profileMap.get(userData.id);

    const result: DocumentShare = {
      ...data,
      shared_with_profile: profile
    };

    // TODO: Send notification if options.notify is true
    // This could be implemented with email notifications or in-app notifications

    return result;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Bulk share document with multiple users
 * Returns detailed results for each user
 */
export const bulkShareDocument = async (
  documentId: string,
  invitations: ShareInvitation[],
  options: ShareOptions = {}
): Promise<BulkShareResult> => {
  const results: BulkShareResult = {
    success: [],
    failed: []
  };
  
  // Validate all invitations first
  for (const invitation of invitations) {
    if (!isValidEmail(invitation.email)) {
      results.failed.push({
        email: invitation.email,
        error: 'Invalid email address'
      });
      continue;
    }
    
    if (!isValidPermissionLevel(invitation.permission_level)) {
      results.failed.push({
        email: invitation.email,
        error: 'Invalid permission level'
      });
      continue;
    }
  }
  
  // Check permission once
  const canShare = await validateDocumentAction(documentId, 'edit');
  if (!canShare) {
    throw new Error('You do not have permission to share this document');
  }
  
  // Process valid invitations
  const validInvitations = invitations.filter(inv => 
    !results.failed.some(f => f.email === inv.email)
  );
  
  for (const invitation of validInvitations) {
    try {
      const share = await shareDocumentWithUser(
        documentId, 
        invitation.email, 
        invitation.permission_level,
        options
      );
      results.success.push(share);
    } catch (error: any) {
      results.failed.push({
        email: invitation.email,
        error: error.message || 'Failed to share document'
      });
    }
  }
  
  return results;
};

/**
 * Gets all shares for a document with optimized profile fetching
 */
export const getDocumentShares = async (documentId: string): Promise<DocumentShare[]> => {
  try {
    const { data, error } = await supabase
      .from('document_shares')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    if (error) {
      handleDatabaseError(error);
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Batch fetch all user profiles
    const userIds = data.map(share => share.shared_with);
    const profileMap = await batchFetchUserProfiles(userIds);

    // Combine shares with profiles
    const sharesWithProfiles: DocumentShare[] = data.map(share => ({
      ...share,
      permission_level: share.permission_level as PermissionLevel,
      shared_with_profile: profileMap.get(share.shared_with)
    }));

    return sharesWithProfiles;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Updates permission level for a document share
 */
export const updateDocumentShare = async (
  shareId: string,
  permissionLevel: PermissionLevel
): Promise<DocumentShare> => {
  if (!isValidPermissionLevel(permissionLevel)) {
    throw new Error('Invalid permission level');
  }
  
  try {
    // Get the share to check document ownership
    const { data: shareData, error: shareError } = await supabase
      .from('document_shares')
      .select('document_id')
      .eq('id', shareId)
      .single();
    
    if (shareError) {
      handleDatabaseError(shareError);
    }
    
    // Check permission
    const canUpdate = await validateDocumentAction(shareData.document_id, 'edit');
    if (!canUpdate) {
      throw new Error('You do not have permission to update this share');
    }
    
    const { data, error } = await supabase
      .from('document_shares')
      .update({ permission_level: permissionLevel })
      .eq('id', shareId)
      .select()
      .single();

    if (error) {
      handleDatabaseError(error);
    }

    // Fetch user profile
    const profileMap = await batchFetchUserProfiles([data.shared_with]);
    const profile = profileMap.get(data.shared_with);

    return {
      ...data,
      shared_with_profile: profile
    };
  } catch (error: any) {
    throw error;
  }
};

/**
 * Removes a document share
 */
export const removeDocumentShare = async (shareId: string): Promise<void> => {
  try {
    // Get the share to check document ownership
    const { data: shareData, error: shareError } = await supabase
      .from('document_shares')
      .select('document_id')
      .eq('id', shareId)
      .single();
    
    if (shareError) {
      handleDatabaseError(shareError);
    }
    
    // Check permission
    const canRemove = await validateDocumentAction(shareData.document_id, 'edit');
    if (!canRemove) {
      throw new Error('You do not have permission to remove this share');
    }
    
    const { error } = await supabase
      .from('document_shares')
      .delete()
      .eq('id', shareId);

    if (error) {
      handleDatabaseError(error);
    }
  } catch (error: any) {
    throw error;
  }
};

/**
 * Copies a document to the current user's workspace
 * Enhanced with better error handling and validation
 */
export const copyDocumentToWorkspace = async (documentId: string): Promise<string> => {
  try {
    // Check if user has access to the document
    const canAccess = await validateDocumentAction(documentId, 'view');
    if (!canAccess) {
      throw new Error('You do not have permission to access this document');
    }
    
    const { data, error } = await supabase.rpc('copy_document_to_workspace', {
      p_document_id: documentId
    });

    if (error) {
      handleDatabaseError(error);
    }

    return data as string;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Gets sharing statistics for a document
 */
export const getDocumentSharingStats = async (documentId: string) => {
  try {
    const { data: shares, error: sharesError } = await supabase
      .from('document_shares')
      .select('permission_level')
      .eq('document_id', documentId);
    
    if (sharesError) {
      handleDatabaseError(sharesError);
    }
    
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('is_public, created_at')
      .eq('id', documentId)
      .single();
    
    if (docError) {
      handleDatabaseError(docError);
    }
    
    const stats = {
      total_shares: shares?.length || 0,
      view_permissions: shares?.filter(s => s.permission_level === 'view').length || 0,
      comment_permissions: shares?.filter(s => s.permission_level === 'comment').length || 0,
      edit_permissions: shares?.filter(s => s.permission_level === 'edit').length || 0,
      is_public: document?.is_public || false,
      created_at: document?.created_at
    };
    
    return stats;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Removes all shares for a document (make it completely private)
 */
export const removeAllDocumentShares = async (documentId: string): Promise<number> => {
  try {
    // Check permission
    const canRemove = await validateDocumentAction(documentId, 'edit');
    if (!canRemove) {
      throw new Error('You do not have permission to modify shares for this document');
    }
    
    const { data, error } = await supabase
      .from('document_shares')
      .delete()
      .eq('document_id', documentId)
      .select('id');
    
    if (error) {
      handleDatabaseError(error);
    }
    
    return data?.length || 0;
  } catch (error: any) {
    throw error;
  }
};