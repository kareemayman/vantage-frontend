// The plane's flight down the tours page (step 4c): its path, with a trick on each hop, and
// how high it flies, which way it points and how it leans at every point of it. Worked out
// once from where the stops landed (tour-route.tsx measures them), then read by the scroll.
// Plain math, no three.js and no React: the dotted trail (tour-route.tsx) and the 3D plane
// (src/components/three/flight-scene.tsx) both read it.

export type Point = { x: number; y: number }
export type Rect = { left: number; top: number; right: number; bottom: number }

// What the flight is planned from, in px from the route's top-left corner (y goes down)
export type Layout = {
  start: Point | null // the departure cloud (md+). Phones start at the top of the gutter
  stops: Point[] // the dot beside each card
  cards: Rect[] // each card's spot in the grid (its <li>)
  end: Rect // the count at the end, "That's all 9 tours"
  planeLength: number // px, nose to tail
  arrival: Point // where it comes from when the page loads: just off the screen's right edge
}

// A stretch of flying, as one sample every STEP px of trail (a table to read from)
export type Track = {
  count: number // how many samples
  x: Float32Array // where it is over the page (px from the route's corner, y down)
  y: Float32Array
  z: Float32Array // how high it flies, in px: it grows with height, and its shadow falls farther
  heading: Float32Array // the way its nose points, in radians, counterclockwise from →
  pitch: Float32Array // nose up (+) or down
  roll: Float32Array // its lean around its own nose-to-tail line
  length: Float32Array // px of trail behind it
  hopEnds: number[] // the sample where each hop ends
}

// The whole flight down the page
export type Flight = Track & {
  keys: { y: number; at: number }[] // it's at sample `at` when the route's `y` is on its line
  dots: string[] // the trail: SVG path data for each dot, in the order it flies past them
  planeLength: number
  highest: number // the most it climbs, in px
  entrance: Track // how it arrives when the page loads
}

// Where the plane is at one moment (see poseAt)
export type Pose = {
  x: number
  y: number
  z: number
  heading: number
  pitch: number
  roll: number
  dots: number // how many of the trail's dots are behind it
}

const STEP = 4 // px of trail between samples
const DOT_EVERY = 17 // px of trail from one dot to the next: a 3px dash, then a 14px gap
const TAKEOFF = 150 // px of scrolling the takeoff gets, at least (see progressNow)
const LAST_HOP = 100 // px of scrolling the landing gets, at least (see progressAt)

// How high it flies (px above the page): low over each stop, higher in between, and much
// higher on a climb (bigger numbers make it bigger: see growth)
const LOW = 50
const CRUISE = 200
const HIGH = 650

// The tricks between stops, in this order, then again from the top
type Trick = "swoop" | "loop" | "roll" | "climb" | "sway"
const TRICKS: Trick[] = ["swoop", "loop", "climb", "roll", "swoop", "sway", "climb", "loop"]

// The plane's size on screen: a tenth of the window's width, from 76px (phones) to 150px
export const planeLength = (windowWidth: number) => Math.min(150, Math.max(76, windowWidth / 10))

// How much bigger it looks at a height: there's no perspective, so height shows as size
export const growth = (z: number) => 1 + z / 450

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)
// An angle brought into -π..π: the short way around
const wrap = (angle: number) => Math.atan2(Math.sin(angle), Math.cos(angle))
// 0 to 1 with a gentle start and end (flat before 0 and after 1)
const ease = (t: number) => {
  const c = clamp(t, 0, 1)
  return c * c * c * (c * (6 * c - 15) + 10)
}

// A cubic Bézier curve (like SVG's "C"): its start, two handles, and its end
type Curve = [Point, Point, Point, Point]

function pointOn([a, b, c, d]: Curve, t: number): Point {
  const u = 1 - t
  const [wa, wb, wc, wd] = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t]
  return {
    x: wa * a.x + wb * b.x + wc * c.x + wd * d.x,
    y: wa * a.y + wb * b.y + wc * c.y + wd * d.y,
  }
}

// From a to b, leaving and arriving heading straight down: an S when they're side by side
function swing(a: Point, b: Point): Curve {
  const half = (b.y - a.y) / 2
  return [a, { x: a.x, y: a.y + half }, { x: b.x, y: b.y - half }, b]
}

