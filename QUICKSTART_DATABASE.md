# Quick Start: Fix Database Setup

You encountered an error because the migrations need to be run in a specific order. Here's the **easiest way** to set up your database:

## Option 1: Use Single Setup File (Recommended)

I've created a single file that combines all migrations in the correct order.

### Step 1: Reset Your Database (if you tried migrations already)

In Supabase SQL Editor, run:

```bash
# Via Supabase CLI
supabase db push --file tasks/database/reset_database.sql
```

**OR** copy/paste the contents of `tasks/database/reset_database.sql` into the SQL Editor.

### Step 2: Run Complete Setup

```bash
# Via Supabase CLI
supabase db push --file tasks/database/setup_database.sql
```

**OR** copy/paste the contents of `tasks/database/setup_database.sql` into the SQL Editor.

That's it! One file, everything configured.

---

## Option 2: Run Migrations Individually (Manual)

If you prefer to run each migration separately:

### Step 1: Run Schema First

```bash
supabase db push --file tasks/database/schema.sql
```

**OR** copy/paste `tasks/database/schema.sql` into SQL Editor.

### Step 2: Run Migration 001

```bash
supabase db push --file tasks/database/migration_001_execution_type.sql
```

**OR** copy/paste `tasks/database/migration_001_execution_type.sql` into SQL Editor.

### Step 3: Run Migration 002

```bash
supabase db push --file tasks/database/migration_002_paused_suggested_assignee.sql
```

**OR** copy/paste `tasks/database/migration_002_paused_suggested_assignee.sql` into SQL Editor.

---

## Verify Setup

After running migrations, test your connection:

```bash
python3 test_supabase.py
```

**Expected output:**
```
============================================================
SUPABASE CONNECTION TEST
============================================================

✅ Connection successful!
✅ Found 0 tasks in database

============================================================
TABLE ACCESS TEST
============================================================
  ✅ tasks                          0 rows
  ✅ task_templates                 3 rows
  ✅ task_executions                0 rows
  ✅ task_comments                  0 rows
  ✅ task_approval_rules            1 rows

============================================================
✅ ALL TESTS PASSED
============================================================
```

---

## What Was Fixed

The error you encountered:
```
ERROR: column "metadata" of relation "task_templates" does not exist
```

**Cause:** The `schema.sql` file was missing the `metadata` column that `migration_001` expected.

**Fix:**
- Added `metadata JSONB` column to `task_templates` table in `schema.sql`
- Created `setup_database.sql` that combines everything in the correct order
- Created `reset_database.sql` for clean reinstalls

---

## Next Steps

Once database is set up:

1. **Test connection:**
   ```bash
   python3 test_supabase.py
   ```

2. **Create test task:**
   ```bash
   python3 create_test_task.py
   ```

3. **Approve task:**
   ```bash
   python3 approve_task.py <task-id-from-previous-step>
   ```

4. **Execute task:**
   ```bash
   python3 tasks/integration/task_executor.py
   ```

5. **Start dashboard:**
   ```bash
   cd tasks/dashboard && npm run dev
   ```

---

## Troubleshooting

### If you still get errors:

1. **Make sure you reset first** if you ran migrations partially:
   ```bash
   supabase db push --file tasks/database/reset_database.sql
   ```

2. **Then run setup:**
   ```bash
   supabase db push --file tasks/database/setup_database.sql
   ```

3. **Check environment variables are set:**
   ```bash
   echo $SUPABASE_URL
   echo $SUPABASE_SERVICE_KEY
   ```

### If Supabase CLI isn't working:

Use the **SQL Editor** in your Supabase dashboard:
1. Go to https://app.supabase.com
2. Open your project
3. Click "SQL Editor" in sidebar
4. Click "New Query"
5. Copy/paste the entire contents of `setup_database.sql`
6. Click "Run" (or Cmd/Ctrl + Enter)

---

## Quick Command Reference

```bash
# Reset database (⚠️  deletes all data)
supabase db push --file tasks/database/reset_database.sql

# Setup database (run after reset, or on fresh project)
supabase db push --file tasks/database/setup_database.sql

# Test connection
python3 test_supabase.py

# Create test task
python3 create_test_task.py

# Approve task
python3 approve_task.py <task-id>

# Execute tasks
python3 tasks/integration/task_executor.py

# Execute continuously
python3 tasks/integration/task_executor.py --continuous --interval 60

# Start dashboard
cd tasks/dashboard && npm run dev
```

---

**For complete setup instructions, see:** [tasks/docs/SUPABASE_SETUP.md](tasks/docs/SUPABASE_SETUP.md)
