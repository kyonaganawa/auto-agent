#!/usr/bin/env python3
"""
Test Supabase Connection
Quick test script to verify Supabase is configured correctly
"""
import os
import sys

# Check if supabase package is installed
try:
    from supabase import create_client
except ImportError:
    print("❌ Error: supabase package not installed")
    print("\nInstall with:")
    print("  pip install supabase")
    print("  or")
    print("  pip3 install supabase")
    sys.exit(1)

def test_connection():
    """Test Supabase connection and database access"""

    # Get credentials from environment
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_SERVICE_KEY')

    # Validate credentials
    if not supabase_url:
        print("❌ SUPABASE_URL environment variable not set!")
        print("\nSet it with:")
        print('  export SUPABASE_URL="https://your-project.supabase.co"')
        print("\nOr add to ~/.zshrc or ~/.bashrc")
        return False

    if not supabase_key:
        print("❌ SUPABASE_SERVICE_KEY environment variable not set!")
        print("\nSet it with:")
        print('  export SUPABASE_SERVICE_KEY="your-service-role-key"')
        print("\nOr add to ~/.zshrc or ~/.bashrc")
        return False

    print("=" * 60)
    print("SUPABASE CONNECTION TEST")
    print("=" * 60)
    print(f"\nURL: {supabase_url}")
    print(f"Key: {supabase_key[:20]}...{supabase_key[-20:]}")
    print()

    try:
        # Create client
        print("Connecting to Supabase...")
        supabase = create_client(supabase_url, supabase_key)
        print("✅ Client created successfully")

        # Test basic query
        print("\nTesting database access...")
        response = supabase.table('tasks').select('*').limit(5).execute()
        print(f"✅ Connection successful!")
        print(f"✅ Found {len(response.data)} tasks in database")

        # Test all tables
        print("\n" + "=" * 60)
        print("TABLE ACCESS TEST")
        print("=" * 60)

        tables = [
            'tasks',
            'task_templates',
            'task_executions',
            'task_comments',
            'task_approval_rules'
        ]

        all_success = True
        for table in tables:
            try:
                result = supabase.table(table).select('*', count='exact').limit(0).execute()
                print(f"  ✅ {table:25} {result.count:4} rows")
            except Exception as e:
                print(f"  ❌ {table:25} Error: {e}")
                all_success = False

        # Summary
        print("\n" + "=" * 60)
        if all_success:
            print("✅ ALL TESTS PASSED")
            print("=" * 60)
            print("\nYour Supabase database is configured correctly!")
            print("\nNext steps:")
            print("  1. Create your first task:")
            print("     python3 create_test_task.py")
            print("\n  2. Start the task executor:")
            print("     python3 tasks/integration/task_executor.py")
            print("\n  3. Start the dashboard:")
            print("     cd tasks/dashboard && npm run dev")
            return True
        else:
            print("⚠️  SOME TESTS FAILED")
            print("=" * 60)
            print("\nSome tables are missing. Did you run the migrations?")
            print("\nRun migrations with:")
            print("  supabase db push --file tasks/database/schema.sql")
            print("  supabase db push --file tasks/database/migration_001_execution_type.sql")
            print("  supabase db push --file tasks/database/migration_002_paused_suggested_assignee.sql")
            print("\nOr use the SQL Editor in Supabase dashboard")
            print("See: tasks/docs/SUPABASE_SETUP.md")
            return False

    except Exception as e:
        print(f"\n❌ Connection failed!")
        print(f"\nError: {e}")
        print("\nTroubleshooting:")
        print("  1. Verify your SUPABASE_URL is correct")
        print("  2. Verify your SUPABASE_SERVICE_KEY is correct")
        print("  3. Check your project isn't paused (free tier pauses after 1 week inactivity)")
        print("  4. Ensure you ran the database migrations")
        print("\nSee: tasks/docs/SUPABASE_SETUP.md")
        return False

if __name__ == '__main__':
    success = test_connection()
    sys.exit(0 if success else 1)
