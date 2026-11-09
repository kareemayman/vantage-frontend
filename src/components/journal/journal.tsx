import type { CSSProperties, ReactNode } from "react"

// The tour page is a travel journal (5b: Kareem's pick, over a "through the window" idea): one
// long notebook page lying on the table, with ruled lines every 32px, a coral margin line and
// binder holes. It's a physical object, so it looks the same in both themes, like the
// homepage's polaroids: data-theme="light" keeps every token inside it light.
export function Journal({ children }: { children: ReactNode }) {
  return (
    <div data-theme="light" className="px-3 pt-28 pb-24 md:px-6 md:pt-36">
      <div className="relative mx-auto max-w-6xl overflow-x-clip rounded-[28px] border-4 border-navy-950 bg-sand-50 bg-[repeating-linear-gradient(to_bottom,transparent_0_31px,var(--color-sky-200)_31px_32px)] py-12 pr-5 pl-10 text-foreground shadow-xl md:py-16 md:pr-12 md:pl-28">
        <span aria-hidden className="absolute inset-y-0 left-6 w-0.5 bg-coral-300 md:left-20" />
        <span
          aria-hidden
          className="absolute inset-y-16 left-6 hidden flex-col justify-between md:flex"
        >
          {Array.from({ length: 8 }, (_, i) => (
            <span
              key={i}
              className="block size-6 rounded-full border-2 border-navy-950/25 bg-sand-200"
            />
          ))}
        </span>
        {/* A wrapper for the spacing: the margin line and holes above are absolute, and a
            margin on them would shorten them */}
        <div className="space-y-24">{children}</div>
      </div>
    </div>
  )
}

// The sections' handwritten titles. Lowercase, like every handwritten note on the site.
export const HEADING = "font-hand text-4xl text-primary md:text-5xl"

// A strip of tape holding something onto the page. className places and turns it, and can add
// an entrance (motion-safe:animate-tape-on); style carries that entrance's delay.
export function Tape({
  className,
  color = "sky",
  style,
}: {
  className: string
  color?: "sky" | "sand"
  style?: CSSProperties
}) {
  return (
    <span
      aria-hidden
      style={style}
      className={`absolute z-10 ${color === "sky" ? "bg-sky-100/85" : "bg-sand-200/90"} ${className}`}
    />
  )
}
