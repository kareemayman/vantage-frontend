import Link from "next/link"
import { GlobeFlights } from "@/components/home/globe-flights"
import { PinHighlight } from "@/components/home/pin-highlight"
import { Globe } from "@/components/scene/globe"
import { FEATURED_TOURS } from "@/lib/tours"

// Stars, placed like the design's: left and top in %, size in px. Every third one is gold.
const STARS = [
  [8, 9, 4],
  [29, 7, 4],
  [44, 13, 6],
  [94, 10, 4],
  [90, 84, 4],
  [6, 91, 6],
  [39, 93, 4],
  [49, 47, 4],
]

// The API's [longitude, latitude] as "25.8°N 80.2°W"
function coordinates([lng, lat]: [number, number]) {
  const ns = lat >= 0 ? "N" : "S"
  const ew = lng >= 0 ? "E" : "W"
  return `${Math.abs(lat).toFixed(1)}°${ns} ${Math.abs(lng).toFixed(1)}°${ew}`
}

// 04 Where we go (design/HANDOFF.md): where the featured tours start, next to a globe.
// Night in both themes. data-theme="dark" makes the theme tokens inside use their dark
// values (text, cards, the focus ring), whatever theme the rest of the page is in.
// Phones: title, globe, list. Desktop: title and list on the left, the globe on the right.
export function WhereWeGo() {
  return (
    <section
      data-theme="dark"
      aria-labelledby="where-title"
      className="relative overflow-hidden border-y-2 border-nav-border bg-night py-16 text-foreground lg:py-32"
    >
      {/* Twinkling stars, behind everything. Desktop only (like the design): on narrower
          screens the text fills those spots. */}
      {STARS.map(([left, top, size], i) => (
        <span
          key={i}
          aria-hidden
          className={`absolute hidden rounded-full motion-safe:animate-twinkle lg:block ${i % 3 ? "bg-sand-50" : "bg-sun-300"}`}
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: size,
            height: size,
            animationDelay: `${-i * 0.7}s`,
          }}
        />
      ))}

      {/* On phones the list comes after the globe (order-1); the HTML keeps it right
          after the title, so screen readers get title, then list.
          <PinHighlight>: point at a row and its pin on the globe lights up. */}
      <PinHighlight className="relative mx-auto grid max-w-360 gap-7 px-4 md:px-10 lg:grid-cols-2 lg:gap-x-12 lg:gap-y-8.5 lg:px-20">
        <header className="lg:max-w-140 lg:self-end">
          <p className="text-[13px] font-extrabold tracking-[0.16em] text-sun-300 uppercase md:text-sm">
            Where we go
          </p>
          {/* Phones: shrinks with the screen so the title stays on 3 lines down to 320px
              wide (its longest line, "points. One long", is 7× as wide as the font size) */}
          <h2
            id="where-title"
            className="mt-2.5 font-display text-[min(3.125rem,14vw-0.3125rem)] leading-[0.92] font-bold tracking-tight text-balance uppercase md:mt-3 md:text-[clamp(3.125rem,5.83vw,5.25rem)]"
          >
            Many starting points. One long summer.
          </h2>
          <p className="mt-4 text-sky-100 md:mt-5.5 md:text-lg">
            Every tour starts somewhere easy to fly into, then heads somewhere that isn&apos;t.
          </p>
        </header>

        {/* @container: the coordinates only show when the list is at least 512px wide
            (@lg:), so a row never wraps onto two lines */}
        <ul className="@container order-1 flex flex-col gap-2.5 md:gap-3 lg:order-0 lg:max-w-140 lg:self-start">
          {FEATURED_TOURS.map((tour, i) => (
            <li key={tour.slug}>
              {/* Each row opens its tour. data-slug pairs it with its pin on the globe;
                  data-on lights it up (sun border and dot). The first row starts on. */}
              <Link
                href={`/tours/${tour.slug}`}
                data-slug={tour.slug}
                data-on={i === 0 ? "" : undefined}
                className="group flex items-center gap-3 rounded-[14px] border-2 border-transparent bg-card p-3.5 transition-colors data-on:border-sun-300 md:gap-4 md:rounded-2xl md:px-4.5 md:py-4"
              >
                {/* The pin's color on the globe */}
                <span className="size-3.5 shrink-0 rounded-full border-sand-50 bg-sky-300 group-data-on:bg-sun-300 md:size-4.5 md:border-3" />
                <span className="grow font-bold md:text-lg">
                  {tour.startLocation.description}{" "}
                  <span className="font-medium text-sky-100">· {tour.name}</span>
                </span>
                <span className="hidden text-sm text-sky-100 tabular-nums @lg:inline">
                  {coordinates(tour.startLocation.coordinates)}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* The plane flies the flights when the globe comes into view */}
        <GlobeFlights className="mx-auto w-full max-w-82.5 sm:max-w-110 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mr-0 lg:max-w-160 lg:self-center">
          <Globe className="w-full" />
        </GlobeFlights>
      </PinHighlight>
    </section>
  )
}
