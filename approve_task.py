#!/usr/bin/env python3
"""
Approve Task
Quick script to approve a pending task
"""
import os
import sys
from datetime import datetime

try:
    from supabase import create_client
except ImportError:
    print("❌ Error: supabase package not installed")
    print("Install with: pip install supabase")
    sys.exit(1)

def approve_task(task_id: str):
    """Approve a task by ID"""

    # Get credentials
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_SERVICE_KEY')

    if not supabase_url or not supabase_key:
        print("❌ Environment variables not set!")
        print("See: tasks/docs/SUPABASE_SETUP.md")
        sys.exit(1)

    try:
        supabase = create_client(supabase_url, supabase_key)

        # Get task
        print(f"Fetching task {task_id}...")
        task_response = supabase.table('tasks').select('*').eq('id', task_id).single().execute()
        task = task_response.data

        print(f"\nTask: {task['title']}")
        print(f"Current status: {task['status']}")

        if task['status'] == 'approved':
            print("✅ Task is already approved!")
            return True

        if task['status'] not in ['pending_approval', 'suggested']:
            print(f"⚠️  Cannot approve task with status '{task['status']}'")
            print("Only tasks with status 'pending_approval' or 'suggested' can be approved")
            return False

        # Approve task
        print(f"\nApproving task...")
        update_response = supabase.table('tasks').update({
            'status': 'approved',
            'approved_by': 'manual_script',
            'approved_at': datetime.utcnow().isoformat(),
        }).eq('id', task_id).execute()

        approved_task = update_response.data[0]

        print("✅ Task approved successfully!")
        print(f"\nStatus: {approved_task['status']}")
        print(f"Approved at: {approved_task['approved_at']}")

        print("\n" + "=" * 60)
        print("NEXT STEPS")
        print("=" * 60)
        print("\nExecute the task:")
        print("  python3 tasks/integration/task_executor.py")
        print("\nOr run continuously:")
        print("  python3 tasks/integration/task_executor.py --continuous")

        return True

    except Exception as e:
        print(f"\n❌ Failed to approve task: {e}")
        return False

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 approve_task.py <task_id>")
        print("\nExample:")
        print("  python3 approve_task.py 550e8400-e29b-41d4-a716-446655440000")
        print("\nTo list pending tasks:")
        print("  python3 list_tasks.py --status pending_approval")
        sys.exit(1)

    task_id = sys.argv[1]
    success = approve_task(task_id)
    sys.exit(0 if success else 1)
