# Auto-Agent Project - Claude Code Context

## Project Overview

This is an **autonomous task management and execution system** built to manage and automate tasks using Claude Code, Supabase, and a React/TypeScript dashboard.

**Core Purpose:** Manage tasks in a queue, approve them, and execute them automatically or manually through Claude Code sessions.

## Tech Stack

- **Backend Database:** Supabase (PostgreSQL with real-time subscriptions)
- **Frontend Dashboard:** React 18 + TypeScript + Vite
- **Task Execution:** Python scripts + Claude Code CLI
- **Automation:** Python scripts, cron jobs, Claude Code hooks

## Project Structure

```
auto-agent/
├── tasks/
│   ├── database/           # Supabase SQL schemas and migrations
│   │   ├── tasks_table.sql
│   │   ├── claude_execution_logs_table.sql
│   │   └── notes_table.sql
│   ├── dashboard/          # React dashboard (port 3000+)
│   │   ├── src/
│   │   │   ├── components/ # React components
│   │   │   ├── lib/        # Service wrappers
│   │   │   └── styles/     # Global CSS
│   │   └── package.json
│   ├── scripts/            # Task execution automation
│   │   ├── execute_next_task.py
│   │   └── execute_tasks_batch.py
│   ├── services/           # Backend services
│   │   ├── task.service.ts
│   │   └── note.service.ts
│   └── types/              # TypeScript type definitions
│       ├── task.types.ts
│       └── note.types.ts
├── .claude/
│   ├── hooks/              # Claude Code hooks
│   │   └── log-execution.py
│   └── settings.json
└── types/                  # Shared type definitions
    └── note.types.ts
```

## Key Features

### 1. Task Management System

**Database:** Supabase table `tasks` with comprehensive task tracking
**Features:**
- Task creation with title, description, priority, status
- Approval workflow (pending_approval → approved → in_progress → completed/failed)
- Priority levels: critical, high, medium, low, backlog
- Task recurrence patterns
- Execution types: Claude sessions, scripts, hybrid
- Dependency tracking (depends_on, blocks)
- Assignee system (system, human_owner, human_third_party)

**Task Statuses:**
- `draft` - Initial creation
- `suggested` - AI-suggested tasks
- `pending_approval` - Awaiting human approval
- `needs_refinement` - Requires changes
- `approved` - Ready for execution
- `paused` - Temporarily stopped
- `in_progress` - Currently executing
- `completed` - Successfully finished
- `failed` - Execution failed
- `cancelled` - Manually cancelled
- `blocked` - Waiting on dependencies

### 2. React Dashboard

**Location:** `tasks/dashboard/`
**Port:** Runs on 3000-3005 (finds available port)
**Start:** `cd tasks/dashboard && npm run dev`

**Views:**
1. **Board (Kanban)** - Default view with status columns
   - 6 columns: Paused, Pending Approval, Approved, In Progress, Completed, Failed
   - Full-width layout with horizontal scroll
   - 400px column width (280px mobile)
   - Real-time updates via Supabase subscriptions
   - Drag-free (click to view details)

2. **Approval Queue** - Tasks pending approval
3. **Execution Queue** - Tasks ready to execute
4. **Notes** - Personal note-taking system

**Key Components:**
- `TaskDashboard.tsx` - Main container
- `KanbanBoard.tsx` - Board view orchestrator
- `KanbanColumn.tsx` - Status columns (300px width)
- `KanbanCard.tsx` - Task cards with priority badges
- `TaskDetail.tsx` - Task details modal with edit and status change
- `TaskForm.tsx` - Create/edit task form
- `NotesPanel.tsx` - Notes management
- `DashboardStats.tsx` - Statistics widgets

**Features:**
- Real-time task updates (Supabase subscriptions)
- Edit tasks (title, description) directly in TaskDetail
- Change task status via dropdown (triggers card movement)
- Filter tasks (only in Approval/Execution views)
- Mobile-responsive design
- Dark theme with animations

### 3. Notes System

**Database:** Supabase table `notes`
**Features:**
- Create notes with optional title
- Mark as processed/unprocessed
- Real-time synchronization
- Tag support (schema ready)
- Search capability (future)

### 4. Claude Code Execution Logging

**Database:** Supabase table `claude_execution_logs`
**Hook:** `.claude/hooks/log-execution.py` (user-prompt-submit)

**What it logs:**
- Session ID and execution context (manual/automated/task_executor)
- Prompts and working directory
- Timing (started_at, completed_at, duration)
- File modifications (created, modified, deleted)
- Git commits (messages, hashes, files changed)
- Token usage and costs
- Task linkage (if executed via task system)

