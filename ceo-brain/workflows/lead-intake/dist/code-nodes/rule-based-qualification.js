var RB_VERSION = 'rules-v3';
var RB_GREETING = /^\s*(hi|hello|hey|yo|hai|halo|good (morning|afternoon|evening)|hi there|hello there|hey there)[\s!.,?]*(john|there)?[\s!.,?]*$/i;
var RB_ABOUT = /(what (do|does|can) (you|u|fusiontech|fusion tech|your company|your team)( guys)? (do|offer|build|help|make)|what is (fusiontech|fusion tech|this|the ceo brain)|tell me (more )?about (you|yourself|fusiontech|fusion tech|your (company|services))|what can you (do|help|build)|how (can|do) you help|what (kind|type|sort)s? of websites?|what (websites?|services?|products?) (do|can) you|what are your services|what do you (offer|sell|build|specialise in|specialize in)|what.?s your problem|how does (it|this) work|what should i do|help me)/i;
var RB_ABOUT_REPLY = 'FusionTech AI builds an AI workforce around the way your business already works. We connect what you use today (WhatsApp, email, spreadsheets, CRM, accounting, Facebook, Instagram, TikTok, your website and calendar) so every enquiry gets answered and followed up, bookings and quotes happen without chasing, and you can see what is going on. We also build the websites and web apps that sit in front of it: business websites, landing pages, sales funnels, online stores, booking sites, customer portals and web apps, all designed to look premium and cinematic, and you get a first mock-up to react to before anything is decided.';
var RB_GREETING_REPLY = 'I am John from FusionTech AI. We build AI agents and automation around how your business already runs, plus the websites and web apps that go with it. What kind of business do you run, and what would you like to take off your plate?';
var RB_INDUSTRY = [
  [/property|real estate|realtor|agency with .*agents|condo|hdb|landed/i, 'real_estate'],
  [/clinic|dental|aesthetic|medical|doctor|physio|tcm/i, 'healthcare'],
  [/restaurant|cafe|f&b|food|catering|bakery/i, 'food_and_beverage'],
  [/e-?commerce|shopify|online store|lazada|shopee|tiktok shop/i, 'ecommerce'],
  [/law firm|legal|lawyer/i, 'legal'],
  [/accounting|bookkeeping|tax|audit firm/i, 'accounting'],
  [/renovation|contractor|interior|construction/i, 'construction'],
  [/tuition|school|education|academy|training/i, 'education'],
  [/insurance|financial advis|wealth/i, 'financial_services'],
  [/logistics|freight|delivery|warehouse/i, 'logistics'],
  [/salon|spa|beauty|gym|fitness/i, 'wellness_and_beauty'],
  [/saas|software|startup|tech company/i, 'technology']
];
var RB_TOOLS = [
  [/hubspot/i, 'HubSpot'], [/salesforce/i, 'Salesforce'], [/zoho/i, 'Zoho'], [/pipedrive/i, 'Pipedrive'],
  [/respond\.?io/i, 'respond.io'], [/excel|spreadsheet|google sheets?/i, 'Spreadsheets'],
  [/notion/i, 'Notion'], [/airtable/i, 'Airtable'], [/xero/i, 'Xero'], [/quickbooks/i, 'QuickBooks'],
  [/sap\b/i, 'SAP'], [/odoo/i, 'Odoo'], [/shopify/i, 'Shopify'], [/wordpress/i, 'WordPress'],
  [/gmail|outlook/i, 'Email client'], [/calendly/i, 'Calendly'], [/zapier|make\.com/i, 'Zapier/Make']
];
var RB_ERP = [[/xero/i, 'Xero'], [/quickbooks/i, 'QuickBooks'], [/sap\b/i, 'SAP'], [/odoo/i, 'Odoo'], [/netsuite/i, 'NetSuite'], [/myob/i, 'MYOB']];
var RB_SOURCES = [
  [/facebook|fb ads?|meta ads?/i, 'facebook'], [/instagram|ig\b/i, 'instagram'], [/tiktok/i, 'tiktok'],
  [/google ads?|seo|search/i, 'google'], [/website|landing page|web form/i, 'website'],
  [/referral|word of mouth|recommend/i, 'referral'], [/linkedin/i, 'linkedin'], [/propertyguru|99\.co/i, 'property_portal'],
  [/walk[- ]?in/i, 'walk_in'], [/cold call|telemarket/i, 'outbound_calls']
];
var RB_AUTOMATION = [
  [/\b(website|web ?site|landing page|(sales |lead |marketing )?funnels?|sales page|web ?app|online store|e-?commerce (site|store|website)|web portal|customer portal|homepage|web ?page)\b/i, 'website_build'],
  [/whatsapp.*(reply|respond|answer|chat)|(reply|respond|answer).*whatsapp/i, 'whatsapp_auto_reply'],
  [/book(ing)? (an? )?appointment|schedule (a )?(call|meeting|viewing)|appointment/i, 'appointment_booking'],
  [/follow[- ]?up/i, 'lead_follow_up'],
  [/qualif/i, 'lead_qualification'],
  [/quote|quotation|proposal/i, 'quote_generation'],
  [/invoice|billing|payment reminder/i, 'invoicing'],
  [/customer (service|support)|faq|enquir/i, 'customer_support'],
  [/email/i, 'email_automation'],
  [/crm|pipeline/i, 'crm_sync'],
  [/content|social media post/i, 'content_generation'],
  [/report|dashboard/i, 'reporting']
];
var RB_SIZE = /(\d{1,5})\s*(agents?|staff|employees?|people|users?|pax|team members?|salespeople|reps?|advisers?|advisors?|drivers?|technicians?|consultants?)/i;
var RB_BUDGET = /(budget[^.\n]{0,40}?(\$|sgd|usd|rm|k\b)[\s\d,\.k]*|\b(s?\$|sgd|usd)\s?\d[\d,\.]*\s*(k|per month|\/month|monthly)?)/i;
var RB_TIMELINE = /(asap|urgent|immediately|this (week|month|quarter)|next (week|month|quarter)|within \d+ (days?|weeks?|months?)|by (end of )?(q[1-4]|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*|\d+\s*(weeks?|months?) time)/i;
var RB_DECISION = /\b(i run|i own|my (company|business|agency|firm|clinic)|i am the (owner|founder|director|ceo|md)|i'm the (owner|founder|director|ceo|md)|founder|director|owner|ceo\b)/i;
var RB_NOT_DECISION = /\b(my boss|my manager|i need to check with|on behalf of|i work for)/i;
var RB_SPAM = /(seo services|backlinks|guest post|crypto|forex signals|loan approval|casino|lottery|unsubscribe|click here|http[s]?:\/\/[^\s]+\.(xyz|top|club)\b)/i;
var RB_PRICING = /(how much|price|pricing|cost|quote|quotation|rates?)\b/i;
var RB_SUPPORT = /(not working|broken|bug|error|issue with|help me fix|cancel my)/i;
var RB_PARTNER = /(partner(ship)?|reseller|white[- ]label|collaborat)/i;
var RB_INAPPROPRIATE = /\b(sex|sexy|nude|nudes|naked|horny|porn\w*|xxx|boobs?|dick|pussy|send (me )?(a )?(pic|pics|photo) of you|are you single|be my (girlfriend|boyfriend)|wanna date|date me|fuck (you|off)|f\*+k you|you (stupid|idiot|dumb) (bot|ai)|just (for fun|kidding|playing)|for fun only|prank\w*|trolling|lol{2,}|haha{2,}ha)\b/i;
var RB_VENDOR = /(we offer|our services|hire me|freelancer available|job application|resume|cv attached)/i;
var RB_NOT_INTERESTED = /(not interested|stop contacting|remove me|do not contact)/i;
var RB_CALL_LATER = /(call me (back )?(later|tomorrow|next week)|contact me (later|next)|get back to me (in|next))/i;
var RB_RISKY = /\b(refund|chargeback|lawyer|legal action|sue|contract|guarantee|discount|cheapest|deposit|pay(ment)? terms|money back|complain|complaint|angry|scam)\b/i;
function rbMatchAll(text, table) {
  var out = [];
  for (var i = 0; i < table.length; i++) if (table[i][0].test(text) && out.indexOf(table[i][1]) === -1) out.push(table[i][1]);
  return out;
}
function rbFirst(text, table) {
  for (var i = 0; i < table.length; i++) if (table[i][0].test(text)) return table[i][1];
  return null;
}
function rbHumanize(s) { return String(s).replace(/_/g, ' '); }
var RB_QUESTIONS = {
  problem: 'Which part of your day-to-day work is the most repetitive or manual right now?',
  lead_sources: 'Where do most of your enquiries come from today (Facebook, Instagram, website, referrals)?',
  current_follow_up_process: 'How are new enquiries followed up at the moment, and by whom?',
  current_tools: 'Which CRM or software do you use to track customers today?',
  uses_whatsapp: 'Do your customers mostly reach you on WhatsApp, email, or another channel?',
  desired_automation: 'If one task could run itself tomorrow, which one would you pick first?',
  company_size: 'Roughly how many people on your team would use the system?',
  desired_outcome: 'What result would make this a clear win for you in three months?',
  timeline: 'When would you like to have this running?',
  accounting_or_erp: 'Which accounting or back-office systems would this need to connect to?',
  budget: 'Do you have a rough budget range in mind so we can propose the right scope?',
  decision_maker: 'Will you be the one deciding on this, or is anyone else involved?',
  industry: 'What kind of business do you run?',
  company_name: 'What is the name of your company?',
  contact_email: 'What is the best email address to send a summary to?',
  contact_phone: 'What is the best number to reach you on WhatsApp?'
};
var RB_QUESTION_PRIORITY = ['problem', 'lead_sources', 'current_follow_up_process', 'current_tools', 'uses_whatsapp', 'desired_automation', 'company_size', 'desired_outcome', 'timeline', 'accounting_or_erp', 'decision_maker', 'budget'];
var RB_QFORM = /\?|^\s*(can|could|do|does|did|is|are|will|would|how|what|which|who|where|when|why|may|should|any|got|have you|you guys|u guys)\b/i;
var RB_FAQ = [
  { key: 'speak_human', title: 'Wants a person or a call', re: /\b(speak|talk|chat)\s+(to|with)\s+(a |an |the )?(human|person|someone|somebody|real person|ryan|boss|manager|founder|owner|team|salesperson|sales person)\b|\b(can|could) (someone|somebody|you|ryan) call\b|\bcall me\b(?!\s+(back\s+)?(later|tomorrow|next))|\b(zoom|google meet|teams call|meet up|meet in person)\b/i, action: 'book_discovery_call',
    answer: 'Of course. Ryan, our founder, can speak with you directly.', q: 'What is the best number to reach you, and what time suits you?' },
  { key: 'are_you_ai', title: 'Is this a bot / a real person?', re: /\b(are|r) (you|u) (a |an )?(bot|robot|ai|human|real|real person|person)\b|\b(talking|speaking|chatting) (to|with) (a |an )?(bot|robot|ai|human|real person)\b|\bis this (a |an )?(bot|ai|real person|human)\b/i,
    answer: 'I am John, FusionTech\'s AI sales assistant, the same kind of agent we build for our clients. Ryan, our founder, and the team are right behind me and step in whenever something needs a person.' },
  { key: 'pricing', title: 'How much does it cost?', re: /\b(how much|price|prices|pricing|cost|costs|fee|fees|charges?|rates?|quotation|quote|expensive|affordable|afford|package|packages)\b/i,
    answer: 'Every project is priced to the workflow we automate, so we scope it first instead of giving a number that may not fit. Most businesses start with one high-value workflow, such as answering and following up every enquiry, and expand once it proves itself. Software costs from other providers are always shown separately from our fees, and Ryan sends a tailored proposal after a short discovery.', q: 'Which part of your business would you want sorted first?' },
  { key: 'timeline', title: 'How long does it take?', re: /\b(how long|how fast|how quickly|how soon|turnaround|time ?frame|when can (it|you|we|i))\b/i,
    answer: 'We start with one workflow, build and test it, and switch it on before adding the next, so you see results early instead of waiting for one big project. A first website mock-up usually comes back within about an hour. The schedule for your full setup comes with the proposal once we know what is involved.' },
  { key: 'process', title: 'How does it work / how do I start?', re: /\bhow (does|do|would) (it|this|that|you) work\b|\b(what('s| is) the process|next steps?|get(ting)? started|how (do|can) (i|we) (start|begin|proceed|sign up)|how to start)\b/i,
    answer: 'It works in five steps: we understand how your business runs today, design the setup around it, build it, test it with you, then switch it on and keep improving it. You approve each step, and existing tools stay where they work.', q: 'What kind of business do you run, and what would you most like to take off your plate?' },
  { key: 'more_info', title: 'Can I get more info?', re: /\b(more (info|information|details)|tell me more|send (me )?(some |more )?(details|info|information|brochure)|brochure|how can i (get|find out|learn|know) more|know more|find out more|learn more|what else)\b/i,
    answer: 'Happy to. In short, we build an AI workforce around how your business already runs: every enquiry on WhatsApp, email or your website gets answered and followed up, your tools are connected, and you see everything in one place. We also build the website or sales funnel in front of it, and the quickest way to see it is on your own business.', q: 'What does your business do, and what takes up most of your team\'s time?' },
  { key: 'chatbot', title: 'Is this just a chatbot?', re: /\b(chat ?bots?|just a bot|like chatgpt)\b/i, needsQ: true,
    answer: 'It is more than a chatbot. A chatbot only answers messages; we build AI agents that do the work around them: they qualify enquiries, update your CRM, follow up on time, book appointments and report to you, with a person approving anything important.' },
  { key: 'existing_software', title: 'Do we have to change our software?', re: /\b(change|replace|switch|migrate)\b.{0,20}\b(software|system|systems|crm|tools?|apps?)\b|\b(integrat\w*|connect (to|with)|compatible|work with (my|our) (existing|current)|hubspot|salesforce|zoho|pipedrive|gohighlevel|shopify|google sheets|excel|odoo|sap)\b/i, needsQ: true,
    answer: 'You do not have to replace what already works. Wherever it is practical we connect the systems you already use, like your CRM, spreadsheets, accounting software, calendar and WhatsApp, and our systems architect checks each connection properly before anything is built.' },
  { key: 'whatsapp', title: 'Does it work with WhatsApp?', re: /\bwhats ?app\b/i, needsQ: true,
    answer: 'Yes. WhatsApp is usually where it starts: every enquiry gets an instant, helpful reply, follow-ups go out on time, and each conversation is saved to your CRM, using the official WhatsApp Business setup.' },
  { key: 'websites', title: 'Do you build websites, funnels, stores, 3D sites?', re: /\b(funnels?|landing pages?|sales pages?|online stores?|e-?commerce|web ?apps?|portals?|3d|three[- ]d|animat\w*|scroll(ing)? (effect|animation)s?|websites?)\b/i, needsQ: true,
    answer: 'Yes. We build business websites, landing pages and full sales funnels, online stores, booking sites, customer portals and web apps, with premium 3D parallax scroll-film design, all built to convert visitors into enquiries and sales, and they connect to your WhatsApp and CRM so every visitor who enquires gets followed up.' },
  { key: 'examples', title: 'Can I see examples / past work?', re: /\b(examples?|portfolio|case stud\w*|past (work|projects|clients)|samples?|show me|who have you worked|references|previous (work|projects|clients)|your clients)\b/i,
    answer: 'The best example is one made for your own business: we can have a first website mock-up made for you to look at, and you are chatting with one of our AI agents right now. For past projects, Ryan walks you through them personally on a call.' },
  { key: 'location', title: 'Where are you based?', re: /\b(where are (you|u)|based (in|at)|located|your (office|address)|overseas|outside singapore|malaysia|international|other countries)\b/i,
    answer: 'We are based in Singapore and work with businesses in Singapore and beyond. Everything is set up and supported online, so location is not a barrier.' },
  { key: 'industries', title: 'Do you work with my industry?', re: /\b(which|what) industr\w*|\bmy (industry|line of business)\b|\b(do you|can you|does (it|this)|will (it|this)|is (it|this)) (work|help|do|suit\w*|good|suitable)\b.{0,25}\b(clinics?|dental|dentists?|doctors?|property|real estate|agents?|agenc(y|ies)|construction|contractors?|renovation|interior design\w*|retail|shops?|stores?|restaurants?|f&b|cafes?|bakeries|logistics|schools?|tuition|educat\w*|salons?|spas?|beauty|car (dealers?|dealerships?)|dealerships?|workshops?|manufactur\w*|factor(y|ies)|insurance|accounting firms?|law firms?|small business(es)?|smes?|startups?|companies like (mine|ours)|business(es)? like (mine|ours))\b/i,
    answer: 'Yes. It fits any business that handles enquiries, customers and follow-ups, from property agencies and clinics to construction, retail, F&B, logistics and professional services, and we design it around how your business actually runs rather than forcing a template.' },
  { key: 'data_security', title: 'Is my data safe?', re: /\b(data|privacy|pdpa|secure|security|safe|confidential|hack\w*|leak\w*)\b/i, needsQ: true,
    answer: 'Your data stays yours. Each client\'s setup is kept separate from every other client, access is limited to what each part needs, important actions are logged, and anything sensitive needs a person\'s approval. We never ask for your logins in a chat; connections use proper secure sign-ins.' },
  { key: 'results', title: 'Will it work / what results?', re: /\b(results?|roi|return on|will it (really )?work(?!\s+(with|on)\b)|does it (really )?work(?!\s+(with|on)\b)|worth it|increase (my |our )?(sales|revenue|leads)|more (sales|leads|customers))\b/i, needsQ: true,
    answer: 'We do not promise financial outcomes, because they depend on many things outside the system. What we measure from the first 30 days is concrete: how many enquiries were answered and how fast, follow-ups completed, appointments booked and hours saved.' },
  { key: 'staff', title: 'Will it replace my staff?', re: /\b(replace (my|our|the) (staff|team|employees|people|workers)|lay ?offs?|lose (their|my) jobs?|still need (my|our) (staff|team))\b/i,
    answer: 'It is built to support your team, not replace it: the AI takes the repetitive admin, instant replies and follow-ups, so your people spend their time on customers and closing work.' },
  { key: 'support', title: 'What about support after launch?', re: /\b(maintenance|maintain|after (launch|it'?s built|setup|set up)|if something (breaks|goes wrong)|ongoing support|who (fixes|maintains|supports))\b/i,
    answer: 'We stay with you after launch: onboarding for your team, support, and ongoing improvement as your business changes. The support arrangement is part of your proposal.' },
  { key: 'marketing', title: 'Do you do marketing and ads?', re: /\b(marketing|ads|advertis\w*|social media|facebook ads|tiktok ads|instagram ads|content creation|campaigns?)\b/i, needsQ: true,
    answer: 'Yes, as part of the system. Our marketing agent researches your market and competitors, drafts ad ideas, landing pages and social content for your approval, and reports how campaigns perform, while every lead the ads bring in is answered and followed up automatically.' },
  { key: 'customer_service', title: 'Can it handle customer service?', re: /\b(customer service|customer support|faqs?|answer (my )?(customers|questions)|after[- ]?hours|24\/7|24 hours|round the clock|at night)\b/i,
    answer: 'Yes. A customer service agent answers approved FAQs any time of day, looks up customer details where allowed, opens tickets and hands anything sensitive to your team with a summary, so nobody waits for a reply.' },
  { key: 'booking', title: 'Can it book appointments?', re: /\b(appointments?|bookings?|schedul\w*|calendar|reservations?)\b/i, needsQ: true,
    answer: 'Yes. The agent can check availability and book appointments into your calendar where you allow it, send reminders before the visit, and follow up no-shows.' },
  { key: 'finance', title: 'Can it help with invoices and accounting?', re: /\b(accounting|xero|quickbooks|bookkeeping|finance)\b/i, needsQ: true,
    answer: 'Yes. A finance assistant can track what is outstanding, send reminders and give you a clear summary, and it never moves money or changes financial records without a person approving it.' },
  { key: 'tech', title: 'Which AI / technology do you use?', re: /\b(which|what) (ai|technology|tech|tools|platform|platforms|models?|software) (do|does|are) (you|u)\b|\b(chatgpt|claude|openai|n8n|lovable)\b/i,
    answer: 'We build with leading AI models such as Claude and ChatGPT, n8n to connect your systems and run the workflows, and Lovable for websites and apps, choosing what fits your setup rather than locking you into one tool.' },
  { key: 'ceo_brain', title: 'What is the CEO Brain / dashboard?', re: /\b(ceo brain|daily brief|dashboard|see everything|management report\w*)\b/i,
    answer: 'The CEO Brain sits above everything we connect. Each morning it tells you what happened, which leads need attention and what to focus on, and you can simply ask it questions like which leads have not been followed up.' },
  { key: 'different', title: 'Why you / how are you different?', re: /\b(different from|difference|why (should (i|we) )?(choose|pick|go with|use|trust) (you|fusiontech|your (company|team))|why (you|fusiontech)\b|what makes you|compared (to|with)|better than|other agencies|why fusiontech)\b/i,
    answer: 'Most providers sell a single tool; we connect your whole company. We diagnose first, design around your real workflow, build and test it with you, then keep improving it, so you end up with one connected system instead of more disconnected apps.' },
  { key: 'trial', title: 'Free trial / demo?', re: /\b(free trial|trial|demo|try it|test it out|see it (in action|working))\b/i,
    answer: 'You are trying it right now: I am one of the agents we build. For your own business, the quickest look is a first website mock-up, and Ryan can walk you through a live setup of the workflow you care about.' },
  { key: 'ease', title: 'Is it hard to use?', re: /\b(hard to use|difficult|complicated|easy to use|user[- ]friendly|not (very )?(tech|technical)|need training|learn to use)\b/i,
    answer: 'Your team does not need to be technical. We set everything up around the way they already work, train them during onboarding, and most of it runs quietly in the background on WhatsApp, email and the tools they know.' }
];
var RB_HOLDING = [
  [/\b(contract|agreement|terms|lock[- ]?in|sign)\b/i, 'Ryan handles all paperwork and terms personally, so I have passed your question to him and he will reply to you directly.'],
  [/\b(refund|money back|chargeback)\b/i, 'I have passed this straight to Ryan, who handles these matters personally, and he will get back to you directly.'],
  [/\b(discount|cheapest|cheaper|best price|promo)\b/i, 'Ryan prepares every proposal personally, including how it is structured, so I have passed your question to him.'],
  [/\b(deposit|payment terms|pay(ment)?|instal+ments?)\b/i, 'Payment arrangements come with Ryan\'s proposal, so I have passed your question to him and he will reply directly.'],
  [/\b(guarantee\w*)\b/i, 'We do not promise financial outcomes, but Ryan will walk you through exactly what we measure. I have passed your question to him.'],
  [/\b(lawyer|legal|sue|complain\w*|angry|scam)\b/i, 'I am sorry to hear that. I have passed your message straight to Ryan, our founder, and he will personally get back to you.']
];
/** Which FAQ topics does this message ask about? Most specific first; at most two. */
function rbFaqTopics(msg) {
  var m = String(msg || ''); if (!m.trim()) return [];
  var q = RB_QFORM.test(m);
  var out = [];
  for (var i = 0; i < RB_FAQ.length && out.length < 2; i++) { var t = RB_FAQ[i]; if (t.needsQ && !q) continue; if (t.re.test(m)) out.push(t); }
  return out;
}
function rbHoldingReply(msg) { for (var i = 0; i < RB_HOLDING.length; i++) if (RB_HOLDING[i][0].test(String(msg || ''))) return RB_HOLDING[i][1]; return 'I have passed your message to Ryan, our founder, so he can answer it personally.'; }
/**
 * classifyWithRules(lead) -> SalesQualificationResult (schema 1.0)
 * lead: the normalized lead object from normalize.js
 */
function classifyWithRules(lead) {
  lead = lead || {};
  var histText = (lead.conversation_history || []).map(function (m) { return m.content; }).join('\n');
  var text = [lead.message || '', histText, lead.company_name || '', lead.industry || ''].join('\n');
  var msg = lead.message || '';
  var extracted = {
    company_name: lead.company_name || null,
    contact_name: lead.contact_name || null,
    industry: lead.industry || rbFirst(text, RB_INDUSTRY),
    company_size: null,
    problem: null,
    current_tools: rbMatchAll(text, RB_TOOLS),
    lead_sources: rbMatchAll(text, RB_SOURCES),
    current_follow_up_process: null,
    uses_whatsapp: /whatsapp/i.test(text) ? true : null,
    uses_email: /\bemail/i.test(text) ? true : null,
    accounting_or_erp: rbMatchAll(text, RB_ERP),
    desired_automation: rbMatchAll(text, RB_AUTOMATION),
    users_needed: null,
    desired_outcome: null,
    budget: null,
    timeline: null,
    decision_maker: null
  };
  if (lead.lead_source && lead.lead_source !== 'unknown' && lead.lead_source !== 'other' && lead.lead_source !== 'test' && lead.lead_source !== 'manual' && extracted.lead_sources.indexOf(lead.lead_source) === -1) extracted.lead_sources.push(lead.lead_source);
  var sizeM = text.match(RB_SIZE);
  if (sizeM) { extracted.company_size = parseInt(sizeM[1], 10); extracted.users_needed = extracted.company_size; }
  var budM = text.match(RB_BUDGET); if (budM) extracted.budget = budM[0].trim();
  var tlM = text.match(RB_TIMELINE); if (tlM) extracted.timeline = tlM[0].trim();
  if (RB_NOT_DECISION.test(text)) extracted.decision_maker = false; else if (RB_DECISION.test(text)) extracted.decision_maker = true;
  var sentences = msg.split(/(?<=[.!?])\s+/);
  for (var i = 0; i < sentences.length; i++) {
    if (/(don't|do not|doesn't|not|never|slow|miss|lost|manual|forget|too many|overwhelm|no time|late|struggl|waste)/i.test(sentences[i])) { extracted.problem = sentences[i].trim(); break; }
  }
  for (var j = 0; j < sentences.length; j++) {
    if (/(i want|we want|i need|we need|looking for|would like|goal|so that)/i.test(sentences[j])) { extracted.desired_outcome = sentences[j].trim(); break; }
  }
  if (/(follow[- ]?up).*(manual|whatsapp|call|excel|nobody|don't|do not)/i.test(text)) extracted.current_follow_up_process = 'manual (as described by prospect)';
  var isGreeting = RB_GREETING.test(msg);
  var faq = rbFaqTopics(msg);
  var isAbout = RB_ABOUT.test(msg);
  var intent = 'unclear';
  if (RB_INAPPROPRIATE.test(msg)) intent = 'spam';
  else if (RB_SPAM.test(text)) intent = 'spam';
  else if (RB_VENDOR.test(text) && !extracted.desired_automation.length && !/\b(websites?|web ?sites?|mock-?up|landing page|funnel|online store|app|automat\w*|ai|chatbot|bot|crm|whatsapp|system|build|make|design)\b/i.test(text)) intent = 'vendor_or_job_pitch';
  else if (RB_PARTNER.test(text)) intent = 'partnership';
  else if (RB_SUPPORT.test(text)) intent = 'support_request';
  else if (extracted.desired_automation.length || /\b(ai|automat|chatbot|bot)\b/i.test(text)) intent = 'ai_automation_enquiry';
  else if (isAbout) intent = 'ai_automation_enquiry';
  else if (RB_PRICING.test(text)) intent = 'pricing_enquiry';
  if (intent === 'unclear' && RB_PRICING.test(text)) intent = 'pricing_enquiry';
  if (intent === 'unclear' && faq.length) intent = 'ai_automation_enquiry';
  var hasFacts = !!(extracted.industry || extracted.company_size !== null || extracted.current_tools.length || extracted.lead_sources.length || extracted.accounting_or_erp.length || extracted.problem || extracted.desired_outcome || lead.company_name);
  if (intent === 'unclear' && hasFacts) intent = 'ai_automation_enquiry';
  var missing = [];
  var fields = ['company_name', 'contact_name', 'industry', 'company_size', 'problem', 'current_tools', 'lead_sources', 'current_follow_up_process', 'uses_whatsapp', 'uses_email', 'accounting_or_erp', 'desired_automation', 'users_needed', 'desired_outcome', 'budget', 'timeline', 'decision_maker'];
  for (var f = 0; f < fields.length; f++) {
    var v = extracted[fields[f]];
    if (v === null || (Array.isArray(v) && v.length === 0)) missing.push(fields[f]);
  }
  if (!lead.phone) missing.push('contact_phone');
  if (!lead.email) missing.push('contact_email');
  var hasPain = !!extracted.problem;
  var hasWant = extracted.desired_automation.length > 0;
  var hasScale = extracted.company_size !== null || extracted.timeline !== null || extracted.budget !== null;
  var temperature = 'cold';
  if (hasPain && hasWant && hasScale && extracted.decision_maker !== false) temperature = 'hot';
  else if (hasPain || hasWant) temperature = 'warm';
  if (intent === 'spam' || intent === 'vendor_or_job_pitch') temperature = 'cold';
  var escalation = [];
  var riskM = msg.match(RB_RISKY);
  if (riskM) escalation.push('customer_mentions_' + riskM[0].toLowerCase().replace(/\s+/g, '_'));
  if (intent === 'support_request') escalation.push('existing_customer_support_request');
  if (intent === 'partnership') escalation.push('partnership_requires_human');
  var humanReview = escalation.length > 0;
  var status = 'QUALIFYING';
  var nextAction = 'ask_qualifying_questions';
  var keyKnown = hasPain && hasWant && extracted.company_size !== null;
  if (intent === 'spam' || intent === 'vendor_or_job_pitch') { status = 'LOST_CANDIDATE'; }
  if (RB_NOT_INTERESTED.test(text)) { status = 'LOST_CANDIDATE'; }
  if (status === 'LOST_CANDIDATE') { status = 'HUMAN_REVIEW'; nextAction = 'close_lost'; humanReview = true; escalation.push('close_lost_requires_human_confirmation'); }
  else if (humanReview) { status = 'HUMAN_REVIEW'; nextAction = 'human_review'; }
  else if (keyKnown && (RB_PRICING.test(text) || /proposal/i.test(text))) { status = 'PROPOSAL_REQUIRED'; nextAction = 'request_proposal_approval'; humanReview = true; escalation.push('proposal_or_pricing_requires_approval'); }
  else if (temperature === 'hot') { status = 'HOT'; nextAction = 'book_discovery_call'; }
  else if (keyKnown) { status = 'QUALIFIED'; nextAction = 'ask_qualifying_questions'; }
  else if (RB_CALL_LATER.test(text)) { status = 'FOLLOW_UP'; nextAction = 'schedule_follow_up'; }
  if (!humanReview && status !== 'PROPOSAL_REQUIRED' && faq.some(function (t) { return t.action === 'book_discovery_call'; })) nextAction = 'book_discovery_call';
  var questions = [];
  for (var q = 0; q < RB_QUESTION_PRIORITY.length && questions.length < 3; q++) {
    var key = RB_QUESTION_PRIORITY[q];
    if (missing.indexOf(key) !== -1 && RB_QUESTIONS[key]) questions.push(RB_QUESTIONS[key]);
  }
  if (questions.length < 3 && missing.indexOf('contact_phone') !== -1 && missing.indexOf('contact_email') !== -1) questions.push(RB_QUESTIONS.contact_phone);
  if (questions.length < 2 && missing.indexOf('contact_email') !== -1 && questions.indexOf(RB_QUESTIONS.contact_phone) === -1) questions.push(RB_QUESTIONS.contact_email);
  var greet = lead.contact_name ? 'Hi ' + lead.contact_name.split(' ')[0] + ', ' : 'Hi, ';
  var ack = '';
  if (extracted.company_size !== null && extracted.industry) ack = 'thanks for reaching out. A ' + rbHumanize(extracted.industry) + ' business with ' + extracted.company_size + ' people' + (extracted.desired_automation.length ? ' looking at ' + rbHumanize(extracted.desired_automation[0]) : '') + ' is exactly the kind of setup we work on. ';
  else if (extracted.desired_automation.length) ack = 'thanks for reaching out about ' + rbHumanize(extracted.desired_automation[0]) + '. ';
  else ack = 'thanks for getting in touch. ';
  var rbLower = function (a) { return /^(I|I'm|Ryan|FusionTech|WhatsApp|Claude|ChatGPT)\b/.test(a) ? a : a.charAt(0).toLowerCase() + a.slice(1); };
  var reply = '';
  if (intent === 'spam' || intent === 'vendor_or_job_pitch') reply = ''; // not a customer: no reply (Ryan, 2026-09-28)
  else if (nextAction === 'close_lost') reply = '';
  else if (status === 'HUMAN_REVIEW') reply = greet + (riskM ? rbHoldingReply(msg) : ack + 'I have passed your message to Ryan, our founder, so he can answer it personally.');
  else if (status === 'PROPOSAL_REQUIRED') reply = greet + ack + 'We will prepare a tailored proposal and come back to you with the details. ' + (questions.length ? 'To scope it correctly: ' + questions.slice(0, 2).join(' ') : '');
  else if (status === 'HOT') reply = greet + ack + 'The fastest way forward is a short discovery call to map your current process. ' + (questions.length ? 'Before that, two quick questions: ' + questions.slice(0, 2).join(' ') : 'When would suit you this week?');
  else reply = greet + ack + 'To point you in the right direction, a few quick questions: ' + questions.join(' ');
  if (intent !== 'spam' && status !== 'HUMAN_REVIEW' && status !== 'PROPOSAL_REQUIRED') {
    if (faq.length) {
      var ownQ = null; for (var t = 0; t < faq.length; t++) if (faq[t].q) { ownQ = faq[t].q; break; }
      reply = greet + rbLower(faq.map(function (x) { return x.answer; }).join(' ')) + ' ' + (ownQ || (questions.length ? questions[0] : 'What kind of business do you run?'));
    }
    else if (isAbout) reply = greet + RB_ABOUT_REPLY + ' ' + (questions.length ? questions[0] : 'What kind of business do you run?');
    else if (isGreeting) reply = greet.replace(/, $/, '! ').replace(/^Hi, $/, 'Hi! ') + RB_GREETING_REPLY;
    else if (intent === 'unclear' && !RB_NOT_INTERESTED.test(text)) reply = greet + 'happy to help. I am John from FusionTech AI, and we build AI agents and automation around how your business already runs, plus the websites and web apps that go with it. What kind of business do you run, and what would you like to take off your plate?';
  }
  reply = reply.replace(/\s+/g, ' ').trim();
  var summary = (extracted.contact_name || 'Prospect') + (extracted.company_name ? ' from ' + extracted.company_name : '') + (extracted.industry ? ' (' + rbHumanize(extracted.industry) + ')' : '') + (extracted.company_size !== null ? ', ' + extracted.company_size + ' people' : '') + '. ' + (extracted.problem ? 'Pain: ' + extracted.problem + ' ' : '') + (extracted.desired_automation.length ? 'Wants: ' + extracted.desired_automation.map(rbHumanize).join(', ') + '.' : 'Desired automation not stated.');
  var confidence = 0.35;
  if (intent !== 'unclear') confidence += 0.2;
  if (hasPain) confidence += 0.1;
  if (hasWant) confidence += 0.1;
  if (extracted.company_size !== null) confidence += 0.05;
  if (intent === 'spam') confidence = 0.6;
  if (isGreeting || isAbout || faq.length || (intent === 'unclear' && !humanReview)) confidence = Math.max(confidence, 0.6); // handled openers, never 'low confidence'
  confidence = Math.min(0.9, Math.round(confidence * 100) / 100);
  return {
    schema_version: '1.0',
    lead_status: status,
    intent: intent,
    lead_temperature: temperature,
    summary: summary.trim().slice(0, 600),
    extracted: extracted,
    missing_information: missing,
    recommended_reply: reply.slice(0, 1500),
    questions_to_ask: questions,
    next_action: nextAction,
    follow_up_at: null,
    human_review_required: humanReview,
    escalation_reasons: escalation,
    confidence: confidence,
    reasoning: 'Deterministic rule engine (' + RB_VERSION + '): intent from keyword patterns, temperature from pain+want+scale, status from qualification completeness. Not an LLM judgement.'
  };
}
// ---- n8n glue ----
const ctx = $('Resolve Lead Identity').first().json;
return [{ json: { source: 'rules', provider: 'rules', model: RB_VERSION, reason: ctx.lead.ai_mode === 'mock' ? 'mock_mode' : 'baseline', result: classifyWithRules(ctx.lead) } }];
