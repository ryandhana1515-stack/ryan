# Software Knowledge Base

> Generated from `fusion-edg-core/packages/core/src/software/cards.ts` by `scripts/export-software-kb.ts`. **Do not edit here**: change the cards in the repo, run the tests, re-export.
> ATLAS: use this before promising any connection. Status words follow Ryan's brief §7. "Tested against a stand-in" means not yet proven with a real account.

| Status | Meaning |
|---|---|
| ✅ Supported | Atlas connects; proven live; the client just clicks Connect |
| 🔧 Connector, needs setup | Atlas has the connector; the client must do something first (or it is not yet proven live) |
| 🛠️ Connector to build | The software has an official API; FusionTech would build the connector |
| ◐ Partly possible | Only some things can be connected (listed) |
| 📄 Files only | No usable API: data moves by CSV/Excel |
| ⛔ Not possible | No reliable authorised way |

## Accounting

| Software | Status | Atlas today | The client needs | FusionTech needs | Singapore | Checked |
|---|---|---|---|---|---|---|
| **Xero** | 🔧 Connector, needs setup | creates and updates customers; creates draft or approved invoices; reads whether an invoice is paid (tested against a stand-in) | a Xero subscription; an adviser/admin signs in once to connect | Xero Developer (free); certification needed beyond 50 connections (Xero asks for about 10 live customers first); Starter free up to 5 connections; Core AUD 35/month up to 50; Plus AUD 245/month up to 1,000 (certified) | On IMDA's InvoiceNow-Ready list (1 Oct 2026): invoices can reach InvoiceNow through Xero. | 2026-10-09 |
| **QuickBooks Online** | 🛠️ Connector to build | planned: Phase H, after Intuit confirms a Singapore company can join its partner programme | a QuickBooks Online subscription | Intuit Developer (free Builder tier); production app assessment; the partner programme names US/UK/Australia/Canada-based partners; Builder free (reads capped); Silver US$300/month and up | Sold in Singapore. Not found on the IMDA InvoiceNow-Ready list (automated check). | 2026-10-09 |
| **QuickBooks Desktop** | 📄 Files only | — | — | — | — | 2026-10-09 |
| **Zoho Books** | 🛠️ Connector to build | planned: Phase H | — | Zoho API console (free); none found | Zoho Books lists no Singapore data centre in its API docs: Singapore organisations may be hosted elsewhere. | 2026-10-09 |
| **MYOB** | 🛠️ Connector to build | — | — | MYOB Developer Program; manual partner approval; AUD 110–630/month | Not sold in Singapore: the former MYOB line here is ABSS (a separate company). | 2026-10-09 |
| **ABSS Accounting** | 📄 Files only | — | — | — | Singapore's former MYOB line; on the IMDA InvoiceNow-Ready list. | 2026-10-09 |
| **Sage Accounting** | 🛠️ Connector to build | — | — | — | Not offered in Singapore (Sage sells Intacct, X3 and Sage 300 here). | 2026-10-09 |
| **Sage 300 / Sage Intacct** | 🛠️ Connector to build | — | — | Sage Intacct Web Services licence / partner programme | Mid-market products; Sage 300 / Intacct are on the IMDA InvoiceNow-Ready list. | 2026-10-09 |
| **FreshBooks** | 🛠️ Connector to build | — | — | FreshBooks Developer Portal app (fee not found) | — | 2026-10-10 |
| **Wave Accounting** | ⛔ Not possible | — | a Wave Pro subscription (API and webhooks) | — | Not available: Wave discontinued product support outside the US and Canada. | 2026-10-10 |

## HR & payroll

