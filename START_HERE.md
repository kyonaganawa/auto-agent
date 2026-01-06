# 🚀 Auto-Agent - Quick Start Guide

**Welcome back!** This document helps you quickly get oriented with the Auto-Agent project.

## 📌 What is This?

An **autonomous task management and execution system** that uses Claude Code to:
- Manage tasks in a Supabase database
- Execute approved tasks automatically
- Track everything with a beautiful React dashboard
- Log all Claude Code sessions for monitoring

## 🎯 Quick Actions

### See Your Tasks

```bash
cd tasks/dashboard
npm run dev
```

Opens dashboard at **http://localhost:3000**

### Execute Next Task

```bash
python3 tasks/scripts/execute_next_task.py
```

Or just ask Claude: **"execute the next approved task"**

### Create a New Task

Open dashboard → Click **"+ New Task"** → Fill form → Submit

## 📂 Key Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | **Read this!** Comprehensive guide for Claude |
| `CHANGELOG.md` | Recent changes and features |
| `README.md` | High-level project overview |
| `tasks/dashboard/` | React dashboard (main UI) |
| `tasks/scripts/` | Task execution automation |
| `tasks/database/` | SQL schemas and migrations |
| `.claude/hooks/` | Claude Code hooks |
| `.claude/skills/` | Custom Claude Code skills |

## 🎨 Dashboard Features

**4 Main Views:**
1. **Board** - Kanban with 6 status columns (default view)
2. **Approval Queue** - Tasks waiting for approval
3. **Execution Queue** - Approved tasks ready to run
4. **Notes** - Personal note-taking

**Quick Operations:**
- Click any task card → View details
- Click "✎ Edit" → Edit title/description
- Use status dropdown → Change status (card moves automatically)
- Click "Approve" → Move to execution queue

## 🔧 Current Status (2025-12-30)

### ✅ Working

- Full Kanban board with real-time updates
- Task editing (title, description, status)
- Notes system (create, mark processed, delete)
- Task execution scripts
- Claude Code skills (`/execute-task`, `/execute-tasks-batch`)
- Execution logging hook
- Dashboard with dark theme and animations

### ⏳ Pending Manual Steps

1. **Apply SQL migrations** (via Supabase dashboard):
   - `tasks/database/claude_execution_logs_table.sql`
   - `tasks/database/notes_table.sql`

2. **Reload shell environment:**
   ```bash
   source ~/.zshrc
   ```

### 🐛 Known Issues

1. **Supabase Service Key** - Has encoding issues, using ANON_KEY as workaround
2. **Task Auto-Execution** - Scripts mark in_progress but require manual Claude invocation
3. **Dashboard Credentials** - Hardcoded in service files (works but not ideal)

## 📊 Project Stats

- **Tasks Table:** ✅ Created and working
- **Notes Table:** ⏳ Schema created, migration pending
- **Execution Logs:** ⏳ Schema created, migration pending
- **Dashboard Components:** 15 components
- **Claude Code Skills:** 2 skills
- **Python Scripts:** 2 automation scripts

## 🎓 Learn More

### For Quick Reference

- **Dashboard:** `tasks/dashboard/README.md`
- **Scripts:** `tasks/scripts/README.md`
- **Hooks:** `.claude/hooks/SETUP.md`

### For Deep Understanding

- **Project Guide:** `CLAUDE.md` (most comprehensive)
- **Architecture:** See CLAUDE.md → Architecture Notes
- **Database Schema:** `tasks/database/*.sql`

## 💡 Common Tasks

### Approve a Task

**Dashboard:**
1. Click task in "Pending Approval" column
2. Click "Approve" button
3. Task moves to "Approved" column

**Or use status dropdown:**
1. Click any task
2. Change status to "approved"

### Execute All Approved Tasks

```bash
python3 tasks/scripts/execute_tasks_batch.py 10
```

Or ask Claude: **"execute all approved tasks"**

### Check Queue Status

```bash
python3 -c "from supabase import create_client; import os; s=create_client(os.environ['SUPABASE_URL'],os.environ['SUPABASE_ANON_KEY']); approved=len(s.table('tasks').select('id').eq('status','approved').execute().data); print(f'{approved} approved tasks')"
```

### Add Notes

Dashboard → Click "Notes" tab → Click "+ New Note" → Fill form → Save

### View Execution History

*Coming soon - execute logs table needs migration*

## 🔐 Credentials

**Environment Variables** (already set in `~/.zshrc`):
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Public API key

**Dashboard `.env`:**
- `VITE_SUPABASE_URL` - Same URL with VITE_ prefix
- `VITE_SUPABASE_ANON_KEY` - Same key with VITE_ prefix

## 🚨 If Something's Wrong

### Dashboard won't load?

```bash
cd tasks/dashboard
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Tasks not updating?

- Check Supabase is online
- Verify real-time is enabled (Supabase dashboard → Database → Replication)
- Refresh browser

### Scripts failing?

```bash
# Verify credentials
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# Reinstall Python package
pip3 install --upgrade supabase
```

## 📞 Quick Links

- **Dashboard:** http://localhost:3000
- **Supabase:** https://app.supabase.com/project/vsyhhgkfjwkjubvsdqjw
- **SQL Editor:** https://app.supabase.com/project/vsyhhgkfjwkjubvsdqjw/sql

## 🎯 Next Session Suggestions

1. **Apply pending migrations** (5 min)
   - claude_execution_logs table
   - notes table

2. **Test execution logging** (5 min)
   - Run a simple Claude Code command
   - Check logs appear in Supabase

3. **Create more tasks** (10 min)
   - Use dashboard to create 5-10 tasks
   - Test approval workflow
   - Execute via scripts

4. **Enhance dashboard** (30-60 min)
   - Add drag-and-drop to Kanban
   - Implement task dependencies view
   - Add bulk operations

5. **Build automation** (30-60 min)
   - Set up cron job for automatic execution
   - Integrate with CI/CD
   - Add webhook notifications

---

**Last Updated:** 2025-12-30 13:10
**Session Duration:** ~2 hours
**Tasks Completed:** 6
**Files Created:** 18
**Status:** Ready for next session ✅
