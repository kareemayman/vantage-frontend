import type { CSSProperties, ReactNode } from "react"
import { ButtonLink } from "@/components/button"
import { ArrowIcon, PinIcon } from "@/components/icons"
import { Reveal } from "@/components/reveal"
import { BeachBall, Palm, PoolRing, Suitcase } from "@/components/scene/beach"
import { DIFFICULTY } from "@/components/tours/difficulty"
import { Gulls, type GullSpot } from "@/components/tours/gulls"
import { PlaneWindow } from "@/components/tours/plane-window"
import type { Tour } from "@/lib/tours"

// Each card hangs a little crooked, taking turns down the route
const TILTS = [
  "-rotate-2",
  "rotate-[1.5deg]",
  "-rotate-1",
  "rotate-2",
  "-rotate-[1.5deg]",
  "rotate-1",
]

// Each card's beach toy, taking turns. It sits on the card's outer side, away from the
// route: the right on phones (the route runs down the left) and in desktop's right
// column; `left` moves it over for the left column. `front` toys sit on the card's top
// corner, centered 3cqw in from its edge and raised to the cloud's outline there (see
// riseAt); the others peek out from behind it. Sizes and spots are in cqw (1% of the
// card's width), so a toy grows with its card. A mirrored or turned toy uses `transform`
// or `rotate`, because the pop animates `scale`.
// `gust`: what it does when the plane's wind hits it (data-gust, set by wind.ts). All of these
// end within HOP_TIME.
type Prop = { art: ReactNode; front?: boolean; right: string; left: string; gust: string }
const PROPS: Prop[] = [
  {
    art: <BeachBall className="w-[18cqw]" />,
    front: true,
    right: "-top-[9cqw] -right-[6cqw]",
    left: "-top-[9cqw] -right-[6cqw] md:right-auto md:-left-[6cqw]",
    gust: "motion-safe:gust:animate-bounce-once",
  },
  {
    art: <PoolRing className="w-[20cqw] rotate-12" />,
    front: true,
    right: "-top-[8cqw] -right-[7cqw]",
    left: "-top-[8cqw] -right-[7cqw] md:right-auto md:-left-[7cqw]",
    gust: "motion-safe:gust:animate-toy-flip",
  },
  {
    // A palm standing beside the card
    art: <Palm className="w-[30cqw]" />,
    right: "-right-[17cqw] bottom-[2cqw]",
    left: "-right-[17cqw] bottom-[2cqw] md:right-auto md:-left-[17cqw] md:[transform:scaleX(-1)]",
    gust: "motion-safe:gust:animate-wiggle",
  },
  {
    // Higher than the others: its handle is on top, so the case sits low in the drawing
    art: <Suitcase color="sun" className="w-[20cqw]" />,
    front: true,
    right: "-top-[12cqw] -right-[7cqw] rotate-12",
    left: "-top-[12cqw] -right-[7cqw] rotate-12 md:right-auto md:-left-[7cqw] md:-rotate-12",
    gust: "motion-safe:gust:animate-hop",
  },
]

// Each card is a cloud: a rounded box with puffs bulging out of its top and sides. The
// puffs look random but come from a fixed recipe seeded by the tour's slug, so every
// card gets its own cloud and keeps it. A puff is its center (left, top) and its size,
// in cqw, so the cloud grows with the card.
type Puff = { left: string; top: string; size: number }
function cloudPuffs(slug: string) {
  let seed = [...slug].reduce((n, char) => (n * 31 + char.charCodeAt(0)) >>> 0, 7)
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0 // a tiny pseudo-random number generator
    return seed / 2 ** 32
  }
  const between = (min: number, max: number) => min + random() * (max - min)

  const puffs: Puff[] = []
  const domes: Dome[] = [] // the top puffs again, as numbers, for riseAt
  // 3 or 4 big puffs across the top, evenly spread, each nudged and sized at random
  const count = random() < 0.5 ? 3 : 4
  for (let i = 0; i < count; i++) {
    const left = ((i + 0.5) / count) * 100 + between(-6, 6)
    const size = between(18, 28)
    puffs.push({ left: `${left}%`, top: "2cqw", size })
    domes.push({ x: left, size })
  }
  // 1 or 2 smaller ones on each side, in the top two thirds, mostly inside the card (at
  // most 5cqw out, so they stay clear of the route and the screen's edge)
  for (const side of ["4cqw", "100% - 4cqw"]) {
    const sideCount = random() < 0.5 ? 1 : 2
    for (let i = 0; i < sideCount; i++) {
      puffs.push({ left: side, top: `${between(12, 62)}%`, size: between(12, 18) })
    }
  }
  return { puffs, domes }
}

