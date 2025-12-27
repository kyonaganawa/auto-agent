# System Architecture

This document describes the technical architecture of the Auto-Agent System.

## Overview

The Auto-Agent System is built on a modular, extensible architecture that enables autonomous agents to work together while maintaining clear separation of concerns.

The architecture is designed to support four primary objectives:
1. **Asset Generation**: Create revenue-generating digital assets
2. **Professional Performance**: Enhance career and job performance
3. **Personal Improvement**: Optimize daily life and personal growth
4. **Personal Projects**: Advance creative and recreational pursuits

See [OBJECTIVES.md](OBJECTIVES.md) for detailed objective descriptions.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│              Communication Layer                            │
│  - Multi-channel Input (CLI, Mobile, Files)                │
│  - Intelligent Output (Notifications, Reports)             │
│  - Message Queue Management                                 │
└─────────────────────────────────────────────────────────────┘
                   │
┌─────────────────────────────────────────────────────────────┐
│       Orchestration Layer                                   │
│  - Task Routing                                             │
│  - Agent Coordination                                       │
│  - State Management                                         │
│  - Continuous Operation Management                          │
│  - Smart Approval Gates                                     │
└─────────────────────────────────────────────────────────────┘
                   │
┌─────────────────────────────────────────────────────────────┐
│         Agent Layer                                         │
│  - Specialized Agents (Dev, Plan, Research, Review)        │
│  - Monitoring Agents (System Health, Opportunities)        │
│  - Communication Agents (I/O Management)                   │
│  - Agent Communication & Collaboration                      │
└─────────────────────────────────────────────────────────────┘
                   │
┌─────────────────────────────────────────────────────────────┐
│         Tool Layer                                          │
│  - File Operations                                          │
│  - Code Analysis                                            │
│  - External Integrations                                    │
│  - Messaging APIs                                           │
└─────────────────────────────────────────────────────────────┘
                   │
┌─────────────────────────────────────────────────────────────┐
│       Storage & Logging Layer                               │
│  - Git Repository                                           │
│  - File System                                              │
│  - State Persistence                                        │
│  - Comprehensive Logging (Structured, Analytics)           │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Agent System

#### Agent Types

**Development Agent**
- Purpose: Code creation and modification
- Capabilities:
  - Write new code
  - Refactor existing code
  - Fix bugs
  - Implement features
- Tools: Edit, Write, Read, Grep, Glob

**Planning Agent**
- Purpose: Design and strategy
- Capabilities:
  - Analyze requirements
  - Design solutions
  - Create implementation plans
  - Identify dependencies
- Tools: Read, Grep, Glob, LSP

**Research Agent (Explorer)**
- Purpose: Information gathering
- Capabilities:
  - Search codebases
  - Understand patterns
  - Find relevant code
  - Analyze structure
- Tools: Grep, Glob, Read, WebSearch

**Review Agent**
- Purpose: Quality assurance
- Capabilities:
  - Code review
  - Test validation
  - Best practice checks
  - Security analysis
- Tools: Read, Bash (for tests), Grep

**Monitoring Agent**
- Purpose: System health and opportunity detection
- Capabilities:
  - Watch system performance
  - Identify optimization opportunities
  - Detect anomalies
  - Generate insights and reports
  - Trigger self-improvement cycles
- Tools: Read, Grep, Bash, Analytics tools

**Communication Agent**
- Purpose: Multi-channel I/O management
- Capabilities:
  - Monitor input channels (CLI, mobile, files)
  - Route messages to appropriate handlers
  - Send notifications to owner
  - Format and deliver reports
  - Manage message queue priorities
- Tools: File I/O, Messaging APIs, Notification systems

#### Objective-Specific Agents

**Asset Generation Agents**
- Purpose: Create and manage revenue-generating assets
- Capabilities:
  - Market research and opportunity identification
  - Website development and content generation
  - App development and deployment
  - Social media content creation and scheduling
  - Digital media production
  - Performance analytics and optimization
- Tools: Web frameworks, CMS, social APIs, analytics tools

