# Logging Specification

This document defines the comprehensive logging system for the Auto-Agent System.

## Overview

The logging system serves three primary purposes:
1. **Operational visibility**: Track all system activities in real-time
2. **Quick scanning**: Daily summaries for fast review
3. **Deep analysis**: Detailed data for troubleshooting and optimization

## Log Structure

### Directory Organization

```
logs/
├── sessions/              # Complete session transcripts
│   └── YYYY-MM-DD/
│       ├── session_001_HH-MM-SS.json
│       ├── session_002_HH-MM-SS.json
│       └── ...
├── agents/                # Agent-specific activity logs
│   ├── development/
│   │   └── YYYY-MM-DD.jsonl
│   ├── planning/
│   │   └── YYYY-MM-DD.jsonl
│   ├── monitoring/
│   │   └── YYYY-MM-DD.jsonl
│   └── communication/
│       └── YYYY-MM-DD.jsonl
├── summaries/             # Quick scan summaries
│   ├── daily/
│   │   └── YYYY-MM-DD.json
│   └── weekly/
│       └── YYYY-WW.json
└── analytics/             # Aggregated metrics
    ├── performance/
    │   └── YYYY-MM.json
    └── trends/
        └── YYYY-MM.json
```

## Log Levels

### Level Definitions

| Level    | Code | Usage | Examples |
|----------|------|-------|----------|
| DEBUG    | 10   | Detailed technical information for troubleshooting | Tool calls, variable states, algorithm steps |
| INFO     | 20   | General operational events | Task started, file modified, commit created |
| WARN     | 30   | Warning messages, potential issues | Deprecated usage, high resource usage |
| ERROR    | 40   | Error events that don't stop operation | API call failed, test failed, parsing error |
| CRITICAL | 50   | Failures requiring immediate attention | System crash, data loss, security breach |

## Log Entry Formats

### 1. Session Log Entry

Complete transcript of Claude Code session interactions.

```json
{
  "session_id": "sess_20251226_143052",
  "start_time": "2025-12-26T14:30:52Z",
  "end_time": "2025-12-26T14:45:30Z",
  "duration_seconds": 878,
  "user": "Luciano Naganawa",
  "input_channel": "claude_code_cli",
  "tasks_completed": 3,
  "tasks_failed": 0,
  "messages": [
    {
      "timestamp": "2025-12-26T14:30:52Z",
      "role": "user",
      "content": "Add logging to the authentication module"
    },
    {
      "timestamp": "2025-12-26T14:31:05Z",
      "role": "assistant",
      "content": "I'll add comprehensive logging to the authentication module...",
      "tool_calls": [
        {
          "tool": "Read",
          "parameters": {"file_path": "src/auth.ts"},
          "result": "success"
        }
      ]
    }
  ],
  "files_modified": ["src/auth.ts", "src/auth.test.ts"],
  "commits": ["a1b2c3d"],
  "total_tokens": 15432,
  "cost_usd": 0.23
}
```

### 2. Agent Activity Log Entry

Individual agent actions in JSONL format (one JSON object per line).

```jsonl
{"timestamp":"2025-12-26T14:35:22Z","level":"INFO","agent":"development","action":"file_read","details":{"file":"src/auth.ts","lines":145},"duration_ms":23,"session_id":"sess_20251226_143052","task_id":"task_auth_001"}
{"timestamp":"2025-12-26T14:35:45Z","level":"INFO","agent":"development","action":"file_modified","details":{"file":"src/auth.ts","lines_added":12,"lines_removed":3,"operation":"add_logging"},"duration_ms":1234,"session_id":"sess_20251226_143052","task_id":"task_auth_001"}
{"timestamp":"2025-12-26T14:36:10Z","level":"INFO","agent":"review","action":"code_review","details":{"file":"src/auth.ts","issues":0,"suggestions":2},"duration_ms":567,"session_id":"sess_20251226_143052","task_id":"task_auth_001"}
```

### 3. Daily Summary

Quick scan overview of the day's activities.

