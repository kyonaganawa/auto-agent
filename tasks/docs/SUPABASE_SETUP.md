# Supabase Setup Guide

Complete guide to set up Supabase for the Auto-Agent Task System.

## Table of Contents

1. [Create Supabase Account](#1-create-supabase-account)
2. [Create New Project](#2-create-new-project)
3. [Get Your Credentials](#3-get-your-credentials)
4. [Install Supabase CLI (Optional but Recommended)](#4-install-supabase-cli-optional-but-recommended)
5. [Run Database Migrations](#5-run-database-migrations)
6. [Set Up Environment Variables](#6-set-up-environment-variables)
7. [Test Connection](#7-test-connection)
8. [Configure Row Level Security](#8-configure-row-level-security)
9. [Next Steps](#9-next-steps)

---

## 1. Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign Up"**
3. Sign up with:
   - GitHub (recommended)
   - Google
   - Email/password

**Free tier includes:**
- 500 MB database space
- 1 GB file storage
- 2 GB bandwidth
- Unlimited API requests
- Perfect for development and small projects

---

## 2. Create New Project

1. After signing in, click **"New Project"**

2. Fill in project details:
   - **Name**: `auto-agent-tasks` (or your preferred name)
   - **Database Password**: Generate a strong password (SAVE THIS!)
   - **Region**: Choose closest to you (e.g., `us-east-1`, `eu-west-1`)
   - **Pricing Plan**: Free (or Pro if you prefer)

3. Click **"Create new project"**

4. Wait 2-3 minutes for project to provision

---

## 3. Get Your Credentials

Once your project is ready, you'll need three credentials:

### Step 1: Get Project URL

1. In your project dashboard, click **"Settings"** (gear icon in sidebar)
2. Click **"API"**
3. Find **"Project URL"**
   ```
   Example: https://abcdefghijklmnop.supabase.co
   ```
4. **Copy this URL** - you'll need it later

### Step 2: Get API Keys

In the same **Settings > API** page:

1. **anon / public key**:
   - Used for frontend/client applications
   - Safe to expose in browser
   - Copy the `anon` `public` key

2. **service_role / secret key**:
   - Used for backend/server operations
   - **NEVER expose in client code**
   - Has full admin access
   - Copy the `service_role` `secret` key

### Step 3: Save Your Credentials

Create a temporary note with your credentials:

```
PROJECT_URL: https://your-project.supabase.co
ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SERVICE_ROLE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_PASSWORD: (the password you set earlier)
```

---

## 4. Install Supabase CLI (Optional but Recommended)

The CLI makes it easier to run migrations and manage your database.

### macOS (Homebrew)
```bash
brew install supabase/tap/supabase
```

### macOS/Linux (Manual)
```bash
curl -fsSL https://raw.githubusercontent.com/supabase/cli/main/install.sh | sh
```

### Windows (Scoop)
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Verify Installation
```bash
supabase --version
```

---

## 5. Run Database Migrations

You have two options: use the CLI (recommended) or SQL Editor.

### Option A: Using Supabase CLI (Recommended)

#### 1. Login to Supabase
```bash
supabase login
```
- This will open a browser window
- Click **"Authorize"** to connect CLI to your account

#### 2. Link Your Project
```bash
cd /Users/outsmart104/Documents/Projects/Personal/auto-agent
supabase link --project-ref YOUR_PROJECT_REF
```

**To find your project ref:**
- Go to your Supabase dashboard
- Settings > General
- Find **"Reference ID"** (looks like: `abcdefghijklmnop`)

**When prompted for database password:** Enter the password you set when creating the project.

#### 3. Run Migrations
```bash
# Run initial schema
supabase db push --file tasks/database/schema.sql

# Run migration 001 (execution types)
supabase db push --file tasks/database/migration_001_execution_type.sql

# Run migration 002 (paused/suggested/assignee)
supabase db push --file tasks/database/migration_002_paused_suggested_assignee.sql
```

**Alternative: Run all at once**
```bash
cd tasks/database

# Combine migrations into one file temporarily
cat schema.sql migration_001_execution_type.sql migration_002_paused_suggested_assignee.sql > combined_migration.sql

# Run combined migration
supabase db push --file combined_migration.sql

# Clean up
rm combined_migration.sql
```

---

### Option B: Using SQL Editor (If CLI not available)

#### 1. Open SQL Editor
1. Go to your Supabase dashboard
2. Click **"SQL Editor"** in the sidebar (or find it under "Database")
3. Click **"New Query"**

#### 2. Run Schema Migration
1. Open `tasks/database/schema.sql` in your local editor
2. Copy the **entire contents**
3. Paste into Supabase SQL Editor
4. Click **"Run"** (or press Cmd/Ctrl + Enter)
5. Wait for success message

#### 3. Run Migration 001
1. Open `tasks/database/migration_001_execution_type.sql`
2. Copy entire contents
3. Paste into SQL Editor
4. Click **"Run"**

#### 4. Run Migration 002
1. Open `tasks/database/migration_002_paused_suggested_assignee.sql`
2. Copy entire contents
3. Paste into SQL Editor
4. Click **"Run"**

#### 5. Verify Tables Created
In SQL Editor, run:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see:
- `task_approval_rules`
- `task_comments`
- `task_executions`
- `task_templates`
- `tasks`

---

## 6. Set Up Environment Variables

### For Task Executor (Python)

Create a `.env` file in the project root:

```bash
cd /Users/outsmart104/Documents/Projects/Personal/auto-agent
touch .env
```

Add your credentials to `.env`:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-anon-key...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-service-key...
```

**⚠️ IMPORTANT:** Add `.env` to `.gitignore` to prevent committing secrets:

```bash
echo ".env" >> .gitignore
```

### Load Environment Variables

Add to your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
# Auto-Agent Environment
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"
export SUPABASE_SERVICE_KEY="your-service-key"
```

Then reload:
```bash
source ~/.zshrc  # or ~/.bashrc
```

### For Dashboard (React)

Create `.env` in the dashboard directory:

```bash
cd tasks/dashboard
touch .env
```

Add:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Note:** Use `VITE_` prefix for Vite to expose variables to browser.

---

## 7. Test Connection

### Test Python Executor

Create a test script:

```bash
cd /Users/outsmart104/Documents/Projects/Personal/auto-agent
```

Create `test_supabase.py`:

```python
#!/usr/bin/env python3
"""Test Supabase connection"""
import os
from supabase import create_client

# Load from environment
supabase_url = os.environ.get('SUPABASE_URL')
supabase_key = os.environ.get('SUPABASE_SERVICE_KEY')

if not supabase_url or not supabase_key:
    print("❌ Environment variables not set!")
    print("Please set SUPABASE_URL and SUPABASE_SERVICE_KEY")
    exit(1)

print(f"Testing connection to: {supabase_url}")

try:
    # Create client
    supabase = create_client(supabase_url, supabase_key)

    # Test query
    response = supabase.table('tasks').select('*').limit(5).execute()

    print(f"✅ Connection successful!")
    print(f"✅ Found {len(response.data)} tasks in database")

    # List tables
    print("\nTesting table access:")
    tables = ['tasks', 'task_templates', 'task_executions', 'task_comments', 'task_approval_rules']
    for table in tables:
        try:
            count = supabase.table(table).select('*', count='exact').limit(0).execute()
            print(f"  ✅ {table}: {count.count} rows")
        except Exception as e:
            print(f"  ❌ {table}: {e}")

except Exception as e:
    print(f"❌ Connection failed: {e}")
    exit(1)
```

Run the test:
```bash
chmod +x test_supabase.py
python3 test_supabase.py
```

**Expected output:**
```
Testing connection to: https://your-project.supabase.co
✅ Connection successful!
✅ Found 0 tasks in database

Testing table access:
  ✅ tasks: 0 rows
  ✅ task_templates: 3 rows
  ✅ task_executions: 0 rows
  ✅ task_comments: 0 rows
  ✅ task_approval_rules: 0 rows
```

### Test Dashboard Connection

```bash
cd tasks/dashboard

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open browser to `http://localhost:5173` and check console for errors.

---

## 8. Configure Row Level Security

By default, Supabase has Row Level Security (RLS) **enabled** but no policies, so nothing can be read/written.

### Quick Start: Disable RLS (Development Only)

**⚠️ Only for development! Do NOT use in production!**

In Supabase SQL Editor:

```sql
-- Disable RLS on all tables (DEVELOPMENT ONLY)
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_executions DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_approval_rules DISABLE ROW LEVEL SECURITY;
```

### Production: Enable RLS with Policies

The schema already includes RLS policies. To enable them:

```sql
-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_approval_rules ENABLE ROW LEVEL SECURITY;
```

**Policies included in schema.sql:**
- Users can view all tasks
- Users can create tasks
- Users can update their own tasks
- System/service role can do everything

### Set Up Authentication (Optional)

If you want user authentication:

1. In Supabase dashboard: **Authentication > Providers**
2. Enable providers (Email, Google, GitHub, etc.)
3. Configure redirect URLs
4. Update dashboard to use Supabase Auth

---

## 9. Next Steps

Now that Supabase is configured:

### 1. Create Your First Task

Using the test script:

```python
#!/usr/bin/env python3
"""Create a test task"""
import os
from supabase import create_client

supabase = create_client(
    os.environ.get('SUPABASE_URL'),
    os.environ.get('SUPABASE_SERVICE_KEY')
)

# Create a test task
task = supabase.table('tasks').insert({
    'title': 'Test Task - Hello Auto-Agent',
    'description': 'This is my first task in the system!',
    'prompt': 'Echo "Hello from Auto-Agent task system!"',
    'system': 'autonomous_agent',
    'execution_type': 'claude_session',
    'status': 'pending_approval',
    'priority': 'medium',
    'created_by': 'human',
    'assigned_to_type': 'system',
}).execute()

print(f"✅ Created task: {task.data[0]['id']}")
print(f"   Title: {task.data[0]['title']}")
print(f"   Status: {task.data[0]['status']}")
```

### 2. Start the Task Executor

```bash
cd /Users/outsmart104/Documents/Projects/Personal/auto-agent

# Install Python dependencies
pip install supabase

# Run executor once
python3 tasks/integration/task_executor.py

# Or run continuously
python3 tasks/integration/task_executor.py --continuous --interval 60
```

### 3. Start the Dashboard

```bash
cd tasks/dashboard
npm install
npm run dev
```

Open: http://localhost:5173

### 4. Set Up Autonomous Agents

The autonomous agents can now create tasks that get stored in Supabase:

```bash
# Edit autonomous agent script to create tasks instead of just running
# See: scripts/autonomous_run.sh
```

---

## Troubleshooting

### Connection Errors

**Problem:** `Failed to connect to Supabase`

**Solutions:**
1. Verify URL and keys are correct
2. Check environment variables are loaded: `echo $SUPABASE_URL`
3. Ensure project is not paused (free tier pauses after 1 week inactivity)
4. Check firewall/network isn't blocking supabase.co

### Migration Errors

**Problem:** `relation "tasks" already exists`

**Solution:** Migrations were run multiple times. Either:
- Drop and recreate database
- Skip schema.sql and run only migration files

**To reset database:**
```sql
-- ⚠️ WARNING: This deletes ALL data!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

### Permission Errors

**Problem:** `new row violates row-level security policy`

**Solution:**
- Either disable RLS (development)
- Or use SERVICE_ROLE_KEY instead of ANON_KEY
- Or configure proper RLS policies

### Python supabase Package Errors

**Problem:** `ImportError: No module named 'supabase'`

**Solution:**
```bash
pip install supabase
# or
pip3 install supabase
```

---

## Security Best Practices

### ✅ DO:
- Use SERVICE_ROLE_KEY for backend/executor
- Use ANON_KEY for frontend/dashboard
- Add `.env` to `.gitignore`
- Enable RLS in production
- Rotate keys if exposed
- Use separate projects for dev/staging/prod

### ❌ DON'T:
- Commit keys to git
- Share SERVICE_ROLE_KEY publicly
- Use SERVICE_ROLE_KEY in browser
- Disable RLS in production
- Use same project for dev and prod

---

## Quick Reference

### Essential Commands

```bash
# Login to Supabase CLI
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Run migration
supabase db push --file path/to/migration.sql

# Reset database (⚠️ deletes all data)
supabase db reset

# Generate TypeScript types from database
supabase gen types typescript --local > tasks/types/database.types.ts
```

### Essential URLs

- **Dashboard:** https://app.supabase.com
- **Your Project:** https://app.supabase.com/project/YOUR_PROJECT_REF
- **API Docs:** https://app.supabase.com/project/YOUR_PROJECT_REF/api
- **Database:** https://app.supabase.com/project/YOUR_PROJECT_REF/editor
- **SQL Editor:** https://app.supabase.com/project/YOUR_PROJECT_REF/sql

---

## Support

- **Supabase Docs:** https://supabase.com/docs
- **Discord:** https://discord.supabase.com
- **GitHub Issues:** https://github.com/supabase/supabase/issues
- **Task System Docs:** [Main README](../README.md)

---

**Setup complete! You're ready to start using the Auto-Agent Task System with Supabase.** 🚀
