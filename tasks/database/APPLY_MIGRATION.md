# Apply Claude Execution Logs Migration

## Quick Steps

1. Go to Supabase SQL Editor:
   https://app.supabase.com/project/vsyhhgkfjwkjubvsdqjw/sql

2. Copy the contents of `claude_execution_logs_table.sql`

3. Paste and run in the SQL editor

4. Verify the table was created by checking the Table Editor

## Alternative: Use psql CLI

```bash
# Get your connection string from Supabase dashboard
# Project Settings > Database > Connection string

psql "postgresql://postgres:[PASSWORD]@db.vsyhhgkfjwkjubvsdqjw.supabase.co:5432/postgres" \
  < tasks/database/claude_execution_logs_table.sql
```

## Verification

After running the migration, verify with:

```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'claude_execution_logs'
);
```

Should return `true`.
