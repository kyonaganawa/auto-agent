# Autonomous Agent Scripts

Automation scripts for running the auto-agent system autonomously.

## Overview

These scripts enable the auto-agent system to run continuously and autonomously without manual intervention, working on objectives, generating assets, and managing tasks.

## Scripts

### 1. autonomous_run.sh

**General-purpose autonomous runner** - Reviews all objectives and performs high-value activities.

**Usage:**
```bash
./autonomous_run.sh
```

**What it does:**
- Reviews all four objectives (Assets, Professional, Personal, Projects)
- Identifies pending tasks and opportunities
- Executes beneficial activities autonomously
- Logs all actions taken
- Provides summary of accomplishments

**Configuration:**
- Max turns: 10
- Allowed tools: Bash, Read, Write, Edit, Glob, Grep, TodoWrite
- Logs to: `logs/autonomous/run_TIMESTAMP.log`

### 2. daily_agent.sh

**Morning briefing agent** - Runs daily to prepare the day.

**Usage:**
```bash
./daily_agent.sh
```

**What it does:**
- Reviews today's calendar and priorities (Professional)
- Checks asset generation opportunities
- Reviews habit tracking and tasks (Personal)
- Creates concise morning briefing
- Saves briefing to `logs/autonomous/briefing_DATE.md`

**Recommended schedule:**
```bash
# Add to crontab (crontab -e)
0 9 * * * /path/to/auto-agent/scripts/daily_agent.sh
```

### 3. asset_generator_agent.sh

**Asset generation specialist** - Focuses on creating and optimizing digital assets.

**Usage:**
```bash
# Check status and identify opportunities
./asset_generator_agent.sh check

# Generate a new asset (website)
./asset_generator_agent.sh generate

# Optimize existing assets
./asset_generator_agent.sh optimize
```

**Modes:**

| Mode | Description | Max Turns |
|------|-------------|-----------|
| `check` | Review assets, identify opportunities (safe, read-only) | 15 |
| `generate` | Create new website with content (requires ANTHROPIC_API_KEY) | 15 |
| `optimize` | Improve existing assets (content, SEO, config) | 15 |

**What it does:**
- Check mode: Analysis and recommendations only
- Generate mode: Creates new gaming website with initial content
- Optimize mode: Improves existing websites (content, SEO, monetization)

**Logs to:** `logs/autonomous/asset_generation_TIMESTAMP.log`

## Setup

### Prerequisites

1. **Claude Code CLI installed**
   ```bash
   # Check if installed
   claude --version

   # If not installed, get from:
   # https://claude.com/claude-code
   ```

2. **API Key (for asset generation)**
   ```bash
   # Add to your shell profile (~/.zshrc or ~/.bashrc)
   export ANTHROPIC_API_KEY='sk-ant-api03-...'
   ```

3. **Make scripts executable**
   ```bash
   chmod +x scripts/*.sh
   ```

### Quick Start

```bash
# Test autonomous run (manual)
./scripts/autonomous_run.sh

# View the log
tail -f logs/autonomous/run_*.log

# Run daily briefing
./scripts/daily_agent.sh

# Check asset status
./scripts/asset_generator_agent.sh check
```

## Scheduling Autonomous Runs

### Option 1: Cron (Traditional Unix Scheduling)

```bash
# Edit crontab
crontab -e

# Add these lines:

# Daily morning briefing at 9 AM
0 9 * * * /Users/outsmart104/Documents/Projects/Personal/auto-agent/scripts/daily_agent.sh

# General autonomous run 3x daily (9 AM, 1 PM, 6 PM)
0 9,13,18 * * * /Users/outsmart104/Documents/Projects/Personal/auto-agent/scripts/autonomous_run.sh

# Asset generation check every Monday at 10 AM
0 10 * * 1 /Users/outsmart104/Documents/Projects/Personal/auto-agent/scripts/asset_generator_agent.sh check

# Asset optimization every Friday at 5 PM
0 17 * * 5 /Users/outsmart104/Documents/Projects/Personal/auto-agent/scripts/asset_generator_agent.sh optimize
```

**Cron syntax reference:**
```
* * * * *
│ │ │ │ │
│ │ │ │ └─ Day of week (0-7, 0=Sunday)
│ │ │ └─── Month (1-12)
│ │ └───── Day of month (1-31)
│ └─────── Hour (0-23)
└───────── Minute (0-59)
```

### Option 2: GitHub Actions (Event-Driven)

Create `.github/workflows/autonomous-agent.yml`:

