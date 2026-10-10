import type { ComponentProps } from "react"

// SVG stand-in for the cartoon plane (design/HANDOFF.md asset 01), facing right.
// three.js replaces it later (loader, hero, Journey, globe); this stays as the
// reduced-motion / low-power fallback. Raw palette colors: the same in both themes.
// **:[vector-effect:non-scaling-stroke] keeps every outline the same thickness
// whether the plane is drawn 110px wide (phones) or 220px (desktop).
export function Plane({ className = "", ...props }: ComponentProps<"svg">) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 240 120"
      overflow="visible"
      className={`**:[vector-effect:non-scaling-stroke] ${className}`}
      {...props}
    >
      <g strokeLinejoin="round" className="stroke-navy-950">
        {/* tail fin */}
        <path
          d="M38 58L22 18Q20 12 28 12L48 12Q54 12 58 20L74 52Z"
          strokeWidth="3.5"
          className="fill-sky-300"
        />
        {/* body, belly shade, stripe */}
        <path
          d="M30 60Q30 44 52 44L170 44Q214 44 222 66Q214 86 172 86L54 86Q30 86 30 70Z"
          strokeWidth="3.5"
          className="fill-white"
        />
        <path
          d="M38 76Q60 83 170 83Q204 81 216 72Q210 85 172 85L54 85Q38 85 38 76Z"
          className="fill-sky-100 stroke-none"
        />
        <rect x="52" y="70" width="128" height="5" className="fill-navy-600 stroke-none" />
        {/* nose cap and cockpit window */}
        <path
          d="M200 48Q220 54 222 66Q218 78 204 82Q194 66 200 48Z"
          strokeWidth="3.5"
          className="fill-sun-300"
        />
        <path d="M178 52Q194 52 198 62L176 62Z" className="fill-navy-950 stroke-none" />
        {/* passenger windows */}
        <g strokeWidth="2.5" className="fill-sky-300">
          <circle cx="86" cy="59" r="7" />
          <circle cx="110" cy="59" r="7" />
          <circle cx="134" cy="59" r="7" />
          <circle cx="158" cy="59" r="7" />
        </g>
        {/* tail wing and main wing */}
        <path d="M32 62L66 62L54 78L32 78Z" strokeWidth="2.5" className="fill-navy-600" />
        {/* The wing flaps like a bird whenever a parent `group` is playing (a Poke).
            origin-top + transform-fill: it flips around its root, where it meets the body. */}
        <path
          d="M100 70L142 70L120 112Q116 118 108 118L98 118Q90 118 93 111Z"
          strokeWidth="3.5"
          className="origin-top fill-navy-600 transform-fill motion-safe:group-data-playing:animate-flap"
        />
      </g>
    </svg>
  )
}
