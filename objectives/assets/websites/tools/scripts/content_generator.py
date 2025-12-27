#!/usr/bin/env python3
"""
Gaming Content Generator
Generates SEO-optimized gaming articles using Claude API
"""

import os
import sys
import json
import argparse
from datetime import datetime
from pathlib import Path
import anthropic

# Article templates
TEMPLATES = {
    "review": {
        "word_count": "2000-2500",
        "structure": """
# {game_name} Review - {hook}

**Published:** {date}
**Category:** Reviews > {genre}
**Author:** {site_name} Team
**Reading Time:** {reading_time} minutes

---

## Quick Verdict

{quick_verdict}

**Our Rating:** {rating}/10

---

## What is {game_name}?

{overview}

---

## Gameplay - {gameplay_title}

{gameplay_section}

---

## Graphics and Presentation

{graphics_section}

---

## {unique_section_title}

{unique_section}

---

## Content and Replayability

{replayability_section}

---

## Value Proposition

{value_section}

---

## Pros and Cons

### What We Loved ✅

{pros}

### Minor Drawbacks ❌

{cons}

---

## Who Should Play {game_name}?

### Perfect For:

{target_audience}

### Maybe Skip If:

{skip_if}

---

## Platform Recommendations

{platforms}

---

## Final Verdict

{final_verdict}

**Final Rating:** {rating}/10

**Recommendation:** {recommendation}

---

## Where to Buy {game_name}

{buy_links}

---

## Frequently Asked Questions

{faqs}

---

## Related Articles

{related_articles}

---

**Meta Information:**
- **Last Updated:** {date}
- **Word Count:** {word_count}
- **Disclosure:** This review may contain affiliate links. We may earn a small commission if you purchase through our links at no extra cost to you. This helps support our site and allows us to continue providing quality content.
""",
        "prompt_template": """Write a comprehensive, SEO-optimized game review for {game_name}.

TARGET AUDIENCE: Gamers aged 18-35 interested in {niche} games
TONE: Informative, balanced, conversational, enthusiastic but honest
LENGTH: 2,000-2,500 words
SEO KEYWORDS: {game_name} review, is {game_name} worth it, {game_name} gameplay, {game_name} {year}

REQUIREMENTS:
- Start with an engaging hook that answers "Is it worth playing in {year}?"
- Include a quick verdict (2-3 sentences) upfront
- Provide detailed gameplay analysis (500-600 words)
- Cover graphics, sound, and presentation (300-400 words)
- Discuss value proposition and pricing
- Include specific pros and cons (5-7 each)
- Add target audience recommendations
- End with clear final verdict and rating
- Include 5-7 FAQs at the end
- Write in a natural, conversational style
- Use specific examples and details
- Be honest about flaws while being fair

STRUCTURE SECTIONS TO FILL:
1. Quick Verdict (2-3 sentences, compelling)
2. Overview (200-250 words - what the game is, developer, release date, platforms)
3. Gameplay Section (500-600 words - core mechanics, loop, what makes it fun)
4. Graphics Section (300-400 words - visual style, art direction, performance)
5. Unique Section (300-400 words - story, multiplayer, or standout feature)
6. Replayability (200-300 words - how much content, replay value)
7. Value Proposition (200-300 words - price analysis, comparisons)
8. Pros (5-7 bullet points, specific)
9. Cons (3-5 bullet points, honest but fair)
10. Target Audience (who will love this, 3-5 bullet points)
11. Skip If (who won't enjoy it, 2-3 bullet points)
12. Platforms (which version is best and why)
13. Final Verdict (150-200 words, summary)
14. Rating (X/10 with justification)
15. Recommendation (Buy now/Wait for sale/Skip)
16. Buy Links (list platforms with prices)
17. FAQs (5-7 common questions with answers)

Please provide the content for each section in JSON format with these keys:
- quick_verdict
- rating (number 1-10)
- overview
- gameplay_title (creative title for gameplay section)
- gameplay_section
- graphics_section
- unique_section_title (e.g., "Story and Narrative" or "Multiplayer Mayhem")
- unique_section
- replayability_section
- value_section
- pros (array of strings)
- cons (array of strings)
- target_audience (array of strings)
- skip_if (array of strings)
- platforms
- final_verdict
- recommendation
- buy_links
- faqs (array of objects with "question" and "answer" keys)

Generate comprehensive, honest, and engaging content that provides real value to readers."""
    },

    "guide": {
        "word_count": "2500-3000",
        "prompt_template": """Write a comprehensive beginner's guide for {game_name}.

TARGET AUDIENCE: New players who just started {game_name}
TONE: Helpful, encouraging, clear, organized
LENGTH: 2,500-3,000 words
SEO KEYWORDS: {game_name} guide, {game_name} tips, {game_name} beginner guide, how to play {game_name}

REQUIREMENTS:
- Start with clear introduction explaining what the guide covers
- Organize tips into logical sections (early game, mid game, late game, etc.)
- Include essential tips every beginner needs to know
- Add advanced strategies for those ready to level up
- Include common mistakes and how to avoid them
- Add specific examples and scenarios
- Use numbered lists and clear headers
- End with FAQs
- Be encouraging and positive
- Focus on actionable advice

Please provide detailed sections covering:
1. Getting Started (300-400 words)
2. Essential Tips for Beginners (600-700 words, 10-15 tips)
3. Resource Management (300-400 words)
4. Combat/Core Mechanic Guide (400-500 words)
5. Progression Strategy (300-400 words)
6. Common Mistakes to Avoid (300-400 words, 7-10 mistakes)
7. Advanced Tips (200-300 words)
8. FAQs (8-10 questions)

Provide content in JSON format with appropriate section keys."""
    },

    "top-list": {
        "word_count": "2000-2500",
        "prompt_template": """Write a "Top 10 {category} Games" list for {year}.

TARGET AUDIENCE: Gamers looking for {category} game recommendations
TONE: Enthusiastic, informative, persuasive
LENGTH: 2,000-2,500 words
SEO KEYWORDS: best {category} games, top {category} games {year}, {category} games ranked

REQUIREMENTS:
- Compelling introduction (150-200 words)
- 10 games ranked from #10 to #1
- Each entry: 200-250 words
- Include: Why it's great, who it's for, where to buy, price range
- Add honorable mentions (3-5 games, 50 words each)
- Conclude with how to choose the right game
- Include affiliate links for each game
- Be specific about what makes each game special
- Explain the ranking criteria upfront

For each game provide:
- Title and developer
- Platform availability
- Price range
- Why it made the list (150-180 words)
- Who should play it
- Where to buy (with affiliate links)

Provide content in JSON format with these keys:
- introduction
- ranking_criteria
- games (array of 10 objects with: rank, title, developer, platforms, price, description, target_player, buy_links)
- honorable_mentions (array of 3-5 objects)
- conclusion
- faqs (5-7 questions)"""
    }
}


