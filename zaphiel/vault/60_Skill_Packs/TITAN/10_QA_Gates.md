---
tags: [zaphiel, skill-pack, titan, qa]
version: 1.0 (2026-10-12)
---
# QA gates (titan-qa)

Nothing is "done" because it looks right in a screenshot. Every gate passes, or the deviation is written down and
explained, before a client sees the site.

| Gate | Pass when | How (in this workspace) |
|---|---|---|
| **Responsive** | Phone 390×844, tablet 768×1024, desktop 1440×900: no overflow, no overlaps, CTA visible | Playwright + Chromium (installed at `/opt/pw-browsers`; never run `playwright install`) |
| **Cross-browser** | Chromium checked here; Safari/Firefox checked by a person on the preview link (note it) | Playwright Chromium; WebKit/Firefox are not installed |
| **Keyboard + accessibility** | Every control reachable with Tab, focus visible, labels, alt text, contrast AA | Playwright + Lighthouse accessibility |
| **Forms → CRM** | Every form submits; the lead reaches the CRM/EDG **test** endpoint with UTM, click ids and PDPA consent | Real test submission; check the EDG record |
| **Events** | form_submit / whatsapp_click / booking_complete / purchase fire once each | Playwright network log |
| **States** | Loading, empty and error states exist and read well | Manual + Playwright |
| **Core Web Vitals (mobile)** | LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms (or explained) | Lighthouse (npm, pinned version; free) |
| **Cinematic torture test** | Forward/back, fast/slow, stop mid-way, reload mid-page, resize, reduced motion: every state restores | Playwright scroll script (doctrine §24) |
| **Rights + claims** | Every image/film/model has a source or licence in `ASSETS.md`; claims approved by the client (and clinician for medical) | Checklist |
| **Security** | Headers present, no secrets in the bundle, forms rate-limited | `curl -I`, bundle grep |
| **Design match** | Screenshots compared with the approved reference; mismatches listed and fixed | Side-by-side screenshots |

Output: `80_Clients/<client>/web/QA_REPORT.md`, findings as **BLOCKER / HIGH / MEDIUM / POLISH** with the fix and
the owner. Nothing with a BLOCKER or HIGH open goes to the client. Results are labelled **MOCK TESTED** (test
endpoints) or **REAL-ACCOUNT TESTED**.
