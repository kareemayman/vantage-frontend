"use client"

import Lenis from "lenis"
import { useEffect } from "react"
import { gsap, ScrollTrigger } from "@/lib/gsap"
import { useReducedMotion } from "@/lib/use-reduced-motion"
import { wheelPace } from "@/lib/wheel-pace"

// Smooth scrolling for the whole site (Lenis): the mouse wheel glides instead of jumping
// in steps. Touch scrolling stays native (phones already glide), and so do the keyboard
// and the scrollbar. Off when motion is reduced (the device setting or the footer
// switch), and back on when it's allowed again. Renders nothing.
export function SmoothScroll() {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    // stopInertiaOnNavigate: clicking a link to another page stops the glide, so the
    // new page doesn't keep scrolling from the old flick of the wheel.
    // virtualScroll: Lenis shows us each scroll input before using it, so a page can slow
    // the wheel down (wheel-pace.ts)
    const lenis = new Lenis({
      stopInertiaOnNavigate: true,
      virtualScroll: (input) => {
        if (input.event.type === "wheel") input.deltaY *= wheelPace.current
        return true
      },
    })
    // Pinned and scrubbed sections (ScrollTrigger) re-check the scroll position the
    // moment Lenis moves the page, not a frame later
    lenis.on("scroll", ScrollTrigger.update)

    // Lenis eases the page a little closer to its target on every frame. GSAP's ticker
    // is the one frame loop behind every GSAP animation, so scroll and animation move
    // in the same frame (no jitter once sections pin and scrub).
    // Lenis only needs those frames while it's gliding. Asking for one 60 times a second
    // forever kept the browser redrawing a page nobody was scrolling, so the loop sleeps
    // after half a second of stillness, and the next turn of the wheel wakes it. Touch,
    // the keyboard and the scrollbar scroll natively, without the loop.
    let awake = false
    let still = 0 // frames in a row without a glide
    const tick = (time: number) => {
      lenis.raf(time * 1000) // GSAP counts seconds, Lenis ms
      still = lenis.isScrolling === "smooth" ? 0 : still + 1
      if (still > 30) sleep()
    }
    const wake = () => {
      if (awake) return
      awake = true
      still = 0
      // Lenis times each step from the frame before. After a nap that gap is huge, and
      // the glide would jump straight to its end, so the clock starts fresh.
      lenis.time = 0
      gsap.ticker.add(tick)
    }
    const sleep = () => {
      awake = false
      gsap.ticker.remove(tick)
    }
    wake()
    // Lenis's own wheel listener (added when it was created) runs first and starts the
    // glide; this one makes sure the loop is awake to play it
    window.addEventListener("wheel", wake, { passive: true })
    // GSAP fakes a short frame after a hiccup (e.g. a background tab). Scroll should
    // follow real time, so turn that off (the setup Lenis recommends).
    gsap.ticker.lagSmoothing(0)

    return () => {
      window.removeEventListener("wheel", wake)
      sleep()
      lenis.destroy() // removes its listeners and the "lenis" classes on <html>
    }
  }, [reduced])

  return null
}
