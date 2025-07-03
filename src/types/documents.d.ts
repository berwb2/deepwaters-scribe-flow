
import { Json } from "@/integrations/supabase/types";

// Define the document type for the application
export type DocType = 'plan' | 'doctrine' | 'strategy' | 'report' | 'memo' | 'note' | 'analysis' | 'proposal' | 'framework' | 'guide' | 'manifesto' | 'markdown';

export interface DocumentMeta {
  id: string;
  title: string;
  content: string;
  content_type: DocType;
  created_at: string;
  updated_at: string;
  is_template: boolean | null;
  metadata: Json | null;
  user_id: string;
  tags: string[];
}

export interface FolderPriority {
  priority?: 'low' | 'medium' | 'high' | string | null;
}

export interface FolderMeta {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  category: string | null;
  priority: string | null;
  parent_id: string | null;
  created_at: string;
  user_id: string;
  document_count?: number;
  children?: FolderMeta[];
  depth?: number;
}

// Define folder category type
export type FolderCategory = 'personal' | 'work' | 'school' | 'project' | 'other' | string;

// Tree structure for nested folders
export interface FolderTreeNode extends FolderMeta {
  children: FolderTreeNode[];
  isExpanded?: boolean;
}

// Book management types
export interface BookMeta {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  chapter_count?: number;
  total_word_count?: number;
}

export interface ChapterMeta {
  id: string;
  book_id: string;
  title: string;
  content: string;
  chapter_number: number;
  created_at: string;
  updated_at: string;
  word_count?: number;
}
