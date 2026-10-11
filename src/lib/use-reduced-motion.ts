import { useSyncExternalStore } from "react"
import { prefersReducedMotion } from "@/lib/motion"

// Calls onChange whenever either source of "reduce motion" flips: the device setting,
// or the footer switch (data-motion on <html>). Returns the "stop listening" function.
function subscribe(onChange: () => void) {
  const device = window.matchMedia("(prefers-reduced-motion: reduce)")
  device.addEventListener("change", onChange)
  const footerSwitch = new MutationObserver(onChange)
  footerSwitch.observe(document.documentElement, { attributeFilter: ["data-motion"] })
  return () => {
    device.removeEventListener("change", onChange)
    footerSwitch.disconnect()
  }
}

// The React twin of prefersReducedMotion(): same answer, but the component re-renders
// when it changes. The server can't ask the device, so it assumes calm (true).
// Lives apart from motion.ts because the root layout (a Server Component) imports that.
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => true)
}
