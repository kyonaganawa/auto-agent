#!/usr/bin/env python3
"""Quick script to check tasks in the database"""

import os
import sys
from supabase import create_client

# Initialize Supabase client
supabase_url = os.environ.get('SUPABASE_URL')
supabase_key = os.environ.get('SUPABASE_SERVICE_KEY')

if not supabase_url or not supabase_key:
    print("Error: SUPABASE_URL and SUPABASE_SERVICE_KEY required")
    sys.exit(1)

supabase = create_client(supabase_url, supabase_key)

# Query all tasks
response = supabase.table('tasks').select('*').order('created_at', desc=True).limit(10).execute()

print(f"\n{'='*80}")
print(f"TASKS IN DATABASE (Last 10)")
print(f"{'='*80}\n")

for task in response.data:
    print(f"ID: {task['id']}")
    print(f"Title: {task['title']}")
    print(f"Status: {task['status']}")
    print(f"Priority: {task.get('priority', 'N/A')}")
    print(f"System: {task.get('system', 'N/A')}")
    print(f"Description: {task.get('description', 'N/A')}")
    print(f"Prompt: {task.get('prompt', 'N/A')}")
    print(f"Created: {task.get('created_at', 'N/A')}")
    print(f"{'-'*80}\n")

print(f"\nTotal tasks found: {len(response.data)}")
