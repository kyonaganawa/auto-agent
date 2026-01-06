# Task Execution Scripts

Automated scripts for executing tasks from the auto-agent task management system.

## Scripts

### 1. execute_next_task.py

Executes the next approved task from the queue.

**Location:** `tasks/scripts/execute_next_task.py`

**Usage:**
```bash
python3 tasks/scripts/execute_next_task.py
```

**What it does:**
1. Queries Supabase for the next approved task (highest priority, oldest first)
2. Marks the task as "in_progress"
3. Displays task details
4. Outputs task information for execution

**Output:**
- Task details (ID, title, description, prompt)
- JSON format for automated consumption
- Execution instructions

### 2. execute_tasks_batch.py

Executes multiple approved tasks in sequence until queue is empty or limit reached.

**Location:** `tasks/scripts/execute_tasks_batch.py`

**Usage:**
```bash
# Execute up to 10 tasks (default)
python3 tasks/scripts/execute_tasks_batch.py

# Execute up to 5 tasks
python3 tasks/scripts/execute_tasks_batch.py 5

# Execute unlimited tasks (use large number)
python3 tasks/scripts/execute_tasks_batch.py 999
```

**What it does:**
1. Queries Supabase for all approved tasks
2. Executes them in sequence (priority and creation date order)
3. Marks each task as "in_progress"
4. Continues until queue is empty or limit reached
5. Reports execution summary

**Parameters:**
- `limit` (optional): Maximum number of tasks to execute (default: 10)

## Claude Code Skills (Slash Commands)

### /execute-task

Executes the next approved task.

**Usage:**
```
/execute-task
```

or simply ask Claude:
```
execute the next task
```

**What happens:**
1. Runs execute_next_task.py
2. Retrieves task details
3. Executes the task
4. Updates task status

### /execute-tasks-batch

Executes multiple tasks in batch.

**Usage:**
```
/execute-tasks-batch
```

or ask Claude:
```
execute all approved tasks
execute the next 5 tasks
run tasks until queue is empty
```

**What happens:**
1. Runs execute_tasks_batch.py with appropriate limit
2. Executes tasks sequentially
3. Reports progress and completion

## Environment Setup

### Required Environment Variables

Add to your shell profile (`~/.zshrc`, `~/.bashrc`, etc.):

```bash
export SUPABASE_URL="https://vsyhhgkfjwkjubvsdqjw.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key-here"
```

### Required Dependencies

```bash
pip3 install supabase
```

## Integration with Task Management System

These scripts integrate with the Supabase task management database:

**Task Status Flow:**
1. **approved** → Scripts query for these tasks
2. **in_progress** → Scripts mark tasks before execution
3. **completed** → Tasks marked after successful execution
4. **failed** → Tasks marked if execution fails

**Task Selection:**
- Ordered by priority (critical > high > medium > low > backlog)
- Within same priority, ordered by creation date (oldest first)

## Automation Examples

### Cron Job for Automatic Execution

Execute tasks every hour:
```bash
# Edit crontab
crontab -e

# Add this line:
0 * * * * cd /Users/outsmart104/Documents/Projects/Personal/auto-agent && python3 tasks/scripts/execute_tasks_batch.py 5 >> /tmp/auto-agent-tasks.log 2>&1
```

### Manual Batch Execution

Execute all pending tasks:
```bash
cd /Users/outsmart104/Documents/Projects/Personal/auto-agent
python3 tasks/scripts/execute_tasks_batch.py 50
```

### Integration with CI/CD

```yaml
# Example GitHub Actions workflow
name: Execute Approved Tasks

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours

jobs:
  execute-tasks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      - name: Install dependencies
        run: pip install supabase
      - name: Execute tasks
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
        run: python3 tasks/scripts/execute_tasks_batch.py 10
```

## Troubleshooting

### Error: Supabase credentials not found

**Solution:** Set environment variables:
```bash
export SUPABASE_URL="https://vsyhhgkfjwkjubvsdqjw.supabase.co"
export SUPABASE_ANON_KEY="your-key"
```

### Error: supabase-py not installed

**Solution:** Install the package:
```bash
pip3 install supabase
```

### No approved tasks found

This is normal - it means the approval queue is empty. Tasks need to be:
1. Created in the task system
2. Approved (status changed to "approved")

### Tasks not executing automatically

The scripts mark tasks as "in_progress" but don't execute them automatically. For full automation, you need to integrate with Claude Code or another execution system.

## Future Enhancements

- [ ] Automatic Claude Code integration for execution
- [ ] Webhook support for task completion notifications
- [ ] Parallel task execution for independent tasks
- [ ] Task dependency resolution
- [ ] Retry logic for failed tasks
- [ ] Execution time tracking and metrics
- [ ] Task priority boosting based on age
- [ ] Smart scheduling based on task type
