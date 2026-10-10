import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

// Desktop shows these inline; on phones they'll live in the menu (next step)
const NAV_LINKS = [
  { href: "/tours", label: "Tours" },
  { href: "/login", label: "Log in" },
]

// Server Component. Only the ThemeToggle inside it is a Client Component.
// A frosted pill that floats over the page (fixed), so the hero's sky shows through it.
export function Navbar() {
  return (
    <header className="fixed inset-x-3 top-3 z-50 md:inset-x-10 md:top-6">
      {/* nav-shrink (globals.css): 72px -> 60px over the first 40px of scroll */}
      <nav
        aria-label="Main"
        className="nav-shrink flex h-15 items-center justify-between rounded-2xl border-2 border-nav-border bg-nav pr-1.5 pl-3.5 shadow-md backdrop-blur-md md:h-18 md:rounded-3xl md:pr-4 md:pl-7"
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

        <div className="flex items-center gap-1 md:gap-6.5">
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
              Hidden below 360px to make room (the menu will have it too). */}
          <ThemeToggle
            labelLight="Switch to dark mode"
            labelDark="Switch to light mode"
            className="hidden size-11 place-items-center rounded-full transition-colors hover:bg-accent min-[360px]:grid md:border-2 md:border-outline md:bg-secondary md:text-secondary-foreground md:hover:bg-secondary-hover"
          >
            {/* Moon by day (go dark), sun by night (go light). CSS picks which one shows. */}
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="size-5.5 fill-none stroke-current stroke-[2.4] md:size-5 dark:hidden"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
            </svg>
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="hidden size-5.5 fill-none stroke-current stroke-[2.4] md:size-5 dark:block"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="4.5" />
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          </ThemeToggle>

          {/* Sticker CTA. Becomes <Button> in the hero step. Navy border in both themes. */}
          <Link
            href="/signup"
            className="rounded-xl border-[2.5px] border-navy-950 bg-cta px-3.5 py-2.5 text-[15px] leading-5 font-extrabold whitespace-nowrap text-cta-foreground shadow-pop transition-colors hover:bg-cta-hover md:px-5.5 md:py-3 md:text-base"
          >
            Sign up
          </Link>

          {/* Phones only. Does nothing yet: the menu panel is the next step. */}
          <button
            type="button"
            aria-label="Open menu"
            className="grid size-11 place-items-center rounded-full transition-colors hover:bg-accent md:hidden"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="size-6 fill-none stroke-current stroke-[2.6]"
              strokeLinecap="round"
            >
              <path d="M4 7h16M4 12h16M4 17h10" />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  )
}
