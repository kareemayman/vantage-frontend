import { Moon, Sleepy } from "@/components/scene/sky"

// The end of the tours page's sky: the sea at sunset, with the sun's light on the water, then
// the shore, leading into the page's sand-colored background. Its height (--ground, set on the
// section) is where the setting sun aims (setting-sun.tsx). Decoration, so screen readers skip
// it. It comes after the route, so it covers the bottom half of the setting sun.
export function Horizon() {
  return (
    <div aria-hidden className="relative h-(--ground)">
      {/* The still sun, half set, for whoever doesn't get the moving one (see .horizon-sun) */}
      <div className="horizon-sun absolute top-0 left-1/2 w-40 -translate-x-1/2 -translate-y-[62%] md:w-64">
        <Sleepy className="block w-full dark:hidden" />
        <Moon className="hidden w-full dark:block" />
      </div>

      {/* The sea, tall enough to reach under the shore's lowest point. Waves like the hero's:
          48px wider than the screen, sliding one 48px tile */}
      <div className="absolute inset-x-0 top-0 h-[75%] overflow-hidden border-t-3 border-outline bg-(image:--sea-dusk)">
        <svg className="absolute top-[22%] left-0 h-5 w-[calc(100%+48px)] opacity-(--wave-opacity) motion-safe:animate-waves">
          <defs>
            <pattern id="horizon-waves" width="48" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M0 10Q12 2 24 10T48 10"
                fill="none"
                strokeWidth="3"
                strokeLinecap="round"
                className="stroke-white"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#horizon-waves)" />
        </svg>
        {/* The sun's light on the water, right under it: shimmering bars, narrower each row */}
        <div className="absolute inset-x-0 top-1 flex flex-col items-center gap-1.5 md:top-2 md:gap-2">
          {["w-32 md:w-52", "w-24 md:w-40", "w-16 md:w-28", "w-10 md:w-16"].map((width, i) => (
            <span
              key={width}
              style={{ animationDelay: `${i * -0.7}s` }}
              className={`h-1.5 rounded-full bg-sun-200 motion-safe:animate-shimmer ${width}`}
            />
          ))}
        </div>
      </div>

      {/* The shore, then the page's own background. Stretched to fit, with a steady outline */}
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-[58%] w-full"
      >
        <path d="M0 22Q360 -2 720 18T1440 12V80H0Z" className="fill-scene-sand" />
        <path
          d="M0 22Q360 -2 720 18T1440 12"
          fill="none"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
          className="stroke-outline"
        />
        <path d="M0 62Q420 44 820 60T1440 54V80H0Z" className="fill-background" />
      </svg>
    </div>
  )
}
