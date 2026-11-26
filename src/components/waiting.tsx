"use client"

import type { ReactNode } from "react"
import { useWaiting } from "@/lib/waiting"

// Wraps a <Suspense> fallback whose content comes from the API (the account page, a tour page):
// while the fallback shows, it counts as waiting, so the waiting room opens if it lasts. It
// stops counting when React swaps the fallback for the content, which unmounts it.
// data-loading-note: how the room finds a note that came with the page from the server, whose
// effect doesn't run (useNotesFromServer in src/lib/waiting.ts says why).
export function Waiting({ children }: { children: ReactNode }) {
  useWaiting(true)
  return <div data-loading-note>{children}</div>
}
