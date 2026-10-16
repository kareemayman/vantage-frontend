import type { ComponentProps } from "react"

// The globe in "Where we go" (design/HANDOFF.md asset 11), drawn flat until the real 3D
// globe arrives. Same colors in both themes: it always sits on the night sky.
// Flights curve in from the white pin (out east, over the Atlantic) to where each
// featured tour starts.

// Each tour's pin on this drawing, and the point its flight's curve bends toward.
// The first one starts lit, like the first row of the list next to it; pin-highlight.tsx
// moves the light to the row you point at.
const PINS = [
  { slug: "the-sea-explorer", x: 316, y: 352, bend: "440 340" }, // Miami
  { slug: "the-forest-hiker", x: 215, y: 196, bend: "420 90" }, // Banff
  { slug: "the-star-gazer", x: 246, y: 258, bend: "400 190" }, // Utah
]

// A flight's curve: from the white pin, bending toward `bend`, down to the tour's pin
const flight = (pin: (typeof PINS)[number]) => `M520 250Q${pin.bend} ${pin.x} ${pin.y}`

export function Globe(props: ComponentProps<"svg">) {
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
        {PINS.map((pin) => (
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
              d={flight(pin)}
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
        {PINS.map((pin) => (
          <path key={pin.slug} data-flight d={flight(pin)} mask={`url(#flight-${pin.slug})`} />
        ))}
      </g>

      {/* The pins, on top of the flights. data-slug pairs each one with its row; when
          it's on (data-on), it turns sun yellow, grows (r: the circle's radius) and hops,
          squashing at its base (origin-bottom transform-fill) like the suitcases. */}
      <g strokeWidth="4" className="stroke-navy-950">
        <circle cx="520" cy="250" r="12" className="fill-sand-50" />
        {PINS.map((pin, i) => (
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
          in the still picture it's parked a third of the way along the Banff flight,
          turned along it. The drawing inside is flipped to face left and centered on
          0,0, so the outer group moves and turns the plane by its middle. */}
      <g data-plane transform="translate(437 171) rotate(26)">
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
