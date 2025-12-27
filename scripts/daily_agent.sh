#!/bin/bash
#
# Daily Agent - Autonomous Daily Routine
# Runs every morning to prepare the day
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs/autonomous"
TIMESTAMP=$(date +"%Y%m%d")
LOG_FILE="$LOG_DIR/daily_$TIMESTAMP.log"

mkdir -p "$LOG_DIR"

echo "========================================" | tee "$LOG_FILE"
echo "Daily Agent - $(date)" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Run morning briefing
claude -p "Good morning! As the autonomous agent, perform the daily morning briefing:

1. PROFESSIONAL PERFORMANCE
   - Review today's calendar and meetings
   - Identify top 3 priorities for today
   - Update daily_state.json with current status
   - Check for any urgent tasks

2. ASSET GENERATION
   - Check if any websites need content updates
   - Review revenue metrics if available
   - Identify opportunities for new assets

3. PERSONAL IMPROVEMENT
   - Review habit tracking
   - Check task list for today
   - Any reminders or notes to surface

4. DAILY SUMMARY
   - Create a brief morning briefing (3-5 bullet points)
   - Save to logs/autonomous/briefing_$(date +%Y%m%d).md

Keep the briefing concise and actionable.
Current time: $(date +%H:%M)" \
  --add-dir "$PROJECT_DIR" \
  --allowedTools "Bash,Read,Write,Edit,TodoWrite" \
  --max-turns 8 \
  --output-format json \
  2>&1 | tee -a "$LOG_FILE"

EXIT_CODE=${PIPESTATUS[0]}

if [ $EXIT_CODE -eq 0 ]; then
    echo "" | tee -a "$LOG_FILE"
    echo "✓ Daily briefing completed" | tee -a "$LOG_FILE"
else
    echo "" | tee -a "$LOG_FILE"
    echo "✗ Daily briefing failed with code $EXIT_CODE" | tee -a "$LOG_FILE"
fi

exit $EXIT_CODE
