-- Auto-Agent Task System - Supabase Schema
-- PostgreSQL database schema for task management

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ============================================
-- ENUMS
-- ============================================

-- Task status in the approval workflow
CREATE TYPE task_status AS ENUM (
  'draft',              -- Initial creation, not yet submitted
  'pending_approval',   -- Awaiting human approval
  'needs_refinement',   -- Rejected, needs more details
  'approved',           -- Approved, ready to execute
  'in_progress',        -- Currently being executed
  'completed',          -- Successfully completed
  'failed',             -- Execution failed
  'cancelled',          -- Cancelled by user
  'blocked'             -- Blocked by dependencies or issues
);

-- Priority levels for execution order
CREATE TYPE task_priority AS ENUM (
  'critical',   -- P0 - Execute immediately
  'high',       -- P1 - Execute ASAP
  'medium',     -- P2 - Normal priority
  'low',        -- P3 - When resources available
  'backlog'     -- P4 - Future consideration
);

-- Task recurrence patterns
CREATE TYPE task_recurrence AS ENUM (
  'once',       -- One-time task
  'daily',      -- Every day
  'weekly',     -- Every week
  'monthly',    -- Every month
  'yearly',     -- Every year
  'custom'      -- Custom cron expression
);

-- System where task should be executed
CREATE TYPE execution_system AS ENUM (
  'autonomous_agent',   -- General autonomous agent
  'asset_generator',    -- Asset generation specialist
  'professional',       -- Professional workflow system
  'personal',          -- Personal improvement system
  'projects',          -- Personal projects system
  'custom'             -- Custom system/script
);

-- Who created the task
CREATE TYPE creator_type AS ENUM (
  'human',             -- Created by user
  'agent_autonomous',  -- Autonomous agent
  'agent_daily',       -- Daily briefing agent
  'agent_asset',       -- Asset generator agent
  'system'             -- System-generated
);

-- ============================================
-- MAIN TABLES
-- ============================================

-- Tasks table
CREATE TABLE tasks (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Core fields
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  prompt TEXT,  -- AI execution prompt (optional for manual tasks)

  -- System and execution
  system execution_system NOT NULL DEFAULT 'autonomous_agent',
  custom_system VARCHAR(100),  -- For system='custom'

  -- Status and workflow
  status task_status NOT NULL DEFAULT 'pending_approval',
  priority task_priority NOT NULL DEFAULT 'medium',

  -- Creator tracking
  created_by creator_type NOT NULL DEFAULT 'human',
  created_by_user_id UUID,  -- References auth.users if human
  created_by_agent VARCHAR(100),  -- Agent name if created by agent

  -- Recurrence
  recurrence task_recurrence NOT NULL DEFAULT 'once',
  recurrence_pattern VARCHAR(100),  -- Cron expression for custom recurrence

  -- Scheduling
  scheduled_for TIMESTAMP WITH TIME ZONE,  -- Specific execution time
  execute_after TIMESTAMP WITH TIME ZONE,  -- Don't execute before this
  deadline TIMESTAMP WITH TIME ZONE,       -- Should complete by this time

  -- Dependencies
  depends_on UUID[],  -- Array of task IDs that must complete first
  blocks UUID[],      -- Array of task IDs that this task blocks

  -- Approval and refinement
  approved_by UUID,  -- User who approved (references auth.users)
  approved_at TIMESTAMP WITH TIME ZONE,
  refinement_notes TEXT,  -- Feedback when status = needs_refinement

  -- Execution tracking
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  execution_log TEXT,  -- Path to execution log file

  -- Metadata
  tags TEXT[],  -- Array of tags for categorization
  metadata JSONB,  -- Flexible metadata storage

  -- Auto-approval rules
  auto_approve_pattern VARCHAR(200),  -- Pattern for auto-approval
  is_pre_approved BOOLEAN DEFAULT FALSE,

  -- Recurrence tracking
  parent_task_id UUID,  -- For recurring tasks, references the parent
  recurrence_instance_date DATE,  -- Which instance of recurring task
  next_recurrence_at TIMESTAMP WITH TIME ZONE,  -- When to create next instance

  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Foreign keys
  FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE SET NULL
);

-- Task execution history (for completed/failed tasks)
CREATE TABLE task_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,

  -- Execution details
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,

  -- Result
  status task_status NOT NULL,  -- completed or failed
  exit_code INTEGER,
  error_message TEXT,

  -- Logs and output
  execution_log_path TEXT,  -- Path to log file
  output_summary TEXT,      -- Brief summary of what was done
  output_data JSONB,        -- Structured output data

  -- Resources used
  tokens_used INTEGER,      -- For AI tasks
  cost_usd DECIMAL(10, 4),  -- Estimated cost

  -- Metadata
  executed_by VARCHAR(100),  -- Which agent/system executed
  metadata JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-approval rules
