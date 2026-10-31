import { cacheLife } from "next/cache"

type ToursHeaderProps = {
  shortest: number // the shortest and longest tours, in days
  longest: number
}

// The summer the tours are for: this year's until September ends, then next year's.
// "use cache": the page is built ahead of time and saved, so Next needs to know how long
// a value read from the clock stays good. A day is plenty for a year.
async function upcomingSummer() {
  "use cache"
  cacheLife("days")
  const now = new Date()
  return now.getFullYear() + (now.getMonth() > 8 ? 1 : 0) // getMonth(): 0 = January, 8 = September
}

// The top of the tours page: the title and the intro. The padding on the right (md+) leaves
// room for the sun beside them, which is in setting-sun.tsx because it leaves this header as
// the page scrolls. The tour cards start right below.
export async function ToursHeader({ shortest, longest }: ToursHeaderProps) {
  const summer = await upcomingSummer()

  return (
    <header className="mx-auto max-w-6xl px-4 pt-28 pb-20 md:px-6 md:pt-36 md:pr-36 lg:pr-48">
      <div>
        <p className="text-[13px] font-extrabold tracking-[0.16em] text-primary uppercase md:text-sm">
          All tours · Summer {summer}
        </p>
        {/* The sticker and its "?" stay together (nowrap) */}
        <h1
          id="tours-title"
          className="mt-1.5 font-display text-[clamp(44px,6vw+12px,76px)] leading-[0.95] font-bold tracking-tight text-balance uppercase"
        >
          Where to this{" "}
          <span className="whitespace-nowrap">
            <span className="inline-block -rotate-2 rounded-[0.21em] border-4 border-navy-950 bg-cta px-[0.18em] leading-[1.04] text-cta-foreground shadow-pop">
              summer
            </span>
            <span className="ml-[0.14em]">?</span>
          </span>
        </h1>
        <p className="mt-3 max-w-140 text-pretty text-muted-foreground md:text-lg">
          Small-group trips{shortest < longest && ` from ${shortest} to ${longest} days`}, easy to
          tough. Follow the plane down the route and pick your favorite.
        </p>
      </div>
    </header>
  )
}
