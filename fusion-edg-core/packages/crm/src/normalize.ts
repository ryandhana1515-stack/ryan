/**
 * Dedupe keys (Part C): phones normalised to E.164 (Singapore default +65), emails lower-cased.
 * Returns null for anything that is not a plausible number/address: never guesses.
 */
export function normalizePhone(raw: string | undefined | null, defaultCountryCode = '65'): string | null {
  if (!raw) return null;
  let s = String(raw).trim().replace(/[\s\-().]/g, '');
  if (s.startsWith('00')) s = '+' + s.slice(2);
  if (!s.startsWith('+')) {
    if (defaultCountryCode === '65' && /^[3689]\d{7}$/.test(s)) s = '+65' + s; // local SG number
    else if (s.startsWith(defaultCountryCode) && s.length >= defaultCountryCode.length + 7) s = '+' + s;
    else return null;
  }
  if (!/^\+[1-9]\d{6,14}$/.test(s)) return null;
  if (s.startsWith('+65') && !/^\+65[3689]\d{7}$/.test(s)) return null; // SG numbers are 8 digits
  return s;
}

export function normalizeEmail(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const s = String(raw).trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s : null;
}

/** "Name <a@b.com>" → a@b.com */
export function emailFromHeader(from: string | undefined | null): string | null {
  if (!from) return null;
  const m = /<([^>]+)>/.exec(from);
  return normalizeEmail(m ? m[1] : from);
}

export const OPT_OUT_WORDS = /^\s*(stop|unsubscribe|opt[\s-]?out|stop all|berhenti)\s*[.!]*\s*$/i;
