"use strict";

/**
 * The citation gate — a pure function.
 *
 * Given whatever the model returned as citations and the set of doctrine ids
 * that seat was actually SHOWN (not everything in the file — retired entries
 * are in the file but withheld from the seat), return only the valid ones.
 *
 * The gate can prove a citation exists in the dossier. It can never prove
 * the dossier is true — that is the fact-check's job (board/factcheck/).
 */
function gateCitations(rawCitations, shownIds) {
  const shown = new Set(
    (Array.isArray(shownIds) ? shownIds : [])
      .filter((s) => typeof s === "string")
      .map((s) => s.trim().toUpperCase())
  );

  const valid = [];
  const stripped = [];
  const emitted = new Set();

  const list = Array.isArray(rawCitations) ? rawCitations : [];
  for (const raw of list) {
    if (typeof raw !== "string") {
      stripped.push(String(raw));
      continue;
    }
    const id = raw.trim().toUpperCase();
    if (id === "") continue;
    if (emitted.has(id)) continue; // de-duplicate, preserve first-seen order
    if (shown.has(id)) {
      valid.push(id);
      emitted.add(id);
    } else {
      stripped.push(id); // fabricated, retired, or another seat's id
      emitted.add(id);
    }
  }
  return { valid, stripped };
}

module.exports = { gateCitations };
