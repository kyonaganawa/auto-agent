#!/usr/bin/env python3
"""
Enhanced Task Executor - With detailed execution logging
Captures file modifications, git commits, and detailed summaries
"""

import os
import sys
import json
import subprocess
import logging
import re
from datetime import datetime
from typing import Optional, Dict, Any, List
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
logger = logging.getLogger('enhanced_task_executor')

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent.parent
LOGS_DIR = PROJECT_ROOT / 'logs' / 'task_executor'
LOGS_DIR.mkdir(parents=True, exist_ok=True)


class EnhancedTaskExecutor:
    def __init__(self):
        """Initialize task executor with Supabase connection"""
        supabase_url = os.environ.get('SUPABASE_URL')
        supabase_key = os.environ.get('SUPABASE_SERVICE_KEY')

        if not supabase_url or not supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY required")

        self.supabase: Client = create_client(supabase_url, supabase_key)
        logger.info("Enhanced task executor initialized")

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

    def extract_file_modifications(self, log_content: str) -> List[Dict[str, str]]:
        """Extract modified files from Claude Code log output"""
        files = []

        # Pattern 1: File created/modified messages
        # "File created successfully at: /path/to/file"
        # "The file /path/to/file has been updated"
        file_patterns = [
            r'File (?:created|modified|updated) (?:successfully )?(?:at|in): ([^\s\n]+)',
            r'The file ([^\s]+) has been (?:created|updated|modified)',
            r'Writing to file: ([^\s\n]+)',
            r'Created file: ([^\s\n]+)',
        ]

        for pattern in file_patterns:
            matches = re.finditer(pattern, log_content, re.IGNORECASE)
            for match in matches:
                file_path = match.group(1)
                if file_path not in [f['path'] for f in files]:
                    files.append({
                        'path': file_path,
                        'type': 'modified'
                    })

        # Pattern 2: Git commits
        git_pattern = r'git commit.*?-m\s+["\']([^"\']+)["\']'
        git_matches = re.finditer(git_pattern, log_content, re.IGNORECASE)
        for match in git_matches:
            commit_msg = match.group(1)
            files.append({
                'type': 'git_commit',
                'message': commit_msg
            })

        return files

    def generate_execution_summary(self, task: Dict[str, Any], result: Dict[str, Any],
                                   log_content: str) -> Dict[str, Any]:
        """Generate comprehensive execution summary"""

        # Extract modified files
        modified_files = self.extract_file_modifications(log_content)

        # Extract key metrics
        summary = {
            'task_id': task['id'],
            'task_title': task['title'],
            'execution_type': task.get('execution_type', 'claude_session'),
            'started_at': task.get('started_at'),
            'completed_at': datetime.utcnow().isoformat(),
            'duration_seconds': None,  # Calculate if times available
            'success': result['success'],
            'working_directory': task.get('system', 'unknown'),
            'prompt': task.get('prompt', task['description'])[:500],  # First 500 chars
            'modified_files': modified_files,
            'files_modified_count': len([f for f in modified_files if f['type'] == 'modified']),
            'git_commits_count': len([f for f in modified_files if f['type'] == 'git_commit']),
            'log_file_path': result.get('log_path'),
            'output_summary': result.get('output_summary'),
            'exit_code': result.get('exit_code', 0),
            'error_message': result.get('error'),
        }

        # Calculate duration
        if task.get('started_at'):
            try:
                started = datetime.fromisoformat(task['started_at'].replace('Z', '+00:00'))
                completed = datetime.fromisoformat(summary['completed_at'].replace('Z', '+00:00'))
                summary['duration_seconds'] = int((completed - started).total_seconds())
            except:
                pass

        return summary

    def execute_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a task based on its execution type"""
        task_id = task['id']
        execution_type = task.get('execution_type', 'claude_session')
        timeout = task.get('timeout_seconds', 3600)

        logger.info(f"Executing task {task_id}")
        logger.info(f"Title: {task['title']}")
        logger.info(f"Execution type: {execution_type}")

        # Create log file
        log_file = LOGS_DIR / f"task_{task_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"

        try:
            if execution_type == 'script':
                return self._execute_script(task, log_file, timeout)
            elif execution_type == 'hybrid':
                return self._execute_hybrid(task, log_file, timeout)
            else:  # claude_session
                return self._execute_claude_session(task, log_file, timeout)

        except subprocess.TimeoutExpired:
            logger.error(f"Task {task_id} timed out after {timeout}s")
            return {
                'success': False,
                'error': f'Task execution timed out after {timeout} seconds',
                'log_path': str(log_file),
            }
        except Exception as e:
            logger.error(f"Task {task_id} execution failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'log_path': str(log_file),
            }

    def _execute_claude_session(self, task: Dict[str, Any], log_file: Path, timeout: int) -> Dict[str, Any]:
        """Execute via Claude Code with prompt"""
        system = task['system']
        prompt = task.get('prompt') or task.get('description')

        if not prompt:
            raise ValueError("Task must have either 'prompt' or 'description' field set")

        logger.info(f"Executing Claude Code session for system: {system}")

        # Determine working directory
        work_dir = PROJECT_ROOT
        if system == 'asset_generator':
            work_dir = PROJECT_ROOT / 'objectives' / 'assets'
        elif system == 'professional':
            work_dir = PROJECT_ROOT / 'objectives' / 'professional'
        elif system == 'personal':
            work_dir = PROJECT_ROOT / 'objectives' / 'personal'
        elif system == 'projects':
            work_dir = PROJECT_ROOT / 'objectives' / 'projects'

        # Execute with Claude Code
        cmd = [
            'claude',
            '-p',
            prompt,
            '--add-dir', str(work_dir),
            '--allowedTools', 'Bash,Read,Write,Edit,Glob,Grep,TodoWrite',
            '--max-turns', '10',
            '--output-format', 'json'
        ]

        # Add system-specific arguments
        if system == 'asset_generator':
            cmd.extend(['--max-turns', '20'])

        # Execute
        with open(log_file, 'w') as log:
            result = subprocess.run(
                cmd,
                stdout=log,
                stderr=subprocess.STDOUT,
                timeout=timeout,
                text=True,
                cwd=work_dir
            )

        # Parse output
        with open(log_file, 'r') as log:
            output = log.read()

        # Extract JSON if present
        output_data = None
        try:
            if '{"' in output:
                json_start = output.find('{"')
                json_end = output.rfind('}') + 1
                output_data = json.loads(output[json_start:json_end])
        except:
            pass

        return {
            'success': result.returncode == 0,
            'exit_code': result.returncode,
            'log_path': str(log_file),
            'output_data': output_data,
            'output_summary': output[:500] if output else None,
        }

    def _execute_script(self, task: Dict[str, Any], log_file: Path, timeout: int) -> Dict[str, Any]:
        """Execute a pre-created script"""
        script_path = task.get('script_path')
        script_args = task.get('script_args', {})

        if not script_path:
            raise ValueError("script_path is required for script execution")

        # Resolve script path
        if not script_path.startswith('/'):
            script_path = PROJECT_ROOT / script_path

        script_path = Path(script_path)

        if not script_path.exists():
            raise ValueError(f"Script not found: {script_path}")

        logger.info(f"Executing script: {script_path}")
        logger.info(f"Arguments: {script_args}")

        # Build command
        cmd = [str(script_path)]
        for key, value in script_args.items():
            cmd.append(str(value))

        # Execute script
        with open(log_file, 'w') as log:
            result = subprocess.run(
                cmd,
                stdout=log,
                stderr=subprocess.STDOUT,
                timeout=timeout,
                text=True,
                cwd=PROJECT_ROOT
            )

        # Read output
        with open(log_file, 'r') as log:
            output = log.read()

        return {
            'success': result.returncode == 0,
            'exit_code': result.returncode,
            'log_path': str(log_file),
            'output_summary': output[:500] if output else None,
        }

    def _execute_hybrid(self, task: Dict[str, Any], log_file: Path, timeout: int) -> Dict[str, Any]:
        """Execute script first, then Claude Code session"""
        logger.info("Executing hybrid: script + Claude session")

        # Execute script
        script_result = self._execute_script(task, log_file, timeout // 2)

        if not script_result['success']:
            return script_result

        # Execute Claude session if prompt provided
        prompt = task.get('prompt')
        if prompt:
            with open(log_file, 'r') as log:
                script_output = log.read()

            enhanced_prompt = f"{prompt}\n\nScript output:\n{script_output[-1000:]}"

            claude_task = {**task, 'prompt': enhanced_prompt}

            with open(log_file, 'a') as log:
                log.write('\n\n' + '='*80 + '\n')
                log.write('CLAUDE CODE SESSION\n')
                log.write('='*80 + '\n\n')

            claude_result = self._execute_claude_session(claude_task, log_file, timeout // 2)

            return {
                'success': claude_result['success'],
                'exit_code': claude_result.get('exit_code', 0),
                'log_path': str(log_file),
                'output_data': claude_result.get('output_data'),
                'output_summary': claude_result.get('output_summary'),
            }

        return script_result

    def log_execution(self, task: Dict[str, Any], result: Dict[str, Any]):
        """Log detailed execution to Supabase"""
        try:
            # Read log file
            log_content = ""
            if result.get('log_path'):
                try:
                    with open(result['log_path'], 'r') as f:
                        log_content = f.read()
                except:
                    pass

            # Generate comprehensive summary
            summary = self.generate_execution_summary(task, result, log_content)

            # Update task status
            task_update = {
                'completed_at': datetime.utcnow().isoformat(),
                'execution_log': result.get('log_path'),
            }

            if result['success']:
                task_update['status'] = 'completed'
            else:
                task_update['status'] = 'failed'
                task_update['error_message'] = result.get('error', 'Unknown error')
                task_update['failed_at'] = datetime.utcnow().isoformat()

            self.supabase.table('tasks').update(task_update).eq('id', task['id']).execute()

            # Create detailed execution record
            self.supabase.table('task_executions').insert({
                'task_id': task['id'],
                'started_at': task.get('started_at', datetime.utcnow().isoformat()),
                'completed_at': datetime.utcnow().isoformat(),
                'status': 'completed' if result['success'] else 'failed',
                'exit_code': result.get('exit_code', 0),
                'output_summary': summary.get('output_summary'),
                'output_data': {
                    **summary,
                    'raw_output_data': result.get('output_data'),
                },
                'execution_log_path': result.get('log_path'),
                'error_message': result.get('error'),
            }).execute()

            logger.info(f"Task {task['id']} execution logged to Supabase")
            logger.info(f"  - Files modified: {summary['files_modified_count']}")
            logger.info(f"  - Git commits: {summary['git_commits_count']}")
            logger.info(f"  - Duration: {summary.get('duration_seconds', 'N/A')}s")

        except Exception as e:
            logger.error(f"Failed to log execution: {e}")

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

        # Log execution with detailed summary
        self.log_execution(task, result)

        return True

    def run_continuous(self, interval: int = 60):
        """Run continuously, polling for tasks"""
        import time

        logger.info(f"Starting continuous execution (polling interval: {interval}s)")

        while True:
            try:
                executed = self.run_once()

                if not executed:
                    logger.debug(f"Waiting {interval}s before next poll")
                    time.sleep(interval)
                else:
                    time.sleep(1)

            except KeyboardInterrupt:
                logger.info("Stopped by user")
                break
            except Exception as e:
                logger.error(f"Error in execution loop: {e}")
                time.sleep(interval)


def main():
    import argparse

    parser = argparse.ArgumentParser(description='Enhanced Auto-Agent Task Executor')
    parser.add_argument('--continuous', action='store_true',
                       help='Run continuously (poll for tasks)')
    parser.add_argument('--interval', type=int, default=60,
                       help='Polling interval in seconds (default: 60)')

    args = parser.parse_args()

    try:
        executor = EnhancedTaskExecutor()

        if args.continuous:
            executor.run_continuous(interval=args.interval)
        else:
            executor.run_once()

    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
