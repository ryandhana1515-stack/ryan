// Research team as presented in BIO_NOV_ENG_V1.pdf (pages 13–14).
// NOTE: Professional titles, affiliations and research information
// must be verified before publication.

export interface Researcher {
  name: string
  role: string
  institution: string
  field: string
  photo: string
  lead?: boolean
}

export const researchers: Researcher[] = [
  {
    name: 'Dr. Cheon Hyun Soo',
    role: 'Head of BIO N:OV Medical Development & Research Board',
    institution: 'SunChon National University',
    field: 'Medical development and research leadership',
    photo: 'cheon-hyun-soo.png',
    lead: true,
  },
  {
    name: 'Prof. Dr. Hyun-Ock Pae',
    role: 'Professor',
    institution: 'Wonkwang University, School of Medicine',
    field: 'Major research in NO & metabolites',
    photo: 'hyun-ock-pae.png',
  },
  {
    name: 'Ph.D. Min Sun Kim',
    role: 'Dean',
    institution: 'Wonkwang University School of Medicine',
    field: 'Main research in cardiovascular health',
    photo: 'min-sun-kim.png',
  },
  {
    name: 'Prof. Dr. Yong-Il Shin',
    role: 'Professor',
    institution: 'Pusan National University, School of Medicine',
    field: 'Neuro-rehabilitation research for stroke, brain injuries & dementia',
    photo: 'yong-il-shin.png',
  },
  {
    name: 'Dr. Ju Sung-Min',
    role: 'Research Professor',
    institution: 'Center of TKM, Wonkwang University',
    field: 'Research in NO and menopausal & lymphatic systems',
    photo: 'ju-sung-min.png',
  },
  {
    name: 'Ass. Prof. A-Lum Han',
    role: 'Assistant Professor',
    institution: 'University Hospital of Wonkwang',
    field: 'Research in metabolic diseases, obesity & clinical nutrition',
    photo: 'a-lum-han.png',
  },
  {
    name: 'Prof. Dr. Kim Jong-Suk',
    role: 'Professor',
    institution: 'Jeonbuk National University Medical School',
    field: 'Research in NO and body metabolism, cancer & anti-aging',
    photo: 'kim-jong-suk.png',
  },
  {
    name: 'Dr. Sooah Kim',
    role: 'Researcher',
    institution: 'College of Medical Science, Jeonju University',
    field: 'Research in NO and regenerative medicine & food application',
    photo: 'sooah-kim.png',
  },
]
