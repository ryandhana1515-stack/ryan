const LINKS = [
  { label: 'Story', href: '#story' },
  { label: 'Investing', href: '#work' },
  { label: 'Building', href: '#work' },
  { label: 'Advisory', href: '#work' },
]

export default function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 px-6 md:px-12 lg:px-16 pt-6">
      <nav className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between">
        {/* Left: logo */}
        <a href="#top" className="text-2xl font-semibold tracking-tight">
          VEX
        </a>

        {/* Center: links (md and up) */}
        <div className="hidden md:flex items-center gap-8">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-white hover:text-gray-300 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right: CTA */}
        <a
          href="#contact"
          className="bg-white text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          Start a Chat
        </a>
      </nav>
    </header>
  )
}
