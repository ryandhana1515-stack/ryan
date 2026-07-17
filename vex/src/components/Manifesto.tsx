import Reveal from './Reveal'

export default function Manifesto() {
  return (
    <section id="story" className="px-6 md:px-12 lg:px-16 py-28 md:py-40">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <span className="text-sm uppercase tracking-[0.2em] text-gray-400">
            Our thesis
          </span>
        </Reveal>
        <Reveal delay={80}>
          <h2
            className="mt-8 text-3xl md:text-5xl lg:text-6xl font-normal leading-tight"
            style={{ letterSpacing: '-0.03em' }}
          >
            We back visionaries and build the companies that define what comes
            next — from the first line of code to category leadership.
          </h2>
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-10 max-w-2xl text-base md:text-lg text-gray-300 leading-relaxed">
            VEX is a venture studio and investor. We commit early, roll up our
            sleeves, and stay through the hard parts — because enduring
            companies are built, not bought.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
