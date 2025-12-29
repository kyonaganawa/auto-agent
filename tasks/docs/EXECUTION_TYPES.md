# Task Execution Types

The task system supports three execution types: **Claude Code sessions**, **pre-created scripts**, and **hybrid** (script + Claude).

## Execution Types Overview

| Type | Description | Use Cases | Requires Prompt | Requires Script |
|------|-------------|-----------|----------------|----------------|
| **claude_session** | Execute via Claude Code with AI prompt | Creative tasks, code generation, analysis | ✅ Yes | ❌ No |
| **script** | Execute pre-created shell script | Deterministic operations, builds, deployments | ❌ No | ✅ Yes |
| **hybrid** | Run script first, then Claude reviews | Generate + review, build + analyze | ✅ Optional | ✅ Yes |

---

## 1. Claude Session (AI-Powered)

**When to use:**
- Tasks requiring AI reasoning and creativity
- Code generation and refactoring
- Content creation and analysis
- Complex decision-making
- Exploratory tasks

**How it works:**
1. Task includes a `prompt` field
2. Executor runs `claude -p "prompt"` with appropriate flags
3. Claude Code executes autonomously
4. Output logged and parsed
5. Task marked complete/failed based on exit code

### Example: Content Generation

```typescript
{
  title: 'Generate Weekly Gaming Article',
  description: 'Create SEO-optimized gaming article for indie-games-hub',
  execution_type: 'claude_session',
  prompt: `Generate a 2000-word game review for a popular indie game released this week.

  Requirements:
  - SEO-optimized title and meta description
  - Include gameplay analysis, graphics review, pros/cons
  - Add FAQs and affiliate links
  - Save to objectives/assets/websites/deployed/indie-games-hub/content/reviews/`,

  system: 'asset_generator',
  priority: 'medium',
  timeout_seconds: 1800,  // 30 minutes
}
```

### Example: Code Analysis

```typescript
{
  title: 'Analyze Codebase for Performance Issues',
  description: 'Review entire codebase and identify performance bottlenecks',
  execution_type: 'claude_session',
  prompt: `Analyze the codebase for performance issues:

  1. Identify slow algorithms (O(n²) or worse)
  2. Find unnecessary re-renders in React components
  3. Detect memory leaks
  4. Check for inefficient database queries
  5. Provide specific recommendations with file:line references

  Create a report in logs/performance_analysis_$(date).md`,

  system: 'autonomous_agent',
  priority: 'high',
  timeout_seconds: 3600,  // 1 hour
}
```

---

## 2. Script Execution (Deterministic)

**When to use:**
- Build and test operations
- Deployments
- Database migrations
- Backup operations
- Scheduled maintenance
- Deterministic workflows

**How it works:**
1. Task includes `script_path` and optional `script_args`
2. Executor runs the script directly
3. Script arguments passed as command-line args
4. Output logged
5. Task marked complete/failed based on exit code

### Example: Run Build and Tests

```typescript
{
  title: 'Build and Test - Frontend',
  description: 'Run complete frontend build and test suite',
  execution_type: 'script',
  script_path: 'scripts/build_and_test.sh',
  script_args: {
    component: 'frontend',
    env: 'production',
  },

  system: 'autonomous_agent',
  priority: 'high',
  timeout_seconds: 1200,  // 20 minutes
  recurrence: 'daily',
  scheduled_for: '2025-12-30T02:00:00Z',  // 2 AM daily
}
```

**Script: scripts/build_and_test.sh**
```bash
#!/bin/bash
set -e

COMPONENT=$1
ENV=$2

echo "Building $COMPONENT for $ENV environment..."

cd $COMPONENT
npm install
npm run build
npm test

echo "✓ Build and tests completed successfully"
```

### Example: Deploy Website

```typescript
{
  title: 'Deploy indie-games-hub to Netlify',
  description: 'Deploy website to production',
  execution_type: 'script',
  script_path: 'objectives/assets/websites/tools/scripts/deploy_website.sh',
  script_args: {
    website: 'indie-games-hub',
    platform: 'netlify',
  },

  system: 'asset_generator',
  priority: 'high',
  timeout_seconds: 600,  // 10 minutes
}
```

### Example: Database Backup

