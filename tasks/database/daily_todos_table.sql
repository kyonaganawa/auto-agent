-- Daily Todos Table
-- Simple daily checklist feature for tracking daily tasks

-- Create the daily_todos table
CREATE TABLE IF NOT EXISTS daily_todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  date DATE DEFAULT NULL,  -- NULL means unassigned/backlog
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE daily_todos IS 'Simple daily todo checklist items';
COMMENT ON COLUMN daily_todos.title IS 'The todo item text';
COMMENT ON COLUMN daily_todos.completed IS 'Whether the todo is completed';
COMMENT ON COLUMN daily_todos.date IS 'The date this todo belongs to';
COMMENT ON COLUMN daily_todos.position IS 'Order position within the day';

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_daily_todos_date ON daily_todos(date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_todos_date_position ON daily_todos(date, position);
CREATE INDEX IF NOT EXISTS idx_daily_todos_completed ON daily_todos(completed);

-- Create trigger function for updating updated_at (if not exists)
CREATE OR REPLACE FUNCTION update_daily_todos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS daily_todos_updated_at ON daily_todos;
CREATE TRIGGER daily_todos_updated_at
  BEFORE UPDATE ON daily_todos
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_todos_updated_at();

-- Enable Row Level Security (optional, can be configured later)
ALTER TABLE daily_todos ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (adjust as needed for auth)
CREATE POLICY "Allow all operations on daily_todos" ON daily_todos
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE daily_todos;
