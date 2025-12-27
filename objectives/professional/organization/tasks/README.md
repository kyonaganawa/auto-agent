# Professional Task Management

This directory manages work-related tasks using a structured system.

## Task File Format

Tasks are stored as JSON files with the following structure:

```json
{
  "id": "task_2025_001",
  "title": "Implement user authentication feature",
  "description": "Add OAuth2 authentication to the application",
  "status": "in_progress",
  "priority": "high",
  "category": "development",
  "created": "2025-12-27T08:00:00Z",
  "updated": "2025-12-27T14:30:00Z",
  "due_date": "2025-12-30",
  "estimated_hours": 8,
  "actual_hours": 4.5,
  "tags": ["authentication", "security", "oauth"],
  "project": "user-management",
  "assignee": "Luciano Naganawa",
  "dependencies": [],
  "subtasks": [
    {
      "id": "subtask_001",
      "title": "Research OAuth2 providers",
      "completed": true
    },
    {
      "id": "subtask_002",
      "title": "Implement Google OAuth",
      "completed": false
    }
  ],
  "notes": "Using Auth0 for implementation",
  "links": [
    "https://auth0.com/docs/quickstart/webapp/nodejs"
  ],
  "completed_at": null
}
```

## Task Statuses

- **backlog**: Not yet started, future work
- **todo**: Ready to be started, in current sprint
- **in_progress**: Currently being worked on
- **blocked**: Waiting on dependencies or decisions
- **review**: Completed, awaiting code review
- **testing**: In QA/testing phase
- **done**: Completed and verified

## Task Priorities

- **critical**: Urgent, blocking others, immediate attention
- **high**: Important, should be done soon
- **medium**: Normal priority
- **low**: Nice to have, can be deferred

## Task Categories

- **development**: Coding and implementation
- **bug_fix**: Bug fixes and issue resolution
- **documentation**: Writing or updating docs
- **meeting**: Meeting preparation or follow-up
- **research**: Investigation and learning
- **review**: Code or design review
- **planning**: Planning and architecture
- **testing**: Writing or running tests
- **deployment**: Deployment and operations
- **administrative**: Admin tasks, reports, etc.

## File Organization

```
tasks/
├── active/          # Currently active tasks
│   ├── critical/   # Critical priority tasks
│   ├── high/       # High priority tasks
│   ├── medium/     # Medium priority tasks
│   └── low/        # Low priority tasks
├── backlog/        # Future tasks
├── completed/      # Completed tasks (archived by month)
│   ├── 2025-12/
│   └── 2026-01/
└── templates/      # Task templates
```

## Quick Start

### Create a New Task

Use the template:
```bash
cp templates/task_template.json active/medium/task_name.json
# Edit the file with task details
```

Or use the task creation script:
```bash
../../../scripts/professional/create_task.sh "Task title" high development
```

### Update Task Status

Move the task file to the appropriate directory or update the JSON status field.

### Complete a Task

1. Update `status` to "done"
2. Set `completed_at` timestamp
3. Move to `completed/YYYY-MM/` directory

### Daily Task Review

1. Check `active/critical/` for urgent items
2. Review `active/high/` for today's priorities
3. Move completed tasks to archive
4. Update task statuses
5. Add new tasks from meetings/emails

## Integration with Auto-Agent

The system automatically:
- Scans for new tasks in `active/`
- Prioritizes based on due dates and priority
- Sends reminders for overdue tasks
- Generates daily task summaries
- Tracks time spent per task
- Archives completed tasks monthly

## Reports

Generated in `../../../output/reports/professional/`:
- Daily task summary
- Weekly progress report
- Time tracking by project/category
- Completion rate metrics
- Overdue task alerts
