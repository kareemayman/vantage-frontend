import type { ComponentProps } from "react"

// A cartoon seagull (the tours page, step 4c): one sitting, one flying. Raw palette colors:
// a physical object, the same in both themes. Both face left; mirror them to face right.

type SvgProps = ComponentProps<"svg">

// Sitting, seen from the side, with its feet on the bottom edge of the drawing
export function GullSitting(props: SvgProps) {
  return (
    <svg aria-hidden viewBox="0 0 72 64" {...props}>
      <path
        d="M30 50V61M25 62.5H34M39 50V61M34 62.5H43"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        className="stroke-coral-400"
      />
      <path
        d="M13 20C13 10 23 5 31 7C38 9 41 15 42 20C52 23 61 31 67 43C59 46 52 48 47 49C37 53 24 52 18 44C13 37 16 30 17 27C14 25 13 23 13 20Z"
        strokeWidth="3"
        strokeLinejoin="round"
        className="fill-white stroke-navy-950"
      />
      {/* The folded wing, with a dark tip */}
      <path
        d="M30 28C40 23 54 30 63 42C53 46 42 46 35 42C31 39 29 33 30 28Z"
        strokeWidth="2.5"
        strokeLinejoin="round"
        className="fill-neutral-200 stroke-navy-950"
      />
      <path
        d="M63 42C58 44 54 45 50 45C52 41 53 39 54 33C58 36 61 39 63 42Z"
        className="fill-navy-800"
      />
      <path
        d="M14 17L3 21Q8 25 15 23Z"
        strokeWidth="2.5"
        strokeLinejoin="round"
        className="fill-sun-300 stroke-navy-950"
      />
      <circle cx="22" cy="16" r="2.8" className="fill-navy-950" />
      <circle cx="23" cy="15" r="0.9" className="fill-white" />
    </svg>
  )
}

// One wing, seen spread out. Its shoulder is at 7% across and 91% down, which is where the
// flying gull turns it from (origin-[7%_91%]). The far wing is the same drawing, mirrored.
function Wing(props: SvgProps) {
  return (
    <svg aria-hidden viewBox="0 0 60 44" overflow="visible" {...props}>
      <path
        d="M4 40C8 22 22 8 56 4C48 16 44 20 40 24C32 30 20 38 12 42Z"
        strokeWidth="3"
        strokeLinejoin="round"
        className="fill-white stroke-navy-950"
      />
      <path
        d="M56 4C48 16 44 20 40 24C38 20 38 16 38 9C44 7 50 5 56 4Z"
        className="fill-navy-800"
      />
    </svg>
  )
}

// Flying: a body with a wing on each side that flap (motion-safe:animate-gull-flap, one turn
// of a wing per flap, opposite ways: --flap says which). Each wing is its own <svg>, so
// flapping only moves a finished picture around (see Scene animation in CLAUDE.md). The box
// is 100 × 60: its width sets the size of everything.
export function GullFlying({ className = "" }: { className?: string }) {
  const wing =
    "absolute top-[-12%] left-[48.5%] w-1/2 origin-[7%_91%] motion-safe:animate-gull-flap"
  return (
    <span aria-hidden className={`relative block aspect-100/60 ${className}`}>
      <Wing className={`${wing} scale-x-[-1] brightness-90 [--flap:-1]`} />
      <svg viewBox="0 0 100 60" overflow="visible" className="absolute inset-0 size-full">
        {/* The tail, then the body and head as one shape */}
        <path
          d="M70 27L92 22L88 38Z"
          strokeWidth="3"
          strokeLinejoin="round"
          className="fill-neutral-200 stroke-navy-950"
        />
        <path
          d="M23 28C23 21 32 17 39 20C47 18 66 20 73 28C70 37 50 42 39 39C30 39 23 34 23 28Z"
          strokeWidth="3"
          strokeLinejoin="round"
          className="fill-white stroke-navy-950"
        />
        <path
          d="M24 25L12 29Q18 33 25 31Z"
          strokeWidth="2.5"
          strokeLinejoin="round"
          className="fill-sun-300 stroke-navy-950"
        />
        <circle cx="32" cy="25" r="2.8" className="fill-navy-950" />
        <circle cx="33" cy="24" r="0.9" className="fill-white" />
      </svg>
      <Wing className={`${wing} [--flap:1]`} />
    </span>
  )
}

// A feather that falls when the gulls scatter
export function Feather(props: SvgProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 40" {...props}>
      <path
        d="M12 2C20 8 21 22 12 32C3 22 4 8 12 2Z"
        strokeWidth="2"
        strokeLinejoin="round"
        className="fill-white stroke-navy-950"
      />
      <path
        d="M12 12V38"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        className="stroke-navy-950"
      />
    </svg>
  )
}
