/**
 * Utility functions for the sharing system
 * Common helpers and optimizations
 */

import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from './types';

/**
 * Enhanced error handling with user-friendly messages
 */
export class SharingError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'SharingError';
  }
}

/**
 * Maps database errors to user-friendly messages
 */
export const handleDatabaseError = (error: any): never => {
  console.error('Database error:', error);
  
  if (error.code === 'PGRST116') {
    throw new SharingError('User not found', 'USER_NOT_FOUND', error);
  }
  
  if (error.code === '23505') {
    throw new SharingError('Already shared with this user', 'DUPLICATE_SHARE', error);
  }
  
  if (error.code === 'PGRST301') {
    throw new SharingError('Access denied', 'ACCESS_DENIED', error);
  }
  
  throw new SharingError(
    error.message || 'An unexpected error occurred',
    'UNKNOWN_ERROR',
    error
  );
};

/**
 * Gets the current authenticated user ID
 */
export const getCurrentUserId = async (): Promise<string> => {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    throw new SharingError('Authentication required', 'AUTH_REQUIRED', error);
  }
  
  if (!user?.id) {
    throw new SharingError('User not authenticated', 'USER_NOT_AUTHENTICATED');
  }
  
  return user.id;
};

/**
 * Batch fetch user profiles to avoid N+1 queries
 * Uses Map for O(1) lookups
 */
export const batchFetchUserProfiles = async (
  userIds: string[]
): Promise<Map<string, UserProfile>> => {
  if (userIds.length === 0) {
    return new Map();
  }
  
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .in('id', [...new Set(userIds)]); // Remove duplicates
    
    if (error) {
      handleDatabaseError(error);
    }
    
    const profileMap = new Map<string, UserProfile>();
    profiles?.forEach(profile => {
      profileMap.set(profile.id, {
        display_name: profile.display_name,
        avatar_url: profile.avatar_url
      });
    });
    
    return profileMap;
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    return new Map(); // Return empty map to prevent crashes
  }
};

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates permission level
 */
export const isValidPermissionLevel = (level: string): boolean => {
  return ['view', 'comment', 'edit'].includes(level);
};

/**
 * Debounce function for search/filter operations
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Generates a shareable link for a document
 */
export const generateShareLink = (shareToken: string): string => {
  return `${window.location.origin}/shared/${shareToken}`;
};

/**
 * Copies text to clipboard with error handling
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError);
      return false;
    }
  }
};

/**
 * Formats relative time with better readability
 */
export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - targetDate.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return targetDate.toLocaleDateString();
};

/**
 * Retry mechanism for failed operations
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }
  
  throw lastError;
};