class ContentGenerator:
    def __init__(self, api_key=None):
        """Initialize the content generator with Claude API"""
        self.api_key = api_key or os.environ.get('ANTHROPIC_API_KEY')
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY environment variable required or pass api_key parameter")

        self.client = anthropic.Anthropic(api_key=self.api_key)

    def generate_review(self, game_name, genre="Action", niche="indie", site_name="Gaming Hub"):
        """Generate a game review"""
        current_year = datetime.now().year

        # Create the prompt
        prompt = TEMPLATES["review"]["prompt_template"].format(
            game_name=game_name,
            niche=niche,
            year=current_year
        )

        print(f"Generating review for {game_name}...")
        print(f"Estimated length: {TEMPLATES['review']['word_count']} words")

        # Call Claude API
        message = self.client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=16000,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )

        # Parse response
        response_text = message.content[0].text

        # Try to extract JSON from response
        try:
            # Look for JSON in markdown code blocks
            if "```json" in response_text:
                json_start = response_text.find("```json") + 7
                json_end = response_text.find("```", json_start)
                json_str = response_text[json_start:json_end].strip()
            elif "```" in response_text:
                json_start = response_text.find("```") + 3
                json_end = response_text.find("```", json_start)
                json_str = response_text[json_start:json_end].strip()
            else:
                json_str = response_text

            content_data = json.loads(json_str)
        except json.JSONDecodeError:
            print("Warning: Could not parse JSON from response. Using raw response.")
            content_data = {"raw_content": response_text}

        # Fill in the template
        article = self._format_review(game_name, genre, site_name, content_data)

        return article

    def _format_review(self, game_name, genre, site_name, data):
        """Format review data into markdown article"""
        date = datetime.now().strftime("%B %d, %Y")
        year = datetime.now().year

        # Calculate reading time (assuming 200 words per minute)
        word_count = sum(len(str(v).split()) for v in data.values() if isinstance(v, str))
        reading_time = max(1, round(word_count / 200))

        # Format pros and cons
        pros_formatted = "\n".join([f"- **{pro}**" for pro in data.get("pros", [])])
        cons_formatted = "\n".join([f"- **{con}**" for con in data.get("cons", [])])

        # Format target audience
        target_formatted = "\n".join([f"- {item}" for item in data.get("target_audience", [])])
        skip_formatted = "\n".join([f"- {item}" for item in data.get("skip_if", [])])

        # Format FAQs
        faqs_formatted = ""
        for faq in data.get("faqs", []):
            faqs_formatted += f"**Q: {faq.get('question', '')}**\n"
            faqs_formatted += f"A: {faq.get('answer', '')}\n\n"

        # Format related articles (placeholders)
        related_articles = f"""- [Complete {game_name} Beginner's Guide](#)
- [Top 10 Games Like {game_name}](#)
- [Best {genre} Games in {year}](#)
- [{game_name} Tips and Tricks](#)"""

        # Fill template
        hook = f"Is It Worth Playing in {year}?"

        article = TEMPLATES["review"]["structure"].format(
            game_name=game_name,
            hook=hook,
            date=date,
            genre=genre,
            site_name=site_name,
            reading_time=reading_time,
            quick_verdict=data.get("quick_verdict", ""),
            rating=data.get("rating", "N/A"),
            overview=data.get("overview", ""),
            gameplay_title=data.get("gameplay_title", "Deep and Engaging"),
            gameplay_section=data.get("gameplay_section", ""),
            graphics_section=data.get("graphics_section", ""),
            unique_section_title=data.get("unique_section_title", "Special Features"),
            unique_section=data.get("unique_section", ""),
            replayability_section=data.get("replayability_section", ""),
            value_section=data.get("value_section", ""),
            pros=pros_formatted,
            cons=cons_formatted,
            target_audience=target_formatted,
            skip_if=skip_formatted,
            platforms=data.get("platforms", ""),
            final_verdict=data.get("final_verdict", ""),
            recommendation=data.get("recommendation", ""),
            buy_links=data.get("buy_links", ""),
            faqs=faqs_formatted,
            related_articles=related_articles,
            word_count=word_count,
            year=year
        )

        return article

    def generate_guide(self, game_name, niche="indie"):
        """Generate a game guide"""
        current_year = datetime.now().year

        prompt = TEMPLATES["guide"]["prompt_template"].format(
            game_name=game_name,
            niche=niche
        )

        print(f"Generating guide for {game_name}...")
        print(f"Estimated length: {TEMPLATES['guide']['word_count']} words")

        message = self.client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=16000,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )

        return f"# Complete {game_name} Guide - Tips, Tricks & Strategies\n\n{message.content[0].text}"

    def generate_top_list(self, category, count=10, year=None):
        """Generate a top games list"""
        year = year or datetime.now().year

        prompt = TEMPLATES["top-list"]["prompt_template"].format(
            category=category,
            year=year
        )

        print(f"Generating Top {count} {category} Games list...")
        print(f"Estimated length: {TEMPLATES['top-list']['word_count']} words")

        message = self.client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=16000,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )

        return f"# Top {count} {category} Games You Must Play in {year}\n\n{message.content[0].text}"


