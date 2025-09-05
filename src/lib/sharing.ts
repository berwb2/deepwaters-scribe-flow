import { supabase } from '@/integrations/supabase/client';

export interface DocumentShare {
  id: string;
  document_id: string;
  shared_by: string;
  shared_with: string;
  permission_level: 'view' | 'comment' | 'edit';
  created_at: string;
  shared_with_profile?: {
    display_name?: string;
    avatar_url?: string;
  };
}

export interface FolderShare {
  id: string;
  folder_id: string;
  shared_by: string;
  shared_with: string;
  permission_level: 'view' | 'comment' | 'edit';
  created_at: string;
  shared_with_profile?: {
    display_name?: string;
    avatar_url?: string;
  };
}

export interface DocumentComment {
  id: string;
  document_id: string;
  user_id: string;
  content: string;
  position_start?: number;
  position_end?: number;
  highlighted_text?: string;
  parent_comment_id?: string;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
  user_profile?: {
    display_name?: string;
    avatar_url?: string;
  };
  replies?: DocumentComment[];
}

export interface DocumentChange {
  id: string;
  document_id: string;
  user_id: string;
  change_type: 'insert' | 'delete' | 'format';
  change_data: any;
  position?: number;
  content_before?: string;
  content_after?: string;
  created_at: string;
  user_profile?: {
    display_name?: string;
    avatar_url?: string;
  };
}

// Document sharing functions
export const shareDocumentWithUser = async (documentId: string, userEmail: string, permissionLevel: 'view' | 'comment' | 'edit') => {
  // First get the user ID from email
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userEmail) // Assuming email is stored as id or we need to add email field
    .single();

  if (userError) throw userError;

  const { data, error } = await supabase
    .from('document_shares')
    .insert({
      document_id: documentId,
      shared_with: userData.id,
      permission_level: permissionLevel,
      shared_by: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getDocumentShares = async (documentId: string) => {
  const { data, error } = await supabase
    .from('document_shares')
    .select('*')
    .eq('document_id', documentId);

  if (error) throw error;

  // Get user profiles separately
  const sharesWithProfiles = await Promise.all(
    (data || []).map(async (share) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', share.shared_with)
        .single();

      return {
        ...share,
        shared_with_profile: profile || undefined
      };
    })
  );

  return sharesWithProfiles as DocumentShare[];
};

export const updateDocumentShare = async (shareId: string, permissionLevel: 'view' | 'comment' | 'edit') => {
  const { data, error } = await supabase
    .from('document_shares')
    .update({ permission_level: permissionLevel })
    .eq('id', shareId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const removeDocumentShare = async (shareId: string) => {
  const { error } = await supabase
    .from('document_shares')
    .delete()
    .eq('id', shareId);

  if (error) throw error;
};

// Comments functions
export const getDocumentComments = async (documentId: string) => {
  const { data, error } = await supabase
    .from('document_comments')
    .select('*')
    .eq('document_id', documentId)
    .is('parent_comment_id', null)
    .order('created_at', { ascending: true });

  if (error) throw error;

  // Get user profiles and replies for each comment
  const commentsWithReplies = await Promise.all(
    (data || []).map(async (comment) => {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', comment.user_id)
        .single();

      // Get replies
      const { data: repliesData, error: repliesError } = await supabase
        .from('document_comments')
        .select('*')
        .eq('parent_comment_id', comment.id)
        .order('created_at', { ascending: true });

      if (repliesError) throw repliesError;

      // Get profiles for replies
      const repliesWithProfiles = await Promise.all(
        (repliesData || []).map(async (reply) => {
          const { data: replyProfile } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('id', reply.user_id)
            .single();

          return {
            ...reply,
            user_profile: replyProfile || undefined
          };
        })
      );

      return {
        ...comment,
        user_profile: profile || undefined,
        replies: repliesWithProfiles
      };
    })
  );

  return commentsWithReplies as DocumentComment[];
};

export const createComment = async (
  documentId: string, 
  content: string, 
  positionStart?: number, 
  positionEnd?: number, 
  highlightedText?: string,
  parentCommentId?: string
) => {
  const { data, error } = await supabase
    .from('document_comments')
    .insert({
      document_id: documentId,
      content,
      position_start: positionStart,
      position_end: positionEnd,
      highlighted_text: highlightedText,
      parent_comment_id: parentCommentId,
      user_id: (await supabase.auth.getUser()).data.user?.id
    })
    .select('*')
    .single();

  if (error) throw error;

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', data.user_id)
    .single();

  return {
    ...data,
    user_profile: profile || undefined
  } as DocumentComment;
};

export const updateComment = async (commentId: string, content: string) => {
  const { data, error } = await supabase
    .from('document_comments')
    .update({ content })
    .eq('id', commentId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const resolveComment = async (commentId: string, isResolved: boolean) => {
  const { data, error } = await supabase
    .from('document_comments')
    .update({ is_resolved: isResolved })
    .eq('id', commentId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteComment = async (commentId: string) => {
  const { error } = await supabase
    .from('document_comments')
    .delete()
    .eq('id', commentId);

  if (error) throw error;
};

// Document changes tracking
export const getDocumentChanges = async (documentId: string) => {
  const { data, error } = await supabase
    .from('document_changes')
    .select('*')
    .eq('document_id', documentId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Get user profiles
  const changesWithProfiles = await Promise.all(
    (data || []).map(async (change) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', change.user_id)
        .single();

      return {
        ...change,
        user_profile: profile || undefined
      };
    })
  );

  return changesWithProfiles as DocumentChange[];
};

export const trackDocumentChange = async (
  documentId: string,
  changeType: 'insert' | 'delete' | 'format',
  changeData: any,
  position?: number,
  contentBefore?: string,
  contentAfter?: string
) => {
  const { data, error } = await supabase
    .from('document_changes')
    .insert({
      document_id: documentId,
      change_type: changeType,
      change_data: changeData,
      position,
      content_before: contentBefore,
      content_after: contentAfter,
      user_id: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Permission checking
export const getUserDocumentPermission = async (documentId: string) => {
  const { data, error } = await supabase.rpc('get_user_document_permission', {
    p_document_id: documentId
  });

  if (error) throw error;
  return data as 'owner' | 'edit' | 'comment' | 'view' | 'none';
};

// Copy document to workspace
export const copyDocumentToWorkspace = async (documentId: string) => {
  const { data, error } = await supabase.rpc('copy_document_to_workspace', {
    p_document_id: documentId
  });

  if (error) throw error;
  return data; // Returns the new document ID
};

// Folder sharing functions
export const shareFolderWithUser = async (folderId: string, userEmail: string, permissionLevel: 'view' | 'comment' | 'edit') => {
  // First get the user ID from email
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userEmail)
    .single();

  if (userError) throw userError;

  const { data, error } = await supabase
    .from('folder_shares')
    .insert({
      folder_id: folderId,
      shared_with: userData.id,
      permission_level: permissionLevel,
      shared_by: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getFolderShares = async (folderId: string) => {
  const { data, error } = await supabase
    .from('folder_shares')
    .select('*')
    .eq('folder_id', folderId);

  if (error) throw error;

  // Get user profiles separately
  const sharesWithProfiles = await Promise.all(
    (data || []).map(async (share) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', share.shared_with)
        .single();

      return {
        ...share,
        shared_with_profile: profile || undefined
      };
    })
  );

  return sharesWithProfiles as FolderShare[];
};