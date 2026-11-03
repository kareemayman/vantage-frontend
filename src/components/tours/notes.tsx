"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/button"
import { RainCloud, Snooze } from "@/components/scene/sky"
import { PlaneWindow } from "@/components/tours/plane-window"

// What the tours page says under the chips when there's something to tell: a picture, a
// handwritten line, a title, a sentence and a button (or a clock). The margin below leaves
// room for the still sun that rises out of the sea when there's no route (.horizon-sun in
// horizon.tsx): 99px tall on phones, 159px from md.
const NOTE_BOX = "mx-auto mt-10 mb-8 flex max-w-md flex-col items-center text-center md:mb-28"
// The notes about the list on screen: like the route, they dim while a new list is on its way
// (data-pending), and they make way for the waiting note once it shows (data-waiting)
const NOTE = `${NOTE_BOX} transition-opacity group-has-data-pending/tours:opacity-60 group-has-data-waiting/tours:hidden`
const HAND = "mt-3 -rotate-2 font-hand text-2xl text-primary"
// Narrower than the sentence, so a long title breaks into two short lines, like a poster
const TITLE =
  "mt-1 max-w-sm font-display text-4xl leading-none font-bold tracking-tight text-balance uppercase mx-auto"
// Balanced, not just pretty: a short centered sentence looks best with even lines
const TEXT = "mt-2 text-balance text-muted-foreground"

// No tour matches every filter that's on
export function NoMatches({ onClear }: { onClear: () => void }) {
  return (
    <div className={NOTE}>
      <div className="w-32 -rotate-3">
        <PlaneWindow shade="closed" />
      </div>
      <p className={HAND}>every shade is down</p>
      <h2 className={TITLE}>No tours match all of those</h2>
      <p className={TEXT}>Try taking one filter off, or start over.</p>
      <Button size="sm" className="mt-5" onClick={onClear}>
        Clear filters
      </Button>
    </div>
  )
}

type LoadFailedProps = {
  tries: number // goes up each time an answer arrives from the server
  onRetry: () => void
}

// The list didn't load: the API is down, or the connection dropped
export function LoadFailed({ tries, onRetry }: LoadFailedProps) {
  return (
    <div className={NOTE}>
      {/* The keys change with each answer, so a try that fails again brings a new cloud and
          new words: the cloud shakes its head again (wiggle), and screen readers read the
          words out again (role="alert"). The button keeps its place, so the keyboard focus
          stays on it. */}
      <RainCloud key={`cloud-${tries}`} className="w-44 motion-safe:animate-wiggle" />
      <div key={`words-${tries}`} role="alert">
        <p className={HAND}>sorry about this</p>
        <h2 className={TITLE}>We can&apos;t load the tours right now</h2>
        <p className={TEXT}>
          Something went wrong on our side, or the connection dropped. Give it a moment, then try
          again.
        </p>
      </div>
      <Button size="sm" className="mt-5" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}

const SHOW_AFTER = 4 // seconds. A normal answer takes 1–2 (measured), so sooner could flash
const LATE = 60 // seconds: longer than the API usually takes to wake up

// The wait while the API wakes up. The filter bar renders it while a new list is on its way,
// and it stays empty for the first few seconds. Its clock counts from the click. If the API
// is stuck, the server gives up after 90 s (api.ts) and the "can't load" note takes over.
export function WakingUp() {
  const [seconds, setSeconds] = useState(0)

  // A clock, like any setInterval in useEffect: it ticks every second and stops when the note
  // goes away. It counts from its start time, because intervals can run late.
  useEffect(() => {
    const start = Date.now()
    const tick = setInterval(() => setSeconds(Math.floor((Date.now() - start) / 1000)), 1000)
    return () => clearInterval(tick)
  }, [])

  if (seconds < SHOW_AFTER) return null

  return (
    <div data-waiting className={NOTE_BOX}>
      <div className="relative w-32 -rotate-3">
        <PlaneWindow shade="closed" />
        <Snooze color="text-primary" className="absolute -top-4 -right-7 -rotate-10 text-4xl" />
      </div>
      {/* role="status": screen readers read it out when it shows up, and again when the
          sentence changes. The clock stays outside, or they'd read it out every second. */}
      <div role="status">
        <p className={HAND}>no need to refresh</p>
        <h2 className={TITLE}>Getting the tours ready</h2>
        <p className={TEXT}>
          {seconds < LATE
            ? "Our server naps when it's quiet. Waking it up can take up to a minute."
            : "Still waking up. Thanks for hanging on."}
        </p>
      </div>
      <p className="mt-4 font-display text-3xl font-bold text-primary tabular-nums">
        {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
      </p>
    </div>
  )
}