CREATE TABLE task_approval_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Rule definition
  name VARCHAR(200) NOT NULL,
  description TEXT,

  -- Matching criteria (all must match for rule to apply)
  title_pattern VARCHAR(200),       -- Regex pattern for title
  system execution_system,           -- Specific system
  creator creator_type,              -- Specific creator type
  priority task_priority[],          -- Array of allowed priorities
  tags_include TEXT[],               -- Must have all these tags
  tags_exclude TEXT[],               -- Must not have any of these tags

  -- Auto-approval settings
  auto_approve BOOLEAN DEFAULT TRUE,
  auto_execute BOOLEAN DEFAULT FALSE,  -- Execute immediately after approval
  default_priority task_priority,

  -- Safety limits
  max_cost_usd DECIMAL(10, 2),      -- Don't auto-approve if estimated cost exceeds
  require_refinement_if TEXT,        -- Condition that forces refinement

  -- Audit
  enabled BOOLEAN DEFAULT TRUE,
  created_by UUID,  -- User who created rule
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task comments/discussions
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,

  -- Comment
  comment TEXT NOT NULL,
  comment_type VARCHAR(50) DEFAULT 'comment',  -- comment, refinement, approval, system

  -- Author
  author_type creator_type NOT NULL,
  author_user_id UUID,  -- If human
  author_agent VARCHAR(100),  -- If agent

  -- Metadata
  metadata JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task templates (for quick task creation)
CREATE TABLE task_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Template info
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100),

  -- Template fields (these become defaults for new tasks)
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

-- ============================================
-- INDEXES
-- ============================================

-- Performance indexes
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_system ON tasks(system);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_scheduled_for ON tasks(scheduled_for);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_tasks_recurrence ON tasks(recurrence);
CREATE INDEX idx_tasks_parent_task_id ON tasks(parent_task_id);
CREATE INDEX idx_tasks_tags ON tasks USING GIN(tags);
CREATE INDEX idx_tasks_metadata ON tasks USING GIN(metadata);

-- Composite indexes for common queries
CREATE INDEX idx_tasks_status_priority ON tasks(status, priority DESC);
CREATE INDEX idx_tasks_status_system ON tasks(status, system);
CREATE INDEX idx_tasks_approval_queue ON tasks(status, priority DESC, created_at)
  WHERE status IN ('pending_approval', 'needs_refinement');
CREATE INDEX idx_tasks_execution_queue ON tasks(status, priority DESC, scheduled_for)
  WHERE status = 'approved';

-- Execution history indexes
CREATE INDEX idx_executions_task_id ON task_executions(task_id);
CREATE INDEX idx_executions_started_at ON task_executions(started_at DESC);

-- Comments indexes
CREATE INDEX idx_comments_task_id ON task_comments(task_id, created_at DESC);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approval_rules_updated_at BEFORE UPDATE ON task_approval_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON task_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Check and apply auto-approval rules
CREATE OR REPLACE FUNCTION check_auto_approval_rules()
RETURNS TRIGGER AS $$
DECLARE
  rule RECORD;
  should_approve BOOLEAN := FALSE;
BEGIN
  -- Only check for new tasks in pending_approval status
  IF NEW.status != 'pending_approval' OR TG_OP != 'INSERT' THEN
    RETURN NEW;
  END IF;

  -- Check against all enabled rules
  FOR rule IN
    SELECT * FROM task_approval_rules
    WHERE enabled = TRUE
    ORDER BY created_at
  LOOP
    -- Check if rule matches
    IF (rule.title_pattern IS NULL OR NEW.title ~ rule.title_pattern)
      AND (rule.system IS NULL OR NEW.system = rule.system)
      AND (rule.creator IS NULL OR NEW.created_by = rule.creator)
      AND (rule.priority IS NULL OR NEW.priority = ANY(rule.priority))
      AND (rule.tags_include IS NULL OR rule.tags_include <@ NEW.tags)
      AND (rule.tags_exclude IS NULL OR NOT (rule.tags_exclude && NEW.tags))
    THEN
      should_approve := TRUE;

      -- Apply rule settings
      IF rule.auto_approve THEN
        NEW.status := 'approved';
        NEW.approved_at := NOW();
        NEW.is_pre_approved := TRUE;
      END IF;

      IF rule.default_priority IS NOT NULL THEN
        NEW.priority := rule.default_priority;
      END IF;

      EXIT; -- Stop after first matching rule
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER apply_auto_approval_rules BEFORE INSERT ON tasks
  FOR EACH ROW EXECUTE FUNCTION check_auto_approval_rules();

