
-- BOOKS TABLE with proper structure
CREATE TABLE IF NOT EXISTS books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    genre VARCHAR(100),
    status VARCHAR(50) DEFAULT 'draft',
    word_count INTEGER DEFAULT 0,
    target_word_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- CHAPTERS TABLE for book chapters
CREATE TABLE IF NOT EXISTS chapters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    chapter_number INTEGER NOT NULL,
    word_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft',
    notes TEXT,
    ai_analysis JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to existing documents table if they don't exist
ALTER TABLE documents ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS ai_analysis JSONB DEFAULT '{}';

-- AI SESSIONS TABLE for Grand Strategist integration
CREATE TABLE IF NOT EXISTS ai_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    document_id UUID REFERENCES documents(id),
    chapter_id UUID REFERENCES chapters(id),
    session_type VARCHAR(50) NOT NULL,
    chat_history JSONB DEFAULT '[]',
    context_summary TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_chapters_book_id ON chapters(book_id);
CREATE INDEX IF NOT EXISTS idx_chapters_user_id ON chapters(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_user_id ON ai_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_document_id ON ai_sessions(document_id);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_chapter_id ON ai_sessions(chapter_id);

-- ROW LEVEL SECURITY
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY "Users can access their own books" ON books FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own chapters" ON chapters FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own AI sessions" ON ai_sessions FOR ALL USING (auth.uid() = user_id);

-- FUNCTION FOR WORD COUNT UPDATES
CREATE OR REPLACE FUNCTION update_word_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update word count when content changes
    IF TG_TABLE_NAME = 'chapters' THEN
        NEW.word_count = COALESCE(array_length(string_to_array(REGEXP_REPLACE(NEW.content, '<[^>]*>', '', 'g'), ' '), 1), 0);
        
        -- Update book word count
        UPDATE books SET 
            word_count = COALESCE((SELECT SUM(word_count) FROM chapters WHERE book_id = NEW.book_id), 0),
            updated_at = NOW()
        WHERE id = NEW.book_id;
    ELSIF TG_TABLE_NAME = 'documents' THEN
        NEW.word_count = COALESCE(array_length(string_to_array(REGEXP_REPLACE(NEW.content, '<[^>]*>', '', 'g'), ' '), 1), 0);
    END IF;
    
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS
DROP TRIGGER IF EXISTS update_chapter_word_count ON chapters;
CREATE TRIGGER update_chapter_word_count BEFORE INSERT OR UPDATE ON chapters FOR EACH ROW EXECUTE FUNCTION update_word_count();

DROP TRIGGER IF EXISTS update_document_word_count ON documents;
CREATE TRIGGER update_document_word_count BEFORE INSERT OR UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_word_count();