// A loop-the-loop seen from above: a full circle of radius r, starting and ending at p,
// heading down there. `side`: which side of p the circle is on (1: right, -1: left).
// Four quarter circles; 0.5523 × r is how far a quarter circle's handles reach.
function circle(p: Point, r: number, side: number): Curve[] {
  const h = r * 0.5523
  const bottom = { x: p.x + r, y: p.y + r }
  const far = { x: p.x + 2 * r, y: p.y }
  const top = { x: p.x + r, y: p.y - r }
  const quarters: Curve[] = [
    [p, { x: p.x, y: p.y + h }, { x: bottom.x - h, y: bottom.y }, bottom],
    [bottom, { x: bottom.x + h, y: bottom.y }, { x: far.x, y: far.y + h }, far],
    [far, { x: far.x, y: far.y - h }, { x: top.x + h, y: top.y }, top],
    [top, { x: top.x - h, y: top.y }, { x: p.x, y: p.y - h }, p],
  ]
  // Worked out on the right; on the left it's the mirror image
  if (side > 0) return quarters
  return quarters.map((curve) => curve.map(({ x, y }) => ({ x: 2 * p.x - x, y })) as Curve)
}

// One hop of the flight: its path, its height at the start, halfway and the end, and its trick
type Hop = {
  path: Curve[]
  from: number
  peak: number
  to: number
  roll?: number // full turns around its nose-to-tail line: a barrel roll (-1 or 1)
  sway?: number // px it drifts to each side, once
}

export function planFlight(layout: Layout): Flight | null {
  const { start, stops, cards, end, planeLength, arrival } = layout
  const first = stops[0]
  const last = stops.at(-1)
  if (!first || !last) return null
  const wide = start !== null // md+: two columns, with a corridor between them

  // The tricks' sizes and sides look random, but come from a fixed recipe (like the cards'
  // clouds), so the flight is the same on every visit and scrolling back rewinds it
  let seed = 2027
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 2 ** 32
  }

  // Takeoff: from the cloud, sideways toward the first card, then down into its stop.
  // Phones: straight down the gutter.
  const origin = start ?? { x: first.x, y: 0 }
  const takeoff: Curve = start
    ? [
        start,
        { x: start.x + (first.x - start.x) * 0.7, y: start.y },
        { x: first.x, y: first.y - (first.y - start.y) * 0.7 },
        first,
      ]
    : swing(origin, first)
  const hops: Hop[] = [{ path: [takeoff], from: 0, peak: wide ? 240 : 140, to: LOW }]

  for (let i = 1; i < stops.length; i++) {
    const [a, b] = [stops[i - 1], stops[i]]
    const [card, next] = [cards[i - 1], cards[i]]
    const size = 0.85 + random() * 0.3
    const trick = TRICKS[(i - 1) % TRICKS.length]

    if (trick === "swoop") {
      // Out over the lower half of the card it just passed, then back to the next stop
      const side = Math.sign((card.left + card.right) / 2 - a.x)
      const reach = (wide ? Math.min(190, (card.right - card.left) * 0.4) : 50) * size
      const over = { x: a.x + side * reach, y: a.y + (b.y - a.y) * 0.45 }
      hops.push({
        path: [swing(a, over), swing(over, b)],
        from: LOW,
        peak: CRUISE * size,
        to: LOW,
      })
    } else if (trick === "loop") {
      // md+: halfway, the circle centered in the corridor (so it isn't hidden under a
      // card), going around either way. Phones: in the gap between the two cards, to the
      // right (the gutter is on the screen's left edge).
      const leftFirst = card.right < next.left
      const corridor = leftFirst ? next.left - card.right : card.left - next.right
      const center = leftFirst ? (card.right + next.left) / 2 : (next.right + card.left) / 2
      const side = wide && random() < 0.5 ? -1 : 1
      const r = wide
        ? clamp(corridor * 0.42, 40, 75) * size
        : Math.min(28, (next.top - card.bottom) / 3)
      const p = wide
        ? { x: center - side * r, y: (a.y + b.y) / 2 }
        : { x: a.x, y: (card.bottom + next.top) / 2 }
      hops.push({
        path: [swing(a, p), ...circle(p, r, side), swing(p, b)],
        from: LOW,
        peak: CRUISE * size,
        to: LOW,
      })
    } else if (trick === "roll") {
      const roll = random() < 0.5 ? -1 : 1
      hops.push({ path: [swing(a, b)], from: LOW, peak: CRUISE * 1.4, to: LOW, roll })
    } else if (trick === "climb") {
      hops.push({ path: [swing(a, b)], from: LOW, peak: (wide ? HIGH : 300) * size, to: LOW })
    } else {
      const sway = (wide ? 45 : 14) * size
      hops.push({ path: [swing(a, b)], from: LOW, peak: CRUISE * size, to: LOW, sway })
    }
  }

  // Landing: down to the count, nose first, stopping short of it so it doesn't cover the
  // words
  const landing = {
    x: clamp(last.x, end.left + 20, end.right - 20),
    y: end.top - planeLength * 0.6,
  }
  hops.push({ path: [swing(last, landing)], from: LOW, peak: 110, to: 0 })

  // The entrance, when the page loads: from off the screen's right edge, coming down to
  // the start and arriving the way the takeoff leaves, so there's no jump between them
  const across = arrival.x - origin.x
  const inbound: Curve = start
    ? [
        arrival,
        { x: arrival.x - across * 0.45, y: arrival.y },
        { x: origin.x + across * 0.35, y: origin.y },
        origin,
      ]
    : [
        arrival,
        { x: origin.x + across * 0.35, y: arrival.y },
        { x: origin.x, y: origin.y - 80 },
        origin,
      ]
  const height = wide ? 260 : 150

  const track = sample(hops)
  return {
    ...track,
    // It reaches the end of each hop when that spot's y gets to its line across the
    // screen: every stop, then the count's top edge
    keys: [...stops.map((stop) => stop.y), end.top].map((y, i) => ({ y, at: track.hopEnds[i] })),
    dots: dotsAlong(track),
    planeLength,
    highest: Math.max(...track.z),
    entrance: sample([{ path: [inbound], from: height, peak: height / 2, to: 0 }]),
  }
}

