#!/bin/bash
#
# Generate site.json configuration for a gaming website
#
# Usage: ./generate_site_config.sh <website-name> <niche>
#

WEBSITE_NAME="$1"
NICHE="${2:-indie}"

# Convert website name to title case
SITE_TITLE=$(echo "$WEBSITE_NAME" | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')

# Generate tagline based on niche
case "$NICHE" in
    indie)
        TAGLINE="Your Ultimate Guide to Indie Gaming"
        DESCRIPTION="Discover the best indie games with comprehensive reviews, guides, and curated lists."
        ;;
    rpg)
        TAGLINE="Your RPG Gaming Headquarters"
        DESCRIPTION="In-depth RPG game reviews, character builds, and expert guides for roleplaying game enthusiasts."
        ;;
    mobile)
        TAGLINE="Mobile Gaming Done Right"
        DESCRIPTION="Reviews and guides for the best mobile games across iOS and Android platforms."
        ;;
    retro)
        TAGLINE="Celebrating Classic Gaming"
        DESCRIPTION="Retro game reviews, nostalgia, and guides for classic gaming enthusiasts."
        ;;
    strategy)
        TAGLINE="Master the Art of Strategy Gaming"
        DESCRIPTION="Expert strategy game reviews, tactics, and guides for competitive gamers."
        ;;
    *)
        TAGLINE="Your Guide to Gaming Excellence"
        DESCRIPTION="Comprehensive gaming reviews, guides, and curated content for gamers."
        ;;
esac

# Generate JSON configuration
cat << EOF
{
  "site": {
    "name": "$SITE_TITLE",
    "tagline": "$TAGLINE",
    "description": "$DESCRIPTION",
    "url": "https://$WEBSITE_NAME.com",
    "language": "en",
    "author": "$SITE_TITLE Team",
    "niche": "$NICHE",
    "created": "$(date +"%Y-%m-%d")"
  },
  "seo": {
    "default_meta_description": "$DESCRIPTION Find your next gaming obsession with our expert reviews and guides.",
    "keywords": [
      "${NICHE} games",
      "${NICHE} game reviews",
      "best ${NICHE} games",
      "${NICHE} game guides",
      "gaming reviews",
      "game recommendations"
    ],
    "og_image": "/static/images/og-image.jpg",
    "twitter_card": "summary_large_image",
    "twitter_handle": "@${WEBSITE_NAME//-/}"
  },
  "monetization": {
    "google_adsense": {
      "enabled": true,
      "publisher_id": "ca-pub-XXXXXXXX",
      "ad_slots": {
        "header": "1234567890",
        "sidebar": "0987654321",
        "in_content": "1122334455",
        "end_article": "5544332211"
      },
      "notes": "Replace with actual AdSense IDs after approval"
    },
    "affiliates": {
      "amazon": {
        "enabled": true,
        "tag": "${WEBSITE_NAME//-/}-20",
        "notes": "Sign up at affiliate-program.amazon.com"
      },
      "humble_bundle": {
        "enabled": true,
        "affiliate_id": "${WEBSITE_NAME//-/}",
        "notes": "Sign up at humblebundle.com/partner"
      },
      "steam": {
        "enabled": true,
        "curator_id": "XXXXXXXX",
        "notes": "Apply for Steam Curator program"
      },
      "g2a": {
        "enabled": false,
        "affiliate_id": "",
        "notes": "Optional - sign up at g2a.com/goldmine"
      }
    },
    "sponsored_content": {
      "enabled": false,
      "min_traffic": 10000,
      "rate_per_post": 100,
      "notes": "Enable when traffic reaches 10k monthly visitors"
    }
  },
  "social": {
    "twitter": "https://twitter.com/${WEBSITE_NAME//-/}",
    "reddit": "https://reddit.com/r/${WEBSITE_NAME//-/}",
    "discord": "https://discord.gg/${WEBSITE_NAME//-/}",
    "youtube": "https://youtube.com/@${WEBSITE_NAME//-/}",
    "instagram": "https://instagram.com/${WEBSITE_NAME//-/}"
  },
  "analytics": {
    "google_analytics": {
      "enabled": true,
      "tracking_id": "G-XXXXXXXXXX",
      "notes": "Replace with actual GA4 tracking ID"
    },
    "search_console": {
      "enabled": true,
      "verification": "google-site-verification=XXXXXXXXXXXX",
      "notes": "Add after deploying website"
    },
    "hotjar": {
      "enabled": false,
      "site_id": "",
      "notes": "Optional - for heatmaps and user behavior"
    }
  },
  "features": {
    "newsletter": true,
    "comments": false,
    "dark_mode": true,
    "search": true,
    "related_posts": true,
    "reading_time": true,
    "table_of_contents": true,
    "social_sharing": true
  },
  "navigation": {
    "main": [
      {"label": "Reviews", "url": "/reviews/"},
      {"label": "Guides", "url": "/guides/"},
      {"label": "Top Lists", "url": "/top-lists/"},
      {"label": "News", "url": "/news/"},
      {"label": "About", "url": "/about/"}
    ],
    "footer": [
      {"label": "Privacy Policy", "url": "/privacy/"},
      {"label": "Terms of Service", "url": "/terms/"},
      {"label": "Contact", "url": "/contact/"},
      {"label": "Advertise", "url": "/advertise/"},
      {"label": "Affiliate Disclosure", "url": "/affiliate-disclosure/"}
    ]
  },
  "categories": {
    "reviews": {
      "title": "${NICHE^} Game Reviews",
      "description": "Honest, in-depth reviews of the latest ${NICHE} games",
      "subcategories": [
        "action",
        "adventure",
        "rpg",
        "puzzle",
        "platformer",
        "strategy",
        "simulation",
        "multiplayer"
      ]
    },
    "guides": {
      "title": "Game Guides & Tips",
      "description": "Complete walkthroughs and helpful tips for ${NICHE} games",
      "subcategories": [
        "beginner-tips",
        "advanced-strategies",
        "achievement-guides",
        "character-builds",
        "walkthroughs",
        "secrets"
      ]
    },
    "top-lists": {
      "title": "Top 10 Lists",
      "description": "Curated lists of the best ${NICHE} games",
      "subcategories": [
        "by-genre",
        "by-platform",
        "by-year",
        "hidden-gems",
        "best-of-all-time"
      ]
    },
    "news": {
      "title": "Gaming News",
      "description": "Latest ${NICHE} gaming news and updates",
      "subcategories": [
        "releases",
        "updates",
        "industry-news",
        "events"
      ]
    }
  },
  "content_settings": {
    "articles_per_page": 12,
    "excerpt_length": 150,
    "reading_time": true,
    "related_posts_count": 3,
    "popular_posts_count": 5,
    "recent_posts_count": 10,
    "min_article_length": 1500,
    "target_article_length": 2500,
    "images_per_article": 3
  },
  "performance": {
    "cache_duration": 3600,
    "image_optimization": true,
    "lazy_loading": true,
    "cdn_enabled": true,
    "minify_css": true,
    "minify_js": true
  }
}
EOF
