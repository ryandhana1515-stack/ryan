# Fusion EDG Core: screen and button audit (staff app + Master Control)

Repo: `/home/user/fusion-edg-core` at `f2089c0` (main, "Home on phones" #66). Read-only audit, 2026-10-29.
Files traced: `apps/api/public/app.html` (3,247 lines), `apps/api/src/staff-app.ts` (854), `apps/api/public/control.html` (583), `apps/api/src/control.ts` (311), `packages/crm/src/*.ts`, `packages/db/migrations/001–046`, `apps/api/test/*.test.ts`.

Abbreviations: **A** = `apps/api/public/app.html`, **SA** = `apps/api/src/staff-app.ts`, **C** = `apps/api/public/control.html`, **CT** = `apps/api/src/control.ts`. CRM functions are cited as `file.ts:line` under `packages/crm/src/`. Tests are in `apps/api/test/`.

How the plumbing works: every staff-app button calls `api(path, body)` (A:538). That sends a GET, or a POST with the `x-edg-app` header, to `/app/api/<path>`. `handleStaffApp` (SA:121) checks the session, maps the route to a module through `ROUTE_MODULES` (SA:209; a route with no module gets a 404) and then calls `route_` (SA:233). I checked every `api('…')` string in app.html against `route_`. **All of them resolve to an existing route and an existing CRM function.** No call points at a missing route.

Classes: **Works** · **Broken** · **Screen only** · **Not built** · **Blocked by provider** · **Needs approval** (the button creates something that waits for a human approval or an approval code). "Depends on" names the outside service the feature needs at run time: the AI model (`rt.agentModel`), Omneky, Metricool, WhatsApp Cloud, Google Calendar, or the HR PII key.

---

## 1. Staff app (`/app`)

### 1.1 Shell: sidebar, top bar, phone tabs, user menu

| # | UI label | Where | Class | Evidence (handler → route → function) | Depends on / test |
|---|---|---|---|---|---|
| S1 | Dashboard | Sidebar (`sideItems` A:630) | Works | `sideGo('home')` A:639→`go` A:705→`renderHome`→`api('dashboard')` SA:414→`dashboardData` dashboard.ts:21 | dashboard.test.ts |
| S2 | CEO Brain | Sidebar | Works | `askSheet()` A:715→`api('ask')` SA:416→`askAtlas` dashboard.ts:208 (an LLM answers from a JSON of dashboard facts) | AI model (409 "needs the AI switched on" when there is none) · dashboard.test.ts |
| S3 | Website AI | Sidebar | Works | `deptSheet('website')` A:819 (dashboard numbers) | — |
| S4 | Sales AI (John) | Sidebar | Works | `deptSheet('sales')` A:827 | — |
| S5 | Marketing (APEX) | Sidebar (only when `marketing.read`) | Works | `go('marketing')`→`renderMarketing` A:2390 | — |
| S6 | CRM + EDG (Atlas) | Sidebar | Works | `deptSheet('crm')` A:850 | — |
| S7 | Leads & Customers | Sidebar | Works | `go('board')`→`renderBoard` A:1260→`api('board')` SA:251 (SQL inline) | staff-app.test.ts |
| S8 | Appointments | Sidebar | Works | `go('jobs')`→`renderJobs` A:1560 | staff-app.test.ts |
| S9 | Inventory | Sidebar | Works | `go('stock')`→`renderStock` A:1790 | stock.test.ts |
| S10 | Finance & Accounting | Sidebar | Works | `go('money')`→`renderMoney` A:1933. Covers quotes, invoices and the price list only | staff-app.test.ts |
| S11 | HR / My HR | Sidebar | Works | `go('hr')`→`renderHR` A:2737 | hr-people.test.ts |
| S12 | Reports & Analytics | Sidebar | Works | `go('report')`→`renderReport` A:2035→`report` SA:735 | staff-app.test.ts |
| S13 | AI Agents | Sidebar | Works | `go('ai')`→`renderAI` A:1969→`ai-team` SA:510 | ai-team.test.ts |
| S14 | Approvals | Sidebar | Works | `approvalsSheet` A:1105 | command-center.test.ts |
| S15 | Integrations | Sidebar | Works | `go('team')` and scrolls to `#apps` (A:643) | app-connections.test.ts |
| S16 | Settings | Sidebar | Works | `go('team')`→`renderTeam` A:3041 | — |
| S17 | Phone bottom tabs (Home, Customers, Jobs, Stock, Quotes, AI team, HR, Team) | Phone bar (A:562/678) | Works | `go(tab)` (the same screens as S1–S16) | — |
| S18 | Search customers (+ ⌘K) | Top bar | Works | `wireSearch` A:693→`search?q=` SA:415→`searchEverything` dashboard.ts:190 | dashboard.test.ts |
| S19 | Bell (top bar) | Top bar | Works | A:686: `notificationsSheet` for managers, otherwise `tasksSheet('mine')` | command-center.test.ts |
| S20 | Light/dark toggle | Top bar | Works | `applyTheme` A:648 (localStorage) | — |
| S21 | Ask CEO Brain button | Top bar | Works | `askSheet` (= S2) | AI model |
| S22 | Clock / date / city | Top bar | Screen only | `tick` A:691 (display only) | — |
| S23 | Org card (business name) | Sidebar foot | Works | `go('team')` A:684 | — |
| S24 | User card → "My login and password" | Sidebar foot sheet | Works | A:682 → `go('team')` | — |
| S25 | User card → Sign out | Sidebar foot sheet | Works | `api('logout',{})` SA:247 | staff-app.test.ts |
| S26 | Support-view / Test-system banners | Under top bar | Screen only | A:673-674 (information only) | — |
| S27 | Sign-in page `/app/login`, one-time link `/s/:token`, review link `/v/:token/open` | Before the app | Works | SA:820 `handleLogin`→`passwordLogin`; SA:142; SA:130 | logins.test.ts, staff-app.test.ts |

### 1.2 Home (`renderHome` A:953–1079): the new `.fx*` layout

| # | UI label | Where | Class | Evidence | Depends on / test |
|---|---|---|---|---|---|
| H1 | Dashboard | fxMenu item 1 (A:936) | Works | `go('home')` | dashboard.test.ts |
| H2 | CEO Brain | fxMenu 2 | Works | `askSheet()`→`ask` | AI model |
| H3 | Website AI | fxMenu 3 | Works | `deptSheet('website')` | — |
| H4 | Sales AI (John) | fxMenu 4 | Works | `deptSheet('sales')` | — |
| H5 | Marketing (APEX) | fxMenu 5 | Works | Opens the APEX page, or `deptSheet('marketing')` without access (A:937) | — |
| H6 | CRM + EDG (Atlas) | fxMenu 6 | Works | `deptSheet('crm')` | — |
| H7 | WhatsApp Hub | fxMenu 7 | Works | `deptSheet('whatsapp')` A:812: real counts (chats 7 days, AI replies, waiting) and links. **This is not an inbox** (see spec section 3) | — |
| H8 | Leads & Customers | fxMenu 8 | Works | `go('board')` | — |
| H9 | Projects & Orders | fxMenu 9 | Screen only | A:939 opens **Quotes** (`go('money')`) or Stock. There is no projects or sales-orders module: the label promises something that does not exist | — |
| H10 | Finance & Accounting | fxMenu 10 | Works | `go('money')` (or a toast when off) | — |
| H11 | HR & Team | fxMenu 11 | Works | `go('hr')`, or `go('team')` | — |
| H12 | Reports & Analytics | fxMenu 12 | Works | `go('report')` | — |
| H13 | AI Agents | fxMenu 13 | Works | `go('ai')` | — |
| H14 | Integrations | fxMenu 14 | Works | `sideGo('@apps')` | — |
| H15 | Settings | fxMenu 15 | Works | `go('team')` | — |
| H16 | Menu user chip / avatar (`#fxuser`, `#fxme`) | fxMenu foot, header | Works | A:1066 → user sheet | — |
| H17 | Bell (`#fxbell`, count = unread + approvals) | Header | Works | A:1065 → approvals, notifications or tasks | command-center.test.ts |
| H18 | KPI "New Leads" | KPI row | Works | `cards.new_leads` dashboard.ts:125 → `go('board')` | dashboard.test.ts |
| H19 | KPI "Qualified Leads" | KPI row | Works | `qualified` dashboard.ts:139 → board | dashboard.test.ts |
| H20 | KPI "Appointments" | KPI row | Works | dashboard.ts:126 → `go('jobs')` | dashboard.test.ts |
| H21 | KPI "Sales Closed" | KPI row | Works | dashboard.ts:127 → board | dashboard.test.ts |
| H22 | KPI "Revenue (MTD)" (or "My Tasks" for non-managers) | KPI row | Works | dashboard.ts:128 → `go('money')` / `tasksSheet` | dashboard.test.ts |
| H23 | "View All" (departments) | Departments | Works | `deptSheet('all')` A:806 | — |
| H24 | Website AI card: Enquiries | Departments | Works | `departments.website.enquiries_30d` dashboard.ts:143 | dashboard.test.ts |
| H25 | Website AI card: "Projects —" / "Previews —" | Departments | Not built | A:976 hard-codes "Not linked to this app yet"; `builds: null` dashboard.ts:145 | TITAN is not linked |
| H26 | Sales AI card (Chats / Appointments / Closed) | Departments | Works | dashboard.ts:146 | dashboard.test.ts |
| H27 | Marketing card (Campaigns / Daily Spend / CPL) | Departments | Works | `marketingDepartment` dashboard.ts:161 (stored Omneky snapshot) | Omneky · dashboard.test.ts |
| H28 | CRM card (Customers / Pending Tasks / Staff Online) | Departments | Works | dashboard.ts:148 (Staff Online needs attendance switched on) | dashboard.test.ts |
| H29 | Dept sheet Website → "Request a website for a client" | deptSheet | Works | `websiteRequest` A:863→`api('tasks')` SA:427→`createTask` command.ts:299. **It only creates a task**; nothing gets built | command-center.test.ts |
| H30 | Dept sheet Website → "See website enquiries" | deptSheet | Works | `go('board')`. There is no source filter, so this opens every customer | — |
| H31 | Dept sheet Website → "Link a website form" | deptSheet | Works | `sideGo('@apps')` | — |
| H32 | Dept sheet Sales → Open customers and chats / Follow-ups due / Appointments / John's settings | deptSheet | Works | A:834 (navigation) | — |
| H33 | Dept sheet Marketing → Open APEX / Approvals | deptSheet | Works | A:849 | — |
| H34 | Dept sheet CRM → Open the CRM / My tasks / Team tasks / New task / HR / Team & settings | deptSheet | Works | A:857 | command-center.test.ts |
| H35 | Dept sheet WhatsApp → Open customers and chats / John's settings / Connections | deptSheet | Works | A:818 | — |
| H36 | CEO Brain greeting bubble | Ask CEO Brain panel | Works | Built in the browser from dashboard numbers (A:989) | — |
| H37 | Quick action "Check marketing performance" | Ask CEO Brain panel | Works | `CEO.m` A:1068 → APEX page, or `askSheet('How is my marketing doing?')` | — |
| H38 | Quick action "Show today's leads" | Ask CEO Brain panel | Works | `go('board')`. **There is no "today" filter**: it shows the whole board | — |
| H39 | Quick action "Build a website for a client" | Ask CEO Brain panel | Works | `websiteRequest` (creates a task, see H29) | — |
| H40 | Quick action "Review team tasks" | Ask CEO Brain panel | Works | `tasksSheet('team'/'mine')` | command-center.test.ts |
| H41 | Quick action "Generate a business report" | Ask CEO Brain panel | Works | `go('report')`, or `askSheet(...)` | — |
| H42 | "Ask me anything…" input + send | Ask CEO Brain panel | Works | `#askf` A:1077 → `askSheet(v)`→`ask` | AI model |
| H43 | Microphone icon | Ask CEO Brain panel | Screen only | `<img class="mic">` A:1025 has no handler; there is no voice input | — |
| H44 | Live Activity Feed + department filter | Feed | Works | `feedItems` A:918 (CRM `events` + `apex_events`); `#fxdept` A:1057 | dashboard.test.ts |
| H45 | "Live" badge | Feed | Screen only | Static label. The feed only reloads when the page is drawn again (no polling or push) | — |
| H46 | Revenue / Enquiries Overview + period select | Chart | Works | `fxChart` A:884; `#fxrange` A:1058 redraws in the browser | — |
| H47 | Top Leads rows + "View All" | Top Leads | Works | `openLead` / board; `top_leads` dashboard.ts:140 | dashboard.test.ts |
| H48 | "More for today" fold (`<details>`) | Below the picture | Works | A:1034 | — |
| H49 | Approvals panel + "Open →" + rows | Fold | Works | `approvalsSheet`, or marketing approvals (A:993) | command-center.test.ts |
| H50 | Today's Priorities rows + "View all →" | Fold | Works | `openNext` A:1096; `workSheet` A:1083 | command-center.test.ts |
| H51 | AI Workforce tiles + "Manage agents →" + 4 stats | Fold | Works | `workforce` dashboard.ts:134 | dashboard.test.ts |
| H52 | Leads by Source donut + "View details →" | Fold | Works | `sources` dashboard.ts:132 → board | dashboard.test.ts |
| H53 | Quick Access tiles (up to 12) | Fold | Works | `sideGo` / `tasksSheet` A:1072 | — |
| H54 | HR card ("People today") | Fold | Works | `home.hr` → `hrCardHtml` A:2805 → `go('hr')` | hr-care.test.ts |
| H55 | Work sheet buttons (decisions, my tasks, team tasks, work queue, notifications, system health, new task) | "View all" sheet A:1083 | Works | They open H56–H62 | command-center.test.ts |

### 1.3 Command-center sheets (approvals, queue, notifications, tasks, health)

| # | UI label | Where | Class | Evidence | Test |
|---|---|---|---|---|---|
| H56 | Approval list → item sheet | Approvals sheet A:1105 | Works | `approvals` SA:417→`listApprovals` command.ts:50 (quotes, invoices, POs, stock counts, leave, attendance) | command-center.test.ts |
| H57 | "Approve & send / Issue & send / Approve the leave…" · "Ask for changes" · "Turn down" | Approval sheet A:1110 | Works | `approvals/decide` SA:418→`decideApproval` command.ts:126 | command-center.test.ts, hr-leave.test.ts, hr-attendance.test.ts |
| H58 | Work queue: "Give to…", priority, "Resolved" | Queue sheet A:1143 | Works | `queue/U` SA:425→`updateQueueItem` command.ts:239 | command-center.test.ts |
| H59 | Notifications: "Mark all as read", "Resolved" | Notifications sheet A:1162 | Works | SA:420/422→`readNotifications` command.ts:192 / `resolveNotification` :203 | command-center.test.ts |
| H60 | Tasks list, ✓ Done, open task | Tasks sheet A:1208 | Works | `tasks` SA:426→`listTasks` command.ts:278; `tasks/U` SA:429→`updateTask` :328 | command-center.test.ts |
| H61 | Task sheet: Done / Blocked / Not blocked / Open the customer / Give to / Priority / Cancel | Task sheet A:1183 | Works | `updateTask` | command-center.test.ts |
| H62 | New task (form) | Sheet A:1217 | Works | `createTask` command.ts:299 | command-center.test.ts, platform-admin.test.ts |
| H63 | System health sheet (messages, workflows, dead events, AI cost/limit, connections) | Sheet A:1230 | Works | `health` SA:430→`systemHealth` command.ts:359 | command-center.test.ts |

### 1.4 CRM: Customers board, list, follow-ups, lead sheet, booking, quote, import

| # | UI label | Where | Class | Evidence | Test |
|---|---|---|---|---|---|
| C1 | Pipeline / List / Follow-ups switch | Board header A:1291 | Works | `crmSeg` | — |
| C2 | Pipeline columns (stage, SLA, cards) | Board A:1278 | Works | `board` SA:251; stages from `me` | staff-app.test.ts |
| C3 | Drag-and-drop between stages | Board | Not built | Cards only open the lead sheet (A:1289); stages change only through the stage bar (C11) | — |
| C4 | "Showing: mine / everyone" | Board/List/Follow-ups | Works | Filter in the browser (A:1285) | — |
| C5 | "Test WhatsApp" (test system) | Board | Works | `simulateSheet` A:3214→`test/whatsapp` SA:459→`receiveCustomerMessage` agents.ts:44 | staff-app.test.ts, ai-team.test.ts |
| C6 | "Add examples" (test system) | Board | Works | `fillExamples` A:3238→`test/examples` SA:635 | staff-app.test.ts |
| C7 | List view table (owner, last action, next step, value) | List A:1294 | Works | Uses the `board` data | staff-app.test.ts |
| C8 | Follow-ups list + reason chips | Follow-ups A:1315 | Works | `followups` SA:262→`followUps` followups.ts:210 | crm-followups.test.ts |
| C9 | "Rules" → follow-up rules sheet (business days/hours, 7 rules, notify) → "Save rules" | Follow-ups A:1337 | Works | `followups/rules` SA:263-264→`getFollowupConfig` :62 / `saveFollowupConfig` :70 | crm-followups.test.ts |
| C10 | Lead sheet open | Board/list/search | Works | `openLead` A:1421→`lead/U` SA:270→`leadDetail` SA:674 | staff-app.test.ts |
| C11 | Stage bar buttons | Lead sheet | Works | `lead/U/stage` SA:275→`moveLeadStage` stage.ts:52 | staff-app.test.ts, logins.test.ts |
| C12 | "WhatsApp" button | Lead sheet | Works | `https://wa.me/<phone>` A:1432 opens WhatsApp on the staff member's phone. **It does not send from inside the app** | — |
| C13 | "Book a job" | Lead sheet | Works | `bookSheet` A:1502→`slots` SA:306 `listFreeSlots` appointments.ts:45; `book` SA:310 `bookAppointment` appointments.ts:70 | staff-app.test.ts, job-card.test.ts |
| C14 | Google Calendar event on booking | (Behind C13) | Blocked by provider | `syncCalendar` appointments.ts:210 returns `not_connected` with no Google token; the adapter says "NEEDS VERIFICATION" (packages/adapters/src/google-calendar.ts) | Google Calendar OAuth per business |
| C15 | "Quotation" → "Prepare quotation" | Lead sheet → quote sheet A:1542 | Needs approval | `lead/U/quote` SA:280→`draftQuote` quotes.ts:64. A draft that a manager approves before it is sent (A:1548) | staff-app.test.ts |
| C16 | "Set next step" | Lead sheet | Works | `lead/U/next` SA:277→`setNextAction` stage.ts:118 | staff-app.test.ts |
| C17 | "Give to…" | Lead sheet | Works | `lead/U/assign` SA:279→`assignLeadTo` stage.ts:143 | staff-app.test.ts |
| C18 | "Set value" (deal value) | Lead sheet | Works | `lead/U/value` SA:268→`setLeadValue` followups.ts:311 | crm-followups.test.ts |
| C19 | "A person takes over" / "Let the AI reply again" | Lead sheet | Works | `lead/U/ai` SA:554→`setAgentPaused` agents.ts:406 | ai-team.test.ts |
| C20 | "Add a note" → Save | Lead sheet | Works | `lead/U/note` SA:276→`addLeadNote` stage.ts:102 | staff-app.test.ts |
| C21 | Timeline + type/who filters | Lead sheet A:1472 | Works | `lead/U/timeline` SA:266→`customerTimeline` followups.ts:272 | crm-followups.test.ts |
| C22 | "Mark won" / "Mark lost" (+ reason) | Lead sheet | Works | `lead/U/close` SA:278→`closeLead` stage.ts:78 (only a person can do this) | staff-app.test.ts |
| C23 | Booking sheet controls (customer, service, who, day, free times, address, note, Book) | Book sheet A:1502 | Works | See C13 | staff-app.test.ts |
| C24 | Import customers: choose file → column mapping → Import / Cancel | Team → Import A:1385 | Works | `import/preview` SA:435→`previewImport` importer.ts:149; `import/U/run` `runImport` :193; `cancelImport` :226 | importer.test.ts |
| C25 | Reschedule a booking | Jobs / lead sheet | Not built (UI) | `rescheduleAppointment` exists in appointments.ts:141 (used by the AI agent), but no staff route or button calls it | job-card.test.ts (function) |

### 1.5 Jobs and job card

| # | UI label | Where | Class | Evidence | Test |
|---|---|---|---|---|---|
| J1 | Day strip (14 days) | Jobs A:1565 | Works | `jobs?from=&days=1` SA:289 | staff-app.test.ts |
| J2 | "Checklists" (per service) → Save | Jobs A:1569 | Works | `service/U/checklist` SA:327→`setJobChecklist` jobcards.ts:32 | job-card.test.ts |
| J3 | "Book a job" | Jobs | Works | `bookSheet` (C13) | staff-app.test.ts |
| J4 | "Open job card / Continue job / Job card" | Job row | Works | `openJobCard` A:1665→`job/U/card` SA:319→`getJobCard` jobcards.ts:60 | job-card.test.ts |
| J5 | "Quick done" | Job row | Works | `job/U/done` SA:330→`markAppointmentOutcome` appointments.ts:169 | staff-app.test.ts |
| J6 | "No-show" | Job row | Works | `job/U/no-show` SA:330→`markAppointmentOutcome` (no route test) | — |
| J7 | "Cancel" (+ reason) | Job row | Works | `job/U/cancel` SA:333→`cancelAppointment` appointments.ts:130 (no route test) | — |
| J8 | "Customer" | Job row | Works | `openLead` | — |
| J9 | Job card: Start job, checklist ticks, notes (saved on blur) | Job card A:1682 | Works | Saved offline first in IndexedDB (A:1602), then `job/U/card` SA:320→`updateJobCard` jobcards.ts:98 | job-card.test.ts |
| J10 | Materials: pick from stock / Add / Remove | Job card | Works | `updateJobCard` (op `material`) | job-card.test.ts |
| J11 | Photos: Before / After / Other (camera, shrunk to <850 kB) | Job card | Works | `job/U/photo` SA:321→`addJobPhoto` jobcards.ts:161; view `job/U/photo/U` SA:323 | job-card.test.ts |
| J12 | Signature: Save / Clear / "Customer can't sign" | Job card | Works | `updateJobCard` (op `signature` / `no_signature`) | job-card.test.ts |
| J13 | "Complete job" (warns about unticked steps) | Job card | Works | `job/U/complete` SA:325→`completeJob` jobcards.ts:203 | job-card.test.ts |

### 1.6 Stock and purchasing

| # | UI label | Where | Class | Evidence | Test |
|---|---|---|---|---|---|
| K1 | Items / Orders switch | Stock A:1797 | Works | `stock` SA:388→`stockOverview` stock.ts:504 | stock.test.ts |
| K2 | Counts to approve: Approve / Reject | Stock | Works | `stock/count/U/approve|reject` SA:396→`decideStockCount` stock.ts:191 | stock.test.ts |
| K3 | "Add item" / item "Edit" | Items | Works | `stock/item` SA:391→`upsertStockItem` stock.ts:69 | stock.test.ts, entitlements.test.ts |
| K4 | "Suppliers and places": Add/Edit supplier, "Add a store or van" | Items sheet A:1861 | Works | `stock/supplier` SA:392→`upsertSupplier` stock.ts:48; `stock/place` SA:393→`upsertStockLocation` :33 | stock.test.ts |
| K5 | "Add example stock (test)" / "Check low stock now (test)" | Items | Works | `test/stock-examples` SA:486; `test/low-stock` SA:491→`processLowStock` stock.ts:466 | stock.test.ts |
| K6 | Item sheet: Received / Move / Correct | Item sheet A:1828 | Works | `stock/move` SA:394→`recordStockMovement` stock.ts:101 | stock.test.ts |
| K7 | Item sheet: Count | Item sheet | Needs approval | `stock/count` SA:395→`countStock` stock.ts:158. A difference counted by a non-manager waits for a manager (A:1844) | stock.test.ts |
| K8 | Item history | Item sheet | Works | `stock/item/U` SA:390→`stockItemHistory` stock.ts:534 | stock.test.ts |
| K9 | "New order" → "Prepare order" | Orders A:1875 | Needs approval | `stock/order` SA:398→`draftPurchaseOrder` stock.ts:259. A draft that a manager approves | stock.test.ts |
| K10 | "Set an approval limit" | Orders | Works | `settings` SA:350→`saveSettings` SA:713 | stock.test.ts |
| K11 | Order: "Save changes" | Order sheet A:1895 | Works | `stock/order/U` SA:403→`updatePurchaseOrderDraft` stock.ts:278 | stock.test.ts |
| K12 | Order: "Approve and send" | Order sheet | Works | `stock/order/U/send`→`approveAndSendPurchaseOrder` stock.ts:298. Emails the supplier when an email address is known; otherwise the team sends it by hand | stock.test.ts |
| K13 | Order: "I sent it myself" / "Cancel order" | Order sheet | Works | `markPurchaseOrderSent` stock.ts:351 / `cancelPurchaseOrder` :363 | stock.test.ts |
| K14 | Order: "Record delivery" | Order sheet | Works | `receivePurchaseOrder` stock.ts:381 | stock.test.ts |
| K15 | Order: "Supplier bill" (matched against what arrived) | Order sheet | Works | `recordSupplierBill` stock.ts:435 | stock.test.ts |

### 1.7 Quotes, invoices, prices, settings (Finance)

| # | UI label | Where | Class | Evidence | Test |
|---|---|---|---|---|---|
| M1 | "Enter them now" / "Your business settings" (tax, validity, terms) | Money A:1949 | Works | `settings` SA:350→`saveSettings` SA:713 | staff-app.test.ts |
| M2 | Quotation "Approve and send" | Money | Works | `quote/U/send` SA:354→`approveAndSendQuote` quotes.ts:129 | staff-app.test.ts |
| M3 | "Customer accepted" / "Declined" | Money | Works | `quote/U/accepted|declined`→`decideQuote` quotes.ts:169 (accepting makes a draft invoice) | command-center.test.ts (accepted) |
| M4 | Invoice "Issue and send" | Money | Works | `invoice/U/issue` SA:359→`issueInvoice` quotes.ts:221 | command-center.test.ts (through approvals/decide) |
| M5 | "Record payment" (PayNow, bank, cash…) | Money | Works | `invoice/U/payment` SA:360→`recordPayment` quotes.ts:275. Recorded by hand only. **The form label hard-codes "SGD"** (A:1962) | — |
| M6 | Price list "Add item" / "Edit" | Money | Works | `price` SA:342→`upsertPriceItem` quotes.ts:30. **The label hard-codes "SGD"** (A:1955) | staff-app.test.ts |

### 1.8 AI team

| # | UI label | Where | Class | Evidence | Test |
|---|---|---|---|---|---|
| A1 | AI assistant "Switch on / Switch off" | AI team A:1976 | Works | `agent/U/on|off` SA:527→`setAgentActive` agents.ts:442 | ai-team.test.ts |
| A2 | AI usage line (replies, cost vs monthly limit) | AI team | Works | `aiUsage` ai-usage.ts:33 | ai-team.test.ts |
| A3 | "What ATLAS found" (problems) | AI team | Works | `organizations.settings.problems` SA:515 | ai-team.test.ts |
| A4 | "Try it: chat as a customer" + "New customer" (test system) | AI team A:2018 | Works | `test/whatsapp` SA:459 | ai-team.test.ts |
| A5 | "New workflow" / "Change" (When → Only if → Then do, with a rehearsal) | AI team A:3110 | Works | `workflow/catalog` SA:528→`workflowCatalog` automations.ts:393; `workflow` SA:529→`saveOwnWorkflow` :416 | own-workflows.test.ts |
| A6 | "Describe it in words" | AI team A:3176 | Works | `workflow/draft` SA:530→`draftWorkflowFromWords` automations.ts:461 | AI model · own-workflows.test.ts |
| A7 | Workflow "Switch on/off" / "Remove" | AI team | Works | SA:534→`setAutomationActive` automations.ts:296; SA:532→`removeWorkflow` :441 | own-workflows.test.ts |
| A8 | "Run everything now (test)" / "Run only what is due" | AI team | Works | SA:496/502→`runAllWorkflowsNow` :181 / `processDueAutomations` :136 | ai-team.test.ts |
| A9 | Recent workflow runs table | AI team | Works | `automation_runs` SA:520 | ai-team.test.ts |
| A10 | Knowledge "Approve" / "Remove" / "Add an answer" | AI team | Works | `knowledge/U/approve|remove` SA:535; `knowledge` SA:546 | ai-team.test.ts |

### 1.9 Report

| # | UI label | Where | Class | Evidence | Test |
|---|---|---|---|---|---|
| R1 | "‹ Home", 6 stat tiles, "Where customers are", "By person" | Report A:2035 | Works | `report` SA:363→`report()` SA:735 | staff-app.test.ts |
| R2 | Morning report text | Report | Works | `templateBrief` brief.ts:25 + `computeKpis` | staff-app.test.ts |

### 1.10 Marketing: APEX hero and CEO view (`renderMarketing` A:2390, `mkCeo` A:2218)

| # | UI label | Where | Class | Evidence | Depends on / test |
|---|---|---|---|---|---|
| X1 | "APEX, manage my marketing →" | Hero | Works | `ceoAnalyze(…,'marketing/manage')` A:2414→SA:582→`manageMarketing` apex-ceo.ts:292 | Omneky · marketing-omneky.test.ts |
| X2 | "Connect Omneky to start" / "Reconnect Omneky" | Hero / empty pages | Works | `omnekyConnect` A:2166→`marketing/omneky/connect` SA:569→`startOmnekyConnect` omneky.ts:90 (OAuth with PKCE) | Omneky app configured (`rt.omneky`) · marketing-omneky.test.ts |
| X3 | "Setup guide" | Empty pages / Connections | Works | `omnekyGuide` A:2158 (text sheet) | — |
| X4 | "Ask APEX about your ads…" | Hero | Works | `askApexSheet` A:2434→`marketing/ask` SA:572→`askApex` omneky.ts:436 (numbers from code, wording from the AI) | Omneky, AI model · marketing-omneky.test.ts |
| X5 | "APEX briefing" tab / "Advanced tools ▾" toggle | Tabs | Works | `mkShow` A:2420 | — |
| X6 | Bottom band "Ask Atlas" arrow | Footer band | Works | `askSheet()` A:2417 | AI model |
| X7 | "Omneky can no longer reach your Facebook ads" banner + "Fix Facebook in Omneky" | CEO view | Works | Link from `readiness.connect_links` A:2238 (outside page). **Its text hard-codes "Choose Brow's ad account and Facebook page" (A:2240)**: pilot data inside the master platform | Omneky |
| X8 | Briefing card (headline + paragraphs) | CEO view | Works | `marketing/ceo` SA:580→`ceoView` apex-ceo.ts:225 | marketing-omneky.test.ts |
| X9 | VIEW AD PERFORMANCE | CEO buttons | Works | `mkShow('library')` | — |
| X10 | ANALYZE MY ADS | CEO buttons | Works | `marketing/analyze` SA:581→`analyzeAds` apex-ceo.ts:251 | marketing-omneky.test.ts |
| X11 | CREATE NEW ADS | CEO buttons | Needs approval | `creativeSheet` A:2330→`marketing/creatives` SA:585→`prepareCreatives` apex-ceo.ts:318. Gives briefs + a code; Omneky makes the images only after `marketing/creatives/U/decide` (spends Omneky credits) | AI model, Omneky · marketing-omneky.test.ts |
| X12 | PREPARE A/B TEST | CEO buttons | Needs approval | `abSheet` A:2345→`newCampaignSheet`→`marketing/campaigns` SA:563→`draftCampaign` campaigns.ts:169 | marketing-campaigns.test.ts |
| X13 | REVIEW CAMPAIGN | CEO buttons | Works | `reviewSheet` A:2346→`marketing/campaigns` GET→`listCampaigns` campaigns.ts:238 | marketing-campaigns.test.ts |
| X14 | APPROVE AND LAUNCH (and "Approve and launch…" on ready ads) | CEO buttons | Needs approval | `launchSheet` A:2356→`marketing/launch` SA:588→`prepareLaunch` apex-ceo.ts:467→`requestAdAction(kind:'launch_ads')` omneky.ts:593, which returns a code | Omneky · marketing-omneky.test.ts |
| X15 | PAUSE AD (and "Pause" on "Ads needing attention") | CEO buttons | Works | `pickAdSheet`→`adActionSheet('pause')` A:2519→`marketing/actions` SA:576→`requestAdAction`. Runs straight away through Omneky | Omneky · marketing-omneky.test.ts |
| X16 | RESUME AD | CEO buttons | Needs approval | `requestAdAction(kind:'resume')` returns a code | Omneky · marketing-omneky.test.ts |
| X17 | VIEW AI RECOMMENDATIONS (+ "Analyze my ads now") | CEO buttons | Works | `recsSheet` A:2378 | marketing-omneky.test.ts |
| X18 | VIEW CAMPAIGN RESULTS | CEO buttons | Works | `mkShow('campaigns')` | — |
| X19 | 6 KPI tiles (spend, leads, CPL, qualified, appointments, sales & revenue) | CEO view | Works | `ceoView` (Omneky snapshot + CRM) | marketing-omneky.test.ts |
| X20 | "set your target" (cost per lead) | CPL tile | Works | `targetSheet` A:2385→`marketing/target` SA:589→`setTarget` apex-ceo.ts:491 | marketing-omneky.test.ts |
| X21 | Best-performing ads + "All ads →" | CEO view | Works | `ceoView.best` | marketing-omneky.test.ts |
| X22 | Ads needing attention → "Replace" | CEO view | Needs approval | `creativeSheet(adId)` (= X11) | marketing-omneky.test.ts |
| X23 | "APEX recommends" action buttons | CEO view | Works | `runAction` A:2310 opens the X11/X12/X15/X16/X20 sheets | — |
| X24 | "Waiting for your decision": type code + Approve / Reject (creatives, launches, resumes, budgets) | CEO view A:2272 | Works | `marketing/creatives/U/decide` SA:587→`decideCreatives` apex-ceo.ts:365; `marketing/actions/U/decide` SA:578→`decideAdAction` omneky.ts:625 | marketing-omneky.test.ts |
| X25 | Campaign plan "Review plan" | CEO view | Works | `campaignSheet` | marketing-campaigns.test.ts |
| X26 | "New ads from APEX" (images, credits used) | CEO view | Works | `ceoView.creatives` | marketing-omneky.test.ts |
| X27 | "What APEX can do" + "Check again" | CEO view | Works | `marketing/readiness` SA:583→`checkReadiness` apex-ceo.ts:52 (live Omneky check) | marketing-omneky.test.ts |
| X28 | Campaign sheet: type code + Approve / Reject | Campaign sheet A:2096 | Works | `marketing/campaigns/U/decide` SA:565→`decideCampaign` campaigns.ts:206. **Approving a plan launches nothing**: the status becomes "waiting for provider" (A:2107) | marketing-campaigns.test.ts |

### 1.11 Marketing: the 11 sub-pages (`MK_PAGES` A:2135)

| # | UI label | Where | Class | Evidence | Depends on / test |
|---|---|---|---|---|---|
| P1 | Overview: KPI cards (Spend, Leads, CPL, Qualified, Appointments, Sales, Revenue, ROAS) | Overview A:2452 | Works | `marketing/results` SA:567→`marketingResults` omneky.ts:351 | Omneky · marketing-omneky.test.ts |
| P2 | Overview: range Yesterday / 3 / 7 / 30 days / Custom | Overview | Works | `marketing/results?from&to` | marketing-omneky.test.ts |
| P3 | Overview: "Today" range | Overview | Screen only | A:2488 only shows a toast ("results run to yesterday") | — |
| P4 | Overview: "Refresh from Omneky" (also on Campaigns and Connections) | Overview | Works | `marketing/omneky/sync` SA:570→`syncOmneky` omneky.ts:247 | Omneky · marketing-omneky.test.ts |
| P5 | Overview: Spend vs leads chart, Leads by platform, Best & worst campaign, APEX alerts + "Diagnosis →" | Overview | Works | Results + `marketing/reports` SA:573→`listReports` omneky.ts:508 | marketing-omneky.test.ts |
| P6 | Campaigns: All/Running/Paused filter + search | Campaigns A:2500 | Works | Filter in the browser | — |
| P7 | Campaigns row "Pause" | Campaigns | Works | `adActionSheet('pause')`→`requestAdAction`. **The channel is hard-coded to 'meta'** (A:2527) | Omneky |
| P8 | Campaigns row "Resume…" / "Budget…" | Campaigns | Needs approval | `requestAdAction` returns an approval code | Omneky · marketing-omneky.test.ts |
| P9 | "APEX plans & tests" list + "New campaign →" | Campaigns | Needs approval | `newCampaignSheet` A:2078→`draftCampaign` | marketing-campaigns.test.ts |
| P10 | "Backup data source" (Metricool accounts and gaps) + "Add/Reload example ad data (test)" | Campaigns `<details>` | Works | `marketing` SA:556→`marketingOverview` marketing.ts:159; `test/marketing-examples` SA:557→`marketingExamples` :263 | Metricool · marketing.test.ts, marketing-sync.test.ts |
| P11 | Ad Library: ad cards with APEX verdict, "Compare (n/3)" | Library A:2544 | Works | Results `ads`, compared in the browser | marketing-omneky.test.ts |
| P12 | Ad Library: ad images / previews | Library | Not built | The cards show numbers only. A:2549 says Omneky sends pictures only for ads made in Omneky, and none are rendered here | Omneky |
| P13 | A/B Testing: list of tests (hypothesis, versions, winner rule) | A/B A:2569 | Works | `marketing/campaigns` (plans that have a `test`) | marketing-campaigns.test.ts |
| P14 | A/B Testing: results per version, winner labels | A/B | Not built | A:2574: "Results per version appear here once its ads are live; until then nothing is estimated". No code joins live ad results to versions | — |
| P15 | A/B Testing: 20 "Start a test" tiles | A/B | Needs approval | They prefill `newCampaignSheet` (= P9) | — |
| P16 | Campaign Creator: "Ask APEX for a plan" + Preview + "Open the full plan" | Creator A:2582 | Needs approval | `marketing/campaigns`→`draftCampaign` (AI optional; budget maths in code) | marketing-campaigns.test.ts |
| P17 | AI Workforce: 7 agent tiles, live 9-stage map, activity feed (polls every 15 s) | Workforce A:2607 | Works | `marketing/events` SA:574→`listEvents` omneky.ts:516 (`apex_events`) | marketing-omneky.test.ts |
| P18 | AI Workforce: ATLAS / JOHN tiles always "Ready" | Workforce | Screen only | A:2614 hard-codes `['atlas','john']` as Ready; they are not wired to any event | — |
| P19 | Approvals: launch plans ("Review"), resume/budget Approve(code)/Reject, "Decided" history | Approvals A:2623 | Works | `marketing/campaigns` + `marketing/actions` SA:575→`listAdActions` omneky.ts:649; decide SA:578 | marketing-omneky.test.ts |
| P20 | Approvals: how a pending **launch_ads** item is shown | Approvals | Broken | A:2632 labels every non-resume action "Set daily budget to ${daily_budget}", so a launch shows as "Set daily budget to null: <ad set>". The history map at A:2627 has no `launch_ads` key and prints "undefined: …". Approving still works | — |
| P21 | Approvals: creative (image-generation) approvals | Approvals | Not built | This page never loads `marketing/creatives`; creative codes can only be approved on the APEX CEO view (X24) | — |
| P22 | Diagnosis (what happened / why / what to do / what to measure) | Diagnosis A:2647 | Works | `marketing/reports.latest_diagnosis`→`listReports` | marketing-omneky.test.ts |
| P23 | Daily Reports list → report sheet | Reports A:2659 | Works | `listReports`; reports built by `buildReport` omneky.ts:469 | marketing-omneky.test.ts |
| P24 | Revenue funnel (clicks → enquiries → from ads → qualified → appointments → sales → revenue) | Revenue A:2674 | Works | Results `crm` + `marketingOverview.money` | marketing-omneky.test.ts |
| P25 | Revenue: one-to-one ad → lead → sale attribution | Revenue | Not built | A:2682 says so ("not yet joined one-to-one"). The table `attribution_events` exists but no CRM code uses it | — |
| P26 | Connections: Omneky status, credits chip, Refresh / Reconnect / Disconnect / Setup guide | Connections A:2686 | Works | `marketing/omneky` SA:568→`omnekyStatus` omneky.ts:660; disconnect SA:571→`disconnectOmneky` :144 | marketing-omneky.test.ts |
| P27 | Connections: ad channels inside Omneky + "Link … in Omneky" / "Fix in Omneky" | Connections | Works | `capabilities.channels/connect_links` (outside links) | Omneky |
| P28 | Connections: Meta / TikTok / Google rows | Connections | Works | Status worked out from the Omneky connectors | Omneky |
| P29 | Connections: "Claude (APEX's brain)", "JOHN · WhatsApp Ready", "ATLAS · CRM Connected" | Connections | Screen only | Fixed values at A:2705-2707, not checked against anything | — |
| P30 | Connections: Higgsfield, Kling | Connections | Not built | A:2708-2709: "not linked to this dashboard yet" | — |
| P31 | Connections: Metricool | Connections | Works | `marketingOverview.connections.metricool` | Metricool |

### 1.12 HR

| # | UI label | Where | Class | Evidence | Depends on / test |
|---|---|---|---|---|---|
| R3 | HR list, stats, HR card | HR A:2737 | Works | `hr` SA:620→`hrPeople` hr.ts:65; `hr/summary` SA:601→`hrSummary` hr-care.ts:40 | hr-people.test.ts, hr-care.test.ts |
| R4 | "Add employee" | HR | Works | `hr/people` SA:621→`addEmployee` hr.ts:135 | hr-people.test.ts |
| R5 | "My record" / person row | HR | Works | `openPerson` A:2951→`hr/people/U` SA:625→`hrPerson` hr.ts:102 | hr-people.test.ts |
| R6 | Attendance "Clock in / Clock out" | HR / My HR | Works | `hr/attendance/clock` SA:612→`clock` attendance.ts:50 | hr-attendance.test.ts |
| R7 | Attendance "Fix a day" | HR / My HR | Needs approval | `hr/attendance/correction` SA:615→`requestCorrection` attendance.ts:208 (manager or HR approves) | hr-attendance.test.ts |
| R8 | Fixes: Approve / Turn down / Cancel | HR | Works | `hr/attendance/U/decide|cancel` SA:617→`decideCorrection` :252 / `cancelCorrection` :238 | hr-attendance.test.ts |
| R9 | "Timesheets": Show / Download (CSV) | HR | Works | `hr/attendance/timesheet(.csv)` SA:613-614→`timesheet` :132 / `timesheetCsv` :154 | hr-attendance.test.ts |
| R10 | "Attendance settings" | HR | Works | `hr/attendance/policy` SA:616→`saveAttendancePolicy` attendance.ts:306 | hr-attendance.test.ts |
| R11 | Leave "Ask for leave" (and HR assistant "Send this request") | HR / My HR | Needs approval | `hr/leave/request` SA:593→`requestLeave` leave.ts:160 | hr-leave.test.ts |
| R12 | Leave: Approve / Turn down / Cancel | HR | Works | `hr/leave/U/decide|cancel` SA:596→`decideLeave` leave.ts:219 / `cancelLeave` :203 | hr-leave.test.ts |
| R13 | Leave settings: company days, "Add your own leave type", working days, clash limit, public holidays add/remove | Leave settings A:2928 | Works | `hr/leave/type` SA:594→`saveLeaveType` leave.ts:308; `hr/leave/policy` SA:595→`saveLeavePolicy` :333 | hr-leave.test.ts |
| R14 | "Onboarding checklist" template | HR | Works | `hr/onboarding/template` SA:602→`saveOnboardingTemplate` hr-care.ts:145 | hr-care.test.ts |
| R15 | Person: "Edit job details" | Person sheet | Works | `hr/people/U/profile` SA:626→`saveProfile` hr.ts:155 | hr-people.test.ts |
| R16 | Person: identity "Show" (with reason, hidden again after 30 s) | Person sheet | Works | `hr/people/U/reveal` SA:628→`revealIdentity` hr.ts:253 | PII key · hr-people.test.ts |
| R17 | Person: "Edit identity details" | Person sheet | Works | `hr/people/U/identity` SA:627→`saveIdentity` hr.ts:195 | PII key · hr-people.test.ts |
| R18 | Documents: Open / Remove / "Add a document" (≤ 3 MB, encrypted) | Person sheet | Works | `hr/documents/U/file` SA:633→`documentFile` hr.ts:303; remove SA:634→`removeDocument` :316; `hr/people/U/documents` SA:629→`addDocument` :274 | PII key · hr-people.test.ts |
| R19 | "Erase identity details" | Person sheet | Works | `hr/people/U/erase` SA:630→`eraseIdentity` hr.ts:327 | hr-people.test.ts |
| R20 | Onboarding ticks / "Start onboarding" | Person care A:2820 | Works | `hr/onboarding/U` SA:608→`tickOnboarding` hr-care.ts:180; `hr/people/U/onboarding` SA:606→`startOnboarding` :158 | hr-care.test.ts |
| R21 | Training "Add training" / "Remove" | Person care | Works | `hr/people/U/training` SA:607→`addTraining` hr-care.ts:202; `hr/training/U/remove` SA:609→`removeTraining` :217 | hr-care.test.ts |
| R22 | My HR: "Ask about your leave and HR" | My HR A:2839 | Works | `hr/assistant` SA:603→`askHrAssistant` hr-care.ts:282 | AI model · hr-care.test.ts |

### 1.13 Team / Settings

| # | UI label | Where | Class | Evidence | Test |
|---|---|---|---|---|---|
| T1 | "Change name" (name + email) | Team A:3061 | Works | `team/U` SA:365 (inline SQL) | staff-app.test.ts |
| T2 | "Sign-in link" → Copy / Send on WhatsApp (wa.me) | Team | Works | `team/U/signin-link` SA:377→`createActionLink` links.ts:15 | staff-app.test.ts, job-card.test.ts |
| T3 | "Set / Change my password" | Team → My login | Works | `me/password` SA:240→`setOwnPassword` logins.ts:48 | logins.test.ts |
| T4 | "Who sees which customers" (all / own) | Team | Works | `team/visibility` SA:246→`setLeadVisibility` logins.ts:98 | logins.test.ts |
| T5 | "Change rules" (follow-ups) | Team | Works | `rulesSheet` (= C9) | crm-followups.test.ts |
| T6 | "Where customers come from": "Get my address" / "Make a new address" | Team | Works | `lead-sources/email-forward` SA:452→`createEmailForward` leadsources.ts:220 | lead-sources.test.ts |
| T7 | Facebook/Instagram lead forms status line | Team | Blocked by provider | Information only. FusionTech connects the Facebook Page (A:3229) | Meta Page access · lead-sources.test.ts |
| T8 | "Import customers": "Choose a file" | Team | Works | = C24 | importer.test.ts |
| T9 | Connect another app: "Receive customers from an app" / "Send to an app" | Team `#apps` A:3190 | Works | `connections` POST SA:439→`createAppConnection` connections.ts:30 | app-connections.test.ts |
| T10 | Connected app: "Send a test" / "Signing key" / "Remove" | Team `#apps` | Works | `connections/U/test|secret|remove` SA:444→`testAppConnection` :140 / `appConnectionSecret` :60 / `removeAppConnection` :68 | app-connections.test.ts |
| T11 | Test tools: test WhatsApp / test Facebook lead / test portal email / Add example customers | Team (test system) | Works | `test/whatsapp` SA:459; `test/facebook-lead` SA:468→`intakeMetaLead` leadsources.ts:85; `test/portal-email` SA:477→`receiveEnquiryEmail` :206; `test/examples` | lead-sources.test.ts, staff-app.test.ts |
| T12 | "Still needed from the business" list | Team | Works | `me.org.to_confirm` SA:656 | — |

### 1.14 Server routes with no button calling them

`home` (SA:413→`commandCenter`; the UI reads the same data through `dashboard.home`), `marketing/creatives` GET (SA:584), `hr/people/U/leave` (SA:599). None of these is broken; they are just unused by the screen. Also, `rescheduleAppointment` (appointments.ts:141) has no staff route at all (see C25).

### 1.15 Pilot or one-country data written into the master platform (against the 2026-10-15 platform rule)

- A:2240: "Choose **Brow's** ad account and Facebook page", shown to every tenant.
- A:2075, 2080, 2585: eyebrow-embroidery example text in the campaign forms.
- A:2081 "Total per day (S$)", A:1955 "Price before GST (SGD)", A:1962 "Amount received (SGD)": the currency is hard-coded even though `org.currency` exists.
- A:1514-1515 and the `EXAMPLES` list in SA:759: aircon and HDB placeholders. The test examples switch to `GENERIC_EXAMPLES` by industry; the placeholders do not.
- C:198: the "Test system" pill is hard-coded and also shows in production.

---

## 2. FusionTech Master Control (`/control`)

How it works: `api()` (C:138) calls `/control/api/<route>` with the `x-edg-control` header. `handleControl` (CT:119) requires email + password + TOTP code. Every route below exists in CT.

| # | UI label | Where | Class | Evidence | Depends on / test |
|---|---|---|---|---|---|
| MC1 | Invitation page: QR / secret, "Finish setup" | `/control/setup/<token>` C:152 | Works | `setup/start` CT:142, `setup/finish` CT:151 | platform-admin.test.ts |
| MC2 | Sign in (email + password) | Gate C:171 | Works | `login` CT:167 | platform-admin.test.ts |
| MC3 | Authenticator code | Gate C:181 | Works | `code` CT:180 (TOTP, no replay) | platform-admin.test.ts |
| MC4 | "Use a different account" / "Sign out" (sidebar + phone) | Gate / shell | Works | `logout` CT:194 | platform-admin.test.ts |
| MC5 | Sidebar: Clients · New client · Software · Quotes · Activity (+ phone nav) | Shell C:194 | Works | `go(v)` C:205 | — |
| MC6 | "Test system" pill | Top bar C:198 | Screen only | Hard-coded and not tied to the environment | — |
| MC7 | Clients: stats, search, table rows → client | Clients C:220 | Works | `clients` GET CT:204→`listClients` | platform-admin.test.ts |
| MC8 | Clients: "New client" | Clients | Works | `go('new')` | — |
| MC9 | Employee-data key card (status) | Clients C:241 | Works | `platform/pii-key` CT:213 | pii-key.test.ts |
| MC10 | "Create a key" (shown once) + Copy / Done | Key card | Works | `platform/pii-key/new` CT:214→`newPiiKey` | pii-key.test.ts |
| MC11 | Client: "← All clients" | Client C:269 | Works | `go('clients')` | — |
| MC12 | Client: "View as client" (read-only, 2 h, reason recorded) | Client | Works | `client/U/support` CT:290-300→`supportViewUser` + `createAppSession` | platform-admin.test.ts |
| MC13 | Client: "Pause business" (reason) / "Resume business" | Client | Works | `client/U/status` CT:294→`setClientStatus` | platform-admin.test.ts |
| MC14 | Modules: On / Restricted / Off + role chips | Client C:361 | Works | `client/U/module` CT:293→`switchModule` (also switches off dependants) | platform-admin.test.ts, modules.test.ts, entitlements.test.ts |
| MC15 | Marketing data source (Metricool): "Load" brands, "Save source" | Client C:305 | Works | `metricool/brands` CT:274; `client/U/marketing` CT:282→`setMarketingConnection` | Metricool agency key (404 without it) · marketing-sync.test.ts |
| MC16 | Metricool: "Run connection test" / "Numbers match: confirm" / "Update now" / "Pause updates" / "Resume updates" / "Change source" | Client | Works | CT:283-288→`testMarketingConnection` / `confirmMarketingConnection` / `processMarketingSync` / `pauseMarketingConnection` | Metricool · marketing-sync.test.ts |
| MC17 | AI assistants list + "Agent types Atlas knows" | Client | Works | `clientDetail.agents/registry` CT:208 | platform-admin.test.ts |
| MC18 | Machine keys: "New key" (modules, acts as) + Copy / Done; "Stop" | Client C:397 | Works | `client/U/keys` CT:295→`createApiKey`; `client/U/keys/U/revoke` CT:303→`revokeApiKey` | platform-admin.test.ts |
| MC19 | People / History lists | Client | Works | `clientDetail` | platform-admin.test.ts |
| MC20 | New-client wizard: step 1 business, step 2 modules, step 3 review → "Create business" → "Open the client" | New C:423 | Works | `clients` POST CT:205→`createClient` (build + self-test) | platform-admin.test.ts, build.test.ts |
| MC21 | Software: "Check" a client's software | Software C:480 | Works | `software/check` CT:223→`checkSoftwareAndRecord` | software.test.ts |
| MC22 | Software: "Make a secure link" / "Stop" | Software | Works | `credential-requests` CT:235→`createCredentialRequest`; `credential-requests/stop` CT:242 | Credential encryption key · credential-form.test.ts |
| MC23 | Software: "Asked about" status select; developer-account status select | Software | Works | `software/request` CT:224; `developer-account` CT:264 | software.test.ts |
| MC24 | Software catalogue cards by category | Software | Works | `softwareCatalog` CT:221 | software.test.ts |
| MC25 | Quotes: price list "Save" | Quotes C:531 | Works | `prices` CT:251→`setFusionPrice` | fusion-quotes.test.ts |
| MC26 | Quotes: draft "Approve" / "Reject" | Quotes | Works | `quotes/decide` CT:256→`decideFusionQuote`. Records the decision only; nothing is sent | fusion-quotes.test.ts |
| MC27 | Activity (platform audit, 150 rows) | Activity C:560 | Works | `audit` CT:206→`platformAuditLog` | platform-admin.test.ts |
| MC28 | Omneky per client (status, credits, reconnect) | Client page | Not built | `marketingCard` (C:305) covers Metricool only. Omneky is managed only inside the tenant's own app | — |
| MC29 | Cross-client usage / AI cost / billing / Stripe subscription | — | Not built | No route in CT | — |
| MC30 | Tenant white-label branding (logo, colours, domain) | — | Not built | No field or table for it | — |
| MC31 | Cross-client Agent Ops / health board | — | Not built | `/control/api/metricool/check` exists (CT:269) but is never called from the UI; there is no other health route | — |
| (route) | `metricool/check` | — | (unused) | CT:269 has no button | — |

---

## 3. Spec comparison: GoHighLevel-style AI business OS

Legend: ✅ exists (where) · 🟡 partial · ❌ Not built · 🔌 code exists but needs a provider

### Sales (JOHN)
| Spec feature | Status | Where / note |
|---|---|---|
| Unified inbox across WhatsApp / IG / Messenger / web chat / email | ❌ | There is no inbox screen. Messages appear only inside one customer's timeline (`customerTimeline`, C21). Incoming: WhatsApp (`/webhooks/whatsapp`, app.ts:184), website form (`POST /leads`, app.ts:34/354), forwarded enquiry emails (T6), Meta lead forms (`/webhooks/meta-leads` app.ts:205), app hooks (T9). **No IG DM, Messenger or web-chat code** (no file matches) |
| Lead source attribution | 🟡 | `leads.source/channel` + `utm` on intake (intake.ts) + "Leads by Source" (H52). No ad-level attribution (P25) |
| Filters (New, Replied, No reply, Follow-up due, Booked, Closed, Unassigned, by source) | 🟡 | Follow-up reason chips (C8: not contacted, waiting, overdue, quote no answer, stale, missed appointment, big deal) + mine/everyone + pipeline columns. Missing: unassigned, by-source and replied filters |
| AI replies from a knowledge base | ✅ | `receiveCustomerMessage` agents.ts:44 + approved `knowledge_items` (A10). Needs the AI model and WhatsApp Cloud |
| Human take-over | ✅ | C19 `setAgentPaused` |
| Lead qualification hot/warm/cold | 🟡 | Only a "qualified" status/stage. The "Hot" chip on Home is derived from it (A:929). No scoring |
| Follow-up sequences (day 1/3/7, stop on reply, opt-out, quiet hours, WhatsApp 24 h rule) | 🟡 | Owner workflows (A5): a trigger, one wait, a "customer_has_not_replied" condition (automations.ts:41), then actions. Day 1/3/7 means three separate workflows. Opt-out is respected (notify.ts, intake `skipped_opt_out`). The 24 h window and approved-template rule are enforced in notify.ts:50-68. **Quiet hours: ❌** (business hours exist only for follow-up SLAs) |
| Broadcasts to opt-in segments with approval | ❌ | Nothing in crm or adapters |
| Google Calendar booking / reschedule / cancel / reminders | 🔌🟡 | Booking/cancel create and delete calendar events (appointments.ts:121/135/210); 24 h reminder job (appointments.ts:187); reschedule exists for the AI agent only (no staff button, C25). The Google adapter needs per-business OAuth and is marked "NEEDS VERIFICATION" |
| Speed-to-lead and missed-lead alerts | 🟡 | The "not contacted after N business hours" and "waiting" rules + manager notifications (C9) do this job. No dedicated speed-to-lead metric |

### Marketing (APEX)
| Spec feature | Status | Where |
|---|---|---|
| Ads overview | ✅ | P1–P5, X8/X19 (Omneky) |
| Campaigns pause / resume / budget | ✅ | P7/P8, X15/X16. Resume and budget need an approval code. Channel hard-coded to `meta` |
| A/B tests | 🟡 | Test design and plans (P13, P15); **no results per version** (P14) |
| Ad library | 🟡 | P11 numbers only; no images (P12) |
| Campaign creator | ✅ | P16 / X12. Approving a plan does not launch it (X28) |
| Approvals | 🟡 | X24, P19; creative approvals missing from the Approvals page (P21); launch shown with the wrong label (P20) |
| Diagnosis | ✅ | P22 |
| Daily reports | ✅ | P23 (`buildReport` omneky.ts:469) |
| Revenue funnel | 🟡 | P24; no one-to-one attribution (P25) |
| Connections | ✅ | P26–P31 (some fixed statuses, P29) |
| Social planner | ❌ | — |
| Comments & DMs triage | ❌ | — |
| Reputation / reviews | ❌ | Only an example text "Ask for a Google review" for a workflow |
| SEO / Google Business Profile | ❌ | — |
| Email campaigns | ❌ | — |

### Website (TITAN)
| Spec feature | Status | Where |
|---|---|---|
| New website / landing page / funnel, edit with AI, templates, preview, versions / rollback, domains, publish, analytics, linked-apps panel | ❌ | Home cards show "Projects —" / "Previews —" (H25); `departments.website.builds: null` (dashboard.ts:145). "Request a website" only creates a task (H29). No `websites` or `deployments` table |
| Forms → CRM leads | ✅ | Public `POST /leads` (website_form, honeypot, rate limit) app.ts:34/354; `/test-form`; "Link a website form" → app hooks (T9) |

### CRM (ATLAS)
| Spec feature | Status | Where |
|---|---|---|
| Contacts with timeline | ✅ | Lead sheet + `customerTimeline` (C10, C21) |
| Companies | ❌ (table only) | The `companies` table exists (002_crm.sql:3) but no code or screen uses it |
| Tags, custom fields, smart lists | ❌ | — |
| Dedupe | 🟡 | Automatic on intake (phone/email normalised, repeat enquiry) and import (duplicate in file / existing); there is no merge screen |
| Pipelines, drag-and-drop | 🟡 | Pipeline board with SLA (C2); **no drag-and-drop** (C3); the `pipelines` and `deals` tables exist |
| Tasks | ✅ | H60–H62 |
| Projects | ❌ | The "Projects & Orders" menu item opens Quotes (H9) |
| Orders (sales) | ❌ | Only purchase orders (K9–K15) |
| Products & inventory | ✅ | Price list (M6) + stock items, places, counts (K1–K8) |
| Suppliers / purchase orders | ✅ | K4, K9–K15 (approval limit, bill matching) |
| Quotations | ✅ | C15, M2, M3 |
| Support tickets | ❌ | — |
| Documents | 🟡 | HR staff documents only (R18); job photos and signatures |
| Automation builder (triggers → actions with delays and conditions) | 🟡 | A5/A6: one trigger, one wait, up to 5 conditions, several actions, schedules, a rehearsal. No branching or multi-step waits |
| Import / export | 🟡 | Import CSV/XLSX (C24); export only for the timesheet CSV (R9). No customer export |

### Admin / Finance / HR (SAGE)
| Spec feature | Status | Where |
|---|---|---|
| Invoices | ✅ | M4 (made from an accepted quotation) |
| Stripe payment links | ❌ | Stripe appears only as software-catalogue text |
| Payment matching | 🟡 | Payments recorded by hand (M5); supplier-bill matching (K15); no bank or Stripe matching |
| Overdue reminders | 🟡 | Quote reminders and follow-up rules; no dedicated invoice-overdue reminder found |
| Expenses with receipt reading | ❌ | — |
| P&L | ❌ | (`accounting.ts` = Xero sync, a separate module) |
| Staff | ✅ | R3–R5 |
| Leave & attendance | ✅ | R6–R13 (Singapore Employment Act rules) |
| Onboarding | ✅ | R14, R20 |
| Documents / e-signature | 🟡 | Encrypted HR documents (R18); signatures only on job cards (J12) |
| Payroll (through a provider) | ❌ | A `payroll` role exists; no integration |
| Compliance reminders | ✅ | Pass, document and training expiry at 60/30/7 days (`hr_expiry_reminders`, R21 note) |

### CEO Brain (NOVA)
| Spec feature | Status | Where |
|---|---|---|
| Chat answers from deterministic DB queries | 🟡 | `askAtlas` (dashboard.ts:208): an **LLM** answers from a fixed JSON of dashboard facts. The facts are deterministic; the answer is not |
| Delegation of jobs to directors | ❌ | Quick actions only navigate or create tasks |
| Morning briefing | ✅ | `templateBrief` (R2) + `generateCeoBrief` brief.ts:57 (8 AM) |
| Goals | ❌ | Only APEX's cost-per-lead target (X20) |

### Platform
| Spec feature | Status | Where |
|---|---|---|
| Connections & Credits page | 🟡 | Marketing → Connections (Omneky credits, P26); System health connections table (H63); app connection "Send a test" (T10); `provider_checks` table for Metricool. No cost per action, no monthly spend or cap per provider (only an AI monthly limit, A2) |
| Agent Ops Center (status, live run log, job flow graph, daily log, schedules, errors / retries / dead letter, costs) | 🟡 | Spread across: Marketing AI Workforce (P17: status, live 9-stage map, feed), System health (H63: workflow runs, late, failed, dead events 7 days, AI cost), recent workflow runs (A9). No single page, no retry button, no schedule view |
| Action registry / engine with approvals and cost estimates | 🟡 | `ACTIONS` role matrix (authz.ts) + approval codes (marketing) + Approval Center (H56); Omneky credits before/after on creatives. No general registry or cost estimate |
| White-label branding per tenant | ❌ | The FusionTech logo is hard-coded; no branding fields |
| Roles | ✅ | owner/admin/manager/sales/support/viewer/hr/payroll (+ agent); module restriction by role (MC14) |
| 17 languages / i18n | ❌ | `<html lang="en">`, English strings, `en-SG` formatting (16 uses). The AI replies in the customer's language (agents.ts:234) |
| Stripe subscriptions | ❌ | — |

---

## 4. Database tables (migrations 001–046)

| Spec table | Status | Actual table(s) |
|---|---|---|
| tenants / organizations | ✅ | `organizations`, `organization_modules`, `modules` |
| users | ✅ | `users`, `user_credentials`, `app_sessions`; platform: `app.platform_admins` |
| roles | ✅ | `roles`, `permissions` (001) |
| agents / ai_agents | ✅ | `ai_agents`, `agent_registry`, `agent_actions` |
| contacts | ✅ | `contacts` |
| companies | ✅ (unused) | `companies` (002_crm.sql:3) |
| conversations | ✅ | `conversations` (also holds the messages) |
| messages | 🟡 | No separate table; message rows live in `conversations` |
| leads | ✅ | `leads` (+ `deals`, unused by the app) |
| pipelines | ✅ | `pipelines` |
| bookings / appointments | ✅ | `appointments`, `appointment_types`, `availability_rules`, `time_off`, `job_cards`, `job_photos` |
| tasks | ✅ | `tasks` |
| projects | ❌ | — |
| orders | 🟡 | `purchase_orders`, `purchase_order_lines` only (no sales orders) |
| products | 🟡 | `price_items`, `stock_items` (no unified products table) |
| invoices | ✅ | `invoices`, `invoice_lines` |
| payments | ✅ | `payments` |
| expenses | ❌ | — |
| staff | ✅ | `staff_hr_profiles`, `staff_identity`, `staff_documents`, `training_records`, `onboarding_*`, `leave_*`, `attendance_*`, `hr_*` |
| documents | 🟡 | `staff_documents`, `document_counters` (number sequences); no general documents table |
| campaigns | ✅ | `marketing_campaigns` (+ `marketing_entities`, `marketing_*_metrics`, `marketing_snapshots`) |
| creatives | ✅ | `marketing_creatives` |
| websites | ❌ | — |
| deployments | ❌ | (`provisioning_runs` is for client builds, not websites) |
| jobs | 🟡 | `job_cards`, `agent_reply_jobs`, `app.atlas_build_jobs` (no generic agent-job table) |
| agent_events / apex_events | ✅ | `apex_events`, `events` (outbox), `event_consumptions` |
| approvals | ✅ | `approvals` (003) + approval codes on `marketing_campaigns/actions/creatives` |
| connections | ✅ | `integration_connections`, `channel_accounts`, `app_connections`, `marketing_connections`, `omneky_links`, `oauth_tokens`, `app.client_credentials` |
| usage | 🟡 | `agent_actions` (tokens, cost_micros); no general usage or credits ledger |
| automations | ✅ | `automations`, `automation_runs`, `workflow_runs` |
| schedules | 🟡 | No table; schedules live in `automations.trigger.schedule` and `app.timer_keys` |
| audit_log | ✅ | `audit_logs`, `app.platform_audit` |

---

## 5. Counts

Every row in sections 1 and 2 counted once (the "(route)" row is excluded):

| Class | Staff app | Master Control | Total |
|---|---|---|---|
| Works | 219 | 26 | 245 |
| Needs approval | 14 | 0 | 14 |
| Screen only | 8 | 1 | 9 |
| Not built | 8 | 4 | 12 |
| Blocked by provider | 2 | 0 | 2 |
| Broken | 1 | 0 | 1 |
| **Total entries** | **252** | **31** | **283** |

"Works" means the code path is real and the route exists. Many Works rows still need an outside service at run time; the "Depends on" column names it: the AI model (S2, H2, H42, X4, A6, R22, X11), Omneky (all APEX actions and pages), Metricool (MC15–16), the HR PII key (R16–18). This audit read the code; it did not check which services are connected in production.

(Several rows group a few related buttons, so the number of single buttons is higher. Every button in a grouped row is Works unless the row says otherwise.)
