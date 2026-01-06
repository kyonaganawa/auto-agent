#!/usr/bin/env python3
"""Mark the current in_progress task as completed"""

import os
import sys
from datetime import datetime
from supabase import create_client

# Initialize Supabase client
supabase_url = os.environ.get('SUPABASE_URL')
supabase_key = os.environ.get('SUPABASE_SERVICE_KEY')

if not supabase_url or not supabase_key:
    print("Error: SUPABASE_URL and SUPABASE_SERVICE_KEY required")
    sys.exit(1)

supabase = create_client(supabase_url, supabase_key)

# Get the in_progress task
response = supabase.table('tasks').select('*').eq('status', 'in_progress').execute()

if not response.data or len(response.data) == 0:
    print("No in_progress task found")
    sys.exit(1)

task = response.data[0]
task_id = task['id']

print(f"Completing task: {task['title']}")

# Mark as completed
completed_at = datetime.utcnow().isoformat()

supabase.table('tasks').update({
    'status': 'completed',
    'completed_at': completed_at,
}).eq('id', task_id).execute()

# Create execution record
if task.get('started_at'):
    try:
        # Parse the datetime string
        started_str = task['started_at'].replace('Z', '+00:00')
        # Handle microseconds with more than 6 digits
        if '+' in started_str:
            dt_part, tz_part = started_str.rsplit('+', 1)
            if '.' in dt_part:
                main_part, micro_part = dt_part.rsplit('.', 1)
                # Truncate microseconds to 6 digits
                micro_part = micro_part[:6]
                started_str = f"{main_part}.{micro_part}+{tz_part}"

        started = datetime.fromisoformat(started_str)
        completed = datetime.fromisoformat(completed_at.replace('Z', '+00:00'))
        duration = int((completed - started).total_seconds())
    except Exception as e:
        print(f"Warning: Could not parse datetime: {e}")
        duration = 0

    supabase.table('task_executions').insert({
        'task_id': task_id,
        'started_at': task['started_at'],
        'completed_at': completed_at,
        'duration_seconds': duration,
        'status': 'completed',
        'output_summary': 'Successfully redesigned task dashboard with brutalist command center aesthetic',
        'output_data': {
            'description': 'Applied bold brutalist design with dark theme, acid green accents, monospace typography, and strong geometric shapes',
            'features': [
                'Dark charcoal base (#0a0a0a) with grid pattern background',
                'Acid green (#b4ff39), cyan (#00d9ff), and orange (#ff6b35) accent colors',
                'Syne font for headers, JetBrains Mono for body text',
                'Thick borders (3px) with bold hover effects',
                'Animated card reveals with staggered delays',
                'Brutalist box shadows and transforms',
                'Gradient text for main header',
                'Monospace uppercase labels throughout'
            ],
            'files_modified': [
                'tasks/dashboard/src/styles/global.css',
                'tasks/dashboard/src/components/TaskDashboard.tsx',
                'tasks/dashboard/src/components/StatusBadge.tsx',
                'tasks/dashboard/src/components/PriorityBadge.tsx'
            ]
        },
    }).execute()

print(f"✓ Task completed successfully!")
print(f"  Duration: {duration}s")
