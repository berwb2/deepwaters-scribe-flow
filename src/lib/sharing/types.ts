/**
 * Type definitions for the sharing system
 * Centralized types for better maintainability and type safety
 */

export type PermissionLevel = 'view' | 'comment' | 'edit';
export type UserPermission = 'owner' | 'edit' | 'comment' | 'view' | 'none';
export type ChangeType = 'insert' | 'delete' | 'format';

export interface UserProfile {
  display_name?: string;
  avatar_url?: string;
}

export interface DocumentShare {
  id: string;
  document_id: string;
  shared_by: string;
  shared_with: string;
  permission_level: PermissionLevel;
  created_at: string;
  shared_with_profile?: UserProfile;
}

export interface FolderShare {
  id: string;
  folder_id: string;
  shared_by: string;
  shared_with: string;
  permission_level: PermissionLevel;
  created_at: string;
  shared_with_profile?: UserProfile;
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
  user_profile?: UserProfile;
  replies?: DocumentComment[];
}

export interface DocumentChange {
  id: string;
  document_id: string;
  user_id: string;
  change_type: ChangeType;
  change_data: any;
  position?: number;
  content_before?: string;
  content_after?: string;
  created_at: string;
  user_profile?: UserProfile;
}

export interface ShareInvitation {
  email: string;
  permission_level: PermissionLevel;
}

export interface BulkShareResult {
  success: DocumentShare[];
  failed: Array<{ email: string; error: string }>;
}

export interface ActivityNotification {
  id: string;
  user_id: string;
  type: 'share' | 'comment' | 'change' | 'mention';
  message: string;
  data: any;
  read: boolean;
  created_at: string;
}

export interface ShareOptions {
  notify?: boolean;
  message?: string;
  expires_at?: string;
}

export interface CommentFilter {
  resolved?: boolean;
  user_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface ChangeFilter {
  change_type?: ChangeType;
  user_id?: string;
  date_from?: string;
  date_to?: string;
}