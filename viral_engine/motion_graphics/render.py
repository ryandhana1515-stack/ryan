"""Render template.html to PNG frames via Playwright, deterministic seek(t)."""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = Path(__file__).parent
FPS = 24
DURATION = 12.6

start = float(sys.argv[1]) if len(sys.argv) > 1 else 0.0
end = float(sys.argv[2]) if len(sys.argv) > 2 else DURATION

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
                                args=['--no-sandbox', '--force-color-profile=srgb'])
    page = browser.new_page(viewport={'width': 1080, 'height': 1920})
    page.goto((BASE / 'template.html').as_uri())
    page.wait_for_timeout(500)
    n_start = int(start * FPS)
    n_end = int(end * FPS)
    for i in range(n_start, n_end):
        t = i / FPS
        page.evaluate(f'seek({t})')
        page.screenshot(path=str(BASE / 'frames' / f'f{i:04d}.png'))
        if i % 48 == 0:
            print(f'frame {i}/{n_end}', flush=True)
    browser.close()
print('done')
