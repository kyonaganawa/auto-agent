# Development Workflow

This document describes the development processes and workflows for the Auto-Agent System.

## Overview

The Auto-Agent System uses a structured workflow that balances autonomous operation with owner oversight. This ensures quality while maximizing efficiency.

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
**When**: Before commit
**Focus**:
- Business logic correctness
- Architecture alignment
- Maintainability
- Final approval

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

## Continuous Improvement

### Metrics to Track

- Task completion time
- Bug frequency
- Code quality scores
- Test coverage
- Documentation completeness

### Regular Reviews

**Daily**
- Review task progress
- Address blockers
- Update priorities

**Weekly**
- Review completed work
- Identify patterns
- Plan improvements

**Monthly**
- Assess system performance
- Update processes
- Strategic planning

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
