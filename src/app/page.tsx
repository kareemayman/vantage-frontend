import Link from "next/link"

// Homepage shell. The 3D hero and scroll story replace this in later phases.
export default function Home() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-24 sm:py-32">
      <p className="-rotate-2 font-hand text-2xl text-primary">psst... your summer is waiting</p>
      <h1 className="max-w-3xl font-display text-5xl font-bold tracking-tight uppercase sm:text-7xl lg:text-8xl">
        Summer starts here
      </h1>
      <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
        Hand-picked tours to beaches, islands and coastlines, with local guides who know every
        hidden spot.
      </p>
      <div className="flex flex-wrap gap-3 font-semibold">
        <Link
          href="/tours"
          className="rounded-xl bg-cta px-6 py-3 text-cta-foreground shadow-pop transition-colors hover:bg-cta-hover"
        >
          Explore tours
        </Link>
        <Link
          href="/signup"
          className="rounded-xl bg-secondary px-6 py-3 text-secondary-foreground transition-colors hover:bg-secondary-hover"
        >
          Create an account
        </Link>
      </div>
    </section>
  )
}
