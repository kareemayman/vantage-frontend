// Living style guide: every design token in light and dark, side by side.
// Add new components here as they're built.
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Design tokens" } // -> "Design tokens | Vantage"

const SCALES = ["navy", "sky", "sun", "sand", "neutral", "lagoon", "coral"]
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
const BRAND: Record<string, number> = { navy: 600, sky: 300, sun: 300, sand: 200 }
const SHADOWS = ["shadow-xs", "shadow-sm", "shadow-md", "shadow-lg", "shadow-xl", "shadow-pop"]

export default function DesignPage() {
  return (
    // Slightly deeper "workspace" background so the light preview panel stands out
    <div className="bg-muted">
      <div className="mx-auto w-full max-w-6xl space-y-12 px-6 py-16">
        <header className="space-y-2">
          <h1 className="font-display text-6xl font-bold tracking-tight uppercase">
            Design tokens
          </h1>
          <p className="-rotate-1 font-hand text-2xl text-primary">the Vantage paint box</p>
        </header>

        <section className="space-y-3">
          <h2 className="font-display text-3xl font-semibold tracking-tight uppercase">Palette</h2>
          {SCALES.map((name) => (
            <div key={name} className="flex items-center gap-3">
              <span className="w-16 text-sm font-semibold">{name}</span>
              <div className="grid flex-1 grid-cols-11 gap-1">
                {STEPS.map((step) => (
                  <div key={step} className="space-y-1 text-center">
                    {/* Inline style, not a class: Tailwind can't see class names built at runtime */}
                    <div
                      className={`h-10 rounded-md ${BRAND[name] === step ? "ring-2 ring-foreground ring-offset-2 ring-offset-muted" : ""}`}
                      style={{ backgroundColor: `var(--color-${name}-${step})` }}
                    />
                    <span className="text-xs text-muted-foreground">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <p className="text-sm text-muted-foreground">
            Ringed swatches are the four brand colors.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Sample label="Light (default)" />
          {/* Any element can flip the theme for everything inside it */}
          <div data-theme="dark">
            <Sample label="Dark" />
          </div>
        </section>
      </div>
    </div>
  )
}

function Sample({ label }: { label: string }) {
  const button = "rounded-xl px-4 py-2.5 font-semibold transition-colors"

  return (
    <div className="space-y-6 rounded-3xl border bg-background p-6 text-foreground">
      <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
        {label}
      </p>

      <div>
        <h3 className="font-display text-5xl font-bold tracking-tight uppercase">
          The Sea Explorer
        </h3>
        <p className="-rotate-2 font-hand text-2xl text-primary">best sunsets of the trip!</p>
      </div>

      <div className="space-y-2 rounded-2xl bg-card p-5 text-card-foreground shadow-md">
        <p>Body text on a card. Seven days of turquoise water and island sunsets.</p>
        <p className="text-sm text-muted-foreground">Secondary text: Miami, USA · 4 stops</p>
        <a href="#" className="font-semibold text-primary underline underline-offset-4">
          A link
        </a>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          className={`${button} bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active`}
        >
          Primary
        </button>
        <button
          className={`${button} bg-secondary text-secondary-foreground hover:bg-secondary-hover`}
        >
          Secondary
        </button>
        <button className={`${button} bg-cta text-cta-foreground shadow-pop hover:bg-cta-hover`}>
          Book now
        </button>
        <button
          className={`${button} bg-destructive text-destructive-foreground hover:bg-destructive-hover`}
        >
          Delete
        </button>
        <button
          disabled
          className={`${button} cursor-not-allowed bg-disabled text-disabled-foreground`}
        >
          Disabled
        </button>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-semibold">Email address</span>
        <input
          type="email"
          placeholder="you@example.com"
          className="block w-full rounded-xl border border-input bg-card px-3 py-2.5 placeholder:text-muted-foreground"
        />
      </label>

      <div className="grid grid-cols-2 gap-2 text-sm font-medium">
        <p className="rounded-lg bg-success-soft p-3 text-success">Booking confirmed</p>
        <p className="rounded-lg bg-warning-soft p-3 text-warning">Only 2 spots left</p>
        <p className="rounded-lg bg-destructive-soft p-3 text-destructive">Payment failed</p>
        <p className="rounded-lg bg-info-soft p-3 text-info">Tour starts at 9:00</p>
      </div>

      <div className="rounded-xl bg-popover p-2 text-popover-foreground shadow-lg">
        {["Account settings", "My bookings", "Log out"].map((item) => (
          <p
            key={item}
            className="rounded-lg px-3 py-2 hover:bg-accent hover:text-accent-foreground"
          >
            {item}
          </p>
        ))}
      </div>

      <div className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
        A muted section: quieter background for side info.
      </div>

      {/* Scene tokens: a tiny beach built only from scene-* colors */}
      <div className="overflow-hidden rounded-2xl border-2 border-outline">
        <div className="relative h-24 bg-scene-sky">
          <div className="absolute top-3 right-6 size-14 rounded-full bg-scene-sky-2" />
          <div className="absolute top-6 left-6 h-6 w-16 rounded-full border-2 border-outline bg-scene-cloud" />
        </div>
        <div className="h-5 bg-scene-sea" />
        <div className="relative h-12 border-t-2 border-outline bg-scene-sand">
          <div className="absolute bottom-0 h-4 w-full bg-scene-dune" />
          <div className="absolute top-3 left-1/2 h-2 w-14 -translate-x-1/2 rounded-full bg-scene-ground-shadow" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-sm font-semibold">
        <span className="rounded-full bg-chip px-3 py-1 text-chip-foreground">7 days</span>
        <span className="rounded-full bg-chip-warm px-3 py-1">★ 4.8 (6 reviews)</span>
        <span className="rounded-full border-2 border-dashed border-dash px-3 py-1">dash</span>
        <span className="rounded-full bg-night px-3 py-1 text-sand-50">night</span>
        <span className="rounded-full bg-tile px-3 py-1 shadow-sm">tile</span>
        <span className="rounded-full px-3 py-1 text-crab">crab 🦀</span>
      </div>

      <div className="flex flex-wrap gap-4">
        {SHADOWS.map((shadow) => (
          <div
            key={shadow}
            className={`grid h-16 w-24 place-items-center rounded-xl bg-card text-xs ${shadow}`}
          >
            {shadow}
          </div>
        ))}
      </div>
    </div>
  )
}