**Professional Assistant Agents**
- Purpose: Enhance work performance and career
- Capabilities:
  - Task and project management
  - Code generation and review
  - Presentation creation
  - Documentation writing
  - Meeting preparation and notes
  - Career development planning
- Tools: Development tools, office software, scheduling APIs

**Personal Optimization Agents**
- Purpose: Manage daily life and personal growth
- Capabilities:
  - Task capture and prioritization
  - Habit tracking and reminders
  - Note organization and retrieval
  - Self-reflection prompts and analysis
  - Goal tracking and progress monitoring
- Tools: Database, notification system, analytics

**Project Management Agents**
- Purpose: Advance personal creative projects
- Capabilities:
  - Project planning and milestone tracking
  - Resource and reference collection
  - Progress monitoring
  - Skill development guidance
  - Creative assistance (game design, music theory, etc.)
- Tools: Project management tools, domain-specific tools

#### Agent Communication

Agents communicate through:
- **Direct invocation**: Parent agent spawns child agents
- **Shared context**: Access to common state and files
- **Return values**: Child agents return results to parents
- **File system**: Shared workspace for collaboration
- **Message queue**: Asynchronous communication via queues

### 2. Communication System

#### Input Channels

**Claude Code CLI Sessions**
- Direct interactive communication
- Real-time task assignment
- Synchronous feedback loop
- High-priority operations

**Mobile Messages** (Implementation pending)
- Quick task submission
- Urgent approvals
- Status queries
- Platform options: Telegram Bot API, WhatsApp Business API, Custom app
- Asynchronous processing
- Priority flagging

**Text File Queue**
- File-based task definitions in `input/tasks/`
- Batch operations
- Scheduled tasks
- Configuration updates
- Format: JSON or YAML structured files

#### Output Channels

**Notification System**
The system intelligently determines when to notify the owner based on:

**Urgency Levels:**
- **Critical**: Immediate notification required
  - System failures
  - Security alerts
  - Data loss risks
  - Blocking errors

- **High**: Notification within 1 hour
  - Major decisions needed
  - Architecture changes
  - Breaking changes
  - Significant milestones

- **Medium**: Daily digest
  - Value-adding insights
  - Optimization opportunities
  - Completed tasks
  - Performance reports

- **Low**: Weekly summary
  - Statistics
  - Trends
  - Minor improvements
  - Documentation updates

**Delivery Methods:**
- Mobile push notifications (critical/high)
- Email summaries (medium/low)
- Dashboard reports (all levels)
- Log files (all levels)

#### Message Queue Architecture

```
Input Queue → Prioritization → Routing → Agent Assignment → Execution
                     ↓
              Monitoring & Logging
                     ↓
          Output Queue → Notification Delivery
```

### 3. Logging System

#### Log Structure

**Hierarchical Logging:**
```
logs/
├── sessions/          # Complete session transcripts
│   └── YYYY-MM-DD/
│       └── session_ID.json
├── agents/            # Agent-specific activity
│   └── agent_type/
│       └── YYYY-MM-DD_activity.json
├── summaries/         # Quick scan summaries
│   └── daily_YYYY-MM-DD.json
└── analytics/         # Aggregated metrics
    └── weekly_stats.json
```

#### Log Levels

- **DEBUG**: Detailed technical information
- **INFO**: General operational events
- **WARN**: Warning messages, non-critical issues
- **ERROR**: Error events
- **CRITICAL**: Critical failures requiring immediate attention

#### Log Entry Format

```json
{
  "timestamp": "2025-12-26T10:30:00Z",
  "level": "INFO",
  "agent": "development_agent",
  "action": "file_modified",
  "details": {
    "file": "src/example.ts",
    "lines_changed": 15,
    "operation": "refactor"
  },
  "duration_ms": 1234,
  "session_id": "sess_abc123",
  "task_id": "task_xyz789"
}
```

#### Quick Scan Capability

Daily summaries provide fast overview:
- Total tasks completed
- Agents activated
- Files modified
- Errors encountered
- Performance metrics
- Key achievements