// How high the cloud reaches above its box at x (cqw from the left edge): the top of the
// highest top puff over that spot (their centers sit 2cqw below the box's top), or 0 where
// none covers it. The card is 100cqw wide, so a top puff's left % is also its x in cqw.
type Dome = { x: number; size: number }
function riseAt(domes: Dome[], x: number) {
  let rise = 0
  for (const dome of domes) {
    const radius = dome.size / 2
    const dx = x - dome.x
    if (Math.abs(dx) < radius) rise = Math.max(rise, Math.sqrt(radius ** 2 - dx ** 2) - 2)
  }
  return rise
}

// Gulls sit on a few of the cards, spread out down the route
const hasGulls = (index: number) => index % 5 === 2 || index % 5 === 4

// Where they sit: on top of the puffs around the card's middle (its corners are for the toys),
// two on a big puff or on the only one there, and one on a small one. x and rise in cqw, like
// the puffs.
function gullSpots(domes: Dome[]): GullSpot[] {
  const middle = domes.filter((dome) => dome.x > 20 && dome.x < 80)
  return middle
    .flatMap((dome) =>
      dome.size > 24 || middle.length === 1 ? [dome.x - 6.5, dome.x + 6.5] : [dome.x],
    )
    .map((x, i) => ({ x, rise: riseAt(domes, x), facing: i % 2 === 0 ? 1 : -1 }))
}

// A puff's box. `inset` shrinks it by the outline's width, for the fills (see the card)
function puffBox({ left, top, size }: Puff, inset = 0) {
  return {
    left: `calc(${left} - ${size / 2}cqw + ${inset}px)`,
    top: `calc(${top} - ${size / 2}cqw + ${inset}px)`,
    width: `calc(${size}cqw - ${2 * inset}px)`,
    height: `calc(${size}cqw - ${2 * inset}px)`,
  }
}

// The beach's wavy edge: 20 half-waves across a 100 × 6 box, stretched to the card's width
const WAVE = `M0 6V3Q2.5 0 5 3${"t5 0".repeat(19)}V6Z`

