---
type: product
product: Fusion Property AI
section: "17 (Phase 0)"
source: ".claude/agents/fusion-property-sg.md §17 Phase 0; the method is Zaphiel's draft, for Ryan to review"
status: phase-0
tags: [product, fusion-property-ai, testing, dataset]
---
# Fusion Property AI · Test dataset plan (Phase 0)

Goal (agent §17):
- 30–50 **real Singapore floor plans** across the types;
- used **with permission**;
- with **hand-checked ground-truth geometry**.

The engine is measured against this set before Phase 1 ships. See [[90_Products/Fusion_Property_AI/Roadmap]] and
[[70_Industry_Packs/Singapore_Property/07_Geometry_Model_Schema]].

## Coverage (target 40 plans)
| Type | Plans | Why |
|---|---|---|
| HDB 3-room | 4 | common; HS + service yard |
| HDB 4-room | 6 | most common |
| HDB 5-room | 4 | |
| HDB Executive / maisonette / jumbo | 3 | multi-level, older layouts |
| HDB 2-room Flexi / 3Gen | 2 | edge sizes |
| Condo 1–2BR | 5 | bay windows, AC ledges, PES |
| Condo 3–4BR | 5 | |
| Penthouse / duplex | 2 | roof terrace, stairs, voids |
| EC | 2 | |
| Terrace / corner terrace | 3 | multi-storey landed |
| Semi-D / bungalow | 3 | attic, basement, larger plots |
| Hard cases (tilted, low-res photo, hand-annotated, "not to scale" brochure) | 3 (overlap with the rows above) | robustness |

## Sourcing (with permission only)
- Plans from FusionTech's own clients and Ryan's network, with a signed or recorded consent (`rights_basis: owner`).
- Property agents who agree to share plans of their listings, with the owner's consent recorded.
- Developer brochure plans, **only** with the developer's permission (they may be copyrighted; agent §15).
- Official HDB plans that owners obtain for their own flat, used with the owner's consent.
- **Do not** scrape portals (agent MUST NOT). **Do not** use plans without a rights basis.

Store the files privately (never in this public repo). The vault keeps only the index row: id, type, source, rights
basis, and the path in private storage.

## Ground truth (per plan)
- Label each plan by hand in the canonical schema (`source: user_confirmed`):
  - rooms (polygons + type);
  - walls (centre lines + thickness);
  - openings (kind, wall, offset, width);
  - fixed elements (HS, stairs, voids, AC ledge, bay window);
  - scale method;
  - the stated-area definition.
- A second person checks every label; differences are resolved and logged.
- Where the plan has printed dimensions, those are the truth. Where it does not, record the tolerance of the label
  itself.

## Metrics (agent §17)
| Metric | How | Phase 1 target (draft) |
|---|---|---|
| Wall position error | mean distance between the predicted and true wall centre lines (mm) | ≤ 100 mm on plans with printed dims |
| Opening position error | offset + width error per door/window (mm); kind accuracy | ≤ 150 mm; kind ≥ 95% |
| Room-area error | abs % error per room | ≤ 5% median |
| % plans needing user fixes | plans with ≥ 1 confirmation below the 0.8 threshold | tracked (no target yet) |
| Questions per plan | number of tap-to-fix questions | ≤ 3 median |
| Time per plan | upload → validated geometry (s) | tracked |
| Cost per plan | sum of the job costs (SGD) | tracked |
| Consistency-check pass rate | renders passing the edge overlay on the first try | ≥ 90% |

The targets are Zaphiel's draft numbers, to be set by Ryan after the baseline run. No number here is a promise to a
customer.

## Split and protocol
- 70% development, 30% held out. The held-out plans are never used to tune prompts.
- Each run records:
  - the parser provider, model and version;
  - the prompt version;
  - the date;
  - the per-plan results, in `80_Clients/_Test/property-benchmark/<run-date>/`.
- A regression happens when any metric worsens by more than 10%. It blocks the release (checkpoint 5, Ryan approves).
