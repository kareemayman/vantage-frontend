"use client"

import { useRef, useState, type ReactNode } from "react"
import { gsap, useGSAP } from "@/lib/gsap"
import { useReducedMotion } from "@/lib/use-reduced-motion"

export type JourneyStep = {
  title: string
  text: string
  panel: string // background class for the illustration panel
  art: ReactNode // the illustration, rendered on the server and passed in
}

// The Journey's cards and their "01 / 06" progress, in three layouts:
// - phones: the cards swipe sideways (CSS scroll-snap);
// - desktop with motion allowed: the section pins, and scrolling down slides the cards
//   sideways (GSAP ScrollTrigger);
// - everything else (tablets, reduced motion, no JavaScript): a calm grid.
// In the first two (`ride:` classes), the current card lifts, its badge fills in and
// the progress follows.
export function JourneyTrack({ steps }: { steps: JourneyStep[] }) {
  const track = useRef<HTMLOListElement>(null)
  const [active, setActive] = useState(0)
  const reduced = useReducedMotion()

  // useGSAP: a useLayoutEffect that also undoes everything GSAP set up inside it (tweens,
  // pins, matchMedia) on unmount, and here also whenever `reduced` changes.
  useGSAP(
    () => {
      const list = track.current
      const section = list?.closest("section")
      if (!list || !section) return

      // gsap.matchMedia: each setup runs while its media query matches, and its cleanup
      // runs when it stops matching (resizing the window, rotating a tablet)
      const mm = gsap.matchMedia()

      // Phones: "tell me whenever a card becomes at least 60% visible inside the track"
      mm.add("(width < 48rem)", () => {
        const cards = Array.from(list.children)
        const observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) setActive(cards.indexOf(entry.target))
            }
          },
          { root: list, threshold: 0.6 },
        )
        cards.forEach((card) => observer.observe(card))
        return () => observer.disconnect()
      })

      // Desktop at least 600px tall (so the whole section fits), motion allowed: the ride
      if (reduced) return
      mm.add("(width >= 64rem) and (height >= 37.5rem)", () => {
        section.dataset.pinned = "" // pinned: classes turn the grid into one long row
        const travel = () => list.scrollWidth - list.clientWidth // how far the row slides
        const follow = (ride: { progress: number }) =>
          setActive(Math.round(ride.progress * (steps.length - 1)))

        gsap.to(list, {
          x: () => -travel(),
          ease: "none", // the row moves exactly as fast as you scroll
          scrollTrigger: {
            trigger: section,
            pin: true, // hold the section still...
            start: "bottom bottom", // ...once its bottom reaches the bottom of the screen
            end: () => `+=${travel()}`, // ...for as many pixels of scroll as the row slides
            scrub: true, // the tween's progress follows the scroll position, both ways
            invalidateOnRefresh: true, // re-measure travel() after a resize
            onUpdate: follow,
            onRefresh: follow,
          },
        })

        return () => {
          delete section.dataset.pinned
        }
      })
    },
    { dependencies: [reduced, steps.length], revertOnUpdate: true },
  )

  return (
    <>
      {/* The track.
          Phones: it scrolls sideways. tabIndex + label: keyboard users can focus it and
          scroll it with the arrow keys. pt-8: a scroll container clips whatever pokes
          out of it, so the top padding has to fit the badge (22px above its card) plus
          the active card's 8px lift. The scrollbar is hidden: the peek, the progress
          and swiping show there's more.
          Pinned (desktop): one long row of 360px cards, slid by GSAP. Its top margin, the
          picture panels and the progress margin shrink on short screens (see journey.tsx). */}
      <ol
        ref={track}
        tabIndex={0}
        aria-label={`The journey, ${steps.length} stops`}
        className="-mx-4 mt-7 flex snap-x snap-mandatory scroll-px-4 scrollbar-none gap-4 overflow-x-auto overscroll-x-contain px-4 pt-8 pb-4 md:mx-0 md:mt-16 md:grid md:snap-none md:grid-cols-2 md:gap-x-8 md:gap-y-14 md:overflow-visible md:p-0 xl:grid-cols-3 pinned:mt-[min(5rem,14svh-2.8rem)] pinned:flex pinned:gap-14 [&::-webkit-scrollbar]:hidden"
      >
        {steps.map((step, i) => (
          <li
            key={step.title}
            data-state={i < active ? "done" : i === active ? "active" : "next"}
            className="group/card w-72.5 shrink-0 snap-start md:w-auto pinned:w-90"
          >
            {/* The current card lifts a little */}
            <article className="relative flex h-full flex-col rounded-[22px] border-3 border-outline bg-card p-3.5 shadow-md transition-transform duration-300 md:rounded-3xl md:p-4 ride:group-data-[state=active]/card:-translate-y-2">
              {/* Stop number: filled once you've reached it, outlined while it's ahead.
                  The list is already numbered for screen readers, so this is decoration.
                  z-10: stays above the picture panel (card 4's panel is `relative`, and a
                  later positioned element would otherwise paint over it). */}
              <span
                aria-hidden
                className="absolute -top-5.5 -left-1.5 z-10 grid size-13 place-items-center rounded-full border-3 border-navy-950 bg-sun-300 font-display text-[22px] font-bold text-navy-950 transition-colors md:-top-6.5 md:-left-5 md:size-16 md:text-[26px] ride:group-data-[state=next]/card:border-outline ride:group-data-[state=next]/card:bg-card ride:group-data-[state=next]/card:text-foreground"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div
                className={`grid h-35 place-items-center rounded-xl md:h-42.5 md:rounded-[14px] pinned:h-[min(10.625rem,26svh-4rem)] ${step.panel}`}
              >
                {step.art}
              </div>
              <h3 className="mx-1 mt-4 font-display text-[30px] leading-none font-bold tracking-tight uppercase md:mx-1.5 md:mt-5.5 md:text-[38px]">
                {step.title}
              </h3>
              <p className="mx-1 mt-2 mb-1 text-[15px] text-muted-foreground md:mx-1.5 md:mt-2.5 md:text-base">
                {step.text}
              </p>
            </article>
          </li>
        ))}
      </ol>

      {/* Progress: "02 / 06" and a segment per stop, only while riding (bigger when
          pinned, like the design). Decoration: the list says it all. */}
      <div
        aria-hidden
        className="mt-6 hidden items-center gap-3 pinned:mt-[min(2.8rem,10svh-2.8rem)] pinned:gap-4.5 ride:flex"
      >
        <span className="font-display text-lg font-bold pinned:text-[22px] pinned:leading-none">
          {String(active + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
        </span>
        <div className="flex gap-1.25 pinned:gap-1.5">
          {steps.map((step, i) => (
            <span
              key={step.title}
              className={`h-1.75 w-9 rounded-full transition-colors pinned:h-2 pinned:w-14 ${i <= active ? "bg-primary" : "border-2 border-primary bg-card"}`}
            />
          ))}
        </div>
      </div>
    </>
  )
}
