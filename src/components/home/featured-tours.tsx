import { ButtonLink } from "@/components/button"
import { TagHover } from "@/components/home/tag-hover"
import { ArrowIcon } from "@/components/icons"
import { Reveal } from "@/components/reveal"
import { TourScene } from "@/components/scene/tour-scenes"
import { FEATURED_TOURS, type Tour } from "@/lib/tours"

// Where each tour's difficulty stamp sits, so it doesn't cover the drawing (TourScene).
// Real photos replace the drawings later (backend checklist item 1).
const STAMPS: Record<string, string> = {
  "the-sea-explorer": "right-3.5 bottom-3.5 rotate-6",
  "the-forest-hiker": "top-3.5 right-3.5 -rotate-5",
  "the-star-gazer": "top-3.5 left-3.5 -rotate-4",
}

// Difficulty colors. The stamp is a physical object, so it looks the same in both themes;
// the chip uses theme tokens. ("difficult" isn't in the design: coral, like a warning.)
const DIFFICULTY = {
  easy: {
    stamp: "border-lagoon-700 bg-lagoon-50 text-lagoon-700",
    chip: "bg-success-soft text-success",
  },
  medium: {
    stamp: "border-navy-950 bg-white text-navy-950",
    chip: "bg-chip text-chip-foreground",
  },
  difficult: {
    stamp: "border-coral-700 bg-coral-50 text-coral-700",
    chip: "bg-destructive-soft text-destructive",
  },
}

// Each tag hangs a little crooked, from its own wiggly string (the design's angles). One
// pose per tag: the homepage always shows three tours.
const POSES = [
  { tilt: "-rotate-[1.5deg]", string: "M30 86C10 60 50 30 24 0" },
  { tilt: "rotate-1", string: "M30 86C50 60 10 30 36 0" },
  { tilt: "-rotate-[0.6deg]", string: "M30 86C14 56 46 34 28 0" },
]

