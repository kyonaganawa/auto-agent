#!/usr/bin/env python3
"""
Execute Tasks in Batch
Continuously executes approved tasks until queue is empty or limit reached
"""

import os
import sys
import json
import time
import subprocess
from datetime import datetime
from pathlib import Path

try:
    from supabase import create_client
except ImportError:
    print("❌ Error: supabase-py not installed")
    print("   Run: pip3 install supabase")
    sys.exit(1)


def get_supabase_client():
    """Get configured Supabase client"""
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_ANON_KEY') or os.environ.get('VITE_SUPABASE_ANON_KEY')

    if not supabase_url or not supabase_key:
        print("❌ Error: Supabase credentials not found")
        sys.exit(1)

    return create_client(supabase_url, supabase_key)


def get_current_git_repo():
    """Get the current git repository name"""
    try:
        result = subprocess.run(
            ['git', 'rev-parse', '--show-toplevel'],
            capture_output=True,
            text=True,
            check=True
        )
        repo_path = result.stdout.strip()
        return os.path.basename(repo_path) if repo_path else None
    except (subprocess.CalledProcessError, FileNotFoundError):
        return None


def get_current_working_dir():
    """Get current working directory basename"""
    return os.path.basename(os.getcwd())


def task_matches_context(task):
    """Check if task matches current working directory/git repo"""
    task_metadata = task.get('metadata', {})
    task_working_dir = task_metadata.get('working_directory') if task_metadata else None

    current_repo = get_current_git_repo()
    current_dir = get_current_working_dir()

    if task_working_dir:
        if task_working_dir not in [current_repo, current_dir, os.getcwd()]:
            return False, f"requires {task_working_dir}"

    return True, "matches context"


def get_approved_tasks_count(supabase):
    """Get count of approved tasks"""
    result = supabase.table('tasks').select('id', count='exact').eq('status', 'approved').execute()
    return result.count if hasattr(result, 'count') else 0


def get_next_approved_task(supabase):
    """Get the next approved task from the queue that matches current context"""
    result = supabase.table('tasks').select('*').eq('status', 'approved').order('priority', desc=True).order('created_at', desc=False).limit(10).execute()

    if not result.data:
        return None

    # Find first task that matches current context
    for task in result.data:
        matches, reason = task_matches_context(task)
        if matches:
            return task
        else:
            print(f"   ⏭️  Skipping '{task['title']}': {reason}")

    return None


def mark_task_in_progress(supabase, task_id):
    """Mark task as in_progress"""
    result = supabase.table('tasks').update({
        'status': 'in_progress',
        'started_at': datetime.utcnow().isoformat()
    }).eq('id', task_id).execute()

    return result.data[0] if result.data else None


def main():
    """Main execution function"""
    # Parse arguments
    max_tasks = 10  # Default limit
    if len(sys.argv) > 1:
        try:
            max_tasks = int(sys.argv[1])
        except ValueError:
            print(f"❌ Invalid limit: {sys.argv[1]}")
            sys.exit(1)

    print(f"🚀 Execute Tasks in Batch (limit: {max_tasks})\n")

    # Get Supabase client
    supabase = get_supabase_client()

    # Get initial count
    initial_count = get_approved_tasks_count(supabase)
    print(f"📋 Found {initial_count} approved task(s) in queue\n")

    if initial_count == 0:
        print("✅ No approved tasks - queue is empty!")
        sys.exit(0)

    tasks_to_execute = min(initial_count, max_tasks)
    print(f"🎯 Will execute up to {tasks_to_execute} task(s)\n")
    print("="*60)

    executed = 0
    failed = 0

    for i in range(tasks_to_execute):
        print(f"\n[Task {i+1}/{tasks_to_execute}]")

        # Get next task
        task = get_next_approved_task(supabase)

        if not task:
            print("✅ No more approved tasks")
            break

        print(f"📌 {task['title']}")
        print(f"   Priority: {task['priority']}")
        print(f"   ID: {task['id']}")

        # Mark as in_progress
        mark_task_in_progress(supabase, task['id'])
        print(f"   Status: in_progress")

        # Prepare prompt for Claude
        prompt = task.get('prompt') or task.get('description', '')

        print(f"\n   Executing task...")
        print(f"   Prompt: {prompt[:100]}{'...' if len(prompt) > 100 else ''}\n")

        # In a real implementation, this would call Claude Code
        # For now, we mark it as requiring manual execution
        print(f"   ⚠️  Manual execution required:")
        print(f"       claude \"{prompt}\"")
        print(f"\n   Task marked as in_progress - execute manually or via automation")

        executed += 1

        # Small delay between tasks
        if i < tasks_to_execute - 1:
            time.sleep(1)

    print("\n" + "="*60)
    print(f"\n✅ Batch execution complete")
    print(f"   Tasks marked for execution: {executed}")
    print(f"   Failed: {failed}")

    remaining = get_approved_tasks_count(supabase)
    print(f"   Remaining in queue: {remaining}")

    if remaining > 0:
        print(f"\n💡 Run again to execute more tasks:")
        print(f"   python3 {__file__} {max_tasks}")


if __name__ == '__main__':
    main()