```typescript
{
  title: 'Daily Database Backup',
  description: 'Backup Supabase database to S3',
  execution_type: 'script',
  script_path: 'scripts/backup_database.sh',
  script_args: {
    database: 'auto-agent-tasks',
    destination: 's3://backups/daily/',
  },

  system: 'autonomous_agent',
  priority: 'critical',
  recurrence: 'daily',
  scheduled_for: '2025-12-30T03:00:00Z',  // 3 AM daily
  timeout_seconds: 3600,  // 1 hour
}
```

---

## 3. Hybrid Execution (Best of Both)

**When to use:**
- Generate content then AI reviews quality
- Build project then analyze for issues
- Run tests then AI suggests fixes
- Deploy then verify with AI

**How it works:**
1. Script executes first (deterministic part)
2. Script output captured
3. If `prompt` provided, Claude session executes
4. Claude receives script output as context
5. Claude can review, analyze, or take action
6. Combined result logged

### Example: Generate and Review Content

```typescript
{
  title: 'Generate + Review 10 Gaming Articles',
  description: 'Generate articles then AI reviews for quality',
  execution_type: 'hybrid',

  // Script generates content
  script_path: 'objectives/assets/websites/tools/scripts/generate_content.sh',
  script_args: {
    website: 'indie-games-hub',
    count: '10',
  },

  // Claude reviews after generation
  prompt: `The content generation script has completed. Review the generated articles:

  1. Check for SEO optimization (titles, meta, keywords)
  2. Verify content quality and originality
  3. Ensure proper formatting and structure
  4. Check for broken links or missing images
  5. Provide quality score for each article (1-10)
  6. Suggest improvements

  Create a summary report in logs/content_review_$(date).md`,

  system: 'asset_generator',
  priority: 'medium',
  timeout_seconds: 3600,  // 1 hour total (split between script and Claude)
}
```

### Example: Build and Analyze

```typescript
{
  title: 'Build Project and Analyze Bundle',
  description: 'Build production bundle and analyze for optimization',
  execution_type: 'hybrid',

  // Script builds project
  script_path: 'scripts/build_production.sh',
  script_args: {
    analyze: 'true',
  },

  // Claude analyzes build output
  prompt: `Analyze the production build output:

  1. Identify large dependencies that can be optimized
  2. Find duplicate code across bundles
  3. Detect unused code (tree-shaking opportunities)
  4. Check for inefficient imports
  5. Suggest bundle splitting strategies

  Provide specific recommendations with estimated size savings.`,

  system: 'autonomous_agent',
  priority: 'medium',
  timeout_seconds: 1800,  // 30 minutes
}
```

### Example: Test and Fix

```typescript
{
  title: 'Run Tests and Auto-Fix Failures',
  description: 'Execute test suite, then AI fixes failures',
  execution_type: 'hybrid',

  // Script runs tests
  script_path: 'scripts/run_tests.sh',
  script_args: {
    suite: 'all',
  },

  // Claude fixes failures (if any)
  prompt: `Test suite execution completed.

  If there are failures:
  1. Analyze each failure
  2. Identify root cause
  3. Implement fixes
  4. Re-run tests to verify
  5. Create summary of fixes applied

  If all tests passed:
  - Confirm all tests green
  - No action needed`,

  system: 'autonomous_agent',
  priority: 'high',
  timeout_seconds: 2400,  // 40 minutes
}
```

---

## Configuring Execution Type

### Via Dashboard

When creating/editing a task in the dashboard:

1. **Execution Type** dropdown:
   - "Claude Code Session" (default)
   - "Script Execution"
   - "Hybrid (Script + Claude)"

2. **Conditional fields:**
   - If **Script** or **Hybrid**: Show "Script Path" and "Script Arguments" fields
   - If **Claude Session** or **Hybrid**: Show "AI Prompt" field

### Via API

