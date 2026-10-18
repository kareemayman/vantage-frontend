import { Reveal } from "@/components/reveal"
import { TourScene } from "@/components/scene/tour-scenes"
import { FEATURED_REVIEWS, type Review } from "@/lib/reviews"

// Each polaroid lies a little crooked, with its own strip of tape (the design's angles).
// One pose per review: the homepage always shows three. drop: md+ puts the second one
// lower, and xl the third a little, like photos dropped on a table.
const POSES = [
  { tilt: "-rotate-3", tape: "w-25 rotate-4 bg-sky-100/85", drop: "" },
  { tilt: "rotate-2", tape: "w-27.5 -rotate-5 bg-sand-200/90", drop: "md:mt-7.5 xl:mt-12.5" },
  { tilt: "-rotate-[1.5deg]", tape: "w-22.5 rotate-3 bg-sky-100/85", drop: "xl:mt-2.5" },
]

// 06 Reviews (design/HANDOFF.md): travelers' reviews as polaroids on a table. Phones stack
// them, md shows two with the third centered below, xl lays all three in a row.
// overflow-x-clip: a polaroid starts its drop bigger, so it can poke past the screen's
// edge; this hides that part instead of letting the page scroll sideways.
export function Reviews() {
  return (
    <section aria-labelledby="reviews-title" className="overflow-x-clip py-16 md:pt-25 md:pb-30">
      <div className="mx-auto max-w-360 px-4 md:px-10 lg:px-20">
        <header className="md:text-center">
          <p className="text-[13px] font-extrabold tracking-[0.16em] text-primary uppercase md:text-sm">
            Reviews
          </p>
          {/* Phones: two lines, shrinking with the screen so "from travelers" (6.76× as
              wide as the font size) still fits on one line at 320px */}
          <h2
            id="reviews-title"
            className="mt-2.5 font-display text-[min(3.25rem,14.5vw-0.3125rem)] leading-[0.9] font-bold tracking-tight uppercase md:mt-3 md:text-[clamp(3.5rem,6.67vw,6rem)]"
          >
            Postcards <br className="md:hidden" />
            from travelers
          </h2>
        </header>

        {/* md: four columns, two per polaroid. One alone on the last row (odd:last) starts
            at column 2, which centers it. xl: three 360px columns, 70px apart. */}
        <ul className="mx-auto mt-10 grid max-w-md items-start gap-14 md:mt-28 md:max-w-none md:grid-cols-4 md:gap-x-10 xl:max-w-305 xl:grid-cols-3 xl:gap-x-17.5">
          {FEATURED_REVIEWS.map((review, i) => (
            <li
              key={review._id}
              className={`md:col-span-2 md:odd:last:col-start-2 xl:col-span-1 xl:odd:last:col-start-auto ${POSES[i].drop}`}
            >
              {/* Each polaroid waits until it's on screen, then drops onto the table,
                  0.15s after the one before */}
              <Reveal>
                <Polaroid review={review} pose={POSES[i]} delay={i * 0.15} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// One review: a polaroid, then the quote and who wrote it. The polaroid is a physical
// object, so it looks the same in both themes: white, with a daytime picture
// (data-theme="light" keeps the drawing's sky light). Screen readers skip it: the
// caption below says who wrote the review and on which tour.
// Once its <Reveal> sees it, the polaroid drops in (drop-in in globals.css), and its
// words fade in half a second later, as it lands. Reduced motion: both just fade.
function Polaroid({
  review,
  pose,
  delay,
}: {
  review: Review
  pose: (typeof POSES)[number]
  delay: number // seconds
}) {
  const { user, tour } = review
  // "Lourdes Browning" → "Lourdes" and "Lourdes B."; "Miami, USA" → "Miami"
  const [first, ...others] = user.name.split(" ")
  const name = others.length ? `${first} ${others.at(-1)?.[0]}.` : first
  const place = tour.startLocation.description.split(",")[0]
  const stars = Math.round(review.rating)
  const words = { animationDelay: `${delay + 0.5}s` }

  return (
    <figure className={`mx-2.5 md:mx-auto md:max-w-90 ${pose.tilt}`}>
      <div
        aria-hidden
        className="relative rounded-md border border-sand-300 bg-white p-3.5 pb-4 text-navy-950 shadow-xl md:p-4 md:pb-4.5 waiting:opacity-0 motion-safe:seen:animate-drop-in motion-reduce:seen:animate-fade-in"
        style={{ animationDelay: `${delay}s` }}
      >
        <span
          className={`absolute -top-3.5 left-1/2 h-6.5 -translate-x-1/2 md:-top-4 md:h-7.5 ${pose.tape}`}
        />
        <div data-theme="light" className="aspect-10/7 overflow-hidden rounded-xs">
          <TourScene slug={tour.slug} className="size-full" />
        </div>
        {/* The handwritten caption, made from real data: "lourdes in miami" */}
        <p className="pt-2.5 text-center font-hand text-2xl lowercase md:pt-3 md:text-[1.75rem]">
          {first} in {place}
        </p>
      </div>
      <blockquote
        className="mx-1 mt-5.5 text-[17px] leading-[1.55] text-pretty md:mx-2 md:mt-6.5 md:text-lg waiting:opacity-0 seen:animate-fade-in"
        style={words}
      >
        “{review.review}”
      </blockquote>
      <figcaption
        className="mx-1 mt-2.5 text-sm font-bold md:mx-2 md:mt-3 md:text-[15px] waiting:opacity-0 seen:animate-fade-in"
        style={words}
      >
        {name}{" "}
        <span className="font-medium text-muted-foreground">
          · {tour.name} · <span aria-hidden>{"★".repeat(stars) + "☆".repeat(5 - stars)}</span>
          <span className="sr-only">{stars} out of 5 stars</span>
        </span>
      </figcaption>
    </figure>
  )
}
