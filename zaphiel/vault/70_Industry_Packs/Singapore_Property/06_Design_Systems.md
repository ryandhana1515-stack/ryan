---
type: industry-pack
pack: Singapore_Property
section: 9
source: ".claude/agents/fusion-property-sg.md §9–10 (Ryan, 2026-09-30, verbatim)"
tags: [industry-pack, property, singapore, fusion-property-ai, design]
---
# 06 · Ten design systems and colour tones

Part of [[70_Industry_Packs/Singapore_Property/00_Index]]. Rendered with [[10_Agents/04_Creative_Studio]]; used on the
websites through [[cinematic-website]].

## The ten styles
| # | Style | Direction |
|---|---|---|
| 1 | **Modern Luxury** | Premium stone, sophisticated lighting, warm woods, elegant furniture, a high-end hotel atmosphere. |
| 2 | **Contemporary** | Clean architecture, modern materials, neutral colours, sophisticated contemporary furniture. |
| 3 | **Japandi** | Japanese minimalism plus Scandinavian warmth: natural timber, soft neutral materials, calm spaces. |
| 4 | **Scandinavian** | Bright and functional: natural timber, a white/neutral palette, simple comfortable furniture. |
| 5 | **Wabi-Sabi** | Natural stone, textured plaster, organic materials, muted earthy colours, imperfect natural beauty. |
| 6 | **Quiet Luxury** | An understated expensive look: premium materials, subtle detailing, elegant proportions. |
| 7 | **Modern European** | European-inspired detailing with modern luxury materials and contemporary furniture. |
| 8 | **Luxury Hotel** | A five-star hotel atmosphere: sophisticated lighting, premium materials, dramatic but elegant. |
| 9 | **Warm Minimalist** | Minimal architecture softened by timber, warm lighting, textures and comfortable furniture. |
| 10 | **Modern Tropical** | Contemporary tropical for Singapore: greenery, timber, stone, natural light, modern architecture. |

## Colour tones (for every style)
- The tones are **Light & Airy**, **Warm**, **Cool**, **Dark & Moody** and **Signature** (the brand's or user's pick).
- Changing the tone swaps the palette tokens in the Design DNA. **It never changes the geometry.**

## Singapore adaptation (all styles)
- Humidity- and mould-resistant materials.
- Cross-ventilation and ceiling fans.
- Aircon placement (fan coils, trunking).
- Sun-glare control.
- Wet-kitchen vs dry-kitchen options.
- A practical service yard and laundry.
- The HS door shown as it is.
- Realistic storage for HDB sizes.

## Whole-home rule: the Property Design DNA (agent §10)
- Never generate rooms as unrelated designs.
- Once a style and a tone are chosen, create one Design DNA and store it as JSON. Every render, 3D material and
  marketing asset uses the same values.
- The result should look as if ONE professional interior designer designed the entire home.
- Schema: [[90_Products/Fusion_Property_AI/Data_Model#DesignDNA]].

The DNA holds:
- a colour palette (hex tokens);
- flooring, stone, timber and metals;
- cabinetry;
- lighting temperature (K);
- furniture language and architectural detailing;
- fabrics and wall treatments;
- kitchen language and bathroom language;
- plants and greenery;
- a reference image set.