```typescript
import { taskService } from './services/task.service';

// Claude session task
const claudeTask = await taskService.createTask({
  title: 'Analyze code quality',
  description: 'Review codebase for quality issues',
  execution_type: 'claude_session',
  prompt: 'Analyze code and provide recommendations...',
  system: 'autonomous_agent',
});

// Script task
const scriptTask = await taskService.createTask({
  title: 'Deploy website',
  description: 'Deploy to production',
  execution_type: 'script',
  script_path: 'scripts/deploy.sh',
  script_args: { environment: 'production' },
  system: 'autonomous_agent',
});

// Hybrid task
const hybridTask = await taskService.createTask({
  title: 'Build and review',
  description: 'Build project and AI reviews output',
  execution_type: 'hybrid',
  script_path: 'scripts/build.sh',
  script_args: { mode: 'production' },
  prompt: 'Review build output and suggest optimizations...',
  system: 'autonomous_agent',
});
```

### Via Templates

```sql
INSERT INTO task_templates (
  name,
  description,
  title_template,
  metadata
) VALUES (
  'Daily Build and Test',
  'Build project and run test suite daily',
  'Daily Build - {date}',
  jsonb_build_object(
    'execution_type', 'script',
    'script_path', 'scripts/daily_build.sh',
    'timeout_seconds', 1800
  )
);
```

---

## Script Requirements

### Script Best Practices

**1. Exit Codes**
```bash
#!/bin/bash
set -e  # Exit on any error

# Your script logic here

# Explicit exit codes
if [ $? -eq 0 ]; then
  exit 0  # Success
else
  exit 1  # Failure
fi
```

**2. Logging**
```bash
#!/bin/bash

# Log to stdout (captured by task executor)
echo "Starting deployment..."
echo "Step 1: Building project"
npm run build

echo "Step 2: Uploading to server"
# ...

echo "✓ Deployment completed successfully"
```

**3. Error Handling**
```bash
#!/bin/bash
set -e  # Exit on error

# Function for error handling
error_handler() {
  echo "ERROR: Deployment failed at line $1"
  exit 1
}

trap 'error_handler $LINENO' ERR

# Your deployment logic
```

**4. Arguments**
```bash
#!/bin/bash

# Parse arguments
COMPONENT=$1
ENV=$2

# Validate
if [ -z "$COMPONENT" ] || [ -z "$ENV" ]; then
  echo "Usage: $0 <component> <environment>"
  exit 1
fi

echo "Building $COMPONENT for $ENV..."
```

### Script Location

**Recommended structure:**
```
auto-agent/
├── scripts/
│   ├── build_and_test.sh       # General scripts
│   ├── deploy.sh
│   └── backup_database.sh
├── objectives/
│   ├── assets/
│   │   └── websites/
│   │       └── tools/
│   │           └── scripts/    # Asset-specific scripts
│   │               ├── deploy_website.sh
│   │               └── generate_content.sh
│   └── professional/
│       └── scripts/            # Professional-specific scripts
```

**Path resolution:**
- Absolute paths: `/full/path/to/script.sh`
- Relative paths: `scripts/build.sh` (relative to project root)

---

## Timeout Configuration

### Default Timeouts

| Execution Type | Default Timeout | Recommended Max |
|---------------|----------------|-----------------|
| claude_session | 3600s (1h) | 7200s (2h) |
| script | 3600s (1h) | 3600s (1h) |
| hybrid | 3600s (1h) | 7200s (2h) |

### Setting Timeouts

```typescript
{
  execution_type: 'script',
  script_path: 'scripts/long_running_task.sh',
  timeout_seconds: 7200,  // 2 hours
}
```

**Timeout handling:**
- Script/Claude killed after timeout
- Task marked as `failed`
- Error message: "Task execution timed out after X seconds"
- Partial logs preserved

---

## Execution Comparison

### Choosing the Right Type

**Use Claude Session when:**
- ✅ Task requires AI reasoning
- ✅ Creative or exploratory work
- ✅ Generating content or code
- ✅ Complex decision-making
- ✅ Analyzing unstructured data

**Use Script when:**
- ✅ Deterministic operations
- ✅ Build/test/deploy workflows
- ✅ Database operations
- ✅ File processing
- ✅ Scheduled maintenance
- ✅ Faster execution needed
- ✅ Lower cost required

**Use Hybrid when:**
- ✅ Script generates data, AI analyzes
- ✅ Build then review quality
- ✅ Deploy then verify
- ✅ Test then suggest fixes
- ✅ Best of both worlds

### Cost Comparison

**Claude Session:**
- Cost: $0.003 - $0.15 per task (varies by complexity)
- Time: 30s - 30min
- Tokens: 1K - 50K

