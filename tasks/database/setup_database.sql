-- ============================================
-- AUTO-AGENT TASK SYSTEM - COMPLETE DATABASE SETUP
-- ============================================
-- This file combines all migrations in the correct order
-- Run this file ONCE to set up your Supabase database
--
-- Usage:
--   supabase db push --file tasks/database/setup_database.sql
--
-- Or via SQL Editor:
--   Copy/paste entire contents into Supabase SQL Editor and run
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PART 1: SCHEMA.SQL (Base Tables)
-- ============================================

-- Drop existing objects if needed (for clean reinstall)
-- Uncomment if you want to reset the database
-- DROP SCHEMA IF EXISTS public CASCADE;
-- CREATE SCHEMA public;
-- GRANT ALL ON SCHEMA public TO postgres;
-- GRANT ALL ON SCHEMA public TO public;

-- Enums
CREATE TYPE task_status AS ENUM (
  'draft',
  'pending_approval',
  'needs_refinement',
  'approved',
  'in_progress',
  'completed',
  'failed',
  'cancelled',
  'blocked'
);

CREATE TYPE task_priority AS ENUM (
  'critical',  -- P0
  'high',      -- P1
  'medium',    -- P2
  'low',       -- P3
  'backlog'    -- P4
);

CREATE TYPE task_recurrence AS ENUM (
  'once',
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'custom'
);

CREATE TYPE execution_system AS ENUM (
  'autonomous_agent',
  'asset_generator',
  'professional',
  'personal',
  'projects',
  'custom'
);

CREATE TYPE creator_type AS ENUM (
  'human',
  'agent_autonomous',
  'agent_daily',
  'agent_asset',
  'system'
);

CREATE TYPE comment_type AS ENUM (
  'comment',
  'refinement',
  'approval',
  'system'
);

-- Main tasks table
CREATE TABLE tasks (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Core fields
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  prompt TEXT,

  -- System and execution
  system execution_system NOT NULL,
  custom_system VARCHAR(100),

  -- Status and workflow
  status task_status NOT NULL DEFAULT 'pending_approval',
  priority task_priority NOT NULL DEFAULT 'medium',

  -- Creator tracking
  created_by creator_type NOT NULL DEFAULT 'human',
  created_by_user_id UUID,
  created_by_agent VARCHAR(100),

  -- Recurrence
  recurrence task_recurrence NOT NULL DEFAULT 'once',
  recurrence_pattern VARCHAR(200),

  -- Scheduling
  scheduled_for TIMESTAMP WITH TIME ZONE,
  execute_after TIMESTAMP WITH TIME ZONE,
  deadline TIMESTAMP WITH TIME ZONE,

  -- Dependencies
  depends_on UUID[],
  blocks UUID[],

  -- Approval and refinement
  approved_by VARCHAR(200),
  approved_at TIMESTAMP WITH TIME ZONE,
  refinement_notes TEXT,

  -- Execution tracking
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  execution_log TEXT,

  -- Metadata
  tags TEXT[],
  metadata JSONB,

  -- Auto-approval
  auto_approve_pattern VARCHAR(200),
  is_pre_approved BOOLEAN DEFAULT FALSE,

  -- Recurrence tracking
  parent_task_id UUID REFERENCES tasks(id),
  recurrence_instance_date TIMESTAMP WITH TIME ZONE,
  next_recurrence_at TIMESTAMP WITH TIME ZONE,

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task executions (history)
CREATE TABLE task_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,

  -- Execution details
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,

  -- Result
  status task_status NOT NULL,
  exit_code INTEGER,
  error_message TEXT,

  -- Logs and output
  execution_log_path TEXT,
  output_summary TEXT,
  output_data JSONB,

  -- Resources
  tokens_used INTEGER,
  cost_usd DECIMAL(10, 4),

  -- Metadata
  executed_by VARCHAR(200),
  metadata JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task comments
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,

  -- Comment
  comment TEXT NOT NULL,
  comment_type comment_type NOT NULL DEFAULT 'comment',

  -- Author
  author_type creator_type NOT NULL,
  author_user_id UUID,
  author_agent VARCHAR(100),

  -- Metadata
  metadata JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task templates
CREATE TABLE task_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Template info
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100),

  -- Template fields
  title_template VARCHAR(200),
  description_template TEXT,
  prompt_template TEXT,
  system execution_system,
  priority task_priority DEFAULT 'medium',
  recurrence task_recurrence DEFAULT 'once',
  tags TEXT[],

  -- Auto-values
  auto_approve BOOLEAN DEFAULT FALSE,

  -- Usage tracking
  use_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,

  -- Metadata (for storing execution_type and other config)
  metadata JSONB,

  -- Audit
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-approval rules
CREATE TABLE task_approval_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Rule definition
  name VARCHAR(200) NOT NULL,
  description TEXT,

  -- Matching criteria
  title_pattern VARCHAR(200),
  system execution_system,
  creator creator_type,
  priority task_priority[],
  tags_include TEXT[],
  tags_exclude TEXT[],

  -- Auto-approval settings
  auto_approve BOOLEAN DEFAULT TRUE,
  auto_execute BOOLEAN DEFAULT FALSE,
  default_priority task_priority,

  -- Safety limits
  max_cost_usd DECIMAL(10, 4),
  require_refinement_if TEXT,

  -- Audit
  enabled BOOLEAN DEFAULT TRUE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_system ON tasks(system);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_scheduled_for ON tasks(scheduled_for);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_task_executions_task_id ON task_executions(task_id);
CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);

-- ============================================
-- PART 2: MIGRATION 001 (Execution Types)
-- ============================================

-- Create execution type enum
CREATE TYPE execution_type AS ENUM (
  'claude_session',  -- Execute via Claude Code with prompt
  'script',          -- Execute pre-created script
  'hybrid'           -- Script that calls Claude Code
);

-- Add execution_type column to tasks table
ALTER TABLE tasks
  ADD COLUMN execution_type execution_type NOT NULL DEFAULT 'claude_session',
  ADD COLUMN script_path TEXT,
  ADD COLUMN script_args JSONB,
  ADD COLUMN timeout_seconds INTEGER DEFAULT 3600;

-- Add index for script-based tasks
CREATE INDEX idx_tasks_execution_type ON tasks(execution_type);

-- Add constraint
ALTER TABLE tasks ADD CONSTRAINT check_script_path
  CHECK (
    (execution_type = 'claude_session' AND script_path IS NULL) OR
    (execution_type IN ('script', 'hybrid') AND script_path IS NOT NULL)
  );

-- ============================================
-- PART 3: MIGRATION 002 (Paused/Suggested/Assignee)
-- ============================================

-- Add 'suggested' and 'paused' to task_status enum
ALTER TYPE task_status ADD VALUE IF NOT EXISTS 'suggested';
ALTER TYPE task_status ADD VALUE IF NOT EXISTS 'paused';

-- Create assignee type enum
CREATE TYPE assignee_type AS ENUM (
  'system',
  'human_owner',
  'human_third_party'
);

-- Add assignee columns to tasks table
ALTER TABLE tasks
  ADD COLUMN assigned_to_type assignee_type DEFAULT 'system',
  ADD COLUMN assigned_to_user_id UUID,
  ADD COLUMN assigned_to_name TEXT;

-- Add indexes
CREATE INDEX idx_tasks_assigned_to_type ON tasks(assigned_to_type);
CREATE INDEX idx_tasks_assigned_to_user ON tasks(assigned_to_user_id) WHERE assigned_to_user_id IS NOT NULL;

-- ============================================
-- TRIGGERS AND FUNCTIONS
-- ============================================

