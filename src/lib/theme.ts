export type Theme = "light" | "dark"

const STORAGE_KEY = "vantage-theme"

// Runs in <head> before the page paints, so a saved dark theme never flashes light first.
// Light is the default, so only "dark" needs applying.
export const themeInitScript = `try{if(localStorage.getItem("${STORAGE_KEY}")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Storage blocked (e.g. private mode): the theme still switches, it just isn't remembered
  }
}

// The one function behind every theme switch: nav button, hero sun, footer link.
// `origin` is where the "sunset wipe" circle starts (the button's center).
export function toggleTheme(origin?: { x: number; y: number }) {
  const next: Theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark"
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  if (!("startViewTransition" in document) || reduceMotion || !origin) {
    applyTheme(next)
    return
  }

  // View Transitions: the browser screenshots the page, we switch the theme,
  // then we reveal the new theme as a circle growing out of the button
  const transition = document.startViewTransition(() => applyTheme(next))
  const { x, y } = origin
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))

  transition.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 700, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" },
    )
  })
}
