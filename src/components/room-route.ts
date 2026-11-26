// The waiting room's map (waiting-room.tsx) and the 3D plane's flight over it (room-scene.tsx),
// in the map's units: 600 × 300, x to the right and y down, like the map's SVG.

export const MAP = { width: 600, height: 300 }

// The dotted route: a curve from the island to your pin. It's a quadratic Bézier curve: it
// starts at FROM, ends at TO, and bends toward PULL on the way, like a flight path drawn on a
// map.
const FROM = { x: 202, y: 176 }
const PULL = { x: 330, y: 28 }
const TO = { x: 474, y: 150 }
export const ROUTE = `M${FROM.x} ${FROM.y}Q${PULL.x} ${PULL.y} ${TO.x} ${TO.y}`

// The point `t` of the way along the route (0 at the island, 1 at you), and the way it heads
// there, in radians (clockwise from →, because y goes down): the curve's formula, and its slope
function along(t: number) {
  const u = 1 - t
  const at = (a: number, b: number, c: number) => u * u * a + 2 * u * t * b + t * t * c
  const slope = (a: number, b: number, c: number) => u * (b - a) + t * (c - b)
  return {
    x: at(FROM.x, PULL.x, TO.x),
    y: at(FROM.y, PULL.y, TO.y),
    heading: Math.atan2(slope(FROM.y, PULL.y, TO.y), slope(FROM.x, PULL.x, TO.x)),
  }
}

// Where the drawn plane sits (still: reduced motion, or before the 3D one has loaded), and
// where the 3D one takes over from it, so it doesn't jump
const PARKED_AT = 0.4
export const PARKED = along(PARKED_AT)

// ---- The 3D plane's flight (room-scene.tsx) ----
// It doesn't follow a drawn line. It chases a point that moves at an even speed: along the
// rest of the route, then round and round your pin until the answer arrives. Each frame it
// turns toward that point (never sharper than its tightest turn) and flies on, so its path is
// always a smooth curve, and it leans into its turns. Numbers to tune:
export const SPEED = 34 // map units a second (the plane is 54 long)
const LEAD = 36 // how far ahead of the plane the chased point starts
const STEER = 2.5 // how hard it turns toward the point: higher follows it more tightly
const TIGHTEST = 1.1 // its sharpest turn, in radians a second
const LEAN = 30 // how far it leans in a turn: a lean of LEAN ÷ the turn's radius, in radians
const MOST_LEAN = 0.6 // radians (34°)
const RADIUS = 56 // the circle it flies round your pin while it waits

// That circle touches the route's end, heading the same way, so the chased point slides from
// one onto the other without a jump. It turns left (counterclockwise on screen), so the
// circle's middle is RADIUS to the left of the route's last heading. Your pin ends up inside
// it, a little off the middle.
const END = along(1).heading
export const CIRCLE = {
  x: TO.x + RADIUS * Math.sin(END),
  y: TO.y - RADIUS * Math.cos(END),
  r: RADIUS,
}

// The route as 200 short straight pieces, with how far along each point is, so the chased
// point can move along it at an even speed (a curve's t doesn't move evenly)
const POINTS = Array.from({ length: 201 }, (_, i) => along(i / 200))
const DISTANCE = POINTS.reduce<number[]>((sums, point, i) => {
  const last = POINTS[i - 1]
  sums.push(i ? sums[i - 1] + Math.hypot(point.x - last.x, point.y - last.y) : 0)
  return sums
}, [])
const LENGTH = DISTANCE[200]
const SET_OFF = DISTANCE[Math.round(PARKED_AT * 200)] // how far along the route the 3D plane starts
// Where on the circle the route ends: its angle from the circle's middle
const CIRCLE_FROM = Math.atan2(TO.y - CIRCLE.y, TO.x - CIRCLE.x)

// The chased point, `time` seconds after the plane set off
function chased(time: number) {
  const distance = SET_OFF + LEAD + SPEED * time
  if (distance < LENGTH) {
    const i = DISTANCE.findIndex((d) => d > distance) // the piece it's on
    const a = POINTS[i - 1]
    const b = POINTS[i]
    const f = (distance - DISTANCE[i - 1]) / (DISTANCE[i] - DISTANCE[i - 1])
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f }
  }
  // Then round the circle, counterclockwise on screen (the angle going down, because y goes
  // down)
  const angle = CIRCLE_FROM - (distance - LENGTH) / CIRCLE.r
  return { x: CIRCLE.x + CIRCLE.r * Math.cos(angle), y: CIRCLE.y + CIRCLE.r * Math.sin(angle) }
}

// Where the plane is: x, y, the way it heads (radians, clockwise from →), how far it leans
// (radians: positive is a lean to the right), and the seconds since it set off
export type Flight = { x: number; y: number; heading: number; roll: number; time: number }