def main():
    parser = argparse.ArgumentParser(description='Generate gaming content using Claude API')
    parser.add_argument('type', choices=['review', 'guide', 'top-list'],
                       help='Type of content to generate')
    parser.add_argument('--game', help='Game name (for review/guide)')
    parser.add_argument('--category', help='Category (for top-list)')
    parser.add_argument('--genre', default='Action', help='Game genre')
    parser.add_argument('--niche', default='indie', help='Gaming niche')
    parser.add_argument('--site-name', default='Gaming Hub', help='Site name')
    parser.add_argument('--output', help='Output file path')
    parser.add_argument('--api-key', help='Anthropic API key (or set ANTHROPIC_API_KEY env var)')

    args = parser.parse_args()

    # Validate arguments
    if args.type in ['review', 'guide'] and not args.game:
        print("Error: --game required for review and guide types")
        sys.exit(1)

    if args.type == 'top-list' and not args.category:
        print("Error: --category required for top-list type")
        sys.exit(1)

    # Initialize generator
    try:
        generator = ContentGenerator(api_key=args.api_key)
    except ValueError as e:
        print(f"Error: {e}")
        print("\nPlease set ANTHROPIC_API_KEY environment variable or use --api-key argument")
        sys.exit(1)

    # Generate content
    try:
        if args.type == 'review':
            content = generator.generate_review(
                game_name=args.game,
                genre=args.genre,
                niche=args.niche,
                site_name=args.site_name
            )
        elif args.type == 'guide':
            content = generator.generate_guide(
                game_name=args.game,
                niche=args.niche
            )
        else:  # top-list
            content = generator.generate_top_list(
                category=args.category
            )

        # Output
        if args.output:
            output_path = Path(args.output)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_text(content)
            print(f"\n✓ Content saved to: {args.output}")
        else:
            print("\n" + "="*80)
            print(content)
            print("="*80)

        print(f"\n✓ Generated {len(content.split())} words")

    except Exception as e:
        print(f"Error generating content: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
