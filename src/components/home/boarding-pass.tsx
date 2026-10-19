import { ButtonLink } from "@/components/button"
import { ArrowIcon } from "@/components/icons"
import { Cloud } from "@/components/scene/sky"

// What's printed on the pass (design/HANDOFF.md)
const FIELDS = [
  { label: "Passenger", value: "You" },
  { label: "From", value: "Your couch" },
  { label: "To", value: "Somewhere sunny" },
  { label: "Boarding", value: "This summer" },
]

// 08 Boarding pass (design/HANDOFF.md): the homepage's last call to action, printed as a
// boarding pass. Phones and tablets: the pass stands up, with its seat stub at the bottom.
// lg+: it lies on its side, a little crooked, with the stub on the right and two clouds
// drifting by. The stub is a physical object (sun yellow in both themes); the rest
// follows the theme.
export function BoardingPass() {
  return (
    <section
      aria-labelledby="seat-title"
      className="relative overflow-hidden bg-scene-sky py-16 md:py-24 lg:py-40"
    >
      <Cloud
        className="absolute top-17.5 left-15 hidden w-50 motion-safe:animate-drift lg:block"
        style={{ animationDelay: "-1s" }}
      />
      <Cloud
        className="absolute right-15 bottom-16.5 hidden w-42.5 motion-safe:animate-drift lg:block"
        style={{ animationDelay: "-3s" }}
      />

      <div className="relative mx-auto max-w-360 px-4 md:px-10 lg:px-20">
        {/* The pass: main part, tear line, stub. The shadow sits on this wrapper, which
            has the pass's rounded shape. */}
        <div className="mx-auto flex max-w-xl flex-col rounded-3xl shadow-xl lg:max-w-280 lg:rotate-[-1.5deg] lg:flex-row lg:rounded-[28px]">
          <div className="flex grow flex-col rounded-t-3xl border-4 border-b-0 border-outline bg-card px-5.5 pt-6 pb-6 md:px-9 md:pt-9 lg:rounded-l-[28px] lg:rounded-tr-none lg:border-r-0 lg:border-b-4 lg:px-11">
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 text-xs font-extrabold tracking-[0.16em] text-primary uppercase md:text-[13px]">
              <p className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="size-3.5 rounded-full border-3 border-navy-950 bg-sun-300"
                />
                Vantage · Boarding pass
              </p>
              <p>Flight VTG-026</p>
            </div>
            {/* Always two lines, like the design. Phones: shrinks with the screen so "Your
                seat is" (5.19× as wide as the font size) fits down to 320px. */}
            <h2
              id="seat-title"
              className="mt-3 font-display text-[min(3.5rem,18.5vw-1rem)] leading-[0.9] font-bold tracking-tight uppercase md:mt-4 md:text-7xl lg:text-[clamp(4.5rem,6.4vw,5.75rem)]"
            >
              Your seat is <br />
              waiting
            </h2>

            {/* Label and value pairs: a description list (dt = label, dd = value) */}
            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3.5 md:mt-6.5 lg:grid-cols-4 lg:gap-4.5">
              {FIELDS.map((field) => (
                <div key={field.label}>
                  <dt className="text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground uppercase md:text-xs">
                    {field.label}
                  </dt>
                  <dd className="mt-1 font-display text-xl font-semibold uppercase lg:text-[clamp(1.25rem,1.8vw,1.625rem)]">
                    {field.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-4 lg:mt-auto lg:pt-8">
              <ButtonLink href="/tours">
                Explore tours
                <ArrowIcon className="size-4.5 md:size-5" />
              </ButtonLink>
              <ButtonLink href="/signup" variant="outline">
                Create an account
              </ButtonLink>
              <p className="self-center font-hand text-[22px] text-primary md:ml-2 md:-rotate-4 lg:text-[26px]">
                don&apos;t lose this one
              </p>
            </div>
          </div>

          {/* The tear line between the pass and its stub. lg: a notch punched at each end
              (a circle the color of the sky, half of it hidden by clip-path). */}
          <div
            aria-hidden
            className="relative mx-1 border-t-4 border-dashed border-outline lg:mx-0 lg:border-t-0 lg:border-l-4"
          >
            <span className="absolute top-0.5 left-1/2 z-10 hidden size-11 -translate-1/2 rounded-full border-4 border-outline bg-scene-sky [clip-path:inset(50%_0_0_0)] lg:block" />
            <span className="absolute bottom-0.5 left-1/2 z-10 hidden size-11 -translate-x-1/2 translate-y-1/2 rounded-full border-4 border-outline bg-scene-sky [clip-path:inset(0_0_50%_0)] lg:block" />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-b-3xl border-4 border-t-0 border-outline bg-sun-300 px-5.5 py-4.5 text-navy-950 lg:w-67.5 lg:shrink-0 lg:flex-col lg:items-start lg:rounded-r-[28px] lg:rounded-bl-none lg:border-t-4 lg:border-l-0 lg:px-7.5 lg:py-9">
            {/* shrink-0: on narrow phones the barcode gets narrower, not the words */}
            <dl className="shrink-0">
              <dt className="text-[11px] font-extrabold tracking-[0.14em] uppercase md:text-xs">
                Seat
              </dt>
              <dd className="font-display text-[4rem] leading-[0.9] font-bold lg:text-[7.5rem]">
                1A
              </dd>
              <dd className="mt-1 text-[13px] font-bold lg:text-[15px]">Window, obviously</dd>
            </dl>
            {/* A pretend barcode: repeating stripes */}
            <div
              aria-hidden
              className="h-12.5 w-32.5 bg-[repeating-linear-gradient(90deg,var(--color-navy-950)_0_4px,transparent_4px_7px,var(--color-navy-950)_7px_9px,transparent_9px_14px)] lg:mt-auto lg:h-17.5 lg:w-full"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
