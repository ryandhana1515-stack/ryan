// Website Builder Agent v2 — FusionTech's premium website production system (SME mode + Medical mode).
// Pure functions, no n8n globals. Same contract as the Sales agent: deterministic fallback that
// produces the SAME schema as the LLM, a validator, design intelligence, a QA checklist and the
// Lovable build-prompt builder. Inlined into the n8n Code nodes by workflows/website-builder/build.js.
// Keep it dependency-free and ES5-compatible (n8n Code node sandbox).
var WB_VERSION = 'website-builder-2.3.0';
var WB_SCHEMA_VERSION = '2.0';
var WB_MODES = ['sme', 'medical'];
var WB_SITE_TYPES = ['business_website', 'landing_page', 'online_store', 'web_app', 'portal', 'other'];
var WB_GOALS = ['leads', 'bookings', 'sales', 'information', 'support', 'other'];
var WB_CATEGORIES = ['professional_services', 'beauty', 'property', 'technology', 'consulting', 'retail', 'education', 'home_services', 'b2b', 'local_business', 'food_beverage', 'logistics', 'healthcare', 'automotive', 'construction', 'other'];
var WB_MISSING = ['business_name', 'industry', 'audience', 'primary_goal', 'pages', 'features', 'integrations', 'style', 'existing_domain', 'logo_and_brand', 'content', 'examples', 'timeline', 'decision_maker', 'competitors', 'existing_website', 'brand_personality', 'doctor_profiles', 'treatments', 'clinic_locations', 'credentials'];
var WB_MAX_PROMPT = 18000;
var WB_STRATEGY_MARK = 'STRATEGY FROM WEBSITE INTELLIGENCE (follow it):';
var WB_LOVABLE_BASE = 'https://lovable.dev/#prompt=';

// The look every generic AI site has. Every build prompt forbids it and every QA pass checks for it.
var WB_ANTI_GENERIC = [
  'the default navy-to-purple SaaS gradient with nothing behind it',
  'flat black or dark grey boxes and empty dark panels instead of photography',
  'random glowing orbs or blurred colour blobs',
  'generic frosted-glass cards',
  'irrelevant stock photography',
  'one huge generic headline over a hero that says nothing specific',
  'three identical feature boxes in a row',
  'generic SaaS landing-page layout',
  'the same font pairing as every other AI site'
];
// Ryan's standard (2026-09-25): a mock-up must look cinematic and alive, never a set of boxes.
var WB_CINEMATIC = [
  'Film-led (Ryan, 2026-09-29: "an actual scroll website, 3D video … no photos, just colours"): the Kling film chapters are the imagery. No static photo sections and no image used twice; each generated photo is only the poster (first frame) of its film chapter. Between chapters: clean solid brand-colour panels with big typography, like an Apple product page.',
  'Colour with depth: rich colour pulled from the film, cinematic gradient overlays (dark-to-transparent, brand-tinted) for legibility over the film; solid panels use the brand palette with strong contrast.',
  'Large, confident display typography over the film and on the panels; short lines; generous spacing.',
  'Motion: 3D scroll film on EVERY screen size, phones first (Ryan, 2026-09-29: the Smile Plus mock-up turned the film off on phones and showed a still). Each film chapter is pinned full-screen and scrubbed by the scroll (GSAP ScrollTrigger scrub + pin, Lenis smooth scroll) on a <canvas>: the clip\'s frames are extracted in the browser (hidden muted playsinline video, seek frame by frame, createImageBitmap, about 48 frames per clip, 640px wide on phones and 960px on desktop) and scroll progress picks the frame; while frames load, a smoothed video.currentTime fallback. Never switch the film off below a breakpoint; only prefers-reduced-motion shows stills.',
  'Every section moves: headline mask reveals, pinned sticky stories, count-ups, a pinned horizontal gallery, depth parallax and staggered 3D-tilt reveals; no static section except legal. Animate transform and opacity only (60fps).',
  'Placeholders for the customer\'s own photos are labelled; the mock-up itself ships with the film so it already looks finished.'
];

// Apple-grade standard (Ryan, 2026-09-27: "as premium as Apple videos but as a website … premium golden website with
// parallax, with 3D videos … many types of parallax video scrollings").
var WB_APPLE = 'Apple-grade: one idea per screen, huge confident headlines in few words, generous breathing room, the product or the business as the hero under cinematic light, pixel-precise spacing and alignment, silky 60fps scrolling (GSAP ScrollTrigger with Lenis smooth scroll), a premium finish everywhere.';
// The scroll-effect library the creator picks from; every effect is built from the Kling film and posters and serves the sale.
var WB_SCROLL_EFFECTS = {
  film_scrub: 'Pinned hero film on every screen size: the Kling film fills the screen and plays forward as the visitor scrolls (canvas frame scrubbing driven by GSAP ScrollTrigger, frames extracted in the browser; never turned off on phones)',
  product_reveal: 'Product reveal: the hero subject stays pinned and turns, zooms or opens into an exploded view as the visitor scrolls, like an Apple product page (a real 3D model made by Higgsfield when the build provides one, rendered with model-viewer or react-three-fiber)',
  zoom_through: 'Zoom-through: the camera pushes into an image until it becomes the next section',
  depth_layers: 'Depth parallax: foreground, subject and background layers move at different speeds with a slight 3D perspective tilt',
  sticky_story: 'Sticky scrollytelling: the visual stays pinned while short benefit lines change beside it, step by step',
  text_mask: 'Text-mask reveal: a huge headline with the film playing inside the letters that opens to full screen',
  horizontal_gallery: 'Horizontal gallery: a pinned section that scrolls sideways through products, rooms or projects',
  split_reveal: 'Split reveal: two panels slide apart to reveal the offer and its call to action',
  stat_counters: 'Proof in motion: numbers and review stars count up and cards scale in as they enter (placeholders until confirmed)',
  walkthrough: 'Cinematic home walkthrough: the Kling film moves from the street and the facade through the front door into each room as the visitor scrolls, the room name and its features appear beside it, and a floor-plan mini-map highlights where the visitor is',
  light_sweep: 'Premium golden finish: a slow light sweep across the hero type and accents; champagne-gold accents for premium and luxury brands, otherwise the brand colours'
};
var WB_EFFECTS_BY_CATEGORY = {
  automotive: ['film_scrub', 'product_reveal', 'depth_layers', 'horizontal_gallery', 'light_sweep'],
  property: ['walkthrough', 'film_scrub', 'zoom_through', 'depth_layers', 'horizontal_gallery', 'light_sweep'],
  healthcare: ['film_scrub', 'zoom_through', 'sticky_story', 'stat_counters', 'split_reveal'],
  food_beverage: ['film_scrub', 'product_reveal', 'text_mask', 'horizontal_gallery', 'depth_layers', 'light_sweep'],
  retail: ['film_scrub', 'product_reveal', 'horizontal_gallery', 'text_mask', 'light_sweep'],
  beauty: ['film_scrub', 'text_mask', 'depth_layers', 'sticky_story', 'light_sweep'],
  technology: ['film_scrub', 'product_reveal', 'sticky_story', 'stat_counters', 'split_reveal'],
  construction: ['film_scrub', 'zoom_through', 'sticky_story', 'horizontal_gallery', 'stat_counters'],
  other: ['film_scrub', 'depth_layers', 'sticky_story', 'text_mask', 'stat_counters', 'light_sweep']
};
/** The Apple-style scroll effects for this business (5–6, always starting with the pinned film). */
function wbEffectsFor(category) {
  var keys = WB_EFFECTS_BY_CATEGORY[category] || WB_EFFECTS_BY_CATEGORY.other;
  return keys.map(function (k) { return { key: k, text: WB_SCROLL_EFFECTS[k] }; });
}

