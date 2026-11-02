"use client"

import { useRouter } from "next/navigation"
import { startTransition, useId, useOptimistic, useRef, type ReactNode } from "react"
import { Button } from "@/components/button"
import { PlaneWindow } from "@/components/tours/plane-window"
import {
  filtersToUrl,
  hasFilters,
  HOW_HARD,
  HOW_LONG,
  NO_FILTERS,
  PRICES,
  SORTS,
  type Filters,
} from "@/lib/tour-filters"

type FilterBarProps = {
  filters: Filters // what the URL says, read by the server
  count: number // how many tours those filters found
  total: number // how many tours there are
}

// The chips, the count and the sort menu, plus the note when nothing matches. A click changes
// the URL, the server asks the API for that list, and the new page arrives. That can take a
// moment, so useOptimistic shows the chip as picked right away: it's like useState, except it
// goes back to the real `filters` by itself once the new page is here. `pending` does the same
// for data-pending, which dims the cards (group-has-data-pending in tours/page.tsx).
export function FilterBar({ filters, count, total }: FilterBarProps) {
  const router = useRouter()
  const bar = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useOptimistic(filters)
  const [pending, setPending] = useOptimistic(false)

  function apply(next: Filters) {
    startTransition(() => {
      setShown(next)
      setPending(true)
      // scroll: false: stay where you are, don't jump to the top of the page
      router.push(filtersToUrl(next), { scroll: false })
    })
  }

  // How long and Price are pick-one: another chip replaces the choice, the same one clears it
  const pick = (key: "length" | "price", value: string) =>
    apply({ ...shown, [key]: shown[key] === value ? null : value })

  const toggleHard = (value: string) =>
    apply({
      ...shown,
      difficulty: shown.difficulty.includes(value)
        ? shown.difficulty.filter((other) => other !== value)
        : [...shown.difficulty, value],
    })

  // The button that was clicked is about to disappear, which would drop keyboard users back at
  // the top of the page. The bar takes the focus instead, so Tab carries on from the chips.
  function clear() {
    apply({ ...NO_FILTERS, sort: shown.sort })
    bar.current?.focus()
  }

  const filtered = hasFilters(shown)

  return (
    <div
      ref={bar}
      tabIndex={-1}
      data-pending={pending ? "" : undefined}
      className="relative z-10 mx-auto max-w-6xl px-4 pb-24 outline-none md:px-6 md:pb-20"
    >
      {/* Phones: one row of chips you swipe, with no titles. md+: titled groups that wrap.
          xl: a little tighter (here and in the chips), so all three fit on one row */}
      <div className="-mx-4 flex scrollbar-none gap-x-2 overflow-x-auto px-4 pt-1 pb-2 md:mx-0 md:flex-wrap md:gap-x-8 md:gap-y-4 md:overflow-visible md:p-0 xl:gap-x-6 [&::-webkit-scrollbar]:hidden">
        {filtered && (
          <button
            type="button"
            onClick={clear}
            className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-primary px-3.5 text-sm font-bold whitespace-nowrap text-primary-foreground md:hidden"
          >
            <span aria-hidden>×</span> Clear filters
          </button>
        )}
        <Group title="How hard">
          {HOW_HARD.map(({ value, label }) => (
            <Chip
              key={value}
              label={label}
              on={shown.difficulty.includes(value)}
              onClick={() => toggleHard(value)}
            />
          ))}
        </Group>
        <Group title="How long">
          {HOW_LONG.map(({ value, label }) => (
            <Chip
              key={value}
              label={label}
              round
              on={shown.length === value}
              onClick={() => pick("length", value)}
            />
          ))}
        </Group>
        <Group title="Price per person">
          {PRICES.map(({ value, label }) => (
            <Chip
              key={value}
              label={label}
              round
              on={shown.price === value}
              onClick={() => pick("price", value)}
            />
          ))}
        </Group>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 md:mt-5">
        <div className="flex min-h-11 items-center gap-3 rounded-full border-2 border-nav-border bg-nav px-3.5 text-sm font-semibold md:px-4 md:text-base">
          {/* role="status": screen readers announce it when it changes */}
          <p role="status">
            {!hasFilters(filters) ? (
              <>
                <span className="font-display text-2xl font-bold">{total}</span> tours
              </>
            ) : count === 0 ? (
              "No tours match"
            ) : (
              <>
                <span className="font-display text-2xl font-bold">{count}</span> of {total} tours{" "}
                {count === 1 ? "matches" : "match"}
              </>
            )}
          </p>
          {filtered && (
            <button
              type="button"
              onClick={clear}
              className="hidden items-center gap-1 text-sm font-bold whitespace-nowrap text-primary underline-offset-4 hover:underline md:flex"
            >
              <span aria-hidden>×</span> Clear filters
            </button>
          )}
        </div>

        {/* A real <select>: the keyboard, screen readers and the phone's own picker all come
            free. Only its closed look is ours; the open list is drawn by the browser. */}
        <label className="flex min-h-11 items-center gap-2.5 rounded-full border-2 border-nav-border bg-nav p-0.5 md:pl-4">
          <span className="sr-only text-xs font-extrabold tracking-[0.14em] whitespace-nowrap uppercase md:not-sr-only">
            Sort by
          </span>
          <span className="relative">
            <select
              value={shown.sort}
              onChange={(event) => apply({ ...shown, sort: event.target.value })}
              className="h-9.5 cursor-pointer appearance-none rounded-full border-2 border-outline bg-card pr-8.5 pl-3 text-sm font-bold text-card-foreground"
            >
              {SORTS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 fill-none stroke-current stroke-3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </label>
      </div>

      {count === 0 && (
        <div className="mx-auto mt-10 flex max-w-sm flex-col items-center text-center">
          <div className="w-32 -rotate-3">
            <PlaneWindow shade="closed" />
          </div>
          <p className="mt-3 -rotate-2 font-hand text-2xl text-primary">every shade is down</p>
          <h2 className="mt-1 font-display text-4xl leading-none font-bold tracking-tight text-balance uppercase">
            No tours match all of those
          </h2>
          <p className="mt-2 text-pretty text-muted-foreground">
            Try taking one filter off, or start over.
          </p>
          <Button size="sm" className="mt-5" onClick={clear}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  )
}

// A titled row of chips, named for screen readers ("How hard, group")
function Group({ title, children }: { title: string; children: ReactNode }) {
  const id = useId()

  return (
    <div role="group" aria-labelledby={id} className="shrink-0">
      <p
        id={id}
        className="sr-only text-xs font-extrabold tracking-[0.14em] uppercase md:not-sr-only md:mb-2"
      >
        {title}
      </p>
      <div className="flex gap-2 xl:gap-1.5">{children}</div>
    </div>
  )
}

// One filter. aria-pressed makes it a toggle button: "Easy, toggle button, pressed".
// round: the usual sign that you can only pick one, like a radio button.
type ChipProps = { label: string; on: boolean; round?: boolean; onClick: () => void }

function Chip({ label, on, round = false, onClick }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full border-2 border-outline px-3.5 text-sm font-bold whitespace-nowrap transition-colors xl:gap-1.5 xl:px-2.5 ${on ? "bg-cta text-cta-foreground shadow-pop" : "bg-card text-card-foreground hover:bg-accent"}`}
    >
      <span
        aria-hidden
        className={`grid size-4.5 place-items-center border-2 border-outline ${round ? "rounded-full" : "rounded-md"} ${on ? "bg-navy-950" : ""}`}
      >
        {on && (
          <svg
            viewBox="0 0 24 24"
            className="size-3 fill-none stroke-sun-300 stroke-4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        )}
      </span>
      {label}
    </button>
  )
}
