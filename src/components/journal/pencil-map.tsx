import type { TourDetails } from "@/lib/tours"

type Stop = TourDetails["locations"][number]

const W = 400
const H = 300

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
  // Known gap: two stops close together on a long trip could overlap. The closest pair in
  // today's tours (Los Angeles and San Francisco, next to New York) still clears it.
  return stops.map((stop, i) => ({
    ...stop,
    x: left + (xs[i] - minX) * scale,
    y: top + (ys[i] - minY) * scale,
  }))
}

// The day-by-day map, drawn in pencil on the journal's page: each stop in its real place, as
// a stamp with its day's number, joined by a dotted route that bends a little, like a line
// drawn by hand. Hidden from screen readers: the list beside it names the stops.
export function PencilMap({ stops, className = "" }: { stops: Stop[]; className?: string }) {
  const points = place(stops)
  // Each leg is a curve whose bend point sits a fifth of the leg's length off to the side,
  // alternating sides
  const route = points
    .map((point, i) => {
      if (i === 0) return `M${point.x} ${point.y}`
      const before = points[i - 1]
      const bend = i % 2 ? 0.2 : -0.2
      const midX = (before.x + point.x) / 2 - (point.y - before.y) * bend
      const midY = (before.y + point.y) / 2 + (point.x - before.x) * bend
      return `Q${midX} ${midY} ${point.x} ${point.y}`
    })
    .join("")

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
      <path
        d={route}
        fill="none"
        strokeWidth="2.5"
        strokeDasharray="0.5 9"
        strokeLinecap="round"
        className="stroke-neutral-600"
      />
      {points.map((point) => (
        <g key={`${point.day}-${point.description}`}>
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
