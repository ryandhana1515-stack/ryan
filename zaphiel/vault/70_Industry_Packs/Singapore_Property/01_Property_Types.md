---
type: industry-pack
pack: Singapore_Property
section: 5
source: ".claude/agents/fusion-property-sg.md §5 (Ryan, 2026-09-30, verbatim)"
tags: [industry-pack, property, singapore, fusion-property-ai]
---
# 01 · Singapore property types

Baseline knowledge. **Verify before quoting**: anything with a number, date or condition is checked against
[[70_Industry_Packs/Singapore_Property/03_Regulation_Register]] first. Part of [[70_Industry_Packs/Singapore_Property/00_Index]].

## HDB (public housing)
- Leasehold: 99-year lease.
- Flat types: 2-room Flexi, 3-room, 4-room, 5-room, 3Gen, and Executive (plus the older Executive maisonettes and
  jumbo flats).
- Newer flats typically include a **household shelter (HS)** and a **service yard**.
- BTO flats are classified **Standard / Plus / Prime** (from the October 2024 launches), each with different
  conditions.
- HDB sets the Minimum Occupation Period (MOP), eligibility, resale, rental rules and renovation permits.
- Internal floor areas vary by era and design. **Always use the plan; never assume.**

## Executive Condominium (EC)
- A hybrid of public and private housing, with condo-like facilities.
- Has its own eligibility and MOP rules.
- It privatises over time; verify the timelines in the register.

## Private condominium / apartment
- Strata-titled, and managed by an MCST under by-laws.
- Typical features: balconies, bay windows (older developments), AC ledges, PES (private enclosed space), household
  shelter, yard, and penthouse roof terraces.
- Facade and balcony changes are controlled: by the by-laws, and by URA's guidelines on approved balcony screens and
  enclosures.

## Landed
- Types:
  - terrace (intermediate or corner);
  - semi-detached;
  - detached / bungalow;
  - **Good Class Bungalow (GCB)**, within the gazetted GCB Areas, with larger minimum plot sizes;
  - strata / cluster landed (landed homes with an MCST).
- URA's landed housing guidelines set:
  - the building envelope;
  - storey controls;
  - setbacks;
  - attic and basement rules;
  - minimum plot sizes.
- Works may need URA planning permission plus BCA approvals, through a Qualified Person (QP).

## Conservation shophouses and bungalows
- URA's conservation guidelines restrict changes to the facade and the structure.

## Tenure
- Freehold, 999-year, or 99-year leasehold.
- Tenure affects value and financing.

## What the floor-plan engine must recognise per type
Derived from agent §3; see [[70_Industry_Packs/Singapore_Property/07_Geometry_Model_Schema]].

| Type | Elements to expect on the plan |
|---|---|
| HDB | HS, service yard, AC ledge (newer); bomb-shelter door; no PES |
| EC / condo | balcony, bay window (older), AC ledge, PES (ground floor), HS, yard; roof terrace for penthouses |
| Maisonette / penthouse / landed | several levels, staircase, voids; attic / basement / roof terrace for landed |
| Conservation | treat the facade and the structure as fixed (RED to change) |
