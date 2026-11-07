import { HEADING } from "@/components/journal/journal"
import type { TourReview } from "@/lib/reviews"

// Sticky notes take turns: a color and an angle
const STICKIES = ["-rotate-2 bg-sun-200", "rotate-1 bg-sky-200", "-rotate-1 bg-coral-200"]

// "Max Smith" → "Max S."; a deleted account leaves its review with no user
function shortName(name?: string) {
  if (!name) return "a past traveler"
  const [first, ...rest] = name.split(" ")
  return rest.length ? `${first} ${rest.at(-1)?.[0]}.` : first
}

// Notes from past travelers: the tour's reviews as sticky notes, each signed in handwriting
// with the traveler's name and stars
export function TravelerNotes({ reviews }: { reviews: TourReview[] }) {
  return (
    <section aria-labelledby="notes-title">
      <h2 id="notes-title" className={HEADING}>
        notes from past travelers
      </h2>
      {reviews.length === 0 ? (
        <p className="mt-4 font-hand text-2xl">no notes yet</p>
      ) : (
        <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, i) => (
            <li key={review._id}>
              <figure
                className={`flex h-full min-h-56 flex-col p-5 text-navy-950 shadow-md ${STICKIES[i % STICKIES.length]}`}
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
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
