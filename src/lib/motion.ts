const STORAGE_KEY = "vantage-motion"

// Runs in <head> before the first paint (next to the theme script), so a calm page
// never starts animating and then stops.
export const motionInitScript = `try{if(localStorage.getItem("${STORAGE_KEY}")==="reduce")document.documentElement.dataset.motion="reduce"}catch(e){}`

// True when the visitor wants calm: their device setting OR the site's switch.
// The JavaScript twin of the motion-reduce: variant in globals.css.
export function prefersReducedMotion() {
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.dataset.motion === "reduce"
  )
}

// The footer's "Reduce motion" switch. Like the theme, the DOM is the source of truth:
// <html data-motion="reduce"> makes every motion-safe: class (and our few plain-CSS
// animations) stand still.
export function toggleMotion() {
  const root = document.documentElement
  const reduce = root.dataset.motion !== "reduce"
  if (reduce) root.dataset.motion = "reduce"
  else delete root.dataset.motion

  try {
    if (reduce) localStorage.setItem(STORAGE_KEY, "reduce")
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage blocked (e.g. private mode): the switch still works, it just isn't remembered
  }
}
