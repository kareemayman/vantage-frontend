import { BoardingPass } from "@/components/home/boarding-pass"
import { ByTheNumbers } from "@/components/home/by-the-numbers"
import { FeaturedTours } from "@/components/home/featured-tours"
import { Hero } from "@/components/home/hero"
import { Journey } from "@/components/home/journey"
import { Playground } from "@/components/home/playground"
import { Reviews } from "@/components/home/reviews"
import { WhereWeGo } from "@/components/home/where-we-go"
import { PauseOffscreen } from "@/components/pause-offscreen"
import { getFeaturedTours } from "@/lib/api"

// Homepage, built section by section from design/HANDOFF.md. The page asks for the data once
// and hands it to the sections. It's a saved copy ("use cache" in api.ts), so the page is still
// built ahead of time, and visitors never wait for the API.
export default async function Home() {
  const tours = await getFeaturedTours()

  return (
    <>
      <Hero />
      <Journey />
      <FeaturedTours tours={tours} />
      <WhereWeGo />
      <ByTheNumbers />
      <Reviews />
      <Playground />
      <BoardingPass />
      <PauseOffscreen />
    </>
  )
}
