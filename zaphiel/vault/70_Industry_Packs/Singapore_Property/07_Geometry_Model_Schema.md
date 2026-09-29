---
type: industry-pack
pack: Singapore_Property
section: 3
source: ".claude/agents/fusion-property-sg.md §3–4 (Ryan, 2026-09-30, verbatim)"
tags: [industry-pack, property, singapore, fusion-property-ai, geometry, schema]
---
# 07 · Canonical Property Geometry Model (schema)

Part of [[70_Industry_Packs/Singapore_Property/00_Index]]. The Canonical Property Geometry Model is the **single source of truth**:
- every render, 3D scene, listing page and compliance flag is derived from it;
- nothing redesigns it silently;
- the platform tables are in [[90_Products/Fusion_Property_AI/Data_Model]].

## Inputs
- Accepted: PDF, JPG, PNG. Later: DWG, DXF, IFC.

## What to extract
- Property type, storeys, approximate floor area.
- Rooms: names and dimensions.
- Walls: positions and thickness.
- Doors: door openings and swing.
- Windows and entrances.
- Spaces:
  - living, dining, bedrooms, kitchen, bathrooms, utility, service yard, balcony;
  - household shelter (HS), staircases, voids;
  - outdoor areas, AC ledges, bay windows, planter boxes, PES (private enclosed space), roof terrace.
- Existing fixtures, where they can be identified.
- Plan marks: north arrow, scale bar, printed dimensions, unit/stack number.
- Any other visible architectural elements.

## Scale calibration (critical, never skip)
Use these, in this order:
1. printed dimensions;
2. the scale bar;
3. the stated total area;
4. ONE known wall length entered by the user.

- If none of them is available, the geometry stays **RELATIVE**, and every dimension is **UNKNOWN / REQUIRES
  CONFIRMATION**.
- Brochure plans are often "not to scale".
- Stated areas may include AC ledges, bay windows and voids: the strata area is not the usable internal area.
  Record which definition the stated area uses, if known.

## Schema (v1)
```json
{
  "property_id": "", "version": 1, "units": "mm",
  "property_type": "", "tenure": "UNKNOWN", "storeys": 1,
  "stated_area": {"value": null, "unit": "sqm|sqft", "definition": "strata|internal|unknown", "source": ""},
  "scale": {"method": "printed_dims|scale_bar|area|user_wall|none", "confidence": 0.0},
  "levels": [{
    "level": 1, "floor_to_floor_mm": null,
    "rooms": [{"id": "R1", "type": "living", "label_on_plan": "", "polygon": [[0,0]], "area_sqm": null, "confidence": 0.0}],
    "walls": [{"id": "W1", "start": [0,0], "end": [0,0], "thickness_mm": null, "structural": "UNKNOWN|yes|no", "source": "extracted|user_confirmed|official_plan", "confidence": 0.0}],
    "openings": [{"id": "D1", "kind": "door|window|opening|sliding", "wall": "W1", "offset_mm": null, "width_mm": null, "swing": "unknown", "confidence": 0.0}],
    "fixed_elements": [{"kind": "household_shelter|stair|void|column|shaft|ac_ledge|bay_window", "polygon": [], "confidence": 0.0}]
  }],
  "unknowns": [], "user_confirmations": [], "validation": {}
}
```

### Field notes
- `units` is always `mm`, and coordinates are in plan space.
- `polygon` is a closed list of `[x, y]` points. The first point is not repeated.
- `confidence` runs from 0 to 1, per element. The overall score is kept in `validation`.
- `structural` defaults to **UNKNOWN**:
  - sales plans usually do not mark structural walls;
  - it becomes `yes` or `no` only from an official plan (`source: official_plan`);
  - for HDB, point the user to HDB's official flat and structural information (verify the current e-service in the
    register).
- `unknowns`: every value that is null because it could not be read, with the reason.
- `user_confirmations`: `{element_id, question, answer, at}`, one entry per tap-to-fix answer.
- A new version is made whenever the geometry changes. Versions are never edited in place.
- A **PROPOSED RENOVATION** is made only on the user's explicit request. It is stored as a new version with
  `status: proposed`, linked to its parent version, and passes through the compliance engine
  ([[70_Industry_Packs/Singapore_Property/04_Renovation_Compliance_Matrix]]).

## Never
- Never move windows or entrances.
- Never change room dimensions.
- Never remove structural elements.
- Never invent rooms, enlarge the property, change the external boundaries or move the stairs.
- Never hallucinate a measurement. Unknown = **UNKNOWN / REQUIRES CONFIRMATION**.

## Validation before any design (agent §4)
The Geometry Validation step checks:
1. Room boundaries: closed polygons, no overlaps.
2. Dimensions against the printed dimensions.
3. Door positions: on a wall, with a plausible width.
4. Window positions: on external walls.
5. Circulation: every room can be reached.
6. The room connectivity graph.
7. The property perimeter.
8. Scale consistency: the sum of the rooms against the stated area, within a stated tolerance.
9. Multi-storey relationships: stairs and voids line up.
10. The list of uncertain geometry.

- Each element gets a confidence score, and so does the whole plan.
- Below the threshold (default 0.8, configurable), ask the user to confirm that element with a simple visual check
  ("Is this a window or a wall?").
- Save a `ValidationReport`.
- Designs start only from a geometry version that passed validation or was confirmed by the user.
