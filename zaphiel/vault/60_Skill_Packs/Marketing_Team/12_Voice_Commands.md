---
tags: [zaphiel, skill-pack, marketing]
status: active
version: v5 (2026-10-14)
---
# Voice Commands: how the Marketing Director handles spoken orders

Serves Ryan's **Marketing OS v5** (2026-10-14). Ryan speaks a command. The Marketing Director turns it into one
structured **order**, fills the gaps, delegates the work, shows a preview card, and acts only after approval.

## 1. How Ryan talks to it
- **Claude app voice mode.** Spoken conversation with Claude. Beta, on all plans. Works on Claude mobile (iOS and Android),
  Claude Desktop and the web. On web/desktop: tap the sound-wave icon in the lower right of a new chat. On mobile: tap the
  voice icon in the text box, choose a voice, speak. ✅ support.claude.com/en/articles/11101966-use-voice-mode (opened 2026-10-14)
- **Cowork Dispatch.** Message Claude from the phone while it works on the desktop with local files, connectors and
  plugins. One persistent thread; push notifications when a task finishes or **needs approval**. Needs Pro or Max (not
  all of them), the latest Claude Desktop **open with the computer awake**, and the mobile app. Limited beta: **"Dispatch
  isn't available to new users."** If it is missing, use cloud Cowork. ✅ support.claude.com/en/articles/13947068-assign-tasks-from-anywhere-in-claude-cowork (opened 2026-10-14)
- Speech becomes text. The Director treats the text like any typed order. Numbers heard by voice ("thirty dollars") are
  repeated back in the preview card so a mishearing is caught before anything runs.

## 2. The flow (every command)
1. **Parse** the words into one order type: `CAMPAIGN_ORDER`, `REPORT_ORDER`, `DIAGNOSIS_ORDER` or `CREATIVE_ORDER`.
2. **Fill gaps** from the brand's Brand Brain, `targets.md`, `autopilot.md` and the defaults in [[10_Budget_Structure_Rules]].
   **List every assumption.**
3. **Ask at most 3 questions**, and only when the answer changes the decision. Otherwise assume, and say so.
4. **Delegate** in order: research → angles → copy → creatives → campaign prep (who does what: [[00_Index]]).
5. **Preview card** on the phone + **ONE approval code** ([[07_Report_Templates]], v5 additions).
6. **Execute only after `APPROVE <code>`** in chat or the dashboard button. Anything else (silence, "looks good") is not approval.
7. **Report verified results**: read back from the platform, never "should be live".

## 3. Order formats (JSON fields)

### CAMPAIGN_ORDER
```json
{
  "type": "CAMPAIGN_ORDER",
  "order_id": "",
  "brand": "",
  "service": "",
  "country": "",
  "audience": { "gender": "", "age": { "min": 0, "max": 0 }, "location": "" },
  "platforms": [],
  "placements": "",
  "objective": "",
  "destination": "",
  "total_daily_budget": { "amount": 0, "currency": "SGD" },
  "ads": 0,
  "angles": [],
  "target_cpl": { "amount": 0, "currency": "SGD" },
  "duration": { "test_days": 0, "review_on_day": 0 },
  "creatives": { "formats": [], "source": "", "paid_generation": false },
  "approval_required": true,
  "assumptions": [],
  "questions": []
}
```
`questions`: max 3, only when the answer changes the decision. `approval_required` is always `true` for a new campaign
([[08_Approval_Rules]]: new campaigns are never automatic).

### REPORT_ORDER
```json
{
  "type": "REPORT_ORDER",
  "order_id": "",
  "brand": "",
  "platforms": [],
  "period": { "preset": "today|yesterday|last_7_days|this_week|custom", "start": "", "end": "" },
  "timezone": "Asia/Singapore",
  "currency": "SGD",
  "metrics": [],
  "breakdown": "total|platform|campaign|ad",
  "compare_to": "previous_period|target",
  "include_crm": true,
  "format": "quick_answer|daily|weekly|monthly",
  "deliver_to": "chat|dashboard",
  "assumptions": [],
  "questions": []
}
```

