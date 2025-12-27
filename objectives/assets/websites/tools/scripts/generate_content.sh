#!/bin/bash
#
# Generate Content for Gaming Website
# Creates multiple gaming articles using AI content generator
#
# Usage: ./generate_content.sh <website-name> <article-count> [content-type]
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOOLS_DIR="$(dirname "$SCRIPT_DIR")"
ASSETS_DIR="$(dirname "$TOOLS_DIR")"
DEPLOYED_DIR="$ASSETS_DIR/websites/deployed"

# Functions
print_header() {
    echo -e "${BLUE}=================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Validate arguments
if [ -z "$1" ]; then
    print_error "Website name is required"
    echo "Usage: ./generate_content.sh <website-name> <article-count> [content-type]"
    echo ""
    echo "Examples:"
    echo "  ./generate_content.sh indie-games-hub 20"
    echo "  ./generate_content.sh retro-rpg-hub 10 reviews"
    echo "  ./generate_content.sh mobile-gaming-tips 5 guides"
    exit 1
fi

WEBSITE_NAME="$1"
ARTICLE_COUNT="${2:-10}"
CONTENT_TYPE="${3:-mixed}"  # reviews, guides, top-lists, or mixed

WEBSITE_DIR="$DEPLOYED_DIR/$WEBSITE_NAME"

# Validate website exists
if [ ! -d "$WEBSITE_DIR" ]; then
    print_error "Website not found: $WEBSITE_DIR"
    echo "Create it first with: ./create_gaming_website.sh $WEBSITE_NAME"
    exit 1
fi

# Check for API key
if [ -z "$ANTHROPIC_API_KEY" ]; then
    print_error "ANTHROPIC_API_KEY environment variable not set"
    echo ""
    echo "Please set your Claude API key:"
    echo "  export ANTHROPIC_API_KEY='your-api-key-here'"
    echo ""
    echo "Get your API key at: https://console.anthropic.com/"
    exit 1
fi

# Check for Python and required packages
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is required but not installed"
    exit 1
fi

# Check if anthropic package is installed
if ! python3 -c "import anthropic" 2>/dev/null; then
    print_error "anthropic Python package not installed"
    echo "Install it with: pip install anthropic"
    exit 1
fi

# Load site configuration
CONFIG_FILE="$WEBSITE_DIR/config/site.json"
if [ ! -f "$CONFIG_FILE" ]; then
    print_error "Site configuration not found: $CONFIG_FILE"
    exit 1
fi

SITE_NAME=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE'))['site']['name'])")
NICHE=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE'))['site']['niche'])")

print_header "Content Generation for $SITE_NAME"
echo ""
echo "Configuration:"
echo "  Website: $WEBSITE_NAME"
echo "  Site Name: $SITE_NAME"
echo "  Niche: $NICHE"
echo "  Articles: $ARTICLE_COUNT"
echo "  Type: $CONTENT_TYPE"
echo ""

# Game lists by niche
declare -A INDIE_GAMES=(
    ["Hollow Knight"]="Action:Platformer"
    ["Celeste"]="Action:Platformer"
    ["Stardew Valley"]="Simulation:RPG"
    ["Dead Cells"]="Action:Roguelike"
    ["Hades"]="Action:Roguelike"
    ["Undertale"]="RPG:Adventure"
    ["Terraria"]="Sandbox:Adventure"
    ["Slay the Spire"]="Strategy:Roguelike"
    ["Cuphead"]="Action:Platformer"
    ["Ori and the Blind Forest"]="Platformer:Adventure"
    ["Factorio"]="Strategy:Simulation"
    ["RimWorld"]="Strategy:Simulation"
    ["Shovel Knight"]="Action:Platformer"
    ["The Binding of Isaac"]="Action:Roguelike"
    ["FTL: Faster Than Light"]="Strategy:Roguelike"
    ["Into the Breach"]="Strategy:Puzzle"
    ["Katana ZERO"]="Action:Platformer"
    ["Hyper Light Drifter"]="Action:Adventure"
    ["Oxenfree"]="Adventure:Narrative"
    ["Night in the Woods"]="Adventure:Narrative"
)

declare -A RPG_GAMES=(
    ["The Witcher 3"]="RPG:Action"
    ["Skyrim"]="RPG:Action"
    ["Divinity Original Sin 2"]="RPG:Strategy"
    ["Baldur's Gate 3"]="RPG:Strategy"
    ["Dark Souls 3"]="RPG:Action"
    ["Elden Ring"]="RPG:Action"
    ["Final Fantasy XIV"]="MMORPG:RPG"
    ["Persona 5"]="JRPG:RPG"
    ["Dragon Age Inquisition"]="RPG:Action"
    ["Mass Effect Legendary Edition"]="RPG:Action"
)

declare -A MOBILE_GAMES=(
    ["Genshin Impact"]="Action:RPG"
    ["PUBG Mobile"]="Shooter:Battle Royale"
    ["Among Us"]="Social:Strategy"
    ["Clash Royale"]="Strategy:Card"
    ["Brawl Stars"]="Action:MOBA"
    ["Monument Valley"]="Puzzle:Adventure"
    ["Alto's Odyssey"]="Casual:Endless Runner"
    ["Stardew Valley Mobile"]="Simulation:RPG"
    ["Dead Cells Mobile"]="Action:Roguelike"
    ["Call of Duty Mobile"]="Shooter:Action"
)

# Select game list based on niche
case "$NICHE" in
    indie)
        declare -n GAMES=INDIE_GAMES
        ;;
    rpg)
        declare -n GAMES=RPG_GAMES
        ;;
    mobile)
        declare -n GAMES=MOBILE_GAMES
        ;;
    *)
        declare -n GAMES=INDIE_GAMES
        ;;