```yaml
name: Autonomous Agent

on:
  schedule:
    # Daily at 9 AM UTC
    - cron: "0 9 * * *"

  # Allow manual trigger
  workflow_dispatch:
    inputs:
      mode:
        description: 'Agent mode'
        required: true
        default: 'daily'
        type: choice
        options:
          - daily
          - general
          - assets-check
          - assets-generate
          - assets-optimize

jobs:
  run-agent:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Install Claude Code
        uses: anthropics/setup-claude-code@v1

      - name: Run Daily Agent
        if: github.event.inputs.mode == 'daily' || github.event_name == 'schedule'
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: ./scripts/daily_agent.sh

      - name: Run General Agent
        if: github.event.inputs.mode == 'general'
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: ./scripts/autonomous_run.sh

      - name: Run Asset Generator
        if: startsWith(github.event.inputs.mode, 'assets-')
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          MODE=$(echo "${{ github.event.inputs.mode }}" | cut -d'-' -f2)
          ./scripts/asset_generator_agent.sh $MODE

      - name: Commit changes
        run: |
          git config user.name "Autonomous Agent"
          git config user.email "agent@auto-agent.local"
          git add logs/
          git commit -m "chore: autonomous run $(date +%Y-%m-%d)" || true
          git push
```

**Trigger manually:**
- Go to GitHub Actions tab
- Select "Autonomous Agent" workflow
- Click "Run workflow"
- Choose mode

### Option 3: launchd (macOS System Scheduling)

More reliable than cron on macOS:

Create `~/Library/LaunchAgents/com.auto-agent.daily.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.auto-agent.daily</string>

    <key>ProgramArguments</key>
    <array>
        <string>/Users/outsmart104/Documents/Projects/Personal/auto-agent/scripts/daily_agent.sh</string>
    </array>

    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>9</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>

    <key>StandardOutPath</key>
    <string>/tmp/auto-agent-daily.log</string>

    <key>StandardErrorPath</key>
    <string>/tmp/auto-agent-daily-error.log</string>
</dict>
</plist>
```

**Load the agent:**
```bash
launchctl load ~/Library/LaunchAgents/com.auto-agent.daily.plist

# Check status
launchctl list | grep auto-agent

# Unload (to disable)
launchctl unload ~/Library/LaunchAgents/com.auto-agent.daily.plist
```

## Monitoring & Logs

### Log Files

All autonomous runs create detailed logs:

```bash
# View all logs
ls -lth logs/autonomous/

# Recent run logs
logs/autonomous/run_YYYYMMDD_HHMMSS.log

# Daily briefings
logs/autonomous/briefing_YYYYMMDD.md

# Asset generation
logs/autonomous/asset_generation_YYYYMMDD_HHMMSS.log
logs/autonomous/asset_analysis_YYYYMMDD.md
```

### Monitor Logs in Real-Time

```bash
# Watch most recent log
tail -f logs/autonomous/run_*.log | tail -1

# Watch daily briefings
watch cat logs/autonomous/briefing_$(date +%Y%m%d).md

# Monitor all autonomous activity
tail -f logs/autonomous/*.log
```

### Log Retention

- Autonomous run logs: Keep last 30 runs (automatic cleanup)
- Daily briefings: Kept indefinitely
- Asset generation logs: Kept indefinitely

## Configuration

### Modify Max Turns

Edit the script and change `--max-turns`:

```bash
# In autonomous_run.sh
--max-turns 10   # Change to 15, 20, etc.
```

### Modify Allowed Tools

Control what the agent can do:

```bash
# Conservative (safe)
--allowedTools "Read,Glob,Grep"

# Moderate (recommended)
--allowedTools "Bash,Read,Write,Edit,Glob,Grep,TodoWrite"

# Aggressive (use with caution)
--dangerously-skip-permissions
```

### Customize Prompts

Edit the `claude -p "..."` section in each script to modify behavior.

## Security & Safety

### What the Autonomous Agent CAN Do

✅ Read files and analyze code
✅ Create new files and directories
✅ Edit existing files
✅ Run safe bash commands (git, build scripts)
✅ Update TODO lists and logs
✅ Generate content via API

### What the Autonomous Agent CANNOT Do

