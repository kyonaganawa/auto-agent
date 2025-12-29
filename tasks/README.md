# Auto-Agent Task System

Complete task management system with Supabase backend, React dashboard, and autonomous execution.

## Overview

The task system provides a comprehensive workflow for creating, approving, and executing tasks across all auto-agent objectives. Tasks can be created by humans or agents, require approval, and execute automatically based on priority and schedule.

### Key Features

✅ **Database-Backed** - PostgreSQL via Supabase with RLS
✅ **Approval Workflow** - Draft → Pending → Approved → Execution
✅ **Priority System** - P0 (Critical) through P4 (Backlog)
✅ **Scheduling** - One-time and recurring tasks
✅ **Multi-System Support** - Different execution systems per task
✅ **Real-Time Dashboard** - React UI with live updates
✅ **Mobile-Friendly** - Responsive design for all devices
✅ **Auto-Approval Rules** - Pattern-based automatic approval
✅ **Execution Tracking** - Complete history and logs
✅ **Template System** - Quick task creation from templates

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    TASK SYSTEM ARCHITECTURE                  │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Dashboard  │      │    Agents    │      │    Scripts   │
│   (React)    │      │ (Autonomous) │      │   (Cron)     │
└──────┬───────┘      └──────┬───────┘      └──────┬───────┘
       │                     │                     │
       └─────────────────────┼─────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Supabase API   │
                    │  (REST/Realtime)│
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   PostgreSQL    │
                    │    Database     │
                    └────────┬────────┘
                             │
       ┌─────────────────────┼─────────────────────┐
       │                     │                     │
  ┌────▼────┐         ┌──────▼──────┐      ┌──────▼──────┐
  │  Tasks  │         │  Executions │      │  Comments   │
  │  Table  │         │   Table     │      │   Table     │
  └─────────┘         └─────────────┘      └─────────────┘
       │                     │                     │
  ┌────▼────────────────────▼─────────────────────▼────┐
  │              Task Executor (Python)                 │
  │         Polls queue & executes via Claude Code      │
  └─────────────────────────────────────────────────────┘
                             │
       ┌─────────────────────┼─────────────────────┐
       │                     │                     │
  ┌────▼────────┐   ┌────────▼────────┐   ┌───────▼──────┐
  │ Autonomous  │   │     Asset       │   │ Professional │
  │    Agent    │   │   Generator     │   │    Agent     │
  └─────────────┘   └─────────────────┘   └──────────────┘
```

## Quick Start

### 1. Set Up Supabase

```bash
# Create new Supabase project at https://supabase.com

# Copy connection details
export SUPABASE_URL="your-project-url"
export SUPABASE_ANON_KEY="your-anon-key"
export SUPABASE_SERVICE_KEY="your-service-key"

# Run database schema
psql -h your-db-host -U postgres -f tasks/database/schema.sql
```

### 2. Install Dependencies

```bash
# Python dependencies (for task executor)
pip install supabase

# Node dependencies (for dashboard)
cd tasks/dashboard
npm install
```

### 3. Start the Dashboard

```bash
cd tasks/dashboard
npm run dev

# Open http://localhost:5173
```

### 4. Start Task Executor

```bash
# One-time execution
python tasks/integration/task_executor.py

# Continuous polling (every 60 seconds)
python tasks/integration/task_executor.py --continuous --interval 60
```

### 5. Create Your First Task

Via Dashboard:
- Click "New Task"
- Fill in title, description, and select system
- Submit for approval
- Approve the task
- Task executes automatically

Via API:
```typescript
import { taskService } from './tasks/services/task.service';

const task = await taskService.createTask({
  title: 'Daily Morning Briefing',
  description: 'Generate morning briefing with priorities',
  system: 'professional',
  priority: 'high',
  recurrence: 'daily',
  scheduled_for: '2025-12-30T09:00:00Z',
});
```

## Task Lifecycle

### State Machine

```
draft → pending_approval → approved → in_progress → completed
           ↓                  ↓
    needs_refinement     cancelled
