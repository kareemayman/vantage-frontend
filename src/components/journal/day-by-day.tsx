import { HEADING } from "@/components/journal/journal"
import { PencilMap } from "@/components/journal/pencil-map"
import type { TourDetails } from "@/lib/tours"

// Day by day: a pencil map of the stops, and a round stamp for each day beside it. A tour with
// one stop gets no map (one pin on its own isn't much of a map), just its stamp.
export function DayByDay({ stops }: { stops: TourDetails["locations"] }) {
  const map = stops.length > 1

  return (
    <section aria-labelledby="days-title">
      <h2 id="days-title" className={HEADING}>
        day by day
      </h2>
      <div className={`mt-6 grid items-center gap-10 ${map ? "lg:grid-cols-[1.15fr_1fr]" : ""}`}>
        {map && <PencilMap stops={stops} className="w-full" />}
        <ol className="space-y-5">
          {stops.map((stop, i) => (
            <li key={`${stop.day}-${stop.description}`} className="flex items-center gap-4">
              {/* Two lines in the stamp; screen readers read "Day 1" */}
              <span
                className={`grid size-16 shrink-0 place-items-center rounded-full border-3 border-dashed border-coral-600 bg-sand-50 text-center font-display text-sm leading-none font-bold text-coral-600 uppercase ${i % 2 ? "rotate-6" : "-rotate-6"}`}
              >
                Day
                <br />
                {stop.day}
              </span>
              <span className="font-hand text-2xl lowercase md:text-3xl">{stop.description}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
