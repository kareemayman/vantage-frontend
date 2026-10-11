"use client"

import { toggleMotion } from "@/lib/motion"

// The "Reduce motion" switch (footer Settings). Like ThemeToggle, the state lives in
// the DOM and the labels swap with CSS, so the server HTML is right either way.
// [[data-motion=reduce]_&]: an arbitrary variant meaning "inside data-motion=reduce".
// The visible text says what a click does, so it doubles as the screen-reader label.
export function MotionToggle({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={toggleMotion} className={className}>
      <span className="[[data-motion=reduce]_&]:hidden">Reduce motion</span>
      <span className="hidden [[data-motion=reduce]_&]:inline">Allow motion</span>
    </button>
  )
}
