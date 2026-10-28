import { BoardingPass } from "@/components/home/boarding-pass"
import { ByTheNumbers } from "@/components/home/by-the-numbers"
import { FeaturedTours } from "@/components/home/featured-tours"
import { Hero } from "@/components/home/hero"
import { Journey } from "@/components/home/journey"
import { Playground } from "@/components/home/playground"
import { Reviews } from "@/components/home/reviews"
import { WhereWeGo } from "@/components/home/where-we-go"
import { PauseOffscreen } from "@/components/pause-offscreen"

// Homepage, built section by section from design/HANDOFF.md
export default function Home() {
  return (
    <>
      <Hero />
      <Journey />
      <FeaturedTours />
      <WhereWeGo />
      <ByTheNumbers />
      <Reviews />
      <Playground />
      <BoardingPass />
      <PauseOffscreen />
    </>
  )
}
