"use client"

import type { FocusEvent, PointerEvent, ReactNode } from "react"

// "Where we go": point at a row (mouse, finger, or keyboard focus) and its pin on the globe
// lights up and hops. Each row and its pin share a data-slug; this only moves data-on to
// the ones you point at, and the CSS decides what "on" looks like (data-on:fill-sun-300,
// motion-safe:data-on:animate-hop...). The last one you pointed at stays on, like a globe
// turned to that pin. The server HTML starts with the first tour on, so without
// JavaScript it simply stays there.
export function PinHighlight({ className, children }: { className?: string; children: ReactNode }) {
  const light = (event: PointerEvent<HTMLDivElement> | FocusEvent<HTMLDivElement>) => {
    // The row (or pin) the event came from, if any: pointerover and focus bubble up
    // here from whatever is under the pointer or focused
    const slug = (event.target as Element).closest("[data-slug]")?.getAttribute("data-slug")
    if (!slug) return
    const items = event.currentTarget.querySelectorAll<HTMLElement | SVGElement>("[data-slug]")
    for (const item of items) {
      if (item.dataset.slug === slug) item.dataset.on = ""
      else delete item.dataset.on
    }
  }

  return (
    <div className={className} onPointerOver={light} onFocus={light}>
      {children}
    </div>
  )
}
