-- ============================================
-- RESET DATABASE
-- ============================================
-- ⚠️  WARNING: This will DELETE ALL DATA!
-- Only run this if you want to completely reset your database
--
-- Usage:
--   supabase db push --file tasks/database/reset_database.sql
--
-- Or via SQL Editor:
--   Copy/paste into Supabase SQL Editor and run
-- ============================================

-- Drop all views first (they depend on tables)
DROP VIEW IF EXISTS paused_tasks CASCADE;
DROP VIEW IF EXISTS suggested_tasks CASCADE;
DROP VIEW IF EXISTS execution_queue CASCADE;
DROP VIEW IF EXISTS approval_queue CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS create_suggested_task CASCADE;
DROP FUNCTION IF EXISTS resume_task CASCADE;
DROP FUNCTION IF EXISTS pause_task CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS auto_approve_task CASCADE;

-- Drop all tables (CASCADE removes foreign keys)
DROP TABLE IF EXISTS task_approval_rules CASCADE;
DROP TABLE IF EXISTS task_templates CASCADE;
DROP TABLE IF EXISTS task_comments CASCADE;
DROP TABLE IF EXISTS task_executions CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;

-- Drop all custom types
DROP TYPE IF EXISTS assignee_type CASCADE;
DROP TYPE IF EXISTS execution_type CASCADE;
DROP TYPE IF EXISTS comment_type CASCADE;
DROP TYPE IF EXISTS creator_type CASCADE;
DROP TYPE IF EXISTS execution_system CASCADE;
DROP TYPE IF EXISTS task_recurrence CASCADE;
DROP TYPE IF EXISTS task_priority CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE '✅ Database reset complete!';
  RAISE NOTICE '';
  RAISE NOTICE 'All tables, views, functions, and types have been dropped.';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Run setup: supabase db push --file tasks/database/setup_database.sql';
  RAISE NOTICE '2. Or use SQL Editor: Copy/paste setup_database.sql contents';
END $$;