```

**See [docs/STATE_MACHINE.md](docs/STATE_MACHINE.md) for complete state machine documentation.**

### Workflow Example

1. **Creation**: Agent or human creates task (status: `pending_approval`)
2. **Auto-Approval Check**: Database trigger checks approval rules
3. **Approval**: If no auto-approval, human reviews and approves
4. **Execution**: Task executor polls queue and executes
5. **Completion**: Executor marks task as `completed` or `failed`
6. **Recurrence**: If recurring, new instance is created

## Database Schema

### Main Tables

**tasks** - Core task table
- Identity: id, title, description, prompt
- System: system, custom_system
- Workflow: status, priority, created_by
- Scheduling: recurrence, scheduled_for, deadline
- Dependencies: depends_on, blocks
- Approval: approved_by, refinement_notes
- Execution: started_at, completed_at, error_message
- Metadata: tags, metadata, is_pre_approved

**task_executions** - Execution history
- Tracks each execution attempt
- Duration, tokens used, cost
- Output summary and structured data
- Log file paths

**task_approval_rules** - Auto-approval patterns
- Match criteria (title, system, creator, priority, tags)
- Auto-approval settings
- Safety limits (max cost)

**task_comments** - Discussions
- Comments on tasks
- Refinement feedback
- Approval notes

**task_templates** - Quick creation
- Reusable task templates
- Variable substitution
- Usage tracking

### Views

**v_approval_queue** - Tasks awaiting approval
**v_execution_queue** - Approved tasks ready to run
**v_task_statistics** - Aggregated statistics

**See [database/schema.sql](database/schema.sql) for complete schema.**

## API/Service Layer

### TaskService Class

```typescript
import { taskService } from './services/task.service';

// Create task
const task = await taskService.createTask({
  title: 'Generate gaming content',
  description: 'Create 10 articles for indie-games-hub',
  system: 'asset_generator',
  priority: 'medium',
});

// Get task
const result = await taskService.getTask(taskId);

// Update task
await taskService.updateTask(taskId, {
  priority: 'high',
  scheduled_for: '2025-12-31T10:00:00Z',
});

// Approve task
await taskService.approveTask(taskId, {
  approved_by: userId,
  auto_execute: true,
});

// Query tasks
const tasks = await taskService.queryTasks({
  filters: {
    status: ['approved', 'in_progress'],
    priority: 'high',
    system: 'asset_generator',
  },
  limit: 50,
});

// Real-time subscription
const subscription = taskService.subscribeToTasks((task, event) => {
  console.log(`Task ${event}:`, task);
});
```

**See [services/task.service.ts](services/task.service.ts) for complete API.**

## Dashboard Components

### Main Components

**TaskDashboard** - Main container with tabs and stats
**TaskList** - List view with filtering
**TaskCard** - Individual task card
**TaskDetail** - Full task view with comments
**TaskForm** - Create/edit task form
**DashboardStats** - Statistics cards
**FilterPanel** - Advanced filtering

### Usage

```tsx
import { TaskDashboard } from './components/TaskDashboard';

function App() {
  return <TaskDashboard />;
}
```

**See [dashboard/COMPONENTS.md](dashboard/COMPONENTS.md) for component documentation.**

## Task Executor

### Running the Executor

**One-Time Execution:**
```bash
python tasks/integration/task_executor.py
```

**Continuous Polling:**
```bash
python tasks/integration/task_executor.py --continuous --interval 60
```

**As Cron Job:**
```cron
# Every 5 minutes
*/5 * * * * /path/to/python /path/to/task_executor.py

# Continuous (recommended)
@reboot /path/to/python /path/to/task_executor.py --continuous
```

### How It Works

1. Polls `v_execution_queue` view for approved tasks
2. Selects highest priority task that's ready
3. Marks task as `in_progress`
4. Executes via Claude Code CLI
5. Marks as `completed` or `failed`
6. Creates execution record
7. Repeats

### Execution Systems

**autonomous_agent** → `scripts/autonomous_run.sh`
**asset_generator** → `scripts/asset_generator_agent.sh`
**professional** → `scripts/daily_agent.sh`
**custom** → Custom script path from `custom_system` field

## Auto-Approval Rules

### Creating Rules

Via Dashboard or API:

```typescript
await supabase.from('task_approval_rules').insert({
  name: 'Auto-approve daily briefings',
  title_pattern: 'Daily Briefing.*',
  system: 'professional',
  priority: ['high', 'medium'],
  auto_approve: true,
  enabled: true,
});
```

### Rule Matching

Rules match when **ALL** criteria match:
- Title matches regex pattern (if specified)
- System matches (if specified)
- Creator type matches (if specified)
- Priority in allowed list (if specified)
- Contains all required tags (if specified)
- Doesn't contain excluded tags (if specified)

First matching rule is applied.

### Safety Limits

- `max_cost_usd`: Don't auto-approve if estimated cost exceeds limit
- `require_refinement_if`: SQL condition that forces manual refinement

## Templates

### Using Templates

```typescript
// Get all templates
const { data: templates } = await taskService.getTemplates();