// ---- Luxury retail (Ryan, 2026-09-29: "make the website agent able to do all this for any retail luxury 10,000
// website"). The Full Master Cinematic Website Agent 2026 modules for watches (8), jewellery/luxury product (13),
// electronics (14) and furniture/interior (15), plus fashion and general luxury goods. Nothing here is a fact about
// the customer: generated products are illustrative until the customer supplies real photography, references or CAD.
var WB_LUXURY_KINDS = [
  ['watch', /\b(watch(es|maker|makers)?|timepieces?|horolog\w*|chronograph|tourbillon|wristwatch|rolex|omega|patek|audemars|tudor|breitling|iwc|hublot|richard mille|longines|grand seiko|tag heuer|panerai|vacheron)\b/i],
  ['jewellery', /\b(jewel(le)?ry|jewell?ers?|diamonds?|engagement rings?|wedding bands?|necklaces?|bracelets?|earrings?|pendants?|goldsmith|gemstones?|pearls?|fine jewel\w*|tiffany|bulgari|van cleef|chopard)\b/i],
  ['electronics', /\b(consumer electronics|electronics (store|shop|brand)|gadgets?|headphones?|earbuds?|hi-?fi|audio equipment|loudspeakers?|smartphones?|laptops?|cameras? (store|shop)|wearables?|smart home devices?)\b/i],
  ['furniture', /\b(furniture|sofas?|armchairs?|dining tables?|cabinetry|bespoke joinery|mattress(es)?|homeware|home d[eé]cor|lighting (design|store|showroom)|rugs?|carpets?)\b/i],
  ['fashion', /\b(fashion|couture|atelier|handbags?|leather goods|apparel|tailor(ing|s)?|bespoke suits?|sneakers?|eyewear|sunglasses|menswear|womenswear|boutique label)\b/i],
  ['luxury', /\b(luxury|luxe|high-end|haute|prestige|premium brand|fragrance|perfume|parfum|crystal|porcelain|fine wine|cigars?|yachts?)\b/i]
];
var WB_LUXURY_RE = new RegExp(WB_LUXURY_KINDS.map(function (k) { return k[1].source; }).join('|'), 'i');
/** The luxury retail kind from any text about the business, or null. */
function wbLuxuryKind(text) {
  var t = String(text || '');
  for (var i = 0; i < WB_LUXURY_KINDS.length; i++) if (WB_LUXURY_KINDS[i][1].test(t)) return WB_LUXURY_KINDS[i][0];
  return null;
}
/** The luxury kind of a brief (retail only), from the brief's own words. */
function wbKindOf(brief, input) {
  if (!brief || brief.industry_category !== 'retail') return null;
  return wbLuxuryKind([brief.industry, brief.business_name, brief.content_notes, brief.audience, input ? wbText(input) : ''].join(' '));
}
var WB_LUXURY_NOUN = { watch: 'watch', jewellery: 'piece of fine jewellery', electronics: 'device', furniture: 'signature furniture piece', fashion: 'signature piece', luxury: 'signature product' };
// The PDF's industry modules, verbatim in substance.
var WB_LUXURY_STORY = {
  watch: 'Watch (doctrine 8): reveal → macro dial → controlled 360/orbit → accurate component explosion → callouts → reassembly + purchase CTA. Reverse: reassembly → explosion → orbit → reveal. p=0 assembled hero; .2 macro; .4 rotation; .55 separation begins; .75 maximum accurate exploded state; .88 reassembly; 1 assembled alternate hero + CTA. Use the supplied accurate watch model/reference; never invent parts; DOM/SVG labels; mobile: pre-rendered reversible sequence. Without the customer\'s CAD or an accurate model there is NO exploded view: that chapter becomes the macro craft film.',
  jewellery: 'Jewellery (doctrine 13): material reveal → 360 → macro craft (setting, stones, polish) → optional accurate construction view → lifestyle → purchase / private appointment. Reverse restores the piece. Actual geometry/reference only; studio-light gradients mimic reflections and caustics; construction views only if the construction is real.',
  electronics: 'Electronics/device (doctrine 14): hero → 360 → accurate internal layers → verified feature callouts → product/UI → reassembly → buy/demo. Real CAD/3D/reference only; never invent chips, sensors, battery or internals; without real internals, skip the layer chapter and show verified features on the exterior. Scroll drives separation and camera; reverse reassembles exactly.',
  furniture: 'Furniture/interior (doctrine 15): room reveal → hero product/material → real joinery/construction → configuration/transformation → quote/shop/showroom visit. Rotate or reveal materials, or transition room states; never fabricate dimensions or materials; reverse restores the configuration.',
  fashion: 'Fashion/leather goods (doctrine 13 applied to fashion): material reveal (fabric, leather, hardware) → craft (stitching, edge finishing, fit) → the piece in motion → lifestyle editorial → shop / fitting appointment. Real materials only; no unrealistic retouching; reverse restores the piece.',
  luxury: 'Luxury product (doctrine 13): material reveal → 360 → macro craft → optional accurate construction view → lifestyle → purchase / private appointment. Reverse restores the product. Actual geometry/reference only; studio-light gradients mimic reflections.'
};
// Quiet luxury, never "retail loud": no discount strips, countdowns or pushy pop-ups.
var WB_DESIGN_LUXURY = { personality: 'quiet luxury, precise, sensory, heritage', typography: 'a high-contrast didone or refined display serif for headlines (e.g. Bodoni Moda, Cormorant, Canela-like) with a restrained grotesque for body (e.g. Inter Tight, Neue Haas-like); small caps labels with generous tracking', layout: 'one product per screen, vast negative space, editorial rhythm, pinned product chapters; never a discount strip, countdown timer or pop-up', imagery: 'the product under studio light as the hero, macro craft details, material textures, lifestyle only when real; generated products labelled illustrative until the customer supplies photography', motion: 'slow, weighted, scroll-scrubbed reveals, 360 turns and macro light sweeps; reversible', palette: 'a 3-5 colour material palette: deep base (onyx, graphite or warm ivory), metal highlight (champagne gold, platinum or bronze), soft shadow, one material accent, one CTA accent; gradients behave like studio light' };
var WB_LUXURY_PAGES = {
  base: [['Home', 'The signature piece revealed, the one action (book a private viewing or discover the collection)'], ['Collections', 'Every collection as an editorial chapter'], ['Product Detail', '360 view, macro craft details, materials and specifications [CLIENT TO CONFIRM], price on request [CLIENT TO CONFIRM], enquire or reserve'], ['Craftsmanship', 'How it is made: materials, hands, time; real process only']],
  watch: [['Servicing & Warranty', 'Service, warranty and authenticity [CLIENT TO CONFIRM]'], ['Heritage', 'The maison or boutique story [CLIENT TO PROVIDE]']],
  jewellery: [['Bespoke & Engagement', 'Custom design journey, ring sizing, engraving [CLIENT TO CONFIRM]'], ['Diamond & Material Guide', 'Certification and materials explained [CLIENT TO CONFIRM]']],
  electronics: [['Features', 'Each verified feature as a benefit'], ['Specs & Compare', 'Verified specifications only [CLIENT TO CONFIRM]']],
  furniture: [['Materials & Finishes', 'Woods, fabrics, leathers and finishes [CLIENT TO CONFIRM]'], ['Projects & Spaces', 'Real installed spaces [CLIENT TO PROVIDE]']],
  fashion: [['Lookbook', 'The season as an editorial story'], ['Fit & Fitting', 'Size guide and fitting appointments [CLIENT TO CONFIRM]']],
  luxury: [['Heritage', 'The brand story [CLIENT TO PROVIDE]'], ['Care & Authenticity', 'Care, warranty and authenticity [CLIENT TO CONFIRM]']],
  tail: [['Book a Private Viewing', 'Date, time, boutique, piece of interest, contact'], ['Journal & Press', 'Stories and press [CLIENT TO PROVIDE]'], ['Boutique & Contact', 'Address, hours, map, WhatsApp, concierge form']]
};
function wbLuxuryPages(kind) {
  return WB_LUXURY_PAGES.base.concat(WB_LUXURY_PAGES[kind] || WB_LUXURY_PAGES.luxury, WB_LUXURY_PAGES.tail);
}
var WB_LUXURY_HOME = 'the signature piece revealed from darkness with one CTA (book a private viewing or discover the collection) and a discreet trust line → the craft chapter (macro, materials) → the 360 product chapter → collection highlights as an editorial gallery → the maison story → the service promise (authenticity, warranty, after-care [CLIENT TO CONFIRM]) → the boutique and private viewing → press and client words [CLIENT TO PROVIDE] → questions answered → final CTA → footer with boutique address, hours, WhatsApp and socials';
// Three materially different art directions per luxury kind (doctrine 4: "CREATIVE: 3 materially different art directions").
var WB_LUXURY_DIRECTIONS = {
  watch: [['Noir Atelier', 'onyx base, champagne-gold highlight, warm shadow, sapphire accent', 'didone display + precise grotesque', 'the watch floats in darkness; light sweeps reveal the case; macro dial chapters'], ['Salon Ivory', 'warm ivory base, bronze highlight, soft taupe shadow, deep green accent', 'refined serif + humanist sans', 'daylight salon, the watch on travertine, calm editorial rhythm'], ['Graphite Precision', 'graphite base, platinum highlight, cool shadow, signal-orange CTA', 'technical grotesque + mono labels', 'engineering precision: orbit, callouts and measured grids']],
  jewellery: [['Lumière', 'midnight-black base, diamond-white highlight, soft grey shadow, blush accent', 'high-contrast didone + light grotesque', 'caustic light and sparkle on black; slow macro turns'], ['Maison Rose', 'rose-ivory base, rose-gold highlight, warm shadow, deep burgundy accent', 'elegant serif italic + clean sans', 'soft skin light, the piece worn, romantic editorial'], ['Atelier Stone', 'warm stone base, yellow-gold highlight, charcoal shadow, emerald accent', 'classic serif + small caps', 'the bench and the hand: craft, tools and setting']],
  electronics: [['Studio Black', 'pure black base, cool white highlight, graphite shadow, one electric accent', 'geometric grotesque', 'the device from darkness, orbit and light sweeps'], ['Daylight Minimal', 'white base, silver highlight, soft shadow, one bold colour accent', 'neo-grotesque', 'airy product-on-white, exploded-free feature chapters'], ['Lifestyle Warm', 'warm grey base, brushed-metal highlight, deep shadow, amber accent', 'humanist sans', 'the device in real life, calm homes and desks']],
  furniture: [['Gallery Light', 'warm white base, oak highlight, soft shadow, terracotta accent', 'editorial serif + grotesque', 'sunlit rooms, the piece as sculpture'], ['Dark Timber', 'deep walnut base, brass highlight, warm shadow, olive accent', 'classic serif', 'evening interiors, joinery macro, lamp light'], ['Architectural Grey', 'concrete grey base, steel highlight, cool shadow, cobalt accent', 'architectural grotesque', 'plans morph into rooms; modular configurations']],
  fashion: [['Runway Noir', 'black base, silver highlight, deep shadow, red CTA', 'condensed display + grotesque', 'fabric in motion, bold editorial crops'], ['Atelier Cream', 'cream base, camel highlight, soft shadow, navy accent', 'refined serif', 'the atelier: stitching, leather edges, fittings'], ['Gallery White', 'white base, black highlight, grey shadow, one seasonal accent', 'modern grotesque', 'gallery lookbook, pieces as art']],
  luxury: [['Noir Maison', 'onyx base, champagne highlight, warm shadow, deep jewel accent', 'didone + grotesque', 'the product from darkness under studio light'], ['Ivory Salon', 'ivory base, bronze highlight, taupe shadow, forest accent', 'refined serif + humanist sans', 'daylight salon, calm editorial'], ['Stone & Metal', 'warm stone base, platinum highlight, charcoal shadow, one CTA accent', 'architectural grotesque', 'material macro and precise orbits']]
};
/** Doctrine 4 "CREATIVE": three materially different directions, the first chosen (luxury retail by kind; others from the category). */
function wbArtDirections(brief, input) {
  var kind = wbKindOf(brief, input);
  if (kind) return (WB_LUXURY_DIRECTIONS[kind] || WB_LUXURY_DIRECTIONS.luxury).map(function (d) { return { name: d[0], palette: d[1], typography: d[2], story_mood: d[3] }; });
  var d0 = brief.design_direction || wbDesignFor(brief.industry_category);
  return [
    { name: 'Signature', palette: d0.palette, typography: d0.typography, story_mood: d0.brand_personality },
    { name: 'Editorial Light', palette: 'warm white base, one deep brand colour, soft shadow, one CTA accent', typography: 'a refined serif with a clean grotesque', story_mood: 'calm, spacious, magazine-like chapters' },
    { name: 'Cinematic Dark', palette: 'deep brand-tinted base, metallic highlight, warm shadow, one CTA accent', typography: 'a bold display face with a quiet sans', story_mood: 'the film carries the page; light and depth' }
  ];
}
/** Doctrine 22: the Higgsfield shot package for one chapter (every field the PDF lists). */
function wbShot(o) {
  return {
    camera: o.camera || 'cinema camera on a slider', lens: o.lens || '50mm', framing: o.framing || 'subject right of centre, left third clear for text',
    lighting: o.lighting || 'soft key with a rim light', grade: o.grade || 'natural, rich, filmic', movement: o.movement || 'one slow push-in',
    speed: o.speed || 'slow and steady', start_frame: o.start_frame || 'this chapter\'s poster', end_frame: o.end_frame || 'the next chapter\'s poster composition',
    continuity: o.continuity || 'same light direction, colour grade and subject scale as the neighbouring chapters', duration_s: o.duration_s || 5, aspect_ratio: '16:9',
    safe_text_zone: o.safe_text_zone || 'left third', mobile_crop: o.mobile_crop || '9:16 centred on the subject', negative: o.negative || 'no text, logos, watermarks, plates, faces, extra products, invented parts, fast cuts'
  };
}
var WB_LUXURY_SHOTS = {
  watch: [
    { key: 'hero', prompt: 'A luxury wristwatch emerging from darkness on a black stone plinth, a slow light sweep across the polished case, sapphire crystal and dial', shot: { lens: '100mm macro', lighting: 'black studio, one moving strip light and a warm rim', grade: 'deep blacks, champagne highlights', movement: 'very slow push-in with a light sweep', framing: 'watch right of centre at a three-quarter angle, left third dark' } },
    { key: 'section', prompt: 'Extreme macro across a luxury watch dial: the hands, applied indices and sunray finish catching light', shot: { lens: '100mm macro with a probe feel', lighting: 'raking light that travels across the dial', movement: 'slow lateral glide across the dial', grade: 'rich metal tones, soft bokeh' } },
    { key: 'detail', prompt: 'The same luxury watch on a wrist in warm evening light at a Singapore rooftop, city lights softly out of focus, face not visible', shot: { lens: '85mm', lighting: 'golden-hour key with city bokeh', movement: 'slow orbit around the wrist', framing: 'wrist and watch centred low, sky above for text', negative: 'no faces, no logos on the dial, no text' } }
  ],
  jewellery: [
    { key: 'hero', prompt: 'A fine jewellery piece (diamond ring or necklace) on black velvet, brilliant caustic sparkle as a light sweeps across it', shot: { lens: '100mm macro', lighting: 'black studio, pinpoint lights for fire and brilliance', movement: 'slow turn of the piece on a turntable', grade: 'deep black, diamond white, warm gold' } },
    { key: 'section', prompt: 'Macro of a jeweller\'s hands setting a stone at the bench, loupe and tools, warm lamp light, hands only', shot: { lens: '65mm macro', lighting: 'warm bench lamp', movement: 'slow push towards the setting', negative: 'no faces, no text, no brand marks' } },
    { key: 'detail', prompt: 'The piece worn on skin in soft window light, collarbone or hand only, elegant and calm', shot: { lens: '85mm', lighting: 'soft window light', movement: 'gentle drift and rack focus', negative: 'no faces, no retouched skin, no text' } }
  ],
  electronics: [
    { key: 'hero', prompt: 'A premium consumer device emerging from darkness, a light sweep along its brushed metal edges', shot: { lens: '90mm', lighting: 'black studio, moving strip light', movement: 'slow orbit of the device', grade: 'cool neutrals, crisp highlights', negative: 'no invented internals, no text, no logos' } },
    { key: 'section', prompt: 'The same device at a hero angle on a clean surface, materials and finish in detail, soft reflections', shot: { lens: '100mm macro', lighting: 'soft top light with edge reflections', movement: 'slow slide along the device' } },
    { key: 'detail', prompt: 'The device in use in a calm, modern home in Singapore, hands only, soft daylight', shot: { lens: '50mm', lighting: 'soft daylight', movement: 'slow push-in', negative: 'no faces, no on-screen text, no logos' } }
  ],
  furniture: [
    { key: 'hero', prompt: 'A signature designer furniture piece in a sunlit, minimal room, long shadows across a stone floor', shot: { lens: '35mm', lighting: 'low sun through tall windows', movement: 'slow dolly towards the piece', grade: 'warm naturals' } },
    { key: 'section', prompt: 'Macro of the furniture joinery and material: wood grain, a precise joint, leather stitching or fabric weave', shot: { lens: '100mm macro', lighting: 'raking side light', movement: 'slow glide along the joint' } },
    { key: 'detail', prompt: 'The same piece styled in an evening living room, lamp light, calm and lived-in, no people', shot: { lens: '35mm', lighting: 'warm lamp light at dusk', movement: 'slow orbit' } }
  ],
  fashion: [
    { key: 'hero', prompt: 'Luxury fabric or leather moving slowly in dark studio light, texture and sheen revealed', shot: { lens: '85mm', lighting: 'black studio, soft top light', movement: 'slow motion drift of the material', grade: 'rich blacks, deep colour' } },
    { key: 'section', prompt: 'Atelier macro: hand stitching, leather edge finishing and hardware being fitted, hands only', shot: { lens: '65mm macro', lighting: 'warm workbench light', movement: 'slow push-in', negative: 'no faces, no brand marks, no text' } },
    { key: 'detail', prompt: 'An editorial lifestyle shot of the finished piece worn in Singapore at dusk, cropped so no face is visible', shot: { lens: '85mm', lighting: 'blue-hour ambient with a warm key', movement: 'slow tracking shot', negative: 'no faces, no logos, no text' } }
  ],
  luxury: [
    { key: 'hero', prompt: 'A luxury product revealed from darkness on a stone plinth, a slow light sweep across its materials', shot: { lens: '100mm macro', lighting: 'black studio, moving strip light, warm rim', movement: 'slow push-in with a light sweep', grade: 'deep blacks, metal highlights' } },
    { key: 'section', prompt: 'Macro craft details of the same product: materials, finishing and the maker\'s hand, hands only', shot: { lens: '100mm macro', lighting: 'raking warm light', movement: 'slow glide' } },
    { key: 'detail', prompt: 'The product in its world: an elegant Singapore interior at dusk, calm and aspirational, no people', shot: { lens: '50mm', lighting: 'warm evening interior', movement: 'slow orbit' } }
  ]
};
var WB_LUXURY_SECTIONS = ['reveal: the signature piece and the one action', 'craft: materials and making', 'lifestyle and the boutique: book a private viewing'];
// Design intelligence: a defensible visual direction per business category. The model may refine
// these from the customer's words; the fallback uses them as-is. Nothing here is a fact about the customer.
var WB_DESIGN = {
  professional_services: { personality: 'credible, precise, calm', typography: 'a refined serif for headings with a neutral grotesque for body (e.g. Fraunces + Inter)', layout: 'editorial: generous whitespace, asymmetric two-column sections, a quiet hero with one sentence and one action', imagery: 'real office, people at work, documents and process; no handshake stock photos', motion: 'subtle reveal on scroll, nothing decorative', palette: 'ink and paper neutrals with one deep accent (forest, oxblood or navy used as text, not as a gradient)' },
  beauty: { personality: 'luxurious, warm, sensory', typography: 'high-contrast display serif for headings (e.g. Cormorant / Playfair) with a light sans body', layout: 'image-led with full-bleed photography, thin rules, treatments as an elegant menu', imagery: 'skin, texture, light, the actual salon/clinic; muted, warm grading', motion: 'slow crossfades and soft parallax on hero imagery', palette: 'warm neutrals (sand, cream, blush) with one dark accent' },
  property: { personality: 'premium, trustworthy, aspirational', typography: 'wide geometric sans for headings (e.g. Manrope / DM Sans) with tabular numerals for prices and sizes', layout: 'listing grid with strong photography, map-first search, agent profile block', imagery: 'real listings and neighbourhoods, wide architectural shots', motion: 'image galleries and hover lift on listing cards only', palette: 'charcoal and off-white with a single warm metallic accent' },
  technology: { personality: 'clear, confident, modern', typography: 'clean grotesque throughout (e.g. Inter / Geist), monospace for technical detail', layout: 'product-first: a real product visual in the hero, then how it works step by step', imagery: 'product screenshots and diagrams, not abstract 3D shapes', motion: 'purposeful: a product walkthrough or animated diagram', palette: 'light, mostly white with one saturated accent and dark type; no gradients' },
  consulting: { personality: 'authoritative, thoughtful, human', typography: 'serif headings with a humanist sans body', layout: 'long-form editorial with pull quotes, case studies as narratives, a clear engagement process', imagery: 'the consultants themselves, whiteboards, client sites', motion: 'minimal', palette: 'deep neutral (graphite or navy as text) on warm white with a restrained accent' },
  retail: { personality: 'vibrant, friendly, product-obsessed', typography: 'bold sans headings with a readable body, clear price typography', layout: 'merchandised: featured collections, product grid, promotions as a strip not a popup', imagery: 'the actual products on clean backgrounds plus lifestyle context', motion: 'product hover states and quick-view', palette: 'derived from the products/brand; high contrast for prices and buttons' },
  education: { personality: 'encouraging, structured, credible', typography: 'friendly rounded sans for headings with a highly legible body', layout: 'programmes as clear cards with outcomes, schedule and enrolment steps', imagery: 'real classrooms, students, instructors', motion: 'light', palette: 'one confident primary colour with plenty of white and dark type' },
  home_services: { personality: 'dependable, local, straightforward', typography: 'sturdy sans headings, large tap targets, phone number always visible', layout: 'mobile-first: what we do, service area, proof, call/WhatsApp buttons pinned', imagery: 'the crew, the vans, before/after work photos', motion: 'none beyond feedback states', palette: 'one strong brand colour, dark text, white background' },
  b2b: { personality: 'competent, specific, results-focused', typography: 'neutral sans with strong hierarchy and tabular numerals', layout: 'problem → solution → proof → process; capability pages per service line', imagery: 'facilities, equipment, team, real outputs', motion: 'restrained', palette: 'industrial neutrals with one signal colour' },
  local_business: { personality: 'welcoming, genuine, nearby', typography: 'warm sans, larger body text', layout: 'single clear path: what, where, when, how to contact; map and hours above the fold on mobile', imagery: 'the actual shop, owners, products', motion: 'none needed', palette: 'drawn from the shop front or logo' },
  food_beverage: { personality: 'appetising, lively, textured', typography: 'characterful display face for headings with a simple body', layout: 'menu-first, photography-heavy, reservations/orders one tap away', imagery: 'the food and the room, shot warm', motion: 'gentle image reveals', palette: 'rich, from the cuisine (deep greens, terracotta, cream)' },
  logistics: { personality: 'reliable, fast, transparent', typography: 'condensed sans headings, tabular numerals for tracking numbers and times', layout: 'action-first: quote and tracking forms in the hero, coverage map, process timeline', imagery: 'fleet, warehouse, real operations', motion: 'a tracking-timeline animation, otherwise minimal', palette: 'dark text on white with one high-visibility accent' },
  construction: { personality: 'solid, capable, proven', typography: 'strong condensed or geometric sans for headings (e.g. Barlow Condensed / Archivo) with a sturdy grotesque body, tabular numerals for project sizes and dates', layout: 'project-led: full-bleed hero of a real site or finished build with one action (Request a quote / Book a site visit); capabilities by trade; project portfolio with scope and location; process from tender to handover; safety and accreditations as placeholders; quote form above the fold on mobile', imagery: 'cinematic photography of sites, structures, machinery and finished buildings at golden hour, crews seen from behind or at distance with PPE; no clip-art hard hats', motion: 'slow parallax on site photography, a scroll-driven project timeline, before/after sliders on finished work', palette: 'concrete, steel and charcoal neutrals with one safety-signal accent (high-vis orange or yellow) used for actions only' },
  automotive: { personality: 'cinematic, premium, exhilarating', typography: 'wide geometric display sans for headings (e.g. Manrope / Sora) with a clean grotesque body (e.g. Inter), tabular numerals for specs', layout: 'film-like: full-bleed hero of the car with a cinematic gradient overlay and one action (Book a test drive); model showcase with large imagery and horizontal scroll; showroom and service sections with photography; team; booking; WhatsApp bar on mobile', imagery: 'cinematic photography of the actual models and showroom (dusk light, wet asphalt reflections, studio rim light); generated hero and section imagery until the dealership supplies its own; no clip-art cars', motion: 'ken-burns on the hero, parallax on section imagery, staggered reveal, hover zoom on model cards', palette: 'deep charcoal into midnight blue gradients with a warm metallic (champagne / brushed steel) accent and bright white type; colour comes from the photography, never flat black panels' },
  healthcare: { personality: 'clinical, calm, reassuring', typography: 'clean humanist sans (e.g. Source Sans / Nunito Sans) with excellent legibility, larger body size', layout: 'patient-first: doctors, treatments, locations and appointment booking within one scroll; information architecture over decoration', imagery: 'the real clinic, real practitioners (with consent), clean interiors; no stock models in white coats', motion: 'minimal; never on medical content', palette: 'soft neutrals with one calm accent (teal, sage or deep blue as text/buttons); high contrast for readability' },
  other: { personality: 'clear, credible, specific to the business', typography: 'a deliberate pairing chosen for the brand, not a default', layout: 'intentional hierarchy: one message, one action per section', imagery: 'the actual business only', motion: 'only where it helps', palette: 'chosen from the brand or business, never a default gradient' }
};

