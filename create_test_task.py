#!/usr/bin/env python3
"""
Create Test Task in Supabase
Creates a simple test task to verify the system is working
"""
import os
import sys
from datetime import datetime, timedelta

try:
    from supabase import create_client
except ImportError:
    print("❌ Error: supabase package not installed")
    print("Install with: pip install supabase")
    sys.exit(1)

def create_test_task():
    """Create a test task in Supabase"""

    # Get credentials
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_SERVICE_KEY')

    if not supabase_url or not supabase_key:
        print("❌ Environment variables not set!")
        print("Please set SUPABASE_URL and SUPABASE_SERVICE_KEY")
        print("See: tasks/docs/SUPABASE_SETUP.md")
        sys.exit(1)

    try:
        # Create client
        supabase = create_client(supabase_url, supabase_key)

        print("=" * 60)
        print("CREATE TEST TASK")
        print("=" * 60)

        # Task data
        task_data = {
            'title': 'Test Task - Hello Auto-Agent',
            'description': '''This is a test task created to verify the Auto-Agent task system is working correctly.

This task demonstrates:
- Task creation via Python
- Claude Code session execution
- System-assigned task (automated execution)
- Medium priority
- Pending approval workflow
''',
            'prompt': '''You are testing the Auto-Agent task system. Please:

1. Confirm you can read this prompt
2. List the current working directory
3. Echo "Hello from Auto-Agent task system!"
4. Verify the task execution is logged

This is just a test to ensure everything is connected properly.''',
            'system': 'autonomous_agent',
            'execution_type': 'claude_session',
            'status': 'pending_approval',
            'priority': 'medium',
            'created_by': 'human',
            'assigned_to_type': 'system',
            'recurrence': 'once',
            'timeout_seconds': 300,  # 5 minutes
        }

        print("\nCreating task...")
        print(f"  Title: {task_data['title']}")
        print(f"  System: {task_data['system']}")
        print(f"  Execution Type: {task_data['execution_type']}")
        print(f"  Status: {task_data['status']}")
        print(f"  Priority: {task_data['priority']}")

        # Insert task
        response = supabase.table('tasks').insert(task_data).execute()
        task = response.data[0]

        print("\n✅ Task created successfully!")
        print(f"\nTask ID: {task['id']}")
        print(f"Status: {task['status']}")
        print(f"Created: {task['created_at']}")

        print("\n" + "=" * 60)
        print("NEXT STEPS")
        print("=" * 60)

        print("\n1. View task in dashboard:")
        print("   cd tasks/dashboard && npm run dev")
        print("   Open: http://localhost:5173")

        print("\n2. Approve the task:")
        print("   - In dashboard: Click task → Approve")
        print("   - Or via Python:")
        print(f"     python3 approve_task.py {task['id']}")

        print("\n3. Execute the task:")
        print("   python3 tasks/integration/task_executor.py")

        print("\n4. View execution logs:")
        print("   ls -lh logs/task_executor/")

        return task['id']

    except Exception as e:
        print(f"\n❌ Failed to create task: {e}")
        return None

if __name__ == '__main__':
    task_id = create_test_task()
    sys.exit(0 if task_id else 1)
