"use strict";

/**
 * Dossier parser — reads one advisor dossier (markdown) and returns a
 * structured seat, or null with a logged reason.
 *
 * A dossier is a knowledge base, not a personality. Format:
 *
 *   ---
 *   id: hormozi
 *   name: Alex Hormozi
 *   seat: Offers & Acquisition
 *   domains: offers, pricing, paid acquisition
 *   status: active
 *   ---
 *   ## Doctrine
 *   ### D1. Entry title
 *   **Source:** $100M Offers (2021), ch. 3
 *   **Verification:** sourced
 *   Body paragraph...
 *   ### D2. ...
 *   ## Characteristic objection
 *   ...
 *   ## Blind spots
 *   ...
 *   ## Voice
 *   ...
 *
 * Rejection rules (each returns null and pushes a reason into `problems`):
 *   - no frontmatter / no id / no name
 *   - no domains (could never be routed to)
 *   - no doctrine entries (nothing to cite)
 *   - duplicate doctrine ids (an ambiguous citation target means the
 *     anti-fabrication gate would fail open)
 *
 * Doctrine ids are explicit in the file (### D3. ...) — never derived from
 * ordering, so reordering entries can never re-point stored citations.
 *
 * Retired entries (**Status:** retired) parse fine but are excluded from
 * `shownIds` — the set a live seat may cite from. Their id stays spoken for
 * forever, which is the whole point of retire-never-delete.
 */

const ENTRY_HEADING = /^###\s+(D\d+)\s*[.—–-]?\s*(.*)$/;
const SECTION_HEADING = /^##\s+(.+?)\s*$/;

function parseDossier(rawText, fileName, problems) {
  problems = problems || [];
  const warn = (msg) => problems.push({ file: fileName, reason: msg });

  if (typeof rawText !== "string" || rawText.trim() === "") {
    warn("empty or unreadable file");
    return null;
  }
  // Tolerant UTF-8: decoders replace invalid bytes with U+FFFD. That degrades
  // to a warning, never an exception that takes out the roster.
  if (rawText.includes("�")) {
    warn("file contains invalid UTF-8 sequences (parsed anyway; check encoding)");
  }
  const text = rawText.replace(/^﻿/, ""); // strip BOM

  // --- frontmatter ---
  const lines = text.split(/\r\n|\r|\n/);
  if (lines[0].trim() !== "---") {
    warn("missing frontmatter (file must start with ---)");
    return null;
  }
  let fmEnd = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") { fmEnd = i; break; }
  }
  if (fmEnd === -1) {
    warn("unterminated frontmatter");
    return null;
  }
  const fm = {};
  for (let i = 1; i < fmEnd; i++) {
    const m = lines[i].match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (m) fm[m[1].toLowerCase()] = m[2].trim();
  }

  if (!fm.id) { warn("frontmatter has no id"); return null; }
  if (!fm.name) { warn("frontmatter has no name"); return null; }

  const domains = (fm.domains || "")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter((d) => d.length > 0);
  if (domains.length === 0) {
    warn("no domains — this seat could never be routed to");
    return null;
  }

  // --- body sections ---
  const body = lines.slice(fmEnd + 1);
  const sections = {}; // lowercased section name -> lines
  let current = null;
  for (const line of body) {
    const sm = line.match(SECTION_HEADING);
    if (sm) {
      current = sm[1].toLowerCase();
      sections[current] = [];
    } else if (current) {
      sections[current].push(line);
    }
  }

  const sectionText = (names) => {
    for (const n of names) {
      if (sections[n]) return sections[n].join("\n").trim();
    }
    return "";
  };

  // --- doctrine entries ---
  const doctrineLines = sections["doctrine"] || [];
  const entries = [];
  let entry = null;
  for (const line of doctrineLines) {
    const em = line.match(ENTRY_HEADING);
    if (em) {
      if (entry) entries.push(entry);
      entry = {
        id: em[1].toUpperCase(),
        title: em[2].trim(),
        source: "",
        verification: "user",
        retired: false,
        bodyLines: [],
      };
      continue;
    }
    if (!entry) continue;
    const srcM = line.match(/^\*\*Source:\*\*\s*(.*)$/i);
    const verM = line.match(/^\*\*Verification:\*\*\s*(.*)$/i);
    const stM = line.match(/^\*\*Status:\*\*\s*(.*)$/i);
    if (srcM) entry.source = srcM[1].trim();
    else if (verM) {
      const v = verM[1].trim().toLowerCase();
      // Only two states exist. Anything unrecognized degrades to "user" —
      // the server-side default that never over-claims verification.
      entry.verification = v === "sourced" ? "sourced" : "user";
    } else if (stM) entry.retired = stM[1].trim().toLowerCase() === "retired";
    else entry.bodyLines.push(line);
  }
  if (entry) entries.push(entry);

  for (const e of entries) {
    e.body = e.bodyLines.join("\n").trim();
    delete e.bodyLines;
  }

  if (entries.length === 0) {
    warn("no doctrine entries — there is nothing to cite");
    return null;
  }

  // Duplicate ids make citations ambiguous; anti-fabrication machinery that
  // fails open is not machinery. Reject the whole file.
  const seen = new Set();
  for (const e of entries) {
    if (seen.has(e.id)) {
      warn(`duplicate doctrine id ${e.id} — citations would be ambiguous`);
      return null;
    }
    seen.add(e.id);
  }

  const active = entries.filter((e) => !e.retired);
  if (active.length === 0) {
    warn("all doctrine entries are retired — nothing left to cite");
    return null;
  }

  return {
    id: fm.id.toLowerCase(),
    name: fm.name,
    seat: fm.seat || fm.name,
    domains,
    status: (fm.status || "active").toLowerCase(),
    doctrine: entries,
    // The set a live seat is actually shown — and therefore the ONLY set the
    // citation gate accepts. Retired ids are deliberately absent.
    shownIds: active.map((e) => e.id),
    objection: sectionText(["characteristic objection", "objection"]),
    blindSpots: sectionText(["blind spots", "blind-spots", "blindspots"]),
    voice: sectionText(["voice"]),
  };
}

/**
 * Parse a whole roster. One malformed dossier loses its own seat and logs
 * why — it must never take the board down, and it must never vanish
 * silently: `problems` is returned so a shrinking quorum is always visible.
 */
function parseRoster(files) {
  const problems = [];
  const seats = [];
  for (const f of files) {
    try {
      const seat = parseDossier(f.text, f.name, problems);
      if (seat) seats.push(seat);
    } catch (err) {
      problems.push({ file: f.name, reason: `parser exception: ${err.message}` });
    }
  }
  return { seats, problems };
}

module.exports = { parseDossier, parseRoster };
