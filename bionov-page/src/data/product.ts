/**
 * Single source of truth for BIO N:OV page copy.
 *
 * Every figure here comes from the official BIO N:OV brand deck (BIO_NOV_ENG_V1)
 * or the Bzzworld manufacturer banner. Do not invent new numbers. Page references
 * are noted so claims stay auditable.
 */

export const BRAND = {
  name: 'BIO N:OV',
  tagline: 'Clearing The Way To Optimum Health',
  distributor: 'Bio Green Elixirs',
  exclusivity: 'Exclusive @ Bzzworld',
} as const

export const HERO = {
  eyebrow: 'Korean NO Technology',
  headlineLead: 'Boost Your',
  headlineAccent: 'Nitric Oxide',
  headlineTail: 'Naturally',
  subhead: 'Clearing the way to optimum health, one tablet at a time.',
  badge: {
    line1: '3rd Gen NO Booster',
    line2: 'Microbial Fermentation',
  },
  benefits: [
    { icon: 'flow', label: 'Improve Blood Flow' },
    { icon: 'pressure', label: 'Support Healthy Blood Pressure' },
    { icon: 'sugar', label: 'Support Healthy Blood Sugar' },
    { icon: 'energy', label: 'More Energy Every Day' },
  ],
  cta: 'Shop BIO N:OV',
  socialProof: 'Developed by 8 Korean university professors.',
} as const

export const CERTIFICATIONS = [
  { id: 'gmp', label: 'GMP', detail: 'Good Manufacturing Practice' },
  { id: 'haccp', label: 'HACCP', detail: 'Hazard Analysis Critical Control Points' },
  { id: 'iso', label: 'ISO 22000', detail: 'Food Safety Management' },
  { id: 'patent', label: 'Korea Patent', detail: 'Patented Fermentation Technology' },
] as const

export const INGREDIENTS = [
  'Red Ginseng Ferment',
  'Natto Gum Ferment',
  'L-Arginine',
  'Beet Root Concentrate',
  'Mulberry Leaf Extract',
  'Ginkgo Leaf Extract',
  'Black Garlic Ferment',
  'Sea Cucumber Extract',
  'Broccoli Sprout Extract',
] as const

/** Deck p.3: NO production falls roughly 20% every 10 years after age 20. */
export const NO_DECLINE = {
  heading: 'Are You Getting Enough Nitric Oxide?',
  body: 'Nitric oxide production begins to decline in your twenties and keeps falling about 20 percent every ten years. By 40 you have lost roughly half. By 60 most of it is gone, and blood vessels lose the signal that keeps them open.',
  source: 'Source: BIO N:OV brand deck, nitric oxide production decline with age.',
  /** age to remaining NO production capability, percent */
  curve: [
    { age: 10, no: 100 },
    { age: 20, no: 100 },
    { age: 30, no: 80 },
    { age: 40, no: 50 },
    { age: 50, no: 35 },
    { age: 60, no: 25 },
    { age: 70, no: 15 },
  ],
  markers: [
    { age: 20, label: 'Production begins to decline' },
    { age: 40, label: 'Lose 50%' },
    { age: 60, label: 'Lose 85%' },
  ],
} as const

/** Deck p.4: Dr. Ferid Murad, Magical Nitric Oxide. */
export const DISEASE_SYSTEMS = [
  { id: 'brain', name: 'Brain', conditions: 'Stroke, Dementia, Alzheimer’s Disease' },
  { id: 'respiratory', name: 'Respiratory System', conditions: 'Rhinitis, Pneumonia' },
  { id: 'heart', name: 'Heart', conditions: 'Myocardial Infarction, Arrhythmia' },
  { id: 'circulation', name: 'Blood Circulation', conditions: 'Hypertension, Diabetes' },
  { id: 'immune', name: 'Immune System', conditions: 'Flu, Cold, Fever, Allergy' },
  { id: 'digestive', name: 'Digestive System', conditions: 'Indigestion, Diarrhea, Bloating' },
] as const

