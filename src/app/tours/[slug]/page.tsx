import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { ButtonLink } from "@/components/button"
import { ArrowIcon } from "@/components/icons"
import { Cover } from "@/components/journal/cover"
import { DayByDay } from "@/components/journal/day-by-day"
import { Guides } from "@/components/journal/guides"
import { HEADING, Journal } from "@/components/journal/journal"
import { Plan } from "@/components/journal/plan"
import { Snapshots } from "@/components/journal/snapshots"
import { TravelerNotes } from "@/components/journal/traveler-notes"
import { PauseOffscreen } from "@/components/pause-offscreen"
import { getTour, getTourReviews, getTours } from "@/lib/api"

// One tour's page, e.g. /tours/the-sea-explorer. [slug] in the folder name is a dynamic
// segment, like /tours/:slug in Express or React Router. The page is a travel journal (5b):
// one notebook page, one section per component in src/components/journal/.

// Builds every tour's page ahead of time (the same saved list as /tours), so no visitor waits
// for the API, even while it sleeps. A tour added later gets its page on its first visit.
export async function generateStaticParams() {
  const tours = await getTours({})
  return tours.map((tour) => ({ slug: tour.slug }))
}

// The tab's title, e.g. "The Sea Explorer | Vantage" (the root layout adds " | Vantage")
export async function generateMetadata({ params }: PageProps<"/tours/[slug]">): Promise<Metadata> {
  const tour = await getTour((await params).slug)
  return tour ? { title: tour.name, description: tour.summary } : { title: "Tour not found" }
}

// The slug is URL data, so it's read inside <Suspense>, like the filters on /tours: the part
// outside is the shell every "View tour" link prefetches (partialPrefetching), and the tour
// itself streams in. The 9 built pages arrive whole.
export default function TourPage({ params }: PageProps<"/tours/[slug]">) {
  return (
    <Suspense
      fallback={
        <Journal>
          <p className="font-hand text-3xl text-primary">loading the tour…</p>
        </Journal>
      }
    >
      {params.then(({ slug }) => (
        <TourDetails slug={slug} />
      ))}
    </Suspense>
  )
}

async function TourDetails({ slug }: { slug: string }) {
  const tour = await getTour(slug)
  // An unknown slug: Next's 404 page, with a noindex tag so search engines skip it. (It keeps
  // a 200 status, because the page has started streaming by then.)
  if (!tour) notFound()
  const reviews = await getTourReviews(tour._id)
  const stops = [...tour.locations].sort((a, b) => a.day - b.day)

  return (
    <>
      <Journal>
        {/* "first stop" only when there's a second one; "the plan" already says where it starts */}
        <Cover tour={tour} firstStop={stops.length > 1 ? stops[0] : undefined} />
        <Plan tour={tour} />
        <About description={tour.description} />
        {/* The API allows a tour with no stops: then there's no day by day */}
        {stops.length > 0 && <DayByDay stops={stops} />}
        <Snapshots name={tour.name} images={tour.images} />
        <Guides guides={tour.guides} />
        <TravelerNotes reviews={reviews} />
        <LastLine />
      </Journal>
      <PauseOffscreen />
    </>
  )
}

// About this trip: the description as journal text, written on the lines (leading-8 is the
// lines' 32px)
function About({ description }: { description: string }) {
  return (
    <section aria-labelledby="about-title" className="max-w-2xl">
      <h2 id="about-title" className={HEADING}>
        about this trip
      </h2>
      <div className="mt-2 space-y-8 text-lg leading-8 text-pretty">
        {description
          .split("\n")
          .filter(Boolean) // a blank line would make an empty paragraph
          .map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
      </div>
    </section>
  )
}

// The journal's last line. Booking arrives in phase 5, which adds "Save my seat" here; until
// then, the way back to every tour.
function LastLine() {
  return (
    <section aria-labelledby="end-title" className="text-center">
      <h2 id="end-title" className={HEADING}>
        see you there
      </h2>
      <ButtonLink href="/tours" size="sm" className="mt-6">
        See all tours
        <ArrowIcon className="size-4.5" />
      </ButtonLink>
    </section>
  )
}
