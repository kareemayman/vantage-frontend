"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

export type JourneyStep = {
  title: string
  text: string
  panel: string // background class for the illustration panel
  art: ReactNode // the illustration, rendered on the server and passed in
}

// The Journey's cards and their "01 / 06" progress.
// Phones: the cards swipe sideways (CSS scroll-snap), and an IntersectionObserver
// notices which card is in view, so its number badge fills in and the progress follows.
// From md up the cards sit in a calm grid (motion comes with GSAP in the next step).
export function JourneyTrack({ steps }: { steps: JourneyStep[] }) {
  const track = useRef<HTMLOListElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const list = track.current
    if (!list) return
    const cards = Array.from(list.children)

    // "Tell me whenever a card becomes at least 60% visible inside the track"
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(cards.indexOf(entry.target))
        }
      },
      { root: list, threshold: 0.6 },
    )
    cards.forEach((card) => observer.observe(card))
    return () => observer.disconnect() // stop watching when the component unmounts
  }, [])

  return (
    <>
      {/* The swipe track (phones). tabIndex + label: keyboard users can focus it and
          scroll it with the arrow keys.
          pt-8: a scroll container clips whatever pokes out of it, so the top padding has
          to fit the badge (22px above its card) plus the active card's 8px lift.
          The scrollbar is hidden: the peek, the progress and swiping show there's more. */}
      <ol
        ref={track}
        tabIndex={0}
        aria-label={`The journey, ${steps.length} stops`}
        className="-mx-4 mt-7 flex snap-x snap-mandatory scroll-px-4 scrollbar-none gap-4 overflow-x-auto overscroll-x-contain px-4 pt-8 pb-4 md:mx-0 md:mt-16 md:grid md:snap-none md:grid-cols-2 md:gap-x-8 md:gap-y-14 md:overflow-visible md:p-0 xl:grid-cols-3 [&::-webkit-scrollbar]:hidden"
      >
        {steps.map((step, i) => (
          <li
            key={step.title}
            data-state={i < active ? "done" : i === active ? "active" : "next"}
            className="group/card w-72.5 shrink-0 snap-start md:w-auto"
          >
            {/* The card in view lifts a little (phones) */}
            <article className="relative flex h-full flex-col rounded-[22px] border-3 border-outline bg-card p-3.5 shadow-md transition-transform duration-300 max-md:group-data-[state=active]/card:-translate-y-2 md:rounded-3xl md:p-4">
              {/* Stop number: filled once you've reached it, outlined while it's ahead.
                  The list is already numbered for screen readers, so this is decoration.
                  z-10: stays above the picture panel (card 4's panel is `relative`, and a
                  later positioned element would otherwise paint over it). */}
              <span
                aria-hidden
                className="absolute -top-5.5 -left-1.5 z-10 grid size-13 place-items-center rounded-full border-3 border-navy-950 bg-sun-300 font-display text-[22px] font-bold text-navy-950 transition-colors max-md:group-data-[state=next]/card:border-outline max-md:group-data-[state=next]/card:bg-card max-md:group-data-[state=next]/card:text-foreground md:-top-6.5 md:-left-5 md:size-16 md:text-[26px]"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div
                className={`grid h-35 place-items-center rounded-xl md:h-42.5 md:rounded-[14px] ${step.panel}`}
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

      {/* Progress (phones): "02 / 04" and four segments. Decoration: the list says it all. */}
      <div aria-hidden className="mt-6 flex items-center gap-3 md:hidden">
        <span className="font-display text-lg font-bold">
          {String(active + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
        </span>
        <div className="flex gap-1.25">
          {steps.map((step, i) => (
            <span
              key={step.title}
              className={`h-1.75 w-9 rounded-full transition-colors ${i <= active ? "bg-primary" : "border-2 border-primary bg-card"}`}
            />
          ))}
        </div>
      </div>
    </>
  )
}
