#!/bin/bash
#
# Autonomous Agent Runner
# Runs Claude Code autonomously to work on objectives
#

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs/autonomous"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/run_$TIMESTAMP.log"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Create log directory
mkdir -p "$LOG_DIR"

# Log function
log() {
    echo -e "${BLUE}[$(date +"%Y-%m-%d %H:%M:%S")]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${YELLOW}ℹ${NC} $1" | tee -a "$LOG_FILE"
}

# Start
log "==================================="
log "Autonomous Agent Run Starting"
log "==================================="
log_info "Project: auto-agent"
log_info "Log file: $LOG_FILE"
echo ""

# Check if claude is available
if ! command -v claude &> /dev/null; then
    log "ERROR: claude command not found"
    log "Install from: https://claude.com/claude-code"
    exit 1
fi

# Run autonomous session
log "Starting autonomous Claude Code session..."
log_info "Max turns: 10"
log_info "Allowed tools: Bash, Read, Write, Edit, Glob, Grep"
echo ""

# Execute Claude in autonomous mode
claude -p "You are the autonomous agent for the auto-agent system.

Your task is to:
1. Review the four main objectives (Asset Generation, Professional Performance, Personal Improvement, Personal Projects)
2. Check for any pending tasks or opportunities
3. Execute high-value activities:
   - For Asset Generation: Consider generating new content or websites if beneficial
   - For Professional Performance: Review and organize tasks, update daily state
   - For Personal Improvement: Check for task/habit updates needed
   - For Personal Projects: Review project status
4. Log what you accomplished in logs/autonomous/
5. Identify what should be done next

Work autonomously but be conservative - only make changes that are clearly beneficial.
Provide a summary of what you did at the end.

Current working directory: $PROJECT_DIR
Current date/time: $(date)" \
  --add-dir "$PROJECT_DIR" \
  --allowedTools "Bash,Read,Write,Edit,Glob,Grep,TodoWrite" \
  --max-turns 10 \
  --output-format json \
  2>&1 | tee -a "$LOG_FILE"

# Capture exit code
EXIT_CODE=${PIPESTATUS[0]}

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    log_success "Autonomous run completed successfully"
else
    log "WARNING: Autonomous run exited with code $EXIT_CODE"
fi

log "==================================="
log "Full log saved to: $LOG_FILE"
log "==================================="

# Keep only last 30 log files
cd "$LOG_DIR"
ls -t run_*.log | tail -n +31 | xargs rm -f 2>/dev/null || true

exit $EXIT_CODE
