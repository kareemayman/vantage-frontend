import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

const NAV_LINKS = [{ href: "/tours", label: "Tours" }]

// Server Component. Only the ThemeToggle inside it is a Client Component.
export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6"
      >
        <Link href="/" className="flex items-center gap-2">
          <span aria-hidden className="size-3 rounded-full bg-cta" />
          <span className="font-display text-2xl font-bold tracking-tight uppercase">Vantage</span>
        </Link>

        {/* Hidden on phones until the mobile menu exists */}
        <ul className="hidden items-center gap-6 text-sm font-semibold sm:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="transition-colors hover:text-primary">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 text-sm font-semibold whitespace-nowrap">
          <Link
            href="/login"
            className="rounded-xl px-3 py-2 transition-colors hover:bg-accent sm:px-4"
          >
            Log in
          </Link>
          <ThemeToggle
            labelLight="Switch to dark mode"
            labelDark="Switch to light mode"
            className="grid size-11 place-items-center rounded-full border-2 border-outline bg-secondary text-secondary-foreground"
          >
            {/* Moon by day (go dark), sun by night (go light). CSS picks which one shows. */}
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="size-5 fill-none stroke-current stroke-[2.4] dark:hidden"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
            </svg>
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="hidden size-5 fill-none stroke-current stroke-[2.4] dark:block"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="4.5" />
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          </ThemeToggle>
          <Link
            href="/signup"
            className="rounded-xl bg-cta px-3 py-2 text-cta-foreground transition-colors hover:bg-cta-hover sm:px-4"
          >
            Sign up
          </Link>
        </div>
      </nav>
    </header>
  )
}
