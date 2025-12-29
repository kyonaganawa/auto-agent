# Task State Machine

Complete state machine specification for the Auto-Agent task system.

## State Diagram

```
┌─────────┐
│  DRAFT  │ (User creating/editing task)
└────┬────┘
     │ submit()
     ▼
┌─────────────────┐
│ PENDING_APPROVAL│ (Awaiting user approval)
└────┬───┬────┬───┘
     │   │    │ approve()
     │   │    ├─────────┐
     │   │    │         ▼
     │   │    │    ┌──────────┐
     │   │    │    │ APPROVED │ (Ready to execute)
     │   │    │    └────┬─────┘
     │   │    │         │ execute()
     │   │    │         ▼
     │   │    │    ┌─────────────┐
     │   │    │    │ IN_PROGRESS │ (Currently executing)
     │   │    │    └──┬────┬─────┘
     │   │    │       │    │
     │   │    │       │    │ fail()
     │   │    │       │    └──────┐
     │   │    │       │           ▼
     │   │    │       │      ┌────────┐
     │   │    │       │      │ FAILED │
     │   │    │       │      └────────┘
     │   │    │       │
     │   │    │       │ complete()
     │   │    │       ▼
     │   │    │  ┌───────────┐
     │   │    │  │ COMPLETED │
     │   │    │  └───────────┘
     │   │    │
     │   │    │ cancel()
     │   │    └──────────┐
     │   │               ▼
     │   │          ┌───────────┐
     │   │          │ CANCELLED │
     │   │          └───────────┘
     │   │
     │   │ request_refinement()
     │   ▼
     │ ┌──────────────────┐
     │ │ NEEDS_REFINEMENT │ (Rejected, needs more detail)
     │ └────────┬─────────┘
     │          │ refine()
     │          │
     └──────────┘ (loops back to PENDING_APPROVAL)
```

## States

### draft
**Description:** Task is being created or edited, not yet submitted for approval.

**Entry conditions:**
- New task created by user
- Task reverted to draft from pending_approval

**Exit conditions:**
- User submits task (`submit()`)
- User deletes task

**Allowed by:** Human users only

**Next states:** `pending_approval`, deleted

---

### pending_approval
**Description:** Task is awaiting human approval before execution.

**Entry conditions:**
- Task submitted from `draft`
- Task refined from `needs_refinement`
- Task created by agent (auto-submission)

**Exit conditions:**
- User approves task (`approve()`)
- User requests refinement (`request_refinement()`)
- User cancels task (`cancel()`)
- Auto-approval rule applies (automatic transition to `approved`)

**Allowed by:** Human users, agents, system

**Next states:** `approved`, `needs_refinement`, `cancelled`

**Business rules:**
- Tasks remain here until explicit user action
- Auto-approval rules can bypass this state
- High priority tasks should be reviewed first

---

### needs_refinement
**Description:** Task was rejected and needs more details or clarification.

**Entry conditions:**
- User requests refinement from `pending_approval`

**Exit conditions:**
- Creator refines and resubmits task (`refine()`)
- Task is cancelled

**Allowed by:** Human users, agents

**Next states:** `pending_approval`, `cancelled`

**Business rules:**
- `refinement_notes` field must be populated
- Original creator should be notified
- Task returns to pending_approval after refinement

---

### approved
**Description:** Task is approved and ready for execution.

**Entry conditions:**
- User approves from `pending_approval`
- Auto-approval rule triggered
- Task auto-approved via `is_pre_approved` flag

**Exit conditions:**
- System begins execution (`execute()`)
- Task is cancelled before execution
- Task becomes blocked by dependencies

**Allowed by:** System, autonomous agents

**Next states:** `in_progress`, `cancelled`, `blocked`

**Business rules:**
- Tasks execute in priority order (critical → backlog)
- Scheduled tasks wait until `scheduled_for` time
- Tasks with dependencies wait until dependencies complete

---

### in_progress
**Description:** Task is currently being executed by an agent or system.

**Entry conditions:**
- Execution begins on `approved` task

**Exit conditions:**
- Task completes successfully (`complete()`)
- Task fails (`fail()`)

**Allowed by:** System, autonomous agents

**Next states:** `completed`, `failed`

**Business rules:**
- `started_at` timestamp is recorded
- `execution_log` path should be set
- Progress can be tracked via log files
- Only one execution at a time per task

---

### completed
**Description:** Task executed successfully.

**Entry conditions:**
- Execution completes from `in_progress`

**Exit conditions:**
- None (terminal state)
- Recurring tasks create new instance

**Allowed by:** System, autonomous agents

**Next states:** None (terminal)

**Business rules:**
- `completed_at` timestamp recorded
- Execution record created in `task_executions`
- For recurring tasks, new instance is created
- Success metrics tracked

