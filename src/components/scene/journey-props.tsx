import type { ComponentProps } from "react"

// SVG stand-ins for the Journey cards' 3D props (design/HANDOFF.md assets 09, 10, 08):
// the folded map with its pin, the ticket with its stamp, the packed suitcase...
// Each one does a trick when the plane reaches its card (`reached:`, see globals.css):
// the pin drops, the stamp slams, the suitcase hops, the flag runs up its pole. On cards
// you haven't reached yet (`ahead:`), the trick's result isn't there yet.
// overflow="visible": tricks may move parts outside the drawing's box.
// Raw palette colors: physical objects look the same in both themes.

type SvgProps = ComponentProps<"svg">

export function FoldedMap(props: SvgProps) {
  return (
    <svg aria-hidden viewBox="0 0 180 130" overflow="visible" {...props}>
      <g strokeLinejoin="round" className="stroke-navy-950">
        <path
          d="M10 30L60 14L120 30L170 14L170 110L120 126L60 110L10 126Z"
          strokeWidth="4"
          className="fill-sand-200"
        />
        <path d="M60 14L120 30L120 126L60 110Z" strokeWidth="3" className="fill-sand-300" />
      </g>
      {/* the route, dashed, ending at the pin */}
      <path
        d="M24 90C50 70 80 96 110 64S150 60 160 44"
        fill="none"
        strokeWidth="3"
        strokeDasharray="2 8"
        strokeLinecap="round"
        className="stroke-navy-600"
      />
      {/* The pin. Trick: drops in and wobbles on its tip (origin-bottom) */}
      <g className="origin-bottom transform-fill ahead:opacity-0 motion-safe:reached:animate-pin-drop">
        <path
          d="M150 50C150 30 126 26 122 44C120 56 136 70 136 84C136 70 150 62 150 50Z"
          strokeWidth="4"
          strokeLinejoin="round"
          className="fill-sun-300 stroke-navy-950"
        />
        <circle cx="136" cy="46" r="5" className="fill-navy-950" />
      </g>
    </svg>
  )
}

export function Ticket(props: SvgProps) {
  return (
    <svg aria-hidden viewBox="0 0 200 120" overflow="visible" {...props}>
      <g transform="rotate(-6 100 62)">
        <path
          d="M14 22L186 22L186 50A12 12 0 0 0 186 74L186 102L14 102L14 74A12 12 0 0 0 14 50Z"
          strokeWidth="4"
          strokeLinejoin="round"
          className="fill-sun-300 stroke-navy-950"
        />
        {/* tear-off perforation, name line, details, barcode */}
        <path
          d="M136 30L136 94"
          strokeWidth="3"
          strokeDasharray="5 6"
          className="stroke-navy-950"
        />
        <rect x="30" y="38" width="80" height="10" rx="5" className="fill-navy-950" />
        <rect x="30" y="58" width="56" height="8" rx="4" className="fill-sun-400" />
        <rect x="30" y="74" width="66" height="8" rx="4" className="fill-sun-400" />
        <path
          d="M150 40L150 84M156 40L156 84M164 40L164 84M170 40L170 84"
          strokeWidth="3"
          className="stroke-navy-950"
        />
      </g>
      {/* The "booked" stamp. Trick: slams down */}
      <g className="origin-center transform-fill ahead:opacity-0 motion-safe:reached:animate-stamp">
        <circle
          cx="140"
          cy="96"
          r="20"
          strokeWidth="4"
          className="fill-lagoon-50 stroke-lagoon-700"
        />
        <path
          d="M131 96L138 103L150 89"
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-lagoon-700"
        />
      </g>
    </svg>
  )
}

// The guide's flag (stop 5): a waving flag with the Vantage sun dot, easy to follow
export function GuideFlag(props: SvgProps) {
  return (
    <svg aria-hidden viewBox="0 0 160 140" overflow="visible" {...props}>
      <g strokeLinejoin="round" className="stroke-navy-950">
        <rect
          x="38"
          y="12"
          width="9"
          height="122"
          rx="4.5"
          strokeWidth="3"
          className="fill-sand-400"
        />
        {/* The flag: down at the bottom of the pole until you arrive. Trick: runs up
            and flaps once, turning around the pole (origin-left) */}
        <g className="origin-left transform-fill ahead:translate-y-12.5 motion-safe:reached:animate-raise">
          <path
            d="M47 18C78 6 104 30 146 20L136 48L146 74C104 84 78 60 47 72Z"
            strokeWidth="4"
            className="fill-sky-300"
          />
          <circle cx="90" cy="45" r="10" strokeWidth="3.5" className="fill-sun-300" />
        </g>
        <circle cx="42.5" cy="10" r="7" strokeWidth="3" className="fill-sun-300" />
      </g>
    </svg>
  )
}

// A postcard home (stop 6): message squiggles, a stamp, a postmark, the address lines
export function Postcard(props: SvgProps) {
  return (
    <svg aria-hidden viewBox="0 0 200 130" overflow="visible" {...props}>
      <g transform="rotate(-5 100 66)">
        <rect
          x="14"
          y="14"
          width="172"
          height="104"
          rx="6"
          strokeWidth="4"
          className="fill-white stroke-navy-950"
        />
        <path
          d="M104 28L104 106"
          strokeWidth="2"
          strokeDasharray="4 5"
          className="stroke-navy-950"
        />
        {/* the message, in squiggles */}
        <path
          d="M26 44Q36 37 46 44T66 44T86 44M26 62Q36 55 46 62T66 62T90 62M26 80Q36 73 46 80T62 80"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          className="stroke-navy-600"
        />
        {/* stamp with a little sun, then a dashed postmark over its corner */}
        <rect
          x="146"
          y="24"
          width="30"
          height="36"
          rx="2"
          strokeWidth="3"
          className="fill-sun-300 stroke-navy-950"
        />
        <circle cx="161" cy="42" r="7" className="fill-coral-400" />
        {/* Trick: the postmark slams down, like the ticket's stamp */}
        <circle
          cx="140"
          cy="54"
          r="15"
          fill="none"
          strokeWidth="2.5"
          strokeDasharray="3 4"
          className="origin-center stroke-navy-600 transform-fill ahead:opacity-0 motion-safe:reached:animate-stamp"
        />
        <path
          d="M114 82L178 82M114 98L164 98"
          strokeWidth="3"
          strokeLinecap="round"
          className="stroke-navy-950"
        />
      </g>
    </svg>
  )
}

// The Journey's suitcase: packed and strapped (the hero's sun suitcase, travel-ready)
export function PackedSuitcase(props: SvgProps) {
  return (
    <svg aria-hidden viewBox="0 0 160 140" overflow="visible" {...props}>
      {/* Trick: a squash-and-stretch hop, squashing at its base (origin-bottom) */}
      <g className="origin-bottom transform-fill motion-safe:reached:animate-pack">
        <path
          d="M58 30L58 14Q58 6 66 6L94 6Q102 6 102 14L102 30"
          fill="none"
          strokeWidth="7"
          className="stroke-navy-950"
        />
        <g className="stroke-navy-950">
          <rect
            x="10"
            y="28"
            width="140"
            height="104"
            rx="18"
            strokeWidth="4"
            className="fill-sun-300"
          />
          <rect x="42" y="28" width="12" height="104" strokeWidth="3" className="fill-sun-400" />
          <rect x="106" y="28" width="12" height="104" strokeWidth="3" className="fill-sun-400" />
          <circle cx="80" cy="80" r="16" strokeWidth="3" className="fill-sky-300" />
        </g>
      </g>
    </svg>
  )
}
