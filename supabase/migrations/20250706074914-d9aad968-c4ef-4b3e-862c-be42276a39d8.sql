-- Database consolidation and enhancement for production (without conflicting storage policies)
-- Add missing columns to existing documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS document_type TEXT DEFAULT 'document';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES documents(id);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS workspace_id UUID;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;

-- Create file_attachments table for better file handling
CREATE TABLE IF NOT EXISTS file_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    extracted_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed BOOLEAN DEFAULT FALSE,
    user_id UUID NOT NULL DEFAULT auth.uid()
);

-- Create workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL DEFAULT auth.uid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    settings JSONB DEFAULT '{}'::jsonb
);

-- Enhanced search function with full-text search
CREATE OR REPLACE FUNCTION update_document_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for search vector updates
DROP TRIGGER IF EXISTS update_document_search_trigger ON documents;
CREATE TRIGGER update_document_search_trigger
    BEFORE INSERT OR UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_document_search_vector();

-- Create GIN index for search performance
CREATE INDEX IF NOT EXISTS documents_search_vector_idx ON documents USING GIN(search_vector);

-- Enable RLS on new tables
DO $$ BEGIN
    ALTER TABLE file_attachments ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- RLS policies for file_attachments
DO $$ BEGIN
    CREATE POLICY "Users can view own file attachments" ON file_attachments
        FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert file attachments" ON file_attachments
        FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update own file attachments" ON file_attachments
        FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can delete own file attachments" ON file_attachments
        FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- RLS policies for workspaces
DO $$ BEGIN
    CREATE POLICY "Users can view own workspaces" ON workspaces
        FOR SELECT USING (auth.uid() = owner_id);
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can create workspaces" ON workspaces
        FOR INSERT WITH CHECK (auth.uid() = owner_id);
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update own workspaces" ON workspaces
        FOR UPDATE USING (auth.uid() = owner_id);
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can delete own workspaces" ON workspaces
        FOR DELETE USING (auth.uid() = owner_id);
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- Create storage bucket for document files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'document-files',
    'document-files', 
    false,
    52428800,
    ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/jpg', 'text/plain', 'text/markdown']
) ON CONFLICT (id) DO NOTHING;