/** Deck pp.5 to 7. */
export const GLOBAL_STATS = [
  {
    value: 537,
    suffix: 'M',
    label: 'Adults living with diabetes',
    detail: '1 in 10 adults. Almost half are undiagnosed.',
  },
  {
    value: 1.28,
    suffix: 'B',
    decimals: 2,
    label: 'Hypertension patients worldwide',
    detail: '80 percent fail to control their blood pressure.',
  },
  {
    value: 15,
    suffix: 'M',
    label: 'Strokes every year',
    detail: '87 percent caused by blocked blood flow to the brain.',
  },
] as const

export const GLOBAL_STATS_SOURCE =
  'Source: IDF Diabetes Atlas (2021) and WHO, as cited in the BIO N:OV brand deck.'

/** Deck p.20, Bzzworld Smart Lab. */
export const VESSEL = {
  heading: 'When NO flows, life flows freely.',
  body: 'Nitric oxide is the signal that tells a blood vessel to relax. With enough of it a vessel stays broad, smooth and elastic. Without it the wall stiffens, flow slows, and pressure climbs. BIO N:OV puts the signal back.',
  stats: [
    { value: '+18%', label: 'Vessel Diameter' },
    { value: '+42%', label: 'Blood Flow' },
    { value: '-25%', label: 'Blood Pressure' },
  ],
  source: 'Source: Bzzworld Smart Lab',
} as const

/** Deck p.12: NO supplement tech roadmap. */
export const GENERATIONS = [
  {
    gen: '1st Gen',
    name: 'Arginine',
    highlight: false,
    points: [
      { ok: false, text: 'Enzyme needed and unstable' },
      { ok: false, text: 'Prohibited for heart disease patients' },
    ],
  },
  {
    gen: '2nd Gen',
    name: 'Vegetable & Fruit Extracts',
    highlight: false,
    points: [
      { ok: false, text: 'Side effects: nausea, diarrhea, headache' },
      { ok: false, text: 'Not suitable for age 40 and above' },
    ],
  },
  {
    gen: '3rd Gen',
    name: 'BIO N:OV Microbial Fermentation',
    highlight: true,
    points: [
      { ok: true, text: '40 to 400 percent more effective than other competition' },
      { ok: true, text: 'No enzyme needed, works on everyone' },
      { ok: true, text: 'Exclusive proprietary strain' },
    ],
  },
] as const

/** Deck p.15. */
export const TABLET = {
  heading: 'Engineered to release on contact.',
  body: 'BIO N:OV needs no enzyme to convert. It releases nitric oxide the moment it meets stomach acid, which is why the response is measured in minutes rather than weeks.',
  chips: [
    { value: '30 min', label: 'Absorption' },
    { value: '3rd Gen', label: 'Formula' },
    { value: '100%', label: 'Natural' },
    { value: 'Zero', label: 'Dependence' },
  ],
} as const

export const LAB_DISCLAIMER =
  'This laboratory data is not intended or implied to be a substitute for professional medical advice, diagnosis, or treatment.'

