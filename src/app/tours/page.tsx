import type { Metadata } from "next"
import { PauseOffscreen } from "@/components/pause-offscreen"
import { RouteEnd, RouteStart } from "@/components/tours/route-ends"
import { TourCard } from "@/components/tours/tour-card"
import { TourList } from "@/components/tours/tour-list"
import { TourRoute } from "@/components/tours/tour-route"
import { ToursHeader } from "@/components/tours/tours-header"
import { getTours } from "@/lib/api"

export const metadata: Metadata = { title: "Tours" } // -> "Tours | Vantage"

// The tours page: a tour card at each stop of a dotted route down the page, then every
// tour as a plain list. An async Server Component waits for the data on the server and
// sends finished HTML, so there's no useEffect and no loading state here.
export default async function ToursPage() {
  // Cheapest first (the design's default sort, "Price: low to high"), sorted by the API
  const tours = await getTours()
  const days = tours.map((tour) => tour.duration)

  return (
    <>
      {/* The sky: it fades into the page background at the bottom. overflow-x-clip: the
          cards' props and their pop-in can poke past the screen's sides without making
          the page scroll sideways */}
      <section
        aria-labelledby="tours-title"
        className="overflow-x-clip bg-linear-to-b from-scene-sky-top via-scene-sky-mid via-40% to-scene-sky-low"
      >
        <ToursHeader shortest={Math.min(...days)} longest={Math.max(...days)} />
        {/* --corridor: the gap between desktop's two columns, where the route runs */}
        <div className="mx-auto max-w-6xl px-4 pb-16 [--corridor:6rem] md:px-6 md:pb-20 lg:[--corridor:10rem]">
          <TourRoute>
            <RouteStart />
            {/* The row gap leaves room for the clouds' puffs and the toys on top */}
            <ol className="grid gap-y-20 md:grid-cols-2 md:gap-x-(--corridor) md:gap-y-24">
              {tours.map((tour, i) => (
                <TourCard key={tour.slug} tour={tour} index={i} />
              ))}
            </ol>
            <RouteEnd count={tours.length} lastOnLeft={tours.length % 2 === 1} />
          </TourRoute>
        </div>
      </section>
      <TourList tours={tours} />
      <PauseOffscreen />
    </>
  )
}