var WB_QA_BASE = ['Desktop and mobile responsiveness (375px, 768px, 1280px)', 'Navigation: every link works, active states, no dead menu items', 'Spacing and rhythm consistent across sections', 'Typography hierarchy: one display face, one body face, sizes on a scale', 'Colour contrast meets WCAG AA for text and buttons', 'Accessibility basics: alt text, focus states, labelled form fields, semantic headings', 'No broken links or images', 'Forms submit to the placeholder endpoint and show a success state', 'Primary call to action visible above the fold on mobile', 'Image quality and relevance (no irrelevant stock photos)', 'Copy accuracy: every fact traces to the customer or is a labelled [PLACEHOLDER]', 'Performance: images sized/compressed, no layout shift', 'SEO fundamentals: title, description, one H1 per page, sitemap', 'Metadata and social preview set', 'Contact details present (or placeholders) in header/footer', 'Brand consistency across pages', 'Visual hierarchy: the eye lands on the one thing that matters', 'Animations purposeful and not distracting', 'No prices, guarantees, awards, testimonials or client logos that the customer did not supply', 'No placeholder content left unlabelled', 'None of the generic AI patterns (' + WB_ANTI_GENERIC.slice(0, 3).join('; ') + ', …)'];
var WB_QA_MEDICAL = ['Medical content verification: every credential, specialty, treatment and outcome statement marked [VERIFY WITH CLINIC] until confirmed', 'No fabricated success rates, testimonials, certifications or treatment outcomes', 'Appropriate medical disclaimer on treatment pages (information, not diagnosis)', 'Privacy notice for patient information and forms', 'Advertising and claims flagged for jurisdiction-specific compliance review before publishing', 'Doctor profiles show only supplied credentials and registration details'];
var WB_MEDICAL_CONTENT_RULES = ['Never fabricate doctor qualifications, medical claims, success rates, testimonials, certifications or treatment outcomes.', 'Mark every missing medical fact [VERIFY WITH CLINIC]; the customer verifies before anything is shown to patients.', 'Include an information-only medical disclaimer and a privacy notice for patient forms.', 'Advertising claims must pass a jurisdiction-specific compliance review before publishing.', 'Language: reassuring and plain; no fear-based or superlative claims.'];
var WB_SME_CONTENT_RULES = ['Every fact not given by the customer is a clearly marked [PLACEHOLDER].', 'No invented testimonials, awards, prices, client logos or delivery dates.', 'Copy is specific to this business: name the audience, the service and the outcome in their words.'];

function wbStr(v, max) {
  if (v === undefined || v === null) return null;
  var s = String(v).replace(/\s+/g, ' ').trim();
  if (!s) return null;
  return max && s.length > max ? s.slice(0, max) : s;
}
function wbStrArr(v, max) {
  if (!Array.isArray(v)) return [];
  var out = [];
  for (var i = 0; i < v.length && out.length < (max || 20); i++) { var s = wbStr(v[i], 240); if (s && out.indexOf(s) === -1) out.push(s); }
  return out;
}
function wbBoolOrNull(v) { return v === true || v === false ? v : null; }

// Everything the customer actually said, oldest first, plus the sales agent's summary.
function wbText(input) {
  input = input || {};
  var parts = [];
  var conv = Array.isArray(input.conversation) ? input.conversation : [];
  for (var i = 0; i < conv.length; i++) if (conv[i] && conv[i].role === 'customer' && conv[i].content) parts.push(String(conv[i].content));
  if (input.message) parts.push(String(input.message));
  if (input.sales_summary) parts.push(String(input.sales_summary));
  return parts.join('\n');
}

var WB_MEDICAL_RE = /\b(doctor|doctors|dr\.?|clinic|clinics|dental|dentist|orthodont\w*|aesthetic (clinic|practice)|medical|physician|specialist|surgeon|surgery|healthcare|health care|hospital|physio(therapy)?|chiropract\w*|tcm|traditional chinese medicine|dermatolog\w*|paediatric\w*|pediatric\w*|gynae\w*|gynec\w*|cardiolog\w*|oncolog\w*|ophthalmolog\w*|optometr\w*|patients?)\b/i;
function wbDetectMode(text, industry) {
  var t = String(text || '') + ' ' + String(industry || '');
  return WB_MEDICAL_RE.test(t) ? 'medical' : 'sme';
}
var WB_CATEGORY_RULES = [
  ['healthcare', WB_MEDICAL_RE],
  ['automotive', /\b(dealership|car dealer|car showrooms?|automotive|vehicles?|test drive|bmw|mercedes|toyota|honda|audi|tesla|motors?|car workshop|auto)\b/i],
  ['beauty', /\b(salon|spa|beauty|nail|lash|brow|facial|hair(dress|cut|style)|barber|massage|wellness|aesthetic)\b/i],
  // Luxury retail (Ryan, 2026-09-29: "any retail luxury 10,000 website"): watches, jewellery, electronics, furniture,
  // fashion and luxury goods are retail, checked before food ("kitchen"), construction and property.
  ['retail', WB_LUXURY_RE],
  // Construction before property: "main contractor for condos" is a builder, not an estate agent.
  ['construction', /\b(construction|builders?|building contractor|main contractor|general contractor|civil (engineering|works)|design (and|&) build|site works|scaffold\w*|excavat\w*|piling|steel structure|structural works|a&a works|fit-?out)\b/i],
  ['property', /\b(property|properties|real estate|realtor|condo(minium)?s?|hdb|landed|listings?|tenant|landlord|rental|villas?|bungalows?|penthouses?|apartments?|show ?flats?|new launch(es)?|property developer|houses? for (sale|rent)|interior design(er|ers)?)\b/i],
  ['food_beverage', /\b(restaurant|cafe|café|coffee|kopi|kopitiam|tea|bubble tea|bakery|catering|hawker|bar\b|bistro|kitchen|food|menu|f&b|dessert|juice)\b/i],
  ['logistics', /\b(logistic\w*|delivery|deliveries|courier|freight|shipping|shipment|parcel|warehouse|driver|fleet|last.mile)\b/i],
  ['home_services', /\b(plumb\w*|electric(ian|al)s?|aircon|air-con|renovat\w*|contractors?|cleaning|pest|handyman|movers?|moving|landscap\w*|roofing|roofers?|painters?)\b/i],
  ['education', /\b(tuition|tutor|school|academy|course|training centre|enrichment|students?|learning|kindergarten|preschool)\b/i],
  ['retail', /\b(retail|shop|store|boutique|products?|merchandise|e-?commerce|online store)\b/i],
  ['technology', /\b(software|saas|app\b|platform|startup|tech|it services|cybersecurity|cloud)\b/i],
  ['consulting', /\b(consult(ing|ants?|ancy)|advisory|advisor|strategy firm)\b/i],
  ['professional_services', /\b(law firm|lawyer|legal|accountant|accounting firm|audit|tax|architect|engineering firm|insurance|financial advis\w*|corporate secretar\w*)\b/i],
  ['b2b', /\b(manufactur\w*|factory|wholesale\w*|suppliers?|distributors?|industrial|b2b|oem|fabricat\w*|precision)\b/i]
];
function wbDetectCategory(text, industry) {
  var t = String(text || '') + ' ' + String(industry || '');
  for (var i = 0; i < WB_CATEGORY_RULES.length; i++) if (WB_CATEGORY_RULES[i][1].test(t)) return WB_CATEGORY_RULES[i][0];
  return /\b(local|neighbourhood|neighborhood|heartland)\b/i.test(t) ? 'local_business' : 'other';
}

