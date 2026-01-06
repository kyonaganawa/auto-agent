# Claude Code Execution Logging Hook Setup

## Overview

This hook logs all Claude Code sessions to Supabase for monitoring and analysis.

**Hook Type:** `UserPromptSubmit`
**Triggered:** After each user prompt submission (start of Claude session)

## Configuration Status

✅ Hook script created: `.claude/hooks/log-execution.py`
✅ Hook registered in settings: `~/.claude/settings.json`
✅ Script made executable
⏳ SQL schema needs to be applied to Supabase
⏳ Environment variables need to be configured

## Setup Steps

### 1. Apply SQL Schema to Supabase

**Option A: Via Supabase Dashboard (Recommended)**
1. Go to: https://app.supabase.com/project/vsyhhgkfjwkjubvsdqjw/sql
2. Open `tasks/database/claude_execution_logs_table.sql`
3. Copy the entire contents
4. Paste into Supabase SQL Editor
5. Click "Run" to create the table

**Option B: Via psql CLI**
```bash
# Get connection string from Supabase dashboard: Project Settings > Database
psql "postgresql://postgres:[PASSWORD]@db.vsyhhgkfjwkjubvsdqjw.supabase.co:5432/postgres" \
  < tasks/database/claude_execution_logs_table.sql
```

### 2. Configure Environment Variables

The hook needs Supabase credentials to log executions. Add these to your shell profile:

**For bash (`~/.bash_profile` or `~/.bashrc`):**
```bash
export SUPABASE_URL="https://vsyhhgkfjwkjubvsdqjw.supabase.co"
export SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzeWhoZ2tmandranVidnNkcWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5OTQxODksImV4cCI6MjA4MjU3MDE4OX0.TaC7S0Xi7Vj8cgp7IKuRk4VyhNkf8Vyqdt_-uzd9uqo"
```

**For zsh (`~/.zshrc`):**
```zsh
export SUPABASE_URL="https://vsyhhgkfjwkjubvsdqjw.supabase.co"
export SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzeWhoZ2tmandranVidnNkcWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5OTQxODksImV4cCI6MjA4MjU3MDE4OX0.TaC7S0Xi7Vj8cgp7IKuRk4VyhNkf8Vyqdt_-uzd9uqo"
```

**Apply changes:**
```bash
source ~/.zshrc  # or ~/.bash_profile
```

### 3. Verify Hook Registration

Check that the hook is registered:
```bash
claude /hooks
```

You should see:
- **UserPromptSubmit** with your hook command listed

### 4. Test the Hook

Run a simple Claude Code command to test logging:
```bash
echo "test prompt" | claude --one-shot "echo 'testing hook'"
```

Then verify the log was created in Supabase:
```bash
python3 -c "
from supabase import create_client
import os

supabase = create_client(
    os.environ.get('SUPABASE_URL'),
    os.environ.get('SUPABASE_ANON_KEY')
)

logs = supabase.table('claude_execution_logs').select('*').limit(5).execute()
print(f'Found {len(logs.data)} logs')
for log in logs.data:
    print(f\"  - {log['started_at']}: {log['initial_message'][:50]}...\")
"
```

### 5. Monitor Execution Logs

View logs in Supabase dashboard:
https://app.supabase.com/project/vsyhhgkfjwkjubvsdqjw/editor

Or query via Python:
```python
from supabase import create_client
import os

supabase = create_client(
    os.environ['SUPABASE_URL'],
    os.environ['SUPABASE_ANON_KEY']
)

# Get recent executions
recent = supabase.table('claude_execution_logs') \
    .select('*') \
    .order('started_at', desc=True) \
    .limit(10) \
    .execute()

for log in recent.data:
    print(f"{log['started_at']} - {log['execution_context']}: {log['initial_message']}")
```

## Hook Behavior

- **Silent failures:** The hook will not block Claude Code if Supabase is unavailable
- **Error logging:** Errors are logged to `~/.claude/hooks/errors.log`
- **Session tracking:** Each session gets a unique `session_id`
- **Context detection:** Automatically detects if execution is manual, automated, or via task_executor

## Troubleshooting

### Hook not running?
1. Check hook is registered: `claude /hooks`
2. Verify script is executable: `ls -la .claude/hooks/log-execution.py`
3. Check environment variables: `echo $SUPABASE_URL`
4. Run with debug mode: `claude --debug`

### Hook failing silently?
Check error log:
```bash
cat ~/.claude/hooks/errors.log
```

### No logs in Supabase?
1. Verify table exists: Check Supabase dashboard
2. Test Supabase connection:
   ```bash
   python3 -c "from supabase import create_client; import os; print(create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_ANON_KEY']).table('claude_execution_logs').select('count').execute())"
   ```

## What's Logged

Each execution logs:
- **Session Info:** session_id, execution_context, model
- **Timing:** started_at, completed_at, duration
- **Input:** prompt, initial_message, working_directory
- **Configuration:** max_turns, allowed_tools
- **Results:** turns_used, success, error_message
- **File Changes:** files_created, files_modified, files_deleted
- **Git Activity:** commits with messages and hashes
- **Metadata:** Custom tags, categories, notes

## Future Enhancements

- [ ] Add completion hook to log execution results
- [ ] Track token usage and costs
- [ ] Link executions to tasks in task management system
- [ ] Add dashboard visualization of execution metrics
- [ ] Set up alerts for failed executions
