"""
AGENT: Website / Landing Page Builder
USE FOR: Shopify pages, landing pages, product pages, about us, science page

Generates:
- Full HTML landing pages
- Shopify section code
- Product page copy + layout
- Hero banners with product images (via image_agent)
"""

import os, sys
sys.path.append(os.path.dirname(__file__))
from image_agent import run as generate_image

BRAND = {
    "name": "Bio Green Elixirs",
    "tagline": "Clearing The Way To Optimum Health",
    "product": "BIO N:OV",
    "colors": {"bg": "#0a0e1a", "accent": "#00DCFF", "text": "#ffffff"},
    "email": "info@biogreenelixirs.com",
    "website": "biogreenelixirs.com",
}

PAGES = [
    "homepage",
    "product_page",
    "about_us",
    "science_page",
    "affiliates_page",
    "contact_page",
]

def build_homepage() -> str:
    """Generate a full HTML homepage for Bio Green Elixirs."""
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{BRAND['name']} — {BRAND['tagline']}</title>
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{ background: {BRAND['colors']['bg']}; color: {BRAND['colors']['text']}; font-family: 'Segoe UI', sans-serif; }}
    .hero {{ min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 40px; }}
    h1 {{ font-size: 3rem; color: {BRAND['colors']['accent']}; margin-bottom: 20px; }}
    p {{ font-size: 1.2rem; max-width: 600px; margin: 0 auto 30px; line-height: 1.6; }}
    .cta {{ background: {BRAND['colors']['accent']}; color: #000; padding: 16px 40px; border-radius: 8px; font-size: 1.1rem; font-weight: bold; text-decoration: none; display: inline-block; }}
    .stats {{ display: flex; justify-content: center; gap: 40px; margin: 60px 0; flex-wrap: wrap; }}
    .stat {{ text-align: center; }}
    .stat .number {{ font-size: 2.5rem; color: {BRAND['colors']['accent']}; font-weight: bold; }}
    .stat .label {{ font-size: 0.9rem; opacity: 0.7; }}
  </style>
</head>
<body>
  <section class="hero">
    <div>
      <h1>{BRAND['tagline']}</h1>
      <p>Introducing {BRAND['product']} — the world's first 3rd Generation Nitric Oxide supplement. Korean-patented microbial fermentation technology that supports healthy blood pressure in under 30 minutes.</p>
      <a href="#" class="cta">Shop BIO N:OV Now</a>
    </div>
  </section>
  <section class="stats">
    <div class="stat"><div class="number">25%</div><div class="label">Blood Pressure Support</div></div>
    <div class="stat"><div class="number">30 min</div><div class="label">Starts Working</div></div>
    <div class="stat"><div class="number">400%</div><div class="label">More Effective Than Competitors</div></div>
    <div class="stat"><div class="number">0</div><div class="label">Side Effects</div></div>
  </section>
</body>
</html>"""
    path = "/tmp/biogreen_homepage.html"
    with open(path, "w") as f:
        f.write(html)
    print(f"Homepage saved → {path}")
    return path

if __name__ == "__main__":
    build_homepage()
