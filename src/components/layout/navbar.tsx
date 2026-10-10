import Link from "next/link"
import { ButtonLink } from "@/components/button"
import { MenuPanel } from "@/components/layout/menu-panel"
import { ThemeToggle } from "@/components/theme-toggle"

// Inline on desktop, inside the menu panel on phones
const NAV_LINKS = [
  { href: "/tours", label: "Tours" },
  { href: "/login", label: "Log in" },
]

// Server Component. Only ThemeToggle and MenuPanel inside it are Client Components.
// A frosted pill that floats over the page (fixed), so the hero's sky shows through it.
export function Navbar() {
  return (
    <header className="fixed inset-x-3 top-3 z-50 md:inset-x-10 md:top-6">
      {/* nav-shrink (globals.css): 72px -> 60px over the first 40px of scroll.
          group: lets the menu icon react to the panel being open (see below). */}
      <nav
        aria-label="Main"
        className="nav-shrink group flex h-15 items-center justify-between rounded-2xl border-2 border-nav-border bg-nav pr-1.5 pl-3.5 shadow-md backdrop-blur-md md:h-18 md:rounded-3xl md:pr-4 md:pl-7"
      >
        <Link href="/" className="flex items-center gap-2 md:gap-2.5">
          {/* Sun dot: same colors in both themes */}
          <span
            aria-hidden
            className="size-3.5 rounded-full border-3 border-navy-950 bg-sun-300 md:size-4.5"
          />
          <span className="font-display text-2xl leading-none font-bold tracking-[0.04em] uppercase md:text-3xl">
            Vantage
          </span>
        </Link>

        <div className="flex items-center gap-2 md:gap-6.5">
          <ul className="hidden items-center gap-6.5 font-semibold md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Plain icon on phones, a bordered circle on desktop.
              Hidden below 360px to make room (the menu panel has one too). */}
          <ThemeToggle
            labelLight="Switch to dark mode"
            labelDark="Switch to light mode"
            className="hidden size-11 place-items-center rounded-full transition-colors hover:bg-accent min-[360px]:grid md:border-2 md:border-outline md:bg-secondary md:text-secondary-foreground md:hover:bg-secondary-hover"
          >
            {/* Moon by day (go dark), sun by night (go light). CSS picks which one shows. */}
            <MoonIcon className="size-5.5 md:size-5 dark:hidden" />
            <SunIcon className="hidden size-5.5 md:size-5 dark:block" />
          </ThemeToggle>

          <ButtonLink href="/signup" size="sm">
            Sign up
          </ButtonLink>

          {/* Phones only. popoverTarget opens/closes the panel with no JavaScript,
              and the browser tells screen readers whether it's expanded. */}
          <button
            type="button"
            popoverTarget="mobile-menu"
            aria-label="Menu"
            className="grid size-11 place-items-center rounded-full transition-colors hover:bg-accent md:hidden"
          >
            {/* Hamburger while closed, ✕ while open: the nav "has" an open popover */}
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="size-6 fill-none stroke-current stroke-[2.6] group-has-[:popover-open]:hidden"
              strokeLinecap="round"
            >
              <path d="M4 7h16M4 12h16M4 17h10" />
            </svg>
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="hidden size-6 fill-none stroke-current stroke-[2.6] group-has-[:popover-open]:block"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          {/* Drops in under the pill. starting: is where the open animation starts from.
              No display class on the panel itself: it would override the browser's
              "hidden while closed" rule and keep the panel always visible. */}
          <MenuPanel
            id="mobile-menu"
            className="inset-x-3 top-20 bottom-auto w-auto origin-top-right rounded-2xl border-2 border-nav-border bg-background p-2 text-foreground shadow-lg transition duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none md:hidden starting:-translate-y-2 starting:scale-95 starting:opacity-0"
          >
            <ul>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center justify-between rounded-xl px-4 py-3 font-display text-3xl font-bold tracking-tight uppercase transition-colors hover:bg-accent"
                  >
                    {link.label}
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      className="size-6 fill-none stroke-current stroke-[2.6]"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>

            <hr className="mx-4 my-2 border-t-2 border-dashed border-dash" />

            <ThemeToggle
              labelLight="Switch to dark mode"
              labelDark="Switch to light mode"
              className="flex w-full items-center rounded-xl px-4 py-3 font-semibold transition-colors hover:bg-accent"
            >
              {/* Visible text for sighted users. Screen readers already hear the full label. */}
              <span aria-hidden className="flex items-center gap-3 dark:hidden">
                <MoonIcon className="size-5.5" /> Dark mode
              </span>
              <span aria-hidden className="hidden items-center gap-3 dark:flex">
                <SunIcon className="size-5.5" /> Light mode
              </span>
            </ThemeToggle>

            {/* w-fit: a tilted full-width box pokes out of the panel (and adds a scrollbar)
                on wider screens. Only as wide as the text, the tilt stays tiny. */}
            <p className="w-fit -rotate-2 px-4 pt-1 pb-2 font-hand text-2xl text-primary">
              where to next?
            </p>
          </MenuPanel>
        </div>
      </nav>
    </header>
  )
}

function MoonIcon({ className }: { className: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={`fill-none stroke-current stroke-[2.4] ${className}`}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
    </svg>
  )
}

function SunIcon({ className }: { className: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={`fill-none stroke-current stroke-[2.4] ${className}`}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}