// Create from template
const task = await taskService.createFromTemplate(templateId, {
  date: '2025-12-30',
  website: 'indie-games-hub',
  count: '10',
});
```

### Template Variables

Use `{variable}` syntax in templates:

```
Title: "Daily Briefing - {date}"
Description: "Create briefing for {date} with {priorities} priorities"
```

Variables are replaced at creation time.

## Priority System

| Priority | Code | Weight | Use Case |
|----------|------|--------|----------|
| Critical | P0 | 0 | Urgent fixes, critical issues |
| High | P1 | 1 | Important features, daily tasks |
| Medium | P2 | 2 | Normal development, weekly tasks |
| Low | P3 | 3 | Nice-to-haves, improvements |
| Backlog | P4 | 4 | Future consideration |

Tasks execute in priority order (P0 first, P4 last).

## Scheduling

### One-Time Tasks

```typescript
{
  recurrence: 'once',
  scheduled_for: '2025-12-31T10:00:00Z',  // Execute at specific time
}
```

### Recurring Tasks

```typescript
{
  recurrence: 'daily',  // daily, weekly, monthly, yearly
  scheduled_for: '2025-12-30T09:00:00Z',  // First occurrence
}
```

**Automatic Recurrence:**
- When recurring task completes, new instance is created
- New instance inherits all properties
- Next occurrence calculated automatically
- Parent-child relationship tracked

## Integration with Autonomous Agents

### Agent-Created Tasks

Agents can create tasks via the API:

```python
from supabase import create_client

supabase = create_client(url, key)

task = supabase.table('tasks').insert({
    'title': 'Generate weekly asset report',
    'description': 'Analyze performance of all digital assets',
    'system': 'asset_generator',
    'priority': 'medium',
    'created_by': 'agent_autonomous',
    'created_by_agent': 'autonomous_run',
}).execute()
```

### Execution via Claude Code

Tasks are executed using Claude Code `-p` flag:

```bash
claude -p "Task prompt here" \
  --allowedTools "Bash,Read,Write,Edit" \
  --max-turns 10 \
  --output-format json
```

Output is captured and stored in execution record.

## Monitoring & Analytics

### Dashboard Statistics

- Total tasks
- By status (pending, in_progress, completed, failed)
- By priority
- By system
- Completion rates
- Average execution time

### Execution Logs

All executions logged to `logs/task_executor/`:
- `task_{id}_{timestamp}.log` - Full execution log
- Contains Claude Code output
- Preserved for debugging and analysis

### Real-Time Updates

Dashboard receives real-time updates via Supabase subscriptions:
- New tasks appear instantly
- Status changes update immediately
- Completion notifications in real-time

## Security

### Row Level Security (RLS)

**Enabled on all tables:**
- Users can view all tasks
- Users can create tasks
- Users can update their own tasks
- Service role can manage executions

### Authentication

**Dashboard:**
- Requires Supabase auth
- User ID tracked in `created_by_user_id`

**Task Executor:**
- Uses service role key (backend only)
- Full access to execute and update tasks

### API Keys

**Environment Variables:**
```bash
# Frontend (dashboard)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Backend (executor)
SUPABASE_URL=
SUPABASE_SERVICE_KEY=

# Execution
ANTHROPIC_API_KEY=
```

## Deployment

### Database (Supabase)

1. Create project at https://supabase.com
2. Run `database/schema.sql` in SQL editor
3. Enable Row Level Security
4. Configure auth (if using dashboard auth)

### Dashboard (Netlify/Vercel)

```bash
cd tasks/dashboard
npm run build

# Netlify
netlify deploy --prod --dir=dist

# Vercel
vercel --prod
```

**Environment variables:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Task Executor (Server/Cron)

**Option 1: Systemd Service (Linux)**

```ini
# /etc/systemd/system/task-executor.service
[Unit]
Description=Auto-Agent Task Executor
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/auto-agent
Environment="SUPABASE_URL=..."
Environment="SUPABASE_SERVICE_KEY=..."
Environment="ANTHROPIC_API_KEY=..."
ExecStart=/usr/bin/python3 tasks/integration/task_executor.py --continuous
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable task-executor
sudo systemctl start task-executor
```

**Option 2: Cron Job**

```cron
*/5 * * * * cd /path/to/auto-agent && /usr/bin/python3 tasks/integration/task_executor.py
```

**Option 3: GitHub Actions**

```yaml
# .github/workflows/task-executor.yml
name: Task Executor

