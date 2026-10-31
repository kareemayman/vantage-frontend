import type { Rect } from "@/components/tours/flight"

// The air the plane pushes around as it flies past (step 4c). Everything on the route marked
// data-wind (the cards, the departure cloud, the count) sits on a spring: the plane shoves it
// away, it springs back and wobbles to a stop. The closer and faster the plane, the harder
// the shove, so a slow scroll is a breeze, a fast one a gust, and a parked plane nothing.
// The gulls sitting on some cards (data-flock) scatter when it gets close.
// Plain math and DOM writes, no three.js and no React. The scene calls blow() every frame.

// One thing that sways. x, y: px it's been pushed. turn: degrees. puff: how puffed up, about
// 0 to 1. v…: how fast each of those is changing, per second.
type Thing = {
  el: HTMLElement
  box: Rect // its spot on the route, in px from the route's corner. It doesn't move
  swell: number // how much bigger it gets fully puffed up: data-wind="0.14" is 14%
  x: number
  y: number
  turn: number
  puff: number
  vx: number
  vy: number
  vTurn: number
  vPuff: number
  moving: boolean
  gustAt: number | null // when its toy started to hop (data-gust), in ms
}

// Some gulls on a card. data-flying plays their whole trip in CSS: away, out of sight, and back
// to land (gull-x, gull-y and gull-look in globals.css).
type Flock = {
  el: HTMLElement
  box: Rect // where they sit: along the middle of the card's top edge
  timer: number // the clock for their trip while they're away; 0 while they're sitting
}

export type Wind = {
  things: Thing[]
  flocks: Flock[]
  // Where the plane was last frame, and how fast it's going (px per second)
  plane: { x: number; y: number; vx: number; vy: number } | null
}

// The plane this frame. reach: how far its wind gets, in px. top: where the route's top edge
// is on the screen right now
type Plane = { x: number; y: number; reach: number; top: number }

const STIFFNESS = 70 // how hard things spring back: higher is a quicker wobble
const DAMPING = 3.2 // how fast the wobble dies: lower wobbles for longer
const FULL_SPEED = 700 // px per second of plane at which the wind is at its strongest
const STILL = 2 // px per second: slower than this, it makes no wind. Its smoothed speed only
// ever shrinks toward 0, and things next to a parked plane would never come to rest
const PUSH = 1300 // how far it shoves things (px per second, per second)
const TWIST = 420 // how much it turns them (degrees per second, per second)
const BILLOW = 70 // how much it puffs them up
const SWELL = 0.04 // how much bigger a fully puffed thing gets, unless it says otherwise
const HOP_AT = 0.3 // how strong the wind has to be for a toy to hop (0 to 1)
const HOP_TIME = 1000 // ms: longer than any toy's hop (see PROPS in tour-card.tsx)
const SCARED_AT = 30 // px per second: slower than this, the plane doesn't scare the gulls
const FLOCK_SPREAD = 0.55 // radians between one gull's way out and the next one's
const TRIP_TIME = 10500 // ms: a gull's trip (10s in globals.css) plus the slowest one's late start

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

// How far a point is from a box (0 inside it)
const distance = (x: number, y: number, box: Rect) =>
  Math.hypot(x - clamp(x, box.left, box.right), y - clamp(y, box.top, box.bottom))

// What the spring does to something that's out of place: pulls it back and slows it down
const spring = (position: number, speed: number) => -STIFFNESS * position - DAMPING * speed

// What's on the route, found once its layout is known. `measure` gives a box in the route's
// px. A card's box is its <li>, which never moves, unlike the card inside it.
export function findWind(route: HTMLElement, measure: (el: Element) => Rect): Wind {
  const things = [...route.querySelectorAll<HTMLElement>("[data-wind]")].map((el) => ({
    el,
    box: measure(el.closest("li") ?? el),
    swell: Number(el.dataset.wind) || SWELL,
    x: 0,
    y: 0,
    turn: 0,
    puff: 0,
    vx: 0,
    vy: 0,
    vTurn: 0,
    vPuff: 0,
    moving: false,
    gustAt: null,
  }))
  const flocks = [...route.querySelectorAll<HTMLElement>("[data-flock]")].map((el) => {
    const card = measure(el.closest("li") ?? el)
    const width = card.right - card.left
    const box = {
      left: card.left + width * 0.2,
      right: card.right - width * 0.2,
      top: card.top - width * 0.15,
      bottom: card.top,
    }
    return { el, box, timer: 0 }
  })
  return { things, flocks, plane: null }
}

