import { Moon, Sleepy, Snooze, Sun } from "@/components/scene/sky"
import { ThemeToggle } from "@/components/theme-toggle"

// The sun over the tours page (the moon at night), and also the page's theme switch. It starts
// beside the title, and as the page scrolls it crosses to the corridor between the cards and
// sinks down it, getting bigger and sleepier, until it sets behind the sea at the end of the
// route (horizon.tsx). All of that is CSS (the sun-* rules at the end of globals.css): the
// scroll itself drives the animation, with no JavaScript.
//
// md+ only (phones have no room beside the title, or between the cards), and it stays still
// beside the title with reduced motion or in browsers without scroll-driven animations.
// Those, and phones, get a still sun on the horizon instead (HorizonSun in horizon.tsx).
//
// .sun-sky is a box with no height that sticks to the top of the screen while the section
// goes by. It comes first in the section, so the cards, which come later, cover the sun.
export function SettingSun() {
  return (
    <div className="sun-sky absolute inset-x-0 top-0 h-0">
      <div className="relative mx-auto max-w-6xl">
        {/* --sun-top and --sun-half: the sums in .sun-sets need to know where it starts */}
        <div className="sun-sets absolute top-(--sun-top) right-6 hidden [--sun-half:3rem] [--sun-top:9.5rem] md:block lg:[--sun-half:4.5rem] lg:[--sun-top:8.5rem]">
          <ThemeToggle
            labelLight="Set the sun: switch to dark mode"
            labelDark="Wake the moon up: switch to light mode"
            className="block size-24 cursor-pointer rounded-full transition-[scale] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-safe:hover:scale-105 lg:size-36"
          >
            <span className="relative block size-full motion-safe:animate-rise dark:hidden">
              <Sun raysClassName="sun-rays" className="block size-full motion-safe:animate-bob" />
              {/* Fades in over it at the end of the day */}
              <Sleepy className="sun-sleeps absolute inset-0 block size-full opacity-0 motion-safe:animate-bob" />
            </span>
            <span className="relative hidden size-full motion-safe:animate-rise dark:block">
              <Moon className="block size-full motion-safe:animate-rock" />
              <Snooze className="absolute top-[-13%] left-[95%] -rotate-10 text-2xl" />
            </span>
          </ThemeToggle>
        </div>
      </div>
    </div>
  )
}