// One tour on the route. Phones: one column, the route down the left. Desktop: two
// columns, zigzagging: each card spans two grid rows and starts one row below the card
// before it (--row), so it sits half a card lower, on the other side of the route.
// The <li> is a container (@container): @sm: means "the card is at least 384px wide".
// Its padding on the outer side (below xl, where the screen is tight) leaves room for the
// puffs and toys that stick out.
// total: how many cards there are. Later cards are lit by a lower sun: their clouds get warmer.
export function TourCard({ tour, index, total }: { tour: Tour; index: number; total: number }) {
  const titleId = `tour-${tour.slug}`
  const left = index % 2 === 0 // desktop's left column
  const prop = PROPS[index % PROPS.length]
  const propBox = `pointer-events-none absolute origin-bottom motion-safe:seen:animate-prop-pop ${left ? prop.left : prop.right}`
  const { puffs, domes } = cloudPuffs(tour.slug)
  // How far to raise a front toy (3cqw in from the corner it sits on): phones always use
  // the right corner; md+ the card's outer one. At most 6.5cqw: following a very tall
  // puff all the way lifted the toy off the card (the City Wanderer's bag, 10cqw)
  const raise = (x: number) => `${Math.min(riseAt(domes, x), 6.5)}cqw`
  const rise = { "--rise": raise(97), "--rise-md": raise(left ? 3 : 97) } as CSSProperties
  // The toy inside its box, nested: its hop in the wind mustn't replace the box's pop
  const toy = <span className={`block origin-bottom ${prop.gust}`}>{prop.art}</span>
  const tilt = TILTS[index % TILTS.length]

  return (
    // The z-index: gulls that take off fly over the cards below this one, which come later in
    // the page and would otherwise cover them (a container is its own stacking context)
    <li
      style={{ "--row": index + 1 } as CSSProperties}
      className={`@container relative pr-4 pl-10 has-data-flying:z-20 md:row-[var(--row)/span_2] ${left ? "md:col-start-1 md:pr-0 md:pl-6 xl:pl-0" : "md:col-start-2 md:pr-6 md:pl-0 xl:pr-0"}`}
    >
      {/* The card's stop on the route, level with the middle of its window (39% of the
          card's width down). The route itself is drawn by tour-route.tsx. Desktop: in the
          gap between the columns, a third of the way across from the card */}
      <span
        aria-hidden
        data-route-stop
        className={`absolute top-[calc(4px+39cqw)] left-4 size-4.5 -translate-1/2 rounded-full border-3 border-outline bg-cta ${left ? "md:left-[calc(100%+var(--corridor)/3)]" : "md:left-[calc(var(--corridor)/-3)]"}`}
      />

      {/* Reveal stays still (it's what's measured); the card inside pops out of its stop:
          from the left on phones and in the right column, from the right in the left one */}
      <Reveal>
        <div
          className={`origin-top-left [--pop-turn:-8deg] [--pop-x:-3rem] waiting:opacity-0 motion-safe:seen:animate-card-pop motion-reduce:seen:animate-fade-in ${left ? "md:origin-top-right md:[--pop-turn:8deg] md:[--pop-x:3rem]" : ""}`}
        >
          {/* The toy is the card's sibling, not its child: the tilted card is its own
              layer (a stacking context), and nothing inside it can get behind it.
              data-wind: the plane's wind sways all of this (wind.ts) */}
          <article aria-labelledby={titleId} data-wind className="group/card relative">
            {!prop.front && <span className={propBox}>{toy}</span>}

            {/* The cloud. Hovering straightens it and lifts it a little. Drawn in layers,
                so one outline goes around the whole shape: the puffs with their outline,
                the box on top (hiding the puffs' outline inside it), the puffs again
                without one (hiding the box's outline inside them), then the content.
                drop-shadow-pop: a shadow that follows the whole shape */}
            <div
              style={
                {
                  "--lit": `${Math.round((index / Math.max(1, total - 1)) * 100)}%`,
                } as CSSProperties
              }
              className={`relative text-card-foreground drop-shadow-pop transition-[rotate,translate] duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:rotate-0 ${tilt}`}
            >
              {puffs.map((puff, i) => (
                <span
                  key={i}
                  style={puffBox(puff)}
                  className="absolute rounded-full border-3 border-outline bg-card-lit"
                />
              ))}
              <span className="absolute inset-0 rounded-[28px] border-3 border-outline bg-card-lit" />
              {puffs.map((puff, i) => (
                <span
                  key={i}
                  style={puffBox(puff, 3)}
                  className="absolute rounded-full bg-card-lit"
                />
              ))}

              {/* The content, inside the outline. The whole card opens the tour: the "View
                  tour" link spreads an invisible layer over it (after:absolute
                  after:inset-0). overflow-hidden: the sand follows the rounded corners */}
              <div className="relative m-0.75 overflow-hidden rounded-[25px] p-3 @sm:p-4">
                {/* The photo, the biggest thing on the card. alt="": the card's title,
                  right below, already says which tour it is. The first two load right
                  away: both are on screen on load on a desktop */}
                <PlaneWindow
                  landscape
                  rollUp
                  photo={tour.imageCover}
                  sizes="(min-width: 1280px) 384px, (min-width: 1024px) calc(44vw - 146px), (min-width: 768px) calc(44vw - 115px), calc(88vw - 104px)"
                  loading={index < 2 ? "eager" : undefined}
                />

                {/* The name comes first in the HTML, for screen readers that jump from
                  heading to heading; order-first still shows the place above it */}
                <div className="flex flex-col px-1.5 pt-4 @sm:px-2 @sm:pt-5">
                  <h2
                    id={titleId}
                    className="mt-1.5 font-display text-[32px] leading-none font-bold tracking-tight uppercase @sm:mt-2 @sm:text-[40px]"
                  >
                    {tour.name}
                  </h2>
                  <p className="order-first flex items-center gap-1.5 text-[13px] font-bold tracking-[0.08em] text-primary uppercase @sm:text-sm">
                    <PinIcon className="size-4 shrink-0" />
                    {tour.startLocation.description}
                  </p>
                  <p className="mt-2 text-[15px] text-pretty text-muted-foreground @sm:mt-2.5 @sm:text-base">
                    {tour.summary}
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-1.5 text-[13px] font-bold @sm:mt-4 @sm:gap-2 @sm:text-sm">
                    <li className="rounded-full bg-chip px-2.5 py-1.5 text-chip-foreground @sm:px-3">
                      {tour.duration} days
                    </li>
                    <li
                      className={`rounded-full px-2.5 py-1.5 capitalize @sm:px-3 ${DIFFICULTY[tour.difficulty].chip}`}
                    >
                      {tour.difficulty}
                    </li>
                    {/* The API gives a tour with no reviews a 4.5 average, so show "New" */}
                    <li className="rounded-full bg-chip-warm px-2.5 py-1.5 @sm:px-3">
                      <span aria-hidden>★ </span>
                      {tour.ratingsQuantity === 0 ? (
                        "New"
                      ) : (
                        <>
                          {tour.ratingsAverage.toFixed(1)}{" "}
                          <span className="font-medium text-muted-foreground">
                            ({tour.ratingsQuantity} reviews)
                          </span>
                        </>
                      )}
                    </li>
                  </ul>
                </div>

                {/* The beach at the bottom: a wavy edge, then the price and the link on sand.
                  -mx/-mb: out to the card's border */}
                <svg
                  aria-hidden
                  viewBox="0 0 100 6"
                  preserveAspectRatio="none"
                  className="-mx-3 mt-5 -mb-px block h-2.5 w-[calc(100%+1.5rem)] fill-scene-sand @sm:-mx-4 @sm:w-[calc(100%+2rem)]"
                >
                  <path d={WAVE} />
                </svg>
                <div className="-mx-3 -mb-3 flex items-center justify-between gap-3 bg-scene-sand px-4.5 pt-2.5 pb-3.5 @sm:-mx-4 @sm:-mb-4 @sm:px-6 @sm:pb-4.5">
                  <p>
                    <span className="font-display text-[30px] font-bold @sm:text-4xl">
                      ${tour.price.toLocaleString("en-US")}
                    </span>{" "}
                    <span className="text-[13px] whitespace-nowrap @sm:text-sm">per person</span>
                  </p>
                  <ButtonLink
                    href={`/tours/${tour.slug}`}
                    variant="primary"
                    size="sm"
                    className="after:absolute after:inset-0"
                  >
                    View tour<span className="sr-only">: {tour.name}</span>
                    <ArrowIcon className="size-4" />
                  </ButtonLink>
                </div>
              </div>
            </div>

            {hasGulls(index) && <Gulls spots={gullSpots(domes)} tilt={tilt} />}

            {prop.front && (
              <span
                style={rise}
                className={`-translate-y-(--rise) md:-translate-y-(--rise-md) ${propBox}`}
              >
                {toy}
              </span>
            )}
          </article>
        </div>
      </Reveal>
    </li>
  )
}
