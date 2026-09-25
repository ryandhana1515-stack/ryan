---
tags: [zaphiel, howto, whatsapp]
for: Ryan
---
# How to connect WhatsApp (one-time, about 20 minutes)

Everything for WhatsApp is already built: the inbound adapter (`3IhIJ5IYsB7wQQSg`) and the
Outbound Sender (`SAcnNxG1GWPwn3N7`). They wait for ONE thing: a Meta WhatsApp Business Cloud
credential in n8n. Here is how to get it.

## 1. Meta side (developers.facebook.com)
1. Log in with the Facebook account that owns the FusionTech business page. Go to **My Apps →
   Create App → Business**. Name it "FusionTech AI Agents".
2. In the app, **Add product → WhatsApp → Set up**. Pick (or create) the FusionTech **WhatsApp
   Business Account**.
3. Under **WhatsApp → API Setup** you get a **test phone number** and a **Phone number ID**. The
   test number can message only up to 5 numbers you add as recipients — good for testing.
   For real customers, click **Add phone number** and register FusionTech's real business number
   (it must not be on a normal WhatsApp app at the same time).
4. Permanent token (the 24-hour temporary token is useless for automation):
   **Business Settings → Users → System Users → Add** (name "n8n-agents", role Admin) →
   **Add Assets** → tick the app and the WhatsApp Business Account (full control) →
   **Generate New Token** → select the app → permissions `whatsapp_business_messaging` and
   `whatsapp_business_management` → expiry **Never** → copy the token once. Never paste it in
   chat, in this vault or in a file — only into n8n's credential screen.

## 2. n8n side (ryan1515.app.n8n.cloud)
5. **Credentials → Add credential → "WhatsApp"** (WhatsApp Business Cloud API). Paste the
   permanent token and the WhatsApp Business Account ID. Save.
6. Tell Zaphiel: "WhatsApp credential is in n8n, phone number ID is …". Zaphiel then re-adds the
   WhatsApp node to the Outbound Sender (5 minutes) and runs a test message to your own number.

## 3. Point Meta at John
7. Meta app → **WhatsApp → Configuration → Webhook → Edit**:
   Callback URL `https://ryan1515.app.n8n.cloud/webhook/ceo-brain/whatsapp`,
   Verify token `ceo-brain-verify` → **Verify and save** → **Manage** → subscribe to **messages**.
8. Send "hi" from a test recipient number to the WhatsApp business number. John answers.

## Costs
Meta charges per 24-hour conversation (marketing / utility / service categories, a few cents
each in Singapore). This is a third-party cost, always separate from FusionTech fees — say so in
proposals.
