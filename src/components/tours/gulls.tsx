import type { CSSProperties } from "react"
import { Feather, GullFlying, GullSitting } from "@/components/scene/gull"

// x: where it sits along the card, rise: how far above the card's box the cloud reaches there,
// both in cqw. facing: 1 looks left, -1 right.
export type GullSpot = { x: number; rise: number; facing: number }

// Some gulls sitting on a card's cloud. A layer the size of the card with the same tilt as
// the cloud (`tilt`), which also straightens when the card is hovered, so they stay on it. It
// isn't inside the cloud because that has a shadow filter, which would have to be redrawn for
// every move a gull makes.
//
// Nothing moves them while they sit. wind.ts sets data-flying on the layer when the plane gets
// close, and CSS does the rest with the flying: variant. Nested wrappers, one job each:
// sideways, then up and down, then facing and distance.
export function Gulls({ spots, tilt }: { spots: GullSpot[]; tilt: string }) {
  return (
    <span
      aria-hidden
      data-flock
      className={`pointer-events-none absolute inset-0 transition-[rotate,translate] duration-300 motion-safe:group-hover/card:-translate-y-1 motion-safe:group-hover/card:rotate-0 ${tilt}`}
    >
      {spots.map(({ x, rise, facing }, i) => (
        <span
          key={x}
          data-gull
          style={
            {
              left: `${x}cqw`,
              bottom: `calc(100% + ${rise}cqw - 2px)`,
              "--sit": facing,
              "--face": facing,
              "--delay": `${i * 0.12}s`,
            } as CSSProperties
          }
          className="absolute w-[max(11cqw,36px)] -translate-x-1/2"
        >
          <span className="block motion-safe:flying:animate-gull-x">
            <span className="block motion-safe:flying:animate-gull-y">
              <span className="block scale-x-(--sit) motion-safe:flying:animate-gull-look">
                <GullSitting
                  style={{ animationDelay: `${-i * 1.7}s` }}
                  className="block w-full origin-bottom motion-safe:animate-gull-idle flying:hidden"
                />
                {/* Wider than it is sitting: its wings are out */}
                <GullFlying className="-mx-1/4 hidden w-[150%] flying:block" />
              </span>
            </span>
          </span>
        </span>
      ))}
      {/* Two feathers left behind in the air */}
      {spots.slice(0, 2).map(({ x, rise }, i) => (
        <Feather
          key={x}
          style={{
            left: `${x}cqw`,
            top: `calc(${-rise}cqw - 24px)`,
            animationDelay: `${0.1 + i * 0.35}s`,
          }}
          className="absolute w-[max(3cqw,12px)] opacity-0 motion-safe:flying:animate-feather"
        />
      ))}
    </span>
  )
}