// Turns hops into a table of samples
function sample(hops: Hop[]): Track {
  const xs: number[] = []
  const ys: number[] = []
  const zs: number[] = []
  const spins: number[] = [] // the barrel rolls' extra turning
  const hopEnds: number[] = []
  let spun = 0

  hops.forEach((hop, h) => {
    // 1. Trace the hop's curves finely, adding up its length as it goes
    const dense: Point[] = []
    const along: number[] = []
    for (const curve of hop.path) {
      for (let i = dense.length ? 1 : 0; i <= 64; i++) {
        const point = pointOn(curve, i / 64)
        const before = dense.at(-1)
        along.push(before ? along.at(-1)! + Math.hypot(point.x - before.x, point.y - before.y) : 0)
        dense.push(point)
      }
    }

    // 2. Pick a point every STEP px along it
    const total = along.at(-1)!
    const n = Math.max(1, Math.round(total / STEP))
    const points: Point[] = []
    for (let k = 0, j = 0; k <= n; k++) {
      const target = (k / n) * total
      while (j < dense.length - 2 && along[j + 1] < target) j++
      const t = (target - along[j]) / (along[j + 1] - along[j] || 1)
      points.push({
        x: dense[j].x + (dense[j + 1].x - dense[j].x) * t,
        y: dense[j].y + (dense[j + 1].y - dense[j].y) * t,
      })
    }

    // 3. The sway, the height and the barrel roll at each point (f: how far along the
    // hop, 0 to 1). A hop's first point is the last one's end, so it's skipped.
    points.forEach((point, k) => {
      if (h > 0 && k === 0) return
      const f = k / n
      let { x, y } = point
      if (hop.sway) {
        // Across the way it's going: out to one side and over to the other, once
        const before = points[Math.max(0, k - 1)]
        const after = points[Math.min(n, k + 1)]
        const [dx, dy] = [after.x - before.x, after.y - before.y]
        const d = Math.hypot(dx, dy) || 1
        const push = hop.sway * Math.sin(f * Math.PI * 2) * Math.sin(f * Math.PI)
        x += (-dy / d) * push
        y += (dx / d) * push
      }
      xs.push(x)
      ys.push(y)
      zs.push(
        hop.from +
          (hop.to - hop.from) * f +
          (hop.peak - (hop.from + hop.to) / 2) * Math.sin(f * Math.PI),
      )
      spins.push(spun + (hop.roll ?? 0) * 2 * Math.PI * ease((f - 0.2) / 0.6))
    })
    spun += (hop.roll ?? 0) * 2 * Math.PI
    hopEnds.push(xs.length - 1)
  })

  const count = xs.length
  const [x, y, z] = [Float32Array.from(xs), Float32Array.from(ys), new Float32Array(count)]
  const [heading, pitch, roll, length] = Array.from({ length: 4 }, () => new Float32Array(count))

  // The trail's length so far, and the way the nose points (from the samples on each side).
  // The page's y goes down but a heading's goes up, hence -dy. Unwrapped: each heading is
  // the one before plus the short way around, so a loop's goes on to 2π instead of jumping.
  for (let i = 0; i < count; i++) {
    const [a, b] = [Math.max(0, i - 1), Math.min(count - 1, i + 1)]
    length[i] = i ? length[i - 1] + Math.hypot(xs[i] - xs[i - 1], ys[i] - ys[i - 1]) : 0
    const raw = Math.atan2(-(ys[b] - ys[a]), xs[b] - xs[a])
    heading[i] = i ? heading[i - 1] + wrap(raw - heading[i - 1]) : raw
  }

  for (let i = 0; i < count; i++) {
    // How fast it turns and climbs here, averaged over ~65px each way, so the lean eases in
    const [a, b] = [Math.max(0, i - 16), Math.min(count - 1, i + 16)]
    const distance = length[b] - length[a] || 1
    const turn = (heading[b] - heading[a]) / distance // radians per px
    const climb = (zs[b] - zs[a]) / distance
    // It leans into its turns, up to 66°: a left turn (the heading going up) is a lean to
    // the left, which is a negative roll. Plus a little turbulence: slow, small wobbles in
    // the lean and the height. All of it fades out near the ground (`lift`), so it sits
    // level on the cloud and at the end, and its nose comes up as it takes off. The barrel
    // rolls only happen up high anyway.
    const lift = Math.min(1, zs[i] / 60)
    roll[i] = (clamp(-turn * 75, -1.15, 1.15) + 0.05 * Math.sin(length[i] / 40)) * lift + spins[i]
    pitch[i] = clamp(Math.atan(climb * 0.6), -0.45, 0.45) * lift
    z[i] = zs[i] + Math.min(1, zs[i] / 100) * 6 * Math.sin(length[i] / 53)
  }

  return { count, x, y, z, heading, pitch, roll, length, hopEnds }
}

