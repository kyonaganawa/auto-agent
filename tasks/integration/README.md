# Task Execution System

Automated task execution with Supabase integration and comprehensive logging.

## Two Executors Available

### 1. **task_executor.py** (Standard)
Basic task execution with standard logging.

```bash
# Execute one task
python3 tasks/integration/task_executor.py

# Run continuously
python3 tasks/integration/task_executor.py --continuous --interval 60
```

**Logs to Supabase:**
- Start/end timestamps
- Exit code
- Output summary (first 500 chars)
- Log file path
- Error messages

---

### 2. **enhanced_task_executor.py** (Recommended)
Enhanced version with detailed logging including file modifications and git commits.

```bash
# Execute one task
python3 tasks/integration/enhanced_task_executor.py

# Run continuously
python3 tasks/integration/enhanced_task_executor.py --continuous --interval 60
```

**Enhanced Logs Include:**
- ✅ All standard fields
- ✅ **Modified files list** with paths
- ✅ **Git commit messages**
- ✅ File modification count
- ✅ Git commits count
- ✅ Execution duration (seconds)
- ✅ Working directory
- ✅ Full prompt (first 500 chars)
- ✅ Comprehensive output_data JSON with all details

---

## How It Works

### 1. **Fetch Next Task**
Queries Supabase for tasks where:
- `status = 'approved'`
- Ordered by priority (P0 > P1 > P2 > P3 > P4)
- Then by scheduled time (earliest first)
- Skips future-scheduled tasks

### 2. **Execute Task**
Three execution types supported:

#### **Claude Session** (Default)
Runs Claude Code with your prompt:
```bash
claude \
  -p "Your prompt here" \
  --add-dir /path/to/working/directory \
  --allowedTools Bash,Read,Write,Edit,Glob,Grep,TodoWrite \
  --max-turns 10 \
  --output-format json
```

**Working directories by system:**
- `autonomous_agent` → project root
- `asset_generator` → `objectives/assets/`
- `professional` → `objectives/professional/`
- `personal` → `objectives/personal/`
- `projects` → `objectives/projects/`

#### **Script Execution**
Runs a pre-written script:
```json
{
  "execution_type": "script",
  "script_path": "scripts/my_script.sh",
  "script_args": {"arg1": "value1"}
}
```

#### **Hybrid**
Runs script first, then Claude Code with script output:
```json
{
  "execution_type": "hybrid",
  "script_path": "scripts/analyze.py",
  "prompt": "Review the analysis and suggest improvements"
}
```

### 3. **Log to Supabase**

Updates two tables:

**`tasks` table:**
```sql
UPDATE tasks SET
  status = 'completed',
  completed_at = NOW(),
  execution_log = '/logs/task_executor/task_abc123_20250129.log'
WHERE id = 'task-id';
```

**`task_executions` table:**
```sql
INSERT INTO task_executions (
  task_id,
  started_at,
  completed_at,
  status,
  exit_code,
  output_summary,
  output_data,  -- Enhanced version includes file links here!
  execution_log_path,
  error_message
) VALUES (...);
```

---

## Enhanced Logging Details

The **enhanced executor** extracts and logs:

### File Modifications
Automatically detects from log output:
- `"File created successfully at: /path/to/file"`
- `"The file X has been updated"`
- `"Writing to file: X"`

### Git Commits
Extracts commit messages:
- `git commit -m "Your commit message"`

### Example `output_data` JSON:
```json
{
  "task_id": "abc123",
  "task_title": "Implement user authentication",
  "execution_type": "claude_session",
  "started_at": "2025-01-29T12:00:00Z",
  "completed_at": "2025-01-29T12:15:30Z",
  "duration_seconds": 930,
  "success": true,
  "working_directory": "professional",
  "prompt": "Implement JWT-based authentication...",
  "modified_files": [
    {
      "path": "/Users/you/project/src/auth.ts",
      "type": "modified"
    },
    {
      "path": "/Users/you/project/src/middleware/auth.ts",
      "type": "modified"
    },
    {
      "type": "git_commit",
      "message": "feat: implement JWT authentication"
    }
  ],
  "files_modified_count": 2,
  "git_commits_count": 1,
  "log_file_path": "/Users/you/logs/task_executor/task_abc123_20250129.log",
  "output_summary": "Task completed successfully...",
  "exit_code": 0
}
```

---

## Setup

### 1. Environment Variables
```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_KEY="your-service-role-key"
```

Add to `~/.zshrc` or `~/.bashrc` for persistence.

