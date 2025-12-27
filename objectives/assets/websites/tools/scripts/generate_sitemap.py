#!/usr/bin/env python3
"""
Sitemap Generator
Creates XML sitemap for SEO
"""

import sys
import json
from pathlib import Path
from datetime import datetime
from urllib.parse import urljoin


def generate_sitemap(source_dir, output_dir):
    """Generate sitemap.xml"""
    source_path = Path(source_dir)
    output_path = Path(output_dir)

    # Load site config
    config_file = source_path / 'config' / 'site.json'
    if config_file.exists():
        with open(config_file) as f:
            config = json.load(f)
    else:
        config = {}

    site_url = config.get('site', {}).get('url', 'https://example.com')

    # Find all HTML files
    html_files = list(output_path.rglob('*.html'))

    # Start sitemap XML
    sitemap = ['<?xml version="1.0" encoding="UTF-8"?>']
    sitemap.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

    # Add URLs
    for html_file in html_files:
        rel_path = html_file.relative_to(output_path)

        # Convert path to URL
        if rel_path.name == 'index.html':
            if rel_path.parent == Path('.'):
                url_path = '/'
            else:
                url_path = f'/{rel_path.parent}/'
        else:
            url_path = f'/{rel_path}'

        full_url = urljoin(site_url, url_path)

        # Determine priority and changefreq based on path
        if url_path == '/':
            priority = '1.0'
            changefreq = 'daily'
        elif '/reviews/' in url_path or '/guides/' in url_path:
            priority = '0.8'
            changefreq = 'weekly'
        else:
            priority = '0.6'
            changefreq = 'monthly'

        # Get last modified date
        lastmod = datetime.fromtimestamp(html_file.stat().st_mtime).strftime('%Y-%m-%d')

        sitemap.append('  <url>')
        sitemap.append(f'    <loc>{full_url}</loc>')
        sitemap.append(f'    <lastmod>{lastmod}</lastmod>')
        sitemap.append(f'    <changefreq>{changefreq}</changefreq>')
        sitemap.append(f'    <priority>{priority}</priority>')
        sitemap.append('  </url>')

    sitemap.append('</urlset>')

    # Write sitemap
    sitemap_file = output_path / 'sitemap.xml'
    with open(sitemap_file, 'w') as f:
        f.write('\n'.join(sitemap))

    # Create robots.txt
    robots_content = f"""User-agent: *
Allow: /

Sitemap: {urljoin(site_url, '/sitemap.xml')}
"""

    robots_file = output_path / 'robots.txt'
    with open(robots_file, 'w') as f:
        f.write(robots_content)

    print(f"✓ Generated sitemap with {len(html_files)} URLs")
    print(f"✓ Created robots.txt")


def main():
    if len(sys.argv) < 3:
        print("Usage: generate_sitemap.py <source_dir> <output_dir>")
        sys.exit(1)

    source_dir = sys.argv[1]
    output_dir = sys.argv[2]

    generate_sitemap(source_dir, output_dir)


if __name__ == '__main__':
    main()
