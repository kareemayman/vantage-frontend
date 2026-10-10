import type { ComponentProps } from "react"

// SVG stand-ins for the hero's 3D sky (design/HANDOFF.md asset list: 03 sun,
// 03b moon, 05 clouds). three.js versions replace them later; these stay as the
// reduced-motion / low-power fallback. Idle loops only run with motion-safe:.
// Sun and moon use raw palette colors (the same in both themes); clouds and
// stars follow the theme.

type SvgProps = ComponentProps<"svg">

const RAYS =
  "M196 110L212 110M184.5 153L198.3 161M153 184.5L161 198.3M110 196L110 212M67 184.5L59 198.3M35.5 153L21.7 161M24 110L8 110M35.5 67L21.7 59M67 35.5L59 21.7M110 24L110 8M153 35.5L161 21.7M184.5 67L198.3 59"

// The smiling sun. Inside a `group` (its button), hovering swaps the resting
// face for a squint and a grin.
export function Sun(props: SvgProps) {
  return (
    <svg aria-hidden viewBox="0 0 220 220" {...props}>
      {/* Rays: one ring that slowly turns. transform-fill: around its own center */}
      <g strokeLinecap="round" className="origin-center transform-fill motion-safe:animate-turn">
        <path d={RAYS} strokeWidth="15" className="stroke-navy-950" />
        <path d={RAYS} strokeWidth="8" className="stroke-sun-300" />
      </g>
      <circle cx="110" cy="110" r="70" className="fill-sun-300" />
      <path d="M173 80A70 70 0 0 1 80 173A86 86 0 0 0 173 80Z" className="fill-sun-400" />
      <ellipse
        cx="82"
        cy="76"
        rx="15"
        ry="8"
        opacity="0.6"
        transform="rotate(-35 82 76)"
        className="fill-white"
      />
      <circle cx="110" cy="110" r="70" fill="none" strokeWidth="5" className="stroke-navy-950" />
      <ellipse cx="76" cy="126" rx="10" ry="6" className="fill-sun-400" />
      <ellipse cx="144" cy="126" rx="10" ry="6" className="fill-sun-400" />

      {/* Resting face: blinks every few seconds */}
      <g className="transition-opacity group-hover:opacity-0">
        <g className="origin-center fill-navy-950 transform-fill motion-safe:animate-blink">
          <ellipse cx="90" cy="104" rx="6" ry="9" />
          <ellipse cx="130" cy="104" rx="6" ry="9" />
        </g>
        <path
          d="M90 126Q110 148 130 126"
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          className="stroke-navy-950"
        />
      </g>
      {/* Hover face: squinting eyes and a big grin */}
      <g
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-navy-950 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <path d="M80 107Q90 95 100 107M120 107Q130 95 140 107" fill="none" />
        <path d="M86 122Q110 156 134 122Z" className="fill-navy-950" />
      </g>
    </svg>
  )
}

// The sleepy moon (dark theme). Inside a `group`, hovering makes it peek with one eye.
export function Moon(props: SvgProps) {
  return (
    <svg aria-hidden viewBox="0 0 220 220" {...props}>
      <circle cx="110" cy="110" r="74" className="fill-sun-100" />
      <path d="M176 84A74 74 0 0 1 84 180A92 92 0 0 0 176 84Z" className="fill-sand-300" />
      <g className="fill-sand-300">
        <circle cx="78" cy="78" r="11" />
        <circle cx="150" cy="80" r="7" />
        <circle cx="138" cy="152" r="12" />
      </g>
      <circle cx="110" cy="110" r="74" fill="none" strokeWidth="5" className="stroke-navy-950" />
      <g fill="none" strokeWidth="5" strokeLinecap="round" className="stroke-navy-950">
        {/* Left eye: asleep, peeks open on hover */}
        <path d="M80 108Q91 118 102 108" className="transition-opacity group-hover:opacity-0" />
        <ellipse
          cx="91"
          cy="110"
          rx="6"
          ry="8"
          className="fill-navy-950 stroke-none opacity-0 transition-opacity group-hover:opacity-100"
        />
        <path d="M118 108Q129 118 140 108" />
        <path d="M100 134Q110 141 120 134" strokeWidth="4.5" />
      </g>
    </svg>
  )
}

// "z z" floating off the sleeping moon, one after the other
export function Snooze({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`font-hand leading-none text-sun-200 ${className}`}>
      <span className="block motion-safe:animate-snooze">z</span>
      <span className="block pl-[0.6em] [animation-delay:-1.5s] motion-safe:animate-snooze">z</span>
    </span>
  )
}

const CLOUD =
  "M40 95C15 95 10 62 36 58C34 30 72 20 86 42C96 14 146 14 150 48C178 44 192 72 176 88C172 94 166 95 160 95Z"

// A puffy cloud: white by day, slate by night (scene tokens)
export function Cloud({ shade = false, ...props }: SvgProps & { shade?: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 200 110" {...props}>
      <path d={CLOUD} className="fill-scene-cloud" />
      {shade && <path d="M28 90Q100 76 180 86L170 95L40 95Z" className="fill-scene-cloud-shade" />}
      {/* non-scaling-stroke: a 3px outline whatever size the cloud is drawn at */}
      <path
        d={CLOUD}
        fill="none"
        strokeWidth="3"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className="stroke-outline"
      />
    </svg>
  )
}

// Night sky positions in % of the hero, so the stars spread with the screen
const SPARKLES = [
  { x: 9.7, y: 11.6, size: 28, delay: 0 },
  { x: 52.8, y: 7.9, size: 22, delay: 1.2 },
  { x: 93.1, y: 34.9, size: 28, delay: 0.6 },
  { x: 29.2, y: 34.6, size: 22, delay: 1.8 },
]
const DOTS = [
  { x: 22.2, y: 6.7, size: 5, warm: false, delay: 0.4 },
  { x: 68.1, y: 7.8, size: 4, warm: false, delay: 2.1 },
  { x: 4.2, y: 42.2, size: 4, warm: true, delay: 1 },
  { x: 86.1, y: 62.2, size: 4, warm: false, delay: 2.6 },
  { x: 44.4, y: 22.2, size: 4, warm: false, delay: 1.5 },
  { x: 97.2, y: 17.8, size: 5, warm: true, delay: 0.2 },
  { x: 59.7, y: 62.2, size: 4, warm: false, delay: 0.8 },
]

// Twinkling stars. Sparkles grow and turn on hover (the layer itself lets the
// pointer through; only the sparkles catch it).
export function Stars({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none ${className}`}>
      {SPARKLES.map((star) => (
        <span
          key={`${star.x}-${star.y}`}
          className="pointer-events-auto absolute -translate-1/2 p-2 transition-[scale,rotate] duration-300 motion-safe:hover:scale-150 motion-safe:hover:rotate-45"
          style={{ left: `${star.x}%`, top: `${star.y}%` }}
        >
          <svg
            viewBox="0 0 24 24"
            className="block fill-sun-200 motion-safe:animate-twinkle"
            style={{ width: star.size, height: star.size, animationDelay: `${star.delay}s` }}
          >
            <path d="M12 0L15.4 8.6L24 12L15.4 15.4L12 24L8.6 15.4L0 12L8.6 8.6Z" />
          </svg>
        </span>
      ))}
      {DOTS.map((dot) => (
        <span
          key={`${dot.x}-${dot.y}`}
          className={`absolute -translate-1/2 rounded-full motion-safe:animate-twinkle ${dot.warm ? "bg-sun-200" : "bg-sand-50"}`}
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: dot.size,
            height: dot.size,
            animationDelay: `${dot.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
