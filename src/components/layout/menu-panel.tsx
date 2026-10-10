"use client"

import type { ReactNode } from "react"

type MenuPanelProps = {
  id: string // the menu button opens this panel with popoverTarget={id}
  className?: string
  children: ReactNode
}

// A native popover: the browser opens and closes it, and handles Esc and tap-outside.
// The one thing it can't know: Next.js changes pages without a reload, so the navbar
// (and this open panel) would stay on screen after a link tap. We close it ourselves.
export function MenuPanel({ id, className, children }: MenuPanelProps) {
  return (
    <div
      id={id}
      popover="auto"
      className={className}
      onClick={(event) => {
        // One handler for every link inside (event delegation)
        if ((event.target as Element).closest("a")) event.currentTarget.hidePopover()
      }}
    >
      {children}
    </div>
  )
}