function wbDetectSiteType(text) {
  if (/online store|e-?commerce|sell (products )?online|shop online|webshop|checkout/i.test(text)) return 'online_store';
  if (/landing page|\bfunnels?\b|squeeze page|opt-?in page|sales page|lead magnet/i.test(text)) return 'landing_page';
  if (/customer portal|client portal|patient portal|\bportal\b/i.test(text)) return 'portal';
  if (/web ?app|dashboard|log ?in|track(ing)? (shipments|orders|deliver)|booking system|online system/i.test(text)) return 'web_app';
  if (/web ?site|homepage|web ?page/i.test(text)) return 'business_website';
  return 'other';
}
function wbDetectGoal(text, mode) {
  if (mode === 'medical' && /book|appointment|consult/i.test(text)) return 'bookings';
  if (/book(ing)?|appointment|reserv/i.test(text)) return 'bookings';
  if (/sell|order|checkout|online store|e-?commerce/i.test(text)) return 'sales';
  if (/enquir|inquir|lead|quote|quotation|contact us|whatsapp|request/i.test(text)) return 'leads';
  if (/support|faq|help ?desk/i.test(text)) return 'support';
  if (/information|about us|showcase|portfolio|brochure/i.test(text)) return 'information';
  return mode === 'medical' ? 'bookings' : 'leads';
}
var WB_INTEGRATIONS = [
  [/whatsapp/i, 'WhatsApp click-to-chat'],
  [/book(ing)?|appointment|calendar|schedul/i, 'Appointment booking / calendar'],
  [/paynow|stripe|payment|pay online|checkout/i, 'Online payments'],
  [/\bcrm\b|hubspot|salesforce|pipedrive/i, 'CRM lead sync'],
  [/google maps|location|directions|outlet|clinic/i, 'Google Maps'],
  [/instagram|facebook|tiktok|social/i, 'Social media links'],
  [/track(ing)?|shipment|delivery status/i, 'Order / shipment tracking'],
  [/quote|quotation/i, 'Quote request form'],
  [/email/i, 'Email notifications']
];
function wbDetectIntegrations(text) {
  var out = [];
  for (var i = 0; i < WB_INTEGRATIONS.length; i++) if (WB_INTEGRATIONS[i][0].test(text)) out.push(WB_INTEGRATIONS[i][1]);
  return out;
}
// A full website per mock-up (Ryan, 2026-09-28: "a full website mock-up with high converting sales and everything"):
// an industry sitemap, plus the offer landing page and a thank-you page. Names are short; purposes steer the copy.
var WB_FULL_SITE = {
  food_beverage: [['Home', 'Signature dishes, why people come back, order or reserve'], ['Menu', 'Full menu by category with photos; prices [CLIENT TO PROVIDE]'], ['Our Story', 'The owners, the recipes, the neighbourhood'], ['Catering & Events', 'Packages for offices and parties, enquiry form'], ['Order & Delivery', 'Delivery partners, pick-up and WhatsApp orders'], ['Reviews', 'Customer reviews [CLIENT TO PROVIDE] and press'], ['Find Us', 'Address, opening hours, map, parking']],
  retail: [['Home', 'Featured products, the reason to buy here, shop now'], ['Shop', 'Products by category with filters'], ['Product Detail', 'Photos, benefits, specs, add to cart or enquire'], ['About', 'The brand story and promise'], ['Reviews', 'Customer reviews [CLIENT TO PROVIDE]'], ['Delivery & Returns', 'Delivery areas, times and the returns policy [CLIENT TO CONFIRM]'], ['FAQ', 'Buying questions answered'], ['Contact', 'Store address, hours, WhatsApp, form']],
  automotive: [['Home', 'The hero car, the brand promise, book a test drive'], ['Models & Inventory', 'Every model with specs and photos'], ['Model Detail', 'Gallery, specs, features, book a test drive'], ['Book a Test Drive', 'Date, time, model, contact details'], ['Service & Maintenance', 'Servicing, warranty support, book a service'], ['Financing & Trade-in', 'How financing and trade-in work (no rates) [CLIENT TO CONFIRM]'], ['About', 'The dealership, team and showroom'], ['Reviews', 'Owner reviews [CLIENT TO PROVIDE]'], ['Contact', 'Showroom address, hours, map, WhatsApp']],
  property: [['Home', 'Signature listing, the promise, book a viewing'], ['Listings', 'Properties with filters'], ['Listing Detail', 'Gallery, floor plan, location, book a viewing'], ['Services', 'Buy, sell, rent, invest'], ['About', 'The team and track record [CLIENT TO PROVIDE]'], ['Reviews', 'Client reviews [CLIENT TO PROVIDE]'], ['Book a Viewing', 'Date, property, contact details'], ['Contact', 'Office, WhatsApp, form']],
  beauty: [['Home', 'The signature treatment, the result clients want, book'], ['Treatments', 'All treatments by concern'], ['Treatment Detail', 'What it is, who it is for, what to expect, book'], ['Results Gallery', 'Before/after only with consent [CLIENT TO PROVIDE]'], ['About', 'The therapists and the studio'], ['Reviews', 'Client reviews [CLIENT TO PROVIDE]'], ['FAQ', 'Aftercare, safety, booking questions'], ['Book', 'Treatment, date, time, contact']],
  construction: [['Home', 'Flagship project, the promise, request a quote'], ['Services', 'Each service with scope and process'], ['Projects', 'Portfolio with photos and scope [CLIENT TO PROVIDE]'], ['Our Process', 'Consult → design → build → handover'], ['About', 'The company, licences and safety record [CLIENT TO PROVIDE]'], ['Reviews', 'Client reviews [CLIENT TO PROVIDE]'], ['FAQ', 'Timelines, permits, budgets (no prices)'], ['Get a Quote', 'Project type, size, location, timeline, contact']],
  home_services: [['Home', 'The job done right, fast response, get a quote'], ['Services', 'Each service with what is included'], ['Our Work', 'Before/after jobs [CLIENT TO PROVIDE]'], ['How It Works', 'Book → visit → fix → follow-up'], ['About', 'The team and licences [CLIENT TO PROVIDE]'], ['Reviews', 'Customer reviews [CLIENT TO PROVIDE]'], ['FAQ', 'Call-out, timing, warranty questions (no prices)'], ['Get a Quote', 'Job type, address, photos, contact']],
  technology: [['Home', 'The outcome the product delivers, book a demo'], ['Product', 'How it works, the main screens'], ['Features', 'Each feature as a benefit'], ['Use Cases', 'By industry or role'], ['Integrations', 'Tools it connects to [CLIENT TO CONFIRM]'], ['Customers', 'Case studies and logos [CLIENT TO PROVIDE]'], ['FAQ', 'Security, setup, support'], ['Book a Demo', 'Company, size, need, contact']],
  education: [['Home', 'The result students get, book a trial'], ['Programmes', 'Each course or class, level and schedule'], ['Programme Detail', 'Syllabus, outcomes, schedule, enrol'], ['Results', 'Student results [CLIENT TO PROVIDE]'], ['Teachers', 'Profiles and credentials [CLIENT TO PROVIDE]'], ['FAQ', 'Levels, schedules, make-up classes'], ['Book a Trial', 'Student level, subject, contact']],
  other: [['Home', 'Who you are, who you serve, the one thing a visitor should do'], ['Services', 'Each service with the outcome, what is included and the process'], ['How It Works', 'Three clear steps from enquiry to result'], ['About', 'The real story, team and credentials [CLIENT TO PROVIDE]'], ['Reviews & Results', 'Testimonials and results [CLIENT TO PROVIDE]'], ['FAQ', 'The buying questions and objections answered'], ['Contact', 'Enquiry form, WhatsApp, map, opening hours']]
};
var WB_FUNNEL_PAGES = [['Offer Landing Page', 'One offer, no navigation, the lead form above the fold (/offer)'], ['Thank You', 'Confirmation, what happens next, WhatsApp button (/thank-you)']];
/** The high-converting homepage, in order (Ryan, 2026-09-28). */
var WB_HOME_BLUEPRINT = 'hero with an outcome headline for this buyer, one primary CTA and a trust line → proof bar (rating, years, clients [CLIENT TO PROVIDE]) → the problem or desire in the buyer\'s words → the offer → benefits (not features) → how it works in 3 steps → showcase of the products/services → reviews [CLIENT TO PROVIDE] → objections answered (FAQ) → risk reducer (a free, no-obligation consultation or visit) → final CTA → footer with contact, hours, map link and socials';
var WB_FULLSITE_MARK = '=== FULL WEBSITE (build every page) ===';
function wbDefaultPages(siteType, goal, mode, category, kind) {
  if (mode === 'medical') {
    var med = [{ name: 'Home', purpose: 'Who the clinic is, the reassurance a patient needs, book an appointment' }, { name: 'Our Doctors', purpose: 'Doctor profiles: name, specialty, credentials [VERIFY WITH CLINIC], languages' }, { name: 'Treatments & Services', purpose: 'One section per treatment: what it is, who it is for, what to expect' }, { name: 'Clinic & Locations', purpose: 'Addresses, opening hours, map, parking, accessibility' }, { name: 'Book an Appointment', purpose: 'Booking form or link; phone and WhatsApp alternatives' }, { name: 'Patient Information & FAQ', purpose: 'First visit, fees policy placeholder, insurance, privacy notice, disclaimers' }, { name: 'Contact', purpose: 'Contact details and enquiry form' }];
    if (siteType === 'portal' || siteType === 'web_app') med.splice(5, 0, { name: 'Patient Portal (login)', purpose: 'Appointments and documents for registered patients' });
    return med.concat(WB_FUNNEL_PAGES.map(function (p) { return { name: p[0], purpose: p[1] }; })).slice(0, 12);
  }
  if (siteType === 'landing_page') return [{ name: 'Landing page', purpose: 'Single page: one specific promise, proof, how it works, one call to action' }];
  if (siteType === 'online_store') return [{ name: 'Home', purpose: 'Featured collections and the reason to buy here' }, { name: 'Shop', purpose: 'Product catalogue with categories and filters' }, { name: 'Product', purpose: 'Product detail, real photos, add to cart' }, { name: 'Cart & Checkout', purpose: 'Purchase flow' }, { name: 'About', purpose: 'Brand story in the owner\'s words' }, { name: 'Contact', purpose: 'Contact details and enquiry form' }];
  if (siteType === 'web_app' || siteType === 'portal') return [{ name: 'Home', purpose: 'What the service does, for whom, and how to start' }, { name: 'Login / Sign up', purpose: 'Customer accounts' }, { name: 'Dashboard', purpose: 'Main customer workspace' }, { name: 'Contact', purpose: 'Support and enquiries' }];
  var set = (category === 'retail' && kind) ? wbLuxuryPages(kind) : (WB_FULL_SITE[category] || WB_FULL_SITE.other);
  var pages = set.concat(WB_FUNNEL_PAGES).map(function (p) { return { name: p[0], purpose: p[1] }; });
  if (goal === 'bookings' && !pages.some(function (p) { return /book/i.test(p.name); })) pages.splice(pages.length - 3, 0, { name: 'Book', purpose: 'Appointment booking' });
  return pages.slice(0, 12);
}
function wbGuessBusinessName(input, text) {
  if (input.company_name) return wbStr(input.company_name, 160);
  var m = text.match(/\b(?:[Ww]e are|[Ww]e're|[Ii] run|[Ii] own|[Mm]y company is|[Oo]ur company is|company called|clinic called|[Oo]ur clinic is|[Ii]'m from|[Ii] am from|[Ii]'m [A-Z][a-z]+ from|[Ii] am [A-Z][a-z]+ from|calling from|[Tt]his is [A-Z][a-z]+ from|(?:[Ii]t'?s|[Ii]t is|[Ii]ts|[Ii]t) called|(?:[Ii]t'?s|[Ii]t is) named|[Nn]ame is|business called|shop called|store called|restaurant called)\s+([A-Z][\w&'.\- ]{2,60}?(?:Pte\.? Ltd\.?|Ltd\.?|LLP|Inc\.?|Co\.?|Clinic|Dental|Medical|Motors|Group|Agency|Studio)?)(?=[,.!?\n]| and | with | that | in | based |; |\s*$)/);
  return m ? wbStr(m[1], 160) : null;
}
function wbDesignFor(category, kind) { return (category === 'retail' && kind) ? WB_DESIGN_LUXURY : (WB_DESIGN[category] || WB_DESIGN.other); }
function wbQaChecklist(mode) { return mode === 'medical' ? WB_QA_BASE.concat(WB_QA_MEDICAL) : WB_QA_BASE.slice(); }
function wbContentRules(mode) { return mode === 'medical' ? WB_SME_CONTENT_RULES.concat(WB_MEDICAL_CONTENT_RULES) : WB_SME_CONTENT_RULES.slice(); }
function wbVerificationFor(mode, brief) {
  if (mode !== 'medical') return [];
  return ['Doctor names, qualifications and registration numbers', 'Specialties and treatments actually offered', 'Clinic addresses, opening hours and contact details', 'Any statement about outcomes, safety or success', 'Testimonials, certifications and affiliations', 'Fees and insurance information (never shown until confirmed)'];
}

