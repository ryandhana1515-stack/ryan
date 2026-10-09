import { INGREDIENTS } from '../data/product'
import { IconLeaf } from './icons'

/**
 * Thin auto-scrolling band directly under the hero. The list is rendered twice so
 * the -50% keyframe loops seamlessly. Pauses on hover, and holds still entirely
 * under prefers-reduced-motion (animation killed in index.css).
 */
export default function IngredientMarquee() {
  const items = [...INGREDIENTS, ...INGREDIENTS]

  return (
    <section
      className="relative overflow-hidden border-b border-white/[0.07] bg-navy-900/60 py-4"
      aria-label="Key ingredients"
    >
      <div className="mask-fade-x group flex w-full overflow-hidden">
        <ul className="flex shrink-0 animate-marquee items-center gap-10 pr-10 group-hover:[animation-play-state:paused] sm:gap-14 sm:pr-14">
          {items.map((name, i) => (
            <li
              key={`${name}-${i}`}
              className="flex shrink-0 items-center gap-2.5 whitespace-nowrap"
              aria-hidden={i >= INGREDIENTS.length}
            >
              <IconLeaf className="h-4 w-4 text-cyan-glow/70" />
              <span className="text-[13px] font-medium uppercase tracking-[0.16em] text-white/55">
                {name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