| Software | Status | Atlas today | The client needs | FusionTech needs | Singapore | Checked |
|---|---|---|---|---|---|---|
| **Talenox** | ◐ Partly possible | planned: with HR Part 2 | creates an API token or connects by OAuth in Talenox settings | listing as an integrated partner needs about 1,000 companies | Singapore payroll. CPF and IR8A are filed by Talenox / the client, not through the API. | 2026-10-09 |
| **JustLogin** | ◐ Partly possible | — | — | API access only after JustLogin approves our use case (by email to support) | Singapore-based HR and payroll. | 2026-10-09 |
| **Employment Hero** | 🛠️ Connector to build | planned: with HR Part 2 | an Employment Hero Platinum plan or above (API access) | — | Has Singapore fields. | 2026-10-09 |
| **Swingvy** | 📄 Files only | — | — | — | — | 2026-10-09 |
| **HReasily** | 📄 Files only | — | — | — | Singapore HR and payroll; listed in the Xero Malaysia app store. | 2026-10-10 |
| **Payboy** | 📄 Files only | — | — | — | Singapore HR and payroll. | 2026-10-10 |
| **Deel** | 🛠️ Connector to build | — | an Org Admin or IT Developer Admin approves the connection | Deel approves OAuth apps before they work outside our own organisation | — | 2026-10-10 |

## CRM

| Software | Status | Atlas today | The client needs | FusionTech needs | Singapore | Checked |
|---|---|---|---|---|---|---|
| **HubSpot** | 🛠️ Connector to build | planned: only when a client keeps HubSpot as its CRM (one source of truth per record type) | — | HubSpot developer account; an unlisted app stops at 25 installs; Marketplace listing needs review | — | 2026-10-09 |
| **Salesforce** | 🛠️ Connector to build | — | the client's Salesforce admin installs or approves our app | — | — | 2026-10-09 |
| **Zoho CRM** | 🛠️ Connector to build | — | — | — | — | 2026-10-09 |
| **Pipedrive** | 🛠️ Connector to build | — | — | a private app can be shared by link without review; the Marketplace needs approval | — | 2026-10-09 |
| **monday CRM** | 🛠️ Connector to build | — | — | — | — | 2026-10-10 |
| **GoHighLevel** | 🛠️ Connector to build | — | Agency Pro plan for OAuth / advanced API (Starter/Unlimited: basic API) | — | — | 2026-10-10 |

## Communications

| Software | Status | Atlas today | The client needs | FusionTech needs | Singapore | Checked |
|---|---|---|---|---|---|---|
| **WhatsApp Business Platform (Cloud API)** | 🔧 Connector, needs setup | receives customer messages; AI and staff replies within the 24-h window; template messages (tested against a stand-in) | a phone number for WhatsApp (not used in the WhatsApp phone app, unless linked); a payment card on its Meta account (message charges) | Meta for Developers (Tech Provider); Business Verification + App Review (advanced access) + Tech Provider terms; 10 new clients/week until Access Verification; none to FusionTech | Singapore has been its own (pricier) market since 1 Jul 2026. Since 1 Oct 2026 service replies are charged after 1,000 free per number per month. Do Not Call rules apply to marketing. | 2026-10-09 |
| **WhatsApp Business app** | 🔧 Connector, needs setup | through the WhatsApp Business Platform card (tested against a stand-in) | connects its number to the WhatsApp Business Platform (Cloud API) | — | — | 2026-10-09 |
| **Respond.io** | 🛠️ Connector to build | — | a Respond.io Growth plan or above (API); webhooks may need Advanced | — | — | 2026-10-09 |
| **Gmail** | ◐ Partly possible | reads enquiries forwarded to the business's Atlas email address (tested against a stand-in) | forwards enquiry emails to its Atlas address (works today) | reading mail is a restricted scope: Google verification (about 6 weeks) + a yearly paid security assessment (CASA); assessor fee, roughly US$500–4,500 a year (indicative) | — | 2026-10-09 |
| **Microsoft 365 (Outlook, OneDrive, Excel online, Teams)** | 🛠️ Connector to build | planned: after Google (Phase D) | — | Microsoft Entra app + Microsoft AI Cloud Partner Program (free); publisher verification so staff can consent; admin consent for application permissions; standard Graph calls free | — | 2026-10-09 |
| **Any app that sends or receives webhooks** | ◐ Partly possible | incoming webhook creates customers; workflow action "send to another app" (signed) (tested against a stand-in) | the other app can send or receive webhooks; the client pastes Atlas's address into it | — | — | 2026-10-09 |
| **Wati** | 🛠️ Connector to build | — | a Wati Growth plan or above (pay-as-you-go has no API) | — | — | 2026-10-10 |
| **Twilio (SMS, WhatsApp)** | 🛠️ Connector to build | — | Singapore SMS sender IDs registered with SGNIC first (about 5 business days) | WhatsApp: US$0.005 per message plus Meta's fee; SMS to Singapore US$0.0591 per message | — | 2026-10-10 |
| **Telegram (bots)** | 🛠️ Connector to build | — | — | free (paid broadcasts above 30/s) | — | 2026-10-10 |

