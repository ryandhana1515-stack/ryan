---
tags: [zaphiel, skill-pack, titan, security, compliance]
version: 1.0 (2026-10-12)
---
# Security and compliance checklists

## Integrations (always through ATLAS)
Approved APIs and server-side services only · tenant isolation · least privilege · idempotency · webhook signature
verification · audit logs. **Never put an API key in browser code.**

## Web app security
- [ ] Authentication (MFA for admin areas) and authorisation per role
- [ ] Secure sessions (HttpOnly, Secure, SameSite cookies; short admin sessions)
- [ ] Input validation server-side, output encoding (no XSS), parameterised queries
- [ ] Rate limiting on forms and login; bot protection on public forms
- [ ] Security headers: Content-Security-Policy, HSTS (production), X-Content-Type-Options, Referrer-Policy,
      Permissions-Policy, frame-ancestors
- [ ] Data minimisation: collect only what the form needs
- [ ] Dependency scanning before each deploy (`npm audit`)
- [ ] Backups and a tested restore for anything with a database
- [ ] Secrets only in the hosting provider's environment variables or n8n credentials

## PDPA (every form)
- [ ] A consent line that says what the data is for and who will contact the person
- [ ] A link to the client's privacy notice
- [ ] Marketing messages (WhatsApp/SMS/calls) only with consent; Do Not Call rules checked by the client
- [ ] No sensitive data (medical details, NRIC) in a plain web form unless the client has a secure, approved process
- [ ] Analytics/cookies explained in the privacy notice

## Accessibility
WCAG 2.1 AA target: contrast, keyboard access, focus visible, labels, alt text, captions on videos, reduced motion.

## Per industry (flag for the client's expert; never claim compliance because an AI built it)
- **Medical / clinics:** healthcare advertising rules, doctor's review, presenter labelling → [[03_Medical_Supplement_Rules]]
- **Supplements:** health-product claims → [[03_Medical_Supplement_Rules]]
- **Finance / crypto:** MAS rules, licences, security audit → [[07_Finance_Crypto_Rules]]
- **Property:** CEA advertising rules → [[08_Property_Portal]]
- **E-commerce:** prices with GST if GST-registered, clear refund/delivery terms from the client, payment provider rules
