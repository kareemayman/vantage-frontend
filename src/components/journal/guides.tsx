import Image from "next/image"
import { HEADING, Tape, WRITE_IN } from "@/components/journal/journal"
import { Reveal } from "@/components/reveal"
import type { Guide } from "@/lib/tours"

// Our guides: each one as a small instant photo taped in, with their first name written
// under it, then their full name and role. Without a photo, the frame stays empty.
// Once a guide scrolls into view (<Reveal>), their instant photo develops: it starts dark and
// the picture slowly comes through, while it gets a shake, like you'd shake a real one
// (wiggle, the toys' one-shot). Then their first name is written in. Side by side, guides
// start 0.2s apart. Reduced motion: it's all just there.
export function Guides({ guides }: { guides: Guide[] }) {
  return (
    <section aria-labelledby="guides-title">
      <Reveal>
        <h2 id="guides-title" className={HEADING}>
          <span className={WRITE_IN}>our guides</span>
        </h2>
      </Reveal>
      <ul className="mt-8 flex flex-wrap gap-12">
        {guides.map((guide, i) => {
          const at = i * 0.2
          return (
            <li key={guide._id} className={`w-44 ${i % 2 ? "rotate-3" : "-rotate-2"}`}>
              <Reveal>
                <div
                  className="relative border border-sand-300 bg-white p-2 pb-3 shadow-lg motion-safe:seen:animate-wiggle"
                  style={{ animationDelay: `${at + 0.2}s` }}
                >
                  <Tape className="-top-3 left-1/2 h-6 w-16 -translate-x-1/2 rotate-2" />
                  <div className="relative aspect-square bg-sand-200">
                    {guide.photo && (
                      <>
                        <Image
                          src={guide.photo}
                          alt=""
                          fill
                          sizes="160px"
                          className="object-cover"
                        />
                        {/* The film before it develops: dark until the guide scrolls into
                            view, then it fades away. Invisible otherwise (no animation). */}
                        <span
                          className="absolute inset-0 bg-neutral-800 opacity-0 motion-safe:waiting:opacity-100 motion-safe:seen:animate-develop"
                          style={{ animationDelay: `${at}s` }}
                        />
                      </>
                    )}
                  </div>
                  {/* The handwritten first name repeats the name below, so screen readers
                      skip it */}
                  <p aria-hidden className="mt-2 text-center font-hand text-2xl lowercase">
                    <span className={WRITE_IN} style={{ animationDelay: `${at + 1.2}s` }}>
                      {guide.name.split(" ")[0]}
                    </span>
                  </p>
                </div>
                <p className="mt-3 text-center text-sm font-bold">
                  {guide.name} · {guide.role === "lead-guide" ? "lead guide" : "tour guide"}
                </p>
              </Reveal>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
