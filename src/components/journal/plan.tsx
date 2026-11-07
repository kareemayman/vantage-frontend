import { HEADING, Tape } from "@/components/journal/journal"
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
        <h2 id="plan-title" className={HEADING}>
          the plan
        </h2>
        <ul className="mt-4 text-lg leading-8">
          {plan.map((item) => (
            // items-start: a line that wraps (narrow phones) keeps its box on the first line
            <li key={item} className="flex items-start gap-3">
              <Check /> {item}
            </li>
          ))}
        </ul>
        <h3 className="mt-8 font-hand text-2xl text-primary">next trips:</h3>
        <ul className="mt-1 flex flex-wrap gap-x-10 text-lg leading-8">
          {tour.startDates.map((date, i) => (
            <li key={date} className="relative">
              {i === 0 && (
                <span
                  aria-hidden
                  className="absolute -inset-x-4 -inset-y-1.5 -rotate-3 rounded-[50%] border-2 border-coral-500"
                />
              )}
              {DATE.format(new Date(date))}
            </li>
          ))}
        </ul>
      </div>

      {/* The ticket stub. Booking arrives in phase 5, which puts a "Save my seat" button here */}
      <div className="relative mx-auto w-full max-w-64 rotate-3 md:mx-0 md:w-64">
        <Tape className="-top-3 left-1/2 h-7 w-24 -translate-x-1/2 -rotate-3" />
        <div className="rounded-2xl border-4 border-navy-950 bg-sun-300 p-6 text-navy-950 shadow-lg">
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
      </div>
    </section>
  )
}

// A ticked box, drawn in pen. Decoration: the list says it all.
function Check() {
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
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-coral-600"
      />
    </svg>
  )
}