```json
{
  "date": "2025-12-26",
  "summary": {
    "tasks": {
      "total": 15,
      "completed": 12,
      "failed": 2,
      "pending": 1,
      "by_priority": {
        "critical": 1,
        "high": 4,
        "medium": 7,
        "low": 3
      }
    },
    "agents": {
      "active": ["development", "monitoring", "review", "communication"],
      "total_actions": 87,
      "by_type": {
        "development": 45,
        "planning": 12,
        "monitoring": 15,
        "review": 10,
        "communication": 5
      }
    },
    "files": {
      "modified": 8,
      "created": 2,
      "deleted": 1,
      "total_lines_changed": 243
    },
    "git": {
      "commits": 3,
      "branches": ["main", "feature/logging"],
      "commits_detail": [
        {
          "hash": "a1b2c3d",
          "message": "feat: add logging to auth module",
          "files": 2,
          "lines": 15
        }
      ]
    },
    "errors": [
      {
        "type": "connection_timeout",
        "count": 1,
        "severity": "ERROR",
        "first_seen": "2025-12-26T10:23:15Z"
      },
      {
        "type": "test_failure",
        "count": 1,
        "severity": "ERROR",
        "first_seen": "2025-12-26T14:15:30Z",
        "resolved": true
      }
    ],
    "performance": {
      "avg_task_duration_seconds": 234,
      "total_tokens_used": 45231,
      "total_cost_usd": 2.15,
      "cache_hit_rate": 0.67
    },
    "notifications": {
      "sent": 2,
      "by_urgency": {
        "critical": 0,
        "high": 1,
        "medium": 1,
        "low": 0
      }
    },
    "achievements": [
      {
        "type": "feature",
        "description": "Implemented comprehensive logging system",
        "impact": "high"
      },
      {
        "type": "optimization",
        "description": "Database query optimization: 30% faster",
        "impact": "medium",
        "metrics": {
          "before_ms": 450,
          "after_ms": 315,
          "improvement_percent": 30
        }
      },
      {
        "type": "quality",
        "description": "Added 25 new unit tests",
        "impact": "medium",
        "metrics": {
          "coverage_before": 72,
          "coverage_after": 78
        }
      }
    ],
    "self_improvements": [
      {
        "description": "Refactored duplicate code in utils module",
        "files_affected": 3,
        "lines_saved": 45
      }
    ]
  },
  "next_actions": [
    {
      "priority": "high",
      "description": "Resolve pending test failure in payment module",
      "deadline": "2025-12-27"
    }
  ]
}
```

### 4. Weekly Summary

Aggregated weekly metrics and trends.

```json
{
  "week": "2025-W52",
  "date_range": {
    "start": "2025-12-22",
    "end": "2025-12-28"
  },
  "summary": {
    "tasks_completed": 78,
    "tasks_failed": 5,
    "success_rate": 0.94,
    "total_commits": 15,
    "files_modified": 45,
    "lines_changed": 1234,
    "tests_added": 67,
    "documentation_updates": 12
  },
  "trends": {
    "task_completion_rate": {
      "current_week": 0.94,
      "last_week": 0.91,
      "change": "+3.3%"
    },
    "avg_task_duration": {
      "current_week_seconds": 245,
      "last_week_seconds": 287,
      "change": "-14.6%"
    },
    "error_rate": {
      "current_week": 0.06,
      "last_week": 0.09,
      "change": "-33.3%"
    }
  },
  "top_achievements": [
    "Implemented complete logging system",
    "Optimized database queries (30% improvement)",
    "Increased test coverage to 78% (+6%)",
    "Automated 5 manual workflows"
  ],
  "areas_for_improvement": [
    "Reduce connection timeout errors",
    "Improve test coverage in payment module",
    "Update legacy documentation"
  ],
  "cost": {
    "total_usd": 15.67,
    "avg_per_day": 2.24,
    "tokens_used": 234567
  }
}
```

### 5. Analytics Log Entry

Performance and trend data.

```json
{
  "timestamp": "2025-12-26T23:59:59Z",
  "period": "daily",
  "metrics": {
    "agent_performance": {
      "development": {
        "tasks": 45,
        "avg_duration_seconds": 234,
        "success_rate": 0.96,
        "errors": 2
      },
      "planning": {
        "tasks": 12,
        "avg_duration_seconds": 156,
        "success_rate": 1.0,
        "errors": 0
      }
    },
    "resource_usage": {
      "tokens": {
        "total": 45231,
        "by_model": {
          "sonnet": 42150,
          "haiku": 3081
        }
      },
      "api_calls": 234,
      "cache_hits": 157,
      "cache_misses": 77
    },
    "code_quality": {
      "test_coverage": 78.5,
      "complexity_score": 6.2,
      "duplication_percent": 3.1,
      "documentation_percent": 85.0
    },
    "patterns": {
      "most_common_tasks": [
        {"type": "code_modification", "count": 45},
        {"type": "test_addition", "count": 25},
        {"type": "documentation", "count": 12}
      ],
      "peak_hours": ["14:00-16:00", "09:00-11:00"],
      "common_errors": [
        {"type": "connection_timeout", "count": 1},
        {"type": "test_failure", "count": 1}
      ]
    }
  }
}
```