#### Analytics Data

Collected for analysis:
- Task completion times
- Agent performance metrics
- Error patterns
- Resource utilization
- Code quality trends
- Improvement opportunities

### 4. Continuous Operation System

#### Architecture

**Session Management:**
- Multiple parallel Claude sessions
- Session pooling for efficiency
- Auto-recovery from failures
- Resource allocation

**Task Queue Processing:**
```
┌─────────────┐
│ Input Queue │
└──────┬──────┘
       │
       ├→ Priority Sorting
       ├→ Dependency Resolution
       ├→ Resource Allocation
       └→ Agent Assignment
              ↓
       ┌──────────────┐
       │  Execution   │
       └──────┬───────┘
              │
              ├→ Monitoring
              ├→ Logging
              └→ Completion
                     ↓
              ┌──────────────┐
              │ Output Queue │
              └──────────────┘
```

**Self-Improvement Cycles:**
1. **Analysis Phase** (Daily)
   - Review execution logs
   - Identify patterns
   - Detect inefficiencies

2. **Planning Phase**
   - Generate improvement proposals
   - Assess impact and risk
   - Queue for approval if needed

3. **Execution Phase**
   - Implement approved improvements
   - Run tests
   - Monitor results

4. **Learning Phase**
   - Store successful patterns
   - Update best practices
   - Refine algorithms

#### Smart Approval Gates

**Auto-Approve:**
- Documentation updates
- Test additions
- Minor refactoring
- Code formatting
- Log level adjustments

**Require Approval:**
- Architecture changes
- External dependencies
- Security modifications
- Breaking changes
- Resource-intensive operations

**Risk Assessment:**
```typescript
interface ChangeRisk {
  impact: "low" | "medium" | "high";
  reversibility: "easy" | "moderate" | "difficult";
  testing_coverage: number; // percentage
  approval_required: boolean;
}
```

### 5. Task Management

#### Task Lifecycle

```
Define → Plan → Execute → Review → Approve → Commit
```

1. **Define**: Owner or agent defines the task
2. **Plan**: Planning agent creates implementation strategy
3. **Execute**: Development agent implements the solution
4. **Review**: Review agent validates the changes
5. **Approve**: Owner approves the changes
6. **Commit**: Changes are committed to Git

#### Task State

Tasks can be in one of these states:
- `pending`: Defined but not started
- `in_progress`: Currently being worked on
- `completed`: Successfully finished
- `blocked`: Waiting for dependencies or approval
- `failed`: Encountered errors

### 3. Version Control Integration

#### Git Integration

All changes are tracked through Git:
- Automatic staging of modified files
- Descriptive commit messages
- Branch-based development
- Owner approval before commits

#### Commit Message Format

```
<type>: <summary>

<detailed description>

🤖 Generated with Claude Code
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`

### 6. File Organization