// The trail's dots, the same look as the Journey's route: a 3px dash every DOT_EVERY px.
// Each one is its own bit of path data, so the page can show as many as the plane has
// passed. `at` walks along the samples, so it only ever moves forward.
function dotsAlong({ count, x, y, length }: Track) {
  let walker = 0
  const at = (distance: number) => {
    while (walker < count - 2 && length[walker + 1] < distance) walker++
    const t = (distance - length[walker]) / (length[walker + 1] - length[walker] || 1)
    const dotX = x[walker] + (x[walker + 1] - x[walker]) * t
    const dotY = y[walker] + (y[walker + 1] - y[walker]) * t
    return `${dotX.toFixed(1)} ${dotY.toFixed(1)}`
  }
  const total = length[count - 1]
  const dots: string[] = []
  for (let d = 0; d < total; d += DOT_EVERY) dots.push(`M${at(d)}L${at(Math.min(d + 3, total))}`)
  return dots
}

// Which sample the plane is at when the route's `y` is on its line across the screen. It
// passes each stop as that stop reaches the line, slowing down a little around it (half
// steady speed, half sine ease). `first`: where the takeoff starts, the route's y on the
// line when the page is scrolled to the top. `landBy`: the y by which it has landed, which
// can be before the count itself reaches the line (it always gets LAST_HOP px of scrolling).
function progressAt({ keys }: Flight, y: number, first: number, landBy: number) {
  if (y <= first) return 0
  let from = first
  let fromAt = 0
  for (const [i, key] of keys.entries()) {
    const keyY = i === keys.length - 1 ? Math.max(Math.min(key.y, landBy), from + LAST_HOP) : key.y
    if (y < keyY) {
      const f = (y - from) / (keyY - from)
      const eased = 0.5 * f + 0.25 * (1 - Math.cos(Math.PI * f))
      return fromAt + eased * (key.at - fromAt)
    }
    from = keyY
    fromAt = key.at
  }
  return fromAt
}

// Where the route is on the page (not on the screen). tour-route.tsx keeps it up to date,
// so scrolling never has to measure anything: measuring right after something changed
// makes the browser redo its layout first. below: px from the route's bottom to the end of
// the sky (the sea and the shore).
export type Place = { left: number; top: number; height: number; below: number }

// The sample the scroll asks for right now (the one function here that reads the window).
// The plane follows a line across the screen: the middle, or higher on a tall screen,
// where the first stop would already be above the middle when the page loads and the plane
// would have left before you scroll. It takes off as soon as the page scrolls, with at
// least TAKEOFF px of scrolling for it (a short way down, but a long way across). It lands
// as the end of the sky reaches the bottom of the screen, so the last thing you see is the
// plane over the setting sun, with the whole sunset around it (the sun's sums in globals.css
// finish at that same scroll position).
export function progressNow(flight: Flight, place: Place) {
  const line = Math.min(innerHeight / 2, place.top + flight.keys[0].y - TAKEOFF)
  const first = line - place.top // the route's y on the line, scrolled to the top
  const landBy = line + place.height + place.below - innerHeight
  return progressAt(flight, first + scrollY, first, landBy)
}

// The plane at a (fractional) sample: blended between the two samples around it
export function poseAt(track: Track, at: number): Pose {
  const i = Math.min(Math.floor(at), track.count - 2)
  const t = at - i
  const mix = (values: Float32Array) => values[i] + (values[i + 1] - values[i]) * t
  return {
    x: mix(track.x),
    y: mix(track.y),
    z: mix(track.z),
    heading: mix(track.heading),
    pitch: mix(track.pitch),
    roll: mix(track.roll),
    dots: Math.floor(mix(track.length) / DOT_EVERY) + 1,
  }
}
