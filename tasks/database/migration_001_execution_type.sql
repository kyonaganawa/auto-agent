-- Migration 001: Add execution_type to support both Claude Code sessions and scripts
-- Run this after the initial schema.sql

-- Create execution type enum
CREATE TYPE execution_type AS ENUM (
  'claude_session',  -- Execute via Claude Code with prompt
  'script',          -- Execute pre-created script
  'hybrid'           -- Script that calls Claude Code
);

-- Add execution_type column to tasks table
ALTER TABLE tasks
  ADD COLUMN execution_type execution_type NOT NULL DEFAULT 'claude_session',
  ADD COLUMN script_path TEXT,  -- Path to script (for script/hybrid types)
  ADD COLUMN script_args JSONB,  -- Arguments to pass to script
  ADD COLUMN timeout_seconds INTEGER DEFAULT 3600;  -- Execution timeout

-- Add index for script-based tasks
CREATE INDEX idx_tasks_execution_type ON tasks(execution_type);

-- Add comment
COMMENT ON COLUMN tasks.execution_type IS 'How to execute: claude_session (AI prompt), script (run script), hybrid (script + Claude)';
COMMENT ON COLUMN tasks.script_path IS 'Path to script file (relative to project root or absolute)';
COMMENT ON COLUMN tasks.script_args IS 'JSON object of arguments to pass to script';
COMMENT ON COLUMN tasks.timeout_seconds IS 'Maximum execution time in seconds (default: 3600 = 1 hour)';

-- Update check constraint to ensure script_path is set for script/hybrid types
ALTER TABLE tasks ADD CONSTRAINT check_script_path
  CHECK (
    (execution_type = 'claude_session' AND script_path IS NULL) OR
    (execution_type IN ('script', 'hybrid') AND script_path IS NOT NULL)
  );

-- Add seed data for script-based templates
INSERT INTO task_templates (
  name, description, category,
  title_template, description_template, prompt_template,
  system, priority, recurrence,
  metadata
) VALUES
  (
    'Run Build and Tests',
    'Execute build and test suite',
    'development',
    'Build and Test - {component}',
    'Run complete build and test suite for {component}',
    NULL,  -- No prompt for script execution
    'autonomous_agent',
    'high',
    'once',
    jsonb_build_object(
      'execution_type', 'script',
      'script_path', 'scripts/build_and_test.sh',
      'script_args', jsonb_build_object('component', '{component}')
    )
  ),
  (
    'Deploy Website',
    'Deploy website to production',
    'assets',
    'Deploy {website} to {platform}',
    'Deploy website {website} to hosting platform {platform}',
    NULL,
    'asset_generator',
    'high',
    'once',
    jsonb_build_object(
      'execution_type', 'script',
      'script_path', 'objectives/assets/websites/tools/scripts/deploy_website.sh',
      'script_args', jsonb_build_object('website', '{website}', 'platform', '{platform}')
    )
  ),
  (
    'Generate Content with Review',
    'Generate content and review with Claude',
    'assets',
    'Generate and Review Content for {website}',
    'Generate {count} articles and review with AI for quality',
    'Review the generated content for quality, SEO, and consistency. Provide feedback and suggestions.',
    'asset_generator',
    'medium',
    'weekly',
    jsonb_build_object(
      'execution_type', 'hybrid',
      'script_path', 'objectives/assets/websites/tools/scripts/generate_content.sh',
      'script_args', jsonb_build_object('website', '{website}', 'count', '{count}')
    )
  );

-- Update existing templates to explicitly set execution_type
UPDATE task_templates
SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('execution_type', 'claude_session')
WHERE metadata IS NULL OR NOT metadata ? 'execution_type';