export function setOff(): Flight {
  return { x: PARKED.x, y: PARKED.y, heading: PARKED.heading, roll: 0, time: 0 }
}

// One frame of flying, `seconds` long. It changes `flight` in place (it's a ref's value).
export function fly(flight: Flight, seconds: number) {
  flight.time += seconds
  const target = chased(flight.time)
  // How far it would have to turn to face the point (between -π and π)
  const wanted = Math.atan2(target.y - flight.y, target.x - flight.x) - flight.heading
  const off = Math.atan2(Math.sin(wanted), Math.cos(wanted))
  const turn = clamp(off * STEER, -TIGHTEST, TIGHTEST) // radians a second
  flight.heading += turn * seconds
  flight.x += Math.cos(flight.heading) * SPEED * seconds
  flight.y += Math.sin(flight.heading) * SPEED * seconds
  // It leans into the turn (turn ÷ SPEED is 1 ÷ the turn's radius), easing into a new lean
  // over about a quarter of a second, so it never snaps
  const lean = clamp((turn / SPEED) * LEAN, -MOST_LEAN, MOST_LEAN)
  flight.roll += (lean - flight.roll) * (1 - Math.exp(-4 * seconds))
}

// ---- The landing (step 7c) ----
// When the answer arrives, the plane leaves its path and lands at your pin: one smooth curve
// (a cubic Bézier: a start, two pulls, an end) from where it is to the water at the pin's foot.
// It leaves the way it was heading, as fast as it was flying, slows to a stop as it arrives,
// and comes down on the way (room-scene.tsx turns `down` into height, so the shadow slides in
// under it).
const TOUCHDOWN = { x: 486, y: 170 } // on the water at your pin's foot, in its ripple

type Point = { x: number; y: number }
export type Landing = { a: Point; b: Point; c: Point; d: Point; duration: number; time: number }

export function landFrom(flight: Flight): Landing {
  const a = { x: flight.x, y: flight.y }
  const d = TOUCHDOWN
  // Farther away takes longer, but never long: the answer is already here (seconds)
  const duration = clamp(Math.hypot(d.x - a.x, d.y - a.y) / 90, 0.6, 1.3)
  // The first pull decides how it leaves: straight on, at its flying speed (a cubic curve sets
  // off at 3 × the first pull's distance per duration)
  const reach = (SPEED * duration) / 3
  const b = {
    x: a.x + Math.cos(flight.heading) * reach,
    y: a.y + Math.sin(flight.heading) * reach,
  }
  // The second pull sits just short of the end, on the line from the first: it arrives heading
  // that way
  const toward = Math.atan2(d.y - b.y, d.x - b.x)
  const c = { x: d.x - Math.cos(toward) * 4, y: d.y - Math.sin(toward) * 4 }
  return { a, b, c, d, duration, time: 0 }
}

// One frame of the landing: moves `flight` along the curve (in place, like fly), and says how
// far down it has come (0 at its usual height, 1 on the water) and whether it has landed
export function land(landing: Landing, flight: Flight, seconds: number) {
  landing.time = Math.min(landing.duration, landing.time + seconds)
  const u = landing.time / landing.duration // how much of its time has gone, 0 to 1
  // How far along the curve: as fast as it was flying at first, slowing to a stop at the end
  const t = u + u * u - u * u * u
  const s = 1 - t
  const { a, b, c, d } = landing
  const at = (p: number, q: number, r: number, w: number) =>
    s * s * s * p + 3 * s * s * t * q + 3 * s * t * t * r + t * t * t * w
  const slope = (p: number, q: number, r: number, w: number) =>
    s * s * (q - p) + 2 * s * t * (r - q) + t * t * (w - r)
  const x = at(a.x, b.x, c.x, d.x)
  const y = at(a.y, b.y, c.y, d.y)
  const heading = Math.atan2(slope(a.y, b.y, c.y, d.y), slope(a.x, b.x, c.x, d.x))

  // Down gently at first and at the end (a smoothstep), level by touchdown
  const down = u * u * (3 - 2 * u)
  // It leans into the curve like in flight (how much it turned for how far it went), less and
  // less as it comes down
  const moved = Math.hypot(x - flight.x, y - flight.y)
  const turned = heading - flight.heading
  const curve = moved > 0 ? Math.atan2(Math.sin(turned), Math.cos(turned)) / moved : 0
  const lean = clamp(curve * LEAN, -MOST_LEAN, MOST_LEAN) * (1 - down)
  flight.roll += (lean - flight.roll) * (1 - Math.exp(-8 * seconds))
  flight.x = x
  flight.y = y
  flight.heading = heading
  return { down, landed: u >= 1 }
}

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value))
