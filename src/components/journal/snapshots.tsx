import Image from "next/image"
import { HEADING, Tape } from "@/components/journal/journal"

// Each photo is taped in at its own angle; md+ staggers them up and down
const ANGLES = ["-rotate-3", "rotate-2 md:mt-14", "-rotate-1 md:-mt-2"]

// Snapshots: the tour's photos, taped into the journal
export function Snapshots({ name, images }: { name: string; images: string[] }) {
  return (
    <section aria-labelledby="photos-title">
      <h2 id="photos-title" className={HEADING}>
        snapshots
      </h2>
      <ul className="mt-10 grid gap-10 md:grid-cols-3 md:gap-6">
        {images.map((image, i) => (
          <li key={image} className={`relative ${ANGLES[i % ANGLES.length]}`}>
            <Tape color="sand" className="-top-3 left-6 h-6 w-20 -rotate-12" />
            <div className="border border-sand-300 bg-white p-2 shadow-lg">
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
          </li>
        ))}
      </ul>
    </section>
  )
}
