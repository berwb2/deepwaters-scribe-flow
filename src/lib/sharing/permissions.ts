/**
 * Permission utilities and validation
 * Centralized permission logic for better consistency
 */

import { supabase } from '@/integrations/supabase/client';
import { UserPermission, PermissionLevel } from './types';
import { handleDatabaseError, getCurrentUserId } from './utils';

/**
 * Permission hierarchy for validation
 */
const PERMISSION_HIERARCHY: Record<PermissionLevel, number> = {
  'view': 1,
  'comment': 2,
  'edit': 3
};

/**
 * Checks if a user has sufficient permission level
 */
export const hasPermission = (
  userPermission: UserPermission,
  requiredPermission: PermissionLevel
): boolean => {
  if (userPermission === 'owner') return true;
  if (userPermission === 'none') return false;
  
  const userLevel = PERMISSION_HIERARCHY[userPermission as PermissionLevel] || 0;
  const requiredLevel = PERMISSION_HIERARCHY[requiredPermission];
  
  return userLevel >= requiredLevel;
};

/**
 * Gets user's permission level for a document
 * Uses RPC function for efficient permission checking
 */
export const getUserDocumentPermission = async (
  documentId: string,
  userId?: string
): Promise<UserPermission> => {
  try {
    const targetUserId = userId || await getCurrentUserId();
    
    const { data, error } = await supabase.rpc('get_user_document_permission', {
      p_document_id: documentId,
      p_user_id: targetUserId
    });

    if (error) {
      handleDatabaseError(error);
    }

    return (data as UserPermission) || 'none';
  } catch (error) {
    console.error('Error checking document permission:', error);
    return 'none';
  }
};

/**
 * Gets user's permission level for a folder
 */
export const getUserFolderPermission = async (
  folderId: string,
  userId?: string
): Promise<UserPermission> => {
  try {
    const targetUserId = userId || await getCurrentUserId();
    
    // Check if user owns the folder
    const { data: folder, error: folderError } = await supabase
      .from('document_folders')
      .select('user_id')
      .eq('id', folderId)
      .single();
    
    if (folderError) {
      handleDatabaseError(folderError);
    }
    
    if (folder?.user_id === targetUserId) {
      return 'owner';
    }
    
    // Check folder shares
    const { data: share, error: shareError } = await supabase
      .from('folder_shares')
      .select('permission_level')
      .eq('folder_id', folderId)
      .eq('shared_with', targetUserId)
      .single();
    
    if (shareError && shareError.code !== 'PGRST116') {
      handleDatabaseError(shareError);
    }
    
    return (share?.permission_level as UserPermission) || 'none';
  } catch (error) {
    console.error('Error checking folder permission:', error);
    return 'none';
  }
};

/**
 * Bulk permission check for multiple documents
 */
export const getBulkDocumentPermissions = async (
  documentIds: string[],
  userId?: string
): Promise<Map<string, UserPermission>> => {
  if (documentIds.length === 0) {
    return new Map();
  }
  
  try {
    const targetUserId = userId || await getCurrentUserId();
    const permissionMap = new Map<string, UserPermission>();
    
    // Check ownership
    const { data: ownedDocs, error: ownerError } = await supabase
      .from('documents')
      .select('id')
      .eq('user_id', targetUserId)
      .in('id', documentIds);
    
    if (ownerError) {
      handleDatabaseError(ownerError);
    }
    
    ownedDocs?.forEach(doc => {
      permissionMap.set(doc.id, 'owner');
    });
    
    // Check shares for non-owned documents
    const nonOwnedIds = documentIds.filter(id => !permissionMap.has(id));
    
    if (nonOwnedIds.length > 0) {
      const { data: shares, error: shareError } = await supabase
        .from('document_shares')
        .select('document_id, permission_level')
        .eq('shared_with', targetUserId)
        .in('document_id', nonOwnedIds);
      
      if (shareError) {
        handleDatabaseError(shareError);
      }
      
      shares?.forEach(share => {
        permissionMap.set(share.document_id, share.permission_level as UserPermission);
      });
      
      // Check public documents
      const { data: publicDocs, error: publicError } = await supabase
        .from('documents')
        .select('id')
        .eq('is_public', true)
        .in('id', nonOwnedIds.filter(id => !permissionMap.has(id)));
      
      if (publicError) {
        handleDatabaseError(publicError);
      }
      
      publicDocs?.forEach(doc => {
        if (!permissionMap.has(doc.id)) {
          permissionMap.set(doc.id, 'view');
        }
      });
    }
    
    // Set 'none' for documents without any permission
    documentIds.forEach(id => {
      if (!permissionMap.has(id)) {
        permissionMap.set(id, 'none');
      }
    });
    
    return permissionMap;
  } catch (error) {
    console.error('Error checking bulk permissions:', error);
    // Return 'none' for all documents on error
    const errorMap = new Map<string, UserPermission>();
    documentIds.forEach(id => errorMap.set(id, 'none'));
    return errorMap;
  }
};

/**
 * Validates if a user can perform an action on a document
 */
export const validateDocumentAction = async (
  documentId: string,
  requiredPermission: PermissionLevel,
  userId?: string
): Promise<boolean> => {
  const userPermission = await getUserDocumentPermission(documentId, userId);
  return hasPermission(userPermission, requiredPermission);
};

/**
 * Validates if a user can perform an action on a folder
 */
export const validateFolderAction = async (
  folderId: string,
  requiredPermission: PermissionLevel,
  userId?: string
): Promise<boolean> => {
  const userPermission = await getUserFolderPermission(folderId, userId);
  return hasPermission(userPermission, requiredPermission);
};

/**
 * Gets all accessible document IDs for a user
 */
export const getAccessibleDocuments = async (
  userId?: string
): Promise<string[]> => {
  try {
    const targetUserId = userId || await getCurrentUserId();
    
    // Get owned documents
    const { data: ownedDocs, error: ownedError } = await supabase
      .from('documents')
      .select('id')
      .eq('user_id', targetUserId)
      .eq('is_deleted', false);
    
    if (ownedError) {
      handleDatabaseError(ownedError);
    }
    
    // Get shared documents
    const { data: sharedDocs, error: sharedError } = await supabase
      .from('document_shares')
      .select('document_id')
      .eq('shared_with', targetUserId);
    
    if (sharedError) {
      handleDatabaseError(sharedError);
    }
    
    // Get public documents
    const { data: publicDocs, error: publicError } = await supabase
      .from('documents')
      .select('id')
      .eq('is_public', true)
      .eq('is_deleted', false);
    
    if (publicError) {
      handleDatabaseError(publicError);
    }
    
    // Combine all accessible document IDs
    const accessibleIds = new Set<string>();
    
    ownedDocs?.forEach(doc => accessibleIds.add(doc.id));
    sharedDocs?.forEach(share => accessibleIds.add(share.document_id));
    publicDocs?.forEach(doc => accessibleIds.add(doc.id));
    
    return Array.from(accessibleIds);
  } catch (error) {
    console.error('Error getting accessible documents:', error);
    return [];
  }
};