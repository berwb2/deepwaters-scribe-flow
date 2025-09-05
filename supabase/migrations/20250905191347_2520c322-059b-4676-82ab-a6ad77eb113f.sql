-- Create document sharing with specific users table
CREATE TABLE public.document_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_level TEXT NOT NULL DEFAULT 'view', -- 'view', 'comment', 'edit'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(document_id, shared_with)
);

-- Create folder sharing table
CREATE TABLE public.folder_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  folder_id UUID NOT NULL REFERENCES document_folders(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_level TEXT NOT NULL DEFAULT 'view', -- 'view', 'comment', 'edit'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(folder_id, shared_with)
);

-- Create comments table for documents
CREATE TABLE public.document_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  position_start INTEGER,
  position_end INTEGER,
  highlighted_text TEXT,
  parent_comment_id UUID REFERENCES document_comments(id) ON DELETE CASCADE,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create change tracking table
CREATE TABLE public.document_changes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL, -- 'insert', 'delete', 'format'
  change_data JSONB NOT NULL DEFAULT '{}',
  position INTEGER,
  content_before TEXT,
  content_after TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.document_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folder_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_changes ENABLE ROW LEVEL SECURITY;

-- RLS policies for document_shares
CREATE POLICY "Users can view document shares they're involved in" ON document_shares
FOR SELECT USING (
  shared_by = auth.uid() OR 
  shared_with = auth.uid() OR
  EXISTS (SELECT 1 FROM documents WHERE documents.id = document_shares.document_id AND documents.user_id = auth.uid())
);

CREATE POLICY "Document owners can create shares" ON document_shares
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM documents WHERE documents.id = document_shares.document_id AND documents.user_id = auth.uid())
);

CREATE POLICY "Document owners can update shares" ON document_shares
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM documents WHERE documents.id = document_shares.document_id AND documents.user_id = auth.uid())
);

CREATE POLICY "Document owners can delete shares" ON document_shares
FOR DELETE USING (
  EXISTS (SELECT 1 FROM documents WHERE documents.id = document_shares.document_id AND documents.user_id = auth.uid())
);

-- RLS policies for folder_shares
CREATE POLICY "Users can view folder shares they're involved in" ON folder_shares
FOR SELECT USING (
  shared_by = auth.uid() OR 
  shared_with = auth.uid() OR
  EXISTS (SELECT 1 FROM document_folders WHERE document_folders.id = folder_shares.folder_id AND document_folders.user_id = auth.uid())
);

CREATE POLICY "Folder owners can create shares" ON folder_shares
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM document_folders WHERE document_folders.id = folder_shares.folder_id AND document_folders.user_id = auth.uid())
);

CREATE POLICY "Folder owners can update shares" ON folder_shares
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM document_folders WHERE document_folders.id = folder_shares.folder_id AND document_folders.user_id = auth.uid())
);

CREATE POLICY "Folder owners can delete shares" ON folder_shares
FOR DELETE USING (
  EXISTS (SELECT 1 FROM document_folders WHERE document_folders.id = folder_shares.folder_id AND document_folders.user_id = auth.uid())
);

-- RLS policies for document_comments
CREATE POLICY "Users can view comments on accessible documents" ON document_comments
FOR SELECT USING (
  -- Document owner
  EXISTS (SELECT 1 FROM documents WHERE documents.id = document_comments.document_id AND documents.user_id = auth.uid())
  OR
  -- Shared with user
  EXISTS (SELECT 1 FROM document_shares WHERE document_shares.document_id = document_comments.document_id AND document_shares.shared_with = auth.uid())
  OR
  -- Public document
  EXISTS (SELECT 1 FROM documents WHERE documents.id = document_comments.document_id AND documents.is_public = true)
);

CREATE POLICY "Users can create comments on accessible documents" ON document_comments
FOR INSERT WITH CHECK (
  -- Document owner
  EXISTS (SELECT 1 FROM documents WHERE documents.id = document_comments.document_id AND documents.user_id = auth.uid())
  OR
  -- Shared with comment or edit permission
  EXISTS (SELECT 1 FROM document_shares WHERE document_shares.document_id = document_comments.document_id AND document_shares.shared_with = auth.uid() AND document_shares.permission_level IN ('comment', 'edit'))
  OR
  -- Public document (anyone can comment)
  EXISTS (SELECT 1 FROM documents WHERE documents.id = document_comments.document_id AND documents.is_public = true)
);

CREATE POLICY "Users can update their own comments" ON document_comments
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments or document owners can delete any comment" ON document_comments
FOR DELETE USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM documents WHERE documents.id = document_comments.document_id AND documents.user_id = auth.uid())
);

-- RLS policies for document_changes
CREATE POLICY "Users can view changes on accessible documents" ON document_changes
FOR SELECT USING (
  -- Document owner
  EXISTS (SELECT 1 FROM documents WHERE documents.id = document_changes.document_id AND documents.user_id = auth.uid())
  OR
  -- Shared with user
  EXISTS (SELECT 1 FROM document_shares WHERE document_shares.document_id = document_changes.document_id AND document_shares.shared_with = auth.uid())
);

CREATE POLICY "Users can create changes on editable documents" ON document_changes
FOR INSERT WITH CHECK (
  user_id = auth.uid() AND (
    -- Document owner
    EXISTS (SELECT 1 FROM documents WHERE documents.id = document_changes.document_id AND documents.user_id = auth.uid())
    OR
    -- Shared with edit permission
    EXISTS (SELECT 1 FROM document_shares WHERE document_shares.document_id = document_changes.document_id AND document_shares.shared_with = auth.uid() AND document_shares.permission_level = 'edit')
  )
);

-- Add updated_at trigger for comments
CREATE TRIGGER update_document_comments_updated_at
BEFORE UPDATE ON public.document_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check user document permissions
CREATE OR REPLACE FUNCTION public.get_user_document_permission(p_document_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  permission TEXT := 'none';
BEGIN
  -- Check if user is document owner
  IF EXISTS (SELECT 1 FROM documents WHERE id = p_document_id AND user_id = p_user_id) THEN
    RETURN 'owner';
  END IF;
  
  -- Check if document is shared with user
  SELECT permission_level INTO permission
  FROM document_shares 
  WHERE document_id = p_document_id AND shared_with = p_user_id;
  
  -- Check if document is public
  IF permission IS NULL AND EXISTS (SELECT 1 FROM documents WHERE id = p_document_id AND is_public = true) THEN
    permission := 'view';
  END IF;
  
  RETURN COALESCE(permission, 'none');
END;
$$;

-- Function to duplicate document to user's workspace
CREATE OR REPLACE FUNCTION public.copy_document_to_workspace(p_document_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_document_id UUID;
  original_doc documents%ROWTYPE;
BEGIN
  -- Check if user has access to the document
  IF public.get_user_document_permission(p_document_id, auth.uid()) = 'none' THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  -- Get original document
  SELECT * INTO original_doc FROM documents WHERE id = p_document_id;
  
  -- Create new document in user's workspace
  INSERT INTO documents (
    user_id,
    title,
    content,
    content_type,
    is_template,
    metadata
  ) VALUES (
    auth.uid(),
    'Copy of ' || original_doc.title,
    original_doc.content,
    original_doc.content_type,
    original_doc.is_template,
    original_doc.metadata
  ) RETURNING id INTO new_document_id;
  
  RETURN new_document_id;
END;
$$;