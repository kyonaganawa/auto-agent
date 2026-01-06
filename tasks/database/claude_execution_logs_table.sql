-- Claude Code Execution Logs Table
-- Tracks all Claude Code sessions (automated and manual)

CREATE TABLE IF NOT EXISTS claude_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Session identification
  session_id TEXT,
  execution_context TEXT, -- 'manual', 'automated', 'task_executor', etc.

  -- Timing
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,

  -- Input
  prompt TEXT NOT NULL,
  working_directory TEXT,
  initial_message TEXT,

  -- Configuration
  model TEXT DEFAULT 'claude-sonnet-4-5',
  max_turns INTEGER,
  allowed_tools TEXT[], -- Array of allowed tool names

  -- Output & Results
  turns_used INTEGER,
  exit_code INTEGER,
  success BOOLEAN,
  error_message TEXT,

  -- File modifications
  files_created TEXT[], -- Array of file paths
  files_modified TEXT[], -- Array of file paths
  files_deleted TEXT[], -- Array of file paths

  -- Git activity
  git_commits JSONB, -- Array of {message, hash, files_changed}

  -- Resource usage
  tokens_used INTEGER,
  cost_usd DECIMAL(10, 4),

  -- Execution details
  output_summary TEXT, -- First 1000 chars of output
  full_output_path TEXT, -- Path to full log file
  metadata JSONB, -- Additional custom data

  -- Related task (if executed via task system)
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_claude_logs_started_at ON claude_execution_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_claude_logs_context ON claude_execution_logs(execution_context);
CREATE INDEX IF NOT EXISTS idx_claude_logs_success ON claude_execution_logs(success);
CREATE INDEX IF NOT EXISTS idx_claude_logs_task_id ON claude_execution_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_claude_logs_session_id ON claude_execution_logs(session_id);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_claude_execution_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER claude_execution_logs_updated_at
  BEFORE UPDATE ON claude_execution_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_claude_execution_logs_updated_at();

-- Comments
COMMENT ON TABLE claude_execution_logs IS 'Logs all Claude Code execution sessions for monitoring and analysis';
COMMENT ON COLUMN claude_execution_logs.execution_context IS 'Context: manual (user-initiated), automated (cron/scheduler), task_executor, etc.';
COMMENT ON COLUMN claude_execution_logs.git_commits IS 'Array of git commit objects with message, hash, and files_changed';
COMMENT ON COLUMN claude_execution_logs.metadata IS 'Additional custom metadata (tags, categories, user notes, etc.)';
