"use client"

import { useRef } from "react"
import { PlaneTop } from "@/components/scene/plane"
import type { Hop } from "@/components/tours/tour-route"
import { gsap, useGSAP } from "@/lib/gsap"
import { useReducedMotion } from "@/lib/use-reduced-motion"

// The plane on the tours page's route, seen from above (the route runs down the page, and
// a side-view plane pointing down would look like it's crashing). Scrolling flies it down
// the route one hop at a time, level with the middle of the screen. On each hop it climbs
// and lands again: --alt goes from 0 (on a stop) to 1 (halfway) and back, and CSS turns
// that into a bigger plane and a shadow farther away from it.
// Reduced motion: it waits at the start. Without JavaScript there's no plane.
export function RoutePlane({ hops }: { hops: Hop[] }) {
  const sky = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      const layer = sky.current
      const last = hops.at(-1)
      if (!layer || !last) return
      const pilots = layer.querySelectorAll("[data-pilot]") // the plane and its shadow
      // Each hop as its own SVG path, starting where the hop starts
      const paths = hops.map(({ from, curve }) => `M${from.x} ${from.y}${curve}`)

      // MotionPath sets x and y to the path's points, which are in px from the route's
      // top-left corner, where the plane's box sits. xPercent/yPercent pull the box back so
      // a spot just in front of its nose (110% across, 50% down) is what rides the line,
      // and it turns around that spot. So on a stop its nose touches the dot instead of
      // covering it.
      gsap.set(pilots, { xPercent: -110, yPercent: -50, transformOrigin: "110% 50%" })
      gsap.set(layer, { visibility: "visible" }) // hidden until now: it would sit in the corner
      // Waiting at the start, its nose pointing along the first hop. Set right away: the
      // timeline below draws nothing until the page first scrolls
      gsap.set(pilots, { motionPath: { path: paths[0], autoRotate: true, end: 0 } })
      if (reduced) return

      // One timeline, which the scroll turns (scrub), like the Journey's ride. Each hop
      // lasts as long as it is tall, in px, so 1px of scrolling moves the plane about 1px
      // down the page: it stays level with the middle of the screen.
      const ride = gsap.timeline({
        scrollTrigger: {
          trigger: layer, // its top is the route's top
          // It leaves when the start reaches the middle of the screen, and lands on the end
          // when the end gets there. clamp(): if the start is already above the middle when
          // the page loads (a tall screen), it leaves right away instead of mid-hop
          start: `clamp(top+=${hops[0].from.y} center)`,
          end: `clamp(top+=${last.to.y} center)`,
          scrub: true,
        },
      })
      let time = 0
      hops.forEach((hop, i) => {
        const length = hop.to.y - hop.from.y
        // Along the hop, nose first. sine.inOut: it slows down to land on each stop and
        // speeds up again to take off
        ride.to(
          pilots,
          {
            motionPath: { path: paths[i], autoRotate: true },
            duration: length,
            ease: "sine.inOut",
          },
          time,
        )
        // ...climbing for the first half of the hop and coming back down for the second
        // (repeat + yoyo: it plays once more, backward)
        ride.to(
          layer,
          { "--alt": 1, duration: length / 2, ease: "sine.out", repeat: 1, yoyo: true },
          time,
        )
        time += length
      })
    },
    { dependencies: [hops, reduced], revertOnUpdate: true },
  )

  return (
    // A box with no size in the route's top-left corner: GSAP moves the plane from here.
    // --plane: the plane's size. --alt: how high it flies, from 0 to 1 (GSAP changes it)
    <div
      ref={sky}
      aria-hidden
      className="pointer-events-none invisible absolute top-0 left-0 [--alt:0] [--plane:2.5rem] md:[--plane:3rem] lg:[--plane:4rem]"
    >
      {/* The shadow: a see-through black copy. The higher the plane, the farther it falls,
          down and to the left (away from the sun in the header) */}
      <div className="absolute translate-x-[calc(var(--alt)*var(--plane)*-0.25)] translate-y-[calc(var(--alt)*var(--plane)*0.4)] opacity-20">
        <div data-pilot className="absolute w-(--plane)">
          <PlaneTop className="block w-full brightness-0" />
        </div>
      </div>
      {/* The plane. It grows as it climbs, around the spot that rides the line */}
      <div data-pilot className="absolute w-(--plane)">
        <PlaneTop className="block w-full origin-[110%_50%] scale-[calc(1+var(--alt)*0.5)]" />
      </div>
    </div>
  )
}
