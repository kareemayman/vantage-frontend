"use client"

import { useEffect, useId, useRef, useState, type ComponentType, type ReactNode } from "react"
import { Button } from "@/components/button"
import { PARKED, ROUTE } from "@/components/room-route"
import { Palm } from "@/components/scene/beach"
import { PlaneTop } from "@/components/scene/plane"
import { Cloud } from "@/components/scene/sky"
import { useCanDraw3D } from "@/lib/can-draw-3d"
import { useReducedMotion } from "@/lib/use-reduced-motion"
import { onWaitEnd, useNotesFromServer, useWaitingSince } from "@/lib/waiting"

const SHOW_AFTER = 3 // seconds of waiting before the room opens. A normal answer takes 1–2.
const LATE = 60 // seconds: longer than the API usually takes to wake up

// The waiting room. The API sleeps after 15 quiet minutes (Render's free plan) and takes up to a
// minute to wake up. When something has waited for it for a few seconds (a form, the account
// page), a full-screen room opens over the page: a little map with the plane on its way from our
// island to you, the words, a clock, and "Keep browsing". That button, or Esc, closes the room,
// and the wait carries on behind it. On the map, a 3D plane flies the route and circles your pin
// while you wait (room-scene.tsx); with reduced motion or without 3D, a flat one sits still.
// When the answer arrives, the plane lands at your pin and the room lifts away.
// It's rendered once, in the root layout. Whatever waits says so with useWaiting
// (src/lib/waiting.ts).
export function WaitingRoom() {
  useNotesFromServer()
  const since = useWaitingSince()
  // The room of the current wait. It stays a moment after the wait ends, while it leaves (the
  // plane lands, the room lifts away), so it's kept in state instead of read straight from the
  // store. A new wait gets its room at once: setting state while rendering, when a value has
  // changed, is React's way to keep state in step with it without an extra render.
  const [shown, setShown] = useState<number | null>(null)
  if (since !== null && since !== shown) setShown(since)
  if (shown === null) return null
  // key: a new room for each wait, so the clock and "Keep browsing" start over
  return <Room key={shown} since={shown} ended={since !== shown} onGone={() => setShown(null)} />
}

// The 3D plane (src/components/three/room-scene.tsx), once its file has loaded
type Scene = ComponentType<{ onFlying: () => void; landing: boolean; onLanded: () => void }>

// ms from when the room starts lifting until it's gone: the lift's beat and length in
// globals.css (--animate-room-lift: 0.25s + 0.45s), with a little to spare
const ROOM_GONE = 750

type RoomProps = {
  since: number // when the wait began (Date.now() time)
  ended: boolean // the wait is over: the room leaves
  onGone: () => void // it has left: take it away
}

