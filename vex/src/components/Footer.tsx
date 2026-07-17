const FOOTER_LINKS = [
  { label: 'Story', href: '#story' },
  { label: 'What we do', href: '#work' },
  { label: 'Start a Chat', href: '#contact' },
]

export default function Footer() {
  return (
    <footer className="px-6 md:px-12 lg:px-16 py-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <a href="#top" className="text-xl font-semibold tracking-tight">
          VEX
        </a>

        <nav className="flex flex-wrap gap-x-8 gap-y-2">
          {FOOTER_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} VEX. Investing. Building. Advisory.
        </p>
      </div>
    </footer>
  )
}
