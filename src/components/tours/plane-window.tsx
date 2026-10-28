import Image from "next/image"

type PlaneWindowProps = {
  photo?: string // a Cloudinary public ID; without one the glass is empty (an empty seat)
  alt?: string // "" by default: on the plane, the window's button already names the tour
  sizes?: string // how wide the window shows, for next/image (e.g. "90px"); needed with a photo
  shade?: "open" | "closed" // closed = pulled down (the tour doesn't match the filters)
  landscape?: boolean // the phone plane points up, so its windows lie on their side
}

// One window of the tours page's plane (design/tours-handoff, "The window component").
// It fills its parent's width and keeps the window's shape: 100 wide × 128 tall, or
// 128 × 100 lying down. Every part is sized in em, and 1em = the short side ÷ 56, so the
// same markup draws a 90px window on the plane and a 530px one zoomed in.
// Only <span>s: the plane will wrap each window in a <button>, which can't hold a <div>.
export function PlaneWindow({
  photo,
  alt = "",
  sizes,
  shade = "open",
  landscape = false,
}: PlaneWindowProps) {
  const closed = shade === "closed"

  return (
    // @container: the window measures its own width (100cqw) to set its em
    <span className={`@container block w-full ${landscape ? "aspect-128/100" : "aspect-100/128"}`}>
      {/* The bezel. Short side = 56em: the width standing up, the height lying down
          (128/100 × 56 = 71.68 widths) */}
      <span
        className={`relative block size-full rounded-[23em] border-[length:max(1.5px,0.4em)] border-win-line bg-win-bezel ${landscape ? "text-[length:calc(100cqw/71.68)]" : "text-[length:calc(100cqw/56)]"}`}
      >
        {/* The ring between the bezel and the glass */}
        <span className="absolute inset-[1.6em] block rounded-[21em] border-[length:max(1px,0.3em)] border-win-ring-edge bg-win-ring" />
        {/* The glass. At night a closed shade glows, as if the cabin light shines through */}
        <span
          className={`absolute inset-[4.2em] block overflow-hidden rounded-[18.6em] border-[length:max(1.5px,0.4em)] border-win-line bg-win-empty ${closed ? "shadow-[0_0_16px_3px_var(--shade-glow)]" : ""}`}
        >
          {photo && <Image src={photo} alt={alt} fill sizes={sizes} className="object-cover" />}
          {/* Two strokes of glare on the glass, fainter with no photo behind them */}
          <span
            className={`absolute top-[16%] left-[12%] block h-1/2 w-[4.4%] rotate-28 rounded-full bg-white ${photo ? "opacity-32" : "opacity-18"}`}
          />
          <span
            className={`absolute top-[16%] left-[21%] block h-1/2 w-[2%] rotate-28 rounded-full bg-white ${photo ? "opacity-32" : "opacity-18"}`}
          />
          {/* The shade, with a ridge every 3.2em and the handle on its bottom edge. Open,
              it's pulled up until only a sliver and the handle show (84% of its height) */}
          <span
            className={`absolute inset-0 flex items-end justify-center border-b-[length:max(1.5px,0.4em)] border-win-line bg-shade bg-[repeating-linear-gradient(to_bottom,transparent_0_3.2em,var(--shade-ridge)_3.2em_3.45em)] ${closed ? "translate-y-0" : "-translate-y-[84%]"}`}
          >
            <span className="mb-[1.2em] block h-[1.6em] w-[7em] rounded-full border-[length:max(1px,0.3em)] border-win-line bg-shade-handle" />
          </span>
        </span>
      </span>
    </span>
  )
}