**Setup Required:**
1. Apply SQL migration: `tasks/database/claude_execution_logs_table.sql`
2. Ensure environment variables are set (SUPABASE_URL, SUPABASE_ANON_KEY)
3. Hook is already configured in `~/.claude/settings.json`

### 5. Task Execution Automation

**Scripts:**
- `tasks/scripts/execute_next_task.py` - Execute next approved task
- `tasks/scripts/execute_tasks_batch.py <limit>` - Execute multiple tasks (default: 10)

**Claude Code Skills:**
- `/execute-task` or "execute the next task"
- `/execute-tasks-batch` or "execute all approved tasks"

**Usage:**
```bash
# Single task
python3 tasks/scripts/execute_next_task.py

# Batch (up to 5 tasks)
python3 tasks/scripts/execute_tasks_batch.py 5

# Via Claude
execute the next approved task
execute all approved tasks
```

## Database Setup

### Supabase Configuration

**Project URL:** `https://vsyhhgkfjwkjubvsdqjw.supabase.co`
**Anon Key:** Set in environment variables

### Required Migrations

Apply these SQL files via Supabase dashboard (SQL Editor):

1. ✅ `tasks/database/tasks_table.sql` - Main tasks table (APPLIED)
2. ⏳ `tasks/database/claude_execution_logs_table.sql` - Execution logging (NEEDS MANUAL APPLICATION)
3. ⏳ `tasks/database/notes_table.sql` - Notes system (NEEDS MANUAL APPLICATION)

**To apply:**
1. Go to: https://app.supabase.com/project/vsyhhgkfjwkjubvsdqjw/sql
2. Copy SQL file contents
3. Paste and run

### Environment Variables

**Location:** `~/.zshrc` (already configured)

```bash
export SUPABASE_URL="https://vsyhhgkfjwkjubvsdqjw.supabase.co"
export SUPABASE_ANON_KEY="eyJhbGci..."
```

**Dashboard .env:** `tasks/dashboard/.env`
```bash
VITE_SUPABASE_URL=https://vsyhhgkfjwkjubvsdqjw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

## Common Operations

### Start the Dashboard

```bash
cd /Users/outsmart104/Documents/Projects/Personal/auto-agent/tasks/dashboard
npm run dev
# Opens on http://localhost:3000 (or next available port)
```

### Create a Task

**Via Dashboard:**
1. Click "+ New Task" button (top-right header)
2. Fill in title, description, priority, etc.
3. Submit

**Via Python:**
```python
from supabase import create_client
import os

supabase = create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_ANON_KEY'])

