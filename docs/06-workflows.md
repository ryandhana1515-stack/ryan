# 6. Automation Workflows

All workflows run on the workflow engine (n8n), triggered by events from the
event catalog ([doc 4 §4.3](04-database-design.md)). Each box that says "AI"
is an agent run with the autonomy policy applied.

## 6.1 Master Flow — Lead to Retention (the money loop)

```mermaid
flowchart TD
    A[New lead arrives\nad / website / WhatsApp / call / walk-in] --> B[AI replies < 60s\nSales AI, channel-native]
    B --> C{Qualification\nintent, budget, fit → score}
    C -- score < 40 --> N[Nurture sequence\nvalue content, weekly]
    C -- score >= 40 --> D[Book appointment\nchat or Voice AI call]
    D --> E[Reminders\n24h email + 3h WhatsApp + 1h voice if unconfirmed]
    E -- no-show --> E2[No-show recovery\nVoice AI reschedule call] --> D
    E -- attended --> F{Deal outcome}
    F -- needs human --> G[Handoff to closer\nfull context packet] --> F
    F -- won --> H[Quote → e-sign → Invoice\nauto-generated, payment link]
    H --> I{Payment}
    I -- overdue --> I2[Dunning: day 1 friendly, day 3 call,\nday 7 human alert] --> I
    I -- paid --> J[Customer onboarding\nwelcome pack, kickoff booked, SOP-driven]
    J --> K[Review request\ntimed after value delivered]
    K --> L[Retention & upsell campaigns\nsegmented, scheduled]
    N -- signals buying intent --> C
    L -- goes quiet 60d --> M[Re-engagement\nSales AI win-back] --> C
```

## 6.2 Customer Support Flow

```mermaid
flowchart TD
    A[Message on any channel] --> R{Intent router}
    R -- sales --> S[Sales AI]
    R -- support --> B[Support AI]
    B --> C{Known answer in KB?}
    C -- yes --> D[Answer with citation\n+ confirm resolved]
    C -- no / complex --> E[Open ticket\npriority + SLA timer]
    E --> F{Can AI resolve\nwith tools?}
    F -- yes --> D
    F -- no --> G[Escalate to human\nsummary + history + suggested fix]
    D --> H[Follow-up next day\nCSAT survey]
    G --> H
    H -- CSAT <= 3 --> I[Alert manager + save-the-customer flow]
    H --> J[Ticket + conversation archived to timeline\nFAQ gap? → SOP AI drafts new KB article]
```

## 6.3 Content Engine Flow (monthly)

```mermaid
flowchart TD
    A[Cron: 25th of month] --> B[Marketing AI: next-month calendar\nfrom strategy + performance data + trends]
    B --> C[CEO approves calendar\none screen, 10 minutes]
    C --> D[Content AI: generate all assets\nposts, scripts, emails, images, voiceovers]
    D --> E[Approval queue\nbulk approve / edit / regenerate]
    E --> F[Scheduler publishes\nper-platform best times]
    F --> G[Social AI: engage\nreply to comments & DMs, flag hot leads → Sales AI]
    G --> H[Weekly performance report\ntop/bottom content, channel ROI]
    H --> B
```

## 6.4 Voice Agent Flows

```mermaid
flowchart TD
    subgraph Inbound
        A1[Incoming call] --> A2[Voice AI answers\ngreets by brand script]
        A2 --> A3{Intent}
        A3 -- book/reschedule --> A4[Calendar booking live on call]
        A3 -- question --> A5[Answer from KB]
        A3 -- complex/angry --> A6[Warm transfer to human\nwhisper summary]
        A4 & A5 & A6 --> A7[Post-call: transcript, summary,\nsentiment, CRM timeline update]
    end
    subgraph Outbound
        B1[Triggers: appointment.booked,\nmissed call, follow-up due, campaign list] --> B2[Compliance check\nconsent, quiet hours, attempt caps]
        B2 --> B3[Voice AI calls] --> A7
    end
```

## 6.5 Finance Month-End Flow

```mermaid
flowchart TD
    A[Cron: month end] --> B[Sync accounting\nQuickBooks/Xero + payments + expenses]
    B --> C[Reconciliation checks\nflag anomalies & uncategorized items]
    C --> D[Finance AI: monthly pack\nP&L narrative, cash flow, budget vs actual, forecasts]
    D --> E[CFO/CEO review queue]
    E --> F[Publish to CEO dashboard + email PDF]
    C -- anomaly --> G[Alert: human review required]
```

## 6.6 HR Recruitment Flow

```mermaid
flowchart TD
    A[Application received] --> B[HR AI: screen resume vs role\nscore + reasons]
    B -- score >= threshold --> C[Auto-schedule interview\ncalendar + candidate confirmation]
    B -- below --> D[Polite decline draft → approval]
    C --> E[Interview kit for manager\nquestions from role + resume]
    E -- hired --> F[Onboarding checklist spawned\naccounts, training SOPs, 30/60/90 plan]
    F --> G[SOP AI guides new hire day by day]
```

## 6.7 Executive Reporting Flow

```mermaid
flowchart TD
    A[Nightly: materialize kpi_daily] --> B[Compute Business Health Score\nsales, cash, marketing, service, team components]
    B --> C{Thresholds breached?}
    C -- yes --> D[Immediate risk alert to CEO\nwith cause + recommended action]
    C -- no --> E[Daily digest 7am\nyesterday vs target vs last week]
    E --> F[Weekly pack Monday]
    F --> G[Monthly pack + predictions\nrevenue, cash runway, pipeline forecast]
    G --> H[Quarterly & annual reviews\ngrowth recommendations]
```

## 6.8 Workflow Inventory (Phase mapping)

| # | Workflow | Trigger | Phase |
|---|---|---|---|
| W1 | Instant lead response | lead.created / inbound message | 1 |
| W2 | Lead qualification & scoring | conversation update | 1 |
| W3 | Appointment booking + reminders + no-show recovery | qualification / appointment events | 1 |
| W4 | Cold lead re-engagement | lead.gone_cold (60d) | 1 |
| W5 | Daily CEO digest | cron 7:00 | 1 |
| W6 | Content calendar → generate → approve → publish | cron monthly | 2 |
| W7 | Comment/DM engagement + lead detection | platform webhooks | 2 |
| W8 | Voice confirmation & missed-call callback | appointment.booked / missed call | 2 |
| W9 | Quote → invoice → payment → receipt | deal.won | 3 |
| W10 | Dunning (overdue invoices) | invoice.overdue | 3 |
| W11 | Customer onboarding | invoice.paid (first) | 3 |
| W12 | Review request + retention campaigns | onboarding complete / segments | 3 |
| W13 | Support ticket lifecycle + CSAT | ticket events | 3 |
| W14 | Month-end finance pack | cron month-end | 3 |
| W15 | Recruitment pipeline | application received | 3 |
| W16 | Leave & policy requests | leave.requested | 3 |
| W17 | SOP review reminders | sop.review_due | 3 |
| W18 | Health score + risk alerts + periodic packs | nightly cron | 4 |
| W19 | Tenant onboarding wizard | new tenant | 4 |
