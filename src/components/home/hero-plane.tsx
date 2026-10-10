import { Plane } from "@/components/scene/plane"
import { Poke } from "@/components/scene/poke"

// The plane towing its banner along a dotted trail. Rendered inside the hero's
// title stage (after the headline), so everything is positioned in em: fractions
// of the headline size.
// Phones and tablets: just the plane, above-left of the title. Desktop (lg): the
// whole tow (trail, banner on its rope, plane) up-left of SUMMER.
// group/tow: one shared hover zone, so hovering the plane OR the banner makes the
// banner flutter. (A named group, because the plane itself is a `group` too.)
// z-20: above the headline (z-10). The headline's tight line height (0.84) makes its
// text reach ~0.3em above its own box, and that overflow would catch clicks meant for
// the plane. This layer is pointer-events-none, so it never blocks the headline.
export function HeroPlane() {
  return (
    <div className="group/tow absolute inset-0 z-20">
      {/* Dotted trail: fades in behind the arriving plane, then its dots drift
          backwards, so the plane seems to keep flying forward. */}
      <svg
        aria-hidden
        viewBox="-400 0 1160 140"
        className="absolute top-[-0.35em] left-1/2 ml-[-4.83em] hidden w-[5em] motion-safe:animate-fade-in motion-safe:[animation-delay:1.2s] lg:block"
      >
        <path
          d="M-420 104C-300 100 -118 113 -20 120C120 130 220 40 380 70S560 60 600 46"
          fill="none"
          strokeWidth="3"
          strokeDasharray="2 12"
          strokeLinecap="round"
          opacity="0.6"
          className="stroke-primary motion-safe:animate-march"
        />
      </svg>

      {/* The banner on its rope (desktop). Real text: screen readers read it after
          the headline. Four layers, one job each:
          tilt (+ hops along while the plane flaps: "the tow group has a playing toy")
          > fly in > float > flutter (it swings around the rope's end, where the plane pulls). */}
      <div className="absolute top-[-0.26em] left-1/2 ml-[-2.24em] hidden -rotate-4 motion-safe:group-has-data-playing/tow:animate-flap-hop lg:block">
        <div className="motion-safe:animate-fly-in motion-safe:[animation-delay:0.3s]">
          <div className="motion-safe:animate-float">
            <div className="flex origin-right items-center motion-safe:animate-flutter motion-safe:group-hover/tow:animate-flutter-fast">
              <p className="pointer-events-auto rounded-[0.3em_0.7em] border-3 border-navy-950 bg-white px-[1.1em] py-[0.5em] font-display text-[0.086em] leading-none font-bold tracking-[0.02em] whitespace-nowrap text-navy-950 uppercase shadow-pop">
                Small groups · big summers
              </p>
              <span aria-hidden className="h-0.5 w-[0.31em] bg-outline" />
            </div>
          </div>
        </div>
      </div>

      {/* The plane: poke it and it flaps its wing like a bird (inside the drawing),
          rising a little with each flap. Decoration (no label), like the palm.
          Layers: hop (Poke) > fly in > float > the drawing (tilted nose-up). */}
      <Poke
        animation="flap-hop"
        className="pointer-events-auto absolute top-[-1.46em] left-1/2 ml-[-1.72em] w-[1.15em] cursor-pointer motion-safe:data-playing:animate-flap-hop lg:top-[-0.45em] lg:ml-[-0.69em] lg:w-[0.95em] short:top-[-0.95em] short:w-[1em]"
      >
        <span className="block motion-safe:animate-fly-in motion-safe:[animation-delay:0.3s]">
          <span className="block motion-safe:animate-float">
            <Plane className="block w-full -rotate-6" />
          </span>
        </span>
      </Poke>
    </div>
  )
}
