"use strict";

/**
 * Name/text normalization for routing. A dictated "O'Leary" arrives with a
 * curly apostrophe (U+2019); naive comparison fails silently and every
 * spoken request for that advisor falls through to a paid router call.
 * Handled: curly apostrophes, fullwidth forms (via NFKC), non-breaking and
 * exotic spaces, soft hyphens, unicode dashes.
 */
function normalizeText(s) {
  if (typeof s !== "string") return "";
  return s
    .normalize("NFKC")
    .replace(/[\u2018\u2019\u02BC`\u00B4]/g, "'") // apostrophe variants incl. curly U+2019
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, " ") // nbsp + unicode spaces
    .replace(/\u00AD/g, "") // soft hyphen
    .replace(/[\u2010-\u2015]/g, "-") // unicode hyphens/dashes
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Deterministic pre-router roster match. Matches full names, surnames, and
 * dossier ids. Bare FIRST names only match when unique across the roster AND
 * not colliding with the owner's first name — "ask ryan" must never route to
 * an advisor when the owner is also Ryan. Surnames are always acceptable.
 */
function matchSeats(question, seats, ownerName) {
  const q = normalizeText(question);
  const owner = normalizeText(ownerName || "").split(" ")[0];
  const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const hit = (needle) => {
    if (!needle) return false;
    return new RegExp("(^|[^a-z0-9'])" + esc(needle) + "($|[^a-z0-9'])").test(q);
  };

  const firstNameCount = {};
  for (const s of seats) {
    const first = normalizeText(s.name).split(" ")[0];
    firstNameCount[first] = (firstNameCount[first] || 0) + 1;
  }

  const matched = [];
  for (const s of seats) {
    const full = normalizeText(s.name);
    const parts = full.split(" ");
    const first = parts[0];
    const last = parts.length > 1 ? parts[parts.length - 1] : null;
    let m = false;
    if (hit(full) || hit(normalizeText(s.id))) m = true;
    else if (last && hit(last)) m = true;
    else if (hit(first) && firstNameCount[first] === 1 && first !== owner) m = true;
    if (m && !matched.some((x) => x.id === s.id)) matched.push(s);
  }
  return matched;
}

module.exports = { normalizeText, matchSeats };
