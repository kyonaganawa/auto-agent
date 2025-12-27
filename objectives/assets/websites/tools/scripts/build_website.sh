#!/bin/bash
#
# Build Gaming Website
# Compiles markdown content into deployable static site
#
# Usage: ./build_website.sh <website-name> [builder]
#

set -e

# Colors
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
    echo "Usage: ./build_website.sh <website-name> [builder]"
    echo ""
    echo "Builders: hugo (default), nextjs, astro, simple"
    echo ""
    echo "Examples:"
    echo "  ./build_website.sh indie-games-hub"
    echo "  ./build_website.sh indie-games-hub hugo"
    echo "  ./build_website.sh indie-games-hub simple"
    exit 1
fi

WEBSITE_NAME="$1"
BUILDER="${2:-simple}"  # Default to simple static builder

WEBSITE_DIR="$DEPLOYED_DIR/$WEBSITE_NAME"
BUILD_DIR="$WEBSITE_DIR/build"
PUBLIC_DIR="$WEBSITE_DIR/public"

# Validate website exists
if [ ! -d "$WEBSITE_DIR" ]; then
    print_error "Website not found: $WEBSITE_DIR"
    echo "Create it first with: ./create_gaming_website.sh $WEBSITE_NAME"
    exit 1
fi

# Load site configuration
CONFIG_FILE="$WEBSITE_DIR/config/site.json"
SITE_NAME=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE'))['site']['name'])" 2>/dev/null || echo "$WEBSITE_NAME")

print_header "Building Website: $SITE_NAME"
echo ""
echo "Configuration:"
echo "  Website: $WEBSITE_NAME"
echo "  Builder: $BUILDER"
echo "  Source: $WEBSITE_DIR"
echo "  Output: $PUBLIC_DIR"
echo ""

# Count content
REVIEW_COUNT=$(find "$WEBSITE_DIR/content/reviews" -name "*.md" -type f 2>/dev/null | wc -l)
GUIDE_COUNT=$(find "$WEBSITE_DIR/content/guides" -name "*.md" -type f 2>/dev/null | wc -l)
LIST_COUNT=$(find "$WEBSITE_DIR/content/top-lists" -name "*.md" -type f 2>/dev/null | wc -l)
TOTAL_CONTENT=$((REVIEW_COUNT + GUIDE_COUNT + LIST_COUNT))

echo "Content Overview:"
echo "  Reviews: $REVIEW_COUNT"
echo "  Guides: $GUIDE_COUNT"
echo "  Top Lists: $LIST_COUNT"
echo "  Total: $TOTAL_CONTENT articles"
echo ""

if [ "$TOTAL_CONTENT" -eq 0 ]; then
    print_error "No content found!"
    echo "Generate content first: ./generate_content.sh $WEBSITE_NAME 20"
    exit 1
fi

# Clean previous build
if [ -d "$PUBLIC_DIR" ]; then
    print_info "Cleaning previous build..."
    rm -rf "$PUBLIC_DIR"
fi

mkdir -p "$PUBLIC_DIR"

# Build based on selected builder
print_header "Building Site with $BUILDER"

case "$BUILDER" in
    hugo)
        print_info "Using Hugo static site generator..."
        if ! command -v hugo &> /dev/null; then
            print_error "Hugo not installed. Install from https://gohugo.io/"
            print_info "Falling back to simple builder..."
            BUILDER="simple"
        else
            # TODO: Implement Hugo build
            print_error "Hugo builder not yet implemented"
            print_info "Falling back to simple builder..."
            BUILDER="simple"
        fi
        ;;

    nextjs)
        print_info "Using Next.js..."
        if ! command -v npm &> /dev/null; then
            print_error "npm not installed"
            print_info "Falling back to simple builder..."
            BUILDER="simple"
        else
            # TODO: Implement Next.js build
            print_error "Next.js builder not yet implemented"
            print_info "Falling back to simple builder..."
            BUILDER="simple"
        fi
        ;;

    astro)
        print_info "Using Astro..."
        # TODO: Implement Astro build
        print_error "Astro builder not yet implemented"
        print_info "Falling back to simple builder..."
        BUILDER="simple"
        ;;
esac

# Simple static builder (fallback/default)
if [ "$BUILDER" = "simple" ]; then
    print_info "Using simple HTML generator..."

    # Run Python builder
    python3 "$SCRIPT_DIR/simple_builder.py" "$WEBSITE_DIR" "$PUBLIC_DIR"

    if [ $? -ne 0 ]; then
        print_error "Build failed"
        exit 1
    fi
fi

print_success "Build completed"

# Generate sitemap
print_info "Generating sitemap..."
python3 "$SCRIPT_DIR/generate_sitemap.py" "$WEBSITE_DIR" "$PUBLIC_DIR"
print_success "Sitemap generated"

# Copy static assets
if [ -d "$WEBSITE_DIR/static" ]; then
    print_info "Copying static assets..."
    cp -r "$WEBSITE_DIR/static/"* "$PUBLIC_DIR/" 2>/dev/null || true
    print_success "Static assets copied"
fi

# Build summary
print_header "Build Summary"
echo ""

# Count output files
HTML_COUNT=$(find "$PUBLIC_DIR" -name "*.html" -type f 2>/dev/null | wc -l)
TOTAL_SIZE=$(du -sh "$PUBLIC_DIR" 2>/dev/null | cut -f1)

echo "Output Statistics:"
echo "  HTML Pages: $HTML_COUNT"
echo "  Total Size: $TOTAL_SIZE"
echo "  Output Dir: $PUBLIC_DIR"
echo ""

# Check for index.html
if [ -f "$PUBLIC_DIR/index.html" ]; then
    print_success "Homepage created: index.html"
else
    print_error "Warning: index.html not found"
fi

# Next steps
echo "Next Steps:"
echo ""
echo "  1. Preview locally:"
echo "     ${GREEN}cd $PUBLIC_DIR && python3 -m http.server 8000${NC}"
echo "     Then open: http://localhost:8000"
echo ""
echo "  2. Deploy to hosting:"
echo "     ${GREEN}./deploy_website.sh $WEBSITE_NAME netlify${NC}"
echo ""

print_success "Build complete! 🎉"
