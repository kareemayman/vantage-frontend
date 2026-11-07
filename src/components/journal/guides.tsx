import Image from "next/image"
import { HEADING, Tape } from "@/components/journal/journal"
import type { Guide } from "@/lib/tours"

// Our guides: each one as a small instant photo taped in, with their first name written
// under it, then their full name and role. Without a photo, the frame stays empty.
export function Guides({ guides }: { guides: Guide[] }) {
  return (
    <section aria-labelledby="guides-title">
      <h2 id="guides-title" className={HEADING}>
        our guides
      </h2>
      <ul className="mt-8 flex flex-wrap gap-12">
        {guides.map((guide, i) => (
          <li key={guide._id} className={`w-44 ${i % 2 ? "rotate-3" : "-rotate-2"}`}>
            <div className="relative border border-sand-300 bg-white p-2 pb-3 shadow-lg">
              <Tape className="-top-3 left-1/2 h-6 w-16 -translate-x-1/2 rotate-2" />
              <div className="relative aspect-square bg-sand-200">
                {guide.photo && (
                  <Image src={guide.photo} alt="" fill sizes="160px" className="object-cover" />
                )}
              </div>
              {/* The handwritten first name repeats the name below, so screen readers skip it */}
              <p aria-hidden className="mt-2 text-center font-hand text-2xl lowercase">
                {guide.name.split(" ")[0]}
              </p>
            </div>
            <p className="mt-3 text-center text-sm font-bold">
              {guide.name} · {guide.role === "lead-guide" ? "lead guide" : "tour guide"}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
