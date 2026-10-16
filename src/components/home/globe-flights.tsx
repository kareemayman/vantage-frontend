"use client"

import { useRef, type ReactNode } from "react"
import { gsap, useGSAP } from "@/lib/gsap"
import { useReducedMotion } from "@/lib/use-reduced-motion"

// The globe's flights (src/components/scene/globe.tsx). When the globe scrolls into view,
// the tiny plane flies each flight in turn, and its dashed trail appears behind it.
// Without JavaScript, or with reduced motion, the globe stays the still picture: every
// trail drawn, the plane parked over North America.
export function GlobeFlights({ className, children }: { className?: string; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      const el = box.current
      const plane = el?.querySelector("[data-plane]")
      if (!el || !plane || reduced) return
      const flights = el.querySelectorAll<SVGPathElement>("[data-flight]")
      const trails = el.querySelectorAll<SVGPathElement>("[data-trail]")

      // Until the globe is on screen: no trails, no plane. A trail's stencil is 1 long
      // (pathLength), so one dash of 1, pushed 1 along (dashoffset), hides all of it;
      // pushing it back to 0 draws it in.
      gsap.set(trails, { strokeDasharray: 1, strokeDashoffset: 1 })
      gsap.set(plane, { opacity: 0, scale: 0.4, transformOrigin: "50% 50%" })

      // One timeline: flight 1, then 2, then 3. It starts once, when the globe's top is
      // 25% up the screen (like <Reveal>), and ScrollTrigger never replays it.
      const trip = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 75%", once: true },
        defaults: { duration: 1.2, ease: "power1.inOut" },
      })
      flights.forEach((path, i) => {
        trip
          // Along the flight, nose first (autoRotate; 180: the drawing faces left)
          .to(plane, {
            motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: 180 },
          })
          // ...growing in as it takes off ("<": at the same time as the line above)
          .to(plane, { opacity: 1, scale: 1, duration: 0.25 }, "<")
          // ...while its trail draws in behind it, at the same speed. autoRound: false:
          // GSAP rounds pixel values to whole numbers by default, which would turn
          // our 1 → 0 into a jump halfway instead of a smooth draw.
          .to(trails[i], { strokeDashoffset: 0, autoRound: false }, "<")
          // then it shrinks away onto the pin as it lands
          .to(plane, { opacity: 0, scale: 0.4, duration: 0.25 }, ">-0.25")
      })
    },
    { scope: box, dependencies: [reduced], revertOnUpdate: true },
  )

  return (
    <div ref={box} className={className}>
      {children}
    </div>
  )
}
