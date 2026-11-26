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

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value))
