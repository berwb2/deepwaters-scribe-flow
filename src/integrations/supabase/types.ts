export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          client_id: string | null
          created_at: string
          details: Json | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          client_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          client_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string
          id: string
          last_login: string | null
          role: string | null
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_login?: string | null
          role?: string | null
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          last_login?: string | null
          role?: string | null
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      ai_sessions: {
        Row: {
          assistant_identifier: string | null
          chapter_id: string | null
          chat_history: Json | null
          context_summary: string | null
          created_at: string | null
          document_id: string | null
          id: string
          is_active: boolean | null
          session_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assistant_identifier?: string | null
          chapter_id?: string | null
          chat_history?: Json | null
          context_summary?: string | null
          created_at?: string | null
          document_id?: string | null
          id?: string
          is_active?: boolean | null
          session_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assistant_identifier?: string | null
          chapter_id?: string | null
          chat_history?: Json | null
          context_summary?: string | null
          created_at?: string | null
          document_id?: string | null
          id?: string
          is_active?: boolean | null
          session_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_sessions_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_sessions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          genre: string | null
          id: string
          metadata: Json | null
          status: string | null
          target_word_count: number | null
          title: string
          updated_at: string | null
          user_id: string
          word_count: number | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          genre?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          target_word_count?: number | null
          title: string
          updated_at?: string | null
          user_id: string
          word_count?: number | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          genre?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          target_word_count?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
          word_count?: number | null
        }
        Relationships: []
      }
      chapters: {
        Row: {
          ai_analysis: Json | null
          book_id: string
          chapter_number: number
          content: string | null
          created_at: string | null
          id: string
          notes: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
          word_count: number | null
        }
        Insert: {
          ai_analysis?: Json | null
          book_id: string
          chapter_number: number
          content?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          word_count?: number | null
        }
        Update: {
          ai_analysis?: Json | null
          book_id?: string
          chapter_number?: number
          content?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chapters_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      client_profiles: {
        Row: {
          admin_notes: string | null
          budget_range: string | null
          company_name: string
          contact_person: string
          created_at: string
          current_stage: string | null
          email: string
          id: string
          industry: string
          phone: string | null
          project_type: string | null
          timeline_requirements: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          budget_range?: string | null
          company_name: string
          contact_person: string
          created_at?: string
          current_stage?: string | null
          email: string
          id?: string
          industry: string
          phone?: string | null
          project_type?: string | null
          timeline_requirements?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          budget_range?: string | null
          company_name?: string
          contact_person?: string
          created_at?: string
          current_stage?: string | null
          email?: string
          id?: string
          industry?: string
          phone?: string | null
          project_type?: string | null
          timeline_requirements?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      client_responses: {
        Row: {
          client_id: string
          created_at: string
          id: string
          question_category: string
          question_text: string
          response_text: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          question_category: string
          question_text: string
          response_text?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          question_category?: string
          question_text?: string
          response_text?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_responses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_documents: {
        Row: {
          added_at: string
          collection_id: string
          document_id: string
        }
        Insert: {
          added_at?: string
          collection_id: string
          document_id: string
        }
        Update: {
          added_at?: string
          collection_id?: string
          document_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_documents_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "document_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_documents_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      document_folders: {
        Row: {
          category: string | null
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          parent_id: string | null
          priority: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
          priority?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          priority?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "document_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      document_tags: {
        Row: {
          document_id: string
          id: string
          tag_name: string
        }
        Insert: {
          document_id: string
          id?: string
          tag_name: string
        }
        Update: {
          document_id?: string
          id?: string
          tag_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_tags_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          content: string
          created_at: string
          document_id: string
          id: string
          version_number: number
        }
        Insert: {
          content: string
          created_at?: string
          document_id: string
          id?: string
          version_number: number
        }
        Update: {
          content?: string
          created_at?: string
          document_id?: string
          id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          ai_analysis: Json | null
          content: string
          content_type: string
          created_at: string
          document_type: string | null
          id: string
          is_deleted: boolean | null
          is_template: boolean | null
          metadata: Json | null
          parent_id: string | null
          search_vector: unknown | null
          title: string
          updated_at: string
          user_id: string
          word_count: number | null
          workspace_id: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          content: string
          content_type: string
          created_at?: string
          document_type?: string | null
          id?: string
          is_deleted?: boolean | null
          is_template?: boolean | null
          metadata?: Json | null
          parent_id?: string | null
          search_vector?: unknown | null
          title: string
          updated_at?: string
          user_id: string
          word_count?: number | null
          workspace_id?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          content?: string
          content_type?: string
          created_at?: string
          document_type?: string | null
          id?: string
          is_deleted?: boolean | null
          is_template?: boolean | null
          metadata?: Json | null
          parent_id?: string | null
          search_vector?: unknown | null
          title?: string
          updated_at?: string
          user_id?: string
          word_count?: number | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      file_attachments: {
        Row: {
          created_at: string | null
          document_id: string | null
          extracted_text: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          processed: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          document_id?: string | null
          extracted_text?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          processed?: boolean | null
          user_id?: string
        }
        Update: {
          created_at?: string | null
          document_id?: string | null
          extracted_text?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          processed?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_attachments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      file_uploads: {
        Row: {
          client_id: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          is_active: boolean | null
          question_id: string | null
          upload_timestamp: string
        }
        Insert: {
          client_id: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          is_active?: boolean | null
          question_id?: string | null
          upload_timestamp?: string
        }
        Update: {
          client_id?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          is_active?: boolean | null
          question_id?: string | null
          upload_timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_uploads_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_uploads_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "client_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      folder_documents: {
        Row: {
          added_at: string
          document_id: string
          folder_id: string
        }
        Insert: {
          added_at?: string
          document_id: string
          folder_id: string
        }
        Update: {
          added_at?: string
          document_id?: string
          folder_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "folder_documents_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folder_documents_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "document_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          settings: Json | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          settings?: Json | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          settings?: Json | null
        }
        Relationships: []
      }
      project_stages: {
        Row: {
          client_id: string
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          stage_name: string
          status: string | null
        }
        Insert: {
          client_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          stage_name: string
          status?: string | null
        }
        Update: {
          client_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          stage_name?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_stages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          owner_id: string
          settings: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          owner_id?: string
          settings?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          settings?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_document: {
        Args: {
          p_title: string
          p_content: string
          p_content_type: string
          p_is_template?: boolean
          p_metadata?: Json
        }
        Returns: string
      }
      get_document_versions: {
        Args: { p_document_id: string }
        Returns: {
          id: string
          content: string
          created_at: string
          version_number: number
        }[]
      }
      update_document: {
        Args: {
          p_document_id: string
          p_title?: string
          p_content?: string
          p_content_type?: string
          p_is_template?: boolean
          p_metadata?: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
