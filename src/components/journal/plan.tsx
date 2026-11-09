import { HEADING, Tape, WRITE_IN } from "@/components/journal/journal"
import { Reveal } from "@/components/reveal"
import { days, type TourDetails } from "@/lib/tours"

// The start dates as "Sat, Jun 19, 2021". timeZone: the API's dates are around midnight UTC,
// and the server's own time zone could move one to the day before.
const DATE = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
})

// When each piece starts. The section comes in three parts, and each one waits for itself to
// scroll into view (<Reveal>), because on phones they're a screen apart: the checklist, the
// dates, then the ticket stub. On desktop the stub sits beside the checklist, so those two
// start together. Reduced motion: nothing plays, everything is just there.
const AT = {
  // The checklist
  heading: "0s", // "the plan" writes itself in
  tick: (i: number) => `${0.5 + i * 0.15}s`, // then the boxes are ticked, top to bottom
  // The dates
  nextTrips: "0s", // "next trips:" writes itself in
  circle: "0.6s", // then the pen circles the first one
  // The ticket stub
  stub: "0.3s", // dropped onto the page...
  tape: "0.95s", // ...and taped down once it lands
}

// The plan: the tour's facts as a ticked checklist, the next start dates (the first one
// circled in pen), and the price on a ticket stub taped beside them
export function Plan({ tour }: { tour: TourDetails }) {
  const plan = [
    `${days(tour.duration)}, starting in ${tour.startLocation.description.split(",")[0]}`,
    `how hard: ${tour.difficulty}`,
    `groups of up to ${tour.maxGroupSize} people`,
    // The API gives an unrated tour a 4.5 average, so a new tour says so instead
    tour.ratingsQuantity === 0
      ? "new: no reviews yet"
      : `rated ${tour.ratingsAverage} by ${tour.ratingsQuantity} travelers`,
    `we meet at ${tour.startLocation.address.split(",")[0]}`,
  ]

  return (
    <section
      aria-labelledby="plan-title"
      className="grid gap-14 md:grid-cols-[1fr_auto] md:items-start"
    >
      <div>
        <Reveal>
          <h2 id="plan-title" className={HEADING}>
            <span className={WRITE_IN} style={{ animationDelay: AT.heading }}>
              the plan
            </span>
          </h2>
          <ul className="mt-4 text-lg leading-8">
            {plan.map((item, i) => (
              // items-start: a line that wraps (narrow phones) keeps its box on the first line
              <li key={item} className="flex items-start gap-3">
                <Check at={AT.tick(i)} /> {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="mt-8">
          <h3 className="font-hand text-2xl text-primary">
            <span className={WRITE_IN} style={{ animationDelay: AT.nextTrips }}>
              next trips:
            </span>
          </h3>
          <ul className="mt-1 flex flex-wrap gap-x-10 text-lg leading-8">
            {tour.startDates.map((date, i) => (
              <li key={date} className="relative">
                {i === 0 && <PenLoop />}
                {DATE.format(new Date(date))}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      {/* The ticket stub. Booking arrives in phase 5, which puts a "Save my seat" button here.
          The Reveal box holds the tilt and never moves (the observer measures where it is);
          the card inside it drops, like the cover photo. It starts only 10% bigger
          (--drop-from) and turned against its tilt (--drop-turn), so it turns into the tilt as
          it falls: otherwise a 320px phone's page edge would cut off a corner mid-fall. */}
      <Reveal className="relative mx-auto w-full max-w-64 rotate-3 md:mx-0 md:w-64">
        <Tape
          className="-top-3 left-1/2 h-7 w-24 -translate-x-1/2 -rotate-3 motion-safe:waiting:opacity-0 motion-safe:seen:animate-tape-on"
          style={{ animationDelay: AT.tape }}
        />
        <div
          className="rounded-2xl border-4 border-navy-950 bg-sun-300 p-6 text-navy-950 shadow-lg [--drop-from:1.1] [--drop-turn:-6deg] motion-safe:waiting:opacity-0 motion-safe:seen:animate-drop-in"
          style={{ animationDelay: AT.stub }}
        >
          <p className="text-[11px] font-extrabold tracking-[0.16em] uppercase">
            Admit one · {tour.name}
          </p>
          <p className="mt-3 font-display text-6xl leading-none font-bold">
            ${tour.price.toLocaleString("en-US")}
          </p>
          <p className="text-sm font-bold">
            per person
            {tour.priceDiscount ? ` · $${tour.priceDiscount.toLocaleString("en-US")} off` : ""}
          </p>
          <div aria-hidden className="my-4 border-t-3 border-dashed border-navy-950" />
          <p className="-rotate-2 font-hand text-2xl">booking opens soon</p>
        </div>
      </Reveal>
    </section>
  )
}

// A ticked box, drawn in pen. Decoration: the list says it all. The box is always there; the
// tick draws itself in at its turn (at), down then up, like a pen (draw in globals.css: the
// path's pathLength="1" is what lets the dash be "as long as the line").
function Check({ at }: { at: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="mt-1 size-6 shrink-0">
      <rect
        x="3"
        y="4"
        width="17"
        height="16"
        rx="2"
        fill="none"
        strokeWidth="2"
        transform="rotate(-3 12 12)"
        className="stroke-navy-700"
      />
      <path
        d="M7 12l4 4 9-11"
        pathLength={1}
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-coral-600 motion-safe:waiting:opacity-0 motion-safe:seen:animate-tick"
        style={{ animationDelay: at }}
      />
    </svg>
  )
}

// A pen loop around a 180×44 box: a little more than one turn, counterclockwise from the right
// end, growing a little as it goes, so it ends with a small flick just past its start, like a
// real pen. Made with a small script (an ellipse whose size grows along the way, as 10 curves).
// The flick is at the top right, where nothing is written above it.
const LOOP =
  "M170.8 16.2C164.5 12.3 152.2 8.9 136.4 6.6C120.5 4.3 101.3 3.2 82.5 3.5C63.6 3.7 45.3 5.4 31.3 8.1C17.2 10.9 7.5 14.6 4.1 18.7C0.7 22.9 3.7 27.2 12.4 31C21.1 34.8 35.6 37.9 52.9 39.8C70.2 41.6 90.3 42.1 109.1 41.2C127.9 40.3 145.2 38 157.7 34.6C170.2 31.3 177.7 26.9 178.6 22.5C179.6 18 174 13.5 162.9 9.7"

// The pen circle around the first date: it draws itself around at its turn (AT.circle). The
// <span> sets the box, a bit bigger than the date; the drawing stretches to fill it
// (preserveAspectRatio="none"). With the box, dates measure 160–181px wide, close to the
// drawing's 180, so the line stays about 2px thick.
function PenLoop() {
  return (
    <span aria-hidden className="absolute -inset-x-4 -inset-y-1.5 -rotate-3">
      <svg
        viewBox="0 0 180 44"
        preserveAspectRatio="none"
        overflow="visible"
        className="block size-full"
      >
        <path
          d={LOOP}
          pathLength={1}
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          className="stroke-coral-500 motion-safe:waiting:opacity-0 motion-safe:seen:animate-circle"
          style={{ animationDelay: AT.circle }}
        />
      </svg>
    </span>
  )
}