### DIAGNOSIS_ORDER
```json
{
  "type": "DIAGNOSIS_ORDER",
  "order_id": "",
  "brand": "",
  "scope": { "platform": "", "campaign_ids": [], "ad_ids": [], "selector": "worst|wasting|all" },
  "period": { "preset": "", "start": "", "end": "" },
  "compare_to": "target|previous_period",
  "targets": { "cpl": null, "cpql": null, "roas": null },
  "question": "",
  "requested_action": "none|pause|move_budget|replace_creative",
  "approval_required": true,
  "assumptions": [],
  "questions": []
}
```
The answer uses the diagnosis output fields in [[02_Diagnosis_Playbook]] (v5 §8.5).

### CREATIVE_ORDER
```json
{
  "type": "CREATIVE_ORDER",
  "order_id": "",
  "brand": "",
  "for_campaign": "",
  "angle": "",
  "asset_type": "ugc_video|video|image|carousel|logo|landing_page",
  "count": 0,
  "formats": ["9:16", "4:5", "1:1"],
  "length_seconds": null,
  "language": "en-SG",
  "tool_route": "",
  "uses_ai_people_or_voices": false,
  "disclosure_needed": false,
  "claims_source": "Brand Brain (approved only)",
  "estimated_cost": { "amount": null, "currency": "", "tool": "" },
  "approval_required": true,
  "assumptions": [],
  "questions": []
}
```
`landing_page` is not built by Marketing: it becomes a `CAMPAIGN_PAGE_REQUEST` to **TITAN**
([[60_Skill_Packs/TITAN/11_Handoff_Contracts]]). `tool_route` comes from the Tool Router in [[01_Tool_Library]].

## 4. Worked example
Ryan says: **"Run 5 ads for eyebrow embroidery in Singapore, target ladies 25 to 45, $30 a day, 5 different angles,
research the copy, keep cost per lead below $10."**

### The order
```json
{
  "type": "CAMPAIGN_ORDER",
  "order_id": "CO-20261014-BR01",
  "brand": "BROWREVOLUTION",
  "service": "eyebrow embroidery",
  "country": "SG",
  "audience": { "gender": "female", "age": { "min": 25, "max": 45 }, "location": "Singapore" },
  "platforms": ["meta"],
  "placements": "advantage_plus",
  "objective": "LEADS",
  "destination": "click_to_whatsapp",
  "total_daily_budget": { "amount": 30, "currency": "SGD" },
  "ads": 5,
  "angles": [
    "pain: drawing brows every morning takes time",
    "desired outcome: wake up with brows already done",
    "demonstration: how the artist maps brows to your face shape",
    "objection-busting: natural look, not drawn-on",
    "local relevance: for busy Singapore professionals"
  ],
  "target_cpl": { "amount": 10, "currency": "SGD" },
  "duration": { "test_days": 7, "review_on_day": 5 },
  "creatives": { "formats": ["9:16 video", "4:5 image"], "source": "real studio footage first; AI only with disclosure", "paid_generation": false },
  "approval_required": true,
  "assumptions": [
    "$30 means S$30 a day in TOTAL (Singapore brand; total budget rule).",
    "Platform = Meta (Facebook + Instagram) only: the brand already runs a click-to-WhatsApp Meta ad; no TikTok ad account is connected; S$30 is too small to split.",
    "1 campaign, 1 ad set, 5 ads (one per angle), Advantage+ placements, default 'highest volume' bidding.",
    "Destination = click-to-WhatsApp, because the brand's live ad uses it and SG brow clients book by chat.",
    "Angles are drafts until Market Research finishes the competitor scan and voice-of-customer quotes.",
    "No prices, review counts or 'Singapore's leading' in the copy: those facts are not yet confirmed in the Brand Brain.",
    "Ad copy will not imply personal attributes (Meta policy), e.g. 'Brows that suit your face shape', never 'Are you insecure about your thin brows?'.",
    "Times and reports in Asia/Singapore; currency SGD unless the ad account says otherwise."
  ],
  "questions": [
    "Which offer and price may the ads show? (The Brand Brain has none confirmed; without one the ads say 'WhatsApp us for a consult'.)",
    "Who answers WhatsApp chats from these ads, and how fast? (If no one can reply within minutes, I will use an Instant Form with qualifying questions instead.)"
  ]
}
```