// Blows for one frame. Returns true while something's still moving, so the scene knows to ask
// for another frame.
export function blow(wind: Wind, { x, y, reach, top }: Plane, seconds: number) {
  if (seconds <= 0) return false

  // How fast it's going, from how far it moved, a little smoothed
  const last = wind.plane ?? { x, y, vx: 0, vy: 0 }
  const vx = last.vx + ((x - last.x) / seconds - last.vx) * 0.3
  const vy = last.vy + ((y - last.y) / seconds - last.vy) * 0.3
  wind.plane = { x, y, vx, vy }
  const speed = Math.hypot(vx, vy)
  const force = speed < STILL ? 0 : Math.sqrt(Math.min(1, speed / FULL_SPEED))
  const [goingX, goingY] = speed > 1 ? [vx / speed, vy / speed] : [0, 0]

  const now = performance.now()
  let anyMoving = false

  for (const thing of wind.things) {
    const { box } = thing
    // How close: 1 touching its box, 0 out of reach
    const close = Math.max(0, 1 - distance(x, y, box) / reach)
    const strength = close * close * force
    if (strength === 0 && !thing.moving) continue

    // Which way is away from the plane: -1 to 1 each way, fading to 0 when the plane is
    // right over its middle, so the push never flips suddenly
    const awayX = clamp((box.left + box.right - 2 * x) / (box.right - box.left), -1, 1)
    const awayY = clamp((box.top + box.bottom - 2 * y) / (box.bottom - box.top), -1, 1)
    // The air drags the near side along the way the plane is going, which turns it
    const spin = goingX * awayY - goingY * awayX

    // Shoved away and dragged along, while the spring pulls it back
    thing.vx +=
      (strength * PUSH * (awayX * 0.7 + goingX * 0.5) + spring(thing.x, thing.vx)) * seconds
    thing.vy +=
      (strength * PUSH * (awayY * 0.7 + goingY * 0.5) + spring(thing.y, thing.vy)) * seconds
    thing.vTurn += (strength * TWIST * spin + spring(thing.turn, thing.vTurn)) * seconds
    thing.vPuff += (strength * BILLOW + spring(thing.puff, thing.vPuff)) * seconds
    thing.x += thing.vx * seconds
    thing.y += thing.vy * seconds
    thing.turn += thing.vTurn * seconds
    thing.puff += thing.vPuff * seconds

    // Its toy hops: once per gust, and again after the wind has dropped
    if (thing.gustAt === null && strength > HOP_AT) {
      thing.gustAt = now
      thing.el.dataset.gust = ""
    } else if (thing.gustAt !== null && now - thing.gustAt > HOP_TIME && strength < HOP_AT / 2) {
      thing.gustAt = null
      delete thing.el.dataset.gust
    }

    const settled =
      strength === 0 &&
      thing.gustAt === null &&
      Math.abs(thing.x) + Math.abs(thing.y) < 0.1 &&
      Math.abs(thing.vx) + Math.abs(thing.vy) < 1 &&
      Math.abs(thing.turn) < 0.02 &&
      Math.abs(thing.vTurn) < 0.2 &&
      Math.abs(thing.puff) < 0.002

    if (settled) {
      rest(thing)
      continue
    }
    anyMoving = true
    const { style } = thing.el
    // Its own layer while it moves, so the browser only slides a finished picture around
    // instead of repainting the card, with its photo and shadow, every frame
    if (!thing.moving) style.willChange = "translate, rotate, scale"
    thing.moving = true
    style.translate = `${thing.x.toFixed(2)}px ${thing.y.toFixed(2)}px`
    style.rotate = `${thing.turn.toFixed(3)}deg`
    style.scale = (1 + thing.puff * thing.swell).toFixed(4)
  }

  // The gulls take off if it's moving and close, while you can see them. Once they've gone,
  // CSS flies them there and back, so nothing here has to keep running.
  if (speed > SCARED_AT) {
    for (const flock of wind.flocks) {
      const { box } = flock
      const seen = box.bottom + top > 0 && box.top + top < innerHeight
      if (!flock.timer && seen && distance(x, y, box) < reach) scatter(flock, x, y)
    }
  }
  return anyMoving
}

// Each gull gets its own way out: away from the plane and upward, fanned out and a little
// random, so it's never quite the same twice. --face turns it the way it's going.
function scatter(flock: Flock, x: number, y: number) {
  const { el, box } = flock
  const awayX = (box.left + box.right) / 2 - x
  const awayY = (box.top + box.bottom) / 2 - y
  const size = Math.hypot(awayX, awayY) || 1
  const way = Math.atan2(awayY / size - 0.7, awayX / size)
  const far = Math.max(innerWidth, innerHeight) * 0.6

  const gulls = [...el.querySelectorAll<HTMLElement>("[data-gull]")]
  gulls.forEach((gull, i) => {
    const angle = way + (i - (gulls.length - 1) / 2) * FLOCK_SPREAD + (Math.random() - 0.5) * 0.3
    const trip = far * (0.8 + Math.random() * 0.4)
    gull.style.setProperty("--flee-x", `${Math.round(Math.cos(angle) * trip)}px`)
    gull.style.setProperty("--flee-y", `${Math.round(Math.sin(angle) * trip)}px`)
    gull.style.setProperty("--face", Math.cos(angle) > 0 ? "-1" : "1")
  })
  el.dataset.flying = ""
  flock.timer = window.setTimeout(() => {
    delete el.dataset.flying
    flock.timer = 0
  }, TRIP_TIME)
}

// Back to how the server drew it
function rest(thing: Thing) {
  const { style, dataset } = thing.el
  style.willChange = style.translate = style.rotate = style.scale = ""
  delete dataset.gust
  thing.x = thing.y = thing.turn = thing.puff = 0
  thing.vx = thing.vy = thing.vTurn = thing.vPuff = 0
  thing.moving = false
  thing.gustAt = null
}

// Everything back to rest, right away: the plane is gone (reduced motion switched on, the
// page hidden), or the layout is about to be measured
export function calm(wind: Wind) {
  wind.things.forEach(rest)
  for (const flock of wind.flocks) {
    clearTimeout(flock.timer)
    flock.timer = 0
    delete flock.el.dataset.flying
  }
  wind.plane = null
}
