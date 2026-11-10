import { BoardingPass } from "@/components/home/boarding-pass"
import { ByTheNumbers } from "@/components/home/by-the-numbers"
import { FeaturedTours } from "@/components/home/featured-tours"
import { Hero } from "@/components/home/hero"
import { Journey } from "@/components/home/journey"
import { Playground } from "@/components/home/playground"
import { Reviews } from "@/components/home/reviews"
import { WhereWeGo } from "@/components/home/where-we-go"
import { PauseOffscreen } from "@/components/pause-offscreen"
import { getFeaturedTours, getTourStats } from "@/lib/api"

// Homepage, built section by section from design/HANDOFF.md. The page asks for the data once
// and hands it to the sections. It's a saved copy ("use cache" in api.ts), so the page is still
// built ahead of time, and visitors never wait for the API.
export default async function Home() {
  // Both questions go out at the same time, instead of the second waiting for the first
  const [tours, stats] = await Promise.all([getFeaturedTours(), getTourStats()])

  return (
    <>
      <Hero />
      <Journey />
      <FeaturedTours tours={tours} />
      <WhereWeGo tours={tours} />
      <ByTheNumbers stats={stats} />
      <Reviews />
      <Playground />
      <BoardingPass />
      <PauseOffscreen />
    </>
  )
}
