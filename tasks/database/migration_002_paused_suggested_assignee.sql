-- Migration 002: Add paused/suggested statuses and assignee tracking
-- Run this after migration_001_execution_type.sql

-- ============================================
-- 1. Add new task statuses
-- ============================================

-- Add 'suggested' and 'paused' to task_status enum
ALTER TYPE task_status ADD VALUE IF NOT EXISTS 'suggested';  -- AI suggested, needs owner approval
ALTER TYPE task_status ADD VALUE IF NOT EXISTS 'paused';     -- Approved but temporarily halted

-- ============================================
-- 2. Add assignee tracking
-- ============================================

-- Create assignee type enum
CREATE TYPE assignee_type AS ENUM (
  'system',              -- Automated system/agent execution
  'human_owner',         -- Owner (you) should execute
  'human_third_party'    -- Third party human should execute
);

-- Add assignee columns to tasks table
ALTER TABLE tasks
  ADD COLUMN assigned_to_type assignee_type DEFAULT 'system',
  ADD COLUMN assigned_to_user_id UUID REFERENCES auth.users(id),
  ADD COLUMN assigned_to_name TEXT;  -- Name for third party (if not in auth.users)

-- Add indexes
CREATE INDEX idx_tasks_assigned_to_type ON tasks(assigned_to_type);
CREATE INDEX idx_tasks_assigned_to_user ON tasks(assigned_to_user_id) WHERE assigned_to_user_id IS NOT NULL;

-- Add comments
COMMENT ON COLUMN tasks.assigned_to_type IS 'Who should execute: system (automated), human_owner (you), human_third_party';
COMMENT ON COLUMN tasks.assigned_to_user_id IS 'User ID for third party assignees (references auth.users)';
COMMENT ON COLUMN tasks.assigned_to_name IS 'Name for third party assignees not in auth.users';

-- ============================================
-- 3. Update state machine constraints
-- ============================================

-- Status transition validation (updated to include suggested and paused)
COMMENT ON TYPE task_status IS 'Task workflow states:
- draft: User creating task (not committed)
- suggested: AI suggested task (needs owner approval)
- pending_approval: Waiting for approval
- needs_refinement: Needs more detail before approval
- approved: Approved and ready to execute
- paused: Approved but temporarily halted (will not execute)
- in_progress: Currently executing
- completed: Successfully completed
- failed: Execution failed
- cancelled: Cancelled by user
- blocked: Blocked by dependencies or external factors';

-- ============================================
-- 4. Update auto-approval trigger
-- ============================================

-- Update auto_approve_task to handle suggested status
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

    -- Set default priority if specified in rule
    IF matching_rule.default_priority IS NOT NULL THEN
      NEW.priority := matching_rule.default_priority;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. Add function to pause/resume tasks
-- ============================================

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

-- ============================================
-- 6. Update execution queue view
-- ============================================

-- Drop old view
DROP VIEW IF EXISTS execution_queue;

-- Recreate with paused filtering
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
WHERE t.status = 'approved'  -- Only approved tasks (excludes paused)
ORDER BY
  t.priority DESC,
  t.scheduled_for ASC NULLS LAST,
  t.created_at ASC;

COMMENT ON VIEW execution_queue IS 'Tasks ready for execution (excludes paused, draft, suggested)';

-- ============================================
-- 7. Add suggested tasks view (for owner approval)
-- ============================================

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

COMMENT ON VIEW suggested_tasks IS 'AI-suggested tasks awaiting owner approval (outside usual routines)';

-- ============================================
-- 8. Add paused tasks view
-- ============================================

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

COMMENT ON VIEW paused_tasks IS 'Tasks temporarily paused (will not execute until resumed)';

-- ============================================
-- 9. Update RLS policies
-- ============================================

-- Allow users to view suggested tasks (they need to approve them)
-- (Existing policies should already allow this, but let's be explicit)

-- Ensure users can transition suggested -> approved
-- (Existing update policy should allow this)

-- ============================================
-- 10. Add seed data examples
-- ============================================

-- Example: System task
INSERT INTO tasks (
  title, description, system, assigned_to_type, execution_type, priority
) VALUES (
  'Daily Database Backup',
  'Automated daily backup of Supabase database to S3',
  'autonomous_agent',
  'system',  -- Automated
  'script',
  'critical'
) ON CONFLICT DO NOTHING;

-- Example: Human owner task
INSERT INTO tasks (
  title, description, system, assigned_to_type, status, priority
) VALUES (
  'Review Q1 Financial Reports',
  'Review and approve quarterly financial statements before board meeting',
  'professional',
  'human_owner',  -- You should do this
  'draft',
  'high'
) ON CONFLICT DO NOTHING;

-- Example: Third party task
INSERT INTO tasks (
  title, description, system, assigned_to_type, assigned_to_name, status, priority
) VALUES (
  'Design New Logo',
  'Create 3 logo variations for indie-games-hub website rebranding',
  'asset_generator',
  'human_third_party',  -- Designer should do this
  'Sarah (Designer)',
  'draft',
  'medium'
) ON CONFLICT DO NOTHING;

-- Example: AI suggested task (outside usual routine)
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
  'Analyze Competitor SEO Strategies',
  'AI agent noticed competitors ranking higher for key gaming terms',
  'Research top 5 competitors in indie gaming space and analyze their SEO strategies. Provide actionable recommendations for improving our rankings.',
  'asset_generator',
  'system',
  'suggested',  -- AI suggested, needs owner approval
  'medium',
  'agent_autonomous',
  'autonomous_agent'
) ON CONFLICT DO NOTHING;

-- ============================================
-- 11. Add helper function for creating suggested tasks
-- ============================================

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

COMMENT ON FUNCTION create_suggested_task IS 'Helper for AI agents to suggest tasks outside usual routines';

-- ============================================
-- 12. Migration complete
-- ============================================

-- Log migration
DO $$
BEGIN
  RAISE NOTICE 'Migration 002 completed: Added paused/suggested statuses and assignee tracking';
END $$;