supabase.table('tasks').insert({
    'title': 'Task title',
    'description': 'Task description',
    'priority': 'medium',
    'status': 'pending_approval',
    'system': 'autonomous_agent'
}).execute()
```

### Approve and Execute Tasks

1. **Dashboard:** Click task → "Approve" button
2. **Status Dropdown:** Change status to "approved"
3. **Execute:**
   ```bash
   python3 tasks/scripts/execute_next_task.py
   ```
   Or ask Claude: "execute the next approved task"

### Change Task Status

**Via Dashboard:**
1. Click on any task card
2. Use "Change Status" dropdown
3. Card automatically moves to new column

**Via Code:**
```python
supabase.table('tasks').update({'status': 'completed'}).eq('id', task_id).execute()
```

### Edit Task

**Via Dashboard:**
1. Click on task card
2. Click "✎ Edit" button
3. Modify title/description
4. Click "✓ Save"

## Important File Locations

### Configuration Files

- `~/.claude/settings.json` - Claude Code settings with hooks
- `~/.zshrc` - Environment variables
- `tasks/dashboard/.env` - Dashboard environment config
- `tasks/dashboard/vite.config.ts` - Vite configuration

### Service Files (Task Operations)

- `tasks/services/task.service.ts` - Main task service (CRUD, approve, reject, status updates)
- `tasks/dashboard/src/lib/taskService.ts` - Browser-compatible wrapper

### Critical Note About Singleton Export

**⚠️ IMPORTANT:** `tasks/services/task.service.ts` line 844-845 are commented out:
```typescript
// Export singleton instance
// NOTE: Commented out for browser usage - each context should create its own instance
// export const taskService = new TaskService();
```

**Reason:** This singleton was causing browser failures because `process.env` is empty in browser. Each context (browser dashboard, Node scripts, etc.) creates its own instance with appropriate credentials.

## Recent Session Summary (2025-12-30)

### Tasks Completed

1. **Claude Code Logging System**
   - Created SQL schema and hook script
   - Configured user-prompt-submit hook
   - Logs all Claude sessions to Supabase

2. **Note System**
   - Full CRUD operations
   - Processed/unprocessed status tracking
   - Integrated into dashboard

3. **Kanban Board**
   - Visual task board with 6 status columns
   - Real-time updates
   - Full-width layout with horizontal scroll
   - 400px columns (adjustable)

4. **Task Execution Scripts**
   - Single task execution
   - Batch execution with limits
   - Claude Code skills integration

5. **Task Status Updates**
   - Status dropdown in TaskDetail
   - Real-time kanban card movement
   - Support for all status types

6. **Task Editing**
   - Edit mode in TaskDetail
   - Title and description editing
   - Save/cancel functionality

### Design Updates

- Moved view tabs into header
- Added filter button to header (approval/execution views only)
- Full-width kanban board
- Fixed 400px column width with horizontal scroll
- Paused column moved to first position

## Known Issues

1. **Supabase Service Key Encoding Error**
   - Service key has non-ASCII characters (Bengali: িতপ)
   - Currently using ANON_KEY as workaround
   - May need to regenerate service key

2. **Migration Needed**
   - `claude_execution_logs` table not yet created in Supabase
   - `notes` table not yet created in Supabase
   - Apply migrations manually via Supabase SQL editor

3. **Task Execution**
   - Scripts mark tasks as in_progress but don't auto-execute
   - Requires manual Claude invocation or integration
   - Future: Full automation with Claude Code API

## Tips for Future Sessions

1. **Dashboard Blank?**
   - Check `.env` file has correct VITE_* prefixed variables
   - Check browser console for errors
   - Ensure Supabase credentials are valid

2. **Real-time Not Working?**
   - Verify Supabase real-time is enabled for tables
   - Check browser console for subscription errors

3. **Task Not Moving Columns?**
   - Real-time subscriptions should handle this automatically
   - Check KanbanBoard subscription setup
   - Verify task status was actually updated in database

4. **Edit/Status Change Not Working?**
   - Ensure `updateTaskStatus()` method exists in task.service.ts
   - Check TaskDetail component for errors
   - Verify Supabase permissions allow updates

## Development Workflow

1. **New Feature Request:**
   - Create task in dashboard or directly in Supabase
   - Set priority and status to pending_approval
   - Approve when ready

2. **Execute Task:**
   - Use dashboard approval button
   - Or run: `python3 tasks/scripts/execute_next_task.py`
   - Or ask Claude: "execute the next approved task"

3. **Monitor Progress:**
   - Dashboard shows real-time status
   - Check execution logs in Supabase (when logging table is created)
   - View task history and metadata

## Quick Reference Commands

```bash
# Start dashboard
cd tasks/dashboard && npm run dev

# Execute next task
python3 tasks/scripts/execute_next_task.py

# Execute multiple tasks
python3 tasks/scripts/execute_tasks_batch.py 10

# Check approved tasks
python3 -c "from supabase import create_client; import os; s=create_client(os.environ['SUPABASE_URL'],os.environ['SUPABASE_ANON_KEY']); print(len(s.table('tasks').select('id').eq('status','approved').execute().data), 'approved')"

# Apply SQL migration (via Supabase dashboard)
# https://app.supabase.com/project/vsyhhgkfjwkjubvsdqjw/sql
```

## Architecture Notes

### Real-time System
- Supabase handles real-time via WebSocket subscriptions
- Dashboard subscribes on mount, unsubscribes on unmount
- All INSERT/UPDATE/DELETE events trigger UI updates
- No manual polling needed

### Task Execution Flow
1. Task created → status: `pending_approval`
2. Human approves → status: `approved`
3. Script/automation marks → status: `in_progress`
4. Execution happens (Claude Code)
5. On completion → status: `completed` or `failed`

### Browser vs Node Compatibility
- Browser uses `import.meta.env.VITE_*` variables
- Node uses `process.env.*` variables
- Services must be instantiated per-context (no singleton exports)

## Contact/Reference

- **Dashboard Port:** 3000-3005
- **Supabase Dashboard:** https://app.supabase.com/project/vsyhhgkfjwkjubvsdqjw
- **Project Path:** `/Users/outsmart104/Documents/Projects/Personal/auto-agent`
- **Git Branch:** main (clean working tree as of 2025-12-30)
