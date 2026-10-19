import { SelectionProvider } from './context/SelectionContext'
import BuyCTA from './components/BuyCTA'
import Certificates from './components/Certificates'
import DiseaseGrid from './components/DiseaseGrid'
import ExplodingTablet from './components/ExplodingTablet'
import FiveWays from './components/FiveWays'
import Footer from './components/Footer'
import GenerationCompare from './components/GenerationCompare'
import Hero from './components/Hero'
import IngredientMarquee from './components/IngredientMarquee'
import PricingBundles from './components/PricingBundles'
import ProblemFraming from './components/ProblemFraming'
import RawMaterials from './components/RawMaterials'
import ScienceTeam from './components/ScienceTeam'
import StatBand from './components/StatBand'
import StickyMobileBar from './components/StickyMobileBar'
import Testimonials from './components/Testimonials'
import TrustBar from './components/TrustBar'
import UsageStorage from './components/UsageStorage'
import VesselSection from './components/VesselSection'

/**
 * Section order matches the page map in the master prompt. Everything below the
 * hero is plain markup plus intersection-observer reveals, so the whole page is
 * one bundle with no runtime dependencies beyond React.
 */
export default function App() {
  return (
    <SelectionProvider>
      <main>
        <Hero />
        <IngredientMarquee />
        <TrustBar />
        <ProblemFraming />
        <DiseaseGrid />
        <StatBand />
        <VesselSection />
        <GenerationCompare />
        <ExplodingTablet />
        <FiveWays />
        <RawMaterials />
        <ScienceTeam />
        <Certificates />
        <PricingBundles />
        <Testimonials />
        <UsageStorage />
        <BuyCTA />
      </main>
      <Footer />
      <StickyMobileBar />
    </SelectionProvider>
  )
}
