import Link from "next/link"
import type { ComponentProps } from "react"

// Plain class strings, no class-merging library. Rule that keeps it safe:
// `className` only adds layout (width, margins), never colors or sizes.
const VARIANTS = {
  // The sun "sticker": the main action. Navy border in both themes; the shadow
  // turns sun-colored in dark mode (shadow-pop). Pressing pushes it onto the page.
  cta: "border-3 border-navy-950 bg-cta font-extrabold text-cta-foreground shadow-pop hover:bg-cta-hover active:translate-x-1 active:translate-y-1 active:shadow-none",
  // The quiet partner next to a cta
  outline: "border-2 border-outline bg-card font-bold text-foreground hover:bg-accent",
}

const SIZES = {
  sm: "h-11 rounded-xl px-3.5 text-[15px] md:h-12 md:px-5.5 md:text-base", // navbar
  lg: "h-13 rounded-[14px] px-7 text-[17px] md:h-16 md:rounded-2xl md:text-lg", // hero
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: keyof typeof VARIANTS
  size?: keyof typeof SIZES
}

// A link styled as a button: it goes somewhere, so it's an <a> (actions get a real <button>)
export function ButtonLink({
  variant = "cta",
  size = "lg",
  className = "",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap transition motion-reduce:transition-none md:gap-2.5 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  )
}
