import { useRef, useEffect, useState } from 'react'
import Reveal from './Reveal'

interface Stat {
  value: number
  prefix?: string
  suffix?: string
  label: string
}

const STATS: Stat[] = [
  { value: 40, suffix: '+', label: 'Ventures launched' },
  { value: 120, prefix: '$', suffix: 'M+', label: 'Capital deployed' },
  { value: 12, label: 'Exits' },
  { value: 9, label: 'Years building' },
]

function CountUp({ value, prefix = '', suffix = '' }: Omit<Stat, 'label'>) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value)
      return
    }
    let raf = 0
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        const duration = 1600
        let startTs: number | null = null
        const step = (ts: number) => {
          if (startTs === null) startTs = ts
          const p = Math.min((ts - startTs) / duration, 1)
          const eased = 1 - Math.pow(1 - p, 3)
          setDisplay(Math.round(value * eased))
          if (p < 1) raf = requestAnimationFrame(step)
        }
        raf = requestAnimationFrame(step)
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value])

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {display}
      {suffix}
    </span>
  )
}

export default function Stats() {
  return (
    <section className="px-6 md:px-12 lg:px-16 py-24 md:py-32 border-t border-white/10">
      <div className="max-w-7xl mx-auto grid gap-y-12 gap-x-6 grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 90}>
            <div>
              <div
                className="text-5xl md:text-6xl lg:text-7xl font-normal"
                style={{ letterSpacing: '-0.04em' }}
              >
                <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} />
              </div>
              <div className="mt-4 text-sm text-gray-400">{s.label}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