## Logging Best Practices

### What to Log

**Always Log:**
- Task start and completion
- Agent actions and decisions
- File system changes
- Git operations
- Approval requests and responses
- Errors and exceptions
- Performance metrics
- Resource usage
- Notifications sent

**Never Log:**
- Sensitive data (passwords, API keys, tokens)
- Personal information (unless anonymized)
- Full file contents (only metadata)
- Redundant information

### Log Formatting

**Use Structured Format:**
```json
{
  "timestamp": "ISO 8601 format",
  "level": "INFO|WARN|ERROR|CRITICAL",
  "component": "agent_name or system_component",
  "action": "action_performed",
  "details": {},
  "duration_ms": 1234,
  "session_id": "sess_xxx",
  "task_id": "task_xxx"
}
```

**Include Context:**
- Session ID (links all operations in a session)
- Task ID (links all operations for a task)
- Timestamps (for sequencing and performance)
- Duration (for performance analysis)

### Log Retention

**Short-term (30 days):**
- Session logs (detailed)
- Agent activity logs

**Medium-term (90 days):**
- Daily summaries
- Error logs

**Long-term (1 year):**
- Weekly summaries
- Analytics data
- Performance trends

**Archive:**
- Monthly aggregates kept indefinitely

## Quick Scan Guide

### Daily Quick Scan (2 minutes)

1. **Open daily summary**
   ```bash
   cat logs/summaries/daily/$(date +%Y-%m-%d).json
   ```

2. **Check key metrics:**
   - Tasks completed vs. failed
   - Any critical/high errors
   - Key achievements

3. **Review notifications:**
   - Were all important events notified?
   - Any missed alerts?

4. **Plan actions:**
   - Address any failures
   - Review pending approvals
   - Prioritize follow-ups

### Weekly Review (15 minutes)

1. **Check weekly summary**
2. **Review trends:**
   - Is performance improving?
   - Are error rates decreasing?
   - Is quality improving?

3. **Analyze patterns:**
   - Most common tasks
   - Peak usage times
   - Recurring errors

4. **Plan improvements:**
   - Optimize slow operations
   - Reduce common errors
   - Enhance automation

## Log Analysis Tools

### Command-Line Tools

**View today's summary:**
```bash
cat logs/summaries/daily/$(date +%Y-%m-%d).json | jq '.'
```

**Count errors by type:**
```bash
grep -h '"level":"ERROR"' logs/agents/*/$(date +%Y-%m-%d).jsonl | \
  jq -r '.details.error_type' | sort | uniq -c
```

**Find slow tasks:**
```bash
grep -h '"action":"task_complete"' logs/agents/*/$(date +%Y-%m-%d).jsonl | \
  jq 'select(.duration_ms > 60000)'
```

**Top agents by activity:**
```bash
grep -h '' logs/agents/*/$(date +%Y-%m-%d).jsonl | \
  jq -r '.agent' | sort | uniq -c | sort -rn
```

### Programmatic Access

Logs are in JSON/JSONL format for easy programmatic analysis:

```javascript
// Example: Load and analyze daily summary
const fs = require('fs');
const summary = JSON.parse(
  fs.readFileSync('logs/summaries/daily/2025-12-26.json')
);

console.log(`Success rate: ${
  summary.summary.tasks.completed / summary.summary.tasks.total * 100
}%`);
```

## Integration Points

### Dashboard Integration

Logs feed real-time dashboards:
- Live task execution status
- Performance metrics
- Error alerts
- Resource usage

### Alert System

Monitoring agents scan logs for:
- Critical errors → Immediate notification
- Pattern anomalies → Warning notification
- Performance degradation → Investigation

### Analytics Engine

Analytics agents process logs to:
- Identify optimization opportunities
- Predict resource needs
- Recommend improvements
- Generate insights

## Log Security

### Access Control
- Logs directory readable only by system
- Sensitive data redacted before logging
- Log rotation with encryption option

### Audit Trail
- All log access is logged
- Tampering detection via checksums
- Immutable archival storage

---

*Last updated: 2025-12-26*
