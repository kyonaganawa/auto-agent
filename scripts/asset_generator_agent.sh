#!/bin/bash
#
# Asset Generator Agent
# Autonomous agent focused on creating and managing digital assets
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs/autonomous"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/asset_generation_$TIMESTAMP.log"

mkdir -p "$LOG_DIR"

echo "========================================" | tee "$LOG_FILE"
echo "Asset Generator Agent - $(date)" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Mode selection
MODE="${1:-check}"  # check, generate, optimize

case "$MODE" in
    check)
        PROMPT="Review the asset generation system:

1. Check existing websites in objectives/assets/websites/deployed/
2. Analyze performance and status of each
3. Identify opportunities:
   - Websites that need more content
   - New niche opportunities
   - Content updates needed
4. Provide recommendations without making changes
5. Save analysis to logs/autonomous/asset_analysis_$(date +%Y%m%d).md"
        ;;

    generate)
        PROMPT="Generate a new asset:

1. Review existing assets and identify gaps
2. Select the best niche/category for a new website
3. Use the automation scripts to:
   - Create website structure
   - Generate initial content (suggest 10-20 articles)
   - Build and prepare for deployment
4. Document the new asset in logs/
5. Provide next steps for deployment

NOTE: Do NOT deploy automatically - wait for human approval.
NOTE: Check if ANTHROPIC_API_KEY is set before generating content."
        ;;

    optimize)
        PROMPT="Optimize existing assets:

1. Review all websites in objectives/assets/websites/deployed/
2. For each website:
   - Check content quality and quantity
   - Analyze SEO optimization
   - Review monetization setup
3. Make improvements:
   - Add missing configuration
   - Update content if needed
   - Fix any issues found
4. Document changes made
5. Provide performance improvement summary"
        ;;

    *)
        echo "Usage: $0 [check|generate|optimize]"
        echo ""
        echo "Modes:"
        echo "  check    - Review assets and identify opportunities (default)"
        echo "  generate - Create a new asset (website)"
        echo "  optimize - Improve existing assets"
        exit 1
        ;;
esac

echo "Mode: $MODE" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Run autonomous session
claude -p "$PROMPT

Current date/time: $(date)
Working directory: $PROJECT_DIR/objectives/assets" \
  --add-dir "$PROJECT_DIR/objectives/assets" \
  --allowedTools "Bash,Read,Write,Edit,Glob,Grep" \
  --max-turns 15 \
  --output-format json \
  2>&1 | tee -a "$LOG_FILE"

EXIT_CODE=${PIPESTATUS[0]}

echo "" | tee -a "$LOG_FILE"
if [ $EXIT_CODE -eq 0 ]; then
    echo "✓ Asset generation task completed" | tee -a "$LOG_FILE"
else
    echo "✗ Asset generation task failed with code $EXIT_CODE" | tee -a "$LOG_FILE"
fi

echo "Log saved to: $LOG_FILE" | tee -a "$LOG_FILE"

exit $EXIT_CODE
