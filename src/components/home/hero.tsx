import { ButtonLink } from "@/components/button"

// 01 Hero: "Horizon" (design/HANDOFF.md). Text and buttons for now;
// the sun/moon and sky arrive in step 4b, the ground and toys in 4c.
export function Hero() {
  return (
    // min-h-svh: at least one screen tall, measured with the phone's browser bars showing
    <section className="relative flex min-h-svh flex-col overflow-hidden bg-scene-sky">
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pt-64 pb-12 text-center md:pt-44 md:pb-0">
        {/* Fluid size: the smallest of 26% of the screen width, 232px (the design's
            desktop size), and 30% of the screen height.
            No tracking-tight here: at this size the letters need air (matches the design). */}
        <h1 className="flex flex-col items-center font-display text-[min(26vw,232px,30svh)] leading-[0.84] font-bold uppercase">
          {/* {" "}: real spaces for copy/paste and search engines; flexbox hides them */}
          <span>Summer</span>{" "}
          {/* em = a fraction of the SUMMER size, so both lines always scale together */}
          <span className="relative flex flex-wrap items-center justify-center gap-x-[0.2em] text-[0.52em] leading-[1.05] md:text-[0.465em] md:leading-none">
            Starts{" "}
            <span className="inline-block -rotate-2 rounded-[0.18em] border-3 border-navy-950 bg-cta px-[0.17em] leading-[1.02] text-cta-foreground shadow-pop md:border-4">
              here
            </span>
            {/* A doodled aside: under the headline on smaller screens, beside HERE on
                wide ones. Decoration, so screen readers skip it. */}
            <span
              aria-hidden
              className="mt-2.5 basis-full -rotate-3 font-hand text-[22px] font-normal text-primary normal-case xl:absolute xl:top-1/4 xl:left-full xl:mt-0 xl:ml-2 xl:basis-auto xl:-rotate-7 xl:text-[30px] xl:whitespace-nowrap"
            >
              <span className="dark:hidden">(tan lines not included)</span>
              <span className="hidden dark:inline">(night swim, anyone?)</span>
            </span>
          </span>
        </h1>

        {/* The design shortens this on phones: the extra bits only show from md up */}
        <p className="mt-3 max-w-140 text-muted-foreground md:mt-7.5 md:text-xl">
          Small-group summer tours to beaches, islands
          <span className="hidden md:inline">, coastlines</span> and national parks, led by local
          guides<span className="hidden md:inline"> who know where the good snacks are</span>.
        </p>

        <div className="mt-5 flex w-full max-w-sm flex-col gap-3 md:mt-7.5 md:w-auto md:max-w-none md:flex-row md:gap-4.5">
          <ButtonLink href="/tours">
            Explore tours
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="size-4.5 fill-none stroke-current stroke-[2.6] md:size-5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </ButtonLink>
          <ButtonLink href="/signup" variant="outline">
            Create an account
          </ButtonLink>
        </div>
      </div>

      {/* Keeps the ground's space (sea + sand arrive in step 4c) */}
      <div aria-hidden className="h-35 md:h-48" />
    </section>
  )
}
