import Link from "next/link"
import type { Tour } from "@/lib/tours"

// "All tours as a list" (design/tours-handoff): the same tours as the route, in the same
// order, as plain links. It's the quick path for keyboard and screen-reader users, and
// for anyone who'd rather skip the ride.
export function TourList({ tours }: { tours: Tour[] }) {
  return (
    <section aria-labelledby="tour-list-title" className="mx-auto max-w-6xl px-6 py-20 md:py-24">
      <h2
        id="tour-list-title"
        className="font-display text-4xl font-bold tracking-tight uppercase md:text-5xl"
      >
        All tours as a list
      </h2>
      <p className="mt-2 text-muted-foreground">
        The same tours as the route, with the same filters and order.
      </p>
      {/* columns: the list fills each column top to bottom, like the design (cheapest first
          down the left). break-inside-avoid keeps each tour whole */}
      <ul className="mt-8 gap-x-10 md:columns-2 xl:columns-3">
        {tours.map((tour) => (
          <li key={tour.slug} className="break-inside-avoid border-b-2 border-dashed border-dash">
            <Link href={`/tours/${tour.slug}`} className="group block px-1 py-4">
              <span className="block text-lg font-extrabold group-hover:text-primary">
                {tour.name}
              </span>
              <span className="text-sm text-muted-foreground">
                {tour.startLocation.description} · {tour.duration} days ·{" "}
                <span className="capitalize">{tour.difficulty}</span> · $
                {tour.price.toLocaleString("en-US")}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
