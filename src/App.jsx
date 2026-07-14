import { useEffect } from 'react'
import Lenis from 'lenis'
import Nav from './components/Nav'
import Hero from './components/Hero'
import ScrollStory from './components/ScrollStory'
import SpecSheet from './components/SpecSheet'
import Generations from './components/Generations'
import Research from './components/Research'
import OrderSection from './components/OrderSection'

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf) }
    requestAnimationFrame(raf)
    return () => lenis.destroy()
  }, [])

  return (
    <>
      <Nav />
      <Hero />
      <ScrollStory />
      <SpecSheet />
      <Generations />
      <Research />
      <OrderSection />
    </>
  )
}
