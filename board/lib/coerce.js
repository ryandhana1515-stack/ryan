"use strict";

/**
 * Treat every field the model returns as hostile input — not because the
 * model is adversarial, but because a schema-declared boolean can come back
 * as the string "false", and in most languages that is truthy. Check
 * identity, not truthiness. Coerce every scalar. Drop anything structural
 * where a sentence belonged.
 */

function coerceBool(v, fallback) {
  if (v === true) return true;
  if (v === false) return false;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true" || s === "yes") return true;
    if (s === "false" || s === "no") return false;
  }
  return fallback;
}

function coerceString(v, fallback) {
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" && isFinite(v)) return String(v);
  return fallback !== undefined ? fallback : "";
}

/** Confidence: a number in [0,1]. Strings of numbers are accepted; junk → fallback. */
function coerceConfidence(v, fallback) {
  let n = v;
  if (typeof n === "string" && n.trim() !== "") n = Number(n);
  if (typeof n !== "number" || !isFinite(n)) return fallback;
  if (n > 1 && n <= 100) n = n / 100; // "75" almost certainly meant 75%
  return Math.min(1, Math.max(0, n));
}

function coerceStringArray(v) {
  if (typeof v === "string") v = [v];
  if (!Array.isArray(v)) return [];
  return v.filter((x) => typeof x === "string").map((x) => x.trim()).filter(Boolean);
}

/**
 * Normalize one seat's raw model output into a safe opinion object.
 * `gateCitations` is injected so this stays a pure module.
 */
function normalizeOpinion(raw, seat, gateCitations) {
  const r = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  const abstain = coerceBool(r.abstain, false);
  const gated = gateCitations(r.citations, seat.shownIds);
  const position = coerceString(r.position, "");
  const opinion = {
    seatId: seat.id,
    seatName: seat.name,
    seatTitle: seat.seat,
    abstain,
    position: abstain ? "" : position,
    reasoning: abstain ? coerceString(r.reasoning, "") : coerceString(r.reasoning, ""),
    citations: abstain ? [] : gated.valid,
    strippedCitations: gated.stripped,
    confidence: abstain ? null : coerceConfidence(r.confidence, null),
    wouldChangeMind: coerceString(r.would_change_mind !== undefined ? r.would_change_mind : r.wouldChangeMind, ""),
    // A seat that cites nothing and didn't abstain is talking without
    // support. Not an error — but a flag the user must see at a glance.
    unsourced: false,
    failed: false,
  };
  if (!abstain && position === "") {
    // No position and no abstention = the call failed to produce an opinion.
    opinion.failed = true;
  }
  opinion.unsourced = !abstain && !opinion.failed && opinion.citations.length === 0;
  return opinion;
}

module.exports = { coerceBool, coerceString, coerceConfidence, coerceStringArray, normalizeOpinion };