❌ Delete files (Edit tool doesn't support deletion)
❌ Execute dangerous commands (no `rm -rf`, `sudo`, etc.)
❌ Push to git without explicit approval
❌ Deploy websites without human confirmation
❌ Spend money without API key limits

### Recommended Safety Measures

1. **Set API Key Limits**
   ```bash
   # In Claude Console, set usage limits
   # Recommended: $50/month cap
   ```

2. **Review Logs Regularly**
   ```bash
   # Daily review
   cat logs/autonomous/briefing_$(date +%Y%m%d).md
   ```

3. **Git Review Before Pushing**
   ```bash
   git diff  # Review changes made by agent
   git log   # Review agent commits
   ```

4. **Start Conservative**
   - Begin with `check` modes (read-only)
   - Gradually enable write operations
   - Monitor for a week before full automation

## Troubleshooting

### Agent Not Running

**Check if Claude Code is installed:**
```bash
which claude
claude --version
```

**Check script permissions:**
```bash
chmod +x scripts/*.sh
```

### API Key Errors

**Verify key is set:**
```bash
echo $ANTHROPIC_API_KEY
```

**Add to shell profile:**
```bash
echo 'export ANTHROPIC_API_KEY="sk-ant-..."' >> ~/.zshrc
source ~/.zshrc
```

### Cron Not Working

**Check cron service:**
```bash
# View cron logs
tail -f /var/log/syslog | grep CRON  # Linux
log show --predicate 'process == "cron"' --last 1h  # macOS
```

**Use full paths in crontab:**
```bash
# BAD: Relative paths
0 9 * * * ./scripts/daily_agent.sh

# GOOD: Absolute paths
0 9 * * * /Users/outsmart104/Documents/Projects/Personal/auto-agent/scripts/daily_agent.sh
```

### Logs Not Being Created

**Ensure log directory exists:**
```bash
mkdir -p /Users/outsmart104/Documents/Projects/Personal/auto-agent/logs/autonomous
```

**Check file permissions:**
```bash
ls -la logs/autonomous/
chmod 755 logs/autonomous
```

## Cost Estimation

### Per Autonomous Run

| Script | Avg Tokens | Cost (Sonnet 4.5) | Frequency |
|--------|------------|-------------------|-----------|
| daily_agent.sh | 50K-100K | $0.15-0.30 | Daily |
| autonomous_run.sh | 100K-200K | $0.30-0.60 | 3x/day |
| asset_generator_agent.sh (check) | 30K-50K | $0.09-0.15 | Weekly |
| asset_generator_agent.sh (generate) | 200K-400K | $0.60-1.20 | As needed |

### Monthly Cost Estimate

**Conservative setup** (daily briefing only):
- 30 daily runs × $0.20 = **$6/month**

**Moderate setup** (3x daily + weekly asset check):
- 90 general runs × $0.40 = $36
- 4 asset checks × $0.12 = $0.48
- **Total: ~$37/month**

**Aggressive setup** (hourly runs + weekly asset generation):
- 720 general runs × $0.40 = $288
- 4 asset generations × $1.00 = $4
- **Total: ~$292/month**

**Recommended:** Start with conservative, scale as ROI proves value.

## Best Practices

1. **Start Small**
   - Run scripts manually first
   - Review logs for a week
   - Gradually increase automation

2. **Monitor Costs**
   - Check Claude Console usage daily
   - Set spending limits
   - Adjust frequency based on value

3. **Review Agent Actions**
   - Read daily briefings
   - Check git commits
   - Verify asset generation quality

4. **Iterate and Improve**
   - Modify prompts based on results
   - Adjust max-turns for efficiency
   - Add new specialized agents as needed

## Examples

### Example 1: Development Workflow

```bash
# Morning: Get briefing
./scripts/daily_agent.sh

# Noon: Check progress
./scripts/autonomous_run.sh

# Evening: Generate weekly asset
./scripts/asset_generator_agent.sh generate
```

### Example 2: Asset Production Pipeline

```bash
# Monday: Check opportunities
./scripts/asset_generator_agent.sh check

# Wednesday: Generate new site
./scripts/asset_generator_agent.sh generate

# Friday: Optimize existing
./scripts/asset_generator_agent.sh optimize

# Review and deploy over weekend
```

### Example 3: Hands-Off Automation

```bash
# Set up cron for full automation
crontab -e

# Add:
0 9 * * * /path/to/scripts/daily_agent.sh
0 */6 * * * /path/to/scripts/autonomous_run.sh
0 10 * * 1 /path/to/scripts/asset_generator_agent.sh check

# Result: Agent runs 4x/day + weekly asset check
# Cost: ~$40/month
# Manual effort: Review logs 5 min/day
```

## Next Steps

1. **Test the scripts manually:**
   ```bash
   ./scripts/autonomous_run.sh
   cat logs/autonomous/run_*.log
   ```

2. **Set up daily briefing:**
   ```bash
   crontab -e
   # Add: 0 9 * * * /path/to/daily_agent.sh
   ```

3. **Monitor for one week:**
   - Review logs daily
   - Check agent decisions
   - Verify no issues

4. **Scale up automation:**
   - Add more frequent runs
   - Enable asset generation
   - Trust the agent more

---

**Created:** 2025-12-27
**Version:** 1.0.0
**Status:** Production Ready

Your autonomous agent is ready to work 24/7! 🤖
