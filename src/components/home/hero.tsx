import { ButtonLink } from "@/components/button"
import { HeroGround } from "@/components/home/hero-ground"
import { HeroPlane } from "@/components/home/hero-plane"
import { Cloud, Moon, Snooze, Stars, Sun } from "@/components/scene/sky"
import { ThemeToggle } from "@/components/theme-toggle"

// 01 Hero: "Horizon" (design/HANDOFF.md)
export function Hero() {
  return (
    // min-h-svh: at least one screen tall, measured with the phone's browser bars showing
    <section className="relative flex min-h-svh flex-col overflow-hidden bg-scene-sky">
      {/* Night only: fades in when the theme turns dark */}
      <Stars className="absolute inset-0 hidden motion-safe:animate-fade-in dark:block" />

      {/* pointer-events-none: empty sky lets the pointer through to the stars behind.
          Everything interactive turns it back on with pointer-events-auto. */}
      <div className="pointer-events-none relative z-10 flex flex-1 flex-col items-center justify-center px-4 pt-22 pb-12 text-center md:pt-24 lg:pb-0 short:pt-20 short:pb-4">
        {/* The title "stage". Its font size (the SUMMER size) is the unit (em) for
            everything inside, so the sun and clouds scale and move with the headline.
            Fluid size: the smallest of 26% of the screen width, a gentler 52px + 12.5%
            of the width, 232px (the design's desktop size), and 26% of the screen height
            (short laptop screens).
            Phones and tablets: the sun sits above the title. Desktop (lg): beside SUMMER.
            Short phones (short:): a smaller sun, closer to the title, so the beach fits. */}
        <div className="relative mt-[1.75em] w-full text-[min(26vw,52px+12.5vw,232px,26svh)] lg:mt-[0.37em] short:mt-[1.12em]">
          {/* The sun is the third theme switch (with the nav button and the footer).
              peer: lets the halo react to its hover. group: lets its face react.
              z-5: in front of the halo and clouds, behind the headline (z-10), so the R
              covers its left rays like in the design. */}
          <ThemeToggle
            labelLight="Set the sun: switch to dark mode"
            labelDark="Wake the moon up: switch to light mode"
            className="peer group pointer-events-auto absolute top-[-1.69em] left-1/2 z-5 ml-[0.82em] size-[1.06em] cursor-pointer rounded-full transition-[scale] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-safe:hover:scale-105 motion-safe:active:scale-x-110 motion-safe:active:scale-y-90 lg:top-[-0.27em] lg:ml-[1.6em] lg:size-[0.95em] short:top-[-1.02em] short:ml-[0.93em] short:size-[0.85em]"
          >
            {/* Each rises (with a squash) when it appears: on load and after every switch */}
            <span className="block size-full motion-safe:animate-rise dark:hidden">
              <Sun className="block size-full motion-safe:animate-bob" />
            </span>
            <span className="relative hidden size-full motion-safe:animate-rise dark:block">
              <Moon className="block size-full motion-safe:animate-rock" />
              <Snooze className="absolute top-[-13%] left-[95%] -rotate-10 text-[0.15em]" />
            </span>
          </ThemeToggle>

          {/* Halo: breathes, and grows while the sun is hovered (peer-hover) */}
          <span
            aria-hidden
            className="absolute top-[-2em] left-1/2 ml-[0.53em] size-[1.92em] transition-[scale] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-safe:peer-hover:scale-110 lg:top-[-0.61em] lg:ml-[1.25em] lg:size-[1.64em] short:top-[-1.29em] short:ml-[0.6em] short:size-[1.5em]"
          >
            <span className="block size-full rounded-full bg-scene-sky-2 motion-safe:animate-breathe" />
          </span>

          {/* One cloud above the title on phones; three around it on desktop */}
          <CloudSpot
            className="top-[-0.37em] ml-[-0.43em] w-[0.96em] lg:top-[-0.27em] lg:ml-[0.6em] lg:w-[0.65em]"
            delay="-1s"
          />
          <CloudSpot
            shade
            className="top-[0.08em] ml-[-2.72em] hidden w-[0.95em] lg:block"
            delay="-4s"
          />
          <CloudSpot
            shade
            className="top-[1.07em] ml-[2.16em] hidden w-[0.73em] lg:block"
            delay="-2.5s"
          />

          {/* No tracking-tight here: at this size the letters need air (matches the design).
              w-fit: the heading's box hugs the text, so the clouds beside it stay hoverable. */}
          <h1 className="pointer-events-auto relative z-10 mx-auto flex w-fit flex-col items-center font-display leading-[0.84] font-bold uppercase">
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
                className="mt-2.5 basis-full -rotate-3 font-hand text-[22px] font-normal text-primary normal-case lg:absolute lg:top-1/4 lg:left-full lg:mt-0 lg:ml-2 lg:basis-auto lg:-rotate-7 lg:text-[30px] lg:whitespace-nowrap short:mt-1.5"
              >
                <span className="dark:hidden">(tan lines not included)</span>
                <span className="hidden dark:inline">(night swim, anyone?)</span>
              </span>
            </span>
          </h1>

          {/* After the headline in the code, so screen readers read the title first */}
          <HeroPlane />
        </div>

        {/* The design shortens this on phones: the extra bits only show from md up */}
        <p className="pointer-events-auto mt-3 max-w-140 text-muted-foreground md:mt-7.5 md:text-xl short:mt-2">
          Small-group summer tours to beaches, islands
          <span className="hidden md:inline">, coastlines</span> and national parks, led by local
          guides<span className="hidden md:inline"> who know where the good snacks are</span>.
        </p>

        {/* short:h-12 overrides the button's own height: 48px is still a comfy tap target */}
        <div className="pointer-events-auto mt-5 flex w-full max-w-sm flex-col gap-3 md:mt-7.5 md:w-auto md:max-w-none md:flex-row md:gap-4.5 short:mt-4 short:gap-2.5">
          <ButtonLink href="/tours" className="short:h-12">
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
          <ButtonLink href="/signup" variant="outline" className="short:h-12">
            Create an account
          </ButtonLink>
        </div>
      </div>

      <HeroGround />
    </section>
  )
}

// A cloud that drifts on its own; hover puffs it up, a tap squishes it.
// The drift (translate) and the puff (scale) are different properties, so they combine.
function CloudSpot({
  shade = false,
  className,
  delay,
}: {
  shade?: boolean
  className: string
  delay: string // a negative delay starts the drift mid-way, so clouds don't move in sync
}) {
  return (
    <span
      aria-hidden
      className={`pointer-events-auto absolute left-1/2 transition-[scale] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-safe:hover:scale-110 motion-safe:active:scale-x-110 motion-safe:active:scale-y-90 ${className}`}
    >
      <Cloud
        shade={shade}
        className="block w-full motion-safe:animate-drift"
        style={{ animationDelay: delay }}
      />
    </span>
  )
}
