import type { Metadata } from "next"
import { Suspense } from "react"
import { PauseOffscreen } from "@/components/pause-offscreen"
import { FilterBar } from "@/components/tours/filter-bar"
import { Horizon } from "@/components/tours/horizon"
import { RouteEnd, RouteStart } from "@/components/tours/route-ends"
import { SettingSun } from "@/components/tours/setting-sun"
import { TourCard } from "@/components/tours/tour-card"
import { TourList } from "@/components/tours/tour-list"
import { TourRoute } from "@/components/tours/tour-route"
import { ToursHeader } from "@/components/tours/tours-header"
import { getTours } from "@/lib/api"
import {
  filtersToQuery,
  filtersToUrl,
  NO_FILTERS,
  parseFilters,
  type Filters,
} from "@/lib/tour-filters"

export const metadata: Metadata = { title: "Tours" } // -> "Tours | Vantage"

// The filters live in the URL, and the URL is only known when someone visits, so it's read
// inside <Suspense>. What's outside a <Suspense> is built ahead of time, and the fallback counts:
// it's the page with no filters. So the saved page still holds every tour, which works with the
// API asleep, or with no JavaScript, and the URL's own version replaces it as soon as it's ready.
export default function ToursPage({ searchParams }: PageProps<"/tours">) {
  return (
    <Suspense fallback={<Tours filters={NO_FILTERS} />}>
      {searchParams.then((params) => (
        <Tours filters={parseFilters(params)} />
      ))}
    </Suspense>
  )
}

// A tour card at each stop of a dotted route down the page, then the same tours as a plain
// list. An async Server Component waits for the data on the server and sends finished HTML.
async function Tours({ filters }: { filters: Filters }) {
  // The API does the filtering and sorting. It has no total count, so the whole list (the same
  // saved copy every visitor shares) says how many tours there are and how long they run.
  const [tours, allTours] = await Promise.all([getTours(filtersToQuery(filters)), getTours({})])
  const days = allTours.map((tour) => tour.duration)
  // Changes with the list. As a key, it starts the cards (or the pause marks) over, so a new
  // list pops in from its stops like the first one did.
  const listKey = filtersToUrl(filters)

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
          top. --ground: how tall the sea and shore are.
          group/tours: lets the route dim while the filter bar waits for a new list. */}
      <section
        aria-labelledby="tours-title"
        className="group/tours relative overflow-clip bg-(image:--sky-day) [--ground:9rem] [view-timeline-inset:0] [view-timeline-name:--sky] md:[--ground:11rem]"
      >
        <SettingSun />
        <ToursHeader shortest={Math.min(...days)} longest={Math.max(...days)} />
        <FilterBar filters={filters} count={tours.length} total={allTours.length} />
        {/* --corridor: the gap between desktop's two columns, where the route runs.
            z-10: over the sea, which comes later, so the sun there can't cover the count */}
        {tours.length > 0 && (
          <div className="relative z-10 mx-auto max-w-6xl px-4 pb-10 transition-opacity [--corridor:6rem] group-has-data-pending/tours:opacity-60 md:px-6 lg:[--corridor:10rem]">
            <TourRoute listKey={listKey}>
              <RouteStart />
              {/* The row gap leaves room for the clouds' puffs and the toys on top */}
              <ol
                key={listKey}
                className="grid gap-y-20 md:grid-cols-2 md:gap-x-(--corridor) md:gap-y-24"
              >
                {tours.map((tour, i) => (
                  <TourCard key={tour.slug} tour={tour} index={i} total={tours.length} />
                ))}
              </ol>
              <RouteEnd count={tours.length} lastOnLeft={tours.length % 2 === 1} />
            </TourRoute>
          </div>
        )}
        <Horizon />
      </section>
      {tours.length > 0 && <TourList tours={tours} />}
      <PauseOffscreen key={listKey} />
    </>
  )
}