-- Auto-approval trigger
CREATE OR REPLACE FUNCTION auto_approve_task()
RETURNS TRIGGER AS $$
DECLARE
  matching_rule task_approval_rules%ROWTYPE;
BEGIN
  -- Only auto-approve from pending_approval or suggested status
  IF NEW.status NOT IN ('pending_approval', 'suggested') THEN
    RETURN NEW;
  END IF;

  -- Skip if is_pre_approved flag is set
  IF NEW.is_pre_approved THEN
    NEW.status := 'approved';
    NEW.approved_at := NOW();
    NEW.approved_by := 'auto_approval_rule';
    RETURN NEW;
  END IF;

  -- Find matching approval rule
  SELECT * INTO matching_rule
  FROM task_approval_rules
  WHERE enabled = TRUE
    AND auto_approve = TRUE
    AND (title_pattern IS NULL OR NEW.title ~* title_pattern)
    AND (system IS NULL OR NEW.system = system)
    AND (creator IS NULL OR NEW.created_by = creator)
    AND (priority IS NULL OR NEW.priority = ANY(priority))
    AND (tags_include IS NULL OR NEW.tags @> tags_include)
    AND (tags_exclude IS NULL OR NOT NEW.tags && tags_exclude)
  ORDER BY created_at DESC
  LIMIT 1;

  -- Auto-approve if rule found
  IF matching_rule.id IS NOT NULL THEN
    NEW.status := 'approved';
    NEW.approved_at := NOW();
    NEW.approved_by := matching_rule.name;

    IF matching_rule.default_priority IS NOT NULL THEN
      NEW.priority := matching_rule.default_priority;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_approve_task
  BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION auto_approve_task();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Pause/Resume functions
