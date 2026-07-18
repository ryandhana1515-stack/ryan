'use client'

import dynamic from 'next/dynamic'
import Nav from '@/components/navigation/Nav'
import Footer from '@/components/navigation/Footer'
import ScrollFilm from '@/components/hero/ScrollFilm'
import WhyBioNov from '@/components/sections/WhyBioNov'
import Fermentation from '@/components/sections/Fermentation'
import NitricOxide from '@/components/sections/NitricOxide'
import AgeTimeline from '@/components/sections/AgeTimeline'
import BodyJourney from '@/components/sections/BodyJourney'
import VesselJourney from '@/components/sections/VesselJourney'
import WellnessPillars from '@/components/sections/WellnessPillars'
import ResearchTeam from '@/components/sections/ResearchTeam'
import ProductShowcase, {
  TechnologyRoadmap,
  FeaturedIngredients,
} from '@/components/sections/ProductShowcase'
import { Faq, Contact, MedicalDisclaimer } from '@/components/sections/FaqContact'
import { useLenis } from '@/lib/scroll/gsap'

const ReassemblyFinale = dynamic(
  () => import('@/components/hero/ReassemblyFinale'),
  { ssr: false },
)
const KlingTransition = dynamic(
  () => import('@/components/hero/KlingTransition'),
  { ssr: false },
)
const ChainedHeroFilm = dynamic(
  () => import('@/components/hero/ChainedHeroFilm'),
  { ssr: false },
)

export default function Home() {
  useLenis()
  return (
    <>
      <Nav />
      <main id="main">
        {/* Cinematic hero: chained Kling first→last frame film of the real product */}
        <ChainedHeroFilm />
        {/* Chapters 1–7: pinned interactive 3D product film */}
        <ScrollFilm />
        {/* Chapter 8 */}
        <WhyBioNov />
        {/* Chapter 9 */}
        <Fermentation />
        {/* Chapter 10 */}
        <NitricOxide />
        {/* Chapter 11 */}
        <AgeTimeline />
        {/* Chapter 12 */}
        <BodyJourney />
        {/* Chapter 13 */}
        <VesselJourney />
        {/* Chapter 14 */}
        <WellnessPillars />
        {/* Chapter 15 */}
        <ResearchTeam />
        {/* Chapter 16 + supporting */}
        <ProductShowcase />
        <TechnologyRoadmap />
        <FeaturedIngredients />
        {/* Kling cinematic transition into the finale */}
        <KlingTransition
          clipId="kling-bionov-levitation"
          poster="/assets/product/references/cover-hero.png"
          kicker="Chapter 17"
          title="Everything returns to the box."
          body="Scroll on — the journey reassembles itself."
          heightVh={220}
        />
        {/* Chapters 17–18: reassembly + closing CTA */}
        <ReassemblyFinale />
        <Faq />
        <Contact />
        <MedicalDisclaimer />
      </main>
      <Footer />
    </>
  )
}
