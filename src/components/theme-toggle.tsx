"use client"

import type { ReactNode } from "react"
import { toggleTheme } from "@/lib/theme"

type ThemeToggleProps = {
  labelLight: string // what screen readers hear while the page is light
  labelDark: string
  className?: string
  children: ReactNode // the visible part: an icon, the hero sun, a text label
}

// The only piece that needs the browser is the click handler, so only this button
// is a Client Component. Its children can still be rendered on the server.
export function ThemeToggle({ labelLight, labelDark, className, children }: ThemeToggleProps) {
  return (
    <button
      type="button"
      className={className}
      onClick={(event) => {
        const box = event.currentTarget.getBoundingClientRect()
        toggleTheme({ x: box.left + box.width / 2, y: box.top + box.height / 2 })
      }}
    >
      {/* Labels swap with CSS, so the server never needs to know the theme */}
      <span className="sr-only dark:hidden">{labelLight}</span>
      <span className="sr-only hidden dark:inline">{labelDark}</span>
      {children}
    </button>
  )
}