### 2. Install Dependencies
```bash
pip3 install supabase
```

### 3. Database Setup
Ensure tables exist (should already be set up):
- `tasks`
- `task_executions`

See `tasks/database/setup_database.sql`

---

## Usage Examples

### Execute One Task
```bash
python3 tasks/integration/enhanced_task_executor.py
```

**Output:**
```
2025-01-29 12:00:00 - enhanced_task_executor - INFO - Enhanced task executor initialized
2025-01-29 12:00:01 - enhanced_task_executor - INFO - Executing task abc123
2025-01-29 12:00:01 - enhanced_task_executor - INFO - Title: Implement user auth
2025-01-29 12:00:01 - enhanced_task_executor - INFO - Execution type: claude_session
2025-01-29 12:15:30 - enhanced_task_executor - INFO - Task abc123 execution logged to Supabase
2025-01-29 12:15:30 - enhanced_task_executor - INFO -   - Files modified: 2
2025-01-29 12:15:30 - enhanced_task_executor - INFO -   - Git commits: 1
2025-01-29 12:15:30 - enhanced_task_executor - INFO -   - Duration: 930s
```

### Run Continuously (Background Service)
```bash
# Using nohup
nohup python3 tasks/integration/enhanced_task_executor.py --continuous --interval 30 > logs/executor.log 2>&1 &

# Using screen (recommended)
screen -S task-executor
python3 tasks/integration/enhanced_task_executor.py --continuous --interval 30
# Press Ctrl+A, then D to detach

# Reattach later
screen -r task-executor

# Using systemd (Linux)
# Create /etc/systemd/system/auto-agent-executor.service
# See example in docs/
```

### Cron Job (Hourly Execution)
```bash
crontab -e

# Add:
0 * * * * cd /path/to/auto-agent && /usr/bin/python3 tasks/integration/enhanced_task_executor.py >> logs/executor.log 2>&1
```

---

## Viewing Execution Logs

### In Supabase Dashboard
```sql
-- Recent executions
SELECT
  te.task_id,
  t.title,
  te.started_at,
  te.completed_at,
  te.status,
  te.output_data->'files_modified_count' as files_modified,
  te.output_data->'git_commits_count' as git_commits
FROM task_executions te
JOIN tasks t ON t.id = te.task_id
ORDER BY te.started_at DESC
LIMIT 10;

-- File modifications from last execution
SELECT
  jsonb_array_elements(output_data->'modified_files') as file
FROM task_executions
ORDER BY started_at DESC
LIMIT 1;
```

### In Task Dashboard
Open http://localhost:3005/ (if running)
- View task execution history
- See detailed execution logs
- Click on task to view full details

---

## Troubleshooting

### No tasks executing?
```bash
# Check for approved tasks
python3 test_supabase.py

# Manually check database
psql -h ... -d postgres
SELECT id, title, status, priority FROM tasks WHERE status = 'approved';
```

### Claude Code not found?
```bash
which claude
# Should return: /usr/local/bin/claude (or similar)

# If not installed:
# See https://docs.anthropic.com/claude/docs/claude-cli
```

### Logs not appearing in Supabase?
- Check `SUPABASE_SERVICE_KEY` is set (not anon key!)
- Verify `task_executions` table exists
- Check file permissions on log directory

---

## Next Steps

1. **Create your first task** via dashboard or Python:
   ```python
   from create_test_task import create_task
   create_task(
       title="Test task",
       description="Write a hello world script",
       system="autonomous_agent",
       priority="medium"
   )
   ```

2. **Approve the task** via dashboard or:
   ```bash
   python3 approve_task.py <task-id>
   ```

3. **Run executor:**
   ```bash
   python3 tasks/integration/enhanced_task_executor.py
   ```

4. **Check logs in Supabase:**
   - Open your project at app.supabase.com
   - Go to Table Editor → `task_executions`
   - View the `output_data` JSON for detailed results

---

## Advanced Configuration

### Custom Tool Permissions
Edit `enhanced_task_executor.py` line 191:
```python
'--allowedTools', 'Bash,Read,Write,Edit,Glob,Grep,TodoWrite,WebFetch,WebSearch',
```

### Longer Executions
Increase timeout in task metadata:
```json
{
  "timeout_seconds": 7200  // 2 hours
}
```

### System-Specific Max Turns
Line 257 in enhanced_task_executor.py:
```python
if system == 'asset_generator':
    cmd.extend(['--max-turns', '20'])  # Increase for complex tasks
```

---

**Ready to execute tasks autonomously! 🚀**
