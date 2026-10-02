---
type: knowledge-pack-index
pack: ATLAS_Business_Systems
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 (2026-10-01)"
tags: [atlas, knowledge-pack, business-systems, moc]
---
# ATLAS Business Systems — knowledge pack

The knowledge behind ATLAS's **BUSINESS SYSTEMS INTELLIGENCE (v3)** section (`.claude/agents/atlas.md`). The agent
file is the router; this pack holds the detail. ATLAS opens **only** the cards for the departments and processes the
client actually has, plus the closest archetype.

**Where it is used:** ATLAS in Claude Code (checkpoint 2 onwards, BUILD, AUDIT) reads these notes. The n8n ATLAS run
(checkpoint 1, no tools) cannot open notes; it uses the router rules in the agent file only.

## SYMPTOM → INVESTIGATE → LIKELY AREA (Ryan, verbatim)
| Customer says | Investigate | Likely area |
|---|---|---|
| "Everything is messy" | last real customer journey step-by-step, where info lives, who does what | discovery first, then decide |
| "Staff forget jobs" | job intake, scheduling, assignment, how staff receive info, completion proof | Field Service / Ops |
| "Leads go missing" | sources, who replies, assignment, follow-up tracking | Sales + Follow-Up |
| "Quotes take too long" | how quotes are made, approvals, templates, pricing source | Documents + Sales |
| "Stock never matches" | movements, who updates, returns/damage, POs, locations | Inventory + Procurement |
| "Don't know who paid" | invoicing tool, payment methods, reconciliation | Accounting + Payments |
| "Emails get missed" | inboxes, volume, routing, SLAs | Email + Customer Service |
| "I can't see what's happening" | which decisions, which numbers, how often, where the data sits | Dashboards + CEO Brief |
| "Too many apps" | tool inventory, daily switching, duplicate entry | Integration / Unified portal |
| "New staff take long to learn" | SOPs, documents, training | Knowledge base + HR |

## Cards
Every card: Ryan's text verbatim, then the card format (SIGNALS • ASK • CORE OBJECTS • KEY EVENTS • WORKFLOWS • KPIs •
KEEP/BUY/BUILD • CONTROLS & RISKS) and what Fusion EDG Core can do today.

| Card | Area | Open it when |
|---|---|---|
| [[01_Sales_CRM]] | Sales & CRM | Enquiries arrive in several places (WhatsApp, ads, website, calls) |
| [[02_Follow_Up]] | Follow-Up System | "Nobody follows up", "leads go cold", quotes go unanswered, customers complain nobody called back |
| [[03_Administration]] | Administration | Staff retype the same information |
| [[04_Spreadsheet_Intelligence]] | Spreadsheet Intelligence | "We use Excel for everything" |
| [[05_Documents_Presentations]] | Documents & Presentations | "Quotes take too long" |
| [[06_Calendar_Appointments]] | Calendar & Appointments | Bookings by phone/WhatsApp |
| [[07_Email]] | Email | "Emails get missed" |
| [[08_Accounting_Finance]] | Accounting & Finance | "Don't know who paid" |
| [[09_HR_People_Admin]] | HR & People Admin | Leave requested over WhatsApp |
| [[10_Operations]] | Operations | Work tracked in chat groups |
| [[11_Field_Service]] | Field Service | See Ryan's SIGNALS. Also: "my staff forget jobs", job details passed on by phone or WhatsApp |
| [[12_Project_Management]] | Project Management | Deliveries take weeks with many steps and people |
| [[13_Inventory_Warehouse]] | Inventory & Warehouse | "Stock never matches" |
| [[14_Procurement]] | Procurement | Purchasing over WhatsApp |
| [[15_Logistics]] | Logistics | Customers ask "where is my order?" |
| [[16_Customer_Service]] | Customer Service | Complaints lost in chats |
| [[17_WhatsApp_Messaging]] | WhatsApp & Messaging | Most enquiries arrive on WhatsApp |
| [[18_File_Document_Storage]] | File & Document Storage | Files on personal phones and accounts |
| [[19_Database_Backend]] | Database & Backend | A custom module or portal is needed |
| [[20_ERP_Intelligence]] | ERP Intelligence | 3+ items of the ERP-LIKE rule (agent file): multi-location stock, procurement with approvals, POs + receiving, manufacturing/assembly, landed cost, serial/batch tracking, financial consolidation, many integrated departments |
| [[21_Communication_Collaboration]] | Communication & Collaboration | Staff miss internal requests |
| [[22_Forms]] | Forms | Paper forms |
| [[23_E_Signature]] | E-Signature | Contracts signed on paper or by "OK" in chat |
| [[24_Payments]] | Payments | "Don't know who paid" |
| [[25_API_Integration]] | API & Integration | Two or more systems must share data |
| [[26_Automation_n8n]] | Automation / n8n | Repeated manual steps between systems |
| [[27_AI_Agent_Layer]] | AI Agent Layer | High message volume |
| [[28_Management_Dashboard]] | Management Dashboard | "I can't see what's happening" |
| [[29_CEO_Daily_Brief]] | CEO Daily Command Brief | The owner checks several apps every morning |

## Archetypes (starting points, never the final design)
- [[Archetypes/Field_Service|Field service]] — FIELD-SERVICE EDG
- [[Archetypes/Professional_Services|Professional services]] — SALES-CRM + PROJECT/OPS EDG
- [[Archetypes/Retail_Ecommerce|Retail / e-commerce]] — COMMERCE EDG
- [[Archetypes/Clinic_Beauty_Aesthetics|Clinic / beauty / aesthetics]] — SERVICE-CRM
- [[Archetypes/Property_Agency|Property agency]] — SALES-CRM
- [[Archetypes/Wholesale_Distribution|Wholesale / distribution]] — ERP-LIKE EDG
- [[Archetypes/Construction_Renovation|Construction / renovation]] — PROJECT/OPS EDG
- [[Archetypes/F_and_B|F&B]] — COMMERCE EDG (POS-centric)
- [[Archetypes/Education_Training|Education / training]] — SERVICE-CRM
- [[Archetypes/Logistics_Transport|Logistics / transport]] — FIELD-SERVICE / OPS EDG
- [[Archetypes/Legal_Practice|Legal practice]] — PROJECT/OPS EDG (matters) + SALES-CRM (intake)
- [[Archetypes/B2B_Sales|B2B sales]] — SALES-CRM

## Related agents (future specialists; ATLAS designs, they will operate)
[[10_Agents/08_ERP_Operations]] · [[10_Agents/10_Finance_Ops]] · [[10_Agents/11_HR_Workforce]] ·
[[10_Agents/12_Inventory_Supply_Chain]] · [[10_Agents/14_Data_BI_KPI]] · [[10_Agents/03_Marketing_Growth]] (campaigns
and creative are the Marketing Agent's, not ATLAS's).

## Still to come
~~Ryan's sections 36–49~~: superseded 2026-10-02 by the Atlas master spec (`_sources/Atlas_Master_CRM_EDG_AI_Workforce_Prompt.pdf`); see [[00_CEO_Brain/06_Atlas_Master_Gap_Analysis]].