function Room({ since, ended, onGone }: RoomProps) {
  const [seconds, setSeconds] = useState(0)
  const [closed, setClosed] = useState(false) // closed with "Keep browsing" or Esc
  const [Scene, setScene] = useState<Scene | null>(null)
  const [broken, setBroken] = useState(false) // the 3D file didn't load
  const [airborne, setAirborne] = useState(false) // the 3D plane has drawn its first frame
  const [landed, setLanded] = useState(false) // after the wait: the 3D plane is down
  const room = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const textId = useId()
  const reduced = useReducedMotion()
  const can3D = useCanDraw3D() // more than 2 cores and WebGL 2 (src/lib/can-draw-3d.ts)
  // Showing: the wait has been long enough, and you haven't closed it. It stays true while the
  // room leaves (the clock stops, so `seconds` stays put).
  const open = seconds >= SHOW_AFTER && !closed
  // The 3D plane flies while the room is open, unless motion is reduced, the device is too
  // weak, or its file didn't load. Otherwise the flat plane stays where it's drawn.
  const flying = open && can3D && !reduced && !broken
  // After the wait: the plane lands if it's already in the air, and the room lifts away once it's
  // down (or right away, with no 3D plane to land)
  const canLand = flying && Scene !== null && airborne
  const lifting = ended && open && (landed || !canLand)

  // After the wait, the room goes: right away if it never showed (most waits end within 3 s) or
  // you closed it, and otherwise once it has lifted away
  useEffect(() => {
    if (!ended) return
    if (!open) {
      onGone()
      return
    }
    if (!lifting) return
    const gone = setTimeout(onGone, ROOM_GONE)
    return () => clearTimeout(gone)
  }, [ended, open, lifting, onGone])

  // Load the 3D plane (three.js, ~240 KB) when the room opens, not before: most waits end
  // sooner, and never need it. A plain import() in the browser, like the tours page's plane: it
  // comes as its own file, the browser keeps it for the next wait, and if it fails (offline),
  // the flat plane stays.
  useEffect(() => {
    if (!flying) return
    import("@/components/three/room-scene")
      // A function that returns it: given a function, setState would call it
      .then((file) => setScene(() => file.RoomScene))
      .catch(() => setBroken(true))
  }, [flying])

  // The clock, like the tours page's waiting note: it counts from when the wait began, because
  // intervals can run late. It stops when the answer arrives.
  useEffect(() => {
    if (ended) return
    const tick = setInterval(() => setSeconds(Math.floor((Date.now() - since) / 1000)), 1000)
    return () => clearInterval(tick)
  }, [since, ended])

  // Open the <dialog> once the wait is long enough. showModal() makes it modal, like the delete
  // box: the page behind can't be clicked or tabbed to, Esc closes it, and the focus goes back
  // where it was when it closes.
  useEffect(() => {
    const box = room.current
    if (!open || !box) return
    box.showModal()
    // When the wait ends, stop blocking the page at once: React only gets to the room in its
    // next render, after the form's own effects, and those can't put the cursor on a field
    // while a modal dialog covers the page. So it closes now. But it stays on screen while the
    // plane lands and it lifts away: data-leaving makes the CSS below show it, closed.
    const stop = onWaitEnd(() => {
      box.dataset.leaving = ""
      box.close()
    })
    return () => {
      stop()
      box.close()
    }
  }, [open])

  return (
    // Display classes on a <dialog> would show it while closed, so they only apply while it
    // leaves (data-leaving:): then it's closed on purpose, but stays on screen, fixed over the
    // page and the navbar (z-50), until it has lifted away. Otherwise the layout goes on the div
    // inside. It fills the screen: no margin, no size limits, no border.
    // data-lenis-prevent: the wheel scrolls the room (on a short screen), not the page behind.
    // aria-describedby: screen readers read the sentence along with the title when it opens.
    // aria-hidden once the wait is over: the room is only a picture on its way out.
    // onClose: if you closed it (the button, Esc), it stays closed for the rest of this wait.
    // Not when the wait's end closed it (data-leaving): it still has to leave.
    <dialog
      ref={room}
      data-waiting-room
      data-lenis-prevent
      data-lifting={lifting || undefined}
      aria-labelledby={titleId}
      aria-describedby={textId}
      aria-hidden={ended || undefined}
      onClose={(event) => {
        if (!event.currentTarget.hasAttribute("data-leaving")) setClosed(true)
      }}
      className="m-0 size-full max-h-none max-w-none overflow-y-auto overscroll-contain border-0 bg-scene-sky p-0 text-foreground backdrop:bg-transparent data-leaving:fixed data-leaving:inset-0 data-leaving:z-60 data-leaving:block motion-safe:animate-room-in data-lifting:motion-safe:animate-room-lift data-lifting:motion-reduce:animate-room-fade"
    >
      <div className="grid min-h-full place-items-center px-6 py-8">
        <div className="flex w-full max-w-xl flex-col items-center text-center">
          {/* The map's height is half its width: on a short laptop, it shrinks so the words and
              the button still fit under it (22rem is their height, measured) */}
          <div className="w-[min(100%,max(14rem,calc((100svh-22rem)*2)))]">
            {/* The 3D plane doesn't start once the wait is over, if it wasn't flying yet: the
                room is already lifting away */}
            <RoomMap plane={!(flying && Scene && airborne)}>
              {flying && Scene && (airborne || !ended) && (
                <Scene
                  onFlying={() => setAirborne(true)}
                  landing={ended}
                  onLanded={() => setLanded(true)}
                />
              )}
            </RoomMap>
          </div>
          <p className="mt-6 -rotate-2 font-hand text-2xl text-primary">no need to refresh</p>
          <h2
            id={titleId}
            className="mt-1 font-display text-4xl leading-none font-bold tracking-tight text-balance uppercase md:text-5xl"
          >
            Getting things ready
          </h2>
          {/* role="status": screen readers read the new sentence when it changes at a minute.
              The clock stays outside, or they'd read it out every second. */}
          <p id={textId} role="status" className="mt-3 max-w-md text-balance text-muted-foreground">
            {seconds < LATE
              ? "Our server naps when it's quiet. Waking it up can take up to a minute."
              : "Still waking up. Thanks for hanging on."}
          </p>
          <p className="mt-4 font-display text-3xl font-bold text-primary tabular-nums">
            {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
          </p>
          {/* autoFocus: the cursor starts here when the room opens (there's nothing else).
              disabled once the wait is over, so Tab can't land on the room as it leaves. */}
          <Button
            variant="outline"
            size="sm"
            autoFocus
            disabled={ended}
            className="mt-5"
            onClick={() => room.current?.close()}
          >
            Keep browsing
          </Button>
        </div>
      </div>
    </dialog>
  )
}

// The drawn plane: 40% of the way along the route, nose along it, in degrees for SVG's rotate()
const PLANE = { x: PARKED.x, y: PARKED.y, angle: (PARKED.heading * 180) / Math.PI }

// Little waves on the sea, placed by hand clear of the island, the pin and the route
const WAVES = [
  [30, 112],
  [216, 36],
  [250, 58],
  [412, 50],
  [362, 166],
  [292, 214],
  [396, 252],
  [528, 232],
  [254, 272],
]

// The picture: the sea from above, our island with its palm on the left, you as a pin on the
// right, and the plane on the dotted route between them. Decoration: screen readers get the
// words under it instead.
// plane: draw the flat plane (false once the 3D one flies). children: the 3D plane's canvas,
// laid over the map (the box is `relative`, and its rounded corners clip the canvas too).
function RoomMap({ plane, children }: { plane: boolean; children?: ReactNode }) {
  return (
    <div
      aria-hidden
      className="relative overflow-hidden rounded-3xl border-4 border-outline bg-scene-sea shadow-pop"
    >
      <svg viewBox="0 0 600 300" className="block w-full">
        <g
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          className="stroke-white opacity-(--wave-opacity)"
        >
          {WAVES.map(([x, y]) => (
            <path key={`${x}-${y}`} d={`M${x} ${y}q6-6 12 0t12 0`} />
          ))}
        </g>

        {/* The island: a ring of shallow water, the sand, the palm, and its name */}
        <path
          d="M40 202C36 158 86 132 140 135C196 138 232 166 226 204C220 244 176 260 128 256C80 252 43 240 40 202Z"
          className="fill-white/25"
        />
        <path
          d="M62 200C60 170 96 151 140 153C184 155 208 176 204 202C200 230 166 241 129 238C92 235 64 226 62 200Z"
          strokeWidth="4"
          strokeLinejoin="round"
          className="fill-scene-sand stroke-outline"
        />
        {/* The trunk stands at 55% across the drawing, so its foot lands at (124, 208) */}
        <Palm x="76" y="64" width="88" height="144" />
        <text
          x="134"
          y="282"
          fontSize="28"
          textAnchor="middle"
          className="fill-foreground font-hand"
        >
          vantage
        </text>

        {/* The route: dots (a dash too short to see, with round ends) every 14 units */}
        <path
          d={ROUTE}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="0.1 14"
          className="stroke-white"
        />

        {/* You: a pin standing on the water, in a ripple, with its shadow at its foot */}
        <ellipse
          cx="488"
          cy="162"
          rx="30"
          ry="10"
          fill="none"
          strokeWidth="3"
          className="stroke-white/70"
        />
        <ellipse cx="488" cy="162" rx="12" ry="4" className="fill-navy-950/25" />
        <path
          d="M488 162C478 147 466 136 466 122a22 22 0 0 1 44 0c0 14-12 25-22 40Z"
          strokeWidth="4"
          strokeLinejoin="round"
          className="fill-sun-300 stroke-outline"
        />
        <circle cx="488" cy="122" r="8" strokeWidth="3" className="fill-white stroke-outline" />
        <text x="518" y="118" fontSize="30" className="fill-foreground font-hand">
          you
        </text>

        {plane && (
          <>
            {/* The plane's shadow on the sea below it: down and to the right (the sun is up to
                the left), turned the way the plane points. A body and a pair of wings. */}
            <g
              transform={`translate(${PLANE.x + 12} ${PLANE.y + 22}) rotate(${PLANE.angle})`}
              className="fill-navy-950/20"
            >
              <ellipse rx="25" ry="5" />
              <ellipse cx="-2" rx="7" ry="24" />
            </g>
            {/* The plane, its middle on the route: the drawing is 56 across, so it starts 28
                back */}
            <g transform={`translate(${PLANE.x} ${PLANE.y}) rotate(${PLANE.angle})`}>
              <PlaneTop x="-28" y="-28" width="56" height="56" />
            </g>
          </>
        )}

        {/* A cloud drifting past the corner, cut off by the map's edge */}
        <Cloud x="482" y="-18" width="160" height="88" />
      </svg>
      {children}
    </div>
  )
}
