-- Add missing RLS policies for document_versions table to allow users to create versions of their own documents

-- Policy to allow users to insert document versions for their own documents
CREATE POLICY "Users can create versions of their own documents" 
ON public.document_versions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.documents 
    WHERE documents.id = document_versions.document_id 
    AND documents.user_id = auth.uid()
  )
);

-- Policy to allow users to update versions of their own documents (if needed)
CREATE POLICY "Users can update versions of their own documents" 
ON public.document_versions 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.documents 
    WHERE documents.id = document_versions.document_id 
    AND documents.user_id = auth.uid()
  )
);

-- Policy to allow users to delete versions of their own documents (if needed)
CREATE POLICY "Users can delete versions of their own documents" 
ON public.document_versions 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.documents 
    WHERE documents.id = document_versions.document_id 
    AND documents.user_id = auth.uid()
  )
);