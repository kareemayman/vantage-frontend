"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

type Point = { x: number; y: number }
type Box = Point & { width: number; height: number }

// The dotted route down the tours page. CSS places its start (data-route-start), a stop
// beside each card (data-route-stop in tour-card.tsx) and its end (data-route-end, both in
// route-ends.tsx); this measures where they landed and draws the line through them, and
// again whenever the list changes size (a resize, a font loading).
// Decoration: without JavaScript there's no line, only the stops.
export function TourRoute({ children }: { children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  const [path, setPath] = useState("")

  useEffect(() => {
    const el = box.current
    if (!el) return
    const observer = new ResizeObserver(() => {
      const origin = el.getBoundingClientRect()
      const measure = (node: Element): Box => {
        const { x, y, width, height } = node.getBoundingClientRect()
        return { x: x - origin.x, y: y - origin.y, width, height }
      }
      const middle = ({ x, y, width, height }: Box) => ({ x: x + width / 2, y: y + height / 2 })

      const stops = [...el.querySelectorAll("[data-route-stop]")].map((n) => middle(measure(n)))
      // The departure cloud only shows on md+ (no client rects while it's display: none)
      const start = el.querySelector("[data-route-start]")
      const end = el.querySelector("[data-route-end]")
      setPath(
        route(
          stops,
          start?.getClientRects().length ? middle(measure(start)) : null,
          end ? measure(end) : null,
        ),
      )
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={box} className="relative">
      {/* No viewBox: 1 unit = 1px. Behind the cards, which come after it */}
      <svg aria-hidden className="pointer-events-none absolute inset-0 size-full overflow-visible">
        {path && (
          <path
            d={path}
            fill="none"
            strokeWidth="4"
            strokeDasharray="3 14"
            strokeLinecap="round"
            className="stroke-primary"
          />
        )}
      </svg>
      {children}
    </div>
  )
}

// SVG path data for the route:
// - from the departure cloud (md+), leaving sideways toward the first stop and turning
//   down into it; without one (phones), straight down from the top;
// - through every stop;
// - to the top of the count at the end, at the point nearest the last stop.
function route(stops: Point[], start: Point | null, end: Box | null) {
  const first = stops[0]
  const last = stops.at(-1)
  if (!first || !last || !end) return ""

  let d = start
    ? `M${start.x} ${start.y} C${start.x + (first.x - start.x) * 0.7} ${start.y} ${first.x} ${first.y - (first.y - start.y) * 0.7} ${first.x} ${first.y}`
    : `M${first.x} 0V${first.y}`
  for (let i = 1; i < stops.length; i++) d += hop(stops[i - 1], stops[i])
  const x = Math.min(Math.max(last.x, end.x + 20), end.x + end.width - 20)
  return d + hop(last, { x, y: end.y })
}

// One hop: it leaves and lands heading straight down, so it swings across in an S
function hop(a: Point, b: Point) {
  const half = (b.y - a.y) / 2
  return ` C${a.x} ${a.y + half} ${b.x} ${b.y - half} ${b.x} ${b.y}`
}
