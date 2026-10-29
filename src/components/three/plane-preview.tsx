"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "@/lib/use-reduced-motion"

// three.js is big and only works in the browser. next/dynamic with ssr: false loads the
// scenes as their own file, in the browser only, when this component first renders, so
// the server never runs three.js and pages without a 3D scene never download it.
const scenes = () => import("@/components/three/plane-preview-scene")
const PlaneTurntable = dynamic(() => scenes().then((file) => file.PlaneTurntable), { ssr: false })
const PlaneFromAbove = dynamic(() => scenes().then((file) => file.PlaneFromAbove), { ssr: false })

// The 3D plane on the /design page: a turntable you can drag, and the view from above.
// Both hold still with reduced motion, and pause while they're off screen (a 3D scene
// redraws 60 times a second otherwise, even when nobody can see it).
export function PlanePreview() {
  const box = useRef<HTMLDivElement>(null)
  const [onScreen, setOnScreen] = useState(false)
  const reduced = useReducedMotion()
  const still = reduced || !onScreen

  useEffect(() => {
    const el = box.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const panel = "h-80 overflow-hidden rounded-3xl border bg-scene-sky"
  return (
    <div ref={box} className="grid gap-6 text-center text-xs font-semibold lg:grid-cols-2">
      <figure className="space-y-2">
        <div className={`${panel} cursor-grab active:cursor-grabbing`}>
          <PlaneTurntable still={still} />
        </div>
        <figcaption>Drag to turn it</figcaption>
      </figure>
      <figure className="space-y-2">
        <div className={panel}>
          <PlaneFromAbove still={still} />
        </div>
        <figcaption>From above, banking into its turns, like on the tours page</figcaption>
      </figure>
    </div>
  )
}
