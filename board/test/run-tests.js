"use strict";

/* Tier 1 verification suite. Run: node board/test/run-tests.js */

const { parseDossier, parseRoster } = require("../lib/parser.js");
const { gateCitations } = require("../lib/gate.js");
const { coerceBool, coerceConfidence, normalizeOpinion } = require("../lib/coerce.js");
const { admissibleUnanimity, reconcileSummary } = require("../lib/guards.js");
const { normalizeText, matchSeats } = require("../lib/normalize.js");

let passed = 0;
let failed = 0;
function assert(cond, name) {
  if (cond) { passed++; console.log("  ok  " + name); }
  else { failed++; console.error("  FAIL " + name); }
}

const GOOD = `---
id: testseat
name: Test O'Person
seat: Test Seat
domains: pricing, offers
status: active
---

## Doctrine

### D1. First principle
**Source:** Real Book (2020), ch. 1
**Verification:** sourced

Charge more than feels comfortable.

### D2. Second principle
**Source:** Dated Talk (2021)
**Verification:** sourced

Volume fixes nothing a bad offer broke.

### D9. Retired principle
**Source:** Old Post (2019)
**Verification:** sourced
**Status:** retired

This one was withdrawn.

## Characteristic objection

Pushes back on discounting.

## Blind spots

Doctrine is B2C-info-product-shaped; thin on regulated physical goods.

## Voice

Blunt, numeric, short sentences.
`;

console.log("\n-- parser --");
{
  const problems = [];
  const seat = parseDossier(GOOD, "good.md", problems);
  assert(seat !== null, "valid dossier parses");
  assert(seat.doctrine.length === 3, "all entries parsed (incl. retired)");
  assert(seat.shownIds.join(",") === "D1,D2", "retired entry excluded from shownIds");
  assert(seat.domains.includes("pricing"), "domains parsed");
  assert(seat.blindSpots.includes("regulated"), "blind spots captured");
  assert(seat.doctrine[0].verification === "sourced", "verification state parsed");
}
{
  const problems = [];
  const seat = parseDossier(GOOD.replace("domains: pricing, offers", "domains:"), "nodomains.md", problems);
  assert(seat === null && problems.some((p) => p.reason.includes("domains")), "no-domains dossier rejected with logged reason");
}
{
  const problems = [];
  const noDoc = GOOD.replace(/## Doctrine[\s\S]*## Characteristic/, "## Characteristic");
  const seat = parseDossier(noDoc, "nodoctrine.md", problems);
  assert(seat === null && problems.some((p) => p.reason.includes("cite")), "no-doctrine dossier rejected");
}
{
  const problems = [];
  const dup = GOOD.replace("### D2. Second principle", "### D1. Second principle");
  const seat = parseDossier(dup, "dup.md", problems);
  assert(seat === null && problems.some((p) => p.reason.includes("duplicate")), "duplicate-id dossier rejected, not silently collapsed");
}
{
  const problems = [];
  const seat = parseDossier("garbage � not a dossier", "bad-encoding.md", problems);
  assert(seat === null, "garbage file returns null, no exception");
  const { seats, problems: rp } = parseRoster([
    { name: "good.md", text: GOOD },
    { name: "bad.md", text: "---\nid: x\n---\nnothing" },
  ]);
  assert(seats.length === 1, "one bad dossier loses only its own seat");
  assert(rp.length >= 1, "shrunken quorum is logged, never silent");
}

console.log("\n-- citation gate --");
{
  const shown = ["D1", "D2"];
  const g = gateCitations(["d2", "D7", "D1", "D2", 42, "D9"], shown);
  assert(g.valid.join(",") === "D2,D1", "normalizes case, dedupes, preserves order");
  assert(g.stripped.includes("D7") && g.stripped.includes("D9"), "fabricated + retired citations stripped");
  assert(gateCitations("D1", shown).valid.length === 0, "non-array citations yield nothing");
  assert(gateCitations(null, shown).valid.length === 0, "null citations tolerated");
}

console.log("\n-- hostile-input coercion --");
{
  assert(coerceBool("false", true) === false, '"false" string is FALSE (identity, not truthiness)');
  assert(coerceBool("true", false) === true, '"true" string is true');
  assert(coerceBool({}, false) === false, "object falls back");
  assert(coerceConfidence("0.8", null) === 0.8, "string confidence coerced");
  assert(coerceConfidence(75, null) === 0.75, "percent-style confidence scaled");
  assert(coerceConfidence("junk", null) === null, "junk confidence dropped");

  const seat = parseDossier(GOOD, "good.md", []);
  const op1 = normalizeOpinion(
    { abstain: "false", position: "Raise the price.", citations: ["D1", "D8"], confidence: "0.9" },
    seat, gateCitations
  );
  assert(op1.abstain === false, 'abstain:"false" does not abstain');
  assert(op1.citations.join(",") === "D1", "fabricated D8 stripped from opinion");
  assert(op1.unsourced === false, "cited opinion not flagged unsourced");

  const op2 = normalizeOpinion({ abstain: false, position: "Do X.", citations: [] }, seat, gateCitations);
  assert(op2.unsourced === true, "no-citation opinion flagged unsourced");

  const op3 = normalizeOpinion({ abstain: "true", position: "ignored" }, seat, gateCitations);
  assert(op3.abstain === true && op3.citations.length === 0, "abstention is clean: no position, no citations");

  const op4 = normalizeOpinion({ position: { text: "structural junk" } }, seat, gateCitations);
  assert(op4.failed === true, "structure where a sentence belonged = failed seat, not fake opinion");
}

console.log("\n-- guards --");
{
  const speak = (n) => Array.from({ length: n }, (_, i) => ({ abstain: false, failed: false, position: "p" + i }));
  const abst = { abstain: true, failed: false };
  assert(admissibleUnanimity(true, [...speak(1), abst]) === false, "one voice can never be unanimous");
  assert(admissibleUnanimity(true, speak(2)) === true, "two speaking seats may be unanimous if chair says so");
  assert(admissibleUnanimity("true", speak(3)) === false, 'chair claim "true" (string) is not a claim');
  const r = reconcileSummary("The board is unanimous: shut it down.", false);
  assert(r.corrected === true && !/unanimous/i.test(r.summary.replace(/^The board did not reach a unanimous view\./, "")), "prose contradicting computed verdict is corrected");
  const r2 = reconcileSummary("The board split 2-2 on this.", false);
  assert(r2.corrected === false, "consistent prose untouched");
}

console.log("\n-- routing normalization --");
{
  const seats = [
    { id: "oleary", name: "Kevin O'Leary" },
    { id: "hormozi", name: "Alex Hormozi" },
    { id: "ryanx", name: "Ryan Serhant" },
  ];
  const curly = "ask O’Leary about pricing";
  assert(matchSeats(curly, seats, "Ryan Dhana").some((s) => s.id === "oleary"), "curly-apostrophe dictation matches O'Leary");
  assert(matchSeats("what would hormozi do", seats, "Ryan Dhana").some((s) => s.id === "hormozi"), "surname matches");
  assert(matchSeats("ask ryan about churn", seats, "Ryan Dhana").length === 0, "owner-colliding first name does NOT route");
  assert(matchSeats("ask serhant about churn", seats, "Ryan Dhana").some((s) => s.id === "ryanx"), "surname still routes the colliding advisor");
  assert(normalizeText("Ｏ'Ｌｅａｒｙ").includes("o'leary"), "fullwidth normalized via NFKC");
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
