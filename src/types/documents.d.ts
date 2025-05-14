
import { Json } from "@/integrations/supabase/types";

// Define the document type for the application
export type DocType = 'plan' | 'doctrine' | 'reflection' | string;

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
  created_at: string;
  user_id: string;
  document_count?: number;
}
