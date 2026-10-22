import type { Metadata } from "next"
import { getTours } from "@/lib/api"

export const metadata: Metadata = { title: "Tours" } // -> "Tours | Vantage"

// Every tour, straight from the API. A plain list for now: the real design comes later.
// An async Server Component waits for the data on the server and sends finished HTML,
// so there's no useEffect and no loading state here.
export default async function ToursPage() {
  const tours = await getTours()

  return (
    <section className="mx-auto max-w-6xl px-6 pt-28 pb-24 md:pt-36">
      <h1 className="font-display text-6xl font-bold tracking-tight uppercase">All tours</h1>
      <ul className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {tours.map((tour) => (
          <li key={tour.slug} className="rounded-2xl border bg-card p-6">
            <h2 className="font-display text-3xl leading-none font-bold tracking-tight uppercase">
              {tour.name}
            </h2>
            <p className="mt-3 text-pretty text-muted-foreground">{tour.summary}</p>
            <p className="mt-4 text-sm font-medium">
              {tour.duration} days · {tour.difficulty} · ${tour.price.toLocaleString("en-US")}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
