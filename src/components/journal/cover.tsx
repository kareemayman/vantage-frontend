import Image from "next/image"
import Link from "next/link"
import { Tape } from "@/components/journal/journal"
import { DIFFICULTY } from "@/components/tours/difficulty"
import { days, type TourDetails } from "@/lib/tours"

type CoverProps = {
  tour: TourDetails
  firstStop?: TourDetails["locations"][number] // only when there's more than one stop
}

// The journal's first page: where and how long, the tour's name with a highlighter stroke,
// the summary, and the cover photo taped in, with the difficulty stamped over its corner.
// Phones: the photo goes under the words.
export function Cover({ tour, firstStop }: CoverProps) {
  return (
    <section
      aria-labelledby="tour-title"
      className="grid items-center gap-14 lg:grid-cols-[1fr_1.1fr]"
    >
      <div>
        <Link href="/tours" className="font-hand text-2xl text-primary hover:underline">
          ← all tours
        </Link>
        <p className="mt-6 -rotate-1 font-hand text-3xl text-primary lowercase">
          {tour.startLocation.description} · {days(tour.duration)}
        </p>
        {/* Phones: shrinks with the screen, so the longest word ("ADVENTURER") still fits at
            320px. box-decoration-clone: the highlighter breaks with the lines, one per line. */}
        <h1
          id="tour-title"
          className="mt-3 font-display text-[clamp(2.25rem,11vw,5.5rem)] leading-[1.05] font-bold tracking-tight uppercase lg:text-[clamp(3.5rem,6vw,5rem)]"
        >
          <span className="bg-[linear-gradient(transparent_55%,var(--color-sky-200)_55%_92%,transparent_92%)] box-decoration-clone px-1">
            {tour.name}
          </span>
        </h1>
        <p className="mt-6 max-w-md text-lg leading-8 text-pretty">{tour.summary}</p>
        {firstStop && (
          <p className="mt-6 rotate-1 font-hand text-2xl text-coral-600 lowercase">
            first stop: {firstStop.description} ↓
          </p>
        )}
      </div>

      <figure className="relative mx-auto w-full max-w-xl rotate-2">
        <Tape className="-top-3 -left-5 h-8 w-28 -rotate-30" />
        <Tape color="sand" className="-top-3 -right-5 h-8 w-28 rotate-30" />
        <div className="border border-sand-300 bg-white p-3 shadow-xl">
          <div className="relative aspect-4/3">
            {/* The first thing a visitor sees, so it loads first (eager) */}
            <Image
              src={tour.imageCover}
              alt={tour.name}
              fill
              sizes="(min-width: 1152px) 540px, (min-width: 1024px) 45vw, calc(100vw - 88px)"
              loading="eager"
              className="object-cover"
            />
          </div>
        </div>
        {/* A rubber stamp: decoration, since "the plan" says how hard it is */}
        <span
          aria-hidden
          className={`absolute -bottom-6 -left-6 -rotate-12 rounded-lg border-4 border-dashed px-4 py-2 font-display text-2xl leading-none font-bold tracking-[0.08em] uppercase ${DIFFICULTY[tour.difficulty].stamp}`}
        >
          {tour.difficulty}
        </span>
      </figure>
    </section>
  )
}
