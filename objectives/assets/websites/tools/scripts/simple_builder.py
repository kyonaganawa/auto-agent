#!/usr/bin/env python3
"""
Simple Static Site Builder
Converts markdown content to HTML pages
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime
import re

try:
    import markdown
    from markdown.extensions.toc import TocExtension
    from markdown.extensions.codehilite import CodeHiliteExtension
    from markdown.extensions.fenced_code import FencedCodeExtension
except ImportError:
    print("Error: markdown package not installed")
    print("Install with: pip install markdown")
    sys.exit(1)


class SimpleBuilder:
    def __init__(self, source_dir, output_dir):
        self.source_dir = Path(source_dir)
        self.output_dir = Path(output_dir)
        self.config = self._load_config()

        # Initialize markdown processor
        self.md = markdown.Markdown(extensions=[
            'meta',
            'tables',
            'fenced_code',
            'codehilite',
            TocExtension(toc_depth='2-3'),
        ])

    def _load_config(self):
        """Load site configuration"""
        config_file = self.source_dir / 'config' / 'site.json'
        if config_file.exists():
            with open(config_file) as f:
                return json.load(f)
        return {}

    def _get_template(self, template_type='default'):
        """Get HTML template"""
        site_name = self.config.get('site', {}).get('name', 'Gaming Hub')
        site_url = self.config.get('site', {}).get('url', '')
        tagline = self.config.get('site', {}).get('tagline', '')
        description = self.config.get('site', {}).get('description', '')

        # Navigation
        nav_items = self.config.get('navigation', {}).get('main', [])
        nav_html = '\n'.join([
            f'<a href="{item["url"]}">{item["label"]}</a>'
            for item in nav_items
        ])

        # Footer navigation
        footer_items = self.config.get('navigation', {}).get('footer', [])
        footer_nav_html = '\n'.join([
            f'<a href="{item["url"]}">{item["label"]}</a>'
            for item in footer_items
        ])

        return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{{{title}}}} | {site_name}</title>
    <meta name="description" content="{{{{description}}}}">
    <meta property="og:title" content="{{{{title}}}} | {site_name}">
    <meta property="og:description" content="{{{{description}}}}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="{site_url}{{{{url}}}}">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="stylesheet" href="/css/style.css">
    <style>
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }}
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }}
        header {{
            background: #1a1a2e;
            color: white;
            padding: 1rem 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        header .container {{
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}
        header h1 {{
            font-size: 1.5rem;
            margin: 0;
        }}
        header p {{
            font-size: 0.9rem;
            opacity: 0.8;
            margin: 0;
        }}
        nav {{
            margin-top: 1rem;
        }}
        nav a {{
            color: white;
            text-decoration: none;
            padding: 0.5rem 1rem;
            margin: 0 0.25rem;
            border-radius: 4px;
            transition: background 0.3s;
        }}
        nav a:hover {{
            background: rgba(255,255,255,0.1);
        }}
        main {{
            background: white;
            margin: 2rem auto;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            max-width: 900px;
        }}
        article h1 {{
            font-size: 2.5rem;
            margin-bottom: 1rem;
            color: #1a1a2e;
        }}
        article h2 {{
            font-size: 1.8rem;
            margin-top: 2rem;
            margin-bottom: 1rem;
            color: #2d3748;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 0.5rem;
        }}
        article h3 {{
            font-size: 1.4rem;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
            color: #2d3748;
        }}
        article p {{
            margin-bottom: 1rem;
            line-height: 1.8;
        }}
        article ul, article ol {{
            margin-bottom: 1rem;
            margin-left: 2rem;
        }}
        article li {{
            margin-bottom: 0.5rem;
        }}
        article a {{
            color: #3182ce;
            text-decoration: none;
        }}
        article a:hover {{
            text-decoration: underline;
        }}
        article blockquote {{
            border-left: 4px solid #3182ce;
            padding-left: 1rem;
            margin: 1rem 0;
            font-style: italic;
            color: #666;
        }}
        article code {{
            background: #f7fafc;
            padding: 0.2rem 0.4rem;
            border-radius: 3px;
            font-family: "Courier New", monospace;
            font-size: 0.9em;
        }}
        article pre {{
            background: #2d3748;
            color: #e2e8f0;
            padding: 1rem;
            border-radius: 4px;
            overflow-x: auto;
            margin: 1rem 0;
        }}
        article pre code {{
            background: none;
            padding: 0;
            color: inherit;
        }}
        .meta-info {{
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e2e8f0;
        }}
        .rating {{
            display: inline-block;
            background: #48bb78;
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            font-weight: bold;
            margin-left: 0.5rem;
        }}
        footer {{
            background: #2d3748;
            color: white;
            padding: 2rem 0;
            margin-top: 3rem;
        }}
        footer .container {{
            text-align: center;
        }}
        footer nav {{
            margin-bottom: 1rem;
        }}
        footer nav a {{
            color: #cbd5e0;
            margin: 0 0.5rem;
        }}
        footer p {{
            color: #a0aec0;
            font-size: 0.9rem;
        }}
        .article-list {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }}
        .article-card {{
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: transform 0.3s, box-shadow 0.3s;
        }}
        .article-card:hover {{
            transform: translateY(-4px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }}
        .article-card h3 {{
            margin: 0 0 0.5rem 0;
        }}
        .article-card h3 a {{
            color: #1a1a2e;
            text-decoration: none;
        }}
        .article-card p {{
            color: #666;
            font-size: 0.9rem;
            margin: 0;
        }}
    </style>
</head>
<body>
    <header>
        <div class="container">
            <div>
                <h1>{site_name}</h1>
                <p>{tagline}</p>
            </div>
        </div>
        <div class="container">
            <nav>
                {nav_html}
            </nav>
        </div>
    </header>

    <main class="container">
        {{{{content}}}}
    </main>

    <footer>
        <div class="container">
            <nav>
                {footer_nav_html}
            </nav>
            <p>&copy; {datetime.now().year} {site_name}. All rights reserved.</p>
            <p style="font-size: 0.8rem; margin-top: 0.5rem;">
                Generated by Auto-Agent Asset Generation System
            </p>
        </div>
    </footer>
</body>
</html>"""

    def _process_markdown(self, content):
        """Convert markdown to HTML"""
        self.md.reset()
        html = self.md.convert(content)
        meta = getattr(self.md, 'Meta', {})
        return html, meta

    def _build_article(self, md_file, category):
        """Build a single article page"""
        with open(md_file, 'r') as f:
            content = f.read()

        html_content, meta = self._process_markdown(content)

        # Extract title from first h1
        title_match = re.search(r'^# (.+)$', content, re.MULTILINE)
        title = title_match.group(1) if title_match else md_file.stem

        # Extract description (first paragraph)
        desc_match = re.search(r'\n\n(.+?)\n\n', content, re.DOTALL)
        description = desc_match.group(1).strip()[:160] if desc_match else ""

        # Generate URL path
        rel_path = md_file.relative_to(self.source_dir / 'content')
        url_path = '/' + str(rel_path.with_suffix('.html'))

        # Fill template
        template = self._get_template()
        html = template.replace('{{title}}', title)
        html = html.replace('{{description}}', description)
        html = html.replace('{{url}}', url_path)
        html = html.replace('{{content}}', f'<article>{html_content}</article>')

        # Write output file
        output_file = self.output_dir / rel_path.with_suffix('.html')
        output_file.parent.mkdir(parents=True, exist_ok=True)

        with open(output_file, 'w') as f:
            f.write(html)

        return {
            'title': title,
            'url': url_path,
            'description': description,
            'category': category,
            'file': str(output_file)
        }

    def _build_index(self, articles):
        """Build homepage with article listings"""
        site_name = self.config.get('site', {}).get('name', 'Gaming Hub')
        description = self.config.get('site', {}).get('description', '')

        # Group articles by category
        by_category = {}
        for article in articles:
            cat = article['category']
            if cat not in by_category:
                by_category[cat] = []
            by_category[cat].append(article)

        # Build article cards
        content = f"""
<article>
    <h1>Welcome to {site_name}</h1>
    <p class="meta-info">{description}</p>
</article>
"""

        for category, cat_articles in sorted(by_category.items()):
            content += f"""
<section>
    <h2>{category.replace('-', ' ').title()}</h2>
    <div class="article-list">
"""
            for article in cat_articles[:6]:  # Show max 6 per category
                content += f"""
        <div class="article-card">
            <h3><a href="{article['url']}">{article['title']}</a></h3>
            <p>{article['description'][:120]}...</p>
        </div>
"""
            content += """
    </div>
</section>
"""

        template = self._get_template()
        html = template.replace('{{title}}', 'Home')
        html = html.replace('{{description}}', description)
        html = html.replace('{{url}}', '/')
        html = html.replace('{{content}}', content)

        index_file = self.output_dir / 'index.html'
        with open(index_file, 'w') as f:
            f.write(html)

        print(f"✓ Created homepage: index.html")

    def build(self):
        """Build the entire site"""
        print("Building static site...")

        # Find all markdown files
        content_dir = self.source_dir / 'content'
        md_files = list(content_dir.rglob('*.md'))

        if not md_files:
            print("No content files found!")
            return

        print(f"Found {len(md_files)} content files")

        # Build articles
        articles = []
        for md_file in md_files:
            # Determine category from path
            rel_path = md_file.relative_to(content_dir)
            category = rel_path.parts[0] if len(rel_path.parts) > 1 else 'articles'

            if md_file.name == 'index.md':
                continue  # Skip index files for now

            try:
                article_info = self._build_article(md_file, category)
                articles.append(article_info)
                print(f"✓ Built: {md_file.name}")
            except Exception as e:
                print(f"✗ Error building {md_file.name}: {e}")

        # Build homepage
        self._build_index(articles)

        # Create CSS directory
        css_dir = self.output_dir / 'css'
        css_dir.mkdir(parents=True, exist_ok=True)
        (css_dir / 'style.css').touch()

        print(f"\n✓ Built {len(articles)} articles")
        print(f"✓ Output directory: {self.output_dir}")


def main():
    if len(sys.argv) < 3:
        print("Usage: simple_builder.py <source_dir> <output_dir>")
        sys.exit(1)

    source_dir = sys.argv[1]
    output_dir = sys.argv[2]

    builder = SimpleBuilder(source_dir, output_dir)
    builder.build()


if __name__ == '__main__':
    main()
