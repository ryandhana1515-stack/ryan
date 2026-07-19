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
const VideoHero = dynamic(() => import('@/components/hero/VideoHero'), {
  ssr: false,
})

export default function Home() {
  useLenis()
  return (
    <>
      <Nav />
      <main id="main">
        {/* Cinematic hero: Ryan's own BIO N:OV film, self-hosted */}
        <VideoHero />
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
