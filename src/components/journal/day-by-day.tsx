import { HEADING, WRITE_IN } from "@/components/journal/journal"
import { PencilMap, planRoute } from "@/components/journal/pencil-map"
import { Reveal } from "@/components/reveal"
import type { TourDetails } from "@/lib/tours"

type DayByDayProps = {
  stops: TourDetails["locations"]
  slug: string // names the map's stencil (pencil-map.tsx), which needs an id no other page has
}

// Day by day: a pencil map of the stops, and a round stamp for each day beside it. A tour with
// one stop gets no map (one pin on its own isn't much of a map), just its stamp.
// As it scrolls into view, the pencil draws the route stop by stop, and each stop is stamped
// as the pencil gets there: its pin on the map and its day in the list, at the same moment
// (stampAt). The map and the list each wait for themselves (<Reveal>), because on phones the
// list is under the map. On desktop they sit side by side, and both boxes are the row's full
// height (a grid stretches its items), so they start together; each centers what's inside.
// Reduced motion: it's all just there.
export function DayByDay({ stops, slug }: DayByDayProps) {
  const route = planRoute(stops)
  const map = stops.length > 1

  return (
    <section aria-labelledby="days-title">
      <Reveal>
        <h2 id="days-title" className={HEADING}>
          <span className={WRITE_IN}>day by day</span>
        </h2>
      </Reveal>
      <div className={`mt-6 grid gap-10 ${map ? "lg:grid-cols-[1.15fr_1fr]" : ""}`}>
        {map && (
          <Reveal className="flex items-center">
            <PencilMap route={route} id={`route-${slug}`} className="w-full" />
          </Reveal>
        )}
        <Reveal className="flex flex-col justify-center">
          <ol className="space-y-5">
            {stops.map((stop, i) => (
              <li key={`${stop.day}-${stop.description}`} className="flex items-center gap-4">
                {/* Two lines in the stamp; screen readers read "Day 1". The tilt is on the
                    outer span: the slam turns the inner one, and the two turns add up. */}
                <span className={`shrink-0 ${i % 2 ? "rotate-6" : "-rotate-6"}`}>
                  <span
                    className="grid size-16 place-items-center rounded-full border-3 border-dashed border-coral-600 bg-sand-50 text-center font-display text-sm leading-none font-bold text-coral-600 uppercase motion-safe:waiting:opacity-0 motion-safe:seen:animate-stamp-on"
                    style={{ animationDelay: `${route.stampAt[i]}s` }}
                  >
                    Day
                    <br />
                    {stop.day}
                  </span>
                </span>
                <span className="font-hand text-2xl lowercase md:text-3xl">{stop.description}</span>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  )
}