```
auto-agent/
├── agents/                 # Agent definitions
│   ├── development/       # Development agents
│   ├── planning/          # Planning agents
│   ├── research/          # Research agents
│   ├── review/            # Review agents
│   ├── monitoring/        # Monitoring & analytics agents
│   ├── communication/     # I/O communication agents
│   ├── asset_generation/  # Asset creation agents
│   ├── professional/      # Professional assistance agents
│   ├── personal/          # Personal optimization agents
│   └── projects/          # Project management agents
├── scripts/               # Automation scripts
│   ├── setup/            # Setup and initialization
│   ├── tasks/            # Task automation
│   ├── continuous/       # Continuous operation
│   ├── messaging/        # Message handling
│   └── utils/            # Utility scripts
├── logs/                  # Comprehensive logging
│   ├── sessions/         # Session transcripts
│   ├── agents/           # Agent activity logs
│   ├── summaries/        # Quick scan summaries
│   └── analytics/        # Analytics data
├── input/                 # Input channels
│   ├── tasks/            # Task queue (text files)
│   ├── mobile/           # Mobile message cache
│   └── config/           # Dynamic configuration
├── output/                # Output channels
│   ├── notifications/    # Pending notifications
│   └── reports/          # Generated reports
├── objectives/            # Objective-specific workspaces
│   ├── assets/           # Asset generation projects
│   │   ├── websites/    # Website projects
│   │   │   ├── active/  # Active website projects
│   │   │   ├── deployed/# Deployed websites
│   │   │   └── archive/ # Archived projects
│   │   ├── apps/        # Application projects
│   │   │   ├── mobile/  # Mobile apps
│   │   │   ├── web/     # Web apps
│   │   │   └── tools/   # CLI tools/utilities
│   │   ├── social/      # Social media management
│   │   │   ├── content/ # Content库
│   │   │   ├── schedules/# Posting schedules
│   │   │   └── analytics/# Performance data
│   │   └── media/       # Digital media creation
│   │       ├── videos/  # Video content
│   │       ├── ebooks/  # E-books and guides
│   │       └── courses/ # Online courses
│   ├── professional/     # Professional work
│   │   ├── deliverables/# Work outputs
│   │   │   ├── code/    # Code projects
│   │   │   ├── presentations/# Slides and decks
│   │   │   └── documents/# Reports and docs
│   │   ├── career/      # Career development
│   │   │   ├── portfolio/# Portfolio items
│   │   │   ├── networking/# Contacts and events
│   │   │   └── learning/# Skill development
│   │   └── organization/# Daily work management
│   │       ├── tasks/   # Work task tracking
│   │       ├── projects/# Project management
│   │       └── meetings/# Meeting notes
│   ├── personal/         # Personal improvement
│   │   ├── tasks/       # Personal task management
│   │   │   ├── active/  # Current tasks
│   │   │   ├── recurring/# Recurring tasks
│   │   │   └── completed/# Task history
│   │   ├── habits/      # Habit tracking
│   │   │   ├── tracking/# Daily tracking data
│   │   │   ├── analytics/# Habit analytics
│   │   │   └── templates/# Habit templates
│   │   ├── notes/       # Note organization
│   │   │   ├── inbox/   # Quick captures
│   │   │   ├── organized/# Categorized notes
│   │   │   └── archive/ # Old notes
│   │   └── reflection/  # Self-reflection
│   │       ├── daily/   # Daily journals
│   │       ├── weekly/  # Weekly reviews
│   │       └── monthly/ # Monthly reflections
│   └── projects/         # Personal projects
│       ├── games/       # Game development
│       │   ├── prototypes/# Game prototypes
│       │   ├── active/  # Active development
│       │   └── published/# Released games
│       ├── music/       # Music creation
│       │   ├── compositions/# Music files
│       │   ├── projects/# DAW projects
│       │   └── released/# Published music
│       ├── skateboarding/# Skateboarding
│       │   ├── tricks/  # Trick progression
│       │   ├── sessions/# Session logs
│       │   └── videos/  # Video content
│       └── other/       # Other projects
├── docs/                  # Documentation
│   ├── guides/           # User guides
│   ├── api/              # API documentation
│   └── examples/         # Example usage
├── config/                # Configuration files
│   ├── agents.json       # Agent configurations
│   ├── workflows.json    # Workflow definitions
│   ├── notifications.json # Notification rules
│   ├── objectives.json   # Objective tracking
│   └── settings.json     # System settings
├── state/                 # Runtime state
│   ├── tasks.json        # Active task state
│   ├── queue.json        # Task queue state
│   ├── habits.json       # Habit tracking state
│   ├── projects.json     # Project states
│   └── history.json      # Execution history
└── tests/                 # Test suites
    ├── unit/             # Unit tests
    └── integration/      # Integration tests
```

## Design Patterns

### 1. Agent Pattern

Each agent follows this structure:

```typescript
interface Agent {
  name: string;
  type: AgentType;
  capabilities: string[];

  execute(task: Task): Promise<Result>;
  plan(task: Task): Promise<Plan>;
  validate(result: Result): Promise<boolean>;
}
```

### 2. Task Pattern

Tasks are structured as:

```typescript
interface Task {
  id: string;
  description: string;
  type: TaskType;
  priority: Priority;
  dependencies: string[];
  assignedAgent?: string;
  status: TaskStatus;
  result?: Result;
}
```

### 3. Workflow Pattern

Workflows define multi-step processes:

```typescript
interface Workflow {
  name: string;
  steps: Step[];

  execute(): Promise<WorkflowResult>;
  rollback(): Promise<void>;
}
```

## Data Flow

### Input Processing Flow

```
┌─────────────────────────────────────────────┐
│  Input Sources (CLI, Mobile, Text Files)   │
└─────────────────┬───────────────────────────┘
                  │
          ┌───────▼────────┐
          │ Message Queue  │
          └───────┬────────┘
                  │
          ┌───────▼────────┐
          │ Prioritization │
          └───────┬────────┘
                  │
          ┌───────▼────────┐
          │ Task Routing   │
          └───────┬────────┘
                  │
          ┌───────▼────────┐
          │ Agent Selection│
          └───────┬────────┘
                  │
          ┌───────▼────────┐
          │   Execution    │
          └────────────────┘
```

### Task Execution Flow (Enhanced)

```
Owner Request / Auto-Generated Task
    ↓
Task Definition & Prioritization
    ↓
Risk Assessment
    ↓
┌───────────────────┐
│ Requires Approval?│
└─────┬─────────┬───┘
      NO        YES
      │          │
      │          └→ Owner Approval → Rejected → End
      │                   │
      │                Approved
      │                   │
      └──────┬────────────┘
             │
    Planning Agent (creates plan)
             ↓
    Development Agent (implements)
             ↓
    Review Agent (validates)
             ↓
    Logging & Analytics
             ↓
    Git Commit (if significant)
             ↓
    Output Queue (notifications)
             ↓
    Task Complete
```

### Continuous Operation Flow

```
System Start
    ↓
┌─────────────────────────────────┐
│  Parallel Session Management    │
│                                  │
│  Session 1: Task Queue Processing│
│  Session 2: Monitoring & Analysis│
│  Session 3: Self-Improvement     │
│  Session 4: Communication I/O    │
└─────────────────────────────────┘
    ↓           ↓           ↓
Input      Monitoring   Learning
Monitoring   Agents      Cycle
    ↓           ↓           ↓
Task Queue  Insights   Improvements
Processing  Generated   Applied
    ↓           ↓           ↓
Execution   Notifications Updates
    ↓           ↓           ↓
Logging ←───────┴───────────┘
    ↓
Analytics & Reporting
    ↓
Output Notifications
    ↓
Loop continues...
```

### Agent Collaboration Flow

```
Main Agent
    ├→ Spawns Planning Agent (parallel)
    ├→ Spawns Research Agent (parallel)
    └→ Waits for results
         ↓
    Combines insights
         ↓
    Risk Assessment
         ↓
    Spawns Development Agent
         ↓
    Spawns Review Agent
         ↓
    Logging Agent (records all)
         ↓
    Communication Agent (notifies if needed)
         ↓
    Returns result
```

### Notification Flow

```
Event Occurs
    ↓
Logging System captures
    ↓
Urgency Assessment
    ↓
┌────────────────────────────────┐
│  Critical? → Immediate Push    │
│  High? → Notify within 1 hour  │
│  Medium? → Add to daily digest │
│  Low? → Add to weekly summary  │
└────────────────────────────────┘
    ↓
Format Message
    ↓
Add to Output Queue
    ↓
Communication Agent delivers
    ↓
Log delivery status
```

## Extensibility

### Adding New Agent Types

1. Define agent interface
2. Implement core capabilities
3. Register in agent registry
4. Update documentation
5. Create tests

### Adding New Tools

1. Create tool wrapper
2. Define tool interface
3. Add to tool registry
4. Document usage
5. Add tests

### Creating Custom Workflows

1. Define workflow steps
2. Specify agent requirements
3. Configure dependencies
4. Test workflow
5. Document process

## Security Considerations

### Access Control
- File system access limited to project directory
- Git operations require owner approval
- External network access controlled
- Sensitive data handling protocols

