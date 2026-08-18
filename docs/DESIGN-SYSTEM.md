# OmniX AI — UI/UX Design System

**Audience:** designers and frontend developers. The system below is
implemented across `app/static/*.html`; follow it for every new screen.

## 1. Brand foundation

- **Logo:** the OmniX "X" mark (dark rounded square, cyan→magenta X with
  glowing core). Files: `app/static/brand/` (full, 512, 128, favicon-64).
  Favicon on every page. Never recolor the mark.
- **Voice:** confident, plain-spoken, honest. We show real footage and
  real numbers; we never fake testimonials or scarcity.

## 2. Design tokens (copy-paste base for every page)

```css
:root {
  --grad:   linear-gradient(92deg, #22d3ee, #6d5bf5 55%, #d946ef); /* signature gradient */
  --accent: #8b5cf6;  --cyan: #22d3ee;  --magenta: #d946ef;
  --ink:    #f2f5ff;  /* primary text */
  --ink-2:  #a3adce;  /* secondary text */
  --bg:     #0a0e1e;  /* page background (deep navy) */
  --bg-soft:#0e1430;  /* alternate section background */
  --card:   #121a38;  /* surfaces */
  --border: #263059;
  --good:   #34d399;  --warn: #f0b429;  --danger: #f87171;
}
```

- Typography: system stack (`system-ui, -apple-system, "Segoe UI"`).
  H1 clamp(26–44px)/850 weight/-.02em tracking; section H2 20–24px;
  body 15–16px/1.6; secondary text always `--ink-2`.
- Gradient usage: CTAs, key words in headlines (`background-clip: text`),
  step numbers, progress marks. Never body text, never borders-only.
- The exception: the internal CEO Dashboard uses a light/dark neutral
  theme (see dashboard.html) for data-reading comfort; all marketing and
  workspace pages use the dark navy theme above.

## 3. Core components (all implemented — reuse, don't reinvent)

| Component | Spec | Reference |
|---|---|---|
| Primary button `.btn` | gradient bg, white 800-weight text, 12px radius, purple glow shadow | all pages |
| Ghost button `.btn-ghost` | transparent, 1px `--border`, ink text | all pages |
| Card `.card` / `.conn` | `--card` bg, 1px `--border`, 14–16px radius, 16–24px padding | landing, studio, launch |
| KPI/stat tile | big tabular number + small secondary label | dashboard |
| Health meter | 8px track + gradient/blue fill bar + label/value row | dashboard |
| Chat bubble `.bubble/.dmsg` | left = flat card; right (AI) = faint gradient fill + accent border; 12px radius; small cyan uppercase speaker label | chat, agent pages |
| Typing indicator | 3 bouncing 6px dots | agent demo, chat |
| Badge `.badge` | pill, 10–12px 800-weight uppercase; green=WORKS NOW/live, neutral=PHASE 2 | launch, studio |
| Timeline `.tl/.ev` | vertical gradient line, glowing 12px dots, cyan time labels | /how |
| Approval row | content preview + primary Approve + ghost Reject | dashboard |
| Video frame `.vframe` | 16:9, dark, 12px radius; fallback = animated live demo, upgrade = YouTube embed | agent pages |
| Modal `.vbox` | centered card on 85% dark overlay, × close | landing |
| Journey card | emoji + title + one-liner + cyan action link ("🤝 Guide me →") | launch, studio |

## 4. Screen inventory (routes → purpose)

**Public funnel:** `/welcome` (landing, 12-lang switcher + RTL) → `/how`
(2:47am story) → `/agents?a=<key>` (18 persuasion pages: problem → video →
does → why good → real moment → CTA → other-agent chips) → `/videos`
(real footage gallery, hero autoplay) → `/offer` (founding offer: value
stack, price lock, honest seat counter, guarantee, FAQ) → `/signup`
(form → success + optional Stripe button).
**Workspace (behind login):** `/` CEO Dashboard → `/chat` Manager AI
(voice mic + ?q= pre-send) → `/launch` Launch Pad (journeys → 3-button
campaign builder → platform doors with Guide-me) → `/studio` Creative
Studio (create → size pack magic button → tool directories → publish row).

## 5. Interaction patterns (the product's personality)

1. **Goal-first**: workspaces open with "What do you want to do?" —
   journeys before menus.
2. **Guide-me everywhere**: any external tool/door pairs "Open →" with
   "🤝 Guide me →" (`/chat?q=<prefilled question>` auto-sends). Never
   leave a user with a bare link.
3. **Approve-first trust**: AI output lands as drafts/approvals with one
   tap to release; autonomy is a visible per-employee dial + kill switch.
4. **Show, don't claim**: live demos autoplay (typed chat with realistic
   pacing ~2.5–3s/message), real screen recordings on /videos, real
   numbers in copy.
5. **Voice parity**: anything typable to Manager AI is speakable (mic).
6. **One input → many outputs**: e.g. one image → 5 platform sizes; one
   topic → captions for 5 platforms. Design new features to this shape.
7. **Language switcher** top-right on public pages; selection persists
   (localStorage); `ar` flips document direction RTL.

## 6. Layout & responsive rules

Max content width 780–1080px by density; page padding 20–24px; card grids
`repeat(auto-fit|auto-fill, minmax(230–380px, 1fr))` so every screen works
on mobile without media-query forests; wide media (tables/video) scrolls
inside its container; buttons ≥44px tall on touch.

## 7. Motion

Micro-only, purposeful: `rise` (fade+translateY 12–45px) for content
entering; card hover lift (translateY -3px + glow); blinking LIVE dot;
typing dots; glow pulse behind hero marks. Duration 150–500ms; no
scroll-jacking; respect `prefers-reduced-motion` for new work (🔜 add).

## 8. Accessibility & i18n checklist for every new screen

Contrast ≥4.5:1 for body text on `--bg/--card`; never color-only meaning
(badges carry words); alt text on images; focus-visible on interactive
elements (🔜 audit); all user-facing strings translatable via the
data-i dictionary pattern used on /welcome.

## 9. Asset rules

Generated media lands in `/generated` (shareable); brand assets in
`/static/brand`; product footage in `/static/videos`. Platform image
sizes produced by the Studio pack: FB/IG feed 1080×1350, square
1080×1080, Story/Reel/TikTok 1080×1920, YouTube thumb 1280×720,
Xiaohongshu 1242×1660.
