---
tags: [zaphiel, skill-pack, titan, rules, singapore, research]
date: 2026-10-12
source: research agent, search-engine extracts of official pages (full pages could not be opened from this workspace)
---
> **Working checklist, not legal advice.** Check the current law text with the client before going live.
> Used by [[03_Medical_Supplement_Rules]], [[07_Finance_Crypto_Rules]], [[08_Property_Portal]],
> [[09_Security_Compliance_Checklists]] and [[60_Skill_Packs/Cinematic_Director/04_Medical_Rules_SG]].

# Singapore rules for agency-built websites and web ads (FusionTech AI)

Research date: 2026-10-12. Public pages only. Nothing signed up for, nothing paid.

**How this was checked.** WebFetch and curl could not reach any official domain from this
environment (DNS failure / proxy 403 for moh.gov.sg, sso.agc.gov.sg, ask.gov.sg). So every rule
below comes from **search-engine excerpts of the official page at the URL given**, not from
reading the full page. Short quotes in "double quotes" are as they appeared in those excerpts.
**UNVERIFIED** = not confirmed on an official page (secondary source only, or not found at all).
This is a working checklist, not legal advice. Before a regulated client (clinic, supplement,
finance, property) goes live, Ryan or the client should check the current law text.

---

## A. Doctors, clinics and healthcare services

### A1. Healthcare Services Act 2020 (HCSA) + Healthcare Services (Advertisement) Regulations 2021

- Regulations text (S 1033/2021, in force 3 Jan 2022): https://sso.agc.gov.sg/SL/HSA2020-S1033-2021?DocDate=20211230
- MOH FAQ on the Advertisement Regulations (12 Oct 2023): https://isomer-user-content.by.gov.sg/7/a2d9019f-7617-40f1-8788-7e105b0a77e9/12-10-2023-advert-regs-faqs-(1).pdf (also listed at https://www.moh.gov.sg/docs/librariesprovider8/resources/12-10-2023-advert-regs-faqs-(1).pdf)
- MOH ask.gov.sg answers: https://ask.gov.sg/moh/questions/clu6lx3rk009s314r7l7gab79 (reviews/testimonials), https://ask.gov.sg/moh/questions/clu6lx3rk009w314r0uwga9sl , https://ask.gov.sg/moh/questions/clu6lx3qv003c314rlo3884xq

What the official sources say:

