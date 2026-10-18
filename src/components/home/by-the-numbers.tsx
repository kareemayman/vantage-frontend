import { FEATURED_TOURS, TOUR_STATS } from "@/lib/tours"

// The numbers come from the API's tour stats (getTourStats does the math); typed in as
// TOUR_STATS until phase 2 fetches them
const { toursCount, totalRatings, avgRating } = TOUR_STATS
// "Miami, Banff and Utah": each featured tour's starting place, without its country
const places = new Intl.ListFormat("en-GB").format([
  ...new Set(FEATURED_TOURS.map((tour) => tour.startLocation.description.split(",")[0])),
])

const STATS = [
  { value: String(toursCount), label: "Summer tours", detail: places },
  {
    value: avgRating.toFixed(1), // 4.87 → "4.9"
    label: "Average rating",
    detail: `across ${totalRatings} reviews`,
    star: true,
    sun: true, // the highlight: sun-colored tiles
  },
  { value: String(totalRatings), label: "Happy travelers reviewed", detail: "and counting" },
]

// 05 By the numbers (design/HANDOFF.md): three numbers on flip-board tiles, one tile per
// digit, like an airport departure board. Phones: tiles left, words right. md+: three
// columns, words under the tiles. Every tile size is in em of the row's font size, so
// one text-* class sizes them all.
export function ByTheNumbers() {
  return (
    <section aria-labelledby="numbers-title" className="bg-muted py-14 md:pt-22 md:pb-32">
      <div className="mx-auto max-w-360 px-4 md:px-10 lg:px-20">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
          <h2
            id="numbers-title"
            className="text-[13px] font-extrabold tracking-[0.16em] text-primary uppercase md:text-sm"
          >
            By the numbers
          </h2>
          <p className="font-hand text-[22px] text-primary md:rotate-4 md:text-[28px]">
            counted by hand, mostly
          </p>
        </div>

        <ul className="mt-6 grid gap-5.5 md:mt-12 md:grid-cols-3 md:gap-10">
          {STATS.map((stat) => (
            <li key={stat.label} className="flex items-center gap-4 md:block">
              {/* The tiles are for the eyes; screen readers get the number as text.
                  Phones: the tiles shrink with the screen, so the words beside them
                  keep room (80px digits on wide phones, about 54px at 320). */}
              <p className="flex items-end gap-[0.06em] font-display text-[min(5rem,17vw)] leading-none font-bold md:text-[clamp(5rem,9.72vw,8.75rem)]">
                <span className="sr-only">{stat.value}</span>
                {[...stat.value].map((char, i) =>
                  char === "." ? (
                    <span key={i} aria-hidden className="text-[0.57em]">
                      .
                    </span>
                  ) : (
                    <Flap key={i} char={char} sun={stat.sun} />
                  ),
                )}
              </p>
              <div className="md:mt-4.5">
                <p className="text-lg font-bold md:text-xl">
                  {stat.label}
                  {stat.star && <span aria-hidden> ★</span>}
                </p>
                <p className="mt-0.5 text-[15px] font-medium text-muted-foreground md:text-base">
                  {stat.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// One flip-board tile. The line across its middle is the gap between its two flaps.
function Flap({ char, sun = false }: { char: string; sun?: boolean }) {
  return (
    <span
      aria-hidden
      className={`relative grid h-[1.21em] w-[0.86em] place-items-center rounded-[0.115em] border-3 ${sun ? "border-navy-950 bg-cta text-cta-foreground shadow-pop" : "border-outline bg-tile shadow-md"}`}
    >
      {char}
      <span
        className={`absolute inset-x-0 top-1/2 h-0.75 -translate-y-1/2 ${sun ? "bg-sun-400" : "bg-muted"}`}
      />
    </span>
  )
}
