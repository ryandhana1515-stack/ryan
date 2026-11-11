import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

/** Shared monoline icon base: 24 grid, 1.5 stroke, currentColor. */
function Base({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export const IconFlow = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 8c3 0 3 4 6 4s3-4 6-4 3 4 6 4" />
    <path d="M3 16c3 0 3 3 6 3s3-3 6-3 3 3 6 3" opacity=".5" />
  </Base>
)

export const IconPressure = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 21s-7-4.6-7-10a4.6 4.6 0 0 1 7-3.9A4.6 4.6 0 0 1 19 11c0 5.4-7 10-7 10Z" />
    <path d="M8.5 12h2l1-2 1.5 4 1-2h2" />
  </Base>
)

export const IconSugar = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M8 14c1.6-3 2.4-5 4-8" />
    <path d="M10.5 15.5c1.2-2 1.8-3.4 3-6" opacity=".55" />
  </Base>
)

export const IconEnergy = (p: IconProps) => (
  <Base {...p}>
    <path d="M13 2 4.5 13.5H11l-1 8.5 9-12h-6.5L13 2Z" />
  </Base>
)

export const IconBrain = (p: IconProps) => (
  <Base {...p}>
    <path d="M9.5 3.5A3 3 0 0 0 6.6 6a2.8 2.8 0 0 0-1.9 4.4A3 3 0 0 0 6 15.4V17a3 3 0 0 0 3.5 3V3.5Z" />
    <path d="M14.5 3.5A3 3 0 0 1 17.4 6a2.8 2.8 0 0 1 1.9 4.4A3 3 0 0 1 18 15.4V17a3 3 0 0 1-3.5 3V3.5Z" />
    <path d="M12 3.5v17" opacity=".4" />
  </Base>
)

export const IconLungs = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3v8" />
    <path d="M12 8c-1.6 0-2.6.9-3 2.4L7.6 16A2.6 2.6 0 0 0 10 19.4h.6A1.4 1.4 0 0 0 12 18v-6" />
    <path d="M12 8c1.6 0 2.6.9 3 2.4l1.4 5.6a2.6 2.6 0 0 1-2.4 3.4h-.6A1.4 1.4 0 0 1 12 18v-6" />
  </Base>
)

export const IconHeart = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 20s-7.2-4.4-7.2-9.7A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.2 3.1C19.2 15.6 12 20 12 20Z" />
  </Base>
)

export const IconCirculation = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 3.5c-2.6 2.4-2.6 14.6 0 17" />
    <path d="M3.7 9.5h16.6M3.7 14.5h16.6" opacity=".55" />
  </Base>
)

export const IconShield = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3l7 3v5.5c0 4.4-2.9 7.6-7 9.5-4.1-1.9-7-5.1-7-9.5V6l7-3Z" />
    <path d="m9 12 2.2 2.2L15.5 10" />
  </Base>
)

export const IconDigestive = (p: IconProps) => (
  <Base {...p}>
    <path d="M8 3v5.5A4.5 4.5 0 0 0 12.5 13h1a3.5 3.5 0 0 1 0 7H11" />
    <path d="M8 8.5h3" opacity=".55" />
  </Base>
)

export const IconCheck = (p: IconProps) => (
  <Base {...p}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </Base>
)

export const IconCross = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Base>
)

export const IconArrow = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 12h15" />
    <path d="m13 6 6 6-6 6" />
  </Base>
)

export const IconStar = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="m12 17.6-6.1 3.4 1.4-6.9L2 9.3l7-.9L12 2l3 6.4 7 .9-5.3 4.8 1.4 6.9L12 17.6Z" />
  </svg>
)

export const IconGmp = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="10" r="6.2" />
    <path d="M9.4 10.4 11 12l3.4-3.6" />
    <path d="M8.4 15.6 7 22l5-2.2L17 22l-1.4-6.4" />
  </Base>
)

export const IconHaccp = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 2.8 4.6 6v6c0 4.6 3 8 7.4 9.4 4.4-1.4 7.4-4.8 7.4-9.4V6L12 2.8Z" />
    <path d="M9.6 12.2h4.8M12 9.8v4.8" />
  </Base>
)

export const IconIso = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3.4 9.5h17.2M3.4 14.5h17.2" opacity=".55" />
    <path d="M12 3c-3 3.4-3 14.6 0 18" />
  </Base>
)

export const IconPatent = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 3h9l3.4 3.4V21H6V3Z" />
    <path d="M14.6 3v3.8h3.8" opacity=".55" />
    <path d="M9.4 13.2h5.2M9.4 16.6h3.4" />
  </Base>
)

export const IconLeaf = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 4c0 8.3-4.4 12.6-11 12.6H5.6C5.6 9 10.6 4 20 4Z" />
    <path d="M4 20c2.4-4.2 5.4-6.8 9.6-8.6" opacity=".55" />
  </Base>
)

export const IconClock = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.6" />
    <path d="M12 7.2V12l3.2 2" />
  </Base>
)

export const IconBox = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 8.2h12V21H6V8.2Z" />
    <path d="M6 8.2 8 3h8l2 5.2" />
    <path d="M10 12.4h4" />
  </Base>
)

export const IconTruck = (p: IconProps) => (
  <Base {...p}>
    <path d="M2.8 6.6h10.4v9.2H2.8z" />
    <path d="M13.2 10h3.6l2.6 3v2.8h-6.2z" />
    <circle cx="7" cy="18" r="1.7" />
    <circle cx="16.4" cy="18" r="1.7" />
  </Base>
)

export const IconGift = (p: IconProps) => (
  <Base {...p}>
    <path d="M3.6 9.6h16.8v3.2H3.6z" />
    <path d="M5.2 12.8h13.6V20H5.2z" />
    <path d="M12 9.6V20" />
    <path d="M12 9.6C10.4 6.8 6 6.4 6 8.5c0 .8.9 1.1 2 1.1h4Zm0 0c1.6-2.8 6-3.2 6-1.1 0 .8-.9 1.1-2 1.1h-4Z" />
  </Base>
)

export const IconSun = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.5 1.5M17.1 17.1l1.5 1.5M18.6 5.4l-1.5 1.5M6.9 17.1l-1.5 1.5" />
  </Base>
)

export const ICONS = {
  flow: IconFlow,
  pressure: IconPressure,
  sugar: IconSugar,
  energy: IconEnergy,
  brain: IconBrain,
  respiratory: IconLungs,
  heart: IconHeart,
  circulation: IconCirculation,
  immune: IconShield,
  digestive: IconDigestive,
  gmp: IconGmp,
  haccp: IconHaccp,
  iso: IconIso,
  patent: IconPatent,
} as const

export type IconKey = keyof typeof ICONS
