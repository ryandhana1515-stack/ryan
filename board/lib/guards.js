"use strict";

/**
 * Deterministic chair guards — built in code rather than trusted to a prompt.
 */

/**
 * Unanimity guard: fewer than two non-abstaining, non-failed seats can never
 * be reported as unanimous. One voice is not a consensus, and a model will
 * cheerfully call it one.
 *
 * The chair may CLAIM unanimity; this function decides whether the claim is
 * even admissible. It does not judge agreement content — it enforces quorum.
 */
function admissibleUnanimity(chairClaimsUnanimous, opinions) {
  const speaking = (opinions || []).filter(
    (o) => o && o.failed !== true && o.abstain !== true
  );
  if (speaking.length < 2) return false;
  return chairClaimsUnanimous === true;
}

/**
 * Prose/verdict consistency: if the computed verdict says unanimous=false,
 * the sentence read aloud must not say "unanimous". Returns the corrected
 * summary plus a flag telling the caller a correction happened.
 */
function reconcileSummary(summary, unanimous) {
  const s = typeof summary === "string" ? summary : "";
  const claims = /unanimous|unanimity|all\s+(?:\w+\s+)?(?:seats|advisors|members)\s+agree/i.test(s);
  if (!unanimous && claims) {
    return {
      summary:
        "The board did not reach a unanimous view. " +
        s.replace(/\b(unanimous(?:ly)?|unanimity)\b/gi, "divided"),
      corrected: true,
    };
  }
  return { summary: s, corrected: false };
}

module.exports = { admissibleUnanimity, reconcileSummary };
