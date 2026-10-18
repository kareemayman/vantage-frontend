import { ByTheNumbers } from "@/components/home/by-the-numbers"
import { FeaturedTours } from "@/components/home/featured-tours"
import { Hero } from "@/components/home/hero"
import { Journey } from "@/components/home/journey"
import { Reviews } from "@/components/home/reviews"
import { WhereWeGo } from "@/components/home/where-we-go"

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
    </>
  )
}
