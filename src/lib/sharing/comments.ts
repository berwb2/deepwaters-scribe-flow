/**
 * Document comments functionality
 * Enhanced commenting system with threading, mentions, and real-time support
 */

import { supabase } from '@/integrations/supabase/client';
import { DocumentComment, CommentFilter } from './types';
import { 
  handleDatabaseError, 
  getCurrentUserId, 
  batchFetchUserProfiles,
  withRetry
} from './utils';
import { validateDocumentAction } from './permissions';

/**
 * Gets all comments for a document with optimized queries
 */
export const getDocumentComments = async (
  documentId: string,
  filter: CommentFilter = {}
): Promise<DocumentComment[]> => {
  try {
    // Build query with filters
    let query = supabase
      .from('document_comments')
      .select('*')
      .eq('document_id', documentId)
      .is('parent_comment_id', null);
    
    // Apply filters
    if (filter.resolved !== undefined) {
      query = query.eq('is_resolved', filter.resolved);
    }
    
    if (filter.user_id) {
      query = query.eq('user_id', filter.user_id);
    }
    
    if (filter.date_from) {
      query = query.gte('created_at', filter.date_from);
    }
    
    if (filter.date_to) {
      query = query.lte('created_at', filter.date_to);
    }
    
    const { data: comments, error } = await query.order('created_at', { ascending: true });

    if (error) {
      handleDatabaseError(error);
    }

    if (!comments || comments.length === 0) {
      return [];
    }

    // Get all user IDs for batch profile fetching
    const userIds = new Set<string>();
    comments.forEach(comment => userIds.add(comment.user_id));

    // Get replies for all comments
    const { data: repliesData, error: repliesError } = await supabase
      .from('document_comments')
      .select('*')
      .in('parent_comment_id', comments.map(c => c.id))
      .order('created_at', { ascending: true });

    if (repliesError) {
      handleDatabaseError(repliesError);
    }

    // Add reply user IDs to the set
    repliesData?.forEach(reply => userIds.add(reply.user_id));

    // Batch fetch all user profiles
    const profileMap = await batchFetchUserProfiles(Array.from(userIds));

    // Group replies by parent comment ID
    const repliesByParent = new Map<string, DocumentComment[]>();
    repliesData?.forEach(reply => {
      const parentId = reply.parent_comment_id!;
      if (!repliesByParent.has(parentId)) {
        repliesByParent.set(parentId, []);
      }
      
      const replyWithProfile: DocumentComment = {
        ...reply,
        user_profile: profileMap.get(reply.user_id),
        replies: [] // Replies don't have nested replies for now
      };
      
      repliesByParent.get(parentId)!.push(replyWithProfile);
    });

    // Combine comments with their replies and profiles
    const commentsWithReplies: DocumentComment[] = comments.map(comment => ({
      ...comment,
      user_profile: profileMap.get(comment.user_id),
      replies: repliesByParent.get(comment.id) || []
    }));

    return commentsWithReplies;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Creates a new comment or reply with enhanced validation
 */
export const createComment = async (
  documentId: string,
  content: string,
  positionStart?: number,
  positionEnd?: number,
  highlightedText?: string,
  parentCommentId?: string
): Promise<DocumentComment> => {
  // Validation
  if (!content.trim()) {
    throw new Error('Comment content cannot be empty');
  }
  
  if (content.length > 10000) {
    throw new Error('Comment is too long (max 10,000 characters)');
  }
  
  // Check permission
  const canComment = await validateDocumentAction(documentId, 'comment');
  if (!canComment) {
    throw new Error('You do not have permission to comment on this document');
  }
  
  try {
    const currentUserId = await getCurrentUserId();
    
    // If replying, validate parent comment exists
    if (parentCommentId) {
      const { data: parentComment, error: parentError } = await supabase
        .from('document_comments')
        .select('id, document_id')
        .eq('id', parentCommentId)
        .eq('document_id', documentId)
        .single();
      
      if (parentError) {
        throw new Error('Parent comment not found');
      }
    }
    
    const { data, error } = await supabase
      .from('document_comments')
      .insert({
        document_id: documentId,
        content: content.trim(),
        position_start: positionStart,
        position_end: positionEnd,
        highlighted_text: highlightedText,
        parent_comment_id: parentCommentId,
        user_id: currentUserId
      })
      .select('*')
      .single();

    if (error) {
      handleDatabaseError(error);
    }

    // Fetch user profile
    const profileMap = await batchFetchUserProfiles([data.user_id]);
    const profile = profileMap.get(data.user_id);

    const result: DocumentComment = {
      ...data,
      user_profile: profile,
      replies: []
    };

    // TODO: Handle mentions and notifications
    // extractMentions(content) and send notifications

    return result;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Updates an existing comment
 */
export const updateComment = async (
  commentId: string,
  content: string
): Promise<DocumentComment> => {
  if (!content.trim()) {
    throw new Error('Comment content cannot be empty');
  }
  
  if (content.length > 10000) {
    throw new Error('Comment is too long (max 10,000 characters)');
  }
  
  try {
    const currentUserId = await getCurrentUserId();
    
    // Check ownership
    const { data: existingComment, error: checkError } = await supabase
      .from('document_comments')
      .select('user_id, document_id')
      .eq('id', commentId)
      .single();
    
    if (checkError) {
      handleDatabaseError(checkError);
    }
    
    if (existingComment.user_id !== currentUserId) {
      throw new Error('You can only edit your own comments');
    }
    
    const { data, error } = await supabase
      .from('document_comments')
      .update({ 
        content: content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .select('*')
      .single();

    if (error) {
      handleDatabaseError(error);
    }

    // Fetch user profile
    const profileMap = await batchFetchUserProfiles([data.user_id]);
    const profile = profileMap.get(data.user_id);

    return {
      ...data,
      user_profile: profile,
      replies: [] // Will be populated by getDocumentComments if needed
    };
  } catch (error: any) {
    throw error;
  }
};

/**
 * Resolves or reopens a comment
 */
export const resolveComment = async (
  commentId: string,
  isResolved: boolean
): Promise<DocumentComment> => {
  try {
    const currentUserId = await getCurrentUserId();
    
    // Check if user can resolve (comment author or document owner)
    const { data: comment, error: commentError } = await supabase
      .from('document_comments')
      .select('user_id, document_id')
      .eq('id', commentId)
      .single();
    
    if (commentError) {
      handleDatabaseError(commentError);
    }
    
    const isCommentAuthor = comment.user_id === currentUserId;
    const canEdit = await validateDocumentAction(comment.document_id, 'edit');
    
    if (!isCommentAuthor && !canEdit) {
      throw new Error('You can only resolve your own comments or comments on documents you own');
    }
    
    const { data, error } = await supabase
      .from('document_comments')
      .update({ 
        is_resolved: isResolved,
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .select('*')
      .single();

    if (error) {
      handleDatabaseError(error);
    }

    // Fetch user profile
    const profileMap = await batchFetchUserProfiles([data.user_id]);
    const profile = profileMap.get(data.user_id);

    return {
      ...data,
      user_profile: profile,
      replies: []
    };
  } catch (error: any) {
    throw error;
  }
};

/**
 * Deletes a comment and all its replies
 */
export const deleteComment = async (commentId: string): Promise<void> => {
  try {
    const currentUserId = await getCurrentUserId();
    
    // Check ownership or document permission
    const { data: comment, error: commentError } = await supabase
      .from('document_comments')
      .select('user_id, document_id')
      .eq('id', commentId)
      .single();
    
    if (commentError) {
      handleDatabaseError(commentError);
    }
    
    const isCommentAuthor = comment.user_id === currentUserId;
    const canEdit = await validateDocumentAction(comment.document_id, 'edit');
    
    if (!isCommentAuthor && !canEdit) {
      throw new Error('You can only delete your own comments or comments on documents you own');
    }
    
    // Delete the comment (cascading will handle replies if set up in DB)
    const { error } = await supabase
      .from('document_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      handleDatabaseError(error);
    }
  } catch (error: any) {
    throw error;
  }
};

/**
 * Gets comment statistics for a document
 */
export const getCommentStats = async (documentId: string) => {
  try {
    const { data, error } = await supabase
      .from('document_comments')
      .select('is_resolved, parent_comment_id')
      .eq('document_id', documentId);
    
    if (error) {
      handleDatabaseError(error);
    }
    
    const comments = data || [];
    const topLevelComments = comments.filter(c => !c.parent_comment_id);
    const replies = comments.filter(c => c.parent_comment_id);
    
    return {
      total_comments: topLevelComments.length,
      total_replies: replies.length,
      resolved_comments: topLevelComments.filter(c => c.is_resolved).length,
      unresolved_comments: topLevelComments.filter(c => !c.is_resolved).length
    };
  } catch (error: any) {
    throw error;
  }
};

/**
 * Bulk resolve/unresolve comments
 */
export const bulkResolveComments = async (
  commentIds: string[],
  isResolved: boolean
): Promise<{ success: string[], failed: string[] }> => {
  const results = {
    success: [] as string[],
    failed: [] as string[]
  };
  
  for (const commentId of commentIds) {
    try {
      await resolveComment(commentId, isResolved);
      results.success.push(commentId);
    } catch (error) {
      console.error(`Failed to resolve comment ${commentId}:`, error);
      results.failed.push(commentId);
    }
  }
  
  return results;
};

/**
 * Search comments within a document
 */
export const searchDocumentComments = async (
  documentId: string,
  searchTerm: string,
  filter: CommentFilter = {}
): Promise<DocumentComment[]> => {
  try {
    let query = supabase
      .from('document_comments')
      .select('*')
      .eq('document_id', documentId)
      .ilike('content', `%${searchTerm}%`);
    
    // Apply filters
    if (filter.resolved !== undefined) {
      query = query.eq('is_resolved', filter.resolved);
    }
    
    if (filter.user_id) {
      query = query.eq('user_id', filter.user_id);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      handleDatabaseError(error);
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Fetch user profiles
    const userIds = data.map(comment => comment.user_id);
    const profileMap = await batchFetchUserProfiles(userIds);
    
    return data.map(comment => ({
      ...comment,
      user_profile: profileMap.get(comment.user_id),
      replies: [] // Search results don't include nested replies for simplicity
    }));
  } catch (error: any) {
    throw error;
  }
};