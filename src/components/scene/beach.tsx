import type { ComponentProps } from "react"

// SVG stand-ins for the hero's 3D beach toys (design/HANDOFF.md asset list:
// 04 beach ball, 07 palm, 08 suitcases). three.js versions replace them later;
// these stay as the reduced-motion / low-power fallback. Raw palette colors:
// physical objects look the same in both themes.

type SvgProps = ComponentProps<"svg">

// Palm tree. Its fronds rustle around the top of the trunk.
export function Palm(props: SvgProps) {
  return (
    // overflow-visible: rustling fronds may poke past the edges of the drawing
    <svg aria-hidden viewBox="0 0 220 360" overflow="visible" {...props}>
      <path
        d="M108 360C106 262 116 172 140 100L156 104C138 172 132 262 134 360Z"
        strokeWidth="4"
        strokeLinejoin="round"
        className="fill-sand-400 stroke-navy-950"
      />
      <path
        d="M112 300L132 296M114 240L134 236M120 180L140 178M130 130L148 130"
        strokeWidth="3"
        strokeLinecap="round"
        className="stroke-navy-950"
      />
      {/* origin: the top of the trunk (148, 100), where the fronds meet */}
      <g
        strokeWidth="4"
        strokeLinejoin="round"
        className="origin-[148px_100px] fill-lagoon-700 stroke-navy-950 motion-safe:animate-rustle"
      >
        <path d="M148 100C110 60 60 60 20 96C60 82 100 88 148 100Z" />
        <path d="M148 100C130 50 100 20 60 14C100 40 120 66 148 100Z" />
        <path d="M148 100C160 50 190 30 214 30C196 52 176 76 148 100Z" />
        <path d="M148 100C190 80 214 100 218 140C196 116 176 106 148 100Z" />
        <path d="M148 100C110 110 84 140 80 176C100 146 122 120 148 100Z" />
        <circle cx="140" cy="112" r="9" strokeWidth="3" className="fill-sand-400" />
        <circle cx="157" cy="114" r="9" strokeWidth="3" className="fill-sand-400" />
      </g>
    </svg>
  )
}

// A suitcase: sky blue with straps, or sun yellow with a check mark
export function Suitcase({ color, ...props }: SvgProps & { color: "sky" | "sun" }) {
  return (
    <svg aria-hidden viewBox="0 0 160 140" {...props}>
      <path
        d="M58 30L58 14Q58 6 66 6L94 6Q102 6 102 14L102 30"
        fill="none"
        strokeWidth="7"
        className="stroke-navy-950"
      />
      <rect
        x="10"
        y="28"
        width="140"
        height="104"
        rx="18"
        strokeWidth="4"
        className={`stroke-navy-950 ${color === "sky" ? "fill-sky-300" : "fill-sun-300"}`}
      />
      {color === "sky" ? (
        <g strokeWidth="3" className="fill-navy-600 stroke-navy-950">
          <rect x="42" y="28" width="12" height="104" />
          <rect x="106" y="28" width="12" height="104" />
        </g>
      ) : (
        <>
          <circle cx="80" cy="74" r="18" strokeWidth="3" className="fill-white stroke-navy-950" />
          <path
            d="M72 74L78 80L90 68"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-lagoon-700"
          />
        </>
      )}
    </svg>
  )
}

// The footer's hidden crab doodle (asset 15, an easter egg): a dome, legs, two eyes.
// Theme-aware (the crab token is softer by night).
export function Crab(props: SvgProps) {
  return (
    <svg aria-hidden viewBox="0 0 42 30" {...props}>
      <path
        d="M10 20Q21 6 32 20Z M6 12L10 18M36 12L32 18M8 24L4 28M34 24L38 28M16 22L14 28M26 22L28 28"
        fill="none"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-crab"
      />
      <circle cx="17" cy="11" r="1.8" className="fill-crab" />
      <circle cx="25" cy="11" r="1.8" className="fill-crab" />
    </svg>
  )
}

// Beach ball. The colored panels rock gently; the shading and shine stay put,
// so the light keeps coming from the top-left while the ball rolls.
export function BeachBall(props: SvgProps) {
  return (
    <svg aria-hidden viewBox="0 0 120 120" {...props}>
      <g className="origin-center transform-fill motion-safe:animate-rock">
        {/* Tilted like it landed that way */}
        <g transform="rotate(-14 60 60)">
          <path d="M60 60L110 60A50 50 0 0 1 85 103.3Z" className="fill-sun-300" />
          <path d="M60 60L85 103.3A50 50 0 0 1 35 103.3Z" className="fill-white" />
          <path d="M60 60L35 103.3A50 50 0 0 1 10 60Z" className="fill-sky-300" />
          <path d="M60 60L10 60A50 50 0 0 1 35 16.7Z" className="fill-white" />
          <path d="M60 60L35 16.7A50 50 0 0 1 85 16.7Z" className="fill-navy-600" />
          <path d="M60 60L85 16.7A50 50 0 0 1 110 60Z" className="fill-white" />
          <path
            d="M60 60L110 60M60 60L85 103.3M60 60L35 103.3M60 60L10 60M60 60L35 16.7M60 60L85 16.7"
            strokeWidth="2.5"
            className="stroke-navy-950"
          />
        </g>
      </g>
      <path
        d="M106 76A50 50 0 0 1 76 106A58 58 0 0 0 106 76Z"
        opacity="0.18"
        className="fill-navy-950"
      />
      <ellipse
        cx="38"
        cy="36"
        rx="12"
        ry="6"
        opacity="0.75"
        transform="rotate(-40 38 36)"
        className="fill-white"
      />
      <circle cx="60" cy="60" r="8" strokeWidth="3" className="fill-white stroke-navy-950" />
      <circle cx="60" cy="60" r="50" fill="none" strokeWidth="4" className="stroke-navy-950" />
    </svg>
  )
}
