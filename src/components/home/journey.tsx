import { JourneyTrack, type JourneyStep } from "@/components/home/journey-track"
import {
  FoldedMap,
  GuideFlag,
  PackedSuitcase,
  Postcard,
  Ticket,
} from "@/components/scene/journey-props"
import { Plane } from "@/components/scene/plane"
import { Cloud } from "@/components/scene/sky"

// The six stops (the design had four; stops 4-6 are new copy and art, easy to change).
// `art` is JSX rendered here on the server and handed to the client track as a prop,
// so the illustrations never ship as JavaScript.
const STEPS: JourneyStep[] = [
  {
    title: "Pick a tour",
    text: "Beaches, islands or national parks. Filter by days, difficulty and how much sunscreen you own.",
    panel: "bg-muted",
    art: <FoldedMap className="h-[76%] w-auto" />,
  },
  {
    title: "Book your spot",
    text: "Small groups fill fast. Grab a seat in two minutes, pay securely, get your boarding pass by email.",
    panel: "bg-scene-sky",
    art: <Ticket className="h-[70%] w-auto" />,
  },
  {
    title: "Pack",
    text: "A packing list built for your tour, from hiking boots to the good sunglasses. Your guide checks in a week before.",
    panel: "bg-scene-sand",
    art: <PackedSuitcase className="h-[80%] w-auto" />,
  },
  {
    title: "Take off",
    text: "Wheels up. Grab the window seat and wave goodbye to the couch: next stop, somewhere sunny.",
    panel: "relative overflow-hidden bg-scene-sea",
    art: (
      <>
        <Cloud aria-hidden className="absolute bottom-2 left-3 w-[30%]" />
        {/* Not in the sky until you arrive. Trick: climbs in from the runway (bottom left) */}
        <Plane className="w-[52%] -rotate-20 ahead:opacity-0 motion-safe:reached:animate-take-off" />
      </>
    ),
  },
  {
    title: "Meet your guide",
    text: "A local who knows the trails, the tides and the hidden coves meets your small group. Just follow the flag.",
    // Decorative panels with no matching scene token use palette colors + a dark: twin
    panel: "bg-lagoon-50 dark:bg-lagoon-950",
    art: <GuideFlag className="h-[80%] w-auto" />,
  },
  {
    title: "Bring home stories",
    text: "Tan lines fade, the stories stay. You'll be telling them at every dinner for a year.",
    panel: "bg-coral-50 dark:bg-coral-950",
    art: <Postcard className="h-[72%] w-auto" />,
  },
]

// 02 The Journey (design/HANDOFF.md)
// Pinned (desktop, motion allowed; see journey-track.tsx): the section fills the screen
// and centers its content. The title, the gaps and the picture panels keep the design's
// size on a 900px-tall screen and shrink faster than the screen below that, e.g. panels
// are min(170px, 26svh - 64px): 170px at 900px tall, 107px at 657px (a 1366×768 laptop).
// That way the whole section fits from 600px up. If it ever can't, the section grows
// instead and the pin waits for its bottom, so the cards stay in view.
export function Journey() {
  return (
    <section
      aria-labelledby="journey-title"
      className="relative overflow-hidden bg-scene-sky-2 pt-16 pb-12 md:pt-24 md:pb-40 pinned:flex pinned:min-h-svh pinned:flex-col pinned:justify-center pinned:pb-4"
    >
      {/* Two drifting clouds (wider screens). The bottom one sits fully inside the
          section's extra bottom padding, clear of the cards. */}
      <Cloud className="absolute top-[7%] right-[12%] hidden w-50 motion-safe:animate-drift md:block" />
      <Cloud className="absolute bottom-5 left-[53%] hidden w-40 motion-safe:animate-drift motion-safe:[animation-delay:-2s] md:block" />

      {/* w-full: as a flex item (pinned), mx-auto would otherwise shrink it to fit */}
      <div className="relative mx-auto w-full max-w-360 px-4 md:px-10 lg:px-20">
        {/* lg:shrink-0: the title keeps its two lines; the note beside it wraps instead */}
        <header className="lg:flex lg:items-end lg:gap-12">
          <div className="lg:shrink-0">
            <p className="text-[13px] font-extrabold tracking-[0.16em] text-primary uppercase md:text-sm">
              The journey
            </p>
            <h2
              id="journey-title"
              className="mt-2.5 font-display text-[clamp(3.25rem,6.1vw,5.5rem)] leading-[0.92] font-bold tracking-tight uppercase md:mt-3 pinned:text-[clamp(3.25rem,min(6.1vw,11.2svh-0.8rem),5.5rem)]"
            >
              Couch to coastline <br className="hidden md:inline" />
              in six stops
            </h2>
          </div>
          <p
            aria-hidden
            className="mt-2.5 font-hand text-[22px] text-balance text-primary lg:mb-4 lg:-rotate-4 lg:text-[28px]"
          >
            <span className="md:hidden">swipe, the beach is this way →</span>
            <span className="hidden md:inline">keep scrolling, the beach is this way →</span>
          </p>
        </header>

        <JourneyTrack steps={STEPS} />
      </div>
    </section>
  )
}