---

### failed
**Description:** Task execution failed.

**Entry conditions:**
- Execution fails from `in_progress`

**Exit conditions:**
- Task can be retried (creates new task)
- Task is manually cancelled

**Allowed by:** System, autonomous agents

**Next states:** `cancelled` (manual action only)

**Business rules:**
- `failed_at` timestamp recorded
- `error_message` must be populated
- Execution record created with failure details
- User should be notified for high-priority failures
- Can create retry task manually

---

### cancelled
**Description:** Task was cancelled by user.

**Entry conditions:**
- User cancels from any non-terminal state

**Exit conditions:**
- None (terminal state)

**Allowed by:** Human users

**Next states:** None (terminal)

**Business rules:**
- Can be cancelled from: draft, pending_approval, needs_refinement, approved
- Cannot cancel from: in_progress, completed, failed
- Cancelled tasks can be used as templates for new tasks

---

### blocked
**Description:** Task cannot execute due to dependencies or other issues.

**Entry conditions:**
- Dependencies not met when trying to execute
- System resources unavailable
- Manual block by user

**Exit conditions:**
- Dependencies resolved (transition to `approved`)
- Task cancelled

**Allowed by:** System, human users

**Next states:** `approved`, `cancelled`

**Business rules:**
- Automatically unblocks when dependencies complete
- User can manually unblock
- Blocked tasks don't count in execution queue

---

## State Transitions

### submit()
**From:** `draft`
**To:** `pending_approval`
**Trigger:** User submits task for approval
**Validation:**
- Title is not empty
- Description is not empty
- System is specified
**Side effects:**
- Check auto-approval rules
- May transition directly to `approved` if rules match

---

### approve()
**From:** `pending_approval`
**To:** `approved`
**Trigger:** User approves task
**Validation:**
- User has approval permissions
**Side effects:**
- Set `approved_by` and `approved_at`
- Add to execution queue
- May auto-execute if configured

---

### request_refinement()
**From:** `pending_approval`
**To:** `needs_refinement`
**Trigger:** User requests more details
**Validation:**
- Refinement notes provided
**Side effects:**
- Notify task creator
- Add comment with refinement request

---

### refine()
**From:** `needs_refinement`
**To:** `pending_approval`
**Trigger:** Creator updates task with more details
**Validation:**
- Task has been modified since refinement request
**Side effects:**
- Clear `refinement_notes`
- Notify approver that task is ready for re-review

---

### execute()
**From:** `approved`
**To:** `in_progress`
**Trigger:** System begins task execution
**Validation:**
- No dependencies or all dependencies completed
- Scheduled time has passed (if scheduled)
- System/agent is available
**Side effects:**
- Set `started_at`
- Create execution log file
- Update execution queue

---

### complete()
**From:** `in_progress`
**To:** `completed`
**Trigger:** Execution finishes successfully
**Validation:**
- Execution log exists
**Side effects:**
- Set `completed_at`
- Create execution record
- Calculate duration
- For recurring tasks, create next instance
- Update statistics

---

### fail()
**From:** `in_progress`
**To:** `failed`
**Trigger:** Execution encounters error
**Validation:**
- Error message provided
**Side effects:**
- Set `failed_at`
- Set `error_message`
- Create execution record
- Notify user if high priority
- Log failure for analysis

---

### cancel()
**From:** Multiple states
**To:** `cancelled`
**Trigger:** User cancels task
**Validation:**
- Task is not in_progress, completed, or failed
**Side effects:**
- Add comment with cancellation reason
- Remove from execution queue
- Update statistics

---

### block()
**From:** `approved`
**To:** `blocked`
**Trigger:** Dependencies not met or system issues
**Validation:**
- Valid blocking reason
**Side effects:**
- Set blocking metadata
- Remove from execution queue
- Check dependencies periodically

---

### unblock()
**From:** `blocked`
**To:** `approved`
**Trigger:** Dependencies resolved or manual unblock
**Validation:**
- Blocking condition no longer exists
**Side effects:**
- Clear blocking metadata
- Re-add to execution queue

---

## Auto-Transitions

These transitions happen automatically without user action:

### Auto-Approval
**From:** `pending_approval`
**To:** `approved`
**Trigger:** Task matches auto-approval rule
**Conditions:**
- Auto-approval rule is enabled
- Task matches all rule criteria
- Cost estimate below limit (if specified)
**Implementation:** Database trigger checks rules on INSERT

### Auto-Execute
**From:** `approved`
**To:** `in_progress`
**Trigger:** Task is ready and execution slots available
**Conditions:**
- No dependencies or all dependencies completed
- `scheduled_for` time has passed (if set)
- System is available
- Priority order respected
**Implementation:** Autonomous agent checks execution queue periodically

