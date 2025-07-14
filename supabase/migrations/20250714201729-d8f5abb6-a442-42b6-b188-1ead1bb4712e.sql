-- Add document analytics and template system
CREATE TABLE IF NOT EXISTS document_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('view', 'edit', 'share', 'export', 'ai_query')),
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  duration_seconds INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add document templates table
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  template_data JSONB NOT NULL DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add smart collections table
CREATE TABLE IF NOT EXISTS smart_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  filter_rules JSONB NOT NULL DEFAULT '{}',
  auto_update BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add saved searches table
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  search_query TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE document_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for document_analytics
CREATE POLICY "Users can insert their own analytics" ON document_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own analytics" ON document_analytics
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for document_templates
CREATE POLICY "Users can manage their own templates" ON document_templates
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public templates" ON document_templates
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

-- RLS Policies for smart_collections
CREATE POLICY "Users can manage their own smart collections" ON smart_collections
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for saved_searches
CREATE POLICY "Users can manage their own saved searches" ON saved_searches
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_analytics_user_id ON document_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_document_analytics_document_id ON document_analytics(document_id);
CREATE INDEX IF NOT EXISTS idx_document_analytics_action_type ON document_analytics(action_type);
CREATE INDEX IF NOT EXISTS idx_document_analytics_created_at ON document_analytics(created_at);

CREATE INDEX IF NOT EXISTS idx_document_templates_user_id ON document_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_document_templates_category ON document_templates(category);
CREATE INDEX IF NOT EXISTS idx_document_templates_is_public ON document_templates(is_public);

-- Update triggers
CREATE TRIGGER update_document_templates_updated_at
  BEFORE UPDATE ON document_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_smart_collections_updated_at
  BEFORE UPDATE ON smart_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to track document analytics
CREATE OR REPLACE FUNCTION track_document_analytics(
  p_document_id UUID,
  p_action_type TEXT,
  p_session_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  analytics_id UUID;
BEGIN
  INSERT INTO document_analytics (
    user_id,
    document_id,
    action_type,
    session_id,
    metadata
  ) VALUES (
    auth.uid(),
    p_document_id,
    p_action_type,
    p_session_id,
    p_metadata
  ) RETURNING id INTO analytics_id;
  
  RETURN analytics_id;
END;
$$;