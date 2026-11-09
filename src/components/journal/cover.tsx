import Image from "next/image"
import Link from "next/link"
import { Tape } from "@/components/journal/journal"
import { DIFFICULTY } from "@/components/tours/difficulty"
import { days, type TourDetails } from "@/lib/tours"

type CoverProps = {
  tour: TourDetails
  firstStop?: TourDetails["locations"][number] // only when there's more than one stop
}

// The cover puts itself together as the page appears. It's the first screen, so it plays on
// load, with no <Reveal>: that only starts once the page's script runs, so a visitor would see
// the finished cover, then see it vanish and play. Each value is when that piece starts, from
// the moment the page appears. Reduced motion: nothing plays, the cover is just there.
const AT = {
  photo: "0s", // dropped onto the page. First: it's the biggest thing on the page, and the
  // loading score (LCP) waits until it shows
  place: "0.1s", // "miami, usa · 7 days" writes itself in
  title: "0.45s", // the highlighter goes over the name, line by line
  tapeLeft: "0.7s", // the strips of tape press on, one after the other
  tapeRight: "0.85s",
  stamp: "1.05s", // the difficulty is stamped on the photo's corner
  firstStop: "1.4s", // "first stop: …" writes itself in
  arrow: "2.2s", // ...then its arrow nudges you down the page
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
        {/* The pen goes on a <span>, which is only as wide as the words (the <p> is as wide as
            the column), and follows them onto a second line */}
        <p className="mt-6 -rotate-1 font-hand text-3xl text-primary lowercase">
          <span className="motion-safe:animate-write" style={{ animationDelay: AT.place }}>
            {tour.startLocation.description} · {days(tour.duration)}
          </span>
        </p>
        {/* Phones: shrinks with the screen, so the longest word ("ADVENTURER") still fits at
            320px. The highlighter is a background band behind the letters' lower half. Like any
            background on a <span>, it breaks with the lines, and it grows along line 1, then
            line 2. (No side padding: it would only pad the first line's start, and push that
            line out of line with the others.) */}
        <h1
          id="tour-title"
          className="mt-3 font-display text-[clamp(2.25rem,11vw,5.5rem)] leading-[1.05] font-bold tracking-tight uppercase lg:text-[clamp(3.5rem,6vw,5rem)]"
        >
          <span
            className="bg-[linear-gradient(transparent_55%,var(--color-sky-200)_55%_92%,transparent_92%)] bg-no-repeat motion-safe:animate-highlight"
            style={{ animationDelay: AT.title }}
          >
            {tour.name}
          </span>
        </h1>
        <p className="mt-6 max-w-md text-lg leading-8 text-pretty">{tour.summary}</p>
        {firstStop && (
          <p className="mt-6 rotate-1 font-hand text-2xl text-coral-600 lowercase">
            <span className="motion-safe:animate-write" style={{ animationDelay: AT.firstStop }}>
              first stop: {firstStop.description}{" "}
              {/* inline-block: a plain inline element can't be moved with translate */}
              <span
                className="inline-block motion-safe:animate-nudge"
                style={{ animationDelay: AT.arrow }}
              >
                ↓
              </span>
            </span>
          </p>
        )}
      </div>

      <figure className="relative mx-auto w-full max-w-xl rotate-2">
        <Tape
          className="-top-3 -left-5 h-8 w-28 -rotate-30 motion-safe:animate-tape-on"
          style={{ animationDelay: AT.tapeLeft }}
        />
        <Tape
          color="sand"
          className="-top-3 -right-5 h-8 w-28 rotate-30 motion-safe:animate-tape-on"
          style={{ animationDelay: AT.tapeRight }}
        />
        {/* --drop-from: it starts 10% bigger, not the polaroids' 25%: this photo is bigger,
            and the page's edge would cut it off */}
        <div
          className="border border-sand-300 bg-white p-3 shadow-xl [--drop-from:1.1] motion-safe:animate-drop-in"
          style={{ animationDelay: AT.photo }}
        >
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
        {/* A rubber stamp: decoration, since "the plan" says how hard it is. Its tilt is on
            the outer span: the slam turns the inner one, and the two turns add up. */}
        <span aria-hidden className="absolute -bottom-6 -left-6 -rotate-12">
          <span
            className={`block rounded-lg border-4 border-dashed px-4 py-2 font-display text-2xl leading-none font-bold tracking-[0.08em] uppercase motion-safe:animate-stamp-on ${DIFFICULTY[tour.difficulty].stamp}`}
            style={{ animationDelay: AT.stamp }}
          >
            {tour.difficulty}
          </span>
        </span>
      </figure>
    </section>
  )
}
