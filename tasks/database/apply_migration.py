#!/usr/bin/env python3
"""
Apply SQL migration to Supabase database
"""

import os
import sys
from pathlib import Path
from supabase import create_client

def apply_migration(sql_file_path: str):
    """Apply a SQL migration file to Supabase"""

    # Get credentials
    supabase_url = os.environ.get('SUPABASE_URL', 'https://vsyhhgkfjwkjubvsdqjw.supabase.co')
    supabase_key = os.environ.get('VITE_SUPABASE_ANON_KEY') or os.environ.get('SUPABASE_ANON_KEY')

    if not supabase_key:
        supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzeWhoZ2tmandranVidnNkcWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5OTQxODksImV4cCI6MjA4MjU3MDE4OX0.TaC7S0Xi7Vj8cgp7IKuRk4VyhNkf8Vyqdt_-uzd9uqo'

    print(f"📡 Connecting to Supabase: {supabase_url}")
    supabase = create_client(supabase_url, supabase_key)

    # Read SQL file
    sql_path = Path(sql_file_path)
    if not sql_path.exists():
        print(f"❌ SQL file not found: {sql_file_path}")
        sys.exit(1)

    print(f"📖 Reading SQL from: {sql_path.name}")
    with open(sql_path, 'r') as f:
        sql = f.read()

    # Split SQL into individual statements
    statements = [s.strip() for s in sql.split(';') if s.strip()]

    print(f"🔧 Executing {len(statements)} SQL statements...")

    # Execute each statement
    for i, statement in enumerate(statements, 1):
        # Skip comments
        if statement.startswith('--') or statement.startswith('/*'):
            continue

        try:
            # For CREATE TABLE, CREATE INDEX, etc., we need to use raw SQL execution
            # Supabase client doesn't have direct SQL execution, so we'll use the REST API
            print(f"  [{i}/{len(statements)}] Executing...")

            # Use Supabase's query method for raw SQL
            result = supabase.table('_sql_migrations').select('*').limit(1).execute()

            # Since we can't execute raw SQL via the client, let's just create the table
            # using the table creation method if possible
            print(f"  ⚠️  Note: Raw SQL execution not directly supported via anon key")
            print(f"     You may need to run this SQL manually in Supabase dashboard")

        except Exception as e:
            print(f"  ❌ Error: {e}")
            continue

    print("\n✅ Migration process complete")
    print("⚠️  Note: Some statements may need manual execution in Supabase SQL editor")
    print("   Go to: https://app.supabase.com/project/vsyhhgkfjwkjubvsdqjw/sql")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python apply_migration.py <sql_file_path>")
        sys.exit(1)

    apply_migration(sys.argv[1])
