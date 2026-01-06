#!/usr/bin/env python3
"""
Execute Next Approved Task
Finds and executes the next approved task from the task system
"""

import os
import sys
import json
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
        print("   Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables")
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
    # Get task's system/project info
    task_system = task.get('system', '')
    task_metadata = task.get('metadata', {})
    task_working_dir = task_metadata.get('working_directory') if task_metadata else None

    # Get current context
    current_repo = get_current_git_repo()
    current_dir = get_current_working_dir()

    # If task has specific working directory requirement, check it
    if task_working_dir:
        # Check if we're in the right directory
        if task_working_dir not in [current_repo, current_dir, os.getcwd()]:
            return False, f"Task requires working directory: {task_working_dir}, current: {os.getcwd()}"

    # If no specific requirement, task can run anywhere
    return True, "Task can run in current context"


def get_next_approved_task(supabase):
    """Get the next approved task from the queue that matches current context"""
    result = supabase.table('tasks').select('*').eq('status', 'approved').order('priority', desc=True).order('created_at', desc=False).limit(10).execute()

    if not result.data:
        return None, None

    # Find first task that matches current context
    for task in result.data:
        matches, reason = task_matches_context(task)
        if matches:
            return task, None
        else:
            print(f"⏭️  Skipping task '{task['title']}': {reason}")

    return None, "No tasks match current working directory/git repo context"


def mark_task_in_progress(supabase, task_id):
    """Mark task as in_progress"""
    result = supabase.table('tasks').update({
        'status': 'in_progress',
        'started_at': datetime.utcnow().isoformat()
    }).eq('id', task_id).execute()

    return result.data[0] if result.data else None


def mark_task_completed(supabase, task_id, summary):
    """Mark task as completed"""
    result = supabase.table('tasks').update({
        'status': 'completed',
        'completed_at': datetime.utcnow().isoformat(),
        'metadata': {
            'execution_summary': summary,
            'executed_by': 'execute_next_task.py',
            'executed_at': datetime.utcnow().isoformat()
        }
    }).eq('id', task_id).execute()

    return result.data[0] if result.data else None


def mark_task_failed(supabase, task_id, error_message):
    """Mark task as failed"""
    result = supabase.table('tasks').update({
        'status': 'failed',
        'failed_at': datetime.utcnow().isoformat(),
        'error_message': error_message
    }).eq('id', task_id).execute()

    return result.data[0] if result.data else None


def execute_task_via_claude(task):
    """
    Execute task by outputting it in a format that indicates next execution
    This script identifies the task; actual Claude execution happens externally
    """
    print(f"\n{'='*60}")
    print(f"🎯 NEXT TASK TO EXECUTE")
    print(f"{'='*60}\n")
    print(f"ID: {task['id']}")
    print(f"Title: {task['title']}")
    print(f"Priority: {task['priority']}")
    print(f"Description:\n{task.get('description', 'N/A')}")

    if task.get('prompt'):
        print(f"\nPrompt:\n{task['prompt']}")

    print(f"\n{'='*60}\n")

    # Return task details for automated execution
    return {
        'task_id': task['id'],
        'title': task['title'],
        'description': task.get('description', ''),
        'prompt': task.get('prompt', task.get('description', ''))
    }


def main():
    """Main execution function"""
    print("🚀 Execute Next Approved Task\n")

    # Get Supabase client
    supabase = get_supabase_client()

    # Show current context
    current_repo = get_current_git_repo()
    current_dir = get_current_working_dir()
    print(f"📁 Current context:")
    print(f"   Directory: {os.getcwd()}")
    if current_repo:
        print(f"   Git repo: {current_repo}\n")

    # Get next approved task
    print("📋 Searching for approved tasks that match current context...")
    task, skip_reason = get_next_approved_task(supabase)

    if not task:
        if skip_reason:
            print(f"⏭️  {skip_reason}")
        else:
            print("✅ No approved tasks found - queue is empty!")
        sys.exit(0)

    print(f"✓ Found task: {task['title']}")
    print(f"  Priority: {task['priority']}")
    print(f"  Created: {task['created_at']}\n")

    # Mark as in_progress
    print("⏳ Marking task as in_progress...")
    updated_task = mark_task_in_progress(supabase, task['id'])

    if not updated_task:
        print("❌ Failed to update task status")
        sys.exit(1)

    print("✓ Task marked as in_progress\n")

    # Execute task
    task_details = execute_task_via_claude(task)

    # Output task details as JSON for potential automated consumption
    print("\n📄 Task Details (JSON):")
    print(json.dumps(task_details, indent=2))

    print("\n💡 To execute this task, use:")
    print(f"   claude execute the task: {task['title']}")
    print("\n   Or continue with automated execution pipeline")


if __name__ == '__main__':
    main()
