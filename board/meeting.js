#!/usr/bin/env node
"use strict";

/**
 * Board meeting post-processor — the deterministic half of a meeting.
 *
 * Usage:
 *   node board/meeting.js <opinions.json> [chair.json]
 *
 * opinions.json: [{ seatId, raw: <the seat model's JSON output (object or string)> }, ...]
 * chair.json:    { spoken_summary, verdict, unanimous, recommended_action, dissent }
 *
 * Runs the citation gate against each seat's ACTUAL dossier (board/dossiers/),
 * coerces every model-returned scalar, applies the unanimity + prose guards,
 * snapshots cited entries (title/source/verification), and prints a JSON
 * meeting record to stdout. The model layer can change (n8n, subagents, API);
 * this file is the part that must never be skipped.
 */

const fs = require("fs");
const path = require("path");
const { parseRoster } = require("./lib/parser.js");
const { gateCitations } = require("./lib/gate.js");
const { normalizeOpinion, coerceString, coerceBool } = require("./lib/coerce.js");
const { admissibleUnanimity, reconcileSummary } = require("./lib/guards.js");

function loadRoster() {
  const dir = path.join(__dirname, "dossiers");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md")).map((f) => ({
    name: f,
    text: fs.readFileSync(path.join(dir, f), "utf8"),
  }));
  return parseRoster(files);
}

function tolerantJson(v) {
  if (v && typeof v === "object") return v;
  if (typeof v !== "string") return null;
  const t = v.replace(/```(?:json)?/gi, "").trim();
  const a = t.indexOf("{");
  const b = t.lastIndexOf("}");
  if (a === -1 || b <= a) return null;
  try { return JSON.parse(t.slice(a, b + 1)); } catch (e) { return null; }
}

function main() {
  const [opinionsPath, chairPath] = process.argv.slice(2);
  if (!opinionsPath) {
    console.error("usage: node board/meeting.js <opinions.json> [chair.json]");
    process.exit(2);
  }
  const { seats, problems } = loadRoster();
  const byId = Object.fromEntries(seats.map((s) => [s.id, s]));
  const rawOpinions = JSON.parse(fs.readFileSync(opinionsPath, "utf8"));

  const opinions = rawOpinions.map((entry) => {
    const seat = byId[entry.seatId];
    if (!seat) {
      problems.push({ file: entry.seatId, reason: "opinion for unknown seat" });
      return null;
    }
    const parsed = tolerantJson(entry.raw);
    const seatShape = { id: seat.id, name: seat.name, seatTitle: seat.seat, shownIds: seat.shownIds };
    const op = normalizeOpinion(parsed || {}, seatShape, gateCitations);
    if (!parsed) { op.failed = true; op.reasoning = "SEAT OUTPUT UNPARSEABLE"; }
    const entriesById = Object.fromEntries(seat.doctrine.map((e) => [e.id, e]));
    op.citationSnapshots = op.citations.map((id) => ({
      id,
      title: (entriesById[id] || {}).title || "",
      source: (entriesById[id] || {}).source || "",
      verification: (entriesById[id] || {}).verification || "user",
    }));
    op.blindSpots = seat.blindSpots;
    return op;
  }).filter(Boolean);

  let chair = null;
  if (chairPath) {
    const rawChair = JSON.parse(fs.readFileSync(chairPath, "utf8"));
    const parsedChair = tolerantJson(rawChair) || rawChair;
    const claim = coerceBool(parsedChair.unanimous, false);
    const unanimous = admissibleUnanimity(claim, opinions);
    if (claim === true && unanimous === false) {
      problems.push({ file: "chair", reason: "guard: unanimity claimed with fewer than two speaking seats; overruled" });
    }
    const rec = reconcileSummary(coerceString(parsedChair.spoken_summary, ""), unanimous);
    if (rec.corrected) {
      problems.push({ file: "chair", reason: "guard: spoken summary contradicted computed verdict; corrected" });
    }
    chair = {
      spoken_summary: rec.summary,
      verdict: coerceString(parsedChair.verdict, ""),
      recommended_action: coerceString(parsedChair.recommended_action, ""),
      dissent: coerceString(parsedChair.dissent, ""),
      unanimous,
    };
  }

  process.stdout.write(JSON.stringify({ opinions, chair, problems }, null, 2));
}

main();