- **Who may advertise.** HCSA s31(1): a person "must not advertise, or cause to be advertised, a licensable healthcare service unless the person is a licensee authorised to provide that licensable healthcare service; or is acting on the authority of the licensee." Non-licensees may say they collaborate with a licensee, but to advertise the licensee's service "they must obtain prior approval from the licensee." (ask.gov.sg/moh, clu6lx3qv003c314rlo3884xq). **For FusionTech this means the clinic must authorise the work. The agency is "acting on the authority of the licensee", and the licensee is responsible.**
- **Who is responsible.** Where an ad mixes a licensable service with a co-located non-licensable one, "the HCSA licensee is responsible for ensuring compliance ... for the entire advertisement" (MOH closing speech, HCS (Amendment) Bill, 6 Mar 2023: https://www.moh.gov.sg/newsroom/closing-speech-for-second-reading-of-healthcare-services-(amendment)-bill-by-dr-janil-puthucheary-senior-minister-of-state-ministry-of-health-6-march-2023/).
- **Accuracy (reg 5).** The content must be factually accurate and able to be substantiated, and must not be exaggerated, false, misleading or deceptive. MOH FAQ: "Advertisements must be factually accurate and must not contain laudatory statements such as subjective praises, commendations, and compliments." (Sources: regulations link above; FAQ PDF.) The exact phrase "factual, accurate, verifiable" is SMC wording (see A2). The phrase is **not confirmed** in the HCSA regulations.
- **Superlatives / laudatory claims.** These are banned even when true. MOH: "laudatory statements are strictly prohibited, regardless of whether they are factually accurate or not." (MOH FAQ / ask.gov.sg.)
- **Comparisons and promised results (reg 5(1)(c)).** An ad must not imply the licensee "can obtain results ... that are not achievable by other licensees". It must not create unjustified expectations, and must not compare its quality with another licensee's or disparage another licensee. (Regulations, reg 5 view: https://sso.agc.gov.sg/SL/HSA2020-S1033-2021?DocDate=20211230&ProvIds=pr5-)
- **Tone (reg 5(1)(b)).** Ads must not be offensive, ostentatious or in bad taste, or undermine the dignity of a healthcare profession. The word "emotive" does **not** appear in the regulations, as far as the excerpts show. "Sensational" and emotional pressure come from the SMC rules (A2).
- **Before/after photos.** The regulations bar showing a person's appearance before and after, or only after, a treatment. A licensee may still show such images to a patient in a consultation. MOH's FAQ gives "'Before-and-after' treatment photos" as an example of content that solicits or encourages use of a service. (Regulations; FAQ PDF.)
- **Reviews and testimonials (reg 14 + MOH FAQ).** The general rule is that they are prohibited. The exception: a licensee may display a review "on the licensee's website or account on any social media or social network service, and only if the ... review or testimonial or endorsement ... was given by P". The reviewer is the patient, next of kin or carer. MOH adds that reviews must be "Organically provided by patients", "Unpaid, unsolicited, and not modified", and "Not reproduced by the licensee". Licensees "must not coerce or offer valuable consideration of any kind to induce" testimonials. (https://ask.gov.sg/moh/questions/clu6lx3rk009s314r7l7gab79)
  **Conflict:** the SMC rules for doctors are stricter (A2: no testimonials on any media the doctor controls). **Practical default: no testimonials on a clinic site.**
- **Awards and honours (reg 13).** These may be shown on the licensee's own website or social media, subject to conditions in reg 13(3)–(4). MOH has investigated displays of accreditation or awards unrelated to technical standards (https://www.moh.gov.sg/newsroom/alleged-breaches-of-advertising-controls-in-healthcare-services-act/). The exact conditions are not read in full: **UNVERIFIED detail.**
- **Permitted media.** Outside the premises, ads may appear in newspapers, directories, medical journals, magazines, brochures, leaflets, pamphlets and "the Internet (including mobile application software, social media platforms and websites)". So websites and social media are allowed channels. (ask.gov.sg/moh result + regulations.)
- **Influencers and non-licensees.** "non-medical professionals including social media influencers are not allowed to advertise any licensable healthcare services, unless they possess an HCSA licensee." Anyone advertising healthcare services without a licence faces a maximum "fine of $20,000 and/or jail term of 12 months". (https://www.moh.gov.sg/newsroom/regulation-of-advertisements-for-aesthetic-treatments/)
- **Non-licensed businesses (salons, chiropractic, gyms, massage).** They may not claim to treat or cure. "only entities that are licensed as healthcare service providers can purport to treat or cure diseases or medical conditions in their advertisements". Examples of banned lines: "We treat chronic diseases such as hypertension, diabetes and all cardiac conditions" and "We are experienced in treating scoliosis". Non-registered people using "Dr" "must make clear to the public what their qualifications and credentials are". (https://www.moh.gov.sg/newsroom/non-licensed-healthcare-entities-not-permitted-to-make-advertising-claims/)
- **Prior approval.** No source found says MOH pre-vets clinic ads. The licensee carries the responsibility. **UNVERIFIED that there is no pre-approval for any category.** The only "prior approval" found is the licensee approving a non-licensee's advertising.
- **Pending change.** In March 2025 MOH said it would review the advertising ban so that allied health professionals and TCM practitioners can advertise non-licensable services, with "further details" to follow. No final rule was found as of 2026-10-12. (MOH: https://www.moh.gov.sg/newsroom/moh-engaging-psychologists-to-address-concerns-on-advertising-controls/; the summary is from Baker McKenzie: **secondary**.)

### A2. SMC Ethical Code and Ethical Guidelines (ECEG, 2016 edition) + Handbook on Medical Ethics (2016)

- ECEG 2016 PDF: https://isomer-user-content.by.gov.sg/77/dc3e060b-e2c5-427a-9fe4-00bd3f9e58b2/2016-smc-ethical-code-and-ethical-guidelines---(13sep16).pdf
- Handbook 2016 PDF: https://isomer-user-content.by.gov.sg/77/a5cf7c9f-6554-464e-8f41-01d4cbe87b13/2016-smc-handbook-on-medical-ethics---(13sep16).pdf
- SMC page: https://www.smc.gov.sg/for-professionals/regulations-guidelines-circulars/ethical-code-and-ethical-guidelines-and-handbook-on-medical-ethics/
- SMC advisory on SEO / rating platforms (Nov 2020): https://www.smc.gov.sg/publications-and-newsroom/announcements/advisory--medical-practitioners--participation-in-online-search-engine-optimisation-platforms/

What the official sources say:

- **Edition.** The 2016 edition is in force from 1 Jan 2017, with H3(7) from 1 Jul 2017. **No newer medical edition was found.** SMC invited feedback on a review (deadline 12 Jan 2021: https://www.smc.gov.sg/publications-and-newsroom/announcements/feedback-on-ethical-code-and-ethical-guidelines-and-handbook-on-medical-ethics/), but no revised Code was found.
- **Code principle.** "Maintain professionalism in informing the public about services, ensuring that information projected is devoid of any exaggerated or deceptive content." (ECEG.)
- **Standards (Handbook).** Information should be "factual, accurate, verifiable and not misleading" (G2.1). It must avoid being unduly persuasive or making extravagant claims (G2.2). (Handbook excerpt.)
- **Testimonials.** "Testimonials are subjective and are not allowed to be used in advertising on any media where you have any control over the content about yourself." "you are not to ask or induce your patients or anyone to write positive testimonials about you in any media." "Patient testimonials, even if genuine, are disallowed". Celebrity testimonials "would in addition be deemed sensational". (SMC SEO advisory.)
- **Permitted content.** Doctors may give "neutrally toned and objective information" about SMC-registered qualifications, experience, areas of practice and procedures. Ads must not be laudatory, sensational, enticing or unduly persuasive, and must not stir "strong emotional reactions". **UNVERIFIED on the official text.** This wording comes from the SMA's reproduction (https://sma.org.sg/positionstatement/sma-advisories-issued-1/33), not the SMC PDF itself.
- **Before/after in doctors' ads.** "You must not use 'before' and 'after', or even only 'after' images or information for medical advertising in the public domain". **UNVERIFIED on the SMC text.** It is quoted via the SMA advisory. The HCSA regulations ban this anyway (A1).
- **Disparagement.** Doctors must not disparage colleagues or imply superiority. This also came via SMA (**UNVERIFIED on SMC text**). It matches HCSA reg 5(1)(c).

### A3. AI-generated medical illustrations, AI presenters, AI doctors

- **Nothing found.** No MOH, SMC or HCSA page found addresses AI-generated images, AI avatars or AI presenters in healthcare ads. The general rules still apply: factual accuracy, no unjustified expectations, no before/after, and nothing that misleads about who the doctor is or what results are possible.
- **Related official signals:**
  - CCS acted against 45 businesses that bought fake reviews written with generative AI (https://www.ccs.gov.sg/media-and-events/newsroom/announcements-and-media-releases/ccs-takes-action-against-45-businesses-and-a-fake-review-provider-for-fabricating-online-reviews/).
  - CCS also acted on AI-generated fake reviews by Lambency Detailing (https://www.ccs.gov.sg/media-and-events/newsroom/announcements-and-media-releases/action-taken-against-lambency-detailing-for-ai-generated-fake-reviews-on-sgcarmart-com/).
- **UNVERIFIED:** A Sept 2026 parliamentary reply reportedly said ASAS applies the same standards "regardless of whether AI tools" are used, and that advertisers should disclose AI "where necessary to prevent consumers from being deceived". Found only on opengovasia.com, not on an official page.

### A — DO / DON'T for a clinic website or ad

DO
- Get the licensee's written authorisation before building or running any ad (HCSA s31).
- Keep copy factual and checkable: services offered, doctor names, SMC-registered qualifications, opening hours, address, contact details, fees if the clinic chooses to show them.
- Keep a file of evidence for every factual claim (reg 5).
- Use a neutral, plain tone, and make "Dr" credentials clear.
- Use real clinic photos of the premises and team, with each person's consent.

DON'T
- No superlatives or praise: "best", "leading", "No. 1", "trusted by thousands", "unique", "painless guaranteed".
- No comparisons with other clinics, and no "results others can't achieve".
- No before/after or "after only" images, including AI-generated ones.
- No patient testimonials, star-rating widgets, Google-review embeds or influencer content on the clinic's site or ads. HCSA allows a narrow exception for organic, unedited reviews, but SMC bars doctors from testimonials on media they control. Treat this as a hard DON'T unless the client's doctor takes responsibility in writing.
- No paid or incentivised reviews.
- No emotional pressure, fear tactics, countdown offers or "limited slots" urgency.
- No AI-generated "doctor" presenters, or AI images that could pass as real patients or real results. There is no rule specifically on AI, but the content could mislead.
- For non-licensed clients (salons, wellness, gyms): no "treat", "cure" or "heal" claims about diseases or conditions.

---

## B. Health supplements and health products (HSA)

Sources:
- Health supplement claims: https://www.hsa.gov.sg/health-supplements/claims/
- Overview: https://www.hsa.gov.sg/health-supplements/overview/
- Consumer guide: https://www.hsa.gov.sg/announcements/health-supplement-regulations/
- Medicinal products ads: https://www.hsa.gov.sg/advertisements-and-promotions-of-medicinal-products
- List of Health Claims (May 2024): https://www.hsa.gov.sg/docs/default-source/hprg-tmhs/chpb-tmhs/tmhs_claims_list.pdf
- Medicines (Advertisement and Sale) Act 1955: https://sso.agc.gov.sg/Act/MASA1955
- Medicines Act 1975: https://sso.agc.gov.sg/Act/MA1975
- Health Products (Advertisement of Specified Health Products) Regulations 2016: https://sso.agc.gov.sg/SL/HPA2007-S333-2016?DocDate=20210217
- Enforcement example (Riway/Purtier): https://www.hsa.gov.sg/announcements/riway-falseclaims/

What the official sources say:

- **No medicinal claims.** "Health supplements must not be labelled, advertised or promoted for any medicinal purpose. This includes implied claims for the treatment or prevention of any disease and disorders." (HSA claims page.)
- **Banned disease references.** HSA's claims page gives a body-system table of conditions that claims may not reference (e.g. diabetes, cancers, cholesterol disorders).
  - The Medicines (Advertisement and Sale) Act 1955, s3, bars ads promoting an article as a treatment for the diseases in its Schedule (19 items, incl. blindness, cancer, diabetes, hypertension, tuberculosis, infertility).
  - The Medicines Act 1975 First Schedule says a person must not publish an ad claiming a product "will prevent, alleviate or cure any disease or condition specified in the First Schedule".
- **Substantiation.** "All claims should be substantiated by good quality evidence that is relevant to the claims". The dealer must hold that evidence and produce it on request. Whether a claim is acceptable depends on "the label and advertisement in its entirety". (HSA claims page; Claims List.)
- **"Clinically proven".** HSA tells supplement sellers to avoid it. HSA does not evaluate supplements: "health supplements, including their clinical trials, are not evaluated by HSA". (HSA claims page; consumer guide.)
- **No pre-approval for supplements.** "the responsibility for ensuring that the information provided for advertisements and promotional materials is clear, accurate and truthful lies with the dealers and advertisers." (HSA consumer guide.)
- **Medicinal products are different.** A permit is needed before publishing consumer-facing medical ads, and the permit number must appear on the material. "Advertisements with no medicinal claims do not need prior permit approval." Processing takes about 14 working days via PRISM. Medicinal product ads must also avoid:
  - comparative claims and exaggerated terms;
  - implying guaranteed results or no side effects;
  - using HSA's name or logo;
  - implying endorsement by healthcare professionals or authorities.
  (HSA medicinal products page.) Quasi-medicinal products need an advertising permit, per the HSA overview excerpt. The exact product scope is **UNVERIFIED in detail**.
- **Penalties.** Prohibited disease claims for supplements can mean a fine of up to $5,000 and/or up to two years' jail under the Medicines Act (MOH: https://www.moh.gov.sg/newsroom/non-licensed-healthcare-entities-not-permitted-to-make-advertising-claims/ ; HSA Riway case).
- **Prescription-only medicines.** HSA's consultation conclusion says "the prohibition of direct-to-consumer advertisements of POM will be an additional safeguard" (https://www.hsa.gov.sg/announcements/conclusion-to-the-public-consultation-on-the-proposed-subsidiary-legislation-for-the-transfer-of-controls-of-pharmaceutical-products-to-the-health-products-act/). Effective status is **UNVERIFIED**.

ASAS code (health and beauty):
- **Hair loss (SCAP Appendix I).** Ads must carry a disclaimer that there is no scientific proof a product or service can stop hair loss or promote growth (registered medicinal products excepted). ASAS followed up with advertisers who left it out. (ASAS 2018 media release: https://asas.org.sg/Portals/0/News/Media%20release%20-%20Misleading%20advertisements%20for%20beauty,%20restaurants%20most%20complained%20about%20in%202018.pdf.) The current Appendix text was not read: **exact wording UNVERIFIED.**
- **Slimming.** Ads must be "prepared in a responsible manner that does not undermine the importance of maintaining a balanced calorie-controlled diet. Claims that weight loss can be achieved wholly by other means are not acceptable." This is quoted in a CASE forum letter (Jan 2026: https://www.case.org.sg/wp-content/uploads/2026/01/Forum_Ads-with-misleading-claims-about-weight-loss-not-acceptable.pdf), not on asas.org.sg: **UNVERIFIED on ASAS page.**
- **Testimonials as evidence.** The claim that testimonials don't count as proof of physiological effects is from an AWARE letter: **UNVERIFIED.**
- **Health claims for gadgets.** ASAS has warned about health/medical claims for air ionisers and alkaline water devices (https://asas.org.sg/News/Post/396/Notification-on-Advertisements-Relating-to-Air-Ionisers-and-Alkaline-Water-Generating-Devices).

### B — DO / DON'T

DO
- Use general wellbeing wording supported by evidence the client holds, e.g. "supports general wellbeing". Check it against HSA's List of Health Claims.
- Ask the client for its evidence file before writing any claim.
- If it's a medicinal product (not a supplement), confirm whether an HSA permit is needed. If one is, show the permit number.
- Put the hair-loss disclaimer on any hair-loss ad.

DON'T
- No "treats", "cures", "prevents", "heals" or "reverses", and no disease names (diabetes, cancer, hypertension, cholesterol, infertility, etc.), including implied ones ("blood-sugar warrior").
- No "clinically proven", "doctor recommended", "HSA approved" or HSA logo.
- No "guaranteed results", "no side effects" or "100% safe".
- No comparisons with medicines or competitor products.
- No slimming claims that skip diet ("lose 5kg without dieting").
- No before/after body shots unless the client holds evidence they are genuine and typical. ASAS/CPFTA risk.

---

## C. Crypto (digital payment tokens) and financial promotions (MAS)

Sources:
- PS-G02 Guidelines on Provision of DPT Services to the Public (17 Jan 2022): https://www.mas.gov.sg/regulation/guidelines/ps-g02-guidelines-on-provision-of-digital-payment-token-services-to-the-public
- MAS media release: https://www.mas.gov.sg/news/media-releases/2022/mas-issues-guidelines-to-discourage-cryptocurrency-trading-by-general-public
- PS-G03 Consumer Protection Safeguards (19 Sep 2024): https://www.mas.gov.sg/-/media/mas-media-library/regulation/guidelines/pso/ps-g03-guidelines-on-consumer-protection-measures-by-digital-payment-token-service-providers/guidelines-on-provision-of-consumer-protection-safeguards-by-digital-payment-token-service-providers.pdf
- DTSP regime: https://www.mas.gov.sg/news/media-releases/2025/mas-clarifies-regulatory-regime-for-digital-token-service-providers
- Guidelines on Standards of Conduct for Digital Advertising Activities (25 Sep 2025): https://www.mas.gov.sg/-/media/mas/regulations-and-financial-stability/regulations-guidance-and-licensing/financial-advisers/guidelines/guidelines-on-standards-of-conduct-for-digital-advertising-activities.pdf

What the official sources say:

- **No marketing to the Singapore public.** DPT service providers "should not promote (i.e. market or advertise) their DPT services in public areas in Singapore, or through any other media directed at the general public in Singapore". Channels named:
  - public transport and its venues;
  - broadcast media and periodicals;
  - third-party websites;
  - social media platforms;
  - public events and roadshows.
  Footnote: no "promotional banners or pop-up advertisements on social media platforms". (PS-G02.)
- **No influencers.** Providers should not engage "social media influencers or third-party websites" to promote DPT services to the general public. (PS-G02.)
- **Own channels allowed.** Providers may promote on their own corporate website, mobile apps or official social media accounts, provided they do not trivialise the risks. They should not portray DPT trading "in a manner that trivializes the high risks". (PS-G02.)
- **Crypto ATMs.** Public crypto ATMs count as promotion and should not be placed in public areas. (PS-G02.)
- **Incentives.** PS-G03 restricts "sign-up incentives, referral incentives and trading incentives" and "learn and earn" programmes. It requires a risk awareness assessment before serving retail customers. Some chapters take effect from 19 Jun 2025. (PS-G03; MAS 2023 media release: https://www.mas.gov.sg/news/media-releases/2023/mas-strengthens-regulatory-measures-for-digital-payment-token-services)
- **Overseas-only token firms.** From 30 Jun 2025, Singapore-based DTSPs serving only overseas customers must be licensed. MAS will generally not issue a licence, and there was no transitional period. (MAS 2025 release.)
- **Updates.** No amendment to PS-G02's promotion limits was found up to 2026-10-12.
- **General financial ads.** Ads must not be "false and misleading" and must give "a fair and balanced view of the product" (FAR regs 22–22D; SF(LCB)R reg 46 etc.). Under the Sept 2025 digital advertising guidelines:
  - Each digital post must be "not misleading when viewed on its own".
  - Influencer/affiliate posts need "clear and conspicuous disclosures of sponsorship, remuneration or commercial arrangements".
  - Sponsored content by influencers counts as the financial institution's own advertisement, and FIs "will be held accountable".
  - Paid recommendations on investment products can count as financial advice (licensing issue).
  A 2025 MAS consultation proposes widening fair-dealing rules to all solicitation. Its final status is **UNVERIFIED.**

### C — DO / DON'T

DO
- Before taking a crypto/DPT client, ask whether it is MAS-licensed. Limit work to its own website, app and official social accounts.
- Show risk warnings prominently. Each page or post must be balanced on its own.
- For licensed FIs: label every sponsored or affiliate post clearly, and keep the FI's approval of the final copy.

DON'T
- No crypto/DPT ads aimed at the Singapore public: no Google/Meta/TikTok paid ads, banners, pop-ups, influencer posts, affiliate sites or roadshow material.
- No "easy money", "guaranteed returns", "to the moon", or gamified or trivialising crypto copy.
- No sign-up/referral bonuses or "learn and earn" for DPT clients.
- No investment "tips" in paid content (financial advice risk).
- Don't build sites for unlicensed overseas-facing token firms based in Singapore.

---

## D. Property (CEA)

Sources:
- Practice guidelines list, incl. PG 02-11 Practice Guidelines on Ethical Advertising (29 Jun 2011): https://www.cea.gov.sg/regulatory-matters/practice-guidelines-and-circulars/
- Codes of conduct (CEPCC, incl. duties re advertisements): https://www.cea.gov.sg/regulatory-matters/codes-of-conduct/
- Scam/ad checks: https://www.cea.gov.sg/about-cea/newsroom-publications/ceanergy-blog/four-things-to-note-when-engaging-property-agents-and-tips-to-protect-yourself-against-scams-by-fake-agents/
- Consumer guide: https://www.cea.gov.sg/consumers/engaging-a-property-agent/what-to-take-note-of-when-engaging-a-property-agent/
- Disciplinary case (Oct 2025): https://www.cea.gov.sg/about-cea/newsroom-publications/ceanergy-blog/res-given-financial-penalty-of-28000-and-suspended-6-months-for-advertisement-related-infringements-of-cepcc/
- DNC reminder: https://www.cea.gov.sg/about-cea/newsroom-publications/ceanergy-blog/check-do-not-call-registry-before-sending-marketing-messages/

What the official sources say:

- **Required details in ads.**
  - The agent's name, CEA registration number and phone number.
  - The agency's name and CEA licence number.
  - Exception: "For newspaper classified advertisements and phone text advertising, only the property agent's name (in full or abbreviated) and phone number are required". (CEA scam-tips page.)
- **Owner consent.** "He/ she should seek your prior consent before advertising your property". Agents' duties include "Seek your client's prior consent before advertising their property". (CEA consumer guide / CEA pages.)
- **Accuracy.** Material details such as lease term and floor area must be accurate and verified, and ads must not contain false, misleading or discriminatory material. (CEA consumer guide.)
  - Breach example: ads with prices below the developer's, unsubstantiated "VVIP Ownership", and "Ready to Move" for an uncompleted unit were found "inaccurate or misleading" under CEPCC para 12(4)(a). Penalty: $28,000 and 6-month suspension. (CEA case page.)
- **Owner-salespersons** must clearly declare ownership. Showing photos of themselves in the property is not a declaration. (CEA page on salespersons transacting their own property.)
- **Virtual staging / artist's impressions.** **Nothing found** on any CEA page. The PG 02-11 PDF was not read. Developer ads and "artist's impression" labels fall under URA's housing developer rules, which were **not found: UNVERIFIED.**

### D — DO / DON'T

DO
- Put the agent's name, CEA registration no. and phone, plus the agency's name and licence no., on every listing page, ad and landing page.
- Keep written proof of the owner's consent before a listing goes live.
- Check lease, tenure, floor area, completion status and price against documents.
- Label any virtually staged image or artist's impression clearly ("virtually staged", "artist's impression"), and keep an unaltered photo available. This is good practice; no CEA rule was found.

DON'T
- No unverifiable claims ("VVIP", "lowest price guaranteed", "best deal in town"), and no "Ready to Move" for uncompleted units.
- No prices below the developer's actual price list.
- Don't remove permanent defects (power lines, walls, views) in edited photos. Misleading under CEPCC/CPFTA.
- No discriminatory wording, e.g. on race or nationality preference.
- Don't WhatsApp/SMS marketing to numbers without a DNC check (see E).

---

## E. PDPA for website forms and marketing messages

Sources:
- Data protection obligations: https://www.pdpc.gov.sg/overview-of-pdpa/the-legislation/personal-data-protection-act/data-protection-obligations
- Advisory Guidelines on Key Concepts: https://www.pdpc.gov.sg/-/media/files/pdpc/pdf-files/advisory-guidelines/ag-on-key-concepts/advisory-guidelines-on-key-concepts-in-the-pdpa-17-may-2022.pdf
- Advisory Guidelines on DNC Provisions (rev. 1 Feb 2021): https://www.pdpc.gov.sg/-/media/files/pdpc/pdf-files/advisory-guidelines/advisory-guidelines-on-the-dnc-provisions-1-feb-2021.pdf
- DNC and you (WhatsApp): https://www.pdpc.gov.sg/overview-of-pdpa/do-not-call-registry/individual/do-not-call-registry-and-you
- Selected Topics (May 2024; online activities/cookies chapter): https://www.pdpc.gov.sg/-/media/files/pdpc/pdf-files/advisory-guidelines/ag-on-selected-topics/advisory-guidelines-on-the-pdpa-for-selected-topics-(revised-may-2024).pdf
- Guide on Managing and Notifying Data Breaches: https://www.pdpc.gov.sg/-/media/files/pdpc/pdf-files/other-guides/guide-on-managing-and-notifying-data-breaches-under-the-pdpa-15-mar-2021.pdf
- Healthcare sector guidelines: https://www.pdpc.gov.sg/-/media/Files/PDPC/PDF-Files/Advisory-Guidelines/Advisory-Guidelines-for-the-Healthcare-Sector-Sep-2023.pdf
- Spam Control Act 2007: https://sso.agc.gov.sg/Act/SCA2007

What the official sources say:

- **Tell people the purpose first (s20).** Organisations must "inform the individual of the purposes for the collection, use and disclosure of his personal data, on or before collecting the personal data". Without that notice, consent "would be invalid". "valid business purposes" is "not considered a sufficiently specific purpose". A website policy works if the person can view it before giving data. (Key Concepts.)
- **Marketing consent must be specific.** A generic consent clause for "marketing purposes" is "not sufficiently specific". Silence is not consent: the Commission "will generally not view the mere failure to opt out as clear and unambiguous consent". (DNC Guidelines.)
- **WhatsApp is covered by DNC.** The DNC rules apply to marketing ("specified") messages "sent to your Singapore telephone number, even on WhatsApp and Telegram". (DNC and you.)
- **DNC check.** Before sending a specified message, the sender must check the DNC Registry, unless it holds "clear and unambiguous consent ... evidenced in written or other accessible form". Results are valid for 21 days from receipt (from 1 Feb 2021; previously 30). (DNC Guidelines.)
- **Sender ID (s44).** Each specified message must identify the sender, give contact details that are "reasonably likely" to stay valid for at least 30 days, and not use fictitious names or "me/us". (DNC Guidelines; PDPA https://sso.agc.gov.sg/Act/PDPA2012.)
- **Bulk email/SMS (Spam Control Act).** For unsolicited commercial messages sent in bulk:
  - "<ADV>" label before the subject (or at the start of an SMS);
  - a non-misleading subject line;
  - a working unsubscribe facility, kept active for at least 30 days;
  - unsubscribes honoured within 10 business days.
  (Spam Control Act Second Schedule.)
- **Cookies and analytics.** The Selected Topics guidelines have an "Online Activities" chapter that addresses cookies and ad targeting, but the excerpts cut off before the answers: **cookie rule UNVERIFIED.** The PDPA allows use of personal data without consent for business improvement/analytics and research, subject to conditions. PDPC encourages anonymised data. (Selected Topics.)
- **Data breach.** A breach is notifiable if it is likely to cause significant harm, or affects 500 or more individuals.
  - Assess whether it is notifiable "within 30 calendar days" of credible grounds.
  - Notify PDPC "no later than three calendar days" after deciding it is notifiable.
  - Notify affected individuals where significant harm is likely (individual-notice detail is **UNVERIFIED in excerpt**).
  (Breach guide; https://www.pdpc.gov.sg/organisations/e-services/report-your-organisations-data-breach)

### E — DO / DON'T

DO
- Put a short purpose notice and a link to the privacy policy directly beside every form, before the submit button.
- Add a separate, unticked checkbox for marketing by WhatsApp/SMS/calls, worded specifically, e.g. "I agree to receive marketing messages from [Company] by WhatsApp/SMS/phone at the number above."
- Store a timestamped consent record. Honour withdrawal.
- Check the DNC Registry within 21 days before any WhatsApp/SMS campaign to numbers without that consent.
- Identify the business by name and give a working contact in every message.
- Collect only the fields needed. Clinic forms should not ask for NRIC or medical history unless essential.
- Have a breach plan: 30-day assessment, 3-day PDPC notice.

DON'T
- No pre-ticked boxes or "by submitting you agree to marketing" bundled into an enquiry form.
- Don't treat "not opting out" as consent.
- No WhatsApp blasts to bought or scraped number lists.
- Don't say "valid business purposes" as the stated purpose.
- Don't send personal data from forms into tools without a data-processing arrangement. This is good practice; the detailed rule was not checked here.

---

## F. General advertising rules

### F1. ASAS — Singapore Code of Advertising Practice (SCAP)

Sources: https://asas.org.sg/About/Code ; Appendix J (Investments, 3 Aug 2015): https://asas.org.sg/Portals/0/Annex%20A%20-%20SCAP%20APPENDIX%20J.pdf ; ASAS 2024 feedback release: https://asas.org.sg/Portals/0/ASAS%20Media%20Release%20on%202024%20Feedback.pdf

- **Basic principle.** All ads should be "legal, decent, honest and truthful". This is industry self-regulation, not law. ASAS can ask for amendment or withdrawal, and can arrange for ad space to be withheld. (asas.org.sg/About/Code.)
- **Truthful presentation.** No misleading by exaggeration, ambiguity or omission (SCAP Ch. II cl. 5.1, per search excerpt). No scientific jargon implying a scientific basis the product lacks. Clause text **UNVERIFIED** beyond the excerpt.
- **Substantiation, testimonials, "free" in the main code.** Not read directly. Appendix J (investments) says "All claims must be capable of substantiation" (cl. 6.10). Endorsers must be genuine users who still hold the opinion. "Free" offers must state redemption terms (cl. 8.2). Main-code wording: **UNVERIFIED.**
- **Influencer disclosure.** The ASAS 2016 digital guidelines require a clear disclosure of the commercial relationship. This is known only from secondary sources (marketing-interactive, twobirds): **UNVERIFIED on asas.org.sg.** A SCAP review consultation closed 19 Apr 2024. Whether a revised code is in force: **UNVERIFIED.**

### F2. Consumer Protection (Fair Trading) Act (CPFTA) and CCS guidance

Sources:
- Overview: https://www.ccs.gov.sg/consumer-protection/legislation-and-guidelines/overview-of-the-consumer-protection--fair-trading--act/
- Act: https://sso.agc.gov.sg/Act/CPFTA2003
- Price Transparency Guidelines (in force 1 Nov 2020): https://www.ccs.gov.sg/consumer-protection/legislation-and-guidelines/guidelines-on-price-transparency/
- Guide on Quality-Related Claims (6 Oct 2025): https://www.ccs.gov.sg/consumer-protection/legislation-and-guidelines/guide-on-quality-related-claims/
- Cases: fake reviews (45 businesses), false urgency (https://www.ccs.gov.sg/media-and-events/newsroom/announcements-and-media-releases/three-online-retailers-caught-using-false-urgency-tactics-and-misleading-claims-to-pressure-shoppers/), Trustpilot/logos (https://www.ccs.gov.sg/case-register/public-register/consumer-protection--fair-trading-/ccs-warns-operators-of-hotel-bed-company-for-misleading-use-of-logos-and-trustpilot-rating/), Foodpanda "free delivery" (https://www.ccs.gov.sg/media-and-events/newsroom/announcements-and-media-releases/cccs-warns-foodpanda-over-misleading--free-delivery-on-all-restaurants--claims-278/)

- **Unfair practices.** Section 4 covers misleading conduct, false claims and taking advantage of consumers. The Second Schedule lists specific practices (e.g. false claims of a particular quality or standard; false sponsorship, approval or affiliation; hiding material facts in small print; misleading discount periods, para 18). Second Schedule wording **not read in full.**
- **Price transparency.** Covers drip pricing, price comparisons, discounts and "free".
  - Fold mandatory charges into the headline price.
  - Avoid pre-ticked add-ons.
  - "Free" must not be false or misleading. A bare "terms and conditions apply" is usually not enough (Foodpanda case).
- **Quality claims.** Claims must be "true and accurate" and "clear and easily understood", judged by how an average consumer reads them (CCS 2025 guide; remaining principles **UNVERIFIED**).
- **Enforcement themes.** Fake and AI-written reviews, fake visitor counters and countdown timers, false scarcity labels, made-up "official" logos and self-written ratings.

### F3. Accessibility

Sources: https://info.standards.tech.gov.sg/control-catalog/dss/ ; https://developer.tech.gov.sg/guidelines/standards-and-best-practices/wcag-2-1 ; https://www.mddi.gov.sg/newsroom/designing-for-digital-accessibility-and-inclusion/

- The Digital Service Standards are mandatory for government agencies and their vendors on government services. They follow WCAG 2.1 Level AA.
- GovTech: "it is not incorporated into a law or policy for businesses and organisations to incorporate the WCAG". **For private clients, accessibility is voluntary.** No IMDA private-sector accessibility rule was found.

### F — DO / DON'T

DO
- Back every factual or performance claim with evidence on file.
- Put the full price, including mandatory fees, up front, and state the conditions next to any "free" offer.
- Label sponsored and influencer content. Disclose AI-generated people or scenes wherever a viewer could be misled.
- Build to WCAG 2.1 AA by default: alt text, contrast, keyboard navigation, form labels. Voluntary, but cheap and good practice.

DON'T
- No fake or AI-written reviews, purchased ratings, fake visitor counters, fake countdowns or "only 2 left" unless true.
- No invented badges, "certified", "award-winning" or "as seen on" without proof.
- No discounts off a "usual price" that was never charged. No "sale ends today" that keeps running.
- No hidden fees or pre-ticked add-ons.

---

## What I could not access

- **All official pages directly.** WebFetch and curl were blocked for moh.gov.sg, sso.agc.gov.sg and ask.gov.sg (DNS failure / proxy 403), so no full page was read. Every rule rests on search-engine excerpts of the cited official URL.
- **Full text of the Healthcare Services (Advertisement) Regulations 2021.** Regs 13 (awards) and 14 (reviews) were seen only in excerpt. "Emotive" content and pre-vetting are not confirmed either way.
- **SMC ECEG/Handbook PDFs.** Only excerpts were seen. The "neutrally toned", "sensational/enticing" and before/after wording comes via the SMA reproduction. No post-2016 medical edition was found.
- **AI-specific healthcare advertising guidance.** None found on MOH, SMC or HSA. The Sept 2026 parliamentary statement on ASAS and AI was seen only on a secondary site.
- **ASAS SCAP full text and appendices.** Main-code clauses on substantiation, testimonials and "free"; the health/beauty and slimming appendices; the status of the 2024 SCAP revision; the 2016 influencer guidelines.
- **CEA PG 02-11 (Ethical Advertising) PDF and CEPCC full text.** Nothing found on virtual staging or artist's impressions. URA/developer "artist's impression" rules not found.
- **PDPC cookie/online-activities answers** in the Selected Topics guidelines. Excerpt cut off.
- **CPFTA Second Schedule full list**, and three of the five CCS quality-claims principles.
- **Status of pending changes:** the MOH review of allied health/TCM advertising, MAS's 2025 financial-advertisement consultation, and HSA's proposed POM direct-to-consumer ban.
