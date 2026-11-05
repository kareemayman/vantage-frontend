import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense, type ReactNode } from "react"
import { PauseOffscreen } from "@/components/pause-offscreen"
import { getTour, getTourReviews, getTours } from "@/lib/api"

// One tour's page, e.g. /tours/the-sea-explorer. [slug] in the folder name is a dynamic
// segment, like /tours/:slug in Express or React Router. Step 5a: everything the API has
// about the tour, plainly, so the design (5b) knows what it's working with.

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
    <Suspense fallback={<p className={`${CONTAINER} pt-28 md:pt-36`}>Loading the tour…</p>}>
      {params.then(({ slug }) => (
        <TourDetails slug={slug} />
      ))}
    </Suspense>
  )
}

const CONTAINER = "mx-auto max-w-6xl px-6"
const H2 = "font-display text-3xl font-bold tracking-tight uppercase md:text-4xl"

// The start dates as "Sat, Jun 19, 2021". timeZone: the API's dates are midnight-ish UTC, and
// the server's own time zone could move one to the day before.
const DATE = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
})

async function TourDetails({ slug }: { slug: string }) {
  const tour = await getTour(slug)
  // An unknown slug: Next's 404 page, with a noindex tag so search engines skip it. (It keeps
  // a 200 status, because the page has started streaming by then.)
  if (!tour) notFound()
  const reviews = await getTourReviews(tour._id)
  const stops = [...tour.locations].sort((a, b) => a.day - b.day)

  return (
    <>
      <section aria-labelledby="tour-title" className={`${CONTAINER} pt-28 pb-12 md:pt-36`}>
        <Link href="/tours" className="text-sm font-bold text-primary hover:underline">
          ← All tours
        </Link>
        <p className="mt-6 text-sm font-extrabold tracking-[0.16em] text-primary uppercase">
          {tour.startLocation.description}
        </p>
        <h1
          id="tour-title"
          className="mt-1 font-display text-5xl font-bold tracking-tight uppercase md:text-7xl"
        >
          {tour.name}
        </h1>
        <p className="mt-3 max-w-2xl text-pretty text-muted-foreground md:text-lg">
          {tour.summary}
        </p>
        {/* The biggest photo on the page loads first (eager): it's what the visitor sees first */}
        <div className="relative mt-8 aspect-video overflow-hidden rounded-3xl bg-muted">
          <Image
            src={tour.imageCover}
            alt={tour.name}
            fill
            sizes="(min-width: 1152px) 1104px, calc(100vw - 48px)"
            loading="eager"
            className="object-cover"
          />
        </div>
        <dl className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <Fact term="Length">{tour.duration} days</Fact>
          <Fact term="How hard">
            <span className="capitalize">{tour.difficulty}</span>
          </Fact>
          <Fact term="Group size">Up to {tour.maxGroupSize} people</Fact>
          <Fact term="Rating">
            {/* The API gives an unrated tour a 4.5 average, so "New" says what's true */}
            {tour.ratingsQuantity === 0
              ? "New: no reviews yet"
              : `${tour.ratingsAverage} out of 5 (${tour.ratingsQuantity} reviews)`}
          </Fact>
          <Fact term="Price">
            ${tour.price.toLocaleString("en-US")} per person
            {tour.priceDiscount ? ` ($${tour.priceDiscount} off)` : ""}
          </Fact>
          <Fact term="Starts at">{tour.startLocation.address}</Fact>
        </dl>
      </section>

      <section aria-labelledby="about-title" className={`${CONTAINER} py-12`}>
        <h2 id="about-title" className={H2}>
          About this tour
        </h2>
        <div className="mt-4 max-w-2xl space-y-4 text-pretty">
          {tour.description
            .split("\n")
            .filter(Boolean) // a blank line would make an empty paragraph
            .map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
        </div>
        <h3 className="mt-8 font-bold">Start dates</h3>
        <ul className="mt-2 text-muted-foreground">
          {tour.startDates.map((date) => (
            <li key={date}>{DATE.format(new Date(date))}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="photos-title" className={`${CONTAINER} py-12`}>
        <h2 id="photos-title" className={H2}>
          Photos
        </h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {tour.images.map((image, i) => (
            <li key={image} className="relative aspect-4/3 overflow-hidden rounded-2xl bg-muted">
              <Image
                src={image}
                alt={`${tour.name}, photo ${i + 1} of ${tour.images.length}`}
                fill
                sizes="(min-width: 1152px) 357px, (min-width: 768px) calc((100vw - 80px) / 3), calc(100vw - 48px)"
                className="object-cover"
              />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="stops-title" className={`${CONTAINER} py-12`}>
        <h2 id="stops-title" className={H2}>
          Day by day
        </h2>
        <ol className="mt-6 space-y-3">
          {stops.map((stop) => (
            <li key={`${stop.day}-${stop.description}`}>
              <span className="font-bold">Day {stop.day}:</span> {stop.description}{" "}
              <span className="text-sm text-muted-foreground">
                ({stop.coordinates[1]}, {stop.coordinates[0]})
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="guides-title" className={`${CONTAINER} py-12`}>
        <h2 id="guides-title" className={H2}>
          Your guides
        </h2>
        <ul className="mt-6 flex flex-wrap gap-8">
          {tour.guides.map((guide) => (
            <li key={guide._id} className="flex items-center gap-4">
              <Avatar photo={guide.photo} />
              <span>
                <span className="block font-bold">{guide.name}</span>
                <span className="text-sm text-muted-foreground">
                  {guide.role === "lead-guide" ? "Lead guide" : "Tour guide"}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="reviews-title" className={`${CONTAINER} py-12 pb-24`}>
        <h2 id="reviews-title" className={H2}>
          Reviews ({reviews.length})
        </h2>
        <ul className="mt-6 grid gap-6 md:grid-cols-2">
          {reviews.map((review) => (
            <li key={review._id} className="rounded-2xl border-2 border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <Avatar photo={review.user?.photo} size={40} />
                <span>
                  {/* A deleted account leaves its review behind with no user */}
                  <span className="block font-bold">{review.user?.name ?? "A past traveler"}</span>
                  <span className="text-sm text-muted-foreground">{review.rating} out of 5</span>
                </span>
              </div>
              <p className="mt-3 text-pretty">{review.review}</p>
            </li>
          ))}
        </ul>
      </section>
      <PauseOffscreen />
    </>
  )
}

// One fact in the list under the cover: a label and its value
function Fact({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
        {term}
      </dt>
      <dd className="mt-1 font-semibold">{children}</dd>
    </div>
  )
}

// A round photo of a guide or a traveler. alt="": their name is right beside it. Without a
// photo, an empty circle keeps the rows lined up.
function Avatar({ photo, size = 64 }: { photo?: string; size?: number }) {
  return photo ? (
    <Image
      src={photo}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="shrink-0 rounded-full object-cover"
    />
  ) : (
    <span style={{ width: size, height: size }} className="block shrink-0 rounded-full bg-muted" />
  )
}
