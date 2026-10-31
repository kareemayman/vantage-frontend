"use client"

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentType,
  type ReactNode,
  type RefObject,
} from "react"
import {
  planFlight,
  planeLength,
  poseAt,
  type Flight,
  type Place,
  type Rect,
} from "@/components/tours/flight"
import { RoutePlane } from "@/components/tours/route-plane"
import { calm, findWind, type Wind } from "@/components/tours/wind"
import { useReducedMotion } from "@/lib/use-reduced-motion"
import { wheelPace } from "@/lib/wheel-pace"

// The 3D scene (src/components/three/flight-scene.tsx), once its file has loaded
type Scene = ComponentType<{
  flight: Flight
  place: RefObject<Place>
  trail: RefObject<SVGPathElement | null>
  wind: RefObject<Wind>
}>

// The mouse wheel scrolls this page at this speed (1 is normal), so there's time to watch
// the plane's tricks
const WHEEL_PACE = 0.6

// Is this device up to drawing 3D: more than 2 processor cores, and WebGL 2? Asked once, in
// the browser. useSyncExternalStore reads it the way useReducedMotion reads the motion
// setting; the server can't know, so it says no.
let capable: boolean | undefined
const canDraw3D = () =>
  (capable ??=
    navigator.hardwareConcurrency > 2 &&
    Boolean(document.createElement("canvas").getContext("webgl2")))
const neverChanges = () => () => {}

// The tours page's route: the plane's flight down the page, and its dotted trail.
// CSS places the start (data-route-start), a stop beside each card (data-route-stop in
// tour-card.tsx) and the end (data-route-end, both in route-ends.tsx). This measures where
// they landed and plans the flight through them (flight.ts), again whenever the list or
// the page changes size (a resize, a font loading).
// - Motion allowed, and the device can draw 3D: the 3D plane flies in, then flies the route
//   as you scroll, the trail's dots appear behind it, and its wind sways what it passes and
//   scares the gulls (wind.ts).
// - Reduced motion, or no 3D: the whole trail shows, and the flat plane waits at the start.
// Decoration: without JavaScript there's no trail and no plane, only the stops.
export function TourRoute({ children }: { children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  // Where the route is on the page
  const place = useRef<Place>({ left: 0, top: 0, height: 0, below: 0 })
  const trail = useRef<SVGPathElement>(null)
  const wind = useRef<Wind>({ things: [], flocks: [], plane: null }) // what the plane's air pushes around
  const [flight, setFlight] = useState<Flight | null>(null)
  const [Scene, setScene] = useState<Scene | null>(null)
  const [broken, setBroken] = useState(false) // the 3D file didn't load
  const reduced = useReducedMotion()
  const can3D = useSyncExternalStore(neverChanges, canDraw3D, () => false)
  const flying = can3D && !reduced && !broken

  // Plan the flight from where everything landed
  useEffect(() => {
    const el = box.current
    if (!el) return
    const observer = new ResizeObserver(() => {
      calm(wind.current) // nothing mid-sway while it's measured
      const origin = el.getBoundingClientRect()
      place.current = {
        left: origin.left + scrollX,
        top: origin.top + scrollY,
        height: origin.height,
        below: (el.closest("section")?.getBoundingClientRect().bottom ?? 0) - origin.bottom,
      }
      const measure = (node: Element): Rect => {
        const { left, top, right, bottom } = node.getBoundingClientRect()
        return {
          left: left - origin.left,
          top: top - origin.top,
          right: right - origin.left,
          bottom: bottom - origin.top,
        }
      }
      const middle = ({ left, top, right, bottom }: Rect) => ({
        x: (left + right) / 2,
        y: (top + bottom) / 2,
      })

      const stops = [...el.querySelectorAll("[data-route-stop]")]
      // The departure cloud only shows on md+ (no client rects while it's display: none)
      const cloud = el.querySelector("[data-route-start]")
      const start = cloud?.getClientRects().length ? middle(measure(cloud)) : null
      const end = el.querySelector("[data-route-end]")
      if (!end) return
      const length = planeLength(innerWidth)
      wind.current = findWind(el, measure)
      setFlight(
        planFlight({
          start,
          stops: stops.map((stop) => middle(measure(stop))),
          cards: stops.map((stop) => measure(stop.parentElement!)), // the stop's <li>
          end: measure(end),
          planeLength: length,
          // Just off the screen's right edge, a little above where it's headed
          arrival: { x: innerWidth - origin.left + length, y: (start?.y ?? 0) - 140 },
        }),
      )
    })
    observer.observe(el)
    // The route also moves without changing size when something above it does (a font
    // loading in the header). The page's size changes then.
    observer.observe(document.documentElement)
    return () => observer.disconnect()
  }, [])

  // Flying: load the 3D scene (three.js, ~240 KB). A plain import() in the browser: it
  // comes as its own file. It waits for the page's own load event, so it never competes
  // with the first photos or delays the page. If it fails (offline), the flat plane stands
  // in.
  useEffect(() => {
    if (!flying || Scene) return
    const load = () =>
      import("@/components/three/flight-scene")
        // A function that returns it: given a function, setState would call it
        .then((file) => setScene(() => file.FlightScene))
        .catch(() => setBroken(true))
    if (document.readyState === "complete") {
      load()
      return
    }
    addEventListener("load", load, { once: true })
    return () => removeEventListener("load", load)
  }, [flying, Scene])

  // The trail when it isn't flying: every dot, right away. Flying, the scene adds them as
  // the plane passes them, writing to the path itself so flying doesn't re-render React.
  useEffect(() => {
    if (!flying && flight) trail.current?.setAttribute("d", flight.dots.join(""))
  }, [flying, flight])

  // The slower wheel, while this page is showing
  useEffect(() => {
    wheelPace.current = WHEEL_PACE
    return () => {
      wheelPace.current = 1
    }
  }, [])

  const parked = flight && poseAt(flight, 0) // where the flat plane waits

  return (
    <div ref={box} className="relative">
      {/* No viewBox: 1 unit = 1px. Behind the cards, which come after it */}
      <svg aria-hidden className="pointer-events-none absolute inset-0 size-full overflow-visible">
        <path
          ref={trail}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          className="stroke-primary"
        />
      </svg>
      {children}
      {/* After the cards. The 3D plane's canvas is fixed anyway, so it isn't in this box */}
      {flying
        ? flight && Scene && <Scene flight={flight} place={place} trail={trail} wind={wind} />
        : parked && <RoutePlane x={parked.x} y={parked.y} heading={parked.heading} />}
    </div>
  )
}
