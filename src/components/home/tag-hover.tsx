"use client"

import type { ReactNode } from "react"

// What a luggage tag does under the mouse (mouse only: touch screens have no hover).
// - It leans toward the mouse, up to 2°, turning around the top of its string. The script
//   only writes --lean: -1 with the mouse at the tag's left edge, 0 in the middle, 1 at
//   the right edge. The CSS turns that into a rotation, inside motion-safe: so reduced
//   motion switches it off like every other animation.
// - Its stamp thunks once each time the mouse comes in. Like <Poke>, data-playing stays
//   on until the stamp's "thunk" animation ends, so leaving early never cuts it off.
export function TagHover({ children }: { children: ReactNode }) {
  return (
    <div
      className="group origin-[50%_-67px] transition-[rotate] duration-300 ease-out motion-safe:rotate-[calc(var(--lean,0)*-2deg)]"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") event.currentTarget.dataset.playing = ""
      }}
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse") return
        // Measure the box around this one: it doesn't turn, so the numbers stay steady
        const box = event.currentTarget.parentElement
        if (!box) return
        const { left, width } = box.getBoundingClientRect()
        const lean = ((event.clientX - left) / width) * 2 - 1
        event.currentTarget.style.setProperty("--lean", String(Math.max(-1, Math.min(1, lean))))
      }}
      onPointerLeave={(event) => event.currentTarget.style.setProperty("--lean", "0")}
      onAnimationEnd={(event) => {
        if (event.animationName === "thunk") delete event.currentTarget.dataset.playing
      }}
    >
      {children}
    </div>
  )
}
