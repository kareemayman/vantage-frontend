import { useId, type ComponentProps } from "react"

// The Vantage logo: the sun sinking into the sea, like the end of the tours page. Drawn for
// 20px and up; the tab icons are a simpler copy with no small waves (src/app/icon.svg).
// Raw palette colors: a physical object looks the same in both themes. Only the rim follows
// the theme, or it would vanish on the dark navbar.
// Inside a playing <Poke animation="sunrise">, the sun comes up and sets again.
export function Logo(props: ComponentProps<"svg">) {
  const clip = useId()

  return (
    <svg aria-hidden viewBox="0 0 32 32" {...props}>
      <clipPath id={clip}>
        <circle cx="16" cy="16" r="14.4" />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <rect width="32" height="32" className="fill-sky-300" />
        <circle
          cx="16"
          cy="16.6"
          r="7.6"
          strokeWidth="1.6"
          className="fill-sun-300 stroke-navy-950 motion-safe:group-data-playing:animate-sunrise"
        />
        <path
          d="M0 18.6Q4 16 8 18.6T16 18.6T24 18.6T32 18.6V32H0Z"
          strokeWidth="1.5"
          className="fill-navy-600 stroke-navy-950"
        />
        <path
          d="M8 24q2-1.5 4 0t4 0M16 27.6q2-1.5 4 0t4 0"
          fill="none"
          strokeWidth="1.2"
          strokeLinecap="round"
          className="stroke-white"
        />
      </g>
      <circle cx="16" cy="16" r="14.4" fill="none" strokeWidth="2.4" className="stroke-outline" />
    </svg>
  )
}
