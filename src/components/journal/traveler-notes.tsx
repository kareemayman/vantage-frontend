import { HEADING, WRITE_IN } from "@/components/journal/journal"
import { Reveal } from "@/components/reveal"
import type { TourReview } from "@/lib/reviews"

// Sticky notes take turns: an angle, a color, and the colors of the corner that peels up (the
// back of the paper: light at its tip, darker at the fold)
const STICKIES = [
  { tilt: "-rotate-2", paper: "bg-sun-200", back: "from-sun-50 to-sun-300" },
  { tilt: "rotate-1", paper: "bg-sky-200", back: "from-sky-50 to-sky-300" },
  { tilt: "-rotate-1", paper: "bg-coral-200", back: "from-coral-50 to-coral-300" },
]

// "Max Smith" → "Max S."; a deleted account leaves its review with no user
function shortName(name?: string) {
  if (!name) return "a past traveler"
  const [first, ...rest] = name.split(" ")
  return rest.length ? `${first} ${rest.at(-1)?.[0]}.` : first
}

// Notes from past travelers: the tour's reviews as sticky notes, each signed in handwriting
// with the traveler's name and stars. The heading writes itself in, then each note is stuck
// onto the page as it scrolls into view (<Reveal>: on phones they're a screen apart): its top
// edge first, then the rest flaps down (stick-on). Under the mouse, a note's bottom-right
// corner peels up (the signature is on the left, so it never covers words). Reduced motion:
// no entrance and no peel.
export function TravelerNotes({ reviews }: { reviews: TourReview[] }) {
  return (
    <section aria-labelledby="notes-title">
      <Reveal>
        <h2 id="notes-title" className={HEADING}>
          <span className={WRITE_IN}>notes from past travelers</span>
        </h2>
        {reviews.length === 0 && (
          <p className="mt-4 font-hand text-2xl">
            <span className={WRITE_IN} style={{ animationDelay: "0.7s" }}>
              no notes yet
            </span>
          </p>
        )}
      </Reveal>
      {reviews.length > 0 && (
        // --cols: how many notes sit side by side (for the order they're stuck on in)
        <ul className="mt-10 grid gap-8 [--cols:1] sm:grid-cols-2 sm:[--cols:2] lg:grid-cols-3 lg:[--cols:3]">
          {reviews.map((review, i) => {
            const sticky = STICKIES[i % STICKIES.length]
            return (
              // @container: the entrance's perspective is measured in the note's width
              // (cqw, see stick-on in globals.css)
              <li key={review._id} className={`@container ${sticky.tilt}`}>
                {/* The Reveal box never moves (the observer measures where it is); the
                    note inside it flaps down */}
                <Reveal className="h-full">
                  {/* The note: its shadow, its entrance and its peel. Notes in a row are
                      stuck on one after another, left to right: the delay is the note's
                      column (its place in the row, mod() of --cols) × 0.15s. On phones,
                      each note only waits for itself. --peel eases to 2.5rem under the
                      mouse: up with a springy overshoot, down without one. */}
                  <div
                    className="relative h-full origin-top shadow-md transition-[--peel] duration-300 ease-out motion-safe:hover:ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-safe:hover:[--peel:2.5rem] motion-safe:waiting:opacity-0 motion-safe:seen:animate-stick-on"
                    style={{ animationDelay: `calc(mod(${i}, var(--cols)) * 0.15s)` }}
                  >
                    {/* The paper and its words. peel-cut (globals.css) cuts its corner off
                        along a diagonal, --peel from the corner (nothing until the mouse
                        comes over it), so the page shows through where it has lifted. */}
                    <figure
                      className={`flex h-full min-h-56 flex-col p-5 text-navy-950 peel-cut ${sticky.paper}`}
                    >
                      <blockquote className="text-pretty">{review.review}</blockquote>
                      <figcaption className="mt-auto pt-4 font-hand text-2xl lowercase">
                        — {shortName(review.user?.name)}{" "}
                        <span aria-hidden className="text-lg">
                          {"★".repeat(review.rating)}
                        </span>
                        <span className="sr-only">, {review.rating} out of 5 stars</span>
                      </figcaption>
                    </figure>
                    {/* The lifted corner, folded back over the paper: a square as big as
                        the peel, showing only its top-left half (the triangle). It sits
                        1px out, like the cut, so its fold lands right on the cut. Its
                        shadow falls past the fold onto the page. The shadow sits on an
                        outer span, because a clip-path also cuts off the element's own
                        shadow (and for the same reason, the note's shadow is on the
                        wrapper above, not on the paper). */}
                    <span
                      aria-hidden
                      className="absolute -right-px -bottom-px size-(--peel) drop-shadow-[0_2px_2px_rgb(29_93_155/0.35)]"
                    >
                      <span
                        className={`block size-full bg-linear-to-br to-50% [clip-path:polygon(0_0,100%_0,0_100%)] ${sticky.back}`}
                      />
                    </span>
                  </div>
                </Reveal>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