/** Deterministic brief when the model is unavailable or returns garbage. Never invents facts. */
function wbFallbackBrief(input) {
  input = input || {};
  var text = wbText(input);
  var ex = (input.extracted && typeof input.extracted === 'object') ? input.extracted : {};
  var industry = wbStr(input.industry || ex.industry, 80);
  var mode = wbDetectMode(text, industry);
  var category = wbDetectCategory(text, industry);
  var siteType = wbDetectSiteType(text);
  if (siteType === 'other') siteType = 'business_website'; // a plain "build us a site" is a business website (Ryan, 2026-09-27)
  var goal = wbDetectGoal(text, mode);
  var integrations = wbDetectIntegrations(text);
  if (mode === 'medical' && integrations.indexOf('Appointment booking / calendar') === -1) integrations.unshift('Appointment booking / calendar');
  var businessName = wbGuessBusinessName(input, text);
  var kind = category === 'retail' ? wbLuxuryKind(text + ' ' + (industry || '')) : null;
  var pages = wbDefaultPages(siteType, goal, mode, category, kind);
  var d = wbDesignFor(category, kind);
  var features = [];
  if (goal === 'leads') features.push('Enquiry form that emails the owner');
  if (goal === 'bookings') features.push('Booking form with date and time');
  if (goal === 'sales') features.push('Product catalogue');
  if (mode === 'medical') features.push('Doctor profile cards', 'Treatment pages with information-only disclaimer', 'Privacy notice');
  features.push('Mobile-first responsive layout', 'Basic SEO (titles, descriptions, sitemap)');
  var missing = ['audience', 'style', 'existing_domain', 'logo_and_brand', 'content', 'examples', 'timeline', 'competitors', 'existing_website'];
  if (!businessName) missing.unshift('business_name');
  if (!industry) missing.unshift('industry');
  if (mode === 'medical') missing.push('doctor_profiles', 'treatments', 'clinic_locations', 'credentials');
  if (ex.decision_maker !== true && ex.decision_maker !== false) missing.push('decision_maker');
  var questions = [];
  if (!businessName) questions.push('What is the name of your ' + (mode === 'medical' ? 'clinic' : 'business') + ', and do you already have a domain or website?');
  if (mode === 'medical') questions.push('Which doctors and treatments should the site feature, and at which clinic locations?');
  else questions.push('Who is the website mainly for, and what should a visitor do first (enquire, book, buy)?');
  questions.push('Do you have a logo, brand colours, photos of your own, and any websites you admire?');
  var brief = {
    schema_version: WB_SCHEMA_VERSION,
    mode: mode,
    industry_category: category,
    site_type: siteType,
    business_name: businessName,
    industry: industry,
    audience: null,
    primary_goal: goal,
    design_direction: { brand_personality: d.personality, typography: d.typography, layout: d.layout, imagery: d.imagery, motion: d.motion, palette: d.palette, avoid: WB_ANTI_GENERIC.slice() },
    pages: pages,
    features: features,
    integrations: integrations,
    style: { tone: null, colours: null, references: [] },
    existing_assets: { domain: null, logo: null, brand_colours: null, content: null },
    content_rules: wbContentRules(mode),
    verification_required: wbVerificationFor(mode),
    qa_checklist: wbQaChecklist(mode),
    content_notes: wbStr(input.message, 600),
    questions_for_customer: questions.slice(0, 3),
    missing_information: missing,
    build_prompt: '',
    confidence: 0.35,
    reasoning: 'Deterministic fallback brief (' + WB_VERSION + '): mode, category, site type, goal and integrations inferred from the customer\'s own words; design direction is the standard for this category; pages and features are proposals, not customer statements.'
  };
  brief.build_prompt = wbBuildPrompt(brief, input);
  return brief;
}

function wbCoerce(b) {
  b = (b && typeof b === 'object' && !Array.isArray(b)) ? b : {};
  var pages = [];
  if (Array.isArray(b.pages)) for (var i = 0; i < b.pages.length && pages.length < 12; i++) {
    var p = b.pages[i];
    if (typeof p === 'string') { var n = wbStr(p, 60); if (n) pages.push({ name: n, purpose: '' }); }
    else if (p && typeof p === 'object') { var nm = wbStr(p.name, 60); if (nm) pages.push({ name: nm, purpose: wbStr(p.purpose, 200) || '' }); }
  }
  var style = (b.style && typeof b.style === 'object') ? b.style : {};
  var assets = (b.existing_assets && typeof b.existing_assets === 'object') ? b.existing_assets : {};
  var mode = WB_MODES.indexOf(b.mode) !== -1 ? b.mode : 'sme';
  var category = WB_CATEGORIES.indexOf(b.industry_category) !== -1 ? b.industry_category : (mode === 'medical' ? 'healthcare' : 'other');
  var dd = (b.design_direction && typeof b.design_direction === 'object') ? b.design_direction : {};
  var d = wbDesignFor(category);
  var conf = Number(b.confidence);
  return {
    schema_version: WB_SCHEMA_VERSION,
    mode: mode,
    industry_category: category,
    site_type: WB_SITE_TYPES.indexOf(b.site_type) !== -1 && b.site_type !== 'other' ? b.site_type : 'business_website',
    business_name: wbStr(b.business_name, 160),
    industry: wbStr(b.industry, 80),
    audience: wbStr(b.audience, 300),
    primary_goal: WB_GOALS.indexOf(b.primary_goal) !== -1 ? b.primary_goal : 'other',
    design_direction: {
      brand_personality: wbStr(dd.brand_personality, 160) || d.personality,
      typography: wbStr(dd.typography, 240) || d.typography,
      layout: wbStr(dd.layout, 300) || d.layout,
      imagery: wbStr(dd.imagery, 240) || d.imagery,
      motion: wbStr(dd.motion, 200) || d.motion,
      palette: wbStr(dd.palette, 200) || d.palette,
      avoid: WB_ANTI_GENERIC.slice()
    },
    pages: pages,
    features: wbStrArr(b.features, 20),
    integrations: wbStrArr(b.integrations, 15),
    style: { tone: wbStr(style.tone, 120), colours: wbStr(style.colours, 120), references: wbStrArr(style.references, 5) },
    existing_assets: { domain: wbBoolOrNull(assets.domain), logo: wbBoolOrNull(assets.logo), brand_colours: wbBoolOrNull(assets.brand_colours), content: wbBoolOrNull(assets.content) },
    content_rules: wbContentRules(mode),
    verification_required: wbVerificationFor(mode).concat(wbStrArr(b.verification_required, 10)).filter(function (x, i, a) { return a.indexOf(x) === i; }),
    qa_checklist: wbQaChecklist(mode),
    content_notes: wbStr(b.content_notes, 1200),
    questions_for_customer: wbStrArr(b.questions_for_customer, 3),
    missing_information: wbStrArr(b.missing_information, 24).filter(function (m) { return WB_MISSING.indexOf(m) !== -1; }),
    build_prompt: typeof b.build_prompt === 'string' ? b.build_prompt.trim() : '',
    confidence: isNaN(conf) ? 0 : Math.max(0, Math.min(1, conf)),
    reasoning: wbStr(b.reasoning, 800) || ''
  };
}

function wbValidate(b) {
  var errs = [];
  if (!b || typeof b !== 'object') return ['not_an_object'];
  if (b.schema_version !== WB_SCHEMA_VERSION) errs.push('schema_version');
  if (WB_MODES.indexOf(b.mode) === -1) errs.push('mode');
  if (WB_CATEGORIES.indexOf(b.industry_category) === -1) errs.push('industry_category');
  if (WB_SITE_TYPES.indexOf(b.site_type) === -1) errs.push('site_type');
  if (WB_GOALS.indexOf(b.primary_goal) === -1) errs.push('primary_goal');
  if (!b.design_direction || typeof b.design_direction !== 'object' || !b.design_direction.brand_personality) errs.push('design_direction');
  if (!Array.isArray(b.pages) || b.pages.length < 1) errs.push('pages_empty');
  if (!Array.isArray(b.features)) errs.push('features');
  if (!Array.isArray(b.integrations)) errs.push('integrations');
  if (!Array.isArray(b.missing_information)) errs.push('missing_information');
  if (!Array.isArray(b.qa_checklist) || b.qa_checklist.length < 5) errs.push('qa_checklist');
  if (!Array.isArray(b.questions_for_customer) || b.questions_for_customer.length > 3) errs.push('questions_for_customer');
  if (typeof b.confidence !== 'number' || b.confidence < 0 || b.confidence > 1) errs.push('confidence');
  if (typeof b.build_prompt !== 'string') errs.push('build_prompt');
  return errs;
}

/** Website Intelligence's plan (research_json.brief), trimmed to what the build needs. Null when there is none. */
function wbResearchPlan(input) {
  input = input || {};
  var r = input.research_json, obj = null;
  if (r && typeof r === 'object') obj = r;
  else if (typeof r === 'string' && r.trim()) { try { obj = JSON.parse(r); } catch (e) { obj = null; } }
  var b = obj && obj.brief && typeof obj.brief === 'object' ? obj.brief : null;
  if (!b) return null;
  var plan = {
    primary_cta: wbStr(b.primary_cta, 80), secondary_cta: wbStr(b.secondary_cta, 80), primary_conversion: wbStr(b.primary_conversion, 80),
    target_customers: wbStrArr(b.target_customers, 3), customer_objections: wbStrArr(b.customer_objections, 4),
    homepage_conversion_flow: wbStrArr(b.homepage_conversion_flow, 9), funnel_plan: wbStrArr(b.funnel_plan, 8),
    conversion_strategy: wbStrArr(b.conversion_strategy, 8), motion_3d_direction: wbStr(b.motion_3d_direction, 600),
    medical_visual_direction: wbStr(b.medical_visual_direction, 700), placeholders_required: wbStrArr(b.placeholders_required, 8),
    real_photos: wbRealPhotosFrom(b, obj)
  };
  var any = plan.real_photos.length || plan.primary_cta || plan.funnel_plan.length || plan.conversion_strategy.length || plan.motion_3d_direction || plan.medical_visual_direction || plan.homepage_conversion_flow.length;
  return any ? plan : null;
}
/** The customer's own photos Website Intelligence found online (Ryan, 2026-09-29: real photos first, generate only
 *  what cannot be found): [{ url, use, alt }] from the brief's "url | use | alt" lines, else the research's site images. */
