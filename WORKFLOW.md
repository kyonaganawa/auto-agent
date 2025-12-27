# Development Workflow

This document describes the development processes and workflows for the Auto-Agent System.

## Overview

The Auto-Agent System uses a structured workflow that balances autonomous operation with owner oversight. This ensures quality while maximizing efficiency.

The system operates continuously, processing tasks from multiple input channels, making intelligent decisions about when to request approval, and proactively generating value through self-improvement cycles.

## Input Processing Workflows

### 1. Claude Code CLI Input Workflow

**Real-time Interactive Mode:**
1. User sends message via Claude Code
2. System processes immediately
3. Interactive planning and approval as needed
4. Execution with real-time feedback
5. Results displayed to user

### 2. Mobile Message Input Workflow (Pending Implementation)

**Asynchronous Processing:**
1. User sends message via mobile app
2. Message stored in `input/mobile/` cache
3. Communication Agent polls for new messages
4. Message parsed and prioritized
5. Added to task queue
6. Acknowledgment sent to user
7. Execution proceeds based on priority
8. Notification sent when complete

### 3. Text File Input Workflow

**Batch Processing:**
1. User creates task file in `input/tasks/`
2. Monitoring Agent detects new file
3. File parsed and validated
4. Tasks added to queue with priority
5. Original file moved to processed folder
6. Execution proceeds automatically
7. Results written to `output/reports/`

**Task File Format (JSON):**
```json
{
  "task_id": "task_001",
  "priority": "high",
  "type": "feature",
  "description": "Add user authentication",
  "requires_approval": true,
  "deadline": "2025-12-30",
  "metadata": {
    "created_by": "Luciano",
    "context": "Security improvement"
  }
}
```

## Core Workflows

### 1. Feature Development Workflow

#### Step 1: Task Definition
**Who**: Owner or System Agent
**Actions**:
- Define clear requirements
- Specify acceptance criteria
- Set priority level
- Identify dependencies

**Example**:
```
Task: Add logging capability to all agents
Requirements:
  - Log all agent actions
  - Include timestamps
  - Store logs in structured format
  - Configurable log levels
Priority: High
Dependencies: None
```

#### Step 2: Planning
**Who**: Planning Agent
**Actions**:
- Analyze requirements
- Research existing code
- Design solution approach
- Identify files to modify
- Create implementation plan

**Output**: Detailed plan for owner approval

#### Step 3: Owner Review (Planning)
**Who**: Owner
**Actions**:
- Review proposed approach
- Approve, modify, or reject plan
- Provide additional context if needed

#### Step 4: Implementation
**Who**: Development Agent
**Actions**:
- Follow approved plan
- Write/modify code
- Follow coding standards
- Create/update tests
- Update documentation

#### Step 5: Validation
**Who**: Review Agent
**Actions**:
- Code quality check
- Test execution
- Security review
- Documentation review

#### Step 6: Owner Review (Implementation)
**Who**: Owner
**Actions**:
- Review all changes
- Test functionality
- Approve or request changes

#### Step 7: Commit
**Who**: System (with owner approval)
**Actions**:
- Stage changes
- Create descriptive commit
- Update changelog
- Push to repository

### 2. Bug Fix Workflow

#### Step 1: Bug Report
**Who**: Owner or System Detection
**Actions**:
- Describe the bug
- Include reproduction steps
- Provide error messages
- Specify expected behavior

#### Step 2: Investigation
**Who**: Research Agent
**Actions**:
- Locate problematic code
- Understand root cause
- Identify affected components
- Assess impact

#### Step 3: Fix Planning
**Who**: Planning Agent
**Actions**:
- Design fix approach
- Identify side effects
- Plan testing strategy

#### Step 4: Implementation
**Who**: Development Agent
**Actions**:
- Implement fix
- Add regression tests
- Verify solution

#### Step 5: Validation & Commit
Same as Feature Development (Steps 5-7)

### 3. Self-Improvement Workflow

#### Step 1: Opportunity Identification
**Who**: System Analysis Agent
**Actions**:
- Analyze execution history
- Identify inefficiencies
- Detect patterns
- Propose improvements

#### Step 2: Improvement Proposal
**Who**: Planning Agent
**Actions**:
- Document current state
- Describe proposed improvement
- Estimate impact
- Outline implementation

**Output**: Improvement proposal for owner

