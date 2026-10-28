"use client"

import { useEffect } from "react"

// Loops nobody can see shouldn't run. Every section on the page, and the footer, gets
// data-offscreen while it's off screen, and one rule in globals.css pauses the CSS
// animations inside it (animation-play-state: paused). They carry on from where they
// stopped when you scroll back. Without this, the hero's sun, clouds and waves kept
// the browser redrawing from anywhere further down the page. Renders nothing.
//
// Every page renders this, not the layout. Next wraps each page in React's <Activity>
// (so the back button can bring it back instantly), and React hydrates that part after
// the layout. In the layout, this effect ran first and marked sections React hadn't
// hydrated yet: a hydration error. Inside the page, it runs once the page's sections
// are ready, and again each time Next shows the page again.
export function PauseOffscreen() {
  useEffect(() => {
    // No head start needed: a paused loop carries on from where it stopped, so nothing
    // jumps when it comes back into view. The -1px matters: a section that only touches
    // the screen's edge counts as "intersecting", and it would keep its loops running.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement
          if (entry.isIntersecting) delete el.dataset.offscreen
          else el.dataset.offscreen = ""
        }
      },
      { rootMargin: "-1px 0px" },
    )
    document.querySelectorAll("main section, footer").forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return null
}
