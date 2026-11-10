import type { ComponentProps } from "react"
import { spread } from "@/lib/spread"
import type { Tour } from "@/lib/tours"

// The globe in "Where we go" (design/HANDOFF.md asset 11), drawn flat until the real 3D
// globe arrives. Same colors in both themes: it always sits on the night sky.
// Flights curve in from the white pin (out east, over the Atlantic) to where each
// featured tour starts, placed from the tour's coordinates.

type Point = { x: number; y: number }

// The white pin, where every flight starts
const HOME = { x: 520, y: 250 }

// Where a place goes on this drawing, from its [longitude, latitude]. The land is a cartoon,
// not a real map, so this is a plain conversion, like °C to °F: Miami stays where the design
// drew it, and each degree east or north moves a pin by a set amount. These two amounts put
// every tour's start on the land, about where it really is (NYC and Malibu on their coasts,
// Yellowknife up north). North moves more because the cartoon's North America is taller than
// the real one. A place outside North America would miss the land (Europe lands in the
// Atlantic, Asia off the globe); the real 3D globe will handle the whole world.
const MIAMI = { lng: -80.19, lat: 25.77, x: 316, y: 352 }
const EAST = 2.85 // how far right a pin moves for each degree east
const NORTH = 5.5 // how far up a pin moves for each degree north

function place([lng, lat]: [number, number]) {
  // SVG's y grows downward, so going north takes away from it
  return { x: MIAMI.x + (lng - MIAMI.lng) * EAST, y: MIAMI.y - (lat - MIAMI.lat) * NORTH }
}

// How far apart two pins' middles must be. A lit pin is 32 across with its outline, the
// others 26, so this leaves a small gap (Las Vegas and Utah would otherwise overlap).
const PIN_ROOM = 38

// How much each flight bends, as a share of its length: north (up) when positive, south when
// negative. The flights fan out: the one heading farthest north bends up the most, the one
// heading farthest south bends down, so they don't cross, even when two tours start close
// together. These are the design's three bends, one per featured tour.
const FAN = [0.45, 0.23, -0.2]

// A point on a curve from a, bending toward c, to b: t is how far along (0 at a, 1 at b)
function along(a: Point, c: Point, b: Point, t: number) {
  return {
    x: (1 - t) ** 2 * a.x + 2 * (1 - t) * t * c.x + t ** 2 * b.x,
    y: (1 - t) ** 2 * a.y + 2 * (1 - t) * t * c.y + t ** 2 * b.y,
  }
}

// Each tour's pin and its flight. Pins that would touch are pushed apart first. A flight is a
// curve from the white pin that bends toward a point 40% of the way along (so the plane climbs
// soon after takeoff, then glides down to land, like the design's), moved off to the side by
// its share of FAN.
function plan(tours: Tour[]) {
  const pins = tours.map((tour) => ({ slug: tour.slug, ...place(tour.startLocation.coordinates) }))
  spread(pins, PIN_ROOM)

  // Which way each flight heads from the white pin, as an angle: below 0 is north of straight
  // west, above 0 is south of it. Sorted, northernmost first: the order of the fan.
  const heading = (pin: Point) => Math.atan2(pin.y - HOME.y, HOME.x - pin.x)
  const fan = [...pins].sort((a, b) => heading(a) - heading(b))

  return pins.map((pin) => {
    const bend = FAN[fan.indexOf(pin)]
    // The way from the white pin to this one. (-dy, dx) is that way turned a quarter turn to
    // the right, which points north for a flight heading west.
    const [dx, dy] = [pin.x - HOME.x, pin.y - HOME.y]
    const bendAt = { x: HOME.x + dx * 0.4 - dy * bend, y: HOME.y + dy * 0.4 + dx * bend }
    return {
      ...pin,
      bendAt,
      flight: `M${HOME.x} ${HOME.y}Q${bendAt.x} ${bendAt.y} ${pin.x} ${pin.y}`,
    }
  })
}

// Where the plane waits in the still picture: a third of the way along a flight, turned the way
// the flight goes there (from a point just before to a point just after). Math.atan2 measures
// an angle from east, and the drawing faces west, so it measures the way back instead.
function parked(pin: ReturnType<typeof plan>[number]) {
  const [before, here, after] = [0.32, 1 / 3, 0.34].map((t) => along(HOME, pin.bendAt, pin, t))
  const turn = (Math.atan2(before.y - after.y, before.x - after.x) * 180) / Math.PI
  return `translate(${here.x} ${here.y}) rotate(${turn})`
}