## Marketing

| Software | Status | Atlas today | The client needs | FusionTech needs | Singapore | Checked |
|---|---|---|---|---|---|---|
| **Facebook & Instagram ads** | ◐ Partly possible | reads daily ad results through Metricool (tested against a stand-in) | connects its ad account in FusionTech's Metricool | Business Verification + App Review for Full access; yearly Data Use Checkup; none found | — | 2026-10-09 |
| **Facebook & Instagram lead forms** | 🔧 Connector, needs setup | new lead arrives as a customer with a follow-up (tested against a stand-in) | a Page admin connects the Page once | leads_retrieval, pages_manage_metadata and ads_management with advanced access (App Review) | — | 2026-10-09 |
| **TikTok ads** | ◐ Partly possible | reads daily ad results through Metricool (tested against a stand-in) | connects its TikTok ad account in FusionTech's Metricool | developer profile + app review (2–3 business days) | — | 2026-10-09 |
| **Google Ads (incl. YouTube ads)** | 🛠️ Connector to build | planned: Marketing plan Phase 4 | — | Google Cloud project; Basic access needs brand verification; Standard needs a manual audit (~10 business days) | — | 2026-10-09 |
| **Metricool** | 🔧 Connector, needs setup | daily ad data per business; daily account check (proven live) | its ad accounts are connected to its brand in FusionTech's Metricool | FusionTech's Advanced plan (already paid) | — | 2026-10-09 |

## Calendar, files & sheets

| Software | Status | Atlas today | The client needs | FusionTech needs | Singapore | Checked |
|---|---|---|---|---|---|---|
| **Google Calendar** | ◐ Partly possible | puts bookings into the staff member's calendar; removes cancelled bookings (tested against a stand-in) | — | Google app verification for sensitive scopes (about 10 business days); until then 100 test users | — | 2026-10-09 |
| **Google Sheets** | 🛠️ Connector to build | planned: column matching + sync (Phase B) | — | Sheets scopes are sensitive: Google app verification (about 10 business days) | — | 2026-10-09 |
| **Google Drive** | 🛠️ Connector to build | planned: files the user picks only (non-sensitive drive.file scope) | — | — | — | 2026-10-09 |
| **Excel spreadsheets** | 📄 Files only | planned: import screen with column matching (Phase B) | — | — | — | 2026-10-09 |
| **Dropbox** | 🛠️ Connector to build | — | — | production approval before 50 linked users (2-week deadline) | — | 2026-10-10 |
| **DocuSign** | 🛠️ Connector to build | — | a paid DocuSign plan (envelope caps apply) | free go-live review (24–48 h) | — | 2026-10-10 |

## E-commerce, marketplaces & POS