**Script:**
- Cost: $0 (no API calls)
- Time: Seconds to minutes
- Tokens: 0

**Hybrid:**
- Cost: $0.003 - $0.15 (Claude portion only)
- Time: Script time + Claude time
- Tokens: 1K - 50K (Claude portion)

---

## Examples Repository

### Create Example Scripts

```bash
# Create scripts directory
mkdir -p scripts/examples

# Build and test script
cat > scripts/examples/build_and_test.sh << 'EOF'
#!/bin/bash
set -e

COMPONENT=${1:-frontend}
echo "Building $COMPONENT..."

cd $COMPONENT
npm install
npm run build
npm test

echo "✓ Build and tests completed"
EOF

chmod +x scripts/examples/build_and_test.sh
```

### Create Example Tasks

```typescript
// examples/task_examples.ts

// Example 1: Script task
const buildTask = {
  title: 'Daily Frontend Build',
  description: 'Build and test frontend daily',
  execution_type: 'script',
  script_path: 'scripts/examples/build_and_test.sh',
  script_args: { component: 'frontend' },
  recurrence: 'daily',
  scheduled_for: '2025-12-30T02:00:00Z',
};

// Example 2: Claude session task
const analysisTask = {
  title: 'Weekly Code Review',
  description: 'AI-powered code quality review',
  execution_type: 'claude_session',
  prompt: 'Review code quality and suggest improvements...',
  recurrence: 'weekly',
  scheduled_for: '2025-12-30T10:00:00Z',
};

// Example 3: Hybrid task
const deployAndVerifyTask = {
  title: 'Deploy and Verify',
  description: 'Deploy website and AI verifies deployment',
  execution_type: 'hybrid',
  script_path: 'scripts/deploy_website.sh',
  script_args: { website: 'indie-games-hub' },
  prompt: 'Verify deployment succeeded by checking website health...',
};
```

---

## Migration Guide

### Updating Existing Tasks

Existing tasks default to `claude_session`. To migrate:

**Option 1: Bulk Update Scripts**
```sql
-- Update all deployment tasks to script execution
UPDATE tasks
SET
  execution_type = 'script',
  script_path = 'scripts/deploy.sh',
  script_args = jsonb_build_object('website', metadata->>'website')
WHERE
  title LIKE '%Deploy%'
  AND execution_type = 'claude_session';
```

**Option 2: Templates**
```sql
-- Update template for deployment tasks
UPDATE task_templates
SET metadata = metadata || jsonb_build_object(
  'execution_type', 'script',
  'script_path', 'scripts/deploy_website.sh'
)
WHERE name LIKE '%Deploy%';
```

---

## Monitoring & Debugging

### Check Execution Type Distribution

```sql
SELECT
  execution_type,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_duration_seconds
FROM tasks
WHERE status = 'completed'
GROUP BY execution_type;
```

### View Recent Script Executions

```sql
SELECT
  id,
  title,
  script_path,
  script_args,
  started_at,
  completed_at,
  status
FROM tasks
WHERE execution_type = 'script'
ORDER BY created_at DESC
LIMIT 10;
```

### Analyze Hybrid Task Performance

```sql
SELECT
  title,
  EXTRACT(EPOCH FROM (completed_at - started_at)) as total_seconds,
  execution_log
FROM tasks
WHERE execution_type = 'hybrid'
  AND status = 'completed'
ORDER BY total_seconds DESC;
```

---

## Best Practices

✅ **DO:**
- Use scripts for deterministic, repeatable operations
- Use Claude sessions for AI-powered, creative tasks
- Use hybrid for generate-then-review workflows
- Set appropriate timeouts for each execution type
- Log verbosely in scripts for debugging
- Handle errors gracefully with clear messages
- Use exit codes (0 = success, non-zero = failure)

❌ **DON'T:**
- Use Claude sessions for simple file operations
- Use scripts for complex reasoning tasks
- Set timeouts too low (tasks will fail)
- Forget to make scripts executable (chmod +x)
- Mix execution types in recurring task series
- Ignore script exit codes

---

**See also:**
- [Main README](../README.md)
- [State Machine](STATE_MACHINE.md)
- [Task Service API](../services/task.service.ts)
- [Example Scripts](../../scripts/examples/)
