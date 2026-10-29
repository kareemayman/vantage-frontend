import { Cloud } from "@/components/scene/sky"

// The two ends of the tours page's route. They go inside <TourRoute>, which draws the
// line from data-route-start, through the cards' stops, to data-route-end.

// Where the route starts.
// - Phones: at the top of the route's gutter, with a "start here" note pointing at it.
// - md+: a departure cloud in the empty sky beside the first card (the right column starts
//   half a card lower). The route leaves from on top of it, where the plane will wait.
// Decoration, so screen readers skip it.
export function RouteStart() {
  return (
    <>
      {/* Phones: the arrow's tip (17px in, 64px down) lands on the route's first point */}
      <p
        aria-hidden
        className="absolute -top-16 left-3.75 flex -rotate-4 items-start gap-1 font-hand text-[22px] leading-none whitespace-nowrap text-primary lowercase md:hidden"
      >
        <Arrow className="mt-3 -scale-x-100" />
        start here
      </p>

      <div
        aria-hidden
        className="absolute top-2 left-[calc(50%+var(--corridor)/2+1.5rem)] hidden w-48 md:block lg:w-60"
      >
        <Cloud shade className="w-full" />
        <span data-route-start className="absolute top-[40%] left-1/2" />
        {/* Under the cloud, pointing up at it (the arrow turned around) */}
        <p className="mt-1 ml-[40%] flex -rotate-4 items-start gap-1 font-hand text-[28px] leading-none whitespace-nowrap text-primary lowercase">
          <Arrow className="rotate-180" />
          start here
        </p>
      </div>
    </>
  )
}

// Where the route ends: the tour count. Phones: under the last card. md+: in the empty
// corner beside the last card, facing it across the route (`lastOnLeft`: which column the
// last card is in).
export function RouteEnd({ count, lastOnLeft }: { count: number; lastOnLeft: boolean }) {
  return (
    <p
      data-route-end
      className={`mt-14 w-fit rounded-full border-2 border-nav-border bg-nav px-4 py-1 font-semibold md:absolute md:bottom-0 md:mt-0 ${lastOnLeft ? "md:left-[calc(50%+var(--corridor)/2)]" : "md:right-[calc(50%+var(--corridor)/2)]"}`}
    >
      That&apos;s all <span className="font-display text-2xl font-bold">{count}</span>{" "}
      {count === 1 ? "tour" : "tours"}
    </p>
  )
}

// A doodled arrow, pointing down (turn it with className)
function Arrow({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 58 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`w-13.5 shrink-0 ${className}`}
    >
      <path d="M6 6C34 8 50 26 40 56M40 56L30 47M40 56L50 49" />
    </svg>
  )
}
