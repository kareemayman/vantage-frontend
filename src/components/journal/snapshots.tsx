import Image from "next/image"
import { HEADING, Tape, WRITE_IN } from "@/components/journal/journal"
import { Reveal } from "@/components/reveal"

// Each photo is taped in at its own angle; md+ staggers them up and down. --drop-turn: as it
// drops in, it starts turned 3° the other way, and turns into its angle as it falls.
const ANGLES = [
  "-rotate-3 [--drop-turn:3deg]",
  "rotate-2 [--drop-turn:-3deg] md:mt-14",
  "-rotate-1 [--drop-turn:3deg] md:-mt-2",
]

// Snapshots: the tour's photos, taped into the journal. Each one waits until it scrolls into
// view (<Reveal>: on phones they're a screen apart), then it's dropped onto the page like the
// cover photo, and its tape is pressed on once it lands. Side by side (md+), they come in one
// after another, 0.15s apart. These photos are tall, so a turned one is wide: they start only
// 5% bigger (--drop-from) and 3° turned, or a phone's page edge would cut them off mid-fall
// (measured at 320 and 390: at least 7px of room). Reduced motion: they're just there.
export function Snapshots({ name, images }: { name: string; images: string[] }) {
  return (
    <section aria-labelledby="photos-title">
      <Reveal>
        <h2 id="photos-title" className={HEADING}>
          <span className={WRITE_IN}>snapshots</span>
        </h2>
      </Reveal>
      <ul className="mt-10 grid gap-10 md:grid-cols-3 md:gap-6">
        {images.map((image, i) => (
          <li key={image} className={`relative ${ANGLES[i % ANGLES.length]}`}>
            {/* The Reveal box never moves (the observer measures where it is); the photo
                inside it drops. The tilt stays on the <li>. */}
            <Reveal>
              <Tape
                color="sand"
                className="-top-3 left-6 h-6 w-20 -rotate-12 motion-safe:waiting:opacity-0 motion-safe:seen:animate-tape-on"
                style={{ animationDelay: `${i * 0.15 + 0.65}s` }}
              />
              <div
                className="border border-sand-300 bg-white p-2 shadow-lg [--drop-from:1.05] motion-safe:waiting:opacity-0 motion-safe:seen:animate-drop-in"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="relative aspect-4/5">
                  <Image
                    src={image}
                    alt={`${name}, photo ${i + 1} of ${images.length}`}
                    fill
                    sizes="(min-width: 1152px) 300px, (min-width: 768px) 28vw, calc(100vw - 88px)"
                    className="object-cover"
                  />
                </div>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  )
}
