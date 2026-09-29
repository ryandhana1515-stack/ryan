import { createHmac, timingSafeEqual } from 'node:crypto';
import type { IntakeInput } from './intake';

/**
 * WhatsApp Business Platform (Cloud API) webhook helpers.
 * Checked against Meta's official docs on 2026-09-30 (SGT):
 *   https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/create-webhook-endpoint/
 *   https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/overview
 *   https://developers.facebook.com/docs/graph-api/webhooks/getting-started/
 *  - Verification: GET with hub.mode=subscribe, hub.verify_token, hub.challenge → echo the challenge.
 *  - Payloads are signed: header X-Hub-Signature-256: sha256=<HMAC-SHA256(raw body, App Secret)>.
 *  - Messages: entry[].changes[].value.messages[] ({ id (wamid), from, timestamp, type, text.body }),
 *    contacts[].profile.name.
 * Re-check these before going live with a client (API behaviour is never assumed).
 */
export function verifySignature(rawBody: Buffer | string, header: string | undefined, appSecret: string): boolean {
  if (!header?.startsWith('sha256=')) return false;
  const expected = createHmac('sha256', appSecret).update(rawBody).digest('hex');
  const got = header.slice(7);
  return got.length === expected.length && timingSafeEqual(Buffer.from(got, 'hex'), Buffer.from(expected, 'hex'));
}

export function verifyChallenge(q: URLSearchParams, verifyToken: string): string | null {
  return q.get('hub.mode') === 'subscribe' && q.get('hub.verify_token') === verifyToken ? q.get('hub.challenge') : null;
}

/** One IntakeInput per inbound message. Status updates (delivered/read) are ignored here. */
export function parseWhatsAppWebhook(body: any): IntakeInput[] {
  const out: IntakeInput[] = [];
  for (const entry of body?.entry ?? []) {
    for (const change of entry?.changes ?? []) {
      const v = change?.value ?? {};
      const names = new Map<string, string>((v.contacts ?? []).map((c: any) => [String(c.wa_id), c.profile?.name]));
      for (const m of v.messages ?? []) {
        out.push({
          channel: 'whatsapp', source: 'whatsapp', externalId: String(m.id), phone: `+${String(m.from).replace(/^\+/, '')}`,
          name: names.get(String(m.from)) ?? undefined,
          message: m.type === 'text' ? m.text?.body : `[${m.type} message]`,
        });
      }
    }
  }
  return out;
}