on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes

jobs:
  execute:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
      - run: pip install supabase
      - run: python tasks/integration/task_executor.py
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

## Examples

### Example 1: Daily Morning Briefing

```typescript
const task = await taskService.createTask({
  title: 'Daily Morning Briefing',
  description: 'Review calendar, identify priorities, create briefing',
  prompt: 'Generate morning briefing for today with top 3 priorities',
  system: 'professional',
  priority: 'high',
  recurrence: 'daily',
  scheduled_for: '2025-12-30T09:00:00Z',
  tags: ['briefing', 'daily', 'professional'],
});
```

### Example 2: Weekly Asset Generation

```typescript
const task = await taskService.createTask({
  title: 'Generate Gaming Content',
  description: 'Create 10 articles for indie-games-hub website',
  prompt: 'Generate 10 SEO-optimized gaming articles',
  system: 'asset_generator',
  priority: 'medium',
  recurrence: 'weekly',
  scheduled_for: '2025-12-30T10:00:00Z',
  metadata: { website: 'indie-games-hub', article_count: 10 },
  tags: ['content', 'gaming', 'weekly'],
});
```

### Example 3: One-Time Critical Task

```typescript
const task = await taskService.createTask({
  title: 'Fix Production Bug',
  description: 'Critical bug in authentication flow',
  prompt: 'Analyze and fix authentication bug in login.py',
  system: 'autonomous_agent',
  priority: 'critical',
  recurrence: 'once',
  tags: ['bug', 'critical', 'auth'],
});

// Approve immediately
await taskService.approveTask(task.data.id, {
  approved_by: userId,
  auto_execute: true,
});
```

## Troubleshooting

### Tasks Not Executing

**Check task executor is running:**
```bash
ps aux | grep task_executor
```

**Check logs:**
```bash
tail -f logs/task_executor/task_*.log
```

**Check task status in database:**
```sql
SELECT * FROM tasks WHERE status = 'approved' ORDER BY priority DESC;
```

### Dashboard Not Loading Tasks

**Check Supabase connection:**
- Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- Check browser console for errors
- Verify RLS policies allow read access

### Auto-Approval Not Working

**Check approval rules:**
```sql
SELECT * FROM task_approval_rules WHERE enabled = true;
```

**Test rule matching:**
```sql
SELECT check_auto_approval_rules();
```

## Performance

### Scaling Considerations

**Database:**
- Indexes on status, priority, scheduled_for
- Partitioning for large task_executions table
- Archiving completed tasks > 90 days

**Task Executor:**
- Run multiple instances for parallel execution
- Use task locking to prevent duplicate execution
- Implement retry logic with exponential backoff

**Dashboard:**
- Pagination for large task lists
- Virtual scrolling for performance
- Debounced filtering
- Optimistic updates

## Cost Estimation

### Database (Supabase)

Free tier: Up to 500MB database, 2GB bandwidth
Pro tier ($25/month): 8GB database, 100GB bandwidth

### Task Execution (Claude API)

Example costs:
- Simple task (500 tokens): $0.0015
- Medium task (5,000 tokens): $0.015
- Complex task (50,000 tokens): $0.15

**Monthly estimate** (100 tasks/day):
- All simple: $4.50/month
- All medium: $45/month
- All complex: $450/month

### Dashboard Hosting

Netlify/Vercel free tier: $0/month
Custom domain: ~$12/year

## Next Steps

1. **Set up Supabase project**
2. **Deploy database schema**
3. **Configure environment variables**
4. **Start dashboard for task management**
5. **Start task executor for automation**
6. **Create your first task**
7. **Set up auto-approval rules**
8. **Create task templates**
9. **Monitor execution and optimize**

## Support

**Documentation:**
- Database: [database/schema.sql](database/schema.sql)
- State Machine: [docs/STATE_MACHINE.md](docs/STATE_MACHINE.md)
- API: [services/task.service.ts](services/task.service.ts)
- Components: [dashboard/COMPONENTS.md](dashboard/COMPONENTS.md)
- Types: [types/task.types.ts](types/task.types.ts)

**Examples:**
- See `examples/` directory for complete usage examples

---

**Created:** 2025-12-27
**Version:** 1.0.0
**Status:** Production Ready ✅

Your autonomous task management system is ready to use! 🚀
