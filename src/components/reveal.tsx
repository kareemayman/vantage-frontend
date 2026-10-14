"use client"

import { useEffect, useRef, type ComponentProps } from "react"

// A box whose entrance plays once, when it scrolls into view. It only sets data-reveal:
// "waiting" as soon as the page runs, then "seen" once the box is on screen. The CSS
// decides what that means, e.g. waiting:opacity-0 seen:animate-swing-in (globals.css).
// Without JavaScript nothing is set, so nothing stays hidden.
export function Reveal(props: ComponentProps<"div">) {
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = box.current
    if (!el) return
    el.dataset.reveal = "waiting"
    // "Tell me when the box's top comes 25% up from the bottom of the screen"
    // (so you see it happen), then stop watching: it plays only once
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        el.dataset.reveal = "seen"
        observer.disconnect()
      },
      { rootMargin: "0px 0px -25% 0px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return <div {...props} ref={box} />
}