### The honest reply (what Ryan hears / reads)
> Got it. Here's the plan and the honest maths.
> - S$30 a day at a S$10 target means **about 3 leads a day at best**. The first few days are learning days and usually cost more.
> - I'll run **1 campaign, 1 ad set, 5 ads**, one per angle, on Facebook and Instagram, leads going to WhatsApp.
> - Each ad gets roughly S$6 a day, so I need **about 5–7 days** before I can fairly say which angles win. Then we keep the best 1 or 2.
> - S$10 is our **target, not a promise**. I'll report the real cost per lead every day.
> - Two quick questions: which offer and price can the ads show, and who replies to WhatsApp chats?
> - Preview card below. Nothing goes live until you reply **APPROVE BR7K2**.

## 5. More commands
| Ryan says | Order type | Manager | Needs approval? |
|---|---|---|---|
| "How are my ads today?" | REPORT_ORDER (quick_answer, today; today is incomplete, say so) | Ads Intelligence | No |
| "Which ad is wasting money? Kill it." | DIAGNOSIS_ORDER (selector: wasting, requested_action: pause) | Ads Intelligence → Execution | **Yes**, one code for the pause (autopilot may pause only inside Ryan's caps on HIGH confidence) |
| "Make 3 new UGC videos for the best angle." | CREATIVE_ORDER (ugc_video × 3) | Creative Producer (after Ads Intelligence names the best angle) | **Yes** if any paid generation (cost card), and again before publishing. AI people are disclosed and never shown as real customers |
| "Research my top 5 competitors' ads." | REPORT_ORDER handled as research brief | Market Research | No |
| "Give me this week's report." | REPORT_ORDER (weekly) | Ads Intelligence | No |
| "Move budget to the winner." | DIAGNOSIS_ORDER (requested_action: move_budget) | Ads Intelligence → Execution | **Yes** (budget change; autopilot only within caps, max +20%/day) |
| "Design a logo for my new brand." | CREATIVE_ORDER (logo) | Creative Brain / Canva (Creative Producer) | Drafts: no. Adopting it as the brand's logo: **Ryan's yes** (it becomes brand truth) |
| "Build a landing page for this offer." | CREATIVE_ORDER (landing_page) → `CAMPAIGN_PAGE_REQUEST` | **TITAN** | **Yes** before anything is published to a live domain |
| "Pause my worst ad." | DIAGNOSIS_ORDER (selector: worst, requested_action: pause) | Ads Intelligence → Execution | **Yes**, one code (show lead quality and sales first; the cheapest-CPL ad is not always the best) |
| "How much did I spend today?" | REPORT_ORDER (spend, today, by platform + total) | Ads Intelligence | No |
| "Which campaign made the most sales?" | REPORT_ORDER (CRM-confirmed sales by campaign; platform-attributed shown separately) | Ads Intelligence | No |
| "Create a replacement creative for this campaign." | CREATIVE_ORDER (for_campaign, angle from diagnosis) | Creative Producer | **Yes** before it goes live (and for paid generation) |

## 6. Safety words
| Ryan says | What it means | What happens |
|---|---|---|
| **"STOP AUTOMATION"** | Switch off the AI automation | Autopilot `mode` → `off` for the brand. **Ads keep running** as they are. No new posts, changes or generation |
| **"PAUSE ALL MANAGED ADS"** | Stop the ads themselves | Request a pause on every ad we manage, then **read back** each one from the platform and report which are confirmed paused |

The two are easy to confuse. **Always confirm which one** in one line ("Stop the AI only, ads keep running, or pause the
ads too?"), unless Ryan used the exact phrase. A pause is reported as done only after the platform confirms it.
