import { BeachBall, Palm, Suitcase } from "@/components/scene/beach"
import { Poke } from "@/components/scene/poke"

// The hero's ground: sea, sand, and the toys on it. A band at the bottom of the
// hero (shorter on short screens, so the beach still shows above the fold);
// everything inside is placed in % of the band, so it stretches with the screen.
export function HeroGround() {
  return (
    <div className="relative h-35 md:h-[min(12rem,24svh)] short:h-28">
      {/* Sea. The wave stripe is 48px wider than the screen and slides left by one
          48px pattern tile, then repeats: an endless, seamless roll. */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-[31%] overflow-hidden bg-scene-sea">
        <svg className="absolute top-[13%] left-0 h-5 w-[calc(100%+48px)] opacity-(--wave-opacity) motion-safe:animate-waves">
          <defs>
            <pattern id="hero-waves" width="48" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M0 10Q12 2 24 10T48 10"
                fill="none"
                strokeWidth="3"
                strokeLinecap="round"
                className="stroke-white"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-waves)" />
        </svg>
      </div>

      {/* Sand and dunes. preserveAspectRatio="none" stretches the drawing to any
          width and height; non-scaling-stroke keeps the shoreline outline at 3px. */}
      <svg
        aria-hidden
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-[83%] w-full"
      >
        <path d="M0 22Q360 -6 720 18T1440 12L1440 160L0 160Z" className="fill-scene-sand" />
        <path d="M0 116Q420 82 820 112T1440 100L1440 160L0 160Z" className="fill-scene-dune" />
        <path
          d="M0 22Q360 -6 720 18T1440 12"
          fill="none"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
          className="stroke-outline"
        />
      </svg>

      {/* Palm: sways on its own (inner); wiggles on every hover, click or tap (outer,
          via Poke). Both turn around the foot of the trunk. No label = decoration:
          mouse and touch only, not a keyboard stop. */}
      <Poke
        animation="wiggle"
        playOnHover
        className="absolute bottom-[20%] -left-6 h-[clamp(164px,25vw,360px)] origin-[55%_100%] cursor-pointer motion-safe:data-playing:animate-wiggle md:bottom-[36%] md:left-[2%] short:h-30"
      >
        <Palm className="h-full w-auto origin-[55%_100%] motion-safe:animate-sway" />
      </Poke>

      {/* Suitcases (wide screens only): hop on every hover, click or tap */}
      <Poke
        animation="hop"
        playOnHover
        className="absolute bottom-[27%] left-[17.4%] hidden w-[8.3vw] max-w-30 origin-bottom cursor-pointer motion-safe:data-playing:animate-hop lg:block"
      >
        <Suitcase color="sky" className="block w-full" />
      </Poke>
      <Poke
        animation="hop"
        playOnHover
        className="absolute bottom-[18%] left-[22.9%] hidden w-[7.6vw] max-w-27.5 origin-bottom cursor-pointer motion-safe:data-playing:animate-hop lg:block"
      >
        <Suitcase color="sun" className="block w-full" />
      </Poke>

      {/* Beach ball: a real button. Three layers, one job each:
          bounce (translate + scale) > hover wiggle (rotate) > idle rock (inside the SVG).
          The bounce plays even with reduced motion: you asked for it by poking. */}
      <div className="absolute bottom-[23%] left-[68%] w-[clamp(76px,8.3vw,120px)] md:bottom-[29%] md:left-[71.5%]">
        <Poke
          label="Bounce the beach ball"
          animation="bounce-once"
          className="relative block w-full cursor-pointer rounded-full"
        >
          {/* Shadow on the sand: shrinks while the ball is up in the air */}
          <span
            aria-hidden
            className="absolute top-[102%] left-[-1.5%] h-[15%] w-[103%] rounded-[50%] bg-scene-ground-shadow group-data-playing:animate-shadow-bounce"
          />
          <span className="block origin-bottom group-data-playing:animate-bounce-once">
            <span className="block motion-safe:group-hover:animate-wiggle">
              <BeachBall className="block w-full" />
            </span>
          </span>
        </Poke>

        {/* The hint: left of the ball on smaller screens, right of it on wide ones
            (with a doodled arrow). Reduced motion: the toys rest. */}
        <svg
          aria-hidden
          viewBox="0 0 70 50"
          className="absolute top-[17%] left-[92%] hidden w-[58%] fill-none stroke-current xl:block"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M64 30C50 6 26 6 12 26M12 26L12 12M12 26L26 28" />
        </svg>
        <p
          aria-hidden
          className="absolute top-[40%] right-[112%] w-max -rotate-4 font-hand text-xl leading-none xl:top-[30%] xl:right-auto xl:left-[122%] xl:text-[26px] xl:leading-[1.05]"
        >
          <span className="motion-reduce:hidden">
            psst... poke <br className="hidden xl:inline" />
            the <span className="hidden xl:inline">beach </span>ball
            <span className="xl:hidden"> →</span>
          </span>
          <span className="hidden motion-reduce:inline">Toys are resting</span>
        </p>
      </div>

      {/* Scroll hint, wide screens only: below xl the ball's note sits in this spot */}
      <div
        aria-hidden
        className="absolute bottom-[13%] left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1.5 text-[13px] font-bold tracking-[0.14em] uppercase xl:flex"
      >
        Scroll to take off
        <svg
          viewBox="0 0 24 24"
          className="size-5.5 fill-none stroke-current stroke-[2.6] motion-safe:animate-bob"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </div>
  )
}
