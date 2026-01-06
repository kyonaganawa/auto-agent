#!/usr/bin/env python3
"""
Claude Code Execution Logging Hook
Logs all Claude Code sessions to Supabase for monitoring and analysis

Hook Type: user-prompt-submit
Triggered: After each user prompt submission (start of Claude session)
"""

import os
import sys
import json
from datetime import datetime
from pathlib import Path

try:
    from supabase import create_client
except ImportError:
    # Silently fail if supabase not installed
    # Don't block Claude Code execution
    sys.exit(0)


def log_execution_start(event_data):
    """Log the start of a Claude Code execution"""

    # Get Supabase credentials
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_key = os.environ.get('VITE_SUPABASE_ANON_KEY') or os.environ.get('SUPABASE_ANON_KEY')

    if not supabase_url or not supabase_key:
        # No credentials, skip logging
        return

    try:
        supabase = create_client(supabase_url, supabase_key)

        # Extract event data
        prompt = event_data.get('prompt', '')
        cwd = event_data.get('cwd', os.getcwd())
        session_id = event_data.get('sessionId', '')

        # Detect execution context
        execution_context = 'manual'
        if 'task_executor' in ' '.join(sys.argv):
            execution_context = 'task_executor'
        elif os.environ.get('CRON_JOB'):
            execution_context = 'automated'

        # Create log entry
        log_entry = {
            'session_id': session_id,
            'execution_context': execution_context,
            'started_at': datetime.utcnow().isoformat(),
            'prompt': prompt[:5000],  # Limit to 5000 chars
            'working_directory': cwd,
            'initial_message': prompt[:1000],  # First 1000 chars
            'model': event_data.get('model', 'claude-sonnet-4-5'),
            'max_turns': event_data.get('maxTurns'),
            'allowed_tools': event_data.get('allowedTools', []),
            'metadata': {
                'user_agent': 'claude-code-cli',
                'auto_agent_version': '1.0.0',
                'hook_version': '1.0.0',
            }
        }

        # Insert to Supabase
        result = supabase.table('claude_execution_logs').insert(log_entry).execute()

        # Store log ID for completion hook
        log_id = result.data[0]['id'] if result.data else None
        if log_id:
            # Save to temp file for completion hook
            temp_file = Path(f'/tmp/claude_log_{session_id}.json')
            temp_file.write_text(json.dumps({'log_id': log_id, 'session_id': session_id}))

    except Exception as e:
        # Log error but don't block Claude Code
        error_log = Path.home() / '.claude' / 'hooks' / 'errors.log'
        error_log.parent.mkdir(parents=True, exist_ok=True)
        with error_log.open('a') as f:
            f.write(f'{datetime.now().isoformat()} - log-execution.py error: {e}\n')


def main():
    """Main hook entry point"""

    # Read event data from stdin (Claude Code passes this)
    try:
        event_data = json.loads(sys.stdin.read()) if not sys.stdin.isatty() else {}
    except:
        event_data = {}

    # Log execution start
    log_execution_start(event_data)


if __name__ == '__main__':
    main()