#### Step 3: Owner Decision
**Who**: Owner
**Actions**:
- Evaluate proposal
- Assess value vs. complexity
- Approve or defer

#### Step 4: Implementation
If approved, follow Feature Development workflow

### 4. Code Review Workflow

#### Automated Review
**When**: After every code change
**Checks**:
- Code style compliance
- Security vulnerabilities
- Test coverage
- Documentation completeness
- Performance concerns

#### Owner Review
**When**: Before commit (for significant changes)
**Focus**:
- Business logic correctness
- Architecture alignment
- Maintainability
- Final approval

### 5. Autonomous Operation Workflow

#### Continuous Task Processing

**24/7 Operation:**
1. **Monitor Input Queues**
   - Poll all input channels every 5 minutes
   - Check for new tasks, messages, files

2. **Process Queue**
   - Prioritize tasks (Critical → High → Medium → Low)
   - Resolve dependencies
   - Allocate resources

3. **Execute Tasks**
   - Assign to appropriate agents
   - Run in parallel where possible
   - Log all activities

4. **Handle Results**
   - Validate outputs
   - Commit changes (if approved)
   - Generate notifications
   - Update analytics

5. **Self-Monitor**
   - Check system health
   - Detect issues
   - Trigger alerts if needed
   - Loop continues

#### Smart Approval Logic

**Automatic Execution (No Approval):**
- Documentation updates
- Test additions (no code changes)
- Log level adjustments
- Code formatting
- Minor refactoring (< 10 lines)
- Dependency updates (patch versions)

**Queue for Batch Approval (Daily):**
- Medium refactoring (10-50 lines)
- New utility functions
- Test improvements
- Performance optimizations
- Minor dependency updates

**Immediate Approval Required:**
- Architecture changes
- Security modifications
- Breaking changes
- Major refactoring (> 50 lines)
- External service integrations
- Database schema changes

**Risk Assessment Algorithm:**
```
if (files_changed > 5 OR lines_changed > 50):
    require_approval = True
elif (changes_security OR changes_architecture):
    require_approval = True
elif (test_coverage_decrease > 5%):
    require_approval = True
elif (has_existing_tests AND tests_pass):
    require_approval = False
else:
    require_approval = True
```

### 6. Continuous Monitoring Workflow

#### System Health Monitoring

**Every 15 Minutes:**
1. Check system metrics
   - Memory usage
   - CPU utilization
   - Queue depth
   - Error rates

2. Analyze logs
   - Recent errors
   - Performance degradation
   - Unusual patterns

3. Generate alerts if needed
   - Critical: Immediate notification
   - Warning: Add to daily digest

#### Opportunity Detection

**Hourly Analysis:**
1. Scan codebase for:
   - Duplicate code (refactoring opportunities)
   - Missing tests
   - Outdated dependencies
   - Performance bottlenecks
   - Documentation gaps

2. Assess feasibility and impact

3. Generate improvement proposals

4. Add to task queue (low priority)

### 7. Self-Improvement Workflow

#### Daily Self-Improvement Cycle

**Runs at 2 AM Daily:**

**Phase 1: Analysis (30 min)**
1. Review previous day's logs
2. Analyze execution patterns
3. Identify inefficiencies
4. Detect repeated issues
5. Generate insights

**Phase 2: Planning (30 min)**
1. Create improvement proposals
2. Prioritize by impact
3. Assess implementation effort
4. Generate implementation plans

**Phase 3: Execution (Varies)**
1. Implement low-risk improvements automatically
2. Queue medium-risk for owner review
3. Present high-impact changes for approval

**Phase 4: Learning**
1. Store successful patterns
2. Update decision models
3. Refine approval algorithms
4. Document learnings

**Example Improvements:**
- Optimize frequently-used code paths
- Add tests for uncovered code
- Update outdated documentation
- Refactor complex functions
- Remove dead code

### 8. Notification Workflow

#### Urgency-Based Notification

**Critical (Immediate Push):**
```
Event → Log → Assess → Format → Push Notification → Deliver
                                        ↓
                                  SMS/Mobile App
```

**High (Within 1 Hour):**
```
Event → Log → Assess → Add to High Queue → Batch (hourly) → Deliver
                                                                ↓
                                                           Mobile Push
```

**Medium (Daily Digest):**
```
Event → Log → Assess → Add to Medium Queue → Batch (daily) → Email
```

**Low (Weekly Summary):**
```
Event → Log → Assess → Add to Low Queue → Batch (weekly) → Email Report
```

