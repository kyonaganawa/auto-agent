-- Notes Table
-- Personal notes with processing status

CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Note content
  title TEXT,
  content TEXT NOT NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'unprocessed' CHECK (status IN ('unprocessed', 'processed')),

  -- Metadata
  tags TEXT[], -- Array of tags for categorization
  metadata JSONB, -- Additional custom data

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE -- When note was marked as processed
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_notes_status ON notes(status);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING GIN(tags);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();

  -- Set processed_at when status changes to processed
  IF NEW.status = 'processed' AND OLD.status != 'processed' THEN
    NEW.processed_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_notes_updated_at();

-- Comments
COMMENT ON TABLE notes IS 'Personal notes with processing status tracking';
COMMENT ON COLUMN notes.status IS 'Processing status: unprocessed, processed';
COMMENT ON COLUMN notes.tags IS 'Array of tags for categorization and filtering';
COMMENT ON COLUMN notes.processed_at IS 'Timestamp when note was marked as processed';
