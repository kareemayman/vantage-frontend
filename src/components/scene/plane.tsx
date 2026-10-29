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

// The same plane seen from above, facing right like the one above, so GSAP's autoRotate
// points its nose along a path. The nose's tip is at 97% across, 50% down.
// stroke-outline: the cards' outline color, lighter at night, because this one flies over
// the night sky
export function PlaneTop({ className = "", ...props }: ComponentProps<"svg">) {
  return (
    <svg aria-hidden viewBox="0 0 100 100" overflow="visible" className={className} {...props}>
      <g strokeWidth="4.5" strokeLinejoin="round" className="stroke-outline">
        {/* main wings, swept back, then the tail wings */}
        <g className="fill-navy-600">
          <path d="M60 40L41 8Q39 4 35 5L32 6Q29 7 30 11L42 40Z" />
          <path d="M60 60L41 92Q39 96 35 95L32 94Q29 93 30 89L42 60Z" />
          <path d="M26 42L17 28Q16 26 14 26L11 26Q9 26 9.5 29L12 42Z" />
          <path d="M26 58L17 72Q16 74 14 74L11 74Q9 74 9.5 71L12 58Z" />
        </g>
        {/* engines, poking out in front of the wings */}
        <g className="fill-sky-300">
          <rect x="46" y="21" width="14" height="8" rx="4" />
          <rect x="46" y="71" width="14" height="8" rx="4" />
        </g>
        {/* body, nose cap and cockpit window */}
        <path
          d="M12 45Q12 39 21 39L66 38C86 38 97 43 97 50C97 57 86 62 66 62L21 61Q12 61 12 55Z"
          className="fill-white"
        />
        <path
          d="M84 39.4C92 41.2 97 45 97 50C97 55 92 58.8 84 60.6Q80 50 84 39.4Z"
          className="fill-sun-300"
        />
        <path
          d="M78 41.5Q82 50 78 58.5L74 57.5Q77.5 50 74 42.5Z"
          className="fill-navy-950 stroke-none"
        />
        {/* the tail fin, seen edge-on from above */}
        <rect x="5" y="47.5" width="26" height="5" rx="2.5" className="fill-sky-300" />
      </g>
    </svg>
  )
}