-- Create next recurrence instance
CREATE OR REPLACE FUNCTION create_next_recurrence()
RETURNS TRIGGER AS $$
DECLARE
  next_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Only process completed recurring tasks
  IF NEW.status != 'completed' OR NEW.recurrence = 'once' THEN
    RETURN NEW;
  END IF;

  -- Calculate next occurrence
  CASE NEW.recurrence
    WHEN 'daily' THEN
      next_date := NEW.scheduled_for + INTERVAL '1 day';
    WHEN 'weekly' THEN
      next_date := NEW.scheduled_for + INTERVAL '7 days';
    WHEN 'monthly' THEN
      next_date := NEW.scheduled_for + INTERVAL '1 month';
    WHEN 'yearly' THEN
      next_date := NEW.scheduled_for + INTERVAL '1 year';
    ELSE
      RETURN NEW;  -- Custom recurrence handled elsewhere
  END CASE;

  -- Create new task instance
  INSERT INTO tasks (
    title, description, prompt, system, custom_system,
    priority, created_by, created_by_agent,
    recurrence, recurrence_pattern, scheduled_for,
    tags, metadata, is_pre_approved,
    parent_task_id, recurrence_instance_date
  ) VALUES (
    NEW.title, NEW.description, NEW.prompt, NEW.system, NEW.custom_system,
    NEW.priority, NEW.created_by, NEW.created_by_agent,
    NEW.recurrence, NEW.recurrence_pattern, next_date,
    NEW.tags, NEW.metadata, NEW.is_pre_approved,
    COALESCE(NEW.parent_task_id, NEW.id),  -- Link to parent or self
    next_date::DATE
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_recurring_tasks AFTER UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION create_next_recurrence();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_approval_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;

-- Policies for tasks table
CREATE POLICY "Users can view all tasks"
  ON tasks FOR SELECT
  USING (true);

CREATE POLICY "Users can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own tasks"
  ON tasks FOR UPDATE
  USING (created_by_user_id = auth.uid() OR created_by != 'human');

CREATE POLICY "Users can delete their own tasks"
  ON tasks FOR DELETE
  USING (created_by_user_id = auth.uid());

-- Policies for executions (read-only for users)
CREATE POLICY "Users can view all executions"
  ON task_executions FOR SELECT
  USING (true);

-- Service role can insert executions
CREATE POLICY "Service role can manage executions"
  ON task_executions FOR ALL
  USING (true)
  WITH CHECK (true);

-- Policies for comments
CREATE POLICY "Users can view all comments"
  ON task_comments FOR SELECT
  USING (true);

CREATE POLICY "Users can create comments"
  ON task_comments FOR INSERT
  WITH CHECK (true);

-- Policies for templates
CREATE POLICY "Users can view all templates"
  ON task_templates FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own templates"
  ON task_templates FOR ALL
  USING (created_by = auth.uid());

-- ============================================
-- VIEWS
-- ============================================

-- Pending approval queue
CREATE VIEW v_approval_queue AS
SELECT
  t.*,
  COUNT(c.id) as comment_count,
  MAX(c.created_at) as last_comment_at
FROM tasks t
LEFT JOIN task_comments c ON t.id = c.task_id
WHERE t.status IN ('pending_approval', 'needs_refinement')
GROUP BY t.id
ORDER BY t.priority DESC, t.created_at ASC;

-- Execution queue (approved tasks ready to run)
CREATE VIEW v_execution_queue AS
SELECT
  t.*,
  CASE
    WHEN t.scheduled_for IS NOT NULL AND t.scheduled_for > NOW() THEN 'scheduled'
    WHEN t.depends_on IS NOT NULL THEN 'has_dependencies'
    ELSE 'ready'
  END as execution_status
FROM tasks t
WHERE t.status = 'approved'
ORDER BY
  t.priority DESC,
  COALESCE(t.scheduled_for, NOW()) ASC;

-- Task statistics
CREATE VIEW v_task_statistics AS
SELECT
  status,
  priority,
  system,
  created_by,
  COUNT(*) as task_count,
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_duration_seconds
FROM tasks
GROUP BY status, priority, system, created_by;

-- ============================================
-- SEED DATA
-- ============================================

-- Default auto-approval rules
INSERT INTO task_approval_rules (name, description, creator, auto_approve, auto_execute) VALUES
  ('Auto-approve low priority system tasks',
   'Automatically approve low priority tasks created by system',
   'system', TRUE, FALSE);

-- Common task templates
INSERT INTO task_templates (name, description, category, title_template, description_template, system, priority) VALUES
  ('Daily Morning Briefing',
   'Generate daily morning briefing with priorities and schedule',
   'professional',
   'Daily Briefing - {date}',
   'Review calendar, identify priorities, and create morning briefing for {date}',
   'professional',
   'high'),

  ('Weekly Asset Review',
   'Review all digital assets and identify optimization opportunities',
   'assets',
   'Weekly Asset Review - {date}',
   'Analyze performance of all digital assets and provide recommendations',
   'asset_generator',
   'medium'),

  ('Generate Gaming Content',
   'Generate content for gaming website',
   'assets',
   'Generate {count} articles for {website}',
   'Create SEO-optimized gaming articles for {website}',
   'asset_generator',
   'medium');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Comments
COMMENT ON TABLE tasks IS 'Main task table with approval workflow and scheduling';
COMMENT ON TABLE task_executions IS 'Historical record of task executions';
COMMENT ON TABLE task_approval_rules IS 'Rules for automatically approving tasks';
COMMENT ON TABLE task_comments IS 'Comments and discussions on tasks';
COMMENT ON TABLE task_templates IS 'Reusable task templates';
