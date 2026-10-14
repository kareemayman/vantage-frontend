import type { ComponentProps } from "react"

// Placeholder pictures for the tour tags (design/HANDOFF.md), until the tours get real
// photos (backend checklist item 1). Drawn at 360×240, the same 3:2 shape as the picture
// panel. The sky and sea follow the theme (scene tokens); objects keep raw palette colors.
// "slice": always fill the panel (like object-cover), even if it's a hair off 3:2.

type SvgProps = ComponentProps<"svg">

// The Sea Explorer: a sailboat, the sun and two seagulls
export function SeaScene(props: SvgProps) {
  return (
    <svg aria-hidden viewBox="0 0 360 240" preserveAspectRatio="xMidYMid slice" {...props}>
      <rect width="360" height="240" className="fill-scene-sky-2" />
      <rect y="140" width="360" height="100" className="fill-scene-sea" />
      <circle cx="290" cy="58" r="26.5" strokeWidth="3" className="fill-sun-300 stroke-navy-950" />
      <path
        d="M44 56Q52 46 60 56Q68 46 76 56M74 66Q80 58 86 66Q92 58 98 66"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        className="stroke-foreground"
      />
      <g strokeWidth="4" strokeLinejoin="round" className="stroke-navy-950">
        <path d="M180 76L180 150L130 150Z" className="fill-white" />
        <path d="M186 90L186 150L228 150Z" className="fill-sun-300" />
        <path d="M120 156L240 156L224 180L136 180Z" className="fill-navy-600" />
      </g>
    </svg>
  )
}

// The Forest Hiker: snowy mountains, pines and a lake
export function ForestScene(props: SvgProps) {
  return (
    <svg aria-hidden viewBox="0 0 360 240" preserveAspectRatio="xMidYMid slice" {...props}>
      <rect width="360" height="240" className="fill-scene-sky" />
      <g strokeLinejoin="round" className="stroke-navy-950">
        <path
          d="M-10 200L90 70L170 180L240 90L380 200Z"
          strokeWidth="4"
          className="fill-navy-600"
        />
        <path
          d="M90 70L112 100L98 94L84 106L70 96ZM240 90L262 118L248 112L234 122L222 114Z"
          strokeWidth="3"
          className="fill-white"
        />
        <rect x="-10" y="198" width="380" height="50" strokeWidth="3" className="fill-scene-sea" />
        <path
          d="M30 208L50 150L70 208ZM300 208L322 140L344 208ZM60 208L76 166L92 208Z"
          strokeWidth="3"
          className="fill-lagoon-700"
        />
      </g>
    </svg>
  )
}

// x, y and radius of each star; every third one is gold
const STARS = [
  [40, 40, 3],
  [96, 70, 2],
  [150, 30, 3],
  [210, 60, 2],
  [250, 24, 2],
  [120, 110, 2],
  [60, 120, 2],
  [190, 110, 3],
]

// The Star Gazer: stars and the moon over desert mesas. Night in both themes.
export function NightScene(props: SvgProps) {
  return (
    <svg aria-hidden viewBox="0 0 360 240" preserveAspectRatio="xMidYMid slice" {...props}>
      <rect width="360" height="240" className="fill-navy-950" />
      {STARS.map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} className={i % 3 ? "fill-sand-50" : "fill-sun-300"} />
      ))}
      <path d="M300 30A26 26 0 1 0 322 70A20 20 0 1 1 300 30Z" className="fill-sand-50" />
      <g strokeWidth="3" strokeLinejoin="round" className="stroke-sand-50">
        <path
          d="M-4 240L-4 170L40 170L54 150L120 150L132 172L180 172L180 240Z"
          className="fill-sand-400"
        />
        <path
          d="M170 240L170 190L230 190L244 160L320 160L330 190L370 190L370 240Z"
          className="fill-sand-300"
        />
      </g>
    </svg>
  )
}
