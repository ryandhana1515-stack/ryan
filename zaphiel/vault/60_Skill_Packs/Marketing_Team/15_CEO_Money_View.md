---
tags: [zaphiel, skill-pack, marketing, reports]
version: v7 (2026-10-15)
---
# The CEO money view (APEX v7 §A4)

Owners don't want analysis headaches. **Every APEX answer and report starts with one money line**, produced by
`mkMoneyView` in `ceo-brain/agents/marketing/diagnose.js` (tests §43), never typed by hand:

> "Today you spent S$___ on ads → you got ___ leads (___ qualified) → ___ sales → S$___ revenue. Return on ad spend ___x.
> Profit after ad spend S$___ (if margin known)."

- **ROAS** = CRM-confirmed revenue ÷ ad spend. **ROI** = (revenue − ad spend) ÷ ad spend. **Profit** uses the owner's
  gross margin only (never guessed).
- Sales not connected → "Sales not connected yet. Platform-reported results: …". Never invent revenue.
- Then ONE status line — **GREEN** on track / **AMBER** watch / **RED** action needed (vs the brand's ROAS target, else
  its CPL target) — and ONE recommended action with an approval code.
- Technical detail only when asked ("show me details").
- The chain behind it (v7 §A11): AD CAMPAIGN → ENQUIRY → JOHN → ATLAS CRM → QUALIFIED LEAD → APPOINTMENT → SALE →
  REVENUE → back to this line.
