"use client"

import Lenis from "lenis"
import { useEffect } from "react"
import { gsap, ScrollTrigger } from "@/lib/gsap"
import { useReducedMotion } from "@/lib/use-reduced-motion"

// Smooth scrolling for the whole site (Lenis): the mouse wheel glides instead of jumping
// in steps. Touch scrolling stays native (phones already glide), and so do the keyboard
// and the scrollbar. Off when motion is reduced (the device setting or the footer
// switch), and back on when it's allowed again. Renders nothing.
export function SmoothScroll() {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    // stopInertiaOnNavigate: clicking a link to another page stops the glide, so the
    // new page doesn't keep scrolling from the old flick of the wheel
    const lenis = new Lenis({ stopInertiaOnNavigate: true })
    // Pinned and scrubbed sections (ScrollTrigger) re-check the scroll position the
    // moment Lenis moves the page, not a frame later
    lenis.on("scroll", ScrollTrigger.update)

    // Lenis eases the page a little closer to its target on every frame. GSAP's ticker
    // is the one frame loop behind every GSAP animation, so scroll and animation move
    // in the same frame (no jitter once sections pin and scrub).
    const tick = (time: number) => lenis.raf(time * 1000) // GSAP counts seconds, Lenis ms
    gsap.ticker.add(tick)
    // GSAP fakes a short frame after a hiccup (e.g. a background tab). Scroll should
    // follow real time, so turn that off (the setup Lenis recommends).
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy() // removes its listeners and the "lenis" classes on <html>
    }
  }, [reduced])

  return null
}
