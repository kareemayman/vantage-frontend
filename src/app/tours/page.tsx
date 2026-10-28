import type { Metadata } from "next"
import Image from "next/image"
import { PauseOffscreen } from "@/components/pause-offscreen"
import { getTours } from "@/lib/api"

export const metadata: Metadata = { title: "Tours" } // -> "Tours | Vantage"

// Every tour, straight from the API. A plain list for now: the real design comes later.
// An async Server Component waits for the data on the server and sends finished HTML,
// so there's no useEffect and no loading state here.
export default async function ToursPage() {
  const tours = await getTours()

  return (
    <>
      <section className="mx-auto max-w-6xl px-6 pt-28 pb-24 md:pt-36">
        <h1 className="font-display text-6xl font-bold tracking-tight uppercase">All tours</h1>
        <ul className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {tours.map((tour, i) => (
            <li key={tour.slug} className="overflow-hidden rounded-2xl border bg-card">
              {/* `fill` stretches the photo over this 4:3 box; `sizes` tells the browser how
                  wide the box is at each screen width, so it downloads a photo that size.
                  The first row (up to 3 photos) is on screen at load, so it loads right away
                  (eager) instead of waiting for the layout like the lazy ones below. */}
              <div className="relative aspect-4/3">
                <Image
                  src={tour.imageCover}
                  alt={tour.name}
                  fill
                  loading={i < 3 ? "eager" : "lazy"}
                  sizes="(min-width: 1280px) 352px, (min-width: 768px) calc(50vw - 36px), calc(100vw - 48px)"
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h2 className="font-display text-3xl leading-none font-bold tracking-tight uppercase">
                  {tour.name}
                </h2>
                <p className="mt-3 text-pretty text-muted-foreground">{tour.summary}</p>
                <p className="mt-4 text-sm font-medium">
                  {tour.duration} days · {tour.difficulty} · ${tour.price.toLocaleString("en-US")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <PauseOffscreen />
    </>
  )
}
