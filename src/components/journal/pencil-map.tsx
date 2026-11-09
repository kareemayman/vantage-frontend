import type { TourDetails } from "@/lib/tours"

type Stop = TourDetails["locations"][number]
type Point = { x: number; y: number }

const W = 400
const H = 300

// The route's timing, in seconds from when the map scrolls into view. The first stop is
// stamped, then the pencil sets off and draws the route one leg at a time, and each stop is
// stamped as the pencil gets there. A leg takes a beat (it eases out of one stop and into the
// next) plus its length at the pencil's pace, so long legs take longer, like a real pencil.
const FIRST_STAMP = 0.1
const SET_OFF = 0.45 // the pencil sets off once the first stamp has landed
const BEAT = 0.35
const PACE = 600 // map units per second (the map is 400 wide)
const EARLY = 0.15 // a stamp starts this much before the pencil arrives, so it lands just after

// Puts the stops in the map's W×H box by their real coordinates (GeoJSON: [longitude,
// latitude]), at the same scale both ways, north up. Away from the equator a degree of
// longitude is shorter than a degree of latitude, so longitudes shrink by the cosine of the
// latitude. The stops fill the box: three vineyards a few miles apart get as much room as a
// trip across the country.
function place(stops: Stop[]) {
  const lats = stops.map((stop) => stop.coordinates[1])
  const shrink = Math.cos((((Math.min(...lats) + Math.max(...lats)) / 2) * Math.PI) / 180)
  const xs = stops.map((stop) => stop.coordinates[0] * shrink)
  const ys = stops.map((stop) => -stop.coordinates[1])
  const [minX, maxX, minY, maxY] = [
    Math.min(...xs),
    Math.max(...xs),
    Math.min(...ys),
    Math.max(...ys),
  ]
  // 60 and 50: room around the stops for the pins, the frame and the compass
  const scale = Math.min((W - 120) / (maxX - minX || 1), (H - 100) / (maxY - minY || 1))
  const left = (W - (maxX - minX) * scale) / 2
  const top = (H - (maxY - minY) * scale) / 2
  // Known gap: two stops close together on a long trip overlap. Today that's The Sports
  // Lover's first two (Point Dume Beach and Venice Skate Park, 12 units apart on a map of
  // California): the day 4 pin covers the day 1 pin.
  return stops.map((stop, i) => ({
    ...stop,
    x: left + (xs[i] - minX) * scale,
    y: top + (ys[i] - minY) * scale,
  }))
}

// A curve's length (a, to b, bending toward c), from 20 straight pieces along it: close
// enough for timing
function curveLength(a: Point, c: Point, b: Point) {
  let length = 0
  let before = a
  for (let i = 1; i <= 20; i++) {
    const t = i / 20
    const point = {
      x: (1 - t) ** 2 * a.x + 2 * (1 - t) * t * c.x + t ** 2 * b.x,
      y: (1 - t) ** 2 * a.y + 2 * (1 - t) * t * c.y + t ** 2 * b.y,
    }
    length += Math.hypot(point.x - before.x, point.y - before.y)
    before = point
  }
  return length
}

// The map's plan: where each stop goes, each leg of the route with when it's drawn, and when
// each stop is stamped (stampAt, one per stop; the list beside the map uses it too). Each leg
// is a curve whose bend point sits a fifth of the leg's length off to the side, alternating
// sides. Works with one stop too: no legs, one stamp.
export function planRoute(stops: Stop[]) {
  const points = place(stops)
  let at = SET_OFF
  const legs = points.slice(1).map((point, i) => {
    const from = points[i]
    const bend = i % 2 ? -0.2 : 0.2
    const bendAt = {
      x: (from.x + point.x) / 2 - (point.y - from.y) * bend,
      y: (from.y + point.y) / 2 + (point.x - from.x) * bend,
    }
    const curve = `Q${bendAt.x} ${bendAt.y} ${point.x} ${point.y}`
    const time = BEAT + curveLength(from, bendAt, point) / PACE
    const leg = { from, curve, at, time }
    at += time
    return leg
  })
  const stampAt = [FIRST_STAMP, ...legs.map((leg) => leg.at + leg.time - EARLY)]
  return { points, legs, stampAt }
}

type PencilMapProps = {
  route: ReturnType<typeof planRoute>
  id: string // for the route's stencil: an id no other page has
  className?: string
}

// The day-by-day map, drawn in pencil on the journal's page: each stop in its real place, as
// a stamp with its day's number, joined by a dotted route that bends a little, like a line
// drawn by hand. Hidden from screen readers: the list beside it names the stops.
// Once it scrolls into view (inside a <Reveal>), the pencil draws the route and each stop is
// stamped as it arrives (route's timing). Reduced motion: it's all just there.
export function PencilMap({ route, id, className = "" }: PencilMapProps) {
  const { points, legs, stampAt } = route

  return (
    <svg aria-hidden viewBox={`0 0 ${W} ${H}`} className={className}>
      {/* A pencil frame, a little crooked, and a doodled compass */}
      <path
        d="M14 18Q200 10 386 16L384 284Q200 292 16 286Z"
        fill="none"
        strokeWidth="2"
        strokeLinejoin="round"
        className="stroke-neutral-500"
      />
      <g transform="translate(360 56)">
        <path
          d="M0 18L0 -14M-6 -7L0 -15L6 -7"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-navy-700"
        />
        <text y="-21" textAnchor="middle" className="fill-navy-700 font-hand text-[18px]">
          N
        </text>
      </g>

      {/* The route is dotted, and a dotted line can't draw itself in: its dash settings are
          busy making the dots. So it's seen through a stencil (a mask), like the globe's
          flights: a solid copy of each leg, drawn in at its turn (draw in globals.css), and
          the dots only show where the stencil is drawn. Without the animation, the stencil
          is all there, so the whole route shows. */}
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
          {legs.map((leg, i) => (
            <path
              key={i}
              d={`M${leg.from.x} ${leg.from.y}${leg.curve}`}
              pathLength={1}
              fill="none"
              strokeWidth="10"
              className="stroke-white motion-safe:waiting:opacity-0 motion-safe:seen:animate-leg"
              style={{ animationDelay: `${leg.at}s`, animationDuration: `${leg.time}s` }}
            />
          ))}
        </mask>
      </defs>
      <path
        d={`M${points[0].x} ${points[0].y}${legs.map((leg) => leg.curve).join("")}`}
        mask={`url(#${id})`}
        fill="none"
        strokeWidth="2.5"
        strokeDasharray="0.5 9"
        strokeLinecap="round"
        className="stroke-neutral-600"
      />

      {/* The stops, stamped as the pencil gets there (stamp-on: the cover's difficulty
          stamp). origin-center transform-fill: each one turns and shrinks around its own
          middle. */}
      {points.map((point, i) => (
        <g
          key={`${point.day}-${point.description}`}
          className="origin-center transform-fill motion-safe:waiting:opacity-0 motion-safe:seen:animate-stamp-on"
          style={{ animationDelay: `${stampAt[i]}s` }}
        >
          <circle
            cx={point.x}
            cy={point.y}
            r="15"
            strokeWidth="2.5"
            strokeDasharray="3 3"
            className="fill-sand-50 stroke-coral-600"
          />
          <text
            x={point.x}
            y={point.y + 4.5}
            textAnchor="middle"
            className="fill-coral-600 font-display text-[13px] font-bold"
          >
            {point.day}
          </text>
        </g>
      ))}
    </svg>
  )
}