export function Globe({ tours, ...props }: { tours: Tour[] } & ComponentProps<"svg">) {
  const pins = plan(tours)

  return (
    <svg aria-hidden viewBox="0 0 640 640" {...props}>
      {/* The sea, with lines of latitude and longitude */}
      <circle cx="320" cy="320" r="300" strokeWidth="6" className="fill-sky-300 stroke-sky-100" />
      <g fill="none" strokeWidth="2" className="stroke-white opacity-35">
        <ellipse cx="320" cy="320" rx="300" ry="110" />
        <ellipse cx="320" cy="320" rx="300" ry="220" />
        <ellipse cx="320" cy="320" rx="110" ry="300" />
        <ellipse cx="320" cy="320" rx="220" ry="300" />
      </g>
      {/* Land: North America, Florida, Greenland, then South America */}
      <g strokeWidth="4" strokeLinejoin="round" className="stroke-navy-950">
        <path
          d="M150 170C190 120 280 110 330 140C370 160 380 200 350 230C330 250 340 280 320 300C300 330 300 360 280 370C260 340 220 330 200 300C170 280 130 250 140 210Z"
          className="fill-sand-200"
        />
        <path
          d="M310 330C318 345 322 360 316 372C306 360 302 344 310 330Z"
          className="fill-sand-200"
        />
        <path
          d="M360 110C390 96 420 104 414 128C404 146 372 140 360 110Z"
          className="fill-sand-200"
        />
        <path
          d="M330 420C370 410 400 440 392 490C384 540 350 580 330 600C320 560 300 520 306 470C308 446 312 428 330 420Z"
          className="fill-sand-300"
        />
      </g>
      {/* A crescent of shade along the bottom edge */}
      <path
        d="M560 470A300 300 0 0 1 170 580A320 320 0 0 0 560 470Z"
        className="fill-navy-950 opacity-22"
      />

      {/* The flights: one dashed line per pin, each seen through its own stencil (a
          mask). The stencil is a solid line along the same curve, and the dashes only
          show where it's drawn. Here it's drawn all the way; globe-flights.tsx draws it
          in behind the plane. pathLength={1}: the stencil's length counts as 1. */}
      <defs>
        {pins.map((pin) => (
          <mask
            key={pin.slug}
            id={`flight-${pin.slug}`}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="640"
            height="640"
          >
            <path
              data-trail
              d={pin.flight}
              pathLength={1}
              fill="none"
              strokeWidth="14"
              className="stroke-white"
            />
          </mask>
        ))}
      </defs>
      <g
        fill="none"
        strokeWidth="4"
        strokeDasharray="4 10"
        strokeLinecap="round"
        className="stroke-sun-300"
      >
        {pins.map((pin) => (
          <path key={pin.slug} data-flight d={pin.flight} mask={`url(#flight-${pin.slug})`} />
        ))}
      </g>

      {/* The pins, on top of the flights. data-slug pairs each one with its row; when
          it's on (data-on), it turns sun yellow, grows (r: the circle's radius) and hops,
          squashing at its base (origin-bottom transform-fill) like the suitcases. The
          first one starts on, like the first row of the list next to it;
          pin-highlight.tsx moves the light to the row you point at. */}
      <g strokeWidth="4" className="stroke-navy-950">
        <circle cx={HOME.x} cy={HOME.y} r="12" className="fill-sand-50" />
        {pins.map((pin, i) => (
          <circle
            key={pin.slug}
            data-slug={pin.slug}
            data-on={i === 0 ? "" : undefined}
            cx={pin.x}
            cy={pin.y}
            r="11"
            className="origin-bottom fill-sky-300 transform-fill data-on:fill-sun-300 data-on:[r:14px] motion-safe:data-on:animate-hop"
          />
        ))}
      </g>

      {/* A tiny plane heading west, the way the flights go. globe-flights.tsx flies it;
          in the still picture it waits on the first flight, the lit tour's (parked). The
          drawing inside is flipped to face left and centered on 0,0, so the outer group
          moves and turns the plane by its middle. */}
      <g data-plane transform={parked(pins[0])}>
        <g
          transform="scale(-0.32 0.32) translate(-121 -65)"
          strokeWidth="10"
          strokeLinejoin="round"
          className="stroke-navy-950"
        >
          <path d="M38 58L22 18Q20 12 28 12L48 12Q54 12 58 20L74 52Z" className="fill-sky-300" />
          <path
            d="M30 60Q30 44 52 44L170 44Q214 44 222 66Q214 86 172 86L54 86Q30 86 30 70Z"
            className="fill-white"
          />
          <path
            d="M100 70L142 70L120 112Q116 118 108 118L98 118Q90 118 93 111Z"
            className="fill-navy-600"
          />
        </g>
      </g>
    </svg>
  )
}
