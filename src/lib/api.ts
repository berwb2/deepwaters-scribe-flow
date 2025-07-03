
import { supabase } from "@/integrations/supabase/client";
import { DocumentMeta, FolderMeta } from "@/types/documents";

// Re-export functions from other modules for backward compatibility
export * from './documents';
export * from './folders';
export * from './books';

// Authentication Functions
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signIn = async (email: string, password?: string, rememberMe?: boolean) => {
  if (password) {
    // Email + password sign in
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    if (error) {
      console.error('Error signing in:', error);
      throw error;
    }
    return data;
  } else {
    // Magic link sign in
    const { data, error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      console.error('Error signing in:', error);
      throw error;
    }
    return data;
  }
};

export const signUp = async (email: string, password: string, displayName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName
      },
      emailRedirectTo: `${window.location.origin}/`
    }
  });
  if (error) {
    console.error('Error signing up:', error);
    throw error;
  }
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const requestPasswordReset = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });
  if (error) {
    console.error('Error requesting password reset:', error);
    throw error;
  }
  return data;
};

export const resetPassword = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });
  if (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
  return data;
};

// User Profile Functions
export const getUserProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }

  return { ...data, email: user.email };
};

export const updateUserProfile = async (updates: { display_name?: string }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }

  return data;
};

// Export aliases for backward compatibility
export const createEnhancedFolder = createFolder;
export const listEnhancedFolders = listFolders;
export const getEnhancedFolder = getFolder;
export const updateEnhancedFolder = updateFolder;
export const deleteEnhancedFolder = deleteFolder;
export const addDocumentToEnhancedFolder = addDocumentToFolder;
export const removeDocumentFromEnhancedFolder = removeDocumentFromFolder;
export const listEnhancedFolderDocuments = listFolderDocuments;

// Import the functions we need to re-export
import { 
  createFolder, listFolders, getFolder, updateFolder, deleteFolder,
  addDocumentToFolder, removeDocumentFromFolder, listFolderDocuments
} from './folders';
