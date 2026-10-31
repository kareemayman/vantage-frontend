import type { Metadata } from "next"
import { PauseOffscreen } from "@/components/pause-offscreen"
import { Horizon } from "@/components/tours/horizon"
import { RouteEnd, RouteStart } from "@/components/tours/route-ends"
import { SettingSun } from "@/components/tours/setting-sun"
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
      {/* The sky: one long gradient from morning at the top to sunset at the sea (--sky-day),
          so scrolling down the page is what moves the time of day along. overflow-clip: the
          cards' props and their pop-in can poke past the screen's sides without making the
          page scroll sideways, and the sun can't show past the sky's bottom edge. It doesn't
          stop the sun from sticking, unlike overflow-hidden.
          --sky: the scroll position of this section, as a timeline the sun's animation
          follows (globals.css). The inset: without it, the timeline leaves out the part of
          the screen under the navbar (scroll-pt on <html>) and starts ahead of the page's
          top. --ground: how tall the sea and shore are. */}
      <section
        aria-labelledby="tours-title"
        className="relative overflow-clip bg-(image:--sky-day) [--ground:9rem] [view-timeline-inset:0] [view-timeline-name:--sky] md:[--ground:11rem]"
      >
        <SettingSun />
        <ToursHeader shortest={Math.min(...days)} longest={Math.max(...days)} />
        {/* --corridor: the gap between desktop's two columns, where the route runs.
            z-10: over the sea, which comes later, so the sun there can't cover the count */}
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-10 [--corridor:6rem] md:px-6 lg:[--corridor:10rem]">
          <TourRoute>
            <RouteStart />
            {/* The row gap leaves room for the clouds' puffs and the toys on top */}
            <ol className="grid gap-y-20 md:grid-cols-2 md:gap-x-(--corridor) md:gap-y-24">
              {tours.map((tour, i) => (
                <TourCard key={tour.slug} tour={tour} index={i} total={tours.length} />
              ))}
            </ol>
            <RouteEnd count={tours.length} lastOnLeft={tours.length % 2 === 1} />
          </TourRoute>
        </div>
        <Horizon />
      </section>
      <TourList tours={tours} />
      <PauseOffscreen />
    </>
  )
}