#### Notification Content

**Critical Alert:**
```
🚨 CRITICAL: System Failure
Time: 2025-12-26 14:30
Issue: Database connection lost
Impact: All tasks blocked
Action Required: Immediate intervention needed

View logs: /logs/sessions/2025-12-26/error_abc123.json
```

**High Priority:**
```
⚠️ Approval Needed: Architecture Change
Task: Implement caching layer
Estimated Impact: 50% performance improvement
Risk: Medium (requires testing)
Deadline: 2025-12-27

Review plan: /output/reports/caching_proposal.md
Approve via: Claude Code or Mobile App
```

**Medium (Daily Digest):**
```
📊 Daily Summary - 2025-12-26

✅ Completed: 12 tasks
🔧 Improvements: 5 optimizations
📝 Updated: 3 documents
✅ Tests Added: 15

Key Achievement:
- Database query optimization: 30% faster

View full report: /output/reports/daily_2025-12-26.md
```

## Git Workflow

### Branch Strategy

```
main (stable, production-ready)
  ↑
develop (active development)
  ↑
feature/feature-name (individual features)
```

### Branch Types

**main**
- Always stable
- Only approved, tested code
- Tagged releases

**develop**
- Integration branch
- All features merge here first
- Regular testing

**feature/***
- Individual feature branches
- Created from develop
- Merged back to develop

**hotfix/***
- Urgent bug fixes
- Created from main
- Merged to main and develop

### Commit Process

#### 1. Pre-Commit
```bash
# Check status
git status

# Review changes
git diff

# Verify no sensitive data
grep -r "password\|secret\|key" .
```

#### 2. Staging
```bash
# Stage specific files
git add <files>

# Review staged changes
git diff --staged
```

#### 3. Commit
```bash
# Commit with descriptive message
git commit -m "feat: add logging capability to agents

- Added structured logging system
- Configurable log levels (debug, info, warn, error)
- Logs stored in JSON format
- Timestamps on all entries

🤖 Generated with Claude Code
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

#### 4. Post-Commit
```bash
# Verify commit
git log -1

# Run tests if configured
npm test
```

### Merge Strategy

**Feature to Develop**
```bash
# Update develop
git checkout develop
git pull origin develop

# Merge feature
git merge --no-ff feature/feature-name

# Push to remote
git push origin develop
```

**Develop to Main**
```bash
# Ensure all tests pass
# Get owner approval

# Update main
git checkout main
git merge --no-ff develop

# Tag release
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push
git push origin main --tags
```

## Task Management

### Task States

- **pending**: Defined, awaiting execution
- **in_progress**: Currently being worked on
- **review**: Awaiting owner review
- **blocked**: Dependencies or issues
- **completed**: Successfully finished
- **cancelled**: No longer needed

### Task Tracking

Use TodoWrite tool to maintain task list:

```typescript
{
  content: "Implement logging system",
  status: "in_progress",
  activeForm: "Implementing logging system"
}
```

### Task Priorities

- **Critical**: System broken, immediate action
- **High**: Important feature or bug
- **Medium**: Normal development
- **Low**: Nice-to-have improvements

## Communication Protocols

### Agent-to-Owner Communication

**Progress Updates**
- Report before starting major steps
- Notify of completion
- Alert on blockers

**Approval Requests**
- Present plan clearly
- Include rationale
- Offer alternatives

**Error Reporting**
- Describe the error
- Include context
- Suggest solutions

### Agent-to-Agent Communication

**Task Delegation**
- Clear task description
- Expected output format
- Timeout/constraints

**Result Sharing**
- Structured data format
- Complete information
- Error handling

## Quality Standards

### Code Quality

**Style**
- Consistent formatting
- Meaningful names
- Clear structure
- Appropriate comments

**Best Practices**
- DRY (Don't Repeat Yourself)
- SOLID principles
- Error handling
- Input validation

**Testing**
- Unit tests for functions
- Integration tests for workflows
- Edge case coverage

### Documentation Quality

**Code Documentation**
- Function/class descriptions
- Parameter explanations
- Return value specs
- Usage examples

**Project Documentation**
- Up-to-date README
- Architecture docs
- Workflow guides
- API references

### Commit Quality

**Message Format**
```
<type>: <summary>

<body>

<footer>
```

**Types**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring
- `docs`: Documentation
- `test`: Testing
- `chore`: Maintenance

## Approval Process

### What Requires Approval

**Always Require Approval**
- New features
- Architecture changes
- External dependencies
- Security-related changes
- Production deployments

**May Skip Approval**
- Documentation updates
- Code formatting
- Minor bug fixes (if tested)
- Test additions

### Approval Methods

**Interactive Approval**
Owner reviews changes in real-time during development

**Batch Approval**
Owner reviews completed work before commit

**Automated Approval** (future)
Specific types of changes auto-approved if tests pass

## Testing Workflow

### Test Types

**Unit Tests**
- Test individual functions
- Mock dependencies
- Fast execution

**Integration Tests**
- Test component interaction
- Use real dependencies
- Verify workflows

**End-to-End Tests**
- Test complete scenarios
- User perspective
- Full system validation

### Test Process

1. **Write tests first** (TDD approach)
2. **Run tests locally** before commit
3. **Fix failures** immediately
4. **Maintain test coverage**
5. **Update tests** with code changes

## Logging Practices

### What to Log

**Always Log:**
- Every task execution (start, end, duration)
- All agent activities
- File modifications
- Git operations
- Errors and warnings
- Approval requests and decisions
- Notifications sent
- System events (startup, shutdown, config changes)

**Log Format:**
Use structured JSON format for all logs (see LOGGING.md for details)

### Log Levels

- **DEBUG**: Development and troubleshooting information
- **INFO**: Normal operational events
- **WARN**: Warning messages, potential issues
- **ERROR**: Error events that don't stop operation
- **CRITICAL**: Failures requiring immediate attention

### Quick Scan Usage

**Daily Review:**
1. Check `logs/summaries/daily_YYYY-MM-DD.json`
2. Review key metrics and achievements
3. Identify any errors or issues
4. Plan follow-up actions

**Deep Dive:**
1. Use full logs in `logs/sessions/` for detailed investigation
2. Analyze agent logs for performance tuning
3. Review analytics for trend analysis

## Continuous Improvement

### Metrics to Track

**Operational:**
- Task completion time
- Task success rate
- Agent performance
- Queue processing time
- Error frequency

**Quality:**
- Bug frequency
- Code quality scores
- Test coverage
- Documentation completeness
- Technical debt metrics

**Value:**
- Improvements implemented
- Performance gains achieved
- Time saved through automation
- Code quality improvements

### Regular Reviews

**Automated (Continuous)**
- Real-time monitoring via dashboards
- Automated alerts on anomalies
- Continuous metrics collection

**Daily**
- Review daily summary log
- Check task progress
- Address blockers
- Update priorities
- Review notifications sent

**Weekly**
- Comprehensive log review
- Review completed work
- Identify patterns and trends
- Plan improvements
- Adjust automation rules

**Monthly**
- Strategic assessment
- Assess system performance
- Update processes and workflows
- Review and refine approval gates
- Long-term planning

## Best Practices

### Do's

- Plan before implementing
- Write tests
- Document changes
- Commit frequently
- Review thoroughly
- Ask for clarification
- Keep changes focused

### Don'ts

- Skip planning for complex tasks
- Commit untested code
- Mix multiple changes in one commit
- Ignore errors
- Make assumptions
- Rush approvals
- Create technical debt

## Emergency Procedures

### System Failure

1. Stop all agents
2. Assess damage
3. Rollback if needed
4. Fix root cause
5. Document incident

### Data Loss Prevention

- Regular backups
- Git history preservation
- State snapshots
- Recovery procedures

### Rollback Process

```bash
# View recent commits
git log --oneline -10

# Revert specific commit
git revert <commit-hash>

# Or reset to previous state
git reset --hard <commit-hash>

# Restore specific file
git checkout <commit-hash> -- <file-path>
```

## Tools and Commands

### Essential Git Commands

```bash
# Status
git status
git diff
git log

# Branching
git branch
git checkout -b feature/name
git merge

# Committing
git add
git commit
git push

# History
git log --graph --oneline
git blame <file>
git show <commit>

# Undo
git reset
git revert
git checkout
```

### Claude Code Commands

```bash
# Start session
claude

# Help
/help

# View tasks
/tasks

# Clear conversation
/clear
```

## Workflow Customization

Workflows can be customized by:
- Modifying agent configurations
- Adjusting approval requirements
- Creating custom scripts
- Defining project-specific rules

---

*Last updated: 2025-12-26*
