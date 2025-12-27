#!/bin/bash
#
# Deploy Gaming Website
# Deploys website to various hosting platforms
#
# Usage: ./deploy_website.sh <website-name> <platform>
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

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Validate arguments
if [ -z "$1" ] || [ -z "$2" ]; then
    print_error "Website name and platform are required"
    echo "Usage: ./deploy_website.sh <website-name> <platform>"
    echo ""
    echo "Platforms:"
    echo "  netlify    - Netlify (recommended, free tier)"
    echo "  vercel     - Vercel (Next.js optimized)"
    echo "  github     - GitHub Pages"
    echo "  surge      - Surge.sh (simple static hosting)"
    echo ""
    echo "Examples:"
    echo "  ./deploy_website.sh indie-games-hub netlify"
    echo "  ./deploy_website.sh retro-rpg-hub vercel"
    echo "  ./deploy_website.sh mobile-gaming-tips github"
    exit 1
fi

WEBSITE_NAME="$1"
PLATFORM="$2"

WEBSITE_DIR="$DEPLOYED_DIR/$WEBSITE_NAME"
PUBLIC_DIR="$WEBSITE_DIR/public"

# Validate website exists
if [ ! -d "$WEBSITE_DIR" ]; then
    print_error "Website not found: $WEBSITE_DIR"
    echo "Create it first with: ./create_gaming_website.sh $WEBSITE_NAME"
    exit 1
fi

# Validate build exists
if [ ! -d "$PUBLIC_DIR" ]; then
    print_error "Built website not found: $PUBLIC_DIR"
    echo "Build it first with: ./build_website.sh $WEBSITE_NAME"
    exit 1
fi

# Load site configuration
CONFIG_FILE="$WEBSITE_DIR/config/site.json"
SITE_NAME=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE'))['site']['name'])" 2>/dev/null || echo "$WEBSITE_NAME")

print_header "Deploying Website: $SITE_NAME"
echo ""
echo "Configuration:"
echo "  Website: $WEBSITE_NAME"
echo "  Platform: $PLATFORM"
echo "  Source: $PUBLIC_DIR"
echo ""

# Deploy based on platform
case "$PLATFORM" in
    netlify)
        print_header "Deploying to Netlify"

        # Check if Netlify CLI is installed
        if ! command -v netlify &> /dev/null; then
            print_error "Netlify CLI not installed"
            echo ""
            echo "Install Netlify CLI:"
            echo "  npm install -g netlify-cli"
            echo ""
            echo "Then login:"
            echo "  netlify login"
            echo ""
            echo "After setup, run this command again."
            exit 1
        fi

        # Check if already initialized
        if [ ! -f "$WEBSITE_DIR/.netlify/state.json" ]; then
            print_info "First time deployment - initializing Netlify site..."
            cd "$WEBSITE_DIR"
            netlify init --manual
        fi

        # Deploy
        print_info "Deploying to Netlify..."
        cd "$WEBSITE_DIR"
        netlify deploy --prod --dir=public

        if [ $? -eq 0 ]; then
            print_success "Deployed to Netlify!"

            # Get URL
            SITE_URL=$(netlify status --json | python3 -c "import sys, json; print(json.load(sys.stdin)['site_url'])" 2>/dev/null || echo "")
            if [ -n "$SITE_URL" ]; then
                echo ""
                echo "Live URL: $SITE_URL"
            fi
        else
            print_error "Deployment failed"
            exit 1
        fi
        ;;

    vercel)
        print_header "Deploying to Vercel"

        if ! command -v vercel &> /dev/null; then
            print_error "Vercel CLI not installed"
            echo ""
            echo "Install Vercel CLI:"
            echo "  npm install -g vercel"
            echo ""
            echo "Then login:"
            echo "  vercel login"
            exit 1
        fi

        print_info "Deploying to Vercel..."
        cd "$WEBSITE_DIR"
        vercel --prod --yes

        if [ $? -eq 0 ]; then
            print_success "Deployed to Vercel!"
        else
            print_error "Deployment failed"
            exit 1
        fi
        ;;

    github)
        print_header "Deploying to GitHub Pages"

        # Check if git repo exists
        if [ ! -d "$WEBSITE_DIR/.git" ]; then
            print_error "Not a git repository"
            echo ""
            echo "Initialize git repository first:"
            echo "  cd $WEBSITE_DIR"
            echo "  git init"
            echo "  git remote add origin <your-github-repo-url>"
            exit 1
        fi

        print_info "Deploying to GitHub Pages..."
        cd "$WEBSITE_DIR"

        # Push to gh-pages branch
        git --work-tree=public add --all
        git --work-tree=public commit -m "Deploy website - $(date +%Y-%m-%d)" || true
        git push origin main:gh-pages --force

        if [ $? -eq 0 ]; then
            print_success "Deployed to GitHub Pages!"
            echo ""
            echo "Your site will be available at:"
            echo "  https://<username>.github.io/<repo-name>/"
            echo ""
            echo "Enable GitHub Pages in repository settings if not done already."
        else
            print_error "Deployment failed"
            exit 1
        fi
        ;;

    surge)
        print_header "Deploying to Surge.sh"

        if ! command -v surge &> /dev/null; then
            print_error "Surge CLI not installed"
            echo ""
            echo "Install Surge:"
            echo "  npm install -g surge"
            exit 1
        fi

        print_info "Deploying to Surge..."
        cd "$PUBLIC_DIR"

        # Deploy with custom domain or auto-generated
        SURGE_DOMAIN="${WEBSITE_NAME}.surge.sh"
        surge . "$SURGE_DOMAIN"

        if [ $? -eq 0 ]; then
            print_success "Deployed to Surge!"
            echo ""
            echo "Live URL: https://$SURGE_DOMAIN"
        else
            print_error "Deployment failed"
            exit 1
        fi
        ;;

    *)
        print_error "Unknown platform: $PLATFORM"
        echo ""
        echo "Supported platforms: netlify, vercel, github, surge"
        exit 1
        ;;
esac

# Post-deployment checklist
print_header "Post-Deployment Checklist"
echo ""
echo "✓ Website deployed successfully!"
echo ""
echo "Next steps:"
echo ""
echo "1. Verify website is accessible"
echo "2. Submit sitemap to Google Search Console"
echo "   - Sitemap URL: <your-domain>/sitemap.xml"
echo ""
echo "3. Set up Google Analytics"
echo "   - Add tracking ID to config/site.json"
echo "   - Rebuild and redeploy"
echo ""
echo "4. Apply for Google AdSense"
echo "   - Need 20-30 articles and steady traffic"
echo "   - Apply at: google.com/adsense"
echo ""
echo "5. Set up affiliate accounts"
echo "   - Amazon Associates: affiliate-program.amazon.com"
echo "   - Humble Bundle: humblebundle.com/partner"
echo ""
echo "6. Monitor performance"
echo "   - Check traffic in Google Analytics"
echo "   - Monitor rankings in Search Console"
echo "   - Track revenue from AdSense dashboard"
echo ""
print_success "Deployment complete! 🚀"
