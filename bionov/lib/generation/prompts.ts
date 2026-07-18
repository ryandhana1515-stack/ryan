// One prompt per shot. All prompts anchor to the approved PDF-extracted
// references — never regenerate the package design independently.

export const NEGATIVE_PROMPT = [
  'dark-blue product box', 'black packaging', 'bottle', 'jar', 'pouch',
  'capsule', 'softgel', 'round pill', 'pure-white pill', 'orange pill',
  'oversized tablet', 'smooth generic beige pill', 'invented pill engraving',
  'changed Korean text', 'fake logo', 'changed V logo', 'misspelled BIO N:OV',
  'duplicated product', 'warped packaging', 'melted packaging',
  'changed proportions', 'transparent blister plastic', 'fire', 'smoke',
  'debris', 'powder explosion', 'destructive explosion', 'hands', 'people',
  'watermark', 'added advertising text',
].join(', ')

export interface ShotPrompt {
  id: string
  stage: 'reference' | 'test' | 'final'
  kind: 'image' | 'video'
  prompt: string
}

export const SHOTS: ShotPrompt[] = [
  {
    id: 'shot-01-clean-product-hero',
    stage: 'reference',
    kind: 'image',
    prompt:
      'Create an exact photorealistic studio recreation of the original BIO N:OV product box from the supplied reference image. The product is a tall predominantly white Korean supplement box with a large geometric V graphic in cyan, turquoise and deep blue, original Korean lettering, BIO N:OV wording, original company logo and certification seals. Preserve the exact proportions and branding. Place the box in a clean blue, cyan, purple and pink gradient environment matching the reference cover, with a soft reflective surface and premium clinical lighting. No redesign, no bottle, no dark packaging, no added marketing text, 16:9.',
  },
  {
    id: 'shot-02-product-360',
    stage: 'test',
    kind: 'video',
    prompt:
      'Use the exact approved BIO N:OV product reference. The intact white product box completes one controlled 360-degree rotation around its vertical axis. Show the front, right side, back, left side and front again. Packaging artwork remains fixed and consistent. No label morphing, no text changes, no deformation, no camera shake. Bright clinical blue-purple gradient studio, soft rim lighting, luxury product commercial.',
  },
  {
    id: 'shot-03-levitation',
    stage: 'test',
    kind: 'video',
    prompt:
      'The exact approved white BIO N:OV product box rises vertically after completing the rotation. The front faces the camera. Soft blue, cyan and pink light trails spiral around it. Controlled zero-gravity movement, premium scientific commercial, accurate product design, no redesign, no bouncing, no sudden launch.',
  },
  {
    id: 'shot-04-box-opening',
    stage: 'test',
    kind: 'video',
    prompt:
      'The exact original white BIO N:OV product box opens gradually at the top while levitating. Two accurate silver blister packs become visible. One blister pack rises slightly while the second remains partially inside. Preserve all packaging details and proportions. Clean blue-cyan-purple-pink environment, premium clinical CGI, no fire, no smoke, no debris.',
  },
  {
    id: 'shot-05-tablets-outward',
    stage: 'test',
    kind: 'video',
    prompt:
      'The exact approved BIO N:OV product box remains intact and open while accurate silver blister packs and many real BIO N:OV tablets flow outward in elegant zero gravity. The tablets are small short oblong rounded rectangles, grey-beige, naturally speckled, rough, matte and compressed herbal texture. No capsules, no smooth beige pills, no white pills, no round pills, no destructive explosion, no fire, no smoke, no debris. Premium zero-gravity product deconstruction.',
  },
  {
    id: 'shot-06-tablet-field',
    stage: 'test',
    kind: 'video',
    prompt:
      'The exact BIO N:OV box, two silver blister packs and many small grey-beige speckled oblong compressed tablets are suspended in a controlled three-dimensional field. Tablets rotate slowly at different depths. The camera moves gently through them. Clean blue, cyan, purple and pink gradient environment matching the reference. Deep parallax, accurate scale, premium medical CGI.',
  },
  {
    id: 'shot-07-macro-tablet',
    stage: 'reference',
    kind: 'image',
    prompt:
      'Extreme macro shot of the actual BIO N:OV tablet based on the supplied product reference. Small short oblong rounded rectangle, grey-beige compressed herbal material, naturally rough matte surface, irregular dark speckles, fine botanical detail. No capsule shell, no gloss, no smooth coating, no pure-white medicine tablet, no invented engraving.',
  },
  {
    id: 'shot-08-fermentation-world',
    stage: 'test',
    kind: 'video',
    prompt:
      'Create a premium scientific 3D environment inspired by BIO N:OV microbial fermentation. Transparent glass chamber, elegant fermentation bubbles, microscopic particles, fermented garlic extract and fermented lettuce extract visual motifs, clean white, blue, cyan, purple and pink lighting matching the BIO N:OV reference. Medical-science style, sophisticated, not fantasy, no people, no text.',
  },
  {
    id: 'shot-09-no-molecular-world',
    stage: 'test',
    kind: 'video',
    prompt:
      'Create a premium scientific 3D nitric-oxide molecular environment using clean connected NO molecules, flowing light pathways, cellular communication imagery and blue, cyan, purple and pink gradients matching the BIO N:OV reference. Elegant medical visualisation, clean white highlights, high-end scientific presentation, no medical claims printed in the scene.',
  },
  {
    id: 'shot-10-blood-vessel',
    stage: 'test',
    kind: 'video',
    prompt:
      'Create a clean medically styled non-graphic 3D blood vessel. Begin with a narrower pathway and slower floating blood-flow particles, then transition into a gently relaxed wider vessel with smoother flow. Premium scientific educational visualisation, clean textures, no gore, no disease labels, no text, suitable for a wellness website.',
  },
  {
    id: 'shot-11-reverse-assembly',
    stage: 'test',
    kind: 'video',
    prompt:
      'The same approved BIO N:OV tablets move smoothly backward along elegant curved paths into the exact silver blister packs. The blister packs lower into the original white BIO N:OV box. The box flaps close precisely. Magnetic premium reassembly, controlled movement, no suction distortion, no package warping, accurate product design.',
  },
]
