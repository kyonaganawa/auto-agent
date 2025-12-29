#!/usr/bin/env python3
"""
Task Executor - Integrates Supabase tasks with Auto-Agent execution
Polls execution queue and executes approved tasks
"""

import os
import sys
import json
import subprocess
import logging
from datetime import datetime
from typing import Optional, Dict, Any
from pathlib import Path

try:
    from supabase import create_client, Client
except ImportError:
    print("Error: supabase package not installed")
    print("Install with: pip install supabase")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('task_executor')

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent.parent
LOGS_DIR = PROJECT_ROOT / 'logs' / 'task_executor'
LOGS_DIR.mkdir(parents=True, exist_ok=True)


class TaskExecutor:
    def __init__(self):
        """Initialize task executor with Supabase connection"""
        supabase_url = os.environ.get('SUPABASE_URL')
        supabase_key = os.environ.get('SUPABASE_SERVICE_KEY')  # Use service key for backend

        if not supabase_url or not supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY required")

        self.supabase: Client = create_client(supabase_url, supabase_key)
        logger.info("Task executor initialized")

    def get_next_task(self) -> Optional[Dict[str, Any]]:
        """Get next task from execution queue"""
        try:
            response = self.supabase.table('tasks').select('*').eq(
                'status', 'approved'
            ).order(
                'priority', desc=True
            ).order(
                'scheduled_for', desc=False
            ).limit(1).execute()

            if response.data and len(response.data) > 0:
                task = response.data[0]

                # Check if scheduled time has passed
                if task.get('scheduled_for'):
                    scheduled = datetime.fromisoformat(task['scheduled_for'].replace('Z', '+00:00'))
                    if scheduled > datetime.now(scheduled.tzinfo):
                        logger.info(f"Task {task['id']} scheduled for future: {scheduled}")
                        return None

                return task

            return None

        except Exception as e:
            logger.error(f"Failed to get next task: {e}")
            return None

    def mark_in_progress(self, task_id: str) -> bool:
        """Mark task as in_progress"""
        try:
            self.supabase.table('tasks').update({
                'status': 'in_progress',
                'started_at': datetime.utcnow().isoformat()
            }).eq('id', task_id).execute()

            logger.info(f"Task {task_id} marked as in_progress")
            return True

        except Exception as e:
            logger.error(f"Failed to mark task {task_id} as in_progress: {e}")
            return False

    def execute_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a task based on its system"""
        task_id = task['id']
        system = task['system']
        prompt = task.get('prompt', task['description'])

        logger.info(f"Executing task {task_id} on system {system}")
        logger.info(f"Title: {task['title']}")

        # Create log file
        log_file = LOGS_DIR / f"task_{task_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"

        try:
            # Determine which script to run
            if system == 'autonomous_agent':
                script = PROJECT_ROOT / 'scripts' / 'autonomous_run.sh'
            elif system == 'asset_generator':
                script = PROJECT_ROOT / 'scripts' / 'asset_generator_agent.sh'
                # Determine mode from prompt or metadata
                mode = task.get('metadata', {}).get('mode', 'check')
                prompt = f"Mode: {mode}\n{prompt}"
            elif system == 'professional':
                script = PROJECT_ROOT / 'scripts' / 'daily_agent.sh'
            else:
                # Custom system or direct execution
                script = task.get('custom_system')

            if not script or not Path(script).exists():
                raise ValueError(f"Script not found for system: {system}")

            # Execute with Claude Code
            cmd = [
                'claude',
                '-p',
                prompt,
                '--add-dir', str(PROJECT_ROOT),
                '--allowedTools', 'Bash,Read,Write,Edit,Glob,Grep,TodoWrite',
                '--max-turns', '10',
                '--output-format', 'json'
            ]

            # Add system-specific arguments
            if system == 'asset_generator':
                cmd.extend(['--max-turns', '15'])

            # Execute
            with open(log_file, 'w') as log:
                result = subprocess.run(
                    cmd,
                    stdout=log,
                    stderr=subprocess.STDOUT,
                    timeout=3600,  # 1 hour timeout
                    text=True
                )

            # Parse output
            with open(log_file, 'r') as log:
                output = log.read()

            # Extract JSON if present
            output_data = None
            try:
                # Try to find JSON in output
                if '{"' in output:
                    json_start = output.find('{"')
                    json_end = output.rfind('}') + 1
                    output_data = json.loads(output[json_start:json_end])
            except:
                pass

            # Determine success
            success = result.returncode == 0

            return {
                'success': success,
                'exit_code': result.returncode,
                'log_path': str(log_file),
                'output_data': output_data,
                'output_summary': output[:500] if output else None,  # First 500 chars
            }

        except subprocess.TimeoutExpired:
            logger.error(f"Task {task_id} timed out")
            return {
                'success': False,
                'error': 'Task execution timed out after 1 hour',
                'log_path': str(log_file),
            }

        except Exception as e:
            logger.error(f"Task {task_id} execution failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'log_path': str(log_file),
            }

    def mark_completed(self, task_id: str, result: Dict[str, Any]) -> bool:
        """Mark task as completed"""
        try:
            self.supabase.table('tasks').update({
                'status': 'completed',
                'completed_at': datetime.utcnow().isoformat(),
                'execution_log': result.get('log_path'),
            }).eq('id', task_id).execute()

            # Create execution record
            self.supabase.table('task_executions').insert({
                'task_id': task_id,
                'started_at': datetime.utcnow().isoformat(),  # TODO: get from task
                'completed_at': datetime.utcnow().isoformat(),
                'status': 'completed',
                'exit_code': result.get('exit_code', 0),
                'output_summary': result.get('output_summary'),
                'output_data': result.get('output_data'),
                'execution_log_path': result.get('log_path'),
            }).execute()

            logger.info(f"Task {task_id} marked as completed")
            return True

        except Exception as e:
            logger.error(f"Failed to mark task {task_id} as completed: {e}")
            return False

    def mark_failed(self, task_id: str, result: Dict[str, Any]) -> bool:
        """Mark task as failed"""
        try:
            self.supabase.table('tasks').update({
                'status': 'failed',
                'failed_at': datetime.utcnow().isoformat(),
                'error_message': result.get('error', 'Unknown error'),
                'execution_log': result.get('log_path'),
            }).eq('id', task_id).execute()

            # Create execution record
            self.supabase.table('task_executions').insert({
                'task_id': task_id,
                'started_at': datetime.utcnow().isoformat(),
                'completed_at': datetime.utcnow().isoformat(),
                'status': 'failed',
                'exit_code': result.get('exit_code', 1),
                'error_message': result.get('error'),
                'execution_log_path': result.get('log_path'),
            }).execute()

            logger.info(f"Task {task_id} marked as failed")
            return True

        except Exception as e:
            logger.error(f"Failed to mark task {task_id} as failed: {e}")
            return False

    def run_once(self) -> bool:
        """Execute one task from the queue"""
        task = self.get_next_task()

        if not task:
            logger.info("No tasks in queue")
            return False

        task_id = task['id']

        # Mark as in progress
        if not self.mark_in_progress(task_id):
            return False

        # Execute task
        result = self.execute_task(task)

        # Update task status
        if result['success']:
            self.mark_completed(task_id, result)
        else:
            self.mark_failed(task_id, result)

        return True

    def run_continuous(self, interval: int = 60):
        """Run continuously, polling for tasks"""
        import time

        logger.info(f"Starting continuous execution (polling interval: {interval}s)")

        while True:
            try:
                executed = self.run_once()

                if not executed:
                    # No tasks, wait before next poll
                    logger.debug(f"Waiting {interval}s before next poll")
                    time.sleep(interval)
                else:
                    # Task executed, check for next immediately
                    time.sleep(1)

            except KeyboardInterrupt:
                logger.info("Stopped by user")
                break
            except Exception as e:
                logger.error(f"Error in execution loop: {e}")
                time.sleep(interval)


def main():
    import argparse

    parser = argparse.ArgumentParser(description='Auto-Agent Task Executor')
    parser.add_argument('--continuous', action='store_true',
                       help='Run continuously (poll for tasks)')
    parser.add_argument('--interval', type=int, default=60,
                       help='Polling interval in seconds (default: 60)')

    args = parser.parse_args()

    try:
        executor = TaskExecutor()

        if args.continuous:
            executor.run_continuous(interval=args.interval)
        else:
            executor.run_once()

    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
