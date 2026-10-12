---
tags: [zaphiel, skill-pack, titan, property]
version: 1.0 (2026-10-12)
---
# Property sites and portals (with fusion-property-sg)

`fusion-property-sg` is the property specialist (floor plans, designs, renders, CEA rules, property website
creator §14). TITAN owns the web delivery and asks it for property content and rules.

## Single-property and agent sites
Landing page · listings with search and filters · map · agent profile (CEA registration numbers as
`[CLIENT TO PROVIDE]`) · galleries · floor plans · virtual tour or the property journey film (Wow website playbook,
property recipe) · enquiry → CRM via ATLAS. Everything generated is labelled "Artist's impression". Never invent
views, rooms, facilities, prices or availability.

## Portal architecture (Singapore → worldwide)
- **Listings database** (Supabase/Postgres): full-text and geo search first; a search engine later only if needed.
- **Multi-country fields:** currency, units (sq ft / m²), address formats, languages.
- **Accounts:** agents and agencies, lead routing (ATLAS), moderation queue.
- **SEO-friendly listing pages** with structured data where eligible, and share cards for social.
- **Listing feeds** for ad platforms where supported (verify per platform).

## No scraping
- Never scrape other portals (PropertyGuru etc.).
- Don't assume external portals give listing or lead APIs.
- Use authorised imports/feeds only, and show their compatibility status.
- Follow CEA advertising rules for Singapore agents (citations in research, 2026-10-12).
