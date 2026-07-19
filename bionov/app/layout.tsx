import type { Metadata, Viewport } from 'next'
import { Sora, Inter } from 'next/font/google'
import './globals.css'
import { FaqJsonLd } from './structured-data'

const display = Sora({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '600', '700', '800'],
})
const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
})

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export const metadata: Metadata = {
  metadataBase: new URL('https://ryandhana1515-stack.github.io'),
  title: 'BIO N:OV | Fermentation-Based Nitric Oxide Wellness Support',
  description:
    'Discover BIO N:OV through an immersive scientific journey exploring fermentation technology, nitric oxide and everyday wellness support.',
  openGraph: {
    title: 'BIO N:OV | Clearing the Way to Optimum Health',
    description:
      'An immersive scientific journey through fermentation technology and nitric-oxide wellness support.',
    type: 'website',
    images: [{ url: `${BASE}/assets/product/references/cover-hero.png` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BIO N:OV | Fermentation-Based Nitric Oxide Wellness Support',
    description:
      'An immersive scientific journey through fermentation technology and nitric-oxide wellness support.',
  },
}

export const viewport: Viewport = {
  themeColor: '#1B6FD8',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-body">
        {children}
        <FaqJsonLd />
      </body>
    </html>
  )
}