| Software | Status | Atlas today | The client needs | FusionTech needs | Singapore | Checked |
|---|---|---|---|---|---|---|
| **Shopify** | 🛠️ Connector to build | planned: Phase D (retail clients) | — | Shopify Partners (free); public-app review + protected customer data approval; US$19 one-off; 0% revenue share up to US$1M | — | 2026-10-09 |
| **WooCommerce** | 🛠️ Connector to build | — | the store owner approves the key once | — | — | 2026-10-09 |
| **Lazada** | 🛠️ Connector to build | — | — | Lazada Open Platform developer (profile review ~3 business days, then app review); royalty-free licence; no API fee found | Singapore, Malaysia and other SEA markets (tokens are per country). Not in Australia. | 2026-10-10 |
| **Shopee** | 🛠️ Connector to build | — | — | Shopee Open Platform ISV partner (registered business; ~10 working days; go-live review ~24 h) | Singapore and Malaysia (one app can serve several markets). Not in Australia. | 2026-10-10 |
| **StoreHub** | ◐ Partly possible | — | StoreHub Enterprise plan ("Dedicated API access") | StoreHub partner programme (apply) | Malaysian POS, also in the Philippines; Singapore availability unconfirmed. | 2026-10-10 |
| **Square** | 🛠️ Connector to build | — | — | — | Square processes payments only in AU, CA, FR, IE, JP, ES, UK and US: usable for Australian clients, not Singapore or Malaysia. | 2026-10-10 |
| **Lightspeed (Retail X-Series, Restaurant K-Series)** | 🛠️ Connector to build | — | — | Lightspeed developer (an unapproved app may connect up to 30 stores); approval for public apps; K-Series partner programme | Australia yes; Singapore / Malaysia unconfirmed. | 2026-10-10 |
| **Zoho Inventory** | 🛠️ Connector to build | — | — | — | No Singapore data centre (US, EU, IN, AU, JP, CA, CN, SA). | 2026-10-10 |

## Payments

| Software | Status | Atlas today | The client needs | FusionTech needs | Singapore | Checked |
|---|---|---|---|---|---|---|
| **Stripe** | 🛠️ Connector to build | — | — | Connect: none if Stripe handles pricing; otherwise US$2 per active account per month + 0.25% + US$0.50 per payout (SG page) | Singapore, Malaysia, Australia. PayNow: Singapore accounts, SGD, 1.3% per transaction. New platforms must not use the legacy Standard/Express/Custom types. | 2026-10-10 |
| **PayPal** | 🛠️ Connector to build | — | — | onboarding other merchants (Partner Referrals) needs PayPal partner approval | Singapore and Malaysia merchant fees: 3.90% + fixed fee domestically. | 2026-10-10 |
| **HitPay** | 🛠️ Connector to build | — | — | no platform licence fee; the platform may take a commission | Singapore, Malaysia, Australia and other APAC markets. PayNow QR codes last 5 minutes. Merchant fees from 0.65% + S$0.30 (PayNow online, ≥S$100; recheck). | 2026-10-10 |
| **PayNow (bank transfers by QR / UEN)** | 🛠️ Connector to build | — | — | — | — | 2026-10-10 |

## Booking (salons, clinics, appointments)

| Software | Status | Atlas today | The client needs | FusionTech needs | Singapore | Checked |
|---|---|---|---|---|---|---|
| **Calendly** | 🛠️ Connector to build | — | a paid Calendly plan for webhooks and the Scheduling API | — | — | 2026-10-10 |
| **Fresha** | 📄 Files only | — | — | — | — | 2026-10-10 |
| **Vagaro** | 🛠️ Connector to build | — | Vagaro card processing (not a free trial) and US$10/month for webhooks (+US$0.002 per call above 5,000) | — | US-focused; Singapore / Australia availability unconfirmed. | 2026-10-10 |
| **Mindbody** | 🛠️ Connector to build | — | — | Mindbody approves the app, then each business activates it; free under 5,000 calls per cycle, then US$0.002 per call (charged to the developer) | — | 2026-10-10 |
| **Zenoti** | 🛠️ Connector to build | — | the client's Zenoti admin creates the backend app and key | — | — | 2026-10-10 |
| **SimplyBook.me** | 🛠️ Connector to build | — | turns on the "API" custom feature (plan slots: Free 1, Basic 3, Standard 8, Premium unlimited) | — | — | 2026-10-10 |
| **Setmore** | 🛠️ Connector to build | — | a Setmore Pro account; API access requested by email (api@setmore.com) | — | — | 2026-10-10 |

