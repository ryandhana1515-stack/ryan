import Reveal from './Reveal'

export default function CTA() {
  return (
    <section
      id="contact"
      className="px-6 md:px-12 lg:px-16 py-32 md:py-48 border-t border-white/10"
    >
      <div className="max-w-4xl mx-auto text-center">
        <Reveal>
          <span className="text-sm uppercase tracking-[0.2em] text-gray-400">
            Let's talk
          </span>
        </Reveal>
        <Reveal delay={80}>
          <h2
            className="mt-8 text-4xl md:text-6xl lg:text-7xl font-normal leading-[1.05]"
            style={{ letterSpacing: '-0.04em' }}
          >
            Let's build something
            <br />
            that lasts.
          </h2>
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-8 max-w-xl mx-auto text-base md:text-lg text-gray-300">
            Founder with a bold idea, or looking to partner with us? We'd love to
            hear what you're building.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <a
              href="mailto:hello@vex.studio"
              className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Start a Chat
            </a>
            <a
              href="#top"
              className="liquid-glass border border-white/20 text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-black transition-colors"
            >
              Back to top
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