### Code Safety
- Input validation
- Output sanitization
- Secure code patterns
- Vulnerability scanning

### Approval Gates
- Critical operations require approval
- Automatic backup before changes
- Rollback capability
- Audit logging

## Performance Optimization

### Parallel Execution
- Independent agents run in parallel
- Task batching where possible
- Efficient tool usage
- Context management

### Caching
- File content caching
- Search result caching
- Agent response caching
- State persistence

### Resource Management
- Token budget tracking
- Concurrent agent limits
- Tool call optimization
- Memory management

## Future Architecture Enhancements

### Planned Improvements

1. **Mobile Application**
   - Native iOS/Android app
   - Real-time push notifications
   - Quick task submission
   - Voice input support
   - Approval workflow UI

2. **Advanced Machine Learning**
   - Pattern recognition from logs
   - Predictive optimization
   - Anomaly detection
   - Auto-tuning of approval gates
   - Success prediction models

3. **Enhanced Orchestration**
   - Dynamic agent selection
   - Load balancing across sessions
   - Intelligent priority queuing
   - Resource optimization
   - Cost management

4. **Multi-Project Support**
   - Project isolation
   - Shared agent library
   - Cross-project learning
   - Unified dashboard
   - Resource pooling

5. **Real-time Collaboration**
   - WebSocket integration
   - Live progress updates
   - Interactive approval flow
   - Real-time dashboard
   - Multi-user support

6. **Plugin System**
   - Third-party agents
   - Custom tool integration
   - Extension marketplace
   - API for external integrations
   - Webhook support

7. **Advanced Analytics**
   - Predictive insights
   - Cost-benefit analysis
   - ROI tracking
   - Performance optimization recommendations
   - Trend analysis and forecasting

## Technical Stack

- **Core**: Claude Code CLI (Claude Sonnet 4.5)
- **Version Control**: Git
- **Runtime**: Node.js (optional for scripts)
- **Configuration**: JSON
- **Documentation**: Markdown

## Monitoring and Observability

### Metrics Tracked

**Operational Metrics:**
- Task completion rate and success rate
- Agent performance (execution time, efficiency)
- Error rates and patterns
- Resource usage (tokens, API calls, memory)
- Queue depth and processing time

**Business Metrics:**
- Value generated (improvements made)
- Code quality trends
- Test coverage evolution
- Documentation completeness
- Technical debt reduction

**Performance Metrics:**
- Response time per task type
- Agent utilization rates
- Bottleneck identification
- Optimization opportunities
- Cost per task

### Logging (Comprehensive)

**Session Logs:**
- Complete conversation transcripts
- Tool calls and results
- Decision points
- Execution timeline

**Agent Activity Logs:**
- Actions performed
- Duration and resources used
- Success/failure status
- Error messages and stack traces

**System Event Logs:**
- System startup/shutdown
- Configuration changes
- Approval requests and decisions
- Notifications sent

**Analytics Logs:**
- Aggregated statistics
- Trend data
- Pattern recognition results
- Optimization recommendations

### Quick Scan Summaries

**Daily Summary:**
```json
{
  "date": "2025-12-26",
  "tasks_completed": 15,
  "tasks_failed": 2,
  "agents_active": ["development", "monitoring", "review"],
  "files_modified": 8,
  "commits": 3,
  "errors": ["connection_timeout x1", "test_failure x1"],
  "key_achievements": [
    "Implemented new logging system",
    "Optimized database queries (30% faster)",
    "Added 25 new tests"
  ],
  "notifications_sent": 2
}
```

### Debugging Tools

**Verbose Mode:**
- Detailed execution traces
- Tool call inspection
- State snapshots

**Step-through Execution:**
- Breakpoint support
- Manual approval at each step
- State inspection between steps

**Analytics Dashboard:**
- Real-time metrics
- Historical trends
- Performance graphs
- Error analysis

**Trace Analysis:**
- End-to-end request tracing
- Agent call graphs
- Performance profiling
- Resource utilization heatmaps

---

*Last updated: 2025-12-26*