esac

# Convert associative array to indexed array for random selection
GAME_NAMES=("${!GAMES[@]}")
GAME_COUNT=${#GAME_NAMES[@]}

if [ "$ARTICLE_COUNT" -gt "$GAME_COUNT" ]; then
    print_info "Requested $ARTICLE_COUNT articles but only $GAME_COUNT games available"
    print_info "Will generate content for all $GAME_COUNT games"
    ARTICLE_COUNT=$GAME_COUNT
fi

# Shuffle game list
SHUFFLED_GAMES=($(printf '%s\n' "${GAME_NAMES[@]}" | shuf))

# Generate articles
GENERATED=0
FAILED=0

print_header "Generating Articles"
echo ""

for i in $(seq 0 $((ARTICLE_COUNT - 1))); do
    GAME_NAME="${SHUFFLED_GAMES[$i]}"
    GENRE_INFO="${GAMES[$GAME_NAME]}"
    GENRE="${GENRE_INFO%%:*}"

    # Determine content type
    if [ "$CONTENT_TYPE" = "mixed" ]; then
        # 70% reviews, 20% guides, 10% lists
        RAND=$((RANDOM % 100))
        if [ $RAND -lt 70 ]; then
            TYPE="review"
        elif [ $RAND -lt 90 ]; then
            TYPE="guide"
        else
            TYPE="top-list"
        fi
    else
        TYPE="$CONTENT_TYPE"
    fi

    # Determine output directory and filename
    case "$TYPE" in
        review)
            OUTPUT_DIR="$WEBSITE_DIR/content/reviews"
            FILENAME=$(echo "$GAME_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr ':' '-')-review.md
            ;;
        guide)
            OUTPUT_DIR="$WEBSITE_DIR/content/guides"
            FILENAME=$(echo "$GAME_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr ':' '-')-guide.md
            ;;
        top-list)
            OUTPUT_DIR="$WEBSITE_DIR/content/top-lists"
            FILENAME="top-10-$GENRE-games-2025.md"
            ;;
    esac

    mkdir -p "$OUTPUT_DIR"
    OUTPUT_FILE="$OUTPUT_DIR/$FILENAME"

    # Skip if file already exists
    if [ -f "$OUTPUT_FILE" ]; then
        print_info "Skipping (already exists): $FILENAME"
        continue
    fi

    echo -n "[$((i + 1))/$ARTICLE_COUNT] Generating $TYPE for '$GAME_NAME'... "

    # Generate content
    if [ "$TYPE" = "review" ]; then
        python3 "$SCRIPT_DIR/content_generator.py" review \
            --game "$GAME_NAME" \
            --genre "$GENRE" \
            --niche "$NICHE" \
            --site-name "$SITE_NAME" \
            --output "$OUTPUT_FILE" \
            > /dev/null 2>&1
    elif [ "$TYPE" = "guide" ]; then
        python3 "$SCRIPT_DIR/content_generator.py" guide \
            --game "$GAME_NAME" \
            --niche "$NICHE" \
            --output "$OUTPUT_FILE" \
            > /dev/null 2>&1
    else
        python3 "$SCRIPT_DIR/content_generator.py" top-list \
            --category "$GENRE" \
            --output "$OUTPUT_FILE" \
            > /dev/null 2>&1
    fi

    if [ $? -eq 0 ]; then
        WORD_COUNT=$(wc -w < "$OUTPUT_FILE")
        echo -e "${GREEN}✓ ($WORD_COUNT words)${NC}"
        ((GENERATED++))
    else
        echo -e "${RED}✗ Failed${NC}"
        ((FAILED++))
    fi

    # Add small delay to avoid rate limiting
    sleep 2
done

# Summary
echo ""
print_header "Content Generation Complete"
echo ""
echo "Results:"
echo "  ✓ Generated: $GENERATED articles"
if [ $FAILED -gt 0 ]; then
    echo "  ✗ Failed: $FAILED articles"
fi
echo ""
echo "Content location: $WEBSITE_DIR/content/"
echo ""
echo "Next steps:"
echo "  1. Review generated articles: cd $WEBSITE_DIR/content/"
echo "  2. Build website: ./build_website.sh $WEBSITE_NAME"
echo "  3. Deploy: ./deploy_website.sh $WEBSITE_NAME netlify"
echo ""
print_success "Content ready! 🎮"