/** Deck pp.20 to 25. */
export const FIVE_WAYS = [
  {
    id: 'blood-pressure',
    index: '01',
    title: 'Blood Pressure',
    lead: 'Repairs the vessel, then lowers the load.',
    body: 'Within 30 minutes of a single tablet, vessels widen and circulation improves, which brings pressure down without forcing the heart to work harder.',
    metrics: [
      { value: '+18%', label: 'Vessel diameter' },
      { value: '+42%', label: 'Blood flow' },
      { value: '-25%', label: 'Blood pressure' },
    ],
    source: 'Source: Bzzworld Smart Lab',
    hasLabData: true,
  },
  {
    id: 'blood-sugar',
    index: '02',
    title: 'Blood Sugar',
    lead: 'Stops the after-meal spike.',
    body: 'GABA stabilises insulin and glucose, polyphenols slow glucose absorption, and antioxidants restore insulin efficiency. Blood sugar drops 8 percent within the hour.',
    metrics: [
      { value: '-8%', label: 'Blood sugar within 1 hour' },
      { value: 'Lower', label: 'Insulin resistance' },
      { value: 'Reduced', label: 'Digestive enzyme activity' },
    ],
    source: 'Source: Bzzworld Smart Lab',
    hasLabData: true,
  },
  {
    id: 'vigor',
    index: '03',
    title: 'Vigor',
    lead: 'Energy that lasts the whole day.',
    body: 'As NO drops, mitochondrial function suffers and blood flow at the skeletal muscle slows. Restoring NO restores the flow, delivers more oxygen, and brings overall performance back up.',
    metrics: [
      { value: 'Restored', label: 'Mitochondrial function' },
      { value: 'Increased', label: 'Skeletal muscle blood flow' },
      { value: 'More', label: 'Oxygen supplied' },
    ],
    source:
      'Source: Nitric oxide, aging and aerobic exercise. Sedentary individuals to Master’s athletes.',
    hasLabData: false,
  },
  {
    id: 'aging',
    index: '04',
    title: 'Aging',
    lead: 'Slows the clock inside the cell.',
    body: 'Telomere length determines how many times a cell can still divide. The NO generated by BIO N:OV activates telomerase, slowing the shortening process and making slower aging possible.',
    metrics: [
      { value: 'Activated', label: 'Telomerase' },
      { value: 'Slowed', label: 'Telomere shortening' },
    ],
    source: 'Source: BIO N:OV brand deck, telomerase activation.',
    hasLabData: false,
  },
  {
    id: 'skin',
    index: '05',
    title: 'Skin',
    lead: 'Visible on the surface too.',
    body: 'Across 100 testers aged 15 to 76, a topical nitric oxide generating protocol produced measurable change in brightness, wrinkles, pores and inflammation.',
    metrics: [
      { value: '78%', label: 'Felt brighter' },
      { value: '84%', label: 'Wrinkles reduced' },
      { value: '68%', label: 'Pores shrank' },
      { value: '68%', label: 'Less inflammation' },
    ],
    source:
      'Source: Gregory Chernoff, The Utilization of a Topical Nitric Oxide Generating Serum in Aesthetic Medicine. 100 testers aged 15 to 76.',
    hasLabData: true,
  },
] as const

/** Deck p.27. */
export const RAW_MATERIALS = [
  {
    name: 'Lettuce',
    benefits: ['Top 10 superfood', 'Various vitamins, minerals and fibers'],
  },
  {
    name: 'Garlic',
    benefits: [
      'Allicin promotes anticancer substances and metabolism',
      'Removes active acids to improve immunity',
    ],
  },
  {
    name: 'Soybean Sprouts',
    benefits: ['Beta-carotene and vitamin C', 'Prevents skin aging problems'],
  },
  {
    name: 'Soybean',
    benefits: [
      'Prevents arteriosclerosis and reduces cholesterol',
      'Vitamin A, vitamin B and amino acids',
    ],
  },
] as const

/** Deck pp.13 to 14. */
export const SCIENCE_TEAM = {
  lead: {
    name: 'Ph.D. Min Sun Kim',
    role: 'BIO N:OV R&D Leading Person',
    focus: 'Main research in cardiovascular health',
    affiliation: 'Dean, Wonkwang University School of Medicine',
  },
  board: {
    name: 'Dr. Cheon Hyun Soo',
    role: 'Head of BIO N:OV Medical Development & Research Board',
    focus: 'Medical development and research oversight',
    affiliation: 'SunChon National University',
  },
  members: [
    {
      name: 'Prof. Dr. Hyun-Ock Pae',
      focus: 'NO and metabolites',
      affiliation: 'Wonkwang University, School of Medicine',
    },
    {
      name: 'Prof. Dr. Yong-Il Shin',
      focus: 'Neuro-rehabilitation for stroke, brain injuries and dementia',
      affiliation: 'Pusan National University, School of Medicine',
    },
    {
      name: 'Prof. Dr. Kim Jong-Suk',
      focus: 'NO and body metabolism, cancer and anti-aging',
      affiliation: 'Jeonbuk National University Medical School',
    },
    {
      name: 'Dr. Ju Sung-Min',
      focus: 'NO and the menopausal and lymphatic system',
      affiliation: 'Research Prof. Center of TKM, Wonkwang University',
    },
    {
      name: 'Dr. Sooah Kim',
      focus: 'NO and regenerative medicine, food application',
      affiliation: 'College of Medical Science, Jeonju University',
    },
    {
      name: 'Ass. Prof. A-Lum Han',
      focus: 'Metabolic diseases, obesity and clinical nutrition',
      affiliation: 'University Hospital of Wonkwang',
    },
  ],
} as const

