import { Button } from "@/components/button"
import { RainCloud } from "@/components/scene/sky"
import { PlaneWindow } from "@/components/tours/plane-window"

// What the tours page says in place of the route when there's nothing to show: a picture, a
// handwritten line, a title, a sentence and a button. The filter bar shows them under the
// chips. Like the route, they dim while a new list is on its way (data-pending). The margin
// below leaves room for the still sun that rises out of the sea when there's no route
// (.horizon-sun in horizon.tsx): 99px tall on phones, 159px from md.
const NOTE =
  "mx-auto mt-10 mb-8 flex max-w-md flex-col items-center text-center transition-opacity group-has-data-pending/tours:opacity-60 md:mb-28"
const HAND = "mt-3 -rotate-2 font-hand text-2xl text-primary"
// Narrower than the sentence, so a long title breaks into two short lines, like a poster
const TITLE =
  "mt-1 max-w-sm font-display text-4xl leading-none font-bold tracking-tight text-balance uppercase mx-auto"
const TEXT = "mt-2 text-pretty text-muted-foreground"

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