### Dependency Resolution
**From:** `blocked`
**To:** `approved`
**Trigger:** All dependencies completed
**Conditions:**
- All tasks in `depends_on` are in `completed` status
**Implementation:** Database trigger on task completion

### Recurring Task Creation
**From:** `completed`
**To:** New task created in `approved`
**Trigger:** Recurring task completes
**Conditions:**
- `recurrence` is not 'once'
- Not past end date (if specified)
**Implementation:** Database trigger creates new task instance

---

## Permission Matrix

| State | View | Edit | Submit | Approve | Execute | Cancel |
|-------|------|------|--------|---------|---------|--------|
| draft | Creator | Creator | Creator | - | - | Creator |
| pending_approval | All | Creator | - | User | - | User |
| needs_refinement | All | Creator | - | - | - | User |
| approved | All | - | - | - | System | User |
| in_progress | All | - | - | - | System | - |
| completed | All | - | - | - | - | - |
| failed | All | - | - | - | - | User |
| cancelled | All | - | - | - | - | - |
| blocked | All | - | - | User | - | User |

**Legend:**
- Creator: Task creator only
- User: Any authenticated user
- System: System/agents only
- All: Anyone
- `-`: Not allowed

---

## Business Rules

### Priority-Based Execution Order

Tasks in `approved` state execute in this order:
1. Priority (critical → high → medium → low → backlog)
2. Scheduled time (earliest first)
3. Creation time (oldest first)

### Dependency Resolution

- Tasks with `depends_on` wait in `blocked` state
- When dependency completes, blocked task moves to `approved`
- Circular dependencies are prevented at creation time
- Failed dependencies block dependent tasks

### Scheduled Execution

- Tasks with `scheduled_for` in the future wait in `approved` state
- Execution begins automatically when scheduled time arrives
- Overdue scheduled tasks execute immediately when system is available

### Recurring Task Management

- Completed recurring tasks automatically create next instance
- New instance inherits all properties from parent
- New instance status depends on `is_pre_approved`:
  - If `true`: Created in `approved` state
  - If `false`: Created in `pending_approval` state
- Parent-child relationship tracked via `parent_task_id`

### Auto-Approval Rules

Rules are checked on task creation/submission in order:
1. Match criteria evaluated (ALL must match)
2. First matching rule is applied
3. Task transitions based on rule settings
4. If no rules match, remains in `pending_approval`

### Failure Handling

- Failed tasks create execution record with error details
- High/critical priority failures trigger user notification
- Failed tasks can be:
  - Reviewed and retried manually
  - Cancelled if unrecoverable
  - Used as template for corrected task

---

## State Lifecycle Examples

### Example 1: Simple Manual Task

```
draft
  └─> pending_approval (user submits)
       └─> approved (user approves)
            └─> in_progress (system executes)
                 └─> completed (execution succeeds)
```

### Example 2: Task Needing Refinement

```
draft
  └─> pending_approval (user submits)
       └─> needs_refinement (user requests more detail)
            └─> pending_approval (creator refines)
                 └─> approved (user approves)
                      └─> in_progress (system executes)
                           └─> completed (execution succeeds)
```

### Example 3: Auto-Approved Recurring Task

```
pending_approval (agent creates)
  └─> approved (auto-approval rule matches)
       └─> in_progress (system executes at scheduled time)
            └─> completed (execution succeeds)
                 └─> [new instance created] pending_approval
                      └─> approved (auto-approval)
                           └─> ... (repeats)
```

### Example 4: Failed Task

```
approved
  └─> in_progress (system executes)
       └─> failed (error during execution)
            └─> cancelled (user reviews and decides not to retry)
```

### Example 5: Task with Dependencies

```
approved (depends on task A and B)
  └─> blocked (task A not completed yet)
       └─> approved (task A completes, auto-unblock)
            └─> blocked (task B not completed yet)
                 └─> approved (task B completes, auto-unblock)
                      └─> in_progress (all dependencies met)
                           └─> completed
```

---

## Implementation Notes

### Database Triggers

Key triggers in the schema:
- `apply_auto_approval_rules`: Checks rules on INSERT
- `handle_recurring_tasks`: Creates next instance on UPDATE to completed
- Custom triggers for dependency resolution (to be implemented)

### Application-Level Logic

The state machine should be implemented in the service layer with:
- Validation before transitions
- Side effects after transitions
- Rollback on failure
- Audit logging of all transitions

### Event Emission

Each state transition should emit an event:
```typescript
{
  type: 'task.transition',
  task_id: string,
  from: TaskStatus,
  to: TaskStatus,
  timestamp: string,
  triggered_by: string
}
```

This enables:
- Real-time dashboard updates
- Notification system
- Analytics and monitoring
- Webhook integrations