CREATE OR REPLACE FUNCTION pause_task(task_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE tasks
  SET status = 'paused',
      updated_at = NOW()
  WHERE id = task_id
    AND status IN ('approved', 'in_progress');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION resume_task(task_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE tasks
  SET status = 'approved',
      updated_at = NOW()
  WHERE id = task_id
    AND status = 'paused';
END;
$$ LANGUAGE plpgsql;

-- Helper for AI to create suggested tasks
CREATE OR REPLACE FUNCTION create_suggested_task(
  p_title TEXT,
  p_description TEXT,
  p_prompt TEXT,
  p_system execution_system,
  p_priority task_priority DEFAULT 'medium',
  p_agent_name TEXT DEFAULT 'autonomous_agent'
)
RETURNS UUID AS $$
DECLARE
  new_task_id UUID;
BEGIN
  INSERT INTO tasks (
    title,
    description,
    prompt,
    system,
    assigned_to_type,
    status,
    priority,
    created_by,
    created_by_agent
  ) VALUES (
    p_title,
    p_description,
    p_prompt,
    p_system,
    'system',
    'suggested',
    p_priority,
    'agent_autonomous',
    p_agent_name
  ) RETURNING id INTO new_task_id;

  RETURN new_task_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEWS
-- ============================================

-- Approval queue
CREATE VIEW approval_queue AS
SELECT
  t.*,
  COUNT(c.id) as comment_count,
  MAX(c.created_at) as last_comment_at
FROM tasks t
LEFT JOIN task_comments c ON t.id = c.task_id
WHERE t.status IN ('pending_approval', 'needs_refinement')
GROUP BY t.id
ORDER BY
  t.priority DESC,
  t.created_at ASC;

-- Execution queue
CREATE VIEW execution_queue AS
SELECT
  t.*,
  CASE
    WHEN t.scheduled_for IS NOT NULL AND t.scheduled_for > NOW() THEN 'scheduled'
    WHEN EXISTS (
      SELECT 1 FROM tasks deps
      WHERE deps.id = ANY(t.depends_on)
        AND deps.status NOT IN ('completed', 'cancelled')
    ) THEN 'has_dependencies'
    ELSE 'ready'
  END as execution_status
FROM tasks t
WHERE t.status = 'approved'
ORDER BY
  t.priority DESC,
  t.scheduled_for ASC NULLS LAST,
  t.created_at ASC;

-- Suggested tasks
CREATE VIEW suggested_tasks AS
SELECT
  t.*,
  COUNT(c.id) as comment_count,
  MAX(c.created_at) as last_comment_at
FROM tasks t
LEFT JOIN task_comments c ON t.id = c.task_id
WHERE t.status = 'suggested'
GROUP BY t.id
ORDER BY t.priority DESC, t.created_at ASC;

-- Paused tasks
CREATE VIEW paused_tasks AS
SELECT
  t.*,
  COUNT(c.id) as comment_count,
  MAX(c.created_at) as last_comment_at
FROM tasks t
LEFT JOIN task_comments c ON t.id = c.task_id
WHERE t.status = 'paused'
GROUP BY t.id
ORDER BY t.priority DESC, t.created_at ASC;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS (disabled by default for development)
-- Uncomment for production:
-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE task_executions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE task_approval_rules ENABLE ROW LEVEL SECURITY;

-- Basic policies (everyone can do everything for now)
-- Customize these for your security needs
CREATE POLICY "Allow all operations" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON task_executions FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON task_comments FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON task_templates FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON task_approval_rules FOR ALL USING (true);

-- ============================================
-- SEED DATA
-- ============================================

-- Example task templates
INSERT INTO task_templates (
  name, description, category,
  title_template, description_template, prompt_template,
  system, priority, recurrence,
  metadata
) VALUES
  (
    'Daily Morning Briefing',
    'Generate daily morning briefing with priorities',
    'professional',
    'Morning Briefing - {date}',
    'Daily briefing with calendar, priorities, and task summary',
    'Generate a morning briefing for {date}. Include: calendar events, top priorities, task summary, and recommendations.',
    'professional',
    'high',
    'daily',
    jsonb_build_object('execution_type', 'claude_session')
  ),
  (
    'Weekly Asset Status Report',
    'Generate weekly report on all digital assets',
    'assets',
    'Asset Report - Week {week}',
    'Weekly status report for all digital assets and websites',
    'Review all websites and digital assets. Report on: traffic, revenue, content needs, and optimization opportunities.',
    'asset_generator',
    'medium',
    'weekly',
    jsonb_build_object('execution_type', 'claude_session')
  ),
  (
    'Run Build and Tests',
    'Execute build and test suite',
    'development',
    'Build and Test - {component}',
    'Run complete build and test suite for {component}',
    NULL,
    'autonomous_agent',
    'high',
    'once',
    jsonb_build_object(
      'execution_type', 'script',
      'script_path', 'scripts/build_and_test.sh',
      'script_args', jsonb_build_object('component', '{component}')
    )
  );

-- Example approval rule
INSERT INTO task_approval_rules (
  name,
  description,
  title_pattern,
  system,
  auto_approve,
  auto_execute,
  enabled
) VALUES (
  'Auto-approve daily briefings',
  'Automatically approve and execute daily morning briefings',
  'Morning Briefing.*',
  'professional',
  TRUE,
  TRUE,
  FALSE  -- Disabled by default, enable when ready
);

-- ============================================
-- SETUP COMPLETE
-- ============================================

-- Log success
DO $$
BEGIN
  RAISE NOTICE '✅ Database setup complete!';
  RAISE NOTICE 'Tables created: tasks, task_executions, task_comments, task_templates, task_approval_rules';
  RAISE NOTICE 'Views created: approval_queue, execution_queue, suggested_tasks, paused_tasks';
  RAISE NOTICE 'Functions created: auto_approve_task, pause_task, resume_task, create_suggested_task';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Test connection: python3 test_supabase.py';
  RAISE NOTICE '2. Create test task: python3 create_test_task.py';
  RAISE NOTICE '3. Start executor: python3 tasks/integration/task_executor.py';
END $$;