/** Deck p.28. */
export const PATENT = {
  strain: 'KACC91554P',
  owner: 'Korea Research Institute of Bioscience and Biotechnology',
  body: 'BIO N:OV is exclusively developed from a proprietary microbial strain (KACC91554P) owned by the Korea Research Institute of Bioscience and Biotechnology. It is a fermented composition of natural vegetables and herbs.',
} as const

/** Deck p.29. */
export const USAGE = {
  usage: ['3 times per day', '1 tablet per time'],
  storage: [
    'Store in a cool and dry place',
    'Avoid heat and direct sunlight',
    'PTP protector film for better tightness',
  ],
} as const

export type Gift = { name: string }

export type Pack = {
  id: string
  name: string
  boxes: number
  supplyDays: number
  price: number
  compareAt: number
  discountPct: number
  badge?: string
  gifts: Gift[]
  /** Shopify variant id. TODO: replace with the real variant ids once the product is live. */
  variantId: string
}

/**
 * TODO: confirm final retail pricing with Ryan once landed cost and margin are set.
 * Structure and discount ladder are per the master prompt spec.
 */
export const PACKS: Pack[] = [
  {
    id: 'pack-1',
    name: 'Pack 1',
    boxes: 1,
    supplyDays: 20,
    price: 59,
    compareAt: 69,
    discountPct: 14,
    gifts: [{ name: 'NO Nutrition Guide (digital)' }],
    variantId: 'TODO_VARIANT_ID_PACK_1',
  },
  {
    id: 'pack-2',
    name: 'Pack 2',
    boxes: 3,
    supplyDays: 60,
    price: 165,
    compareAt: 207,
    discountPct: 20,
    badge: 'Most Popular',
    gifts: [{ name: 'NO Nutrition Guide (digital)' }, { name: 'Free express shipping' }],
    variantId: 'TODO_VARIANT_ID_PACK_2',
  },
  {
    id: 'pack-3',
    name: 'Pack 3',
    boxes: 6,
    supplyDays: 120,
    price: 290,
    compareAt: 414,
    discountPct: 30,
    badge: 'Best Deal \u{1F525}',
    gifts: [
      { name: 'NO Nutrition Guide (digital)' },
      { name: 'Free express shipping' },
      { name: 'BIO N:OV pill organizer' },
    ],
    variantId: 'TODO_VARIANT_ID_PACK_3',
  },
]

export const PRODUCT_SPEC = '500 mg x 60 tablets (30 g) per box'

/**
 * TODO: replace with real verified reviews before launch. Names and quotes below are
 * placeholders. Never publish invented medical outcomes as real customer results.
 */
export const TESTIMONIALS = [
  {
    id: 't1',
    name: 'TODO: reviewer name',
    location: 'Singapore',
    rating: 5,
    quote:
      'TODO: replace with a real verified review. Keep it to how the customer felt day to day, no medical claims.',
    verified: true,
  },
  {
    id: 't2',
    name: 'TODO: reviewer name',
    location: 'Kuala Lumpur',
    rating: 5,
    quote:
      'TODO: replace with a real verified review. Mention routine and convenience rather than diagnosis.',
    verified: true,
  },
  {
    id: 't3',
    name: 'TODO: reviewer name',
    location: 'Jakarta',
    rating: 5,
    quote:
      'TODO: replace with a real verified review sourced from the Bzzworld distributor network.',
    verified: true,
  },
  {
    id: 't4',
    name: 'TODO: reviewer name',
    location: 'Hong Kong',
    rating: 4,
    quote: 'TODO: replace with a real verified review. A mixed or four star review builds trust.',
    verified: true,
  },
] as const

export const TRUST_BULLETS = [
  'Free shipping on orders over $90',
  '30 day money back guarantee',
  'Patented Korean fermentation technology',
  'Exclusive @ Bzzworld',
] as const

export const LEGAL_DISCLAIMER =
  'These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease. Consult your physician before use if you are pregnant, nursing, taking medication, or under medical supervision.'