function wbRealPhotosFrom(b, obj) {
  var out = [];
  (Array.isArray(b && b.real_photos) ? b.real_photos : []).forEach(function (l) {
    var p = String(l || '').split('|').map(function (x) { return x.trim(); });
    if (/^https?:\/\//i.test(p[0]) && out.length < 16) out.push({ url: p[0].slice(0, 400), use: (p[1] || 'gallery').toLowerCase(), alt: wbStr(p[2], 120) || '' });
  });
  if (!out.length && obj && obj.site && Array.isArray(obj.site.images) && !(obj.identity && obj.identity.confidence === 'low')) {
    obj.site.images.slice(0, 16).forEach(function (im, i) { if (im && /^https?:\/\//i.test(im.url)) out.push({ url: String(im.url).slice(0, 400), use: ['hero', 'section', 'detail'][i] || 'gallery', alt: wbStr(im.alt, 120) || '' }); });
    if (obj.site.logo) out.push({ url: String(obj.site.logo).slice(0, 400), use: 'logo', alt: 'logo' });
  }
  return out;
}
/** True when the plan carries a real anatomy visual (a specialty), not the general-practice "no anatomy renders" line. */
function wbHasAnatomy(plan) { return !!(plan && plan.medical_visual_direction && /photoreal/i.test(plan.medical_visual_direction) && !/no anatomy renders/i.test(plan.medical_visual_direction)); }
/** The strategy section appended to every Lovable prompt, so the build follows the research deterministically.
 *  Most important first (CTA, 3D motion, medical visual, funnel), every line capped, so a rich plan never pushes the
 *  3D and anatomy instructions out (execution 390: the section was cut after the objections line). */
function wbCap(s, n) { s = String(s || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; }
function wbStrategySection(plan) {
  if (!plan) return '';
  var L = [WB_STRATEGY_MARK];
  if (plan.primary_cta) L.push('- Primary CTA everywhere: "' + plan.primary_cta + '"' + (plan.secondary_cta ? '; secondary: "' + plan.secondary_cta + '"' : '') + '.');
  if (plan.real_photos && plan.real_photos.length) L.push(wbCap('- REAL PHOTOS of this business (CLIENT_REAL, found on its own website and profiles): use them FIRST — as the film chapter posters, in the galleries, product and about pages — load by URL (or copy into public/ if you can download), never label them illustrative; generated imagery only fills what these do not cover: ' + plan.real_photos.map(function (p) { return p.use + ' ' + p.url + (p.alt ? ' (' + p.alt + ')' : ''); }).join('; '), 1800));
  L.push(wbCap('- 3D parallax scroll film: ' + (plan.motion_3d_direction || 'a Kling film of the business scrubbed by the scroll, layered depth parallax'), 650) + ' Pin the hero and drive the film video currentTime from scroll progress (GSAP ScrollTrigger or framer-motion useScroll), layer the photos in depth parallax, reveal each section and CTA over the film; respect prefers-reduced-motion (show the posters).');
  if (wbHasAnatomy(plan)) L.push(wbCap('- Medical visual (hero): ' + plan.medical_visual_direction, 750) + ' It is the opening scene of the scroll film: the Kling anatomy video, full-bleed, scrubbed by the scroll with the still photo as its poster (until attached, a slot labelled [ANATOMY VIDEO]). Never a cartoon or low-poly model.');
  else if (plan.medical_visual_direction) L.push(wbCap('- Medical visuals: ' + plan.medical_visual_direction, 500));
  if (plan.funnel_plan.length) L.push(wbCap('- Funnel (build these pages and steps): ' + plan.funnel_plan.join(' | '), 1300));
  if (plan.homepage_conversion_flow.length) L.push(wbCap('- Homepage section order: ' + plan.homepage_conversion_flow.join(' > '), 1000));
  if (plan.conversion_strategy.length) L.push(wbCap('- High-conversion rules: ' + plan.conversion_strategy.join('; '), 1000));
  if (plan.target_customers.length) L.push(wbCap('- Buyer: ' + plan.target_customers.join('; '), 350));
  if (plan.customer_objections.length) L.push(wbCap('- Answer these objections on the page: ' + plan.customer_objections.join('; '), 450));
  if (plan.placeholders_required.length) L.push(wbCap('- Placeholders to label clearly: ' + plan.placeholders_required.join('; '), 400));
  return L.join('\n');
}
/** Every business website and clinic site gets the full sitemap: the model's pages first, missing ones added (max 12). */
function wbEnsureFullSite(brief) {
  if (!brief || !Array.isArray(brief.pages)) return false;
  if (brief.site_type !== 'business_website' && brief.mode !== 'medical') return false;
  var full = wbDefaultPages(brief.site_type, brief.primary_goal, brief.mode, brief.industry_category, wbKindOf(brief));
  var norm = function (n) { return String(n || '').toLowerCase().replace(/[^a-z]/g, ''); };
  var have = brief.pages.map(function (p) { return norm(p.name); });
  var added = false;
  full.forEach(function (p) {
    if (brief.pages.length >= 12) return;
    var k = norm(p.name);
    if (have.some(function (h) { return h === k || h.indexOf(k) !== -1 || k.indexOf(h) !== -1; })) return;
    brief.pages.push({ name: p.name, purpose: p.purpose }); have.push(k); added = true;
  });
  return added;
}
/** The protected FULL WEBSITE block: every page built, the selling homepage, sales elements site-wide, Apple-grade effects. */
function wbFullSiteSection(brief) {
  var L = [WB_FULLSITE_MARK];
  L.push('- Build EVERY page below completely with real, persuasive copy for this business (no empty, "coming soon" or lorem pages), working navigation between them, and a call to action closing every page: ' + brief.pages.map(function (p) { return p.name; }).join(', ') + '.');
  var kind = wbKindOf(brief);
  L.push('- Homepage, in this order: ' + (kind ? WB_LUXURY_HOME : WB_HOME_BLUEPRINT) + '.');
  if (kind) L.push('- Luxury retail at our top agency standard (Ryan, 2026-09-29): quiet, confident selling. The primary CTA is a private viewing or boutique appointment (plus enquire/reserve on every product); no discount strips, countdown timers, pop-ups or stock-urgency tricks; prices only as the customer supplies them, otherwise "Price on request" [CLIENT TO CONFIRM]. The customer\'s own photos (REAL PHOTOS) are used first and never labelled; only a generated ' + WB_LUXURY_NOUN[kind] + ' is labelled "Illustrative — [CLIENT TO PROVIDE product photography]"; never invent models, references, calibres, carats, materials, specifications or certifications. Concierge touches: WhatsApp concierge, boutique map, appointment form with preferred piece and time.');
  L.push('- On every page: a sticky header with the primary CTA, a sticky mobile CTA bar with WhatsApp, a short lead form (name, phone, what they need, PDPA consent) with a success state, a trust line next to every CTA. The Offer Landing Page has no navigation and the form above the fold; the Thank You page gives next steps and the WhatsApp button.');
  if (brief.industry_category === 'property') L.push('- Property (Ryan, 2026-09-28): the homepage opens on the cinematic walkthrough (outside to inside, room by room, a floor-plan mini-map); every listing and project page has its own gallery walkthrough and a Book a Viewing form. Label every generated image and film "Artist\'s impression"; real listing photos, prices, sizes, addresses and floor plans are [CLIENT TO PROVIDE]; follow CEA advertising rules, no misleading claims.');
  L.push('- ' + WB_APPLE + ' Scroll effects: ' + wbEffectsFor(brief.industry_category).map(function (e, i) { return (i + 1) + ') ' + e.text; }).join('; ') + '.');
  return wbCap(L.join('\n'), 4000);
}
// Ryan's Full Master Cinematic Website Agent 2026 (vault: Knowledge/Full Master Cinematic Website Agent 2026, 2026-09-29).
// Every build prompt carries the doctrine: a chapter story for the industry, one engine per chapter, a reversible
// scroll timeline, the Lovable scroll engine rules and the QA torture test.
var WB_DOCTRINE_MARK = 'MASTER ORCHESTRATOR — FUSION TECH AI FULL CINEMATIC WEBSITE AGENT 2026 (follow exactly)';
// Industry scroll modules (the PDF's sections 8-21), mapped onto our categories.
var WB_STORY_BY_CATEGORY = {
  healthcare: 'Clinic/medical: human/doctor → concern/treatment area → educational anatomy → clinician-reviewed mechanism → outward return → suitability/safety → consultation. Reverse: anatomy outward to patient view. Approved anatomical references only; never invent injection points, dosage, needle depth, protocols, outcomes or anatomical claims; generated visuals are illustrative; non-gory; HTML labels; reduced motion uses static diagrams.',
  beauty: 'Beauty/aesthetics: natural macro → technique/layer → genuine transformation → specialist/process → booking. Surface-to-layer-to-surface reverses. Genuine consented transformation material only; no unrealistic retouching; keep booking reachable.',
  automotive: 'Car: silhouette → 360 exterior → optional accurate body/wheel/interior separation → cabin/feature → reassembly → test-drive CTA. Reverse: cabin → exploded → orbit → silhouette. Never invent mechanical components or specs; if geometry is incomplete use cinematic video rather than fake internals; verified feature labels in the DOM; mobile: simplified orbit or pre-rendered sequence.',
  property: 'Property: exterior/aerial → approach → entrance → interior → real floor plan → neighbourhood/map → agent → viewing/valuation CTA. Reverse exits the property in order. Real property assets; never fabricate rooms, views, facilities or dimensions; transition-compatible start/end frames.',
  food_beverage: 'F&B/hospitality: ingredient/environment → preparation/craft → macro finished product → atmosphere → menu/package → reservation/order. Prefer scrubbed cinematic media over heavy 3D; down-scroll advances the craft, up-scroll reverses it; menus and booking stay normal, fast and accessible.',
  retail: 'Luxury/product: material reveal → 360 → macro craft → optional accurate exploded/construction view → lifestyle → purchase. Reverse restores the product. Actual geometry/reference only; studio-light gradients mimic reflections; exploded views only if the construction is real.',
  technology: 'Technology/AI/software (or device): outcome → product/workflow → integrations → automation/data flow → proof/ROI → demo (devices: hero → 360 → accurate internal layers → verified callouts → reassembly → buy/demo). Real product UI and SVG data-flow; never invent chips, sensors or internals; no abstract AI blobs in place of product proof.',
  construction: 'Renovation/architecture: before → plan/floorplan → material/build stages → finished space → proof → quote. Reverse: finished → stages → plan → before. Real project references and plans; never fabricate completed work.',
  home_services: 'Renovation/home services: before → plan → material/build stages → finished space → proof → quote. Reverse: finished → stages → plan → before. Never fabricate completed work.',
  education: 'Education/training: learner problem → curriculum path → teacher/class → milestone/outcome → student story → trial/enrol. Lightweight progress diagrams; heavy 3D only if educationally relevant; milestones advance and reverse cleanly.',
  b2b: 'Industrial/engineering: facility/machine → process → accurate machine visualisation → certifications/capacity → case → RFQ. Technical credibility first; never invent specs or expose confidential internals; procurement content readable without animation.',
  logistics: 'Industrial/logistics: facility/fleet → process → accurate operations visualisation → capacity/certifications → case → RFQ/quote. Never invent specs; content readable without animation.',
  professional_services: 'Finance/insurance/personal brand: customer problem → life-stage/planning journey → transparent calculator/diagram → advisor authority → proof/process → consultation. Human storytelling plus DOM/SVG data motion; no spectacle for financial claims; numbers and assumptions verified and transparent; reverse retraces the stages.',
  consulting: 'Consulting/personal brand: customer problem → journey → transparent diagram → advisor authority → proof/process → consultation. DOM/SVG data motion; no spectacle for claims.',
  local_business: 'Local business: the place and the craft → what you get → how it works → proof → visit/book. Scrubbed cinematic media; booking stays fast and accessible.',
  other: 'Business story: the customer\'s problem → the offer in action → how it works → proof → the call to action. Scrubbed cinematic media plus DOM/SVG motion.'
};
function wbStoryFor(category, kind) { return (category === 'retail' && kind && WB_LUXURY_STORY[kind]) || WB_STORY_BY_CATEGORY[category] || WB_STORY_BY_CATEGORY.other; }
/** The protected doctrine block for the Lovable build prompt, laid out as the PDF's MASTER ORCHESTRATOR (steps 1-10;
 *  Ryan, 2026-09-29: "every time the website agent creates the website, it will use this prompt"). */
function wbDoctrineSection(brief, input) {
  var kind = wbKindOf(brief, input);
  var plan = wbResearchPlan(input) || { real_photos: [], target_customers: [], customer_objections: [] };
  var film = wbFilmBrief(brief, input);
  var shots = wbImageShots(brief, input);
  var L = [WB_DOCTRINE_MARK];
  L.push('You are the Fusion Tech AI Full Cinematic Website Agent. Work through steps 1-10 in order. Before coding, write docs/storyboard.md (intelligence → directions → storyboard → scroll timeline → assets → Higgsfield media → Lovable implementation → QA); then build it all in this same turn without stopping.');
  L.push('1 INTELLIGENCE: the business, audience, offer, proof, objections, competitors and conversion come from the STRATEGY FROM WEBSITE INTELLIGENCE section and the facts above' + (plan.target_customers.length ? ' (buyer: ' + plan.target_customers.join('; ').slice(0, 200) + ')' : '') + '. Never fabricate facts, geometry, rooms, specs or outcomes; client facts and real reference assets override examples.');
  var dirs = wbArtDirections(brief, input);
  L.push('2 CREATIVE: three materially different art directions were considered: ' + dirs.map(function (d, i) { return String.fromCharCode(65 + i) + ') ' + d.name + ' (' + d.palette + '; ' + d.typography + '; ' + d.story_mood + ')'; }).join(' ') + ' Build A; record all three and why A in the storyboard.');
  L.push('3 STORY: an interactive conversion story in chapters, not stacked template sections. Chapter story for this business: ' + wbStoryFor(brief.industry_category, kind) + ' Film chapters: ' + film.scenes.map(function (sc, i) { return (i + 1) + ') ' + sc.section; }).join('; ') + '. Each chapter has a purpose, visual, copy, CTA and transition.');
  L.push('4 ANIMATION: scroll down progresses the story; scroll up reverses it exactly. Core animation state comes from normalized scroll progress p in [0,1], never one-way timers or autoplay; at any p the state is reproducible (refresh mid-page restores it). Per chapter: scroll start/end, pin yes/no + length, states at p=0, .25, .5, .75, 1 (camera, object, parts, opacity, blur, text, depth layers, media frame, CTA), reverse restores every state, mobile (lighter pre-rendered media, same story), reduced motion (static chapter states, normal flow), CTA, performance. Parallax depth: atmosphere/light fixed or slow; background slowest; hero object moderate; foreground detail faster but restrained; typography/UI stable enough to read. Do not scroll-jack; pin only where the story needs it; every effect must explain, demonstrate, dramatize or convert.');
  L.push('5 ENGINE (choose one per chapter and say why): REAL_TIME_3D only with an accurate 3D model (e.g. the Higgsfield GLB); SCROLL_SCRUB_VIDEO for the cinematic film chapters; IMAGE_SEQUENCE for precise frame control; CSS_SVG_DOM for type, diagrams, masks, callouts and light depth; STATIC_FALLBACK for reduced motion and weak devices. Never WebGL just to look expensive; never an exploded product view without accurate geometry.');
  var real = plan.real_photos.filter(function (p) { return p.use !== 'logo'; }).length;
  L.push('6 ASSETS (tag each in the storyboard): CLIENT_REAL = ' + (real ? real + ' real photos of the business (listed under REAL PHOTOS; used first)' : 'none found yet: placeholders for the customer\'s photos') + '; HIGGSFIELD role = the film chapters and posters, made on Kling' + (shots.some(function (x) { return !x.real_url; }) ? ' (generated only where no real photo exists)' : '') + '; 3D_MODEL = the Higgsfield GLB when provided; LOVABLE_CODE = type, SVG, masks and UI; DATA_API = forms, WhatsApp, booking (stub endpoints).');
  L.push('7 HIGGSFIELD (shots made on Kling): coherent shots with continuity; each chapter ends on the next chapter\'s start frame; no copy, logos or faces baked in. Shots: ' + film.scenes.map(function (sc, i) { var sh = sc.shot || {}; return (i + 1) + ') ' + [sh.lens, sh.lighting, sh.movement].filter(Boolean).join(', '); }).join('; ') + '.');
  L.push('8 LOVABLE: implement the storyboard exactly (the 3D SCROLL FILM block and the look-and-feel rules above): deterministic scroll timelines mapped from scroll progress, forward and reverse; semantic text and CTAs in the DOM; lazy-load below-the-fold media, preload only the hero; refresh and resize keep state; no scroll-jacking. Material palette of 3-5 colours (base, highlight, shadow, material accent, CTA accent); gradients behave like light (radial highlight, edge reflection, atmospheric depth), never rainbow or gradient-everywhere.');
  L.push('9 CONVERSION: ' + (plan.primary_cta ? '"' + plan.primary_cta + '" ' : 'the primary CTA ') + 'stays reachable at key moments of the story (after the hero, mid-story, at the end), a sticky mobile CTA and WhatsApp, instrument CTA and form events' + (kind ? '; luxury: quiet selling, private viewing first, no discount strips, countdowns or pop-ups' : '') + '.');
  L.push('10 QA / conversion agent before you finish: write docs/qa-report.md with every finding classified BLOCKER / HIGH / MEDIUM / POLISH, its exact fix and its owner (Higgsfield media, Lovable code, client facts); fix every BLOCKER and HIGH in this turn and mark them fixed. Test: scroll forward slowly and quickly, reverse slowly and quickly, rapid direction changes, stop at arbitrary progress, refresh mid-page, resize, rotate a phone, touch scroll, reduced motion, slow network; check factual fidelity, story continuity, CTA reachability, readability, pin release, layout shift, keyboard access and forms. Not done until reverse scroll is deterministic.');
  return wbCap(L.join('\n'), 7200);
}
/** Append the strategy and full-website sections to a build prompt (once each), keeping the total under WB_MAX_PROMPT by trimming the base, never these sections. */
function wbWithStrategy(prompt, plan, brief, input) {
  prompt = String(prompt || '');
  var parts = [];
  if (plan && prompt.indexOf(WB_STRATEGY_MARK) === -1) parts.push(wbStrategySection(plan));
  if (brief && prompt.indexOf(WB_FULLSITE_MARK) === -1) parts.push(wbFullSiteSection(brief));
  if (brief && prompt.indexOf(WB_DOCTRINE_MARK) === -1) parts.push(wbDoctrineSection(brief, input));
  if (!parts.length) return prompt.length > WB_MAX_PROMPT ? prompt.slice(0, WB_MAX_PROMPT - 1) + '…' : prompt;
  var sec = parts.join('\n');
  var room = WB_MAX_PROMPT - sec.length - 1;
  if (prompt.length > room) prompt = prompt.slice(0, room - 1) + '…';
  return prompt + '\n' + sec;
}
/** Self-contained prompt for Lovable (Build-with-URL). Facts only from the brief; placeholders are labelled; the generic AI look is forbidden. */
function wbBuildPrompt(brief, input) {
  input = input || {};
  var med = brief.mode === 'medical';
  var name = brief.business_name || (med ? '[PLACEHOLDER: clinic name]' : '[PLACEHOLDER: business name]');
  var industry = brief.industry || brief.industry_category.replace(/_/g, ' ');
  var d = brief.design_direction;
  var lines = [];
  lines.push('Build a premium ' + brief.site_type.replace(/_/g, ' ') + ' for ' + name + ' (' + industry + ', Singapore). It must look like an agency-grade site produced by a brand strategist, UX/UI designer, copywriter, art director and front-end engineer — never an AI template.');
  lines.push('Primary goal: ' + brief.primary_goal + (brief.audience ? '. Audience: ' + brief.audience : '') + '.');
  lines.push('Brand personality: ' + d.brand_personality + '. Typography: ' + d.typography + '. Layout: ' + d.layout + '. Imagery: ' + d.imagery + '. Motion: Apple-grade reversible 3D scroll film (Kling film chapters scrubbed by the scroll, layered depth parallax). Palette: ' + d.palette + '.');
  lines.push('Look and feel (mandatory): ' + WB_CINEMATIC.join(' '));
  lines.push('Never use: ' + WB_ANTI_GENERIC.join('; ') + '.');
  lines.push('Pages: ' + brief.pages.map(function (p) { return p.name + (p.purpose ? ' (' + p.purpose + ')' : ''); }).join('; ') + '.');
  if (brief.features.length) lines.push('Features: ' + brief.features.join('; ') + '.');
  if (brief.integrations.length) lines.push('Integrations (build the UI + stub endpoints, no real keys): ' + brief.integrations.join('; ') + '.');
  var st = [];
  if (brief.style.tone) st.push('tone ' + brief.style.tone);
  if (brief.style.colours) st.push('brand colours ' + brief.style.colours);
  if (brief.style.references.length) st.push('customer likes ' + brief.style.references.join(', '));
  if (st.length) lines.push('Customer style notes: ' + st.join(', ') + '.');
  if (brief.content_notes) lines.push('What the customer said: "' + brief.content_notes.slice(0, 260) + '"');
  lines.push('Content rules: ' + brief.content_rules.join(' '));
  lines.push('Engineering: React + Tailwind; mobile-first; semantic HTML; WCAG AA contrast; fast (sized images, no layout shift); SEO meta tags and one H1 per page; forms post to a placeholder webhook and show a success state; WhatsApp click-to-chat if listed; footer with contact placeholders.' + (med ? ' Add an information-only medical disclaimer and a privacy notice.' : ''));
  return wbWithStrategy(lines.join('\n'), wbResearchPlan(input), brief, input);
}
/** Photography the mock-up ships with: 3 cinematic shots per site, generated by the build worker with Kling (Ryan 2026-09-27: Kling for all images and video). No text, logos or plates in the images. */
function wbImageShots(brief, input) {
  input = input || {};
  var said = wbText(input);
  var brand = (said.match(/\b(bmw|mercedes(?:-benz)?|audi|toyota|honda|tesla|porsche|lexus|hyundai|kia|mazda|volvo|nissan)\b/i) || [null])[0];
  var cat = brief.industry_category;
  var industry = brief.industry || cat.replace(/_/g, ' ');
  var name = brief.business_name || industry;
  var base = ', Singapore, photorealistic, cinematic lighting, shallow depth of field, editorial photography, 35mm, no text, no logos, no watermarks, no license plates';
  var shots;
  if (cat === 'automotive') {
    var car = brand ? brand.toUpperCase() : 'premium car';
    shots = [
      { key: 'hero', aspect_ratio: '16:9', prompt: 'Cinematic wide shot of a new ' + car + ' in a glass showroom at dusk, city lights reflecting on wet asphalt outside, dramatic rim lighting on the bodywork, deep charcoal and midnight blue tones with warm metallic highlights' + base },
      { key: 'section', aspect_ratio: '16:9', prompt: 'Low-angle three-quarter view of a ' + car + ' driving through Singapore at blue hour, motion blur on the road, headlights on, cinematic colour grade' + base },
      { key: 'detail', aspect_ratio: '3:2', prompt: 'Close-up detail of a ' + car + ' interior, leather and stitching, ambient cabin lighting, premium showroom mood' + base }
    ];
  } else if (cat === 'retail' && wbKindOf(brief, input)) {
    // Luxury retail posters (Ryan, 2026-09-29): the chapter start frames, illustrative until the customer's photography arrives.
    var lbase = ', photorealistic luxury product photography, cinematic studio lighting, 8k detail, no text, no logos, no brand marks, no watermarks';
    shots = (WB_LUXURY_SHOTS[wbKindOf(brief, input)] || WB_LUXURY_SHOTS.luxury).map(function (x) { return { key: x.key, aspect_ratio: x.key === 'detail' ? '3:2' : '16:9', prompt: x.prompt + lbase }; });
  } else if (cat === 'property') {
    // Houses and interiors (Ryan, 2026-09-28): photoreal architectural visualisation, no people; labelled "Artist's impression" on the site.
    var pbase = ', Singapore, photorealistic architectural visualisation, cinematic natural light, wide-angle interior photography, no people, no text, no logos, no watermarks';
    shots = [
      { key: 'hero', aspect_ratio: '16:9', prompt: 'Cinematic wide shot of a modern tropical home facade at golden hour, warm light glowing from floor-to-ceiling windows, lush landscaping, calm pool in the foreground' + pbase },
      { key: 'section', aspect_ratio: '16:9', prompt: 'Spacious double-height living room with floor-to-ceiling windows, natural timber, stone and linen, soft afternoon light, view to greenery' + pbase },
      { key: 'detail', aspect_ratio: '3:2', prompt: 'Serene master bedroom opening onto a balcony with a skyline view at dusk, warm ambient lighting, premium materials' + pbase }
    ];
  } else if (brief.mode === 'medical' && wbHasAnatomy(wbResearchPlan(input))) {
    // Specialty clinics open on a realistic, medically accurate anatomy visual chosen by Website Intelligence (Ryan, 2026-09-26).
    var anat = wbResearchPlan(input).medical_visual_direction.replace(/^Specialty: [^.]*\.\s*/i, '').replace(/^Hero and section visuals:\s*/i, '');
    var mbase = ', photorealistic medical visualization, anatomically accurate, dark clean studio background, cinematic lighting, 8k detail, no text, no labels, no logos, no watermarks, not cartoon, not low-poly';
    shots = [
      { key: 'hero', aspect_ratio: '16:9', prompt: anat.slice(0, 420) + mbase },
      { key: 'section', aspect_ratio: '16:9', prompt: 'Calm modern specialist clinic consultation room in Singapore, warm natural light, clean equipment, reassuring atmosphere, no people' + base },
      { key: 'detail', aspect_ratio: '3:2', prompt: 'Close-up of a specialist doctor\'s hands explaining with an anatomical model in a modern clinic, soft light, face not visible' + base }
    ];
  } else if (brief.mode === 'medical') {
    shots = [
      { key: 'hero', aspect_ratio: '16:9', prompt: 'Calm modern clinic reception with warm natural light, soft neutrals with one sage accent, plants, clean lines, empty of people' + base },
      { key: 'section', aspect_ratio: '16:9', prompt: 'Bright treatment room in a modern Singapore clinic, clean equipment, soft daylight, reassuring atmosphere, no people' + base },
      { key: 'detail', aspect_ratio: '3:2', prompt: 'Close-up of a clinician\'s hands in a modern clinic setting, gloves, soft light, professional and calm, face not visible' + base }
    ];
  } else {
    var d = brief.design_direction;
    shots = [
      { key: 'hero', aspect_ratio: '16:9', prompt: 'Cinematic wide establishing shot for a ' + industry + ' business (' + name + '): ' + d.imagery + '; mood ' + d.brand_personality + '; palette ' + d.palette + base },
      { key: 'section', aspect_ratio: '16:9', prompt: 'Environmental photograph showing the work of a ' + industry + ' business in Singapore, people at work seen from behind or at distance, natural light, ' + d.brand_personality + base },
      { key: 'detail', aspect_ratio: '3:2', prompt: 'Close-up detail shot related to ' + industry + ' (tools, product, texture or space), shallow depth of field, ' + d.palette + base }
    ];
  }
  // Real photos first (Ryan, 2026-09-29): a shot the customer's own photo covers is not generated.
  var real = (wbResearchPlan(input) || { real_photos: [] }).real_photos.filter(function (p) { return p.use !== 'logo'; });
  if (real.length) {
    var used = {};
    var anatomyHero = brief.mode === 'medical' && wbHasAnatomy(wbResearchPlan(input));
    shots.forEach(function (sh) {
      if (anatomyHero && sh.key === 'hero') return; // the clinic's film opens on its anatomy (Ryan, 2026-09-26)
      var pick = real.filter(function (p) { return p.use === sh.key && !used[p.url]; })[0] || real.filter(function (p) { return !used[p.url] && ['hero', 'section', 'detail'].indexOf(p.use) === -1; })[0] || real.filter(function (p) { return !used[p.url]; })[0];
      if (pick) { used[pick.url] = true; sh.real_url = pick.url; sh.source = 'client_real'; }
    });
  }
  return shots;
}
/** One 3D parallax scroll-film website per mock-up (Ryan, 2026-09-27; replaces ADR-2's two variations and the flat rule). Kling makes the film and photos, Higgsfield the 3D product model (Ryan, 2026-09-28), Lovable builds and publishes. */
var WB_VARIATIONS = [
  { key: 'parallax_film_site', label: '3D parallax scroll website', tier: 'premium', tool: 'kling_film_lovable', template: 'scroll-scrub', description: 'One Apple-grade, high-converting website with a Kling film of the business scrubbed by the scroll, layered 3D depth parallax and a set of premium scroll effects, Kling photography, a Higgsfield 3D model for product businesses and the Website Intelligence sales strategy; built and published on Lovable (Ryan, 2026-09-27/28).' }
];
/** Chapter labels and shot direction per industry (doctrine 3 STORY + 22 HIGGSFIELD), for the three film chapters. */
function wbChapterShots(brief, input) {
  var goalCta = brief.primary_goal === 'bookings' ? 'book' : 'enquire / contact';
  if (brief.mode === 'medical') {
    var anat = wbHasAnatomy(wbResearchPlan(input));
    return {
      sections: [anat ? 'the concern and the educational anatomy (illustrative, clinician-reviewed copy)' : 'the patient and the reassurance they need', 'how the treatment works and the doctors (clinician-reviewed mechanism)', 'suitability, safety and the consultation: ' + goalCta],
      shots: [
        anat ? { lens: '100mm macro', lighting: 'dark clean studio, soft rim light', movement: 'slow orbit around the anatomy', grade: 'clinical cool with warm highlights', negative: 'no gore, no labels, not cartoon, no text, no injection points' } : { lens: '35mm', lighting: 'soft daylight', movement: 'slow push-in through the reception', negative: 'no faces, no text, no logos' },
        { lens: '35mm', lighting: 'soft daylight, clean clinical whites', movement: 'slow dolly through the treatment room', negative: 'no faces, no text, no outcome claims' },
        { lens: '85mm', lighting: 'warm soft key', movement: 'gentle push-in on the clinician\'s hands', negative: 'no faces, no text, no logos' }
      ]
    };
  }
  if (brief.industry_category === 'automotive') return {
    sections: ['silhouette and reveal: the car and one action (book a test drive)', 'the 360 exterior and the cabin features (verified only)', 'the drive and the test-drive booking'],
    shots: [{ lens: '50mm', lighting: 'dark showroom, strip lights tracing the body', movement: 'slow orbit from silhouette to reveal', negative: 'no plates, no logos, no text, no invented parts' }, { lens: '35mm', lighting: 'blue hour street', movement: 'low tracking shot alongside the car', negative: 'no plates, no text' }, { lens: '50mm', lighting: 'warm ambient cabin light', movement: 'slow push through the cabin', negative: 'no faces, no text, no invented features' }]
  };
  if (brief.industry_category === 'food_beverage') return {
    sections: ['ingredient and place: the one action (order or reserve)', 'preparation and craft', 'the finished dish or drink, the atmosphere and the reservation/order'],
    shots: [{ lens: '100mm macro', lighting: 'warm window light', movement: 'slow push over the ingredients', negative: 'no text, no logos' }, { lens: '50mm', lighting: 'kitchen practical light', movement: 'slow slide along the counter', negative: 'no faces, no text' }, { lens: '85mm', lighting: 'warm evening ambience', movement: 'slow orbit around the dish', negative: 'no text, no logos' }]
  };
  return {
    sections: ['hero: the one message and one action', 'what we offer / models or services', goalCta],
    shots: [{}, {}, {}]
  };
}
/** Scenes for variation A single-take film (no text, no logos; the business own world). */
function wbFilmBrief(brief, input) {
  var shots = wbImageShots(brief, input);
  var hero = shots[0] ? shots[0].prompt : '';
  var section = shots[1] ? shots[1].prompt : '';
  var detail = shots[2] ? shots[2].prompt : '';
  if (brief.industry_category === 'property') {
    // The walkthrough (Ryan, 2026-09-28): outside to inside, one continuous camera move per room.
    return {
      duration_seconds: 25,
      mode: 'walkthrough',
      scenes: [
        { at: '0-5s', scene: hero + '; slow drone push-in from the street towards the front door', section: 'hero: the home and the one action (book a viewing)', shot: wbShot({ camera: 'drone', lens: '24mm', lighting: 'golden hour', movement: 'slow drone push-in to the door', end_frame: 'the front door, chapter 2 start', negative: 'no people, no invented rooms or facilities, no text' }) },
        { at: '5-10s', scene: 'The front door opens and the camera glides into the entrance foyer, light spilling in, photorealistic architectural visualisation, no people', section: 'arrival: the promise of the home', shot: wbShot({ camera: 'gimbal', lens: '20mm', lighting: 'daylight spilling in', movement: 'glide through the door', end_frame: 'the living room, chapter 3 start', negative: 'no people, no text' }) },
        { at: '10-15s', scene: section + '; slow dolly through the living room towards the windows', section: 'living spaces and features', shot: wbShot({ camera: 'dolly', lens: '24mm', lighting: 'soft afternoon light', movement: 'slow dolly to the windows', end_frame: 'the kitchen, chapter 4 start', negative: 'no people, no invented rooms, no text' }) },
        { at: '15-20s', scene: 'Slow glide through an open kitchen and dining area with an island, premium finishes, warm evening light, photorealistic, no people', section: 'kitchen, dining and finishes', shot: wbShot({ camera: 'gimbal', lens: '24mm', lighting: 'warm evening light', movement: 'slow glide past the island', end_frame: 'the bedroom, chapter 5 start', negative: 'no people, no text' }) },
        { at: '20-25s', scene: detail + '; the camera drifts through the bedroom and out onto the balcony view', section: 'bedrooms, the view, book a viewing', shot: wbShot({ camera: 'gimbal', lens: '24mm', lighting: 'dusk, city lights', movement: 'drift out onto the balcony', end_frame: 'hold on the view for the CTA', negative: 'no people, no invented views, no text' }) }
      ],
      rules: ['no text, logos or people in the film', 'one smooth continuous camera move, outside to inside', 'label every generated visual on the site "Artist\'s impression"', 'tone: ' + brief.design_direction.brand_personality]
    };
  }
  var kind = wbKindOf(brief, input);
  if (kind) {
    var ls = WB_LUXURY_SHOTS[kind] || WB_LUXURY_SHOTS.luxury;
    return {
      duration_seconds: 15,
      mode: 'luxury_chapters',
      scenes: ls.map(function (x, i) { return { at: (i * 5) + '-' + (i * 5 + 5) + 's', scene: shots[i] ? shots[i].prompt : x.prompt, section: WB_LUXURY_SECTIONS[i], shot: wbShot(Object.assign({}, x.shot, { end_frame: i < ls.length - 1 ? 'chapter ' + (i + 2) + ' poster composition' : 'hold on the piece for the CTA' })) }; }),
      rules: ['doctrine: the story reverses exactly on scroll-up', 'no text, logos, brand marks, faces or invented parts in the film', 'every generated product is illustrative until the customer supplies photography, references or CAD', 'the 360 chapter uses the Higgsfield 3D model (REAL_TIME_3D) between chapters 1 and 2; no exploded view without the customer\'s CAD', 'tone: ' + brief.design_direction.brand_personality, 'palette: ' + brief.design_direction.palette]
    };
  }
  var cs = wbChapterShots(brief, input);
  return {
    duration_seconds: 15,
    mode: 'single-shot',
    scenes: [
      { at: '0-5s', scene: hero, section: cs.sections[0], shot: wbShot(Object.assign({}, cs.shots[0], { end_frame: 'chapter 2 poster composition' })) },
      { at: '5-10s', scene: section, section: cs.sections[1], shot: wbShot(Object.assign({}, cs.shots[1], { end_frame: 'chapter 3 poster composition' })) },
      { at: '10-15s', scene: detail, section: cs.sections[2], shot: wbShot(Object.assign({}, cs.shots[2], { end_frame: 'hold for the CTA' })) }
    ],
    rules: ['no text, logos, plates or faces in the film', 'the camera moves through the real world of this business', 'tone: ' + brief.design_direction.brand_personality, 'palette: ' + brief.design_direction.palette]
  };
}
/** The build starts automatically when the brief names the business and what the site is for (Ryan, 2026-09-25: no approvals). */
function wbReadyToBuild(brief) {
  // Ryan, 2026-09-27: the business name is enough; Website Intelligence's research fills industry and site needs,
  // and an unspecified site type is built as a business website.
  var missing = [];
  if (!brief.business_name) missing.push('business_name');
  return { ready: missing.length === 0, missing: missing };
}
function wbLovableUrl(prompt) { return WB_LOVABLE_BASE + encodeURIComponent(prompt); }

function wbParseJson(text) {
  if (typeof text !== 'string') return null;
  // The whole answer first: a JSON value may itself contain ``` blocks (e.g. a mermaid diagram), which a fence regex cuts short (ATLAS, execution 387).
  var w0 = text.indexOf('{'), w1 = text.lastIndexOf('}'); if (w0 !== -1 && w1 > w0) { try { return JSON.parse(text.slice(w0, w1 + 1)); } catch (e) {} }
  var t = text.trim();
  var fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  if (t.charAt(0) !== '{') { var i = t.indexOf('{'), k = t.lastIndexOf('}'); if (i === -1 || k === -1 || k < i) return null; t = t.slice(i, k + 1); }
  try { return JSON.parse(t); } catch (e) { return null; }
}

/**
 * finalizeBrief({ raw_text, error, input }) -> { brief, provider, fallback_used, fallback_reason, validation_errors, build_prompt, lovable_url }
 */
function finalizeBrief(opts) {
  opts = opts || {};
  var input = opts.input || {};
  var validationErrors = [];
  var fallbackReason = null;
  var brief = null;
  if (opts.error) fallbackReason = String(opts.error);
  else {
    var parsed = wbParseJson(opts.raw_text);
    if (!parsed) fallbackReason = 'model_output_not_json';
    else {
      brief = wbCoerce(parsed);
      validationErrors = wbValidate(brief);
      if (validationErrors.length) { fallbackReason = 'schema_invalid: ' + validationErrors.join(','); brief = null; }
    }
  }
  var fallbackUsed = !brief;
  if (fallbackUsed) brief = wbFallbackBrief(input);
  else {
    // Mode guard: medical language in the customer's words always forces medical mode (stricter rules), never the reverse.
    var said = wbText(input);
    if (brief.mode !== 'medical' && wbDetectMode(said, input.industry) === 'medical') {
      brief.mode = 'medical';
      brief.industry_category = 'healthcare';
      brief.content_rules = wbContentRules('medical');
      brief.verification_required = wbVerificationFor('medical');
      brief.qa_checklist = wbQaChecklist('medical');
      brief.reasoning = (brief.reasoning ? brief.reasoning + ' ' : '') + '[guardrail] medical mode enforced from the customer\'s words.';
      brief.build_prompt = '';
    }
    // A full website every time (Ryan, 2026-09-28): the model's pages plus the industry sitemap and funnel pages.
    wbEnsureFullSite(brief);
    // The build prompt must carry the design direction and the anti-generic rules; regenerate if the model's is thin or too long.
    if (!brief.build_prompt || brief.build_prompt.length > WB_MAX_PROMPT || brief.build_prompt.indexOf('Never use:') === -1) brief.build_prompt = wbBuildPrompt(brief, input);
  }
  // Facts guard: the model may propose pages/features, but must not invent a business name the customer never gave.
  if (!fallbackUsed && brief.business_name && !input.company_name) {
    var saidLower = wbText(input).toLowerCase();
    if (saidLower.indexOf(brief.business_name.toLowerCase().replace(/\s+(pte\.?\s*ltd\.?|ltd\.?|llp|inc\.?)$/i, '')) === -1) {
      brief.business_name = null;
      if (brief.missing_information.indexOf('business_name') === -1) brief.missing_information.unshift('business_name');
      brief.reasoning = (brief.reasoning ? brief.reasoning + ' ' : '') + '[guardrail] business_name removed: not present in the customer\'s words.';
      brief.build_prompt = wbBuildPrompt(brief, input);
    }
  }
  // The research plan (funnel, conversion strategy, 3D motion, medical visuals) always rides in the Lovable prompt.
  brief.build_prompt = wbWithStrategy(brief.build_prompt || wbBuildPrompt(brief, input), wbResearchPlan(input), brief, input);
  var readiness = wbReadyToBuild(brief);
  return {
    brief: brief,
    ready_to_build: readiness.ready,
    missing_for_build: readiness.missing,
    image_shots: wbImageShots(brief, input),
    variations: WB_VARIATIONS.map(function (v) { return { key: v.key, label: v.label, tier: v.tier, tool: v.tool, template: v.template, description: v.description }; }),
    film_brief: wbFilmBrief(brief, input),
    provider: fallbackUsed ? 'fallback' : 'anthropic',
    fallback_used: fallbackUsed,
    fallback_reason: fallbackReason,
    validation_errors: validationErrors,
    build_prompt: brief.build_prompt,
    lovable_url: wbLovableUrl(brief.build_prompt)
  };
}

// ---- Node module wrapper (stripped by build.js) ----
module.exports = { wbChapterShots, wbRealPhotosFrom, WB_LUXURY_KINDS, WB_LUXURY_RE, wbLuxuryKind, wbKindOf, WB_LUXURY_STORY, WB_DESIGN_LUXURY, WB_LUXURY_PAGES, wbLuxuryPages, WB_LUXURY_HOME, WB_LUXURY_DIRECTIONS, wbArtDirections, wbShot, WB_LUXURY_SHOTS, WB_DOCTRINE_MARK, WB_STORY_BY_CATEGORY, wbStoryFor, wbDoctrineSection, WB_MAX_PROMPT, WB_VERSION, WB_SCHEMA_VERSION, WB_MODES, WB_SITE_TYPES, WB_GOALS, WB_CATEGORIES, WB_MISSING, WB_ANTI_GENERIC, WB_CINEMATIC, WB_APPLE, WB_SCROLL_EFFECTS, WB_EFFECTS_BY_CATEGORY, wbEffectsFor, WB_FULL_SITE, WB_FUNNEL_PAGES, WB_HOME_BLUEPRINT, WB_FULLSITE_MARK, wbDefaultPages, wbEnsureFullSite, wbFullSiteSection, WB_DESIGN, wbText, wbDetectMode, wbDetectCategory, wbGuessBusinessName, wbDetectSiteType, wbDetectGoal, wbImageShots, wbReadyToBuild, WB_VARIATIONS, wbFilmBrief, wbDesignFor, wbQaChecklist, wbContentRules, wbFallbackBrief, wbCoerce, wbValidate, wbBuildPrompt, wbLovableUrl, wbParseJson, finalizeBrief, WB_STRATEGY_MARK, wbResearchPlan, wbHasAnatomy, wbStrategySection, wbWithStrategy };