## Projects

| Software | Status | Atlas today | The client needs | FusionTech needs | Singapore | Checked |
|---|---|---|---|---|---|---|
| **Asana** | 🛠️ Connector to build | planned: per client as needed (Projects module, Phase E) | — | — | — | 2026-10-09 |
| **Trello** | 🛠️ Connector to build | planned: per client as needed (Projects module, Phase E) | — | — | — | 2026-10-09 |
| **monday.com** | 🛠️ Connector to build | planned: per client as needed (Projects module, Phase E) | — | — | — | 2026-10-09 |
| **ClickUp** | 🛠️ Connector to build | planned: per client as needed (Projects module, Phase E) | — | — | — | 2026-10-09 |
| **Notion** | 🛠️ Connector to build | planned: per client as needed (Projects module, Phase E) | — | — | — | 2026-10-09 |

## Property (Singapore)

| Software | Status | Atlas today | The client needs | FusionTech needs | Singapore | Checked |
|---|---|---|---|---|---|---|
| **Singapore property portals (PropertyGuru, 99.co, SRX)** | ◐ Partly possible | reads the enquirer from forwarded portal emails; unreadable ones go to a person (tested against a stand-in) | forwards portal enquiry emails to its Atlas address | — | — | 2026-10-10 |

## Industry systems

| Software | Status | Atlas today | The client needs | FusionTech needs | Singapore | Checked |
|---|---|---|---|---|---|---|
| **Plato Medical** | ◐ Partly possible | — | — | commercial apps serving more than one clinic must join Plato's Developer Partner Programme | Singapore clinic system. Medical data needs extra care (PDPA). | 2026-10-10 |
| **ClinicAssist** | ⛔ Not possible | — | — | — | Widely used Singapore primary-care clinic system. | 2026-10-10 |

## FusionTech developer accounts (made once, free ones first)

| # | Account | Cost | Approval later | Unlocks |
|---|---|---|---|---|
| 1 | Xero Developer | free (Starter: 5 connections) | certification beyond 50 connections | Xero accounting; InvoiceNow through Xero |
| 2 | Meta for Developers (WhatsApp Tech Provider, Marketing API) | free | Business Verification + App Review + Tech Provider terms | clients' WhatsApp numbers (Embedded Signup v4), lead forms, ad data |
| 3 | Google Cloud (Workspace APIs, Google Ads API) | free | app verification for sensitive scopes; Gmail needs a yearly paid assessment | Calendar, Sheets, Drive; later Gmail and Google Ads |
| 4 | Microsoft Entra app + AI Cloud Partner Program | free | publisher verification (free) | Outlook mail and calendar, OneDrive / Excel online |
| 5 | Shopify Partners | free (US$19 one-off when listing) | public-app review + protected customer data | Shopify stores |
| 6 | Intuit Developer (QuickBooks) | free (Builder) | production assessment; Singapore eligibility to confirm first | QuickBooks Online |
| 7 | Zoho API console | free | none found | Zoho Books, Zoho CRM |
| 8 | HubSpot developer | free (to confirm) | listing review beyond 25 installs | HubSpot CRM |
| 9 | Employment Hero sandbox | free | none found (clients need Platinum) | Employment Hero HR |
| 10 | TikTok API for Business | free (to confirm) | developer profile + app review (2–3 business days) | TikTok ads directly (today through Metricool) |

Sources for every card: `fusion-edg-core/docs/atlas-os/01_PROVIDER_CARDS.md` and the `sources` field of each card.