// 03 Featured tours (design/HANDOFF.md): the tours as luggage tags. Phones stack them,
// md shows two with the third centered below, xl hangs all three in a row.
// overflow-x-clip: a swinging tag can poke past the screen's edge; this hides that part
// instead of letting the page scroll sideways.
export function FeaturedTours() {
  return (
    <section
      aria-labelledby="tours-title"
      className="overflow-x-clip pt-18 pb-16 md:pt-28 md:pb-36"
    >
      <div className="mx-auto max-w-360 px-4 md:px-10 lg:px-20">
        <header className="lg:flex lg:items-end lg:justify-between lg:gap-12">
          <div>
            <p className="text-[13px] font-extrabold tracking-[0.16em] text-primary uppercase md:text-sm">
              Featured tours
            </p>
            {/* Phones: shrinks with the screen so "This summer's" stays on one line
                down to 320px wide (it's 6× as wide as the font size) */}
            <h2
              id="tours-title"
              className="mt-2.5 font-display text-[min(3.5rem,16vw-0.375rem)] leading-[0.9] font-bold tracking-tight uppercase md:mt-3 md:text-[clamp(3.5rem,6.67vw,6rem)]"
            >
              This summer&apos;s <br className="hidden md:inline" />
              luggage tags
            </h2>
          </div>
          {/* lg: stretched to the header's height, so the note sits at the top and the
              button at the bottom */}
          <div className="mt-2.5 flex flex-col items-start gap-5 lg:mt-0 lg:items-end lg:justify-between lg:self-stretch">
            <p className="font-hand text-[22px] text-primary lg:mr-14 lg:rotate-5 lg:text-[28px]">
              where to first?
            </p>
            <ButtonLink href="/tours" variant="primary" size="sm">
              See all tours
              <ArrowIcon className="size-4.5" />
            </ButtonLink>
          </div>
        </header>

        {/* md: four columns, two per tag. A tag alone on the last row (odd:last) starts at
            column 2, which centers it. */}
        <ul className="mx-auto mt-11 grid max-w-md items-start gap-10 md:mt-28 md:max-w-none md:grid-cols-4 md:gap-y-24 xl:grid-cols-3">
          {FEATURED_TOURS.map((tour, i) => (
            <li
              key={tour.slug}
              className="@container md:col-span-2 md:odd:last:col-start-2 md:even:mt-7.5 xl:col-span-1 xl:odd:last:col-start-auto"
            >
              {/* The swing-in: hidden until the tag scrolls into view, then it drops in
                  and swings around the top of its string (origin, 67px above the tag).
                  Each tag starts 0.15s after the one before. Reduced motion: a fade. */}
              <Reveal
                className="origin-[50%_-67px] waiting:opacity-0 motion-safe:seen:animate-swing-in motion-reduce:seen:animate-fade-in"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                {/* Under the mouse it leans toward it and its stamp thunks. One wrapper
                    per effect: each turns the tag (rotate), and an element has only one
                    rotate (the swing-in, the lean, then the tag's own tilt inside). */}
                <TagHover>
                  <LuggageTag tour={tour} pose={POSES[i]} />
                </TagHover>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// One luggage tag. Its <li> is a container (@container), so the tag sizes itself by its
// own width instead of the screen's: @sm: means "the tag is at least 384px wide".
// The whole tag opens the tour: the "View tour" link spreads an invisible layer over the
// tag (after:absolute after:inset-0), so a click anywhere lands on the link.
function LuggageTag({ tour, pose }: { tour: Tour; pose: (typeof POSES)[number] }) {
  const difficulty = DIFFICULTY[tour.difficulty]

  return (
    <article
      className={`relative rounded-[22px] border-3 border-outline bg-card p-3.5 shadow-md @sm:rounded-3xl @sm:p-4 ${pose.tilt}`}
    >
      {/* The string it hangs from (md+: stacked phone tags have no room above them) */}
      <svg
        aria-hidden
        viewBox="0 0 60 90"
        className="absolute -top-17.5 left-1/2 -ml-7.5 hidden h-22.5 w-15 md:block"
      >
        <path
          d={pose.string}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          className="stroke-sand-400"
        />
      </svg>
      {/* The eyelet: a ring filled with the page color, so it looks punched through */}
      <div className="mx-auto mb-2.5 size-6 rounded-full border-5 border-sand-400 bg-background @sm:mb-3 @sm:size-7" />

      <div className="relative aspect-3/2 overflow-hidden rounded-[14px] border-2 border-navy-950 @sm:rounded-2xl">
        <TourScene slug={tour.slug} className="size-full" />
        {/* The difficulty again, as a stamp. Decoration: the chip below says it. */}
        <span
          aria-hidden
          className={`absolute rounded-md border-2 border-dashed px-3 py-1.5 font-display text-sm leading-none font-bold tracking-[0.08em] uppercase motion-safe:group-data-playing:animate-thunk ${difficulty.stamp} ${STAMPS[tour.slug]}`}
        >
          {tour.difficulty}
        </span>
      </div>

      {/* The name comes first in the HTML, for screen readers that jump from heading to
          heading; order-first still shows the place above it */}
      <div className="flex flex-col px-1 pt-4 @sm:px-1.5 @sm:pt-5">
        <h3 className="mt-1.5 font-display text-[34px] leading-none font-bold tracking-tight uppercase @sm:mt-2 @sm:text-[42px]">
          {tour.name}
        </h3>
        <p className="order-first flex items-center gap-1.5 text-[13px] font-bold tracking-[0.08em] text-primary uppercase @sm:text-sm">
          <PinIcon className="size-4 shrink-0" />
          {tour.startLocation.description}
        </p>
        <p className="mt-2 text-[15px] text-muted-foreground @sm:mt-2.5 @sm:text-base">
          {tour.summary}
        </p>
        <ul className="mt-3 flex flex-wrap gap-1.5 text-[13px] font-bold @sm:mt-4 @sm:gap-2 @sm:text-sm">
          <li className="rounded-full bg-chip px-2.5 py-1.5 text-chip-foreground @sm:px-3">
            {tour.duration} days
          </li>
          <li className={`rounded-full px-2.5 py-1.5 capitalize @sm:px-3 ${difficulty.chip}`}>
            {tour.difficulty}
          </li>
          {/* The API gives a tour with no reviews a 4.5 average, so show "New" instead */}
          <li className="rounded-full bg-chip-warm px-2.5 py-1.5 @sm:px-3">
            <span aria-hidden>★ </span>
            {tour.ratingsQuantity === 0 ? (
              "New"
            ) : (
              <>
                {tour.ratingsAverage.toFixed(1)}{" "}
                <span className="font-medium text-muted-foreground">
                  ({tour.ratingsQuantity} reviews)
                </span>
              </>
            )}
          </li>
        </ul>
      </div>

      {/* The tear-off line, then the price and the link */}
      <div className="-mx-3.5 mt-4 flex items-center justify-between gap-3 border-t-3 border-dashed border-dash px-4.5 pt-3.5 @sm:-mx-4 @sm:mt-5 @sm:px-5.5 @sm:pt-4.5">
        <p>
          <span className="font-display text-[30px] font-bold @sm:text-4xl">
            ${tour.price.toLocaleString("en-US")}
          </span>{" "}
          <span className="text-[13px] whitespace-nowrap text-muted-foreground @sm:text-sm">
            per person
          </span>
        </p>
        <ButtonLink
          href={`/tours/${tour.slug}`}
          variant="primary"
          size="sm"
          className="after:absolute after:inset-0"
        >
          View tour<span className="sr-only">: {tour.name}</span>
        </ButtonLink>
      </div>
    </article>
  )
}

function PinIcon({ className }: { className: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={`fill-none stroke-current stroke-[2.4] ${className}`}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s7-7.6 7-13a7 7 0 0 0-14 0c0 5.4 7 13 7 13z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  )
}
