import { useState, useEffect, type CSSProperties } from 'react'

interface AnimatedHeadingProps {
  /** Text to animate. Split into lines on "\n". */
  text: string
  className?: string
  style?: CSSProperties
  /** Per-character stagger, in ms. */
  charDelay?: number
  /** Delay before the whole animation starts, in ms. */
  initialDelay?: number
  /** Per-character transition duration, in ms. */
  charDuration?: number
}

export default function AnimatedHeading({
  text,
  className = '',
  style,
  charDelay = 30,
  initialDelay = 200,
  charDuration = 500,
}: AnimatedHeadingProps) {
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), initialDelay)
    return () => clearTimeout(timer)
  }, [initialDelay])

  const lines = text.split('\n')

  return (
    <h1 className={className} style={style}>
      {lines.map((line, lineIndex) => {
        const lineLength = line.length
        return (
          <span key={lineIndex} className="block">
            {line.split('').map((char, charIndex) => {
              const delay =
                lineIndex * lineLength * charDelay + charIndex * charDelay
              return (
                <span
                  key={charIndex}
                  style={{
                    display: 'inline-block',
                    opacity: started ? 1 : 0,
                    transform: started ? 'translateX(0)' : 'translateX(-18px)',
                    transition: `opacity ${charDuration}ms ease, transform ${charDuration}ms ease`,
                    transitionDelay: `${delay}ms`,
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              )
            })}
          </span>
        )
      })}
    </h1>
  )
}
