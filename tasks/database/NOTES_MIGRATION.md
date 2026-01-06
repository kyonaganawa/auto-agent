# Notes Table Migration Guide

## Apply the Migration

### Option 1: Supabase Dashboard (Recommended)

1. Go to Supabase SQL Editor:
   https://app.supabase.com/project/vsyhhgkfjwkjubvsdqjw/sql

2. Open `tasks/database/notes_table.sql`

3. Copy the entire contents

4. Paste into the SQL Editor

5. Click "Run" to create the table

### Option 2: Command Line

```bash
# Using psql (get connection string from Supabase dashboard)
psql "postgresql://postgres:[PASSWORD]@db.vsyhhgkfjwkjubvsdqjw.supabase.co:5432/postgres" \
  < tasks/database/notes_table.sql
```

## Verify Migration

After running the migration, verify the table was created:

```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'notes'
);
```

Should return `true`.

## Test the Notes System

1. Start the dashboard:
   ```bash
   cd tasks/dashboard
   npm run dev
   ```

2. Navigate to localhost:3000 (or whatever port it's running on)

3. Click on the "Notes" tab

4. Click "+ New Note" to create a note

5. Test the following:
   - Creating notes with titles and content
   - Marking notes as processed/unprocessed
   - Filtering by status
   - Deleting notes
   - Real-time updates (open in multiple tabs)

## Table Structure

The `notes` table includes:

- `id` - UUID primary key
- `title` - Optional note title
- `content` - Note text content (required)
- `status` - 'unprocessed' or 'processed'
- `tags` - Array of tags for categorization
- `metadata` - JSONB for additional custom data
- `created_at` - Timestamp when note was created
- `updated_at` - Timestamp when note was last updated
- `processed_at` - Timestamp when note was marked as processed

## Features

- **Status Tracking**: Mark notes as processed or unprocessed
- **Real-time Updates**: Changes sync across all connected clients
- **Filtering**: Filter notes by status
- **Timestamps**: Automatic tracking of creation, update, and processing times
- **Tags**: Support for categorizing notes with tags (future enhancement)
- **Search**: Full-text search across title and content (future enhancement)
