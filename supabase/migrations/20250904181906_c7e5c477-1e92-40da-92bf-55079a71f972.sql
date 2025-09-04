-- Add sharing functionality to documents table
ALTER TABLE documents ADD COLUMN is_public BOOLEAN DEFAULT FALSE;
ALTER TABLE documents ADD COLUMN share_token UUID DEFAULT gen_random_uuid();
ALTER TABLE documents ADD COLUMN shared_at TIMESTAMP WITH TIME ZONE;

-- Create index for efficient lookups by share token
CREATE INDEX idx_documents_share_token ON documents(share_token) WHERE is_public = TRUE;

-- Update RLS policy to allow public viewing of shared documents
CREATE POLICY "Anyone can view public documents via share token"
ON documents
FOR SELECT
USING (is_public = TRUE);

-- Function to toggle document sharing
CREATE OR REPLACE FUNCTION toggle_document_sharing(
  doc_id UUID,
  make_public BOOLEAN DEFAULT TRUE
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  doc_record documents%ROWTYPE;
  result JSON;
BEGIN
  -- Check if user owns the document
  SELECT * INTO doc_record
  FROM documents
  WHERE id = doc_id AND user_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Document not found or access denied';
  END IF;
  
  -- Update sharing status
  IF make_public THEN
    UPDATE documents 
    SET is_public = TRUE, 
        shared_at = NOW(),
        share_token = COALESCE(share_token, gen_random_uuid())
    WHERE id = doc_id
    RETURNING * INTO doc_record;
  ELSE
    UPDATE documents 
    SET is_public = FALSE,
        shared_at = NULL
    WHERE id = doc_id
    RETURNING * INTO doc_record;
  END IF;
  
  -- Return the updated document info
  result := json_build_object(
    'id', doc_record.id,
    'is_public', doc_record.is_public,
    'share_token', doc_record.share_token,
    'shared_at', doc_record.shared_at
  );
  
  RETURN result;
END;
$$;