import { BeachBall, PoolRing } from "@/components/scene/beach"

// 07 Playground (design/HANDOFF.md): a pool with the beach ball floating in it. The
// games (keep-it-up, beach volleyball) and their buttons come in phase 7, with 3D
// physics (Kareem's call), so for now the pool is a picture: screen readers skip it.
// Phones: words, pool, note. lg+: words and note on the left, pool on the right.
export function Playground() {
  return (
    <section
      aria-labelledby="playground-title"
      className="relative border-t-3 border-outline bg-scene-sand py-16 lg:border-t-0 lg:pt-40 lg:pb-36"
    >
      {/* Desktop: the section starts with a wave (the page background above, the sand
          below) instead of a straight line. non-scaling-stroke: a 3px outline at any
          width. */}
      <svg
        aria-hidden
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-0 hidden h-15 w-full lg:block"
      >
        <path d="M0 0L1440 0L1440 24Q1080 56 720 30T0 36Z" className="fill-background" />
        <path
          d="M1440 24Q1080 56 720 30T0 36"
          fill="none"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
          className="stroke-outline"
        />
      </svg>

      {/* lg: two columns. The pool spans both rows on the right, so the note can sit
          under the words on desktop and under the pool on phones (HTML order).
          Tablets (md): the stack is centered, so it doesn't hug the left edge. */}
      <div className="mx-auto max-w-360 px-4 md:px-10 md:text-center lg:grid lg:grid-cols-[minmax(0,32.5rem)_minmax(0,37.5rem)] lg:justify-between lg:gap-x-12 lg:px-20 lg:text-left">
        <div>
          <p className="text-[13px] font-extrabold tracking-[0.16em] text-primary uppercase md:text-sm">
            The playground
          </p>
          {/* Always two lines ("Try to keep / the ball up."), so "up." never ends up
              alone on a line */}
          <h2
            id="playground-title"
            className="mt-2.5 font-display text-[min(3.25rem,14vw)] leading-[0.9] font-bold tracking-tight uppercase md:mt-3 md:text-7xl lg:text-[clamp(4.5rem,6.4vw,5.75rem)]"
          >
            Try to keep <br />
            the ball up.
          </h2>
          <p className="mt-4 max-w-md text-[17px] leading-[1.55] text-pretty text-muted-foreground md:mx-auto md:mt-5.5 md:text-lg lg:mx-0">
            Bump the ball to keep it in the air. If it lands in the pool, you start over. Best score
            gets bragging rights.
          </p>
        </div>

        <Pool />

        <p className="mt-5 font-hand text-[22px] text-pretty text-primary md:-rotate-3 lg:col-start-1 lg:mt-6.5 lg:self-start lg:text-[26px]">
          psst... 3 easter eggs hide on this page
        </p>
      </div>
    </section>
  )
}

// The pool: a card (the rim) with water inside, the ball floating in it and a pool ring
// drifting by. The waves are the hero's: one 48px wave tile, repeated, sliding left
// by one tile and starting over (animate-waves). The scoreboard waits for the game.
function Pool() {
  return (
    <div
      aria-hidden
      className="relative mt-9 rounded-[36px] border-4 border-outline bg-card p-4 shadow-xl md:mx-auto md:mt-12 md:max-w-xl lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mx-0 lg:mt-0 lg:max-w-none lg:self-center lg:rounded-[48px] lg:p-5.5"
    >
      <div className="relative aspect-10/7 overflow-hidden rounded-[22px] border-3 border-navy-950 bg-scene-sea lg:aspect-5/3 lg:rounded-[30px]">
        <svg className="absolute inset-y-0 left-0 h-full w-[calc(100%+48px)] opacity-(--wave-opacity) motion-safe:animate-waves">
          <defs>
            <pattern id="pool-waves" width="48" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M0 20Q12 12 24 20T48 20"
                fill="none"
                strokeWidth="3"
                strokeLinecap="round"
                className="stroke-white"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pool-waves)" />
        </svg>
        {/* The ball sitting in its ripple. One box for both, sized by the ball, so the
            ripple hugs the ball whatever shape the pool is. The ripple comes first, so
            the ball covers its back half. Only the ball bobs (and its panels rock). */}
        <div className="absolute top-[16%] left-[38%] w-[22%]">
          <span className="absolute top-[85%] left-[-4%] h-[20%] w-[108%] rounded-[50%] border-3 border-white" />
          <BeachBall className="relative block w-full motion-safe:animate-bob" />
        </div>
        <PoolRing
          className="absolute top-[52%] left-[72%] w-[20%] motion-safe:animate-bob"
          style={{ animationDelay: "-1.5s" }}
        />
      </div>

      {/* The scoreboard, stuck on the rim's corner. Navy in both themes (handoff). */}
      <div className="absolute -top-5.5 right-3 flex rotate-3 gap-4 rounded-xl border-2 border-nav-border bg-navy-950 px-3.5 py-2 font-display text-sm font-bold tracking-[0.06em] text-sky-100 uppercase lg:-top-7 lg:right-8 lg:gap-5.5 lg:rounded-2xl lg:px-5 lg:py-3.5 lg:text-base">
        <span>
          Score <span className="text-xl text-sun-300 lg:text-3xl">00</span>
        </span>
        <span>
          Best <span className="text-xl text-sand-50 lg:text-3xl">--</span>
        </span>
      </div>
    </div>
  )
}
